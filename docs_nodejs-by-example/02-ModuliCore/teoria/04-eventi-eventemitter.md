# Eventi e EventEmitter in Node.js

## Introduzione

Il pattern di programmazione basato sugli eventi è fondamentale in Node.js. Molte delle API core di Node.js sono costruite attorno a un'architettura event-driven, dove certi tipi di oggetti (emettitori) emettono eventi che causano l'esecuzione di funzioni (listener). Questo modello è implementato attraverso la classe `EventEmitter`.

## La Classe EventEmitter

La classe `EventEmitter` è parte del modulo core `events` e fornisce un meccanismo per:
- Registrare funzioni di callback (listener) per specifici eventi
- Emettere eventi che attivano l'esecuzione dei listener registrati

### Importare EventEmitter

```javascript
const EventEmitter = require('events');
```

### Creare un Emettitore di Eventi

```javascript
const EventEmitter = require('events');

// Creare un'istanza di EventEmitter
const emitter = new EventEmitter();

// Registrare un listener per l'evento 'messaggio'
emitter.on('messaggio', (msg) => {
  console.log('Messaggio ricevuto:', msg);
});

// Emettere un evento 'messaggio'
emitter.emit('messaggio', 'Ciao, mondo!');
```

## Metodi Principali di EventEmitter

### Registrare Listener

```javascript
// Registrare un listener che viene eseguito ogni volta che l'evento è emesso
emitter.on('evento', callback);

// Alias di .on()
emitter.addListener('evento', callback);

// Registrare un listener che viene eseguito solo la prima volta che l'evento è emesso
emitter.once('evento', callback);

// Registrare un listener con priorità (viene eseguito prima degli altri)
emitter.prependListener('evento', callback);

// Registrare un listener una tantum con priorità
emitter.prependOnceListener('evento', callback);
```

### Emettere Eventi

```javascript
// Emettere un evento senza dati
emitter.emit('evento');

// Emettere un evento con dati
emitter.emit('evento', arg1, arg2, ...);
```

### Rimuovere Listener

```javascript
// Rimuovere un listener specifico
emitter.off('evento', callback);

// Alias di .off()
emitter.removeListener('evento', callback);

// Rimuovere tutti i listener per un evento specifico
emitter.removeAllListeners('evento');

// Rimuovere tutti i listener per tutti gli eventi
emitter.removeAllListeners();
```

### Altri Metodi Utili

```javascript
// Ottenere il numero di listener registrati per un evento
const count = emitter.listenerCount('evento');

// Ottenere un array di listener per un evento
const listeners = emitter.listeners('evento');

// Ottenere un array di nomi di eventi registrati
const eventNames = emitter.eventNames();

// Impostare il numero massimo di listener per un emettitore (default: 10)
emitter.setMaxListeners(15);
```

## Estendere EventEmitter

È comune creare classi personalizzate che ereditano da `EventEmitter` per implementare funzionalità event-driven:

```javascript
const EventEmitter = require('events');

class Database extends EventEmitter {
  constructor() {
    super();
    this.connected = false;
  }
  
  connect() {
    // Simulare una connessione asincrona
    setTimeout(() => {
      this.connected = true;
      this.emit('connect');
    }, 1000);
  }
  
  query(sql) {
    if (!this.connected) {
      this.emit('error', new Error('Database non connesso'));
      return;
    }
    
    // Simulare una query
    setTimeout(() => {
      const result = [`Risultato della query: ${sql}`];
      this.emit('result', result);
    }, 500);
  }
}

// Utilizzo
const db = new Database();

db.on('connect', () => {
  console.log('Connesso al database');
  db.query('SELECT * FROM users');
});

db.on('result', (result) => {
  console.log('Risultato:', result);
});

db.on('error', (err) => {
  console.error('Errore:', err.message);
});

db.connect();
```

## Gestione degli Errori

In Node.js, gli eventi di errore richiedono una gestione speciale. Se un evento `'error'` viene emesso e non ci sono listener registrati, Node.js lancerà un'eccezione e terminerà il processo:

```javascript
const emitter = new EventEmitter();

// Senza questo listener, l'applicazione terminerebbe
emitter.on('error', (err) => {
  console.error('Errore gestito:', err.message);
});

// Ora possiamo emettere errori in sicurezza
emitter.emit('error', new Error('Qualcosa è andato storto'));
```

## Eventi Asincroni vs Sincroni

Per default, i listener vengono chiamati in modo sincrono nell'ordine in cui sono stati registrati. Tuttavia, è possibile utilizzare metodi come `setImmediate()` o `process.nextTick()` per eseguire i listener in modo asincrono:

```javascript
const emitter = new EventEmitter();

emitter.on('evento', (msg) => {
  // Esecuzione asincrona
  setImmediate(() => {
    console.log('Listener asincrono:', msg);
  });
});

emitter.on('evento', (msg) => {
  // Esecuzione sincrona
  console.log('Listener sincrono:', msg);
});

emitter.emit('evento', 'Test');
// Output:
// Listener sincrono: Test
// Listener asincrono: Test (dopo che lo stack delle chiamate è vuoto)
```

