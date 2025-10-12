# Callback in Node.js - Concetti avanzati

## ⚠️ Errori Comuni con le Callback

### 1. Non Gestire gli Errori

```javascript
// ❌ MALE: Ignora l'errore
fs.readFile('file.txt', 'utf8', function(err, data) {
    console.log(data); // Potrebbe essere undefined!
});

// ✅ BENE: Controlla sempre l'errore
fs.readFile('file.txt', 'utf8', function(err, data) {
    if (err) {
        console.error('Errore:', err.message);
        return;
    }
    console.log(data);
});
```

### 2. Chiamare la Callback Più Volte

```javascript
// ❌ MALE: Callback chiamata 2 volte!
function operazione(callback) {
    fs.readFile('file.txt', 'utf8', function(err, data) {
        if (err) {
            callback(err); // Prima chiamata
        }
        callback(null, data); // Seconda chiamata - ERRORE!
    });
}

// ✅ BENE: Usa return
function operazione(callback) {
    fs.readFile('file.txt', 'utf8', function(err, data) {
        if (err) {
            return callback(err); // Esce dalla funzione
        }
        callback(null, data); // Chiamata solo se non c'è errore
    });
}
```

### 3. Dimenticare di Passare la Callback

```javascript
// ❌ MALE: callback potrebbe essere undefined
function leggiFile(percorso, callback) {
    fs.readFile(percorso, 'utf8', callback); // Crash se callback non passata
}

// ✅ BENE: Controlla che callback esista
function leggiFile(percorso, callback) {
    if (typeof callback !== 'function') {
        throw new Error('callback deve essere una funzione');
    }
    fs.readFile(percorso, 'utf8', callback);
}

// ✅ ANCORA MEGLIO: Callback opzionale
function leggiFile(percorso, callback) {
    const cb = callback || function() {};
    fs.readFile(percorso, 'utf8', cb);
}
```

### 4. Perdere il Contesto `this`

```javascript
const utente = {
    nome: 'Mario',
    saluta: function(callback) {
        setTimeout(function() {
            console.log(`Ciao, sono ${this.nome}`); // this è undefined!
            callback();
        }, 1000);
    }
};

// ❌ MALE: perde il contesto
utente.saluta(() => {}); // Output: "Ciao, sono undefined"

// ✅ SOLUZIONE 1: Arrow function
const utente = {
    nome: 'Mario',
    saluta: function(callback) {
        setTimeout(() => {
            console.log(`Ciao, sono ${this.nome}`); // this preservato
            callback();
        }, 1000);
    }
};

// ✅ SOLUZIONE 2: bind()
const utente = {
    nome: 'Mario',
    saluta: function(callback) {
        setTimeout(function() {
            console.log(`Ciao, sono ${this.nome}`);
            callback();
        }.bind(this), 1000);
    }
};

// ✅ SOLUZIONE 3: salvare this
const utente = {
    nome: 'Mario',
    saluta: function(callback) {
        const self = this;
        setTimeout(function() {
            console.log(`Ciao, sono ${self.nome}`);
            callback();
        }, 1000);
    }
};
```

### 5. Eccezioni Non Catturate in Callback Asincrone

```javascript
// ❌ MALE: try/catch non funziona con callback asincrone
try {
    fs.readFile('file.txt', 'utf8', function(err, data) {
        throw new Error('Errore nella callback'); // Non catturato!
    });
} catch (err) {
    console.error('Non viene mai eseguito');
}

// ✅ BENE: Gestisci errori dentro la callback
fs.readFile('file.txt', 'utf8', function(err, data) {
    try {
        if (err) throw err;
        const json = JSON.parse(data); // Potrebbe lanciare eccezione
        console.log(json);
    } catch (error) {
        console.error('Errore:', error.message);
    }
});
```

---

## 🎯 Best Practices

### 1. ⚡ Mantieni le Callback Brevi

```javascript
// ❌ Callback troppo lunga
fs.readFile('data.txt', 'utf8', function(err, data) {
    if (err) {
        console.error(err);
        return;
    }
    
    // 50 righe di logica...
    const lines = data.split('\n');
    const filtered = lines.filter(line => line.includes('importante'));
    const processed = filtered.map(line => {
        // Elaborazione complessa...
    });
    // ... altro codice ...
});

// ✅ Estrai la logica in funzioni separate
function processaData(data) {
    const lines = data.split('\n');
    const filtered = lines.filter(line => line.includes('importante'));
    return filtered.map(elaboraLinea);
}

function elaboraLinea(line) {
    // Elaborazione complessa...
}

fs.readFile('data.txt', 'utf8', function(err, data) {
    if (err) {
        console.error(err);
        return;
    }
    
    const risultato = processaData(data);
    console.log(risultato);
});
```

### 2. 📝 Usa Nomi Descrittivi

```javascript
// ❌ Nome generico
getData(url, function(err, data) {
    // ...
});

// ✅ Nome descrittivo
fetchUserProfile(userId, function(err, userProfile) {
    // ...
});

fetchOrderHistory(userId, function(err, orderHistory) {
    // ...
});
```

### 3. 🔍 Documenta le Callback

```javascript
/**
 * Carica un utente dal database
 * @param {number} userId - ID dell'utente
 * @param {Function} callback - Callback(err, user)
 * @param {Error|null} callback.err - Errore o null se successo
 * @param {Object} callback.user - Oggetto utente
 * @param {string} callback.user.nome - Nome dell'utente
 * @param {string} callback.user.email - Email dell'utente
 */
function caricaUtente(userId, callback) {
    // ...
}
```

### 4. 🚦 Gestisci SEMPRE gli Errori

```javascript
// ❌ Errore silenzioso
function leggiConfig(callback) {
    fs.readFile('config.json', 'utf8', function(err, data) {
        if (err) {
            callback(null, {}); // Nasconde l'errore!
        } else {
            callback(null, JSON.parse(data));
        }
    });
}

// ✅ Propaga gli errori
function leggiConfig(callback) {
    fs.readFile('config.json', 'utf8', function(err, data) {
        if (err) {
            return callback(err); // Informa il chiamante
        }
        
        try {
            const config = JSON.parse(data);
            callback(null, config);
        } catch (parseErr) {
            callback(parseErr); // Gestisci anche errori di parsing
        }
    });
}
```

### 5. 🔄 Evita Callback Sincrone Ingannevoli

```javascript
// ❌ MALE: Callback a volte sincrona, a volte asincrona
function getData(useCache, callback) {
    if (useCache && cachedData) {
        callback(null, cachedData); // Sincrona
    } else {
        fs.readFile('data.txt', callback); // Asincrona
    }
}

// ✅ BENE: Sempre asincrona
function getData(useCache, callback) {
    if (useCache && cachedData) {
        process.nextTick(() => callback(null, cachedData)); // Ora asincrona
    } else {
        fs.readFile('data.txt', callback);
    }
}
```

### 6. 🎨 Considera Alternative Moderne

```javascript
// Callback tradizionale
function loadUser(id, callback) {
    db.query('SELECT * FROM users WHERE id = ?', [id], callback);
}

loadUser(1, (err, user) => {
    if (err) return console.error(err);
    console.log(user);
});

// ✅ Promisify per usare con async/await
const { promisify } = require('util');
const loadUserPromise = promisify(loadUser);

async function example() {
    try {
        const user = await loadUserPromise(1);
        console.log(user);
    } catch (err) {
        console.error(err);
    }
}
```

---

## 🔄 Convertire Callback in Promise

### Metodo Manuale

```javascript
// Funzione con callback
function leggiFile(percorso, callback) {
    fs.readFile(percorso, 'utf8', callback);
}

// Wrapper che restituisce Promise
function leggiFilePromise(percorso) {
    return new Promise((resolve, reject) => {
        leggiFile(percorso, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Uso con async/await
async function main() {
    try {
        const data = await leggiFilePromise('file.txt');
        console.log(data);
    } catch (err) {
        console.error(err);
    }
}
```

### Usando util.promisify

```javascript
const { promisify } = require('util');
const fs = require('fs');

// Converte automaticamente
const readFilePromise = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);

// Uso
async function copia(source, dest) {
    try {
        const data = await readFilePromise(source);
        await writeFilePromise(dest, data);
        console.log('File copiato!');
    } catch (err) {
        console.error('Errore:', err);
    }
}

copia('input.txt', 'output.txt');
```

### Promisify Custom

```javascript
// Per funzioni con firma non standard
function customPromisify(fn, context) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            fn.call(context, ...args, (err, ...results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.length === 1 ? results[0] : results);
                }
            });
        });
    };
}

// Esempio: funzione con callback non error-first
function fetchData(url, successCallback, errorCallback) {
    // ... implementazione
}

// Wrapper
function fetchDataPromise(url) {
    return new Promise((resolve, reject) => {
        fetchData(url, resolve, reject);
    });
}
```

---

## 📊 Callback vs Promise vs Async/Await

### Confronto con Esempio Reale

