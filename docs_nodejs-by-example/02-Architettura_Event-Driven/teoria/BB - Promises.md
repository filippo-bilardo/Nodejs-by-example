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

### **Teoria:**

Una **Promise** (promessa) è un **oggetto JavaScript** che rappresenta il risultato di un'operazione asincrona che **non è ancora disponibile**, ma lo sarà in futuro. È un'astrazione che risolve il problema del "callback hell" rendendo il codice asincrono più leggibile e manutenibile.

**Definizione formale:**
> Una Promise è un **proxy** per un valore che non è necessariamente noto quando la Promise viene creata. Permette di associare **handler** (gestori) al risultato finale di un'operazione asincrona, sia essa un successo o un fallimento.

**Caratteristiche fondamentali:**

1. **Oggetto immutabile una volta risolto**: Una volta che una Promise passa da "pending" a "fulfilled" o "rejected", il suo stato non può più cambiare
2. **Valore singolo**: Ogni Promise rappresenta UN SOLO valore futuro (non multipli come gli EventEmitter)
3. **Asincrona per natura**: Anche quando già risolta, i callback `.then()` vengono eseguiti asincronamente
4. **Composabile**: Le Promise possono essere concatenate (chained) e combinate facilmente

**Perché le Promise sono state introdotte?**

Prima di ES6 (2015), JavaScript gestiva l'asincronia solo con callback, causando:
- **Callback Hell**: Piramide del destino con nesting profondo
- **Gestione errori complessa**: Ogni callback doveva gestire separatamente gli errori
- **Difficoltà di composizione**: Combinare operazioni asincrone era verboso e error-prone
- **Debugging difficile**: Stack trace poco chiare

Le Promise risolvono questi problemi fornendo un'interfaccia standardizzata per operazioni asincrone.

**Differenza concettuale:**

```
CALLBACK:          "Chiamami quando hai finito"
PROMISE:           "Dammi una ricevuta che rappresenta il lavoro futuro"
ASYNC/AWAIT:       "Aspetta che il lavoro sia completato (sintassi sincrona)"
```

### 📖 Analogia del Mondo Reale

```
🍕 ORDINARE UNA PIZZA - Analogia Completa

═══════════════════════════════════════════════════════════════
                    APPROCCIO CALLBACK
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ TU (Client)                    PIZZERIA (Server)            │
│                                                             │
│ 1. Chiami: "Voglio una pizza"                               │
│    ──────────────────────────────────────────────────────▶  │
│                                                             │
│ 2. Fornisci callback:                                       │
│    "Quando è pronta, chiamami"                              │
│                                                             │
│ 3. BLOCCO: Devi aspettare                                   │
│    con telefono in mano                                     │
│    (Non puoi fare altro)                                    │
│                                ╔════════════════╗           │
│                                ║ Pizza in forno ║           │
│                                ║   [cooking]    ║           │
│                                ╚════════════════╝           │
│                                                             │
│ 4. ◀──────────────────────────── RING! Callback invocato    │
│    "Pizza pronta!" o "Forno rotto!"                         │
│                                                             │
│ 5. if (errore) { piangi }                                   │
│    else { ritira pizza }                                    │
└─────────────────────────────────────────────────────────────┘

❌ PROBLEMI:
   • Sei bloccato ad aspettare la chiamata
   • Se devi ordinare anche bevanda e dolce → callback hell (3 livelli)
   • Gestione errori ripetitiva ad ogni livello


═══════════════════════════════════════════════════════════════
                    APPROCCIO PROMISE
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ TU (Client)                    PIZZERIA (Server)            │
│                                                             │
│ 1. Ordini: "Voglio una pizza"                               │
│    ──────────────────────────────────────────────────────▶  │
│                                                             │
│ 2. Ricevi RICEVUTA (Promise)   ◀────────────────────────    │
│    📋 Ordine #123               ╔════════════════╗        │
│    ⏳ Status: PENDING             ║ Pizza in forno ║        │
│                                    ║   [cooking]    ║       │
│ 3. LIBERO! Fai altro:              ╚════════════════╝       │
│    • Guardi TV                                              │
│    • Leggi libro               [Tempo passa...]             │
│    • Prepari tavola                                         │
│                                                             │
│ 4. Promise cambia stato:                                    │
│    ✅ FULFILLED → Pizza pronta                              │
│    oppure                                                   │
│    ❌ REJECTED → Forno rotto                                │
│                                                             │
│ 5. I tuoi handler vengono chiamati:                         │
│    .then(pizza => mangia(pizza))                            │
│    .catch(error => ordina_altrove())                        │
└─────────────────────────────────────────────────────────────┘

✅ VANTAGGI:
   • NON sei bloccato, puoi fare altro mentre aspetti
   • Ordini multipli: Promise.all([pizza, bevanda, dolce])
   • UN SOLO .catch() per tutti gli errori
   • Codice lineare e leggibile


═══════════════════════════════════════════════════════════════
              MAPPING CONCETTI → CODICE
═══════════════════════════════════════════════════════════════

┌──────────────────────┬─────────────────────────────────────┐
│ Mondo Reale          │ Codice JavaScript                   │
├──────────────────────┼─────────────────────────────────────┤
│ Ordinare pizza       │ new Promise(...)                    │
│ Ricevuta ordine      │ Promise object                      │
│ Numero ordine        │ Promise reference                   │
│ Pizza in forno       │ Operazione asincrona in corso       │
│ Pizza pronta         │ resolve(valore)                     │
│ Forno rotto          │ reject(errore)                      │
│ Ritirare pizza       │ .then(valore => ...)                │
│ Gestire problema     │ .catch(errore => ...)               │
│ Pulire tavolo        │ .finally(() => ...)                 │
│ Ordini multipli      │ Promise.all([p1, p2, p3])           │
└──────────────────────┴─────────────────────────────────────┘
```

### 🔄 Promise vs Callback

**Teoria: Evoluzione della gestione asincrona**

La gestione delle operazioni asincrone in JavaScript è evoluta attraverso 3 generazioni:

```
GENERAZIONE 1 (Pre-ES6):  Callback
GENERAZIONE 2 (ES6/2015): Promise
GENERAZIONE 3 (ES2017):   Async/Await (syntactic sugar per Promise)
```

**Confronto pratico:**

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  ❌ GENERAZIONE 1: CALLBACK (Legacy)
// ══════════════════════════════════════════════════════════════════════════════

// Operazione: Leggere un file di testo
fs.readFile('file.txt', 'utf8', (err, data) => {
    // Parametri: (error, result) → Error-first convention
    
    if (err) {                       // Dobbiamo sempre controllare errore
        console.error(err);          // Gestione errore qui
        return;                      // Early return per evitare codice dopo
    }
    console.log(data);               // Success: usa data
});

// PROBLEMI:
// • Callback hell se operazioni multiple annidate
// • Gestione errori ripetitiva (if err in ogni callback)
// • Difficile comporre operazioni asincrone
// • Return non ritorna dalla funzione esterna


// ══════════════════════════════════════════════════════════════════════════════
//  ✅ GENERAZIONE 2: PROMISE (Moderno)
// ══════════════════════════════════════════════════════════════════════════════

fs.promises.readFile('file.txt', 'utf8')  // Ritorna Promise<string>
    .then(data => {                       // Success handler
        console.log(data);                // Data disponibile qui
        // Return automatico se non specifichi altro
    })
    .catch(err => {                       // Error handler (UN SOLO PUNTO!)
        console.error(err);               // Cattura qualsiasi errore nella catena
    });

// VANTAGGI:
// • Chaining: .then().then().then()
// • UN SOLO .catch() per tutta la catena
// • Return effettivo con valore/Promise
// • Composizione con Promise.all(), Promise.race(), etc.


// ══════════════════════════════════════════════════════════════════════════════
//  ✅✅ GENERAZIONE 3: ASYNC/AWAIT (Migliore Developer Experience)
// ══════════════════════════════════════════════════════════════════════════════

// await pausa l'esecuzione finché Promise non si risolve
// Codice SEMBRA sincrono ma È asincrono (non blocca event loop)
try {                                          // Try/catch per errori
    const data = await fs.promises.readFile(  // await "unwrap" Promise
        'file.txt',                            // Parametro 1: path
        'utf8'                                 // Parametro 2: encoding
    );                                         // data è string, non Promise!
    
    console.log(data);                        // Data disponibile direttamente
    
} catch (err) {                               // Cattura errori come codice sync
    console.error(err);                       // UN SOLO catch per tutto il try
}

// VANTAGGI:
// • Sintassi "quasi sincrona" → più leggibile
// • try/catch naturale (come codice sync)
// • Debugging più facile (stack trace chiare)
// • Variabili in scope naturalmente (const data accessibile dopo await)


// ══════════════════════════════════════════════════════════════════════════════
//  📊 CONFRONTO: Operazioni Multiple
// ══════════════════════════════════════════════════════════════════════════════

// SCENARIO: Leggere 3 file in sequenza

// ❌ CALLBACK: Piramide del destino (Callback Hell)
fs.readFile('file1.txt', 'utf8', (err1, data1) => {
    if (err1) return console.error(err1);
    
    fs.readFile('file2.txt', 'utf8', (err2, data2) => {
        if (err2) return console.error(err2);
        
        fs.readFile('file3.txt', 'utf8', (err3, data3) => {
            if (err3) return console.error(err3);
            
            console.log(data1, data2, data3);  // 4 livelli di nesting!
        });
    });
});
// Problema: Ogni livello aggiunge 1 indent → difficile leggere/mantenere


// ✅ PROMISE: Chain lineare
fs.promises.readFile('file1.txt', 'utf8')
    .then(data1 => {
        console.log('File 1:', data1);
        return fs.promises.readFile('file2.txt', 'utf8');  // Return Promise
    })
    .then(data2 => {
        console.log('File 2:', data2);
        return fs.promises.readFile('file3.txt', 'utf8');  // Return Promise
    })
    .then(data3 => {
        console.log('File 3:', data3);
    })
    .catch(err => {
        console.error('Error:', err);  // UN catch per tutti gli errori
    });
// Vantaggio: Nessun nesting, codice lineare
// Problema: Variabili data1, data2 non in scope nell'ultimo .then()


// ✅✅ ASYNC/AWAIT: Massima leggibilità
async function readFiles() {              // async = funzione ritorna Promise
    try {
        const data1 = await fs.promises.readFile('file1.txt', 'utf8');
        const data2 = await fs.promises.readFile('file2.txt', 'utf8');
        const data3 = await fs.promises.readFile('file3.txt', 'utf8');
        
        // Tutte le variabili in scope!
        console.log(data1, data2, data3);
        
    } catch (err) {                       // UN catch per tutti
        console.error('Error:', err);
    }
}
// Vantaggio: Sintassi naturale, tutte variabili in scope, facile debug


// ══════════════════════════════════════════════════════════════════════════════
//  ⚡ PERFORMANCE: Sequenziale vs Parallelo
// ══════════════════════════════════════════════════════════════════════════════

// ❌ SEQUENZIALE: Aspetta ogni operazione (LENTO)
async function sequenziale() {
    const data1 = await fs.promises.readFile('file1.txt', 'utf8'); // Aspetta
    const data2 = await fs.promises.readFile('file2.txt', 'utf8'); // Aspetta
    const data3 = await fs.promises.readFile('file3.txt', 'utf8'); // Aspetta
    return [data1, data2, data3];
}
// Tempo totale: t1 + t2 + t3 (es. 100ms + 100ms + 100ms = 300ms)


// ✅ PARALLELO: Avvia tutte le operazioni insieme (VELOCE)
async function parallelo() {
    const [data1, data2, data3] = await Promise.all([  // Tutte in parallelo!
        fs.promises.readFile('file1.txt', 'utf8'),
        fs.promises.readFile('file2.txt', 'utf8'),
        fs.promises.readFile('file3.txt', 'utf8')
    ]);
    return [data1, data2, data3];
}
// Tempo totale: max(t1, t2, t3) (es. max(100ms, 100ms, 100ms) = 100ms)
// 3X più veloce! ⚡
```

**Quando usare cosa?**

```
┌─────────────────────┬───────────────────────────────────────┐
│ Situazione          │ Approccio Consigliato                 │
├─────────────────────┼───────────────────────────────────────┤
│ Nuovo codice        │ ✅✅ async/await (sempre!)           │
│ Legacy callback API │ ✅ Promisify + async/await            │
│ Libreria pubblica   │ ✅ Ritorna Promise (consumatori       │
│                     │      scelgono .then o await)          │
│ Operazioni parallele│ ✅ Promise.all() + await              │
│ Codice sincrono     │ ⚠️  Nessuna Promise (overhead inutile)│
└─────────────────────┴───────────────────────────────────────┘
```

---

## 📊 Stati di una Promise

**Teoria:** Una Promise è una **macchina a stati finiti** (FSM) che rappresenta il risultato futuro di un'operazione asincrona. Può trovarsi in uno di **3 stati mutuamente esclusivi**.

### 🔄 Ciclo di Vita di una Promise

```
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  1️⃣ PENDING (In attesa) - Stato Iniziale                              │
│     ↓                                                                 │
│     • L'operazione asincrona è in corso                               │
│     • Non ha ancora un risultato                                      │
│     • Può transare a FULFILLED o REJECTED                             │
│     ↓                                                                 │
│  ┌───────────────────────────────┐  ┌──────────────────────────────┐  │
│  │  2️⃣ ✅ FULFILLED (Risolta)    │ │  3️⃣ ❌ REJECTED (Rigettata) │  │
│  │                               │  │                              │  │
│  │  • Operazione completata      │  │  • Operazione fallita        │  │
│  │  • Ha un VALORE di ritorno    │  │  • Ha un ERRORE/MOTIVO       │  │
│  │  • Stato FINALE (immutabile)  │  │  • Stato FINALE (immutabile) │  │
│  └───────────────────────────────┘  └──────────────────────────────┘  │
│           │                                    │                      │
│           ↓                                    ↓                      │
│      .then(onFulfilled)                   .catch(onRejected)          │
│           │                                    │                      │
│           └────────────────┬───────────────────┘                      │
│                            ↓                                          │
│                     .finally(onFinally)                               │
│                      [Eseguito sempre]                                │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘

**Concetti chiave:**

1. **PENDING** → **Stato Iniziale**
   - La Promise è appena creata
   - L'operazione asincrona è in esecuzione
   - Non puoi ancora accedere al risultato
   - Stato transitorio

2. **FULFILLED** → **Successo**
   - Operazione completata con successo
   - Ha un valore di risultato
   - Trigger per handler `.then()`
   - Stato finale e immutabile

3. **REJECTED** → **Fallimento**
   - Operazione fallita
   - Ha un motivo dell'errore (Error object)
   - Trigger per handler `.catch()`
   - Stato finale e immutabile

4. **SETTLED** → **Terminata**
   - Promise è fulfilled OR rejected
   - NON è più pending
   - Lo stato non cambierà mai più!
   - **IMMUTABILITÀ**: Garanzia fondamentale delle Promise

