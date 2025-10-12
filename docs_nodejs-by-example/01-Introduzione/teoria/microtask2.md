# Microtask Queue in Node.js

## 🎯 Decision Matrix: Quale API Usare?

| Scenario | API Consigliata | Ragione |
|----------|----------------|---------|
| **Garantire ordine esecuzione dopo sync** | `process.nextTick()` | Priorità massima |
| **Async operation con Promise** | `Promise.then()` / `async-await` | Pattern moderno e chiaro |
| **Compatibilità browser + Node** | `queueMicrotask()` | Standard Web API |
| **Defer dopo I/O** | `setImmediate()` | Non blocca microtask queue |
| **Delay temporale** | `setTimeout()` | Controllo temporale |
| **Rendere callback consistente** | `process.nextTick()` | Evita comportamento sinc/asinc |
| **Operazione CPU-intensive** | `setImmediate()` + chunking | Non starva Event Loop |
| **Batch processing** | `Promise.all()` | Parallelo con Promise |
| **Sequenza operazioni async** | `async/await` | Leggibilità codice |
| **Event emission** | `process.nextTick()` | Garantisci listener pronti |

### Flow Chart Decisionale

```
Devo eseguire codice asincrono...
│
├─ È URGENTE dopo il codice sync?
│  └─ Sì → process.nextTick()
│
├─ È una Promise chain?
│  └─ Sì → .then() / async-await
│
├─ Deve funzionare anche nel browser?
│  └─ Sì → queueMicrotask()
│
├─ Deve aspettare I/O completion?
│  └─ Sì → setImmediate()
│
└─ Deve aspettare un tempo specifico?
   └─ Sì → setTimeout(fn, ms)
```

---

## 📊 Microtask nei Framework Popolari

### Express.js

```javascript
const express = require('express');
const app = express();

// Middleware che usa microtask per logging asincrono
app.use((req, res, next) => {
    const start = Date.now();
    
    // Continua immediatamente
    next();
    
    // Log asincrono dopo la risposta
    res.on('finish', () => {
        process.nextTick(() => {
            const duration = Date.now() - start;
            console.log(`${req.method} ${req.url} - ${duration}ms`);
        });
    });
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await db.users.findAll();
        res.json(users);
    } catch (err) {
        // Error handling con microtask
        process.nextTick(() => {
            logger.error('Database error', err);
        });
        res.status(500).json({ error: 'Internal error' });
    }
});
```

### Next.js

```javascript
// pages/api/data.js
export default async function handler(req, res) {
    try {
        const data = await fetchData();
        
        // Risposta immediata
        res.status(200).json(data);
        
        // Analytics asincrono (non blocca risposta)
        queueMicrotask(() => {
            trackPageView(req);
            updateCache(data);
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
```

### Fastify

```javascript
const fastify = require('fastify')();

// Hook che usa microtask
fastify.addHook('onRequest', async (request, reply) => {
    request.startTime = Date.now();
});

fastify.addHook('onResponse', async (request, reply) => {
    // Defer logging
    process.nextTick(() => {
        const duration = Date.now() - request.startTime;
        fastify.log.info({ 
            url: request.url, 
            duration 
        });
    });
});

fastify.get('/users', async (request, reply) => {
    const users = await db.users.findAll();
    return users;
});
```

---

## 🧪 Testing delle Microtask

### Test con Jest

```javascript
// userService.test.js
describe('UserService', () => {
    test('should process user data asynchronously', async () => {
        const userId = 1;
        
        // Mock database
        const mockUser = { id: 1, name: 'Mario' };
        jest.spyOn(db, 'getUser').mockResolvedValue(mockUser);
        
        // Testa microtask
        const promise = userService.getUser(userId);
        
        // Ancora pending
        expect(db.getUser).toHaveBeenCalledWith(userId);
        
        // Flush microtask
        await promise;
        
        // Ora completato
        const result = await promise;
        expect(result).toEqual(mockUser);
    });
    
    test('should handle nextTick callbacks', (done) => {
        let executed = false;
        
        process.nextTick(() => {
            executed = true;
            expect(executed).toBe(true);
            done();
        });
        
        // Non ancora eseguito
        expect(executed).toBe(false);
    });
});
```

### Test Ordine di Esecuzione

