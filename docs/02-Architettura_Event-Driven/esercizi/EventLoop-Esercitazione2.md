# Esercitazioni Pratiche - Event Loop in Node.js

## 📋 Indice delle Esercitazioni

1. [Esercizio 1: Analisi dell'Ordine di Esecuzione](#esercizio-1-analisi-dellordine-di-esecuzione)
2. [Esercizio 2: Microtask vs Macrotask](#esercizio-2-microtask-vs-macrotask)
3. [Esercizio 3: Event Loop Monitor](#esercizio-3-event-loop-monitor)
4. [Esercizio 4: Ottimizzazione Loop Pesante](#esercizio-4-ottimizzazione-loop-pesante)
5. [Esercizio 5: Worker Threads per Fibonacci](#esercizio-5-worker-threads-per-fibonacci)
6. [Esercizio 6: Task Scheduler con Priorità](#esercizio-6-task-scheduler-con-priorità)
7. [Esercizio 7: Server Non Bloccante](#esercizio-7-server-non-bloccante)
8. [Esercizio 8: Cluster Mode Load Balancer](#esercizio-8-cluster-mode-load-balancer)
9. [Esercizio 9: Streaming File Processor](#esercizio-9-streaming-file-processor)
10. [Esercizio 10: Async Queue con Rate Limiting](#esercizio-10-async-queue-con-rate-limiting)

---

## Esercizio 1: Analisi dell'Ordine di Esecuzione

### 🎯 Obiettivo
Comprendere l'ordine di esecuzione delle diverse API asincrone in Node.js.

### 📝 Consegna
Scrivi un programma che utilizza tutte le seguenti API asincrone e prevedi l'ordine di esecuzione:
- Codice sincrono (`console.log`)
- `process.nextTick()`
- `Promise.resolve().then()`
- `setTimeout()` con delay 0
- `setImmediate()`
- `queueMicrotask()`

### 💻 Codice Base

```javascript
// es01-execution-order.js

console.log('=== Inizio ===');

setTimeout(() => {
    console.log('6. setTimeout 0ms');
}, 0);

setImmediate(() => {
    console.log('7. setImmediate');
});

process.nextTick(() => {
    console.log('2. nextTick 1');
    
    process.nextTick(() => {
        console.log('3. nextTick 2 (nested)');
    });
});

Promise.resolve()
    .then(() => {
        console.log('4. Promise 1');
        return Promise.resolve();
    })
    .then(() => {
        console.log('5. Promise 2');
    });

queueMicrotask(() => {
    console.log('4.5 queueMicrotask');
});

console.log('=== Fine codice sincrono ===');
```

### ✅ Task

1. **Prima di eseguire:** Scrivi su carta l'ordine previsto di esecuzione
2. **Esegui il codice:** `node es01-execution-order.js`
3. **Confronta:** Il risultato corrisponde alla tua previsione?
4. **Documenta:** Spiega perché ogni callback è stata eseguita in quell'ordine

### 🔍 Domande di Verifica

1. Perché `process.nextTick()` viene eseguito prima delle Promise?
2. Cosa succede se annidi 100 `process.nextTick()` uno dentro l'altro?
3. L'ordine tra `setTimeout(0)` e `setImmediate()` è garantito? Perché?

### 📊 Risultato Atteso

```
=== Inizio ===
=== Fine codice sincrono ===
2. nextTick 1
3. nextTick 2 (nested)
4. Promise 1
4.5 queueMicrotask
5. Promise 2
6. setTimeout 0ms
7. setImmediate
```

---

## Esercizio 2: Microtask vs Macrotask

### 🎯 Obiettivo
Comprendere la differenza tra microtask queue e macrotask queue.

### 📝 Consegna
Crea un programma che dimostra come le microtask vengono sempre svuotate completamente prima di passare alla prossima macrotask.

### 💻 Codice da Completare

```javascript
// es02-micro-macro-task.js

function logWithTimestamp(message) {
    const timestamp = Date.now();
    console.log(`[${timestamp}] ${message}`);
}

// TODO: Completa questo esercizio

// 1. Crea un setTimeout che logga "Macrotask 1"
setTimeout(() => {
    logWithTimestamp('Macrotask 1');
    
    // TODO: Aggiungi qui 3 microtask (nextTick, Promise, queueMicrotask)
    
}, 0);

// 2. Crea un altro setTimeout che logga "Macrotask 2"
setTimeout(() => {
    logWithTimestamp('Macrotask 2');
}, 0);

// 3. Aggiungi una Promise che logga "Initial Microtask"
Promise.resolve().then(() => {
    logWithTimestamp('Initial Microtask');
});

logWithTimestamp('Synchronous code');
```

### ✅ Task

1. Completa il codice inserendo le microtask nei punti TODO
2. Esegui e osserva l'output
3. Modifica il codice per creare una "microtask storm" (10+ microtask annidate)
4. Osserva come questo ritarda l'esecuzione di Macrotask 2

### 🔍 Domande di Verifica

1. Quante microtask vengono eseguite tra Macrotask 1 e Macrotask 2?
2. Cosa succede se crei microtask ricorsive infinite?
3. Come evitare il "microtask starvation"?

### 💡 Suggerimento

Usa `process.hrtime.bigint()` per misurare il tempo preciso tra le esecuzioni.

---

## Esercizio 3: Event Loop Monitor

### 🎯 Obiettivo
Creare un monitor che rileva quando l'Event Loop è bloccato.

### 📝 Consegna
Implementa una classe `EventLoopMonitor` che:
- Misura il lag dell'Event Loop ogni secondo
- Emette un warning se il lag supera una soglia
- Tiene traccia delle statistiche (min, max, media)

### 💻 Codice da Implementare

```javascript
// es03-event-loop-monitor.js

class EventLoopMonitor {
    constructor(options = {}) {
        this.threshold = options.threshold || 50; // ms
        this.interval = options.interval || 1000; // ms
        this.monitoring = false;
        this.stats = {
            count: 0,
            totalLag: 0,
            minLag: Infinity,
            maxLag: 0,
            warnings: 0
        };
    }
    
    start() {
        if (this.monitoring) return;
        
        this.monitoring = true;
        this.lastCheck = Date.now();
        this.monitor();
    }
    
    monitor() {
        if (!this.monitoring) return;
        
        // TODO: Implementa la logica di monitoring
        // 1. Calcola il lag confrontando tempo atteso vs tempo reale
        // 2. Aggiorna le statistiche
        // 3. Emetti warning se supera threshold
        // 4. Schedula prossimo check con setInterval
        
    }
    
    stop() {
        this.monitoring = false;
        clearInterval(this.intervalId);
    }
    
    getStats() {
        return {
            ...this.stats,
            avgLag: this.stats.totalLag / this.stats.count || 0
        };
    }
    
    reset() {
        this.stats = {
            count: 0,
            totalLag: 0,
            minLag: Infinity,
            maxLag: 0,
            warnings: 0
        };
    }
}

// Test del monitor
const monitor = new EventLoopMonitor({ threshold: 10 });
monitor.start();

// Simula operazioni che bloccano l'Event Loop
function blockEventLoop(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
        // Blocca
    }
}

// Test 1: Operazione normale
setTimeout(() => {
    console.log('✅ Operazione veloce');
}, 1000);

// Test 2: Operazione bloccante
setTimeout(() => {
    console.log('⚠️  Inizio operazione bloccante...');
    blockEventLoop(100); // Blocca per 100ms
    console.log('⚠️  Fine operazione bloccante');
}, 2000);

// Stampa statistiche dopo 5 secondi
setTimeout(() => {
    console.log('\n📊 Statistiche finali:');
    console.log(monitor.getStats());
    monitor.stop();
}, 5000);
```

### ✅ Task

1. Implementa il metodo `monitor()` completo
2. Aggiungi metodi `onWarning()` e `onReport()` come callback personalizzabili
3. Estendi il monitor per tracciare anche la memoria utilizzata
4. Crea un grafico ASCII delle misurazioni

### 🔍 Domande di Verifica

1. Qual è la differenza tra `Date.now()` e `process.hrtime()`?
2. Perché usiamo `setInterval()` invece di `setTimeout()` ricorsivo?
3. Come misureresti il lag in produzione senza impattare le performance?

### 📊 Output Atteso

```
✅ Operazione veloce
⚠️  Inizio operazione bloccante...
⚠️  Event Loop Lag: 102.45ms (threshold: 10ms)
⚠️  Fine operazione bloccante

📊 Statistiche finali:
{
  count: 5,
  totalLag: 125.67,
  minLag: 0.23,
  maxLag: 102.45,
  avgLag: 25.13,
  warnings: 1
}
```

---

## Esercizio 4: Ottimizzazione Loop Pesante

### 🎯 Obiettivo
Trasformare un loop CPU-intensive bloccante in uno non bloccante.

### 📝 Consegna
Ottimizza la funzione `processArray()` che elabora milioni di elementi senza bloccare l'Event Loop.

### 💻 Codice da Ottimizzare

```javascript
// es04-optimize-loop.js

// ❌ Versione BLOCCANTE (da migliorare)
function processArrayBlocking(array) {
    console.log(`Processing ${array.length} items (BLOCKING)...`);
    const start = Date.now();
    const results = [];
    
    for (let i = 0; i < array.length; i++) {
        // Simulazione elaborazione pesante
        results.push(Math.sqrt(array[i]) * Math.PI);
    }
    
    console.log(`✅ Completed in ${Date.now() - start}ms`);
    return results;
}

// ✅ TODO: Implementa versione NON BLOCCANTE
async function processArrayNonBlocking(array, batchSize = 1000) {
    // TODO: Implementa qui
    // 1. Dividi array in batch
    // 2. Processa ogni batch
    // 3. Usa setImmediate() tra un batch e l'altro
    // 4. Mostra progress
}

// Test
const hugeArray = Array.from({ length: 10_000_000 }, (_, i) => i);

// Server HTTP per testare se rimane responsivo
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Server is alive!\n');
});
server.listen(3000, () => {
    console.log('🌐 Server listening on http://localhost:3000');
    console.log('📝 Apri un altro terminale e prova: curl http://localhost:3000');
});

// Testa versione bloccante
setTimeout(() => {
    console.log('\n--- Testing BLOCKING version ---');
    processArrayBlocking(hugeArray.slice(0, 1_000_000));
}, 2000);

// Testa versione non bloccante
setTimeout(async () => {
    console.log('\n--- Testing NON-BLOCKING version ---');
    await processArrayNonBlocking(hugeArray);
    server.close();
}, 5000);
```

### ✅ Task

1. Implementa `processArrayNonBlocking()` con batching
2. Aggiungi progress reporting (es: "Processed 30% - 3M/10M items")
3. Confronta i tempi di esecuzione delle due versioni
4. Durante l'esecuzione, verifica che il server HTTP rimanga responsivo

### 🔍 Domande di Verifica

1. Qual è il trade-off tra `batchSize` piccolo e grande?
2. Perché usiamo `setImmediate()` invece di `setTimeout(fn, 0)`?
3. Come cambierebbe l'implementazione con Worker Threads?

### 💡 Suggerimenti

```javascript
// Esempio struttura
async function processArrayNonBlocking(array, batchSize = 1000) {
    const results = [];
    const total = array.length;
    
    for (let i = 0; i < total; i += batchSize) {
        const end = Math.min(i + batchSize, total);
        
        // Processa batch
        for (let j = i; j < end; j++) {
            results.push(/* elaborazione */);
        }
        
        // Progress
        const progress = ((end / total) * 100).toFixed(1);
        console.log(`Progress: ${progress}% (${end.toLocaleString()}/${total.toLocaleString()})`);
        
        // Cede controllo all'Event Loop
        await new Promise(resolve => setImmediate(resolve));
    }
    
    return results;
}
```

---

## Esercizio 5: Worker Threads per Fibonacci

### 🎯 Obiettivo
Utilizzare Worker Threads per calcoli CPU-intensive senza bloccare il server.

### 📝 Consegna
Crea un server HTTP che calcola numeri di Fibonacci usando Worker Threads.

### 💻 File da Creare

**fibonacci-server.js** (Main thread)
```javascript
// es05-fibonacci-server.js

const http = require('http');
const { Worker } = require('worker_threads');
const url = require('url');

function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        // TODO: Implementa Worker Thread
        // 1. Crea nuovo Worker('./fibonacci-worker.js')
        // 2. Passa workerData
        // 3. Ascolta eventi: 'message', 'error', 'exit'
        // 4. Resolve/reject Promise
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/fib') {
        const n = parseInt(parsedUrl.query.n) || 10;
        
        if (n < 0 || n > 50) {
            res.writeHead(400);
            res.end('n deve essere tra 0 e 50\n');
            return;
        }
        
        try {
            console.log(`📊 Calculating Fibonacci(${n})...`);
            const start = Date.now();
            
            const result = await runWorker(n);
            
            const duration = Date.now() - start;
            console.log(`✅ Fibonacci(${n}) = ${result} (${duration}ms)`);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                n,
                result,
                duration,
                worker: 'yes'
            }));
        } catch (err) {
            res.writeHead(500);
            res.end(`Error: ${err.message}\n`);
        }
    } else if (parsedUrl.pathname === '/health') {
        res.writeHead(200);
        res.end('OK - Server is responsive!\n');
    } else {
        res.writeHead(404);
        res.end('Not found\n');
    }
});

server.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
    console.log('📝 Try: curl http://localhost:3000/fib?n=40');
    console.log('📝 Try: curl http://localhost:3000/health');
});
```

**fibonacci-worker.js** (Worker thread)
```javascript
// es05-fibonacci-worker.js

const { parentPort, workerData } = require('worker_threads');

function fibonacci(n) {
    // TODO: Implementa Fibonacci (ricorsivo o iterativo)
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// TODO: Calcola e invia risultato al parent
const result = fibonacci(workerData);
parentPort.postMessage(result);
```

### ✅ Task

1. Completa l'implementazione di entrambi i file
2. Testa con `curl http://localhost:3000/fib?n=40`
3. In un altro terminale, fai richieste a `/health` mentre il worker calcola
4. Confronta con una versione senza Worker (calcolo nel main thread)
5. **Bonus:** Implementa un Worker Pool per riutilizzare i thread

### 🔍 Domande di Verifica

1. Cosa succede se fai 5 richieste `/fib?n=45` simultanee?
2. Qual è l'overhead di creare un nuovo Worker per ogni richiesta?
3. Come implementeresti un timeout per i worker?

### 📊 Test di Carico

```bash
# Terminale 1: Avvia server
node es05-fibonacci-server.js

# Terminale 2: Test simultanei
for i in {1..5}; do
  curl "http://localhost:3000/fib?n=40" &
done

# Terminale 3: Verifica responsività
while true; do
  curl http://localhost:3000/health
  sleep 1
done
```

---

## Esercizio 6: Task Scheduler con Priorità

### 🎯 Obiettivo
Creare uno scheduler che esegue task con diversi livelli di priorità.

### 📝 Consegna
Implementa un `PriorityScheduler` che gestisce task HIGH, NORMAL e LOW priority usando le giuste API dell'Event Loop.

### 💻 Codice da Implementare

```javascript
// es06-priority-scheduler.js

class PriorityScheduler {
    constructor() {
        this.queues = {
            HIGH: [],
            NORMAL: [],
            LOW: []
        };
        this.running = false;
    }
    
    /**
     * Aggiunge un task alla coda con priorità
     * @param {string} priority - 'HIGH', 'NORMAL', 'LOW'
     * @param {Function} task - Funzione da eseguire
     * @param {string} name - Nome descrittivo del task
     */
    schedule(priority, task, name) {
        // TODO: Implementa
        // 1. Valida priority
        // 2. Aggiungi {task, name, addedAt} alla coda appropriata
        // 3. Se non sta già processando, avvia run()
    }
    
    /**
     * Esegue i task rispettando le priorità
     */
    run() {
        // TODO: Implementa usando le API corrette
        // HIGH priority -> process.nextTick()
        // NORMAL priority -> queueMicrotask()
        // LOW priority -> setImmediate()
    }
    
    getStats() {
        return {
            high: this.queues.HIGH.length,
            normal: this.queues.NORMAL.length,
            low: this.queues.LOW.length,
            total: this.queues.HIGH.length + 
                   this.queues.NORMAL.length + 
                   this.queues.LOW.length
        };
    }
}

// Test dello scheduler
const scheduler = new PriorityScheduler();

console.log('=== Scheduling tasks ===');

// Schedula task in ordine casuale
scheduler.schedule('LOW', () => {
    console.log('4. 🔵 LOW priority task 1');
}, 'Low task 1');

scheduler.schedule('HIGH', () => {
    console.log('1. 🔴 HIGH priority task 1');
}, 'High task 1');

scheduler.schedule('NORMAL', () => {
    console.log('3. 🟡 NORMAL priority task 1');
}, 'Normal task 1');

scheduler.schedule('HIGH', () => {
    console.log('1. 🔴 HIGH priority task 2');
}, 'High task 2');

scheduler.schedule('LOW', () => {
    console.log('4. 🔵 LOW priority task 2');
}, 'Low task 2');

scheduler.schedule('NORMAL', () => {
    console.log('3. 🟡 NORMAL priority task 2');
}, 'Normal task 2');

console.log('0. 🟢 Synchronous code');
console.log(`📊 Queued: ${JSON.stringify(scheduler.getStats())}`);

scheduler.run();
```

### ✅ Task

1. Implementa `schedule()` e `run()`
2. Aggiungi metodo `clear(priority)` per svuotare una coda
3. Aggiungi supporto per task asincroni (async/await)
4. **Bonus:** Implementa rate limiting (max X task al secondo)

### 🔍 Domande di Verifica

1. Perché HIGH usa `process.nextTick()` e non `Promise`?
2. Cosa succede se scheduli 1000 task HIGH?
3. Come gestiresti task che generano errori?

### 📊 Output Atteso

```
=== Scheduling tasks ===
0. 🟢 Synchronous code
📊 Queued: {"high":2,"normal":2,"low":2,"total":6}
1. 🔴 HIGH priority task 1
1. 🔴 HIGH priority task 2
3. 🟡 NORMAL priority task 1
3. 🟡 NORMAL priority task 2
4. 🔵 LOW priority task 1
4. 🔵 LOW priority task 2
```

---

## Esercizio 7: Server Non Bloccante

### 🎯 Obiettivo
Convertire un server Express bloccante in uno non bloccante.

### 📝 Consegna
Dato un server con operazioni sincrone bloccanti, ottimizzalo per gestire migliaia di richieste concorrenti.

### 💻 Codice da Ottimizzare

```javascript
// es07-blocking-server.js (VERSIONE BLOCCANTE - DA NON USARE)

const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const app = express();

app.use(express.json());

// ❌ Endpoint bloccante 1: Lettura file sincrona
app.get('/users', (req, res) => {
    const data = fs.readFileSync('./data/users.json', 'utf8');
    const users = JSON.parse(data);
    res.json(users);
});

// ❌ Endpoint bloccante 2: Hash sincrono
app.post('/hash', (req, res) => {
    const { password } = req.body;
    const hash = crypto.pbkdf2Sync(password, 'salt', 100000, 64, 'sha512');
    res.json({ hash: hash.toString('hex') });
});

// ❌ Endpoint bloccante 3: Elaborazione pesante
app.get('/stats', (req, res) => {
    const data = fs.readFileSync('./data/large-dataset.json', 'utf8');
    const records = JSON.parse(data);
    
    // Calcoli pesanti
    const stats = {
        total: records.length,
        sum: 0,
        avg: 0,
        max: 0,
        min: Infinity
    };
    
    for (let i = 0; i < records.length; i++) {
        stats.sum += records[i].value;
        stats.max = Math.max(stats.max, records[i].value);
        stats.min = Math.min(stats.min, records[i].value);
    }
    
    stats.avg = stats.sum / stats.total;
    
    res.json(stats);
});

app.listen(3000, () => {
    console.log('❌ BLOCKING Server on port 3000');
});
```

**es07-nonblocking-server.js** (DA IMPLEMENTARE)
```javascript
// es07-nonblocking-server.js

const express = require('express');
const fs = require('fs').promises;
const crypto = require('crypto');
const { promisify } = require('util');
const { Worker } = require('worker_threads');
const app = express();

const pbkdf2Async = promisify(crypto.pbkdf2);

app.use(express.json());

// ✅ TODO: Endpoint non bloccante 1
app.get('/users', async (req, res) => {
    // TODO: Usa fs.promises
});

// ✅ TODO: Endpoint non bloccante 2
app.post('/hash', async (req, res) => {
    // TODO: Usa pbkdf2Async o Worker Thread
});

// ✅ TODO: Endpoint non bloccante 3
app.get('/stats', async (req, res) => {
    // TODO: Usa Worker Thread per calcoli pesanti
});

app.listen(3000, () => {
    console.log('✅ NON-BLOCKING Server on port 3000');
});
```

### ✅ Task

1. Implementa tutti e 3 gli endpoint in versione non bloccante
2. Crea `stats-worker.js` per l'endpoint `/stats`
3. Crea file di test `data/users.json` e `data/large-dataset.json`
4. Confronta le performance con Apache Bench o autocannon

### 🔍 Test di Carico

```bash
# Crea dati di test
node create-test-data.js

# Test server bloccante
node es07-blocking-server.js &
autocannon -c 100 -d 10 http://localhost:3000/stats

# Test server non bloccante
node es07-nonblocking-server.js &
autocannon -c 100 -d 10 http://localhost:3000/stats
```

**create-test-data.js**
```javascript
const fs = require('fs');

// Crea users.json
const users = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`
}));
fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));

// Crea large-dataset.json
const dataset = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    value: Math.random() * 1000
}));
fs.writeFileSync('./data/large-dataset.json', JSON.stringify(dataset));

console.log('✅ Test data created!');
```

### 📊 Metriche da Confrontare

- Requests per second
- Latenza media
- Latenza p95/p99
- Timeout errors

---

## Esercizio 8: Cluster Mode Load Balancer

### 🎯 Obiettivo
Implementare un server che scala su tutti i core della CPU usando il modulo cluster.

### 📝 Consegna
Crea un server HTTP in cluster mode che distribuisce il carico su tutti i core disponibili.

### 💻 Codice da Implementare

```javascript
// es08-cluster-server.js

const cluster = require('cluster');
const http = require('http');
const os = require('os');
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`🎯 Master process ${process.pid} is running`);
    console.log(`📊 CPU cores: ${numCPUs}`);
    
    // TODO: Implementa master logic
    // 1. Fork worker per ogni CPU
    // 2. Gestisci eventi 'online', 'exit', 'disconnect'
    // 3. Implementa graceful shutdown
    // 4. Traccia worker attivi e loro statistiche
    
    const workers = new Map();
    
    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        forkWorker(i);
    }
    
    function forkWorker(id) {
        // TODO: Implementa
    }
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        // TODO: Implementa
    });
    
    // Worker stats ogni 5 secondi
    setInterval(() => {
        console.log('\n📊 Worker Stats:');
        // TODO: Mostra statistiche workers
    }, 5000);
    
} else {
    // Worker process
    let requestCount = 0;
    
    const server = http.createServer((req, res) => {
        requestCount++;
        
        // Simula elaborazione
        const delay = Math.random() * 100;
        
        setTimeout(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                worker: cluster.worker.id,
                pid: process.pid,
                request: requestCount,
                timestamp: new Date().toISOString()
            }));
        }, delay);
    });
    
    server.listen(3000, () => {
        console.log(`👷 Worker ${cluster.worker.id} (PID: ${process.pid}) started`);
    });
    
    // Invia statistiche al master
    setInterval(() => {
        process.send({
            type: 'stats',
            data: {
                requests: requestCount,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            }
        });
    }, 3000);
}
```

### ✅ Task

1. Completa la logica del master process
2. Implementa graceful shutdown
3. Aggiungi auto-restart dei worker che crashano
4. Implementa health check dei worker
5. **Bonus:** Aggiungi comando per aggiungere/rimuovere worker dinamicamente

### 🔍 Test

```bash
# Avvia server
node es08-cluster-server.js

