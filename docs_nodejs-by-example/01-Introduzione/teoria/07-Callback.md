# Callbacks in Node.js

## 📚 Obiettivi di Apprendimento

Al termine di questa guida saprai:
- Cos'è una callback e perché è fondamentale in Node.js
- Come gestire operazioni asincrone con callback
- Riconoscere e risolvere il "Callback Hell"
- Gestire correttamente gli errori nelle callback
- Quando usare callback vs Promise vs async/await
- Best practices per scrivere callback pulite e manutenibili

---

## 🎯 Cos'è un Callback?

Un **callback** è una funzione passata come argomento a un'altra funzione, che verrà eseguita in un momento successivo, tipicamente al completamento di un'operazione asincrona.

Il termine "callback" deriva dal concetto di "richiamare" (call back) il codice che ha iniziato l'operazione una volta che questa è completata.

```javascript
// Funzione che accetta una callback
function saluta(nome, callback) {
    console.log(`Ciao ${nome}!`);
    callback(); // Esegue la callback
}

// Passiamo una funzione come callback
saluta('Mario', function() {
    console.log('Callback eseguita!');
});

// Output:
// Ciao Mario!
// Callback eseguita!
```

### 📖 Analogia del Mondo Reale

Immagina di ordinare una pizza per telefono:

```
Tu: "Vorrei una pizza margherita"
Pizzeria: "Ok, ci vorrà 30 minuti. Ti richiamo quando è pronta"
Tu: *continui a fare altro*
[dopo 30 minuti]
Pizzeria: *chiama* "La pizza è pronta!"
Tu: *vai a ritirarla*
```

In questo esempio:
- **Ordinare la pizza** = operazione asincrona
- **"Ti richiamo"** = callback
- **Continuare a fare altro** = il tuo programma continua
- **Il richiamo** = esecuzione della callback


## 🔄 Callback Sincrone vs Asincrone

### Callback Sincrone

Eseguite immediatamente, bloccano l'esecuzione fino al completamento:

```javascript
// Array.forEach è una callback sincrona
const numeri = [1, 2, 3, 4, 5];

numeri.forEach(function(numero) {
    console.log(numero);
});

console.log('Fine');

// Output:
// 1
// 2
// 3
// 4
// 5
// Fine

//versione asincrona dell'esempio precedente
numeri.forEach(function(numero) {
    setTimeout(function() {
        console.log(numero);
    }, 1000);
});
console.log('Fine');
// Output:
// Fine
// 1 (dopo 1 secondo)
// 2 (dopo 1 secondo)
// 3 (dopo 1 secondo)
// 4 (dopo 1 secondo)
// 5 (dopo 1 secondo)
```
La funzione setTimeout è asincrona, quindi non blocca l'esecuzione del codice successivo.
Stesso risultato si ottiene utilizzando la funzione setImmediate.

```javascript
// Array.forEach con setImmediate
numeri.forEach(function(numero) {
    setImmediate(function() {
        console.log(numero);
    });
});
console.log('Fine');
// Output:
// Fine
// 1
// 2
// 3
// 4
// 5
```

### Callback Asincrone

Eseguite in un secondo momento, non bloccano l'esecuzione:

```javascript
console.log('Inizio');

setTimeout(function() {
    console.log('Callback asincrona');
}, 1000);

console.log('Fine');

// Output:
// Inizio
// Fine
// Callback asincrona  (dopo 1 secondo)
```

### Anatomia di un Callback asincrono

```javascript
// Funzione che accetta un callback
function operazioneAsincrona(parametro, callback) {
    // 1. Esegue operazione
    setTimeout(() => {
        const risultato = parametro * 2;
        
        // 2. Invoca il callback con il risultato
        callback(risultato);
    }, 1000);
}

// Utilizzo
operazioneAsincrona(5, function(risultato) {
    console.log('Risultato:', risultato); // 10
});

// Output dopo 1 secondo:
// Risultato: 10
```
---

## 📝 Perché Node.js Usa i Callbacks?

