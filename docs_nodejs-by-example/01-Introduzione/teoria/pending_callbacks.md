# Pending Callbacks dell'Event Loop

## Cos'è la Fase Pending Callbacks?

La fase **pending callbacks** è la seconda fase dell'Event Loop di Node.js. In questa fase vengono eseguiti i callback di alcune operazioni di sistema che sono state **differite** dal ciclo precedente, principalmente callback di I/O che non sono stati eseguiti nella fase poll del ciclo precedente.

### Posizione nell'Event Loop

```
   ┌───────────────────────────┐
┌─>│           timers          │ 1. setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ 2. I/O callbacks differiti ← QUI
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ 3. Uso interno
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ 4. Nuovi I/O events
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │          check            │ 5. setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │ 6. Chiusure
   └───────────────────────────┘
```

## Cosa Sono i Pending Callbacks?

I **pending callbacks** sono callback di operazioni I/O che:

1. Sono stati **differiti** dalla fase poll del ciclo precedente
2. Non sono callback di timer (`setTimeout`/`setInterval`)
3. Non sono callback di `setImmediate()`
4. Non sono callback di chiusura (`close` events)

### Tipi di Callback in Questa Fase

```javascript
// Esempi di operazioni che possono finire in pending callbacks:

// 1. Errori TCP
// 2. Errori di sistema Unix (ECONNREFUSED, EAGAIN, etc.)
// 3. Alcuni callback di sistema differiti
// 4. Callback di I/O che non sono stati processati nel ciclo precedente

// NOTA: La maggior parte delle operazioni I/O normali
// viene gestita nella fase POLL, non qui!
```

## Perché Esistono i Pending Callbacks?

Questa fase esiste per gestire casi speciali in cui:

- Un'operazione I/O non può completare immediatamente
- Il sistema operativo ritorna un errore che deve essere gestito
- Un callback I/O deve essere differito al prossimo ciclo per evitare ricorsione

### Esempio Concettuale

```javascript
const net = require('net');

// Quando una connessione TCP fallisce immediatamente
const socket = net.connect(9999, 'non-esistente.com');

socket.on('error', (err) => {
    console.log('Errore di connessione');
    // Questo callback viene eseguito in pending callbacks
    // perché l'errore è stato rilevato dal sistema operativo
});

/* Flow:
1. socket.connect() viene chiamato (sincrono)
2. Sistema operativo ritorna errore (ENOTFOUND)
3. Node.js mette il callback error in pending callbacks queue
4. Event Loop: fase timers → fase pending callbacks
5. Callback error viene eseguito
*/
```

## Differenza tra Poll e Pending Callbacks

### Poll Phase (Fase 4)

```javascript
// Callback I/O normali - eseguiti in POLL phase
const fs = require('fs');

fs.readFile('file.txt', (err, data) => {
    console.log('Eseguito in POLL phase');
    // Questo viene eseguito quando il file è pronto
});

const http = require('http');
http.get('http://example.com', (res) => {
    console.log('Eseguito in POLL phase');
    // Questo viene eseguito quando la risposta arriva
});
```

### Pending Callbacks Phase (Fase 2)

```javascript
// Callback differiti - eseguiti in PENDING CALLBACKS phase
const net = require('net');

// Errore immediato del sistema
const socket = net.connect(9999, 'host-non-valido');
socket.on('error', (err) => {
    console.log('Eseguito in PENDING CALLBACKS phase');
    // Errore TCP differito
});

// Oppure: callback che sono stati rinviati dal ciclo precedente
```

### Tabella Comparativa

| Caratteristica | Poll Phase | Pending Callbacks Phase |
|----------------|-----------|-------------------------|
| **Quando** | Ciclo corrente | Ciclo successivo |
| **Contenuto** | I/O callbacks normali | I/O callbacks differiti |
| **Esempi** | fs.readFile, http requests | Errori TCP, errori sistema |
| **Frequenza** | Molto comune | Raro |
| **Ordine** | Dopo timers | Immediatamente dopo timers |

## Come Vengono Differiti i Callbacks

### Meccanismo di Differimento

```javascript
// Esempio interno semplificato (concettuale)

class EventLoopSimplified {
    constructor() {
        this.timersQueue = [];
        this.pendingCallbacksQueue = [];
        this.pollQueue = [];
        this.checkQueue = [];
        this.closeQueue = [];
    }
    
    processIO(callback) {
        // Se la poll phase è troppo occupata o ci sono condizioni speciali
        if (this.shouldDeferCallback()) {
            // Differisce al prossimo ciclo
            this.pendingCallbacksQueue.push(callback);
        } else {
            // Esegue subito in poll phase
            this.pollQueue.push(callback);
        }
    }
    
    shouldDeferCallback() {
        // Condizioni che causano differimento:
        // 1. Errore TCP immediato
        // 2. EAGAIN (riprova più tardi)
        // 3. Poll phase ha superato il tempo massimo
        // 4. Necessità di evitare stack overflow
        return false; // Semplificato
    }
    
    tick() {
        // 1. Timers
        this.processTimers();
        
        // 2. Pending callbacks (dal ciclo precedente)
        this.processPendingCallbacks();
        
        // 3. Idle, prepare (interno)
        
        // 4. Poll (I/O corrente)
        this.processPoll();
        
        // 5. Check (setImmediate)
        this.processCheck();
        
        // 6. Close callbacks
        this.processClose();
    }
}
```

## Casi d'Uso Pratici

### Caso 1: Errori TCP Immediati

```javascript
const net = require('net');

console.log('1. Inizio programma');

// Tentativo di connessione che fallisce immediatamente
const socket = net.connect({
    host: 'host-inesistente-xyz123.com',
    port: 9999
});

socket.on('connect', () => {
    console.log('Connesso (non verrà mai eseguito)');
});

socket.on('error', (err) => {
    console.log('3. Errore in PENDING CALLBACKS phase');
    console.log('   Tipo:', err.code);
    console.log('   Messaggio:', err.message);
});

console.log('2. Fine programma sincrono');

/* Output:
1. Inizio programma
2. Fine programma sincrono
3. Errore in PENDING CALLBACKS phase
   Tipo: ENOTFOUND
   Messaggio: getaddrinfo ENOTFOUND host-inesistente-xyz123.com
*/
```

