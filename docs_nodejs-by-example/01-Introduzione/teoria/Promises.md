# Promises in Node.js

## 📚 Obiettivi di Apprendimento

Al termine di questa guida saprai:
- Cos'è una Promise e come funziona
- Stati e ciclo di vita di una Promise
- Creare e consumare Promise
- Gestire errori con .catch() e try/catch
- Concatenare Promise (chaining)
- Promise.all(), Promise.race(), Promise.allSettled()
- Convertire callback in Promise (promisify)
- Best practices e antipattern comuni
- Async/await come evoluzione delle Promise

---

## 🎯 Cos'è una Promise?

Una **Promise** è un oggetto che rappresenta il **completamento futuro** (o il fallimento) di un'operazione asincrona e il suo valore risultante.

### 📖 Analogia del Mondo Reale

```
🍕 ORDINARE UNA PIZZA

Senza Promise (Callback Hell):
┌─────────────────────────────────────┐
│ 1. Chiami pizzeria                  │
│    "Quando è pronta, chiamami"      │
│    ↓                                │
│ 2. Aspetti chiamata                 │
│    ↓                                │
│ 3. Ti chiamano (callback)           │
│    "Pizza pronta!"                  │
│    ↓                                │
│ 4. Devi gestire tu il ritiro        │
└─────────────────────────────────────┘

Con Promise:
┌─────────────────────────────────────┐
│ 1. Ordini pizza                     │
│    Ricevi RICEVUTA (Promise)        │ ← Oggetto che rappresenta
│    ↓                                │   il futuro ordine
│ 2. Continui altre attività          │
│    ↓                                │
│ 3. Promise diventa "fulfilled"      │
│    .then(() => ritira pizza)        │
│    oppure "rejected"                │
│    .catch(() => gestisci errore)    │
└─────────────────────────────────────┘
```

### 🔄 Promise vs Callback

```javascript
// ❌ VECCHIO STILE: Callback
fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data);
});

// ✅ MODERNO: Promise
fs.promises.readFile('file.txt', 'utf8')
    .then(data => console.log(data))
    .catch(err => console.error(err));

// ✅✅ ANCORA MEGLIO: async/await
try {
    const data = await fs.promises.readFile('file.txt', 'utf8');
    console.log(data);
} catch (err) {
    console.error(err);
}
```

---

## 📊 Stati di una Promise

Una Promise può trovarsi in **3 stati**:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  PENDING (In attesa)                            │
│     ↓                                           │
│  Operazione asincrona in corso...               │
│     ↓                                           │
│  ┌─────────────────────┐  ┌──────────────────┐  │
│  │  ✅ FULFILLED       │ │  ❌ REJECTED     │  │
│  │  (Completata)       │  │  (Fallita)       │  │
│  │  con un VALORE      │  │  con un ERRORE   │  │
│  └─────────────────────┘  └──────────────────┘  │
│           │                         │           │
│           ↓                         ↓           │
│      .then()                    .catch()        │
│                                                 │
└─────────────────────────────────────────────────┘

Stati:
1. PENDING   → In attesa (iniziale)
2. FULFILLED → Completata con successo
3. REJECTED  → Fallita con errore

Una Promise SETTLED = fulfilled OR rejected
(Una volta settled, lo stato non cambia mai più!)
```

### 💻 Esempio Stati

```javascript
// Promise PENDING
const promise = new Promise((resolve, reject) => {
    // Operazione asincrona...
});

console.log(promise); 
// Promise { <pending> }

// Promise FULFILLED
const fulfilledPromise = Promise.resolve(42);
console.log(fulfilledPromise); 
// Promise { 42 }

// Promise REJECTED
const rejectedPromise = Promise.reject(new Error('Oops!'));
console.log(rejectedPromise); 
// Promise { <rejected> Error: Oops! }
```

---

## 🏗️ Creare una Promise

### Sintassi Base

```javascript
new Promise((resolve, reject) => {
    // Operazione asincrona
    
    if (/* successo */) {
        resolve(valore);  // ✅ Completa con successo
    } else {
        reject(errore);   // ❌ Fallisce con errore
    }
});
```

**Parametri del costruttore:**
- `resolve(value)`: Funzione per completare con successo
- `reject(reason)`: Funzione per segnalare un errore

### 💻 Esempi Creazione

#### 1. Promise Semplice

```javascript
const myPromise = new Promise((resolve, reject) => {
    const success = true;
    
    if (success) {
        resolve('Operation successful!');
    } else {
        reject(new Error('Operation failed!'));
    }
});

myPromise
    .then(result => console.log(result))    // 'Operation successful!'
    .catch(err => console.error(err));
