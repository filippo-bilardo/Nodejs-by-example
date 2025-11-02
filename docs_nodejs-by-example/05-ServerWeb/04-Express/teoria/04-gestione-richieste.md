# 04. Gestione delle Richieste in Express.js

## Request Object (req)

L'oggetto `req` (request) rappresenta la richiesta HTTP e contiene proprietà per query string, parametri, body, headers, etc.

```javascript
app.get('/user/:id', (req, res) => {
    console.log(req.params);      // Parametri URL
    console.log(req.query);       // Query string
    console.log(req.body);        // Request body
    console.log(req.headers);     // HTTP headers
    console.log(req.method);      // Metodo HTTP
    console.log(req.url);         // URL completo
    console.log(req.ip);          // IP client
});
```

---

## Parametri URL (Route Parameters)

Parametri dinamici nell'URL definiti con `:nome`:

### Parametro Singolo

```javascript
// Route: /users/:id
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ userId: userId });
});

// GET /users/123
// → { "userId": "123" }
```

### Parametri Multipli

```javascript
// Route: /users/:userId/posts/:postId
app.get('/users/:userId/posts/:postId', (req, res) => {
    const { userId, postId } = req.params;
    res.json({
        userId: userId,
        postId: postId
    });
});

// GET /users/42/posts/789
// → { "userId": "42", "postId": "789" }
```

### Conversione Tipo

```javascript
app.get('/users/:id', (req, res) => {
    // req.params.id è sempre stringa!
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({ 
            error: 'ID deve essere un numero' 
        });
    }
    
    res.json({ userId: id });
});
```

### Validazione con Regex

```javascript
// Solo numeri
app.get('/users/:id(\\d+)', (req, res) => {
    res.json({ userId: req.params.id });
});

// Pattern personalizzato
app.get('/files/:name([a-z]+)\\.txt', (req, res) => {
    res.send(`File: ${req.params.name}.txt`);
});
```

---

## Query String

Parametri passati dopo `?` nell'URL:

### Query Singola

```javascript
app.get('/search', (req, res) => {
    const query = req.query.q;
    res.json({ searchQuery: query });
});

// GET /search?q=express
// → { "searchQuery": "express" }
```

### Query Multiple

```javascript
app.get('/products', (req, res) => {
    const { category, minPrice, maxPrice, sort } = req.query;
    
    res.json({
        category: category,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sort: sort
    });
});

// GET /products?category=electronics&minPrice=100&maxPrice=500&sort=price
// → {
//     "category": "electronics",
//     "minPrice": "100",
//     "maxPrice": "500",
//     "sort": "price"
//   }
```

### Array in Query String

```javascript
app.get('/filter', (req, res) => {
    const tags = req.query.tags;
    
    // Può essere stringa o array
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    
    res.json({ tags: tagsArray });
});

// GET /filter?tags=node&tags=express&tags=mongodb
// → { "tags": ["node", "express", "mongodb"] }

// GET /filter?tags=node
// → { "tags": ["node"] }
```

### Valori Default

```javascript
app.get('/api/posts', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'createdAt';
    
    res.json({
        page: page,
        limit: limit,
        sort: sort,
        data: []
    });
});

// GET /api/posts
// → { "page": 1, "limit": 10, "sort": "createdAt", "data": [] }

// GET /api/posts?page=2&limit=20&sort=title
// → { "page": 2, "limit": 20, "sort": "title", "data": [] }
```

### Parsing e Validazione

```javascript
app.get('/api/items', (req, res) => {
    // Parsing numeri
    const page = parseInt(req.query.page);
    if (isNaN(page) || page < 1) {
        return res.status(400).json({ error: 'Pagina non valida' });
    }
    
    // Parsing booleani
    const active = req.query.active === 'true';
    
    // Parsing date
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    
    // Whitelist valori
    const sortOptions = ['name', 'date', 'price'];
    const sort = sortOptions.includes(req.query.sort) ? req.query.sort : 'name';
    
    res.json({
        page: page,
        active: active,
        startDate: startDate,
        sort: sort
    });
});
```

---

## Request Body

Dati inviati nel body della richiesta (POST, PUT, PATCH):

### JSON Body

```javascript
const express = require('express');
const app = express();

// Middleware necessario per parsing JSON
app.use(express.json());

app.post('/api/users', (req, res) => {
    const { name, email, age } = req.body;
    
    // Validazione
    if (!name || !email) {
        return res.status(400).json({ 
            error: 'Nome e email sono obbligatori' 
        });
    }
    
    res.status(201).json({
        message: 'Utente creato',
        user: { name, email, age }
    });
});

/* Richiesta:
POST /api/users
Content-Type: application/json

{
    "name": "Mario Rossi",
    "email": "mario@example.com",
    "age": 30
}

Risposta:
{
    "message": "Utente creato",
    "user": {
        "name": "Mario Rossi",
        "email": "mario@example.com",
        "age": 30
    }
}
*/
```

