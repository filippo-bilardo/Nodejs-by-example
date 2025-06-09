# Sicurezza delle API

## Introduzione

La sicurezza è un aspetto fondamentale nello sviluppo di API moderne. Con l'aumento delle minacce informatiche, proteggere le API da accessi non autorizzati, attacchi e vulnerabilità è diventato essenziale. Questo capitolo esplora le best practices, le tecniche e gli strumenti per implementare una robusta strategia di sicurezza per le tue API.

## Principali Minacce alla Sicurezza delle API

### 1. Injection Attacks

Gli attacchi di tipo injection, come SQL Injection e NoSQL Injection, si verificano quando dati non fidati vengono inviati a un interprete come parte di un comando o query.

**Esempio di vulnerabilità SQL Injection:**

```javascript
// Vulnerabile a SQL Injection
app.get('/users', (req, res) => {
  const userId = req.query.id;
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  // Un attaccante potrebbe inserire: 1; DROP TABLE users;
  db.query(query, (err, results) => {
    res.json(results);
  });
});
```

**Soluzione: Parametrizzazione delle query**

```javascript
// Protetto da SQL Injection
app.get('/users', (req, res) => {
  const userId = req.query.id;
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    res.json(results);
  });
});
```

### 2. Broken Authentication

Le vulnerabilità di autenticazione permettono agli attaccanti di assumere l'identità di altri utenti.

**Problemi comuni:**
- Password deboli o facilmente indovinabili
- Gestione impropria delle sessioni
- Implementazione insicura del "remember me"
- Mancanza di protezione contro attacchi di forza bruta

**Soluzioni:**

```javascript
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

// Rate limiting per prevenire attacchi di forza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // 5 tentativi per finestra
  message: 'Troppi tentativi di login, riprova più tardi'
});

app.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  
  const user = await User.findOne({ username });
  if (!user) {
    // Usa tempi di risposta costanti per prevenire timing attacks
    await bcrypt.compare(password, '$2b$10$invalidhashforcomparison');
    return res.status(401).json({ message: 'Credenziali non valide' });
  }
  
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }
  
  // Genera token, ecc.
});
```

### 3. Sensitive Data Exposure

L'esposizione di dati sensibili avviene quando informazioni come credenziali, dati personali o finanziari non sono adeguatamente protetti.

**Problemi comuni:**
- Trasmissione di dati in chiaro (senza HTTPS)
- Archiviazione di password in chiaro o con hash deboli
- Esposizione di informazioni sensibili nelle risposte API

**Soluzioni:**

```javascript
// Usa HTTPS
const https = require('https');
const fs = require('fs');
const app = express();

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

https.createServer(options, app).listen(443);

// Sanitizza i dati nelle risposte
app.get('/users/:id', authenticateToken, (req, res) => {
  const user = getUserById(req.params.id);
  
  // Rimuovi dati sensibili prima di inviare la risposta
  const safeUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    // NON includere password, anche se hashata
    // NON includere informazioni sensibili come numeri di carta di credito
  };
  
  res.json(safeUser);
});
```

### 4. XML External Entities (XXE)

Gli attacchi XXE prendono di mira applicazioni che analizzano input XML.

**Soluzione: Disabilitare le entità esterne**

```javascript
const xml2js = require('xml2js');

app.post('/process-xml', (req, res) => {
  const parser = new xml2js.Parser({
    explicitArray: false,
    // Disabilita entità esterne
    disableEntityLoader: true
  });
  
  parser.parseString(req.body.xml, (err, result) => {
    if (err) {
      return res.status(400).json({ error: 'XML non valido' });
    }
    res.json(result);
  });
});
```

### 5. Broken Access Control

I controlli di accesso inadeguati permettono agli utenti di accedere a risorse o funzionalità a cui non dovrebbero avere accesso.

**Soluzione: Implementare controlli di accesso rigorosi**

