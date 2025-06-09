# Esercitazione 3: Sistema di File in Node.js

## Descrizione

Questa esercitazione ti introdurrà al modulo `fs` (File System) di Node.js, che permette di interagire con il file system del sistema operativo. Imparerai come leggere, scrivere, modificare e gestire file e directory utilizzando le API sincrone e asincrone fornite da Node.js.

## Obiettivi

- Comprendere il funzionamento del modulo `fs` di Node.js
- Imparare a leggere e scrivere file in modo sincrono e asincrono
- Gestire directory e file path con il modulo `path`
- Implementare operazioni di file watching e streaming
- Comprendere le best practices per la gestione dei file in Node.js

## Esercizi Pratici

### Esercizio 3.1: Lettura e Scrittura di File

1. Crea un nuovo file chiamato `file-operations.js` con il seguente contenuto:

```javascript
const fs = require('fs');

// Scrittura sincrona di un file
try {
  fs.writeFileSync('file-sincrono.txt', 'Questo è un contenuto scritto in modo sincrono.');
  console.log('File scritto con successo in modo sincrono.');
} catch (err) {
  console.error('Errore nella scrittura sincrona:', err);
}

// Lettura sincrona di un file
try {
  const data = fs.readFileSync('file-sincrono.txt', 'utf8');
  console.log('Contenuto del file (lettura sincrona):', data);
} catch (err) {
  console.error('Errore nella lettura sincrona:', err);
}

// Scrittura asincrona di un file
fs.writeFile('file-asincrono.txt', 'Questo è un contenuto scritto in modo asincrono.', (err) => {
  if (err) {
    console.error('Errore nella scrittura asincrona:', err);
    return;
  }
  console.log('File scritto con successo in modo asincrono.');
  
  // Lettura asincrona di un file (all'interno del callback per garantire l'ordine)
  fs.readFile('file-asincrono.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Errore nella lettura asincrona:', err);
      return;
    }
    console.log('Contenuto del file (lettura asincrona):', data);
  });
});
```

2. Esegui il file con Node.js:

```bash
node file-operations.js
```

3. Osserva l'output e verifica la creazione dei file nel tuo sistema.

### Esercizio 3.2: Gestione dei Path

1. Crea un nuovo file chiamato `path-operations.js` con il seguente contenuto:

```javascript
const path = require('path');

// Informazioni sul path corrente
const filePath = '/cartella/sottocartella/file.txt';

console.log('Nome del file:', path.basename(filePath));
console.log('Estensione:', path.extname(filePath));
console.log('Directory:', path.dirname(filePath));

// Normalizzazione dei path
const percorsoNonNormalizzato = '/cartella//sottocartella/../file.txt';
console.log('Percorso normalizzato:', path.normalize(percorsoNonNormalizzato));

// Unione di path
const percorsoBase = '/cartella';
const sottocartella = 'sottocartella';
const nomeFile = 'file.txt';

const percorsoCompleto = path.join(percorsoBase, sottocartella, nomeFile);
console.log('Percorso completo:', percorsoCompleto);

// Percorso assoluto
console.log('Percorso assoluto del file corrente:', path.resolve(__filename));
console.log('Directory corrente:', path.resolve(__dirname));
```

2. Esegui il file con Node.js:

```bash
node path-operations.js
```

3. Analizza l'output per comprendere le diverse operazioni sui path.

### Esercizio 3.3: Operazioni su Directory

1. Crea un nuovo file chiamato `directory-operations.js` con il seguente contenuto:

```javascript
const fs = require('fs');
const path = require('path');

// Nome della directory da creare
const dirName = 'nuova-directory';

// Verifica se la directory esiste
if (!fs.existsSync(dirName)) {
  // Creazione della directory
  fs.mkdirSync(dirName);
  console.log(`Directory '${dirName}' creata con successo.`);
} else {
  console.log(`La directory '${dirName}' esiste già.`);
}

// Creazione di un file nella nuova directory
const filePath = path.join(dirName, 'test.txt');
fs.writeFileSync(filePath, 'Questo è un file di test.');
console.log(`File '${filePath}' creato con successo.`);

// Lettura del contenuto della directory
fs.readdir(dirName, (err, files) => {
  if (err) {
    console.error('Errore nella lettura della directory:', err);
    return;
  }
  console.log(`Contenuto della directory '${dirName}':`, files);
});

// Rimozione del file (decommentare per eseguire)
/*
fs.unlinkSync(filePath);
console.log(`File '${filePath}' rimosso con successo.`);

// Rimozione della directory (decommentare per eseguire)
fs.rmdirSync(dirName);
console.log(`Directory '${dirName}' rimossa con successo.`);
*/
```

2. Esegui il file con Node.js:

```bash
node directory-operations.js
```

3. Osserva l'output e verifica la creazione della directory e del file nel tuo sistema.

### Esercizio 3.4: File Watching

1. Crea un nuovo file chiamato `file-watcher.js` con il seguente contenuto:

```javascript
const fs = require('fs');

// File da monitorare
const fileToWatch = 'file-to-watch.txt';

// Crea il file se non esiste
if (!fs.existsSync(fileToWatch)) {
  fs.writeFileSync(fileToWatch, 'Contenuto iniziale');
  console.log(`File '${fileToWatch}' creato con successo.`);
}

console.log(`Monitoraggio del file '${fileToWatch}'...`);
console.log('Modifica il file per vedere gli eventi generati.');

// Inizia il monitoraggio del file
const watcher = fs.watch(fileToWatch, (eventType, filename) => {
  console.log(`Evento: ${eventType}`);
  if (filename) {
    console.log(`File modificato: ${filename}`);
    // Leggi il contenuto aggiornato
    const content = fs.readFileSync(fileToWatch, 'utf8');
    console.log(`Nuovo contenuto: ${content}`);
  }
});

// Per interrompere il monitoraggio dopo 30 secondi
setTimeout(() => {
  watcher.close();
  console.log('Monitoraggio interrotto.');
}, 30000);
```

