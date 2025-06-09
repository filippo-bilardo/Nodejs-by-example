# File System in Node.js

## Introduzione

Il modulo `fs` (File System) è uno dei moduli core più importanti di Node.js. Fornisce un'API per interagire con il file system in modo simile alle funzioni POSIX standard. Questo modulo permette di leggere, scrivere, modificare e cancellare file e directory.

## Importare il Modulo

```javascript
const fs = require('fs');
```

## Operazioni Sincrone vs Asincrone

Il modulo `fs` offre sia metodi sincroni che asincroni. I metodi sincroni bloccano l'esecuzione del programma fino al completamento dell'operazione, mentre quelli asincroni non bloccano e utilizzano callback o Promise per gestire il risultato.

### Esempio Sincrono

```javascript
const fs = require('fs');

try {
  const data = fs.readFileSync('file.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error('Errore:', err);
}
```

### Esempio Asincrono con Callback

```javascript
const fs = require('fs');

fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Errore:', err);
    return;
  }
  console.log(data);
});
```

### Esempio Asincrono con Promise (fs/promises)

Dalle versioni più recenti di Node.js, è disponibile anche un'API basata su Promise:

```javascript
const fs = require('fs/promises');

async function leggiFile() {
  try {
    const data = await fs.readFile('file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('Errore:', err);
  }
}

leggiFile();
```

## Operazioni Comuni sui File

### Leggere un File

```javascript
// Sincrono
const contenuto = fs.readFileSync('file.txt', 'utf8');

// Asincrono con callback
fs.readFile('file.txt', 'utf8', (err, contenuto) => {
  if (err) throw err;
  console.log(contenuto);
});

// Asincrono con Promise
async function leggi() {
  const contenuto = await fs.promises.readFile('file.txt', 'utf8');
  console.log(contenuto);
}
```

### Scrivere su un File

```javascript
// Sincrono
fs.writeFileSync('file.txt', 'Contenuto del file');

// Asincrono con callback
fs.writeFile('file.txt', 'Contenuto del file', (err) => {
  if (err) throw err;
  console.log('File salvato!');
});

// Asincrono con Promise
async function scrivi() {
  await fs.promises.writeFile('file.txt', 'Contenuto del file');
  console.log('File salvato!');
}
```

### Aggiungere Contenuto a un File

```javascript
// Sincrono
fs.appendFileSync('file.txt', '\nNuova riga');

// Asincrono con callback
fs.appendFile('file.txt', '\nNuova riga', (err) => {
  if (err) throw err;
  console.log('Contenuto aggiunto!');
});

// Asincrono con Promise
async function aggiungi() {
  await fs.promises.appendFile('file.txt', '\nNuova riga');
  console.log('Contenuto aggiunto!');
}
```

### Eliminare un File

```javascript
// Sincrono
fs.unlinkSync('file.txt');

// Asincrono con callback
fs.unlink('file.txt', (err) => {
  if (err) throw err;
  console.log('File eliminato!');
});

// Asincrono con Promise
async function elimina() {
  await fs.promises.unlink('file.txt');
  console.log('File eliminato!');
}
```

## Operazioni su Directory

### Creare una Directory

```javascript
// Sincrono
fs.mkdirSync('nuovaCartella');

// Asincrono con callback
fs.mkdir('nuovaCartella', (err) => {
  if (err) throw err;
  console.log('Directory creata!');
});

// Asincrono con Promise
async function creaDir() {
  await fs.promises.mkdir('nuovaCartella');
  console.log('Directory creata!');
}
```

### Leggere il Contenuto di una Directory

```javascript
// Sincrono
const files = fs.readdirSync('cartella');
console.log(files);

// Asincrono con callback
fs.readdir('cartella', (err, files) => {
  if (err) throw err;
  console.log(files);
});

// Asincrono con Promise
async function leggiDir() {
  const files = await fs.promises.readdir('cartella');
  console.log(files);
}
```

### Eliminare una Directory

```javascript
// Sincrono
fs.rmdirSync('cartella');

// Asincrono con callback
fs.rmdir('cartella', (err) => {
  if (err) throw err;
  console.log('Directory eliminata!');
});

// Asincrono con Promise
async function eliminaDir() {
  await fs.promises.rmdir('cartella');
  console.log('Directory eliminata!');
}
```

## Informazioni sui File

```javascript
// Sincrono
const stats = fs.statSync('file.txt');
console.log(`È un file: ${stats.isFile()}`);
console.log(`È una directory: ${stats.isDirectory()}`);
console.log(`Dimensione: ${stats.size} byte`);

// Asincrono con callback
fs.stat('file.txt', (err, stats) => {
  if (err) throw err;
  console.log(`È un file: ${stats.isFile()}`);
  console.log(`È una directory: ${stats.isDirectory()}`);
  console.log(`Dimensione: ${stats.size} byte`);
});

// Asincrono con Promise
async function infoFile() {
  const stats = await fs.promises.stat('file.txt');
  console.log(`È un file: ${stats.isFile()}`);
  console.log(`È una directory: ${stats.isDirectory()}`);
  console.log(`Dimensione: ${stats.size} byte`);
}
```

## Stream di File

Gli stream sono particolarmente utili quando si lavora con file di grandi dimensioni, poiché consentono di elaborare i dati in piccoli blocchi anziché caricare l'intero file in memoria.

### Leggere un File con Stream

```javascript
const fs = require('fs');
const readStream = fs.createReadStream('file.txt', 'utf8');

readStream.on('data', (chunk) => {
  console.log('Chunk ricevuto:', chunk);
});

readStream.on('end', () => {
  console.log('Lettura completata');
});

readStream.on('error', (err) => {
  console.error('Errore:', err);
});
```

### Scrivere su un File con Stream

```javascript
const fs = require('fs');
const writeStream = fs.createWriteStream('output.txt');

writeStream.write('Prima riga\n');
writeStream.write('Seconda riga\n');
writeStream.end('Ultima riga');

writeStream.on('finish', () => {
  console.log('Scrittura completata');
});

writeStream.on('error', (err) => {
  console.error('Errore:', err);
});
```

### Pipe tra Stream

```javascript
const fs = require('fs');
const readStream = fs.createReadStream('input.txt');
const writeStream = fs.createWriteStream('output.txt');

// Copia il contenuto da input.txt a output.txt
readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('Copia completata');
});
```

## Osservare i Cambiamenti nei File

```javascript
const fs = require('fs');

fs.watch('file.txt', (eventType, filename) => {
  console.log(`Evento: ${eventType}`);
  if (filename) {
    console.log(`File modificato: ${filename}`);
  }
});
```

## Conclusione

Il modulo `fs` di Node.js offre un'ampia gamma di funzionalità per lavorare con il file system. La scelta tra operazioni sincrone e asincrone dipende dalle esigenze specifiche dell'applicazione, ma in generale è consigliabile utilizzare le versioni asincrone per evitare di bloccare il thread principale, specialmente in applicazioni con molte richieste concorrenti.