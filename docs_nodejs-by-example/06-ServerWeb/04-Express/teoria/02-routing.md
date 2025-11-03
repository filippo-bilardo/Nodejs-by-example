# 02. Routing in Express.js

## Cos'è il Routing?

Il **routing** è il meccanismo che determina come un'applicazione risponde a una richiesta client verso un particolare endpoint, che è una combinazione di:
- **URI (o path)**: es. `/users`, `/products/123`
- **Metodo HTTP**: GET, POST, PUT, DELETE, etc.

```
Richiesta Client → Route → Handler Function → Risposta
```

---

## Routing di Base

### Sintassi Fondamentale

```javascript
app.METHOD(PATH, HANDLER)
```

Dove:
- `app` è un'istanza di Express
- `METHOD` è un metodo HTTP in minuscolo
- `PATH` è il percorso sul server
- `HANDLER` è la funzione eseguita quando la route viene matchata

### Esempi Base

```javascript
const express = require('express');
const app = express();

// GET request alla home page
app.get('/', (req, res) => {
    res.send('GET request alla root');
});

// POST request alla root
app.post('/', (req, res) => {
    res.send('POST request alla root');
});

// PUT request a /user
app.put('/user', (req, res) => {
    res.send('PUT request a /user');
});

// DELETE request a /user
app.delete('/user', (req, res) => {
    res.send('DELETE request a /user');
});
```

---

## Metodi di Route

### app.all()
Risponde a **tutti** i metodi HTTP:

```javascript
app.all('/secret', (req, res) => {
    console.log('Accesso alla sezione segreta...');
    res.send('Sezione segreta accessibile con qualsiasi metodo HTTP');
});

// Utile per middleware specifico di una route
app.all('/api/*', requireAuth, (req, res, next) => {
    console.log('Tutte le API richiedono autenticazione');
    next();
});
```

### Route Multiple per Stesso Path

```javascript
// Diverse funzioni per stesso path
app.get('/users', getAllUsers);
app.post('/users', createUser);
app.put('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);

// Oppure con route chaining
app.route('/book')
    .get((req, res) => {
        res.send('Get a random book');
    })
    .post((req, res) => {
        res.send('Add a book');
    })
    .put((req, res) => {
        res.send('Update the book');
    });
```

---

## Parametri di Route

### Parametri Nominati (Named Parameters)

```javascript
// Parametro singolo
app.get('/users/:userId', (req, res) => {
    const userId = req.params.userId;
    res.send(`User ID: ${userId}`);
});
// /users/123 → User ID: 123

// Parametri multipli
app.get('/users/:userId/books/:bookId', (req, res) => {
    const { userId, bookId } = req.params;
    res.send(`User ${userId}, Book ${bookId}`);
});
// /users/42/books/99 → User 42, Book 99

// Parametri con trattini
app.get('/flights/:from-:to', (req, res) => {
    const { from, to } = req.params;
    res.send(`Flight from ${from} to ${to}`);
});
// /flights/LAX-SFO → Flight from LAX to SFO
```

### Parametri con Espressioni Regolari

```javascript
// Solo numeri
app.get('/user/:id(\\d+)', (req, res) => {
    res.send(`User ID (solo numeri): ${req.params.id}`);
});
// /user/123 ✓
// /user/abc ✗

// Pattern personalizzati
app.get('/file/:name([a-z]+).txt', (req, res) => {
    res.send(`File: ${req.params.name}.txt`);
});
// /file/document.txt ✓
// /file/Document.txt ✗ (maiuscole non permesse)

// Range di valori
app.get('/range/:number(\\d{1,3})', (req, res) => {
    res.send(`Number (1-3 digits): ${req.params.number}`);
});
// /range/5 ✓
// /range/42 ✓
// /range/1234 ✗
```

### Parametri Opzionali

```javascript
// Parametro opzionale con ?
app.get('/users/:userId/books/:bookId?', (req, res) => {
    if (req.params.bookId) {
        res.send(`User ${req.params.userId}, Book ${req.params.bookId}`);
    } else {
        res.send(`User ${req.params.userId}, all books`);
    }
});
// /users/42/books/99 → User 42, Book 99
// /users/42/books → User 42, all books
```

