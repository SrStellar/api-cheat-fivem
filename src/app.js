/**
 * 🚀 Aplicação Express Principal
 * Configura middlewares, rotas e segurança
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

// Configuração
const SECURITY_CONFIG = require('@config/security.config');
const serverConfig = require('@config/server.config');
const { SecurityLimiters } = require('@middleware/security.middleware');

// Middlewares
const authMiddleware = require('@middleware/auth.middleware');
const roleMiddleware = require('@middleware/role.middleware');
const errorMiddleware = require('@middleware/error.middleware');
const loggerMiddleware = require('@middleware/logger.middleware');

// Middlewares de Segurança Avançada
const {
  advancedSecurityHeaders,
  validateContentType,
  validatePayloadSize,
  validateRequestFormat,
  detectSuspiciousActivity
} = require('@middleware/security.middleware');

// Rotas
const authRoutes = require('@routes/auth.routes');
const keyRoutes = require('@routes/keys.routes');
const licenseRoutes = require('@routes/licenses.routes');
const adminRoutes = require('@routes/admin.routes');
const validationRoutes = require('@routes/validation.routes');

const app = express();

// ===== CAMADA 1: Headers de Segurança =====
// Helmet para proteção básica + headers avançados
app.use(helmet());
app.use(advancedSecurityHeaders);

// ===== CAMADA 2: CORS =====
app.use(cors({
  origin: SECURITY_CONFIG.cors.origin,
  credentials: SECURITY_CONFIG.cors.credentials,
  methods: SECURITY_CONFIG.cors.methods,
  allowedHeaders: SECURITY_CONFIG.cors.allowedHeaders,
  exposedHeaders: SECURITY_CONFIG.cors.exposedHeaders,
  maxAge: SECURITY_CONFIG.cors.maxAge
}));

// ===== CAMADA 3: Validação de Tipo de Conteúdo =====
app.use(validateContentType);

// ===== CAMADA 4: Logging =====
const morganFormat = serverConfig.nodeEnv === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat));
app.use(loggerMiddleware);

// ===== CAMADA 5: Parser com Limites =====
app.use(express.json({
  limit: SECURITY_CONFIG.requestLimits.maxJsonSize
}));
app.use(express.urlencoded({
  limit: SECURITY_CONFIG.requestLimits.maxUrlEncodedSize,
  extended: true
}));

// ===== CAMADA 6: Validação de Tamanho =====
app.use(validatePayloadSize);

// ===== CAMADA 7: Detecção de Ataque =====
app.use(detectSuspiciousActivity);

// ===== CAMADA 8: Validação de Formato =====
app.use(validateRequestFormat);

// ===== CAMADA 9: Rate Limiting Global =====
app.use(SecurityLimiters.globalLimiter());

// ===== ROTAS PÚBLICAS =====

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: serverConfig.nodeEnv
  });
});

// Status
app.get('/api/status', (req, res) => {
  res.json({
    version: require('../package.json').version,
    securityLevel: 'MAXIMUM',
    timestamp: new Date().toISOString()
  });
});

// ===== AUTENTICAÇÃO (Rate limiting agressivo) =====
app.use('/api/auth', SecurityLimiters.authLimiter(), authRoutes);

// ===== VALIDAÇÃO (Rate limiting moderado) =====
app.use('/api/validate', SecurityLimiters.validationLimiter(), validationRoutes);

// ===== ROTAS PROTEGIDAS =====

// Chaves de API
app.use('/api/keys', authMiddleware, keyRoutes);

// Licenças
app.use('/api/licenses', authMiddleware, licenseRoutes);

// Admin (com rate limiting extra)
app.use('/api/admin',
  authMiddleware,
  roleMiddleware,
  SecurityLimiters.adminLimiter(),
  adminRoutes
);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'Rota não encontrada'
  });
});

// ===== ERROR HANDLER (Último middleware) =====
app.use(errorMiddleware);



module.exports = app;


