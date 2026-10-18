# Il modulo File System in Node.js

## Introduzione

Il modulo `fs` (File System) è uno dei moduli core più importanti di Node.js. Fornisce un'API completa per interagire con il file system del sistema operativo, offrendo funzionalità simili alle chiamate POSIX standard ma con un'interfaccia JavaScript moderna e flessibile.

Questo modulo è fondamentale per:
- **Gestione file**: lettura, scrittura, modifica e cancellazione
- **Gestione directory**: creazione, navigazione ed eliminazione di cartelle
- **Operazioni su stream**: elaborazione efficiente di file di grandi dimensioni
- **Monitoraggio**: osservazione dei cambiamenti nel file system
- **Controllo accessi**: gestione di permessi e metadati

## Importare il Modulo

```javascript
// Modulo classico con callback
const fs = require('fs');

// API moderna basata su Promise (Node.js 10+)
const fsPromises = require('fs/promises');
```

## Operazioni Sincrone vs Asincrone

### Differenze Fondamentali

Il modulo `fs` offre **tre paradigmi** per le operazioni sul file system:

1. **Sincrono**: Blocca l'esecuzione fino al completamento
   - Suffisso `-Sync` (es. `readFileSync`)
   - Semplice da usare ma può degradare le performance
   - Ideale per script CLI o inizializzazione app

2. **Asincrono con Callback**: Non blocca l'esecuzione
   - Pattern error-first callback: `(err, result) => {}`
   - Approccio tradizionale di Node.js
   - Rischio di "callback hell" con operazioni complesse

3. **Asincrono con Promise/Async-Await**: Non blocca, sintassi moderna
   - API `fs/promises` disponibile da Node.js 10
   - Codice più leggibile e manutenibile
   - **Approccio raccomandato** per nuovi progetti

### Quando Usare Quale Approccio?

| Approccio | Quando Usarlo | Quando Evitarlo |
|-----------|---------------|-----------------|
| **Sincrono** | Script CLI, configurazione iniziale, operazioni singole | Server HTTP, operazioni multiple, file grandi |
| **Callback** | Codice legacy, compatibilità con vecchie librerie | Nuovi progetti (preferire Promise) |
| **Promise** | Applicazioni moderne, server, operazioni complesse | Quando si richiede Node.js < 10 |

### 📖 Esempi Pratici

Per approfondire ciascun approccio con esempi eseguibili:

- **[02.01 - Lettura Sincrona](esempi/02.01-lettura-sincrona.js)**: Quando usare `readFileSync()` e gestione errori
- **[02.02 - Lettura Asincrona con Callback](esempi/02.02-lettura-asincrona-callback.js)**: Pattern error-first e gestione eventi
- **[02.03 - Lettura Asincrona con Promise](esempi/02.03-lettura-asincrona-promise.js)**: Async/await e gestione moderna (raccomandato)

## Operazioni Base sui File

### Lettura File

La lettura di file è una delle operazioni più comuni. Node.js offre diversi metodi ottimizzati per scenari specifici:

- **File piccoli** (<1MB): Usa `readFile()` per caricare tutto in memoria
- **File grandi**: Usa **stream** per elaborazione chunk-by-chunk
- **File binari**: Ometti l'encoding per ottenere un Buffer

**📖 Esempio completo**: [02.01 - Lettura Sincrona](esempi/02.01-lettura-sincrona.js) | [02.02 - Callback](esempi/02.02-lettura-asincrona-callback.js) | [02.03 - Promise](esempi/02.03-lettura-asincrona-promise.js)

### Scrittura File

La scrittura sovrascrive completamente il contenuto esistente. Supporta varie opzioni:

- **Encoding**: `utf8`, `ascii`, `base64`, ecc.
- **Mode**: Permessi file (es. `0o644`)
- **Flag**: `w` (write), `wx` (write esclusivo), `w+` (read+write)

**⚠️ Attenzione**: La scrittura non è atomica! Per operazioni critiche usa file temporanei + rename.

**📖 Esempio completo**: [02.04 - Scrittura File](esempi/02.04-scrittura-file.js) - Include tutti e tre i metodi

### Aggiunta Contenuto (Append)

