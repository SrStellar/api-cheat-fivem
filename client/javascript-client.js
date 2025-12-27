/**
 * Cliente JavaScript para KeyAuth
 * Uso: const client = new KeyAuthClient('http://localhost:3000', 'sua_chave_api');
 */
class KeyAuthClient {
  constructor(baseUrl = 'http://localhost:3000', apiKey = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.token = null;
  }

  /**
   * Faz uma requisição HTTP
   */
  async request(method, endpoint, body = null, useApiKey = false) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };

    if (useApiKey && this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error(`Erro em ${method} ${endpoint}:`, error.message);
      throw error;
    }
  }

  /**
   * Registra um novo usuário
   */
  async register(username, email, password, confirmPassword) {
    const response = await this.request('POST', '/api/auth/register', {
      username,
      email,
      password,
      confirmPassword
    });
    return response.data;
  }

  /**
   * Faz login
   */
  async login(username, password) {
    const response = await this.request('POST', '/api/auth/login', {
      username,
      password
    });
    this.token = response.data.token;
    return response.data;
  }

  /**
   * Renova o token
   */
  async refreshToken() {
    const response = await this.request('POST', '/api/auth/refresh');
    this.token = response.data.token;
    return response.data;
  }

  /**
   * Valida uma chave de API
   */
  async validateApiKey(key) {
    return await this.request('POST', '/api/validate/key', {
      key,
      type: 'api'
    });
  }

  /**
   * Valida uma licença
   */
  async validateLicense(licenseKey, deviceId = null, hwid = null) {
    return await this.request('POST', '/api/validate/key', {
      key: licenseKey,
      type: 'license',
      deviceId,
      hwid
    });
  }

  /**
   * Cria uma nova chave de API
   */
  async createApiKey(name, description = '', expiresIn = null) {
    const response = await this.request('POST', '/api/keys/create', {
      name,
      description,
      expiresIn
    });
    return response.data;
  }

  /**
   * Lista chaves de API
   */
  async listApiKeys() {
    const response = await this.request('GET', '/api/keys/list');
    return response.data;
  }

  /**
   * Desativa uma chave de API
   */
  async deactivateApiKey(keyId) {
    const response = await this.request('POST', `/api/keys/${keyId}/deactivate`);
    return response.data;
  }

  /**
   * Obtém estatísticas de uma chave
   */
  async getApiKeyStats(keyId) {
    const response = await this.request('GET', `/api/keys/${keyId}/stats`);
    return response.data;
  }

  /**
   * Cria uma nova licença
   */
  async createLicense(productId, maxActivations = 1, expiresIn = null) {
    const response = await this.request('POST', '/api/licenses/create', {
      productId,
      maxActivations,
      expiresIn
    });
    return response.data;
  }

  /**
   * Lista licenças
   */
  async listLicenses() {
    const response = await this.request('GET', '/api/licenses/list');
    return response.data;
  }

  /**
   * Desativa uma licença
   */
  async deactivateLicense(licenseId) {
    const response = await this.request('POST', `/api/licenses/${licenseId}/deactivate`);
    return response.data;
  }

  /**
   * Obtém estatísticas de uma licença
   */
  async getLicenseStats(licenseId) {
    const response = await this.request('GET', `/api/licenses/${licenseId}/stats`);
    return response.data;
  }

  /**
   * Revoga uma ativação de licença
   */
  async revokeActivation(licenseId, activationId) {
    const response = await this.request('POST', `/api/licenses/${licenseId}/activations/${activationId}/revoke`);
    return response.data;
  }
}

// Exportar para Node.js e navegadores
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KeyAuthClient;
}