### URL-Encoded Body (Form Data)

```javascript
// Middleware per form data
app.use(express.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
    const { username, password } = req.body;
    res.send(`Username: ${username}, Password: ${password}`);
});

/* Richiesta HTML Form:
<form action="/submit" method="POST">
    <input name="username" type="text">
    <input name="password" type="password">
    <button type="submit">Invia</button>
</form>

Body inviato:
username=mario&password=secret123
*/
```

### Multipart Form Data (File Upload)

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.file);    // Informazioni file
    console.log(req.body);    // Altri campi del form
    
    res.json({
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        formData: req.body
    });
});

/* Richiesta:
POST /upload
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="document.pdf"

[binary data]
------WebKitFormBoundary
Content-Disposition: form-data; name="description"

My document
------WebKitFormBoundary--
*/
```

### Multiple Files

```javascript
// Single file
app.post('/upload-single', upload.single('avatar'), (req, res) => {
    res.json({ file: req.file });
});

// Multiple files (stesso campo)
app.post('/upload-multiple', upload.array('photos', 10), (req, res) => {
    res.json({ files: req.files });
});

// Multiple files (campi diversi)
app.post('/upload-fields', upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'gallery', maxCount: 8 }
]), (req, res) => {
    res.json({
        avatar: req.files['avatar'],
        gallery: req.files['gallery']
    });
});
```

---

## Headers HTTP

### Lettura Headers

```javascript
app.get('/headers', (req, res) => {
    // Tutti gli headers
    console.log(req.headers);
    
    // Header specifico
    const userAgent = req.get('User-Agent');
    const contentType = req.get('Content-Type');
    const authorization = req.get('Authorization');
    
    res.json({
        userAgent: userAgent,
        contentType: contentType,
        authorization: authorization,
        allHeaders: req.headers
    });
});

/* Headers richiesta:
GET /headers HTTP/1.1
Host: localhost:3000
User-Agent: Mozilla/5.0...
Accept: application/json
Authorization: Bearer token123
*/
```

### Impostazione Headers Risposta

```javascript
app.get('/api/data', (req, res) => {
    // Singolo header
    res.set('X-Custom-Header', 'value');
    
    // Multiple headers
    res.set({
        'X-Powered-By': 'My App',
        'X-Version': '1.0.0',
        'Cache-Control': 'no-cache'
    });
    
    // Content-Type
    res.type('json');
    // o res.set('Content-Type', 'application/json');
    
    res.json({ data: 'response' });
});
```

### Headers Comuni

```javascript
app.post('/api/auth', (req, res) => {
    // Authorization header
    const token = req.get('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Token mancante' });
    }
    
    // Bearer token
    const bearerToken = token.replace('Bearer ', '');
    
    // API Key
    const apiKey = req.get('X-API-Key');
    
    // Content-Type
    const contentType = req.get('Content-Type');
    
    res.json({ authenticated: true });
});
```

---

## Cookies

### Configurazione Cookie Parser

```javascript
const cookieParser = require('cookie-parser');

