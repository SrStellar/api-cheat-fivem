const LogService = require('@services/audit.service');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    LogService.logAction(null, 'AUTH_FAILED', 'middleware', 'MISSING_TOKEN', req.ip, req.get('user-agent'));
    return res.status(401).json({ code: 'MISSING_TOKEN', message: 'Token não fornecido' });
  }

  const KeyGenerator = require('@utils/key-generator');
  const payload = KeyGenerator.verifyToken(token);

  if (!payload) {
    LogService.logAction(null, 'AUTH_FAILED', 'middleware', 'INVALID_TOKEN', req.ip, req.get('user-agent'));
    return res.status(403).json({ code: 'INVALID_TOKEN', message: 'Token inválido ou expirado' });
  }

  req.user = payload;
  next();
};

module.exports = authenticateToken;