```javascript
// 1️⃣ CALLBACK - Stile tradizionale
function getUserDataCallback(userId, callback) {
    db.getUser(userId, (err, user) => {
        if (err) return callback(err);
        
        db.getPosts(user.id, (err, posts) => {
            if (err) return callback(err);
            
            db.getComments(posts[0].id, (err, comments) => {
                if (err) return callback(err);
                
                callback(null, { user, posts, comments });
            });
        });
    });
}

// 2️⃣ PROMISE - Più leggibile
function getUserDataPromise(userId) {
    let userData = {};
    
    return db.getUser(userId)
        .then(user => {
            userData.user = user;
            return db.getPosts(user.id);
        })
        .then(posts => {
            userData.posts = posts;
            return db.getComments(posts[0].id);
        })
        .then(comments => {
            userData.comments = comments;
            return userData;
        });
}

// 3️⃣ ASYNC/AWAIT - Più chiaro e pulito
async function getUserDataAsync(userId) {
    const user = await db.getUser(userId);
    const posts = await db.getPosts(user.id);
    const comments = await db.getComments(posts[0].id);
    
    return { user, posts, comments };
}
```

### Tabella di Confronto

| Caratteristica | Callback | Promise | Async/Await |
|----------------|----------|---------|-------------|
| **Leggibilità** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Gestione Errori** | Manuale | `.catch()` | `try/catch` |
| **Composizione** | Difficile | Buona | Ottima |
| **Debugging** | Difficile | Medio | Facile |
| **Callback Hell** | ❌ Sì | ✅ No | ✅ No |
| **Supporto Node** | ✅ Sempre | ✅ v0.12+ | ✅ v7.6+ |
| **Retrocompatibilità** | ✅ Massima | ⚠️ Buona | ⚠️ Buona |

### Quando Usare Cosa?

```javascript
// ✅ Usa CALLBACK quando:
// - Lavori con codice legacy
// - Librerie che richiedono callback
// - Eventi (event emitters)

emitter.on('data', (data) => {
    console.log(data);
});

// ✅ Usa PROMISE quando:
// - Operazioni asincrone multiple
// - Necessità di Promise.all, Promise.race

Promise.all([
    fetch('/api/users'),
    fetch('/api/posts'),
    fetch('/api/comments')
]).then(([users, posts, comments]) => {
    console.log('Tutti i dati caricati');
});

// ✅ Usa ASYNC/AWAIT quando:
// - Codice nuovo
// - Logica sequenziale complessa
// - Preferisci sintassi sincrona

async function processOrder(orderId) {
    try {
        const order = await getOrder(orderId);
        const payment = await processPayment(order);
        const shipping = await scheduleShipping(order);
        return { order, payment, shipping };
    } catch (err) {
        console.error('Errore:', err);
        throw err;
    }
}
```

---

## 💡 Pattern Avanzati

### 1. Callback con Timeout

```javascript
function callWithTimeout(fn, timeout, callback) {
    let called = false;
    
    const timer = setTimeout(() => {
        if (!called) {
            called = true;
            callback(new Error('Timeout'));
        }
    }, timeout);
    
    fn((err, result) => {
        if (!called) {
            called = true;
            clearTimeout(timer);
            callback(err, result);
        }
    });
}

// Uso
callWithTimeout(
    (cb) => {
        // Operazione lenta
        setTimeout(() => cb(null, 'Risultato'), 5000);
    },
    2000, // Timeout 2 secondi
    (err, result) => {
        if (err) {
            console.error('Timeout!');
        } else {
            console.log(result);
        }
    }
);
```

### 2. Callback con Retry

```javascript
function retry(fn, maxAttempts, callback) {
    let attempts = 0;
    
    function attempt() {
        attempts++;
        
        fn((err, result) => {
            if (err && attempts < maxAttempts) {
                console.log(`Tentativo ${attempts} fallito, riprovo...`);
                setTimeout(attempt, 1000 * attempts); // Backoff esponenziale
            } else {
                callback(err, result, attempts);
            }
        });
    }
    
    attempt();
}

// Uso
retry(
    (cb) => {
        // Operazione che potrebbe fallire
        Math.random() > 0.7 
            ? cb(null, 'Successo!') 
            : cb(new Error('Fallito'));
    },
    3, // Max 3 tentativi
    (err, result, attempts) => {
        if (err) {
            console.error(`Fallito dopo ${attempts} tentativi`);
        } else {
            console.log(`Successo al tentativo ${attempts}: ${result}`);
        }
    }
);
```

### 3. Parallel Execution

```javascript
function parallel(tasks, callback) {
    const results = [];
    let completed = 0;
    let hasError = false;
    
    tasks.forEach((task, index) => {
        task((err, result) => {
            if (hasError) return;
            
            if (err) {
                hasError = true;
                return callback(err);
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
parallel([
    (cb) => setTimeout(() => cb(null, 'Task 1'), 100),
    (cb) => setTimeout(() => cb(null, 'Task 2'), 50),
    (cb) => setTimeout(() => cb(null, 'Task 3'), 150)
], (err, results) => {
    console.log('Tutti completati:', results);
    // Output: ['Task 1', 'Task 2', 'Task 3']
});
```

### 4. Series Execution

```javascript
function series(tasks, callback) {
    const results = [];
    let currentIndex = 0;
    
    function next() {
        if (currentIndex >= tasks.length) {
            return callback(null, results);
        }
        
        const task = tasks[currentIndex];
        currentIndex++;
        
        task((err, result) => {
            if (err) {
                return callback(err);
            }
            
            results.push(result);
            next();
        });
    }
    
    next();
}

// Uso
series([
    (cb) => setTimeout(() => cb(null, 'Step 1'), 100),
    (cb) => setTimeout(() => cb(null, 'Step 2'), 50),
    (cb) => setTimeout(() => cb(null, 'Step 3'), 150)
], (err, results) => {
    console.log('Completati in ordine:', results);
    // Output: ['Step 1', 'Step 2', 'Step 3']
});
```

---

## 🧪 Quiz di Autovalutazione

### Domanda 1: Error-First Pattern
```javascript
function leggiFile(path, callback) {
    fs.readFile(path, 'utf8', callback);
}

leggiFile('test.txt', (data, err) => {
    if (err) console.error(err);
    else console.log(data);
});
```
**Cosa c'è di sbagliato?**

<details>
<summary>Mostra risposta</summary>

❌ I parametri della callback sono nell'ordine sbagliato!

✅ Correzione:
```javascript
leggiFile('test.txt', (err, data) => {
    if (err) console.error(err);
    else console.log(data);
});
```

Node.js usa sempre il pattern **error-first**: primo parametro errore, poi i dati.
</details>

### Domanda 2: Callback Multiple
```javascript
function processa(callback) {
    fs.readFile('file.txt', (err, data) => {
        if (err) {
            callback(err);
        }
        callback(null, data);
    });
}
```
**Qual è il problema?**

<details>
<summary>Mostra risposta</summary>

❌ La callback viene chiamata 2 volte quando c'è un errore!

✅ Correzione:
```javascript
function processa(callback) {
    fs.readFile('file.txt', (err, data) => {
        if (err) {
            return callback(err); // ← RETURN!
        }
        callback(null, data);
    });
}
```

Usa sempre `return` quando chiami la callback per uscire dalla funzione.
</details>

### Domanda 3: Try/Catch Asincrono
```javascript
try {
    setTimeout(() => {
        throw new Error('Errore!');
    }, 1000);
} catch (err) {
    console.error('Catturato:', err);
}
```
**Questo codice cattura l'errore?**

<details>
<summary>Mostra risposta</summary>

❌ No! `try/catch` non funziona con callback asincrone.

L'errore viene lanciato in un contesto diverso (dopo 1 secondo), quando il try/catch è già uscito.

✅ Soluzione: Gestisci errori dentro la callback
```javascript
setTimeout(() => {
    try {
        throw new Error('Errore!');
    } catch (err) {
        console.error('Catturato:', err);
    }
}, 1000);
```
</details>

### Domanda 4: Output Order
```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');
```
**Qual è l'output?**

<details>
<summary>Mostra risposta</summary>

```
1
4
3
2
```

**Spiegazione:**
1. `1` - codice sincrono
2. `4` - codice sincrono
3. `3` - Promise (microtask, priorità alta)
4. `2` - setTimeout (macrotask, priorità bassa)
</details>

### Domanda 5: Callback Hell
**Qual è il modo migliore per risolvere callback annidate?**

<details>
<summary>Mostra risposta</summary>

Le migliori soluzioni in ordine di preferenza:

1. **Async/Await** (migliore)
```javascript
async function main() {
    const user = await getUser();
    const posts = await getPosts(user.id);
    const comments = await getComments(posts[0].id);
}
```

2. **Promises**
```javascript
getUser()
    .then(user => getPosts(user.id))
    .then(posts => getComments(posts[0].id))
    .then(comments => console.log(comments));
```

3. **Named Functions**
```javascript
function handleUser(err, user) {
    if (err) return console.error(err);
    getPosts(user.id, handlePosts);
}
```
</details>

---

## 💪 Esercizi Pratici

### Esercizio 1: Implementa readJSON

Crea una funzione `readJSON(path, callback)` che:
- Legge un file JSON
- Gestisce errori di lettura e parsing
- Usa il pattern error-first

<details>
<summary>Soluzione</summary>

```javascript
const fs = require('fs');

function readJSON(path, callback) {
    // Validazione input
    if (typeof callback !== 'function') {
        throw new TypeError('callback deve essere una funzione');
    }
    
    fs.readFile(path, 'utf8', (err, data) => {
        // Errore lettura file
        if (err) {
            return callback(err);
        }
        
        // Parsing JSON
        try {
            const json = JSON.parse(data);
            callback(null, json);
        } catch (parseErr) {
            // Errore parsing
            callback(parseErr);
        }
    });
}

// Test
readJSON('config.json', (err, config) => {
    if (err) {
        console.error('Errore:', err.message);
        return;
    }
    console.log('Config:', config);
});
```
</details>

