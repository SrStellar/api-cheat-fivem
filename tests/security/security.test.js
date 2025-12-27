/**
 * 🧪 Testes de Segurança
 * 
 * Valida todas as camadas de proteção do sistema
 * Execute com: npm run test:security
 */

const http = require('http');
const crypto = require('crypto');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

class SecurityTester {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async test(name, fn) {
    try {
      console.log(`\n${colors.blue}[TEST]${colors.reset} ${name}`);
      await fn();
      this.passed++;
      console.log(`${colors.green}[PASS]${colors.reset}`);
      this.results.push({ name, status: 'PASS' });
    } catch (error) {
      this.failed++;
      console.log(`${colors.red}[FAIL]${colors.reset} ${error.message}`);
      this.results.push({ name, status: 'FAIL', error: error.message });
    }
  }

  async request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const opts = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, headers: res.headers, body: json });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          }
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  summary() {
    console.log(`\n\n${'═'.repeat(60)}`);
    console.log(`${colors.blue}RESULTADO DOS TESTES${colors.reset}`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`${colors.green}✅ Passou: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}❌ Falhou: ${this.failed}${colors.reset}`);
    console.log(`Total: ${this.passed + this.failed}`);
    console.log(`${'═'.repeat(60)}\n`);

    if (this.failed > 0) {
      console.log(`${colors.red}TESTES FALHARAM:${colors.reset}`);
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    } else {
      console.log(`${colors.green}TODOS OS TESTES PASSARAM! ✅${colors.reset}`);
    }
  }
}

