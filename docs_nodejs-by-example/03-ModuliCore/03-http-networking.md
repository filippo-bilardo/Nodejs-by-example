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

## Server HTTP Avanzato con Middleware

### Sistema di Routing e Middleware

```javascript
const http = require('http');
const url = require('url');

class HTTPServer {
  constructor() {
    this.middlewares = [];
    this.routes = new Map();
    this.errorHandlers = [];
  }

  // Aggiungere middleware globale
  use(middleware) {
    this.middlewares.push(middleware);
  }

  // Definire route con middleware specifici
  route(method, path, ...handlers) {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, handlers);
  }

  get(path, ...handlers) { this.route('GET', path, ...handlers); }
  post(path, ...handlers) { this.route('POST', path, ...handlers); }
  put(path, ...handlers) { this.route('PUT', path, ...handlers); }
  delete(path, ...handlers) { this.route('DELETE', path, ...handlers); }

  // Gestione errori
  onError(handler) {
    this.errorHandlers.push(handler);
  }

  // Eseguire middleware in sequenza
  async executeMiddleware(req, res, middlewares, index = 0) {
    if (index >= middlewares.length) return;

    const middleware = middlewares[index];
    let nextCalled = false;

    const next = (error) => {
      if (nextCalled) return;
      nextCalled = true;
      
      if (error) {
        this.handleError(error, req, res);
      } else {
        this.executeMiddleware(req, res, middlewares, index + 1);
      }
    };

    try {
      await middleware(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    req.query = parsedUrl.query;
    req.pathname = parsedUrl.pathname;

    // Aggiungi metodi helper alla response
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };

    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    try {
      // Esegui middleware globali
      await this.executeMiddleware(req, res, this.middlewares);

      // Trova e esegui handler della route
      const routeKey = `${req.method}:${req.pathname}`;
      const handlers = this.routes.get(routeKey);

      if (handlers) {
        await this.executeMiddleware(req, res, handlers);
      } else {
        res.status(404).json({ error: 'Route not found' });
      }
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  handleError(error, req, res) {
    console.error('Server error:', error);

    // Esegui error handlers personalizzati
    for (const handler of this.errorHandlers) {
      try {
        handler(error, req, res);
        return;
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }

    // Error handler di default
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  listen(port, callback) {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    server.listen(port, callback);
    return server;
  }
}

// Middleware comuni
const cors = (options = {}) => (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', options.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', options.methods || 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', options.headers || 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
};

const logger = (req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    originalEnd.apply(this, args);
  };
  
  next();
};

const bodyParser = async (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
        next();
      } catch (error) {
        res.status(400).json({ error: 'Invalid JSON' });
      }
    });
  } else {
    next();
  }
};

const rateLimit = (options = {}) => {
  const requests = new Map();
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minuti
  const maxRequests = options.max || 100;

  return (req, res, next) => {
    const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(clientId)) {
      requests.set(clientId, []);
    }

    const clientRequests = requests.get(clientId);
    
    // Rimuovi richieste vecchie
    const validRequests = clientRequests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    validRequests.push(now);
    requests.set(clientId, validRequests);
    next();
  };
};

// Esempio di utilizzo
const app = new HTTPServer();

// Middleware globali
app.use(cors());
app.use(logger);
app.use(rateLimit({ max: 50, windowMs: 60000 }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server HTTP Avanzato', timestamp: new Date() });
});

app.post('/api/users', bodyParser, (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const user = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date()
  };

  res.status(201).json({ user, message: 'User created successfully' });
});

// Error handling
app.onError((error, req, res) => {
  console.error(`Custom error handler: ${error.message}`);
});

const server = app.listen(3000, () => {
  console.log('🚀 Server HTTP avanzato avviato su http://localhost:3000');
});
```

## Client HTTP Avanzato con Connection Pooling

```javascript
const http = require('http');
const https = require('https');
const { URL } = require('url');

class HTTPClient {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 30000,
      maxSockets: options.maxSockets || 10,
      keepAlive: options.keepAlive || true,
      ...options
    };

    // Agenti per connection pooling
    this.httpAgent = new http.Agent({
      keepAlive: this.options.keepAlive,
      maxSockets: this.options.maxSockets
    });

    this.httpsAgent = new https.Agent({
      keepAlive: this.options.keepAlive,
      maxSockets: this.options.maxSockets
    });
  }

  async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      
      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'Node.js HTTP Client',
          ...options.headers
        },
        agent: isHttps ? this.httpsAgent : this.httpAgent,
        timeout: this.options.timeout
      };

      const client = isHttps ? https : http;
      const req = client.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          };

          try {
            if (res.headers['content-type']?.includes('application/json')) {
              response.json = JSON.parse(data);
            }
          } catch (e) {
            // Non è JSON valido, ignora
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${this.options.timeout}ms`));
      });

      req.on('error', (error) => {
        reject(error);
      });

      // Invia il body se presente
      if (options.body) {
        if (typeof options.body === 'object') {
          req.write(JSON.stringify(options.body));
        } else {
          req.write(options.body);
        }
      }

      req.end();
    });
  }

  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

// Esempio di utilizzo del client HTTP
const client = new HTTPClient({
  timeout: 10000,
  maxSockets: 5
});

async function testAPI() {
  try {
    // GET request
    const response = await client.get('https://jsonplaceholder.typicode.com/posts/1');
    console.log('GET Response:', response.json);

    // POST request
    const newPost = await client.post('https://jsonplaceholder.typicode.com/posts', {
      title: 'Nuovo Post',
      body: 'Contenuto del post',
      userId: 1
    });
    console.log('POST Response:', newPost.json);

  } catch (error) {
    console.error('Errore API:', error.message);
  }
}

// testAPI();
```

## Conclusione

Node.js offre un'ampia gamma di moduli per lo sviluppo di applicazioni di rete, dal semplice server HTTP a soluzioni più complesse come WebSockets. La sua architettura non bloccante lo rende particolarmente adatto per applicazioni che richiedono molte connessioni simultanee e operazioni di I/O di rete.