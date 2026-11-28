# Socket UDP in Node.js con il modulo dgram

*Datagrammi, affidabilità fai-da-te, broadcast e multicast: tutto ciò che serve per comunicare senza connessione, con esempi, best practice, esercizi e quiz di autovalutazione.*

## 1. Introduzione

Non sempre serve una connessione affidabile. Per un DNS, un sistema di metriche, un gioco in tempo reale, un flusso audio/video o la ricerca automatica di dispositivi in rete, la **velocità** e la **semplicità** contano più della garanzia di consegna. Per questi casi esiste **UDP** (*User Datagram Protocol*), e in Node.js si usa con il modulo **`node:dgram`**.

A differenza di `net` (che gestisce TCP e IPC), `dgram` non ha server e client in senso stretto, né connessioni: esiste un solo tipo di oggetto, il **socket UDP**, che invia e riceve **datagrammi**.

In questo capitolo vedremo:

- le caratteristiche di UDP e le differenze rispetto a TCP;
- creazione di socket, eventi e metodi del modulo `dgram`;
- dimensione dei datagrammi, MTU e frammentazione;
- come costruire affidabilità sopra UDP (identificativi, timeout, ritrasmissioni, numeri di sequenza);
- broadcast e multicast, con esempi di *service discovery*;
- sicurezza, buffer e perdita di pacchetti, test automatici;
- best practice, tips and tricks, esercizi e quiz con risposte.

**Prerequisiti**: JavaScript moderno, eventi di Node.js, `Buffer`, nozioni di indirizzo IP e porta. Per TCP e il modulo `net` si veda il capitolo gemello. Gli esempi usano i moduli ES e funzionano con le versioni LTS recenti di Node.js.

## 2. UDP in breve

UDP è un protocollo di trasporto **senza connessione**: non c’è handshake e il mittente invia il datagramma senza sapere se qualcuno lo riceverà.

**Cosa offre UDP**

- **Confini dei messaggi preservati**: un `send()` è un datagramma, e il ricevente ottiene un evento `message` per ciascun datagramma intero. Il problema del *framing* di TCP qui non esiste.
- **Bassa latenza e basso overhead**: intestazione di soli 8 byte, nessun handshake, nessuna ritrasmissione automatica.
- **Un controllo di integrità** (checksum): un datagramma corrotto viene scartato.
- **Broadcast e multicast**: uno-a-molti, impossibile con TCP.

**Cosa NON offre UDP**

- **Consegna garantita**: i datagrammi possono andare persi senza alcun avviso.
- **Ordine**: possono arrivare in ordine diverso da quello di invio.
- **Assenza di duplicati**: lo stesso datagramma può arrivare due volte.
- **Controllo di flusso e di congestione**: se invii troppo e in fretta, lo perdi tu.
- **Connessione**: non c’è un evento di apertura o di chiusura, e nulla ti avvisa se il peer scompare.

**Confronto rapido con TCP**

- TCP: flusso di byte, affidabile, ordinato, con connessione → web, posta, database, SSH.
- UDP: datagrammi, best effort, senza connessione → DNS, NTP, streaming, giochi, VoIP, syslog, StatsD, discovery.

> Non “UDP è più veloce di TCP”, ma **UDP ti lascia decidere** quali garanzie ti servono davvero. Se ti servono tutte, probabilmente TCP è la scelta giusta.

## 3. Il modulo dgram

Si crea un socket con `dgram.createSocket()`:

```js
const dgram = require('node:dgram');

const socket = dgram.createSocket('udp4');            // IPv4
const socket6 = dgram.createSocket('udp6');           // IPv6
const custom = dgram.createSocket({ type: 'udp4', reuseAddr: true });
```

Opzioni dell’oggetto: `type` (`'udp4'` o `'udp6'`), `reuseAddr` (consente a più socket di associarsi alla stessa porta, necessario per il multicast sullo stesso host), `ipv6Only`, `recvBufferSize`, `sendBufferSize`, `lookup`, `signal`.

**Eventi**

