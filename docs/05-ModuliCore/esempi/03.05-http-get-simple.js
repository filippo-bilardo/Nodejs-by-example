/**
 * ESEMPIO 03.05 - HTTP GET Semplificato
 * 
 * Questo esempio mostra come usare http.get() per richieste GET semplificate.
 * 
 * CONCETTI CHIAVE:
 * - http.get(): Scorciatoia per GET requests (più semplice di http.request())
 * - Accetta URL string o options object
 * - Perfetto per chiamate GET semplici
 * - Stessa gestione stream della risposta
 * 
 * DIFFERENZE CON http.request():
 * - ✅ Più conciso per GET requests
 * - ✅ Imposta automaticamente method='GET'
 * - ✅ Chiama automaticamente req.end()
 * - ❌ Non adatto per POST/PUT/DELETE
 * - ❌ Meno configurabile
 * 
 * QUANDO USARE:
 * - Fetch dati da API REST (solo GET)
 * - Download file semplici
 * - Web scraping basic
 * - Health checks
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ============================================
// ESEMPIO 1: GET CON URL STRING
// ============================================

function example1_URLString() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 1: GET con URL String');
  console.log('='.repeat(70));
  
  const url = 'http://api.open-notify.org/astros.json';
  
  console.log(`\n🌐 GET ${url}`);
  
  http.get(url, (res) => {
    const { statusCode, headers } = res;
    
    console.log(`✓ Status: ${statusCode}`);
    console.log(`✓ Content-Type: ${headers['content-type']}`);
    
    let data = '';
    
    // Ricevi chunks di dati
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    // Dati completi ricevuti
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        
        console.log('\n📦 RISULTATO:');
        console.log(`Persone nello spazio: ${json.number}`);
        console.log('\nAstronauti:');
        json.people.forEach((person, i) => {
          console.log(`  ${i + 1}. ${person.name} (${person.craft})`);
        });
        
      } catch (err) {
        console.error('❌ Errore parsing JSON:', err.message);
      }
    });
    
  }).on('error', (err) => {
    console.error('❌ Errore richiesta:', err.message);
  });
}

// ============================================
// ESEMPIO 2: GET CON OPTIONS OBJECT
// ============================================

function example2_OptionsObject() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 2: GET con Options Object');
  console.log('='.repeat(70));
  
  const options = {
    hostname: 'jsonplaceholder.typicode.com',
    port: 443, // HTTPS usa porta 443
    path: '/users/1',
    method: 'GET', // Opzionale, GET è il default
    headers: {
      'User-Agent': 'Node.js HTTP GET Example',
      'Accept': 'application/json'
    }
  };
  
  console.log(`\n🌐 GET https://${options.hostname}${options.path}`);
  
  https.get(options, (res) => {
    console.log(`✓ Status: ${res.statusCode}`);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const user = JSON.parse(data);
      
      console.log('\n📦 USER DETAILS:');
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`City: ${user.address.city}`);
      console.log(`Company: ${user.company.name}`);
    });
    
  }).on('error', (err) => {
    console.error('❌ Errore:', err.message);
  });
}

// ============================================
// ESEMPIO 3: DOWNLOAD FILE
// ============================================

function example3_DownloadFile() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 3: Download File');
  console.log('='.repeat(70));
  
  const fileUrl = 'https://raw.githubusercontent.com/nodejs/node/main/README.md';
  const outputPath = path.join(__dirname, 'nodejs-readme.md');
  
  console.log(`\n📥 Download: ${fileUrl}`);
  console.log(`💾 Output: ${outputPath}`);
  
  https.get(fileUrl, (res) => {
    const { statusCode } = res;
    
    if (statusCode !== 200) {
      console.error(`❌ Errore: Status ${statusCode}`);
      res.resume(); // Consuma i dati per liberare memoria
      return;
    }
    
    // Crea write stream per salvare il file
    const fileStream = fs.createWriteStream(outputPath);
    
    let downloadedBytes = 0;
    
    // Pipe: Collega lo stream di risposta al file stream
    res.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      process.stdout.write(`\r📊 Downloaded: ${(downloadedBytes / 1024).toFixed(2)} KB`);
    });
    
    res.pipe(fileStream);
    
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`\n✅ File scaricato con successo!`);
      console.log(`   Dimensione: ${(downloadedBytes / 1024).toFixed(2)} KB`);
    });
    
  }).on('error', (err) => {
    console.error('❌ Errore download:', err.message);
    
    // Rimuovi file parziale in caso di errore
    fs.unlink(outputPath, () => {});
  });
}

// ============================================
// ESEMPIO 4: API CON QUERY PARAMETERS
// ============================================

function example4_QueryParameters() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 4: GET con Query Parameters');
  console.log('='.repeat(70));
  
  // Costruisci URL con query params
  const baseUrl = 'https://jsonplaceholder.typicode.com/posts';
  const params = new URLSearchParams({
    userId: '1',
    _limit: '5' // Limita risultati
  });
  
  const fullUrl = `${baseUrl}?${params.toString()}`;
  
  console.log(`\n🌐 GET ${fullUrl}`);
  
  https.get(fullUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const posts = JSON.parse(data);
      
      console.log(`\n📦 POSTS (${posts.length} risultati):\n`);
      
      posts.forEach((post, i) => {
        console.log(`${i + 1}. [ID ${post.id}] ${post.title}`);
        console.log(`   ${post.body.substring(0, 60)}...`);
        console.log();
      });
    });
    
  }).on('error', (err) => {
    console.error('❌ Errore:', err.message);
  });
}

// ============================================
// ESEMPIO 5: HEALTH CHECK MULTIPLI
// ============================================

function example5_HealthChecks() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 5: Health Checks Multipli');
  console.log('='.repeat(70));
  
  const services = [
    { name: 'Google', url: 'http://www.google.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'JSONPlaceholder API', url: 'https://jsonplaceholder.typicode.com' },
  ];
  
  console.log('\n🏥 Controllo stato servizi...\n');
  
  services.forEach((service) => {
    const startTime = Date.now();
    const protocol = service.url.startsWith('https') ? https : http;
    
    protocol.get(service.url, (res) => {
      const responseTime = Date.now() - startTime;
      const status = res.statusCode;
      
      // Determina lo stato
      let statusIcon = '✅';
      let statusText = 'OK';
      
      if (status >= 400) {
        statusIcon = '❌';
        statusText = 'ERROR';
      } else if (status >= 300) {
        statusIcon = '⚠️';
        statusText = 'REDIRECT';
      }
      
      console.log(`${statusIcon} ${service.name.padEnd(25)} | Status: ${status} | ${responseTime}ms | ${statusText}`);
      
      // Consuma i dati per chiudere la connessione
      res.resume();
      
    }).on('error', (err) => {
      console.log(`❌ ${service.name.padEnd(25)} | UNREACHABLE | ${err.code}`);
    });
  });
}

// ============================================
// ESEMPIO 6: GESTIONE REDIRECT
// ============================================

function example6_FollowRedirect() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 6: Gestione Redirect (301/302)');
  console.log('='.repeat(70));
  
  // Questo URL fa redirect
  const url = 'http://github.com'; // Redirect a https://github.com
  
  console.log(`\n🌐 GET ${url}`);
  
  http.get(url, (res) => {
    const { statusCode, headers } = res;
    
    console.log(`Status: ${statusCode}`);
    
    // Se è un redirect (3xx)
    if (statusCode >= 300 && statusCode < 400 && headers.location) {
      console.log(`↪️  Redirect verso: ${headers.location}`);
      
      // Segui il redirect
      const protocol = headers.location.startsWith('https') ? https : http;
      
      protocol.get(headers.location, (newRes) => {
        console.log(`✓ Nuova richiesta - Status: ${newRes.statusCode}`);
        newRes.resume();
      }).on('error', (err) => {
        console.error('❌ Errore redirect:', err.message);
      });
      
    } else {
      console.log('✓ Risposta diretta (no redirect)');
    }
    
    res.resume();
    
  }).on('error', (err) => {
    console.error('❌ Errore:', err.message);
  });
}

// ============================================
// ESECUZIONE ESEMPI
// ============================================

console.log('\n' + '🚀'.repeat(35));
console.log('HTTP.GET() - ESEMPI COMPLETI');
console.log('🚀'.repeat(35));

// Esegui esempi in sequenza con delay
setTimeout(() => example1_URLString(), 500);
setTimeout(() => example2_OptionsObject(), 2000);
setTimeout(() => example3_DownloadFile(), 4000);
setTimeout(() => example4_QueryParameters(), 6000);
setTimeout(() => example5_HealthChecks(), 8000);
setTimeout(() => example6_FollowRedirect(), 10000);

// Mostra messaggio finale
setTimeout(() => {
  console.log('\n' + '='.repeat(70));
  console.log('✅ Tutti gli esempi completati!');
  console.log('='.repeat(70));
  console.log('\n💡 TIPS:');
  console.log('   - http.get() è perfetto per richieste GET semplici');
  console.log('   - Per POST/PUT/DELETE usa http.request()');
  console.log('   - Gestisci sempre eventi "error" e "data"');
  console.log('   - Per production, usa librerie come axios');
  console.log('   - Ricorda di chiamare res.resume() o consumare i dati\n');
}, 12000);
