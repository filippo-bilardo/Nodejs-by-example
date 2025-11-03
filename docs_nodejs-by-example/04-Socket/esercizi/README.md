# Esercizi Socket TCP/UDP

Questa cartella contiene esercizi pratici per imparare la programmazione socket con Node.js.

## 📋 Elenco Esercizi

### 1. [Echo Server TCP](01-echo-server-tcp/)
**Livello:** Principiante  
**Durata stimata:** 1-2 ore

**Obiettivo:**  
Creare un server TCP echo completo con gestione errori e comandi.

**Requisiti:**
- Server TCP sulla porta 3000
- Echo di tutti i messaggi ricevuti
- Comandi: help, stats, quit
- Gestione multiple connessioni
- Timeout inattività (5 minuti)
- Statistiche server

**Valutazione:**
- Funzionalità base (40%)
- Gestione errori (30%)
- Comandi implementati (20%)
- Codice pulito (10%)

---

### 2. [Chat TCP Multi-client](02-chat-tcp/)
**Livello:** Intermedio  
**Durata stimata:** 3-4 ore

**Obiettivo:**  
Sistema di chat TCP con stanze, username e broadcasting.

**Requisiti:**
- Server che gestisce multiple connessioni
- Username per ogni client
- Stanze chat (/join, /leave)
- Broadcasting messaggi nella stanza
- Comandi: /help, /users, /rooms, /quit
- Notifiche join/leave
- Lista utenti online

**Valutazione:**
- Chat funzionante (30%)
- Sistema stanze (25%)
- Comandi (20%)
- Broadcasting (15%)
- Codice (10%)

---

### 3. [File Transfer TCP](03-file-transfer/)
**Livello:** Avanzato  
**Durata stimata:** 4-5 ore

**Obiettivo:**  
Sistema di trasferimento file con progress tracking.

**Requisiti:**
- Upload file da client a server
- Download file da server a client
- Progress bar trasferimento
- Checksum validazione (MD5/SHA256)
- Resume download interrotto
- Lista file disponibili
- Gestione errori

**Valutazione:**
- Upload/Download (30%)
- Progress tracking (20%)
- Resume capability (20%)
- Checksum (15%)
- Codice (15%)

---

### 4. [Echo Server UDP](04-echo-server-udp/)
**Livello:** Principiante  
**Durata stimata:** 1-2 ore

**Obiettivo:**  
Server UDP echo con gestione datagram.

**Requisiti:**
- Server UDP porta 3000
- Echo datagram ricevuti
- Logging sender info
- Gestione errori
- Statistiche (pacchetti ricevuti/inviati)
- Limite dimensione datagram (512 bytes)

**Valutazione:**
- Funzionalità UDP (40%)
- Logging (20%)
- Statistiche (20%)
- Codice (20%)

---

### 5. [Discovery Service UDP](05-udp-discovery/)
**Livello:** Avanzato  
**Durata stimata:** 4-6 ore

**Obiettivo:**  
Service discovery con UDP broadcast/multicast.

**Requisiti:**
- Server che annuncia servizio (broadcast)
- Client che scopre servizi disponibili
- Heartbeat periodico
- Timeout detection (servizio offline)
- Multicast group support
- Lista servizi attivi
- Auto-reconnect

**Valutazione:**
- Discovery funzionante (30%)
- Heartbeat (25%)
- Timeout (20%)
- Multicast (15%)
- Codice (10%)

---

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

### 1. Studia Teoria
Prima di iniziare:
- [01-introduzione-socket-protocolli.md](../teoria/01-introduzione-socket-protocolli.md)
- [02-modulo-net-tcp.md](../teoria/02-modulo-net-tcp.md)
- [03-modulo-dgram-udp.md](../teoria/03-modulo-dgram-udp.md)

### 2. Analizza Esempi
Studia esempi correlati:
- [01-tcp-echo-server](../esempi/01-tcp-echo-server/)
- [02-tcp-chat-server](../esempi/02-tcp-chat-server/)
- [04-udp-echo-server](../esempi/04-udp-echo-server/)

### 3. Setup Progetto
```bash
# Crea cartella
mkdir mio-esercizio
cd mio-esercizio

# Inizializza
npm init -y

# Eventuali dipendenze
npm install debug
```

### 4. Sviluppa
- Leggi README esercizio
- Implementa step by step
- Testa frequentemente
- Gestisci errori

### 5. Testa
```bash
# Avvia server
node server.js

# In altro terminal - client
node client.js

# Oppure usa netcat
nc localhost 3000
nc -u localhost 3000  # UDP
```

### 6. Confronta
- Controlla requisiti soddisfatti
- Confronta con soluzione (solo dopo!)
- Migliora il codice