### 💻 Esempio Stati

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  STATO 1: PENDING (In attesa)
// ══════════════════════════════════════════════════════════════════════════════

const pendingPromise = new Promise((resolve, reject) => {
    // Operazione asincrona in corso...
    // La Promise rimane PENDING fino a resolve() o reject()
    setTimeout(() => {
        resolve('Done!');
    }, 1000);
});

console.log(pendingPromise); 
// Output: Promise { <pending> }
// La Promise è ancora in attesa (pending)

// Dopo 1 secondo:
setTimeout(() => {
    console.log(pendingPromise);
    // Output: Promise { 'Done!' }
    // Ora è FULFILLED con valore 'Done!'
}, 1500);


// ══════════════════════════════════════════════════════════════════════════════
//  STATO 2: FULFILLED (Completata con successo)
// ══════════════════════════════════════════════════════════════════════════════

const fulfilledPromise = Promise.resolve(42);
// Crea Promise GIÀ fulfilled (immediatamente risolta)

console.log(fulfilledPromise); 
// Output: Promise { 42 }
// Promise fulfilled con valore 42

// Accesso al valore tramite .then()
fulfilledPromise.then(value => {
    console.log('Valore:', value);  // Valore: 42
});


// ══════════════════════════════════════════════════════════════════════════════
//  STATO 3: REJECTED (Fallita con errore)
// ══════════════════════════════════════════════════════════════════════════════

const rejectedPromise = Promise.reject(new Error('Oops!'));
// Crea Promise GIÀ rejected (immediatamente rigettata)

console.log(rejectedPromise); 
// Output: Promise { <rejected> Error: Oops! }
// Promise rejected con errore

// Gestione errore tramite .catch()
rejectedPromise.catch(err => {
    console.error('Errore:', err.message);  // Errore: Oops!
});


// ══════════════════════════════════════════════════════════════════════════════
//  IMMUTABILITÀ: Una volta settled, lo stato NON cambia mai!
// ══════════════════════════════════════════════════════════════════════════════

const immutablePromise = new Promise((resolve, reject) => {
    resolve('First value');   // ✅ Promise diventa FULFILLED
    
    // ⚠️ Queste chiamate vengono IGNORATE!
    resolve('Second value');  // ❌ Ignorato: già fulfilled
    reject(new Error('Err')); // ❌ Ignorato: già fulfilled
});

immutablePromise.then(value => {
    console.log(value);  // Output: 'First value'
    // Solo il PRIMO resolve() ha effetto!
});

// 🔑 REGOLA D'ORO: Solo la prima chiamata a resolve/reject conta!
//    Tutte le successive sono silenziosamente ignorate.


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO PRATICO: Transizione di stati
// ══════════════════════════════════════════════════════════════════════════════

function fetchDataWithStates(shouldSucceed) {
    return new Promise((resolve, reject) => {
        console.log('1. Stato: PENDING - Inizio operazione');
        
        // Simula operazione asincrona
        setTimeout(() => {
            if (shouldSucceed) {
                console.log('2. Transizione: PENDING → FULFILLED');
                resolve({ data: 'Success data' });
            } else {
                console.log('2. Transizione: PENDING → REJECTED');
                reject(new Error('Operation failed'));
            }
        }, 1000);
    });
}

// Test successo
fetchDataWithStates(true)
    .then(result => {
        console.log('3. Stato finale: FULFILLED');
        console.log('   Valore:', result);
    })
    .catch(err => {
        console.log('3. Stato finale: REJECTED');
        console.log('   Errore:', err.message);
    })
    .finally(() => {
        console.log('4. Promise SETTLED (fulfilled o rejected)');
    });

// Output:
// 1. Stato: PENDING - Inizio operazione
// [dopo 1 sec]
// 2. Transizione: PENDING → FULFILLED
// 3. Stato finale: FULFILLED
//    Valore: { data: 'Success data' }
// 4. Promise SETTLED (fulfilled o rejected)
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

