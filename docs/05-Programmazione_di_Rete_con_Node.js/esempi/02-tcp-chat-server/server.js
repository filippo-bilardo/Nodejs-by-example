/**
 * TCP Chat Server Multi-Client
 * Server di chat con supporto stanze, username e broadcasting
 */

const net = require('net');

const PORT = process.env.PORT || 8080;

// Gestione client e stanze
const clients = new Map(); // socket -> clientInfo
const rooms = new Map();   // roomName -> Set<socket>

// Statistiche
const stats = {
    totalConnections: 0,
    activeConnections: 0,
    totalMessages: 0,
    roomsCreated: 0,
    startTime: new Date()
};

/**
 * Broadcast messaggio a tutti i client in una stanza
 */
function broadcast(message, room = 'lobby', excludeSocket = null) {
    const roomClients = rooms.get(room);
    
    if (!roomClients) return;
    
    roomClients.forEach((socket) => {
        if (socket !== excludeSocket && !socket.destroyed) {
            socket.write(message + '\n');
        }
    });
}

/**
 * Invia messaggio a un client specifico
 */
function sendToClient(socket, message) {
    if (!socket.destroyed) {
        socket.write(message + '\n');
    }
}

/**
 * Aggiungi client a una stanza
 */
function joinRoom(socket, roomName) {
    const clientInfo = clients.get(socket);
    
    // Lascia stanza corrente
    if (clientInfo.room) {
        leaveRoom(socket);
    }
    
    // Crea stanza se non esiste
    if (!rooms.has(roomName)) {
        rooms.set(roomName, new Set());
        stats.roomsCreated++;
    }
    
    // Aggiungi a nuova stanza
    rooms.get(roomName).add(socket);
    clientInfo.room = roomName;
    
    sendToClient(socket, `✅ Sei entrato nella stanza: ${roomName}`);
    broadcast(`📢 ${clientInfo.username} è entrato nella stanza`, roomName, socket);
    
    console.log(`📥 ${clientInfo.username} → stanza '${roomName}'`);
}

/**
 * Rimuovi client da stanza
 */
function leaveRoom(socket) {
    const clientInfo = clients.get(socket);
    
    if (!clientInfo.room) return;
    
    const roomName = clientInfo.room;
    const roomClients = rooms.get(roomName);
    
    if (roomClients) {
        roomClients.delete(socket);
        
        // Notifica altri nella stanza
        broadcast(`📢 ${clientInfo.username} ha lasciato la stanza`, roomName);
        
        // Elimina stanza se vuota
        if (roomClients.size === 0) {
            rooms.delete(roomName);
        }
    }
    
    clientInfo.room = null;
}

/**
 * Lista utenti in una stanza
 */
function listUsers(roomName) {
    const roomClients = rooms.get(roomName);
    
    if (!roomClients || roomClients.size === 0) {
        return 'Nessun utente in questa stanza.';
    }
    
    const usernames = Array.from(roomClients)
        .map(s => clients.get(s).username)
        .join(', ');
    
    return `Utenti in ${roomName} (${roomClients.size}): ${usernames}`;
}

/**
 * Lista tutte le stanze
 */
function listRooms() {
    if (rooms.size === 0) {
        return 'Nessuna stanza disponibile.';
    }
    
    let list = 'Stanze disponibili:\n';
    rooms.forEach((clients, name) => {
        list += `  📁 ${name} (${clients.size} utenti)\n`;
    });
    
    return list.trim();
}

/**
 * Gestisce comandi chat
 */