```

#### 2. Promise con Timeout

```javascript
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`Waited ${ms}ms`);
        }, ms);
    });
}

delay(1000)
    .then(message => console.log(message));
// Output (dopo 1 sec): Waited 1000ms
```

#### 3. Promise con Operazione Asincrona

```javascript
function fetchUser(userId) {
    return new Promise((resolve, reject) => {
        // Simula chiamata database
        setTimeout(() => {
            if (userId === 1) {
                resolve({ id: 1, name: 'Mario Rossi' });
            } else {
                reject(new Error('User not found'));
            }
        }, 1000);
    });
}

// Uso
fetchUser(1)
    .then(user => console.log('User:', user))
    .catch(err => console.error('Error:', err.message));
```

#### 4. Wrapping Callback-Based API

```javascript
const fs = require('fs');

function readFilePromise(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Uso
readFilePromise('file.txt')
    .then(content => console.log(content))
    .catch(err => console.error(err));
```

---

## 🔗 Consumare Promise: .then() e .catch()

### .then() - Gestire il Successo

```javascript
promise.then(
    onFulfilled,    // Chiamato se resolve()
    onRejected      // Chiamato se reject() [opzionale]
);
```

#### Esempi .then()

```javascript
// 1. Solo onFulfilled
Promise.resolve(42)
    .then(value => {
        console.log('Value:', value); // Value: 42
    });

// 2. Con entrambi i handler
Promise.resolve(42)
    .then(
        value => console.log('Success:', value),
        error => console.error('Error:', error)
    );

// 3. Ritornare valore per chaining
Promise.resolve(10)
    .then(x => x * 2)      // 20
    .then(x => x + 5)      // 25
    .then(x => console.log(x)); // 25
```

### .catch() - Gestire gli Errori

```javascript
promise.catch(onRejected);

// Equivalente a:
promise.then(null, onRejected);
```

#### Esempi .catch()

```javascript
// 1. Catch errore da reject
Promise.reject(new Error('Failed!'))
    .catch(err => {
        console.error('Caught:', err.message);
    });

// 2. Catch errore da eccezione
Promise.resolve()
    .then(() => {
        throw new Error('Something went wrong');
    })
    .catch(err => {
        console.error('Caught:', err.message);
    });

// 3. Multiple catch per error handling specifico
fetchUser(999)
    .catch(err => {
        console.error('Network error:', err);
        return { id: 0, name: 'Guest' }; // Fallback
    })
    .then(user => {
        console.log('User:', user);
    });
```

### .finally() - Sempre Eseguito

```javascript
promise.finally(() => {
    // Eseguito sempre, sia success che error
    // NON riceve argomenti
});
```

#### Esempi .finally()

```javascript
let loading = true;

fetchData()
    .then(data => {
        console.log('Data:', data);
    })
    .catch(err => {
        console.error('Error:', err);
    })
    .finally(() => {
        loading = false; // Cleanup sempre eseguito
        console.log('Request completed');
    });
```

---

## ⛓️ Promise Chaining (Concatenazione)

Il **vero potere** delle Promise: evitare callback hell con concatenazione elegante.

### 🔄 Come Funziona

```javascript
promise
    .then(result => {
        // Processo result
        return nuovoValore; // Ritorna valore O Promise
    })
    .then(nuovoValore => {
        // Usa nuovoValore
        return altraPromise; // Può ritornare Promise
    })
    .then(risultatoAltraPromise => {
        // Usa risultato
    })
    .catch(err => {
        // Cattura QUALSIASI errore nella catena
    });
```

### 💻 Esempi Chaining

#### 1. Chain Semplice

```javascript
Promise.resolve(5)
    .then(x => {
        console.log('Step 1:', x); // 5
        return x * 2;
    })
    .then(x => {
        console.log('Step 2:', x); // 10
        return x + 3;
    })
    .then(x => {
        console.log('Step 3:', x); // 13
    });
```

#### 2. Chain con Promise Annidate

```javascript
function getUser(id) {
    return Promise.resolve({ id, name: 'Mario' });
}

function getPosts(userId) {
    return Promise.resolve([
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
    ]);
}

function getComments(postId) {
    return Promise.resolve([
        { id: 1, text: 'Great!' },
        { id: 2, text: 'Nice!' }
    ]);
}

// ✅ Promise chaining
getUser(1)
    .then(user => {
        console.log('User:', user.name);
        return getPosts(user.id);
    })
    .then(posts => {
        console.log('Posts:', posts.length);
        return getComments(posts[0].id);
    })
    .then(comments => {
        console.log('Comments:', comments.length);
    })
    .catch(err => {
        console.error('Error:', err);
    });

// Output:
// User: Mario
// Posts: 2
// Comments: 2
```

#### 3. Evitare Callback Hell

```javascript
// ❌ CALLBACK HELL
fs.readFile('file1.txt', (err1, data1) => {
    if (err1) return console.error(err1);
    
    fs.readFile('file2.txt', (err2, data2) => {
        if (err2) return console.error(err2);
        
        fs.readFile('file3.txt', (err3, data3) => {
            if (err3) return console.error(err3);
            
            console.log(data1, data2, data3);
        });
    });
});

// ✅ PROMISE CHAINING
const fs = require('fs').promises;

fs.readFile('file1.txt', 'utf8')
    .then(data1 => {
        console.log('File 1:', data1);
        return fs.readFile('file2.txt', 'utf8');
    })
    .then(data2 => {
        console.log('File 2:', data2);
        return fs.readFile('file3.txt', 'utf8');
    })
    .then(data3 => {
        console.log('File 3:', data3);
    })
    .catch(err => {
        console.error('Error:', err);
    });

// ✅✅ ASYNC/AWAIT (ancora meglio!)
async function readFiles() {
    try {
        const data1 = await fs.readFile('file1.txt', 'utf8');
        const data2 = await fs.readFile('file2.txt', 'utf8');
        const data3 = await fs.readFile('file3.txt', 'utf8');
        
        console.log(data1, data2, data3);
    } catch (err) {
        console.error('Error:', err);
    }
}
```

---

## 🎯 Metodi Statici delle Promise

### Promise.resolve()

Crea una Promise già risolta.

```javascript
Promise.resolve(42)
    .then(value => console.log(value)); // 42

// Equivalente a:
new Promise(resolve => resolve(42));

// Unwrap automatico di Promise
Promise.resolve(Promise.resolve(42))
    .then(value => console.log(value)); // 42 (non Promise!)
```

### Promise.reject()

Crea una Promise già rigettata.

```javascript
Promise.reject(new Error('Failed!'))
    .catch(err => console.error(err.message)); // Failed!

// Equivalente a:
new Promise((resolve, reject) => reject(new Error('Failed!')));
```

### Promise.all()

Attende che **TUTTE** le Promise siano risolte (o una rigettata).

```javascript
Promise.all([promise1, promise2, promise3])
    .then(([result1, result2, result3]) => {
        // TUTTI i risultati disponibili
    })
    .catch(err => {
        // PRIMA Promise rigettata
    });
```

#### 💻 Esempi Promise.all()

```javascript
// 1. Richieste parallele
const user = fetch('/api/user/1');
const posts = fetch('/api/posts');
const comments = fetch('/api/comments');

Promise.all([user, posts, comments])
    .then(([userData, postsData, commentsData]) => {
        console.log('All data loaded!');
        console.log('User:', userData);
        console.log('Posts:', postsData);
        console.log('Comments:', commentsData);
    })
    .catch(err => {
        console.error('One request failed:', err);
    });

// 2. Multiple delays
const delay = (ms, value) => new Promise(resolve => 
    setTimeout(() => resolve(value), ms)
);

Promise.all([
    delay(1000, 'First'),
    delay(2000, 'Second'),
    delay(1500, 'Third')
])
    .then(results => {
        console.log(results); // ['First', 'Second', 'Third']
        // Tempo totale: ~2000ms (non 4500ms!)
    });

// 3. Fallisce se una fallisce
Promise.all([
    Promise.resolve(1),
    Promise.reject(new Error('Failed!')),
    Promise.resolve(3)
])
    .then(results => {
        console.log('Success:', results); // NON eseguito
    })
    .catch(err => {
        console.error('Error:', err.message); // 'Failed!'
    });
```

### Promise.race()

Completa quando la **PRIMA** Promise si completa (fulfilled o rejected).

```javascript
Promise.race([promise1, promise2, promise3])
    .then(result => {
        // Risultato della PRIMA completata
    })
    .catch(err => {
        // Errore della PRIMA fallita
    });
```

#### 💻 Esempi Promise.race()

```javascript
// 1. Timeout per richiesta
function withTimeout(promise, timeoutMs) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Timeout after ${timeoutMs}ms`));
        }, timeoutMs);
    });
    
    return Promise.race([promise, timeout]);
}

// Uso
const slowRequest = delay(5000, 'Data');

withTimeout(slowRequest, 2000)
    .then(data => console.log('Success:', data))
    .catch(err => console.error('Error:', err.message));
// Output: Error: Timeout after 2000ms

// 2. Prima risposta vince
const server1 = fetch('https://api1.example.com/data');
const server2 = fetch('https://api2.example.com/data');
const server3 = fetch('https://api3.example.com/data');

Promise.race([server1, server2, server3])
    .then(response => {
        console.log('Fastest server responded!');
        return response.json();
    })
    .then(data => console.log('Data:', data));
```

### Promise.allSettled()

Attende che **TUTTE** le Promise si completino (fulfilled o rejected).

```javascript
Promise.allSettled([promise1, promise2, promise3])
    .then(results => {
        // Array di oggetti { status, value/reason }
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                console.log('Value:', result.value);
            } else {
                console.error('Reason:', result.reason);
            }
        });
    });
```

#### 💻 Esempi Promise.allSettled()

```javascript
// 1. Gestire risultati misti
const promises = [
    Promise.resolve(42),
    Promise.reject(new Error('Failed')),
    Promise.resolve('Success'),
    Promise.reject(new Error('Another error'))
];

Promise.allSettled(promises)
    .then(results => {
        console.log('All promises settled:');
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`[${index}] ✅ Success:`, result.value);
            } else {
                console.log(`[${index}] ❌ Error:`, result.reason.message);
            }
        });
    });

// Output:
// All promises settled:
// [0] ✅ Success: 42
// [1] ❌ Error: Failed
// [2] ✅ Success: Success
// [3] ❌ Error: Another error

// 2. Batch operations con report
async function batchProcess(items) {
    const results = await Promise.allSettled(
        items.map(item => processItem(item))
    );
    
    const succeeded = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');
    
    console.log(`Processed: ${succeeded.length} success, ${failed.length} failed`);
    
    return {
        succeeded: succeeded.map(r => r.value),
        failed: failed.map(r => r.reason)
    };
}
```

### Promise.any()

Completa quando la **PRIMA** Promise è fulfilled (ignora rejected).

```javascript
Promise.any([promise1, promise2, promise3])
    .then(result => {
        // Risultato della PRIMA fulfilled
    })
    .catch(err => {
        // AggregateError: TUTTE rejected
    });
```

#### 💻 Esempi Promise.any()

```javascript
// 1. Prima risposta valida
const server1 = fetch('https://slow-server.com/data');  // Lento
const server2 = fetch('https://fast-server.com/data');  // Veloce
const server3 = fetch('https://error-server.com/data'); // Errore

Promise.any([server1, server2, server3])
    .then(response => {
        console.log('First successful response!');
        return response.json();
    })
    .catch(err => {
        console.error('All requests failed:', err);
    });

// 2. Fallback tra servizi
const primaryAPI = fetch('https://primary.api.com/data');
const backupAPI1 = fetch('https://backup1.api.com/data');
const backupAPI2 = fetch('https://backup2.api.com/data');

Promise.any([primaryAPI, backupAPI1, backupAPI2])
    .then(response => response.json())
    .then(data => console.log('Data from fastest available server:', data))
    .catch(err => {
        console.error('All servers are down!', err);
    });
```

### 📊 Tabella Comparativa Metodi

| Metodo | Completa quando | Risultato | Error |
|--------|----------------|-----------|-------|
| **Promise.all()** | Tutte fulfilled | Array di valori | Prima rejected |
| **Promise.race()** | Prima settled | Valore della prima | Errore della prima |
| **Promise.allSettled()** | Tutte settled | Array di {status, value/reason} | Mai (sempre fulfilled) |
| **Promise.any()** | Prima fulfilled | Valore della prima fulfilled | Tutte rejected (AggregateError) |

---

## 🔄 Convertire Callback in Promise (Promisify)

### util.promisify() (Node.js)

```javascript
const util = require('util');
const fs = require('fs');

// Converti readFile in Promise
const readFileAsync = util.promisify(fs.readFile);

// Uso
readFileAsync('file.txt', 'utf8')
    .then(data => console.log(data))
    .catch(err => console.error(err));

// Multiple promisify
const writeFileAsync = util.promisify(fs.writeFile);
const unlinkAsync = util.promisify(fs.unlink);
const readdirAsync = util.promisify(fs.readdir);
```

### Promisify Manuale

```javascript
function promisify(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    };
}

// Uso
const fs = require('fs');
const readFileAsync = promisify(fs.readFile);

readFileAsync('file.txt', 'utf8')
    .then(data => console.log(data))
    .catch(err => console.error(err));
```

### Promisify Class Methods

```javascript
class Database {
    connect(callback) {
        setTimeout(() => {
            callback(null, 'Connected!');
        }, 1000);
    }
    
    query(sql, callback) {
        setTimeout(() => {
            callback(null, [{ id: 1, name: 'Mario' }]);
        }, 500);
    }
}

// Promisify
const util = require('util');
const db = new Database();

db.connectAsync = util.promisify(db.connect);
db.queryAsync = util.promisify(db.query);

// Uso
async function example() {
    const connection = await db.connectAsync();
    console.log(connection);
    
    const results = await db.queryAsync('SELECT * FROM users');
    console.log(results);
}

example();
```

---

## ⚠️ Errori Comuni e Antipattern

### ❌ 1. Dimenticare return nel .then()

```javascript
// ❌ SBAGLIATO: Promise non propagata
doSomething()
    .then(result => {
        doSomethingElse(result); // Manca return!
    })
    .then(newResult => {
        console.log(newResult); // undefined!
    });

// ✅ CORRETTO: Return della Promise
doSomething()
    .then(result => {
        return doSomethingElse(result); // ✓
    })
    .then(newResult => {
        console.log(newResult); // Valore corretto
    });
```

### ❌ 2. Nesting invece di Chaining

```javascript
// ❌ SBAGLIATO: Nesting (Promise hell)
firstPromise()
    .then(result1 => {
        secondPromise(result1)
            .then(result2 => {
                thirdPromise(result2)
                    .then(result3 => {
                        console.log(result3);
                    });
            });
    });

// ✅ CORRETTO: Chaining
firstPromise()
    .then(result1 => secondPromise(result1))
    .then(result2 => thirdPromise(result2))
    .then(result3 => console.log(result3))
    .catch(err => console.error(err));
```

### ❌ 3. Non Gestire Errori

```javascript
// ❌ PERICOLOSO: Unhandled rejection
fetchData()
    .then(data => {
        console.log(data);
    });
// Se fetchData() fallisce, errore non gestito!

// ✅ CORRETTO: Sempre catch
fetchData()
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.error('Error:', err);
    });

// ✅✅ ANCORA MEGLIO: Global handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

### ❌ 4. Creare Promise non Necessarie

```javascript
// ❌ SBAGLIATO: Promise wrapping inutile
function getData() {
    return new Promise((resolve, reject) => {
        fetchData()
            .then(data => resolve(data))
            .catch(err => reject(err));
    });
}

// ✅ CORRETTO: Return diretto
function getData() {
    return fetchData(); // fetchData già ritorna Promise!
}
```

### ❌ 5. Uso Scorretto di Promise.all()

```javascript
// ❌ SBAGLIATO: Operazioni sequenziali in .all()
const results = [];

Promise.all([
    fetchData(1),
    fetchData(2),
    fetchData(3)
])
    .then(data => {
        // Se i dati dipendono l'uno dall'altro, NON usare .all()!
    });

// ✅ CORRETTO: Se dipendenze sequenziali
async function fetchSequential() {
    const data1 = await fetchData(1);
    const data2 = await fetchData(data1.nextId);
    const data3 = await fetchData(data2.nextId);
    
    return [data1, data2, data3];
}

// ✅ CORRETTO: Se indipendenti, usa .all()
async function fetchParallel() {
    const [data1, data2, data3] = await Promise.all([
        fetchData(1),
        fetchData(2),
        fetchData(3)
    ]);
    
    return [data1, data2, data3];
}
```

### ❌ 6. Mixing Callbacks e Promise

```javascript
// ❌ CONFUSO: Mix callback e Promise
function fetchUser(id, callback) {
    return fetch(`/api/users/${id}`)
        .then(response => response.json())
        .then(data => {
            callback(null, data); // Callback
            return data;          // Promise
        })
        .catch(err => {
            callback(err);        // Callback
            throw err;            // Promise
        });
}

// ✅ SCEGLI UNO: Solo Promise
function fetchUser(id) {
    return fetch(`/api/users/${id}`)
        .then(response => response.json());
}

// ✅ O Solo Callback
function fetchUser(id, callback) {
    fetch(`/api/users/${id}`)
        .then(response => response.json())
        .then(data => callback(null, data))
        .catch(err => callback(err));
}
```

---

## 🎯 Best Practices

### ✅ 1. Sempre Gestire Errori

```javascript
// ✅ Catch alla fine della catena
promise
    .then(step1)
    .then(step2)
    .then(step3)
    .catch(handleError);

// ✅ Try/catch con async/await
async function example() {
    try {
        const result = await promise;
        return result;
    } catch (err) {
        console.error(err);
        throw err; // Re-throw se necessario
    }
}
```

### ✅ 2. Return nelle .then()

```javascript
// ✅ Return per propagare valore/Promise
fetchData()
    .then(data => {
        return processData(data); // ✓
    })
    .then(processed => {
        return saveData(processed); // ✓
    });

// Oppure con arrow function concisa
fetchData()
    .then(data => processData(data))
    .then(processed => saveData(processed));
```

### ✅ 3. Usare Promise.all() per Parallelismo

```javascript
// ✅ Richieste indipendenti in parallelo
async function loadDashboard() {
    const [user, posts, stats] = await Promise.all([
        fetchUser(),
        fetchPosts(),
        fetchStats()
    ]);
    
    return { user, posts, stats };
}

// Tempo: max(fetch1, fetch2, fetch3)
// Invece di: fetch1 + fetch2 + fetch3
```

### ✅ 4. Limitare Concorrenza

```javascript
// ✅ Batch processing con concorrenza limitata
async function processBatch(items, concurrency = 3) {
    const results = [];
    
    for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchResults = await Promise.all(
            batch.map(item => processItem(item))
        );
        results.push(...batchResults);
    }
    
    return results;
}

