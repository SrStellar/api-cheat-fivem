const express = require('express');
const router = express.Router();
const AuthService = require('@services/auth.service');
const AuditService = require('@services/audit.service');

/**
 * POST /api/validate/key
 * Valida uma chave de API ou licença
 * Corpo esperado: { key: "...", type: "api|license", deviceId?: "...", hwid?: "..." }
 */
router.post('/', async (req, res, next) => {
  try {
    const { key, type, deviceId, hwid } = req.body;

    if (!key) {
      return res.status(400).json({ code: 'MISSING_KEY', message: 'Chave é obrigatória' });
    }

    if (!type || !['api', 'license'].includes(type)) {
      return res.status(400).json({ code: 'INVALID_TYPE', message: 'Tipo deve ser "api" ou "license"' });
    }

    let result;

    if (type === 'api') {
      result = await AuthService.validateApiKey(key, req.ip);
      AuditService.logAction(result.userId, 'VALIDATE_API_KEY', result.keyId, 'SUCCESS', req.ip, req.get('user-agent'));
    } else {
      result = await AuthService.validateLicense(key, deviceId, hwid);
      AuditService.logAction(result.userId, 'VALIDATE_LICENSE', result.licenseId, 'SUCCESS', req.ip, req.get('user-agent'));
    }

    res.json({
      code: 'VALIDATION_SUCCESS',
      message: 'Chave válida',
      data: result
    });
  } catch (error) {
    if (['INVALID_KEY', 'KEY_INACTIVE', 'KEY_EXPIRED', 'IP_NOT_WHITELISTED', 'INVALID_LICENSE', 'LICENSE_EXPIRED', 'MAX_ACTIVATIONS_REACHED'].includes(error.code)) {
      AuditService.logAction(null, 'VALIDATE_FAILED', 'key', error.code, req.ip, req.get('user-agent'));
      return res.status(401).json({ code: error.code, message: error.message });
    }

    next(error);
  }
});

module.exports = router;
