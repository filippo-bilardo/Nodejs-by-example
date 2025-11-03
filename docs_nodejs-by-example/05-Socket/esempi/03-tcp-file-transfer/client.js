/**
 * TCP File Transfer Client
 * Client per upload/download file
 */

const net = require('net');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

// Configurazione
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');

// Crea directory downloads se non esiste
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// Client state
let client = null;
let buffer = '';
let isReceivingFile = false;
let downloadState = null;

/**
 * Calcola checksum MD5
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
 * Connetti al server
 */
function connect() {
    return new Promise((resolve, reject) => {
        client = net.connect(PORT, HOST, () => {
            console.log(`✅ Connesso a ${HOST}:${PORT}`);
            resolve();
        });
        
        client.on('data', handleData);
        
        client.on('end', () => {
            console.log('\n🔌 Disconnesso dal server');
        });
        
        client.on('error', (err) => {
            console.error('\n⚠️  Errore connessione:', err.message);
            reject(err);
        });
    });
}

/**
 * Gestisce dati ricevuti
 */
function handleData(data) {
    if (isReceivingFile) {
        // Ricezione file in corso
        downloadState.writeStream.write(data);
        downloadState.bytesReceived += data.length;
        
        const progress = Math.floor((downloadState.bytesReceived / downloadState.fileSize) * 100);
        
        // Mostra progress ogni 10%
        if (progress >= downloadState.lastProgress + 10) {
            downloadState.lastProgress = progress;
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`📥 Download: ${progress}%`);
        }
        
        // Fine ricezione
        if (downloadState.bytesReceived >= downloadState.fileSize) {
            downloadState.writeStream.end();
            isReceivingFile = false;
            console.log(''); // Newline dopo progress
        }
        
        return;
    }
    
    // Messaggi di comando
    buffer += data.toString();
    
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        const message = buffer.substring(0, newlineIndex).trim();
        buffer = buffer.substring(newlineIndex + 1);
        
        if (message.length === 0) continue;
        
        try {
            const response = JSON.parse(message);
            handleResponse(response);
        } catch (err) {
            console.error('⚠️  Messaggio non valido:', message);
        }
    }
}

/**
 * Gestisce risposta server
 */
async function handleResponse(response) {
    switch (response.command) {
        case 'WELCOME':
            console.log(`\n📡 ${response.message}`);
            console.log('Comandi:', response.commands.join(', '));
            break;
            
        case 'LIST_RESPONSE':
            console.log(`\n📋 File disponibili (${response.count}):`);
            if (response.files.length === 0) {
                console.log('   Nessun file');
            } else {
                response.files.forEach(file => {
                    const sizeKB = (file.size / 1024).toFixed(2);
                    console.log(`   📄 ${file.name} (${sizeKB} KB) - ${file.modified}`);
                });
            }
            break;
            
        case 'DOWNLOAD_START':
            console.log(`\n📥 Inizio download: ${response.filename}`);
            console.log(`   Size: ${response.size} bytes`);
            console.log(`   Checksum: ${response.checksum}`);
            
            const downloadPath = path.join(DOWNLOAD_DIR, response.filename);
            
            downloadState = {
                filename: response.filename,
                fileSize: response.size,
                checksum: response.checksum,
                writeStream: fs.createWriteStream(downloadPath),
                bytesReceived: 0,
                lastProgress: 0
            };
            
            downloadState.writeStream.on('finish', async () => {
                try {
                    const actualChecksum = await calculateChecksum(downloadPath);
                    
                    if (actualChecksum !== downloadState.checksum) {
                        fs.unlinkSync(downloadPath);
                        console.error('❌ Checksum non corrisponde - file eliminato');
                    } else {
                        console.log(`✅ Download completato: ${downloadPath}`);
                    }
                } catch (err) {
                    console.error('❌ Errore verifica checksum:', err);
                }
                
                downloadState = null;
            });
            
            isReceivingFile = true;
            break;
            
        case 'UPLOAD_READY':
            console.log(`\n📤 Server pronto a ricevere: ${response.filename}`);
            break;
            
        case 'UPLOAD_COMPLETE':
            console.log(`\n✅ Upload completato: ${response.filename}`);
            console.log(`   Size: ${response.size} bytes`);
            console.log(`   Checksum: ${response.checksum}`);
            break;
            
        case 'DELETE_COMPLETE':
            console.log(`\n🗑️  File eliminato: ${response.filename}`);
            break;
            
        case 'STATS_RESPONSE':
            console.log('\n📊 Statistiche server:');
            console.log(`   Upload totali: ${response.stats.totalUploads}`);
            console.log(`   Download totali: ${response.stats.totalDownloads}`);
            console.log(`   Bytes ricevuti: ${response.stats.bytesReceived}`);
            console.log(`   Bytes inviati: ${response.stats.bytesSent}`);
            console.log(`   Connessioni attive: ${response.stats.activeConnections}`);
            console.log(`   Uptime: ${response.stats.uptime}s`);
            console.log(`   File disponibili: ${response.stats.filesAvailable}`);
            break;
            
        case 'ERROR':
            console.error(`\n❌ Errore: ${response.message}`);
            break;
            
        default:
            console.log('Risposta:', response);
    }
}

