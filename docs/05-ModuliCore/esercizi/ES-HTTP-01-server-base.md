# ES-HTTP-01: Server HTTP Base

## 📋 Informazioni Generali

- **Modulo**: HTTP
- **Difficoltà**: 🟢 Facile
- **Tempo stimato**: 20 minuti
- **Prerequisiti**: 
  - Conoscenza base di HTTP (request/response)
  - Comprensione di server e porte di rete

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Creare un server HTTP base con il modulo `http`
2. Gestire richieste HTTP e inviare risposte
3. Impostare status code e headers
4. Testare il server con browser o curl

## 📝 Descrizione

Crea un server HTTP che ascolta sulla porta 3000 e risponde "Hello World" a tutte le richieste con status code 200 e Content-Type appropriato.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-http-01`
- [ ] Crea file `server.js`

### 2. Implementazione Server
- [ ] Importa il modulo `http`
- [ ] Crea server con `http.createServer()`
- [ ] Imposta response headers
- [ ] Invia risposta "Hello World"
- [ ] Metti in ascolto sulla porta 3000

### 3. Testing
- [ ] Avvia il server
- [ ] Testa con browser (http://localhost:3000)
- [ ] Testa con curl dalla command line
- [ ] Verifica gli headers della risposta

## 💡 Template di Partenza

```javascript
// server.js
const http = require('http');

const PORT = 3000;

// TODO: Crea il server

// TODO: Metti il server in ascolto sulla porta
```

## 📚 Concetti Chiave

### http.createServer()
```javascript
const server = http.createServer((req, res) => {
  // req = richiesta in arrivo (IncomingMessage)
  // res = risposta da inviare (ServerResponse)
});
```

### Response Headers
```javascript
res.writeHead(statusCode, headers);
// esempio:
res.writeHead(200, { 'Content-Type': 'text/plain' });
```

### Inviare la Risposta
```javascript
res.end('contenuto della risposta');
```

### Mettere in Ascolto
```javascript
server.listen(port, callback);
```

## 🔍 Step by Step

### Step 1: Crea il server
```javascript
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Handler per ogni richiesta
});
```

### Step 2: Gestisci request/response
```javascript
const server = http.createServer((req, res) => {
  // Imposta status code e headers
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  
  // Invia il contenuto
  res.end('Hello World\n');
});
```

### Step 3: Avvia il server
```javascript
server.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
```

### Soluzione Completa
```javascript
const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // Log della richiesta
  console.log(`${req.method} ${req.url}`);
  
  // Imposta headers
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  
  // Invia risposta
  res.end('Hello World\n');
});

server.listen(PORT, () => {
  console.log(`✅ Server avviato`);
  console.log(`🌐 Visita: http://localhost:${PORT}`);
  console.log(`🛑 Premi Ctrl+C per terminare`);
});
```

## 🎓 Suggerimenti

1. **Content-Type**: Usa 'text/plain' per testo semplice, 'text/html' per HTML
2. **Status Code**: 200 significa successo, è lo status più comune
3. **res.end()**: Chiude la risposta e la invia al client
4. **Console.log**: Logga le richieste per vedere cosa arriva al server
5. **Charset**: Aggiungi sempre charset=utf-8 per supportare caratteri speciali

## ✅ Criteri di Valutazione

- [ ] Il server si avvia senza errori
- [ ] Risponde sulla porta 3000
- [ ] Invia "Hello World" come risposta
- [ ] Status code è 200
- [ ] Headers sono impostati correttamente
- [ ] Il server logga le richieste in console

## 🚀 Sfide Extra (Opzionali)

1. **HTML Response**: Rispondi con HTML invece di testo semplice
2. **Request Info**: Mostra info sulla richiesta (URL, metodo, headers)
3. **Favicon**: Gestisci la richiesta /favicon.ico per evitare errori
4. **Timestamp**: Includi timestamp nella risposta
5. **Custom Port**: Accetta la porta come argomento CLI (process.argv)
6. **Graceful Shutdown**: Gestisci SIGINT per chiusura pulita del server

## 📖 Come Testare

### Con il Browser
```
Apri: http://localhost:3000
Dovresti vedere: Hello World
```

### Con curl
```bash
curl http://localhost:3000

# Con headers visibili
curl -i http://localhost:3000

# Output atteso:
# HTTP/1.1 200 OK
# Content-Type: text/plain; charset=utf-8
# ...
# Hello World
```

### Con Node.js
```javascript
// test-client.js
const http = require('http');

http.get('http://localhost:3000', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  
  res.on('data', (chunk) => {
    console.log('Body:', chunk.toString());
  });
});
```

## 🐛 Problemi Comuni

### EADDRINUSE: porta già in uso
**Causa**: Un altro processo sta usando la porta 3000  
**Soluzione**: 
- Chiudi l'altro server
- Cambia porta (es. 3001)
- Trova e termina il processo: `lsof -i :3000` (Mac/Linux)

### Server non risponde
**Causa**: Possibile errore nel codice o firewall  
**Soluzione**: 
- Controlla i log per errori
- Verifica che il server sia effettivamente in ascolto
- Prova con 127.0.0.1 invece di localhost

### Cannot GET /
**Causa**: Messaggio di errore comune, ma il server funziona  
**Soluzione**: Questo non è un errore, il server risponde correttamente

## 📖 Risorse Utili

- [Node.js HTTP Module](https://nodejs.org/api/http.html)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [Content-Type Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)
