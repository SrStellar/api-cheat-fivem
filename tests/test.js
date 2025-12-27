const KeyAuthClient = require('./client');

/**
 * Testes do sistema KeyAuth
 */
async function runTests() {
  console.log('🧪 Iniciando testes do KeyAuth...\n');

  const client = new KeyAuthClient('http://localhost:3000');

  try {
    // 1. Registro
    console.log('1️⃣ Testando registro de usuário...');
    const user = await client.register('testuser', 'test@example.com', 'password123', 'password123');
    console.log('✅ Usuário registrado:', user.username);
    console.log('   ID:', user.userId, '\n');

    // 2. Login
    console.log('2️⃣ Testando login...');
    const loginResult = await client.login('testuser', 'password123');
    console.log('✅ Login bem-sucedido');
    console.log('   Token:', loginResult.token.substring(0, 20) + '...', '\n');

    // 3. Criar chave de API
    console.log('3️⃣ Criando chave de API...');
    const apiKey = await client.createApiKey('Minha Chave', 'Chave de teste');
    console.log('✅ Chave de API criada');
    console.log('   Chave:', apiKey.key, '\n');

    // 4. Listar chaves de API
    console.log('4️⃣ Listando chaves de API...');
    const keys = await client.listApiKeys();
    console.log('✅ Chaves encontradas:', keys.length);
    keys.forEach(key => {
      console.log(`   - ${key.name} (Usos: ${key.usage_count})`);
    });
    console.log();

    // 5. Validar chave de API (PÚBLICA - sem token)
    console.log('5️⃣ Validando chave de API (sem autenticação)...');
    client.token = null; // Remover token
    const validation = await client.validateApiKey(apiKey.key);
    console.log('✅ Chave validada com sucesso');
    console.log('   Usuário:', validation.data.username);
    console.log('   Usos:', validation.data.usageCount + 1, '\n');

    // Restaurar token
    client.token = loginResult.token;

    // 6. Criar licença
    console.log('6️⃣ Criando licença...');
    const license = await client.createLicense('product-fivem', 2);
    console.log('✅ Licença criada');
    console.log('   Chave:', license.licenseKey);
    console.log('   Ativações máximas:', license.maxActivations, '\n');

    // 7. Listar licenças
    console.log('7️⃣ Listando licenças...');
    const licenses = await client.listLicenses();
    console.log('✅ Licenças encontradas:', licenses.length);
    licenses.forEach(lic => {
      console.log(`   - ${lic.product_id} (Ativações: ${lic.current_activations}/${lic.max_activations})`);
    });
    console.log();

    // 8. Validar licença (PÚBLICA - com deviceId)
    console.log('8️⃣ Validando licença com ativação...');
    client.token = null; // Remover token para teste público
    const licValidation = await client.validateLicense(license.licenseKey, 'device-001', 'hwid-001');
    console.log('✅ Licença validada e ativada');
    console.log('   Licença ID:', licValidation.data.licenseId);
    console.log('   Ativação ID:', licValidation.data.activationId, '\n');

    // Restaurar token
    client.token = loginResult.token;

    // 9. Obter estatísticas de chave
    console.log('9️⃣ Obtendo estatísticas de chave de API...');
    const keyStats = await client.getApiKeyStats(apiKey.keyId);
    console.log('✅ Estatísticas da chave:');
    console.log('   Nome:', keyStats.name);
    console.log('   Criada em:', keyStats.createdAt);
    console.log('   Últimos usos:', keyStats.usageCount, '\n');

    // 10. Obter estatísticas de licença
    console.log('🔟 Obtendo estatísticas de licença...');
    const licStats = await client.getLicenseStats(license.licenseId);
    console.log('✅ Estatísticas da licença:');
    console.log('   Produto:', licStats.productId);
    console.log('   Ativações:', licStats.currentActivations, '/', licStats.maxActivations);
    console.log('   Ativações:');
    licStats.activations.forEach(act => {
      console.log(`     - Device: ${act.device_id}, HWID: ${act.hwid.substring(0, 8)}...`);
    });
    console.log();

    console.log('✨ Todos os testes foram executados com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    process.exit(1);
  }
}

// Executar testes
runTests().then(() => {
  console.log('\n✅ Testes concluídos!');
  process.exit(0);
}).catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
