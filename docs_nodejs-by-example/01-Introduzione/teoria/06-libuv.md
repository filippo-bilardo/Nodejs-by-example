# Libuv: Il Motore Asincrono di Node.js

## Cos'è libuv?

**libuv** è una libreria multipiattaforma scritta in C che fornisce supporto per operazioni di I/O asincrone basate su un event loop. Originariamente sviluppata specificamente per Node.js, è ora utilizzata anche da altri progetti come Luvit, Julia, e uvloop.

### Perché Node.js ha bisogno di libuv?

JavaScript è un linguaggio single-threaded e non ha capacità native di I/O asincrono. libuv risolve questo problema fornendo:

```
┌─────────────────────────────────────────┐
│         JavaScript Code (V8)            │
│         (Single Thread)                 │
└──────────────────┬──────────────────────┘
                   │
                   │ Node.js Bindings
                   │
┌──────────────────▼──────────────────────┐
│              libuv (C)                  │
│  ┌────────────────────────────────────┐ │
│  │         Event Loop                 │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │  Thread │  │  Network │  │  File  │ │
│  │  Pool   │  │   I/O    │  │ System │ │
│  └─────────┘  └──────────┘  └────────┘ │
└──────────────────┬──────────────────────┘
                   │
      ┌────────────┴────────────┐
      │                         │
┌─────▼──────┐         ┌────────▼────────┐
│   Linux    │         │    Windows      │
│   epoll    │         │     IOCP        │
│   macOS    │         │                 │
│   kqueue   │         │                 │
└────────────┘         └─────────────────┘
```

## Architettura di libuv

### Componenti Principali

#### 1. **Event Loop**
Il cuore pulsante di libuv che gestisce tutte le operazioni asincrone.

```c
// Struttura semplificata dell'Event Loop in libuv
typedef struct uv_loop_s {
    void* data;
    unsigned int active_handles;
    void* handle_queue[2];
    void* active_reqs[2];
    unsigned int stop_flag;
    // ... altri campi
} uv_loop_t;
```

#### 2. **Thread Pool**
Un pool di thread worker per operazioni che non possono essere gestite in modo completamente asincrono dal sistema operativo.

**Dimensione predefinita**: 4 thread  
**Massima dimensione**: 1024 thread (raccomandato max 128)

```javascript
// Configurare la dimensione del thread pool
process.env.UV_THREADPOOL_SIZE = 8;
```

#### 3. **Handles e Requests**
- **Handles**: Oggetti persistenti (es. TCP socket, timer)
- **Requests**: Operazioni one-shot (es. lettura file, DNS lookup)

### Meccanismi di I/O per Piattaforma

libuv utilizza il meccanismo più efficiente disponibile su ogni sistema operativo:

| Sistema Operativo | Meccanismo I/O | Descrizione |
|-------------------|----------------|-------------|
| **Linux** | epoll | Notifiche di eventi scalabili |
| **macOS/BSD** | kqueue | Event notification interface |
| **Windows** | IOCP | I/O Completion Ports |
| **Solaris** | event ports | Event notification system |
| **Linux 5.1+** | io_uring | Nuovo framework I/O ad alte prestazioni |

## Operazioni Gestite da libuv

### Operazioni che Usano il Thread Pool

Queste operazioni **bloccanti** vengono delegate ai thread worker:

```javascript
const fs = require('fs');
const crypto = require('crypto');
const dns = require('dns');
const zlib = require('zlib');

// 1. File System - Tutte le operazioni fs.* (eccetto fs.watch)
fs.readFile('file.txt', (err, data) => {
    // Eseguito nel thread pool
    console.log('File letto');
});

// 2. Crypto - Operazioni computazionalmente intensive
crypto.pbkdf2('password', 'salt', 100000, 512, 'sha512', (err, key) => {
    // Eseguito nel thread pool
    console.log('Hash generato');
});

// 3. DNS Lookup (ma NON dns.resolve)
dns.lookup('nodejs.org', (err, address) => {
    // Eseguito nel thread pool
    console.log('IP:', address);
});

// 4. Compressione/Decompressione
zlib.gzip('data', (err, compressed) => {
    // Eseguito nel thread pool
    console.log('Dati compressi');
});
```

### Operazioni che NON Usano il Thread Pool

Queste operazioni usano le API asincrone del sistema operativo:

