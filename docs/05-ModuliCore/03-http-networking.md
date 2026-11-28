# I moduli HTTP e per il Networking in Node.js
  
## 📋 Indice

- [Introduzione](#introduzione)
- [Il Modulo HTTP](#il-modulo-http)
  - [Server HTTP Base](#server-http-base)
  - [Routing e Gestione Richieste](#routing-e-gestione-richieste)
  - [Gestione Dati POST](#gestione-dati-post)
  - [HTTP Client](#http-client)
  - [HTTP GET Semplificato](#http-get-semplificato)
- [Il Modulo HTTPS](#il-modulo-https)
- [Il Modulo URL](#il-modulo-url)
- [Il Modulo Net (TCP)](#il-modulo-net-tcp)
  - [TCP Server](#tcp-server)
  - [TCP Client](#tcp-client)
- [Il Modulo DNS](#il-modulo-dns)
- [WebSocket](#websocket)
- [Pattern Avanzati](#pattern-avanzati)
  - [HTTP Server con Middleware](#http-server-con-middleware)
  - [HTTP Client con Connection Pooling](#http-client-con-connection-pooling)
- [Best Practices](#best-practices)
- [Risorse Utili](#risorse-utili)

---

## Introduzione

Node.js eccelle nelle operazioni di rete grazie alla sua **architettura event-driven e non bloccante**. Il modulo `http` è uno dei moduli core più importanti e viene utilizzato per creare server web e client HTTP performanti e scalabili.

### 🎯 Perché Node.js è Eccellente per il Networking

1. **Event Loop Non Bloccante**: Gestisce migliaia di connessioni simultanee senza thread multipli
2. **Performance**: Overhead minimo rispetto ad altri linguaggi
3. **Ecosistema**: Librerie mature per qualsiasi esigenza di rete
4. **Full-Stack JavaScript**: Stesso linguaggio su client e server

### ⚡ Moduli di Networking in Node.js

| Modulo | Scopo | Quando Usarlo |
|--------|-------|---------------|
| `http` | Server e client HTTP | Web servers, REST APIs |
| `https` | HTTP sicuro con TLS/SSL | Connessioni crittografate |
| `net` | Socket TCP | Chat, gaming, protocolli custom |
| `dgram` | Socket UDP | Streaming, real-time data |
| `dns` | Risoluzione DNS | Traduzione domini → IP |
| `url` | Parsing URL | Analisi e manipolazione URL |

---

## Il Modulo HTTP

Il modulo `http` è il cuore dello sviluppo web in Node.js. Fornisce API di basso livello per creare server e client HTTP senza dipendenze esterne.

### Importare il Modulo

```javascript
const http = require('http');
```

---

### Server HTTP Base

Un server HTTP in Node js è sorprendentemente semplice da creare. Il modulo `http` fornisce `createServer()` che accetta una callback eseguita per ogni richiesta ricevuta.

#### 🔑 Concetti Chiave

**Request Object (`req`)**
- Contiene tutte le informazioni della richiesta del client
- `req.method`: Metodo HTTP (GET, POST, PUT, DELETE, ecc.)
- `req.url`: URL richiesto dal client
- `req.headers`: Headers HTTP della richiesta
- `req.socket`: Socket TCP sottostante

**Response Object (`res`)**
- Usato per costruire e inviare la risposta al client
- `res.statusCode`: Imposta il codice di stato HTTP
- `res.setHeader()`: Imposta headers della risposta
- `res.end()`: Completa e invia la risposta (obbligatorio!)

#### 📊 Status Code HTTP Comuni

| Codice | Significato | Quando Usarlo |
|--------|-------------|---------------|
| 200 | OK | Richiesta riuscita |
| 201 | Created | Risorsa creata (POST success) |
| 204 | No Content | Success ma nessun body |
| 400 | Bad Request | Richiesta malformata |
| 401 | Unauthorized | Autenticazione richiesta |
| 404 | Not Found | Risorsa non esistente |
| 500 | Internal Server Error | Errore server |

#### 📦 Esempio Completo

Vedi: [esempi/03.01-server-http-base.js](esempi/03.01-server-http-base.js)

Questo esempio mostra:
- ✅ Creazione server HTTP minimale
- ✅ Gestione eventi server (connection, request, error, close)
- ✅ Graceful shutdown con SIGINT
- ✅ Logging dettagliato delle connessioni

---

### Routing e Gestione Richieste

Il routing permette di gestire diverse URL (route) con logiche diverse. Node.js non ha routing integrato, ma è facile implementarlo usando `req.url` e `req.method`.

#### 🛤️ Come Funziona il Routing

1. **URL Parsing**: Analizza `req.url` per estrarre path e query parameters
2. **Method Matching**: Verifica `req.method` (GET, POST, ecc.)
3. **Route Matching**: Confronta path con route definite
4. **Handler Execution**: Esegue la funzione associata alla route

#### 🎯 Strategie di Routing

**Routing Manuale (if/else)**
```javascript
if (url === '/') { /* home */ }
else if (url === '/about') { /* about */ }
else { /* 404 */ }
```

**Routing con Switch**
```javascript
switch(url) {
  case '/': /* home */; break;
  case '/about': /* about */; break;
  default: /* 404 */;
}
```

**Routing con Map** (più scalabile)
```javascript
const routes = new Map([
  ['/', homeHandler],
  ['/about', aboutHandler],
]);
```

#### 📦 Esempio Completo

Vedi: [esempi/03.02-http-routing.js](esempi/03.02-http-routing.js)

Questo esempio implementa:
- ✅ Routing manuale per multiple route
- ✅ Separazione handler per ogni route
- ✅ Risposta HTML e JSON
- ✅ Query parameters parsing
- ✅ 404 handler personalizzato

---

### Gestione Dati POST

I dati POST non arrivano tutti insieme, ma come **stream di chunks**. Node.js usa eventi per gestire l'arrivo progressivo dei dati.

#### 🌊 Stream-Based Processing

**Perché Stream?**
- **Efficienza**: Non carica tutto in memoria
- **Scalabilità**: Gestisce file enormi
- **Performance**: Processa dati mentre arrivano

#### 📝 Eventi Chiave

| Evento | Quando | Cosa Fare |
|--------|--------|-----------|
| `data` | Chunk di dati arrivato | Accumula nel buffer |
| `end` | Tutti i dati ricevuti | Processa dati completi |
| `error` | Errore durante lettura | Gestisci errore |

#### 🔒 Sicurezza

⚠️ **Limitare Dimensione Body**
```javascript
if (body.length > 1e6) { // 1MB
  req.connection.destroy();
  return res.json(413, { error: 'Body troppo grande' });
}
```

#### 📦 Esempio Completo

Vedi: [esempi/03.03-post-data-handling.js](esempi/03.03-post-data-handling.js)

Questo esempio dimostra:
- ✅ Lettura body come stream
- ✅ Parsing JSON e URL-encoded
- ✅ Validazione dati ricevuti
- ✅ Protezione contro body troppo grandi
- ✅ Form HTML per testing
- ✅ Error handling robusto

---

### HTTP Client

Node.js può anche agire come **client HTTP** per fare richieste verso altri server. Questo è utile per chiamare API esterne, microservizi, o web scraping.

#### 🔄 Client vs Server

| Aspetto | Server | Client |
|---------|--------|--------|
| Ruolo | Riceve richieste | Invia richieste |
| Metodo | `http.createServer()` | `http.request()` o `http.get()` |
| Callback | Per ogni richiesta ricevuta | Per risposta ricevuta |

#### 🛠️ Due Metodi Principali

**1. `http.request()` - Completo**
- Controllo totale su method, headers, body
- Perfetto per POST/PUT/DELETE
- Richiede chiamata esplicita a `req.end()`

**2. `http.get()` - Semplificato**
- Scorciatoia per richieste GET
- Imposta automaticamente method='GET'
- Chiama automaticamente `req.end()`

#### 📦 Esempio Completo

Vedi: [esempi/03.04-http-client-request.js](esempi/03.04-http-client-request.js)

Questo esempio mostra:
- ✅ GET, POST, PUT, DELETE requests
- ✅ Headers personalizzati e autenticazione
- ✅ Timeout management
- ✅ Error handling completo
- ✅ Retry logic

---

### HTTP GET Semplificato

Il metodo `http.get()` è una scorciatoia comoda per richieste GET, eliminando boilerplate code. È perfetto per fetch rapidi di dati da API o download semplici.

#### ⚡ Vantaggi di http.get()

- **Sintassi Concisa**: Meno codice da scrivere
- **Auto-Completion**: Chiama automaticamente `req.end()`
- **Defaults Intelligenti**: Method='GET' già impostato
- **Perfetto per API Calls**: Ideale per REST API GET

#### 🎯 Quando Usare

| Scenario | Metodo |
|----------|--------|
| Simple GET request | ✅ `http.get()` |
| Download file | ✅ `http.get()` |
| Health checks | ✅ `http.get()` |
| POST/PUT/DELETE | ❌ Usa `http.request()` |
| Custom headers complessi | ⚠️ Preferisci `http.request()` |

#### 📦 Esempio Completo

Vedi: [esempi/03.05-http-get-simple.js](esempi/03.05-http-get-simple.js)

Questo esempio include:
- ✅ GET con URL string e options
- ✅ Download file con pipe
- ✅ Query parameters
- ✅ Health checks multipli
- ✅ Gestione redirect
- ✅ Lookup paralleli per performance

---

## Il Modulo HTTPS

HTTPS è la versione sicura di HTTP, che cifra i dati tramite **TLS/SSL**. È essenziale per proteggere informazioni sensibili come password, dati bancari, o API keys.

### 🔒 Perché HTTPS?

1. **Crittografia**: Tutti i dati sono cifrati end-to-end
2. **Autenticazione**: Certificato verifica identità del server
3. **Integrità**: Previene man-in-the-middle attacks
4. **SEO**: Google favorisce siti HTTPS nel ranking
5. **Trust**: Browser mostrano lucchetto verde

### 📜 Certificati SSL/TLS

**Development (Self-Signed)**
- Certificati creati localmente con openssl
- ⚠️ Browser mostreranno warning
- ✅ Gratuito e veloce per testing

**Production (CA-Signed)**
- Certificati firmati da Certificate Authority
- ✅ Browser li fidano automaticamente
- 🆓 Let's Encrypt offre certificati gratuiti

### 🔑 Componenti Certificato

- **Private Key**: Chiave privata (`.key` o `.pem`) - TENERE SEGRETA!
- **Certificate**: Certificato pubblico (`.crt` o `.pem`)
- **Chain**: Chain of trust (intermediate certificates)

#### 📦 Esempio Completo

Vedi: [esempi/03.06-https-server.js](esempi/03.06-https-server.js)

Questo esempio mostra:
- ✅ Generazione certificato self-signed con openssl
- ✅ Creazione server HTTPS
- ✅ Configurazione TLS/SSL
- ✅ Eventi `secureConnection`
- ✅ Info cipher e protocollo
- ✅ Best practices per production

### 💡 Production Tips

```bash
# 1. Installa Certbot (Let's Encrypt)
sudo apt-get install certbot

# 2. Ottieni certificato SSL gratuito
sudo certbot certonly --standalone -d yourdomain.com

# 3. Certificati salvati in:
# /etc/letsencrypt/live/yourdomain.com/
```

**Reverse Proxy Consigliati**
- nginx: Gestisce SSL termination e load balancing
- Caddy: Certificati SSL automatici
- Traefik: Perfetto per containers/Kubernetes

---

## Il Modulo URL

Il modulo `url` fornisce utilità per parsing e manipolazione di URL. La nuova **WHATWG URL API** è lo standard moderno raccomandato.

### 🔗 Anatomia di un URL

```
https://user:pass@example.com:8080/path/to/page?key=value&foo=bar#section
└──┬──┘   └───┬───┘ └────┬────┘└┬─┘ └─────┬─────┘ └──────┬──────┘ └──┬──┘
protocol  username  hostname port   pathname      search     hash
          password
```

### 📦 Esempio Completo

Vedi: [esempi/03.07-url-parsing.js](esempi/03.07-url-parsing.js)

Questo esempio copre:
- ✅ Parsing URL completi con tutti i componenti
- ✅ Gestione query parameters con URLSearchParams
- ✅ Costruzione URL da componenti
- ✅ Validazione e normalizzazione URL
- ✅ Manipolazione pathname
- ✅ Casi d'uso pratici (redirect, API builder, sanitizzazione)

### 🎯 URL vs URL Legacy

| Feature | WHATWG URL API | Legacy `url.parse()` |
|---------|----------------|----------------------|
| Standard | ✅ WHATWG Standard | ❌ Deprecato |
| Type Safety | ✅ Oggetto immutabile | ❌ Plain object |
| Query Params | ✅ `URLSearchParams` | ❌ `querystring` |
| Validazione | ✅ Automatica | ❌ Manuale |
| Raccomandato | ✅ **Usa questo** | ❌ Evita |

---

## Il Modulo Net (TCP)

Il modulo `net` fornisce API per creare server e client **TCP**. TCP è il protocollo di trasporto sottostante a HTTP, più low-level ma con controllo totale.

### 🔄 TCP vs HTTP

| Aspetto | TCP | HTTP |
|---------|-----|------|
| Livello | Transport Layer | Application Layer |
| Struttura | Stream di bytes | Request/Response |
| Stato | Stateful (connessione persistente) | Stateless |
| Overhead | Minimo | Headers HTTP |
| Uso | Chat, gaming, protocolli custom | Web, REST APIs |

### 🎯 Quando Usare TCP

- **Chat Servers**: Connessioni persistenti bidirezionali
- **Gaming**: Latenza minima, no HTTP overhead
- **Database Connections**: MySQL, PostgreSQL usano TCP
- **Protocolli Custom**: Quando HTTP non è adatto
- **IoT**: Dispositivi con risorse limitate

---

### TCP Server

Un server TCP accetta connessioni da client e mantiene socket aperti per comunicazione bidirezionale.

#### 📦 Esempio Completo

Vedi: [esempi/03.08-tcp-server.js](esempi/03.08-tcp-server.js)

Questo esempio implementa un **chat server TCP completo**:
- ✅ Gestione connessioni multiple
- ✅ Broadcast messaggi a tutti i client
- ✅ Sistema comandi (/help, /users, /stats, /quit)
- ✅ Heartbeat/keep-alive
- ✅ Timeout per inattività
- ✅ Statistiche real-time

#### 🔌 Eventi Socket Principali

| Evento | Quando | Azione |
|--------|--------|--------|
| `connection` | Nuovo client connesso | Setup client |
| `data` | Dati ricevuti | Processa messaggio |
| `end` | Client chiude connessione | Cleanup |
| `error` | Errore socket | Log e recovery |
| `close` | Socket chiuso | Rimuovi client |

---

### TCP Client

Un client TCP si connette a un server TCP per inviare e ricevere dati in modo bidirezionale.

#### 📦 Esempio Completo

Vedi: [esempi/03.09-tcp-client.js](esempi/03.09-tcp-client.js)

Questo esempio mostra:
- ✅ Connessione a server TCP
- ✅ Input da console con readline
- ✅ Invio e ricezione messaggi
- ✅ Keep-alive management
- ✅ Comandi locali (/info, /quit)
- ✅ Error handling (ECONNREFUSED, ECONNRESET)

#### 💻 Testing Chat TCP

```bash
# Terminal 1: Avvia server
node esempi/03.08-tcp-server.js

# Terminal  2-3-4: Avvia più client
node esempi/03.09-tcp-client.js
```

---

## Il Modulo DNS

Il modulo `dns` permette di risolvere nomi di dominio in indirizzi IP e viceversa. È essenziale per qualsiasi applicazione di rete.

### 🌐 Come Funziona il DNS

1. **Applicazione**: Richiede risoluzione di "example.com"
2. **DNS Resolver**: Cerca in cache locale
3. **Root Servers**: Se non in cache, chiede ai root DNS
4. **TLD Servers**: Query ai server .com/.org/ecc
5. **Authoritative Servers**: Ottiene IP finale
6. **Risposta**: Ritorna IP all'applicazione

### 🎯 Record DNS Principali

| Record | Scopo | Esempio |
|--------|-------|---------|
| A | IPv4 address | `example.com → 93.184.216.34` |
| AAAA | IPv6 address | `example.com → 2606:2800:220:1:...` |
| MX | Mail server | `gmail.com → aspmx.l.google.com` |
| TXT | Text data | SPF, DKIM, verifications |
| CNAME | Alias | `www.example.com → example.com` |
| NS | Name server | `example.com → ns1.example.com` |

### 🔍 lookup() vs resolve()

| Feature | `dns.lookup()` | `dns.resolve()` |
|---------|----------------|-----------------|
| Backend | Sistema operativo | DNS diretto |
| /etc/hosts | ✅ Rispetta | ❌ Ignora |
| Cache OS | ✅ Usa | ❌ Bypassa |
| Dettagli | ❌ IP only | ✅ Full records |
| Performance | ⚡ Più veloce | 🔍 Più completo |

#### 📦 Esempio Completo

Vedi: [esempi/03.10-dns-resolution.js](esempi/03.10-dns-resolution.js)

Questo esempio mostra:
- ✅ Basic lookup (IPv4 e IPv6)
- ✅ A records (con TTL)
- ✅ MX records (mail servers)
- ✅ TXT records
- ✅ NS records (name servers)
- ✅ Reverse DNS (IP → hostname)
- ✅ SOA record (Start of Authority)
- ✅ Lookup paralleli per performance
- ✅ DNS server personalizzato

---

## WebSocket

WebSocket è un protocollo per comunicazione **full-duplex** over HTTP. Permette comunicazione real-time bidirezionale tra client e server.

### 🔄 WebSocket vs HTTP

| Aspetto | HTTP | WebSocket |
|---------|------|-----------|
| Comunicazione | Unidirezionale (req/res) | Bidirezionale |
| Connessione | Apri-chiudi per ogni request | Persistente |
| Overhead | Headers ogni volta | Handshake iniziale only |
| Latenza | Alta (polling) | Bassa (push immediato) |
| Scalabilità | Limitata (polling) | Eccellente |

### 🎯 Quando Usare WebSocket

- ✅ Chat applications
- ✅ Live feeds (news, sports, stocks)
- ✅ Real-time gaming
- ✅ Collaborative editing
- ✅ IoT data streaming
- ✅ Live notifications

### ⚠️ Quando NON Usare

- ❌ Simple REST APIs
- ❌ Request/Response stateless
- ❌ File uploads/downloads
- ❌ SEO-critical content

### 📦 Esempio Completo

Vedi: [esempi/03.11-websocket-server.js](esempi/03.11-websocket-server.js)

⚠️ **Richiede libreria `ws`**: `npm install ws`

Questo esempio implementa un **chat server WebSocket completo**:
- ✅ Server WebSocket + HTTP server
- ✅ Client HTML integrato per testing
- ✅ Broadcast messaggi a tutti i client
- ✅ Gestione eventi (welcome, chat, user-joined/left)
- ✅ Heartbeat (ping/pong) automatico
- ✅ Statistiche real-time

#### 🌐 Testing WebSocket

```bash
# 1. Avvia server
node esempi/03.11-websocket-server.js

# 2. Apri browser
http://localhost:8080/

# 3. Apri più tab per testare chat multi-utente
```

---

## Pattern Avanzati

### HTTP Server con Middleware

I **middleware** sono funzioni che processano richieste in sequenza, ognuna può modificare req/res o passare al prossimo middleware. È il pattern usato da Express.js, Koa, e altri framework.

#### 🔄 Come Funziona il Middleware Pattern

```
Request → Middleware1 → Middleware2 → Middleware3 → Route Handler → Response
            ↓              ↓              ↓
          Logger        CORS        Body Parser
```

Ogni middleware può:
1. **Processare** la richiesta
2. **Modificare** req/res
3. **Chiamare next()** per passare al prossimo
4. **Terminare** inviando risposta

#### 🎯 Middleware Comuni

| Middleware | Scopo | Quando |
|------------|-------|--------|
| Logger | Log richieste | Sempre |
| CORS | Cross-Origin requests | API pubbliche |
| Body Parser | Parse JSON/form data | POST/PUT |
| Auth | Verifica autenticazione | Protected routes |
| Rate Limiter | Limita richieste | Prevenire abuse |
| Error Handler | Cattura errori | Sempre (ultimo) |

#### 📦 Esempio Completo

Vedi: [esempi/03.12-http-server-middleware.js](esempi/03.12-http-server-middleware.js)

Questo esempio implementa un **framework HTTP completo con middleware**:
- ✅ Classe HTTPServer con middleware system
- ✅ Routing avanzato (GET, POST, PUT, DELETE)
- ✅ Pattern matching per parametri dinamici (`:id`)
- ✅ Middleware logger, CORS, body parser, rate limiter
- ✅ Enhanced req/res (req.query, req.params, res.json())
- ✅ Error handling centralizzato

#### 🏗️ Architettura

```javascript
// 1. Crea server
const app = new HTTPServer();

// 2. Registra middleware
app.use(loggerMiddleware);
app.use(corsMiddleware());
app.use(bodyParserMiddleware);
app.use(rateLimiterMiddleware({ max: 20 }));

// 3. Definisci route
app.get('/', homeHandler);
app.post('/api/users', createUserHandler);
app.get('/api/users/:id', getUserHandler);

// 4. Avvia
app.listen(3000);
```

---

### HTTP Client con Connection Pooling

**Connection Pooling** riutilizza connessioni TCP esistenti invece di crearne di nuove per ogni richiesta. Migliora drasticamente le performance per applicazioni che fanno molte richieste.

#### 🏊 Come Funziona il Pooling

**Senza Pooling** (ogni richiesta = nuova connessione)
```
Request 1: TCP Handshake → Request → Response → Close
Request 2: TCP Handshake → Request → Response → Close
Request 3: TCP Handshake → Request → Response → Close
```

**Con Pooling** (riuso connessione)
```
Request 1: TCP Handshake → Request → Response → Keep-Alive
Request 2: [Riusa connessione] → Request → Response → Keep-Alive
Request 3: [Riusa connessione] → Request → Response → Keep-Alive
```

#### ⚡ Vantaggi

- **Performance**: No TCP handshake per ogni richiesta
- **Latenza**: Riduzione 30-50% del tempo di risposta
- **Risorse**: Meno socket aperti contemporaneamente
- **Scalabilità**: Gestisce più richieste con meno risorse

#### 🎯 Configurazione http.Agent

```javascript
const agent = new http.Agent({
  keepAlive: true,        // Mantieni connessioni aperte
  keepAliveMsecs: 60000,  // Timeout keep-alive (60s)
  maxSockets: 10,         // Max socket per host
  maxFreeSockets: 5       // Max socket keep-alive
});
```

#### 📦 Esempio Completo

Vedi: [esempi/03.13-http-client-pooling.js](esempi/03.13-http-client-pooling.js)

Questo esempio implementa un **HTTP Client avanzato**:
- ✅ Connection pooling con http.Agent
- ✅ API Promise-based (async/await)
- ✅ Retry logic automatico
- ✅ Timeout configurabile
- ✅ Metodi helper (get, post, put, delete)
- ✅ Statistiche real-time
- ✅ Error handling robusto

#### 📊 Performance Comparison

Test: 100 richieste GET sequenziali

| Metodo | Tempo | Miglioramento |
|--------|-------|---------------|
| Senza pooling | 12.5s | - |
| Con pooling | 4.2s | **66% più veloce** |

---

## Best Practices

### 🔒 Sicurezza

1. **HTTPS Sempre in Production**
   - Usa Let's Encrypt per certificati gratuiti
   - Configura HSTS (HTTP Strict Transport Security)
   - Disable SSLv3, TLS 1.0, TLS 1.1

2. **Rate Limiting**
   ```javascript
   // Limita richieste per IP per prevenire DDoS
   app.use(rateLimiterMiddleware({ windowMs: 60000, max: 100 }));
   ```

3. **Input Validation**
   ```javascript
   // Valida e sanitizza SEMPRE input utente
   if (!email || !isValidEmail(email)) {
     return res.json(400, { error: 'Email non valida' });
   }
   ```

4. **Headers Sicurezza**
   ```javascript
   res.setHeader('X-Content-Type-Options', 'nosniff');
   res.setHeader('X-Frame-Options', 'DENY');
   res.setHeader('X-XSS-Protection', '1; mode=block');
   ```

5. **Secrets Management**
   - Mai hardcode API keys o passwords
   - Usa variabili ambiente (`process.env`)
   - Considera tools come HashiCorp Vault

### ⚡ Performance

1. **Connection Pooling**
   - Usa `http.Agent` con `keepAlive: true`
   - Configura `maxSockets` basato su load

2. **Compression**
   ```javascript
   const zlib = require('zlib');
   // Comprimi risposte grandi
   res.setHeader('Content-Encoding', 'gzip');
   res.end(zlib.gzipSync(largeData));
   ```

3. **Caching**
   ```javascript
   res.setHeader('Cache-Control', 'public, max-age=3600');
   res.setHeader('ETag', generateETag(data));
   ```

4. **Stream Processing**
   ```javascript
   // Per file grandi, usa stream invece di caricare tutto in memoria
   const stream = fs.createReadStream('large-file.json');
   stream.pipe(res);
   ```

### 🛠️ Error Handling

1. **Gestione Centralizzata**
   ```javascript
   app.setErrorHandler((err, req, res) => {
     console.error(err);
     res.json(err.statusCode || 500, {
       error: err.message
     });
   });
   ```

2. **Graceful Shutdown**
   ```javascript
   process.on('SIGINT', () => {
     server.close(() => {
       console.log('Server chiuso');
       process.exit(0);
     });
   });
   ```

3. **Timeout Management**
   ```javascript
   server.setTimeout(30000); // 30s timeout
   socket.setTimeout(5000);  // Socket timeout
   ```

### 📊 Monitoring

1. **Logging Strutturato**
   ```javascript
   console.log(JSON.stringify({
     timestamp: new Date().toISOString(),
     method: req.method,
     url: req.url,
     statusCode: res.statusCode,
     duration: Date.now() - startTime,
     ip: req.socket.remoteAddress
   }));
   ```

2. **Health Checks**
   ```javascript
   app.get('/health', (req, res) => {
     res.json(200, {
       status: 'ok',
       uptime: process.uptime(),
       memory: process.memoryUsage()
     });
   });
   ```

3. **Metrics**
   - Request count
   - Response time (avg, p95, p99)
   - Error rate
   - Active connections

---

## Risorse Utili

### 📚 Documentazione Ufficiale

- [Node.js HTTP Module](https://nodejs.org/api/http.html)
- [Node.js HTTPS Module](https://nodejs.org/api/https.html)
- [Node.js Net Module](https://nodejs.org/api/net.html)
- [Node.js DNS Module](https://nodejs.org/api/dns.html)
- [Node.js URL Module](https://nodejs.org/api/url.html)
- [WHATWG URL Standard](https://url.spec.whatwg.org/)

### 🛠️ Librerie Popolari

**HTTP Frameworks**
- [Express.js](https://expressjs.com/) - The most popular Node.js web framework
- [Fastify](https://www.fastify.io/) - Fast and low overhead web framework
- [Koa](https://koajs.com/) - Next generation web framework by Express team
- [Hapi](https://hapi.dev/) - Rich framework for building applications

**HTTP Clients**
- [axios](https://axios-http.com/) - Promise based HTTP client
- [node-fetch](https://github.com/node-fetch/node-fetch) - Fetch API for Node.js
- [got](https://github.com/sindresorhus/got) - Human-friendly HTTP request library

**WebSocket**
- [ws](https://github.com/websockets/ws) - Simple WebSocket library
- [Socket.IO](https://socket.io/) - Real-time bidirectional event-based communication
- [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) - Ultra fast WebSocket

**Testing**
- [Supertest](https://github.com/visionmedia/supertest) - HTTP assertions
- [nock](https://github.com/nock/nock) - HTTP server mocking

### 📖 Tutorials e Guide

- [Node.js Networking Guide](https://nodejs.dev/learn/the-nodejs-net-module)
- [Understanding HTTP in Node.js](https://nodejs.dev/learn/the-nodejs-http-module)
- [WebSocket Tutorial](https://ably.com/topic/websockets-nodejs)
- [Let's Encrypt Setup Guide](https://letsencrypt.org/getting-started/)

### 🎓 Corsi e Video

- [Node.js: The Complete Guide](https://www.udemy.com/course/nodejs-the-complete-guide/) (Udemy)
- [Node.js API Masterclass](https://www.udemy.com/course/nodejs-api-masterclass/) (Udemy)
- [Node.js Networking](https://www.youtube.com/watch?v=d4ESzvZBxl4) (YouTube - Traversy Media)

### 🔧 Tools

- **Testing**: Postman, Insomnia, httpie
- **Monitoring**: PM2, New Relic, Datadog
- **Security**: Helmet.js, OWASP Node Goat
- **Performance**: Apache Bench (ab), wrk, autocannon

---

## 🎯 Prossimi Passi

Dopo aver completato questa guida, sei pronto per:

1. **Costruire REST APIs**: Crea API RESTful complete con autenticazione
2. **WebSocket Real-Time**: Implementa chat, notifications, live updates
3. **Microservizi**: Architetture distribuite con Node.js
4. **Performance Tuning**: Ottimizza per alta concorrenza
5. **Production Deployment**: Deploy su AWS, Azure, o Heroku

Continua l'apprendimento con:
- [Stream di File](02-file-system.md#stream-di-file---elaborazione-efficiente)
- [Eventi e EventEmitter](../02-Architettura_Event-Driven/03-eventemitter.md)
- [Moduli per Gestione File](./02-file-system.md)

---

**📝 Nota**: Tutti gli esempi sono completi, eseguibili e commentati. Esplora la cartella `esempi/` per vedere il codice completo!

## Navigazione

- [← Precedente: Il modulo File System in Node.js](02-file-system.md)
- [↑ Indice dell’esercitazione](README.md)
- [Successiva: Modulo Crypto - Crittografia in Node.js →](04-crypto.md)
