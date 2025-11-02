/**
 * Heartbeat Example - Server
 * Server TCP con heartbeat per rilevare connessioni morte
 */

const net = require('net');

const PORT = process.env.PORT || 7777;
const HEARTBEAT_INTERVAL = 10000;  // 10 secondi
const HEARTBEAT_TIMEOUT = 30000;   // 30 secondi

// Clients connessi
const clients = new Map();

// Statistiche
const stats = {
    totalConnections: 0,
    activeConnections: 0,
    heartbeatsSent: 0,
    heartbeatsReceived: 0,
    timeouts: 0,
    startTime: new Date()
};

/**
 * Gestisce nuovo client
 */
function handleClient(socket) {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    
    // Inizializza info client
    const clientInfo = {
        socket,
        id: clientId,
        connectedAt: new Date(),
        lastHeartbeat: Date.now(),
        heartbeatsSent: 0,
        heartbeatsReceived: 0,
        heartbeatInterval: null,
        timeoutCheck: null
    };
    
    clients.set(socket, clientInfo);
    stats.totalConnections++;
    stats.activeConnections++;
    
    console.log(`\n✅ Nuovo client: ${clientId}`);
    console.log(`   Connessioni attive: ${stats.activeConnections}`);
    
    // Invia welcome
    sendMessage(socket, {
        type: 'WELCOME',
        message: 'Connesso al server heartbeat',
        heartbeatInterval: HEARTBEAT_INTERVAL,
        heartbeatTimeout: HEARTBEAT_TIMEOUT
    });
    
    // Avvia heartbeat
    startHeartbeat(clientInfo);
    
    // Gestione dati
    socket.on('data', (data) => {
        try {
            const messages = data.toString().split('\n').filter(m => m.trim());
            
            messages.forEach(msg => {
                const message = JSON.parse(msg);
                handleMessage(socket, message, clientInfo);
            });
            
        } catch (err) {
            console.error(`⚠️  Errore parsing da ${clientId}:`, err.message);
        }
    });
    
    // Gestione errori
    socket.on('error', (err) => {
        console.error(`⚠️  Errore socket ${clientId}:`, err.message);
    });
    
    // Gestione disconnessione
    socket.on('end', () => {
        cleanup(socket, clientInfo, 'disconnesso');
    });
}

/**
 * Gestisce messaggio da client
 */
function handleMessage(socket, message, clientInfo) {
    switch (message.type) {
        case 'HEARTBEAT_ACK':
            // Client ha risposto al heartbeat
            clientInfo.lastHeartbeat = Date.now();
            clientInfo.heartbeatsReceived++;
            stats.heartbeatsReceived++;
            
            console.log(`💓 Heartbeat ACK da ${clientInfo.id}`);
            break;
            
        case 'MESSAGE':
            // Messaggio normale dal client
            console.log(`📨 Messaggio da ${clientInfo.id}:`, message.text);
            
            // Echo back
            sendMessage(socket, {
                type: 'MESSAGE_ACK',
                text: message.text,
                timestamp: Date.now()
            });
            break;
            
        default:
            console.log(`⚠️  Tipo messaggio sconosciuto da ${clientInfo.id}:`, message.type);
    }
}

/**
 * Avvia heartbeat per un client
 */
function startHeartbeat(clientInfo) {
    // Invia heartbeat periodicamente
    clientInfo.heartbeatInterval = setInterval(() => {
        sendMessage(clientInfo.socket, {
            type: 'HEARTBEAT',
            timestamp: Date.now()
        });
        
        clientInfo.heartbeatsSent++;
        stats.heartbeatsSent++;
        
        console.log(`💓 Heartbeat inviato a ${clientInfo.id}`);
        
    }, HEARTBEAT_INTERVAL);
    
    // Controlla timeout
    clientInfo.timeoutCheck = setInterval(() => {
        const timeSinceLastHeartbeat = Date.now() - clientInfo.lastHeartbeat;
        
        if (timeSinceLastHeartbeat > HEARTBEAT_TIMEOUT) {
            console.log(`⚠️  Client ${clientInfo.id} timeout!`);
            console.log(`   Ultimo heartbeat: ${timeSinceLastHeartbeat}ms fa`);
            
            stats.timeouts++;
            cleanup(clientInfo.socket, clientInfo, 'timeout');
        }
        
    }, 5000); // Controlla ogni 5 secondi
}

