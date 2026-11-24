# Introduzione a Socket.io

## Indice
- [Cos'è Socket.io](#cosè-socketio)
- [WebSocket vs HTTP](#websocket-vs-http)
- [Architettura Real-time](#architettura-real-time)
- [Installazione](#installazione)
- [Primo Esempio](#primo-esempio)
- [Confronto Tecnologie](#confronto-tecnologie)
- [Best Practices](#best-practices)

---

## Cos'è Socket.io

**Socket.io** è una libreria JavaScript che permette comunicazione **real-time, bidirezionale ed event-based** tra client e server.

### Caratteristiche Principali

✅ **Bidirezionale**: Server e client possono inviare messaggi  
✅ **Real-time**: Comunicazione istantanea  
✅ **Event-based**: Sistema basato su eventi personalizzati  
✅ **Affidabile**: Fallback automatico se WebSocket non disponibile  
✅ **Auto-reconnection**: Riconnessione automatica in caso di disconnessione  
✅ **Broadcasting**: Invio messaggi a gruppi di client  

### Componenti

Socket.io è composto da due parti:

1. **Server** (Node.js)
   ```javascript
   const io = require('socket.io')(server);
   ```

2. **Client** (Browser/Node.js)
   ```html
   <script src="/socket.io/socket.io.js"></script>
   ```

---

## WebSocket vs HTTP

### HTTP (Request-Response)

```
Client  ──request──>  Server
Client  <──response── Server
```

**Caratteristiche HTTP:**
- Unidirezionale (client inizia sempre)
- Stateless
- Overhead per ogni richiesta (headers)
- Polling necessario per aggiornamenti

### WebSocket (Persistent Connection)

```
Client  <══════════>  Server
     (connessione persistente)
```

**Caratteristiche WebSocket:**
- Bidirezionale (chiunque può iniziare)
- Stateful (connessione persistente)
- Basso overhead dopo handshake iniziale
- Push nativo dal server

### Quando Usare Socket.io

✅ **Usa Socket.io per:**
- Chat applications
- Notifiche real-time
- Collaborative editing (Google Docs-like)
- Gaming online
- Live dashboards
- Streaming dati
- Video conferencing

❌ **Non usare Socket.io per:**
- Simple CRUD operations
- File upload/download
- SEO-critical content
- Stateless API REST

---

## Architettura Real-time

### Architettura Base

```
┌─────────────┐         WebSocket         ┌─────────────┐
│   Browser   │ <═══════════════════════> │   Server    │
│   Client    │                           │  (Node.js)  │
└─────────────┘                           └─────────────┘
```

### Architettura Multi-Client

```
┌─────────────┐
│  Client 1   │ ─┐
└─────────────┘  │
                 │     ┌─────────────┐
┌─────────────┐  ├────>│   Server    │
│  Client 2   │ ─┤     │  Socket.io  │
└─────────────┘  │     └─────────────┘
                 │
┌─────────────┐  │
│  Client 3   │ ─┘
└─────────────┘
```

### Architettura con Room

```
┌─────────────┐
│  Client A   │ ─┐         Room "chat1"
└─────────────┘  │         ┌──────────┐
                 ├────────>│ A, B, C  │
┌─────────────┐  │         └──────────┘
│  Client B   │ ─┤
└─────────────┘  │
                 │         Room "chat2"
┌─────────────┐  │         ┌──────────┐
│  Client C   │ ─┘    ┌───>│ D, E     │
└─────────────┘       │    └──────────┘
                      │
┌─────────────┐       │
│  Client D   │ ──────┤
└─────────────┘       │
                      │
┌─────────────┐       │
│  Client E   │ ──────┘
└─────────────┘
```

---

## Installazione

### 1. Installa Socket.io (Server)

```bash
npm install socket.io
```

### 2. Installa Express (opzionale ma consigliato)

```bash
npm install express
```

### 3. Client-side

Il client viene servito automaticamente dal server:

```html
<script src="/socket.io/socket.io.js"></script>
```

Oppure usa CDN:

```html
<script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
```

### Versioni e Compatibilità

| Socket.io Server | Socket.io Client | Node.js |
|------------------|------------------|---------|
| 4.x              | 4.x              | 10+     |
| 3.x              | 3.x              | 10+     |
| 2.x              | 2.x              | 6+      |

**Importante**: Server e client devono usare versioni compatibili!

---

## Primo Esempio

### Server (server.js)

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Setup Express
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Servi file statici
app.use(express.static('public'));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('✅ Nuovo client connesso:', socket.id);

    // Ascolta evento 'message' dal client
    socket.on('message', (data) => {
        console.log('📩 Messaggio ricevuto:', data);
        
        // Invia risposta al client
        socket.emit('response', 'Messaggio ricevuto!');
    });

    // Gestisci disconnessione
    socket.on('disconnect', () => {
        console.log('❌ Client disconnesso:', socket.id);
    });
});

// Avvia server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server Socket.io su http://localhost:${PORT}`);
});
```

### Client (public/index.html)

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title>Socket.io - Hello World</title>
</head>
<body>
    <h1>Socket.io Demo</h1>
    <button id="sendBtn">Invia Messaggio</button>
    <div id="messages"></div>

    <!-- Socket.io client library -->
    <script src="/socket.io/socket.io.js"></script>
    
    <script>
        // Connetti al server
        const socket = io();

        // Evento: connessione riuscita
        socket.on('connect', () => {
            console.log('✅ Connesso al server!');
            addMessage('Connesso al server');
        });

        // Evento: risposta dal server
        socket.on('response', (data) => {
            console.log('📩 Risposta server:', data);
            addMessage('Server: ' + data);
        });

        // Evento: disconnessione
        socket.on('disconnect', () => {
            console.log('❌ Disconnesso dal server');
            addMessage('Disconnesso dal server');
        });

        // Invia messaggio al click del bottone
        document.getElementById('sendBtn').addEventListener('click', () => {
            socket.emit('message', 'Hello Server!');
            addMessage('Tu: Hello Server!');
        });

        // Helper per aggiungere messaggi al DOM
        function addMessage(msg) {
            const div = document.createElement('div');
            div.textContent = msg;
            document.getElementById('messages').appendChild(div);
        }
    </script>
</body>
</html>
```

### Eseguire l'Esempio

```bash
# 1. Crea cartella progetto
mkdir socket-hello-world
cd socket-hello-world

# 2. Inizializza npm
npm init -y

# 3. Installa dipendenze
npm install express socket.io

# 4. Crea file server.js e public/index.html

# 5. Avvia server
node server.js

# 6. Apri browser su http://localhost:3000
```

---

## Confronto Tecnologie

### Socket.io vs WebSocket Nativo

| Feature              | Socket.io        | WebSocket Nativo |
|----------------------|------------------|------------------|
| Browser support      | ✅ Ampio (fallback) | ⚠️ Limitato    |
| Auto-reconnection    | ✅ Si            | ❌ No            |
| Broadcasting         | ✅ Built-in      | ❌ Manuale       |
| Room/Namespace       | ✅ Si            | ❌ No            |
| Fallback HTTP        | ✅ Si            | ❌ No            |
| Overhead             | ⚠️ Maggiore      | ✅ Minore        |
| Complessità          | ✅ Facile        | ⚠️ Medio         |

### Socket.io vs Server-Sent Events (SSE)

| Feature              | Socket.io        | SSE              |
|----------------------|------------------|------------------|
| Bidirezionale        | ✅ Si            | ❌ No (solo server→client) |
| Binary data          | ✅ Si            | ❌ No            |
| Browser support      | ✅ Ampio         | ✅ Buono         |
| Complessità          | ⚠️ Medio         | ✅ Semplice      |
| Auto-reconnect       | ✅ Si            | ✅ Si            |

### Socket.io vs Long Polling

| Feature              | Socket.io        | Long Polling     |
|----------------------|------------------|------------------|
| Latenza              | ✅ Bassa         | ⚠️ Alta          |
| Server load          | ✅ Basso         | ❌ Alto          |
| Real-time            | ✅ Si            | ⚠️ "Near real-time" |
| Implementazione      | ✅ Semplice      | ⚠️ Complessa     |

**Conclusione**: Socket.io è la scelta migliore per la maggior parte delle applicazioni real-time grazie a:
- Fallback automatico
- API semplice
- Feature avanzate built-in
- Grande community

---

## Best Practices

### 1. Gestione Errori

```javascript
// Server
io.on('connection', (socket) => {
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Client
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});
```

### 2. Limitare Namespace

```javascript
// ✅ Buono - namespace specifica
const chatIO = io.of('/chat');

// ❌ Evita - namespace globale per tutto
io.on('connection', (socket) => {
    // tutto qui dentro
});
```

### 3. Validazione Dati

```javascript
socket.on('message', (data) => {
    // ✅ Valida sempre input
    if (typeof data !== 'string' || data.length > 500) {
        return socket.emit('error', 'Invalid message');
    }
    
    // Processa messaggio
});
```

### 4. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 100 // max 100 richieste
});

app.use('/socket.io/', limiter);
```

### 5. Disconnessione Pulita

```javascript
// Server
io.on('connection', (socket) => {
    socket.on('disconnect', (reason) => {
        // Cleanup risorse
        console.log('Client disconnected:', reason);
    });
});

// Client
window.addEventListener('beforeunload', () => {
    socket.disconnect();
});
```

### 6. Logging

```javascript
const logger = require('morgan');

// HTTP logging
app.use(logger('dev'));

// Socket.io logging
io.on('connection', (socket) => {
    console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);
});
```

### 7. CORS Configuration

```javascript
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"],
        credentials: true
    }
});
```

---

## Anatomia di una Connessione

### 1. Handshake

```
Client                          Server
  |                               |
  |─── HTTP GET /socket.io/ ────>|
  |                               |
  |<── 101 Switching Protocols ──|
  |                               |
  |<══ WebSocket Connection ═════>|
