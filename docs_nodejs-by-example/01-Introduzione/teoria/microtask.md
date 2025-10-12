# Microtask Queue in Node.js

## Cos'è la Microtask Queue?

La **Microtask Queue** (o Microtask Queue) è una coda speciale ad **altissima priorità** che contiene callback che devono essere eseguiti **immediatamente dopo** il completamento del codice sincrono corrente, ma **prima** di qualsiasi fase dell'Event Loop.

Le microtask hanno priorità assoluta su tutte le altre operazioni asincrone in Node.js.

### Posizione nell'Esecuzione

```
┌─────────────────────────────────────┐
│  1. Codice Sincrono                 │ ← Eseguito per primo
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  2. MICROTASK QUEUE ⭐⭐⭐           │ ← Priorità MASSIMA
│     a. process.nextTick() queue     │   (eseguita PRIMA dell'Event Loop)
│     b. Promise callbacks queue      │
└──────────────┬──────────────────────┘
               │
    ┌──────────▼──────────┐
    │  Event Loop Inizia  │
    └──────────┬──────────┘
               │
┌──────────────▼──────────────────────┐
│  3. Timers (setTimeout)             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  4. Pending Callbacks               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  5. Poll (I/O)                      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  6. Check (setImmediate)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  7. Close Callbacks                 │
└─────────────────────────────────────┘

NOTA: Le microtask vengono svuotate DOPO OGNI FASE!
```

## Tipi di Microtask

### 1. process.nextTick()

`process.nextTick()` è una funzione **specifica di Node.js** che pianifica un callback nella **nextTick queue**, che ha la **priorità più alta** di tutte.

```javascript
console.log('1. Start');

process.nextTick(() => {
    console.log('2. nextTick');
});

console.log('1. End');

/* Output:
1. Start
1. End
2. nextTick
*/
```

#### Caratteristiche di process.nextTick()

```javascript
// ✅ Eseguito IMMEDIATAMENTE dopo il codice sincrono
process.nextTick(() => {
    console.log('Eseguito prima di qualsiasi altra cosa asincrona');
});

// ✅ Può essere annidato (attenzione al rischio!)
process.nextTick(() => {
    console.log('NextTick 1');
    
    process.nextTick(() => {
        console.log('NextTick 2 (annidato)');
    });
});

// ✅ Può ricevere argomenti
process.nextTick((name, age) => {
    console.log(`Hello ${name}, age ${age}`);
}, 'Mario', 30);

/* Output:
NextTick 1
NextTick 2 (annidato)
Hello Mario, age 30
Eseguito prima di qualsiasi altra cosa asincrona
*/
```

### 2. Promise Callbacks

I callback delle Promise (`.then()`, `.catch()`, `.finally()`) vengono eseguiti come **microtask**, ma con priorità **inferiore** rispetto a `process.nextTick()`.

```javascript
console.log('1. Start');

Promise.resolve().then(() => {
    console.log('3. Promise');
});

process.nextTick(() => {
    console.log('2. nextTick');
});

console.log('1. End');

/* Output:
1. Start
1. End
2. nextTick    ← Eseguito PRIMA di Promise
3. Promise
*/
```

#### Caratteristiche delle Promise Microtask

```javascript
// ✅ Chain di Promise sono tutte microtask
Promise.resolve()
    .then(() => {
        console.log('Promise 1');
        return 'value';
    })
    .then((value) => {
        console.log('Promise 2:', value);
    })
    .catch((err) => {
        console.error('Error:', err);
    })
    .finally(() => {
        console.log('Promise finally');
    });

// ✅ async/await usa Promise microtask
async function asyncFunction() {
    console.log('Async start');
    await Promise.resolve();
    console.log('After await (microtask)');
}

asyncFunction();

/* Output:
Async start
Promise 1
Promise 2: value
Promise finally
After await (microtask)
*/
```

### 3. queueMicrotask()

`queueMicrotask()` è una API standard del Web che permette di accodare esplicitamente una microtask.

