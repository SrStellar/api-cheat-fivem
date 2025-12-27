const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

class KeyGenerator {
  /**
   * Gera uma chave de API segura
   * @param {string} userId - ID do usuário
   * @param {string} prefix - Prefixo da chave (ex: KA)
   * @returns {object} {key, hash}
   */
  static generateApiKey(userId, prefix = process.env.API_KEY_PREFIX || 'KA') {
    const timestamp = Date.now().toString(36);
    const randomPart = crypto.randomBytes(16).toString('hex');
    const checksum = crypto.randomBytes(4).toString('hex');
    
    const key = `${prefix}_${timestamp}_${randomPart}_${checksum}`;
    const hash = this.hashKey(key);
    
    return { key, hash };
  }

  /**
   * Gera uma chave de licença
   * @returns {string} Chave de licença
   */
  static generateLicenseKey() {
    const parts = [];
    for (let i = 0; i < 4; i++) {
      parts.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return parts.join('-');
  }

  /**
   * Hash de uma chave usando SHA-256
   * @param {string} key - Chave a fazer hash
   * @returns {string} Hash da chave
   */
  static hashKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Gera um ID único
   * @returns {string} UUID v4
   */
  static generateId() {
    return uuidv4();
  }

  /**
   * Gera um HWID (Hardware ID) hash
   * @param {string} hwInfo - Informações de hardware
   * @returns {string} HWID hash
   */
  static generateHWID(hwInfo) {
    return crypto.createHash('sha256').update(hwInfo).digest('hex');
  }

  /**
   * Valida o formato de uma chave de API
   * @param {string} key - Chave a validar
   * @returns {boolean}
   */
  static validateKeyFormat(key) {
    const prefix = process.env.API_KEY_PREFIX || 'KA';
    const pattern = new RegExp(`^${prefix}_[a-z0-9]+_[a-f0-9]+_[a-f0-9]+$`);
    return pattern.test(key);
  }

  /**
   * Gera um token JWT customizado
   * @param {object} payload - Dados do token
   * @param {number} expiresIn - Tempo de expiração em segundos
   * @returns {string} Token JWT
   */
  static generateToken(payload, expiresIn = 3600) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  /**
   * Verifica um token JWT
   * @param {string} token - Token a verificar
   * @returns {object|null} Payload do token ou null se inválido
   */
  static verifyToken(token) {
    try {
      const jwt = require('jsonwebtoken');
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Criptografa dados usando AES
   * @param {string} data - Dados a criptografar
   * @param {string} key - Chave de criptografia
   * @returns {string} Dados criptografados
   */
  static encryptData(data, key = process.env.JWT_SECRET) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }

  /**
   * Descriptografa dados usando AES
   * @param {string} encryptedData - Dados criptografados
   * @param {string} key - Chave de descriptografia
   * @returns {object|null} Dados descriptografados ou null
   */
  static decryptData(encryptedData, key = process.env.JWT_SECRET) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      return null;
    }
  }
}

module.exports = KeyGenerator;
