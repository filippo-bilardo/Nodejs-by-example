# Gestione Errori negli Eventi

## Introduzione

La gestione degli errori in un'architettura event-driven richiede strategie specifiche per garantire robustezza e affidabilità del sistema.

## L'Evento 'error' Speciale

### Comportamento Critico

L'evento `'error'` è trattato in modo speciale da EventEmitter:

```javascript
const EventEmitter = require('events');
const emitter = new EventEmitter();

// ❌ CRASH IMMEDIATO!
emitter.emit('error', new Error('Something went wrong'));

// Uncaught Error: Something went wrong
//     at ...
// (processo termina con exit code 1)
```

**Perché questo comportamento?**
- Previene errori silenziosi
- Forza gestione esplicita
- Standard in Node.js (streams, http, net, etc.)

### Gestione Obbligatoria

```javascript
const emitter = new EventEmitter();

// ✅ SEMPRE gestire 'error'
emitter.on('error', (err) => {
  console.error('Error occurred:', err.message);
  // Log, recovery, alert...
});

// Ora è sicuro
emitter.emit('error', new Error('Handled safely'));
// Output: Error occurred: Handled safely
// (processo continua normalmente)
```

## Pattern di Gestione Errori

### 1. Error-First Callback

```javascript
class AsyncEmitter extends EventEmitter {
  doAsyncWork(callback) {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        callback(null, { data: 'success' });
      } else {
        callback(new Error('Operation failed'), null);
      }
    }, 100);
  }
}

const emitter = new AsyncEmitter();

emitter.doAsyncWork((err, result) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  console.log('Success:', result);
});
```

### 2. Try-Catch nei Listener

```javascript
const emitter = new EventEmitter();

emitter.on('data', (data) => {
  try {
    // Operazione che può fallire
    const parsed = JSON.parse(data);
    console.log('Parsed:', parsed);
  } catch (err) {
    // Emetti error invece di crash
    emitter.emit('error', err);
  }
});

emitter.on('error', (err) => {
  console.error('Parse error:', err.message);
});

emitter.emit('data', 'invalid json'); // Gestito gracefully
```

### 3. Safe Emit Wrapper

```javascript
class SafeEmitter extends EventEmitter {
  safeEmit(event, ...args) {
    try {
      return this.emit(event, ...args);
    } catch (err) {
      // Cattura errori nei listener
      this.emit('error', new Error(
        `Error in listener for '${event}': ${err.message}`
      ));
      return false;
    }
  }
}

const emitter = new SafeEmitter();

emitter.on('error', (err) => {
  console.error('Caught:', err.message);
});

emitter.on('data', () => {
  throw new Error('Listener failed');
});

emitter.safeEmit('data'); // Cattura errore senza crash
```

### 4. Error Bubbling

```javascript
class ChildEmitter extends EventEmitter {
  constructor(parent) {
    super();
    this.parent = parent;
    
    // Bubbling automatico
    this.on('error', (err) => {
      if (!this.listenerCount('error')) {
        // Se nessun listener locale, propaga al parent
        this.parent.emit('error', err);
      }
    });
  }
}

const parent = new EventEmitter();
const child = new ChildEmitter(parent);

parent.on('error', (err) => {
  console.error('Parent caught:', err.message);
});

child.emit('error', new Error('Child error')); // Bubbled to parent
```

## Async Error Handling

### Promise-based Events

```javascript
class PromiseEmitter extends EventEmitter {
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

const emitter = new PromiseEmitter();

emitter.on('data', async (data) => {
  await someAsyncOperation(data);
});

emitter.on('error', (err) => {
  console.error('Async error:', err);
});

await emitter.emitAsync('data', 'test');
```

### Async/Await Pattern

```javascript
class AsyncEventHandler extends EventEmitter {
  async handleEvent(event, data) {
    try {
      // Operazioni async
      const result = await processData(data);
      this.emit('success', result);
    } catch (err) {
      this.emit('error', err);
    }
  }
}

const handler = new AsyncEventHandler();

handler.on('success', (result) => {
  console.log('Success:', result);
});

handler.on('error', (err) => {
  console.error('Error:', err.message);
});

handler.handleEvent('process', { some: 'data' });
```