### Caso 2: Callback Differiti da Poll

```javascript
const net = require('net');

// Server che simula differimento
const server = net.createServer((socket) => {
    console.log('Client connesso');
    
    // Forza il sistema a differire alcuni callback
    socket.on('data', (data) => {
        console.log('Data ricevuta:', data.toString());
        
        // Se il buffer è pieno, alcuni write potrebbero essere differiti
        for (let i = 0; i < 1000; i++) {
            socket.write('x'.repeat(1024));
        }
    });
    
    socket.on('drain', () => {
        console.log('Buffer svuotato (probabilmente in pending callbacks)');
    });
});

server.listen(3000, () => {
    console.log('Server in ascolto');
    
    // Client che invia dati
    const client = net.connect(3000);
    client.write('Hello');
    
    setTimeout(() => {
        client.end();
        server.close();
    }, 100);
});
```

### Caso 3: Gestione Errori di Sistema

```javascript
const fs = require('fs');
const net = require('net');

class RobustOperationHandler {
    constructor() {
        this.errors = [];
        this.successes = [];
    }
    
    handleTCPError(host, port) {
        const socket = net.connect({ host, port });
        
        socket.on('error', (err) => {
            // Eseguito in pending callbacks phase
            console.log(`📡 TCP Error (pending callbacks): ${err.code}`);
            this.errors.push({
                type: 'TCP',
                code: err.code,
                phase: 'pending_callbacks',
                timestamp: Date.now()
            });
            
            this.handleRetry('TCP', host, port);
        });
        
        socket.on('connect', () => {
            console.log('✓ TCP connesso');
            this.successes.push({ type: 'TCP' });
            socket.end();
        });
    }
    
    handleFileError(filename) {
        fs.readFile(filename, (err, data) => {
            if (err) {
                // Eseguito in poll phase (non pending callbacks)
                console.log(`📄 File Error (poll): ${err.code}`);
                this.errors.push({
                    type: 'File',
                    code: err.code,
                    phase: 'poll',
                    timestamp: Date.now()
                });
            } else {
                console.log('✓ File letto');
                this.successes.push({ type: 'File' });
            }
        });
    }
    
    handleRetry(type, ...args) {
        console.log(`🔄 Retry schedulato per ${type}`);
        
        setTimeout(() => {
            if (type === 'TCP') {
                this.handleTCPError(...args);
            } else if (type === 'File') {
                this.handleFileError(...args);
            }
        }, 2000);
    }
    
    getReport() {
        return {
            errors: this.errors.length,
            successes: this.successes.length,
            errorsByPhase: {
                pending_callbacks: this.errors.filter(e => e.phase === 'pending_callbacks').length,
                poll: this.errors.filter(e => e.phase === 'poll').length
            },
            errorTypes: this.errors.reduce((acc, e) => {
                acc[e.code] = (acc[e.code] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

// Test
const handler = new RobustOperationHandler();

// Questo genera errore in pending callbacks
handler.handleTCPError('host-inesistente.com', 9999);

// Questo genera errore in poll phase
handler.handleFileError('file-inesistente.txt');

setTimeout(() => {
    console.log('\n📊 Report finale:');
    console.log(JSON.stringify(handler.getReport(), null, 2));
}, 3000);

/* Output:
📡 TCP Error (pending callbacks): ENOTFOUND
🔄 Retry schedulato per TCP
📄 File Error (poll): ENOENT
📊 Report finale:
{
  "errors": 2,
  "successes": 0,
  "errorsByPhase": {
    "pending_callbacks": 1,
    "poll": 1
  },
  "errorTypes": {
    "ENOTFOUND": 1,
    "ENOENT": 1
  }
}
*/
```

### Caso 4: Sistema di Retry con Backpressure

```javascript
const net = require('net');

class ConnectionManager {
    constructor(maxRetries = 3, retryDelay = 1000) {
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
        this.attempts = new Map();
        this.pendingCallbacksDetected = 0;
    }
    
    connect(host, port) {
        return new Promise((resolve, reject) => {
            const key = `${host}:${port}`;
            const attemptCount = this.attempts.get(key) || 0;
            
            if (attemptCount >= this.maxRetries) {
                reject(new Error(`Max retries (${this.maxRetries}) reached for ${key}`));
                return;
            }
            
            this.attempts.set(key, attemptCount + 1);
            
            console.log(`Tentativo ${attemptCount + 1}/${this.maxRetries} per ${key}`);
            
            const socket = net.connect({ host, port });
            const connectStart = Date.now();
            
            socket.on('connect', () => {
                const latency = Date.now() - connectStart;
                console.log(`✓ Connesso a ${key} (${latency}ms)`);
                this.attempts.delete(key);
                resolve(socket);
            });
            
            socket.on('error', (err) => {
                const latency = Date.now() - connectStart;
                
                // Errori che appaiono rapidamente sono probabilmente in pending callbacks
                if (latency < 10) {
                    this.pendingCallbacksDetected++;
                    console.log(`⚡ Errore rapido (pending callbacks): ${err.code}`);
                } else {
                    console.log(`❌ Errore (poll): ${err.code}`);
                }
                
                // Retry con backoff esponenziale
                const delay = this.retryDelay * Math.pow(2, attemptCount);
                console.log(`⏳ Retry tra ${delay}ms...`);
                
                setTimeout(() => {
                    this.connect(host, port)
                        .then(resolve)
                        .catch(reject);
                }, delay);
            });
        });
    }
    
    getStats() {
        return {
            pendingCallbacksErrors: this.pendingCallbacksDetected,
            activeAttempts: this.attempts.size
        };
    }
}

// Test
async function testConnectionManager() {
    const manager = new ConnectionManager(3, 500);
    
    try {
        await manager.connect('host-inesistente.com', 9999);
    } catch (err) {
        console.error('\n❌ Connessione fallita:', err.message);
        console.log('📊 Stats:', manager.getStats());
    }
}

testConnectionManager();

/* Output:
Tentativo 1/3 per host-inesistente.com:9999
⚡ Errore rapido (pending callbacks): ENOTFOUND
⏳ Retry tra 500ms...
Tentativo 2/3 per host-inesistente.com:9999
⚡ Errore rapido (pending callbacks): ENOTFOUND
⏳ Retry tra 1000ms...
Tentativo 3/3 per host-inesistente.com:9999
⚡ Errore rapido (pending callbacks): ENOTFOUND
⏳ Retry tra 2000ms...

❌ Connessione fallita: Max retries (3) reached for host-inesistente.com:9999
📊 Stats: { pendingCallbacksErrors: 3, activeAttempts: 0 }
*/
```

