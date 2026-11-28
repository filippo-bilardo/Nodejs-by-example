/**
 * TCP Echo Server
 * Server TCP stampa i messaggi ricevuti dai client 
 * e invia un messaggio di benvenuto
 */

const net = require('net');

const server = net.createServer((socket) => {
    console.log('Client connesso!');
    
    socket.write('Benvenuto!\n');
    
    socket.on('data', (data) => {
        console.log('Ricevuto:', data.toString());
    });
});

server.listen(3000);