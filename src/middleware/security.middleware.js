const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

/**
 * Rate limiters avançados por tipo de requisição
 */
class SecurityLimiters {
  /**
   * Rate limiter global agressivo
   */
  static globalLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100,
      message: 'Muitas requisições deste IP',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => {
        // Health check não conta
        return req.path === '/health';
      },
      handler: (req, res) => {
        res.status(429).json({
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Limite de requisições atingido. Tente novamente em 15 minutos.',
          retryAfter: 900
        });
      }
    });
  }

  /**
   * Rate limiter para autenticação - MUITO agressivo
   */
  static authLimiter() {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 3, // Máximo 3 tentativas
      skipSuccessfulRequests: true,
      message: 'Muitas tentativas de autenticação',
      handler: (req, res) => {
        res.status(429).json({
          code: 'AUTH_RATE_LIMIT',
          message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
          retryAfter: 900
        });
      }
    });
  }

  /**
   * Rate limiter para registro - moderado
   */
  static registerLimiter() {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 5, // Máximo 5 registros por IP por hora
      message: 'Muitas tentativas de registro',
      handler: (req, res) => {
        res.status(429).json({
          code: 'REGISTER_RATE_LIMIT',
          message: 'Muitos registros deste IP. Tente novamente em 1 hora.',
          retryAfter: 3600
        });
      }
    });
  }

  /**
   * Rate limiter para validação de chaves - MUITO restritivo
   */
  static validationLimiter() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minuto
      max: 20, // Máximo 20 validações por IP por minuto
      message: 'Muitas tentativas de validação',
      handler: (req, res) => {
        res.status(429).json({
          code: 'VALIDATION_RATE_LIMIT',
          message: 'Limite de validações atingido. Tente novamente em 1 minuto.',
          retryAfter: 60
        });
      }
    });
  }

  /**
   * Rate limiter para admin - restritivo
   */
  static adminLimiter() {
    return rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutos
      max: 50,
      message: 'Limite de requisições admin atingido',
      handler: (req, res) => {
        res.status(429).json({
          code: 'ADMIN_RATE_LIMIT',
          message: 'Limite de requisições admin atingido.',
          retryAfter: 600
        });
      }
    });
  }
}

/**
 * Middleware de segurança avançada
 */
const advancedSecurityHeaders = (req, res, next) => {
  // HSTS - Force HTTPS em produção
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:");

  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Remover headers perigosos
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Adicionar cabeçalho customizado de segurança
  res.setHeader('X-API-Version', '1.0.0');

  next();
};

/**
 * Validar content-type
 */
const validateContentType = (req, res, next) => {
  // Apenas JSON é aceito em POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        code: 'INVALID_CONTENT_TYPE',
        message: 'Content-Type deve ser application/json'
      });
    }
  }

  next();
};

/**
 * Validar tamanho de payload
 */
const validatePayloadSize = (req, res, next) => {
  const maxSize = 1024 * 100; // 100KB máximo
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Payload muito grande (máximo 100KB)'
    });
  }

  next();
};

/**
 * Validar formato de requisição
 */
const validateRequestFormat = (req, res, next) => {
  // Não aceitar parâmetros query em POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const queryParams = Object.keys(req.query);
    if (queryParams.length > 0) {
      return res.status(400).json({
        code: 'INVALID_REQUEST_FORMAT',
        message: 'Parâmetros query não são permitidos em requisições POST/PUT/PATCH'
      });
    }
  }

  next();
};

/**
 * Detectar e bloquear requisições suspeitas
 */
const detectSuspiciousActivity = (req, res, next) => {
  // Verificar SQL injection patterns
  const sqlPatterns = /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i;
  
  const bodyString = JSON.stringify(req.body).toLowerCase();
  const queryString = JSON.stringify(req.query).toLowerCase();
  const paramsString = JSON.stringify(req.params).toLowerCase();

  if (sqlPatterns.test(bodyString) || sqlPatterns.test(queryString) || sqlPatterns.test(paramsString)) {
    // Log da atividade suspeita
    console.warn('⚠️  Atividade suspeita detectada:', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({
      code: 'SUSPICIOUS_REQUEST',
      message: 'Requisição contém padrões suspeitos'
    });
  }

  // Verificar XXE patterns
  const xxePatterns = /(\<!ENTITY|SYSTEM|PUBLIC)/i;
  if (xxePatterns.test(bodyString)) {
    console.warn('⚠️  Potencial XXE detectado:', {
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    return res.status(400).json({
      code: 'SUSPICIOUS_REQUEST',
      message: 'Requisição contém padrões suspeitos'
    });
  }

  next();
};

module.exports = {
  SecurityLimiters,
  advancedSecurityHeaders,
  validateContentType,
  validatePayloadSize,
  validateRequestFormat,
  detectSuspiciousActivity
};