### Esercizio 2: Sequential File Reader

Crea una funzione che legge più file in sequenza e concatena i contenuti.

```javascript
const files = ['part1.txt', 'part2.txt', 'part3.txt'];
leggiSequenziale(files, (err, contenuto) => {
    console.log(contenuto); // Contenuti concatenati
});
```

<details>
<summary>Soluzione</summary>

```javascript
const fs = require('fs');

function leggiSequenziale(files, callback) {
    let contenutoTotale = '';
    let indiceCorrente = 0;
    
    function leggiProssimo() {
        // Fine array
        if (indiceCorrente >= files.length) {
            return callback(null, contenutoTotale);
        }
        
        const file = files[indiceCorrente];
        indiceCorrente++;
        
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                return callback(err);
            }
            
            contenutoTotale += data;
            leggiProssimo(); // Leggi il prossimo
        });
    }
    
    leggiProssimo();
}

// Test
leggiSequenziale(
    ['part1.txt', 'part2.txt', 'part3.txt'],
    (err, contenuto) => {
        if (err) {
            console.error('Errore:', err.message);
            return;
        }
        console.log('Contenuto completo:', contenuto);
    }
);
```
</details>

### Esercizio 3: Parallel File Reader

Come l'esercizio 2, ma leggi i file in parallelo per maggiore velocità.

<details>
<summary>Soluzione</summary>

```javascript
const fs = require('fs');

function leggiParallelo(files, callback) {
    const risultati = new Array(files.length);
    let completati = 0;
    let erroreRilevato = false;
    
    if (files.length === 0) {
        return callback(null, []);
    }
    
    files.forEach((file, index) => {
        fs.readFile(file, 'utf8', (err, data) => {
            // Se già c'è stato un errore, ignora
            if (erroreRilevato) return;
            
            if (err) {
                erroreRilevato = true;
                return callback(err);
            }
            
            risultati[index] = data;
            completati++;
            
            // Tutti completati?
            if (completati === files.length) {
                callback(null, risultati.join(''));
            }
        });
    });
}

// Test
leggiParallelo(
    ['part1.txt', 'part2.txt', 'part3.txt'],
    (err, contenuto) => {
        if (err) {
            console.error('Errore:', err.message);
            return;
        }
        console.log('Contenuto completo:', contenuto);
    }
);
```
</details>

### Esercizio 4: Callback Caching

Implementa una funzione che fa cache del risultato di una callback:

```javascript
const cached = memoize(caricaUtente);

cached(1, (err, user) => { /* Prima chiamata: DB query */ });
cached(1, (err, user) => { /* Seconda chiamata: cache */ });
```

<details>
<summary>Soluzione</summary>

```javascript
function memoize(fn) {
    const cache = new Map();
    
    return function(...args) {
        // L'ultimo argomento è la callback
        const callback = args[args.length - 1];
        const key = JSON.stringify(args.slice(0, -1));
        
        // Controlla cache
        if (cache.has(key)) {
            const cached = cache.get(key);
            
            // Callback asincrona anche per cache
            return process.nextTick(() => {
                callback(cached.err, cached.result);
            });
        }
        
        // Chiama funzione originale
        fn(...args.slice(0, -1), (err, result) => {
            // Salva in cache
            cache.set(key, { err, result });
            callback(err, result);
        });
    };
}

// Test
function caricaUtente(id, callback) {
    console.log('Query database per utente', id);
    setTimeout(() => {
        callback(null, { id, nome: 'Mario' });
    }, 1000);
}

const caricaUtenteCached = memoize(caricaUtente);

caricaUtenteCached(1, (err, user) => {
    console.log('Prima chiamata:', user); // Query DB
    
    caricaUtenteCached(1, (err, user) => {
        console.log('Seconda chiamata:', user); // Cache!
    });
});
```
</details>

---

## 📚 Risorse Aggiuntive

