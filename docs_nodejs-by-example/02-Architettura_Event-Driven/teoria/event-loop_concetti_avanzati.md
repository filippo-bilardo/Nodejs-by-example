# Event Loop in Node.js - Concetti Avanzati

In questa guida approfondiremo concetti avanzati dell'Event Loop di Node.js, inclusi:

## Bloccare l'Event Loop ⚠️

Poiché Node.js è single-threaded, operazioni CPU-intensive possono bloccare l'Event Loop, causando problemi di prestazioni:

### 🚫 Esempi di Codice Bloccante

```javascript
// ❌ BLOCCANTE: Loop sincrono pesante
function heavyComputation() {
    let result = 0;
    for (let i = 0; i < 10_000_000_000; i++) {
        result += i;
    }
    return result;
}

// Mentre questa funzione esegue, NULLA altro può essere processato!
// - Nessuna richiesta HTTP gestita
// - Nessun evento I/O processato
// - UI completamente bloccata

// ❌ BLOCCANTE: File system sincrono
const fs = require('fs');
const data = fs.readFileSync('huge-file.txt'); // Blocca tutto!

// ❌ BLOCCANTE: Regex complessa
const maliciousInput = 'a'.repeat(100000) + 'b';
const result = /^(a+)+$/.test(maliciousInput); // ReDoS attack!

// ❌ BLOCCANTE: JSON parsing di grandi file
const hugeJson = JSON.parse(fs.readFileSync('100mb.json'));
```

### ✅ Soluzioni per Evitare il Blocco

#### 1. Usare API Asincrone

```javascript
// ✅ NON BLOCCANTE: API asincrona
const fs = require('fs');

fs.readFile('huge-file.txt', (err, data) => {
    if (err) throw err;
    console.log('File letto!');
});
// L'Event Loop continua mentre il file viene letto

// ✅ Con Promise/Async-Await
const fs = require('fs').promises;

async function readFileAsync() {
    try {
        const data = await fs.readFile('huge-file.txt');
        console.log('File letto!');
    } catch (err) {
        console.error(err);
    }
}
```

#### 2. Suddividere Operazioni Pesanti con setImmediate()

```javascript
// ✅ Suddivisione con setImmediate()
function processLargeArray(array) {
    const batchSize = 1000;
    let index = 0;
    
    function processBatch() {
        const endIndex = Math.min(index + batchSize, array.length);
        
        // Processa un batch
        for (; index < endIndex; index++) {
            // Elaborazione pesante
            processItem(array[index]);
        }
        
        if (index < array.length) {
            // Permette all'Event Loop di processare altri eventi
            setImmediate(processBatch);
        } else {
            console.log('Elaborazione completata!');
        }
    }
    
    processBatch();
}
```

#### 3. Worker Threads per CPU-Intensive Tasks

```javascript
// ✅ Delegare a Worker Thread
const { Worker } = require('worker_threads');

function runHeavyTask(data) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./heavy-worker.js', {
            workerData: data
        });
        
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

// heavy-worker.js
const { parentPort, workerData } = require('worker_threads');

// Computazione pesante eseguita in thread separato
const result = heavyComputation(workerData);
parentPort.postMessage(result);
```

#### 4. Streaming per Dati Grandi

```javascript
// ✅ Usare stream invece di caricare tutto in memoria
const fs = require('fs');
const readline = require('readline');

const fileStream = fs.createReadStream('huge-file.txt');
const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
});

rl.on('line', (line) => {
    // Processa una riga alla volta
    processLine(line);
});

rl.on('close', () => {
    console.log('File processato completamente');
});
```

### 📊 Misurare il Blocco dell'Event Loop

```javascript
// Metodo 1: Timing manuale
const start = Date.now();

heavyComputation();

const duration = Date.now() - start;
console.log(`Bloccato per ${duration}ms`);

// Metodo 2: event-loop-lag
const lag = require('event-loop-lag');
const lagInterval = lag(1000); // Check ogni secondo

setInterval(() => {
    console.log(`Event Loop Lag: ${lagInterval()}ms`);
}, 5000);

// Metodo 3: perf_hooks (built-in)
const { PerformanceObserver, performance } = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.duration}ms`);
    });
});

obs.observe({ entryTypes: ['measure'] });

performance.mark('start');
heavyComputation();
performance.mark('end');
performance.measure('Heavy Computation', 'start', 'end');
```

### 🎯 Regole d'Oro

```javascript
// ✅ DO: Preferire sempre asincrono
fs.readFile('file.txt', callback);
await fs.promises.readFile('file.txt');

