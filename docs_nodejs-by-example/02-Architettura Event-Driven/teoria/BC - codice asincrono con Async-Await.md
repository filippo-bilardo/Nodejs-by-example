# Async/Await in Node.js

## 📚 Obiettivi di Apprendimento

Al termine di questa guida saprai:
- Cos'è async/await e perché semplifica il codice asincrono
- Differenza tra async/await e Promise
- Dichiarare e usare funzioni async
- Gestire errori con try/catch
- Eseguire operazioni in parallelo vs sequenziale
- Pattern avanzati (loop, conditional, timeout)
- Best practices e antipattern comuni
- Debugging e troubleshooting

---

## 🎯 Cos'è Async/Await?

**Async/Await** è la sintassi moderna (ES2017) per lavorare con codice asincrono in JavaScript. Permette di scrivere codice asincrono che **sembra sincrono**, rendendolo più leggibile e manutenibile.

### 📖 Analogia del Mondo Reale

```
☕ ORDINARE AL CAFFÈ

Codice Sincrono Tradizionale:
┌────────────────────────────────┐
│ 1. Ordini caffè                │
│ 2. ASPETTI in fila (BLOCCO)    │ ← Tutto fermo
│ 3. Prendi caffè                │
│ 4. Ordini cornetto             │
│ 5. ASPETTI ancora (BLOCCO)     │ ← Tutto fermo
│ 6. Prendi cornetto             │
└────────────────────────────────┘

Callback Hell:
┌────────────────────────────────┐
│ ordinaCaffè((caffe) => {       │
│   prendi(caffe, () => {        │
│     ordinaCornetto((cornetto) => { │
│       prendi(cornetto, () => { │
│         // finito              │
│       });                      │
│     });                        │
│   });                          │
│ });                            │
└────────────────────────────────┘

Promise con .then():
┌────────────────────────────────┐
│ ordina().then(caffe => {       │
│   prendi(caffe).then(() => {   │
│     ordina().then(cornetto =>{ │
│       prendi(cornetto)         │ ← Callback nidificati
│     })                         │
│   })                           │
│ })                             │
└────────────────────────────────┘

Async/Await (PULITO):
┌────────────────────────────────┐
│ const caffe = await ordina()   │ ← Leggibile!
│ prendi(caffe)                  │
│ const cornetto = await ordina()│
│ prendi(cornetto)               │
└────────────────────────────────┘
```

### 🔄 Evoluzione del Codice Asincrono

```javascript
// ❌ CALLBACK HELL (2009)
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

// ⚠️ PROMISE CHAINING (ES6 - 2015)
const fs = require('fs').promises;

fs.readFile('file1.txt', 'utf8')
    .then(data1 => {
        console.log(data1);
        return fs.readFile('file2.txt', 'utf8');
    })
    .then(data2 => {
        console.log(data2);
        return fs.readFile('file3.txt', 'utf8');
    })
    .then(data3 => {
        console.log(data3);
    })
    .catch(err => {
        console.error('Error:', err);
    });

// ✅✅ ASYNC/AWAIT (ES2017 - Oggi)
async function readFiles() {
    try {
        const data1 = await fs.readFile('file1.txt', 'utf8');
        console.log(data1);
        
        const data2 = await fs.readFile('file2.txt', 'utf8');
        console.log(data2);
        
        const data3 = await fs.readFile('file3.txt', 'utf8');
        console.log(data3);
    } catch (err) {
        console.error('Error:', err);
    }
}

readFiles();
```

---

## 🏗️ Sintassi Base

### La Keyword `async`

Una funzione dichiarata con `async` **ritorna sempre una Promise**.

```javascript
// Dichiarazione tradizionale
async function myFunction() {
    return 'Hello';
}

// Arrow function
const myArrowFunction = async () => {
    return 'Hello';
};

// Method in oggetto
const obj = {
    async myMethod() {
        return 'Hello';
    }
};

// Method in classe
class MyClass {
    async myMethod() {
        return 'Hello';
    }
}
```

### La Keyword `await`

`await` può essere usata **solo dentro funzioni async** e mette in pausa l'esecuzione fino a quando la Promise si risolve.

```javascript
async function example() {
    // await aspetta che la Promise si risolva
    const result = await somePromise();
    console.log(result);
}
```

### 💻 Esempi Base

#### 1. Funzione Async Semplice

