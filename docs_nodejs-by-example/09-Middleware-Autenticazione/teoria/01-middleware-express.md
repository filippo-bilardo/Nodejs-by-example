# Middleware in Express.js

## Introduzione ai Middleware

I middleware sono funzioni che hanno accesso all'oggetto della richiesta (req), all'oggetto della risposta (res) e alla funzione middleware successiva nel ciclo richiesta-risposta dell'applicazione. Queste funzioni possono eseguire codice, modificare gli oggetti richiesta e risposta, terminare il ciclo richiesta-risposta o chiamare il middleware successivo.

In Express.js, i middleware sono il cuore dell'architettura dell'applicazione e permettono di implementare funzionalità trasversali come logging, autenticazione, gestione degli errori e molto altro.

## Anatomia di un Middleware

Un middleware in Express ha la seguente struttura:

```javascript
function mioMiddleware(req, res, next) {
  // Logica del middleware
  console.log('Middleware eseguito!');
  
  // Chiamata al prossimo middleware nella catena
  next();
}
```

I parametri sono:
- `req`: l'oggetto richiesta HTTP
- `res`: l'oggetto risposta HTTP
- `next`: una funzione che, quando invocata, esegue il middleware successivo

## Tipi di Middleware in Express

### 1. Middleware a Livello di Applicazione

Questi middleware si applicano all'intera applicazione e vengono definiti usando `app.use()` o `app.METHOD()` (dove METHOD è un metodo HTTP come GET, POST, ecc.).

```javascript
const express = require('express');
const app = express();

// Middleware a livello di applicazione
app.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});
```

### 2. Middleware a Livello di Router

Funzionano come i middleware a livello di applicazione, ma sono legati a un'istanza di `express.Router()`.

```javascript
const router = express.Router();

router.use((req, res, next) => {
  console.log('Router Middleware!');
  next();
});

router.get('/user/:id', (req, res) => {
  res.send('User Info');
});

app.use('/api', router);
```

### 3. Middleware per la Gestione degli Errori

Questi middleware hanno una firma speciale con quattro parametri: `(err, req, res, next)`.

```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Qualcosa è andato storto!');
});
```

### 4. Middleware Incorporati

Express include alcuni middleware incorporati come `express.static`, `express.json` e `express.urlencoded`.

```javascript
// Serve file statici dalla directory 'public'
app.use(express.static('public'));

// Analizza richieste con payload JSON
app.use(express.json());

// Analizza richieste con payload URL-encoded
app.use(express.urlencoded({ extended: true }));
```

### 5. Middleware di Terze Parti

Esistono numerosi middleware di terze parti che possono essere installati tramite npm.

```javascript
const morgan = require('morgan');
const helmet = require('helmet');

// Logger HTTP
app.use(morgan('dev'));

// Imposta header HTTP relativi alla sicurezza
app.use(helmet());
```

## Ordine di Esecuzione dei Middleware

L'ordine in cui vengono definiti i middleware è cruciale. I middleware vengono eseguiti sequenzialmente nell'ordine in cui sono stati aggiunti.

```javascript
// Questo middleware verrà eseguito per primo
app.use((req, res, next) => {
  console.log('Primo middleware');
  next();
});

// Questo middleware verrà eseguito per secondo
app.use((req, res, next) => {
  console.log('Secondo middleware');
  next();
});

// Questo middleware verrà eseguito solo per le richieste GET a /users
app.get('/users', (req, res, next) => {
  console.log('Middleware specifico per GET /users');
  next();
});
```

## Catena di Middleware

I middleware formano una catena in cui ogni funzione ha l'opportunità di modificare gli oggetti `req` e `res` o di terminare il ciclo richiesta-risposta.

```javascript
app.get('/users/:id', 
  // Middleware 1: Verifica se l'utente è autenticato
  (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send('Non autorizzato');
    }
    next();
  },
  // Middleware 2: Carica i dati dell'utente
  (req, res, next) => {
    req.user = getUserById(req.params.id);
    if (!req.user) {
      return res.status(404).send('Utente non trovato');
    }
    next();
  },
  // Handler finale
  (req, res) => {
    res.json(req.user);
  }
);
```

## Terminare il Ciclo Richiesta-Risposta

Un middleware può terminare il ciclo richiesta-risposta inviando una risposta al client senza chiamare `next()`:

```javascript
app.use((req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Autenticazione richiesta');
  }
  next();
});
```

## Passaggio di Dati tra Middleware

I middleware possono passare dati ad altri middleware aggiungendo proprietà all'oggetto `req`:

```javascript
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

app.get('/api/data', (req, res) => {
  const responseTime = Date.now() - req.startTime;
  res.send(`Dati recuperati in ${responseTime}ms`);
});
```

## Middleware per la Validazione

Un caso d'uso comune è la validazione dei dati in ingresso:

```javascript
function validateUserInput(req, res, next) {
  const { username, email } = req.body;
  
  if (!username || username.length < 3) {
    return res.status(400).send('Username non valido');
  }
  
  if (!email || !email.includes('@')) {
    return res.status(400).send('Email non valida');
  }
  
  next();
}

app.post('/users', validateUserInput, (req, res) => {
  // Crea un nuovo utente
  res.status(201).send('Utente creato');
});
```

## Middleware Asincroni

I middleware possono essere asincroni utilizzando async/await:

```javascript
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    req.user = user;
    next();
  } catch (error) {
    next(error); // Passa l'errore al middleware di gestione errori
  }
});
```

## Best Practices per i Middleware

1. **Mantieni i middleware focalizzati**: Ogni middleware dovrebbe avere una singola responsabilità.

2. **Gestisci sempre gli errori**: Utilizza try/catch nei middleware asincroni e passa gli errori a `next(error)`.

3. **Ordina i middleware correttamente**: Posiziona i middleware generici prima di quelli specifici.

4. **Evita middleware bloccanti**: Le operazioni pesanti dovrebbero essere asincrone per non bloccare l'event loop.

5. **Documenta i middleware**: Specialmente se condivisi tra più progetti, documenta chiaramente cosa fa ogni middleware.

## Conclusione

I middleware sono uno dei concetti più potenti in Express.js e consentono di creare applicazioni modulari, manutenibili e ben strutturate. Comprendere come funzionano e come utilizzarli efficacemente è fondamentale per sviluppare applicazioni Express robuste.

Nel prossimo capitolo, esploreremo come utilizzare i middleware per implementare l'autenticazione e l'autorizzazione nelle nostre API.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Modulo Corrente: Middleware e Autenticazione](../README.md)
- [Documento Precedente: Implementazione di API con Express](../../08-REST_API/teoria/02-implementazione-api.md)
- [Documento Successivo: Autenticazione e Autorizzazione](./02-autenticazione-autorizzazione.md)