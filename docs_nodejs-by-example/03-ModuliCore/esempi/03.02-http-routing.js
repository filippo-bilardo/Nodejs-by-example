/**
 * ESEMPIO 03.02 - Routing HTTP
 * 
 * Questo esempio mostra come gestire diverse route (percorsi) in un server HTTP.
 * 
 * CONCETTI CHIAVE:
 * - URL parsing: req.url contiene il percorso richiesto
 * - HTTP methods: req.method identifica il tipo di richiesta (GET, POST, PUT, DELETE, ecc.)
 * - Routing manuale: Usa if/else o switch per dirigere le richieste
 * - 404 Not Found: Risposta quando la risorsa non esiste
 * - Query parameters: Parametri nell'URL dopo il '?' (es: /search?q=nodejs)
 * 
 * STRUTTURA ROUTING:
 * - / (home page)
 * - /about (pagina informazioni)
 * - /api/users (API JSON)
 * - /contact (form contatto)
 * - * (404 per tutto il resto)
 * 
 * NOTA: Per applicazioni complesse, usa Express.js o framework simili
 */

const http = require('http');
const url = require('url');

// ============================================
// HELPER: RISPOSTA JSON
// ============================================

/**
 * Invia una risposta JSON con status code appropriato
 * @param {http.ServerResponse} res - Oggetto risposta
 * @param {number} statusCode - Codice di stato HTTP
 * @param {Object} data - Dati da serializzare in JSON
 */
function sendJSON(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Invia una risposta HTML
 * @param {http.ServerResponse} res - Oggetto risposta
 * @param {number} statusCode - Codice di stato HTTP
 * @param {string} html - Contenuto HTML
 */
function sendHTML(res, statusCode, html) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html);
}

// ============================================
// HANDLER PER OGNI ROUTE
// ============================================

/**
 * Home page
 */
