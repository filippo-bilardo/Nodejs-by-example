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
                console.log(`   ⚠️ Chiuso con ${this.errors.length} errore(i)`);
                this.errors.forEach(({ error, timestamp }) => {
                    console.log(`      - ${error.message} at ${new Date(timestamp).toISOString()}`);
                });
            } else {
                console.log(`   ✓ Chiuso senza errori`);
            }
            
            this.performCleanup();
        });
    }
    
    performCleanup() {
        console.log(`🧹 Cleanup per ${this.name}...`);
        // Rilascia risorse, aggiorna metriche, ecc.
    }
    
    getStatus() {
        return {
            name: this.name,
            closed: this.closed,
            errorCount: this.errors.length,
            hasErrors: this.errors.length > 0
        };
    }
}

// Test con errori
function testErrorHandling() {
    // Stream che fallirà
    const stream = fs.createReadStream('file-non-esistente.txt');
    const handler = new RobustStreamHandler(stream, 'FileStream');
    
    setTimeout(() => {
        console.log('\n📊 Status finale:', handler.getStatus());
    }, 100);
}

testErrorHandling();

/* Output:
❌ Errore in FileStream: ENOENT: no such file or directory, open 'file-non-esistente.txt'
🔒 FileStream chiuso (close callbacks phase)
   ⚠️ Chiuso con 1 errore(i)
      - ENOENT: no such file or directory at [timestamp]
🧹 Cleanup per FileStream...

📊 Status finale: {
  name: 'FileStream',
  closed: true,
  errorCount: 1,
  hasErrors: true
}
*/
```

### Pattern: Error Recovery

```javascript
const net = require('net');

class ResilientConnection {
    constructor(host, port, options = {}) {
        this.host = host;
        this.port = port;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.socket = null;
        this.retries = 0;
        this.connected = false;
    }
    
    connect() {
        return new Promise((resolve, reject) => {
            this.socket = net.connect(this.port, this.host);
            
            this.socket.on('connect', () => {
                console.log('✓ Connessione stabilita');
                this.connected = true;
                this.retries = 0;
                resolve();
            });
            
            this.socket.on('error', (err) => {
                console.error('❌ Errore connessione:', err.message);
            });
            
            this.socket.on('close', (hadError) => {
                console.log('🔌 Socket chiuso (close callbacks phase)');
                console.log(`   Had error: ${hadError}`);
                this.connected = false;
                
                // Auto-reconnect se configurato
                if (hadError && this.retries < this.maxRetries) {
                    this.retries++;
                    console.log(`🔄 Tentativo di riconnessione ${this.retries}/${this.maxRetries}...`);
                    
                    setTimeout(() => {
                        this.connect().catch(err => {
                            console.error('Riconnessione fallita:', err.message);
                        });
                    }, this.retryDelay);
                } else if (this.retries >= this.maxRetries) {
                    console.error('❌ Numero massimo di tentativi raggiunto');
                    reject(new Error('Max retries reached'));
                }
            });
        });
    }
    
    send(data) {
        if (!this.connected || !this.socket) {
            throw new Error('Not connected');
        }
        
        this.socket.write(data);
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.end();
        }
    }
}

// Uso
async function testResilientConnection() {
    const conn = new ResilientConnection('localhost', 9999, {
        maxRetries: 3,
        retryDelay: 2000
    });
    
    try {
        await conn.connect();
        conn.send('Hello!');
    } catch (err) {
        console.error('Connessione fallita definitivamente');
    }
}

// testResilientConnection();
```

## Memory Leaks e Close Callbacks

### Problema: Listener Non Rimossi

```javascript
const EventEmitter = require('events');
const net = require('net');

// ❌ MALE: Memory leak
class LeakyServer {
    constructor() {
        this.server = net.createServer();
        this.connections = [];
        
        this.server.on('connection', (socket) => {
            this.connections.push(socket);
            
            // PROBLEMA: listener non viene mai rimosso
            socket.on('data', (data) => {
                console.log('Data:', data);
            });
            
            // Socket viene chiuso ma listener rimangono
        });
    }
}

