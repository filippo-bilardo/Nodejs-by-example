# Implementazione di API con Express

## Introduzione

Express.js è uno dei framework più popolari per lo sviluppo di applicazioni web e API in Node.js. La sua semplicità, flessibilità e il vasto ecosistema di middleware lo rendono ideale per implementare API RESTful. In questo capitolo, esploreremo come utilizzare Express per creare API robuste, scalabili e conformi ai principi REST.

## Configurazione di Base

### Installazione e Setup Iniziale

Per iniziare a sviluppare un'API con Express, è necessario installare le dipendenze di base:

```bash
npm init -y
npm install express cors helmet morgan dotenv
```

Queste dipendenze includono:
- **express**: Il framework web
- **cors**: Middleware per gestire le richieste Cross-Origin Resource Sharing
- **helmet**: Middleware per migliorare la sicurezza dell'applicazione
- **morgan**: Logger per le richieste HTTP
- **dotenv**: Per gestire le variabili d'ambiente

### Struttura del Progetto

Una buona organizzazione del codice è fondamentale per la manutenibilità. Ecco una struttura di progetto consigliata per un'API Express:

```
/api-project
  /config         # Configurazioni (database, env, ecc.)
  /controllers    # Logica di business per le route
  /middleware     # Middleware personalizzati
  /models         # Modelli di dati
  /routes         # Definizioni delle route
  /utils          # Funzioni di utilità
  /tests          # Test
  server.js       # Punto di ingresso dell'applicazione
  package.json
  .env            # Variabili d'ambiente (non versionato)
  .gitignore
```

### File Server di Base

Ecco un esempio di configurazione base per il file `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Inizializzazione dell'app Express
const app = express();

// Middleware di base
app.use(helmet()); // Sicurezza
app.use(cors()); // Gestione CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parsing JSON
app.use(express.urlencoded({ extended: true })); // Parsing URL-encoded

// Route di base
app.get('/', (req, res) => {
  res.json({ message: 'API funzionante!' });
});

// Importazione delle route
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Middleware per la gestione degli errori 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Risorsa non trovata' });
});

// Middleware per la gestione degli errori generici
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Avvio del server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

## Implementazione delle Route

### Organizzazione delle Route

Per un'API ben strutturata, è consigliabile organizzare le route in file separati in base alle risorse:

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users
router.get('/', userController.getAllUsers);

// GET /api/users/:id
router.get('/:id', userController.getUserById);

// POST /api/users
router.post('/', userController.createUser);

// PUT /api/users/:id
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id
router.delete('/:id', userController.deleteUser);

// Gestione delle risorse nidificate
// GET /api/users/:id/posts
router.get('/:id/posts', userController.getUserPosts);

module.exports = router;
```

### Implementazione dei Controller

I controller contengono la logica di business per gestire le richieste:

```javascript
// controllers/userController.js
const User = require('../models/User');

// GET /api/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.json({ message: 'Utente eliminato con successo' });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/posts
exports.getUserPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    const posts = await Post.find({ user: req.params.id });
    res.json(posts);
  } catch (err) {
    next(err);
  }
};
```

## Middleware Personalizzati

I middleware sono funzioni che hanno accesso all'oggetto richiesta (req), all'oggetto risposta (res) e alla funzione next nel ciclo richiesta-risposta dell'applicazione.

### Middleware di Autenticazione

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  // Ottieni il token dall'header Authorization
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Accesso negato. Token non fornito.' });
  }
  
  try {
    // Verifica il token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token non valido' });
  }
};

// Middleware per verificare i ruoli
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Accesso negato. Autenticazione richiesta.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accesso negato. Non hai i permessi necessari.' });
    }
    
    next();
  };
};
```

### Middleware di Validazione

```javascript
// middleware/validators.js
const { body, validationResult } = require('express-validator');

// Validazione per la creazione/aggiornamento di un utente
exports.validateUser = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Il nome deve essere di almeno 3 caratteri'),
  body('email')
    .isEmail()
    .withMessage('Inserisci un indirizzo email valido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La password deve essere di almeno 8 caratteri')
    .matches(/\d/)
    .withMessage('La password deve contenere almeno un numero'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }
];
```

## Gestione degli Errori

Una gestione efficace degli errori è fondamentale per un'API robusta. Ecco un approccio strutturato:

### Classe di Errore Personalizzata

```javascript
// utils/AppError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
```

### Middleware di Gestione Errori

```javascript
// middleware/errorHandler.js
const AppError = require('../utils/AppError');

// Gestione errori di sviluppo (dettagliati)
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Gestione errori di produzione (meno dettagliati)
const sendErrorProd = (err, res) => {
  // Errori operazionali, di cui ci fidiamo: invia messaggio al client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Errori di programmazione o sconosciuti: non esporre dettagli
  else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Qualcosa è andato storto'
    });
  }
};

// Gestione errori specifici
const handleCastErrorDB = err => {
  const message = `Valore non valido ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Valore duplicato: ${value}. Usa un altro valore`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Dati non validi. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Token non valido. Effettua nuovamente l\'accesso', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Token scaduto. Effettua nuovamente l\'accesso', 401);
};

