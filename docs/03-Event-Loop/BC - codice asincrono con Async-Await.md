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

> **💡 Teoria: Async/Await - Sintassi Moderna per Codice Asincrono**
>
> **Async/Await** è la sintassi moderna (ES2017) per lavorare con codice asincrono
> in JavaScript. Rappresenta **syntactic sugar** sopra le Promise, rendendo il codice
> asincrono simile a codice sincrono.
>
> **Vantaggi chiave:**
> 1. **Leggibilità**: Codice asincrono che sembra sincrono
> 2. **Manutenibilità**: Più facile capire il flusso di esecuzione
> 3. **Debugging**: Stack traces più chiari e comprensibili
> 4. **Error handling**: try/catch naturale invece di .catch()
> 5. **Composizione**: Più facile combinare operazioni asincrone
>
> **Quando è stato introdotto:**
> - **ES2017 (ES8)**: Async/await diventa standard
> - **Node.js 7.6+**: Supporto nativo senza flag
> - **Oggi**: Standard de facto per codice asincrono moderno
>
> **Come funziona sotto:**
> ```javascript
> // Questo codice async/await:
> async function example() {
>     const result = await fetchData();
>     return result;
> }
>
> // È equivalente a:
> function example() {
>     return fetchData()
>         .then(result => result);
> }
> ```
>
> **Async/Await NON è:**
> - ❌ Un nuovo threading model (JavaScript resta single-threaded)
> - ❌ Un sostituto delle Promise (le usa internamente)
> - ❌ Codice veramente sincrono (è ancora asincrono)
> - ❌ Sempre la soluzione migliore (Promise.all ancora necessario)

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

#### 2. Await con Promise - Execution Flow Dettagliato

```javascript
// Helper: Crea Promise che si risolve dopo delay
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

/*
📊 EXECUTION TIMELINE:

Time    Event
────────────────────────────────────────
0ms     'Start' logged
0ms     await delay(1000) ← PAUSE
        (event loop libero, può processare altro)
1000ms  Promise resolved ← RESUME
1000ms  'After 1 second' logged
1000ms  await delay(2000) ← PAUSE
3000ms  Promise resolved ← RESUME
3000ms  'After 3 seconds total' logged
3000ms  Function completes
*/

async function example() {
    console.log('Start');  // Eseguito immediatamente
    
    // await pausa l'esecuzione per 1 secondo
    await delay(1000); // ⏸️ PAUSE: Aspetta 1 secondo
    console.log('After 1 second');  // Eseguito dopo 1000ms
    
    // await pausa di nuovo per 2 secondi
    await delay(2000); // ⏸️ PAUSE: Aspetta altri 2 secondi
    console.log('After 3 seconds total');  // Eseguito dopo 3000ms totali
}

example();

// 🧪 Test con timing preciso
async function demonstrateWithTiming() {
    const startTime = Date.now();
    
    console.log(`[${Date.now() - startTime}ms] Start`);
    
    await delay(1000);
    console.log(`[${Date.now() - startTime}ms] After 1 second`);
    
    await delay(2000);
    console.log(`[${Date.now() - startTime}ms] After 3 seconds total`);
}

demonstrateWithTiming();

// Output:
// [0ms] Start
// [1002ms] After 1 second
// [3005ms] After 3 seconds total
```

#### 3. Await con Valore di Ritorno - Simulazione API Realistica

```javascript
// Simula chiamata API con delay realistico
function fetchUser(id) {
    return new Promise((resolve) => {
        // Simula latenza di rete (500-1500ms)
        const latency = 500 + Math.random() * 1000;
        
        setTimeout(() => {
            // Ritorna oggetto utente
            resolve({ 
                id, 
                name: 'Mario Rossi', 
                age: 30,
                email: 'mario.rossi@example.com',
                fetchedAt: new Date().toISOString()
            });
        }, latency);
    });
}

async function getUserInfo() {
    console.log('🔍 Fetching user...');
    const startTime = Date.now();
    
    // await aspetta che fetchUser completi
    // Il valore viene "unwrappato" dalla Promise
    const user = await fetchUser(1);
    
    const fetchTime = Date.now() - startTime;
    console.log(`✅ User fetched in ${fetchTime}ms`);
    
    // Possiamo usare direttamente user (non è più Promise)
    console.log('User:', user.name);
    console.log('Age:', user.age);
    console.log('Email:', user.email);
    
    // Return value (viene automaticamente wrappato in Promise)
    return user;
}

// Chiamata 1: Con .then()
getUserInfo().then(user => {
    console.log('📦 Received user object:', user);
});

// Chiamata 2: Con await (dentro async context)
async function main() {
    const userData = await getUserInfo();
    console.log('📦 User data available:', userData.id);
}

main();

// Output tipico:
// 🔍 Fetching user...
// ✅ User fetched in 847ms
// User: Mario Rossi
// Age: 30
// Email: mario.rossi@example.com
// 📦 Received user object: { id: 1, name: 'Mario Rossi', ... }

// 🎯 Esempio Real-World: Fetch con dati dipendenti
async function loadUserDashboard(userId) {
    console.log(`📊 Loading dashboard for user ${userId}...`);
    
    // 1. Prima fetch user info
    const user = await fetchUser(userId);
    console.log(`✅ User loaded: ${user.name}`);
    
    // 2. Poi fetch user's posts (dipende da user.id)
    const posts = await fetchUserPosts(user.id);
    console.log(`✅ Posts loaded: ${posts.length} posts`);
    
    // 3. Infine fetch user's stats
    const stats = await fetchUserStats(user.id);
    console.log(`✅ Stats loaded: ${stats.totalViews} views`);
    
    // Ritorna oggetto completo
    return { user, posts, stats };
}

// Helper functions
function fetchUserPosts(userId) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, title: 'Post 1', likes: 10 },
                { id: 2, title: 'Post 2', likes: 25 }
            ]);
        }, 500);
    });
}

function fetchUserStats(userId) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ totalViews: 1523, followers: 89 });
        }, 300);
    });
}

// Timing: ~847ms + 500ms + 300ms = ~1647ms totali (sequenziale)
```

#### 4. Multiple Await - Sequential Execution

```javascript
async function processData() {
    console.log('🔄 Processing data sequentially...');
    const startTime = Date.now();
    
    // Await 1: Prima operazione
    console.log('Step 1: Fetching data1...');
    const data1 = await fetchData1(); // ⏸️ Aspetta ~500ms
    console.log(`✅ Data 1 received (${Date.now() - startTime}ms):`, data1);
    
    // Await 2: Seconda operazione (parte DOPO data1)
    console.log('Step 2: Fetching data2...');
    const data2 = await fetchData2(); // ⏸️ Aspetta ~700ms
    console.log(`✅ Data 2 received (${Date.now() - startTime}ms):`, data2);
    
    // Await 3: Terza operazione (parte DOPO data2)
    console.log('Step 3: Fetching data3...');
    const data3 = await fetchData3(); // ⏸️ Aspetta ~400ms
    console.log(`✅ Data 3 received (${Date.now() - startTime}ms):`, data3);
    
    const totalTime = Date.now() - startTime;
    console.log(`⏱️ Total time: ${totalTime}ms`);
    
    return [data1, data2, data3];
}

// Helper functions
function fetchData1() {
    return new Promise(resolve => {
        setTimeout(() => resolve({ source: 'API-1', value: 100 }), 500);
    });
}

function fetchData2() {
    return new Promise(resolve => {
        setTimeout(() => resolve({ source: 'API-2', value: 200 }), 700);
    });
}

function fetchData3() {
    return new Promise(resolve => {
        setTimeout(() => resolve({ source: 'API-3', value: 300 }), 400);
    });
}

// Output:
// 🔄 Processing data sequentially...
// Step 1: Fetching data1...
// ✅ Data 1 received (502ms): { source: 'API-1', value: 100 }
// Step 2: Fetching data2...
// ✅ Data 2 received (1205ms): { source: 'API-2', value: 200 }
// Step 3: Fetching data3...
// ✅ Data 3 received (1608ms): { source: 'API-3', value: 300 }
// ⏱️ Total time: 1608ms

/*
⚠️ NOTA: Esecuzione SEQUENZIALE
Tempo totale: 500ms + 700ms + 400ms = 1600ms

Se le operazioni fossero indipendenti, potremmo parallelizzare:
Tempo parallelo: max(500ms, 700ms, 400ms) = 700ms
Risparmio: 900ms (2.3x più veloce!)
*/
```

---

## ⚠️ Gestione Errori

> **💡 Teoria: Error Handling con Async/Await**
>
> Async/await usa **try/catch** standard invece di `.catch()`, rendendo
> il codice più naturale e simile alla gestione errori sincrona.
>
> **Vantaggi rispetto a Promise.catch():**
> 1. **Sintassi familiare**: try/catch come codice sincrono
> 2. **Scope naturale**: Variabili accessibili in catch
> 3. **Stack traces migliori**: Errori più facili da debuggare
> 4. **Composizione**: Più facile gestire logica complessa
>
> **Come funziona:**
> ```javascript
> // Async/await con try/catch:
> async function example() {
>     try {
>         const data = await fetchData();
>         return data;
>     } catch (err) {
>         // Gestisce Promise rejection
>     }
> }
>
> // Equivalente con Promise:
> function example() {
>     return fetchData()
>         .then(data => data)
>         .catch(err => {
>             // Gestisce rejection
>         });
> }
> ```
>
> **Quando Promise rejection diventa Exception:**
> - `await Promise.reject(err)` → lancia errore in try/catch
> - `await throwingFunction()` → catturato da catch block
> - Senza try/catch → Unhandled rejection (crash in Node.js 15+)

### Try/Catch

Il modo standard per gestire errori in async/await è **try/catch**.

```javascript
async function example() {
    try {
        // Qualsiasi errore in questo blocco viene catturato
        const result = await riskyOperation();
        console.log('Success:', result);
    } catch (err) {
        // Gestisce sia errori sincroni che Promise rejection
        console.error('Error:', err.message);
        
        // Opzioni:
        // 1. Log e continua
        // 2. Ritorna valore di fallback
        // 3. Re-throw per propagare l'errore
    }
}
```

**Cosa Cattura try/catch:**
```javascript
async function demonstrateErrorCatching() {
    try {
        // ✅ Cattura: Errori sincroni
        throw new Error('Sync error');
        
        // ✅ Cattura: Promise rejection
        await Promise.reject(new Error('Async error'));
        
        // ✅ Cattura: Errori in funzioni chiamate
        const data = await fetchData();  // Se fetchData fallisce
        
        // ✅ Cattura: Errori in codice dopo await
        const parsed = JSON.parse(data);  // Se parse fallisce
        
    } catch (err) {
        // Tutti gli errori sopra arrivano qui
        console.error('Caught:', err.message);
    }
}
```

### 💻 Esempi Gestione Errori

#### 1. Try/Catch Base - Error Handling Completo

```javascript
async function fetchData() {
    try {
        // Step 1: Fetch della risorsa
        console.log('🔍 Fetching data...');
        const response = await fetch('https://api.example.com/data');
        
        // Step 2: Verifica status HTTP
        if (!response.ok) {
            // Lancia errore custom con info status
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }
        
        // Step 3: Parse JSON (può fallire se risposta non è JSON valido)
        const data = await response.json();
        console.log('✅ Data fetched successfully');
        return data;
        
    } catch (err) {
        // Cattura TUTTI gli errori:
        // - Errori di rete (fetch failed)
        // - HTTP errors (404, 500, etc.)
        // - JSON parse errors
        console.error('❌ Fetch failed:', err.message);
        
        // Opzione 1: Log e re-throw (propaga errore)
        throw err;
        
        // Opzione 2: Ritorna fallback value
        // return { data: [], error: err.message };
        
        // Opzione 3: Gestisci errore e continua
        // return null;
    }
}

// 🧪 Test con URL valido e invalido
async function testFetch() {
    // Test 1: URL valido
    try {
        const data = await fetchData();
        console.log('Data:', data);
    } catch (err) {
        console.error('Outer catch:', err.message);
    }
    
    // Test 2: URL 404
    try {
        const invalidData = await fetch('https://api.example.com/notfound');
        // Output: ❌ Fetch failed: HTTP Error 404: Not Found
    } catch (err) {
        console.error('404 caught:', err.message);
    }
}
```

#### 2. Try/Catch con Finally - Cleanup Garantito

```javascript
async function loadData() {
    let loading = true;
    console.log('📊 Starting data load...');
    
    try {
        // Operazione principale
        const data = await fetchData();
        console.log('✅ Data loaded:', data);
        return data;
        
    } catch (err) {
        // Gestione errore
        console.error('❌ Error loading data:', err.message);
        
        // Ritorna valore di fallback invece di propagare errore
        return null; // Fallback value
        
    } finally {
        // ⚠️ SEMPRE eseguito, sia con success che con error
        // Perfetto per cleanup operations
        loading = false;
        console.log('🔄 Loading complete (finally block)');
        
        // Use cases comuni per finally:
        // - Chiudere connessioni DB
        // - Rilasciare lock/semafori
        // - Aggiornare UI state (loading = false)
        // - Logging/metrics
    }
}

/*
📊 EXECUTION FLOW CON FINALLY:

Success path:
try → return data → finally → return to caller
      └─────────────┬─────────────┘
                    ↓
            finally SEMPRE eseguito

Error path:
try → catch → return null → finally → return to caller
      └──────────────┬──────────────┘
                     ↓
             finally SEMPRE eseguito

⚠️ IMPORTANTE: finally si esegue PRIMA del return!
*/

// 🧪 Test dimostrativo
async function demonstrateFinally() {
    console.log('\\n=== Test 1: Success ===');
    const result1 = await loadData();
    console.log('Returned:', result1);
    
    console.log('\\n=== Test 2: Error ===');
    const result2 = await loadData(); // Simula errore
    console.log('Returned:', result2);
}

// Output Success:
// 📊 Starting data load...
// ✅ Data loaded: {...}
// 🔄 Loading complete (finally block)
// Returned: {...}

// Output Error:
// 📊 Starting data load...
// ❌ Error loading data: Network error
// 🔄 Loading complete (finally block)
// Returned: null

// 🎯 Real-World Example: Database Connection
async function queryDatabase(sql) {
    let connection = null;
    
    try {
        // Acquisisci risorsa
        connection = await db.connect();
        console.log('🔌 Database connected');
        
        // Esegui query
        const result = await connection.query(sql);
        console.log(`✅ Query executed: ${result.rowCount} rows`);
        
        return result.rows;
        
    } catch (err) {
        console.error('❌ Query failed:', err.message);
        throw err;  // Re-throw per permettere al caller di gestire
        
    } finally {
        // ⚠️ CRITICO: Chiudi connessione SEMPRE
        if (connection) {
            await connection.close();
            console.log('🔌 Database connection closed');
        }
    }
}

// Senza finally, in caso di errore la connessione resterebbe aperta!
// Con finally, la connessione viene chiusa sia con success che error
```

#### 3. Multiple Try/Catch - Gestione Granulare degli Errori

