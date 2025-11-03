/**
 * Chat Room con Socket.io
 * Sistema di chat multi-room con typing indicators
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

/**
 * DATABASE IN-MEMORY
 */
// Map: socketId → userData
const users = new Map();

// Map: roomName → Set di socketId
const rooms = new Map();

// Map: roomName → Array di messaggi
const roomMessages = new Map();

/**
 * HELPER FUNCTIONS
 */

function createUser(socketId, username) {
    return {
        socketId,
        username,
        currentRoom: null,
        joinedAt: new Date()
    };
}

function getUsersInRoom(roomName) {
    const socketIds = rooms.get(roomName) || new Set();
    return Array.from(socketIds).map(id => users.get(id)).filter(Boolean);
}

function getRoomsList() {
    return Array.from(rooms.keys()).map(roomName => ({
        name: roomName,
        users: getUsersInRoom(roomName).length,
        messages: (roomMessages.get(roomName) || []).length
    }));
}

function addMessageToRoom(roomName, message) {
    if (!roomMessages.has(roomName)) {
        roomMessages.set(roomName, []);
    }
    const messages = roomMessages.get(roomName);
    messages.push(message);
    
    // Mantieni solo ultimi 100 messaggi
    if (messages.length > 100) {
        messages.shift();
    }
}

/**
 * SOCKET.IO CONNECTION
 */
