#!/usr/bin/env node

/**
 * Script de Reorganização de Projeto
 * Move arquivos para estrutura enterprise
 */

const fs = require('fs');
const path = require('path');

const moves = [
  // Config
  {from: './src/config/securityConfig.js', to: './src/config/security.config.js'},
  
  // Core
  {from: './src/database.js', to: './src/core/database.js'},
  {from: './src/validator.js', to: './src/core/validator.js'},
  
  // Services
  {from: './src/authService.js', to: './src/services/auth.service.js'},
  {from: './src/keyService.js', to: './src/services/key.service.js'},
  {from: './src/keyGenerator.js', to: './src/utils/key-generator.js'},
  {from: './src/logService.js', to: './src/services/audit.service.js'},
  
  // Middlewares
  {from: './src/middleware/authenticateToken.js', to: './src/middleware/auth.middleware.js'},
  {from: './src/middleware/requireAdmin.js', to: './src/middleware/role.middleware.js'},
  {from: './src/middleware/loggerMiddleware.js', to: './src/middleware/logger.middleware.js'},
  {from: './src/middleware/errorHandler.js', to: './src/middleware/error.middleware.js'},
  {from: './src/middleware/securityMiddleware.js', to: './src/middleware/security.middleware.js'},
  
  // Routes
  {from: './src/routes/auth.js', to: './src/routes/auth.routes.js'},
  {from: './src/routes/apiKeys.js', to: './src/routes/keys.routes.js'},
  {from: './src/routes/licenses.js', to: './src/routes/licenses.routes.js'},
  {from: './src/routes/admin.js', to: './src/routes/admin.routes.js'},
  {from: './src/routes/validation.js', to: './src/routes/validation.routes.js'},
  
  // Docs
  {from: './README.md', to: './docs/README.md'},
  {from: './README_FULL.md', to: './docs/FULL_GUIDE.md'},
  {from: './SECURITY.md', to: './docs/SECURITY.md'},
  {from: './DESENVOLVIMENTO.md', to: './docs/DEVELOPMENT.md'},
  {from: './QUICKSTART.md', to: './docs/QUICKSTART.md'},
  {from: './DEPLOYMENT_CHECKLIST.md', to: './docs/DEPLOYMENT_CHECKLIST.md'},
  {from: './EXEMPLOS.js', to: './docs/EXAMPLES.js'},
  
  // Client
  {from: './client.js', to: './client/javascript-client.js'},
  {from: './openapi.json', to: './docs/openapi.json'},
  
  // Tests
  {from: './tests/security.test.js', to: './tests/security/security.test.js'},
];

console.log('🔄 Reorganizando projeto...\n');

let moved = 0;
let skipped = 0;
let errors = 0;

moves.forEach(({from, to}) => {
  const fromPath = path.resolve(from);
  const toPath = path.resolve(to);
  
  // Pular se origem não existe
  if (!fs.existsSync(fromPath)) {
    console.log(`⏭️  SKIP: ${from} (não existe)`);
    skipped++;
    return;
  }
  
  // Pular se destino já existe
  if (fs.existsSync(toPath)) {
    console.log(`⏭️  SKIP: ${to} (já existe)`);
    skipped++;
    return;
  }
  
  try {
    // Criar diretório se não existir
    const dir = path.dirname(toPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {recursive: true});
    }
    
    // Mover arquivo
    fs.renameSync(fromPath, toPath);
    console.log(`✅ MOVE: ${from} → ${to}`);
    moved++;
  } catch (error) {
    console.log(`❌ ERROR: ${from} → ${to}: ${error.message}`);
    errors++;
  }
});

console.log(`\n${'═'.repeat(60)}`);
console.log(`📊 Resultado:`);
console.log(`  ✅ Movidos: ${moved}`);
console.log(`  ⏭️  Pulados: ${skipped}`);
console.log(`  ❌ Erros: ${errors}`);
console.log(`${'═'.repeat(60)}`);

if (errors === 0) {
  console.log('\n✨ Reorganização concluída com sucesso!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Alguns erros ocorreram.\n');
  process.exit(1);
}