```javascript
async function processAllData() {
    console.log('📊 Processing all data with granular error handling...');
    let user = null;
    let posts = null;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Gestisci errori separatamente per ogni operazione
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Try/Catch 1: Fetch user (con fallback)
    try {
        console.log('Step 1: Fetching user...');
        user = await fetchUser();
        console.log(`✅ User loaded: ${user.name}`);
    } catch (err) {
        console.error('❌ User fetch failed:', err.message);
        // Fallback: Guest user invece di bloccare tutto
        user = { id: 0, name: 'Guest', isGuest: true };
        console.log('⚠️ Using guest user as fallback');
    }
    
    // Try/Catch 2: Fetch posts (dipende da user ma gestisce errori)
    try {
        console.log(`Step 2: Fetching posts for user ${user.id}...`);
        posts = await fetchPosts(user.id);
        console.log(`✅ Posts loaded: ${posts.length} posts`);
    } catch (err) {
        console.error('❌ Posts fetch failed:', err.message);
        // Fallback: Array vuoto invece di bloccare
        posts = [];
        console.log('⚠️ Using empty posts array as fallback');
    }
    
    // Ritorna sempre un risultato (anche parziale)
    return {
        user,
        posts,
        hasErrors: user.isGuest || posts.length === 0
    };
}

/*
🎯 VANTAGGI MULTIPLE TRY/CATCH:

1. ✅ Resilienza: Un errore non blocca tutto
   - User fetch fallisce → continua con Guest
   - Posts fetch fallisce → continua con array vuoto

2. ✅ Granularità: Diversi fallback per ogni operazione
   - User: Guest user
   - Posts: Empty array
   - Settings: Default config

3. ✅ Debugging: Sai esattamente quale operazione fallisce
   - Logs separati per ogni step
   - Error tracking più preciso

4. ✅ User Experience: App sempre funzionante
   - Partial failure invece di crash completo
   - Graceful degradation
*/

// Output con errori parziali:
// 📊 Processing all data with granular error handling...
// Step 1: Fetching user...
// ❌ User fetch failed: Network timeout
// ⚠️ Using guest user as fallback
// Step 2: Fetching posts for user 0...
// ✅ Posts loaded: 0 posts
// Result: { user: {id: 0, name: 'Guest'}, posts: [], hasErrors: true }

// 🎯 Real-World Example: Dashboard con Multiple Sources
async function loadDashboard(userId) {
    console.log(`📊 Loading dashboard for user ${userId}...`);
    
    const dashboard = {
        user: null,
        stats: null,
        notifications: null,
        recentActivity: null,
        errors: []
    };
    
    // Fetch 1: User info (critico)
    try {
        dashboard.user = await fetchUser(userId);
    } catch (err) {
        dashboard.errors.push({ section: 'user', error: err.message });
        throw err;  // User è critico, blocca se fallisce
    }
    
    // Fetch 2: Stats (non critico, usa fallback)
    try {
        dashboard.stats = await fetchUserStats(userId);
    } catch (err) {
        dashboard.errors.push({ section: 'stats', error: err.message });
        dashboard.stats = { views: 0, likes: 0 };  // Fallback
    }
    
    // Fetch 3: Notifications (non critico, usa fallback)
    try {
        dashboard.notifications = await fetchNotifications(userId);
    } catch (err) {
        dashboard.errors.push({ section: 'notifications', error: err.message });
        dashboard.notifications = [];  // Fallback
    }
    
    // Fetch 4: Recent activity (non critico, usa fallback)
    try {
        dashboard.recentActivity = await fetchRecentActivity(userId);
    } catch (err) {
        dashboard.errors.push({ section: 'recentActivity', error: err.message });
        dashboard.recentActivity = [];  // Fallback
    }
    
    console.log(`✅ Dashboard loaded with ${dashboard.errors.length} errors`);
    return dashboard;
}

/*
🎯 RISULTATO:
- User fallisce → Blocca tutto (throw)
- Stats fallisce → Mostra 0 (fallback)
- Notifications falliscono → Mostra lista vuota (fallback)
- Recent activity fallisce → Mostra lista vuota (fallback)

User vede dashboard funzionante anche se 3/4 API falliscono!
*/
```
    } catch (err) {
        console.error('Posts fetch failed:', err);
        posts = []; // Fallback
    }
    
    return { user, posts };
}
```

#### 4. Catch per Promise Specifica - Inline Error Handling

```javascript
async function example() {
    console.log('🔍 Fetching data with inline catch...');
    
    // Catch inline per Promise specifica
    // ⚠️ NOTA: .catch() ritorna una Promise che si risolve sempre
    const data = await fetchData().catch(err => {
        console.error('❌ Fetch error:', err.message);
        // Ritorna fallback value invece di propagare errore
        return { default: true, error: err.message }; // Fallback
    });
    
    // Qui data è SEMPRE definito (o result o fallback)
    console.log('Data received:', data);
    
    if (data.default) {
        console.log('⚠️ Using default data due to error');
    } else {
        console.log('✅ Using real data');
    }
}

/*
📊 INLINE CATCH vs TRY/CATCH:

Inline catch:
─────────────
const data = await fetchData().catch(err => fallback);
// data è SEMPRE definito

Try/catch:
──────────
try {
    const data = await fetchData();
} catch (err) {
    // data NON esiste in questo scope
}

✅ Usa inline catch quando:
- Vuoi fallback value specifico per quella Promise
- Non vuoi bloccare l'esecuzione
- Lo scope della variabile è importante

✅ Usa try/catch quando:
- Vuoi gestire multiple Promise insieme
- Vuoi propagare l'errore
- Hai logica complessa di error handling
*/

// 🎯 Real-World: API con Fallback
async function getUserWithFallback(userId) {
    // Prova API primaria, poi fallback a cache
    const user = await fetchUserFromAPI(userId).catch(async (err) => {
        console.warn('⚠️ API failed, trying cache...', err.message);
        
        // Fallback: Prova cache
        return await fetchUserFromCache(userId).catch((cacheErr) => {
            console.error('❌ Cache also failed:', cacheErr.message);
            
            // Ultimo fallback: Guest user
            return { id: userId, name: 'Guest', source: 'fallback' };
        });
    });
    
    console.log(`✅ User loaded from: ${user.source || 'API'}`);
    return user;
}

// Catena di fallback:
// API → Cache → Guest
// Sempre ritorna un valore valido!
```

#### 5. Error Helper Function - Pattern Go-Style

```javascript
// Helper per gestire errori consistentemente (pattern ispirato a Go)
async function handleAsync(promise) {
    try {
        const data = await promise;
        return [null, data]; // [error, data] - Success case
    } catch (err) {
        return [err, null];  // [error, data] - Error case
    }
}

/*
💡 VANTAGGI DEL PATTERN [ERROR, DATA]:

1. ✅ Nessun try/catch nel codice principale
2. ✅ Controllo esplicito degli errori
3. ✅ Type-safe (con TypeScript)
4. ✅ Consistente tra tutte le operazioni async
5. ✅ Facile testing (errori come valori normali)
*/

// Uso
async function example() {
    console.log('🔍 Fetching user with error helper...');
    
    // Destructuring per ottenere [error, data]
    const [err, user] = await handleAsync(fetchUser(1));
    
    // Controllo esplicito dell'errore
    if (err) {
        console.error('❌ Error:', err.message);
        // Gestisci errore e termina
        return;
    }
    
    // Qui user è garantito essere definito (no TypeScript errors!)
    console.log('✅ User loaded:', user.name);
    
    // Fetch posts con stesso pattern
    const [postsErr, posts] = await handleAsync(fetchPosts(user.id));
    
    if (postsErr) {
        console.error('❌ Posts error:', postsErr.message);
        // Qui possiamo decidere: return o continuare con fallback
        return;
    }
    
    console.log(`✅ Posts loaded: ${posts.length} posts`);
    
    return { user, posts };
}

// 🎯 Real-World: Multiple Operations con Error Helper
async function processUserData(userId) {
    console.log(`📊 Processing data for user ${userId}...`);
    
    // Fetch 1: User
    const [userErr, user] = await handleAsync(fetchUser(userId));
    if (userErr) {
        return { success: false, error: 'User not found', details: userErr.message };
    }
    
    // Fetch 2: Profile
    const [profileErr, profile] = await handleAsync(fetchProfile(user.id));
    if (profileErr) {
        return { success: false, error: 'Profile fetch failed', details: profileErr.message };
    }
    
    // Fetch 3: Settings
    const [settingsErr, settings] = await handleAsync(fetchSettings(user.id));
    if (settingsErr) {
        // Settings non è critico, usa fallback
        console.warn('⚠️ Settings failed, using defaults');
        settings = { theme: 'light', language: 'it' };
    }
    
    console.log('✅ All data processed successfully');
    
    return {
        success: true,
        data: { user, profile, settings }
    };
}

// 📊 CONFRONTO TRY/CATCH vs ERROR HELPER

// Con try/catch (verboso):
async function withTryCatch() {
    let user, posts;
    
    try {
        user = await fetchUser(1);
    } catch (err) {
        console.error(err);
        return;
    }
    
    try {
        posts = await fetchPosts(user.id);
    } catch (err) {
        console.error(err);
        return;
    }
    
    return { user, posts };
}

// Con error helper (conciso):
async function withErrorHelper() {
    const [userErr, user] = await handleAsync(fetchUser(1));
    if (userErr) return console.error(userErr);
    
    const [postsErr, posts] = await handleAsync(fetchPosts(user.id));
    if (postsErr) return console.error(postsErr);
    
    return { user, posts };
}

/*
🎯 QUANDO USARE:
- ✅ Multiple operazioni async in sequenza
- ✅ Error handling granulare per ogni operazione
- ✅ Codice più leggibile senza try/catch nidificati
- ✅ TypeScript (type inference migliore)

⚠️ QUANDO NON USARE:
- ❌ Hai già try/catch in tutta la codebase (consistenza)
- ❌ Single operation (try/catch è più semplice)
- ❌ Vuoi finally block (handleAsync non lo supporta)
*/
```
    console.log('User:', user);
}
```

---

## 🔀 Esecuzione Sequenziale vs Parallela

> **💡 Teoria: Performance - Sequential vs Parallel Execution**
>
> Una delle differenze più critiche in async/await è **quando** avviare le Promise.
>
> **Sequential (await subito dopo creazione):**
> ```javascript
> const a = await fetch1();  // ⏸️ Aspetta
> const b = await fetch2();  // ⏸️ Aspetta
> // Tempo totale: t1 + t2
> ```
>
> **Parallel (crea Promise prima, await dopo):**
> ```javascript
> const p1 = fetch1();       // ▶️ Avvia subito
> const p2 = fetch2();       // ▶️ Avvia subito
> const a = await p1;        // ⏸️ Aspetta entrambe
> const b = await p2;        // (già completato)
> // Tempo totale: max(t1, t2)
> ```
>
> **Impatto Performance:**
> - 🐌 Sequential: 3 operazioni da 1s = 3000ms
> - 🚀 Parallel: 3 operazioni da 1s = 1000ms
> - 📊 Speedup: **3x più veloce!**
>
> **Quando Usare:**
> - ✅ Parallel: Operazioni **indipendenti** (no dipendenze tra loro)
> - ✅ Sequential: Operazioni **dipendenti** (B dipende da risultato di A)

### ⚠️ Sequenziale (Lento)

```javascript
// ❌ LENTO: Esecuzione sequenziale
async function loadDataSequential() {
    console.time('Sequential Total');
    
    // Operazione 1: Aspetta completamente prima di procedere
    console.time('User fetch');
    const user = await fetchUser();      // ⏸️ PAUSE 1s
    console.timeEnd('User fetch');
    
    // Operazione 2: Inizia SOLO dopo che user è completo
    console.time('Posts fetch');
    const posts = await fetchPosts();    // ⏸️ PAUSE 1s
    console.timeEnd('Posts fetch');
    
    // Operazione 3: Inizia SOLO dopo che posts è completo
    console.time('Comments fetch');
    const comments = await fetchComments(); // ⏸️ PAUSE 1s
    console.timeEnd('Comments fetch');
    
    console.timeEnd('Sequential Total');
    return { user, posts, comments };
}
// Tempo totale: ~3 secondi (1s + 1s + 1s)

/*
📊 SEQUENTIAL TIMELINE:

0ms    ├─→ fetchUser() starts
       │   ⏳ waiting...
1000ms ├─→ fetchUser() done
       ├─→ fetchPosts() starts
       │   ⏳ waiting...
2000ms ├─→ fetchPosts() done
       ├─→ fetchComments() starts
       │   ⏳ waiting...
3000ms └─→ fetchComments() done ✅

Total: 3000ms
*/

console.time('Sequential');
await loadDataSequential();
console.timeEnd('Sequential');
// Output:
// User fetch: 1000ms
// Posts fetch: 1000ms
// Comments fetch: 1000ms
// Sequential Total: 3000ms
// Sequential: 3000ms
```

### ✅ Parallelo (Veloce)

```javascript
// ✅ VELOCE: Esecuzione parallela
async function loadDataParallel() {
    console.time('Parallel Total');
    
    // Avvia TUTTE le Promise contemporaneamente (non await qui!)
    console.log('🚀 Starting all fetches in parallel...');
    const userPromise = fetchUser();       // ▶️ Parte subito
    const postsPromise = fetchPosts();     // ▶️ Parte subito
    const commentsPromise = fetchComments(); // ▶️ Parte subito
    
    console.log('⏳ All fetches running, waiting for completion...');
    
    // Ora aspetta che TUTTE completino con Promise.all
    const [user, posts, comments] = await Promise.all([
        userPromise,
        postsPromise,
        commentsPromise
    ]);
    
    console.timeEnd('Parallel Total');
    return { user, posts, comments };
}
// Tempo totale: ~1 secondo (max delle tre)

/*
📊 PARALLEL TIMELINE:

0ms    ├─→ fetchUser() starts     ─┐
       ├─→ fetchPosts() starts     ├─ Tutti partono insieme!
       ├─→ fetchComments() starts ─┘
       │   ⏳ All running in parallel...
1000ms └─→ All done ✅ (la più lenta era 1000ms)

Total: 1000ms (non 3000ms!)
*/

console.time('Parallel');
await loadDataParallel();
console.timeEnd('Parallel');
// Output:
// 🚀 Starting all fetches in parallel...
// ⏳ All fetches running, waiting for completion...
// Parallel Total: 1000ms
// Parallel: 1000ms

// 📊 CONFRONTO DIRETTO
async function comparePerformance() {
    console.log('\n=== PERFORMANCE COMPARISON ===\n');
    
    // Test Sequential
    const seqStart = Date.now();
    await loadDataSequential();
    const seqTime = Date.now() - seqStart;
    
    // Test Parallel
    const parStart = Date.now();
    await loadDataParallel();
    const parTime = Date.now() - parStart;
    
    // Analisi
    console.log('\n=== RESULTS ===');
    console.log(`Sequential: ${seqTime}ms`);
    console.log(`Parallel: ${parTime}ms`);
    console.log(`Speedup: ${(seqTime / parTime).toFixed(2)}x faster`);
    console.log(`Time saved: ${seqTime - parTime}ms (${((1 - parTime/seqTime) * 100).toFixed(1)}% faster)`);
}

comparePerformance();

// Output:
// === RESULTS ===
// Sequential: 3000ms
// Parallel: 1000ms
// Speedup: 3.00x faster
// Time saved: 2000ms (66.7% faster)
```

### 💻 Esempi Confronto

#### 1. Pattern Sbagliato vs Corretto - Common Mistakes

