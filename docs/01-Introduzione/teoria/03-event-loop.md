# Event Loop in Node.js

## Cos'è l'Event Loop?

L'Event Loop è il meccanismo fondamentale che permette a Node.js di eseguire operazioni di I/O non bloccanti nonostante JavaScript sia single-threaded. È il cuore pulsante dell'architettura di Node.js, responsabile della gestione e dell'esecuzione del codice asincrono.

## Funzionamento dell'Event Loop

L'Event Loop opera attraverso una sequenza di fasi (o "fasi") che vengono eseguite in un ciclo continuo:

### 1. Fasi dell'Event Loop

1. **timers**: Esegue i callback programmati da `setTimeout()` e `setInterval()`
2. **pending callbacks**: Esegue i callback di operazioni di I/O differite al ciclo successivo
3. **idle, prepare**: Fasi interne utilizzate solo da Node.js
4. **poll**: Recupera nuovi eventi di I/O; esegue i callback associati
5. **check**: Esegue i callback programmati da `setImmediate()`
6. **close callbacks**: Esegue i callback di chiusura, come `socket.on('close', ...)`

### 2. Ciclo di Vita di un'Operazione

1. Il codice JavaScript viene eseguito fino al completamento
2. Le operazioni asincrone vengono delegate al sistema operativo o al thread pool
3. L'Event Loop continua a eseguire altro codice senza bloccarsi
4. Quando un'operazione asincrona è completata, il relativo callback viene inserito nella coda appropriata
5. L'Event Loop esegue i callback quando raggiunge la fase corrispondente

## Thread Pool

Per operazioni di I/O bloccanti che non possono essere gestite direttamente dal sistema operativo in modo asincrono, Node.js utilizza un thread pool fornito da libuv:

- Gestisce operazioni come accesso al file system, DNS lookup, ecc.
- Dimensione predefinita di 4 thread (configurabile)
- Permette a Node.js di mantenere il thread principale reattivo

## Microtask Queue

Oltre alle code standard dell'Event Loop, Node.js gestisce anche una "microtask queue":

- Contiene callback di Promise (`.then()`, `.catch()`, `.finally()`)
- Contiene callback programmati con `process.nextTick()`
- Ha priorità più alta rispetto alle altre code
- Viene svuotata dopo ogni fase dell'Event Loop

## Priorità di Esecuzione

L'ordine di priorità per l'esecuzione dei callback è il seguente:

1. Codice sincrono
2. `process.nextTick()` callbacks
3. Promise callbacks (microtasks)
4. Timer callbacks (`setTimeout`, `setInterval`)
5. I/O callbacks
6. `setImmediate()` callbacks
7. Close callbacks

## Bloccare l'Event Loop

Poiché Node.js è single-threaded, operazioni CPU-intensive possono bloccare l'Event Loop, causando problemi di prestazioni:

- Operazioni sincrone lunghe impediscono l'esecuzione di altri callback
- Calcoli complessi dovrebbero essere suddivisi in parti più piccole
- Operazioni CPU-intensive possono essere delegate a worker threads

## Best Practices

Per sfruttare al meglio l'Event Loop:

1. **Evitare operazioni sincrone bloccanti**: Preferire sempre API asincrone
2. **Suddividere operazioni complesse**: Utilizzare `setImmediate()` per dare all'Event Loop la possibilità di gestire altri eventi
3. **Monitorare le prestazioni**: Utilizzare strumenti come `node --trace-event-loop-lag` per identificare colli di bottiglia
4. **Utilizzare worker threads**: Per operazioni CPU-intensive
5. **Comprendere le priorità**: Conoscere l'ordine di esecuzione dei callback per ottimizzare il flusso dell'applicazione

## Differenze con il Browser

L'Event Loop di Node.js differisce da quello dei browser in alcuni aspetti chiave:

- Implementazione basata su libuv anziché sul browser
- Fasi più specifiche e granulari
- API aggiuntive come `process.nextTick()` e `setImmediate()`
- Gestione diversa delle microtask queue

## Evoluzione dell'Event Loop

Nel corso delle versioni di Node.js, l'Event Loop ha subito miglioramenti significativi:

- Ottimizzazioni delle prestazioni
- Miglior gestione delle priorità
- Integrazione più stretta con le Promise
- Supporto migliorato per async/await