# L'Event Loop di Node.js: come funziona davvero

*Call Stack, Callback Queue, libuv, microtask e un vigile urbano che non dorme mai*

Node.js esegue il nostro codice JavaScript su **un solo thread**, eppure un server Node può gestire migliaia di connessioni contemporanee. Il segreto di questo apparente paradosso si chiama **Event Loop**. In questo articolo vediamo passo dopo passo come funziona, partendo dal modello semplificato (Call Stack + Callback Queue) fino ad arrivare alle fasi reali dell'event loop, alle microtask e agli errori più comuni.

## 1. Il problema: aspettare costa

Leggere un file, interrogare un database, chiamare un'API: sono tutte operazioni **lente** rispetto alla velocità della CPU. Se il nostro programma restasse fermo ad aspettare il risultato, non potrebbe fare nient'altro nel frattempo.

Node.js risolve il problema con un modello **asincrono e non bloccante**: l'operazione lenta viene *delegata* a qualcun altro, e il programma continua. Quando il risultato è pronto, una funzione di ritorno (la **callback**) viene eseguita.

Per capire come, servono tre attori: il **Call Stack**, la **Callback Queue** e l'**Event Loop**.

## 2. Il Call Stack: sincrono e monotasking

Il Call Stack è una struttura dati di tipo **LIFO** (*Last In, First Out*: l'ultimo a entrare è il primo a uscire). Tiene traccia della funzione attualmente in esecuzione.

- Quando una funzione viene chiamata, viene aggiunta (**push**) in cima allo stack.
- Quando termina (`return` o parentesi graffa di chiusura), viene rimossa (**pop**).
- **Regola ferrea:** JavaScript può fare **una sola cosa alla volta**. Se lo stack è occupato in un calcolo lungo, l'intera applicazione si ferma.

```javascript
function c() { console.log("c"); }
function b() { c(); }
function a() { b(); }

a();
// Stack: a -> a,b -> a,b,c -> (c termina) a,b -> a -> vuoto
```

## 3. Delegare il lavoro: libuv e il sistema operativo

Quando Node.js incontra un'operazione asincrona (lettura di un file, richiesta di rete, `setTimeout`), **non la esegue nel Call Stack**. La affida a:

- il **sistema operativo**, per molte operazioni di rete (socket non bloccanti);
- un **thread pool** gestito da **libuv**, la libreria C che sta sotto Node.js, per operazioni come il file system, DNS lookup e alcune funzioni crittografiche (di default 4 thread).

Il nostro codice JavaScript resta single-thread; è il *lavoro di background* a essere multi-thread.

## 4. La Callback Queue: la sala d'attesa

Quando l'operazione in background termina, la sua callback viene messa in una coda di tipo **FIFO** (*First In, First Out*: il primo che arriva è il primo servito). Le callback restano "in sala d'attesa" finché qualcuno non le porta nello stack.

## 5. L'Event Loop: il vigile urbano

L'Event Loop è il ponte tra i due mondi. Nella versione semplificata, il suo algoritmo è questo, ripetuto all'infinito:

1. Il Call Stack è vuoto?
2. Se **no**, aspetta.
3. Se **sì**, guarda la Callback Queue.
4. Prende la prima callback e la sposta nel Call Stack, che la esegue.

La parola chiave è **"solo quando lo stack è vuoto"**: l'event loop non interrompe mai una funzione in esecuzione.

## 6. Un esempio passo-passo

```javascript
function seconda() {
  console.log("3. Esecuzione della seconda funzione");
}

function prima() {
  console.log("1. Inizio prima funzione");
  setTimeout(seconda, 0);   // delegata in background
  console.log("2. Fine prima funzione");
}

prima();
```

**Output:**

```
1. Inizio prima funzione
2. Fine prima funzione
3. Esecuzione della seconda funzione
```

| Passo | Call Stack | Callback Queue | Spiegazione |
| --- | --- | --- | --- |
| 1 | `prima()` | vuota | `prima()` entra nello stack |
| 2 | `prima()` → `console.log("1")` | vuota | stampa il primo log, poi viene rimosso |
| 3 | `prima()` → `setTimeout` | vuota | il timer viene registrato in background, `setTimeout` esce subito dallo stack |
| 4 | `prima()` | `[seconda]` | scaduto il timer, `seconda` va in coda |
| 5 | `prima()` → `console.log("2")` | `[seconda]` | stampa il secondo log |
| 6 | vuoto | `[seconda]` | `prima()` termina: lo stack è libero |
| 7 | l'Event Loop interviene | `[seconda]` | sposta `seconda` nello stack |
| 8 | `seconda()` → `console.log("3")` | vuota | stampa il terzo log |
| 9 | vuoto | vuota | non c'è altro da fare: il processo termina |

Anche con `0` millisecondi, `seconda` **deve** attendere che `prima()` liberi lo stack. Nota di precisione: in Node.js un timer a `0` ms viene in realtà trattato come `1` ms, e il tempo indicato è un **minimo**, non una garanzia.

> **Tip:** `setTimeout(fn, 0)` significa "esegui `fn` appena possibile, ma non prima che lo stack sia vuoto", non "esegui subito".

## 7. Oltre il modello semplificato: le fasi dell'Event Loop

Il modello "una coda sola" è utile per iniziare, ma in realtà libuv organizza l'event loop in **fasi**, ciascuna con la propria coda di callback. A ogni giro (*tick*) l'event loop le attraversa in quest'ordine:

| Fase | Cosa esegue |
| --- | --- |
| **timers** | callback di `setTimeout` e `setInterval` scaduti |
| **pending callbacks** | alcune callback di errori di sistema (es. TCP) rinviate dal giro precedente |
| **idle, prepare** | uso interno |
| **poll** | recupera nuovi eventi di I/O ed esegue le relative callback; qui l'event loop può attendere |
| **check** | callback di `setImmediate` |
| **close callbacks** | callback di chiusura (es. `socket.on('close', ...)`) |

Tra una callback e l'altra, e tra una fase e l'altra, Node svuota anche le code delle **microtask**, di cui parliamo ora.

## 8. Microtask e `process.nextTick`: le corsie preferenziali

Le **Promise** (`.then`, `.catch`, `await`) usano la **Microtask Queue**, che ha priorità sulle callback normali: appena lo stack si svuota, *tutte* le microtask vengono eseguite prima di passare alla fase successiva.

In Node.js esiste inoltre `process.nextTick()`, con una coda ancora più prioritaria: viene svuotata **prima** delle microtask delle Promise.

```javascript
console.log("1 - sync start");

setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
Promise.resolve().then(() => console.log("4 - promise"));
process.nextTick(() => console.log("3 - nextTick"));

console.log("2 - sync end");
```

**Output tipico:**

```
1 - sync start
2 - sync end
3 - nextTick
4 - promise
timeout
immediate
```

L'ordine è: **codice sincrono → nextTick → microtask (Promise) → timers → ... → check (immediate)**.

> **Attenzione:** nel modulo principale, l'ordine tra `setTimeout(..., 0)` e `setImmediate` **non è deterministico**, perché dipende dalle prestazioni del processo. Non basare mai la logica del programma su questo ordine.

### `setTimeout` vs `setImmediate` dentro una callback di I/O

Dentro una callback di I/O, invece, l'ordine è **sempre lo stesso**: la fase *check* viene subito dopo la *poll*, quindi `setImmediate` vince sempre.

```javascript
const fs = require("fs");

fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
});
// Output garantito: immediate, poi timeout
```

## 9. L'errore più grave: bloccare l'Event Loop

Poiché c'è un solo thread, **una funzione sincrona lenta blocca tutti i client**.

```javascript
const http = require("http");

http.createServer((req, res) => {
  if (req.url === "/blocca") {
    const fine = Date.now() + 10000;
    while (Date.now() < fine) {}      // 10 secondi di CPU
    res.end("fatto");
  } else {
    res.end("ciao");
  }
}).listen(3000);
```

Se un utente apre `/blocca`, per 10 secondi **nessun altro utente** riceverà risposta, nemmeno su `/`. Lo stack è occupato e l'event loop non può far entrare altre callback.

**Come si risolve:**

- usare le versioni **asincrone** delle API (`fs.promises.readFile` invece di `fs.readFileSync`);
- spostare i calcoli pesanti nei **Worker Threads** (modulo `worker_threads`) o in processi separati;
- spezzare un lavoro lungo in blocchi, cedendo il controllo con `setImmediate` tra un blocco e l'altro.

```javascript
function elaboraAPezzi(elementi, i = 0) {
  const fine = Math.min(i + 1000, elementi.length);
  for (; i < fine; i++) { /* lavoro su elementi[i] */ }
  if (i < elementi.length) {
    setImmediate(() => elaboraAPezzi(elementi, i)); // lascia respirare l'event loop
  }
}
```

## 10. Best practice

- **Non bloccare mai l'event loop**: evitare `*Sync` (`readFileSync`, `execSync`, ...) nel codice di un server, salvo in fase di avvio.
- **Preferire `async/await`** alle callback annidate: il codice resta leggibile e il flusso asincrono è più facile da seguire.
- **Gestire sempre gli errori** delle Promise (`try/catch` con `await` o `.catch()`): una rejection non gestita può terminare il processo nelle versioni recenti di Node.
- **Usare `setImmediate`** per cedere il controllo all'event loop in elaborazioni lunghe.
- **Usare i Worker Threads** per lavoro CPU-intensive (immagini, crittografia pesante, parsing enormi).
- **Non abusare di `process.nextTick`**: chiamate ricorsive possono affamare l'I/O, perché la sua coda viene svuotata prima di proseguire.

## 11. Tip & trick

- **Misurare il ritardo dell'event loop**: se un timer da 100 ms scatta dopo molto più tempo, l'event loop è sovraccarico.

```javascript
let ultimo = Date.now();
setInterval(() => {
  const ora = Date.now();
  const ritardo = ora - ultimo - 100;
  if (ritardo > 50) console.warn(`Event loop in ritardo di ${ritardo} ms`);
  ultimo = ora;
}, 100);
```

- **`queueMicrotask(fn)`** accoda una microtask senza creare una Promise.
- **Un `setInterval` non è un orologio preciso**: se lo stack è occupato, il tick viene ritardato.
- **Visualizzare il flusso**: aggiungere `console.log` numerati, come negli esempi di questo articolo, è il modo più rapido per verificare le proprie ipotesi.

## 12. Esercizi proposti

**Esercizio 1.** Senza eseguire il codice, prevedi l'output e poi verificalo:

```javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```

**Esercizio 2.** Scrivi un piccolo server HTTP con due rotte: `/veloce` risponde subito, `/lenta` esegue un ciclo `while` di 5 secondi. Apri le due rotte da due schede del browser e osserva cosa succede. Poi riscrivi `/lenta` usando un Worker Thread.

**Esercizio 3.** Aggiungi `process.nextTick` e `queueMicrotask` all'Esercizio 1 e determina l'ordine finale. Cosa cambia se li inserisci dentro una callback di `fs.readFile`?

**Esercizio 4.** Scrivi una funzione che elabora un array di 1.000.000 di numeri senza bloccare l'event loop, usando `setImmediate`. Misura il ritardo dell'event loop con lo snippet del paragrafo 11, prima e dopo.

**Esercizio 5.** Spiega con parole tue, in non più di 10 righe, perché `setTimeout(fn, 0)` non esegue `fn` immediatamente.

## 13. Domande di autovalutazione

**1. Che tipo di struttura dati è il Call Stack?**

- A) FIFO
- B) LIFO
- C) Albero binario

