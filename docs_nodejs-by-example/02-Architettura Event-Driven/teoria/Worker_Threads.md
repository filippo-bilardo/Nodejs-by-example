# Worker Threads in Node.js

## Cos'è Worker Threads?

**Worker Threads** è un modulo nativo di Node.js che permette di eseguire JavaScript in **thread paralleli** all'interno dello stesso processo. A differenza di `child_process` che crea un nuovo processo Node.js completo, i worker threads condividono memoria e risorse mentre operano indipendentemente dal thread principale.

### Perché Servono i Worker Threads?

Node.js è **single-threaded** per l'esecuzione JavaScript. Questo va bene per operazioni I/O, ma per operazioni CPU-intensive (calcoli pesanti, elaborazione dati), il codice blocca l'Event Loop, rendendo l'applicazione non reattiva.

```javascript
// ❌ PROBLEMA: Blocca l'Event Loop
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Questo blocca tutto per secondi!
const result = fibonacci(45);
console.log(result);

// Durante il calcolo, il server non può gestire altre richieste!
```

### Architettura Worker Threads

```
┌─────────────────────────────────────────┐
│         MAIN THREAD                     │
│  - Event Loop                           │
│  - Gestisce I/O                         │
│  - Coordina Worker                      │
└───┬─────────────────────────────────┬───┘
    │                                 │
    │ Message Passing                 │
    │ (Structured Clone)              │
    │                                 │
┌───▼─────────────────┐   ┌───────────▼─────────────┐
│   WORKER THREAD 1   │   │   WORKER THREAD 2       │
│  - Event Loop       │   │  - Event Loop           │
│  - Heap separato    │   │  - Heap separato        │
│  - CPU-intensive    │   │  - CPU-intensive        │
└─────────────────────┘   └─────────────────────────┘
```

## Primi Passi con Worker Threads

### Esempio Base

```javascript
// main.js
const { Worker } = require('worker_threads');

console.log('Main thread start');

// Crea un worker
const worker = new Worker('./worker.js');

// Ascolta messaggi dal worker
worker.on('message', (result) => {
    console.log('Risultato dal worker:', result);
});

// Ascolta errori
worker.on('error', (err) => {
    console.error('Errore worker:', err);
});

// Ascolta uscita
worker.on('exit', (code) => {
    console.log(`Worker terminato con codice ${code}`);
});

// Invia dati al worker
worker.postMessage({ number: 45 });

console.log('Main thread continua a lavorare...');

/* Output:
Main thread start
Main thread continua a lavorare...
Risultato dal worker: 1134903170
Worker terminato con codice 0
*/
```

```javascript
// worker.js
const { parentPort } = require('worker_threads');

// Ascolta messaggi dal parent
parentPort.on('message', (data) => {
    console.log('Worker riceve:', data);
    
    // Calcolo pesante
    const result = fibonacci(data.number);
    
    // Invia risultato al parent
    parentPort.postMessage(result);
});

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

### Worker con workerData

```javascript
// main.js
const { Worker } = require('worker_threads');

const worker = new Worker('./worker.js', {
    workerData: {
        number: 45,
        operation: 'fibonacci'
    }
});

worker.on('message', (result) => {
    console.log('Risultato:', result);
});
```

```javascript
// worker.js
const { workerData, parentPort } = require('worker_threads');

console.log('Worker data:', workerData);

// Accedi ai dati iniziali
const { number, operation } = workerData;

if (operation === 'fibonacci') {
    const result = fibonacci(number);
    parentPort.postMessage(result);
}

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

## Worker Inline (senza file separato)

```javascript
const { Worker } = require('worker_threads');

// Worker inline usando eval
const workerCode = `
const { parentPort, workerData } = require('worker_threads');

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(workerData);
parentPort.postMessage(result);
`;

const worker = new Worker(workerCode, {
    eval: true,
    workerData: 40
});

worker.on('message', (result) => {
    console.log('Fibonacci(40):', result);
});

worker.on('error', (err) => {
    console.error('Errore:', err);
});
```

## Comunicazione Bidirezionale

### Esempio Completo

```javascript
// main.js
const { Worker } = require('worker_threads');

const worker = new Worker('./interactive-worker.js');

// Invia comandi al worker
worker.postMessage({ command: 'start', data: [1, 2, 3, 4, 5] });

worker.on('message', (msg) => {
    if (msg.type === 'progress') {
        console.log(`Progresso: ${msg.percent}%`);
    } else if (msg.type === 'result') {
        console.log('Risultato finale:', msg.data);
        
        // Invia altro comando
        worker.postMessage({ command: 'stop' });
    } else if (msg.type === 'stopped') {
        console.log('Worker fermato');
        worker.terminate();
    }
});
```

```javascript
// interactive-worker.js
const { parentPort } = require('worker_threads');

let isRunning = false;

parentPort.on('message', (msg) => {
    if (msg.command === 'start') {
        isRunning = true;
        processData(msg.data);
    } else if (msg.command === 'stop') {
        isRunning = false;
        parentPort.postMessage({ type: 'stopped' });
    }
});

function processData(data) {
    const total = data.length;
    
    data.forEach((item, index) => {
        if (!isRunning) return;
        
        // Simula elaborazione
        const processed = heavyProcessing(item);
        
        // Invia progresso
        const percent = Math.round(((index + 1) / total) * 100);
        parentPort.postMessage({
            type: 'progress',
            percent
        });
    });
    
    // Invia risultato
    parentPort.postMessage({
        type: 'result',
        data: 'Elaborazione completata'
    });
}

function heavyProcessing(item) {
    // Simula lavoro pesante
    let sum = 0;
    for (let i = 0; i < 10000000; i++) {
        sum += i * item;
    }
    return sum;
}
```

