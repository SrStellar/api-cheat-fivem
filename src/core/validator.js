const crypto = require('crypto');

/**
 * Validador profissional com regras rigorosas
 * Implementa OWASP standards
 */
class Validator {
  // Constantes de validação
  static RULES = {
    username: {
      minLength: 3,
      maxLength: 32,
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: 'Usuário deve conter apenas letras, números, underscore e hífen'
    },
    email: {
      maxLength: 254,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Email inválido'
    },
    password: {
      minLength: 12,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
      message: 'Senha deve ter: min 12 caracteres, maiúscula, minúscula, número e símbolo especial'
    },
    productId: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: 'ID do produto inválido'
    },
    keyName: {
      minLength: 3,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s_-]+$/,
      message: 'Nome da chave inválido'
    },
    deviceId: {
      minLength: 5,
      maxLength: 255,
      pattern: /^[a-zA-Z0-9_\-\.]+$/,
      message: 'Device ID inválido'
    }
  };

  /**
   * Valida username
   */
  static validateUsername(username) {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username é obrigatório' };
    }

    const trimmed = username.trim();
    const rules = this.RULES.username;

    if (trimmed.length < rules.minLength || trimmed.length > rules.maxLength) {
      return { valid: false, error: `Username deve ter entre ${rules.minLength} e ${rules.maxLength} caracteres` };
    }

    if (!rules.pattern.test(trimmed)) {
      return { valid: false, error: rules.message };
    }

    // Verificar se não é apenas números
    if (/^\d+$/.test(trimmed)) {
      return { valid: false, error: 'Username não pode conter apenas números' };
    }

    return { valid: true, value: trimmed };
  }

  /**
   * Valida email com rigor
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email é obrigatório' };
    }

    const trimmed = email.toLowerCase().trim();
    const rules = this.RULES.email;

    if (trimmed.length > rules.maxLength) {
      return { valid: false, error: 'Email muito longo' };
    }

    if (!rules.pattern.test(trimmed)) {
      return { valid: false, error: rules.message };
    }

    // Validar partes do email
    const [localPart, domain] = trimmed.split('@');
    
    if (localPart.length > 64 || localPart.startsWith('.') || localPart.endsWith('.')) {
      return { valid: false, error: 'Email inválido' };
    }

    if (domain.length > 255 || !domain.includes('.')) {
      return { valid: false, error: 'Domain inválido' };
    }

    return { valid: true, value: trimmed };
  }

  /**
   * Valida senha com requisitos fortes
   */
  static validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { valid: false, error: 'Senha é obrigatória' };
    }

    const rules = this.RULES.password;

    if (password.length < rules.minLength || password.length > rules.maxLength) {
      return { valid: false, error: `Senha deve ter entre ${rules.minLength} e ${rules.maxLength} caracteres` };
    }

    const checks = {
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    if (!checks.uppercase || !checks.lowercase || !checks.number || !checks.special) {
      return { valid: false, error: rules.message };
    }

    // Verificar padrões comuns (123456, qwerty, etc)
    if (this.isCommonPassword(password)) {
      return { valid: false, error: 'Senha muito comum' };
    }

    // Verificar sequências
    if (this.hasSequence(password)) {
      return { valid: false, error: 'Senha não pode ter sequências' };
    }

    return { valid: true };
  }

  /**
   * Valida IDs de produto
   */
  static validateProductId(productId) {
    if (!productId || typeof productId !== 'string') {
      return { valid: false, error: 'ID do produto é obrigatório' };
    }

    const trimmed = productId.trim();
    const rules = this.RULES.productId;

    if (trimmed.length < rules.minLength || trimmed.length > rules.maxLength) {
      return { valid: false, error: `ID do produto deve ter entre ${rules.minLength} e ${rules.maxLength} caracteres` };
    }

    if (!rules.pattern.test(trimmed)) {
      return { valid: false, error: rules.message };
    }

    return { valid: true, value: trimmed };
  }

  /**
   * Valida nome de chave
   */
  static validateKeyName(name) {
    if (!name || typeof name !== 'string') {
      return { valid: false, error: 'Nome da chave é obrigatório' };
    }

    const trimmed = name.trim();
    const rules = this.RULES.keyName;

    if (trimmed.length < rules.minLength || trimmed.length > rules.maxLength) {
      return { valid: false, error: `Nome deve ter entre ${rules.minLength} e ${rules.maxLength} caracteres` };
    }

    if (!rules.pattern.test(trimmed)) {
      return { valid: false, error: rules.message };
    }

    return { valid: true, value: trimmed };
  }

  /**
   * Valida Device ID
   */
  static validateDeviceId(deviceId) {
    if (!deviceId || typeof deviceId !== 'string') {
      return { valid: false, error: 'Device ID é obrigatório' };
    }

    const trimmed = deviceId.trim();
    const rules = this.RULES.deviceId;

    if (trimmed.length < rules.minLength || trimmed.length > rules.maxLength) {
      return { valid: false, error: `Device ID deve ter entre ${rules.minLength} e ${rules.maxLength} caracteres` };
    }

    if (!rules.pattern.test(trimmed)) {
      return { valid: false, error: rules.message };
    }

    return { valid: true, value: trimmed };
  }

  /**
   * Valida IP address
   */
  static validateIP(ip) {
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})$/;
    
    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
  }

  /**
   * Verifica se é senha comum
   */
  static isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', 'qwerty', 'abc123', 'letmein',
      'welcome', 'monkey', '1234567890', 'dragon', 'master'
    ];

    return commonPasswords.some(common => 
      password.toLowerCase().includes(common)
    );
  }

  /**
   * Verifica sequências na senha
   */
  static hasSequence(password) {
    // Verificar sequências numéricas
    if (/0123|1234|2345|3456|4567|5678|6789/.test(password)) {
      return true;
    }

    // Verificar sequências alfabéticas
    if (/abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz/.test(password.toLowerCase())) {
      return true;
    }

    return false;
  }

  /**
   * Sanitiza string para prevenir XSS
   */
  static sanitizeString(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Valida HWID
   */
  static validateHWID(hwid) {
    if (!hwid || typeof hwid !== 'string') {
      return { valid: false, error: 'HWID é obrigatório' };
    }

    const trimmed = hwid.trim();

    // Deve ser hash hexadecimal (64 caracteres para SHA-256)
    if (!/^[a-fA-F0-9]{64}$/.test(trimmed) && !/^[a-fA-F0-9]{40}$/.test(trimmed)) {
      return { valid: false, error: 'HWID inválido' };
    }

    return { valid: true, value: trimmed };
  }

  /**
   * Valida expiração
   */
  static validateExpiration(expiresIn) {
    if (!expiresIn) {
      return { valid: true, value: null }; // Opcional
    }

    if (typeof expiresIn !== 'number' || expiresIn <= 0) {
      return { valid: false, error: 'Expiração deve ser um número positivo em ms' };
    }

    // Máximo 10 anos
    const maxExpiration = 10 * 365 * 24 * 60 * 60 * 1000;
    if (expiresIn > maxExpiration) {
      return { valid: false, error: 'Expiração muito longa' };
    }

    return { valid: true, value: expiresIn };
  }

  /**
   * Valida maxActivations
   */
  static validateMaxActivations(maxActivations) {
    if (!Number.isInteger(maxActivations)) {
      return { valid: false, error: 'Max activations deve ser um inteiro' };
    }

    if (maxActivations < 1 || maxActivations > 1000) {
      return { valid: false, error: 'Max activations deve estar entre 1 e 1000' };
    }

    return { valid: true, value: maxActivations };
  }

  /**
   * Valida User-Agent
   */
  static validateUserAgent(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') {
      return { valid: true, value: 'Unknown' };
    }

    // Limitar a 512 caracteres
    return { valid: true, value: userAgent.substring(0, 512) };
  }

  /**
   * Sanitiza objeto de requisição
   */
  static sanitizeRequest(req) {
    const sanitized = {};

    for (const [key, value] of Object.entries(req)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (value === null) {
        sanitized[key] = null;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(v => typeof v === 'string' ? this.sanitizeString(v) : v);
      }
    }

    return sanitized;
  }
}

module.exports = Validator;