## Eventi in Moduli Core

Molti moduli core di Node.js ereditano da `EventEmitter` e utilizzano eventi per notificare cambiamenti di stato o completamento di operazioni:

### Esempio con HTTP Server

```javascript
const http = require('http');

const server = http.createServer();

// Il server è un EventEmitter
server.on('request', (req, res) => {
  res.end('Hello World');
});

server.on('listening', () => {
  console.log('Server in ascolto sulla porta 3000');
});

server.on('error', (err) => {
  console.error('Errore del server:', err.message);
});

server.listen(3000);
```

### Esempio con Stream

```javascript
const fs = require('fs');

const readStream = fs.createReadStream('file.txt');

readStream.on('open', () => {
  console.log('File aperto');
});

readStream.on('data', (chunk) => {
  console.log(`Ricevuti ${chunk.length} byte di dati`);
});

readStream.on('end', () => {
  console.log('Lettura completata');
});

readStream.on('error', (err) => {
  console.error('Errore:', err.message);
});
```

## Pattern Avanzati con EventEmitter

### Event Emitter con Namespace

```javascript
const EventEmitter = require('events');

class NamespacedEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.namespaces = new Map();
  }

  // Emettere eventi con namespace
  emitNS(namespace, event, ...args) {
    this.emit(`${namespace}:${event}`, ...args);
    this.emit('*', namespace, event, ...args); // Evento globale
  }

  // Ascoltare eventi con namespace
  onNS(namespace, event, listener) {
    this.on(`${namespace}:${event}`, listener);
  }

  // Ascoltare tutti gli eventi di un namespace
  onNamespace(namespace, listener) {
    this.on('*', (ns, event, ...args) => {
      if (ns === namespace) {
        listener(event, ...args);
      }
    });
  }

  // Rimuovere tutti i listener di un namespace
  removeAllListenersNS(namespace) {
    const events = this.eventNames();
    events.forEach(eventName => {
      if (typeof eventName === 'string' && eventName.startsWith(`${namespace}:`)) {
        this.removeAllListeners(eventName);
      }
    });
  }
}

// Esempio di utilizzo
const nsEmitter = new NamespacedEventEmitter();

// Listener per eventi specifici
nsEmitter.onNS('user', 'created', (user) => {
  console.log('User created:', user.name);
});

nsEmitter.onNS('user', 'deleted', (userId) => {
  console.log('User deleted:', userId);
});

// Listener per tutti gli eventi user
nsEmitter.onNamespace('user', (event, ...args) => {
  console.log(`User event: ${event}`, args);
});

// Emettere eventi
nsEmitter.emitNS('user', 'created', { id: 1, name: 'Mario' });
nsEmitter.emitNS('user', 'deleted', 1);
```

### Event Bus Globale con Middleware

```javascript
class EventBus extends EventEmitter {
  constructor() {
    super();
    this.middlewares = [];
    this.eventHistory = [];
    this.maxHistory = 1000;
  }

  // Aggiungere middleware
  use(middleware) {
    this.middlewares.push(middleware);
  }

  // Override del metodo emit per includere middleware
  emit(event, ...args) {
    const eventData = {
      event,
      args,
      timestamp: new Date(),
      id: this.generateEventId()
    };

    // Salva nella history
    this.eventHistory.push(eventData);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    // Esegui middleware
    for (const middleware of this.middlewares) {
      try {
        const result = middleware(eventData);
        if (result === false) {
          return false; // Middleware ha bloccato l'evento
        }
      } catch (error) {
        console.error('Middleware error:', error);
      }
    }

    // Emetti l'evento originale
    return super.emit(event, ...args);
  }

  generateEventId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Ottenere la history degli eventi
  getEventHistory(filter = {}) {
    let history = this.eventHistory;

    if (filter.event) {
      history = history.filter(e => e.event === filter.event);
    }

    if (filter.since) {
      history = history.filter(e => e.timestamp >= filter.since);
    }

    return history;
  }

  // Replay degli eventi
  replay(filter = {}) {
    const events = this.getEventHistory(filter);
    events.forEach(eventData => {
      super.emit(eventData.event, ...eventData.args);
    });
  }
}

// Middleware di esempio
const loggingMiddleware = (eventData) => {
  console.log(`[${eventData.timestamp.toISOString()}] Event: ${eventData.event}`);
};

const validationMiddleware = (eventData) => {
  if (eventData.event === 'user-created' && !eventData.args[0]?.email) {
    console.error('Validation failed: email required');
    return false; // Blocca l'evento
  }
};

// Utilizzo
const eventBus = new EventBus();
eventBus.use(loggingMiddleware);
eventBus.use(validationMiddleware);

eventBus.on('user-created', (user) => {
  console.log('New user:', user);
});

// Eventi validi e non validi
eventBus.emit('user-created', { name: 'Mario', email: 'mario@test.com' }); // OK
eventBus.emit('user-created', { name: 'Luigi' }); // Bloccato da validation
```

