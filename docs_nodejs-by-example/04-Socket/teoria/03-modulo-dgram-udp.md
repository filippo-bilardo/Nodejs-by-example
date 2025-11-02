# Il Modulo dgram - Socket UDP in Node.js

## Indice
1. [Introduzione al Modulo dgram](#introduzione)
2. [Creazione Socket UDP](#creazione-socket)
3. [Binding e Ascolto](#binding)
4. [Invio Datagram](#invio-datagram)
5. [Eventi Socket UDP](#eventi)
6. [Broadcasting UDP](#broadcasting)
7. [Multicast UDP](#multicast)
8. [Differenze TCP vs UDP](#tcp-vs-udp)
9. [Pattern Comuni](#pattern-comuni)
10. [Best Practices](#best-practices)

---

## 1. Introduzione al Modulo dgram {#introduzione}

Il modulo `dgram` fornisce un'implementazione di socket **UDP** (User Datagram Protocol) in Node.js.

### Import del Modulo

```javascript
const dgram = require('dgram');
```

### Caratteristiche UDP

**Vantaggi:**
- ✅ Più veloce di TCP (no handshake)
- ✅ Overhead minimo
- ✅ Supporta broadcast e multicast
- ✅ Ideale per streaming real-time

**Svantaggi:**
- ❌ Nessuna garanzia di consegna
- ❌ Nessun ordinamento pacchetti
- ❌ Nessun controllo errori
- ❌ Nessuna connessione persistente

### Quando Usare UDP

✅ **Buoni Casi d'Uso:**
- Video/audio streaming
- Gaming online
- DNS queries
- Service discovery
- Monitoring e metrics
- IoT sensors

❌ **Evitare UDP per:**
- Trasferimento file
- Transazioni finanziarie
- Messaggi critici
- Chat testuali (meglio TCP)

---

## 2. Creazione Socket UDP {#creazione-socket}

### dgram.createSocket()

```javascript
const socket = dgram.createSocket(type[, callback]);
```

**Parametri:**
- `type`: `'udp4'` (IPv4) o `'udp6'` (IPv6)
- `callback`: Listener per evento `'message'` (opzionale)

### Esempio Base

```javascript
const dgram = require('dgram');

// Socket IPv4
const socket = dgram.createSocket('udp4');

// Socket IPv6
const socket6 = dgram.createSocket('udp6');

// Con callback
const socketWithCb = dgram.createSocket('udp4', (msg, rinfo) => {
    console.log(`Ricevuto: ${msg} da ${rinfo.address}:${rinfo.port}`);
});
```

### Opzioni Avanzate

```javascript
const socket = dgram.createSocket({
    type: 'udp4',
    reuseAddr: true,           // Riusa indirizzo (utile per multicast)
    ipv6Only: false,           // Solo IPv6 se true
    recvBufferSize: 1024,      // Buffer ricezione
    sendBufferSize: 1024,      // Buffer invio
    lookup: dns.lookup         // Custom DNS resolver
});
```

---

## 3. Binding e Ascolto {#binding}

### socket.bind()

Prima di ricevere datagram, il socket deve essere **bound** a una porta.

```javascript
socket.bind([port][, address][, callback]);
```

**Parametri:**
- `port`: Porta (default: porta casuale)
- `address`: Indirizzo (default: 0.0.0.0)
- `callback`: Chiamata quando binding completo

### Esempi Binding

```javascript
// Porta specifica
socket.bind(3000);

// Porta e host
socket.bind(3000, 'localhost');

// Porta casuale (OS sceglie)
socket.bind();

// Con callback
socket.bind(3000, () => {
    console.log('Socket bound!');
    const address = socket.address();
    console.log(`Listening on ${address.address}:${address.port}`);
});

// Opzioni complete
socket.bind({
    port: 3000,
    address: '0.0.0.0',
    exclusive: false  // Permette riuso porta
});
```

### socket.address()

Restituisce informazioni sul socket bound:

```javascript
socket.bind(3000, () => {
    const addr = socket.address();
    console.log(addr);
    // {
    //   address: '0.0.0.0',
    //   family: 'IPv4',
    //   port: 3000
    // }
});
```

---

## 4. Invio Datagram {#invio-datagram}

### socket.send()

```javascript
socket.send(msg, [offset, length,] port [, address] [, callback]);
```

**Parametri:**
- `msg`: Buffer o stringa da inviare
- `offset`: Byte iniziale nel buffer (opzionale)
- `length`: Numero di byte (opzionale)
- `port`: Porta destinazione
- `address`: Indirizzo destinazione (default: localhost)
- `callback`: `(err)` chiamata dopo invio

### Esempi Invio

```javascript
const message = Buffer.from('Hello UDP!');

// Invio base
socket.send(message, 3000, 'localhost', (err) => {
    if (err) {
        console.error('Errore invio:', err);
    } else {
        console.log('Messaggio inviato!');
    }
});

// Invio con offset/length
const buffer = Buffer.from('0123456789');
socket.send(buffer, 2, 5, 3000, 'localhost');
// Invia solo "23456"

// Invio a IP remoto
socket.send(message, 3000, '192.168.1.100');

// Invio broadcast
socket.setBroadcast(true);
socket.send(message, 3000, '255.255.255.255');

// Invio array di buffer
const chunks = [
    Buffer.from('Hello '),
    Buffer.from('World!')
];
socket.send(chunks, 3000, 'localhost');
```

### Esempio Echo Client

```javascript
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

const message = Buffer.from('Echo this message');

client.send(message, 3000, 'localhost', (err) => {
    if (err) {
        console.error('Send error:', err);
        client.close();
        return;
    }
    
    console.log('Message sent, waiting for echo...');
});

client.on('message', (msg, rinfo) => {
    console.log(`Echo from ${rinfo.address}:${rinfo.port}: ${msg}`);
    client.close();
});
```

---

## 5. Eventi Socket UDP {#eventi}

### Evento: 'message'

Emesso quando ricevuto un datagram.

```javascript
socket.on('message', (msg, rinfo) => {
    console.log(`Ricevuto: ${msg}`);
    console.log(`Da: ${rinfo.address}:${rinfo.port}`);
    console.log(`Dimensione: ${rinfo.size} bytes`);
});
```

**Parametri:**
- `msg`: Buffer con i dati
- `rinfo`: Oggetto con informazioni mittente
  - `address`: Indirizzo IP mittente
  - `port`: Porta mittente
  - `family`: 'IPv4' o 'IPv6'
  - `size`: Dimensione datagram in bytes

### Evento: 'listening'

Emesso quando socket pronto per ricevere.

```javascript
socket.on('listening', () => {
    const address = socket.address();
    console.log(`Socket listening ${address.address}:${address.port}`);
});

socket.bind(3000);
```

### Evento: 'error'

Emesso in caso di errore.

```javascript
socket.on('error', (err) => {
    console.error('Socket error:', err);
    socket.close();
});
```

**Errori Comuni:**

```javascript
socket.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('Porta già in uso!');
    } else if (err.code === 'EACCES') {
        console.error('Permessi insufficienti (porta < 1024)');
    } else if (err.code === 'EADDRNOTAVAIL') {
        console.error('Indirizzo non disponibile');
    } else {
        console.error('Errore:', err.message);
    }
});
```

### Evento: 'close'

Emesso quando socket chiuso.

```javascript
socket.on('close', () => {
    console.log('Socket chiuso');
});

// Chiudi socket
socket.close(() => {
    console.log('Socket chiuso con successo');
});
```

### Evento: 'connect'

Emesso dopo `socket.connect()` (UDP "connesso").

```javascript
socket.connect(3000, 'localhost', () => {
    console.log('Socket connected');
});

socket.on('connect', () => {
    // Ora send() non richiede address/port
    socket.send('Hello');
});
```

### Ciclo Vita Socket UDP

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  createSocket()                                  │
│       ↓                                          │
│  bind() ────→ listening event                    │
│       ↓                                          │
│  ┌────────────────────┐                          │
│  │  Ricezione Loop    │                          │
│  │                    │                          │
│  │  message event ←───┼─── Datagram in arrivo    │
│  │       ↓            │                          │
│  │  Elaborazione      │                          │
│  │       ↓            │                          │
│  │  send() ───────────┼──→ Datagram in uscita    │
│  │       ↓            │                          │
│  └────────────────────┘                          │
│       ↓                                          │
│  close() ────→ close event                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 6. Broadcasting UDP {#broadcasting}

Il **broadcast** permette di inviare datagram a tutti gli host su una rete locale.

### Abilitare Broadcasting

```javascript
socket.setBroadcast(true);
```

### Indirizzi Broadcast

- **Broadcast diretto**: `192.168.1.255` (ultima subnet)
- **Broadcast limitato**: `255.255.255.255` (solo rete locale)

### Esempio Server Broadcast

```javascript
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('listening', () => {
    server.setBroadcast(true);
    
    const message = Buffer.from('Broadcast message!');
    
    // Invia broadcast ogni 5 secondi
    setInterval(() => {
        server.send(message, 3000, '255.255.255.255', (err) => {
            if (err) {
                console.error('Broadcast error:', err);
            } else {
                console.log('Broadcast sent');
            }
        });
    }, 5000);
});

server.bind(3001); // Porta diversa per sender
```

### Esempio Client Broadcast

```javascript
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

client.on('message', (msg, rinfo) => {
    console.log(`Broadcast ricevuto da ${rinfo.address}: ${msg}`);
});

client.on('listening', () => {
    const address = client.address();
    console.log(`In ascolto per broadcast su ${address.port}`);
});

// Bind alla porta broadcast
client.bind(3000);
```

### Caso d'Uso: Service Discovery

```javascript
// Service Announcer
const dgram = require('dgram');
const announcer = dgram.createSocket('udp4');

announcer.on('listening', () => {
    announcer.setBroadcast(true);
    
    const serviceInfo = JSON.stringify({
        service: 'my-api',
        host: '192.168.1.10',
        port: 8080,
        version: '1.0.0'
    });
    
    // Annuncia servizio ogni 30 secondi
    setInterval(() => {
        announcer.send(
            Buffer.from(serviceInfo),
            9999,
            '255.255.255.255'
        );
    }, 30000);
});

announcer.bind();
```

```javascript
// Service Discoverer
const dgram = require('dgram');
const discoverer = dgram.createSocket('udp4');

const services = new Map();

discoverer.on('message', (msg, rinfo) => {
    try {
        const service = JSON.parse(msg.toString());
        services.set(service.service, service);
        console.log('Servizio scoperto:', service);
    } catch (err) {
        console.error('Invalid service announcement');
    }
});

discoverer.bind(9999);
```

---

## 7. Multicast UDP {#multicast}

Il **multicast** permette di inviare datagram a un gruppo di host interessati.

### Indirizzi Multicast

- Range IPv4: `224.0.0.0` - `239.255.255.255`
- Esempi comuni:
  - `224.0.0.1`: Tutti gli host sulla subnet
  - `224.0.0.2`: Tutti i router sulla subnet
  - `239.x.x.x`: Multicast locale organizzazione

### socket.addMembership()

Unisciti a un gruppo multicast:

```javascript
socket.addMembership(multicastAddress[, multicastInterface]);
```

### socket.dropMembership()

Esci da un gruppo multicast:

```javascript
socket.dropMembership(multicastAddress[, multicastInterface]);
```

### Esempio Multicast Sender

```javascript
const dgram = require('dgram');
const sender = dgram.createSocket('udp4');

const MULTICAST_ADDR = '239.255.0.1';
const PORT = 3000;

sender.on('listening', () => {
    const message = Buffer.from('Multicast message!');
    
    setInterval(() => {
        sender.send(message, PORT, MULTICAST_ADDR, (err) => {
            if (err) {
                console.error('Send error:', err);
            } else {
                console.log('Multicast sent');
            }
        });
    }, 2000);
});

sender.bind();
```

### Esempio Multicast Receiver

```javascript
const dgram = require('dgram');
const receiver = dgram.createSocket({ type: 'udp4', reuseAddr: true });

const MULTICAST_ADDR = '239.255.0.1';
const PORT = 3000;

receiver.on('message', (msg, rinfo) => {
    console.log(`Multicast da ${rinfo.address}: ${msg}`);
});

receiver.on('listening', () => {
    // Unisciti al gruppo multicast
    receiver.addMembership(MULTICAST_ADDR);
    console.log(`Joined multicast group ${MULTICAST_ADDR}`);
});

receiver.bind(PORT);
```

### Multicast con Interfaccia Specifica

```javascript
const os = require('os');

// Ottieni interfacce di rete
const interfaces = os.networkInterfaces();
const eth0 = interfaces.eth0.find(i => i.family === 'IPv4');

// Join su interfaccia specifica
receiver.addMembership(MULTICAST_ADDR, eth0.address);
```

### Opzioni Multicast

```javascript
// TTL (Time To Live) - quanti router attraversare
socket.setMulticastTTL(128);

// Loopback - ricevi i tuoi stessi multicast
socket.setMulticastLoopback(true);

// Interfaccia multicast
socket.setMulticastInterface('192.168.1.10');
```

### Caso d'Uso: Chat Room Multicast

```javascript
const dgram = require('dgram');
const readline = require('readline');

const MULTICAST_ADDR = '239.255.0.1';
const PORT = 3000;

const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

// Ricezione messaggi
socket.on('message', (msg, rinfo) => {
    console.log(`\n[${rinfo.address}] ${msg}`);
    rl.prompt(true);
});

socket.on('listening', () => {
    socket.addMembership(MULTICAST_ADDR);
    console.log('Entrato nella chat multicast');
    console.log('Scrivi messaggi e premi INVIO\n');
});

socket.bind(PORT);

// Input utente
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

rl.prompt();

rl.on('line', (line) => {
    const message = Buffer.from(line);
    socket.send(message, PORT, MULTICAST_ADDR);
    rl.prompt();
});
```

---

## 8. Differenze TCP vs UDP {#tcp-vs-udp}

### Tabella Comparativa

| Caratteristica | TCP (net) | UDP (dgram) |
|----------------|-----------|-------------|
| **Connessione** | Orientato alla connessione | Senza connessione |
| **Affidabilità** | Garantita | Non garantita |
| **Ordinamento** | Garantito | Non garantito |
| **Controllo errori** | Checksum + ACK | Solo checksum |
| **Velocità** | Più lento | Più veloce |
| **Overhead** | Alto (headers, ACK) | Basso |
| **Streaming** | Byte stream continuo | Datagram discreti |
| **Broadcast** | ❌ No | ✅ Sì |
| **Multicast** | ❌ No | ✅ Sì |
| **Use case** | File transfer, HTTP, chat | Streaming, gaming, DNS |

### Quando Usare TCP

```javascript
// ✅ Trasferimento file - SERVE AFFIDABILITÀ
const net = require('net');
const server = net.createServer((socket) => {
    const fileStream = fs.createReadStream('largefile.zip');
    fileStream.pipe(socket);
});
```

### Quando Usare UDP

```javascript
// ✅ Gaming - SERVE VELOCITÀ
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

// Invia posizione player ogni 50ms
setInterval(() => {
    const position = JSON.stringify({ x: 100, y: 200 });
    socket.send(Buffer.from(position), 3000, 'game-server.com');
}, 50);
```

### Dimensione Pacchetti

**TCP:**
- Gestisce automaticamente frammentazione
- Application vede stream continuo
- Può inviare dati di qualsiasi dimensione

**UDP:**
- Dimensione massima datagram: ~65KB (teorico)
- **Raccomandato**: < 1500 bytes (MTU Ethernet)
- Frammentazione IP possibile ma sconsigliata
- Datagram > MTU può essere perso

```javascript
// ❌ EVITARE - datagram troppo grande
const hugeDatagram = Buffer.alloc(60000);
socket.send(hugeDatagram, 3000, 'localhost'); // Rischio perdita

// ✅ RACCOMANDATO - datagram piccoli
const smallDatagram = Buffer.from('Small message');
socket.send(smallDatagram, 3000, 'localhost');
```

---

## 9. Pattern Comuni {#pattern-comuni}

### Pattern 1: Request-Response

Anche UDP può implementare request-response con ID messaggi:

```javascript
// Client
const dgram = require('dgram');
const client = dgram.createSocket('udp4');

let requestId = 0;
const pendingRequests = new Map();

function sendRequest(data, callback) {
    const id = ++requestId;
    const request = JSON.stringify({ id, data });
    
    pendingRequests.set(id, { callback, timestamp: Date.now() });
    
    client.send(Buffer.from(request), 3000, 'localhost');
    
    // Timeout dopo 5 secondi
    setTimeout(() => {
        if (pendingRequests.has(id)) {
            pendingRequests.delete(id);
            callback(new Error('Request timeout'));
        }
    }, 5000);
}

client.on('message', (msg) => {
    const response = JSON.parse(msg.toString());
    const pending = pendingRequests.get(response.id);
    
    if (pending) {
        pendingRequests.delete(response.id);
        pending.callback(null, response.data);
    }
});

// Uso
sendRequest('Hello', (err, result) => {
    if (err) {
        console.error('Errore:', err);
    } else {
        console.log('Risposta:', result);
    }
});
```

```javascript
// Server
const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
    const request = JSON.parse(msg.toString());
    
    // Processa request
    const responseData = `Echo: ${request.data}`;
    
    // Invia response con stesso ID
    const response = JSON.stringify({
        id: request.id,
        data: responseData
    });
    
    server.send(Buffer.from(response), rinfo.port, rinfo.address);
});

server.bind(3000);
```

### Pattern 2: Heartbeat

Verifica che peer sia ancora vivo:

```javascript
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

const HEARTBEAT_INTERVAL = 1000; // 1 secondo
const TIMEOUT = 3000; // 3 secondi

let lastHeartbeat = Date.now();

// Invia heartbeat
setInterval(() => {
    const heartbeat = Buffer.from('HEARTBEAT');
    socket.send(heartbeat, 3000, 'remote-host');
}, HEARTBEAT_INTERVAL);

// Ricevi heartbeat
socket.on('message', (msg) => {
    if (msg.toString() === 'HEARTBEAT') {
        lastHeartbeat = Date.now();
    }
});

// Verifica timeout
setInterval(() => {
    const timeSinceLastHeartbeat = Date.now() - lastHeartbeat;
    
    if (timeSinceLastHeartbeat > TIMEOUT) {
        console.error('Connection lost!');
        // Riconnetti o notifica
    }
}, 1000);

socket.bind();
```

### Pattern 3: Reliable UDP (ARQ)

Implementa ACK e ritrasmissione:

```javascript
class ReliableUDP {
    constructor(socket) {
        this.socket = socket;
        this.sequenceNumber = 0;
        this.pending = new Map();
        this.RETRANSMIT_TIMEOUT = 1000;
        this.MAX_RETRIES = 3;
        
        this.socket.on('message', (msg) => this.handleMessage(msg));
    }
    
    send(data, port, address, callback) {
        const seq = ++this.sequenceNumber;
        const packet = JSON.stringify({ seq, data });
        
        let retries = 0;
        
        const sendPacket = () => {
            this.socket.send(Buffer.from(packet), port, address);
            
            const timer = setTimeout(() => {
                if (retries++ < this.MAX_RETRIES) {
                    console.log(`Ritrasmissione ${seq} (tentativo ${retries})`);
                    sendPacket();
                } else {
                    this.pending.delete(seq);
                    callback(new Error('Max retries exceeded'));
                }
            }, this.RETRANSMIT_TIMEOUT);
            
            this.pending.set(seq, { timer, callback });
        };
        
        sendPacket();
    }
    
    handleMessage(msg) {
        const message = JSON.parse(msg.toString());
        
        if (message.type === 'ACK') {
            const pending = this.pending.get(message.seq);
            if (pending) {
                clearTimeout(pending.timer);
                this.pending.delete(message.seq);
                pending.callback(null);
            }
        }
    }
    
    sendAck(seq, port, address) {
        const ack = JSON.stringify({ type: 'ACK', seq });
        this.socket.send(Buffer.from(ack), port, address);
    }
}

// Uso
const socket = dgram.createSocket('udp4');
const reliable = new ReliableUDP(socket);

reliable.send('Important message', 3000, 'localhost', (err) => {
    if (err) {
        console.error('Invio fallito:', err);
    } else {
        console.log('Messaggio confermato!');
    }
});
```

---

## 10. Best Practices {#best-practices}

### 1. Dimensione Datagram

```javascript
// ✅ BEST: < 1500 bytes (MTU Ethernet)
const MAX_DATAGRAM_SIZE = 1400; // Margine sicurezza

function sendLargeData(data, port, address) {
    const chunks = [];
    
    for (let i = 0; i < data.length; i += MAX_DATAGRAM_SIZE) {
        chunks.push(data.slice(i, i + MAX_DATAGRAM_SIZE));
    }
    
    chunks.forEach((chunk, index) => {
        const packet = JSON.stringify({
            index,
            total: chunks.length,
            data: chunk.toString('base64')
        });
        
        socket.send(Buffer.from(packet), port, address);
    });
}
```

### 2. Gestione Errori

```javascript
const socket = dgram.createSocket('udp4');

// ✅ Sempre gestire errori
socket.on('error', (err) => {
    console.error('Socket error:', err);
    
    // Non chiudere automaticamente - potrebbe essere temporaneo
    if (err.code === 'EADDRINUSE') {
        // Porta in uso - critico
        socket.close();
    }
});

// ✅ Callback send
socket.send(message, port, host, (err) => {
    if (err) {
        console.error('Send failed:', err);
        // Retry o notifica
    }
});
```

### 3. Validazione Dati

```javascript
// ✅ Sempre validare dati ricevuti
socket.on('message', (msg, rinfo) => {
    try {
        const data = JSON.parse(msg.toString());
        
        // Validazione
        if (!data.type || typeof data.payload === 'undefined') {
            console.error('Invalid message format');
            return;
        }
        
        // Processa
        handleMessage(data);
        
    } catch (err) {
        console.error('Invalid JSON:', err);
        return;
    }
});
```

### 4. Rate Limiting

```javascript
class RateLimiter {
    constructor(maxRate = 100) { // 100 msg/sec
        this.maxRate = maxRate;
        this.tokens = maxRate;
        this.lastRefill = Date.now();
    }
    
    tryConsume() {
        this.refill();
        
        if (this.tokens >= 1) {
            this.tokens--;
            return true;
        }
        
        return false;
    }
    
    refill() {
        const now = Date.now();
        const elapsed = (now - this.lastRefill) / 1000;
        this.tokens = Math.min(
            this.maxRate,
            this.tokens + elapsed * this.maxRate
        );
        this.lastRefill = now;
    }
}

const limiter = new RateLimiter(100);

socket.on('message', (msg, rinfo) => {
    if (!limiter.tryConsume()) {
        console.warn(`Rate limit exceeded from ${rinfo.address}`);
        return;
    }
    
    // Processa messaggio
});
```

### 5. Logging

```javascript
// ✅ Log dettagliato per debugging UDP
socket.on('message', (msg, rinfo) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'message_received',
        from: `${rinfo.address}:${rinfo.port}`,
        size: rinfo.size,
        family: rinfo.family
    }));
});

socket.send(msg, port, address, (err) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: 'message_sent',
        to: `${address}:${port}`,
        size: msg.length,
        error: err ? err.message : null
    }));
});
```

### 6. Cleanup Risorse

```javascript
// ✅ Cleanup completo
function shutdown() {
    console.log('Shutting down...');
    
    // Stop heartbeat
    clearInterval(heartbeatTimer);
    
    // Clear pending requests
    pendingRequests.forEach((req) => {
        clearTimeout(req.timer);
        req.callback(new Error('Shutdown'));
    });
    pendingRequests.clear();
    
    // Chiudi socket
    socket.close(() => {
        console.log('Socket closed');
        process.exit(0);
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

### 7. Testing

```javascript
// ✅ Test con mock
const EventEmitter = require('events');

class MockDgramSocket extends EventEmitter {
    constructor() {
        super();
        this.sent = [];
    }
    
    send(msg, port, address, callback) {
        this.sent.push({ msg, port, address });
        if (callback) callback();
    }
    
    bind(port) {
        this.emit('listening');
    }
    
    close() {
        this.emit('close');
    }
    
    // Simula ricezione
    mockReceive(msg, rinfo) {
        this.emit('message', msg, rinfo);
    }
}

// Test
const mockSocket = new MockDgramSocket();
mockSocket.on('message', (msg) => {
    console.log('Received:', msg.toString());
});

mockSocket.mockReceive(Buffer.from('test'), {
    address: '127.0.0.1',
    port: 3000
});

console.log('Sent messages:', mockSocket.sent);
```

---

## Riepilogo

Il modulo `dgram` fornisce socket UDP per comunicazione veloce senza connessione:

✅ **Usa UDP per:**
- Streaming real-time (video, audio, gaming)
- Service discovery e heartbeat
- Broadcasting e multicast
- Applicazioni dove velocità > affidabilità

❌ **Evita UDP per:**
- Trasferimento file
- Messaggi critici
- Applicazioni che richiedono ordine garantito

**Best Practices:**
- Datagram < 1500 bytes
- Implementa ACK se serve affidabilità
- Valida sempre dati ricevuti
- Gestisci errori e timeout
- Log dettagliato per debugging

**Prossimi Step:**
- [Pattern e Best Practices](./04-pattern-best-practices.md)
- [Protocolli Applicativi](./05-protocolli-applicativi.md)
- [Esempi UDP](../esempi/04-udp-echo-server/)