function handleCommand(socket, message) {
    const clientInfo = clients.get(socket);
    const parts = message.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (cmd) {
        case '/help':
            sendToClient(socket, `
╔════════════════════════════════════════════════════════════╗
║                    COMANDI CHAT                            ║
╚════════════════════════════════════════════════════════════╝

  /nick <username>      - Cambia il tuo username
  /join <room>          - Entra in una stanza
  /leave                - Lascia la stanza corrente
  /rooms                - Lista tutte le stanze
  /users                - Lista utenti nella stanza corrente
  /msg <user> <text>    - Messaggio privato a un utente
  /help                 - Mostra questo messaggio
  /quit                 - Disconnetti

Scrivi normalmente per inviare messaggi alla stanza corrente.
`);
            break;
            
        case '/nick':
            if (args.length === 0) {
                sendToClient(socket, '⚠️  Uso: /nick <username>');
                break;
            }
            
            const newUsername = args[0];
            const oldUsername = clientInfo.username;
            
            // Verifica username non già in uso
            let usernameExists = false;
            clients.forEach((info, s) => {
                if (s !== socket && info.username === newUsername) {
                    usernameExists = true;
                }
            });
            
            if (usernameExists) {
                sendToClient(socket, `⚠️  Username '${newUsername}' già in uso!`);
            } else {
                clientInfo.username = newUsername;
                sendToClient(socket, `✅ Username cambiato in: ${newUsername}`);
                
                if (clientInfo.room) {
                    broadcast(`📢 ${oldUsername} ora si chiama ${newUsername}`, clientInfo.room);
                }
                
                console.log(`👤 ${oldUsername} → ${newUsername}`);
            }
            break;
            
        case '/join':
            if (args.length === 0) {
                sendToClient(socket, '⚠️  Uso: /join <room>');
                break;
            }
            
            const roomToJoin = args[0];
            joinRoom(socket, roomToJoin);
            break;
            
        case '/leave':
            if (!clientInfo.room) {
                sendToClient(socket, '⚠️  Non sei in nessuna stanza!');
            } else {
                const roomName = clientInfo.room;
                leaveRoom(socket);
                sendToClient(socket, `✅ Hai lasciato la stanza: ${roomName}`);
            }
            break;
            
        case '/rooms':
            sendToClient(socket, listRooms());
            break;
            
        case '/users':
            if (!clientInfo.room) {
                sendToClient(socket, '⚠️  Non sei in nessuna stanza!');
            } else {
                sendToClient(socket, listUsers(clientInfo.room));
            }
            break;
            
        case '/msg':
            if (args.length < 2) {
                sendToClient(socket, '⚠️  Uso: /msg <username> <messaggio>');
                break;
            }
            
            const targetUser = args[0];
            const privateMsg = args.slice(1).join(' ');
            
            // Trova socket dell'utente target
            let targetSocket = null;
            clients.forEach((info, s) => {
                if (info.username === targetUser) {
                    targetSocket = s;
                }
            });
            
            if (!targetSocket) {
                sendToClient(socket, `⚠️  Utente '${targetUser}' non trovato!`);
            } else {
                sendToClient(targetSocket, `💬 [Privato da ${clientInfo.username}]: ${privateMsg}`);
                sendToClient(socket, `💬 [Privato a ${targetUser}]: ${privateMsg}`);
                console.log(`💬 ${clientInfo.username} → ${targetUser}: ${privateMsg}`);
            }
            break;
            
        case '/quit':
            sendToClient(socket, '👋 Arrivederci!');
            socket.end();
            break;
            
        default:
            sendToClient(socket, `⚠️  Comando sconosciuto: ${cmd}`);
            sendToClient(socket, 'Usa /help per vedere i comandi disponibili');
    }
}

/**
 * Gestisce connessione client
 */
function handleClient(socket) {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    
    stats.totalConnections++;
    stats.activeConnections++;
    
    // Genera username temporaneo
    const tempUsername = `User${stats.totalConnections}`;
    
    // Inizializza info client
    const clientInfo = {
        username: tempUsername,
        room: null,
        connectedAt: new Date()
    };
    
    clients.set(socket, clientInfo);
    
    console.log('');
    console.log(`✅ Nuovo client: ${clientId} (${tempUsername})`);
    console.log(`   Connessioni attive: ${stats.activeConnections}`);
    
    // Messaggio di benvenuto
    sendToClient(socket, `
╔════════════════════════════════════════════════════════════╗
║        Benvenuto al TCP Chat Server Multi-Client!          ║
╚════════════════════════════════════════════════════════════╝

Il tuo username temporaneo è: ${tempUsername}

Usa /help per vedere i comandi disponibili.
Usa /join <stanza> per entrare in una stanza e iniziare a chattare!

`);
    
    // Auto-join a lobby
    joinRoom(socket, 'lobby');
    
    /**
     * Gestione messaggi
     */
    socket.on('data', (data) => {
        const message = data.toString().trim();
        
        if (!message) return;
        
        stats.totalMessages++;
        
        // Gestione comandi
        if (message.startsWith('/')) {
            handleCommand(socket, message);
        } else {
            // Messaggio normale
            if (!clientInfo.room) {
                sendToClient(socket, '⚠️  Devi essere in una stanza per inviare messaggi!');
                sendToClient(socket, 'Usa /join <stanza> per entrare in una stanza.');
            } else {
                const chatMessage = `[${clientInfo.username}]: ${message}`;
                broadcast(chatMessage, clientInfo.room, socket);
                console.log(`💬 ${clientInfo.room} | ${chatMessage}`);
            }
        }
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
        // Rimuovi da stanza
        if (clientInfo.room) {
            leaveRoom(socket);
        }
        
        // Rimuovi dalla lista client
        clients.delete(socket);
        stats.activeConnections--;
        
        console.log('');
        console.log(`👋 Client disconnesso: ${clientId} (${clientInfo.username})`);
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
    console.log('💬 TCP Chat Server Multi-Client');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
    console.log('');
    console.log('Per connetterti:');
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
    
    // Notifica tutti i client
    clients.forEach((info, socket) => {
        sendToClient(socket, '\n⚠️  Server in shutdown. Disconnessione...');
        socket.end();
    });
    
    // Mostra statistiche finali
    const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
    console.log('');
    console.log('═'.repeat(60));
    console.log('📊 STATISTICHE FINALI');
    console.log('═'.repeat(60));
    console.log(`   Connessioni totali:  ${stats.totalConnections}`);
    console.log(`   Messaggi totali:     ${stats.totalMessages}`);
    console.log(`   Stanze create:       ${stats.roomsCreated}`);
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
