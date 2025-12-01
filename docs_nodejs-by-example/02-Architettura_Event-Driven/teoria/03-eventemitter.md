# EventEmitter: Il Cuore degli Eventi

## Introduzione

**Teoria:** `EventEmitter` è una classe fondamentale di Node.js che implementa il **Pattern Observer** (o Publish-Subscribe). Questo pattern permette di creare un sistema di comunicazione loosely-coupled tra diverse parti dell'applicazione.

### Pattern Observer: Come Funziona

**Concetto Base:**
- **Publisher (Emitter)**: Oggetto che emette eventi quando succede qualcosa
- **Subscriber (Listener)**: Funzione che viene eseguita quando l'evento viene emesso
- **Disaccoppiamento**: Publisher non conosce i subscriber, e viceversa

**Vantaggi:**
1. **Loose Coupling**: Componenti indipendenti e riutilizzabili
2. **Estensibilità**: Aggiungi listener senza modificare emitter
3. **Reattività**: Rispondi automaticamente ai cambiamenti
4. **Multiple Handlers**: Un evento può avere più listener

`EventEmitter` è la base per la maggior parte delle API asincrone di Node.js:
- HTTP Server/Client
- Stream (File, Network)
- Child Processes
- Clusters
- Net Sockets

La classe `EventEmitter` è parte del modulo core `events` e fornisce un meccanismo per:
- **Registrare** funzioni di callback (listener) per specifici eventi
- **Emettere** eventi che attivano l'esecuzione dei listener registrati
- **Gestire** il ciclo di vita degli eventi e dei listener

```javascript
// Import del modulo events
// Questo è un modulo CORE di Node.js, già disponibile
const EventEmitter = require('events');

// EventEmitter è una CLASSE, non un oggetto
// Devi creare istanze o estenderla
console.log(typeof EventEmitter); // 'function' (è una classe)
```

## Concetti Base

### Creazione e Utilizzo

**Teoria:** Esistono due modi principali per usare EventEmitter:
1. **Uso Diretto**: Istanziare EventEmitter direttamente (semplice, per casi base)
2. **Estensione**: Creare classe custom che estende EventEmitter (RACCOMANDATO per oggetti complessi)

```javascript
const EventEmitter = require('events');

// ============================================
// METODO 1: USO DIRETTO
// ============================================
// Utile per: event bus semplici, comunicazione temporanea, prototipi

const emitter = new EventEmitter();

// REGISTRAZIONE LISTENER (SUBSCRIBE)
// - 'event': nome dell'evento (stringa custom)
// - callback: funzione eseguita quando evento emesso
emitter.on('event', () => {
  console.log('Evento ricevuto!');
});

// EMISSIONE EVENTO (PUBLISH)
// - Cerca tutti i listener registrati per 'event'
// - Esegue callback in ORDINE di registrazione
// - Esecuzione SINCRONA (blocca event loop)
emitter.emit('event');
// Output: Evento ricevuto!

// IMPORTANTE: on() registra, emit() esegue
// on() può essere chiamato PRIMA o DOPO emit()
// ma listener eseguito SOLO se registrato PRIMA dell'emit()
```

```javascript
// ============================================
// METODO 2: ESTENDERE EventEmitter (RACCOMANDATO)
// ============================================
// Utile per: oggetti di business, componenti applicativi, API custom

/**
 * Creando una classe custom che estende EventEmitter:
 * - Incapsuli logica di business + eventi
 * - Nascondi dettagli implementativi
 * - Fornisci API pubblica chiara
 * - Migliori manutenibilità e testabilità
 */
class MyEmitter extends EventEmitter {
  constructor() {
    super(); // OBBLIGATORIO: inizializza EventEmitter
    this.data = [];
  }
  
  // Metodo di business che emette eventi
  addData(item) {
    this.data.push(item);
    
    // Emette evento dopo operazione
    // I consumer possono reagire senza conoscere implementazione
    this.emit('data-added', item);
    
    // Emette evento se limite raggiunto
    if (this.data.length >= 10) {
      this.emit('limit-reached', this.data.length);
    }
  }
}

const myEmitter = new MyEmitter();

// REGISTRAZIONE LISTENER
// I consumer registrano interesse negli eventi
myEmitter.on('data-added', (item) => {
  console.log('Nuovo item:', item);
});

myEmitter.on('limit-reached', (count) => {
  console.log(`Limite raggiunto: ${count} items`);
});

// USO: Chiama metodi business, eventi emessi automaticamente
myEmitter.addData('test1'); // Output: Nuovo item: test1
myEmitter.addData('test2'); // Output: Nuovo item: test2

// VANTAGGI:
// 1. Separazione concerns: business logic vs event handling
// 2. API chiara: addData() nasconde emit() interno
// 3. Testabilità: puoi testare con o senza listener
// 4. Riutilizzabilità: stessa logica, listener diversi
```

### Passare Argomenti agli Eventi

**Teoria:** Gli eventi possono trasportare DATI dal publisher ai subscriber. Questo è fondamentale per comunicare informazioni sul COSA è successo.

**Meccanismo:**
1. `emit()` accetta argomenti illimitati dopo il nome evento
2. Questi argomenti sono passati DIRETTAMENTE ai listener
3. Ogni listener riceve gli STESSI argomenti
4. Passaggio per RIFERIMENTO (oggetti) o VALORE (primitivi)

