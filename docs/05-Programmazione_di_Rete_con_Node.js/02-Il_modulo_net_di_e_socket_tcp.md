# Il modulo net di Node.js per la comunicazione socket

*Guida pratica ai socket TCP e IPC con Node.js: dal server echo alla chat multiutente, passando per framing dei messaggi, backpressure e gestione degli errori.*

## 1. Introduzione 

Quando un’applicazione deve scambiare dati con un’altra applicazione, in rete o sulla stessa macchina, il meccanismo di base è il **socket**. Protocolli come HTTP, SMTP, MQTT o i database come PostgreSQL e Redis sono costruiti sopra i socket TCP.

Node.js espone questa funzionalità tramite il modulo built-in **`net`**, che offre:

- **socket TCP** per la comunicazione di rete (client e server);
- **socket IPC** (Unix domain socket su Linux/macOS, named pipe su Windows) per la comunicazione tra processi sulla stessa macchina;
- funzioni di utilità per validare gli indirizzi IP (`net.isIP()`, `net.isIPv4()`, `net.isIPv6()`).

Il modulo è la base su cui poggiano `http`, `https` e `tls`: capirlo significa capire come funziona davvero la rete in Node.js.

**Obiettivi di questo capitolo**

- creare server e client TCP con `net.createServer()` e `net.connect()`;
- conoscere il ciclo di vita e gli eventi di un socket;
- gestire correttamente il flusso di byte (framing, backpressure);
- applicare best practice su timeout, errori e chiusura;
- esercitarsi con proposte di esercizi e quiz di autovalutazione.

**Prerequisiti**: JavaScript di base, concetti di rete (indirizzo IP, porta, TCP), familiarità con gli eventi di Node.js. Gli esempi usano i moduli ES (`import`) e sono compatibili con le versioni LTS recenti di Node.js.

## 2. Concetti di base: TCP e stream

TCP è un protocollo **orientato alla connessione** e **affidabile**: i byte arrivano in ordine e senza perdite. Ma c’è un punto cruciale, spesso fonte di bug:

> TCP è un **flusso di byte** (*stream*), non un flusso di messaggi. Non esistono “confini” tra un `write()` e l’altro.

Se il client invia due volte `"ciao"`, il server potrebbe ricevere `"ciaociao"` in un solo evento `data`, oppure `"ci"` e `"aociao"` in due eventi. Per questo, come vedremo nella sezione 7, servono tecniche di **framing**.

In Node.js un `net.Socket` è un **stream duplex**: si può leggere (Readable) e scrivere (Writable). Ne eredita quindi tutti i metodi (`pipe()`, `setEncoding()`, `pause()`, `resume()`) e il meccanismo di *backpressure*.

Le due classi principali sono:

- **`net.Server`**: resta in ascolto e accetta connessioni. Si crea con `net.createServer()`.
- **`net.Socket`**: rappresenta una connessione. Lato client lo si ottiene con `net.connect()` (o `net.createConnection()`), lato server lo si riceve come argomento del callback di connessione.

## 3. Anatomia del modulo net

- **`net.Server`**: accetta connessioni. Si crea con `net.createServer([options][, listener])`; il listener è registrato sull’evento `'connection'`.
- **`net.Socket`**: rappresenta una connessione, lato server (argomento del listener) o lato client (restituito da `net.connect()`). È uno **stream duplex**: ha `read`, `write`, `pipe()`, `pause()`, `resume()`, `setEncoding()` e supporta `for await`.
- **Utilità**: `net.isIP()`, `net.isIPv4()`, `net.isIPv6()` per validare gli indirizzi.

Le opzioni di `net.createServer()` più utili (nelle versioni recenti di Node.js):

- `allowHalfOpen`: se `true`, il socket non viene chiuso automaticamente quando il peer chiude la propria parte;
- `pauseOnConnect`: il socket nasce in pausa, utile per passare la connessione a un altro processo;
- `noDelay`, `keepAlive`, `keepAliveInitialDelay`: applicano le rispettive impostazioni ai socket accettati.

