# JavaScript Runtime in Node.js

## Cos'è un JavaScript Runtime?

Un JavaScript Runtime è un ambiente che fornisce tutti gli elementi necessari per eseguire codice JavaScript. Include un motore JavaScript, librerie standard, API per interagire con l'ambiente esterno e meccanismi per la gestione della memoria.

## V8: Il Cuore di Node.js

Node.js utilizza il motore JavaScript V8 sviluppato da Google per Chrome:

### Caratteristiche di V8

- **Compilazione JIT (Just-In-Time)**: Converte il codice JavaScript in codice macchina ottimizzato durante l'esecuzione
- **Garbage Collection**: Gestisce automaticamente l'allocazione e il rilascio della memoria
- **Hidden Classes**: Ottimizzazione per migliorare l'accesso alle proprietà degli oggetti
- **Inline Caching**: Accelera l'accesso alle proprietà memorizzando nella cache i percorsi di accesso
- **Ottimizzazione del codice**: Analizza il codice durante l'esecuzione e lo ricompila con ottimizzazioni

### Differenze tra V8 in Node.js e nei Browser

- **API disponibili**: Node.js non ha DOM, BOM o Web API, ma fornisce API specifiche per il server
- **Configurazione**: In Node.js, V8 può essere configurato con flag specifici
- **Isolamento**: Ogni istanza di Node.js ha il proprio isolato V8

## Global Object in Node.js

A differenza dei browser dove l'oggetto globale è `window`, in Node.js l'oggetto globale è `global`:

```javascript
// Nel browser
console.log(window); // Oggetto Window

// In Node.js
console.log(global); // Oggetto Global
```

Alcuni membri importanti dell'oggetto `global`:

- `process`: Informazioni e controllo sul processo corrente
- `Buffer`: Per gestire dati binari
- `console`: Per output sulla console
- `setTimeout`, `setInterval`, `setImmediate`: Per la programmazione asincrona
- `__dirname`, `__filename`: Percorsi del file corrente (non sono tecnicamente in `global` ma sono disponibili globalmente)

## Sistema di Moduli

Node.js supporta due sistemi di moduli principali:

### 1. CommonJS (Sistema Tradizionale)

```javascript
// Importare un modulo
const fs = require('fs');

// Esportare funzionalità
module.exports = { myFunction, myVariable };
// oppure
exports.myFunction = function() {};
```

### 2. ES Modules (Standard ECMAScript)

```javascript
// Importare un modulo
import fs from 'fs';
import { readFile } from 'fs/promises';

// Esportare funzionalità
export function myFunction() {}
export const myVariable = 42;
export default myMainFunction;
```

## Gestione della Memoria

Node.js eredita la gestione della memoria di V8:

1. **Heap Memory**: Dove gli oggetti vengono allocati
2. **Stack Memory**: Per i frame di chiamata delle funzioni e variabili primitive
3. **Garbage Collection**: Processo che libera memoria non più utilizzata

### Limitazioni di Memoria

- Limite predefinito di ~1.4GB su sistemi a 64 bit (configurabile)
- Possibilità di personalizzare i parametri del garbage collector

## API Asincrone

Node.js fornisce diverse API per la programmazione asincrona:

### 1. Callback-based API (Stile Tradizionale)

```javascript
fs.readFile('file.txt', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

### 2. Promise-based API

```javascript
fs.promises.readFile('file.txt')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### 3. Async/Await (Basato su Promise)

```javascript
async function readMyFile() {
  try {
    const data = await fs.promises.readFile('file.txt');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

## Interazione con Codice Nativo

Node.js permette di estendere le funzionalità JavaScript con codice nativo:

1. **N-API**: API stabile per costruire addon nativi
2. **node-addon-api**: Wrapper C++ per N-API
3. **FFI (Foreign Function Interface)**: Per chiamare funzioni da librerie condivise

## Debugging e Profiling

Node.js offre strumenti integrati per il debugging e l'analisi delle prestazioni:

- **Inspector Protocol**: Compatibile con Chrome DevTools
- **--inspect flag**: Abilita il debugging remoto
- **Profiler V8**: Per analizzare l'utilizzo della CPU
- **Heap Snapshots**: Per analizzare l'utilizzo della memoria

## Evoluzione del Runtime

Il runtime JavaScript di Node.js è in costante evoluzione:

- Supporto per nuove funzionalità ECMAScript
- Miglioramenti delle prestazioni di V8
- Nuove API e deprecazione di quelle obsolete
- Migliore integrazione con i moderni pattern di programmazione JavaScript