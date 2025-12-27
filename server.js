#!/usr/bin/env node

/**
 * 🚀 KeyAuth - API de Autenticação e Licenças
 * Entry point principal da aplicação
 */

// Configurar path aliases ANTES de carregar qualquer outro módulo
require('module-alias/register');

// Variáveis de ambiente
require('dotenv').config();

// Importações
const app = require('./src/app');
const serverConfig = require('./src/config/server.config');
const database = require('./src/core/database');

// Banco de dados já inicializado automaticamente ao importar

// Iniciar servidor
const server = app.listen(serverConfig.port, serverConfig.host, () => {
  console.log('\n' + '═'.repeat(60));
  console.log(`🚀 KeyAuth API rodando`);
  console.log(`📍 ${serverConfig.host}:${serverConfig.port}`);
  console.log(`🌍 http://${serverConfig.host}:${serverConfig.port}`);
  console.log(`📝 Ambiente: ${serverConfig.nodeEnv}`);
  console.log('═'.repeat(60) + '\n');
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} recebido, encerrando gracefully...`);
  server.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });
  
  // Force shutdown após 10 segundos
  setTimeout(() => {
    console.error('❌ Falha ao encerrar, forçando saída...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

module.exports = server;