```javascript
console.log('1. Start');

queueMicrotask(() => {
    console.log('3. queueMicrotask');
});

process.nextTick(() => {
    console.log('2. nextTick');
});

console.log('1. End');

/* Output:
1. Start
1. End
2. nextTick         ← nextTick ha priorità
3. queueMicrotask
*/
```

## Ordine di Priorità Completo

### Gerarchia delle Microtask

```javascript
console.log('1. Sync code');

// Priorità 1: process.nextTick (MASSIMA)
process.nextTick(() => console.log('2. nextTick'));

// Priorità 2: Promise/queueMicrotask
Promise.resolve().then(() => console.log('3. Promise'));
queueMicrotask(() => console.log('3. queueMicrotask'));

// Priorità 3: setTimeout (NON è microtask!)
setTimeout(() => console.log('4. setTimeout'), 0);

// Priorità 4: setImmediate (NON è microtask!)
setImmediate(() => console.log('5. setImmediate'));

console.log('1. Sync code end');

/* Output GARANTITO:
1. Sync code
1. Sync code end
2. nextTick
3. Promise
3. queueMicrotask
4. setTimeout
5. setImmediate
*/
```

### Tabella di Priorità

| Priorità | Tipo | Queue | Quando |
|----------|------|-------|--------|
| 🔴 1 (Massima) | Codice sincrono | - | Immediato |
| 🟠 2 | process.nextTick() | nextTick queue | Dopo sync, prima di tutto |
| 🟡 3 | Promise/queueMicrotask | Promise queue | Dopo nextTick |
| 🟢 4 | setTimeout/setInterval | Timers queue | Fase timers |
| 🔵 5 | I/O callbacks | Poll queue | Fase poll |
| 🟣 6 | setImmediate | Check queue | Fase check |
| ⚫ 7 | close callbacks | Close queue | Fase close |

## Microtask Vengono Svuotate Dopo Ogni Fase

Una caratteristica **cruciale** delle microtask è che vengono **completamente svuotate** dopo ogni fase dell'Event Loop.

### Esempio

```javascript
const fs = require('fs');

console.log('1. Start');

// Timer phase
setTimeout(() => {
    console.log('3. setTimeout');
    
    // Microtask schedulata dentro setTimeout
    process.nextTick(() => {
        console.log('4. nextTick inside setTimeout');
    });
    
    Promise.resolve().then(() => {
        console.log('5. Promise inside setTimeout');
    });
}, 0);

// Microtask
process.nextTick(() => {
    console.log('2. nextTick');
});

console.log('1. End');

/* Output:
1. Start
1. End
2. nextTick
3. setTimeout
4. nextTick inside setTimeout
5. Promise inside setTimeout
*/

// Le microtask create dentro setTimeout vengono eseguite
// IMMEDIATAMENTE dopo il completamento del setTimeout,
// PRIMA di passare alla prossima fase dell'Event Loop!
```

### Diagramma del Flusso

```
Fase Timers: [setTimeout callback]
           ↓
     Esegue setTimeout
           ↓
    [crea nextTick + Promise]
           ↓
    SVUOTA MICROTASK QUEUE ← IMPORTANTE!
    - nextTick
    - Promise
           ↓
    Continua Event Loop
```

## Microtask Starvation

Un problema critico con le microtask è il rischio di **starvation** (fame) dell'Event Loop.

### Il Problema

```javascript
// ❌ PERICOLOSO: Blocca completamente l'Event Loop!
function recursiveNextTick() {
    console.log('NextTick');
    process.nextTick(recursiveNextTick);
}

recursiveNextTick();

// Questo codice NON VERRÀ MAI ESEGUITO!
setTimeout(() => {
    console.log('setTimeout - mai eseguito!');
}, 0);

/* Output:
NextTick
NextTick
NextTick
NextTick
... (infinito)
*/

// L'Event Loop non riesce mai a procedere alle altre fasi
// perché la nextTick queue non si svuota mai!
```

### Perché Succede?

```
1. Codice sincrono completa
   ↓
2. Event Loop prova a iniziare
   ↓
3. Controlla microtask queue
   ↓
4. Esegue nextTick → crea altro nextTick
   ↓
5. Queue non è vuota, torna al punto 3
   ↓
♾️ LOOP INFINITO - Event Loop bloccato!
```