## 4. Il primo server: echo

Il classico “hello world” dei socket è il server **echo**, che rimanda indietro ciò che riceve.

```js
// echo-server.js
const net = require('net');

// Creiamo un server TCP che ascolta sulla porta 4000 e sull’indirizzo 127.0.0.1
// Il callback viene eseguito per ogni connessione in entrata
const server = net.createServer((socket) => {
  // socket è un oggetto net.Socket che rappresenta la connessione con il client
  console.log(`Connesso: ${socket.remoteAddress}:${socket.remotePort}`);

  // echo dei dati (possibilmente frammentati) ricevuti
  // l'evento 'data' viene emesso ogni volta che arrivano dei byte
  socket.on('data', (chunk) => {socket.write(chunk);});
  // l’evento 'end' indica che il client ha chiuso la scrittura (ha inviato FIN)
  socket.on('end', () => console.log('Il client ha chiuso la scrittura'));
  // l’evento 'close' indica che il socket è completamente chiuso
  socket.on('close', () => console.log('Connessione chiusa'));
  socket.on('error', (err) => console.error('Errore socket:', err.message));
});

server.on('error', (err) => console.error('Errore server:', err.message));

server.listen(4000, '127.0.0.1', () => {
  console.log('Server in ascolto su', server.address());
});
```

Per provarlo, in un altro terminale:

```bash
nc 127.0.0.1 4000
```

Tutto ciò che digiti viene rimandato indietro.

**Cosa succede**

1. `net.createServer(connectionListener)` crea l'istanza del server (`net.Server`) e registra automaticamente `connectionListener` sull’evento `'connection'`.
2. `server.listen(porta, host, callback)` avvia l’ascolto sulle connessioni in entrata; il callback opzionale viene eseguito una volta sull’evento `'listening'`.
3. Per ogni client che si connette viene istanziato un nuovo oggetto `net.Socket`, passato come argomento al `connectionListener`.
4. Ogni socket gestisce in modo indipendente il proprio ciclo di vita e i propri eventi (es. `'data'`, `'end'`, `'close'`, `'error'`).


> **Tip**: se non specifichi l’host, Node ascolta su tutte le interfacce (`::` o `0.0.0.0`). Durante lo sviluppo usa `127.0.0.1` per non esporre il servizio alla rete.

## 5. Il client TCP
Il client TCP è un processo che inizia una connessione verso un server. Deve specificare un indirizzo IP (o hostname) e una porta. In Node.js si crea con `net.connect()` (o `net.createConnection()`), che restituisce un oggetto `net.Socket`.

```js
// client.js
const net = require('net');

// net.connect() crea un socket e inizia la connessione al server
// la callback opzionale viene eseguita sull’evento 'connect'
const socket = net.connect({ host: '127.0.0.1', port: 4000 }, () => {
  console.log('Connesso al server');
  socket.write('Ciao dal client!\n');
});

// In questo modo il socket riceve i dati come stringhe
// e non come Buffer (default). Così possiamo usare direttamente 
// data.trim() senza fare data.toString().
// Inoltre in utf8 alcuni caratteri (lettere accentate o emoji) occupano più byte, 
// quindi senza setEncoding() potremmo ricevere chunk spezzati a metà carattere.
socket.setEncoding('utf8');
// Quando devi trasmettere dati binari (immagini, file PDF, audio, protocolli binari
// personalizzati), non usare setEncoding: lavora direttamente con i Buffer.
// gestendo la frammentazione dei chunk come mostrato nella sezione 7.

socket.on('data', (data) => {
  // data è una stringa perché abbiamo chiamato setEncoding('utf8')
  console.log('Risposta:', data.trim());
  socket.end(); // chiusura ordinata
});

socket.on('error', (err) => console.error('Errore:', err.code, err.message));
socket.on('close', (hadError) => console.log('Chiuso. Errore?', hadError));
```

