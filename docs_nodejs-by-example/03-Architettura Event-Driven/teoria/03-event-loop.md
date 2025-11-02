# Event Loop: Il Motore di Node.js

## Introduzione

L'Event Loop è il meccanismo che permette a Node.js di eseguire operazioni non-bloccanti nonostante JavaScript sia single-thread.

```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

## Le 6 Fasi dell'Event Loop

### 1. TIMERS
Esegue callback di `setTimeout()` e `setInterval()`.

```javascript
console.log('1. Start');

setTimeout(() => {
  console.log('3. Timer callback (0ms)');
}, 0);

console.log('2. End');

// Output:
// 1. Start
// 2. End
// 3. Timer callback (0ms)
```

**Dettaglio:**
```javascript
const start = Date.now();

setTimeout(() => {
  const delay = Date.now() - start;
  console.log(`Timer executed after ${delay}ms`);
}, 100);

// Blocking operation
let sum = 0;
for (let i = 0; i < 1e9; i++) {
  sum += i;
}

// Output: Timer executed after ~500ms (non 100ms!)
// Il timer viene eseguito DOPO che il blocking code finisce
```

### 2. PENDING CALLBACKS
Esegue I/O callback posticipati dal ciclo precedente (es. errori TCP).

```javascript
const net = require('net');

const server = net.createServer((socket) => {
  socket.on('error', (err) => {
    // Eseguito nella fase PENDING CALLBACKS
    console.log('Socket error:', err.message);
  });
});

server.listen(8080);
```

### 3. IDLE, PREPARE
Fase interna usata solo da Node.js.

### 4. POLL
La fase più importante: recupera nuovi eventi I/O.

```javascript
const fs = require('fs');

console.log('1. Start');

// File I/O - eseguito in POLL phase
fs.readFile('file.txt', (err, data) => {
  console.log('3. File read complete');
  
  setTimeout(() => {
    console.log('5. setTimeout dopo readFile');
  }, 0);
  
  setImmediate(() => {
    console.log('4. setImmediate dopo readFile');
  });
});

console.log('2. End');

// Output:
// 1. Start
// 2. End
// 3. File read complete
// 4. setImmediate dopo readFile  (CHECK phase, prima di timers!)
// 5. setTimeout dopo readFile
```

**Comportamento POLL:**
```javascript
// Se la coda POLL è VUOTA:
// 1. Se ci sono setImmediate(), va a CHECK phase
// 2. Altrimenti ASPETTA nuovi eventi (fino a timer scaduto)

const fs = require('fs');

setTimeout(() => {
  console.log('Timeout');
}, 100);

// Poll phase aspetterà fino a che readFile finisce
// o timeout scade
fs.readFile('large-file.txt', () => {
  console.log('File done');
});
```

### 5. CHECK
Esegue callback di `setImmediate()`.

```javascript
setImmediate(() => {
  console.log('Immediate 1');
});

setImmediate(() => {
  console.log('Immediate 2');
});

setTimeout(() => {
  console.log('Timeout');
}, 0);

// Output (può variare!):
// Timeout
// Immediate 1
// Immediate 2
// oppure
// Immediate 1
// Immediate 2
// Timeout
```

### 6. CLOSE CALLBACKS
Esegue callback di chiusura (es. `socket.on('close')`).

```javascript
const net = require('net');

const socket = new net.Socket();

socket.on('close', () => {
  console.log('Socket closed');
  // Eseguito nella fase CLOSE CALLBACKS
});

socket.connect(8080, 'localhost', () => {
  socket.destroy();
});
```

## Code Speciali: Microtasks e NextTick

### Microtask Queue
Eseguita DOPO ogni fase dell'Event Loop.

```javascript
Promise.resolve().then(() => {
  console.log('Promise 1');
});

process.nextTick(() => {
  console.log('nextTick 1');
});

Promise.resolve().then(() => {
  console.log('Promise 2');
});

process.nextTick(() => {
  console.log('nextTick 2');
});

// Output:
// nextTick 1
// nextTick 2
// Promise 1
// Promise 2
```

**Ordine di esecuzione:**

```
┌─────────────────────────────┐
│   Fase Event Loop (es. Timer)  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   NextTick Queue            │  ← Eseguita PER PRIMA
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   Microtask Queue (Promise) │  ← Poi le Promise
└──────────┬──────────────────┘
           │
           ▼
     Prossima Fase
```

### Esempio Completo

```javascript
setTimeout(() => {
  console.log('1. setTimeout');
  
  Promise.resolve().then(() => {
    console.log('2. Promise in setTimeout');
  });
  
  process.nextTick(() => {
    console.log('3. nextTick in setTimeout');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('4. Promise');
});

process.nextTick(() => {
  console.log('5. nextTick');
});

console.log('6. Sync');

// Output:
// 6. Sync                      (codice sincrono)
// 5. nextTick                  (nextTick queue)
// 4. Promise                   (microtask queue)
// 1. setTimeout                (timers phase)
// 3. nextTick in setTimeout    (nextTick queue dopo timer)
// 2. Promise in setTimeout     (microtask queue dopo nextTick)
```

## setTimeout vs setImmediate

### Comportamento Variabile (Top-Level)

```javascript
// Nel main module (top-level):
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});

