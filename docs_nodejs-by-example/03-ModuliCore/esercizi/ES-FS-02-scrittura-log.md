# ES-FS-02: Scrittura File di Log

## 📋 Informazioni Generali

- **Modulo**: File System (fs)
- **Difficoltà**: 🟢 Facile
- **Tempo stimato**: 20 minuti
- **Prerequisiti**: 
  - Completamento ES-FS-01
  - Conoscenza della classe Date in JavaScript
  - Comprensione di template literals

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Scrivere dati in un file usando `fs.writeFile()`
2. Formattare timestamp e messaggi di log
3. Creare funzioni riutilizzabili per il logging
4. Scegliere tra `writeFile()` e `appendFile()`
5. Gestire sovrascrittura vs append

## 📝 Descrizione

Crea un sistema di logging semplice che scrive messaggi con timestamp in un file `app.log`. Ogni messaggio deve includere data, ora e testo del messaggio.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-fs-02`
- [ ] Crea file `index.js`
- [ ] Non creare manualmente `app.log` (sarà creato automaticamente)

### 2. Funzione writeLog()
- [ ] Crea funzione `writeLog(message)` che:
  - Aggiunge timestamp al messaggio
  - Scrive nel file `app.log`
  - Gestisce errori

### 3. Testing
- [ ] Scrivi 3-5 messaggi di log diversi
- [ ] Verifica che il file venga creato
- [ ] Controlla che i timestamp siano corretti
- [ ] Verifica la gestione errori

### 4. Append Mode
- [ ] Modifica per usare `appendFile()` invece di `writeFile()`
- [ ] Verifica che i nuovi log non sovrascrivano i vecchi

## 💡 Template di Partenza

```javascript
// index.js
const fs = require('fs');

/**
 * Scrive un messaggio di log nel file app.log
 * @param {string} message - Il messaggio da loggare
 */
function writeLog(message) {
  // TODO: Implementa la funzione
  // 1. Crea timestamp
  // 2. Formatta il messaggio con timestamp
  // 3. Scrivi nel file
}

// Test della funzione
writeLog('Applicazione avviata');
writeLog('Utente ha fatto login');
writeLog('Errore di connessione al database');
```

## 📚 Concetti Chiave

### fs.writeFile() vs fs.appendFile()

**writeFile()** - Sovrascrive il file:
```javascript
fs.writeFile('file.txt', 'nuovo contenuto', callback);
```

**appendFile()** - Aggiunge al file esistente:
```javascript
fs.appendFile('file.txt', 'testo aggiuntivo', callback);
```

### Formattazione Timestamp
```javascript
const now = new Date();
const timestamp = now.toISOString(); // "2024-01-15T10:30:45.123Z"
// oppure
const timestamp = now.toLocaleString('it-IT'); // "15/01/2024, 10:30:45"
```

## 🔍 Step by Step

### Step 1: Crea la funzione base
```javascript
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // continua...
}
```

### Step 2: Implementa la scrittura
```javascript
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  fs.appendFile('app.log', logMessage, 'utf8', (err) => {
    if (err) {
      console.error('Errore scrittura log:', err);
      return;
    }
    console.log('Log scritto con successo');
  });
}
```

### Step 3: Miglioramenti opzionali
```javascript
function writeLog(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  fs.appendFile('app.log', logMessage, 'utf8', (err) => {
    if (err) {
      console.error('Errore scrittura log:', err);
      return;
    }
  });
}

// Uso con livelli
writeLog('App started', 'INFO');
writeLog('User not found', 'WARN');
writeLog('Database connection failed', 'ERROR');
```

## 🎓 Suggerimenti

1. **Newline**: Aggiungi sempre `\n` alla fine di ogni messaggio per separare le righe
2. **appendFile**: Per i log, usa sempre `appendFile()` invece di `writeFile()` per non perdere i log precedenti
3. **Formato timestamp**: Scegli un formato consistente e leggibile
4. **Livelli di log**: Considera di aggiungere livelli (INFO, WARN, ERROR, DEBUG)
5. **Callback vs Promise**: Per log, puoi anche ignorare la callback se non critici

## ✅ Criteri di Valutazione

- [ ] La funzione `writeLog()` scrive correttamente nel file
- [ ] Ogni messaggio ha un timestamp
- [ ] I log multipli si accumulano (non si sovrascrivono)
- [ ] Gli errori sono gestiti appropriatamente
- [ ] Il formato dei log è leggibile e consistente

## 🚀 Sfide Extra (Opzionali)

1. **Livelli di log**: Implementa diversi livelli (INFO, WARN, ERROR, DEBUG)
2. **Rotazione file**: Quando il file supera 1MB, crea un nuovo file
3. **Log colorati**: Usa colori nella console in base al livello del log
4. **Filtro livelli**: Aggiungi configurazione per mostrare solo certi livelli
5. **Log su console e file**: Scrivi sia su console che su file contemporaneamente
6. **Promise version**: Ricrea usando `fs.promises.appendFile()` con async/await

## 📖 Esempio Output Atteso

Il file `app.log` dovrebbe contenere:
```
[2024-01-15T10:30:45.123Z] Applicazione avviata
[2024-01-15T10:30:45.234Z] Utente ha fatto login
[2024-01-15T10:30:46.567Z] Errore di connessione al database
```

## 🐛 Problemi Comuni

### File viene sovrascritto ogni volta
**Causa**: Stai usando `writeFile()` invece di `appendFile()`  
**Soluzione**: Usa `fs.appendFile()`

### Tutti i log su una riga
**Causa**: Manca `\n` alla fine del messaggio  
**Soluzione**: Aggiungi `\n` al logMessage

### Timestamp non aggiornato
**Causa**: `new Date()` chiamato una volta sola fuori dalla funzione  
**Soluzione**: Chiama `new Date()` dentro la funzione per ogni log

## 📖 Risorse Utili

- [fs.writeFile() documentation](https://nodejs.org/api/fs.html#fswritefilefile-data-options-callback)
- [fs.appendFile() documentation](https://nodejs.org/api/fs.html#fsappendfilepath-data-options-callback)
- [Date formatting in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
