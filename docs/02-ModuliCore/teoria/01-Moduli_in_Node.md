# Moduli in Node.js

## Indice
- [Sistema di Moduli](#sistema-di-moduli)
- [Moduli Core Principali](#moduli-core-principali)
- [CommonJS vs ES Modules](#commonjs-vs-es-modules)
- [Creazione di Moduli Personalizzati](#creazione-di-moduli-personalizzati)
- [Gestione delle Dipendenze](#gestione-delle-dipendenze)

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
- `module.id`: identificatore del modulo
- `module.filename`: percorso assoluto del file
- `module.loaded`: indica se il modulo è stato caricato completamente
- `module.parent`: riferimento al modulo che per primo ha richiesto questo modulo
- `module.children`: array dei moduli richiesti da questo modulo

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

## CommonJS vs ES Modules

Node.js supporta due sistemi di moduli principali:

### CommonJS (Sistema tradizionale)

```javascript
// Importazione
const modulo = require('./modulo');

// Esportazione
module.exports = { funzione, variabile };
// oppure
exports.funzione = funzione;
```

### ES Modules (Standard ECMAScript)

```javascript
// Importazione
import { funzione } from './modulo.js';
import * as modulo from './modulo.js';

// Esportazione
export function funzione() { /* ... */ }
export const variabile = 42;
// oppure
export default class Classe { /* ... */ }
```

### Differenze Principali:

1. **Sintassi**: `require`/`module.exports` vs `import`/`export`
2. **Caricamento**: CommonJS è sincrono, ESM è asincrono
3. **Hoisting**: Le importazioni ESM sono "hoisted"
4. **Caching**: Entrambi mettono in cache i moduli, ma con meccanismi differenti
5. **Estensione file**: Con ESM è obbligatorio usare l'estensione `.js`

### Utilizzo di ES Modules in Node.js:

Per utilizzare ES Modules in Node.js, puoi:
- Usare l'estensione `.mjs` per i file
- Aggiungere `"type": "module"` al tuo `package.json`

## Creazione di Moduli Personalizzati

La creazione di moduli personalizzati è un modo fondamentale per organizzare il codice in Node.js.

### Esempio di Modulo Base:

```javascript
// matematica.js
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
```

### Esportazione di una Classe:

```javascript
// persona.js
class Persona {
  constructor(nome, eta) {
    this.nome = nome;
    this.eta = eta;
  }
  
  saluta() {
    return `Ciao, sono ${this.nome}`;
  }
}

module.exports = Persona;
```

### Pattern di Esportazione Comuni:

1. **Esportazione di un singolo elemento**:
```javascript
module.exports = function() { /* ... */ };
```

2. **Esportazione di oggetti con proprietà**:
```javascript
module.exports = {
  prop1: value1,
  prop2: value2
};
```

3. **Esportazione tramite proprietà di exports**:
```javascript
exports.method1 = function() { /* ... */ };
exports.method2 = function() { /* ... */ };
```

## Gestione delle Dipendenze

La gestione delle dipendenze è fondamentale per mantenere l'applicazione aggiornata e sicura.

### Dipendenze Dirette vs Indirette

- **Dipendenze dirette**: moduli che il tuo codice importa direttamente
- **Dipendenze indirette**: moduli richiesti dalle dipendenze dirette

### Circular Dependencies (Dipendenze Circolari)

Le dipendenze circolari si verificano quando il modulo A richiede il modulo B, e il modulo B richiede il modulo A.

```
ModuloA -> ModuloB -> ModuloA
```

Node.js gestisce le dipendenze circolari restituendo un'esportazione "parziale" o "incompleta" quando si verifica una dipendenza circolare. È meglio evitarle rifattorizzando il codice, ma a volte sono inevitabili.

### Best Practices

1. **Moduli piccoli e focalizzati**: ogni modulo dovrebbe fare una cosa e farla bene
2. **Evita stato globale**: rende il codice difficile da testare
3. **Usa il destructuring per importare solo ciò che serve**:
   ```javascript
   const { metodo1, metodo2 } = require('./modulo-grande');
   ```
4. **Organizza i moduli in cartelle tematiche**:
   ```
   /models
   /controllers
   /utils
   /services
   ```
5. **Esporta interfacce, non implementazioni**: esponi solo ciò che deve essere pubblico
6. **Usa la lazy evaluation quando possibile**:
   ```javascript
   // Invece di richiamare moduli pesanti all'avvio
   function getExpensiveModule() {
     return require('./expensive-module');
   }
   ```

La comprensione approfondita del sistema di moduli è essenziale per creare applicazioni Node.js ben strutturate e manutenibili.