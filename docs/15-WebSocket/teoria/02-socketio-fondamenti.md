# Socket.io: Concetti Fondamentali

## Cos'è Socket.io?

Socket.io è una libreria JavaScript che permette la comunicazione bidirezionale in tempo reale tra client web e server. È costruita sopra il protocollo WebSocket, ma offre numerose funzionalità aggiuntive e meccanismi di fallback che la rendono robusta e versatile.

## Caratteristiche principali di Socket.io

1. **Compatibilità cross-browser**: Funziona su tutti i principali browser e piattaforme.

2. **Fallback automatico**: Se WebSocket non è supportato, Socket.io utilizza automaticamente altri metodi come long polling.

3. **Riconnessione automatica**: Gestisce automaticamente la riconnessione in caso di interruzioni di rete.

4. **Supporto per stanze e namespace**: Permette di organizzare le connessioni in gruppi logici.

5. **Broadcast**: Facilita l'invio di messaggi a più client contemporaneamente.

6. **Supporto per la scalabilità**: Può essere utilizzato in ambienti con più server tramite adattatori (Redis, MongoDB, ecc.).

## Installazione di Socket.io

```bash
npm install socket.io
```

Per il client (browser):

```bash
npm install socket.io-client
```

## Configurazione base di Socket.io con Express

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Crea un'applicazione Express
const app = express();

// Crea un server HTTP utilizzando l'app Express
const server = http.createServer(app);

// Inizializza Socket.io passando il server HTTP
const io = new Server(server);

// Servi i file statici dalla cartella 'public'
app.use(express.static('public'));

// Gestisci le connessioni Socket.io
io.on('connection', (socket) => {
  console.log('Un utente si è connesso, ID:', socket.id);
  
  // Gestisci la disconnessione
  socket.on('disconnect', () => {
    console.log('Utente disconnesso, ID:', socket.id);
  });
  
  // Gestisci un evento personalizzato
  socket.on('chat message', (msg) => {
    console.log('Messaggio ricevuto:', msg);
    
    // Invia il messaggio a tutti i client connessi
    io.emit('chat message', msg);
  });
});

// Avvia il server sulla porta 3000
server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

## Client Socket.io (HTML/JavaScript)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket.io Demo</title>
  <style>
    body { margin: 0; padding-bottom: 3rem; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    #messages { list-style-type: none; margin: 0; padding: 0; }
    #messages > li { padding: 0.5rem 1rem; }
    #messages > li:nth-child(odd) { background: #efefef; }
    #form { background: rgba(0, 0, 0, 0.15); padding: 0.25rem; position: fixed; bottom: 0; left: 0; right: 0; display: flex; height: 3rem; box-sizing: border-box; backdrop-filter: blur(10px); }
    #input { border: none; padding: 0 1rem; flex-grow: 1; border-radius: 2rem; margin: 0.25rem; }
    #input:focus { outline: none; }
    #form > button { background: #333; border: none; padding: 0 1rem; margin: 0.25rem; border-radius: 3px; outline: none; color: #fff; }
  </style>
</head>
<body>
  <ul id="messages"></ul>
  <form id="form" action="">
    <input id="input" autocomplete="off" /><button>Invia</button>
  </form>
  
  <script src="/socket.io/socket.io.js"></script>
  <script>
    // Connessione al server Socket.io
    const socket = io();
    
    // Elementi DOM
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');
    
    // Gestione invio messaggio
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (input.value) {
        // Invia il messaggio al server
        socket.emit('chat message', input.value);
        input.value = '';
      }
    });
    
    // Ricezione messaggi
    socket.on('chat message', (msg) => {
      const item = document.createElement('li');
      item.textContent = msg;
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    });
  </script>
</body>
</html>
```

## Eventi principali di Socket.io

### Eventi predefiniti

- **connect/connection**: Quando un client si connette al server.
- **disconnect**: Quando un client si disconnette.
- **error**: Quando si verifica un errore.
- **reconnect**: Quando un client si riconnette dopo una disconnessione.
- **reconnect_attempt**: Quando un client tenta di riconnettersi.
- **reconnect_error**: Quando si verifica un errore durante la riconnessione.

### Eventi personalizzati

Socket.io permette di definire eventi personalizzati per la tua applicazione:

```javascript
// Server
socket.on('evento personalizzato', (dati) => {
  console.log('Dati ricevuti:', dati);
});

// Client
socket.emit('evento personalizzato', { chiave: 'valore' });
```

## Namespace e Stanze

Socket.io offre due livelli di separazione delle connessioni: namespace e stanze.

### Namespace

I namespace permettono di separare la logica dell'applicazione su un singolo endpoint:

```javascript
// Server
const chatNamespace = io.of('/chat');
const adminNamespace = io.of('/admin');

chatNamespace.on('connection', (socket) => {
  // Logica per il namespace chat
});

adminNamespace.on('connection', (socket) => {
  // Logica per il namespace admin
});

// Client
const chatSocket = io('/chat');
const adminSocket = io('/admin');
```

### Stanze

Le stanze permettono di raggruppare i socket all'interno di un namespace:

```javascript
// Server
io.on('connection', (socket) => {
  // Unirsi a una stanza
  socket.join('stanza1');
  
  // Inviare un messaggio a tutti nella stanza
  io.to('stanza1').emit('messaggio stanza', 'Ciao a tutti nella stanza 1!');
  
  // Inviare un messaggio a tutti tranne il mittente
  socket.to('stanza1').emit('messaggio stanza', 'Nuovo utente entrato');
  
  // Lasciare una stanza
  socket.leave('stanza1');
});
```

## Middleware in Socket.io

Socket.io supporta middleware che possono essere utilizzati per autenticazione, logging, ecc.:

```javascript
io.use((socket, next) => {
  // Verifica se il client è autorizzato
  const token = socket.handshake.auth.token;
  if (isValidToken(token)) {
    // Memorizza informazioni sull'utente nel socket
    socket.user = getUserFromToken(token);
    next();
  } else {
    next(new Error('Autenticazione fallita'));
  }
});
```

## Scalabilità con Socket.io

Per applicazioni che richiedono più server, Socket.io offre adattatori per sincronizzare i messaggi tra le istanze:

```javascript
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const io = new Server();

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  io.listen(3000);
});
```

## Best Practices

1. **Gestione degli errori**: Implementa sempre gestori per gli eventi di errore.

2. **Riconnessione**: Configura correttamente i parametri di riconnessione per migliorare l'esperienza utente.

3. **Sicurezza**: Utilizza middleware per autenticare le connessioni e validare i dati in ingresso.

4. **Ottimizzazione**: Limita la quantità di dati trasmessi e la frequenza degli eventi.

5. **Testing**: Testa la tua applicazione in diverse condizioni di rete.

## Conclusione

Socket.io è una potente libreria che semplifica notevolmente lo sviluppo di applicazioni in tempo reale. La sua robustezza, flessibilità e facilità d'uso la rendono una scelta eccellente per implementare funzionalità di comunicazione bidirezionale nelle applicazioni web moderne.

---

[Torna all'indice dell'esercitazione](../README.md)