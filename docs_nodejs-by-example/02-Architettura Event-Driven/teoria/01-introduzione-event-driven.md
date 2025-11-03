# Introduzione all'Event-Driven Architecture

## Cos'è l'Architettura Event-Driven?

L'**architettura event-driven** (EDA - Event-Driven Architecture) è un paradigma di programmazione in cui il flusso del programma è determinato da **eventi**: azioni o cambiamenti di stato che possono verificarsi in qualsiasi momento.

### Concetti Fondamentali

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Emitter   │ ─────>  │    Event     │  ─────> │  Listeners  │
│  (Sorgente) │         │  (Messaggio) │         │  (Handler)  │
└─────────────┘         └──────────────┘         └─────────────┘
```

**Elementi chiave:**
- **Event Emitter**: Componente che genera eventi
- **Event**: Segnale che qualcosa è accaduto
- **Event Listener**: Funzione che reagisce all'evento
- **Event Loop**: Meccanismo che coordina l'esecuzione

### Paradigmi di Programmazione a Confronto

#### Programmazione Sequenziale (Sincrona)
```javascript
// Esecuzione lineare e bloccante
const fs = require('fs');

console.log('Inizio');
const data = fs.readFileSync('file.txt', 'utf8'); // BLOCCA qui
console.log('Dati letti:', data);
console.log('Fine');

// Output:
// Inizio
// Dati letti: [contenuto file]
// Fine
```

**Problemi:**
- ❌ Blocco totale durante operazioni I/O
- ❌ Spreco di risorse CPU
- ❌ Nessuna concorrenza
- ❌ Scalabilità limitata

#### Programmazione Event-Driven (Asincrona)
```javascript
// Esecuzione non bloccante
const fs = require('fs');

console.log('Inizio');
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log('Dati letti:', data);
});
console.log('Fine');

// Output:
// Inizio
// Fine
// Dati letti: [contenuto file]
```

**Vantaggi:**
- ✅ Non bloccante (non-blocking I/O)
- ✅ Utilizzo efficiente risorse
- ✅ Concorrenza tramite Event Loop
- ✅ Alta scalabilità

## L'Event Loop di Node.js

L'Event Loop è il meccanismo fondamentale che permette a Node.js di eseguire operazioni di I/O non bloccanti nonostante JavaScript sia single-threaded. È il cuore pulsante dell'architettura di Node.js, responsabile della gestione e dell'esecuzione del codice asincrono.

## Vantaggi dell'Event-Driven Architecture

### 1. **Scalabilità**
```javascript
// Server HTTP può gestire migliaia di connessioni
const http = require('http');

const server = http.createServer((req, res) => {
  // Ogni richiesta è un evento
  // Non blocca altre richieste
  res.end('Hello World');
});

server.listen(3000);
// Può gestire 10,000+ richieste concorrenti con un singolo thread!
```

### 2. **Efficienza Risorse**
```javascript
// Gestione parallela di operazioni I/O
const fs = require('fs').promises;

async function readMultipleFiles() {
  // Tutte partono in parallelo (non-blocking)
  const [file1, file2, file3] = await Promise.all([
    fs.readFile('file1.txt', 'utf8'),
    fs.readFile('file2.txt', 'utf8'),
    fs.readFile('file3.txt', 'utf8')
  ]);
  
  return { file1, file2, file3 };
}
```

### 3. **Reattività**
```javascript
const EventEmitter = require('events');

class StockTracker extends EventEmitter {
  updatePrice(symbol, price) {
    this.emit('price-update', { symbol, price, timestamp: Date.now() });
  }
}

const tracker = new StockTracker();

// Multiple listeners possono reagire allo stesso evento
tracker.on('price-update', (data) => {
  console.log(`UI Update: ${data.symbol} = $${data.price}`);
});

tracker.on('price-update', (data) => {
  // Salva in database
  saveToDatabase(data);
});

tracker.on('price-update', (data) => {
  // Invia notifiche
  if (data.price > threshold) {
    sendAlert(data);
  }
});
```

### 4. **Disaccoppiamento**
```javascript
// I componenti comunicano via eventi senza conoscersi direttamente

class OrderService extends EventEmitter {
  createOrder(order) {
    // Business logic
    const orderId = saveOrder(order);
    
    // Emette evento - non sa chi lo ascolterà
    this.emit('order-created', { orderId, order });
    
    return orderId;
  }
}

// Altri moduli si registrano autonomamente
const orderService = new OrderService();