**Teoria:** Molte API Node.js usano callback in stile error-first. Possiamo "promisificare" queste API wrappandole in una Promise per usare la sintassi moderna.

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  PATTERN: Conversione Callback → Promise
// ══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────────────
// Wrapper manuale: Trasforma fs.readFile (callback) in Promise
// ─────────────────────────────────────────────────────────────────────────────
function readFilePromise(path) {
    return new Promise((resolve, reject) => {
        // Chiama l'API callback-based originale
        fs.readFile(path, 'utf8', (err, data) => {
            // STEP 1: Controlla errore (error-first convention)
            if (err) {
                reject(err);  // ❌ Promise diventa REJECTED
                return;
            }
            
            // STEP 2: Operazione riuscita
            resolve(data);    // ✅ Promise diventa FULFILLED
        });
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Uso della versione promisificata
// ─────────────────────────────────────────────────────────────────────────────
readFilePromise('file.txt')
    .then(content => {
        console.log('File content:', content);
    })
    .catch(err => {
        console.error('Error reading file:', err.message);
    });


// ══════════════════════════════════════════════════════════════════════════════
//  METODO SEMPLIFICATO: util.promisify()
// ══════════════════════════════════════════════════════════════════════════════
// Node.js fornisce un'utility per promisificare automaticamente!

const util = require('util');
const fs = require('fs');

// Conversione automatica!
const readFilePromise = util.promisify(fs.readFile);

// Uso identico
readFilePromise('file.txt', 'utf8')
    .then(content => console.log(content))
    .catch(err => console.error(err));


// ══════════════════════════════════════════════════════════════════════════════
//  ALTERNATIVA: fs.promises API (Node.js 10+)
// ══════════════════════════════════════════════════════════════════════════════
// Molte API Node.js ora forniscono versioni Promise native!

const fs = require('fs').promises;  // ⚡ API Promise nativa!

// Uso diretto - nessun wrapper necessario
fs.readFile('file.txt', 'utf8')
    .then(content => console.log(content))
    .catch(err => console.error(err));

// Ancora meglio con async/await
async function readFile() {
    try {
        const content = await fs.readFile('file.txt', 'utf8');
        console.log(content);
    } catch (err) {
        console.error(err);
    }
}


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO COMPLETO: Promisify custom function
// ══════════════════════════════════════════════════════════════════════════════

// Funzione callback-based originale
function fetchUserCallback(userId, callback) {
    setTimeout(() => {
        if (userId > 0) {
            callback(null, { id: userId, name: 'Mario' });  // Success
        } else {
            callback(new Error('Invalid user ID'));         // Error
        }
    }, 1000);
}

// Versione promisificata
function fetchUserPromise(userId) {
    return new Promise((resolve, reject) => {
        fetchUserCallback(userId, (err, user) => {
            if (err) return reject(err);  // ❌ Error
            resolve(user);                 // ✅ Success
        });
    });
}

// Uso elegante con Promise chaining
fetchUserPromise(1)
    .then(user => {
        console.log('User:', user.name);
        return fetchUserPromise(2);  // Chain altra operazione
    })
    .then(user2 => {
        console.log('User 2:', user2.name);
    })
    .catch(err => {
        console.error('Error:', err.message);
    });

// 💡 TIP: Preferisci util.promisify() o API native quando possibile!
//         Wrapper manuali solo se necessario.
```

---

## 🔗 Consumare Promise: .then() e .catch()

**Teoria:** Le Promise sono **lazy** finché non le "consumi" registrando handler. I metodi `.then()`, `.catch()` e `.finally()` permettono di reagire ai cambiamenti di stato della Promise.

### .then() - Gestire il Successo

**Sintassi completa:**
```javascript
promise.then(
    onFulfilled,    // Chiamato se resolve() - OBBLIGATORIO
    onRejected      // Chiamato se reject() - OPZIONALE
);
```

**Caratteristiche `.then()`:**
- 🔄 **Ritorna sempre una nuova Promise** (abilita chaining)
- ⚡ **Esecuzione asincrona**: Handler eseguito nel prossimo tick
- 🔗 **Chainable**: Puoi concatenare più `.then()`
- 📦 **Valore ritornato**: Diventa il valore della Promise ritornata

#### Esempi .then()

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 1: Solo onFulfilled handler
// ══════════════════════════════════════════════════════════════════════════════

Promise.resolve(42)
    .then(value => {
        // Questo handler viene chiamato perché la Promise è FULFILLED
        console.log('Valore ricevuto:', value);  // Valore ricevuto: 42
        
        // 💡 Puoi processare il valore
        const doubled = value * 2;
        console.log('Valore raddoppiato:', doubled);
    });


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 2: Entrambi gli handler (onFulfilled e onRejected)
// ══════════════════════════════════════════════════════════════════════════════

Promise.resolve(42)
    .then(
        // Handler per successo (FULFILLED)
        value => {
            console.log('Success:', value);  // Success: 42
        },
        // Handler per errore (REJECTED)
        error => {
            console.error('Error:', error);  // Non chiamato in questo caso
        }
    );

// ⚠️ NOTA: Preferisci .catch() invece del secondo parametro
//        È più leggibile e cattura anche errori nel primo handler!


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 3: Ritornare valore per chaining
// ══════════════════════════════════════════════════════════════════════════════

Promise.resolve(10)
    .then(x => {
        console.log('Step 1:', x);  // Step 1: 10
        return x * 2;  // 🔑 Ritorna nuovo valore
    })
    .then(x => {
        // Riceve il valore ritornato dal .then() precedente
        console.log('Step 2:', x);  // Step 2: 20
        return x + 5;  // 🔑 Ritorna nuovo valore
    })
    .then(x => {
        console.log('Step 3:', x);  // Step 3: 25
        // Se non ritorno nulla, il prossimo .then() riceve undefined
    });

// 💡 REGOLA: Valore ritornato da .then() diventa il valore
//            della Promise ritornata da .then()


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 4: Ritornare Promise per chaining asincrono
// ══════════════════════════════════════════════════════════════════════════════

function delay(ms, value) {
    return new Promise(resolve => {
        setTimeout(() => resolve(value), ms);
    });
}

Promise.resolve('Start')
    .then(msg => {
        console.log(msg);  // Start
        // Ritorna una Promise - il prossimo .then() aspetta!
        return delay(1000, 'After 1 sec');
    })
    .then(msg => {
        console.log(msg);  // After 1 sec (dopo 1 secondo)
        return delay(1000, 'After 2 sec');
    })
    .then(msg => {
        console.log(msg);  // After 2 sec (dopo 2 secondi)
    });

// 🔑 MAGIA: Se ritorno una Promise, .then() "unwrappa" automaticamente
//            e passa il valore resolved al prossimo .then()
```

### .catch() - Gestire gli Errori

**Teoria:** `.catch()` è syntactic sugar per `.then(null, onRejected)`. Cattura **qualsiasi errore** nella catena di Promise precedente, sia da `reject()` che da eccezioni lanciate.

```javascript
promise.catch(onRejected);

// ≡ Equivalente a:
promise.then(null, onRejected);
```

**Caratteristiche `.catch()`:**
- 🔥 **Cattura errori**: Da reject() o throw
- 🔗 **Chainable**: Puoi concatenare dopo .catch()
- 🛡️ **Error recovery**: Puoi recuperare da errori e continuare la chain
- 📈 **Propagazione**: Errori si propagano fino al primo .catch()

#### Esempi .catch()

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 1: Catch errore da reject()
// ══════════════════════════════════════════════════════════════════════════════

Promise.reject(new Error('Operation failed!'))
    .catch(err => {
        // Questo handler cattura l'errore
        console.error('Caught error:', err.message);
        // Output: Caught error: Operation failed!
        
        // 💡 Accesso all'oggetto Error completo
        console.error('Stack trace:', err.stack);
    });


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 2: Catch errore da throw (eccezione)
// ══════════════════════════════════════════════════════════════════════════════

Promise.resolve()
    .then(() => {
        // Simula un errore inaspettato nel codice
        throw new Error('Something went wrong in processing');
    })
    .catch(err => {
        // .catch() cattura ANCHE eccezioni lanciate con throw
        console.error('Caught exception:', err.message);
        // Output: Caught exception: Something went wrong in processing
    });

// 🔑 IMPORTANTE: .catch() cattura sia reject() che throw!
//               Non serve try/catch per codice asincrono.


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 3: Error recovery con fallback
// ══════════════════════════════════════════════════════════════════════════════

function fetchUser(userId) {
    return new Promise((resolve, reject) => {
        if (userId === 999) {
            reject(new Error('User not found'));
        } else {
            resolve({ id: userId, name: 'Mario' });
        }
    });
}

fetchUser(999)
    .catch(err => {
        // Gestisci errore e fornisci fallback
        console.error('Error fetching user:', err.message);
        
        // 🛡️ RECOVERY: Ritorna valore di default
        return { id: 0, name: 'Guest' };  // Fallback user
    })
    .then(user => {
        // Riceve il fallback user dal .catch()
        console.log('User loaded:', user);
        // Output: User loaded: { id: 0, name: 'Guest' }
    });

// 💡 TIP: .catch() può ritornare valore per "riparare" la chain
//         La Promise chain continua normalmente!


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 4: Propagazione errori nella chain
// ══════════════════════════════════════════════════════════════════════════════

Promise.resolve(10)
    .then(x => {
        console.log('Step 1:', x);  // Step 1: 10
        return x * 2;
    })
    .then(x => {
        console.log('Step 2:', x);  // Step 2: 20
        throw new Error('Error in step 2!');  // 🔥 Errore!
    })
    .then(x => {
        // ❌ Questo .then() viene SALTATO perché c'è stato errore
        console.log('Step 3:', x);  // Non eseguito
    })
    .catch(err => {
        // ✅ Questo .catch() cattura l'errore
        console.error('Errore catturato:', err.message);
        // Output: Errore catturato: Error in step 2!
    });

// 📈 PROPAGAZIONE: Errore si propaga giù per la chain
//                  saltando tutti i .then() fino al primo .catch()


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 5: Multiple .catch() per gestione granulare
// ══════════════════════════════════════════════════════════════════════════════

fetchUser(1)
    .catch(err => {
        // Primo .catch(): gestisce errori di fetchUser
        console.error('User fetch error:', err.message);
        return { id: 0, name: 'Guest' };
    })
    .then(user => {
        console.log('Processing user:', user.name);
        // Simula altro errore
        throw new Error('Processing failed');
    })
    .catch(err => {
        // Secondo .catch(): gestisce errori di processing
        console.error('Processing error:', err.message);
    });

// 📌 Ogni .catch() gestisce errori dalla sezione precedente


// ══════════════════════════════════════════════════════════════════════════════
//  ANTI-PATTERN: .catch() vs secondo parametro .then()
// ══════════════════════════════════════════════════════════════════════════════

// ❌ SBAGLIATO: Secondo parametro NON cattura errori nel primo handler
Promise.resolve()
    .then(
        () => {
            throw new Error('Error in onFulfilled');  // 🔥
        },
        err => {
            // ❌ NON cattura l'errore sopra!
            console.error('Caught?', err);  // Non eseguito
        }
    );

// ✅ CORRETTO: .catch() cattura errori nel .then() precedente
Promise.resolve()
    .then(() => {
        throw new Error('Error in handler');  // 🔥
    })
    .catch(err => {
        // ✅ Cattura l'errore!
        console.error('Caught!', err.message);
    });

// 🔑 REGOLA: Usa sempre .catch() invece del secondo parametro!
```

### .finally() - Sempre Eseguito

**Teoria:** `.finally()` (ES2018) esegue codice di cleanup **indipendentemente** dal risultato della Promise. Perfetto per operazioni di pulizia come chiudere connessioni, nascondere loader, ecc.

```javascript
promise.finally(() => {
    // Eseguito SEMPRE, sia success che error
    // NON riceve argomenti (non sa se fulfilled o rejected)
    // NON modifica il valore della Promise
});
```

**Caratteristiche `.finally()`:**
- 🔄 **Sempre eseguito**: Sia per fulfilled che rejected
- 🚫 **No argomenti**: Non riceve valore o errore
- 🔗 **Pass-through**: Passa il valore/errore originale alla chain successiva
- 🧹 **Cleanup**: Ideale per operazioni di pulizia

#### Esempi .finally()

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 1: Cleanup UI loading state
// ══════════════════════════════════════════════════════════════════════════════

let loading = true;
console.log('Loading:', loading);  // Loading: true

fetchData()
    .then(data => {
        console.log('Success! Data:', data);
    })
    .catch(err => {
        console.error('Error:', err.message);
    })
    .finally(() => {
        // Eseguito SEMPRE, sia success che error
        loading = false;  // 🧹 Cleanup: nasconde loader
        console.log('Loading:', loading);  // Loading: false
        console.log('Request completed - cleanup done');
    });

// 💡 TIP: .finally() è perfetto per nascondere spinner/loader!


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 2: Chiusura connessioni database
// ══════════════════════════════════════════════════════════════════════════════

function queryDatabase(query) {
    const connection = openConnection();  // Apre connessione
    
    return executeQuery(connection, query)
        .then(results => {
            console.log('Query results:', results);
            return results;
        })
        .catch(err => {
            console.error('Query failed:', err);
            throw err;  // Ri-lancia errore
        })
        .finally(() => {
            // 🧹 Chiude connessione SEMPRE
            connection.close();
            console.log('Database connection closed');
        });
}


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 3: .finally() NON riceve argomenti
// ══════════════════════════════════════════════════════════════════════════════

Promise.resolve('Success value')
    .finally(() => {
        // ⚠️ NON riceve il valore 'Success value'
        console.log('Finally executed');
        // Non sai se la Promise è fulfilled o rejected qui!
    })
    .then(value => {
        // ✅ Il valore PASSA attraverso .finally()
        console.log('Value:', value);  // Value: Success value
    });

Promise.reject(new Error('Failure'))
    .finally(() => {
        // ⚠️ NON riceve l'errore
        console.log('Finally executed even on error');
    })
    .catch(err => {
        // ✅ L'errore PASSA attraverso .finally()
        console.error('Error:', err.message);  // Error: Failure
    });


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 4: .finally() NON modifica il valore della Promise
// ══════════════════════════════════════════════════════════════════════════════

Promise.resolve(42)
    .finally(() => {
        console.log('Cleanup');
        return 999;  // ⚠️ Questo valore viene IGNORATO!
    })
    .then(value => {
        console.log('Value:', value);  // Value: 42 (NON 999!)
        // Il valore originale passa attraverso
    });

// 🔑 ECCEZIONE: Se .finally() lancia errore o ritorna rejected Promise,
//              QUELLO viene propagato (sostituisce il valore originale)

Promise.resolve(42)
    .finally(() => {
        throw new Error('Error in finally');  // 🔥
    })
    .then(value => {
        console.log('Success:', value);  // ❌ Non eseguito
    })
    .catch(err => {
        console.error('Caught:', err.message);  // ✅ Caught: Error in finally
    });


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 5: Caso d'uso reale - API request con timeout e cleanup
// ══════════════════════════════════════════════════════════════════════════════

function fetchWithTimeout(url, timeout = 5000) {
    let timeoutId;
    const startTime = Date.now();
    
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new Error('Request timeout'));
        }, timeout);
    });
    
    return Promise.race([
        fetch(url),
        timeoutPromise
    ])
    .then(response => {
        const elapsed = Date.now() - startTime;
        console.log(`Request completed in ${elapsed}ms`);
        return response.json();
    })
    .catch(err => {
        console.error('Request failed:', err.message);
        throw err;
    })
    .finally(() => {
        // 🧹 CLEANUP: Cancella timeout SEMPRE
        clearTimeout(timeoutId);
        console.log('Timeout cleared');
    });
}

// Uso
fetchWithTimeout('https://api.example.com/data')
    .then(data => console.log('Data:', data))
    .catch(err => console.error('Final error:', err));


// ══════════════════════════════════════════════════════════════════════════════
//  CONFRONTO: .then() vs .catch() vs .finally()
// ══════════════════════════════════════════════════════════════════════════════

Promise.resolve('value')
    .then(val => {
        // ✅ Eseguito solo se FULFILLED
        // ✅ Riceve il valore
        // ✅ Può modificare il valore ritornando
        console.log('.then() received:', val);
        return val.toUpperCase();
    })
    .catch(err => {
        // ✅ Eseguito solo se REJECTED
        // ✅ Riceve l'errore
        // ✅ Può recuperare ritornando valore
        console.error('.catch() received:', err);
        return 'fallback';
    })
    .finally(() => {
        // ✅ Eseguito SEMPRE
        // ❌ NON riceve argomenti
        // ❌ NON può modificare valore (pass-through)
        console.log('.finally() - cleanup');
    });


// ══════════════════════════════════════════════════════════════════════════════
//  PATTERN: Gestione completa con tutti e tre i metodi
// ══════════════════════════════════════════════════════════════════════════════

let isLoading = true;
let hasError = false;

performAsyncOperation()
    .then(result => {
        // Gestisci successo
        console.log('Operation successful:', result);
        hasError = false;
        return result;
    })
    .catch(err => {
        // Gestisci errore
        console.error('Operation failed:', err);
        hasError = true;
        // Puoi ritornare fallback o ri-lanciare
        throw err;
    })
    .finally(() => {
        // Cleanup sempre eseguito
        isLoading = false;
        console.log('Operation completed. Error:', hasError);
        
        // Chiudi risorse, aggiorna UI, etc.
        updateUI({ loading: isLoading, error: hasError });
    });

// 💡 PATTERN PERFETTO: .then() → .catch() → .finally()
//    - .then(): Success case
//    - .catch(): Error handling
//    - .finally(): Cleanup
```

---

## ⛓️ Promise Chaining (Concatenazione)

**Teoria:** Il **vero potere** delle Promise sta nella capacità di concatenare operazioni asincrone in modo elegante e leggibile. Ogni `.then()` ritorna una **nuova Promise**, permettendo di creare catene di operazioni.

### 🔄 Come Funziona

**Regole fondamentali del chaining:**

1. **Ogni `.then()` ritorna una nuova Promise**
2. **Valore ritornato** diventa il valore della nuova Promise
3. **Promise ritornata** viene "unwrapped" automaticamente
4. **Errori si propagano** giù per la catena fino al primo `.catch()`
5. **Flat structure** evita nidificazione (no callback hell)

```javascript
promise
    .then(result => {
        // STEP 1: Processa result
        console.log('Ricevuto:', result);
        
        // Puoi ritornare:
        // a) Un valore → prossimo .then() riceve questo valore
        return nuovoValore;
        
        // b) Una Promise → prossimo .then() aspetta e riceve il valore resolved
        // return altraPromise;
    })
    .then(nuovoValore => {
        // STEP 2: Usa nuovoValore dal .then() precedente
        console.log('Elaboro:', nuovoValore);
        
        // Può ritornare Promise per operazione asincrona
        return altraPromise;
    })
    .then(risultatoAltraPromise => {
        // STEP 3: Riceve risultato dell'altraPromise
        console.log('Finale:', risultatoAltraPromise);
    })
    .catch(err => {
        // Cattura QUALSIASI errore nella catena sopra
        console.error('Errore catturato:', err);
    });

// 🔑 CHIAVE: Struttura piatta invece di nidificata!
```

### 💻 Esempi Chaining

#### 1. Chain Semplice con Trasformazioni

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  Trasformazioni successive di un valore
// ══════════════════════════════════════════════════════════════════════════════

Promise.resolve(5)
    .then(x => {
        // STEP 1: Moltiplica per 2
        console.log('Step 1 - Input:', x);     // Input: 5
        const result = x * 2;
        console.log('Step 1 - Output:', result); // Output: 10
        return result;  // 🔑 Passa al prossimo .then()
    })
    .then(x => {
        // STEP 2: Aggiungi 3
        console.log('Step 2 - Input:', x);     // Input: 10
        const result = x + 3;
        console.log('Step 2 - Output:', result); // Output: 13
        return result;
    })
    .then(x => {
        // STEP 3: Risultato finale
        console.log('Step 3 - Final:', x);     // Final: 13
        // Se non ritorno nulla, prossimo .then() riceve undefined
    });

// 💡 NOTA: Ogni .then() processa il valore del precedente
//         Crea una pipeline di trasformazioni!
```

#### 2. Chain con Promise Annidate (Operazioni Asincrone)

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  Funzioni che ritornano Promise (operazioni asincrone)
// ══════════════════════════════════════════════════════════════════════════════

function getUser(id) {
    // Simula chiamata database asincrona
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ id, name: 'Mario', role: 'admin' });
        }, 100);
    });
}

function getPosts(userId) {
    // Simula fetch posts dal server
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, userId, title: 'Post 1', likes: 10 },
                { id: 2, userId, title: 'Post 2', likes: 25 }
            ]);
        }, 150);
    });
}

function getComments(postId) {
    // Simula fetch comments
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                { id: 1, postId, text: 'Great post!' },
                { id: 2, postId, text: 'Nice work!' }
            ]);
        }, 100);
    });
}

// ══════════════════════════════════════════════════════════════════════════════
//  ✅ Promise Chaining - Struttura PIATTA
// ══════════════════════════════════════════════════════════════════════════════

console.log('Inizio operazioni...');
const startTime = Date.now();

getUser(1)
    .then(user => {
        // STEP 1: Ottieni utente
        console.log('1. User loaded:', user.name);
        console.log('   Role:', user.role);
        
        // 🔑 Ritorna Promise - il prossimo .then() ASPETTA!
        return getPosts(user.id);
    })
    .then(posts => {
        // STEP 2: Riceve posts quando getPosts() completa
        console.log('2. Posts loaded:', posts.length);
        posts.forEach(post => {
            console.log(`   - ${post.title} (${post.likes} likes)`);
        });
        
        // Ritorna Promise per prossima operazione
        return getComments(posts[0].id);
    })
    .then(comments => {
        // STEP 3: Riceve comments quando getComments() completa
        console.log('3. Comments loaded:', comments.length);
        comments.forEach(comment => {
            console.log(`   - ${comment.text}`);
        });
        
        const elapsed = Date.now() - startTime;
        console.log(`\n✅ All operations completed in ${elapsed}ms`);
    })
    .catch(err => {
        // Cattura errori da QUALSIASI operazione sopra
        console.error('❌ Error in chain:', err.message);
    });

// Output:
// Inizio operazioni...
// 1. User loaded: Mario
//    Role: admin
// 2. Posts loaded: 2
//    - Post 1 (10 likes)
//    - Post 2 (25 likes)
// 3. Comments loaded: 2
//    - Great post!
//    - Nice work!
// ✅ All operations completed in ~350ms


// ══════════════════════════════════════════════════════════════════════════════
//  ❌ ANTI-PATTERN: Promise Hell (nidificazione)
// ══════════════════════════════════════════════════════════════════════════════

// 👎 NON FARE COSÌ! (Promise usate come callback)
getUser(1)
    .then(user => {
        getPosts(user.id)
            .then(posts => {
                getComments(posts[0].id)
                    .then(comments => {
                        console.log(comments);  // 😱 Pyramid of Doom!
                    });
            });
    });

// 💡 PROBLEMA: Hai ricreato callback hell con Promise!
//             Usa chaining piatto come nell'esempio sopra.
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

**Teoria:** Le Promise forniscono metodi statici utility per gestire operazioni comuni come creare Promise già risolte, combinare multiple Promise, gestire timeout, ecc.

### Promise.resolve()

**Teoria:** Crea una Promise **già fulfilled** (risolta) con il valore specificato. Utile per:
- Creare Promise di test
- Convertire valori sincroni in Promise
- Normalizzare API che potrebbero ritornare valori o Promise

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  USO BASE: Crea Promise fulfilled
// ══════════════════════════════════════════════════════════════════════════════

Promise.resolve(42)
    .then(value => console.log(value)); // 42

// Equivalente a:
new Promise(resolve => resolve(42));


// ══════════════════════════════════════════════════════════════════════════════
//  UNWRAP AUTOMATICO: Promise di Promise viene "appiattita"
// ══════════════════════════════════════════════════════════════════════════════

const nestedPromise = Promise.resolve(Promise.resolve(42));

nestedPromise.then(value => {
    console.log(value);  // 42 (NON Promise!)
    console.log(typeof value);  // 'number'
});

// 💡 Promise.resolve() "unwrappa" automaticamente Promise annidate


// ══════════════════════════════════════════════════════════════════════════════
//  CASO D'USO: Normalizzare API che ritornano valori o Promise
// ══════════════════════════════════════════════════════════════════════════════

function getData(useCache) {
    if (useCache) {
        // Ritorna valore sincrono dalla cache
        return cachedData;  // Valore normale
    } else {
        // Ritorna Promise da fetch asincrono
        return fetch('/api/data');  // Promise
    }
}

// ❌ PROBLEMA: Non sai se ritorna valore o Promise!

// ✅ SOLUZIONE: Wrappa sempre con Promise.resolve()
Promise.resolve(getData(true))
    .then(data => {
        // Funziona sia per valore che Promise!
        console.log('Data:', data);
    });
```

### Promise.reject()

**Teoria:** Crea una Promise **già rejected** (rigettata) con il motivo specificato. Utile per:
- Creare Promise di errore per test
- Ritornare errori da funzioni che devono ritornare Promise
- Propagare errori in catene di Promise

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  USO BASE: Crea Promise rejected
// ══════════════════════════════════════════════════════════════════════════════

Promise.reject(new Error('Operation failed!'))
    .catch(err => console.error(err.message)); // Operation failed!

// Equivalente a:
new Promise((resolve, reject) => reject(new Error('Operation failed!')));


// ══════════════════════════════════════════════════════════════════════════════
//  CASO D'USO: Validazione input
// ══════════════════════════════════════════════════════════════════════════════

function fetchUser(userId) {
    // Validazione: userId deve essere positivo
    if (userId <= 0) {
        // Ritorna Promise rejected per errore di validazione
        return Promise.reject(new Error('Invalid user ID'));
    }
    
    // Altrimenti fetch normale
    return fetch(`/api/users/${userId}`);
}

// Uso
fetchUser(-1)
    .then(user => console.log('User:', user))
    .catch(err => console.error('Error:', err.message));
// Output: Error: Invalid user ID
```

### Promise.all()

**Teoria:** Esegue **multiple Promise in parallelo** e attende che **TUTTE** siano fulfilled. Se anche solo una è rejected, l'intera operazione fallisce immediatamente (fail-fast).

**Caratteristiche:**
- ⚡ **Esecuzione parallela**: Tutte le Promise partono contemporaneamente
- ✅ **Successo**: Ritorna array di tutti i risultati (stesso ordine)
- ❌ **Fallimento**: Prima Promise rejected causa reject di Promise.all()
- 🚀 **Performance**: Tempo totale = max(t1, t2, t3) invece di t1+t2+t3

```javascript
Promise.all([promise1, promise2, promise3])
    .then(([result1, result2, result3]) => {
        // TUTTI i risultati disponibili
        // Array mantiene l'ordine originale
    })
    .catch(err => {
        // PRIMA Promise rigettata (fail-fast)
    });
```

#### 💻 Esempi Promise.all()

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 1: Multiple API requests in parallelo
// ══════════════════════════════════════════════════════════════════════════════

const startTime = Date.now();

// Simula 3 chiamate API indipendenti
const userPromise = fetch('/api/user/1').then(r => r.json());
const postsPromise = fetch('/api/posts').then(r => r.json());
const commentsPromise = fetch('/api/comments').then(r => r.json());

console.log('Fetching data in parallel...');

Promise.all([userPromise, postsPromise, commentsPromise])
    .then(([userData, postsData, commentsData]) => {
        // Tutte e 3 le richieste completate!
        const elapsed = Date.now() - startTime;
        
        console.log('\n✅ All data loaded in', elapsed, 'ms');
        console.log('User:', userData.name);
        console.log('Posts count:', postsData.length);
        console.log('Comments count:', commentsData.length);
        
        // 💡 Tempo totale ≈ tempo della richiesta più lenta
        //    NON la somma di tutti i tempi!
    })
    .catch(err => {
        console.error('❌ One request failed:', err.message);
    });


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 2: Performance comparison (Sequential vs Parallel)
// ══════════════════════════════════════════════════════════════════════════════

function delay(ms, value) {
    return new Promise(resolve => {
        setTimeout(() => resolve(value), ms);
    });
}

// ❌ SEQUENZIALE: Una dopo l'altra
async function sequential() {
    const start = Date.now();
    
    const first = await delay(1000, 'First');   // Aspetta 1s
    const second = await delay(2000, 'Second'); // Aspetta 2s
    const third = await delay(1500, 'Third');   // Aspetta 1.5s
    
    const elapsed = Date.now() - start;
    console.log('Sequential:', [first, second, third]);
    console.log('Time:', elapsed, 'ms');  // ~4500ms (1000+2000+1500)
}

// ✅ PARALLELO: Tutte insieme con Promise.all()
async function parallel() {
    const start = Date.now();
    
    const results = await Promise.all([
        delay(1000, 'First'),   // ┌─ Partono
        delay(2000, 'Second'),  // ├─ tutte
        delay(1500, 'Third')    // ┘─ insieme!
    ]);
    
    const elapsed = Date.now() - start;
    console.log('Parallel:', results);
    console.log('Time:', elapsed, 'ms');  // ~2000ms (max dei tre!)
}

// Test
sequential();  // ~4500ms
parallel();    // ~2000ms  🚀 2.25X più veloce!


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 3: Fail-fast behavior (prima rejected = fail totale)
// ══════════════════════════════════════════════════════════════════════════════

Promise.all([
    Promise.resolve(1),                    // ✅ Successo
    Promise.reject(new Error('Failed!')),  // ❌ Fallisce subito!
    delay(5000, 3)                         // ⚠️ Continua in background ma risultato ignorato
])
    .then(results => {
        // ❌ NON eseguito
        console.log('Success:', results);
    })
    .catch(err => {
        // ✅ Eseguito immediatamente quando seconda Promise fallisce
        console.error('Failed:', err.message);  // Failed!
        // Non aspetta che la terza Promise finisca
    });

// 💡 FAIL-FAST: Appena una Promise è rejected, Promise.all() fallisce
//             Le altre Promise continuano ma risultato ignorato


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 4: Ordine risultati preservato
// ══════════════════════════════════════════════════════════════════════════════

Promise.all([
    delay(3000, 'Slow'),    // Finisce per ultima
    delay(1000, 'Fast'),    // Finisce per prima
    delay(2000, 'Medium')   // Finisce nel mezzo
])
    .then(([first, second, third]) => {
        // Array mantiene ordine ORIGINALE, non ordine di completamento
        console.log('Results:', [first, second, third]);
        // Output: ['Slow', 'Fast', 'Medium']
        // NON ['Fast', 'Medium', 'Slow']!
    });

// 🔑 ORDINE PRESERVATO: Array risultati mantiene ordine dell'array input
//                      indipendentemente da quale Promise finisce prima


// ══════════════════════════════════════════════════════════════════════════════
//  CASO D'USO REALE: Caricamento dashboard con multiple API
// ══════════════════════════════════════════════════════════════════════════════

async function loadDashboard(userId) {
    console.log('🔄 Loading dashboard...');
    
    try {
        // Fetch tutti i dati in parallelo
        const [
            profile,
            stats,
            notifications,
            recentActivity
        ] = await Promise.all([
            fetch(`/api/users/${userId}/profile`).then(r => r.json()),
            fetch(`/api/users/${userId}/stats`).then(r => r.json()),
            fetch(`/api/users/${userId}/notifications`).then(r => r.json()),
            fetch(`/api/users/${userId}/activity`).then(r => r.json())
        ]);
        
        console.log('✅ Dashboard loaded!');
        
        // Renderizza dashboard con tutti i dati
        return {
            profile,
            stats,
            notifications,
            recentActivity
        };
        
    } catch (error) {
        console.error('❌ Failed to load dashboard:', error);
        // Mostra errore all'utente
        throw error;
    }
}
```

### Promise.race()

**Teoria:** Ritorna una Promise che si completa (fulfilled o rejected) appena la **PRIMA** Promise nell'array si completa. Il nome "race" (gara) descrive perfettamente il comportamento: vince chi arriva primo!

**Caratteristiche:**
- 🏁 **Prima a completare**: Non importa se fulfilled o rejected
- ⚡ **Velocità**: Utile per timeout e competizione tra sorgenti
- 🎯 **Singolo risultato**: Ritorna solo il risultato della prima
- ⚠️ **Altre Promise**: Continuano in background ma risultato ignorato

```javascript
Promise.race([promise1, promise2, promise3])
    .then(result => {
        // Risultato della PRIMA completata (fulfilled)
    })
    .catch(err => {
        // Errore della PRIMA fallita (rejected)
    });
```

#### 💻 Esempi Promise.race()

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 1: Timeout Pattern (caso d'uso più comune)
// ══════════════════════════════════════════════════════════════════════════════

function delay(ms, value) {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

function withTimeout(promise, timeoutMs) {
    // Crea Promise che rigetta dopo timeout
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Timeout after ${timeoutMs}ms`));
        }, timeoutMs);
    });
    
    // Race: vince chi finisce prima
    return Promise.race([promise, timeoutPromise]);
}

// Test: Richiesta lenta (5 secondi)
const slowRequest = delay(5000, 'Data loaded');

console.log('Starting request with 2s timeout...');

withTimeout(slowRequest, 2000)
    .then(data => {
        console.log('✅ Success:', data);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        // Output: ❌ Error: Timeout after 2000ms
    });

// 💡 TIP: Timeout Promise vince perché arriva prima (2s < 5s)


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 2: Server Racing (fastest response wins)
// ══════════════════════════════════════════════════════════════════════════════

// Simula 3 server con latenze diverse
const server1 = delay(300, { server: 'US-East', data: 'Data from US' });
const server2 = delay(150, { server: 'EU-West', data: 'Data from EU' });
const server3 = delay(400, { server: 'Asia', data: 'Data from Asia' });

console.log('Racing 3 servers...');
const start = Date.now();

Promise.race([server1, server2, server3])
    .then(response => {
        const elapsed = Date.now() - start;
        console.log(`\n✅ Fastest server: ${response.server}`);
        console.log(`   Data: ${response.data}`);
        console.log(`   Time: ${elapsed}ms`);
        // Output: EU-West vince con 150ms!
    });

// 💡 OTTIMIZZAZIONE: Usa server geograficamente più vicino automaticamente


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 3: Race con errori (prima fallita = fail totale)
// ══════════════════════════════════════════════════════════════════════════════

Promise.race([
    delay(2000, 'Slow success'),
    Promise.reject(new Error('Fast failure')),  // ❌ Fallisce subito!
    delay(3000, 'Very slow success')
])
    .then(result => {
        console.log('Success:', result);  // ❌ Non eseguito
    })
    .catch(err => {
        console.error('Failed:', err.message);  // ✅ 'Fast failure'
        // Prima Promise fallita vince la race!
    });

// ⚠️ ATTENZIONE: Se prima Promise è rejected, race fallisce
//               anche se altre Promise potrebbero riuscire


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 4: Cache + Network Pattern
// ══════════════════════════════════════════════════════════════════════════════

function getCachedData() {
    // Cache locale: veloce ma potrebbe essere stale
    return delay(50, { source: 'cache', data: 'Cached data (fast)' });
}

function getNetworkData() {
    // Network: lento ma sempre fresh
    return delay(500, { source: 'network', data: 'Fresh data (slow)' });
}

// Strategy: Usa cache se disponibile, altrimenti aspetta network
Promise.race([
    getCachedData(),
    getNetworkData()
])
    .then(response => {
        console.log(`\n📦 Data from: ${response.source}`);
        console.log(`   Content: ${response.data}`);
        // Output: cache (50ms) vince contro network (500ms)
    });

// 💡 PATTERN: Instant UI feedback con cache, poi aggiorna con network


// ══════════════════════════════════════════════════════════════════════════════
//  CASO D'USO REALE: API Request con retry e timeout
// ══════════════════════════════════════════════════════════════════════════════

function fetchWithTimeoutAndRetry(url, options = {}) {
    const { timeout = 5000, retries = 3 } = options;
    
    function attemptFetch(attemptsLeft) {
        console.log(`Attempt ${retries - attemptsLeft + 1}/${retries}`);
        
        const fetchPromise = fetch(url).then(r => r.json());
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), timeout);
        });
        
        return Promise.race([fetchPromise, timeoutPromise])
            .catch(err => {
                if (attemptsLeft <= 1) {
                    throw new Error(`Failed after ${retries} attempts: ${err.message}`);
                }
                console.log(`  ❌ Failed, retrying...`);
                return attemptFetch(attemptsLeft - 1);
            });
    }
    
    return attemptFetch(retries);
}

// Uso
fetchWithTimeoutAndRetry('/api/data', { timeout: 3000, retries: 3 })
    .then(data => console.log('✅ Success:', data))
    .catch(err => console.error('❌ Final error:', err.message));
```

### Promise.allSettled()

**Teoria:** Attende che **TUTTE** le Promise si completino (settled), indipendentemente dal risultato (fulfilled o rejected). A differenza di `Promise.all()`, **NON fallisce mai**: ritorna sempre fulfilled con array di risultati.

**Caratteristiche:**
- ✅ **Mai rejected**: Ritorna sempre fulfilled
- 📊 **Risultati completi**: Informazioni su successi E fallimenti
- 🔍 **Status tracking**: Ogni risultato ha `{status, value/reason}`
- 💯 **Affidabile**: Utile per batch operations dove vuoi tutti i risultati

```javascript
Promise.allSettled([promise1, promise2, promise3])
    .then(results => {
        // Array di oggetti { status, value/reason }
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                console.log('✅ Value:', result.value);
            } else {
                console.error('❌ Reason:', result.reason);
            }
        });
    });
    // .catch() non necessario: allSettled() non fallisce mai!
```

#### 💻 Esempi Promise.allSettled()

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 1: Gestire risultati misti (successi + fallimenti)
// ══════════════════════════════════════════════════════════════════════════════

const promises = [
    Promise.resolve(42),                       // ✅ Successo
    Promise.reject(new Error('Failed')),       // ❌ Fallimento
    Promise.resolve('Success'),                // ✅ Successo
    Promise.reject(new Error('Another error')) // ❌ Fallimento
];

console.log('Processing all promises...');

Promise.allSettled(promises)
    .then(results => {
        console.log('\n📊 All promises settled:');
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                console.log(`[${index}] ✅ Success:`, result.value);
            } else {
                console.log(`[${index}] ❌ Error:`, result.reason.message);
            }
        });
        
        // Statistiche
        const succeeded = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        console.log(`\n📈 Stats: ${succeeded} succeeded, ${failed} failed`);
    });

// Output:
// 📊 All promises settled:
// [0] ✅ Success: 42
// [1] ❌ Error: Failed
// [2] ✅ Success: Success
// [3] ❌ Error: Another error
// 📈 Stats: 2 succeeded, 2 failed


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 2: Batch processing con report dettagliato
// ══════════════════════════════════════════════════════════════════════════════

function processItem(item) {
    // Simula processing che può fallire
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (item.id % 3 === 0) {
                reject(new Error(`Failed to process item ${item.id}`));
            } else {
                resolve({ ...item, processed: true });
            }
        }, 100);
    });
}