```javascript
const emitter = new EventEmitter();

// ============================================
// ESEMPIO BASE: Argomenti Multipli
// ============================================

// LISTENER: Definisce SIGNATURE che si aspetta
// - username: stringa con nome utente
// - timestamp: oggetto Date con momento login
emitter.on('user-login', (username, timestamp) => {
  console.log(`User ${username} logged in at ${timestamp}`);
  console.log('Tipo username:', typeof username); // 'string'
  console.log('Tipo timestamp:', timestamp instanceof Date); // true
});

// EMIT: Passa argomenti nell'ordine aspettato dal listener
// Argomento 1 → primo parametro listener
// Argomento 2 → secondo parametro listener
// Etc.
emitter.emit('user-login', 'mario', new Date());
// Output: User mario logged in at Sun Nov 30 2025...

// ============================================
// MULTIPLE LISTENERS: Tutti ricevono stessi argomenti
// ============================================

// Listener 1: Logging
emitter.on('user-login', (username, timestamp) => {
  console.log(`[LOG] ${username} - ${timestamp}`);
});

// Listener 2: Analytics
emitter.on('user-login', (username, timestamp) => {
  analytics.track('login', { user: username, time: timestamp });
});

// Listener 3: Notifica
emitter.on('user-login', (username, timestamp) => {
  sendWelcomeEmail(username);
});

// UN SOLO emit() triggerà TUTTI E TRE i listener
emitter.emit('user-login', 'mario', new Date());

// ============================================
// BEST PRACTICE: Usa Oggetto invece di argomenti multipli
// ============================================

// ❌ MALE: Troppi argomenti (difficile manutenzione)
emitter.on('order', (id, userId, items, total, tax, shipping, coupon) => {
  // Difficile ricordare ordine argomenti
});

// ✅ BENE: Oggetto strutturato (auto-documentante)
emitter.on('order', (orderData) => {
  const { id, userId, items, total, tax, shipping, coupon } = orderData;
  // Chiaro e facile da estendere
});

emitter.emit('order', {
  id: '12345',
  userId: 'user-1',
  items: [{ sku: 'ABC', qty: 2 }],
  total: 99.99,
  tax: 8.00,
  shipping: 5.00,
  coupon: 'SAVE10'
});

// VANTAGGI OGGETTO:
// 1. Self-documenting: nomi property spiegano significato
// 2. Ordine irrilevante: destructuring per nome
// 3. Estensibilità: aggiungi property senza rompere listener esistenti
// 4. Opzionalità: property mancanti = undefined (gestibile)
// 5. Type-safety: facile validare con TypeScript/JSDoc
```

## Metodi Principali

### 1. on() / addListener()
Registra un listener permanente per un evento.

```javascript
const emitter = new EventEmitter();

// Sintassi 1
emitter.on('data', (data) => {
  console.log('Data received:', data);
});

// Sintassi 2 (equivalente)
emitter.addListener('data', (data) => {
  console.log('Data received:', data);
});

emitter.emit('data', 'Hello');
emitter.emit('data', 'World');
// Output:
// Data received: Hello
// Data received: World
```

### 2. once()
Listener che si esegue una sola volta, poi si auto-rimuove.

```javascript
const emitter = new EventEmitter();

emitter.once('connection', () => {
  console.log('Prima connessione!');
});

emitter.emit('connection'); // Output: Prima connessione!
emitter.emit('connection'); // Nessun output (listener rimosso)
```

**Caso d'uso reale:**
```javascript
class Server extends EventEmitter {
  start() {
    // Esegui setup solo alla prima connessione
    this.once('first-connection', () => {
      console.log('Inizializzo cache...');
      this.initializeCache();
    });
  }
  
  handleConnection(socket) {
    this.emit('first-connection');
    this.emit('connection', socket);
  }
}
```

### 3. emit()

**Teoria:** `emit()` è il metodo che **pubblica** un evento, triggering l'esecuzione di TUTTI i listener registrati per quell'evento. È il cuore del pattern pub-sub.

**Caratteristiche Cruciali:**
1. **Esecuzione SINCRONA**: Listener eseguiti IMMEDIATAMENTE, uno dopo l'altro
2. **Ordine FIFO**: First In First Out - ordine di registrazione preserved
3. **Blocca Event Loop**: Se listener sono lenti, bloccano tutto
4. **Return boolean**: `true` se ci sono listener, `false` altrimenti

```javascript
const emitter = new EventEmitter();

// Registra due listener per 'test'
emitter.on('test', () => {
  console.log('Listener 1');
});

emitter.on('test', () => {
  console.log('Listener 2');
});

// ============================================
// DIMOSTRAZIONE: Esecuzione SINCRONA
// ============================================

console.log('Prima di emit');

// emit() esegue SUBITO tutti i listener
// Il controllo NON ritorna finché tutti listener non finiscono
const hasListeners = emitter.emit('test');

console.log('Dopo emit');
console.log('Had listeners?', hasListeners); // true

// Output GARANTITO in questo ordine:
// Prima di emit
// Listener 1      ← eseguito DURANTE emit()
// Listener 2      ← eseguito DURANTE emit()
// Dopo emit       ← DOPO che emit() ha finito
// Had listeners? true

// ============================================
// IMPLICAZIONI: Listener lento blocca tutto
// ============================================

emitter.on('slow', () => {
  console.log('Inizio operazione lenta...');
  
  // Simulazione operazione CPU-intensive
  // ⚠️ BLOCCA EVENT LOOP!
  const start = Date.now();
  while (Date.now() - start < 1000) {
    // Busy-wait 1 secondo
  }
  
  console.log('Fine operazione lenta');
});

console.log('Prima');
emitter.emit('slow'); // BLOCCA qui per 1 secondo
console.log('Dopo'); // Eseguito solo dopo 1 secondo

// Durante quel secondo:
// - Event loop BLOCCATO
// - Nessuna I/O processata
// - Server non risponde a richieste
// - Timer non eseguiti

// ============================================
// SOLUZIONE: Listener asincroni con setImmediate
// ============================================

emitter.on('async-event', () => {
  // NON bloccare: schedula esecuzione asincrona
  setImmediate(() => {
    console.log('Eseguito asincronamente');
    // Operazione pesante qui
  });
});

console.log('Prima async emit');
emitter.emit('async-event'); // Ritorna SUBITO
console.log('Dopo async emit'); // Eseguito immediatamente

// Output:
// Prima async emit
// Dopo async emit
// Eseguito asincronamente  ← Dopo, nel prossimo tick
```

**⚠️ IMPORTANTE**: I listener vengono eseguiti **sincronamente** nell'ordine di registrazione!

