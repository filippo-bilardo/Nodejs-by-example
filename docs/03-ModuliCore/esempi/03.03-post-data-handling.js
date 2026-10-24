/**
 * ESEMPIO 03.03 - Gestione Dati POST
 * 
 * Questo esempio mostra come ricevere e processare dati POST da un client.
 * 
 * CONCETTI CHIAVE:
 * - Streams: I dati POST arrivano come stream di bytes
 * - Eventi 'data': Emesso quando arrivano chunk di dati
 * - Evento 'end': Emesso quando tutti i dati sono stati ricevuti
 * - JSON parsing: Conversione da stringa JSON a oggetto JavaScript
 * - Content-Type: Header che indica il formato dei dati (application/json, application/x-www-form-urlencoded, ecc.)
 * - Error handling: Gestione errori di parsing e validazione
 * 
 * FORMATI SUPPORTATI:
 * - JSON: application/json
 * - URL-encoded: application/x-www-form-urlencoded (form HTML)
 * - Validazione dati ricevuti
 * 
 * NOTA: Per production, usa body-parser di Express.js
 */

const http = require('http');
const querystring = require('querystring');

// ============================================
// HELPER: PARSING BODY
// ============================================

/**
 * Legge il body della richiesta POST come stream
 * @param {http.IncomingMessage} req - Oggetto richiesta
 * @returns {Promise<string>} Promise con il body completo
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    
    // Evento 'data': Riceve chunk di dati
    // I dati potrebbero arrivare in più parti (chunks)
    req.on('data', chunk => {
      body += chunk.toString();
      
      // Protezione: Limita dimensione massima (es: 1MB)
      if (body.length > 1e6) { // 1MB = 1,000,000 bytes
        // Troppi dati - possibile attacco DOS
        req.connection.destroy();
        reject(new Error('Body troppo grande'));
      }
    });
    
    // Evento 'end': Tutti i dati sono stati ricevuti
    req.on('end', () => {
      resolve(body);
    });
    
    // Evento 'error': Errore durante la lettura
    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Parse del body in base al Content-Type
 * @param {string} body - Body raw della richiesta
 * @param {string} contentType - Content-Type header
 * @returns {Object} Oggetto parsed
 */
function parseBody(body, contentType) {
  if (!contentType) {
    throw new Error('Content-Type header mancante');
  }
  
  // JSON: application/json
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(body);
    } catch (err) {
      throw new Error('JSON non valido: ' + err.message);
    }
  }
  
  // Form URL-encoded: application/x-www-form-urlencoded
  // Esempio: "name=Mario&email=mario@example.com&age=25"
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return querystring.parse(body);
  }
  
  // Content-Type non supportato
  throw new Error(`Content-Type non supportato: ${contentType}`);
}

// ============================================
// HELPER: RISPOSTA JSON
// ============================================

function sendJSON(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data, null, 2));
}

function sendHTML(res, statusCode, html) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html);
}

// ============================================
// VALIDAZIONE DATI
// ============================================

/**
 * Valida i dati di un nuovo utente
 * @param {Object} userData - Dati utente da validare
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateUser(userData) {
  const errors = [];
  
  // Campi obbligatori
  if (!userData.name || userData.name.trim() === '') {
    errors.push('Il campo "name" è obbligatorio');
  }
  
  if (!userData.email || userData.email.trim() === '') {
    errors.push('Il campo "email" è obbligatorio');
  } else {
    // Validazione email semplice
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.push('Email non valida');
    }
  }
  
  // Validazione età (se presente)
  if (userData.age !== undefined) {
    const age = parseInt(userData.age);
    if (isNaN(age) || age < 0 || age > 150) {
      errors.push('Età non valida (deve essere tra 0 e 150)');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================
// ROUTE HANDLERS
// ============================================

/**
 * GET / - Form HTML per inviare dati
 */