## SharedArrayBuffer e Atomics

I worker possono condividere memoria usando `SharedArrayBuffer` per comunicazione ad alte prestazioni.

### Esempio SharedArrayBuffer

```javascript
// main.js
const { Worker } = require('worker_threads');

// Crea buffer condiviso
const sharedBuffer = new SharedArrayBuffer(4); // 4 bytes
const sharedArray = new Int32Array(sharedBuffer);

console.log('Valore iniziale:', sharedArray[0]);

const worker = new Worker('./shared-worker.js', {
    workerData: { sharedBuffer }
});

worker.on('message', (msg) => {
    if (msg === 'done') {
        console.log('Valore dopo worker:', sharedArray[0]);
    }
});

/* Output:
Valore iniziale: 0
Worker ha scritto nel buffer condiviso
Valore dopo worker: 42
*/
```

```javascript
// shared-worker.js
const { workerData, parentPort } = require('worker_threads');

const sharedArray = new Int32Array(workerData.sharedBuffer);

// Scrivi nel buffer condiviso
sharedArray[0] = 42;

console.log('Worker ha scritto nel buffer condiviso');

parentPort.postMessage('done');
```

### Atomics per Sincronizzazione

```javascript
// main.js
const { Worker } = require('worker_threads');

const sharedBuffer = new SharedArrayBuffer(4);
const sharedArray = new Int32Array(sharedBuffer);

const worker = new Worker('./atomic-worker.js', {
    workerData: { sharedBuffer }
});

console.log('Main: Attendo che worker incrementi...');

// Attendi notifica dal worker
Atomics.wait(sharedArray, 0, 0); // Blocca finché sharedArray[0] != 0

console.log('Main: Worker ha finito, valore =', sharedArray[0]);
```

```javascript
// atomic-worker.js
const { workerData, parentPort } = require('worker_threads');

const sharedArray = new Int32Array(workerData.sharedBuffer);

// Simula lavoro
setTimeout(() => {
    // Incrementa atomicamente
    Atomics.add(sharedArray, 0, 1);
    
    // Notifica il main thread
    Atomics.notify(sharedArray, 0, 1);
    
    parentPort.postMessage('done');
}, 1000);
```

## Worker Pool Pattern

### Implementazione Pool Base

```javascript
// worker-pool.js
const { Worker } = require('worker_threads');
const os = require('os');

class WorkerPool {
    constructor(workerScript, poolSize = os.cpus().length) {
        this.workerScript = workerScript;
        this.poolSize = poolSize;
        this.workers = [];
        this.freeWorkers = [];
        this.taskQueue = [];
        
        this.initialize();
    }
    
    initialize() {
        for (let i = 0; i < this.poolSize; i++) {
            const worker = new Worker(this.workerScript);
            
            worker.on('message', (result) => {
                // Worker ha completato task
                const task = worker.currentTask;
                
                if (task) {
                    task.resolve(result);
                    worker.currentTask = null;
                }
                
                // Rimetti worker nel pool
                this.freeWorkers.push(worker);
                
                // Processa prossimo task in coda
                this.processNextTask();
            });
            
            worker.on('error', (err) => {
                const task = worker.currentTask;
                
                if (task) {
                    task.reject(err);
                    worker.currentTask = null;
                }
                
                // Worker ha errore, ricrealo
                this.replaceWorker(worker);
            });
            
            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`Worker exit con codice ${code}`);
                    this.replaceWorker(worker);
                }
            });
            
            this.workers.push(worker);
            this.freeWorkers.push(worker);
        }
    }
    
    replaceWorker(oldWorker) {
        const index = this.workers.indexOf(oldWorker);
        
        if (index !== -1) {
            this.workers.splice(index, 1);
            
            const freeIndex = this.freeWorkers.indexOf(oldWorker);
            if (freeIndex !== -1) {
                this.freeWorkers.splice(freeIndex, 1);
            }
            
            // Crea nuovo worker
            const newWorker = new Worker(this.workerScript);
            this.workers.push(newWorker);
            this.freeWorkers.push(newWorker);
        }
    }
    
    execute(data) {
        return new Promise((resolve, reject) => {
            const task = { data, resolve, reject };
            
            if (this.freeWorkers.length > 0) {
                this.runTask(task);
            } else {
                this.taskQueue.push(task);
            }
        });
    }
    
    runTask(task) {
        const worker = this.freeWorkers.pop();
        worker.currentTask = task;
        worker.postMessage(task.data);
    }
    
    processNextTask() {
        if (this.taskQueue.length > 0 && this.freeWorkers.length > 0) {
            const task = this.taskQueue.shift();
            this.runTask(task);
        }
    }
    
    async terminate() {
        await Promise.all(
            this.workers.map(worker => worker.terminate())
        );
    }
    
    getStats() {
        return {
            totalWorkers: this.workers.length,
            freeWorkers: this.freeWorkers.length,
            busyWorkers: this.workers.length - this.freeWorkers.length,
            queuedTasks: this.taskQueue.length
        };
    }
}

module.exports = WorkerPool;
```

### Uso del Worker Pool