```javascript
const emitter = new EventEmitter();

// Ordine registrazione: 1 → 2 → 3
emitter.on('data', () => {
  console.log('1');
});

emitter.on('data', () => {
  console.log('2');
});

emitter.on('data', () => {
  console.log('3');
});

// Esecuzione: SEMPRE 1 → 2 → 3
emitter.emit('data');
// Output: 1, 2, 3 (GARANTITO questo ordine)

// ============================================
// RETURN VALUE: Indica presenza listener
// ============================================

const result1 = emitter.emit('data');
console.log(result1); // true (ci sono 3 listener)

const result2 = emitter.emit('non-esistente');
console.log(result2); // false (nessun listener)

// UTILE PER: Verificare se qualcuno è in ascolto
if (!emitter.emit('optional-event')) {
  console.log('Nessuno interessato a questo evento');
}

// ============================================
// EDGE CASE: Listener che registra altri listener
// ============================================

emitter.on('recursive', () => {
  console.log('Listener originale');
  
  // Registra NUOVO listener durante esecuzione
  emitter.on('recursive', () => {
    console.log('Listener aggiunto dinamicamente');
  });
});

emitter.emit('recursive');
// Output: Listener originale
// (nuovo listener NON eseguito in questo emit)

emitter.emit('recursive');
// Output:
// Listener originale
// Listener aggiunto dinamicamente
// (nuovo listener eseguito da secondo emit in poi)
```

### 4. removeListener() / off()
Rimuove un listener specifico.

```javascript
const emitter = new EventEmitter();

function onData(data) {
  console.log('Data:', data);
}

emitter.on('data', onData);
emitter.emit('data', 'test1'); // Output: Data: test1

emitter.removeListener('data', onData);
// oppure
emitter.off('data', onData);

emitter.emit('data', 'test2'); // Nessun output
```

**⚠️ ATTENZIONE**: Funzioni anonime non possono essere rimosse!

```javascript
// ❌ PROBLEMA
emitter.on('data', () => {
  console.log('Cannot remove this!');
});

// Non c'è modo di rimuovere questo listener
// perché non abbiamo un riferimento alla funzione

// ✅ SOLUZIONE
const handler = () => {
  console.log('Can remove this!');
};

emitter.on('data', handler);
emitter.removeListener('data', handler); // OK!
```

### 5. removeAllListeners()
Rimuove tutti i listener per un evento (o tutti gli eventi).

```javascript
const emitter = new EventEmitter();

emitter.on('data', () => console.log('1'));
emitter.on('data', () => console.log('2'));
emitter.on('error', () => console.log('Error'));

// Rimuove tutti i listener per 'data'
emitter.removeAllListeners('data');

// Rimuove TUTTI i listener per TUTTI gli eventi
emitter.removeAllListeners();
```

### 6. prependListener()
Aggiunge listener all'inizio della lista (eseguito per primo).

```javascript
const emitter = new EventEmitter();

emitter.on('event', () => {
  console.log('Secondo');
});

emitter.prependListener('event', () => {
  console.log('Primo!');
});

emitter.emit('event');
// Output:
// Primo!
// Secondo
```

### 7. listeners() e listenerCount()
Informazioni sui listener registrati.

```javascript
const emitter = new EventEmitter();

const listener1 = () => console.log('1');
const listener2 = () => console.log('2');

emitter.on('data', listener1);
emitter.on('data', listener2);

console.log(emitter.listenerCount('data')); // 2
console.log(emitter.listeners('data')); // [Function: listener1, Function: listener2]

// Ottieni tutti i nomi degli eventi
console.log(emitter.eventNames()); // ['data']
```

## Gestione Errori

### L'Evento Speciale 'error'

**Teoria:** L'evento `'error'` è un CASO SPECIALE in EventEmitter con comportamento unico e critico per la stabilità dell'applicazione.

**Comportamento Speciale:**
1. Se `emit('error')` viene chiamato SENZA listener → **CRASH APPLICAZIONE**
2. Node.js lancia `Error` che, se non caught, termina il processo
3. È l'UNICO evento con questo comportamento
4. Design pattern: "fail fast" se errori non gestiti

**Perché questo design?**
- Errori ignorati causano bugs silenziosi e stati corrotti
- Meglio crashare subito che continuare con stato inconsistente
- Forza developer a gestire esplicitamente gli errori

```javascript
const EventEmitter = require('events');
const emitter = new EventEmitter();

// ============================================
// ❌ SCENARIO 1: CRASH - Nessun handler
// ============================================

console.log('Prima emit error');

// ⚠️ QUESTO CAUSA CRASH IMMEDIATO
try {
  emitter.emit('error', new Error('Qualcosa è andato storto'));
} catch (err) {
  // ⚠️ try-catch NON FUNZIONA con emit('error')!
  // L'errore è lanciato da Node.js DOPO emit()
  console.log('Questo non verrà mai eseguito');
}

// Output:
// Prima emit error
// 
// events.js:xxx
//       throw er; // Unhandled 'error' event
//       ^
// Error: Qualcosa è andato storto
//     at ...
// 
// Processo TERMINATO con exit code 1

console.log('Dopo emit error'); // MAI eseguito

// ============================================
// ✅ SCENARIO 2: SAFE - Con handler
// ============================================

const safeEmitter = new EventEmitter();

// REGISTRA HANDLER PRIMA DI QUALSIASI emit('error')
safeEmitter.on('error', (err) => {
  // Errore CATTURATO qui
  console.error('Error caught:', err.message);
  console.error('Stack:', err.stack);
  
  // Qui puoi:
  // 1. Loggare errore (file, database, Sentry)
  // 2. Notificare amministratori (email, Slack)
  // 3. Tentare recovery (retry, fallback)
  // 4. Cleanup risorse (chiudi connessioni)
  // 5. Decidere se continuare o terminare gracefully
});

console.log('Prima emit error');
safeEmitter.emit('error', new Error('Errore gestito'));
console.log('Dopo emit error'); // ✓ ESEGUITO

// Output:
// Prima emit error
// Error caught: Errore gestito
// Stack: Error: Errore gestito at ...
// Dopo emit error  ← Processo CONTINUA

// ============================================
// BEST PRACTICE: Handler di default
// ============================================

/**
 * Crea EventEmitter con handler errori di default
 * Previene crash accidentali
 */
function createSafeEmitter() {
  const emitter = new EventEmitter();
  
  // Handler di default che previene crash
  emitter.on('error', (err) => {
    console.error('[EventEmitter Error]', err);
    
    // Emetti evento secondario per gestione custom (opzionale)
    emitter.emit('unhandledError', err);
  });
  
  return emitter;
}

const safest = createSafeEmitter();

// Anche senza handler custom, non crasha
safest.emit('error', new Error('Safe!')); // OK, logged

// Handler custom (opzionale)
safest.on('unhandledError', (err) => {
  sendToSentry(err);
});

// ============================================
// MULTIPLE ERROR HANDLERS: Tutti eseguiti
// ============================================

const multi = new EventEmitter();

// Handler 1: Logging
multi.on('error', (err) => {
  console.error('[LOG]', err.message);
});

// Handler 2: Metrics
multi.on('error', (err) => {
  metrics.increment('errors', { type: err.code });
});

// Handler 3: Alerting
multi.on('error', (err) => {
  if (err.severity === 'critical') {
    sendAlert(err);
  }
});

multi.emit('error', new Error('Test'));
// TUTTI E TRE gli handler vengono eseguiti
// Processo NON crasha

// ============================================
// PATTERN: Error-first callback style
// ============================================

class AsyncEmitter extends EventEmitter {
  doAsyncWork() {
    setTimeout(() => {
      // Simulazione operazione che può fallire
      if (Math.random() > 0.5) {
        // Successo
        this.emit('data', { result: 'success' });
      } else {
        // Fallimento: emit error
        this.emit('error', new Error('Async operation failed'));
      }
    }, 100);
  }
}

const asyncEmitter = new AsyncEmitter();

// SEMPRE registra error handler PRIMA di operazioni async
asyncEmitter.on('error', (err) => {
  console.error('Async error:', err.message);
});

asyncEmitter.on('data', (data) => {
  console.log('Success:', data);
});

asyncEmitter.doAsyncWork();

// ============================================
// NOTA: Altri eventi non hanno comportamento speciale
// ============================================

emitter.emit('warning', 'This is fine'); // OK, nessun listener richiesto
emitter.emit('info', 'This is fine');    // OK, nessun listener richiesto
emitter.emit('custom', 'This is fine');  // OK, nessun listener richiesto

// SOLO 'error' richiede handler obbligatorio!
```

