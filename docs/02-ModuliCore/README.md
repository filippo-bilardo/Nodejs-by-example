# Esercitazione 2: Moduli Core di Node.js

In questa esercitazione esploreremo i moduli core di Node.js, imparando come utilizzare le funzionalità native senza dipendenze esterne.

## Obiettivi
- Comprendere il sistema di moduli di Node.js
- Utilizzare i principali moduli core
- Implementare funzionalità comuni con i moduli built-in

## Argomenti Teorici Collegati
- [Sistema di Moduli in Node.js](../teoria/02-moduli.md#sistema-di-moduli)
- [Moduli Core Principali](../teoria/02-moduli.md#moduli-core-principali)
- [CommonJS vs ES Modules](../teoria/02-moduli.md#commonjs-vs-es-modules)

## Esercizi Pratici

### Esercizio 2.1: Modulo Path
Il modulo `path` fornisce utilità per lavorare con percorsi di file e directory.

```javascript
// path-demo.js
const path = require('path');

// Informazioni sul file corrente
console.log('Nome del file:', path.basename(__filename));
console.log('Directory:', path.dirname(__filename));
console.log('Estensione:', path.extname(__filename));

// Creazione di un percorso
const nuovoPercorso = path.join(__dirname, 'files', 'esempio.txt');
console.log('Nuovo percorso:', nuovoPercorso);

// Normalizzazione percorsi
console.log('Percorso normalizzato:', path.normalize('/test/test1//2slashes/1slash/tab/..'));

// Percorsi assoluti vs relativi
console.log('Risoluzione percorso:', path.resolve('temp', 'file.txt'));
```

### Esercizio 2.2: Modulo OS
Il modulo `os` fornisce metodi per interagire con il sistema operativo.

```javascript
// os-demo.js
const os = require('os');

// Informazioni sulla piattaforma
console.log('Sistema operativo:', os.platform());
console.log('Architettura:', os.arch());
console.log('Versione:', os.version());

// Informazioni sulla CPU
console.log('CPU:', os.cpus().length, 'core');
console.log('Tipo CPU:', os.cpus()[0].model);

// Informazioni sulla memoria
console.log('Memoria totale:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('Memoria libera:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');

// Informazioni utente
console.log('Utente corrente:', os.userInfo().username);
console.log('Home directory:', os.homedir());
console.log('Directory temporanea:', os.tmpdir());
```

### Esercizio 2.3: Modulo URL
Il modulo `url` fornisce utilità per il parsing degli URL.

```javascript
// url-demo.js
const url = require('url');

// Analisi di un URL
const indirizzo = 'http://example.com:8080/path/to/page?query=string&name=value#anchor';
const parsedUrl = new URL(indirizzo);

console.log('Host:', parsedUrl.host);
console.log('Pathname:', parsedUrl.pathname);
console.log('Search:', parsedUrl.search);
console.log('Parametri di ricerca:', parsedUrl.searchParams.get('query'));
console.log('Hash:', parsedUrl.hash);

// Creazione di un URL
const newUrl = new URL('https://example.org');
newUrl.pathname = '/products';
newUrl.search = '?category=electronics';
console.log('URL costruito:', newUrl.href);
```

### Esercizio 2.4: Modulo Util
Il modulo `util` fornisce funzioni di utilità.

```javascript
// util-demo.js
const util = require('util');
const fs = require('fs');

// Deprecazione
util.deprecate(() => {
  console.log('Questa funzione è deprecata');
}, 'Usare la nuova funzione invece')(1, 2, 3);

// Promisify: convertire callback in promises
const readFile = util.promisify(fs.readFile);

// Utilizzare la versione promisified
readFile(__filename, 'utf8')
  .then(data => console.log('File letto con successo'))
  .catch(err => console.error('Errore nella lettura:', err));

// Formattazione di stringhe
console.log(util.format('La %s è %d. Oggetto: %j', 'risposta', 42, { hello: 'world' }));

// Ispezione di oggetti
const obj = { 
  name: 'Node.js', 
  versions: process.versions, 
  env: process.env 
};
console.log(util.inspect(obj, { depth: 1, colors: true }));
```

### Esercizio 2.5: Eventi con EventEmitter
Il modulo `events` permette di creare e gestire eventi.

```javascript
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
```

## Sfida Aggiuntiva
Crea un'applicazione per monitorare le risorse del sistema che utilizza i moduli `os`, `events` e `util`. L'applicazione dovrebbe emettere eventi quando l'utilizzo della memoria o della CPU supera determinate soglie.

```javascript
// Esempio di implementazione (da sviluppare autonomamente)
const EventEmitter = require('events');
const os = require('os');
const util = require('util');

class MonitorRisorse extends EventEmitter {
  constructor(intervalloMs = 2000) {
    super();
    this.intervalloMs = intervalloMs;
    this.intervallo = null;
  }
  
  avvia() {
    this.intervallo = setInterval(() => {
      const memUso = process.memoryUsage();
      const memoriaUtilizzata = memUso.rss / os.totalmem() * 100;
      
      if (memoriaUtilizzata > 70) {
        this.emit('memoria-alta', memoriaUtilizzata);
      }
      
      // Aggiungi altre metriche da monitorare
    }, this.intervalloMs);
  }
  
  ferma() {
    clearInterval(this.intervallo);
  }
}

// Utilizzo
const monitor = new MonitorRisorse(1000);
monitor.on('memoria-alta', (percentuale) => {
  console.log(`ATTENZIONE: Utilizzo memoria alto (${percentuale.toFixed(2)}%)`);
});
monitor.avvia();
```

## Risorse Aggiuntive
- [Documentazione moduli core di Node.js](https://nodejs.org/dist/latest-v16.x/docs/api/)
- [Path module](https://nodejs.org/api/path.html)
- [OS module](https://nodejs.org/api/os.html)
- [URL module](https://nodejs.org/api/url.html)
- [Util module](https://nodejs.org/api/util.html)
- [Events module](https://nodejs.org/api/events.html)

## Navigazione

- [Indice del Corso](../README.md)
- Modulo Precedente: [Introduzione a Node.js](../01-Introduzione/README.md)
- Modulo Successivo: [Sistema di File](../03-Sistema_di_File_in_Node.js/README.md.md)