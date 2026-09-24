# Introduzione ai moduli in Node.js

## Cos'è un modulo in Node.js

Un **modulo** in Node.js è un'unità autonoma e riutilizzabile di codice JavaScript che incapsula funzionalità specifiche. Ogni file JavaScript in Node.js è automaticamente trattato come un modulo separato con il proprio **scope isolato**.

### Concetti fondamentali

**1. Isolamento dello scope**

In Node.js, le variabili e le funzioni definite in un file non sono automaticamente accessibili da altri file. Questo previene conflitti e inquinamento dello scope globale.

```javascript
// file1.js
const messaggio = "Ciao da file1";
function saluta() {
    console.log(messaggio);
}

// file2.js
const messaggio = "Ciao da file2"; // Non c'è conflitto con file1.js
console.log(messaggio); // "Ciao da file2"
```

**2. Esportazione esplicita**

Per rendere funzioni, oggetti o variabili disponibili ad altri moduli, dobbiamo esportarli esplicitamente:

```javascript
// utils.js
function somma(a, b) {
    return a + b;
}

function moltiplica(a, b) {
    return a * b;
}

// Esportazione esplicita
module.exports = {
    somma,
    moltiplica
};
```

**3. Importazione**

Per usare un modulo in un altro file, dobbiamo importarlo usando `require()`:

```javascript
// app.js
const utils = require('./utils');

console.log(utils.somma(5, 3)); // 8
console.log(utils.moltiplica(4, 2)); // 8
```

### Perché i moduli sono importanti

**1. Organizzazione del codice**

I moduli permettono di suddividere applicazioni complesse in parti gestibili:

```javascript
// Senza moduli - tutto in un file
// app.js (1500 righe di codice difficili da gestire)
function connectDatabase() { /* ... */ }
function sendEmail() { /* ... */ }
function validateUser() { /* ... */ }
function processPayment() { /* ... */ }
// ... centinaia di altre funzioni

// Con moduli - codice organizzato
// database.js
module.exports = {
    connect() { /* ... */ }
};

// email.js
module.exports = {
    send() { /* ... */ }
};

// validators.js
module.exports = {
    validateUser() { /* ... */ }
};

// payments.js
module.exports = {
    process() { /* ... */ }
};

// app.js - file principale pulito
const db = require('./database');
const email = require('./email');
const validators = require('./validators');
const payments = require('./payments');
```

**2. Riutilizzabilità**

I moduli ben progettati possono essere riutilizzati in progetti diversi:

```javascript
// stringUtils.js - modulo riutilizzabile
module.exports = {
    capitalizza(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    tronca(str, maxLength) {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    },
    
    slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};

// Può essere usato in progetto-A, progetto-B, progetto-C...
const stringUtils = require('./stringUtils');
console.log(stringUtils.slugify("Hello World!")); // "hello-world"
```

**3. Manutenibilità**

Con i moduli, è più facile trovare e correggere bug:

```javascript
// Se c'è un bug nella validazione email, so esattamente dove guardare
// validators.js
module.exports = {
    validaEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
};
```

## Tipi di moduli in Node.js

Node.js supporta tre tipi principali di moduli:

### 1. Moduli core (built-in)

Moduli forniti nativamente da Node.js, disponibili senza installazione:

```javascript
// File system
const fs = require('fs');
fs.readFileSync('file.txt', 'utf8');

// Path
const path = require('path');
const fullPath = path.join(__dirname, 'files', 'data.json');

// HTTP
const http = require('http');
const server = http.createServer((req, res) => {
    res.end('Hello World');
});

// Events
const EventEmitter = require('events');
const emitter = new EventEmitter();

// Crypto
const crypto = require('crypto');
const hash = crypto.createHash('sha256');
```

**Moduli core più comuni:**
Node.js include numerosi moduli core che forniscono funzionalità essenziali:

