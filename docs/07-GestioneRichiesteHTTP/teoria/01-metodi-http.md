# Metodi HTTP e loro utilizzo

## Introduzione ai Metodi HTTP

I metodi HTTP (o verbi HTTP) definiscono le azioni che possono essere eseguite su una risorsa identificata da un URL. Questi metodi sono fondamentali per la creazione di API RESTful e applicazioni web interattive. Ogni metodo ha un significato specifico e dovrebbe essere utilizzato in modo appropriato per garantire la semantica corretta delle operazioni.

## Metodi HTTP Principali

### GET

Il metodo GET richiede una rappresentazione della risorsa specificata. Le richieste GET dovrebbero solo recuperare dati e non avere altri effetti.

```javascript
// Esempio di gestione di una richiesta GET in Express
app.get('/users', (req, res) => {
  // Recupera la lista degli utenti
  const users = getUsersFromDatabase();
  res.json(users);
});

// Richiesta GET con parametro URL
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  const user = getUserById(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Utente non trovato' });
  }
  
  res.json(user);
});
```

**Caratteristiche del metodo GET:**
- È idempotente (più richieste identiche producono lo stesso risultato)
- È sicuro (non modifica lo stato del server)
- I parametri vengono passati nell'URL (query string o parametri di percorso)
- Ha limitazioni sulla lunghezza dell'URL
- Non dovrebbe essere utilizzato per operazioni che modificano dati

### POST

Il metodo POST invia dati al server per creare una nuova risorsa. È spesso utilizzato per l'invio di form, il caricamento di file o la creazione di nuove entità in un'API.

```javascript
// Esempio di gestione di una richiesta POST in Express
app.post('/users', (req, res) => {
  // Estrai i dati dal corpo della richiesta
  const { name, email, password } = req.body;
  
  // Validazione dei dati
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Dati incompleti' });
  }
  
  // Crea un nuovo utente
  const newUser = createUser({ name, email, password });
  
  // Risposta con status 201 (Created) e il nuovo utente
  res.status(201).json(newUser);
});
```

**Caratteristiche del metodo POST:**
- Non è idempotente (richieste ripetute possono creare risorse multiple)
- Non è sicuro (modifica lo stato del server)
- I dati vengono inviati nel corpo della richiesta
- Non ha limitazioni sulla quantità di dati che possono essere inviati
- È il metodo preferito per operazioni che creano nuove risorse

### PUT

Il metodo PUT sostituisce completamente la risorsa di destinazione con il payload della richiesta. Se la risorsa non esiste, può crearla.

```javascript
// Esempio di gestione di una richiesta PUT in Express
app.put('/users/:id', (req, res) => {
  const userId = req.params.id;
  const userData = req.body;
  
  // Verifica se l'utente esiste
  const userExists = checkIfUserExists(userId);
  
  if (!userExists) {
    // Crea un nuovo utente con l'ID specificato
    const newUser = createUserWithId(userId, userData);
    return res.status(201).json(newUser);
  }
  
  // Aggiorna completamente l'utente esistente
  const updatedUser = updateUserCompletely(userId, userData);
  res.json(updatedUser);
});
```

**Caratteristiche del metodo PUT:**
- È idempotente (richieste ripetute producono lo stesso risultato)
- Non è sicuro (modifica lo stato del server)
- Sostituisce completamente la risorsa esistente
- Richiede che il client invii una rappresentazione completa della risorsa
- Può essere utilizzato per creare o aggiornare risorse

### PATCH

Il metodo PATCH applica modifiche parziali a una risorsa. A differenza di PUT, PATCH non richiede l'invio dell'intera rappresentazione della risorsa.

```javascript
// Esempio di gestione di una richiesta PATCH in Express
app.patch('/users/:id', (req, res) => {
  const userId = req.params.id;
  const updates = req.body;
  
  // Verifica se l'utente esiste
  const user = getUserById(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Utente non trovato' });
  }
  
  // Applica gli aggiornamenti parziali
  const updatedUser = updateUserPartially(userId, updates);
  res.json(updatedUser);
});
```