## Ordine di Esecuzione Completo

### Esempio Dettagliato

```javascript
const fs = require('fs');
const net = require('net');

console.log('1. Codice sincrono - inizio');

// Microtask - priorità massima
process.nextTick(() => {
    console.log('2. process.nextTick');
});

Promise.resolve().then(() => {
    console.log('3. Promise microtask');
});

// Timer - fase 1
setTimeout(() => {
    console.log('4. setTimeout (timers phase)');
}, 0);

// Errore TCP - fase 2 (pending callbacks)
const socket = net.connect({ host: 'host-inesistente.com', port: 9999 });
socket.on('error', (err) => {
    console.log('5. TCP error (pending callbacks phase)');
});

// I/O normale - fase 4 (poll)
fs.readFile(__filename, () => {
    console.log('6. fs.readFile (poll phase)');
});

// setImmediate - fase 5 (check)
setImmediate(() => {
    console.log('7. setImmediate (check phase)');
});

console.log('1. Codice sincrono - fine');

/* Output:
1. Codice sincrono - inizio
1. Codice sincrono - fine
2. process.nextTick
3. Promise microtask
4. setTimeout (timers phase)
5. TCP error (pending callbacks phase)
6. fs.readFile (poll phase)
7. setImmediate (check phase)
*/
```

### Diagramma del Flusso

```
┌─────────────────────────────────────┐
│  1. Codice Sincrono                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  2. Microtask Queue                 │
│     - process.nextTick()            │
│     - Promise.then()                │
└──────────────┬──────────────────────┘
               │
    ┌──────────▼──────────┐
    │  Event Loop Start   │
    └──────────┬──────────┘
               │
┌──────────────▼──────────────────────┐
│  3. TIMERS Phase                    │
│     - setTimeout                    │
│     - setInterval                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  4. PENDING CALLBACKS Phase ⭐      │
│     - TCP errors                    │
│     - Deferred I/O callbacks        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  5. IDLE, PREPARE Phase             │
│     (interno)                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  6. POLL Phase                      │
│     - fs.readFile                   │
│     - http requests                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  7. CHECK Phase                     │
│     - setImmediate                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  8. CLOSE CALLBACKS Phase           │
│     - socket.on('close')            │
└─────────────────────────────────────┘
```

## Monitoraggio Pending Callbacks

### Tracciare Pending Callbacks

```javascript
const async_hooks = require('async_hooks');
const fs = require('fs');

class PendingCallbacksMonitor {
    constructor() {
        this.pendingOps = new Map();
        this.completedOps = [];
        this.setupHooks();
    }
    
    setupHooks() {
        const hook = async_hooks.createHook({
            init: (asyncId, type, triggerAsyncId) => {
                // Traccia operazioni asincrone
                if (type === 'TCPWRAP' || type === 'GETADDRINFOREQWRAP') {
                    this.pendingOps.set(asyncId, {
                        type,
                        startTime: Date.now(),
                        phase: 'unknown'
                    });
                }
            },
            
            before: (asyncId) => {
                if (this.pendingOps.has(asyncId)) {
                    const op = this.pendingOps.get(asyncId);
                    
                    // Stima la fase basandosi sul timing
                    const elapsed = Date.now() - op.startTime;
                    
                    if (elapsed < 5) {
                        op.phase = 'pending_callbacks';
                    } else {
                        op.phase = 'poll';
                    }
                }
            },
            
            after: (asyncId) => {
                if (this.pendingOps.has(asyncId)) {
                    const op = this.pendingOps.get(asyncId);
                    op.endTime = Date.now();
                    op.duration = op.endTime - op.startTime;
                    
                    this.completedOps.push(op);
                    this.pendingOps.delete(asyncId);
                    
                    console.log(`✓ Op completata: ${op.type} in fase ${op.phase} (${op.duration}ms)`);
                }
            }
        });
        
        hook.enable();
    }
    
    getStats() {
        const stats = {
            pending: this.pendingOps.size,
            completed: this.completedOps.length,
            byPhase: {}
        };
        
        this.completedOps.forEach(op => {
            stats.byPhase[op.phase] = (stats.byPhase[op.phase] || 0) + 1;
        });
        
        return stats;
    }
}

// Test
const monitor = new PendingCallbacksMonitor();

// Genera operazioni
const net = require('net');

for (let i = 0; i < 5; i++) {
    const socket = net.connect({ host: 'localhost', port: 9999 });
    socket.on('error', () => {});
}

setTimeout(() => {
    console.log('\n📊 Final Stats:');
    console.log(JSON.stringify(monitor.getStats(), null, 2));
}, 1000);
```

### Performance Profiling

