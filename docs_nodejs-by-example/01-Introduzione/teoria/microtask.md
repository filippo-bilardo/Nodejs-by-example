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
│  2. MICROTASK QUEUE ⭐⭐⭐         │ ← Priorità MASSIMA
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
            setImmediate(iterate); // Usa setImmediate invece!
        }
    }
    iterate();
}
```

### ❌ DON'T: Non Bloccare con Operazioni Pesanti

```javascript
// ❌ MALE: Blocca microtask queue
process.nextTick(() => {
    for (let i = 0; i < 1000000000; i++) {
        // Calcolo pesante
    }
});

// ✅ BENE: Spezza in chunk
function heavyComputation(data) {
    const chunkSize = 1000;
    let index = 0;
    
    function processChunk() {
        const end = Math.min(index + chunkSize, data.length);
        
        for (let i = index; i < end; i++) {
            // Processa item
        }
        
        index = end;
        
        if (index < data.length) {
            setImmediate(processChunk); // Permetti altre operazioni
        }
    }
    
    processChunk();
}
```

### ❌ DON'T: Non Mischiare Sync e Async

```javascript
// ❌ MALE: Comportamento imprevedibile
function getData(callback) {
    if (cache) {
        callback(cache); // Sincrono
    } else {
        fetchData().then(callback); // Asincrono
    }
}

// ✅ BENE: Sempre asincrono
function getData(callback) {
    if (cache) {
        process.nextTick(() => callback(cache));
    } else {
        fetchData().then(callback);
    }
}
```

### ❌ DON'T: Non Abusare di nextTick

```javascript
// ❌ MALE: Troppi nextTick inutili
function processArray(arr) {
    arr.forEach(item => {
        process.nextTick(() => processItem(item));
    });
}

// ✅ BENE: Usa Promise.all o batch processing
async function processArray(arr) {
    await Promise.all(arr.map(item => processItem(item)));
}
```

## Differenze Browser vs Node.js

### Microtask nei Browser

```javascript
// Nel browser:
console.log('1');

// Microtask (standard Web API)
queueMicrotask(() => {
    console.log('2');
});

// Promise (microtask)
Promise.resolve().then(() => {
    console.log('3');
});

// Macrotask
setTimeout(() => {
    console.log('4');
}, 0);

console.log('1');

// Output browser: 1, 1, 2, 3, 4
```

### Tabella Comparativa

| Caratteristica | Node.js | Browser |
|----------------|---------|---------|
| **process.nextTick()** | ✅ Sì (priorità massima) | ❌ No |
| **Promise microtask** | ✅ Sì | ✅ Sì |
| **queueMicrotask()** | ✅ Sì | ✅ Sì |
| **Priorità nextTick** | Più alta di Promise | N/A |
| **Fasi Event Loop** | 6 fasi + microtask | Task/Microtask |
| **Svuotamento** | Dopo ogni fase | Dopo ogni task |
| **MutationObserver** | ❌ No | ✅ Sì (microtask) |

### Codice Cross-Platform

```javascript
// Funzione che funziona ovunque
function defer(callback) {
    if (typeof process !== 'undefined' && process.nextTick) {
        // Node.js
        process.nextTick(callback);
    } else if (typeof queueMicrotask !== 'undefined') {
        // Browser moderni
        queueMicrotask(callback);
    } else {
        // Fallback
        Promise.resolve().then(callback);
    }
}

// Uso
defer(() => {
    console.log('Deferred callback');
});
```

## Pattern Avanzati

### Pattern 1: Microtask Scheduler

```javascript
class MicrotaskScheduler {
    constructor() {
        this.queue = [];
        this.scheduled = false;
    }
    
    schedule(task, priority = 'normal') {
        this.queue.push({ task, priority });
        this.queue.sort((a, b) => {
            const priorities = { high: 0, normal: 1, low: 2 };
            return priorities[a.priority] - priorities[b.priority];
        });
        
        if (!this.scheduled) {
            this.scheduled = true;
            process.nextTick(() => this.flush());
        }
    }
    