```javascript
// ❌ SBAGLIATO: Crea Promise ma aspetta subito (sequenziale!)
async function badPattern() {
    console.log('❌ Bad pattern: Creating and awaiting immediately');
    console.time('Bad pattern');
    
    // Crea Promise
    const promise1 = fetchData1();
    const result1 = await promise1; // ⏸️ Aspetta (1000ms)
    
    // Crea seconda Promise DOPO che la prima completa
    const promise2 = fetchData2();
    const result2 = await promise2; // ⏸️ Aspetta (1000ms)
    
    console.timeEnd('Bad pattern');
    return [result1, result2];
}
// Tempo: 1000ms + 1000ms = 2000ms (sequenziale!)
// ⚠️ Problema: promise2 inizia DOPO che promise1 completa

// ✅ CORRETTO: Promise.all per parallelismo
async function goodPattern() {
    console.log('✅ Good pattern: Promise.all for parallelism');
    console.time('Good pattern');
    
    // Avvia ENTRAMBE subito, aspetta tutte insieme
    const [result1, result2] = await Promise.all([
        fetchData1(),  // ▶️ Parte subito
        fetchData2()   // ▶️ Parte subito
    ]);
    
    console.timeEnd('Good pattern');
    return [result1, result2];
}
// Tempo: max(1000ms, 1000ms) = 1000ms (parallelo!)
// ✅ Entrambe partono insieme, aspettiamo la più lenta

// 📊 CONFRONTO VISUALE:
/*
BAD PATTERN (Sequential):
────────────────────────────
0ms     fetchData1() starts
        ⏳ waiting...
1000ms  fetchData1() done
        fetchData2() starts ← Inizia DOPO!
        ⏳ waiting...
2000ms  fetchData2() done
Total: 2000ms

GOOD PATTERN (Parallel):
────────────────────────────
0ms     fetchData1() starts ─┐
        fetchData2() starts ─┤ Entrambe insieme!
        ⏳ waiting...        │
1000ms  Both done ───────────┘
Total: 1000ms (2x faster!)
*/

// Helper functions
function fetchData1() {
    return new Promise(resolve => {
        setTimeout(() => resolve({ source: 'API-1', value: 100 }), 1000);
    });
}

function fetchData2() {
    return new Promise(resolve => {
        setTimeout(() => resolve({ source: 'API-2', value: 200 }), 1000);
    });
}

// Test comparison
async function comparePatterns() {
    console.log('\\n=== PATTERN COMPARISON ===\\n');
    
    const bad = await badPattern();
    console.log('Bad result:', bad);
    
    const good = await goodPattern();
    console.log('Good result:', good);
}

// Output:
// === PATTERN COMPARISON ===
// ❌ Bad pattern: Creating and awaiting immediately
// Bad pattern: 2001ms
// Bad result: [ { source: 'API-1', value: 100 }, { source: 'API-2', value: 200 } ]
// ✅ Good pattern: Promise.all for parallelism
// Good pattern: 1002ms
// Good result: [ { source: 'API-1', value: 100 }, { source: 'API-2', value: 200 } ]
```

#### 2. Dipendenze Sequenziali - Quando Sequential è Necessario

> **💡 Quando NON puoi parallelizzare:**
>
> Operazioni **dipendenti** devono essere sequenziali perché:
> - B ha bisogno del risultato di A come input
> - L'ordine di esecuzione è critico
> - Dati precedenti influenzano chiamate successive

```javascript
// Quando i dati dipendono l'uno dall'altro
async function fetchWithDependencies() {
    console.log('📊 Fetching with dependencies (MUST be sequential)...');
    
    // 1. Fetch user (deve essere prima)
    console.log('Step 1: Fetching user...');
    const user = await fetchUser(1);
    console.log(`✅ User fetched: ${user.name} (ID: ${user.id})`);
    
    // 2. Fetch posts dell'user (dipende da user.id)
    //    ⚠️ Non possiamo partire prima di avere user.id!
    console.log(`Step 2: Fetching posts for user ${user.id}...`);
    const posts = await fetchPosts(user.id);  // ← Usa user.id
    console.log(`✅ Posts fetched: ${posts.length} posts`);
    
    // 3. Fetch comments del primo post (dipende da posts[0].id)
    //    ⚠️ Non possiamo partire prima di avere posts!
    if (posts.length > 0) {
        console.log(`Step 3: Fetching comments for post ${posts[0].id}...`);
        const comments = await fetchComments(posts[0].id);  // ← Usa posts[0].id
        console.log(`✅ Comments fetched: ${comments.length} comments`);
        
        return { user, posts, comments };
    }
    
    return { user, posts, comments: [] };
}
// Qui il sequenziale è NECESSARIO
// Timing: t_user + t_posts + t_comments (non parallelizzabile)

/*
📊 DEPENDENCY CHAIN:

fetchUser(1)
    │
    ├─→ ritorna user object con user.id
    │
    └─→ fetchPosts(user.id)  ← Dipende da user.id
            │
            ├─→ ritorna posts array
            │
            └─→ fetchComments(posts[0].id)  ← Dipende da posts
                    │
                    └─→ ritorna comments

❌ NON PARALLELIZZABILE: Ogni step dipende dal precedente
*/

// 🎯 Esempio Real-World: E-commerce Order Flow
async function processOrder(orderId) {
    console.log(`🛒 Processing order ${orderId}...`);
    
    // Step 1: Ottieni dettagli ordine
    const order = await fetchOrder(orderId);
    console.log(`📦 Order fetched: ${order.items.length} items, total: $${order.total}`);
    
    // Step 2: Valida inventario (dipende da order.items)
    const inventoryCheck = await validateInventory(order.items);
    if (!inventoryCheck.available) {
        throw new Error('Items not available in inventory');
    }
    console.log(`✅ Inventory validated`);
    
    // Step 3: Processa pagamento (dipende da order.total e order.customerId)
    const payment = await processPayment(order.customerId, order.total);
    console.log(`💳 Payment processed: ${payment.transactionId}`);
    
    // Step 4: Aggiorna inventario (solo DOPO pagamento confermato)
    await updateInventory(order.items, -1);  // Decrementa stock
    console.log(`📦 Inventory updated`);
    
    // Step 5: Crea spedizione (solo DOPO inventory aggiornato)
    const shipment = await createShipment(order.id, order.shippingAddress);
    console.log(`🚚 Shipment created: ${shipment.trackingNumber}`);
    
    // Step 6: Invia email conferma (solo DOPO tutto completo)
    await sendOrderConfirmation(order.customerId, {
        order,
        payment,
        shipment
    });
    console.log(`📧 Confirmation email sent`);
    
    return {
        order,
        payment,
        shipment,
        status: 'completed'
    };
}

// Questa catena DEVE essere sequenziale:
// 1. Non puoi validare inventory prima di avere order
// 2. Non puoi pagare prima di validare inventory
// 3. Non puoi aggiornare stock prima di confermare pagamento
// 4. Non puoi spedire prima di aggiornare stock
// 5. Non puoi confermare prima che tutto sia fatto

// Timing: Somma di tutti i tempi (inevitabile)
// Order: 200ms + Inventory: 300ms + Payment: 500ms + 
// Update: 150ms + Shipment: 400ms + Email: 100ms = 1650ms totali
```

#### 3. Mix Sequenziale e Parallelo - Strategia Ottimizzata

> **💡 Best Practice: Parallelizza dove possibile, sequenziale dove necessario**
>
> La strategia ottimale spesso è un **mix**:
> 1. Sequential per dipendenze critiche
> 2. Parallel per operazioni indipendenti
> 3. Raggruppamento intelligente per massimizzare throughput

```javascript
async function smartFetch() {
    console.log('🧠 Smart fetch: Optimized sequential + parallel');
    console.time('Total time');
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FASE 1: Sequential (dipendenza critica)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.time('Phase 1: User fetch');
    const user = await fetchUser(1);  // ⏸️ MUST fetch first
    console.timeEnd('Phase 1: User fetch');
    console.log(`✅ User: ${user.name}`);
    // Timing: 300ms
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FASE 2: Parallel (entrambi dipendono solo da user.id)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.time('Phase 2: Posts + Settings parallel');
    const [posts, settings] = await Promise.all([
        fetchPosts(user.id),      // 🚀 Parallel: 500ms
        fetchSettings(user.id)    // 🚀 Parallel: 400ms
    ]);
    console.timeEnd('Phase 2: Posts + Settings parallel');
    console.log(`✅ Posts: ${posts.length}, Settings loaded`);
    // Timing: max(500ms, 400ms) = 500ms (non 900ms!)
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FASE 3: Parallel batch (fetch comments per ogni post)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.time('Phase 3: All comments parallel');
    // Crea array di Promise (non await ancora)
    const commentsPromises = posts.map(post => {
        console.log(`  🚀 Fetching comments for post ${post.id}`);
        return fetchComments(post.id);  // Tutte partono insieme
    });
    
    // Aspetta che tutte completino
    const allComments = await Promise.all(commentsPromises);
    console.timeEnd('Phase 3: All comments parallel');
    console.log(`✅ Comments loaded for ${allComments.length} posts`);
    // Timing: max di tutte le fetch (non somma!)
    
    console.timeEnd('Total time');
    
    return { user, posts, settings, allComments };
}

/*
📊 OPTIMIZED TIMELINE:

0ms     ├─→ Phase 1: fetchUser()
        │   ⏳ waiting...
300ms   ├─→ Phase 2: fetchPosts() ───┐
        │             &               ├─ Parallel!
        │            fetchSettings() ─┘
        │   ⏳ waiting for both...
800ms   ├─→ Phase 3: fetchComments(post1) ─┐
        │            fetchComments(post2)  ├─ All parallel!
        │            fetchComments(post3) ─┘
        │   ⏳ waiting for all...
1200ms  └─→ Complete ✅

Total: 1200ms

Vs Full Sequential: 300 + 500 + 400 + (300*3) = 2100ms
Speedup: 1.75x faster! (43% time saved)
*/

// 🎯 Real-World Example: Dashboard Loading Ottimizzato
async function loadOptimizedDashboard(userId) {
    console.log(`📊 Loading dashboard for user ${userId}`);
    console.time('Dashboard load');
    
    // ━━━ PHASE 1: Critical data (sequential) ━━━
    const user = await fetchUser(userId);
    
    // ━━━ PHASE 2: Independent data (parallel) ━━━
    // Questi 4 fetch sono indipendenti tra loro
    const [
        profile,
        notifications,
        recentActivity,
        preferences
    ] = await Promise.all([
        fetchUserProfile(user.id),     // 400ms
        fetchNotifications(user.id),   // 300ms
        fetchRecentActivity(user.id),  // 500ms
        fetchUserPreferences(user.id)  // 200ms
    ]);
    // Timing: max(400, 300, 500, 200) = 500ms invece di 1400ms!
    // Risparmio: 900ms (64% più veloce)
    
    // ━━━ PHASE 3: Dependent data (sequential) ━━━
    // Questi dipendono dai dati di Phase 2
    const widgets = await loadWidgets(preferences.widgetConfig);
    
    console.timeEnd('Dashboard load');
    
    return {
        user,
        profile,
        notifications,
        recentActivity,
        preferences,
        widgets
    };
}

// Strategia di ottimizzazione:
// 1. Identifica dipendenze critiche → Sequential
// 2. Raggruppa operazioni indipendenti → Parallel
// 3. Misura e itera per trovare bottleneck
```

---

## 🔁 Pattern Comuni

### Pattern 1: Delay Utility

```javascript
// Utility per delay (sleep/wait)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/*
💡 Come funziona:
- Crea Promise che si risolve dopo `ms` millisecondi
- Non blocca event loop (altre operazioni possono eseguire)
- Equivalente a sleep() in altri linguaggi (ma non-blocking!)
*/

// Uso base
async function example() {
    console.log('Start');
    await delay(1000);  // Aspetta 1 secondo
    console.log('After 1 second');
    await delay(2000);  // Aspetta altri 2 secondi
    console.log('After 3 seconds total');
}

// 🎯 Use Cases:

// 1. Rate limiting (evita troppi request)
async function fetchWithRateLimit(urls) {
    const results = [];
    
    for (const url of urls) {
        const data = await fetch(url);
        results.push(data);
        
        // Aspetta 100ms tra request per non sovraccaricare server
        await delay(100);
    }
    
    return results;
}

// 2. Polling (controlla status periodicamente)
async function waitForJobComplete(jobId) {
    console.log(`⏳ Waiting for job ${jobId} to complete...`);
    
    while (true) {
        const status = await checkJobStatus(jobId);
        
        if (status === 'completed') {
            console.log('✅ Job completed!');
            return true;
        }
        
        if (status === 'failed') {
            console.log('❌ Job failed!');
            return false;
        }
        
        console.log(`⏳ Still running... checking again in 2s`);
        await delay(2000);  // Check ogni 2 secondi
    }
}

// 3. Animazioni progressive
async function showProgressAnimation() {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    
    for (let i = 0; i < 30; i++) {
        process.stdout.write(`\r${frames[i % frames.length]} Loading...`);
        await delay(100);  // Frame ogni 100ms
    }
    
    console.log('\r✅ Done!');
}

// 4. Debounce async operations
async function debouncedSearch(query) {
    console.log(`Typing: "${query}"`);
    
    // Aspetta che utente finisca di scrivere
    await delay(300);
    
    // Esegui search solo dopo 300ms di pausa
    console.log(`🔍 Searching for: "${query}"`);
    const results = await searchAPI(query);
    
    return results;
}
```

### Pattern 2: Retry Logic con Exponential Backoff

```javascript
// Retry automatico con exponential backoff
async function retry(fn, maxRetries = 3, baseDelay = 1000) {
    console.log(`🔄 Starting retry logic (max ${maxRetries} attempts)...`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}/${maxRetries}...`);
            
            // Prova eseguire funzione
            const result = await fn();
            console.log(`✅ Success on attempt ${attempt}`);
            return result;
            
        } catch (err) {
            console.error(`❌ Attempt ${attempt} failed: ${err.message}`);
            
            // Se è l'ultimo tentativo, propaga errore
            if (attempt === maxRetries) {
                console.error('🚫 All retries exhausted, giving up');
                throw new Error(`Failed after ${maxRetries} attempts: ${err.message}`);
            }
            
            // Calcola delay con exponential backoff
            // Attempt 1: 1000ms, Attempt 2: 2000ms, Attempt 3: 4000ms
            const delayMs = baseDelay * Math.pow(2, attempt - 1);
            console.log(`⏳ Waiting ${delayMs}ms before retry ${attempt + 1}...`);
            
            await delay(delayMs);
        }
    }
}

/*
📊 EXPONENTIAL BACKOFF TIMELINE:

Attempt 1 fails
    ↓
Wait 1000ms (1s)
    ↓
Attempt 2 fails
    ↓
Wait 2000ms (2s)
    ↓
Attempt 3 fails
    ↓
Wait 4000ms (4s)
    ↓
Attempt 4...

Vantaggi:
✅ Non sovraccarica server con retry immediate
✅ Aumenta probabilità di successo (server può recuperare)
✅ Fair per altri client (non monopolizza risorse)
*/

// 🎯 Use Cases:

// 1. API calls con network instabile
async function fetchWithRetry(url) {
    return retry(
        async () => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        },
        maxRetries: 5,      // Fino a 5 tentativi
        baseDelay: 1000     // Partendo da 1s
    );
}

// Test:
// Attempt 1... (0ms)
// ❌ Attempt 1 failed: HTTP 503
// ⏳ Waiting 1000ms before retry 2...
// Attempt 2... (1000ms)
// ❌ Attempt 2 failed: HTTP 503
// ⏳ Waiting 2000ms before retry 3...
// Attempt 3... (3000ms)
// ✅ Success on attempt 3