### 📖 Documentazione
- [Node.js Callback Pattern](https://nodejs.org/en/knowledge/getting-started/control-flow/what-are-callbacks/)
- [Error-First Callbacks](https://nodejs.org/api/errors.html#errors_error_first_callbacks)
- [util.promisify](https://nodejs.org/api/util.html#util_util_promisify_original)

### 📝 Articoli Consigliati
- [Callback Hell](http://callbackhell.com/)
- [Understanding Callbacks in JavaScript](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function)
- [Async Patterns](https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/)

### 📦 Librerie Utili
- [async.js](https://caolan.github.io/async/) - Controllo di flusso con callback
- [neo-async](https://github.com/suguru03/neo-async) - async.js più veloce
- [run-series](https://github.com/feross/run-series) - Semplice esecuzione seriale

### 🎥 Video Consigliati
- [Callbacks Explained](https://www.youtube.com/watch?v=cNjIUSDnb9k)
- [Callback Hell and How to Rescue It](https://www.youtube.com/watch?v=xHneyv38Jro)

---

## 🎯 Riepilogo Chiave

### ✅ Concetti Fondamentali

1. **Callback = Funzione passata come argomento**
   - Eseguita al completamento di un'operazione asincrona
   - Fondamentale per la programmazione asincrona in Node.js

2. **Error-First Pattern**
   ```javascript
   function(err, result) {
       if (err) { /* gestisci errore */ }
       /* usa result */
   }
   ```

3. **Callback Hell**
   - Callback annidate = codice illeggibile
   - Soluzioni: named functions, promises, async/await

4. **Gestione Errori**
   - Controlla SEMPRE l'errore per primo
   - Usa `return callback(err)` per uscire
   - try/catch non funziona con callback asincrone

### 🚀 Best Practices

✅ **DA FARE:**
- Usa il pattern error-first
- Chiama la callback UNA sola volta
- Usa `return` quando chiami la callback
- Valida che callback sia una funzione
- Mantieni le callback brevi e semplici
- Considera Promise/async-await per codice nuovo

❌ **DA EVITARE:**
- Ignorare gli errori
- Chiamare la callback più volte
- Callback annidate (callback hell)
- Callback sincrone/asincrone miste
- try/catch per callback asincrone

### 📊 Quando Usare Callback

| ✅ Usa Callback | ✅ Usa Promise/Async-Await |
|----------------|---------------------------|
| Codice legacy | Codice nuovo |
| Event listeners | Operazioni sequenziali |
| Stream API | Operazioni parallele |
| Librerie che le richiedono | Gestione errori complessa |

### 🔄 Evoluzione

```
Callback → Promise → Async/Await
  ↓          ↓           ↓
Vecchio   Intermedio   Moderno
```

---

**🎓 Congratulazioni!** Ora comprendi le callback in Node.js. Ricorda: mentre le callback sono ancora usate, considera Promise e async/await per codice più pulito e manutenibile!

**📌 Prossimi Passi:**
- Studia le Promise
- Impara async/await
- Esplora gli Event Emitter
- Pratica con esempi reali

## Gestione Avanzata degli Errori

### Pattern Error-First Completo

```javascript
function operazioneRobusta(input, callback) {
    // Validazione input
    if (typeof input !== 'number') {
        // Errori sincroni: callback nel prossimo tick
        process.nextTick(() => {
            callback(new TypeError('Input deve essere un numero'));
        });
        return;
    }
    
    // Operazione asincrona
    setTimeout(() => {
        try {
            if (input < 0) {
                throw new Error('Input non può essere negativo');
            }
            
            const risultato = Math.sqrt(input);
            callback(null, risultato);
        } catch (err) {
            callback(err);
        }
    }, 100);
}

// Uso con gestione errori completa
operazioneRobusta('non un numero', function(err, result) {
    if (err) {
        if (err instanceof TypeError) {
            console.error('Errore di tipo:', err.message);
        } else {
            console.error('Errore generico:', err.message);
        }
        return;
    }
    
    console.log('Risultato:', result);
});
```

### Propagazione degli Errori

```javascript
function step1(callback) {
    fs.readFile('config.json', 'utf8', function(err, data) {
        if (err) {
            // Aggiungi contesto all'errore
            err.message = 'Errore in step1: ' + err.message;
            callback(err);
            return;
        }
        callback(null, data);
    });
}

function step2(data, callback) {
    try {
        const config = JSON.parse(data);
        callback(null, config);
    } catch (err) {
        // Errore di parsing
        err.message = 'Errore in step2 (parsing JSON): ' + err.message;
        callback(err);
    }
}

function step3(config, callback) {
    if (!config.apiKey) {
        const err = new Error('Errore in step3: apiKey mancante');
        callback(err);
        return;
    }
    callback(null, config);
}

// Chain con propagazione errori
step1(function(err, data) {
    if (err) return handleError(err);
    
    step2(data, function(err, config) {
        if (err) return handleError(err);
        
        step3(config, function(err, result) {
            if (err) return handleError(err);
            
            console.log('Successo:', result);
        });
    });
});

function handleError(err) {
    console.error('Pipeline fallita:', err.message);
    // Log dello stack trace completo
    console.error(err.stack);
}
```

### Custom Error Classes

```javascript
// Definire errori personalizzati
class DatabaseError extends Error {
    constructor(message, query) {
        super(message);
        this.name = 'DatabaseError';
        this.query = query;
    }
}

class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

// Uso
function queryDatabase(sql, callback) {
    // Simula query database
    setTimeout(() => {
        if (!sql) {
            callback(new ValidationError('Query vuota', 'sql'));
            return;
        }
        
        if (sql.includes('DROP TABLE')) {
            callback(new DatabaseError('Operazione non permessa', sql));
            return;
        }
        
        callback(null, { rows: [] });
    }, 100);
}

queryDatabase('DROP TABLE users', function(err, result) {
    if (err) {
        if (err instanceof DatabaseError) {
            console.error('Errore DB:', err.message);
            console.error('Query:', err.query);
        } else if (err instanceof ValidationError) {
            console.error('Errore validazione:', err.message);
            console.error('Campo:', err.field);
        } else {
            console.error('Errore sconosciuto:', err);
        }
        return;
    }
    
    console.log('Risultato:', result);
});
```

## Conversione Callbacks in Promises

### Metodo 1: Manual Promisification

```javascript
const fs = require('fs');

// Converte callback-based function in Promise-based
function readFilePromise(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

// Uso
readFilePromise('file.txt')
    .then(data => console.log('Contenuto:', data))
    .catch(err => console.error('Errore:', err.message));

// O con async/await
async function main() {
    try {
        const data = await readFilePromise('file.txt');
        console.log('Contenuto:', data);
    } catch (err) {
        console.error('Errore:', err.message);
    }
}
```

### Metodo 2: util.promisify

```javascript
const fs = require('fs');
const { promisify } = require('util');

// Converte automaticamente
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Uso
async function processFiles() {
    try {
        const data = await readFileAsync('input.txt', 'utf8');
        const processed = data.toUpperCase();
        await writeFileAsync('output.txt', processed);
        console.log('File processato con successo!');
    } catch (err) {
        console.error('Errore:', err.message);
    }
}

processFiles();
```

### Metodo 3: Funzione Generica di Promisification

```javascript
function promisify(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (err, ...results) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                // Se c'è un solo risultato, restituiscilo direttamente
                if (results.length <= 1) {
                    resolve(results[0]);
                } else {
                    resolve(results);
                }
            });
        });
    };
}

// Uso con qualsiasi funzione callback-based
const fs = require('fs');

const readFileAsync = promisify(fs.readFile);
const statAsync = promisify(fs.stat);

async function getFileInfo(filename) {
    try {
        const [data, stats] = await Promise.all([
            readFileAsync(filename, 'utf8'),
            statAsync(filename)
        ]);
        
        return {
            content: data,
            size: stats.size,
            modified: stats.mtime
        };
    } catch (err) {
        console.error('Errore:', err.message);
        throw err;
    }
}
```

## Performance e Best Practices

### Best Practice 1: Evitare Operazioni Sincrone

```javascript
const fs = require('fs');

// ❌ MALE: Blocca l'Event Loop
app.get('/user/:id', (req, res) => {
    const data = fs.readFileSync(`users/${req.params.id}.json`);
    res.json(JSON.parse(data));
});

// ✅ BENE: Non blocca
app.get('/user/:id', (req, res) => {
    fs.readFile(`users/${req.params.id}.json`, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(JSON.parse(data));
    });
});

// ✅ MEGLIO: Con async/await
app.get('/user/:id', async (req, res) => {
    try {
        const data = await fs.promises.readFile(
            `users/${req.params.id}.json`,
            'utf8'
        );
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
```

### Best Practice 2: Gestire Sempre gli Errori

```javascript
// ❌ MALE: Errore non gestito
fs.readFile('file.txt', (err, data) => {
    console.log(data.toString()); // CRASH se err!
});

// ✅ BENE: Errore gestito
fs.readFile('file.txt', (err, data) => {
    if (err) {
        console.error('Errore:', err.message);
        return;
    }
    console.log(data.toString());
});
```

### Best Practice 3: Non Mischiare Sync e Async

```javascript
// ❌ MALE: Comportamento imprevedibile
function operazioneMista(input, callback) {
    if (!input) {
        callback(new Error('Input mancante')); // Sincrono!
        return;
    }
    
    setTimeout(() => {
        callback(null, input * 2); // Asincrono!
    }, 100);
}

// ✅ BENE: Sempre asincrono
function operazioneConsistente(input, callback) {
    if (!input) {
        process.nextTick(() => {
            callback(new Error('Input mancante'));
        });
        return;
    }
    
    setTimeout(() => {
        callback(null, input * 2);
    }, 100);
}
```

### Best Practice 4: Limitare la Nidificazione

```javascript
// ❌ MALE: Troppa nidificazione
function processo(callback) {
    step1((err, r1) => {
        if (err) return callback(err);
        step2(r1, (err, r2) => {
            if (err) return callback(err);
            step3(r2, (err, r3) => {
                if (err) return callback(err);
                callback(null, r3);
            });
        });
    });
}

// ✅ BENE: Funzioni separate
function processo(callback) {
    step1(handleStep1);
    
    function handleStep1(err, r1) {
        if (err) return callback(err);
        step2(r1, handleStep2);
    }
    
    function handleStep2(err, r2) {
        if (err) return callback(err);
        step3(r2, handleStep3);
    }
    
    function handleStep3(err, r3) {
        if (err) return callback(err);
        callback(null, r3);
    }
}
```

### Best Practice 5: Usare Timeout per Operazioni Lunghe

```javascript
function operazioneConTimeout(input, timeout, callback) {
    let completed = false;
    
    // Timeout
    const timer = setTimeout(() => {
        if (!completed) {
            completed = true;
            callback(new Error('Timeout superato'));
        }
    }, timeout);
    
    // Operazione vera
    operazioneLunga(input, (err, result) => {
        if (completed) return; // Troppo tardi
        
        completed = true;
        clearTimeout(timer);
        callback(err, result);
    });
}

// Uso
operazioneConTimeout('data', 5000, (err, result) => {
    if (err) {
        console.error('Errore o timeout:', err.message);
        return;
    }
    console.log('Risultato:', result);
});
```

## Debugging di Callbacks

### Tecnica 1: Named Functions per Stack Trace

```javascript
// ❌ MALE: Stack trace poco utile
fs.readFile('file.txt', (err, data) => {
    fs.writeFile('output.txt', data, (err) => {
        console.log('Done');
    });
});

// ✅ BENE: Stack trace con nomi
fs.readFile('file.txt', function readCallback(err, data) {
    if (err) throw err;
    fs.writeFile('output.txt', data, function writeCallback(err) {
        if (err) throw err;
        console.log('Done');
    });
});

// In caso di errore, lo stack trace mostrerà "readCallback" e "writeCallback"
```

### Tecnica 2: Logging Dettagliato

```javascript
function loggedCallback(name, callback) {
    return function(...args) {
        const err = args[0];
        console.log(`[${name}] Called with:`, args);
        
        if (err) {
            console.error(`[${name}] Error:`, err);
        }
        
        callback(...args);
    };
}

// Uso
fs.readFile('file.txt', loggedCallback('readFile', (err, data) => {
    if (err) return;
    
    fs.writeFile('output.txt', data, loggedCallback('writeFile', (err) => {
        if (err) return;
        console.log('Processo completato');
    }));
}));

// Output:
// [readFile] Called with: [ null, <Buffer...> ]
// [writeFile] Called with: [ null ]
// Processo completato
// 
```

### Tecnica 3: Async Hooks per Tracciare Callbacks

```javascript
const async_hooks = require('async_hooks');
const fs = require('fs');

// Mappa per tracciare operazioni asincrone
const asyncOps = new Map();

const hook = async_hooks.createHook({
    init(asyncId, type, triggerAsyncId) {
        asyncOps.set(asyncId, {
            type,
            triggeredBy: triggerAsyncId,
            timestamp: Date.now()
        });
    },
    destroy(asyncId) {
        const op = asyncOps.get(asyncId);
        if (op) {
            const duration = Date.now() - op.timestamp;
            console.log(`Operazione ${op.type} completata in ${duration}ms`);
            asyncOps.delete(asyncId);
        }
    }
});

hook.enable();

// Test
fs.readFile('file.txt', (err, data) => {
    console.log('File letto');
});

// Output:
// File letto
// Operazione FSREQCALLBACK completata in 5ms
```

### Tecnica 4: Error Boundaries con Domain (Deprecato ma utile da conoscere)

```javascript
// NOTA: Domain è deprecato, ma è importante conoscerlo per codice legacy

const domain = require('domain');
const fs = require('fs');

function operazioneProtetta(callback) {
    const d = domain.create();
    
    d.on('error', (err) => {
        console.error('Errore catturato dal domain:', err.message);
        callback(err);
    });
    
    d.run(() => {
        fs.readFile('file-inesistente.txt', (err, data) => {
            if (err) throw err; // Catturato dal domain
            callback(null, data);
        });
    });
}

// Uso
operazioneProtetta((err, data) => {
    if (err) {
        console.log('Gestione errore nel callback');
        return;
    }
    console.log('Successo');
});
```

## Casi d'Uso Reali

### Caso 1: Server HTTP con Callbacks

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Gestione routing con callbacks
    if (req.url === '/') {
        serveFile('index.html', res);
    } else if (req.url === '/api/data') {
        serveJSON(res);
    } else {
        serve404(res);
    }
});

function serveFile(filename, res) {
    const filepath = path.join(__dirname, 'public', filename);
    
    fs.readFile(filepath, (err, data) => {
        if (err) {
            console.error('Errore lettura file:', err);
            serve500(res, err);
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
}

function serveJSON(res) {
    const data = { message: 'Hello from API', timestamp: Date.now() };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function serve404(res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 - Not Found');
}

function serve500(res, err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 - Internal Server Error: ' + err.message);
}

server.listen(3000, () => {
    console.log('Server in ascolto su http://localhost:3000');
});
```

### Caso 2: Pipeline di Processamento Dati

```javascript
const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');

function processDataPipeline(inputFile, outputFile, callback) {
    // Step 1: Leggi file
    fs.readFile(inputFile, (err, data) => {
        if (err) {
            callback(new Error(`Errore lettura: ${err.message}`));
            return;
        }
        
        console.log('✓ File letto');
        
        // Step 2: Comprimi dati
        zlib.gzip(data, (err, compressed) => {
            if (err) {
                callback(new Error(`Errore compressione: ${err.message}`));
                return;
            }
            
            console.log('✓ Dati compressi');
            console.log(`  Dimensione originale: ${data.length} bytes`);
            console.log(`  Dimensione compressa: ${compressed.length} bytes`);
            
            // Step 3: Calcola hash
            const hash = crypto.createHash('sha256');
            hash.update(compressed);
            const checksum = hash.digest('hex');
            
            console.log('✓ Checksum calcolato:', checksum);
            
            // Step 4: Scrivi file compresso
            fs.writeFile(outputFile, compressed, (err) => {
                if (err) {
                    callback(new Error(`Errore scrittura: ${err.message}`));
                    return;
                }
                
                console.log('✓ File scritto');
                
                // Step 5: Scrivi checksum
                fs.writeFile(outputFile + '.sha256', checksum, (err) => {
                    if (err) {
                        callback(new Error(`Errore scrittura checksum: ${err.message}`));
                        return;
                    }
                    
                    console.log('✓ Checksum scritto');
                    callback(null, {
                        inputFile,
                        outputFile,
                        checksum,
                        compressionRatio: (compressed.length / data.length * 100).toFixed(2) + '%'
                    });
                });
            });
        });
    });
}

// Uso
processDataPipeline('large-data.txt', 'output.gz', (err, result) => {
    if (err) {
        console.error('❌ Pipeline fallita:', err.message);
        return;
    }
    
    console.log('\n✅ Pipeline completata con successo!');
    console.log('Risultato:', result);
});

/* Output esempio:
✓ File letto
✓ Dati compressi
  Dimensione originale: 1048576 bytes
  Dimensione compressa: 245832 bytes
✓ Checksum calcolato: a3f5b8c...
✓ File scritto
✓ Checksum scritto

✅ Pipeline completata con successo!
Risultato: {
  inputFile: 'large-data.txt',
  outputFile: 'output.gz',
  checksum: 'a3f5b8c...',
  compressionRatio: '23.44%'
}
*/
```

### Caso 3: Batch Processing con Controllo di Concorrenza

```javascript
const fs = require('fs');

class BatchProcessor {
    constructor(concurrency = 3) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
        this.results = [];
        this.errors = [];
    }
    
    process(items, taskFn, callback) {
        this.queue = items.map((item, index) => ({ item, index }));
        this.taskFn = taskFn;
        this.finalCallback = callback;
        this.results = new Array(items.length);
        
        // Avvia processamento
        this.processNext();
    }
    
    processNext() {
        // Avvia task fino al limite di concorrenza
        while (this.running < this.concurrency && this.queue.length > 0) {
            const { item, index } = this.queue.shift();
            this.running++;
            
            this.taskFn(item, (err, result) => {
                this.running--;
                
                if (err) {
                    this.errors.push({ index, item, error: err });
                } else {
                    this.results[index] = result;
                }
                
                // Controlla se ci sono altri task
                if (this.queue.length > 0) {
                    this.processNext();
                } else if (this.running === 0) {
                    // Tutti completati
                    this.finalCallback(
                        this.errors.length > 0 ? this.errors : null,
                        this.results
                    );
                }
            });
        }
    }
}

// Uso: processare 10 file con max 3 operazioni simultanee
const files = Array.from({ length: 10 }, (_, i) => `file${i + 1}.txt`);

const processor = new BatchProcessor(3);

processor.process(
    files,
    // Task function
    (filename, callback) => {
        console.log(`Inizio lettura: ${filename}`);
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                console.log(`❌ Errore: ${filename}`);
                callback(err);
                return;
            }
            console.log(`✓ Completato: ${filename}`);
            callback(null, { filename, size: data.length });
        });
    },
    // Callback finale
    (errors, results) => {
        if (errors) {
            console.log(`\nCompletato con ${errors.length} errori`);
            errors.forEach(({ item, error }) => {
                console.log(`  - ${item}: ${error.message}`);
            });
        }
        
        const successful = results.filter(r => r);
        console.log(`\n✅ File processati con successo: ${successful.length}`);
        console.log('Risultati:', successful);
    }
);
```

### Caso 4: Event Emitter con Callbacks

```javascript
const EventEmitter = require('events');
const fs = require('fs');

class FileWatcher extends EventEmitter {
    constructor(directory) {
        super();
        this.directory = directory;
        this.files = new Map();
        this.watching = false;
    }
    
    start(callback) {
        if (this.watching) {
            callback(new Error('Already watching'));
            return;
        }
        
        // Leggi stato iniziale
        fs.readdir(this.directory, (err, files) => {
            if (err) {
                callback(err);
                return;
            }
            
            // Inizializza mappa files
            let pending = files.length;
            if (pending === 0) {
                this.watching = true;
                this.startPolling();
                callback(null);
                return;
            }
            
            files.forEach(file => {
                const filepath = `${this.directory}/${file}`;
                fs.stat(filepath, (err, stats) => {
                    if (!err) {
                        this.files.set(file, stats.mtime.getTime());
                    }
                    
                    pending--;
                    if (pending === 0) {
                        this.watching = true;
                        this.startPolling();
                        callback(null);
                    }
                });
            });
        });
    }
    
    startPolling() {
        this.interval = setInterval(() => {
            this.checkChanges((err) => {
                if (err) {
                    this.emit('error', err);
                }
            });
        }, 1000);
    }
    
    checkChanges(callback) {
        fs.readdir(this.directory, (err, currentFiles) => {
            if (err) {
                callback(err);
                return;
            }
            
            // File eliminati
            for (const [file] of this.files) {
                if (!currentFiles.includes(file)) {
                    this.emit('removed', file);
                    this.files.delete(file);
                }
            }
            
            // File nuovi o modificati
            let pending = currentFiles.length;
            if (pending === 0) {
                callback(null);
                return;
            }
            
            currentFiles.forEach(file => {
                const filepath = `${this.directory}/${file}`;
                fs.stat(filepath, (err, stats) => {
                    if (err) {
                        pending--;
                        if (pending === 0) callback(null);
                        return;
                    }
                    
                    const mtime = stats.mtime.getTime();
                    const oldMtime = this.files.get(file);
                    
                    if (!oldMtime) {
                        this.emit('added', file);
                    } else if (mtime !== oldMtime) {
                        this.emit('changed', file);
                    }
                    
                    this.files.set(file, mtime);
                    
                    pending--;
                    if (pending === 0) callback(null);
                });
            });
        });
    }
    
    stop(callback) {
        if (!this.watching) {
            callback(new Error('Not watching'));
            return;
        }
        
        clearInterval(this.interval);
        this.watching = false;
        this.files.clear();
        
        process.nextTick(() => callback(null));
    }
}

// Uso
const watcher = new FileWatcher('./watch-dir');

watcher.on('added', (file) => {
    console.log('➕ File aggiunto:', file);
});

watcher.on('changed', (file) => {
    console.log('✏️  File modificato:', file);
});

watcher.on('removed', (file) => {
    console.log('🗑️  File rimosso:', file);
});

watcher.on('error', (err) => {
    console.error('❌ Errore:', err.message);
});

watcher.start((err) => {
    if (err) {
        console.error('Impossibile avviare watcher:', err.message);
        return;
    }
    
    console.log('👀 Watching directory:', watcher.directory);
    
    // Stop dopo 30 secondi
    setTimeout(() => {
        watcher.stop((err) => {
            if (err) {
                console.error('Errore stop:', err.message);
                return;
            }
            console.log('🛑 Watcher fermato');
        });
    }, 30000);
});
```

## Migrazione da Callbacks a Promises/Async-Await

### Esempio Completo di Migrazione

```javascript
// ==========================================
// VERSIONE 1: Con Callbacks (Legacy)
// ==========================================
function getUserDataCallback(userId, callback) {
    // Step 1: Carica utente
    db.findUser(userId, (err, user) => {
        if (err) return callback(err);
        
        // Step 2: Carica posts
        db.findPosts(user.id, (err, posts) => {
            if (err) return callback(err);
            
            // Step 3: Carica comments per ogni post
            let pending = posts.length;
            const postsWithComments = [];
            
            posts.forEach((post, index) => {
                db.findComments(post.id, (err, comments) => {
                    if (err) return callback(err);
                    
                    postsWithComments[index] = { ...post, comments };
                    pending--;
                    
                    if (pending === 0) {
                        callback(null, {
                            user,
                            posts: postsWithComments
                        });
                    }
                });
            });
        });
    });
}

// Uso con callback
getUserDataCallback(123, (err, data) => {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    console.log('Dati utente:', data);
});

// ==========================================
// VERSIONE 2: Con Promises
// ==========================================
const { promisify } = require('util');

const findUserAsync = promisify(db.findUser);
const findPostsAsync = promisify(db.findPosts);
const findCommentsAsync = promisify(db.findComments);

function getUserDataPromise(userId) {
    let userData;
    
    return findUserAsync(userId)
        .then(user => {
            userData = { user };
            return findPostsAsync(user.id);
        })
        .then(posts => {
            const commentsPromises = posts.map(post =>
                findCommentsAsync(post.id)
                    .then(comments => ({ ...post, comments }))
            );
            return Promise.all(commentsPromises);
        })
        .then(postsWithComments => {
            userData.posts = postsWithComments;
            return userData;
        });
}

// Uso con promises
getUserDataPromise(123)
    .then(data => console.log('Dati utente:', data))
    .catch(err => console.error('Errore:', err));

// ==========================================
// VERSIONE 3: Con Async/Await (Moderna)
// ==========================================
async function getUserDataAsync(userId) {
    try {
        // Step 1: Carica utente
        const user = await findUserAsync(userId);
        
        // Step 2: Carica posts
        const posts = await findPostsAsync(user.id);
        
        // Step 3: Carica comments in parallelo
        const postsWithComments = await Promise.all(
            posts.map(async (post) => {
                const comments = await findCommentsAsync(post.id);
                return { ...post, comments };
            })
        );
        
        return {
            user,
            posts: postsWithComments
        };
    } catch (err) {
        console.error('Errore:', err);
        throw err;
    }
}

// Uso con async/await
async function main() {
    try {
        const data = await getUserDataAsync(123);
        console.log('Dati utente:', data);
    } catch (err) {
        console.error('Errore:', err);
    }
}

main();
```

### Confronto delle Tre Versioni

| Aspetto | Callbacks | Promises | Async/Await |
|---------|-----------|----------|-------------|
| **Leggibilità** | ⭐⭐ Difficile | ⭐⭐⭐ Buona | ⭐⭐⭐⭐⭐ Eccellente |
| **Gestione errori** | Ripetitiva | `.catch()` | `try/catch` |
| **Nidificazione** | Alta | Bassa | Nessuna |
| **Debugging** | Difficile | Medio | Facile |
| **Compatibilità** | Tutte le versioni | Node 4+ | Node 8+ |
| **Performance** | Alta | Alta | Alta |

## Librerie Utili per Callbacks

### 1. async.js

```javascript
const async = require('async');
const fs = require('fs');

// Parallel execution
async.parallel([
    (cb) => fs.readFile('file1.txt', 'utf8', cb),
    (cb) => fs.readFile('file2.txt', 'utf8', cb),
    (cb) => fs.readFile('file3.txt', 'utf8', cb)
], (err, results) => {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    console.log('Risultati:', results);
});

// Series execution
async.series([
    (cb) => setTimeout(() => cb(null, 'one'), 200),
    (cb) => setTimeout(() => cb(null, 'two'), 100)
], (err, results) => {
    console.log(results); // ['one', 'two']
});

// Waterfall
async.waterfall([
    (cb) => cb(null, 'start'),
    (data, cb) => cb(null, data + ' -> step2'),
    (data, cb) => cb(null, data + ' -> step3')
], (err, result) => {
    console.log(result); // 'start -> step2 -> step3'
});

// Parallel with limit
async.parallelLimit([
    (cb) => processFile('file1.txt', cb),
    (cb) => processFile('file2.txt', cb),
    (cb) => processFile('file3.txt', cb),
    (cb) => processFile('file4.txt', cb)
], 2, (err, results) => {
    // Max 2 operazioni simultanee
    console.log('Completato');
});

// Each (itera su array)
async.each(['file1', 'file2', 'file3'], (file, cb) => {
    console.log('Processando:', file);
    processFile(file, cb);
}, (err) => {
    if (err) {
        console.error('Errore durante iterazione');
        return;
    }
    console.log('Tutti i file processati');
});
```

### 2. neo-async (più veloce di async.js)

```javascript
const async = require('neo-async');

// API identica ad async.js ma con migliori prestazioni

async.map([1, 2, 3], (num, cb) => {
    setTimeout(() => cb(null, num * 2), 100);
}, (err, results) => {
    console.log(results); // [2, 4, 6]
});
```

### 3. callback-queue

```javascript
// Implementazione custom di una coda con callbacks

class CallbackQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }
    
    add(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.process();
        });
    }
    
    async process() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            const { fn, resolve, reject } = this.queue.shift();
            
            try {
                const result = await new Promise((res, rej) => {
                    fn((err, result) => {
                        if (err) rej(err);
                        else res(result);
                    });
                });
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }
        
        this.processing = false;
    }
}

// Uso
const queue = new CallbackQueue();

queue.add((cb) => {
    setTimeout(() => cb(null, 'result1'), 100);
}).then(r => console.log(r));

queue.add((cb) => {
    setTimeout(() => cb(null, 'result2'), 50);
}).then(r => console.log(r));
```

## Esercizi Pratici

### Esercizio 1: Implementare `async.series`

Creare una funzione che esegue task in sequenza, fermandosi al primo errore:

```javascript
function series(tasks, callback) {
    // TODO: Implementare
    // - Eseguire tasks uno alla volta
    // - Collezionare risultati in un array
    // - Fermarsi al primo errore
    // - Chiamare callback finale con (err, results)
}

// Test
series([
    (cb) => setTimeout(() => cb(null, 1), 100),
    (cb) => setTimeout(() => cb(null, 2), 50),
    (cb) => setTimeout(() => cb(null, 3), 75)
], (err, results) => {
    console.log(results); // Deve essere [1, 2, 3]
});
```

### Esercizio 2: Implementare Retry Logic

Creare una funzione che riprova un'operazione fallita fino a un massimo di tentativi:

```javascript
function retry(fn, maxAttempts, callback) {
    // TODO: Implementare
    // - Eseguire fn
    // - Se fallisce, riprovare fino a maxAttempts
    // - Se tutti i tentativi falliscono, chiamare callback con errore
    // - Se succede, chiamare callback con risultato
}

// Test
let attempts = 0;
retry((cb) => {
    attempts++;
    if (attempts < 3) {
        cb(new Error('Failure'));
    } else {
        cb(null, 'Success');
    }
}, 5, (err, result) => {
    console.log(result); // 'Success' dopo 3 tentativi
});
```

### Esercizio 3: Implementare Cache con Callbacks

Creare un sistema di caching per operazioni asincrone:

```javascript
function cached(fn, ttl) {
    // TODO: Implementare
    // - Cachare risultati di fn
    // - TTL (time to live) in millisecondi
    // - Se dato in cache e valido, ritornare subito
    // - Altrimenti eseguire fn e cachare
    
    return function(...args) {
        const callback = args.pop();
        // Implementare logica caching
    };
}

// Test
const slowOperation = (id, cb) => {
    console.log('Esecuzione operazione lenta...');
    setTimeout(() => cb(null, `Result for ${id}`), 1000);
};

const cachedOp = cached(slowOperation, 5000);

cachedOp(1, (err, result) => console.log(result));
// Dopo 100ms
setTimeout(() => {
    cachedOp(1, (err, result) => console.log(result)); // Deve usare cache
}, 100);
```

### Esercizio 4: File Processor con Callbacks

Creare un processore di file che:
1. Legge un file CSV
2. Parsifica i dati
3. Filtra righe valide
4. Trasforma i dati
5. Salva risultato in un nuovo file

```javascript
function processCSV(inputFile, outputFile, callback) {
    // TODO: Implementare pipeline completa
}

// Test
processCSV('input.csv', 'output.json', (err, stats) => {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    console.log('Stats:', stats);
    // { rowsProcessed: 100, rowsFiltered: 20, processingTime: 523 }
});
```

### Esercizio 5: Rate Limiter

Implementare un rate limiter che limita il numero di chiamate per secondo:

```javascript
function rateLimiter(fn, requestsPerSecond) {
    // TODO: Implementare
    // - Limitare chiamate a fn
    // - Massimo requestsPerSecond chiamate al secondo
    // - Accodare richieste in eccesso
    
    return function(...args) {
        // Implementare logica rate limiting
    };
}

// Test
const limited = rateLimiter((id, cb) => {
    console.log('Request:', id, Date.now());
    cb(null, id);
}, 2); // Max 2 richieste al secondo

for (let i = 0; i < 10; i++) {
    limited(i, (err, result) => {
        console.log('Completed:', result);
    });
}
// Le richieste devono essere distribuite nel tempo
```

## Domande di Autovalutazione

### Domanda 1
Cosa significa "error-first callback"?

A) Il callback viene eseguito solo se c'è un errore  
B) Il primo parametro del callback è sempre l'errore (null se successo)  
C) Il callback deve gestire gli errori prima di tutto  
D) Gli errori vengono passati prima dei callback

### Domanda 2
Quale codice segue correttamente la convenzione error-first?

A)
```javascript
fs.readFile('file.txt', (data, err) => {
    if (err) console.error(err);
});
```

B)
```javascript
fs.readFile('file.txt', (err, data) => {
    console.log(data);
    if (err) console.error(err);
});
```

C)
```javascript
fs.readFile('file.txt', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(data);
});
```

D)
```javascript
fs.readFile('file.txt', (data) => {
    console.log(data);
}).catch(err => console.error(err));
```

### Domanda 3
Cos'è il "Callback Hell"?

A) Un errore che causa il crash dell'applicazione  
B) Eccessiva nidificazione di callbacks che rende il codice difficile da leggere  
C) Quando un callback viene chiamato più volte  
D) Un callback che non gestisce gli errori

### Domanda 4
Quale approccio è il migliore per evitare callback hell?

A) Usare più callbacks nidificati  
B) Ignorare la gestione errori  
C) Usare funzioni nominate e modularizzazione  
D) Usare solo codice sincrono

### Domanda 5
Cosa fa `util.promisify()`?

A) Converte una Promise in callback  
B) Converte una funzione callback-based in Promise-based  
C) Crea una nuova Promise  
D) Esegue callbacks in modo asincrono

### Domanda 6
Quale è il problema in questo codice?

```javascript
function getData(callback) {
    if (!data) {
        callback(new Error('No data'));
        return;
    }
    setTimeout(() => callback(null, data), 100);
}
```

A) Non c'è problema  
B) Comportamento misto sincrono/asincrono  
C) Callback chiamato due volte  
D) Errore non gestito

### Domanda 7
Come si può limitare la concorrenza con callbacks?

A) Eseguire tutti i callbacks contemporaneamente  
B) Usare un contatore e una coda per controllare task attivi  
C) Usare solo callbacks sincroni  
D) Non è possibile limitare la concorrenza

### Domanda 8
Quando dovrebbe essere chiamato `process.nextTick()` con i callbacks?

A) Mai, è deprecato  
B) Per eseguire callback sincroni in modo asincrono  
C) Solo per operazioni I/O  
D) Sempre invece di setTimeout

### Domanda 9
Qual è la differenza principale tra callbacks e Promises?

A) Le Promises sono più lente  
B) I callbacks non possono gestire errori  
C) Le Promises permettono chaining e gestione errori più pulita  
D) I callbacks sono deprecati

### Domanda 10
In quale ordine vengono eseguiti questi callbacks?

```javascript
setTimeout(() => console.log('A'), 0);
fs.readFile('file.txt', () => console.log('B'));
process.nextTick(() => console.log('C'));
console.log('D');
```

A) A, B, C, D  
B) D, C, A, B  
C) D, A, B, C  
D) C, D, A, B

---

## Risposte alle Domande di Autovalutazione

**Domanda 1: B**  
"Error-first callback" significa che il primo parametro del callback è sempre riservato all'errore. Se l'operazione ha successo, questo parametro è `null` o `undefined`, e i parametri successivi contengono i risultati. Questa è la convenzione standard in Node.js.

**Domanda 2: C**  
L'opzione C è corretta perché:
1. Il primo parametro è `err` (error-first)
2. Controlla l'errore PRIMA di usare i dati
3. Usa `return` per uscire se c'è un errore
Le altre opzioni hanno problemi: A ha parametri invertiti, B usa i dati prima di controllare l'errore, D usa sintassi Promise non valida per callbacks.

**Domanda 3: B**  
Il "Callback Hell" (o "Pyramid of Doom") si riferisce all'eccessiva nidificazione di callbacks che crea codice che si sposta progressivamente verso destra, formando una struttura piramidale difficile da leggere, debuggare e mantenere.

**Domanda 4: C**  
Usare funzioni nominate e modularizzazione è la migliore soluzione per evitare callback hell. Questo approccio mantiene il codice piatto, leggibile e riutilizzabile. Le moderne alternative includono Promises e async/await.

**Domanda 5: B**  
`util.promisify()` converte una funzione che usa callbacks (con convenzione error-first) in una funzione che ritorna una Promise. Questo facilita la migrazione da codice callback-based a Promise-based.

**Domanda 6: B**  
Il problema è il comportamento misto: se non ci sono dati, il callback viene eseguito sincronamente, altrimenti viene eseguito asincronamente (dopo 100ms). Questo comportamento inconsistente può causare problemi difficili da debuggare. La soluzione è usare `process.nextTick()` per rendere sempre asincrono.

**Domanda 7: B**  
Per limitare la concorrenza con callbacks, si usa un contatore per tracciare i task attivi e una coda per i task in attesa. Quando un task completa, si avvia il prossimo dalla coda mantenendo il numero di task attivi sotto il limite specificato.

**Domanda 8: B**  
`process.nextTick()` dovrebbe essere usato per rendere callbacks sincroni consistentemente asincroni. Questo previene problemi di comportamento misto sincrono/asincrono che possono causare bug sottili e difficili da debuggare.

**Domanda 9: C**  
Le Promises permettono un chaining più pulito (`.then().then()`) e una gestione errori centralizzata (`.catch()`), rendendo il codice più leggibile rispetto ai callbacks nidificati. Entrambi hanno performance simili e i callbacks non sono deprecati, ma le Promises sono preferite per codice moderno.

**Domanda 10: B**  
L'ordine è: D (sincrono), C (process.nextTick - massima priorità nelle microtask), A (setTimeout - fase timers), B (fs.readFile - fase poll). Il codice sincrono viene sempre eseguito per primo, seguito dalle microtask (nextTick), poi le varie fasi dell'Event Loop.

---

## Tips & Tricks Avanzati

### Tip 1: Memoization con Callbacks

```javascript
function memoize(fn) {
    const cache = new Map();
    
    return function(...args) {
        const callback = args.pop();
        const key = JSON.stringify(args);
        
        // Controlla cache
        if (cache.has(key)) {
            console.log('📦 Usando cache per:', key);
            const cachedResult = cache.get(key);
            // Ritorna in modo asincrono per consistenza
            process.nextTick(() => callback(null, cachedResult));
            return;
        }
        
        // Esegui funzione originale
        fn(...args, (err, result) => {
            if (err) {
                callback(err);
                return;
            }
            
            // Salva in cache
            cache.set(key, result);
            callback(null, result);
        });
    };
}

// Uso
function expensiveOperation(x, y, callback) {
    console.log('💰 Operazione costosa:', x, y);
    setTimeout(() => callback(null, x + y), 1000);
}

const memoized = memoize(expensiveOperation);

memoized(5, 3, (err, result) => {
    console.log('Risultato:', result); // Dopo 1 secondo
    
    // Seconda chiamata usa cache
    memoized(5, 3, (err, result) => {
        console.log('Risultato (cached):', result); // Immediato
    });
});

/* Output:
💰 Operazione costosa: 5 3
Risultato: 8
📦 Usando cache per: [5,3]
Risultato (cached): 8
*/
```

### Tip 2: Timeout Wrapper per Callbacks

```javascript
function withTimeout(fn, timeoutMs) {
    return function(...args) {
        const callback = args.pop();
        let completed = false;
        
        // Timer per timeout
        const timer = setTimeout(() => {
            if (!completed) {
                completed = true;
                callback(new Error(`Timeout dopo ${timeoutMs}ms`));
            }
        }, timeoutMs);
        
        // Esegui funzione originale
        fn(...args, (err, ...results) => {
            if (!completed) {
                completed = true;
                clearTimeout(timer);
                callback(err, ...results);
            }
        });
    };
}

// Uso
function slowOperation(data, callback) {
    setTimeout(() => {
        callback(null, 'Risultato: ' + data);
    }, 2000);
}

const timedOperation = withTimeout(slowOperation, 1000);

timedOperation('test', (err, result) => {
    if (err) {
        console.error('⏱️ Timeout:', err.message);
    } else {
        console.log('✓ Successo:', result);
    }
});

// Output: ⏱️ Timeout: Timeout dopo 1000ms
```

### Tip 3: Circuit Breaker Pattern con Callbacks

```javascript
class CircuitBreaker {
    constructor(fn, options = {}) {
        this.fn = fn;
        this.failureThreshold = options.failureThreshold || 5;
        this.successThreshold = options.successThreshold || 2;
        this.timeout = options.timeout || 10000;
        
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failures = 0;
        this.successes = 0;
        this.nextAttempt = Date.now();
    }
    
    execute(...args) {
        const callback = args.pop();
        
        // Controlla stato circuit breaker
        if (this.state === 'OPEN') {
            if (Date.now() < this.nextAttempt) {
                return process.nextTick(() => {
                    callback(new Error('Circuit breaker is OPEN'));
                });
            }
            // Prova a riaprire
            this.state = 'HALF_OPEN';
            console.log('⚡ Circuit breaker: HALF_OPEN');
        }
        
        // Esegui operazione
        this.fn(...args, (err, ...results) => {
            if (err) {
                this.onFailure();
                callback(err);
            } else {
                this.onSuccess();
                callback(null, ...results);
            }
        });
    }
    
    onSuccess() {
        this.failures = 0;
        
        if (this.state === 'HALF_OPEN') {
            this.successes++;
            if (this.successes >= this.successThreshold) {
                this.state = 'CLOSED';
                this.successes = 0;
                console.log('✅ Circuit breaker: CLOSED');
            }
        }
    }
    
    onFailure() {
        this.failures++;
        this.successes = 0;
        
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
            this.nextAttempt = Date.now() + this.timeout;
            console.log('🔴 Circuit breaker: OPEN');
        }
    }
}

