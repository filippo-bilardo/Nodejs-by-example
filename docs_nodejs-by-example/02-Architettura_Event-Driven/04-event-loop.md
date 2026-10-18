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
- Per cancellare: `clearInterval(intervalId)`, dove `intervalId` è l'ID restituito da `setInterval()`.

Esempio di ritardo causato da codice bloccante:
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


#### 📋 **Pending Callbacks Phase**
```javascript
// Callback I/O differiti (es: errori TCP)
```
- Esegue callback di alcune operazioni di sistema
- Raramente utilizzata dal codice utente

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
- Se la poll queue **non è vuota**: esegue callback in modo sincrono fino a esaurimento o limite sistema
- Se la poll queue **è vuota**:
  - Se ci sono `setImmediate()` programmati → va alla fase **check**
  - Altrimenti, attende nuovi eventi

```javascript
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

#### ✅ **Check Phase**
```javascript
// Esegue callback di setImmediate()
setImmediate(() => {
    console.log('Immediate eseguito!');
});
```
- Eseguito subito dopo la fase poll
- `setImmediate()` è progettato per eseguire script dopo il completamento della fase poll

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
// Codice sincrono
console.log('1. Inizio');

// Timer
setTimeout(() => {
    console.log('4. Timer 0ms');
}, 0);

// Immediate
setImmediate(() => {
    console.log('5. Immediate');
});

// Microtask: process.nextTick
process.nextTick(() => {
    console.log('2. Next Tick');
});

// Microtask: Promise
Promise.resolve().then(() => {
    console.log('3. Promise');
});

// Codice sincrono
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
// 1. Start    ← Codice sincrono eseguito per primo
// 2. End
// 3. NextTick ← Eseguito PRIMA di qualsiasi altra fase
```

#### 2. Promise Callbacks - Priorità 2
```javascript
console.log('1. Start');

Promise.resolve().then(() => {
    console.log('4. Promise');
});
process.nextTick(() => {
    console.log('3. NextTick');
});

console.log('2. End');

// Output:
// 1. Start
// 2. End
// 3. NextTick ← Eseguito dopo il codice sincrono
// 4. Promise ← Eseguito dopo nextTick ma prima di timer
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

**Ordine di esecuzione:**
```
┌─────────────────────────────┐
│ Fase Event Loop (es. Timer) │
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│   NextTick Queue            │  ← Eseguita PER PRIMA
└──────────┬──────────────────┘
           ▼
┌─────────────────────────────┐
│   Microtask Queue (Promise) │  ← Poi le Promise
└──────────┬──────────────────┘
           ▼
     Prossima Fase
```
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
// 5. ⏱️ Timer 0ms      ← Ordine può variare
// 6. ⚡ Immediate      ← con Immediate
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


## 📚 Risorse Aggiuntive

### 📖 Documentazione
- [Node.js Event Loop Official Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [libuv Design Overview](http://docs.libuv.org/en/v1.x/design.html)
- [V8 JavaScript Engine](https://v8.dev/)
- [Understanding Event Loop](https://blog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810)

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

## Navigazione

- [← Precedente: EventEmitter: Il Cuore degli Eventi](03-eventemitter.md)
- [↑ Indice dell’esercitazione](README.md)
- [Successiva: Gestione Errori negli Eventi →](05-gestione-errori.md)
