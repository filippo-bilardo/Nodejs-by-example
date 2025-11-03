# Esercizio 02 - Chat TCP Multi-client

## 📋 Obiettivo

Creare un sistema di chat TCP completo con:
- Multiple connessioni simultanee
- Username personalizzati
- Sistema di stanze (rooms)
- Broadcasting messaggi
- Comandi chat
- Messaggi privati

## 🎯 Requisiti Funzionali

### 1. Server TCP Base
- [ ] Server TCP su porta 3000
- [ ] Gestione multiple connessioni simultanee
- [ ] Tracking client connessi
- [ ] Logging eventi (connessione, disconnessione, messaggi)

### 2. Sistema Username
- [ ] Comando `/nick <username>` per impostare username
- [ ] Validazione username:
  - Non vuoto
  - Max 20 caratteri
  - Unico (non già in uso)
- [ ] Username obbligatorio prima di chattare
- [ ] Cambio username runtime

### 3. Sistema Stanze (Rooms)
- [ ] Comando `/join <room>` per entrare in una stanza
- [ ] Creazione automatica stanza se non esiste
- [ ] Utente può essere in una sola stanza alla volta
- [ ] Comando `/leave` per uscire dalla stanza corrente
- [ ] Rimozione stanza automatica se vuota

### 4. Messaggistica
- [ ] Invio messaggi normali (non comandi) alla stanza corrente
- [ ] Broadcasting messaggio a tutti nella stanza (tranne mittente)
- [ ] Formato messaggio: `[HH:MM:SS] Username: messaggio`
- [ ] Messaggi solo se in una stanza

### 5. Comandi Chat

Implementare i seguenti comandi:

#### `/help`
Mostra lista comandi disponibili

#### `/nick <username>`
Imposta o cambia username

#### `/join <room>`
Entra in una stanza (crea se non esiste)

#### `/leave`
Esce dalla stanza corrente

#### `/rooms`
Lista stanze disponibili con numero utenti

#### `/users`
Lista utenti nella stanza corrente

#### `/msg <username> <messaggio>`
Invia messaggio privato a un utente

#### `/quit` o `/exit`
Disconnette dal server

### 6. Notifiche Sistema
- [ ] Notifica quando utente entra nella stanza
- [ ] Notifica quando utente esce dalla stanza
- [ ] Notifica quando utente cambia username
- [ ] Formato: `[HH:MM:SS] [SYSTEM] messaggio`

### 7. Gestione Errori
- [ ] Gestione porta già in uso
- [ ] Gestione errori socket
- [ ] Timeout inattività (opzionale - 10 minuti)
- [ ] Validazione comandi
- [ ] Feedback errori all'utente

### 8. Client (Opzionale)
Creare client interattivo:
- [ ] Connessione al server
- [ ] Input readline interattivo
- [ ] Visualizzazione messaggi
- [ ] Gestione disconnessione

## 🛠️ Requisiti Tecnici

### Strutture Dati Suggerite

```javascript
// Map: socketId → userData
const users = new Map();

// Struttura userData
{
    id: 'user_1',
    socketId: '127.0.0.1:12345',
    socket: socketObject,
    username: 'Mario',
    currentRoom: 'generale',
    connectedAt: Date
}

// Map: roomName → Set di socketId
const rooms = new Map();

// Esempio
rooms.set('generale', new Set(['socketId1', 'socketId2']));
```

### Funzioni Helper Essenziali

```javascript
// Ottiene utenti in una room
function getUsersInRoom(roomName) {
    const socketIds = rooms.get(roomName) || new Set();
    return Array.from(socketIds)
        .map(id => users.get(id))
        .filter(Boolean);
}

// Broadcasting in una room
function broadcast(roomName, message, excludeSocketId) {
    const socketIds = rooms.get(roomName);
    if (!socketIds) return;
    
    socketIds.forEach(socketId => {
        if (socketId !== excludeSocketId) {
            const user = users.get(socketId);
            if (user && !user.socket.destroyed) {
                user.socket.write(message);
            }
        }
    });
}

// Formatta messaggio
function formatMessage(username, message) {
    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] ${username}: ${message}\n`;
}

// Messaggio sistema
function systemMessage(message) {
    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] [SYSTEM] ${message}\n`;
}
```

## 📂 File da Creare

```
02-chat-tcp/
├── server.js       # Server chat (MAIN)
├── client.js       # Client interattivo (OPZIONALE)
├── package.json    # NPM config
└── README.md       # Documentazione
```

## 🧪 Testing

### Test 1: Setup Base
```bash
# Avvia server
node server.js

# Output atteso:
# Chat Server in ascolto su porta 3000
```

### Test 2: Connessione e Username
```bash
# Terminal 1 - Client 1
telnet localhost 3000

# Prova senza username
> Hello
⚠️ Imposta prima il tuo username con /nick <username>

# Imposta username
> /nick Alice
[SYSTEM] Username impostato: Alice
```

### Test 3: Stanze
```bash
# Entra in stanza
> /join generale
[SYSTEM] Sei entrato in #generale

# Lista stanze
> /rooms
📋 Room disponibili:
  #generale (1 utente) ← (sei qui)
```

### Test 4: Chat Multi-client
```bash
# Terminal 2 - Client 2
telnet localhost 3000
> /nick Bob
> /join generale

# Terminal 1 (Alice) vede:
[SYSTEM] Bob è entrato nella room

# Terminal 1 (Alice):
> Ciao Bob!

# Terminal 2 (Bob) vede:
[10:30:15] Alice: Ciao Bob!

# Terminal 2 (Bob):
> Ciao Alice!

# Terminal 1 (Alice) vede:
[10:30:20] Bob: Ciao Alice!
```

