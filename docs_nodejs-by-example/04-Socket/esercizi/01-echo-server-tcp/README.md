# Esercizio 01 - Echo Server TCP

## 📋 Obiettivo

Creare un server TCP echo completo che:
- Accetta connessioni multiple
- Fa echo di tutti i messaggi ricevuti
- Implementa comandi speciali (help, stats, quit)
- Gestisce timeout e errori
- Fornisce statistiche server

## 🎯 Requisiti Funzionali

### 1. Server TCP Base
- [ ] Creare server con modulo `net`
- [ ] Ascolto su porta 3000 (configurabile con variabile ambiente)
- [ ] Bind su `0.0.0.0` (tutte le interfacce)
- [ ] Gestire multiple connessioni simultanee

### 2. Echo Functionality
- [ ] Ricevere messaggi dal client
- [ ] Inviare echo del messaggio (`Echo: <messaggio>`)
- [ ] Supportare encoding UTF-8
- [ ] Aggiungere newline alla fine di ogni risposta

### 3. Comandi Speciali
Implementare i seguenti comandi:

#### `help`
Mostra lista comandi disponibili:
```
Comandi disponibili:
  help  - Mostra questo messaggio
  stats - Mostra statistiche server
  quit  - Disconnetti dal server
```

#### `stats`
Mostra statistiche server:
```
Statistiche Server:
  Connessioni totali: X
  Connessioni attive: Y
  Bytes ricevuti: Z
  Bytes inviati: W
  Uptime: N secondi
```

#### `quit` o `exit`
- [ ] Invia messaggio "Arrivederci!"
- [ ] Chiude connessione gracefully

### 4. Gestione Connessioni
- [ ] Inviare messaggio di benvenuto a ogni nuovo client
- [ ] Mostrare ID client (IP:porta)
- [ ] Logging connessione/disconnessione
- [ ] Tracking connessioni attive

### 5. Timeout
- [ ] Implementare timeout inattività (5 minuti)
- [ ] Avvisare client prima di disconnettere
- [ ] Chiudere connessione dopo timeout

### 6. Gestione Errori
- [ ] Catturare errore porta già in uso (EADDRINUSE)
- [ ] Gestire errori socket
- [ ] Logging errori con dettagli
- [ ] Graceful shutdown su SIGINT (CTRL+C)

### 7. Statistiche Server
Tracciare e aggiornare:
- [ ] Numero totale connessioni
- [ ] Numero connessioni attive
- [ ] Bytes totali ricevuti
- [ ] Bytes totali inviati
- [ ] Timestamp avvio server

## 🛠️ Requisiti Tecnici

### Server Structure
```javascript
const net = require('net');

// Statistiche
const stats = {
    totalConnections: 0,
    activeConnections: 0,
    totalBytesReceived: 0,
    totalBytesSent: 0,
    startTime: new Date()
};

// Crea server
const server = net.createServer((socket) => {
    // TODO: implementa logica
});

// Eventi server
server.on('listening', () => { /* ... */ });
server.on('error', (err) => { /* ... */ });
server.on('close', () => { /* ... */ });

// Avvia
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0');

// Graceful shutdown
process.on('SIGINT', () => { /* ... */ });
```

### Socket Events da Gestire
```javascript
socket.on('data', (data) => {
    // Ricevi dati
    // Processa comandi
    // Invia echo
});

socket.on('end', () => {
    // Client chiude connessione
});

socket.on('error', (err) => {
    // Gestisci errore
});

socket.on('timeout', () => {
    // Timeout inattività
});
```

## 📂 File da Creare

```
01-echo-server-tcp/
├── server.js       # Server implementation (MAIN)
├── client.js       # Client test (OPZIONALE)
├── package.json    # NPM config
└── README.md       # Documentazione
```

## 🧪 Come Testare

### Test 1: Avvio Server
```bash
# Avvia server
node server.js

# Output atteso:
# Server TCP in ascolto su 0.0.0.0:3000
# Test con: telnet localhost 3000
```

### Test 2: Connessione Client
```bash
# In altro terminal
telnet localhost 3000

# Output atteso:
# Benvenuto nell'Echo Server!
# Il tuo ID è: ::ffff:127.0.0.1:XXXXX
# Scrivi qualcosa...
```

### Test 3: Echo Functionality
```
> Hello
Echo: Hello

> Test message
Echo: Test message
```

### Test 4: Comandi
```
> help
Comandi disponibili:
  help  - Mostra questo messaggio
  stats - Mostra statistiche server
  quit  - Disconnetti dal server

> stats
Statistiche Server:
  Connessioni totali: 1
  Connessioni attive: 1
  ...

> quit
Arrivederci!
Connection closed by foreign host.
```

