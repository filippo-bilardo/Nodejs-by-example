# Modulo 4: Comunicazione di Rete con Socket TCP/UDP

In questo modulo esploreremo la programmazione di rete a basso livello utilizzando i protocolli TCP e UDP attraverso i moduli core `net` e `dgram` di Node.js. Imparerai a creare server e client robusti per applicazioni real-time, file transfer, chat system e protocolli custom.

## Obiettivi di Apprendimento
- Comprendere le differenze fondamentali tra TCP e UDP
- Implementare server e client TCP con il modulo `net`
- Gestire comunicazioni UDP con broadcast e multicast usando `dgram`
- Progettare protocolli applicativi custom con framing e serializzazione
- Implementare pattern di comunicazione (request-response, pub-sub, heartbeat)
- Gestire connessioni persistenti con keepalive e rilevamento timeout
- Trasferire file in modo efficiente con streaming e checksum
- Applicare best practices per gestione errori, backpressure e sicurezza

## Argomenti Teorici Collegati
- [Introduzione a Socket e Protocolli](./teoria/01-introduzione-socket-protocolli.md)
- [Modulo Net - Comunicazione TCP](./teoria/02-modulo-net-tcp.md)
- [Modulo Dgram - Comunicazione UDP](./teoria/03-modulo-dgram-udp.md)
- [Pattern e Best Practices](./teoria/04-pattern-best-practices.md)
- [Protocolli Applicativi Custom](./teoria/05-protocolli-applicativi.md)

## Esercizi Pratici

### Esercizio 4.1: Echo Server TCP - Fondamenti Socket
Il primo passo per comprendere la comunicazione TCP: un server che riflette i messaggi ricevuti ai client.

**💡 Concetti Chiave:**
- Creazione di server TCP con `net.createServer()`
- Eventi socket: `data`, `end`, `error`, `close`
- Gestione buffer e encoding delle stringhe
- Scrittura dati con `socket.write()`

```javascript
// Esempio: Echo Server Base
const net = require('net');

const server = net.createServer((socket) => {
  console.log('✅ Client connesso');
  
  socket.on('data', (data) => {
    const message = data.toString().trim();
    console.log(`📨 Ricevuto: ${message}`);
    
    // Echo del messaggio
    socket.write(`ECHO: ${message}\n`);
  });
  
  socket.on('end', () => {
    console.log('👋 Client disconnesso');
  });
});

server.listen(3000, () => {
  console.log('🚀 Server in ascolto sulla porta 3000');
});
```

**Casi d'uso reali:**
- Testing di connessioni di rete
- Debugging di protocolli TCP
- Benchmark di throughput e latenza
- Validazione di firewall e configurazioni di rete

**🎯 Esercizio Pratico:** [Echo Server TCP](./esercizi/01-echo-server-tcp/) - Implementa un echo server completo con statistiche, timeout e comandi speciali.

### Esercizio 4.2: Chat Server Multi-Client TCP
Sistema di chat con stanze, username e broadcasting dei messaggi.

**💡 Architettura:**
- Gestione multi-client con Map/Set
- Broadcasting a tutti i client connessi
- Sistema di stanze (rooms) per segmentazione utenti
- Comandi speciali (`/nick`, `/join`, `/leave`, `/msg`)
- Notifiche di ingresso/uscita utenti

```javascript
// Esempio: Broadcast a tutti i client
const clients = new Map();

function broadcast(message, excludeSocket = null) {
  clients.forEach((clientInfo, socket) => {
    if (socket !== excludeSocket && !socket.destroyed) {
      socket.write(message + '\n');
    }
  });
}

// Quando un utente invia un messaggio
socket.on('data', (data) => {
  const message = data.toString().trim();
  const username = clients.get(socket).username;
  
  broadcast(`[${username}]: ${message}`, socket);
});
```

**Pattern implementati:**
- Observer Pattern per eventi di chat
- Command Pattern per gestione comandi
- Publish-Subscribe per broadcasting
- State Management per tracking utenti e stanze

**🎯 Esercizio Pratico:** [Chat TCP Multi-Client](./esercizi/02-chat-tcp/) - Sviluppa un sistema di chat completo con rooms, messaggi privati e persistenza.

### Esercizio 4.3: File Transfer TCP con Checksum
Trasferimento affidabile di file con verifica integrità e progress tracking.

**💡 Componenti Chiave:**
- Protocollo custom JSON per comandi (LIST, DOWNLOAD, UPLOAD, DELETE)
- Streaming file con `fs.createReadStream()` e `fs.createWriteStream()`
- Calcolo checksum MD5 per verifica integrità
- Progress tracking durante upload/download
- Gestione errori e validazione percorsi

