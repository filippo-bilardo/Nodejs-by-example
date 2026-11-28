/**
 * ESEMPIO 03.08 - TCP Server
 * 
 * Questo esempio mostra come creare un server TCP usando il modulo net.
 * 
 * CONCETTI CHIAVE:
 * - TCP (Transmission Control Protocol): Protocollo di trasporto affidabile
 * - Socket: Endpoint di comunicazione bidirezionale
 * - Stream-based: I dati fluiscono come stream di bytes
 * - Connection-oriented: Connessione stabile tra client e server
 * - Full-duplex: Comunicazione bidirezionale simultanea
 * 
 * DIFFERENZE HTTP vs TCP:
 * - HTTP: Request/Response, stateless, text-based
 * - TCP: Stream continuo, stateful, binary-safe
 * 
 * QUANDO USARE TCP:
 * - Chat servers, gaming servers
 * - Database connections
 * - Protocolli custom
 * - Performance critiche (no HTTP overhead)
 */

const net = require('net');

// ============================================
// STATISTICHE SERVER
// ============================================

const stats = {
  connections: 0,
  totalConnections: 0,
  messagesSent: 0,
  messagesReceived: 0,
  bytesReceived: 0,
  bytesSent: 0
};

// ============================================
// CLIENTS CONNESSI
// ============================================

const clients = new Map(); // socket.id -> { socket, username, connectedAt }
let clientIdCounter = 0;

// ============================================
// HELPER: BROADCAST
// ============================================

/**
 * Invia un messaggio a tutti i client connessi
 * @param {string} message - Messaggio da inviare
 * @param {net.Socket} [excludeSocket] -Socket da escludere (opzionale)
 */
function broadcast(message, excludeSocket = null) {
  const data = message + '\n';
  
  clients.forEach(({ socket }) => {
    if (socket !== excludeSocket && !socket.destroyed) {
      socket.write(data);
      stats.messagesSent++;
      stats.bytesSent += Buffer.byteLength(data);
    }
  });
}

/**
 * Invia un messaggio a un singolo client
 * @param {net.Socket} socket - Socket destinatario
 * @param {string} message - Messaggio da inviare
 */
function sendToClient(socket, message) {
  if (!socket.destroyed) {
    const data = message + '\n';
    socket.write(data);
    stats.messagesSent++;
    stats.bytesSent += Buffer.byteLength(data);
  }
}

// ============================================
// TCP SERVER
// ============================================

const server = net.createServer((socket) => {
  // Nuovo client connesso
  const clientId = ++clientIdCounter;
  const clientInfo = {
    socket,
    username: `User${clientId}`,
    connectedAt: new Date()
  };
  
  clients.set(clientId, clientInfo);
  stats.connections++;
  stats.totalConnections++;
  
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  
  console.log(`\n🔌 [${clientId}] Nuova connessione da ${clientAddress}`);
  console.log(`   Client connessi: ${stats.connections}`);
  
  // Messaggio di benvenuto
  sendToClient(socket, '='.repeat(60));
  sendToClient(socket, '🎉 Benvenuto sul TCP Chat Server!');
  sendToClient(socket, '='.repeat(60));
  sendToClient(socket, `Il tuo ID è: ${clientId}`);
  sendToClient(socket, `Username: ${clientInfo.username}`);
  sendToClient(socket, '');
  sendToClient(socket, 'COMANDI:');
  sendToClient(socket, '  /help        - Mostra comandi');
  sendToClient(socket, '  /users       - Lista utenti online');
  sendToClient(socket, '  /stats       - Statistiche server');
  sendToClient(socket, '  /name <nome> - Cambia username');
  sendToClient(socket, '  /quit        - Disconnetti');
  sendToClient(socket, '');
  sendToClient(socket, 'Scrivi un messaggio per chattare!');
  sendToClient(socket, '='.repeat(60));
  
  // Notifica agli altri client
  broadcast(`📢 ${clientInfo.username} si è connesso! (${stats.connections} online)`, socket);
  
  // ========================================
  // EVENTO: DATA (Ricezione dati)
  // ========================================
  
  let buffer = ''; // Buffer per gestire messaggi parziali
  
  socket.on('data', (data) => {
    buffer += data.toString();
    stats.messagesReceived++;
    stats.bytesReceived += data.length;
    
    // Processa linee complete (terminate da \n)
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Conserva l'ultima linea parziale
    
    lines.forEach(line => {
      const message = line.trim();
      if (!message) return;
      
      console.log(`📥 [${clientId}] ${clientInfo.username}: ${message}`);
      
      // Gestione comandi
      if (message.startsWith('/')) {
        handleCommand(clientId, message);
      } else {
        // Messaggio normale - broadcast a tutti
        broadcast(`💬 ${clientInfo.username}: ${message}`, socket);
      }
    });
  });
  
  // ========================================
  // EVENTO: END (Client chiude connessione)
  // ========================================
  
  socket.on('end', () => {
    console.log(`👋 [${clientId}] ${clientInfo.username} ha chiuso la connessione`);
    handleDisconnect(clientId);
  });
  
  // ========================================
  // EVENTO: ERROR (Errore socket)
  // ========================================
  
  socket.on('error', (err) => {
    console.error(`❌ [${clientId}] Errore socket: ${err.message}`);
  });
  
  // ========================================
  // EVENTO: CLOSE (Socket chiuso)
  // ========================================
  
  socket.on('close', (hadError) => {
    if (hadError) {
      console.log(`🔴 [${clientId}] Connessione chiusa con errore`);
    }
    handleDisconnect(clientId);
  });
  
  // ========================================
  // EVENTO: TIMEOUT
  // ========================================
  
  socket.setTimeout(300000); // 5 minuti di inattività
  
  socket.on('timeout', () => {
    console.log(`⏱️  [${clientId}] Timeout - disconnessione per inattività`);
    sendToClient(socket, '⏱️  Timeout: disconnessione per inattività');
    socket.end();
  });
});

