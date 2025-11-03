# Room e Namespace

## Indice
- [Concetto di Room](#concetto-di-room)
- [Creare e Gestire Room](#creare-e-gestire-room)
- [Broadcasting in Room](#broadcasting-in-room)
- [Namespace](#namespace)
- [Namespace Multipli](#namespace-multipli)
- [Comunicazione tra Namespace](#comunicazione-tra-namespace)
- [Use Case Pratici](#use-case-pratici)

---

## Concetto di Room

Le **room** sono canali arbitrari in cui i socket possono entrare e uscire. Permettono di inviare messaggi a un sottoinsieme di client.

### Visualizzazione

```
Server
├── Room "chat1"
│   ├── Socket A
│   ├── Socket B
│   └── Socket C
│
├── Room "chat2"
│   ├── Socket D
│   └── Socket E
│
└── Room "admin"
    └── Socket F
```

### Caratteristiche

✅ Lato server only (non visibili al client)  
✅ Un socket può essere in più room  
✅ Nome room = stringa arbitraria  
✅ Broadcast selettivo  
✅ Creazione automatica al join  

---

## Creare e Gestire Room

### Join Room

```javascript
io.on('connection', (socket) => {
    // Join room singola
    socket.join('room1');
    
    // Join multiple room
    socket.join(['room1', 'room2', 'room3']);
    
    // Join con conferma
    socket.join('room1', (err) => {
        if (err) {
            console.error('Error joining room:', err);
        } else {
            console.log('Joined room1');
        }
    });
});
```

### Leave Room

```javascript
// Leave room specifica
socket.leave('room1');

// Leave multiple room
socket.leave(['room1', 'room2']);

// Leave con conferma
socket.leave('room1', (err) => {
    if (err) {
        console.error('Error leaving room:', err);
    }
});
```

### Ottenere Room di un Socket

```javascript
console.log(socket.rooms);
// Set { <socket.id>, 'room1', 'room2' }

// Check se socket è in una room
if (socket.rooms.has('room1')) {
    console.log('Socket is in room1');
}
```

### Ottenere Socket in una Room

```javascript
// Get Set di socket IDs in una room
const socketsInRoom = await io.in('room1').allSockets();
console.log(socketsInRoom);
// Set { <socket-id-1>, <socket-id-2>, ... }

// Conta socket in room
const count = (await io.in('room1').allSockets()).size;
console.log('Users in room1:', count);
```

### Default Room

Ogni socket è automaticamente nella room col suo ID:

```javascript
io.on('connection', (socket) => {
    console.log(socket.rooms);
    // Set { <socket.id> }
    
    // Invia solo a questo socket
    io.to(socket.id).emit('private', 'Solo tu');
});
```

---

## Broadcasting in Room

### Invia a Room Specifica

```javascript
// Invia a TUTTI in room1
io.to('room1').emit('message', 'Hello room1');

// Alias
io.in('room1').emit('message', 'Hello room1');
```

### Invia a Multiple Room

```javascript
// Invia a room1 E room2
io.to('room1').to('room2').emit('message', 'Hello both rooms');

// Oppure con array
io.to(['room1', 'room2']).emit('message', 'Hello both rooms');
```

### Invia a Room Tranne il Mittente

```javascript
socket.on('message', (data) => {
    // Invia a room1, tranne chi ha inviato
    socket.to('room1').emit('message', data);
});
```

### Invia a Room Tranne Alcune

```javascript
// Invia a room1 tranne room2
io.to('room1').except('room2').emit('message', 'data');

// Tranne socket specifico
io.to('room1').except(socket.id).emit('message', 'data');
```

---

## Esempio Completo: Chat Room

### Server

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Traccia utenti per room
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('joinRoom', ({ room, username }) => {
        // Leave previous rooms (tranne socket.id)
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                socket.leave(room);
            }
        });

        // Join nuova room
        socket.join(room);
        socket.username = username;
        socket.currentRoom = room;

        // Aggiungi a tracking
        if (!rooms.has(room)) {
            rooms.set(room, new Set());
        }
        rooms.get(room).add({ id: socket.id, username });

        // Notifica room
        io.to(room).emit('userJoined', {
            username,
            message: `${username} si è unito alla chat`,
            users: Array.from(rooms.get(room)).map(u => u.username)
        });

        // Conferma al client
        socket.emit('joinedRoom', {
            room,
            users: Array.from(rooms.get(room)).map(u => u.username)
        });
    });

    // Invia messaggio a room
    socket.on('chatMessage', ({ room, message }) => {
        io.to(room).emit('message', {
            username: socket.username,
            message,
            timestamp: new Date()
        });
    });

    // Typing indicator
    socket.on('typing', ({ room, isTyping }) => {
        socket.to(room).emit('userTyping', {
            username: socket.username,
            isTyping
        });
    });

    // Leave room
    socket.on('leaveRoom', () => {
        if (socket.currentRoom) {
            const room = socket.currentRoom;
            
            // Remove from tracking
            if (rooms.has(room)) {
                rooms.get(room).delete(socket.id);
                if (rooms.get(room).size === 0) {
                    rooms.delete(room);
                }
            }

            // Notifica room
            socket.to(room).emit('userLeft', {
                username: socket.username,
                message: `${socket.username} ha lasciato la chat`
            });

            socket.leave(room);
            socket.currentRoom = null;
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (socket.currentRoom && rooms.has(socket.currentRoom)) {
            const room = socket.currentRoom;
            
            // Remove from tracking
            rooms.get(room).delete(socket.id);
            if (rooms.get(room).size === 0) {
                rooms.delete(room);
            }

            // Notifica room
            io.to(room).emit('userLeft', {
                username: socket.username,
                message: `${socket.username} si è disconnesso`
            });
        }
    });

    // Get room list
    socket.on('getRooms', () => {
        const roomList = Array.from(rooms.keys()).map(room => ({
            name: room,
            users: rooms.get(room).size
        }));
        
        socket.emit('roomList', roomList);
    });
});

server.listen(3000, () => {
    console.log('Server on http://localhost:3000');
});
```

### Client

```javascript
const socket = io();
let currentRoom = null;
let username = null;

// Join room
function joinRoom(roomName, userName) {
    username = userName;
    currentRoom = roomName;
    
    socket.emit('joinRoom', {
        room: roomName,
        username: userName
    });
}

// Listen for join confirmation
socket.on('joinedRoom', (data) => {
    console.log('Joined room:', data.room);
    console.log('Users:', data.users);
    updateUserList(data.users);
});

// User joined
socket.on('userJoined', (data) => {
    addSystemMessage(data.message);
    updateUserList(data.users);
});

// User left
socket.on('userLeft', (data) => {
    addSystemMessage(data.message);
});

// Receive message
socket.on('message', (data) => {
    addMessage(data.username, data.message, data.timestamp);
});

// Send message
function sendMessage(message) {
    if (currentRoom) {
        socket.emit('chatMessage', {
            room: currentRoom,
            message
        });
    }
}

// Typing indicator
function setTyping(isTyping) {
    if (currentRoom) {
        socket.emit('typing', {
            room: currentRoom,
            isTyping
        });
    }
}

socket.on('userTyping', (data) => {
    if (data.isTyping) {
        showTyping(data.username);
    } else {
        hideTyping(data.username);
    }
});

// Leave room
function leaveRoom() {
    if (currentRoom) {
        socket.emit('leaveRoom');
        currentRoom = null;
    }
}

// Get available rooms
function getRooms() {
    socket.emit('getRooms');
}

socket.on('roomList', (rooms) => {
    displayRoomList(rooms);
});
```

---

## Namespace

I **namespace** permettono di dividere la logica dell'applicazione in canali separati. Ogni namespace ha il proprio spazio di eventi e room.

### Perché Usare Namespace?

✅ Separare logica (chat, notifications, admin)  
✅ Autorizzazione granulare  
✅ Ridurre complessità  
✅ Multiplexing della connessione  

### Default Namespace

```javascript
// Default namespace '/'
io.on('connection', (socket) => {
    console.log('Connected to default namespace');
});

// Equivalente a:
io.of('/').on('connection', (socket) => {
    console.log('Connected to default namespace');
});
```

---

## Namespace Multipli

### Server

```javascript
// Namespace per chat
const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
    console.log('User connected to /chat');
    
    socket.on('message', (data) => {
        chatNamespace.emit('message', data);
    });
});

// Namespace per notifiche
const notifyNamespace = io.of('/notifications');
notifyNamespace.on('connection', (socket) => {
    console.log('User connected to /notifications');
    
    socket.on('subscribe', (topic) => {
        socket.join(topic);
    });
});

// Namespace admin (con middleware auth)
const adminNamespace = io.of('/admin');
adminNamespace.use((socket, next) => {
    if (socket.handshake.auth.token === 'admin-secret') {
        next();
    } else {
        next(new Error('Unauthorized'));
    }
});

adminNamespace.on('connection', (socket) => {
    console.log('Admin connected');
    
    // Solo admin possono inviare broadcast globali
    socket.on('globalBroadcast', (message) => {
        io.emit('announcement', message);
    });
});
```

### Client

```javascript
// Connetti a namespace specifiche
const chatSocket = io('/chat');
const notifySocket = io('/notifications');
const adminSocket = io('/admin', {
    auth: {
        token: 'admin-secret'
    }
});

// Usa socket separate
chatSocket.on('message', (data) => {
    console.log('Chat message:', data);
});

notifySocket.on('notification', (data) => {
    console.log('Notification:', data);
});

adminSocket.on('connect_error', (error) => {
    console.error('Admin auth failed:', error.message);
});
```

### Dynamic Namespace

```javascript
// Namespace dinamiche con regex
io.of(/^\/dynamic-\w+$/).on('connection', (socket) => {
    const namespace = socket.nsp.name;
    console.log('Connected to:', namespace);
    // /dynamic-123, /dynamic-abc, etc.
    
    socket.on('message', (data) => {
        // Broadcast solo in questa namespace
        socket.nsp.emit('message', data);
    });
});

// Client
const dynamicSocket = io('/dynamic-123');
```

---

## Comunicazione tra Namespace

### Broadcasting tra Namespace

```javascript
// Da /chat a tutte le namespace
io.of('/chat').on('connection', (socket) => {
    socket.on('importantMessage', (data) => {
        // Invia a chat
        socket.nsp.emit('message', data);
        
        // Invia anche a notifications
        io.of('/notifications').emit('newMessage', {
            from: 'chat',
            data: data
        });
        
        // Invia a default namespace
        io.emit('globalUpdate', data);
    });
});
```

### Shared State tra Namespace

```javascript
// Shared data store
const sharedState = {
    activeUsers: new Set(),
    globalStats: { messages: 0 }
};

// Namespace 1
io.of('/chat').on('connection', (socket) => {
    sharedState.activeUsers.add(socket.id);
    
    socket.on('message', () => {
        sharedState.globalStats.messages++;
    });
    
    socket.on('disconnect', () => {
        sharedState.activeUsers.delete(socket.id);
    });
});

// Namespace 2
io.of('/admin').on('connection', (socket) => {
    socket.on('getStats', () => {
        socket.emit('stats', {
            activeUsers: sharedState.activeUsers.size,
            totalMessages: sharedState.globalStats.messages
        });
    });
});
```

---

## Use Case Pratici

### 1. Multi-tenant Chat Application

```javascript
// Namespace per ogni tenant
function createTenantNamespace(tenantId) {
    const nsp = io.of(`/tenant-${tenantId}`);
    
    nsp.use((socket, next) => {
        // Verifica accesso tenant
        if (socket.handshake.auth.tenantId === tenantId) {
            next();
        } else {
            next(new Error('Wrong tenant'));
        }
    });
    
    nsp.on('connection', (socket) => {
        // Room per canali
        socket.on('joinChannel', (channel) => {
            socket.join(channel);
            nsp.to(channel).emit('userJoined', socket.user);
        });
        
        socket.on('message', (data) => {
            nsp.to(data.channel).emit('message', {
                user: socket.user,
                text: data.text,
                channel: data.channel
            });
        });
    });
    
    return nsp;
}

// Create namespaces per tenant
createTenantNamespace('tenant1');
createTenantNamespace('tenant2');
```

### 2. Gaming Rooms

```javascript
const gameNamespace = io.of('/game');
const activeGames = new Map();

gameNamespace.on('connection', (socket) => {
    // Crea nuova partita
    socket.on('createGame', ({ gameId, maxPlayers }) => {
        socket.join(gameId);
        
        activeGames.set(gameId, {
            id: gameId,
            players: [socket.id],
            maxPlayers,
            started: false
        });
        
        socket.emit('gameCreated', { gameId });
    });
    
    // Join partita esistente
    socket.on('joinGame', ({ gameId }) => {
        const game = activeGames.get(gameId);
        
        if (!game) {
            return socket.emit('error', 'Game not found');
        }
        
        if (game.players.length >= game.maxPlayers) {
            return socket.emit('error', 'Game full');
        }
        
        if (game.started) {
            return socket.emit('error', 'Game already started');
        }
        
        socket.join(gameId);
        game.players.push(socket.id);
        
        // Notifica tutti i player
        gameNamespace.to(gameId).emit('playerJoined', {
            players: game.players.length,
            maxPlayers: game.maxPlayers
        });
        
        // Start game se pieno
        if (game.players.length === game.maxPlayers) {
            game.started = true;
            gameNamespace.to(gameId).emit('gameStart');
        }
    });
    
    // Game move
    socket.on('move', ({ gameId, move }) => {
        const game = activeGames.get(gameId);
        
        if (game && game.started) {
            // Broadcast move agli altri player
            socket.to(gameId).emit('opponentMove', move);
        }
    });
    
    // Leave game
    socket.on('leaveGame', ({ gameId }) => {
        const game = activeGames.get(gameId);
        
        if (game) {
            game.players = game.players.filter(p => p !== socket.id);
            
            if (game.players.length === 0) {
                activeGames.delete(gameId);
            } else {
                gameNamespace.to(gameId).emit('playerLeft', {
                    players: game.players.length
                });
            }
        }
        
        socket.leave(gameId);
    });
});
```

### 3. Private Messaging

```javascript
io.on('connection', (socket) => {
    // Join room privata con utente ID
    socket.join(`user:${socket.userId}`);
    
    // Invia messaggio privato
    socket.on('privateMessage', ({ recipientId, message }) => {
        // Invia a destinatario
        io.to(`user:${recipientId}`).emit('privateMessage', {
            from: socket.userId,
            message,
            timestamp: new Date()
        });
        
        // Conferma al mittente
        socket.emit('messageSent', {
            to: recipientId,
            message
        });
        
        // Salva in database
        saveMessage({
            from: socket.userId,
            to: recipientId,
            message
        });
    });
});
```

---

## Best Practices

### 1. Nomenclatura Room

```javascript
// ✅ Buono - namespace chiara
const room = `chat:${roomId}`;
const room = `game:${gameId}:player1`;
const room = `user:${userId}`;

// ❌ Evita - ambigua
const room = roomId;
const room = 'room1';
```

### 2. Cleanup Room

```javascript
socket.on('disconnect', () => {
    // Pulisci tracking
    socket.rooms.forEach(room => {
        // Remove from custom tracking
        if (roomTracking.has(room)) {
            roomTracking.get(room).delete(socket.id);
        }
    });
});
```

### 3. Limita Room per Socket

```javascript
const MAX_ROOMS_PER_SOCKET = 5;

socket.on('joinRoom', (room) => {
    if (socket.rooms.size >= MAX_ROOMS_PER_SOCKET) {
        return socket.emit('error', 'Too many rooms');
    }
    
    socket.join(room);
});
```

### 4. Usa Namespace per Separazione Logica

```javascript
// ✅ Buono - logiche separate
const chat = io.of('/chat');
const admin = io.of('/admin');
const api = io.of('/api');

// ❌ Evita - tutto in default namespace
io.on('connection', (socket) => {
    // troppa logica qui
});
```

---

## Prossimi Passi

Ora sai come:
- ✅ Usare room per organizzare client
- ✅ Creare namespace multiple
- ✅ Broadcasting selettivo
- ✅ Implementare chat room
- ✅ Separare logica con namespace

**Prossima Guida**: [04-broadcasting.md](04-broadcasting.md) per tecniche avanzate di broadcasting.
