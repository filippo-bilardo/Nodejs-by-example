/**
 * Custom Binary Protocol Example - Server
 * Implementa un protocollo binario custom con header fisso
 * 
 * FORMATO PROTOCOLLO:
 * [Magic: 2 bytes][Version: 1 byte][Type: 1 byte][Length: 4 bytes][Payload: N bytes][Checksum: 4 bytes]
 */

const net = require('net');
const crypto = require('crypto');

const PORT = process.env.PORT || 8888;

// Costanti protocollo
const PROTOCOL = {
    MAGIC: 0x4D50,        // 'MP' in hex
    VERSION: 0x01,
    HEADER_SIZE: 12,      // Magic(2) + Version(1) + Type(1) + Length(4) + Checksum(4)
    
    // Tipi di messaggio
    TYPE: {
        PING: 0x01,
        PONG: 0x02,
        REQUEST: 0x10,
        RESPONSE: 0x11,
        ERROR: 0xFF
    }
};

// Statistiche
const stats = {
    connections: 0,
    messagesReceived: 0,
    messagesSent: 0,
    bytesReceived: 0,
    bytesSent: 0,
    errors: 0
};

/**
 * Crea pacchetto binario
 */
function createPacket(type, payload) {
    const payloadBuffer = Buffer.from(JSON.stringify(payload));
    const length = payloadBuffer.length;
    
    // Calcola checksum del payload
    const checksum = crypto.createHash('md5')
        .update(payloadBuffer)
        .digest()
        .readUInt32BE(0);
    
    // Crea buffer totale
    const packet = Buffer.allocUnsafe(PROTOCOL.HEADER_SIZE + length);
    
    // Scrivi header
    packet.writeUInt16BE(PROTOCOL.MAGIC, 0);        // Magic number
    packet.writeUInt8(PROTOCOL.VERSION, 2);         // Version
    packet.writeUInt8(type, 3);                     // Message type
    packet.writeUInt32BE(length, 4);                // Payload length
    payloadBuffer.copy(packet, 8);                  // Payload
    packet.writeUInt32BE(checksum, 8 + length);     // Checksum
    
    return packet;
}

/**
 * Parsa pacchetto binario
 */
function parsePacket(buffer) {
    // Verifica dimensione minima
    if (buffer.length < PROTOCOL.HEADER_SIZE) {
        throw new Error('Packet troppo piccolo');
    }
    
    // Leggi header
    const magic = buffer.readUInt16BE(0);
    const version = buffer.readUInt8(2);
    const type = buffer.readUInt8(3);
    const length = buffer.readUInt32BE(4);
    
    // Verifica magic number
    if (magic !== PROTOCOL.MAGIC) {
        throw new Error(`Magic number non valido: 0x${magic.toString(16)}`);
    }
    
    // Verifica version
    if (version !== PROTOCOL.VERSION) {
        throw new Error(`Versione non supportata: ${version}`);
    }
    
    // Verifica lunghezza
    if (buffer.length < PROTOCOL.HEADER_SIZE + length) {
        throw new Error('Packet incompleto');
    }
    
    // Estrai payload
    const payload = buffer.slice(8, 8 + length);
    const checksum = buffer.readUInt32BE(8 + length);
    
    // Verifica checksum
    const calculatedChecksum = crypto.createHash('md5')
        .update(payload)
        .digest()
        .readUInt32BE(0);
    
    if (checksum !== calculatedChecksum) {
        throw new Error('Checksum non valido');
    }
    
    // Parsa payload
    const data = JSON.parse(payload.toString());
    
    return {
        type,
        data,
        size: PROTOCOL.HEADER_SIZE + length
    };
}

/**
 * Gestisce connessione client
 */