```javascript
const http = require('http');
const net = require('net');
const dns = require('dns');

// 1. Network I/O - TCP/UDP
const server = http.createServer((req, res) => {
    // Non usa thread pool, usa epoll/kqueue/IOCP
    res.end('Hello');
});

// 2. DNS Resolve (diverso da dns.lookup)
dns.resolve('nodejs.org', (err, addresses) => {
    // Non usa thread pool
    console.log('IPs:', addresses);
});

// 3. Pipe/Named Pipes
const socket = net.createConnection('/tmp/socket.sock');
```

## Esempio Pratico: Analisi delle Performance

Vediamo come il thread pool influenza le prestazioni:

```javascript
const crypto = require('crypto');

console.log('Thread pool size:', process.env.UV_THREADPOOL_SIZE || 4);

const start = Date.now();
let completed = 0;

// Lanciamo 8 operazioni intensive simultaneamente
for (let i = 0; i < 8; i++) {
    crypto.pbkdf2('password', 'salt', 100000, 512, 'sha512', (err, key) => {
        completed++;
        console.log(`Task ${i + 1} completed in ${Date.now() - start}ms`);
        
        if (completed === 8) {
            console.log(`Total time: ${Date.now() - start}ms`);
        }
    });
}

/* Output con thread pool = 4 (default):
Task 1 completed in 523ms
Task 2 completed in 527ms
Task 3 completed in 531ms
Task 4 completed in 534ms
Task 5 completed in 1042ms  <- Attende che si liberi un thread
Task 6 completed in 1045ms
Task 7 completed in 1048ms
Task 8 completed in 1051ms
Total time: 1051ms
*/
```

Ora aumentiamo il thread pool:

```javascript
// All'inizio del file, PRIMA di require('crypto')
process.env.UV_THREADPOOL_SIZE = 8;

const crypto = require('crypto');

// Stesso codice di prima...

/* Output con thread pool = 8:
Task 1 completed in 518ms
Task 2 completed in 522ms
Task 3 completed in 525ms
Task 4 completed in 528ms
Task 5 completed in 531ms  <- Eseguito immediatamente
Task 6 completed in 534ms
Task 7 completed in 537ms
Task 8 completed in 540ms
Total time: 540ms  <- Quasi la metà del tempo!
*/
```

## Gestione degli Handle in libuv

### Tipi di Handle

```javascript
// Timer Handle
const timer = setTimeout(() => {
    console.log('Timer scaduto');
}, 1000);

// Internamente, libuv crea un uv_timer_t handle

// TCP Handle
const server = require('net').createServer();
server.listen(3000);
// Internamente, libuv crea un uv_tcp_t handle

// File System Watcher Handle
const watcher = require('fs').watch('file.txt', (event) => {
    console.log('File changed:', event);
});
// Internamente, libuv crea un uv_fs_event_t handle
```

### Ciclo di Vita di un Handle

```javascript
const net = require('net');

// 1. CREAZIONE - Handle allocato in memoria
const server = net.createServer();

// 2. INIZIALIZZAZIONE - Handle registrato con libuv
server.listen(3000, () => {
    console.log('Server listening');
});

// 3. ATTIVO - Handle gestisce eventi
server.on('connection', (socket) => {
    console.log('New connection');
});

// 4. CHIUSURA - Handle rilasciato
server.close(() => {
    console.log('Server closed');
    // Handle completamente deallocato
});
```

## Debugging di libuv

### Visualizzare gli Handle Attivi

```javascript
// Utility per diagnosticare memory leaks
function printActiveHandles() {
    const handles = process._getActiveHandles();
    console.log('Active Handles:', handles.length);
    
    handles.forEach((handle, index) => {
        console.log(`${index + 1}. ${handle.constructor.name}`);
    });
}

// Esempio
const server = require('http').createServer();
server.listen(3000);

const timer = setInterval(() => {
    console.log('Tick');
}, 1000);

setTimeout(() => {
    printActiveHandles();
    // Output:
    // Active Handles: 2
    // 1. Server
    // 2. Timeout
}, 500);
```

### Tracciare le Request Attive

```javascript
function printActiveRequests() {
    const requests = process._getActiveRequests();
    console.log('Active Requests:', requests.length);
}

const fs = require('fs');

// Lancia diverse operazioni asincrone
fs.readFile('file1.txt', () => {});
fs.readFile('file2.txt', () => {});
fs.readFile('file3.txt', () => {});

// Subito dopo, verifica le request attive
printActiveRequests(); // Output: Active Requests: 3
```

## Pattern Avanzati con libuv

### Pattern 1: Ottimizzare Operazioni File System