// ❌ DON'T: Evitare sincrono in produzione
fs.readFileSync('file.txt'); // Solo per script inizializzazione

// ✅ DO: Suddividere lavoro pesante
function* heavyGenerator() {
    for (let i = 0; i < 1000000; i++) {
        yield processItem(i);
    }
}

// ❌ DON'T: Elaborare tutto in un colpo
for (let i = 0; i < 1000000; i++) {
    processItem(i);
}

// ✅ DO: Usare Worker per CPU-intensive
const worker = new Worker('./cpu-intensive.js');

// ❌ DON'T: CPU-intensive sul main thread
const result = fibonacci(50); // Blocca tutto!
```

## Worker Threads per Parallelismo Reale

Node.js fornisce Worker Threads per eseguire JavaScript in parallelo vero, bypassando il limite single-threaded:

### 🧵 Architettura Worker Threads

```
┌────────────────────────────────────────────┐
│         MAIN THREAD (Event Loop)           │
│  ┌─────────────────────────────────────┐   │
│  │  Application Code                   │   │
│  │  HTTP Server, Business Logic        │   │
│  └─────────────────────────────────────┘   │
│              ↓ spawn                       │
├────────────────────────────────────────────┤
│  WORKER THREAD 1    │  WORKER THREAD 2     │
│  ┌───────────────┐  │  ┌───────────────┐   │
│  │ CPU-Intensive │  │  │ CPU-Intensive │   │
│  │ Task 1        │  │  │ Task 2        │   │
│  └───────────────┘  │  └───────────────┘   │
└────────────────────────────────────────────┘
        ↑ message passing ↓
```

### 💻 Esempio Pratico Worker Thread

**main.js** (Thread principale)
```javascript
const { Worker } = require('worker_threads');

function fibonacci(n) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./fib-worker.js', {
            workerData: n
        });
        
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with code ${code}`));
            }
        });
    });
}

// Server continua a rispondere mentre calcola Fibonacci
const http = require('http');

http.createServer(async (req, res) => {
    if (req.url === '/fib/40') {
        console.log('Calcolando Fibonacci(40)...');
        const result = await fibonacci(40);
        res.end(`Fibonacci(40) = ${result}`);
    } else {
        res.end('Server operativo!'); // Risponde immediatamente
    }
}).listen(3000);

console.log('Server in ascolto su porta 3000');
```

**fib-worker.js** (Worker thread)
```javascript
const { parentPort, workerData } = require('worker_threads');

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calcolo pesante eseguito in thread separato
const result = fibonacci(workerData);

// Invia risultato al main thread
parentPort.postMessage(result);
```

### 🔄 Worker Pool Pattern

```javascript
const { Worker } = require('worker_threads');
const os = require('os');

class WorkerPool {
    constructor(workerScript, poolSize = os.cpus().length) {
        this.workerScript = workerScript;
        this.poolSize = poolSize;
        this.workers = [];
        this.freeWorkers = [];
        this.taskQueue = [];
        
        // Inizializza worker pool
        for (let i = 0; i < poolSize; i++) {
            this.addWorker();
        }
    }
    
    addWorker() {
        const worker = new Worker(this.workerScript);
        
        worker.on('message', (result) => {
            // Worker ha completato il task
            const { resolve } = worker.currentTask;
            resolve(result);
            
            // Worker è di nuovo disponibile
            this.freeWorkers.push(worker);
            this.processQueue();
        });
        
        worker.on('error', (err) => {
            const { reject } = worker.currentTask;
            reject(err);
        });
        
        this.workers.push(worker);
        this.freeWorkers.push(worker);
    }
    
    async execute(data) {
        return new Promise((resolve, reject) => {
            this.taskQueue.push({ data, resolve, reject });
            this.processQueue();
        });
    }
    
    processQueue() {
        while (this.taskQueue.length > 0 && this.freeWorkers.length > 0) {
            const worker = this.freeWorkers.pop();
            const task = this.taskQueue.shift();
            
            worker.currentTask = task;
            worker.postMessage(task.data);
        }
    }
    
    destroy() {
        this.workers.forEach(worker => worker.terminate());
    }
}

// Utilizzo
const pool = new WorkerPool('./cpu-worker.js', 4);

async function processRequest(data) {
    const result = await pool.execute(data);
    return result;
}
```

