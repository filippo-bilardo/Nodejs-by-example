# Event Loop in Node.js

## 🎯 Obiettivi di Apprendimento

Al termine di questa guida, sarai in grado di:
- Comprendere il funzionamento dell'Event Loop di Node.js
- Identificare le diverse fasi del ciclo di eventi
- Ottimizzare il codice asincrono per evitare blocchi
- Utilizzare correttamente le API asincrone
- Distinguere tra microtask e macrotask

## 🔍 Cos'è l'Event Loop?

L'Event Loop è il meccanismo fondamentale che permette a Node.js di eseguire operazioni di I/O non bloccanti nonostante JavaScript sia single-threaded. È il cuore pulsante dell'architettura di Node.js, responsabile della gestione e dell'esecuzione del codice asincrono.

### Analogia del Ristorante

Immagina l'Event Loop come un cameriere in un ristorante:

```
🏪 RISTORANTE NODE.JS
┌─────────────────────────────────────────┐
│  👨‍🍳 Cucina (Thread Pool)                  ← Operazioni I/O pesanti
├─────────────────────────────────────────┤
│  🚶 Cameriere (Event Loop)                ← Thread principale
│    - Prende ordini (riceve richieste)
│    - Porta ordini in cucina (delega I/O)
│    - Serve piatti pronti (esegue callback)
│    - NON cucina (non blocca)
├─────────────────────────────────────────┤
│  🪑 Tavoli (Code di callback)        
│    - Tavolo 1: Timers
│    - Tavolo 2: I/O callbacks
│    - Tavolo 3: Immediate
└─────────────────────────────────────────┘
```

Il cameriere (Event Loop) non si ferma mai a cucinare (operazioni bloccanti), ma continua a girare tra i tavoli servendo i clienti.

## Funzionamento dell'Event Loop

L'Event Loop opera attraverso una sequenza di fasi (o "fasi") che vengono eseguite in un ciclo continuo:

### 📊 Diagramma dell'Event Loop

```
   ┌───────────────────────────┐
┌─>│           timers          │ ← setTimeout(), setInterval()
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │     pending callbacks     │ ← I/O callbacks differiti
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
│  │       idle, prepare       │ ← Uso interno
│  └─────────────┬─────────────┘                ┌───────────────┐
│  ┌─────────────▼─────────────┐                │   incoming:   │
│  │           poll            │◄─ I/O events ◄─┤  connections, │
│  └─────────────┬─────────────┘                │   data, etc.  │
│  ┌─────────────▼─────────────┐                └───────────────┘
│  │           check           │ ← setImmediate()
│  └─────────────┬─────────────┘
│  ┌─────────────▼─────────────┐
└──┤      close callbacks      │ ← Chiusure improvvise ← socket.on('close', ...)
   └───────────────────────────┘
```

### 1. Fasi dell'Event Loop

#### 🕐 **Timers Phase**
```javascript
// Esegue callback programmati da setTimeout() e setInterval()
setTimeout(() => {
    console.log('Timer eseguito!');
}, 1000);
```
- Esegue i callback il cui tempo di attesa minimo è scaduto
- **NON garantisce** esecuzione esatta al tempo specificato
- Esempio: `setTimeout(fn, 100)` esegue fn dopo *almeno* 100ms

Esempio con setInterval:
```javascript
setInterval(() => {
    console.log('Timer ripetuto!');
}, 1000);
```

- Esegue i callback ripetuti ogni secondo
- Se il callback impiega più di 1 secondo, le chiamate successive si accumulano
- Usare con cautela per evitare sovraccarichi
- Per cancellare: `clearInterval(intervalId)`, dove `intervalId` è l'ID restituito da `setInterval()`

#### 📋 **Pending Callbacks Phase**
```javascript
// Callback I/O differiti (es: errori TCP)
```
- Esegue callback di alcune operazioni di sistema
- Raramente utilizzata dal codice utente

#### 🔄 **Idle, Prepare Phase**
- Uso esclusivamente interno di Node.js
- L'utente non interagisce direttamente

