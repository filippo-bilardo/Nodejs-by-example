/**
 * TCP File Transfer Server
 * Server per upload/download file con progress tracking
 */

const net = require('net');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configurazione
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const FILES_DIR = path.join(__dirname, 'files');

// Crea directory files se non esiste
if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
}

// Statistiche server
const stats = {
    totalUploads: 0,
    totalDownloads: 0,
    bytesReceived: 0,
    bytesSent: 0,
    activeConnections: 0,
    startTime: new Date()
};

/**
 * Calcola checksum MD5 di un file
 */
function calculateChecksum(filePath) {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('md5');
        const stream = fs.createReadStream(filePath);
        
        stream.on('data', data => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
}

/**
 * Lista file disponibili
 */
function listFiles() {
    return new Promise((resolve, reject) => {
        fs.readdir(FILES_DIR, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            
            const fileList = files.map(file => {
                const filePath = path.join(FILES_DIR, file);
                const stat = fs.statSync(filePath);
                
                return {
                    name: file,
                    size: stat.size,
                    modified: stat.mtime.toISOString()
                };
            });
            
            resolve(fileList);
        });
    });
}

/**
 * Gestisce richiesta LIST
 */
async function handleList(socket) {
    try {
        const files = await listFiles();
        const response = JSON.stringify({
            command: 'LIST_RESPONSE',
            files,
            count: files.length
        });
        
        socket.write(response + '\n');
        console.log(`📋 Inviata lista di ${files.length} file`);
        
    } catch (err) {
        sendError(socket, 'Errore listing file: ' + err.message);
    }
}

/**
 * Gestisce richiesta DOWNLOAD
 */
async function handleDownload(socket, filename) {
    const filePath = path.join(FILES_DIR, filename);
    
    // Validazione path (evita path traversal)
    if (!filePath.startsWith(FILES_DIR)) {
        sendError(socket, 'Path non valido');
        return;
    }
    
    // Verifica esistenza file
    if (!fs.existsSync(filePath)) {
        sendError(socket, 'File non trovato');
        return;
    }
    
    try {
        const stat = fs.statSync(filePath);
        const checksum = await calculateChecksum(filePath);
        
        // Invia metadata
        const metadata = JSON.stringify({
            command: 'DOWNLOAD_START',
            filename,
            size: stat.size,
            checksum
        });
        
        socket.write(metadata + '\n');
        
        // Invia file
        const readStream = fs.createReadStream(filePath);
        let bytesSent = 0;
        
        readStream.on('data', (chunk) => {
            bytesSent += chunk.length;
            
            // Progress ogni 10%
            const progress = Math.floor((bytesSent / stat.size) * 100);
            if (progress % 10 === 0) {
                console.log(`📤 Download ${filename}: ${progress}%`);
            }
        });
        
        readStream.on('end', () => {
            stats.totalDownloads++;
            stats.bytesSent += stat.size;
            
            console.log(`✅ Download completato: ${filename} (${stat.size} bytes)`);
            
            // Invia conferma fine
            const response = JSON.stringify({
                command: 'DOWNLOAD_COMPLETE',
                filename,
                size: stat.size,
                checksum
            });
            socket.write('\n' + response + '\n');
        });
        
        readStream.on('error', (err) => {
            console.error(`❌ Errore lettura file:`, err);
            sendError(socket, 'Errore lettura file');
        });
        
        readStream.pipe(socket, { end: false });
        
    } catch (err) {
        console.error('Errore download:', err);
        sendError(socket, 'Errore download: ' + err.message);
    }
}

/**
 * Gestisce richiesta UPLOAD
 */
function handleUpload(socket, filename, filesize, checksum) {
    const filePath = path.join(FILES_DIR, filename);
    
    // Validazione
    if (!filePath.startsWith(FILES_DIR)) {
        sendError(socket, 'Path non valido');
        return;
    }
    
    console.log(`📥 Ricezione file: ${filename} (${filesize} bytes)`);
    
    const writeStream = fs.createWriteStream(filePath);
    let bytesReceived = 0;
    let isReceiving = true;
    
    // Buffer per dati in arrivo
    socket.on('data', (chunk) => {
        if (!isReceiving) return;
        
        writeStream.write(chunk);
        bytesReceived += chunk.length;
        
        // Progress
        const progress = Math.floor((bytesReceived / filesize) * 100);
        if (progress % 10 === 0) {
            console.log(`📥 Upload ${filename}: ${progress}%`);
        }
        
        // Fine ricezione
        if (bytesReceived >= filesize) {
            isReceiving = false;
            writeStream.end();
        }
    });
    
    writeStream.on('finish', async () => {
        try {
            // Verifica checksum
            const actualChecksum = await calculateChecksum(filePath);
            
            if (actualChecksum !== checksum) {
                fs.unlinkSync(filePath); // Elimina file corrotto
                sendError(socket, 'Checksum non corrisponde');
                return;
            }
            
            stats.totalUploads++;
            stats.bytesReceived += filesize;
            
            console.log(`✅ Upload completato: ${filename} (${filesize} bytes)`);
            
            const response = JSON.stringify({
                command: 'UPLOAD_COMPLETE',
                filename,
                size: filesize,
                checksum: actualChecksum
            });
            
            socket.write(response + '\n');
            
        } catch (err) {
            console.error('Errore verifica upload:', err);
            sendError(socket, 'Errore verifica file');
        }
    });
    
    writeStream.on('error', (err) => {
        console.error('Errore scrittura file:', err);
        sendError(socket, 'Errore scrittura file');
    });
    
    // Invia conferma pronto a ricevere
    const response = JSON.stringify({
        command: 'UPLOAD_READY',
        filename
    });
    socket.write(response + '\n');
}