async function batchProcess(items) {
    console.log(`\n🔄 Processing ${items.length} items...`);
    
    // Process tutti gli item in parallelo
    const results = await Promise.allSettled(
        items.map(item => processItem(item))
    );
    
    // Separa successi da fallimenti
    const succeeded = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);
    
    const failed = results
        .filter(r => r.status === 'rejected')
        .map((r, idx) => ({
            index: idx,
            error: r.reason.message
        }));
    
    // Report
    console.log(`\n📊 Batch Report:`);
    console.log(`   ✅ Succeeded: ${succeeded.length}`);
    console.log(`   ❌ Failed: ${failed.length}`);
    
    if (failed.length > 0) {
        console.log('\n   Failed items:');
        failed.forEach(f => {
            console.log(`   - [${f.index}] ${f.error}`);
        });
    }
    
    return { succeeded, failed };
}

// Test
const items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },  // Fallirà (id % 3 === 0)
    { id: 4, name: 'Item 4' },
    { id: 5, name: 'Item 5' }
];

batchProcess(items);


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO 3: Confronto Promise.all() vs Promise.allSettled()
// ══════════════════════════════════════════════════════════════════════════════

const mixedPromises = [
    Promise.resolve('A'),
    Promise.reject(new Error('B failed')),
    Promise.resolve('C')
];