Node.js è progettato per operazioni I/O asincrone. I callbacks permettono di:

1. **Non bloccare l'Event Loop**: Mentre un'operazione è in corso, il programma può fare altro
2. **Gestire operazioni asincrone**: Eseguire codice quando un'operazione è completata
3. **Mantenere il codice non bloccante**: Fondamentale per le prestazioni

```javascript
const fs = require('fs');

// ❌ SINCRONO - Blocca l'Event Loop
console.log('1. Inizio');
const data = fs.readFileSync('file.txt', 'utf8');
console.log('2. File letto:', data);
console.log('3. Fine');

// Durante la lettura del file, il programma è BLOCCATO
// Output:
// 1. Inizio
// 2. File letto: [contenuto del file]
// 3. Fine

// ✅ ASINCRONO - Non blocca
console.log('1. Inizio');
fs.readFile('file.txt', 'utf8', function(err, data) {
    console.log('3. File letto:', data);
});
console.log('2. Fine');

// Il programma continua mentre il file viene letto
// Output:
// 1. Inizio
// 2. Fine
// 3. File letto: [contenuto del file]
```

## 📝 La Convenzione Error-First Callback

Node.js segue una convenzione standard per i callbacks: **error-first callback** (anche chiamato "errback pattern").

### Convention Error-First

Node.js usa il pattern **error-first callback**:
- Il primo parametro è sempre l'errore (`err`)
- I parametri successivi sono i dati di successo

```javascript
const fs = require('fs');

// ❌ NO: firma callback sbagliata
fs.readFile('file.txt', function(data, err) {
    // SBAGLIATO!
});

// ✅ SI: error-first callback
fs.readFile('file.txt', 'utf8', function(err, data) {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    console.log('Contenuto:', data);
});
```

```javascript
function operazione(parametri, callback) {
    // callback(err, risultato)
    //          ↑    ↑
    //          |    └─ risultato se successo
    //          └────── errore se fallimento
}
```

### Regole della Convenzione

1. **Primo parametro**: sempre l'errore (null se operazione riuscita)
2. **Parametri successivi**: risultati dell'operazione
3. **Controllo errore**: sempre controllare `err` prima di usare il risultato

```javascript
const fs = require('fs');

fs.readFile('file.txt', 'utf8', function(err, data) {
    // SEMPRE controllare l'errore per primo
    if (err) {
        console.error('Errore lettura file:', err.message);
        return; // Importante: uscire se c'è un errore
    }
    
    // Usa il risultato solo se non ci sono errori
    console.log('Contenuto:', data);
});

// Output se file.txt non esiste:
// Errore lettura file: ENOENT: no such file or directory, open 'file.txt'
```

## 🎨 Esempi Pratici

### Esempio 1: Lettura File

```javascript
const fs = require('fs');

// Funzione helper con callback
function leggiFile(percorso, callback) {
    fs.readFile(percorso, 'utf8', function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
}

// Utilizzo
leggiFile('config.json', function(err, contenuto) {
    if (err) {
        console.error('Errore lettura:', err.message);
        return;
    }
    
    try {
        const config = JSON.parse(contenuto);
        console.log('Configurazione:', config);
    } catch (parseErr) {
        console.error('Errore parsing JSON:', parseErr.message);
    }
});
```

### Esempio 2: Richiesta HTTP

```javascript
const https = require('https');

function fetchData(url, callback) {
    https.get(url, (res) => {
        let data = '';
        
        // Accumula i chunk di dati
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        // Quando finisce, chiama la callback
        res.on('end', () => {
            callback(null, data);
        });
        
    }).on('error', (err) => {
        callback(err, null);
    });
}

// Utilizzo
fetchData('https://api.example.com/users', function(err, data) {
    if (err) {
        console.error('Errore HTTP:', err.message);
        return;
    }
    
    console.log('Dati ricevuti:', data);
});
```

### Esempio 3: Database Query