```javascript
const fs = require('fs');

// ❌ INEFFICIENTE: Legge file uno alla volta
async function readFilesSequential(files) {
    const results = [];
    for (const file of files) {
        const data = await fs.promises.readFile(file);
        results.push(data);
    }
    return results;
}

// ✅ EFFICIENTE: Usa tutti i thread disponibili
async function readFilesParallel(files) {
    return Promise.all(
        files.map(file => fs.promises.readFile(file))
    );
}

// ✅ OTTIMALE: Limita la concorrenza alla dimensione del thread pool
async function readFilesConcurrent(files, concurrency = 4) {
    const results = [];
    for (let i = 0; i < files.length; i += concurrency) {
        const batch = files.slice(i, i + concurrency);
        const batchResults = await Promise.all(
            batch.map(file => fs.promises.readFile(file))
        );
        results.push(...batchResults);
    }
    return results;
}

// Benchmark
const files = Array.from({ length: 20 }, (_, i) => `file${i}.txt`);

console.time('Sequential');
await readFilesSequential(files);
console.timeEnd('Sequential'); // ~10 secondi

console.time('Parallel');
await readFilesParallel(files);
console.timeEnd('Parallel'); // ~2.5 secondi (con thread pool = 4)

console.time('Concurrent');
await readFilesConcurrent(files, 4);
console.timeEnd('Concurrent'); // ~2.5 secondi, ma più prevedibile
```

### Pattern 2: Monitorare la Saturazione del Thread Pool

```javascript
class ThreadPoolMonitor {
    constructor() {
        this.inProgress = 0;
        this.maxConcurrent = 0;
        this.totalTasks = 0;
        this.startTime = Date.now();
    }

    wrap(asyncFn) {
        return async (...args) => {
            this.inProgress++;
            this.totalTasks++;
            this.maxConcurrent = Math.max(this.maxConcurrent, this.inProgress);

            try {
                return await asyncFn(...args);
            } finally {
                this.inProgress--;
            }
        };
    }

    getStats() {
        const elapsed = Date.now() - this.startTime;
        return {
            currentlyInProgress: this.inProgress,
            maxConcurrent: this.maxConcurrent,
            totalTasks: this.totalTasks,
            avgTasksPerSecond: (this.totalTasks / (elapsed / 1000)).toFixed(2),
            threadPoolSaturated: this.maxConcurrent >= (process.env.UV_THREADPOOL_SIZE || 4)
        };
    }
}

// Uso
const monitor = new ThreadPoolMonitor();
const fs = require('fs').promises;

const monitoredReadFile = monitor.wrap(fs.readFile);

// Leggi molti file
const files = Array.from({ length: 100 }, (_, i) => `file${i}.txt`);
await Promise.all(files.map(f => monitoredReadFile(f)));

console.log(monitor.getStats());
// {
//   currentlyInProgress: 0,
//   maxConcurrent: 4,
//   totalTasks: 100,
//   avgTasksPerSecond: 25.5,
//   threadPoolSaturated: true  <- Thread pool era il bottleneck!
// }
```

### Pattern 3: Custom Thread Pool per Operazioni Specifiche

```javascript
const { Worker } = require('worker_threads');

class CustomThreadPool {
    constructor(workerScript, poolSize = 4) {
        this.workers = [];
        this.availableWorkers = [];
        this.taskQueue = [];

        // Crea i worker
        for (let i = 0; i < poolSize; i++) {
            const worker = new Worker(workerScript);
            this.workers.push(worker);
            this.availableWorkers.push(worker);
        }
    }

    async execute(data) {
        return new Promise((resolve, reject) => {
            const task = { data, resolve, reject };

            if (this.availableWorkers.length > 0) {
                this.runTask(task);
            } else {
                this.taskQueue.push(task);
            }
        });
    }

    runTask(task) {
        const worker = this.availableWorkers.pop();

        const onMessage = (result) => {
            cleanup();
            task.resolve(result);
            
            // Processa prossimo task in coda
            if (this.taskQueue.length > 0) {
                const nextTask = this.taskQueue.shift();
                this.runTask(nextTask);
            } else {
                this.availableWorkers.push(worker);
            }
        };

        const onError = (err) => {
            cleanup();
            task.reject(err);
            this.availableWorkers.push(worker);
        };

        const cleanup = () => {
            worker.off('message', onMessage);
            worker.off('error', onError);
        };

        worker.once('message', onMessage);
        worker.once('error', onError);
        worker.postMessage(task.data);
    }

    async destroy() {
        await Promise.all(this.workers.map(w => w.terminate()));
    }
}

// worker.js
const { parentPort } = require('worker_threads');

parentPort.on('message', (data) => {
    // Operazione CPU-intensive
    const result = heavyComputation(data);
    parentPort.postMessage(result);
});

// Uso
const pool = new CustomThreadPool('./worker.js', 8);

const results = await Promise.all(
    Array.from({ length: 100 }, (_, i) => pool.execute(i))
);

await pool.destroy();
```