```javascript
// Funzione async ritorna sempre Promise
async function greet() {
    return 'Hello World!';
}

// Equivalente a:
function greet() {
    return Promise.resolve('Hello World!');
}

// Uso
greet().then(message => console.log(message));
// Output: Hello World!

// O con await
async function main() {
    const message = await greet();
    console.log(message); // Hello World!
}

main();
```

#### 2. Await con Promise

```javascript
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function example() {
    console.log('Start');
    
    await delay(1000); // Aspetta 1 secondo
    console.log('After 1 second');
    
    await delay(2000); // Aspetta altri 2 secondi
    console.log('After 3 seconds total');
}

example();
```

#### 3. Await con Valore di Ritorno

```javascript
function fetchUser(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id, name: 'Mario Rossi', age: 30 });
        }, 1000);
    });
}

async function getUserInfo() {
    console.log('Fetching user...');
    
    const user = await fetchUser(1);
    
    console.log('User:', user.name);
    console.log('Age:', user.age);
    
    return user;
}

getUserInfo();
// Output:
// Fetching user...
// (dopo 1 sec)
// User: Mario Rossi
// Age: 30
```

#### 4. Multiple Await

```javascript
async function processData() {
    const data1 = await fetchData1(); // Aspetta
    console.log('Data 1:', data1);
    
    const data2 = await fetchData2(); // Aspetta
    console.log('Data 2:', data2);
    
    const data3 = await fetchData3(); // Aspetta
    console.log('Data 3:', data3);
    
    return [data1, data2, data3];
}
```

---

## ⚠️ Gestione Errori

### Try/Catch

Il modo standard per gestire errori in async/await è **try/catch**.

```javascript
async function example() {
    try {
        const result = await riskyOperation();
        console.log('Success:', result);
    } catch (err) {
        console.error('Error:', err.message);
    }
}
```

### 💻 Esempi Gestione Errori

#### 1. Try/Catch Base

```javascript
async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (err) {
        console.error('Fetch failed:', err.message);
        throw err; // Re-throw se necessario
    }
}
```

#### 2. Try/Catch con Finally

```javascript
async function loadData() {
    let loading = true;
    
    try {
        const data = await fetchData();
        console.log('Data loaded:', data);
        return data;
        
    } catch (err) {
        console.error('Error loading data:', err);
        return null; // Fallback value
        
    } finally {
        loading = false; // Sempre eseguito
        console.log('Loading complete');
    }
}
```

#### 3. Multiple Try/Catch

```javascript
async function processAllData() {
    let user = null;
    let posts = null;
    
    // Gestisci errori separatamente
    try {
        user = await fetchUser();
    } catch (err) {
        console.error('User fetch failed:', err);
        user = { id: 0, name: 'Guest' }; // Fallback
    }
    
    try {
        posts = await fetchPosts(user.id);
    } catch (err) {
        console.error('Posts fetch failed:', err);
        posts = []; // Fallback
    }
    
    return { user, posts };
}
```

#### 4. Catch per Promise Specifica

```javascript
async function example() {
    // Catch inline per Promise specifica
    const data = await fetchData().catch(err => {
        console.error('Fetch error:', err);
        return { default: true }; // Fallback
    });
    
    console.log('Data:', data);
}
```

#### 5. Error Helper Function

```javascript
// Helper per gestire errori consistentemente
async function handleAsync(promise) {
    try {
        const data = await promise;
        return [null, data]; // [error, data]
    } catch (err) {
        return [err, null];
    }
}

// Uso
async function example() {
    const [err, user] = await handleAsync(fetchUser(1));
    
    if (err) {
        console.error('Error:', err);
        return;
    }
    
    console.log('User:', user);
}
```

---

## 🔀 Esecuzione Sequenziale vs Parallela

### ⚠️ Sequenziale (Lento)

```javascript
// ❌ LENTO: Esecuzione sequenziale
async function loadDataSequential() {
    const user = await fetchUser();      // Aspetta 1s
    const posts = await fetchPosts();    // Aspetta 1s
    const comments = await fetchComments(); // Aspetta 1s
    
    return { user, posts, comments };
}
// Tempo totale: ~3 secondi

console.time('Sequential');
await loadDataSequential();
console.timeEnd('Sequential');
// Sequential: 3000ms
```

### ✅ Parallelo (Veloce)

```javascript
// ✅ VELOCE: Esecuzione parallela
async function loadDataParallel() {
    // Avvia tutte le Promise contemporaneamente
    const [user, posts, comments] = await Promise.all([
        fetchUser(),
        fetchPosts(),
        fetchComments()
    ]);
    
    return { user, posts, comments };
}
// Tempo totale: ~1 secondo (max delle tre)

console.time('Parallel');
await loadDataParallel();
console.timeEnd('Parallel');
// Parallel: 1000ms
```

