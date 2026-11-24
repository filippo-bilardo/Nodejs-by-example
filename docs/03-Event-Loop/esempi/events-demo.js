// events-demo.js
const EventEmitter = require('events');

// Creazione di una classe personalizzata basata su EventEmitter
class GestoreApplicazione extends EventEmitter {
  constructor() {
    super();
    this.connessioni = 0;
  }
  
  // Metodo che emette un evento
  nuovaConnessione() {
    this.connessioni++;
    // Emette l'evento 'connessione' con alcuni dati
    this.emit('connessione', { 
      id: this.connessioni, 
      timestamp: new Date().toISOString() 
    });
    
    // Se raggiungiamo 5 connessioni, emettiamo un evento speciale
    if (this.connessioni === 5) {
      this.emit('milestone', { messaggio: 'Raggiunte 5 connessioni!' });
    }
  }
  
  // Metodo che emette un evento di errore
  erroreConnessione(errore) {
    this.emit('errore', { 
      messaggio: errore, 
      timestamp: new Date().toISOString() 
    });
  }
  
  // Metodo che restituisce statistiche
  getStatistiche() {
    return {
      connessioni: this.connessioni,
      memoria: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}

// Creazione di un'istanza della classe
const app = new GestoreApplicazione();

// Registrazione di un listener per l'evento 'connessione'
app.on('connessione', (dati) => {
  console.log(`Nuova connessione stabilita! ID: ${dati.id}, Orario: ${dati.timestamp}`);
});

// Registrazione di un listener per l'evento 'milestone'
app.on('milestone', (dati) => {
  console.log(`MILESTONE RAGGIUNTA: ${dati.messaggio}`);
  console.log('Statistiche attuali:', app.getStatistiche());
});

// Registrazione di un listener per l'evento 'errore'
app.on('errore', (dati) => {
  console.error(`ERRORE: ${dati.messaggio}, Orario: ${dati.timestamp}`);
});

// Registrazione di un listener una tantum (once)
app.once('connessione', () => {
  console.log('Prima connessione rilevata! Questo messaggio apparirà solo una volta.');
});

// Simulazione di connessioni
console.log('Simulazione di connessioni in corso...');

// Simuliamo 6 connessioni con un intervallo di tempo
let contatore = 0;
const intervallo = setInterval(() => {
  contatore++;
  
  if (contatore <= 6) {
    console.log(`\nTentativo di connessione #${contatore}`);
    
    // Simuliamo un errore casuale
    if (contatore === 3) {
      app.erroreConnessione('Timeout della connessione');
    } else {
      app.nuovaConnessione();
    }
  } else {
    // Fermiamo l'intervallo dopo 6 tentativi
    clearInterval(intervallo);
    
    // Mostriamo le statistiche finali
    console.log('\nSimulazione completata!');
    console.log('Statistiche finali:', app.getStatistiche());
    
    // Rimozione di tutti i listener
    console.log('\nRimozione di tutti i listener...');
    app.removeAllListeners();
    console.log('Numero di listener per evento "connessione":', app.listenerCount('connessione'));
  }
}, 1000);

// Mostriamo alcuni metodi utili di EventEmitter
console.log('\nInformazioni su EventEmitter:');
console.log('Eventi registrati:', app.eventNames());
console.log('Numero di listener per evento "connessione":', app.listenerCount('connessione'));
console.log('Numero massimo di listener (default):', EventEmitter.defaultMaxListeners);

// Nota: per terminare prima il programma, premere Ctrl+C nella console