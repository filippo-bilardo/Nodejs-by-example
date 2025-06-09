# Introduzione ai WebSocket

## Cos'è WebSocket?

WebSocket è un protocollo di comunicazione che fornisce un canale di comunicazione bidirezionale full-duplex su una singola connessione TCP. È stato standardizzato dal W3C e dall'IETF come parte di HTML5 ed è progettato per essere implementato nei browser web e nei server web.

## Differenze tra HTTP e WebSocket

| Caratteristica | HTTP | WebSocket |
|---------------|------|----------|
| Tipo di comunicazione | Unidirezionale (request-response) | Bidirezionale (full-duplex) |
| Connessione | Temporanea | Persistente |
| Overhead | Alto (headers in ogni richiesta) | Basso (dopo l'handshake iniziale) |
| Latenza | Più alta | Più bassa |
| Push dal server | Richiede polling o long polling | Nativo |

## Come funziona WebSocket

1. **Handshake iniziale**: La connessione inizia come una normale richiesta HTTP, ma include un header speciale `Upgrade: websocket` che richiede al server di passare al protocollo WebSocket.

2. **Connessione persistente**: Una volta stabilita, la connessione rimane aperta finché una delle parti non la chiude esplicitamente.

3. **Comunicazione bidirezionale**: Sia il client che il server possono inviare messaggi in qualsiasi momento senza dover attendere una richiesta.

4. **Frame di dati**: I dati vengono trasmessi in "frame" che possono contenere testo o dati binari.

## Vantaggi dei WebSocket

- **Comunicazione in tempo reale**: Ideale per applicazioni che richiedono aggiornamenti istantanei.
- **Riduzione dell'overhead**: Meno traffico di rete rispetto al polling HTTP.
- **Latenza ridotta**: I messaggi vengono consegnati immediatamente senza la necessità di stabilire nuove connessioni.
- **Supporto per dati binari**: Possibilità di trasmettere efficientemente dati non testuali.

## Limitazioni dei WebSocket

- **Supporto proxy**: Alcuni proxy e firewall potrebbero non gestire correttamente le connessioni WebSocket.
- **Scalabilità del server**: Mantenere connessioni persistenti richiede più risorse sul server.
- **Complessità**: L'implementazione e la gestione degli errori possono essere più complesse rispetto a HTTP.

## WebSocket in Node.js

Node.js è particolarmente adatto per implementare server WebSocket grazie alla sua natura event-driven e non bloccante. Esistono diverse librerie che semplificano l'uso dei WebSocket in Node.js:

- **ws**: Una libreria WebSocket leggera e veloce.
- **Socket.io**: Una libreria più completa che offre funzionalità aggiuntive come fallback automatico per browser più vecchi.

## Esempio di base con la libreria 'ws'

```javascript
// Server WebSocket di base con 'ws'
const WebSocket = require('ws');

// Crea un server WebSocket sulla porta 8080
const wss = new WebSocket.Server({ port: 8080 });

// Gestisce le connessioni
wss.on('connection', function connection(ws) {
  console.log('Nuovo client connesso');
  
  // Gestisce i messaggi in arrivo
  ws.on('message', function incoming(message) {
    console.log('Messaggio ricevuto: %s', message);
    
    // Invia un messaggio di risposta
    ws.send('Hai inviato: ' + message);
  });
  
  // Invia un messaggio di benvenuto
  ws.send('Benvenuto al server WebSocket!');
});

console.log('Server WebSocket in ascolto sulla porta 8080');
```

## Casi d'uso comuni

1. **Chat e messaggistica**: Applicazioni di chat in tempo reale.
2. **Giochi multiplayer**: Comunicazione rapida tra giocatori.
3. **Dashboard in tempo reale**: Visualizzazione di dati aggiornati istantaneamente.
4. **Notifiche push**: Invio di notifiche dal server al client senza polling.
5. **Applicazioni collaborative**: Editor di testo condivisi, lavagne online, ecc.

## Conclusione

I WebSocket rappresentano un'evoluzione significativa nella comunicazione web, superando le limitazioni del modello HTTP tradizionale per applicazioni che richiedono interazioni in tempo reale. La loro integrazione in Node.js è particolarmente efficace, rendendo questa combinazione ideale per lo sviluppo di applicazioni web moderne e reattive.

---

[Torna all'indice dell'esercitazione](../README.md)