L'append aggiunge contenuto alla fine del file senza sovrascriverlo. Perfetto per:
- **Log files**: Registrazione eventi continua
- **Data collection**: Accumulo dati senza riscritture
- **CSV files**: Aggiunta righe a tabelle esistenti

**📖 Esempio completo**: [02.05 - Append File](esempi/02.05-append-file.js) - Include SimpleLogger class

### Eliminazione File

L'eliminazione è **permanente** e non recuperabile! Best practices:

1. **Verifica esistenza** prima di eliminare
2. **Backup** per file critici
3. **Conferma utente** per operazioni interattive
4. **Soft delete** (rinomina in `.trash`) per recuperabilità

**📖 Esempio completo**: [02.06 - Eliminazione File](esempi/02.06-eliminazione-file.js) - Include utilities per cleanup sicuro

## Operazioni su Directory

### Creazione Directory

La creazione di directory supporta opzioni avanzate:

- **Recursive**: Crea anche le directory parent mancanti (come `mkdir -p`)
- **Mode**: Imposta i permessi (default: `0o777`)
- **Nested paths**: Supporta percorsi multipli `/a/b/c`

**💡 Best Practice**: Usa sempre `{ recursive: true }` per evitare errori quando le directory parent non esistono.

**📖 Esempio completo**: [02.07 - Creazione Directory](esempi/02.07-creazione-directory.js) - Include project scaffolding automatico

### Lettura Directory

La lettura di directory può essere:

1. **Semplice**: Lista nomi file (array di stringhe)
2. **Con Dirent**: Oggetti con tipo (file/directory) - **più efficiente**
3. **Ricorsiva**: Attraversa sottodirectory automaticamente
4. **Con statistiche**: Include size, date, permessi

**📖 Esempio completo**: [02.08 - Lettura Directory](esempi/02.08-lettura-directory.js) - Include traversal ricorsivo e file analysis

### Eliminazione Directory

L'eliminazione di directory ha **due metodi** con comportamenti diversi:

**`rmdir()`**: Elimina **solo** directory vuote
- Fallisce con errore `ENOTEMPTY` se contiene file
- Più sicuro ma richiede svuotamento manuale

**`rm()` con `{ recursive: true }`**: Elimina directory e tutto il contenuto
- ⚠️ **PERICOLOSO**: Eliminazione permanente e ricorsiva
- Usa sempre con `{ force: true }` per ignorare file inesistenti
- Equivalente a `rm -rf` su Linux

**📖 Esempio completo**: [02.13 - Eliminazione Directory](esempi/02.13-eliminazione-directory.js) - Include eliminazione sicura con validazioni

## Informazioni e Metadati File

### fs.stat() - Statistiche Complete

Il metodo `stat()` restituisce un oggetto `Stats` con informazioni dettagliate:

**Informazioni base**:
- `size`: Dimensione in byte
- `isFile()`, `isDirectory()`, `isSymbolicLink()`: Tipo elemento
- `mode`: Permessi file (in formato numerico)

**Date e timestamp**:
- `birthtime`: Data creazione
- `mtime`: Data ultima modifica (Modified Time)
- `atime`: Data ultimo accesso (Access Time)
- `ctime`: Data cambio metadata (Change Time)

**Informazioni sistema**:
- `dev`, `ino`: Device e inode number
- `nlink`: Numero hard links
- `uid`, `gid`: User/Group ID proprietario

**📖 Esempio completo**: [02.12 - Informazioni File (stat)](esempi/02.12-informazioni-file-stat.js) - Include formattazione dimensioni e calcolo età file

### Controllo Esistenza File

Esistono **vari metodi** per verificare l'esistenza:

1. **`fs.existsSync()`** - ⚠️ DEPRECATO ma ancora usato
   - Introduce race condition (file può essere eliminato dopo il check)
   
2. **`fs.access()`** - ✅ RACCOMANDATO
   - Controlla anche i permessi (lettura, scrittura, esecuzione)
   - Pattern moderno: try/catch

3. **`fs.stat()`** - Ottieni info + controlla esistenza
   - Due operazioni in una

**💡 Best Practice**: Non controllare esistenza prima di operare sul file. Prova l'operazione direttamente e gestisci l'errore `ENOENT`.

**📖 Esempio completo**: [02.14 - Controllo Esistenza File](esempi/02.14-controllo-esistenza-file.js) - Include tutti i metodi e best practices

