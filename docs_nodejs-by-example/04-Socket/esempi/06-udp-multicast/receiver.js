/**
 * UDP Multicast Receiver
 * Riceve messaggi da un gruppo multicast
 */

const dgram = require('dgram');
const os = require('os');

// Configurazione
const MULTICAST_ADDR = process.env.MULTICAST || '239.255.0.1';
const MULTICAST_PORT = process.env.PORT || 41234;

// Crea socket UDP
const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

// Statistiche
const stats = {
    messagesReceived: 0,
    senders: new Map(),
    startTime: new Date(),
    dataPoints: []
};

/**
 * Ottieni IP locale
 */
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

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
            console.log(`\n🆕 Nuovo sender nel gruppo: ${senderId}`);
        }
        
        stats.senders.get(senderId).messageCount++;
        
        // Salva data point
        stats.dataPoints.push({
            timestamp: data.timestamp,
            sender: data.sender,
            data: data.data
        });
        
        // Mantieni solo ultimi 100 punti
        if (stats.dataPoints.length > 100) {
            stats.dataPoints.shift();
        }
        
        // Mostra messaggio
        console.log('');
        console.log(`📨 Multicast ricevuto (#${stats.messagesReceived})`);
        console.log(`   Da: ${rinfo.address}:${rinfo.port}`);
        console.log(`   Sender: ${data.sender}`);
        console.log(`   Channel: ${data.channel}`);
        console.log(`   Message ID: ${data.messageId}`);
        console.log(`   Data:`);
        console.log(`     Temperatura: ${data.data.temperature}°C`);
        console.log(`     Umidità: ${data.data.humidity}%`);
        console.log(`     Pressione: ${data.data.pressure} hPa`);
        
    } catch (err) {
        console.error('⚠️  Messaggio non valido:', msg.toString());
    }
});

socket.on('listening', () => {
    const address = socket.address();
    const localIP = getLocalIP();
    
    // Join al gruppo multicast
    socket.addMembership(MULTICAST_ADDR, localIP);
    
    console.log('');
    console.log('═'.repeat(60));
    console.log('📡 UDP Multicast Receiver');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`👂 In ascolto su ${address.address}:${address.port}`);
    console.log(`🌐 IP locale: ${localIP}`);
    console.log(`📢 Gruppo multicast: ${MULTICAST_ADDR}`);
    console.log(`🔌 Porta multicast: ${MULTICAST_PORT}`);
    console.log('');
    console.log('💡 Unito al gruppo multicast, in attesa di messaggi...');
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
});

socket.on('error', (err) => {
    console.error('');
    console.error('⚠️  ERRORE SOCKET:', err.message);
    
    if (err.code === 'EADDRINUSE') {
        console.error(`   Porta ${MULTICAST_PORT} già in uso!`);
        console.error('   Suggerimento: usa PORT=<altra_porta> per cambiare porta');
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
socket.bind(MULTICAST_PORT, () => {
    console.log('Socket bound alla porta multicast');
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
        console.log('   Senders nel gruppo:');
        stats.senders.forEach((sender, id) => {
            console.log(`     ${id}:`);
            console.log(`       Messaggi: ${sender.messageCount}`);
            console.log(`       Prima vista: ${sender.firstSeen.toISOString()}`);
        });
    }
    
    if (stats.dataPoints.length > 0) {
        // Calcola medie
        const latest = stats.dataPoints.slice(-10);
        const avgTemp = latest.reduce((sum, p) => sum + parseFloat(p.data.temperature), 0) / latest.length;
        const avgHumidity = latest.reduce((sum, p) => sum + parseFloat(p.data.humidity), 0) / latest.length;
        const avgPressure = latest.reduce((sum, p) => sum + parseFloat(p.data.pressure), 0) / latest.length;
        
        console.log('');
        console.log('   Medie ultime 10 letture:');
        console.log(`     Temperatura: ${avgTemp.toFixed(2)}°C`);
        console.log(`     Umidità: ${avgHumidity.toFixed(2)}%`);
        console.log(`     Pressione: ${avgPressure.toFixed(2)} hPa`);
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
    console.log('🛑 Uscita dal gruppo multicast...');
    
    // Lascia il gruppo
    try {
        socket.dropMembership(MULTICAST_ADDR);
        console.log('✅ Uscito dal gruppo');
    } catch (err) {
        console.error('⚠️  Errore uscita gruppo:', err.message);
    }
    
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