// Output può essere:
// timeout → immediate
// oppure
// immediate → timeout
// (dipende dal carico sistema!)
```

**Perché?**
- `setTimeout(fn, 0)` → effettivamente 1ms
- Se Event Loop entra in TIMERS prima che 1ms passi: immediate first
- Se 1ms già passato: timeout first

### Comportamento Deterministic (I/O Callback)

```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout');
  }, 0);
  
  setImmediate(() => {
    console.log('immediate');
  });
});

// Output SEMPRE:
// immediate
// timeout

// Perché? Siamo in POLL phase, prossima fase è CHECK (setImmediate)
```

## process.nextTick() - Attenzione!

### Potenziale Blocco Event Loop

```javascript
// ❌ PROBLEMA: Event Loop bloccato!
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
}

recursiveNextTick();

// setTimeout non verrà MAI eseguito!
setTimeout(() => {
  console.log('This never runs');
}, 100);
```

**Perché?** NextTick queue viene svuotata completamente prima di continuare.

### Uso Corretto

```javascript
// ✅ Posticipa esecuzione DOPO codice sincrono corrente
class AsyncResource {
  constructor(callback) {
    // Garantisce che callback sia sempre async
    process.nextTick(() => {
      callback();
    });
  }
}

// Comportamento consistente:
new AsyncResource(() => {
  console.log('2. Callback');
});

console.log('1. Constructor done');

// Output sempre:
// 1. Constructor done
// 2. Callback
```

## Esempio Completo: Ordine di Esecuzione

```javascript
console.log('1. Script start');

setTimeout(() => {
  console.log('2. setTimeout 0');
  
  process.nextTick(() => {
    console.log('3. nextTick in setTimeout');
  });
}, 0);

setTimeout(() => {
  console.log('4. setTimeout 10');
}, 10);

setImmediate(() => {
  console.log('5. setImmediate');
  
  process.nextTick(() => {
    console.log('6. nextTick in setImmediate');
  });
});

Promise.resolve().then(() => {
  console.log('7. Promise 1');
}).then(() => {
  console.log('8. Promise 2');
});

process.nextTick(() => {
  console.log('9. nextTick 1');
  
  process.nextTick(() => {
    console.log('10. nextTick nested');
  });
});

process.nextTick(() => {
  console.log('11. nextTick 2');
});

console.log('12. Script end');

// Output:
// 1. Script start              (sync)
// 12. Script end               (sync)
// 9. nextTick 1                (nextTick queue)
// 11. nextTick 2               (nextTick queue)
// 10. nextTick nested          (nextTick queue)
// 7. Promise 1                 (microtask queue)
// 8. Promise 2                 (microtask queue)
// 2. setTimeout 0              (timers phase)
// 3. nextTick in setTimeout    (nextTick after timer)
// 5. setImmediate              (check phase)
// 6. nextTick in setImmediate  (nextTick after immediate)
// 4. setTimeout 10             (timers phase next iteration)
```

## Visualizzazione Completa

```javascript
const fs = require('fs');

console.log('START');

// TIMERS
setTimeout(() => console.log('TIMER 1'), 0);
setTimeout(() => console.log('TIMER 2'), 0);

// CHECK
setImmediate(() => console.log('IMMEDIATE 1'));
setImmediate(() => console.log('IMMEDIATE 2'));

// POLL (I/O)
fs.readFile(__filename, () => {
  console.log('FILE READ');
  
  setTimeout(() => console.log('TIMER IN I/O'), 0);
  setImmediate(() => console.log('IMMEDIATE IN I/O'));
  
  process.nextTick(() => console.log('NEXTTICK IN I/O'));
});

// MICROTASKS
Promise.resolve().then(() => console.log('PROMISE 1'));
Promise.resolve().then(() => console.log('PROMISE 2'));

// NEXTTICK
process.nextTick(() => console.log('NEXTTICK 1'));
process.nextTick(() => console.log('NEXTTICK 2'));

console.log('END');

// Output:
// START
// END
// NEXTTICK 1
// NEXTTICK 2
// PROMISE 1
// PROMISE 2
// TIMER 1
// TIMER 2
// IMMEDIATE 1
// IMMEDIATE 2
// FILE READ
// NEXTTICK IN I/O
// IMMEDIATE IN I/O
// TIMER IN I/O
```

## Blocking vs Non-Blocking

### Codice Bloccante (❌)

```javascript
const fs = require('fs');

console.log('Start');

