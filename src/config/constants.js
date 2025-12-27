/**
 * Constantes da Aplicação
 * Valores constantes usados em todo o projeto
 */

module.exports = {
  // Versão
  VERSION: '1.0.0',
  
  // Códigos de Status
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },
  
  // Roles
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest'
  },
  
  // Status
  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    DELETED: 'deleted'
  },
  
  // Limites
  LIMITS: {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME_MS: 15 * 60 * 1000,
    PASSWORD_MIN_LENGTH: 12,
    PASSWORD_MAX_LENGTH: 128,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 32,
    EMAIL_MAX_LENGTH: 255,
    API_KEY_MIN_LENGTH: 40,
    DEVICE_ID_MIN_LENGTH: 16
  },
  
  // Expirações
  EXPIRATION: {
    TOKEN: 24 * 60 * 60, // 24 horas em segundos
    REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 dias
    SESSION: 24 * 60 * 60 * 1000, // 24 horas em ms
    PASSWORD_RESET: 60 * 60 * 1000, // 1 hora em ms
    EMAIL_VERIFICATION: 7 * 24 * 60 * 60 * 1000 // 7 dias em ms
  },
  
  // Mensagens de Erro Padrão
  ERRORS: {
    INVALID_CREDENTIALS: 'Credenciais inválidas',
    INVALID_TOKEN: 'Token inválido ou expirado',
    UNAUTHORIZED: 'Não autorizado',
    FORBIDDEN: 'Acesso proibido',
    NOT_FOUND: 'Recurso não encontrado',
    CONFLICT: 'Recurso já existe',
    INTERNAL_ERROR: 'Erro interno do servidor',
    INVALID_INPUT: 'Entrada inválida',
    ACCOUNT_LOCKED: 'Conta bloqueada'
  }
};