```javascript
test('execution order', async () => {
    const order = [];
    
    order.push('1-sync-start');
    
    setTimeout(() => order.push('5-timeout'), 0);
    
    Promise.resolve().then(() => order.push('3-promise'));
    
    process.nextTick(() => order.push('2-nextTick'));
    
    setImmediate(() => order.push('6-immediate'));
    
    queueMicrotask(() => order.push('4-queueMicrotask'));
    
    order.push('1-sync-end');
    
    // Aspetta che tutto sia completato
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(order).toEqual([
        '1-sync-start',
        '1-sync-end',
        '2-nextTick',
        '3-promise',
        '4-queueMicrotask',
        '5-timeout',
        '6-immediate'
    ]);
});
```

### Mock di process.nextTick

```javascript
describe('with mocked nextTick', () => {
    let originalNextTick;
    let nextTickCallbacks = [];
    
    beforeEach(() => {
        originalNextTick = process.nextTick;
        nextTickCallbacks = [];
        
        // Mock nextTick
        process.nextTick = jest.fn((callback) => {
            nextTickCallbacks.push(callback);
        });
    });
    
    afterEach(() => {
        process.nextTick = originalNextTick;
    });
    
    test('should defer execution', () => {
        let executed = false;
        
        process.nextTick(() => {
            executed = true;
        });
        
        expect(executed).toBe(false);
        expect(nextTickCallbacks).toHaveLength(1);
        
        // Esegui manualmente
        nextTickCallbacks[0]();
        expect(executed).toBe(true);
    });
});
```

---

## 🧠 Quiz di Autovalutazione

### Domanda 1: Ordine di Esecuzione

```javascript
console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

process.nextTick(() => console.log('D'));

queueMicrotask(() => console.log('E'));

console.log('F');
```

**Qual è l'output?**

<details>
<summary>Mostra risposta</summary>

```
A
F
D
C
E
B
```

**Spiegazione:**
1. `A`, `F` - codice sincrono
2. `D` - `process.nextTick()` (priorità massima)
3. `C` - Promise microtask
4. `E` - `queueMicrotask()`
5. `B` - `setTimeout()` (macrotask)

</details>

### Domanda 2: nextTick vs Promise

```javascript
process.nextTick(() => {
    console.log('nextTick 1');
    
    process.nextTick(() => {
        console.log('nextTick 2');
    });
});

Promise.resolve().then(() => {
    console.log('Promise 1');
    
    return Promise.resolve();
}).then(() => {
    console.log('Promise 2');
});
```

**Qual è l'ordine?**

<details>
<summary>Mostra risposta</summary>

```
nextTick 1
nextTick 2
Promise 1
Promise 2
```

**Spiegazione:** 
- `process.nextTick()` svuota TUTTA la nextTick queue prima di passare alle Promise
- Le Promise annidate vengono aggiunte alla coda Promise

</details>

### Domanda 3: Microtask Starvation

```javascript
function recursiveNextTick(count = 0) {
    console.log('Iteration:', count);
    
    if (count < 1000) {
        process.nextTick(() => recursiveNextTick(count + 1));
    }
}

setTimeout(() => console.log('Timer!'), 0);

recursiveNextTick();
```

**Cosa succede al setTimeout?**

<details>
<summary>Mostra risposta</summary>

Il `setTimeout()` **NON viene mai eseguito** finché `recursiveNextTick()` non completa tutte le 1000 iterazioni!

**Motivo:** La microtask queue viene svuotata completamente prima di passare all'Event Loop (timers). Questo è chiamato **microtask starvation**.

**Soluzione:**
```javascript
function recursiveNextTick(count = 0) {
    console.log('Iteration:', count);
    
    if (count < 1000) {
        setImmediate(() => recursiveNextTick(count + 1)); // ✅ Meglio
    }
}
```

</details>

### Domanda 4: Quale API Usare?

Per ogni scenario, scegli l'API corretta:

**A) Voglio garantire che tutti gli event listener siano registrati prima di emettere un evento**

<details>
<summary>Risposta</summary>

✅ `process.nextTick()`

```javascript
class EventEmitter {
    emit(event, data) {
        process.nextTick(() => {
            // Garantisce che tutti i listener siano pronti
            this.listeners[event].forEach(cb => cb(data));
        });
    }
}
```
</details>

**B) Sto scrivendo una libreria che deve funzionare sia in Node che nel browser**

<details>
<summary>Risposta</summary>

✅ `queueMicrotask()`

```javascript
function deferExecution(callback) {
    queueMicrotask(callback); // Funziona ovunque
}
```
</details>

