# Close Callbacks dell'Event Loop

## Cos'è la Fase Close Callbacks?

La fase **close callbacks** è l'ultima fase dell'Event Loop di Node.js. In questa fase vengono eseguiti i callback associati alla chiusura improvvisa di handle (socket, stream, file descriptor, ecc.) tramite eventi come `'close'`.

### Posizione nell'Event Loop

```
   ┌───────────────────────────┐
┌─>│           timers          │ 1. setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ 2. I/O callbacks differiti
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ 3. Uso interno
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ 4. I/O events
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │          check            │ 5. setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │ 6. Chiusure improvvise ← ULTIMA FASE
   └───────────────────────────┘
```

## Quando Vengono Eseguiti i Close Callbacks?

I close callbacks vengono eseguiti quando un handle viene chiuso **improvvisamente** (ad esempio con `.destroy()`) invece che **gracefully** (con `.end()` o `.close()`).

### Esempio Base

```javascript
const net = require('net');

const server = net.createServer((socket) => {
    console.log('Client connesso');
    
    socket.on('close', () => {
        console.log('3. Socket chiuso (close callback phase)');
    });
    
    socket.on('end', () => {
        console.log('2. Client disconnesso gracefully');
    });
});

server.listen(3000, () => {
    console.log('1. Server in ascolto');
});

// Simula connessione e disconnessione
const client = net.connect(3000, () => {
    console.log('Client connesso al server');
    client.end(); // Chiusura graceful
});

/* Output:
1. Server in ascolto
Client connesso
Client connesso al server
2. Client disconnesso gracefully
3. Socket chiuso (close callback phase)
*/
```

## Tipi di Chiusura

### 1. Chiusura Graceful vs Improvvisa

```javascript
const net = require('net');

// ✅ Chiusura GRACEFUL - .end()
function gracefulClose() {
    const socket = net.connect(3000);
    
    socket.on('end', () => {
        console.log('End event - connessione terminata');
    });
    
    socket.on('close', (hadError) => {
        console.log('Close event - socket pulito');
        console.log('Had error:', hadError);
    });
    
    // Chiude gracefully: invia FIN, aspetta ACK
    socket.end();
}

// ❌ Chiusura IMPROVVISA - .destroy()
function abruptClose() {
    const socket = net.connect(3000);
    
    socket.on('end', () => {
        console.log('End event - NON viene emesso con destroy()');
    });
    
    socket.on('close', (hadError) => {
        console.log('Close event - eseguito nella close callbacks phase');
        console.log('Had error:', hadError);
    });
    
    // Chiude immediatamente: invia RST
    socket.destroy();
}

/* gracefulClose() Output:
End event - connessione terminata
Close event - socket pulito
Had error: false

abruptClose() Output:
Close event - eseguito nella close callbacks phase
Had error: false
*/
```

### 2. Handle che Emettono 'close'

```javascript
const fs = require('fs');
const net = require('net');
const http = require('http');
const { EventEmitter } = require('events');

// 1. File streams
const readStream = fs.createReadStream('file.txt');
readStream.on('close', () => {
    console.log('File stream chiuso');
});
readStream.destroy();

// 2. Network sockets
const socket = new net.Socket();
socket.on('close', () => {
    console.log('Socket chiuso');
});
socket.destroy();

// 3. HTTP servers
const server = http.createServer();
server.on('close', () => {
    console.log('HTTP server chiuso');
});
server.listen(3000);
server.close();

// 4. Child processes
const { spawn } = require('child_process');
const child = spawn('ls');
child.on('close', (code) => {
    console.log(`Child process chiuso con codice ${code}`);
});

// Tutti questi 'close' events vengono eseguiti nella close callbacks phase
```

## Ordine di Esecuzione

### Esempio Completo dell'Ordine