```javascript
const { performance, PerformanceObserver } = require('perf_hooks');

class EventLoopPhaseProfiler {
    constructor() {
        this.measurements = {
            timers: [],
            pendingCallbacks: [],
            poll: [],
            check: [],
            close: []
        };
        
        this.currentPhase = null;
        this.phaseStart = null;
    }
    
    startPhase(phaseName) {
        if (this.currentPhase) {
            this.endPhase();
        }
        
        this.currentPhase = phaseName;
        this.phaseStart = performance.now();
    }
    
    endPhase() {
        if (!this.currentPhase || !this.phaseStart) {
            return;
        }
        
        const duration = performance.now() - this.phaseStart;
        
        if (this.measurements[this.currentPhase]) {
            this.measurements[this.currentPhase].push(duration);
        }
        
        this.currentPhase = null;
        this.phaseStart = null;
    }
    
    getReport() {
        const report = {};
        
        for (const [phase, durations] of Object.entries(this.measurements)) {
            if (durations.length === 0) {
                report[phase] = { count: 0 };
                continue;
            }
            
            const sum = durations.reduce((a, b) => a + b, 0);
            const avg = sum / durations.length;
            const max = Math.max(...durations);
            const min = Math.min(...durations);
            
            report[phase] = {
                count: durations.length,
                total: sum.toFixed(3) + 'ms',
                avg: avg.toFixed(3) + 'ms',
                min: min.toFixed(3) + 'ms',
                max: max.toFixed(3) + 'ms'
            };
        }
        
        return report;
    }
}

// Uso
const profiler = new EventLoopPhaseProfiler();

// Simula operazioni in varie fasi
profiler.startPhase('timers');
setTimeout(() => {
    profiler.endPhase();
    
    profiler.startPhase('pendingCallbacks');
    // Simula pending callbacks
    setTimeout(() => {
        profiler.endPhase();
        
        console.log('\n📊 Event Loop Profiling Report:');
        console.log(JSON.stringify(profiler.getReport(), null, 2));
    }, 0);
}, 0);
```

## Debugging e Troubleshooting

### Rilevare Operazioni in Pending Callbacks

```javascript
const originalEmit = require('events').EventEmitter.prototype.emit;

// Hook per tracciare eventi che potrebbero essere in pending callbacks
require('events').EventEmitter.prototype.emit = function(event, ...args) {
    if (event === 'error' && this.constructor.name === 'Socket') {
        const stack = new Error().stack;
        
        console.log('\n🔍 Possibile PENDING CALLBACK rilevato');
        console.log(`   Event: ${event}`);
        console.log(`   Error:`, args[0]?.code || args[0]?.message);
        console.log(`   Emitter: ${this.constructor.name}`);
        
        // Analizza stack per determinare la fase
        if (stack.includes('processTicksAndRejections')) {
            console.log(`   📍 Fase stimata: microtask`);
        } else {
            console.log(`   📍 Fase stimata: pending_callbacks o poll`);
        }
    }
    
    return originalEmit.call(this, event, ...args);
};

// Test
const net = require('net');
const socket = net.connect({ host: 'host-inesistente.com', port: 9999 });
socket.on('error', () => {});
```

### Misurare Latenza delle Fasi

```javascript
class PhaseLatencyMeasure {
    constructor() {
        this.lastTimestamp = Date.now();
        this.phaseTimes = [];
    }
    
    mark(phaseName) {
        const now = Date.now();
        const elapsed = now - this.lastTimestamp;
        
        this.phaseTimes.push({
            phase: phaseName,
            elapsed,
            timestamp: now
        });
        
        if (elapsed > 10) {
            console.warn(`⚠️ Fase ${phaseName} impiegato ${elapsed}ms (>10ms)`);
        }
        
        this.lastTimestamp = now;
    }
    
    getSlowPhases(threshold = 5) {
        return this.phaseTimes
            .filter(p => p.elapsed > threshold)
            .sort((a, b) => b.elapsed - a.elapsed);
    }
}

// Uso
const latency = new PhaseLatencyMeasure();

latency.mark('start');

setTimeout(() => {
    latency.mark('after-timer');
    
    const net = require('net');
    const socket = net.connect({ host: 'x', port: 9999 });
    socket.on('error', () => {
        latency.mark('after-pending-callback');
        
        console.log('\n🐌 Fasi lente:');
        latency.getSlowPhases().forEach(p => {
            console.log(`   ${p.phase}: ${p.elapsed}ms`);
        });
    });
}, 0);
```

## Best Practices

### ✅ DO: Gestisci sempre errori TCP

```javascript
const net = require('net');

// ✅ BENE
function connectSafely(host, port) {
    return new Promise((resolve, reject) => {
        const socket = net.connect({ host, port });
        
        socket.on('connect', () => {
            resolve(socket);
        });
        
        // IMPORTANTE: Gestisci errori che finiscono in pending callbacks
        socket.on('error', (err) => {
            console.log('Errore gestito:', err.code);
            reject(err);
        });
        
        // Timeout per evitare attese infinite
        socket.setTimeout(5000);
        socket.on('timeout', () => {
            socket.destroy();
            reject(new Error('Connection timeout'));
        });
    });
}

// ❌ MALE: Ignora errori
function connectUnsafe(host, port) {
    const socket = net.connect({ host, port });
    // Nessun error handler!
    return socket;
}
```

### ✅ DO: Non bloccare pending callbacks phase

```javascript
const net = require('net');

// ✅ BENE: Error handler veloce
const socket = net.connect({ host: 'invalid', port: 9999 });
socket.on('error', (err) => {
    // Handler veloce, non blocca
    console.error('Error:', err.code);
    
    // Defer operazioni pesanti
    setImmediate(() => {
        // Operazioni pesanti qui
        logToDatabase(err);
        sendAlert(err);
    });
});

// ❌ MALE: Operazioni pesanti in error handler
const socket2 = net.connect({ host: 'invalid', port: 9999 });
socket2.on('error', (err) => {
    // BLOCCA pending callbacks phase!
    for (let i = 0; i < 1000000; i++) {
        complexCalculation();
    }
});
```

### ✅ DO: Implementa retry logic appropriato

