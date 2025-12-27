const db = require('@core/database');
const KeyGenerator = require('@utils/key-generator');

class KeyService {
  /**
   * Cria uma nova chave de API
   */
  static createApiKey(userId, name, description = '', expiresIn = null) {
    return new Promise((resolve, reject) => {
      const { key, hash } = KeyGenerator.generateApiKey(userId);
      const keyId = KeyGenerator.generateId();
      const createdAt = new Date().toISOString();
      let expiresAt = null;

      if (expiresIn) {
        expiresAt = new Date(Date.now() + expiresIn).toISOString();
      }

      db.run(
        `INSERT INTO api_keys (id, key_hash, user_id, name, description, created_at, expires_at, is_active, usage_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [keyId, hash, userId, name, description, createdAt, expiresAt, 1, 0],
        (err) => {
          if (err) {
            reject({ code: 'DB_ERROR', message: err.message });
          } else {
            resolve({
              keyId,
              key, // Mostrar apenas uma vez!
              name,
              description,
              createdAt,
              expiresAt
            });
          }
        }
      );
    });
  }

  /**
   * Lista chaves de API de um usuário
   */
  static listApiKeys(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, name, description, created_at, last_used, expires_at, is_active, usage_count
         FROM api_keys WHERE user_id = ? ORDER BY created_at DESC`,
        [userId],
        (err, keys) => {
          if (err) reject({ code: 'DB_ERROR', message: err.message });
          else resolve(keys || []);
        }
      );
    });
  }

  /**
   * Desativa uma chave de API
   */
  static deactivateApiKey(keyId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE api_keys SET is_active = 0 WHERE id = ? AND user_id = ?',
        [keyId, userId],
        function (err) {
          if (err) reject({ code: 'DB_ERROR', message: err.message });
          else if (this.changes === 0) reject({ code: 'NOT_FOUND', message: 'Chave não encontrada' });
          else resolve({ message: 'Chave desativada com sucesso' });
        }
      );
    });
  }

  /**
   * Cria uma nova licença
   */
  static createLicense(userId, productId, maxActivations = 1, expiresIn = null) {
    return new Promise((resolve, reject) => {
      const licenseKey = KeyGenerator.generateLicenseKey();
      const licenseId = KeyGenerator.generateId();
      const createdAt = new Date().toISOString();
      let expiresAt = null;

      if (expiresIn) {
        expiresAt = new Date(Date.now() + expiresIn).toISOString();
      }

      db.run(
        `INSERT INTO licenses (id, license_key, user_id, product_id, created_at, expires_at, is_active, max_activations, current_activations)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [licenseId, licenseKey, userId, productId, createdAt, expiresAt, 1, maxActivations, 0],
        (err) => {
          if (err) {
            reject({ code: 'DB_ERROR', message: err.message });
          } else {
            resolve({
              licenseId,
              licenseKey,
              productId,
              createdAt,
              expiresAt,
              maxActivations
            });
          }
        }
      );
    });
  }

  /**
   * Lista licenças de um usuário
   */
  static listLicenses(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, license_key, product_id, created_at, expires_at, is_active, max_activations, current_activations
         FROM licenses WHERE user_id = ? ORDER BY created_at DESC`,
        [userId],
        (err, licenses) => {
          if (err) reject({ code: 'DB_ERROR', message: err.message });
          else resolve(licenses || []);
        }
      );
    });
  }

  /**
   * Desativa uma licença
   */
  static deactivateLicense(licenseId, userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE licenses SET is_active = 0 WHERE id = ? AND user_id = ?',
        [licenseId, userId],
        function (err) {
          if (err) reject({ code: 'DB_ERROR', message: err.message });
          else if (this.changes === 0) reject({ code: 'NOT_FOUND', message: 'Licença não encontrada' });
          else resolve({ message: 'Licença desativada com sucesso' });
        }
      );
    });
  }

  /**
   * Revoga uma ativação
   */
  static revokeActivation(activationId, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT a.* FROM activations a
         JOIN licenses l ON a.license_id = l.id
         WHERE a.id = ? AND l.user_id = ?`,
        [activationId, userId],
        (err, activation) => {
          if (err) {
            reject({ code: 'DB_ERROR', message: err.message });
            return;
          }

          if (!activation) {
            reject({ code: 'NOT_FOUND', message: 'Ativação não encontrada' });
            return;
          }

          db.run(
            'UPDATE activations SET is_active = 0 WHERE id = ?',
            [activationId],
            (err) => {
              if (err) {
                reject({ code: 'DB_ERROR', message: err.message });
              } else {
                db.run('UPDATE licenses SET current_activations = current_activations - 1 WHERE id = ?', [activation.license_id]);
                resolve({ message: 'Ativação revogada com sucesso' });
              }
            }
          );
        }
      );
    });
  }

  /**
   * Obtém estatísticas de uma chave
   */
  static getKeyStats(keyId, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM api_keys WHERE id = ? AND user_id = ?`,
        [keyId, userId],
        (err, key) => {
          if (err) reject({ code: 'DB_ERROR', message: err.message });
          else if (!key) reject({ code: 'NOT_FOUND', message: 'Chave não encontrada' });
          else resolve({
            name: key.name,
            createdAt: key.created_at,
            lastUsed: key.last_used,
            usageCount: key.usage_count,
            expiresAt: key.expires_at
          });
        }
      );
    });
  }

  /**
   * Obtém estatísticas de uma licença
   */
  static getLicenseStats(licenseId, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM licenses WHERE id = ? AND user_id = ?`,
        [licenseId, userId],
        (err, license) => {
          if (err) {
            reject({ code: 'DB_ERROR', message: err.message });
            return;
          }

          if (!license) {
            reject({ code: 'NOT_FOUND', message: 'Licença não encontrada' });
            return;
          }

          db.all(
            `SELECT id, device_id, hwid, created_at, last_check, is_active FROM activations WHERE license_id = ?`,
            [licenseId],
            (err, activations) => {
              if (err) {
                reject({ code: 'DB_ERROR', message: err.message });
              } else {
                resolve({
                  productId: license.product_id,
                  createdAt: license.created_at,
                  expiresAt: license.expires_at,
                  maxActivations: license.max_activations,
                  currentActivations: license.current_activations,
                  activations: activations || []
                });
              }
            }
          );
        }
      );
    });
  }
}

module.exports = KeyService;