### Test 5: Multiple Connessioni
```bash
# Terminal 1
telnet localhost 3000

# Terminal 2
telnet localhost 3000

# Terminal 3
telnet localhost 3000

# Verifica che tutte le connessioni funzionino
# Controlla stats: connessioni attive = 3
```

### Test 6: Gestione Errori
```bash
# Test porta in uso
node server.js &
node server.js

# Output atteso:
# Errore: Porta 3000 già in uso!
```

### Test 7: Timeout
```bash
telnet localhost 3000
# Attendi 5 minuti senza scrivere

# Output atteso:
# Timeout - connessione chiusa per inattività
```

### Test 8: Graceful Shutdown
```bash
node server.js
# CTRL+C

# Output atteso:
# Ricevuto SIGINT - chiusura server...
# Statistiche finali: ...
# Server chiuso correttamente
```

## ✅ Criteri di Valutazione

### Funzionalità Base (40 punti)
- [ ] (10 pt) Server si avvia correttamente
- [ ] (10 pt) Echo funziona
- [ ] (10 pt) Gestisce multiple connessioni
- [ ] (10 pt) Comandi implementati (help, stats, quit)

### Gestione Errori (30 punti)
- [ ] (10 pt) Gestione EADDRINUSE
- [ ] (10 pt) Gestione errori socket
- [ ] (5 pt) Timeout implementato
- [ ] (5 pt) Graceful shutdown

### Statistiche (20 punti)
- [ ] (10 pt) Tracking statistiche corretto
- [ ] (5 pt) Comando stats funzionante
- [ ] (5 pt) Statistiche accurate

### Codice (10 punti)
- [ ] (3 pt) Codice organizzato
- [ ] (3 pt) Commenti appropriati
- [ ] (2 pt) Best practices Node.js
- [ ] (2 pt) No codice duplicato

**Totale: 100 punti**

## 💡 Suggerimenti

### 1. Client ID
```javascript
const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
console.log(`Client connesso: ${clientId}`);
```

### 2. Encoding
```javascript
// Ricevi stringhe invece di Buffer
socket.setEncoding('utf8');
```

### 3. Parse Command
```javascript
const command = data.toString().trim().toLowerCase();

if (command === 'help') {
    sendHelp(socket);
} else if (command === 'stats') {
    sendStats(socket);
} else if (command === 'quit' || command === 'exit') {
    socket.end('Arrivederci!\n');
} else {
    socket.write(`Echo: ${data}`);
}
```

### 4. Timeout
```javascript
socket.setTimeout(300000); // 5 minuti = 300000 ms

socket.on('timeout', () => {
    socket.write('Timeout - chiusura per inattività\n');
    socket.end();
});
```

### 5. Statistiche
```javascript
// Incrementa su ogni evento
stats.totalConnections++;
stats.totalBytesReceived += Buffer.byteLength(data);
stats.totalBytesSent += Buffer.byteLength(response);
```

### 6. Uptime
```javascript
const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
```

## 🆘 Problemi Comuni

### Echo duplicato
❌ Problema: Ogni messaggio appare due volte  
✅ Soluzione: Controlla di non emettere 'data' multipli  

### Connessione non accettata
❌ Problema: Client non riesce a connettersi  
✅ Soluzione: Verifica porta, firewall, indirizzo bind  

### Stats non aggiornate
❌ Problema: Statistiche sempre 0  
✅ Soluzione: Assicurati di incrementare nei posti giusti  

### Timeout non funziona
❌ Problema: Client non disconnesso dopo 5 min  
✅ Soluzione: Verifica `socket.setTimeout()` e handler  

## 📚 Risorse

- [Teoria Socket TCP](../../teoria/02-modulo-net-tcp.md)
- [Esempio Echo Server](../../esempi/01-tcp-echo-server/)
- [Node.js net docs](https://nodejs.org/api/net.html)

## 🎓 Sfide Extra (Opzionali)

### +10 pt: Client Interattivo
Crea `client.js` con readline per input interattivo

### +15 pt: Room Support
Implementa stanze (`/join room`, `/leave`)

### +20 pt: Logging su File
Salva log connessioni su file con timestamp

### +10 pt: Rate Limiting
Limita messaggi per client (max 10/sec)

---

**Tempo stimato: 1-2 ore**

Consulta la [soluzione](./soluzione/) solo dopo aver provato autonomamente!