```javascript
class SmartRetry {
    constructor(maxRetries = 3) {
        this.maxRetries = maxRetries;
    }
    
    async connect(host, port, attempt = 1) {
        try {
            return await this.tryConnect(host, port);
        } catch (err) {
            // Errori in pending callbacks sono immediati
            if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
                console.log(`Errore immediato (pending callbacks): ${err.code}`);
                
                if (attempt < this.maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                    console.log(`⏳ Retry ${attempt}/${this.maxRetries} tra ${delay}ms`);
                    
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.connect(host, port, attempt + 1);
                }
            }
            
            throw err;
        }
    }
    
    tryConnect(host, port) {
        return new Promise((resolve, reject) => {
            const socket = net.connect({ host, port });
            
            socket.on('connect', () => resolve(socket));
            socket.on('error', reject);
            
            socket.setTimeout(5000);
            socket.on('timeout', () => {
                socket.destroy();
                reject(new Error('Timeout'));
            });
        });
    }
}

// Uso
const retry = new SmartRetry(3);
retry.connect('localhost', 3000)
    .then(socket => console.log('✓ Connesso'))
    .catch(err => console.error('❌ Fallito:', err.message));
```

### ❌ DON'T: Non assumere timing preciso

```javascript
// ❌ MALE: Assume che l'errore arrivi dopo setTimeout
setTimeout(() => {
    console.log('Timer');
}, 0);

const socket = net.connect({ host: 'invalid', port: 9999 });
socket.on('error', () => {
    console.log('Error');
});

// Output NON GARANTITO:
// Potrebbe essere: Timer, Error
// Oppure: Error, Timer (se errore molto rapido)

// ✅ BENE: Non fare assunzioni sul timing
const events = [];

setTimeout(() => {
    events.push('timer');
    checkComplete();
}, 0);

const socket2 = net.connect({ host: 'invalid', port: 9999 });
socket2.on('error', () => {
    events.push('error');
    checkComplete();
});

function checkComplete() {
    if (events.length === 2) {
        console.log('Entrambi completati:', events);
    }
}
```

### ❌ DON'T: Non ignorare errori di sistema

```javascript
const net = require('net');

// ❌ MALE: Ignora errori
function createConnection(host, port) {
    return net.connect({ host, port });
    // Nessuna gestione errori!
}

// ✅ BENE: Gestisci tutti i tipi di errore
function createConnectionSafe(host, port) {
    const socket = net.connect({ host, port });
    
    socket.on('error', (err) => {
        switch (err.code) {
            case 'ENOTFOUND':
                console.error('Host non trovato');
                break;
            case 'ECONNREFUSED':
                console.error('Connessione rifiutata');
                break;
            case 'ETIMEDOUT':
                console.error('Timeout');
                break;
            case 'ENETUNREACH':
                console.error('Rete non raggiungibile');
                break;
            default:
                console.error('Errore:', err.code);
        }
    });
    
    return socket;
}
```

## Differenza con Altri Event Loop

### Node.js vs Browser

```javascript
// Node.js ha pending callbacks phase
// Browser NON ha una fase equivalente

// In Node.js:
const net = require('net');
const socket = net.connect({ host: 'invalid', port: 9999 });
socket.on('error', (err) => {
    console.log('Eseguito in pending callbacks phase');
});

// Nel browser:
// fetch('http://invalid-host')
//     .catch(err => {
//         console.log('Eseguito come microtask o in altra fase');
//     });
// Non c'è distinzione tra pending callbacks e poll
```

### Tabella Comparativa

| Caratteristica | Node.js | Browser |
|----------------|---------|---------|
| **Pending Callbacks Phase** | ✅ Sì (fase 2) | ❌ No |
| **Errori TCP** | Gestiti in pending callbacks | N/A |
| **Differimento callback** | Esplicito (2 code separate) | Implicito |
| **Fasi Event Loop** | 6 fasi ben definite | 2-3 fasi (macro/micro task) |
| **Controllo granulare** | Alto | Basso |

## Pattern Avanzati

### Pattern 1: Connection Pool con Circuit Breaker

```javascript
const net = require('net');

class ResilientConnectionPool {
    constructor(host, port, options = {}) {
        this.host = host;
        this.port = port;
        this.maxSize = options.maxSize || 10;
        this.minSize = options.minSize || 2;
        
        // Circuit breaker
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 30000;
        this.failures = 0;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.nextAttempt = 0;
        
        // Pool
        this.available = [];
        this.inUse = new Set();
        this.pendingCallbackErrors = 0;
    }
    
    async acquire() {
        // Circuit breaker check
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                throw new Error('Circuit breaker is OPEN');
            }
            this.state = 'HALF_OPEN';
            console.log('🔄 Circuit breaker: tentativo di riapertura');
        }
        
        // Riusa connessione disponibile
        if (this.available.length > 0) {
            const conn = this.available.pop();
            this.inUse.add(conn);
            return conn;
        }
        
        // Crea nuova connessione
        if (this.inUse.size < this.maxSize) {
            return this.createConnection();
        }
        
        throw new Error('Pool esaurito');
    }
    
    async createConnection() {
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const socket = net.connect({ host: this.host, port: this.port });
            
            socket.on('connect', () => {
                const latency = Date.now() - startTime;
                console.log(`✓ Connessione creata (${latency}ms)`);
                
                this.onSuccess();
                this.inUse.add(socket);
                this.setupSocketHandlers(socket);
                resolve(socket);
            });
            
            socket.on('error', (err) => {
                const latency = Date.now() - startTime;
                
                // Rileva errori in pending callbacks (rapidi)
                if (latency < 10) {
                    this.pendingCallbackErrors++;
                    console.log(`⚡ Errore pending callbacks: ${err.code}`);
                }
                
                this.onFailure();
                reject(err);
            });
        });
    }
    
    setupSocketHandlers(socket) {
        socket.on('error', (err) => {
            console.error('Errore socket nel pool:', err.code);
            this.inUse.delete(socket);
        });
        
        socket.on('close', () => {
            this.inUse.delete(socket);
            const index = this.available.indexOf(socket);
            if (index !== -1) {
                this.available.splice(index, 1);
            }
        });
    }
    
    release(socket) {
        if (!this.inUse.has(socket)) return;
        
        this.inUse.delete(socket);
        
        if (this.available.length < this.minSize) {
            this.available.push(socket);
        } else {
            socket.destroy();
        }
    }
    
    onSuccess() {
        this.failures = 0;
        
        if (this.state === 'HALF_OPEN') {
            this.state = 'CLOSED';
            console.log('✅ Circuit breaker: CLOSED');
        }
    }
    
    onFailure() {
        this.failures++;
        
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.resetTimeout;
            console.log(`🔴 Circuit breaker: OPEN (${this.failures} failures)`);
        }
    }
    
    getStats() {
        return {
            state: this.state,
            available: this.available.length,
            inUse: this.inUse.size,
            failures: this.failures,
            pendingCallbackErrors: this.pendingCallbackErrors
        };
    }
}

// Test
async function testResilientPool() {
    const pool = new ResilientConnectionPool('localhost', 9999, {
        maxSize: 5,
        minSize: 2,
        failureThreshold: 3,
        resetTimeout: 5000
    });
    
    // Simula tentativi multipli
    for (let i = 0; i < 10; i++) {
        try {
            const conn = await pool.acquire();
            console.log('Connessione acquisita');
            pool.release(conn);
        } catch (err) {
            console.error(`Tentativo ${i + 1} fallito:`, err.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Final Stats:', pool.getStats());
}

// testResilientPool();
```