```javascript
const net = require('net');

console.log('1. Codice sincrono - inizio');

// Timer phase
setTimeout(() => {
    console.log('4. setTimeout (timers phase)');
}, 0);

// Check phase
setImmediate(() => {
    console.log('5. setImmediate (check phase)');
});

// Microtask
Promise.resolve().then(() => {
    console.log('3. Promise (microtask)');
});

// NextTick
process.nextTick(() => {
    console.log('2. nextTick (microtask)');
});

// Close callback
const socket = new net.Socket();
socket.on('close', () => {
    console.log('6. Socket close (close callbacks phase)');
});
socket.destroy();

console.log('1. Codice sincrono - fine');

/* Output GARANTITO:
1. Codice sincrono - inizio
1. Codice sincrono - fine
2. nextTick (microtask)
3. Promise (microtask)
4. setTimeout (timers phase)
5. setImmediate (check phase)
6. Socket close (close callbacks phase)
*/
```

### Diagramma del Flusso

```
┌─────────────────────────────────────────┐
│  1. Codice Sincrono                     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  2. Microtask Queue                     │
│     - process.nextTick()                │
│     - Promise.then()                    │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   Event Loop Cycle  │
        └──────────┬──────────┘
                   │
┌──────────────────▼──────────────────────┐
│  3. timers (setTimeout)                 │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  4. pending callbacks                   │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  5. poll (I/O)                          │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  6. check (setImmediate)                │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  7. close callbacks ← ULTIMA FASE       │
│     - socket.on('close')                │
│     - stream.on('close')                │
└─────────────────────────────────────────┘
```

## Casi d'Uso Pratici

### Caso 1: Cleanup Risorse

```javascript
const fs = require('fs');
const net = require('net');

class ResourceManager {
    constructor() {
        this.resources = new Map();
    }
    
    registerResource(name, resource) {
        this.resources.set(name, resource);
        
        // Ascolta evento close per cleanup
        resource.on('close', () => {
            console.log(`🧹 Cleanup risorsa: ${name}`);
            this.resources.delete(name);
            this.logStatus();
        });
    }
    
    logStatus() {
        console.log(`📊 Risorse attive: ${this.resources.size}`);
        console.log('   -', Array.from(this.resources.keys()).join(', '));
    }
    
    closeAll() {
        console.log('🛑 Chiusura di tutte le risorse...');
        
        for (const [name, resource] of this.resources) {
            if (resource.destroy) {
                resource.destroy();
            } else if (resource.close) {
                resource.close();
            }
        }
    }
}

// Uso
const manager = new ResourceManager();

// Registra varie risorse
const socket1 = new net.Socket();
manager.registerResource('socket1', socket1);

const socket2 = new net.Socket();
manager.registerResource('socket2', socket2);

const readStream = fs.createReadStream(__filename);
manager.registerResource('fileStream', readStream);

manager.logStatus();

// Dopo 1 secondo, chiudi tutto
setTimeout(() => {
    manager.closeAll();
}, 1000);

/* Output:
📊 Risorse attive: 3
   - socket1, socket2, fileStream
🛑 Chiusura di tutte le risorse...
🧹 Cleanup risorsa: socket1
📊 Risorse attive: 2
   - socket2, fileStream
🧹 Cleanup risorsa: socket2
📊 Risorse attive: 1
   - fileStream
🧹 Cleanup risorsa: fileStream
📊 Risorse attive: 0
   -
*/
```

### Caso 2: Graceful Shutdown di un Server

