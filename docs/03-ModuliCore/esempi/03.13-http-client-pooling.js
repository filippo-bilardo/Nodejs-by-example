/**
 * ESEMPIO 03.13 - HTTP Client Avanzato con Connection Pooling
 * 
 * Questo esempio mostra come creare un client HTTP avanzato con connection pooling,
 * retry logic, timeout e gestione intelligente delle richieste.
 * 
 * CONCETTI CHIAVE:
 * - Connection Pooling: Riusa connessioni TCP esistenti invece di crearne di nuove
 * - Keep-Alive: Mantiene connessioni aperte per richieste multiple
 * - http.Agent: Gestisce pool di connessioni
 * - Retry Logic: Riprova richieste fallite automaticamente
 * - Timeout: Limita tempo di attesa per risposta
 * - Promise-based API: Interface moderna con async/await
 * - Request queue: Limita richieste concorrenti
 * 
 * VANTAGGI CONNECTION POOLING:
 * - ⚡ Performance: Riutilizza connessioni esistenti
 * - 📉 Latenza ridotta: No TCP handshake per ogni richiesta
 * - 💾 Memoria: Limita numero connessioni simultanee
 * - 🔒 Controllo: Gestione centralizzata delle connessioni
 * 
 * QUANDO USARE:
 * - API clients che fanno molte richieste
 * - Microservizi che comunicano frequentemente
 * - Web scrapers
 * - Load testing tools
 * 
 * NOTA: Per production, considera axios o node-fetch con agent personalizzato
 */

const http = require('http');
const https = require('https');
const url = require('url');

// ============================================
// CLASS: HTTPClient
// ============================================

class HTTPClient {
  constructor(options = {}) {
    const {
      maxSockets = 10,           // Max connessioni per host
      maxFreeSockets = 5,        // Max connessioni keep-alive
      timeout = 10000,           // Timeout richiesta (10s)
      retries = 3,               // Numero retry su fallimento
      retryDelay = 1000,         // Delay tra retry (1s)
      keepAlive = true,          // Abilita keep-alive
      keepAliveMsecs = 60000     // Keep-alive timeout (60s)
    } = options;
    
    // HTTP Agent per connection pooling
    this.httpAgent = new http.Agent({
      keepAlive,
      keepAliveMsecs,
      maxSockets,
      maxFreeSockets
    });
    
    // HTTPS Agent
    this.httpsAgent = new https.Agent({
      keepAlive,
      keepAliveMsecs,
      maxSockets,
      maxFreeSockets
    });
    
    this.timeout = timeout;
    this.retries = retries;
    this.retryDelay = retryDelay;
    
    // Statistiche
    this.stats = {
      requests: 0,
      successful: 0,
      failed: 0,
      retried: 0,
      totalTime: 0
    };
  }
  
  /**
   * Effettua richiesta HTTP GET
   */
  async get(urlString, options = {}) {
    return this.request({
      ...options,
      url: urlString,
      method: 'GET'
    });
  }
  
  /**
   * Effettua richiesta HTTP POST
   */
  async post(urlString, body, options = {}) {
    return this.request({
      ...options,
      url: urlString,
      method: 'POST',
      body
    });
  }
  
  /**
   * Effettua richiesta HTTP PUT
   */
  async put(urlString, body, options = {}) {
    return this.request({
      ...options,
      url: urlString,
      method: 'PUT',
      body
    });
  }
  
  /**
   * Effettua richiesta HTTP DELETE
   */
  async delete(urlString, options = {}) {
    return this.request({
      ...options,
      url: urlString,
      method: 'DELETE'
    });
  }
  
  /**
   * Effettua richiesta HTTP generica con retry
   */
  async request(options) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        // Se è un retry, aspetta prima di riprovare
        if (attempt > 0) {
          await this.sleep(this.retryDelay * attempt);
          this.stats.retried++;
          console.log(`🔄 Retry ${attempt}/${this.retries}...`);
        }
        
        // Esegui richiesta
        const result = await this.executeRequest(options);
        