function handleHome(req, res) {
  const html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>Home - Server HTTP</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        nav { margin: 30px 0; }
        nav a { margin-right: 20px; color: #007bff; text-decoration: none; }
        nav a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>🏠 Home Page</h1>
      <p>Benvenuto sul server HTTP con routing!</p>
      
      <nav>
        <h3>Pagine disponibili:</h3>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/api/users">API Users (JSON)</a>
        <a href="/contact">Contact</a>
        <a href="/notfound">404 Example</a>
      </nav>
    </body>
    </html>
  `;
  
  sendHTML(res, 200, html);
  console.log('✓ Servita home page');
}

/**
 * Pagina informazioni
 */
function handleAbout(req, res) {
  const html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>About - Server HTTP</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        a { color: #007bff; }
      </style>
    </head>
    <body>
      <h1>ℹ️ About</h1>
      <p>Questo è un server HTTP di esempio con routing manuale.</p>
      <p>Creato con Node.js e il modulo http nativo.</p>
      <p><a href="/">← Torna alla home</a></p>
    </body>
    </html>
  `;
  
  sendHTML(res, 200, html);
  console.log('✓ Servita pagina about');
}

/**
 * API endpoint - Lista utenti (esempio con dati mock)
 */
function handleAPIUsers(req, res, parsedUrl) {
  // Dati mock di esempio
  const users = [
    { id: 1, name: 'Mario Rossi', email: 'mario@example.com', role: 'admin' },
    { id: 2, name: 'Laura Bianchi', email: 'laura@example.com', role: 'user' },
    { id: 3, name: 'Giuseppe Verdi', email: 'giuseppe@example.com', role: 'user' }
  ];
  
  // Parse query parameters (es: /api/users?role=admin)
  const queryParams = parsedUrl.query;
  const roleFilter = queryParams.role;
  
  // Filtra per ruolo se specificato
  let filteredUsers = users;
  if (roleFilter) {
    filteredUsers = users.filter(u => u.role === roleFilter);
    console.log(`✓ API users con filtro role=${roleFilter} (${filteredUsers.length} risultati)`);
  } else {
    console.log(`✓ API users senza filtri (${users.length} risultati)`);
  }
  
  // Risposta JSON
  sendJSON(res, 200, {
    success: true,
    count: filteredUsers.length,
    filters: queryParams,
    data: filteredUsers
  });
}

/**
 * Pagina contatto
 */
function handleContact(req, res) {
  const html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>Contatti - Server HTTP</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        a { color: #007bff; }
      </style>
    </head>
    <body>
      <h1>📧 Contatti</h1>
      <p>Email: info@example.com</p>
      <p>Tel: +39 123 456 7890</p>
      <p><a href="/">← Torna alla home</a></p>
    </body>
    </html>
  `;
  
  sendHTML(res, 200, html);
  console.log('✓ Servita pagina contatti');
}

/**
 * 404 Not Found - Risorsa non trovata
 */
function handle404(req, res) {
  const html = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>404 - Pagina non trovata</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; text-align: center; }
        h1 { color: #dc3545; font-size: 72px; margin: 0; }
        a { color: #007bff; }
      </style>
    </head>
    <body>
      <h1>404</h1>
      <h2>🔍 Pagina non trovata</h2>
      <p>La risorsa richiesta <code>${req.url}</code> non esiste.</p>
      <p><a href="/">← Torna alla home</a></p>
    </body>
    </html>
  `;
  
  sendHTML(res, 404, html);
  console.log(`⚠️  404 Not Found: ${req.url}`);
}

// ============================================
// SERVER CON ROUTING
// ============================================

const server = http.createServer((req, res) => {
  // Parse dell'URL per ottenere pathname e query params
  const parsedUrl = url.parse(req.url, true); // true = parse query string
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  console.log(`\n📥 ${method} ${pathname}`);
  
  // Routing basato sul pathname
  // Per API production, considera l'uso di un router più avanzato
  
  if (pathname === '/' && method === 'GET') {
    // Home page
    handleHome(req, res);
    
  } else if (pathname === '/about' && method === 'GET') {
    // Pagina about
    handleAbout(req, res);
    
  } else if (pathname === '/api/users' && method === 'GET') {
    // API endpoint - lista utenti
    handleAPIUsers(req, res, parsedUrl);
    
  } else if (pathname === '/contact' && method === 'GET') {
    // Pagina contatti
    handleContact(req, res);
    
  } else {
    // 404 - Nessuna route trovata
    handle404(req, res);
  }
});

// ============================================
// AVVIO SERVER
// ============================================

const PORT = 3001;
const HOST = 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✓ Server HTTP con routing attivo su http://${HOST}:${PORT}/`);
  console.log(`${'='.repeat(60)}\n`);
  
  console.log('📍 ROUTE DISPONIBILI:');
  console.log(`   GET  /              - Home page`);
  console.log(`   GET  /about         - Informazioni`);
  console.log(`   GET  /api/users     - Lista utenti (JSON)`);
  console.log(`   GET  /api/users?role=admin - Filtra per ruolo`);
  console.log(`   GET  /contact       - Contatti`);
  console.log(`   *    *              - 404 Not Found\n`);
  
  console.log('📝 TEST:');
  console.log(`   curl http://localhost:${PORT}/`);
  console.log(`   curl http://localhost:${PORT}/api/users`);
  console.log(`   curl http://localhost:${PORT}/api/users?role=admin\n`);
  
  console.log('Premi Ctrl+C per fermare il server\n');
});

// ============================================
// GESTIONE ERRORI
// ============================================

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Errore: La porta ${PORT} è già in uso`);
  } else {
    console.error(`❌ Errore server: ${err.message}`);
  }
  process.exit(1);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', () => {
  console.log('\n\n⏳ Chiusura server in corso...');
  server.close(() => {
    console.log('✓ Server chiuso correttamente');
    process.exit(0);
  });
});
