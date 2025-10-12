# setTimeout() e setInterval() in Node.js

## 📚 Obiettivi di Apprendimento

Al termine di questa guida saprai:
- Differenza tra setTimeout() e setInterval()
- Come funzionano nella fase Timers dell'Event Loop
- Gestire correttamente timeout e intervalli
- Clearare timer per evitare memory leak
- Usare timer nei pattern async/await moderni
- Best practices e antipattern comuni
- Alternative moderne (setImmediate, Promises)

---

## 🎯 Introduzione ai Timer in Node.js

I timer sono funzioni che permettono di **pianificare l'esecuzione di codice in un momento futuro**. Node.js eredita `setTimeout()` e `setInterval()` dal browser JavaScript, ma con alcune differenze importanti nell'implementazione.

### 📖 Analogia del Mondo Reale

```
⏰ SVEGLIA (setTimeout)
┌────────────────────────────────┐
│ "Suona TRA 30 minuti"          │
│    ↓                           │
│ [Timer attivo]                 │
│    ↓                           │
│ RING! (callback eseguito)      │ ← UNA VOLTA
│ [Timer terminato]              │
└────────────────────────────────┘

⏲️ METRONOMO (setInterval)
┌────────────────────────────────┐
│ "Suona OGNI 30 secondi"        │
│    ↓                           │
│ TICK! (callback eseguito)      │ ← RIPETUTO
│    ↓                           │
│ TICK! (callback eseguito)      │
│    ↓                           │
│ TICK! (callback eseguito)      │
│ ...                            │
│ [Fino a clearInterval()]       │
└────────────────────────────────┘
```

---

## ⏱️ setTimeout()

### Sintassi

```javascript
setTimeout(callback, delay[, ...args])
```

**Parametri:**
- `callback` (Function): Funzione da eseguire
- `delay` (Number): Millisecondi di attesa (default: 0)
- `...args` (any): Argomenti da passare al callback

**Ritorna:** `Timeout` object (usato per cancellare il timer)

### 💻 Esempi Base

#### 1. Timeout Semplice

```javascript
console.log('Start');

setTimeout(() => {
    console.log('Executed after 1 second');
}, 1000);

console.log('End');

// Output:
// Start
// End
// Executed after 1 second  (dopo ~1 sec)
```

#### 2. Con Argomenti

```javascript
function greet(name, age) {
    console.log(`Hello ${name}, you are ${age} years old`);
}

setTimeout(greet, 1000, 'Mario', 30);

// Output (dopo 1 sec):
// Hello Mario, you are 30 years old
```

#### 3. Timeout Zero (setTimeout(0))

```javascript
console.log('1. Sync');

setTimeout(() => {
    console.log('3. Timer (0ms)');
}, 0);

console.log('2. Sync end');

// Output:
// 1. Sync
// 2. Sync end
// 3. Timer (0ms)
```

**Perché?** Anche con delay 0, il callback va nella **fase Timers** dell'Event Loop, quindi dopo tutto il codice sincrono.

#### 4. Timeout Annidati

```javascript
setTimeout(() => {
    console.log('First (1s)');
    
    setTimeout(() => {
        console.log('Second (nested 1s)');
    }, 1000);
}, 1000);

// Output:
// First (1s)         (dopo ~1 sec)
// Second (nested 1s) (dopo ~2 sec totali)
```

### 🎯 Cancellare un Timeout

```javascript
// Salva il riferimento
const timeoutId = setTimeout(() => {
    console.log('This will NOT execute');
}, 5000);

// Cancella prima che scada
clearTimeout(timeoutId);

console.log('Timeout cancelled');
```

#### Pattern: Timeout Condizionale

```javascript
let timeoutId;

function startOperation() {
    timeoutId = setTimeout(() => {
        console.log('Operation timed out');
    }, 3000);
}

function completeOperation() {
    // Se completa in tempo, cancella timeout
    clearTimeout(timeoutId);
    console.log('Operation completed successfully');
}

startOperation();

// Simula completamento veloce
setTimeout(() => {
    completeOperation();
}, 1000);

// Output:
// Operation completed successfully
// (NO timeout message)
```

---

## 🔁 setInterval()

### Sintassi

```javascript
setInterval(callback, delay[, ...args])
```

