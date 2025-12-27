const db = require('@core/database');
const bcrypt = require('bcryptjs');
const KeyGenerator = require('@utils/key-generator');
const Validator = require('@core/validator');

class AuthService {
  /**
   * Registra um novo usuário com validação rigorosa
   */
  static register(username, email, password) {
    return new Promise((resolve, reject) => {
      // Validar username
      const usernameValidation = Validator.validateUsername(username);
      if (!usernameValidation.valid) {
        return reject({ code: 'INVALID_USERNAME', message: usernameValidation.error });
      }

      // Validar email
      const emailValidation = Validator.validateEmail(email);
      if (!emailValidation.valid) {
        return reject({ code: 'INVALID_EMAIL', message: emailValidation.error });
      }

      // Validar senha
      const passwordValidation = Validator.validatePassword(password);
      if (!passwordValidation.valid) {
        return reject({ code: 'WEAK_PASSWORD', message: passwordValidation.error });
      }

      // Verificar se usuário/email já existe
      db.get('SELECT id FROM users WHERE username = ? OR email = ?', [usernameValidation.value, emailValidation.value], (err, user) => {
        if (err) {
          return reject({ code: 'DB_ERROR', message: 'Erro ao verificar usuário' });
        }

        if (user) {
          return reject({ code: 'DUPLICATE_USER', message: 'Usuário ou email já existe' });
        }

        // Hash da senha com bcrypt (12 rounds - mais seguro)
        bcrypt.hash(password, 12, (err, hashedPassword) => {
          if (err) {
            return reject({ code: 'HASH_ERROR', message: 'Erro ao processar senha' });
          }

          const userId = KeyGenerator.generateId();
          const createdAt = new Date().toISOString();

          db.run(
            `INSERT INTO users (id, username, email, password_hash, created_at, is_active)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, usernameValidation.value, emailValidation.value, hashedPassword, createdAt, 1],
            function (err) {
              if (err) {
                reject({ code: 'DB_ERROR', message: 'Erro ao registrar usuário' });
              } else {
                resolve({ userId, username: usernameValidation.value, email: emailValidation.value, createdAt });
              }
            }
          );
        });
      });
    });
  }

  /**
   * Faz login com proteção contra força bruta
   */
  static login(username, password) {
    return new Promise((resolve, reject) => {
      if (!username || typeof username !== 'string') {
        return reject({ code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' });
      }

      if (!password || typeof password !== 'string') {
        return reject({ code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' });
      }

      // Validação básica
      if (username.length > 32 || password.length > 128) {
        return reject({ code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' });
      }

      db.get(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, username],
        (err, user) => {
          if (err) {
            reject({ code: 'DB_ERROR', message: 'Erro ao buscar usuário' });
            return;
          }

          if (!user) {
            this.recordFailedLogin(username);
            // Simular delay para evitar timing attacks
            setTimeout(() => {
              reject({ code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' });
            }, 500 + Math.random() * 500);
            return;
          }

          // Verificar se usuário está ativo
          if (!user.is_active) {
            this.recordFailedLogin(username);
            return reject({ code: 'ACCOUNT_DISABLED', message: 'Conta desativada' });
          }

          // Verificar se usuário está bloqueado
          if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return reject({ code: 'ACCOUNT_LOCKED', message: 'Conta bloqueada. Tente mais tarde.' });
          }

          // Comparar senha com timing attack protection
          bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err || !isMatch) {
              this.recordFailedLogin(username);
              this.incrementLoginAttempts(user.id);
              
              // Simular delay
              setTimeout(() => {
                reject({ code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' });
              }, 500 + Math.random() * 500);
              return;
            }

            // Login bem-sucedido
            const token = KeyGenerator.generateToken(
              { userId: user.id, username: user.username, email: user.email },
              86400 // 24 horas
            );

            db.run(
              'UPDATE users SET last_login = ?, login_attempts = 0, locked_until = NULL WHERE id = ?',
              [new Date().toISOString(), user.id],
              (err) => {
                if (err) {
                  reject({ code: 'DB_ERROR', message: 'Erro ao atualizar usuário' });
                  return;
                }

                // Criar sessão
                this.createSession(user.id, token, this.getClientInfo())
                  .then(() => {
                    resolve({
                      userId: user.id,
                      username: user.username,
                      email: user.email,
                      token,
                      expiresIn: 86400
                    });
                  })
                  .catch(reject);
              }
            );
          });
        }
      );
    });
  }

  /**
   * Valida uma chave de API
   */
  static validateApiKey(key, ipAddress) {
    return new Promise((resolve, reject) => {
      // Validações de entrada
      if (!key || typeof key !== 'string') {
        return reject({ code: 'INVALID_KEY', message: 'Chave de API inválida' });
      }

      if (key.length < 40) {
        return reject({ code: 'INVALID_KEY', message: 'Chave de API inválida' });
      }

      const keyHash = KeyGenerator.hashKey(key);

      db.get(
        `SELECT ak.*, u.id as user_id, u.username, u.is_active, u.locked_until
         FROM api_keys ak
         JOIN users u ON ak.user_id = u.id
         WHERE ak.key_hash = ? AND ak.is_active = 1`,
        [keyHash],
        (err, apiKey) => {
          if (err) {
            reject({ code: 'DB_ERROR', message: 'Erro ao validar chave' });
            return;
          }

          if (!apiKey) {
            reject({ code: 'INVALID_KEY', message: 'Chave de API inválida' });
            return;
          }

          // Verificar se usuário está ativo
          if (!apiKey.is_active) {
            reject({ code: 'USER_DISABLED', message: 'Usuário desativado' });
            return;
          }

          // Verificar se usuário está bloqueado
          if (apiKey.locked_until && new Date(apiKey.locked_until) > new Date()) {
            reject({ code: 'ACCOUNT_LOCKED', message: 'Conta bloqueada' });
            return;
          }

          // Verificar se chave está ativa
          if (!apiKey.is_active) {
            reject({ code: 'KEY_INACTIVE', message: 'Chave desativada' });
            return;
          }

          // Verificar expiração
          if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
            reject({ code: 'KEY_EXPIRED', message: 'Chave expirada' });
            return;
          }

          // Validar IP se whitelist estiver configurada
          if (apiKey.ip_whitelist) {
            try {
              const whitelist = JSON.parse(apiKey.ip_whitelist);
              if (whitelist.length > 0 && !whitelist.includes(ipAddress)) {
                // Log de tentativa de IP não autorizado
                db.run(
                  'INSERT INTO logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
                  [apiKey.user_id, 'unauthorized_ip', `IP não autorizado: ${ipAddress}`, ipAddress],
                  () => {}
                );
                reject({ code: 'IP_NOT_WHITELISTED', message: 'IP não autorizado' });
                return;
              }
            } catch (e) {
              reject({ code: 'KEY_CONFIGURATION_ERROR', message: 'Erro na configuração da chave' });
              return;
            }
          }

          // Atualizar último uso
          db.run(
            'UPDATE api_keys SET last_used = ?, usage_count = usage_count + 1 WHERE id = ?',
            [new Date().toISOString(), apiKey.id],
            () => {}
          );

          resolve({
            keyId: apiKey.id,
            userId: apiKey.user_id,
            username: apiKey.username,
            name: apiKey.name,
            usageCount: apiKey.usage_count
          });
        }
      );
    });
  }

  /**
   * Valida uma chave de licença com máxima segurança
   */
  static validateLicense(licenseKey, deviceId = null, hwid = null) {
    return new Promise((resolve, reject) => {
      // Validações de entrada
      if (!licenseKey || typeof licenseKey !== 'string') {
        return reject({ code: 'INVALID_LICENSE', message: 'Chave de licença inválida' });
      }

      // Validar formato da licença
      if (licenseKey.length < 20 || licenseKey.length > 128) {
        return reject({ code: 'INVALID_LICENSE', message: 'Formato de licença inválido' });
      }

      db.get(
        `SELECT l.*, u.id as user_id, u.username, u.is_active, u.locked_until
         FROM licenses l
         JOIN users u ON l.user_id = u.id
         WHERE l.license_key = ? AND l.is_active = 1`,
        [licenseKey],
        (err, license) => {
          if (err) {
            reject({ code: 'DB_ERROR', message: 'Erro ao validar licença' });
            return;
          }

          if (!license) {
            reject({ code: 'INVALID_LICENSE', message: 'Chave de licença inválida' });
            return;
          }

          // Verificar se usuário está ativo
          if (!license.is_active) {
            reject({ code: 'USER_DISABLED', message: 'Usuário desativado' });
            return;
          }

          // Verificar se usuário está bloqueado
          if (license.locked_until && new Date(license.locked_until) > new Date()) {
            reject({ code: 'ACCOUNT_LOCKED', message: 'Conta bloqueada' });
            return;
          }

          // Verificar expiração
          if (license.expires_at && new Date(license.expires_at) < new Date()) {
            reject({ code: 'LICENSE_EXPIRED', message: 'Licença expirada' });
            return;
          }

          // Validar HWID se fornecido
          if (hwid) {
            if (license.hwid_restriction && license.hwid_restriction !== hwid) {
              db.run(
                'INSERT INTO logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
                [license.user_id, 'unauthorized_hwid', `Tentativa com HWID não autorizado: ${hwid}`, 'unknown'],
                () => {}
              );
              reject({ code: 'HWID_MISMATCH', message: 'HWID não autorizado para esta licença' });
              return;
            }
          }

          // Validar Device ID se fornecido
          if (deviceId) {
            const deviceValidation = Validator.validateDeviceId(deviceId);
            if (!deviceValidation.valid) {
              reject({ code: 'INVALID_DEVICE_ID', message: deviceValidation.error });
              return;
            }

            // Verificar ou ativar
            this.verifyActivation(license.id, deviceId, hwid)
              .then((activation) => {
                resolve({
                  licenseId: license.id,
                  licenseKey: license.license_key,
                  productId: license.product_id,
                  userId: license.user_id,
                  username: license.username,
                  expiresAt: license.expires_at,
                  activationId: activation.id
                });
              })
              .catch(reject);
          } else {
            resolve({
              licenseId: license.id,
              licenseKey: license.license_key,
              productId: license.product_id,
              userId: license.user_id,
              username: license.username,
              expiresAt: license.expires_at,
              maxActivations: license.max_activations,
              currentActivations: license.current_activations
            });
          }
        }
      );
    });
  }

  /**
   * Verifica ou cria uma ativação com validações rigorosas
   */
  static verifyActivation(licenseId, deviceId, hwid) {
    return new Promise((resolve, reject) => {
      // Validações de entrada
      if (!licenseId || typeof licenseId !== 'string') {
        return reject({ code: 'INVALID_LICENSE_ID', message: 'ID de licença inválido' });
      }

      const deviceValidation = Validator.validateDeviceId(deviceId);
      if (!deviceValidation.valid) {
        return reject({ code: 'INVALID_DEVICE_ID', message: deviceValidation.error });
      }

      if (hwid) {
        const hwidValidation = Validator.validateHWID(hwid);
        if (!hwidValidation.valid) {
          return reject({ code: 'INVALID_HWID', message: hwidValidation.error });
        }
      }

      db.get(
        'SELECT * FROM activations WHERE license_id = ? AND device_id = ?',
        [licenseId, deviceId],
        (err, activation) => {
          if (err) {
            reject({ code: 'DB_ERROR', message: 'Erro ao verificar ativação' });
            return;
          }

          if (activation) {
            // Ativação existente - verificar integridade
            if (hwid && activation.hwid !== hwid) {
              db.run(
                'INSERT INTO logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
                [null, 'suspicious_hwid_change', `HWID mudou para dispositivo ${deviceId}`, 'unknown'],
                () => {}
              );
              // Aceitar a mudança mas logar como suspeita
            }

            // Atualizar último check
            db.run(
              'UPDATE activations SET last_check = ? WHERE id = ?',
              [new Date().toISOString(), activation.id],
              (err) => {
                if (err) {
                  reject({ code: 'DB_ERROR', message: 'Erro ao atualizar ativação' });
                  return;
                }
                resolve(activation);
              }
            );
          } else {
            // Criar nova ativação
            // Primeiro verificar limite de ativações
            db.get(
              `SELECT COUNT(*) as count FROM activations WHERE license_id = ? AND is_active = 1`,
              [licenseId],
              (err, result) => {
                if (err) {
                  reject({ code: 'DB_ERROR', message: 'Erro ao contar ativações' });
                  return;
                }

                db.get('SELECT max_activations FROM licenses WHERE id = ?', [licenseId], (err, license) => {
                  if (err) {
                    reject({ code: 'DB_ERROR', message: 'Erro ao buscar licença' });
                    return;
                  }

                  if (!license) {
                    reject({ code: 'LICENSE_NOT_FOUND', message: 'Licença não encontrada' });
                    return;
                  }

                  if (result.count >= license.max_activations) {
                    reject({ code: 'MAX_ACTIVATIONS_REACHED', message: 'Limite de ativações atingido' });
                    return;
                  }

                  // Criar nova ativação
                  const activationId = KeyGenerator.generateId();
                  const clientInfo = this.getClientInfo();

                  db.run(
                    `INSERT INTO activations (id, license_id, device_id, hwid, ip_address, created_at, last_check, is_active)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [activationId, licenseId, deviceId, hwid || null, clientInfo.ip, new Date().toISOString(), new Date().toISOString(), 1],
                    (err) => {
                      if (err) {
                        reject({ code: 'DB_ERROR', message: 'Erro ao criar ativação' });
                        return;
                      }

                      // Atualizar contador de ativações
                      db.run(
                        'UPDATE licenses SET current_activations = current_activations + 1 WHERE id = ?',
                        [licenseId],
                        (err) => {
                          if (err) {
                            reject({ code: 'DB_ERROR', message: 'Erro ao atualizar licença' });
                            return;
                          }
                          resolve({ id: activationId, license_id: licenseId, device_id: deviceId });
                        }
                      );
                    }
                  );
                });
              }
            );
          }
        }
      );
    });
  }

  /**
   * Cria uma nova sessão
   */
  static createSession(userId, token, clientInfo) {
    return new Promise((resolve, reject) => {
      const sessionId = KeyGenerator.generateId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      db.run(
        `INSERT INTO sessions (id, user_id, token, created_at, expires_at, ip_address, user_agent, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sessionId, userId, token, new Date().toISOString(), expiresAt, clientInfo.ip, clientInfo.userAgent, 1],
        (err) => {
          if (err) reject({ code: 'DB_ERROR', message: err.message });
          else resolve({ sessionId, expiresAt });
        }
      );
    });
  }

  /**
   * Incrementa tentativas de login com lockout automático
   */
  static incrementLoginAttempts(userId) {
    return new Promise((resolve) => {
      if (!userId || typeof userId !== 'string') {
        resolve();
        return;
      }

      db.get('SELECT login_attempts FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
          resolve();
          return;
        }

        const attempts = user.login_attempts + 1;
        const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
        const lockoutTime = parseInt(process.env.LOCKOUT_TIME) || 900000; // 15 min

        let lockedUntil = null;
        if (attempts >= maxAttempts) {
          lockedUntil = new Date(Date.now() + lockoutTime).toISOString();
          
          // Log de suspeita
          db.run(
            'INSERT INTO logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
            [userId, 'account_locked', `Conta bloqueada após ${attempts} tentativas falhadas`, this.getClientInfo().ip],
            () => {}
          );
        }

        db.run(
          'UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?',
          [attempts, lockedUntil, userId],
          () => resolve()
        );
      });
    });
  }

  /**
   * Registra tentativa de login falhada com validação
   */
  static recordFailedLogin(username) {
    if (!username || typeof username !== 'string') {
      return;
    }

    // Sanitizar username
    const sanitized = Validator.sanitizeString(username);
    if (!sanitized) {
      return;
    }

    const id = KeyGenerator.generateId();
    const clientInfo = this.getClientInfo();

    db.run(
      'INSERT INTO failed_login_attempts (id, username, ip_address, created_at) VALUES (?, ?, ?, ?)',
      [id, sanitized, clientInfo.ip, new Date().toISOString()],
      () => {}
    );
  }

  /**
   * Retorna informações do cliente (para desenvolvimento, deve ser substituído pelo req real)
   */
  static getClientInfo() {
    return { ip: '127.0.0.1', userAgent: 'system' };
  }
}

module.exports = AuthService;