```javascript
// main.js
const WorkerPool = require('./worker-pool');

const pool = new WorkerPool('./calculation-worker.js', 4);

async function runTasks() {
    const tasks = [];
    
    console.log('Inizio 20 task...');
    console.time('Total time');
    
    for (let i = 0; i < 20; i++) {
        tasks.push(
            pool.execute({ number: 40 + i })
                .then(result => {
                    console.log(`Task ${i} completato: ${result}`);
                    return result;
                })
        );
    }
    
    await Promise.all(tasks);
    
    console.timeEnd('Total time');
    console.log('Stats:', pool.getStats());
    
    await pool.terminate();
}

runTasks();

/* Output:
Inizio 20 task...
Task 0 completato: 102334155
Task 1 completato: 165580141
Task 2 completato: 267914296
Task 3 completato: 433494437
... (task eseguiti in parallelo)
Total time: 5432ms  ← Molto più veloce che sequenziale!
Stats: { totalWorkers: 4, freeWorkers: 4, busyWorkers: 0, queuedTasks: 0 }
*/
```

```javascript
// calculation-worker.js
const { parentPort } = require('worker_threads');

parentPort.on('message', (data) => {
    const result = fibonacci(data.number);
    parentPort.postMessage(result);
});

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
```

## Casi d'Uso Pratici

### Caso 1: Image Processing

```javascript
// image-processor.js
const { Worker } = require('worker_threads');
const path = require('path');

class ImageProcessor {
    constructor(poolSize = 4) {
        this.workers = [];
        
        for (let i = 0; i < poolSize; i++) {
            this.workers.push(
                new Worker(path.join(__dirname, 'image-worker.js'))
            );
        }
    }
    
    async processImages(imagePaths) {
        const chunks = this.chunkArray(imagePaths, this.workers.length);
        
        const promises = chunks.map((chunk, index) => {
            return this.processChunk(chunk, index);
        });
        
        const results = await Promise.all(promises);
        return results.flat();
    }
    
    processChunk(imagePaths, workerIndex) {
        return new Promise((resolve, reject) => {
            const worker = this.workers[workerIndex];
            
            worker.once('message', resolve);
            worker.once('error', reject);
            
            worker.postMessage({ images: imagePaths });
        });
    }
    
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += Math.ceil(array.length / size)) {
            chunks.push(array.slice(i, i + Math.ceil(array.length / size)));
        }
        return chunks;
    }
    
    async terminate() {
        await Promise.all(this.workers.map(w => w.terminate()));
    }
}

// Uso
async function main() {
    const processor = new ImageProcessor(4);
    
    const images = Array.from({ length: 100 }, (_, i) => `image${i}.jpg`);
    
    console.time('Processing');
    const results = await processor.processImages(images);
    console.timeEnd('Processing');
    
    console.log(`Processate ${results.length} immagini`);
    
    await processor.terminate();
}

main();
```

```javascript
// image-worker.js
const { parentPort } = require('worker_threads');

parentPort.on('message', (data) => {
    const results = data.images.map(imagePath => {
        // Simula processing pesante
        return processImage(imagePath);
    });
    
    parentPort.postMessage(results);
});

function processImage(imagePath) {
    // Simula elaborazione (resize, filters, etc.)
    let sum = 0;
    for (let i = 0; i < 10000000; i++) {
        sum += Math.sqrt(i);
    }
    
    return {
        path: imagePath,
        processed: true,
        timestamp: Date.now()
    };
}
```

### Caso 2: Data Processing Pipeline

```javascript
// data-pipeline.js
const { Worker } = require('worker_threads');

class DataPipeline {
    constructor(stages) {
        this.stages = stages;
        this.workers = stages.map(stage => new Worker(stage.script));
    }
    
    async process(data) {
        let result = data;
        
        for (let i = 0; i < this.workers.length; i++) {
            result = await this.runStage(this.workers[i], result);
        }
        
        return result;
    }
    
    runStage(worker, data) {
        return new Promise((resolve, reject) => {
            worker.once('message', resolve);
            worker.once('error', reject);
            worker.postMessage(data);
        });
    }
    
    async terminate() {
        await Promise.all(this.workers.map(w => w.terminate()));
    }
}

// Uso
const pipeline = new DataPipeline([
    { name: 'parse', script: './parse-worker.js' },
    { name: 'transform', script: './transform-worker.js' },
    { name: 'validate', script: './validate-worker.js' }
]);

async function processData(rawData) {
    const result = await pipeline.process(rawData);
    console.log('Pipeline result:', result);
    await pipeline.terminate();
}

processData({ raw: 'data' });
```

### Caso 3: Web Scraping Parallelo

```javascript
// scraper.js
const { Worker } = require('worker_threads');

class ParallelScraper {
    constructor(urls, concurrency = 10) {
        this.urls = urls;
        this.concurrency = concurrency;
        this.results = [];
    }
    
    async scrapeAll() {
        const chunks = this.chunk(this.urls, this.concurrency);
        
        for (const chunk of chunks) {
            const promises = chunk.map(url => this.scrapeUrl(url));
            const results = await Promise.all(promises);
            this.results.push(...results);
        }
        
        return this.results;
    }
    
    scrapeUrl(url) {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./scraper-worker.js', {
                workerData: { url }
            });
            
            worker.on('message', (data) => {
                worker.terminate();
                resolve(data);
            });
            
            worker.on('error', (err) => {
                worker.terminate();
                reject(err);
            });
            
            // Timeout di 30 secondi
            setTimeout(() => {
                worker.terminate();
                reject(new Error(`Timeout scraping ${url}`));
            }, 30000);
        });
    }
    
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}

// Uso
async function main() {
    const urls = [
        'https://example.com/page1',
        'https://example.com/page2',
        // ... 100 URL
    ];
    
    const scraper = new ParallelScraper(urls, 10);
    
    console.time('Scraping');
    const results = await scraper.scrapeAll();
    console.timeEnd('Scraping');
    
    console.log(`Scraped ${results.length} pages`);
}

main();
```