// ✅ BENE: Cleanup appropriato
class CleanServer {
    constructor() {
        this.server = net.createServer();
        this.connections = new Set();
        
        this.server.on('connection', (socket) => {
            this.connections.add(socket);
            
            const dataHandler = (data) => {
                console.log('Data:', data);
            };
            
            socket.on('data', dataHandler);
            
            // Cleanup quando socket viene chiuso
            socket.on('close', () => {
                console.log('🧹 Cleanup socket (close callbacks phase)');
                
                // Rimuovi listener
                socket.removeListener('data', dataHandler);
                
                // Rimuovi dal set
                this.connections.delete(socket);
                
                console.log(`📊 Connessioni attive: ${this.connections.size}`);
            });
        });
    }
    
    shutdown() {
        console.log('🛑 Shutdown server...');
        
        // Chiudi tutte le connessioni
        this.connections.forEach(socket => {
            socket.destroy();
        });
        
        this.server.close(() => {
            console.log('✓ Server chiuso (close callbacks phase)');
        });
    }
}

// Uso
const server = new CleanServer();
server.server.listen(3000);

// Simula connessioni
setTimeout(() => {
    const clients = [];
    for (let i = 0; i < 5; i++) {
        clients.push(net.connect(3000));
    }
    
    // Chiudi dopo 2 secondi
    setTimeout(() => {
        clients.forEach(c => c.end());
    }, 2000);
}, 100);

/* Output:
🧹 Cleanup socket (close callbacks phase)
📊 Connessioni attive: 4
🧹 Cleanup socket (close callbacks phase)
📊 Connessioni attive: 3
🧹 Cleanup socket (close callbacks phase)
📊 Connessioni attive: 2
🧹 Cleanup socket (close callbacks phase)
📊 Connessioni attive: 1
🧹 Cleanup socket (close callbacks phase)
📊 Connessioni attive: 0
*/
```

### Rilevare Memory Leaks

```javascript
const net = require('net');

class LeakDetector {
    constructor(checkInterval = 5000) {
        this.checkInterval = checkInterval;
        this.handles = new WeakSet();
        this.handleCount = 0;
        this.monitoring = false;
    }
    
    track(handle, name) {
        this.handles.add(handle);
        this.handleCount++;
        
        handle.on('close', () => {
            this.handleCount--;
            console.log(`📉 Handle '${name}' chiuso. Rimanenti: ${this.handleCount}`);
        });
    }
    
