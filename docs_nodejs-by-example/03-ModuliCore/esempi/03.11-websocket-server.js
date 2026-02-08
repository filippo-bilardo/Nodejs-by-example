/**
 * ESEMPIO 03.11 - WebSocket Server
 * 
 * Questo esempio mostra come creare un server WebSocket usando la libreria 'ws'.
 * 
 * CONCETTI CHIAVE:
 * - WebSocket: Protocollo full-duplex per comunicazione real-time
 * - Upgrade HTTP → WebSocket: Connessione inizia come HTTP, poi "si aggiorna"
 * - Eventi: open, message, close, error
 * - Binary-safe: Supporta sia testo che dati binari
 * - Low-latency: Overhead minimo rispetto a HTTP polling
 * 
 * DIFFERENZE WebSocket vs HTTP:
 * - HTTP: Request/Response, stateless, unidirezionale
 * - WebSocket: Full-duplex, stateful, push/pull bidirezionale
 * 
 * QUANDO USARE WebSocket:
 * - Chat applications
 * - Live feeds (news, sports, stock prices)
 * - Real-time gaming
 * - Collaborative editing
 * - IoT data streaming
 * 
 * INSTALLAZIONE:
 * npm install ws
 * 
 * NOTA: WebSocket richiede un server HTTP sottostante
 */

const http = require('http');
const WebSocket = require('ws');

// Verifica che 'ws' sia installata
try {
  require.resolve('ws');
} catch (e) {
  console.error('\n❌ ERRORE: Libreria \'ws\' non trovata!\n');
  console.error('📦 INSTALLAZIONE:');
  console.error('   npm install ws\n');
  console.error('Oppure:');
  console.error('   yarn add ws\n');
  process.exit(1);
}

// ============================================
// STATISTICHE E STATO
// ============================================

const stats = {
  connections: 0,
  totalConnections: 0,
  messagesSent: 0,
  messagesReceived: 0,
  bytesReceived: 0,
  bytesSent: 0
};

const clients = new Map(); // ws → { id, username, connectedAt }
let clientIdCounter = 0;

// ============================================
// HTTP SERVER (per servire HTML client)
// ============================================

const httpServer = http.createServer((req, res) => {
  const { method, url } = req;
  
  if (url === '/' && method === 'GET') {
    // Serve HTML client per testing WebSocket
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(getHTMLClient());
    
  } else if (url === '/stats' && method === 'GET') {
    // API endpoint per statistiche
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      ...stats,
      clients: Array.from(clients.values()).map(c => ({
        id: c.id,
        username: c.username,
        connectedAt: c.connectedAt
      }))
    }, null, 2));
    
  } else {
    res.statusCode = 404;
    res.end('404 Not Found');
  }
});

// ============================================
// WEBSOCKET SERVER
// ============================================

// Crea WebSocket server collegato all'HTTP server
const wss = new WebSocket.Server({ server: httpServer });

console.log('🔌 WebSocket Server inizializzato');

/**
 * Evento 'connection': Nuovo client WebSocket connesso
 */
wss.on('connection', (ws, req) => {
  // Nuovo client
  const clientId = ++clientIdCounter;
  const clientInfo = {
    id: clientId,
    username: `User${clientId}`,
    connectedAt: new Date(),
    ip: req.socket.remoteAddress
  };
  
  clients.set(ws, clientInfo);
  stats.connections++;
  stats.totalConnections++;
  
  console.log(`\n✅ [${clientId}] Nuovo client WebSocket connesso`);
  console.log(`   IP: ${clientInfo.ip}`);
  console.log(`   Connessi: ${stats.connections}`);
  
  // Messaggio di benvenuto
  send(ws, {
    type: 'welcome',
    data: {
      clientId,
      username: clientInfo.username,
      message: 'Benvenuto sul WebSocket server!'
    }
  });
  
  // Notifica agli altri client
  broadcast({
    type: 'user-joined',
    data: {
      username: clientInfo.username,
      clientId,
      totalOnline: stats.connections
    }
  }, ws);
  
  // Lista utenti online
  send(ws, {
    type: 'users-list',
    data: {
      users: Array.from(clients.values()).map(c => ({
        id: c.id,
        username: c.username
      }))
    }
  });
  
  // ========================================
  // EVENTO: MESSAGE (Messaggio ricevuto)
  // ========================================
  
  ws.on('message', (data) => {
    stats.messagesReceived++;
    stats.bytesReceived += data.length;
    
    try {
      // Parse messaggio JSON
      const message = JSON.parse(data.toString());
      
      console.log(`📥 [${clientId}] ${message.type}:`, message.data);
      
      // Gestisci diversi tipi di messaggio
      handleMessage(ws, clientInfo, message);
      
    } catch (err) {
      console.error(`❌ [${clientId}] Errore parsing messaggio:`, err.message);
      send(ws, {
        type: 'error',
        data: { message: 'Formato messaggio non valido' }
      });
    }
  });
  
  // ========================================
  // EVENTO: CLOSE (Client disconnesso)
  // ========================================
  
  ws.on('close', (code, reason) => {
    console.log(`👋 [${clientId}] Disconnesso (code: ${code})`);
    handleDisconnect(ws, clientInfo);
  });
  
  // ========================================
  // EVENTO: ERROR (Errore WebSocket)
  // ========================================
  
  ws.on('error', (err) => {
    console.error(`❌ [${clientId}] Errore WebSocket:`, err.message);
  });
  
  // ========================================
  // EVENTO: PONG (Risposta a ping)
  // ========================================
  
  ws.on('pong', () => {
    // Heartbeat ricevuto - client è vivo
    ws.isAlive = true;
  });
});