// ❌ Promise.all() - Fallisce immediatamente
console.log('\n--- Testing Promise.all() ---');
Promise.all(mixedPromises)
    .then(results => {
        console.log('✅ All succeeded:', results);
    })
    .catch(err => {
        console.error('❌ Failed:', err.message);
        // Output: ❌ Failed: B failed
        // Problema: Non sappiamo lo stato di A e C!
    });

// ✅ Promise.allSettled() - Ritorna sempre tutti i risultati
console.log('\n--- Testing Promise.allSettled() ---');
Promise.allSettled(mixedPromises)
    .then(results => {
        console.log('📊 All results:');
        results.forEach((r, i) => {
            const label = r.status === 'fulfilled' ? '✅' : '❌';
            const value = r.status === 'fulfilled' ? r.value : r.reason.message;
            console.log(`  ${label} [${i}] ${value}`);
        });
        // Output:
        // ✅ [0] A
        // ❌ [1] B failed
        // ✅ [2] C
    });

// 💡 REGOLA: Usa allSettled() quando vuoi TUTTI i risultati
//           Usa all() solo quando TUTTI devono riuscire


// ══════════════════════════════════════════════════════════════════════════════
//  CASO D'USO REALE: Upload multipli file con retry
// ══════════════════════════════════════════════════════════════════════════════

async function uploadFiles(files) {
    console.log(`\n📤 Uploading ${files.length} files...`);
    
    const uploadPromises = files.map(file => 
        uploadFile(file)
            .catch(err => {
                // Retry una volta
                console.log(`  ⚠️ Retrying ${file.name}...`);
                return uploadFile(file);
            })
    );
    
    const results = await Promise.allSettled(uploadPromises);
    
    // Genera report
    const uploaded = [];
    const failed = [];
    
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            uploaded.push({
                file: files[index].name,
                url: result.value.url
            });
        } else {
            failed.push({
                file: files[index].name,
                error: result.reason.message
            });
        }
    });
    
    console.log(`\n✅ Uploaded: ${uploaded.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    return { uploaded, failed };
}

function uploadFile(file) {
    // Simula upload
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.3) {
                resolve({ url: `https://cdn.example.com/${file.name}` });
            } else {
                reject(new Error(`Network error uploading ${file.name}`));
            }
        }, 1000);
    });
}
```

### Promise.any()

> **💡 Teoria: Promise.any() - Prima Fulfilled Vince**
>
> Promise.any() è **ottimista**: aspetta la **PRIMA Promise che ha SUCCESSO** (fulfilled),
> ignorando completamente gli errori fino a quando almeno una ha successo.
>
> **Caratteristiche chiave:**
> 1. **Ignora Rejected**: Le Promise rifiutate vengono saltate
> 2. **Prima Fulfilled**: Appena una Promise riesce, completa immediatamente
> 3. **AggregateError**: Fallisce SOLO se TUTTE le Promise falliscono
> 4. **Resilienza**: Ideale per sistemi con ridondanza e fallback
>
> **Differenza con Promise.race():**
> - `race()`: Completa con la prima che si sistema (fulfilled O rejected)
> - `any()`: Completa con la prima che riesce (solo fulfilled)

**Sintassi:**
```javascript
Promise.any([promise1, promise2, promise3])
    .then(result => {
        // Risultato della PRIMA Promise fulfilled
        // Le altre rejected vengono ignorate
    })
    .catch(err => {
        // AggregateError: TUTTE le Promise rejected
        // err.errors contiene array di tutti gli errori
    });
```

#### 💻 Esempi Promise.any()

**Esempio 1: Sistema Multi-Server Ridondante**
```javascript
// Scenario: 3 server mirror, ci serve solo 1 risposta valida
const server1 = fetch('https://eu-server.com/data');    // Europa (lento: 300ms)
const server2 = fetch('https://us-server.com/data');    // USA (veloce: 150ms)
const server3 = fetch('https://asia-server.com/data');  // Asia (errore)

Promise.any([server1, server2, server3])
    .then(response => {
        // ✅ Ottiene risposta da us-server (150ms) - IL PIÙ VELOCE
        // ❌ asia-server failed - IGNORATO
        // ⏳ eu-server ancora pending - IGNORATO
        console.log('First successful response!');
        return response.json();
    })
    .catch(err => {
        // Entra qui SOLO se TUTTI E 3 i server falliscono
        console.error('All servers down!');
        console.error('Errors:', err.errors); // Array con 3 errori
    });

// Timing: Completa dopo 150ms (primo successo)
// vs Promise.race(): Completerebbe con primo settled (successo O errore)
```

**Esempio 2: API Primaria con Fallback Multipli**
```javascript
// Sistema di fallback a cascata
const primaryAPI = fetch('https://primary.api.com/data');    // 500ms
const backupAPI1 = fetch('https://backup1.api.com/data');    // 200ms (errore)
const backupAPI2 = fetch('https://backup2.api.com/data');    // 300ms (OK)
const backupAPI3 = fetch('https://backup3.api.com/data');    // 400ms (OK)

console.log('⏱️  Start:', new Date().toISOString());

Promise.any([primaryAPI, backupAPI1, backupAPI2, backupAPI3])
    .then(response => {
        console.log('⏱️  First success:', new Date().toISOString());
        return response.json();
    })
    .then(data => {
        console.log('✅ Data from fastest available server:', data);
        // Risponde backupAPI2 dopo 300ms
        // backupAPI1 errore ignorato
        // primaryAPI e backupAPI3 ancora in esecuzione (ma ignorati)
    })
    .catch(err => {
        console.error('❌ All servers are down!');
        console.error('Total errors:', err.errors.length);
    });

// Timing: 300ms (primo successo di backupAPI2)
// Resilienza: 3 su 4 server possono fallire!
```

**Esempio 3: Gestione AggregateError - Tutti Falliscono**
```javascript
// Scenario: TUTTI i server falliscono
const server1 = fetch('https://down1.com'); // Errore 503
const server2 = fetch('https://down2.com'); // Errore 404
const server3 = fetch('https://down3.com'); // Errore timeout

Promise.any([server1, server2, server3])
    .then(response => {
        // ❌ Mai eseguito perché TUTTI falliscono
        console.log('Success:', response);
    })
    .catch(err => {
        // ✅ Entra qui con AggregateError
        console.log('Type:', err.constructor.name); // AggregateError
        console.log('Message:', err.message);       // All promises rejected
        
        // Array con tutti gli errori individuali
        console.log('Total failures:', err.errors.length); // 3
        err.errors.forEach((error, index) => {
            console.log(`Server ${index + 1}:`, error.message);
        });
    });

// Output:
// Type: AggregateError
// Message: All promises rejected
// Total failures: 3
// Server 1: 503 Service Unavailable
// Server 2: 404 Not Found
// Server 3: Timeout after 5000ms
```

**Esempio 4: Confronto Promise.race() vs Promise.any()**
```javascript
// Creiamo stesso scenario per vedere differenza
const fastError = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Fast error')), 100);
});

const slowSuccess = new Promise((resolve) => {
    setTimeout(() => resolve('Success!'), 500);
});

console.log('\n--- Promise.race() ---');
Promise.race([fastError, slowSuccess])
    .then(result => console.log('✅ Result:', result))
    .catch(err => console.log('❌ Error:', err.message));
// Output dopo 100ms: ❌ Error: Fast error
// race() completa con la PRIMA (anche se errore)

console.log('\n--- Promise.any() ---');
Promise.any([fastError, slowSuccess])
    .then(result => console.log('✅ Result:', result))
    .catch(err => console.log('❌ Error:', err.message));
// Output dopo 500ms: ✅ Result: Success!
// any() ignora l'errore e aspetta il primo successo
```

**Esempio 5: Pattern Resiliente per Servizi Critici**
```javascript
// Sistema di pagamento con ridondanza geografica
async function processPayment(paymentData) {
    // 4 gateway di pagamento in diverse regioni
    const providers = [
        processWithStripe(paymentData),      // US
        processWithPayPal(paymentData),      // EU
        processWithSquare(paymentData),      // Asia
        processWithBraintree(paymentData)    // Backup
    ];
    
    try {
        // Aspetta il PRIMO che riesce
        const result = await Promise.any(providers);
        
        console.log('✅ Payment processed successfully');
        console.log('Provider:', result.provider);
        console.log('Transaction ID:', result.transactionId);
        
        return result;
        
    } catch (err) {
        // TUTTI e 4 i provider hanno fallito!
        console.error('❌ Payment failed on ALL providers!');
        
        // Log dettagliato degli errori
        err.errors.forEach((error, index) => {
            console.error(`Provider ${index + 1}:`, error.message);
        });
        
        // Notifica sistema di alerting
        await sendCriticalAlert('All payment gateways down!');
        
        throw new Error('Payment processing unavailable');
    }
}

// Test
processPayment({
    amount: 99.99,
    currency: 'EUR',
    customerId: 'cust_123'
})
.then(result => console.log('Payment OK:', result.transactionId))
.catch(err => console.error('Payment failed:', err.message));

// Vantaggi:
// ✅ Resilienza: Tollera 3 fallimenti su 4
// ✅ Performance: Usa il gateway più veloce disponibile
// ✅ Affidabilità: Servizio attivo anche con problemi regionali
```

> **🎯 Quando usare Promise.any():**
> - ✅ **Sistemi ridondanti**: Più server/API che forniscono stesso dato
> - ✅ **Fallback automatico**: Primary + backup services
> - ✅ **Resilienza**: Serve solo 1 successo tra N tentativi
> - ✅ **Performance**: Usa il più veloce che funziona
> - ❌ Evita se: Servono TUTTI i risultati (usa Promise.all)

### 📊 Tabella Comparativa Metodi

| Metodo | Completa quando | Risultato | Error |
|--------|----------------|-----------|-------|
| **Promise.all()** | Tutte fulfilled | Array di valori | Prima rejected |
| **Promise.race()** | Prima settled | Valore della prima | Errore della prima |
| **Promise.allSettled()** | Tutte settled | Array di {status, value/reason} | Mai (sempre fulfilled) |
| **Promise.any()** | Prima fulfilled | Valore della prima fulfilled | Tutte rejected (AggregateError) |

---

## 🔄 Convertire Callback in Promise (Promisify)

> **💡 Teoria: Promisification - Modernizzare API Legacy**
>
> **Promisification** è il processo di conversione di funzioni callback-based
> in funzioni che ritornano Promise, permettendo l'uso di async/await.
>
> **Quando serve:**
> 1. **API legacy**: Librerie vecchie che usano solo callback
> 2. **Node.js core**: Moduli come fs, crypto, dns (pre-promise versions)
> 3. **Consistency**: Uniformare codebase a stile moderno
> 4. **Chaining**: Sfruttare vantaggi Promise (composizione, error handling)
>
> **Metodi:**
> - `util.promisify()`: Built-in Node.js (raccomandato)
> - Promisify manuale: Per API non standard
> - fs.promises: API moderna già promisificata (Node.js 10+)

### util.promisify() (Node.js)

**Metodo raccomandato** per convertire funzioni Node.js che seguono
il pattern error-first callback: `fn(...args, (err, result) => {})`

```javascript
const util = require('util');
const fs = require('fs');

// Converti readFile da callback a Promise
const readFileAsync = util.promisify(fs.readFile);

// ❌ Vecchio stile callback
fs.readFile('file.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Error:', err);
        return;
    }
    console.log('Data:', data);
});

// ✅ Nuovo stile Promise
readFileAsync('file.txt', 'utf8')
    .then(data => console.log('Data:', data))
    .catch(err => console.error('Error:', err));

// ✅✅ Ancora meglio con async/await
async function readConfig() {
    try {
        const data = await readFileAsync('file.txt', 'utf8');
        console.log('Data:', data);
        return JSON.parse(data);
    } catch (err) {
        console.error('Error:', err);
        throw err;
    }
}
```

**Esempio: Promisify Multiple File Operations**
```javascript
const util = require('util');
const fs = require('fs');

// Converti tutte le operazioni file necessarie
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

// Ora possiamo usare async/await!
async function processFiles() {
    try {
        // 1. Leggi directory
        const files = await readdir('./data');
        console.log(`Found ${files.length} files`);
        
        // 2. Processa ogni file
        for (const file of files) {
            const filePath = `./data/${file}`;
            
            // 3. Ottieni info file
            const stats = await stat(filePath);
            console.log(`${file}: ${stats.size} bytes`);
            
            // 4. Leggi contenuto
            const content = await readFile(filePath, 'utf8');
            
            // 5. Trasforma contenuto
            const processed = content.toUpperCase();
            
            // 6. Scrivi risultato
            await writeFile(`./output/${file}`, processed);
        }
        
        console.log('✅ All files processed!');
        
    } catch (err) {
        console.error('❌ Error processing files:', err);
    }
}

processFiles();

// Timing sequenziale: t1 + t2 + ... + tn
// Per parallelismo, usa Promise.all()!
```

### fs.promises - API Moderna Nativa

**Node.js 10+** include versioni promisificate native di fs:

```javascript
// ✅ Raccomandato: Usa fs.promises (Node.js 10+)
const fs = require('fs').promises;

// Tutti i metodi ritornano già Promise!
async function modernFileOps() {
    try {
        // Nessun promisify necessario!
        const data = await fs.readFile('config.json', 'utf8');
        const config = JSON.parse(data);
        
        config.lastAccessed = new Date().toISOString();
        
        await fs.writeFile('config.json', JSON.stringify(config, null, 2));
        
        console.log('✅ Config updated!');
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

// Oppure import ESM style
import { readFile, writeFile } from 'fs/promises';
```

### Promisify Manuale

**Per API che NON seguono** il pattern error-first callback standard:

```javascript
// Helper generico per error-first callbacks
function promisify(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            // Aggiungi callback error-first
            fn(...args, (err, result) => {
                if (err) {
                    reject(err);  // Errore -> Promise rejected
                } else {
                    resolve(result); // Successo -> Promise fulfilled
                }
            });
        });
    };
}

// Uso con fs
const fs = require('fs');
const readFileAsync = promisify(fs.readFile);

readFileAsync('package.json', 'utf8')
    .then(data => {
        const pkg = JSON.parse(data);
        console.log('Package name:', pkg.name);
        console.log('Version:', pkg.version);
    })
    .catch(err => console.error('Error reading package:', err));
```

**Esempio: Promisify Callback con Risultati Multipli**
```javascript
// Alcune callback ritornano multipli valori: callback(err, val1, val2, ...)
function promisifyMulti(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (err, ...results) => {
                if (err) {
                    reject(err);
                } else {
                    // Risolvi con array se multipli risultati
                    resolve(results.length === 1 ? results[0] : results);
                }
            });
        });
    };
}

// Esempio: child_process.exec ritorna (err, stdout, stderr)
const { exec } = require('child_process');
const execAsync = promisifyMulti(exec);

async function runCommand(command) {
    try {
        const [stdout, stderr] = await execAsync(command);
        console.log('Output:', stdout);
        if (stderr) console.warn('Warnings:', stderr);
        return stdout;
    } catch (err) {
        console.error('Command failed:', err.message);
        throw err;
    }
}

