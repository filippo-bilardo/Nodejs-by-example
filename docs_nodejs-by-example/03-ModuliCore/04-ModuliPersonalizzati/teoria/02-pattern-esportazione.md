# Pattern di Esportazione in Node.js

## Introduzione

In Node.js, esistono diversi pattern per esportare funzionalità dai moduli. La scelta del pattern dipende dalle esigenze specifiche dell'applicazione e dallo stile di programmazione preferito. In questa guida, esploreremo i principali pattern di esportazione e quando utilizzarli.

## Pattern di Esportazione Comuni

### 1. Esportazione di un Oggetto Letterale

Questo è il pattern più comune e semplice, dove si esporta un oggetto con diverse proprietà e metodi.

```javascript
// logger.js
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

Utilizzo:

```javascript
const logger = require('./logger');
logger.info('Applicazione avviata');
logger.warning('Memoria in esaurimento');
```

**Vantaggi**:
- Semplice da implementare e comprendere
- Permette di esportare più funzionalità correlate

**Svantaggi**:
- Non supporta lo stato interno privato
- Tutte le proprietà sono pubbliche

### 2. Esportazione di una Classe

Quando si ha bisogno di incapsulamento e stato interno, l'esportazione di una classe è una buona scelta.

```javascript
// calculator.js
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

Utilizzo:

```javascript
const Calculator = require('./calculator');
const calc = new Calculator(10);
console.log('Risultato:', calc.add(5).multiply(2).subtract(8).getResult());
```

**Vantaggi**:
- Supporta l'incapsulamento e lo stato interno
- Permette l'ereditarietà e il polimorfismo
- Facilita l'implementazione di metodi concatenabili (method chaining)

**Svantaggi**:
- Richiede l'istanziazione con `new`
- Può essere più complesso per funzionalità semplici

### 3. Esportazione di una Factory Function

Una factory function è una funzione che crea e restituisce un oggetto. È utile quando si vuole creare oggetti con stato interno privato senza usare classi.

```javascript
// factory.js
function createCounter(initialValue = 0) {
  let count = initialValue; // Variabile privata
  
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

Utilizzo:

```javascript
const createCounter = require('./factory');
const counter = createCounter(5);
console.log('Valore iniziale:', counter.getValue());
console.log('Incremento:', counter.increment());
```

**Vantaggi**:
- Permette la creazione di stato privato tramite closure
- Non richiede l'uso di `new`
- Più flessibile rispetto alle classi

**Svantaggi**:
- Può consumare più memoria se si creano molte istanze
- Meno familiare per sviluppatori abituati alla programmazione orientata agli oggetti classica

### 4. Esportazione di una Funzione Singola

Quando un modulo ha una sola responsabilità, può essere utile esportare direttamente una funzione.

```javascript
// greet.js
module.exports = function greet(name) {
  return `Ciao, ${name}!`;
};
```

Utilizzo:

```javascript
const greet = require('./greet');
console.log(greet('Mario'));
```

**Vantaggi**:
- Semplicità e chiarezza
- Ideale per moduli con una singola responsabilità

**Svantaggi**:
- Limitato a una singola funzionalità

### 5. Modulo Rivelatore (Revealing Module Pattern)

Questo pattern permette di definire funzioni e variabili private, esponendo solo ciò che si desidera rendere pubblico.

```javascript
// database.js
module.exports = (function() {
  // Variabili e funzioni private
  let connection = null;
  
  function connect(config) {
    // Logica di connessione
    connection = { /* ... */ };
    return true;
  }
  
  function executeQuery(sql) {
    if (!connection) {
      throw new Error('Connessione non stabilita');
    }
    // Esecuzione della query
    return { results: [] };
  }
  
  function disconnect() {
    connection = null;
  }
  
  // Interfaccia pubblica
  return {
    connect,
    query: executeQuery,
    disconnect
  };
})();
```

Utilizzo:

```javascript
const db = require('./database');
db.connect({ /* config */ });
const results = db.query('SELECT * FROM users');
```

**Vantaggi**:
- Permette di nascondere dettagli implementativi
- Crea un'istanza singleton automaticamente

**Svantaggi**:
- Difficile da testare in isolamento
- Non permette la creazione di multiple istanze

## Scegliere il Pattern Giusto

La scelta del pattern di esportazione dipende da diversi fattori:

1. **Complessità**: Per funzionalità semplici, un oggetto letterale o una funzione singola possono essere sufficienti.

2. **Stato**: Se il modulo deve mantenere uno stato interno, considerare classi o factory functions.

3. **Istanziabilità**: Se sono necessarie multiple istanze, usare classi o factory functions.

4. **Familiarità del team**: Considerare lo stile di programmazione con cui il team ha più esperienza.

5. **Testabilità**: Alcuni pattern sono più facili da testare di altri.

## Conclusione

I pattern di esportazione in Node.js offrono diverse opzioni per strutturare il codice in base alle esigenze specifiche. Non esiste un pattern "migliore" in assoluto, ma piuttosto quello più adatto al contesto specifico. Sperimentare con diversi pattern può aiutare a trovare quello che meglio si adatta al proprio stile di programmazione e alle esigenze del progetto.

Nel prossimo capitolo, esploreremo come gestire le dipendenze tra moduli e come evitare problemi comuni come le dipendenze circolari.