```javascript
// scraper-worker.js
const { workerData, parentPort } = require('worker_threads');
const https = require('https');

const { url } = workerData;

https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        // Simula parsing HTML
        const result = {
            url,
            status: res.statusCode,
            length: data.length,
            title: extractTitle(data)
        };
        
        parentPort.postMessage(result);
    });
}).on('error', (err) => {
    parentPort.postMessage({
        url,
        error: err.message
    });
});

function extractTitle(html) {
    const match = html.match(/<title>([^<]*)</title>/);
    return match ? match[1] : 'No title';
}
```

## Performance e Best Practices

### Benchmark: Worker vs Main Thread

```javascript
const { Worker } = require('worker_threads');
const { performance } = require('perf_hooks');

async function benchmarkWorker() {
    const start = performance.now();
    
    const worker = new Worker(`
        const { parentPort, workerData } = require('worker_threads');
        
        function fibonacci(n) {
            if (n <= 1) return n;
            return fibonacci(n - 1) + fibonacci(n - 2);
        }
        
        const result = fibonacci(workerData);
        parentPort.postMessage(result);
    `, {
        eval: true,
        workerData: 43
    });
    
    const result = await new Promise(resolve => {
        worker.on('message', resolve);
    });
    
    const duration = performance.now() - start;
    
    return { method: 'Worker Thread', duration, result };
}

function benchmarkMainThread() {
    const start = performance.now();
    
    function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    const result = fibonacci(43);
    const duration = performance.now() - start;
    
    return { method: 'Main Thread', duration, result };
}

async function runBenchmarks() {
    console.log('Running benchmarks...\n');
    
    const mainResult = benchmarkMainThread();
    console.log(`${mainResult.method}:`);
    console.log(`  Duration: ${mainResult.duration.toFixed(2)}ms`);
    console.log(`  Result: ${mainResult.result}\n`);
    
    const workerResult = await benchmarkWorker();
    console.log(`${workerResult.method}:`);
    console.log(`  Duration: ${workerResult.duration.toFixed(2)}ms`);
    console.log(`  Result: ${workerResult.result}\n`);
    
    console.log(`Overhead: ${(workerResult.duration - mainResult.duration).toFixed(2)}ms`);
}

runBenchmarks();

/* Output tipico:
Running benchmarks...

Main Thread:
  Duration: 4523.42ms
  Result: 433494437

Worker Thread:
  Duration: 4587.23ms
  Result: 433494437

Overhead: 63.81ms  ← Overhead di creazione worker
*/
```

### Best Practice 1: Riutilizza Worker

```javascript
// ❌ MALE: Crea worker ogni volta
async function badPattern(data) {
    const worker = new Worker('./worker.js');
    const result = await new Promise(resolve => {
        worker.on('message', resolve);
        worker.postMessage(data);
    });
    await worker.terminate();
    return result;
}

// ✅ BENE: Riutilizza worker
class ReusableWorker {
    constructor(script) {
        this.worker = new Worker(script);
        this.busy = false;
    }
    
    async execute(data) {
        while (this.busy) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        this.busy = true;
        
        try {
            return await new Promise((resolve, reject) => {
                this.worker.once('message', resolve);
                this.worker.once('error', reject);
                this.worker.postMessage(data);
            });
        } finally {
            this.busy = false;
        }
    }
    
    terminate() {
        return this.worker.terminate();
    }
}
```

### Best Practice 2: Gestisci Memoria

```javascript
// worker.js con gestione memoria
const { parentPort } = require('worker_threads');

let processedCount = 0;
const MAX_BEFORE_RESTART = 1000;

parentPort.on('message', (data) => {
    const result = processData(data);
    
    processedCount++;
    
    parentPort.postMessage({
        result,
        shouldRestart: processedCount >= MAX_BEFORE_RESTART
    });
    
    if (processedCount >= MAX_BEFORE_RESTART) {
        process.exit(0); // Riavvia worker
    }
});

function processData(data) {
    // Processing...
    return data;
}
```

### Best Practice 3: Timeout e Cancellazione

```javascript
class WorkerWithTimeout {
    constructor(script, timeout = 5000) {
        this.script = script;
        this.timeout = timeout;
    }
    
    async execute(data) {
        const worker = new Worker(this.script);
        
        const result = await Promise.race([
            new Promise((resolve, reject) => {
                worker.on('message', resolve);
                worker.on('error', reject);
                worker.postMessage(data);
            }),
            new Promise((_, reject) => {
                setTimeout(() => {
                    worker.terminate();
                    reject(new Error('Worker timeout'));
                }, this.timeout);
            })
        ]);
        
        await worker.terminate();
        return result;
    }
}

// Uso
const worker = new WorkerWithTimeout('./slow-worker.js', 3000);

try {
    const result = await worker.execute({ data: 'test' });
    console.log('Result:', result);
} catch (err) {
    console.error('Error:', err.message); // "Worker timeout"
}
```

## Debugging Worker Threads

### Logging Dettagliato

```javascript
// main.js
const { Worker } = require('worker_threads');

function createTrackedWorker(script, data) {
    const workerId = Date.now();
    
    console.log(`[${workerId}] Creating worker`);
    
    const worker = new Worker(script, { workerData: data });
    
    worker.on('online', () => {
        console.log(`[${workerId}] Worker online`);
    });
    
    worker.on('message', (msg) => {
        console.log(`[${workerId}] Message:`, msg);
    });
    
    worker.on('error', (err) => {
        console.error(`[${workerId}] Error:`, err.message);
    });
    
    worker.on('exit', (code) => {
        console.log(`[${workerId}] Exited with code ${code}`);
    });
    
    return { worker, workerId };
}

const { worker } = createTrackedWorker('./worker.js', { task: 'test' });
```