- **`listening`**: il socket è associato a un indirizzo e una porta (dopo `bind()`).
- **`message`**: è arrivato un datagramma. Argomenti: `(msg, rinfo)`.
- **`error`**: errore; senza gestore termina il processo.
- **`close`**: il socket è stato chiuso con `close()`.
- **`connect`**: dopo `connect()` (vedi sezione 7).

**Metodi principali**

- **`bind([port][, address][, callback])`**: associa il socket a una porta locale per **ricevere**. Con `bind(0)` il sistema sceglie una porta libera.
- **`send(msg[, offset, length][, port][, address][, callback])`**: invia un datagramma. `msg` può essere una stringa, un `Buffer`, un `TypedArray`, un `DataView` o un **array** di questi (invio con raccolta di più parti, senza concatenarle a mano).
- **`address()`**: restituisce `{ address, family, port }` dell’associazione locale.
- **`close([callback])`**: chiude il socket.
- **`ref()` / `unref()`**: controllano se il socket tiene vivo il processo.

L’oggetto **`rinfo`** (*remote info*) passato a `message` contiene `address`, `family`, `port` e `size` (byte del datagramma) del mittente.

## 4. Il primo server: echo UDP

```js
// udp-echo-server.js
const dgram = require('node:dgram');

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.error('Errore:', err.message);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`${rinfo.address}:${rinfo.port} (${rinfo.size} byte): ${msg.toString().trim()}`);
  server.send(msg, rinfo.port, rinfo.address); // risponde al mittente
});

server.on('listening', () => {
  const a = server.address();
  console.log(`UDP in ascolto su ${a.address}:${a.port}`);
});

server.bind(41234);
```

Per provarlo, da un altro terminale:

```bash
echo 'ciao' | nc -u -w1 127.0.0.1 41234
```

Nota che non c’è un handler di connessione: il server riceve datagrammi da chiunque e **ogni risposta** va indirizzata esplicitamente con l’indirizzo e la porta presi da `rinfo`. Non esiste uno stato per client, a meno che tu non lo costruisca (ad esempio una `Map` con chiave `address:port`).

## 5. Il client UDP

```js
// udp-client.js
const dgram = require('node:dgram');

const client = dgram.createSocket('udp4');

client.on('message', (msg, rinfo) => {
  console.log(`Risposta da ${rinfo.address}:${rinfo.port}: ${msg}`);
  client.close();
});

client.on('error', (err) => {
  console.error(err.message);
  client.close();
});

client.send('Ciao UDP', 41234, '127.0.0.1', (err) => {
  if (err) {
    console.error('Invio fallito:', err.message);
    client.close();
  }
});
```

Punti importanti:

- Un client **non ha bisogno di `bind()`**: alla prima `send()` il sistema operativo lo associa automaticamente a una porta effimera e le risposte arrivano lì.
- La callback di `send()` ti dice solo che il datagramma è stato **consegnato al sistema operativo**, non che il destinatario l’abbia ricevuto. Con UDP non esiste un “ACK”: se ti serve, lo costruisci tu (sezione 8).
- Se passi un **nome host** al posto di un IP, ad ogni invio avviene una risoluzione DNS. Per invii frequenti usa direttamente l’indirizzo IP.
- Se un client non risponde più o il server non esiste, **non ricevi alcun errore**: il silenzio è la norma. Il timeout è sempre una tua responsabilità.

## 6. Dimensione dei datagrammi, MTU e frammentazione

Un datagramma UDP su IPv4 può contenere al massimo **65507 byte** di dati (65535 meno 20 byte dell’intestazione IP e 8 di quella UDP). Un invio più grande fallisce con errore `EMSGSIZE`. Ma il limite pratico è molto più basso, per via della **MTU** (*Maximum Transmission Unit*) della rete:

- su Ethernet la MTU è tipicamente **1500 byte**: il payload UDP che entra in un solo pacchetto è quindi di **1472 byte** (1500 − 20 − 8);
- un datagramma più grande viene **frammentato** a livello IP: se *uno solo* dei frammenti va perso, l’intero datagramma è perso, e la probabilità di perdita cresce con il numero dei frammenti;
- su Internet, tra VPN e tunnel, la MTU effettiva può essere inferiore: una scelta prudente è non superare circa **1200 byte** per datagramma.

