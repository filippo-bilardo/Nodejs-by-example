// echo-server.js
const net = require('net');

// Creiamo un server TCP che ascolta sulla porta 4000 e sull’indirizzo 127.0.0.1
// Il callback viene eseguito per ogni connessione in entrata
const server = net.createServer((socket) => {
  // socket è un oggetto net.Socket che rappresenta la connessione con il client
  console.log(`Connesso: ${socket.remoteAddress}:${socket.remotePort}`);

  // echo dei dati (possibilmente frammentati) ricevuti
  // l'evento 'data' viene emesso ogni volta che arrivano dei byte
  socket.on('data', (chunk) => {socket.write(chunk);});
  // l’evento 'end' indica che il client ha chiuso la scrittura (ha inviato FIN)
  socket.on('end', () => console.log('Il client ha chiuso la scrittura'));
  // l’evento 'close' indica che il socket è completamente chiuso
  socket.on('close', () => console.log('Connessione chiusa'));
  socket.on('error', (err) => console.error('Errore socket:', err.message));
});

server.on('error', (err) => console.error('Errore server:', err.message));

server.listen(4000, '127.0.0.1', () => {
  console.log('Server in ascolto su', server.address());
});