```javascript
// Esempio: Download file con checksum
const crypto = require('crypto');
const fs = require('fs');

function calculateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// Server invia file con metadata
async function sendFile(socket, filePath) {
  const stats = await fs.promises.stat(filePath);
  const checksum = await calculateChecksum(filePath);
  
  // Invia metadata
  socket.write(JSON.stringify({
    type: 'DOWNLOAD_START',
    filename: path.basename(filePath),
    size: stats.size,
    checksum
  }) + '\n');
  
  // Stream del file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(socket, { end: false });
  
  fileStream.on('end', () => {
    socket.write(JSON.stringify({ type: 'DOWNLOAD_END' }) + '\n');
  });
}
```

**Sicurezza implementata:**
- Validazione percorsi (prevenzione directory traversal)
- Verifica checksum prima e dopo trasferimento
- Eliminazione automatica file corrotti
- Gestione permissions e accesso file

**🎯 Esercizio Pratico:** [File Transfer TCP](./esercizi/03-file-transfer/) - Costruisci un sistema di file sharing con resume capability e compressione.

### Esercizio 4.4: Echo Server UDP - Datagram Protocol
Comunicazione connectionless con UDP per applicazioni real-time.

**💡 Differenze TCP vs UDP:**
- **TCP**: Connessione persistente, ordinato, affidabile, overhead maggiore
- **UDP**: Connectionless, non ordinato, best-effort, overhead minimo
- **Quando usare UDP**: Gaming, VoIP, video streaming, DNS, IoT sensors

```javascript
// Esempio: UDP Echo Server
const dgram = require('dgram');

const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  console.log(`📨 Da ${rinfo.address}:${rinfo.port} - ${msg}`);
  
  // Echo back al client
  server.send(msg, rinfo.port, rinfo.address, (err) => {
    if (err) console.error('⚠️  Errore invio:', err);
    else console.log('✅ Echo inviato');
  });
});

server.on('listening', () => {
  const address = server.address();
  console.log(`🚀 Server UDP su ${address.address}:${address.port}`);
});

server.bind(9999); // Porta UDP
```

**Caratteristiche UDP:**
- Nessun handshake (SYN/ACK)
- Packet loss possibile (no retransmission automatica)
- Ordine pacchetti non garantito
- Latenza minima
- Ottimo per dati time-sensitive

**🎯 Esercizio Pratico:** [Echo Server UDP](./esercizi/04-echo-server-udp/) - Implementa un echo server UDP con reliability layer custom.

### Esercizio 4.5: UDP Broadcast - Service Discovery
Broadcasting di annunci servizio sulla rete locale.

**💡 Broadcasting Concepts:**
- Indirizzo broadcast: `255.255.255.255` (tutti i dispositivi)
- Abilitazione broadcast con `socket.setBroadcast(true)`
- Uso tipico: service discovery, annunci presence
- Limitato alla rete locale (non attraversa router)

```javascript
// Esempio: Service Announcement Broadcaster
const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

socket.bind(() => {
  socket.setBroadcast(true);
  
  setInterval(() => {
    const announcement = JSON.stringify({
      service: 'my-app-api',
      host: os.hostname(),
      port: 3000,
      timestamp: Date.now()
    });
    
    socket.send(announcement, 9999, '255.255.255.255', (err) => {
      if (!err) console.log('📡 Broadcast inviato');
    });
  }, 5000); // Ogni 5 secondi
});
```

**Applicazioni reali:**
- Zero-configuration networking (Bonjour/Avahi)
- Service discovery in microservizi
- Peer-to-peer discovery
- Gaming LAN party setup
- IoT device discovery

### Esercizio 4.6: UDP Multicast - Group Communication
Comunicazione efficiente a gruppi di destinatari con multicast.

**💡 Multicast vs Broadcast:**
- **Broadcast**: Tutti ricevono (sovraccarico rete)
- **Multicast**: Solo membri del gruppo ricevono
- Indirizzi multicast: `224.0.0.0` - `239.255.255.255`
- Join gruppo con `socket.addMembership(multicastAddress)`

```javascript
// Esempio: Multicast Group Receiver
const dgram = require('dgram');
const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

const MULTICAST_ADDR = '239.255.0.1';
const PORT = 41234;

socket.on('message', (msg, rinfo) => {
  const data = JSON.parse(msg.toString());
  console.log(`📨 Multicast ricevuto:`, data);
});

socket.on('listening', () => {
  socket.addMembership(MULTICAST_ADDR);
  console.log(`✅ Unito al gruppo multicast ${MULTICAST_ADDR}`);
});

socket.bind(PORT);
```