- `fs` (File System) Permette di interagire con il file system.
- `path` Fornisce utilità per lavorare con percorsi di file e directory.
- `os` Fornisce informazioni e metodi relativi al sistema operativo.
- `http` e `https` Permettono di creare server web e fare richieste HTTP/HTTPS.
- `url` Fornisce utilità per il parsing degli URL.
- `events` Implementa il pattern Observer tramite Event Emitter.
- `util` Fornisce funzioni di utilità per sviluppatori.
- `buffer` Per lavorare con dati binari
- `stream` Per elaborare dati in modo sequenziale
- `crypto` Per funzionalità crittografiche
- `zlib` Per compressione/decompressione
- `child_process` Per eseguire processi esterni
- `cluster` Per distribuire carico tra i core della CPU
- `assert` Per test e verifica
- `dns` Per risolvere nomi di dominio
- `net` Per creare server e client TCP/IPC
- `readline` Per leggere input da flussi leggibili (come stdin)
- `timers` Per gestire operazioni temporizzate
- `tty` Per interagire con terminali
- `vm` Per eseguire codice JavaScript in un contesto separato

### 2. Moduli di terze parti (npm)

Moduli installati tramite npm (Node Package Manager):

```bash
# Installazione
npm install express
npm install lodash
npm install axios
```

```javascript
// Uso di moduli npm
const express = require('express');
const _ = require('lodash');
const axios = require('axios');

const app = express();

app.get('/', (req, res) => {
    res.send('Hello World');
});

// Lodash per manipolazione dati
const numbers = [1, 2, 3, 4, 5];
const doubled = _.map(numbers, n => n * 2);

// Axios per HTTP requests
axios.get('https://api.example.com/data')
    .then(response => console.log(response.data));
```

### 3. Moduli locali (personalizzati)

Moduli creati da noi nel progetto:

```javascript
// math.js - modulo locale
module.exports = {
    somma(a, b) {
        return a + b;
    },
    
    sottrai(a, b) {
        return a - b;
    }
};

// app.js
const math = require('./math'); // ./ indica percorso relativo

console.log(math.somma(10, 5)); // 15
```

## Come funziona il sistema di moduli

### Il wrapper delle funzioni

Node.js avvolge ogni modulo in una funzione wrapper prima dell'esecuzione:

```javascript
// Il tuo codice
const messaggio = "Hello";
console.log(messaggio);

// Viene effettivamente eseguito come:
(function(exports, require, module, __filename, __dirname) {
    const messaggio = "Hello";
    console.log(messaggio);
});
```

**Parametri disponibili in ogni modulo:**

```javascript
// myModule.js
console.log(__filename); // Percorso completo del file corrente
console.log(__dirname);  // Percorso della directory corrente
console.log(module);     // Oggetto module corrente
console.log(exports);    // Reference a module.exports
console.log(require);    // Funzione per importare moduli
```

### Il processo di caricamento

Quando esegui `require('./myModule')`, Node.js:

1. **Risolve il percorso** del modulo
2. **Controlla la cache** - se già caricato, ritorna la versione in cache
3. **Carica il file** dal disco
4. **Avvolge il codice** nella funzione wrapper
5. **Esegue il codice** del modulo
6. **Memorizza in cache** il risultato
7. **Ritorna** `module.exports`

```javascript
// Il ciclo di vita di un modulo

// 1. Prima richiesta - il modulo viene caricato ed eseguito
const config = require('./config');
console.log('Config caricato');

// 2. Seconda richiesta - ritorna dalla cache (non esegue di nuovo)
const config2 = require('./config');

// config e config2 sono lo STESSO oggetto
console.log(config === config2); // true
```

### Module.exports vs exports

Node.js fornisce due modi per esportare, ma c'è una differenza importante:

```javascript
// exports è un alias di module.exports
console.log(exports === module.exports); // true

// ✅ Corretto - aggiungere proprietà a exports
exports.somma = (a, b) => a + b;
exports.sottrai = (a, b) => a - b;

// ✅ Corretto - assegnare a module.exports
module.exports = {
    somma: (a, b) => a + b,
    sottrai: (a, b) => a - b
};

// ❌ Errore - NON riassegnare exports
exports = {
    somma: (a, b) => a + b
}; // Questo NON funziona!

// Perché? exports è solo una reference a module.exports
// Riassegnarlo rompe il collegamento
```

