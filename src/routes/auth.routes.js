const express = require('express');
const router = express.Router();
const AuthService = require('@services/auth.service');
const AuditService = require('@services/audit.service');

/**
 * POST /api/auth/register
 * Registra um novo usuário
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validação de campos obrigatórios
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ code: 'MISSING_FIELDS', message: 'Todos os campos são obrigatórios' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ code: 'PASSWORD_MISMATCH', message: 'Senhas não correspondem' });
    }

    // AuthService faz validações rigorosas com Validator.js
    const user = await AuthService.register(username, email, password);

    AuditService.logAction(user.userId, 'REGISTER', 'user', 'SUCCESS', req.ip, req.get('user-agent'));

    res.status(201).json({
      code: 'REGISTRATION_SUCCESS',
      message: 'Usuário registrado com sucesso',
      data: user
    });
  } catch (error) {
    AuditService.logAction(null, 'REGISTER', 'user', 'FAILED', req.ip, req.get('user-agent'), { error: error.message });
    
    // Erros de validação
    if (error.code === 'INVALID_USERNAME' || error.code === 'INVALID_EMAIL' || error.code === 'WEAK_PASSWORD') {
      return res.status(400).json({ code: error.code, message: error.message });
    }
    
    if (error.code === 'DUPLICATE_USER') {
      return res.status(400).json({ code: error.code, message: error.message });
    }

    next(error);
  }
});

/**
 * POST /api/auth/login
 * Autentica um usuário e retorna token JWT
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ code: 'MISSING_CREDENTIALS', message: 'Usuário e senha são obrigatórios' });
    }

    const result = await AuthService.login(username, password);

    AuditService.logAction(result.userId, 'LOGIN', 'user', 'SUCCESS', req.ip, req.get('user-agent'));

    res.json({
      code: 'LOGIN_SUCCESS',
      message: 'Login realizado com sucesso',
      data: result
    });
  } catch (error) {
    AuditService.logAction(null, 'LOGIN', 'user', 'FAILED', req.ip, req.get('user-agent'), { username: req.body.username });

    if (error.code === 'INVALID_CREDENTIALS' || error.code === 'ACCOUNT_LOCKED') {
      return res.status(401).json({ code: error.code, message: error.message });
    }

    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Renova o token JWT
 */
router.post('/refresh', (req, res) => {
  const KeyGenerator = require('@utils/key-generator');
  
  if (!req.user) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Não autenticado' });
  }

  const token = KeyGenerator.generateToken(
    { userId: req.user.userId, username: req.user.username, email: req.user.email },
    86400
  );

  AuditService.logAction(req.user.userId, 'TOKEN_REFRESH', 'auth', 'SUCCESS', req.ip, req.get('user-agent'));

  res.json({
    code: 'REFRESH_SUCCESS',
    message: 'Token renovado com sucesso',
    data: { token, expiresIn: 86400 }
  });
});

module.exports = router;