## Unhandled Errors

### uncaughtException

```javascript
process.on('uncaughtException', (err, origin) => {
  console.error('UNCAUGHT EXCEPTION!');
  console.error('Error:', err);
  console.error('Origin:', origin);
  
  // Log, cleanup, alert...
  
  // ⚠️ Il processo dovrebbe terminare!
  process.exit(1);
});

// Errore non catturato
setTimeout(() => {
  throw new Error('Boom!');
}, 100);

// Output:
// UNCAUGHT EXCEPTION!
// Error: Error: Boom!
// Origin: uncaughtException
```

**⚠️ ATTENZIONE:**
- `uncaughtException` è l'ultima spiaggia
- Dopo un uncaught exception, lo stato dell'app è indefinito
- **SEMPRE terminare il processo** dopo cleanup

### unhandledRejection

```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION!');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  
  // Log, alert...
  process.exit(1);
});

// Promise rejection non gestita
Promise.reject(new Error('Unhandled promise'));

// Oppure
async function test() {
  throw new Error('Async error');
}

test(); // Nessun .catch()!
```

**Best Practice:**
```javascript
// ✅ SEMPRE gestire rejection
Promise.reject('error')
  .catch(err => console.error('Handled:', err));

// ✅ SEMPRE await con try-catch
async function safe() {
  try {
    await riskyOperation();
  } catch (err) {
    console.error('Caught:', err);
  }
}

// ✅ O gestire con .catch()
riskyOperation()
  .catch(err => console.error('Caught:', err));
```

## Domain Module (Deprecato ma Educativo)

Il modulo `domain` è deprecato, ma utile per capire la gestione errori.

### Concetto

```javascript
const domain = require('domain');

const d = domain.create();

d.on('error', (err) => {
  console.error('Domain caught:', err.message);
  // Gestione centralizzata errori
});

d.run(() => {
  // Qualsiasi errore qui viene catturato dal domain
  setTimeout(() => {
    throw new Error('Async error');
  }, 100);
  
  fs.readFile('nonexistent', (err, data) => {
    if (err) throw err;
  });
});

// Output: Domain caught: Async error
// (invece di crash!)
```

### Perché Deprecato?

- Comportamento inaffidabile con async/await
- Problemi con Promise
- Meglio usare try-catch + error events

## Async Hooks per Context Tracking

Utile per tracciare il contesto degli errori.

### Implementazione

```javascript
const async_hooks = require('async_hooks');
const fs = require('fs');

// Mappa asyncId → contesto
const contexts = new Map();

const hook = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId) {
    // Eredita contesto dal parent
    if (contexts.has(triggerAsyncId)) {
      contexts.set(asyncId, contexts.get(triggerAsyncId));
    }
  },
  
  destroy(asyncId) {
    contexts.delete(asyncId);
  }
});

hook.enable();

// Set context
function setContext(context) {
  const asyncId = async_hooks.executionAsyncId();
  contexts.set(asyncId, context);
}

// Get context
function getContext() {
  const asyncId = async_hooks.executionAsyncId();
  return contexts.get(asyncId);
}

// Uso
setContext({ userId: '123', requestId: 'req-456' });

setTimeout(() => {
  const context = getContext();
  console.log('Context in timeout:', context);
  // { userId: '123', requestId: 'req-456' }
}, 100);

fs.readFile(__filename, () => {
  const context = getContext();
  console.log('Context in readFile:', context);
  // { userId: '123', requestId: 'req-456' }
});
```

### Error Tracking con Context