// Inventory module
orderService.on('order-created', ({ order }) => {
  updateInventory(order.items);
});

// Email module
orderService.on('order-created', ({ orderId }) => {
  sendConfirmationEmail(orderId);
});

// Analytics module
orderService.on('order-created', ({ order }) => {
  trackSale(order);
});
```

## Svantaggi e Limitazioni

### **Memory Leaks con Event Listeners**
```javascript
// PROBLEMA: Listener non rimossi causano memory leak
class DataStream extends EventEmitter {
  start() {
    setInterval(() => {
      this.emit('data', Date.now());
    }, 1000);
  }
}

const stream = new DataStream();

// Aggiungiamo listener in un loop
for (let i = 0; i < 1000; i++) {
  stream.on('data', (data) => {
    console.log(`Listener ${i}: ${data}`);
  });
}

// Ora abbiamo 1000 listener che non verranno mai rimossi!
// Ogni secondo eseguono tutti = MEMORY LEAK

// SOLUZIONE: Rimuovere listener quando non servono
const listener = (data) => console.log(data);
stream.on('data', listener);

// Quando finito:
stream.removeListener('data', listener);

// Oppure usare .once() per auto-rimozione
stream.once('data', (data) => {
  console.log('Eseguito una sola volta:', data);
});
```

## Casi d'Uso Ideali

### 1. **Web Servers e API**
```javascript
// Gestione migliaia di connessioni concorrenti
const express = require('express');
const app = express();

app.get('/api/users', async (req, res) => {
  const users = await db.query('SELECT * FROM users');
  res.json(users);
});

app.listen(3000);
// Perfetto per I/O-bound operations
```

### 2. **Real-Time Applications**
```javascript
const io = require('socket.io')(3000);

io.on('connection', (socket) => {
  socket.on('chat-message', (msg) => {
    // Broadcast a tutti
    io.emit('chat-message', msg);
  });
});
```

### 3. **Streaming Data**
```javascript
const fs = require('fs');

const readStream = fs.createReadStream('large-file.txt');
const writeStream = fs.createWriteStream('copy.txt');

readStream.on('data', (chunk) => {
  writeStream.write(chunk);
});

readStream.on('end', () => {
  console.log('Streaming completato');
});
```

### 4. **Microservices e Message Queues**
```javascript
const amqp = require('amqplib');

async function consumeMessages() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  await channel.assertQueue('tasks');
  
  channel.consume('tasks', (msg) => {
    const task = JSON.parse(msg.content.toString());
    processTask(task);
    channel.ack(msg);
  });
}
```

## Best Practices

### 1. **Gestire Sempre gli Errori**
```javascript
emitter.on('error', (err) => {
  console.error('Error:', err);
  // Log, alert, recovery...
});
```

### 2. **Evitare Operazioni Sincrone nel Path Critico**
```javascript
// ❌ BAD
app.get('/users', (req, res) => {
  const data = fs.readFileSync('users.json'); // BLOCCA!
  res.json(JSON.parse(data));
});

// ✅ GOOD
app.get('/users', async (req, res) => {
  const data = await fs.promises.readFile('users.json');
  res.json(JSON.parse(data));
});
```

### 3. **Limitare Numero di Listener**
```javascript
emitter.setMaxListeners(20); // Default è 10
```

### 4. **Cleanup Risorse**
```javascript
class ResourceManager extends EventEmitter {
  constructor() {
    super();
    this.resources = [];
  }
  
  cleanup() {
    this.removeAllListeners();
    this.resources.forEach(r => r.close());
    this.resources = [];
  }
}
```

## Conclusioni

L'architettura event-driven è **perfetta per**:
- ✅ Applicazioni I/O intensive
- ✅ Real-time applications
- ✅ Alta concorrenza
- ✅ Microservices

**Non ideale per**:
- ❌ Calcoli CPU-intensive
- ❌ Algoritmi complessi sincroni
- ❌ Applicazioni che richiedono elaborazione sequenziale pesante

## Prossimi Passi

- [EventEmitter: Il Cuore degli Eventi](./02-eventemitter.md)
- [Event Loop e Fasi di Esecuzione](./03-event-loop.md)
- [Pattern Event-Driven Avanzati](./04-pattern-avanzati.md)

## Risorse

- [Node.js Event Loop Explained](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [The Node.js event emitter](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter)
- [libuv Design Overview](http://docs.libuv.org/en/v1.x/design.html)
- [Event-Driven Architecture on Martin Fowler](https://martinfowler.com/articles/201701-event-driven.html)