### Pattern 2: Error Aggregator

```javascript
class ErrorAggregator {
    constructor(windowSize = 60000) { // 1 minuto
        this.windowSize = windowSize;
        this.errors = [];
        this.pendingCallbacksErrors = [];
        this.pollPhaseErrors = [];
    }
    
    recordError(error, metadata = {}) {
        const record = {
            error,
            metadata,
            timestamp: Date.now(),
            phase: this.detectPhase(error)
        };
        
        this.errors.push(record);
        
        if (record.phase === 'pending_callbacks') {
            this.pendingCallbacksErrors.push(record);
        } else {
            this.pollPhaseErrors.push(record);
        }
        
        this.cleanup();
    }
    
    detectPhase(error) {
        // Euristica per rilevare la fase
        if (error.code === 'ENOTFOUND' || 
            error.code === 'ECONNREFUSED' ||
            error.code === 'ENETUNREACH') {
            return 'pending_callbacks';
        }
        
        return 'poll';
    }
    
    cleanup() {
        const cutoff = Date.now() - this.windowSize;
        
        this.errors = this.errors.filter(e => e.timestamp > cutoff);
        this.pendingCallbacksErrors = this.pendingCallbacksErrors.filter(e => e.timestamp > cutoff);
        this.pollPhaseErrors = this.pollPhaseErrors.filter(e => e.timestamp > cutoff);
    }
    
    getReport() {
        this.cleanup();
        
        const errorsByCode = {};
        this.errors.forEach(e => {
            const code = e.error.code || 'UNKNOWN';
            errorsByCode[code] = (errorsByCode[code] || 0) + 1;
        });
        
        return {
            totalErrors: this.errors.length,
            pendingCallbacksErrors: this.pendingCallbacksErrors.length,
            pollPhaseErrors: this.pollPhaseErrors.length,
            errorsByCode,
            errorRate: this.errors.length / (this.windowSize / 1000), // errori/secondo
            recentErrors: this.errors.slice(-5).map(e => ({
                code: e.error.code,
                phase: e.phase,
                age: Date.now() - e.timestamp + 'ms ago'
            }))
        };
    }
    
    shouldAlert() {
        const report = this.getReport();
        
        // Alert se troppi errori
        if (report.errorRate > 5) {
            return {
                alert: true,
                reason: `High error rate: ${report.errorRate.toFixed(2)} errors/sec`
            };
        }
        
        // Alert se troppi errori in pending callbacks
        if (report.pendingCallbacksErrors > 10) {
            return {
                alert: true,
                reason: `Too many pending callbacks errors: ${report.pendingCallbacksErrors}`
            };
        }
        
        return { alert: false };
    }
}

// Uso
const aggregator = new ErrorAggregator(60000);

// Simula errori
const net = require('net');

setInterval(() => {
    const socket = net.connect({ host: 'host-' + Math.random(), port: 9999 });
    
    socket.on('error', (err) => {
        aggregator.recordError(err, {
            host: socket.remoteAddress,
            port: socket.remotePort
        });
        
        const alert = aggregator.shouldAlert();
        if (alert.alert) {
            console.warn('🚨 ALERT:', alert.reason);
        }
    });
}, 100);

// Report periodico
setInterval(() => {
    console.log('\n📊 Error Report:');
    console.log(JSON.stringify(aggregator.getReport(), null, 2));
}, 5000);
```

### Pattern 3: Adaptive Timeout