// 2. Database connection con jitter (random delay)
async function retryWithJitter(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt === maxRetries) throw err;
            
            // Exponential backoff + random jitter
            const exponential = baseDelay * Math.pow(2, attempt - 1);
            const jitter = Math.random() * 1000;  // 0-1000ms random
            const delayMs = exponential + jitter;
            
            console.log(`⏳ Retry ${attempt + 1} after ${Math.round(delayMs)}ms`);
            await delay(delayMs);
        }
    }
}

// 3. Conditional retry (solo per errori transitori)
async function smartRetry(fn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            // Errori permanenti: non ritentare
            if (err.code === 'ENOTFOUND' || err.status === 404) {
                console.error('🚫 Permanent error, not retrying');
                throw err;
            }
            
            // Errori transitori: ritenta
            if (err.status === 503 || err.code === 'ETIMEDOUT') {
                if (attempt < maxRetries) {
                    console.log(`⚠️ Transient error, retrying...`);
                    await delay(1000 * attempt);
                    continue;
                }
            }
            
            throw err;
        }
    }
}

// 4. Retry con timeout
async function retryWithTimeout(fn, options = {}) {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        timeout = 10000  // 10s max per tentativo
    } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Wrapper con timeout
            const result = await Promise.race([
                fn(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), timeout)
                )
            ]);
            
            return result;
            
        } catch (err) {
            if (attempt === maxRetries) throw err;
            
            const delayMs = baseDelay * Math.pow(2, attempt - 1);
            await delay(delayMs);
        }
    }
}

// Uso:
const data = await retryWithTimeout(
    () => fetchData(),
    { maxRetries: 5, baseDelay: 500, timeout: 5000 }
);
```
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

### Pattern 3: Timeout - Limitare Durata Operazioni

```javascript
// Timeout per async operations usando Promise.race
function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,  // Promise originale
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Operation timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        })
    ]);
}

/*
💡 Come funziona Promise.race:
- Ritorna la Promise che si risolve/rigetta PER PRIMA
- Se promise completa prima → ritorna risultato
- Se timeout scade prima → rigetta con TimeoutError

Utile per:
✅ Prevenire hang infiniti
✅ User experience (non far aspettare troppo)
✅ Resource cleanup (liberare risorse dopo timeout)
*/

// Uso base
async function example() {
    try {
        const data = await withTimeout(
            fetchSlowData(),
            5000 // Timeout 5 secondi
        );
        console.log('✅ Data received:', data);
    } catch (err) {
        if (err.message.includes('timed out')) {
            console.error('⏱️ Timeout: Operation took too long');
        } else {
            console.error('❌ Error:', err.message);
        }
    }
}

// 🎯 Advanced: Timeout con cleanup
function withTimeoutAndCleanup(promise, timeoutMs, onTimeout) {
    let timeoutHandle;
    
    const timeoutPromise = new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
            // Esegui cleanup prima di rigettare
            if (onTimeout) onTimeout();
            reject(new Error(`Timeout after ${timeoutMs}ms`));
        }, timeoutMs);
    });
    
    return Promise.race([
        promise.then(result => {
            clearTimeout(timeoutHandle);  // Cancella timeout se completa
            return result;
        }),
        timeoutPromise
    ]);
}

// Uso con cleanup
async function fetchWithCleanup(url) {
    const controller = new AbortController();
    
    try {
        const data = await withTimeoutAndCleanup(
            fetch(url, { signal: controller.signal }),
            3000,
            () => {
                console.log('⚠️ Timeout: Aborting fetch...');
                controller.abort();  // Cancella fetch in corso
            }
        );
        
        return data.json();
        
    } catch (err) {
        console.error('Fetch failed:', err.message);
        throw err;
    }
}

// 🎯 Multiple operations con timeout individuale
async function fetchMultipleWithTimeout(urls, timeoutMs = 3000) {
    const promises = urls.map(url => 
        withTimeout(fetch(url), timeoutMs)
            .then(res => ({ url, status: 'success', data: res }))
            .catch(err => ({ url, status: 'error', error: err.message }))
    );
    
    const results = await Promise.all(promises);
    
    // Analisi risultati
    const succeeded = results.filter(r => r.status === 'success');
    const timedOut = results.filter(r => r.error?.includes('timed out'));
    const failed = results.filter(r => r.status === 'error' && !r.error?.includes('timed out'));
    
    console.log(`✅ Success: ${succeeded.length}`);
    console.log(`⏱️ Timeout: ${timedOut.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    return results;
}

// 🎯 Timeout progressivo (aumenta se necessario)
async function fetchWithProgressiveTimeout(url, initialTimeout = 3000, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const timeout = initialTimeout * attempt;  // 3s, 6s, 9s
        
        try {
            console.log(`Attempt ${attempt}: Timeout ${timeout}ms`);
            const data = await withTimeout(fetch(url), timeout);
            console.log(`✅ Success on attempt ${attempt}`);
            return data;
            
        } catch (err) {
            if (err.message.includes('timed out') && attempt < maxAttempts) {
                console.log(`⏱️ Timeout, trying with longer timeout...`);
                continue;
            }
            throw err;
        }
    }
}
```

### Pattern 4: Loop con Async/Await - Sequential vs Parallel

```javascript
// ❌ SBAGLIATO: forEach non aspetta async functions!
async function badLoop(ids) {
    console.log('❌ Bad: Using forEach with async');
    
    ids.forEach(async (id) => {
        const data = await fetchData(id); // Non aspetta!
        console.log(`Fetched ${id}:`, data);
    });
    
    console.log('Done'); // ⚠️ Eseguito IMMEDIATAMENTE, non aspetta i fetch!
}

/*
⚠️ PROBLEMA con forEach:
- forEach NON aspetta Promise
- Tutte le callback async partono in parallelo
- "Done" viene loggato PRIMA dei fetch
- Non puoi controllare l'esecuzione

Output tipico:
Done                    ← Stampato subito!
Fetched 1: {...}        ← Arriva dopo
Fetched 2: {...}        ← Arriva dopo
Fetched 3: {...}        ← Arriva dopo
*/

// ✅ CORRETTO: for...of aspetta ogni iterazione
async function goodLoopSequential(ids) {
    console.log('✅ Good: Using for...of (sequential)');
    
    for (const id of ids) {
        const data = await fetchData(id); // ⏸️ Aspetta ogni fetch
        console.log(`Fetched ${id}:`, data);
    }
    
    console.log('Done'); // ✅ Eseguito DOPO tutti i fetch
}

/*
✅ COMPORTAMENTO CORRETTO:
- Ogni fetch aspetta il precedente
- Esecuzione sequenziale controllata
- "Done" arriva alla fine

Output:
Fetched 1: {...}        ← 1000ms
Fetched 2: {...}        ← 2000ms
Fetched 3: {...}        ← 3000ms
Done                    ← Alla fine

Timing: 3000ms totali (sequenziale)
*/

// ✅ PARALLELO: map + Promise.all (più veloce!)
async function goodLoopParallel(ids) {
    console.log('✅ Good: Using map + Promise.all (parallel)');
    
    // Crea array di Promise (tutte partono insieme)
    const promises = ids.map(id => fetchData(id));
    
    // Aspetta che TUTTE completino
    const results = await Promise.all(promises);
    
    // Processa risultati
    results.forEach((data, index) => {
        console.log(`Fetched ${ids[index]}:`, data);
    });
    
    console.log('Done'); // ✅ Eseguito DOPO tutti i fetch
}

/*
✅ PARALLELO - Più veloce!
Output:
Fetched 1: {...}        ← Tutti arrivano
Fetched 2: {...}        ← insieme dopo
Fetched 3: {...}        ← 1000ms!
Done

Timing: 1000ms totali (parallelo) - 3x più veloce!
*/

// 📊 CONFRONTO PERFORMANCE
async function compareLoopPatterns() {
    const ids = [1, 2, 3, 4, 5];
    
    console.log('\n=== SEQUENTIAL ===');
    console.time('Sequential');
    await goodLoopSequential(ids);
    console.timeEnd('Sequential');
    // Output: Sequential: 5000ms
    
    console.log('\n=== PARALLEL ===');
    console.time('Parallel');
    await goodLoopParallel(ids);
    console.timeEnd('Parallel');
    // Output: Parallel: 1000ms (5x faster!)
}

// 🎯 Real-World: Processa file sequenzialmente
async function processFilesSequential(files) {
    console.log(`📁 Processing ${files.length} files sequentially...`);
    
    for (const file of files) {
        console.log(`Processing ${file}...`);
        await processFile(file);  // ⏸️ Aspetta ogni file
        console.log(`✅ ${file} completed`);
    }
    
    console.log('✅ All files processed');
}

// 🎯 Real-World: Upload multiple images in parallel
async function uploadImagesParallel(images) {
    console.log(`📤 Uploading ${images.length} images in parallel...`);
    
    const uploadPromises = images.map(async (image, index) => {
        try {
            const result = await uploadImage(image);
            console.log(`✅ Image ${index + 1} uploaded: ${result.url}`);
            return { success: true, image, url: result.url };
        } catch (err) {
            console.error(`❌ Image ${index + 1} failed: ${err.message}`);
            return { success: false, image, error: err.message };
        }
    });
    
    const results = await Promise.all(uploadPromises);
    
    // Analisi
    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`📊 Results: ${succeeded} succeeded, ${failed} failed`);
    
    return results;
}

// 🎯 Advanced: Controlled concurrency (max N at time)
async function processWithConcurrencyLimit(items, fn, limit = 3) {
    const results = [];
    const executing = [];
    
    for (const item of items) {
        // Crea Promise per questo item
        const promise = fn(item).then(result => {
            // Rimuovi da executing quando completa
            executing.splice(executing.indexOf(promise), 1);
            return result;
        });
        
        results.push(promise);
        executing.push(promise);
        
        // Se raggiungiamo il limite, aspetta che uno completi
        if (executing.length >= limit) {
            await Promise.race(executing);
        }
    }
    
    // Aspetta tutti i rimanenti
    return Promise.all(results);
}

// Uso: Max 3 fetch contemporanei
const data = await processWithConcurrencyLimit(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    id => fetchData(id),
    3  // Max 3 alla volta
);
```

### Pattern 5: Conditional Async - Sincronizzazione Dinamica

```javascript
// Cache globale per dati
let cachedData = null;

async function conditionalFetch(useCache = true) {
    let data;
    
    if (useCache && cachedData) {
        // Operazione sincrona (cache hit)
        console.log('✅ Using cached data');
        data = cachedData;
    } else {
        // Operazione asincrona (cache miss o disabled)
        console.log('🔍 Fetching fresh data...');
        data = await fetchData();
        cachedData = data;  // Aggiorna cache
        console.log('✅ Data fetched and cached');
    }
    
    return data;
}

/*
💡 Pattern utile per:
- Cache con fallback a fetch
- Lazy loading (carica solo se necessario)
- Conditional operations basate su flags
- Performance optimization (skip se già disponibile)
*/

// 🎯 Real-World: Lazy initialization
class DatabaseConnection {
    constructor(config) {
        this.config = config;
        this.connection = null;  // Non connesso inizialmente
    }
    
    async getConnection() {
        // Se già connesso, ritorna subito (sincrono)
        if (this.connection) {
            console.log('✅ Using existing connection');
            return this.connection;
        }
        
        // Altrimenti connetti (asincrono)
        console.log('🔌 Establishing connection...');
        this.connection = await this.connect();
        console.log('✅ Connection established');
        
        return this.connection;
    }
    
    async connect() {
        // Simula connessione DB
        await delay(1000);
        return { connected: true, id: Math.random() };
    }
    
    async query(sql) {
        // Ottieni connessione (lazy init)
        const conn = await this.getConnection();
        
        // Esegui query
        return conn.execute(sql);
    }
}

// Uso:
const db = new DatabaseConnection(config);
await db.query('SELECT * FROM users');  // Prima volta: connect + query
await db.query('SELECT * FROM posts');  // Successive: solo query

// 🎯 Advanced: Multi-level cache
async function fetchWithMultiLevelCache(key) {
    // Level 1: Memory cache (più veloce)
    if (memoryCache.has(key)) {
        console.log('✅ Memory cache hit');
        return memoryCache.get(key);
    }
    
    // Level 2: Redis cache (veloce)
    const redisData = await redis.get(key).catch(() => null);
    if (redisData) {
        console.log('✅ Redis cache hit');
        memoryCache.set(key, redisData);  // Aggiorna memory cache
        return redisData;
    }
    
    // Level 3: Database (lento)
    console.log('🔍 Database query');
    const dbData = await db.query(`SELECT * FROM data WHERE key = ?`, [key]);
    
    // Aggiorna tutti i livelli di cache
    await redis.set(key, dbData);
    memoryCache.set(key, dbData);
    
    return dbData;
}

// 🎯 Conditional parallel execution
async function smartLoad(options) {
    const promises = [];
    
    // Condizionalmente aggiungi operazioni
    if (options.loadUser) {
        promises.push(fetchUser());
    }
    
    if (options.loadPosts) {
        promises.push(fetchPosts());
    }
    
    if (options.loadComments) {
        promises.push(fetchComments());
    }
    
    // Se nessuna operazione, ritorna subito
    if (promises.length === 0) {
        console.log('ℹ️ Nothing to load');
        return {};
    }
    
    // Altrimenti esegui in parallelo
    console.log(`🚀 Loading ${promises.length} resources...`);
    const results = await Promise.all(promises);
    
    // Costruisci oggetto risultato
    let index = 0;
    const data = {};
    
    if (options.loadUser) data.user = results[index++];
    if (options.loadPosts) data.posts = results[index++];
    if (options.loadComments) data.comments = results[index++];
    
    return data;
}

// Uso:
const data1 = await smartLoad({ loadUser: true, loadPosts: true });
// Carica solo user e posts

const data2 = await smartLoad({ loadUser: false, loadPosts: false });
// Non carica nulla (ritorna {})
```

### Pattern 6: Sequential Batch Processing - Rate Limiting

```javascript
// Processa items in batch sequenziali
async function processBatch(items, batchSize = 10) {
    console.log(`📦 Processing ${items.length} items in batches of ${batchSize}...`);
    const results = [];
    const startTime = Date.now();
    
    // Calcola numero di batch
    const totalBatches = Math.ceil(items.length / batchSize);
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batchNumber = Math.floor(i / batchSize) + 1;
        const batch = items.slice(i, i + batchSize);
        
        console.log(`\n🔄 Batch ${batchNumber}/${totalBatches}: Processing ${batch.length} items...`);
        console.time(`Batch ${batchNumber}`);
        
        // Processa batch in parallelo (tutte insieme)
        const batchResults = await Promise.all(
            batch.map((item, index) => {
                const globalIndex = i + index;
                return processItem(item, globalIndex);
            })
        );
        
        console.timeEnd(`Batch ${batchNumber}`);
        results.push(...batchResults);
        
        // Aspetta un po' tra i batch (rate limiting)
        if (i + batchSize < items.length) {
            const delayMs = 1000;
            console.log(`⏳ Waiting ${delayMs}ms before next batch...`);
            await delay(delayMs);
        }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`\n✅ All batches complete in ${totalTime}ms`);
    console.log(`📊 Processed ${results.length} items`);
    
    return results;
}

/*
📊 BATCH PROCESSING TIMELINE (10 items, batch=3):

Batch 1: items 0-2  ─┐
                     ├─ Parallel (max 3 concurrent)
                     ┘
    ↓ Wait 1000ms
    
Batch 2: items 3-5  ─┐
                     ├─ Parallel (max 3 concurrent)
                     ┘
    ↓ Wait 1000ms
    
Batch 3: items 6-8  ─┐
                     ├─ Parallel (max 3 concurrent)
                     ┘
    ↓ Wait 1000ms
    
Batch 4: item 9     ─── Solo 1 item (ultimo batch)

Vantaggi:
✅ Limita carico server (max N concurrent)
✅ Previene rate limiting errors
✅ Memory friendly (non carica tutto insieme)
✅ Progress tracking facile
*/

// Helper function
async function processItem(item, index) {
    console.log(`  Processing item ${index}...`);
    await delay(Math.random() * 500 + 500);  // 500-1000ms
    console.log(`  ✅ Item ${index} done`);
    return { item, processed: true, index };
}

// 🎯 Real-World: API batch requests con error handling
async function batchAPIRequests(urls, batchSize = 5) {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        
        console.log(`\n📤 Requesting batch ${Math.floor(i/batchSize) + 1}...`);
        
        const batchPromises = batch.map(async (url, index) => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                return { url, success: true, data };
            } catch (err) {
                console.error(`❌ ${url} failed: ${err.message}`);
                errors.push({ url, error: err.message });
                return { url, success: false, error: err.message };
            }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Rate limiting: 1s tra batch
        if (i + batchSize < urls.length) {
            await delay(1000);
        }
    }
    
    // Statistiche
    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n📊 Results: ${succeeded} succeeded, ${failed} failed`);
    
    return { results, errors };
}