**Caratteristiche del metodo PATCH:**
- Non è necessariamente idempotente (dipende dall'implementazione)
- Non è sicuro (modifica lo stato del server)
- Modifica parzialmente una risorsa esistente
- È più efficiente di PUT quando si devono aggiornare solo alcuni campi
- Non dovrebbe essere utilizzato per creare nuove risorse

### DELETE

Il metodo DELETE rimuove la risorsa specificata.

```javascript
// Esempio di gestione di una richiesta DELETE in Express
app.delete('/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Verifica se l'utente esiste
  const user = getUserById(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'Utente non trovato' });
  }
  
  // Elimina l'utente
  deleteUser(userId);
  
  // Risposta con status 204 (No Content)
  res.status(204).end();
});
```

**Caratteristiche del metodo DELETE:**
- È idempotente (richieste ripetute producono lo stesso risultato)
- Non è sicuro (modifica lo stato del server)
- Rimuove la risorsa specificata
- Può restituire vari codici di stato (204 No Content, 200 OK con corpo, ecc.)

## Altri Metodi HTTP

### HEAD

Il metodo HEAD è identico a GET, ma il server non restituisce il corpo della risposta. È utile per recuperare i metadati di una risorsa senza trasferire il suo contenuto.

```javascript
app.head('/users/:id', (req, res) => {
  const userId = req.params.id;
  const user = getUserById(userId);
  
  if (!user) {
    return res.status(404).end();
  }
  
  // Imposta le intestazioni appropriate
  res.set('Last-Modified', user.updatedAt);
  res.set('Content-Type', 'application/json');
  res.set('Content-Length', JSON.stringify(user).length);
  
  // Non invia il corpo della risposta
  res.end();
});
```

### OPTIONS

Il metodo OPTIONS restituisce i metodi HTTP supportati per una risorsa specifica. È spesso utilizzato per il preflight CORS.

```javascript
app.options('/users/:id', (req, res) => {
  res.set('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
});
```

## Implementazione in Express.js

Express.js fornisce metodi dedicati per gestire ciascun tipo di richiesta HTTP:

```javascript
const express = require('express');
const app = express();

// Middleware per il parsing del corpo JSON
app.use(express.json());

// Middleware per il parsing del corpo URL-encoded
app.use(express.urlencoded({ extended: true }));

// Gestione dei diversi metodi HTTP
app.get('/api/resource', (req, res) => { /* ... */ });
app.post('/api/resource', (req, res) => { /* ... */ });
app.put('/api/resource/:id', (req, res) => { /* ... */ });
app.patch('/api/resource/:id', (req, res) => { /* ... */ });
app.delete('/api/resource/:id', (req, res) => { /* ... */ });
app.head('/api/resource/:id', (req, res) => { /* ... */ });
app.options('/api/resource/:id', (req, res) => { /* ... */ });

// Metodo generico per gestire qualsiasi tipo di richiesta
app.all('/api/resource', (req, res, next) => {
  console.log(`Richiesta ${req.method} ricevuta a ${req.path}`);
  next(); // Passa al gestore successivo
});
```

```

## Scelta del Metodo HTTP Appropriato

La scelta del metodo HTTP appropriato è fondamentale per la progettazione di API RESTful coerenti e intuitive:

| Operazione | Metodo HTTP | Endpoint Esempio | Descrizione |
|------------|-------------|------------------|-------------|
| Recupera una collezione | GET | /users | Ottiene una lista di utenti |
| Recupera un elemento | GET | /users/123 | Ottiene un utente specifico |
| Crea un elemento | POST | /users | Crea un nuovo utente |
| Sostituisci un elemento | PUT | /users/123 | Sostituisce completamente un utente |
| Aggiorna parzialmente | PATCH | /users/123 | Aggiorna alcuni campi di un utente |
| Elimina un elemento | DELETE | /users/123 | Elimina un utente |

## Gestione delle Risposte HTTP

Ogni metodo HTTP dovrebbe restituire codici di stato appropriati:

- **200 OK**: La richiesta è stata completata con successo (GET, PUT, PATCH)
- **201 Created**: Una nuova risorsa è stata creata con successo (POST, a volte PUT)
- **204 No Content**: La richiesta è stata completata con successo ma non c'è contenuto da restituire (DELETE)
- **400 Bad Request**: La richiesta è malformata o contiene parametri non validi
- **401 Unauthorized**: Autenticazione richiesta
- **403 Forbidden**: L'utente è autenticato ma non ha i permessi necessari
- **404 Not Found**: La risorsa richiesta non esiste
- **405 Method Not Allowed**: Il metodo HTTP non è supportato per questa risorsa
- **500 Internal Server Error**: Errore generico del server

```javascript
// Esempio di gestione dei codici di stato in Express
app.get('/users/:id', (req, res) => {
  try {
    const userId = req.params.id;
    const user = getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Utente non trovato' 
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Errore interno del server',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
```

## Sicurezza e Considerazioni

Quando si implementano API che utilizzano diversi metodi HTTP, è importante considerare:

1. **Validazione dei dati**: Convalidare sempre i dati in ingresso per prevenire vulnerabilità come SQL injection o XSS.

2. **Autenticazione e autorizzazione**: Proteggere le risorse sensibili richiedendo autenticazione e verificando i permessi dell'utente.

3. **Rate limiting**: Limitare il numero di richieste per prevenire abusi o attacchi DoS.

4. **CORS (Cross-Origin Resource Sharing)**: Configurare correttamente le intestazioni CORS per consentire o limitare l'accesso da domini diversi.

5. **Idempotenza**: Assicurarsi che i metodi idempotenti (GET, PUT, DELETE) mantengano questa proprietà nell'implementazione.

```javascript
// Esempio di middleware per l'autenticazione
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Autenticazione richiesta' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token non valido' });
  }
};

// Applicazione del middleware di autenticazione a route protette
app.get('/users', authenticate, (req, res) => {
  // Solo utenti autenticati possono accedere a questa route
});
```

## Conclusione

I metodi HTTP sono fondamentali per la progettazione di API RESTful e applicazioni web moderne. La scelta del metodo appropriato per ogni operazione contribuisce a creare API intuitive, coerenti e conformi agli standard web. Express.js semplifica la gestione di questi metodi fornendo un'API chiara e flessibile per definire route e middleware che rispondono a diversi tipi di richieste HTTP.

Nella prossima sezione, esploreremo come gestire i parametri URL e le query string per personalizzare il comportamento delle nostre API in base ai dati forniti dal client.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Modulo Corrente: Gestione delle Richieste HTTP](../README.md)
- [Documento Successivo: Gestione dei Parametri URL](./02-parametri-url.md)