# process.nextTick() in Node.js

## 📚 Obiettivi di Apprendimento

Al termine di questa guida saprai:
- Cos'è `process.nextTick()` e come funziona
- La differenza tra nextTick, Promise, setImmediate e setTimeout
- Quando usare (e quando NON usare) process.nextTick()
- Come evitare il "nextTick recursion" e il blocco dell'Event Loop
- Pattern comuni e best practices
- Debugging e troubleshooting

---

## 🎯 Cos'è process.nextTick()?

`process.nextTick()` è una funzione **specifica di Node.js** (non disponibile nei browser) che pianifica l'esecuzione di un callback **immediatamente dopo** il completamento del codice JavaScript corrente, ma **prima** che l'Event Loop continui con qualsiasi altra fase.

È la funzione con la **priorità più alta** in assoluto nell'Event Loop di Node.js.

### 📖 Analogia del Mondo Reale

Immagina di essere in un ufficio postale:

```
📮 UFFICIO POSTALE (Event Loop)
┌────────────────────────────────────┐
│ Tu (Codice Sincrono)               │
│ "Devo spedire questa lettera"      │
│                                    │
│ Impiegato: "Ok, metto da parte"    │ ← process.nextTick()
│ [Posticipato SUBITO DOPO di te]    │
│                                    │
│ Altri clienti in fila              │ ← setTimeout, setImmediate
│ (aspetteranno più a lungo)         │
└────────────────────────────────────┘
```

`process.nextTick()` è come dire "fallo subito dopo che ho finito, prima di servire chiunque altro".

### 💻 Esempio Basilare

```javascript
console.log('1. Start');

process.nextTick(() => {
    console.log('3. NextTick callback');
});

console.log('2. End');

// Output GARANTITO:
// 1. Start
// 2. End
// 3. NextTick callback
```

---

## 🔍 Posizione nell'Event Loop

### Diagramma Event Loop con nextTick

```
┌─────────────────────────────────────────────────────┐
│  CODICE SINCRONO                                    │
│  (eseguito immediatamente)                          │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│  ⭐ NEXTTICK QUEUE ⭐                              │ ← PRIORITÀ MASSIMA
│  (process.nextTick callbacks)                       │
│  Svuotata COMPLETAMENTE prima di continuare         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│  MICROTASK QUEUE                                    │
│  (Promise callbacks, queueMicrotask)                │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
        ┌───────────────────────┐
        │   EVENT LOOP INIZIA   │
        └──────────┬────────────┘
                   │
    ┌──────────────▼───────────────┐
    │  TIMERS (setTimeout)         │
    └──────────────┬───────────────┘
                   │
    ┌──────────────▼───────────────┐
    │  PENDING CALLBACKS           │
    └──────────────┬───────────────┘
                   │
    ┌──────────────▼───────────────┐
    │  POLL (I/O)                  │
    └──────────────┬───────────────┘
                   │
    ┌──────────────▼───────────────┐
    │  CHECK (setImmediate)        │
    └──────────────┬───────────────┘
                   │
    ┌──────────────▼───────────────┐
    │  CLOSE CALLBACKS             │
    └──────────────────────────────┘

NOTA: La nextTick queue viene svuotata DOPO OGNI FASE!
```

### 🔄 Ciclo di Esecuzione

```javascript
// Dimostrazione della priorità

console.log('1. Sync');

setTimeout(() => {
    console.log('5. Timer');
}, 0);

setImmediate(() => {
    console.log('6. Immediate');
});

Promise.resolve().then(() => {
    console.log('4. Promise');
});

process.nextTick(() => {
    console.log('2. NextTick 1');
    
    process.nextTick(() => {
        console.log('3. NextTick 2 (nested)');
    });
});

console.log('1. Sync end');

// Output SEMPRE:
// 1. Sync
// 1. Sync end
// 2. NextTick 1
// 3. NextTick 2 (nested)
// 4. Promise
// 5. Timer
// 6. Immediate
```

---

## 📝 Sintassi e Utilizzo

