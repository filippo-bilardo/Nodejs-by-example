/**
 * ESEMPIO 03.09 - TCP Client
 * 
 * Questo esempio mostra come creare un client TCP che si connette a un server.
 * 
 * CONCETTI CHIAVE:
 * - net.connect(): Crea connessione TCP verso server
 * - Duplex stream: Socket permette lettura e scrittura simultanee
 * - Eventi socket: connect, data, end, error, close
 * - readline: Interfaccia per input da console
 * - Keep-alive: Mantiene la connessione attiva
 * 
 * USO:
 * 1. Avvia prima il server TCP (03.08-tcp-server.js)
 * 2. Avvia questo client
 * 3. Scrivi messaggi nella console
 * 
 * NOTA: Questo client si connette al server dell'esempio 03.08
 */

const net = require('net');
const readline = require('readline');

// ============================================
// CONFIGURAZIONE
// ============================================

const SERVER_HOST = 'localhost';
const SERVER_PORT = 8000;

// ============================================
// READLINE INTERFACE (Input utente)
// ============================================

// Crea interfaccia readline per input da console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

// ============================================
// CONNESSIONE AL SERVER
// ============================================

console.log(`\n${'='.repeat(70)}`);
console.log('🔌 TCP Client - Connessione al server...');
console.log(`${'='.repeat(70)}\n`);

console.log(`Server: ${SERVER_HOST}:${SERVER_PORT}\n`);

/**
 * Crea connessione TCP al server
 * 
 * Opzioni disponibili:
 * - host: hostname o IP del server
 * - port: porta del server
 * - localAddress: indirizzo locale (opzionale)
 * - localPort: porta locale (opzionale)
 * - family: 4 (IPv4) o 6 (IPv6)
 */
const client = net.connect({
  host: SERVER_HOST,
  port: SERVER_PORT
}, () => {
  // Callback eseguito quando la connessione è stabilita
  console.log('✅ Connesso al server!');
  console.log(`   Local: ${client.localAddress}:${client.localPort}`);
  console.log(`   Remote: ${client.remoteAddress}:${client.remotePort}\n`);
  
  // Abilita keep-alive per mantenere la connessione attiva
  client.setKeepAlive(true, 60000); // 60 secondi
  
  // Mostra prompt per input
  rl.prompt();
});

// ============================================
// EVENTO: DATA (Ricezione dati dal server)
// ============================================

/**
 * Riceve dati dal server
 * I dati arrivano come Buffer, convertiamoli in stringa
 */
client.on('data', (data) => {
  const message = data.toString().trim();
  
  // Cancella la riga corrente e stampa il messaggio del server
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);
  
  console.log(message);
  
  // Ripristina il prompt
  rl.prompt(true);
});

// ============================================
// EVENTO: CONNECT (Connessione stabilita)
// ============================================

client.on('connect', () => {
  console.log('🔗 Connessione TCP stabilita');
});

// ============================================
// EVENTO: END (Server chiude connessione)
// ============================================

client.on('end', () => {
  console.log('\n\n👋 Il server ha chiuso la connessione');
  cleanup();
});

// ============================================
// EVENTO: ERROR (Errore connessione)
// ============================================

client.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.error('\n❌ Connessione rifiutata!');
    console.error(`   Il server non è in esecuzione su ${SERVER_HOST}:${SERVER_PORT}`);
    console.error('\n💡 SOLUZIONE:');
    console.error('   1. Avvia prima il server: node 03.08-tcp-server.js');
    console.error('   2. Verifica che host e porta siano corretti');
  } else if (err.code === 'ECONNRESET') {
    console.error('\n❌ Connessione reset dal server');
  } else {
    console.error(`\n❌ Errore: ${err.message}`);
  }
  
  cleanup();
});

// ============================================
// EVENTO: CLOSE (Socket chiuso)
// ============================================

client.on('close', (hadError) => {
  if (hadError) {
    console.log('🔴 Connessione chiusa con errore');
  } else {
    console.log('🔵 Connessione chiusa');
  }
  cleanup();
});

// ============================================
// EVENTO: TIMEOUT
// ============================================

client.setTimeout(300000); // 5 minuti di inattività

client.on('timeout', () => {
  console.log('\n⏱️  Timeout: nessuna attività da 5 minuti');
  console.log('Chiusura connessione...');
  client.end();
});

// ============================================
// readline: GESTIONE INPUT UTENTE
// ============================================

/**
 * Evento 'line': Emesso quando l'utente preme Invio
 */
rl.on('line', (input) => {
  const message = input.trim();
  
  // Ignora messaggi vuoti
  if (!message) {
    rl.prompt();
    return;
  }
  
  // Comando speciale: /quit
  if (message === '/quit' || message === '/exit') {
    console.log('\n👋 Disconnessione...');
    client.end();
    return;
  }
  
  // Comando speciale: /help (locale, non inviato al server)
  if (message === '/help-local') {
    console.log('\n📖 COMANDI LOCALI:');
    console.log('  /quit, /exit     - Disconnetti dal server');
    console.log('  /help-local      - Mostra questo messaggio');
    console.log('  /info            - Info connessione');
    console.log('\nAltre comandi sono gestiti dal server. Prova /help\n');
    rl.prompt();
    return;
  }
  
  // Comando speciale: /info (info connessione)
  if (message === '/info') {
    console.log('\n📊 INFO CONNESSIONE:');
    console.log(`  Server:         ${client.remoteAddress}:${client.remotePort}`);
    console.log(`  Local:          ${client.localAddress}:${client.localPort}`);
    console.log(`  Bytes ricevuti: ${client.bytesRead}`);
    console.log(`  Bytes inviati:  ${client.bytesWritten}`);
    console.log(`  Keep-alive:     ${client.socket ? 'attivo' : 'inattivo'}`);
    console.log();
    rl.prompt();
    return;
  }
  
  // Invia messaggio al server
  if (!client.destroyed) {
    client.write(message + '\n');
  } else {
    console.log('❌ Connessione non attiva');
  }
  
  // Mostra nuovo prompt
  rl.prompt();
});

/**
 * Evento 'close': Emesso quando l'interfaccia readline viene chiusa
 */
rl.on('close', () => {
  console.log('\n\n👋 Chiusura client...');
  if (!client.destroyed) {
    client.end();
  }
  process.exit(0);
});

/**
 * Evento 'SIGINT': Gestisce Ctrl+C
 */
rl.on('SIGINT', () => {
  console.log('\n\n⏳ Ricevuto SIGINT...');
  if (!client.destroyed) {
    client.end();
  }
  rl.close();
});

// ============================================
// HELPER: CLEANUP
// ============================================

/**
 * Pulizia risorse e chiusura
 */
function cleanup() {
  if (!rl.closed) {
    rl.close();
  }
  
  if (!client.destroyed) {
    client.destroy();
  }
  
  setTimeout(() => {
    process.exit(0);
  }, 100);
}

// ============================================
// INFORMAZIONI INIZIALI
// ============================================

console.log('💡 TIPS:');
console.log('   - Scrivi messaggi e premi Invio per inviarli');
console.log('   - I comandi iniziano con / (es: /help, /users, /stats)');
console.log('   - Usa /quit per disconnetterti');
console.log('   - Usa /help-local per comandi del client');
console.log('   - Premi Ctrl+C per uscire\n');

// ============================================
// GESTIONE ERRORI NON CATTURATI
// ============================================

process.on('uncaughtException', (err) => {
  console.error('\n❌ Errore non gestito:', err.message);
  cleanup();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ Promise rejection non gestita:', reason);
  cleanup();
});