// 🎯 Advanced: Dynamic batch sizing basato su performance
async function adaptiveBatchProcessing(items, initialBatchSize = 10) {
    let batchSize = initialBatchSize;
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, Math.min(i + batchSize, items.length));
        
        const startTime = Date.now();
        const batchResults = await Promise.all(
            batch.map(item => processItem(item))
        );
        const batchTime = Date.now() - startTime;
        
        results.push(...batchResults);
        
        // Adatta batch size basato su performance
        const avgTimePerItem = batchTime / batch.length;
        
        if (avgTimePerItem < 100) {
            // Troppo veloce → aumenta batch size
            batchSize = Math.min(batchSize + 5, 50);
            console.log(`⬆️ Increasing batch size to ${batchSize}`);
        } else if (avgTimePerItem > 500) {
            // Troppo lento → riduci batch size
            batchSize = Math.max(batchSize - 5, 5);
            console.log(`⬇️ Decreasing batch size to ${batchSize}`);
        }
        
        await delay(500);
    }
    
    return results;
}

// 🎯 Pattern: Batch con progress callback
async function processBatchWithProgress(items, batchSize, onProgress) {
    const total = items.length;
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(item => processItem(item))
        );
        
        results.push(...batchResults);
        
        // Progress callback
        const completed = Math.min(i + batchSize, total);
        const percentage = (completed / total * 100).toFixed(1);
        
        if (onProgress) {
            onProgress({
                completed,
                total,
                percentage,
                remaining: total - completed
            });
        }
        
        await delay(100);
    }
    
    return results;
}

// Uso:
await processBatchWithProgress(items, 10, (progress) => {
    console.log(`Progress: ${progress.percentage}% (${progress.completed}/${progress.total})`);
});

// Output:
// Progress: 33.3% (10/30)
// Progress: 66.7% (20/30)
// Progress: 100.0% (30/30)
```

### Pattern 7: Promise Pool (Concurrency Limit)

```javascript
// Limita numero di Promise concorrenti
async function promisePool(tasks, poolLimit = 3) {
    console.log(`🏊 Promise pool: Max ${poolLimit} concurrent tasks`);
    const results = [];
    const executing = [];
    
    for (const task of tasks) {
        // Wrapper per task
        const promise = Promise.resolve().then(() => task());
        results.push(promise);
        
        if (poolLimit <= tasks.length) {
            // Crea execute promise che si rimuove quando completa
            const execute = promise.then(() => {
                executing.splice(executing.indexOf(execute), 1);
            });
            executing.push(execute);
            
            // Se raggiungiamo il limite, aspetta che una completi
            if (executing.length >= poolLimit) {
                await Promise.race(executing);
            }
        }
    }
    
    return Promise.all(results);
}

/*
📊 PROMISE POOL EXECUTION (10 tasks, pool=3):

Time    Active Tasks
──────────────────────────────────
0ms     [Task1, Task2, Task3]     ← Pool pieno (3)
500ms   [Task2, Task3, Task4]     ← Task1 done, Task4 starts
800ms   [Task3, Task4, Task5]     ← Task2 done, Task5 starts
1000ms  [Task4, Task5, Task6]     ← Task3 done, Task6 starts
...
3000ms  []                        ← All done

Vantaggi:
✅ Controllo preciso concurrency
✅ Previene sovraccarico risorse
✅ Memory efficient
✅ Throughput ottimizzato
*/

