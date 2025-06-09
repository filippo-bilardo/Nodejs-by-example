# Middleware per la Gestione degli Errori in Express.js

## Introduzione

In un'applicazione Express.js, i middleware per la gestione degli errori sono componenti fondamentali che permettono di centralizzare e standardizzare il modo in cui l'applicazione risponde agli errori. Questi middleware speciali consentono di catturare eccezioni, formattare risposte di errore coerenti e garantire che l'applicazione rimanga stabile anche in presenza di problemi.

## Concetti Fondamentali

### Middleware di Errore vs Middleware Standard

I middleware di errore in Express hanno una firma diversa dai middleware standard:

```javascript
// Middleware standard
app.use((req, res, next) => {
  // Logica del middleware
  next();
});

// Middleware di errore
app.use((err, req, res, next) => {
  // Logica di gestione dell'errore
  res.status(500).json({ error: err.message });
}); 
```

La differenza principale è la presenza del parametro `err` come primo argomento, che contiene l'errore passato alla funzione `next()`.

### Posizionamento dei Middleware di Errore

I middleware di errore devono essere definiti **dopo** tutti gli altri middleware e route. Express riconosce un middleware come gestore di errori quando ha quattro parametri, quindi l'ordine è cruciale:

```javascript
const express = require('express');
const app = express();

// Middleware standard
app.use(express.json());

// Route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Middleware di errore (deve essere definito alla fine)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Qualcosa è andato storto!');
});

app.listen(3000);
```

## Implementazione di Middleware per la Gestione degli Errori

### Middleware di Base per la Gestione degli Errori

```javascript
// errorHandler.js
function errorHandler(err, req, res, next) {
  // Log dell'errore
  console.error(err.stack);
  
  // Imposta lo status code appropriato o usa 500 come default
  const statusCode = err.statusCode || 500;
  
  // Invia una risposta JSON con i dettagli dell'errore
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message,
    // In ambiente di sviluppo, includi lo stack trace
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}

module.exports = errorHandler;
```

### Utilizzo del Middleware di Errore

```javascript
// app.js
const express = require('express');
const errorHandler = require('./errorHandler');

const app = express();

app.use(express.json());

app.get('/api/items', (req, res, next) => {
  try {
    // Logica per ottenere gli elementi
    // Se c'è un errore:
    // throw new Error('Impossibile recuperare gli elementi');
    res.json({ items: [] });
  } catch (err) {
    next(err); // Passa l'errore al middleware di errore
  }
});

// Middleware per gestire route non trovate
app.use((req, res, next) => {
  const error = new Error(`Route non trovata - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error); // Passa l'errore al middleware di errore
});

// Middleware di errore
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

## Middleware Avanzati per la Gestione degli Errori

### Errori Personalizzati

Creare classi di errore personalizzate può migliorare significativamente la gestione degli errori:

```javascript
// errors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Errore operativo, previsto
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
};
```

### Middleware per Diversi Ambienti

È utile avere middleware di errore diversi per ambienti di sviluppo e produzione:

```javascript
// errorHandlers.js
const { AppError } = require('./errors');

// Gestione degli errori di sviluppo (dettagliata)
function developmentErrorHandler(err, req, res, next) {
  err.stack = err.stack || '';
  
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

// Gestione degli errori di produzione (limitata)
function productionErrorHandler(err, req, res, next) {
  // Errori operativi: invia messaggio al client
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message
    });
  }
  
  // Errori di programmazione o sconosciuti: non inviare dettagli al client
  console.error('ERROR 💥', err);
  
  res.status(500).json({
    status: 'error',
    message: 'Qualcosa è andato storto!'
  });
}

// Middleware per gestire errori di validazione Mongoose
function handleMongooseValidationError(err) {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Input non valido: ${errors.join('. ')}`;
  return new AppError(message, 400);
}