// Uso
let callCount = 0;
function unreliableService(data, callback) {
    callCount++;
    // Simula servizio instabile
    if (callCount <= 5) {
        setTimeout(() => callback(new Error('Service unavailable')), 100);
    } else {
        setTimeout(() => callback(null, 'Success: ' + data), 100);
    }
}

const breaker = new CircuitBreaker(unreliableService, {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 5000
});

function makeRequest(i) {
    breaker.execute(`Request ${i}`, (err, result) => {
        if (err) {
            console.log(`❌ Request ${i}:`, err.message);
        } else {
            console.log(`✓ Request ${i}:`, result);
        }
    });
}

// Simula traffico
const interval = setInterval(() => {
    makeRequest(callCount);
    
    if (callCount > 10) {
        clearInterval(interval);
    }
}, 500);
```

### Tip 4: Debounce per Callbacks

```javascript
function debounce(fn, delay) {
    let timeoutId;
    const pending = [];
    
    return function(...args) {
        const callback = args.pop();
        
        // Aggiungi callback alla coda
        pending.push(callback);
        
        // Cancella timeout precedente
        clearTimeout(timeoutId);
        
        // Imposta nuovo timeout
        timeoutId = setTimeout(() => {
            // Esegui funzione una sola volta
            fn(...args, (err, result) => {
                // Notifica tutti i callbacks in attesa
                pending.forEach(cb => cb(err, result));
                pending.length = 0;
            });
        }, delay);
    };
}

