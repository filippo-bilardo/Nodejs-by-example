/**
 * ESEMPIO 03.04 - HTTP Client Request
 * 
 * Questo esempio mostra come effettuare richieste HTTP verso server esterni
 * usando il modulo http nativo di Node.js (lato client).
 * 
 * CONCETTI CHIAVE:
 * - http.request(): Metodo completo per richieste HTTP personalizzate
 * - Options object: Configurazione della richiesta (method, headers, path, ecc.)
 * - Streams: La risposta è uno stream che emette eventi 'data' e 'end'
 * - Status code: Verifica res.statusCode per gestire successo/errore
 * - Headers: Puoi leggere e impostare headers personalizzati
 * - Error handling: Gestione completa degli errori di rete
 * 
 * QUANDO USARE:
 * - Chiamate API REST
 * - Integrazione con servizi esterni
 * - Microservizi che comunicano tra loro
 * - Web scraping
 * 
 * NOTA: Per progetti production, considera librerie come axios o node-fetch
 */

const http = require('http');
const https = require('https');

// ============================================
// HELPER: HTTP REQUEST GENERICO
// ============================================

/**
 * Effettua una richiesta HTTP/HTTPS generica
 * @param {Object} options - Opzioni richiesta
 * @param {string} [body] - Body per POST/PUT (opzionale)
 * @returns {Promise<Object>} Promise con { statusCode, headers, body }
 */