```javascript
const http = require('http');
const net = require('net');

class GracefulServer {
    constructor() {
        this.server = null;
        this.connections = new Set();
        this.isShuttingDown = false;
    }
    
    start(port) {
        this.server = http.createServer((req, res) => {
            if (this.isShuttingDown) {
                res.writeHead(503, { 'Connection': 'close' });
                res.end('Server is shutting down');
                return;
            }
            
            res.writeHead(200);
            res.end('Hello World');
        });
        
        // Traccia tutte le connessioni
        this.server.on('connection', (socket) => {
            console.log('➕ Nuova connessione');
            this.connections.add(socket);
            
            socket.on('close', () => {
                console.log('➖ Connessione chiusa (close callbacks phase)');
                this.connections.delete(socket);
                this.checkShutdownComplete();
            });
        });
        
        // Server close event
        this.server.on('close', () => {
            console.log('🛑 Server chiuso completamente (close callbacks phase)');
        });
        
        this.server.listen(port, () => {
            console.log(`🚀 Server in ascolto sulla porta ${port}`);
        });
    }
    
    async shutdown() {
        console.log('\n🔄 Inizio graceful shutdown...');
        this.isShuttingDown = true;
        
        // Stop accettare nuove connessioni
        this.server.close(() => {
            console.log('✓ Server ha smesso di accettare connessioni');
        });
        
        console.log(`⏳ Aspettando ${this.connections.size} connessioni attive...`);
        
        // Dai 5 secondi alle connessioni per chiudersi gracefully
        setTimeout(() => {
            console.log(`⚠️ Timeout: chiusura forzata di ${this.connections.size} connessioni`);
            this.connections.forEach(socket => socket.destroy());
        }, 5000);
    }
    
    checkShutdownComplete() {
        if (this.isShuttingDown && this.connections.size === 0) {
            console.log('✅ Tutte le connessioni chiuse');
        }
    }
}

// Uso
const server = new GracefulServer();
server.start(3000);

// Simula alcune connessioni
setTimeout(() => {
    const client1 = net.connect(3000);
    const client2 = net.connect(3000);
    const client3 = net.connect(3000);
}, 100);

// Dopo 2 secondi, inizia shutdown
setTimeout(() => {
    server.shutdown();
}, 2000);

/* Output:
🚀 Server in ascolto sulla porta 3000
➕ Nuova connessione
➕ Nuova connessione
➕ Nuova connessione

🔄 Inizio graceful shutdown...
✓ Server ha smesso di accettare connessioni
⏳ Aspettando 3 connessioni attive...
➖ Connessione chiusa (close callbacks phase)
➖ Connessione chiusa (close callbacks phase)
➖ Connessione chiusa (close callbacks phase)
✅ Tutte le connessioni chiuse
🛑 Server chiuso completamente (close callbacks phase)
*/
```

### Caso 3: Connection Pool con Auto-Cleanup

```javascript
const net = require('net');

class ConnectionPool {
    constructor(host, port, maxSize = 10) {
        this.host = host;
        this.port = port;
        this.maxSize = maxSize;
        this.available = [];
        this.inUse = new Set();
        this.waiting = [];
    }
    
    async acquire() {
        // Riusa connessione disponibile
        if (this.available.length > 0) {
            const conn = this.available.pop();
            this.inUse.add(conn);
            return conn;
        }
        
        // Crea nuova connessione se sotto il limite
        if (this.inUse.size < this.maxSize) {
            return this.createConnection();
        }
        
        // Aspetta che una connessione si liberi
        return new Promise((resolve) => {
            this.waiting.push(resolve);
        });
    }
    
    createConnection() {
        return new Promise((resolve, reject) => {
            const socket = net.connect(this.port, this.host);
            
            socket.on('connect', () => {
                console.log('✓ Connessione creata');
                this.inUse.add(socket);
                
                // Setup close handler per auto-cleanup
                socket.on('close', () => {
                    console.log('🧹 Connessione auto-removed dal pool (close callbacks phase)');
                    this.inUse.delete(socket);
                    
                    const index = this.available.indexOf(socket);
                    if (index !== -1) {
                        this.available.splice(index, 1);
                    }
                });
                
                socket.on('error', (err) => {
                    console.error('❌ Errore connessione:', err.message);
                    socket.destroy();
                });
                
                resolve(socket);
            });
            
            socket.on('error', reject);
        });
    }
    
    release(socket) {
        if (!this.inUse.has(socket)) {
            return;
        }
        
        this.inUse.delete(socket);
        
        // Se qualcuno è in attesa, dagli questa connessione
        if (this.waiting.length > 0) {
            const resolve = this.waiting.shift();
            this.inUse.add(socket);
            resolve(socket);
        } else {
            // Altrimenti mettila nel pool disponibile
            this.available.push(socket);
        }
    }
    
    async destroy() {
        console.log('🛑 Distruzione pool...');
        
        // Chiudi tutte le connessioni
        const allConnections = [
            ...this.inUse,
            ...this.available
        ];
        
        allConnections.forEach(socket => socket.destroy());
        
        // I close callbacks si occuperanno del cleanup automatico
    }
    
    getStats() {
        return {
            available: this.available.length,
            inUse: this.inUse.size,
            waiting: this.waiting.length,
            total: this.available.length + this.inUse.size
        };
    }
}

// Uso
async function testPool() {
    const pool = new ConnectionPool('localhost', 3000, 5);
    
    // Acquisisci alcune connessioni
    const conn1 = await pool.acquire();
    const conn2 = await pool.acquire();
    const conn3 = await pool.acquire();
    
    console.log('Pool stats:', pool.getStats());
    
    // Rilascia una connessione
    pool.release(conn1);
    
    console.log('Pool stats dopo release:', pool.getStats());
    
    // Dopo 2 secondi, distruggi il pool
    setTimeout(() => {
        pool.destroy();
        
        setTimeout(() => {
            console.log('Pool stats dopo destroy:', pool.getStats());
        }, 100);
    }, 2000);
}

// testPool();
```