2. Esegui il file con Node.js:

```bash
node file-watcher.js
```

3. Mentre il programma è in esecuzione, apri un altro terminale o editor di testo e modifica il file `file-to-watch.txt`. Osserva come il programma rileva e reagisce alle modifiche.

### Esercizio 3.5: Streaming di File

1. Crea un nuovo file chiamato `file-streaming.js` con il seguente contenuto:

```javascript
const fs = require('fs');
const path = require('path');

// Creazione di un file di grandi dimensioni per il test
const largeFilePath = 'large-file.txt';
const outputFilePath = 'large-file-copy.txt';

// Crea un file di test se non esiste
if (!fs.existsSync(largeFilePath)) {
  console.log('Creazione di un file di grandi dimensioni per il test...');
  const writeStream = fs.createWriteStream(largeFilePath);
  
  // Scrive 1MB di dati (1000 righe di circa 1KB ciascuna)
  for (let i = 0; i < 1000; i++) {
    writeStream.write(`Questa è la riga ${i} del file di test. Contiene dati casuali per simulare un file di grandi dimensioni. ${'X'.repeat(900)}\n`);
  }
  
  writeStream.end();
  console.log(`File '${largeFilePath}' creato con successo.`);
}

console.log('Inizio della copia del file utilizzando gli stream...');
const startTime = Date.now();

// Copia del file utilizzando gli stream
const readStream = fs.createReadStream(largeFilePath);
const writeStream = fs.createWriteStream(outputFilePath);

// Gestione degli eventi dello stream
readStream.on('error', (err) => {
  console.error('Errore nella lettura:', err);
});

writeStream.on('error', (err) => {
  console.error('Errore nella scrittura:', err);
});

writeStream.on('finish', () => {
  const endTime = Date.now();
  console.log(`Copia completata in ${endTime - startTime} ms.`);
  
  // Verifica delle dimensioni dei file
  const originalSize = fs.statSync(largeFilePath).size;
  const copiedSize = fs.statSync(outputFilePath).size;
  
  console.log(`Dimensione del file originale: ${originalSize} byte`);
  console.log(`Dimensione del file copiato: ${copiedSize} byte`);
});

// Pipe: collega lo stream di lettura a quello di scrittura
readStream.pipe(writeStream);
```

2. Esegui il file con Node.js:

```bash
node file-streaming.js
```

3. Osserva l'output e verifica la creazione e la copia del file di grandi dimensioni.

## Sfida Aggiuntiva

Crea un'applicazione di gestione file che permetta di:

1. Visualizzare il contenuto di una directory
2. Creare, leggere, aggiornare ed eliminare file
3. Copiare e spostare file tra directory
4. Monitorare una directory per cambiamenti

Utilizza le conoscenze acquisite in questa esercitazione per implementare tutte le funzionalità richieste.

```javascript
// file-manager.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Creazione dell'interfaccia readline per l'input/output
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Directory corrente
let currentDir = process.cwd();

// Funzione per visualizzare il menu
function showMenu() {
  console.log('\n===== Gestore File =====');
  console.log(`Directory corrente: ${currentDir}`);
  console.log('1. Visualizza contenuto directory');
  console.log('2. Cambia directory');
  console.log('3. Crea file');
  console.log('4. Leggi file');
  console.log('5. Aggiorna file');
  console.log('6. Elimina file');
  console.log('7. Copia file');
  console.log('8. Sposta file');
  console.log('9. Monitora directory');
  console.log('0. Esci');
  
  rl.question('Seleziona un'opzione: ', handleOption);
}

// Funzione per gestire l'opzione selezionata
function handleOption(option) {
  switch (option) {
    case '1':
      listDirectoryContents();
      break;
    case '2':
      changeDirectory();
      break;
    case '3':
      createFile();
      break;
    case '4':
      readFile();
      break;
    case '5':
      updateFile();
      break;
    case '6':
      deleteFile();
      break;
    case '7':
      copyFile();
      break;
    case '8':
      moveFile();
      break;
    case '9':
      watchDirectory();
      break;
    case '0':
      console.log('Grazie per aver utilizzato il Gestore File!');
      rl.close();
      return;
    default:
      console.log('Opzione non valida. Riprova.');
      showMenu();
      return;
  }
}

// Implementa le funzioni per ogni opzione del menu
// ...

// Avvia l'applicazione
showMenu();
```

## Argomenti Teorici Collegati

- [1. Introduzione al File System in Node.js](./teoria/01-introduzione-fs.md)
- [2. API Sincrone vs Asincrone](./teoria/02-sync-vs-async.md)
- [3. Gestione dei Path](./teoria/03-gestione-path.md)
- [4. Streaming di File](./teoria/04-streaming.md)
- [5. File Watching e Eventi](./teoria/05-file-watching.md)

## Risorse Aggiuntive

- [Documentazione ufficiale del modulo fs](https://nodejs.org/api/fs.html)
- [Documentazione ufficiale del modulo path](https://nodejs.org/api/path.html)
- [Guida agli stream in Node.js](https://nodejs.org/api/stream.html)

## Navigazione

- [Indice del Corso](../README.md)
- Modulo Precedente: [Moduli Core](../02-ModuliCore/README.md)
- Modulo Successivo: [Moduli Personalizzati](../04-ModuliPersonalizzati/README.md)