### 📊 Quando Usare Worker Threads

**✅ Usa Worker Threads per:**
- Calcoli matematici complessi (crittografia, hash, compressione)
- Elaborazione immagini/video
- Parsing di file JSON/XML enormi
- Machine learning inference
- Operazioni di validazione pesanti

**❌ NON usare Worker Threads per:**
- Operazioni I/O (già asincrone nell'Event Loop)
- Task brevi (overhead spawning worker)
- Sharing di grandi quantità di dati (costo serializzazione)

## Cluster Module per Scalabilità Multicore

Il modulo `cluster` permette di creare processi Node.js multipli che condividono la stessa porta:

### 🖥️ Architettura Cluster

```
              ┌─────────────────┐
              │  MASTER PROCESS │
              └────────┬────────┘
                       │ fork()
       ┌────────┬──────┼─────┬─────────┐
       ↓        ↓            ↓         ↓
   ┌────────┐┌────────┐┌────────┐┌────────┐
   │Worker 1││Worker 2││Worker 3││Worker 4│
   │Port:80 ││Port:80 ││Port:80 ││Port:80 │
   └────────┘└────────┘└────────┘└────────┘
   
   ↑ Round-robin load balancing ↑
```

### 🚀 Esempio Cluster Mode

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    
    // Fork worker per ogni CPU
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        // Rispawn worker
        cluster.fork();
    });
    
    cluster.on('online', (worker) => {
        console.log(`Worker ${worker.process.pid} is online`);
    });
    
} else {
    // Worker process
    http.createServer((req, res) => {
        res.writeHead(200);
        res.end(`Handled by process ${process.pid}\n`);
    }).listen(8000);
    
    console.log(`Worker ${process.pid} started`);
}
```

### ⚖️ Worker Threads vs Cluster

| Caratteristica | Worker Threads | Cluster |
|----------------|----------------|---------|
| **Uso memoria** | Condivisa (SharedArrayBuffer) | Separata (processi isolati) |
| **Comunicazione** | Message passing veloce | IPC più lento |
| **Overhead** | Basso (thread) | Alto (processo) |
| **Isolamento** | Parziale | Completo |
| **Use case** | CPU-intensive tasks | Scalabilità HTTP server |
| **Crash isolation** | No (può crashare main) | Sì (worker indipendenti) |

### 🎯 Best Practice Cluster

```javascript
const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {
    const numWorkers = process.env.WORKERS || require('os').cpus().length;
    
    console.log(`Master starting ${numWorkers} workers...`);
    
    for (let i = 0; i < numWorkers; i++) {
        const worker = cluster.fork();
        
        // Timeout per health check
        worker.on('listening', () => {
            console.log(`Worker ${worker.id} ready`);
        });
    }
    
    // Gestione crash worker
    cluster.on('exit', (worker, code, signal) => {
        if (signal) {
            console.log(`Worker killed by signal ${signal}`);
        } else if (code !== 0) {
            console.log(`Worker exited with error code ${code}`);
        }
        
        // Rispawn solo se non è uno shutdown intenzionale
        if (!worker.exitedAfterDisconnect) {
            console.log('Starting a new worker...');
            cluster.fork();
        }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('Master received SIGTERM, shutting down...');
        
        Object.values(cluster.workers).forEach(worker => {
            worker.disconnect();
        });
    });
    
} else {
    // Worker code
    const server = http.createServer((req, res) => {
        // Simula elaborazione
        setTimeout(() => {
            res.writeHead(200);
            res.end(`Worker ${cluster.worker.id}: ${process.pid}\n`);
        }, 100);
    });
    
    server.listen(3000);
}
```

Per sfruttare al meglio l'Event Loop:

### 1. ⚡ Preferire Sempre API Asincrone

```javascript
// ❌ EVITARE: API sincrone bloccano l'Event Loop
const fs = require('fs');
const data = fs.readFileSync('file.txt');

// ✅ PREFERIRE: API asincrone
fs.readFile('file.txt', (err, data) => {
    if (err) throw err;
    console.log(data);
});

// ✅ ANCORA MEGLIO: Promise-based
const fs = require('fs').promises;
const data = await fs.readFile('file.txt');
```

### 2. 🔄 Suddividere Operazioni Complesse

```javascript
// ❌ Blocca l'Event Loop
function processHugeArray(array) {
    for (let i = 0; i < array.length; i++) {
        heavyOperation(array[i]);
    }
}

