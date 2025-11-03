/**
 * UDP Multicast Sender
 * Invia messaggi a un gruppo multicast
 */

const dgram = require('dgram');

// Configurazione
const MULTICAST_ADDR = process.env.MULTICAST || '239.255.0.1';
const MULTICAST_PORT = process.env.PORT || 41234;
const MESSAGE_INTERVAL = 3000; // 3 secondi

// Crea socket UDP
const socket = dgram.createSocket({ type: 'udp4' });

// Statistiche
let messageCount = 0;

/**
 * Invia messaggio multicast
 */
function sendMulticast() {
    messageCount++;
    
    const message = JSON.stringify({
        type: 'MULTICAST_DATA',
        channel: MULTICAST_ADDR,
        sender: require('os').hostname(),
        timestamp: Date.now(),
        messageId: messageCount,
        data: {
            temperature: (20 + Math.random() * 10).toFixed(2),
            humidity: (40 + Math.random() * 20).toFixed(2),
            pressure: (980 + Math.random() * 40).toFixed(2)
        }
    });
    
    const buffer = Buffer.from(message);
    
    socket.send(buffer, MULTICAST_PORT, MULTICAST_ADDR, (err) => {
        if (err) {
            console.error('⚠️  Errore invio multicast:', err.message);
        } else {
            console.log(`📡 Multicast inviato #${messageCount}`);
            console.log(`   → ${MULTICAST_ADDR}:${MULTICAST_PORT}`);
            const data = JSON.parse(message);
            console.log(`   Temp: ${data.data.temperature}°C, Humidity: ${data.data.humidity}%`);
        }
    });
}

/**
 * EVENTI SOCKET
 */
socket.on('listening', () => {
    // Imposta TTL per multicast (quanti router può attraversare)
    socket.setMulticastTTL(128);
    
    // Abilita loopback (riceve i propri messaggi)
    socket.setMulticastLoopback(true);
    
    const address = socket.address();
    
    console.log('');
    console.log('═'.repeat(60));
    console.log('📡 UDP Multicast Sender');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`🚀 Socket attivo su ${address.address}:${address.port}`);
    console.log(`📢 Gruppo multicast: ${MULTICAST_ADDR}`);
    console.log(`🔌 Porta multicast: ${MULTICAST_PORT}`);
    console.log(`⏱️  Intervallo: ${MESSAGE_INTERVAL}ms`);
    console.log(`🔄 TTL: 128 hops`);
    console.log(`🔁 Loopback: attivo`);
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
    
    // Invia primo messaggio subito
    sendMulticast();
    
    // Poi invia periodicamente
    setInterval(sendMulticast, MESSAGE_INTERVAL);
});

socket.on('message', (msg, rinfo) => {
    // Riceve i propri messaggi grazie al loopback
    console.log(`   ↩️  Loopback ricevuto da ${rinfo.address}:${rinfo.port}`);
});

socket.on('error', (err) => {
    console.error('');
    console.error('⚠️  ERRORE SOCKET:', err.message);
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
    console.log('Socket bound, configurazione multicast...');
});

/**
 * GRACEFUL SHUTDOWN
 */
process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Arresto multicast sender...');
    console.log(`📊 Messaggi multicast totali: ${messageCount}`);
    
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
