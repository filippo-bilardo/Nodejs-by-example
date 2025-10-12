# setImmediate() in Node.js

## Cos'è setImmediate()?

`setImmediate()` è una funzione di Node.js che pianifica l'esecuzione di un callback nella **fase check** dell'Event Loop, subito dopo la fase poll. È specificamente progettata per eseguire codice "il prima possibile" dopo il completamento delle operazioni I/O correnti.

```javascript
setImmediate(() => {
    console.log('Eseguito nella fase check dell\'Event Loop');
});

console.log('Codice sincrono');

// Output:
// Codice sincrono
// Eseguito nella fase check dell'Event Loop
```

### Firma della Funzione

```javascript
setImmediate(callback[, ...args])
```

**Parametri:**
- `callback`: Funzione da eseguire
- `...args`: Argomenti opzionali da passare al callback

**Ritorna:** Un oggetto `Immediate` che può essere usato con `clearImmediate()`

## Posizione nell'Event Loop

`setImmediate()` viene eseguito nella **fase check**, che si trova immediatamente dopo la fase poll:

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ ← Dopo questa fase...
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │          check            │ ← ...viene eseguito setImmediate()
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

## setImmediate() vs setTimeout()

Questa è una delle distinzioni più importanti da comprendere in Node.js.

### Comportamento nel Main Module

```javascript
// Nel main module (fuori da I/O callbacks)
console.log('Start');

setTimeout(() => {
    console.log('setTimeout');
}, 0);

setImmediate(() => {
    console.log('setImmediate');
});

console.log('End');

/* Output NON GARANTITO:
Può essere:
Start
End
setTimeout
setImmediate

OPPURE:
Start
End
setImmediate
setTimeout
*/
```

**Perché l'ordine non è garantito?**
- Il sistema impiega tempo per inizializzare l'Event Loop
- `setTimeout(fn, 0)` in realtà diventa `setTimeout(fn, 1)` (minimo 1ms)
- Se l'Event Loop impiega più di 1ms ad inizializzare, setTimeout viene eseguito per primo
- Altrimenti, setImmediate viene eseguito per primo

### Comportamento dentro I/O Callbacks

```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
    console.log('I/O callback');
    
    setTimeout(() => {
        console.log('setTimeout');
    }, 0);
    
    setImmediate(() => {
        console.log('setImmediate');
    });
});

/* Output GARANTITO:
I/O callback
setImmediate
setTimeout
*/
```

**Perché qui l'ordine è garantito?**
- Siamo nella fase poll (I/O callback)
- La fase check (setImmediate) viene IMMEDIATAMENTE dopo poll
- La fase timers viene nel prossimo ciclo dell'Event Loop
- Quindi setImmediate viene SEMPRE eseguito prima di setTimeout

### Tabella Comparativa

| Caratteristica | setTimeout(fn, 0) | setImmediate(fn) |
|----------------|-------------------|------------------|
| **Fase Event Loop** | timers | check |
| **Esecuzione minima** | 1ms | Dopo I/O poll |
| **Ordine nel main** | Non garantito | Non garantito |
| **Ordine in I/O** | Dopo setImmediate | Prima di setTimeout |
| **Use case ideale** | Ritardare esecuzione | Dopo operazioni I/O |
| **Disponibilità** | Browser e Node.js | Solo Node.js |

### Confronto Visivo

```javascript
// Esempio che mostra la differenza

console.log('1. Inizio');

// setTimeout - fase timers (prossimo ciclo)
setTimeout(() => console.log('4. setTimeout'), 0);

// setImmediate - fase check (questo ciclo, dopo I/O)
setImmediate(() => console.log('3. setImmediate'));

console.log('2. Fine');

/* Tipico output:
1. Inizio
2. Fine
3. setImmediate
4. setTimeout
*/
```

## setImmediate() vs process.nextTick()

`process.nextTick()` ha una priorità MOLTO più alta di `setImmediate()`.

### Differenze Chiave