### Soluzioni

```javascript
// ❌ MALE: Starvation con nextTick
function badRecursive(count = 0) {
    if (count < 10000) {
        process.nextTick(() => badRecursive(count + 1));
    }
}

// ✅ BENE: Usa setImmediate
function goodRecursive(count = 0) {
    if (count < 10000) {
        setImmediate(() => goodRecursive(count + 1));
    }
}

// ✅ MEGLIO: Batch processing con nextTick
function processBatch(items, batchSize = 100) {
    const batch = items.splice(0, batchSize);
    
    // Processa batch
    batch.forEach(item => processItem(item));
    
    if (items.length > 0) {
        // Permetti all'Event Loop di progredire
        setImmediate(() => processBatch(items, batchSize));
    }
}
```

## Esempi Pratici Complessi

### Esempio 1: Ordine di Esecuzione Completo

```javascript
console.log('1. Script start');

setTimeout(() => {
    console.log('7. setTimeout 1');
    
    process.nextTick(() => {
        console.log('8. nextTick inside setTimeout');
    });
}, 0);

Promise.resolve()
    .then(() => {
        console.log('3. Promise 1');
        return Promise.resolve();
    })
    .then(() => {
        console.log('4. Promise 2');
    });

process.nextTick(() => {
    console.log('2. nextTick 1');
    
    process.nextTick(() => {
        console.log('2. nextTick 1.1 (nested)');
    });
});

setTimeout(() => {
    console.log('9. setTimeout 2');
    
    Promise.resolve().then(() => {
        console.log('10. Promise inside setTimeout 2');
    });
}, 0);

process.nextTick(() => {
    console.log('2. nextTick 2');
});

Promise.resolve().then(() => {
    console.log('5. Promise 3');
});

setImmediate(() => {
    console.log('11. setImmediate');
});

console.log('1. Script end');

/* Output:
1. Script start
1. Script end
2. nextTick 1
2. nextTick 2
2. nextTick 1.1 (nested)
3. Promise 1
4. Promise 2
5. Promise 3
7. setTimeout 1
8. nextTick inside setTimeout
9. setTimeout 2
10. Promise inside setTimeout 2
11. setImmediate
*/
```

### Esempio 2: async/await e Microtask

```javascript
async function asyncFunction1() {
    console.log('2. Async 1 start');
    
    await Promise.resolve();
    console.log('5. After await 1');
    
    await Promise.resolve();
    console.log('6. After await 2');
}

async function asyncFunction2() {
    console.log('3. Async 2 start');
    
    await Promise.resolve();
    console.log('7. After await 3');
}

console.log('1. Start');

asyncFunction1();
asyncFunction2();

process.nextTick(() => {
    console.log('4. nextTick');
});

console.log('1. End');

/* Output:
1. Start
2. Async 1 start
3. Async 2 start
1. End
4. nextTick
5. After await 1
7. After await 3
6. After await 2
*/
```

### Esempio 3: Microtask in Event Loop Phases

```javascript
const fs = require('fs');

console.log('1. Sync start');

// Microtask
process.nextTick(() => {
    console.log('2. NextTick - before event loop');
});

// Timer phase
setTimeout(() => {
    console.log('4. Timers phase');
    
    process.nextTick(() => {
        console.log('5. NextTick - after timers');
    });
    
    Promise.resolve().then(() => {
        console.log('6. Promise - after timers');
    });
}, 0);

// Poll phase
fs.readFile(__filename, () => {
    console.log('7. Poll phase (I/O)');
    
    process.nextTick(() => {
        console.log('8. NextTick - after poll');
    });
    
    setImmediate(() => {
        console.log('10. setImmediate - after poll');
        
        process.nextTick(() => {
            console.log('11. NextTick - after setImmediate');
        });
    });
    
    Promise.resolve().then(() => {
        console.log('9. Promise - after poll');
    });
});

// Promise microtask
Promise.resolve().then(() => {
    console.log('3. Promise - before event loop');
});

console.log('1. Sync end');

/* Output tipico:
1. Sync start
1. Sync end
2. NextTick - before event loop
3. Promise - before event loop
4. Timers phase
5. NextTick - after timers
6. Promise - after timers
7. Poll phase (I/O)
8. NextTick - after poll
9. Promise - after poll
10. setImmediate - after poll
11. NextTick - after setImmediate
*/
```