function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    // Sceglie http o https in base al protocollo
    const protocol = options.protocol === 'https:' ? https : http;
    
    console.log(`\n🌐 ${options.method} ${options.protocol}//${options.hostname}${options.path}`);
    
    // Crea la richiesta
    const req = protocol.request(options, (res) => {
      console.log(`✓ Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`✓ Headers:`, res.headers);
      
      let responseBody = '';
      
      // Raccoglie i chunk di dati della risposta
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      // Quando la risposta è completa
      res.on('end', () => {
        console.log(`✓ Body ricevuto (${responseBody.length} bytes)`);
        
        // Prova a parsare JSON se Content-Type lo indica
        let parsedBody = responseBody;
        const contentType = res.headers['content-type'] || '';
        
        if (contentType.includes('application/json')) {
          try {
            parsedBody = JSON.parse(responseBody);
            console.log('✓ JSON parsed');
          } catch (err) {
            console.warn('⚠️  JSON parse fallito, ritorno stringa raw');
          }
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedBody
        });
      });
    });
    
    // Gestione errori di rete
    req.on('error', (err) => {
      console.error(`❌ Errore richiesta: ${err.message}`);
      reject(err);
    });
    
    // Timeout della richiesta (opzionale)
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout richiesta'));
    });
    
    // Invia il body se presente (per POST/PUT)
    if (body) {
      req.write(body);
    }
    
    // Completa la richiesta
    req.end();
  });
}

// ============================================
// ESEMPIO 1: GET REQUEST SEMPLICE
// ============================================

async function example1_SimpleGET() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 1: GET Request Semplice');
  console.log('='.repeat(70));
  
  try {
    const options = {
      protocol: 'https:',
      hostname: 'jsonplaceholder.typicode.com',
      path: '/posts/1', // Ottieni post con ID 1
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js HTTP Client Example',
        'Accept': 'application/json'
      },
      timeout: 5000 // 5 secondi
    };
    
    const response = await httpRequest(options);
    
    console.log('\n📦 RISPOSTA:');
    console.log(JSON.stringify(response.body, null, 2));
    
  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
}

// ============================================
// ESEMPIO 2: POST REQUEST CON JSON
// ============================================

async function example2_POST_JSON() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 2: POST Request con JSON');
  console.log('='.repeat(70));
  
  try {
    // Dati da inviare
    const postData = {
      title: 'Mio Post di Test',
      body: 'Questo è il contenuto del post creato da Node.js',
      userId: 1
    };
    
    const postDataString = JSON.stringify(postData);
    
    const options = {
      protocol: 'https:',
      hostname: 'jsonplaceholder.typicode.com',
      path: '/posts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postDataString),
        'Accept': 'application/json'
      },
      timeout: 5000
    };
    
    const response = await httpRequest(options, postDataString);
    
    console.log('\n📦 RISPOSTA:');
    console.log(`Status: ${response.statusCode}`);
    console.log('Body:', JSON.stringify(response.body, null, 2));
    
  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
}

// ============================================
// ESEMPIO 3: PUT REQUEST (AGGIORNAMENTO)
// ============================================

async function example3_PUT_Update() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 3: PUT Request (Update)');
  console.log('='.repeat(70));
  
  try {
    const updateData = {
      id: 1,
      title: 'Titolo Aggiornato',
      body: 'Contenuto aggiornato dal client HTTP',
      userId: 1
    };
    
    const updateDataString = JSON.stringify(updateData);
    
    const options = {
      protocol: 'https:',
      hostname: 'jsonplaceholder.typicode.com',
      path: '/posts/1',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updateDataString)
      },
      timeout: 5000
    };
    
    const response = await httpRequest(options, updateDataString);
    
    console.log('\n📦 RISPOSTA:');
    console.log(JSON.stringify(response.body, null, 2));
    
  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
}

// ============================================
// ESEMPIO 4: DELETE REQUEST
// ============================================

async function example4_DELETE() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 4: DELETE Request');
  console.log('='.repeat(70));
  
  try {
    const options = {
      protocol: 'https:',
      hostname: 'jsonplaceholder.typicode.com',
      path: '/posts/1',
      method: 'DELETE',
      timeout: 5000
    };
    
    const response = await httpRequest(options);
    
    console.log('\n📦 RISPOSTA:');
    console.log(`Status: ${response.statusCode}`);
    console.log('Body:', response.body);
    
    if (response.statusCode === 200) {
      console.log('✅ Risorsa eliminata con successo');
    }
    
  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
}

// ============================================
// ESEMPIO 5: HEADERS PERSONALIZZATI E AUTH
// ============================================

async function example5_CustomHeaders() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 5: Headers Personalizzati e Auth');
  console.log('='.repeat(70));
  
  try {
    const options = {
      protocol: 'https:',
      hostname: 'api.github.com',
      path: '/users/nodejs', // Info utente GitHub
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js HTTP Client',
        'Accept': 'application/vnd.github.v3+json',
        // Per API autenticate:
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'X-Custom-Header': 'Custom Value' // Header personalizzato
      },
      timeout: 5000
    };
    
    const response = await httpRequest(options);
    
    console.log('\n📦 RISPOSTA:');
    console.log(`Login: ${response.body.login}`);
    console.log(`Name: ${response.body.name}`);
    console.log(`Public Repos: ${response.body.public_repos}`);
    console.log(`Followers: ${response.body.followers}`);
    
  } catch (err) {
    console.error('❌ Errore:', err.message);
  }
}

// ============================================
// ESEMPIO 6: GESTIONE ERRORI
// ============================================

async function example6_ErrorHandling() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 6: Gestione Errori');
  console.log('='.repeat(70));
  
  // Test 1: Host inesistente
  console.log('\n📍 Test 1: Host inesistente');
  try {
    const options1 = {
      protocol: 'http:',
      hostname: 'questo-host-non-esiste-12345.com',
      path: '/',
      method: 'GET',
      timeout: 3000
    };
    await httpRequest(options1);
  } catch (err) {
    console.log(`✓ Errore catturato: ${err.code} - ${err.message}`);
  }
  
  // Test 2: Timeout
  console.log('\n📍 Test 2: Timeout (3 secondi)');
  try {
    const options2 = {
      protocol: 'https:',
      hostname: 'httpbin.org',
      path: '/delay/5', // Risponde dopo 5 secondi
      method: 'GET',
      timeout: 3000 // But timeout dopo 3 secondi
    };
    await httpRequest(options2);
  } catch (err) {
    console.log(`✓ Errore catturato: ${err.message}`);
  }
}

// ============================================
// ESECUZIONE ESEMPI
// ============================================

async function runExamples() {
  console.log('\n' + '🚀'.repeat(35));
  console.log('HTTP CLIENT REQUEST - ESEMPI COMPLETI');
  console.log('🚀'.repeat(35));
  
  // Esegui tutti gli esempi in sequenza
  await example1_SimpleGET();
  await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa 1s
  
  await example2_POST_JSON();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await example3_PUT_Update();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await example4_DELETE();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await example5_CustomHeaders();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await example6_ErrorHandling();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Tutti gli esempi completati!');
  console.log('='.repeat(70));
  console.log('\n💡 TIPS:');
  console.log('   - Per production, usa librerie come axios o node-fetch');
  console.log('   - Gestisci sempre gli errori con try/catch');
  console.log('   - Imposta timeout ragionevoli (3-10 secondi)');
  console.log('   - Valida sempre la risposta prima di usarla');
  console.log('   - Per API con autenticazione, usa headers Authorization\n');
}

// Esegui tutti gli esempi
runExamples().catch(err => {
  console.error('❌ Errore fatale:', err);
  process.exit(1);
});
