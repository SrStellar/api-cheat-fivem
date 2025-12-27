# 🔐 KeyAuth - Sistema Completo de Autenticação

Um sistema enterprise de verificação de chaves e gerenciamento de licenças similar ao KeyAuth.cc

## ⚡ Início Rápido

```bash
# 1. Instalar
npm install

# 2. Iniciar servidor
npm run dev

# 3. Executar testes
npm test
```

Servidor rodando em `http://localhost:3000`

## 📚 Documentação

- **[QUICKSTART.md](QUICKSTART.md)** - Guia rápido (5 minutos)
- **[README_FULL.md](README_FULL.md)** - Documentação completa
- **[EXEMPLOS.js](EXEMPLOS.js)** - Exemplos de código

## 🌟 Recursos

✅ Autenticação com JWT  
✅ Geração de chaves de API  
✅ Sistema de licenças multi-dispositivo  
✅ Rate limiting e proteção contra força bruta  
✅ Logs detalhados e auditoria  
✅ Painel de administração  
✅ Cliente JavaScript incluído  

## �� Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário |
| POST | `/api/auth/login` | Fazer login |
| POST | `/api/validate/key` | Validar chave (público) |
| POST | `/api/keys/create` | Criar chave de API |
| GET | `/api/keys/list` | Listar chaves |
| POST | `/api/licenses/create` | Criar licença |
| GET | `/api/admin/stats` | Estatísticas (admin) |

## 📊 Arquitetura

```
API REST
├── Autenticação (JWT)
├── Chaves de API
├── Licenças
├── Ativações
└── Auditoria
```

## 🔒 Segurança

- Bcrypt para senhas
- SHA-256 para chaves
- Rate limiting
- CORS + Helmet
- Whitelist de IP

## 📝 Licença

MIT