### Firma della Funzione

```javascript
process.nextTick(callback[, ...args])
```

**Parametri:**
- `callback` (Function): Funzione da eseguire
- `...args` (any): Argomenti opzionali da passare al callback

**Ritorna:** `undefined` (non restituisce alcun valore)

### Esempi di Utilizzo

#### 1. Semplice Callback

```javascript
process.nextTick(() => {
    console.log('Eseguito nel prossimo tick');
});
```

#### 2. Con Argomenti

```javascript
function greet(name, age) {
    console.log(`Hello ${name}, you are ${age} years old`);
}

process.nextTick(greet, 'Mario', 30);
// Output: Hello Mario, you are 30 years old
```

#### 3. Callback Annidate

```javascript
process.nextTick(() => {
    console.log('First');
    
    process.nextTick(() => {
        console.log('Second');
        
        process.nextTick(() => {
            console.log('Third');
        });
    });
});

console.log('Sync');

// Output:
// Sync
// First
// Second
// Third
```

#### 4. Uso con Arrow Function

```javascript
const processData = (data) => {
    process.nextTick(() => {
        console.log('Processing:', data);
    });
};

processData({ id: 1, name: 'Test' });
```

---

## ⚖️ process.nextTick() vs Altre API

### Tabella Comparativa

| API | Priorità | Quando Esegue | Use Case |
|-----|----------|---------------|----------|
| **process.nextTick()** | ⭐⭐⭐⭐⭐ | Dopo codice sync, prima di tutto | Garantire ordine, emettere eventi |
| **Promise.then()** | ⭐⭐⭐⭐ | Dopo nextTick, prima Event Loop | Async operations moderne |
| **queueMicrotask()** | ⭐⭐⭐⭐ | Come Promise (microtask) | Compatibilità browser |
| **setImmediate()** | ⭐⭐ | Fase check dell'Event Loop | Dopo I/O callbacks |
| **setTimeout(0)** | ⭐ | Fase timers dell'Event Loop | Delay minimo |

### 1. nextTick vs Promise

```javascript
console.log('Start');

Promise.resolve().then(() => {
    console.log('3. Promise');
});

process.nextTick(() => {
    console.log('2. NextTick');
});

console.log('1. Sync end');

// Output:
// Start
// 1. Sync end
// 2. NextTick      ← Eseguito PRIMA
// 3. Promise       ← Eseguito DOPO
```

**Perché?** La nextTick queue ha priorità più alta della microtask queue (dove vanno le Promise).

### 2. nextTick vs setImmediate

```javascript
process.nextTick(() => {
    console.log('1. NextTick');
});

setImmediate(() => {
    console.log('2. Immediate');
});

// Output SEMPRE:
// 1. NextTick
// 2. Immediate
```

**Differenza chiave:**
- `process.nextTick()`: Eseguito **prima** dell'Event Loop
- `setImmediate()`: Eseguito **nella fase check** dell'Event Loop

### 3. nextTick vs setTimeout

```javascript
setTimeout(() => {
    console.log('2. Timer');
}, 0);

process.nextTick(() => {
    console.log('1. NextTick');
});

// Output SEMPRE:
// 1. NextTick
// 2. Timer
```

### 4. Confronto Completo

```javascript
console.log('A. Sync start');

setTimeout(() => console.log('F. setTimeout'), 0);
setImmediate(() => console.log('G. setImmediate'));

process.nextTick(() => console.log('C. nextTick 1'));
process.nextTick(() => console.log('D. nextTick 2'));

Promise.resolve().then(() => console.log('E. Promise'));

console.log('B. Sync end');

// Output GARANTITO:
// A. Sync start
// B. Sync end
// C. nextTick 1
// D. nextTick 2
// E. Promise
// F. setTimeout (o G)
// G. setImmediate (o F)
```

---

## 🎯 Quando Usare process.nextTick()

### ✅ Casi d'Uso Corretti

#### 1. Garantire Ordine di Esecuzione