### Caso 4: Stream Pipeline con Error Handling

```javascript
const fs = require('fs');
const { pipeline, Transform } = require('stream');
const zlib = require('zlib');

class SafePipeline {
    constructor() {
        this.streams = [];
        this.cleanedUp = false;
    }
    
    addStream(stream, name) {
        this.streams.push({ stream, name });
        
        // Monitor close event per tracking
        stream.on('close', () => {
            console.log(`📦 Stream '${name}' chiuso (close callbacks phase)`);
            this.checkAllClosed();
        });
        
        stream.on('error', (err) => {
            console.error(`❌ Errore in stream '${name}':`, err.message);
            this.cleanup();
        });
    }
    
    execute(callback) {
        const streams = this.streams.map(s => s.stream);
        
        pipeline(...streams, (err) => {
            if (err) {
                console.error('Pipeline fallita:', err.message);
                this.cleanup();
                callback(err);
            } else {
                console.log('✅ Pipeline completata con successo');
                callback(null);
            }
        });
    }
    
    cleanup() {
        if (this.cleanedUp) return;
        this.cleanedUp = true;
        
        console.log('🧹 Cleanup di tutti gli stream...');
        
        this.streams.forEach(({ stream, name }) => {
            if (stream.destroyed) return;
            
            if (stream.destroy) {
                stream.destroy();
            } else if (stream.end) {
                stream.end();
            }
        });
    }
    
    checkAllClosed() {
        const allClosed = this.streams.every(({ stream }) => 
            stream.destroyed || stream.closed
        );
        
        if (allClosed) {
            console.log('✓ Tutti gli stream sono stati chiusi');
        }
    }
}

// Uso
function processFile(inputPath, outputPath, callback) {
    const safePipe = new SafePipeline();
    
    // Input stream
    const input = fs.createReadStream(inputPath);
    safePipe.addStream(input, 'input');
    
    // Transform: converti in uppercase
    const uppercase = new Transform({
        transform(chunk, encoding, callback) {
            callback(null, chunk.toString().toUpperCase());
        }
    });
    safePipe.addStream(uppercase, 'uppercase');
    
    // Compress
    const gzip = zlib.createGzip();
    safePipe.addStream(gzip, 'gzip');
    
    // Output stream
    const output = fs.createWriteStream(outputPath);
    safePipe.addStream(output, 'output');
    
    // Esegui pipeline
    safePipe.execute(callback);
}

// Test
processFile('input.txt', 'output.txt.gz', (err) => {
    if (err) {
        console.error('Processo fallito');
    } else {
        console.log('Processo completato');
    }
});

/* Output:
✅ Pipeline completata con successo
📦 Stream 'input' chiuso (close callbacks phase)
📦 Stream 'uppercase' chiuso (close callbacks phase)
📦 Stream 'gzip' chiuso (close callbacks phase)
📦 Stream 'output' chiuso (close callbacks phase)
✓ Tutti gli stream sono stati chiusi
Processo completato
*/
```

