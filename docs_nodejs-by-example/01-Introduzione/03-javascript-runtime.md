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

I moduli sono unità di codice riutilizzabili e isolate, che permettono di suddividere un'applicazione in file separati, ciascuno responsabile di una specifica funzionalità. Ogni modulo ha il proprio scope: le variabili e le funzioni definite al suo interno non sono visibili all'esterno a meno che non vengano esplicitamente esportate. Questo favorisce l'organizzazione del codice, la manutenibilità e il riutilizzo, evitando conflitti tra nomi di variabili globali.

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

JavaScript, di per sé, non può accedere direttamente a risorse di basso livello del sistema operativo (file system, rete, thread, ecc.): tutte le operazioni "native" di Node.js sono in realtà implementate in C/C++ e poi esposte a JavaScript. Quando si ha bisogno di funzionalità che non sono già coperte dalle API standard di Node.js (ad esempio l'accesso a librerie di sistema esistenti, calcoli ad alte prestazioni, o driver hardware), è possibile scrivere degli **addon nativi**: moduli compilati che permettono al codice JavaScript di richiamare funzioni scritte in un altro linguaggio (tipicamente C o C++).

Node.js mette a disposizione diversi strumenti per realizzare questo tipo di integrazione:

1. **N-API**: è un'interfaccia (ABI) stabile e indipendente dalla versione di V8, pensata per la costruzione di addon nativi. Il vantaggio principale è che un addon compilato con N-API continua a funzionare anche dopo aggiornamenti di Node.js, senza dover essere ricompilato, perché N-API astrae i dettagli interni del motore V8.
2. **node-addon-api**: è un modulo che fornisce un set di classi C++ che avvolgono (wrappano) le API C di N-API, rendendo la scrittura di addon nativi più semplice, sicura e idiomatica per chi programma in C++, sfruttando ad esempio la gestione automatica degli errori e delle eccezioni.
3. **FFI (Foreign Function Interface)**: tramite librerie come `ffi-napi`, è possibile chiamare direttamente funzioni esportate da librerie condivise già compilate (file `.so`, `.dll`, `.dylib`) senza dover scrivere e compilare un addon C++ dedicato. È un approccio più rapido ma generalmente meno performante rispetto a un addon nativo compilato ad hoc.

In sintesi, questi strumenti permettono a Node.js di "uscire" dai limiti del linguaggio JavaScript puro, integrandosi con codice nativo per ottenere prestazioni migliori o accedere a funzionalità di sistema altrimenti non raggiungibili.

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

### Il Processo di Rilascio (Release Cycle)

Node.js segue un ciclo di rilascio prevedibile e strutturato:

- **Versioni pari (LTS - Long Term Support)**: rilasciate ogni anno (aprile), rimangono in Active LTS per 12 mesi e poi in Maintenance per altri 18 mesi, per un supporto totale di 30 mesi. Sono raccomandate per ambienti di produzione grazie alla loro stabilità.
- **Versioni dispari (Current)**: rilasciate ogni anno (ottobre), hanno un ciclo di vita più breve (6 mesi) e servono a introdurre e sperimentare nuove funzionalità prima che vengano consolidate in una futura versione LTS.
- **Nightly builds**: build sperimentali generate quotidianamente dal branch principale, utili per testare le funzionalità più recenti ancora in sviluppo.

### Aggiornamenti di V8

Ogni nuova major release di Node.js integra tipicamente una versione più recente del motore V8, portando con sé:

- Supporto per le ultime proposte ECMAScript giunte allo stage finale (stage 4) del TC39
- Miglioramenti al garbage collector e alle strategie di compilazione JIT
- Ottimizzazioni delle performance su strutture dati e pattern comuni (es. array, oggetti, classi)

### Tendenze Recenti

- **Adozione crescente degli ES Modules**: sempre più pacchetti dell'ecosistema npm supportano nativamente `import`/`export`, riducendo la dipendenza da CommonJS
- **Consolidamento delle API basate su Promise**: molti moduli core (`fs`, `dns`, `timers`, ecc.) offrono ormai varianti `.promises` accanto alle classiche API a callback
- **Web-compatible API**: Node.js sta progressivamente implementando API standard del Web (`fetch`, `URL`, `WebStreams`, `structuredClone`) per aumentare la compatibilità del codice tra ambiente browser e server
- **Permission Model**: introduzione di meccanismi sperimentali per limitare l'accesso del processo Node.js a file system, rete e risorse di sistema, migliorando la sicurezza
- **Single Executable Applications**: strumenti per impacchettare un'applicazione Node.js in un singolo eseguibile autonomo, senza richiedere un'installazione separata di Node.js

Rimanere aggiornati sull'evoluzione del runtime è importante per sfruttare al meglio le nuove funzionalità, migliorare le prestazioni delle applicazioni e adottare per tempo le best practice raccomandate dalla community.

---

- [Indice](../README.md)
- [Lezione precedente](02-architettura.md)
- [Prossima Lezione](04-repl.md)
- [Prossima Esercitazione](./02-Architettura_Event-Driven/README.md)