# In altro terminale: test distribuzione carico
for i in {1..20}; do
  curl http://localhost:3000 &
done

# Verifica distribuzione
curl http://localhost:3000 | jq .worker
```

### 📊 Output Atteso

```
🎯 Master process 12345 is running
📊 CPU cores: 8
👷 Worker 1 (PID: 12346) started
👷 Worker 2 (PID: 12347) started
👷 Worker 3 (PID: 12348) started
👷 Worker 4 (PID: 12349) started
👷 Worker 5 (PID: 12350) started
👷 Worker 6 (PID: 12351) started
👷 Worker 7 (PID: 12352) started
👷 Worker 8 (PID: 12353) started

📊 Worker Stats:
Worker 1: 15 requests, 45.2 MB memory
Worker 2: 18 requests, 44.8 MB memory
Worker 3: 12 requests, 45.1 MB memory
...
```

---

## Esercizio 9: Streaming File Processor

### 🎯 Obiettivo
Processare file enormi (GB) usando stream senza bloccare l'Event Loop.

### 📝 Consegna
Implementa un processore che legge un file CSV gigante, trasforma i dati e scrive l'output, tutto in streaming.

### 💻 Codice da Implementare

```javascript
// es09-stream-processor.js

const fs = require('fs');
const { Transform, pipeline } = require('stream');
const readline = require('readline');