io.on('connection', (socket) => {
    console.log(`\n✅ Nuovo client connesso: ${socket.id}`);

    /**
     * EVENTO: setUsername
     * Imposta username per il socket
     */
    socket.on('setUsername', (username, callback) => {
        console.log(`👤 ${socket.id} imposta username: ${username}`);
        
        // Validazione
        if (!username || username.trim().length === 0) {
            callback({ success: false, error: 'Username vuoto' });
            return;
        }
        
        if (username.length > 20) {
            callback({ success: false, error: 'Username troppo lungo (max 20)' });
            return;
        }
        
        // Salva utente
        users.set(socket.id, createUser(socket.id, username.trim()));
        
        callback({ success: true, username: username.trim() });
        
        // Invia lista room disponibili
        socket.emit('roomsList', getRoomsList());
    });

    /**
     * EVENTO: joinRoom
     * Entra in una room
     */
    socket.on('joinRoom', (roomName, callback) => {
        const user = users.get(socket.id);
        
        if (!user) {
            callback({ success: false, error: 'Imposta prima username' });
            return;
        }
        
        console.log(`🚪 ${user.username} entra in room: ${roomName}`);
        
        // Esci dalla room precedente
        if (user.currentRoom) {
            leaveCurrentRoom(socket);
        }
        
        // Join room Socket.io
        socket.join(roomName);
        
        // Aggiorna database
        if (!rooms.has(roomName)) {
            rooms.set(roomName, new Set());
        }
        rooms.get(roomName).add(socket.id);
        user.currentRoom = roomName;
        
        // Notifica tutti nella room
        socket.to(roomName).emit('userJoined', {
            username: user.username,
            timestamp: new Date().toISOString()
        });
        
        // Invia storico messaggi al nuovo utente
        const history = roomMessages.get(roomName) || [];
        
        callback({
            success: true,
            room: roomName,
            users: getUsersInRoom(roomName),
            messages: history
        });
        
        // Aggiorna lista utenti a tutti
        io.to(roomName).emit('usersList', getUsersInRoom(roomName));
        
        // Aggiorna lista room a tutti
        io.emit('roomsList', getRoomsList());
    });

    /**
     * EVENTO: leaveRoom
     * Esce dalla room corrente
     */
    socket.on('leaveRoom', () => {
        leaveCurrentRoom(socket);
    });

    function leaveCurrentRoom(socket) {
        const user = users.get(socket.id);
        if (!user || !user.currentRoom) return;
        
        const roomName = user.currentRoom;
        console.log(`🚪 ${user.username} esce da room: ${roomName}`);
        
        // Lascia room Socket.io
        socket.leave(roomName);
        
        // Aggiorna database
        const roomUsers = rooms.get(roomName);
        if (roomUsers) {
            roomUsers.delete(socket.id);
            
            // Rimuovi room se vuota
            if (roomUsers.size === 0) {
                rooms.delete(roomName);
                roomMessages.delete(roomName);
            }
        }
        
        user.currentRoom = null;
        
        // Notifica tutti nella room
        socket.to(roomName).emit('userLeft', {
            username: user.username,
            timestamp: new Date().toISOString()
        });
        
        // Aggiorna lista utenti
        io.to(roomName).emit('usersList', getUsersInRoom(roomName));
        
        // Aggiorna lista room
        io.emit('roomsList', getRoomsList());
    }

    /**
     * EVENTO: chatMessage
     * Invia messaggio nella room corrente
     */
    socket.on('chatMessage', (message, callback) => {
        const user = users.get(socket.id);
        
        if (!user) {
            callback({ success: false, error: 'Utente non trovato' });
            return;
        }
        
        if (!user.currentRoom) {
            callback({ success: false, error: 'Non sei in una room' });
            return;
        }
        
        if (!message || message.trim().length === 0) {
            callback({ success: false, error: 'Messaggio vuoto' });
            return;
        }
        
        if (message.length > 500) {
            callback({ success: false, error: 'Messaggio troppo lungo (max 500)' });
            return;
        }
        
        const messageData = {
            id: Date.now().toString(),
            username: user.username,
            message: message.trim(),
            timestamp: new Date().toISOString()
        };
        
        console.log(`💬 ${user.username} → ${user.currentRoom}: ${message.trim()}`);
        
        // Salva messaggio
        addMessageToRoom(user.currentRoom, messageData);
        
        // Invia a tutti nella room (incluso mittente)
        io.to(user.currentRoom).emit('newMessage', messageData);
        
        callback({ success: true, message: messageData });
    });

    /**
     * EVENTO: typing
     * Notifica che utente sta scrivendo
     */
    socket.on('typing', (isTyping) => {
        const user = users.get(socket.id);
        
        if (user && user.currentRoom) {
            socket.to(user.currentRoom).emit('userTyping', {
                username: user.username,
                isTyping: isTyping
            });
        }
    });

    /**
     * EVENTO: getRooms
     * Ottiene lista room disponibili
     */
    socket.on('getRooms', (callback) => {
        callback(getRoomsList());
    });

    /**
     * EVENTO: disconnect
     * Gestisce disconnessione
     */
    socket.on('disconnect', () => {
        const user = users.get(socket.id);
        
        if (user) {
            console.log(`❌ ${user.username} disconnesso`);
            
            // Esci dalla room
            leaveCurrentRoom(socket);
            
            // Rimuovi utente
            users.delete(socket.id);
        } else {
            console.log(`❌ ${socket.id} disconnesso`);
        }
    });

    /**
     * EVENTO: error
     */
    socket.on('error', (error) => {
        console.error(`⚠️ Errore socket ${socket.id}:`, error);
    });
});

/**
 * HTTP API
 */
app.get('/api/rooms', (req, res) => {
    res.json(getRoomsList());
});

app.get('/api/users', (req, res) => {
    res.json(Array.from(users.values()));
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════');
    console.log('💬 Chat Room Server');
    console.log('═══════════════════════════════════════════════');
    console.log(`\n📡 Server: http://localhost:${PORT}`);
    console.log('\n🧪 Test:');
    console.log(`   ➤ Apri http://localhost:${PORT}`);
    console.log('   ➤ Apri più tab/finestre');
    console.log('   ➤ Imposta username');
    console.log('   ➤ Crea/join room');
    console.log('   ➤ Chatta!');
    console.log('\n═══════════════════════════════════════════════\n');
});