runCommand('ls -la')
    .then(output => console.log('Success'));
```

### Promisify Class Methods

**Convertire metodi di classe** che usano callback:

```javascript
class Database {
    // Metodi originali con callback
    connect(callback) {
        console.log('Connecting to database...');
        setTimeout(() => {
            callback(null, 'Connected to PostgreSQL');
        }, 1000);
    }
    
    query(sql, params, callback) {
        console.log('Executing query:', sql);
        setTimeout(() => {
            // Simula risultati query
            const results = [
                { id: 1, name: 'Mario', age: 25 },
                { id: 2, name: 'Luigi', age: 23 }
            ];
            callback(null, results);
        }, 500);
    }
    
    close(callback) {
        console.log('Closing connection...');
        setTimeout(() => {
            callback(null, 'Connection closed');
        }, 200);
    }
}

// ❌ Vecchio modo: callback hell
const db = new Database();
db.connect((err, msg) => {
    if (err) return console.error(err);
    console.log(msg);
    
    db.query('SELECT * FROM users', [], (err, results) => {
        if (err) return console.error(err);
        console.log('Users:', results);
        
        db.close((err, msg) => {
            if (err) return console.error(err);
            console.log(msg);
        });
    });
});

// ✅ Promisify i metodi
const util = require('util');
const db2 = new Database();

db2.connectAsync = util.promisify(db2.connect).bind(db2);
db2.queryAsync = util.promisify(db2.query).bind(db2);
db2.closeAsync = util.promisify(db2.close).bind(db2);

// ✅✅ Uso pulito con async/await
async function databaseOperations() {
    try {
        // Connetti
        const connMsg = await db2.connectAsync();
        console.log('✅', connMsg);
        
        // Query
        const users = await db2.queryAsync('SELECT * FROM users', []);
        console.log('✅ Found users:', users.length);
        users.forEach(user => {
            console.log(`  - ${user.name} (${user.age} years)`);
        });
        
        // Chiudi
        const closeMsg = await db2.closeAsync();
        console.log('✅', closeMsg);
        
    } catch (err) {
        console.error('❌ Database error:', err);
    }
}

databaseOperations();

// Output:
// Connecting to database...
// ✅ Connected to PostgreSQL
// Executing query: SELECT * FROM users
// ✅ Found users: 2
//   - Mario (25 years)
//   - Luigi (23 years)
// Closing connection...
// ✅ Connection closed
```

**Esempio: Wrapper Class Promisificata**
```javascript
// Crea wrapper class che espone solo API Promise
class DatabaseAsync {
    constructor() {
        this._db = new Database();
        
        // Promisify tutti i metodi nel costruttore
        this.connect = util.promisify(this._db.connect).bind(this._db);
        this.query = util.promisify(this._db.query).bind(this._db);
        this.close = util.promisify(this._db.close).bind(this._db);
    }
}

// Uso diretto con async/await
const dbAsync = new DatabaseAsync();

async function quickQuery() {
    await dbAsync.connect();
    const results = await dbAsync.query('SELECT NOW()', []);
    await dbAsync.close();
    return results;
}

quickQuery()
    .then(results => console.log('Results:', results));
```

> **⚠️ Attenzione con util.promisify():**
> - ✅ Funziona con callback format: `(err, result) => {}`
> - ❌ NON funziona con: callback non error-first, callback multipli, eventi
> - 🔧 Usa `util.promisify.custom` per comportamento personalizzato
> - 🎯 Ricorda `.bind()` quando promisifichi metodi di classe

> **🎯 Best Practice:**
> 1. **Node.js 10+**: Usa `fs.promises` invece di promisify(fs.*)
> 2. **Librerie moderne**: Controlla se esistono versioni promise-native
> 3. **Consistency**: Promisifica tutto all'inizio del file
> 4. **Naming**: Suffisso `Async` per chiarezza (es: `readFileAsync`)
> 5. **Reusability**: Crea wrapper riusabili per API complesse

---

## ⚠️ Errori Comuni e Antipattern

> **💡 Teoria: Antipattern nelle Promise**
>
> Gli **antipattern** sono pratiche di programmazione che sembrano corrette
> ma portano a bug, codice fragile, o performance degradate.
>
> **Categorie principali:**
> 1. **Chaining errors**: Dimenticare return, nesting invece di chaining
> 2. **Error handling**: Non gestire rejection, swallowing errors
> 3. **Wrapping inutile**: Promise dentro Promise
> 4. **Mixing paradigms**: Callback + Promise insieme
> 5. **Performance**: Sequenziale quando possibile parallelo
>
> **Impatto:**
> - 🐛 **Bug silenziosi**: Errori non catturati, race conditions
> - ⚠️ **Memory leaks**: Promise pending infinitamente
> - 🐌 **Performance**: Sequenziale inutile (10x più lento)
> - 😖 **Manutenzione**: Codice confuso, debugging difficile

### ❌ 1. Dimenticare return nel .then()

> **Problema:** Senza `return`, il valore/Promise non viene propagato nella catena.
> Il `.then()` successivo riceve `undefined` invece del risultato atteso.
>
> **Impatto:** Bug silenziosi, dati persi, logica rotta

```javascript
// ❌ SBAGLIATO: Promise non propagata
function fetchUserData(userId) {
    return getUser(userId)
        .then(user => {
            getUserPosts(user.id); // ⚠️ Manca return!
            // Questa Promise viene creata ma IGNORATA
        })
        .then(posts => {
            // posts è undefined! ❌
            console.log('Post count:', posts.length); // Error: Cannot read 'length' of undefined
        });
}

// ✅ CORRETTO: Return della Promise
function fetchUserData(userId) {
    return getUser(userId)
        .then(user => {
            return getUserPosts(user.id); // ✅ Return esplicito
        })
        .then(posts => {
            // posts ha il valore corretto! ✅
            console.log('Post count:', posts.length); // OK: 10
            return posts;
        });
}

// ✅✅ ANCORA MEGLIO: Arrow function concisa (return implicito)
function fetchUserData(userId) {
    return getUser(userId)
        .then(user => getUserPosts(user.id))  // Return implicito
        .then(posts => {
            console.log('Post count:', posts.length);
            return posts;
        });
}
```

**Esempio Real-World: E-commerce Checkout**
```javascript
// ❌ Bug reale: Ordine creato ma pagamento non registrato!
function processCheckout(cart) {
    return createOrder(cart)
        .then(order => {
            processPayment(order); // ⚠️ Manca return!
            // Pagamento avviato ma non aspettato!
        })
        .then(() => {
            // Eseguito IMMEDIATAMENTE, prima che il pagamento finisca!
            sendConfirmationEmail(); // Email inviata prematuramente!
            return { success: true };
        });
}

// Risultato: Cliente riceve email PRIMA che pagamento sia completato
// Se pagamento fallisce -> Ordine creato ma non pagato! 💸

// ✅ CORRETTO: Aspetta completion di ogni step
function processCheckout(cart) {
    return createOrder(cart)
        .then(order => {
            console.log('Order created:', order.id);
            return processPayment(order); // ✅ Aspetta pagamento
        })
        .then(payment => {
            console.log('Payment confirmed:', payment.transactionId);
            return sendConfirmationEmail(payment); // ✅ Email solo dopo pagamento
        })
        .then(() => {
            console.log('✅ Checkout completed successfully');
            return { success: true };
        })
        .catch(err => {
            console.error('❌ Checkout failed:', err);
            // Rollback order se necessario
            return { success: false, error: err.message };
        });
}

// Flusso corretto:
// 1. Crea ordine (300ms)
// 2. Processa pagamento (1500ms) - ASPETTA
// 3. Invia email (200ms) - ASPETTA
// Totale: 2000ms ma SICURO
```

### ❌ 2. Nesting invece di Chaining (Promise Hell)

> **Problema:** Annidare `.then()` dentro `.then()` ricrea il "callback hell"
> che le Promise dovrebbero eliminare.
>
> **Impatto:**
> - 😖 Leggibilità: Codice complesso, "pyramid of doom"
> - 🐛 Bug: Scope variables confusi, error handling difficile
> - 🔧 Manutenzione: Difficile debuggare e modificare

```javascript
// ❌ SBAGLIATO: Nesting (Promise hell)
function loadUserDashboard(userId) {
    return getUserInfo(userId)
        .then(user => {
            // Livello 1 di nesting
            return getUserPosts(user.id)
                .then(posts => {
                    // Livello 2 di nesting
                    return getPostComments(posts[0].id)
                        .then(comments => {
                            // Livello 3 di nesting
                            return getUserFriends(user.id)
                                .then(friends => {
                                    // Livello 4! Impossible to read!
                                    return {
                                        user: user,
                                        posts: posts,
                                        comments: comments,
                                        friends: friends
                                    };
                                });
                        });
                });
        });
}
// Problemi:
// 😫 Indentazione crescente (pyramid of doom)
// 😵 Difficile capire il flusso
// 🐛 Error handling frammentato
// 🐌 Performance: Sequenziale quando potrebbe essere parallelo

// ✅ CORRETTO: Flat chaining
function loadUserDashboard(userId) {
    let userData;
    
    return getUserInfo(userId)
        .then(user => {
            userData = user; // Salva per uso successivo
            return getUserPosts(user.id);
        })
        .then(posts => {
            userData.posts = posts;
            return getPostComments(posts[0].id);
        })
        .then(comments => {
            userData.comments = comments;
            return getUserFriends(userData.id);
        })
        .then(friends => {
            userData.friends = friends;
            return userData; // Risultato completo
        })
        .catch(err => {
            console.error('Error loading dashboard:', err);
            throw err; // Singolo catch per tutta la catena!
        });
}

// ✅✅ ANCORA MEGLIO: async/await (più leggibile)
async function loadUserDashboard(userId) {
    try {
        // Variabili in scope naturale!
        const user = await getUserInfo(userId);
        const posts = await getUserPosts(user.id);
        const comments = await getPostComments(posts[0].id);
        const friends = await getUserFriends(user.id);
        
        return { user, posts, comments, friends };
        
    } catch (err) {
        console.error('Error loading dashboard:', err);
        throw err;
    }
}

// ✅✅✅ PERFORMANCE OPTIMIZED: Parallelizza dove possibile
async function loadUserDashboard(userId) {
    try {
        // Step 1: User info (dipendenza necessaria)
        const user = await getUserInfo(userId);
        
        // Step 2: Posts e Friends in parallelo (indipendenti!)
        const [posts, friends] = await Promise.all([
            getUserPosts(user.id),
            getUserFriends(user.id)
        ]);
        
        // Step 3: Comments (dipende da posts)
        const comments = await getPostComments(posts[0].id);
        
        return { user, posts, comments, friends };
        
    } catch (err) {
        console.error('Error loading dashboard:', err);
        throw err;
    }
}
// Timing:
// ❌ Nesting sequenziale: 300ms + 500ms + 400ms + 600ms = 1800ms
// ✅ Parallelo ottimizzato: 300ms + max(500ms, 600ms) + 400ms = 1300ms
// 🚀 Performance gain: 28% più veloce!
```

**Esempio Real-World: Registrazione Utente con Validation**
```javascript
// ❌ BAD: Nesting hell in user registration
function registerUser(userData) {
    return validateEmail(userData.email)
        .then(isValid => {
            if (!isValid) throw new Error('Invalid email');
            
            return checkEmailExists(userData.email)
                .then(exists => {
                    if (exists) throw new Error('Email already registered');
                    
                    return hashPassword(userData.password)
                        .then(hashedPassword => {
                            return createUserRecord({
                                ...userData,
                                password: hashedPassword
                            })
                                .then(user => {
                                    return sendWelcomeEmail(user.email)
                                        .then(() => {
                                            return createUserSession(user.id)
                                                .then(session => {
                                                    return { user, session };
                                                });
                                        });
                                });
                        });
                });
        });
}
// 6 livelli di nesting! 😱

// ✅ GOOD: Flat async/await
async function registerUser(userData) {
    // Validation
    const isValidEmail = await validateEmail(userData.email);
    if (!isValidEmail) {
        throw new Error('Invalid email format');
    }
    
    // Check duplicates
    const emailExists = await checkEmailExists(userData.email);
    if (emailExists) {
        throw new Error('Email already registered');
    }
    
    // Create user
    const hashedPassword = await hashPassword(userData.password);
    const user = await createUserRecord({
        ...userData,
        password: hashedPassword
    });
    
    // Post-creation tasks in parallel
    const [emailSent, session] = await Promise.all([
        sendWelcomeEmail(user.email),
        createUserSession(user.id)
    ]);
    
    console.log('✅ User registered successfully:', user.id);
    return { user, session };
}
// Flat, leggibile, performance ottimizzata! 🚀
```

### ❌ 3. Non Gestire Errori (Unhandled Rejection)

> **Problema:** Promise rejection non gestita causa crash dell'applicazione
> o comportamenti imprevedibili.
>
> **Impatto:**
> - 🔥 **Node.js 15+**: Process termina con exit code 1 (crash!)
> - ⚠️ **Node.js <15**: Warning in console ma continua (silent failure)
> - 🐛 Bug nascosti, data corruption, memory leaks
> - 😱 Production outages

```javascript
// ❌ PERICOLOSO: Unhandled rejection
function fetchUserData(userId) {
    fetchDataFromAPI(userId)
        .then(data => {
            console.log('Data:', data);
            return processData(data);
        })
        .then(processed => {
            saveToDatabase(processed);
        });
    // ⚠️ Nessun .catch()!
    // Se fetchDataFromAPI() fallisce -> UNHANDLED REJECTION!
}

fetchUserData(123);
// In produzione:
// UnhandledPromiseRejectionWarning: Error: API timeout
// (node:12345) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated
// 🔥 Node.js 15+: Process CRASHED!

// ✅ CORRETTO: Sempre catch
function fetchUserData(userId) {
    return fetchDataFromAPI(userId)
        .then(data => {
            console.log('✅ Data received:', data);
            return processData(data);
        })
        .then(processed => {
            return saveToDatabase(processed);
        })
        .catch(err => {
            // Gestione errore appropriata
            console.error('❌ Error fetching user data:', err.message);
            
            // Log per debugging
            logError({
                operation: 'fetchUserData',
                userId: userId,
                error: err.stack
            });
            
            // Ritorna valore di fallback o ri-lancia
            throw err; // Re-throw se chiamante deve sapere
        });
}

fetchUserData(123)
    .catch(err => {
        // Catch finale a livello applicazione
        console.error('❌ Application error:', err);
    });
```

**Esempio Real-World: API Request con Fallback**
```javascript
// ❌ BAD: Silent failures
async function getWeatherData(city) {
    const data = await fetch(`https://api.weather.com/${city}`);
    const weather = await data.json();
    return weather;
    // ⚠️ Nessun try/catch!
    // Se API down -> crash
    // Se JSON invalid -> crash
}

