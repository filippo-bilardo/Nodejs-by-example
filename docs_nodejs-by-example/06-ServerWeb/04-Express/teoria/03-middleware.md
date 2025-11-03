# 03. Middleware in Express.js

## Cos'è un Middleware?

Un **middleware** è una funzione che ha accesso all'oggetto richiesta (`req`), all'oggetto risposta (`res`) e alla funzione `next` nel ciclo richiesta-risposta dell'applicazione.

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
              ↓               ↓               ↓
           next()         next()        res.send()
```

### Funzioni del Middleware

I middleware possono:
- ✅ Eseguire codice arbitrario
- ✅ Modificare `req` e `res`
- ✅ Terminare il ciclo richiesta-risposta
- ✅ Chiamare il prossimo middleware con `next()`

---

## Anatomia di un Middleware

### Struttura Base

```javascript
function myMiddleware(req, res, next) {
    // 1. Esegui codice
    console.log('Middleware eseguito');
    
    // 2. Modifica req/res (opzionale)
    req.customProperty = 'valore';
    
    // 3. Chiama next() per passare al prossimo middleware
    next();
    
    // OPPURE termina la richiesta
    // res.send('Risposta dal middleware');
}
```

### Esempio Pratico

```javascript
const express = require('express');
const app = express();

// Middleware di logging
const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
};

// Usa il middleware
app.use(logger);

app.get('/', (req, res) => {
    res.send('Home Page');
});

// Output console:
// [2024-11-01T10:30:45.123Z] GET /
```

---

## Tipi di Middleware

### 1. Application-level Middleware

Middleware legati all'istanza `app`:

```javascript
const express = require('express');
const app = express();

// Middleware per TUTTE le route
app.use((req, res, next) => {
    console.log('Eseguito per ogni richiesta');
    next();
});

// Middleware per path specifico
app.use('/api', (req, res, next) => {
    console.log('Eseguito solo per /api/*');
    next();
});

// Middleware per metodo specifico
app.get('/users', (req, res, next) => {
    console.log('GET /users');
    next();
}, (req, res) => {
    res.send('Lista utenti');
});
```

### 2. Router-level Middleware

Middleware legati a `express.Router()`:

```javascript
const router = express.Router();

// Middleware per questo router
router.use((req, res, next) => {
    console.log('Router middleware');
    next();
});

// Middleware per route specifica
router.use('/user/:id', (req, res, next) => {
    console.log(`User ID: ${req.params.id}`);
    next();
});

router.get('/user/:id', (req, res) => {
    res.send('User page');
});

app.use('/api', router);
```

### 3. Error-handling Middleware

Middleware con **4 parametri** per gestire errori:

```javascript
// Deve avere 4 parametri: err, req, res, next
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Qualcosa è andato storto!',
        message: err.message
    });
});

// Generare un errore
app.get('/error', (req, res, next) => {
    const error = new Error('Errore personalizzato');
    error.status = 400;
    next(error); // Passa al error handler
});
```

### 4. Built-in Middleware

Middleware forniti da Express:

```javascript
// Parse JSON body
app.use(express.json());

// Parse URL-encoded body (form data)
app.use(express.urlencoded({ extended: true }));

// Serve file statici
app.use(express.static('public'));
app.use('/static', express.static('public'));

// Esempio completo
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/api/data', (req, res) => {
    // req.body è già parsato grazie a express.json()
    console.log(req.body);
    res.json({ received: req.body });
});
```

### 5. Third-party Middleware

Middleware di terze parti:

```javascript
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

// HTTP request logger
app.use(morgan('combined'));

// Sicurezza headers
app.use(helmet());

// CORS
app.use(cors());

// Compressione gzip
app.use(compression());
```

---

## Ordine di Esecuzione

L'ordine in cui i middleware sono definiti è **cruciale**:

```javascript
const express = require('express');
const app = express();

// 1. Primo middleware
app.use((req, res, next) => {
    console.log('1');
    next();
});

// 2. Secondo middleware
app.use((req, res, next) => {
    console.log('2');
    next();
});

// 3. Route handler
app.get('/', (req, res) => {
    console.log('3');
    res.send('Done');
});

// 4. Questo NON viene eseguito (route già gestita)
app.use((req, res, next) => {
    console.log('4 - Mai eseguito');
    next();
});

// Richiesta GET / → Output console:
// 1
// 2
// 3
```

### Esempio Completo Ordinato

```javascript
const express = require('express');
const app = express();

// 1. Middleware globali all'inizio
app.use(express.json());
app.use(express.static('public'));

// 2. Logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// 3. Route specifiche
app.get('/', (req, res) => {
    res.send('Home');
});

app.get('/api/data', (req, res) => {
    res.json({ data: [] });
});

