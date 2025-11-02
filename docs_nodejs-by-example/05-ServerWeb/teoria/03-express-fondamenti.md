# Express.js: Concetti Fondamentali

## Introduzione a Express.js

Express.js è un framework web minimalista, flessibile e veloce per Node.js. È diventato lo standard de facto per lo sviluppo di applicazioni web e API in Node.js grazie alla sua semplicità, potenza e flessibilità. Express.js si basa sul modulo HTTP nativo di Node.js, ma fornisce un'API più intuitiva e funzionalità aggiuntive che semplificano lo sviluppo di applicazioni web.

## Installazione di Express.js

Per utilizzare Express.js in un progetto Node.js, è necessario installarlo tramite NPM:

```bash
# Creazione di un nuovo progetto
mkdir mio-progetto-express
cd mio-progetto-express
npm init -y

# Installazione di Express
npm install express
```

## Creazione di un Server Base con Express

Ecco un esempio di un server base creato con Express.js:

```javascript
// Importazione del modulo Express
const express = require('express');

// Creazione dell'applicazione Express
const app = express();

// Definizione di una route per la home page
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Avvio del server sulla porta 3000
app.listen(3000, () => {
  console.log('Server Express in ascolto sulla porta 3000');
});
```

In questo esempio:

1. Importiamo il modulo Express.
2. Creiamo un'istanza dell'applicazione Express.
3. Definiamo una route per la home page che risponde alle richieste GET.
4. Avviamo il server sulla porta 3000.

## Routing in Express

Il routing si riferisce a come un'applicazione risponde a una richiesta client a un endpoint specifico, che è un URI (o percorso) e un metodo HTTP specifico (GET, POST, ecc.).

### Metodi di Routing Base

Express supporta tutti i metodi HTTP standard:

```javascript
// GET method route
app.get('/', (req, res) => {
  res.send('GET request to the homepage');
});

// POST method route
app.post('/', (req, res) => {
  res.send('POST request to the homepage');
});

// PUT method route
app.put('/user', (req, res) => {
  res.send('PUT request to /user');
});

// DELETE method route
app.delete('/user', (req, res) => {
  res.send('DELETE request to /user');
});

// Metodo generico per tutti i metodi HTTP
app.all('/secret', (req, res, next) => {
  console.log('Accessing the secret section...');
  next(); // passa il controllo al prossimo handler
});
```

### Route con Parametri

Express permette di definire route con parametri dinamici:

```javascript
// Route con un parametro
app.get('/users/:userId', (req, res) => {
  res.send(`User ID: ${req.params.userId}`);
});

// Route con più parametri
app.get('/users/:userId/books/:bookId', (req, res) => {
  res.send(`User ID: ${req.params.userId}, Book ID: ${req.params.bookId}`);
});
```

### Route con Pattern Matching

Express supporta anche il pattern matching nelle route:

```javascript
// Route che corrisponde a qualsiasi percorso che inizia con 'a'
app.get('/a*', (req, res) => {
  res.send('Route matches any path starting with a');
});

// Route che corrisponde a 'fly' o 'flight'
app.get('/f(ly|light)', (req, res) => {
  res.send('Route matches fly or flight');
});
```

## Gestione delle Richieste e delle Risposte

Express fornisce oggetti `req` (richiesta) e `res` (risposta) che rappresentano la richiesta HTTP e la risposta HTTP che l'applicazione invierà.

### L'Oggetto Request (req)

L'oggetto `req` rappresenta la richiesta HTTP e ha proprietà per i parametri della query string, i parametri della route, il corpo della richiesta, le intestazioni HTTP, ecc.

```javascript
app.get('/example', (req, res) => {
  console.log(req.query);     // Query string parameters (e.g., ?name=John)
  console.log(req.params);    // Route parameters (e.g., /users/:id)
  console.log(req.body);      // Body of the request (requires middleware)
  console.log(req.headers);   // HTTP headers
  console.log(req.path);      // Path part of the URL
  console.log(req.method);    // HTTP method
  console.log(req.ip);        // IP address of the client
  console.log(req.protocol);  // Protocol (http or https)
  
  // Resto del codice...
});
```

### L'Oggetto Response (res)

L'oggetto `res` rappresenta la risposta HTTP che un'applicazione Express invia quando riceve una richiesta HTTP.

```javascript
app.get('/example', (req, res) => {
  // Inviare una risposta
  res.send('Hello World!');
  
  // Inviare un file
  res.sendFile('/path/to/file.html');
  
  // Inviare JSON
  res.json({ user: 'John', id: 123 });
  
  // Impostare lo stato HTTP
  res.status(404).send('Not Found');
  
  // Reindirizzare
  res.redirect('/another-page');
  
  // Impostare intestazioni
  res.set('Content-Type', 'text/html');
  
  // Renderizzare una vista (richiede un template engine)
  res.render('index', { title: 'Express' });
});
```