```javascript
class ContextualErrorHandler extends EventEmitter {
  constructor() {
    super();
    this.contexts = new Map();
    
    const hook = async_hooks.createHook({
      init: (asyncId, type, triggerAsyncId) => {
        if (this.contexts.has(triggerAsyncId)) {
          this.contexts.set(asyncId, this.contexts.get(triggerAsyncId));
        }
      },
      destroy: (asyncId) => {
        this.contexts.delete(asyncId);
      }
    });
    
    hook.enable();
  }
  
  setContext(context) {
    const asyncId = async_hooks.executionAsyncId();
    this.contexts.set(asyncId, context);
  }
  
  getContext() {
    const asyncId = async_hooks.executionAsyncId();
    return this.contexts.get(asyncId);
  }
  
  emitError(err) {
    const context = this.getContext();
    this.emit('error', { error: err, context });
  }
}

const handler = new ContextualErrorHandler();

handler.on('error', ({ error, context }) => {
  console.error('Error:', error.message);
  console.error('Context:', context);
  // Log con context completo!
});

// Uso
handler.setContext({ userId: 'user-1', action: 'upload' });

setTimeout(() => {
  handler.emitError(new Error('Upload failed'));
  // Output:
  // Error: Upload failed
  // Context: { userId: 'user-1', action: 'upload' }
}, 100);
```

## Retry Pattern

### Exponential Backoff

```javascript
class RetryableEmitter extends EventEmitter {
  async emitWithRetry(event, data, options = {}) {
    const {
      maxRetries = 3,
      initialDelay = 1000,
      maxDelay = 30000,
      backoffFactor = 2
    } = options;
    
    let delay = initialDelay;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.emitAsync(event, data);
        this.emit('retry:success', { event, attempt });
        return;
      } catch (err) {
        if (attempt === maxRetries) {
          this.emit('retry:failed', { event, error: err, attempts: maxRetries + 1 });
          throw err;
        }
        
        this.emit('retry:attempt', { event, attempt, delay, error: err });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffFactor, maxDelay);
      }
    }
  }
  
  async emitAsync(event, data) {
    const listeners = this.listeners(event);
    
    for (const listener of listeners) {
      await listener(data);
    }
  }
}

const emitter = new RetryableEmitter();

let attempts = 0;
emitter.on('process', async (data) => {
  attempts++;
  if (attempts < 3) {
    throw new Error(`Failed attempt ${attempts}`);
  }
  console.log('Success!');
});

emitter.on('retry:attempt', ({ attempt, delay, error }) => {
  console.log(`Retry ${attempt + 1} after ${delay}ms: ${error.message}`);
});

await emitter.emitWithRetry('process', { some: 'data' });
// Output:
// Retry 1 after 1000ms: Failed attempt 1
// Retry 2 after 2000ms: Failed attempt 2
// Success!
```

## Circuit Breaker Pattern

```javascript
class CircuitBreaker extends EventEmitter {
  constructor(options = {}) {
    super();
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.nextAttempt = Date.now();
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        const err = new Error('Circuit breaker is OPEN');
        this.emit('rejected', err);
        throw err;
      }
      
      // Prova a chiudere
      this.state = 'HALF_OPEN';
      this.emit('half-open');
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
  
  onSuccess() {
    this.failures = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.emit('closed');
    }
  }
  
  onFailure(err) {
    this.failures++;
    this.emit('failure', { failures: this.failures, error: err });
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      this.emit('open', { resetAt: new Date(this.nextAttempt) });
    }
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.emit('reset');
  }
}

// Uso
const breaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 5000
});

breaker.on('open', ({ resetAt }) => {
  console.log(`Circuit OPEN until ${resetAt}`);
});

breaker.on('closed', () => {
  console.log('Circuit CLOSED');
});

async function unreliableService() {
  if (Math.random() > 0.3) {
    throw new Error('Service unavailable');
  }
  return 'Success';
}

// Tentativi
for (let i = 0; i < 10; i++) {
  try {
    const result = await breaker.execute(unreliableService);
    console.log(`Attempt ${i + 1}: ${result}`);
  } catch (err) {
    console.log(`Attempt ${i + 1}: ${err.message}`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
}
```

## Dead Letter Queue