### Pattern di Gestione Errori

```javascript
class SafeEmitter extends EventEmitter {
  safeEmit(event, ...args) {
    try {
      this.emit(event, ...args);
    } catch (err) {
      this.emit('error', err);
    }
  }
}

const emitter = new SafeEmitter();

emitter.on('error', (err) => {
  console.error('Error:', err.message);
});

emitter.on('data', () => {
  throw new Error('Oops!');
});

emitter.safeEmit('data'); // Cattura l'errore
```

## Limiti e Warning

### Max Listeners Warning

**Teoria:** EventEmitter include un meccanismo di **protezione contro memory leak** che emette warning quando troppi listener sono registrati per lo stesso evento.

**Perché questo limite?**
1. **Memory Leak Detection**: Molti listener = possibile bug (listener non rimossi)
2. **Performance Warning**: Più listener = emit() più lento
3. **Code Smell**: >10 listener per stesso evento spesso indica design problem

**Default Limit:** 10 listener per evento

**Come funziona:**
- Node.js conta listener per OGNI evento
- Quando superi limite → warning su stderr
- Warning NON blocca esecuzione (solo avviso)
- Listener continuano a funzionare normalmente

```javascript
const EventEmitter = require('events');
const emitter = new EventEmitter();

// ============================================
// DEMO: Trigger del warning
// ============================================

console.log('Aggiunta listener...');

// Registra 11 listener (supera limite di 10)
for (let i = 0; i < 11; i++) {
  emitter.on('data', () => {
    console.log(`Listener ${i + 1}`);
  });
  
  // Mostra count corrente
  if (i === 9 || i === 10) {
    console.log(`  Listener count: ${emitter.listenerCount('data')}`);
  }
}

// Output su stderr (non stdout):
// (node:12345) MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
// 11 data listeners added to [EventEmitter].
// Use emitter.setMaxListeners() to increase limit

// ⚠️ NOTA: È un WARNING, non un ERROR
// I listener funzionano comunque:
emitter.emit('data');
// Output: Listener 1, Listener 2, ..., Listener 11 (tutti eseguiti)

// ============================================
// DIAGNOSI: È un problema vero o falso positivo?
// ============================================

// FALSE POSITIVE: Molti listener legittimi
// Esempio: Event bus centrale con molti subscriber
const eventBus = new EventEmitter();

// 15 moduli diversi ascoltano 'app:started'
for (let i = 0; i < 15; i++) {
  eventBus.on('app:started', () => {
    console.log(`Module ${i} initialized`);
  });
}
// ✅ Questo è OK, aumenta limite

// TRUE POSITIVE: Memory leak
function buggyFunction() {
  const emitter = new EventEmitter();
  
  // ❌ LOOP INFINITO che registra listener
  setInterval(() => {
    // PROBLEMA: Registra NUOVO listener ogni secondo
    // I vecchi NON vengono mai rimossi!
    emitter.on('data', () => {
      console.log('Processing...');
    });
    
    // Dopo 11 secondi: warning
    // Dopo 100 secondi: 100 listener (MEMORY LEAK)
  }, 1000);
  
  return emitter;
}

const leaky = buggyFunction();
// Listener count cresce infinitamente → LEAK

// ============================================
// SOLUZIONI
// ============================================

// SOLUZIONE 1: Aumentare limite (se legittimo)
const bus = new EventEmitter();
bus.setMaxListeners(20); // Limite per questo emitter

for (let i = 0; i < 15; i++) {
  bus.on('event', () => {}); // OK, no warning
}

// SOLUZIONE 2: Limite infinito (⚠️ usare con cautela)
const unlimited = new EventEmitter();
unlimited.setMaxListeners(0); // 0 = infinito
// oppure
unlimited.setMaxListeners(Infinity);

// ⚠️ ATTENZIONE: Disabilita protezione memory leak!
// Usa SOLO se sei sicuro che i listener sono gestiti correttamente

// SOLUZIONE 3: Limite globale (tutti gli emitter)
EventEmitter.defaultMaxListeners = 15;

const emitter1 = new EventEmitter(); // limite: 15
const emitter2 = new EventEmitter(); // limite: 15
const emitter3 = new EventEmitter(); // limite: 15

// SOLUZIONE 4: Fix del memory leak (PREFERITA)
function fixedFunction() {
  const emitter = new EventEmitter();
  
  // ✅ Registra listener UNA SOLA VOLTA
  const handler = () => {
    console.log('Processing...');
  };
  
  emitter.on('data', handler);
  
  setInterval(() => {
    // ✅ EMIT solamente, non registrare nuovo listener
    emitter.emit('data');
  }, 1000);
  
  // ✅ Cleanup quando non serve più
  return {
    emitter,
    cleanup: () => {
      emitter.removeListener('data', handler);
    }
  };
}

const fixed = fixedFunction();
// Listener count rimane costante = 1 ✓

// ============================================
// BEST PRACTICE: Monitoring listener count
// ============================================

class MonitoredEmitter extends EventEmitter {
  on(event, listener) {
    const result = super.on(event, listener);
    
    // Log quando listener aggiunti
    const count = this.listenerCount(event);
    console.log(`[${event}] listeners: ${count}`);
    
    // Alert se sospetto memory leak
    if (count > 20) {
      console.warn(`⚠️ Possibile memory leak su evento '${event}'`);
      console.warn('Stack trace:', new Error().stack);
    }
    
    return result;
  }
}

const monitored = new MonitoredEmitter();
monitored.setMaxListeners(30); // Aumenta limite ma monitora

// ============================================
// DEBUGGING: Trova chi registra listener
// ============================================

function debugListeners(emitter, eventName) {
  const listeners = emitter.listeners(eventName);
  
  console.log(`\n=== Debug '${eventName}' ===");
  console.log(`Count: ${listeners.length}`);
  console.log(`Max: ${emitter.getMaxListeners()}`);
  
  listeners.forEach((listener, index) => {
    console.log(`\nListener ${index + 1}:`);
    console.log(listener.toString()); // Mostra codice funzione
  });
}