```javascript
console.log('1. Start');

setImmediate(() => {
    console.log('4. setImmediate');
});

process.nextTick(() => {
    console.log('2. nextTick');
});

Promise.resolve().then(() => {
    console.log('3. Promise');
});

console.log('1. End');

/* Output GARANTITO:
1. Start
1. End
2. nextTick
3. Promise
4. setImmediate
*/
```

### Ordine di Priorità Completo

```
1. Codice sincrono
2. process.nextTick() ← Massima priorità
3. Promise microtasks
   ↓
   [Event Loop inizia]
   ↓
4. timers (setTimeout, setInterval)
5. I/O callbacks (poll phase)
6. setImmediate() ← Bassa priorità
7. close callbacks
```

### Esempio Completo di Priorità

```javascript
console.log('1. Codice sincrono');

setTimeout(() => console.log('6. setTimeout'), 0);

setImmediate(() => console.log('7. setImmediate'));

process.nextTick(() => {
    console.log('3. nextTick');
    
    process.nextTick(() => {
        console.log('4. nextTick annidato');
    });
});

Promise.resolve()
    .then(() => console.log('5. Promise'))
    .then(() => console.log('5. Promise chain'));

console.log('2. Altro codice sincrono');

/* Output:
1. Codice sincrono
2. Altro codice sincrono
3. nextTick
4. nextTick annidato
5. Promise
5. Promise chain
6. setTimeout
7. setImmediate
*/
```

### Tabella Comparativa

| Caratteristica | process.nextTick() | setImmediate() |
|----------------|-------------------|----------------|
| **Quando viene eseguito** | Fine della fase corrente | Fase check |
| **Priorità** | Massima | Normale |
| **Può bloccare Event Loop** | Sì (se ricorsivo) | No |
| **Use case** | Operazioni critiche | Codice post-I/O |
| **Rischio starvation** | Alto | Basso |

## Casi d'Uso Pratici

### Caso 1: Dare Priorità alle Operazioni I/O

```javascript
const fs = require('fs');

// ✅ Pattern corretto: setImmediate dopo I/O
function processLargeFile(filename, callback) {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) return callback(err);
        
        const lines = data.split('\n');
        let processed = 0;
        
        function processChunk() {
            // Processa 1000 righe alla volta
            const end = Math.min(processed + 1000, lines.length);
            
            for (let i = processed; i < end; i++) {
                // Processa riga
                processLine(lines[i]);
            }
            
            processed = end;
            
            if (processed < lines.length) {
                // Usa setImmediate per permettere altre operazioni I/O
                setImmediate(processChunk);
            } else {
                callback(null, processed);
            }
        }
        
        processChunk();
    });
}

function processLine(line) {
    // Simula processing
    const words = line.split(' ');
    return words.length;
}

// Uso
processLargeFile('large-file.txt', (err, count) => {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    console.log(`Processate ${count} righe`);
});

// Altre operazioni I/O possono essere gestite tra i chunk
```

### Caso 2: Spezzare Operazioni CPU-Intensive

```javascript
// ❌ MALE: Blocca l'Event Loop
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Questo blocca tutto per diversi secondi!
console.log(fibonacci(45));

// ✅ BENE: Usa setImmediate per non bloccare
function fibonacciAsync(n, callback) {
    const memo = {};
    
    function compute(num) {
        if (num <= 1) return num;
        if (memo[num]) return memo[num];
        
        memo[num] = compute(num - 1) + compute(num - 2);
        return memo[num];
    }
    
    // Esegui in piccoli chunk
    setImmediate(() => {
        try {
            const result = compute(n);
            callback(null, result);
        } catch (err) {
            callback(err);
        }
    });
}

// Uso
console.log('Inizio calcolo...');

fibonacciAsync(45, (err, result) => {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    console.log('Fibonacci(45):', result);
});

console.log('Il server può gestire altre richieste!');

// Output:
// Inizio calcolo...
// Il server può gestire altre richieste!
// Fibonacci(45): 1134903170
```

### Caso 3: Garantire Ordine di Esecuzione dopo I/O

