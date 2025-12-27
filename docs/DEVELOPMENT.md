# 🛠️ Guia de Desenvolvimento

## Ambiente de Desenvolvimento

### Instalação das dependências
```bash
npm install
```

### Iniciar com hot reload
```bash
npm run dev
```

Isso usa `nodemon` para reiniciar o servidor automaticamente quando há mudanças.

## Estrutura do Projeto

```
src/
├── app.js                  # Aplicação Express (rotas, middlewares)
├── database.js             # Inicialização do SQLite
├── keyGenerator.js         # Gerador e validador de chaves
├── authService.js          # Lógica de autenticação
├── keyService.js           # Lógica de chaves e licenças
├── logService.js           # Logging e auditoria
├── middleware/
│   ├── authenticateToken.js
│   ├── requireAdmin.js
│   ├── errorHandler.js
│   └── loggerMiddleware.js
└── routes/
    ├── auth.js
    ├── validation.js
    ├── apiKeys.js
    ├── licenses.js
    └── admin.js
```

## Adicionando Novas Rotas

### 1. Criar novo arquivo de rota
```javascript
// src/routes/novo.js
const express = require('express');
const router = express.Router();

router.get('/endpoint', (req, res) => {
  res.json({ message: 'Sucesso' });
});

module.exports = router;
```

### 2. Registrar no app.js
```javascript
app.use('/api/novo', authenticateToken, require('./routes/novo'));
```

## Adicionando Novos Serviços

### 1. Criar novo serviço
```javascript
// src/novoService.js
class NovoService {
  static async fazer() {
    return new Promise((resolve, reject) => {
      // Lógica aqui
      resolve({ resultado: 'ok' });
    });
  }
}

module.exports = NovoService;
```

### 2. Usar nas rotas
```javascript
const NovoService = require('../novoService');

router.get('/novo', async (req, res) => {
  try {
    const resultado = await NovoService.fazer();
    res.json(resultado);
  } catch (error) {
    next(error);
  }
});
```

## Testando a API

### Com cURL
```bash
# Registrar
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456","confirmPassword":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# Com token
curl -X GET http://localhost:3000/api/keys/list \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Com Postman
1. Importar `openapi.json` em Postman
2. Configurar variáveis de ambiente
3. Executar requisições

## Banco de Dados

### Visualizar dados
```bash
# Instalar sqlite3 cli (se não tiver)
apt-get install sqlite3

# Abrir banco
sqlite3 data/database.db

# Comandos úteis
.tables                    # Ver tabelas
SELECT * FROM users;       # Ver usuários
SELECT * FROM logs LIMIT 10;  # Ver últimos logs
.quit                      # Sair
```

### Resetar banco
```bash
rm data/database.db
# Reiniciar servidor para recriar
```

## Adicionando Middleware

### Criar novo middleware
```javascript
// src/middleware/novoMiddleware.js
const novoMiddleware = (req, res, next) => {
  // Fazer algo
  next();
};

module.exports = novoMiddleware;
```

### Usar middleware
```javascript
const novoMiddleware = require('./middleware/novoMiddleware');

// Global
app.use(novoMiddleware);

// Em rota específica
app.get('/rota', novoMiddleware, (req, res) => {});

// Em grupo de rotas
app.use('/api/grupo', novoMiddleware, require('./routes/grupo'));
```

## Variáveis de Ambiente

Importante: **NUNCA** commitar `.env` com senhas reais!

```env
PORT=3000                              # Porta do servidor
NODE_ENV=development                   # Ambiente
JWT_SECRET=chave_secreta_super_longa   # Segredo para JWT
DATABASE_PATH=./data/database.db       # Caminho do BD
MASTER_KEY=chave_mestre                # Chave mestre do admin
API_KEY_PREFIX=KA                      # Prefixo de chaves
SESSION_TIMEOUT=3600000                # Timeout de sessão (1h)
MAX_LOGIN_ATTEMPTS=5                   # Max tentativas de login
LOCKOUT_TIME=900000                    # Tempo de bloqueio (15min)
CORS_ORIGIN=*                          # Origem CORS
```

## Debugging

### Logs no console
```javascript
console.log('Info:', variavel);
console.error('Erro:', erro);
console.warn('Aviso:', aviso);
```

### Logs persistentes
O sistema já usa `LogService` para registrar ações. Veja os logs:

```javascript
const LogService = require('./logService');

