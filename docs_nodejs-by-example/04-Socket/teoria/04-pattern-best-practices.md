# Pattern e Best Practices per Socket Programming

## Indice
1. [Pattern Architetturali](#pattern-architetturali)
2. [Design Protocol](#design-protocol)
3. [Message Framing](#message-framing)
4. [Error Handling](#error-handling)
5. [Connection Management](#connection-management)
6. [Performance Optimization](#performance-optimization)
7. [Security Best Practices](#security)
8. [Testing e Debugging](#testing)
9. [Monitoring e Logging](#monitoring)
10. [Deployment](#deployment)

---

## 1. Pattern Architetturali {#pattern-architetturali}

### Pattern: Request-Response

Il pattern più comune per comunicazione client-server.

**Caratteristiche:**
- Client invia richiesta
- Server elabora e risponde
- Sincrono o asincrono

#### Implementazione TCP

```javascript
// Server
const net = require('net');

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        try {
            const request = JSON.parse(data.toString());
            
            // Processa request
            const response = processRequest(request);
            
            // Invia response
            socket.write(JSON.stringify(response) + '\n');
            
        } catch (err) {
            socket.write(JSON.stringify({
                error: 'Invalid request',
                message: err.message
            }) + '\n');
        }
    });
});

function processRequest(request) {
    switch (request.action) {
        case 'GET':
            return { status: 'ok', data: getData(request.id) };
        case 'POST':
            return { status: 'ok', data: saveData(request.data) };
        default:
            return { status: 'error', message: 'Unknown action' };
    }
}

server.listen(3000);
```

```javascript
// Client con Promise
const net = require('net');

class APIClient {
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }
    
    request(action, data) {
        return new Promise((resolve, reject) => {
            const client = net.connect(this.port, this.host, () => {
                const request = JSON.stringify({ action, data });
                client.write(request + '\n');
            });
            
            let buffer = '';
            
            client.on('data', (data) => {
                buffer += data.toString();
                
                // Cerca newline (end of response)
                const newlineIndex = buffer.indexOf('\n');
                if (newlineIndex !== -1) {
                    const responseStr = buffer.substring(0, newlineIndex);
                    const response = JSON.parse(responseStr);
                    
                    client.end();
                    
                    if (response.status === 'ok') {
                        resolve(response.data);
                    } else {
                        reject(new Error(response.message));
                    }
                }
            });
            
            client.on('error', reject);
            
            client.on('timeout', () => {
                client.destroy();
                reject(new Error('Request timeout'));
            });
            
            client.setTimeout(5000);
        });
    }
}

// Uso
const client = new APIClient('localhost', 3000);

async function main() {
    try {
        const data = await client.request('GET', { id: 123 });
        console.log('Data:', data);
        
        const result = await client.request('POST', { name: 'Test' });
        console.log('Result:', result);
        
    } catch (err) {
        console.error('Error:', err);
    }
}

main();
```

### Pattern: Publish-Subscribe

Utile per broadcasting eventi a multiple parti interessate.

```javascript
// PubSub Server
const net = require('net');

class PubSubServer {
    constructor() {
        this.topics = new Map(); // topic -> Set di socket
        this.server = net.createServer((socket) => this.handleClient(socket));
    }
    
    handleClient(socket) {
        socket.subscriptions = new Set();
        
        socket.on('data', (data) => {
            const lines = data.toString().split('\n');
            
            lines.forEach(line => {
                if (!line.trim()) return;
                
                try {
                    const message = JSON.parse(line);
                    this.handleMessage(socket, message);
                } catch (err) {
                    socket.write(JSON.stringify({
                        error: 'Invalid message'
                    }) + '\n');
                }
            });
        });
        
        socket.on('end', () => {
            this.unsubscribeAll(socket);
        });
    }
    
    handleMessage(socket, message) {
        switch (message.type) {
            case 'SUBSCRIBE':
                this.subscribe(socket, message.topic);
                break;
                
            case 'UNSUBSCRIBE':
                this.unsubscribe(socket, message.topic);
                break;
                
            case 'PUBLISH':
                this.publish(message.topic, message.data);
                break;
                
            default:
                socket.write(JSON.stringify({
                    error: 'Unknown message type'
                }) + '\n');
        }
    }
    
    subscribe(socket, topic) {
        if (!this.topics.has(topic)) {
            this.topics.set(topic, new Set());
        }
        
        this.topics.get(topic).add(socket);
        socket.subscriptions.add(topic);
        
        socket.write(JSON.stringify({
            type: 'SUBSCRIBED',
            topic
        }) + '\n');
    }
    
    unsubscribe(socket, topic) {
        if (this.topics.has(topic)) {
            this.topics.get(topic).delete(socket);
            
            if (this.topics.get(topic).size === 0) {
                this.topics.delete(topic);
            }
        }
        
        socket.subscriptions.delete(topic);
        
        socket.write(JSON.stringify({
            type: 'UNSUBSCRIBED',
            topic
        }) + '\n');
    }
    
    unsubscribeAll(socket) {
        socket.subscriptions.forEach(topic => {
            this.unsubscribe(socket, topic);
        });
    }
    
    publish(topic, data) {
        if (!this.topics.has(topic)) {
            return;
        }
        
        const message = JSON.stringify({
            type: 'MESSAGE',
            topic,
            data,
            timestamp: Date.now()
        }) + '\n';
        
        this.topics.get(topic).forEach(socket => {
            if (!socket.destroyed) {
                socket.write(message);
            }
        });
    }
    
    listen(port) {
        this.server.listen(port, () => {
            console.log(`PubSub server listening on port ${port}`);
        });
    }
}

// Avvia server
const pubsub = new PubSubServer();
pubsub.listen(3000);
```

### Pattern: Connection Pool

Per riutilizzare connessioni e migliorare performance.

```javascript
class ConnectionPool {
    constructor(options = {}) {
        this.host = options.host || 'localhost';
        this.port = options.port || 3000;
        this.maxConnections = options.maxConnections || 10;
        this.minConnections = options.minConnections || 2;
        this.idleTimeout = options.idleTimeout || 30000;
        
        this.available = [];
        this.inUse = new Set();
        this.waiting = [];
        
        // Crea connessioni iniziali
        for (let i = 0; i < this.minConnections; i++) {
            this.createConnection();
        }
    }
    
    createConnection() {
        const socket = net.connect(this.port, this.host);
        
        socket.poolMeta = {
            lastUsed: Date.now(),
            created: Date.now()
        };
        
        socket.on('connect', () => {
            this.available.push(socket);
            this.processWaiting();
        });
        
        socket.on('error', (err) => {
            console.error('Connection error:', err);
            this.removeConnection(socket);
        });
        
        socket.on('close', () => {
            this.removeConnection(socket);
        });
        
        return socket;
    }
    
    async acquire() {
        // Connessione disponibile?
        if (this.available.length > 0) {
            const socket = this.available.shift();
            this.inUse.add(socket);
            socket.poolMeta.lastUsed = Date.now();
            return socket;
        }
        
        // Possiamo creare nuova connessione?
        if (this.totalConnections() < this.maxConnections) {
            const socket = this.createConnection();
            this.inUse.add(socket);
            return new Promise((resolve) => {
                socket.once('connect', () => {
                    this.inUse.add(socket);
                    resolve(socket);
                });
            });
        }
        
        // Aspetta connessione disponibile
        return new Promise((resolve) => {
            this.waiting.push(resolve);
        });
    }
    
    release(socket) {
        this.inUse.delete(socket);
        
        if (socket.destroyed) {
            return;
        }
        
        socket.poolMeta.lastUsed = Date.now();
        
        // Qualcuno in attesa?
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift();
            this.inUse.add(socket);
            resolve(socket);
        } else {
            this.available.push(socket);
        }
    }
    
    removeConnection(socket) {
        const index = this.available.indexOf(socket);
        if (index !== -1) {
            this.available.splice(index, 1);
        }
        this.inUse.delete(socket);
        
        if (!socket.destroyed) {
            socket.destroy();
        }
        
        // Mantieni minimo connessioni
        if (this.totalConnections() < this.minConnections) {
            this.createConnection();
        }
    }
    
    processWaiting() {
        while (this.waiting.length > 0 && this.available.length > 0) {
            const socket = this.available.shift();
            const resolve = this.waiting.shift();
            this.inUse.add(socket);
            resolve(socket);
        }
    }
    
    totalConnections() {
        return this.available.length + this.inUse.size;
    }
    
    async drain() {
        // Aspetta che tutte le connessioni tornino disponibili
        while (this.inUse.size > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Chiudi tutte le connessioni
        this.available.forEach(socket => {
            if (!socket.destroyed) {
                socket.destroy();
            }
        });
        
        this.available = [];
    }
    
    // Pulizia periodica connessioni idle
    startIdleCheck() {
        this.idleCheckInterval = setInterval(() => {
            const now = Date.now();
            
            this.available = this.available.filter(socket => {
                const idle = now - socket.poolMeta.lastUsed;
                
                if (idle > this.idleTimeout && this.totalConnections() > this.minConnections) {
                    socket.destroy();
                    return false;
                }
                
                return true;
            });
        }, 10000); // Check ogni 10 secondi
    }
    
    stopIdleCheck() {
        if (this.idleCheckInterval) {
            clearInterval(this.idleCheckInterval);
        }
    }
}
```

---

## 2. Design Protocol {#design-protocol}

### Anatomia di un Protocollo

Un buon protocollo definisce:

1. **Formato Messaggio**: Struttura dati
2. **Delimitatori**: Come separare messaggi
3. **Versioning**: Compatibilità retroattiva
4. **Error Codes**: Gestione errori standardizzata
5. **Authentication**: Sicurezza
6. **Flow Control**: Backpressure

### Esempio: Protocollo JSON-RPC Style

```javascript
// Struttura messaggio
{
    "version": "1.0",
    "type": "request|response|notification",
    "id": "unique-request-id",
    "method": "method-name",
    "params": {},
    "result": {},
    "error": {
        "code": 123,
        "message": "Error description"
    }
}
```

### Implementazione Protocol Handler

```javascript
class ProtocolHandler {
    constructor(socket) {
        this.socket = socket;
        this.buffer = '';
        this.version = '1.0';
        
        this.socket.on('data', (data) => this.handleData(data));
    }
    
    handleData(data) {
        this.buffer += data.toString();
        
        let newlineIndex;
        while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
            const line = this.buffer.substring(0, newlineIndex);
            this.buffer = this.buffer.substring(newlineIndex + 1);
            
            this.processMessage(line);
        }
    }
    
    processMessage(line) {
        try {
            const message = JSON.parse(line);
            
            // Validazione versione
            if (message.version !== this.version) {
                this.sendError(message.id, 400, 'Unsupported version');
                return;
            }
            
            // Dispatch per tipo
            switch (message.type) {
                case 'request':
                    this.handleRequest(message);
                    break;
                case 'response':
                    this.handleResponse(message);
                    break;
                case 'notification':
                    this.handleNotification(message);
                    break;
                default:
                    this.sendError(message.id, 400, 'Unknown message type');
            }
            
        } catch (err) {
            this.sendError(null, 400, 'Invalid JSON');
        }
    }
    
    sendRequest(id, method, params) {
        this.send({
            version: this.version,
            type: 'request',
            id,
            method,
            params
        });
    }
    
    sendResponse(id, result) {
        this.send({
            version: this.version,
            type: 'response',
            id,
            result
        });
    }
    
    sendError(id, code, message) {
        this.send({
            version: this.version,
            type: 'response',
            id,
            error: { code, message }
        });
    }
    
    send(message) {
        const json = JSON.stringify(message) + '\n';
        this.socket.write(json);
    }
}
```

---

## 3. Message Framing {#message-framing}

### Problema: Stream TCP

TCP è un byte stream senza delimitatori. Messaggi possono:
- Arrivare parziali
- Concatenarsi
- Frammentarsi

### Soluzione 1: Newline Delimited

```javascript
class NewlineFraming {
    constructor(socket) {
        this.socket = socket;
        this.buffer = '';
        
        this.socket.on('data', (data) => {
            this.buffer += data.toString();
            
            let newlineIndex;
            while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
                const message = this.buffer.substring(0, newlineIndex);
                this.buffer = this.buffer.substring(newlineIndex + 1);
                
                this.onMessage(message);
            }
        });
    }
    
    onMessage(message) {
        // Override
    }
    
    send(message) {
        this.socket.write(message + '\n');
    }
}
```

### Soluzione 2: Length-Prefixed

Più robusto - ogni messaggio preceduto da lunghezza.

```javascript
class LengthPrefixedFraming {
    constructor(socket) {
        this.socket = socket;
        this.buffer = Buffer.alloc(0);
        this.expectedLength = null;
        
        this.socket.on('data', (data) => {
            this.buffer = Buffer.concat([this.buffer, data]);
            this.processBuffer();
        });
    }
    
    processBuffer() {
        while (true) {
            // Leggi lunghezza (se non l'abbiamo già)
            if (this.expectedLength === null) {
                if (this.buffer.length < 4) {
                    return; // Non abbastanza dati
                }
                
                this.expectedLength = this.buffer.readUInt32BE(0);
                this.buffer = this.buffer.slice(4);
            }
            
            // Leggi messaggio
            if (this.buffer.length < this.expectedLength) {
                return; // Messaggio incompleto
            }
            
            const messageBuffer = this.buffer.slice(0, this.expectedLength);
            this.buffer = this.buffer.slice(this.expectedLength);
            this.expectedLength = null;
            
            this.onMessage(messageBuffer);
        }
    }
    
    onMessage(messageBuffer) {
        // Override
        const message = messageBuffer.toString();
        console.log('Received:', message);
    }
    
    send(message) {
        const messageBuffer = Buffer.from(message);
        const lengthBuffer = Buffer.allocUnsafe(4);
        lengthBuffer.writeUInt32BE(messageBuffer.length, 0);
        
        this.socket.write(Buffer.concat([lengthBuffer, messageBuffer]));
    }
}
```

---

## 4. Best Practices {#best-practices}

### 1. Gestione Errori Completa

```javascript
// Error codes standard
const ErrorCodes = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
    TIMEOUT: 504
};

// Sempre gestire tutti gli eventi error
socket.on('error', (err) => {
    console.error('Socket error:', err);
    // Non crashare - gestisci gracefully
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    // Log e cleanup
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});
```

### 2. Timeout Appropriati

```javascript
// Socket timeout
socket.setTimeout(30000); // 30 secondi

socket.on('timeout', () => {
    console.log('Socket timeout - closing');
    socket.end();
});

// Request timeout
const requestTimeout = setTimeout(() => {
    socket.destroy();
    callback(new Error('Request timeout'));
}, 5000);

socket.on('data', (data) => {
    clearTimeout(requestTimeout);
    // Process data...
});
```

### 3. Graceful Shutdown

```javascript
let isShuttingDown = false;
const activeConnections = new Set();

server.on('connection', (socket) => {
    if (isShuttingDown) {
        socket.end('Server is shutting down\n');
        return;
    }
    
    activeConnections.add(socket);
    
    socket.on('close', () => {
        activeConnections.delete(socket);
    });
});

function shutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log('Shutting down gracefully...');
    
    // Stop accepting new connections
    server.close(() => {
        console.log('Server closed');
    });
    
    // Close existing connections
    activeConnections.forEach(socket => {
        socket.end();
    });
    
    // Force exit after timeout
    setTimeout(() => {
        console.log('Forcing exit');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

### 4. Input Validation

```javascript
function validateMessage(message) {
    if (!message || typeof message !== 'object') {
        throw new Error('Invalid message format');
    }
    
    if (!message.type || typeof message.type !== 'string') {
        throw new Error('Missing or invalid message type');
    }
    
    if (message.type === 'request') {
        if (!message.method || typeof message.method !== 'string') {
            throw new Error('Missing or invalid method');
        }
        
        if (!message.id) {
            throw new Error('Missing request ID');
        }
    }
    
    return true;
}

socket.on('data', (data) => {
    try {
        const message = JSON.parse(data.toString());
        validateMessage(message);
        processMessage(message);
    } catch (err) {
        sendError(400, err.message);
    }
});
```

### 5. Rate Limiting

```javascript
class RateLimiter {
    constructor(maxRequests = 100, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.clients = new Map();
    }
    
    check(clientId) {
        const now = Date.now();
        const client = this.clients.get(clientId) || { requests: [], blocked: false };
        
        // Rimuovi richieste vecchie
        client.requests = client.requests.filter(
            time => now - time < this.windowMs
        );
        
        // Verifica limite
        if (client.requests.length >= this.maxRequests) {
            client.blocked = true;
            return false;
        }
        
        client.requests.push(now);
        client.blocked = false;
        this.clients.set(clientId, client);
        
        return true;
    }
    
    isBlocked(clientId) {
        const client = this.clients.get(clientId);
        return client ? client.blocked : false;
    }
}

const limiter = new RateLimiter(100, 60000);

server.on('connection', (socket) => {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    
    socket.on('data', (data) => {
        if (!limiter.check(clientId)) {
            socket.write('Rate limit exceeded\n');
            socket.end();
            return;
        }
        
        // Process request
    });
});
```

### 6. Logging Strutturato

```javascript
const logger = {
    info(event, data = {}) {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            event,
            ...data
        }));
    },
    
    error(event, error, data = {}) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            event,
            error: {
                message: error.message,
                stack: error.stack,
                code: error.code
            },
            ...data
        }));
    }
};

// Uso
logger.info('client_connected', {
    clientId,
    address: socket.remoteAddress,
    port: socket.remotePort
});

logger.error('request_failed', err, {
    requestId,
    method,
    clientId
});
```

### 7. Health Checks

```javascript
class HealthCheck {
    constructor(server) {
        this.server = server;
        this.stats = {
            uptime: process.uptime(),
            connections: 0,
            totalRequests: 0,
            errors: 0,
            memory: process.memoryUsage()
        };
    }
    
    getStatus() {
        return {
            status: this.server.listening ? 'healthy' : 'unhealthy',
            uptime: process.uptime(),
            stats: this.stats,
            memory: process.memoryUsage(),
            timestamp: Date.now()
        };
    }
    
    incrementConnections() {
        this.stats.connections++;
    }
    
    decrementConnections() {
        this.stats.connections--;
    }
    
    incrementRequests() {
        this.stats.totalRequests++;
    }
    
    incrementErrors() {
        this.stats.errors++;
    }
}

const health = new HealthCheck(server);

// Endpoint health check
server.on('connection', (socket) => {
    health.incrementConnections();
    
    socket.on('data', (data) => {
        if (data.toString().trim() === 'HEALTH') {
            socket.write(JSON.stringify(health.getStatus()) + '\n');
            socket.end();
            return;
        }
        
        health.incrementRequests();
        // Process normal request
    });
    
    socket.on('close', () => {
        health.decrementConnections();
    });
});
```

---

## Riepilogo Best Practices

✅ **Pattern Architetturali:**
- Request-Response per API
- Pub-Sub per eventi
- Connection Pool per performance

✅ **Protocol Design:**
- Versioning per compatibilità
- Error codes standardizzati
- Message framing robusto

✅ **Reliability:**
- Error handling completo
- Timeout appropriati
- Graceful shutdown
- Retry logic

✅ **Security:**
- Input validation
- Rate limiting
- Authentication
- Encryption (TLS)

✅ **Operations:**
- Logging strutturato
- Health checks
- Monitoring
- Testing

**Prossimi Step:**
- [Protocolli Applicativi](./05-protocolli-applicativi.md)
- [Esempi Pratici](../esempi/)
- [Esercizi](../esercizi/)
