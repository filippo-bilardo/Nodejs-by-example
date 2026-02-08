# Esercitazione 4: Moduli Personalizzati in Node.js

## Panoramica
In questa esercitazione esploreremo come creare e utilizzare moduli personalizzati in Node.js, un aspetto fondamentale per organizzare il codice in modo modulare e riutilizzabile.

## Obiettivi
- Comprendere la struttura dei moduli personalizzati in Node.js
- Creare moduli riutilizzabili con funzionalità specifiche
- Implementare diversi pattern di esportazione
- Gestire le dipendenze tra moduli
- Organizzare il codice in modo efficiente

## Argomenti Teorici Collegati
- [Creazione di Moduli Personalizzati](./teoria/01-creazione-moduli.md)
- [Pattern di Esportazione](./teoria/02-pattern-esportazione.md)
- [Gestione delle Dipendenze](./teoria/03-gestione-dipendenze.md)

## Esercizi Pratici

### Esercizio 4.1: Creazione di un Modulo Base

```javascript
// utils.js
function somma(a, b) {
  return a + b;
}

function sottrazione(a, b) {
  return a - b;
}

function moltiplicazione(a, b) {
  return a * b;
}

function divisione(a, b) {
  if (b === 0) {
    throw new Error('Divisione per zero non consentita');
  }
  return a / b;
}

// Esportazione delle funzioni
module.exports = {
  somma,
  sottrazione,
  moltiplicazione,
  divisione
};
```

```javascript
// app.js
const utils = require('./utils');

console.log('Somma:', utils.somma(5, 3));
console.log('Sottrazione:', utils.sottrazione(10, 4));
console.log('Moltiplicazione:', utils.moltiplicazione(3, 6));
console.log('Divisione:', utils.divisione(15, 3));

// Gestione degli errori
try {
  console.log('Divisione per zero:', utils.divisione(10, 0));
} catch (err) {
  console.error('Errore:', err.message);
}
```

### Esercizio 4.2: Pattern di Esportazione Alternativi

```javascript
// logger.js
// Metodo 1: Esportazione di un oggetto
const logger = {
  info: (message) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  },
  warning: (message) => {
    console.log(`[WARNING] ${new Date().toISOString()}: ${message}`);
  },
  error: (message) => {
    console.log(`[ERROR] ${new Date().toISOString()}: ${message}`);
  }
};

module.exports = logger;
```

```javascript
// calculator.js
// Metodo 2: Esportazione di una classe
class Calculator {
  constructor(initialValue = 0) {
    this.result = initialValue;
  }

  add(value) {
    this.result += value;
    return this;
  }

  subtract(value) {
    this.result -= value;
    return this;
  }

  multiply(value) {
    this.result *= value;
    return this;
  }

  divide(value) {
    if (value === 0) {
      throw new Error('Divisione per zero non consentita');
    }
    this.result /= value;
    return this;
  }

  getResult() {
    return this.result;
  }
}

module.exports = Calculator;
```

```javascript
// factory.js
// Metodo 3: Esportazione di una factory function
function createCounter(initialValue = 0) {
  let count = initialValue;
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    reset: () => {
      count = initialValue;
      return count;
    },
    getValue: () => count
  };
}

module.exports = createCounter;
```

```javascript
// app2.js
const logger = require('./logger');
const Calculator = require('./calculator');
const createCounter = require('./factory');

// Utilizzo del logger
logger.info('Applicazione avviata');
logger.warning('Memoria in esaurimento');
logger.error('Connessione al database fallita');

// Utilizzo della classe Calculator
const calc = new Calculator(10);
console.log('Risultato:', calc.add(5).multiply(2).subtract(8).getResult());

// Utilizzo della factory function
const counter = createCounter(5);
console.log('Valore iniziale:', counter.getValue());
console.log('Incremento:', counter.increment());
console.log('Incremento:', counter.increment());
console.log('Decremento:', counter.decrement());
console.log('Reset:', counter.reset());
```

### Esercizio 4.3: Organizzazione di un Progetto con Moduli

Struttura delle directory:
```
project/
├── app.js
├── config/
│   └── settings.js
├── modules/
│   ├── database.js
│   └── users.js
└── utils/
    ├── logger.js
    └── helpers.js
```