```

### 2. Lifecycle

```javascript
// 1. Connessione
socket.on('connect', () => {
    console.log('Connected');
});

// 2. Comunicazione
socket.emit('event', data);
socket.on('event', (data) => {});

// 3. Disconnessione
socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
});
```

### 3. Tipi di Disconnessione

| Reason                    | Descrizione                          |
|---------------------------|--------------------------------------|
| `io server disconnect`    | Server forza disconnessione          |
| `io client disconnect`    | Client chiude connessione            |
| `ping timeout`            | Client non risponde a ping           |
| `transport close`         | Connessione persa                    |
| `transport error`         | Errore di trasporto                  |

---

## Debug e Monitoring

### Abilitare Debug

```bash
# Linux/Mac
DEBUG=socket.io* node server.js

# Windows
set DEBUG=socket.io* & node server.js
```

### Socket.io Admin UI

```bash
npm install @socket.io/admin-ui
```

```javascript
const { instrument } = require("@socket.io/admin-ui");

instrument(io, {
    auth: false // o configura auth
});

// Admin UI disponibile su http://localhost:3000/admin
```

### Console Browser

```javascript
// Client
socket.onAny((event, ...args) => {
    console.log('Event:', event, args);
});
```

---

## Prossimi Passi

Ora che hai compreso le basi di Socket.io:

1. ✅ Hai installato Socket.io
2. ✅ Hai creato il primo server/client
3. ✅ Hai capito WebSocket vs HTTP
4. ✅ Conosci best practices base

**Prossima Guida**: [02-eventi-comunicazione.md](07-socket.io_eventi-comunicazione.md) per imparare il sistema di eventi avanzato.

---

## Risorse

- [Socket.io Docs](https://socket.io/docs/)
- [Socket.io GitHub](https://github.com/socketio/socket.io)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Socket.io Admin UI](https://socket.io/docs/v4/admin-ui/)

## Navigazione

- [← Precedente: Protocolli Applicativi Custom](05-protocolli-applicativi.md)
- [↑ Indice dell’esercitazione](README.md)
- [Successiva: Eventi e Comunicazione →](07-socket.io_eventi-comunicazione.md)