**Regola semplice:** Usa sempre `module.exports` quando vuoi esportare un singolo valore, classe o funzione. Usa `exports.proprieta` per aggiungere proprietà.

## Esempi pratici

### Esempio 1: Modulo di utility

```javascript
// dateUtils.js
function formattaData(data) {
    const giorno = String(data.getDate()).padStart(2, '0');
    const mese = String(data.getMonth() + 1).padStart(2, '0');
    const anno = data.getFullYear();
    return `${giorno}/${mese}/${anno}`;
}

function aggiungiGiorni(data, giorni) {
    const risultato = new Date(data);
    risultato.setDate(risultato.getDate() + giorni);
    return risultato;
}

function differenzaGiorni(data1, data2) {
    const diff = Math.abs(data2 - data1);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

module.exports = {
    formattaData,
    aggiungiGiorni,
    differenzaGiorni
};

// app.js
const dateUtils = require('./dateUtils');

const oggi = new Date();
console.log(dateUtils.formattaData(oggi));

const futuro = dateUtils.aggiungiGiorni(oggi, 7);
console.log(`Tra 7 giorni: ${dateUtils.formattaData(futuro)}`);

const diff = dateUtils.differenzaGiorni(oggi, futuro);
console.log(`Differenza: ${diff} giorni`);
```

### Esempio 2: Modulo con classe

```javascript
// User.js
class User {
    constructor(nome, email) {
        this.id = Date.now();
        this.nome = nome;
        this.email = email;
        this.dataCreazione = new Date();
        this.attivo = true;
    }
    
    saluta() {
        return `Ciao, sono ${this.nome}`;
    }
    
    disattiva() {
        this.attivo = false;
        console.log(`Utente ${this.nome} disattivato`);
    }
    
    static creaAdmin(nome, email) {
        const admin = new User(nome, email);
        admin.ruolo = 'admin';
        return admin;
    }
}

module.exports = User;

// app.js
const User = require('./User');

const mario = new User('Mario Rossi', 'mario@email.com');
console.log(mario.saluta()); // "Ciao, sono Mario Rossi"

const admin = User.creaAdmin('Admin', 'admin@email.com');
console.log(admin.ruolo); // "admin"
```

### Esempio 3: Modulo di configurazione

```javascript
// config.js
const config = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'myapp',
        user: process.env.DB_USER || 'admin'
    },
    
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    
    isDevelopment() {
        return this.server.env === 'development';
    },
    
    getConnectionString() {
        const db = this.database;
        return `postgres://${db.user}@${db.host}:${db.port}/${db.name}`;
    }
};

module.exports = config;

// app.js
const config = require('./config');

console.log(`Server in ascolto sulla porta ${config.server.port}`);
console.log(`Connessione DB: ${config.getConnectionString()}`);

if (config.isDevelopment()) {
    console.log('Modalità sviluppo attiva');
}
```

### Esempio 4: Modulo con stato privato

```javascript
// counter.js
let contatore = 0; // Variabile privata

module.exports = {
    incrementa() {
        contatore++;
        return contatore;
    },
    
    decrementa() {
        contatore--;
        return contatore;
    },
    
    getValore() {
        return contatore;
    },
    
    reset() {
        contatore = 0;
    }
};

// app.js
const counter = require('./counter');

console.log(counter.incrementa()); // 1
console.log(counter.incrementa()); // 2
console.log(counter.incrementa()); // 3
console.log(counter.getValore());  // 3

counter.reset();
console.log(counter.getValore());  // 0

// Non puoi accedere direttamente a 'contatore'
console.log(counter.contatore); // undefined
```

### Esempio 5: Modulo factory

```javascript
// logger.js
const fs = require('fs');

function creaLogger(nomeFile) {
    let contatore = 0;
    
    return {
        log(messaggio) {
            contatore++;
            const timestamp = new Date().toISOString();
            const entry = `[${contatore}] ${timestamp}: ${messaggio}\n`;
            
            fs.appendFileSync(nomeFile, entry);
            console.log(entry.trim());
        },
        
        error(errore) {
            this.log(`ERROR - ${errore.message}`);
        },
        
        getContatore() {
            return contatore;
        }
    };
}