## Differenze tra libuv Thread Pool e Worker Threads

| Caratteristica | libuv Thread Pool | Worker Threads |
|----------------|-------------------|----------------|
| **Scopo** | I/O bloccanti | CPU-intensive |
| **Accesso** | Automatico | Manuale |
| **Controllo** | Limitato | Completo |
| **Isolamento** | No | Sì (heap separato) |
| **Overhead** | Basso | Moderato |
| **Comunicazione** | Callback | Message passing |
| **Use case** | File I/O, crypto | Calcoli, parsing |

```javascript
// libuv Thread Pool (automatico)
const fs = require('fs');
fs.readFile('file.txt', (err, data) => {
    // libuv gestisce tutto automaticamente
});

// Worker Threads (manuale)
const { Worker } = require('worker_threads');
const worker = new Worker('./heavy-task.js');
worker.on('message', (result) => {
    // Gestiamo manualmente comunicazione e lifecycle
});
```

## Performance Tuning

### Linee Guida per Dimensionare il Thread Pool

```javascript
// Formula generale:
// UV_THREADPOOL_SIZE = numero_di_core_CPU * 2

const os = require('os');
const cpuCount = os.cpus().length;

// Per applicazioni I/O intensive
process.env.UV_THREADPOOL_SIZE = cpuCount * 2;

// Per applicazioni miste (I/O + CPU)
process.env.UV_THREADPOOL_SIZE = Math.min(cpuCount * 4, 128);

// Per applicazioni con molte operazioni crypto
process.env.UV_THREADPOOL_SIZE = Math.min(cpuCount * 3, 64);
```

### Benchmark: Trovare la Dimensione Ottimale

```javascript
const crypto = require('crypto');
const { performance } = require('perf_hooks');

async function benchmark(threadPoolSize, iterations) {
    // IMPORTANTE: Riavviare il processo per ogni test
    process.env.UV_THREADPOOL_SIZE = threadPoolSize;
    
    const start = performance.now();
    
    await Promise.all(
        Array.from({ length: iterations }, () =>
            new Promise((resolve) => {
                crypto.pbkdf2('password', 'salt', 100000, 512, 'sha512', resolve);
            })
        )
    );
    
    const duration = performance.now() - start;
    
    return {
        threadPoolSize,
        iterations,
        duration: duration.toFixed(2) + 'ms',
        throughput: (iterations / (duration / 1000)).toFixed(2) + ' ops/sec'
    };
}

// Eseguire in processi separati
// node benchmark.js 4 20
// node benchmark.js 8 20
// node benchmark.js 16 20

const [,, threadPoolSize, iterations] = process.argv;
benchmark(Number(threadPoolSize), Number(iterations))
    .then(results => console.table(results));
```

## Troubleshooting Comuni

### Problema 1: Thread Pool Esaurito

**Sintomo**: Latenza improvvisa in operazioni file system

```javascript
// Diagnosticare
const fs = require('fs');

console.time('batch1');
await Promise.all(
    Array.from({ length: 100 }, () => fs.promises.readFile('file.txt'))
);
console.timeEnd('batch1'); // Lento!

// Soluzione
process.env.UV_THREADPOOL_SIZE = 16; // Aumentare thread pool
```

### Problema 2: Memory Leak da Handle Non Chiusi

**Sintomo**: Memoria cresce costantemente

```javascript
// ❌ PROBLEMA: Handle non chiuso
setInterval(() => {
    const server = require('net').createServer();
    server.listen(0); // Non viene mai chiuso!
}, 1000);

// ✅ SOLUZIONE: Chiudere sempre gli handle
const servers = [];
setInterval(() => {
    const server = require('net').createServer();
    server.listen(0);
    servers.push(server);
    
    // Chiudi dopo 5 secondi
    setTimeout(() => {
        const s = servers.shift();
        s.close();
    }, 5000);
}, 1000);
```

### Problema 3: Deadlock nel Thread Pool

**Sintomo**: Applicazione sembra bloccata