/**
 * Gestisce richiesta DELETE
 */
function handleDelete(socket, filename) {
    const filePath = path.join(FILES_DIR, filename);
    
    // Validazione
    if (!filePath.startsWith(FILES_DIR)) {
        sendError(socket, 'Path non valido');
        return;
    }
    
    if (!fs.existsSync(filePath)) {
        sendError(socket, 'File non trovato');
        return;
    }
    
    try {
        fs.unlinkSync(filePath);
        
        console.log(`🗑️  File eliminato: ${filename}`);
        
        const response = JSON.stringify({
            command: 'DELETE_COMPLETE',
            filename
        });
        
        socket.write(response + '\n');
        
    } catch (err) {
        console.error('Errore eliminazione:', err);
        sendError(socket, 'Errore eliminazione file');
    }
}

/**
 * Gestisce richiesta STATS
 */
function handleStats(socket) {
    const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
    
    const response = JSON.stringify({
        command: 'STATS_RESPONSE',
        stats: {
            ...stats,
            uptime,
            filesAvailable: fs.readdirSync(FILES_DIR).length
        }
    });
    
    socket.write(response + '\n');
}

/**
 * Invia errore al client
 */
function sendError(socket, message) {
    const error = JSON.stringify({
        command: 'ERROR',
        message
    });
    socket.write(error + '\n');
}

/**
 * SERVER TCP
 */
const server = net.createServer((socket) => {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    stats.activeConnections++;
    
    console.log(`\n🔌 Client connesso: ${clientId}`);
    
    // Buffer per messaggi
    let buffer = '';
    
    socket.on('data', (data) => {
        buffer += data.toString();
        
        // Cerca newline per messaggi di comando (non durante file transfer)
        const newlineIndex = buffer.indexOf('\n');
        if (newlineIndex !== -1) {
            const message = buffer.substring(0, newlineIndex).trim();
            buffer = buffer.substring(newlineIndex + 1);
            
            if (message.length === 0) return;
            
            try {
                const command = JSON.parse(message);
                
                console.log(`📨 Comando ricevuto da ${clientId}:`, command.command);
                
                switch (command.command) {
                    case 'LIST':
                        handleList(socket);
                        break;
                        
                    case 'DOWNLOAD':
                        handleDownload(socket, command.filename);
                        break;
                        
                    case 'UPLOAD':
                        handleUpload(socket, command.filename, command.size, command.checksum);
                        break;
                        
                    case 'DELETE':
                        handleDelete(socket, command.filename);
                        break;
                        
                    case 'STATS':
                        handleStats(socket);
                        break;
                        
                    default:
                        sendError(socket, 'Comando sconosciuto');
                }
                
            } catch (err) {
                console.error('Errore parsing comando:', err);
                sendError(socket, 'Comando non valido');
            }
        }
    });
    
    socket.on('end', () => {
        stats.activeConnections--;
        console.log(`👋 Client disconnesso: ${clientId}`);
    });
    
    socket.on('error', (err) => {
        console.error(`⚠️  Errore client ${clientId}:`, err.message);
    });
    
    // Benvenuto
    const welcome = JSON.stringify({
        command: 'WELCOME',
        message: 'File Transfer Server',
        commands: ['LIST', 'DOWNLOAD', 'UPLOAD', 'DELETE', 'STATS']
    });
    socket.write(welcome + '\n');
});

/**
 * EVENTI SERVER
 */
server.on('listening', () => {
    console.log('');
    console.log('═'.repeat(60));
    console.log('🚀 TCP File Transfer Server');
    console.log('═'.repeat(60));
    console.log('');
    console.log(`📡 Server in ascolto su ${HOST}:${PORT}`);
    console.log(`📂 Directory file: ${FILES_DIR}`);
    console.log('');
    console.log('💡 Comandi disponibili:');
    console.log('   LIST     - Lista file');
    console.log('   DOWNLOAD - Download file');
    console.log('   UPLOAD   - Upload file');
    console.log('   DELETE   - Elimina file');
    console.log('   STATS    - Statistiche server');
    console.log('');
    console.log('═'.repeat(60));
    console.log('');
});

server.on('error', (err) => {
    console.error('');
    console.error('⚠️  ERRORE SERVER:', err.message);
    
    if (err.code === 'EADDRINUSE') {
        console.error(`   Porta ${PORT} già in uso!`);
    }
    
    process.exit(1);
});

/**
 * AVVIO SERVER
 */
server.listen(PORT, HOST);

/**
 * GRACEFUL SHUTDOWN
 */
process.on('SIGINT', () => {
    console.log('');
    console.log('🛑 Arresto server...');
    
    console.log('');
    console.log('📊 Statistiche finali:');
    console.log(`   Upload totali: ${stats.totalUploads}`);
    console.log(`   Download totali: ${stats.totalDownloads}`);
    console.log(`   Bytes ricevuti: ${stats.bytesReceived}`);
    console.log(`   Bytes inviati: ${stats.bytesSent}`);
    
    server.close(() => {
        console.log('');
        console.log('✅ Server chiuso');
        process.exit(0);
    });
    
    setTimeout(() => {
        console.error('⚠️  Force exit');
        process.exit(1);
    }, 5000);
});