```javascript
// Simulazione di una query al database
function queryDatabase(sql, params, callback) {
    // Simula operazione asincrona
    setTimeout(() => {
        // Simula risultato
        const risultati = [
            { id: 1, nome: 'Mario' },
            { id: 2, nome: 'Luigi' }
        ];
        
        callback(null, risultati);
    }, 1000);
}

// Utilizzo
queryDatabase('SELECT * FROM users', [], function(err, users) {
    if (err) {
        console.error('Errore query:', err);
        return;
    }
    
    console.log('Utenti trovati:', users.length);
    users.forEach(user => console.log(user.nome));
});
```

---

### Esempio Completo Error-First

```javascript
const fs = require('fs');

function leggiEProcessa(filename, callback) {
    // 1. Lettura file
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
            // Propaga l'errore al chiamante
            callback(err);
            return;
        }
        
        // 2. Processa dati
        try {
            const risultato = data.toUpperCase();
            // Successo: err = null, risultato fornito
            callback(null, risultato);
        } catch (processingErr) {
            // Errore durante processing
            callback(processingErr);
        }
    });
}

// Utilizzo
leggiEProcessa('file.txt', function(err, risultato) {
    if (err) {
        console.error('Errore:', err.message);
        return;
    }
    
    console.log('Risultato:', risultato);
});

// Output se file.txt esiste:
// Risultato: [CONTENUTO DEL FILE]

// Output se file.txt non esiste:
// Errore: ENOENT: no such file or directory, open 'file.txt'
```

## 😱 Callback Hell (Pyramid of Doom)

Quando si concatenano molte operazioni asincrone, il codice può diventare difficile da leggere e mantenere.

### Il Problema

```javascript
const fs = require('fs');

// ❌ CALLBACK HELL
fs.readFile('file1.txt', 'utf8', function(err, data1) {
    if (err) {
        console.error('Errore file1:', err);
        return;
    }
    
    fs.readFile('file2.txt', 'utf8', function(err, data2) {
        if (err) {
            console.error('Errore file2:', err);
            return;
        }
        
        fs.readFile('file3.txt', 'utf8', function(err, data3) {
            if (err) {
                console.error('Errore file3:', err);
                return;
            }
            
            fs.writeFile('output.txt', data1 + data2 + data3, function(err) {
                if (err) {
                    console.error('Errore scrittura:', err);
                    return;
                }
                
                console.log('File scritto con successo!');
            });
        });
    });
});

// Questo è il "Callback Hell" o "Pyramid of Doom"
// Il codice si sposta sempre più a destra ➡️➡️➡️

// Output se tutto va bene:
// File scritto con successo!

// Output se c'è un errore in file2.txt:
// Errore file2: [dettagli errore]
```


```javascript
// ❌ CALLBACK HELL - Codice difficile da leggere e mantenere
const fs = require('fs');

fs.readFile('utente.json', 'utf8', function(err, utenteData) {
    if (err) {
        console.error(err);
        return;
    }
    
    const utente = JSON.parse(utenteData);
    
    fs.readFile(`posts/${utente.id}.json`, 'utf8', function(err, postsData) {
        if (err) {
            console.error(err);
            return;
        }
        
        const posts = JSON.parse(postsData);
        
        fs.readFile(`comments/${posts[0].id}.json`, 'utf8', function(err, commentsData) {
            if (err) {
                console.error(err);
                return;
            }
            
            const comments = JSON.parse(commentsData);
            
            fs.writeFile('report.json', JSON.stringify({
                utente: utente,
                posts: posts,
                comments: comments
            }), function(err) {
                if (err) {
                    console.error(err);
                    return;
                }
                
                console.log('Report creato!');
            });
        });
    });
});
```

### Caratteristiche del Callback Hell

```
fs.readFile(..., function(err, data) {
    fs.readFile(..., function(err, data) {
        fs.readFile(..., function(err, data) {
            fs.readFile(..., function(err, data) {
                fs.readFile(..., function(err, data) {
                    // 💀 Sei intrappolato!
                });
            });
        });
    });
});
```