#### 📨 **Poll Phase** (La più importante!)
```javascript
// Fase che recupera nuovi eventi I/O
const fs = require('fs');

fs.readFile('file.txt', (err, data) => {
    console.log('File letto!'); // ← Eseguito qui
});
```

La fase Poll ha due funzioni principali:
1. **Calcolare quanto tempo bloccarsi** in attesa di I/O
2. **Processare eventi** nella poll queue

**Comportamento:**
- Se la poll queue **non è vuota**: esegue callback in modo sincrono fino a esaurimento o limite sistema
- Se la poll queue **è vuota**:
  - Se ci sono `setImmediate()` programmati → va alla fase **check**
  - Altrimenti, attende nuovi eventi

#### ✅ **Check Phase**
```javascript
// Esegue callback di setImmediate()
setImmediate(() => {
    console.log('Immediate eseguito!');
});
```
- Eseguito subito dopo la fase poll
- `setImmediate()` è progettato per eseguire script dopo il completamento della fase poll

#### 🔚 **Close Callbacks Phase**
```javascript
// Chiusura di socket e handle
socket.on('close', () => {
    console.log('Socket chiuso!');
});
```
- Esegue callback di chiusura
- Es: `socket.destroy()` triggera eventi qui

### 2. Ciclo di Vita di un'Operazione

```
┌─────────────────────────────────────────────────┐
│ 1. CODICE SINCRONO                              │
│    console.log('Inizio');                       │
│      ↓                                          │
│ 2. OPERAZIONE ASINCRONA DELEGATA                │
│    fs.readFile('file.txt', callback);           │
│      ↓                                          │
│ 3. EVENT LOOP CONTINUA                          │
│    (esegue altro codice, non blocca)            │
│      ↓                                          │
│ 4. OPERAZIONE COMPLETATA → CALLBACK IN CODA     │
│    (callback inserito nella poll queue)         │
│      ↓                                          │
│ 5. EVENT LOOP ESEGUE CALLBACK                   │
│    (quando arriva alla fase appropriata)        │
└─────────────────────────────────────────────────┘
```

### 💡 Esempio Pratico Completo

```javascript
console.log('1. Inizio');

setTimeout(() => {
    console.log('4. Timer 0ms');
}, 0);

setImmediate(() => {
    console.log('5. Immediate');
});

process.nextTick(() => {
    console.log('2. Next Tick');
});

Promise.resolve().then(() => {
    console.log('3. Promise');
});

console.log('1. Fine');

// Output:
// 1. Inizio
// 1. Fine
// 2. Next Tick
// 3. Promise
// 4. Timer 0ms (o 5. Immediate, può variare)
// 5. Immediate (o 4. Timer 0ms, può variare)
```

**Spiegazione:**
1. Codice sincrono eseguito per primo
2. `process.nextTick()` ha massima priorità (microtask)
3. Promise callbacks (microtask queue)
4. Timer vs Immediate dipende dal contesto (vedi sezione priorità)

## Thread Pool (libuv)

Per operazioni di I/O bloccanti che non possono essere gestite direttamente dal sistema operativo in modo asincrono, Node.js utilizza un thread pool fornito da libuv:

### 🔧 Architettura Thread Pool

```
┌──────────────────────────────────┐
│     EVENT LOOP (Main Thread)     │
│             ↓ delega             │
├──────────────────────────────────┤
│         LIBUV THREAD POOL        │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐    │
│   │ T1 │ │ T2 │ │ T3 │ │ T4 │    │
│   └────┘ └────┘ └────┘ └────┘    │
│     ↓      ↓      ↓      ↓       │
└──────────────────────────────────┘
         callback queue ↑
```

### 📁 Operazioni che Usano il Thread Pool

```javascript
// 1. File System Operations
const fs = require('fs');
fs.readFile('file.txt', callback);  // → Thread Pool
fs.writeFile('out.txt', data, cb);  // → Thread Pool

// 2. DNS Lookups
const dns = require('dns');
dns.lookup('google.com', callback); // → Thread Pool

// 3. Crypto Operations
const crypto = require('crypto');
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', callback); // → Thread Pool

// 4. Zlib (Compression)
const zlib = require('zlib');
zlib.gzip(buffer, callback);        // → Thread Pool
```