### 💻 Esempi Confronto

#### 1. Pattern Sbagliato vs Corretto

```javascript
// ❌ SBAGLIATO: await inutile
async function badPattern() {
    const promise1 = fetchData1();
    const result1 = await promise1; // Aspetta
    
    const promise2 = fetchData2();
    const result2 = await promise2; // Aspetta
    
    return [result1, result2];
}
// Tempo: t1 + t2 (sequenziale)

// ✅ CORRETTO: Promise.all per parallelismo
async function goodPattern() {
    const [result1, result2] = await Promise.all([
        fetchData1(),
        fetchData2()
    ]);
    
    return [result1, result2];
}
// Tempo: max(t1, t2) (parallelo)
```

#### 2. Dipendenze Sequenziali

```javascript
// Quando i dati dipendono l'uno dall'altro
async function fetchWithDependencies() {
    // 1. Fetch user (deve essere prima)
    const user = await fetchUser(1);
    
    // 2. Fetch posts dell'user (dipende da user.id)
    const posts = await fetchPosts(user.id);
    
    // 3. Fetch comments del primo post (dipende da posts[0].id)
    const comments = await fetchComments(posts[0].id);
    
    return { user, posts, comments };
}
// Qui il sequenziale è NECESSARIO
```

#### 3. Mix Sequenziale e Parallelo

```javascript
async function smartFetch() {
    // Step 1: Fetch user (sequenziale, necessario)
    const user = await fetchUser(1);
    
    // Step 2: Fetch posts E settings in parallelo (entrambi dipendono da user)
    const [posts, settings] = await Promise.all([
        fetchPosts(user.id),
        fetchSettings(user.id)
    ]);
    
    // Step 3: Fetch comments in parallelo per ogni post
    const commentsPromises = posts.map(post => fetchComments(post.id));
    const allComments = await Promise.all(commentsPromises);
    
    return { user, posts, settings, allComments };
}
```

---

## 🔁 Pattern Comuni

### Pattern 1: Delay Utility

```javascript
// Utility per delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Uso
async function example() {
    console.log('Start');
    await delay(1000);
    console.log('After 1 second');
    await delay(2000);
    console.log('After 3 seconds total');
}
```

### Pattern 2: Retry Logic

```javascript
// Retry automatico con exponential backoff
async function retry(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt === maxRetries) {
                throw new Error(`Failed after ${maxRetries} attempts: ${err.message}`);
            }
            
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.log(`Retry ${attempt}/${maxRetries} after ${delay}ms...`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Uso
async function example() {
    try {
        const data = await retry(() => fetchData(), 3, 1000);
        console.log('Success:', data);
    } catch (err) {
        console.error('All retries failed:', err);
    }
}
```

### Pattern 3: Timeout

```javascript
// Timeout per async operations
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        })
    ]);
}

// Uso
async function example() {
    try {
        const data = await withTimeout(
            fetchSlowData(),
            5000 // Timeout 5 secondi
        );
        console.log('Data:', data);
    } catch (err) {
        console.error('Error:', err.message);
    }
}
```

### Pattern 4: Loop con Async/Await

```javascript
// ❌ SBAGLIATO: forEach non aspetta
async function badLoop(ids) {
    ids.forEach(async (id) => {
        const data = await fetchData(id); // Non aspetta!
        console.log(data);
    });
    console.log('Done'); // Eseguito PRIMA dei fetch!
}

// ✅ CORRETTO: for...of aspetta
async function goodLoop(ids) {
    for (const id of ids) {
        const data = await fetchData(id); // Aspetta
        console.log(data);
    }
    console.log('Done'); // Eseguito DOPO tutti i fetch
}

// ✅ PARALLELO: map + Promise.all
async function parallelLoop(ids) {
    const promises = ids.map(id => fetchData(id));
    const results = await Promise.all(promises);
    
    results.forEach(data => console.log(data));
    console.log('Done');
}
```

### Pattern 5: Conditional Async

```javascript
async function conditionalFetch(useCache) {
    let data;
    
    if (useCache && cachedData) {
        // Operazione sincrona
        data = cachedData;
    } else {
        // Operazione asincrona
        data = await fetchData();
        cachedData = data;
    }
    
    return data;
}
```

### Pattern 6: Sequential Batch Processing

