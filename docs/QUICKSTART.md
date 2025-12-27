# Guia Rápido de Inicialização

Bem-vindo ao KeyAuth! Este guia irá ajudá-lo a iniciar em minutos.

## 5 Passos para Começar

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Verificar Configurações
O arquivo `.env` já vem pré-configurado. Em produção, altere:
- `JWT_SECRET` - Chave para tokens JWT
- `DATABASE_PATH` - Caminho do banco de dados
- `PORT` - Porta do servidor

### 3️⃣ Iniciar Servidor
```bash
npm run dev
```

Você verá:
```
🚀 Servidor KeyAuth rodando em http://localhost:3000
```

### 4️⃣ Executar Testes
Em outro terminal:
```bash
npm test
```

### 5️⃣ Começar a Usar!

#### Registrar usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "seu_usuario",
    "email": "email@example.com",
    "password": "senha123",
    "confirmPassword": "senha123"
  }'
```

#### Fazer login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "seu_usuario",
    "password": "senha123"
  }'
```

#### Criar chave de API
```bash
curl -X POST http://localhost:3000/api/keys/create \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Chave",
    "description": "Descrição opcional"
  }'
```

#### Validar chave (Público - nenhuma autenticação necessária)
```bash
curl -X POST http://localhost:3000/api/validate/key \
  -H "Content-Type: application/json" \
  -d '{
    "key": "KA_sua_chave_aqui",
    "type": "api"
  }'
```

## Próximos Passos

1. Leia o `README_FULL.md` para documentação completa
2. Veja os exemplos em `EXEMPLOS.js`
3. Use o cliente JavaScript em `client.js` para suas aplicações
4. Configure em produção com HTTPS e banco de dados persistente

## Estrutura Básica

```
├── src/
│   ├── app.js           ← Aplicação Express
│   ├── database.js      ← Banco de dados
│   └── routes/          ← Endpoints da API
├── client.js            ← Cliente JavaScript
├── server.js            ← Inicializador
├── EXEMPLOS.js          ← Exemplos de uso
└── tests/test.js        ← Testes automatizados
```

## Dúvidas Frequentes

**P: Onde as chaves são armazenadas?**
R: Os hashes das chaves são armazenados no banco de dados SQLite. A chave completa nunca é armazenada.

**P: As chaves expiram?**
R: Sim, você pode definir `expiresIn` ao criar. Se não definir, a chave nunca expira.

**P: Posso usar em produção?**
R: Sim! Configure HTTPS, altere as variáveis de ambiente e faça backup do banco de dados.

**P: Como faço backup do banco de dados?**
R: Faça backup do arquivo em `data/database.db`. É um arquivo SQLite normal.

## Suporte

- 📖 Leia `README_FULL.md` para documentação completa
- 💻 Veja `EXEMPLOS.js` para casos de uso
- 🐛 Abra uma issue se encontrar problemas

---

**Pronto para começar?** Execute:
```bash
npm install && npm run dev
```