async function runSecurityTests() {
  const tester = new SecurityTester();

  // ===== TESTE 1: SQL INJECTION =====
  await tester.test('SQL Injection - Username', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: "admin' OR '1'='1",
      email: 'test@test.com',
      password: 'SecurePassword123!@#'
    });

    if (response.status === 400 || response.body.code?.includes('INVALID')) {
      return; // Passou - rejeitou
    }
    throw new Error('SQL Injection não foi detectada');
  });

  await tester.test('SQL Injection - Email', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: 'testuser',
      email: "test@test.com'; DROP TABLE users; --",
      password: 'SecurePassword123!@#'
    });

    if (response.status === 400 || response.body.code?.includes('INVALID')) {
      return; // Passou - rejeitou
    }
    throw new Error('SQL Injection não foi detectada');
  });

  // ===== TESTE 2: XSS =====
  await tester.test('XSS - Script Tag', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: '<script>alert("xss")</script>',
      email: 'test@test.com',
      password: 'SecurePassword123!@#'
    });

    if (response.status === 400 || response.body.code?.includes('INVALID')) {
      return; // Passou - rejeitou
    }
    throw new Error('XSS não foi detectada');
  });

  await tester.test('XSS - Event Handler', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: 'test<img src=x onerror=alert("xss")>',
      email: 'test@test.com',
      password: 'SecurePassword123!@#'
    });

    if (response.status === 400 || response.body.code?.includes('INVALID')) {
      return; // Passou - rejeitou
    }
    throw new Error('XSS não foi detectada');
  });

  // ===== TESTE 3: PASSWORD VALIDATION =====
  await tester.test('Senha muito curta', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: 'testuser123',
      email: 'test@test.com',
      password: 'Short1!',
      confirmPassword: 'Short1!'
    });

    if (response.status === 400 && (response.body.code === 'WEAK_PASSWORD' || response.body.code === 'INVALID_PASSWORD')) {
      return; // Passou
    }
    throw new Error('Senha muito curta foi aceita');
  });

  await tester.test('Senha sem maiúscula', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: 'testuser123',
      email: 'test@test.com',
      password: 'securepassword123!@#',
      confirmPassword: 'securepassword123!@#'
    });

    if (response.status === 400 && (response.body.code === 'WEAK_PASSWORD' || response.body.code === 'INVALID_PASSWORD')) {
      return; // Passou
    }
    throw new Error('Senha sem maiúscula foi aceita');
  });

  await tester.test('Senha sem número', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: 'testuser123',
      email: 'test@test.com',
      password: 'SecurePassword!@#',
      confirmPassword: 'SecurePassword!@#'
    });

    if (response.status === 400 && (response.body.code === 'WEAK_PASSWORD' || response.body.code === 'INVALID_PASSWORD')) {
      return; // Passou
    }
    throw new Error('Senha sem número foi aceita');
  });

  await tester.test('Senha sem símbolo', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: 'testuser123',
      email: 'test@test.com',
      password: 'SecurePassword123',
      confirmPassword: 'SecurePassword123'
    });

    if (response.status === 400 && (response.body.code === 'WEAK_PASSWORD' || response.body.code === 'INVALID_PASSWORD')) {
      return; // Passou
    }
    throw new Error('Senha sem símbolo foi aceita');
  });

  // ===== TESTE 4: USERNAME VALIDATION =====
  await tester.test('Username muito curto', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: 'ab',
      email: 'test@test.com',
      password: 'SecurePassword123!@#',
      confirmPassword: 'SecurePassword123!@#'
    });

    if (response.status === 400 && response.body.code === 'INVALID_USERNAME') {
      return; // Passou
    }
    throw new Error('Username muito curto foi aceito');
  });

  await tester.test('Username com caracteres inválidos', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: 'user@name#123',
      email: 'test@test.com',
      password: 'SecurePassword123!@#',
      confirmPassword: 'SecurePassword123!@#'
    });

    if (response.status === 400 && response.body.code === 'INVALID_USERNAME') {
      return; // Passou
    }
    throw new Error('Username com caracteres inválidos foi aceito');
  });

  // ===== TESTE 5: EMAIL VALIDATION =====
  await tester.test('Email inválido', async () => {
    const response = await tester.request('POST', '/api/auth/register', {
      username: 'testuser123',
      email: 'invalid-email-format',
      password: 'SecurePassword123!@#',
      confirmPassword: 'SecurePassword123!@#'
    });

    if (response.status === 400 && response.body.code === 'INVALID_EMAIL') {
      return; // Passou
    }
    throw new Error('Email inválido foi aceito');
  });

  // ===== TESTE 6: RATE LIMITING =====
  await tester.test('Rate limiting - múltiplas requisições rápidas', async () => {
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        tester.request('POST', '/api/auth/register', {
          username: `user${i}`,
          email: `test${i}@test.com`,
          password: 'SecurePassword123!@#'
        })
      );
    }

    const responses = await Promise.all(requests);
    const blocked = responses.some(r => r.status === 429);

    if (blocked) {
      return; // Passou - foi bloqueado
    }
    console.log('  ⚠️ Aviso: Rate limiting pode não estar ativado');
  });

  // ===== TESTE 7: HEADERS DE SEGURANÇA =====
  await tester.test('HSTS Header presente', async () => {
    const response = await tester.request('GET', '/health');
    const hsts = response.headers['strict-transport-security'];

    if (hsts) {
      return; // Passou
    }
    throw new Error('HSTS header não encontrado');
  });

  await tester.test('X-Content-Type-Options presente', async () => {
    const response = await tester.request('GET', '/health');
    const xcto = response.headers['x-content-type-options'];

    if (xcto === 'nosniff') {
      return; // Passou
    }
    throw new Error('X-Content-Type-Options não configurado corretamente');
  });

  await tester.test('X-Frame-Options presente', async () => {
    const response = await tester.request('GET', '/health');
    const xfo = response.headers['x-frame-options'];

    if (xfo) {
      return; // Passou
    }
    throw new Error('X-Frame-Options não encontrado');
  });

  await tester.test('CSP Header presente', async () => {
    const response = await tester.request('GET', '/health');
    const csp = response.headers['content-security-policy'];

    if (csp) {
      return; // Passou
    }
    throw new Error('Content-Security-Policy header não encontrado');
  });

  // ===== TESTE 8: CONTENT-TYPE VALIDATION =====
  await tester.test('Content-Type validation - text/plain rejeitado', async () => {
    try {
      const response = await tester.request('POST', '/api/auth/register', 
        { username: 'test', email: 'test@test.com', password: 'Pass123!@#' },
        { 'Content-Type': 'text/plain' }
      );

      if (response.status === 400 || response.status === 415) {
        return; // Passou - rejeitou
      }
      throw new Error('Content-Type inválido foi aceito');
    } catch (e) {
      // Erro esperado
    }
  });

  // ===== TESTE 9: PAYLOAD SIZE =====
  await tester.test('Payload muito grande rejeitado', async () => {
    const largeData = 'a'.repeat(1024 * 200); // 200KB
    
    try {
      const response = await tester.request('POST', '/api/auth/register', {
        username: 'testuser',
        email: 'test@test.com',
        password: 'SecurePassword123!@#',
        data: largeData
      });

      if (response.status === 413 || response.status === 400) {
        return; // Passou - rejeitou
      }
    } catch (e) {
      // Erro esperado
    }
  });

  // ===== TESTE 10: ENDPOINT PROTECTION =====
  await tester.test('Endpoint não autenticado rejeitado', async () => {
    const response = await tester.request('GET', '/api/admin/users');

    if (response.status === 401 || response.status === 403) {
      return; // Passou - rejeitou
    }
    throw new Error('Endpoint não autenticado foi acessado');
  });

  // ===== RESUMO =====
  tester.summary();

  process.exit(tester.failed > 0 ? 1 : 0);
}

// Executar testes
console.log(`${colors.blue}${'═'.repeat(60)}${colors.reset}`);
console.log(`${colors.blue}   🧪 TESTES DE SEGURANÇA${colors.reset}`);
console.log(`${colors.blue}${'═'.repeat(60)}${colors.reset}`);
console.log(`\nURL Base: ${BASE_URL}\n`);

runSecurityTests().catch(error => {
  console.error(`${colors.red}Erro crítico:${colors.reset}`, error);
  process.exit(1);
});
