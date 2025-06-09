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

## Conclusione

Il pattern di programmazione basato sugli eventi è uno dei concetti fondamentali di Node.js. La classe `EventEmitter` fornisce un'implementazione robusta di questo pattern, permettendo di creare applicazioni modulari e reattive. Comprendere come funzionano gli eventi in Node.js è essenziale per sviluppare applicazioni efficienti e ben strutturate.