```javascript
class EventEmitter {
    constructor() {
        this.listeners = [];
    }
    
    on(event, callback) {
        this.listeners.push(callback);
    }
    
    emit(event, data) {
        // ✅ Assicura che i listener siano registrati prima dell'emissione
        process.nextTick(() => {
            this.listeners.forEach(listener => listener(data));
        });
    }
}

// Uso
const emitter = new EventEmitter();

emitter.emit('data', { value: 42 }); // Emesso prima della registrazione

emitter.on('data', (data) => {
    console.log('Received:', data); // Ma viene comunque ricevuto!
});

// Output: Received: { value: 42 }
```

#### 2. Rendere Callback Consistenti (Sync vs Async)

```javascript
// ❌ PROBLEMA: Comportamento inconsistente
function getData(useCache, callback) {
    if (useCache && cachedData) {
        callback(null, cachedData); // SINCRONO
    } else {
        fs.readFile('data.txt', callback); // ASINCRONO
    }
}

// ✅ SOLUZIONE: Sempre asincrono
function getDataConsistent(useCache, callback) {
    if (useCache && cachedData) {
        process.nextTick(() => callback(null, cachedData)); // Ora ASINCRONO
    } else {
        fs.readFile('data.txt', callback);
    }
}

// Problema del codice inconsistente:
let result;

getData(true, (err, data) => {
    result = data;
});

console.log(result); // undefined O dati? Dipende!

// Con nextTick è sempre consistente:
getDataConsistent(true, (err, data) => {
    result = data;
});

console.log(result); // SEMPRE undefined qui
```

#### 3. Emettere Eventi Dopo la Costruzione

```javascript
const EventEmitter = require('events');

class Server extends EventEmitter {
    constructor() {
        super();
        
        // ✅ Emette 'ready' dopo che il costruttore completa
        process.nextTick(() => {
            this.emit('ready');
        });
    }
}

// Uso
const server = new Server();

// I listener vengono registrati PRIMA dell'emissione
server.on('ready', () => {
    console.log('Server is ready!');
});

// Output: Server is ready!
```

#### 4. Gestire Errori in Modo Asincrono

```javascript
function readFileAsync(path, callback) {
    // Validazione sincrona
    if (!path) {
        // ✅ Restituisci errore in modo asincrono
        process.nextTick(() => {
            callback(new Error('Path is required'));
        });
        return;
    }
    
    fs.readFile(path, callback);
}

// Comportamento consistente
readFileAsync('', (err, data) => {
    if (err) console.error(err.message);
});

console.log('This executes first');

// Output:
// This executes first
// Path is required
```

#### 5. Completare Operazioni Prima di Continuare

```javascript
class Transaction {
    constructor() {
        this.operations = [];
    }
    
    add(operation) {
        this.operations.push(operation);
    }
    
    commit() {
        // ✅ Permette di aggiungere altre operazioni nello stesso tick
        process.nextTick(() => {
            console.log(`Committing ${this.operations.length} operations`);
            this.operations.forEach(op => op());
            this.operations = [];
        });
    }
}

const transaction = new Transaction();
transaction.add(() => console.log('Op 1'));
transaction.add(() => console.log('Op 2'));
transaction.commit();

// Ancora possibile aggiungere nello stesso tick
transaction.add(() => console.log('Op 3'));

// Output:
// Committing 3 operations
// Op 1
// Op 2
// Op 3
```

---

## ⚠️ Pericoli e Antipattern

### ❌ 1. Ricorsione Infinita (nextTick Starvation)

```javascript
// ❌ PESSIMO: Blocca l'Event Loop COMPLETAMENTE!
function recursiveNextTick() {
    process.nextTick(recursiveNextTick);
}

recursiveNextTick();

// L'Event Loop non procederà MAI:
// - Timer non eseguiti
// - I/O bloccato
// - setImmediate mai raggiunto
// - Server completamente bloccato!

setTimeout(() => {
    console.log('Questo non verrà MAI eseguito!');
}, 0);
```

**Problema:** La nextTick queue viene svuotata completamente prima di continuare. Se continui ad aggiungere callback, l'Event Loop non avanza mai.