    startMonitoring() {
        if (this.monitoring) return;
        this.monitoring = true;
        
        this.interval = setInterval(() => {
            console.log(`\n📊 Leak Detector Report:`);
            console.log(`   Active handles: ${this.handleCount}`);
            console.log(`   Process memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
            
            if (this.handleCount > 100) {
                console.warn('⚠️ WARNING: Possibile memory leak rilevato!');
            }
        }, this.checkInterval);
    }
    
    stopMonitoring() {
        if (this.interval) {
            clearInterval(this.interval);
            this.monitoring = false;
        }
    }
}

// Uso
const detector = new LeakDetector(2000);
detector.startMonitoring();

// Simula leak
const server = net.createServer((socket) => {
    detector.track(socket, 'client-socket');
    
    // Socket non viene mai chiuso esplicitamente
    // Ma il detector lo traccia tramite 'close' event
});

server.listen(3000);

// Genera traffico
setInterval(() => {
    const socket = net.connect(3000);
    detector.track(socket, 'server-socket');
    
    // Chiudi dopo un po'
    setTimeout(() => socket.destroy(), Math.random() * 3000);
}, 500);

// Stop dopo 15 secondi
setTimeout(() => {
    detector.stopMonitoring();
    server.close();
}, 15000);
```

## Best Practices

### ✅ DO: Ascolta sempre l'evento 'close'

```javascript
const fs = require('fs');

// ✅ BENE
function readFileCorrect(filename, callback) {
    const stream = fs.createReadStream(filename);
    let data = '';
    
    stream.on('data', (chunk) => {
        data += chunk;
    });
    
    stream.on('error', (err) => {
        callback(err);
    });
    
    // IMPORTANTE: Ascolta 'close' per cleanup
    stream.on('close', () => {
        console.log('Stream chiuso, cleanup completato');
        if (data) {
            callback(null, data);
        }
    });
}

// ❌ MALE: Ignora 'close'
function readFileWrong(filename, callback) {
    const stream = fs.createReadStream(filename);
    let data = '';
    
    stream.on('data', (chunk) => {
        data += chunk;
    });
    
    stream.on('end', () => {
        // Problema: potrebbe esserci errore dopo 'end'
        callback(null, data);
    });
    
    // Manca gestione 'close' e 'error'!
}
```

### ✅ DO: Pulisci risorse in 'close'

```javascript
class ResourceHandler {
    constructor() {
        this.resources = new Map();
        this.timers = new Map();
    }
    
    addResource(id, resource) {
        this.resources.set(id, resource);
        
        // Setup timer per timeout
        const timer = setTimeout(() => {
            console.log(`⏱️ Timeout per risorsa ${id}`);
            resource.destroy();
        }, 30000);
        
        this.timers.set(id, timer);
        
        // ✅ Cleanup in 'close'
        resource.on('close', () => {
            console.log(`🧹 Cleanup risorsa ${id} (close callbacks phase)`);
            
            // Cancella timer
            const timer = this.timers.get(id);
            if (timer) {
                clearTimeout(timer);
                this.timers.delete(id);
            }
            
            // Rimuovi risorsa
            this.resources.delete(id);
            
            console.log(`📊 Risorse rimanenti: ${this.resources.size}`);
        });
    }
    
    closeAll() {
        for (const [id, resource] of this.resources) {
            if (resource.destroy) {
                resource.destroy();
            }
        }
    }
}
```

### ✅ DO: Gestisci 'close' con errori

```javascript
const net = require('net');

function handleSocketProperly(socket) {
    let errorOccurred = false;
    
    socket.on('error', (err) => {
        console.error('❌ Errore:', err.message);
        errorOccurred = true;
    });
    
    socket.on('close', (hadError) => {
        console.log('🔌 Socket chiuso (close callbacks phase)');
        
        if (hadError || errorOccurred) {
            console.log('   ⚠️ Chiuso a causa di errore');
            // Logica di recovery
            attemptReconnect();
        } else {
            console.log('   ✓ Chiuso normalmente');
            // Cleanup normale
        }
    });
}
```

### ❌ DON'T: Non fare operazioni async in 'close'

```javascript
const fs = require('fs');

// ❌ MALE: Operazioni async in 'close'
const stream = fs.createReadStream('file.txt');
stream.on('close', () => {
    // PROBLEMA: 'close' è sincono, non aspetta async
    saveMetrics().then(() => {
        console.log('Metrics salvate');
    });
});

// ✅ BENE: Usa setImmediate o defer
const stream2 = fs.createReadStream('file.txt');
stream2.on('close', () => {
    setImmediate(() => {
        saveMetrics().then(() => {
            console.log('Metrics salvate');
        });
    });
});
```

### ❌ DON'T: Non confondere 'end' con 'close'

```javascript
const net = require('net');

// ❌ MALE: Usa 'end' per cleanup
const socket = net.connect(3000);
socket.on('end', () => {
    // PROBLEMA: 'end' non garantisce che il socket sia chiuso
    cleanupResources(); // Potrebbe essere prematuro!
});

// ✅ BENE: Usa 'close' per cleanup
const socket2 = net.connect(3000);
socket2.on('end', () => {
    console.log('Connessione terminata dalla parte remota');
});

socket2.on('close', () => {
    // Sicuro: il socket è definitivamente chiuso
    cleanupResources();
});
```

### ❌ DON'T: Non ignorare il parametro 'hadError'

```javascript
const net = require('net');

// ❌ MALE: Ignora hadError
const socket = net.connect(3000);
socket.on('close', () => {
    // Non sappiamo se ci sono stati errori
    reconnect(); // Potrebbe causare loop infinito
});

// ✅ BENE: Controlla hadError
const socket2 = net.connect(3000);
socket2.on('close', (hadError) => {
    if (hadError) {
        console.log('⚠️ Chiuso con errori, attendo prima di riconnettere');
        setTimeout(() => reconnect(), 5000);
    } else {
        console.log('✓ Chiuso normalmente, riconnetto subito');
        reconnect();
    }
});
```

## Debugging Close Callbacks

### Tracciare Close Events

```javascript
const originalEmit = require('events').EventEmitter.prototype.emit;

// Wrapper per tracciare tutti i 'close' events
require('events').EventEmitter.prototype.emit = function(event, ...args) {
    if (event === 'close') {
        const stack = new Error().stack;
        console.log('\n🔍 CLOSE EVENT DETECTED');
        console.log(`   Emitter: ${this.constructor.name}`);
        console.log(`   Had Error: ${args[0]}`);
        console.log(`   Stack trace:\n${stack}`);
    }
    
    return originalEmit.call(this, event, ...args);
};

// Test
const net = require('net');
const socket = new net.Socket();
socket.destroy();

/* Output:
🔍 CLOSE EVENT DETECTED
   Emitter: Socket
   Had Error: false
   Stack trace:
Error
    at Socket.emit (events.js:...)
    at TCP.<anonymous> (net.js:...)
    ...
*/
```

### Profiling Close Callbacks

```javascript
const { performance } = require('perf_hooks');

class CloseProfiler {
    constructor() {
        this.measurements = [];
        this.setupTracking();
    }
    
    setupTracking() {
        const EventEmitter = require('events');
        const originalOn = EventEmitter.prototype.on;
        const self = this;
        
        EventEmitter.prototype.on = function(event, listener) {
            if (event === 'close') {
                const wrappedListener = function(...args) {
                    const start = performance.now();
                    
                    const result = listener.apply(this, args);
                    
                    const duration = performance.now() - start;
                    self.measurements.push({
                        emitter: this.constructor.name,
                        duration,
                        timestamp: Date.now()
                    });
                    
                    if (duration > 10) {
                        console.warn(`⚠️ Slow close callback: ${duration.toFixed(2)}ms in ${this.constructor.name}`);
                    }
                    
                    return result;
                };
                
                return originalOn.call(this, event, wrappedListener);
            }
            
            return originalOn.call(this, event, listener);
        };
    }
    
    getStats() {
        if (this.measurements.length === 0) {
            return { count: 0 };
        }
        
        const durations = this.measurements.map(m => m.duration);
        const sum = durations.reduce((a, b) => a + b, 0);
        
        return {
            count: this.measurements.length,
            totalTime: sum.toFixed(2) + 'ms',
            avgTime: (sum / this.measurements.length).toFixed(2) + 'ms',
            maxTime: Math.max(...durations).toFixed(2) + 'ms',
            minTime: Math.min(...durations).toFixed(2) + 'ms'
        };
    }
    
    getSlowCallbacks(threshold = 5) {
        return this.measurements
            .filter(m => m.duration > threshold)
            .sort((a, b) => b.duration - a.duration);
    }
}

// Uso
const profiler = new CloseProfiler();

// Simula vari close events
const net = require('net');
const sockets = [];

for (let i = 0; i < 10; i++) {
    const socket = new net.Socket();
    
    socket.on('close', () => {
        // Simula lavoro
        const end = Date.now() + Math.random() * 20;
        while (Date.now() < end) {}
    });
    
    sockets.push(socket);
}

// Chiudi tutti
sockets.forEach(s => s.destroy());

setTimeout(() => {
    console.log('\n📊 Close Callbacks Statistics:');
    console.log(profiler.getStats());
    
    const slow = profiler.getSlowCallbacks(10);
    if (slow.length > 0) {
        console.log('\n🐌 Slow callbacks (>10ms):');
        slow.forEach(m => {
            console.log(`   ${m.emitter}: ${m.duration.toFixed(2)}ms`);
        });
    }
}, 100);
```

## Esercizi Pratici

### Esercizio 1: Connection Pool con Timeout

Implementare un connection pool che automaticamente chiude connessioni inattive:

```javascript
class TimedConnectionPool {
    constructor(host, port, options = {}) {
        this.host = host;
        this.port = port;
        this.maxConnections = options.maxConnections || 10;
        this.idleTimeout = options.idleTimeout || 30000;
        // TODO: Implementare
        // - Tracciare ultima attività di ogni connessione
        // - Chiudere connessioni inattive in 'close' callback
        // - Gestire pool size dinamicamente
    }
    
    acquire() {
        // TODO: Implementare
    }
    
    release(connection) {
        // TODO: Implementare
    }
}
```

### Esercizio 2: Graceful Shutdown Handler

Creare un gestore per graceful shutdown che aspetta tutti i close callbacks:

```javascript
class GracefulShutdownHandler {
    constructor() {
        // TODO: Implementare
        // - Tracciare tutti gli handle attivi
        // - Aspettare che tutti emettano 'close'
        // - Timeout se impiega troppo tempo
    }
    
    register(handle, name) {
        // TODO: Implementare
    }
    
    shutdown(timeout = 10000) {
        // TODO: Implementare
        // Ritorna Promise che si risolve quando tutto è chiuso
    }
}
```

### Esercizio 3: Resource Leak Detector

Implementare un detector che identifica risorse non chiuse:

```javascript
class ResourceLeakDetector {
    constructor(options = {}) {
        this.checkInterval = options.checkInterval || 5000;
        this.leakThreshold = options.leakThreshold || 50;
        // TODO: Implementare
        // - Tracciare aperture e chiusure
        // - Identificare risorse che non vengono chiuse
        // - Report periodico
    }
    
    trackOpen(resource, metadata) {
        // TODO: Implementare
    }
    
    startMonitoring() {
        // TODO: Implementare
    }
}
```

### Esercizio 4: Stream Cleanup Manager

Creare un manager che garantisce cleanup di pipeline complesse:

```javascript
class StreamCleanupManager {
    constructor() {
        // TODO: Implementare
        // - Gestire pipeline di stream
        // - Garantire che tutti gli stream vengano chiusi
        // - Gestire errori in qualsiasi punto della pipeline
    }
    
    createPipeline(streams) {
        // TODO: Implementare
        // Ritorna Promise
    }
}
```

### Esercizio 5: Connection Health Monitor

Implementare un monitor che traccia la salute delle connessioni:

```javascript
class ConnectionHealthMonitor {
    constructor() {
        // TODO: Implementare
        // - Tracciare connessioni attive/chiuse
        // - Calcolare metriche (uptime, error rate, ecc.)
        // - Identificare pattern di errori
    }
    
    monitor(connection, metadata) {
        // TODO: Implementare
    }
    
    getMetrics() {
        // TODO: Implementare
    }
}
```

## Domande di Autovalutazione

### Domanda 1
In quale fase dell'Event Loop vengono eseguiti i close callbacks?

A) timers  
B) poll  
C) check  
D) close callbacks (ultima fase)

### Domanda 2
Qual è la differenza tra 'end' e 'close' events?

A) Sono equivalenti  
B) 'end' indica fine dati, 'close' indica risorsa completamente chiusa  
C) 'close' viene prima di 'end'  
D) 'end' è solo per file, 'close' per network

