const LogService = require('@services/audit.service');

const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);

  LogService.logAction(
    req.user?.userId || null,
    'ERROR',
    req.originalUrl,
    'ERROR',
    req.ip,
    req.get('user-agent'),
    { message: err.message, stack: process.env.NODE_ENV === 'production' ? undefined : err.stack }
  );

  // Erro de validação
  if (err.code === 'VALIDATION_ERROR') {
    return res.status(400).json({ code: err.code, message: err.message });
  }

  // Erro de não encontrado
  if (err.code === 'NOT_FOUND') {
    return res.status(404).json({ code: err.code, message: err.message });
  }

  // Erro de banco de dados
  if (err.code === 'DB_ERROR') {
    return res.status(500).json({ code: err.code, message: 'Erro no servidor' });
  }

  // Erro padrão
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' });
};

module.exports = errorHandler;