## Stream di File - Elaborazione Efficiente

### Perché Usare gli Stream?

Gli stream sono **fondamentali** per applicazioni professionali perché:

1. **Efficienza Memoria**: Elaborano dati chunk-by-chunk invece di caricare tutto in RAM
   - File da 10GB? Stream usa ~64KB di memoria costante
   - `readFile()` caricherà 10GB in RAM = crash!

2. **Performance**: Inizia elaborazione prima di leggere tutto il file
   - Lettura e scrittura in parallelo
   - Riduce latenza totale

3. **Scalabilità**: Gestisce file di qualsiasi dimensione
   - Log files giganti
   - Video streaming
   - Database backup

### Stream di Lettura (ReadStream)

Il `createReadStream()` legge file a blocchi (chunks):

**Opzioni comuni**:
- `highWaterMark`: Dimensione buffer (default: 64KB)
- `start`, `end`: Leggi solo una porzione del file
- `encoding`: Automaticamente converte Buffer in stringa

**Eventi principali**:
- `data`: Nuovo chunk disponibile
- `end`: Lettura completata
- `error`: Errore durante lettura
- `close`: Stream chiuso

**📖 Esempio completo**: [02.09 - Stream Lettura](esempi/02.09-stream-lettura.js) - Include confronto memoria e line-by-line reading

### Stream di Scrittura (WriteStream)

Il `createWriteStream()` scrive dati incrementalmente:

**Gestione Backpressure**:
- `write()` ritorna `false` quando buffer è pieno
- Ascolta evento `drain` prima di continuare
- ⚠️ Ignorare backpressure = memory leak!

**Eventi principali**:
- `drain`: Buffer svuotato, pronto per nuovi dati
- `finish`: Tutto scritto e flushed su disco
- `error`: Errore durante scrittura

**📖 Esempio completo**: [02.10 - Stream Scrittura](esempi/02.10-stream-scrittura.js) - Include gestione backpressure e CSV generation

### Pipe e Composizione Stream

Il metodo `pipe()` connette stream in modo **automatico**:

**Vantaggi**:
- Gestisce backpressure automaticamente
- Propaga errori
- Memory management ottimale

**Pattern comune**:
```
readStream.pipe(transform1).pipe(transform2).pipe(writeStream)
```

**Esempi pratici**:
- File copy: `read.pipe(write)`
- Compression: `read.pipe(gzip).pipe(write)`
- Encryption: `read.pipe(cipher).pipe(write)`
- HTTP upload: `read.pipe(httpRequest)`

**📖 Esempio completo**: [02.11 - Stream Pipe](esempi/02.11-stream-pipe.js) - Include compression, encryption, progress monitoring

## Operazioni File Avanzate

### Copia File con Verifica Integrità

La copia di file può essere **critica** quando l'integrità dei dati è importante:

**Metodi disponibili**:
1. **`fs.copyFile()`** - Copia nativa veloce
2. **Stream pipe** - Per file grandi con progress monitoring
3. **Con checksum** - Verifica integrità tramite hash (MD5, SHA256)

**Opzioni di copia**:
- `COPYFILE_EXCL`: Fallisce se destinazione esiste (previene sovrascritture)
- `COPYFILE_FICLONE`: Copy-on-write se supportato dal filesystem (veloce)

**Scenari d'uso**:
- Backup critici: Usa checksum SHA256
- File grandi (>100MB): Usa stream con progress callback
- Operazioni massive: Copy-on-write se disponibile

**📖 Esempio completo**: [02.16 - Copia File Verificata](esempi/02.16-copia-file-verificata.js) - Include checksum verification, progress monitoring, directory recursion

### Backup e Rotazione File

I sistemi di backup automatici sono **essenziali** per:
- **Log rotation**: Evita log file infiniti
- **Database backup**: Retention policy automatica
- **Configuration versioning**: Mantieni storico modifiche
- **Data snapshots**: Punti di ripristino temporali

**Strategie di rotazione**:

1. **Timestamp-based**: `file.2024-02-07T10-30-45.backup`
   - Pro: Cronologia precisa
   - Contro: Nomi lunghi

2. **Numbered**: `file.1`, `file.2`, `file.3`
   - Pro: Nomi corti, facile gestione
   - Contro: Rinomina multipla a ogni rotazione