### Domanda 3
Quando viene emesso l'evento 'close' con hadError=true?

A) Sempre  
B) Mai  
C) Quando la risorsa viene chiusa a causa di un errore  
D) Solo per socket TCP

### Domanda 4
Qual è il modo corretto per fare cleanup di risorse?

A) Nell'evento 'end'  
B) Nell'evento 'close'  
C) Nel costruttore  
D) Con setTimeout

### Domanda 5
Cosa succede se un listener 'close' lancia un'eccezione?

A) Il programma crasha  
B) L'eccezione viene ignorata  
C) Altri listener 'close' non vengono eseguiti  
D) Viene emesso un evento 'error'

### Domanda 6
Quale codice garantisce che tutte le connessioni siano chiuse?

A)
```javascript
server.close();
```

B)
```javascript
connections.forEach(c => c.end());
```

C)
```javascript
connections.forEach(c => c.destroy());
server.close();
```

D) A e C sono corretti

### Domanda 7
I close callbacks possono bloccare l'Event Loop?

A) No, mai  
B) Sì, se contengono codice sincrono pesante  
C) Solo su Windows  
D) Solo per file streams

### Domanda 8
Qual è l'ordine corretto degli eventi per un socket?

A) close → end → error  
B) end → close → error  
C) error → end → close  
D) L'ordine varia

