/**
 * Socket.io Client
 * Hello World Example
 */

// Connetti al server Socket.io
const socket = io();

// Elementi DOM
const statusEl = document.getElementById('connectionStatus');
const socketIdEl = document.getElementById('socketId');
const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

/**
 * EVENTI DI CONNESSIONE
 */

// Connesso
socket.on('connect', () => {
    console.log('✅ Connesso al server!');
    console.log('Socket ID:', socket.id);
    
    updateConnectionStatus(true);
    socketIdEl.textContent = socket.id;
    addMessage('system', '✅ Connesso al server!');
    
    // Richiedi stats iniziali
    getStats();
});

// Disconnesso
socket.on('disconnect', (reason) => {
    console.log('❌ Disconnesso:', reason);
    
    updateConnectionStatus(false);
    socketIdEl.textContent = '-';
    addMessage('system', `❌ Disconnesso: ${reason}`);
});

// Errore connessione
socket.on('connect_error', (error) => {
    console.error('⚠️ Errore connessione:', error);
    addMessage('error', `⚠️ Errore connessione: ${error.message}`);
});

// Riconnessione
socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 Riconnesso dopo', attemptNumber, 'tentativi');
    addMessage('system', `🔄 Riconnesso dopo ${attemptNumber} tentativi`);
});

/**
 * EVENTI PERSONALIZZATI
 */

// Benvenuto dal server
socket.on('welcome', (data) => {
    console.log('👋 Benvenuto:', data);
    addMessage('system', `👋 ${data.message}`);
});

// Nuovo utente connesso
socket.on('userConnected', (data) => {
    console.log('👤 Nuovo utente:', data.socketId);
    addMessage('system', `👤 Nuovo utente connesso: ${data.socketId.substring(0, 8)}...`);
});

// Utente disconnesso
socket.on('userDisconnected', (data) => {
    console.log('👤 Utente disconnesso:', data.socketId);
    addMessage('system', `👋 Utente disconnesso: ${data.socketId.substring(0, 8)}...`);
});

// Messaggio ricevuto conferma
socket.on('messageReceived', (data) => {
    console.log('📩 Messaggio ricevuto dal server:', data);
    addMessage('sent', `✓ Messaggio inviato: ${data.original}`);
});

// Nuovo messaggio da altro client
socket.on('newMessage', (data) => {
    console.log('📬 Nuovo messaggio:', data);
    addMessage('received', `📬 Da ${data.from.substring(0, 8)}: ${data.message}`);
});

// Echo response
socket.on('echo', (data) => {
    console.log('🔊 Echo:', data);
    addMessage('received', `🔊 Echo: ${data}`);
});

// Pong response
socket.on('pong', (data) => {
    const latency = Date.now() - data.timestamp;
    console.log('🏓 Pong! Latency:', latency, 'ms');
    addMessage('system', `🏓 Pong! Latency: ${latency}ms`);
});

// Statistiche
socket.on('stats', (data) => {
    console.log('📊 Stats:', data);
    
    document.getElementById('totalConnections').textContent = data.totalConnections;
    document.getElementById('activeConnections').textContent = data.activeConnections;
    document.getElementById('totalMessages').textContent = data.totalMessages;
    document.getElementById('uptime').textContent = Math.floor(data.uptime);
});

// Broadcast ricevuto
socket.on('broadcast', (data) => {
    console.log('📢 Broadcast:', data);
    const fromMe = data.from === socket.id;
    addMessage('received', `📢 ${fromMe ? 'Tu' : data.from.substring(0, 8)}: ${data.message}`);
});

/**
 * FUNZIONI UI
 */

function updateConnectionStatus(connected) {
    if (connected) {
        statusEl.textContent = 'Connesso';
        statusEl.className = 'status connected';
    } else {
        statusEl.textContent = 'Disconnesso';
        statusEl.className = 'status disconnected';
    }
}

function addMessage(type, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const timestamp = new Date().toLocaleTimeString('it-IT');
    messageDiv.innerHTML = `${text}<span class="timestamp">${timestamp}</span>`;
    
    messagesEl.appendChild(messageDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function clearMessages() {
    messagesEl.innerHTML = '';
}

/**
 * FUNZIONI EVENTI
 */

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (!message) {
        addMessage('error', '⚠️ Messaggio vuoto!');
        return;
    }
    
    console.log('📤 Invio messaggio:', message);
    socket.emit('message', message);
    
    messageInput.value = '';
    messageInput.focus();
}

function testEcho() {
    const testMessage = 'Hello Echo!';
    console.log('🔊 Test echo:', testMessage);
    socket.emit('echo', testMessage);
    addMessage('system', `🔊 Invio echo: ${testMessage}`);
}

function testPing() {
    console.log('🏓 Test ping');
    socket.emit('ping');
    addMessage('system', '🏓 Ping inviato...');
}

function getStats() {
    console.log('📊 Richiesta stats');
    socket.emit('getStats');
}

function testBroadcast() {
    const message = 'Broadcast test message!';
    console.log('📢 Test broadcast:', message);
    socket.emit('broadcast', message);
    addMessage('system', `📢 Broadcast inviato: ${message}`);
}

/**
 * KEYBOARD SHORTCUTS
 */
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

/**
 * DEBUG: Log tutti gli eventi
 */
socket.onAny((event, ...args) => {
    console.log(`[Event] ${event}:`, args);
});

/**
 * INIT
 */
console.log('🚀 Socket.io Client inizializzato');
console.log('📡 In attesa di connessione...');