    flush() {
        this.scheduled = false;
        
        while (this.queue.length > 0) {
            const { task } = this.queue.shift();
            
            try {
                task();
            } catch (err) {
                console.error('Task error:', err);
            }
        }
    }
    
    scheduleHigh(task) {
        this.schedule(task, 'high');
    }
    
    scheduleNormal(task) {
        this.schedule(task, 'normal');
    }
    
    scheduleLow(task) {
        this.schedule(task, 'low');
    }
}

// Uso
const scheduler = new MicrotaskScheduler();

scheduler.scheduleLow(() => console.log('Low priority'));
scheduler.scheduleHigh(() => console.log('High priority'));
scheduler.scheduleNormal(() => console.log('Normal priority'));

/* Output:
High priority
Normal priority
Low priority
*/
```

### Pattern 2: Debounced Microtask

```javascript
class DebouncedMicrotask {
    constructor(fn, wait = 0) {
        this.fn = fn;
        this.wait = wait;
        this.timeoutId = null;
        this.pending = [];
    }
    
    call(...args) {
        return new Promise((resolve, reject) => {
            this.pending.push({ args, resolve, reject });
            
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
            }
            
            this.timeoutId = setTimeout(() => {
                this.execute();
            }, this.wait);
        });
    }
    
    execute() {
        const pending = this.pending.splice(0);
        
        // Usa microtask per esecuzione
        process.nextTick(() => {
            const lastCall = pending[pending.length - 1];
            
            try {
                const result = this.fn(...lastCall.args);
                
                // Risolvi tutte le promise pendenti
                pending.forEach(({ resolve }) => resolve(result));
            } catch (err) {
                pending.forEach(({ reject }) => reject(err));
            }
        });
    }
    
    flush() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.execute();
        }
    }
}

// Uso
const debouncedLog = new DebouncedMicrotask(
    (msg) => {
        console.log('Debounced:', msg);
        return msg.toUpperCase();
    },
    100
);

// Chiamate multiple
debouncedLog.call('first');
debouncedLog.call('second');
debouncedLog.call('third').then(result => {
    console.log('Result:', result);
});