emitter.on('test', () => { console.log('A'); });
emitter.on('test', () => { console.log('B'); });
emitter.on('test', function namedFunction() { console.log('C'); });

debugListeners(emitter, 'test');
// Mostra tutti e 3 listener con loro codice
```

## Pattern e Best Practices

### 1. Namespace Eventi

```javascript
class UserService extends EventEmitter {
  createUser(user) {
    // ... logic
    
    // Eventi con namespace per chiarezza
    this.emit('user:created', user);
    this.emit('user:email-sent', user.email);
  }
  
  deleteUser(userId) {
    // ... logic
    this.emit('user:deleted', userId);
  }
}
```

### 2. Event Data Object

```javascript
// ✅ GOOD: Oggetto strutturato
emitter.on('order-placed', (event) => {
  const { orderId, userId, total, timestamp } = event;
  console.log(`Order ${orderId} by user ${userId}: $${total}`);
});

emitter.emit('order-placed', {
  orderId: '12345',
  userId: 'user-1',
  total: 99.99,
  timestamp: Date.now(),
  items: [/*...*/]
});

// ❌ BAD: Troppi argomenti
emitter.on('order-placed', (orderId, userId, total, timestamp, items) => {
  // Difficile da mantenere
});
```

### 3. Error-First Pattern

```javascript
class AsyncEmitter extends EventEmitter {
  doAsyncWork() {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        this.emit('data', null, { result: 'success' });
      } else {
        this.emit('data', new Error('Failed'), null);
      }
    }, 100);
  }
}

const emitter = new AsyncEmitter();

emitter.on('data', (err, data) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  console.log('Data:', data);
});
```

### 4. Typed Events con TypeScript

```typescript
interface Events {
  'user:login': (userId: string, timestamp: Date) => void;
  'user:logout': (userId: string) => void;
  'error': (err: Error) => void;
}

class TypedEmitter extends EventEmitter {
  on<K extends keyof Events>(event: K, listener: Events[K]): this {
    return super.on(event, listener);
  }
  