### Test 5: Comandi
```bash
# Lista utenti
> /users
👥 Utenti in #generale:
  • Alice (tu)
  • Bob

# Messaggio privato
> /msg Bob Messaggio segreto

# Bob vede:
[10:31:00] [PRIVATO da Alice] Messaggio segreto
```

### Test 6: Multiple Stanze
```bash
# Terminal 3 - Client 3
telnet localhost 3000
> /nick Charlie
> /join gaming

# Terminal 1:
> /rooms
📋 Room disponibili:
  #generale (2 utenti) ← (sei qui)
  #gaming (1 utente)
```

### Test 7: Leave e Notifiche
```bash
# Terminal 2 (Bob):
> /leave
[SYSTEM] Hai lasciato #generale

# Terminal 1 (Alice) vede:
[SYSTEM] Bob ha lasciato la room
```

## ✅ Criteri di Valutazione

### Funzionalità Base (30 punti)
- [ ] (10 pt) Server gestisce multiple connessioni
- [ ] (10 pt) Sistema username funzionante
- [ ] (10 pt) Broadcasting messaggi

### Sistema Stanze (25 punti)
- [ ] (10 pt) Join/leave room funzionante
- [ ] (10 pt) Messaggi separati per room
- [ ] (5 pt) Lista room e utenti

### Comandi (20 punti)
- [ ] (5 pt) Tutti i comandi implementati
- [ ] (5 pt) Validazione e feedback errori
- [ ] (5 pt) Help completo
- [ ] (5 pt) Messaggi privati

### Notifiche (15 punti)
- [ ] (5 pt) Notifiche join/leave
- [ ] (5 pt) Notifiche cambio username
- [ ] (5 pt) Formato corretto con timestamp

### Codice (10 punti)
- [ ] (3 pt) Codice organizzato
- [ ] (3 pt) Commenti appropriati
- [ ] (2 pt) Gestione errori
- [ ] (2 pt) Best practices

**Totale: 100 punti**

## 💡 Suggerimenti

### 1. Parse Comando
```javascript
function handleCommand(user, input) {
    const parts = input.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (command) {
        case '/nick':
            setUsername(user, args[0]);
            break;
        case '/join':
            joinRoom(user, args[0]);
            break;
        // ...
    }
}
```

### 2. Validazione Username
```javascript
function setUsername(user, username) {
    if (!username || username.trim().length === 0) {
        user.socket.write('⚠️ Username vuoto!\n');
        return;
    }
    
    if (username.length > 20) {
        user.socket.write('⚠️ Username troppo lungo (max 20)\n');
        return;
    }
    
    // Verifica unicità
    for (const [, u] of users) {
        if (u.username === username && u.socketId !== user.socketId) {
            user.socket.write(`⚠️ Username "${username}" già in uso\n`);
            return;
        }
    }
    
    user.username = username;
    user.socket.write(systemMessage(`Username impostato: ${username}`));
}
```

### 3. Join Room
```javascript
function joinRoom(user, roomName) {
    if (!user.username) {
        user.socket.write('⚠️ Imposta prima username\n');
        return;
    }
    
    // Esci da room precedente
    if (user.currentRoom) {
        leaveRoom(user);
    }
    
    // Crea room se non esiste
    if (!rooms.has(roomName)) {
        rooms.set(roomName, new Set());
    }
    
    // Join
    rooms.get(roomName).add(user.socketId);
    user.currentRoom = roomName;
    
    user.socket.write(systemMessage(`Sei entrato in #${roomName}`));
    broadcast(roomName, systemMessage(`${user.username} è entrato`), user.socketId);
}
```

### 4. Broadcasting
```javascript
function broadcast(roomName, message, excludeSocketId) {
    const socketIds = rooms.get(roomName);
    if (!socketIds) return;
    
    socketIds.forEach(socketId => {
        if (socketId !== excludeSocketId) {
            const user = users.get(socketId);
            if (user && !user.socket.destroyed) {
                user.socket.write(message);
            }
        }
    });
}
```

## 🆘 Problemi Comuni

### Messaggi duplicati
❌ Problema: Ogni messaggio appare due volte  
✅ Soluzione: Broadcasting dovrebbe escludere mittente

### Room non si svuota
❌ Problema: Room rimane anche se vuota  
✅ Soluzione: Rimuovi room se size === 0 dopo leave

### Username non unico
❌ Problema: Due utenti con stesso username  
✅ Soluzione: Verifica unicità in setUsername

### Crash su disconnect
❌ Problema: Server crash quando client disconnette  
✅ Soluzione: Verifica `!socket.destroyed` prima di write

## 📚 Risorse

- [Teoria TCP](../../teoria/02-modulo-net-tcp.md)
- [Esempio Chat Server](../../esempi/02-tcp-chat-server/)
- [Node.js net docs](https://nodejs.org/api/net.html)

## 🎓 Sfide Extra (Opzionali)

### +10 pt: Storico Messaggi
Salva ultimi 50 messaggi per room, invia a nuovo utente

### +15 pt: Autenticazione
Implementa password per room private

### +20 pt: File Sharing
Permetti invio file in chat

### +10 pt: Admin Commands
Aggiungi /kick, /ban per admin

---

**Tempo stimato: 3-4 ore**

Consulta la [soluzione](./soluzione/) solo dopo aver provato autonomamente!