// ✅ TODO: Implementa Transform stream per elaborazione
class DataProcessor extends Transform {
    constructor(options = {}) {
        super(options);
        this.linesProcessed = 0;
        this.errors = 0;
    }
    
    _transform(chunk, encoding, callback) {
        // TODO: Implementa trasformazione
        // 1. Parse della riga CSV
        // 2. Valida dati
        // 3. Trasforma (es: converti valori, calcola campi derivati)
        // 4. Push risultato
        
        try {
            // Esempio trasformazione
            const line = chunk.toString();
            const processed = this.processLine(line);
            
            this.linesProcessed++;
            
            if (this.linesProcessed % 10000 === 0) {
                console.log(`📊 Processed ${this.linesProcessed} lines`);
            }
            
            callback(null, processed + '\n');
        } catch (err) {
            this.errors++;
            callback(err);
        }
    }
    
    processLine(line) {
        // TODO: Implementa logica di elaborazione
        // Esempio: CSV con nome,età,città
        const [name, age, city] = line.split(',');
        
        return JSON.stringify({
            name: name?.trim(),
            age: parseInt(age) || 0,
            city: city?.trim(),
            processedAt: new Date().toISOString()
        });
    }
    
    _flush(callback) {
        console.log(`✅ Processing complete: ${this.linesProcessed} lines`);
        console.log(`❌ Errors: ${this.errors}`);
        callback();
    }
}

