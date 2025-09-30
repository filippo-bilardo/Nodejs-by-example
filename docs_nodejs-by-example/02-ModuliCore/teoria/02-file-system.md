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

### Stream Transform e Pipeline

```javascript
const fs = require('fs');
const { Transform, pipeline } = require('stream');
const zlib = require('zlib');

// Creare un Transform Stream personalizzato
const upperCaseTransform = new Transform({
  transform(chunk, encoding, callback) {
    // Trasforma il testo in maiuscolo
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

// Utilizzare pipeline per gestire automaticamente gli errori
pipeline(
  fs.createReadStream('input.txt'),
  upperCaseTransform,
  zlib.createGzip(), // Comprime il contenuto
  fs.createWriteStream('output.txt.gz'),
  (err) => {
    if (err) {
      console.error('Errore nella pipeline:', err);
    } else {
      console.log('Pipeline completata con successo');
    }
  }
);
```

### Operazioni File Avanzate

#### Controllo Esistenza File

```javascript
const fs = require('fs').promises;

// Metodo moderno con fs.access()
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Utilizzo
const exists = await fileExists('file.txt');
console.log('File esiste:', exists);
```

#### Copia File con Controllo Integrità

```javascript
const fs = require('fs').promises;
const crypto = require('crypto');

async function copyFileWithChecksum(source, destination) {
  try {
    // Leggi e calcola checksum del file originale
    const originalData = await fs.readFile(source);
    const originalHash = crypto.createHash('sha256').update(originalData).digest('hex');
    
    // Copia il file
    await fs.copyFile(source, destination);
    
    // Verifica l'integrità
    const copiedData = await fs.readFile(destination);
    const copiedHash = crypto.createHash('sha256').update(copiedData).digest('hex');
    
    if (originalHash === copiedHash) {
      console.log('File copiato correttamente con integrità verificata');
      return true;
    } else {
      console.error('Errore: integrità del file compromessa');
      await fs.unlink(destination); // Rimuovi il file corrotto
      return false;
    }
  } catch (error) {
    console.error('Errore nella copia:', error.message);
    return false;
  }
}
```

#### Backup e Rotazione File

```javascript
const fs = require('fs').promises;
const path = require('path');

async function rotateFile(filePath, maxBackups = 5) {
  try {
    const dir = path.dirname(filePath);
    const name = path.basename(filePath, path.extname(filePath));
    const ext = path.extname(filePath);
    
    // Sposta i backup esistenti
    for (let i = maxBackups - 1; i >= 1; i--) {
      const oldBackup = path.join(dir, `${name}.${i}${ext}`);
      const newBackup = path.join(dir, `${name}.${i + 1}${ext}`);
      
      try {
        await fs.access(oldBackup);
        await fs.rename(oldBackup, newBackup);
      } catch (err) {
        // Il backup non esiste, continua
      }
    }
    
    // Sposta il file corrente come primo backup
    const firstBackup = path.join(dir, `${name}.1${ext}`);
    try {
      await fs.rename(filePath, firstBackup);
      console.log(`File ruotato: ${filePath} -> ${firstBackup}`);
    } catch (err) {
      console.log('File originale non esistente, creazione nuovo file');
    }
    
  } catch (error) {
    console.error('Errore nella rotazione:', error.message);
  }
}

// Esempio di utilizzo
await rotateFile('./app.log', 3);
```

## Osservare i Cambiamenti nei File

### File Watcher Base

```javascript
const fs = require('fs');

fs.watch('file.txt', (eventType, filename) => {
  console.log(`Evento: ${eventType}`);
  if (filename) {
    console.log(`File modificato: ${filename}`);
  }
});
```

### File Watcher Avanzato

