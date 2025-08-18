// events-demo.js
const EventEmitter = require('events');

// Creazione di una classe personalizzata basata su EventEmitter
class GestoreMessaggi extends EventEmitter {}

// Istanza del gestore di eventi
const gestore = new GestoreMessaggi();

// Registrazione di un listener per l'evento 'messaggio'
gestore.on('messaggio', (msg, utente) => {
  console.log(`${utente}: ${msg}`);
});

// Registrazione di un listener che si attiva solo una volta
gestore.once('evento-singolo', () => {
  console.log('Questo verrà stampato solo una volta');
});

// Emissione di eventi
gestore.emit('messaggio', 'Ciao mondo!', 'Utente1');
gestore.emit('messaggio', 'Come stai?', 'Utente2');
gestore.emit('evento-singolo');
gestore.emit('evento-singolo'); // Questo non produrrà output

// Listener per gestire gli errori
gestore.on('error', (err) => {
  console.error('Errore:', err.message);
});

// Emettere un errore
gestore.emit('error', new Error('Qualcosa è andato storto'));