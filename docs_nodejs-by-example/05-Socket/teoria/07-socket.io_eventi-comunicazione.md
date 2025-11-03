# Eventi e Comunicazione

## Indice
- [Sistema di Eventi](#sistema-di-eventi)
- [Emettere Eventi](#emettere-eventi)
- [Ascoltare Eventi](#ascoltare-eventi)
- [Eventi Bidirezionali](#eventi-bidirezionali)
- [Acknowledgments](#acknowledgments)
- [Eventi Predefiniti](#eventi-predefiniti)
- [Eventi Personalizzati](#eventi-personalizzati)
- [Gestione Errori](#gestione-errori)

---

## Sistema di Eventi

Socket.io usa un **sistema event-driven** simile agli EventEmitter di Node.js.

### Concetti Chiave

```
Client                          Server
  |                               |
  |── emit('evento', data) ──────>|
  |                               |
  |<──── emit('risposta') ────────|
```

**Caratteristiche:**
- Eventi nominati (string)
- Payload personalizzato (any data)
- Bidirezionale (client↔server)
- Asincrono

---

## Emettere Eventi

### Server → Client

#### 1. Singolo Client

```javascript
// Invia a UN client specifico
io.on('connection', (socket) => {
    // Invia solo a questo socket
    socket.emit('welcome', {
        message: 'Benvenuto!',
        timestamp: Date.now()
    });
});
```

#### 2. Tutti i Client

```javascript
// Invia a TUTTI i client connessi
io.emit('announcement', {
    message: 'Messaggio globale',
    from: 'admin'
});
```

#### 3. Tutti Tranne il Mittente

```javascript
io.on('connection', (socket) => {
    socket.on('newMessage', (data) => {
        // Invia a tutti TRANNE chi ha mandato il messaggio
        socket.broadcast.emit('message', data);
    });
});
```

### Client → Server

```javascript
// Client
socket.emit('chatMessage', {
    text: 'Ciao a tutti!',
    user: 'Mario'
});
```

### Payload Multipli

```javascript
// Server - invia più argomenti
socket.emit('userData', 
    { id: 1, name: 'Mario' },  // arg1
    { role: 'admin' },          // arg2
    [1, 2, 3]                   // arg3
);

// Client - ricevi più argomenti
socket.on('userData', (user, role, numbers) => {
    console.log(user);    // { id: 1, name: 'Mario' }
    console.log(role);    // { role: 'admin' }
    console.log(numbers); // [1, 2, 3]
});
```

---

## Ascoltare Eventi

### Server

```javascript
io.on('connection', (socket) => {
    // Listener specifico
    socket.on('chatMessage', (data) => {
        console.log('Nuovo messaggio:', data);
    });

    // Listener per qualsiasi evento
    socket.onAny((event, ...args) => {
        console.log('Evento ricevuto:', event, args);
    });

    // Listener una tantum
    socket.once('init', (data) => {
        console.log('Evento init (solo prima volta):', data);
    });
});
```

### Client

```javascript
// Listener specifico
socket.on('message', (data) => {
    console.log('Messaggio:', data);
});

// Listener per qualsiasi evento
socket.onAny((event, ...args) => {
    console.log('Evento:', event, args);
});

// Rimuovi listener
const handler = (data) => console.log(data);
socket.on('event', handler);
socket.off('event', handler); // Rimuovi
```

---

## Eventi Bidirezionali

### Esempio: Chat

**Server:**
```javascript
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Ricevi messaggio dal client
    socket.on('sendMessage', (message) => {
        console.log('Messaggio ricevuto:', message);
        
        // Invia a tutti i client
        io.emit('newMessage', {
            id: socket.id,
            text: message.text,
            timestamp: new Date()
        });
    });

    // Notifica quando utente sta scrivendo
    socket.on('typing', (isTyping) => {
        socket.broadcast.emit('userTyping', {
            userId: socket.id,
            typing: isTyping
        });
    });
});
```

**Client:**
```javascript
const socket = io();

// Invia messaggio
function sendMessage(text) {
    socket.emit('sendMessage', { text });
}

// Ricevi nuovi messaggi
socket.on('newMessage', (data) => {
    addMessageToUI(data);
});

// Notifica quando stai scrivendo
inputField.addEventListener('input', () => {
    socket.emit('typing', true);
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing', false);
    }, 1000);
});

// Mostra chi sta scrivendo
socket.on('userTyping', (data) => {
    if (data.typing) {
        showTypingIndicator(data.userId);
    } else {
        hideTypingIndicator(data.userId);
    }
});
```

---

## Acknowledgments

Gli **acknowledgments** permettono callback per confermare ricezione.

### Server Conferma Ricezione

```javascript
// Client - invia con callback
socket.emit('saveData', { name: 'Mario' }, (response) => {
    if (response.success) {
        console.log('✅ Dati salvati!');
    } else {
        console.error('❌ Errore:', response.error);
    }
});

// Server - chiama callback
io.on('connection', (socket) => {
    socket.on('saveData', (data, callback) => {
        // Salva dati...
        const success = saveToDatabase(data);
        
        // Conferma al client
        if (callback) {
            callback({
                success: success,
                error: success ? null : 'Database error'
            });
        }
    });
});
```

### Client Conferma Ricezione

```javascript
// Server - invia con callback
socket.emit('notification', {
    message: 'Nuovo messaggio'
}, (acknowledged) => {
    console.log('Client ha ricevuto:', acknowledged);
});

// Client - conferma
socket.on('notification', (data, callback) => {
    showNotification(data.message);
    
    // Conferma ricezione
    if (callback) {
        callback(true);
    }
});
```

### Timeout per Acknowledgments

```javascript
// Client - timeout se server non risponde
socket.timeout(5000).emit('getData', (err, response) => {
    if (err) {
        console.error('Timeout: server non ha risposto');
    } else {
        console.log('Risposta:', response);
    }
});
```

---

## Eventi Predefiniti

### Eventi di Connessione

#### Server

```javascript
io.on('connection', (socket) => {
    // Nuovo client connesso
    console.log('Client connected:', socket.id);

    socket.on('disconnect', (reason) => {
        // Client disconnesso
        console.log('Client disconnected:', reason);
        // reason: 'transport close', 'client namespace disconnect', etc.
    });

    socket.on('disconnecting', (reason) => {
        // Sta per disconnettersi (room ancora accessibili)
        console.log('Rooms:', socket.rooms);
    });
});
```

#### Client

```javascript
socket.on('connect', () => {
    // Connesso al server
    console.log('Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
    // Disconnesso dal server
    console.log('Disconnected:', reason);
    
    if (reason === 'io server disconnect') {
        // Server ha forzato disconnessione, riconnetti manualmente
        socket.connect();
    }
    // Altrimenti auto-reconnect
});

socket.on('connect_error', (error) => {
    // Errore di connessione
    console.error('Connection error:', error);
});

socket.on('reconnect', (attemptNumber) => {
    // Riconnesso dopo disconnessione
    console.log('Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('Reconnection attempt', attemptNumber);
});

socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error);
});

socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect');
});
```

### Eventi di Ping/Pong

```javascript
// Server
io.on('connection', (socket) => {
    socket.on('ping', () => {
        console.log('Ping from client');
    });

    socket.on('pong', (latency) => {
        console.log('Pong from client, latency:', latency, 'ms');
    });
});

// Client
socket.on('ping', () => {
    console.log('Ping from server');
});
```

---

## Eventi Personalizzati

### Naming Conventions

```javascript
// ✅ Buono - nomi descrittivi
socket.on('user:login', (data) => {});
socket.on('message:send', (data) => {});
socket.on('notification:new', (data) => {});

// ✅ Buono - namespace con slash
socket.on('chat/message', (data) => {});
socket.on('game/move', (data) => {});

// ❌ Evita - nomi generici
socket.on('data', (data) => {});
socket.on('update', (data) => {});
```

### Organizzare Eventi

```javascript
// events.js - constants
module.exports = {
    // Connection
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    
    // Chat
    CHAT_MESSAGE: 'chat:message',
    CHAT_TYPING: 'chat:typing',
    CHAT_JOIN_ROOM: 'chat:joinRoom',
    
    // User
    USER_LOGIN: 'user:login',
    USER_LOGOUT: 'user:logout',
    USER_UPDATE: 'user:update',
    
    // Notifications
    NOTIFY_NEW: 'notify:new',
    NOTIFY_READ: 'notify:read'
};
```

```javascript
// server.js
const EVENTS = require('./events');

io.on(EVENTS.CONNECTION, (socket) => {
    socket.on(EVENTS.CHAT_MESSAGE, (data) => {
        io.emit(EVENTS.CHAT_MESSAGE, data);
    });
    
    socket.on(EVENTS.USER_LOGIN, (data) => {
        // ...
    });
});
```

### Event Handlers Modulari

```javascript
// handlers/chatHandler.js
module.exports = (io, socket) => {
    socket.on('chat:message', (data) => {
        io.emit('chat:message', {
            user: socket.user,
            text: data.text,
            timestamp: new Date()
        });
    });

    socket.on('chat:typing', (isTyping) => {
        socket.broadcast.emit('chat:userTyping', {
            userId: socket.id,
            typing: isTyping
        });
    });
};

// handlers/gameHandler.js
module.exports = (io, socket) => {
    socket.on('game:move', (data) => {
        // Game logic
    });
};

// server.js
const chatHandler = require('./handlers/chatHandler');
const gameHandler = require('./handlers/gameHandler');

io.on('connection', (socket) => {
    chatHandler(io, socket);
    gameHandler(io, socket);
});
```

---

## Gestione Errori

### Try-Catch negli Handler

```javascript
socket.on('complexOperation', async (data) => {
    try {
        const result = await performComplexTask(data);
        socket.emit('operationSuccess', result);
    } catch (error) {
        console.error('Error:', error);
        socket.emit('operationError', {
            message: error.message,
            code: error.code
        });
    }
});
```

### Validazione Input

```javascript
const Joi = require('joi');

const messageSchema = Joi.object({
    text: Joi.string().min(1).max(500).required(),
    room: Joi.string().alphanum().required()
});

socket.on('chat:message', (data) => {
    // Valida input
    const { error, value } = messageSchema.validate(data);
    
    if (error) {
        return socket.emit('error', {
            message: 'Invalid message format',
            details: error.details
        });
    }
    
    // Input valido, processa
    io.to(value.room).emit('chat:message', {
        text: value.text,
        from: socket.id,
        timestamp: Date.now()
    });
});
```

### Error Events

```javascript
// Server
socket.on('error', (error) => {
    console.error('Socket error:', error);
});

io.engine.on("connection_error", (err) => {
    console.error('Connection error:', err);
    // err.req - request object
    // err.code - error code
    // err.message - error message
    // err.context - error context
});

// Client
socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
    
    if (error.message === 'invalid credentials') {
        // Handle authentication error
    }
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
});
```

### Centralized Error Handler

```javascript
// errorHandler.js
class SocketErrorHandler {
    static handle(socket, error, eventName) {
        console.error(`Error in ${eventName}:`, error);
        
        socket.emit('error', {
            event: eventName,
            message: this.getUserFriendlyMessage(error),
            timestamp: Date.now()
        });
    }
    
    static getUserFriendlyMessage(error) {
        const errorMap = {
            'VALIDATION_ERROR': 'Dati non validi',
            'NOT_FOUND': 'Risorsa non trovata',
            'UNAUTHORIZED': 'Non autorizzato',
            'SERVER_ERROR': 'Errore del server'
        };
        
        return errorMap[error.code] || 'Si è verificato un errore';
    }
}

// Usage
socket.on('getData', async (data) => {
    try {
        const result = await fetchData(data.id);
        socket.emit('dataResult', result);
    } catch (error) {
        SocketErrorHandler.handle(socket, error, 'getData');
    }
});
```

---

## Pattern Comuni

### Request-Response Pattern

```javascript
// Client richiede dati
socket.emit('getUser', { userId: 123 }, (response) => {
    if (response.error) {
        console.error('Error:', response.error);
    } else {
        console.log('User data:', response.data);
    }
});

// Server risponde
socket.on('getUser', async (data, callback) => {
    try {
        const user = await User.findById(data.userId);
        callback({ data: user });
    } catch (error) {
        callback({ error: error.message });
    }
});
```

### Publish-Subscribe Pattern

```javascript
// Client si iscrive a topic
socket.emit('subscribe', 'news');

// Server gestisce subscription
const subscriptions = new Map();

socket.on('subscribe', (topic) => {
    if (!subscriptions.has(socket.id)) {
        subscriptions.set(socket.id, new Set());
    }
    subscriptions.get(socket.id).add(topic);
});

// Pubblica a subscribers
function publishToTopic(topic, data) {
    subscriptions.forEach((topics, socketId) => {
        if (topics.has(topic)) {
            io.to(socketId).emit('topicUpdate', {
                topic,
                data
            });
        }
    });
}
```

### Event Chaining

```javascript
// Client
socket.emit('step1', data1, (response1) => {
    if (response1.success) {
        socket.emit('step2', response1.data, (response2) => {
            if (response2.success) {
                socket.emit('step3', response2.data, (response3) => {
                    console.log('All steps completed');
                });
            }
        });
    }
});

// Meglio con async/await e Promises
async function performSteps() {
    try {
        const result1 = await socketEmit('step1', data1);
        const result2 = await socketEmit('step2', result1);
        const result3 = await socketEmit('step3', result2);
        console.log('All steps completed');
    } catch (error) {
        console.error('Step failed:', error);
    }
}

function socketEmit(event, data) {
    return new Promise((resolve, reject) => {
        socket.emit(event, data, (response) => {
            if (response.success) {
                resolve(response.data);
            } else {
                reject(response.error);
            }
        });
    });
}
```

---

## Best Practices

### 1. Nomina Eventi Chiaramente

```javascript
// ✅ Buono
socket.on('user:login', handleLogin);
socket.on('message:send', handleMessage);

// ❌ Evita
socket.on('data', handleData);
socket.on('update', handleUpdate);
```

### 2. Usa Acknowledgments

```javascript
// ✅ Buono - conferma critica
socket.emit('payment:process', data, (response) => {
    if (response.success) {
        showSuccess();
    }
});

// ❌ Evita - operazione critica senza conferma
socket.emit('payment:process', data);
```

### 3. Valida Sempre Input

```javascript
// ✅ Buono
socket.on('message', (data) => {
    if (!data || typeof data.text !== 'string') {
        return socket.emit('error', 'Invalid message');
    }
    // Processa
});
```

### 4. Limita Dimensione Payload

```javascript
// ✅ Buono
socket.on('data', (data) => {
    const maxSize = 1024 * 1024; // 1MB
    const size = JSON.stringify(data).length;
    
    if (size > maxSize) {
        return socket.emit('error', 'Payload too large');
    }
    // Processa
});
```

### 5. Throttle Eventi Frequenti

```javascript
// Client - throttle typing events
const throttle = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

const emitTyping = throttle(() => {
    socket.emit('typing', true);
}, 300);

input.addEventListener('keypress', emitTyping);
```

---

## Prossimi Passi

Ora sai come:
- ✅ Emettere e ascoltare eventi
- ✅ Usare acknowledgments
- ✅ Gestire eventi predefiniti
- ✅ Organizzare eventi personalizzati
- ✅ Gestire errori

**Prossima Guida**: [03-room-namespace.md](03-room-namespace.md) per organizzare connessioni con room e namespace.
