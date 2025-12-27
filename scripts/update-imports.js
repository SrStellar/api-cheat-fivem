#!/usr/bin/env node

/**
 * Script para Atualizar Imports
 * Atualiza require() para a nova estrutura
 */

const fs = require('fs');
const path = require('path');

const importMap = {
  // Antigos → Novos
  "require('@core/database')": "require('@core/database')",
  "require('@core/database')": "require('@core/database')",
  "require('@core/database')": "require('@core/database')",
  
  "require('@core/validator')": "require('@core/validator')",
  "require('@core/validator')": "require('@core/validator')",
  
  "require('@services/auth.service')": "require('@services/auth.service')",
  "require('@services/auth.service')": "require('@services/auth.service')",
  "require('@services/key.service')": "require('@services/key.service')",
  "require('@services/key.service')": "require('@services/key.service')",
  "require('@services/audit.service')": "require('@services/audit.service')",
  "require('@services/audit.service')": "require('@services/audit.service')",
  
  "require('@utils/key-generator')": "require('@utils/key-generator')",
  "require('@utils/key-generator')": "require('@utils/key-generator')",
  
  "require('@config/security.config')": "require('@config/security.config')",
  "require('@config/security.config')": "require('@config/security.config')",
  "require('@config/security.config')": "require('@config/security.config')",
  
  "require('@middleware/auth.middleware')": "require('@middleware/auth.middleware')",
  "require('@middleware/auth.middleware')": "require('@middleware/auth.middleware')",
  
  "require('@middleware/role.middleware')": "require('@middleware/role.middleware')",
  "require('@middleware/role.middleware')": "require('@middleware/role.middleware')",
  
  "require('@middleware/error.middleware')": "require('@middleware/error.middleware')",
  "require('@middleware/error.middleware')": "require('@middleware/error.middleware')",
  
  "require('@middleware/logger.middleware')": "require('@middleware/logger.middleware')",
  "require('@middleware/logger.middleware')": "require('@middleware/logger.middleware')",
  
  "require('@middleware/security.middleware')": "require('@middleware/security.middleware')",
  "require('@middleware/security.middleware')": "require('@middleware/security.middleware')",
  
  "require('@routes/auth.routes')": "require('@routes/auth.routes')",
  "require('@routes/auth.routes')": "require('@routes/auth.routes')",
  
  "require('@routes/keys.routes')": "require('@routes/keys.routes')",
  "require('@routes/keys.routes')": "require('@routes/keys.routes')",
  
  "require('@routes/licenses.routes')": "require('@routes/licenses.routes')",
  "require('@routes/licenses.routes')": "require('@routes/licenses.routes')",
  
  "require('@routes/admin.routes')": "require('@routes/admin.routes')",
  "require('@routes/admin.routes')": "require('@routes/admin.routes')",
  
  "require('@routes/validation.routes')": "require('@routes/validation.routes')",
  "require('@routes/validation.routes')": "require('@routes/validation.routes')",
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'logs', 'data', 'backups'].includes(file)) {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.js')) {
      callback(filePath);
    }
  });
}

console.log('🔄 Atualizando imports...\n');

let updated = 0;

walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;
  
  Object.entries(importMap).forEach(([oldImport, newImport]) => {
    if (content.includes(oldImport)) {
      content = content.replaceAll(oldImport, newImport);
    }
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${filePath}`);
    updated++;
  }
});

walkDir('./server.js'.split('/')[0], (filePath) => {
  if (!filePath.includes('src/')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    
    Object.entries(importMap).forEach(([oldImport, newImport]) => {
      if (content.includes(oldImport)) {
        content = content.replaceAll(oldImport, newImport);
      }
    });
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${filePath}`);
      updated++;
    }
  }
});

console.log(`\n✨ ${updated} arquivo(s) atualizado(s)!\n`);