**Parametri:**
- `callback` (Function): Funzione da eseguire ripetutamente
- `delay` (Number): Millisecondi tra ogni esecuzione
- `...args` (any): Argomenti da passare al callback

**Ritorna:** `Timeout` object (usato per cancellare l'intervallo)

### 💻 Esempi Base

#### 1. Intervallo Semplice

```javascript
let count = 0;

const intervalId = setInterval(() => {
    count++;
    console.log(`Tick ${count}`);
    
    if (count >= 5) {
        clearInterval(intervalId);
        console.log('Interval stopped');
    }
}, 1000);

// Output (ogni secondo):
// Tick 1
// Tick 2
// Tick 3
// Tick 4
// Tick 5
// Interval stopped
```

#### 2. Orologio

```javascript
const intervalId = setInterval(() => {
    const now = new Date();
    console.log(now.toLocaleTimeString());
}, 1000);

// Ferma dopo 10 secondi
setTimeout(() => {
    clearInterval(intervalId);
    console.log('Clock stopped');
}, 10000);

// Output (ogni secondo):
// 14:30:00
// 14:30:01
// 14:30:02
// ...
```

#### 3. Con Argomenti

```javascript
function countdown(name, start) {
    console.log(`${name}: ${start}`);
}

let counter = 10;

const intervalId = setInterval((name) => {
    countdown(name, counter);
    counter--;
    
    if (counter < 0) {
        clearInterval(intervalId);
        console.log('Liftoff! 🚀');
    }
}, 1000, 'Rocket');

// Output (ogni secondo):
// Rocket: 10
// Rocket: 9
// ...
// Rocket: 0
// Liftoff! 🚀
```

### 🎯 Cancellare un Intervallo

```javascript
const intervalId = setInterval(() => {
    console.log('Tick');
}, 1000);

// Ferma dopo 5 secondi
setTimeout(() => {
    clearInterval(intervalId);
    console.log('Stopped');
}, 5000);
```

---

## ⚖️ setTimeout vs setInterval

### Tabella Comparativa

| Caratteristica | setTimeout | setInterval |
|---------------|------------|-------------|
| **Esecuzioni** | Una sola volta | Ripetute |
| **Cancellazione** | clearTimeout() | clearInterval() |
| **Delay preciso** | ✅ Sì | ⚠️ No (vedi drift) |
| **Memory safe** | ✅ Auto-cleanup | ❌ Richiede clear |
| **Pattern moderno** | async/await friendly | ❌ Difficile |

### Differenze Chiave

#### 1. Timing Drift in setInterval

```javascript
// ❌ PROBLEMA: setInterval NON garantisce timing preciso
let executions = [];

const start = Date.now();

const intervalId = setInterval(() => {
    executions.push(Date.now() - start);
    
    // Simula lavoro pesante (50ms)
    const end = Date.now() + 50;
    while (Date.now() < end) {}
    
    if (executions.length >= 5) {
        clearInterval(intervalId);
        console.log('Expected delays: [100, 200, 300, 400, 500]');
        console.log('Actual delays:  ', executions);
    }
}, 100);

// Output:
// Expected delays: [100, 200, 300, 400, 500]
// Actual delays:   [101, 202, 303, 404, 505]
// ↑ Il drift si accumula!
```

#### 2. setTimeout Ricorsivo (Alternativa Migliore)

```javascript
// ✅ SOLUZIONE: setTimeout ricorsivo mantiene timing preciso
let executions = [];
const start = Date.now();
let count = 0;

function recursiveTimeout() {
    executions.push(Date.now() - start);
    
    // Simula lavoro pesante (50ms)
    const end = Date.now() + 50;
    while (Date.now() < end) {}
    
    count++;
    
    if (count < 5) {
        setTimeout(recursiveTimeout, 100);
    } else {
        console.log('Expected delays: [100, 200, 300, 400, 500]');
        console.log('Actual delays:  ', executions);
    }
}

setTimeout(recursiveTimeout, 100);

// Output:
// Expected delays: [100, 200, 300, 400, 500]
// Actual delays:   [100, 250, 400, 550, 700]
// ↑ Aspetta sempre 100ms DOPO il completamento
```

---

## 🔄 Timer nell'Event Loop

### Posizione nella Fase Timers

```
┌───────────────────────────┐
┌─>│  ⏱️ TIMERS               │ ← setTimeout, setInterval
│  │  - Esegue callback      │
│  │    con delay scaduto    │
│  └─────────┬─────────────┘
│            │
│  ┌─────────▼─────────────┐
│  │  PENDING CALLBACKS     │
│  └─────────┬─────────────┘
│            │
│  ┌─────────▼─────────────┐
│  │  IDLE, PREPARE         │
│  └─────────┬─────────────┘
│            │
│  ┌─────────▼─────────────┐
│  │  POLL                  │
│  │  - Calcola quanto      │
│  │    aspettare           │
│  │  - Processa I/O        │
│  └─────────┬─────────────┘
│            │
│  ┌─────────▼─────────────┐
│  │  CHECK                 │
│  └─────────┬─────────────┘
│            │
│  ┌─────────▼─────────────┐
│  │  CLOSE CALLBACKS       │
│  └─────────┬─────────────┘
│            │
└────────────┘
```

### Ordine di Esecuzione

```javascript
console.log('1. Start');

setTimeout(() => {
    console.log('3. Timer 1 (0ms)');
}, 0);

setTimeout(() => {
    console.log('4. Timer 2 (0ms)');
}, 0);

setImmediate(() => {
    console.log('5. Immediate');
});

console.log('2. End');

// Output (ordine garantito per timer):
// 1. Start
// 2. End
// 3. Timer 1 (0ms)
// 4. Timer 2 (0ms)
// 5. Immediate (o prima dei timer, dipende)
```

### Timer e Microtask

```javascript
console.log('1. Sync');

setTimeout(() => {
    console.log('4. Timer');
    
    Promise.resolve().then(() => {
        console.log('5. Promise in timer');
    });
}, 0);

Promise.resolve().then(() => {
    console.log('3. Promise');
});

process.nextTick(() => {
    console.log('2. NextTick');
});

// Output:
// 1. Sync
// 2. NextTick
// 3. Promise
// 4. Timer
// 5. Promise in timer
```

---

## ⚠️ Problemi Comuni e Antipattern

### ❌ 1. Dimenticare clearInterval (Memory Leak)

```javascript
// ❌ MALE: Memory leak!
function startPolling() {
    setInterval(() => {
        checkServer();
    }, 5000);
}

startPolling(); // Intervallo mai fermato!

// ✅ MEGLIO: Salva riferimento
let pollingInterval;

function startPolling() {
    pollingInterval = setInterval(() => {
        checkServer();
    }, 5000);
}

function stopPolling() {
    clearInterval(pollingInterval);
}

// ✅ ANCORA MEGLIO: Cleanup automatico
class Poller {
    start() {
        this.intervalId = setInterval(() => {
            this.check();
        }, 5000);
    }
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    check() {
        console.log('Checking...');
    }
}

const poller = new Poller();
poller.start();

// Cleanup
process.on('SIGTERM', () => {
    poller.stop();
    process.exit(0);
});
```

### ❌ 2. setInterval con Operazioni Async Non Controllate

```javascript
// ❌ MALE: Può causare overlapping
setInterval(async () => {
    await slowOperation(); // Se impiega > 5 sec, si sovrappone!
}, 5000);

// ✅ MEGLIO: setTimeout ricorsivo
async function recursiveCheck() {
    await slowOperation();
    setTimeout(recursiveCheck, 5000); // Aspetta DOPO il completamento
}

recursiveCheck();

// ✅ ANCORA MEGLIO: Con error handling
async function safeRecursiveCheck() {
    try {
        await slowOperation();
    } catch (err) {
        console.error('Operation failed:', err);
    } finally {
        setTimeout(safeRecursiveCheck, 5000);
    }
}

safeRecursiveCheck();
```

### ❌ 3. Timing Non Preciso

```javascript
// ❌ MALE: Assumere precisione millisecondi
setTimeout(() => {
    console.log('Executed exactly after 100ms'); // NON garantito!
}, 100);

// ✅ REALISTICO: Tolleranza
const start = Date.now();

setTimeout(() => {
    const elapsed = Date.now() - start;
    console.log(`Elapsed: ${elapsed}ms`); // Probabilmente 100-105ms
}, 100);
```

### ❌ 4. setInterval(0) - Infinite Loop

```javascript
// ❌ PESSIMO: Blocca completamente Node.js!
setInterval(() => {
    console.log('Too fast!');
}, 0);

// ✅ MEGLIO: Delay minimo (1ms)
setInterval(() => {
    console.log('Better');
}, 1);

// ✅ ANCORA MEGLIO: setImmediate per yield
function processQueue() {
    if (queue.length > 0) {
        processItem(queue.shift());
        setImmediate(processQueue);
    }
}
```

### ❌ 5. Closure con Variabili Loop

```javascript
// ❌ PROBLEMA: Closure cattura `i`
for (var i = 1; i <= 3; i++) {
    setTimeout(() => {
        console.log(i); // 4, 4, 4
    }, i * 1000);
}

// ✅ SOLUZIONE 1: Usa let (block scope)
for (let i = 1; i <= 3; i++) {
    setTimeout(() => {
        console.log(i); // 1, 2, 3
    }, i * 1000);
}

// ✅ SOLUZIONE 2: IIFE
for (var i = 1; i <= 3; i++) {
    (function(index) {
        setTimeout(() => {
            console.log(index); // 1, 2, 3
        }, index * 1000);
    })(i);
}

// ✅ SOLUZIONE 3: Parametri setTimeout
for (var i = 1; i <= 3; i++) {
    setTimeout((index) => {
        console.log(index); // 1, 2, 3
    }, i * 1000, i);
}
```

---

## 🎯 Pattern Utili

### Pattern 1: Timeout con Promise

```javascript
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Uso con async/await
async function example() {
    console.log('Start');
    await delay(1000);
    console.log('After 1 second');
    await delay(2000);
    console.log('After 3 seconds total');
}

example();
```

### Pattern 2: Timeout Cancellabile con Promise

```javascript
function cancellableDelay(ms) {
    let timeoutId;
    
    const promise = new Promise((resolve) => {
        timeoutId = setTimeout(resolve, ms);
    });
    
    promise.cancel = () => {
        clearTimeout(timeoutId);
    };
    
    return promise;
}

// Uso
async function example() {
    const delayPromise = cancellableDelay(5000);
    
    // Cancella dopo 2 secondi
    setTimeout(() => {
        delayPromise.cancel();
        console.log('Cancelled!');
    }, 2000);
    
    await delayPromise;
    console.log('Completed'); // Non viene eseguito
}
```

### Pattern 3: Retry con Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === maxRetries - 1) throw err;
            
            const delay = baseDelay * Math.pow(2, i);
            console.log(`Retry ${i + 1} after ${delay}ms`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Uso
async function flakeyOperation() {
    if (Math.random() > 0.7) {
        return 'Success!';
    }
    throw new Error('Failed');
}

retryWithBackoff(flakeyOperation)
    .then(result => console.log(result))
    .catch(err => console.error('All retries failed:', err));
```

### Pattern 4: Debounce

```javascript
function debounce(fn, delay) {
    let timeoutId;
    
    return function(...args) {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

// Uso
const debouncedSearch = debounce((query) => {
    console.log('Searching for:', query);
}, 500);

debouncedSearch('a');
debouncedSearch('ab');
debouncedSearch('abc'); // Solo questa verrà eseguita
```

### Pattern 5: Throttle

```javascript
function throttle(fn, delay) {
    let lastCall = 0;
    
    return function(...args) {
        const now = Date.now();
        
        if (now - lastCall >= delay) {
            lastCall = now;
            fn.apply(this, args);
        }
    };
}

// Uso
const throttledLog = throttle((msg) => {
    console.log('Logged:', msg);
}, 1000);

// Chiamate rapide
for (let i = 0; i < 100; i++) {
    throttledLog(`Message ${i}`);
}
// Solo ~1 messaggio al secondo
```

### Pattern 6: Polling Intelligente

```javascript
class SmartPoller {
    constructor(checkFn, interval = 5000, maxAttempts = 10) {
        this.checkFn = checkFn;
        this.interval = interval;
        this.maxAttempts = maxAttempts;
        this.attempts = 0;
        this.running = false;
    }
    
    async start() {
        if (this.running) return;
        this.running = true;
        
        while (this.running && this.attempts < this.maxAttempts) {
            try {
                const result = await this.checkFn();
                
                if (result) {
                    console.log('Condition met!');
                    this.stop();
                    return result;
                }
                
                this.attempts++;
                console.log(`Attempt ${this.attempts}/${this.maxAttempts}`);
                
                // Aspetta prima del prossimo tentativo
                await new Promise(resolve => setTimeout(resolve, this.interval));
                
            } catch (err) {
                console.error('Polling error:', err);
                this.stop();
                throw err;
            }
        }
        
        if (this.attempts >= this.maxAttempts) {
            throw new Error('Max attempts reached');
        }
    }
    
    stop() {
        this.running = false;
    }
}

// Uso
const poller = new SmartPoller(
    async () => {
        // Controlla se server è pronto
        const ready = await checkServerStatus();
        return ready;
    },
    2000,  // Ogni 2 secondi
    20     // Max 20 tentativi
);

poller.start()
    .then(result => console.log('Server ready:', result))
    .catch(err => console.error('Failed:', err));
```

### Pattern 7: Timeout per Promise

```javascript
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Timeout after ${timeoutMs}ms`));
            }, timeoutMs);
        })
    ]);
}

// Uso
async function example() {
    try {
        const result = await withTimeout(
            fetch('https://api.example.com/data'),
            5000
        );
        console.log('Success:', result);
    } catch (err) {
        console.error('Error:', err.message);
    }
}
```

---

## 🔄 Alternative Moderne

### 1. setImmediate() vs setTimeout(0)

```javascript
// setTimeout(0) - Fase Timers
setTimeout(() => {
    console.log('setTimeout');
}, 0);

// setImmediate() - Fase Check
setImmediate(() => {
    console.log('setImmediate');
});

// Ordine NON garantito in main module!
// Ma dentro I/O callbacks, setImmediate è SEMPRE prima
```

```javascript
// Dentro I/O callback - ordine GARANTITO
const fs = require('fs');

fs.readFile(__filename, () => {
    setTimeout(() => {
        console.log('2. setTimeout');
    }, 0);
    
    setImmediate(() => {
        console.log('1. setImmediate'); // SEMPRE prima
    });
});
```

### 2. process.nextTick() - Priorità Massima

```javascript
console.log('1. Sync');

setTimeout(() => {
    console.log('4. Timer');
}, 0);

process.nextTick(() => {
    console.log('2. NextTick');
});

Promise.resolve().then(() => {
    console.log('3. Promise');
});

// Output:
// 1. Sync
// 2. NextTick    ← Priorità massima
// 3. Promise     ← Microtask
// 4. Timer       ← Fase Timers
```

### 3. Timers/Promises API (Node.js 15+)

```javascript
const { setTimeout, setInterval } = require('timers/promises');

// setTimeout con async/await
async function example1() {
    console.log('Start');
    await setTimeout(1000);
    console.log('After 1 second');
}

// setInterval con async iteration
async function example2() {
    const interval = setInterval(1000);
    let count = 0;
    
    for await (const _ of interval) {
        console.log(`Tick ${++count}`);
        
        if (count >= 5) {
            break; // Auto-cleanup
        }
    }
    
    console.log('Done');
}

example2();
```

### 4. AbortController per Cancellare Timer

```javascript
const { setTimeout } = require('timers/promises');

async function cancellableOperation() {
    const controller = new AbortController();
    const { signal } = controller;
    
    // Cancella dopo 2 secondi
    setTimeout(2000).then(() => controller.abort());
    
    try {
        await setTimeout(5000, null, { signal });
        console.log('Completed');
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('Cancelled!');
        }
    }
}

cancellableOperation();
```

---

## 📊 Performance e Limiti

### Limiti di Node.js Timer

```javascript
// Numero massimo di timer attivi
const maxTimers = 100000;
const timers = [];

for (let i = 0; i < maxTimers; i++) {
    timers.push(setTimeout(() => {}, 1000000));
}

console.log(`Created ${maxTimers} timers`);

// Cleanup
timers.forEach(t => clearTimeout(t));
```

### Delay Minimo

```javascript
// Node.js ha un delay minimo di ~1ms
const delays = [];

for (let i = 0; i < 10; i++) {
    const start = Date.now();
    
    setTimeout(() => {
        delays.push(Date.now() - start);
        
        if (delays.length === 10) {
            console.log('Delays:', delays);
            // Output: [1, 1, 2, 1, 1, 1, 2, 1, 1, 1]
        }
    }, 0);
}
```

### Precisione Timer

```javascript
// Test precisione
function testTimerPrecision(duration) {
    const start = process.hrtime.bigint();
    
    setTimeout(() => {
        const end = process.hrtime.bigint();
        const elapsed = Number(end - start) / 1000000; // Converti a ms
        const diff = elapsed - duration;
        
        console.log(`Expected: ${duration}ms`);
        console.log(`Actual: ${elapsed.toFixed(2)}ms`);
        console.log(`Difference: ${diff.toFixed(2)}ms`);
    }, duration);
}

testTimerPrecision(100);
// Expected: 100ms
// Actual: 101.23ms
// Difference: 1.23ms
```

---

## 🧪 Quiz di Autovalutazione

### Domanda 1: Ordine di Esecuzione

```javascript
console.log('A');

setTimeout(() => console.log('B'), 0);
setTimeout(() => console.log('C'), 100);

Promise.resolve().then(() => console.log('D'));

console.log('E');
```

**Qual è l'output?**

<details>
<summary>Mostra risposta</summary>

```
A
E
D
B
C
```

**Spiegazione:**
1. `A`, `E` - codice sincrono
2. `D` - Promise (microtask, prima dell'Event Loop)
3. `B` - Timer con delay 0 (fase Timers)
4. `C` - Timer con delay 100ms

</details>

### Domanda 2: clearTimeout

```javascript
const id1 = setTimeout(() => console.log('1'), 1000);
const id2 = setTimeout(() => console.log('2'), 2000);

clearTimeout(id1);

// Cosa viene stampato?
```

<details>
<summary>Mostra risposta</summary>

```
2
```

Solo il secondo timer viene eseguito perché il primo è stato cancellato con `clearTimeout(id1)`.

</details>

### Domanda 3: setInterval Problem

```javascript
let count = 0;

const id = setInterval(() => {
    count++;
    console.log(count);
    
    if (count === 3) {
        clearInterval(id);
    }
}, 1000);

// Quante volte viene stampato?
```

<details>
<summary>Mostra risposta</summary>

**3 volte:**
```
1
2
3
```

Il ciclo si ferma quando `count === 3` e viene chiamato `clearInterval()`.

</details>

### Domanda 4: Closure Problem

```javascript
for (var i = 1; i <= 3; i++) {
    setTimeout(() => {
        console.log(i);
    }, i * 1000);
}

// Cosa viene stampato?
```

<details>
<summary>Mostra risposta</summary>

```
4
4
4
```

**Problema:** `var` non ha block scope. Tutti i callback condividono la stessa `i`, che vale 4 quando vengono eseguiti.

**Soluzione:** Usa `let` invece di `var`:
```javascript
for (let i = 1; i <= 3; i++) {
    setTimeout(() => {
        console.log(i); // 1, 2, 3
    }, i * 1000);
}
```

</details>

### Domanda 5: Memory Leak

```javascript
function startServer() {
    setInterval(() => {
        checkHealth();
    }, 5000);
}

startServer();

// C'è un problema?
```

<details>
<summary>Mostra risposta</summary>

**SÌ, MEMORY LEAK!**

L'intervallo non viene mai fermato. Se `startServer()` viene chiamata più volte, crei intervalli multipli che non possono essere fermati.

**Soluzione:**
```javascript
let healthCheckInterval;

function startServer() {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
    }
    
    healthCheckInterval = setInterval(() => {
        checkHealth();
    }, 5000);
}

function stopServer() {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }
}
```

</details>

### Domanda 6: Async in setInterval

```javascript
setInterval(async () => {
    await slowOperation(); // Impiega 3 secondi
}, 1000);

// Cosa succede?
```

<details>
<summary>Mostra risposta</summary>

**PROBLEMA:** Se `slowOperation()` impiega più del delay (1 secondo), le esecuzioni si sovrappongono:

```
0s:     Esecuzione 1 inizia
1s:     Esecuzione 2 inizia (1 ancora in esecuzione!)
2s:     Esecuzione 3 inizia (1 e 2 ancora in esecuzione!)
3s:     Esecuzione 1 finisce
        Esecuzione 4 inizia
...
```

**Soluzione:** Usa setTimeout ricorsivo:
```javascript
async function recursiveCheck() {
    await slowOperation();
    setTimeout(recursiveCheck, 1000); // Aspetta DOPO il completamento
}

recursiveCheck();
```

</details>

---

## 💪 Esercizi Pratici

### Esercizio 1: Countdown Timer

Implementa un countdown che stampa i secondi rimanenti.

<details>
<summary>Soluzione</summary>

```javascript
function countdown(seconds) {
    console.log(`Countdown starting from ${seconds}...`);
    
    const intervalId = setInterval(() => {
        console.log(seconds);
        seconds--;
        
        if (seconds < 0) {
            clearInterval(intervalId);
            console.log('🚀 Liftoff!');
        }
    }, 1000);
    
    return intervalId; // Permette cancellazione esterna
}

// Uso
const timer = countdown(10);

// Cancella se necessario
// clearInterval(timer);
```

**Versione con Promise:**
```javascript
async function countdownAsync(seconds) {
    console.log(`Countdown starting from ${seconds}...`);
    
    for (let i = seconds; i >= 0; i--) {
        console.log(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('🚀 Liftoff!');
}

countdownAsync(10);
```

</details>

### Esercizio 2: Rate Limiter

Implementa un rate limiter che limita le chiamate a una funzione.

<details>
<summary>Soluzione</summary>

```javascript
class RateLimiter {
    constructor(maxCalls, windowMs) {
        this.maxCalls = maxCalls;
        this.windowMs = windowMs;
        this.calls = [];
    }
    
    tryCall(fn) {
        const now = Date.now();
        
        // Rimuovi chiamate fuori dalla finestra
        this.calls = this.calls.filter(
            time => now - time < this.windowMs
        );
        
        if (this.calls.length < this.maxCalls) {
            this.calls.push(now);
            fn();
            return true;
        } else {
            const oldestCall = this.calls[0];
            const waitTime = this.windowMs - (now - oldestCall);
            console.log(`Rate limited. Retry in ${waitTime}ms`);
            return false;
        }
    }
}

// Uso: Max 3 chiamate per 5 secondi
const limiter = new RateLimiter(3, 5000);

const intervalId = setInterval(() => {
    limiter.tryCall(() => {
        console.log('API call executed');
    });
}, 1000);

// Output:
// API call executed
// API call executed
// API call executed
// Rate limited. Retry in 2000ms
// Rate limited. Retry in 1000ms
// API call executed
// ...
```

</details>

### Esercizio 3: Stopwatch

Implementa uno stopwatch con start, stop, reset.

<details>
<summary>Soluzione</summary>

```javascript
class Stopwatch {
    constructor() {
        this.startTime = null;
        this.elapsedTime = 0;
        this.intervalId = null;
        this.running = false;
    }
    
    start() {
        if (this.running) return;
        
        this.running = true;
        this.startTime = Date.now() - this.elapsedTime;
        
        this.intervalId = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.display();
        }, 100);
    }
    
    stop() {
        if (!this.running) return;
        
        this.running = false;
        clearInterval(this.intervalId);
        this.elapsedTime = Date.now() - this.startTime;
    }
    
    reset() {
        this.stop();
        this.elapsedTime = 0;
        this.display();
    }
    
    display() {
        const seconds = Math.floor(this.elapsedTime / 1000);
        const milliseconds = this.elapsedTime % 1000;
        
        console.clear();
        console.log(`⏱️  ${seconds}.${milliseconds.toString().padStart(3, '0')}s`);
    }
    
    getTime() {
        return this.elapsedTime;
    }
}

// Uso
const stopwatch = new Stopwatch();

stopwatch.start();

setTimeout(() => {
    stopwatch.stop();
    console.log('Final time:', stopwatch.getTime(), 'ms');
}, 5000);
```

</details>

### Esercizio 4: Retry Mechanism

Implementa un meccanismo di retry con backoff esponenziale.

<details>
<summary>Soluzione</summary>

```javascript
async function retryWithBackoff(
    operation,
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000
) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt + 1}/${maxRetries}`);
            return await operation();
            
        } catch (error) {
            lastError = error;
            
            if (attempt === maxRetries - 1) {
                break; // Ultimo tentativo fallito
            }
            
            // Calcola delay con backoff esponenziale
            const delay = Math.min(
                baseDelay * Math.pow(2, attempt),
                maxDelay
            );
            
            // Aggiungi jitter random (±25%)
            const jitter = delay * 0.25 * (Math.random() - 0.5);
            const actualDelay = delay + jitter;
            
            console.log(`Retry in ${Math.round(actualDelay)}ms...`);
            
            await new Promise(resolve => 
                setTimeout(resolve, actualDelay)
            );
        }
    }
    
    throw new Error(
        `Operation failed after ${maxRetries} attempts: ${lastError.message}`
    );
}

// Test
let attempts = 0;

async function flakeyOperation() {
    attempts++;
    
    // Simula successo al 4° tentativo
    if (attempts < 4) {
        throw new Error(`Attempt ${attempts} failed`);
    }
    
    return 'Success!';
}

retryWithBackoff(flakeyOperation, 5)
    .then(result => console.log('Result:', result))
    .catch(err => console.error('Error:', err.message));

// Output:
// Attempt 1/5
// Retry in 1000ms...
// Attempt 2/5
// Retry in 2000ms...
// Attempt 3/5
// Retry in 4000ms...
// Attempt 4/5
// Result: Success!
```

</details>

---

## 📚 Risorse Aggiuntive

### 📖 Documentazione Ufficiale

- [Node.js Timers](https://nodejs.org/api/timers.html)
- [Timers Promises API](https://nodejs.org/api/timers.html#timers-promises-api)
- [Event Loop Timers and nextTick](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

### 📝 Articoli

- [Understanding setTimeout and setInterval](https://javascript.info/settimeout-setinterval)
- [Debouncing and Throttling Explained](https://css-tricks.com/debouncing-throttling-explained-examples/)
- [JavaScript Timers: Everything you need to know](https://www.freecodecamp.org/news/javascript-timers-everything-you-need-to-know-5f31eaa37162/)

### 🎥 Video

- [JavaScript Event Loop](https://www.youtube.com/watch?v=8aGhZQkoFbQ)
- [Async JavaScript Tutorial](https://www.youtube.com/watch?v=PoRJizFvM7s)

---

## 🎯 Riepilogo Chiave

### ✅ Concetti Fondamentali

1. **setTimeout()**
   - Esegue callback UNA VOLTA dopo un delay
   - Ritorna ID per cancellazione con clearTimeout()
   - Delay minimo ~1ms anche con timeout(0)

2. **setInterval()**
   - Esegue callback RIPETUTAMENTE ogni delay
   - ⚠️ Non garantisce timing preciso (drift)
   - SEMPRE chiamare clearInterval() per evitare leak

3. **Event Loop**
   - Timer eseguiti nella fase Timers
   - Dopo process.nextTick() e Promise microtask
   - Prima di setImmediate()

4. **Alternative Moderne**
   - timers/promises API per async/await
   - setImmediate() per yield all'Event Loop
   - AbortController per cancellazione

### 📊 setTimeout vs setInterval

| Aspetto | setTimeout | setInterval |
|---------|-----------|-------------|
| Esecuzioni | ✅ Una sola | ❌ Multiple (fino a clear) |
| Timing drift | ✅ No drift | ❌ Accumula drift |
| Memory safe | ✅ Auto-cleanup | ❌ Richiede clear manuale |
| Async-friendly | ✅ Con Promise | ❌ Problemi con async |
| Raccomandato | ✅ setTimeout ricorsivo | ⚠️ Usa con cautela |

### 🚀 Best Practices

| ✅ DO | ❌ DON'T |
|-------|----------|
| Salva ID per clearTimeout/clearInterval | Non dimenticare clear (leak!) |
| Usa setTimeout ricorsivo per polling | Non usare setInterval(async) |
| Gestisci errori nei callback | Non assumere timing preciso |
| Usa timers/promises con async/await | Non usare setInterval(0) |
| Implementa cleanup (SIGTERM) | Non creare timer in loop |

### 🎯 Pattern Comuni

1. **Delay con Promise:** `await new Promise(r => setTimeout(r, ms))`
2. **Retry:** Exponential backoff con jitter
3. **Debounce:** Delay esecuzione fino a calma
4. **Throttle:** Limita frequenza esecuzione
5. **Polling:** setTimeout ricorsivo con controllo
6. **Timeout:** Promise.race con timer

---

**🎓 Congratulazioni!** Ora padroneggi setTimeout() e setInterval() in Node.js!

**💡 Ricorda:**
- ⏱️ setTimeout = una volta
- 🔁 setInterval = ripetuto (ma setTimeout ricorsivo è meglio!)
- 🧹 Sempre clearTimeout/clearInterval per cleanup
- 🚀 Usa timers/promises per codice moderno