```javascript
// config/settings.js
module.exports = {
  appName: 'ModuliApp',
  version: '1.0.0',
  database: {
    host: 'localhost',
    port: 27017,
    name: 'myapp'
  },
  logLevel: 'info'
};
```

```javascript
// utils/logger.js
const settings = require('../config/settings');

function getLogPrefix(level) {
  return `[${level.toUpperCase()}] [${settings.appName}] ${new Date().toISOString()}`;
}

function shouldLog(level) {
  const levels = {
    error: 0,
    warning: 1,
    info: 2,
    debug: 3
  };
  
  return levels[level] <= levels[settings.logLevel];
}

module.exports = {
  debug: (message) => {
    if (shouldLog('debug')) {
      console.log(`${getLogPrefix('debug')}: ${message}`);
    }
  },
  info: (message) => {
    if (shouldLog('info')) {
      console.log(`${getLogPrefix('info')}: ${message}`);
    }
  },
  warning: (message) => {
    if (shouldLog('warning')) {
      console.log(`${getLogPrefix('warning')}: ${message}`);
    }
  },
  error: (message) => {
    if (shouldLog('error')) {
      console.error(`${getLogPrefix('error')}: ${message}`);
    }
  }
};
```

```javascript
// utils/helpers.js
module.exports = {
  generateId: () => {
    return Math.random().toString(36).substr(2, 9);
  },
  formatDate: (date) => {
    return new Date(date).toLocaleDateString();
  },
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
};
```

```javascript
// modules/database.js
const settings = require('../config/settings');
const logger = require('../utils/logger');

function connect() {
  const { host, port, name } = settings.database;
  logger.info(`Connessione al database ${name} su ${host}:${port}`);
  // Simulazione connessione al database
  return new Promise((resolve) => {
    setTimeout(() => {
      logger.info('Connessione al database stabilita');
      resolve(true);
    }, 1000);
  });
}

module.exports = {
  connect,
  query: (sql) => {
    logger.debug(`Esecuzione query: ${sql}`);
    // Simulazione query
    return Promise.resolve({ rows: [], affectedRows: 0 });
  }
};
```

```javascript
// modules/users.js
const logger = require('../utils/logger');
const helpers = require('../utils/helpers');
const db = require('./database');

const users = [];

module.exports = {
  create: (userData) => {
    const user = {
      id: helpers.generateId(),
      name: helpers.capitalize(userData.name),
      email: userData.email,
      createdAt: new Date()
    };
    
    users.push(user);
    logger.info(`Utente creato: ${user.id}`);
    return user;
  },
  
  getAll: () => {
    return users.map(user => ({
      ...user,
      createdAt: helpers.formatDate(user.createdAt)
    }));
  },
  
  findById: (id) => {
    const user = users.find(u => u.id === id);
    if (!user) {
      logger.warning(`Utente non trovato: ${id}`);
      return null;
    }
    return {
      ...user,
      createdAt: helpers.formatDate(user.createdAt)
    };
  }
};
```

```javascript
// app.js
const settings = require('./config/settings');
const logger = require('./utils/logger');
const db = require('./modules/database');
const users = require('./modules/users');

async function main() {
  logger.info(`Avvio applicazione ${settings.appName} v${settings.version}`);
  
  try {
    // Connessione al database
    await db.connect();
    
    // Creazione utenti
    const user1 = users.create({ name: 'mario', email: 'mario@example.com' });
    const user2 = users.create({ name: 'luigi', email: 'luigi@example.com' });
    
    // Recupero utenti
    logger.info('Elenco utenti:');
    const allUsers = users.getAll();
    console.log(allUsers);
    
    // Ricerca utente
    const foundUser = users.findById(user1.id);
    logger.info(`Utente trovato: ${foundUser.name}`);
    
    // Utente non esistente
    const notFound = users.findById('non-esistente');
    if (!notFound) {
      logger.error('Utente non trovato');
    }
    
  } catch (err) {
    logger.error(`Errore nell'applicazione: ${err.message}`);
  }
}