```javascript
class DeadLetterQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.maxRetries = 3;
  }
  
  async process(message) {
    let retries = 0;
    
    while (retries < this.maxRetries) {
      try {
        await this.handleMessage(message);
        this.emit('processed', message);
        return;
      } catch (err) {
        retries++;
        this.emit('retry', { message, attempt: retries, error: err });
        
        if (retries === this.maxRetries) {
          this.moveToDeadLetter(message, err);
        } else {
          await this.delay(1000 * retries);
        }
      }
    }
  }
  
  moveToDeadLetter(message, error) {
    const dlqMessage = {
      originalMessage: message,
      error: error.message,
      timestamp: Date.now(),
      retries: this.maxRetries
    };
    
    this.queue.push(dlqMessage);
    this.emit('dead-letter', dlqMessage);
  }
  
  async handleMessage(message) {
    // Simula processing
    if (Math.random() > 0.7) {
      throw new Error('Processing failed');
    }
  }
  
  getDeadLetters() {
    return [...this.queue];
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Uso
const dlq = new DeadLetterQueue();

dlq.on('dead-letter', (msg) => {
  console.log('Message sent to DLQ:', msg);
  // Alert, log, manual review...
});

dlq.process({ id: '123', data: 'test' });
```

## Best Practices

### 1. Sempre Gestire 'error'

```javascript
// ❌ MAI
const emitter = new EventEmitter();
emitter.emit('error', new Error('Crash!'));

// ✅ SEMPRE
emitter.on('error', (err) => {
  logger.error('Event error:', err);
});
```

### 2. Error Context

```javascript
// ❌ Poco informativo
emitter.emit('error', new Error('Failed'));

// ✅ Context ricco
emitter.emit('error', {
  message: 'Database query failed',
  code: 'DB_ERROR',
  query: 'SELECT * FROM users',
  userId: '123',
  timestamp: Date.now()
});
```

### 3. Error Categorization

```javascript
class ErrorTypes {
  static NETWORK = 'NETWORK_ERROR';
  static VALIDATION = 'VALIDATION_ERROR';
  static DATABASE = 'DATABASE_ERROR';
  static UNKNOWN = 'UNKNOWN_ERROR';
}

emitter.on('error', (err) => {
  switch (err.type) {
    case ErrorTypes.NETWORK:
      // Retry logic
      break;
    case ErrorTypes.VALIDATION:
      // Return to user
      break;
    case ErrorTypes.DATABASE:
      // Alert DBA
      break;
    default:
      // Generic handling
  }
});
```

### 4. Graceful Shutdown

```javascript
class GracefulServer extends EventEmitter {
  constructor() {
    super();
    this.isShuttingDown = false;
    
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }
  
  async shutdown() {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    this.emit('shutdown:start');
    
    try {
      // Stop accepting new work
      this.emit('shutdown:stop-accepting');
      
      // Wait for ongoing work
      await this.waitForCompletion();
      this.emit('shutdown:work-completed');
      
      // Cleanup resources
      await this.cleanup();
      this.emit('shutdown:cleanup-done');
      
      this.emit('shutdown:complete');
      process.exit(0);
    } catch (err) {
      this.emit('error', err);
      process.exit(1);
    }
  }
  
  async waitForCompletion() {
    // Wait logic...
  }
  
  async cleanup() {
    // Close connections, save state, etc.
  }
}
```

## Conclusioni

Gestione errori event-driven:
- ✅ Sempre gestire evento 'error'
- ✅ Try-catch nei listener async
- ✅ Context tracking per debugging
- ✅ Retry e circuit breaker per resilienza
- ✅ Dead letter queue per fallimenti permanenti
- ⚠️ uncaughtException/unhandledRejection come ultima difesa

## Prossimi Passi

- [Esempi Pratici](../esempi/)
- [Esercizi](../esercizi/)

## Risorse

- [Error Handling in Node.js](https://nodejs.org/en/docs/guides/error-handling/)
- [Async Hooks API](https://nodejs.org/api/async_hooks.html)
- [Resilience Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/category/resiliency)
