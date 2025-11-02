/**
 * UDP Broadcast Example
 * Server che invia messaggi broadcast sulla rete locale
 */

const dgram = require('dgram');

// Configurazione
const BROADCAST_PORT = process.env.PORT || 9999;
const BROADCAST_ADDR = '255.255.255.255';
const MESSAGE_INTERVAL = 5000; // 5 secondi

// Crea socket UDP
const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

// Contatore messaggi
let messageCount = 0;

/**
 * Invia messaggio broadcast
 */
function sendBroadcast() {
    messageCount++;
    
    const message = JSON.stringify({
        type: 'SERVICE_ANNOUNCEMENT',
        service: 'example-service',
        host: require('os').hostname(),
        pid: process.pid,
        timestamp: Date.now(),
        messageCount
    });
    
    const buffer = Buffer.from(message);
    
    socket.send(buffer, BROADCAST_PORT, BROADCAST_ADDR, (err) => {
        if (err) {
            console.error('⚠️  Errore invio broadcast:', err.message);
        } else {
            console.log(`📡 Broadcast inviato #${messageCount}`);
            console.log(`   → ${BROADCAST_ADDR}:${BROADCAST_PORT}`);
        }
    });
}

/**
 * EVENTI SOCKET
 */
socket.on('listening', () => {
    // Abilita broadcasting
    socket.setBroadcast(true);
    
    const address = socket.address();
    
    console.log('');
    console.log('═'.repeat(60));
    console.log('📡 UDP Broadcast Sender');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`🚀 Socket attivo su ${address.address}:${address.port}`);
    console.log(`📢 Broadcasting su ${BROADCAST_ADDR}:${BROADCAST_PORT}`);
    console.log(`⏱️  Intervallo: ${MESSAGE_INTERVAL}ms`);
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
    
    // Invia primo broadcast subito
    sendBroadcast();
    
    // Poi invia periodicamente
    setInterval(sendBroadcast, MESSAGE_INTERVAL);
});

socket.on('error', (err) => {
    console.error('');
    console.error('⚠️  ERRORE SOCKET:', err.message);
    
    if (err.code === 'EACCES') {
        console.error('   Permessi insufficienti per broadcasting');
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
socket.bind(() => {
    console.log('Socket bound, abilito broadcasting...');
});

/**
 * GRACEFUL SHUTDOWN
 */
process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Arresto broadcast sender...');
    console.log(`📊 Messaggi broadcast totali: ${messageCount}`);
    
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