// Uso: salvataggio automatico con debounce
function saveToDatabase(data, callback) {
    console.log('💾 Salvando:', data, 'at', new Date().toLocaleTimeString());
    setTimeout(() => callback(null, 'Saved'), 100);
}

const debouncedSave = debounce(saveToDatabase, 1000);

// Simula input utente rapido
console.log('Inizio digitazione...');
debouncedSave('a', (err) => console.log('Callback 1'));
setTimeout(() => debouncedSave('ab', (err) => console.log('Callback 2')), 200);
setTimeout(() => debouncedSave('abc', (err) => console.log('Callback 3')), 400);
setTimeout(() => debouncedSave('abcd', (err) => console.log('Callback 4')), 600);

/* Output:
Inizio digitazione...
(dopo ~1.6 secondi)
💾 Salvando: abcd at [timestamp]
Callback 1
Callback 2
Callback 3
Callback 4
*/
```

### Tip 5: Callback Registry Pattern

```javascript
class CallbackRegistry {
    constructor() {
        this.callbacks = new Map();
        this.nextId = 1;
    }
    
    register(callback) {
        const id = this.nextId++;
        this.callbacks.set(id, {
            callback,
            registeredAt: Date.now(),
            called: false
        });
        return id;
    }
    
    execute(id, ...args) {
        const entry = this.callbacks.get(id);
        
        if (!entry) {
            console.warn(`⚠️ Callback ${id} non trovato`);
            return false;
        }
        
        if (entry.called) {
            console.warn(`⚠️ Callback ${id} già chiamato`);
            return false;
        }
        
        entry.called = true;
        entry.calledAt = Date.now();
        entry.latency = entry.calledAt - entry.registeredAt;
        
        try {
            entry.callback(...args);
            return true;
        } catch (err) {
            console.error(`❌ Errore in callback ${id}:`, err);
            return false;
        }
    }
    