// ✅ TODO: Implementa funzione principale
async function processLargeFile(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
        console.log(`🚀 Starting processing: ${inputFile}`);
        const start = Date.now();
        
        // TODO: Crea pipeline di stream
        // 1. createReadStream (input)
        // 2. readline per linee
        // 3. DataProcessor transform
        // 4. createWriteStream (output)
        
        const readStream = fs.createReadStream(inputFile);
        const writeStream = fs.createWriteStream(outputFile);
        const processor = new DataProcessor();
        
        const rl = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });
        
        let lineNumber = 0;
        
        rl.on('line', (line) => {
            lineNumber++;
            // Skip header
            if (lineNumber === 1) return;
            
            processor.write(line);
        });
        
        rl.on('close', () => {
            processor.end();
        });
        
        processor.pipe(writeStream);
        
        writeStream.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`✅ Completed in ${duration}ms`);
            resolve();
        });
        
        writeStream.on('error', reject);
    });
}

// Genera file di test
function generateTestFile(filename, lines = 1000000) {
    console.log(`📝 Generating test file with ${lines} lines...`);
    const writeStream = fs.createWriteStream(filename);
    
    writeStream.write('name,age,city\n'); // Header
    
    const cities = ['Milano', 'Roma', 'Napoli', 'Torino', 'Palermo'];
    
    for (let i = 0; i < lines; i++) {
        const name = `User${i}`;
        const age = Math.floor(Math.random() * 80) + 18;
        const city = cities[Math.floor(Math.random() * cities.length)];
        
        writeStream.write(`${name},${age},${city}\n`);
        
        if (i % 100000 === 0 && i > 0) {
            console.log(`  Generated ${i} lines...`);
        }
    }
    
    writeStream.end();
    
    return new Promise((resolve) => {
        writeStream.on('finish', () => {
            console.log(`✅ Test file created: ${filename}`);
            resolve();
        });
    });
}