**Use cases:**
- Video streaming IPTV
- Real-time market data distribution
- Cluster synchronization
- Sensor network data collection
- Multiplayer game state updates

### Esercizio 4.7: Protocollo Binario Custom
Implementazione di un protocollo applicativo con header fisso e payload binario.

**💡 Design Protocollo:**
```
[Magic: 2 bytes][Version: 1 byte][Type: 1 byte][Length: 4 bytes][Payload: N bytes][Checksum: 4 bytes]

Esempio:
0x4D50          - Magic number "MP"
0x01            - Protocol version 1
0x10            - Message type (REQUEST)
0x0000001A      - Payload length (26 bytes)
{...JSON...}    - Payload data
0x8F3A9BC2      - MD5 checksum (primi 4 bytes)
```

**Vantaggi protocolli binari:**
- Efficienza spazio (meno overhead che JSON/XML)
- Parsing veloce e deterministico
- Validazione robusta con checksum
- Versioning esplicito del protocollo
- Type safety a livello di messaggio

```javascript
// Esempio: Creazione pacchetto binario
function createPacket(type, payload) {
  const payloadBuffer = Buffer.from(JSON.stringify(payload));
  const packet = Buffer.allocUnsafe(12 + payloadBuffer.length);
  
  packet.writeUInt16BE(0x4D50, 0);              // Magic
  packet.writeUInt8(0x01, 2);                   // Version
  packet.writeUInt8(type, 3);                   // Type
  packet.writeUInt32BE(payloadBuffer.length, 4); // Length
  payloadBuffer.copy(packet, 8);                // Payload
  
  // Checksum (MD5 primi 4 bytes)
  const hash = crypto.createHash('md5').update(payloadBuffer).digest();
  packet.writeUInt32BE(hash.readUInt32BE(0), 8 + payloadBuffer.length);
  
  return packet;
}
```

**🎯 Esercizio Pratico:** Progetta un protocollo binario per una specifica applicazione (es. IoT sensor data, gaming protocol).

### Esercizio 4.8: Heartbeat e Keepalive
Sistema di rilevamento connessioni morte con heartbeat periodico.

**💡 Problema delle "Half-Open Connections":**
- Client crash senza chiudere socket
- Firewall che droppano connessioni idle
- Network partitioning
- Server che mantengono risorse per connessioni morte

**Soluzione Heartbeat:**
```javascript
// Server invia HEARTBEAT ogni 10s
// Client deve rispondere con HEARTBEAT_ACK entro 30s
// Altrimenti: timeout → chiusura connessione

class HeartbeatManager {
  constructor(socket, interval = 10000, timeout = 30000) {
    this.socket = socket;
    this.lastHeartbeat = Date.now();
    
    // Invia heartbeat periodicamente
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, interval);
    
    // Controlla timeout
    this.timeoutCheck = setInterval(() => {
      if (Date.now() - this.lastHeartbeat > timeout) {
        console.log('⚠️  Heartbeat timeout - chiusura connessione');
        this.cleanup();
        socket.destroy();
      }
    }, 5000);
  }
  
  sendHeartbeat() {
    this.socket.write(JSON.stringify({ type: 'HEARTBEAT' }) + '\n');
  }
  
  onHeartbeatAck() {
    this.lastHeartbeat = Date.now();
  }
  
  cleanup() {
    clearInterval(this.heartbeatInterval);
    clearInterval(this.timeoutCheck);
  }
}
```

**Pattern alternativi:**
- TCP Keepalive (OS-level, configurabile con `socket.setKeepAlive()`)
- Application-level ping/pong
- Activity-based timeout (reset su qualsiasi messaggio)

## Sfide Avanzate

### 🎯 Sfida 1: Proxy TCP con Load Balancing
Implementa un proxy TCP che:
- Accetta connessioni client sulla porta 8080
- Distribuisce richieste a un pool di backend servers
- Implementa round-robin o least-connections balancing
- Gestisce health checks dei backend
- Supporta connection pooling per riuso connessioni
- Fornisce statistiche real-time (connessioni attive, throughput, errori)

### 🎯 Sfida 2: Real-Time Multiplayer Game Protocol
Sviluppa un protocollo UDP ottimizzato per gaming:
- State synchronization con delta compression
- Client-side prediction e server reconciliation
- Lag compensation techniques
- Anti-cheat con server-authoritative model
- Multicast per game rooms
- Reliability layer custom per eventi critici (player joined/left)

### 🎯 Sfida 3: Distributed Service Discovery
Crea un sistema di service discovery:
- Heartbeat broadcast UDP per announce presenza
- Peer discovery automatico senza server centrale
- Consistent hashing per service registry
- Failure detection con gossip protocol
- DNS-SD compatible announcements
- Web UI per visualizzazione topologia rete

