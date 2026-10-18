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

**Teoria:** Un **callback** è una **funzione passata come argomento** a un'altra funzione, che verrà **eseguita in un momento successivo**, tipicamente al completamento di un'operazione asincrona.

### Etimologia e Concetto

Il termine "callback" deriva dall'inglese:
- **Call**: chiamare
- **Back**: indietro, di ritorno

Quindi "callback" = "richiamare", cioè **chiamare indietro** il codice che ha iniziato l'operazione una volta completata.

### Callback come First-Class Citizens

**Teoria:** In JavaScript, le funzioni sono **first-class citizens** (cittadini di prima classe), il che significa:

1. **Possono essere assegnate a variabili**
2. **Possono essere passate come argomenti** ad altre funzioni
3. **Possono essere restituite** da altre funzioni
4. **Possono essere memorizzate** in strutture dati

Questa caratteristica è FONDAMENTALE per i callback!

```javascript
// ============================================
// ESEMPIO BASE: Anatomia di un Callback
// ============================================

/**
 * Funzione che accetta una callback
 * 
 * @param {string} nome - Nome della persona da salutare
 * @param {function} callback - Funzione da eseguire DOPO il saluto
 */
function saluta(nome, callback) {
    // FASE 1: Esegue l'operazione principale
    console.log(`Ciao ${nome}!`);
    
    // FASE 2: Invoca il callback
    // 'callback' è una FUNZIONE (first-class citizen)
    // La eseguiamo come qualsiasi altra funzione
    callback(); // ← Questo ESEGUE la funzione passata
}

// ============================================
// UTILIZZO: Passiamo una funzione come argomento
// ============================================

// MODO 1: Funzione anonima (inline)
saluta('Mario', function() {
    console.log('Callback eseguita!');
});

// MODO 2: Arrow function (moderna)
saluta('Luigi', () => {
    console.log('Callback con arrow function!');
});

// MODO 3: Funzione nominata (riutilizzabile)
function dopoSaluto() {
    console.log('Callback da funzione nominata!');
}
saluta('Peach', dopoSaluto);

// Output:
// Ciao Mario!
// Callback eseguita!
// Ciao Luigi!
// Callback con arrow function!
// Ciao Peach!
// Callback da funzione nominata!

// ============================================
// IMPORTANTE: Callback vs Chiamata Normale
// ============================================

// ❌ SBAGLIATO: Questo ESEGUE la funzione SUBITO
saluta('Bowser', dopoSaluto()); // ← Le () eseguono subito!
// TypeError: callback is not a function

// ✅ CORRETTO: Questo PASSA la funzione
saluta('Bowser', dopoSaluto); // ← Senza (), passa il riferimento

// ============================================
// CALLBACK CON PARAMETRI
// ============================================

/**
 * Callback può ricevere dati dalla funzione chiamante
 */
function salutaCompleto(nome, callback) {
    const messaggio = `Ciao ${nome}!`;
    const timestamp = new Date();
    
    // Passa dati al callback
    callback(messaggio, timestamp);
}

salutaCompleto('Mario', function(msg, time) {
    console.log(msg);
    console.log('Eseguito alle:', time.toLocaleTimeString());
});

// Output:
// Ciao Mario!
// Eseguito alle: 14:30:45

// ============================================
// PERCHÉ USARE CALLBACK?
// ============================================

/**
 * 1. FLESSIBILITÀ: Comportamento personalizzabile
 */
function operazione(x, y, callback) {
    const risultato = callback(x, y);
    console.log('Risultato:', risultato);
}

// Stessa funzione, comportamenti diversi!
operazione(5, 3, (a, b) => a + b);  // Somma: 8
operazione(5, 3, (a, b) => a * b);  // Moltiplicazione: 15
operazione(5, 3, (a, b) => a ** b); // Potenza: 125

/**
 * 2. RIUTILIZZABILITÀ: Una funzione, molti usi
 */
const numeri = [1, 2, 3, 4, 5];

// Array.map usa callback per trasformare elementi
numeri.map(n => n * 2);        // [2, 4, 6, 8, 10]
numeri.map(n => n ** 2);        // [1, 4, 9, 16, 25]
numeri.map(n => `Numero ${n}`); // ['Numero 1', ...]

/**
 * 3. ASINCRONIA: Esegui codice dopo operazione
 *    (vedremo meglio dopo)
 */
setTimeout(() => {
    console.log('Eseguito dopo 1 secondo');
}, 1000);

### 📖 Analogia del Mondo Reale

**Teoria:** I callback nel codice funzionano esattamente come nella vita reale quando deleghiamo compiti che richiedono tempo.

#### Scenario: Ordinare una Pizza

Immagina di ordinare una pizza per telefono:

```
[FASE 1: RICHIESTA]
Tu: "Vorrei una pizza margherita"  ← Inizio operazione asincrona
Pizzeria: "Ok, ci vorrà 30 minuti"  ← Operazione richiede tempo
Pizzeria: "Ti richiamo quando è pronta" ← Registra callback

[FASE 2: ATTESA NON BLOCCANTE]
Tu: *continui a fare altro*  ← Il tuo "programma" continua
    - Guardi TV
    - Leggi un libro
    - Fai altre chiamate
    ↑ NON sei bloccato ad aspettare!

[FASE 3: CALLBACK EXECUTION]
[dopo 30 minuti]
Pizzeria: *chiama* "La pizza è pronta!" ← Callback eseguito!
Tu: *vai a ritirarla*  ← Azione dopo completamento
```

#### Mappatura al Codice

Vediamo come questa analogia si traduce in codice:

```javascript
// ============================================
// SCENARIO PIZZA IN CODICE
// ============================================

/**
 * Simula ordinazione pizza (operazione asincrona)
 * 
 * @param {string} tipoPizza - Tipo di pizza da ordinare
 * @param {function} callback - Funzione da chiamare quando pronta
 */
function ordinaPizza(tipoPizza, callback) {
    console.log(`📞 Ordino: ${tipoPizza}`);
    console.log('🕐 Tempo stimato: 30 minuti');
    console.log('   Pizzeria: "Ti richiamo quando è pronta!"\n');
    
    // Simula preparazione pizza (30 secondi = 30 minuti nella realtà)
    setTimeout(() => {
        // Dopo 30 secondi, "richiama" il cliente
        const pizza = {
            tipo: tipoPizza,
            temperatura: '🔥 Calda',
            pronta: true
        };
        
        // CALLBACK: "Ti sto richiamando!"
        callback(pizza);
    }, 30000); // 30 secondi
}

// ============================================
// UTILIZZO: Cliente ordina pizza
// ============================================

console.log('👤 Cliente: Chiamo la pizzeria...\n');

// ORDINA (registra callback)
ordinaPizza('Margherita', function(pizza) {
    // Questo codice viene eseguito DOPO 30 secondi
    console.log('\n📞 Pizzeria mi ha richiamato!');
    console.log('🍕 Pizza ricevuta:', pizza.tipo);
    console.log('🌡️  Temperatura:', pizza.temperatura);
    console.log('👤 Vado a ritirarla!');
});

// IMPORTANTE: Il programma NON si blocca qui
console.log('👤 Cliente: Mentre aspetto, faccio altro...\n');

// Simula altre attività durante l'attesa
console.log('📺 Guardo TV');
console.log('📖 Leggo un libro');
console.log('☕ Bevo un caffè');
console.log('\n⏳ Aspetto la chiamata della pizzeria...\n');

// Output:
// 👤 Cliente: Chiamo la pizzeria...
// 📞 Ordino: Margherita
// 🕐 Tempo stimato: 30 minuti
//    Pizzeria: "Ti richiamo quando è pronta!"
// 
// 👤 Cliente: Mentre aspetto, faccio altro...
// 📺 Guardo TV
// 📖 Leggo un libro
// ☕ Bevo un caffè
// ⏳ Aspetto la chiamata della pizzeria...
// 
// [... 30 secondi dopo ...]
// 
// 📞 Pizzeria mi ha richiamato!
// 🍕 Pizza ricevuta: Margherita
// 🌡️  Temperatura: 🔥 Calda
// 👤 Vado a ritirarla!

// ============================================
// CONFRONTO: Con vs Senza Callback
// ============================================

// ❌ SENZA CALLBACK (bloccante - impossibile in realtà)
console.log('Ordino pizza');
// *aspetto 30 minuti fermo al telefono* 😴
// NON posso fare NULLA durante l'attesa
const pizza = // ... dopo 30 minuti
console.log('Pizza arrivata');

// ✅ CON CALLBACK (non bloccante - come nella realtà)
console.log('Ordino pizza');
ordinaPizza('Margherita', (pizza) => {
    console.log('Pizza arrivata');
});
console.log('Faccio altro mentre aspetto'); // ← Eseguito SUBITO!

// ============================================
// MAPPATURA CONCETTI:
// ============================================

/*
┌─────────────────────────┬──────────────────────────┐
│ MONDO REALE             │ CODICE                   │
├─────────────────────────┼──────────────────────────┤
│ Ordinare pizza          │ Chiamare funzione async  │
│ "Ti richiamo"           │ Passare callback         │
│ Fare altro              │ Codice continua          │
│ Pizzeria richiama       │ Callback viene eseguito  │
│ Ritirare pizza          │ Usare risultato          │
│ 30 minuti attesa        │ setTimeout / I/O         │
│ Cliente non bloccato    │ Event loop non bloccato  │
└─────────────────────────┴──────────────────────────┘
*/


## 🔄 Callback Sincrone vs Asincrone

**Teoria:** Esistono DUE tipi di callback in JavaScript, che si comportano in modi completamente diversi:

1. **Sincrone**: Eseguite IMMEDIATAMENTE, bloccano l'esecuzione
2. **Asincrone**: Eseguite IN FUTURO, NON bloccano l'esecuzione

Capire questa differenza è FONDAMENTALE per programmare in Node.js!

### Callback Sincrone

**Definizione:** Callback eseguite **immediatamente e completamente** prima che la funzione chiamante ritorni il controllo.

**Caratteristiche:**
- ⏸️ **Bloccanti**: Fermano l'esecuzione fino al completamento
- 📋 **Stack-based**: Eseguite nello stack delle chiamate corrente
- ⚡ **Immediate**: Eseguite SUBITO, senza delay
- 🔄 **Sequenziali**: Una dopo l'altra, in ordine

