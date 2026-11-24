/**
 * TCP Echo Client
 * Client interattivo per testare il server echo
 */

const net = require('net');
const readline = require('readline');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

// Client socket
let client = null;

// Readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Connetti al server
 */
function connect() {
    console.log('');
    console.log('═'.repeat(60));
    console.log('🔌 TCP Echo Client');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`Connessione a ${HOST}:${PORT}...`);
    
    client = net.createConnection({ host: HOST, port: PORT }, () => {
        console.log('✅ Connesso al server!');
        console.log('');
    });
    
    /**
     * Gestione dati ricevuti
     */
    client.on('data', (data) => {
        const message = data.toString();
        
        // Mostra messaggio dal server
        process.stdout.write(message);
        
        // Se non termina con newline, aggiungilo
        if (!message.endsWith('\n')) {
            process.stdout.write('\n');
        }
        
        // Richiedi nuovo input
        rl.prompt();
    });
    
    /**
     * Gestione errori
     */
    client.on('error', (err) => {
        console.error('');
        console.error('⚠️  Errore connessione:', err.message);
        
        if (err.code === 'ECONNREFUSED') {
            console.error(`   Il server non è raggiungibile su ${HOST}:${PORT}`);
            console.error('   Assicurati che il server sia avviato.');
        }
        
        process.exit(1);
    });
    
    /**
     * Gestione disconnessione
     */
    client.on('end', () => {
        console.log('');
        console.log('👋 Disconnesso dal server');
        process.exit(0);
    });
}

/**
 * Gestione input utente
 */
rl.on('line', (line) => {
    if (client && !client.destroyed) {
        // Invia messaggio al server
        client.write(line + '\n');
    } else {
        console.log('⚠️  Non connesso al server');
        rl.prompt();
    }
});

/**
 * Gestione Ctrl+C
 */
rl.on('SIGINT', () => {
    console.log('');
    console.log('👋 Chiusura client...');
    
    if (client && !client.destroyed) {
        client.end();
    }
    
    rl.close();
    process.exit(0);
});

// Avvia connessione
connect();
