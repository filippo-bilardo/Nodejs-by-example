# Middleware e Routing

## Introduzione ai Middleware

I middleware sono funzioni che hanno accesso agli oggetti richiesta (`req`), risposta (`res`) e alla funzione `next` nel ciclo richiesta-risposta di un'applicazione Express. Rappresentano uno dei concetti più potenti e fondamentali di Express.js, permettendo di eseguire codice, modificare gli oggetti richiesta e risposta, terminare il ciclo richiesta-risposta o chiamare il middleware successivo nella pila.

## Funzionamento dei Middleware

Un middleware è essenzialmente una funzione con la seguente firma:

```javascript
function middleware(req, res, next) {
  // Logica del middleware
  next(); // Passa il controllo al prossimo middleware
}
```

La funzione `next()` è cruciale: quando viene chiamata, passa il controllo al middleware successivo nella pila. Se `next()` non viene chiamata, la richiesta rimane in sospeso e il client non riceverà mai una risposta.

## Tipi di Middleware

### 1. Middleware di Applicazione

I middleware di applicazione sono legati all'istanza dell'applicazione Express utilizzando `app.use()` o `app.METHOD()` (dove METHOD è un metodo HTTP come GET, POST, ecc.).

```javascript
const express = require('express');
const app = express();

// Middleware senza restrizioni di percorso (eseguito per ogni richiesta)
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

// Middleware con restrizioni di percorso
app.use('/user/:id', (req, res, next) => {
  console.log('Request Type:', req.method);
  next();
});

// Middleware con restrizioni di metodo e percorso
app.get('/user/:id', (req, res, next) => {
  console.log('User ID:', req.params.id);
  next();
});
```

### 2. Middleware di Router

I middleware di router funzionano come i middleware di applicazione, ma sono legati a un'istanza di `express.Router()`.

```javascript
const express = require('express');
const router = express.Router();

// Middleware di router
router.use((req, res, next) => {
  console.log('Router Middleware');
  next();
});

router.get('/user/:id', (req, res, next) => {
  // ...
  next();
});

module.exports = router;
```

### 3. Middleware di Gestione degli Errori

I middleware di gestione degli errori hanno una firma speciale con quattro argomenti (err, req, res, next):

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

Per utilizzare un middleware di gestione degli errori, è necessario passare un errore a `next()`:

```javascript
app.get('/error-example', (req, res, next) => {
  const err = new Error('Something went wrong!');
  err.statusCode = 500;
  next(err); // Passa l'errore al middleware di gestione degli errori
});
```

### 4. Middleware Integrati

Express include alcuni middleware integrati che possono essere utilizzati direttamente:

```javascript
// Middleware per il parsing del corpo delle richieste JSON
app.use(express.json());

// Middleware per il parsing del corpo delle richieste URL-encoded
app.use(express.urlencoded({ extended: true }));

// Middleware per servire file statici
app.use(express.static('public'));
```

### 5. Middleware di Terze Parti

Ci sono molti middleware di terze parti che possono essere utilizzati con Express. Ecco alcuni esempi popolari:

```javascript
// Morgan: middleware per il logging delle richieste HTTP
const morgan = require('morgan');
app.use(morgan('dev'));

// Helmet: middleware per la sicurezza che imposta varie intestazioni HTTP
const helmet = require('helmet');
app.use(helmet());

// CORS: middleware per abilitare Cross-Origin Resource Sharing
const cors = require('cors');
app.use(cors());

// Cookie-parser: middleware per il parsing dei cookie
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Express-session: middleware per la gestione delle sessioni
const session = require('express-session');
app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: true
}));
```

## Ordine dei Middleware

L'ordine in cui i middleware vengono definiti è importante. I middleware vengono eseguiti nell'ordine in cui sono definiti:

```javascript
// Questo middleware verrà eseguito per primo
app.use((req, res, next) => {
  console.log('First Middleware');
  next();
});

// Questo middleware verrà eseguito per secondo
app.use((req, res, next) => {
  console.log('Second Middleware');
  next();
});

// Questo middleware verrà eseguito per terzo
app.get('/', (req, res) => {
  res.send('Hello World!');
});
```

## Middleware Condizionali

È possibile eseguire middleware in modo condizionale:

```javascript
// Middleware condizionale
app.use((req, res, next) => {
  if (req.query.admin === 'true') {
    // Esegui questo middleware solo se il parametro query 'admin' è 'true'
    console.log('Admin route');
  }
  next();
});
```

## Catene di Middleware

È possibile definire più middleware per una singola route:

```javascript
const authenticate = (req, res, next) => {
  // Logica di autenticazione
  console.log('Authenticating...');
  next();
};

const authorize = (req, res, next) => {
  // Logica di autorizzazione
  console.log('Authorizing...');
  next();
};

const logRequest = (req, res, next) => {
  // Logica di logging
  console.log('Logging request...');
  next();
};

// Utilizzo di una catena di middleware
app.get('/protected-route', [authenticate, authorize, logRequest], (req, res) => {
  res.send('Protected Route');
});
```

