/**
 * Hello World Socket.io
 * Esempio base di connessione Socket.io
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

// Setup Express
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static('public'));

// Statistiche connessioni
let connectionCount = 0;
let messageCount = 0;

/**
 * SOCKET.IO CONNECTION
 */
io.on('connection', (socket) => {
    connectionCount++;
    console.log('');
    console.log('✅ Nuovo client connesso');
    console.log('   Socket ID:', socket.id);
    console.log('   Connessioni totali:', connectionCount);
    console.log('   Connessioni attive:', io.engine.clientsCount);

    // Invia messaggio di benvenuto al nuovo client
    socket.emit('welcome', {
        message: 'Benvenuto nel server Socket.io!',
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });

    // Invia a tutti gli altri che c'è un nuovo utente
    socket.broadcast.emit('userConnected', {
        socketId: socket.id,
        timestamp: new Date().toISOString()
    });

    /**
     * EVENTO: message
     * Riceve messaggio dal client e lo ritrasmette a tutti
     */
    socket.on('message', (data) => {
        messageCount++;
        
        console.log('📩 Messaggio ricevuto:');
        console.log('   Da:', socket.id);
        console.log('   Contenuto:', data);
        
        // Invia conferma al mittente
        socket.emit('messageReceived', {
            message: 'Messaggio ricevuto dal server',
            original: data,
            timestamp: new Date().toISOString()
        });
        
        // Broadcast a tutti gli altri client
        socket.broadcast.emit('newMessage', {
            from: socket.id,
            message: data,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * EVENTO: echo
     * Semplice echo - rimanda indietro lo stesso messaggio
     */
    socket.on('echo', (data) => {
        console.log('🔊 Echo request:', data);
        socket.emit('echo', data);
    });

    /**
     * EVENTO: ping
     * Risponde con pong per test latency
     */
    socket.on('ping', () => {
        socket.emit('pong', {
            timestamp: Date.now()
        });
    });

    /**
     * EVENTO: getStats
     * Invia statistiche server
     */
    socket.on('getStats', () => {
        socket.emit('stats', {
            totalConnections: connectionCount,
            activeConnections: io.engine.clientsCount,
            totalMessages: messageCount,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    });

    /**
     * EVENTO: broadcast
     * Client può fare broadcast a tutti
     */
    socket.on('broadcast', (data) => {
        console.log('📢 Broadcast da', socket.id, ':', data);
        
        // Invia a TUTTI incluso mittente
        io.emit('broadcast', {
            from: socket.id,
            message: data,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * EVENTO: disconnect
     * Gestisce disconnessione client
     */
    socket.on('disconnect', (reason) => {
        console.log('');
        console.log('❌ Client disconnesso');
        console.log('   Socket ID:', socket.id);
        console.log('   Motivo:', reason);
        console.log('   Connessioni attive rimanenti:', io.engine.clientsCount);
        
        // Notifica tutti gli altri
        socket.broadcast.emit('userDisconnected', {
            socketId: socket.id,
            reason: reason,
            timestamp: new Date().toISOString()
        });
    });

    /**
     * EVENTO: error
     * Gestisce errori socket
     */
    socket.on('error', (error) => {
        console.error('⚠️ Errore socket:', socket.id);
        console.error('   Errore:', error);
    });
});

/**
 * HTTP ROUTES
 */
app.get('/api/stats', (req, res) => {
    res.json({
        totalConnections: connectionCount,
        activeConnections: io.engine.clientsCount,
        totalMessages: messageCount,
        uptime: process.uptime()
    });
});

/**
 * START SERVER
 */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════');
    console.log('🚀 Socket.io Hello World Server');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log(`📡 Server in ascolto su http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Eventi disponibili:');
    console.log('   ➤ message      - Invia messaggio');
    console.log('   ➤ echo         - Echo test');
    console.log('   ➤ ping         - Latency test');
    console.log('   ➤ getStats     - Statistiche server');
    console.log('   ➤ broadcast    - Broadcast a tutti');
    console.log('');
    console.log('🧪 Test:');
    console.log(`   ➤ Apri http://localhost:${PORT}`);
    console.log('   ➤ Apri Console Browser (F12)');
    console.log('   ➤ Apri più tab per testare broadcast');
    console.log('');
    console.log('═══════════════════════════════════════════════');
});
