const db = require('@core/database');
const KeyGenerator = require('@utils/key-generator');

class LogService {
  /**
   * Registra uma ação no log
   */
  static logAction(userId, action, resource, status, ipAddress, userAgent, details = null) {
    const logId = KeyGenerator.generateId();
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO logs (id, user_id, action, resource, status, ip_address, user_agent, created_at, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, userId, action, resource, status, ipAddress, userAgent, createdAt, details ? JSON.stringify(details) : null]
    );
  }

  /**
   * Obtém logs de um usuário
   */
  static getUserLogs(userId, limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset],
        (err, logs) => {
          if (err) reject({ code: 'DB_ERROR', message: err.message });
          else resolve(logs || []);
        }
      );
    });
  }

  /**
   * Obtém logs de uma chave específica
   */
  static getKeyLogs(keyId, limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM logs WHERE resource = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [keyId, limit, offset],
        (err, logs) => {
          if (err) reject({ code: 'DB_ERROR', message: err.message });
          else resolve(logs || []);
        }
      );
    });
  }

  /**
   * Obtém todos os logs (apenas admin)
   */
  static getAllLogs(limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, logs) => {
          if (err) reject({ code: 'DB_ERROR', message: err.message });
          else resolve(logs || []);
        }
      );
    });
  }

  /**
   * Obtém estatísticas gerais
   */
  static getStats() {
    return new Promise((resolve, reject) => {
      const stats = {};

      db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
        if (err) {
          reject({ code: 'DB_ERROR', message: err.message });
          return;
        }
        stats.totalUsers = result.count;

        db.get('SELECT COUNT(*) as count FROM api_keys WHERE is_active = 1', (err, result) => {
          if (err) {
            reject({ code: 'DB_ERROR', message: err.message });
            return;
          }
          stats.activeApiKeys = result.count;

          db.get('SELECT COUNT(*) as count FROM licenses WHERE is_active = 1', (err, result) => {
            if (err) {
              reject({ code: 'DB_ERROR', message: err.message });
              return;
            }
            stats.activeLicenses = result.count;

            db.get('SELECT COUNT(*) as count FROM activations WHERE is_active = 1', (err, result) => {
              if (err) {
                reject({ code: 'DB_ERROR', message: err.message });
                return;
              }
              stats.activeActivations = result.count;

              db.get('SELECT SUM(usage_count) as total FROM api_keys', (err, result) => {
                if (err) {
                  reject({ code: 'DB_ERROR', message: err.message });
                  return;
                }
                stats.totalApiCalls = result.total || 0;

                resolve(stats);
              });
            });
          });
        });
      });
    });
  }
}

module.exports = LogService;