// Processa 3 alla volta invece di tutte insieme
processBatch(largeArray, 3);
```

### ✅ 5. Timeout per Promise

```javascript
// ✅ Pattern timeout robusto
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Operation timed out after ${ms}ms`));
        }, ms);
    });
    
    return Promise.race([promise, timeout]);
}

// Uso
withTimeout(fetchData(), 5000)
    .then(data => console.log('Success:', data))
    .catch(err => console.error('Error:', err));
```

### ✅ 6. Retry Logic

```javascript
// ✅ Retry automatico con exponential backoff
async function retry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === maxRetries - 1) throw err;
            
            const waitTime = delay * Math.pow(2, i);
            console.log(`Retry ${i + 1} after ${waitTime}ms`);
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
}

// Uso
retry(() => fetchData(), 3, 1000)
    .then(data => console.log('Success:', data))
    .catch(err => console.error('All retries failed:', err));
```

---

## 🚀 Da Promise ad Async/Await

### Confronto Promise vs Async/Await

```javascript
// ❌ VERBOSO: Promise chaining
function getFullData() {
    return getUser(1)
        .then(user => {
            return getPosts(user.id);
        })
        .then(posts => {
            return getComments(posts[0].id);
        })
        .then(comments => {
            return { user, posts, comments }; // ⚠️ user/posts non in scope!
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
}

// ✅ PULITO: Async/await
async function getFullData() {
    try {
        const user = await getUser(1);
        const posts = await getPosts(user.id);
        const comments = await getComments(posts[0].id);
        
        return { user, posts, comments }; // Tutte le variabili in scope!
    } catch (err) {
        console.error(err);
        throw err;
    }
}
```