**Regola pratica**: progetta messaggi piccoli. Se devi trasferire dati più grandi, spezzali tu in pezzi numerati e gestisci riordino e ritrasmissione, oppure usa TCP.

## 7. Socket connessi

UDP non ha connessioni, ma `socket.connect()` associa al socket **un peer predefinito**:
```js
const dgram = require('node:dgram');

const sock = dgram.createSocket('udp4');

sock.on('connect', () => {
  console.log('Peer:', sock.remoteAddress()); // { address, family, port }
  sock.send('ciao');                          // senza destinazione
});

sock.on('message', (msg) => console.log('Risposta:', msg.toString()));
sock.on('error', (err) => console.error(err.code)); // es. ECONNREFUSED

sock.connect(41234, '127.0.0.1');
```

Cosa cambia dopo `connect()`:

- `send()` va chiamata **senza** porta e indirizzo (altrimenti genera un errore);
- il socket **riceve solo** datagrammi provenienti da quel peer: gli altri vengono filtrati dal sistema operativo;
- se il peer risponde con un errore ICMP “porta irraggiungibile”, il sistema può segnalarlo come errore (ad esempio `ECONNREFUSED`) sul socket connesso. Con un socket non connesso questo non accade;
- `disconnect()` ripristina il comportamento iniziale.

I socket connessi sono utili nei client che parlano con un solo server: meno codice e filtro gratuito dei mittenti indesiderati.

## 8. Costruire affidabilità sopra UDP

Vediamo l’ingrediente base: un **request/response con identificativo, timeout e ritrasmissione con backoff**.

```js
// udp-reliable-client.js
const dgram = require('node:dgram');

let seq = 0;

function request(socket, port, host, data, { retries = 3, timeoutMs = 300 } = {}) {
  const id = ++seq;
  const packet = Buffer.from(JSON.stringify({ id, data }));

  return new Promise((resolve, reject) => {
    let attempt = 0;
    let timer;

    const onMessage = (msg) => {
      let reply;
      try { reply = JSON.parse(msg.toString()); } catch { return; }
      if (reply.id !== id) return;          // risposta di un’altra richiesta
      cleanup();
      resolve(reply);
    };
    const cleanup = () => {
      clearTimeout(timer);
      socket.off('message', onMessage);
    };
    const trySend = () => {
      if (attempt++ > retries) {
        cleanup();
        return reject(new Error('Timeout: nessuna risposta'));
      }
      socket.send(packet, port, host);
      timer = setTimeout(trySend, timeoutMs * 2 ** (attempt - 1));
    };

    socket.on('message', onMessage);
    trySend();
  });
}

const sock = dgram.createSocket('udp4');
try {
  console.log(await request(sock, 41234, '127.0.0.1', 'ciao'));
} catch (err) {
  console.error(err.message);
} finally {
  sock.close();
}
```

Il server corrispondente restituisce lo stesso `id`:

```js
// udp-reliable-server.js
const dgram = require('node:dgram');

const server = dgram.createSocket('udp4');
server.on('message', (msg, rinfo) => {
  let req;
  try { req = JSON.parse(msg.toString()); } catch { return; }
  const reply = Buffer.from(JSON.stringify({ id: req.id, result: String(req.data).toUpperCase() }));
  server.send(reply, rinfo.port, rinfo.address);
});
server.bind(41234);
```

**Cosa c’è e cosa manca**

- L’`id` associa ogni risposta alla sua richiesta e consente di ignorare risposte tardive.
- Il **backoff esponenziale** (300, 600, 1200 ms…) evita di sommergere una rete già in difficoltà.
- Se a perdersi è la *risposta*, il server riceverà la richiesta **più volte**: le operazioni devono essere **idempotenti**, oppure il server deve ricordare gli `id` recenti (con una piccola cache a scadenza) e rispondere con il risultato memorizzato.
- Un protocollo reale aggiungerebbe un limite alla dimensione dei messaggi e la validazione dei campi.