```javascript
// ============================================
// ESEMPIO 1: Array.forEach (Callback Sincrona)
// ============================================

const numeri = [1, 2, 3, 4, 5];

console.log('Inizio'); // ← PRIMO

// forEach esegue il callback SINCRONAMENTE
// Per OGNI elemento, IMMEDIATAMENTE
numeri.forEach(function(numero) {
    console.log(numero); // ← SECONDO (5 volte)
    // Questo blocca l'esecuzione
    // Nessun altro codice viene eseguito
    // finché tutti i numeri non sono stampati
});

console.log('Fine'); // ← TERZO (solo dopo forEach completo)

// Output GARANTITO:
// Inizio
// 1   ← forEach blocca qui
// 2   ← ancora bloccato
// 3   ← ancora bloccato
// 4   ← ancora bloccato
// 5   ← ancora bloccato
// Fine ← solo ora prosegue

// ============================================
// FLUSSO DI ESECUZIONE (Call Stack)
// ============================================

/*
Tempo →

[1] console.log('Inizio')
    ↓
[2] forEach(callback)
    ↓
[3]   callback(1)  ← Esegue SUBITO
    ↓
[4]   callback(2)  ← Esegue SUBITO
    ↓
[5]   callback(3)  ← Esegue SUBITO
    ↓
[6]   callback(4)  ← Esegue SUBITO
    ↓
[7]   callback(5)  ← Esegue SUBITO
    ↓
[8] console.log('Fine')

Tutto nel CALL STACK, nessun Event Loop coinvolto
*/

// ============================================
// ESEMPIO 2: Array.map (Callback Sincrona)
// ============================================

const risultati = numeri.map(function(n) {
    console.log(`Processing ${n}`);
    return n * 2;
});

console.log('Map completato');
console.log('Risultati:', risultati);

// Output:
// Processing 1
// Processing 2
// Processing 3
// Processing 4
// Processing 5
// Map completato
// Risultati: [2, 4, 6, 8, 10]

// ============================================
// PERCHÉ SINCRONO?
// ============================================

/**
 * Callback sincrone sono usate quando:
 * 1. Operazione è VELOCE (no I/O)
 * 2. Risultato serve SUBITO
 * 3. Dati già in memoria
 * 4. Trasformazioni pure (no side effects async)
 */

// Altri esempi di callback sincrone:
numeri.filter(n => n > 2);        // Sincrono
numeri.reduce((a, b) => a + b);   // Sincrono
numeri.find(n => n === 3);        // Sincrono
numeri.some(n => n > 10);         // Sincrono

// ============================================
// PERFORMANCE IMPLICATIONS
// ============================================

const bigArray = new Array(1000000).fill(1);

console.time('forEach sincrono');

// Questo BLOCCA l'event loop per tutto il tempo!
bigArray.forEach(n => {
    // Operazione pesante
    Math.sqrt(n * n);
});

console.timeEnd('forEach sincrono');
// forEach sincrono: ~50ms
// Durante questi 50ms, NULLA altro può essere eseguito!
// Server HTTP non risponde
// Timer non scattano
// I/O non processata

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

**Definizione:** Callback eseguite **in un momento futuro**, dopo che la funzione chiamante ha già ritornato il controllo.

**Caratteristiche:**
- ⚡ **Non Bloccanti**: NON fermano l'esecuzione
- 🔄 **Event Loop**: Gestite dall'Event Loop di Node.js
- ⏰ **Delayed**: Eseguite dopo un delay o evento
- 🎯 **Callback Queue**: Messe in coda per esecuzione futura

```javascript
// ============================================
// ESEMPIO 1: setTimeout (Callback Asincrona)
// ============================================

console.log('1. Inizio'); // ← PRIMO (esecuzione sincrona)

// setTimeout registra un callback ASINCRONO
// Il callback NON viene eseguito ora
// Viene messo in una CODA per esecuzione futura
setTimeout(function() {
    console.log('3. Callback asincrona'); // ← TERZO (dopo 1 secondo)
    // Questo codice viene eseguito DOPO
    // che tutto il resto ha finito
}, 1000); // 1000ms = 1 secondo

console.log('2. Fine'); // ← SECONDO (esecuzione sincrona)

// Output:
// 1. Inizio        ← Eseguito immediatamente
// 2. Fine          ← Eseguito immediatamente
// [... 1 secondo di pausa ...]
// 3. Callback asincrona  ← Eseguito dopo 1 secondo

// ============================================
// FLUSSO DI ESECUZIONE (Con Event Loop)
// ============================================

/*
CALL STACK          TIMER QUEUE        OUTPUT
───────────        ────────────       ──────

[1] log('Inizio')
    ↓                                  "Inizio"
    
[2] setTimeout()
    ↓
    ↓ Callback → [timeout: 1000ms] ← Registrato!
    ↓              Aspetta...
    
[3] log('Fine')
    ↓                                  "Fine"
    
[4] Stack vuoto!
    ↓
    ↓ Event Loop controlla queue...
    ↓
    [... 1 secondo ...]
    ↓
    ↓              [callback pronto!]
    ↓                     ↓
[5] Esegue callback ←────┘           "Callback asincrona"
    ↓
[6] Fine
*/

// ============================================
// ESEMPIO 2: Confronto Diretto
// ============================================

console.log('=== SINCRONO ==');
const arr = [1, 2, 3];

// Callback SINCRONA: blocca
arr.forEach(n => {
    console.log(`Sync: ${n}`);
});

console.log('Dopo forEach');

console.log('\n=== ASINCRONO ==');

// Callback ASINCRONA: non blocca
arr.forEach(n => {
    setTimeout(() => {
        console.log(`Async: ${n}`);
    }, 0); // Anche con 0ms, è asincrono!
});

console.log('Dopo setTimeout');

// Output:
// === SINCRONO ==
// Sync: 1          ← Blocca qui
// Sync: 2          ← Blocca qui
// Sync: 3          ← Blocca qui
// Dopo forEach     ← Solo ora prosegue
// 
// === ASINCRONO ==
// Dopo setTimeout  ← Eseguito SUBITO
// Async: 1         ← Eseguito DOPO
// Async: 2         ← Eseguito DOPO
// Async: 3         ← Eseguito DOPO

// ============================================
// ESEMPIO 3: I/O Asincrono (File System)
// ============================================

const fs = require('fs');

console.log('1. Inizio lettura file');

// readFile è ASINCRONA
// Non blocca mentre legge dal disco
fs.readFile('file.txt', 'utf8', function(err, data) {
    console.log('3. File letto!');
    console.log('   Contenuto:', data);
});

console.log('2. Continuo mentre file viene letto');

// Durante la lettura del file:
// - Event loop continua
// - Altro codice può essere eseguito
// - Server può rispondere ad altre richieste
// - Timer possono scattare

// Output:
// 1. Inizio lettura file
// 2. Continuo mentre file viene letto  ← Non aspetta!
// [... I/O in background ...]
// 3. File letto!
//    Contenuto: [contenuto del file]

// ============================================
// ESEMPIO 4: Multiple Callback Asincrone
// ============================================

console.log('Start');

setTimeout(() => console.log('Timeout 1 (100ms)'), 100);
setTimeout(() => console.log('Timeout 2 (50ms)'), 50);
setTimeout(() => console.log('Timeout 3 (0ms)'), 0);

console.log('End');

// Output:
// Start
// End              ← Codice sincrono finisce PRIMA
// Timeout 3 (0ms)  ← Più breve delay
// Timeout 2 (50ms) ← Delay medio
// Timeout 1 (100ms)← Delay più lungo

// IMPORTANTE: Anche setTimeout(..., 0) è ASINCRONO!
// Non viene eseguito immediatamente, ma nel prossimo tick

// ============================================
// PERCHÉ ASINCRONO?
// ============================================

/**
 * Callback asincrone sono usate quando:
 * 1. Operazione richiede TEMPO (I/O, network)
 * 2. Non vogliamo BLOCCARE il programma
 * 3. Risultato arriva in FUTURO
 * 4. Operazioni concorrenti (molte richieste)
 * 
 * Esempi comuni:
 * - fs.readFile() - Lettura file
 * - http.get() - Richieste HTTP
 * - database.query() - Query database
 * - setTimeout() - Timer
 * - process.nextTick() - Next event loop tick
 */

// ============================================
// NON BLOCCANTE = PERFORMANTE
// ============================================

// Scenario: Server che gestisce 100 richieste

// ❌ SINCRONO (bloccante):
// Richiesta 1: legge file (50ms) ← BLOCCA
// Richiesta 2: aspetta...        ← 50ms persi
// Richiesta 3: aspetta...        ← 100ms persi
// ...
// Richiesta 100: aspetta...      ← 4950ms persi!
// Tempo totale: 5000ms

// ✅ ASINCRONO (non bloccante):
// Richiesta 1: inizia lettura → continua
// Richiesta 2: inizia lettura → continua
// Richiesta 3: inizia lettura → continua
// ...
// Tutte e 100 le richieste processate in ~50ms!
// Tempo totale: ~50ms (100x più veloce!)

### Anatomia di un Callback asincrono

```javascript
// Funzione che accetta una callback
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

**Teoria:** Node.js è progettato attorno a un'architettura **single-threaded, event-driven, non-blocking I/O**. I callbacks sono il meccanismo FONDAMENTALE che rende possibile questo modello.

### Architettura di Node.js

```
┌─────────────────────────────────────────────┐
│         APPLICATION CODE                    │
│         (Il tuo codice JavaScript)          │
├─────────────────────────────────────────────┤
│         V8 JavaScript Engine                │
│         (Esegue JavaScript)                 │
├─────────────────────────────────────────────┤
│         EVENT LOOP   ←──── Single Thread!   │
│         (Gestisce callback)                 │
├─────────────────────────────────────────────┤
│         libuv                               │
│         (Thread Pool per I/O)               │
│         - File System                       │
│         - Network                           │
│         - DNS                               │
│         - Crypto                            │
└─────────────────────────────────────────────┘
```

### I Tre Pilastri di Node.js

#### 1. **Non Bloccare l'Event Loop**

**Problema:** Operazioni I/O sono LENTE (millisecondi o secondi)

```javascript
const fs = require('fs');

// ============================================
// ❌ MALE: Sincrono (BLOCCA)
// ============================================

console.log('1. Inizio');

// readFileSync BLOCCA l'intero processo
// Durante questa operazione:
// - Nessun altro codice può essere eseguito
// - Server NON può rispondere a richieste
// - Timer NON scattano
// - Event Loop FERMO
const data = fs.readFileSync('file.txt', 'utf8');

console.log('2. File letto:', data);
console.log('3. Fine');

// Scenario con 1000 richieste:
// Se ogni file richiede 10ms, tempo totale = 10 secondi!
// Ultima richiesta aspetta 10 secondi per una risposta
// INACCETTABILE per un server web!

// ============================================
// ✅ BENE: Asincrono (NON BLOCCA)
// ============================================

console.log('1. Inizio');

// readFile NON blocca
// Registra callback e continua immediatamente
fs.readFile('file.txt', 'utf8', function(err, data) {
    // Questo viene eseguito DOPO, quando I/O completa
    console.log('3. File letto:', data);
});

