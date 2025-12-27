# 🔐 Documentação de Segurança - API KeyAuth

## Visão Geral

Este sistema foi desenvolvido com **máxima segurança como prioridade**. Implementa as melhores práticas de segurança da indústria, seguindo padrões OWASP e protocolos modernos de proteção.

## 📋 Índice

1. [Camadas de Segurança](#camadas-de-segurança)
2. [Validação de Entrada](#validação-de-entrada)
3. [Autenticação e Autorização](#autenticação-e-autorização)
4. [Rate Limiting](#rate-limiting)
5. [Criptografia](#criptografia)
6. [Proteção Contra Ataques](#proteção-contra-ataques)
7. [Logging e Auditoria](#logging-e-auditoria)
8. [Configuração Segura](#configuração-segura)
9. [Resposta a Incidentes](#resposta-a-incidentes)

---

## Camadas de Segurança

O sistema implementa 6 camadas independentes de segurança:

```
┌─────────────────────────────────────────┐
│   1. VALIDAÇÃO DE ENTRADA (Validator)   │
├─────────────────────────────────────────┤
│   2. RATE LIMITING (SecurityLimiters)   │
├─────────────────────────────────────────┤
│   3. HEADERS DE SEGURANÇA (Helmet)      │
├─────────────────────────────────────────┤
│   4. AUTENTICAÇÃO (JWT + Bcrypt)        │
├─────────────────────────────────────────┤
│   5. DETECÇÃO DE ATAQUE (Middleware)    │
├─────────────────────────────────────────┤
│   6. LOGGING E AUDITORIA (Audit Log)    │
└─────────────────────────────────────────┘
```

### 1. Validação de Entrada

Cada entrada do usuário é validada estritamente usando a classe `Validator`:

#### Username
- **Comprimento**: 3-32 caracteres
- **Permitido**: Letras, números, underscore (`_`), hífen (`-`)
- **Exemplo válido**: `user_name-123`
- **Rejeitado**: `user@name`, `user name`, `us` (muito curto)

#### Email
- **Formato**: RFC 5322 simplificado
- **Comprimento máximo**: 255 caracteres
- **Validação**: Verifica domínio e formato
- **Exemplo**: `user@example.com`

#### Senha
- **Comprimento**: Mínimo 12 caracteres, máximo 128
- **Requerido**:
  - ✅ Pelo menos 1 letra MAIÚSCULA
  - ✅ Pelo menos 1 letra minúscula
  - ✅ Pelo menos 1 número
  - ✅ Pelo menos 1 caractere especial (`!@#$%^&*()...`)
- **Bloqueado**:
  - ❌ Sequências comuns (123456, abc, 789...)
  - ❌ Senhas comuns (password, admin, 123456...)
  - ❌ Repetição de caracteres (aaaa, 1111...)
- **Exemplo válida**: `MyPassword123!@#`

#### API Key
- **Comprimento**: 40+ caracteres
- **Formato**: Base64 com suporte a `-` e `_`
- **Hashear**: SHA-256 para armazenamento

#### License Key
- **Comprimento**: 20-256 caracteres
- **Formato**: Alfanumérico + `_` e `-`

#### Device ID
- **Comprimento**: 16-256 caracteres
- **Formato**: Alfanumérico + `_` e `-`

#### HWID (Hardware ID)
- **Comprimento**: 16-256 caracteres
- **Formato**: Hexadecimal + `_` e `-`
- **Uso**: Vincular licença a dispositivo específico

### Sanitização

Todo texto é sanitizado contra:
- ✅ XSS (Cross-Site Scripting)
- ✅ SQL Injection
- ✅ XXE (XML External Entity)
- ✅ Command Injection

---

## Autenticação e Autorização

### Fluxo de Login

```
1. Usuário submete username + password
   ↓
2. VALIDAÇÃO: Username e password validados
   ↓
3. BUSCA: Buscar usuário no banco
   ↓
4. VERIFICAÇÃO:
   - Usuário existe?
   - Usuário ativo?
   - Conta bloqueada?
   ↓
5. HASH COMPARISON:
   - Bcrypt.compare(senha, hash)
   - Timing attack protection (delay aleatório)
   ↓
6. SUCESSO:
   - Gerar JWT Token
   - Criar Session
   - Resetar tentativas de login
   ↓
7. ERRO:
   - Incrementar tentativas
   - Logar tentativa falhada
   - Bloquear após 5 tentativas (15 min)
```

### JWT Token

- **Algoritmo**: HS256 (HMAC SHA-256)
- **Expiração**: 24 horas (configurável)
- **Payload**:
  ```json
  {
    "userId": "user_id",
    "username": "username",
    "email": "user@example.com",
    "iat": 1234567890,
    "exp": 1234654290
  }
  ```

### Bcrypt Hash

- **Rounds**: 12 (padrão recomendado)
- **Cost**: ~100ms por hash (~2^12 = 4096 iterações)
- **Segurança**: Resistente a rainbow tables e GPU attacks

---

## Rate Limiting

### Camadas de Rate Limiting

#### 1️⃣ Global (Todas as requisições)
- **Limite**: 100 req/15 min por IP
- **Ação**: Bloquear IP temporariamente

#### 2️⃣ Autenticação (Login)
- **Limite**: 3 req/15 min por usuário
- **Ação**: Bloquear usuário por 15 minutos

#### 3️⃣ Registro
- **Limite**: 5 reg/hora por IP
- **Ação**: Bloquear IP por 1 hora

#### 4️⃣ Validação
- **Limite**: 20 req/min
- **Ação**: Bloquear validações

#### 5️⃣ Admin
- **Limite**: 50 req/10 min
- **Ação**: Bloquear admin

### Proteção Contra Força Bruta

```
Tentativa 1: Permitido
Tentativa 2: Permitido
Tentativa 3: Permitido
Tentativa 4: Permitido
Tentativa 5: ❌ CONTA BLOQUEADA POR 15 MINUTOS
```

**Proteção contra timing attacks**: Delay aleatório (500-1000ms) mesmo que falhe

---

## Criptografia

### Passwords

- **Algoritmo**: Bcrypt
- **Salt**: Gerado automaticamente
- **Rounds**: 12
- **Nunca**: Armazenar senha em plain text
- **Comparação**: Sempre async (não usar sync)

### API Keys

- **Geração**: Random bytes 32
- **Formato**: Base64 com `-` e `_`
- **Armazenamento**: SHA-256 hash
- **Nunca**: Exibir chave inteira novamente

### Tokens

- **JWT Secret**: 32 bytes aleatórios (256 bits)
- **Algoritmo**: HS256
- **Assinatura**: Verificada em cada requisição

### Dados Sensíveis

Campos que devem ser criptografados (AES-256-GCM):
- ✅ HWID (identificador de hardware)
- ✅ Device ID (em desenvolvimento)
- ❌ Senhas (já hasheadas)
- ❌ API Keys (já hasheadas)

---

## Proteção Contra Ataques

### SQL Injection

**Detecção**: Palavras-chave suspeitas
```javascript
/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|WHERE)\b)/gi
```

**Prevenção**:
- ✅ Parameterized queries (SEMPRE)
- ✅ Validação de entrada rigorosa
- ✅ Sem concatenação de strings SQL
- ✅ Logging de atividade suspeita

### XSS (Cross-Site Scripting)

**Detecção**: Tags HTML e eventos
```javascript
/<script[\s\S]*?<\/script>/gi
/on\w+\s*=/gi
/javascript:/gi
```

**Prevenção**:
- ✅ Sanitização de entrada
- ✅ Content-Security-Policy header
- ✅ X-XSS-Protection header
- ✅ HttpOnly cookies (quando aplicável)

### XXE (XML External Entity)

**Detecção**: Entidades XML
```javascript
/<!ENTITY/gi
/SYSTEM/gi
```

**Prevenção**:
- ✅ Não processar XML externo
- ✅ Desabilitar DOCTYPE
- ✅ Validação rigorosa

### LDAP Injection

**Detecção**: Caracteres especiais
```javascript
/[*()\\]/
```

### CSRF (Cross-Site Request Forgery)

**Prevenção**:
- ✅ SameSite cookies
- ✅ CORS restritivo
- ✅ Validação de Origin header

---

## Headers de Segurança

### HSTS (HTTP Strict Transport Security)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```
- Força HTTPS por 1 ano
- Inclui subdomínios
- Adiciona ao HSTS preload list

### Content-Security-Policy
```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
```
- Permite scripts apenas do mesmo domínio
- Bloqueia inline scripts
- Bloqueia eval()

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
- Previne MIME type sniffing
- Força navegador respeitar Content-Type declarado

### X-Frame-Options
```
X-Frame-Options: DENY
```
- Previne clickjacking
- Bloqueia embeding em iframes

### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
- Ativa proteção XSS do navegador (Legacy)

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- Controla quais referrers são enviados

---

## Logging e Auditoria

### Eventos Registrados

#### 🔐 Segurança

```
user_login                  → Login bem-sucedido
failed_login                → Tentativa de login falhada
password_change             → Mudança de senha
account_locked              → Conta bloqueada após N tentativas
account_unlocked            → Conta desbloqueada manualmente
unauthorized_ip             → IP não autorizado para API key
unauthorized_hwid           → HWID não autorizado
suspicious_activity         → Atividade suspeita detectada
```

#### 📋 Administrativos

```
user_created                → Novo usuário criado
user_deleted                → Usuário deletado
user_updated                → Perfil atualizado
api_key_created             → Nova API key
api_key_revoked             → API key revogada
license_created             → Nova licença
license_activated           → Licença ativada
license_revoked             → Licença revogada
```

### Formato de Log

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "SECURITY",
  "event": "failed_login",
  "userId": "user_123",
  "username": "john_doe",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "details": "Tentativa com senha incorreta",
  "riskLevel": "MEDIUM"
}
```

### Retenção

- Logs mantidos por **90 dias**
- Arquivado automaticamente
- Criptografado em repouso
- Acesso auditado

### Acesso aos Logs

- ✅ Admins podem visualizar logs do sistema
- ✅ Usuários podem visualizar seus próprios logs
- ❌ Nunca exibir senhas ou tokens
- ❌ Nunca compartilhar logs sensíveis

---

## Configuração Segura

### Variáveis de Ambiente

**NUNCA commite `.env` real!** Use `.env.example` como template.

```bash
# Gerar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Saída: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b
```

### Checklist de Deploy

- [ ] JWT_SECRET definido (32+ bytes)
- [ ] BCRYPT_ROUNDS = 12+
- [ ] MAX_LOGIN_ATTEMPTS = 5+
- [ ] CORS restritivo (não use `*`)
- [ ] HTTPS/TLS ativo
- [ ] Headers de segurança habilitados
- [ ] Rate limiting ativo
- [ ] Logging ativo
- [ ] Backup automático configurado
- [ ] Monitoramento ativo
- [ ] Alertas de segurança configurados
- [ ] Banco de dados em local seguro
- [ ] Permissões de arquivo 600 (rw-------)
- [ ] Sem dados sensíveis em logs
- [ ] WAF (Web Application Firewall) recomendado

### Hardening de SO

```bash
# Linux - Restringir permissões de arquivo
chmod 600 .env
chmod 600 data/auth.db
chmod 700 src/

# Usar firewall
ufw allow 22/tcp  # SSH
ufw allow 443/tcp # HTTPS
ufw allow 80/tcp  # HTTP (redirecion)
ufw enable
```

---

## Resposta a Incidentes

### Suspeita de Compromisso

**Passo 1**: Parar imediatamente
```bash
pm2 stop api-keyauth
```

**Passo 2**: Verificar logs
```bash
grep "suspicious\|unauthorized\|injection" logs/*.log
```

**Passo 3**: Backup das evidências
```bash
cp -r data/ backups/incident-2024-01-15/
```

**Passo 4**: Resetar chaves críticas
```
- Regenerar JWT_SECRET
- Revogar todas as API keys
- Resetar senhas de admin
- Verificar usuários criados recentemente
```

**Passo 5**: Restore e reiniciar
```bash
# Usar backup anterior seguro
pm2 start app.js
```

### Brute Force Attack

**Detectado por**:
- [ ] Rate limiter disparado
- [ ] Múltiplas tentativas de login falhadas
- [ ] Log de `failed_login` suspeito

**Resposta**:
```javascript
// Bloquear IP automaticamente
SELECT * FROM logs WHERE 
  event = 'failed_login' 
  AND timestamp > NOW() - INTERVAL '1 hour'
GROUP BY ip_address HAVING COUNT(*) > 50;
```

### Compromisso de Chave

**Detectado por**:
- Uso de chave de diferentes IPs/HWIDs
- Uso em horários incomuns
- Múltiplas ativações simultaneously

**Resposta**:
```javascript
// Revogar chave imediatamente
UPDATE api_keys SET status = 'revoked' WHERE id = ?;

// Gerar nova chave
// Notificar usuário
```

---

## Boas Práticas

### Para Desenvolvedores

1. ✅ Sempre validar entrada
2. ✅ Sempre usar parâmetros em queries
3. ✅ Nunca logar senhas/tokens
4. ✅ Usar HTTPS em produção
5. ✅ Manter dependências atualizadas
6. ✅ Revisar logs regularmente
7. ✅ Fazer backup regularmente
8. ✅ Testar atualizações de segurança

### Para Administradores

1. ✅ Monitorar logs diariamente
2. ✅ Atualizar dependências mensalmente
3. ✅ Fazer backup semanal
4. ✅ Testar restore de backup mensal
5. ✅ Revisar usuários/chaves regularmente
6. ✅ Revogar chaves não usadas
7. ✅ Resetar senhas periodicamente
8. ✅ Monitorar performance/anomalias

---

## Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Guidelines](https://pages.nist.gov/800-63-3/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/nodejs-security/)

---

**Última atualização**: 2024-01-15  
**Versão**: 1.0  
**Autor**: Sistema de Segurança API KeyAuth