### Intestazione binaria con numero di sequenza

Per i flussi di dati (posizioni in un gioco, campioni di un sensore) si usa spesso un’intestazione fissa con numero di sequenza, che permette di scartare duplicati e pacchetti in ritardo e di misurare le perdite.

```js
// Intestazione di 8 byte: magic(1) versione(1) tipo(1) flags(1) seq(4)
const MAGIC = 0xd7;
const VERSION = 1;
const HEADER_SIZE = 8;

export function encode(type, seq, payload = Buffer.alloc(0)) {
  const header = Buffer.alloc(HEADER_SIZE);
  header.writeUInt8(MAGIC, 0);
  header.writeUInt8(VERSION, 1);
  header.writeUInt8(type, 2);
  header.writeUInt8(0, 3);
  header.writeUInt32BE(seq >>> 0, 4);
  return Buffer.concat([header, payload]);
}

export function decode(msg) {
  if (msg.length < HEADER_SIZE || msg[0] !== MAGIC || msg[1] !== VERSION) return null;
  return { type: msg[2], seq: msg.readUInt32BE(4), payload: msg.subarray(HEADER_SIZE) };
}

// Ricevitore: scarta duplicati e pacchetti in ritardo, segnala le perdite
let lastSeq = -1;
server.on('message', (msg) => {
  const pkt = decode(msg);
  if (!pkt) return;                      // non è un nostro pacchetto
  if (pkt.seq <= lastSeq) return;        // duplicato o in ritardo
  if (pkt.seq > lastSeq + 1) console.log(`Persi ${pkt.seq - lastSeq - 1} pacchetti`);
  lastSeq = pkt.seq;
  // ... elabora pkt.payload
});
```

In un caso reale conserva lo stato **per mittente** (chiave `address:port`) e gestisci il superamento del massimo del contatore a 32 bit. Il campo `magic` e la versione permettono di scartare subito il traffico estraneo e di far evolvere il protocollo.

## 9. Esempio pratico: collettore di metriche (stile StatsD)

I sistemi di monitoraggio usano UDP perché l’applicazione può inviare una metrica in modalità *fire-and-forget*: se il collettore è lento o assente, l’applicazione non ne risente.

```js
// metrics-collector.js
const dgram = require('node:dgram');

const counters = new Map();
const server = dgram.createSocket('udp4');

server.on('message', (msg) => {
  for (const line of msg.toString().split('\n')) {
    const m = /^([\w.]+):(\d+)\|c$/.exec(line.trim()); // nome:valore|c
    if (!m) continue;                                // ignora righe non valide
    counters.set(m[1], (counters.get(m[1]) ?? 0) + Number(m[2]));
  }
});

setInterval(() => {
  for (const [name, value] of counters) console.log(`${name} = ${value}`);
  counters.clear();
}, 10_000);

server.bind(8125, '127.0.0.1');
```

```js
// invio di una metrica dall’applicazione
const s = dgram.createSocket('udp4');
s.send('pagine.viste:1|c', 8125, '127.0.0.1', () => s.close());
```

Da shell: `echo 'login:1|c' | nc -u -w0 127.0.0.1 8125`. Osserva come il formato sia a righe e come ogni riga non valida venga semplicemente ignorata: *“sii liberale in ciò che accetti, ma non fidarti di nulla”*.

## 10. Broadcast e service discovery

Il **broadcast** invia un datagramma a *tutti* gli host della rete locale. È il meccanismo con cui un client scopre i servizi disponibili senza conoscerne l’indirizzo.

```js
// discovery-server.js: risponde alle richieste di ricerca
const dgram = require('node:dgram');

const sock = dgram.createSocket({ type: 'udp4', reuseAddr: true });
sock.on('message', (msg, rinfo) => {
  if (msg.toString() === 'DISCOVER') {
    sock.send('SERVICE:miaapp:3000', rinfo.port, rinfo.address);
  }
});
sock.bind(41235);
```