// 4. 404 Handler (dopo tutte le route)
app.use((req, res) => {
    res.status(404).send('Not Found');
});

// 5. Error Handler (ultimo)
app.use((err, req, res, next) => {
    res.status(500).json({ error: err.message });
});
```

---

## Middleware Personalizzati

### Logger Personalizzato

```javascript
const logger = (req, res, next) => {
    const start = Date.now();
    
    // Intercetta quando la risposta finisce
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
            `[${new Date().toISOString()}]`,
            req.method,
            req.originalUrl,
            res.statusCode,
            `${duration}ms`
        );
    });
    
    next();
};

app.use(logger);

// Output:
// [2024-11-01T10:30:45.123Z] GET /api/users 200 45ms
```

### Authentication Middleware

```javascript
const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ error: 'Token mancante' });
    }
    
    // Verifica token (esempio semplificato)
    if (token === 'Bearer valid-token') {
        req.user = { id: 1, name: 'Mario' };
        next();
    } else {
        res.status(403).json({ error: 'Token non valido' });
    }
};

// Route protetta
app.get('/api/protected', requireAuth, (req, res) => {
    res.json({ 
        message: 'Dati protetti',
        user: req.user 
    });
});
```

### Validation Middleware

```javascript
const validateUser = (req, res, next) => {
    const { name, email } = req.body;
    
    if (!name || name.length < 3) {
        return res.status(400).json({ 
            error: 'Nome deve essere almeno 3 caratteri' 
        });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ 
            error: 'Email non valida' 
        });
    }
    
    next();
};

app.post('/api/users', validateUser, (req, res) => {
    // I dati sono già validati
    res.json({ message: 'Utente creato', data: req.body });
});
```

### Rate Limiting Middleware

```javascript
const rateLimit = new Map();

const rateLimiter = (limit = 10, window = 60000) => {
    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        
        if (!rateLimit.has(ip)) {
            rateLimit.set(ip, { count: 1, resetTime: now + window });
            return next();
        }
        
        const data = rateLimit.get(ip);
        
        if (now > data.resetTime) {
            data.count = 1;
            data.resetTime = now + window;
            return next();
        }
        
        if (data.count < limit) {
            data.count++;
            return next();
        }
        
        res.status(429).json({ 
            error: 'Troppi tentativi. Riprova più tardi.' 
        });
    };
};

app.use('/api', rateLimiter(10, 60000)); // 10 req/min
```

### Request ID Middleware

```javascript
const { v4: uuidv4 } = require('uuid');

const requestId = (req, res, next) => {
    req.id = uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
};

app.use(requestId);

app.get('/', (req, res) => {
    console.log(`Request ID: ${req.id}`);
    res.send('Check X-Request-ID header');
});
```

---

## Middleware Condizionali

### Basato su Ambiente

```javascript
const app = express();

// Solo in development
if (process.env.NODE_ENV === 'development') {
    app.use(require('morgan')('dev'));
}

// Solo in production
if (process.env.NODE_ENV === 'production') {
    app.use(require('helmet')());
    app.use(require('compression')());
}
```

### Basato su Path

```javascript
// Middleware solo per API
app.use('/api', (req, res, next) => {
    console.log('API Request');
    next();
});

// Middleware solo per admin
app.use('/admin', requireAuth, requireAdmin, (req, res, next) => {
    console.log('Admin area');
    next();
});
```

### Basato su Metodo

```javascript
// Solo per POST requests
app.use((req, res, next) => {
    if (req.method === 'POST') {
        console.log('POST request detected');
    }
    next();
});

// Middleware specifico per metodo
const methodLogger = (method) => {
    return (req, res, next) => {
        if (req.method === method) {
            console.log(`${method} request to ${req.url}`);
        }
        next();
    };
};

app.use(methodLogger('DELETE'));
```

---

## Middleware Async

### Gestione Async/Await

```javascript
// Wrapper per async middleware
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Uso
app.get('/users/:id', asyncHandler(async (req, res) => {
    const user = await db.findUser(req.params.id);
    if (!user) {
        throw new Error('Utente non trovato');
    }
    res.json(user);
}));

// Oppure con try/catch
app.get('/products/:id', async (req, res, next) => {
    try {
        const product = await db.findProduct(req.params.id);
        res.json(product);
    } catch (error) {
        next(error);
    }
});
```

---

## Middleware Chain

### Composizione Middleware

```javascript
// Singoli middleware
const checkAuth = (req, res, next) => {
    // Verifica autenticazione
    next();
};

const checkPermission = (permission) => {
    return (req, res, next) => {
        if (req.user.permissions.includes(permission)) {
            next();
        } else {
            res.status(403).json({ error: 'Permesso negato' });
        }
    };
};

