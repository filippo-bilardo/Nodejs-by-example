# Esercizi Socket.io

Questa cartella contiene esercizi pratici per imparare Socket.io.

## 📋 Elenco Esercizi

### 1. [Chat Application](01-chat-application/)
**Livello:** Intermedio  
**Durata stimata:** 2-3 ore

**Obiettivo:**  
Creare un'applicazione di chat completa con room, typing indicators e persistenza messaggi.

**Requisiti:**
- Sistema di autenticazione (username)
- Creazione/join room
- Invio/ricezione messaggi
- Typing indicators
- Lista utenti online
- Lista room disponibili
- Storico messaggi per room
- Notifiche join/leave

**Tecnologie:**
- Socket.io 4.x
- Express.js
- HTML/CSS/JavaScript

**Valutazione:**
- Funzionalità base (40%)
- Gestione errori (20%)
- UI/UX (20%)
- Codice pulito (20%)

---

### 2. [Real-time Dashboard](02-dashboard/)
**Livello:** Avanzato  
**Durata stimata:** 3-4 ore

**Obiettivo:**  
Dashboard real-time che mostra metriche di sistema con grafici aggiornati in tempo reale.

**Requisiti:**
- Streaming dati real-time
- Grafici aggiornati in tempo reale
- Multiple metriche (CPU, RAM, Network)
- Storico dati
- Alert per soglie critiche
- Export dati
- Throttling eventi (max 1/sec)

**Tecnologie:**
- Socket.io 4.x
- Express.js
- Chart.js
- HTML/CSS/JavaScript

**Valutazione:**
- Streaming dati (30%)
- Grafici funzionanti (25%)
- Performance (25%)
- Codice organizzato (20%)

---

### 3. [Multiplayer Game](03-multiplayer-game/)
**Livello:** Avanzato  
**Durata stimata:** 4-6 ore

**Obiettivo:**  
Gioco multiplayer real-time (es. Tic-Tac-Toe o simile).

**Requisiti:**
- Matchmaking
- Game state synchronization
- Turn-based logic
- Win/lose detection
- Rematch function
- Spectator mode
- Disconnect handling
- Leaderboard

**Tecnologie:**
- Socket.io 4.x
- Express.js
- HTML5 Canvas (opzionale)
- HTML/CSS/JavaScript

**Valutazione:**
- Game logic (30%)
- Sincronizzazione (30%)
- Gestione disconnect (20%)
- UI/UX (20%)

---

## 🎯 Come Completare gli Esercizi

### 1. Leggi la Teoria
Prima di iniziare, assicurati di aver letto:
- [01-introduzione-socket.md](../teoria/01-introduzione-socket.md)
- [02-eventi-comunicazione.md](../teoria/02-eventi-comunicazione.md)
- [03-room-namespace.md](../teoria/03-room-namespace.md)

### 2. Studia gli Esempi
Analizza gli esempi correlati:
- [01-hello-world](../esempi/01-hello-world/) - Base
- [02-chat-room](../esempi/02-chat-room/) - Chat
- [06-multiplayer-game](../esempi/06-multiplayer-game/) - Game

### 3. Setup Progetto
```bash
# Crea cartella esercizio
mkdir mio-esercizio
cd mio-esercizio

# Inizializza npm
npm init -y

# Installa dipendenze
npm install express socket.io
```

### 4. Sviluppa
- Crea `server.js`
- Crea `public/index.html`
- Crea `public/client.js`
- Testa con più tab browser

### 5. Testa
```bash
# Avvia server
node server.js

# Apri browser
# http://localhost:3000

# Apri DevTools (F12)
# Tab Network → WS
# Tab Console
```

### 6. Valida
Controlla che:
- ✅ Codice funziona senza errori
- ✅ Gestione errori presente
- ✅ Codice commentato
- ✅ UI usabile
- ✅ Performance accettabili

---

## 📝 Struttura Soluzione Tipica

```
esercizio/
├── README.md           # Istruzioni
├── soluzione/
│   ├── server.js      # Server Socket.io
│   ├── package.json   # Dipendenze
│   └── public/
│       ├── index.html # Client HTML
│       ├── style.css  # Stili
│       └── client.js  # Logica client
```

