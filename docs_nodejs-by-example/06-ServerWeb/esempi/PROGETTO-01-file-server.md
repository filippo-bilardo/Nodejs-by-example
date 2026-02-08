# PROGETTO-01: File Server FTP-like

## 📋 Informazioni Generali

- **Moduli**: fs, http, path, crypto, buffer, zlib
- **Difficoltà**: 🔴 Avanzato
- **Tempo stimato**: 3-4 ore
- **Prerequisiti**: 
  - Completamento esercizi FS, HTTP, Crypto
  - Conoscenza di routing HTTP
  - Familiarità con upload/download file
  - Comprensione di autenticazione

## 🎯 Obiettivi di Apprendimento

Al termine di questo progetto sarai in grado di:
1. Integrare múltipli moduli core in un'applicazione completa
2. Implementare upload e download di file via HTTP
3. Creare sistema di autenticazione con password hash ate
4. Generare interfaccia web navigabile per directory
5. Implementare compressione automatica per ottimizzare trasferimenti
6. Gestire richieste multipart/form-data per file upload

## 📝 Descrizione

Crea un file server HTTP completo simile a un FTP server ma accessibile via browser. Gli utenti possono autenticarsi, navigare directory, visualizzare file, fare upload, download (con compressione automatica per file grandi), ed eliminare file.

## 🏗️ Architettura del Progetto

```
file-server/
├── server.js              # Server principale
├── auth.js                # Sistema autenticazione
├── router.js              # Gestione routing
├── file-handler.js        # Operazioni sui file
├── html-generator.js      # Generazione HTML
├── config.json            # Configurazione
├── users.json             # Database utenti
└── files/                 # Directory file serviti
    └── uploads/           # Upload utenti
```

## 🔨 Funzionalità da Implementare

### 1. Autenticazione
- [ ] Login con username e password
- [ ] Password hashate con SHA-256 (o PBKDF2)
- [ ] Session token usando crypto.randomBytes()
- [ ] Cookie per mantenere sessione
- [ ] Logout

### 2. Navigazione Directory
- [ ] Lista file e cartelle
- [ ] Breadcrumb navigation
- [ ] Icone per tipi file
- [ ] Dimensioni formattate (KB, MB, GB)
- [ ] Date ultima modifica

### 3. File Operations
- [ ] Upload file (multipart/form-data)
- [ ] Download file
- [ ] Download con compressione gzip (file >1MB)
- [ ] Eliminazione file (con conferma)
- [ ] Anteprima file di testo

### 4. Sicurezza
- [ ] Path traversal prevention
- [ ] Limiti dimensione upload (es. 100MB)
- [ ] Validazione tipi file
- [ ] Access control (solo file autenticati)

## 💡 Template Struttura

### server.js
```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');
const { authenticateUser, validateSession, createSession } = require('./auth');
const { routeRequest } = require('./router');

const PORT = 3000;
const FILES_DIR = path.join(__dirname, 'files');

// Crea directory se non esiste
if (!fs.existsSync(FILES_DIR)) {
  fs.mkdirSync(FILES_DIR,{ recursive: true });
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // Gestisci routing
  routeRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`🚀 File Server attivo su http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${FILES_DIR}`);
});
```

### auth.js
```javascript
const crypto = require('crypto');
const fs = require('fs');

// Database utenti (normalmente su DB reale)
const USERS_FILE = './users.json';
const sessions = new Map();

/**
 * Hash password con SHA-256
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Autentica utente
 */
function authenticateUser(username, password) {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  const user = users.find(u => u.username === username);
  
  if (!user) return null;
  
  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) return null;
  
  return user;
}

/**
 * Crea sessione e restituisci token
 */
function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    user,
    createdAt: Date.now()
  });
  return token;
}

/**
 * Valida token sessione
 */
function validateSession(token) {
  const session = sessions.get(token);
  if (!session) return null;
  
  // Sessione valida per 1 ora
  if (Date.now() - session.createdAt > 3600000) {
    sessions.delete(token);
    return null;
  }
  
  return session.user;
}

/**
 * Elimina sessione (logout)
 */
function destroySession(token) {
  sessions.delete(token);
}

module.exports = {
  authenticateUser,
  createSession,
  validateSession,
  destroySession,
  hashPassword
};
```