## Casi d'Uso Pratici

### Caso 1: Defer Operazioni Non Critiche

```javascript
function processRequest(req, res) {
    // Risposta critica - sincrona
    const result = computeResponse(req);
    res.send(result);
    
    // Logging non critico - defer con microtask
    process.nextTick(() => {
        logger.log('Request processed', {
            url: req.url,
            method: req.method,
            duration: Date.now() - req.startTime
        });
    });
    
    // Analytics non critico - defer
    Promise.resolve().then(() => {
        analytics.track('request', {
            user: req.user,
            endpoint: req.url
        });
    });
}
```

### Caso 2: Garantire Ordine di Inizializzazione

```javascript
class EventEmitter {
    constructor() {
        this.events = {};
        
        // Defer emissione per permettere registrazione listener
        process.nextTick(() => {
            this.emit('initialized');
        });
    }
    
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(listener => {
                listener(...args);
            });
        }
    }
}

// Uso
const emitter = new EventEmitter();

// Listener può essere registrato dopo costruzione
emitter.on('initialized', () => {
    console.log('Emitter initialized!');
});

// Grazie a nextTick, 'initialized' viene emesso DOPO
// che il listener è stato registrato
```

### Caso 3: Consistent Async Interface

```javascript
// ❌ MALE: Comportamento inconsistente
function getData(useCache, callback) {
    if (useCache && cache.has('data')) {
        // Sincrono!
        callback(null, cache.get('data'));
    } else {
        // Asincrono!
        fetchData((err, data) => {
            callback(err, data);
        });
    }
}

// Problema: comportamento imprevedibile
let data;
getData(true, (err, result) => {
    data = result;
});
console.log(data); // undefined o dati? Dipende!

// ✅ BENE: Sempre asincrono con nextTick
function getDataConsistent(useCache, callback) {
    if (useCache && cache.has('data')) {
        // Rendi asincrono!
        process.nextTick(() => {
            callback(null, cache.get('data'));
        });
    } else {
        fetchData((err, data) => {
            callback(err, data);
        });
    }
}

// Comportamento prevedibile: sempre asincrono
let data2;
getDataConsistent(true, (err, result) => {
    data2 = result;
});
console.log(data2); // undefined (garantito)
```

### Caso 4: Error Handling con Microtask

```javascript
class SafeEventEmitter extends EventEmitter {
    emit(event, ...args) {
        // Cattura errori in listener senza bloccare altri listener
        const listeners = this.listeners(event);
        
        listeners.forEach(listener => {
            process.nextTick(() => {
                try {
                    listener(...args);
                } catch (err) {
                    console.error('Listener error:', err);
                    this.emit('error', err);
                }
            });
        });
        
        return listeners.length > 0;
    }
}

// Uso
const emitter = new SafeEventEmitter();

emitter.on('data', (data) => {
    console.log('Listener 1:', data);
});

emitter.on('data', (data) => {
    throw new Error('Listener 2 failed!');
});

emitter.on('data', (data) => {
    console.log('Listener 3:', data);
});

emitter.on('error', (err) => {
    console.error('Error caught:', err.message);
});

emitter.emit('data', 'test');

/* Output:
Listener 1: test
Listener 3: test
Error caught: Listener 2 failed!
*/
```

### Caso 5: Batch Processing Ottimizzato

