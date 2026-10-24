/**
 * TCP Echo Client
 * Client interattivo per testare il server
 */

const net = require('net');

const client = net.connect(3000, 'localhost', () => {
    console.log('Connesso al server!');
    client.write('Ciao server!');
});

client.on('data', (data) => {
    console.log('Server dice:', data.toString());
    client.end();
});

client.on('error', (err) => {
    console.error('Errore:', err.message);
});

client.on('end', () => {
    console.log('Disconnesso dal server');
});