### router.js
```javascript
const url = require('url');
const { handleLogin, handleLogout } = require('./auth-handler');
const { listDirectory, downloadFile, uploadFile, deleteFile } = require('./file-handler');
const { validateSession } = require('./auth');

/**
 * Router principale
 */
function routeRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Estrai session token da cookie
  const cookies = parseCookies(req.headers.cookie || '');
  const sessionToken = cookies.session;
  const user = sessionToken ? validateSession(sessionToken) : null;
  
  // Route pubbliche
  if (pathname === '/login' && req.method === 'POST') {
    return handleLogin(req, res);
  }
  
  if (pathname === '/login' && req.method === 'GET') {
    return serveLoginPage(res);
  }
  
  // Route protette (richiedono autenticazione)
  if (!user) {
    return redirectToLogin(res);
  }
  
  if (pathname === '/logout') {
    return handleLogout(req, res, sessionToken);
  }
  
  if (pathname === '/' || pathname.startsWith('/browse/')) {
    return listDirectory(req, res, user);
  }
  
  if (pathname.startsWith('/download/') && req.method === 'GET') {
    return downloadFile(req, res, user);
  }
  
  if (pathname === '/upload' && req.method === 'POST') {
    return uploadFile(req, res, user);
  }
  
  if (pathname.startsWith('/delete/') && req.method === 'POST') {
    return deleteFile(req, res, user);
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 - Not Found</h1>');
}

/**
 * Parsea cookies
 */
function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name) cookies[name] = value;
  });
  return cookies;
}

function serveLoginPage(res) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login - File Server</title>
      <style>
        body { font-family: Arial; max-width: 400px; margin: 100px auto; padding: 20px; }
        input { width: 100%; padding: 10px; margin: 10px 0; }
        button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
        button:hover { background: #0056b3; }
        .error { color: red; }
      </style>
    </head>
    <body>
      <h1>🔐 File Server Login</h1>
      <form method="POST" action="/login">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
      <p><small>Demo: admin / admin123</small></p>
    </body>
    </html>
  `;
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

function redirectToLogin(res) {
  res.writeHead(302, { 'Location': '/login' });
  res.end();
}

module.exports = { routeRequest };
```

### file-handler.js
```javascript
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { generateDirectoryHTML } = require('./html-generator');

const FILES_DIR = path.join(__dirname, 'files');
const COMPRESS_THRESHOLD = 1024 * 1024;  // 1MB

/**
 * Lista contenuto directory
 */
function listDirectory(req, res, user) {
  const requestPath = req.url.replace('/browse/', '') || '/';
  const fullPath = path.join(FILES_DIR, requestPath);
  
  // Previeni path traversal
  if (!fullPath.startsWith(FILES_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }
  
  fs.readdir(fullPath, { withFileTypes: true }, (err, items) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Error reading directory');
    }
    
    // Genera HTML
    const html = generateDirectoryHTML(items, requestPath, user);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  });
}

/**
 * Download file con compressione opzionale
 */
function downloadFile(req, res, user) {
  const filePath = req.url.replace('/download/', '');
  const fullPath = path.join(FILES_DIR, filePath);
  
  // Security check
  if (!fullPath.startsWith(FILES_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  
  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      return res.end('File not found');
    }
    
    const filename = path.basename(fullPath);
    
    // Se file grande, comprimi
    if (stats.size > COMPRESS_THRESHOLD) {
      res.writeHead(200, {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${filename}.gz"`,
        'Content-Encoding': 'gzip'
      });
      
      const readStream = fs.createReadStream(fullPath);
      const gzip = zlib.createGzip();
      readStream.pipe(gzip).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      
      const readStream = fs.createReadStream(fullPath);
      readStream.pipe(res);
    }
  });
}