// ✅ Permette all'Event Loop di respirare
async function processHugeArrayAsync(array, batchSize = 1000) {
    for (let i = 0; i < array.length; i += batchSize) {
        const batch = array.slice(i, i + batchSize);
        
        // Processa batch
        batch.forEach(item => heavyOperation(item));
        
        // Cede controllo all'Event Loop
        await new Promise(resolve => setImmediate(resolve));
    }
}
```

### 3. 📊 Monitorare le Prestazioni

```javascript
// Metodo 1: Monitorare lag dell'Event Loop
const start = process.hrtime();

setInterval(() => {
    const delta = process.hrtime(start);
    const nanoseconds = delta[0] * 1e9 + delta[1];
    const milliseconds = nanoseconds / 1e6;
    
    if (milliseconds > 100) {
        console.warn(`Event Loop Lag: ${milliseconds.toFixed(2)}ms`);
    }
}, 1000);

// Metodo 2: Flag da linea di comando
// node --trace-warnings --trace-event-loop-lag server.js
```

### 4. 🧵 Utilizzare Worker Threads per CPU-Intensive

```javascript
// ❌ Blocca il server
app.get('/hash', (req, res) => {
    const hash = crypto.pbkdf2Sync(req.body.password, 'salt', 100000, 64, 'sha512');
    res.json({ hash: hash.toString('hex') });
});

// ✅ Non blocca il server
const { Worker } = require('worker_threads');

app.get('/hash', async (req, res) => {
    const hash = await runWorker('./hash-worker.js', req.body.password);
    res.json({ hash });
});
```

### 5. 🎯 Comprendere le Priorità

Conoscere l'ordine di esecuzione dei callback per ottimizzare il flusso dell'applicazione:

- Codice sincrono → process.nextTick() → Promise → Timer → I/O → setImmediate()

### 6. 🔒 Evitare Callback Hell con Async/Await

```javascript
// ❌ Callback Hell
fs.readFile('file1.txt', (err, data1) => {
    if (err) throw err;
    fs.readFile('file2.txt', (err, data2) => {
        if (err) throw err;
        console.log(data1, data2);
    });
});

// ✅ Async/Await
const fs = require('fs').promises;

async function readFiles() {
    const data1 = await fs.readFile('file1.txt');
    const data2 = await fs.readFile('file2.txt');
    console.log(data1, data2);
}
```

### 7. 🎭 Usare Stream per Dati Grandi

```javascript
// ❌ Carica tutto in memoria
const data = await fs.promises.readFile('huge-file.txt');

// ✅ Processa in streaming
const stream = fs.createReadStream('huge-file.txt');
stream.on('data', (chunk) => processChunk(chunk));
```


## 🧪 Quiz di Autovalutazione

Testa la tua comprensione dell'Event Loop:

### Domanda 1: Ordine di Esecuzione
```javascript
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
```
**Quale sarà l'output?**
<details>
<summary>Mostra risposta</summary>

```
A
D
C
B
```
**Spiegazione:** Codice sincrono (A, D) → Promise microtask (C) → Timer (B)
</details>

### Domanda 2: nextTick vs setImmediate
```javascript
setImmediate(() => console.log('immediate'));
process.nextTick(() => console.log('nextTick'));
```
**Quale viene eseguito per primo?**
<details>
<summary>Mostra risposta</summary>

```
nextTick
immediate
```
**Spiegazione:** `process.nextTick()` ha priorità massima, viene eseguito prima di qualsiasi fase dell'Event Loop.
</details>

### Domanda 3: Blocking Code
**Quale di questi blocca l'Event Loop?**
- A) `fs.readFile('file.txt', callback)`
- B) `fs.readFileSync('file.txt')`
- C) `await fs.promises.readFile('file.txt')`
- D) `stream.pipe(destination)`

<details>
<summary>Mostra risposta</summary>

**B) `fs.readFileSync('file.txt')`**

**Spiegazione:** Solo le operazioni sincrone bloccano l'Event Loop. Le altre sono tutte asincrone.
</details>

### Domanda 4: Worker Threads
**Quando dovresti usare Worker Threads invece dell'Event Loop?**
<details>
<summary>Mostra risposta</summary>

Usa Worker Threads per:
- ✅ Calcoli CPU-intensive (hash, crittografia, compressione)
- ✅ Elaborazione di immagini/video
- ✅ Parsing di grandi file JSON/XML
- ✅ Operazioni sincrone che non puoi rendere asincrone

NON usare Worker Threads per:
- ❌ Operazioni I/O (già gestite dal thread pool)
- ❌ Task brevi (overhead spawning)
- ❌ Condivisione di grandi quantità di dati
</details>

### Domanda 5: setTimeout vs setImmediate in I/O
```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
    setTimeout(() => console.log('timeout'), 0);
    setImmediate(() => console.log('immediate'));
});
```
**Quale viene eseguito per primo?**
<details>
<summary>Mostra risposta</summary>

```
immediate
timeout
```
**Spiegazione:** Quando siamo all'interno di un callback I/O (fase poll), `setImmediate()` viene sempre eseguito prima perché la fase check viene subito dopo.
</details>

## 💪 Esercizi Pratici

### Esercizio 1: Identificare Codice Bloccante
Trova e correggi il codice bloccante:

```javascript
const fs = require('fs');
const express = require('express');
const app = express();