// Middleware principale di gestione errori
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendErrorProd(error, res);
  }
};
```

## Paginazione, Filtri e Ordinamento

Per API che gestiscono grandi quantità di dati, è importante implementare funzionalità di paginazione, filtri e ordinamento:

```javascript
// controllers/productController.js
exports.getAllProducts = async (req, res, next) => {
  try {
    // Costruzione della query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    
    // Filtri avanzati (gt, gte, lt, lte)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    
    let query = Product.find(JSON.parse(queryStr));
    
    // Ordinamento
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Selezione dei campi
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    
    // Paginazione
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    query = query.skip(skip).limit(limit);
    
    // Esecuzione della query
    const products = await query;
    
    // Conteggio totale per la paginazione
    const totalProducts = await Product.countDocuments(JSON.parse(queryStr));
    
    // Risposta
    res.json({
      status: 'success',
      results: products.length,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      data: {
        products
      }
    });
  } catch (err) {
    next(err);
  }
};
```

## Implementazione di HATEOAS

Per rendere l'API più navigabile e conforme ai principi REST, è possibile implementare HATEOAS (Hypermedia as the Engine of Application State):

```javascript
// utils/hateoas.js
exports.addLinks = (req, resource, id) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api`;
  
  const links = {
    self: `${baseUrl}/${resource}/${id}`,
    collection: `${baseUrl}/${resource}`
  };
  
  // Aggiungi link specifici per risorsa
  if (resource === 'users') {
    links.posts = `${baseUrl}/users/${id}/posts`;
    links.comments = `${baseUrl}/users/${id}/comments`;
  } else if (resource === 'posts') {
    links.author = `${baseUrl}/posts/${id}/author`;
    links.comments = `${baseUrl}/posts/${id}/comments`;
  }
  
  return links;
};

// Utilizzo nel controller
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Aggiungi link HATEOAS
    const links = addLinks(req, 'users', req.params.id);
    
    res.json({
      ...user.toJSON(),
      _links: links
    });
  } catch (err) {
    next(err);
  }
};
```

## Versioning dell'API

Il versioning è importante per garantire la compatibilità con le applicazioni client esistenti quando si apportano modifiche all'API:

### Versioning tramite URL

```javascript
// routes/index.js
const express = require('express');
const router = express.Router();

// Importa le route per le diverse versioni
const v1Routes = require('./v1');
const v2Routes = require('./v2');

// Versione 1 dell'API
router.use('/v1', v1Routes);

// Versione 2 dell'API
router.use('/v2', v2Routes);

// Reindirizza alla versione più recente per default
router.use('/', (req, res) => {
  res.redirect('/api/v2');
});

module.exports = router;

// Nel server.js
app.use('/api', require('./routes'));
```

### Versioning tramite Header

```javascript
// middleware/versioning.js
exports.apiVersion = (req, res, next) => {
  const version = req.headers['accept-version'] || '1.0.0';
  req.apiVersion = version;
  next();
};

// Utilizzo nel router
app.use(apiVersion);
app.use('/api', (req, res, next) => {
  if (req.apiVersion === '1.0.0') {
    return require('./routes/v1')(req, res, next);
  } else if (req.apiVersion === '2.0.0') {
    return require('./routes/v2')(req, res, next);
  }
  next();
});
```

## Rate Limiting

Il rate limiting è una tecnica importante per proteggere l'API da abusi e garantire prestazioni costanti:

```javascript
const rateLimit = require('express-rate-limit');

// Configurazione del rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // limite di 100 richieste per IP
  standardHeaders: true, // Restituisce info rate limit negli header `RateLimit-*`
  legacyHeaders: false, // Disabilita gli header `X-RateLimit-*`
  message: {
    status: 'error',
    message: 'Troppe richieste, riprova più tardi.'
  }
});

// Applica il rate limiting a tutte le richieste all'API
app.use('/api', apiLimiter);

// Rate limiting più restrittivo per endpoint sensibili
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 5, // limite di 5 tentativi per IP
  message: {
    status: 'error',
    message: 'Troppi tentativi di accesso, riprova più tardi.'
  }
});

app.use('/api/auth/login', authLimiter);
```

## Compressione e Caching

Per migliorare le prestazioni dell'API, è possibile implementare compressione e caching:

```javascript
const compression = require('compression');

// Compressione delle risposte
app.use(compression());

// Middleware per il caching
const setCache = (req, res, next) => {
  // Verifica se la richiesta è cacheable
  const period = 60 * 5; // 5 minuti
  
  // Solo le richieste GET sono cacheable
  if (req.method === 'GET') {
    res.set('Cache-control', `public, max-age=${period}`);
  } else {
    // Per altri metodi, imposta no-cache
    res.set('Cache-control', 'no-store');
  }
  
  next();
};

// Applica il caching alle route pubbliche
app.use('/api/products', setCache);
```

## Conclusione

In questo capitolo abbiamo esplorato come implementare API RESTful robuste e scalabili utilizzando Express.js. Abbiamo visto come organizzare il codice, gestire le route, implementare middleware per autenticazione e validazione, gestire gli errori in modo efficace e ottimizzare le prestazioni con tecniche come paginazione, rate limiting e caching.

Seguendo queste best practices, è possibile creare API che sono non solo conformi ai principi REST, ma anche sicure, performanti e facili da mantenere nel tempo.

Nel prossimo capitolo, approfondiremo gli aspetti di sicurezza e autenticazione per le API REST, esplorando tecniche come JWT, OAuth e protezione contro attacchi comuni.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Modulo Corrente: REST API](../README.md)
- [Documento Precedente: Principi REST e Architettura](./01-principi-rest.md)
- [Documento Successivo: Middleware Express](../../09-Middleware-Autenticazione/teoria/01-middleware-express.md)