  emit<K extends keyof Events>(
    event: K,
    ...args: Parameters<Events[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}

const emitter = new TypedEmitter();

// Type-safe!
emitter.on('user:login', (userId, timestamp) => {
  // userId: string, timestamp: Date (autocomplete!)
});
```

### 5. Memory Leak Prevention

```javascript
class Component extends EventEmitter {
  constructor() {
    super();
    this.cleanup = this.cleanup.bind(this);
  }
  
  init(externalEmitter) {
    this.externalEmitter = externalEmitter;
    
    // Salva riferimenti per cleanup
    this.handlers = {
      onData: (data) => this.emit('data', data),
      onError: (err) => this.emit('error', err)
    };
    
    externalEmitter.on('data', this.handlers.onData);
    externalEmitter.on('error', this.handlers.onError);
  }
  
  cleanup() {
    if (this.externalEmitter) {
      this.externalEmitter.removeListener('data', this.handlers.onData);
      this.externalEmitter.removeListener('error', this.handlers.onError);
    }
    this.removeAllListeners();
  }
}

// Uso
const component = new Component();
component.init(someEmitter);

// Quando finito:
component.cleanup(); // Previene memory leak!
```

## Esempi Pratici

### 1. Logger System

**Teoria:** Sistema di logging che usa EventEmitter per **separare generazione log da output**. Questo permette:
- **Flessibilità**: Aggiungi output senza modificare logger
- **Multiple Destinations**: Console, file, database, servizi esterni simultaneamente
- **Filtraggio**: Diversi listener per diversi livelli (INFO vs ERROR)
- **Testing**: Mock listener per verificare log senza side effects

```javascript
const EventEmitter = require('events');
const fs = require('fs');

/**
 * Logger che emette eventi per ogni log
 * NON decide COME/DOVE loggare, solo COSA loggare
 */
class Logger extends EventEmitter {
  constructor() {
    super();
    this.logCount = 0; // Statistiche
  }
  
  /**
   * Metodo centrale che emette evento 'log'
   * @param {string} level - INFO, WARN, ERROR, DEBUG
   * @param {string} message - Messaggio da loggare
   */
  log(level, message) {
    this.logCount++;
    
    // Emette evento con OGGETTO strutturato
    // Listener ricevono tutte le info necessarie
    this.emit('log', {
      level,           // Livello log
      message,         // Messaggio
      timestamp: new Date(), // Quando
      pid: process.pid,      // Quale processo
      count: this.logCount   // N-esimo log
    });
  }
  
  // Helper methods per ogni livello
  // Rendono API più user-friendly
  info(message) {
    this.log('INFO', message);
  }
  
  error(message) {
    this.log('ERROR', message);
  }
  
  warn(message) {
    this.log('WARN', message);
  }
  
  debug(message) {
    this.log('DEBUG', message);
  }
}

// ============================================
// SETUP: Creazione logger e listener
// ============================================

const logger = new Logger();

// ============================================
// LISTENER 1: Console Output (Development)
// ============================================

logger.on('log', ({ level, message, timestamp }) => {
  // Formattazione colorata per console
  const colors = {
    INFO: '\x1b[36m',  // Cyan
    WARN: '\x1b[33m',  // Yellow
    ERROR: '\x1b[31m', // Red
    DEBUG: '\x1b[90m'  // Gray
  };
  const reset = '\x1b[0m';
  
  const color = colors[level] || '';
  const time = timestamp.toISOString();
  
  console.log(`${color}[${time}] ${level}:${reset} ${message}`);
});

// ============================================
// LISTENER 2: File Output (Production)
// ============================================

logger.on('log', ({ level, message, timestamp }) => {
  // Formato strutturato per parsing
  // timestamp|level|message
  const line = `${timestamp.toISOString()}|${level}|${message}\n`;
  
  // Append a file (modalità sincrona per semplicità)
  // In produzione: usa stream asincrono
  try {
    fs.appendFileSync('app.log', line);
  } catch (err) {
    console.error('Failed to write log:', err);
  }
});

// ============================================
// LISTENER 3: Error Alerting (Critical)
// ============================================

logger.on('log', ({ level, message, timestamp }) => {
  // Trigger SOLO per errori
  if (level === 'ERROR') {
    // Invia alert a Slack, PagerDuty, etc.
    sendAlertToSlack({
      text: `⚠️ ERROR: ${message}`,
      timestamp: timestamp,
      severity: 'high'
    });
  }
});

// ============================================
// LISTENER 4: Metrics & Analytics
// ============================================

const logStats = {
  INFO: 0,
  WARN: 0,
  ERROR: 0,
  DEBUG: 0
};

logger.on('log', ({ level }) => {
  // Conta log per livello
  logStats[level]++;
});

// Report periodico
setInterval(() => {
  console.log('\n=== Log Statistics ===');
  console.log(JSON.stringify(logStats, null, 2));
}, 60000); // Ogni minuto

// ============================================
// UTILIZZO: Semplice e pulito
// ============================================

logger.info('Application started');
// → Console: [timestamp] INFO: Application started
// → File: timestamp|INFO|Application started
// → Stats: INFO++

logger.error('Database connection failed');
// → Console: [timestamp] ERROR: Database connection failed
// → File: timestamp|ERROR|Database connection failed
// → Slack: Alert inviato
// → Stats: ERROR++

logger.warn('High memory usage');
// → Console, File, Stats (NO Slack)

// ============================================
// VANTAGGI PATTERN:
// ============================================

// 1. SEPARAZIONE CONCERNS
//    - Logger: genera log
//    - Listener: decide output

// 2. FLESSIBILITÀ
//    - Aggiungi listener senza toccare Logger
//    - Diversi output per diversi ambienti

if (process.env.NODE_ENV === 'production') {
  // Production: solo file + alerts
  logger.removeAllListeners('log');
  logger.on('log', fileListener);
  logger.on('log', alertListener);
} else {
  // Development: console + debug
  logger.on('log', consoleListener);
}

// 3. TESTABILITÀ
//    - Mock listener per test

function testLogger() {
  const testLogger = new Logger();
  const logs = [];
  
  // Listener che raccoglie log invece di output
  testLogger.on('log', (logEntry) => {
    logs.push(logEntry);
  });
  
  testLogger.info('Test message');
  
  // Verifica
  assert(logs.length === 1);
  assert(logs[0].level === 'INFO');
  assert(logs[0].message === 'Test message');
}

// 4. ESTENSIBILITÀ
//    - Nuovi livelli senza breaking changes

logger.trace = function(message) {
  this.log('TRACE', message);
};

// Listener esistenti continuano a funzionare

function sendAlertToSlack(alert) {
  // Implementazione invio Slack
  console.log('Slack alert:', alert);
}
```

### 2. Job Queue

**Teoria:** Sistema di code per elaborazione asincrona di task. EventEmitter permette di:
- **Monitorare**: Seguire ciclo di vita di ogni job (added, started, completed, failed)
- **Reagire**: Listener possono implementare retry, logging, notifications
- **Disaccoppiare**: Code non sa chi consuma eventi (metrics, UI, logs)

**Pattern:** Producer-Consumer con eventi per visibilità

```javascript
const EventEmitter = require('events');

/**
 * Job Queue con elaborazione seriale
 * Processa un job alla volta, emette eventi per ogni fase
 */
class JobQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];        // Array di job in attesa
    this.processing = false; // Flag: true se sta processando
    this.stats = {
      total: 0,      // Job totali ricevuti
      completed: 0,  // Job completati
      failed: 0      // Job falliti
    };
  }
  
  /**
   * Aggiunge job alla coda
   * @param {Object} job - Job da eseguire con metodo execute()
   */
  addJob(job) {
    // Validazione
    if (!job || typeof job.execute !== 'function') {
      throw new Error('Job must have execute() method');
    }
    
    // Aggiungi metadata
    job.id = job.id || `job-${Date.now()}-${Math.random()}`;
    job.addedAt = new Date();
    job.attempts = 0;
    
    // Aggiungi a coda
    this.queue.push(job);
    this.stats.total++;
    
    // EVENTO: Job aggiunto
    this.emit('job:added', job);
    
    console.log(`➕ Job ${job.id} aggiunto (queue size: ${this.queue.length})`);
    
    // Trigger elaborazione
    this.processQueue();
  }
  
  /**
   * Processa code in modo seriale
   * Esegue un job alla volta per evitare sovraccarico
   */
  async processQueue() {
    // GUARD: Già in elaborazione O coda vuota
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    // Imposta flag per prevenire elaborazione concorrente
    this.processing = true;
    
    // Estrai primo job (FIFO)
    const job = this.queue.shift();
    job.startedAt = new Date();
    
    // EVENTO: Job iniziato
    this.emit('job:started', job);
    
    console.log(`▶️ Job ${job.id} iniziato`);
    
    try {
      // ESECUZIONE: Attendi completamento job
      job.attempts++;
      const result = await job.execute();
      
      // SUCCESSO
      job.completedAt = new Date();
      job.duration = job.completedAt - job.startedAt;
      this.stats.completed++;
      
      // EVENTO: Job completato
      this.emit('job:completed', { 
        job, 
        result,
        duration: job.duration
      });
      
      console.log(`✅ Job ${job.id} completato in ${job.duration}ms`);
      
    } catch (error) {
      // FALLIMENTO
      job.failedAt = new Date();
      job.error = error;
      this.stats.failed++;
      
      // EVENTO: Job fallito
      this.emit('job:failed', { 
        job, 
        error,
        attempts: job.attempts
      });
      
      console.error(`❌ Job ${job.id} fallito:`, error.message);
      
    } finally {
      // CLEANUP: Resetta flag e processa prossimo job
      this.processing = false;
      
      // Se ci sono altri job, processali
      if (this.queue.length > 0) {
        console.log(`🔁 Prossimo job (${this.queue.length} in coda)...\n`);
        // setImmediate per non bloccare event loop
        setImmediate(() => this.processQueue());
      } else {
        console.log('🏁 Coda vuota\n');
        // EVENTO: Coda vuota
        this.emit('queue:empty');
      }
    }
  }
  
  /**
   * Statistiche correnti
   */
  getStats() {
    return {
      ...this.stats,
      queued: this.queue.length,
      processing: this.processing
    };
  }
}