Il secondo argomento di `net.connect()` è un listener per l’evento `'connect'`. Puoi anche chiamare `socket.write()` subito dopo `net.connect()`: i dati vengono messi in coda e inviati a connessione stabilita.

## 6. Ciclo di vita ed eventi del socket    

Gli eventi principali di `net.Socket`:

- **`connect`**: la connessione è stabilita (solo lato client).
- **`data`**: sono arrivati dei byte (un `Buffer`, oppure una stringa se hai chiamato `setEncoding()`).
- **`end`**: l’altro lato ha terminato di inviare dati (ha inviato il segnale FIN).
- **`drain`**: il buffer di scrittura si è svuotato, si può riprendere a scrivere.
- **`timeout`**: il socket è inattivo da troppo tempo (non chiude da solo la connessione!).
- **`error`**: si è verificato un errore; dopo di esso viene emesso `close`.
- **`close`**: il socket è completamente chiuso. L’argomento `hadError` indica se la chiusura è dovuta a un errore. È l’ultimo evento del ciclo di vita.

### `end()` oppure `destroy()`?

- **`socket.end([data])`**: chiusura **ordinata**. Invia i dati ancora in coda e poi il segnale FIN. L’altro lato riceve `'end'`.
- **`socket.destroy([err])`**: chiusura **immediata**. Scarta i dati non ancora inviati. Da usare per connessioni sospette, scadute o in errore.

Per impostazione predefinita, quando il peer chiude il proprio lato, Node chiude automaticamente anche il nostro. Con l’opzione `allowHalfOpen: true` si può mantenere la connessione *half-open* (si può ancora scrivere dopo aver ricevuto `'end'`), ma poi bisogna chiamare `end()` manualmente.

### Proprietà utili

- `socket.remoteAddress`, `socket.remotePort`, `socket.localAddress`, `socket.localPort`
- `socket.bytesRead`, `socket.bytesWritten`: utili per statistiche e controllo del traffico
- `socket.readyState`: `'opening'`, `'open'`, `'readOnly'`, `'writeOnly'`
- `socket.destroyed`: `true` se il socket è stato distrutto

## 7. Esempio completo: chat multiutente

Vediamo un esempio più realistico: un server di chat a righe. Ogni messaggio termina con `\n` e viene inoltrato a tutti gli altri utenti. Usiamo il modulo `readline` per ricostruire le righe dallo stream (risolve il problema del framing a delimitatore, vedi sezione 7).

```js
// chat-server.js
const net = require('net');
const readline = require('readline');

// Mappa dei client connessi: socket -> nickname
const clients = new Map();
let counter = 0;

function broadcast(message, sender = null) {
  // Clients.keys() restituisce un iteratore sui socket connessi
  for (const socket of clients.keys()) {
    if (socket !== sender && !socket.destroyed) {
      socket.write(message + '\n');
    }
  }
}

const server = net.createServer((socket) => {
  const nick = `utente${++counter}`;
  clients.set(socket, nick);
  socket.setKeepAlive(true, 30_000);

  socket.write(`Benvenuto, sei ${nick}. Comandi: /nick nome, /quit\n`);
  broadcast(`* ${nick} è entrato`, socket);

  const rl = readline.createInterface({ input: socket });

  rl.on('line', (line) => {
    const text = line.trim();
    if (!text) return;

    if (text === '/quit') {
      socket.end('Arrivederci!\n');
    } else if (text.startsWith('/nick ')) {
      const old = clients.get(socket);
      const newNick = text.slice(6).trim().slice(0, 20);
      if (newNick) {
        clients.set(socket, newNick);
        broadcast(`* ${old} ora si chiama ${newNick}`);
      }
    } else {
      broadcast(`${clients.get(socket)}: ${text}`, socket);
    }
  });

  socket.on('error', (err) => {
    console.error(`Errore su ${nick}:`, err.code);
  });

  socket.on('close', () => {
    const name = clients.get(socket);
    clients.delete(socket); // evita memory leak!
    broadcast(`* ${name} è uscito`);
  });
});

server.listen(4000, () => console.log('Chat in ascolto sulla porta 4000'));
```