```javascript
const fs = require('fs');

class DataProcessor {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    
    addFile(filename) {
        this.queue.push(filename);
        this.process();
    }
    
    process() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        
        this.processing = true;
        const filename = this.queue.shift();
        
        console.log(`Inizio processing: ${filename}`);
        
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                console.error(`Errore ${filename}:`, err.message);
            } else {
                console.log(`Letto ${filename}: ${data.length} bytes`);
            }
            
            // Usa setImmediate per assicurarsi che altre operazioni I/O
            // abbiano la possibilità di completarsi prima di processare
            // il prossimo file
            setImmediate(() => {
                this.processing = false;
                this.process(); // Processa prossimo file
            });
        });
    }
}

// Uso
const processor = new DataProcessor();
processor.addFile('file1.txt');
processor.addFile('file2.txt');
processor.addFile('file3.txt');

// I file vengono processati in ordine, ma altre operazioni I/O
// possono essere gestite tra un file e l'altro
```

### Caso 4: Implementare Recursive Scheduling Sicuro

```javascript
// ❌ MALE: Usa process.nextTick (può causare starvation)
function recursiveBad() {
    console.log('Iterazione');
    process.nextTick(recursiveBad);
}

// recursiveBad(); // Blocca completamente l'Event Loop!

// ✅ BENE: Usa setImmediate (permette altre operazioni)
function recursiveGood(count = 0, maxIterations = 1000) {
    console.log(`Iterazione ${count}`);
    
    if (count < maxIterations) {
        setImmediate(() => recursiveGood(count + 1, maxIterations));
    } else {
        console.log('Completato!');
    }
}

recursiveGood();

// L'Event Loop può gestire altre operazioni tra le iterazioni

// Esempio pratico: Long polling
class LongPoller {
    constructor(pollFn, interval = 0) {
        this.pollFn = pollFn;
        this.interval = interval;
        this.running = false;
    }
    
    start() {
        if (this.running) return;
        this.running = true;
        this.poll();
    }
    
    poll() {
        if (!this.running) return;
        
        this.pollFn((err, shouldContinue) => {
            if (err) {
                console.error('Errore polling:', err);
            }
            
            if (this.running && shouldContinue !== false) {
                // Usa setImmediate per non bloccare altre operazioni
                if (this.interval > 0) {
                    setTimeout(() => this.poll(), this.interval);
                } else {
                    setImmediate(() => this.poll());
                }
            }
        });
    }
    
    stop() {
        this.running = false;
    }
}

// Uso
const poller = new LongPoller((callback) => {
    // Simula controllo di una coda
    const hasWork = Math.random() > 0.8;
    
    if (hasWork) {
        console.log('💼 Lavoro trovato, processing...');
    }
    
    callback(null, true); // Continua polling
}, 100);

poller.start();

// Stop dopo 5 secondi
setTimeout(() => {
    poller.stop();
    console.log('Polling fermato');
}, 5000);
```

### Caso 5: Event Emitter con setImmediate

```javascript
const EventEmitter = require('events');

class AsyncEmitter extends EventEmitter {
    // Emette eventi in modo asincrono per evitare problemi
    emitAsync(event, ...args) {
        setImmediate(() => {
            this.emit(event, ...args);
        });
    }
}

// Esempio di utilizzo
const emitter = new AsyncEmitter();

emitter.on('data', (data) => {
    console.log('Ricevuto:', data);
});

console.log('Prima dell\'emissione');
emitter.emitAsync('data', { value: 42 });
console.log('Dopo l\'emissione');

// Output:
// Prima dell'emissione
// Dopo l'emissione
// Ricevuto: { value: 42 }

// Questo pattern è utile per garantire che i listener
// siano registrati prima che gli eventi vengano emessi
```

## clearImmediate()

Come `setTimeout()` restituisce un ID che può essere usato con `clearTimeout()`, `setImmediate()` restituisce un oggetto `Immediate` che può essere usato con `clearImmediate()`.

### Sintassi

```javascript
const immediate = setImmediate(() => {
    console.log('Questo non verrà eseguito');
});

clearImmediate(immediate);

console.log('Immediate cancellato');

// Output:
// Immediate cancellato
```

### Esempio Pratico: Timeout con Cancellazione