### Pattern Parallelo

```javascript
// ❌ LENTO: Sequenziale
async function loadDataSequential() {
    const user = await fetchUser();     // Aspetta
    const posts = await fetchPosts();   // Aspetta
    const stats = await fetchStats();   // Aspetta
    
    return { user, posts, stats };
}
// Tempo: t1 + t2 + t3

// ✅ VELOCE: Parallelo
async function loadDataParallel() {
    const [user, posts, stats] = await Promise.all([
        fetchUser(),
        fetchPosts(),
        fetchStats()
    ]);
    
    return { user, posts, stats };
}
// Tempo: max(t1, t2, t3)
```

### Error Handling

```javascript
// Promise
fetchData()
    .then(data => processData(data))
    .catch(err => handleError(err))
    .finally(() => cleanup());

// Async/await equivalente
async function example() {
    try {
        const data = await fetchData();
        await processData(data);
    } catch (err) {
        handleError(err);
    } finally {
        cleanup();
    }
}
```

---

## 🧪 Quiz di Autovalutazione

### Domanda 1: Stati Promise

```javascript
const p = new Promise((resolve, reject) => {
    console.log('Executor');
});

console.log(p);

// Quale stato ha la Promise?
```

<details>
<summary>Mostra risposta</summary>

```
Promise { <pending> }
```