// TODO: Implementa uploadFile() e deleteFile()

module.exports = {
  listDirectory,
  downloadFile,
  uploadFile,
  deleteFile
};
```

## 🎓 Suggerimenti Implementazione

### 1. Upload Multipart
```javascript
// Parsea multipart/form-data manualmente o usa libreria come 'formidable'
function uploadFile(req, res, user) {
  const boundary = extractBoundary(req.headers['content-type']);
  let fileData = Buffer.alloc(0);
  
  req.on('data', chunk => {
    fileData = Buffer.concat([fileData, chunk]);
  });
  
  req.on('end', () => {
    const file = parseMultipartData(fileData, boundary);
    fs.writeFile(path.join(FILES_DIR, 'uploads', file.filename), file.data, (err) => {
      // ...
    });
  });
}
```

### 2. Compressione Stream
```javascript
// Comprimi durante il download
const readStream = fs.createReadStream(filePath);
const gzip = zlib.createGzip();
readStream.pipe(gzip).pipe(res);
```

### 3. HTML Generator
```javascript
function generateDirectoryHTML(items, currentPath, user) {
  return `
    <!DOCTYPE html>
    <html>
    <head><title>Files - ${currentPath}</title></head>
    <body>
      <h1>📁 ${currentPath}</h1>
      <p>Logged in as: ${user.username} | <a href="/logout">Logout</a></p>
      <ul>
        ${items.map(item => `
          <li>
            ${item.isDirectory() ? '📁' : '📄'} 
            <a href="/browse/${path.join(currentPath, item.name)}">${item.name}</a>
          </li>
        `).join('')}
      </ul>
      <form method="POST" action="/upload" enctype="multipart/form-data">
        <input type="file" name="file">
        <button>Upload</button>
      </form>
    </body>
    </html>
  `;
}
```

## ✅ Criteri di Valutazione

- [ ] Server avvia correttamente
- [ ] Sistema autenticazione funziona
- [ ] Navigazione directory funziona
- [ ] Upload file funziona
- [ ] Download file funziona
- [ ] Compressione applicata ai file grandi
- [ ] Eliminazione file funziona
- [ ] Path traversal è prevenuto
- [ ] Sessioni sono gestite correttamente
- [ ] Interface HTML è usabile

## 🚀 Estensioni Avanzate

1. **Database**: Usa SQLite invece di JSON per utenti
2. **File sharing**: Genera link condivisibili temporanei
3. **Permissions**: Imple menta permessi per file/cartelle
4. **Search**: Funzione di ricerca file
5. **Thumbnails**: Genera anteprime per immagini
6. **Drag & drop**: Upload con drag & drop
7. **Progress bar**: Mostra progresso upload/download
8. **File versioning**: Mantieni versioni precedenti
9. **Quota**: Limiti spazio per utente
10. **HTTPS**: Aggiungi supporto SSL/TLS

## 📖 File users.json

```json
[
  {
    "username": "admin",
    "password": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
    "role": "admin"
  },
  {
    "username": "user",
    "password": "04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb",
    "role": "user"
  }
]
```
*Passwords: admin123, user123 (SHA-256)*

## 🐛 Debug Tips

1. **Log tutto**: Aggiungi console.log per ogni richiesta
2. **Test manualmente**: Usa Postman o curl per testare endpoints
3. **Check permessi**: Verifica permessi file system
4. **Path issues**: Stampa fullPath per debug path traversal
5. **Memory leaks**: Chiudi sempre stream e file descriptors

## 📖 Risorse Utili

- [HTTP File Upload](https://nodejs.org/en/knowledge/HTTP/servers/how-to-handle-multipart-form-data/)
- [Streams Guide](https://nodejs.org/api/stream.html)
- [Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [formidable library](https://github.com/node-formidable/formidable) (alternativa per multipart)