**C) Ho un'operazione CPU-intensive da 5 secondi che non voglio blocchi l'Event Loop**

<details>
<summary>Risposta</summary>

✅ `setImmediate()` con chunking

```javascript
function heavyWork(data, chunkSize = 1000) {
    let index = 0;
    
    function processChunk() {
        const end = Math.min(index + chunkSize, data.length);
        
        for (let i = index; i < end; i++) {
            // Lavoro pesante
        }
        
        index = end;
        
        if (index < data.length) {
            setImmediate(processChunk);
        }
    }
    
    processChunk();
}
```
</details>

### Domanda 5: Async/Await e Microtask

```javascript
async function test() {
    console.log('1');
    
    await Promise.resolve();
    
    console.log('2');
}

console.log('A');
test();
console.log('B');
```

**Qual è l'output?**

<details>
<summary>Mostra risposta</summary>

```
A
1
B
2
```

**Spiegazione:**
1. `A` - sincrono
2. `1` - sincrono dentro async (prima di await)
3. `B` - sincrono (test() ritorna Promise pending)
4. `2` - microtask (dopo await)

`await` trasforma tutto il codice successivo in un `.then()` callback!

</details>

### Domanda 6: Error Handling

```javascript
process.nextTick(() => {
    throw new Error('Errore!');
});

Promise.resolve()
    .then(() => {
        throw new Error('Errore Promise!');
    });

console.log('Fine');
```

**Quali errori vengono catturati?**

<details>
<summary>Mostra risposta</summary>

**Nessuno dei due!** Entrambi causano un **unhandled error**.

**Correzione:**

```javascript
// nextTick - wrap in try/catch
process.nextTick(() => {
    try {
        throw new Error('Errore!');
    } catch (err) {
        console.error('Catturato:', err);
    }
});

// Promise - usa .catch()
Promise.resolve()
    .then(() => {
        throw new Error('Errore Promise!');
    })
    .catch(err => {
        console.error('Catturato:', err);
    });

// O global handler
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});
```

</details>

---

## 💪 Esercizi Pratici

### Esercizio 1: Implementa un Debouncer con Microtask

Crea una funzione `debounce()` che usa microtask per ritardare l'esecuzione:

```javascript
const debounced = debounce(() => {
    console.log('Eseguito!');
}, 100);

debounced();
debounced();
debounced();
// Dovrebbe eseguire console.log solo 1 volta dopo 100ms
```