### Domanda 9
Come si può rilevare un memory leak legato a close callbacks?

A) Non è possibile  
B) Tracciando handle che non emettono 'close'  
C) Usando console.log  
D) Con setTimeout

### Domanda 10
Quale è il pattern corretto per graceful shutdown?

A) Chiamare process.exit() immediatamente  
B) Aspettare tutti i 'close' events con timeout  
C) Usare solo setTimeout  
D) Non fare nulla

---

## Risposte alle Domande di Autovalutazione

**Domanda 1: D**  
I close callbacks vengono eseguiti nella fase **close callbacks**, che è l'ultima fase dell'Event Loop prima che il ciclo ricominci. Questa fase è dedicata specificamente alla gestione della chiusura di handle.

**Domanda 2: B**  
L'evento **'end'** indica che non ci sono più dati da leggere/scrivere (fine del flusso), mentre **'close'** indica che la risorsa sottostante (file descriptor, socket) è stata completamente chiusa e rilasciata. 'close' viene sempre dopo 'end'.

**Domanda 3: C**  
L'evento 'close' viene emesso con `hadError=true` quando la risorsa è stata chiusa a causa di un errore (ad esempio, errore di rete, errore I/O). Questo parametro permette di distinguere tra chiusure normali e chiusure dovute a errori.

