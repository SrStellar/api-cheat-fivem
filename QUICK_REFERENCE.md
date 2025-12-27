## 🚀 INÍCIO RÁPIDO - ÍNDICE

**Status**: ✅ Projeto Reorganizado | ✅ Profissional | ✅ Production-Ready

---

### 📍 Você está aqui?

Este é o seu novo **README.md na raiz do projeto**. Ele aponta para toda a documentação organizada.

---

### 📚 Documentação Completa (em `/docs`)

| Documento | Conteúdo |
|-----------|----------|
| **[README.md](docs/README.md)** | 📖 Documentação Principal - Comece aqui |
| **[PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)** | 🏗️ Estrutura detalhada do projeto |
| **[SECURITY.md](docs/SECURITY.md)** | 🔐 Guia de segurança e proteções |
| **[QUICKSTART.md](docs/QUICKSTART.md)** | ⚡ Começar em 5 minutos |
| **[FULL_GUIDE.md](docs/FULL_GUIDE.md)** | 📚 Guia completo |
| **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** | 🛠️ Guia de desenvolvimento |
| **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** | ✅ Checklist pré-deploy |
| **[openapi.json](docs/openapi.json)** | 🔌 Especificação OpenAPI |

---

### 📁 Estrutura do Projeto

```
api-cheat-fivem/
├── docs/                    → 📚 Documentação
├── src/                     → 💻 Código Fonte
│   ├── config/             → ⚙️  Configurações
│   ├── core/               → 🔧 Núcleo
│   ├── services/           → 🎯 Serviços
│   ├── middleware/         → 🛡️  Middlewares
│   ├── routes/             → 📍 Rotas
│   ├── utils/              → 🔨 Utilitários
│   └── app.js              → Express App
├── tests/                   → 🧪 Testes
├── scripts/                 → 📜 Scripts
├── client/                  → 📱 Cliente
└── package.json             → 📦 Dependências
```

---

### 🚀 Começar Agora

#### 1. Instale Dependências
```bash
npm install
```

#### 2. Configure Variáveis
```bash
cp .env.example .env
# Edite .env com seus valores
```

#### 3. Inicie em Desenvolvimento
```bash
npm run dev
```

#### 4. Teste Segurança
```bash
npm run test:security
```

---

### 📊 Convenções de Nomenclatura

- `*.service.js` → Serviços de negócio
- `*.controller.js` → Controllers HTTP
- `*.middleware.js` → Middlewares Express
- `*.routes.js` → Definição de rotas
- `*.model.js` → Esquemas de dados
- `*.config.js` → Arquivos de configuração

---

### 🎯 Path Aliases

Use imports simplificados:

```javascript
// ✅ Novo (Simples)
const authService = require('@services/auth.service');

// ❌ Antigo (Complexo)
const authService = require('../../../services/auth.service');
```

**Aliases disponíveis:**
- `@config` - `src/config`
- `@core` - `src/core`
- `@services` - `src/services`
- `@controllers` - `src/controllers`
- `@middleware` - `src/middleware`
- `@routes` - `src/routes`
- `@utils` - `src/utils`
- `@models` - `src/models`
- `@types` - `src/types`

---

### 📝 Scripts Disponíveis

```bash
npm start               # Produção
npm run dev           # Desenvolvimento (com hot reload)
npm test              # Testes unitários
npm run test:security # Testes de segurança
npm audit             # Audit de vulnerabilidades
npm audit fix         # Corrigir vulnerabilidades
npm run reorganize    # Script de reorganização
npm run update-imports# Atualizar imports
```

---

### 🔐 Camadas de Segurança

1. **Validação** - Input validation rigorosa
2. **Rate Limiting** - 5 níveis diferentes
3. **Headers** - HSTS, CSP, X-Frame-Options
4. **Autenticação** - JWT com bcrypt
5. **Detecção** - SQL Injection, XSS, XXE
6. **Auditoria** - Logging completo
7. **Criptografia** - AES-256-GCM
8. **Timing Attack** - Proteção integrada

👉 [Ver SECURITY.md](docs/SECURITY.md) para detalhes

---

### 📋 Endpoints da API

#### 🔑 Autenticação
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

#### 🔐 Chaves API
- `GET /api/keys` - Listar
- `POST /api/keys` - Criar
- `PUT /api/keys/:id` - Atualizar
- `DELETE /api/keys/:id` - Deletar

#### 📜 Licenças
- `GET /api/licenses` - Listar
- `POST /api/licenses` - Criar
- `PUT /api/licenses/:id` - Atualizar
- `DELETE /api/licenses/:id` - Deletar

#### 🛠️ Admin
- `GET /api/admin/users` - Listar usuários
- `GET /api/admin/logs` - Ver logs

👉 [Ver README.md](docs/README.md) para detalhes completos

---

### 🧪 Testes

```bash
# Testes de segurança
npm run test:security

# Testes unitários (quando disponíveis)
npm test

# Audit de dependências
npm audit
```

---

### 🚀 Deploy

1. Leia [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)
2. Configure variáveis de ambiente de produção
3. Execute testes de segurança
4. Faça deploy com confiança!

---

### 📞 Precisa de Ajuda?

- 📖 Documentação: Veja `/docs`
- 🔍 Estrutura: [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)
- 🛡️ Segurança: [SECURITY.md](docs/SECURITY.md)
- ⚡ Rápido: [QUICKSTART.md](docs/QUICKSTART.md)

---

### ✨ Próximos Passos

1. ✅ Instale dependências: `npm install`
2. ✅ Configure .env: `cp .env.example .env`
3. ✅ Inicie dev: `npm run dev`
4. ✅ Teste: `npm run test:security`
5. ✅ Desenvolva!

---

**Versão**: 1.0.0  
**Status**: ✅ Production Ready  
**Última Atualização**: 2024-01-15

🎉 **Bem-vindo ao seu projeto profissional!** 🎉