// ============================================
// HEARTBEAT (Keep-Alive)
// ============================================

/**
 * Invia ping a tutti i client per verificare che siano ancora connessi
 * Se un client non risponde con pong, viene disconnesso
 */
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('💀 Client non risponde ai ping, disconnessione...');
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping(); // Invia ping
  });
}, 30000); // Ogni 30 secondi

// ============================================
// GESTIONE MESSAGGI
// ============================================

function handleMessage(ws, clientInfo, message) {
  const { type, data } = message;
  
  switch (type) {
    case 'chat':
      // Messaggio chat - broadcast a tutti
      broadcast({
        type: 'chat',
        data: {
          from: clientInfo.username,
          fromId: clientInfo.id,
          message: data.message,
          timestamp: new Date().toISOString()
        }
      });
      break;
    
    case 'set-username':
      // Cambio username
      const oldUsername = clientInfo.username;
      clientInfo.username = data.username;
      
      send(ws, {
        type: 'username-changed',
        data: { username: clientInfo.username }
      });
      
      broadcast({
        type: 'user-renamed',
        data: {
          oldUsername,
          newUsername: clientInfo.username,
          clientId: clientInfo.id
        }
      }, ws);
      break;
    
    case 'ping':
      // Risposta a ping custom
      send(ws, {
        type: 'pong',
        data: { timestamp: Date.now() }
      });
      break;
    
    case 'get-stats':
      // Richiesta statistiche
      send(ws, {
        type: 'stats',
        data: stats
      });
      break;
    
    default:
      console.log(`⚠️  Tipo messaggio sconosciuto: ${type}`);
      send(ws, {
        type: 'error',
        data: { message: `Tipo messaggio sconosciuto: ${type}` }
      });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Invia messaggio a un singolo client
 */
function send(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    const data = JSON.stringify(message);
    ws.send(data);
    stats.messagesSent++;
    stats.bytesSent += Buffer.byteLength(data);
  }
}

/**
 * Broadcast messaggio a tutti i client (opzionalmente escludi uno)
 */
function broadcast(message, excludeWs = null) {
  const data = JSON.stringify(message);
  
  wss.clients.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
      stats.messagesSent++;
      stats.bytesSent += Buffer.byteLength(data);
    }
  });
}

/**
 * Gestisce disconnessione client
 */
function handleDisconnect(ws, clientInfo) {
  clients.delete(ws);
  stats.connections--;
  
  broadcast({
    type: 'user-left',
    data: {
      username: clientInfo.username,
      clientId: clientInfo.id,
      totalOnline: stats.connections
    }
  });
}

/**
 * Genera HTML client per testing
 */