---

## 📝 Struttura Soluzione Tipica

```
esercizio/
├── README.md          # Istruzioni dettagliate
├── server.js          # Server implementation
├── client.js          # Client implementation
├── package.json       # Dependencies
├── soluzione/         # Soluzione completa
│   ├── server.js
│   ├── client.js
│   └── README.md
└── test/              # Test (opzionale)
    └── test.js
```

---

## 🧪 Testing Checklist

### Funzionalità Base
- [ ] Server si avvia senza errori
- [ ] Client si connette
- [ ] Dati inviati correttamente
- [ ] Dati ricevuti correttamente
- [ ] Disconnessione gestita

### Gestione Errori
- [ ] Porta già in uso gestita
- [ ] Connection refused gestita
- [ ] Socket errors catturati
- [ ] Timeout funzionante
- [ ] Cleanup su chiusura

### Edge Cases
- [ ] Messaggio vuoto
- [ ] Messaggio molto lungo
- [ ] Multiple connessioni simultanee
- [ ] Disconnessione improvvisa client
- [ ] Restart server

### Performance
- [ ] No memory leaks
- [ ] CPU usage accettabile
- [ ] Latency accettabile
- [ ] Handles stress test

---

## 💡 Suggerimenti Generali

### 1. Inizia Semplice
```javascript
// Prima: echo base
socket.on('data', (data) => {
    socket.write(data);
});

// Poi: aggiungi features
socket.on('data', (data) => {
    const message = data.toString().trim();
    
    if (message === 'quit') {
        socket.end();
    } else {
        socket.write(`Echo: ${message}\n`);
    }
});
```

### 2. Logging Dettagliato
```javascript
function log(type, message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
    if (data) console.log(data);
}

log('INFO', 'Client connesso', { id: socket.remoteAddress });
```

### 3. Gestione Errori
```javascript
// Wrapper try-catch
function safeExecute(fn, errorHandler) {
    try {
        fn();
    } catch (err) {
        errorHandler(err);
    }
}

socket.on('data', (data) => {
    safeExecute(
        () => processData(data),
        (err) => socket.write(`Errore: ${err.message}\n`)
    );
});
```

### 4. Testing
```javascript
// Test automatici
const assert = require('assert');

// Test connessione
const client = net.connect(3000, () => {
    console.log('✓ Connessione OK');
    client.end();
});

client.on('error', (err) => {
    console.error('✗ Connessione FAIL:', err.message);
    process.exit(1);
});
```

---

## 🆘 Troubleshooting

### "EADDRINUSE: address already in use"
```bash
# Trova processo
lsof -i :3000
netstat -an | grep 3000

# Uccidi processo
kill -9 <PID>

# Oppure usa porta diversa
PORT=3001 node server.js
```

### "ECONNREFUSED: Connection refused"
✅ Verifica server avviato  
✅ Porta corretta  
✅ Indirizzo corretto (localhost vs 0.0.0.0)  
✅ Firewall non blocca  

### Messaggi Incompleti (TCP)
```javascript
// Buffer per accumulare dati
let buffer = '';

socket.on('data', (chunk) => {
    buffer += chunk.toString();
    
    // Processa messaggi completi (delimitati da \n)
    let index;
    while ((index = buffer.indexOf('\n')) !== -1) {
        const message = buffer.substring(0, index);
        buffer = buffer.substring(index + 1);
        processMessage(message);
    }
});
```

### UDP Packet Loss
```javascript
// Implementa retry
function sendWithRetry(socket, message, address, port, maxRetries = 3) {
    let retries = 0;
    
    const send = () => {
        socket.send(message, port, address, (err) => {
            if (err && retries < maxRetries) {
                retries++;
                setTimeout(send, 1000);
            }
        });
    };
    
    send();
}
```

---

## 📚 Risorse

- [Teoria](../teoria/)
- [Esempi Completi](../esempi/)
- [Node.js net docs](https://nodejs.org/api/net.html)
- [Node.js dgram docs](https://nodejs.org/api/dgram.html)

---

## ✅ Criteri di Valutazione

### Funzionalità (40%)
- Requisiti implementati
- Logica corretta
- Features richieste

### Gestione Errori (30%)
- Try-catch appropriati
- Error handlers
- Graceful shutdown
- Edge cases

### Codice (20%)
- Organizzazione
- Commenti
- Best practices
- DRY principle

### Testing (10%)
- Test funzionali
- Edge cases testati
- Performance OK

**Totale: 100%**

---

**Buon lavoro! 🚀**

Inizia con [01-echo-server-tcp](01-echo-server-tcp/) per il primo esercizio!