```javascript
// Processa items in batch sequenziali
async function processBatch(items, batchSize = 10) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        console.log(`Processing batch ${i / batchSize + 1}...`);
        
        // Processa batch in parallelo
        const batchResults = await Promise.all(
            batch.map(item => processItem(item))
        );
        
        results.push(...batchResults);
        
        // Aspetta un po' tra i batch (rate limiting)
        if (i + batchSize < items.length) {
            await delay(1000);
        }
    }
    
    return results;
}
```

### Pattern 7: Promise Pool (Concurrency Limit)

```javascript
// Limita numero di Promise concorrenti
async function promisePool(tasks, poolLimit = 3) {
    const results = [];
    const executing = [];
    
    for (const task of tasks) {
        const promise = Promise.resolve().then(() => task());
        results.push(promise);
        
        if (poolLimit <= tasks.length) {
            const execute = promise.then(() => {
                executing.splice(executing.indexOf(execute), 1);
            });
            executing.push(execute);
            
            if (executing.length >= poolLimit) {
                await Promise.race(executing);
            }
        }
    }
    
    return Promise.all(results);
}

// Uso
const tasks = Array.from({ length: 20 }, (_, i) => 
    () => fetchData(i)
);

await promisePool(tasks, 3); // Max 3 concorrenti
```

---

## 🔄 Async/Await con Array Methods

### map()

```javascript
// ❌ SBAGLIATO: map ritorna array di Promise
async function badMap(ids) {
    const users = ids.map(async (id) => {
        return await fetchUser(id);
    });
    
    console.log(users); // [Promise, Promise, Promise]
    return users; // ❌ Non quello che vuoi!
}

// ✅ CORRETTO: Usa Promise.all
async function goodMap(ids) {
    const promises = ids.map(id => fetchUser(id));
    const users = await Promise.all(promises);
    
    console.log(users); // [User, User, User]
    return users; // ✅ Corretto!
}

// ✅ ALTERNATIVA: for...of
async function alternativeMap(ids) {
    const users = [];
    
    for (const id of ids) {
        const user = await fetchUser(id);
        users.push(user);
    }
    
    return users;
}
```

### filter()

```javascript
// Filter asincrono
async function asyncFilter(array, predicate) {
    const results = await Promise.all(
        array.map(predicate)
    );
    
    return array.filter((_, index) => results[index]);
}

// Uso
const numbers = [1, 2, 3, 4, 5];

const filtered = await asyncFilter(numbers, async (num) => {
    const result = await checkIfEven(num);
    return result;
});

console.log(filtered); // [2, 4]
```

### reduce()

```javascript
// Reduce sequenziale con async
async function asyncReduce(array, reducer, initialValue) {
    let accumulator = initialValue;
    
    for (const item of array) {
        accumulator = await reducer(accumulator, item);
    }
    
    return accumulator;
}

// Uso
const urls = ['url1', 'url2', 'url3'];

const totalSize = await asyncReduce(
    urls,
    async (total, url) => {
        const size = await fetchSize(url);
        return total + size;
    },
    0
);

console.log('Total size:', totalSize);
```

### forEach() - ⚠️ NON USARE!

```javascript
// ❌ PERICOLOSO: forEach NON aspetta async
async function dangerousForEach(ids) {
    console.log('Start');
    
    ids.forEach(async (id) => {
        const data = await fetchData(id);
        console.log('Data:', data);
    });
    
    console.log('End'); // Eseguito PRIMA dei log dei dati!
}

// ✅ USA for...of invece
async function safeForOf(ids) {
    console.log('Start');
    
    for (const id of ids) {
        const data = await fetchData(id);
        console.log('Data:', data);
    }
    
    console.log('End'); // Eseguito DOPO tutti i dati
}
```

---

## ⚠️ Errori Comuni e Antipattern

### ❌ 1. Dimenticare `await`

```javascript
// ❌ SBAGLIATO: Manca await
async function bad() {
    const result = fetchData(); // Ritorna Promise, non dati!
    console.log(result); // Promise { <pending> }
}

// ✅ CORRETTO: Usa await
async function good() {
    const result = await fetchData();
    console.log(result); // Dati effettivi
}
```

### ❌ 2. Dimenticare `async`

```javascript
// ❌ ERRORE: await senza async
function bad() {
    const result = await fetchData(); // SyntaxError!
    return result;
}

// ✅ CORRETTO: Aggiungi async
async function good() {
    const result = await fetchData();
    return result;
}
```

