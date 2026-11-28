/**
 * ESEMPIO 03.06 - HTTPS Server Sicuro
 * 
 * Questo esempio mostra come creare un server HTTPS con SSL/TLS.
 * 
 * CONCETTI CHIAVE:
 * - HTTPS: HTTP over TLS/SSL (connessione crittografata)
 * - Certificati SSL: Necessari per HTTPS (key privata + certificato)
 * - Self-signed certificate: Per sviluppo (⚠️ non per production!)
 * - TLS/SSL: Protocolli di sicurezza per comunicazioni cifrate
 * - Port 443: Porta standard per HTTPS
 * 
 * SICUREZZA:
 * - Tutti i dati sono crittografati
 * - Protegge da man-in-the-middle attacks
 * - Autentica il server tramite certificato
 * - Necessario per API moderne e PWA
 * 
 * PRODUCTION:
 * - Usa certificati da Certificate Authority (CA) verificata
 * - Let's Encrypt offre certificati SSL gratuiti
 * - Usa nginx o Caddy come reverse proxy
 * 
 * NOTA: Questo esempio crea un certificato self-signed per testing
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================
// GENERAZIONE CERTIFICATO SELF-SIGNED
// ============================================

/**
 * Genera un certificato SSL self-signed per sviluppo
 * ATTENZIONE: Self-signed certificates NON devono essere usati in production!
 * 
 * @returns {Object} { key: string, cert: string }
 */
function generateSelfSignedCert() {
  const certDir = path.join(__dirname, 'ssl-certs');
  const keyPath = path.join(certDir, 'server-key.pem');
  const certPath = path.join(certDir, 'server-cert.pem');
  
  // Crea directory se non esiste
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }
  
  // Se i certificati esistono già, usali
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('✓ Certificati SSL esistenti trovati');
    return {
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8')
    };
  }
  
  console.log('🔐 Generazione certificato self-signed...');
  
  try {
    // Genera chiave privata e certificato usando openssl
    // Questo richiede openssl installato sul sistema
    execSync(`openssl req -x509 -newkey rsa:2048 -nodes \
      -keyout "${keyPath}" \
      -out "${certPath}" \
      -days 365 \
      -subj "/C=IT/ST=Italy/L=Rome/O=Example Org/CN=localhost"`, 
      { stdio: 'ignore' }
    );
    
    console.log('✓ Certificato generato con successo');
    console.log(`  Key: ${keyPath}`);
    console.log(`  Cert: ${certPath}`);
    
    return {
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8')
    };
    
  } catch (err) {
    console.error('❌ Errore generazione certificato:', err.message);
    console.error('\n⚠️  REQUISITO: openssl deve essere installato sul sistema');
    console.error('   Linux/Mac: Generalmente già installato');
    console.error('   Windows: Scarica da https://slproweb.com/products/Win32OpenSSL.html');
    console.error('\nIn alternativa, crea i certificati manualmente:');
    console.error('  openssl req -x509 -newkey rsa:2048 -nodes -keyout server-key.pem -out server-cert.pem -days 365');
    process.exit(1);
  }
}

// ============================================
// SERVER HTTPS
// ============================================

/**
 * Crea e avvia un server HTTPS
 */