---

## Query String

Parametri passati dopo `?` nell'URL:

```javascript
app.get('/search', (req, res) => {
    const { q, page, limit } = req.query;
    
    res.json({
        query: q,
        page: page || 1,
        limit: limit || 10
    });
});

// /search?q=express&page=2&limit=20
// → { query: "express", page: "2", limit: "20" }

// Array in query string
app.get('/filter', (req, res) => {
    // /filter?tags=node&tags=express&tags=js
    console.log(req.query.tags); // ['node', 'express', 'js']
    res.json({ tags: req.query.tags });
});
```

---

## Pattern Matching

### Caratteri Speciali nelle Route

```javascript
// ? = carattere opzionale
app.get('/ab?cd', (req, res) => {
    res.send('ab?cd');
});
// Match: /acd, /abcd

// + = uno o più
app.get('/ab+cd', (req, res) => {
    res.send('ab+cd');
});
// Match: /abcd, /abbcd, /abbbcd, etc.

// * = qualsiasi cosa
app.get('/ab*cd', (req, res) => {
    res.send('ab*cd');
});
// Match: /abcd, /abxcd, /abRANDOMcd, /ab123cd, etc.

// Raggruppamento con ()
app.get('/ab(cd)?e', (req, res) => {
    res.send('ab(cd)?e');
});
// Match: /abe, /abcde
```

### Espressioni Regolari

```javascript
// Regex come secondo parametro
app.get(/.*fly$/, (req, res) => {
    res.send('Pattern /.*fly$/');
});
// Match: /butterfly, /dragonfly
// No match: /butterfly/

// Gruppi di cattura
app.get(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, (req, res) => {
    res.json({
        from: req.params[0],
        to: req.params[1]
    });
});
// /commits/abc123 → { from: 'abc123', to: undefined }
// /commits/abc123..def456 → { from: 'abc123', to: 'def456' }
```

---

## Router Modulare

### express.Router()

Crea route modulari e montabili:

**`routes/users.js`:**
```javascript
const express = require('express');
const router = express.Router();

// Middleware specifico per questo router
router.use((req, res, next) => {
    console.log('Time:', Date.now());
    next();
});

// Home page del router
router.get('/', (req, res) => {
    res.send('Users home page');
});

// About page
router.get('/about', (req, res) => {
    res.send('About users');
});

// User specifico
router.get('/:id', (req, res) => {
    res.send(`User ${req.params.id}`);
});

module.exports = router;
```

**`app.js`:**
```javascript
const express = require('express');
const app = express();
const usersRouter = require('./routes/users');

// Monta il router
app.use('/users', usersRouter);

// Le route diventano:
// /users → Users home page
// /users/about → About users
// /users/123 → User 123
```

### Struttura Modulare Completa

```
my-app/
├── routes/
│   ├── index.js
│   ├── users.js
│   ├── products.js
│   └── api/
│       ├── v1/
│       │   ├── users.js
│       │   └── products.js
│       └── v2/
│           ├── users.js
│           └── products.js
└── app.js
```

**`app.js`:**
```javascript
const express = require('express');
const app = express();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const apiV1Router = require('./routes/api/v1');
const apiV2Router = require('./routes/api/v2');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/api/v1', apiV1Router);
app.use('/api/v2', apiV2Router);
```

---

## Response Methods

Metodi per inviare risposte al client:

```javascript
app.get('/examples', (req, res) => {
    // Invia stringa o HTML
    res.send('<h1>Hello</h1>');
    
    // Invia JSON
    res.json({ message: 'Hello JSON' });
    
    // Invia file
    res.sendFile('/path/to/file.pdf');
    
    // Download file
    res.download('/path/to/file.pdf');
    
    // Redirect
    res.redirect('/new-url');
    res.redirect(301, '/moved-permanently');
    
    // Render template
    res.render('index', { title: 'My App' });
    
    // Imposta status code
    res.status(404).send('Not Found');
    res.status(500).json({ error: 'Server Error' });
    
    // Invia solo status
    res.sendStatus(200); // "OK"
    res.sendStatus(404); // "Not Found"
    
    // Chain methods
    res.status(404).json({ error: 'User not found' });
});
```

---