```javascript
// Middleware per verificare la proprietà della risorsa
function checkResourceOwnership(req, res, next) {
  const resourceId = req.params.id;
  const userId = req.user.id;
  
  Resource.findById(resourceId)
    .then(resource => {
      if (!resource) {
        return res.status(404).json({ message: 'Risorsa non trovata' });
      }
      
      if (resource.ownerId !== userId) {
        return res.status(403).json({ message: 'Accesso negato' });
      }
      
      req.resource = resource;
      next();
    })
    .catch(err => {
      res.status(500).json({ message: 'Errore del server' });
    });
}

app.put('/resources/:id', authenticateToken, checkResourceOwnership, (req, res) => {
  // L'utente è autenticato e proprietario della risorsa
  // Procedi con l'aggiornamento
});
```

### 6. Security Misconfiguration

Le configurazioni di sicurezza errate sono una delle vulnerabilità più comuni.

**Problemi comuni:**
- Servizi non necessari abilitati
- Account predefiniti attivi
- Messaggi di errore che rivelano troppi dettagli
- Mancanza di header di sicurezza

**Soluzione: Utilizzare Helmet per impostare header di sicurezza**

```javascript
const helmet = require('helmet');

// Imposta vari header HTTP relativi alla sicurezza
app.use(helmet());

// Personalizza le impostazioni di Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'trusted-cdn.com']
      }
    },
    // Imposta la durata dello HSTS a 1 anno
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);
```

## Implementazione di Controlli di Sicurezza

### 1. Validazione e Sanitizzazione degli Input

La validazione degli input è la prima linea di difesa contro molti attacchi.

```javascript
const { body, validationResult } = require('express-validator');

app.post('/users',
  // Validazione
  [
    body('username').isAlphanumeric().isLength({ min: 3, max: 30 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
  ],
  (req, res) => {
    // Verifica errori di validazione
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Procedi con la registrazione
  }
);
```

### 2. Rate Limiting

Il rate limiting protegge le API da attacchi di forza bruta e DoS.

```javascript
const rateLimit = require('express-rate-limit');

// Rate limit globale
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 100, // 100 richieste per IP
    message: 'Troppe richieste, riprova più tardi'
  })
);

// Rate limit specifico per endpoint sensibili
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // 5 richieste per IP
  message: 'Troppe richieste all\'API, riprova più tardi'
});

app.post('/api/sensitive-endpoint', apiLimiter, (req, res) => {
  // Logica dell'endpoint
});
```

### 3. CORS (Cross-Origin Resource Sharing)

CORS è un meccanismo che consente a risorse di una pagina web di essere richieste da un dominio diverso.

```javascript
const cors = require('cors');

// Abilita CORS per tutti i domini (non raccomandato in produzione)
app.use(cors());

// Configurazione CORS restrittiva
const corsOptions = {
  origin: 'https://miodominio.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 ore
};

app.use(cors(corsOptions));
```

### 4. Content Security Policy (CSP)

CSP aiuta a prevenire attacchi XSS e altri attacchi di injection.

```javascript
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'trusted-cdn.com'],
      styleSrc: ["'self'", 'trusted-cdn.com'],
      imgSrc: ["'self'", 'data:', 'trusted-cdn.com'],
      connectSrc: ["'self'", 'api.trusted-service.com'],
      fontSrc: ["'self'", 'trusted-cdn.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      reportUri: '/report-csp-violation'
    }
  })
);
```

### 5. Protezione contro CSRF

Per applicazioni che utilizzano cookie di sessione, la protezione CSRF è importante.

```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());

// Abilita protezione CSRF
const csrfProtection = csrf({ cookie: true });

// Applica a tutte le rotte che modificano dati
app.post('/api/data', csrfProtection, (req, res) => {
  // Il token CSRF è stato verificato
});

// Fornisci il token CSRF al client
app.get('/form', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

## Gestione Sicura delle Password

### 1. Hashing delle Password

```javascript
const bcrypt = require('bcrypt');