const validateId = (req, res, next) => {
    if (!req.params.id.match(/^\d+$/)) {
        return res.status(400).json({ error: 'ID non valido' });
    }
    next();
};

// Chain multipli
app.delete(
    '/api/users/:id',
    checkAuth,
    checkPermission('delete:users'),
    validateId,
    async (req, res) => {
        await db.deleteUser(req.params.id);
        res.json({ success: true });
    }
);

// Array di middleware
const middleware = [
    checkAuth,
    checkPermission('read:users'),
    validateId
];

app.get('/api/users/:id', middleware, getUser);
```

---

## Middleware Popolari

### Morgan (Logging)

```javascript
const morgan = require('morgan');

// Formati predefiniti
app.use(morgan('combined')); // Apache combined
app.use(morgan('common'));   // Apache common
app.use(morgan('dev'));      // Colorato per development
app.use(morgan('short'));
app.use(morgan('tiny'));

// Custom format
morgan.token('id', (req) => req.id);
app.use(morgan(':id :method :url :status :response-time ms'));

// Log su file
const fs = require('fs');
const path = require('path');
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
```

### Helmet (Security)

```javascript
const helmet = require('helmet');

// Tutto abilitato
app.use(helmet());

// Configurazione personalizzata
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true
    }
}));
```

### CORS

```javascript
const cors = require('cors');

// Abilita CORS per tutti
app.use(cors());

// Configurazione custom
app.use(cors({
    origin: 'https://example.com',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600
}));

// CORS condizionale
const corsOptions = {
    origin: (origin, callback) => {
        const whitelist = ['https://example.com', 'https://api.example.com'];
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
app.use(cors(corsOptions));
```

### Cookie Parser

```javascript
const cookieParser = require('cookie-parser');

app.use(cookieParser('secret'));

app.get('/set-cookie', (req, res) => {
    res.cookie('name', 'value', { 
        maxAge: 900000, 
        httpOnly: true 
    });
    res.send('Cookie set');
});

app.get('/get-cookie', (req, res) => {
    console.log(req.cookies);
    res.json(req.cookies);
});
```

### Express Session

```javascript
const session = require('express-session');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: true,
        maxAge: 60000 
    }
}));

app.get('/login', (req, res) => {
    req.session.userId = 123;
    res.send('Logged in');
});

app.get('/profile', (req, res) => {
    if (req.session.userId) {
        res.send(`User ID: ${req.session.userId}`);
    } else {
        res.send('Not logged in');
    }
});
```

---

## Best Practices

### 1. Sempre Chiamare next()

```javascript
// ❌ Male: next() dimenticato
app.use((req, res, next) => {
    console.log('Log');
    // ERRORE: richiesta rimane appesa!
});

// ✅ Bene
app.use((req, res, next) => {
    console.log('Log');
    next();
});
```

### 2. Gestire Errori Async

```javascript
// ❌ Male
app.get('/', async (req, res) => {
    const data = await fetchData(); // Se errore, non gestito!
    res.json(data);
});

// ✅ Bene
app.get('/', async (req, res, next) => {
    try {
        const data = await fetchData();
        res.json(data);
    } catch (error) {
        next(error);
    }
});
```

### 3. Ordine Corretto

```javascript
// ✅ Ordine corretto
app.use(express.json());           // 1. Built-in
app.use(logger);                   // 2. Custom global
app.use('/api', apiRouter);        // 3. Routes
app.use(notFoundHandler);          // 4. 404
app.use(errorHandler);             // 5. Error handler
```

### 4. Middleware Riutilizzabili

```javascript
// Crea file separati per middleware
// middlewares/auth.js
module.exports = {
    requireAuth: (req, res, next) => {
        // logica auth
        next();
    },
    requireAdmin: (req, res, next) => {
        // logica admin
        next();
    }
};

// app.js
const { requireAuth, requireAdmin } = require('./middlewares/auth');
app.use('/admin', requireAuth, requireAdmin);
```

---

## Esercizi Pratici

### Esercizio 1: Logger Avanzato
Crea un middleware che logga:
- Timestamp
- Metodo e URL
- IP del client
- User-Agent
- Tempo di risposta
- Status code

### Esercizio 2: API Key Validation
Crea un middleware che:
- Verifica presenza di API key nell'header
- Valida la key contro un database/array
- Blocca richieste non autorizzate

### Esercizio 3: Request Sanitization
Crea un middleware che:
- Rimuove spazi extra dai parametri
- Converte stringhe in lowercase
- Rimuove caratteri speciali pericolosi

---

## Prossimo Capitolo

Continua con **[04. Gestione Richieste](./04-gestione-richieste.md)** per approfondire parametri, query e body.