3. **Incremental**: Backup solo se file cambiato (checksum)
   - Pro: Risparmio spazio
   - Contro: Overhead calcolo hash

**Retention Policy**:
- **maxBackups**: Numero massimo backup da mantenere
- **maxAge**: Elimina backup più vecchi di N giorni
- **minBackups**: Minimo da mantenere sempre (sicurezza)

**📖 Esempio completo**: [02.17 - Backup e Rotazione](esempi/02.17-backup-rotazione.js) - Include log rotation, retention policy, incremental backup

## Monitoraggio File System (File Watcher)

### Perché Monitorare i Cambiamenti?

Il monitoraggio real-time del file system abilita funzionalità avanzate:

**Development tools**:
- **Hot reload**: Ricarica automatica codice modificato
- **Build automation**: Rebuild automatico su modifica
- **Live preview**: Aggiorna browser quando cambia CSS/HTML

**Production systems**:
- **Log monitoring**: Analisi real-time dei log
- **Configuration reload**: Applica config senza restart
- **Data synchronization**: Sincronizza file tra sistemi
- **Security monitoring**: Rileva modifiche non autorizzate

### Metodi di Monitoraggio

Node.js offre **due API** con caratteristiche diverse:

#### 1. `fs.watch()` - Event-Based (Raccomandato)

**Vantaggi**:
- 🚀 **Efficiente**: Usa eventi nativi del sistema operativo (inotify su Linux, FSEvents su macOS)
- ⚡ **Reattivo**: Notifiche istantanee
- 📊 **Scalabile**: Monitora migliaia di file senza overhead

**Svantaggi**:
- ⚠️ **Comportamento platform-specific**: Differenze tra OS
- 🔄 **Eventi duplicati**: Può emettere multipli eventi per singola modifica
- 🐛 **Limitazioni**: Non sempre affidabile su network drives

#### 2. `fs.watchFile()` - Polling-Based

**Vantaggi**:
- 🌍 **Cross-platform**: Funziona ovunque
- 💾 **Network drives**: Funziona su NFS, SMB

**Svantaggi**:
- 🐢 **Lento**: Controllo periodico (default 5 secondi)
- 🏃 **CPU overhead**: Costante polling
- ❌ **Non scalabile**: Un timer per ogni file

**💡 Regola pratica**: Usa `fs.watch()` a meno che non funzioni sul tuo sistema, poi fallback a `watchFile()`

### Gestione Eventi

**Eventi comuni**:
- `change`: File contenuto modificato
- `rename`: File creato, eliminato o rinominato

**Problemi comuni**:

1. **Eventi duplicati**: Editor salvano file con temp+rename
   - **Soluzione**: Implementa debouncing (ignora eventi troppo vicini)

2. **File deletion**: `rename` evento sia per creazione che eliminazione
   - **Soluzione**: Verifica esistenza con `fs.access()`

3. **Directory watching**: Eventi per tutto il contenuto
   - **Soluzione**: Filtra per file di interesse

**📖 Esempio completo**: [02.15 - File Watcher](esempi/02.15-file-watcher.js) - Include debouncing, classe FileWatcher, recursive watching

## File Locking - Gestione Accesso Concorrente

### Il Problema della Concorrenza

Quando **più processi** accedono contemporaneamente allo stesso file, possono verificarsi:

**Race Conditions**:
```
Processo A legge: counter = 5
Processo B legge: counter = 5
Processo A scrive: counter = 6
Processo B scrive: counter = 6  ← Dovrebbe essere 7!
```

**Corruzioni Data**:
- Scritture parziali sovrapposte
- Letture incoerenti (dati misti da due versioni)
- File troncati o malformati

### Strategie di Locking

Node.js non ha locking nativo, ma offre **building blocks** per implementarlo:

#### 1. Lock File Pattern

Crea un file `.lock` come semaforo:

**Vantaggi**:
- 🚀 Semplice da implementare
- 🌍 Cross-platform
- 🔍 Visibile nel filesystem (debug facile)

**Implementazione**:
- Usa flag `wx` (write exclusive) per creazione atomica
- Salva PID per identificare proprietario
- Rileva lock "stale" (processo morto)
- Implementa timeout per evitare deadlock

#### 2. Advisory Locking (fcntl)

Usa system call `fcntl()` su Linux/Unix:

**Vantaggi**:
- ⚡ Veloce (kernel-level)
- 🔒 Rilascio automatico se processo termina

**Svantaggi**:
- ❌ Non supportato su Windows
- 🐛 Richiede moduli nativi (`fs-ext`)

#### 3. Read-Write Lock

Permette **multiple letture** simultanee ma **scrittura esclusiva**:

**Pattern**:
- Letture: Creano lock in directory condivisa
- Scrittura: Attende che directory sia vuota

**Use case**: Database file, configuration files

### Best Practices

✅ **DO**:
- Imposta sempre un **timeout** per evitare deadlock
- Gestisci **stale locks** (processo crashed)
- Usa pattern **try-finally** per garantire rilascio
- Implementa **retry** con exponential backoff
- Logga **lock contention** per debugging

❌ **DON'T**:
- Non fare busy-waiting (CPU 100%)
- Non assumere lock sia sempre rilasciato
- Non usare `fs.existsSync()` per check (race condition)
- Non dimenticare lock su file temporanei

**📖 Esempio completo**: [02.18 - File Locking](esempi/02.18-file-locking.js) - Include lock file, stale detection, read-write lock, FileLock class

## Indice Esempi Completi

Tutti gli esempi sono disponibili nella cartella [esempi/](esempi/) e possono essere eseguiti direttamente con Node.js:

### 📁 Operazioni Base File
- **[02.01](esempi/02.01-lettura-sincrona.js)** - Lettura sincrona con `readFileSync()`
- **[02.02](esempi/02.02-lettura-asincrona-callback.js)** - Lettura asincrona con callback (pattern error-first)
- **[02.03](esempi/02.03-lettura-asincrona-promise.js)** - Lettura asincrona con async/await (⭐ raccomandato)
- **[02.04](esempi/02.04-scrittura-file.js)** - Scrittura file (sync, callback, promise)
- **[02.05](esempi/02.05-append-file.js)** - Append file + SimpleLogger class
- **[02.06](esempi/02.06-eliminazione-file.js)** - Eliminazione sicura file + cleanup utilities

### 📂 Operazioni Directory
- **[02.07](esempi/02.07-creazione-directory.js)** - Creazione directory + project scaffolding
- **[02.08](esempi/02.08-lettura-directory.js)** - Lettura directory + recursive traversal + statistics
- **[02.13](esempi/02.13-eliminazione-directory.js)** - Eliminazione ricorsiva + selective deletion

### 📊 Informazioni e Metadata
- **[02.12](esempi/02.12-informazioni-file-stat.js)** - fs.stat() + formattazione dimensioni + età file
- **[02.14](esempi/02.14-controllo-esistenza-file.js)** - Controllo esistenza + permessi + best practices

### 🌊 Stream Processing
- **[02.09](esempi/02.09-stream-lettura.js)** - ReadStream + chunk processing + memory efficiency
- **[02.10](esempi/02.10-stream-scrittura.js)** - WriteStream + backpressure handling + CSV generation
- **[02.11](esempi/02.11-stream-pipe.js)** - Pipe operations + compression + encryption + progress

### 🔄 Operazioni Avanzate
- **[02.15](esempi/02.15-file-watcher.js)** - File watcher + debouncing + FileWatcher class
- **[02.16](esempi/02.16-copia-file-verificata.js)** - Copia con checksum + progress + FileCopier class
- **[02.17](esempi/02.17-backup-rotazione.js)** - Backup automatici + log rotation + retention policy
- **[02.18](esempi/02.18-file-locking.js)** - File locking + stale detection + read-write lock

## Best Practices e Raccomandazioni

### ⚡ Performance

1. **Usa async/await per nuovo codice**
   ```javascript
   // ✅ Raccomandato
   const data = await fs.promises.readFile('file.txt', 'utf8');
   
   // ❌ Evita operazioni sincrone in produzione
   const data = fs.readFileSync('file.txt', 'utf8');
   ```

2. **Stream per file grandi (>10MB)**
   ```javascript
   // ✅ Memory-efficient
   fs.createReadStream('large.log').pipe(processStream);
   
   // ❌ Carica tutto in RAM
   const data = await fs.promises.readFile('large.log');
   ```