async function registerUser(username, password) {
  try {
    // Genera un salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash della password con il salt
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Salva l'utente nel database
    const user = new User({
      username,
      password: hashedPassword
    });
    
    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
}

async function loginUser(username, password) {
  try {
    // Trova l'utente nel database
    const user = await User.findOne({ username });
    if (!user) {
      return null;
    }
    
    // Verifica la password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }
    
    return user;
  } catch (error) {
    throw error;
  }
}
```

### 2. Politiche di Password Robuste

```javascript
function isStrongPassword(password) {
  // Almeno 8 caratteri
  if (password.length < 8) {
    return false;
  }
  
  // Almeno una lettera maiuscola
  if (!/[A-Z]/.test(password)) {
    return false;
  }
  
  // Almeno una lettera minuscola
  if (!/[a-z]/.test(password)) {
    return false;
  }
  
  // Almeno un numero
  if (!/[0-9]/.test(password)) {
    return false;
  }
  
  // Almeno un carattere speciale
  if (!/[^A-Za-z0-9]/.test(password)) {
    return false;
  }
  
  return true;
}

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message: 'La password deve contenere almeno 8 caratteri, inclusi maiuscole, minuscole, numeri e caratteri speciali'
    });
  }
  
  // Procedi con la registrazione
});
```

## Logging e Monitoraggio

Il logging e il monitoraggio sono essenziali per rilevare e rispondere agli incidenti di sicurezza.

```javascript
const winston = require('winston');

// Configura il logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Middleware di logging
app.use((req, res, next) => {
  const start = Date.now();
  
  // Quando la risposta è completata
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip
    });
  });
  
  next();
});

// Middleware per errori
app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  
  res.status(500).json({ message: 'Errore del server' });
});
```

## Gestione dei Segreti

La gestione sicura dei segreti (chiavi API, credenziali DB, ecc.) è cruciale.

```javascript
// Utilizzo di variabili d'ambiente
require('dotenv').config();

const dbConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const jwtSecret = process.env.JWT_SECRET;
```

## Checklist di Sicurezza per API

1. **Autenticazione e Autorizzazione**
   - Implementa autenticazione robusta (JWT, OAuth)
   - Usa controlli di accesso basati su ruoli/permessi
   - Implementa timeout di sessione e refresh token

2. **Protezione dei Dati**
   - Usa HTTPS per tutte le comunicazioni
   - Implementa hashing sicuro per le password
   - Sanitizza tutti gli input e output
   - Minimizza i dati sensibili nelle risposte

3. **Prevenzione degli Attacchi**
   - Implementa rate limiting
   - Proteggi contro SQL/NoSQL Injection
   - Configura CORS appropriatamente
   - Usa header di sicurezza (Helmet)

4. **Logging e Monitoraggio**
   - Implementa logging completo
   - Monitora attività sospette
   - Imposta avvisi per comportamenti anomali

5. **Gestione degli Errori**
   - Usa messaggi di errore generici in produzione
   - Implementa gestione centralizzata degli errori
   - Non esporre dettagli tecnici nelle risposte di errore

## Conclusione

La sicurezza delle API è un processo continuo che richiede attenzione costante. Implementando le best practices descritte in questo capitolo, puoi significativamente ridurre il rischio di vulnerabilità e proteggere i tuoi utenti e i loro dati.

Ricorda che la sicurezza è solo forte quanto il suo anello più debole, quindi è importante adottare un approccio olistico che copra tutti gli aspetti dell'applicazione, dal codice all'infrastruttura, dalle politiche alle procedure.

Nel prossimo capitolo, metteremo in pratica questi concetti implementando un'API RESTful completa con autenticazione, autorizzazione e tutte le misure di sicurezza necessarie.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Modulo Corrente: Middleware e Autenticazione](../README.md)
- [Documento Precedente: JWT (JSON Web Tokens)](./03-jwt.md)
- [Documento Successivo: Introduzione ai Template Engine](../../10-TemplateEngine/teoria/01-introduzione-template-engine.md)