/**
 * Invia comando LIST
 */
function sendList() {
    const command = JSON.stringify({ command: 'LIST' });
    client.write(command + '\n');
}

/**
 * Invia comando DOWNLOAD
 */
function sendDownload(filename) {
    const command = JSON.stringify({ 
        command: 'DOWNLOAD',
        filename 
    });
    client.write(command + '\n');
}

/**
 * Invia comando UPLOAD
 */
async function sendUpload(localPath) {
    if (!fs.existsSync(localPath)) {
        console.error('❌ File non trovato:', localPath);
        return;
    }
    
    const filename = path.basename(localPath);
    const stat = fs.statSync(localPath);
    const checksum = await calculateChecksum(localPath);
    
    console.log(`\n📤 Upload: ${filename}`);
    console.log(`   Size: ${stat.size} bytes`);
    console.log(`   Checksum: ${checksum}`);
    
    // Invia metadata
    const command = JSON.stringify({
        command: 'UPLOAD',
        filename,
        size: stat.size,
        checksum
    });
    client.write(command + '\n');
    
    // Aspetta conferma server
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Invia file
    const readStream = fs.createReadStream(localPath);
    let bytesSent = 0;
    let lastProgress = 0;
    
    readStream.on('data', (chunk) => {
        client.write(chunk);
        bytesSent += chunk.length;
        
        const progress = Math.floor((bytesSent / stat.size) * 100);
        if (progress >= lastProgress + 10) {
            lastProgress = progress;
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`📤 Upload: ${progress}%`);
        }
    });
    
    readStream.on('end', () => {
        console.log(''); // Newline
    });
    
    readStream.on('error', (err) => {
        console.error('\n❌ Errore lettura file:', err);
    });
}

/**
 * Invia comando DELETE
 */
function sendDelete(filename) {
    const command = JSON.stringify({ 
        command: 'DELETE',
        filename 
    });
    client.write(command + '\n');
}

/**
 * Invia comando STATS
 */
function sendStats() {
    const command = JSON.stringify({ command: 'STATS' });
    client.write(command + '\n');
}

/**
 * Mostra help
 */
function showHelp() {
    console.log('\n📖 Comandi disponibili:');
    console.log('   list                  - Lista file sul server');
    console.log('   download <filename>   - Download file dal server');
    console.log('   upload <filepath>     - Upload file al server');
    console.log('   delete <filename>     - Elimina file dal server');
    console.log('   stats                 - Statistiche server');
    console.log('   help                  - Mostra questo help');
    console.log('   quit                  - Disconnetti');
}

/**
 * Interfaccia readline
 */
async function startInteractive() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '> '
    });
    
    console.log('\n💡 Scrivi "help" per la lista comandi\n');
    rl.prompt();
    
    rl.on('line', async (line) => {
        const parts = line.trim().split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        switch (command) {
            case 'list':
                sendList();
                break;
                
            case 'download':
                if (args.length === 0) {
                    console.log('❌ Uso: download <filename>');
                } else {
                    sendDownload(args[0]);
                }
                break;
                
            case 'upload':
                if (args.length === 0) {
                    console.log('❌ Uso: upload <filepath>');
                } else {
                    await sendUpload(args[0]);
                }
                break;
                
            case 'delete':
                if (args.length === 0) {
                    console.log('❌ Uso: delete <filename>');
                } else {
                    sendDelete(args[0]);
                }
                break;
                
            case 'stats':
                sendStats();
                break;
                
            case 'help':
                showHelp();
                break;
                
            case 'quit':
            case 'exit':
                console.log('\n👋 Disconnessione...');
                rl.close();
                client.end();
                process.exit(0);
                break;
                
            case '':
                break;
                
            default:
                console.log(`❌ Comando sconosciuto: ${command}`);
                console.log('💡 Scrivi "help" per la lista comandi');
        }
        
        rl.prompt();
    });
}

/**
 * MAIN
 */
async function main() {
    try {
        await connect();
        await startInteractive();
        
    } catch (err) {
        console.error('❌ Errore:', err.message);
        process.exit(1);
    }
}

/**
 * CTRL+C
 */
process.on('SIGINT', () => {
    console.log('\n\n👋 Disconnessione...');
    if (client) client.end();
    process.exit(0);
});

// Avvia
main();