    unregister(id) {
        return this.callbacks.delete(id);
    }
    
    getStats() {
        const all = Array.from(this.callbacks.values());
        const called = all.filter(e => e.called);
        const pending = all.filter(e => !e.called);
        
        return {
            total: all.length,
            called: called.length,
            pending: pending.length,
            avgLatency: called.length > 0
                ? (called.reduce((sum, e) => sum + e.latency, 0) / called.length).toFixed(2) + 'ms'
                : 'N/A'
        };
    }
}

// Uso
const registry = new CallbackRegistry();

function asyncOperation(data, callback) {
    const callbackId = registry.register(callback);
    
    setTimeout(() => {
        const result = data * 2;
        registry.execute(callbackId, null, result);
    }, Math.random() * 1000);
}

// Test
for (let i = 1; i <= 5; i++) {
    asyncOperation(i, (err, result) => {
        console.log(`Risultato ${i}:`, result);
    });
}

setTimeout(() => {
    console.log('\n📊 Statistiche callbacks:');
    console.log(registry.getStats());
}, 1500);
```

### Tip 6: Callback Pool per Riuso

```javascript
class CallbackPool {
    constructor(size) {
        this.pool = [];
        this.size = size;
        this.active = new Set();
    }
    
    acquire() {
        // Riusa callback dal pool se disponibile
        if (this.pool.length > 0) {
            const callback = this.pool.pop();
            this.active.add(callback);
            return callback;
        }
        
        // Crea nuovo callback
        const callback = (...args) => {
            // Logica callback
            callback.lastArgs = args;
            callback.lastCall = Date.now();
        };
        
        callback.reset = () => {
            callback.lastArgs = null;
            callback.lastCall = null;
        };
        
        this.active.add(callback);
        return callback;
    }
    