function handleClient(socket) {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`\n✅ Nuovo client: ${clientId}`);
    
    stats.connections++;
    
    let buffer = Buffer.alloc(0);
    
    socket.on('data', (chunk) => {
        // Accumula dati in buffer
        buffer = Buffer.concat([buffer, chunk]);
        stats.bytesReceived += chunk.length;
        
        // Processa tutti i pacchetti completi nel buffer
        while (buffer.length >= PROTOCOL.HEADER_SIZE) {
            try {
                // Tenta di parsare pacchetto
                const packet = parsePacket(buffer);
                
                stats.messagesReceived++;
                
                console.log(`\n📨 Messaggio ricevuto da ${clientId}:`);
                console.log(`   Tipo: 0x${packet.type.toString(16).padStart(2, '0')}`);
                console.log(`   Dimensione: ${packet.size} bytes`);
                console.log(`   Data:`, packet.data);
                
                // Rimuovi pacchetto processato dal buffer
                buffer = buffer.slice(packet.size);
                
                // Gestisci messaggio
                handleMessage(socket, packet);
                
            } catch (err) {
                // Se il parsing fallisce, attendi più dati
                if (err.message === 'Packet incompleto') {
                    break;
                }
                
                // Altri errori
                console.error(`⚠️  Errore parsing da ${clientId}:`, err.message);
                stats.errors++;
                
                // Invia errore al client
                const errorPacket = createPacket(PROTOCOL.TYPE.ERROR, {
                    error: err.message
                });
                
                socket.write(errorPacket);
                stats.messagesSent++;
                stats.bytesSent += errorPacket.length;
                
                // Reset buffer
                buffer = Buffer.alloc(0);
                break;
            }
        }
    });
    
    socket.on('error', (err) => {
        console.error(`⚠️  Errore socket ${clientId}:`, err.message);
    });
    
    socket.on('end', () => {
        console.log(`\n👋 Client disconnesso: ${clientId}`);
    });
}

/**
 * Gestisce messaggio ricevuto
 */
function handleMessage(socket, packet) {
    switch (packet.type) {
        case PROTOCOL.TYPE.PING:
            // Risponde con PONG
            const pong = createPacket(PROTOCOL.TYPE.PONG, {
                timestamp: Date.now(),
                ...packet.data
            });
            
            socket.write(pong);
            stats.messagesSent++;
            stats.bytesSent += pong.length;
            
            console.log('   → Risposto con PONG');
            break;
            
        case PROTOCOL.TYPE.REQUEST:
            // Processa richiesta
            const response = processRequest(packet.data);
            const responsePacket = createPacket(PROTOCOL.TYPE.RESPONSE, response);
            
            socket.write(responsePacket);
            stats.messagesSent++;
            stats.bytesSent += responsePacket.length;
            
            console.log('   → Risposto con RESPONSE');
            break;
            
        default:
            console.log(`   ⚠️  Tipo messaggio sconosciuto: 0x${packet.type.toString(16)}`);
    }
}

/**
 * Processa richiesta
 */
function processRequest(data) {
    const { action, params } = data;
    
    switch (action) {
        case 'echo':
            return { result: params };
            
        case 'uppercase':
            return { result: params.text.toUpperCase() };
            
        case 'reverse':
            return { result: params.text.split('').reverse().join('') };
            
        case 'stats':
            return { result: { ...stats } };
            
        default:
            return { error: `Azione non supportata: ${action}` };
    }
}

/**
 * CREA SERVER
 */
const server = net.createServer(handleClient);

server.listen(PORT, () => {
    console.log('');
    console.log('═'.repeat(60));
    console.log('🔌 Custom Binary Protocol Server');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
    console.log('');
    console.log('📋 Formato protocollo:');
    console.log(`   Magic: 0x${PROTOCOL.MAGIC.toString(16).toUpperCase()}`);
    console.log(`   Version: ${PROTOCOL.VERSION}`);
    console.log(`   Header size: ${PROTOCOL.HEADER_SIZE} bytes`);
    console.log('');
    console.log('📝 Tipi messaggio supportati:');
    Object.entries(PROTOCOL.TYPE).forEach(([name, value]) => {
        console.log(`   ${name}: 0x${value.toString(16).padStart(2, '0')}`);
    });
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
});

server.on('error', (err) => {
    console.error('⚠️  Errore server:', err.message);
    process.exit(1);
});

/**
 * GRACEFUL SHUTDOWN
 */
process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Arresto server...');
    
    console.log('');
    console.log('📊 STATISTICHE FINALI:');
    console.log(`   Connessioni totali: ${stats.connections}`);
    console.log(`   Messaggi ricevuti: ${stats.messagesReceived}`);
    console.log(`   Messaggi inviati: ${stats.messagesSent}`);
    console.log(`   Bytes ricevuti: ${stats.bytesReceived}`);
    console.log(`   Bytes inviati: ${stats.bytesSent}`);
    console.log(`   Errori: ${stats.errors}`);
    
    server.close(() => {
        console.log('✅ Server chiuso');
        process.exit(0);
    });
    
    setTimeout(() => {
        console.error('⚠️  Force exit');
        process.exit(1);
    }, 5000);
});