```javascript
class MicrotaskBatcher {
    constructor(processFn, batchSize = 100) {
        this.processFn = processFn;
        this.batchSize = batchSize;
        this.queue = [];
        this.scheduled = false;
    }
    
    add(item) {
        return new Promise((resolve, reject) => {
            this.queue.push({ item, resolve, reject });
            this.schedule();
        });
    }
    
    schedule() {
        if (this.scheduled) return;
        
        this.scheduled = true;
        
        // Usa microtask per raggruppare chiamate sincrone
        process.nextTick(() => {
            this.flush();
        });
    }
    
    flush() {
        this.scheduled = false;
        
        if (this.queue.length === 0) return;
        
        // Processa batch
        const batch = this.queue.splice(0, this.batchSize);
        
        console.log(`Processing batch of ${batch.length} items`);
        
        batch.forEach(({ item, resolve, reject }) => {
            try {
                const result = this.processFn(item);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
        
        // Se ci sono altri item, schedula prossimo batch
        if (this.queue.length > 0) {
            setImmediate(() => this.flush());
        }
    }
}

// Uso
const batcher = new MicrotaskBatcher(
    (item) => item * 2,
    50
);

// Aggiungi molti item sincronamente
for (let i = 0; i < 200; i++) {
    batcher.add(i).then(result => {
        if (i % 50 === 0) {
            console.log(`Item ${i} result: ${result}`);
        }
    });
}

/* Output:
Processing batch of 50 items
Item 0 result: 0
Processing batch of 50 items
Item 50 result: 100
Processing batch of 50 items
Item 100 result: 200
Processing batch of 50 items
Item 150 result: 300
*/
```

## Performance Considerations

### Benchmark: nextTick vs Promise vs setImmediate

```javascript
const { performance } = require('perf_hooks');

async function benchmarkMicrotasks() {
    const iterations = 10000;
    
    // Benchmark nextTick
    const nextTickStart = performance.now();
    let nextTickCount = 0;
    
    await new Promise((resolve) => {
        function scheduleNextTick() {
            if (nextTickCount >= iterations) {
                resolve();
                return;
            }
            nextTickCount++;
            process.nextTick(scheduleNextTick);
        }
        scheduleNextTick();
    });
    
    const nextTickDuration = performance.now() - nextTickStart;
    
    // Benchmark Promise
    const promiseStart = performance.now();
    let promiseCount = 0;
    
    await new Promise((resolve) => {
        function schedulePromise() {
            if (promiseCount >= iterations) {
                resolve();
                return;
            }
            promiseCount++;
            Promise.resolve().then(schedulePromise);
        }
        schedulePromise();
    });
    
    const promiseDuration = performance.now() - promiseStart;
    
    // Benchmark setImmediate
    const immediateStart = performance.now();
    let immediateCount = 0;
    
    await new Promise((resolve) => {
        function scheduleImmediate() {
            if (immediateCount >= iterations) {
                resolve();
                return;
            }
            immediateCount++;
            setImmediate(scheduleImmediate);
        }
        scheduleImmediate();
    });
    
    const immediateDuration = performance.now() - immediateStart;
    
    // Report
    console.log(`\n📊 Benchmark Results (${iterations} iterations):\n`);
    console.log(`process.nextTick():`);
    console.log(`  Total: ${nextTickDuration.toFixed(2)}ms`);
    console.log(`  Per iteration: ${(nextTickDuration / iterations).toFixed(4)}ms\n`);
    
    console.log(`Promise.resolve().then():`);
    console.log(`  Total: ${promiseDuration.toFixed(2)}ms`);
    console.log(`  Per iteration: ${(promiseDuration / iterations).toFixed(4)}ms\n`);
    
    console.log(`setImmediate():`);
    console.log(`  Total: ${immediateDuration.toFixed(2)}ms`);
    console.log(`  Per iteration: ${(immediateDuration / iterations).toFixed(4)}ms\n`);
    
    console.log(`Comparison:`);
    console.log(`  nextTick vs Promise: ${(promiseDuration / nextTickDuration).toFixed(2)}x`);
    console.log(`  nextTick vs setImmediate: ${(immediateDuration / nextTickDuration).toFixed(2)}x`);
}

benchmarkMicrotasks();

/* Output tipico:
📊 Benchmark Results (10000 iterations):

process.nextTick():
  Total: 12.34ms
  Per iteration: 0.0012ms

Promise.resolve().then():
  Total: 15.67ms
  Per iteration: 0.0016ms

setImmediate():
  Total: 345.89ms
  Per iteration: 0.0346ms

Comparison:
  nextTick vs Promise: 1.27x
  nextTick vs setImmediate: 28.03x
*/
```

### Memory Usage