### ❌ 3. Await in Loop (Performance)

```javascript
// ❌ LENTO: await in loop (sequenziale)
async function slow(ids) {
    const results = [];
    
    for (const id of ids) {
        const data = await fetchData(id); // Aspetta ogni volta
        results.push(data);
    }
    
    return results;
}
// Tempo: t1 + t2 + t3 + ...

// ✅ VELOCE: Promise.all (parallelo)
async function fast(ids) {
    const results = await Promise.all(
        ids.map(id => fetchData(id))
    );
    
    return results;
}
// Tempo: max(t1, t2, t3, ...)
```

### ❌ 4. Try/Catch Troppo Ampio

```javascript
// ❌ CATTIVA PRATICA: catch cattura tutto
async function bad() {
    try {
        const user = await fetchUser();
        const posts = await fetchPosts();
        const comments = await fetchComments();
        
        processData(user); // Se questa lancia errore, viene catturato!
        
        return { user, posts, comments };
    } catch (err) {
        console.error('Fetch error:', err); // Fuorviante!
    }
}

// ✅ MIGLIORE: try/catch specifico
async function good() {
    let user, posts, comments;
    
    try {
        user = await fetchUser();
        posts = await fetchPosts();
        comments = await fetchComments();
    } catch (err) {
        console.error('Fetch error:', err);
        throw err;
    }
    
    // Elaborazione fuori dal try/catch
    processData(user);
    
    return { user, posts, comments };
}
```

### ❌ 5. Async senza Await

```javascript
// ❌ INUTILE: async senza await
async function pointless() {
    return 42; // Non serve async qui
}

// ✅ NORMALE: Usa funzione normale
function normal() {
    return 42;
}

// O se ritorna Promise
function normalPromise() {
    return Promise.resolve(42);
}
```

### ❌ 6. Return await (Ridondante)

```javascript
// ❌ RIDONDANTE: return await
async function redundant() {
    return await fetchData(); // await inutile
}

// ✅ PULITO: return diretto
async function clean() {
    return fetchData(); // Già ritorna Promise
}

// ⚠️ ECCEZIONE: Con try/catch
async function withCatch() {
    try {
        return await fetchData(); // Qui await è necessario
    } catch (err) {
        console.error(err);
        throw err;
    }
}
```

### ❌ 7. Unhandled Promise Rejection

```javascript
// ❌ PERICOLOSO: Promise rejection non gestita
async function dangerous() {
    const data = await fetchData(); // Se fallisce...
    return data;
}

dangerous(); // ⚠️ Unhandled rejection!

// ✅ GESTISCI ERRORI
async function safe() {
    try {
        const data = await fetchData();
        return data;
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}

// O cattura all'uso
safe().catch(err => {
    console.error('Caught:', err);
});
```

---

## 🎯 Best Practices

### ✅ 1. Sempre Gestire Errori

```javascript
// ✅ Try/catch per async functions
async function example() {
    try {
        const result = await riskyOperation();
        return result;
    } catch (err) {
        console.error('Error:', err);
        // Gestisci o re-throw
        throw err;
    }
}

// ✅ Catch quando chiami
example().catch(err => {
    console.error('Caught:', err);
});
```

### ✅ 2. Usa Promise.all() per Parallelismo

```javascript
// ✅ Operazioni indipendenti in parallelo
async function loadData() {
    const [user, posts, comments] = await Promise.all([
        fetchUser(),
        fetchPosts(),
        fetchComments()
    ]);
    
    return { user, posts, comments };
}
```

### ✅ 3. Evita await in Loop (Se Possibile)

```javascript
// ❌ Lento
async function slow() {
    for (const id of ids) {
        await processItem(id);
    }
}

// ✅ Veloce (se items indipendenti)
async function fast() {
    await Promise.all(
        ids.map(id => processItem(id))
    );
}
```

### ✅ 4. Nome Funzioni Descrittivi

```javascript
// ❌ Nome generico
async function getData() { }

// ✅ Nome descrittivo
async function fetchUserProfile() { }
async function loadDashboardData() { }
async function saveUserSettings() { }
```

### ✅ 5. Early Return per Validazione

```javascript
// ✅ Early return per validazione
async function processUser(userId) {
    if (!userId) {
        throw new Error('User ID is required');
    }
    
    const user = await fetchUser(userId);
    
    if (!user) {
        throw new Error('User not found');
    }
    
    return processUserData(user);
}
```

### ✅ 6. Timeout per Operazioni Lunghe