**Spiegazione:** L'executor viene eseguito subito, ma senza chiamare `resolve()` o `reject()`, la Promise rimane in stato **PENDING**.

</details>

### Domanda 2: Return in .then()

```javascript
Promise.resolve(10)
    .then(x => {
        x * 2; // Manca return!
    })
    .then(result => {
        console.log(result);
    });

// Cosa viene stampato?
```

<details>
<summary>Mostra risposta</summary>

```
undefined
```

**Problema:** Manca `return` nel primo `.then()`. Senza return, la Promise successiva riceve `undefined`.

**Corretto:**
```javascript
Promise.resolve(10)
    .then(x => x * 2)        // Return implicito con arrow
    .then(result => {
        console.log(result); // 20
    });
```

</details>

### Domanda 3: Promise.all()

```javascript
Promise.all([
    Promise.resolve(1),
    Promise.reject(new Error('Failed')),
    Promise.resolve(3)
])
    .then(results => {
        console.log('Success:', results);
    })
    .catch(err => {
        console.log('Error:', err.message);
    });

// Cosa viene stampato?
```

<details>
<summary>Mostra risposta</summary>

```
Error: Failed
```

**Spiegazione:** `Promise.all()` fallisce se anche solo UNA Promise viene rigettata. Il `.catch()` cattura la prima Promise rigettata.