**Soluzione:**
```javascript
// ✅ Usa setImmediate invece
function recursiveImmediate() {
    setImmediate(recursiveImmediate);
}

recursiveImmediate();

// L'Event Loop può ancora processare altre fasi
setTimeout(() => {
    console.log('Questo VERRÀ eseguito!');
}, 100);
```

### ❌ 2. Loop Controllatoai Ma Troppo Lungo

```javascript
// ❌ MALE: Blocca troppo a lungo
function processArray(array, index = 0) {
    if (index >= array.length) return;
    
    processItem(array[index]);
    
    process.nextTick(() => {
        processArray(array, index + 1);
    });
}

processArray(hugeArray); // Se array è enorme, blocca!

// ✅ MEGLIO: Usa batching con setImmediate
async function processArrayBetter(array, batchSize = 1000) {
    for (let i = 0; i < array.length; i += batchSize) {
        const batch = array.slice(i, i + batchSize);
        batch.forEach(item => processItem(item));
        
        // Cede controllo all'Event Loop ogni batch
        await new Promise(resolve => setImmediate(resolve));
    }
}
```

### ❌ 3. Usare nextTick per Delay

```javascript
// ❌ SBAGLIATO: nextTick non è per delay
process.nextTick(() => {
    console.log('Tentativo di delay');
});

// ✅ CORRETTO: Usa setTimeout per delay
setTimeout(() => {
    console.log('Delay corretto');
}, 100);
```

### ❌ 4. Abusare di nextTick Quando Promise Sarebbe Meglio

```javascript
// ❌ Stile vecchio e verboso
function fetchData(callback) {
    process.nextTick(() => {
        // ... fetch logic
        callback(null, data);
    });
}

// ✅ Moderno e pulito
async function fetchData() {
    return data;
}
```

### ❌ 5. Memory Leak con Closure

```javascript
// ❌ MALE: Può causare memory leak
let data = new Array(1000000).fill('x');

function leakyFunction() {
    process.nextTick(() => {
        console.log(data.length); // Closure mantiene data in memoria
        leakyFunction();
    });
}

leakyFunction();

// ✅ MEGLIO: Limita ricorsione
function betterFunction(count = 0, maxCount = 1000) {
    if (count >= maxCount) return;
    
    process.nextTick(() => {
        console.log(count);
        betterFunction(count + 1, maxCount);
    });
}

betterFunction();
```

---

## 🛠️ Pattern Comuni

### Pattern 1: Defer Initialization

```javascript
class DatabaseConnection {
    constructor(config) {
        this.config = config;
        this.connection = null;
        
        // Defer la connessione al prossimo tick
        process.nextTick(() => {
            this.connect();
        });
    }
    
    connect() {
        console.log('Connecting to database...');
        this.connection = createConnection(this.config);
        this.emit('connected');
    }
    
    on(event, callback) {
        // Setup listener
    }
    
    emit(event, data) {
        // Emit event
    }
}

// Uso
const db = new DatabaseConnection(config);

// Listener registrato PRIMA della connessione
db.on('connected', () => {
    console.log('Database connected!');
});
```

### Pattern 2: Error-First Callback Wrapper

```javascript
function asyncWrapper(fn) {
    return function(...args) {
        const callback = args[args.length - 1];
        
        try {
            const result = fn.apply(this, args.slice(0, -1));
            
            // Restituisci risultato in modo asincrono
            process.nextTick(() => {
                callback(null, result);
            });
        } catch (err) {
            // Restituisci errore in modo asincrono
            process.nextTick(() => {
                callback(err);
            });
        }
    };
}

// Uso
const syncFunction = (a, b) => a + b;
const asyncFunction = asyncWrapper(syncFunction);

asyncFunction(2, 3, (err, result) => {
    if (err) return console.error(err);
    console.log('Result:', result); // 5
});

console.log('This executes first');
```

### Pattern 3: Batch Processing