## Middleware in Express

I middleware sono funzioni che hanno accesso all'oggetto richiesta (`req`), all'oggetto risposta (`res`) e alla funzione `next` nel ciclo richiesta-risposta dell'applicazione. I middleware possono eseguire le seguenti attività:

- Eseguire qualsiasi codice.
- Modificare gli oggetti richiesta e risposta.
- Terminare il ciclo richiesta-risposta.
- Chiamare il prossimo middleware nella pila.

### Middleware di Applicazione

I middleware di applicazione sono legati all'istanza dell'applicazione utilizzando `app.use()` e `app.METHOD()`.

```javascript
// Middleware che viene eseguito per ogni richiesta
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

// Middleware che viene eseguito solo per le richieste a un percorso specifico
app.use('/user/:id', (req, res, next) => {
  console.log('Request Type:', req.method);
  next();
});

// Middleware che viene eseguito solo per le richieste GET a un percorso specifico
app.get('/user/:id', (req, res, next) => {
  console.log('ID:', req.params.id);
  next();
}, (req, res, next) => {
  res.send('User Info');
});
```

### Middleware Integrati

Express include alcuni middleware integrati che possono essere utilizzati direttamente:

```javascript
// Middleware per il parsing del corpo delle richieste JSON
app.use(express.json());

// Middleware per il parsing del corpo delle richieste URL-encoded
app.use(express.urlencoded({ extended: true }));

// Middleware per servire file statici
app.use(express.static('public'));
```

### Middleware di Terze Parti

Ci sono molti middleware di terze parti che possono essere utilizzati con Express:

```javascript
// Esempio di utilizzo di middleware di terze parti
const morgan = require('morgan'); // Middleware per il logging
const helmet = require('helmet'); // Middleware per la sicurezza

app.use(morgan('dev')); // Logging delle richieste
app.use(helmet()); // Impostazione di intestazioni di sicurezza
```

## Gestione degli Errori

Express fornisce un modo per gestire gli errori attraverso middleware speciali con quattro argomenti:

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

Per utilizzare questo middleware, è necessario passare un errore a `next()`:

```javascript
app.get('/error-example', (req, res, next) => {
  try {
    // Codice che potrebbe generare un errore
    throw new Error('Something went wrong!');
  } catch (err) {
    next(err); // Passa l'errore al middleware di gestione degli errori
  }
});
```

## Servire File Statici

Express fornisce un middleware integrato `express.static` per servire file statici, come immagini, file CSS, file JavaScript, ecc.

```javascript
// Servire file statici dalla directory 'public'
app.use(express.static('public'));

// Servire file statici dalla directory 'public' con un prefisso di percorso
app.use('/static', express.static('public'));
```

Con questa configurazione, i file nella directory `public` saranno serviti direttamente:

- `public/images/logo.png` sarà accessibile come `http://localhost:3000/images/logo.png`
- Con il prefisso, sarà accessibile come `http://localhost:3000/static/images/logo.png`

## Template Engines

Express può essere utilizzato con template engines per generare HTML dinamicamente. Alcuni template engines popolari sono EJS, Pug, Handlebars e Mustache.

```javascript
// Impostazione del template engine
app.set('view engine', 'ejs');
app.set('views', './views'); // Directory delle viste

// Renderizzazione di una vista
app.get('/', (req, res) => {
  res.render('index', { title: 'Express', message: 'Hello World!' });
});
```

## Routing Modulare

Per applicazioni più grandi, è consigliabile organizzare le route in moduli separati:

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

// Middleware specifico per questo router
router.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

// Definizione delle route
router.get('/', (req, res) => {
  res.send('Users home page');
});

router.get('/:id', (req, res) => {
  res.send(`User ID: ${req.params.id}`);
});

module.exports = router;
```

```javascript
// app.js
const express = require('express');
const app = express();
const usersRouter = require('./routes/users');

// Utilizzo del router
app.use('/users', usersRouter);

app.listen(3000, () => {
  console.log('Server Express in ascolto sulla porta 3000');
});
```

## Conclusione

Express.js è un framework potente e flessibile per lo sviluppo di applicazioni web in Node.js. Fornisce un'API intuitiva per gestire richieste HTTP, definire route, utilizzare middleware e molto altro. La sua semplicità e la vasta gamma di middleware disponibili lo rendono una scelta eccellente per lo sviluppo di applicazioni web e API.

Nel prossimo capitolo, esploreremo in dettaglio i middleware e il routing in Express.js, approfondendo come utilizzarli per costruire applicazioni web più complesse e modulari.