Se vuoi gestire tutte le Promise (successi e errori), usa `Promise.allSettled()`.

</details>

### Domanda 4: Catch Propagation

```javascript
Promise.reject(new Error('Error 1'))
    .catch(err => {
        console.log('Caught 1:', err.message);
        throw new Error('Error 2');
    })
    .catch(err => {
        console.log('Caught 2:', err.message);
    });

// Cosa viene stampato?
```

<details>
<summary>Mostra risposta</summary>

```
Caught 1: Error 1
Caught 2: Error 2
```

**Spiegazione:** Il primo `.catch()` gestisce il primo errore, ma lancia un nuovo errore che viene catturato dal secondo `.catch()`.

</details>

### Domanda 5: Async Execution

```javascript
console.log('1');

Promise.resolve()
    .then(() => console.log('2'));

console.log('3');

// Ordine output?
```

<details>
<summary>Mostra risposta</summary>

```
1
3
2
```

**Spiegazione:** Le Promise sono asincrone. Anche `Promise.resolve()` pianifica il callback `.then()` nella microtask queue, che viene eseguita DOPO il codice sincrono.

</details>

### Domanda 6: Promise Constructor

```javascript
const p = new Promise((resolve, reject) => {
    resolve('First');
    resolve('Second');
    reject(new Error('Third'));
});

p.then(value => console.log(value))
 .catch(err => console.log(err.message));

// Cosa viene stampato?
```

