# 🔐 KeyAuth - Sistema Completo de Verificação de Chaves

Um sistema enterprise-grade de autenticação e gerenciamento de licenças similar ao [KeyAuth.cc](https://keyauth.cc), desenvolvido com Node.js e Express.

## 🌟 Recursos Principais

✅ **Autenticação Robusta**
- Registro e login de usuários com validação
- Tokens JWT com expiração configurável
- Proteção contra força bruta (rate limiting)
- Bloqueio de conta após múltiplas tentativas falhas

✅ **Gerenciamento de Chaves de API**
- Gerar chaves de API seguras e únicas
- Listar, desativar e monitorar chaves
- Whitelist de IPs
- Rastreamento de uso e última utilização
- Expiração automática

✅ **Sistema de Licenças**
- Gerar licenças de produto
- Ativar licenças em múltiplos dispositivos
- Controlar limite máximo de ativações
- Revogar ativações individuais
- Expiração de licenças

✅ **Segurança**
- Criptografia SHA-256 para chaves
- Bcrypt para senhas
- Validação de IP
- Logs detalhados de todas as ações
- Proteção com Helmet e CORS

✅ **Painel de Administração**
- Listar todos os usuários
- Ativar/desativar usuários
- Conceder/remover privilégios de admin
- Visualizar logs completos
- Estatísticas do sistema

## 📋 Requisitos

- Node.js 14.0+
- npm ou yarn

## 🚀 Instalação e Inicialização

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Edite `.env` com suas configurações:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua_chave_secreta_super_segura
DATABASE_PATH=./data/database.db
MASTER_KEY=admin_master_key
API_KEY_PREFIX=KA
SESSION_TIMEOUT=3600000
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=900000
```

### 3. Iniciar o servidor
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📚 API Endpoints

### 🔓 Autenticação (Públicos)

#### Registrar usuário
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "seu_usuario",
  "email": "seu_email@example.com",
  "password": "senha_forte_123",
  "confirmPassword": "senha_forte_123"
}
```

**Resposta:**
```json
{
  "code": "REGISTRATION_SUCCESS",
  "message": "Usuário registrado com sucesso",
  "data": {
    "userId": "uuid-aqui",
    "username": "seu_usuario",
    "email": "seu_email@example.com",
    "createdAt": "2025-12-27T10:00:00.000Z"
  }
}
```

#### Fazer login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "seu_usuario",
  "password": "senha_forte_123"
}
```

**Resposta:**
```json
{
  "code": "LOGIN_SUCCESS",
  "message": "Login realizado com sucesso",
  "data": {
    "userId": "uuid-aqui",
    "username": "seu_usuario",
    "email": "seu_email@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

#### Renovar token
```bash
POST /api/auth/refresh
Authorization: Bearer seu_token_jwt
```

### 🔑 Validação de Chaves (Públicos)

#### Validar chave de API
```bash
POST /api/validate/key
Content-Type: application/json

{
  "key": "KA_abc123_def456_789ghi",
  "type": "api"
}
```

**Resposta:**
```json
{
  "code": "VALIDATION_SUCCESS",
  "message": "Chave válida",
  "data": {
    "keyId": "uuid-aqui",
    "userId": "uuid-aqui",
    "username": "seu_usuario",
    "name": "Minha Chave",
    "usageCount": 42
  }
}
```

#### Validar licença
```bash
POST /api/validate/key
Content-Type: application/json

{
  "key": "AAAA-BBBB-CCCC-DDDD",
  "type": "license",
  "deviceId": "device-001",
  "hwid": "hardware-id-hash"
}
```

**Resposta:**
```json
{
  "code": "VALIDATION_SUCCESS",
  "message": "Chave válida",
  "data": {
    "licenseId": "uuid-aqui",
    "licenseKey": "AAAA-BBBB-CCCC-DDDD",
    "productId": "produto-fivem",
    "userId": "uuid-aqui",
    "username": "seu_usuario",
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "activationId": "uuid-aqui"
  }
}
```

### 🔐 Gerenciamento de Chaves de API (Requer Autenticação)

#### Criar chave de API
```bash
POST /api/keys/create
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "name": "Minha Chave",
  "description": "Chave para integração com meu app",
  "expiresIn": 7776000000
}
```

**Nota:** `expiresIn` é em milissegundos (7776000000 = 90 dias)

**Resposta:**
```json
{
  "code": "KEY_CREATED",
  "message": "Chave de API criada com sucesso",
  "data": {
    "keyId": "uuid-aqui",
    "key": "KA_abc123_def456_789ghi",
    "name": "Minha Chave",
    "description": "Chave para integração com meu app",
    "createdAt": "2025-12-27T10:00:00.000Z",
    "expiresAt": "2026-03-25T10:00:00.000Z"
  }
}
```

⚠️ **IMPORTANTE:** A chave completa é exibida apenas uma vez! Salve em local seguro.

#### Listar chaves de API
```bash
GET /api/keys/list
Authorization: Bearer seu_token_jwt
```

#### Desativar chave de API
```bash
POST /api/keys/{keyId}/deactivate
Authorization: Bearer seu_token_jwt
```

#### Obter estatísticas de chave
```bash
GET /api/keys/{keyId}/stats
Authorization: Bearer seu_token_jwt
```

### 📜 Gerenciamento de Licenças (Requer Autenticação)

#### Criar licença
```bash
POST /api/licenses/create
Authorization: Bearer seu_token_jwt
Content-Type: application/json

{
  "productId": "produto-fivem",
  "maxActivations": 2,
  "expiresIn": 2592000000
}
```

**Resposta:**
```json
{
  "code": "LICENSE_CREATED",
  "message": "Licença criada com sucesso",
  "data": {
    "licenseId": "uuid-aqui",
    "licenseKey": "AAAA-BBBB-CCCC-DDDD",
    "productId": "produto-fivem",
    "createdAt": "2025-12-27T10:00:00.000Z",
    "expiresAt": "2026-01-26T10:00:00.000Z",
    "maxActivations": 2
  }
}
```

#### Listar licenças
```bash
GET /api/licenses/list
Authorization: Bearer seu_token_jwt
```

#### Desativar licença
```bash
POST /api/licenses/{licenseId}/deactivate
Authorization: Bearer seu_token_jwt
```

#### Obter estatísticas de licença
```bash
GET /api/licenses/{licenseId}/stats
Authorization: Bearer seu_token_jwt
```

**Resposta:**
```json
{
  "code": "STATS_RETRIEVED",
  "message": "Estatísticas obtidas com sucesso",
  "data": {
    "productId": "produto-fivem",
    "createdAt": "2025-12-27T10:00:00.000Z",
    "expiresAt": "2026-01-26T10:00:00.000Z",
    "maxActivations": 2,
    "currentActivations": 1,
    "activations": [
      {
        "id": "uuid-aqui",
        "device_id": "device-001",
        "hwid": "hash-do-hardware",
        "created_at": "2025-12-27T10:05:00.000Z",
        "last_check": "2025-12-27T15:30:00.000Z",
        "is_active": 1
      }
    ]
  }
}
```

#### Revogar ativação
```bash
POST /api/licenses/{licenseId}/activations/{activationId}/revoke
Authorization: Bearer seu_token_jwt
```

### 👨‍💼 Painel de Administração (Requer Admin)

#### Listar logs
```bash
GET /api/admin/logs?limit=100&offset=0
Authorization: Bearer seu_token_jwt_admin
```

#### Obter estatísticas do sistema
```bash
GET /api/admin/stats
Authorization: Bearer seu_token_jwt_admin
```

**Resposta:**
```json
{
  "code": "STATS_RETRIEVED",
  "message": "Estatísticas obtidas com sucesso",
  "data": {
    "totalUsers": 42,
    "activeApiKeys": 128,
    "activeLicenses": 256,
    "activeActivations": 512,
    "totalApiCalls": 100000
  }
}
```

#### Listar usuários
```bash
GET /api/admin/users
Authorization: Bearer seu_token_jwt_admin
```

#### Ativar/desativar privilégios de admin
```bash
POST /api/admin/users/{userId}/toggle-admin
Authorization: Bearer seu_token_jwt_admin
```

#### Desativar usuário
```bash
POST /api/admin/users/{userId}/deactivate
Authorization: Bearer seu_token_jwt_admin
```

#### Ativar usuário
```bash
POST /api/admin/users/{userId}/activate
Authorization: Bearer seu_token_jwt_admin
```

## 🖥️ Cliente JavaScript

Use o cliente JavaScript fornecido para integrar com seu aplicativo:

```javascript
// Importar cliente
const KeyAuthClient = require('./client');

// Criar instância
const client = new KeyAuthClient('http://localhost:3000');

// Registro
const user = await client.register('usuario', 'email@example.com', 'senha123', 'senha123');

// Login
const login = await client.login('usuario', 'senha123');

// Validar chave de API (público)
const validation = await client.validateApiKey('KA_abc123_def456_789ghi');

// Validar licença (público)
const license = await client.validateLicense('AAAA-BBBB-CCCC-DDDD', 'device-001', 'hwid-001');

// Criar chave de API
const key = await client.createApiKey('Minha Chave', 'Descrição');

// Listar chaves
const keys = await client.listApiKeys();

// Criar licença
const newLicense = await client.createLicense('produto-id', 2);

// Listar licenças
const licenses = await client.listLicenses();
```

## 🧪 Executar Testes

Um suite completo de testes está incluído:

```bash
npm test
```

O script de testes faz:
1. ✅ Registro de novo usuário
2. ✅ Login
3. ✅ Criação de chave de API
4. ✅ Listagem de chaves
5. ✅ Validação de chave de API
6. ✅ Criação de licença
7. ✅ Validação de licença com ativação
8. ✅ Obtenção de estatísticas

## 📁 Estrutura de Diretórios

```
api-cheat-fivem/
├── src/
│   ├── app.js                 # Aplicação Express
│   ├── database.js            # Inicialização do SQLite
│   ├── keyGenerator.js        # Gerador de chaves e criptografia
│   ├── authService.js         # Serviço de autenticação
│   ├── keyService.js          # Serviço de chaves e licenças
│   ├── logService.js          # Serviço de logging
│   ├── middleware/
│   │   ├── authenticateToken.js
│   │   ├── requireAdmin.js
│   │   ├── errorHandler.js
│   │   └── loggerMiddleware.js
│   └── routes/
│       ├── auth.js            # Rotas de autenticação
│       ├── validation.js      # Rotas de validação pública
│       ├── apiKeys.js         # Rotas de chaves de API
│       ├── licenses.js        # Rotas de licenças
│       └── admin.js           # Rotas de administração
├── tests/
│   └── test.js               # Suite de testes
├── data/
│   └── database.db           # Banco de dados SQLite
├── server.js                 # Ponto de entrada
├── client.js                 # Cliente JavaScript
├── package.json
├── .env                      # Variáveis de ambiente
└── README.md                 # Este arquivo
```

## 🔒 Segurança

- **Senhas:** Criptografadas com bcrypt (10 rounds)
- **Chaves de API:** Hash SHA-256, formato único com timestamp
- **Tokens:** JWT com segredo forte e expiração
- **Rate Limiting:** Proteção contra brute force
- **CORS:** Configurável por origem
- **Helmet:** Headers de segurança HTTP
- **Whitelist de IP:** Suportado em chaves de API

## 📊 Banco de Dados

O sistema usa **SQLite3** com as seguintes tabelas:

- **users** - Dados de usuários e autenticação
- **api_keys** - Chaves de API e metadados
- **licenses** - Licenças de produtos
- **activations** - Ativações de licenças por dispositivo
- **sessions** - Sessões de usuário
- **logs** - Auditoria completa de ações
- **failed_login_attempts** - Tentativas de login falhadas

## 🚀 Deploy em Produção

### Variáveis de ambiente obrigatórias:
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=uma_chave_super_segura_e_aleatoria
DATABASE_PATH=/var/lib/keyauth/database.db
MASTER_KEY=outra_chave_super_segura_e_aleatoria
```

### Recomendações:
1. Use um servidor web como Nginx como proxy reverso
2. Configure HTTPS/SSL
3. Faça backup regular do banco de dados
4. Monitore logs de erro
5. Configure rate limiting agressivo em produção
6. Use um firewall para proteger a API
7. Mantenha as dependências atualizadas

## 📞 Exemplos de Uso

### Exemplo 1: Validar chave em sua aplicação

```javascript
async function checkKey(apiKey) {
  const client = new KeyAuthClient('https://seu-servidor.com');
  
  try {
    const validation = await client.validateApiKey(apiKey);
    console.log('Usuário autorizado:', validation.data.username);
    // Conceder acesso
  } catch (error) {
    console.error('Chave inválida:', error.message);
    // Negar acesso
  }
}
```

### Exemplo 2: Sistema de licenças com múltiplas ativações

```javascript
async function activateLicense(licenseKey, deviceId, hwid) {
  const client = new KeyAuthClient('https://seu-servidor.com');
  
  try {
    const license = await client.validateLicense(licenseKey, deviceId, hwid);
    
    if (license.data) {
      console.log(`Licença ativa até: ${license.data.expiresAt}`);
      // Salvar activationId para depois revogar se necessário
      return license.data.activationId;
    }
  } catch (error) {
    if (error.message.includes('MAX_ACTIVATIONS')) {
      console.error('Limite de ativações atingido');
    }
  }
}
```

## 🐛 Troubleshooting

### Erro: "Banco de dados bloqueado"
- Reinicie o servidor
- Verifique se há outros processos usando o arquivo de banco de dados

### Erro: "Chave inválida"
- Verifique se a chave foi copiada corretamente
- Confirme se a chave não expirou
- Verifique se o IP está na whitelist

### Erro: "Limite de ativações atingido"
- Revogue ativações antigas
- Aumente o limite máximo de ativações

## 📝 Licença

MIT

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para abrir issues e pull requests.

## 📧 Suporte

Para suporte, abra uma issue no repositório.
