const net = require('net');

const server = net.createServer((socket) => {
    // socket è un EventEmitter

    //TODO: controllare se l'evento 'connection' funziona effettivamente
    //socket.on('connection', (socket) => {
    //    console.log('Client connesso :', socket.remoteAddress + ':' + socket.remotePort);
    });

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