---

## 🧪 Checklist Testing

### Funzionalità Base
- [ ] Server si avvia senza errori
- [ ] Client si connette
- [ ] Eventi inviati correttamente
- [ ] Eventi ricevuti correttamente
- [ ] Disconnessione gestita

### Gestione Errori
- [ ] Input validation
- [ ] Error handling try/catch
- [ ] Feedback utente su errori
- [ ] Reconnection handling

### Performance
- [ ] No memory leaks
- [ ] Eventi throttled se frequenti
- [ ] Cleanup su disconnect
- [ ] Payload ottimizzati

### UI/UX
- [ ] Interface intuitiva
- [ ] Feedback visuale
- [ ] Loading states
- [ ] Error messages
- [ ] Responsive design

---

## 💡 Tips Generali

### Debug
```javascript
// Server
const io = require('socket.io')(server, {
    cors: { origin: '*' }
});

io.on('connection', (socket) => {
    // Log tutti gli eventi
    socket.onAny((event, ...args) => {
        console.log(`[${socket.id}] ${event}:`, args);
    });
});

// Client
socket.onAny((event, ...args) => {
    console.log(`[Event] ${event}:`, args);
});
```

### Validazione Input
```javascript
function validateMessage(message) {
    if (!message || typeof message !== 'string') {
        throw new Error('Messaggio non valido');
    }
    
    if (message.trim().length === 0) {
        throw new Error('Messaggio vuoto');
    }
    
    if (message.length > 500) {
        throw new Error('Messaggio troppo lungo');
    }
    
    return message.trim();
}
```

### Gestione Errori
```javascript
// Server
socket.on('myEvent', async (data, callback) => {
    try {
        // Validazione
        const validated = validateData(data);
        
        // Logica
        const result = await processData(validated);
        
        // Risposta success
        callback({ success: true, result });
        
    } catch (error) {
        console.error('Errore:', error);
        callback({ success: false, error: error.message });
    }
});

// Client
socket.emit('myEvent', data, (response) => {
    if (response.success) {
        console.log('Success:', response.result);
    } else {
        console.error('Error:', response.error);
        alert('Errore: ' + response.error);
    }
});
```

### Throttling
```javascript
// Limita eventi frequenti (max 1/sec)
let lastEmit = 0;
const THROTTLE_MS = 1000;

function throttledEmit(event, data) {
    const now = Date.now();
    if (now - lastEmit >= THROTTLE_MS) {
        socket.emit(event, data);
        lastEmit = now;
    }
}
```

---

## 🆘 Troubleshooting

### "Socket not connected"
✅ Verifica server avviato  
✅ URL corretto nel client  
✅ CORS configurato  

### "Event not received"
✅ Nome evento identico client/server  
✅ Listener registrato PRIMA emit  
✅ Namespace corretta  
✅ Join room effettuato  

### "Memory leak"
✅ Rimuovi listener su disconnect  
✅ Cleanup database in-memory  
✅ Limita storico messaggi  

### "Too many re-renders"
✅ Non aggiornare state in loop  
✅ Usa throttling per eventi frequenti  
✅ Optimize React/Vue components  

---

## 📚 Risorse

- [Teoria Socket.io](../teoria/)
- [Esempi Completi](../esempi/)
- [Socket.io Docs](https://socket.io/docs/)
- [Socket.io Cheat Sheet](https://socket.io/docs/v4/emit-cheatsheet/)

---

## ✅ Criteri di Valutazione

### Funzionalità (40%)
- Requisiti implementati
- Logica corretta
- Edge cases gestiti

### Codice (30%)
- Organizzazione
- Commenti
- Best practices
- DRY principle

### Gestione Errori (15%)
- Validation
- Try/catch
- User feedback
- Logging

### UI/UX (15%)
- Usabilità
- Feedback visuale
- Responsive
- Accessibilità

---

**Buon lavoro! 🚀**

Per domande o chiarimenti, consulta prima la [teoria](../teoria/) e gli [esempi](../esempi/).