- 🔺 **Indentazione eccessiva**: Codice a forma di piramide
- 😵 **Difficile da leggere**: Seguire il flusso è complicato
- 🐛 **Difficile da debuggare**: Tracciare errori è complesso
- 🔄 **Codice duplicato**: Gestione errori ripetuta
- 📝 **Difficile da mantenere**: Modifiche richiedono molto lavoro

## 🛠️ Soluzioni al Callback Hell

### Soluzione 1: Named Functions (Funzioni Nominate)

```javascript
const fs = require('fs');

// ✅ Definire funzioni separate
function handleError(err, context) {
    console.error(`Errore ${context}:`, err.message);
}

function scriviOutput(data1, data2, data3) {
    const combined = data1 + data2 + data3;
    fs.writeFile('output.txt', combined, function(err) {
        if (err) return handleError(err, 'scrittura');
        console.log('File scritto con successo!');
    });
}

function leggiFile3(data1, data2) {
    fs.readFile('file3.txt', 'utf8', function(err, data3) {
        if (err) return handleError(err, 'file3');
        scriviOutput(data1, data2, data3);
    });
}

function leggiFile2(data1) {
    fs.readFile('file2.txt', 'utf8', function(err, data2) {
        if (err) return handleError(err, 'file2');
        leggiFile3(data1, data2);
    });
}

function leggiFile1() {
    fs.readFile('file1.txt', 'utf8', function(err, data1) {
        if (err) return handleError(err, 'file1');
        leggiFile2(data1);
    });
}

// Esecuzione
leggiFile1();

// Molto più leggibile! Nessuna indentazione eccessiva
```

```javascript
const fs = require('fs');

// ✅ Separa le funzioni
function gestisciErrore(err) {
    console.error('Errore:', err.message);
}

function leggiPosts(utenteData) {
    const utente = JSON.parse(utenteData);
    fs.readFile(`posts/${utente.id}.json`, 'utf8', leggiCommenti);
}

function leggiCommenti(err, postsData) {
    if (err) return gestisciErrore(err);
    const posts = JSON.parse(postsData);
    fs.readFile(`comments/${posts[0].id}.json`, 'utf8', creaReport);
}

function creaReport(err, commentsData) {
    if (err) return gestisciErrore(err);
    const comments = JSON.parse(commentsData);
    // ... crea report
    console.log('Report creato!');
}

// Inizia la catena
fs.readFile('utente.json', 'utf8', function(err, data) {
    if (err) return gestisciErrore(err);
    leggiPosts(data);
});
```

### Soluzione 2: Modularizzazione

```javascript
// file-utils.js
const fs = require('fs');

function leggiFile(filename, callback) {
    fs.readFile(filename, 'utf8', callback);
}

function scriviFile(filename, data, callback) {
    fs.writeFile(filename, data, callback);
}

function concatenaFile(files, callback) {
    let risultato = '';
    let index = 0;
    
    function leggiSuccessivo() {
        if (index >= files.length) {
            callback(null, risultato);
            return;
        }
        
        leggiFile(files[index], function(err, data) {
            if (err) {
                callback(err);
                return;
            }
            
            risultato += data;
            index++;
            leggiSuccessivo();
        });
    }
    
    leggiSuccessivo();
}

module.exports = { leggiFile, scriviFile, concatenaFile };

// main.js
const { concatenaFile, scriviFile } = require('./file-utils');

concatenaFile(['file1.txt', 'file2.txt', 'file3.txt'], function(err, data) {
    if (err) {
        console.error('Errore concatenazione:', err.message);
        return;
    }
    
    scriviFile('output.txt', data, function(err) {
        if (err) {
            console.error('Errore scrittura:', err.message);
            return;
        }
        
        console.log('File scritto con successo!');
    });
});

// Codice molto più pulito e riutilizzabile!
```