function createHTTPSServer() {
  // Genera/carica certificati SSL
  const credentials = generateSelfSignedCert();
  
  // Opzioni HTTPS
  const httpsOptions = {
    key: credentials.key,   // Chiave privata
    cert: credentials.cert  // Certificato pubblico
  };
  
  // Crea server HTTPS
  const server = https.createServer(httpsOptions, (req, res) => {
    const { method, url } = req;
    
    console.log(`📥 ${method} ${url} [HTTPS]`);
    
    // Routing semplice
    if (url === '/' && method === 'GET') {
      // Home page
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <title>HTTPS Server</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
            .secure { color: #28a745; font-weight: bold; }
            .warning { color: #dc3545; background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
            code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <h1>🔒 HTTPS Server Sicuro</h1>
          <p class="secure">✓ Connessione crittografata attiva!</p>
          
          <h2>ℹ️ Informazioni</h2>
          <ul>
            <li>Protocollo: <strong>HTTPS (HTTP over TLS/SSL)</strong></li>
            <li>Porta: <strong>443 (standard) o 8443 (alternativa)</strong></li>
            <li>Crittografia: <strong>TLS 1.2+</strong></li>
            <li>Certificato: <strong>Self-Signed (solo per sviluppo)</strong></li>
          </ul>
          
          <div class="warning">
            <strong>⚠️ AVVISO SECURITY:</strong><br>
            Questo server usa un certificato self-signed. Il browser mostrerà un warning di sicurezza.
            Questo è normale per l'ambiente di sviluppo.<br><br>
            <strong>Per production:</strong> Usa certificati da una Certificate Authority verificata (es: Let's Encrypt).
          </div>
          
          <h2>🧪 Test API</h2>
          <p>Prova l'endpoint sicuro:</p>
          <ul>
            <li><a href="/api/secure">GET /api/secure</a></li>
            <li><a href="/api/info">GET /api/info</a></li>
          </ul>
        </body>
        </html>
      `);
      
    } else if (url === '/api/secure' && method === 'GET') {
      // API endpoint sicuro
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        message: 'Questo endpoint è protetto da HTTPS',
        secure: true,
        timestamp: new Date().toISOString(),
        protocol: req.socket.encrypted ? 'HTTPS' : 'HTTP',
        cipher: req.socket.getCipher ? req.socket.getCipher() : null
      }, null, 2));
      
    } else if (url === '/api/info' && method === 'GET') {
      // Info sulla connessione sicura
      const cipher = req.socket.getCipher ? req.socket.getCipher() : {};
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        secure: req.socket.encrypted,
        protocol: req.socket.getProtocol ? req.socket.getProtocol() : 'TLS',
        cipher: {
          name: cipher.name,
          version: cipher.version
        },
        headers: req.headers,
        httpVersion: req.httpVersion
      }, null, 2));
      
    } else {
      // 404 Not Found
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        error: 'Endpoint non trovato',
        availableEndpoints: [
          'GET /',
          'GET /api/secure',
          'GET /api/info'
        ]
      }, null, 2));
    }
  });
  
  // ============================================
  // EVENTI SERVER
  // ============================================
  
  server.on('secureConnection', (tlsSocket) => {
    console.log(`🔐 Nuova connessione sicura TLS stabilita`);
    const cipher = tlsSocket.getCipher();
    console.log(`   Cipher: ${cipher.name} ${cipher.version}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Errore: La porta ${PORT} è già in uso`);
    } else {
      console.error(`❌ Errore server: ${err.message}`);
    }
    process.exit(1);
  });
  
  // ============================================
  // AVVIO SERVER
  // ============================================
  
  const PORT = 8443; // Porta alternativa (443 richiede privilegi root)
  const HOST = 'localhost';
  
  server.listen(PORT, HOST, () => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔒 Server HTTPS attivo su https://${HOST}:${PORT}/`);
    console.log(`${'='.repeat(70)}\n`);
    
    console.log('📍 ENDPOINTS:');
    console.log(`   GET  /              - Home page`);
    console.log(`   GET  /api/secure    - API endpoint sicuro`);
    console.log(`   GET  /api/info      - Info connessione TLS\n`);
    
    console.log('⚠️  AVVISO BROWSER:');
    console.log('   Il browser mostrerà un warning di sicurezza perché');
    console.log('   il certificato è self-signed (auto-firmato).');
    console.log('   Questo è normale per sviluppo. Clicca "Avanzate" → "Procedi".\n');
    
    console.log('📝 TEST:');
    console.log(`   Browser: https://localhost:${PORT}/`);
    console.log(`   cURL:    curl -k https://localhost:${PORT}/api/secure`);
    console.log('            (-k ignora verifica certificato)\n');
    
    console.log('💡 PRODUCTION:');
    console.log('   - NON usare certificati self-signed');
    console.log('   - Usa Let\'s Encrypt (gratuito): https://letsencrypt.org/');
    console.log('   - Certbot automatizza il processo');
    console.log('   - Considera reverse proxy (nginx, Caddy)\n');
    
    console.log('Premi Ctrl+C per fermare il server\n');
  });
  
  // ============================================
  // GRACEFUL SHUTDOWN
  // ============================================
  
  process.on('SIGINT', () => {
    console.log('\n\n⏳ Chiusura server HTTPS...');
    server.close(() => {
      console.log('✓ Server chiuso');
      process.exit(0);
    });
  });
}

// ============================================
// AVVIO
// ============================================

console.log('\n🚀'.repeat(35));
console.log('HTTPS SERVER - CONNESSIONI SICURE TLS/SSL');
console.log('🚀'.repeat(35) + '\n');

createHTTPSServer();