<details>
<parameter name="newString">(summary>Soluzione</summary>

```javascript
function debounce(fn, delay) {
    let timeoutId = null;
    let pendingArgs = null;
    
    return function(...args) {
        pendingArgs = args;
        
        // Cancella timeout precedente
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        // Nuovo timeout
        timeoutId = setTimeout(() => {
            // Usa microtask per esecuzione immediata dopo delay
            queueMicrotask(() => {
                fn.apply(this, pendingArgs);
                timeoutId = null;
                pendingArgs = null;
            });
        }, delay);
    };
}

// Test
const debounced = debounce((msg) => {
    console.log('Eseguito:', msg);
}, 100);

debounced('chiamata 1');
debounced('chiamata 2');
debounced('chiamata 3');

// Output (dopo 100ms): "Eseguito: chiamata 3"
```

**Variante con Promise:**

```javascript
function debounceAsync(fn, delay) {
    let timeoutId = null;
    let pendingResolve = null;
    
    return function(...args) {
        // Cancella timeout precedente
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        
        return new Promise((resolve) => {
            pendingResolve = resolve;
            
            timeoutId = setTimeout(async () => {
                const result = await fn.apply(this, args);
                queueMicrotask(() => {
                    pendingResolve(result);
                });
            }, delay);
        });
    };
}

// Test
const debouncedAsync = debounceAsync(async (query) => {
    console.log('Searching for:', query);
    return `Results for ${query}`;
}, 300);

debouncedAsync('a');
debouncedAsync('ab');
const result = await debouncedAsync('abc');
console.log(result); // "Results for abc"
```

</details>

### Esercizio 2: Task Scheduler con Priorità

Implementa uno scheduler che esegue task con priorità diverse:

```javascript
const scheduler = new PriorityScheduler();

scheduler.add('low', () => console.log('Low priority'));
scheduler.add('high', () => console.log('High priority'));
scheduler.add('normal', () => console.log('Normal priority'));

scheduler.run();

// Output atteso:
// High priority
// Normal priority
// Low priority
```

<details>
<summary>Soluzione</summary>

```javascript
class PriorityScheduler {
    constructor() {
        this.queues = {
            high: [],
            normal: [],
            low: []
        };
    }
    
    add(priority, task) {
        if (!this.queues[priority]) {
            throw new Error(`Invalid priority: ${priority}`);
        }
        
        this.queues[priority].push(task);
    }
    
    run() {
        // High priority - nextTick
        this.queues.high.forEach(task => {
            process.nextTick(task);
        });
        
        // Normal priority - Promise microtask
        this.queues.normal.forEach(task => {
            queueMicrotask(task);
        });
        
        // Low priority - setImmediate
        this.queues.low.forEach(task => {
            setImmediate(task);
        });
        
        // Clear queues
        this.queues.high = [];
        this.queues.normal = [];
        this.queues.low = [];
    }
}

// Test completo
const scheduler = new PriorityScheduler();

console.log('Start');

scheduler.add('low', () => console.log('4. Low priority'));
scheduler.add('high', () => console.log('2. High priority'));
scheduler.add('normal', () => console.log('3. Normal priority'));
scheduler.add('high', () => console.log('2. Another high'));

console.log('1. Sync code');

scheduler.run();

console.log('1. End sync');

/* Output:
Start
1. Sync code
1. End sync
2. High priority
2. Another high
3. Normal priority
4. Low priority
*/
```

**Variante con async/await:**

```javascript
class AsyncPriorityScheduler {
    constructor() {
        this.queues = {
            high: [],
            normal: [],
            low: []
        };
    }
    
    add(priority, task) {
        this.queues[priority].push(task);
    }
    
    async run() {
        // Esegui high priority
        for (const task of this.queues.high) {
            await new Promise(resolve => {
                process.nextTick(async () => {
                    await task();
                    resolve();
                });
            });
        }
        
        // Esegui normal priority
        for (const task of this.queues.normal) {
            await new Promise(resolve => {
                queueMicrotask(async () => {
                    await task();
                    resolve();
                });
            });
        }
        
        // Esegui low priority
        for (const task of this.queues.low) {
            await new Promise(resolve => {
                setImmediate(async () => {
                    await task();
                    resolve();
                });
            });
        }
    }
}
```

</details>

### Esercizio 3: Async Queue Processor

Crea una coda che processa task asincroni uno alla volta:

```javascript
const queue = new AsyncQueue();

queue.enqueue(async () => {
    await delay(100);
    console.log('Task 1');
});

queue.enqueue(async () => {
    await delay(50);
    console.log('Task 2');
});

queue.process();
```

<details>
<summary>Soluzione</summary>

```javascript
class AsyncQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    
    enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            
            if (!this.processing) {
                this.process();
            }
        });
    }
    
    async process() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            const { task, resolve, reject } = this.queue.shift();
            
            try {
                // Usa microtask per gestione asincrona
                const result = await new Promise((res, rej) => {
                    queueMicrotask(async () => {
                        try {
                            const value = await task();
                            res(value);
                        } catch (err) {
                            rej(err);
                        }
                    });
                });
                
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }
        
        this.processing = false;
    }
}

// Utility function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test completo
async function testQueue() {
    const queue = new AsyncQueue();
    
    console.log('Start');
    
    const promise1 = queue.enqueue(async () => {
        console.log('Task 1 started');
        await delay(100);
        console.log('Task 1 completed');
        return 'Result 1';
    });
    
    const promise2 = queue.enqueue(async () => {
        console.log('Task 2 started');
        await delay(50);
        console.log('Task 2 completed');
        return 'Result 2';
    });
    
    const promise3 = queue.enqueue(async () => {
        console.log('Task 3 started');
        await delay(75);
        console.log('Task 3 completed');
        return 'Result 3';
    });
    
    const results = await Promise.all([promise1, promise2, promise3]);
    console.log('All done:', results);
}

testQueue();

/* Output:
Start
Task 1 started
Task 1 completed
Task 2 started
Task 2 completed
Task 3 started
Task 3 completed
All done: [ 'Result 1', 'Result 2', 'Result 3' ]
*/
```

**Con limiteultaneous:**

```javascript
class ConcurrentAsyncQueue {
    constructor(concurrency = 2) {
        this.concurrency = concurrency;
        this.queue = [];
        this.running = 0;
    }
    
    enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.process();
        });
    }
    
    async process() {
        while (this.running < this.concurrency && this.queue.length > 0) {
            const { task, resolve, reject } = this.queue.shift();
            this.running++;
            
            queueMicrotask(async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (err) {
                    reject(err);
                } finally {
                    this.running--;
                    this.process();
                }
            });
        }
    }
}
```

</details>

### Esercizio 4: Event Loop Monitor

Implementa un monitor che rileva quando le microtask bloccano troppo a lungo:

<details>
<summary>Soluzione</summary>

```javascript
class EventLoopMonitor {
    constructor(options = {}) {
        this.threshold = options.threshold || 50; // ms
        this.interval = options.interval || 1000; // ms
        this.onWarning = options.onWarning || console.warn;
        this.monitoring = false;
        this.stats = {
            microtaskLag: 0,
            macrotaskLag: 0,
            warnings: 0
        };
    }
    
    start() {
        if (this.monitoring) return;
        
        this.monitoring = true;
        this.monitor();
    }
    
    stop() {
        this.monitoring = false;
    }
    
    monitor() {
        if (!this.monitoring) return;
        
        const startMicro = process.hrtime.bigint();
        
        // Misura microtask lag
        queueMicrotask(() => {
            const endMicro = process.hrtime.bigint();
            const microLag = Number(endMicro - startMicro) / 1e6; // ms
            
            this.stats.microtaskLag = microLag;
            
            if (microLag > this.threshold) {
                this.stats.warnings++;
                this.onWarning({
                    type: 'microtask',
                    lag: microLag,
                    threshold: this.threshold,
                    timestamp: new Date()
                });
            }
        });
        
        // Misura macrotask lag
        const startMacro = process.hrtime.bigint();
        
        setImmediate(() => {
            const endMacro = process.hrtime.bigint();
            const macroLag = Number(endMacro - startMacro) / 1e6;
            
            this.stats.macrotaskLag = macroLag;
            
            if (macroLag > this.threshold * 2) {
                this.stats.warnings++;
                this.onWarning({
                    type: 'macrotask',
                    lag: macroLag,
                    threshold: this.threshold * 2,
                    timestamp: new Date()
                });
            }
        });
        
        // Continua monitoring
        setTimeout(() => this.monitor(), this.interval);
    }
    
    getStats() {
        return { ...this.stats };
    }
    
    reset() {
        this.stats = {
            microtaskLag: 0,
            macrotaskLag: 0,
            warnings: 0
        };
    }
}

// Test
const monitor = new EventLoopMonitor({
    threshold: 10, // 10ms
    interval: 100,
    onWarning: (warning) => {
        console.warn(`⚠️  ${warning.type} lag: ${warning.lag.toFixed(2)}ms`);
    }
});

monitor.start();

// Simula lavoro bloccante
function blockingWork(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
        // Blocca
    }
}

// Dopo 500ms, fai lavoro bloccante
setTimeout(() => {
    console.log('Starting blocking work...');
    
    // Blocca con microtask
    process.nextTick(() => {
        blockingWork(30); // 30ms di blocco
    });
    
    // Blocca con macrotask
    setImmediate(() => {
        blockingWork(50); // 50ms di blocco
    });
}, 500);

// Stop dopo 3 secondi
setTimeout(() => {
    monitor.stop();
    console.log('Final stats:', monitor.getStats());
}, 3000);
```

**Versione avanzata con histogram:**

```javascript
class AdvancedEventLoopMonitor extends EventLoopMonitor {
    constructor(options) {
        super(options);
        this.histogram = {
            microtask: [],
            macrotask: []
        };
    }
    
    monitor() {
        // ... codice precedente ...
        
        queueMicrotask(() => {
            const endMicro = process.hrtime.bigint();
            const microLag = Number(endMicro - startMicro) / 1e6;
            
            // Aggiungi al histogram
            this.histogram.microtask.push(microLag);
            if (this.histogram.microtask.length > 100) {
                this.histogram.microtask.shift();
            }
            
            // ... resto del codice
        });
    }
    
    getPercentile(type, percentile) {
        const sorted = [...this.histogram[type]].sort((a, b) => a - b);
        const index = Math.floor(sorted.length * percentile / 100);
        return sorted[index] || 0;
    }
    
    getReport() {
        return {
            microtask: {
                p50: this.getPercentile('microtask', 50),
                p95: this.getPercentile('microtask', 95),
                p99: this.getPercentile('microtask', 99),
                max: Math.max(...this.histogram.microtask)
            },
            macrotask: {
                p50: this.getPercentile('macrotask', 50),
                p95: this.getPercentile('macrotask', 95),
                p99: this.getPercentile('macrotask', 99),
                max: Math.max(...this.histogram.macrotask)
            }
        };
    }
}
```

</details>

---

## 📚 Risorse Aggiuntive

### 📖 Documentazione Ufficiale

- [Node.js Process](https://nodejs.org/api/process.html#process_process_nexttick_callback_args)
- [MDN - queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)
- [HTML Standard - Microtask Queue](https://html.spec.whatwg.org/multipage/webappapis.html#microtask-queue)
- [V8 Blog - Faster async functions](https://v8.dev/blog/fast-async)

### 📹 Video Consigliati

- [Jake Archibald on the Event Loop](https://www.youtube.com/watch?v=cCOL7MC4Pl0) - Eccellente spiegazione visuale
- [Philip Roberts: What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ)
- [Node.js Internals Deep Dive](https://www.youtube.com/watch?v=sGTRmPiXD4Y)

### 📖 Articoli Tecnici

- [Understanding process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Microtasks and Macrotasks](https://javascript.info/event-loop)
- [Don't Block the Event Loop](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)
- [Node.js Event Loop Best Practices](https://blog.risingstack.com/node-js-at-scale-understanding-node-js-event-loop/)

### 🛠️ Tool Utili

- [Clinic.js](https://clinicjs.org/) - Performance profiling
- [0x](https://github.com/davidmarkclements/0x) - Flamegraph profiler  
- [node --prof](https://nodejs.org/en/docs/guides/simple-profiling/) - Built-in profiler
- [async_hooks](https://nodejs.org/api/async_hooks.html) - Track async operations

---

## 🎯 Riepilogo Chiave

### ✅ Concetti Fondamentali

1. **Microtask Queue = Priorità Assoluta**
   - Eseguita PRIMA di qualsiasi fase dell'Event Loop
   - Svuotata completamente prima di continuare

2. **Gerarchia di Priorità**
   ```
   1. Codice sincrono
   2. process.nextTick() ⭐⭐⭐
   3. Promise callbacks ⭐⭐
   4. queueMicrotask() ⭐⭐
   ────────────────────────────
   5. Event Loop phases (timers, I/O, setImmediate...)
   ```

3. **process.nextTick() vs Promise**
   - `nextTick()` = priorità più alta
   - Promise = microtask standard
   - Entrambi eseguiti prima dell'Event Loop

4. **Microtask Starvation**
   - Troppi nextTick ricorsivi bloccano l'Event Loop
   - Soluzione: usa `setImmediate()` per operazioni lunghe

### 🚀 Best Practices

| ✅ DO | ❌ DON'T |
|-------|----------|
| Usa `process.nextTick()` per garantire ordine | Non creare ricorsione infinita con nextTick |
| Usa `Promise` per operazioni async moderne | Non ignorare errori nelle Promise |
| Usa `queueMicrotask()` per compatibilità browser | Non bloccare con operazioni CPU-intensive |
| Gestisci sempre gli errori con `.catch()` | Non mixare callback sync/async |
| Suddividi lavoro pesante con `setImmediate()` | Non abusare di microtask per tutto |
| Monitora Event Loop lag in produzione | Non assumere ordine tra setTimeout e setImmediate |

### 📊 Quando Usare Cosa

```javascript
// 🎯 Garantire ordine dopo sync
process.nextTick(() => {});

// 🎯 Operazioni async moderne
async function() {
    await promise;
}

// 🎯 Compatibilità browser
queueMicrotask(() => {});

// 🎯 Defer dopo I/O
setImmediate(() => {});

// 🎯 Delay temporale
setTimeout(() => {}, ms);
```

### 🔄 Pattern Comuni

**1. Rendere callback consistente:**
```javascript
function getData(useCache, callback) {
    if (useCache) {
        process.nextTick(() => callback(null, cache));
    } else {
        db.query(callback);
    }
}
```

**2. Garantire listener pronti:**
```javascript
class Emitter {
    emit(event, data) {
        process.nextTick(() => {
            this._listeners[event].forEach(cb => cb(data));
        });
    }
}
```

**3. Batch processing:**
```javascript
async function processBatch(items) {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(process));
        await new Promise(resolve => setImmediate(resolve));
    }
}
```

---

