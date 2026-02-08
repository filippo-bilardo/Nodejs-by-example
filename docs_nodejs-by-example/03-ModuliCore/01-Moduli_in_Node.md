# Moduli in Node.js

## Indice
- [Sistema di Moduli](#sistema-di-moduli)
- [Moduli Core Principali](#moduli-core-principali)

## Sistema di Moduli

Node.js utilizza un sistema di moduli per organizzare e riutilizzare il codice. Questo approccio modulare è fondamentale per creare applicazioni scalabili e manutenibili.

### Tipi di Moduli in Node.js:

1. **Moduli Core**: forniti nativamente da Node.js
2. **Moduli Locali**: creati dall'utente per l'applicazione specifica
3. **Moduli di Terze Parti**: installati tramite npm

### Come Funziona il Sistema di Moduli:

Ogni file in Node.js è considerato un modulo separato. Le variabili, funzioni e classi all'interno di un modulo sono private a meno che non vengano esplicitamente esportate.

**Esempio di importazione ed esportazione (CommonJS):**

```javascript
// Esportazione
// modulo-esempio.js
function saluta(nome) {
  return `Ciao ${nome}!`;
}

module.exports = saluta;
// oppure
module.exports.saluta = saluta;

// Importazione
// main.js
const saluta = require('./modulo-esempio'); // Importa la funzione
// oppure
const { saluta } = require('./modulo-esempio'); // Destructuring

console.log(saluta('Mario')); // "Ciao Mario!"
```

### L'Oggetto Module

Ogni modulo in Node.js ha accesso ad un oggetto speciale chiamato `module`. Questo oggetto ha diverse proprietà, tra cui:

- `module.exports`: oggetto che sarà restituito quando il modulo viene richiesto
- `module.id`: identificatore del modulo (solitamente il percorso assoluto)
- `module.filename`: percorso assoluto del file del modulo
- `module.loaded`: booleano che indica se il modulo è stato caricato completamente
- `module.parent`: riferimento al modulo che per primo ha richiesto questo modulo (deprecato in Node.js 14+)
- `module.children`: array dei moduli richiesti da questo modulo
- `module.paths`: array dei percorsi di ricerca per questo modulo

**Esempio di utilizzo dell'oggetto module:**

```javascript
// debug-module.js
console.log('Module ID:', module.id);
console.log('Module filename:', module.filename);
console.log('Module loaded:', module.loaded);
console.log('Module paths:', module.paths);

// Esportare informazioni del modulo
module.exports = {
  getModuleInfo: () => ({
    id: module.id,
    filename: module.filename,
    loaded: module.loaded
  })
};

// Dopo questo punto, module.loaded sarà true
```

### Variabili Globali nei Moduli

Oltre all'oggetto `module`, ogni modulo ha accesso a diverse variabili globali:

- `__dirname`: directory assoluta del file corrente
- `__filename`: percorso assoluto del file corrente
- `exports`: riferimento a `module.exports`
- `require`: funzione per importare altri moduli
- `global`: oggetto globale (equivalente a `window` nel browser)

```javascript
console.log('Directory corrente:', __dirname);
console.log('File corrente:', __filename);
console.log('Exports === module.exports:', exports === module.exports); // true
```

## Moduli Core Principali

Node.js include numerosi moduli core che forniscono funzionalità essenziali:

### 1. `fs` (File System)
Permette di interagire con il file system.

```javascript
const fs = require('fs');

// Lettura sincrona
const contenuto = fs.readFileSync('file.txt', 'utf8');

// Lettura asincrona
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

### 2. `path`
Fornisce utilità per lavorare con percorsi di file e directory.

```javascript
const path = require('path');

// Unire percorsi in modo cross-platform
const percorsoCompleto = path.join(__dirname, 'cartella', 'file.txt');

// Estensione del file
const estensione = path.extname('documento.pdf'); // '.pdf'
```

### 3. `os`
Fornisce informazioni e metodi relativi al sistema operativo.

```javascript
const os = require('os');

console.log(`Piattaforma: ${os.platform()}`);
console.log(`CPU: ${os.cpus().length} core`);
console.log(`Memoria: ${Math.round(os.totalmem() / 1024 / 1024)} MB`);
```

### 4. `http` e `https`
Permettono di creare server web e fare richieste HTTP/HTTPS.

```javascript
const http = require('http');

// Creare un server
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});

server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

### 5. `url`
Fornisce utilità per il parsing degli URL.

```javascript
const url = require('url');

const myUrl = new URL('https://example.com/pagina?nome=valore#sezione');

console.log(myUrl.hostname); // example.com
console.log(myUrl.pathname); // /pagina
console.log(myUrl.searchParams.get('nome')); // valore
```

### 6. `events`
Implementa il pattern Observer tramite Event Emitter.

```javascript
const EventEmitter = require('events');

class MioEmitter extends EventEmitter {}
const emitter = new MioEmitter();

// Registrare un listener
emitter.on('evento', (a, b) => {
  console.log('Evento scatenato:', a, b);
});

// Emettere un evento
emitter.emit('evento', 'arg1', 'arg2');
```

### 7. `util`
Fornisce funzioni di utilità per sviluppatori.

```javascript
const util = require('util');
const fs = require('fs');

// Convertire funzioni callback-based in promise-based
const readFilePromise = util.promisify(fs.readFile);

readFilePromise('file.txt', 'utf8')
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Altri Moduli Core Importanti:
- `buffer`: per lavorare con dati binari
- `stream`: per elaborare dati in modo sequenziale
- `crypto`: per funzionalità crittografiche
- `zlib`: per compressione/decompressione
- `child_process`: per eseguire processi esterni
- `cluster`: per distribuire carico tra i core della CPU
- `assert`: per test e verifica
- `dns`: per risolvere nomi di dominio
- `net`: per creare server e client TCP/IPC
- `readline`: per leggere input da flussi leggibili (come stdin)
- `timers`: per gestire operazioni temporizzate
- `tty`: per interagire con terminali
- `vm`: per eseguire codice JavaScript in un contesto separato
- `querystring`: per lavorare con stringhe di query URL