```javascript
// fileUtils.js
const fs = require('fs');

function leggiJSON(percorso, callback) {
    fs.readFile(percorso, 'utf8', (err, data) => {
        if (err) return callback(err);
        
        try {
            const json = JSON.parse(data);
            callback(null, json);
        } catch (parseErr) {
            callback(parseErr);
        }
    });
}

function scriviJSON(percorso, dati, callback) {
    const json = JSON.stringify(dati, null, 2);
    fs.writeFile(percorso, json, callback);
}

module.exports = { leggiJSON, scriviJSON };

// main.js
const { leggiJSON, scriviJSON } = require('./fileUtils');

leggiJSON('utente.json', (err, utente) => {
    if (err) return console.error(err);
    
    leggiJSON(`posts/${utente.id}.json`, (err, posts) => {
        if (err) return console.error(err);
        
        const report = { utente, posts };
        scriviJSON('report.json', report, (err) => {
            if (err) return console.error(err);
            console.log('Report creato!');
        });
    });
});
```


### Soluzione 3: Librerie di Controllo del Flusso

```javascript
// Usando async.js (npm install async)
const async = require('async');
const fs = require('fs');

// ✅ Con async.series
async.series([
    function(callback) {
        fs.readFile('file1.txt', 'utf8', callback);
    },
    function(callback) {
        fs.readFile('file2.txt', 'utf8', callback);
    },
    function(callback) {
        fs.readFile('file3.txt', 'utf8', callback);
    }
], function(err, results) {
    if (err) {
        console.error('Errore:', err.message);
        return;
    }
    
    const [data1, data2, data3] = results;
    const combined = data1 + data2 + data3;
    
    fs.writeFile('output.txt', combined, function(err) {
        if (err) {
            console.error('Errore scrittura:', err.message);
            return;
        }
        console.log('File scritto con successo!');
    });
});
```

```javascript
// Usando async.js
const async = require('async');
const fs = require('fs').promises; // Usa promises

async.waterfall([
    // Step 1: Leggi utente
    function(callback) {
        fs.readFile('utente.json', 'utf8')
            .then(data => callback(null, JSON.parse(data)))
            .catch(callback);
    },
    
    // Step 2: Leggi posts
    function(utente, callback) {
        fs.readFile(`posts/${utente.id}.json`, 'utf8')
            .then(data => callback(null, utente, JSON.parse(data)))
            .catch(callback);
    },
    
    // Step 3: Crea report
    function(utente, posts, callback) {
        const report = { utente, posts };
        fs.writeFile('report.json', JSON.stringify(report))
            .then(() => callback(null, 'Report creato!'))
            .catch(callback);
    }
], function(err, risultato) {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    console.log(risultato);
});
```

### Soluzione 4: Promises (Migliore)

```javascript
const fs = require('fs').promises;

// ✅ Codice molto più leggibile
fs.readFile('utente.json', 'utf8')
    .then(data => JSON.parse(data))
    .then(utente => {
        return Promise.all([
            utente,
            fs.readFile(`posts/${utente.id}.json`, 'utf8')
        ]);
    })
    .then(([utente, postsData]) => {
        const posts = JSON.parse(postsData);
        const report = { utente, posts };
        return fs.writeFile('report.json', JSON.stringify(report));
    })
    .then(() => {
        console.log('Report creato!');
    })
    .catch(err => {
        console.error('Errore:', err);
    });
```

### Soluzione 5: Async/Await (Migliore in Assoluto)

```javascript
const fs = require('fs').promises;

// ✅✅ Codice pulito e sincrono-like
async function creaReport() {
    try {
        // Leggi utente
        const utenteData = await fs.readFile('utente.json', 'utf8');
        const utente = JSON.parse(utenteData);
        
        // Leggi posts
        const postsData = await fs.readFile(`posts/${utente.id}.json`, 'utf8');
        const posts = JSON.parse(postsData);
        
        // Crea report
        const report = { utente, posts };
        await fs.writeFile('report.json', JSON.stringify(report, null, 2));
        
        console.log('Report creato!');
    } catch (err) {
        console.error('Errore:', err.message);
    }
}

creaReport();
```

---

