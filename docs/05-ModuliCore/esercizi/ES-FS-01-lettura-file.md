# ES-FS-01: Lettura File di Testo

## 📋 Informazioni Generali

- **Modulo**: File System (fs)
- **Difficoltà**: 🟢 Facile
- **Tempo stimato**: 15 minuti
- **Prerequisiti**: 
  - Conoscenza base di JavaScript
  - Comprensione di callback
  - Familiarità con error handling

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Importare e utilizzare il modulo `fs` di Node.js
2. Leggere file di testo usando `fs.readFile()`
3. Gestire callback asincrone
4. Implementare error handling appropriato
5. Convertire Buffer in stringa

## 📝 Descrizione

Crea uno script Node.js che legge il contenuto di un file di testo e lo visualizza nella console. L'esercizio ti introduce al modulo `fs` e alle operazioni asincrone fondamentali in Node.js.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea una cartella per l'esercizio `es-fs-01`
- [ ] Inizializza un file `index.js`
- [ ] Crea un file di test `test.txt` con del contenuto (es. "Ciao, questo è un test!")

### 2. Implementazione Base
- [ ] Importa il modulo `fs`
- [ ] Usa `fs.readFile()` per leggere `test.txt`
- [ ] Gestisci l'encoding (UTF-8)
- [ ] Visualizza il contenuto nella console

### 3. Error Handling
- [ ] Implementa gestione errori nella callback
- [ ] Testa con un file inesistente
- [ ] Mostra messaggi di errore chiari

### 4. Test
- [ ] Verifica con diversi contenuti nel file
- [ ] Prova con file vuoto
- [ ] Testa con percorso file errato

## 💡 Template di Partenza

```javascript
// index.js
const fs = require('fs');

// TODO: Implementa la lettura del file
// Suggerimento: fs.readFile(path, encoding, callback)

console.log('Inizio lettura file...');

// La tua implementazione qui
```

## 📚 Concetti Chiave

### fs.readFile()
```javascript
fs.readFile(path, [encoding], callback)
```
- **path**: percorso del file da leggere
- **encoding**: (opzionale) tipo di encoding, es. 'utf8'
- **callback**: funzione chiamata al completamento (err, data)

### Pattern Callback
```javascript
function callback(err, data) {
  if (err) {
    // Gestisci l'errore
    return;
  }
  // Usa i dati
}
```

## 🔍 Step by Step

### Step 1: Importa il modulo
```javascript
const fs = require('fs');
```

### Step 2: Definisci il percorso del file
```javascript
const filePath = './test.txt';
// oppure usa __dirname per path assoluto
// const filePath = __dirname + '/test.txt';
```

### Step 3: Leggi il file
```javascript
fs.readFile(filePath, 'utf8', (err, data) => {
  // Implementazione callback
});
```

### Step 4: Gestisci errori e successo
```javascript
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Errore nella lettura del file:', err.message);
    return;
  }
  console.log('Contenuto del file:');
  console.log(data);
});
```

## 🎓 Suggerimenti

1. **Encoding**: Se non specifichi l'encoding, `fs.readFile()` restituisce un Buffer invece di una stringa
2. **Percorsi**: Usa percorsi relativi (`./file.txt`) o assoluti (`/home/user/file.txt`)
3. **Error-first callback**: Le callback in Node.js seguono sempre il pattern (error, result)
4. **Return dopo errore**: Ricorda di usare `return` dopo aver gestito l'errore per evitare di eseguire il resto del codice

## ✅ Criteri di Valutazione

- [ ] Il file viene letto correttamente
- [ ] Il contenuto viene visualizzato in console
- [ ] Gli errori sono gestiti appropriatamente
- [ ] Il codice è pulito e leggibile
- [ ] I commenti spiegano le parti principali

## 🚀 Sfide Extra (Opzionali)

1. **Lettura multipla**: Modifica lo script per leggere 3 file diversi in sequenza
2. **Statistiche**: Oltre a mostrare il contenuto, conta il numero di caratteri, parole e righe
3. **Parametri CLI**: Accetta il nome del file come argomento da command line (`process.argv`)
4. **Promise**: Ricrea l'esercizio usando `fs.promises.readFile()` con async/await

## 📖 Risorse Utili

- [Node.js fs.readFile() documentation](https://nodejs.org/api/fs.html#fsreadfilepath-options-callback)
- [Working with the file system in Node.js](https://nodejs.org/en/learn/manipulating-files/nodejs-file-stats)
- [Understanding callbacks](https://nodejs.dev/learn/javascript-asynchronous-programming-and-callbacks)

## 🐛 Problemi Comuni

### Errore: ENOENT
**Causa**: File non trovato  
**Soluzione**: Verifica che il percorso del file sia corretto

### Buffer invece di stringa
**Causa**: Encoding non specificato  
**Soluzione**: Aggiungi 'utf8' come secondo parametro

### Codice dopo l'errore viene eseguito
**Causa**: Manca `return` dopo gestione errore  
**Soluzione**: Aggiungi `return` dopo aver loggato l'errore