### ⚙️ Configurazione Thread Pool

```javascript
// Imposta dimensione thread pool PRIMA di richiedere moduli
process.env.UV_THREADPOOL_SIZE = 8; // Default: 4

// IMPORTANTE: Deve essere fatto all'inizio del programma!
```

**Raccomandazioni:**
- **Default (4 thread)**: Adatto per la maggior parte delle applicazioni
- **CPU-intensive**: Aumentare a `CPU_CORES` o `CPU_CORES * 2`
- **I/O-intensive**: Aumentare fino a 128 thread (limite libuv)
- **Monitoring**: Osservare latenza per trovare il valore ottimale

### 🔍 Esempio Impatto Thread Pool

```javascript
const crypto = require('crypto');

// Con 4 thread (default), 8 operazioni si distribuiscono:
// T1: Op1, Op5
// T2: Op2, Op6
// T3: Op3, Op7
// T4: Op4, Op8

const start = Date.now();
const iterations = 8;
let completed = 0;

for (let i = 0; i < iterations; i++) {
    crypto.pbkdf2('secret', 'salt', 100000, 64, 'sha512', () => {
        completed++;
        console.log(`${i}: ${Date.now() - start}ms`);
        
        if (completed === iterations) {
            console.log(`Totale: ${Date.now() - start}ms`);
        }
    });
}

// Output con UV_THREADPOOL_SIZE=4:
// 0: 1020ms
// 1: 1025ms
// 2: 1028ms
// 3: 1030ms
// 4: 2050ms  ← Seconda ondata
// 5: 2055ms
// 6: 2058ms
// 7: 2060ms
```

## Microtask Queue (Priorità Massima)

Oltre alle code standard dell'Event Loop, Node.js gestisce anche una "microtask queue" con **priorità assoluta**:

### 🚀 Cosa Sono le Microtask?

```
┌─────────────────────────────────────┐
│   MICROTASK QUEUE (Priority)        │
│   ┌─────────────────────────────┐   │
│   │ 1. process.nextTick()       │ ◄─── Massima priorità
│   │ 2. Promise callbacks        │ ◄─── Microtask ES6
│   └─────────────────────────────┘   │
├─────────────────────────────────────┤
│   EVENT LOOP PHASES                 │
│   (timers, poll, check, etc.)       │
└─────────────────────────────────────┘
```

### 📝 Tipi di Microtask

#### 1. `process.nextTick()` - Priorità 1
```javascript
console.log('1. Start');

process.nextTick(() => {
    console.log('3. NextTick');
});

console.log('2. End');

// Output:
// 1. Start
// 2. End
// 3. NextTick ← Eseguito PRIMA di qualsiasi altra fase
```

#### 2. Promise Callbacks - Priorità 2
```javascript
console.log('1. Start');

Promise.resolve().then(() => {
    console.log('3. Promise');
});

console.log('2. End');

// Output:
// 1. Start
// 2. End
// 3. Promise ← Eseguito dopo nextTick ma prima di timer
```

### 🔄 Comportamento Microtask Queue

```javascript
// La microtask queue viene svuotata DOPO ogni fase
console.log('1. Sync start');

setTimeout(() => {
    console.log('6. Timer');
    
    process.nextTick(() => {
        console.log('7. NextTick in timer');
    });
}, 0);

setImmediate(() => {
    console.log('8. Immediate');
});

process.nextTick(() => {
    console.log('2. NextTick 1');
    
    process.nextTick(() => {
        console.log('3. Nested NextTick');
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

console.log('1. Sync end');

// Output garantito:
// 1. Sync start
// 1. Sync end
// 2. NextTick 1
// 3. Nested NextTick
// 4. Promise 1
// 5. Promise 2
// 6. Timer (o 8. Immediate)
// 7. NextTick in timer
// 8. Immediate (o 6. Timer)
```