module.exports = creaLogger;

// app.js
const creaLogger = require('./logger');

const logger1 = creaLogger('app.log');
const logger2 = creaLogger('errors.log');

logger1.log('Applicazione avviata');
logger1.log('Utente connesso');

logger2.error(new Error('Connessione database fallita'));

console.log(`Logger1 ha ${logger1.getContatore()} entries`);
console.log(`Logger2 ha ${logger2.getContatore()} entries`);
```

## Percorsi nei moduli

### Percorsi relativi

```javascript
// Stesso livello
const utils = require('./utils');

// Sottocartella
const db = require('./database/connection');

// Cartella superiore
const shared = require('../shared/helpers');

// Due livelli superiori
const config = require('../../config/settings');
```

### Percorsi assoluti e __dirname

```javascript
// __dirname contiene il percorso della directory corrente
console.log(__dirname); // /home/user/myapp/src

// __filename contiene il percorso completo del file
console.log(__filename); // /home/user/myapp/src/app.js

// Costruire percorsi assoluti
const path = require('path');
const configPath = path.join(__dirname, 'config', 'database.js');
const config = require(configPath);
```

### Importare cartelle

Quando importi una cartella, Node.js cerca automaticamente `index.js`:

```javascript
// Struttura:
// utils/
//   ├── index.js
//   ├── validators.js
//   └── formatters.js

// utils/index.js
module.exports = {
    validators: require('./validators'),
    formatters: require('./formatters')
};

// app.js
const utils = require('./utils'); // Carica automaticamente index.js

utils.validators.validaEmail('test@email.com');
utils.formatters.formattaData(new Date());
```

## Cache dei moduli

Node.js memorizza in cache i moduli dopo il primo caricamento:

```javascript
// myModule.js
console.log('Modulo caricato!');

module.exports = {
    messaggio: 'Hello'
};

// app.js
const mod1 = require('./myModule'); // Stampa: "Modulo caricato!"
const mod2 = require('./myModule'); // Non stampa nulla (usa la cache)

console.log(mod1 === mod2); // true - stesso oggetto

// Visualizzare la cache
console.log(require.cache);

// Invalidare la cache (raramente necessario)
delete require.cache[require.resolve('./myModule')];
const mod3 = require('./myModule'); // Stampa di nuovo: "Modulo caricato!"
```

## CommonJS vs ES Modules

Node.js supporta due sistemi di moduli:

### CommonJS (tradizionale)

```javascript
// Esportazione
module.exports = { somma, sottrai };

// Importazione
const math = require('./math');
```

**Caratteristiche:**
- Sistema originale di Node.js
- Caricamento sincrono
- Esportazioni dinamiche
- File `.js` standard

### ES Modules (moderno)

```javascript
// Esportazione
export function somma(a, b) { return a + b; }
export function sottrai(a, b) { return a - b; }

// Importazione
import { somma, sottrai } from './math.mjs';
```

**Caratteristiche:**
- Standard ECMAScript
- Caricamento asincrono
- Esportazioni statiche
- File `.mjs` o `.js` con `"type": "module"` in package.json

### Quando usare quale

**Usa CommonJS quando:**
- Lavori su progetti Node.js esistenti
- Hai bisogno di compatibilità con vecchie versioni
- Vuoi esportazioni condizionali

**Usa ES Modules quando:**
- Inizi un nuovo progetto
- Vuoi condividere codice con il browser
- Vuoi sfruttare il tree-shaking

## Riepilogo

I moduli in Node.js sono fondamentali per:

1. **Organizzare** il codice in unità logiche
2. **Riutilizzare** funzionalità in progetti diversi
3. **Incapsulare** implementazioni e proteggere lo scope
4. **Gestire** le dipendenze in modo esplicito
5. **Facilitare** testing e manutenzione

**Ricorda:**
- Ogni file è un modulo con scope isolato
- Usa `module.exports` per esportare
- Usa `require()` per importare
- Node.js memorizza in cache i moduli
- I moduli possono essere core, npm, o locali

Con una buona organizzazione dei moduli, il tuo codice Node.js sarà più pulito, manutenibile e scalabile.