<details>
<summary>Mostra risposta</summary>

```
First
```

**Spiegazione:** Una Promise può essere risolta/rigettata **UNA SOLA VOLTA**. Le chiamate successive a `resolve()` o `reject()` vengono ignorate.

</details>

---

## 💪 Esercizi Pratici

### Esercizio 1: Implementare delay()

Crea una funzione `delay(ms)` che ritorna una Promise che si risolve dopo `ms` millisecondi.

<details>
<summary>Soluzione</summary>

```javascript
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

// Test
console.log('Start');

delay(1000)
    .then(() => console.log('After 1 second'))
    .then(() => delay(2000))
    .then(() => console.log('After 3 seconds total'));

// Con async/await
async function example() {
    console.log('Start');
    await delay(1000);
    console.log('After 1 second');
    await delay(2000);
    console.log('After 3 seconds total');
}

example();
```

</details>

### Esercizio 2: Fetch con Retry

Implementa una funzione che riprova una richiesta fetch fino a 3 volte.

<details>
<summary>Soluzione</summary>

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries}...`);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            return await response.json();
            
        } catch (err) {
            console.error(`Attempt ${attempt} failed:`, err.message);
            
            if (attempt === maxRetries) {
                throw new Error(`Failed after ${maxRetries} attempts: ${err.message}`);
            }
            
            // Aspetta prima di riprovare (exponential backoff)
            const delay = 1000 * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Test
fetchWithRetry('https://api.example.com/data')
    .then(data => console.log('Success:', data))
    .catch(err => console.error('Final error:', err.message));
```

</details>

### Esercizio 3: Promise Queue

Implementa una coda che esegue Promise una alla volta in sequenza.

<details>
<summary>Soluzione</summary>

```javascript
class PromiseQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    
    add(promiseFactory) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                promiseFactory,
                resolve,
                reject
            });
            
            this.process();
        });
    }
    
    async process() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        
        this.processing = true;
        const { promiseFactory, resolve, reject } = this.queue.shift();
        
        try {
            const result = await promiseFactory();
            resolve(result);
        } catch (err) {
            reject(err);
        } finally {
            this.processing = false;
            this.process(); // Processa prossimo
        }
    }
}

// Test
const queue = new PromiseQueue();

const delay = (ms, value) => () => new Promise(resolve => {
    console.log(`Starting: ${value}`);
    setTimeout(() => {
        console.log(`Completed: ${value}`);
        resolve(value);
    }, ms);
});

queue.add(delay(2000, 'Task 1'));
queue.add(delay(1000, 'Task 2'));
queue.add(delay(1500, 'Task 3'));

console.log('All tasks queued');

// Output:
// All tasks queued
// Starting: Task 1
// Completed: Task 1 (dopo 2s)
// Starting: Task 2
// Completed: Task 2 (dopo 1s)
// Starting: Task 3
// Completed: Task 3 (dopo 1.5s)
```

