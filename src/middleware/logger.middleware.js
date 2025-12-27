const LogService = require('@services/audit.service');

const loggerMiddleware = (req, res, next) => {
  // Armazenar IP
  req.ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
           req.socket?.remoteAddress || 
           req.connection?.remoteAddress || 
           '127.0.0.1';

  next();
};

module.exports = loggerMiddleware;
