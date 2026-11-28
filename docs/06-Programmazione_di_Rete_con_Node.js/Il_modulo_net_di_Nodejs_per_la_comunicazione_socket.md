# Il modulo `net` di Node.js per la comunicazione socket

Un client invia `PING` e poi `ECO caffè`. Il server dovrebbe rispondere prima `PONG` e poi `OK caffè`. Sul computer di sviluppo tutto sembra funzionare, finché un giorno il server registra un comando sconosciuto, `PI`, oppure riceve entrambi i comandi in un solo evento. Che cosa è cambiato?

Per capirlo costruiremo un servizio TCP con il modulo `node:net`, incluso in Node.js. Partiremo da un server di poche righe che funziona con qualsiasi suddivisione dei dati. Poi gli chiederemo qualcosa di più interessante: distinguere i comandi, elaborarli e restituire una risposta per ciascuno. È in questo passaggio che emerge la differenza tra trasportare byte e comunicare messaggi.

Oltre alle connessioni TCP, `node:net` supporta la comunicazione locale tra processi (IPC) tramite socket di dominio Unix o named pipe su Windows. Qui usiamo TCP per rendere lo stesso esempio eseguibile su Linux, Windows e macOS. Per i datagrammi UDP Node.js mette a disposizione `node:dgram`. Se i dati devono viaggiare cifrati su TCP, il modulo corrispondente è `node:tls`. [API di rete di Node.js](https://nodejs.org/api/net.html) · [Datagrammi UDP](https://nodejs.org/api/dgram.html) · [TLS](https://nodejs.org/api/tls.html)

## Dal processo in ascolto alla singola connessione

Un processo server apre un **socket di ascolto** su un indirizzo e una porta. Nel nostro laboratorio useremo `127.0.0.1:5050`, raggiungibile dalla stessa macchina tramite l’interfaccia di loopback. Un processo client chiede al sistema operativo di connettersi a quell’indirizzo. Di norma il sistema sceglie per il client una porta locale temporanea.

In Node.js i due ruoli hanno oggetti distinti. Un `net.Server` accetta le connessioni. Per ogni connessione accettata Node.js passa alla callback un nuovo `net.Socket`. Anche il client possiede un `net.Socket`. Ciascuno dei due estremi ha un lato leggibile e uno scrivibile, perciò entrambi possono inviare dati mentre ricevono quelli dell’altro. È il significato di *stream duplex*.

| Connessione vista dal server | Estremo locale | Estremo remoto | Stato da conservare |
| --- | --- | --- | --- |
| Client A | `127.0.0.1:5050` | `127.0.0.1:51840` | Comando parziale del client A |
| Client B | `127.0.0.1:5050` | `127.0.0.1:51841` | Comando parziale del client B |

Le porte remote sono illustrative. Il server può usare la stessa porta locale per entrambe le conversazioni perché TCP distingue le connessioni attraverso la coppia di estremi. Se A invia mezzo comando e B ne invia uno intero, soltanto B deve ricevere subito una risposta. Un accumulatore globale mescolerebbe i due flussi.

L’attesa dell’I/O è asincrona. Mentre un client tace, l’event loop può servire gli altri. Una callback JavaScript che esegue un lungo calcolo sincrono occupa invece il thread su cui devono girare anche le callback delle altre connessioni. Accettare cento socket e poter svolgere cento calcoli in parallelo sono due proprietà distinte. [Documentazione di `node:net`](https://nodejs.org/api/net.html)

## Il primo esperimento con un server echo

Salviamo questo file come `echo.mjs`. L’estensione `.mjs` abilita i moduli ECMAScript senza richiedere un `package.json`. Per tutti gli esempi bastano Node.js e due terminali.

```js
import net from 'node:net';

const server = net.createServer((socket) => {
  socket.on('error', (err) => console.error('Connessione:', err.message));
  socket.pipe(socket);
});

server.on('error', (err) => {
  console.error('Server:', err.message);
  process.exitCode = 1;
});
server.listen(5050, '127.0.0.1', () => console.log('Echo in ascolto sulla porta 5050'));
```

Avviamo `node echo.mjs`. In un secondo terminale con Netcat disponibile, eseguiamo `nc 127.0.0.1 5050`, scriviamo `ciao` e premiamo Invio. La riga digitata nel terminale può apparire due volte: una è l’eco locale della tastiera, l’altra è il dato restituito dal server. Il client Node.js che costruiremo più avanti permette di eseguire il laboratorio anche senza Netcat.

`socket.pipe(socket)` collega il lato leggibile del socket al suo lato scrivibile. I byte arrivati dal client ripartono verso il client. Non si crea un ciclo locale, perché i due lati rappresentano direzioni opposte della connessione. Se `ciao` arriva come `ci` e `ao`, rimandare indietro i due frammenti produce comunque `ciao`. Questa proprietà rende l’echo un buon primo esempio, ma nasconde un problema che compare appena cerchiamo di interpretare i dati. [Stream e `pipe()`](https://nodejs.org/api/stream.html#readablepipedestination-options)

## Perché un evento `data` può contenere mezzo comando

TCP offre all’applicazione un **flusso ordinato di byte**. Il mittente può eseguire due `write()`, il sistema operativo può distribuire i byte in più segmenti TCP e il destinatario può ricevere un numero ancora diverso di eventi `data`. Un *chunk* è il blocco consegnato in una lettura dello stream. La sua dimensione dipende da quali dati sono disponibili e da come vengono letti. [RFC 9293, § 2.2](https://www.rfc-editor.org/rfc/rfc9293.html#section-2.2)

Supponiamo che il flusso contenga `PING\nECO caffè\n`, dove `\n` indica un singolo byte LF, esadecimale `0A`. Ecco una suddivisione possibile.

| Lettura | Byte ricevuti in esadecimale | Righe che il server può elaborare | Byte conservati dopo la lettura |
| --- | --- | --- | --- |
| 1 | `50 49` | Nessuna | `PI` |
| 2 | `4E 47 0A 45 43 4F 20 63 61 66 66 C3` | `PING` | `ECO caff` più il byte `C3` |
| 3 | `A8 0A` | `ECO caffè` | Nessuno |

La seconda lettura termina a metà della `è`, codificata in UTF-8 con i byte `C3 A8`. Convertire ogni `Buffer` separatamente con `chunk.toString('utf8')` può introdurre caratteri sostitutivi. Ci sono due soluzioni pratiche. `socket.setEncoding('utf8')` usa un decodificatore che conserva le sequenze multibyte incomplete tra letture successive, dopodiché occorre ancora cercare i delimitatori nel testo. In alternativa si cercano i byte LF nei `Buffer` e si decodifica una riga solo quando è completa. Useremo questa seconda tecnica per applicare un limite espresso in byte. Il byte `0A` non può comparire all’interno di una sequenza UTF-8 multibyte. [Decodifica degli stream leggibili](https://nodejs.org/api/stream.html#readablesetencodingencoding)

### Come scegliere il confine di un messaggio

La regola con cui si individua il confine di un messaggio si chiama *framing*. La scelta dipende dal contenuto e da quante richieste vogliamo scambiare sulla stessa connessione.

| Strategia | Come legge il destinatario | Quando è adatta |
| --- | --- | --- |
| Delimitatore LF | Cerca `0A` e conserva i byte che seguono per la riga successiva | Comandi testuali. Gli a capo interni richiedono una convenzione di escape |
| Lunghezza prefissata | Legge, per esempio, 4 byte unsigned big-endian, verifica il limite, poi raccoglie esattamente quel numero di byte | Messaggi binari, immagini, JSON con formattazione su più righe |
| Dimensione fissa | Accumula esattamente *N* byte per record | Misure di sensori con formato e dimensione costanti |
| Fine del flusso | Legge fino all’EOF della direzione di invio del mittente | Un singolo documento per direzione sulla connessione |

Anche l’intestazione di lunghezza può arrivare in più letture. Analogamente, chiamare `JSON.parse()` a ogni evento `data` funziona solo per coincidenza. JSON descrive il contenuto del messaggio. Per trasmettere più oggetti sulla stessa connessione serve anche una regola che li separi, per esempio un oggetto JSON compatto per riga.

## Un protocollo per interrogare il server

Definiamo il comportamento prima di scrivere il codice. Ogni richiesta e ogni risposta è una riga UTF-8 terminata da LF. Il contenuto può occupare al massimo **1.024 byte**, escluso LF. I comandi distinguono maiuscole e minuscole. Il server risponde nello stesso ordine in cui riceve le richieste.

| Richiesta | Risposta | Significato |
| --- | --- | --- |
| `PING` | `PONG` | Verifica che il programma remoto abbia elaborato la richiesta |
| `ECO caffè` | `OK caffè` | Restituisce il testo dopo il primo spazio, conservando gli eventuali spazi successivi |
| `ECO ` | `OK ` | Accetta anche un testo vuoto |
| Altra riga, compresa una riga vuota | `ERR comando sconosciuto` | Il client può continuare sulla stessa connessione |

Una riga troppo lunga, una codifica UTF-8 malformata o una fine del flusso a metà riga fanno terminare la sessione. In questi casi il protocollo non promette una risposta. Per semplicità il delimitatore è soltanto LF. Un client che invia `PING\r\n` lascia un carattere `\r` nel comando e riceve `ERR comando sconosciuto`.

### 1. Il lettore di righe condiviso

Salviamo `righe.mjs` nella cartella del laboratorio. `leggiRighe()` è un **generatore asincrono**: riceve blocchi di byte da una sorgente e produce una stringa per ogni riga completa. La sorgente può essere un socket o, durante una prova, una sequenza di `Buffer` preparati da noi.

```js
export async function* leggiRighe(sorgente) {
  const riga = Buffer.alloc(1024);
  const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
  let usati = 0;

  for await (const blocco of sorgente) {
    let inizio = 0;
    while (inizio < blocco.length) {
      const lf = blocco.indexOf(0x0a, inizio);
      const fine = lf === -1 ? blocco.length : lf;
      const quanti = fine - inizio;
      if (usati + quanti > riga.length) {
        throw new Error('Riga oltre il limite di 1024 byte');
      }
      blocco.copy(riga, usati, inizio, fine);
      usati += quanti;
      if (lf === -1) break;

      const testo = decoder.decode(riga.subarray(0, usati));
      usati = 0;
      inizio = lf + 1;
      yield testo;
    }
  }
  if (usati !== 0) throw new Error('Connessione terminata a metà riga');
}
```

A ogni LF il lettore consegna una riga e, quando il consumatore chiede la successiva, riparte dal byte immediatamente dopo il delimitatore. In assenza di LF conserva i byte già copiati per l’iterazione seguente. Il controllo avviene **prima** della copia, quindi anche una riga inviata un byte alla volta occupa al massimo 1.024 byte nell’accumulatore. `fatal: true` rende osservabili gli errori di codifica. La variabile `usati` appartiene alla singola invocazione del generatore: ogni connessione ha il proprio stato.

### 2. Il server TCP

Salviamo `server.mjs` accanto a `righe.mjs`. Fermiamo prima l’eventuale server echo con `Ctrl+C` per liberare la porta.

```js
import net from 'node:net';
import { leggiRighe } from './righe.mjs';

function rispondi(riga) {
  if (riga === 'PING') return 'PONG';
  if (riga.startsWith('ECO ')) return 'OK ' + riga.slice(4);
  return 'ERR comando sconosciuto';
}

async function gestisci(socket) {
  const peer = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`Connesso ${peer}`);
  socket.on('error', (err) => console.error(`${peer} — ${err.message}`));
  socket.setTimeout(30_000, () => socket.destroy(new Error('Timeout di inattività')));

  try {
    for await (const richiesta of leggiRighe(socket)) {
      const risposta = rispondi(richiesta) + '\n';
      await new Promise((resolve, reject) => {
        socket.write(risposta, (err) => err ? reject(err) : resolve());
      });
    }
    socket.end();
  } catch (err) {
    console.error(`Sessione ${peer} terminata: ${err.message}`);
    socket.destroy();
  }
}

const server = net.createServer({ allowHalfOpen: true }, gestisci);
server.on('error', (err) => {
  console.error(`Server: ${err.code ?? err.message}`);
  process.exitCode = 1;
});
server.listen(5050, '127.0.0.1', () => console.log('In ascolto su 127.0.0.1:5050'));
```

Il server attende la callback di ogni scrittura prima di elaborare la riga successiva dello stesso client. È una scelta semplice per un protocollo interattivo: limita le risposte accodate dall’applicazione e ne conserva l’ordine. Durante l’attesa le altre connessioni possono proseguire. La callback riguarda il completamento locale della scrittura. Per sapere che il programma remoto ha elaborato un comando serve una risposta applicativa, come `PONG`.

`allowHalfOpen: true` è intenzionale. Il client comunica che ha terminato le richieste chiudendo la propria direzione di invio. Il server può così completare le risposte, anche se la loro elaborazione richiede attese asincrone, e chiamare esplicitamente `socket.end()` quando ha finito. Con il valore predefinito `false`, Node.js avvia automaticamente la chiusura del lato scrivibile una volta terminato quello leggibile, dopo aver smaltito le scritture già accodate. [Socket e opzione `allowHalfOpen`](https://nodejs.org/api/net.html#netcreateserveroptions-connectionlistener)

### 3. Il client e la prima esecuzione

Salviamo `client.mjs`. Questo client invia tre comandi senza attendere ogni volta la risposta. Può associare le tre risposte alle tre richieste grazie alla regola d’ordine del protocollo.

```js
import net from 'node:net';
import { leggiRighe } from './righe.mjs';

const richieste = ['PING', 'ECO caffè', 'ORA'];
const socket = net.createConnection({ host: '127.0.0.1', port: 5050 });
socket.setTimeout(5000, () => socket.destroy(new Error('Timeout di inattività')));
socket.once('connect', () => socket.end(richieste.join('\n') + '\n'));

try {
  let ricevute = 0;
  for await (const risposta of leggiRighe(socket)) {
    if (ricevute === richieste.length) throw new Error('Risposta inattesa');
    console.log(`${richieste[ricevute]} → ${risposta}`);
    ricevute++;
  }
  if (ricevute !== richieste.length) throw new Error('Mancano una o più risposte');
} catch (err) {
  console.error(`Client: ${err.message}`);
  process.exitCode = 1;
} finally {
  socket.destroy();
}
```

Nel primo terminale eseguiamo `node server.mjs`. Quando compare `In ascolto su 127.0.0.1:5050`, eseguiamo `node client.mjs` nel secondo. L’output atteso del client è:

```text
PING → PONG
ECO caffè → OK caffè
ORA → ERR comando sconosciuto
```

Il client usa una sola chiamata a `end(dati)` per accodare l’intero testo e chiudere il proprio lato scrivibile. Continua a leggere fino alla fine delle risposte. Il server rimane in ascolto e una seconda esecuzione di `node client.mjs` apre una nuova connessione.

## Una prova ripetibile sui chunk, senza dipendere dalla rete

Aggiungere una pausa tra due `write()` può modificare ciò che osserviamo, ma il sistema operativo resta libero di aggregare i dati. Per verificare il lettore conviene controllare direttamente i confini dei `Buffer`. Questo piccolo test usa i byte della tabella iniziale. Salviamolo come `prova-chunk.mjs` ed eseguiamo `node prova-chunk.mjs`, anche a server spento.

```js
import assert from 'node:assert/strict';
import { leggiRighe } from './righe.mjs';

async function raccogli(blocchi) {
  const righe = [];
  for await (const riga of leggiRighe(blocchi)) righe.push(riga);
  return righe;
}

const dati = Buffer.from('PING\nECO caffè\n');
const attese = ['PING', 'ECO caffè'];

// Due comandi nello stesso chunk.
assert.deepEqual(await raccogli([dati]), attese);

// Tutti i possibili tagli in due chunk, incluso quello tra C3 e A8.
for (let i = 1; i < dati.length; i++) {
  assert.deepEqual(await raccogli([dati.subarray(0, i), dati.subarray(i)]), attese);
}

// Tre letture come nella tabella, quindi una lettura per singolo byte.
assert.deepEqual(await raccogli([dati.subarray(0, 2), dati.subarray(2, 14), dati.subarray(14)]), attese);
assert.deepEqual(await raccogli(Array.from(dati, byte => Buffer.from([byte]))), attese);

// Il comando incompleto a EOF e quello fuori misura devono fallire.
await assert.rejects(raccogli([Buffer.from('PING')]), /metà riga/);
await assert.rejects(raccogli([Buffer.alloc(1025, 65)]), /limite/);
console.log('Tutte le prove sui chunk sono passate.');
```

Il controllo più interessante è il ciclo sui tagli. Ogni iterazione altera il modo in cui l’applicazione riceve i byte, lasciando intatto il contenuto del flusso. L’output deve restare identico. È un criterio che si può riutilizzare anche per verificare un protocollo binario con intestazione di lunghezza.

## Leggere gli eventi nel punto giusto

Il client e il server usano `for await` per consumare lo stream. Un’alternativa è registrare un listener `socket.on('data', ...)`, che riceve normalmente un `Buffer`. Conviene scegliere una sola modalità di lettura per socket. Gli eventi restano particolarmente utili per osservare il ciclo di vita della connessione.

| Oggetto ed evento | Che cosa è successo | Uso tipico |
| --- | --- | --- |
| Server, `listening` | Il socket di ascolto è pronto | Segnalare che i client possono collegarsi |
| Server, `connection` | È stato accettato un client | Associare al nuovo socket il suo stato, come fa la callback di `createServer()` |
| Socket client, `connect` | La connessione TCP è stabilita | Inviare la prima richiesta |
| Socket, `data` | È disponibile un blocco di dati | Alimentare un lettore incrementale |
| Socket, `end` | Il peer ha concluso il proprio flusso in uscita | Verificare se rimane un messaggio incompleto |
| Socket, `timeout` | È trascorso l’intervallo di inattività configurato | Decidere se chiamare `end()` o `destroy()` |
| Socket, `error` | La connessione ha incontrato un errore | Registrare il codice e gestire la sessione coinvolta |
| Socket, `close` | Il socket è completamente chiuso | Rimuovere la sessione da un eventuale registro di client |

`socket.end()` completa ordinatamente la direzione di scrittura dopo i dati già accodati. `socket.destroy()` interrompe la connessione e può sacrificare dati in attesa. `server.close()` agisce invece sul socket di ascolto: smette di accettare nuovi client e completa la chiusura quando sono terminate le connessioni esistenti. Confondere questi tre metodi può trasformare il saluto a un singolo client nello spegnimento del servizio. [Eventi e metodi di `net.Server` e `net.Socket`](https://nodejs.org/api/net.html)

## Quando il destinatario legge lentamente

Immaginiamo di sostituire `PONG` con un file di diversi megabyte. Il disco può fornire dati più velocemente di quanto il destinatario riesca a leggerli. Un ciclo che chiama `socket.write()` senza controllarne il risultato può accumulare una coda in memoria. La **backpressure** è il meccanismo con cui lo stream segnala al produttore di rallentare.

Se `write(blocco)` restituisce `false`, il blocco è già stato accettato. Il produttore deve sospendere le scritture successive e riprenderle all’evento `drain`, gestendo anche un’eventuale chiusura o un errore durante l’attesa. Reinviare lo stesso blocco dopo `drain` duplicherebbe i dati. `writableLength` aiuta a osservare la quantità accodata localmente. `highWaterMark` è la soglia usata dallo stream per segnalare pressione e può essere superata. [Buffering e backpressure negli stream Node.js](https://nodejs.org/api/stream.html#buffering)

Nel server dei comandi scegliamo di attendere la callback di ciascuna scrittura. Per un trasferimento continuo è più naturale collegare sorgente e destinazione con `pipeline()`. Per esempio, in un servizio dedicato che invia un file per connessione, il corpo del gestore può usare il frammento seguente. La fine del file delimita l’intera risposta e `pipeline()` gestisce il ritmo di lettura e scrittura.

```js
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';

async function inviaDocumento(socket, percorso) {
  try {
    await pipeline(createReadStream(percorso), socket);
  } catch (err) {
    console.error('Invio interrotto:', err.message);
  }
}
```

Per impostazione predefinita, al termine della sorgente `pipeline()` chiude il lato scrivibile della destinazione. Per questo il frammento è adatto a un servizio che esaurisce la risposta con quel file. Un protocollo che deve continuare sulla stessa connessione dovrà anche specificare dove termina il file e dove ricominciano i comandi. [API `stream.pipeline()`](https://nodejs.org/api/stream.html#streams-promises-api)

## Diagnosi in laboratorio

| Sintomo | Cosa verificare |
| --- | --- |
| Il server segnala `EADDRINUSE` | Un altro processo sta già ascoltando su quell’indirizzo e porta. Controllare se `echo.mjs` è ancora attivo |
| Il client segnala `ECONNREFUSED` | Controllare il messaggio `In ascolto`, l’indirizzo e la porta. In una VM `127.0.0.1` indica la VM stessa |
| La connessione è aperta ma la risposta tarda | Verificare la presenza di LF. Dopo `PING` senza LF il server attende legittimamente il resto della riga |
| Si riceve `ERR` digitando `PING` con un altro client | Controllare se il client aggiunge CRLF e confrontare i byte con la specifica del protocollo |
| Un client si disconnette durante l’invio | Gestire l’errore sul socket interessato. Un reset può comparire come `ECONNRESET`, una scrittura su una connessione interrotta come `EPIPE` |

`setTimeout(30_000)` osserva l’**inattività**. Il nostro server chiude il socket perché lo richiede la callback registrata. Un client che invia periodicamente pochi byte può tenere aperta una richiesta più a lungo di 30 secondi. Se il requisito è «ogni comando deve essere completato in 30 secondi dal primo byte», occorre un timer applicativo distinto, avviato all’inizio della riga e cancellato al delimitatore. [Timeout dei socket](https://nodejs.org/api/net.html#socketsettimeouttimeout-callback)

Per interpretare i log conviene annotare separatamente le dimensioni dei blocchi ricevuti e il numero delle richieste completate. `socket.bytesRead` e `socket.bytesWritten` sono contatori di byte della connessione. Per contare i comandi del nostro servizio il punto corretto è il ciclo che riceve le righe da `leggiRighe()`.

## Tre estensioni per il laboratorio

1. **Aggiungere `LUNGHEZZA testo`.** Rispondere con il numero di byte UTF-8 usando `Buffer.byteLength(testo, 'utf8')`. Con `caffè` la risposta attesa è `6`. Spiegare perché `testo.length` restituisce invece `5`, poi confrontare i due conteggi con un’emoji.
2. **Servire due client contemporaneamente.** Il client A invia `PI` e rimane collegato. Il client B invia `PING\n` e deve ricevere subito `PONG\n`. Infine A invia `NG\n` e ottiene la propria risposta. Spiegare perché il test fallirebbe se `usati` e `riga` fossero condivisi fra tutte le connessioni.
3. **Trasmettere messaggi binari.** Sostituire LF con un prefisso di 4 byte in ordine di rete. Fissare un limite al payload prima di allocare memoria. Verificare tre casi: intestazione spezzata, due messaggi nello stesso blocco e un payload che contiene il byte `0A`. Il destinatario deve restituire gli stessi payload per ogni suddivisione.

Il primo server poteva ignorare i confini perché l’echo doveva soltanto restituire i byte ricevuti. Il secondo può interpretare `PING`, rispondere a più richieste e diagnosticare un comando troncato perché client e server condividono regole precise su **dove finisce una richiesta**, **quale risposta le corrisponde** e **quando termina la conversazione**. Sono queste regole a trasformare un socket TCP in un servizio utilizzabile da programmi diversi.