app.use(cookieParser('secret-key')); // Secret opzionale per signed cookies
```

### Lettura Cookies

```javascript
app.get('/cookies', (req, res) => {
    // Tutti i cookies
    console.log(req.cookies);
    
    // Cookie specifico
    const sessionId = req.cookies.sessionId;
    const username = req.cookies.username;
    
    // Signed cookies
    const secureData = req.signedCookies.secureData;
    
    res.json({
        cookies: req.cookies,
        signedCookies: req.signedCookies
    });
});
```

### Impostazione Cookies

```javascript
app.get('/set-cookie', (req, res) => {
    // Cookie semplice
    res.cookie('username', 'mario');
    
    // Cookie con opzioni
    res.cookie('sessionId', 'abc123', {
        maxAge: 900000,        // 15 minuti in ms
        httpOnly: true,        // Non accessibile da JavaScript
        secure: true,          // Solo HTTPS
        sameSite: 'strict',    // Protezione CSRF
        signed: true           // Cookie firmato
    });
    
    // Cookie con expiry date
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 ora
    res.cookie('token', 'xyz789', { expires: expiryDate });
    
    res.send('Cookies impostati');
});
```

### Eliminazione Cookies

```javascript
app.get('/logout', (req, res) => {
    // Elimina cookie specifico
    res.clearCookie('sessionId');
    res.clearCookie('username');
    
    res.send('Logout effettuato');
});
```

---

## Altre Proprietà Request

### Informazioni Client

```javascript
app.get('/info', (req, res) => {
    res.json({
        // Metodo HTTP
        method: req.method,
        
        // URL e componenti
        url: req.url,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl,
        path: req.path,
        
        // Host e protocollo
        protocol: req.protocol,
        hostname: req.hostname,
        host: req.get('host'),
        
        // IP client
        ip: req.ip,
        ips: req.ips,
        
        // Sicurezza
        secure: req.secure,        // true se HTTPS
        xhr: req.xhr,              // true se AJAX request
        
        // Altri
        fresh: req.fresh,
        stale: req.stale,
        subdomains: req.subdomains
    });
});
```

### Request Properties

```javascript
app.get('/demo/:id', (req, res) => {
    console.log('req.params:', req.params);       // { id: '123' }
    console.log('req.query:', req.query);         // { search: 'test' }
    console.log('req.body:', req.body);           // { name: 'Mario' }
    console.log('req.route:', req.route);         // Informazioni route
    console.log('req.app:', req.app);             // Istanza Express app
    
    res.send('Check console');
});
```

---

## Validazione e Sanitizzazione

### Validazione Manuale

```javascript
app.post('/api/users', (req, res) => {
    const { name, email, age } = req.body;
    const errors = [];
    
    // Validazione nome
    if (!name || name.trim().length < 2) {
        errors.push('Nome deve essere almeno 2 caratteri');
    }
    
    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Email non valida');
    }
    
    // Validazione età
    if (age !== undefined && (age < 0 || age > 120)) {
        errors.push('Età non valida');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }
    
    res.json({ message: 'Utente valido', user: { name, email, age } });
});
```

### Express Validator

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/users',
    // Validazione
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('age').optional().isInt({ min: 0, max: 120 }),
    body('password').isLength({ min: 8 }).matches(/\d/).matches(/[A-Z]/),
    
    // Handler
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        res.json({ message: 'Dati validi', data: req.body });
    }
);
```

### Sanitizzazione

```javascript
const sanitize = (req, res, next) => {
    // Trim strings
    for (let key in req.body) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = req.body[key].trim();
        }
    }
    
    // Rimuovi caratteri pericolosi
    const dangerous = /<script|<iframe|javascript:/gi;
    for (let key in req.body) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = req.body[key].replace(dangerous, '');
        }
    }
    
    next();
};

app.use(sanitize);
```

---

## Gestione Errori Richieste

### Validazione Parametri

```javascript
const validateUserId = (req, res, next) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
        return res.status(400).json({
            error: 'ID non valido',
            details: 'ID deve essere un numero positivo'
        });
    }
    
    req.userId = id; // Aggiungi al req
    next();
};

app.get('/users/:id', validateUserId, (req, res) => {
    // req.userId è già validato
    res.json({ userId: req.userId });
});
```

### Request Size Limit

```javascript
// Limita dimensione JSON body
app.use(express.json({ limit: '10mb' }));

// Limita dimensione URL-encoded
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Gestione errore payload troppo grande
app.use((err, req, res, next) => {
    if (err.status === 413) {
        return res.status(413).json({
            error: 'Payload troppo grande',
            maxSize: '10MB'
        });
    }
    next(err);
});
```

---

## Best Practices

### 1. Sempre Validare Input

```javascript
// ❌ Male
app.post('/users', (req, res) => {
    const user = req.body;
    saveUser(user); // Pericoloso!
});

// ✅ Bene
app.post('/users', validateUser, (req, res) => {
    const user = req.body;
    saveUser(user);
});
```

### 2. Usa Destructuring

```javascript
// ✅ Pulito
app.post('/api/data', (req, res) => {
    const { name, email, age } = req.body;
    // Usa solo campi necessari
});
```

### 3. Valori Default

```javascript
app.get('/api/posts', (req, res) => {
    const {
        page = 1,
        limit = 10,
        sort = 'createdAt'
    } = req.query;
    
    res.json({ page, limit, sort });
});
```

### 4. Type Conversion

```javascript
// Converti sempre i tipi
const page = parseInt(req.query.page) || 1;
const active = req.query.active === 'true';
const price = parseFloat(req.query.price);
```

---

## Esercizi Pratici

### Esercizio 1: API Prodotti
Crea un'API che accetta:
- Query params: category, minPrice, maxPrice, page, limit
- Validazione tutti i parametri
- Return paginazione + filtri applicati

### Esercizio 2: Upload File
Implementa upload con:
- Solo immagini (jpg, png)
- Max 5MB
- Rinomina file con timestamp
- Salva metadata in JSON

### Esercizio 3: Form Validation
Crea form con validazione:
- Nome (2-50 caratteri)
- Email (formato valido)
- Password (min 8 caratteri, 1 maiuscola, 1 numero)
- Età (18-100)

---

## Prossimo Capitolo

Continua con **[05. Template Engine](./05-template-engine.md)** per il rendering dinamico di HTML.
