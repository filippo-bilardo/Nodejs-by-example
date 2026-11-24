# Esercitazione 3: Architettura Event-Driven

L'architettura event-driven è il cuore di Node.js. In questa esercitazione imparerai come costruire applicazioni reattive e scalabili usando eventi, EventEmitter e l'Event Loop.

## Obiettivi di Apprendimento
- Esplorare il modello di programmazione asincrona
- Comprendere l'architettura event-driven e i suoi vantaggi
- Padroneggiare EventEmitter: creare, emettere e gestire eventi
- Capire il funzionamento dell'Event Loop e le sue fasi
- Gestire errori in modo efficace in sistemi event-driven
- Implementare pattern avanzati: Observer, Pub/Sub, Event Sourcing, CQRS, Saga
- Costruire applicazioni real-time scalabili

## Argomenti Teorici Collegati

- [Teoria: Architettura Event-Driven](indice-guide.md)
- [1. Programmazione Asincrona](01-programmazione-asincrona.md)
- [2. Introduzione all'Architettura Event-Driven](02-introduzione-event-driven.md)
- [3. EventEmitter: Il Cuore degli Eventi](03-eventemitter.md)
- [4. Event Loop: Il Motore di Node.js](04-event-loop.md)
- [5. Gestione Errori negli Eventi](05-gestione-errori.md)
- [Gestione degli Errori: Callback, Promise e Async/Await](05-pattern_gestioni_errori.md)
- [6. Pattern Event-Driven Avanzati](06-pattern-avanzati.md)
- [microtask](<AB - microtask.md>)
- [process.nextTick](<AB - process.nextTick.md>)
- [setTimeout e setInterval](<AC - setTimeout_setInterval.md>)
- [setImmediate](<AD - setImmediate.md>)
- [close_callbacks](<AE - close_callbacks.md>)
- [pending_callbacks](<AE - pending_callbacks.md>)
- [libuv](<AF - libuv.md>)
- [callback](<BA - callback.md>)
- [Promises](<BB - Promises.md>)
- [Async-Await](<BC - codice asincrono con Async-Await.md>)
- [callback concetti avanzati](callback_concetti_avanzati.md)
- [event-loop concetti avanzati](event-loop_concetti_avanzati.md)
- [microtask concetti avanzati](microtask_concetti_avanzati.md)
- [Worker Threads](Worker_Threads.md)
- [L'Event Loop di Node.js: come funziona la programmazione asincrona](eventloop.md)

## Esercitazioni Pratiche
- [ES02 - L'Event Loop](https://docs.google.com/presentation/d/1EzPyxiYQg4top0YbGJCznnL_j-mZYWvPaStsta98mBQ)

## Perché Event-Driven?

Node.js è costruito su un'architettura event-driven che permette:
- **I/O non-bloccante**: Gestire migliaia di connessioni concorrenti
- **Scalabilità**: Crescere orizzontalmente con facilità
- **Reattività**: Rispondere immediatamente agli eventi
- **Disaccoppiamento**: Componenti indipendenti che comunicano tramite eventi

## Esempi Pratici

### Esempio 3.1: Basic EventEmitter - Fondamenti
Impara le basi di EventEmitter: creazione, listener, emissione eventi.

**💡 Concetti Chiave:**
- Estendere EventEmitter per classi custom
- `on()` vs `once()`: listener permanenti vs one-time
- Passaggio argomenti agli eventi
- Rimozione listener per evitare memory leak
- Gestione obbligatoria evento `'error'`

```javascript
// esempi/01-basic-eventemitter/index.js
const EventEmitter = require('events');

class Logger extends EventEmitter {
  log(level, message) {
    this.emit('log', { level, message, timestamp: new Date() });
  }
  
  info(message) {
    this.log('INFO', message);
  }
  
  error(message) {
    this.log('ERROR', message);
  }
}

const logger = new Logger();

// Listener multipli sullo stesso evento
logger.on('log', ({ level, message }) => {
  console.log(`[${level}] ${message}`);
});

logger.on('log', ({ level, message }) => {
  // Invia a sistema di analytics
  analytics.track(level, message);
});

logger.info('Application started'); // Entrambi i listener vengono eseguiti
```

**⚠️ IMPORTANTE**: Gestire sempre l'evento `'error'`!

```javascript
const emitter = new EventEmitter();

// ❌ CRASH! Se emetti 'error' senza listener, l'app termina
// emitter.emit('error', new Error('Boom!'));

// ✅ CORRETTO: Sempre gestire 'error'
emitter.on('error', (err) => {
  console.error('Error occurred:', err.message);
});

emitter.emit('error', new Error('Handled safely')); // Safe!
```

**🎯 Esercizio Pratico:** Modifica l'esempio per creare un sistema di logging con filtri per livello e output su file.

---

### Esempio 3.2: File Watcher - Eventi I/O
Monitora una directory e reagisci ai cambiamenti dei file.

**💡 Casi d'Uso Reali:**
- Hot-reload durante sviluppo
- Sincronizzazione file
- Monitoring sistemi di log
- Trigger automazioni su file upload

```javascript
// esempi/02-file-watcher/index.js (semplificato)
const EventEmitter = require('events');
const fs = require('fs');

class FileWatcher extends EventEmitter {
  watch(directory) {
    fs.watch(directory, (eventType, filename) => {
      if (filename) {
        this.emit('file-changed', { eventType, filename });
      }
    });
  }
}

const watcher = new FileWatcher();

watcher.on('file-changed', ({ eventType, filename }) => {
  console.log(`File ${filename} was ${eventType}ed`);
  
  if (eventType === 'change') {
    // Rebuild applicazione
    rebuild();
  }
});

watcher.watch('./src');
```

**🎯 Esercizio Pratico:** Estendi il file watcher per distinguere tra creazione, modifica ed eliminazione file.

---

### Esempio 3.3: Task Queue - Gestione Asincrona
Coda di task event-driven con concorrenza limitata.

**💡 Concetti Chiave:**
- Event Loop e operazioni asincrone
- Concorrenza controllata
- Progress tracking con eventi
- Gestione fallimenti e retry

```javascript
// esempi/03-task-queue/index.js (semplificato)
class TaskQueue extends EventEmitter {
  constructor(concurrency = 3) {
    super();
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
  }
  
  add(task) {
    this.queue.push(task);
    this.emit('task-added', task);
    this.processNext();
  }
  
  async processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const task = this.queue.shift();
    
    this.emit('task-started', task);
    
    try {
      const result = await task.execute();
      this.emit('task-completed', { task, result });
    } catch (err) {
      this.emit('task-failed', { task, error: err });
    } finally {
      this.running--;
      this.processNext();
    }
  }
}

const queue = new TaskQueue(3);

queue.on('task-completed', ({ task }) => {
  console.log(`✅ Task ${task.id} completed`);
});

queue.on('task-failed', ({ task, error }) => {
  console.error(`❌ Task ${task.id} failed:`, error.message);
});

// Aggiungi task
for (let i = 0; i < 10; i++) {
  queue.add({
    id: i,
    execute: async () => {
      await doSomethingAsync();
    }
  });
}
```

**🎯 Esercizio Pratico:** Aggiungi sistema di priorità e retry automatico sui fallimenti.

---

### Esempio 3.4: Pub/Sub System - Disaccoppiamento
Message broker per comunicazione disaccoppiata tra componenti.

**💡 Pattern Architetturale:**
- Publisher non conosce i subscriber
- Subscriber non conosce i publisher
- Message broker intermedio
- Pattern matching su canali (es. `user.*` → `user.created`, `user.deleted`)

```javascript
// esempi/04-pubsub-system/ (semplificato)
class MessageBroker {
  constructor() {
    this.channels = new Map();
  }
  
  subscribe(channel, callback) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, []);
    }
    this.channels.get(channel).push(callback);
  }
  
  publish(channel, data) {
    if (!this.channels.has(channel)) return;
    
    this.channels.get(channel).forEach(callback => {
      callback(data);
    });
  }
}

const broker = new MessageBroker();

// Service 1: User Service (publisher)
class UserService {
  createUser(user) {
    // ... create user
    broker.publish('user.created', user);
  }
}

// Service 2: Email Service (subscriber)
broker.subscribe('user.created', (user) => {
  sendWelcomeEmail(user.email);
});

// Service 3: Analytics (subscriber)
broker.subscribe('user.created', (user) => {
  trackEvent('user_registered', { userId: user.id });
});

// Services totalmente disaccoppiati!
```

**🎯 Esercizio Pratico:** Implementa pattern matching per canali wildcard (`user.*`).

---

## Event Loop e Ordine di Esecuzione

Capire l'Event Loop è fondamentale per Node.js:

```javascript
console.log('1. Script start');

setTimeout(() => {
  console.log('2. setTimeout');
}, 0);

setImmediate(() => {
  console.log('3. setImmediate');
});

Promise.resolve().then(() => {
  console.log('4. Promise');
});

process.nextTick(() => {
  console.log('5. nextTick');
});

console.log('6. Script end');

// Output:
// 1. Script start
// 6. Script end
// 5. nextTick        (nextTick queue - massima priorità)
// 4. Promise         (microtask queue)
// 2. setTimeout      (timers phase)
// 3. setImmediate    (check phase)
```

**Fasi dell'Event Loop:**
```
   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout/setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  I/O callbacks posticipati
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  Uso interno
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  Recupera nuovi I/O events
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  socket.on('close', ...)
   └───────────────────────────┘
```

**🎯 Approfondimento:** [Event Loop in Dettaglio](04-event-loop.md)

---

## Pattern Avanzati

### Event Sourcing
Salva tutti i cambiamenti come eventi, non solo lo stato finale.

```javascript
class EventStore extends EventEmitter {
  constructor() {
    super();
    this.events = [];
  }
  
  append(event) {
    event.timestamp = Date.now();
    this.events.push(event);
    this.emit(event.type, event);
  }
  
  getEvents(aggregateId) {
    return this.events.filter(e => e.aggregateId === aggregateId);
  }
}

class BankAccount {
  constructor(accountId, eventStore) {
    this.accountId = accountId;
    this.eventStore = eventStore;
    this.balance = 0;
    
    // Ricostruisci stato dagli eventi
    this.rehydrate();
  }
  
  rehydrate() {
    const events = this.eventStore.getEvents(this.accountId);
    events.forEach(event => this.applyEvent(event));
  }
  
  deposit(amount) {
    const event = {
      type: 'account.deposited',
      aggregateId: this.accountId,
      data: { amount }
    };
    this.eventStore.append(event);
    this.applyEvent(event);
  }
  
  applyEvent(event) {
    if (event.type === 'account.deposited') {
      this.balance += event.data.amount;
    }
  }
}

const eventStore = new EventStore();
const account = new BankAccount('ACC001', eventStore);

account.deposit(1000);
account.deposit(500);

// Storia completa disponibile!
console.log(eventStore.getEvents('ACC001'));
```

**🎯 Approfondimento:** [Pattern Avanzati](06-pattern-avanzati.md)

---

## Gestione Errori

La gestione errori in sistemi event-driven richiede attenzione speciale:

### 1. Evento 'error' Speciale
```javascript
const emitter = new EventEmitter();

// ❌ CRASH SE NON GESTITO!
emitter.emit('error', new Error('Boom!'));

// ✅ SEMPRE GESTIRE
emitter.on('error', (err) => {
  console.error('Caught:', err.message);
  // Log, recovery, alert...
});
```

### 2. Async Error Handling
```javascript
class AsyncEmitter extends EventEmitter {
  async emitAsync(event, ...args) {
    const listeners = this.listeners(event);
    
    for (const listener of listeners) {
      try {
        await listener(...args);
      } catch (err) {
        this.emit('error', err);
      }
    }
  }
}
```

### 3. Circuit Breaker Pattern
```javascript
class CircuitBreaker extends EventEmitter {
  constructor(threshold = 5) {
    super();
    this.failureThreshold = threshold;
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker is OPEN');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err);
      throw err;
    }
  }
  
  onFailure(err) {
    this.failures++;
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.emit('circuit-open');
    }
  }
  
  onSuccess() {
    this.failures = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.emit('circuit-closed');
    }
  }
}
```

**🎯 Approfondimento:** [Gestione Errori](05-gestione-errori.md)

---

## Esercizi Pratici

### Esercizio 3.1: Event Logger System ⭐
Implementa un sistema di logging completo con:
- Livelli: DEBUG, INFO, WARN, ERROR
- Output multipli: console, file, remote
- Rotazione automatica log files
- Filtering per livello

**[Specifica Completa →](./esercizi/README.md#01-event-logger-system)**

---

### Esercizio 3.2: Notification Service ⭐⭐
Sistema di notifiche multi-canale:
- Canali: email, SMS, push, webhook
- Priorità notifiche
- Rate limiting
- Retry automatico

**[Specifica Completa →](./esercizi/README.md#02-notification-service)**

---

### Esercizio 3.3: Game Engine Event System ⭐⭐
Motore di gioco event-driven:
- Game loop con eventi tick
- Gestione input
- Sistema collisioni
- Pause/Resume

**[Specifica Completa →](./esercizi/README.md#03-game-engine-event-system)**

---

### Esercizio 3.4: Workflow Engine ⭐⭐⭐
State machine per workflow:
- Stati e transizioni
- Eventi per cambio stato
- Azioni asincrone
- Persistenza stato

**[Specifica Completa →](./esercizi/README.md#04-workflow-engine)**

---

### Esercizio 3.5: Distributed Event Bus ⭐⭐⭐
Event bus distribuito:
- Pub/Sub con Redis
- Pattern matching
- Delivery garantito
- Event replay

**[Specifica Completa →](./esercizi/README.md#05-distributed-event-bus)**

---

## Sfide Avanzate

### 🏆 Challenge 1: Real-time Dashboard
Costruisci una dashboard real-time che:
- Monitora eventi da multiple sorgenti
- Aggregazione in tempo reale
- WebSocket per update client
- Storico eventi con replay
- Alerting su condizioni

### 🏆 Challenge 2: Event Replay System
Sistema di replay eventi che:
- Salva tutti gli eventi in event store
- Replay da timestamp specifico
- Proiezioni multiple sugli stessi eventi
- Snapshot per performance
- Time-travel debugging

### 🏆 Challenge 3: Distributed Saga Orchestrator
Orchestratore saga distribuito con:
- Workflow multi-step
- Compensazione automatica
- Monitoring stato saga
- Retry e timeout
- Event sourcing integrato

---

## Best Practices

### ✅ DO
- Sempre gestire evento `'error'`
- Rimuovere listener quando non servono più
- Usare `once()` per listener one-time
- Naming chiaro per eventi (`user:created` meglio di `uc`)
- Documentare eventi emessi da ogni classe

### ❌ DON'T
- Non usare funzioni anonime se devi rimuovere listener
- Non bloccare Event Loop con codice CPU-intensive
- Non ignorare `maxListeners` warning
- Non fare `process.nextTick()` ricorsivo (blocca Event Loop!)

---

## Risorse Aggiuntive

### Documentazione
- [Node.js Events API](https://nodejs.org/api/events.html)
- [Event Loop Docs](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [async_hooks](https://nodejs.org/api/async_hooks.html)

### Articoli Consigliati
- [Understanding Event Loop](https://blog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810)
- [EventEmitter Best Practices](https://nodejs.org/en/knowledge/event-loop-patterns/)

### Libri
- *Node.js Design Patterns* di Mario Casciaro
- *Async JavaScript* di Trevor Burnham

---

**Happy Event-Driven Programming!** 🚀

## Navigazione

- [← Precedente: Introduzione ai moduli in Node.js](../01-Introduzione/05-moduli-in-node.md)
- [↑ Indice del corso](../README.md)
- [Successiva: Teoria: Architettura Event-Driven →](indice-guide.md)