```javascript
class BatchProcessor {
    constructor(processFn, batchSize = 100) {
        this.processFn = processFn;
        this.batchSize = batchSize;
        this.queue = [];
        this.processing = false;
    }
    
    add(item) {
        this.queue.push(item);
        
        if (!this.processing) {
            this.scheduleProcessing();
        }
    }
    
    scheduleProcessing() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        // Usa nextTick per raccogliere tutti gli item aggiunti nello stesso tick
        process.nextTick(() => {
            this.processBatch();
        });
    }
    
    processBatch() {
        const batch = this.queue.splice(0, this.batchSize);
        
        console.log(`Processing batch of ${batch.length} items`);
        this.processFn(batch);
        
        this.processing = false;
        
        // Continua se ci sono altri item
        if (this.queue.length > 0) {
            this.scheduleProcessing();
        }
    }
}

// Uso
const processor = new BatchProcessor((items) => {
    console.log('Batch:', items);
});

// Tutti aggiunti nello stesso tick
processor.add(1);
processor.add(2);
processor.add(3);
processor.add(4);

// Output:
// Processing batch of 4 items
// Batch: [1, 2, 3, 4]
```

### Pattern 4: Guaranteed Callback

```javascript
function guaranteedCallback(fn, callback) {
    let callbackCalled = false;
    
    const wrappedCallback = (...args) => {
        if (!callbackCalled) {
            callbackCalled = true;
            callback(...args);
        }
    };
    
    try {
        fn(wrappedCallback);
    } catch (err) {
        // Se fn lancia eccezione sincrona, chiama callback
        if (!callbackCalled) {
            process.nextTick(() => {
                wrappedCallback(err);
            });
        }
    }
    
    // Timeout di sicurezza
    setTimeout(() => {
        if (!callbackCalled) {
            wrappedCallback(new Error('Callback timeout'));
        }
    }, 5000);
}

// Uso
guaranteedCallback(
    (callback) => {
        // Funzione che potrebbe non chiamare callback
        if (Math.random() > 0.5) {
            callback(null, 'success');
        }
        // 50% delle volte non chiama callback!
    },
    (err, result) => {
        if (err) console.error('Error:', err.message);
        else console.log('Result:', result);
    }
);
```

### Pattern 5: State Machine Transitions

```javascript
class StateMachine {
    constructor() {
        this.state = 'idle';
        this.transitions = [];
    }
    
    transition(newState) {
        const oldState = this.state;
        
        // Defer transizione per permettere listeners
        process.nextTick(() => {
            this.state = newState;
            console.log(`State: ${oldState} -> ${newState}`);
            
            // Esegui callbacks per questa transizione
            this.transitions
                .filter(t => t.from === oldState && t.to === newState)
                .forEach(t => t.callback());
        });
    }
    
    onTransition(from, to, callback) {
        this.transitions.push({ from, to, callback });
    }
}

// Uso
const fsm = new StateMachine();

fsm.onTransition('idle', 'loading', () => {
    console.log('Started loading');
});

fsm.onTransition('loading', 'ready', () => {
    console.log('Ready to use');
});

fsm.transition('loading');
fsm.transition('ready');

// Output:
// State: idle -> loading
// Started loading
// State: loading -> ready
// Ready to use
```

---

## 🔍 Debugging e Troubleshooting

### 1. Rilevare nextTick Ricorsivi

```javascript
// Strumento di debug
let nextTickCount = 0;
const originalNextTick = process.nextTick;

process.nextTick = function(callback, ...args) {
    nextTickCount++;
    
    if (nextTickCount > 1000) {
        console.error('⚠️  WARNING: Too many nextTick calls!');
        console.trace('Stack trace:');
    }
    
    return originalNextTick(callback, ...args);
};

// Reset counter periodicamente
setInterval(() => {
    if (nextTickCount > 0) {
        console.log(`📊 NextTick calls in last second: ${nextTickCount}`);
    }
    nextTickCount = 0;
}, 1000);
```

### 2. Tracciare Origine nextTick

