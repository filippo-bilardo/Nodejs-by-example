# L'Event Loop di Node.js: come funziona la programmazione asincrona

Node.js è un ambiente di esecuzione JavaScript che permette di sviluppare applicazioni lato server, API REST, servizi di rete e applicazioni in tempo reale.

Una delle caratteristiche fondamentali di Node.js è la capacità di gestire numerose operazioni concorrenti senza creare necessariamente un thread JavaScript per ogni richiesta. Questo comportamento è reso possibile da un'architettura basata sugli eventi, dalla gestione asincrona delle operazioni di I/O e da un meccanismo chiamato Event Loop.

Comprendere il funzionamento dell'Event Loop è essenziale per sviluppare applicazioni Node.js efficienti, evitare blocchi del server e prevedere l'ordine di esecuzione delle operazioni asincrone.

In questo articolo analizzeremo il funzionamento dell'Event Loop, le sue fasi, il ruolo delle callback e delle Promise e le differenze tra `setTimeout()`, `setImmediate()` e `process.nextTick()`, attraverso esempi pratici di codice JavaScript.


## 1. Dal modello sincrono alla programmazione asincrona

Per comprendere l'Event Loop, partiamo da una caratteristica fondamentale di JavaScript: l'esecuzione del codice avviene normalmente in maniera sequenziale, attraverso un meccanismo chiamato Call Stack.

Consideriamo il seguente esempio:

JavaScript

```
console.log("Operazione 1");

console.log("Operazione 2");

console.log("Operazione 3");
```

L'output sarà:

```
Operazione 1
Operazione 2
Operazione 3
```

Le istruzioni vengono eseguite nell'ordine in cui compaiono nel programma.

Supponiamo ora di dover leggere un file, effettuare una richiesta HTTP oppure interrogare un database.

Se ciascuna di queste operazioni bloccasse il thread JavaScript fino al suo completamento, il server non potrebbe continuare a elaborare altre richieste durante l'attesa.

Node.js affronta questo problema attraverso le API asincrone: quando viene avviata un'operazione di I/O, il programma può proseguire senza attendere che l'operazione termini.

### Un primo esempio con setTimeout()

JavaScript

```
console.log("Inizio");

setTimeout(() => {
    console.log("Operazione asincrona");
}, 2000);

console.log("Fine");
```

L'output sarà:

```
Inizio
Fine
Operazione asincrona
```

La funzione passata a `setTimeout()` viene chiamata callback: è una funzione che verrà eseguita successivamente.

Quando Node.js incontra `setTimeout()`, registra un timer associato alla callback, ma non interrompe l'esecuzione del programma.

Di conseguenza, viene immediatamente eseguita l'istruzione:

JavaScript

```
console.log("Fine");
```

Soltanto quando il timer sarà scaduto e l'Event Loop potrà elaborare la callback, verrà visualizzato il messaggio `Operazione asincrona`.

Questo semplice esempio dimostra che l'ordine di esecuzione delle istruzioni asincrone non coincide necessariamente con il loro ordine di apparizione nel codice.

È importante precisare che il timer indica un tempo minimo di attesa, non l'istante esatto di esecuzione: una callback potrebbe essere eseguita più tardi qualora il thread JavaScript fosse occupato.