// ============================================
// SETUP: Listener per monitoraggio
// ============================================

const queue = new JobQueue();

// LISTENER: Log avvio job
queue.on('job:started', (job) => {
  console.log(`  📄 Details: ${JSON.stringify(job.data || {})}`);
});

// LISTENER: Celebra successi
queue.on('job:completed', ({ job, result, duration }) => {
  console.log(`  ✅ Result: ${JSON.stringify(result)}`);
  
  // Metrics
  metrics.timing('job.duration', duration, { job: job.name });
});

// LISTENER: Gestisci fallimenti con retry
queue.on('job:failed', ({ job, error, attempts }) => {
  console.error(`  ❌ Error: ${error.message}`);
  console.error(`  🔁 Attempts: ${attempts}`);
  
  // RETRY LOGIC: Riprova max 3 volte
  if (attempts < 3) {
    console.log(`  ⏱️  Scheduling retry in 5 seconds...`);
    
    setTimeout(() => {
      console.log(`  🔁 Retrying job ${job.id}...`);
      queue.addJob(job);
    }, 5000);
  } else {
    console.error(`  ⚠️  Max retries reached, moving to dead letter queue`);
    deadLetterQueue.add(job);
  }
});

// LISTENER: Notifica quando coda vuota
queue.on('queue:empty', () => {
  console.log('\n📊 Stats:', queue.getStats());
});

// ============================================
// UTILIZZO: Aggiungi job
// ============================================

// Job 1: Successo
queue.addJob({
  name: 'send-email',
  data: { to: 'user@example.com' },
  execute: async () => {
    // Simula invio email (2 secondi)
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { sent: true, messageId: '12345' };
  }
});

// Job 2: Fallimento (sarà ritentato)
queue.addJob({
  name: 'process-payment',
  data: { amount: 99.99 },
  execute: async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simula errore
    throw new Error('Payment gateway timeout');
  }
});

// Job 3: Successo
queue.addJob({
  name: 'generate-report',
  data: { reportId: 'R-2025-001' },
  execute: async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return { url: '/reports/R-2025-001.pdf' };
  }
});

// ============================================
// OUTPUT ESEMPIO:
// ============================================
/*
➕ Job job-xxx-1 aggiunto (queue size: 1)
▶️ Job job-xxx-1 iniziato
  📄 Details: {"to":"user@example.com"}
✅ Job job-xxx-1 completato in 2003ms
  ✅ Result: {"sent":true,"messageId":"12345"}
🔁 Prossimo job (2 in coda)...

▶️ Job job-xxx-2 iniziato
  📄 Details: {"amount":99.99}
❌ Job job-xxx-2 fallito: Payment gateway timeout
  ❌ Error: Payment gateway timeout
  🔁 Attempts: 1
  ⏱️  Scheduling retry in 5 seconds...
🔁 Prossimo job (1 in coda)...

...
*/

// ============================================
// VANTAGGI PATTERN:
// ============================================

// 1. OSSERVABILITÀ: Eventi danno visibilità completa
// 2. ESTENSIBILITÀ: Aggiungi listener per nuove feature
// 3. TESTABILITÀ: Mock listener per verificare comportamento
// 4. DISACCOPPIAMENTO: Queue non sa chi ascolta eventi

const metrics = {
  timing: (name, value, tags) => {
    console.log(`Metric: ${name} = ${value}ms`, tags);
  }
};

const deadLetterQueue = {
  add: (job) => {
    console.log('Added to DLQ:', job.id);
  }
};
```

### 3. State Machine

```javascript
class StateMachine extends EventEmitter {
  constructor(initialState) {
    super();
    this.state = initialState;
  }
  
  transition(newState) {
    const oldState = this.state;
    
    this.emit('before-transition', { from: oldState, to: newState });
    
    this.state = newState;
    
    this.emit('transition', { from: oldState, to: newState });
    this.emit(`enter:${newState}`, oldState);
    this.emit(`leave:${oldState}`, newState);
  }
}

const machine = new StateMachine('idle');

machine.on('enter:running', (fromState) => {
  console.log(`Started running (was ${fromState})`);
});

machine.on('leave:idle', (toState) => {
  console.log(`Leaving idle, going to ${toState}`);
});

machine.transition('running');
```

## Eventi Nativi di Node.js

Molte classi native estendono EventEmitter:

### HTTP Server
```javascript
const http = require('http');

const server = http.createServer();

server.on('request', (req, res) => {
  res.end('Hello');
});

