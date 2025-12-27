const express = require('express');
const router = express.Router();
const KeyService = require('@services/key.service');
const AuditService = require('@services/audit.service');

/**
 * POST /api/licenses/create
 * Cria uma nova licença
 */
router.post('/create', async (req, res, next) => {
  try {
    const { productId, maxActivations, expiresIn } = req.body;
    const userId = req.user.userId;

    if (!productId || productId.length < 2) {
      return res.status(400).json({ code: 'INVALID_PRODUCT_ID', message: 'ID do produto é inválido' });
    }

    const license = await KeyService.createLicense(
      userId,
      productId,
      maxActivations || 1,
      expiresIn
    );

    AuditService.logAction(userId, 'CREATE_LICENSE', license.licenseId, 'SUCCESS', req.ip, req.get('user-agent'));

    res.status(201).json({
      code: 'LICENSE_CREATED',
      message: 'Licença criada com sucesso',
      data: license
    });
  } catch (error) {
    AuditService.logAction(req.user.userId, 'CREATE_LICENSE', 'license', 'FAILED', req.ip, req.get('user-agent'));
    next(error);
  }
});

/**
 * GET /api/licenses/list
 * Lista licenças do usuário
 */
router.get('/list', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const licenses = await KeyService.listLicenses(userId);

    AuditService.logAction(userId, 'LIST_LICENSES', 'licenses', 'SUCCESS', req.ip, req.get('user-agent'));

    res.json({
      code: 'LICENSES_LISTED',
      message: 'Licenças listadas com sucesso',
      data: licenses
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/licenses/:licenseId/deactivate
 * Desativa uma licença
 */
router.post('/:licenseId/deactivate', async (req, res, next) => {
  try {
    const { licenseId } = req.params;
    const userId = req.user.userId;

    const result = await KeyService.deactivateLicense(licenseId, userId);

    AuditService.logAction(userId, 'DEACTIVATE_LICENSE', licenseId, 'SUCCESS', req.ip, req.get('user-agent'));

    res.json({
      code: 'LICENSE_DEACTIVATED',
      message: result.message,
      data: result
    });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ code: error.code, message: error.message });
    }
    AuditService.logAction(req.user.userId, 'DEACTIVATE_LICENSE', req.params.licenseId, 'FAILED', req.ip, req.get('user-agent'));
    next(error);
  }
});

/**
 * POST /api/licenses/:licenseId/activations/:activationId/revoke
 * Revoga uma ativação
 */
router.post('/:licenseId/activations/:activationId/revoke', async (req, res, next) => {
  try {
    const { activationId } = req.params;
    const userId = req.user.userId;

    const result = await KeyService.revokeActivation(activationId, userId);

    AuditService.logAction(userId, 'REVOKE_ACTIVATION', activationId, 'SUCCESS', req.ip, req.get('user-agent'));

    res.json({
      code: 'ACTIVATION_REVOKED',
      message: result.message,
      data: result
    });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ code: error.code, message: error.message });
    }
    AuditService.logAction(req.user.userId, 'REVOKE_ACTIVATION', req.params.activationId, 'FAILED', req.ip, req.get('user-agent'));
    next(error);
  }
});

/**
 * GET /api/licenses/:licenseId/stats
 * Obtém estatísticas de uma licença
 */
router.get('/:licenseId/stats', async (req, res, next) => {
  try {
    const { licenseId } = req.params;
    const userId = req.user.userId;

    const stats = await KeyService.getLicenseStats(licenseId, userId);

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
