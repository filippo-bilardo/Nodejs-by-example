// http-demo.js
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Creazione di un server HTTP di base
const server = http.createServer((req, res) => {
  // Analisi dell'URL richiesto
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`Richiesta ricevuta: ${req.method} ${pathname}`);
  
  // Gestione delle diverse route
  if (pathname === '/') {
    // Pagina principale
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Node.js</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .endpoint { background: #f4f4f4; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
          code { background: #e0e0e0; padding: 2px 4px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>Server HTTP di esempio</h1>
        <p>Benvenuto nel server HTTP di esempio creato con Node.js!</p>
        
        <h2>Endpoint disponibili:</h2>
        <div class="endpoint">
          <p><code>GET /</code> - Questa pagina</p>
        </div>
        <div class="endpoint">
          <p><code>GET /info</code> - Informazioni sulla richiesta</p>
        </div>
        <div class="endpoint">
          <p><code>GET /api</code> - Restituisce dati JSON</p>
        </div>
        <div class="endpoint">
          <p><code>GET /ora</code> - Restituisce l'ora corrente</p>
        </div>
      </body>
      </html>
    `);
  } 
  else if (pathname === '/info') {
    // Informazioni sulla richiesta
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Informazioni Richiesta</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .info { background: #f4f4f4; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>Informazioni sulla Richiesta</h1>
        
        <div class="info">
          <p><strong>Metodo:</strong> ${req.method}</p>
          <p><strong>URL:</strong> ${req.url}</p>
          <p><strong>Headers:</strong></p>
          <pre>${JSON.stringify(req.headers, null, 2)}</pre>
        </div>
        
        <p><a href="/">Torna alla home</a></p>
      </body>
      </html>
    `);
  } 
  else if (pathname === '/api') {
    // API che restituisce JSON
    const dati = {
      messaggio: 'Dati di esempio dall\'API',
      timestamp: new Date().toISOString(),
      endpoint: '/api'
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dati));
  } 
  else if (pathname === '/ora') {
    // Restituisce l'ora corrente
    const ora = new Date().toLocaleTimeString('it-IT');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ora Corrente</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
          h1 { color: #333; }
          .ora { font-size: 2em; margin: 20px 0; color: #007bff; }
        </style>
      </head>
      <body>
        <h1>Ora Corrente</h1>
        <div class="ora">${ora}</div>
        <p><a href="/">Torna alla home</a></p>
      </body>
      </html>
    `);
  } 
  else {
    // Pagina non trovata
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>404 - Pagina non trovata</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; text-align: center; }
          h1 { color: #d9534f; }
        </style>
      </head>
      <body>
        <h1>404 - Pagina non trovata</h1>
        <p>La pagina richiesta non esiste.</p>
        <p><a href="/">Torna alla home</a></p>
      </body>
      </html>
    `);
  }
});

// Porta su cui il server ascolterà
const PORT = 3000;

// Avvio del server
server.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
  console.log(`Apri http://localhost:${PORT} nel tuo browser`);
});

// Gestione degli errori del server
server.on('error', (err) => {
  console.error('Errore del server:', err);
});

// Nota: per terminare il server, premere Ctrl+C nella console