</details>

### Esercizio 4: Parallel Limit

Implementa una funzione che esegue Promise in parallelo con limite di concorrenza.

<details>
<summary>Soluzione</summary>

```javascript
async function parallelLimit(tasks, limit) {
    const results = [];
    const executing = [];
    
    for (const [index, task] of tasks.entries()) {
        // Crea Promise per questo task
        const p = Promise.resolve()
            .then(() => task())
            .then(result => {
                results[index] = result;
            });
        
        results[index] = p;
        
        // Se limite raggiunto, aspetta che una finisca
        if (limit <= tasks.length) {
            const e = p.then(() => {
                executing.splice(executing.indexOf(e), 1);
            });
            executing.push(e);
            
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }
    
    return Promise.all(results);
}

// Test
const delay = (ms, value) => () => new Promise(resolve => {
    console.log(`[${new Date().toISOString()}] Starting: ${value}`);
    setTimeout(() => {
        console.log(`[${new Date().toISOString()}] Completed: ${value}`);
        resolve(value);
    }, ms);
});

const tasks = [
    delay(2000, 'Task 1'),
    delay(1000, 'Task 2'),
    delay(1500, 'Task 3'),
    delay(1000, 'Task 4'),
    delay(2000, 'Task 5')
];

parallelLimit(tasks, 2) // Max 2 concorrenti
    .then(results => {
        console.log('All results:', results);
    });

// Nota: Solo 2 task eseguiti contemporaneamente!
```

</details>

---

## 📚 Risorse Aggiuntive

### 📖 Documentazione

- [MDN - Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [JavaScript.info - Promises](https://javascript.info/promise-basics)
- [Node.js - Promises](https://nodejs.org/api/esm.html#esm_promises)

### 📝 Articoli

- [Promises/A+ Specification](https://promisesaplus.com/)
- [We Have a Problem With Promises](https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html)
- [JavaScript Promises: An Introduction](https://web.dev/promises/)

### 🎥 Video

- [Async JS Crash Course](https://www.youtube.com/watch?v=PoRJizFvM7s)
- [JavaScript Promises In 10 Minutes](https://www.youtube.com/watch?v=DHvZLI7Db8E)

---

## 🎯 Riepilogo Chiave

### ✅ Concetti Fondamentali

1. **Promise = Futuro Valore**
   - Rappresenta operazione asincrona
   - 3 stati: pending, fulfilled, rejected
   - Una volta settled, immutabile

2. **Metodi Consumo**
   - `.then(onFulfilled, onRejected)`
   - `.catch(onRejected)`
   - `.finally(onFinally)`

3. **Metodi Statici**
   - `Promise.all()` - Tutte devono riuscire
   - `Promise.race()` - Prima che completa
   - `Promise.allSettled()` - Tutte (con status)
   - `Promise.any()` - Prima che riesce

4. **Best Practices**
   - Sempre gestire errori (.catch)
   - Return nelle .then() per chaining
   - Usa async/await quando possibile
   - Promise.all() per parallelismo

### 📊 Promise vs Callback vs Async/Await

| Aspetto | Callback | Promise | Async/Await |
|---------|----------|---------|-------------|
| Leggibilità | ❌ Callback hell | ✅ Chaining | ✅✅ Sincrono-like |
| Error handling | ❌ Ogni callback | ✅ .catch() | ✅✅ try/catch |
| Composizione | ❌ Difficile | ✅ Metodi statici | ✅✅ Naturale |
| Debugging | ❌ Stack traces | ⚠️ Migliore | ✅✅ Facile |
| Modernità | ❌ Legacy | ✅ ES6 (2015) | ✅✅ ES2017 |

### 🚀 Pattern Comuni

```javascript
// 1. Delay
const delay = ms => new Promise(r => setTimeout(r, ms));

// 2. Timeout
const timeout = (p, ms) => Promise.race([
    p, 
    new Promise((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms))
]);

// 3. Retry
async function retry(fn, n = 3) {
    for (let i = 0; i < n; i++) {
        try { return await fn(); }
        catch (e) { if (i === n - 1) throw e; }
    }
}

// 4. Parallel limit
async function pLimit(tasks, limit) {
    const results = [];
    for (let i = 0; i < tasks.length; i += limit) {
        const batch = tasks.slice(i, i + limit);
        results.push(...await Promise.all(batch.map(t => t())));
    }
    return results;
}
```

---

**🎓 Congratulazioni!** Ora padroneggi le Promise in JavaScript!

**💡 Prossimo passo:** Approfondisci **async/await** per un codice ancora più pulito e leggibile! 🚀
