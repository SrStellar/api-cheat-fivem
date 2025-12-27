const express = require('express');
const router = express.Router();
const KeyService = require('@services/key.service');
const AuditService = require('@services/audit.service');

/**
 * POST /api/keys/create
 * Cria uma nova chave de API
 */
router.post('/create', async (req, res, next) => {
  try {
    const { name, description, expiresIn } = req.body;
    const userId = req.user.userId;

    if (!name || name.length < 3) {
      return res.status(400).json({ code: 'INVALID_NAME', message: 'Nome deve ter pelo menos 3 caracteres' });
    }

    const key = await KeyService.createApiKey(userId, name, description, expiresIn);

    AuditService.logAction(userId, 'CREATE_API_KEY', key.keyId, 'SUCCESS', req.ip, req.get('user-agent'));

    res.status(201).json({
      code: 'KEY_CREATED',
      message: 'Chave de API criada com sucesso',
      data: key
    });
  } catch (error) {
    AuditService.logAction(req.user.userId, 'CREATE_API_KEY', 'key', 'FAILED', req.ip, req.get('user-agent'), { error: error.message });
    next(error);
  }
});

/**
 * GET /api/keys/list
 * Lista chaves de API do usuário
 */
router.get('/list', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const keys = await KeyService.listApiKeys(userId);

    AuditService.logAction(userId, 'LIST_API_KEYS', 'keys', 'SUCCESS', req.ip, req.get('user-agent'));

    res.json({
      code: 'KEYS_LISTED',
      message: 'Chaves listadas com sucesso',
      data: keys
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/keys/:keyId/deactivate
 * Desativa uma chave de API
 */
router.post('/:keyId/deactivate', async (req, res, next) => {
  try {
    const { keyId } = req.params;
    const userId = req.user.userId;

    const result = await KeyService.deactivateApiKey(keyId, userId);

    AuditService.logAction(userId, 'DEACTIVATE_API_KEY', keyId, 'SUCCESS', req.ip, req.get('user-agent'));

    res.json({
      code: 'KEY_DEACTIVATED',
      message: result.message,
      data: result
    });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ code: error.code, message: error.message });
    }
    AuditService.logAction(req.user.userId, 'DEACTIVATE_API_KEY', req.params.keyId, 'FAILED', req.ip, req.get('user-agent'));
    next(error);
  }
});

/**
 * GET /api/keys/:keyId/stats
 * Obtém estatísticas de uma chave
 */
router.get('/:keyId/stats', async (req, res, next) => {
  try {
    const { keyId } = req.params;
    const userId = req.user.userId;

    const stats = await KeyService.getKeyStats(keyId, userId);

    res.json({
      code: 'STATS_RETRIEVED',
      message: 'Estatísticas obtidas com sucesso',
      data: stats
    });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ code: error.code, message: error.message });
    }
    next(error);
  }
});

module.exports = router;
