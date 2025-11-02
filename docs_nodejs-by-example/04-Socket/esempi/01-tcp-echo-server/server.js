/**
 * TCP Echo Server
 * Server TCP che riflette i messaggi ricevuti ai client
 */

const net = require('net');

const PORT = process.env.PORT || 3000;
const TIMEOUT = 60000; // 60 secondi di inattività

// Statistiche server
const stats = {
    totalConnections: 0,
    activeConnections: 0,
    messagesReceived: 0,
    messagesSent: 0,
    bytesReceived: 0,
    bytesSent: 0,
    startTime: new Date()
};

/**
 * Gestisce connessione client
 */
function handleClient(socket) {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    
    stats.totalConnections++;
    stats.activeConnections++;
    
    console.log('');
    console.log(`✅ Nuovo client connesso: ${clientId}`);
    console.log(`   Connessioni attive: ${stats.activeConnections}`);
    
    // Imposta timeout inattività
    socket.setTimeout(TIMEOUT);
    
    // Invia messaggio di benvenuto
    const welcome = `
╔════════════════════════════════════════════════════════════╗
║           Benvenuto al TCP Echo Server!                    ║
╚════════════════════════════════════════════════════════════╝

Comandi disponibili:
  help     - Mostra questo messaggio
  stats    - Mostra statistiche server
  quit     - Disconnetti

Scrivi un messaggio per ricevere l'echo...

`;
    socket.write(welcome);
    stats.messagesSent++;
    stats.bytesSent += welcome.length;
    
    /**
     * Gestione dati ricevuti
     */
    socket.on('data', (data) => {
        stats.messagesReceived++;
        stats.bytesReceived += data.length;
        
        const message = data.toString().trim();
        
        console.log(`📨 ${clientId}: ${message}`);
        
        // Reset timeout
        socket.setTimeout(TIMEOUT);
        
        // Gestione comandi speciali
        if (message.toLowerCase() === 'help') {
            const helpMessage = `
Comandi disponibili:
  help     - Mostra questo messaggio
  stats    - Mostra statistiche server
  quit     - Disconnetti

Qualsiasi altro testo verrà echeggiato.
`;
            socket.write(helpMessage);
            stats.messagesSent++;
            stats.bytesSent += helpMessage.length;
            
        } else if (message.toLowerCase() === 'stats') {
            const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
            const statsMessage = `
╔════════════════════════════════════════════════════════════╗
║                 STATISTICHE SERVER                         ║
╚════════════════════════════════════════════════════════════╝

  Connessioni totali:  ${stats.totalConnections}
  Connessioni attive:  ${stats.activeConnections}
  Messaggi ricevuti:   ${stats.messagesReceived}
  Messaggi inviati:    ${stats.messagesSent}
  Bytes ricevuti:      ${stats.bytesReceived} bytes
  Bytes inviati:       ${stats.bytesSent} bytes
  Uptime:              ${uptime} secondi

`;
            socket.write(statsMessage);
            stats.messagesSent++;
            stats.bytesSent += statsMessage.length;
            
        } else if (message.toLowerCase() === 'quit') {
            socket.write('👋 Arrivederci!\n');
            stats.messagesSent++;
            socket.end();
            
        } else if (message === '') {
            // Ignora messaggi vuoti
            
        } else {
            // Echo del messaggio
            const echo = `ECHO: ${message}\n`;
            socket.write(echo);
            stats.messagesSent++;
            stats.bytesSent += echo.length;
            
            console.log(`📤 ${clientId}: ${echo.trim()}`);
        }
    });
    
    /**
     * Gestione timeout
     */
    socket.on('timeout', () => {
        console.log(`⏰ Timeout per ${clientId}`);
        socket.write('\n⚠️  Connessione inattiva. Disconnessione...\n');
        socket.end();
    });
    
    /**
     * Gestione errori
     */
    socket.on('error', (err) => {
        console.error(`⚠️  Errore con ${clientId}:`, err.message);
    });
    
    /**
     * Gestione disconnessione
     */
    socket.on('end', () => {
        stats.activeConnections--;
        console.log('');
        console.log(`👋 Client disconnesso: ${clientId}`);
        console.log(`   Connessioni attive: ${stats.activeConnections}`);
    });
}

/**
 * CREA SERVER
 */
const server = net.createServer(handleClient);

server.listen(PORT, () => {
    console.log('');
    console.log('═'.repeat(60));
    console.log('🚀 TCP Echo Server');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`📡 Server in ascolto sulla porta ${PORT}`);
    console.log(`⏰ Timeout inattività: ${TIMEOUT / 1000} secondi`);
    console.log('');
    console.log('Per testare il server:');
    console.log(`  telnet localhost ${PORT}`);
    console.log(`  nc localhost ${PORT}`);
    console.log(`  node client.js`);
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
});

server.on('error', (err) => {
    console.error('');
    console.error('⚠️  ERRORE SERVER:', err.message);
    
    if (err.code === 'EADDRINUSE') {
        console.error(`   Porta ${PORT} già in uso!`);
        console.error('   Prova con: PORT=<altra_porta> node server.js');
    }
    
    process.exit(1);
});

/**
 * GRACEFUL SHUTDOWN
 */
process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Arresto server...');
    
    // Mostra statistiche finali
    const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
    console.log('');
    console.log('═'.repeat(60));
    console.log('📊 STATISTICHE FINALI');
    console.log('═'.repeat(60));
    console.log(`   Connessioni totali:  ${stats.totalConnections}`);
    console.log(`   Messaggi ricevuti:   ${stats.messagesReceived}`);
    console.log(`   Messaggi inviati:    ${stats.messagesSent}`);
    console.log(`   Bytes ricevuti:      ${stats.bytesReceived} bytes`);
    console.log(`   Bytes inviati:       ${stats.bytesSent} bytes`);
    console.log(`   Uptime:              ${uptime} secondi`);
    console.log('═'.repeat(60));
    console.log('');
    
    server.close(() => {
        console.log('✅ Server chiuso');
        process.exit(0);
    });
    
    // Force exit dopo 5 secondi
    setTimeout(() => {
        console.error('⚠️  Force exit dopo timeout');
        process.exit(1);
    }, 5000);
});