```javascript
// ✅ Aggiungi timeout
async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}
```

### ✅ 7. Logging e Monitoring

```javascript
// ✅ Log per debugging
async function fetchData(id) {
    console.log(`[${new Date().toISOString()}] Fetching data for ID: ${id}`);
    
    try {
        const data = await apiCall(id);
        console.log(`[${new Date().toISOString()}] Success for ID: ${id}`);
        return data;
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Error for ID: ${id}:`, err);
        throw err;
    }
}
```

---

## 🔍 Debugging Async/Await

### Stack Traces

```javascript
// Async/await ha stack traces migliori rispetto a Promise

// Promise (stack trace confuso)
function promiseVersion() {
    return fetchData()
        .then(data => processData(data))
        .then(result => saveResult(result));
}

// Async/await (stack trace chiaro)
async function asyncVersion() {
    const data = await fetchData();
    const result = await processData(data);
    await saveResult(result);
}
// ✅ L'errore mostra esattamente quale linea ha fallito
```

### Console Logging

```javascript
// ✅ Log intermedi per debugging
async function debugExample() {
    console.log('1. Starting...');
    
    const user = await fetchUser();
    console.log('2. User fetched:', user);
    
    const posts = await fetchPosts(user.id);
    console.log('3. Posts fetched:', posts.length);
    
    const processed = processData(posts);
    console.log('4. Data processed:', processed);
    
    return processed;
}
```

### Performance Monitoring

```javascript
// ✅ Misura performance
async function monitorPerformance() {
    console.time('Total operation');
    
    console.time('Fetch user');
    const user = await fetchUser();
    console.timeEnd('Fetch user');
    
    console.time('Fetch posts');
    const posts = await fetchPosts(user.id);
    console.timeEnd('Fetch posts');
    
    console.timeEnd('Total operation');
    
    return { user, posts };
}

// Output:
// Fetch user: 234.567ms
// Fetch posts: 456.789ms
// Total operation: 691.356ms
```

---

## 🧪 Quiz di Autovalutazione

### Domanda 1: Ritorno Funzione Async

```javascript
async function test() {
    return 42;
}

const result = test();
console.log(result);

// Cosa viene stampato?
```

<details>
<summary>Mostra risposta</summary>

```
Promise { 42 }
```

**Spiegazione:** Le funzioni `async` ritornano **sempre** una Promise, anche se il valore ritornato è semplice.

**Corretto:**
```javascript
async function test() {
    return 42;
}

test().then(result => {
    console.log(result); // 42
});

// O con await
const result = await test();
console.log(result); // 42
```

</details>

### Domanda 2: Await Senza Async

```javascript
function test() {
    const data = await fetchData();
    return data;
}

// Questo codice funziona?
```

<details>
<summary>Mostra risposta</summary>

**NO! SyntaxError**

`await` può essere usato **solo** dentro funzioni `async`.

**Corretto:**
```javascript
async function test() {
    const data = await fetchData();
    return data;
}
```

**Eccezione:** Top-level await (ES2022) nei moduli:
```javascript
// In un ES module
const data = await fetchData(); // ✅ OK
```

</details>

### Domanda 3: Ordine Esecuzione

```javascript
async function test() {
    console.log('1');
    
    const p = fetchData();
    console.log('2');
    
    const result = await p;
    console.log('3');
}

test();
console.log('4');

// Ordine output?
```

<details>
<summary>Mostra risposta</summary>

```
1
2
4
3
```

**Spiegazione:**
1. `'1'` - eseguito subito
2. `fetchData()` avviato (non aspetta)
3. `'2'` - eseguito subito
4. `'4'` - codice fuori dalla funzione async (sincrono)
5. `'3'` - eseguito dopo che `await p` si risolve

</details>

### Domanda 4: forEach con Async

```javascript
async function test() {
    const ids = [1, 2, 3];
    
    console.log('Start');
    
    ids.forEach(async (id) => {
        await processItem(id);
        console.log(`Processed ${id}`);
    });
    
    console.log('End');
}

// Ordine output?
```

<details>
<summary>Mostra risposta</summary>

```
Start
End
Processed 1
Processed 2
Processed 3
```

**Problema:** `forEach` **NON aspetta** le funzioni async!

**Corretto con for...of:**
```javascript
async function test() {
    const ids = [1, 2, 3];
    
    console.log('Start');
    
    for (const id of ids) {
        await processItem(id);
        console.log(`Processed ${id}`);
    }
    
    console.log('End');
}