LogService.logAction(userId, 'ACAO', 'recurso', 'STATUS', ip, userAgent);
```

### Debugar requisições
```javascript
app.use(morgan('dev')); // Já incluído no app.js
```

## Padrões de Código

### Services (Lógica de negócio)
```javascript
class MeuService {
  static async fazer(param1, param2) {
    return new Promise((resolve, reject) => {
      // Executar
      if (erro) {
        reject({ code: 'ERRO_CODE', message: 'Mensagem' });
      } else {
        resolve(resultado);
      }
    });
  }
}
```

### Routes (Endpoints)
```javascript
router.post('/endpoint', async (req, res, next) => {
  try {
    const resultado = await Servico.fazer(req.body);
    LogService.logAction(req.user?.userId, 'ACAO', 'recurso', 'SUCCESS');
    res.status(201).json({ code: 'SUCCESS', data: resultado });
  } catch (error) {
    LogService.logAction(req.user?.userId, 'ACAO', 'recurso', 'FAILED');
    if (error.code === 'KNOWN_ERROR') {
      return res.status(400).json({ code: error.code, message: error.message });
    }
    next(error);
  }
});
```

## Testes

### Executar testes
```bash
npm test
```

### Adicionar novo teste
```javascript
// tests/meuTeste.js
async function meuTeste() {
  const client = new KeyAuthClient('http://localhost:3000');
  
  try {
    // Fazer algo
    console.log('✅ Teste passou');
  } catch (error) {
    console.error('❌ Teste falhou:', error.message);
    process.exit(1);
  }
}
```

## Deploy em Produção

### Preparar para produção
```bash
# Instalar dependências de produção
npm install --production

# Definir variáveis de ambiente
export NODE_ENV=production
export JWT_SECRET=chave_super_segura_aleatorio
export DATABASE_PATH=/var/lib/keyauth/db.sqlite
```

### Com PM2 (recomendado)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar
pm2 start server.js --name keyauth

# Autostart
pm2 startup
pm2 save

# Monitorar
pm2 logs keyauth
```

### Com Docker (opcional)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

## Resolução de Problemas

### Porta já em uso
```bash
# Encontrar processo na porta 3000
lsof -i :3000

# Matar processo
kill -9 PID
```

### Banco de dados bloqueado
```bash
# Remover lock file (se existir)
rm data/database.db-wal
rm data/database.db-shm

# Reiniciar servidor
```

### Problemas com importações
```bash
# Limpar cache do Node
rm -rf node_modules package-lock.json
npm install
```

## Performance

### Índices de banco de dados
Os índices já foram criados para as consultas mais comuns:
- `api_keys(user_id)`
- `licenses(user_id)`
- `activations(license_id)`
- `sessions(user_id)`
- `logs(user_id)`

### Rate Limiting
Já está configurado para:
- Global: 100 requisições/15min
- Login: 5 requisições/15min
- Validação de chave: 30 requisições/1min

### Cache
Considere adicionar Redis para cache se escalar:
```javascript
const redis = require('redis');
const client = redis.createClient();

// Usar antes de DB queries
const cached = await client.get(key);
if (cached) return JSON.parse(cached);

// Depois de DB query
await client.set(key, JSON.stringify(result), 'EX', 3600);
```

## Contribuindo

1. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
2. Faça suas mudanças
3. Teste tudo (`npm test`)
4. Commita (`git commit -m 'Adiciona nova funcionalidade'`)
5. Push para branch (`git push origin feature/nova-funcionalidade`)
6. Abra um Pull Request

## Recursos Úteis

- [Express.js Docs](https://expressjs.com/)
- [SQLite Docs](https://www.sqlite.org/docs.html)
- [JWT](https://jwt.io/)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Postman](https://www.postman.com/)

---

**Precisa de ajuda?** Abra uma issue no repositório!