```javascript
class AdaptiveTimeout {
    constructor(initialTimeout = 5000) {
        this.timeout = initialTimeout;
        this.minTimeout = 1000;
        this.maxTimeout = 30000;
        
        this.successfulAttempts = 0;
        this.failedAttempts = 0;
        this.recentLatencies = [];
        this.maxLatencies = 100;
    }
    
    async connect(host, port) {
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const socket = net.connect({ host, port });
            
            // Timeout dinamico
            socket.setTimeout(this.timeout);
            
            socket.on('connect', () => {
                const latency = Date.now() - startTime;
                this.recordSuccess(latency);
                resolve(socket);
            });
            
            socket.on('error', (err) => {
                const latency = Date.now() - startTime;
                
                if (latency < 10) {
                    console.log('⚡ Errore immediato (pending callbacks)');
                    // Non conta per timeout adaptive (errore immediato)
                } else {
                    this.recordFailure(latency);
                }
                
                reject(err);
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                this.recordFailure(this.timeout);
                reject(new Error('Timeout'));
            });
        });
    }
    
    recordSuccess(latency) {
        this.successfulAttempts++;
        this.recentLatencies.push(latency);
        
        if (this.recentLatencies.length > this.maxLatencies) {
            this.recentLatencies.shift();
        }
        
        this.adjustTimeout();
    }
    
    recordFailure(latency) {
        this.failedAttempts++;
        this.adjustTimeout();
    }
    
    adjustTimeout() {
        const totalAttempts = this.successfulAttempts + this.failedAttempts;
        
        if (totalAttempts < 10) {
            return; // Non abbastanza dati
        }
        
        const successRate = this.successfulAttempts / totalAttempts;
        
        if (successRate > 0.95 && this.recentLatencies.length > 0) {
            // Connessioni molto affidabili, riduci timeout
            const avgLatency = this.recentLatencies.reduce((a, b) => a + b, 0) / this.recentLatencies.length;
            const newTimeout = Math.max(avgLatency * 3, this.minTimeout);
            
            if (newTimeout < this.timeout) {
                this.timeout = Math.floor(newTimeout);
                console.log(`⬇️ Timeout ridotto a ${this.timeout}ms (success rate: ${(successRate * 100).toFixed(1)}%)`);
            }
        } else if (successRate < 0.7) {
            // Molte connessioni fallite, aumenta timeout
            const newTimeout = Math.min(this.timeout * 1.5, this.maxTimeout);
            
            if (newTimeout > this.timeout) {
                this.timeout = Math.floor(newTimeout);
                console.log(`⬆️ Timeout aumentato a ${this.timeout}ms (success rate: ${(successRate * 100).toFixed(1)}%)`);
            }
        }
    }
    
    getStats() {
        const totalAttempts = this.successfulAttempts + this.failedAttempts;
        const avgLatency = this.recentLatencies.length > 0
            ? this.recentLatencies.reduce((a, b) => a + b, 0) / this.recentLatencies.length
            : 0;
        
        return {
            currentTimeout: this.timeout,
            successRate: totalAttempts > 0 ? (this.successfulAttempts / totalAttempts * 100).toFixed(1) + '%' : 'N/A',
            averageLatency: avgLatency.toFixed(2) + 'ms',
            totalAttempts
        };
    }
}

// Test
async function testAdaptiveTimeout() {
    const adaptive = new AdaptiveTimeout(5000);
    
    // Simula connessioni con varie latenze
    for (let i = 0; i < 50; i++) {
        try {
            await adaptive.connect('localhost', 3000);
        } catch (err) {
            // Ignora errori per il test
        }
        
        if (i % 10 === 0) {
            console.log(`\n📊 Stats dopo ${i} tentativi:`, adaptive.getStats());
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

// testAdaptiveTimeout();
```

## Esercizi Pratici

### Esercizio 1: Pending Callbacks Counter

Implementare un contatore che distingue tra errori in pending callbacks e poll phase:

```javascript
class PhaseAwareErrorCounter {
    constructor() {
        // TODO: Implementare
        // - Tracciare errori per fase
        // - Distinguere pending callbacks da poll
        // - Fornire statistiche dettagliate
    }
    
    trackOperation(operation) {
        // TODO: Implementare
        // Ritorna Promise
    }
    
    getStats() {
        // TODO: Implementare
    }
}

// Test
const counter = new PhaseAwareErrorCounter();

// Genera vari tipi di operazioni
for (let i = 0; i < 10; i++) {
    counter.trackOperation(() => {
        return net.connect({ host: 'invalid', port: 9999 });
    });
}
```

### Esercizio 2: Smart Connection Manager

Creare un connection manager che si adatta basandosi sulla fase degli errori:

```javascript
class SmartConnectionManager {
    constructor(options) {
        // TODO: Implementare
        // - Rileva pattern di errori
        // - Adatta strategia di retry basandosi sulla fase
        // - Errori pending callbacks = retry veloce
        // - Errori poll = retry lento
    }
    
    async connect(host, port) {
        // TODO: Implementare
    }
}
```

### Esercizio 3: Phase Performance Monitor

Implementare un monitor che misura performance di ogni fase:

```javascript
class PhasePerformanceMonitor {
    constructor() {
        // TODO: Implementare
        // - Misurare durata di ogni fase
        // - Identificare bottleneck
        // - Generare report dettagliati
    }
    
    startPhase(name) {
        // TODO: Implementare
    }
    
    endPhase() {
        // TODO: Implementare
    }
    
    getBottlenecks() {
        // TODO: Implementare
    }
}
```

### Esercizio 4: Error Pattern Detector

Creare un detector che identifica pattern di errori:

```javascript
class ErrorPatternDetector {
    constructor() {
        // TODO: Implementare
        // - Rileva pattern ripetitivi
        // - Distingue errori temporanei da sistemici
        // - Suggerisce azioni correttive
    }
    
    recordError(error, phase) {
        // TODO: Implementare
    }
    
    detectPatterns() {
        // TODO: Implementare
        // Ritorna array di pattern rilevati
    }
}
```

### Esercizio 5: Adaptive Rate Limiter

Implementare un rate limiter che si adatta basandosi sulla fase degli errori:

```javascript
class AdaptiveRateLimiter {
    constructor(initialRate) {
        // TODO: Implementare
        // - Rate iniziale
        // - Aumenta rate se nessun errore pending callbacks
        // - Diminuisce rate se troppi errori
    }
    
    async execute(fn) {
        // TODO: Implementare
    }
    
    adjustRate() {
        // TODO: Implementare
    }
}
```

## Domande di Autovalutazione

### Domanda 1
Quando vengono eseguiti i pending callbacks?

