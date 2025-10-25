# File System in Node.js

## Indice
- [Introduzione al Modulo fs](#introduzione-al-modulo-fs)
- [API Sincrone vs Asincrone](#api-sincrone-vs-asincrone)
- [Operazioni di Base](#operazioni-di-base)
- [Stream e Buffer](#stream-e-buffer)
- [Controllo Accessi e Permessi](#controllo-accessi-e-permessi)
- [File System Watcher](#file-system-watcher)
- [Best Practices](#best-practices)

## Introduzione al Modulo fs

Node.js fornisce un modulo integrato chiamato `fs` (file system) che offre una API per interagire con il file system in modo simile alle operazioni standard POSIX. Questo modulo permette di:

- Leggere e scrivere file
- Creare e eliminare directory
- Modificare permessi e proprietà dei file
- Monitorare modifiche ai file e alle directory

Il modulo `fs` è fondamentale per molte applicazioni Node.js che necessitano di persistenza dei dati o interazione con il file system locale.

```javascript
// Importazione del modulo fs
const fs = require('fs');
```

## API Sincrone vs Asincrone

Il modulo `fs` offre tre stili di API per gestire le operazioni sul file system:

### 1. API Basate su Callback (Asincrone)

Queste API seguono il pattern dei callback di Node.js, dove l'ultimo parametro è una funzione di callback che viene invocata al completamento dell'operazione.

```javascript
fs.readFile('/percorso/al/file.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Si è verificato un errore:', err);
    return;
  }
  console.log(data); // Contenuto del file
});
console.log('Questa riga viene eseguita prima della lettura del file');
```

### 2. API Sincrone (Bloccanti)

Le versioni sincrone delle API hanno il suffisso `Sync` e bloccano l'esecuzione del programma fino al completamento dell'operazione. Lanciano un'eccezione in caso di errore, quindi è consigliabile utilizzare un blocco try-catch.

```javascript
try {
  const data = fs.readFileSync('/percorso/al/file.txt', 'utf8');
  console.log(data);
} catch (err) {
  console.error('Si è verificato un errore:', err);
}
console.log('Questa riga viene eseguita dopo la lettura del file');
```

### 3. API Basate su Promise

Node.js 10+ offre una versione delle API basate su Promise tramite `fs.promises`:

```javascript
fs.promises.readFile('/percorso/al/file.txt', 'utf8')
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.error('Si è verificato un errore:', err);
  });
console.log('Questa riga viene eseguita prima della lettura del file');

// Oppure utilizzando async/await
async function leggiFile() {
  try {
    const data = await fs.promises.readFile('/percorso/al/file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('Si è verificato un errore:', err);
  }
}
leggiFile();
```

### Quando Utilizzare Operazioni Sincrone vs Asincrone

- **Operazioni Sincrone**:
  - Durante l'avvio dell'applicazione
  - Script di utilità semplici
  - Test e piccole applicazioni CLI
  - Quando è necessaria una sequenza precisa di operazioni

- **Operazioni Asincrone**:
  - Server web e applicazioni con molte richieste
  - Applicazioni con UI (evitare il blocco del thread principale)
  - Quando si lavora con grandi quantità di dati
  - Per massimizzare il throughput dell'applicazione

## Operazioni di Base

### Lettura di File

```javascript
// Lettura completa del file in memoria
fs.readFile('/percorso/al/file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Lettura di file binari
fs.readFile('/percorso/al/immagine.png', (err, data) => {
  if (err) throw err;
  console.log(data); // Buffer di dati binari
});
```

### Scrittura di File

```javascript
// Scrittura di un file (sovrascrive se esiste)
fs.writeFile('file.txt', 'Contenuto del file', 'utf8', (err) => {
  if (err) throw err;
  console.log('File scritto con successo');
});

// Aggiunta di contenuto a un file esistente
fs.appendFile('file.txt', '\nUna nuova riga', 'utf8', (err) => {
  if (err) throw err;
  console.log('Contenuto aggiunto con successo');
});
```

### Gestione Directory

```javascript
// Creazione di una directory
fs.mkdir('nuova-cartella', (err) => {
  if (err) throw err;
  console.log('Directory creata');
});

// Creazione di una directory ricorsiva (come mkdir -p)
fs.mkdir('cartella/sottocartella/sotto-sottocartella', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('Directory annidate create');
});

// Lettura del contenuto di una directory
fs.readdir('cartella', (err, files) => {
  if (err) throw err;
  console.log('File nella directory:', files);
});

// Rimozione di una directory (deve essere vuota)
fs.rmdir('cartella-vuota', (err) => {
  if (err) throw err;
  console.log('Directory rimossa');
});

// Rimozione ricorsiva (Node.js 12+)
fs.rm('cartella', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('Directory e contenuti rimossi');
});
```

### Informazioni sui File

```javascript
// Ottenere statistiche di un file
fs.stat('file.txt', (err, stats) => {
  if (err) throw err;
  
  console.log('È un file?', stats.isFile());
  console.log('È una directory?', stats.isDirectory());
  console.log('Dimensione in byte:', stats.size);
  console.log('Data ultima modifica:', stats.mtime);
  console.log('Permessi:', stats.mode);
});
```

### Altre Operazioni Comuni

```javascript
// Verifica se un file esiste
fs.access('file.txt', fs.constants.F_OK, (err) => {
  console.log(`${err ? 'Il file non esiste' : 'Il file esiste'}`);
});

// Rinominare o spostare un file
fs.rename('vecchioNome.txt', 'nuovoNome.txt', (err) => {
  if (err) throw err;
  console.log('File rinominato');
});

// Eliminare un file
fs.unlink('file-da-eliminare.txt', (err) => {
  if (err) throw err;
  console.log('File eliminato');
});

// Copiare un file (Node.js 16+)
fs.cp('sorgente.txt', 'destinazione.txt', (err) => {
  if (err) throw err;
  console.log('File copiato');
});
```

## Stream e Buffer

Gli stream sono una delle funzionalità più potenti di Node.js, particolarmente utili quando si lavora con file di grandi dimensioni o operazioni di I/O.

### Concetti Fondamentali

- **Buffer**: area di memoria temporanea per conservare i dati durante il trasferimento
- **Stream**: astrazione per gestire il flusso continuo di dati

### Tipi di Stream:
- **Readable**: per operazioni di lettura (es. `fs.createReadStream()`)
- **Writable**: per operazioni di scrittura (es. `fs.createWriteStream()`)
- **Duplex**: sia leggibili che scrivibili (es. socket TCP)
- **Transform**: manipolano i dati durante il trasferimento (es. compressione)

### Esempio di utilizzo degli Stream

```javascript
const fs = require('fs');

// Lettura di un grande file tramite stream
const readStream = fs.createReadStream('grande-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024 // Dimensione del chunk (64KB)
});

// Scrittura tramite stream
const writeStream = fs.createWriteStream('copia-file.txt');

// Eventi di uno stream di lettura
readStream.on('data', (chunk) => {
  console.log(`Ricevuto ${chunk.length} byte di dati`);
});

readStream.on('end', () => {
  console.log('Fine della lettura del file');
});

readStream.on('error', (err) => {
  console.error('Errore durante la lettura:', err);
});

// Copiare un file utilizzando pipe
readStream.pipe(writeStream);

// Gestire eventi nello stream di scrittura
writeStream.on('finish', () => {
  console.log('Scrittura completata');
});

writeStream.on('error', (err) => {
  console.error('Errore durante la scrittura:', err);
});
```

### Vantaggi degli Stream:
1. **Efficienza della memoria**: i dati vengono elaborati in piccoli chunk
2. **Elaborazione in tempo reale**: inizio dell'elaborazione prima di ricevere tutti i dati
3. **Backpressure**: controllo automatico del flusso dei dati
4. **Componibilità**: facile concatenamento tramite pipe

## Controllo Accessi e Permessi

Node.js fornisce funzionalità per gestire permessi e proprietà dei file.

### Verifica dei Permessi

```javascript
// Verifica permessi di lettura
fs.access('file.txt', fs.constants.R_OK, (err) => {
  console.log(`${err ? 'Non hai' : 'Hai'} permessi di lettura`);
});

// Verifica permessi di scrittura
fs.access('file.txt', fs.constants.W_OK, (err) => {
  console.log(`${err ? 'Non hai' : 'Hai'} permessi di scrittura`);
});

// Verifica permessi di esecuzione
fs.access('script.sh', fs.constants.X_OK, (err) => {
  console.log(`${err ? 'Non hai' : 'Hai'} permessi di esecuzione`);
});

// Combinazione di permessi
fs.access('file.txt', fs.constants.R_OK | fs.constants.W_OK, (err) => {
  console.log(`${err ? 'Non hai' : 'Hai'} permessi di lettura e scrittura`);
});
```

### Modificare Permessi

```javascript
// Cambia i permessi di un file (numerico, come chmod)
fs.chmod('file.txt', 0o755, (err) => {
  if (err) throw err;
  console.log('Permessi modificati');
});

// Cambia proprietario del file (richiede privilegi)
fs.chown('file.txt', 1000, 1000, (err) => {
  if (err) throw err;
  console.log('Proprietario cambiato');
});
```

## File System Watcher

Node.js permette di monitorare le modifiche a file e directory.

```javascript
// Monitora una directory per modifiche
const watcher = fs.watch('cartella', { recursive: true }, (eventType, filename) => {
  console.log(`Evento: ${eventType}`);
  if (filename) {
    console.log(`Filename: ${filename}`);
  }
});

// Interrompere il monitoraggio
setTimeout(() => {
  watcher.close();
  console.log('Monitoraggio interrotto');
}, 60000); // Interrompe dopo 1 minuto
```

### Eventi di fs.watch:
- `'change'`: quando il contenuto del file cambia o la directory viene modificata
- `'rename'`: quando un file/directory viene rinominato o rimosso

### Alternative:
- `fs.watchFile()`: monitora cambiamenti in un file specifico (polling)
- Librerie di terze parti come `chokidar` (più robusto e cross-platform)

## Best Practices

### 1. Preferisci le Operazioni Asincrone

```javascript
// Non ideale (bloccante)
const data = fs.readFileSync('file.txt');

// Meglio (non bloccante)
fs.readFile('file.txt', (err, data) => {
  // gestione dati
});

// Ancora meglio (con promise)
await fs.promises.readFile('file.txt');
```

### 2. Usa gli Stream per File Grandi

```javascript
// Evita per file grandi
fs.readFile('file-grande.mp4', (err, data) => {
  fs.writeFile('copia.mp4', data, (err) => {});
});

// Preferisci gli stream
fs.createReadStream('file-grande.mp4')
  .pipe(fs.createWriteStream('copia.mp4'));
```

### 3.