```javascript
// ❌ PROBLEMA: Deadlock
// Con UV_THREADPOOL_SIZE = 4
const fs = require('fs');

async function readFiles() {
    // Tutti e 4 i thread iniziano a leggere
    const reads = [
        fs.promises.readFile('file1.txt'),
        fs.promises.readFile('file2.txt'),
        fs.promises.readFile('file3.txt'),
        fs.promises.readFile('file4.txt')
    ];
    
    // Ora vogliamo fare altre operazioni, ma thread pool è pieno!
    await fs.promises.writeFile('output.txt', 'data'); // Blocca!
    
    await Promise.all(reads);
}

// ✅ SOLUZIONE: Gestire concorrenza
async function readFilesSafely() {
    const CONCURRENT_LIMIT = 2; // Lascia thread disponibili
    
    const files = ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt'];
    const results = [];
    
    for (let i = 0; i < files.length; i += CONCURRENT_LIMIT) {
        const batch = files.slice(i, i + CONCURRENT_LIMIT);
        const batchResults = await Promise.all(
            batch.map(f => fs.promises.readFile(f))
        );
        results.push(...batchResults);
    }
    
    // Ora possiamo scrivere senza blocchi
    await fs.promises.writeFile('output.txt', 'data');
    
    return results;
}
```

## Esercizi Pratici

### Esercizio 1: Analizzare Thread Pool Utilization

Scrivere un programma che:
1. Esegue 50 operazioni crypto simultanee
2. Misura il tempo totale
3. Identifica se il thread pool è il bottleneck
4. Suggerisce la dimensione ottimale

```javascript
// TODO: Implementare qui
```

### Esercizio 2: Custom Handle Tracker

Creare una utility che traccia tutti gli handle attivi e identifica potenziali memory leaks:

```javascript
class HandleTracker {
    // TODO: Implementare
    // - track(): registra handle correnti
    // - compare(): confronta con snapshot precedente
    // - findLeaks(): identifica handle che non vengono chiusi
}
```

### Esercizio 3: Thread Pool Profiler

Implementare un profiler che misura:
- Tempo medio in coda prima dell'esecuzione
- Utilizzo percentuale di ogni thread
- Identificare operazioni che saturano il pool

```javascript
class ThreadPoolProfiler {
    // TODO: Implementare
}
```

## Domande di Autovalutazione

### Domanda 1
Qual è il ruolo principale di libuv in Node.js?

A) Compilare JavaScript in bytecode  
B) Fornire l'Event Loop e gestione I/O asincrono  
C) Ottimizzare la garbage collection  
D) Gestire il module system

### Domanda 2
Quale operazione NON utilizza il thread pool di libuv?

A) `fs.readFile()`  
B) `crypto.pbkdf2()`  
C) `http.request()`  
D) `dns.lookup()`

### Domanda 3
Qual è la dimensione predefinita del thread pool di libuv?

A) 2 thread  
B) 4 thread  
C) 8 thread  
D) Uguale al numero di CPU core

### Domanda 4
Come si configura la dimensione del thread pool?

A) `libuv.threadPoolSize = 8`  
B) `process.env.UV_THREADPOOL_SIZE = 8`  
C) `uv.setThreadPool(8)`  
D) Non è configurabile

### Domanda 5
Quale meccanismo usa libuv su Linux per I/O asincrono?

A) IOCP  
B) kqueue  
C) epoll  
D) select

---

## Risposte

**Domanda 1: B** - libuv fornisce l'implementazione dell'Event Loop e la gestione di tutte le operazioni I/O asincrone, astraendo le differenze tra sistemi operativi.

**Domanda 2: C** - `http.request()` utilizza le API di rete asincrone del sistema operativo (epoll/kqueue/IOCP) e non richiede il thread pool. File system, crypto e dns.lookup invece sì.

**Domanda 3: B** - La dimensione predefinita del thread pool è 4 thread. Può essere configurata con UV_THREADPOOL_SIZE.

**Domanda 4: B** - Si configura con la variabile d'ambiente `process.env.UV_THREADPOOL_SIZE`, impostata all'inizio del programma prima di caricare moduli.

**Domanda 5: C** - Su Linux, libuv utilizza epoll per gestire eventi I/O in modo efficiente. macOS usa kqueue, Windows usa IOCP, e Linux 5.1+ può usare io_uring.

---

**Risorse Aggiuntive:**
- [Documentazione ufficiale libuv](http://docs.libuv.org/)
- [Repository GitHub libuv](https://github.com/libuv/libuv)
- [libuv Design Overview](http://docs.libuv.org/en/v1.x/design.html)