main();
```

## Sfide Aggiuntive

1. **Modulo di Configurazione Avanzato**: Crea un modulo che carica configurazioni da file JSON o variabili d'ambiente.

2. **Plugin System**: Implementa un sistema di plugin che permette di caricare dinamicamente moduli esterni.

3. **Circular Dependencies**: Risolvi un problema di dipendenze circolari tra moduli.

## Risorse Aggiuntive

- [Documentazione ufficiale Node.js sui moduli](https://nodejs.org/api/modules.html)
- [Patterns di modularizzazione in JavaScript](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript)
- [CommonJS vs ES Modules](https://blog.logrocket.com/commonjs-vs-es-modules-node-js/)

## Navigazione del Corso

- [Indice del Corso](../README.md)
- [Modulo Precedente: Sistema di File in Node.js](../03-Sistema_di_File_in_Node.js/README.md)
- [Modulo Successivo: NPM](../05-NPM/README.md)

# Moduli personalizzati in Node.js

## Indice

### Capitolo 1: Introduzione ai moduli in Node.js
1.1 Cos'è un modulo  
1.2 Il sistema modulare di Node.js  
1.3 CommonJS vs ES Modules  
1.4 Vantaggi dell'uso dei moduli  
1.5 Quando creare moduli personalizzati  
**Autovalutazione Capitolo 1**

### Capitolo 2: Creazione del primo modulo personalizzato
2.1 Struttura base di un modulo  
2.2 Esportare funzioni con module.exports  
2.3 Esportare oggetti e classi  
2.4 Importare moduli con require()  
2.5 Esempi pratici  
2.6 Best practice per la creazione di moduli  
**Autovalutazione Capitolo 2**

### Capitolo 3: exports vs module.exports
3.1 Differenze fondamentali  
3.2 Quando usare exports  
3.3 Quando usare module.exports  
3.4 Errori comuni da evitare  
3.5 Pattern di esportazione avanzati  
**Autovalutazione Capitolo 3**

### Capitolo 4: Organizzazione dei moduli
4.1 Struttura di cartelle per progetti modulari  
4.2 File index.js come punto di accesso  
4.3 Moduli privati e pubblici  
4.4 Convenzioni di naming  
4.5 Gestione delle dipendenze circolari  
**Autovalutazione Capitolo 4**

### Capitolo 5: ES Modules (ESM)
5.1 Sintassi import/export  
5.2 Named exports vs default exports  
5.3 Configurazione di Node.js per ESM  
5.4 Differenze con CommonJS  
5.5 Migrazione da CommonJS a ESM  
5.6 Compatibilità e interoperabilità  
**Autovalutazione Capitolo 5**

### Capitolo 6: Pattern avanzati per moduli
6.1 Module pattern e closure  
6.2 Singleton pattern  
6.3 Factory pattern  
6.4 Dependency injection  
6.5 Moduli configurabili  
6.6 Lazy loading dei moduli  
**Autovalutazione Capitolo 6**

### Capitolo 7: Gestione del path e risoluzione dei moduli
7.1 Path relativi vs assoluti  
7.2 Uso di __dirname e __filename  
7.3 Il modulo path  
7.4 Algoritmo di risoluzione di Node.js  
7.5 Alias e path mapping  
**Autovalutazione Capitolo 7**

### Capitolo 8: Creare pacchetti npm riutilizzabili
8.1 Struttura di un pacchetto npm  
8.2 Il file package.json  
8.3 Pubblicazione su npm  
8.4 Versioning semantico  
8.5 Documentazione e README  
8.6 Testing dei moduli  
**Autovalutazione Capitolo 8**

### Capitolo 9: Debugging e troubleshooting
9.1 Errori comuni nei moduli  
9.2 Tecniche di debugging  
9.3 Uso del debugger integrato  
9.4 Logging efficace  
9.5 Gestione degli errori nei moduli  
**Autovalutazione Capitolo 9**

### Capitolo 10: Progetti pratici
10.1 Progetto 1: Modulo di utilità per stringhe  
10.2 Progetto 2: Sistema di logging personalizzato  
10.3 Progetto 3: Modulo di gestione configurazioni  
10.4 Progetto 4: API wrapper riutilizzabile  
10.5 Progetto 5: CLI tool modulare  
**Autovalutazione Capitolo 10**

