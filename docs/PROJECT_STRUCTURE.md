# 📁 Estrutura de Projeto - Padrão Enterprise

## Nova Estrutura Organizada

```
api-cheat-fivem/
│
├── 📄 package.json                 # Metadados do projeto
├── 📄 .env                         # Variáveis de ambiente (NÃO versionado)
├── 📄 .env.example                 # Template de .env
├── 📄 .gitignore                   # Arquivos ignorados no git
├── 📄 server.js                    # Entry point principal
│
├── 📚 docs/                        # Documentação
│   ├── SECURITY.md                 # Guia de segurança
│   ├── DEPLOYMENT.md               # Guia de deploy
│   ├── API.md                      # Documentação da API
│   ├── ARCHITECTURE.md             # Arquitetura do sistema
│   ├── CONTRIBUTING.md             # Guia de contribuição
│   └── CHANGELOG.md                # Histórico de mudanças
│
├── 📂 src/                         # Código fonte
│   │
│   ├── app.js                      # Aplicação Express
│   ├── index.js                    # Exports principais
│   │
│   ├── 📂 config/                  # Configurações centralizadas
│   │   ├── constants.js            # Constantes da aplicação
│   │   ├── database.config.js      # Configuração do banco
│   │   ├── security.config.js      # Configuração de segurança
│   │   └── server.config.js        # Configuração do servidor
│   │
│   ├── 📂 core/                    # Funcionalidade central
│   │   ├── database.js             # Inicialização do banco
│   │   ├── logger.js               # Sistema de logging
│   │   └── validator.js            # Validação de entrada
│   │
│   ├── 📂 middleware/              # Middlewares Express
│   │   ├── auth.middleware.js      # Autenticação JWT
│   │   ├── error.middleware.js     # Tratamento de erros
│   │   ├── logger.middleware.js    # Logging de requisições
│   │   ├── role.middleware.js      # Verificação de role
│   │   ├── security.middleware.js  # Headers de segurança
│   │   ├── rate-limit.middleware.js# Rate limiting
│   │   └── index.js                # Exports de middlewares
│   │
│   ├── 📂 controllers/             # Controllers (lógica de requisição)
│   │   ├── auth.controller.js      # Controle de autenticação
│   │   ├── key.controller.js       # Controle de API keys
│   │   ├── license.controller.js   # Controle de licenças
│   │   ├── admin.controller.js     # Controle administrativo
│   │   └── health.controller.js    # Health check
│   │
│   ├── 📂 services/                # Serviços (lógica de negócio)
│   │   ├── auth.service.js         # Serviço de autenticação
│   │   ├── key.service.js          # Serviço de API keys
│   │   ├── license.service.js      # Serviço de licenças
│   │   ├── user.service.js         # Serviço de usuários
│   │   └── audit.service.js        # Serviço de auditoria
│   │
│   ├── 📂 routes/                  # Rotas da API
│   │   ├── index.js                # Agregador de rotas
│   │   ├── auth.routes.js          # Rotas de autenticação
│   │   ├── keys.routes.js          # Rotas de API keys
│   │   ├── licenses.routes.js      # Rotas de licenças
│   │   └── admin.routes.js         # Rotas administrativas
│   │
│   ├── 📂 utils/                   # Funções utilitárias
│   │   ├── crypto.js               # Funções de criptografia
│   │   ├── hash.js                 # Hashing (bcrypt, etc)
│   │   ├── jwt.js                  # Funções JWT
│   │   ├── date.js                 # Manipulação de datas
│   │   ├── string.js               # Manipulação de strings
│   │   ├── error.js                # Classes de erro
│   │   └── constants.js            # Constantes globais
│   │
│   ├── 📂 models/                  # Esquemas de dados
│   │   ├── user.model.js           # Modelo de usuário
│   │   ├── key.model.js            # Modelo de API key
│   │   ├── license.model.js        # Modelo de licença
│   │   └── activation.model.js     # Modelo de ativação
│   │
│   └── 📂 types/                   # TypeScript definitions (opcional)
│       ├── auth.types.js           # Tipos de autenticação
│       ├── api.types.js            # Tipos de API
│       └── database.types.js       # Tipos de banco
│
├── 📂 tests/                       # Testes
│   ├── unit/                       # Testes unitários
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── integration/                # Testes de integração
│   │   ├── auth.test.js
│   │   ├── keys.test.js
│   │   └── licenses.test.js
│   ├── security/                   # Testes de segurança
│   │   └── security.test.js
│   └── fixtures/                   # Dados de teste
│
├── 📂 scripts/                     # Scripts úteis
│   ├── init-db.js                  # Inicializar banco
│   ├── seed-data.js                # Popular banco com dados
│   ├── reset-db.js                 # Resetar banco
│   └── generate-secret.js          # Gerar secretos
│
├── 📂 data/                        # Dados (ignorado no git)
│   └── auth.db                     # Banco de dados SQLite
│
├── 📂 logs/                        # Logs da aplicação (ignorado no git)
│   ├── error.log
│   ├── access.log
│   └── security.log
│
├── 📂 backups/                     # Backups de banco (ignorado no git)
│   └── auth.db.backup-2024-01-15
│
└── 📂 client/                      # Cliente de exemplo
    ├── javascript-client.js
    └── README.md

```