// BLOCCA Event Loop!
const data = fs.readFileSync('large-file.txt');
console.log('File read');

setTimeout(() => {
  console.log('Timer'); // Ritardato dal sync I/O!
}, 10);

console.log('End');
```

### Codice Non-Bloccante (✅)

```javascript
const fs = require('fs');

console.log('Start');

fs.readFile('large-file.txt', (err, data) => {
  console.log('File read'); // Eseguito quando pronto
});

setTimeout(() => {
  console.log('Timer'); // Eseguito on-time
}, 10);

console.log('End');
```

## Pattern Anti-Starvation

### Problema: CPU-Intensive Task

```javascript
// ❌ Blocca Event Loop per 5 secondi!
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

fibonacci(45); // ~5 secondi di blocking!
```

### Soluzione 1: Chunking con setImmediate

```javascript
function processArray(array, chunkSize, processor) {
  let index = 0;
  
  function processChunk() {
    const endIndex = Math.min(index + chunkSize, array.length);
    
    for (; index < endIndex; index++) {
      processor(array[index]);
    }
    
    if (index < array.length) {
      setImmediate(processChunk); // Cede controllo all'Event Loop
    }
  }
  
  processChunk();
}

// Uso
const largeArray = new Array(1000000).fill(0).map((_, i) => i);

processArray(largeArray, 10000, (item) => {
  // Process item
});

// Event Loop NON bloccato, può gestire altre richieste!
```

### Soluzione 2: Worker Threads

```javascript
const { Worker } = require('worker_threads');

function runFibonacci(n) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`
      const { parentPort, workerData } = require('worker_threads');
      
      function fibonacci(n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
      }
      
      parentPort.postMessage(fibonacci(workerData.n));
    `, { eval: true, workerData: { n } });
    
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}

// Event Loop libero mentre Worker calcola!
runFibonacci(45).then(result => {
  console.log('Fibonacci result:', result);
});
```

## Best Practices

### 1. Preferisci Async su Sync

```javascript
// ❌ BAD
const data = fs.readFileSync('file.txt');

// ✅ GOOD
fs.readFile('file.txt', (err, data) => {
  // ...
});

// ✅ BETTER
const data = await fs.promises.readFile('file.txt');
```

### 2. Evita Long-Running Sync Code

```javascript
// ❌ BAD: Event Loop bloccato
app.get('/process', (req, res) => {
  const result = expensiveCalculation(); // 2 secondi!
  res.json(result);
});

// ✅ GOOD: Chunking
app.get('/process', async (req, res) => {
  const result = await expensiveCalculationChunked();
  res.json(result);
});

// ✅ BEST: Worker Thread
app.get('/process', async (req, res) => {
  const result = await runInWorker(expensiveCalculation);
  res.json(result);
});
```

### 3. Gestisci nextTick con Cautela

```javascript
// ❌ BAD: Rischio infinite loop
function maybeAsync(callback) {
  if (cache.has(key)) {
    process.nextTick(() => callback(cache.get(key)));
  } else {
    fetchData(key, callback);
  }
}

// ✅ GOOD: Usa setImmediate per evitare starvation
function maybeAsync(callback) {
  if (cache.has(key)) {
    setImmediate(() => callback(cache.get(key)));
  } else {
    fetchData(key, callback);
  }
}
```

### 4. Monitora Event Loop Lag

```javascript
const start = Date.now();

setInterval(() => {
  const lag = Date.now() - start - 1000;
  
  if (lag > 100) {
    console.warn(`Event Loop lag: ${lag}ms`);
  }
}, 1000);
```

## Debugging Event Loop

### 1. --trace-warnings

```bash
node --trace-warnings app.js
```

### 2. async_hooks (Advanced)

```javascript
const async_hooks = require('async_hooks');

const hooks = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId) {
    console.log(`${type}(${asyncId}): triggered by ${triggerAsyncId}`);
  }
});

hooks.enable();
```

### 3. Librerie di Monitoring

```javascript
// npm install blocked-at
const blocked = require('blocked-at');

blocked((time, stack) => {
  console.log(`Blocked for ${time}ms`);
  console.log(stack);
});
```

## Conclusioni

L'Event Loop:
- ✅ Permette I/O non-bloccante
- ✅ 6 fasi principali + microtasks
- ✅ nextTick ha priorità massima
- ⚠️ Può essere bloccato da codice CPU-intensive
- ⚠️ Richiede comprensione profonda per debugging

## Prossimi Passi

- [Pattern Event-Driven Avanzati](./04-pattern-avanzati.md)
- [Gestione Errori negli Eventi](./05-gestione-errori.md)
- [Esempi Pratici](../esempi/)

## Risorse

- [Node.js Event Loop Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [libuv Design Overview](http://docs.libuv.org/en/v1.x/design.html)
- [Understanding Event Loop](https://blog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810)