```javascript
function operazioneConTimeout(operazioneFn, timeoutMs, callback) {
    let completed = false;
    
    // Timer per timeout
    const timeout = setTimeout(() => {
        if (!completed) {
            completed = true;
            clearImmediate(immediate);
            callback(new Error(`Timeout dopo ${timeoutMs}ms`));
        }
    }, timeoutMs);
    
    // Operazione immediata
    const immediate = setImmediate(() => {
        operazioneFn((err, result) => {
            if (!completed) {
                completed = true;
                clearTimeout(timeout);
                callback(err, result);
            }
        });
    });
}

// Uso
operazioneConTimeout(
    (cb) => {
        // Simula operazione che impiega 2 secondi
        setTimeout(() => cb(null, 'Risultato'), 2000);
    },
    1000, // Timeout di 1 secondo
    (err, result) => {
        if (err) {
            console.log('⏱️ Timeout:', err.message);
        } else {
            console.log('✓ Successo:', result);
        }
    }
);

// Output: ⏱️ Timeout: Timeout dopo 1000ms
```

### Pattern: Immediate Pool

```javascript
class ImmediatePool {
    constructor() {
        this.immediates = new Set();
    }
    
    add(callback) {
        const immediate = setImmediate(() => {
            this.immediates.delete(immediate);
            callback();
        });
        
        this.immediates.add(immediate);
        return immediate;
    }
    
    clear(immediate) {
        if (this.immediates.has(immediate)) {
            clearImmediate(immediate);
            this.immediates.delete(immediate);
            return true;
        }
        return false;
    }
    
    clearAll() {
        this.immediates.forEach(immediate => {
            clearImmediate(immediate);
        });
        this.immediates.clear();
    }
    
    get size() {
        return this.immediates.size;
    }
}

// Uso
const pool = new ImmediatePool();

const imm1 = pool.add(() => console.log('Task 1'));
const imm2 = pool.add(() => console.log('Task 2'));
const imm3 = pool.add(() => console.log('Task 3'));

console.log('Immediates schedulati:', pool.size); // 3

// Cancella uno specifico
pool.clear(imm2);

console.log('Dopo clear:', pool.size); // 2

// Cancella tutti
setTimeout(() => {
    pool.clearAll();
    console.log('Tutti cancellati:', pool.size); // 0
}, 500);
```

## Performance e Ottimizzazioni

### Benchmark: setImmediate vs setTimeout

```javascript
const { performance } = require('perf_hooks');

function benchmarkSetImmediate(iterations) {
    return new Promise((resolve) => {
        const start = performance.now();
        let count = 0;
        
        function schedule() {
            count++;
            if (count < iterations) {
                setImmediate(schedule);
            } else {
                const duration = performance.now() - start;
                resolve({ method: 'setImmediate', duration, iterations });
            }
        }
        
        schedule();
    });
}

function benchmarkSetTimeout(iterations) {
    return new Promise((resolve) => {
        const start = performance.now();
        let count = 0;
        
        function schedule() {
            count++;
            if (count < iterations) {
                setTimeout(schedule, 0);
            } else {
                const duration = performance.now() - start;
                resolve({ method: 'setTimeout', duration, iterations });
            }
        }
        
        schedule();
    });
}

async function runBenchmarks() {
    const iterations = 10000;
    
    console.log(`Esecuzione ${iterations} iterazioni...\n`);
    
    const immediateResult = await benchmarkSetImmediate(iterations);
    console.log(`${immediateResult.method}:`);
    console.log(`  Tempo totale: ${immediateResult.duration.toFixed(2)}ms`);
    console.log(`  Tempo medio: ${(immediateResult.duration / iterations).toFixed(4)}ms per iterazione\n`);
    
    const timeoutResult = await benchmarkSetTimeout(iterations);
    console.log(`${timeoutResult.method}:`);
    console.log(`  Tempo totale: ${timeoutResult.duration.toFixed(2)}ms`);
    console.log(`  Tempo medio: ${(timeoutResult.duration / iterations).toFixed(4)}ms per iterazione\n`);
    
    const speedup = (timeoutResult.duration / immediateResult.duration).toFixed(2);
    console.log(`setImmediate è ${speedup}x più veloce di setTimeout(0)`);
}

runBenchmarks();

/* Output tipico:
Esecuzione 10000 iterazioni...

setImmediate:
  Tempo totale: 245.67ms
  Tempo medio: 0.0246ms per iterazione

setTimeout:
  Tempo totale: 1523.45ms
  Tempo medio: 0.1523ms per iterazione

setImmediate è 6.20x più veloce di setTimeout(0)
*/
```