## File di Esempio Disponibili

La cartella `esempi/` contiene 8 implementazioni complete e funzionanti:

### TCP Examples
- 📁 **`01-tcp-echo-server/`** - Echo server TCP base con statistiche e timeout management
- 💬 **`02-tcp-chat-server/`** - Chat multi-client con rooms, comandi e broadcasting
- 📤 **`03-tcp-file-transfer/`** - File transfer con checksums MD5, progress tracking, e comandi (LIST/DOWNLOAD/UPLOAD/DELETE)
- 💓 **`08-heartbeat/`** - Sistema keepalive con heartbeat periodico e timeout detection

### UDP Examples
- 📡 **`04-udp-echo-server/`** - Echo server UDP connectionless con statistiche
- 📢 **`05-udp-broadcast/`** - Service announcement broadcaster con receiver
- 🌐 **`06-udp-multicast/`** - Multicast group communication con sensori simulati
- 🔧 **`07-custom-protocol/`** - Protocollo binario custom con header fisso, checksum e type safety

### Come Eseguire gli Esempi

```bash
# Vai nella cartella dell'esempio
cd esempi/01-tcp-echo-server/

# Installa dipendenze (se necessario)
npm install

# Avvia il server
npm start
# oppure
node server.js

# In un altro terminale, avvia il client
npm run client
# oppure  
node client.js

# Per esempi con sender/receiver (UDP broadcast/multicast)
# Terminale 1:
npm run sender

# Terminale 2:
npm run receiver

# Interrompi server/client
# Usa Ctrl+C per graceful shutdown
```

### Testare gli Esempi con Netcat/Telnet

```bash
# TCP Echo Server (porta 3000)
telnet localhost 3000
# oppure
nc localhost 3000

# Chat Server (porta 8080)
telnet localhost 8080

# UDP Echo (porta 9999)
echo "test message" | nc -u localhost 9999
```

## Risorse di Approfondimento

### 📚 Documentazione Ufficiale
- [Net Module](https://nodejs.org/api/net.html) - TCP server e client
- [Dgram Module](https://nodejs.org/api/dgram.html) - UDP datagram sockets
- [Buffer](https://nodejs.org/api/buffer.html) - Binary data handling
- [Stream](https://nodejs.org/api/stream.html) - Streaming data processing
- [Crypto](https://nodejs.org/api/crypto.html) - Checksums e hashing

### 🌐 Protocolli di Rete
- [RFC 793 - TCP](https://tools.ietf.org/html/rfc793) - Transmission Control Protocol
- [RFC 768 - UDP](https://tools.ietf.org/html/rfc768) - User Datagram Protocol
- [RFC 1112 - IP Multicast](https://tools.ietf.org/html/rfc1112) - Internet Group Management Protocol
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455) - Full-duplex communication

### 🎓 Guide e Tutorial
- [Node.js TCP Server Tutorial](https://nodejs.dev/learn/build-a-tcp-server)
- [Understanding UDP in Node.js](https://nodejs.org/en/knowledge/advanced/udp-in-nodejs/)
- [Networking Basics](https://nodejs.org/en/knowledge/advanced/streams/how-to-use-stream-pipe/)
- [Buffer Guide](https://nodejs.org/en/knowledge/advanced/buffers/how-to-use-buffers/)

### 🛠️ Best Practices
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Error Handling in Network Applications](https://nodejs.org/api/errors.html)
- [Backpressure and Flow Control](https://nodejs.org/en/docs/guides/backpressuring-in-streams/)
- [Performance Optimization](https://nodejs.org/en/docs/guides/simple-profiling/)

### 💡 Pattern Avanzati
- **Connection Pooling** - Riuso efficiente di connessioni TCP
- **Circuit Breaker** - Gestione failure in sistemi distribuiti
- **Message Framing** - Delimitazione messaggi in stream TCP
- **Reliability over UDP** - ARQ, sequence numbers, acknowledgments
- **NAT Traversal** - STUN, TURN, ICE per P2P dietro NAT
- **Load Balancing** - Round-robin, least-connections, consistent hashing

### 📖 Libri Consigliati
- "TCP/IP Illustrated, Volume 1" - W. Richard Stevens
- "Unix Network Programming" - W. Richard Stevens
- "High Performance Browser Networking" - Ilya Grigorik
- "Distributed Systems" - Andrew Tanenbaum

## Navigazione

- [Indice del Corso](../README.md)
- Modulo Precedente: [NPM e Gestione Pacchetti](../03-NPM/README.md)
- Modulo Successivo: [Socket.io e WebSocket](../05-Socket/README.md)