### Inspector per Worker

```bash
# Avvia con inspector
node --inspect-brk main.js

# In Chrome DevTools, puoi debuggare anche i worker threads
```

```javascript
// worker.js con breakpoint
const { workerData, parentPort } = require('worker_threads');

debugger; // Breakpoint per inspector

const result = processData(workerData);

parentPort.postMessage(result);
```

## Limitazioni e Considerazioni

### 1. Overhead di Creazione

```javascript
// Worker hanno overhead di creazione (~50-100ms)
// Per task veloci, non conviene

// ❌ MALE per task veloci (<10ms)
for (let i = 0; i < 100; i++) {
    const worker = new Worker('./fast-task.js');
    await worker.terminate();
}

// ✅ BENE: Usa pool per task ripetitivi
const pool = new WorkerPool('./fast-task.js', 4);
for (let i = 0; i < 100; i++) {
    await pool.execute(i);
}
```

### 2. Serializzazione Dati

```javascript
// I dati devono essere serializzabili (structured clone)

// ✅ OK
worker.postMessage({ number: 42, array: [1, 2, 3] });

// ❌ NON OK - Function non serializzabile
worker.postMessage({
    callback: () => console.log('test')
});

// ✅ SOLUZIONE: Usa SharedArrayBuffer o trasferisci
const buffer = new ArrayBuffer(1024);
worker.postMessage(buffer, [buffer]); // Trasferisce ownership
```

### 3. Non per I/O

```javascript
// ❌ MALE: Worker per I/O (inutile!)
const worker = new Worker(`
    const fs = require('fs');
    const { parentPort } = require('worker_threads');
    
    fs.readFile('file.txt', (err, data) => {
        parentPort.postMessage(data);
    });
`, { eval: true });

// ✅ BENE: I/O non blocca, non serve worker
fs.readFile('file.txt', (err, data) => {
    console.log(data);
});

// ✅ USA WORKER per CPU-intensive
const worker = new Worker(`
    const { parentPort, workerData } = require('worker_threads');
    
    // Calcolo pesante
    let result = 0;
    for (let i = 0; i < workerData; i++) {
        result += Math.sqrt(i);
    }
    
    parentPort.postMessage(result);
`, {
    eval: true,
    workerData: 100000000
});
```

## Pattern Avanzati

### Pattern 1: Request-Response con Timeout

```javascript
class WorkerRequestHandler {
    constructor(script) {
        this.worker = new Worker(script);
        this.requestId = 0;
        this.pendingRequests = new Map();
        
        this.worker.on('message', (response) => {
            const { requestId, result, error } = response;
            const pending = this.pendingRequests.get(requestId);
            
            if (pending) {
                clearTimeout(pending.timeoutId);
                
                if (error) {
                    pending.reject(new Error(error));
                } else {
                    pending.resolve(result);
                }
                
                this.pendingRequests.delete(requestId);
            }
        });
        
        this.worker.on('error', (err) => {
            // Rigetta tutte le request pendenti
            for (const [id, pending] of this.pendingRequests) {
                clearTimeout(pending.timeoutId);
                pending.reject(err);
            }
            this.pendingRequests.clear();
        });
    }
    
    request(data, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const requestId = this.requestId++;
            
            const timeoutId = setTimeout(() => {
                this.pendingRequests.delete(requestId);
                reject(new Error('Request timeout'));
            }, timeout);
            
            this.pendingRequests.set(requestId, {
                resolve,
                reject,
                timeoutId
            });
            
            this.worker.postMessage({ requestId, data });
        });
    }
    
    async terminate() {
        // Rigetta request pendenti
        for (const [id, pending] of this.pendingRequests) {
            clearTimeout(pending.timeoutId);
            pending.reject(new Error('Worker terminated'));
        }
        this.pendingRequests.clear();
        
        await this.worker.terminate();
    }
}

// worker.js
const { parentPort } = require('worker_threads');

parentPort.on('message', async ({ requestId, data }) => {
    try {
        const result = await processRequest(data);
        parentPort.postMessage({ requestId, result });
    } catch (err) {
        parentPort.postMessage({ requestId, error: err.message });
    }
});

async function processRequest(data) {
    // Simula processing
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(data * 2);
        }, 1000);
    });
}

// Uso
const handler = new WorkerRequestHandler('./request-worker.js');

try {
    const result1 = await handler.request(5, 2000);
    console.log('Result 1:', result1);
    
    const result2 = await handler.request(10, 500); // Timeout!
} catch (err) {
    console.error('Error:', err.message);
} finally {
    await handler.terminate();
}
```

### Pattern 2: Load Balancer per Worker