**2. Qual è l'output di questo codice?**

```javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");
```

- A) A B C
- B) A C B
- C) B A C

**3. Quando l'Event Loop sposta una callback dalla coda al Call Stack?**

- A) Appena la callback entra nella coda
- B) Ogni 10 millisecondi
- C) Solo quando il Call Stack è vuoto

**4. Quale tra queste code ha la priorità più alta in Node.js?**

- A) La coda di `setTimeout`
- B) La coda di `process.nextTick`
- C) La coda di `setImmediate`

**5. Cosa succede se una funzione sincrona occupa la CPU per 5 secondi in un server Node.js?**

- A) Solo la richiesta corrente viene rallentata
- B) Tutte le richieste restano in attesa finché la funzione non termina
- C) Node.js crea automaticamente un nuovo thread

**6. Dentro una callback di `fs.readFile`, quale viene eseguito per primo?**

- A) `setTimeout(fn, 0)`
- B) `setImmediate(fn)`
- C) L'ordine è casuale

**7. Chi esegue in background le operazioni come la lettura di file?**

- A) Il Call Stack
- B) libuv (thread pool) e il sistema operativo
- C) L'Event Loop stesso

## Risposte alle domande di autovalutazione

1. **B) LIFO.** L'ultima funzione chiamata è la prima a terminare e uscire dallo stack.
2. **B) A C B.** La callback del timer, anche a 0 ms, deve attendere che lo stack sia vuoto.
3. **C) Solo quando il Call Stack è vuoto.** L'event loop non interrompe mai una funzione in esecuzione.
4. **B) La coda di `process.nextTick`.** Viene svuotata prima delle microtask delle Promise e prima di passare alla fase successiva.
5. **B) Tutte le richieste restano in attesa.** Un solo thread esegue JavaScript: se è occupato, l'event loop non può servire nessun altro.
6. **B) `setImmediate`.** Dopo la fase *poll* (I/O) viene la fase *check*, quindi `setImmediate` precede sempre il timer.
7. **B) libuv (thread pool) e il sistema operativo.** Il codice JavaScript resta single-thread, il lavoro di background no.