```javascript
// Debug mode per tracciare ogni nextTick
if (process.env.DEBUG_NEXTTICK) {
    const originalNextTick = process.nextTick;
    
    process.nextTick = function(callback, ...args) {
        const stack = new Error().stack;
        console.log('📍 nextTick scheduled from:', stack.split('\n')[2]);
        
        return originalNextTick(function(...cbArgs) {
            console.log('▶️  Executing nextTick callback');
            return callback(...cbArgs);
        }, ...args);
    };
}

// Uso: DEBUG_NEXTTICK=1 node app.js
```

### 3. Monitorare nextTick Queue Depth

```javascript
const { AsyncLocalStorage } = require('async_hooks');

let maxQueueDepth = 0;
let currentDepth = 0;

const originalNextTick = process.nextTick;

process.nextTick = function(callback, ...args) {
    currentDepth++;
    maxQueueDepth = Math.max(maxQueueDepth, currentDepth);
    
    return originalNextTick(function(...cbArgs) {
        currentDepth--;
        return callback(...cbArgs);
    }, ...args);
};

// Report periodico
setInterval(() => {
    console.log(`📊 Max nextTick queue depth: ${maxQueueDepth}`);
    maxQueueDepth = 0;
}, 5000);
```

### 4. Timeout per nextTick Bloccati

```javascript
function nextTickWithTimeout(callback, timeout = 1000) {
    let executed = false;
    
    const timeoutId = setTimeout(() => {
        if (!executed) {
            console.error('⚠️  nextTick callback timeout!');
        }
    }, timeout);
    
    process.nextTick(() => {
        executed = true;
        clearTimeout(timeoutId);
        callback();
    });
}

// Uso
nextTickWithTimeout(() => {
    console.log('Executed within timeout');
}, 500);
```

---

## 📊 Performance Considerations

### Overhead di process.nextTick()

```javascript
// Benchmark: nextTick vs direct call
const iterations = 1000000;

// Test 1: Direct call
console.time('Direct call');
for (let i = 0; i < iterations; i++) {
    (() => {})();
}
console.timeEnd('Direct call');

// Test 2: process.nextTick
console.time('process.nextTick');
let completed = 0;
for (let i = 0; i < iterations; i++) {
    process.nextTick(() => {
        completed++;
        if (completed === iterations) {
            console.timeEnd('process.nextTick');
        }
    });
}

// Risultato tipico:
// Direct call: ~10ms
// process.nextTick: ~500ms
```

**Conclusione:** C'è un overhead significativo. Usare con criterio.

### Quando nextTick è Troppo

```javascript
// ❌ INEFFICIENTE
function processItems(items) {
    items.forEach(item => {
        process.nextTick(() => {
            processItem(item);
        });
    });
}

// ✅ PIÙ EFFICIENTE
function processItemsBetter(items) {
    process.nextTick(() => {
        items.forEach(item => {
            processItem(item);
        });
    });
}

// ✅ ANCORA MEGLIO: Con batching
async function processItemsBest(items, batchSize = 1000) {
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        batch.forEach(item => processItem(item));
        await new Promise(resolve => setImmediate(resolve));
    }
}
```

---

## 🧪 Quiz di Autovalutazione

### Domanda 1: Ordine di Esecuzione

```javascript
console.log('A');

process.nextTick(() => {
    console.log('B');
    
    process.nextTick(() => {
        console.log('C');
    });
});

Promise.resolve().then(() => {
    console.log('D');
});

console.log('E');
```

**Qual è l'output?**

<details>
<summary>Mostra risposta</summary>

```
A
E
B
C
D
```

**Spiegazione:**
1. `A`, `E` - codice sincrono
2. `B` - nextTick (priorità massima)
3. `C` - nextTick annidato (svuota tutta la queue)
4. `D` - Promise (microtask, dopo nextTick)

</details>

### Domanda 2: Ricorsione Pericolosa

```javascript
function dangerous() {
    process.nextTick(dangerous);
}

dangerous();

setTimeout(() => {
    console.log('Timer');
}, 0);
```

**Cosa succede?**