```js
// discovery-client.js: cerca i servizi sulla rete locale
const dgram = require('node:dgram');

const c = dgram.createSocket('udp4');
c.on('message', (msg, rinfo) => console.log(`Trovato: ${msg} da ${rinfo.address}`));
c.bind(0, () => {
  c.setBroadcast(true); // obbligatorio per inviare in broadcast
  c.send('DISCOVER', 41235, '255.255.255.255');
});
setTimeout(() => c.close(), 2000);
```

Punti da ricordare:

- per inviare in broadcast **bisogna** chiamare `setBroadcast(true)` su un socket già associato, altrimenti l’invio fallisce;
- il broadcast è limitato alla **rete locale**: i router non lo inoltrano;
- l’indirizzo `255.255.255.255` è il *limited broadcast*; si può usare anche l’indirizzo di broadcast della sottorete (ad esempio `192.168.1.255`);
- il broadcast esiste solo in IPv4: in IPv6 si usa il multicast.

## 11. Multicast

Con il **multicast** il mittente invia a un **gruppo** (un indirizzo nell’intervallo `224.0.0.0`–`239.255.255.255`) e lo ricevono solo gli host che si sono iscritti. È più efficiente del broadcast e può attraversare i router configurati per inoltrarlo.

```js
// multicast-receiver.js
const dgram = require('node:dgram');

const GROUP = '239.255.10.10';
const PORT = 5007;

const rx = dgram.createSocket({ type: 'udp4', reuseAddr: true });
rx.on('message', (msg, rinfo) => console.log(`${rinfo.address}: ${msg}`));
rx.bind(PORT, () => rx.addMembership(GROUP)); // iscrizione al gruppo

process.on('SIGINT', () => {
  rx.dropMembership(GROUP);
  rx.close();
});
```

```js
// multicast-sender.js
const dgram = require('node:dgram');

const GROUP = '239.255.10.10';
const PORT = 5007;

const tx = dgram.createSocket('udp4');
tx.bind(0, () => {
  tx.setMulticastTTL(1); // 1 = non esce dalla rete locale
  setInterval(() => tx.send(`ora: ${new Date().toISOString()}`, PORT, GROUP), 1000);
});
```

I metodi chiave:

- `addMembership(group[, interface])` e `dropMembership(...)`: iscrizione e disiscrizione dal gruppo;
- `setMulticastTTL(n)`: quanti router il pacchetto può attraversare;
- `setMulticastLoopback(bool)`: se il mittente riceve anche i propri pacchetti sullo stesso host;
- `setMulticastInterface(addr)`: sceglie l’interfaccia di uscita su macchine con più schede di rete;
- `reuseAddr: true` permette a più ricevitori sullo **stesso host** di usare la stessa porta, utile nei test.

> **Attenzione ai container**: sulle reti *bridge* di Docker broadcast e multicast generalmente non attraversano il confine tra container e rete fisica. Per provarli usa macchine diverse oppure la modalità di rete dell’host (`--network host` su Linux).

## 12. Buffer di ricezione e perdita di pacchetti

I datagrammi in arrivo vengono accodati dal sistema operativo in un **buffer di ricezione** di dimensione limitata. Se la tua applicazione non li legge abbastanza in fretta (event loop impegnato, elaborazione lenta), il buffer si riempie e i datagrammi successivi vengono **scartati silenziosamente**.

```js
const server = dgram.createSocket({ type: 'udp4', recvBufferSize: 4 * 1024 * 1024 });
// oppure, dopo il bind:
// server.setRecvBufferSize(4 * 1024 * 1024);
server.on('listening', () => {
  console.log('Buffer di ricezione:', server.getRecvBufferSize());
});
```

**Come ridurre le perdite**

- mantieni **leggero** il gestore di `message`: accoda il lavoro pesante e rispondi dopo;
- **limita** la lunghezza della coda interna, scartando volutamente i dati vecchi quando serve (in tempo reale, spesso conviene il dato più recente);
- aumenta il buffer con `recvBufferSize` / `setRecvBufferSize()`: il sistema operativo può comunque imporre un tetto (su Linux, `net.core.rmem_max`);
- sul lato invio, evita raffiche: regola il ritmo (*pacing*) dei pacchetti;
- **misura** le perdite: su Linux `netstat -su` mostra gli errori di ricezione dovuti al buffer pieno; nei tuoi protocolli i numeri di sequenza ti dicono quanto perdi.

