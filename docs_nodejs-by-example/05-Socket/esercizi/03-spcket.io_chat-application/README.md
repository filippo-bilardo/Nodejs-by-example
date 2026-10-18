# Esercizio 01 - Chat Application

## 📋 Obiettivo

Creare un'applicazione di chat completa con Socket.io che supporti:
- Multiple room
- Typing indicators
- Lista utenti online
- Storico messaggi
- Notifiche join/leave

## 🎯 Requisiti Funzionali

### 1. Autenticazione Utente
- [ ] Input username all'ingresso
- [ ] Validazione username (min 3, max 20 caratteri)
- [ ] Feedback errori validazione
- [ ] Username unico nella room

### 2. Gestione Room
- [ ] Creazione nuova room
- [ ] Join room esistente
- [ ] Lista room disponibili con numero utenti
- [ ] Notifica quando utente entra/esce
- [ ] Leave room

### 3. Messaggistica
- [ ] Invio messaggi nella room corrente
- [ ] Ricezione messaggi real-time
- [ ] Storico ultimi 50 messaggi per room
- [ ] Timestamp su ogni messaggio
- [ ] Validazione messaggio (max 500 caratteri)

### 4. Typing Indicators
- [ ] Mostra "X sta scrivendo..." quando utente digita
- [ ] Nasconde dopo 2 secondi di inattività
- [ ] Max 3 utenti mostrati contemporaneamente

### 5. Lista Utenti
- [ ] Mostra utenti nella room corrente
- [ ] Aggiornamento real-time
- [ ] Indicatore se utente sta scrivendo

### 6. UI/UX
- [ ] Interface pulita e intuitiva
- [ ] Messaggi scrollabili
- [ ] Auto-scroll su nuovo messaggio
- [ ] Indicatore connessione online/offline
- [ ] Feedback azioni (invio messaggio, join room, etc.)

## 🛠️ Requisiti Tecnici

### Server (Node.js + Socket.io)
```javascript
// Struttura minima richiesta

// Eventi da implementare
socket.on('setUsername', (username, callback) => {});
socket.on('joinRoom', (roomName, callback) => {});
socket.on('leaveRoom', () => {});
socket.on('chatMessage', (message, callback) => {});
socket.on('typing', (isTyping) => {});
socket.on('disconnect', () => {});

// Eventi da emettere
socket.emit('welcome', data);
socket.to(room).emit('userJoined', data);
socket.to(room).emit('userLeft', data);
io.to(room).emit('newMessage', data);
socket.to(room).emit('userTyping', data);
io.to(room).emit('usersList', users);
socket.emit('roomsList', rooms);
```

### Client (HTML + JavaScript)
```javascript
// Eventi da gestire
socket.on('connect', () => {});
socket.on('disconnect', () => {});
socket.on('welcome', (data) => {});
socket.on('roomsList', (rooms) => {});
socket.on('userJoined', (data) => {});
socket.on('userLeft', (data) => {});
socket.on('newMessage', (message) => {});
socket.on('userTyping', (data) => {});
socket.on('usersList', (users) => {});
```

### Database (In-Memory)
```javascript
// Strutture dati suggerite
const users = new Map();        // socketId → userData
const rooms = new Map();        // roomName → Set(socketIds)
const roomMessages = new Map(); // roomName → Array(messages)

// Struttura user
{
    socketId: 'abc123',
    username: 'Mario',
    currentRoom: 'Generale',
    joinedAt: '2024-01-01T10:00:00Z'
}

// Struttura message
{
    id: '1704096000000',
    username: 'Mario',
    message: 'Ciao a tutti!',
    timestamp: '2024-01-01T10:00:00Z'
}
```

## 📦 Dipendenze

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  }
}
```

## 📂 Struttura File Richiesta

```
01-chat-application/
├── README.md
├── package.json
├── server.js
└── public/
    ├── index.html
    ├── style.css
    └── client.js
```

## 🧪 Come Testare

### Test Base
1. Avvia server
```bash
npm install
node server.js
```

2. Apri 2+ finestre browser su `http://localhost:3000`

3. Imposta username diversi

4. Crea room "Generale"

5. Fai join alla room da entrambe le finestre

6. Invia messaggi

7. Verifica che:
   - Messaggi appaiono real-time in tutte le finestre
   - Lista utenti aggiornata
   - Typing indicator funziona
   - Notifiche join/leave appaiono

