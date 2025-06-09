# Esercitazione 15: WebSocket e Comunicazione Real-time

## Obiettivi
In questa esercitazione imparerai a:
- Comprendere i principi fondamentali della comunicazione bidirezionale in tempo reale
- Implementare WebSocket utilizzando la libreria Socket.io
- Creare applicazioni con funzionalità di chat in tempo reale
- Sviluppare sistemi di notifiche push e aggiornamenti live

## Prerequisiti
- Conoscenza di base di Node.js e Express
- Comprensione dei concetti HTTP
- Familiarità con JavaScript asincrono

## Introduzione

I WebSocket rappresentano un protocollo di comunicazione che permette l'interazione bidirezionale in tempo reale tra client e server. A differenza del tradizionale modello HTTP request-response, i WebSocket mantengono una connessione persistente, consentendo sia al client che al server di inviare dati in qualsiasi momento senza dover stabilire una nuova connessione.

Questa tecnologia è fondamentale per applicazioni che richiedono aggiornamenti istantanei come:
- Chat e messaggistica
- Dashboard in tempo reale
- Giochi online
- Notifiche push
- Applicazioni collaborative

## Argomenti Teorici Collegati
- [Introduzione ai WebSocket](./teoria/01-introduzione-websocket.md)
- [Socket.io: Concetti Fondamentali](./teoria/02-socketio-fondamenti.md)
- [Implementazione di Chat Real-time](./teoria/03-chat-realtime.md)
- [Notifiche Push e Aggiornamenti Live](./teoria/04-notifiche-push.md)

## Esercizi Pratici

### Esercizio 1: Configurazione Base di Socket.io
Crea un'applicazione Node.js con Express che implementi una connessione WebSocket di base utilizzando Socket.io.

### Esercizio 2: Chat Room Semplice
Sviluppa una chat room dove più utenti possono connettersi e scambiarsi messaggi in tempo reale.

### Esercizio 3: Dashboard con Aggiornamenti Live
Crea una dashboard che mostri dati aggiornati in tempo reale (ad esempio, statistiche, contatori, grafici).

### Esercizio 4: Sistema di Notifiche
Implementa un sistema di notifiche push che invii aggiornamenti ai client connessi quando si verificano determinati eventi sul server.

### Esercizio 5: Applicazione Collaborativa
Sviluppa un'applicazione semplice che permetta a più utenti di collaborare in tempo reale (ad esempio, una lavagna condivisa o un editor di testo collaborativo).

## Risorse Aggiuntive
- [Documentazione ufficiale di Socket.io](https://socket.io/docs/)
- [WebSocket API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [Differenze tra WebSocket e HTTP](https://www.educba.com/websocket-vs-http/)

## Conclusione
I WebSocket rappresentano un potente strumento per lo sviluppo di applicazioni web moderne che richiedono comunicazione in tempo reale. Padroneggiare questa tecnologia ti permetterà di creare esperienze utente più interattive e reattive, superando i limiti del tradizionale modello request-response di HTTP.

---
[INDICE](../README.md)