# Modulo HTTP in Node.js

## Introduzione al Modulo HTTP

Il modulo HTTP è uno dei moduli core di Node.js e fornisce funzionalità per creare server HTTP e client HTTP. Questo modulo è fondamentale per lo sviluppo di applicazioni web in Node.js, poiché consente di gestire richieste e risposte HTTP senza dipendenze esterne.

## Importare il Modulo HTTP

Per utilizzare il modulo HTTP in un'applicazione Node.js, è necessario importarlo:

```javascript
const http = require('http');
```

## Creazione di un Server HTTP Base

La funzione `createServer()` del modulo HTTP crea un nuovo server HTTP che può ricevere richieste e inviare risposte:

```javascript
const http = require('http');

// Creazione del server
const server = http.createServer((req, res) => {
  // Qui gestiamo le richieste e le risposte
  res.statusCode = 200; // Codice di stato HTTP
  res.setHeader('Content-Type', 'text/plain'); // Intestazione della risposta
  res.end('Hello World\n'); // Corpo della risposta e chiusura della connessione
});

// Avvio del server sulla porta 3000
server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

In questo esempio:

1. Creiamo un server HTTP utilizzando `http.createServer()`.
2. Passiamo una funzione di callback che viene eseguita ogni volta che il server riceve una richiesta.
3. La funzione di callback riceve due oggetti: `req` (richiesta) e `res` (risposta).
4. Impostiamo il codice di stato, le intestazioni e il corpo della risposta.
5. Avviamo il server sulla porta 3000.

## L'Oggetto Request (req)

L'oggetto `req` rappresenta la richiesta HTTP e contiene informazioni come l'URL, i metodi HTTP, le intestazioni e il corpo della richiesta.

### Proprietà principali dell'oggetto Request

- **req.url**: L'URL della richiesta.
- **req.method**: Il metodo HTTP della richiesta (GET, POST, PUT, DELETE, ecc.).
- **req.headers**: Le intestazioni della richiesta.
- **req.httpVersion**: La versione HTTP della richiesta.

### Esempio di utilizzo dell'oggetto Request

```javascript
const server = http.createServer((req, res) => {
  console.log(`URL richiesto: ${req.url}`);
  console.log(`Metodo: ${req.method}`);
  console.log(`Intestazioni: ${JSON.stringify(req.headers)}`);
  
  // Resto del codice...
});
```

### Lettura del corpo della richiesta

A differenza dell'URL e delle intestazioni, il corpo della richiesta non è immediatamente disponibile. È necessario raccogliere i dati in arrivo attraverso gli eventi `data` e `end`:

```javascript
const server = http.createServer((req, res) => {
  let body = '';
  
  // L'evento 'data' viene emesso quando arrivano nuovi dati
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  
  // L'evento 'end' viene emesso quando tutti i dati sono stati ricevuti
  req.on('end', () => {
    console.log(`Corpo della richiesta: ${body}`);
    
    // Ora possiamo elaborare i dati e inviare una risposta
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Dati ricevuti con successo\n');
  });
});
```

## L'Oggetto Response (res)

L'oggetto `res` rappresenta la risposta HTTP che il server invierà al client. Fornisce metodi per impostare il codice di stato, le intestazioni e il corpo della risposta.

### Metodi principali dell'oggetto Response

- **res.statusCode**: Imposta il codice di stato HTTP della risposta.
- **res.setHeader(name, value)**: Imposta un'intestazione della risposta.
- **res.writeHead(statusCode, headers)**: Scrive il codice di stato e le intestazioni della risposta.
- **res.write(data)**: Scrive dati nel corpo della risposta.
- **res.end([data])**: Termina la risposta e opzionalmente invia dati.

### Esempio di utilizzo dell'oggetto Response

```javascript
const server = http.createServer((req, res) => {
  // Metodo 1: Impostare codice di stato e intestazioni separatamente
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Custom-Header', 'Hello');
  
  // Metodo 2: Impostare codice di stato e intestazioni in una volta
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'X-Custom-Header': 'Hello'
  });
  
  // Scrivere dati nel corpo della risposta
  res.write('<html><body>');
  res.write('<h1>Hello, World!</h1>');
  res.write('</body></html>');
  
  // Terminare la risposta
  res.end();
});
```

## Routing con il Modulo HTTP

Il modulo HTTP non fornisce un sistema di routing integrato, ma è possibile implementarne uno semplice utilizzando l'URL e il metodo della richiesta:

```javascript
const http = require('http');
const url = require('url'); // Modulo per il parsing degli URL

