# ✅ Checklist de Deploy - Segurança Máxima

Use este checklist antes de fazer deploy em produção.

## 🔐 Segurança da Configuração

### Variáveis de Ambiente
- [ ] `.env` não está commitado no git
- [ ] `.env.local` existe com valores reais
- [ ] `JWT_SECRET` definido (32+ bytes aleatórios)
- [ ] `ENCRYPTION_KEY` definido (32+ bytes)
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` definido com domínio específico (NÃO `*`)
- [ ] Todas as senhas têm 12+ caracteres com símbolos
- [ ] Nenhuma chave sensível em comentários
- [ ] `.env*` está no `.gitignore`

### Banco de Dados
- [ ] SQLite em local seguro (não em `/tmp`)
- [ ] Permissões de arquivo: `600` (rw-------)
- [ ] Permissões de diretório: `700` (rwx------)
- [ ] Caminho relativo seguro: `./data/auth.db`
- [ ] Backup automático configurado
- [ ] Backup testado (restore funciona)

### Arquivos de Código
- [ ] Sem senhas hardcoded
- [ ] Sem tokens hardcoded
- [ ] Sem chaves privadas expostas
- [ ] Sem comentários com dados sensíveis
- [ ] Permissões: `644` (rw-r--r--)

---

## 🔑 Criptografia e Hashing

### Passwords
- [ ] `BCRYPT_ROUNDS=12` (ou maior)
- [ ] Async bcrypt em uso (NÃO sync)
- [ ] Nunca armazenar senha em plain text
- [ ] Nunca enviar senha em response

### Tokens
- [ ] JWT com HS256 (HMAC)
- [ ] Secret complexo (64+ caracteres)
- [ ] Token expiration: 24h (configurável)
- [ ] Refresh token support implementado
- [ ] Tokens validados em cada requisição

### Chaves de API
- [ ] Geradas com crypto.randomBytes(32)
- [ ] Hasheadas com SHA-256 antes de armazenar
- [ ] Nunca exibidas novamente (mostrar só primeira vez)
- [ ] Rotação possível
- [ ] Revogação implementada

---

## 🛡️ Headers de Segurança

- [ ] `Strict-Transport-Security` ativado (HSTS)
- [ ] `Content-Security-Policy` configurado
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` configurado

---

## 🚫 Rate Limiting

- [ ] Global limiter: 100 req/15min
- [ ] Auth limiter: 3 req/15min (login)
- [ ] Register limiter: 5 reg/hora
- [ ] Validation limiter: 20 req/min
- [ ] Admin limiter: 50 req/10min
- [ ] IP blocking após limite excedido
- [ ] Usuário bloqueado após 5 tentativas de login

---

## ✔️ Validação de Entrada

- [ ] Validator class em uso
- [ ] Username: 3-32 chars, [a-zA-Z0-9_-]
- [ ] Email: RFC 5322 válido
- [ ] Password: 12+ chars, upper/lower/number/symbol
- [ ] API Keys: 40+ chars, SHA-256 hash
- [ ] Device ID: 16+ chars validado
- [ ] HWID: 16+ chars hexadecimal validado
- [ ] Nenhuma concatenação em SQL queries

---

## 🔍 Detecção de Ataque

- [ ] SQL Injection detection ativo
- [ ] XXE detection ativo
- [ ] XSS pattern detection ativo
- [ ] LDAP Injection detection ativo
- [ ] Logging de atividade suspeita ativo
- [ ] IP suspeito bloqueado

---

## 📋 Logging e Auditoria

- [ ] Todos os logins registrados (sucesso e falha)
- [ ] Todas as mudanças administrativas logged
- [ ] Logs incluem timestamp, IP, user agent
- [ ] Logs não expõem senhas/tokens
- [ ] Retenção: 90 dias mínimo
- [ ] Logs comprimidos após 7 dias
- [ ] Acesso a logs auditado
- [ ] Alertas configurados para atividade suspeita

---

## 🔗 HTTPS/TLS

- [ ] HTTPS ativo (TLS 1.2+)
- [ ] Certificado válido (não self-signed)
- [ ] Certificado para domínio correto
- [ ] Redirect HTTP → HTTPS
- [ ] HSTS preload enabled
- [ ] Teste com: https://www.ssllabs.com/

---

## 📱 API Segura

- [ ] Content-Type: application/json enforcement
- [ ] Payload size limite: 100KB
- [ ] Query parameters validados
- [ ] Response nunca inclui senha/token completo
- [ ] Erro messages genéricos (não revelar info)
- [ ] 404 para endpoints privados não encontrados

---

