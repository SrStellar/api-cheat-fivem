const express = require('express');
const router = express.Router();
const AuditService = require('@services/audit.service');
const db = require('@core/database');

/**
 * GET /api/admin/logs
 * Lista todos os logs (apenas admin)
 */
router.get('/logs', async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const logs = await AuditService.getAllLogs(parseInt(limit), parseInt(offset));

    res.json({
      code: 'LOGS_RETRIEVED',
      message: 'Logs obtidos com sucesso',
      data: logs
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/stats
 * Obtém estatísticas gerais do sistema
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await AuditService.getStats();

    res.json({
      code: 'STATS_RETRIEVED',
      message: 'Estatísticas obtidas com sucesso',
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/users
 * Lista todos os usuários
 */
router.get('/users', (req, res) => {
  db.all('SELECT id, username, email, created_at, last_login, is_active, is_admin FROM users', (err, users) => {
    if (err) return res.status(500).json({ code: 'DB_ERROR', message: err.message });
    res.json({
      code: 'USERS_RETRIEVED',
      message: 'Usuários obtidos com sucesso',
      data: users || []
    });
  });
});

/**
 * POST /api/admin/users/:userId/toggle-admin
 * Ativa/desativa privilégios de admin para um usuário
 */
router.post('/users/:userId/toggle-admin', (req, res) => {
  const { userId } = req.params;

  db.get('SELECT is_admin FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
    }

    const newStatus = !user.is_admin;
    db.run('UPDATE users SET is_admin = ? WHERE id = ?', [newStatus ? 1 : 0, userId], (err) => {
      if (err) return res.status(500).json({ code: 'DB_ERROR', message: err.message });

      AuditService.logAction(req.user.userId, 'TOGGLE_ADMIN', userId, 'SUCCESS', req.ip, req.get('user-agent'), { newStatus });

      res.json({
        code: 'ADMIN_STATUS_UPDATED',
        message: `Privilégios de admin ${newStatus ? 'concedidos' : 'removidos'}`,
        data: { userId, isAdmin: newStatus }
      });
    });
  });
});

/**
 * POST /api/admin/users/:userId/deactivate
 * Desativa um usuário
 */
router.post('/users/:userId/deactivate', (req, res) => {
  const { userId } = req.params;

  db.run('UPDATE users SET is_active = 0 WHERE id = ?', [userId], function (err) {
    if (err) return res.status(500).json({ code: 'DB_ERROR', message: err.message });
    if (this.changes === 0) return res.status(404).json({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });

    AuditService.logAction(req.user.userId, 'DEACTIVATE_USER', userId, 'SUCCESS', req.ip, req.get('user-agent'));

    res.json({
      code: 'USER_DEACTIVATED',
      message: 'Usuário desativado com sucesso',
      data: { userId }
    });
  });
});

/**
 * POST /api/admin/users/:userId/activate
 * Ativa um usuário
 */
router.post('/users/:userId/activate', (req, res) => {
  const { userId } = req.params;

  db.run('UPDATE users SET is_active = 1 WHERE id = ?', [userId], function (err) {
    if (err) return res.status(500).json({ code: 'DB_ERROR', message: err.message });
    if (this.changes === 0) return res.status(404).json({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });

    AuditService.logAction(req.user.userId, 'ACTIVATE_USER', userId, 'SUCCESS', req.ip, req.get('user-agent'));

    res.json({
      code: 'USER_ACTIVATED',
      message: 'Usuário ativado com sucesso',
      data: { userId }
    });
  });
});

module.exports = router;