        this.stats.successful++;
        return result;
        
      } catch (err) {
        lastError = err;
        
        // Non riprovare per errori 4xx (client errors)
        if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
          break;
        }
        
        console.error(`❌ Tentativo ${attempt + 1} fallito:`, err.message);
      }
    }
    
    // Tutti i tentativi falliti
    this.stats.failed++;
    throw lastError;
  }
  
  /**
   * Esegue singola richiesta HTTP
   */
  executeRequest(options) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      this.stats.requests++;
      
      const {
        url: urlString,
        method = 'GET',
        headers = {},
        body = null,
        timeout = this.timeout
      } = options;
      
      // Parse URL
      const parsedUrl = url.parse(urlString);
      const isHttps = parsedUrl.protocol === 'https:';
      const protocol = isHttps ? https : http;
      const agent = isHttps ? this.httpsAgent : this.httpAgent;
      
      // Opzioni richiesta
      const reqOptions = {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.path,
        method,
        headers: {
          'User-Agent': 'HTTPClient/1.0',
          ...headers
        },
        agent, // Connection pooling agent
        timeout
      };
      
      // Aggiungi Content-Length se c'è un body
      if (body) {
        const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
        reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyString);
        
        if (!reqOptions.headers['Content-Type']) {
          reqOptions.headers['Content-Type'] = 'application/json';
        }
      }
      
      // Crea richiesta
      const req = protocol.request(reqOptions, (res) => {
        let responseBody = '';
        
        // Ricevi chunks di risposta
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        
        // Risposta completa
        res.on('end', () => {
          const duration = Date.now() - startTime;
          this.stats.totalTime += duration;
          
          // Parse JSON se Content-Type lo indica
          let parsedBody = responseBody;
          const contentType = res.headers['content-type'] || '';
          
          if (contentType.includes('application/json') && responseBody) {
            try {
              parsedBody = JSON.parse(responseBody);
            } catch (err) {
              // JSON parsing failed, lascia come stringa
            }
          }
          
          // Verifica status code
          if (res.statusCode >= 400) {
            reject({
              statusCode: res.statusCode,
              message: `HTTP ${res.statusCode}`,
              body: parsedBody,
              headers: res.headers
            });
            return;
          }
          
          // Successo
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody,
            duration
          });
        });
      });
      
      // Gestione errori
      req.on('error', (err) => {
        reject(err);
      });
      
      // Gestione timeout
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Timeout dopo ${timeout}ms`));
      });
      
      // Invia body se presente
      if (body) {
        const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
        req.write(bodyString);
      }
      
      // Completa richiesta
      req.end();
    });
  }
  
  /**
   * Helper: sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Ottieni statistiche client
   */
  getStats() {
    return {
      ...this.stats,
      avgTime: this.stats.requests > 0
        ? Math.round(this.stats.totalTime / this.stats.requests)
        : 0,
      successRate: this.stats.requests > 0
        ? ((this.stats.successful / this.stats.requests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }
  
  /**
   * Reset statistiche
   */
  resetStats() {
    this.stats = {
      requests: 0,
      successful: 0,
      failed: 0,
      retried: 0,
      totalTime: 0
    };
  }
  
  /**
   * Chiudi tutti i socket aperti
   */
  destroy() {
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
  }
}

// ============================================
// DEMO: ESEMPI DI UTILIZZO
// ============================================

async function demo() {
  console.log('\n' + '🚀'.repeat(35));
  console.log('HTTP CLIENT AVANZATO - CONNECTION POOLING');
  console.log('🚀'.repeat(35) + '\n');
  
  // Crea client con connection pooling
  const client = new HTTPClient({
    maxSockets: 5,        // Max 5 connessioni simultaneous per host
    maxFreeSockets: 2,    // Max 2 connessioni keep-alive
    timeout: 5000,        // Timeout 5s
    retries: 2,           // Max 2 retry
    retryDelay: 1000,     // 1s tra retry
    keepAlive: true
  });
  
  console.log('✅ Client HTTP creato con connection pooling\n');
  
  // ========================================
  // ESEMPIO 1: GET Request Semplice
  // ========================================
  
  console.log('='.repeat(70));
  console.log('ESEMPIO 1: GET Request');
  console.log('='.repeat(70) + '\n');
  
  try {
    const response = await client.get('https://jsonplaceholder.typicode.com/posts/1');
    
    console.log(`✓ Status: ${response.statusCode}`);
    console.log(`✓ Duration: ${response.duration}ms`);
    console.log(`✓ Title: ${response.body.title}`);
    console.log();
    
  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
  
  // ========================================
  // ESEMPIO 2: POST Request con Body
  // ========================================
  
  console.log('='.repeat(70));
  console.log('ESEMPIO 2: POST Request');
  console.log('='.repeat(70) + '\n');
  
  try {
    const postData = {
      title: 'Test Post',
      body: 'Questo è un test dal client HTTP avanzato',
      userId: 1
    };
    
    const response = await client.post(
      'https://jsonplaceholder.typicode.com/posts',
      postData
    );
    
    console.log(`✓ Status: ${response.statusCode}`);
    console.log(`✓ Duration: ${response.duration}ms`);
    console.log(`✓ Created ID: ${response.body.id}`);
    console.log();
    
  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
  
  // ========================================
  // ESEMPIO 3: Richieste Multiple (Connection Pooling)
  // ========================================
  
  console.log('='.repeat(70));
  console.log('ESEMPIO 3: Richieste Multiple con Connection Pooling');
  console.log('='.repeat(70) + '\n');
  
  console.log('🔄 Esecuzione 10 richieste GET in parallelo...\n');
  
  const startTime = Date.now();
  
  const promises = [];
  for (let i = 1; i <= 10; i++) {
    promises.push(
      client.get(`https://jsonplaceholder.typicode.com/posts/${i}`)
        .then(res => ({
          id: i,
          duration: res.duration,
          title: res.body.title,
          success: true
        }))
        .catch(err => ({
          id: i,
          error: err.message,
          success: false
        }))
    );
  }
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  console.log('📊 RISULTATI:\n');
  
  results.forEach(result => {
    if (result.success) {
      console.log(`  ✓ Post ${result.id}: ${result.duration}ms`);
    } else {
      console.log(`  ❌ Post ${result.id}: ${result.error}`);
    }
  });
  
  const successful = results.filter(r => r.success).length;
  const avgDuration = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.duration, 0) / successful;
  
  console.log(`\n📈 Tempo totale: ${totalTime}ms`);
  console.log(`📈 Tempo medio per richiesta: ${avgDuration.toFixed(2)}ms`);
  console.log(`📈 Successi: ${successful}/10`);
  console.log();
  
  // ========================================
  // ESEMPIO 4: Gestione Errori e Retry
  // ========================================
  
  console.log('='.repeat(70));
  console.log('ESEMPIO 4: Gestione Errori e Retry');
  console.log('='.repeat(70) + '\n');
  
  console.log('🧪 Test 1: Endpoint inesistente (404)...\n');
  
  try {
    await client.get('https://jsonplaceholder.typicode.com/posts/99999');
  } catch (err) {
    console.log(`✓ Errore catturato: ${err.message} (Status: ${err.statusCode})`);
    console.log('✓ Non ha fatto retry (errore 4xx)\n');
  }
  
  console.log('🧪 Test 2: Host inesistente (con retry)...\n');
  
  try {
    await client.get('http://questo-host-non-esiste-12345.com', {
      timeout: 2000,
      retries: 2
    });
  } catch (err) {
    console.log(`✓ Errore catturato: ${err.code || err.message}`);
    console.log('✓ Ha tentato retry automatici\n');
  }
  
  // ========================================
  // STATISTICHE FINALI
  // ========================================
  
  console.log('='.repeat(70));
  console.log('STATISTICHE CLIENT');
  console.log('='.repeat(70) + '\n');
  
  const stats = client.getStats();
  
  console.log(`📊 Richieste totali:  ${stats.requests}`);
  console.log(`✅ Successi:          ${stats.successful}`);
  console.log(`❌ Fallite:           ${stats.failed}`);
  console.log(`🔄 Retry eseguiti:    ${stats.retried}`);
  console.log(`⏱️  Tempo medio:       ${stats.avgTime}ms`);
  console.log(`📈 Success rate:      ${stats.successRate}`);
  console.log();
  
  // ========================================
  // VANTAGGI CONNECTION POOLING
  // ========================================
  
  console.log('='.repeat(70));
  console.log('💡 VANTAGGI CONNECTION POOLING');
  console.log('='.repeat(70) + '\n');
  
  console.log('✨ PERFORMANCE:');
  console.log('   - Riutilizzo connessioni TCP esistenti');
  console.log('   - No TCP handshake per ogni richiesta');
  console.log('   - Keep-Alive riduce latenza\n');
  
  console.log('🔒 CONTROLLO:');
  console.log('   - Limita connessioni simultanee per host');
  console.log('   - Previene esaurimento risorse');
  console.log('   - Gestione centralizzata timeout e retry\n');
  
  console.log('📊 MONITORING:');
  console.log('   - Statistiche dettagliate utilizzo');
  console.log('   - Tracking successi/fallimenti');
  console.log('   - Metriche performance\n');
  
  // Chiudi client
  client.destroy();
  console.log('✓ Client chiuso e connessioni rilasciate\n');
}

// Esegui demo
demo().catch(err => {
  console.error('\n❌ Errore fatale:', err);
  process.exit(1);
});