### ⚠️ Pericoli delle Microtask

```javascript
// ❌ ATTENZIONE: Può bloccare l'Event Loop!
function recursiveNextTick() {
    process.nextTick(recursiveNextTick);
}

recursiveNextTick();
// ↑ Crea un loop infinito che blocca l'Event Loop
// Le altre fasi non verranno MAI raggiunte!

// ✅ Alternativa migliore:
function recursiveImmediate() {
    setImmediate(recursiveImmediate);
}

recursiveImmediate();
// ↑ Permette all'Event Loop di processare altre fasi
```

### 🎯 Quando Usare process.nextTick()

**✅ Usa process.nextTick() per:**
```javascript
// 1. Emettere eventi dopo il costruttore
class MyEmitter extends EventEmitter {
    constructor() {
        super();
        
        // Assicura che i listener siano registrati prima dell'emissione
        process.nextTick(() => {
            this.emit('ready');
        });
    }
}

// 2. Garantire ordine asincrono
function doAsync(callback) {
    if (cacheHit) {
        // Mantiene consistenza asincrona anche con cache
        process.nextTick(() => callback(cachedData));
    } else {
        fetchData(callback);
    }
}
```

**❌ NON usare process.nextTick() per:**
- Operazioni che possono essere eseguite con `setImmediate()`
- Callback ricorsivi (usa `setImmediate()` invece)
- Operazioni CPU-intensive (delega a Worker Threads)

## Priorità di Esecuzione Completa

### 📊 Tabella Priorità

```
PRIORITÀ ALTA ↑
┌─────────────────────────────────────┐
│ 1️⃣ Codice Sincrono                    ← Eseguito immediatamente
├─────────────────────────────────────┤
│ 2️⃣ process.nextTick() callbacks       ← Massima priorità asincrona
├─────────────────────────────────────┤
│ 3️⃣ Promise callbacks (microtasks)     ← Microtask queue
├─────────────────────────────────────┤
│ 4️⃣ Timer callbacks                    ← setTimeout/setInterval
│    (setTimeout, setInterval)         
├─────────────────────────────────────┤
│ 5️⃣ I/O callbacks                      ← fs, network, etc.
├─────────────────────────────────────┤
│ 6️⃣ setImmediate() callbacks           ← Check phase
├─────────────────────────────────────┤
│ 7️⃣ Close callbacks                    ← socket.on('close')
└─────────────────────────────────────┘
PRIORITÀ BASSA ↓
```

### 🧪 Test Completo di Priorità

```javascript
console.log('1. 🟢 Sync start');

setTimeout(() => {
    console.log('5. ⏱️  Timer 0ms');
}, 0);

setImmediate(() => {
    console.log('6. ⚡ Immediate');
});

process.nextTick(() => {
    console.log('2. 🚀 NextTick 1');
    
    process.nextTick(() => {
        console.log('3. 🚀 NextTick 2 (nested)');
    });
});

Promise.resolve()
    .then(() => {
        console.log('4. 💎 Promise');
    });

console.log('1. 🟢 Sync end');

// Output GARANTITO:
// 1. 🟢 Sync start
// 1. 🟢 Sync end
// 2. 🚀 NextTick 1
// 3. 🚀 NextTick 2 (nested)
// 4. 💎 Promise
// 5. ⏱️  Timer 0ms      ← Ordine può variare
// 6. ⚡ Immediate       ← con Immediate
```

### 🤔 setTimeout vs setImmediate: Chi Vince?

```javascript
// CASO 1: Fuori da un ciclo I/O → ORDINE NON GARANTITO
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

// Output può essere:
// timeout → immediate
// oppure
// immediate → timeout

// CASO 2: Dentro un ciclo I/O → SEMPRE immediate prima
const fs = require('fs');

fs.readFile(__filename, () => {
    setTimeout(() => console.log('timeout'), 0);
    setImmediate(() => console.log('immediate'));
});

// Output SEMPRE:
// immediate ← Eseguito prima perché siamo nella poll phase
// timeout
```

