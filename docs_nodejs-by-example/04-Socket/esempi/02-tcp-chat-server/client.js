/**
 * TCP Chat Client
 * Client interattivo per il chat server
 */

const net = require('net');
const readline = require('readline');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8080;

// Client socket
let client = null;
let username = 'Unknown';

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
    console.log('');
    console.log('═'.repeat(60));
    console.log('💬 TCP Chat Client');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`Connessione a ${HOST}:${PORT}...`);
    
    client = net.createConnection({ host: HOST, port: PORT }, () => {
        console.log('✅ Connesso al chat server!');
        console.log('');
    });
    
    /**
     * Gestione dati ricevuti
     */
    client.on('data', (data) => {
        const message = data.toString();
        
        // Pulisci la linea corrente del prompt
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0);
        
        // Mostra messaggio dal server
        process.stdout.write(message);
        
        // Se non termina con newline, aggiungilo
        if (!message.endsWith('\n')) {
            process.stdout.write('\n');
        }
        
        // Ridisegna il prompt
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
        rl.close();
        process.exit(0);
    });
}

/**
 * Gestione input utente
 */
rl.on('line', (line) => {
    const message = line.trim();
    
    if (!message) {
        rl.prompt();
        return;
    }
    
    if (client && !client.destroyed) {
        // Invia messaggio al server
        client.write(message + '\n');
        
        // Non mostrare il prompt subito se è un comando
        // Il server risponderà e il prompt verrà ridisegnato
        if (!message.startsWith('/')) {
            rl.prompt();
        }
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
        client.write('/quit\n');
        setTimeout(() => {
            client.end();
            rl.close();
            process.exit(0);
        }, 100);
    } else {
        rl.close();
        process.exit(0);
    }
});

// Mostra help iniziale
console.log('');
console.log('Comandi disponibili:');
console.log('  /help              - Mostra aiuto completo');
console.log('  /nick <nome>       - Cambia username');
console.log('  /join <stanza>     - Entra in una stanza');
console.log('  /rooms             - Lista stanze');
console.log('  /users             - Lista utenti nella stanza');
console.log('  /msg <user> <text> - Messaggio privato');
console.log('  /quit              - Disconnetti');
console.log('');

// Avvia connessione
connect();

// Mostra prompt iniziale dopo la connessione
setTimeout(() => {
    rl.prompt();
}, 500);