// Questo viene eseguito SUBITO
console.log('2. Fine (mentre file viene letto)');

// Durante la lettura:
// - Event loop continua a girare
// - Altre richieste possono essere processate
// - Timer possono scattare
// - Applicazione rimane responsive

// Output:
// 1. Inizio
// 2. Fine (mentre file viene letto)
// 3. File letto: [contenuto]

// Scenario con 1000 richieste:
// Tutte iniziano IMMEDIATAMENTE
// Tempo totale = ~10ms (tutte in parallelo!)
// 1000x PIÙ VELOCE!
```

#### 2. **Gestire Operazioni Asincrone**

**Problema:** Come eseguire codice DOPO un'operazione asincrona?

```javascript
// ============================================
// SFIDA: Usare risultato di operazione async
// ============================================

const fs = require('fs');

// ❌ PROBLEMA: Come otteniamo il risultato?
let fileContent; // undefined

fs.readFile('file.txt', 'utf8', function(err, data) {
    fileContent = data; // Assegna quando pronto
});

console.log(fileContent); // undefined! 😱
// Il codice qui viene eseguito PRIMA che file sia letto

// ✅ SOLUZIONE: Callback!
// Esegui codice DENTRO la callback

fs.readFile('file.txt', 'utf8', function(err, data) {
    // QUESTO è il posto giusto!
    // data è disponibile QUI
    console.log(data); // ✓ Funziona!
    
    // Tutto il codice che usa 'data' va qui
    processData(data);
    sendResponse(data);
    logAccess(data);
});

// ============================================
// CALLBACK = Continuazione del Programma
// ============================================

/**
 * Pensa al callback come "cosa fare DOPO"
 */

fs.readFile('file.txt', 'utf8', function(err, data) {
    // "Quando hai finito di leggere il file, FAI QUESTO"
    console.log('Operazione completata!');
});

const https = require('https');

https.get('https://api.example.com', function(res) {
    // "Quando ricevi risposta HTTP, FAI QUESTO"
    res.on('data', chunk => {
        // "Per ogni chunk di dati, FAI QUESTO"
    });
});
```

#### 3. **Mantenere Codice Non Bloccante**

**Performance:** Fondamentale per scalabilità

```javascript
// ============================================
// COMPARAZIONE: Node.js vs Altri Server
// ============================================

/*
SCENARIO: 10,000 richieste concorrenti
Ogni richiesta legge file da disco (10ms)

--- SERVER TRADIZIONALE (Thread-per-Request) ---

┌────────────────────────────────────────┐
│ Thread 1: [===BLOCKED===] legge file   │
│ Thread 2: [===BLOCKED===] legge file   │
│ Thread 3: [===BLOCKED===] legge file   │
│ ...                                    │
│ Thread 10k: [===BLOCKED===] legge file │
└────────────────────────────────────────┘

Memoria: 10,000 thread * 1MB = 10GB RAM!
Context switching: Costoso
Tempo risposta: Variabile, spesso lento

--- NODE.JS (Event Loop + Callbacks) ---

┌────────────────────────────────────────┐
│ Single Thread: [RUNNING]               │
│   → Registra 10k callbacks             │
│   → Delega I/O a libuv                 │
│   → Continua a processare              │
│                                        │
│ libuv Thread Pool: Gestisce I/O        │
│   [====] [====] [====] [====] 4 thread │
└────────────────────────────────────────┘

Memoria: ~50MB RAM (1 thread + overhead)
Context switching: Minimo
Tempo risposta: Costante, veloce

RISULTATO:
Node.js = 200x meno memoria
Node.js = throughput molto più alto
*/

// ============================================
// ESEMPIO PRATICO: Server HTTP
// ============================================

const http = require('http');
const fs = require('fs');