## Convenções de Nomenclatura

### Arquivos

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Config | `*.config.js` | `database.config.js` |
| Service | `*.service.js` | `auth.service.js` |
| Controller | `*.controller.js` | `user.controller.js` |
| Middleware | `*.middleware.js` | `auth.middleware.js` |
| Routes | `*.routes.js` | `auth.routes.js` |
| Models | `*.model.js` | `user.model.js` |
| Utils | `*.js` (descritivo) | `crypto.js`, `hash.js` |
| Tests | `*.test.js` ou `*.spec.js` | `auth.service.test.js` |

### Diretórios

| Tipo | Nome | Maiúsculas | Propósito |
|------|------|-----------|-----------|
| Código fonte | `src/` | lowercase | Código principal |
| Testes | `tests/` | lowercase | Testes automatizados |
| Documentação | `docs/` | lowercase | Documentação |
| Scripts | `scripts/` | lowercase | Scripts de utilidade |
| Dados | `data/` | lowercase | Banco de dados, arquivos |
| Logs | `logs/` | lowercase | Arquivos de log |
| Configuração | `src/config/` | lowercase | Arquivos de config |
| Núcleo | `src/core/` | lowercase | Funcionalidade central |
| Controladores | `src/controllers/` | lowercase | Controllers |
| Serviços | `src/services/` | lowercase | Services |
| Rotas | `src/routes/` | lowercase | Definição de rotas |
| Utilitários | `src/utils/` | lowercase | Funções helper |
| Modelos | `src/models/` | lowercase | Esquemas de dados |

### Variáveis e Funções

```javascript
// Constantes
const MAX_LOGIN_ATTEMPTS = 5;
const DATABASE_PATH = './data/auth.db';

// Variáveis
let currentUser = null;
let sessionTimeout = 3600;

// Funções e métodos
function validateEmail() {}
async function authenticateUser() {}
class UserService {}
```

### Classes

```javascript
// PascalCase para classes
class AuthService {}
class DatabaseConnection {}
class ValidationError extends Error {}
```

## Importações Organizadas

### ❌ Errado
```javascript
const authService = require('../../../services/auth.service.js');
const {database} = require('../../../../core/database.js');
```

### ✅ Correto
```javascript
const AuthService = require('@services/auth.service');
const {database} = require('@core/database');
```

## Estrutura de Arquivo Padrão

### Service
```javascript
/**
 * Serviço de Autenticação
 * Contém toda lógica de negócio relacionada a auth
 */

class AuthService {
  /**
   * Registra novo usuário
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} Usuário criado
   */
  static async register(username, email, password) {
    // Implementação
  }
}

module.exports = AuthService;
```

### Controller
```javascript
/**
 * Controller de Autenticação
 * Responsável por requisições HTTP de autenticação
 */

const AuthService = require('@services/auth.service');

class AuthController {
  /**
   * POST /api/auth/register
   */
  static async register(req, res, next) {
    try {
      const {username, email, password} = req.body;
      const user = await AuthService.register(username, email, password);
      res.status(201).json({code: 'SUCCESS', data: user});
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
```

### Routes
```javascript
/**
 * Rotas de Autenticação
 */

const express = require('express');
const AuthController = require('@controllers/auth.controller');
const {authLimiter} = require('@middleware/rate-limit.middleware');

const router = express.Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);

module.exports = router;
```

## .gitignore Profissional

```
# Variáveis de ambiente
.env
.env.local
.env.*.local

# Dependências
node_modules/
package-lock.json

# Dados sensíveis
/data/
/logs/
/backups/
*.db
*.sqlite

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Build
/dist/
/build/
*.tgz

# Testes
/coverage/
.nyc_output/

# Logs do sistema
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

## Vantagens desta Estrutura

✅ **Escalabilidade**: Fácil adicionar novos features  
✅ **Manutenibilidade**: Código organizado e fácil de encontrar  
✅ **Testabilidade**: Separação clara de responsabilidades  
✅ **Reusabilidade**: Services podem ser reutilizados  
✅ **Profissionalismo**: Segue padrões da indústria  
✅ **Onboarding**: Novos devs acham código facilmente  
✅ **CI/CD**: Fácil automatizar testes e deploy  

## Próximos Passos

1. Criar diretórios conforme estrutura acima
2. Mover arquivos com novos nomes
3. Atualizar imports em todo projeto
4. Testar tudo funciona
5. Commit na branch de reorganização
6. Merge para main

---

**Criado em**: 2024-01-15  
**Versão**: 1.0  
**Padrão**: Node.js Enterprise