### Event Emitter con TTL (Time To Live)

```javascript
class TTLEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.listenerTTL = new Map();
  }

  // Aggiungere listener con TTL
  onTTL(event, listener, ttl) {
    this.on(event, listener);
    
    const timeout = setTimeout(() => {
      this.removeListener(event, listener);
      this.listenerTTL.delete(listener);
    }, ttl);

    this.listenerTTL.set(listener, timeout);
  }

  // Aggiungere listener che si rimuove dopo N chiamate
  onCount(event, listener, maxCount) {
    let count = 0;
    
    const wrappedListener = (...args) => {
      count++;
      listener(...args);
      
      if (count >= maxCount) {
        this.removeListener(event, wrappedListener);
      }
    };

    this.on(event, wrappedListener);
  }

  // Override removeListener per pulire i timeout
  removeListener(event, listener) {
    if (this.listenerTTL.has(listener)) {
      clearTimeout(this.listenerTTL.get(listener));
      this.listenerTTL.delete(listener);
    }
    
    return super.removeListener(event, listener);
  }

  // Aggiungere listener condizionale
  onIf(event, condition, listener) {
    const wrappedListener = (...args) => {
      if (condition(...args)) {
        listener(...args);
      }
    };

    this.on(event, wrappedListener);
    return wrappedListener; // Restituisce il wrapper per eventuale rimozione
  }

  // Emettere evento con ritardo
  emitDelayed(event, delay, ...args) {
    setTimeout(() => {
      this.emit(event, ...args);
    }, delay);
  }

  // Emettere evento periodicamente
  emitPeriodic(event, interval, ...args) {
    const intervalId = setInterval(() => {
      this.emit(event, ...args);
    }, interval);

    return intervalId; // Restituisce l'ID per eventuale stop
  }
}

// Esempio di utilizzo
const ttlEmitter = new TTLEventEmitter();

// Listener che si rimuove dopo 5 secondi
ttlEmitter.onTTL('test', () => {
  console.log('Listener attivo per 5 secondi');
}, 5000);

// Listener che si rimuove dopo 3 chiamate
ttlEmitter.onCount('counter', (value) => {
  console.log('Counter:', value);
}, 3);

// Listener condizionale
ttlEmitter.onIf('number', (n) => n > 10, (n) => {
  console.log('Numero maggiore di 10:', n);
});

// Test
for (let i = 0; i < 5; i++) {
  ttlEmitter.emit('counter', i);
}

ttlEmitter.emit('number', 5);  // Non stampa nulla
ttlEmitter.emit('number', 15); // Stampa il numero
```

### Event Aggregator con Batching

```javascript
class BatchEventEmitter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.batchTimeout = options.batchTimeout || 100;
    this.maxBatchSize = options.maxBatchSize || 10;
    this.batches = new Map();
  }

  // Emetti evento in batch
  emitBatch(event, data) {
    if (!this.batches.has(event)) {
      this.batches.set(event, {
        items: [],
        timeout: null
      });
    }

    const batch = this.batches.get(event);
    batch.items.push(data);

    // Se il batch è pieno, emetti immediatamente
    if (batch.items.length >= this.maxBatchSize) {
      this.flushBatch(event);
      return;
    }

    // Altrimenti, imposta/resetta il timeout
    if (batch.timeout) {
      clearTimeout(batch.timeout);
    }

    batch.timeout = setTimeout(() => {
      this.flushBatch(event);
    }, this.batchTimeout);
  }

  flushBatch(event) {
    const batch = this.batches.get(event);
    if (!batch || batch.items.length === 0) return;

    // Emetti l'evento batch
    super.emit(`${event}:batch`, batch.items);
    
    // Pulisci il batch
    if (batch.timeout) {
      clearTimeout(batch.timeout);
    }
    this.batches.set(event, { items: [], timeout: null });
  }

  // Forza il flush di tutti i batch
  flushAll() {
    for (const event of this.batches.keys()) {
      this.flushBatch(event);
    }
  }
}

// Esempio di utilizzo
const batchEmitter = new BatchEventEmitter({
  batchTimeout: 200,
  maxBatchSize: 5
});

batchEmitter.on('data:batch', (items) => {
  console.log(`Elaboro batch di ${items.length} elementi:`, items);
});

// Simula eventi frequenti
for (let i = 0; i < 12; i++) {
  setTimeout(() => {
    batchEmitter.emitBatch('data', { id: i, timestamp: Date.now() });
  }, i * 50);
}
```

## Conclusione

Il pattern di programmazione basato sugli eventi è uno dei concetti fondamentali di Node.js. La classe `EventEmitter` fornisce un'implementazione robusta di questo pattern, permettendo di creare applicazioni modulari e reattive. I pattern avanzati mostrati sopra estendono ulteriormente le possibilità, permettendo di gestire scenari complessi come namespace, middleware, TTL, batching e molto altro. Comprendere questi concetti è essenziale per sviluppare applicazioni Node.js efficienti, scalabili e ben strutturate.