// Main
async function main() {
    const inputFile = 'large-input.csv';
    const outputFile = 'processed-output.jsonl';
    
    // Genera file di test se non esiste
    if (!fs.existsSync(inputFile)) {
        await generateTestFile(inputFile, 1000000); // 1M righe
    }
    
    // Processa file
    await processLargeFile(inputFile, outputFile);
    
    // Verifica output
    const stats = fs.statSync(outputFile);
    console.log(`📊 Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);
```

### ✅ Task

1. Completa l'implementazione di `DataProcessor`
2. Aggiungi gestione errori robusta
3. Implementa progress bar
4. Aggiungi opzione per filtrare record (es: solo età > 30)
5. **Bonus:** Implementa backpressure handling

### 🔍 Domande di Verifica

1. Perché usare stream invece di `fs.readFile()`?
2. Cosa succede se il disco di output è più lento del disco di input?
3. Come gestiresti file compressi (.gz)?

### 📊 Test Performance

```bash
# Genera file di test (1M righe)
node es09-stream-processor.js

# Monitora memoria durante processing
while true; do
  ps aux | grep node | grep -v grep
  sleep 1
done
```

---

## Esercizio 10: Async Queue con Rate Limiting

### 🎯 Obiettivo
Creare una coda asincrona che limita il numero di operazioni concorrenti e il rate di esecuzione.

### 📝 Consegna
Implementa una `RateLimitedQueue` per gestire API calls con limiti di concorrenza e rate limiting.

### 💻 Codice da Implementare

```javascript
// es10-rate-limited-queue.js

class RateLimitedQueue {
    constructor(options = {}) {
        this.concurrency = options.concurrency || 5;
        this.rateLimit = options.rateLimit || 10; // requests per second
        this.queue = [];
        this.running = 0;
        this.completed = 0;
        this.failed = 0;
        this.rateLimitWindow = [];
    }
    
    /**
     * Aggiunge un task alla coda
     * @param {Function} task - Funzione async da eseguire
     * @returns {Promise} Risolve quando il task è completato
     */
    async enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                task,
                resolve,
                reject,
                addedAt: Date.now()
            });
            
            this.process();
        });
    }
    
    /**
     * Processa la coda rispettando limiti
     */
    async process() {
        // TODO: Implementa
        // 1. Controlla se può eseguire (concurrency + rate limit)
        // 2. Prendi task dalla coda
        // 3. Esegui task
        // 4. Gestisci risultato/errore
        // 5. Richiama process() se ci sono altri task
    }
    
    /**
     * Verifica se può eseguire rispettando rate limit
     */
    canExecute() {
        // TODO: Implementa
        // 1. Controlla concurrency
        // 2. Controlla rate limit (richieste nell'ultimo secondo)
        // 3. Pulisci vecchie entry da rateLimitWindow
        
        // Pulisci finestra (mantieni solo ultimo secondo)
        const now = Date.now();
        this.rateLimitWindow = this.rateLimitWindow.filter(
            timestamp => now - timestamp < 1000
        );
        
        // Verifica limiti
        const withinConcurrency = this.running < this.concurrency;
        const withinRateLimit = this.rateLimitWindow.length < this.rateLimit;
        
        return withinConcurrency && withinRateLimit;
    }
    
    getStats() {
        return {
            queued: this.queue.length,
            running: this.running,
            completed: this.completed,
            failed: this.failed,
            rateLimitWindow: this.rateLimitWindow.length
        };
    }
}

// ===== TEST =====

// Simula API call
function simulateAPICall(id, duration = 100) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id, result: `Success ${id}`, duration });
        }, duration);
    });
}

async function test() {
    console.log('🚀 Starting Rate Limited Queue Test\n');
    
    const queue = new RateLimitedQueue({
        concurrency: 3,    // Max 3 simultanee
        rateLimit: 5       // Max 5 per secondo
    });
    
    // Monitora stats
    const statsInterval = setInterval(() => {
        const stats = queue.getStats();
        console.log(`📊 Stats: ${JSON.stringify(stats)}`);
    }, 500);
    
    // Aggiungi 20 task
    const tasks = [];
    for (let i = 1; i <= 20; i++) {
        const task = queue.enqueue(async () => {
            console.log(`▶️  Task ${i} started`);
            const result = await simulateAPICall(i, Math.random() * 200);
            console.log(`✅ Task ${i} completed`);
            return result;
        });
        
        tasks.push(task);
    }
    
    // Attendi completamento
    const results = await Promise.all(tasks);
    
    clearInterval(statsInterval);
    
    console.log(`\n✅ All tasks completed!`);
    console.log(`📊 Final stats: ${JSON.stringify(queue.getStats())}`);
    console.log(`📝 Results: ${results.length} items`);
}

test().catch(console.error);
```

### ✅ Task

1. Implementa i metodi `process()` e `canExecute()`
2. Aggiungi metodo `clear()` per svuotare la coda
3. Aggiungi evento 'drain' quando la coda si svuota
4. Implementa priorità dei task
5. **Bonus:** Aggiungi retry automatico per task falliti

### 🔍 Domande di Verifica

1. Come gestiresti rate limit con finestra sliding invece di finestra fissa?
2. Cosa succede se un task impiega più di 1 secondo?
3. Come implementeresti token bucket algorithm?

### 📊 Output Atteso

```
🚀 Starting Rate Limited Queue Test

📊 Stats: {"queued":17,"running":3,"completed":0,"failed":0,"rateLimitWindow":3}
▶️  Task 1 started
▶️  Task 2 started
▶️  Task 3 started
✅ Task 1 completed
📊 Stats: {"queued":16,"running":3,"completed":1,"failed":0,"rateLimitWindow":4}
▶️  Task 4 started
✅ Task 2 completed
▶️  Task 5 started
... (rate limiting in azione)
✅ All tasks completed!
📊 Final stats: {"queued":0,"running":0,"completed":20,"failed":0,"rateLimitWindow":0}
```

---

## 🎓 Conclusione

Hai completato tutte le esercitazioni sull'Event Loop! Questi esercizi coprono:

- ✅ Comprensione ordine di esecuzione
- ✅ Microtask vs Macrotask
- ✅ Monitoring e debugging
- ✅ Ottimizzazione codice bloccante
- ✅ Worker Threads
- ✅ Cluster Mode
- ✅ Streaming
- ✅ Rate Limiting

### 📚 Prossimi Passi

1. Studia le Promise e async/await in dettaglio
2. Approfondisci Worker Threads e SharedArrayBuffer
3. Esplora librerie come Bull, Agenda per job queues
4. Studia pattern di scalabilità (PM2, Kubernetes)

### 🔗 Risorse Aggiuntive

- [Node.js Event Loop Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [libuv Design](http://docs.libuv.org/en/v1.x/design.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

**Buon coding! 🚀**