const server = http.createServer((req, res) => {
  // Parsing dell'URL
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, ''); // Rimuove gli slash iniziali e finali
  
  // Routing basato sul percorso e sul metodo
  if (req.method === 'GET') {
    if (trimmedPath === '' || trimmedPath === 'home') {
      // Route per la home page
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>Home Page</h1>');
    } else if (trimmedPath === 'about') {
      // Route per la pagina about
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>About Page</h1>');
    } else {
      // Route non trovata
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Page Not Found</h1>');
    }
  } else if (req.method === 'POST' && trimmedPath === 'api/users') {
    // Route per creare un utente
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        // Qui elaboreremmo i dati dell'utente
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User created successfully', user: userData }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    // Metodo non supportato
    res.writeHead(405, { 'Content-Type': 'text/html' });
    res.end('<h1>405 - Method Not Allowed</h1>');
  }
});

server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

## Servire File Statici

Il modulo HTTP può essere utilizzato insieme al modulo `fs` (File System) per servire file statici:

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Otteniamo il percorso del file richiesto
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html'; // Pagina predefinita
  }
  
  // Otteniamo l'estensione del file
  const extname = path.extname(filePath);
  
  // Definiamo i tipi MIME
  const contentType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
  }[extname] || 'text/plain';
  
  // Leggiamo il file
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File non trovato
        fs.readFile('./404.html', (error, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Errore del server
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // File trovato, inviamo il contenuto
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

## Gestione degli Errori

È importante gestire gli errori che possono verificarsi durante l'esecuzione del server:

```javascript
const server = http.createServer((req, res) => {
  // Gestione degli errori nella richiesta
  req.on('error', (err) => {
    console.error(`Errore nella richiesta: ${err.message}`);
    res.statusCode = 400;
    res.end('Bad Request');
  });
  
  // Gestione degli errori nella risposta
  res.on('error', (err) => {
    console.error(`Errore nella risposta: ${err.message}`);
  });
  
  // Resto del codice...
});

// Gestione degli errori del server
server.on('error', (err) => {
  console.error(`Errore del server: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error('La porta è già in uso');
  }
});

// Gestione della chiusura del server
server.on('close', () => {
  console.log('Server chiuso');
});
```

## Limitazioni del Modulo HTTP Nativo

Nonostante il modulo HTTP sia potente, presenta alcune limitazioni:

1. **Routing Manuale**: Non fornisce un sistema di routing integrato, richiedendo implementazioni manuali.

2. **Gestione del Corpo della Richiesta**: La lettura del corpo della richiesta richiede la gestione manuale degli eventi.

3. **Middleware**: Non supporta nativamente il concetto di middleware.

4. **Scalabilità del Codice**: Per applicazioni complesse, il codice può diventare difficile da mantenere.

Per superare queste limitazioni, molti sviluppatori si affidano a framework come Express.js, che forniscono astrazioni di alto livello sul modulo HTTP nativo.

## Conclusione

Il modulo HTTP di Node.js è uno strumento potente per creare server web. Offre un controllo di basso livello sulle richieste e le risposte HTTP, permettendo di implementare server personalizzati. Tuttavia, per applicazioni più complesse, potrebbe essere più efficiente utilizzare framework come Express.js, che semplificano molte attività comuni.

Nel prossimo capitolo, esploreremo Express.js e come semplifica lo sviluppo di applicazioni web in Node.js.