server.on('connection', (socket) => {
  console.log('New connection');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.listen(3000);
```

### Streams
```javascript
const fs = require('fs');

const stream = fs.createReadStream('file.txt');

stream.on('data', (chunk) => {
  console.log('Chunk:', chunk.length);
});

stream.on('end', () => {
  console.log('Stream ended');
});

stream.on('error', (err) => {
  console.error('Stream error:', err);
});
```

### Process
```javascript
process.on('exit', (code) => {
  console.log(`Exiting with code: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Caught SIGINT');
  process.exit(0);
});
```

## Conclusioni

### Riepilogo Concetti Chiave

EventEmitter è uno dei pilastri fondamentali di Node.js:

**✅ Punti di Forza:**

1. **Semplicità API**
   - `on()` per registrare listener
   - `emit()` per pubblicare eventi
   - `removeListener()` per cleanup
   - API intuitiva e ben documentata

2. **Potenza del Pattern**
   - Implementa pattern Observer/Pub-Sub
   - Loose coupling tra componenti
   - Estensibilità senza modificare codice esistente
   - Base per maggior parte API Node.js (HTTP, Streams, Process, Net)

3. **Perfetto per Disaccoppiamento**
   - Publisher non conosce subscriber
   - Subscriber non conosce publisher
   - Componenti indipendenti e riutilizzabili
   - Facilita testing con mock listener

4. **Flessibilità**
   - Multiple listener per evento
   - Eventi custom con nomi arbitrari
   - Passaggio dati attraverso argomenti
   - Estensibile via inheritance

**⚠️ Attenzioni Necessarie:**

1. **Gestione Memoria**
   - Listener non rimossi causano memory leak
   - Attenzione a listener in loop/interval
   - Usa `removeListener()` o `once()` quando appropriato
   - Monitora warning MaxListeners
   - Implementa cleanup in lifecycle hooks

2. **Esecuzione Sincrona**
   - Listener eseguiti SINCRONAMENTE nell'ordine registrazione
   - Listener lenti bloccano event loop
   - Nessuna I/O processata durante emit()
   - Usa `setImmediate()` per operazioni pesanti
   - Considera async/await per operazioni lunghe

3. **Gestione Errori Critica**
   - Evento 'error' senza listener = CRASH
   - SEMPRE registra handler per 'error'
   - Implementa error handling in tutti listener
   - try-catch NON cattura errori in emit('error')

4. **Naming Conventions**
   - Usa namespace per eventi (es: 'user:login', 'db:connected')
   - Nomi descrittivi e consistenti
   - Documenta eventi disponibili
   - Considera TypeScript per type-safety

### Quando Usare EventEmitter

**✅ Casi d'Uso Ideali:**

```javascript
// 1. COMUNICAZIONE TRA COMPONENTI
class DataService extends EventEmitter {
  async fetchData() {
    const data = await api.get('/data');
    this.emit('data:fetched', data); // Notifica listener
  }
}

// 2. LIFECYCLE HOOKS
class Application extends EventEmitter {
  async start() {
    this.emit('before:start');
    await this.initialize();
    this.emit('after:start');
  }
}

// 3. PLUGIN SYSTEMS
class PluginSystem extends EventEmitter {
  process(data) {
    this.emit('before:process', data);
    const result = this.doProcess(data);
    this.emit('after:process', result);
    return result;
  }
}

// 4. REAL-TIME UPDATES
class LiveFeed extends EventEmitter {
  onNewMessage(msg) {
    this.emit('message', msg); // Broadcast a tutti i subscriber
  }
}
```

**❌ Quando NON Usare:**

```javascript
// 1. COMUNICAZIONE PARENT-CHILD DIRETTA
// ❌ Non serve EventEmitter
class Parent {
  constructor() {
    this.child = new Child();
    this.child.on('something', () => {}); // Overkill
  }
}
// ✅ Usa callback o return values
class Parent {
  constructor() {
    this.child = new Child();
    this.child.doSomething((result) => {}); // Più semplice
  }
}

// 2. REQUEST-RESPONSE SEMPLICI
// ❌ EventEmitter complica
function getData() {
  const emitter = new EventEmitter();
  setTimeout(() => emitter.emit('data', 'result'), 100);
  return emitter;
}
// ✅ Usa Promise
async function getData() {
  return await fetchData(); // Più idiomatico
}

// 3. STATE MANAGEMENT COMPLESSO
// ❌ Eventi non tracciabili
class Store extends EventEmitter {
  updateUser(user) {
    this.emit('user:update', user);
    this.emit('cache:invalidate');
    this.emit('ui:refresh');
  }
}
// ✅ Usa Redux/MobX o state manager dedicato
```

### Pattern Comuni

```javascript
// PATTERN 1: Error-First Events
emitter.on('operation', (err, data) => {
  if (err) return handleError(err);
  processData(data);
});

// PATTERN 2: Namespace Events
emitter.on('user:login', handler);
emitter.on('user:logout', handler);
emitter.on('db:connected', handler);

// PATTERN 3: Event Object
emitter.emit('action', {
  type: 'USER_LOGIN',
  payload: { userId: '123' },
  timestamp: Date.now()
});

// PATTERN 4: Chainable API
class Chainable extends EventEmitter {
  on(event, listener) {
    super.on(event, listener);
    return this; // Enable chaining
  }
}

new Chainable()
  .on('start', handler1)
  .on('end', handler2)
  .on('error', handler3);
```

### Performance Tips

1. **Limita Numero Listener**: < 10 per evento ideale
2. **Rimuovi Listener**: Usa `once()` o `removeListener()`
3. **Async Operations**: Usa `setImmediate()` in listener pesanti
4. **Evita Memory Leak**: Cleanup in destroy/close methods
5. **Monitora**: Log listener count periodicamente

### Debugging

```javascript
// Abilita debug eventi
process.env.NODE_DEBUG = 'events';

// Log tutti gli emit
const originalEmit = emitter.emit;
emitter.emit = function(event, ...args) {
  console.log(`[EMIT] ${event}`, args);
  return originalEmit.call(this, event, ...args);
};

// Trova listener orphan
function auditListeners(emitter) {
  const events = emitter.eventNames();
  events.forEach(event => {
    console.log(`${event}: ${emitter.listenerCount(event)} listeners`);
  });
}
```

## Prossimi Passi

- [Event Loop e Fasi di Esecuzione](./04-event-loop.md)
- [Gestione Errori negli Eventi](./05-gestione-errori.md)
- [Pattern Event-Driven Avanzati](./06-pattern-avanzati.md)

## Risorse

- [Node.js Events API](https://nodejs.org/api/events.html)
- [EventEmitter Source Code](https://github.com/nodejs/node/blob/main/lib/events.js)