<details>
<summary>Mostra risposta</summary>

Il `setTimeout()` **non verrà MAI eseguito**!

**Motivo:** `dangerous()` aggiunge continuamente callback alla nextTick queue, che viene svuotata completamente prima di passare a qualsiasi fase dell'Event Loop. Questo è chiamato **nextTick starvation**.

**Soluzione:**
```javascript
function safe() {
    setImmediate(safe); // Usa setImmediate
}
```

</details>

### Domanda 3: Sync vs Async Callback

```javascript
let value;

process.nextTick(() => {
    value = 'async';
});

value = 'sync';

console.log(value);
```

**Qual è l'output e perché?**

<details>
<summary>Mostra risposta</summary>

```
sync
```

**Spiegazione:** Anche se `process.nextTick()` ha priorità alta, viene comunque eseguito **dopo** il codice sincrono corrente. L'assegnazione `value = 'sync'` avviene prima del callback nextTick.

</details>

### Domanda 4: Multiple nextTick

```javascript
for (let i = 0; i < 3; i++) {
    process.nextTick(() => {
        console.log(i);
    });
}
```

**Qual è l'output?**

<details>
<summary>Mostra risposta</summary>

```
3
3
3
```

**Problema:** Closure cattura `i` per riferimento (var) o... aspetta, `let` crea scope!

**Correzione con `let`:**
Usando `let` (come nell'esempio), crea un nuovo scope per ogni iterazione:

```
0
1
2
```

**Con `var` sarebbe stato:**
```javascript
for (var i = 0; i < 3; i++) {
    process.nextTick(() => {
        console.log(i); // 3, 3, 3
    });
}
```

**Soluzione se serve con var:**
```javascript
for (var i = 0; i < 3; i++) {
    process.nextTick(((index) => {
        return () => console.log(index);
    })(i));
}
```

</details>

### Domanda 5: Error Handling

```javascript
try {
    process.nextTick(() => {
        throw new Error('Boom!');
    });
} catch (err) {
    console.log('Caught:', err.message);
}

console.log('End');
```

**Cosa succede?**

<details>
<summary>Mostra risposta</summary>

```
End
(Uncaught Exception: Boom!)
```

**Spiegazione:** Il `try/catch` **non cattura** l'errore perché il callback nextTick viene eseguito in un contesto asincrono diverso, dopo che il try/catch è già terminato.

**Soluzione:**
```javascript
process.nextTick(() => {
    try {
        throw new Error('Boom!');
    } catch (err) {
        console.log('Caught:', err.message);
    }
});
```

O meglio, usa Promise:
```javascript
Promise.resolve()
    .then(() => {
        throw new Error('Boom!');
    })
    .catch(err => {
        console.log('Caught:', err.message);
    });
```

</details>

---

## 💪 Esercizi Pratici

### Esercizio 1: Event Emitter con nextTick

Implementa un EventEmitter che usa nextTick per garantire che i listener siano registrati prima dell'emissione.

<details>
<summary>Soluzione</summary>

```javascript
class SafeEventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }
    
    emit(event, ...args) {
        // Usa nextTick per garantire listener pronti
        process.nextTick(() => {
            const listeners = this.events[event] || [];
            listeners.forEach(listener => {
                try {
                    listener(...args);
                } catch (err) {
                    console.error('Listener error:', err);
                }
            });
        });
    }
    
    off(event, listener) {
        if (!this.events[event]) return;
        
        this.events[event] = this.events[event].filter(
            l => l !== listener
        );
    }
}

// Test
const emitter = new SafeEventEmitter();

// Emetti PRIMA di registrare listener
emitter.emit('data', { value: 42 });

// Registra listener DOPO
emitter.on('data', (data) => {
    console.log('Received:', data);
});

// Output: Received: { value: 42 }
```

</details>

### Esercizio 2: Async Queue Processor

Crea una coda che processa item uno alla volta usando nextTick.

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
                this.processNext();
            }
        });
    }
    
    processNext() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }
        
        this.processing = true;
        const { task, resolve, reject } = this.queue.shift();
        
        // Usa nextTick per processare il task
        process.nextTick(async () => {
            try {
                const result = await task();
                resolve(result);
            } catch (err) {
                reject(err);
            } finally {
                this.processNext();
            }
        });
    }
}