```javascript
class WorkerLoadBalancer {
    constructor(workerScript, poolSize = 4) {
        this.workers = [];
        this.workerLoads = new Map();
        
        for (let i = 0; i < poolSize; i++) {
            const worker = new Worker(workerScript);
            this.workers.push(worker);
            this.workerLoads.set(worker, 0);
            
            worker.on('message', () => {
                // Decrementa carico quando task completa
                const currentLoad = this.workerLoads.get(worker);
                this.workerLoads.set(worker, Math.max(0, currentLoad - 1));
            });
        }
    }
    
    getLeastLoadedWorker() {
        let minLoad = Infinity;
        let selectedWorker = null;
        
        for (const [worker, load] of this.workerLoads) {
            if (load < minLoad) {
                minLoad = load;
                selectedWorker = worker;
            }
        }
        
        return selectedWorker;
    }
    
    async execute(data) {
        const worker = this.getLeastLoadedWorker();
        
        // Incrementa carico
        const currentLoad = this.workerLoads.get(worker);
        this.workerLoads.set(worker, currentLoad + 1);
        
        return new Promise((resolve, reject) => {
            worker.once('message', resolve);
            worker.once('error', reject);
            worker.postMessage(data);
        });
    }
    
    getLoadStats() {
        const stats = {};
        let totalLoad = 0;
        
        this.workers.forEach((worker, index) => {
            const load = this.workerLoads.get(worker);
            stats[`worker${index}`] = load;
            totalLoad += load;
        });
        
        stats.total = totalLoad;
        stats.average = (totalLoad / this.workers.length).toFixed(2);
        
        return stats;
    }
    
    async terminate() {
        await Promise.all(this.workers.map(w => w.terminate()));
    }
}

// Uso
const balancer = new WorkerLoadBalancer('./heavy-worker.js', 4);

// Invia molti task
const tasks = [];
for (let i = 0; i < 20; i++) {
    tasks.push(
        balancer.execute({ task: i })
            .then(result => {
                console.log(`Task ${i} completato`);
                console.log('Load:', balancer.getLoadStats());
            })
    );
}

await Promise.all(tasks);
await balancer.terminate();
```

### Pattern 3: Worker con Stato Persistente

```javascript
// stateful-worker.js
const { parentPort } = require('worker_threads');

// Stato persistente del worker
let state = {
    counter: 0,
    history: [],
    cache: new Map()
};

parentPort.on('message', ({ command, data }) => {
    let response;
    
    switch (command) {
        case 'increment':
            state.counter++;
            response = { counter: state.counter };
            break;
            
        case 'getState':
            response = {
                counter: state.counter,
                historySize: state.history.length,
                cacheSize: state.cache.size
            };
            break;
            
        case 'addToHistory':
            state.history.push(data);
            response = { historySize: state.history.length };
            break;
            
        case 'cache':
            state.cache.set(data.key, data.value);
            response = { cached: true };
            break;
            
        case 'getCached':
            response = { value: state.cache.get(data.key) };
            break;
            
        case 'reset':
            state = { counter: 0, history: [], cache: new Map() };
            response = { reset: true };
            break;
            
        default:
            response = { error: 'Unknown command' };
    }
    
    parentPort.postMessage(response);
});

// main.js
const { Worker } = require('worker_threads');

class StatefulWorker {
    constructor() {
        this.worker = new Worker('./stateful-worker.js');
    }
    
    send(command, data = null) {
        return new Promise((resolve) => {
            this.worker.once('message', resolve);
            this.worker.postMessage({ command, data });
        });
    }
    
    async increment() {
        return this.send('increment');
    }
    
    async getState() {
        return this.send('getState');
    }
    
    async addToHistory(item) {
        return this.send('addToHistory', item);
    }
    
    async cache(key, value) {
        return this.send('cache', { key, value });
    }
    
    async getCached(key) {
        return this.send('getCached', { key });
    }
    
    async reset() {
        return this.send('reset');
    }
    
    terminate() {
        return this.worker.terminate();
    }
}

// Uso
async function testStatefulWorker() {
    const worker = new StatefulWorker();
    
    await worker.increment();
    await worker.increment();
    console.log('State:', await worker.getState());
    
    await worker.addToHistory('event1');
    await worker.addToHistory('event2');
    console.log('State:', await worker.getState());
    
    await worker.cache('key1', 'value1');
    console.log('Cached:', await worker.getCached('key1'));
    
    await worker.reset();
    console.log('After reset:', await worker.getState());
    
    await worker.terminate();
}

testStatefulWorker();

/* Output:
State: { counter: 2, historySize: 0, cacheSize: 0 }
State: { counter: 2, historySize: 2, cacheSize: 0 }
Cached: { value: 'value1' }
After reset: { counter: 0, historySize: 0, cacheSize: 0 }
*/
```

### Pattern 4: Stream Processing con Worker

```javascript
const { Worker } = require('worker_threads');
const { Readable, Transform } = require('stream');

class WorkerTransform extends Transform {
    constructor(workerScript, options = {}) {
        super({ objectMode: true, ...options });
        this.worker = new Worker(workerScript);
        this.pending = [];
        
        this.worker.on('message', (result) => {
            const callback = this.pending.shift();
            if (callback) {
                callback(null, result);
            }
        });
        
        this.worker.on('error', (err) => {
            this.destroy(err);
        });
    }
    
    _transform(chunk, encoding, callback) {
        this.pending.push(callback);
        this.worker.postMessage(chunk);
    }
    
    _final(callback) {
        this.worker.terminate().then(() => callback());
    }
}

// stream-worker.js
const { parentPort } = require('worker_threads');

parentPort.on('message', (data) => {
    // Processa data (CPU-intensive)
    const processed = heavyProcessing(data);
    parentPort.postMessage(processed);
});

function heavyProcessing(data) {
    // Simula processing pesante
    let result = data;
    for (let i = 0; i < 1000000; i++) {
        result = Math.sqrt(result + i);
    }
    return result;
}

// Uso
const source = Readable.from([1, 2, 3, 4, 5]);
const transform = new WorkerTransform('./stream-worker.js');

source
    .pipe(transform)
    .on('data', (data) => {
        console.log('Processed:', data);
    })
    .on('end', () => {
        console.log('Stream finished');
    });
```

### Pattern 5: Worker Supervisor con Auto-Restart