// ============================================
// GESTIONE COMANDI
// ============================================

function handleCommand(clientId, command) {
  const clientInfo = clients.get(clientId);
  if (!clientInfo) return;
  
  const { socket } = clientInfo;
  const parts = command.split(' ');
  const cmd = parts[0].toLowerCase();
  
  switch (cmd) {
    case '/help':
      sendToClient(socket, '\n📖 COMANDI DISPONIBILI:');
      sendToClient(socket, '  /help        - Mostra questo messaggio');
      sendToClient(socket, '  /users       - Lista utenti connessi');
      sendToClient(socket, '  /stats       - Statistiche server');
      sendToClient(socket, '  /name <nome> - Cambia il tuo username');
      sendToClient(socket, '  /quit        - Disconnetti dal server');
      break;
    
    case '/users':
      sendToClient(socket, `\n👥 UTENTI ONLINE (${stats.connections}):`);
      clients.forEach((info, id) => {
        const time = Math.floor((Date.now() - info.connectedAt) / 1000);
        const you = id === clientId ? ' (tu)' : '';
        sendToClient(socket, `  [${id}] ${info.username}${you} - ${time}s fa`);
      });
      break;
    
    case '/stats':
      sendToClient(socket, '\n📊 STATISTICHE SERVER:');
      sendToClient(socket, `  Connessioni attive: ${stats.connections}`);
      sendToClient(socket, `  Connessioni totali: ${stats.totalConnections}`);
      sendToClient(socket, `  Messaggi inviati:   ${stats.messagesSent}`);
      sendToClient(socket, `  Messaggi ricevuti:  ${stats.messagesReceived}`);
      sendToClient(socket, `  Bytes ricevuti:     ${(stats.bytesReceived / 1024).toFixed(2)} KB`);
      sendToClient(socket, `  Bytes inviati:      ${(stats.bytesSent / 1024).toFixed(2)} KB`);
      break;
    
    case '/name':
      const newName = parts.slice(1).join(' ').trim();
      if (!newName) {
        sendToClient(socket, '❌ Uso: /name <nuovo_username>');
      } else {
        const oldName = clientInfo.username;
        clientInfo.username = newName;
        sendToClient(socket, `✓ Username cambiato in: ${newName}`);
        broadcast(`📢 ${oldName} ha cambiato nome in ${newName}`);
      }
      break;
    
    case '/quit':
      sendToClient(socket, '👋 Arrivederci!');
      socket.end();
      break;
    
    default:
      sendToClient(socket, `❌ Comando sconosciuto: ${cmd}`);
      sendToClient(socket, '   Usa /help per lista comandi');
  }
}

// ============================================
// GESTIONE DISCONNESSIONE
// ============================================

function handleDisconnect(clientId) {
  const clientInfo = clients.get(clientId);
  if (!clientInfo) return;
  
  clients.delete(clientId);
  stats.connections--;
  
  console.log(`🔴 [${clientId}] ${clientInfo.username} disconnesso`);
  console.log(`   Client connessi: ${stats.connections}`);
  
  // Notifica agli altri
  broadcast(`📢 ${clientInfo.username} si è disconnesso (${stats.connections} online)`);
}

// ============================================
// AVVIO SERVER
// ============================================

const PORT = 8000;
const HOST = 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 TCP Chat Server attivo su ${HOST}:${PORT}`);
  console.log(`${'='.repeat(70)}\n`);
  
  console.log('📝 CONNESSIONE:');
  console.log(`   telnet localhost ${PORT}`);
  console.log(`   nc localhost ${PORT}`);
  console.log(`   oppure usa client TCP (es: PuTTY, netcat)\n`);
  
  console.log('💡 TIPS:');
  console.log('   - Ogni client ha una connessione persistente');
  console.log('   - I messaggi sono broadcast a tutti i client');
  console.log('   - Timeout dopo 5 minuti di inattività');
  console.log('   - Usa telnet o netcat per testare\n');
  
  console.log('Premi Ctrl+C per fermare il server\n');
});

// ============================================
// GESTIONE ERRORI
// ============================================

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Errore: La porta ${PORT} è già in uso`);
  } else {
    console.error(`❌ Errore server: ${err.message}`);
  }
  process.exit(1);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', () => {
  console.log('\n\n⏳ Chiusura server TCP...');
  
  // Notifica tutti i client
  broadcast('🛑 Server in chiusura. Arrivederci!');
  
  // Chiudi tutte le connessioni
  clients.forEach(({ socket }) => {
    socket.end();
  });
  
  // Chiudi il server
  server.close(() => {
    console.log('✓ Server chiuso');
    console.log(`\n📊 STATISTICHE FINALI:`);
    console.log(`   Connessioni totali: ${stats.totalConnections}`);
    console.log(`   Messaggi scambiati: ${stats.messagesReceived + stats.messagesSent}`);
    console.log(`   Dati trasferiti:    ${((stats.bytesReceived + stats.bytesSent) / 1024).toFixed(2)} KB\n`);
    process.exit(0);
  });
});