Per testarla apri più terminali con `nc localhost 4000` e scrivi qualche messaggio.

**Punti di attenzione**

- La `Map` dei client va **sempre ripulita** nell’evento `'close'`, altrimenti si accumulano riferimenti a socket morti.
- Ogni socket deve avere un gestore di `'error'`: un errore non gestito su un `EventEmitter` fa terminare il processo.
- Limitiamo la lunghezza del nickname: **mai fidarsi dell’input di rete**.

## 8. Il problema del framing

Poiché TCP è un flusso di byte, il ricevente deve sapere dove inizia e dove finisce ogni messaggio. Le strategie più comuni sono due.

### 8.1 Delimitatore

I messaggi sono separati da un carattere speciale, in genere `\n`. È la tecnica di protocolli come SMTP, Redis (RESP) o IRC. Il modo più semplice in Node.js è `readline` (come nella chat). In alternativa, si accumula manualmente:

```js
let pending = '';
socket.setEncoding('utf8');

socket.on('data', (chunk) => {
  pending += chunk;
  let idx;
  while ((idx = pending.indexOf('\n')) !== -1) {
    const line = pending.slice(0, idx);
    pending = pending.slice(idx + 1);
    handleMessage(line);
  }
});
```

**Vantaggi**: semplice, leggibile con `nc`/`telnet`, ideale per protocolli testuali. **Svantaggi**: il delimitatore non deve comparire nel contenuto (o va “escapato”).

### 8.2 Prefisso di lunghezza (length-prefix)

Ogni messaggio è preceduto da un’intestazione di dimensione fissa (qui 4 byte) con la lunghezza del payload. È adatto a protocolli binari.

```js
const MAX_FRAME = 1024 * 1024; // 1 MiB

// Codifica: [4 byte lunghezza][payload]
export function encodeFrame(text) {
  const body = Buffer.from(text, 'utf8');
  const header = Buffer.alloc(4);
  header.writeUInt32BE(body.length, 0);
  return Buffer.concat([header, body]);
}

// Decodifica incrementale
export function createFrameParser(socket, onMessage) {
  let buffer = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length >= 4) {
      const length = buffer.readUInt32BE(0);

      if (length > MAX_FRAME) {
        socket.destroy(new Error('Frame troppo grande'));
        return;
      }
      if (buffer.length < 4 + length) break; // messaggio incompleto

      onMessage(buffer.subarray(4, 4 + length).toString('utf8'));
      buffer = buffer.subarray(4 + length);
    }
  });
}
```

**Vantaggi**: nessun problema di escaping, efficiente, adatto a dati binari. **Svantaggi**: non leggibile a occhio, richiede un parser. Notare il controllo su `MAX_FRAME`: senza un limite, un client malevolo potrebbe dichiarare una lunghezza enorme e far esaurire la memoria del server.

> **Trucco per i test**: per verificare che il tuo parser gestisca la frammentazione, fai inviare dal client un messaggio **un byte alla volta** (con un piccolo ritardo). Se il codice regge, regge anche in produzione.

## 9. Backpressure: non soffocare il socket

`socket.write(data)` restituisce un valore booleano:

- `true`: il buffer interno è sotto la soglia (`highWaterMark`), puoi continuare a scrivere;
- `false`: il buffer è pieno, conviene **aspettare l’evento `'drain'`** prima di scrivere ancora.

Se ignori questo segnale e scrivi molto più velocemente di quanto il peer legga, i dati si accumulano in memoria nel tuo processo.

```js
async function sendMany(socket, items) {
  for (const item of items) {
    if (!socket.write(item + '\n')) {
      await new Promise((resolve) => socket.once('drain', resolve));
    }
  }
}
```

Quando devi collegare due stream, **non fare il lavoro a mano**: usa `pipe()` o, meglio, `stream.pipeline()`, che gestisce backpressure ed errori. Ecco un semplice proxy TCP:

```js
import net from 'node:net';
import { pipeline } from 'node:stream';

net.createServer((client) => {
  const upstream = net.connect({ host: 'example.org', port: 80 });

  pipeline(client, upstream, (err) => err && client.destroy());
  pipeline(upstream, client, (err) => err && upstream.destroy());
}).listen(8080);
```

## 10. Timeout, keep-alive e Nagle

### Timeout di inattività

```js
socket.setTimeout(60_000); // 60 secondi di inattività
socket.on('timeout', () => {
  console.log('Timeout: chiudo la connessione');
  socket.destroy(); // il timeout NON chiude da solo!
});
```

È una best practice **impostare sempre un timeout lato server**: i client che spariscono senza chiudere la connessione occuperebbero risorse all’infinito.

### Keep-alive TCP

`socket.setKeepAlive(true, 30_000)` abilita l’invio di pacchetti di controllo su connessioni inattive, utili per scoprire peer scomparsi e per mantenere attive le connessioni attraverso NAT e firewall. Il secondo parametro è il ritardo iniziale in millisecondi.

### Algoritmo di Nagle

Per default TCP raggruppa i piccoli pacchetti (algoritmo di Nagle) per ridurre il traffico, a costo di un po’ di latenza. Per applicazioni interattive (giochi, chat in tempo reale, protocolli a richiesta/risposta con messaggi piccoli) si può disattivarlo:

```js
socket.setNoDelay(true);
```

## 11. Gestione degli errori

Gli errori di rete sono **normali**, non eccezionali. I codici più frequenti:

- **`ECONNREFUSED`**: nessun processo in ascolto sulla porta di destinazione.
- **`ECONNRESET`**: il peer ha chiuso bruscamente la connessione.
- **`EPIPE`**: scrittura su una connessione già chiusa dall’altro lato.
- **`ETIMEDOUT`**: la connessione non si è stabilita o è scaduta.
- **`EADDRINUSE`**: la porta è già occupata da un altro processo (errore del *server*, su `listen`).
- **`EACCES`**: permessi insufficienti (ad esempio porte sotto la 1024 su Linux).

Regole pratiche:

1. Registra **sempre** `socket.on('error', ...)` per **ogni** socket, sia lato client sia lato server.
2. Registra `server.on('error', ...)` per gestire `EADDRINUSE` e simili.
3. Dopo `'error'` il socket verrà chiuso: non provare a riutilizzarlo.
4. Per riconnettersi, crea un **nuovo** socket (con backoff esponenziale, non in un ciclo stretto).

Esempio di client con riconnessione e backoff:

```js
import net from 'node:net';

function connectWithRetry(options, attempt = 0) {
  const socket = net.connect(options);

  socket.on('connect', () => {
    attempt = 0;
    console.log('Connesso');
  });

  socket.on('error', () => {}); // l’errore è gestito in 'close'

  socket.on('close', () => {
    const delay = Math.min(1000 * 2 ** attempt, 30_000);
    console.log(`Disconnesso, riprovo tra ${delay} ms`);
    setTimeout(() => connectWithRetry(options, attempt + 1), delay);
  });
}

connectWithRetry({ host: '127.0.0.1', port: 4000 });
```

## 12. Arresto ordinato del server

`server.close()` **smette di accettare nuove connessioni**, ma non chiude quelle esistenti: il callback viene eseguito solo quando tutte si sono chiuse. Per un arresto pulito occorre tenere traccia dei socket:

```js
const sockets = new Set();

const server = net.createServer((socket) => {
  sockets.add(socket);
  socket.on('close', () => sockets.delete(socket));
  // ...
});

function shutdown() {
  console.log('Arresto in corso...');
  server.close(() => process.exit(0));

  for (const s of sockets) s.end('Server in chiusura\n');

  // rete di sicurezza: dopo 5 s forza la chiusura
  setTimeout(() => {
    for (const s of sockets) s.destroy();
  }, 5000).unref();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

Il metodo `.unref()` sul timer impedisce che sia il timer stesso a tenere vivo il processo.

Altri strumenti utili del server: `server.getConnections(cb)` per contare i client connessi e `server.maxConnections` per fissare un limite massimo di connessioni.

## 13. Socket IPC: Unix domain socket e named pipe

Il modulo `net` permette di comunicare tra processi sulla stessa macchina usando un **percorso** al posto di porta e host. Su Linux/macOS è un *Unix domain socket* (un file speciale nel filesystem), su Windows una *named pipe* (`\\.\pipe\nome`).

```js
// server
import net from 'node:net';
import fs from 'node:fs';

