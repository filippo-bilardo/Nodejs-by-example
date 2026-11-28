# ES-FS-04: File Watcher

## 📋 Informazioni Generali

- **Modulo**: File System (fs)
- **Difficoltà**: 🟡 Medio
- **Tempo stimato**: 40 minuti
- **Prerequisiti**: 
  - Completamento ES-FS-01 e ES-FS-02
  - Comprensione degli eventi in Node.js
  - Conoscenza base di EventEmitter

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Monitorare file e directory con `fs.watch()`
2. Gestire eventi di modifica e rinomina
3. Implementare logging di eventi file system
4. Chiudere correttamente i watcher con cleanup
5. Gestire signal handling per terminazione pulita

## 📝 Descrizione

Crea un'applicazione che monitora una directory e registra tutte le modifiche che avvengono: creazione, modifica, rinomina ed eliminazione di file. Il log deve essere salvato in un file con timestamp.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-fs-04`
- [ ] Crea file `watcher.js`
- [ ] Crea directory da monitorare `watched-folder`
- [ ] Prepara file di log `watch.log`

### 2. Implementazione Watcher
- [ ] Usa `fs.watch()` per monitorare la directory
- [ ] Gestisci eventi 'rename' e 'change'
- [ ] Registra timestamp di ogni evento
- [ ] Scrivi eventi nel file di log

### 3. Signal Handling
- [ ] Gestisci SIGINT (Ctrl+C) per chiusura pulita
- [ ] Chiudi il watcher correttamente
- [ ] Scrivi messaggio di chiusura nel log

### 4. Testing
- [ ] Crea un file nella cartella monitorata
- [ ] Modifica un file esistente
- [ ] Rinomina un file
- [ ] Elimina un file
- [ ] Verifica che tutti gli eventi siano loggati

## 💡 Template di Partenza

```javascript
// watcher.js
const fs = require('fs');
const path = require('path');

const watchDir = './watched-folder';
const logFile = './watch.log';

// Crea la directory da monitorare se non esiste
if (!fs.existsSync(watchDir)) {
  fs.mkdirSync(watchDir);
}

/**
 * Scrive un evento nel log
 * @param {string} eventType - Tipo di evento
 * @param {string} filename - Nome file interessato
 */
function logEvent(eventType, filename) {
  // TODO: Implementa logging dell'evento
}

// TODO: Implementa il watcher

console.log(`Monitoraggio attivo su: ${watchDir}`);
console.log('Premi Ctrl+C per terminare');

// TODO: Gestisci chiusura pulita (SIGINT)
```

## 📚 Concetti Chiave

### fs.watch()
```javascript
const watcher = fs.watch(path, [options], [listener]);

watcher.on('change', (eventType, filename) => {
  // eventType: 'rename' o 'change'
  // filename: nome del file (può essere null su alcuni OS)
});

// Chiusura
watcher.close();
```

### Eventi fs.watch()
- **'rename'**: File creato, eliminato o rinominato
- **'change'**: Contenuto del file modificato

### Signal Handling
```javascript
process.on('SIGINT', () => {
  // Cleanup prima di uscire
  process.exit(0);
});
```

## 🔍 Step by Step

### Step 1: Implementa logging
```javascript
function logEvent(eventType, filename) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${eventType.toUpperCase()}: ${filename || 'unknown'}\n`;
  
  fs.appendFile(logFile, message, (err) => {
    if (err) {
      console.error('Errore scrittura log:', err);
    }
  });
  
  // Mostra anche in console
  console.log(message.trim());
}
```

### Step 2: Crea il watcher
```javascript
console.log(`Monitoraggio attivo su: ${watchDir}`);
console.log('Premi Ctrl+C per terminare\n');

// Inizializza il watcher
const watcher = fs.watch(watchDir, (eventType, filename) => {
  if (filename) {
    logEvent(eventType, filename);
  }
});

// Gestisci errori del watcher
watcher.on('error', (error) => {
  console.error('Errore watcher:', error);
  logEvent('error', error.message);
});
```

### Step 3: Implementa chiusura pulita
```javascript
// Gestisci Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\nChiusura watcher...');
  
  logEvent('system', 'Watcher terminato');
  
  // Chiudi il watcher
  watcher.close();
  
  // Attendi un momento per completare la scrittura del log
  setTimeout(() => {
    console.log('Arrivederci!');
    process.exit(0);
  }, 100);
});
```

### Step 4: Soluzione completa
```javascript
const fs = require('fs');
const path = require('path');

const watchDir = './watched-folder';
const logFile = './watch.log';

// Crea directory se non esiste
if (!fs.existsSync(watchDir)) {
  fs.mkdirSync(watchDir);
  console.log(`Directory creata: ${watchDir}`);
}

