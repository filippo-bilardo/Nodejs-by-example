# Esercitazione 2: Moduli Core di Node.js

## Descrizione

Questa esercitazione ti introdurrà ai moduli core di Node.js, che forniscono funzionalità essenziali per lo sviluppo di applicazioni. Esplorerai i moduli principali come fs, path, http, e events, imparando come utilizzarli per creare applicazioni server-side efficaci.

## Obiettivi

- Comprendere il sistema di moduli di Node.js
- Utilizzare i moduli core più importanti
- Creare un semplice server HTTP
- Gestire file e directory con il modulo fs
- Implementare un sistema di eventi personalizzato

## Esercizi Pratici

1. **Sistema di Moduli**
   - Crea un file `moduli.js` che importa e utilizza diversi moduli core
   - Sperimenta con `require()` e `module.exports`
   - Crea un modulo personalizzato e importalo in un altro file

2. **File System (fs)**
   - Crea un file `fileSystem.js` con il seguente contenuto:
     ```javascript
     const fs = require('fs');
     
     // Lettura sincrona
     try {
       const data = fs.readFileSync('esempio.txt', 'utf8');
       console.log('Lettura sincrona:', data);
     } catch (err) {
       console.error('Errore nella lettura sincrona:', err);
     }
     
     // Lettura asincrona
     fs.readFile('esempio.txt', 'utf8', (err, data) => {
       if (err) {
         console.error('Errore nella lettura asincrona:', err);
         return;
       }
       console.log('Lettura asincrona:', data);
     });
     
     // Scrittura su file
     fs.writeFile('nuovo.txt', 'Questo è un nuovo file creato con Node.js', err => {
       if (err) {
         console.error('Errore nella scrittura:', err);
         return;
       }
       console.log('File scritto con successo!');
     });
     ```
   - Crea un file `esempio.txt` con del testo di esempio
   - Esegui lo script e osserva i risultati

3. **Server HTTP**
   - Crea un file `server.js` con il seguente contenuto:
     ```javascript
     const http = require('http');
     
     const server = http.createServer((req, res) => {
       res.statusCode = 200;
       res.setHeader('Content-Type', 'text/html');
       res.end('<h1>Hello, Node.js Server!</h1><p>Il mio primo server HTTP</p>');
     });
     
     const PORT = 3000;
     server.listen(PORT, () => {
       console.log(`Server in esecuzione su http://localhost:${PORT}/`);
     });
     ```
   - Esegui lo script con `node server.js`
   - Apri il browser e visita `http://localhost:3000`

4. **Sistema di Eventi**
   - Crea un file `eventi.js` con il seguente contenuto:
     ```javascript
     const EventEmitter = require('events');
     
     // Crea una classe personalizzata basata su EventEmitter
     class MioEmettitore extends EventEmitter {}
     
     // Crea un'istanza
     const emettitore = new MioEmettitore();
     
     // Registra un listener per l'evento 'messaggio'
     emettitore.on('messaggio', (msg) => {
       console.log('Messaggio ricevuto:', msg);
     });
     
     // Emetti alcuni eventi
     emettitore.emit('messaggio', 'Ciao!');
     emettitore.emit('messaggio', 'Come stai?');
     emettitore.emit('messaggio', 'Benvenuto in Node.js!');
     ```
   - Esegui lo script e osserva come funziona il sistema di eventi

## Argomenti Teorici Collegati

- [1. Sistema di Moduli](./teoria/01-sistema-moduli.md)
- [2. File System](./teoria/02-file-system.md)
- [3. HTTP e Networking](./teoria/03-http-networking.md)
- [4. Eventi e EventEmitter](./teoria/04-eventi-eventemitter.md)
- [5. Altri Moduli Core](./teoria/05-altri-moduli-core.md)

## Risorse Aggiuntive

- [Documentazione ufficiale dei moduli core di Node.js](https://nodejs.org/docs/latest/api/)
- [Node.js File System in dettaglio](https://nodejs.dev/learn/the-nodejs-fs-module)
- [Guida completa a HTTP in Node.js](https://nodejs.dev/learn/the-nodejs-http-module)

## Prossima Esercitazione

Nella prossima esercitazione, esploreremo npm (Node Package Manager) e impareremo a utilizzare pacchetti di terze parti per estendere le funzionalità delle nostre applicazioni.

[Prossima Esercitazione](../03-NPM/README.md)