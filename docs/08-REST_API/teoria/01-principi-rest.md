# Principi REST e Architettura

## Introduzione a REST

REST (Representational State Transfer) è uno stile architetturale per la progettazione di servizi web, introdotto da Roy Fielding nella sua tesi di dottorato nel 2000. Non è un protocollo o uno standard, ma un insieme di vincoli architetturali che, se applicati correttamente, creano un'architettura di sistema scalabile, semplice e performante.

Le API che seguono i principi REST sono chiamate API RESTful e sono diventate lo standard de facto per la creazione di servizi web moderni, grazie alla loro semplicità, scalabilità e alla facilità con cui possono essere comprese e utilizzate.

## Principi Fondamentali di REST

### 1. Architettura Client-Server

La separazione delle responsabilità tra client e server è fondamentale. Il client si occupa dell'interfaccia utente e dell'esperienza utente, mentre il server gestisce la logica di business, l'archiviazione dei dati e la sicurezza. Questa separazione permette a client e server di evolversi indipendentemente.

```
Client <-----> Server
  UI             API
                Dati
```

### 2. Statelessness (Assenza di Stato)

Ogni richiesta dal client al server deve contenere tutte le informazioni necessarie per comprendere e processare la richiesta. Il server non deve memorizzare alcuno stato del client tra le richieste. Questo principio semplifica l'architettura, migliora la scalabilità e la resilienza.

```javascript
// Esempio di richiesta stateless con autenticazione tramite token
fetch('https://api.example.com/users/123', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});
```

### 3. Cacheability (Memorizzabilità nella Cache)

Le risposte devono definire implicitamente o esplicitamente se possono essere memorizzate nella cache. Una buona strategia di caching può migliorare le prestazioni riducendo la latenza e il carico sul server.

```javascript
// Esempio di risposta con header di cache
res.set({
  'Cache-Control': 'public, max-age=86400',
  'Expires': new Date(Date.now() + 86400000).toUTCString()
});
res.send(data);
```

### 4. Sistema a Livelli

Un'architettura a livelli permette di inserire componenti intermedi (proxy, gateway, load balancer) tra client e server senza modificare le interfacce. Questo migliora la scalabilità e la sicurezza.

```
Client <-> Load Balancer <-> Server 1
                         <-> Server 2
                         <-> Server 3
```

### 5. Interfaccia Uniforme

L'interfaccia tra client e server deve essere uniforme e seguire convenzioni standard. Questo semplifica l'architettura complessiva e migliora la visibilità delle interazioni. L'interfaccia uniforme si basa su quattro vincoli:

- **Identificazione delle risorse**: Ogni risorsa è identificata da un URI univoco
- **Manipolazione delle risorse attraverso rappresentazioni**: Il client manipola le risorse ricevendo e inviando rappresentazioni (es. JSON, XML)
- **Messaggi auto-descrittivi**: Ogni messaggio include informazioni sufficienti per descrivere come processarlo
- **HATEOAS (Hypermedia as the Engine of Application State)**: Il client interagisce con l'applicazione attraverso hypermedia forniti dinamicamente dal server

```
GET /users/123 HTTP/1.1
Host: api.example.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 123,
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "links": [
    { "rel": "self", "href": "/users/123" },
    { "rel": "posts", "href": "/users/123/posts" }
  ]
}
```

## Risorse e URI

In un'API RESTful, tutto è considerato una risorsa, che può essere un'entità (es. un utente, un prodotto) o una collezione di entità. Ogni risorsa è identificata da un URI (Uniform Resource Identifier) univoco.

### Progettazione degli URI

Una buona progettazione degli URI è fondamentale per un'API RESTful. Ecco alcune best practices:

1. **Usa nomi e non verbi per le risorse**:
   - Buono: `/users`, `/products`
   - Da evitare: `/getUsers`, `/createProduct`

2. **Usa il plurale per le collezioni**:
   - `/users` per la collezione di utenti
   - `/users/123` per un utente specifico

3. **Usa la gerarchia per esprimere relazioni**:
   - `/users/123/posts` per i post dell'utente 123
   - `/posts/456/comments` per i commenti del post 456

4. **Mantieni gli URI semplici e prevedibili**:
   - Usa kebab-case o snake_case in modo consistente
   - Evita query string complesse quando possibile

5. **Versioning dell'API**:
   - `/v1/users` per la versione 1 dell'API
   - `/v2/users` per la versione 2

## Metodi HTTP e Operazioni CRUD

I metodi HTTP definiscono le operazioni che possono essere eseguite sulle risorse. Esiste una corrispondenza naturale tra i metodi HTTP e le operazioni CRUD (Create, Read, Update, Delete):

| Metodo HTTP | Operazione CRUD | Descrizione |
|------------|-----------------|-------------|
| GET        | Read            | Recupera una risorsa o una collezione di risorse |
| POST       | Create          | Crea una nuova risorsa |
| PUT        | Update          | Aggiorna completamente una risorsa esistente |
| PATCH      | Update (parziale) | Aggiorna parzialmente una risorsa esistente |
| DELETE     | Delete          | Elimina una risorsa |

### Esempi di Utilizzo dei Metodi HTTP

