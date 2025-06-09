# Introduzione ai Server Web

## Cos'è un Server Web?

Un server web è un software che riceve e risponde alle richieste dei client (tipicamente browser web) attraverso il protocollo HTTP (Hypertext Transfer Protocol). Il suo compito principale è fornire risorse come pagine HTML, immagini, file CSS, JavaScript e altri contenuti ai client che ne fanno richiesta.

I server web sono la spina dorsale di Internet e permettono la comunicazione tra client e server, consentendo agli utenti di accedere a siti web e applicazioni web da qualsiasi parte del mondo.

## Architettura Client-Server

L'architettura client-server è un modello di comunicazione in cui:

1. **Client**: È l'applicazione che richiede servizi o risorse (tipicamente un browser web).
2. **Server**: È l'applicazione che fornisce servizi o risorse in risposta alle richieste del client.

Il processo di comunicazione avviene generalmente in questo modo:

1. Il client invia una richiesta HTTP al server.
2. Il server elabora la richiesta.
3. Il server invia una risposta HTTP al client.
4. Il client riceve e interpreta la risposta.

## Il Protocollo HTTP

HTTP (Hypertext Transfer Protocol) è il protocollo di comunicazione utilizzato per trasferire dati sul web. È un protocollo stateless, il che significa che ogni richiesta è indipendente e il server non mantiene informazioni sulle richieste precedenti.

### Metodi HTTP

I metodi HTTP più comuni sono:

- **GET**: Richiede una risorsa specifica. Non dovrebbe avere effetti collaterali sul server.
- **POST**: Invia dati al server per creare una nuova risorsa.
- **PUT**: Aggiorna una risorsa esistente o ne crea una nuova se non esiste.
- **DELETE**: Rimuove una risorsa specifica.
- **PATCH**: Applica modifiche parziali a una risorsa.
- **HEAD**: Simile a GET, ma richiede solo le intestazioni della risposta, non il corpo.
- **OPTIONS**: Richiede informazioni sulle opzioni di comunicazione disponibili.

### Codici di Stato HTTP

I codici di stato HTTP indicano il risultato di una richiesta. Sono raggruppati in cinque categorie:

- **1xx (Informational)**: La richiesta è stata ricevuta e il processo continua.
- **2xx (Success)**: La richiesta è stata ricevuta, compresa e accettata con successo.
  - 200 OK: La richiesta è andata a buon fine.
  - 201 Created: La richiesta è stata completata e una nuova risorsa è stata creata.
- **3xx (Redirection)**: Ulteriori azioni sono necessarie per completare la richiesta.
  - 301 Moved Permanently: La risorsa è stata spostata permanentemente.
  - 302 Found: La risorsa è stata temporaneamente spostata.
- **4xx (Client Error)**: La richiesta contiene errori o non può essere soddisfatta.
  - 400 Bad Request: La richiesta non può essere compresa dal server.
  - 401 Unauthorized: L'autenticazione è necessaria.
  - 403 Forbidden: Il server ha compreso la richiesta ma rifiuta di autorizzarla.
  - 404 Not Found: La risorsa richiesta non è stata trovata.
- **5xx (Server Error)**: Il server ha fallito nel soddisfare una richiesta apparentemente valida.
  - 500 Internal Server Error: Errore generico del server.
  - 503 Service Unavailable: Il server non è disponibile temporaneamente.

## Server Web in Node.js

Node.js è particolarmente adatto per la creazione di server web grazie alla sua natura asincrona e orientata agli eventi. Ci sono due approcci principali per creare server web in Node.js:

### 1. Modulo HTTP Nativo

Node.js include un modulo HTTP nativo che permette di creare server web senza dipendenze esterne:

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

Questo approccio è ottimo per comprendere i fondamenti, ma può diventare complesso per applicazioni più grandi.

### 2. Framework Web

Per applicazioni più complesse, i framework web come Express.js offrono un'astrazione di alto livello che semplifica lo sviluppo:

```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server Express in ascolto sulla porta 3000');
});
```

I framework web offrono funzionalità come routing, middleware, gestione delle sessioni e molto altro.

## Vantaggi dei Server Web in Node.js

1. **Prestazioni**: L'architettura event-driven e non bloccante di Node.js lo rende efficiente per operazioni I/O intensive.

2. **JavaScript Ovunque**: Utilizzare lo stesso linguaggio (JavaScript) sia per il frontend che per il backend semplifica lo sviluppo.

3. **Ecosistema NPM**: L'accesso a migliaia di pacchetti tramite NPM accelera lo sviluppo.

4. **Scalabilità**: Node.js è progettato per gestire molte connessioni simultanee con un basso overhead.

5. **Comunità Attiva**: Una grande comunità di sviluppatori contribuisce a librerie, framework e strumenti.

## Conclusione

I server web sono componenti fondamentali delle applicazioni web moderne. Node.js offre un ambiente potente e flessibile per la creazione di server web, sia utilizzando il modulo HTTP nativo per applicazioni semplici, sia sfruttando framework come Express.js per progetti più complessi.

Nei prossimi capitoli, esploreremo in dettaglio come utilizzare il modulo HTTP nativo di Node.js e il framework Express.js per costruire server web robusti e scalabili.