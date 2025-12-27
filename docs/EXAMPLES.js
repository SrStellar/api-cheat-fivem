/**
 * Exemplos de uso do KeyAuth
 * Estes são exemplos práticos de como usar o sistema
 */

const KeyAuthClient = require('./client');

// ========================================
// EXEMPLO 1: Autenticação Básica
// ========================================
async function exemplo_autenticacao() {
  console.log('\n📌 EXEMPLO 1: Autenticação Básica\n');

  const client = new KeyAuthClient('http://localhost:3000');

  try {
    // Registrar novo usuário
    console.log('1. Registrando novo usuário...');
    const user = await client.register('joao_silva', 'joao@email.com', 'senha123456', 'senha123456');
    console.log(`✅ Usuário registrado: ${user.username}`);

    // Fazer login
    console.log('\n2. Fazendo login...');
    const login = await client.login('joao_silva', 'senha123456');
    console.log(`✅ Token obtido: ${login.token.substring(0, 30)}...`);
    console.log(`   Válido por: ${login.expiresIn} segundos (24 horas)`);

    // Renovar token
    console.log('\n3. Renovando token...');
    const newToken = await client.refreshToken();
    console.log(`✅ Novo token: ${newToken.token.substring(0, 30)}...`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// ========================================
// EXEMPLO 2: Gerenciar Chaves de API
// ========================================
async function exemplo_chaves_api() {
  console.log('\n📌 EXEMPLO 2: Gerenciar Chaves de API\n');

  const client = new KeyAuthClient('http://localhost:3000');

  try {
    // Fazer login primeiro
    console.log('1. Fazendo login...');
    const login = await client.login('joao_silva', 'senha123456');
    console.log(`✅ Autenticado como: ${login.username}`);

    // Criar primeira chave
    console.log('\n2. Criando primeira chave de API...');
    const chave1 = await client.createApiKey(
      'Chave Discord Bot',
      'Chave para meu bot do Discord',
      90 * 24 * 60 * 60 * 1000 // 90 dias
    );
    console.log(`✅ Chave criada: ${chave1.key}`);
    console.log(`   Nome: ${chave1.name}`);
    console.log(`   Válida até: ${chave1.expiresAt}`);

    // Criar segunda chave
    console.log('\n3. Criando segunda chave de API...');
    const chave2 = await client.createApiKey(
      'Chave Dashboard',
      'Chave para meu dashboard web'
    );
    console.log(`✅ Chave criada: ${chave2.key}`);

    // Listar todas as chaves
    console.log('\n4. Listando todas as chaves...');
    const chaves = await client.listApiKeys();
    console.log(`✅ Total de chaves: ${chaves.length}`);
    chaves.forEach((chave, index) => {
      console.log(`\n   ${index + 1}. ${chave.name}`);
      console.log(`      Criada: ${chave.created_at}`);
      console.log(`      Último uso: ${chave.last_used || 'Nunca'}`);
      console.log(`      Usos totais: ${chave.usage_count}`);
      console.log(`      Ativa: ${chave.is_active ? 'Sim' : 'Não'}`);
    });

    // Obter estatísticas
    console.log('\n5. Obtendo estatísticas de uma chave...');
    const stats = await client.getApiKeyStats(chave1.keyId);
    console.log(`✅ Estatísticas de "${stats.name}":`);
    console.log(`   Criada em: ${stats.createdAt}`);
    console.log(`   Último uso: ${stats.lastUsed || 'Nunca'}`);
    console.log(`   Total de requisições: ${stats.usageCount}`);
    console.log(`   Expira em: ${stats.expiresAt}`);

    // Desativar uma chave
    console.log('\n6. Desativando uma chave...');
    await client.deactivateApiKey(chave2.keyId);
    console.log(`✅ Chave desativada com sucesso`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// ========================================
// EXEMPLO 3: Validar Chave (Público)
// ========================================
async function exemplo_validar_chave() {
  console.log('\n📌 EXEMPLO 3: Validar Chave de API (Público)\n');

  const client = new KeyAuthClient('http://localhost:3000');
  // Nota: Não precisa de token para validar chave!

  try {
    // Substituir pela sua chave real
    const chaveReal = 'KA_abc123_def456_789ghi';

    console.log(`1. Validando chave: ${chaveReal}`);
    const validacao = await client.validateApiKey(chaveReal);
    
    console.log('✅ Chave válida!');
    console.log(`   ID da Chave: ${validacao.data.keyId}`);
    console.log(`   Usuário: ${validacao.data.username}`);
    console.log(`   Nome: ${validacao.data.name}`);
    console.log(`   Total de usos: ${validacao.data.usageCount}`);

  } catch (error) {
    console.error('❌ Erro ao validar chave:', error.message);
  }
}

// ========================================
// EXEMPLO 4: Sistema de Licenças
// ========================================
async function exemplo_licencas() {
  console.log('\n📌 EXEMPLO 4: Sistema de Licenças\n');

  const client = new KeyAuthClient('http://localhost:3000');

  try {
    // Fazer login
    console.log('1. Fazendo login...');
    const login = await client.login('joao_silva', 'senha123456');
    console.log(`✅ Autenticado como: ${login.username}`);

    // Criar licença para FiveM
    console.log('\n2. Criando licença para FiveM mod...');
    const licenca = await client.createLicense(
      'fivem-mod-v1',           // ID do produto
      3,                        // Máximo de ativações
      30 * 24 * 60 * 60 * 1000 // 30 dias
    );
    console.log(`✅ Licença criada`);
    console.log(`   Chave: ${licenca.licenseKey}`);
    console.log(`   Máx. Ativações: ${licenca.maxActivations}`);
    console.log(`   Válida até: ${licenca.expiresAt}`);

    // Criar mais uma licença
    console.log('\n3. Criando licença para escapes...');
    const licenca2 = await client.createLicense(
      'fivem-escapes',
      1
    );
    console.log(`✅ Licença criada: ${licenca2.licenseKey}`);

    // Listar licenças
    console.log('\n4. Listando todas as licenças...');
    const licencas = await client.listLicenses();
    console.log(`✅ Total de licenças: ${licencas.length}`);
    licencas.forEach((lic, index) => {
      console.log(`\n   ${index + 1}. ${lic.product_id}`);
      console.log(`      Chave: ${lic.license_key}`);
      console.log(`      Ativações: ${lic.current_activations}/${lic.max_activations}`);
      console.log(`      Criada: ${lic.created_at}`);
    });

    // Obter estatísticas da licença
    console.log('\n5. Obtendo estatísticas da licença...');
    const stats = await client.getLicenseStats(licenca.licenseId);
    console.log(`✅ Estatísticas:`);
    console.log(`   Produto: ${stats.productId}`);
    console.log(`   Ativações: ${stats.currentActivations}/${stats.maxActivations}`);
    console.log(`   Expirada em: ${stats.expiresAt}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// ========================================
// EXEMPLO 5: Ativar Licença (Público)
// ========================================
async function exemplo_ativar_licenca() {
  console.log('\n📌 EXEMPLO 5: Ativar Licença em Dispositivo (Público)\n');

  const client = new KeyAuthClient('http://localhost:3000');

  try {
    const licenseKey = 'AAAA-BBBB-CCCC-DDDD'; // Substituir pela chave real
    const deviceId = 'pc-usuario-123';        // ID único do dispositivo
    const hwid = 'a1b2c3d4e5f6g7h8i9j0k1l2'; // Hash do hardware

    console.log(`1. Ativando licença: ${licenseKey}`);
    console.log(`   Dispositivo: ${deviceId}`);

    const ativacao = await client.validateLicense(licenseKey, deviceId, hwid);

    console.log('✅ Licença ativada com sucesso!');
    console.log(`   ID da Ativação: ${ativacao.data.activationId}`);
    console.log(`   Válida até: ${ativacao.data.expiresAt}`);
    console.log(`   Usuário: ${ativacao.data.username}`);

    // Próxima vez que validar com mesmo deviceId, será reconhecido
    console.log('\n2. Validando licença novamente com mesmo dispositivo...');
    const ativacao2 = await client.validateLicense(licenseKey, deviceId, hwid);
    console.log('✅ Licença validada! (Ativação já existe)');
    console.log(`   Mesmo ID de ativação: ${ativacao2.data.activationId}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// ========================================
// EXEMPLO 6: Painel de Administração
// ========================================
async function exemplo_admin() {
  console.log('\n📌 EXEMPLO 6: Painel de Administração\n');

  const client = new KeyAuthClient('http://localhost:3000');

  try {
    // Fazer login como admin
    console.log('1. Fazendo login como administrador...');
    const login = await client.login('admin', 'senha_admin');
    console.log(`✅ Autenticado como: ${login.username}`);

    // Nesta etapa, você teria acesso aos endpoints de admin
    // /api/admin/stats - Estatísticas do sistema
    // /api/admin/logs - Logs de auditoria
    // /api/admin/users - Lista de usuários
    // /api/admin/users/{userId}/toggle-admin - Dar/remover privilégios admin
    // /api/admin/users/{userId}/deactivate - Desativar usuário
    // /api/admin/users/{userId}/activate - Ativar usuário

    console.log('\n✅ Você teria acesso aos seguintes endpoints de admin:');
    console.log('   - GET /api/admin/stats - Estatísticas gerais');
    console.log('   - GET /api/admin/logs - Logs de auditoria');
    console.log('   - GET /api/admin/users - Lista de usuários');
    console.log('   - POST /api/admin/users/{id}/toggle-admin - Alternar admin');
    console.log('   - POST /api/admin/users/{id}/deactivate - Desativar usuário');
    console.log('   - POST /api/admin/users/{id}/activate - Ativar usuário');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

// ========================================
// EXEMPLO 7: Caso de Uso Real - Protetor de Script
// ========================================
async function exemplo_protetor_script() {
  console.log('\n📌 EXEMPLO 7: Protetor de Script (Caso Real)\n');

  class ProtectorScript {
    constructor(apiUrl) {
      this.client = new KeyAuthClient(apiUrl);
    }

    async verificarAcesso(chaveapi, ipUsuario) {
      try {
        console.log(`Verificando chave: ${chaveapi}`);
        const resultado = await this.client.validateApiKey(chaveapi);
        
        console.log(`✅ Acesso concedido para: ${resultado.data.username}`);
        return { permitido: true, usuario: resultado.data.username };
      } catch (error) {
        console.log(`❌ Acesso negado: ${error.message}`);
        return { permitido: false, motivo: error.message };
      }
    }

    async verificarLicenca(chave, deviceId, hwid) {
      try {
        console.log(`Verificando licença: ${chave}`);
        const resultado = await this.client.validateLicense(chave, deviceId, hwid);
        
        console.log(`✅ Licença válida até: ${resultado.data.expiresAt}`);
        return { valido: true, activationId: resultado.data.activationId };
      } catch (error) {
        console.log(`❌ Licença inválida: ${error.message}`);
        return { valido: false, motivo: error.message };
      }
    }
  }

  // Usar protetor
  const protector = new ProtectorScript('http://localhost:3000');

  console.log('Cenário: Usuário tenta acessar seu script\n');
  
  // Teste com chave de API válida
  console.log('1. Verificando chave de API...');
  const acessoApi = await protector.verificarAcesso('KA_chave_valida_123');
  
  // Teste com licença válida
  console.log('\n2. Verificando licença...');
  const acessoLicenca = await protector.verificarLicenca(
    'AAAA-BBBB-CCCC-DDDD',
    'pc-usuario-001',
    'hardware-id-hash'
  );
}

// ========================================
// Executar exemplos
// ========================================
async function rodarExemplos() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║       EXEMPLOS DE USO - SISTEMA KEYAUTH                   ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  // Descomentar os exemplos que quer executar
  // await exemplo_autenticacao();
  // await exemplo_chaves_api();
  // await exemplo_validar_chave();
  // await exemplo_licencas();
  // await exemplo_ativar_licenca();
  // await exemplo_admin();
  await exemplo_protetor_script();

  console.log('\n✨ Exemplos concluídos!');
}

// Executar
if (require.main === module) {
  rodarExemplos().catch(console.error);
}

module.exports = {
  exemplo_autenticacao,
  exemplo_chaves_api,
  exemplo_validar_chave,
  exemplo_licencas,
  exemplo_ativar_licenca,
  exemplo_admin,
  exemplo_protetor_script
};