    release(callback) {
        if (!this.active.has(callback)) {
            return false;
        }
        
        this.active.delete(callback);
        
        // Riusa solo se pool non è pieno
        if (this.pool.length < this.size) {
            callback.reset();
            this.pool.push(callback);
        }
        
        return true;
    }
    
    getStats() {
        return {
            poolSize: this.size,
            available: this.pool.length,
            active: this.active.size,
            total: this.pool.length + this.active.size
        };
    }
}

// Uso
const pool = new CallbackPool(10);

function operazioneAsincrona(data, callback) {
    setTimeout(() => {
        callback(null, data * 2);
        pool.release(callback);
    }, 100);
}

// Riusa callbacks dal pool
for (let i = 0; i < 20; i++) {
    const callback = pool.acquire();
    operazioneAsincrona(i, callback);
}

setTimeout(() => {
    console.log('📊 Pool stats:', pool.getStats());
}, 500);
```

## Antipattern da Evitare

### Antipattern 1: Zalgo (Comportamento Misto Sync/Async)

```javascript
// ❌ MALE: "Releasing Zalgo"
function getData(useCache, callback) {
    if (useCache) {
        // Sincrono!
        callback(null, cachedData);
    } else {
        // Asincrono!
        fs.readFile('data.txt', callback);
    }
}

// Questo causa comportamenti imprevedibili
let data;
getData(true, (err, result) => {
    data = result;
});
console.log(data); // undefined o dati? Dipende!

// ✅ BENE: Sempre asincrono
function getDataCorrect(useCache, callback) {
    if (useCache) {
        process.nextTick(() => callback(null, cachedData));
    } else {
        fs.readFile('data.txt', callback);
    }
}
```

### Antipattern 2: Callback Chiamato Più Volte

```javascript
// ❌ MALE: Callback multipli
function unreliableOperation(callback) {
    fs.readFile('file.txt', (err, data) => {
        if (err) {
            callback(err);
            // BUG: continua l'esecuzione!
        }
        
        // Callback chiamato di nuovo!
        callback(null, data);
    });
}

// ✅ BENE: Garantisce singola chiamata
function reliableOperation(callback) {
    let called = false;
    
    function safeCallback(...args) {
        if (called) {
            console.warn('⚠️ Tentativo di chiamare callback più volte');
            return;
        }
        called = true;
        callback(...args);
    }
    
    fs.readFile('file.txt', (err, data) => {
        if (err) {
            safeCallback(err);
            return; // IMPORTANTE!
        }
        safeCallback(null, data);
    });
}
```

### Antipattern 3: Ignorare gli Errori

```javascript
// ❌ MALE: Errori ignorati
fs.readFile('file.txt', (err, data) => {
    const parsed = JSON.parse(data); // Crash se err!
    console.log(parsed);
});

// ✅ BENE: Gestione errori appropriata
fs.readFile('file.txt', (err, data) => {
    if (err) {
        console.error('Errore lettura:', err.message);
        return;
    }
    
    try {
        const parsed = JSON.parse(data);
        console.log(parsed);
    } catch (parseErr) {
        console.error('Errore parsing:', parseErr.message);
    }
});
```

### Antipattern 4: Callback Nidificati Senza Necessità

```javascript
// ❌ MALE: Nidificazione non necessaria
function processUser(userId, callback) {
    getUser(userId, (err, user) => {
        if (err) return callback(err);
        
        updateUser(user, (err, updated) => {
            if (err) return callback(err);
            
            logAction(updated.id, (err) => {
                if (err) return callback(err);
                callback(null, updated);
            });
        });
    });
}

// ✅ BENE: Funzioni separate
function processUser(userId, callback) {
    getUser(userId, handleUser);
    
    function handleUser(err, user) {
        if (err) return callback(err);
        updateUser(user, handleUpdate);
    }
    
    function handleUpdate(err, updated) {
        if (err) return callback(err);
        logAction(updated.id, (err) => {
            if (err) return callback(err);
            callback(null, updated);
        });
    }
}

// ✅ MEGLIO: Con async/await
async function processUserAsync(userId) {
    const user = await getUserAsync(userId);
    const updated = await updateUserAsync(user);
    await logActionAsync(updated.id);
    return updated;
}
```

### Antipattern 5: Perdita di Contesto (this)

```javascript
// ❌ MALE: Perdita di this
class DataManager {
    constructor() {
        this.data = [];
    }
    
    loadData(callback) {
        fs.readFile('data.json', function(err, content) {
            if (err) return callback(err);
            
            // BUG: this è undefined!
            this.data = JSON.parse(content);
            callback(null, this.data);
        });
    }
}

// ✅ BENE: Arrow function mantiene this
class DataManager {
    constructor() {
        this.data = [];
    }
    
    loadData(callback) {
        fs.readFile('data.json', (err, content) => {
            if (err) return callback(err);
            
            // this è corretto
            this.data = JSON.parse(content);
            callback(null, this.data);
        });
    }
}

// ✅ ALTERNATIVA: bind
class DataManager {
    constructor() {
        this.data = [];
    }
    
    loadData(callback) {
        fs.readFile('data.json', function(err, content) {
            if (err) return callback(err);
            this.data = JSON.parse(content);
            callback(null, this.data);
        }.bind(this)); // bind mantiene this
    }
}
```