**Spiegazione:**
- Nel **CASO 1**, dipende dal tempo di preparazione dell'Event Loop
- Nel **CASO 2**, essendo nella fase poll, `setImmediate()` viene eseguito nella fase check successiva, prima che l'Event Loop ritorni alla fase timers

### 💡 Best Practice per la Priorità

```javascript
// ✅ USO CORRETTO delle priorità

// 1. Codice critico che deve eseguire subito dopo il codice corrente
function criticalCallback() {
    process.nextTick(() => {
        // Esegue prima di qualsiasi I/O
        console.log('Callback critico');
    });
}

// 2. Dare precedenza ai callback I/O (non bloccare)
function afterIoCallback() {
    setImmediate(() => {
        // Permette elaborazione di altri eventi I/O
        console.log('Dopo I/O');
    });
}

// 3. Operazioni programmate nel tempo
function scheduledTask() {
    setTimeout(() => {
        console.log('Dopo almeno 1 secondo');
    }, 1000);
}

// 4. Promise per operazioni asincrone moderne
async function modernAsync() {
    const result = await fetchData();
    // Continua dopo il fulfillment della promise
}
```

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

## Differenze con il Browser

L'Event Loop di Node.js differisce da quello dei browser in alcuni aspetti chiave:

- Implementazione basata su libuv anziché sul browser
- Fasi più specifiche e granulari
- API aggiuntive come `process.nextTick()` e `setImmediate()`
- Gestione diversa delle microtask queue

## Evoluzione dell'Event Loop

Nel corso delle versioni di Node.js, l'Event Loop ha subito miglioramenti significativi:

- Ottimizzazioni delle prestazioni
- Miglior gestione delle priorità
- Integrazione più stretta con le Promise
- Supporto migliorato per async/await

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

## 📚 Risorse Aggiuntive

### 📖 Documentazione
- [Node.js Event Loop Official Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [libuv Design Overview](http://docs.libuv.org/en/v1.x/design.html)
- [V8 JavaScript Engine](https://v8.dev/)

### 🎥 Video Consigliati
- [What the heck is the event loop anyway? - Philip Roberts](https://www.youtube.com/watch?v=8aGhZQkoFbQ)
- [Event Loop Best Practices - Node.js](https://www.youtube.com/watch?v=PNa9OMajw9w)

### 📝 Articoli
- [Understanding the Node.js Event Loop](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)
- [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

### 🛠️ Tools Utili
- [Clinic.js](https://clinicjs.org/) - Performance profiling
- [0x](https://github.com/davidmarkclements/0x) - Flamegraph profiler
- [autocannon](https://github.com/mcollina/autocannon) - HTTP benchmarking

## 🎯 Riepilogo Chiave

### ✅ Concetti Fondamentali
1. **Event Loop** - Ciclo continuo che gestisce esecuzione asincrona
2. **6 Fasi** - timers → pending → idle/prepare → poll → check → close
3. **Microtask Queue** - Priorità assoluta (nextTick → Promise)
4. **Thread Pool** - libuv gestisce I/O bloccanti (fs, crypto, dns, zlib)
5. **Worker Threads** - Parallelismo vero per CPU-intensive tasks
6. **Cluster** - Scalabilità multicore per server HTTP

### 🚀 Best Practices
- ✅ Usa sempre API asincrone
- ✅ Suddividi operazioni pesanti con `setImmediate()`
- ✅ Monitora lag dell'Event Loop
- ✅ Delega CPU-intensive a Worker Threads
- ✅ Preferisci async/await a callback
- ✅ Usa stream per dati grandi
- ❌ Evita `fs.readFileSync()` in produzione
- ❌ Non bloccare con loop sincroni infiniti
- ❌ Non usare `process.nextTick()` ricorsivamente

### 📊 Ordine di Priorità
```
1. Codice sincrono
2. process.nextTick()
3. Promise microtasks
4. setTimeout/setInterval
5. I/O callbacks
6. setImmediate()
7. close callbacks
```