```javascript
function measureMemory(name, fn) {
    // Force GC (run with --expose-gc)
    if (global.gc) global.gc();
    
    const startMemory = process.memoryUsage().heapUsed;
    const startTime = performance.now();
    
    fn();
    
    setTimeout(() => {
        const endMemory = process.memoryUsage().heapUsed;
        const endTime = performance.now();
        
        console.log(`\n${name}:`);
        console.log(`  Time: ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`  Memory: ${((endMemory - startMemory) / 1024 / 1024).toFixed(2)}MB`);
    }, 1000);
}

// Test
measureMemory('nextTick (1000)', () => {
    for (let i = 0; i < 1000; i++) {
        process.nextTick(() => {});
    }
});

setTimeout(() => {
    measureMemory('Promise (1000)', () => {
        for (let i = 0; i < 1000; i++) {
            Promise.resolve().then(() => {});
        }
    });
}, 2000);
```

## Debugging Microtask

### Tracciare Microtask

```javascript
// Wrapper per debugging
const originalNextTick = process.nextTick;
const nextTickCalls = [];

process.nextTick = function(callback, ...args) {
    const stack = new Error().stack;
    nextTickCalls.push({
        callback: callback.name || 'anonymous',
        stack,
        timestamp: Date.now()
    });
    
    const wrappedCallback = function() {
        const start = performance.now();
        const result = callback.apply(this, arguments);
        const duration = performance.now() - start;
        
        console.log(`[nextTick] ${callback.name || 'anonymous'} executed in ${duration.toFixed(2)}ms`);
        
        return result;
    };
    
    return originalNextTick.call(this, wrappedCallback, ...args);
};

// Test
process.nextTick(function myCallback() {
    console.log('My callback executed');
});

setTimeout(() => {
    console.log(`\n📊 Total nextTick calls: ${nextTickCalls.length}`);
}, 100);
```

### Rilevare Microtask Starvation

```javascript
class MicrotaskStarvationDetector {
    constructor(threshold = 100) {
        this.threshold = threshold;
        this.microtaskCount = 0;
        this.monitoring = false;
    }
    
    start() {
        if (this.monitoring) return;
        this.monitoring = true;
        
        const checkLoop = () => {
            const start = Date.now();
            
            setImmediate(() => {
                const lag = Date.now() - start;
                
                if (lag > this.threshold) {
                    console.warn(`⚠️ Possible microtask starvation detected: ${lag}ms lag`);
                }
                
                if (this.monitoring) {
                    checkLoop();
                }
            });
        };
        
        checkLoop();
    }
    
    stop() {
        this.monitoring = false;
    }
}

// Uso
const detector = new MicrotaskStarvationDetector(50);
detector.start();

// Simula starvation
let count = 0;
function causeStarvation() {
    if (count < 10000) {
        count++;
        process.nextTick(causeStarvation);
    }
}

causeStarvation();

setTimeout(() => {
    detector.stop();
}, 5000);
```

## Best Practices

### ✅ DO: Usa nextTick per Defer Non-Critical Code

```javascript
function handleRequest(req, res) {
    // Critico: rispondi subito
    const result = processRequest(req);
    res.send(result);
    
    // Non critico: defer con nextTick
    process.nextTick(() => {
        updateMetrics(req);
        logRequest(req);
    });
}
```

### ✅ DO: Rendi Callback Consistenti

```javascript
// ✅ BENE
function readData(useCache, callback) {
    if (useCache) {
        process.nextTick(() => callback(null, cachedData));
    } else {
        fs.readFile('data.txt', callback);
    }
}
```

### ✅ DO: Usa Promise per Async Operations

```javascript
// ✅ BENE
async function fetchUserData(userId) {
    const user = await db.users.findById(userId);
    const posts = await db.posts.findByUser(userId);
    return { user, posts };
}
```

### ❌ DON'T: Non Creare Ricorsione Infinita

```javascript
// ❌ MALE
function infiniteLoop() {
    process.nextTick(infiniteLoop);
}

// ✅ BENE
function controlledLoop(maxIterations) {
    let count = 0;
    function iterate() {
        if (count < maxIterations) {
            count++;