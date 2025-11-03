# 01 - Introduzione ai Socket e Protocolli di Rete

## Indice
- [Cos'è un Socket](#cosè-un-socket)
- [Modello Client-Server](#modello-client-server)
- [TCP vs UDP](#tcp-vs-udp)
- [Indirizzi IP e Porte](#indirizzi-ip-e-porte)
- [Socket in Node.js](#socket-in-nodejs)

---

## Cos'è un Socket

Un **socket** è un endpoint per la comunicazione di rete tra due processi, anche su macchine diverse.

### Analogia del Mondo Reale
Pensa al socket come a una **presa telefonica**:
- La presa (socket) permette la comunicazione
- Il numero di telefono è l'indirizzo IP + porta
- La chiamata è la connessione
- La conversazione è lo scambio di dati

### Definizione Tecnica
```
Socket = Indirizzo IP + Porta + Protocollo
```

**Esempio:**
```
192.168.1.100:3000 (TCP)
         ↓      ↓    ↓
         IP   Porta Protocollo
```

### Tipi di Socket

#### 1. Stream Socket (TCP)
- Connessione affidabile
- Garantisce ordine e consegna
- Comunicazione bidirezionale
- Come una **telefonata**

#### 2. Datagram Socket (UDP)
- Connectionless
- Non garantisce consegna
- Più veloce
- Come inviare **cartoline postali**

---

## Modello Client-Server

### Architettura Base

```
   CLIENT                    SERVER
     |                          |
     | 1. Richiesta connessione |
     |------------------------->|
     |                          | 2. Accetta connessione
     |                          |
     | 3. Invia dati            |
     |------------------------->|
     |                          | 4. Processa dati
     |                          |
     |    5. Risponde           |
     |<-------------------------|
     |                          |
     | 6. Chiude connessione    |
     |------------------------->|
     |                          |
```

### Ruoli

#### Server
```javascript
// Server = ascolta connessioni
const server = net.createServer();

server.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000');
});
```

**Caratteristiche:**
- ✅ Sempre in ascolto
- ✅ Gestisce multiple connessioni
- ✅ Indirizzo IP fisso (o dinamico con DNS)
- ✅ Fornisce servizi

#### Client
```javascript
// Client = inizia connessione
const client = net.connect(3000, 'localhost', () => {
    console.log('Connesso al server!');
});
```

**Caratteristiche:**
- ✅ Inizia la comunicazione
- ✅ Conosce indirizzo server
- ✅ Può disconnettersi quando vuole
- ✅ Richiede servizi

### Esempio Completo Minimal

**Server:**
```javascript
const net = require('net');

const server = net.createServer((socket) => {
    console.log('Client connesso!');
    
    socket.write('Benvenuto!\n');
    
    socket.on('data', (data) => {
        console.log('Ricevuto:', data.toString());
    });
});

server.listen(3000);
```

**Client:**
```javascript
const net = require('net');

const client = net.connect(3000, 'localhost');

client.on('data', (data) => {
    console.log('Server dice:', data.toString());
});

client.write('Ciao server!');
```

---

## TCP vs UDP

### TCP (Transmission Control Protocol)

#### Caratteristiche
```
✅ Connection-oriented    - Stabilisce connessione prima di inviare
✅ Reliable              - Garantisce consegna pacchetti
✅ Ordered               - Mantiene ordine messaggi
✅ Error checking        - Rileva errori di trasmissione
✅ Flow control          - Gestisce velocità trasmissione
✅ Congestion control    - Evita sovraccarico rete

⚠️ Overhead alto         - Headers più grandi
⚠️ Più lento             - Handshake e acknowledgments
```

#### Fasi Connessione TCP

**1. Three-Way Handshake (Apertura)**
```
CLIENT                    SERVER
  |                          |
  | SYN                      |
  |------------------------->|
  |                          |
  |        SYN-ACK           |
  |<-------------------------|
  |                          |
  | ACK                      |
  |------------------------->|
  |                          |
  | CONNESSIONE STABILITA    |
```

**2. Trasferimento Dati**
```
CLIENT                    SERVER
  |                          |
  | Data                     |
  |------------------------->|
  |                          |
  |        ACK               |
  |<-------------------------|
  |                          |
```

**3. Four-Way Handshake (Chiusura)**
```
CLIENT                    SERVER
  |                          |
  | FIN                      |
  |------------------------->|
  |                          |
  |        ACK               |
  |<-------------------------|
  |                          |
  |        FIN               |
  |<-------------------------|
  |                          |
  | ACK                      |
  |------------------------->|
  |                          |
  | CONNESSIONE CHIUSA       |
```

#### Use Cases TCP
```javascript
// HTTP/HTTPS - Web
const http = require('http');

// FTP - File transfer
// SSH - Remote shell
// SMTP - Email
// WebSocket - Real-time bidirectional
```

**Quando usare TCP:**
- ✅ Dati devono arrivare tutti
- ✅ Ordine è importante
- ✅ Connessione persistente
- ✅ Esempio: chat, file transfer, database

---

### UDP (User Datagram Protocol)

#### Caratteristiche
```
✅ Connectionless        - Nessun handshake
✅ Fast                  - Basso overhead
✅ Low latency           - Nessun acknowledgment
✅ Broadcast support     - Può inviare a molti

⚠️ Unreliable           - Pacchetti possono perdersi
⚠️ Unordered            - Possono arrivare fuori ordine
⚠️ No flow control      - Può sovraccaricare receiver
```

#### Funzionamento UDP

```
CLIENT                    SERVER
  |                          |
  | Datagram 1               |
  |------------------------->|
  | Datagram 2               |
  |------------------------->| (potrebbe arrivare prima di 1)
  | Datagram 3               |
  |----X  (perso)            |
  |                          |
  
Nessun acknowledgment, nessuna ritrasmissione!
```

#### Use Cases UDP
```javascript
// DNS - Domain Name System
const dgram = require('dgram');

// Streaming video/audio
// Online gaming
// VoIP (Voice over IP)
// IoT sensor data
```

**Quando usare UDP:**
- ✅ Velocità > affidabilità
- ✅ Dati in tempo reale
- ✅ Perdita dati tollerabile
- ✅ Esempio: streaming, gaming, DNS

---

### Confronto Diretto

| Aspetto | TCP | UDP |
|---------|-----|-----|
| **Connessione** | Richiede handshake | Nessuna connessione |
| **Affidabilità** | Garantita | Non garantita |
| **Ordine** | Garantito | Non garantito |
| **Velocità** | Più lento | Più veloce |
| **Overhead** | 20-60 bytes header | 8 bytes header |
| **Controllo flusso** | Sì | No |
| **Ritrasmissione** | Automatica | Manuale (se necessaria) |
| **Broadcast** | No | Sì |
| **Esempio app** | HTTP, FTP, Email | DNS, VoIP, Gaming |

### Esempio Pratico Differenze

**Scenario: Streaming Video**

**Con TCP:**
```
Frame 1 → Arriva ✓
Frame 2 → Perso, ritrasmesso... ritardo!
Frame 3 → In attesa di Frame 2
Frame 4 → In attesa di Frame 2
...
RISULTATO: Video si blocca, buffering
```

**Con UDP:**
```
Frame 1 → Arriva ✓
Frame 2 → Perso ✗
Frame 3 → Arriva ✓ (va avanti comunque)
Frame 4 → Arriva ✓
...
RISULTATO: Video continua, piccolo glitch
```

---

## Indirizzi IP e Porte

### Indirizzo IP

#### IPv4
```
192.168.1.100
 │   │  │  │
 └───┴──┴──┴─→ 4 ottetti (0-255)
 
Formato: X.X.X.X
Range: 0.0.0.0 - 255.255.255.255
```

#### Indirizzi Speciali
```javascript
'127.0.0.1'    // localhost - stesso computer
'0.0.0.0'      // Tutte le interfacce (server)
'192.168.x.x'  // Rete locale privata
'10.x.x.x'     // Rete locale privata
```

#### IPv6
```
2001:0db8:85a3:0000:0000:8a2e:0370:7334

Più lungo, più indirizzi disponibili
Formato esadecimale
```

### Porte

#### Numero Porta
```
Range: 0 - 65535

0 - 1023      → Well-known ports (riservate)
1024 - 49151  → Registered ports
49152 - 65535 → Dynamic/Private ports
```

#### Porte Comuni
```javascript
80    // HTTP
443   // HTTPS
22    // SSH
21    // FTP
25    // SMTP (Email)
53    // DNS
3306  // MySQL
5432  // PostgreSQL
27017 // MongoDB
3000  // Node.js dev server (convenzione)
```

### Esempio Binding

```javascript
const net = require('net');

// Server su porta specifica
server.listen(3000, 'localhost');
//              ↓        ↓
//            Porta   Indirizzo

// Equivalenti
server.listen(3000);                    // Default: localhost
server.listen(3000, '0.0.0.0');         // Tutte interfacce
server.listen({ port: 3000, host: '::' }); // IPv6
```

### Verifica Porte Disponibili

```bash
# Linux/Mac - verifica porta in uso
lsof -i :3000
netstat -an | grep 3000
ss -tuln | grep 3000  #Comando moderno da preferire a netstat

# Windows
netstat -ano | findstr :3000

# Trovare processo e killarlo
# Linux/Mac
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

---

## Socket in Node.js

### Moduli Core

Node.js fornisce due moduli principali:

#### 1. net - TCP Socket
```javascript
const net = require('net');

// Per comunicazione affidabile
// Stream-based
// Connection-oriented
```

#### 2. dgram - UDP Socket
```javascript
const dgram = require('dgram');

// Per comunicazione veloce
// Datagram-based
// Connectionless
```

### Architettura Event-Driven

Socket in Node.js sono **Event Emitters**: I socket non funzionano in modo sincrono (dove aspetteresti il completamento di un'operazione), ma in modo asincrono basato su eventi. Invece di bloccare l'esecuzione aspettando dati, registri dei listener che reagiscono quando succede qualcosa.

```javascript
const net = require('net');

const server = net.createServer((socket) => {
    // socket è un EventEmitter
    
    socket.on('data', (data) => {
        console.log('Dati ricevuti:', data);
    });
    
    socket.on('end', () => {
        console.log('Client disconnesso');
    });
    
    socket.on('error', (err) => {
        console.error('Errore:', err);
    });
});

server.on('listening', () => {
    console.log('Server in ascolto');
});

server.on('error', (err) => {
    console.error('Errore server:', err);
});

server.listen(3000);
```

### Stream Interface

Socket TCP sono **Duplex Streams**:

```javascript
const socket = net.connect(3000);

// Socket è readable
socket.on('data', (chunk) => {
    console.log(chunk);
});

// Socket è writable
socket.write('Hello');
socket.end('Goodbye');

// Può usare pipe
const fs = require('fs');
socket.pipe(fs.createWriteStream('output.txt'));
```

### Confronto con Altri Linguaggi

#### Python (socket)
```python
# Python - più verboso
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('localhost', 3000))
s.listen(5)
conn, addr = s.accept()
```

#### Node.js (net)
```javascript
// Node.js - più conciso, event-driven
const net = require('net');

const server = net.createServer((socket) => {
    // handle connection
});

server.listen(3000);
```

---

## Esempio Completo Introduttivo

### Echo Server TCP

```javascript
const net = require('net');

// Crea server che fa echo di tutto ciò che riceve
const server = net.createServer((socket) => {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    
    console.log(`[${clientId}] Connesso`);
    
    socket.setEncoding('utf8');
    
    socket.on('data', (data) => {
        console.log(`[${clientId}] Ricevuto: ${data}`);
        
        // Echo back
        socket.write(`Echo: ${data}`);
    });
    
    socket.on('end', () => {
        console.log(`[${clientId}] Disconnesso`);
    });
    
    socket.on('error', (err) => {
        console.error(`[${clientId}] Errore:`, err.message);
    });
});

server.on('error', (err) => {
    console.error('Errore server:', err);
    process.exit(1);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server TCP in ascolto sulla porta ${PORT}`);
    console.log(`Test con: telnet localhost ${PORT}`);
});
```

### Test con Telnet

```bash
# Terminal 1 - Avvia server
node echo-server.js

# Terminal 2 - Connetti con telnet
telnet localhost 3000

# Scrivi messaggi, vedrai echo
Hello
Echo: Hello

World
Echo: World

# CTRL+] poi "quit" per uscire
```

---

## Best Practices Iniziali

### 1. Sempre Gestire Errori
```javascript
// ❌ Male
server.listen(3000);

// ✅ Bene
server.listen(3000);
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('Porta già in uso!');
    }
    process.exit(1);
});
```

### 2. Cleanup su Chiusura
```javascript
process.on('SIGINT', () => {
    console.log('Chiusura server...');
    server.close(() => {
        console.log('Server chiuso');
        process.exit(0);
    });
});
```

### 3. Logging Informativo
```javascript
socket.on('data', (data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Data:`, data.toString());
});
```

### 4. Validazione Input
```javascript
socket.on('data', (data) => {
    const message = data.toString().trim();
    
    if (message.length === 0) {
        socket.write('Errore: messaggio vuoto\n');
        return;
    }
    
    if (message.length > 1024) {
        socket.write('Errore: messaggio troppo lungo\n');
        return;
    }
    
    // Processa messaggio valido
    processMessage(message);
});
```

---

## Riepilogo

### Concetti Chiave Appresi

✅ **Socket** = Endpoint comunicazione (IP + Porta + Protocollo)  
✅ **Client-Server** = Architettura base networking  
✅ **TCP** = Affidabile, ordinato, connection-oriented  
✅ **UDP** = Veloce, non affidabile, connectionless  
✅ **IP e Porte** = Indirizzamento rete  
✅ **Node.js** = Moduli `net` (TCP) e `dgram` (UDP)

### Prossimi Passi

1. Leggi [02-modulo-net-tcp.md](02-modulo-net-tcp.md) per approfondire TCP
2. Poi [03-modulo-dgram-udp.md](03-modulo-dgram-udp.md) per UDP
3. Prova gli [esempi pratici](../esempi/)
4. Completa gli [esercizi](../esercizi/)

---

**Hai completato l'introduzione! 🎉**

Ora hai le basi per comprendere la programmazione di rete in Node.js.