**Domanda 4: B**  
Il cleanup di risorse deve essere fatto nell'evento **'close'** perché questo garantisce che la risorsa sia completamente chiusa e che non ci saranno più eventi. 'end' non garantisce che la risorsa sia effettivamente chiusa.

**Domanda 5: C**  
Se un listener 'close' lancia un'eccezione non gestita, Node.js interrompe l'esecuzione degli altri listener 'close' per quel particolare emitter e propaga l'errore. È importante gestire sempre le eccezioni nei listener.

**Domanda 6: C**  
Per garantire la chiusura, bisogna chiamare `.destroy()` su tutte le connessioni (che le chiude immediatamente) e poi `server.close()`. Solo chiamare `.end()` potrebbe lasciare connessioni aperte se il client non chiude la sua parte.

**Domanda 7: B**  
Sì, i close callbacks possono bloccare l'Event Loop se contengono operazioni sincrone pesanti. Sono callback normali eseguiti nella fase close dell'Event Loop, quindi il codice sincrono al loro interno blocca l'esecuzione come qualsiasi altro callback.

**Domanda 8: D**  
L'ordine varia in base a come viene chiusa la risorsa. Tipicamente: error (se c'è) → end (se chiusura graceful) → close (sempre). Ma con `.destroy()` può essere solo: error (opzionale) → close.

**Domanda 9: B**  
Si rilevano memory leak tracciando handle che vengono aperti ma non emettono mai 'close'. Se il numero di handle aperti cresce costantemente senza 'close' corrispondenti, c'è un leak.

**Domanda 10: B**  
Il pattern corretto per graceful shutdown è interrompere l'accettazione di nuove richieste, aspettare che tutte le richieste attive completino e che tutti gli handle emettano 'close', con un timeout per evitare di aspettare indefinitamente.

---

## Conclusioni

La fase **close callbacks** è l'ultima fase dell'Event Loop e gioca un ruolo cruciale nella gestione delle risorse in Node.js.

### 🎯 Punti Chiave

✅ **Cleanup delle risorse** - 'close' è il momento giusto per cleanup  
✅ **Ultima fase** - Eseguita dopo tutte le altre fasi dell'Event Loop  
✅ **Sempre emesso** - A differenza di 'end', 'close' viene quasi sempre emesso  
✅ **hadError parameter** - Permette di distinguere chiusure normali da errori  
✅ **Memory leak prevention** - Fondamentale per evitare leak di risorse  

### ⚠️ Best Practices Riassuntive

1. **Ascolta sempre 'close'** per cleanup delle risorse
2. **Non confondere 'end' e 'close'** - hanno scopi diversi
3. **Controlla hadError** per gestire errori appropriatamente
4. **Rimuovi listener** in 'close' per evitare memory leaks
5. **Non fare operazioni pesanti** in close callbacks
6. **Usa 'close' per graceful shutdown** aspettando tutti i close events

### 🚀 Quando Usare Close Callbacks

✅ Rilascio di risorse (file descriptor, socket, timer)  
✅ Aggiornamento metriche e statistiche  
✅ Graceful shutdown di server  
✅ Cleanup di listener e references  
✅ Logging di chiusure e diagnostica  

---

**Versione documento**: 1.0  
**Ultimo aggiornamento**: Ottobre 2025  
**Compatibilità**: Node.js tutte le versioni  
**Livello**: Intermedio/Avanzato

---

*"The close callbacks phase is the final frontier of resource management in Node.js, ensuring that every handle is properly closed and cleaned up before the event loop starts anew."*