## Handler con Callback Multiple

### Array di Callback

```javascript
const auth = (req, res, next) => {
    if (req.query.admin === 'true') {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

const logger = (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
};

// Array di middleware
app.get('/admin', [auth, logger], (req, res) => {
    res.send('Admin panel');
});
```

### Callback Separate

```javascript
const cb0 = (req, res, next) => {
    console.log('CB0');
    next();
};

const cb1 = (req, res, next) => {
    console.log('CB1');
    next();
};

const cb2 = (req, res) => {
    res.send('Hello from C!');
};

app.get('/example/c', [cb0, cb1, cb2]);

// O misti
app.get('/example/d', [cb0, cb1], (req, res, next) => {
    console.log('Last callback');
    next();
}, (req, res) => {
    res.send('Hello from D!');
});
```

---

## Route Prefix e Versioning

### API Versioning

```javascript
// Versione 1
const v1Router = express.Router();
v1Router.get('/users', (req, res) => {
    res.json({ version: 1, users: [] });
});
app.use('/api/v1', v1Router);

// Versione 2
const v2Router = express.Router();
v2Router.get('/users', (req, res) => {
    res.json({ version: 2, users: [], metadata: {} });
});
app.use('/api/v2', v2Router);

// Accesso:
// /api/v1/users → Versione 1
// /api/v2/users → Versione 2
```

### Organizzazione per Feature

```javascript
// Feature: User Management
const userRouter = express.Router();
userRouter.get('/', getUsers);
userRouter.post('/', createUser);
userRouter.get('/:id', getUserById);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);

// Feature: Authentication
const authRouter = express.Router();
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/refresh', refreshToken);

// Monta le feature
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
```

---

## Gestione 404 e Errori

### Route 404 (Not Found)

```javascript
// Deve essere DOPO tutte le altre route
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});
```

### Error Handler

```javascript
// Deve avere 4 parametri (err, req, res, next)
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    res.status(err.status || 500).json({
        error: {
            message: err.message,
            status: err.status || 500
        }
    });
});

// Esempio di utilizzo
app.get('/error', (req, res, next) => {
    const error = new Error('Qualcosa è andato storto');
    error.status = 500;
    next(error); // Passa l'errore all'error handler
});
```

---

## Best Practices

### 1. Organizzazione Route

```javascript
// ❌ Male: tutto in app.js
app.get('/users', ...);
app.post('/users', ...);
app.get('/products', ...);
app.post('/products', ...);

// ✅ Bene: router modulari
app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));
```

### 2. Naming Convention

```javascript
// ✅ Usa nomi al plurale per collezioni
app.get('/users', getAllUsers);
app.get('/users/:id', getUserById);

// ✅ Usa REST conventions
GET    /users        // List
GET    /users/:id    // Get one
POST   /users        // Create
PUT    /users/:id    // Update (full)
PATCH  /users/:id    // Update (partial)
DELETE /users/:id    // Delete
```

### 3. Validazione Parametri

```javascript
app.get('/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: 'Invalid ID' });
    }
    
    // Procedi con logica
});
```

### 4. Documentazione Route

```javascript
/**
 * GET /api/users/:id
 * Recupera utente per ID
 * 
 * @param {number} id - ID utente
 * @returns {Object} Dati utente
 */
app.get('/api/users/:id', async (req, res) => {
    // implementazione
});
```

---

## Esercizi Pratici

### Esercizio 1: CRUD Completo
Crea un router per gestire una risorsa "books" con:
- GET /books - Lista tutti i libri
- GET /books/:id - Dettaglio libro
- POST /books - Crea nuovo libro
- PUT /books/:id - Aggiorna libro
- DELETE /books/:id - Elimina libro

### Esercizio 2: Nested Routes
Implementa route annidate:
- GET /authors/:authorId/books - Libri di un autore
- GET /authors/:authorId/books/:bookId - Libro specifico di autore

### Esercizio 3: API Versioning
Crea due versioni di un'API:
- /api/v1/products - Risponde con array semplice
- /api/v2/products - Risponde con oggetto + metadata

---

## Prossimo Capitolo

Continua con **[03. Middleware](./03-middleware.md)** per imparare a estendere le funzionalità di Express.