const server = http.createServer(function(req, res) {
    // Questo callback viene eseguito per OGNI richiesta
    // Ma NON blocca altre richieste!
    
    console.log('Richiesta ricevuta:', req.url);
    
    // Legge file asincronamente
    fs.readFile('index.html', 'utf8', function(err, data) {
        if (err) {
            res.writeHead(500);
            res.end('Errore server');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
    
    // Questo ritorna IMMEDIATAMENTE
    // NON aspetta che file sia letto
    // Server può processare la prossima richiesta!
});

server.listen(3000);

console.log('Server in ascolto su porta 3000');

// Con callbacks:
// - 1 thread gestisce MIGLIAIA di connessioni
// - Memoria minima
// - Performance eccellenti per I/O-bound tasks

## 📝 La Convenzione Error-First Callback

### **Teoria: La Convenzione Error-First**

Node.js segue una convenzione standard universale per i callbacks: **error-first callback** (anche chiamato "errback pattern" o "Node.js callback convention"). Questa è una delle convenzioni più importanti dell'ecosistema Node.js.

**Perché è stata adottata questa convenzione?**

1. **Uniformità**: Tutte le API asincrone di Node.js seguono la stessa firma
2. **Gestione errori esplicita**: Gli sviluppatori sono "costretti" a pensare agli errori
3. **Composabilità**: Facilita la creazione di librerie e middleware compatibili
4. **Prevedibilità**: Gli sviluppatori sanno sempre cosa aspettarsi

**Anatomia della firma error-first:**

```
function myCallback(err, result1, result2, ...) {
                    ↑     ↑       ↑
                    │     │       └─ Altri parametri opzionali
                    │     └───────── Primo risultato (se successo)
                    └─────────────── SEMPRE primo: errore o null
}
```

**Regola d'oro:** 
> Se `err` non è `null` o `undefined`, l'operazione è fallita e NON devi usare gli altri parametri.

### Convention Error-First

Node.js usa il pattern **error-first callback**:
- **Il primo parametro è SEMPRE l'errore** (`err`): `null` se successo, oggetto Error se fallimento
- **I parametri successivi sono i dati** di successo (ignorali se `err` non è null)

```javascript
const fs = require('fs');  // File System module

// ══════════════════════════════════════════════════════════════════════════════
//  ❌ SBAGLIATO: Parametri nell'ordine errato
// ══════════════════════════════════════════════════════════════════════════════

fs.readFile('file.txt', function(data, err) {
    // ERRORE! L'ordine dei parametri è invertito
    // Node.js passerà l'errore come PRIMO parametro
    // quindi data conterrà l'errore e err conterrà undefined!
    
    if (data) {  // Questo controllerebbe l'errore, non i dati!
        console.log('Dati:', data);  // Non funziona come previsto
    }
});


// ══════════════════════════════════════════════════════════════════════════════
//  ✅ CORRETTO: Error-first callback
// ══════════════════════════════════════════════════════════════════════════════

fs.readFile('file.txt', 'utf8', function(err, data) {
    // Parametro 1: err
    //   - null o undefined se operazione riuscita
    //   - oggetto Error se operazione fallita
    
    // Parametro 2: data
    //   - contenuto del file se operazione riuscita
    //   - undefined o valore non affidabile se fallita
    
    // PASSO 1: Controlla SEMPRE l'errore per primo
    if (err) {
        console.error('Errore:', err);  // Gestisci errore
        return;  // IMPORTANTE: Esci immediatamente, non continuare
    }
    
    // PASSO 2: Usa il risultato SOLO se non ci sono errori
    console.log('Contenuto:', data);  // Sicuro: err è null qui
});
```

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  TEMPLATE: Come implementare una funzione con error-first callback
// ══════════════════════════════════════════════════════════════════════════════

function operazione(parametri, callback) {
    // Esegui operazione asincrona...
    
    // Firma della callback:
    // callback(err, risultato)
    //          ↑    ↑
    //          |    └─ risultato se successo (err sarà null)
    //          └────── errore se fallimento (risultato sarà undefined)
    
    // Esempio invocazione in caso di successo:
    // callback(null, datiDiSuccesso);
    
    // Esempio invocazione in caso di errore:
    // callback(new Error('Qualcosa è andato storto'));
}
```

### Regole della Convenzione

**Le 3 Regole d'Oro dell'Error-First Callback:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  REGOLA 1: PRIMO PARAMETRO = ERRORE                                     │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Sempre null/undefined se operazione riuscita                         │
│  • Sempre oggetto Error (o derivato) se operazione fallita              │
│  • MAI passare stringa come errore (usa new Error(msg))                 │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  REGOLA 2: PARAMETRI SUCCESSIVI = RISULTATI                             │
│  ─────────────────────────────────────────────────────────────────────  │
│  • Contengono i dati/risultati SOLO se err è null                       │
│  • Possono essere multipli: callback(err, result1, result2, ...)        │
│  • Non fare affidamento su questi se err non è null                     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  REGOLA 3: CONTROLLO ERRORE OBBLIGATORIO                                │
│  ─────────────────────────────────────────────────────────────────────  │
│  • SEMPRE controllare err come prima cosa nel callback                  │
│  • Se err è truthy, gestisci l'errore e return                          │
│  • Solo dopo aver verificato err === null, usa i risultati              │
└─────────────────────────────────────────────────────────────────────────┘
```

**Anti-pattern comuni da evitare:**

```javascript
// ❌ MALE: Non controllare l'errore
fs.readFile('file.txt', (err, data) => {
    console.log(data);  // Potrebbe essere undefined se err!
});

// ❌ MALE: Controllare solo data
fs.readFile('file.txt', (err, data) => {
    if (data) {  // Falso positivo se file vuoto!
        console.log(data);
    }
});

// ❌ MALE: Non fare return dopo gestire errore
fs.readFile('file.txt', (err, data) => {
    if (err) {
        console.error(err);
        // Manca return! Il codice continua anche con errore!
    }
    console.log(data);  // Eseguito anche se err!
});

// ✅ BENE: Pattern corretto
fs.readFile('file.txt', (err, data) => {
    if (err) {              // 1. Controlla errore
        console.error(err); // 2. Gestisci errore
        return;             // 3. ESCI immediatamente
    }
    console.log(data);      // 4. Usa risultato SOLO qui
});
```

```javascript
const fs = require('fs');  // Modulo File System di Node.js

// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO COMPLETO: Error-First Callback Pattern
// ══════════════════════════════════════════════════════════════════════════════

fs.readFile('file.txt', 'utf8', function(err, data) {
    // fs.readFile è ASINCRONO:
    // 1. Inizia a leggere il file
    // 2. Ritorna immediatamente (non blocca)
    // 3. Quando finito, invoca questa callback
    
    // Parametri ricevuti:
    // err  : Error object se fallito, null se riuscito
    // data : Contenuto del file (string perché encoding='utf8')
    
    // ─────────────────────────────────────────────────────────────────
    // STEP 1: CONTROLLA SEMPRE L'ERRORE PER PRIMO
    // ─────────────────────────────────────────────────────────────────
    if (err) {
        // Errore verificato: l'operazione è fallita
        
        // err.message : descrizione errore umana
        // err.code    : codice errore (es. 'ENOENT', 'EACCES')
        // err.stack   : stack trace per debugging
        
        console.error('Errore lettura file:', err.message);
        
        // IMPORTANTE: return per uscire immediatamente
        // Se non fai return, il codice continua e usa data (che è undefined!)
        return;
    }
    
    // ─────────────────────────────────────────────────────────────────
    // STEP 2: USA IL RISULTATO (SOLO SE NON CI SONO ERRORI)
    // ─────────────────────────────────────────────────────────────────
    
    // Sicuro usare data qui: sappiamo che err è null
    console.log('Contenuto:', data);
    
    // Potremmo fare altre operazioni con data:
    // - Parsing (se JSON/CSV)
    // - Trasformazione
    // - Passaggio ad altre funzioni
});

// Codice continua QUI IMMEDIATAMENTE (non aspetta readFile)
console.log('Richiesta di lettura inviata...');


// ══════════════════════════════════════════════════════════════════════════════
//  ORDINE DI ESECUZIONE
// ══════════════════════════════════════════════════════════════════════════════

// Output se file.txt ESISTE:
// 1. "Richiesta di lettura inviata..."  (immediatamente)
// 2. "Contenuto: [contenuto del file]"  (dopo che file è letto)

// Output se file.txt NON ESISTE:
// 1. "Richiesta di lettura inviata..."  (immediatamente)
// 2. "Errore lettura file: ENOENT: no such file or directory, open 'file.txt'"


// ══════════════════════════════════════════════════════════════════════════════
//  CODICI ERRORE COMUNI
// ══════════════════════════════════════════════════════════════════════════════

// ENOENT  : File o directory non esiste
// EACCES  : Permesso negato
// EISDIR  : È una directory (non un file)
// EMFILE  : Troppi file aperti
// ENOTDIR : Non è una directory
// ENOTEMPTY: Directory non vuota
```

## 🎨 Esempi Pratici

### Esempio 1: Lettura File

**Scenario:** Creare una funzione helper che incapsula la logica di lettura file e gestione errori.

```javascript
const fs = require('fs');

// ══════════════════════════════════════════════════════════════════════════════
//  FUNZIONE HELPER: Wrapper per fs.readFile
// ══════════════════════════════════════════════════════════════════════════════

function leggiFile(percorso, callback) {
    // Questa funzione:
    // 1. Accetta un percorso file
    // 2. Legge il file in modo asincrono
    // 3. Chiama la callback con pattern error-first
    
    // Parametri:
    // percorso : string - path del file da leggere
    // callback : function(err, data) - funzione da chiamare al termine
    
    fs.readFile(percorso, 'utf8', function(err, data) {
        // Callback interna che gestisce il risultato di fs.readFile
        
        if (err) {
            // Se errore, propaga al chiamante
            // callback(err, null) segue la convenzione error-first:
            //   - primo parametro: oggetto Error
            //   - secondo parametro: null (nessun dato valido)
            callback(err, null);
        } else {
            // Se successo, passa i dati al chiamante
            // callback(null, data) segue la convenzione:
            //   - primo parametro: null (nessun errore)
            //   - secondo parametro: data (contenuto file)
            callback(null, data);
        }
    });
    
    // Nota: questa funzione ritorna immediatamente (undefined)
    // Il vero risultato arriverà tramite callback
}


// ══════════════════════════════════════════════════════════════════════════════
//  UTILIZZO: Leggere e parsare file JSON di configurazione
// ══════════════════════════════════════════════════════════════════════════════

leggiFile('config.json', function(err, contenuto) {
    // Questa callback viene invocata quando leggiFile ha finito
    
    // STEP 1: Controlla errore di lettura file
    if (err) {
        // Possibili errori:
        // - File non esiste (ENOENT)
        // - Permessi insufficienti (EACCES)
        // - Percorso è una directory (EISDIR)
        console.error('Errore lettura:', err.message);
        return;  // Esci: non puoi parsare se non hai dati
    }
    
    // STEP 2: Ora che abbiamo il contenuto, proviamo a parsarlo come JSON
    try {
        // JSON.parse può lanciare eccezione se contenuto non è JSON valido
        const config = JSON.parse(contenuto);
        
        // Successo! Abbiamo l'oggetto configurazione
        console.log('Configurazione:', config);
        
        // Esempio di uso:
        // console.log('Server:', config.server);
        // console.log('Port:', config.port);
        
    } catch (parseErr) {
        // Errore durante il parsing JSON
        // Possibili cause:
        // - JSON malformato
        // - Virgole mancanti
        // - Quotes non chiuse
        console.error('Errore parsing JSON:', parseErr.message);
    }
});

// ══════════════════════════════════════════════════════════════════════════════
//  POSSIBILI OUTPUT
// ══════════════════════════════════════════════════════════════════════════════

// Caso 1: Tutto OK
// Output: Configurazione: { server: 'localhost', port: 3000 }

// Caso 2: File non esiste
// Output: Errore lettura: ENOENT: no such file or directory, open 'config.json'

// Caso 3: File esiste ma non è JSON valido
// Output: Errore parsing JSON: Unexpected token } in JSON at position 45
```

### Esempio 2: Richiesta HTTP

**Scenario:** Recuperare dati da un'API esterna via HTTP.

```javascript
const https = require('https');  // Modulo HTTPS di Node.js (built-in)

// ══════════════════════════════════════════════════════════════════════════════
//  FUNZIONE HELPER: Fetch dati da URL
// ══════════════════════════════════════════════════════════════════════════════

function fetchData(url, callback) {
    // Parametri:
    // url      : string - URL da cui scaricare dati
    // callback : function(err, data) - funzione error-first
    
    https.get(url, (res) => {
        // res è un oggetto IncomingMessage (stream)
        // res.statusCode : codice HTTP (200, 404, 500, etc.)
        // res.headers    : headers della risposta
        
        let data = '';  // Buffer per accumulare i chunk di dati
        
        // ─────────────────────────────────────────────────────────────────
        // EVENT: 'data' - Arrivano chunk di dati (può essere chiamato più volte)
        // ─────────────────────────────────────────────────────────────────
        res.on('data', (chunk) => {
            // chunk è un Buffer contenente parte della risposta
            // I dati arrivano in "pezzi" (streaming)
            data += chunk;  // Concatena chunk al buffer totale
            
            // Note:
            // - chunk viene automaticamente convertito a string
            // - Per file grandi, questo approccio usa memoria
        });
        
        // ─────────────────────────────────────────────────────────────────
        // EVENT: 'end' - Tutti i dati sono stati ricevuti
        // ─────────────────────────────────────────────────────────────────
        res.on('end', () => {
            // Stream terminato: abbiamo tutti i dati
            
            // Successo! callback con err=null e data completa
            callback(null, data);
        });
        
    }).on('error', (err) => {
        // ─────────────────────────────────────────────────────────────────
        // EVENT: 'error' - Errore di rete o connessione
        // ─────────────────────────────────────────────────────────────────
        
        // Possibili errori:
        // - ENOTFOUND  : DNS resolution fallita (host non trovato)
        // - ECONNREFUSED: Connessione rifiutata (server non risponde)
        // - ETIMEDOUT  : Timeout connessione
        // - EPROTO     : Errore protocollo SSL/TLS
        
        // Propaga errore al chiamante
        callback(err, null);
    });
}


// ══════════════════════════════════════════════════════════════════════════════
//  UTILIZZO: Fetch da API RESTful
// ══════════════════════════════════════════════════════════════════════════════

fetchData('https://api.example.com/users', function(err, data) {
    // Callback invocata quando richiesta HTTP completa
    
    // STEP 1: Controlla errori di rete
    if (err) {
        console.error('Errore HTTP:', err.message);
        // Possibili azioni:
        // - Retry della richiesta
        // - Fallback a dati cached
        // - Notifica utente
        return;
    }
    
    // STEP 2: Abbiamo i dati (come string)
    console.log('Dati ricevuti:', data);
    
    // STEP 3: Spesso i dati sono JSON, quindi parse
    try {
        const users = JSON.parse(data);
        console.log(`Ricevuti ${users.length} utenti`);
        
        // Ora possiamo usare i dati
        users.forEach(user => {
            console.log(`- ${user.name}`);
        });
    } catch (parseErr) {
        console.error('Risposta non è JSON valido:', parseErr.message);
    }
});

// Output se successo:
// Dati ricevuti: [{"id":1,"name":"Mario"},{"id":2,"name":"Luigi"}]
// Ricevuti 2 utenti
// - Mario
// - Luigi

// Output se errore di rete:
// Errore HTTP: getaddrinfo ENOTFOUND api.example.com
```

### Esempio 3: Database Query

**Scenario:** Simulazione di una query asincrona al database.

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  SIMULAZIONE DATABASE: Query asincrona
// ══════════════════════════════════════════════════════════════════════════════

function queryDatabase(sql, params, callback) {
    // In un'applicazione reale, questa funzione:
    // 1. Si connette al database (MySQL, PostgreSQL, MongoDB, etc.)
    // 2. Esegue la query SQL
    // 3. Ritorna i risultati tramite callback
    
    // Parametri:
    // sql      : string - Query SQL da eseguire
    // params   : array - Parametri per prepared statement (prevenire SQL injection)
    // callback : function(err, results) - Callback error-first
    
    // Simula operazione asincrona con setTimeout
    setTimeout(() => {
        // Simula ritardo di rete/processing del database (1 secondo)
        
        // In un DB reale, qui ci sarebbe:
        // db.query(sql, params, function(err, results) {
        //     callback(err, results);
        // });
        
        // Per la simulazione, generiamo risultati fittizi
        const risultati = [
            { id: 1, nome: 'Mario', email: 'mario@example.com' },
            { id: 2, nome: 'Luigi', email: 'luigi@example.com' }
        ];
        
        // Simula successo: err = null, results = array di oggetti
        callback(null, risultati);
        
        // Per simulare un errore, potresti fare:
        // callback(new Error('Connection timeout'), null);
        
    }, 1000);  // 1000ms = 1 secondo
}


// ══════════════════════════════════════════════════════════════════════════════
//  UTILIZZO: Query lista utenti
// ══════════════════════════════════════════════════════════════════════════════

// Esegui query
queryDatabase('SELECT * FROM users', [], function(err, users) {
    // Callback invocata dopo ~1 secondo
    
    // STEP 1: Controlla errori database
    if (err) {
        // Possibili errori reali:
        // - Connection refused
        // - Syntax error in SQL
        // - Timeout
        // - Access denied
        console.error('Errore query:', err.message);
        return;  // Non continuare se query fallita
    }
    
    // STEP 2: Processa risultati
    console.log('Utenti trovati:', users.length);  // Output: Utenti trovati: 2
    
    // Itera sui risultati
    users.forEach(user => {
        console.log(`[${user.id}] ${user.nome} (${user.email})`);
    });
    
    // Output completo:
    // Utenti trovati: 2
    // [1] Mario (mario@example.com)
    // [2] Luigi (luigi@example.com)
});

// Codice continua qui immediatamente (non aspetta query)
console.log('Query inviata al database...');

// Ordine di esecuzione:
// 1. "Query inviata al database..." (immediatamente)
// 2. [dopo 1 secondo] "Utenti trovati: 2"
// 3. [dopo 1 secondo] "[1] Mario (mario@example.com)"
// 4. [dopo 1 secondo] "[2] Luigi (luigi@example.com)"


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO AVANZATO: Query con parametri (Prepared Statement)
// ══════════════════════════════════════════════════════════════════════════════

// Cerca utente specifico per ID
const userId = 1;

queryDatabase(
    'SELECT * FROM users WHERE id = ?',  // ? è placeholder per parametro
    [userId],                             // Array di parametri (sostituisce ?)
    function(err, users) {
        if (err) {
            console.error('Errore:', err);
            return;
        }
        
        // users è array (anche se aspettiamo 1 risultato)
        if (users.length === 0) {
            console.log('Utente non trovato');
            return;
        }
        
        const user = users[0];  // Primo (e unico) risultato
        console.log(`Trovato: ${user.nome}`);
    }
);


// ══════════════════════════════════════════════════════════════════════════════
//  PERCHÉ PREPARED STATEMENTS?
// ══════════════════════════════════════════════════════════════════════════════

// ❌ PERICOLOSO: SQL Injection vulnerabile
const badUserId = "1 OR 1=1";  // Input malevolo
queryDatabase(`SELECT * FROM users WHERE id = ${badUserId}`, [], callback);
// SQL finale: SELECT * FROM users WHERE id = 1 OR 1=1
// Ritorna TUTTI gli utenti! 🔓 Security breach!

// ✅ SICURO: Prepared statement (parametrizzato)
queryDatabase('SELECT * FROM users WHERE id = ?', [badUserId], callback);
// Il database tratta badUserId come VALORE LETTERALE, non come SQL
// 🔒 Protetto da SQL injection!
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

### **Teoria: Il Problema del Callback Hell**

Quando si concatenano molte operazioni asincrone, il codice può diventare difficile da leggere e mantenere. Questo fenomeno è conosciuto come **Callback Hell** o **Pyramid of Doom** (Piramide del Destino).

**Cos'è il Callback Hell?**

> È il pattern anti-design che emerge quando si annidano multiple callback asincrone, creando una struttura a piramide che si espande orizzontalmente rendendo il codice illeggibile e difficile da manutenere.

**Perché succede?**

JavaScript è single-threaded e usa operazioni asincrone per non bloccare l'event loop. Quando hai operazioni che dipendono una dall'altra (operazione B deve aspettare risultato di A), la tentazione naturale è annidare i callback:

```
operazioneA(function(risultatoA) {
    operazioneB(risultatoA, function(risultatoB) {
        operazioneC(risultatoB, function(risultatoC) {
            operazioneD(risultatoC, function(risultatoD) {
                // ... e così via ➡️➡️➡️➡️
            });
        });
    });
});
```

**Visualizzazione del problema:**

```
Callback Hell Visualization:

fs.readFile(                                     ← Livello 1
    if (err1)                                    
        fs.readFile(                             ← Livello 2
            if (err2)                            
                fs.readFile(                     ← Livello 3
                    if (err3)                    
                        fs.writeFile(            ← Livello 4
                            if (err4)            
                                console.log();   ← Livello 5 (5 indent!)
                        );
                );
        );

├─ Ogni livello aggiunge 1 indent
├─ Gestione errori ripetuta ad ogni livello
├─ Variabili in scope limitato
└─ Difficile seguire il flusso logico
```

### Il Problema

```javascript
const fs = require('fs');

// ══════════════════════════════════════════════════════════════════════════════
//  ❌ CALLBACK HELL: Esempio di codice difficile da gestire
// ══════════════════════════════════════════════════════════════════════════════

// SCENARIO: Leggere 3 file in sequenza, concatenarli e scrivere risultato

fs.readFile('file1.txt', 'utf8', function(err, data1) {
    // ┌─ Livello di nesting: 1
    // │  Indent: 4 spazi
    
    if (err) {                                    // Gestione errore 1/4
        console.error('Errore file1:', err);
        return;
    }
    
    // Abbiamo data1, ora leggiamo file2
    fs.readFile('file2.txt', 'utf8', function(err, data2) {
        // ┌─ Livello di nesting: 2
        // │  Indent: 8 spazi
        
        if (err) {                                // Gestione errore 2/4
            console.error('Errore file2:', err);
            return;
        }
        
        // Abbiamo data1 e data2, ora leggiamo file3
        fs.readFile('file3.txt', 'utf8', function(err, data3) {
            // ┌─ Livello di nesting: 3
            // │  Indent: 12 spazi
            
            if (err) {                            // Gestione errore 3/4
                console.error('Errore file3:', err);
                return;
            }
            
            // Abbiamo tutti e 3 i file, concateniamoli
            const combined = data1 + data2 + data3;
            
            // Ora scriviamo il risultato
            fs.writeFile('output.txt', combined, function(err) {
                // ┌─ Livello di nesting: 4
                // │  Indent: 16 spazi (!)
                
                if (err) {                        // Gestione errore 4/4
                    console.error('Errore scrittura:', err);
                    return;
                }
                
                // FINALMENTE! Dopo 4 livelli di nesting
                console.log('File scritto con successo!');
                
                // └─ Questo codice è a 20 spazi di indent!
            });
        });
    });
});

// ══════════════════════════════════════════════════════════════════════════════
//  PROBLEMI DI QUESTO CODICE:
// ══════════════════════════════════════════════════════════════════════════════

// 1. PIRAMIDE DEL DESTINO 🔺
//    - Il codice forma una piramide che si espande a destra
//    - Difficile leggere su schermi/editor standard
//    - Impossibile capire il flusso senza scrolling orizzontale

// 2. GESTIONE ERRORI RIPETITIVA ❌❌❌❌
//    - Stesso pattern if(err) ripetuto 4 volte
//    - Nessuna centralizzazione della gestione errori
//    - Facile dimenticare un controllo errore

// 3. SCOPE LIMITATO 📦
//    - data1 è accessibile in tutti i livelli sotto
//    - data2 è accessibile solo da livello 2 in giù
//    - data3 è accessibile solo da livello 3 in giù
//    - Variabili "intrappolate" nei loro scope

// 4. DIFFICILE TESTARE 🧪
//    - Impossibile testare singoli step in isolamento
//    - Nessuna separazione delle responsabilità
//    - Tutto in un unico blocco monolitico

// 5. DIFFICILE MANTENERE 🔧
//    - Aggiungere nuovo file? Altro livello di nesting!
//    - Modificare ordine? Rifattorizzazione massiccia
//    - Bug? Buona fortuna a trovarlo


// ══════════════════════════════════════════════════════════════════════════════
//  VISUALIZZAZIONE: Questo è il "Callback Hell" o "Pyramid of Doom"
// ══════════════════════════════════════════════════════════════════════════════
//
//  Il codice si sposta sempre più a destra ➡️➡️➡️➡️
//
//  callback(function() {
//      callback(function() {
//          callback(function() {
//              callback(function() {
//                  callback(function() {
//                      // 💀 Sei intrappolato!
//                  });
//              });
//          });
//      });
//  });
//
// ══════════════════════════════════════════════════════════════════════════════


// Output se tutto va bene:
// File scritto con successo!

// Output se c'è un errore in file2.txt:
// Errore file2: ENOENT: no such file or directory, open 'file2.txt'
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

Questo metodo risolve il problema del "callback hell" definendo funzioni nominate separate per ogni passaggio dell'operazione asincrona. Invece di annidare callback anonimi, ogni funzione gestisce una singola lettura di file o scrittura, passando i dati alla funzione successiva. Questo migliora la leggibilità, riduce l'indentazione eccessiva e facilita il debugging, poiché ogni funzione ha un nome chiaro e può essere riutilizzata o testata indipendentemente. Ad esempio, nel primo snippet, `leggiFile1` inizia la catena, mentre nel secondo, `leggiPosts` elabora i dati dell'utente prima di passare a `leggiCommenti`. È ideale per flussi sequenziali di operazioni I/O in Node.js.

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

La modularizzazione è una tecnica che consiste nel dividere il codice in moduli indipendenti e riutilizzabili, migliorando la leggibilità, la manutenzione e la scalabilità. Negli esempi forniti, le funzioni per operazioni sui file (lettura, scrittura, concatenazione) o sui JSON sono incapsulate in moduli separati (come file-utils.js o fileUtils.js), esportati con module.exports e importati in main.js. Questo evita la ripetizione del codice, facilita il testing e permette di gestire errori in modo centralizzato attraverso callback asincroni. Ad esempio, concatenaFile gestisce iterativamente la lettura di più file senza annidare troppi callback, rendendo il flusso più lineare e meno soggetto a errori.

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

### **Teoria: Pattern di Controllo di Flusso**

Quando lavori con operazioni asincrone, spesso hai bisogno di controllare **come** e **quando** le operazioni vengono eseguite. I pattern di controllo di flusso sono tecniche consolidate per gestire sequenze complesse di operazioni asincrone.

**I 5 Pattern Fondamentali:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. MULTIPLE PARAMETERS  : Callback riceve più di 2 parametri            │
│ 2. ONCE                 : Garantisce esecuzione callback una sola volta  │
│ 3. PARALLEL             : Esegue operazioni in parallelo                 │
│ 4. SERIES               : Esegue operazioni in sequenza                  │
│ 5. WATERFALL            : Passa risultati da un'operazione alla successiva│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Quando usare ciascun pattern:**
- **Multiple Parameters**: Quando hai bisogno di restituire dati + metadata
- **Once**: Quando vuoi prevenire bug da callback chiamate multiple volte  
- **Parallel**: Quando operazioni sono indipendenti e vuoi velocità
- **Series**: Quando operazioni devono essere in ordine sequenziale
- **Waterfall**: Quando output di un'operazione è input della successiva

### Pattern 1: Callback con Parametri Multipli

**Teoria:** La convenzione error-first permette di passare più parametri dopo l'errore. Questo è utile quando vuoi restituire non solo il risultato, ma anche informazioni aggiuntive (metadata, statistics, etc.).

```javascript
function operazioneComplessa(input, callback) {
    // Simula operazione asincrona complessa
    setTimeout(() => {
        // Calcola risultato principale
        const risultato = input * 2;
        
        // Prepara metadata aggiuntivi
        const metadata = {
            timestamp: Date.now(),      // Quando è stata completata
            operazione: 'moltiplicazione',  // Tipo di operazione
            inputOriginale: input       // Input per debugging
        };
        
        // ══════════════════════════════════════════════════════════════════
        // Callback con RISULTATI MULTIPLI
        // ══════════════════════════════════════════════════════════════════
        // Firma: callback(err, param1, param2, param3, ...)
        //                  ↑      ↑       ↑
        //                  |      |       └─ Metadata (opzionale)
        //                  |      └───────── Risultato principale
        //                  └──────────────── Errore (null se OK)
        
        callback(null, risultato, metadata);
        
    }, 1000);  // Simula delay di 1 secondo
}

// ══════════════════════════════════════════════════════════════════════════════
//  UTILIZZO: Ricezione parametri multipli
// ══════════════════════════════════════════════════════════════════════════════

operazioneComplessa(5, function(err, risultato, metadata) {
    // Ricevi 3 parametri: errore, risultato, metadata
    
    if (err) {
        console.error('Errore:', err);
        return;
    }
    
    // Usa risultato principale
    console.log('Risultato:', risultato);           // 10
    
    // Usa metadata per logging/debugging
    console.log('Metadata:', metadata);
    // {
    //   timestamp: 1701388800000,
    //   operazione: 'moltiplicazione',
    //   inputOriginale: 5
    // }
    
    // Esempi di uso metadata:
    console.log(`Operazione completata alle: ${new Date(metadata.timestamp)}`);
    console.log(`Tipo operazione: ${metadata.operazione}`);
});

// ══════════════════════════════════════════════════════════════════════════════
//  CASI D'USO REALI:
// ══════════════════════════════════════════════════════════════════════════════
// 1. Database query con statistiche:
//    callback(null, rows, { rowCount, executionTime })
//
// 2. File read con stats:
//    callback(null, data, { size, mtime, encoding })
//
// 3. HTTP request con headers:
//    callback(null, body, { statusCode, headers, responseTime })
```

### Pattern 2: Callback Once (Esegui Una Sola Volta)

**Teoria:** Uno dei bug più insidiosi con i callback è l'invocazione multipla. Questo può succedere quando:
- Hai più branch condizionali che chiamano callback
- Eventi vengono emessi più volte
- Logica di retry chiama callback dopo ogni tentativo

Il pattern **once** garantisce che il callback venga eseguito **una sola volta**, anche se viene invocato multiple volte.

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  PROBLEMA: Callback invocato multiple volte
// ══════════════════════════════════════════════════════════════════════════════

function operazioneRischiosa(callback) {
    // Scenario: Hai logica complessa che potrebbe chiamare callback
    // più volte per errore
    
    // ─────────────────────────────────────────────────────────────────────────
    // SOLUZIONE: Flag di guardia
    // ─────────────────────────────────────────────────────────────────────────
    let callbackInvocato = false;  // Flag: false = non ancora chiamato
    
    // Wrapper che garantisce esecuzione singola
    function callbackOnce(err, result) {
        // Controlla se già invocato
        if (callbackInvocato) {
            // GIÀ INVOCATO! Non fare nulla (o logga warning)
            console.warn('⚠️ Tentativo di invocare callback più volte!');
            console.warn('   Primo valore:', result);
            console.warn('   Questo evita bug subdoli!');
            return;  // IMPORTANTE: esci senza chiamare callback
        }
        
        // Prima invocazione: segna come chiamato e esegui
        callbackInvocato = true;
        callback(err, result);  // Chiamata sicura
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Simula situazione dove callback potrebbe essere chiamato 2 volte
    // ─────────────────────────────────────────────────────────────────────────
    setTimeout(() => callbackOnce(null, 'successo'), 1000);  // 1ª chiamata
    setTimeout(() => callbackOnce(null, 'altro'), 1500);     // 2ª chiamata (IGNORATA)
    
    // Casi reali dove questo succede:
    // - Eventi multipli (stream.on('data') chiamato più volte)
    // - Logica di retry buggata
    // - Branch condizionali che non sono mutualmente esclusivi
}


// ══════════════════════════════════════════════════════════════════════════════
//  UTILIZZO
// ══════════════════════════════════════════════════════════════════════════════

operazioneRischiosa(function(err, result) {
    // Questo callback verrà eseguito UNA SOLA VOLTA
    console.log('Callback eseguito:', result);
    
    // Se operazioneRischiosa prova a chiamarlo di nuovo,
    // viene bloccato dal pattern once
});

// ══════════════════════════════════════════════════════════════════════════════
//  OUTPUT (ordine temporale):
// ══════════════════════════════════════════════════════════════════════════════
// t=1000ms: Callback eseguito: successo
// t=1500ms: ⚠️ Tentativo di invocare callback più volte!
//           Primo valore: altro
//           Questo evita bug subdoli!


// ══════════════════════════════════════════════════════════════════════════════
//  UTILITY: Funzione riusabile per creare wrapper once
// ══════════════════════════════════════════════════════════════════════════════

function once(fn) {
    // Higher-order function: prende funzione, ritorna versione "once"
    let called = false;
    
    return function(...args) {
        if (called) return;  // Già chiamato: ignora
        called = true;
        return fn.apply(this, args);  // Prima chiamata: esegui
    };
}

// Uso:
const myCallback = once(function(result) {
    console.log('Eseguito:', result);
});

myCallback('primo');   // Output: Eseguito: primo
myCallback('secondo'); // Ignorato (nessun output)
myCallback('terzo');   // Ignorato (nessun output)
```

### Pattern 3: Parallel Execution (Esecuzione Parallela)

**Teoria:** Quando hai **operazioni indipendenti** che possono essere eseguite contemporaneamente, l'esecuzione parallela riduce drasticamente il tempo totale. Invece di attendere che ogni operazione finisca prima di iniziare la successiva, le avvii tutte insieme.

**Vantaggi:**
- ⚡ **Performance**: Tempo totale = max(t1, t2, t3) invece di t1+t2+t3
- 🚀 **Throughput**: Massimizza utilizzo risorse I/O
- 📊 **Efficienza**: Ideale per operazioni I/O-bound

**Quando usare:**
- Lettura multipli file indipendenti
- Multiple API requests
- Batch operations su database

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  IMPLEMENTAZIONE: Pattern Parallel Execution
// ══════════════════════════════════════════════════════════════════════════════

function executeParallel(tasks, callback) {
    // tasks: array di funzioni che accettano callback
    // callback: function(err, results) - chiamata quando TUTTE finiscono
    
    const results = [];       // Array per accumulare risultati
    let completed = 0;        // Contatore task completati
    let hasError = false;     // Flag per evitare callback multipli
    
    // ─────────────────────────────────────────────────────────────────────────
    // EDGE CASE: Array vuoto
    // ─────────────────────────────────────────────────────────────────────────
    if (tasks.length === 0) {
        callback(null, results);  // Ritorna immediatamente con array vuoto
        return;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // AVVIA TUTTE LE OPERAZIONI IN PARALLELO
    // ─────────────────────────────────────────────────────────────────────────
    tasks.forEach((task, index) => {
        // Ogni task viene eseguito IMMEDIATAMENTE (non aspetta gli altri)
        
        task(function(err, result) {
            // Callback invocata quando QUESTO task finisce
            
            // STEP 1: Controlla se già c'è stato un errore in un altro task
            if (hasError) return; // Ignora: callback già chiamata con errore
            
            // STEP 2: Gestisci errore
            if (err) {
                hasError = true;           // Segna che c'è stato errore
                callback(err);             // Chiama callback con errore
                return;                    // Non continuare
            }
            
            // STEP 3: Salva risultato nella posizione corretta
            results[index] = result;  // Mantiene ordine originale dei task!
            completed++;              // Incrementa contatore
            
            // STEP 4: Controlla se TUTTI i task sono completati
            if (completed === tasks.length) {
                // TUTTI finiti! Chiama callback con tutti i risultati
                callback(null, results);
            }
            // Altrimenti, aspetta che altri task finiscano
        });
    });
    
    // Nota: questa funzione ritorna IMMEDIATAMENTE
    // I task continuano in background
}


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO: Lettura multipli file in parallelo
// ══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');

// Definiamo 3 task indipendenti (lettura file)
const tasks = [
    (cb) => fs.readFile('file1.txt', 'utf8', cb),  // Task 1
    (cb) => fs.readFile('file2.txt', 'utf8', cb),  // Task 2
    (cb) => fs.readFile('file3.txt', 'utf8', cb)   // Task 3
];

console.log('Inizio lettura parallela...');
const startTime = Date.now();

executeParallel(tasks, function(err, results) {
    const elapsed = Date.now() - startTime;
    
    if (err) {
        console.error('Errore:', err.message);
        return;
    }
    
    console.log('Tutti i file letti in', elapsed, 'ms');
    console.log('Risultati:', results);
    // results[0] = contenuto file1.txt
    // results[1] = contenuto file2.txt
    // results[2] = contenuto file3.txt
});

// ══════════════════════════════════════════════════════════════════════════════
//  PERFORMANCE COMPARISON
// ══════════════════════════════════════════════════════════════════════════════
//
// Supponiamo ogni file richieda 100ms per essere letto:
//
// SEQUENZIALE (una dopo l'altra):
//   file1 (100ms) → file2 (100ms) → file3 (100ms)
//   TEMPO TOTALE: 300ms
//
// PARALLELO (tutte insieme):
//   file1 (100ms) ┐
//   file2 (100ms) ├─ Tutte eseguite contemporaneamente
//   file3 (100ms) ┘
//   TEMPO TOTALE: ~100ms (max dei tre)
//
// SPEED UP: 3X più veloce! 🚀
// ══════════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════════════════════
//  GESTIONE ERRORI: Fail-fast behavior
// ══════════════════════════════════════════════════════════════════════════════

const tasksWithError = [
    (cb) => setTimeout(() => cb(null, 'Task 1 OK'), 100),
    (cb) => setTimeout(() => cb(new Error('Task 2 failed!')), 50),  // Fallisce!
    (cb) => setTimeout(() => cb(null, 'Task 3 OK'), 200)
];

executeParallel(tasksWithError, function(err, results) {
    if (err) {
        console.error('Operazione fallita:', err.message);
        // Output: Operazione fallita: Task 2 failed!
        // 
        // Nota: Task 1 e 3 continuano in background ma i loro
        // risultati vengono ignorati (hasError flag)
        return;
    }
    console.log('Successo:', results);  // Non eseguito
});
```
```

### Pattern 4: Series Execution (Esecuzione Sequenziale)

**Teoria:** Quando le operazioni devono essere eseguite in **ordine specifico** o quando un'operazione dipende dal completamento della precedente, usi l'esecuzione sequenziale. Ogni task inizia SOLO quando il precedente è completato.

**Vantaggi:**
- 🎯 **Ordine garantito**: Task eseguiti esattamente nell'ordine specificato
- 🔒 **Controllo**: Un task alla volta, facile da ragionare
- 💾 **Memoria**: Non sovraccarica sistema con troppe operazioni simultanee

**Quando usare:**
- Operazioni che devono essere in ordine (es. migrations)
- Quando risorse sono limitate (evita troppi file aperti)
- Operazioni con side-effects che potrebbero interferire

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  IMPLEMENTAZIONE: Pattern Series Execution
// ══════════════════════════════════════════════════════════════════════════════

function executeSeries(tasks, callback) {
    // tasks: array di funzioni che accettano callback
    // callback: function(err, results) - chiamata quando TUTTE finiscono
    
    const results = [];  // Array per accumulare risultati
    let index = 0;       // Indice del task corrente
    
    // ─────────────────────────────────────────────────────────────────────────
    // FUNZIONE RICORSIVA: Esegue un task alla volta
    // ─────────────────────────────────────────────────────────────────────────
    function next() {
        // CASO BASE: Tutti i task completati
        if (index >= tasks.length) {
            callback(null, results);  // Successo! Ritorna tutti i risultati
            return;
        }
        
        // Prendi il task corrente
        const task = tasks[index];
        
        // Esegui task corrente
        task(function(err, result) {
            // Callback invocata quando QUESTO task finisce
            
            // STEP 1: Gestisci errore
            if (err) {
                callback(err);  // Stop! Non eseguire task successivi
                return;
            }
            
            // STEP 2: Salva risultato
            results.push(result);  // Aggiungi risultato all'array
            
            // STEP 3: Passa al prossimo task
            index++;       // Incrementa indice
            next();        // RICORSIONE: Esegue prossimo task
        });
        
        // Nota: questa funzione ritorna qui, ma il task continua in background
        // La ricorsione avviene nel callback, non in modo sincrono!
    }
    
    // Avvia l'esecuzione dal primo task
    next();
}


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO: Task eseguiti in SEQUENZA
// ══════════════════════════════════════════════════════════════════════════════

const tasks = [
    (cb) => {
        console.log('Task 1 inizia...');
        setTimeout(() => {
            console.log('Task 1 completo (1000ms)');
            cb(null, 'Task 1');
        }, 1000);
    },
    (cb) => {
        console.log('Task 2 inizia...');
        setTimeout(() => {
            console.log('Task 2 completo (500ms)');
            cb(null, 'Task 2');
        }, 500);
    },
    (cb) => {
        console.log('Task 3 inizia...');
        setTimeout(() => {
            console.log('Task 3 completo (200ms)');
            cb(null, 'Task 3');
        }, 200);
    }
];

console.log('Inizio esecuzione sequenziale...');
const startTime = Date.now();

executeSeries(tasks, function(err, results) {
    const elapsed = Date.now() - startTime;
    
    if (err) {
        console.error('Errore:', err);
        return;
    }
    
    console.log('Tasks completati in ordine:', results);
    // Output: ['Task 1', 'Task 2', 'Task 3']
    console.log('Tempo totale:', elapsed, 'ms');  // ~1700ms
});

// ══════════════════════════════════════════════════════════════════════════════
//  OUTPUT (ordine di esecuzione):
// ══════════════════════════════════════════════════════════════════════════════
// Inizio esecuzione sequenziale...
// Task 1 inizia...
// [dopo 1000ms] Task 1 completo (1000ms)
// Task 2 inizia...
// [dopo 500ms]  Task 2 completo (500ms)
// Task 3 inizia...
// [dopo 200ms]  Task 3 completo (200ms)
// Tasks completati in ordine: ['Task 1', 'Task 2', 'Task 3']
// Tempo totale: ~1700ms
//
// NOTA: Task 2 è più veloce di Task 1, ma ASPETTA che Task 1 finisca!
//       Questo garantisce ordine di esecuzione.
// ══════════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════════════════════
//  CONFRONTO: Series vs Parallel
// ══════════════════════════════════════════════════════════════════════════════
//
// SERIES (Sequential):
//   Task 1 (1000ms) ──→ Task 2 (500ms) ──→ Task 3 (200ms)
//   TEMPO TOTALE: 1000 + 500 + 200 = 1700ms
//   ORDINE: Garantito ✅
//   USO RISORSE: Basso (1 operazione alla volta)
//
// PARALLEL:
//   Task 1 (1000ms) ┐
//   Task 2 (500ms)  ├─ Tutte contemporaneamente
//   Task 3 (200ms)  ┘
//   TEMPO TOTALE: max(1000, 500, 200) = 1000ms
//   ORDINE: NON garantito ❌
//   USO RISORSE: Alto (3 operazioni simultanee)
//
// ══════════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════════════════════
//  CASO D'USO REALE: Database Migrations
// ══════════════════════════════════════════════════════════════════════════════

const migrations = [
    (cb) => {
        console.log('Migration 1: Create users table');
        // db.query('CREATE TABLE users...', cb);
        setTimeout(() => cb(null, 'users table created'), 100);
    },
    (cb) => {
        console.log('Migration 2: Add email column');
        // db.query('ALTER TABLE users ADD email...', cb);
        setTimeout(() => cb(null, 'email column added'), 100);
    },
    (cb) => {
        console.log('Migration 3: Create index on email');
        // db.query('CREATE INDEX...', cb);
        setTimeout(() => cb(null, 'index created'), 100);
    }
];

executeSeries(migrations, function(err, results) {
    if (err) {
        console.error('Migration failed:', err);
        // Rollback necessario!
        return;
    }
    console.log('All migrations completed successfully');
});

// Nota: Le migrations DEVONO essere sequenziali!
// Non puoi creare index prima di creare colonna.
```
```

### Pattern 5: Waterfall (Cascata)

**Teoria:** Il pattern Waterfall è un'evoluzione di Series dove ogni task **passa i suoi risultati al task successivo**. È come una catena di montaggio: ogni operazione elabora l'output della precedente.

**Caratteristiche:**
- 🔄 **Pipeline di dati**: Output di task[i] diventa input di task[i+1]
- 🎯 **Trasformazioni**: Ogni step trasforma/arricchisce i dati
- 🔗 **Dipendenze forti**: Ogni task dipende dal precedente

**Quando usare:**
- Processo multi-step dove ogni fase dipende dalla precedente
- Trasformazioni sequenziali di dati
- Workflow con accumulo progressivo di informazioni

```javascript
// ══════════════════════════════════════════════════════════════════════════════
//  IMPLEMENTAZIONE: Pattern Waterfall
// ══════════════════════════════════════════════════════════════════════════════

function waterfall(tasks, callback) {
    // tasks: array di funzioni
    //   - Prima funzione: (cb) => cb(err, result)
    //   - Funzioni successive: (prevResult, cb) => cb(err, result)
    // callback: function(err, finalResult)
    
    let index = 0;  // Indice del task corrente
    
    // ─────────────────────────────────────────────────────────────────────────
    // FUNZIONE RICORSIVA: Passa risultato al prossimo task
    // ─────────────────────────────────────────────────────────────────────────
    function next(prevResult) {
        // prevResult: risultato del task precedente (o undefined per il primo)
        
        // CASO BASE: Tutti i task completati
        if (index >= tasks.length) {
            callback(null, prevResult);  // Ritorna l'ultimo risultato
            return;
        }
        
        // Prendi il task corrente
        const task = tasks[index];
        index++;  // Incrementa per prossima iterazione
        
        // Crea callback per questo task
        const taskCallback = function(err, result) {
            // Questo callback sarà invocato quando il task finisce
            
            // STEP 1: Gestisci errore
            if (err) {
                callback(err);  // Stop! Propaga errore e termina waterfall
                return;
            }
            
            // STEP 2: Passa risultato al prossimo task
            next(result);  // RICORSIONE: result diventa prevResult del prossimo
        };
        
        // STEP 3: Esegui task
        if (index === 1) {
            // Primo task: non ha prevResult
            task(taskCallback);
        } else {
            // Task successivi: ricevono prevResult
            task(prevResult, taskCallback);
        }
    }
    
    // Avvia il waterfall
    next();
}


// ══════════════════════════════════════════════════════════════════════════════
//  ESEMPIO: Pipeline di trasformazione dati utente
// ══════════════════════════════════════════════════════════════════════════════

const tasks = [
    // TASK 1: Ottieni user ID da username
    function getUserId(callback) {
        console.log('Step 1: Cerca user ID per username "john"');
        // Simula query DB: SELECT id FROM users WHERE username='john'
        setTimeout(() => {
            const userId = 42;
            console.log('  → User ID trovato:', userId);
            callback(null, userId);  // Passa userId al prossimo task
        }, 100);
    },
    
    // TASK 2: Ottieni profilo utente usando user ID
    function getUserProfile(userId, callback) {
        console.log('Step 2: Carica profilo per user ID', userId);
        // Simula query DB: SELECT * FROM profiles WHERE user_id = ?
        setTimeout(() => {
            const profile = {
                userId: userId,
                name: 'John Doe',
                email: 'john@example.com'
            };
            console.log('  → Profilo caricato:', profile);
            callback(null, profile);  // Passa profile al prossimo task
        }, 100);
    },
    
    // TASK 3: Arricchisci profilo con ordini recenti
    function enrichWithOrders(profile, callback) {
        console.log('Step 3: Carica ordini per user ID', profile.userId);
        // Simula query DB: SELECT * FROM orders WHERE user_id = ? LIMIT 5
        setTimeout(() => {
            const enrichedProfile = {
                ...profile,  // Copia tutti i campi del profilo
                recentOrders: [
                    { id: 101, total: 59.99 },
                    { id: 102, total: 129.99 }
                ]
            };
            console.log('  → Profilo arricchito con ordini');
            callback(null, enrichedProfile);  // Passa profilo arricchito
        }, 100);
    },
    
    // TASK 4: Calcola statistiche
    function calculateStats(enrichedProfile, callback) {
        console.log('Step 4: Calcola statistiche');
        setTimeout(() => {
            const totalSpent = enrichedProfile.recentOrders
                .reduce((sum, order) => sum + order.total, 0);
            
            const finalData = {
                ...enrichedProfile,
                stats: {
                    totalOrders: enrichedProfile.recentOrders.length,
                    totalSpent: totalSpent
                }
            };
            console.log('  → Statistiche calcolate:', finalData.stats);
            callback(null, finalData);
        }, 100);
    }
];

console.log('Inizio waterfall...');

waterfall(tasks, function(err, finalResult) {
    if (err) {
        console.error('Waterfall failed:', err);
        return;
    }
    
    console.log('\nRisultato finale:');
    console.log(JSON.stringify(finalResult, null, 2));
    /*
    {
      "userId": 42,
      "name": "John Doe",
      "email": "john@example.com",
      "recentOrders": [
        { "id": 101, "total": 59.99 },
        { "id": 102, "total": 129.99 }
      ],
      "stats": {
        "totalOrders": 2,
        "totalSpent": 189.98
      }
    }
    */
});


// ══════════════════════════════════════════════════════════════════════════════
//  VISUALIZZAZIONE FLUSSO DATI
// ══════════════════════════════════════════════════════════════════════════════
//
//   "john" ────────┐
//                  │
//                  ↓
//       [ getUserId() ]
//                  │
//                  │ userId: 42
//                  ↓
//    [ getUserProfile(42) ]
//                  │
//                  │ { userId: 42, name: 'John', email: ... }
//                  ↓
//  [ enrichWithOrders(...) ]
//                  │
//                  │ { ..., recentOrders: [...] }
//                  ↓
//   [ calculateStats(...) ]
//                  │
//                  │ { ..., stats: {...} }
//                  ↓
//         FINAL RESULT
//
// Ogni funzione TRASFORMA l'input e passa al prossimo step
// ══════════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════════════════════
//  WATERFALL vs SERIES: Differenze chiave
// ══════════════════════════════════════════════════════════════════════════════
//
// SERIES:
//   - Task indipendenti
//   - Ogni task: task(callback)
//   - Risultati accumulati in array
//   - Callback finale: callback(err, [result1, result2, ...])
//
// WATERFALL:
//   - Task dipendenti (pipeline)
//   - Primo task: task(callback)
//   - Altri task: task(prevResult, callback)
//   - Risultato passa da uno all'altro
//   - Callback finale: callback(err, lastResult)
//
// Usa SERIES quando: task indipendenti, vuoi tutti i risultati
// Usa WATERFALL quando: ogni task dipende dal precedente, pipeline
// ══════════════════════════════════════════════════════════════════════════════
```

##  Conclusioni

### Quando Usare le Callback

Le callback sono uno strumento fondamentale in Node.js, ma è importante sapere quando sono la scelta giusta.

#### ✅ **Vantaggi delle Callback**

1. **Semplicità Concettuale**
   - Facili da capire per operazioni singole
   - Pattern "fai qualcosa, poi dimmi quando hai finito"
   - Non richiedono sintassi speciale o runtime support

2. **Performance**
   - Zero overhead: nessuna creazione di Promise objects
   - Ideali per operazioni ad alta frequenza (hot paths)
   - Perfette per event emitters (EventEmitter pattern)

3. **Controllo Fine**
   - Puoi decidere quando e quante volte invocare la callback
   - Flessibilità massima nella gestione del flusso
   - Utile per streaming e operazioni incrementali

4. **Compatibilità**
   - Supportate da tutte le versioni di Node.js
   - Core API di Node.js usa callback (fs, http, etc.)
   - Librerie legacy spesso usano solo callback


#### ❌ **Svantaggi delle Callback**

1. **Callback Hell** 🔥
   - Codice nested difficile da leggere
   - "Pyramid of Doom" con indentazione profonda
   - Manutenzione difficile con molte operazioni asincrone
   ```javascript
   // 👾 ANTI-PATTERN: Callback Hell
   getData(function(a) {
       getMoreData(a, function(b) {
           getMoreData(b, function(c) {
               getMoreData(c, function(d) {
                   getMoreData(d, function(e) {
                       // ... e continua ...
                   });
               });
           });
       });
   });
   ```

2. **Error Handling Complesso**
   - Devi gestire errori in OGNI callback
   - Facile dimenticare il check `if (err)`
   - Nessun modo automatico di propagare errori
   - Non puoi usare try/catch per operazioni async
   ```javascript
   // Devi ricordare SEMPRE di controllare errori
   fs.readFile('file.txt', function(err, data) {
       if (err) { /* gestisci */ }  // ⚠️ IMPERATIVO!
       // usa data
   });
   ```

3. **Problemi di Composizione**
   - Difficile combinare operazioni asincrone
   - Nessun supporto nativo per parallel/series/waterfall
   - Devi implementare pattern manualmente
   - Gestione complessa di multiple operazioni

4. **Inversion of Control**
   - Cedi controllo alla funzione che chiami
   - Non sai se callback sarà chiamata:
     * Una volta o più volte
     * Troppo presto o troppo tardi
     * Con parametri corretti
   - Devi fidarti dell'implementazione altrui


### 🎯 **Linee Guida per l'Uso**

```javascript
// ══════════════════════════════════════════════════════════════════════════════
// QUANDO USARE CALLBACK:
// ══════════════════════════════════════════════════════════════════════════════

// ✅ BUON USO: Operazione singola, semplice
fs.readFile('config.json', function(err, data) {
    if (err) return console.error(err);
    console.log(data);
});

// ✅ BUON USO: Event handlers
server.on('request', function(req, res) {
    // Gestisci richiesta
});

// ✅ BUON USO: Librerie che richiedono callback
app.get('/users', function(req, res) {
    // Express route handler
});

// ❌ EVITA: Multiple operazioni nidificate
// Usa invece Promises o async/await
getUser(id, function(err, user) {
    if (err) return handleError(err);
    getPosts(user.id, function(err, posts) {  // 👾 Callback Hell!
        if (err) return handleError(err);
        getComments(posts[0].id, function(err, comments) {  // 👾 Peggio!
            // ...
        });
    });
});

// ✅ MEGLIO: Usa Promises
getUser(id)
    .then(user => getPosts(user.id))
    .then(posts => getComments(posts[0].id))
    .catch(handleError);

// ✅ ANCORA MEGLIO: Usa async/await
try {
    const user = await getUser(id);
    const posts = await getPosts(user.id);
    const comments = await getComments(posts[0].id);
} catch (err) {
    handleError(err);
}
```


### 📚 **Best Practices**

#### 1. **Usa Error-First Convention**
```javascript
// ✅ SEMPRE primo parametro è errore
function myAsyncOp(callback) {
    doSomething(function(err, result) {
        if (err) return callback(err);  // Propaga errore
        callback(null, result);          // Null = nessun errore
    });
}
```

#### 2. **Return Dopo Callback**
```javascript
// ❌ SBAGLIATO: Codice continua dopo callback
if (err) {
    callback(err);
    // ⚠️ Codice qui viene ANCORA eseguito!
}

// ✅ CORRETTO: Return per fermare esecuzione
if (err) {
    return callback(err);  // Stop!
}
```

#### 3. **Evita Nested Callbacks**
```javascript
// ❌ SBAGLIATO: Nidificazione profonda
fs.readFile('a', function(err, a) {
    fs.readFile('b', function(err, b) {
        fs.readFile('c', function(err, c) {
            // Troppo nested!
        });
    });
});

// ✅ CORRETTO: Funzioni separate
function readA(callback) {
    fs.readFile('a', callback);
}

function readB(callback) {
    fs.readFile('b', callback);
}

function readC(callback) {
    fs.readFile('c', callback);
}

// Poi componi con pattern (parallel, series, etc.)
```

#### 4. **Gestisci Sempre gli Errori**
```javascript
// ❌ SBAGLIATO: Ignora errori
myAsyncOp(function(err, result) {
    console.log(result);  // ⚠️ E se err è definito?
});

// ✅ CORRETTO: Check esplicito
myAsyncOp(function(err, result) {
    if (err) {
        console.error('Errore:', err);
        return;
    }
    console.log(result);
});
```

#### 5. **Callback Solo Una Volta**
```javascript
// ❌ SBAGLIATO: Possibili multiple invocazioni
function badAsync(callback) {
    doSomething(function(err, data) {
        callback(err, data);  // Prima chiamata
    });
    callback(null, 'default');  // ⚠️ Seconda chiamata!
}

// ✅ CORRETTO: Usa pattern "once"
function goodAsync(callback) {
    const safeCallback = once(callback);
    
    doSomething(function(err, data) {
        safeCallback(err, data);
    });
}
```


### 🚀 **Evoluzione: Dalle Callback alle Promises e Async/Await**

Le callback sono state il primo approccio all'asincronia in JavaScript, ma il linguaggio si è evoluto:

```javascript
// 🕹️ CALLBACK STYLE (Node.js iniziale - 2009)
fs.readFile('file.txt', function(err, data) {
    if (err) throw err;
    console.log(data);
});

// 🌐 PROMISE STYLE (ES6 - 2015)
const fsPromises = require('fs').promises;
fsPromises.readFile('file.txt')
    .then(data => console.log(data))
    .catch(err => console.error(err));

// ✨ ASYNC/AWAIT STYLE (ES2017)
async function readFile() {
    try {
        const data = await fsPromises.readFile('file.txt');
        console.log(data);
    } catch (err) {
        console.error(err);
    }
}
```

**Raccomandazione moderna:**
- 🎯 **Per nuovo codice**: Usa `async/await`
- 🔄 **Per librerie esistenti**: Usa `util.promisify()` per convertire callback in promises
- 📚 **Per imparare**: Capire le callback è fondamentale per comprendere l'asincronia

```javascript
// Converti callback API in Promise API
const util = require('util');
const fs = require('fs');

// Trasforma fs.readFile (callback) in versione Promise
const readFilePromise = util.promisify(fs.readFile);

// Ora puoi usare con async/await!
async function example() {
    const data = await readFilePromise('file.txt', 'utf8');
    console.log(data);
}
```


### 🎯 **Riepilogo Decisionale**

| Scenario | Usa Callback? | Alternativa |
|----------|---------------|-------------|
| Singola operazione async | ✅ Sì | Promise |
| Multiple operazioni sequenziali | ❌ No | async/await |
| Multiple operazioni parallele | ❌ No | Promise.all() |
| Event handling | ✅ Sì | EventEmitter |
| Streaming data | ✅ Sì | Streams |
| Library API già usa callback | ✅ Sì | util.promisify |
| Codice nuovo da zero | ❌ No | async/await |
| High-frequency operations | ✅ Sì | Callback (performance) |

---

**Conclusione finale**: Le callback sono uno strumento essenziale da comprendere in Node.js, ma per codice moderno preferisci Promises e async/await che offrono miglior leggibilità, gestione errori più semplice e composizione più elegante. Tuttavia, sapere come funzionano le callback ti permette di:
- Capire la core API di Node.js
- Lavorare con librerie legacy
- Implementare ottimizzazioni di performance
- Comprendere meglio l'event loop e l'architettura asincrona

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

## Navigazione

- [← Precedente: Libuv: Il Motore Asincrono di Node.js](<AF - libuv.md>)
- [↑ Indice dell’esercitazione](README.md)
- [Successiva: Promises in Node.js →](<BB - Promises.md>)