function getHTMLClient() {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>WebSocket Client</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 20px; }
    .status { padding: 10px; border-radius: 4px; margin-bottom: 20px; }
    .connected { background: #d4edda; color: #155724; }
    .disconnected { background: #f8d7da; color: #721c24; }
    #messages { height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; margin-bottom: 20px; background: #fafafa; }
    .message { padding: 8px; margin: 5px 0; border-radius: 4px; background: white; }
    .system { background: #fff3cd; }
    .chat { background: #d1ecf1; }
    input, button { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    input { flex: 1; margin-right: 10px; }
    button { background: #007bff; color: white; border: none; cursor: pointer; }
    button:hover { background: #0056b3; }
    .form { display: flex; gap: 10px; }
    .stats { margin-top: 20px; font-size: 0.9em; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔌 WebSocket Chat Client</h1>
    
    <div id="status" class="status disconnected">
      Disconnesso
    </div>
    
    <div id="messages"></div>
    
    <div class="form">
      <input type="text" id="messageInput" placeholder="Scrivi un messaggio..." disabled>
      <button id="sendBtn" disabled>Invia</button>
    </div>
    
    <div class="stats">
      <p>Online: <span id="online">0</span> | Messaggi: <span id="msgCount">0</span></p>
    </div>
  </div>
  
  <script>
    const status = document.getElementById('status');
    const messages = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const onlineSpan = document.getElementById('online');
    const msgCountSpan = document.getElementById('msgCount');
    
    let messageCount = 0;
    let ws;
    
    function connect() {
      ws = new WebSocket(\`ws://\${location.host}\`);
      
      ws.onopen = () => {
        status.textContent = '✅ Connesso';
        status.className = 'status connected';
        messageInput.disabled = false;
        sendBtn.disabled = false;
        addMessage('Sistema', 'Connesso al server', 'system');
      };
      
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        handleMessage(msg);
        messageCount++;
        msgCountSpan.textContent = messageCount;
      };
      
      ws.onclose = () => {
        status.textContent = '❌ Disconnesso';
        status.className = 'status disconnected';
        messageInput.disabled = true;
        sendBtn.disabled = true;
        addMessage('Sistema', 'Disconnesso dal server', 'system');
      };
      
      ws.onerror = (err) => {
        addMessage('Errore', 'Errore WebSocket', 'system');
      };
    }
    
    function handleMessage(msg) {
      switch (msg.type) {
        case 'welcome':
          addMessage('Sistema', msg.data.message, 'system');
          break;
        case 'chat':
          addMessage(msg.data.from, msg.data.message, 'chat');
          break;
        case 'user-joined':
          addMessage('Sistema', \`\${msg.data.username} si è connesso\`, 'system');
          onlineSpan.textContent = msg.data.totalOnline;
          break;
        case 'user-left':
          addMessage('Sistema', \`\${msg.data.username} si è disconnesso\`, 'system');
          onlineSpan.textContent = msg.data.totalOnline;
          break;
        case 'users-list':
          onlineSpan.textContent = msg.data.users.length;
          break;
      }
    }
    
    function addMessage(from, text, type = 'chat') {
      const div = document.createElement('div');
      div.className = \`message \${type}\`;
      div.innerHTML = \`<strong>\${from}:</strong> \${text}\`;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }
    
    function sendMessage() {
      const message = messageInput.value.trim();
      if (!message) return;
      
      ws.send(JSON.stringify({
        type: 'chat',
        data: { message }
      }));
      
      messageInput.value = '';
    }
    
    sendBtn.onclick = sendMessage;
    messageInput.onkeypress = (e) => {
      if (e.key === 'Enter') sendMessage();
    };
    
    connect();
  </script>
</body>
</html>
  `;
}

// ============================================
// AVVIO SERVER
// ============================================

const PORT = 8080;
const HOST = 'localhost';

httpServer.listen(PORT, HOST, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 WebSocket Server attivo su ws://${HOST}:${PORT}/`);
  console.log(`${'='.repeat(70)}\n`);
  
  console.log('📝 TEST:');
  console.log(`   Browser: http://localhost:${PORT}/`);
  console.log(`   Stats:   http://localhost:${PORT}/stats\n`);
  
  console.log('💡 TIPS:');
  console.log('   - Apri più tab del browser per testare la chat');
  console.log('   - I messaggi vengono broadcast a tutti i client');
  console.log('   - Heartbeat automatico ogni 30 secondi');
  console.log('   - WebSocket è full-duplex (bidirezionale)\n');
  
  console.log('Premi Ctrl+C per fermare il server\n');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', () => {
  console.log('\n\n⏳ Chiusura server WebSocket...');
  
  // Notifica tutti i client
  broadcast({
    type: 'server-shutdown',
    data: { message: 'Server in chiusura' }
  });
  
  // Chiudi heartbeat
  clearInterval(heartbeatInterval);
  
  // Chiudi tutti i client
  wss.clients.forEach((ws) => {
    ws.close(1000, 'Server shutdown');
  });
  
  // Chiudi server
  httpServer.close(() => {
    console.log('✓ Server chiuso');
    console.log(`\n📊 STATISTICHE:`);
    console.log(`   Connessioni totali: ${stats.totalConnections}`);
    console.log(`   Messaggi scambiati: ${stats.messagesReceived + stats.messagesSent}`);
    console.log(`   Dati trasferiti:    ${((stats.bytesReceived + stats.bytesSent) / 1024).toFixed(2)} KB\n`);
    process.exit(0);
  });
});