### Ottimizzazione: Batching con setImmediate

```javascript
class BatchProcessor {
    constructor(batchSize = 100) {
        this.batchSize = batchSize;
        this.queue = [];
        this.processing = false;
    }
    
    add(item) {
        return new Promise((resolve, reject) => {
            this.queue.push({ item, resolve, reject });
            this.scheduleProcessing();
        });
    }
    
    scheduleProcessing() {
        if (this.processing) return;
        
        this.processing = true;
        setImmediate(() => this.processBatch());
    }
    
    processBatch() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }
        
        // Processa un batch
        const batch = this.queue.splice(0, this.batchSize);
        
        console.log(`Processing batch of ${batch.length} items`);
        
        batch.forEach(({ item, resolve, reject }) => {
            try {
                const result = this.processItem(item);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
        
        // Schedula prossimo batch
        if (this.queue.length > 0) {
            setImmediate(() => this.processBatch());
        } else {
            this.processing = false;
        }
    }
    
    processItem(item) {
        // Simula processing
        return item * 2;
    }
}

// Uso
const processor = new BatchProcessor(50);

// Aggiungi 200 items
const promises = [];
for (let i = 0; i < 200; i++) {
    promises.push(processor.add(i));
}

Promise.all(promises).then(results => {
    console.log(`Processati ${results.length} items`);
    console.log(`Primi 5 risultati:`, results.slice(0, 5));
});

/* Output:
Processing batch of 50 items
Processing batch of 50 items
Processing batch of 50 items
Processing batch of 50 items
Processati 200 items
Primi 5 risultati: [ 0, 2, 4, 6, 8 ]
*/
```

### Ottimizzazione: Deferred Execution

```javascript
class DeferredExecutor {
    constructor() {
        this.tasks = [];
        this.scheduled = false;
    }
    
    defer(fn) {
        this.tasks.push(fn);
        
        if (!this.scheduled) {
            this.scheduled = true;
            setImmediate(() => this.execute());
        }
    }
    
    execute() {
        const tasksToExecute = this.tasks.splice(0);
        this.scheduled = false;
        
        console.log(`Executing ${tasksToExecute.length} deferred tasks`);
        
        tasksToExecute.forEach(task => {
            try {
                task();
            } catch (err) {
                console.error('Error in deferred task:', err);
            }
        });
    }
}

// Uso
const executor = new DeferredExecutor();

// Schedula molte operazioni - verranno eseguite tutte insieme
for (let i = 0; i < 10; i++) {
    executor.defer(() => {
        console.log(`Task ${i}`);
    });
}

console.log('Tutte le operazioni sono state schedulate');

/* Output:
Tutte le operazioni sono state schedulate
Executing 10 deferred tasks
Task 0
Task 1
Task 2
...
Task 9
*/
```

## Differenze tra Browser e Node.js

`setImmediate()` è una funzione **specifica di Node.js** e non è disponibile nei browser.

### Polyfill per Browser

```javascript
// Polyfill per browser (non perfetto ma funzionale)
if (typeof setImmediate === 'undefined') {
    global.setImmediate = function(callback, ...args) {
        return setTimeout(callback, 0, ...args);
    };
    
    global.clearImmediate = function(id) {
        return clearTimeout(id);
    };
}

// NOTA: Questo non replica esattamente il comportamento di Node.js
// perché nei browser non c'è la fase "check" dell'Event Loop
```

### Alternative nei Browser