// ✅ GOOD: Robust error handling con fallback
async function getWeatherData(city) {
    try {
        console.log(`🌤️  Fetching weather for ${city}...`);
        
        const response = await fetch(`https://api.weather.com/${city}`);
        
        // Verifica status HTTP
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const weather = await response.json();
        
        // Valida struttura dati
        if (!weather.temperature || !weather.conditions) {
            throw new Error('Invalid weather data structure');
        }
        
        console.log('✅ Weather data received');
        return weather;
        
    } catch (err) {
        console.error(`❌ Weather API error for ${city}:`, err.message);
        
        // Log per monitoring
        await logError('weather_api', err);
        
        // Ritorna dati di fallback invece di crashare
        return {
            city: city,
            temperature: null,
            conditions: 'unavailable',
            error: true,
            message: 'Weather data temporarily unavailable'
        };
    }
}

// Uso sicuro
getWeatherData('Rome')
    .then(weather => {
        if (weather.error) {
            console.log('⚠️  Using fallback data');
        }
        displayWeather(weather);
    });
```

**Global Unhandled Rejection Handler (Safety Net)**
```javascript
// ✅✅ BEST PRACTICE: Global handler come ultima risorsa
process.on('unhandledRejection', (reason, promise) => {
    console.error('\n🔥 UNHANDLED REJECTION DETECTED!');
    console.error('Promise:', promise);
    console.error('Reason:', reason);
    
    // Log su sistema di monitoring (Sentry, DataDog, etc.)
    logCriticalError({
        type: 'UnhandledRejection',
        reason: reason,
        stack: reason.stack,
        timestamp: new Date().toISOString()
    });
    
    // In production: graceful shutdown
    if (process.env.NODE_ENV === 'production') {
        console.error('🚨 Initiating graceful shutdown...');
        
        // Chiudi connessioni, salva stato, ecc.
        gracefulShutdown()
            .then(() => {
                console.log('✅ Shutdown complete');
                process.exit(1);
            })
            .catch(() => {
                console.error('❌ Forced exit');
                process.exit(1);
            });
    }
});