// 🎯 Real-World: Download files con limite
async function downloadFilesWithLimit(urls, maxConcurrent = 3) {
    console.log(`📥 Downloading ${urls.length} files (max ${maxConcurrent} at time)...`);
    
    const tasks = urls.map((url, index) => async () => {
        console.log(`  📥 Starting download ${index + 1}: ${url}`);
        const startTime = Date.now();
        
        try {
            const response = await fetch(url);
            const data = await response.blob();
            const duration = Date.now() - startTime;
            
            console.log(`  ✅ Download ${index + 1} complete (${duration}ms)`);
            return { url, success: true, size: data.size, duration };
            
        } catch (err) {
            console.error(`  ❌ Download ${index + 1} failed: ${err.message}`);
            return { url, success: false, error: err.message };
        }
    });
    
    const results = await promisePool(tasks, maxConcurrent);
    
    // Statistiche
    const succeeded = results.filter(r => r.success).length;
    const totalSize = results.reduce((sum, r) => sum + (r.size || 0), 0);
    
    console.log(`\n📊 Downloads complete:`);
    console.log(`   ✅ Success: ${succeeded}/${urls.length}`);
    console.log(`   📦 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    return results;
}

// Uso:
const urls = Array.from({ length: 20 }, (_, i) => 
    `https://example.com/file${i}.jpg`
);
await downloadFilesWithLimit(urls, 5);  // Max 5 download simultanei
```

---

## 🔄 Async/Await con Array Methods

> **💡 Teoria: Array Methods e Async/Await**
>
> Gli array methods standard (map, filter, reduce, forEach) **NON** gestiscono
> automaticamente async/await. Serve attenzione speciale!
>
> **Problema principale:**
> ```javascript
> // ❌ Questo NON funziona come ti aspetti:
> const results = array.map(async item => await process(item));
> // results è un Array<Promise>, non Array<Result>!
> ```
>
> **Soluzioni:**
> 1. **map + Promise.all**: Per operazioni parallele
> 2. **for...of loop**: Per operazioni sequenziali
> 3. **Custom async methods**: Filter/reduce asincroni
> 4. **EVITA forEach**: NON aspetta async functions!

### map() - Parallel Processing

```javascript
// ❌ SBAGLIATO: map ritorna array di Promise
async function badMap(ids) {
    const users = ids.map(async (id) => {
        return await fetchUser(id);
    });
    
    console.log(users); // [Promise, Promise, Promise] ← NON risolte!
    return users; // ❌ Non quello che vuoi!
}

// ✅ CORRETTO: Usa Promise.all per aspettare tutte
async function goodMap(ids) {
    console.log('✅ Using map + Promise.all');
    
    // Step 1: map crea array di Promise
    const promises = ids.map(id => fetchUser(id));
    console.log(`Created ${promises.length} promises`);
    
    // Step 2: Promise.all aspetta tutte
    const users = await Promise.all(promises);
    console.log(`Resolved ${users.length} users`);
    
    console.log(users); // [User, User, User] ← Oggetti risolti!
    return users; // ✅ Corretto!
}

/*
📊 TIMING COMPARISON:

Bad map (non aspetta):
- map: 1ms (crea Promise)
- return: Array<Promise> immediately
- Total: ~1ms (ma dati non disponibili!)

Good map (aspetta con Promise.all):
- map: 1ms (crea Promise)
- Promise.all: 1000ms (aspetta la più lenta)
- return: Array<User> con dati
- Total: ~1001ms (dati pronti!)
*/

// ✅ ALTERNATIVA: for...of (sequential)
async function alternativeMap(ids) {
    console.log('✅ Using for...of (sequential)');
    const users = [];
    
    for (const id of ids) {
        const user = await fetchUser(id);  // ⏸️ Aspetta ogni fetch
        users.push(user);
    }
    
    return users;
}

// 🎯 Real-World: Fetch e trasforma dati
async function fetchAndTransformUsers(ids) {
    console.log(`📥 Fetching ${ids.length} users...`);
    
    // Fetch in parallelo
    const usersPromises = ids.map(async (id) => {
        const user = await fetchUser(id);
        
        // Trasforma dati
        return {
            id: user.id,
            name: user.name.toUpperCase(),
            email: user.email.toLowerCase(),
            createdAt: new Date(user.created)
        };
    });
    
    const users = await Promise.all(usersPromises);
    
    console.log(`✅ Fetched and transformed ${users.length} users`);
    return users;
}

// 🎯 Con error handling per singolo item
async function mapWithErrorHandling(ids) {
    const promises = ids.map(async (id) => {
        try {
            return await fetchUser(id);
        } catch (err) {
            console.error(`❌ Failed to fetch user ${id}:`, err.message);
            return null;  // Fallback per item fallito
        }
    });
    
    const results = await Promise.all(promises);
    
    // Filtra null values (failed items)
    return results.filter(user => user !== null);
}
```

### filter() - Async Filtering

```javascript
// Filter asincrono (custom implementation)
async function asyncFilter(array, predicate) {
    console.log(`🔍 Async filtering ${array.length} items...`);
    
    // Step 1: Applica predicate a tutti gli item in parallelo
    const results = await Promise.all(
        array.map(predicate)
    );
    
    // Step 2: Filtra array originale basato su results
    return array.filter((_, index) => results[index]);
}

/*
💡 Come funziona:
1. map crea array di Promise (predicate per ogni item)
2. Promise.all risolve tutte le Promise → array di boolean
3. filter usa i boolean per decidere quali item tenere

Esempio:
array = [1, 2, 3, 4, 5]
predicate = async num => (await checkIfEven(num))
results = [false, true, false, true, false]
filtered = [2, 4]
*/

// Uso
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evenNumbers = await asyncFilter(numbers, async (num) => {
    // Simula check asincrono
    await delay(100);
    return num % 2 === 0;
});

console.log('Even numbers:', evenNumbers); // [2, 4, 6, 8, 10]

// 🎯 Real-World: Filtra utenti attivi (check API)
async function getActiveUsers(users) {
    console.log(`🔍 Checking ${users.length} users...`);
    
    const activeUsers = await asyncFilter(users, async (user) => {
        try {
            // Check se utente è attivo via API
            const status = await checkUserStatus(user.id);
            return status.active;
        } catch (err) {
            console.error(`❌ Failed to check user ${user.id}`);
            return false;  // Assume not active se check fallisce
        }
    });
    
    console.log(`✅ Found ${activeUsers.length} active users`);
    return activeUsers;
}

// 🎯 Sequential filter (quando ordine è importante)
async function asyncFilterSequential(array, predicate) {
    const filtered = [];
    
    for (const item of array) {
        // Check sequenziale
        const shouldInclude = await predicate(item);
        if (shouldInclude) {
            filtered.push(item);
        }
    }
    
    return filtered;
}

// 🎯 Advanced: Filter con early exit (stop al primo match)
async function asyncFindFirst(array, predicate) {
    for (const item of array) {
        const matches = await predicate(item);
        if (matches) {
            console.log('✅ Found match, stopping search');
            return item;  // Ritorna primo match
        }
    }
    
    return null;  // Nessun match trovato
}

// Uso:
const firstAvailable = await asyncFindFirst(servers, async (server) => {
    const isOnline = await pingServer(server.url);
    return isOnline;
});

console.log('First available server:', firstAvailable);
```

### reduce() - Async Reduction

```javascript
// Reduce sequenziale con async
async function asyncReduce(array, reducer, initialValue) {
    console.log(`🔄 Async reducing ${array.length} items...`);
    let accumulator = initialValue;
    
    for (const item of array) {
        // Applica reducer sequenzialmente
        accumulator = await reducer(accumulator, item);
    }
    
    return accumulator;
}

/*
💡 Perché sequenziale:
- reduce dipende dall'accumulator del passo precedente
- Ogni iterazione DEVE aspettare la precedente
- Non parallelizzabile per natura

Flow:
acc = initialValue
acc = await reducer(acc, item1)
acc = await reducer(acc, item2)
acc = await reducer(acc, item3)
return acc
*/

// 🎯 Uso: Calcola dimensione totale di file
const urls = [
    'https://example.com/file1.jpg',
    'https://example.com/file2.jpg',
    'https://example.com/file3.jpg'
];

const totalSize = await asyncReduce(
    urls,
    async (total, url) => {
        console.log(`  Fetching size for ${url}...`);
        const size = await fetchFileSize(url);
        console.log(`  Size: ${size} bytes`);
        return total + size;
    },
    0  // Initial: 0 bytes
);

console.log(`Total size: ${totalSize} bytes (${(totalSize/1024/1024).toFixed(2)} MB)`);

// Output:
//   Fetching size for .../file1.jpg...
//   Size: 1048576 bytes
//   Fetching size for .../file2.jpg...
//   Size: 2097152 bytes
//   Fetching size for .../file3.jpg...
//   Size: 3145728 bytes
// Total size: 6291456 bytes (6.00 MB)

// 🎯 Real-World: Chain API calls con accumulo dati
async function fetchUserDataChain(userId) {
    const endpoints = [
        `/users/${userId}`,
        `/users/${userId}/posts`,
        `/users/${userId}/comments`,
        `/users/${userId}/likes`
    ];
    
    // Accumula dati da ogni endpoint
    const completeData = await asyncReduce(
        endpoints,
        async (data, endpoint) => {
            console.log(`  📥 Fetching ${endpoint}...`);
            const response = await fetch(`https://api.example.com${endpoint}`);
            const json = await response.json();
            
            // Merge con dati esistenti
            return { ...data, ...json };
        },
        {}  // Initial: oggetto vuoto
    );
    
    return completeData;
}

// 🎯 Advanced: Reduce con error handling
async function asyncReduceWithErrors(array, reducer, initialValue) {
    let accumulator = initialValue;
    const errors = [];
    
    for (const [index, item] of array.entries()) {
        try {
            accumulator = await reducer(accumulator, item, index);
        } catch (err) {
            console.error(`❌ Error at index ${index}:`, err.message);
            errors.push({ index, item, error: err.message });
            // Continua con prossimo item invece di bloccare
        }
    }
    
    return { result: accumulator, errors };
}

// 🎯 Pipeline di trasformazioni async
async function processPipeline(data, transformers) {
    console.log('🔄 Running async pipeline...');
    
    const result = await asyncReduce(
        transformers,
        async (data, transformer) => {
            console.log(`  Applying ${transformer.name}...`);
            return await transformer.fn(data);
        },
        data  // Initial data
    );
    
    console.log('✅ Pipeline complete');
    return result;
}

// Uso:
const pipeline = [
    { name: 'fetch', fn: async (id) => await fetchUser(id) },
    { name: 'validate', fn: async (user) => await validateUser(user) },
    { name: 'enrich', fn: async (user) => await enrichUserData(user) },
    { name: 'transform', fn: async (user) => await transformForDisplay(user) }
];

const processed = await processPipeline(userId, pipeline);

// Output:
// 🔄 Running async pipeline...
//   Applying fetch...
//   Applying validate...
//   Applying enrich...
//   Applying transform...
// ✅ Pipeline complete

// 🎯 Parallel reduce (per operazioni indipendenti)
async function parallelReduce(array, mapper, reducer, initialValue) {
    // Step 1: Mappa in parallelo
    const mappedValues = await Promise.all(array.map(mapper));
    
    // Step 2: Reduce sincrono (veloce)
    return mappedValues.reduce(reducer, initialValue);
}

// Uso: Somma di valori fetchati
const sum = await parallelReduce(
    [1, 2, 3, 4, 5],
    async (num) => await fetchValue(num),  // Parallel fetch
    (acc, val) => acc + val,                // Sync reduction
    0
);
```

### forEach() - ⚠️ NON USARE CON ASYNC!

```javascript
// ❌ PERICOLOSO: forEach NON aspetta async functions!
async function dangerousForEach(ids) {
    console.log('Start');
    
    // ⚠️ forEach non aspetta le async callback
    ids.forEach(async (id) => {
        const data = await fetchData(id);
        console.log('Data:', data);
    });
    
    console.log('End'); // ⚠️ Eseguito IMMEDIATAMENTE, prima dei fetch!
}

/*
❌ PROBLEMA CRITICO:

Output:
Start
End           ← Stampato SUBITO!
Data: {...}   ← Arriva DOPO
Data: {...}   ← Arriva DOPO
Data: {...}   ← Arriva DOPO

Perché:
- forEach non è async-aware
- Callback async partono ma forEach non aspetta
- forEach completa immediatamente
- "End" viene loggato prima che i fetch completino

Conseguenze:
❌ Controllo flusso rotto
❌ Non puoi fare await sul risultato
❌ Errori difficili da debuggare
❌ Race conditions possibili
*/

// ✅ USA for...of invece (aspetta correttamente)
async function safeForOf(ids) {
    console.log('Start');
    
    // ✅ for...of aspetta ogni iterazione
    for (const id of ids) {
        const data = await fetchData(id);
        console.log('Data:', data);
    }
    
    console.log('End'); // ✅ Eseguito DOPO tutti i fetch
}

/*
✅ OUTPUT CORRETTO:

Start
Data: {...}   ← Aspetta e stampa
Data: {...}   ← Aspetta e stampa
Data: {...}   ← Aspetta e stampa
End           ← Stampato ALLA FINE

Perché:
✅ for...of supporta await
✅ Ogni iterazione aspetta la precedente
✅ Controllo flusso prevedibile
✅ Facile da debuggare
*/

// 📊 CONFRONTO DIRETTO
async function demonstrateProblem() {
    const ids = [1, 2, 3];
    
    console.log('\n=== forEach (BROKEN) ===');
    console.time('forEach');
    
    ids.forEach(async (id) => {
        await delay(1000);
        console.log(`  Processed ${id}`);
    });
    
    console.log('  forEach completed?');
    console.timeEnd('forEach');
    // Output: ~0ms (NON ha aspettato!)
    
    await delay(2000);  // Aspetta per vedere i log tardivi
    
    console.log('\n=== for...of (CORRECT) ===');
    console.time('for...of');
    
    for (const id of ids) {
        await delay(1000);
        console.log(`  Processed ${id}`);
    }
    
    console.log('  for...of completed!');
    console.timeEnd('for...of');
    // Output: ~3000ms (HA aspettato!)
}

// Output:
// === forEach (BROKEN) ===
//   forEach completed?
// forEach: 1ms
//   Processed 1      ← Arriva DOPO!
//   Processed 2      ← Arriva DOPO!
//   Processed 3      ← Arriva DOPO!
//
// === for...of (CORRECT) ===
//   Processed 1
//   Processed 2
//   Processed 3
//   for...of completed!
// for...of: 3002ms

// 🎯 Quando PUOI usare forEach (senza async)
async function prepareData() {
    const data = await fetchData();
    
    // ✅ OK: forEach con sync callback
    const transformed = [];
    data.forEach(item => {
        // Operazione sincrona OK
        transformed.push(item.toUpperCase());
    });
    
    return transformed;
}

// ❌ Se DEVI fare async dentro forEach, usa for...of
async function processItems(items) {
    // ❌ NO:
    // items.forEach(async item => await process(item));
    
    // ✅ YES:
    for (const item of items) {
        await process(item);
    }
}

// 🎯 Alternative moderne

// Opzione 1: for...of (sequential)
async function sequential(items) {
    for (const item of items) {
        await processItem(item);
    }
}

// Opzione 2: map + Promise.all (parallel)
async function parallel(items) {
    await Promise.all(items.map(item => processItem(item)));
}

// Opzione 3: for await...of (async iterables)
async function* asyncGenerator(items) {
    for (const item of items) {
        yield await processItem(item);
    }
}

async function useAsyncIterator(items) {
    for await (const result of asyncGenerator(items)) {
        console.log(result);
    }
}

/*
📋 REGOLA D'ORO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ NON USARE MAI forEach con async/await
✅ USA for...of per operazioni sequenziali
✅ USA map + Promise.all per operazioni parallele
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
```
    
    for (const id of ids) {
        const data = await fetchData(id);
        console.log('Data:', data);
    }
    
    console.log('End'); // Eseguito DOPO tutti i dati
}
```

---

## ⚠️ Errori Comuni e Antipattern

### ❌ 1. Dimenticare `await` - L'Errore Più Comune

```javascript
/*
💡 PROBLEMA FONDAMENTALE:
Le funzioni async ritornano SEMPRE una Promise, anche se non usi await.
Senza await, ottieni la Promise, non il valore risolto.
*/

// ❌ SBAGLIATO: Manca await - ricevi Promise
async function fetchUserAndDisplay() {
    console.log('Fetching user...');
    
    // ⚠️ ERRORE: fetchUser() ritorna Promise, non User!
    const user = fetchUser(123);
    
    console.log('User:', user);  // Promise { <pending> }
    console.log('Name:', user.name);  // undefined (Promise non ha .name)
    
    // ⚠️ Tenta di usare dati che non ha ancora
    return user.name.toUpperCase();  // 💥 TypeError: Cannot read property 'toUpperCase' of undefined
}

// Output:
// Fetching user...
// User: Promise { <pending> }
// Name: undefined
// 💥 TypeError: Cannot read property 'toUpperCase' of undefined

// ✅ CORRETTO: Usa await per "estrarre" il valore
async function fetchUserAndDisplayCorrect() {
    console.log('Fetching user...');
    
    // ✅ await aspetta che Promise si risolva ed estrae il valore
    const user = await fetchUser(123);
    
    console.log('User:', user);  // { id: 123, name: 'Mario' }
    console.log('Name:', user.name);  // 'Mario'
    
    return user.name.toUpperCase();  // 'MARIO'
}

// Output:
// Fetching user...
// User: { id: 123, name: 'Mario' }
// Name: Mario
// Returns: MARIO

// 🎯 Real-World: Chain di chiamate API
async function getFullUserProfile(userId) {
    // ❌ Tutti senza await - ricevi solo Promise
    const user = fetchUser(userId);           // Promise<User>
    const posts = fetchPosts(userId);         // Promise<Post[]>
    const friends = fetchFriends(userId);     // Promise<Friend[]>
    
    console.log('User type:', typeof user);   // 'object' (Promise è un object)
    console.log('Is Promise?', user instanceof Promise);  // true
    
    // ⚠️ Tenta di combinare dati che non ha
    return {
        ...user,      // Promise, non dati!
        posts,        // Promise, non dati!
        friends       // Promise, non dati!
    };
}

// ✅ CORRETTO: await su tutte le Promise
async function getFullUserProfileCorrect(userId) {
    // ✅ Await estrae i valori risolti
    const user = await fetchUser(userId);
    const posts = await fetchPosts(userId);
    const friends = await fetchFriends(userId);
    
    console.log('User type:', typeof user);   // 'object' (User object)
    console.log('Has name?', 'name' in user); // true
    
    return {
        ...user,      // Dati effettivi
        posts,        // Dati effettivi
        friends       // Dati effettivi
    };
}

// 📊 COME IDENTIFICARE L'ERRORE

// Segnali che manca await:
console.log(result);  // Promise { <pending> }
console.log(result);  // Promise { <resolved>: {...} }
console.log(result);  // [object Promise]

// Errori comuni che indicano missing await:
// TypeError: Cannot read property 'x' of undefined
// TypeError: result.map is not a function (array era una Promise)
// Promise viene passata dove serve un valore

// 🔍 DEBUG: Come verificare se hai una Promise
function debugValue(value) {
    console.log('Type:', typeof value);
    console.log('Is Promise?', value instanceof Promise);
    console.log('Value:', value);
    
    if (value instanceof Promise) {
        console.log('⚠️ ATTENZIONE: Hai una Promise, serve await!');
    }
}

// Uso:
const result = fetchData();  // Senza await
debugValue(result);

// Output:
// Type: object
// Is Promise? true
// Value: Promise { <pending> }
// ⚠️ ATTENZIONE: Hai una Promise, serve await!

/*
📋 REGOLA MNEMONICA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Se chiami una funzione async, DEVI usare await
(o gestire la Promise con .then())

async function doSomething() { ... }

❌ const result = doSomething();      // Promise
✅ const result = await doSomething(); // Valore
✅ doSomething().then(result => ...);  // Valore
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
```

### ❌ 2. Dimenticare `async` - SyntaxError Garantito

```javascript
/*
💡 REGOLA FONDAMENTALE:
await può essere usato SOLO dentro funzioni async.
Senza async, ottieni SyntaxError.
*/

// ❌ ERRORE: await senza async - Non compila!
function fetchAndProcess() {
    const data = await fetchData();  // 💥 SyntaxError: await is only valid in async functions
    return processData(data);
}

// 💥 Output:
// SyntaxError: await is only valid in async functions and the top level bodies of modules
//     at fetchAndProcess (file.js:2:18)

// ✅ CORRETTO: Aggiungi async alla funzione
async function fetchAndProcessCorrect() {
    const data = await fetchData();  // ✅ OK
    return processData(data);
}

// 🎯 Dove SERVE async

// ❌ Callback di array method senza async
function processItems(items) {
    return items.map((item) => {
        const result = await fetchData(item);  // 💥 SyntaxError!
        return result;
    });
}

// ✅ Callback con async
function processItemsCorrect(items) {
    return items.map(async (item) => {  // ✅ async qui
        const result = await fetchData(item);
        return result;
    });
}
// ⚠️ Attenzione: ritorna Array<Promise>!
// Serve: await Promise.all(processItemsCorrect(items))

// ❌ Event handler senza async
button.addEventListener('click', () => {
    const data = await fetchData();  // 💥 SyntaxError!
    updateUI(data);
});

// ✅ Event handler con async
button.addEventListener('click', async () => {  // ✅ async qui
    const data = await fetchData();
    updateUI(data);
});

// ❌ setTimeout callback senza async
setTimeout(() => {
    const data = await fetchData();  // 💥 SyntaxError!
    console.log(data);
}, 1000);

// ✅ setTimeout callback con async
setTimeout(async () => {  // ✅ async qui
    const data = await fetchData();
    console.log(data);
}, 1000);

// 🎯 Top-Level await (solo in moduli ES6)

// ❌ Non funziona in script normale
const data = await fetchData();  // 💥 SyntaxError (se non in modulo)

// ✅ Funziona in modulo ES6 (package.json: "type": "module")
// file.mjs o file.js con "type": "module"
const data = await fetchData();  // ✅ OK in moduli

// ✅ Oppure wrappa in async IIFE
(async () => {
    const data = await fetchData();
    console.log(data);
})();

// 📊 PATTERN COMUNE: Express middleware

// ❌ Express route senza async
app.get('/users/:id', (req, res) => {
    const user = await fetchUser(req.params.id);  // 💥 SyntaxError!
    res.json(user);
});

// ✅ Express route con async
app.get('/users/:id', async (req, res) => {  // ✅ async qui
    try {
        const user = await fetchUser(req.params.id);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🎯 Real-World: React component methods

class UserProfile extends React.Component {
    // ❌ Lifecycle method senza async (se usi await)
    componentDidMount() {
        const user = await fetchUser(this.props.userId);  // 💥 SyntaxError!
        this.setState({ user });
    }
    
    // ✅ Lifecycle method con async
    async componentDidMount() {  // ✅ async qui
        const user = await fetchUser(this.props.userId);
        this.setState({ user });
    }
    
    // ❌ Event handler senza async
    handleSubmit(event) {
        event.preventDefault();
        const result = await submitForm(this.state.data);  // 💥 SyntaxError!
    }
    
    // ✅ Event handler con async
    async handleSubmit(event) {  // ✅ async qui
        event.preventDefault();
        const result = await submitForm(this.state.data);
        this.setState({ result });
    }
}

// 🔍 Come capire se serve async

/*
Checklist:
1. Usi await nella funzione? → Serve async
2. Chiami funzioni async? → Serve async
3. Vuoi che la funzione ritorni Promise? → Serve async

Dove NON serve async:
✅ Se non usi await
✅ Se ritorni Promise già esistente
✅ Se usi solo .then()/.catch()
*/

// Non serve async (ritorna Promise direttamente)
function fetchData() {
    return fetch('/api/data').then(r => r.json());
}

// Serve async (usa await)
async function fetchData() {
    const response = await fetch('/api/data');
    return await response.json();
}

/*
📋 REGOLA MNEMONICA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
await dentro funzione? → async obbligatorio
SyntaxError con await? → Aggiungi async
Callback con await? → async nella callback

async function name() {
    await ...  ✅
}

function name() {
    await ...  💥
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
```

### ❌ 3. Await in Loop - Problema di Performance

```javascript
/*
💡 PROBLEMA CRITICO:
await in loop esegue operazioni SEQUENZIALMENTE.
Se le operazioni sono indipendenti, stai sprecando tempo!
*/

// ❌ LENTO: await in loop (sequenziale)
async function fetchAllUsersSequential(ids) {
    console.time('Sequential');
    const results = [];
    
    // ⚠️ Esegue UN fetch alla volta
    for (const id of ids) {
        console.log(`  Fetching user ${id}...`);
        const user = await fetchUser(id);  // Aspetta ogni volta
        results.push(user);
    }
    
    console.timeEnd('Sequential');
    return results;
}

// Esecuzione con 5 utenti (500ms ciascuno):
// Timeline:
// t=0ms    : Fetch user 1 ━━━━━━━━━━ completa
// t=500ms  : Fetch user 2 ━━━━━━━━━━ completa
// t=1000ms : Fetch user 3 ━━━━━━━━━━ completa
// t=1500ms : Fetch user 4 ━━━━━━━━━━ completa
// t=2000ms : Fetch user 5 ━━━━━━━━━━ completa
// TOTALE: 2500ms

// Output:
//   Fetching user 1...
//   Fetching user 2...
//   Fetching user 3...
//   Fetching user 4...
//   Fetching user 5...
// Sequential: 2514ms

// ✅ VELOCE: Promise.all (parallelo)
async function fetchAllUsersParallel(ids) {
    console.time('Parallel');
    
    // ✅ Lancia TUTTI i fetch contemporaneamente
    const promises = ids.map(id => {
        console.log(`  Launching fetch for user ${id}...`);
        return fetchUser(id);
    });
    
    // ✅ Aspetta che TUTTI completino
    const results = await Promise.all(promises);
    
    console.timeEnd('Parallel');
    return results;
}

// Esecuzione con 5 utenti (500ms ciascuno):
// Timeline:
// t=0ms   : Fetch tutti gli utenti ━━━━━━━━━━
// t=500ms : Tutti completati!
// TOTALE: 500ms (5x più veloce!)

// Output:
//   Launching fetch for user 1...
//   Launching fetch for user 2...
//   Launching fetch for user 3...
//   Launching fetch for user 4...
//   Launching fetch for user 5...
// Parallel: 512ms

// 📊 CONFRONTO DIRETTO
async function comparePerformance() {
    const ids = [1, 2, 3, 4, 5];
    
    // Sequential
    console.log('\n=== SEQUENTIAL ===');
    await fetchAllUsersSequential(ids);
    // 2514ms
    
    // Parallel
    console.log('\n=== PARALLEL ===');
    await fetchAllUsersParallel(ids);
    // 512ms
    
    console.log('\n💡 Speedup: 5x faster!');
}

// 🎯 QUANDO usare sequential vs parallel

// ✅ USA SEQUENTIAL se:
// - Ogni operazione DIPENDE dalla precedente
// - Vuoi limitare il carico sul server
// - L'ordine di esecuzione è importante

async function sequentialExample() {
    // ✅ Dipendenze: ogni step usa risultato del precedente
    const user = await fetchUser(userId);
    const profile = await fetchProfile(user.profileId);
    const settings = await fetchSettings(profile.settingsId);
    
    return { user, profile, settings };
}

// ✅ Rate limiting: processa batch di 10 con pausa
async function batchedSequential(items) {
    for (let i = 0; i < items.length; i += 10) {
        const batch = items.slice(i, i + 10);
        await Promise.all(batch.map(processItem));
        await delay(1000);  // Pausa tra batch
    }
}

// ✅ USA PARALLEL se:
// - Operazioni INDIPENDENTI (nessuna dipendenza)
// - Vuoi massima velocità
// - Server può gestire carico

async function parallelExample() {
    // ✅ Indipendenti: possono eseguire contemporaneamente
    const [user, posts, comments] = await Promise.all([
        fetchUser(userId),
        fetchPosts(userId),
        fetchComments(userId)
    ]);
    
    return { user, posts, comments };
}

// 🎯 Real-World: Fetch immagini

// ❌ LENTO: 10 immagini sequential = 10 secondi
async function loadImagesSequential(urls) {
    console.time('Load Images Sequential');
    const images = [];
    
    for (const url of urls) {
        const img = await fetch(url).then(r => r.blob());
        images.push(img);
    }
    
    console.timeEnd('Load Images Sequential');
    return images;
}
// Load Images Sequential: 10234ms

// ✅ VELOCE: 10 immagini parallel = 1 secondo
async function loadImagesParallel(urls) {
    console.time('Load Images Parallel');
    
    const images = await Promise.all(
        urls.map(url => fetch(url).then(r => r.blob()))
    );
    
    console.timeEnd('Load Images Parallel');
    return images;
}
// Load Images Parallel: 1087ms (9x più veloce!)

// 🎯 Hybrid approach: Concurrent limit

// ⚠️ Problema: troppi fetch paralleli possono sovraccaricare
// ✅ Soluzione: limita concorrenza a N

async function fetchWithConcurrencyLimit(urls, limit = 3) {
    const results = [];
    const executing = [];
    
    for (const url of urls) {
        // Crea promise per questo URL
        const promise = fetch(url).then(r => r.json()).then(result => {
            // Rimuovi da executing quando completa
            executing.splice(executing.indexOf(promise), 1);
            return result;
        });
        
        results.push(promise);
        executing.push(promise);
        
        // ✅ Se raggiunto limite, aspetta che uno completi
        if (executing.length >= limit) {
            await Promise.race(executing);
        }
    }
    
    // Aspetta che tutti completino
    return Promise.all(results);
}

// Timeline con 10 URLs e limit=3:
// t=0ms   : [URL1, URL2, URL3] ━━━━━━━━━━
// t=500ms : [URL2, URL3, URL4] ━━━━━━━━━━  (URL1 completato)
// t=600ms : [URL3, URL4, URL5] ━━━━━━━━━━  (URL2 completato)
// ...
// Max 3 contemporanei, ma più veloce di sequential

/*
📊 PERFORMANCE COMPARISON (5 operazioni da 500ms):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sequential:           2500ms  (molto lento)
Parallel:              500ms  (5x più veloce)
Concurrent (limit=2): 1500ms  (3x più veloce)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 DECISION TREE:
┌─ Operazioni indipendenti?
│  ├─ Sì → Promise.all (parallel)
│  └─ No → for...of con await (sequential)
│
├─ Troppi item paralleli?
│  └─ Sì → Concurrent limit pattern
│
└─ Dipendenze tra operazioni?
   └─ Sì → Sequential con await in loop
*/
```

### ❌ 4. Try/Catch Troppo Ampio - Cattura Troppo

```javascript
/*
💡 PROBLEMA:
Try/catch troppo ampio cattura TUTTI gli errori,
anche quelli che non volevi gestire (bug nel tuo codice).
Rende debugging difficile e maschera problemi.
*/

// ❌ CATTIVA PRATICA: catch cattura tutto
async function fetchAndProcessBad() {
    try {
        console.log('Starting...');
        
        // Fetch dati
        const user = await fetchUser(userId);
        const posts = await fetchPosts(userId);
        const comments = await fetchComments(userId);
        
        // ⚠️ Elaborazione dentro try/catch
        const processed = processData(user);  // Se questa lancia errore, viene catturato!
        const filtered = filterPosts(posts);   // Bug nel codice = catturato
        const sorted = sortComments(comments); // Errori logici = mascherati
        
        console.log('Success!');
        return { processed, filtered, sorted };
        
    } catch (err) {
        // ⚠️ Messaggio fuorviante: assume sia errore di fetch
        console.error('Fetch error:', err);
        return null;
    }
}

// Problema: Se processData() ha un bug:
// processData() → TypeError: Cannot read property 'x' of undefined
// Viene catturato e loggato come "Fetch error"!
// Difficile capire dove è il vero problema

// Output confuso:
// Starting...
// Fetch error: TypeError: Cannot read property 'x' of undefined
//     at processData (file.js:15:20)  ← Errore nel TUO codice, non nel fetch!

// ✅ MIGLIORE: try/catch specifico solo per async operations
async function fetchAndProcessGood() {
    let user, posts, comments;
    
    // ✅ Try/catch SOLO per operazioni async/fetch
    try {
        console.log('Fetching data...');
        user = await fetchUser(userId);
        posts = await fetchPosts(userId);
        comments = await fetchComments(userId);
        console.log('Data fetched successfully');
    } catch (err) {
        // ✅ Ora questo cattura SOLO errori di fetch
        console.error('Network error:', err.message);
        throw new Error(`Failed to fetch data: ${err.message}`);
    }
    
    // ✅ Elaborazione FUORI dal try/catch
    // Bug qui causeranno crash chiaro, facile da debuggare
    const processed = processData(user);
    const filtered = filterPosts(posts);
    const sorted = sortComments(comments);
    
    console.log('Processing complete');
    return { processed, filtered, sorted };
}

// Ora: Se processData() ha un bug, ottieni stack trace chiaro:
// Fetching data...
// Data fetched successfully
// 💥 TypeError: Cannot read property 'x' of undefined
//     at processData (file.js:25:15)
//     at fetchAndProcessGood (file.js:26:19)
// ✅ Chiaro che è in processData, non nel fetch!

// 🎯 PATTERN: Try/catch multipli per granularità

async function granularErrorHandling() {
    let user, posts, comments;
    
    // Try/catch separato per ogni risorsa critica
    try {
        user = await fetchUser(userId);
    } catch (err) {
        console.error('❌ Failed to fetch user:', err.message);
        user = getDefaultUser();  // Fallback specifico
    }
    
    try {
        posts = await fetchPosts(userId);
    } catch (err) {
        console.error('⚠️ Failed to fetch posts:', err.message);
        posts = [];  // Fallback: array vuoto
    }
    
    try {
        comments = await fetchComments(userId);
    } catch (err) {
        console.error('⚠️ Failed to fetch comments:', err.message);
        comments = [];  // Fallback: array vuoto
    }
    
    // ✅ Continua anche se alcuni fetch falliscono
    return processResults(user, posts, comments);
}

// Output con errori parziali:
// ❌ Failed to fetch user: Network timeout
// ⚠️ Failed to fetch posts: 404 Not Found
// ✅ Comments loaded successfully
// Processing with defaults...

// 🎯 PATTERN: Distinguere tipi di errore

async function distinguishErrors() {
    try {
        const response = await fetch('/api/data');
        
        // ✅ Gestisci errori HTTP specifici
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('RESOURCE_NOT_FOUND');
            } else if (response.status === 401) {
                throw new Error('UNAUTHORIZED');
            } else if (response.status >= 500) {
                throw new Error('SERVER_ERROR');
            }
        }
        
        return await response.json();
        
    } catch (err) {
        // ✅ Gestione specifica per tipo di errore
        switch (err.message) {
            case 'RESOURCE_NOT_FOUND':
                console.log('Resource not found, creating new...');
                return createDefaultResource();
                
            case 'UNAUTHORIZED':
                console.log('Auth required, redirecting...');
                redirectToLogin();
                return null;
                
            case 'SERVER_ERROR':
                console.error('Server error, retrying...');
                return retryRequest();
                
            default:
                // Errore di rete o altro
                console.error('Unexpected error:', err);
                throw err;
        }
    }
}

// 🎯 PATTERN: Custom error types

class NetworkError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = 'NetworkError';
        this.statusCode = statusCode;
    }
}