## 🔢 Pattern Comuni con Callbacks

### Pattern 1: Callback con Parametri Multipli

```javascript
function operazioneComplessa(input, callback) {
    setTimeout(() => {
        const risultato = input * 2;
        const metadata = {
            timestamp: Date.now(),
            operazione: 'moltiplicazione'
        };
        
        // Callback con risultati multipli
        callback(null, risultato, metadata);
    }, 1000);
}

operazioneComplessa(5, function(err, risultato, metadata) {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    
    console.log('Risultato:', risultato);
    console.log('Metadata:', metadata);
});
```

### Pattern 2: Callback Once (Esegui Una Sola Volta)

```javascript
function operazioneRischiosa(callback) {
    // Problema: callback potrebbe essere chiamato più volte
    let callbackInvocato = false;
    
    // Wrapper per garantire una sola esecuzione
    function callbackOnce(err, result) {
        if (callbackInvocato) {
            console.warn('⚠️ Tentativo di invocare callback più volte!');
            return;
        }
        
        callbackInvocato = true;
        callback(err, result);
    }
    
    // Simula operazione con possibili chiamate multiple
    setTimeout(() => callbackOnce(null, 'successo'), 1000);
    setTimeout(() => callbackOnce(null, 'altro'), 1500); // Ignorato
}

operazioneRischiosa(function(err, result) {
    console.log('Callback eseguito:', result);
});

// Output:
// Callback eseguito: successo
// ⚠️ Tentativo di invocare callback più volte!
```

### Pattern 3: Parallel Execution (Esecuzione Parallela)

```javascript
function executeParallel(tasks, callback) {
    const results = [];
    let completed = 0;
    let hasError = false;
    
    if (tasks.length === 0) {
        callback(null, results);
        return;
    }
    
    tasks.forEach((task, index) => {
        task(function(err, result) {
            if (hasError) return; // Ignora se già c'è un errore
            
            if (err) {
                hasError = true;
                callback(err);
                return;
            }
            
            results[index] = result;
            completed++;
            
            if (completed === tasks.length) {
                callback(null, results);
            }
        });
    });
}

// Uso
const fs = require('fs');

const tasks = [
    (cb) => fs.readFile('file1.txt', 'utf8', cb),
    (cb) => fs.readFile('file2.txt', 'utf8', cb),
    (cb) => fs.readFile('file3.txt', 'utf8', cb)
];

executeParallel(tasks, function(err, results) {
    if (err) {
        console.error('Errore:', err.message);
        return;
    }
    
    console.log('Tutti i file letti:', results);
});
```

### Pattern 4: Series Execution (Esecuzione Sequenziale)

```javascript
function executeSeries(tasks, callback) {
    const results = [];
    let index = 0;
    
    function next() {
        if (index >= tasks.length) {
            callback(null, results);
            return;
        }
        
        const task = tasks[index];
        task(function(err, result) {
            if (err) {
                callback(err);
                return;
            }
            
            results.push(result);
            index++;
            next(); // Esegue il prossimo task
        });
    }
    
    next();
}

// Uso
const tasks = [
    (cb) => setTimeout(() => cb(null, 'Task 1'), 1000),
    (cb) => setTimeout(() => cb(null, 'Task 2'), 500),
    (cb) => setTimeout(() => cb(null, 'Task 3'), 200)
];

executeSeries(tasks, function(err, results) {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    
    console.log('Tasks completati in ordine:', results);
    // Output: ['Task 1', 'Task 2', 'Task 3']
});
```

### Pattern 5: Waterfall (Cascata)