### Test Avanzati
8. Crea seconda room "Gaming"

9. Fai join da una finestra

10. Verifica che:
    - Messaggi separati per room
    - Lista utenti corretta per room
    - Cambio room funziona

11. Chiudi una finestra

12. Verifica che:
    - Utente rimosso dalla lista
    - Notifica "X ha lasciato" appare

### Test Edge Cases
13. Prova username vuoto → deve dare errore

14. Prova messaggio vuoto → deve dare errore

15. Prova messaggio > 500 caratteri → deve dare errore

16. Disconnetti/riconnetti → deve permettere re-join

## ✅ Criteri di Valutazione

### Funzionalità (40 punti)
- [ ] (10 pt) Autenticazione username funzionante
- [ ] (10 pt) Gestione room completa
- [ ] (10 pt) Messaggistica real-time
- [ ] (5 pt) Typing indicators
- [ ] (5 pt) Lista utenti aggiornata

### Gestione Errori (20 punti)
- [ ] (5 pt) Validazione input username
- [ ] (5 pt) Validazione messaggi
- [ ] (5 pt) Gestione disconnessioni
- [ ] (5 pt) Feedback errori all'utente

### UI/UX (20 punti)
- [ ] (5 pt) Interface intuitiva
- [ ] (5 pt) Feedback visuale
- [ ] (5 pt) Messaggi scrollabili
- [ ] (5 pt) Design responsive

### Codice (20 punti)
- [ ] (5 pt) Codice organizzato
- [ ] (5 pt) Commenti appropriati
- [ ] (5 pt) Best practices Socket.io
- [ ] (5 pt) No duplicazione codice

**Totale: 100 punti**

## 💡 Suggerimenti

### 1. Inizia Semplice
Prima implementa connessione base e un solo messaggio, poi aggiungi funzionalità.

### 2. Usa Callback
```javascript
// Per feedback immediato
socket.emit('chatMessage', message, (response) => {
    if (response.success) {
        console.log('Messaggio inviato!');
    } else {
        alert('Errore: ' + response.error);
    }
});
```

### 3. Throttle Typing
```javascript
// Non inviare "typing" ad ogni keypress
let typingTimer;
input.addEventListener('input', () => {
    socket.emit('typing', true);
    
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        socket.emit('typing', false);
    }, 2000);
});
```

### 4. Auto-scroll Messaggi
```javascript
function addMessage(message) {
    messagesDiv.appendChild(messageEl);
    
    // Auto-scroll se già in fondo
    const isAtBottom = messagesDiv.scrollHeight - messagesDiv.clientHeight <= messagesDiv.scrollTop + 50;
    if (isAtBottom) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
}
```

### 5. Cleanup su Disconnect
```javascript
socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user && user.currentRoom) {
        // Rimuovi da room
        // Notifica altri utenti
        // Cleanup database
    }
});
```

## 🆘 Problemi Comuni

### Messaggi duplicati
✅ Non usare `io.emit()` se vuoi solo la room  
✅ Usa `io.to(roomName).emit()`

### Typing indicator sempre visibile
✅ Implementa timeout per nasconderlo  
✅ Invia `typing: false` quando necessario

### Utenti non aggiornati
✅ Emit `usersList` dopo ogni join/leave  
✅ Aggiorna Map correttamente

### Storico messaggi non appare
✅ Invia storico nel callback di `joinRoom`  
✅ Verifica ordine messaggi

## 📚 Risorse

- [Teoria Room](../../08-socket.io_room-namespace.md)
- [Esempio Chat Room](../../esempi/02-chat-room/)
- [Socket.io Emit Cheatsheet](https://socket.io/docs/v4/emit-cheatsheet/)

## 🎓 Sfide Extra (Opzionali)

Per ottenere punti bonus:

### 1. Private Messages (+10 pt)
Implementa messaggi privati tra utenti

### 2. Emoji Support (+5 pt)
Aggiungi picker emoji

### 3. File Upload (+15 pt)
Permetti invio immagini

### 4. Persistenza (+20 pt)
Salva messaggi in file/database

### 5. Moderazione (+10 pt)
Aggiungi ruoli admin/moderatore

---

**Buon lavoro! 💪**

Consulta la [soluzione](./soluzione/) solo dopo aver provato da solo!