// Output:
// Start
// Processed 1
// Processed 2
// Processed 3
// End
```

</details>

### Domanda 5: Promise.all Timing

```javascript
async function test() {
    console.time('Sequential');
    await delay(1000);
    await delay(1000);
    await delay(1000);
    console.timeEnd('Sequential');
    
    console.time('Parallel');
    await Promise.all([
        delay(1000),
        delay(1000),
        delay(1000)
    ]);
    console.timeEnd('Parallel');
}

// Tempi approssimativi?
```

<details>
<summary>Mostra risposta</summary>

```
Sequential: ~3000ms
Parallel: ~1000ms
```

**Spiegazione:**
- **Sequential:** Ogni `await` aspetta il precedente (1s + 1s + 1s = 3s)
- **Parallel:** `Promise.all` esegue tutte contemporaneamente (max(1s, 1s, 1s) = 1s)

</details>

### Domanda 6: Error Handling

```javascript
async function test() {
    try {
        await Promise.reject(new Error('Oops!'));
        console.log('After error');
    } catch (err) {
        console.log('Caught:', err.message);
    }
    
    console.log('End');
}

test();

// Output?
```

<details>
<summary>Mostra risposta</summary>

```
Caught: Oops!
End
```

**Spiegazione:** Il `try/catch` cattura l'errore dalla Promise rejected, poi l'esecuzione continua con `'End'`.

</details>

---

## 💪 Esercizi Pratici

### Esercizio 1: Convertire Promise Chain in Async/Await

Converti questo codice da Promise chain ad async/await:

```javascript
function getUserData(userId) {
    return fetchUser(userId)
        .then(user => {
            return fetchPosts(user.id)
                .then(posts => {
                    return fetchComments(posts[0].id)
                        .then(comments => {
                            return { user, posts, comments };
                        });
                });
        })
        .catch(err => {
            console.error('Error:', err);
            throw err;
        });
}
```

<details>
<summary>Soluzione</summary>

```javascript
async function getUserData(userId) {
    try {
        const user = await fetchUser(userId);
        const posts = await fetchPosts(user.id);
        const comments = await fetchComments(posts[0].id);
        
        return { user, posts, comments };
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}

// ✅ Molto più leggibile!
```

</details>

### Esercizio 2: Implementare Retry con Async/Await

Implementa una funzione retry che riprova un'operazione fino a 3 volte.

<details>
<summary>Soluzione</summary>

```javascript
async function retry(fn, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries}...`);
            return await fn();
        } catch (err) {
            console.error(`Attempt ${attempt} failed:`, err.message);
            lastError = err;
            
            if (attempt < maxRetries) {
                const waitTime = delay * Math.pow(2, attempt - 1);
                console.log(`Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError.message}`);
}

// Test
async function flakeyOperation() {
    if (Math.random() > 0.7) {
        return 'Success!';
    }
    throw new Error('Random failure');
}

retry(flakeyOperation, 3, 1000)
    .then(result => console.log('Result:', result))
    .catch(err => console.error('Final error:', err.message));
```

</details>

### Esercizio 3: Parallel vs Sequential Comparison

Crea una funzione che confronta i tempi di esecuzione parallela vs sequenziale.

<details>
<summary>Soluzione</summary>

```javascript
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchData(id, delayMs = 1000) {
    await delay(delayMs);
    return { id, data: `Data for ${id}` };
}

async function compareExecution(ids) {
    console.log('\n=== Sequential Execution ===');
    console.time('Sequential');
    
    const sequentialResults = [];
    for (const id of ids) {
        const data = await fetchData(id);
        sequentialResults.push(data);
        console.log(`Fetched: ${id}`);
    }
    
    console.timeEnd('Sequential');
    
    console.log('\n=== Parallel Execution ===');
    console.time('Parallel');
    
    const parallelResults = await Promise.all(
        ids.map(id => fetchData(id))
    );
    
    console.timeEnd('Parallel');
    
    console.log('\n=== Results ===');
    console.log('Sequential:', sequentialResults.length, 'items');
    console.log('Parallel:', parallelResults.length, 'items');
}

// Test
const ids = [1, 2, 3, 4, 5];
compareExecution(ids);

// Output:
// === Sequential Execution ===
// Fetched: 1
// Fetched: 2
// Fetched: 3
// Fetched: 4
// Fetched: 5
// Sequential: ~5000ms
//
// === Parallel Execution ===
// Parallel: ~1000ms
//
// === Results ===
// Sequential: 5 items
// Parallel: 5 items
```

