# 02 - Modulo net - Socket TCP

## Indice
- [Introduzione al Modulo net](#introduzione-al-modulo-net)
- [Creare un Server TCP](#creare-un-server-tcp)
- [Creare un Client TCP](#creare-un-client-tcp)
- [Eventi Socket](#eventi-socket)
- [Gestione Connessioni Multiple](#gestione-connessioni-multiple)
- [Buffer e Encoding](#buffer-e-encoding)
- [Backpressure](#backpressure)
- [Best Practices](#best-practices)

---

## Introduzione al Modulo net

Il modulo `net` di Node.js fornisce un'API asincrona per creare server e client TCP.

### Import
```javascript
const net = require('net');
```

### Caratteristiche Principali
- TCP socket stream-based
- Event-driven architecture
- Duplex stream interface
- Support per IPv4 e IPv6
- Connection pooling
- Pipe support

---

## Creare un Server TCP

### Server Base

```javascript
const net = require('net');

// Crea server
const server = net.createServer((socket) => {
    console.log('Client connesso');
    
    // Logica gestione client
    socket.write('Benvenuto!\n');
    
    socket.on('data', (data) => {
        console.log('Ricevuto:', data.toString());
    });
});

// Avvia server
server.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000');
});
```

### net.createServer([options][, connectionListener])

**Parametri:**

```javascript
const server = net.createServer({
    allowHalfOpen: false,        // Permetti FIN half-open
    pauseOnConnect: false,       // Pausa socket al connect
    noDelay: true,              // Disable Nagle algorithm
    keepAlive: true,            // Enable SO_KEEPALIVE
    keepAliveInitialDelay: 0    // Delay iniziale keepalive (ms)
}, (socket) => {
    // Connection handler
});
```

**Opzioni Comuni:**

| Opzione | Tipo | Default | Descrizione |
|---------|------|---------|-------------|
| `allowHalfOpen` | boolean | false | Permetti connessioni half-open |
| `pauseOnConnect` | boolean | false | Socket in pausa al connect |
| `noDelay` | boolean | true | Disabilita Nagle algorithm |
| `keepAlive` | boolean | false | Abilita TCP keepalive |

### server.listen()

**Metodi disponibili:**

```javascript
// 1. Porta specifica
server.listen(3000);

// 2. Porta + host
server.listen(3000, '0.0.0.0');

// 3. Porta + host + callback
server.listen(3000, 'localhost', () => {
    console.log('Server started');
});

// 4. Oggetto opzioni
server.listen({
    port: 3000,
    host: '0.0.0.0',
    backlog: 511,           // Max pending connections
    exclusive: false,       // Non condividere porta
    ipv6Only: false        // Solo IPv6
});

// 5. Named pipe (Unix socket)
server.listen('/tmp/echo.sock');

// 6. File descriptor
const fd = fs.openSync('/path/to/socket', 'r+');
server.listen({ fd });
```

### Eventi Server

```javascript
// Crea server TCP 
const server = net.createServer();

// Server pronto ad accettare connessioni
server.on('listening', () => {
    const addr = server.address();
    console.log(`Server listening on ${addr.address}:${addr.port}`);
});

// Nuova connessione
server.on('connection', (socket) => {
    console.log('New connection');
});

// Errore server
server.on('error', (err) => {
    console.error('Server error:', err);
    
    if (err.code === 'EADDRINUSE') {
        console.error('Port already in use');
    }
});

// Server chiuso
server.on('close', () => {
    console.log('Server closed');
});

server.listen(3000);
```

### Esempio Server Completo

```javascript
const net = require('net');

const PORT = 3000;
const HOST = '0.0.0.0';

// Tracking connessioni
const clients = new Set();

const server = net.createServer({
    noDelay: true,
    keepAlive: true
}, (socket) => {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    
    console.log(`[${clientId}] Connesso`);
    clients.add(socket);
    
    // Benvenuto
    socket.write(`Benvenuto! Sei il client ${clients.size}\n`);
    
    socket.setEncoding('utf8');
    
    socket.on('data', (data) => {
        console.log(`[${clientId}] ${data.trim()}`);
        socket.write(`Echo: ${data}`);
    });
    
    socket.on('end', () => {
        console.log(`[${clientId}] Disconnesso`);
        clients.delete(socket);
    });
    
    socket.on('error', (err) => {
        console.error(`[${clientId}] Errore:`, err.message);
        clients.delete(socket);
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Porta ${PORT} già in uso!`);
        process.exit(1);
    }
    throw err;
});

server.listen(PORT, HOST, () => {
    console.log(`Server TCP in ascolto su ${HOST}:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nChiusura server...');
    
    server.close(() => {
        console.log('Server chiuso');
        process.exit(0);
    });
    
    // Chiudi tutti i client
    clients.forEach(socket => socket.end());
});
```

---

## Creare un Client TCP

### Client Base

```javascript
const net = require('net');

// Connetti al server
const client = net.connect(3000, 'localhost', () => {
    console.log('Connesso al server!');
    client.write('Hello server!');
});

// Ricevi dati
client.on('data', (data) => {
    console.log('Server dice:', data.toString());
});

// Connessione chiusa
client.on('end', () => {
    console.log('Disconnesso dal server');
});
```

### net.connect() / net.createConnection()

Sono alias - stessa funzione:

```javascript
// Forma 1: porta + host + callback
const client = net.connect(3000, 'localhost', () => {
    console.log('Connesso!');
});

// Forma 2: oggetto opzioni
const client = net.connect({
    port: 3000,
    host: 'localhost',
    localAddress: '127.0.0.1',  // Indirizzo locale
    localPort: 0,               // Porta locale (0 = auto)
    family: 4,                  // IP family (4 o 6)
    timeout: 5000              // Connection timeout (ms)
});

// Forma 3: Unix socket
const client = net.connect('/tmp/echo.sock');
```

### Eventi Client

```javascript
const client = net.connect(3000, 'localhost');

// Connesso
client.on('connect', () => {
    console.log('Connessione stabilita');
});

// Dati ricevuti
client.on('data', (data) => {
    console.log('Ricevuto:', data);
});

// Server chiude connessione
client.on('end', () => {
    console.log('Server ha chiuso la connessione');
});

// Connessione completamente chiusa
client.on('close', (hadError) => {
    if (hadError) {
        console.log('Connessione chiusa con errori');
    } else {
        console.log('Connessione chiusa normalmente');
    }
});

// Errore
client.on('error', (err) => {
    console.error('Errore:', err.message);
    
    if (err.code === 'ECONNREFUSED') {
        console.error('Server non raggiungibile');
    } else if (err.code === 'ETIMEDOUT') {
        console.error('Timeout connessione');
    }
});

// Timeout
client.setTimeout(5000);
client.on('timeout', () => {
    console.log('Timeout!');
    client.end();
});
```

### Esempio Client Completo

```javascript
const net = require('net');
const readline = require('readline');

const PORT = 3000;
const HOST = 'localhost';

const client = net.connect(PORT, HOST);

// Interfaccia readline per input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

client.on('connect', () => {
    console.log(`✅ Connesso a ${HOST}:${PORT}`);
    console.log('Scrivi messaggi (quit per uscire):');
    promptUser();
});

client.on('data', (data) => {
    // Mostra risposta server
    console.log(`\n${data.toString()}`);
    promptUser();
});

client.on('end', () => {
    console.log('\n❌ Server ha chiuso la connessione');
    rl.close();
    process.exit(0);
});

client.on('error', (err) => {
    console.error('\n⚠️ Errore:', err.message);
    rl.close();
    process.exit(1);
});

function promptUser() {
    rl.question('> ', (input) => {
        if (input.trim().toLowerCase() === 'quit') {
            client.end();
            return;
        }
        
        client.write(input + '\n');
    });
}

process.on('SIGINT', () => {
    console.log('\n👋 Disconnessione...');
    client.end();
});
```

---

## Eventi Socket

### Eventi Principali

Un socket TCP è un **EventEmitter** e **Duplex Stream**.

```javascript
socket.on('connect', () => {
    // Socket connesso (solo client)
});

socket.on('data', (chunk) => {
    // Dati ricevuti
    // chunk è un Buffer o String (se setEncoding)
});

socket.on('drain', () => {
    // Buffer di scrittura svuotato
    // Puoi continuare a scrivere
});

socket.on('end', () => {
    // Altra parte ha inviato FIN
    // Connessione half-closed
});

socket.on('close', (hadError) => {
    // Socket completamente chiuso
});

socket.on('error', (err) => {
    // Errore sul socket
});

socket.on('timeout', () => {
    // Socket timeout
});

socket.on('lookup', (err, address, family, host) => {
    // DNS lookup completato
});
```

### Ciclo di Vita Socket

```
CLIENT                           SERVER
  |                                 |
  | connect() ─────────────────────>|
  |<────────────────────── on('connection')
  | on('connect')                   |
  |                                 |
  | write(data) ───────────────────>|
  |                          on('data')
  |                                 |
  |<──────────────────── write(data)|
  | on('data')                      |
  |                                 |
  | end() ─────────────────────────>|
  |                           on('end')
  |                                 |
  |<────────────────────────── end()|
  | on('end')                       |
  |                                 |
  | on('close')            on('close')
  |                                 |
```

### Esempio Gestione Eventi

```javascript
const socket = getSomeSocket();

// Buffer per dati parziali
let buffer = '';

socket.setEncoding('utf8');

socket.on('data', (chunk) => {
    buffer += chunk;
    
    // Processa messaggi completi (delimitati da \n)
    let index;
    while ((index = buffer.indexOf('\n')) !== -1) {
        const message = buffer.substring(0, index);
        buffer = buffer.substring(index + 1);
        
        processMessage(message);
    }
});

socket.on('end', () => {
    // Processa eventuali dati rimanenti
    if (buffer.length > 0) {
        processMessage(buffer);
    }
});

socket.on('error', (err) => {
    console.error('Socket error:', err);
    socket.destroy(); // Force close
});

socket.on('close', () => {
    console.log('Socket closed');
    cleanup();
});

function processMessage(msg) {
    console.log('Message:', msg);
}

function cleanup() {
    buffer = '';
}
```

---

## Gestione Connessioni Multiple

### Tracking Connessioni con Set

```javascript
const net = require('net');

const clients = new Set();

const server = net.createServer((socket) => {
    clients.add(socket);
    console.log(`Connessioni attive: ${clients.size}`);
    
    socket.on('close', () => {
        clients.delete(socket);
        console.log(`Connessioni attive: ${clients.size}`);
    });
});

server.listen(3000);
```

### Tracking con Map (più info)

```javascript
const clients = new Map();
let clientIdCounter = 0;

const server = net.createServer((socket) => {
    const clientId = ++clientIdCounter;
    
    clients.set(clientId, {
        socket: socket,
        id: clientId,
        address: socket.remoteAddress,
        port: socket.remotePort,
        connectedAt: new Date(),
        bytesReceived: 0,
        bytesSent: 0
    });
    
    socket.on('data', (data) => {
        const client = clients.get(clientId);
        client.bytesReceived += data.length;
    });
    
    socket.on('close', () => {
        clients.delete(clientId);
    });
});
```

### Broadcasting a Tutti i Client

```javascript
const clients = new Set();

function broadcast(message, excludeSocket = null) {
    clients.forEach(socket => {
        if (socket !== excludeSocket && !socket.destroyed) {
            socket.write(message);
        }
    });
}

const server = net.createServer((socket) => {
    clients.add(socket);
    
    broadcast(`Nuovo utente connesso\n`, socket);
    
    socket.on('data', (data) => {
        // Broadcast a tutti tranne mittente
        broadcast(data, socket);
    });
    
    socket.on('close', () => {
        clients.delete(socket);
        broadcast(`Utente disconnesso\n`);
    });
});
```

### Esempio Chat Server

```javascript
const net = require('net');

const clients = new Map();
let userId = 0;

const server = net.createServer((socket) => {
    const id = ++userId;
    const username = `User${id}`;
    
    clients.set(id, { socket, username });
    
    console.log(`${username} connesso`);
    
    socket.write(`Benvenuto ${username}!\n`);
    broadcast(`${username} è entrato nella chat\n`, id);
    
    socket.setEncoding('utf8');
    
    socket.on('data', (data) => {
        const message = `${username}: ${data}`;
        broadcast(message, id);
    });
    
    socket.on('end', () => {
        clients.delete(id);
        broadcast(`${username} ha lasciato la chat\n`);
        console.log(`${username} disconnesso`);
    });
    
    socket.on('error', (err) => {
        console.error(`${username} error:`, err.message);
    });
});

function broadcast(message, excludeId = null) {
    clients.forEach((client, id) => {
        if (id !== excludeId && !client.socket.destroyed) {
            client.socket.write(message);
        }
    });
}

server.listen(3000, () => {
    console.log('Chat server in ascolto sulla porta 3000');
});
```

---

## Buffer e Encoding

### Buffer vs String

```javascript
// Default: ricevi Buffer
socket.on('data', (chunk) => {
    console.log(chunk);  // <Buffer 48 65 6c 6c 6f>
    console.log(chunk.toString());  // "Hello"
});

// Imposta encoding: ricevi String
socket.setEncoding('utf8');
socket.on('data', (chunk) => {
    console.log(chunk);  // "Hello"
    console.log(typeof chunk);  // "string"
});
```

### Encoding Disponibili

```javascript
socket.setEncoding('utf8');     // UTF-8 (default text)
socket.setEncoding('ascii');    // ASCII
socket.setEncoding('base64');   // Base64
socket.setEncoding('hex');      // Hexadecimal
socket.setEncoding('binary');   // Binary (deprecated)
socket.setEncoding('ucs2');     // UCS-2/UTF-16
socket.setEncoding('utf16le');  // UTF-16 Little Endian
```

### Gestione Messaggi Parziali

TCP è uno stream - dati possono arrivare frammentati:

```javascript
// ❌ MALE - Assume messaggio completo
socket.on('data', (data) => {
    const message = JSON.parse(data.toString());
    // ERRORE se JSON parziale!
});

// ✅ BENE - Accumula fino a messaggio completo
let buffer = '';

socket.setEncoding('utf8');

socket.on('data', (chunk) => {
    buffer += chunk;
    
    // Messaggi delimitati da newline
    let index;
    while ((index = buffer.indexOf('\n')) !== -1) {
        const message = buffer.substring(0, index);
        buffer = buffer.substring(index + 1);
        
        try {
            const data = JSON.parse(message);
            processMessage(data);
        } catch (err) {
            console.error('Parse error:', err);
        }
    }
});
```

### Length-Prefixed Messages

```javascript
// Invia con lunghezza
function sendMessage(socket, message) {
    const buffer = Buffer.from(message, 'utf8');
    const length = Buffer.allocUnsafe(4);
    length.writeUInt32BE(buffer.length);
    
    socket.write(length);
    socket.write(buffer);
}

// Ricevi con lunghezza
let lengthBuffer = null;
let messageBuffer = null;
let expectedLength = 0;

socket.on('data', (chunk) => {
    let offset = 0;
    
    while (offset < chunk.length) {
        // Leggi lunghezza
        if (!lengthBuffer) {
            lengthBuffer = chunk.slice(offset, offset + 4);
            offset += 4;
            
            if (lengthBuffer.length === 4) {
                expectedLength = lengthBuffer.readUInt32BE();
                messageBuffer = Buffer.allocUnsafe(expectedLength);
                messageBuffer.fill(0);
            }
        }
        
        // Leggi messaggio
        if (messageBuffer) {
            const remaining = expectedLength - messageBuffer.length;
            const available = chunk.length - offset;
            const toCopy = Math.min(remaining, available);
            
            chunk.copy(messageBuffer, messageBuffer.length - remaining, offset, offset + toCopy);
            offset += toCopy;
            
            // Messaggio completo
            if (messageBuffer.length === expectedLength) {
                const message = messageBuffer.toString('utf8');
                processMessage(message);
                
                lengthBuffer = null;
                messageBuffer = null;
                expectedLength = 0;
            }
        }
    }
});
```

---

## Backpressure

### Cos'è il Backpressure

Quando scrivi più velocemente di quanto il socket possa inviare, il buffer si riempie.

```javascript
// write() ritorna false se buffer pieno
const canContinue = socket.write('data');

if (!canContinue) {
    console.log('Buffer pieno! Attendi drain');
}
```

### Gestione Corretta

```javascript
function sendData(socket, data) {
    const canContinue = socket.write(data);
    
    if (!canContinue) {
        // Buffer pieno - attendi drain
        return new Promise(resolve => {
            socket.once('drain', resolve);
        });
    }
    
    return Promise.resolve();
}

// Uso
async function sendMultiple(socket, dataArray) {
    for (const data of dataArray) {
        await sendData(socket, data);
    }
}
```

### Esempio Pratico

```javascript
const fs = require('fs');
const net = require('net');

// ❌ MALE - Ignora backpressure
const server = net.createServer((socket) => {
    const stream = fs.createReadStream('large-file.txt');
    
    stream.on('data', (chunk) => {
        socket.write(chunk);  // Potrebbe riempire buffer!
    });
});

// ✅ BENE - Usa pipe (gestisce backpressure)
const server = net.createServer((socket) => {
    const stream = fs.createReadStream('large-file.txt');
    stream.pipe(socket);  // Pipe gestisce automaticamente backpressure
});
```

---

## Best Practices

### 1. Sempre Gestire Errori

```javascript
socket.on('error', (err) => {
    console.error('Socket error:', err);
    socket.destroy();
});

server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        process.exit(1);
    }
});
```

### 2. Cleanup su Close

```javascript
socket.on('close', () => {
    // Cleanup risorse
    clearTimeout(timeout);
    delete clients[socketId];
    buffer = null;
});
```

### 3. Timeout Appropriati

```javascript
// Connection timeout
socket.setTimeout(30000);  // 30 secondi

socket.on('timeout', () => {
    console.log('Socket timeout');
    socket.end();
});
```

### 4. Graceful Shutdown

```javascript
process.on('SIGINT', () => {
    console.log('Shutting down...');
    
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    
    // Chiudi tutti i client
    clients.forEach(socket => socket.end());
    
    // Force exit dopo timeout
    setTimeout(() => {
        console.error('Force exit');
        process.exit(1);
    }, 5000);
});
```

### 5. Validazione Input

```javascript
socket.on('data', (data) => {
    const message = data.toString().trim();
    
    // Validazione
    if (message.length === 0) return;
    if (message.length > 1024) {
        socket.write('Error: message too long\n');
        return;
    }
    
    processMessage(message);
});
```

### 6. Logging Informativo

```javascript
function log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
    }));
}

socket.on('connect', () => {
    log('INFO', 'Client connected', {
        address: socket.remoteAddress,
        port: socket.remotePort
    });
});
```

---

## Riepilogo

### Concetti Chiave

✅ **net.createServer()** - Crea server TCP  
✅ **net.connect()** - Connetti a server TCP  
✅ **Eventi socket** - data, end, error, close  
✅ **Multiple connessioni** - Set/Map tracking  
✅ **Buffer/Encoding** - Gestione dati binari/testo  
✅ **Backpressure** - Gestione buffer overflow  

### Prossimi Passi

1. Leggi [03-modulo-dgram-udp.md](03-modulo-dgram-udp.md) per UDP
2. Studia [04-pattern-best-practices.md](04-pattern-best-practices.md)
3. Prova [esempi pratici](../esempi/)
4. Completa [esercizi](../esercizi/)

---

**Modulo `net` completato! 🎉**
