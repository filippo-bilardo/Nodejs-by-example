# Protocolli Applicativi Custom

## Indice
1. [Introduzione ai Protocolli](#introduzione)
2. [Design di un Protocollo](#design)
3. [Serializzazione Dati](#serializzazione)
4. [Esempio: Protocollo Chat](#protocollo-chat)
5. [Esempio: Protocollo File Transfer](#protocollo-file)
6. [Versioning e Compatibilità](#versioning)
7. [Testing e Debugging](#testing)
8. [Performance](#performance)

---

## 1. Introduzione ai Protocolli {#introduzione}

Un **protocollo applicativo** definisce le regole di comunicazione tra client e server.

### Elementi di un Protocollo

1. **Formato Messaggio**: Come strutturare i dati
2. **Semantica**: Significato dei messaggi
3. **Sequenza**: Ordine operazioni (handshake, auth, request/response)
4. **Error Handling**: Gestione errori
5. **Flow Control**: Controllo flusso dati

### Protocolli Esistenti vs Custom

**Protocolli Standard:**
- HTTP: Web APIs
- WebSocket: Real-time bidirectional
- MQTT: IoT messaging
- SMTP: Email
- FTP: File transfer

**Quando Creare Custom Protocol:**
- ✅ Requisiti performance specifici
- ✅ Binary protocol per efficienza
- ✅ Funzionalità non disponibili in protocolli standard
- ✅ Learning experience

---

## 2. Design di un Protocollo {#design}

### Checklist Design

```
[ ] Definire casi d'uso
[ ] Scegliere formato (text/binary)
[ ] Definire message types
[ ] Definire message structure
[ ] Gestione errori
[ ] Autenticazione/autorizzazione
[ ] Versioning strategy
[ ] Documentazione
[ ] Test suite
```

### Formato Text vs Binary

#### Text Protocol (JSON, XML)

**Vantaggi:**
- ✅ Human readable
- ✅ Facile debug
- ✅ Parsing semplice (JSON.parse)
- ✅ Interoperabilità

**Svantaggi:**
- ❌ Più lento
- ❌ Più spazio (overhead)
- ❌ No controllo tipo strict

**Esempio:**
```json
{
  "type": "REQUEST",
  "id": 123,
  "method": "getUser",
  "params": { "userId": 456 }
}
```

#### Binary Protocol

**Vantaggi:**
- ✅ Più veloce
- ✅ Più compatto
- ✅ Controllo tipo preciso

**Svantaggi:**
- ❌ Non human readable
- ❌ Debug complesso
- ❌ Parsing custom

**Esempio:**
```
[Header: 12 bytes]
- Magic number: 0xABCD (2 bytes)
- Version: 1 (1 byte)
- Message type: 3 (1 byte)
- Message ID: 123 (4 bytes)
- Payload length: 256 (4 bytes)

[Payload: 256 bytes]
- User ID: 456 (4 bytes)
- ...
```

### Message Types

Definire chiaramente i tipi di messaggio:

```javascript
const MessageType = {
    // Client -> Server
    AUTH: 0x01,
    REQUEST: 0x02,
    PING: 0x03,
    
    // Server -> Client
    AUTH_RESPONSE: 0x11,
    RESPONSE: 0x12,
    PONG: 0x13,
    NOTIFICATION: 0x14,
    ERROR: 0x15
};
```

---

## 3. Serializzazione Dati {#serializzazione}

### JSON (Built-in)

```javascript
// Serializzazione
const data = { userId: 123, name: 'Mario' };
const json = JSON.stringify(data);
socket.write(json + '\n');

// Deserializzazione
socket.on('data', (buffer) => {
    const json = buffer.toString();
    const data = JSON.parse(json);
});
```

**Pro:**
- Nativo in JavaScript
- Human readable
- Supporto universale

**Contro:**
- Lento per grandi volumi
- Overhead spazio (~30-40%)

### MessagePack (Binary JSON)

Installazione:
```bash
npm install msgpack5
```

Uso:
```javascript
const msgpack = require('msgpack5')();

// Encoding
const data = { userId: 123, name: 'Mario' };
const buffer = msgpack.encode(data);
socket.write(buffer);

// Decoding
socket.on('data', (buffer) => {
    const data = msgpack.decode(buffer);
    console.log(data); // { userId: 123, name: 'Mario' }
});
```

**Pro:**
- Più compatto di JSON (20-50% risparmio)
- Più veloce
- Supporto tipi binari

**Contro:**
- Dipendenza esterna
- Non human readable

### Protocol Buffers (protobuf)

Definizione schema (`.proto` file):

```protobuf
syntax = "proto3";

message User {
    int32 userId = 1;
    string name = 2;
    string email = 3;
    repeated string roles = 4;
}

message Request {
    string requestId = 1;
    string method = 2;
    bytes payload = 3;
}
```

Installazione:
```bash
npm install protobufjs
```

Uso:
```javascript
const protobuf = require('protobufjs');

// Carica schema
const root = protobuf.loadSync('schema.proto');
const User = root.lookupType('User');

// Encoding
const userData = { userId: 123, name: 'Mario', email: 'mario@example.com' };
const errMsg = User.verify(userData);
if (errMsg) throw Error(errMsg);

const message = User.create(userData);
const buffer = User.encode(message).finish();
socket.write(buffer);

// Decoding
socket.on('data', (buffer) => {
    const message = User.decode(buffer);
    const object = User.toObject(message);
    console.log(object);
});
```

**Pro:**
- Molto compatto
- Schema validation
- Type safety
- Multi-language support

**Contro:**
- Complessità setup
- Schema separato

### Confronto Performance

```javascript
const data = {
    userId: 123,
    name: 'Mario Rossi',
    email: 'mario@example.com',
    roles: ['admin', 'user']
};

// JSON
const jsonStr = JSON.stringify(data);
console.log('JSON size:', jsonStr.length); // ~95 bytes

// MessagePack
const msgpack = require('msgpack5')();
const msgpackBuf = msgpack.encode(data);
console.log('MessagePack size:', msgpackBuf.length); // ~65 bytes (-32%)

// Protobuf
const protobufBuf = User.encode(User.create(data)).finish();
console.log('Protobuf size:', protobufBuf.length); // ~45 bytes (-53%)
```

---

## 4. Esempio: Protocollo Chat {#protocollo-chat}

### Specifica Protocollo

```
Chat Protocol v1.0
==================

Message Format: JSON newline-delimited

Message Types:
1. AUTH - Autenticazione
2. JOIN - Entra in room
3. LEAVE - Esci da room
4. MESSAGE - Invia messaggio
5. PRIVATE - Messaggio privato
6. NOTIFICATION - Notifica server
7. ERROR - Errore

Sequence:
1. Client -> AUTH
2. Server -> AUTH_OK | ERROR
3. Client -> JOIN/MESSAGE/...
4. Server -> NOTIFICATION/MESSAGE/...
```

### Implementazione Server

```javascript
const net = require('net');

class ChatProtocol {
    constructor() {
        this.VERSION = '1.0';
        
        this.MessageType = {
            AUTH: 'AUTH',
            JOIN: 'JOIN',
            LEAVE: 'LEAVE',
            MESSAGE: 'MESSAGE',
            PRIVATE: 'PRIVATE',
            NOTIFICATION: 'NOTIFICATION',
            ERROR: 'ERROR'
        };
        
        this.users = new Map();
        this.rooms = new Map();
    }
    
    handleClient(socket) {
        const client = {
            socket,
            authenticated: false,
            username: null,
            currentRoom: null,
            buffer: ''
        };
        
        socket.on('data', (data) => {
            client.buffer += data.toString();
            
            let newlineIndex;
            while ((newlineIndex = client.buffer.indexOf('\n')) !== -1) {
                const line = client.buffer.substring(0, newlineIndex);
                client.buffer = client.buffer.substring(newlineIndex + 1);
                
                this.processMessage(client, line);
            }
        });
        
        socket.on('close', () => {
            if (client.username) {
                this.handleDisconnect(client);
            }
        });
        
        socket.on('error', (err) => {
            console.error('Client error:', err);
        });
    }
    
    processMessage(client, line) {
        try {
            const message = JSON.parse(line);
            
            // Validazione versione
            if (message.version !== this.VERSION) {
                this.sendError(client, 'Unsupported version');
                return;
            }
            
            // Dispatch
            switch (message.type) {
                case this.MessageType.AUTH:
                    this.handleAuth(client, message);
                    break;
                    
                case this.MessageType.JOIN:
                    if (!client.authenticated) {
                        this.sendError(client, 'Not authenticated');
                        return;
                    }
                    this.handleJoin(client, message);
                    break;
                    
                case this.MessageType.LEAVE:
                    if (!client.authenticated) {
                        this.sendError(client, 'Not authenticated');
                        return;
                    }
                    this.handleLeave(client, message);
                    break;
                    
                case this.MessageType.MESSAGE:
                    if (!client.authenticated) {
                        this.sendError(client, 'Not authenticated');
                        return;
                    }
                    this.handleMessage(client, message);
                    break;
                    
                case this.MessageType.PRIVATE:
                    if (!client.authenticated) {
                        this.sendError(client, 'Not authenticated');
                        return;
                    }
                    this.handlePrivate(client, message);
                    break;
                    
                default:
                    this.sendError(client, 'Unknown message type');
            }
            
        } catch (err) {
            this.sendError(client, 'Invalid JSON');
        }
    }
    
    handleAuth(client, message) {
        const { username, password } = message.payload;
        
        // Validazione
        if (!username || username.length < 3) {
            this.sendError(client, 'Invalid username');
            return;
        }
        
        // Verifica unicità
        if (this.users.has(username)) {
            this.sendError(client, 'Username already taken');
            return;
        }
        
        // Auth ok
        client.authenticated = true;
        client.username = username;
        this.users.set(username, client);
        
        this.send(client, {
            version: this.VERSION,
            type: this.MessageType.NOTIFICATION,
            payload: {
                event: 'AUTH_OK',
                message: `Welcome, ${username}!`
            }
        });
    }
    
    handleJoin(client, message) {
        const { room } = message.payload;
        
        if (!room) {
            this.sendError(client, 'Room name required');
            return;
        }
        
        // Esci da room precedente
        if (client.currentRoom) {
            this.handleLeave(client, {});
        }
        
        // Crea room se non esiste
        if (!this.rooms.has(room)) {
            this.rooms.set(room, new Set());
        }
        
        // Join
        this.rooms.get(room).add(client);
        client.currentRoom = room;
        
        // Notifica al client
        this.send(client, {
            version: this.VERSION,
            type: this.MessageType.NOTIFICATION,
            payload: {
                event: 'JOINED',
                room
            }
        });
        
        // Notifica agli altri nella room
        this.broadcast(room, {
            version: this.VERSION,
            type: this.MessageType.NOTIFICATION,
            payload: {
                event: 'USER_JOINED',
                username: client.username,
                room
            }
        }, client);
    }
    
    handleLeave(client, message) {
        if (!client.currentRoom) {
            return;
        }
        
        const room = client.currentRoom;
        
        // Rimuovi da room
        this.rooms.get(room).delete(client);
        
        // Rimuovi room se vuota
        if (this.rooms.get(room).size === 0) {
            this.rooms.delete(room);
        }
        
        client.currentRoom = null;
        
        // Notifica al client
        this.send(client, {
            version: this.VERSION,
            type: this.MessageType.NOTIFICATION,
            payload: {
                event: 'LEFT',
                room
            }
        });
        
        // Notifica agli altri
        if (this.rooms.has(room)) {
            this.broadcast(room, {
                version: this.VERSION,
                type: this.MessageType.NOTIFICATION,
                payload: {
                    event: 'USER_LEFT',
                    username: client.username,
                    room
                }
            });
        }
    }
    
    handleMessage(client, message) {
        if (!client.currentRoom) {
            this.sendError(client, 'Not in a room');
            return;
        }
        
        const { text } = message.payload;
        
        if (!text) {
            this.sendError(client, 'Message text required');
            return;
        }
        
        // Broadcast a room
        this.broadcast(client.currentRoom, {
            version: this.VERSION,
            type: this.MessageType.MESSAGE,
            payload: {
                username: client.username,
                room: client.currentRoom,
                text,
                timestamp: Date.now()
            }
        });
    }
    
    handlePrivate(client, message) {
        const { to, text } = message.payload;
        
        if (!to || !text) {
            this.sendError(client, 'Recipient and text required');
            return;
        }
        
        const recipient = this.users.get(to);
        
        if (!recipient) {
            this.sendError(client, 'User not found');
            return;
        }
        
        // Invia a destinatario
        this.send(recipient, {
            version: this.VERSION,
            type: this.MessageType.PRIVATE,
            payload: {
                from: client.username,
                text,
                timestamp: Date.now()
            }
        });
        
        // Conferma al mittente
        this.send(client, {
            version: this.VERSION,
            type: this.MessageType.NOTIFICATION,
            payload: {
                event: 'PRIVATE_SENT',
                to,
                text
            }
        });
    }
    
    handleDisconnect(client) {
        if (client.currentRoom) {
            this.handleLeave(client, {});
        }
        
        this.users.delete(client.username);
    }
    
    broadcast(room, message, excludeClient = null) {
        const clients = this.rooms.get(room);
        if (!clients) return;
        
        clients.forEach(client => {
            if (client !== excludeClient && !client.socket.destroyed) {
                this.send(client, message);
            }
        });
    }
    
    send(client, message) {
        const json = JSON.stringify(message) + '\n';
        client.socket.write(json);
    }
    
    sendError(client, errorMessage) {
        this.send(client, {
            version: this.VERSION,
            type: this.MessageType.ERROR,
            payload: {
                message: errorMessage,
                timestamp: Date.now()
            }
        });
    }
}

// Avvia server
const protocol = new ChatProtocol();
const server = net.createServer((socket) => protocol.handleClient(socket));
server.listen(3000, () => {
    console.log('Chat server listening on port 3000');
});
```

### Implementazione Client

```javascript
const net = require('net');
const readline = require('readline');

class ChatClient {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.VERSION = '1.0';
        this.buffer = '';
    }
    
    connect(username) {
        return new Promise((resolve, reject) => {
            this.socket = net.connect(this.port, this.host, () => {
                // Invia auth
                this.send({
                    version: this.VERSION,
                    type: 'AUTH',
                    payload: { username }
                });
            });
            
            this.socket.on('data', (data) => {
                this.buffer += data.toString();
                
                let newlineIndex;
                while ((newlineIndex = this.buffer.indexOf('\n')) !== -1) {
                    const line = this.buffer.substring(0, newlineIndex);
                    this.buffer = this.buffer.substring(newlineIndex + 1);
                    
                    const message = JSON.parse(line);
                    
                    if (message.type === 'NOTIFICATION' && 
                        message.payload.event === 'AUTH_OK') {
                        resolve();
                    } else if (message.type === 'ERROR') {
                        reject(new Error(message.payload.message));
                    } else {
                        this.handleMessage(message);
                    }
                }
            });
            
            this.socket.on('error', reject);
        });
    }
    
    handleMessage(message) {
        switch (message.type) {
            case 'MESSAGE':
                console.log(`\n[${message.payload.room}] ${message.payload.username}: ${message.payload.text}`);
                break;
                
            case 'PRIVATE':
                console.log(`\n[PRIVATE from ${message.payload.from}] ${message.payload.text}`);
                break;
                
            case 'NOTIFICATION':
                console.log(`\n[SYSTEM] ${message.payload.event}: ${JSON.stringify(message.payload)}`);
                break;
                
            case 'ERROR':
                console.error(`\n[ERROR] ${message.payload.message}`);
                break;
        }
    }
    
    join(room) {
        this.send({
            version: this.VERSION,
            type: 'JOIN',
            payload: { room }
        });
    }
    
    leave() {
        this.send({
            version: this.VERSION,
            type: 'LEAVE',
            payload: {}
        });
    }
    
    sendMessage(text) {
        this.send({
            version: this.VERSION,
            type: 'MESSAGE',
            payload: { text }
        });
    }
    
    sendPrivate(to, text) {
        this.send({
            version: this.VERSION,
            type: 'PRIVATE',
            payload: { to, text }
        });
    }
    
    send(message) {
        const json = JSON.stringify(message) + '\n';
        this.socket.write(json);
    }
    
    disconnect() {
        this.socket.end();
    }
}

// Uso
async function main() {
    const client = new ChatClient('localhost', 3000);
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const username = await new Promise(resolve => {
        rl.question('Username: ', resolve);
    });
    
    try {
        await client.connect(username);
        console.log('Connected!');
        
        rl.setPrompt('> ');
        rl.prompt();
        
        rl.on('line', (line) => {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('/join ')) {
                const room = trimmed.substring(6);
                client.join(room);
            } else if (trimmed === '/leave') {
                client.leave();
            } else if (trimmed.startsWith('/msg ')) {
                const parts = trimmed.substring(5).split(' ');
                const to = parts[0];
                const text = parts.slice(1).join(' ');
                client.sendPrivate(to, text);
            } else if (trimmed === '/quit') {
                client.disconnect();
                process.exit(0);
            } else {
                client.sendMessage(trimmed);
            }
            
            rl.prompt();
        });
        
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

main();
```

---

## 5. Esempio: Protocollo File Transfer {#protocollo-file}

### Specifica Protocollo

```
File Transfer Protocol v1.0
===========================

Binary Protocol - Fixed Header

Header (16 bytes):
- Magic: 0x4654 (2 bytes) - "FT"
- Version: 1 (1 byte)
- Command: (1 byte)
  0x01 = LIST
  0x02 = GET
  0x03 = PUT
  0x04 = DELETE
  0x10 = RESPONSE
  0xFF = ERROR
- Flags: (1 byte)
  0x01 = COMPRESSED
  0x02 = ENCRYPTED
- Request ID: (4 bytes)
- Payload Length: (4 bytes)
- Checksum: (4 bytes) - CRC32

Payload:
- Variabile in base al comando
```

### Implementazione

```javascript
const net = require('net');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');

const MAGIC = 0x4654;
const VERSION = 1;

const Command = {
    LIST: 0x01,
    GET: 0x02,
    PUT: 0x03,
    DELETE: 0x04,
    RESPONSE: 0x10,
    ERROR: 0xFF
};

const Flags = {
    COMPRESSED: 0x01,
    ENCRYPTED: 0x02
};

class FileTransferProtocol {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.HEADER_SIZE = 16;
    }
    
    handleClient(socket) {
        const client = {
            socket,
            buffer: Buffer.alloc(0),
            currentHeader: null
        };
        
        socket.on('data', (data) => {
            client.buffer = Buffer.concat([client.buffer, data]);
            this.processBuffer(client);
        });
    }
    
    processBuffer(client) {
        while (true) {
            // Leggi header
            if (!client.currentHeader) {
                if (client.buffer.length < this.HEADER_SIZE) {
                    return; // Header incompleto
                }
                
                client.currentHeader = this.parseHeader(
                    client.buffer.slice(0, this.HEADER_SIZE)
                );
                client.buffer = client.buffer.slice(this.HEADER_SIZE);
            }
            
            // Leggi payload
            if (client.buffer.length < client.currentHeader.payloadLength) {
                return; // Payload incompleto
            }
            
            const payload = client.buffer.slice(0, client.currentHeader.payloadLength);
            client.buffer = client.buffer.slice(client.currentHeader.payloadLength);
            
            // Verifica checksum
            const checksum = this.calculateChecksum(payload);
            if (checksum !== client.currentHeader.checksum) {
                this.sendError(client, 'Checksum mismatch');
                client.currentHeader = null;
                continue;
            }
            
            // Processa comando
            this.processCommand(client, client.currentHeader, payload);
            client.currentHeader = null;
        }
    }
    
    parseHeader(buffer) {
        const magic = buffer.readUInt16BE(0);
        
        if (magic !== MAGIC) {
            throw new Error('Invalid magic number');
        }
        
        return {
            magic,
            version: buffer.readUInt8(2),
            command: buffer.readUInt8(3),
            flags: buffer.readUInt8(4),
            requestId: buffer.readUInt32BE(5),
            payloadLength: buffer.readUInt32BE(9),
            checksum: buffer.readUInt32BE(13)
        };
    }
    
    processCommand(client, header, payload) {
        switch (header.command) {
            case Command.LIST:
                this.handleList(client, header);
                break;
                
            case Command.GET:
                this.handleGet(client, header, payload);
                break;
                
            case Command.PUT:
                this.handlePut(client, header, payload);
                break;
                
            case Command.DELETE:
                this.handleDelete(client, header, payload);
                break;
                
            default:
                this.sendError(client, 'Unknown command');
        }
    }
    
    handleList(client, header) {
        fs.readdir(this.baseDir, (err, files) => {
            if (err) {
                this.sendError(client, 'Failed to list files');
                return;
            }
            
            const fileList = files.map(file => {
                const stat = fs.statSync(path.join(this.baseDir, file));
                return {
                    name: file,
                    size: stat.size,
                    modified: stat.mtime.getTime()
                };
            });
            
            const payload = Buffer.from(JSON.stringify(fileList));
            this.send(client, header.requestId, Command.RESPONSE, payload);
        });
    }
    
    handleGet(client, header, payload) {
        const filename = payload.toString();
        const filepath = path.join(this.baseDir, filename);
        
        // Validazione path (evita path traversal)
        if (!filepath.startsWith(this.baseDir)) {
            this.sendError(client, 'Invalid path');
            return;
        }
        
        fs.readFile(filepath, (err, data) => {
            if (err) {
                this.sendError(client, 'File not found');
                return;
            }
            
            // Comprimi se file grande
            if (data.length > 1024 && (header.flags & Flags.COMPRESSED)) {
                zlib.gzip(data, (err, compressed) => {
                    if (err) {
                        this.sendError(client, 'Compression failed');
                        return;
                    }
                    
                    this.send(
                        client,
                        header.requestId,
                        Command.RESPONSE,
                        compressed,
                        Flags.COMPRESSED
                    );
                });
            } else {
                this.send(client, header.requestId, Command.RESPONSE, data);
            }
        });
    }
    
    handlePut(client, header, payload) {
        // Payload format: [filename length (4 bytes)][filename][file data]
        const filenameLength = payload.readUInt32BE(0);
        const filename = payload.slice(4, 4 + filenameLength).toString();
        let fileData = payload.slice(4 + filenameLength);
        
        // Decomprimi se necessario
        if (header.flags & Flags.COMPRESSED) {
            fileData = zlib.gunzipSync(fileData);
        }
        
        const filepath = path.join(this.baseDir, filename);
        
        // Validazione path
        if (!filepath.startsWith(this.baseDir)) {
            this.sendError(client, 'Invalid path');
            return;
        }
        
        fs.writeFile(filepath, fileData, (err) => {
            if (err) {
                this.sendError(client, 'Write failed');
                return;
            }
            
            const response = Buffer.from(JSON.stringify({
                success: true,
                filename,
                size: fileData.length
            }));
            
            this.send(client, header.requestId, Command.RESPONSE, response);
        });
    }
    
    handleDelete(client, header, payload) {
        const filename = payload.toString();
        const filepath = path.join(this.baseDir, filename);
        
        if (!filepath.startsWith(this.baseDir)) {
            this.sendError(client, 'Invalid path');
            return;
        }
        
        fs.unlink(filepath, (err) => {
            if (err) {
                this.sendError(client, 'Delete failed');
                return;
            }
            
            const response = Buffer.from(JSON.stringify({ success: true }));
            this.send(client, header.requestId, Command.RESPONSE, response);
        });
    }
    
    send(client, requestId, command, payload, flags = 0) {
        const checksum = this.calculateChecksum(payload);
        
        const header = Buffer.allocUnsafe(this.HEADER_SIZE);
        header.writeUInt16BE(MAGIC, 0);
        header.writeUInt8(VERSION, 2);
        header.writeUInt8(command, 3);
        header.writeUInt8(flags, 4);
        header.writeUInt32BE(requestId, 5);
        header.writeUInt32BE(payload.length, 9);
        header.writeUInt32BE(checksum, 13);
        
        client.socket.write(Buffer.concat([header, payload]));
    }
    
    sendError(client, message) {
        const payload = Buffer.from(JSON.stringify({ error: message }));
        this.send(client, 0, Command.ERROR, payload);
    }
    
    calculateChecksum(buffer) {
        return crypto.createHash('md5').update(buffer).digest().readUInt32BE(0);
    }
}

// Server
const protocol = new FileTransferProtocol('./files');
const server = net.createServer((socket) => protocol.handleClient(socket));
server.listen(3000);
```

---

## 6. Versioning e Compatibilità {#versioning}

### Semantic Versioning

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (incompatibile)
MINOR: New features (compatibile)
PATCH: Bug fixes (compatibile)
```

### Implementazione

```javascript
class VersionedProtocol {
    constructor() {
        this.VERSION_MAJOR = 2;
        this.VERSION_MINOR = 1;
        this.VERSION_PATCH = 0;
    }
    
    parseVersion(versionString) {
        const [major, minor, patch] = versionString.split('.').map(Number);
        return { major, minor, patch };
    }
    
    isCompatible(clientVersion) {
        const client = this.parseVersion(clientVersion);
        
        // Major version deve matchare
        if (client.major !== this.VERSION_MAJOR) {
            return false;
        }
        
        // Client può avere minor version più vecchia
        if (client.minor > this.VERSION_MINOR) {
            return false;
        }
        
        return true;
    }
    
    handleMessage(message) {
        if (!this.isCompatible(message.version)) {
            return this.sendError('Incompatible version');
        }
        
        // Gestisci differenze minor version
        if (message.version.minor < this.VERSION_MINOR) {
            // Usa feature set limitato per compatibilità
            this.handleLegacyMessage(message);
        } else {
            this.handleCurrentMessage(message);
        }
    }
}
```

---

## Riepilogo

✅ **Protocol Design:**
- Definire chiaramente message types e struttura
- Scegliere formato adatto (text vs binary)
- Implementare versioning

✅ **Serializzazione:**
- JSON per semplicità
- MessagePack per performance
- Protobuf per type safety

✅ **Esempi Pratici:**
- Chat protocol (JSON-based)
- File transfer (binary protocol)
- Versioning e compatibilità

✅ **Best Practices:**
- Documentazione completa
- Schema validation
- Error handling robusto
- Testing estensivo

**Prossimi Step:**
- [Esempi Completi](../esempi/)
- [Esercizi Pratici](../esercizi/)
