/**
 * Heartbeat Example - Client
 * Client con heartbeat automatico
 */

const net = require('net');
const readline = require('readline');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 7777;

// Client state
let socket = null;
let heartbeatInterval = null;
let reconnectTimeout = null;
let shouldReconnect = true;

const stats = {
    heartbeatsSent: 0,
    heartbeatsReceived: 0,
    messagesSent: 0,
    messagesReceived: 0,
    reconnects: 0,
    connectedAt: null
};

// Readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

/**
 * Connetti al server
 */
function connect() {
    console.log(`\n🔌 Connessione a ${HOST}:${PORT}...`);
    
    socket = net.createConnection({ host: HOST, port: PORT }, () => {
        console.log('✅ Connesso al server!');
        stats.connectedAt = new Date();
        
        if (stats.reconnects > 0) {
            console.log(`   (Riconnessione #${stats.reconnects})`);
        }
        
        console.log('');
        showHelp();
        rl.prompt();
    });
    
    // Buffer per messaggi incompleti
    let buffer = '';
    
    socket.on('data', (data) => {
        buffer += data.toString();
        
        const messages = buffer.split('\n');
        buffer = messages.pop(); // Ultimo elemento potrebbe essere incompleto
        
        messages.forEach(msg => {
            if (msg.trim()) {
                try {
                    const message = JSON.parse(msg);
                    handleMessage(message);
                } catch (err) {
                    console.error('⚠️  Errore parsing:', err.message);
                }
            }
        });
    });
    
    socket.on('error', (err) => {
        console.error('\n⚠️  Errore connessione:', err.message);
        
        if (shouldReconnect) {
            scheduleReconnect();
        }
    });
    
    socket.on('end', () => {
        console.log('\n👋 Disconnesso dal server');
        cleanup();
        
        if (shouldReconnect) {
            scheduleReconnect();
        } else {
            process.exit(0);
        }
    });
}

/**
 * Gestisce messaggio dal server
 */
function handleMessage(message) {
    switch (message.type) {
        case 'WELCOME':
            console.log(`\n📨 ${message.message}`);
            console.log(`   Intervallo heartbeat: ${message.heartbeatInterval}ms`);
            console.log(`   Timeout heartbeat: ${message.heartbeatTimeout}ms`);
            console.log('');
            rl.prompt();
            break;
            
        case 'HEARTBEAT':
            // Server richiede heartbeat, rispondi
            stats.heartbeatsReceived++;
            
            sendMessage({
                type: 'HEARTBEAT_ACK',
                timestamp: Date.now()
            });
            
            stats.heartbeatsSent++;
            
            // Mostra solo ogni 5 heartbeat per non intasare l'output
            if (stats.heartbeatsReceived % 5 === 0) {
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0);
                console.log(`💓 Heartbeat: ${stats.heartbeatsReceived} ricevuti, ${stats.heartbeatsSent} inviati`);
                rl.prompt();
            }
            break;
            
        case 'MESSAGE_ACK':
            stats.messagesReceived++;
            console.log(`\n✅ Messaggio ricevuto dal server: "${message.text}"`);
            rl.prompt();
            break;
            
        case 'SERVER_SHUTDOWN':
            console.log(`\n⚠️  ${message.message}`);
            shouldReconnect = false;
            break;
            
        default:
            console.log(`\n📨 Messaggio da server:`, message);
            rl.prompt();
    }
}

/**
 * Invia messaggio al server
 */
function sendMessage(message) {
    if (socket && !socket.destroyed) {
        socket.write(JSON.stringify(message) + '\n');
        return true;
    }
    return false;
}

/**
 * Cleanup
 */
function cleanup() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
    
    if (socket && !socket.destroyed) {
        socket.destroy();
    }
    socket = null;
}

/**
 * Schedula riconnessione
 */
function scheduleReconnect() {
    const delay = 5000;
    
    console.log(`\n🔄 Riconnessione tra ${delay}ms...`);
    
    reconnectTimeout = setTimeout(() => {
        stats.reconnects++;
        connect();
    }, delay);
}

/**
 * Mostra help
 */
function showHelp() {
    console.log('Comandi disponibili:');
    console.log('  <messaggio>     - Invia messaggio al server');
    console.log('  stats           - Mostra statistiche');
    console.log('  help            - Mostra questo help');
    console.log('  quit            - Disconnetti');
    console.log('');
}

/**
 * Gestisce comando
 */
function handleCommand(line) {
    const cmd = line.trim().toLowerCase();
    
    if (!socket || socket.destroyed) {
        console.log('⚠️  Non connesso al server');
        rl.prompt();
        return;
    }
    
    if (cmd === '') {
        rl.prompt();
        return;
    }
    
    switch (cmd) {
        case 'stats':
            showClientStats();
            break;
            
        case 'help':
            showHelp();
            break;
            
        case 'quit':
            console.log('👋 Disconnessione...');
            shouldReconnect = false;
            cleanup();
            process.exit(0);
            return;
            
        default:
            // Invia come messaggio
            if (sendMessage({
                type: 'MESSAGE',
                text: line,
                timestamp: Date.now()
            })) {
                stats.messagesSent++;
                console.log('📤 Messaggio inviato');
            }
    }
    
    rl.prompt();
}

/**
 * Mostra statistiche client
 */
function showClientStats() {
    console.log('');
    console.log('═'.repeat(60));
    console.log('📊 STATISTICHE CLIENT');
    console.log('═'.repeat(60));
    
    if (stats.connectedAt) {
        const uptime = Math.floor((Date.now() - stats.connectedAt) / 1000);
        console.log(`   Connesso da: ${uptime}s`);
    }
    
    console.log(`   Heartbeats ricevuti: ${stats.heartbeatsReceived}`);
    console.log(`   Heartbeats inviati: ${stats.heartbeatsSent}`);
    console.log(`   Messaggi inviati: ${stats.messagesSent}`);
    console.log(`   Messaggi ricevuti: ${stats.messagesReceived}`);
    console.log(`   Riconnessioni: ${stats.reconnects}`);
    console.log('═'.repeat(60));
    console.log('');
}

/**
 * MAIN
 */
console.log('');
console.log('═'.repeat(60));
console.log('💓 Heartbeat TCP Client');
console.log('═'.repeat(60));
console.log('');

connect();

rl.on('line', handleCommand);

rl.on('SIGINT', () => {
    console.log('');
    console.log('👋 Chiusura...');
    shouldReconnect = false;
    cleanup();
    process.exit(0);
});

/**
 * GRACEFUL SHUTDOWN
 */
process.on('SIGTERM', () => {
    shouldReconnect = false;
    cleanup();
    process.exit(0);
});