// Scrivi messaggio iniziale nel log
const startMessage = `\n[${ new Date().toISOString()}] === Watcher avviato ===\n`;
fs.appendFileSync(logFile, startMessage);

function logEvent(eventType, filename) {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${eventType.toUpperCase()}: ${filename}\n`;
  
  fs.appendFile(logFile, message, (err) => {
    if (err) {
      console.error('Errore scrittura log:', err);
    }
  });
  
  console.log(message.trim());
}

console.log(`📁 Monitoraggio attivo su: ${watchDir}`);
console.log('👀 In attesa di modifiche...');
console.log('🛑 Premi Ctrl+C per terminare\n');

const watcher = fs.watch(watchDir, (eventType, filename) => {
  if (filename) {
    logEvent(eventType, filename);
  }
});

watcher.on('error', (error) => {
  console.error('Errore watcher:', error);
  logEvent('error', error.message);
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Chiusura watcher...');
  
  const stopMessage = `[${new Date().toISOString()}] === Watcher terminato ===\n`;
  fs.appendFileSync(logFile, stopMessage);
  
  watcher.close();
  
  setTimeout(() => {
    console.log('👋 Arrivederci!');
    process.exit(0);
  }, 100);
});
```

## 🎓 Suggerimenti

1. **Platform differences**: `fs.watch()` si comporta diversamente su Windows, Linux e macOS
2. **filename può essere null**: Su alcuni sistemi operativi, filename potrebbe essere null
3. **Eventi multipli**: Una singola azione può generare più eventi (es. save di un editor)
4. **Recursive watching**: Per directory nidificate, potresti dover creare watcher separati
5. **appendFileSync**: Per il messaggio finale, usa la versione sync per garantire la scrittura

## ✅ Criteri di Valutazione

- [ ] Il watcher monitora correttamente la directory
- [ ] Eventi 'change' e 'rename' sono catturati
- [ ] Ogni evento è loggato con timestamp
- [ ] Il log è scritto su file
- [ ] La chiusura con Ctrl+C è pulita
- [ ] Il watcher è chiuso correttamente
- [ ] Il codice gestisce gli errori

## 🚀 Sfide Extra (Opzionali)

1. **Debouncing**: Raggruppa eventi multipli dello stesso file entro 1 secondo
2. **File details**: Oltre al nome, logga anche dimensione e tipo del file
3. **Filtri**: Ignora certi tipi di file (es. .tmp, .swp)
4. **Recursive watch**: Monitora anche le sottodirectory
5. **Web dashboard**: Crea un server HTTP che mostra gli eventi in tempo reale
6. **Email alerts**: Invia email quando vengono eliminati file importanti
7. **Backup automatico**: Quando un file cambia, crea automaticamente un backup

## 📖 Test Script

Crea uno script di test per generare eventi:
```javascript
// test-events.js
const fs = require('fs');
const path = require('path');

const testDir = './watched-folder';

// Test: Crea file
console.log('Creazione file...');
fs.writeFileSync(path.join(testDir, 'test1.txt'), 'Hello World');

setTimeout(() => {
  // Test: Modifica file
  console.log('Modifica file...');
  fs.appendFileSync(path.join(testDir, 'test1.txt'), '\nNuova riga');
}, 2000);

setTimeout(() => {
  // Test: Rinomina file
  console.log('Rinomina file...');
  fs.renameSync(
    path.join(testDir, 'test1.txt'),
    path.join(testDir, 'test1-renamed.txt')
  );
}, 4000);

setTimeout(() => {
  // Test: Elimina file
  console.log('Eliminazione file...');
  fs.unlinkSync(path.join(testDir, 'test1-renamed.txt'));
}, 6000);
```

## 🐛 Problemi Comuni

### Eventi duplicati
**Causa**: Alcuni editor generano eventi multipli per un singolo save  
**Soluzione**: Implementa debouncing per ignorare eventi duplicati

### filename è null
**Causa**: Comportamento diverso su diversi OS  
**Soluzione**: Gestisci il caso quando filename è null o undefined

### Watcher non si chiude
**Causa**: `process.exit()` chiamato prima che watcher.close() completi  
**Soluzione**: Usa setTimeout per dare tempo al cleanup

### Non cattura eventi nelle sottodirectory
**Causa**: `fs.watch()` non è ricorsivo di default  
**Soluzione**: Crea watcher separati per ogni subdirectory o usa librerie come `chokidar`

## 📖 Risorse Utili

- [fs.watch() documentation](https://nodejs.org/api/fs.html#fswatchfilename-options-listener)
- [Process signals](https://nodejs.org/api/process.html#process_signal_events)
- [Chokidar library](https://github.com/paulmillr/chokidar) (alternativa più robusta)
- [File system events explained](https://nodejs.org/docs/latest/api/fs.html#availability)