```javascript
function executeWaterfall(tasks, callback) {
    let index = 0;
    
    function next(...args) {
        if (index >= tasks.length) {
            callback(null, ...args);
            return;
        }
        
        const task = tasks[index];
        index++;
        
        // Il primo argomento è sempre l'errore
        task(...args, function(err, ...results) {
            if (err) {
                callback(err);
                return;
            }
            
            next(...results); // Passa risultati al prossimo task
        });
    }
    
    next();
}

// Uso: ogni task passa il risultato al successivo
const tasks = [
    (cb) => {
        console.log('Task 1: leggo file');
        cb(null, 'dati iniziali');
    },
    (data, cb) => {
        console.log('Task 2: processo', data);
        cb(null, data.toUpperCase());
    },
    (data, cb) => {
        console.log('Task 3: aggiungo timestamp');
        cb(null, data + ' - ' + Date.now());
    }
];

executeWaterfall(tasks, function(err, result) {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    
    console.log('Risultato finale:', result);
});

// Output:
// Task 1: leggo file
// Task 2: processo dati iniziali
// Task 3: aggiungo timestamp
// Risultato finale: DATI INIZIALI - 1634567890123
```

##  Conclusioni

I callbacks sono stati il fondamento della programmazione asincrona in Node.js fin dall'inizio. Sebbene oggi abbiamo alternative più moderne come Promises e async/await, comprendere i callbacks è essenziale per:
    - Lavorare con codice legacy
    - Capire il funzionamento interno di Node.js
    - Scrivere codice asincrono efficiente
    - Gestire operazioni I/O in modo non bloccante

### ✅ Vantaggi dei Callbacks

- **Compatibilità**: Funzionano in tutte le versioni di Node.js
- **Performance**: Overhead minimo
- **Controllo**: Controllo fine sul flusso di esecuzione
- **Semplicità**: Concetto semplice da comprendere
- **Legacy code**: Molta documentazione e codice esistente usa callbacks

### ⚠️ Svantaggi dei Callbacks

- **Callback Hell**: Codice profondamente nidificato
- **Gestione errori**: Ripetitiva e error-prone
- **Difficile da debuggare**: Stack trace complessi
- **Composizione limitata**: Difficile comporre operazioni
- **Manutenibilità**: Codice complesso diventa difficile da mantenere

### 🎯 Quando Usare Callbacks

**Usa callbacks quando:**
- Lavori con API legacy che non supportano Promises
- Hai bisogno di massima performance in hotpath critici
- Stai scrivendo librerie di basso livello
- Vuoi evitare dipendenze esterne

**Evita callbacks quando:**
- Hai molte operazioni asincrone in sequenza
- Il progetto può usare ES6+ features
- La leggibilità del codice è prioritaria
- Stai scrivendo nuovo codice (preferisci async/await)

### 🚀 Strada per il Futuro

```javascript
// Evoluzione della programmazione asincrona in Node.js

// 2009: Callbacks
fs.readFile('file.txt', (err, data) => {
    if (err) throw err;
    console.log(data);
});

// 2015: Promises
fs.promises.readFile('file.txt')
    .then(data => console.log(data))
    .catch(err => console.error(err));

// 2017: Async/Await
async function readFile() {
    try {
        const data = await fs.promises.readFile('file.txt');
        console.log(data);
    } catch (err) {
        console.error(err);
    }
}

// Futuro: Top-level await, Pipeline operator, ecc.
```

---

## 📚 Risorse Aggiuntive

### Documentazione Ufficiale
- [Node.js Callback Guide](https://nodejs.org/en/knowledge/getting-started/control-flow/what-are-callbacks/)
- [Error Handling in Node.js](https://nodejs.org/api/errors.html)

### Libri Consigliati
- "Node.js Design Patterns" - Mario Casciaro & Luciano Mammino
- "You Don't Know JS: Async & Performance" - Kyle Simpson

### Librerie Utili
- **async.js**: Control flow con callbacks
- **neo-async**: async.js più veloce
- **caolan/async**: Utility per callbacks

### Tools di Debugging
- **Node Inspector**: Debug con Chrome DevTools
- **longjohn**: Stack traces migliorati per callbacks
- **async-listener**: Tracciare contesto asincrono

---

**Versione documento**: 1.0  
**Ultimo aggiornamento**: Ottobre 2025  
**Compatibilità**: Node.js tutte le versioni  
**Livello**: Intermedio/Avanzato

---






