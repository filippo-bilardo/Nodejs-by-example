# Esempi Socket.io

Questa cartella contiene esempi pratici di applicazioni real-time con Socket.io.

## 📁 Elenco Esempi

### 1. [Hello World Socket](01-hello-world/)
**Livello:** Principiante  
**Descrizione:** Primo esempio base di connessione Socket.io tra client e server.

**Cosa imparerai:**
- Setup server Socket.io
- Connessione client
- Eventi base (connect, disconnect)
- Invio/ricezione messaggi semplici

**Come eseguire:**
```bash
cd 01-hello-world
npm install
npm start
# Apri http://localhost:3000
```

---

### 2. [Chat Room](02-chat-room/)
**Livello:** Intermedio  
**Descrizione:** Chat multi-utente con room e notifiche.

**Cosa imparerai:**
- Gestione room
- Join/leave room
- Broadcasting in room
- User list in tempo reale
- Typing indicators

**Come eseguire:**
```bash
cd 02-chat-room
npm install
npm start
# Apri http://localhost:3000
```

**Test:**
- Apri più tab del browser
- Crea/Join diverse room
- Invia messaggi
- Osserva typing indicator

---

### 3. [Notifiche Real-time](03-notifications/)
**Livello:** Intermedio  
**Descrizione:** Sistema di notifiche push real-time.

**Cosa imparerai:**
- Eventi personalizzati
- Acknowledge pattern
- Namespace per separazione logica
- Gestione disconnessioni

**Come eseguire:**
```bash
cd 03-notifications
npm install
npm start
# Apri http://localhost:3000
```

---

### 4. [Collaborative Whiteboard](04-whiteboard/)
**Livello:** Avanzato  
**Descrizione:** Lavagna collaborativa in tempo reale.

**Cosa imparerai:**
- Sincronizzazione dati real-time
- Canvas drawing events
- Broadcasting selective
- Performance optimization

**Come eseguire:**
```bash
cd 04-whiteboard
npm install
npm start
# Apri http://localhost:3000
```

**Test:**
- Apri 2+ finestre
- Disegna in una finestra
- Vedi sincronizzazione istantanea

---

### 5. [Live Dashboard](05-dashboard/)
**Livello:** Avanzato  
**Descrizione:** Dashboard con dati real-time e grafici.

**Cosa imparerai:**
- Streaming dati
- Grafico real-time
- Multiple data sources
- Throttling eventi

**Come eseguire:**
```bash
cd 05-dashboard
npm install
npm start
# Apri http://localhost:3000
```

---

### 6. [Game Multiplayer](06-multiplayer-game/)
**Livello:** Avanzato  
**Descrizione:** Semplice gioco multiplayer (Tic-Tac-Toe).

**Cosa imparerai:**
- Game state synchronization
- Turn-based logic
- Room management per partite
- Matchmaking base

**Come eseguire:**
```bash
cd 06-multiplayer-game
npm install
npm start
# Apri http://localhost:3000
```

---

## 🎯 Percorso di Apprendimento

### Principiante
1. **01-hello-world** - Inizia qui per capire le basi
2. **02-chat-room** - Impara room e broadcasting

### Intermedio
3. **03-notifications** - Namespace e pattern avanzati
4. **04-whiteboard** - Sincronizzazione complessa

### Avanzato
5. **05-dashboard** - Streaming dati e performance
6. **06-multiplayer-game** - Logica di gioco real-time

---

## 🧪 Testing

### Test con Browser
```bash
# Avvia esempio
cd 01-hello-world
npm start

# Apri più tab browser
# http://localhost:3000
```

### Test con curl (per API Socket.io)
```bash
# Verifica che server risponda
curl http://localhost:3000/socket.io/

# Dovrebbe restituire info WebSocket
```

### Chrome DevTools
1. Apri DevTools (F12)
2. Tab **Network** → Filtra "WS" (WebSocket)
3. Clicca su connessione socket.io
4. **Messages** tab per vedere eventi
5. **Console** per log JavaScript

---

## 📝 Struttura Tipica Esempio

```
esempio/
├── server.js         # Server Socket.io
├── package.json      # Dipendenze
├── public/
│   ├── index.html   # Client HTML
│   ├── style.css    # Stili
│   └── client.js    # Logica client Socket.io
└── README.md        # Documentazione esempio
```

---

## 🔧 Dipendenze Comuni

Tutti gli esempi usano:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2"
  }
}
```

Alcuni esempi aggiuntivi potrebbero includere:
- `uuid` - Generazione ID unici
- `joi` - Validazione input
- `chart.js` - Grafici (dashboard)

---

## 💡 Tips

### Debug Socket.io

```javascript
// Server - abilita debug
const io = require('socket.io')(server, {
    cors: { origin: '*' },
    transports: ['websocket', 'polling']
});

// Log tutti gli eventi
io.on('connection', (socket) => {
    socket.onAny((event, ...args) => {
        console.log('Event:', event, args);
    });
});
```

### Monitor Connessioni

```javascript
// Conta connessioni attive
io.on('connection', (socket) => {
    const count = io.engine.clientsCount;
    console.log('Active connections:', count);
});
```

### Gestione Errori

```javascript
// Client
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

// Server
io.on('connection', (socket) => {
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});
```

---

## 🆘 Troubleshooting

### "Cannot GET /socket.io/"
✅ Server non avviato correttamente  
✅ Verifica porta in uso  
✅ Check firewall  

### Client non si connette
✅ Verifica URL corretto  
✅ Check CORS settings  
✅ Vedi console browser per errori  

### Eventi non ricevuti
✅ Nome evento corretto client/server  
✅ Listener registrato prima emit  
✅ Check namespace corretta  

### Performance lenta
✅ Troppi eventi → usa throttling  
✅ Payload troppo grande → comprimi dati  
✅ Broadcasting inefficiente → usa room  

---

## 📚 Risorse

- [Teoria Socket.io](../)
- [Esercizi](../esercizi/)
- [Socket.io Docs](https://socket.io/docs/)
- [Socket.io GitHub](https://github.com/socketio/socket.io)

---

**Inizia con**: [01-hello-world](01-hello-world/) per il tuo primo server Socket.io!