// Middleware per gestire errori di duplicazione MongoDB
function handleMongoDBDuplicateError(err) {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Valore duplicato: ${value}. Utilizzare un altro valore!`;
  return new AppError(message, 400);
}

// Middleware per gestire errori di cast MongoDB
function handleCastErrorDB(err) {
  const message = `Valore non valido ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

// Middleware per gestire errori JWT
function handleJWTError() {
  return new AppError('Token non valido. Effettua nuovamente l\'accesso!', 401);
}

// Middleware per gestire errori di scadenza JWT
function handleJWTExpiredError() {
  return new AppError('Il tuo token è scaduto! Effettua nuovamente l\'accesso.', 401);
}

// Middleware globale per la gestione degli errori
function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Gestione di errori specifici
  let error = { ...err };
  error.message = err.message;
  
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleMongoDBDuplicateError(error);
  if (error.name === 'ValidationError') error = handleMongooseValidationError(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  
  // Invia risposta in base all'ambiente
  if (process.env.NODE_ENV === 'development') {
    developmentErrorHandler(error, req, res, next);
  } else {
    productionErrorHandler(error, req, res, next);
  }
}

module.exports = {
  globalErrorHandler
};
```

### Utilizzo dei Middleware Avanzati

```javascript
// app.js
const express = require('express');
const { globalErrorHandler } = require('./errorHandlers');
const { NotFoundError } = require('./errors');

const app = express();

// Middleware e route...

// Middleware per route non trovate
app.all('*', (req, res, next) => {
  next(new NotFoundError(`Impossibile trovare ${req.originalUrl} su questo server!`));
});

// Middleware globale per la gestione degli errori
app.use(globalErrorHandler);

module.exports = app;
```

## Gestione degli Errori Asincroni

### Il Problema degli Errori Asincroni

Gli errori nelle funzioni asincrone non vengono automaticamente propagati al middleware di errore di Express:

```javascript
app.get('/api/async', async (req, res) => {
  // Se si verifica un errore qui, Express non lo catturerà
  const data = await fetchDataFromDatabase();
  res.json(data);
});
```

### Soluzione 1: Try-Catch in Ogni Route

```javascript
app.get('/api/async', async (req, res, next) => {
  try {
    const data = await fetchDataFromDatabase();
    res.json(data);
  } catch (err) {
    next(err); // Passa l'errore al middleware di errore
  }
});
```

### Soluzione 2: Wrapper per Funzioni Asincrone

Creare un wrapper per evitare di ripetere try-catch in ogni route:

```javascript
// asyncHandler.js
function asyncHandler(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

module.exports = asyncHandler;
```

Utilizzo del wrapper:

```javascript
const asyncHandler = require('./asyncHandler');

app.get('/api/async', asyncHandler(async (req, res) => {
  const data = await fetchDataFromDatabase();
  res.json(data);
}));

// Non è necessario try-catch, gli errori verranno catturati automaticamente
```

## Gestione degli Errori nelle Operazioni del Database

### Esempio con Mongoose

```javascript
const mongoose = require('mongoose');
const { NotFoundError, BadRequestError } = require('./errors');
const asyncHandler = require('./asyncHandler');

// Controller per ottenere un utente per ID
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new NotFoundError(`Utente con ID ${req.params.id} non trovato`));
  }
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Controller per creare un nuovo utente
const createUser = asyncHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);
  
  res.status(201).json({
    status: 'success',
    data: { user: newUser }
  });
});

// Controller per aggiornare un utente
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!user) {
    return next(new NotFoundError(`Utente con ID ${req.params.id} non trovato`));
  }
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Controller per eliminare un utente
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(new NotFoundError(`Utente con ID ${req.params.id} non trovato`));
  }
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});
```

## Best Practices per i Middleware di Errore

1. **Centralizza la gestione degli errori**: Utilizza un middleware globale per gestire tutti gli errori.

2. **Crea errori personalizzati**: Definisci classi di errore specifiche per diversi tipi di problemi.

3. **Differenzia tra ambienti**: Fornisci risposte dettagliate in sviluppo e risposte limitate in produzione.

4. **Gestisci gli errori asincroni**: Utilizza wrapper o try-catch per catturare errori nelle funzioni asincrone.

5. **Registra gli errori**: Implementa un sistema di logging per registrare gli errori con dettagli sufficienti.

6. **Fornisci risposte coerenti**: Standardizza il formato delle risposte di errore.

7. **Gestisci errori specifici**: Implementa gestori per tipi di errore comuni (validazione, autenticazione, ecc.).

8. **Non esporre dettagli sensibili**: Evita di inviare stack trace o dettagli di implementazione ai client in produzione.

9. **Usa codici di stato HTTP appropriati**: Assegna il codice di stato HTTP corretto in base al tipo di errore.

10. **Testa la gestione degli errori**: Verifica che il sistema di gestione degli errori funzioni correttamente in diversi scenari.

## Conclusione

I middleware per la gestione degli errori sono componenti essenziali di un'applicazione Express.js robusta. Implementando un sistema completo di gestione degli errori, puoi migliorare significativamente l'affidabilità, la manutenibilità e l'esperienza utente della tua applicazione.

Nella prossima sezione, esploreremo come implementare sistemi di logging avanzati con Winston e Morgan per monitorare e diagnosticare problemi nelle applicazioni Node.js.