```javascript
// Nel browser, usa queste alternative:

// 1. setTimeout (meno preciso)
setTimeout(() => {
    console.log('Eseguito dopo ~1ms');
}, 0);

// 2. MessageChannel (più simile a setImmediate)
const channel = new MessageChannel();
channel.port1.onmessage = () => {
    console.log('Eseguito tramite MessageChannel');
};
channel.port2.postMessage(null);

// 3. requestAnimationFrame (per operazioni UI)
requestAnimationFrame(() => {
    console.log('Eseguito prima del prossimo repaint');
});

// 4. queueMicrotask (simile a Promise)
queueMicrotask(() => {
    console.log('Eseguito come microtask');
});
```

### Codice Cross-Platform

```javascript
// Funzione che funziona sia in Node.js che nei browser
function defer(callback) {
    if (typeof setImmediate !== 'undefined') {
        // Node.js
        return setImmediate(callback);
    } else if (typeof MessageChannel !== 'undefined') {
        // Browser moderni
        const channel = new MessageChannel();
        channel.port1.onmessage = callback;
        channel.port2.postMessage(null);
        return { channel };
    } else {
        // Fallback
        return setTimeout(callback, 0);
    }
}

// Uso
defer(() => {
    console.log('Eseguito in modo cross-platform');
});
```

## Pattern Avanzati

### Pattern 1: Throttling con setImmediate

```javascript
function throttleImmediate(fn) {
    let scheduled = false;
    let lastArgs = null;
    
    return function(...args) {
        lastArgs = args;
        
        if (!scheduled) {
            scheduled = true;
            setImmediate(() => {
                scheduled = false;
                fn.apply(this, lastArgs);
                lastArgs = null;
            });
        }
    };
}

// Uso
let count = 0;
const throttled = throttleImmediate(() => {
    console.log('Eseguito:', ++count);
});

// Chiama 1000 volte rapidamente
for (let i = 0; i < 1000; i++) {
    throttled();
}

// Output: Eseguito: 1
// (viene eseguito solo una volta, le altre chiamate sono ignorate)
```

### Pattern 2: Queue con Priorità

```javascript
class PriorityQueue {
    constructor() {
        this.highPriority = [];
        this.normalPriority = [];
        this.lowPriority = [];
        this.processing = false;
    }
    
    add(task, priority = 'normal') {
        return new Promise((resolve, reject) => {
            const entry = { task, resolve, reject };
            
            switch (priority) {
                case 'high':
                    this.highPriority.push(entry);
                    break;
                case 'low':
                    this.lowPriority.push(entry);
                    break;
                default:
                    this.normalPriority.push(entry);
            }
            
            this.scheduleProcessing();
        });
    }
    
    scheduleProcessing() {
        if (this.processing) return;
        
        this.processing = true;
        setImmediate(() => this.process());
    }
    
    process() {
        const entry = this.getNext();
        
        if (!entry) {
            this.processing = false;
            return;
        }
        
        const { task, resolve, reject } = entry;
        
        try {
            const result = task();
            resolve(result);
        } catch (err) {
            reject(err);
        }
        
        // Schedula prossimo task
        setImmediate(() => this.process());
    }
    
    getNext() {
        if (this.highPriority.length > 0) {
            return this.highPriority.shift();
        }
        if (this.normalPriority.length > 0) {
            return this.normalPriority.shift();
        }
        if (this.lowPriority.length > 0) {
            return this.lowPriority.shift();
        }
        return null;
    }
}

// Uso
const queue = new PriorityQueue();

queue.add(() => console.log('🔴 High priority 1'), 'high');
queue.add(() => console.log('⚪ Normal priority 1'), 'normal');
queue.add(() => console.log('🔵 Low priority 1'), 'low');
queue.add(() => console.log('🔴 High priority 2'), 'high');
queue.add(() => console.log('⚪ Normal priority 2'), 'normal');

/* Output:
🔴 High priority 1
🔴 High priority 2
⚪ Normal priority 1
⚪ Normal priority 2
🔵 Low priority 1
*/
```

### Pattern 3: Cooperative Multitasking

```javascript
class CooperativeScheduler {
    constructor(timeSlice = 10) {
        this.timeSlice = timeSlice; // ms
        this.tasks = [];
        