/**
 * Invia messaggio a client
 */
function sendMessage(socket, message) {
    if (!socket.destroyed) {
        socket.write(JSON.stringify(message) + '\n');
    }
}

/**
 * Cleanup connessione
 */
function cleanup(socket, clientInfo, reason) {
    console.log(`\n👋 Client ${clientInfo.id} ${reason}`);
    console.log(`   Durata connessione: ${Math.floor((Date.now() - clientInfo.connectedAt) / 1000)}s`);
    console.log(`   Heartbeats inviati: ${clientInfo.heartbeatsSent}`);
    console.log(`   Heartbeats ricevuti: ${clientInfo.heartbeatsReceived}`);
    
    // Stop heartbeat
    if (clientInfo.heartbeatInterval) {
        clearInterval(clientInfo.heartbeatInterval);
    }
    if (clientInfo.timeoutCheck) {
        clearInterval(clientInfo.timeoutCheck);
    }
    
    // Rimuovi da mappa
    clients.delete(socket);
    stats.activeConnections--;
    
    console.log(`   Connessioni attive: ${stats.activeConnections}`);
    
    // Chiudi socket
    if (!socket.destroyed) {
        socket.destroy();
    }
}

/**
 * CREA SERVER
 */
const server = net.createServer(handleClient);

server.listen(PORT, () => {
    console.log('');
    console.log('═'.repeat(60));
    console.log('💓 Heartbeat TCP Server');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
    console.log(`⏱️  Intervallo heartbeat: ${HEARTBEAT_INTERVAL}ms`);
    console.log(`⏰ Timeout heartbeat: ${HEARTBEAT_TIMEOUT}ms`);
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
});

server.on('error', (err) => {
    console.error('⚠️  Errore server:', err.message);
    process.exit(1);
});

/**
 * MOSTRA STATISTICHE
 */
function showStats() {
    console.log('');
    console.log('═'.repeat(60));
    console.log('📊 STATISTICHE');
    console.log('═'.repeat(60));
    console.log(`   Connessioni totali: ${stats.totalConnections}`);
    console.log(`   Connessioni attive: ${stats.activeConnections}`);
    console.log(`   Heartbeats inviati: ${stats.heartbeatsSent}`);
    console.log(`   Heartbeats ricevuti: ${stats.heartbeatsReceived}`);
    console.log(`   Timeout rilevati: ${stats.timeouts}`);
    console.log(`   Uptime: ${Math.floor((Date.now() - stats.startTime) / 1000)}s`);
    
    if (clients.size > 0) {
        console.log('');
        console.log('   Client attivi:');
        clients.forEach((info) => {
            const timeSinceLastHeartbeat = Date.now() - info.lastHeartbeat;
            console.log(`     ${info.id}:`);
            console.log(`       Connesso da: ${Math.floor((Date.now() - info.connectedAt) / 1000)}s`);
            console.log(`       Ultimo heartbeat: ${timeSinceLastHeartbeat}ms fa`);
            console.log(`       Heartbeats: ${info.heartbeatsSent} inviati, ${info.heartbeatsReceived} ricevuti`);
        });
    }
    
    console.log('═'.repeat(60));
    console.log('');
}

// Mostra stats ogni 30 secondi
setInterval(showStats, 30000);

/**
 * GRACEFUL SHUTDOWN
 */
process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Arresto server...');
    
    // Disconnetti tutti i client
    clients.forEach((info, socket) => {
        sendMessage(socket, {
            type: 'SERVER_SHUTDOWN',
            message: 'Server in shutdown'
        });
        cleanup(socket, info, 'server shutdown');
    });
    
    showStats();
    
    server.close(() => {
        console.log('✅ Server chiuso');
        process.exit(0);
    });
    
    setTimeout(() => {
        console.error('⚠️  Force exit');
        process.exit(1);
    }, 5000);
});