// Handler per errori non catturati
process.on('uncaughtException', (err) => {
    console.error('\n💥 UNCAUGHT EXCEPTION!');
    console.error(err.stack);
    
    logCriticalError({
        type: 'UncaughtException',
        error: err,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
    
    // Exit immediato (stato inconsistente)
    process.exit(1);
});

console.log('✅ Global error handlers installed');

// Ora anche errori non catturati vengono loggati
Promise.reject(new Error('This will be caught by global handler'));
// Output:
// 🔥 UNHANDLED REJECTION DETECTED!
// Reason: Error: This will be caught by global handler
// (Log inviato a monitoring system)
```

**Testing Error Scenarios**
```javascript
// ✅ Test che errori vengano gestiti correttamente
const assert = require('assert');

// Test 1: Error viene catturato
async function testErrorHandling() {
    try {
        await getWeatherData('InvalidCity999');
        assert.fail('Should have thrown error');
    } catch (err) {
        // ✅ Error gestito correttamente
        assert.ok(err.message.includes('404'));
        console.log('✅ Test 1 passed: Error handled');
    }
}

// Test 2: Fallback funziona
async function testFallback() {
    const weather = await getWeatherData('OfflineCity');
    
    // ✅ Ritorna fallback invece di crashare
    assert.strictEqual(weather.error, true);
    assert.strictEqual(weather.conditions, 'unavailable');
    console.log('✅ Test 2 passed: Fallback works');
}

// Run tests
Promise.all([
    testErrorHandling(),
    testFallback()
])
.then(() => console.log('\n✅ All error handling tests passed'))
.catch(err => console.error('❌ Test failed:', err));
```

> **🎯 Best Practices Error Handling:**
> 1. **Sempre .catch()**: Ogni Promise chain deve avere catch
> 2. **Try/catch con async/await**: Wrap in try/catch block
> 3. **Global handlers**: Safety net per errori sfuggiti
> 4. **Logging**: Log errori per debugging e monitoring
> 5. **Fallback**: Ritorna dati default invece di crashare
> 6. **Re-throw**: Se chiamante deve sapere dell'errore
> 7. **Graceful shutdown**: Chiudi connessioni prima di exit

### ❌ 4. Creare Promise non Necessarie (Promise Constructor Antipattern)

> **Problema:** Wrappare una Promise in un'altra Promise è ridondante
> e aggiunge complessità inutile.
>
> **Impatto:**
> - 🐌 Code bloat: Più codice senza benefici
> - 🐛 Bug potenziali: Doppia gestione errori, inconsistenze
> - 😵 Confusione: Nasconde la vera struttura del codice

```javascript
// ❌ SBAGLIATO: Promise wrapping inutile
function getUserData(userId) {
    // Crea Promise esterna inutile
    return new Promise((resolve, reject) => {
        // fetchUser già ritorna Promise!
        fetchUser(userId)
            .then(user => resolve(user))    // Passa solo il valore
            .catch(err => reject(err));      // Passa solo l'errore
    });
}
// Problema: fetchUser() già ritorna Promise!
// Il wrapper è completamente inutile

// ✅ CORRETTO: Return diretto della Promise
function getUserData(userId) {
    return fetchUser(userId); // Già ritorna Promise!
}
// Pulito, diretto, stesso risultato

// ✅ CORRETTO: Aggiungi logica solo se necessario
function getUserData(userId) {
    return fetchUser(userId)
        .then(user => {
            // Aggiungi logica di business
            user.fullName = `${user.firstName} ${user.lastName}`;
            user.fetchedAt = new Date();
            return user;
        })
        .catch(err => {
            // Gestione errore specifica
            console.error('Error fetching user:', userId, err);
            throw err;
        });
}
// Ora ha senso: aggiungiamo valore
```

**Quando È Accettabile Creare Promise:**
```javascript
// ✅ OK: Wrapping callback-based API
function readFilePromise(filename) {
    return new Promise((resolve, reject) => {
        // fs.readFile usa callback, non Promise
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}
// Giustificato: stiamo convertendo callback -> Promise

// ✅ OK: Wrapping codice sincrono che può fallire
function parseJSONPromise(jsonString) {
    return new Promise((resolve, reject) => {
        try {
            const data = JSON.parse(jsonString); // Sincrono
            resolve(data);
        } catch (err) {
            reject(err); // Parse error
        }
    });
}
// Giustificato: JSON.parse() è sincrono e può lanciare eccezioni

// ✅ OK: Delay artificiale (testing, rate limiting)
function delay(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
// Giustificato: setTimeout usa callback

// ❌ NON OK: Wrapping Promise esistente
function delayThenFetch(url, ms) {
    return new Promise((resolve, reject) => {
        delay(ms)  // delay() già ritorna Promise!
            .then(() => fetch(url))  // fetch() già ritorna Promise!
            .then(response => response.json())  // .json() già ritorna Promise!
            .then(data => resolve(data))
            .catch(err => reject(err));
    });
}
// 3 livelli di Promise già esistenti wrappate inutilmente!

// ✅ CORRETTO: Chain diretto
function delayThenFetch(url, ms) {
    return delay(ms)
        .then(() => fetch(url))
        .then(response => response.json());
}
// Pulito, diretto, stesso risultato
```

**Esempio Real-World: API Wrapper**
```javascript
// ❌ BAD: Over-engineering con Promise wrapper inutile
class APIClient {
    getUserProfile(userId) {
        // ⚠️ Promise wrapper inutile
        return new Promise((resolve, reject) => {
            this.request('GET', `/users/${userId}`)
                .then(response => {
                    if (response.ok) {
                        resolve(response.data);  // Semplice passthrough
                    } else {
                        reject(new Error(response.error));
                    }
                })
                .catch(err => reject(err));
        });
    }
    
    request(method, url) {
        return fetch(url, { method })  // Già Promise
            .then(r => r.json());       // Già Promise
    }
}

// ✅ GOOD: Direct Promise return
class APIClient {
    getUserProfile(userId) {
        // Return diretto della Promise
        return this.request('GET', `/users/${userId}`)
            .then(response => {
                // Aggiungi solo logica necessaria
                if (!response.ok) {
                    throw new Error(response.error);
                }
                return response.data;
            });
    }
    
    request(method, url) {
        return fetch(url, { method })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            });
    }
}

// Uso pulito
const api = new APIClient();
api.getUserProfile(123)
    .then(user => console.log('User:', user))
    .catch(err => console.error('Error:', err));
```

> **🎯 Regola d'Oro:**
> - ❌ Se la funzione già ritorna Promise -> NON wrappare
> - ✅ Se è callback-based o sincrona -> Wrapper OK
> - ✅ Se aggiungi logica di business -> Usa .then()/.catch()
> - ❌ Mai fare: `new Promise((res, rej) => otherPromise().then(res).catch(rej))`

### ❌ 5. Uso Scorretto di Promise.all() - Sequential vs Parallel

> **Problema:** Usare Promise.all() quando operazioni sono **dipendenti** (sequenziali)
> o eseguire **sequenzialmente** quando operazioni sono **indipendenti** (parallelizzabili).
>
> **Impatto Performance:**
> - 🐌 Sequenziale inutile: 3-10x più lento
> - 🐛 .all() con dipendenze: Race conditions, dati inconsistenti
> - 💸 Costo: Ogni 100ms extra = utenti persi, revenue ridotto

```javascript
// ❌ SBAGLIATO: Promise.all() con operazioni DIPENDENTI
async function processOrder(orderId) {
    // Queste operazioni dipendono l'una dall'altra!
    const [order, payment, shipping] = await Promise.all([
        getOrder(orderId),           // Serve prima
        processPayment(orderId),      // ⚠️ Dipende da order!
        scheduleShipping(orderId)     // ⚠️ Dipende da payment!
    ]);
    
    // 🐛 BUG: processPayment avviato prima che getOrder finisca!
    // 🐛 BUG: scheduleShipping avviato prima del payment!
    // Risultato: Ordini spediti non pagati, inconsistenze DB
    
    return { order, payment, shipping };
}

// ✅ CORRETTO: Sequenziale per dipendenze
async function processOrder(orderId) {
    // Esegui in sequenza rispettando dipendenze
    const order = await getOrder(orderId);          // 1. Prima l'ordine (300ms)
    const payment = await processPayment(order);    // 2. Poi pagamento (500ms)
    const shipping = await scheduleShipping(order); // 3. Poi spedizione (200ms)
    
    return { order, payment, shipping };
}
// Timing: 300ms + 500ms + 200ms = 1000ms
// ✅ Corretto ma lento se possibile parallelizzare

// ❌ SBAGLIATO: Sequenziale quando operazioni INDIPENDENTI
async function loadDashboard(userId) {
    // Queste operazioni sono INDIPENDENTI!
    const user = await fetchUser(userId);        // 300ms
    const posts = await fetchPosts(userId);      // 500ms - può partire subito!
    const friends = await fetchFriends(userId);  // 400ms - può partire subito!
    const stats = await fetchStats(userId);      // 600ms - può partire subito!
    
    return { user, posts, friends, stats };
}
// Timing: 300ms + 500ms + 400ms + 600ms = 1800ms 🐌 LENTO!

// ✅ CORRETTO: Parallelo per operazioni indipendenti
async function loadDashboard(userId) {
    // Esegui TUTTO in parallelo
    const [user, posts, friends, stats] = await Promise.all([
        fetchUser(userId),    // Tutte partono contemporaneamente!
        fetchPosts(userId),   // ↓
        fetchFriends(userId), // ↓
        fetchStats(userId)    // ↓
    ]);
    
    return { user, posts, friends, stats };
}
// Timing: max(300ms, 500ms, 400ms, 600ms) = 600ms
// 🚀 PERFORMANCE: 1800ms -> 600ms = 3x più veloce!
```

**Decision Tree: Sequential vs Parallel**
```javascript
/*
                  Operazioni Multiple
                         |
                         v
              Dipendono l'una dall'altra?
              /                         \
            Sì                            No
            |                             |
            v                             v
    SEQUENTIAL                       PARALLEL
    (await uno dopo altro)           (Promise.all)
    
    Esempio Sequenziale:          Esempio Parallelo:
    1. Get user                   1. Get user profile
    2. Get user's posts           2. Get recent posts
       (serve user.id)            3. Get notifications
    3. Get post comments             (tutti usano userId,
       (serve posts[0].id)            nessuna dipendenza)
*/

// ✅✅ BEST: Misto Sequential + Parallel
async function loadUserProfile(userId) {
    // Step 1: User info (dipendenza per tutto il resto)
    const user = await fetchUser(userId);  // 300ms
    
    // Step 2: Dati indipendenti in parallelo
    const [posts, friends, settings] = await Promise.all([
        fetchPosts(user.id),      // 500ms
        fetchFriends(user.id),    // 400ms
        fetchSettings(user.id)    // 200ms
    ]);
    // Parallelo: max(500, 400, 200) = 500ms
    
    // Step 3: Comments dipendono da posts (sequenziale)
    const comments = await fetchComments(posts[0].id);  // 300ms
    
    return { user, posts, friends, settings, comments };
}
// Timing: 300ms + 500ms + 300ms = 1100ms
// vs Full Sequential: 300 + 500 + 400 + 200 + 300 = 1700ms
// 🚀 Performance gain: 35% più veloce!
```

**Esempio Real-World: E-commerce Product Page**
```javascript
// ❌ BAD: Tutto sequenziale (LENTISSIMO)
async function loadProductPage(productId, userId) {
    console.time('Sequential');
    
    const product = await fetchProduct(productId);        // 200ms
    const reviews = await fetchReviews(productId);        // 400ms
    const similar = await fetchSimilarProducts(productId); // 300ms
    const seller = await fetchSeller(product.sellerId);   // 250ms
    const userWishlist = await fetchWishlist(userId);     // 150ms
    const recommendations = await fetchRecommendations(userId); // 500ms
    
    console.timeEnd('Sequential');
    // Sequential: 1800ms 🐌
    
    return { product, reviews, similar, seller, userWishlist, recommendations };
}

// ✅ GOOD: Parallelo intelligente
async function loadProductPage(productId, userId) {
    console.time('Parallel Optimized');
    
    // Fase 1: Product info (serve per seller)
    const product = await fetchProduct(productId);  // 200ms
    
    // Fase 2: Tutto il resto in parallelo (nessuna dipendenza)
    const [reviews, similar, seller, userWishlist, recommendations] = 
        await Promise.all([
            fetchReviews(productId),              // 400ms
            fetchSimilarProducts(productId),      // 300ms
            fetchSeller(product.sellerId),        // 250ms
            fetchWishlist(userId),                // 150ms
            fetchRecommendations(userId)          // 500ms
        ]);
    // Parallelo: max(400, 300, 250, 150, 500) = 500ms
    
    console.timeEnd('Parallel Optimized');
    // Total: 200ms + 500ms = 700ms 🚀
    // PERFORMANCE: 1800ms -> 700ms = 2.57x più veloce!
    
    return { product, reviews, similar, seller, userWishlist, recommendations };
}

// 📊 Performance Comparison
loadProductPage('prod_123', 'user_456')
    .then(data => {
        console.log('\n📊 Performance Results:');
        console.log('Sequential: 1800ms');
        console.log('Parallel: 700ms');
        console.log('Improvement: 2.57x faster 🚀');
        console.log('Time saved: 1100ms per page load');
        console.log('Impact: Better UX, higher conversion rate!');
    });
```

**Testing Performance: Sequential vs Parallel**
```javascript
// Benchmark helper
function createMockAPI(delay, name) {
    return () => new Promise(resolve => {
        setTimeout(() => {
            resolve(`${name} completed after ${delay}ms`);
        }, delay);
    });
}

const api1 = createMockAPI(300, 'API-1');
const api2 = createMockAPI(500, 'API-2');
const api3 = createMockAPI(400, 'API-3');

// Test Sequential
async function testSequential() {
    console.log('\n--- Sequential Execution ---');
    console.time('Sequential');
    
    const r1 = await api1();  // 300ms
    const r2 = await api2();  // 500ms
    const r3 = await api3();  // 400ms
    
    console.timeEnd('Sequential');
    console.log('Total: 1200ms (300 + 500 + 400)');
    return [r1, r2, r3];
}

// Test Parallel
async function testParallel() {
    console.log('\n--- Parallel Execution ---');
    console.time('Parallel');
    
    const [r1, r2, r3] = await Promise.all([
        api1(),  // Tutte partono insieme!
        api2(),  // ↓
        api3()   // ↓
    ]);
    
    console.timeEnd('Parallel');
    console.log('Total: 500ms (max di 300, 500, 400)');
    console.log('Speedup: 2.4x faster! 🚀');
    return [r1, r2, r3];
}

// Run comparison
Promise.all([
    testSequential(),
    testParallel()
])
.then(() => {
    console.log('\n✅ Benchmark completed');
    console.log('Conclusion: Use Promise.all() for independent operations!');
});

// Output:
// --- Sequential Execution ---
// Sequential: 1200ms
// Total: 1200ms (300 + 500 + 400)
//
// --- Parallel Execution ---
// Parallel: 500ms
// Total: 500ms (max di 300, 500, 400)
// Speedup: 2.4x faster! 🚀
```

> **🎯 Decision Guide: Quando Usare Cosa**
>
> | Scenario | Soluzione | Motivo |
> |----------|-----------|--------|
> | Operazioni **indipendenti** | `Promise.all()` | 🚀 Max performance (parallelo) |
> | Operazioni **dipendenti** | `await` sequenziale | ✅ Dati consistenti |
> | Misto (step con sotto-tasks) | Sequential + .all() | ⚖️ Bilanciato |
> | Tutte devono riuscire | `Promise.all()` | ❌ Fail-fast |
> | Almeno 1 deve riuscire | `Promise.any()` | ✅ Resilienza |
> | Prima che completa | `Promise.race()` | ⏱️ Timeout, speed |
> | Tutte (successo o errore) | `Promise.allSettled()` | 📊 Stats, batch |

### ❌ 6. Mixing Callbacks e Promise (Paradigm Confusion)

> **Problema:** Mescolare callback e Promise nella stessa funzione crea
> interfaccia inconsistente e confusa.
>
> **Impatto:**
> - 😵 Confusion: Chiamante non sa come usare la funzione
> - 🐛 Bug: Doppia gestione errori, inconsistenze
> - 🚨 Antipattern: Viola principio "Do One Thing"
> - 🔧 Manutenzione: Difficile refactor

```javascript
// ❌ CONFUSO: Mix callback E Promise
function fetchUser(id, callback) {
    return fetch(`/api/users/${id}`)
        .then(response => response.json())
        .then(data => {
            callback(null, data);    // ⚠️ Callback
            return data;              // ⚠️ Promise
        })
        .catch(err => {
            callback(err);            // ⚠️ Callback
            throw err;                // ⚠️ Promise
        });
}

// 😵 Come si usa? Callback o Promise?
fetchUser(123, (err, user) => {       // Callback style
    if (err) return console.error(err);
    console.log(user);
});
// oppure
fetchUser(123).then(user => {         // Promise style
    console.log(user);
});
// Entrambi? Confuso! Error handling duplicato!

// ✅ SCEGLI UNO: Solo Promise
function fetchUser(id) {
    return fetch(`/api/users/${id}`)
        .then(response => response.json());
}

// Uso pulito
fetchUser(123)
    .then(user => console.log(user))
    .catch(err => console.error(err));

// ✅ O Solo Callback (se devi mantenere backward compatibility)
function fetchUser(id, callback) {
    fetch(`/api/users/${id}`)
        .then(response => response.json())
        .then(data => callback(null, data))
        .catch(err => callback(err));
    
    // ⚠️ NON ritornare la Promise!
}

// Uso callback-only
fetchUser(123, (err, user) => {
    if (err) return console.error(err);
    console.log(user);
});
```

**Esempio Real-World: API Library Migration**
```javascript
// ❌ BAD: Tentativo di supportare ENTRAMBI gli stili
class APIClient {
    // 😫 Nightmare: Supporta sia callback che Promise
    getUser(userId, callback) {
        const promise = fetch(`/api/users/${userId}`)
            .then(r => r.json())
            .then(data => {
                if (callback) callback(null, data);  // Se c'è callback
                return data;                          // E ritorna Promise
            })
            .catch(err => {
                if (callback) callback(err);          // Errore via callback
                throw err;                            // E via Promise
            });
        
        // Se no callback, ritorna Promise
        return callback ? undefined : promise;
    }
}

// Problemi:
// 1. Interfaccia ambigua
// 2. Error handling doppio
// 3. Testing complesso
// 4. Bug nascosti

const api = new APIClient();

// Uso callback
api.getUser(123, (err, user) => {
    // ...
});

// Uso Promise
api.getUser(123)
    .then(user => { /* ... */ });

// 🐛 COSA SUCCEDE SE:
api.getUser(123, (err, user) => {
    console.log('Callback:', user);
})
.then(user => {
    // ⚠️ .then() su undefined! TypeError!
    console.log('Promise:', user);
});

// ✅ GOOD: Solo Promise (moderno)
class APIClient {
    getUser(userId) {
        return fetch(`/api/users/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            });
    }
    
    // ✅ Se serve backward compatibility, metodo separato
    getUserCallback(userId, callback) {
        this.getUser(userId)
            .then(user => callback(null, user))
            .catch(err => callback(err));
    }
}

// Uso pulito
const api = new APIClient();

// Promise style (raccomandato)
await api.getUser(123);

// Callback style (legacy support)
api.getUserCallback(123, (err, user) => {
    if (err) return console.error(err);
    console.log(user);
});
```

**Migration Strategy: Callback -> Promise**
```javascript
// Step 1: Old callback-based code
const fs = require('fs');

function processFile(filename, callback) {
    fs.readFile(filename, 'utf8', (err, data) => {
        if (err) return callback(err);
        
        const processed = data.toUpperCase();
        
        fs.writeFile('output.txt', processed, (err) => {
            if (err) return callback(err);
            callback(null, 'Success');
        });
    });
}

// Uso callback hell
processFile('input.txt', (err, result) => {
    if (err) return console.error(err);
    console.log(result);
});

// Step 2: Migra a Promise (util.promisify)
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

async function processFile(filename) {
    const data = await readFileAsync(filename, 'utf8');
    const processed = data.toUpperCase();
    await writeFileAsync('output.txt', processed);
    return 'Success';
}

// Uso pulito
processFile('input.txt')
    .then(result => console.log(result))
    .catch(err => console.error(err));

// Step 3: Se devi mantenere backward compatibility
function processFileCallback(filename, callback) {
    processFile(filename)
        .then(result => callback(null, result))
        .catch(err => callback(err));
}

// Entrambi gli stili disponibili
await processFile('input.txt');  // Promise (interno)
processFileCallback('input.txt', (err, result) => {  // Callback (legacy)
    // ...
});
```

**Helper: Callback-Promise Adapter**
```javascript
// Utility per supportare entrambi durante migrazione
function callbackify(promiseFn) {
    return function(...args) {
        const callback = args[args.length - 1];
        const hasCallback = typeof callback === 'function';
        
        // Rimuovi callback dagli args
        const promiseArgs = hasCallback ? args.slice(0, -1) : args;
        
        // Esegui Promise
        const promise = promiseFn(...promiseArgs);
        
        // Se c'è callback, usalo
        if (hasCallback) {
            promise
                .then(result => callback(null, result))
                .catch(err => callback(err));
            return undefined;  // Non ritornare Promise se callback
        }
        
        // Altrimenti ritorna Promise
        return promise;
    };
}

// Esempio: Funzione Promise-first
async function fetchData(url) {
    const response = await fetch(url);
    return response.json();
}

// Wrappa per supportare callback
const fetchDataFlexible = callbackify(fetchData);

// Uso Promise
fetchDataFlexible('https://api.example.com')
    .then(data => console.log(data));

// Uso Callback
fetchDataFlexible('https://api.example.com', (err, data) => {
    if (err) return console.error(err);
    console.log(data);
});

// ⚠️ Usa solo durante migrazione graduale!
// Obiettivo finale: Solo Promise/async-await
```

> **🎯 Best Practice Migration:**
> 1. **New code**: Solo Promise/async-await
> 2. **Legacy APIs**: Promisify con util.promisify()
> 3. **Public APIs**: Versione separata se serve backward compatibility
> 4. **Internal code**: Migra tutto a Promise
> 5. **Documentation**: Chiarisci quale pattern usare
> 6. **Deprecation**: Marca callback methods come deprecated
>
> **❌ Evita:**
> - Mix callback + Promise nella stessa funzione
> - Ritornare Promise se accetti callback
> - Duplicare error handling
> - Interfacce ambigue

---

## 🎯 Best Practices

> **💡 Teoria: Best Practices per Promise**
>
> Le **best practices** sono pattern collaudati che portano a codice
> robusto, manutenibile e performante.
>
> **Pilastri fondamentali:**
> 1. **Error Handling**: Gestione completa degli errori
> 2. **Chaining**: Return corretto per propagazione
> 3. **Performance**: Parallelismo dove possibile
> 4. **Reliability**: Timeout, retry, circuit breakers
> 5. **Maintainability**: Codice leggibile e testabile

### ✅ 1. Sempre Gestire Errori

> **Principio:** Ogni Promise chain deve avere almeno un `.catch()`
> o essere wrappata in `try/catch`.
>
> **Motivo:** Unhandled rejection causa crash (Node.js 15+) o silent failure

```javascript
// ✅ Pattern 1: .catch() alla fine della catena
fetchUser(123)
    .then(user => processUser(user))
    .then(processed => saveUser(processed))
    .catch(err => {
        // Singolo catch gestisce errori di TUTTA la catena
        console.error('❌ Error in user pipeline:', err);
        
        // Log per monitoring (Sentry, DataDog, etc.)
        logError('user_pipeline', err);
        
        // Ritorna fallback o ri-lancia
        return { error: true, message: err.message };
    })
    .finally(() => {
        // Cleanup sempre eseguito (successo o errore)
        cleanupResources();
    });

// ✅ Pattern 2: Try/catch con async/await (raccomandato)
async function handleUser(userId) {
    try {
        const user = await fetchUser(userId);
        const processed = await processUser(user);
        const saved = await saveUser(processed);
        
        console.log('✅ User handled successfully:', saved.id);
        return saved;
        
    } catch (err) {
        // Error handling centralizzato
        console.error('❌ Error handling user:', err);
        
        // Context-aware error handling
        if (err.code === 'NETWORK_ERROR') {
            // Retry per errori di rete
            return retryOperation(() => handleUser(userId));
        } else if (err.code === 'NOT_FOUND') {
            // Return default per utente non trovato
            return createDefaultUser(userId);
        } else {
            // Altri errori: re-throw
            throw err;
        }
        
    } finally {
        // Cleanup sempre eseguito
        await cleanupResources();
    }
}

// ✅ Pattern 3: Error handling granulare
fetchUser(123)
    .then(user => {
        return processUser(user)
            .catch(err => {
                // Gestione specifica per processUser
                console.error('Process error:', err);
                // Ritorna valore di fallback
                return { ...user, processed: false };
            });
    })
    .then(result => saveUser(result))
    .catch(err => {
        // Gestione errori fetch e save
        console.error('Fetch/Save error:', err);
    });
// Nota: processUser fallisce ma la catena continua con fallback

// ✅ Pattern 4: Custom Error Classes
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.code = 'VALIDATION_ERROR';
    }
}

class DatabaseError extends Error {
    constructor(message, query) {
        super(message);
        this.name = 'DatabaseError';
        this.query = query;
        this.code = 'DB_ERROR';
    }
}

async function createUser(userData) {
    try {
        // Validation
        if (!userData.email) {
            throw new ValidationError('Email required', 'email');
        }
        
        // Database operation
        const user = await db.insert(userData);
        return user;
        
    } catch (err) {
        // Type-aware error handling
        if (err instanceof ValidationError) {
            console.error(`❌ Validation failed on ${err.field}:`, err.message);
            return { error: 'validation', field: err.field, message: err.message };
            
        } else if (err instanceof DatabaseError) {
            console.error('❌ Database error:', err.message);
            console.error('Query:', err.query);
            await alertOps('Database down!');
            throw err;  // Re-throw per errori critici
            
        } else {
            // Unknown error
            console.error('❌ Unknown error:', err);
            throw err;
        }
    }
}

// ✅ Pattern 5: Error Propagation con Context
async function saveUserWithContext(userData) {
    try {
        return await db.save(userData);
    } catch (err) {
        // Arricchisci errore con context
        err.context = {
            operation: 'saveUser',
            userId: userData.id,
            timestamp: new Date().toISOString()
        };
        
        // Re-throw con context aggiunto
        throw err;
    }
}

async function processUserWorkflow(userId) {
    try {
        const user = await fetchUser(userId);
        const processed = await processUser(user);
        const saved = await saveUserWithContext(processed);
        return saved;
        
    } catch (err) {
        // Errore ha context aggiunto
        console.error('❌ Workflow failed:', err.message);
        console.error('Context:', err.context);
        
        // Log strutturato per monitoring
        logStructured({
            level: 'error',
            message: err.message,
            stack: err.stack,
            context: err.context,
            workflow: 'processUser'
        });
    }
}
```

**Error Handling Decision Tree:**
```javascript
/*
              Promise Rejected
                    |
                    v
         Errore recuperabile?
         /                  \
       Sì                     No
       |                      |
       v                      v
  Return fallback      Re-throw error
  Continue chain       Catch a livello app
  
  Esempi Recuperabili:     Esempi Non Recuperabili:
  - User not found         - Database down
    -> Create default      - Out of memory
  - Cache miss             - Invalid credentials
    -> Fetch from DB         (security issue)
  - Timeout                - File system full
    -> Retry
*/
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
