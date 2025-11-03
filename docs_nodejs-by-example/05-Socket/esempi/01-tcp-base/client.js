/**
 * TCP Echo Client
 * Client interattivo per testare il server
 */

const net = require('net');

const client = net.connect(3000, 'localhost');

client.on('data', (data) => {
    console.log('Server dice:', data.toString());
});

client.write('Ciao server!');
client.end();