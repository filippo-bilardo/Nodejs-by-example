/**
 * Custom Binary Protocol Example - Client
 * Client interattivo per testare il protocollo custom
 */

const net = require('net');
const crypto = require('crypto');
const readline = require('readline');

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 8888;

// Costanti protocollo (devono combaciare col server)
const PROTOCOL = {
    MAGIC: 0x4D50,
    VERSION: 0x01,
    HEADER_SIZE: 12,
    
    TYPE: {
        PING: 0x01,
        PONG: 0x02,
        REQUEST: 0x10,
        RESPONSE: 0x11,
        ERROR: 0xFF
    }
};

// Client
let socket = null;
let buffer = Buffer.alloc(0);

// Readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

/**
 * Crea pacchetto binario
 */
function createPacket(type, payload) {
    const payloadBuffer = Buffer.from(JSON.stringify(payload));
    const length = payloadBuffer.length;
    
    const checksum = crypto.createHash('md5')
        .update(payloadBuffer)
        .digest()
        .readUInt32BE(0);
    
    const packet = Buffer.allocUnsafe(PROTOCOL.HEADER_SIZE + length);
    
    packet.writeUInt16BE(PROTOCOL.MAGIC, 0);
    packet.writeUInt8(PROTOCOL.VERSION, 2);
    packet.writeUInt8(type, 3);
    packet.writeUInt32BE(length, 4);
    payloadBuffer.copy(packet, 8);
    packet.writeUInt32BE(checksum, 8 + length);
    
    return packet;
}

/**
 * Parsa pacchetto binario
 */
function parsePacket(buffer) {
    if (buffer.length < PROTOCOL.HEADER_SIZE) {
        throw new Error('Packet troppo piccolo');
    }
    
    const magic = buffer.readUInt16BE(0);
    const version = buffer.readUInt8(2);
    const type = buffer.readUInt8(3);
    const length = buffer.readUInt32BE(4);
    
    if (magic !== PROTOCOL.MAGIC) {
        throw new Error(`Magic number non valido: 0x${magic.toString(16)}`);
    }
    
    if (version !== PROTOCOL.VERSION) {
        throw new Error(`Versione non supportata: ${version}`);
    }
    
    if (buffer.length < PROTOCOL.HEADER_SIZE + length) {
        throw new Error('Packet incompleto');
    }
    
    const payload = buffer.slice(8, 8 + length);
    const checksum = buffer.readUInt32BE(8 + length);
    
    const calculatedChecksum = crypto.createHash('md5')
        .update(payload)
        .digest()
        .readUInt32BE(0);
    
    if (checksum !== calculatedChecksum) {
        throw new Error('Checksum non valido');
    }
    
    const data = JSON.parse(payload.toString());
    
    return {
        type,
        data,
        size: PROTOCOL.HEADER_SIZE + length
    };
}

/**
 * Connetti al server
 */
function connect() {
    socket = net.createConnection({ host: HOST, port: PORT }, () => {
        console.log(`✅ Connesso a ${HOST}:${PORT}`);
        console.log('');
        showHelp();
        rl.prompt();
    });
    
    socket.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);
        
        while (buffer.length >= PROTOCOL.HEADER_SIZE) {
            try {
                const packet = parsePacket(buffer);
                buffer = buffer.slice(packet.size);
                
                handleResponse(packet);
                
            } catch (err) {
                if (err.message === 'Packet incompleto') {
                    break;
                }
                
                console.error(`⚠️  Errore parsing:`, err.message);
                buffer = Buffer.alloc(0);
                break;
            }
        }
    });
    
    socket.on('error', (err) => {
        console.error('⚠️  Errore connessione:', err.message);
        process.exit(1);
    });
    
    socket.on('end', () => {
        console.log('\n👋 Disconnesso dal server');
        process.exit(0);
    });
}

/**
 * Gestisce risposta dal server
 */
function handleResponse(packet) {
    const typeName = Object.keys(PROTOCOL.TYPE).find(
        k => PROTOCOL.TYPE[k] === packet.type
    ) || 'UNKNOWN';
    
    console.log('');
    console.log(`📨 Risposta ricevuta [${typeName}]:`);
    console.log('   ', JSON.stringify(packet.data, null, 2).replace(/\n/g, '\n    '));
    console.log('');
    rl.prompt();
}

/**
 * Mostra help
 */
function showHelp() {
    console.log('Comandi disponibili:');
    console.log('  ping                    - Invia PING');
    console.log('  echo <text>            - Echo di un testo');
    console.log('  uppercase <text>       - Converti in maiuscolo');
    console.log('  reverse <text>         - Inverti testo');
    console.log('  stats                  - Mostra statistiche server');
    console.log('  help                   - Mostra questo help');
    console.log('  quit                   - Disconnetti');
    console.log('');
}

/**
 * Gestisce comando
 */
function handleCommand(line) {
    const parts = line.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    if (!socket || socket.destroyed) {
        console.log('⚠️  Non connesso al server');
        return;
    }
    
    switch (cmd) {
        case 'ping':
            const ping = createPacket(PROTOCOL.TYPE.PING, {
                timestamp: Date.now()
            });
            socket.write(ping);
            console.log('📤 PING inviato');
            break;
            
        case 'echo':
            if (!args) {
                console.log('⚠️  Uso: echo <text>');
                break;
            }
            const echoReq = createPacket(PROTOCOL.TYPE.REQUEST, {
                action: 'echo',
                params: args
            });
            socket.write(echoReq);
            console.log('📤 REQUEST inviata (echo)');
            break;
            
        case 'uppercase':
            if (!args) {
                console.log('⚠️  Uso: uppercase <text>');
                break;
            }
            const upperReq = createPacket(PROTOCOL.TYPE.REQUEST, {
                action: 'uppercase',
                params: { text: args }
            });
            socket.write(upperReq);
            console.log('📤 REQUEST inviata (uppercase)');
            break;
            
        case 'reverse':
            if (!args) {
                console.log('⚠️  Uso: reverse <text>');
                break;
            }
            const revReq = createPacket(PROTOCOL.TYPE.REQUEST, {
                action: 'reverse',
                params: { text: args }
            });
            socket.write(revReq);
            console.log('📤 REQUEST inviata (reverse)');
            break;
            
        case 'stats':
            const statsReq = createPacket(PROTOCOL.TYPE.REQUEST, {
                action: 'stats',
                params: {}
            });
            socket.write(statsReq);
            console.log('📤 REQUEST inviata (stats)');
            break;
            
        case 'help':
            showHelp();
            break;
            
        case 'quit':
            console.log('👋 Disconnessione...');
            socket.end();
            return;
            
        case '':
            break;
            
        default:
            console.log(`⚠️  Comando sconosciuto: ${cmd}`);
            console.log('Usa "help" per vedere i comandi disponibili');
    }
    
    rl.prompt();
}

/**
 * MAIN
 */
console.log('');
console.log('═'.repeat(60));
console.log('🔌 Custom Binary Protocol Client');
console.log('═'.repeat(60));
console.log('');
console.log(`Connessione a ${HOST}:${PORT}...`);
console.log('');

connect();

rl.on('line', handleCommand);

rl.on('SIGINT', () => {
    console.log('');
    console.log('👋 Chiusura...');
    if (socket && !socket.destroyed) {
        socket.end();
    }
    process.exit(0);
});
