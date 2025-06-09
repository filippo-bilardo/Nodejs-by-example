# Moduli Core di Node.js

## Sistema di Moduli

Node.js utilizza un sistema di moduli per organizzare il codice in unità riutilizzabili. Questo sistema permette di suddividere le applicazioni in componenti separati, facilitando la manutenzione e la scalabilità del codice.

### Come Funzionano i Moduli in Node.js

In Node.js, ogni file è considerato un modulo separato. Le variabili, funzioni e oggetti definiti in un file sono privati a quel modulo, a meno che non vengano esplicitamente esportati.

#### Esportare Moduli

Per rendere disponibili elementi di un modulo ad altri file, è necessario esportarli utilizzando l'oggetto `module.exports` o la sua scorciatoia `exports`:

```javascript
// math.js
function somma(a, b) {
  return a + b;
}

function sottrazione(a, b) {
  return a - b;
}

// Esportazione di funzioni specifiche
module.exports = {
  somma,
  sottrazione
};

// Oppure esportazione singola
// exports.somma = somma;
// exports.sottrazione = sottrazione;
```

#### Importare Moduli

Per utilizzare un modulo in un altro file, si usa la funzione `require()`:

```javascript
// app.js
const math = require('./math');

console.log(math.somma(5, 3));      // Output: 8
console.log(math.sottrazione(10, 4)); // Output: 6

// È possibile anche destrutturare l'importazione
// const { somma, sottrazione } = require('./math');
```

### Tipi di Moduli in Node.js

Node.js supporta tre tipi principali di moduli:

1. **Moduli Core**: Moduli integrati forniti da Node.js
2. **Moduli Locali**: Moduli creati dallo sviluppatore per l'applicazione
3. **Moduli di Terze Parti**: Moduli installati tramite npm

## Moduli Core Principali

Node.js include diversi moduli core che forniscono funzionalità essenziali senza necessità di installare pacchetti esterni. Ecco i principali:

### 1. fs (File System)

Permette di interagire con il file system per operazioni di lettura, scrittura e manipolazione di file e directory.

```javascript
const fs = require('fs');

// Lettura sincrona di un file
const data = fs.readFileSync('file.txt', 'utf8');

// Lettura asincrona di un file
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

### 2. path

Fornisce utilità per lavorare con percorsi di file e directory in modo cross-platform.

```javascript
const path = require('path');

// Unisce segmenti di percorso
const fullPath = path.join(__dirname, 'files', 'example.txt');

// Estrae il nome del file da un percorso
const fileName = path.basename(fullPath);

// Estrae l'estensione del file
const extension = path.extname(fullPath);
```

### 3. http/https

Permette di creare server HTTP e fare richieste HTTP/HTTPS.

```javascript
const http = require('http');

// Creazione di un server HTTP
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

### 4. events

Fornisce l'implementazione del pattern Observer attraverso la classe EventEmitter.

```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

// Registrazione di un listener
myEmitter.on('event', () => {
  console.log('Un evento è stato emesso!');
});

// Emissione di un evento
myEmitter.emit('event');
```

### 5. url

Fornisce utilità per il parsing e la formattazione degli URL.

```javascript
const url = require('url');

// Parsing di un URL
const myURL = new URL('https://example.org/foo?bar=baz');

console.log(myURL.hostname);    // example.org
console.log(myURL.pathname);    // /foo
console.log(myURL.searchParams.get('bar')); // baz
```

### 6. os

Fornisce metodi per interagire con il sistema operativo.

```javascript
const os = require('os');

console.log('CPU:', os.cpus().length, 'core');
console.log('Memoria totale:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('Memoria libera:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('Piattaforma:', os.platform());
```

### 7. util

Fornisce funzioni di utilità per vari scopi.

```javascript
const util = require('util');
const fs = require('fs');

// Converte una funzione basata su callback in una che restituisce una Promise
const readFile = util.promisify(fs.readFile);

// Ora possiamo usare async/await
async function leggiFile() {
  try {
    const data = await readFile('file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

## CommonJS vs ES Modules

Node.js supporta due sistemi di moduli: CommonJS (il sistema tradizionale) e ES Modules (introdotto in ECMAScript 2015).

### CommonJS (Tradizionale)

```javascript
// Esportazione
module.exports = { funzione1, funzione2 };

// Importazione
const modulo = require('./modulo');
```

### ES Modules

Per utilizzare ES Modules in Node.js, è necessario:
- Rinominare i file con estensione `.mjs`, oppure
- Impostare `"type": "module"` nel file `package.json`

```javascript
// Esportazione
export function funzione1() {}
export function funzione2() {}
// oppure
export default { funzione1, funzione2 };

// Importazione
import { funzione1, funzione2 } from './modulo.js';
// oppure
import modulo from './modulo.js';
```

### Differenze Principali

1. **Sintassi**: ES Modules usa `import`/`export`, CommonJS usa `require`/`module.exports`
2. **Caricamento**: ES Modules carica i moduli in modo asincrono, CommonJS in modo sincrono
3. **Hoisting**: In ES Modules, le importazioni sono "hoisted" (sollevate) all'inizio del file
4. **Importazioni statiche vs dinamiche**: ES Modules supporta sia importazioni statiche che dinamiche

```javascript
// Importazione dinamica con ES Modules
import('./modulo.js')
  .then(modulo => {
    modulo.funzione1();
  })
  .catch(err => {
    console.error(err);
  });
```

## Best Practices

1. **Modularizzazione**: Suddividere il codice in moduli piccoli e focalizzati
2. **Responsabilità Singola**: Ogni modulo dovrebbe avere una responsabilità ben definita
3. **Incapsulamento**: Esporre solo ciò che è necessario, mantenendo privati i dettagli implementativi
4. **Gestione delle Dipendenze**: Evitare dipendenze circolari tra moduli
5. **Documentazione**: Documentare chiaramente l'interfaccia pubblica di ogni modulo

L'utilizzo efficace del sistema di moduli è fondamentale per creare applicazioni Node.js scalabili e manutenibili.