```javascript
// GET: Recupera tutti gli utenti
app.get('/users', (req, res) => {
  // Logica per recuperare tutti gli utenti
  res.json(users);
});

// GET: Recupera un utente specifico
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'Utente non trovato' });
  res.json(user);
});

// POST: Crea un nuovo utente
app.post('/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name,
    email: req.body.email
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT: Aggiorna completamente un utente
app.put('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'Utente non trovato' });
  
  user.name = req.body.name;
  user.email = req.body.email;
  // Tutti i campi devono essere forniti
  
  res.json(user);
});

// PATCH: Aggiorna parzialmente un utente
app.patch('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'Utente non trovato' });
  
  // Aggiorna solo i campi forniti
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;
  
  res.json(user);
});

// DELETE: Elimina un utente
app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).json({ message: 'Utente non trovato' });
  
  const deletedUser = users.splice(userIndex, 1)[0];
  res.json(deletedUser);
});
```

## Codici di Stato HTTP

I codici di stato HTTP comunicano il risultato di una richiesta. Utilizzare i codici appropriati è fondamentale per un'API RESTful ben progettata:

### Codici di Successo (2xx)

- **200 OK**: La richiesta è stata completata con successo
- **201 Created**: Una nuova risorsa è stata creata con successo
- **204 No Content**: La richiesta è stata completata con successo, ma non c'è contenuto da restituire

### Codici di Reindirizzamento (3xx)

- **301 Moved Permanently**: La risorsa è stata spostata permanentemente
- **304 Not Modified**: La risorsa non è stata modificata (usato con caching)

### Codici di Errore Client (4xx)

- **400 Bad Request**: La richiesta non può essere elaborata a causa di un errore del client
- **401 Unauthorized**: Autenticazione richiesta
- **403 Forbidden**: Il client non ha i permessi necessari
- **404 Not Found**: La risorsa richiesta non esiste
- **405 Method Not Allowed**: Il metodo HTTP utilizzato non è supportato per questa risorsa
- **422 Unprocessable Entity**: La richiesta è sintatticamente corretta ma semanticamente errata

### Codici di Errore Server (5xx)

- **500 Internal Server Error**: Errore generico del server
- **502 Bad Gateway**: Il server, agendo come gateway, ha ricevuto una risposta non valida
- **503 Service Unavailable**: Il server non è disponibile temporaneamente

## Rappresentazione delle Risorse

Le risorse possono essere rappresentate in diversi formati. I più comuni sono:

### JSON (JavaScript Object Notation)

```json
{
  "id": 123,
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "active": true,
  "created_at": "2023-01-15T10:30:00Z"
}
```

### XML (eXtensible Markup Language)

```xml
<user>
  <id>123</id>
  <name>Mario Rossi</name>
  <email>mario@example.com</email>
  <active>true</active>
  <created_at>2023-01-15T10:30:00Z</created_at>
</user>
```

### Content Negotiation

La content negotiation permette al client di specificare il formato di rappresentazione preferito:

```javascript
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'Utente non trovato' });
  
  // Content negotiation basata sull'header Accept
  const accept = req.headers.accept || '';
  
  if (accept.includes('application/xml')) {
    // Restituisci XML
    res.set('Content-Type', 'application/xml');
    return res.send(`<user>
      <id>${user.id}</id>
      <name>${user.name}</name>
      <email>${user.email}</email>
    </user>`);
  }
  
  // Default: restituisci JSON
  res.json(user);
});
```

## HATEOAS (Hypermedia as the Engine of Application State)

HATEOAS è un vincolo dell'architettura REST che suggerisce che le API dovrebbero guidare il client attraverso l'applicazione fornendo link ipertestuali dinamici nelle risposte.

```json
{
  "id": 123,
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "_links": {
    "self": { "href": "/users/123" },
    "posts": { "href": "/users/123/posts" },
    "followers": { "href": "/users/123/followers" }
  }
}
```

Implementazione in Express:

```javascript
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: 'Utente non trovato' });
  
  // Aggiungi link HATEOAS
  const userWithLinks = {
    ...user,
    _links: {
      self: { href: `/users/${userId}` },
      posts: { href: `/users/${userId}/posts` },
      followers: { href: `/users/${userId}/followers` }
    }
  };
  
  res.json(userWithLinks);
});
```

## Idempotenza e Sicurezza

I metodi HTTP hanno proprietà importanti da considerare quando si progetta un'API RESTful:

### Sicurezza

Un metodo è considerato "sicuro" se non modifica lo stato del server. I metodi sicuri sono:
- GET
- HEAD
- OPTIONS

### Idempotenza

Un metodo è "idempotente" se l'effetto di più richieste identiche è lo stesso di una singola richiesta. I metodi idempotenti sono:
- GET
- HEAD
- PUT
- DELETE
- OPTIONS

Nota che POST non è idempotente, poiché più richieste POST identiche potrebbero creare più risorse.

## Conclusione

I principi REST forniscono linee guida per la creazione di API web scalabili, manutenibili e comprensibili. Seguendo questi principi, è possibile progettare API che sono:

- **Semplici da comprendere e utilizzare**
- **Scalabili e performanti**
- **Indipendenti dal linguaggio e dalla piattaforma**
- **Evolutive nel tempo**

Nel prossimo capitolo, esploreremo come implementare concretamente questi principi utilizzando Express.js per creare API RESTful robuste e conformi alle best practices del settore.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Modulo Corrente: REST API](../README.md)
- [Documento Precedente: Gestione dei Form e Upload di File](../../07-GestioneRichiesteHTTP/teoria/04-gestione-form.md)
- [Documento Successivo: Implementazione di API con Express](./02-implementazione-api.md)