function handleFormPage(req, res) {
  const html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>Form POST - Server HTTP</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        form { background: #f5f5f5; padding: 30px; border-radius: 8px; }
        label { display: block; margin-top: 15px; font-weight: bold; }
        input, textarea { width: 100%; padding: 10px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { margin-top: 20px; padding: 12px 30px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .test-section { margin-top: 40px; padding: 20px; background: #fff3cd; border-radius: 8px; }
        code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <h1>📝 Form POST Example</h1>
      
      <form action="/api/users" method="POST">
        <label for="name">Nome: *</label>
        <input type="text" id="name" name="name" required>
        
        <label for="email">Email: *</label>
        <input type="email" id="email" name="email" required>
        
        <label for="age">Età:</label>
        <input type="number" id="age" name="age" min="0" max="150">
        
        <label for="bio">Bio:</label>
        <textarea id="bio" name="bio" rows="4"></textarea>
        
        <button type="submit">Invia Dati (URL-encoded)</button>
      </form>
      
      <div class="test-section">
        <h3>🧪 Test con cURL (JSON):</h3>
        <p>Invia dati JSON dalla console:</p>
        <code>curl -X POST http://localhost:3002/api/users -H "Content-Type: application/json" -d '{"name":"Mario Rossi","email":"mario@example.com","age":30}'</code>
      </div>
    </body>
    </html>
  `;
  
  sendHTML(res, 200, html);
}

/**
 * POST /api/users - Crea nuovo utente
 */
async function handleCreateUser(req, res) {
  try {
    // 1. Leggi il body della richiesta
    console.log('  📖 Lettura body...');
    const bodyRaw = await readBody(req);
    console.log(`  ✓ Body ricevuto (${bodyRaw.length} bytes)`);
    
    // 2. Parse del body in base al Content-Type
    const contentType = req.headers['content-type'] || '';
    console.log(`  📋 Content-Type: ${contentType}`);
    
    const userData = parseBody(bodyRaw, contentType);
    console.log('  ✓ Body parsed:', userData);
    
    // 3. Validazione dati
    const validation = validateUser(userData);
    if (!validation.valid) {
      console.log('  ❌ Validazione fallita:', validation.errors);
      return sendJSON(res, 400, {
        success: false,
        error: 'Dati non validi',
        details: validation.errors
      });
    }
    
    // 4. Simulazione salvataggio (in un'app reale: salva su database)
    const newUser = {
      id: Date.now(), // ID temporaneo
      name: userData.name,
      email: userData.email,
      age: userData.age ? parseInt(userData.age) : null,
      bio: userData.bio || null,
      createdAt: new Date().toISOString()
    };
    
    console.log('  ✅ Utente creato:', newUser);
    
    // 5. Risposta di successo
    sendJSON(res, 201, { // 201 = Created
      success: true,
      message: 'Utente creato con successo',
      data: newUser
    });
    
  } catch (err) {
    // Gestione errori
    console.error('  ❌ Errore:', err.message);
    sendJSON(res, 400, {
      success: false,
      error: err.message
    });
  }
}

// ============================================
// SERVER
// ============================================

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  
  console.log(`\n📥 ${method} ${url}`);
  
  // Routing
  if (url === '/' && method === 'GET') {
    // Mostra form HTML
    handleFormPage(req, res);
    
  } else if (url === '/api/users' && method === 'POST') {
    // Crea nuovo utente (JSON o URL-encoded)
    await handleCreateUser(req, res);
    
  } else {
    // 404 Not Found
    sendJSON(res, 404, {
      success: false,
      error: 'Endpoint non trovato',
      available: [
        'GET /',
        'POST /api/users'
      ]
    });
  }
});

// ============================================
// AVVIO SERVER
// ============================================

const PORT = 3002;
const HOST = 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`✓ Server POST HTTP attivo su http://${HOST}:${PORT}/`);
  console.log(`${'='.repeat(70)}\n`);
  
  console.log('📍 ENDPOINTS:');
  console.log(`   GET  /              - Form HTML per test`);
  console.log(`   POST /api/users     - Crea nuovo utente (JSON o URL-encoded)\n`);
  
  console.log('📝 TEST:');
  console.log('   1. Apri browser: http://localhost:3002/');
  console.log('   2. Compila il form e invia');
  console.log('   3. Oppure usa cURL:');
  console.log('');
  console.log('   # Test JSON:');
  console.log(`   curl -X POST http://localhost:${PORT}/api/users \\`);
  console.log('        -H "Content-Type: application/json" \\');
  console.log('        -d \'{"name":"Mario Rossi","email":"mario@example.com","age":30}\'');
  console.log('');
  console.log('   # Test URL-encoded:');
  console.log(`   curl -X POST http://localhost:${PORT}/api/users \\`);
  console.log('        -H "Content-Type: application/x-www-form-urlencoded" \\');
  console.log('        -d "name=Laura Bianchi&email=laura@example.com&age=25"');
  console.log('');
  console.log('Premi Ctrl+C per fermare il server\n');
});

// ============================================
// GESTIONE ERRORI E SHUTDOWN
// ============================================

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Errore: La porta ${PORT} è già in uso`);
  } else {
    console.error(`❌ Errore server: ${err.message}`);
  }
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n\n⏳ Chiusura server...');
  server.close(() => {
    console.log('✓ Server chiuso');
    process.exit(0);
  });
});
