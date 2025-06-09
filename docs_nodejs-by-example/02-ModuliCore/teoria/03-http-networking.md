# HTTP e Networking in Node.js

## Introduzione

Node.js eccelle nelle operazioni di rete grazie alla sua architettura event-driven e non bloccante. Il modulo `http` è uno dei moduli core più importanti e viene utilizzato per creare server web e client HTTP. Insieme ad altri moduli di networking, consente di sviluppare applicazioni di rete efficienti e scalabili.

## Il Modulo HTTP

### Importare il Modulo

```javascript
const http = require('http');
```

### Creare un Server HTTP

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // Impostare lo status code della risposta
  res.statusCode = 200;
  
  // Impostare gli header della risposta
  res.setHeader('Content-Type', 'text/html');
  
  // Inviare il corpo della risposta
  res.end('<h1>Hello, World!</h1>');
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}/`);
});
```

### Gestire Richieste HTTP

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  // Ottenere l'URL della richiesta
  const url = req.url;
  
  // Ottenere il metodo della richiesta
  const method = req.method;
  
  // Ottenere gli header della richiesta
  const headers = req.headers;
  
  console.log(`Richiesta ${method} a ${url}`);
  
  // Gestire diverse route
  if (url === '/') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>Home Page</h1>');
  } else if (url === '/about') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>About Page</h1>');
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>404 - Pagina non trovata</h1>');
  }
});

server.listen(3000);
```

### Gestire Dati POST

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/data') {
    let body = '';
    
    // Raccogliere i dati quando arrivano
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    // Quando tutti i dati sono stati ricevuti
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Dati ricevuti:', data);
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ message: 'Dati ricevuti con successo', data }));
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'JSON non valido' }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end();
  }
});

server.listen(3000);
```

### Effettuare Richieste HTTP

```javascript
const http = require('http');

// Opzioni della richiesta
const options = {
  hostname: 'example.com',
  port: 80,
  path: '/api/data',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

// Creare la richiesta
const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  
  // Raccogliere i dati della risposta
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  // Quando la risposta è completa
  res.on('end', () => {
    console.log('Risposta completa:', data);
    try {
      const parsedData = JSON.parse(data);
      console.log('Dati parsati:', parsedData);
    } catch (e) {
      console.error('Errore nel parsing JSON:', e);
    }
  });
});

// Gestire gli errori
req.on('error', (e) => {
  console.error(`Errore nella richiesta: ${e.message}`);
});

// Inviare la richiesta
req.end();
```

### Metodo Semplificato per GET

```javascript
const http = require('http');

http.get('http://example.com/api/data', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(data);
  });
}).on('error', (err) => {
  console.error(`Errore: ${err.message}`);
});
```

## Il Modulo HTTPS

Per comunicazioni sicure, Node.js fornisce il modulo `https` che funziona in modo simile al modulo `http` ma utilizza SSL/TLS.

```javascript
const https = require('https');
const fs = require('fs');

// Opzioni per il server HTTPS
const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem')
};

// Creare un server HTTPS
const server = https.createServer(options, (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>Server HTTPS sicuro</h1>');
});

server.listen(443, () => {
  console.log('Server HTTPS in esecuzione su https://localhost:443/');
});
```

## Il Modulo URL

Il modulo `url` fornisce utilità per la risoluzione e l'analisi degli URL.

```javascript
const url = require('url');

// Parsing di un URL
const myURL = new URL('https://example.com:8080/path?query=value#fragment');

console.log('Hostname:', myURL.hostname); // example.com
console.log('Pathname:', myURL.pathname); // /path
console.log('Search:', myURL.search); // ?query=value
console.log('Hash:', myURL.hash); // #fragment
console.log('Port:', myURL.port); // 8080

// Costruire un URL
const newURL = new URL('https://example.com');
newURL.pathname = '/products';
newURL.search = '?category=electronics';
console.log(newURL.href); // https://example.com/products?category=electronics
```

## Il Modulo Net

Il modulo `net` fornisce un'API per creare server e client TCP.

### Creare un Server TCP

```javascript
const net = require('net');

const server = net.createServer((socket) => {
  console.log('Client connesso');
  
  // Gestire i dati in arrivo
  socket.on('data', (data) => {
    console.log(`Dati ricevuti: ${data}`);
    // Inviare una risposta
    socket.write('Dati ricevuti\r\n');
  });
  
  // Gestire la chiusura della connessione
  socket.on('end', () => {
    console.log('Client disconnesso');
  });
  
  // Inviare un messaggio di benvenuto
  socket.write('Benvenuto al server TCP!\r\n');
});

server.listen(9000, () => {
  console.log('Server TCP in ascolto sulla porta 9000');
});
```

### Creare un Client TCP

```javascript
const net = require('net');

const client = net.createConnection({ port: 9000 }, () => {
  console.log('Connesso al server');
  client.write('Hello, server!\r\n');
});

client.on('data', (data) => {
  console.log(data.toString());
  client.end();
});

client.on('end', () => {
  console.log('Disconnesso dal server');
});
```

## Il Modulo DNS

Il modulo `dns` fornisce funzioni per la risoluzione dei nomi di dominio.

```javascript
const dns = require('dns');

// Risolvere un hostname in indirizzi IPv4
dns.resolve4('example.com', (err, addresses) => {
  if (err) throw err;
  console.log(`Indirizzi IPv4: ${JSON.stringify(addresses)}`);
});

// Risolvere un hostname in indirizzi IPv6
dns.resolve6('example.com', (err, addresses) => {
  if (err) throw err;
  console.log(`Indirizzi IPv6: ${JSON.stringify(addresses)}`);
});

// Risolvere record MX
dns.resolveMx('example.com', (err, addresses) => {
  if (err) throw err;
  console.log(`Record MX: ${JSON.stringify(addresses)}`);
});

// Lookup (utilizza il resolver del sistema operativo)
dns.lookup('example.com', (err, address, family) => {
  if (err) throw err;
  console.log(`Indirizzo: ${address}, Famiglia IP: IPv${family}`);
});
```

## WebSockets

Per implementare WebSockets in Node.js, è comune utilizzare librerie di terze parti come `ws` o `socket.io`.

### Esempio con la libreria `ws`

```javascript
// Prima installare: npm install ws
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Nuovo client connesso');
  
  // Gestire i messaggi in arrivo
  ws.on('message', (message) => {
    console.log(`Messaggio ricevuto: ${message}`);
    
    // Inviare una risposta
    ws.send(`Hai inviato: ${message}`);
  });
  
  // Inviare un messaggio di benvenuto
  ws.send('Benvenuto al server WebSocket!');
});
```

## Conclusione

Node.js offre un'ampia gamma di moduli per lo sviluppo di applicazioni di rete, dal semplice server HTTP a soluzioni più complesse come WebSockets. La sua architettura non bloccante lo rende particolarmente adatto per applicazioni che richiedono molte connessioni simultanee e operazioni di I/O di rete.