```javascript
class WorkerSupervisor {
    constructor(workerScript, options = {}) {
        this.workerScript = workerScript;
        this.maxRestarts = options.maxRestarts || 3;
        this.restartDelay = options.restartDelay || 1000;
        this.restartCount = 0;
        this.worker = null;
        this.messageHandlers = [];
        
        this.start();
    }
    
    start() {
        this.worker = new Worker(this.workerScript);
        
        this.worker.on('message', (msg) => {
            this.messageHandlers.forEach(handler => handler(msg));
        });
        
        this.worker.on('error', (err) => {
            console.error('Worker error:', err);
            this.restart('error');
        });
        
        this.worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker exited with code ${code}`);
                this.restart('exit');
            }
        });
    }
    
    restart(reason) {
        console.log(`Restarting worker (reason: ${reason}, attempt ${this.restartCount + 1}/${this.maxRestarts})`);
        
        if (this.restartCount >= this.maxRestarts) {
            console.error('Max restart attempts reached');
            return;
        }
        
        this.restartCount++;
        
        setTimeout(() => {
            this.start();
        }, this.restartDelay);
    }
    
    onMessage(handler) {
        this.messageHandlers.push(handler);
    }
    
    postMessage(data) {
        if (this.worker) {
            this.worker.postMessage(data);
        }
    }
    
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
        }
    }
}

// Uso
const supervisor = new WorkerSupervisor('./unreliable-worker.js', {
    maxRestarts: 5,
    restartDelay: 2000
});

supervisor.onMessage((msg) => {
    console.log('Message from worker:', msg);
});

supervisor.postMessage({ task: 'test' });

// Worker crasherà e verrà riavviato automaticamente
```

## Confronto Worker Threads vs Alternatives

### Worker Threads vs Child Process

```javascript
// Worker Threads
const { Worker } = require('worker_threads');

const worker = new Worker('./worker.js');
worker.postMessage({ data: 'test' });

// ✅ Pro:
// - Condividono memoria (SharedArrayBuffer)
// - Startup veloce (~50-100ms)
// - Overhead basso
// - Stesso processo

// ❌ Contro:
// - Solo JavaScript
// - Crash worker = possibile crash app
// - Limiti memoria condivisi

// Child Process
const { fork } = require('child_process');

const child = fork('./child.js');
child.send({ data: 'test' });

// ✅ Pro:
// - Processo isolato (più sicuro)
// - Può eseguire qualsiasi programma
// - Crash isolato
// - Memoria separata

// ❌ Contro:
// - Startup lento (~200-500ms)
// - Overhead alto
// - No memoria condivisa
// - IPC più lento
```

### Tabella Comparativa

| Caratteristica | Worker Threads | Child Process | Cluster |
|----------------|----------------|---------------|---------|
| **Startup time** | ~50-100ms | ~200-500ms | ~500ms+ |
| **Memory** | Condivisa | Isolata | Isolata |
| **Overhead** | Basso | Alto | Molto alto |
| **Isolamento** | Medio | Alto | Alto |
| **Use case** | CPU-intensive | Programmi esterni | Load balancing |
| **SharedArrayBuffer** | ✅ Sì | ❌ No | ❌ No |
| **Same process** | ✅ Sì | ❌ No | ❌ No |

### Quando Usare Cosa?

```javascript
// ✅ USA WORKER THREADS per:
// - Calcoli CPU-intensive in JavaScript
// - Image/video processing
// - Data transformation
// - Parsing pesante
// - Crypto operations

// ✅ USA CHILD PROCESS per:
// - Eseguire programmi esterni
// - Isolamento critico
// - Operazioni che potrebbero crashare

// ✅ USA CLUSTER per:
// - Load balancing HTTP
// - Sfruttare tutti i core per I/O
// - Scalare server web
```

## Esercizi Pratici

### Esercizio 1: Implementare Worker Pool Dinamico

Creare un worker pool che si adatta al carico:

```javascript
class DynamicWorkerPool {
    constructor(script, minWorkers = 2, maxWorkers = 8) {
        this.script = script;
        this.minWorkers = minWorkers;
        this.maxWorkers = maxWorkers;
        // TODO: Implementare
        // - Aumenta worker quando coda è piena
        // - Diminuisce worker quando inattivi
        // - Monitora carico
    }
    
    async execute(data) {
        // TODO: Implementare
    }
    
    adjustPoolSize() {
        // TODO: Implementare
    }
}
```

### Esercizio 2: Worker con Circuit Breaker

Implementare circuit breaker per worker che falliscono:

```javascript
class ResilientWorker {
    constructor(script, options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 30000;
        // TODO: Implementare
        // - Traccia fallimenti
        // - Apri circuit dopo N fallimenti
        // - Riprova dopo timeout
    }
    
    async execute(data) {
        // TODO: Implementare
    }
}
```

### Esercizio 3: Worker Progress Reporter

Creare worker che riporta progresso durante elaborazione lunga:

```javascript
class ProgressWorker {
    constructor(script) {
        // TODO: Implementare
        // - Worker invia aggiornamenti progresso
        // - Main thread riceve percentuale completamento
        // - Stima tempo rimanente
    }
    
    async executeWithProgress(data, onProgress) {
        // TODO: Implementare
    }
}
```

### Esercizio 4: Worker Pipeline

Implementare pipeline di worker dove output di uno è input del successivo:

```javascript
class WorkerPipeline {
    constructor(stages) {
        // stages = [script1, script2, script3]
        // TODO: Implementare
        // - Passa dati attraverso worker in sequenza
        // - Gestisci errori in qualsiasi stage
        // - Supporta backpressure
    }
    
    async process(data) {
        // TODO: Implementare
    }
}
```

### Esercizio 5: Worker Cache Layer

Creare layer di caching intelligente per worker:

```javascript
class CachedWorker {
    constructor(script, cacheOptions = {}) {
        this.ttl = cacheOptions.ttl || 60000;
        this.maxSize = cacheOptions.maxSize || 100;
        // TODO: Implementare
        // - Cacha risultati basandosi su input
        // - TTL per invalidazione
        // - LRU eviction quando pieno
    }
    