class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

async function customErrorHandling() {
    try {
        const response = await fetch('/api/user');
        
        if (!response.ok) {
            throw new NetworkError(
                `HTTP ${response.status}`,
                response.status
            );
        }
        
        const data = await response.json();
        
        if (!data.email) {
            throw new ValidationError('Email required', 'email');
        }
        
        return data;
        
    } catch (err) {
        // ✅ Gestione type-safe
        if (err instanceof NetworkError) {
            console.error(`Network error ${err.statusCode}: ${err.message}`);
            if (err.statusCode >= 500) {
                return retryRequest();
            }
        } else if (err instanceof ValidationError) {
            console.error(`Validation error on ${err.field}: ${err.message}`);
            return getDefaultValue(err.field);
        } else {
            console.error('Unknown error:', err);
            throw err;
        }
    }
}

// 📊 CONFRONTO DEBUGGING

// ❌ Try/catch ampio: errore mascherato
async function badDebug() {
    try {
        const data = await fetchData();
        const result = processData(data);  // Bug qui
        return result;
    } catch (err) {
        console.error('Error:', err);  // Non chiaro dove
        return null;
    }
}
// Output: "Error: Cannot read property..." - dove?

// ✅ Try/catch specifico: errore chiaro
async function goodDebug() {
    let data;
    try {
        data = await fetchData();
    } catch (err) {
        console.error('Fetch failed:', err);
        throw err;
    }
    
    // Non in try/catch - crash pulito se bug
    const result = processData(data);  // Stack trace chiaro
    return result;
}
// Output: Stack trace preciso con riga esatta

/*
📋 BEST PRACTICES per Try/Catch:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Try/catch SOLO per operazioni async/I/O
✅ Elaborazione sincrona FUORI dal try/catch
✅ Try/catch multipli per errori specifici
✅ Usa custom error types per type safety
✅ Log errori con contesto (dove, perché)
❌ Non catturare errori che non sai gestire
❌ Non mascherare bug con catch troppo ampio
❌ Non usare catch come flow control
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 QUANDO usare catch:
✅ Operazioni di rete che possono fallire
✅ File I/O che può non esistere
✅ Operazioni che richiedono fallback
✅ Validazione input utente
❌ Bug nel tuo codice (lascia crashare)
❌ Errori di programmazione (lascia propagare)
*/
```

### ❌ 5. Async Senza Await - Spreco

```javascript
/*
💡 PROBLEMA:
Dichiarare funzione async ma non usare await è ridondante.
La funzione ritorna Promise wrappata in Promise (overhead).
*/

// ❌ INUTILE: async senza await
async function pointlessAsync() {
    return 42;  // Non serve async qui
}

// Cosa succede:
// 1. Funzione ritorna 42
// 2. async lo wrappo in Promise.resolve(42)
// 3. Overhead inutile di Promise wrapping

// Equivalente a:
function pointlessAsyncEquivalent() {
    return Promise.resolve(42);
}

// ✅ NORMALE: Usa funzione normale se non serve async
function normalFunction() {
    return 42;  // Ritorna valore diretto
}

// 📊 CONFRONTO PERFORMANCE

// ❌ Async senza await - overhead di Promise
async function asyncNoAwait() {
    const x = 10;
    const y = 20;
    return x + y;  // Overhead di Promise.resolve()
}

// ✅ Funzione normale - più efficiente
function normalNoAsync() {
    const x = 10;
    const y = 20;
    return x + y;  // Ritorno diretto
}

// Benchmark:
// normalNoAsync:  0.002ms
// asyncNoAwait:   0.015ms  (7x più lento per overhead Promise)

// 🎯 QUANDO async è NECESSARIO

// ✅ Caso 1: Usi await
async function needsAsync() {
    const data = await fetchData();  // ✅ await presente
    return data;
}

// ✅ Caso 2: Vuoi wrappare in Promise
async function wrapInPromise() {
    try {
        const result = someSync Operation();
        return result;  // ✅ async garantisce ritorno Promise
    } catch (err) {
        throw err;  // ✅ Errori diventano rejected Promise
    }
}

// ✅ Caso 3: Interfaccia richiede Promise
interface DataService {
    fetchData(): Promise<Data>;  // Richiede Promise
}

class MyService implements DataService {
    // ✅ async garantisce ritorno Promise
    async fetchData() {
        // Anche se non uso await qui, ritorna Promise
        return this.cache.get('data');
    }
}

// 🎯 PATTERN COMUNI - Quando SERVE async

// ❌ Non serve async
async function getUser() {
    return { id: 1, name: 'Mario' };  // Dati statici
}

// ✅ Normale è meglio
function getUser() {
    return { id: 1, name: 'Mario' };
}

// ❌ Non serve async (ritorna Promise già esistente)
async function fetchData() {
    return fetch('/api/data');  // fetch già ritorna Promise
}

// ✅ Normale è meglio (Promise passthrough)
function fetchData() {
    return fetch('/api/data');  // Ritorna Promise direttamente
}

// ✅ Serve async (usa await)
async function fetchAndParse() {
    const response = await fetch('/api/data');  // ✅ await qui
    return await response.json();                // ✅ await qui
}

// 🎯 ECCEZIONE: async per error handling uniforme

// Scenario: Vuoi che tutti i metodi ritornino Promise

class UserService {
    // ✅ async anche senza await: uniformità dell'interfaccia
    async getFromCache(id) {
        // Sincrono ma ritorna Promise per consistenza
        return this.cache[id] || null;
    }
    
    // ✅ async con await
    async getFromDB(id) {
        return await db.query('SELECT * FROM users WHERE id = ?', [id]);
    }
    
    // ✅ Chiamante non deve sapere quale è sync/async
    async getUser(id) {
        // Entrambi ritornano Promise
        return await this.getFromCache(id) || await this.getFromDB(id);
    }
}

// 🎯 Real-World: Express middleware