## 13. Sicurezza

L’assenza di handshake rende UDP particolarmente esposto:

- **Indirizzo del mittente falsificabile (*spoofing*)**: il campo `rinfo.address` non è una prova di identità. Non usarlo da solo per autenticare nessuno.
- **Attacchi di amplificazione e riflessione**: un server che risponde a una piccola richiesta con una risposta molto più grande può essere sfruttato per colpire una vittima il cui indirizzo è stato falsificato. Regola: **la risposta non deve essere sensibilmente più grande della richiesta**, a meno che il richiedente non sia verificato (ad esempio con un *cookie* o un token restituito in una fase precedente).
- **Flood**: limita la frequenza delle richieste per indirizzo e scarta velocemente il traffico non valido (magic, versione, lunghezza).
- **Validazione**: ogni campo di ogni datagramma va controllato, esattamente come per qualsiasi input non fidato.
- **Riservatezza e integrità**: Node.js non offre DTLS nativo. Se servono cifratura e autenticazione puoi aggiungere una firma HMAC o la cifratura autenticata dei messaggi con `node:crypto`, oppure far passare il traffico in un tunnel (ad esempio una VPN), oppure scegliere TCP con TLS.
- **Esposizione**: ascolta su `127.0.0.1` finché sviluppi, e metti i servizi UDP pubblici dietro firewall con regole restrittive.

## 14. Test automatici con node:test

Su loopback il comportamento è praticamente affidabile, ma nei test aggiungi sempre un timeout, perché un datagramma perso farebbe restare il test in attesa per sempre.

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const dgram = require('node:dgram');
const { once } = require('node:events');