const SOCKET_PATH = '/tmp/mia-app.sock';
if (fs.existsSync(SOCKET_PATH)) fs.unlinkSync(SOCKET_PATH);

net.createServer((socket) => {
  socket.end('Ciao via IPC\n');
}).listen(SOCKET_PATH, () => console.log('IPC pronto'));

// client
// net.connect({ path: '/tmp/mia-app.sock' }).pipe(process.stdout);
```

**Quando usarli?** Per la comunicazione locale (demoni, database sulla stessa macchina, Docker usa `/var/run/docker.sock`): sono più veloci dei socket TCP su loopback e si controllano con i **permessi del filesystem**, un livello di sicurezza in più.

> **Attenzione**: il file socket non viene rimosso automaticamente se il processo termina in modo anomalo. Eliminalo prima di fare `listen()`, come nell’esempio, altrimenti otterrai `EADDRINUSE`.

## 14. Best practice: riepilogo

- **Un gestore `'error'` per ogni socket e per il server.** Senza, un errore di rete può far terminare l’intero processo.
- **Ricorda che TCP è uno stream.** Usa sempre una strategia di framing (delimitatore o lunghezza).
- **Imposta un limite alla dimensione dei messaggi** e al buffer accumulato: protegge da attacchi di esaurimento memoria.
- **Configura timeout di inattività** lato server e chiudi esplicitamente i socket scaduti con `destroy()`.
- **Rispetta la backpressure**: controlla il valore restituito da `write()` e usa `pipeline()` per collegare gli stream.
- **Ripulisci le strutture dati** (`Map`, `Set`) nell’evento `'close'` per evitare memory leak.
- **Usa `end()` per la chiusura ordinata**, `destroy()` per quella forzata.
- **Valida e sanifica l’input**: tutto ciò che arriva dalla rete è potenzialmente ostile.
- **Limita le connessioni** con `server.maxConnections` e, se esposto su Internet, metti il servizio dietro un reverse proxy o un firewall.
- **Per dati sensibili usa TLS** (modulo `node:tls`, che ha un’API quasi identica a `net`): i socket TCP semplici trasmettono tutto in chiaro.
- **Se hai bisogno di un protocollo web**, valuta `http` o WebSocket invece di reinventare la ruota con `net`.

## 15. Tips and tricks

- **Debug del modulo**: avvia l’applicazione con `NODE_DEBUG=net node app.js` per vedere nel dettaglio gli eventi interni dei socket.
- **Strumenti da riga di comando**: `nc` (netcat) per client e server di prova, `ss -tlnp` (o `lsof -i :4000`) per vedere chi è in ascolto su una porta, Wireshark per ispezionare i pacchetti.
- **Porta casuale**: `server.listen(0)` fa scegliere una porta libera al sistema operativo; leggila con `server.address().port`. Perfetto per i test automatici.
- **Non bloccare il processo**: `socket.unref()` e `server.unref()` fanno sì che il socket o il server non impediscano la terminazione del processo.
- **Stringhe e Buffer**: se non usi `setEncoding()`, `data` riceve dei `Buffer`. Attento alla concatenazione di chunk come stringhe con caratteri multibyte (UTF-8): un carattere può essere spezzato tra due chunk. `setEncoding('utf8')` gestisce correttamente questo caso.
- **Iterazione asincrona**: i socket sono stream, quindi si possono leggere con `for await (const chunk of socket) { ... }`.
- **Promise e connessione**: per attendere la connessione con `async/await` usa `events.once(socket, 'connect')` dal modulo `node:events`.
- **Validare indirizzi**: `net.isIP('192.168.1.1')` restituisce `4`, `net.isIP('::1')` restituisce `6`, per un valore non valido restituisce `0`.

## 16. Proposte di esercizi

1. **Echo in maiuscolo.** Modifica il server echo in modo che restituisca il testo ricevuto in maiuscolo. Aggiungi un contatore dei byte ricevuti per ciascun client, stampato alla chiusura (`bytesRead`).
2. **Orologio di rete.** Realizza un server che, alla connessione di un client, invii l’ora corrente ogni secondo, e un client che la mostri a video. Gestisci correttamente la chiusura del client (interrompi il timer!).
3. **Chat con comandi.** Estendi la chat dell’articolo con i comandi `/list` (elenca gli utenti), `/msg nome testo` (messaggio privato) e `/kick nome`. Aggiungi un timeout di inattività di 2 minuti.
4. **Protocollo a lunghezza.** Implementa un client e un server che si scambiano messaggi JSON con prefisso di lunghezza a 4 byte. Verifica con un test che il parser funzioni anche quando il messaggio arriva un byte alla volta.
5. **Mini key-value store.** Realizza un server TCP che accetti i comandi testuali `SET chiave valore`, `GET chiave`, `DEL chiave`, in stile Redis. Aggiungi la gestione di comandi errati e di righe troppo lunghe.
6. **Port scanner.** Scrivi uno script che tenti la connessione a un intervallo di porte di `localhost` con un timeout breve e stampi quelle aperte. Usa solo sulle tue macchine o sulla rete del laboratorio autorizzata.
7. **Proxy con statistiche.** Partendo dal proxy dell’articolo, aggiungi il conteggio dei byte trasferiti in ciascuna direzione e un log alla chiusura della connessione.
8. **Dal TCP all’IPC.** Trasforma l’esercizio 5 in modo che ascolti su un Unix domain socket anziché su una porta TCP, e confronta i tempi di risposta su 10.000 richieste.

## 17. Quiz di autovalutazione

**Domanda 1.** Cosa rappresenta TCP dal punto di vista dell’applicazione?

- A) Un flusso di messaggi con confini ben definiti
- B) Un flusso di byte senza confini tra i messaggi
- C) Una sequenza di datagrammi indipendenti
- D) Un canale che non garantisce l’ordine dei dati

**Domanda 2.** Quale istruzione crea un server TCP in Node.js?

- A) `new net.Client(callback)`
- B) `net.createSocket(callback)`
- C) `net.createServer(callback)`
- D) `net.listen(callback)`

**Domanda 3.** Qual è la differenza tra `socket.end()` e `socket.destroy()`?

- A) Nessuna, sono sinonimi
- B) `end()` chiude subito scartando i dati in coda, `destroy()` li invia prima
- C) `end()` esegue una chiusura ordinata inviando i dati in coda, `destroy()` chiude immediatamente
- D) `end()` vale solo per i client, `destroy()` solo per i server

**Domanda 4.** Cosa succede quando scatta l’evento `'timeout'` su un socket?

- A) Il socket viene chiuso automaticamente
- B) Il socket viene riconnesso automaticamente
- C) Viene emesso solo l’evento: la chiusura va gestita esplicitamente
- D) Il processo Node.js termina

**Domanda 5.** Cosa indica un valore `false` restituito da `socket.write()`?

- A) La scrittura è fallita e i dati sono persi
- B) Il buffer interno è pieno: conviene attendere l’evento `'drain'`
- C) Il socket è stato chiuso dal peer
- D) I dati non sono stati codificati correttamente

**Domanda 6.** Un client invia due messaggi con due chiamate `write()` consecutive. Cosa può ricevere il server?

- A) Sempre due eventi `data`, uno per messaggio
- B) Un solo evento `data` con entrambi i messaggi concatenati, oppure più eventi con i dati frammentati in modo arbitrario
- C) Solo il primo messaggio
- D) Un errore, perché non è consentito inviare due messaggi di seguito

**Domanda 7.** Quale errore indica che la porta su cui si chiama `listen()` è già occupata?

- A) `ECONNREFUSED`
- B) `ECONNRESET`
- C) `EADDRINUSE`
- D) `EPIPE`

**Domanda 8.** Cosa fa `server.close()`?

- A) Chiude immediatamente tutte le connessioni attive
- B) Smette di accettare nuove connessioni e invoca il callback quando le esistenti si sono chiuse
- C) Elimina il server dalla memoria senza altri effetti
- D) Chiude solo le connessioni inattive

**Domanda 9.** Per quale scopo si usa tipicamente `socket.setNoDelay(true)`?

- A) Per criptare la comunicazione
- B) Per disattivare l’algoritmo di Nagle e ridurre la latenza dei piccoli messaggi
- C) Per aumentare la dimensione del buffer di lettura
- D) Per impedire la chiusura per inattività

**Domanda 10.** Quale vantaggio offre un Unix domain socket rispetto a un socket TCP su loopback per la comunicazione locale?

- A) Funziona anche tra macchine diverse
- B) Non richiede alcun gestore di errori
- C) È in genere più efficiente e l’accesso si controlla con i permessi del filesystem
- D) Supporta nativamente la cifratura TLS

## 18. Risposte al quiz

1. **B** – TCP è un flusso di byte senza confini tra i messaggi: per questo servono tecniche di framing (delimitatore o prefisso di lunghezza).
2. **C** – `net.createServer(callback)`: il callback è registrato sull’evento `'connection'` e riceve il socket del client.
3. **C** – `end()` esegue una chiusura ordinata, inviando prima i dati in coda e poi il segnale FIN; `destroy()` chiude immediatamente, scartando i dati non ancora inviati.
4. **C** – Viene emesso solo l’evento `'timeout'`: la chiusura va gestita esplicitamente, ad esempio con `socket.destroy()`.
5. **B** – Il valore `false` indica che il buffer interno ha superato la soglia (`highWaterMark`): conviene attendere l’evento `'drain'` prima di scrivere ancora.
6. **B** – TCP non preserva i confini dei messaggi: i dati possono arrivare concatenati in un solo evento `data` oppure frammentati in più eventi.
7. **C** – `EADDRINUSE` indica che l’indirizzo e la porta sono già in uso da un altro processo.
8. **B** – `server.close()` smette di accettare nuove connessioni e invoca il callback solo quando tutte le connessioni esistenti si sono chiuse.
9. **B** – `setNoDelay(true)` disattiva l’algoritmo di Nagle, riducendo la latenza dei piccoli messaggi in applicazioni interattive.
10. **C** – I socket IPC sono in genere più efficienti del TCP su loopback e si proteggono con i permessi del filesystem; non funzionano però tra macchine diverse.

## 19. Conclusioni

Il modulo `net` è piccolo ma potente: con poche righe si realizzano server e client di rete, e la sua natura di stream si integra perfettamente con il resto dell’ecosistema Node.js. I punti da ricordare:

- TCP è un **flusso di byte**: il framing è responsabilità dell’applicazione;
- ogni socket è uno **stream duplex** con eventi, backpressure e un ciclo di vita ben preciso;
- **errori, timeout e chiusura** vanno gestiti con cura: in rete tutto può andare storto;
- per la sicurezza, **limiti, validazione e TLS** non sono optional.

Da qui, i passi successivi naturali sono il modulo `tls` per le connessioni cifrate, `dgram` per UDP, e la comprensione di come `http` sia costruito sopra `net`.

## Riferimenti

- Documentazione ufficiale Node.js: modulo `net` (nodejs.org/api/net.html)
- Documentazione ufficiale Node.js: modulo `stream` (nodejs.org/api/stream.html)
- Documentazione ufficiale Node.js: modulo `tls` (nodejs.org/api/tls.html)