/* Output (dopo 100ms):
Debounced: third
Result: THIRD
*/
```

### Pattern 3: Microtask Pool

```javascript
class MicrotaskPool {
    constructor(concurrency = 5) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }
    
    async run(task) {
        // Attendi se pool è pieno
        while (this.running >= this.concurrency) {
            await new Promise(resolve => {
                this.queue.push(resolve);
            });
        }
        
        this.running++;
        
        try {
            // Esegui task come microtask
            return await new Promise((resolve, reject) => {
                process.nextTick(async () => {
                    try {
                        const result = await task();
                        resolve(result);
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        } finally {
            this.running--;
            
            // Sveglia prossimo in attesa
            if (this.queue.length > 0) {
                const resolve = this.queue.shift();
                process.nextTick(resolve);
            }
        }
    }
    
    async all(tasks) {
        return Promise.all(tasks.map(task => this.run(task)));
    }
}

// Uso
const pool = new MicrotaskPool(3);

const tasks = Array.from({ length: 10 }, (_, i) => 
    () => new Promise(resolve => {
        console.log(`Task ${i} executing`);
        setTimeout(() => resolve(i), Math.random() * 100);
    })
);

pool.all(tasks).then(results => {
    console.log('All completed:', results);
});
```

### Pattern 4: Microtask Queue Observer

```javascript
class MicrotaskQueueObserver {
    constructor() {
        this.observers = [];
        this.queueSize = 0;
        this.maxQueueSize = 0;
        
        this.wrapNextTick();
    }
    
    wrapNextTick() {
        const original = process.nextTick;
        const self = this;
        
        process.nextTick = function(callback, ...args) {
            self.queueSize++;
            self.maxQueueSize = Math.max(self.maxQueueSize, self.queueSize);
            
            self.notifyObservers('enqueue', self.queueSize);
            
            const wrapped = function() {
                try {
                    return callback.apply(this, arguments);
                } finally {
                    self.queueSize--;
                    self.notifyObservers('dequeue', self.queueSize);
                }
            };
            
            return original.call(this, wrapped, ...args);
        };
    }
    
    observe(callback) {
        this.observers.push(callback);
        return () => {
            const index = this.observers.indexOf(callback);
            if (index !== -1) {
                this.observers.splice(index, 1);
            }
        };
    }
    
    notifyObservers(event, size) {
        this.observers.forEach(observer => {
            try {
                observer(event, size);
            } catch (err) {
                console.error('Observer error:', err);
            }
        });
    }
    
    getStats() {
        return {
            currentSize: this.queueSize,
            maxSize: this.maxQueueSize
        };
    }
}

// Uso
const observer = new MicrotaskQueueObserver();

observer.observe((event, size) => {
    if (size > 10) {
        console.warn(`⚠️ Large microtask queue: ${size} items`);
    }
});

// Genera molte microtask
for (let i = 0; i < 20; i++) {
    process.nextTick(() => {
        console.log(`Task ${i}`);
    });
}

setTimeout(() => {
    console.log('Stats:', observer.getStats());
}, 100);
```

### Pattern 5: Cooperative Async Iterator

```javascript
class CooperativeAsyncIterator {
    constructor(iterable) {
        this.iterator = iterable[Symbol.iterator]();
    }
    
    async *[Symbol.asyncIterator]() {
        let result;
        let count = 0;
        const yieldEvery = 100;
        
        while (!(result = this.iterator.next()).done) {
            yield result.value;
            
            count++;
            
            // Ogni 100 iterazioni, permetti altre operazioni
            if (count % yieldEvery === 0) {
                await new Promise(resolve => setImmediate(resolve));
            }
        }
    }
}

// Uso
async function processLargeArray() {
    const largeArray = Array.from({ length: 10000 }, (_, i) => i);
    const iterator = new CooperativeAsyncIterator(largeArray);
    
    let sum = 0;
    for await (const value of iterator) {
        sum += value;
    }
    
    console.log('Sum:', sum);
}

processLargeArray();
```

## Esercizi Pratici

### Esercizio 1: Implementare Microtask Batcher

Creare un batcher che raggruppa operazioni sincrone in microtask:

```javascript
class MicrotaskBatcher {
    constructor(processFn) {
        this.processFn = processFn;
        // TODO: Implementare
        // - Accumula items fino a nextTick
        // - Processa batch in una volta
        // - Ritorna Promise per ogni item
    }
    
    add(item) {
        // TODO: Implementare
    }
}

// Test
const batcher = new MicrotaskBatcher((items) => {
    console.log(`Processing ${items.length} items`);
    return items.map(x => x * 2);
});

for (let i = 0; i < 100; i++) {
    batcher.add(i).then(result => {
        if (i % 10 === 0) console.log(`Item ${i}: ${result}`);
    });
}
```

### Esercizio 2: Priority Microtask Queue

Implementare una coda con priorità usando microtask:

```javascript
class PriorityMicrotaskQueue {
    constructor() {
        // TODO: Implementare
        // - 3 livelli di priorità (high, normal, low)
        // - High priority usa nextTick
        // - Normal usa Promise
        // - Low usa queueMicrotask
    }
    
    enqueue(task, priority = 'normal') {
        // TODO: Implementare
    }
}
```

### Esercizio 3: Microtask Timeout

Creare un timeout per microtask che troppo lente:

```javascript
class MicrotaskWithTimeout {
    constructor(timeoutMs = 10) {
        this.timeoutMs = timeoutMs;
        // TODO: Implementare
    }
    
    execute(task) {
        // TODO: Implementare
        // - Esegue task come microtask
        // - Se impiega più di timeoutMs, emette warning
        // - Ritorna Promise con risultato o timeout error
    }
}
```

### Esercizio 4: Microtask Starvation Detector

Implementare un detector che rileva starvation:

```javascript
class StarvationDetector {
    constructor(threshold = 100) {
        this.threshold = threshold;
        // TODO: Implementare
        // - Monitora Event Loop lag
        // - Rileva quando microtask bloccano troppo a lungo
        // - Emette eventi quando rileva problemi
    }
    
    start() {
        // TODO: Implementare
    }
    
    stop() {
        // TODO: Implementare
    }
}
```

### Esercizio 5: Adaptive Microtask Scheduler

Creare uno scheduler che si adatta al carico:

```javascript
class AdaptiveMicrotaskScheduler {
    constructor() {
        // TODO: Implementare
        // - Monitora velocità di esecuzione
        // - Switch tra nextTick e setImmediate
        // - Ottimizza basandosi su metriche
    }
    
    schedule(task) {
        // TODO: Implementare
    }
    
    getMetrics() {
        // TODO: Implementare
    }
}
```

## Domande di Autovalutazione

### Domanda 1
Cosa sono le microtask?

A) Operazioni I/O veloci  
B) Callback ad alta priorità eseguiti prima dell'Event Loop  
C) setTimeout con delay 0  
D) Thread separati

### Domanda 2
Qual è l'ordine di priorità corretto?

A) Promise → nextTick → setTimeout  
B) nextTick → Promise → setTimeout  
C) setTimeout → nextTick → Promise  
D) nextTick → setTimeout → Promise

### Domanda 3
Quando vengono svuotate le microtask?

A) All'inizio di ogni ciclo Event Loop  
B) Alla fine di ogni ciclo Event Loop  
C) Dopo ogni fase dell'Event Loop  
D) Solo dopo il codice sincrono

### Domanda 4
Cosa causa "microtask starvation"?

A) Troppe Promise  
B) Ricorsione infinita con nextTick  
C) setTimeout troppo frequenti  
D) Troppi file I/O

### Domanda 5
process.nextTick() è disponibile nei browser?

A) Sì, in tutti i browser moderni  
B) Solo in Chrome  
C) No, è specifico di Node.js  
D) Sì, ma con nome diverso

### Domanda 6
Quale codice esegue callback consistentemente in modo asincrono?

A) 
```javascript
if (cache) callback(data);
else fetch().then(callback);
```

B)
```javascript
if (cache) process.nextTick(() => callback(data));
else fetch().then(callback);
```

C) Entrambi  
D) Nessuno

### Domanda 7
Qual è la differenza tra nextTick e queueMicrotask?

A) Sono identici  
B) nextTick ha priorità più alta  
C) queueMicrotask è più veloce  
D) nextTick è deprecato

### Domanda 8
Le microtask possono bloccare l'Event Loop?

A) No, mai  
B) Sì, se contengono codice sincrono pesante o ricorsione  
C) Solo in Node.js  
D) Solo nei browser

### Domanda 9
Qual è il modo migliore per evitare microtask starvation?

A) Non usare mai nextTick  
B) Usare setImmediate per operazioni ricorsive  
C) Limitare a 10 nextTick  
D) Usare setTimeout

### Domanda 10
async/await usa le microtask?

A) No, usa setTimeout  
B) Sì, ogni await crea una microtask Promise  
C) Solo in Node.js  
D) Solo per errori

---

## Risposte alle Domande di Autovalutazione

**Domanda 1: B**  
Le microtask sono **callback ad alta priorità** che vengono eseguiti immediatamente dopo il codice sincrono corrente, ma **prima** che l'Event Loop inizi le sue fasi. Hanno priorità assoluta su tutte le operazioni asincrone.

**Domanda 2: B**  
L'ordine corretto è: **nextTick → Promise → setTimeout**. `process.nextTick()` ha la priorità più alta, seguito da Promise microtask, e infine setTimeout che è nella fase timers dell'Event Loop.

**Domanda 3: C**  
Le microtask vengono completamente svuotate **dopo ogni fase dell'Event Loop**. Questo significa che se una microtask crea altre microtask, queste vengono tutte eseguite prima di passare alla fase successiva.

**Domanda 4: B**  
La "microtask starvation" è causata da **ricorsione infinita con nextTick** (o Promise), che impedisce all'Event Loop di progredire alle altre fasi perché la microtask queue non si svuota mai.

**Domanda 5: C**  
**No**, `process.nextTick()` è **specifico di Node.js** e non è disponibile nei browser. Nei browser si usa `queueMicrotask()` o Promise per funzionalità simili.

**Domanda 6: B**  
Solo B garantisce comportamento **consistentemente asincrono**. L'opzione A esegue il callback sincronamente se c'è cache, il che può causare comportamenti imprevedibili.

**Domanda 7: B**  
`process.nextTick()` ha **priorità più alta** di `queueMicrotask()`. nextTick usa una coda separata che viene svuotata prima della coda Promise/queueMicrotask.

**Domanda 8: B**  
Sì, le microtask possono bloccare l'Event Loop se contengono **codice sincrono pesante** o **ricorsione infinita**. Sono callback normali, quindi il codice al loro interno può bloccare l'esecuzione.

**Domanda 9: B**  
Il modo migliore per evitare starvation è usare **setImmediate per operazioni ricorsive** invece di nextTick, perché setImmediate permette all'Event Loop di progredire tra le iterazioni.

**Domanda 10: B**  
Sì, **ogni await crea una microtask Promise**. Quando si usa `await`, il codice dopo l'await viene accodato come Promise microtask e eseguito quando la Promise si risolve.

---

## Conclusioni

Le **microtask** sono uno dei meccanismi più potenti e delicati di Node.js, fornendo controllo granulare sull'ordine di esecuzione del codice asincrono.

### 🎯 Punti Chiave

✅ **Priorità massima** - Eseguite prima dell'Event Loop  
✅ **Due code** - nextTick queue (priorità più alta) e Promise queue  
✅ **Svuotamento completo** - Dopo codice sincrono e dopo ogni fase  
✅ **Rischio starvation** - Ricorsione infinita può bloccare Event Loop  
✅ **Node.js specifico** - process.nextTick() non esiste nei browser  

### ⚠️ Rischi e Precauzioni

1. **Microtask Starvation** - Ricorsione infinita blocca tutto
2. **Performance** - Troppe microtask rallentano l'applicazione
3. **Debugging difficile** - Ordine di esecuzione complesso
4. **Memory pressure** - Accumulo di microtask usa memoria
5. **Comportamento diverso browser/Node** - Attenzione al codice cross-platform

### 🚀 Best Practices Finali

✅ Usa `nextTick` per defer operazioni non critiche  
✅ Preferisci Promise per async operations  
✅ Evita ricorsione infinita con nextTick  
✅ Usa `setImmediate` per operazioni ricorsive  
✅ Mantieni microtask callback veloci  
✅ Monitora Event Loop lag  
✅ Testa performance con carico reale  

### 📊 Quando Usare Cosa

**process.nextTick():**
- Defer operazioni non critiche
- Garantire callback consistentemente asincroni
- Operazioni che devono essere eseguite ASAP

**Promise/async-await:**
- Operazioni asincrone normali
- Gestione errori pulita
- Codice leggibile e manutenibile

**setImmediate():**
- Operazioni ricorsive
- Spezzare task lunghi
- Dopo operazioni I/O

---

## Risorse Aggiuntive

### Documentazione Ufficiale
- [Node.js process.nextTick](https://nodejs.org/api/process.html#process_process_nexttick_callback_args)
- [Event Loop e Microtask](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [MDN queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)

### Approfondimenti
- [Jake Archibald's Event Loop Talk](https://www.youtube.com/watch?v=cCOL7MC4Pl0)
- [Understanding the Event Loop](https://blog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810)

---

**Versione documento**: 1.0  
**Ultimo aggiornamento**: Ottobre 2025  
**Compatibilità**: Node.js tutte le versioni  
**Livello**: Intermedio/Avanzato

---

*"Microtasks are the express lane of Node.js async execution - powerful but dangerous if misused."*