![](https://www.google.com/s2/favicons?domain=https://nodejs.org\&sz=32)

Node.js v26.10.0 Documentation

+1

## 2. Che cos'è l'Event Loop?

L'Event Loop è il meccanismo che permette a Node.js di coordinare l'esecuzione del codice JavaScript con le operazioni asincrone.

Il suo compito principale consiste nel verificare quali operazioni sono pronte per essere elaborate e avviare le relative callback quando il thread JavaScript è disponibile.

Per svolgere questo lavoro, Node.js utilizza diversi componenti:

Motore JavaScript V8

Esegue il codice JavaScript, gestisce la memoria, il Call Stack e le operazioni previste dal linguaggio.

Event Loop

Coordina l'esecuzione delle callback associate agli eventi, ai timer e alle operazioni asincrone completate.

libuv

È la libreria che implementa l'Event Loop e fornisce funzionalità per la gestione asincrona di operazioni come l'I/O, i timer e l'utilizzo di un pool di thread.

Sistema operativo e Worker Pool

Gestiscono le operazioni delegate da Node.js. A seconda del tipo di attività, vengono utilizzate funzionalità asincrone del sistema operativo oppure thread di lavoro.

Node.js utilizza normalmente un singolo thread principale per l'esecuzione delle callback JavaScript, ma questo non significa che l'intero ambiente sia composto da un unico thread.

Per esempio, alcune operazioni sul file system, alcune funzioni crittografiche e determinate operazioni DNS possono essere eseguite attraverso il Worker Pool di libuv.

Le operazioni di rete, invece, sfruttano generalmente i meccanismi di I/O asincrono del sistema operativo, senza richiedere un thread dedicato a ogni connessione.

![](https://www.google.com/s2/favicons?domain=https://nodejs.org\&sz=32)

Node.js Learn

+1

### Come funziona il ciclo di esecuzione

Possiamo rappresentare il comportamento dell'Event Loop attraverso il seguente schema semplificato:

1. Esecuzione del codice JavaScript

Il programma avvia un'operazione asincrona.

2. Delega dell'operazione

Node.js utilizza le API di sistema o il Worker Pool.

3. Prosecuzione del programma

Il thread JavaScript può eseguire altre istruzioni e callback.

4. Completamento dell'operazione

Il risultato diventa disponibile per l'elaborazione.

5. Esecuzione della callback

L'Event Loop raggiunge la fase appropriata ed esegue la callback quando possibile.

Il ciclo continua finché ci sono attività che mantengono attivo il processo.

Questa architettura permette a Node.js di gestire molte operazioni di I/O concorrenti senza dover attendere il completamento di ciascuna prima di iniziare la successiva.

## 3. Call Stack e code delle callback

Per capire come Node.js decide quale codice eseguire, dobbiamo distinguere il Call Stack dalle code utilizzate per programmare le callback.

### Il Call Stack

Il Call Stack, o pila delle chiamate, è la struttura dati utilizzata dal motore JavaScript per tenere traccia delle funzioni in esecuzione.

Funziona secondo il principio LIFO (Last In, First Out): l'ultima funzione inserita nella pila è la prima a terminarne l'esecuzione.

Consideriamo il seguente codice:

JavaScript

```
function funzioneA() {
    console.log("Inizio A");

    funzioneB();

    console.log("Fine A");
}

function funzioneB() {
    console.log("Esecuzione B");
}

funzioneA();
```

Quando viene chiamata `funzioneA()`, questa viene inserita nel Call Stack. Successivamente, `funzioneA()` richiama `funzioneB()`, che viene aggiunta sopra di essa.

Quando `funzioneB()` termina, viene rimossa dalla pila e il controllo ritorna a `funzioneA()`.

L'output sarà:

```
Inizio A
Esecuzione B
Fine A
```

Il codice JavaScript che sta eseguendo una funzione non viene normalmente interrotto dall'Event Loop per eseguire una callback differente.

### Le code delle callback

Le operazioni asincrone utilizzano meccanismi di accodamento per programmare l'esecuzione delle funzioni associate.

Non esiste, però, un'unica coda che contiene indistintamente tutte le callback.

L'Event Loop è organizzato in diverse fasi, ciascuna con specifiche responsabilità e proprie code di callback. Esistono inoltre meccanismi dedicati alle microtask e alle funzioni programmate tramite `process.nextTick()`.

La disponibilità di una callback non implica che questa venga eseguita immediatamente: deve essere raggiunto il momento appropriato e il thread JavaScript deve poterla eseguire.

## 4. Le fasi dell'Event Loop

L'Event Loop di Node.js attraversa una sequenza di fasi, ognuna dedicata alla gestione di particolari categorie di eventi.

Le principali fasi previste dall'implementazione basata su libuv sono illustrate di seguito.

Timers

Callback di `setTimeout()` e `setInterval()`

Pending callbacks

Callback di particolari operazioni di I/O rinviate

Idle / Prepare

Operazioni interne di libuv

Poll

Acquisizione degli eventi di I/O ed esecuzione delle relative callback

Check

Callback programmate con `setImmediate()`

Close callbacks

Gestione di determinati eventi di chiusura

Schema concettuale delle fasi dell'Event Loop. Le code nextTick e microtask sono gestite separatamente.

Analizziamo le singole fasi.

### 4.1 Timers

La fase Timers gestisce le callback associate ai timer che hanno raggiunto la propria scadenza.

Le funzioni più comuni sono:

* `setTimeout()`: programma l'esecuzione di una callback dopo un intervallo minimo di tempo.

* `setInterval()`: programma esecuzioni ripetute di una callback a intervalli specificati.

Esempio:

JavaScript

```
setTimeout(() => {
    console.log("Timer scaduto");
}, 1000);
```

La callback potrà essere eseguita dopo almeno un secondo, ma il momento effettivo dipenderà anche dalle altre operazioni in corso.

### 4.2 Pending callbacks

Questa fase esegue alcune callback di operazioni di I/O rinviate a una successiva iterazione dell'Event Loop.

Può comprendere, per esempio, callback relative a particolari errori delle connessioni TCP.

### 4.3 Idle e Prepare

Sono fasi utilizzate internamente da libuv per preparare e coordinare il funzionamento dell'Event Loop.

Normalmente, lo sviluppatore Node.js non interagisce direttamente con queste fasi.

### 4.4 Poll

La fase Poll è particolarmente importante perché si occupa di acquisire nuovi eventi di I/O e di eseguire molte delle relative callback.

Per esempio, quando termina un'operazione asincrona di lettura di un file, la relativa callback può essere elaborata durante questa fase.

JavaScript

```
const fs = require("node:fs");

fs.readFile("dati.txt", "utf8", (errore, dati) => {
    if (errore) {
        console.error(errore);
        return;
    }

    console.log(dati);
});
```

Mentre la lettura del file è in corso, il thread principale può proseguire con altre attività.

Quando il risultato è disponibile, l'Event Loop potrà eseguire la callback passando i dati letti oppure un eventuale errore.

Quando non ci sono callback da elaborare, la fase Poll può anche attendere nuovi eventi, evitando di impegnare inutilmente la CPU.

### 4.5 Check

La fase Check esegue le callback programmate attraverso `setImmediate()`.

JavaScript

```
setImmediate(() => {
    console.log("Esecuzione nella fase Check");
});
```

`setImmediate()` è particolarmente utile quando vogliamo programmare una callback da eseguire dopo la fase Poll, consentendo prima all'Event Loop di elaborare gli eventi di I/O.

### 4.6 Close callbacks

Questa fase gestisce alcuni eventi di chiusura delle risorse, come quelli generati dalla chiusura di determinate connessioni di rete.

Per esempio:

JavaScript

```
socket.on("close", () => {
    console.log("Connessione chiusa");
});
```

A seconda di come viene chiusa la risorsa, l'evento di chiusura può anche essere notificato attraverso un meccanismo diverso da questa fase.

### Una precisazione sulle versioni moderne di Node.js

A partire da Node.js 20, con libuv 1.45.0, è cambiata la collocazione dell'elaborazione dei timer rispetto alla fase Poll.

In precedenza, i timer venivano elaborati sia prima sia dopo Poll. Nell'implementazione successiva, l'elaborazione ordinaria dei timer avviene dopo Poll, pur rimanendo alcuni comportamenti di inizializzazione per compatibilità.

Questa differenza può modificare l'ordine relativo di alcune callback programmate con `setTimeout()` e `setImmediate()`.

Lo schema delle fasi deve quindi essere considerato una rappresentazione concettuale, non una garanzia assoluta sull'ordine di esecuzione di tutte le callback.

![](https://www.google.com/s2/favicons?domain=https://nodejs.org\&sz=32)

Node.js Learn

+1


## 5. Microtask e priorità di esecuzione

Oltre alle fasi dell'Event Loop, Node.js utilizza meccanismi specifici per eseguire alcune callback con una priorità diversa rispetto ai timer e alle normali operazioni di I/O.

In particolare, dobbiamo distinguere:

* La coda delle callback programmate attraverso `process.nextTick()`.

* La coda delle microtask, utilizzata dalle Promise e da `queueMicrotask()`.

* Le code delle callback associate alle diverse fasi dell'Event Loop.

### 5.1 process.nextTick()

La funzione `process.nextTick()` permette di programmare una callback da eseguire dopo il completamento dell'operazione JavaScript corrente, prima che l'Event Loop prosegua con altre fasi.

Consideriamo il seguente esempio:

JavaScript

```
console.log("Inizio");

process.nextTick(() => {
    console.log("Next Tick");
});

console.log("Fine");
```

Output:

```
Inizio
Fine
Next Tick
```

La callback viene eseguita dopo il completamento del codice sincrono.

È importante osservare che `process.nextTick()` non rappresenta una fase dell'Event Loop: utilizza un meccanismo di accodamento separato.

### 5.2 Promise e queueMicrotask()

Le callback associate alle Promise risolte vengono programmate attraverso la coda delle microtask.

Anche la funzione `queueMicrotask()` permette di aggiungere una funzione a questa coda.

JavaScript

```
console.log("Inizio");

Promise.resolve().then(() => {
    console.log("Promise");
});

queueMicrotask(() => {
    console.log("Microtask");
});

console.log("Fine");
```

Output:

```
Inizio
Fine
Promise
Microtask
```

Le callback delle microtask vengono eseguite dopo il codice sincrono, ma prima che l'Event Loop possa procedere normalmente con le callback dei timer.

Nell'esempio, la callback della Promise precede quella di `queueMicrotask()` perché è stata accodata per prima.

### 5.3 Un esempio completo sulle priorità

Consideriamo ora un programma che utilizza contemporaneamente codice sincrono, timer, Promise e `process.nextTick()`.

Salviamo il seguente codice nel file `priorita.cjs`:

JavaScript

```
console.log("1 - Inizio");

setTimeout(() => {
    console.log("5 - setTimeout");
}, 0);

Promise.resolve().then(() => {
    console.log("4 - Promise");
});

process.nextTick(() => {
    console.log("3 - nextTick");
});

console.log("2 - Fine");
```

L'output sarà:

```
1 - Inizio
2 - Fine
3 - nextTick
4 - Promise
5 - setTimeout
```

Analizziamo l'ordine di esecuzione.

|
Operazione

|

Motivazione

|
| --- | --- |
|

Inizio e Fine

|

Il codice sincrono viene eseguito per primo.

|
|

nextTick

|

Viene elaborata la coda delle callback `nextTick`.

|
|

Promise

|

Viene eseguita la microtask associata alla Promise risolta.

|
|

setTimeout

|

La callback viene eseguita successivamente, quando il timer è pronto.

|

Questo esempio permette di comprendere una caratteristica importante: le callback asincrone non vengono eseguite semplicemente nell'ordine in cui sono state registrate.

Il comportamento dipende anche dal meccanismo utilizzato per programmarle.

Attenzione alla differenza tra CommonJS ed ES Modules. L'esempio precedente utilizza un modulo CommonJS, identificato dall'estensione `.cjs`. Nel contesto iniziale di un modulo ES (`.mjs`), le callback delle Promise e di `queueMicrotask()` possono precedere quelle di `process.nextTick()`, perché il modulo viene già elaborato nel contesto delle microtask.

Inoltre, la documentazione moderna di Node.js classifica `process.nextTick()` come API legacy e, per la maggior parte dei nuovi utilizzi, consiglia `queueMicrotask()`. Quest'ultima offre anche una maggiore portabilità tra Node.js e gli ambienti JavaScript dei browser.

![](https://www.google.com/s2/favicons?domain=https://nodejs.org\&sz=32)

Node.js v26.10.0 Documentation

+1

## 6. setTimeout() e setImmediate(): quali sono le differenze?

Le funzioni `setTimeout()` e `setImmediate()` permettono entrambe di programmare l'esecuzione futura di una callback, ma utilizzano meccanismi differenti.

|
Funzione

|

Comportamento

|
| --- | --- |
|

`setTimeout(callback, delay)`

|

Programma una callback dopo un intervallo minimo di tempo.

|
|

`setImmediate(callback)`

|

Programma una callback nella fase Check dell'Event Loop.

|

Una domanda frequente riguarda l'ordine di esecuzione delle due funzioni quando il timeout è impostato a zero.

Consideriamo il seguente esempio:

JavaScript

```
setTimeout(() => {
    console.log("setTimeout");
}, 0);

setImmediate(() => {
    console.log("setImmediate");
});
```

Quale messaggio verrà visualizzato per primo?

Non esiste un ordine garantito in questo contesto. Il comportamento può dipendere dai tempi di esecuzione e dallo stato dell'Event Loop.

Se invece programmiamo le due callback all'interno di una callback di I/O, possiamo osservare un comportamento più prevedibile.

JavaScript

```
const fs = require("node:fs");

fs.readFile(__filename, () => {

    setTimeout(() => {
        console.log("setTimeout");
    }, 0);

    setImmediate(() => {
        console.log("setImmediate");
    });

});
```

Output:

```
setImmediate
setTimeout
```

La callback di lettura del file viene eseguita nella fase Poll. Da questa fase, l'Event Loop può passare alla fase Check ed eseguire la callback di `setImmediate()` prima di quella del timer appena programmato.

Questo è un esempio utile per osservare concretamente come le fasi dell'Event Loop influenzino l'ordine di esecuzione delle callback.

![](https://www.google.com/s2/favicons?domain=https://nodejs.org\&sz=32)

Node.js Learn

+1

## 7. Un esempio reale: lettura asincrona di un file

Finora abbiamo utilizzato principalmente timer per spiegare il comportamento dell'Event Loop.

Vediamo ora un esempio più vicino a una reale applicazione Node.js.

Supponiamo di voler leggere il contenuto di un file senza bloccare il programma.

Creiamo un file chiamato `dati.txt` contenente il seguente testo:

```
Benvenuti nel mondo di Node.js!
```

Successivamente, creiamo il file `lettura.cjs`:

JavaScript

```
const fs = require("node:fs");

console.log("1 - Inizio programma");

fs.readFile("dati.txt", "utf8", (errore, dati) => {

    if (errore) {
        console.error("Errore:", errore.message);
        return;
    }

    console.log("3 - File letto:");
    console.log(dati);

});

console.log("2 - Fine programma");
```

Eseguiamo il programma:

Bash

```
node lettura.cjs
```

L'output sarà:

```
1 - Inizio programma
2 - Fine programma
3 - File letto:
Benvenuti nel mondo di Node.js!
```

La lettura asincrona del file viene avviata attraverso il modulo `fs`.

Node.js delega l'operazione al sistema sottostante, utilizzando il Worker Pool di libuv per le operazioni asincrone sul file system.

Nel frattempo, il thread principale continua a eseguire il programma e visualizza il messaggio `2 - Fine programma`.

Quando la lettura termina, il risultato viene reso disponibile e la callback potrà essere eseguita dall'Event Loop.

Questo comportamento è particolarmente utile nelle applicazioni server, dove il programma può continuare a elaborare altre richieste mentre attende il completamento delle operazioni di I/O.

## 8. async e await: rendono il codice sincrono?

JavaScript mette a disposizione le parole chiave `async` e `await`, che consentono di scrivere codice asincrono utilizzando una sintassi simile a quella della programmazione sequenziale.

Consideriamo il seguente esempio:

JavaScript

```
const fs = require("node:fs/promises");

async function leggiFile() {

    console.log("1 - Inizio lettura");

    const dati = await fs.readFile(
        "dati.txt",
        "utf8"
    );

    console.log("3 - Lettura completata");
    console.log(dati);

}

leggiFile();

console.log("2 - Altre operazioni");
```

Output:

```
1 - Inizio lettura
2 - Altre operazioni
3 - Lettura completata
Benvenuti nel mondo di Node.js!
```

L'istruzione:

JavaScript

```
const dati = await fs.readFile(
    "dati.txt",
    "utf8"
);
```

sospende l'esecuzione della funzione asincrona `leggiFile()` fino a quando la Promise restituita da `fs.readFile()` non sarà completata.

Questo non significa che venga bloccato l'intero thread JavaScript.

Il programma può continuare a elaborare altre istruzioni e callback. Quando la Promise sarà risolta, l'esecuzione della funzione asincrona potrà riprendere attraverso il meccanismo delle microtask.

In sintesi: `await` sospende la funzione asincrona, non l'intero Event Loop.

È però importante distinguere l'attesa di un'operazione asincrona dall'esecuzione di un calcolo sincrono molto lungo: inserire un calcolo bloccante all'interno di una funzione `async` non lo rende automaticamente non bloccante.

## 9. Cosa succede quando blocchiamo l'Event Loop?

Uno degli errori più frequenti nella programmazione Node.js consiste nell'eseguire operazioni sincrone particolarmente lunghe all'interno del thread principale.

Consideriamo il seguente programma:

JavaScript

```
console.log("Inizio");

setTimeout(() => {
    console.log("Timer eseguito");
}, 1000);

const inizio = Date.now();

while (Date.now() - inizio < 5000) {
    // Simulazione di un calcolo molto lungo
}

console.log("Fine elaborazione");
```

Quale sarà il risultato?

```
Inizio
Fine elaborazione
Timer eseguito
```

Il timer è stato programmato con un intervallo di un secondo.

Tuttavia, il ciclo `while` occupa il thread JavaScript per circa cinque secondi, impedendo all'Event Loop di elaborare le callback in attesa.

Di conseguenza, la callback del timer viene eseguita soltanto dopo il completamento del ciclo.

Questo esempio dimostra che la programmazione asincrona non garantisce automaticamente che un'applicazione non si blocchi.

### Il problema nelle applicazioni server

Immaginiamo un server HTTP che debba gestire contemporaneamente numerose richieste.

Se una richiesta avvia un'elaborazione sincrona che occupa il thread principale per cinque secondi, anche le altre richieste che necessitano dell'esecuzione di codice JavaScript sullo stesso thread dovranno attendere.

Le conseguenze possono essere:

* Aumento dei tempi di risposta del server.

* Ritardi nell'elaborazione delle altre richieste.

* Riduzione del numero di richieste gestibili nell'unità di tempo.

* Possibili timeout delle connessioni.

Per questo motivo è fondamentale evitare operazioni sincrone lunghe nel thread principale.

### Come evitare il blocco dell'Event Loop

Per mantenere un server Node.js reattivo, è opportuno utilizzare le API asincrone per le operazioni di I/O e limitare il lavoro sincrono svolto da ogni callback.

Per esempio, in un server HTTP è generalmente preferibile utilizzare `fs.readFile()` anziché `fs.readFileSync()` per leggere un file richiesto da un client.

Quando invece è necessario eseguire calcoli particolarmente impegnativi, possiamo utilizzare i Worker Threads di Node.js, che permettono di eseguire codice JavaScript su thread separati.

Un'altra possibilità consiste nel suddividere un'elaborazione lunga in più parti, programmando la continuazione del lavoro con meccanismi come `setImmediate()`, in modo da permettere all'Event Loop di gestire altre attività tra una parte e la successiva.

È importante osservare che i Worker Threads e il Worker Pool di libuv sono due meccanismi differenti: i primi consentono allo sviluppatore di eseguire codice JavaScript in thread separati, mentre il secondo viene utilizzato internamente da determinate API di Node.js.

![](https://www.google.com/s2/favicons?domain=https://nodejs.org\&sz=32)

Node.js Learn

+1

## 10. Esercitazione: prevedere l'ordine di esecuzione

Per verificare la comprensione del funzionamento dell'Event Loop, proviamo a prevedere l'output del seguente programma.

Salviamo il codice nel file `esercizio.cjs`:

JavaScript

```
console.log("A");

setTimeout(() => {
    console.log("B");
}, 0);

Promise.resolve().then(() => {
    console.log("C");
});

process.nextTick(() => {
    console.log("D");
});

setImmediate(() => {
    console.log("E");
});

console.log("F");
```

Qual è l'ordine di esecuzione del programma?

Prova a individuare prima il codice sincrono, poi le callback nextTick e le microtask, infine le callback delle fasi dell'Event Loop.

Nascondi la soluzione

Output garantito nelle prime quattro righe:

```
A
F
D
C
```

Successivamente vengono visualizzati `B` ed `E`, ma il loro ordine relativo non è garantito in questo contesto.

Spiegazione: il codice sincrono viene eseguito per primo. Successivamente vengono elaborate la callback di `process.nextTick()` e la microtask della Promise. Infine vengono eseguite le callback del timer e di `setImmediate()`, secondo la pianificazione dell'Event Loop.

## 11. Conclusioni

L'Event Loop è uno dei meccanismi fondamentali dell'architettura di Node.js.

Permette di coordinare operazioni asincrone e gestire numerose attività concorrenti utilizzando un numero relativamente contenuto di thread.

Per sviluppare applicazioni efficienti è importante comprendere che il codice sincrono viene eseguito sul Call Stack, mentre le operazioni asincrone possono essere delegate al sistema operativo o ai thread di lavoro. Al loro completamento, le relative callback vengono elaborate attraverso i meccanismi di pianificazione di Node.js.

Le Promise, le microtask, i timer e le diverse fasi dell'Event Loop determinano quando le callback potranno essere eseguite.

Conoscere questi meccanismi permette di prevedere meglio il comportamento del programma, individuare eventuali problemi di prestazioni e progettare server capaci di gestire molte richieste contemporaneamente.

Il principio fondamentale da ricordare è che Node.js può gestire molte operazioni concorrenti, ma una singola operazione JavaScript sincrona e prolungata può bloccare il thread principale e ritardare tutte le altre attività.

## Documentazione ufficiale e approfondimenti

Per approfondire il funzionamento dell'Event Loop e verificare il comportamento delle diverse API, è possibile consultare le seguenti risorse ufficiali:

![](https://www.google.com/s2/favicons?domain=https://nodejs.org\&sz=32)

Node.js – The Node.js Event Loop 

Fasi dell'Event Loop, timer, callback e libuv.

![](https://www.google.com/s2/favicons?domain=https://nodejs.org\&sz=32)

Node.js – Process API 

process.nextTick(), queueMicrotask() e relative differenze.

![](https://www.google.com/s2/favicons?domain=https://nodejs.org\&sz=32)

Node.js – Timers API 

setTimeout(), setInterval(), setImmediate() e timer basati su Promise.

![](https://www.google.com/s2/favicons?domain=https://nodejs.org\&sz=32)

Node.js – Don't Block the Event Loop 

Prestazioni, operazioni bloccanti e utilizzo del Worker Pool.