## Routing in Express

Il routing si riferisce a come un'applicazione risponde a una richiesta client a un endpoint specifico, che è un URI (o percorso) e un metodo HTTP specifico (GET, POST, ecc.).

### Metodi di Routing Base

Express fornisce metodi che corrispondono ai metodi HTTP:

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

// Parametri opzionali
app.get('/users/:userId?', (req, res) => {
  if (req.params.userId) {
    res.send(`User ID: ${req.params.userId}`);
  } else {
    res.send('User ID not provided');
  }
});
```

### Route con Pattern Matching

Express supporta anche il pattern matching nelle route utilizzando espressioni regolari:

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

### Router di Express

Per applicazioni più grandi, è consigliabile organizzare le route in moduli separati utilizzando `express.Router`:

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

Con questa configurazione, le route definite in `users.js` saranno accessibili con il prefisso `/users`:

- `router.get('/')` corrisponde a `/users`
- `router.get('/:id')` corrisponde a `/users/:id`

### Organizzazione delle Route per Risorsa

Un approccio comune è organizzare le route per risorsa, seguendo i principi RESTful:

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

// GET /users - Ottieni tutti gli utenti
router.get('/', (req, res) => {
  // ...
});

// POST /users - Crea un nuovo utente
router.post('/', (req, res) => {
  // ...
});

// GET /users/:id - Ottieni un utente specifico
router.get('/:id', (req, res) => {
  // ...
});

// PUT /users/:id - Aggiorna un utente specifico
router.put('/:id', (req, res) => {
  // ...
});

// DELETE /users/:id - Elimina un utente specifico
router.delete('/:id', (req, res) => {
  // ...
});

module.exports = router;
```

### Route con Query Parameters

I parametri di query sono accessibili tramite `req.query`:

```javascript
// GET /search?q=express&limit=10
app.get('/search', (req, res) => {
  const query = req.query.q;
  const limit = req.query.limit;
  res.send(`Search for: ${query}, Limit: ${limit}`);
});
```

## Combinazione di Middleware e Routing

I middleware e il routing possono essere combinati in modo potente per creare applicazioni web robuste e modulari:

```javascript
// Middleware di autenticazione
const authenticate = (req, res, next) => {
  const isAuthenticated = /* logica di autenticazione */;
  if (isAuthenticated) {
    next(); // Utente autenticato, procedi
  } else {
    res.status(401).send('Unauthorized'); // Utente non autenticato
  }
};

// Middleware di autorizzazione
const authorize = (role) => {
  return (req, res, next) => {
    const userRole = /* ottieni il ruolo dell'utente */;
    if (userRole === role) {
      next(); // Utente autorizzato, procedi
    } else {
      res.status(403).send('Forbidden'); // Utente non autorizzato
    }
  };
};

// Utilizzo dei middleware nelle route
app.get('/admin', authenticate, authorize('admin'), (req, res) => {
  res.send('Admin Dashboard');
});

app.get('/profile', authenticate, (req, res) => {
  res.send('User Profile');
});

app.get('/public', (req, res) => {
  res.send('Public Page'); // Nessun middleware di autenticazione/autorizzazione
});
```

## Gestione degli Errori nel Routing

È importante gestire gli errori che possono verificarsi durante il routing:

```javascript
// Route che potrebbe generare un errore
app.get('/error-prone', (req, res, next) => {
  try {
    // Codice che potrebbe generare un errore
    throw new Error('Something went wrong!');
  } catch (err) {
    next(err); // Passa l'errore al middleware di gestione degli errori
  }
});

// Middleware di gestione degli errori (deve essere definito dopo tutte le altre route)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

## Middleware per la Validazione dei Dati

Un caso d'uso comune per i middleware è la validazione dei dati in ingresso:

```javascript
// Middleware di validazione
const validateUser = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  
  // Validazione email con regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  next(); // Dati validi, procedi
};

// Utilizzo del middleware di validazione
app.post('/users', validateUser, (req, res) => {
  // Crea un nuovo utente
  res.status(201).json({ message: 'User created successfully' });
});
```

## Conclusione

I middleware e il routing sono concetti fondamentali in Express.js che permettono di costruire applicazioni web modulari, robuste e manutenibili. I middleware forniscono un modo potente per eseguire codice durante il ciclo richiesta-risposta, mentre il routing permette di organizzare la logica dell'applicazione in base agli endpoint e ai metodi HTTP.

La combinazione di middleware e routing consente di implementare funzionalità come autenticazione, autorizzazione, validazione dei dati, logging e molto altro in modo modulare e riutilizzabile. Comprendere questi concetti è essenziale per sviluppare applicazioni web efficaci con Express.js.