test('il server UDP risponde', { timeout: 3000 }, async () => {
  const server = dgram.createSocket('udp4');
  server.on('message', (msg, rinfo) => server.send(msg, rinfo.port, rinfo.address));
  server.bind(0, '127.0.0.1');   // porta scelta dal sistema
  await once(server, 'listening');

  const client = dgram.createSocket('udp4');
  client.send('ciao', server.address().port, '127.0.0.1');
  const [msg] = await once(client, 'message');
  assert.equal(msg.toString(), 'ciao');

  client.close();
  server.close();
});
```

## 15. Best practice

- **Parti da questa domanda**: mi servono davvero consegna, ordine e assenza di duplicati? Se sì, valuta TCP.
- **Gestore `'error'` su ogni socket**: senza, un errore termina il processo.
- **Messaggi piccoli**: resta sotto la MTU (circa 1200 byte come scelta prudente su Internet).
- **Progetta per la perdita**: timeout, ritrasmissioni con backoff e operazioni idempotenti.
- **Intestazione con magic, versione e sequenza** nei protocolli binari.
- **Valida tutto** e scarta in fretta i datagrammi non conformi.
- **Non fidarti di `rinfo.address`** per autenticare; limita l’amplificazione.
- **Tieni leggero il gestore `message`** e dimensiona il buffer di ricezione.
- **Chiudi i socket** con `close()` quando non servono più, oppure usa `unref()`.
- **Documenta il protocollo**: formato dei messaggi, dimensioni massime, regole di ritrasmissione.

## 16. Tips and tricks

- **`nc -u`** per provare: `nc -u -l 41234` (ricevere) e `nc -u 127.0.0.1 41234` (inviare).
- **Ispezione dei pacchetti**: `sudo tcpdump -i lo -n -A udp port 41234` mostra i datagrammi su loopback; Wireshark per un’analisi completa.
- **Chi ascolta**: `ss -ulnp` elenca i socket UDP in ascolto sul sistema.
- **Array di buffer**: `socket.send([header, body], port, host)` evita di concatenare a mano.
- **Porta casuale**: `bind(0)` e `address().port` nei test.
- **Client senza `bind()`**: l’associazione automatica alla prima `send()` basta nella maggior parte dei casi.
- **Dual stack**: un socket `udp6` può gestire anche IPv4 (indirizzi mappati), mentre `udp4` non parla IPv6.
- **`NODE_DEBUG=dgram node app.js`** mostra il traffico interno del modulo.

## 17. Proposte di esercizi

1. **Echo UDP in maiuscolo**: il server restituisce il testo in maiuscolo; il client attende al massimo 2 secondi e poi segnala il timeout.
2. **Ping/pong con RTT**: il client invia un numero di sequenza e il server lo rimanda indietro; calcola il tempo di andata e ritorno medio e la percentuale di pacchetti persi su 100 invii.
3. **Simulatore di perdita**: nel server scarta casualmente il 20% dei datagrammi in arrivo e verifica che il client con ritrasmissioni (sezione 8) funzioni comunque.
4. **Collettore di metriche**: estendi l’esempio con metriche di tipo `|g` (gauge) e `|ms` (tempi), calcolando media, minimo e massimo ogni 10 secondi.
5. **Trasferimento file su UDP**: dividi un file in pezzi da 1000 byte con numero di sequenza, invia con conferme (stop-and-wait) e ricostruisci il file; verifica con l’hash SHA-256.
6. **Discovery di servizi**: implementa il broadcast di ricerca dell’articolo e fai rispondere più servizi con nome, porta e versione in JSON.
7. **Chat multicast**: realizza una chat di gruppo in cui ogni messaggio è inviato al gruppo multicast, con nickname e ora.
8. **Riordino**: il mittente invia 50 pacchetti numerati e il ricevente li rimette in ordine e segnala quelli mancanti, usando una piccola finestra di riordino.
9. **Server DNS minimale**: leggi la struttura di una richiesta DNS (RFC 1035) e rispondi a una query di tipo A con un indirizzo fisso, verificando con `dig @127.0.0.1`.
10. **TCP o UDP?** Per ogni scenario (ordine di acquisto, chat, telemetria, videochiamata, trasferimento backup) motiva la scelta del protocollo di trasporto.

## 18. Quiz di autovalutazione

**Domanda 1.** Quale affermazione su UDP è corretta?

- A) Garantisce la consegna e l’ordine dei datagrammi
- B) Preserva i confini dei messaggi ma non garantisce consegna, ordine e assenza di duplicati
- C) Richiede sempre un handshake a tre vie
- D) Trasporta un flusso continuo di byte senza confini

**Domanda 2.** Quale istruzione crea un socket UDP IPv4 in Node.js?

- A) `net.createSocket('udp4')`
- B) `dgram.createSocket('udp4')`
- C) `dgram.createServer('udp4')`
- D) `net.createUdp()`

**Domanda 3.** Quali argomenti riceve l’evento `'message'`?

- A) `(socket)`
- B) `(data)`
- C) `(msg, rinfo)`
- D) `(err, msg)`

**Domanda 4.** Cosa significa che la callback di `socket.send()` viene eseguita senza errore?

- A) Il destinatario ha ricevuto e letto il datagramma
- B) Il datagramma è stato consegnato al sistema operativo per l’invio, senza alcuna garanzia sul destinatario
- C) Il destinatario ha inviato una conferma
- D) Il datagramma è stato memorizzato nel server

**Domanda 5.** Qual è la dimensione massima del payload di un datagramma UDP su IPv4?

- A) 1500 byte
- B) 1472 byte
- C) 65507 byte
- D) 65535 byte

**Domanda 6.** Cosa accade dopo `socket.connect(porta, indirizzo)` su un socket UDP?

- A) Viene eseguito un handshake con il peer
- B) Il socket ha un peer predefinito: `send()` si usa senza destinazione e si ricevono solo datagrammi da quel peer
- C) Il socket diventa affidabile
- D) Il socket non può più ricevere dati

**Domanda 7.** Cosa occorre fare prima di inviare un datagramma in broadcast?

- A) Chiamare `socket.setBroadcast(true)` su un socket associato
- B) Chiamare `socket.addMembership()`
- C) Usare il tipo `udp6`
- D) Impostare la porta a 0

**Domanda 8.** Come ci si iscrive a un gruppo multicast?

- A) Con `socket.connect(gruppo)`
- B) Con `socket.setBroadcast(gruppo)`
- C) Con `socket.addMembership(gruppo)` dopo il `bind()`, usando `reuseAddr` se più ricevitori condividono la porta sullo stesso host
- D) Con `socket.listen(gruppo)`

**Domanda 9.** Perché un server UDP non dovrebbe rispondere a una piccola richiesta con una risposta molto più grande verso un mittente non verificato?

- A) Perché UDP non supporta risposte grandi
- B) Perché può essere usato per attacchi di amplificazione e riflessione, dato che l’indirizzo del mittente può essere falsificato
- C) Perché Node.js blocca le risposte grandi
- D) Perché il socket si chiuderebbe

**Domanda 10.** Cosa può accadere se il gestore dell’evento `'message'` è troppo lento?

- A) Il sistema operativo mette in pausa il mittente
- B) Il buffer di ricezione si riempie e i datagrammi successivi vengono scartati silenziosamente
- C) Node.js ritrasmette automaticamente i datagrammi
- D) Il socket si chiude con un errore

## 19. Risposte al quiz

1. **B** – UDP preserva i confini dei messaggi (un `send()` è un datagramma) ma non garantisce consegna, ordine e assenza di duplicati.
2. **B** – `dgram.createSocket('udp4')`: il modulo `dgram` ha un solo tipo di socket, senza distinzione tra server e client.
3. **C** – `(msg, rinfo)`: il contenuto del datagramma e le informazioni sul mittente (`address`, `family`, `port`, `size`).
4. **B** – Significa solo che il datagramma è stato consegnato al sistema operativo: con UDP non esiste alcuna conferma di ricezione.
5. **C** – 65507 byte su IPv4 (65535 meno 20 byte IP e 8 byte UDP). Il valore pratico per evitare la frammentazione su Ethernet è però 1472 byte.
6. **B** – `connect()` associa un peer predefinito: `send()` si usa senza destinazione e il socket riceve solo i datagrammi provenienti da quel peer. Non c’è alcun handshake.
7. **A** – Occorre chiamare `socket.setBroadcast(true)` su un socket già associato, altrimenti l’invio in broadcast fallisce.
8. **C** – Si usa `socket.addMembership(gruppo)` dopo il `bind()`, con `reuseAddr: true` se più ricevitori sullo stesso host condividono la porta.
9. **B** – L’indirizzo del mittente può essere falsificato: una risposta molto più grande della richiesta consente attacchi di amplificazione e riflessione verso la vittima.
10. **B** – Il buffer di ricezione del sistema operativo si riempie e i datagrammi successivi vengono scartati senza alcun avviso.

## 20. Conclusioni

UDP è un protocollo sottile, e proprio per questo ti mette di fronte alle scelte che TCP fa al posto tuo: cosa succede se un messaggio si perde? E se arriva due volte? E se arrivano in ordine sbagliato? Con il modulo `dgram` hai gli strumenti per ricevere e inviare datagrammi con poche righe; le garanzie che ti servono le costruisci tu, e solo quelle che servono davvero.

Punti da ricordare:

- **un `send()` è un datagramma**: i confini dei messaggi sono preservati, ma consegna, ordine e unicità non sono garantiti;
- **messaggi piccoli, timeout e ritrasmissioni**: progetta per la perdita;
- **broadcast e multicast** rendono semplice la scoperta di servizi nella rete locale;
- **sicurezza**: mittenti falsificabili, amplificazione e assenza di cifratura nativa richiedono attenzione.

Per la comunicazione affidabile e con connessione, il complemento naturale è l’articolo sui socket TCP e il modulo `net`.

## Riferimenti

- Documentazione Node.js: modulo `dgram` (nodejs.org/api/dgram.html)
- Documentazione Node.js: `Buffer` (nodejs.org/api/buffer.html)
- RFC 768 – User Datagram Protocol
- RFC 1035 – Domain Names: implementation and specification