A) Nella fase timers  
B) Subito dopo la fase timers  
C) Nella fase poll  
D) Alla fine del ciclo

### Domanda 2
Quale tipo di callback viene eseguito in pending callbacks phase?

A) Tutti i callback I/O  
B) Callback I/O differiti dal ciclo precedente  
C) setTimeout callbacks  
D) setImmediate callbacks

### Domanda 3
Gli errori TCP immediati vengono eseguiti in quale fase?

A) timers  
B) pending callbacks  
C) poll  
D) check

### Domanda 4
Qual è la differenza principale tra poll e pending callbacks?

A) Non c'è differenza  
B) Poll è per I/O corrente, pending callbacks per I/O differito  
C) Pending callbacks è più veloce  
D) Poll gestisce solo file

### Domanda 5
Come si può rilevare se un errore è in pending callbacks?

A) Non è possibile  
B) Controllando il timing: errori rapidi (<10ms) probabilmente sono in pending callbacks  
C) Usando process.nextTick  
D) Con async_hooks

### Domanda 6
I pending callbacks possono bloccare l'Event Loop?

A) No, mai  
B) Sì, se contengono codice sincrono pesante  
C) Solo su Linux  
D) Solo per errori TCP

### Domanda 7
Quale è il pattern corretto per gestire errori che potrebbero essere in pending callbacks?

A) Ignorarli  
B) Gestirli sempre con error handler appropriato  
C) Usare try-catch  
D) Usare process.on('uncaughtException')

### Domanda 8
I browser hanno una fase pending callbacks?

A) Sì, identica a Node.js  
B) Sì, ma diversa  
C) No, non hanno questa fase  
D) Solo Chrome

### Domanda 9
Qual è l'ordine corretto?

A) timers → poll → pending callbacks  
B) pending callbacks → timers → poll  
C) timers → pending callbacks → poll  
D) poll → pending callbacks → timers

### Domanda 10
Come si può ottimizzare il codice che genera molti pending callbacks?

A) Non si può ottimizzare  
B) Implementare retry logic e circuit breaker  
C) Usare setTimeout  
D) Disabilitare pending callbacks

---

## Risposte alle Domande di Autovalutazione

**Domanda 1: B**  
I pending callbacks vengono eseguiti nella seconda fase dell'Event Loop, **subito dopo la fase timers**. Questa è una fase dedicata a callback I/O che sono stati differiti dal ciclo precedente.

**Domanda 2: B**  
In pending callbacks vengono eseguiti **callback I/O differiti dal ciclo precedente**, principalmente errori di sistema come errori TCP, ECONNREFUSED, EAGAIN, ecc. Non tutti i callback I/O finiscono qui.

**Domanda 3: B**  
Gli errori TCP immediati (come ENOTFOUND, ECONNREFUSED) vengono eseguiti nella fase **pending callbacks** perché sono errori che il sistema operativo rileva immediatamente e che Node.js differisce a questa fase specifica.

**Domanda 4: B**  
**Poll** gestisce I/O events del ciclo corrente (file letti, richieste HTTP completate), mentre **pending callbacks** gestisce callback I/O che sono stati differiti dal ciclo precedente per vari motivi.

**Domanda 5: B**  
Si può rilevare controllando il **timing**: errori che appaiono molto rapidamente (tipicamente <10ms dall'inizio dell'operazione) sono probabilmente in pending callbacks, mentre errori più lenti sono probabilmente in poll phase.

**Domanda 6: B**  
Sì, i pending callbacks possono bloccare l'Event Loop se contengono **codice sincrono pesante**, proprio come qualsiasi altro callback. È importante mantenere i callback veloci e non bloccanti.

**Domanda 7: B**  
Il pattern corretto è **gestirli sempre con error handler appropriato** su socket/stream. Non gestire errori può causare crash dell'applicazione con "unhandled error" exception.

**Domanda 8: C**  
**No**, i browser non hanno una fase pending callbacks separata. Questa è una caratteristica specifica dell'Event Loop di Node.js. I browser hanno un Event Loop più semplice con macro e micro task.

**Domanda 9: C**  
L'ordine corretto è: **timers → pending callbacks → (idle/prepare) → poll → check → close**. Pending callbacks è la seconda fase, subito dopo timers.

**Domanda 10: B**  
L'ottimizzazione migliore è **implementare retry logic e circuit breaker** per gestire errori in pending callbacks in modo intelligente, evitando di sovraccaricare il sistema con tentativi continui falliti.

---

## Conclusioni

La fase **pending callbacks** è una fase specializzata dell'Event Loop di Node.js che gestisce callback I/O differiti, principalmente errori di sistema.

### 🎯 Punti Chiave

✅ **Seconda fase** dell'Event Loop (dopo timers)  
✅ **Gestisce callback differiti** dal ciclo precedente  
✅ **Errori TCP immediati** finiscono qui  
✅ **Rara** - la maggior parte I/O va in poll phase  
✅ **Importante per error handling** robusto  

### ⚠️ Considerazioni Importanti

1. **Non tutti gli errori** finiscono in pending callbacks
2. **Timing non garantito** - non fare assunzioni precise
3. **Gestisci sempre errori** per evitare crash
4. **Mantieni callback veloci** per non bloccare Event Loop
5. **Implementa retry logic** per errori in questa fase

### 🚀 Best Practices Riassuntive

✅ Gestisci sempre errori TCP con error handlers  
✅ Non bloccare con operazioni sincrone pesanti  
✅ Implementa retry logic con backoff esponenziale  
✅ Monitora errori per rilevare pattern  
✅ Usa circuit breaker per errori ripetitivi  
✅ Non fare assunzioni sul timing preciso  

---

**Versione documento**: 1.0  
**Ultimo aggiornamento**: Ottobre 2025  
**Compatibilità**: Node.js tutte le versioni  
**Livello**: Avanzato

---

*"The pending callbacks phase is Node.js's way of handling deferred I/O callbacks - understand it to build truly resilient applications."*