```javascript
const fs = require('fs');
const path = require('path');

class FileWatcher {
  constructor(watchPath, options = {}) {
    this.watchPath = watchPath;
    this.options = {
      recursive: options.recursive || false,
      debounceTime: options.debounceTime || 100,
      excludePatterns: options.excludePatterns || [],
      ...options
    };
    this.watchers = new Map();
    this.debounceTimeouts = new Map();
  }

  start() {
    this.watchDirectory(this.watchPath);
  }

  watchDirectory(dirPath) {
    const watcher = fs.watch(dirPath, { recursive: this.options.recursive }, 
      (eventType, filename) => {
        if (!filename) return;
        
        const fullPath = path.join(dirPath, filename);
        
        // Filtro pattern esclusi
        if (this.shouldExclude(fullPath)) return;
        
        // Debounce per evitare eventi duplicati
        this.debounceEvent(fullPath, eventType, () => {
          this.handleFileEvent(fullPath, eventType);
        });
      }
    );

    this.watchers.set(dirPath, watcher);
  }

  shouldExclude(filePath) {
    return this.options.excludePatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return filePath.includes(pattern);
      }
      if (pattern instanceof RegExp) {
        return pattern.test(filePath);
      }
      return false;
    });
  }

  debounceEvent(filePath, eventType, callback) {
    const key = `${filePath}-${eventType}`;
    
    if (this.debounceTimeouts.has(key)) {
      clearTimeout(this.debounceTimeouts.get(key));
    }
    
    const timeout = setTimeout(() => {
      callback();
      this.debounceTimeouts.delete(key);
    }, this.options.debounceTime);
    
    this.debounceTimeouts.set(key, timeout);
  }

  async handleFileEvent(filePath, eventType) {
    try {
      const stats = await fs.promises.stat(filePath).catch(() => null);
      
      const event = {
        path: filePath,
        type: eventType,
        isDirectory: stats ? stats.isDirectory() : false,
        size: stats ? stats.size : 0,
        timestamp: new Date()
      };

      console.log(`[${event.timestamp.toISOString()}] ${event.type}: ${event.path}`);
      
      // Emetti eventi personalizzati
      if (eventType === 'rename' && !stats) {
        this.onFileDeleted(event);
      } else if (eventType === 'rename' && stats) {
        this.onFileCreated(event);
      } else if (eventType === 'change') {
        this.onFileModified(event);
      }
    } catch (error) {
      console.error('Errore nella gestione evento file:', error.message);
    }
  }

  onFileCreated(event) {
    console.log(`✅ File creato: ${event.path}`);
  }

  onFileModified(event) {
    console.log(`📝 File modificato: ${event.path} (${event.size} byte)`);
  }

  onFileDeleted(event) {
    console.log(`🗑️ File eliminato: ${event.path}`);
  }

  stop() {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();
    
    for (const timeout of this.debounceTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.debounceTimeouts.clear();
  }
}

// Utilizzo del File Watcher avanzato
const watcher = new FileWatcher('./watched-folder', {
  recursive: true,
  debounceTime: 200,
  excludePatterns: [
    'node_modules',
    '.git',
    /\.tmp$/,
    /~$/
  ]
});

watcher.start();

// Gestione shutdown graceful
process.on('SIGINT', () => {
  console.log('\nArresto del file watcher...');
  watcher.stop();
  process.exit(0);
});
```

### File Lock (Blocco File)

```javascript
const fs = require('fs').promises;
const path = require('path');

class FileLock {
  constructor(filePath, options = {}) {
    this.filePath = filePath;
    this.lockFilePath = `${filePath}.lock`;
    this.options = {
      timeout: options.timeout || 10000,
      retryInterval: options.retryInterval || 100,
      stale: options.stale || 60000, // Considera stale dopo 1 minuto
      ...options
    };
  }

  async acquire() {
    const startTime = Date.now();
    
    while (Date.now() - startTime < this.options.timeout) {
      try {
        // Controlla se il lock è stale
        if (await this.isLockStale()) {
          await this.release();
        }
        
        // Tenta di creare il file di lock
        await fs.writeFile(this.lockFilePath, JSON.stringify({
          pid: process.pid,
          timestamp: Date.now(),
          hostname: require('os').hostname()
        }), { flag: 'wx' }); // Fallisce se il file esiste
        
        return true;
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
        
        // Il lock esiste, aspetta e riprova
        await new Promise(resolve => 
          setTimeout(resolve, this.options.retryInterval)
        );
      }
    }
    
    throw new Error(`Impossibile acquisire il lock per ${this.filePath} entro ${this.options.timeout}ms`);
  }

  async isLockStale() {
    try {
      const lockData = await fs.readFile(this.lockFilePath, 'utf8');
      const { timestamp } = JSON.parse(lockData);
      return (Date.now() - timestamp) > this.options.stale;
    } catch (error) {
      return false; // Se non riusciamo a leggere il lock, assumiamo non sia stale
    }
  }

  async release() {
    try {
      await fs.unlink(this.lockFilePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  async withLock(callback) {
    await this.acquire();
    try {
      return await callback();
    } finally {
      await this.release();
    }
  }
}

// Esempio di utilizzo del file lock
async function safeFileOperation(filePath) {
  const lock = new FileLock(filePath);
  
  return await lock.withLock(async () => {
    console.log('Lock acquisito, eseguendo operazione...');
    
    // Operazione critica sul file
    const data = await fs.readFile(filePath, 'utf8').catch(() => '');
    const newData = data + '\nNuova riga aggiunta in modo sicuro';
    await fs.writeFile(filePath, newData);
    
    console.log('Operazione completata');
    return newData;
  });
}
```

## Conclusione

Il modulo `fs` di Node.js offre un'ampia gamma di funzionalità per lavorare con il file system. La scelta tra operazioni sincrone e asincrone dipende dalle esigenze specifiche dell'applicazione, ma in generale è consigliabile utilizzare le versioni asincrone per evitare di bloccare il thread principale, specialmente in applicazioni con molte richieste concorrenti.