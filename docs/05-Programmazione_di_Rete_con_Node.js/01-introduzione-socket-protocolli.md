# 01 - Introduzione ai Socket e Protocolli di Rete

## Indice
- [Cos'è un Socket](#cosè-un-socket)
- [Modello Client-Server](#modello-client-server)
- [TCP vs UDP](#tcp-vs-udp)
- [Indirizzi IP e Porte](#indirizzi-ip-e-porte)
- [Socket in Node.js](#socket-in-nodejs)
- [Chiamate di sistema Unix e API socket di Node.js](#chiamate-di-sistema-unix-e-api-socket-di-nodejs)

---

## Cos'è un Socket

Un **socket** è un endpoint per la comunicazione di rete tra due processi, anche su macchine diverse.

### Analogia del Mondo Reale
Pensa al socket come a una **presa telefonica**:
- La presa (socket) permette la comunicazione
- Il numero di telefono è l'indirizzo IP + porta
- La chiamata è la connessione
- La conversazione è lo scambio di dati

### Definizione Tecnica
```
Socket = Indirizzo IP + Porta + Protocollo
```

**Esempio:**
```
192.168.1.100:3000 (TCP)
         ↓      ↓    ↓
         IP   Porta Protocollo
```

### Tipi di Socket

#### 1. Stream Socket (TCP)
- Connessione affidabile
- Garantisce ordine e consegna
- Comunicazione bidirezionale
- Come una **telefonata**

#### 2. Datagram Socket (UDP)
- Connectionless
- Non garantisce consegna
- Più veloce
- Come inviare **cartoline postali**

---

## Modello Client-Server

### Architettura Base

```
   CLIENT                    SERVER
     |                          |
     | 1. Richiesta connessione |
     |------------------------->|
     |                          | 2. Accetta connessione
     |                          |
     | 3. Invia dati            |
     |------------------------->|
     |                          | 4. Processa dati
     |                          |
     |    5. Risponde           |
     |<-------------------------|
     |                          |
     | 6. Chiude connessione    |
     |------------------------->|
     |                          |
```

### Ruoli

#### Server
```javascript
// Server = ascolta connessioni
const server = net.createServer();

server.listen(3000, () => {
    console.log('Server in ascolto sulla porta 3000');
});
```

**Caratteristiche:**
- ✅ Sempre in ascolto
- ✅ Gestisce multiple connessioni
- ✅ Indirizzo IP fisso (o dinamico con DNS)
- ✅ Fornisce servizi

#### Client
```javascript
// Client = inizia connessione
const client = net.connect(3000, 'localhost', () => {
    console.log('Connesso al server!');
});
```

**Caratteristiche:**
- ✅ Inizia la comunicazione
- ✅ Conosce indirizzo server
- ✅ Può disconnettersi quando vuole
- ✅ Richiede servizi

### Esempio Completo Minimal

**Server:**
```javascript
const net = require('net');

const server = net.createServer((socket) => {
    console.log('Client connesso!');
    
    socket.write('Benvenuto!\n');
    
    socket.on('data', (data) => {
        console.log('Ricevuto:', data.toString());
    });
});

server.listen(3000);
```

**Client:**
```javascript
const net = require('net');

const client = net.connect(3000, 'localhost');

client.on('data', (data) => {
    console.log('Server dice:', data.toString());
});

client.write('Ciao server!');
```

---

## TCP vs UDP

### TCP (Transmission Control Protocol)

#### Caratteristiche
```
✅ Connection-oriented    - Stabilisce connessione prima di inviare
✅ Reliable              - Garantisce consegna pacchetti
✅ Ordered               - Mantiene ordine messaggi
✅ Error checking        - Rileva errori di trasmissione
✅ Flow control          - Gestisce velocità trasmissione
✅ Congestion control    - Evita sovraccarico rete

⚠️ Overhead alto         - Headers più grandi
⚠️ Più lento             - Handshake e acknowledgments
```

#### Fasi Connessione TCP

**1. Three-Way Handshake (Apertura)**
```
CLIENT                    SERVER
  |                          |
  | SYN                      |
  |------------------------->|
  |                          |
  |        SYN-ACK           |
  |<-------------------------|
  |                          |
  | ACK                      |
  |------------------------->|
  |                          |
  | CONNESSIONE STABILITA    |
```

**2. Trasferimento Dati**
```
CLIENT                    SERVER
  |                          |
  | Data                     |
  |------------------------->|
  |                          |
  |        ACK               |
  |<-------------------------|
  |                          |
```

**3. Four-Way Handshake (Chiusura)**
```
CLIENT                    SERVER
  |                          |
  | FIN                      |
  |------------------------->|
  |                          |
  |        ACK               |
  |<-------------------------|
  |                          |
  |        FIN               |
  |<-------------------------|
  |                          |
  | ACK                      |
  |------------------------->|
  |                          |
  | CONNESSIONE CHIUSA       |
```

#### Use Cases TCP
```javascript
// HTTP/HTTPS - Web
const http = require('http');

// FTP - File transfer
// SSH - Remote shell
// SMTP - Email
// WebSocket - Real-time bidirectional
```

**Quando usare TCP:**
- ✅ Dati devono arrivare tutti
- ✅ Ordine è importante
- ✅ Connessione persistente
- ✅ Esempio: chat, file transfer, database

---

### UDP (User Datagram Protocol)

#### Caratteristiche
```
✅ Connectionless        - Nessun handshake
✅ Fast                  - Basso overhead
✅ Low latency           - Nessun acknowledgment
✅ Broadcast support     - Può inviare a molti

⚠️ Unreliable           - Pacchetti possono perdersi
⚠️ Unordered            - Possono arrivare fuori ordine
⚠️ No flow control      - Può sovraccaricare receiver
```

#### Funzionamento UDP

```
CLIENT                    SERVER
  |                          |
  | Datagram 1               |
  |------------------------->|
  | Datagram 2               |
  |------------------------->| (potrebbe arrivare prima di 1)
  | Datagram 3               |
  |----X  (perso)            |
  |                          |
  
Nessun acknowledgment, nessuna ritrasmissione!
```

#### Use Cases UDP
```javascript
// DNS - Domain Name System
const dgram = require('dgram');

// Streaming video/audio
// Online gaming
// VoIP (Voice over IP)
// IoT sensor data
```

**Quando usare UDP:**
- ✅ Velocità > affidabilità
- ✅ Dati in tempo reale
- ✅ Perdita dati tollerabile
- ✅ Esempio: streaming, gaming, DNS

---

### Confronto Diretto

| Aspetto | TCP | UDP |
|---------|-----|-----|
| **Connessione** | Richiede handshake | Nessuna connessione |
| **Affidabilità** | Garantita | Non garantita |
| **Ordine** | Garantito | Non garantito |
| **Velocità** | Più lento | Più veloce |
| **Overhead** | 20-60 bytes header | 8 bytes header |
| **Controllo flusso** | Sì | No |
| **Ritrasmissione** | Automatica | Manuale (se necessaria) |
| **Broadcast** | No | Sì |
| **Esempio app** | HTTP, FTP, Email | DNS, VoIP, Gaming |

### Esempio Pratico Differenze

**Scenario: Streaming Video**

**Con TCP:**
```
Frame 1 → Arriva ✓
Frame 2 → Perso, ritrasmesso... ritardo!
Frame 3 → In attesa di Frame 2
Frame 4 → In attesa di Frame 2
...
RISULTATO: Video si blocca, buffering
```

**Con UDP:**
```
Frame 1 → Arriva ✓
Frame 2 → Perso ✗
Frame 3 → Arriva ✓ (va avanti comunque)
Frame 4 → Arriva ✓
...
RISULTATO: Video continua, piccolo glitch
```

---

## Indirizzi IP e Porte

### Indirizzo IP

#### IPv4
```
192.168.1.100
 │   │  │  │
 └───┴──┴──┴─→ 4 ottetti (0-255)
 
Formato: X.X.X.X
Range: 0.0.0.0 - 255.255.255.255
```

#### Indirizzi Speciali
```javascript
'127.0.0.1'    // localhost - stesso computer
'0.0.0.0'      // Tutte le interfacce (server)
'192.168.x.x'  // Rete locale privata
'10.x.x.x'     // Rete locale privata
```

#### IPv6
```
2001:0db8:85a3:0000:0000:8a2e:0370:7334

Più lungo, più indirizzi disponibili
Formato esadecimale
```

### Porte

#### Numero Porta
```
Range: 0 - 65535

0 - 1023      → Well-known ports (riservate)
1024 - 49151  → Registered ports
49152 - 65535 → Dynamic/Private ports
```

#### Porte Comuni
```javascript
80    // HTTP
443   // HTTPS
22    // SSH
21    // FTP
25    // SMTP (Email)
53    // DNS
3306  // MySQL
5432  // PostgreSQL
27017 // MongoDB
3000  // Node.js dev server (convenzione)
```

### Esempio Binding

```javascript
const net = require('net');

// Server su porta specifica
server.listen(3000, 'localhost');
//              ↓        ↓
//            Porta   Indirizzo

// Equivalenti
server.listen(3000);                    // Default: localhost
server.listen(3000, '0.0.0.0');         // Tutte interfacce
server.listen({ port: 3000, host: '::' }); // IPv6
```

### Verifica Porte Disponibili

```bash
# Linux/Mac - verifica porta in uso
lsof -i :3000
netstat -an | grep 3000
ss -tuln | grep 3000  #Comando moderno da preferire a netstat

# Windows
netstat -ano | findstr :3000

# Trovare processo e killarlo
# Linux/Mac
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

---

## Socket in Node.js

### Moduli Core

Node.js fornisce due moduli principali:

#### 1. net - TCP Socket
```javascript
const net = require('net');

// Per comunicazione affidabile
// Stream-based
// Connection-oriented
```

#### 2. dgram - UDP Socket
```javascript
const dgram = require('dgram');

// Per comunicazione veloce
// Datagram-based
// Connectionless
```

### Architettura Event-Driven

Socket in Node.js sono **Event Emitters**: I socket non funzionano in modo sincrono (dove aspetteresti il completamento di un'operazione), ma in modo asincrono basato su eventi. Invece di bloccare l'esecuzione aspettando dati, registri dei listener che reagiscono quando succede qualcosa.

```javascript
const net = require('net');

const server = net.createServer((socket) => {
    // socket è un EventEmitter
    
    socket.on('data', (data) => {
        console.log('Dati ricevuti:', data);
    });
    
    socket.on('end', () => {
        console.log('Client disconnesso');
    });
    
    socket.on('error', (err) => {
        console.error('Errore:', err);
    });
});

server.on('listening', () => {
    console.log('Server in ascolto');
});

server.on('error', (err) => {
    console.error('Errore server:', err);
});

server.listen(3000);
```

### Stream Interface

Socket TCP sono **Duplex Streams**:

```javascript
const socket = net.connect(3000);

// Socket è readable
socket.on('data', (chunk) => {
    console.log(chunk);
});

// Socket è writable
socket.write('Hello');
socket.end('Goodbye');

// Può usare pipe
const fs = require('fs');
socket.pipe(fs.createWriteStream('output.txt'));
```

### Confronto con Altri Linguaggi

#### Python (socket)
```python
# Python - più verboso
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('localhost', 3000))
s.listen(5)
conn, addr = s.accept()
```

#### Node.js (net)
```javascript
// Node.js - più conciso, event-driven
const net = require('net');

const server = net.createServer((socket) => {
    // handle connection
});

server.listen(3000);
```

---

## Chiamate di sistema Unix e API socket di Node.js

In C su Unix, `socket()` restituisce un **file descriptor**, un intero con cui il processo identifica il socket. Il programma passa quel descrittore a chiamate come `bind()`, `recv()` e `close()`. In Node.js si lavora con oggetti JavaScript. Un `net.Server` gestisce l'ascolto TCP, ogni `net.Socket` connesso rappresenta un flusso di byte bidirezionale e un `dgram.Socket` invia e riceve datagrammi UDP. Le implementazioni native di Node.js e libuv si occupano dell'I/O con il sistema operativo. La corrispondenza qui sotto riguarda il **compito** delle operazioni. Un metodo JavaScript può combinare più chiamate native o rimandarne l'esecuzione. [Socket su Linux](https://man7.org/linux/man-pages/man7/socket.7.html) · [Architettura di libuv](https://docs.libuv.org/en/v1.x/design.html)

### TCP: dall'ascolto alla chiusura

| Operazione | Unix in C | Node.js con `node:net` |
| --- | --- | --- |
| Preparare il socket | `socket(AF_INET, SOCK_STREAM, 0)` crea un descrittore TCP IPv4. | `net.createServer()` prepara l'oggetto server. `new net.Socket()` prepara un oggetto socket. La creazione dell'oggetto da sola non avvia l'I/O. |
| Associare un indirizzo e iniziare l'ascolto | `bind(fd, ...)` associa IP e porta locali. `listen(fd, backlog)` abilita l'ascolto. Il backlog riguarda le connessioni in attesa, non quelle già accettate. | `server.listen({ port, host, backlog })` avvia entrambe le operazioni. L'evento `'listening'` indica che il server è pronto. |
| Accettare un client | `accept(fd, ...)` restituisce un **nuovo** descrittore connesso. Quello originale può accettare altri client. | Il server emette `'connection'` e passa un **nuovo** `net.Socket` al listener. Il callback di `net.createServer(handler)` si registra per lo stesso evento. |
| Collegarsi a un server | `connect(fd, ...)` avvia una connessione verso IP e porta remoti. | `net.createConnection({ host, port })` restituisce subito un socket. L'evento `'connect'` indica che la connessione è riuscita. |
| Ricevere byte | `recv(fd, buf, len, 0)` o `read(fd, buf, len)` scrive nel buffer fornito e restituisce il numero di byte letti. | L'evento `'data'` consegna un chunk, normalmente un `Buffer`. In modalità di lettura esplicita si può usare `'readable'` con `socket.read()`. |
| Inviare byte | `send(fd, buf, len, 0)` o `write(fd, buf, len)` restituisce quanti byte sono stati accettati per l'invio. Il programma deve gestire le scritture parziali. | `socket.write(chunk)` consegna il chunk allo stream e restituisce un booleano. Se restituisce `false`, sospendi le ulteriori scritture fino a `'drain'` oppure gestisci un'eventuale chiusura o errore. |
| Chiudere il lato di scrittura | `shutdown(fd, SHUT_WR)` termina l'invio e lascia aperto il lato di lettura. | `socket.end()` termina la scrittura dopo i dati già accodati. Sul lato ricevente, `'end'` indica che il peer ha terminato l'invio e che i dati in ingresso sono stati consumati. |
| Rilasciare le risorse | `close(fd)` rilascia il descrittore. La chiusura del descrittore di ascolto e quella dei descrittori connessi sono operazioni separate. | `socket.destroy()` termina l'I/O del socket senza attendere lo svuotamento delle scritture. `'close'` segnala che il socket è chiuso. `server.close()` interrompe l'ascolto e attende la fine delle connessioni esistenti senza chiuderle da sé. |

Per conoscere gli indirizzi, in C si usano `getsockname()` e `getpeername()`. In Node.js puoi leggere `server.address()` dopo `'listening'` e, su un socket connesso, le proprietà `localAddress`, `localPort`, `remoteAddress` e `remotePort`. Anche alcune opzioni del socket hanno controparti dirette. Per esempio, `setsockopt()` con `TCP_NODELAY` corrisponde a `socket.setNoDelay(true)`. [API TCP di Node.js](https://nodejs.org/api/net.html) · [Manuale di `accept()`](https://man7.org/linux/man-pages/man2/accept.2.html) · [Manuale di `shutdown()`](https://man7.org/linux/man-pages/man2/shutdown.2.html)

### Attese, errori e controllo del flusso

- **Attesa dei dati.** Su un descrittore bloccante, `accept()` o `recv()` può sospendere il thread chiamante. In C puoi scegliere anche socket non bloccanti, impostando `O_NONBLOCK` con `fcntl()` e controllando quando i descrittori sono pronti con `poll()` o `select()`. Su Unix libuv gestisce i socket non bloccanti per Node.js. Usa i meccanismi della piattaforma, come `epoll` su Linux e `kqueue` su macOS, per permettere allo stesso event loop di seguire più connessioni. I listener JavaScript devono comunque terminare rapidamente, perché un calcolo lungo ritarda gli altri eventi. [Architettura di libuv](https://docs.libuv.org/en/v1.x/design.html)
- **Esito delle operazioni.** In C si controlla il valore restituito. Per esempio, `recv()` su TCP con un buffer di lunghezza positiva restituisce `0` quando il peer ha chiuso il proprio lato di scrittura. Con `-1` si legge `errno`. `EAGAIN` o `EWOULDBLOCK` su un socket non bloccante indicano che in quel momento l'operazione dovrebbe attendere. In Node.js, un errore di rete viene normalmente comunicato con `'error'` sul server o sul socket interessato. Gli argomenti non validi possono invece produrre un'eccezione sincrona. [Manuale di `recv()`](https://man7.org/linux/man-pages/man2/recv.2.html) · [API TCP di Node.js](https://nodejs.org/api/net.html)
- **Scrittura e consegna.** In C una scrittura parziale richiede di riprendere dal primo byte ancora da inviare. In Node.js, `write()` che restituisce `false` segnala *backpressure*. Il chunk è già stato accettato dallo stream e **non va inviato di nuovo**. `'drain'` segnala che si può riprendere a produrre dati. Se occorre sapere che il peer ha elaborato un messaggio, il protocollo applicativo deve prevedere una risposta. Il successo di `send()` o il callback di `write()` confermano un'operazione locale. [Manuale di `send()`](https://man7.org/linux/man-pages/man2/send.2.html) · [API degli stream di Node.js](https://nodejs.org/api/stream.html)
- **Confini dei messaggi.** TCP trasporta un flusso ordinato di byte. Una `send()` in C o una `write()` in JavaScript può corrispondere a più letture e una sola lettura può riunire più scritture. Per riconoscere i messaggi serve una regola condivisa, come un delimitatore o un prefisso di lunghezza. [Guida al framing in Node.js](02-modulo_net_e_socket_tcp.md#8-il-problema-del-framing)

### UDP: corrispondenza tra datagrammi

| Operazione | Unix in C | Node.js con `node:dgram` |
| --- | --- | --- |
| Preparare un endpoint IPv4 | `socket(AF_INET, SOCK_DGRAM, 0)` | `dgram.createSocket('udp4')` |
| Ricevere su una porta locale | `bind(fd, ...)` associa l'indirizzo e la porta. | `socket.bind(port, address)` associa l'endpoint e poi emette `'listening'`. |
| Inviare a un destinatario | `sendto(fd, buf, len, 0, ...)` indica la destinazione del datagramma. | `socket.send(buffer, port, address, callback)` indica la destinazione. Se il socket non ha ancora una porta locale, il primo invio può provocare un bind implicito. |
| Ricevere un datagramma e il mittente | `recvfrom(fd, ...)` riempie anche la struttura con l'indirizzo del mittente. | `'message'` consegna `(msg, rinfo)`, con il `Buffer` del datagramma e i dati del mittente, tra cui `rinfo.address` e `rinfo.port`. |
| Impostare il peer predefinito | `connect(fd, ...)` associa l'endpoint remoto. | `socket.connect(port, address)` associa il peer e permette di usare `socket.send(buffer)` senza ripetere la destinazione. |
| Chiudere il socket | `close(fd)` | `socket.close()`, seguito dall'evento `'close'`. |

UDP conserva i **confini dei datagrammi**. Il ricevitore C deve fornire un buffer capace di contenere il datagramma per evitarne il troncamento. UDP può trasportare anche un datagramma vuoto. Il valore `0` restituito da `recvfrom()` può quindi indicare un messaggio di zero byte. Per ricevere datagrammi non servono `listen()` e `accept()` di Unix. Anche dopo `connect()`, UDP rimane senza handshake né conferma di consegna. L'associazione imposta la destinazione predefinita e filtra i datagrammi in ingresso per peer. [API UDP di Node.js](https://nodejs.org/api/dgram.html) · [Manuale di `connect()`](https://man7.org/linux/man-pages/man2/connect.2.html) · [Manuale di `recvfrom()`](https://man7.org/linux/man-pages/man2/recv.2.html)

### Laboratorio TCP: stesso client, due server echo

Entrambi i server ascoltano su `127.0.0.1:5300` e restituiscono i byte ricevuti. Il server C usa un descrittore per l'ascolto e un secondo descrittore per il client. In questo esempio serve una sola connessione e termina. Il server Node.js resta in ascolto e può servire altri client.

**Server Unix in C** (`echo-unix.c`)

```c
#include <arpa/inet.h>
#include <errno.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <unistd.h>

static void fail(const char *operation)
{
    perror(operation);
    exit(EXIT_FAILURE);
}

int main(void)
{
    if (signal(SIGPIPE, SIG_IGN) == SIG_ERR) fail("signal");

    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd == -1) fail("socket");

    struct sockaddr_in local = {0};
    local.sin_family = AF_INET;
    local.sin_port = htons(5300);
    local.sin_addr.s_addr = htonl(INADDR_LOOPBACK);

    if (bind(server_fd, (struct sockaddr *)&local, sizeof local) == -1) fail("bind");
    if (listen(server_fd, 8) == -1) fail("listen");
    puts("In ascolto su 127.0.0.1:5300");
    fflush(stdout);

    int client_fd;
    do {
        client_fd = accept(server_fd, NULL, NULL);
    } while (client_fd == -1 && errno == EINTR);
    if (client_fd == -1) fail("accept");
    if (close(server_fd) == -1) fail("close server");

    char buffer[4096];
    for (;;) {
        ssize_t received = recv(client_fd, buffer, sizeof buffer, 0);
        if (received == 0) break;
        if (received == -1) {
            if (errno == EINTR) continue;
            fail("recv");
        }

        size_t sent = 0;
        while (sent < (size_t)received) {
            ssize_t written = send(client_fd, buffer + sent, (size_t)received - sent, 0);
            if (written == -1) {
                if (errno == EINTR) continue;
                fail("send");
            }
            if (written == 0) {
                fputs("send: nessun byte inviato\n", stderr);
                return EXIT_FAILURE;
            }
            sent += (size_t)written;
        }
    }

    if (shutdown(client_fd, SHUT_WR) == -1) fail("shutdown");
    if (close(client_fd) == -1) fail("close client");
    return EXIT_SUCCESS;
}
```

Il ciclo interno gestisce le scritture parziali. `EINTR` indica che una chiamata è stata interrotta da un segnale e qui viene ripetuta. Ignorare `SIGPIPE` in questa prova permette di gestire un'eventuale `EPIPE` tramite il valore restituito da `send()`. [Manuale di `send()`](https://man7.org/linux/man-pages/man2/send.2.html)

**Server in Node.js** (`echo-node.cjs`)

```javascript
const net = require('node:net');

const server = net.createServer({ allowHalfOpen: true }, (socket) => {
    socket.on('error', (err) => console.error('Client', err.code));
    socket.pipe(socket);
});

server.on('error', (err) => {
    console.error('Server', err.code);
    process.exitCode = 1;
});

server.listen(5300, '127.0.0.1', () => {
    console.log('In ascolto su 127.0.0.1:5300');
});
```

`socket.pipe(socket)` trasferisce i byte dal lato leggibile a quello scrivibile dello stesso socket e gestisce la backpressure. Con `allowHalfOpen: true`, il socket può ancora scrivere dopo la fine della lettura. `pipe()` chiude il lato scrivibile con `end()` quando il lato leggibile termina. [API degli stream di Node.js](https://nodejs.org/api/stream.html) · [API TCP di Node.js](https://nodejs.org/api/net.html)

**Client comune** (`echo-client.cjs`)

```javascript
const net = require('node:net');

const client = net.createConnection({ port: 5300, host: '127.0.0.1' });
client.on('error', (err) => {
    console.error(err.code);
    process.exitCode = 1;
});
client.once('connect', () => client.end('Ciao, socket!\n'));
client.pipe(process.stdout);
```

1. Su Linux, macOS o WSL, compila il server C con `cc -std=c11 -Wall -Wextra -Wpedantic echo-unix.c -o echo-unix` e avvialo con `./echo-unix`.
2. Da un secondo terminale, esegui `node echo-client.cjs`. Il client stampa `Ciao, socket!` e il server C termina.
3. Avvia `node echo-node.cjs` al posto del server C e ripeti il comando del client. Ottieni lo stesso risultato. Puoi eseguire di nuovo il client finché il server resta attivo. Termina il server con `Ctrl+C`.

Il client chiama `end()` per segnalare che ha finito di inviare la richiesta, ma rimane in lettura per ricevere l'echo. Individua nel server C il punto che corrisponde all'evento `'end'` del lato leggibile in Node.js. Che cosa succede a entrambi i server se il client usa `write()` e lascia aperto il proprio lato di scrittura?

---

## Esempio Completo Introduttivo

### Echo Server TCP

```javascript
const net = require('net');

// Crea server che fa echo di tutto ciò che riceve
const server = net.createServer((socket) => {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    
    console.log(`[${clientId}] Connesso`);
    
    socket.setEncoding('utf8');
    
    socket.on('data', (data) => {
        console.log(`[${clientId}] Ricevuto: ${data}`);
        
        // Echo back
        socket.write(`Echo: ${data}`);
    });
    
    socket.on('end', () => {
        console.log(`[${clientId}] Disconnesso`);
    });
    
    socket.on('error', (err) => {
        console.error(`[${clientId}] Errore:`, err.message);
    });
});

server.on('error', (err) => {
    console.error('Errore server:', err);
    process.exit(1);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server TCP in ascolto sulla porta ${PORT}`);
    console.log(`Test con: telnet localhost ${PORT}`);
});
```

### Test con Telnet

```bash
# Terminal 1 - Avvia server
node echo-server.js

# Terminal 2 - Connetti con telnet
telnet localhost 3000

# Scrivi messaggi, vedrai echo
Hello
Echo: Hello

World
Echo: World

# CTRL+] poi "quit" per uscire
```

---

## Best Practices Iniziali

### 1. Sempre Gestire Errori
```javascript
// ❌ Male
server.listen(3000);

// ✅ Bene
server.listen(3000);
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('Porta già in uso!');
    }
    process.exit(1);
});
```

### 2. Cleanup su Chiusura
```javascript
process.on('SIGINT', () => {
    console.log('Chiusura server...');
    server.close(() => {
        console.log('Server chiuso');
        process.exit(0);
    });
});
```

### 3. Logging Informativo
```javascript
socket.on('data', (data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Data:`, data.toString());
});
```

### 4. Validazione Input
```javascript
socket.on('data', (data) => {
    const message = data.toString().trim();
    
    if (message.length === 0) {
        socket.write('Errore: messaggio vuoto\n');
        return;
    }
    
    if (message.length > 1024) {
        socket.write('Errore: messaggio troppo lungo\n');
        return;
    }
    
    // Processa messaggio valido
    processMessage(message);
});
```

---

## Riepilogo

### Concetti Chiave Appresi

✅ **Socket** = Endpoint comunicazione (IP + Porta + Protocollo)  
✅ **Client-Server** = Architettura base networking  
✅ **TCP** = Affidabile, ordinato, connection-oriented  
✅ **UDP** = Veloce, non affidabile, connectionless  
✅ **IP e Porte** = Indirizzamento rete  
✅ **Node.js** = Moduli `net` (TCP) e `dgram` (UDP)

### Prossimi Passi

1. Leggi [02-modulo-net-tcp.md](02-modulo-net-tcp.md) per approfondire TCP
2. Poi [03-modulo-dgram-udp.md](03-modulo-dgram-udp.md) per UDP
3. Prova gli [esempi pratici](esempi/)
4. Completa gli [esercizi](esercizi/)

---

**Hai completato l'introduzione! 🎉**

Ora hai le basi per comprendere la programmazione di rete in Node.js.

## Navigazione

- [← Precedente: Teoria - Socket TCP/UDP in Node.js](indice-guide.md)
- [↑ Indice dell’esercitazione](README.md)
- [Successiva: 02 - Modulo net - Socket TCP →](02-modulo-net-tcp.md)