3. **Batch operations per molti file**
   ```javascript
   // ✅ Parallelize con limite
   await Promise.all(files.slice(0, 10).map(f => processFile(f)));
   
   // ❌ Seriale lento
   for (const file of files) await processFile(file);
   ```

### 🛡️ Sicurezza

1. **Valida sempre i percorsi**
   ```javascript
   const safePath = path.join(baseDir, path.normalize(userInput));
   if (!safePath.startsWith(baseDir)) {
     throw new Error('Path traversal detected');
   }
   ```

2. **Gestisci permessi file**
   ```javascript
   // Crea file con permessi restrittivi
   await fs.promises.writeFile('secret.txt', data, { mode: 0o600 });
   ```

3. **Non esporre errori dettagliati**
   ```javascript
   try {
     await fs.promises.readFile(userPath);
   } catch (err) {
     // ❌ Non fare: throw err (path disclosure)
     throw new Error('File not accessible');
   }
   ```

### 🐛 Error Handling

1. **Gestisci errori specifici**
   ```javascript
   try {
     await fs.promises.readFile('config.json');
   } catch (err) {
     if (err.code === 'ENOENT') {
       // File non esiste, usa default
       return DEFAULT_CONFIG;
     }
     if (err.code === 'EACCES') {
       // Permessi insufficienti
       throw new Error('Permission denied');
     }
     throw err; // Errore inatteso
   }
   ```

2. **Cleanup in caso di errore**
   ```javascript
   const tempFile = 'temp.txt';
   try {
     await fs.promises.writeFile(tempFile, data);
     await processFile(tempFile);
   } finally {
     await fs.promises.unlink(tempFile).catch(() => {});
   }
   ```

### 💾 Atomicità e Durabilità

1. **Write to temp + rename pattern**
   ```javascript
   const tempFile = `${targetFile}.tmp`;
   await fs.promises.writeFile(tempFile, data);
   await fs.promises.rename(tempFile, targetFile); // Atomico!
   ```

2. **Verifica sync per dati critici**
   ```javascript
   const fd = await fs.promises.open('critical.dat', 'w');
   await fd.write(data);
   await fd.sync(); // Force flush to disk
   await fd.close();
   ```

## Risorse Aggiuntive

### 📚 Documentazione Ufficiale
- [Node.js fs module](https://nodejs.org/api/fs.html)
- [Node.js fs/promises API](https://nodejs.org/api/fs.html#promises-api)
- [Node.js stream module](https://nodejs.org/api/stream.html)

### 🎓 Approfondimenti
- [Stream Handbook](https://github.com/substack/stream-handbook)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [File System Design Patterns](https://www.patterns.dev/)

### 🔧 Librerie Utili
- **[fs-extra](https://github.com/jprichardson/node-fs-extra)**: fs con funzioni aggiuntive
- **[graceful-fs](https://github.com/isaacs/node-graceful-fs)**: fs più robusto
- **[chokidar](https://github.com/paulmillr/chokidar)**: File watcher migliore
- **[glob](https://github.com/isaacs/node-glob)**: Pattern matching file

## Conclusione

Il modulo `fs` è uno degli strumenti più potenti e versatili di Node.js. Questa guida ha coperto:

✅ **Operazioni base**: Lettura, scrittura, eliminazione file e directory  
✅ **Stream processing**: Elaborazione efficiente di file grandi  
✅ **Monitoraggio**: File watcher per applicazioni reattive  
✅ **Operazioni avanzate**: Backup, rotazione, locking  
✅ **Best practices**: Performance, sicurezza, error handling  

**🎯 Prossimi Passi**:
1. Esegui gli esempi nella cartella `esempi/`
2. Modifica gli esempi per i tuoi use case
3. Implementa un progetto pratico (es. file manager, backup tool)
4. Esplora librerie avanzate come fs-extra e chokidar

**💡 Ricorda**: Preferisci sempre approcci **asincroni** e usa **stream** per file grandi. La scelta tra sincrone e asincrone dipende dal contesto, ma in ambienti server l'asincronicità è fondamentale per mantenere alte performance con richieste concorrenti.

## Navigazione

- [← Precedente: Moduli e moduli core in Node.js](01-moduli-core-in-node.md)
- [↑ Indice dell’esercitazione](README.md)
- [Successiva: I moduli HTTP e per il Networking in Node.js →](03-http-networking.md)