// ❌ Async inutile
app.get('/health', async (req, res) => {
    res.json({ status: 'ok' });  // Nessun await
});

// ✅ Normale è meglio
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ✅ Async necessario
app.get('/users/:id', async (req, res) => {
    try {
        const user = await db.getUser(req.params.id);  // ✅ await
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🎯 Promise.resolve() esplicito vs async

// Opzione 1: async (più leggibile)
async function getConfig() {
    return { port: 3000, host: 'localhost' };
}

// Opzione 2: Promise.resolve (più esplicito)
function getConfig() {
    return Promise.resolve({ port: 3000, host: 'localhost' });
}

// Opzione 3: Normale (più efficiente)
function getConfig() {
    return { port: 3000, host: 'localhost' };
}

// Quando usare quale?
// - async: Se interfaccia richiede Promise e vuoi consistenza
// - Promise.resolve: Se vuoi essere esplicito sul ritorno Promise
// - Normale: Se non serve Promise (preferibile per performance)

// 📊 MEMORY OVERHEAD

// ❌ Async senza await - crea Promise inutilmente
async function calculate(a, b) {
    return a + b;  // Overhead: Promise wrapping
}

// 1M chiamate:
// - Memory: +15MB per Promise objects
// - Time: +120ms per Promise overhead

// ✅ Normale - zero overhead
function calculate(a, b) {
    return a + b;  // Zero overhead
}

// 1M chiamate:
// - Memory: baseline
// - Time: baseline

/*
📋 CHECKLIST: Serve async?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Usi await nella funzione?              → async
✅ Interfaccia richiede Promise?          → async
✅ Vuoi error handling uniforme?          → async
✅ Vuoi che errori sync diventino Promise? → async
❌ Solo codice sincrono?                  → NO async
❌ Ritorno Promise già esistente?         → NO async
❌ Dati statici/compute?                  → NO async
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 REGOLA PRATICA:
If (hasAwaitKeyword || needsPromiseInterface) {
    useAsync();
} else {
    useNormalFunction();  // Più efficiente
}

⚠️ ECCEZIONE: Team consistency
Se il tuo team preferisce async su TUTTO per consistenza,
va bene (piccolo overhead accettabile per leggibilità).
*/
```

### ❌ 6. Return await - Ridondante (Ma Non Sempre!)

```javascript
/*
💡 CONTROVERSIA:
"return await" è tecnicamente ridondante MA ha un caso d'uso importante!
La regola è più sottile di quanto sembra.
*/

// ❌ RIDONDANTE: return await senza try/catch
async function redundant() {
    return await fetchData();  // await inutile
}

// Perché ridondante?
// 1. fetchData() ritorna Promise
// 2. await aspetta Promise e estrae valore
// 3. return wrappo valore in Promise di nuovo
// 4. Stesso risultato di ritornare Promise direttamente

// ✅ PULITO: return diretto (stessa semantica)
async function clean() {
    return fetchData();  // Ritorna Promise direttamente
}

// Entrambe ritornano Promise che si risolve con gli stessi dati
await redundant();  // Promise { data }
await clean();      // Promise { data } - identico!

// 📊 CONFRONTO PERFORMANCE

// ❌ return await - overhead microtask
async function withAwait() {
    return await fetchData();
}

// ✅ return diretto - più efficiente
async function withoutAwait() {
    return fetchData();
}

// Performance (1M calls):
// withoutAwait: 1523ms
// withAwait:    1687ms  (10% più lento)

// 🎯 ⚠️ ECCEZIONE CRITICA: Con try/catch

// ❌ SBAGLIATO: return senza await con try/catch
async function brokenErrorHandling() {
    try {
        return fetchData();  // ⚠️ Promise ritornata immediatamente!
    } catch (err) {
        console.error('Error:', err);  // ⚠️ NON cattura errori!
        return null;
    }
}

/*
❌ PROBLEMA:
1. fetchData() ritorna Promise
2. return ritorna Promise immediatamente (non aspetta)
3. try/catch NON copre errori della Promise
4. Se fetchData() fallisce, errore non catturato!

Flow:
- try { return promise }  → Ritorna Promise subito
- Errori nella Promise NON entrano nel catch
- Unhandled rejection!
*/

// Test che mostra il problema:
brokenErrorHandling()
    .then(data => console.log('Success:', data))
    .catch(err => console.error('Caught:', err));

// Se fetchData() fallisce:
// Caught: Error: fetch failed  ← Catturato dal .catch esterno
// NON dal catch interno!

// ✅ CORRETTO: return await con try/catch
async function correctErrorHandling() {
    try {
        return await fetchData();  // ✅ await necessario!
    } catch (err) {
        console.error('Error:', err);  // ✅ Cattura errori
        return null;
    }
}

/*
✅ SOLUZIONE:
1. fetchData() ritorna Promise
2. await aspetta Promise e estrae valore/errore
3. Se Promise fallisce, lancia errore
4. Errore viene catturato dal catch
5. Return eseguito solo se successo

Flow:
- try { await promise }  → Aspetta e estrae
- Se errore, catch lo gestisce
- Se successo, ritorna valore
*/

// Test:
correctErrorHandling()
    .then(data => console.log('Success:', data));

// Se fetchData() fallisce:
// Error: fetch failed  ← Loggato dal catch interno
// Success: null        ← Ritorna null come fallback

// 🎯 QUANDO usare return await

// ❌ NON serve (nessun try/catch)
async function case1() {
    const data = await fetchData();
    return data;  // ✅ OK
}

async function case1Short() {
    return await fetchData();  // ❌ Ridondante
}

async function case1Best() {
    return fetchData();  // ✅ Meglio: diretto
}

// ✅ SERVE (con try/catch)
async function case2() {
    try {
        return await fetchData();  // ✅ Necessario per catch
    } catch (err) {
        console.error(err);
        return null;
    }
}

// ✅ SERVE (con finally che dipende da await)
async function case3() {
    try {
        return await fetchData();  // ✅ Necessario per finally timing
    } finally {
        cleanup();  // Eseguito DOPO che Promise completa
    }
}

// ❌ NON serve (finally non dipende)
async function case3Alt() {
    try {
        return fetchData();  // ✅ OK se finally non dipende
    } finally {
        cleanup();  // Eseguito subito
    }
}

// 🎯 Real-World: API con retry

// ❌ SBAGLIATO: catch non funziona
async function apiCallBroken(url) {
    try {
        return fetch(url).then(r => r.json());  // ⚠️ catch non cattura
    } catch (err) {
        console.error('Retry...');
        return apiCallBroken(url);  // Non eseguito mai!
    }
}

// ✅ CORRETTO: await per catch
async function apiCallCorrect(url) {
    try {
        const response = await fetch(url);  // ✅ catch funziona
        return await response.json();
    } catch (err) {
        console.error('Retry...');
        return apiCallCorrect(url);  // ✅ Eseguito su errore
    }
}

// 🎯 Multiple await in try

async function multipleOperations() {
    try {
        const user = await fetchUser();       // ✅ await per catch
        const posts = await fetchPosts(user.id);  // ✅ await per catch
        const comments = await fetchComments(user.id);  // ✅ await per catch
        
        return { user, posts, comments };  // ✅ return diretto OK
    } catch (err) {
        console.error('One of the fetches failed:', err);
        throw err;
    }
}

// 📊 DECISION TREE

/*
┌─ Hai try/catch nella funzione?
│  ├─ Sì, catch deve gestire Promise?
│  │  └─ Sì → return await (necessario)
│  └─ No → return diretto (più efficiente)
│
├─ Hai finally che dipende da Promise?
│  └─ Sì → return await (necessario)
│
└─ Altrimenti → return diretto

Esempi:

// NO try/catch
async function f1() {
    return fetchData();  ✅
}

// try/catch MA non gestisce Promise
async function f2() {
    const data = await fetchData();
    try {
        return processData(data);  ✅ return diretto
    } catch (err) {
        // Gestisce errori di processData, non fetchData
    }
}

// try/catch GESTISCE Promise
async function f3() {
    try {
        return await fetchData();  ✅ await necessario
    } catch (err) {
        // Gestisce errori di fetchData
    }
}
*/

// 🎯 ESLint Rule

// ESLint: no-return-await
// ✅ Abilita: cattura return await inutili
// ⚠️ Ma ha false positive con try/catch!

// Configurazione raccomandata:
{
    "rules": {
        "no-return-await": "off",  // Disabilita (troppi false positive)
        "@typescript-eslint/return-await": ["error", "in-try-catch"]  // ✅ Meglio
    }
}

/*
📋 REGOLA MNEMONICA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
try {
    return await promise;  ✅ await NECESSARIO
} catch {}

// Senza try/catch
return promise;  ✅ return DIRETTO

// Con multiple await
try {
    await operation1();
    await operation2();
    return result;  ✅ return DIRETTO (già hai await sopra)
} catch {}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 SUMMARY:
Usa "return await" solo se:
✅ Hai try/catch che deve gestire quella Promise
✅ Hai finally che dipende da timing della Promise
❌ Altrimenti: "return" diretto più efficiente
*/
```

### ❌ 7. Unhandled Promise Rejection - Errori Silenziosi

```javascript
/*
💡 PROBLEMA CRITICO:
Promise rejection non gestite possono crashare l'app (Node.js)
o restare silenziose (browser), causando bug difficili da tracciare.
*/

// ❌ PERICOLOSO: Nessun error handling
async function dangerous() {
    const data = await fetchData();  // Se fallisce...
    return data;
}

dangerous();  // ⚠️ Se fallisce, Unhandled Promise Rejection!

// Output Node.js:
// UnhandledPromiseRejectionWarning: Error: fetch failed
//     at fetchData (file.js:5:11)
// (node:12345) UnhandledPromiseRejectionWarning: Unhandled promise rejection.
// DeprecationWarning: Unhandled promise rejections are deprecated.
// In future versions of Node.js, this will terminate the process.

// 💥 Node.js 15+: Processo TERMINA immediatamente!

// ✅ CORRETTO: Catch all'uso
dangerous().catch(err => {
    console.error('❌ Error in dangerous:', err.message);
    // Gestisci errore appropriatamente
});

// ✅ CORRETTO: Try/catch dentro funzione
async function safe() {
    try {
        const data = await fetchData();
        return data;
    } catch (err) {
        console.error('❌ Error fetching data:', err.message);
        throw err;  // Re-throw o ritorna fallback
    }
}

// ✅ CORRETTO: Top-level catch
safe()
    .then(data => console.log('Data:', data))
    .catch(err => console.error('Caught:', err.message));

// 🎯 Real-World: Express server

// ❌ PERICOLOSO: Unhandled rejection crasha server
app.get('/users/:id', async (req, res) => {
    const user = await fetchUser(req.params.id);  // ⚠️ No try/catch
    res.json(user);
});

// Se fetchUser fallisce:
// 1. UnhandledPromiseRejectionWarning
// 2. Request resta in pending (no response)
// 3. Timeout sul client dopo 30s
// 4. Server può crashare

// ✅ CORRETTO: Wrap in try/catch
app.get('/users/:id', async (req, res) => {
    try {
        const user = await fetchUser(req.params.id);
        res.json(user);
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// ✅ ALTERNATIVE: Express error middleware
app.get('/users/:id', asyncHandler(async (req, res) => {
    const user = await fetchUser(req.params.id);  // ✅ asyncHandler cattura
    res.json(user);
}));

// asyncHandler wrapper:
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

// 🎯 Global handlers (safety net)

// Node.js: Global rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    // Log to monitoring service (Sentry, Datadog, etc.)
    logToMonitoring(reason);
    // ⚠️ Considera graceful shutdown
    process.exit(1);
});

// Browser: Global rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled Rejection:', event.reason);
    // Log to error tracking
    logError(event.reason);
    // Previeni default (console error)
    event.preventDefault();
});

// 📊 PATTERN: Promise.allSettled per errori parziali

// ❌ Promise.all: fallisce se UNA Promise fallisce
async function fetchAllOrFail(ids) {
    try {
        const users = await Promise.all(
            ids.map(id => fetchUser(id))
        );
        return users;
    } catch (err) {
        // ⚠️ Se UN fetch fallisce, TUTTI falliscono
        console.error('One fetch failed, all lost:', err);
        return [];
    }
}

// Problema: ids = [1, 2, 999, 4]
// Se fetchUser(999) fallisce:
// - User 1, 2, 4 scaricati ma persi
// - Ritorna array vuoto
// - Spreco di risorse

// ✅ Promise.allSettled: gestisce errori parziali
async function fetchAllPartial(ids) {
    const results = await Promise.allSettled(
        ids.map(id => fetchUser(id))
    );
    
    const users = [];
    const errors = [];
    
    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            users.push(result.value);
        } else {
            errors.push({ id: ids[i], error: result.reason.message });
        }
    });
    
    if (errors.length > 0) {
        console.warn(`⚠️ ${errors.length} fetch(es) failed:`, errors);
    }
    
    return { users, errors };
}

// Output con ids = [1, 2, 999, 4]:
// ⚠️ 1 fetch(es) failed: [{ id: 999, error: 'User not found' }]
// Returns: {
//   users: [User1, User2, User4],  ✅ Utenti validi salvati
//   errors: [{ id: 999, error: '...' }]
// }

// 🎯 PATTERN: Catch specifico per operazione

async function robustFetch() {
    // Ogni operazione gestisce i propri errori
    const user = await fetchUser().catch(err => {
        console.error('User fetch failed:', err);
        return null;  // Fallback
    });
    
    const posts = await fetchPosts().catch(err => {
        console.error('Posts fetch failed:', err);
        return [];  // Fallback
    });
    
    const comments = await fetchComments().catch(err => {
        console.error('Comments fetch failed:', err);
        return [];  // Fallback
    });
    
    // ✅ Continua anche se alcuni fetch falliscono
    return { user, posts, comments };
}

// 📊 DEBUGGING unhandled rejections

// Enable detailed Promise tracking (Node.js)
process.on('unhandledRejection', (reason, promise) => {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ UNHANDLED PROMISE REJECTION');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Promise:', promise);
    console.error('Reason:', reason);
    console.error('Stack:', reason?.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Use --trace-warnings flag
// node --trace-warnings app.js

// Output:
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ❌ UNHANDLED PROMISE REJECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Promise: Promise { <rejected> Error: fetch failed }
// Reason: Error: fetch failed
// Stack: Error: fetch failed
//     at fetchData (file.js:15:11)
//     at dangerous (file.js:20:24)
//     at main (file.js:30:5)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/*
📋 CHECKLIST: Evita Unhandled Rejections
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Try/catch in tutte le async functions
✅ .catch() quando chiami async functions
✅ Error middleware in Express/framework
✅ Promise.allSettled per errori parziali
✅ Global handlers come safety net
✅ Monitoring per tracciare rejections
❌ Non ignorare rejection warnings
❌ Non lasciare Promise "floating"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 REGOLA MNEMONICA:
Ogni async call DEVE avere error handling:
- await dentro try/catch, oppure
- .catch() alla fine della chain

async function f() {
    try {
        await operation();  ✅
    } catch(e) {}
}

operation().catch(e => {});  ✅

await operation();  ❌ DANGEROUS!
operation();        ❌ DANGEROUS!
*/
```

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

## Navigazione

- [← Precedente: Promises in Node.js](<BB - Promises.md>)
- [↑ Indice dell’esercitazione](README.md)
- [Successiva: Callback in Node.js - Concetti avanzati →](callback_concetti_avanzati.md)