// Test
const queue = new AsyncQueue();

async function delay(ms, value) {
    return new Promise(resolve => {
        setTimeout(() => resolve(value), ms);
    });
}

queue.enqueue(() => delay(100, 'Task 1'));
queue.enqueue(() => delay(50, 'Task 2'));
queue.enqueue(() => delay(75, 'Task 3'));

console.log('All tasks enqueued');
```

</details>

### Esercizio 3: Debouncer con nextTick

Implementa un debouncer che usa nextTick per collezionare chiamate nello stesso tick.

<details>
<summary>Soluzione</summary>

```javascript
function debounceNextTick(fn) {
    let pending = false;
    let args = null;
    
    return function(...newArgs) {
        args = newArgs;
        
        if (!pending) {
            pending = true;
            
            process.nextTick(() => {
                pending = false;
                fn.apply(this, args);
                args = null;
            });
        }
    };
}

// Test
const debouncedLog = debounceNextTick((msg) => {
    console.log('Logged:', msg);
});

// Chiamate multiple nello stesso tick
debouncedLog('First');
debouncedLog('Second');
debouncedLog('Third');

// Output (solo una volta):
// Logged: Third
```

</details>

---

## 📚 Risorse Aggiuntive

### 📖 Documentazione

- [Node.js process.nextTick() Official Docs](https://nodejs.org/api/process.html#process_process_nexttick_callback_args)
- [Event Loop Guide](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Don't Block the Event Loop](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)

### 📝 Articoli

- [Understanding process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#process-nexttick)
- [Microtasks and Macrotasks](https://javascript.info/event-loop)
- [Node.js Best Practices - nextTick](https://github.com/goldbergyoni/nodebestpractices)

### 🎥 Video

- [The Node.js Event Loop](https://www.youtube.com/watch?v=PNa9OMajw9w)
- [Philip Roberts: Event Loop](https://www.youtube.com/watch?v=8aGhZQkoFbQ)

---

## 🎯 Riepilogo Chiave

### ✅ Concetti Fondamentali

1. **process.nextTick() = Priorità Massima**
   - Eseguito dopo codice sync, prima di tutto il resto
   - Svuota completamente la queue prima di continuare

2. **Quando Usare**
   - Garantire ordine di esecuzione
   - Rendere callback consistenti (sync/async)
   - Emettere eventi dopo costruzione
   - Gestire errori in modo asincrono

3. **Quando NON Usare**
   - Delay temporali (usa setTimeout)
   - Operazioni CPU-intensive (usa Worker Threads)
   - Ricorsione senza limite (usa setImmediate)
   - Sostituto di Promise (usa async/await)

4. **Pericoli**
   - ⚠️ Ricorsione infinita blocca tutto
   - ⚠️ Overhead significativo se abusato
   - ⚠️ Memory leak con closure

### 📊 Ordine di Priorità

```
1. Codice Sincrono
2. process.nextTick()  ← TU SEI QUI
3. Promise microtasks
4. queueMicrotask()
5. setTimeout/setInterval
6. I/O callbacks
7. setImmediate()
8. close callbacks
```

### 🚀 Best Practices

| ✅ DO | ❌ DON'T |
|-------|----------|
| Usa per garantire ordine | Non usare per delay |
| Rendi callback consistenti | Non creare ricorsione infinita |
| Emetti eventi dopo costruzione | Non sostituire Promise |
| Gestisci errori async | Non abusare (overhead!) |
| Limita ricorsione | Non bloccare Event Loop |

## Navigazione

- [← Precedente: Microtask Queue in Node.js](<AB - microtask.md>)
- [↑ Indice dell’esercitazione](README.md)
- [Successiva: setTimeout() e setInterval() in Node.js →](<AC - setTimeout_setInterval.md>)
