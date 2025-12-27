/**
 * Configuração centralizada de segurança
 * Define todos os parâmetros de segurança do sistema
 */

const SECURITY_CONFIG = {
  // ===== VALIDAÇÃO =====
  validation: {
    // Username
    username: {
      minLength: 3,
      maxLength: 32,
      pattern: /^[a-zA-Z0-9_-]+$/, // Apenas alfanumérico, underscore e hífen
      errorMsg: 'Username deve ter 3-32 caracteres, apenas letras, números, _ e -'
    },

    // Email
    email: {
      maxLength: 255,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMsg: 'Email inválido'
    },

    // Senha
    password: {
      minLength: 12,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      forbiddenSequences: ['123', '234', '345', '456', '567', '678', '789', '890', 'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz'],
      errorMsg: 'Senha deve ter 12+ caracteres, com maiúsculas, minúsculas, números e símbolos'
    },

    // API Key
    apiKey: {
      minLength: 40,
      maxLength: 256,
      pattern: /^[A-Za-z0-9_-]+$/,
      errorMsg: 'Chave de API inválida'
    },

    // Product ID
    productId: {
      minLength: 1,
      maxLength: 128,
      pattern: /^[a-zA-Z0-9._-]+$/,
      errorMsg: 'Product ID inválido'
    },

    // License Key
    licenseKey: {
      minLength: 20,
      maxLength: 256,
      pattern: /^[A-Za-z0-9_-]+$/,
      errorMsg: 'Chave de licença inválida'
    },

    // Device ID
    deviceId: {
      minLength: 16,
      maxLength: 256,
      pattern: /^[A-Za-z0-9_-]+$/,
      errorMsg: 'Device ID inválido'
    },

    // HWID (Hardware ID)
    hwid: {
      minLength: 16,
      maxLength: 256,
      pattern: /^[A-Fa-f0-9_-]+$/,
      errorMsg: 'HWID inválido'
    },

    // IP Address
    ipAddress: {
      pattern: /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/,
      errorMsg: 'Endereço IP inválido'
    },

    // User Agent
    userAgent: {
      maxLength: 512,
      forbiddenPatterns: ['script', '<', '>', 'eval', 'onclick'],
      errorMsg: 'User Agent inválido'
    }
  },

  // ===== HASHING E CRIPTOGRAFIA =====
  crypto: {
    bcryptRounds: 12, // Número de rounds para bcrypt (quanto maior, mais seguro mas mais lento)
    tokenExpiration: 86400, // 24 horas em segundos
    refreshTokenExpiration: 604800, // 7 dias em segundos
    sessionExpiration: 86400, // 24 horas em segundos
    encryptionAlgorithm: 'aes-256-gcm', // Algoritmo de criptografia
    tokenLength: 32 // Tamanho do token em bytes
  },

  // ===== RATE LIMITING =====
  rateLimiting: {
    // Global - aplicado a todas as requisições
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // 100 requisições por janela
      message: 'Muitas requisições, tente novamente mais tarde',
      standardHeaders: true,
      legacyHeaders: false
    },

    // Autenticação - muito agressivo
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 3, // 3 tentativas por janela
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      message: 'Muitas tentativas de login, tente novamente em 15 minutos'
    },

    // Registro - agressivo
    register: {
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 5, // 5 registros por hora
      skipSuccessfulRequests: true,
      message: 'Muitas tentativas de registro, tente novamente em 1 hora'
    },

    // Validação - moderado
    validation: {
      windowMs: 60 * 1000, // 1 minuto
      max: 20, // 20 requisições por minuto
      message: 'Muitas requisições de validação'
    },

    // Admin - moderado
    admin: {
      windowMs: 10 * 60 * 1000, // 10 minutos
      max: 50, // 50 requisições por 10 minutos
      message: 'Limite de requisições administrativas excedido'
    }
  },

  // ===== LIMITAÇÕES DE REQUISIÇÃO =====
  requestLimits: {
    maxJsonSize: '100kb', // Tamanho máximo de payload JSON
    maxUrlEncodedSize: '100kb', // Tamanho máximo de form data
    maxHeaderSize: 16384, // Bytes
    bodyParserLimit: '100kb'
  },

  // ===== LOGIN E CONTA =====
  account: {
    maxLoginAttempts: 5, // Máximo de tentativas de login antes de bloquear
    lockoutTimeMs: 15 * 60 * 1000, // 15 minutos de lockout
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    passwordResetTimeout: 3600000, // 1 hora
    emailVerificationTimeout: 7 * 24 * 60 * 60 * 1000 // 7 dias
  },

  // ===== ATIVAÇÕES E LICENÇAS =====
  licensing: {
    maxActivationsPerLicense: 3, // Máximo de dispositivos por licença
    activationTimeout: 30 * 24 * 60 * 60 * 1000, // 30 dias (não usado por padrão)
    hardwareLockingEnabled: true, // Vincular licença ao HWID
    ipWhitelistingEnabled: true // Permitir whitelist de IP
  },

  // ===== HEADERS DE SEGURANÇA =====
  securityHeaders: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload', // HSTS - 1 ano
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'",
    'X-Content-Type-Options': 'nosniff', // Previne mime sniffing
    'X-Frame-Options': 'DENY', // Previne clickjacking
    'X-XSS-Protection': '1; mode=block', // Proteção contra XSS (Legacy)
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'X-Permitted-Cross-Domain-Policies': 'none'
  },

  // ===== DETECÇÃO DE ATAQUE =====
  attackDetection: {
    // SQL Injection patterns
    sqlInjectionPatterns: [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|WHERE)\b)/gi,
      /(-{2}|;|\/\*|\*\/)/,
      /(\bOR\b.*=.*)/gi,
      /(\bAND\b.*=.*)/gi
    ],

    // XXE patterns
    xxePatterns: [
      /<!ENTITY/gi,
      /SYSTEM/gi,
      /PUBLIC/gi
    ],

    // XSS patterns
    xssPatterns: [
      /<script[\s\S]*?<\/script>/gi,
      /on\w+\s*=/gi,
      /javascript:/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ],

    // LDAP Injection patterns
    ldapPatterns: [
      /[*()\\]/
    ],

    enableDetection: true,
    logSuspiciousActivity: true
  },

  // ===== LOGGING =====
  logging: {
    enableAuditLog: true,
    logFailedLogins: true,
    logSuspiciousActivity: true,
    logApiKeyUsage: false, // Pode ser verboso
    retentionDays: 90, // Manter logs por 90 dias
    sensitiveFieldsToMask: [
      'password',
      'password_hash',
      'secret',
      'token',
      'api_key',
      'hwid',
      'device_id'
    ]
  },

  // ===== CORS =====
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600 // 1 hora
  },

  // ===== VALIDAÇÕES DE NEGÓCIO =====
  business: {
    passwordExpirationDays: 90, // Forçar mudança de senha a cada 90 dias
    minPasswordChangeIntervalDays: 1, // Não pode mudar senha 2 vezes no mesmo dia
    twoFactorAuthenticationEnabled: false, // Pode ser ativado depois
    ipGeolocationCheckEnabled: false // Pode ser ativado depois
  }
};

module.exports = SECURITY_CONFIG;