## 👤 Autenticação

- [ ] Login com username + password
- [ ] JWT token gerado após login
- [ ] Token validado em cada requisição protegida
- [ ] Logout limpa session
- [ ] Refresh token funcionando
- [ ] Token expiration enforced

---

## 🔑 Chaves de API

- [ ] API keys geradas aleatoriamente
- [ ] API keys hasheadas (SHA-256)
- [ ] IP whitelist optional
- [ ] HWID restriction optional
- [ ] Revogação de chave possível
- [ ] Uso de chave logged
- [ ] Expiração de chave optional

---

## 📜 Licenças

- [ ] License keys geradas aleatoriamente
- [ ] License key validation segura
- [ ] Limite de ativações por license
- [ ] HWID binding opcional
- [ ] Device ID tracking
- [ ] Expiração de licença enforced
- [ ] Revogação de licença possível

---

## 🛠️ Infraestrutura

### Servidor
- [ ] Firewall ativo
- [ ] SSH key-only (sem password)
- [ ] Fail2Ban ou similar para bruteforce
- [ ] Monitoramento de CPU/Memory/Disk
- [ ] Alertas para recursos esgotados

### Rede
- [ ] HTTPS obrigatório
- [ ] IP whitelist para admin (opcional)
- [ ] VPN para acesso administrativo (recomendado)
- [ ] DDoS protection (CloudFlare, etc)
- [ ] WAF (Web Application Firewall) ativo

### Backup
- [ ] Backup diário do banco de dados
- [ ] Backup off-site
- [ ] Teste de restore semanal
- [ ] Encryption em backup (AES-256)
- [ ] Retenção mínima: 30 dias

---

## 📊 Monitoramento

- [ ] Alertas para múltiplas falhas de login
- [ ] Alertas para IP suspeito
- [ ] Alertas para padrão de ataque detectado
- [ ] Alertas para erro crítico
- [ ] Dashboard de segurança
- [ ] Logs centralizados (ELK, Splunk, etc)

---

## 📝 Documentação

- [ ] SECURITY.md atualizado
- [ ] README com instrucções de deploy
- [ ] Documentação de API
- [ ] Runbook de resposta a incidente
- [ ] Contatos de emergência documentados
- [ ] Procedimento de rollback documentado

---

## 🧪 Testes

- [ ] Teste de SQL Injection (deve falhar)
- [ ] Teste de XSS (deve falhar)
- [ ] Teste de rate limiting (deve bloquear)
- [ ] Teste de login incorreto (deve falhar)
- [ ] Teste de token expirado (deve falhar)
- [ ] Teste de API key inválida (deve falhar)
- [ ] Teste de CORS (deve bloquear origem inválida)
- [ ] Teste de header validation

---

## 🚀 Deploy

### Pré-Deploy
- [ ] Todos os itens acima checkados
- [ ] Testes passando
- [ ] Code review completado
- [ ] Security review completado
- [ ] Performance test realizado
- [ ] Rollback plan preparado

### Deploy
- [ ] Backup do estado atual
- [ ] Migrate código
- [ ] Atualizar .env em produção
- [ ] Reiniciar serviço
- [ ] Verificar saúde da app
- [ ] Monitorar logs por 1 hora
- [ ] Testar login, chaves, licenças
- [ ] Notificar usuários se necessário

### Pós-Deploy
- [ ] Monitoramento ativo por 24h
- [ ] Responder rapidamente a anomalias
- [ ] Documentar qualquer issue
- [ ] Review de performance
- [ ] Update changelog

---

## 📞 Contatos de Emergência

```
Security Lead: [NOME] - [EMAIL] - [PHONE]
Backup Lead:   [NOME] - [EMAIL] - [PHONE]
DevOps:        [NOME] - [EMAIL] - [PHONE]
```

---

## 📅 Manutenção Contínua

### Semanal
- [ ] Revisar logs
- [ ] Verificar alertas
- [ ] Testar backup

### Mensal
- [ ] Atualizar dependências (npm)
- [ ] Review de security advisories
- [ ] Testar restore de backup
- [ ] Revisar usuários/chaves não usadas

### Trimestral
- [ ] Security audit interno
- [ ] Penetration test (contratado)
- [ ] Review de políticas
- [ ] Treinamento de segurança

### Anual
- [ ] Certificado SSL renew
- [ ] Full security audit
- [ ] Disaster recovery drill
- [ ] Update documentation

---

**Status**: ⬜ Não iniciado | 🟡 Em andamento | ✅ Completo

**Data de Conclusão**: _____________  
**Responsável**: _____________  
**Assinatura**: _____________
