/**
 * UDP Broadcast Receiver
 * Client che riceve messaggi broadcast
 */

const dgram = require('dgram');

// Configurazione
const BROADCAST_PORT = process.env.PORT || 9999;

// Crea socket UDP
const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

// Statistiche
const stats = {
    messagesReceived: 0,
    senders: new Map(),
    startTime: new Date()
};

/**
 * EVENTI SOCKET
 */
socket.on('message', (msg, rinfo) => {
    stats.messagesReceived++;
    
    try {
        const data = JSON.parse(msg.toString());
        
        // Traccia sender
        const senderId = `${rinfo.address}:${rinfo.port}`;
        if (!stats.senders.has(senderId)) {
            stats.senders.set(senderId, {
                address: rinfo.address,
                port: rinfo.port,
                firstSeen: new Date(),
                messageCount: 0
            });
            console.log(`\n🆕 Nuovo sender rilevato: ${senderId}`);
        }
        
        stats.senders.get(senderId).messageCount++;
        
        // Mostra messaggio
        console.log('');
        console.log(`📨 Broadcast ricevuto (#${stats.messagesReceived})`);
        console.log(`   Da: ${rinfo.address}:${rinfo.port}`);
        console.log(`   Tipo: ${data.type}`);
        console.log(`   Servizio: ${data.service}`);
        console.log(`   Host: ${data.host}`);
        console.log(`   PID: ${data.pid}`);
        console.log(`   Timestamp: ${new Date(data.timestamp).toISOString()}`);
        console.log(`   Message #: ${data.messageCount}`);
        
    } catch (err) {
        console.error('⚠️  Messaggio non valido:', msg.toString());
    }
});

socket.on('listening', () => {
    const address = socket.address();
    
    console.log('');
    console.log('═'.repeat(60));
    console.log('📡 UDP Broadcast Receiver');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`👂 In ascolto su ${address.address}:${address.port}`);
    console.log(`📢 Porta broadcast: ${BROADCAST_PORT}`);
    console.log('');
    console.log('💡 In attesa di messaggi broadcast...');
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
});

socket.on('error', (err) => {
    console.error('');
    console.error('⚠️  ERRORE SOCKET:', err.message);
    
    if (err.code === 'EADDRINUSE') {
        console.error(`   Porta ${BROADCAST_PORT} già in uso!`);
    }
    
    socket.close();
    process.exit(1);
});

socket.on('close', () => {
    console.log('');
    console.log('🛑 Socket chiuso');
});

/**
 * BIND SOCKET
 */
socket.bind(BROADCAST_PORT, () => {
    console.log('Socket bound alla porta broadcast');
});

/**
 * MOSTRA STATISTICHE
 */
function showStats() {
    console.log('');
    console.log('═'.repeat(60));
    console.log('📊 STATISTICHE');
    console.log('═'.repeat(60));
    console.log(`   Messaggi ricevuti: ${stats.messagesReceived}`);
    console.log(`   Sender unici: ${stats.senders.size}`);
    console.log(`   Uptime: ${Math.floor((Date.now() - stats.startTime) / 1000)}s`);
    
    if (stats.senders.size > 0) {
        console.log('');
        console.log('   Senders:');
        stats.senders.forEach((sender, id) => {
            console.log(`     ${id}:`);
            console.log(`       Messaggi: ${sender.messageCount}`);
            console.log(`       Prima vista: ${sender.firstSeen.toISOString()}`);
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
    console.log('🛑 Arresto receiver...');
    
    showStats();
    
    socket.close(() => {
        console.log('✅ Socket chiuso');
        process.exit(0);
    });
    
    setTimeout(() => {
        console.error('⚠️  Force exit');
        process.exit(1);
    }, 3000);
});

/**
 * ERROR HANDLERS
 */
process.on('uncaughtException', (err) => {
    console.error('⚠️  Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('⚠️  Unhandled Rejection:', reason);
    process.exit(1);
});