</details>

### Esercizio 4: Async Map/Filter/Reduce

Implementa versioni async di map, filter, e reduce.

<details>
<summary>Soluzione</summary>

```javascript
// Async Map
async function asyncMap(array, asyncFn) {
    const promises = array.map(asyncFn);
    return Promise.all(promises);
}

// Async Filter
async function asyncFilter(array, asyncPredicate) {
    const results = await Promise.all(
        array.map(asyncPredicate)
    );
    return array.filter((_, index) => results[index]);
}

// Async Reduce
async function asyncReduce(array, asyncReducer, initialValue) {
    let accumulator = initialValue;
    
    for (const item of array) {
        accumulator = await asyncReducer(accumulator, item);
    }
    
    return accumulator;
}

// Test
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function test() {
    const numbers = [1, 2, 3, 4, 5];
    
    // Async Map: moltiplica per 2
    const doubled = await asyncMap(numbers, async (n) => {
        await delay(100);
        return n * 2;
    });
    console.log('Doubled:', doubled); // [2, 4, 6, 8, 10]
    
    // Async Filter: solo pari
    const evens = await asyncFilter(numbers, async (n) => {
        await delay(100);
        return n % 2 === 0;
    });
    console.log('Evens:', evens); // [2, 4]
    
    // Async Reduce: somma
    const sum = await asyncReduce(
        numbers,
        async (acc, n) => {
            await delay(100);
            return acc + n;
        },
        0
    );
    console.log('Sum:', sum); // 15
}

test();
```

</details>

---

## 📚 Risorse Aggiuntive

### 📖 Documentazione

- [MDN - async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN - await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
- [JavaScript.info - Async/await](https://javascript.info/async-await)

### 📝 Articoli

- [Async/Await Best Practices](https://gist.github.com/slikts/dee3702357765dda3d484d8888d3029e)
- [6 Reasons Why JavaScript's Async/Await Blows Promises Away](https://hackernoon.com/6-reasons-why-javascripts-async-await-blows-promises-away-tutorial-c7ec10518dd9)
- [How to use async functions with Array.map](https://advancedweb.hu/how-to-use-async-functions-with-array-map-in-javascript/)

### 🎥 Video

- [Async JS Crash Course - Callbacks, Promises, Async Await](https://www.youtube.com/watch?v=PoRJizFvM7s)
- [The Async Await Episode I Promised](https://www.youtube.com/watch?v=vn3tm0quoqE)

---

## 🎯 Riepilogo Chiave

### ✅ Concetti Fondamentali

1. **Async Functions**
   - Dichiarate con `async`
   - Ritornano sempre Promise
   - Permettono uso di `await`

2. **Await Keyword**
   - Pausa esecuzione fino a risoluzione Promise
   - Solo in funzioni async (o top-level module)
   - Unwrap automatico del valore

3. **Error Handling**
   - `try/catch` per gestire errori
   - `finally` per cleanup
   - Stack traces migliori

4. **Performance**
   - Sequential: await in loop (lento)
   - Parallel: Promise.all (veloce)
   - Mix: dipende dalle dipendenze

### 📊 Confronto Sintassi

| Promise | Async/Await |
|---------|-------------|
| `.then()` | `await` |
| `.catch()` | `try/catch` |
| `.finally()` | `finally` |
| Chaining verbose | Codice lineare |
| Return promise | Return valore |

### 🚀 Best Practices

| ✅ DO | ❌ DON'T |
|-------|----------|
| Usa async/await per leggibilità | Non dimenticare await |
| try/catch per errori | Non catch tutto insieme |
| Promise.all per parallelismo | Non await in forEach |
| Early return per validazione | Non async senza await |
| Nome funzioni descrittivi | Non ignorare unhandled rejection |

### 🎯 Pattern Comuni

```javascript
// 1. Delay
const delay = ms => new Promise(r => setTimeout(r, ms));
await delay(1000);

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

// 4. Parallel
const results = await Promise.all(items.map(item => process(item)));

// 5. Sequential
for (const item of items) {
    await process(item);
}
```

---

**🎓 Congratulazioni!** Ora padroneggi **Async/Await** in JavaScript!

**💡 Ricorda:**
- 🎯 Async/await = Promise con sintassi pulita
- ⚡ Promise.all() per parallelismo
- 🛡️ Sempre gestire errori con try/catch
- 🚀 Migliora leggibilità e debugging
