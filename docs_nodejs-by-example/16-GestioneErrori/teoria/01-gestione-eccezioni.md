# Gestione delle Eccezioni in Node.js

## Introduzione

La gestione degli errori è un aspetto fondamentale dello sviluppo di applicazioni robuste in Node.js. Un'applicazione che gestisce correttamente gli errori è più affidabile, più facile da mantenere e offre una migliore esperienza utente. In questa guida, esploreremo le tecniche e le best practice per la gestione delle eccezioni in Node.js.

## Tipi di Errori in Node.js

### 1. Errori Standard (Standard JavaScript Errors)

Node.js include diversi tipi di errori JavaScript standard:

- **Error**: La classe base per tutti gli errori in JavaScript
- **SyntaxError**: Errori nella sintassi del codice
- **ReferenceError**: Riferimento a una variabile non definita
- **TypeError**: Operazione su un tipo di dato non valido
- **RangeError**: Valore numerico fuori dall'intervallo consentito
- **URIError**: Errori nella codifica/decodifica URI
- **EvalError**: Errori nell'utilizzo della funzione `eval()`

```javascript
// Esempi di errori standard
try {
  // SyntaxError
  eval('if (true) { console.log("Ciao") }}}'); // Parentesi graffe sbilanciate
  
  // ReferenceError
  console.log(variabileNonDefinita);
  
  // TypeError
  const num = 123;
  num.toUpperCase();
  
  // RangeError
  const arr = new Array(-1); // Dimensione negativa dell'array
} catch (err) {
  console.error(`Tipo di errore: ${err.name}`);
  console.error(`Messaggio: ${err.message}`);
  console.error(`Stack trace: ${err.stack}`);
}
```

### 2. Errori Specifici di Node.js (System Errors)

Node.js genera errori di sistema quando un'operazione fallisce a livello di sistema, come errori di rete, file system, ecc. Questi errori hanno proprietà aggiuntive:

- **code**: Codice di errore stringa (es. 'ENOENT')
- **errno**: Numero di errore
- **syscall**: Chiamata di sistema che ha fallito
- **path/address/port**: Informazioni contestuali sull'errore

```javascript
const fs = require('fs');

// Tentativo di leggere un file che non esiste
fs.readFile('/file/inesistente.txt', (err, data) => {
  if (err) {
    console.error(`Codice errore: ${err.code}`); // 'ENOENT'
    console.error(`Syscall: ${err.syscall}`); // 'open'
    console.error(`Path: ${err.path}`); // '/file/inesistente.txt'
    return;
  }
  
  console.log(data);
});
```

### 3. Errori Personalizzati (Custom Errors)

È possibile creare classi di errori personalizzate estendendo la classe `Error`:

```javascript
class DatabaseError extends Error {
  constructor(message, query) {
    super(message);
    this.name = 'DatabaseError';
    this.query = query;
    this.date = new Date();
    
    // Cattura lo stack trace
    Error.captureStackTrace(this, DatabaseError);
  }
}

function eseguiQuery(query) {
  if (query.includes('DROP TABLE')) {
    throw new DatabaseError('Operazione non consentita', query);
  }
  // Esegui la query...
}

try {
  eseguiQuery('DROP TABLE utenti');
} catch (err) {
  if (err instanceof DatabaseError) {
    console.error(`Errore database: ${err.message}`);
    console.error(`Query problematica: ${err.query}`);
    console.error(`Data: ${err.date}`);
  } else {
    console.error(`Errore generico: ${err.message}`);
  }
}
```

## Gestione degli Errori Sincroni

Per il codice sincrono, il blocco try-catch è il metodo standard per gestire gli errori:

```javascript
try {
  // Codice che potrebbe generare un errore
  const data = JSON.parse('{"malformato": true,}'); // Virgola in eccesso
} catch (err) {
  // Gestione dell'errore
  console.error('Errore durante il parsing JSON:', err.message);
} finally {
  // Codice che viene eseguito sempre, indipendentemente dagli errori
  console.log('Operazione completata');
}
```

## Gestione degli Errori Asincroni

### 1. Callback Pattern

Il pattern tradizionale in Node.js è passare l'errore come primo parametro della callback:

```javascript
const fs = require('fs');

fs.readFile('/percorso/file.txt', (err, data) => {
  if (err) {
    // Gestione dell'errore
    console.error('Errore durante la lettura del file:', err);
    return;
  }
  
  // Elaborazione dei dati
  console.log(data.toString());
});
```

### 2. Promise Pattern

Con le Promise, gli errori vengono gestiti tramite il metodo `.catch()`:

```javascript
const fs = require('fs').promises;

fs.readFile('/percorso/file.txt')
  .then(data => {
    // Elaborazione dei dati
    console.log(data.toString());
  })
  .catch(err => {
    // Gestione dell'errore
    console.error('Errore durante la lettura del file:', err);
  })
  .finally(() => {
    // Codice che viene eseguito sempre
    console.log('Operazione completata');
  });
```

### 3. Async/Await Pattern

Con async/await, si torna a utilizzare try-catch anche per il codice asincrono:

```javascript
const fs = require('fs').promises;

async function leggiFile() {
  try {
    const data = await fs.readFile('/percorso/file.txt');
    // Elaborazione dei dati
    console.log(data.toString());
  } catch (err) {
    // Gestione dell'errore
    console.error('Errore durante la lettura del file:', err);
  } finally {
    // Codice che viene eseguito sempre
    console.log('Operazione completata');
  }
}

leggiFile();
```

## Gestione degli Errori Non Catturati

### 1. Eccezioni Non Catturate

Node.js fornisce un evento globale `uncaughtException` per catturare eccezioni non gestite:

```javascript
process.on('uncaughtException', (err, origin) => {
  console.error('Eccezione non catturata:');
  console.error(err);
  console.error(`Origine: ${origin}`);
  
  // Esegui operazioni di pulizia
  // NOTA: È consigliabile terminare il processo dopo un'eccezione non catturata
  process.exit(1);
});

// Questo errore verrà catturato dall'evento 'uncaughtException'
setTimeout(() => {
  throw new Error('Boom!');
}, 100);
```

**Nota importante**: L'evento `uncaughtException` dovrebbe essere utilizzato solo per operazioni di pulizia sincrone prima di terminare il processo. Non è consigliabile ripristinare l'applicazione dopo un'eccezione non catturata, poiché potrebbe trovarsi in uno stato inconsistente.

### 2. Promise Rejection Non Gestite

Per le Promise rejection non gestite, Node.js fornisce l'evento `unhandledRejection`:

```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejection non gestita:');
  console.error(reason);
  // Applicazione di debugging
  console.error(promise);
  
  // Termina il processo in ambiente di produzione
  // process.exit(1);
});

// Questa rejection verrà catturata dall'evento 'unhandledRejection'
new Promise((resolve, reject) => {
  reject(new Error('Promise rifiutata'));
});
// Nota: manca il .catch() per gestire la rejection
```

## Best Practices per la Gestione degli Errori

1. **Sii specifico**: Crea errori personalizzati per diversi tipi di problemi.

2. **Includi informazioni contestuali**: Aggiungi dettagli che aiutino a diagnosticare il problema.

3. **Centralizza la gestione degli errori**: Implementa un sistema centralizzato per la gestione e il logging degli errori.

4. **Fail fast**: Rileva e gestisci gli errori il prima possibile.

5. **Non ignorare gli errori**: Evita blocchi catch vuoti o che sopprimono gli errori senza gestirli.

6. **Usa try-catch solo quando necessario**: Non avvolgere grandi blocchi di codice in un singolo try-catch.

7. **Gestisci sempre le Promise rejection**: Ogni Promise dovrebbe avere un gestore .catch() o essere await in un blocco try-catch.

8. **Termina il processo in caso di errori critici**: Se l'applicazione è in uno stato inconsistente, è meglio terminarla e riavviarla.

9. **Usa un sistema di logging**: Registra gli errori con dettagli sufficienti per il debugging.

10. **Considera l'ambiente**: La gestione degli errori può variare tra sviluppo e produzione.

## Conclusione

Una gestione efficace degli errori è fondamentale per creare applicazioni Node.js robuste e affidabili. Implementando le tecniche e le best practice descritte in questa guida, potrai migliorare significativamente la qualità e la manutenibilità del tuo codice, rendendo più facile identificare e risolvere i problemi quando si verificano.

Nella prossima sezione, esploreremo come implementare middleware personalizzati per la gestione degli errori in applicazioni Express.js.