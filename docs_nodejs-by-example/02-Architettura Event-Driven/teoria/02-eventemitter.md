# EventEmitter: Il Cuore degli Eventi

## Introduzione

`EventEmitter` è una classe fondamentale di Node.js che implementa il pattern Observer. È la base per la maggior parte delle API asincrone di Node.js.

```javascript
const EventEmitter = require('events');
```

## Concetti Base

### Creazione e Utilizzo

```javascript
const EventEmitter = require('events');

// Metodo 1: Uso diretto
const emitter = new EventEmitter();

emitter.on('event', () => {
  console.log('Evento ricevuto!');
});

emitter.emit('event');
// Output: Evento ricevuto!
```

```javascript
// Metodo 2: Estendere EventEmitter (RACCOMANDATO)
class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on('event', () => {
  console.log('Evento dalla classe custom!');
});

myEmitter.emit('event');
```

### Passare Argomenti agli Eventi

```javascript
const emitter = new EventEmitter();

emitter.on('user-login', (username, timestamp) => {
  console.log(`User ${username} logged in at ${timestamp}`);
});

emitter.emit('user-login', 'mario', new Date());
// Output: User mario logged in at [timestamp]
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
Emette un evento, eseguendo tutti i listener registrati in ordine sincrono.

```javascript
const emitter = new EventEmitter();

emitter.on('test', () => {
  console.log('Listener 1');
});

emitter.on('test', () => {
  console.log('Listener 2');
});

console.log('Prima di emit');
emitter.emit('test');
console.log('Dopo emit');

// Output:
// Prima di emit
// Listener 1
// Listener 2
// Dopo emit
// (esecuzione SINCRONA!)
```

**⚠️ IMPORTANTE**: I listener vengono eseguiti **sincronamente** nell'ordine di registrazione!

```javascript
emitter.on('data', () => {
  console.log('1');
});

emitter.on('data', () => {
  console.log('2');
});

emitter.emit('data');
// Output: 1, 2 (sempre in questo ordine)
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

L'evento `error` ha un comportamento speciale: se emesso senza listener, **crash dell'applicazione**!

```javascript
const emitter = new EventEmitter();

// ❌ CRASH!
emitter.emit('error', new Error('Qualcosa è andato storto'));
// Uncaught Error: Qualcosa è andato storto
// (termina il processo)
```

**✅ SEMPRE gestire 'error':**

```javascript
const emitter = new EventEmitter();

emitter.on('error', (err) => {
  console.error('Error caught:', err.message);
  // Log, recovery, alert...
});

emitter.emit('error', new Error('Safe now'));
// Output: Error caught: Safe now
// (processo continua)
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

Per prevenire memory leak, EventEmitter emette un warning se più di 10 listener per lo stesso evento.

```javascript
const emitter = new EventEmitter();

for (let i = 0; i < 11; i++) {
  emitter.on('data', () => {});
}

// Warning: Possible EventEmitter memory leak detected.
// 11 data listeners added. Use emitter.setMaxListeners() to increase limit
```

**Soluzioni:**

```javascript
// Opzione 1: Aumentare il limite
emitter.setMaxListeners(20);

// Opzione 2: Limite infinito (⚠️ pericoloso)
emitter.setMaxListeners(0); // or Infinity

// Opzione 3: Impostare limite globale
EventEmitter.defaultMaxListeners = 15;
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

```javascript
class Logger extends EventEmitter {
  log(level, message) {
    this.emit('log', {
      level,
      message,
      timestamp: new Date()
    });
  }
  
  info(message) {
    this.log('INFO', message);
  }
  
  error(message) {
    this.log('ERROR', message);
  }
  
  warn(message) {
    this.log('WARN', message);
  }
}

const logger = new Logger();

// Console output
logger.on('log', ({ level, message, timestamp }) => {
  console.log(`[${timestamp.toISOString()}] ${level}: ${message}`);
});

// File output
logger.on('log', ({ level, message, timestamp }) => {
  fs.appendFileSync('app.log', `${timestamp}|${level}|${message}\n`);
});

// Alert on errors
logger.on('log', ({ level, message }) => {
  if (level === 'ERROR') {
    sendAlertToSlack(message);
  }
});

// Uso
logger.info('Application started');
logger.error('Database connection failed');
```

### 2. Job Queue

```javascript
class JobQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.processing = false;
  }
  
  addJob(job) {
    this.queue.push(job);
    this.emit('job:added', job);
    this.processQueue();
  }
  
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    const job = this.queue.shift();
    
    this.emit('job:started', job);
    
    try {
      const result = await job.execute();
      this.emit('job:completed', { job, result });
    } catch (error) {
      this.emit('job:failed', { job, error });
    } finally {
      this.processing = false;
      this.processQueue(); // Next job
    }
  }
}

const queue = new JobQueue();

queue.on('job:started', (job) => {
  console.log(`Starting job: ${job.name}`);
});

queue.on('job:completed', ({ job, result }) => {
  console.log(`Job ${job.name} completed:`, result);
});

queue.on('job:failed', ({ job, error }) => {
  console.error(`Job ${job.name} failed:`, error);
});
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

EventEmitter è:
- ✅ Semplice ma potente
- ✅ Base di molte API Node.js
- ✅ Perfetto per disaccoppiamento
- ⚠️ Richiede gestione attenta memoria
- ⚠️ Esecuzione sincrona dei listener

## Prossimi Passi

- [Event Loop e Fasi di Esecuzione](./03-event-loop.md)
- [Pattern Event-Driven Avanzati](./04-pattern-avanzati.md)
- [Gestione Errori negli Eventi](./05-gestione-errori.md)

## Risorse

- [Node.js Events API](https://nodejs.org/api/events.html)
- [EventEmitter Source Code](https://github.com/nodejs/node/blob/main/lib/events.js)