    async execute(data) {
        // TODO: Implementare
    }
}
```

## Domande di Autovalutazione

### Domanda 1
Qual è la differenza principale tra Worker Threads e Child Process?

A) Non c'è differenza  
B) Worker Threads condividono processo, Child Process no  
C) Child Process sono più veloci  
D) Worker Threads non possono eseguire JavaScript

### Domanda 2
Worker Threads possono bloccare il main thread?

A) Sì, sempre  
B) No, mai  
C) Solo se usano SharedArrayBuffer  
D) Solo se il main thread aspetta attivamente

### Domanda 3
Quale è il modo corretto per passare dati a un worker?

A) worker.send(data)  
B) worker.postMessage(data)  
C) worker.message(data)  
D) worker.emit('message', data)

### Domanda 4
SharedArrayBuffer permette di:

A) Condividere codice tra worker  
B) Condividere memoria tra thread  
C) Sincronizzare Event Loop  
D) Nulla, è deprecato

### Domanda 5
Quando conviene usare Worker Threads?

A) Per tutte le operazioni asincrone  
B) Solo per operazioni I/O  
C) Per operazioni CPU-intensive  
D) Mai, usare sempre child_process

### Domanda 6
Qual è l'overhead tipico di creazione di un worker?

A) <1ms  
B) ~50-100ms  
C) ~500ms  
D) >1 secondo

### Domanda 7
Worker Threads condividono:

A) Heap memory  
B) Event Loop  
C) V8 instance (opzionale)  
D) Nulla

### Domanda 8
Come si termina un worker gracefully?

A) worker.kill()  
B) worker.terminate()  
C) worker.exit()  
D) worker.close()

### Domanda 9
I worker possono creare altri worker (nested)?

A) No, mai  
B) Sì, senza limiti  
C) Solo un livello  
D) Sì, ma sconsigliato per overhead

### Domanda 10
Quale pattern è migliore per task ripetitivi?

A) Creare worker ogni volta  
B) Worker pool con riutilizzo  
C) Child process pool  
D) Cluster module

---

## Risposte alle Domande

**Domanda 1: B** - Worker Threads condividono lo stesso processo Node.js (ma con heap separati), mentre Child Process creano processi completamente separati. Questo rende Worker Threads più leggeri ma meno isolati.

**Domanda 2: D** - I Worker Threads girano in parallelo e NON bloccano il main thread, a meno che il main thread non li aspetti attivamente (con `Atomics.wait()` o bloccando aspettando messaggi sincronamente).

**Domanda 3: B** - Il metodo corretto è `worker.postMessage(data)`, che serializza i dati (structured clone algorithm) e li invia al worker.

**Domanda 4: B** - SharedArrayBuffer permette di condividere memoria tra thread, permettendo comunicazione ad alte prestazioni senza serializzazione.

**Domanda 5: C** - Worker Threads sono ideali per operazioni **CPU-intensive** (calcoli, parsing, elaborazione immagini). Per I/O, l'Event Loop è già ottimizzato e non servono worker.

**Domanda 6: B** - L'overhead di creazione di un worker è tipicamente **~50-100ms**, molto più veloce di un Child Process (~200-500ms) ma comunque significativo per task molto brevi.

**Domanda 7: C** - Worker Threads possono opzionalmente condividere la V8 instance (con `resourceLimits`), riducendo overhead ma limitando isolamento. Hanno heap e Event Loop separati.

**Domanda 8: B** - `worker.terminate()` termina il worker. Ritorna una Promise che si risolve quando il worker è completamente terminato.

**Domanda 9: D** - Sì, i worker possono creare altri worker (nested), ma è **sconsigliato** per l'overhead moltiplicativo e la complessità di gestione.

**Domanda 10: B** - Per task ripetitivi, un **Worker Pool** con riutilizzo è la scelta migliore: evita l'overhead di creazione ripetuta e mantiene worker caldi e pronti.

---

## Conclusioni

**Worker Threads** sono uno strumento potente per sfruttare il multi-core in Node.js, permettendo vera parallelizzazione di task CPU-intensive.

### 🎯 Punti Chiave

✅ **Parallelismo reale** - Sfrutta multi-core per CPU-intensive  
✅ **Processo condiviso** - Overhead basso vs Child Process  
✅ **SharedArrayBuffer** - Comunicazione ad alte prestazioni  
✅ **Event Loop separato** - Ogni worker ha il suo Event Loop  
✅ **Isolamento heap** - Memory safety tra worker  

### ⚠️ Quando NON Usare

❌ Operazioni I/O (già ottimizzate dall'Event Loop)  
❌ Task molto brevi (<10ms)  
❌ Quando serve isolamento completo (usa Child Process)  
❌ Per load balancing HTTP (usa Cluster)  

### 🚀 Best Practices Finali

✅ Usa Worker Pool per task ripetitivi  
✅ Riutilizza worker invece di ricrearli  
✅ Gestisci timeout e errori  
✅ Monitora memoria e performance  
✅ Considera overhead di creazione  
✅ Usa SharedArrayBuffer per performance  
✅ Implementa graceful shutdown  

---

**Versione documento**: 1.0  
**Ultimo aggiornamento**: Ottobre 2025  
**Compatibilità**: Node.js 12.x+  
**Livello**: Intermedio/Avanzato

---

*"Worker Threads unlock true parallelism in Node.js - use them wisely for CPU-bound tasks."*