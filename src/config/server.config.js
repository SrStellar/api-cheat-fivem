/**
 * Configuração do Servidor
 * Define porta, host e outras configurações básicas
 */

module.exports = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: '24h',
  
  // Database
  dbPath: process.env.DB_PATH || './data/auth.db',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  logRetentionDays: parseInt(process.env.LOG_RETENTION_DAYS) || 90,
  
  // Security
  enableHttps: process.env.ENABLE_HTTPS === 'true',
  enableHelmet: process.env.ENABLE_HELMET !== 'false'
};
