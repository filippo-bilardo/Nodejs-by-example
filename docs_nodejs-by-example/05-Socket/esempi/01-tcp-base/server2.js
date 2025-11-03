/**
 * TCP Server
 * 
 * Server TCP che stampa i messaggi ricevuti dai client 
 * e invia un messaggio di benvenuto
 */
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

process.on('SIGINT', () => {
    console.log('Chiusura server...');
    server.close(() => {
        console.log('Server chiuso');
        process.exit(0);
    });
});