### Caso 5: WebSocket Connection Manager

```javascript
const WebSocket = require('ws');
const EventEmitter = require('events');

class WebSocketManager extends EventEmitter {
    constructor() {
        super();
        this.connections = new Map();
        this.connectionId = 0;
    }
    
    addConnection(ws) {
        const id = this.connectionId++;
        
        console.log(`➕ Connessione ${id} aggiunta`);
        this.connections.set(id, {
            ws,
            createdAt: Date.now(),
            messagesReceived: 0,
            messagesSent: 0
        });
        
        // Setup handlers
        ws.on('message', (data) => {
            const conn = this.connections.get(id);
            conn.messagesReceived++;
            this.emit('message', id, data);
        });
        
        ws.on('close', (code, reason) => {
            console.log(`🔌 Connessione ${id} chiusa (close callbacks phase)`);
            console.log(`   Codice: ${code}, Motivo: ${reason}`);
            
            const conn = this.connections.get(id);
            if (conn) {
                const lifetime = Date.now() - conn.createdAt;
                console.log(`   Statistiche:`);
                console.log(`     - Lifetime: ${lifetime}ms`);
                console.log(`     - Messaggi ricevuti: ${conn.messagesReceived}`);
                console.log(`     - Messaggi inviati: ${conn.messagesSent}`);
            }
            
            this.connections.delete(id);
            this.emit('connectionClosed', id);
        });
        
        ws.on('error', (err) => {
            console.error(`❌ Errore connessione ${id}:`, err.message);
        });
        
        return id;
    }
    
    send(id, data) {
        const conn = this.connections.get(id);
        if (!conn) {
            return false;
        }
        
        try {
            conn.ws.send(data);
            conn.messagesSent++;
            return true;
        } catch (err) {
            console.error(`Errore invio a ${id}:`, err.message);
            return false;
        }
    }
    
    broadcast(data) {
        let sent = 0;
        for (const [id, conn] of this.connections) {
            if (this.send(id, data)) {
                sent++;
            }
        }
        return sent;
    }
    
    closeConnection(id, code = 1000, reason = 'Normal closure') {
        const conn = this.connections.get(id);
        if (!conn) {
            return false;
        }
        
        conn.ws.close(code, reason);
        return true;
    }
    
    closeAll() {
        console.log(`🛑 Chiusura di ${this.connections.size} connessioni...`);
        
        for (const [id] of this.connections) {
            this.closeConnection(id, 1001, 'Server shutdown');
        }
    }
    
    getStats() {
        const stats = {
            totalConnections: this.connections.size,
            connections: []
        };
        
        for (const [id, conn] of this.connections) {
            stats.connections.push({
                id,
                messagesReceived: conn.messagesReceived,
                messagesSent: conn.messagesSent,
                lifetime: Date.now() - conn.createdAt
            });
        }
        
        return stats;
    }
}

// Uso
const manager = new WebSocketManager();

manager.on('message', (id, data) => {
    console.log(`📨 Messaggio da ${id}:`, data.toString());
});

manager.on('connectionClosed', (id) => {
    console.log(`📊 Stats correnti:`, manager.getStats());
});

// Simula server WebSocket
// const wss = new WebSocket.Server({ port: 8080 });
// wss.on('connection', (ws) => {
//     manager.addConnection(ws);
// });
```

## Differenza tra 'end' e 'close'

### Eventi su Stream

```javascript
const fs = require('fs');
const net = require('net');

// FILE STREAM
const readStream = fs.createReadStream('file.txt');

readStream.on('end', () => {
    console.log('📄 File: END - tutti i dati letti');
    // Eseguito quando stream finisce di leggere dati
});

readStream.on('close', () => {
    console.log('📄 File: CLOSE - file descriptor chiuso');
    // Eseguito nella close callbacks phase
});

// NETWORK SOCKET
const socket = new net.Socket();

socket.on('end', () => {
    console.log('🔌 Socket: END - altra parte ha chiuso');
    // Eseguito quando l'altra parte chiude la connessione
});

socket.on('close', (hadError) => {
    console.log('🔌 Socket: CLOSE - socket completamente chiuso');
    console.log('   Aveva errori:', hadError);
    // Eseguito nella close callbacks phase
});

/* Ordine tipico:
1. 'end' - Dati/connessione terminati
2. 'close' - Risorsa completamente chiusa (close callbacks phase)
*/
```