app.get('/users', (req, res) => {
    const data = fs.readFileSync('users.json');
    const users = JSON.parse(data);
    res.json(users);
});

app.listen(3000);
```

<details>
<summary>Soluzione</summary>

```javascript
const fs = require('fs').promises;
const express = require('express');
const app = express();

app.get('/users', async (req, res) => {
    try {
        const data = await fs.readFile('users.json');
        const users = JSON.parse(data);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000);
```
</details>

### Esercizio 2: Ottimizzare Loop Pesante
Ottimizza questo codice che blocca l'Event Loop:

```javascript
function processItems(items) {
    const results = [];
    
    for (let i = 0; i < items.length; i++) {
        // Operazione CPU-intensive
        results.push(heavyComputation(items[i]));
    }
    
    return results;
}

// items.length può essere 1.000.000+
processItems(hugeArray);
```

<details>
<summary>Soluzione</summary>

```javascript
async function processItems(items, batchSize = 1000) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const endIndex = Math.min(i + batchSize, items.length);
        
        // Processa batch
        for (let j = i; j < endIndex; j++) {
            results.push(heavyComputation(items[j]));
        }
        
        // Cede controllo all'Event Loop ogni batch
        await new Promise(resolve => setImmediate(resolve));
        
        // Opzionale: progress report
        console.log(`Processed ${endIndex}/${items.length}`);
    }
    
    return results;
}

// Oppure con Worker Threads per parallelismo vero
const { Worker } = require('worker_threads');

async function processItemsParallel(items) {
    const numWorkers = require('os').cpus().length;
    const chunkSize = Math.ceil(items.length / numWorkers);
    const workers = [];
    
    for (let i = 0; i < numWorkers; i++) {
        const chunk = items.slice(i * chunkSize, (i + 1) * chunkSize);
        workers.push(runWorker('./process-worker.js', chunk));
    }
    
    const results = await Promise.all(workers);
    return results.flat();
}
```
</details>

### Esercizio 3: Debugging Event Loop Lag
Aggiungi monitoring per identificare quando l'Event Loop è bloccato:

<details>
<summary>Soluzione</summary>

```javascript
// Metodo 1: Semplice timer-based
let lastCheck = Date.now();

setInterval(() => {
    const now = Date.now();
    const lag = now - lastCheck - 1000; // Expected 1000ms
    
    if (lag > 100) {
        console.warn(`⚠️  Event Loop Lag: ${lag}ms`);
    }
    
    lastCheck = now;
}, 1000);

// Metodo 2: high-resolution timer
const start = process.hrtime.bigint();

setInterval(() => {
    const delta = process.hrtime.bigint() - start;
    const ms = Number(delta / 1000000n);
    const expected = 1000;
    const lag = ms - expected;
    
    if (lag > 100) {
        console.warn(`⚠️  Event Loop Lag: ${lag}ms`);
    }
}, 1000);

// Metodo 3: Using perf_hooks
const { PerformanceObserver, performance } = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
    items.getEntries().forEach((entry) => {
        if (entry.duration > 100) {
            console.warn(`⚠️  Slow operation: ${entry.name} took ${entry.duration}ms`);
        }
    });
});

obs.observe({ entryTypes: ['measure'], buffered: true });

// Misura operazioni critiche
function criticalOperation() {
    performance.mark('start-op');
    
    // ... operazione ...
    
    performance.mark('end-op');
    performance.measure('Critical Operation', 'start-op', 'end-op');
}
```
</details>