### Tabella Comparativa

| Caratteristica | 'end' Event | 'close' Event |
|----------------|-------------|---------------|
| **Quando** | Fine dati/connessione | Risorsa completamente chiusa |
| **Fase Event Loop** | Varie (di solito poll) | Close callbacks |
| **Stream readable** | Sì | Sì |
| **Stream writable** | Sì (con .end()) | Sì |
| **Socket** | Sì | Sì |
| **Server** | No | Sì |
| **Emesso sempre** | Non sempre | Quasi sempre |
| **Dopo errore** | Può non essere emesso | Sempre emesso |

### Esempio Completo

```javascript
const net = require('net');

function demonstrateEvents() {
    const server = net.createServer((socket) => {
        console.log('\n=== NUOVA CONNESSIONE ===');
        
        let eventOrder = 1;
        
        socket.on('data', (data) => {
            console.log(`${eventOrder++}. DATA:`, data.toString().trim());
        });
        
        socket.on('end', () => {
            console.log(`${eventOrder++}. END - client ha chiuso la sua parte`);
        });
        
        socket.on('finish', () => {
            console.log(`${eventOrder++}. FINISH - tutti i dati inviati`);
        });
        
        socket.on('close', (hadError) => {
            console.log(`${eventOrder++}. CLOSE - socket chiuso (close callbacks phase)`);
            console.log(`   Had error: ${hadError}`);
        });
        
        socket.on('error', (err) => {
            console.log(`${eventOrder++}. ERROR:`, err.message);
        });
        
        // Rispondi al client
        socket.write('Echo: ');
        socket.on('data', (data) => {
            socket.write(data);
        });
    });
    
    server.listen(3000, () => {
        console.log('Server in ascolto sulla porta 3000');
        
        // Crea client per testare
        setTimeout(() => testClient(), 100);
    });
}

function testClient() {
    const client = net.connect(3000, () => {
        console.log('\n=== CLIENT CONNESSO ===');
        
        // Invia dati
        client.write('Hello Server!\n');
        
        client.on('data', (data) => {
            console.log('Risposta:', data.toString());
        });
        
        // Chiudi dopo 1 secondo
        setTimeout(() => {
            console.log('\nClient chiude connessione...');
            client.end();
        }, 1000);
    });
}

demonstrateEvents();

/* Output:
Server in ascolto sulla porta 3000

=== CLIENT CONNESSO ===

=== NUOVA CONNESSIONE ===
1. DATA: Hello Server!
Risposta: Echo: Hello Server!

Client chiude connessione...
2. END - client ha chiuso la sua parte
3. FINISH - tutti i dati inviati
4. CLOSE - socket chiuso (close callbacks phase)
   Had error: false
*/
```

## Error Handling nella Close Phase

### Gestione Errori con 'close'

```javascript
const fs = require('fs');
const net = require('net');

class RobustStreamHandler {
    constructor(stream, name) {
        this.stream = stream;
        this.name = name;
        this.errors = [];
        this.closed = false;
        
        this.setupHandlers();
    }
    
    setupHandlers() {
        this.stream.on('error', (err) => {
            console.error(`❌ Errore in ${this.name}:`, err.message);
            this.errors.push({
                error: err,
                timestamp: Date.now()
            });
            
            // Non chiamare destroy qui, lascia che close venga emesso
        });
        
        this.stream.on('close', () => {
            this.closed = true;
            console.log(`🔒 ${this.name} chiuso (close callbacks phase)`);
            
            if (this.errors.length > 0) {
                console.log(`   ⚠️ Chiuso con