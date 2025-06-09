# Autenticazione e Autorizzazione in Express.js

## Introduzione

L'autenticazione e l'autorizzazione sono componenti fondamentali per la sicurezza delle applicazioni web moderne. Mentre l'autenticazione verifica l'identità di un utente, l'autorizzazione determina quali azioni quell'utente può eseguire all'interno dell'applicazione.

In questo capitolo, esploreremo diverse strategie per implementare questi meccanismi in un'applicazione Express.js, con particolare attenzione all'uso dei middleware.

## Differenza tra Autenticazione e Autorizzazione

### Autenticazione

L'autenticazione risponde alla domanda: "Chi sei?". È il processo di verifica dell'identità di un utente, generalmente attraverso credenziali come username/password, token, certificati digitali o altri metodi.

### Autorizzazione

L'autorizzazione risponde alla domanda: "Cosa puoi fare?". Dopo che un utente è stato autenticato, l'autorizzazione determina quali risorse può accedere e quali azioni può eseguire.

## Strategie di Autenticazione

### 1. Autenticazione Basata su Sessione

L'autenticazione basata su sessione utilizza cookie per mantenere lo stato dell'utente tra le richieste.

```javascript
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

// Configurazione della sessione
app.use(session({
  secret: 'chiave_segreta_sessione',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 3600000 } // 1 ora
}));

app.use(express.json());

// Database simulato degli utenti
const users = [
  { id: 1, username: 'admin', password: '$2b$10$X/4xyWCjYmQrTyw8Yl5onu4.yTUVfupOZXli3mJFU.H2AcJscG2.q' } // 'password123' hashata
];

// Middleware di autenticazione
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ message: 'Non autorizzato' });
}

// Rotta di login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }
  
  // Salva l'ID utente nella sessione
  req.session.userId = user.id;
  
  res.json({ message: 'Login effettuato con successo' });
});

// Rotta protetta
app.get('/profile', isAuthenticated, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  res.json({ username: user.username });
});

// Rotta di logout
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout effettuato con successo' });
});
```

#### Vantaggi dell'Autenticazione Basata su Sessione
- Familiare e facile da implementare
- Gestione automatica dei cookie da parte del browser
- Revoca immediata delle sessioni

#### Svantaggi
- Problemi di scalabilità con più server (richiede session store condiviso)
- Vulnerabilità CSRF (Cross-Site Request Forgery)
- Non ideale per API stateless

### 2. Autenticazione Basata su Token (JWT)

L'autenticazione basata su token utilizza JSON Web Tokens (JWT) per rappresentare le credenziali dell'utente.

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Chiave segreta per firmare i token JWT
const JWT_SECRET = 'la_mia_chiave_segreta_jwt';

// Database simulato degli utenti
const users = [
  { id: 1, username: 'admin', password: '$2b$10$X/4xyWCjYmQrTyw8Yl5onu4.yTUVfupOZXli3mJFU.H2AcJscG2.q', role: 'admin' }
];

// Middleware di autenticazione JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Token mancante' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token non valido' });
    }
    
    req.user = user;
    next();
  });
}

// Rotta di login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }
  
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }
  
  // Crea un token JWT
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  res.json({ token });
});

// Rotta protetta
app.get('/profile', authenticateToken, (req, res) => {
  res.json(req.user);
});
```

#### Vantaggi dell'Autenticazione Basata su Token
- Stateless: non richiede di memorizzare sessioni sul server
- Scalabile: funziona bene in architetture distribuite
- Cross-domain: può essere utilizzato tra domini diversi

#### Svantaggi
- I token non possono essere revocati facilmente prima della scadenza
- Dimensione maggiore rispetto ai cookie di sessione
- Necessità di gestire il refresh dei token

## Implementazione dell'Autorizzazione

Una volta che un utente è autenticato, l'autorizzazione determina cosa può fare all'interno dell'applicazione.

### Autorizzazione Basata su Ruoli

```javascript
// Middleware per verificare il ruolo dell'utente
function checkRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autenticato' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Accesso negato' });
    }
    
    next();
  };
}

// Rotta accessibile solo agli admin
app.get('/admin/dashboard', authenticateToken, checkRole('admin'), (req, res) => {
  res.json({ message: 'Dashboard amministratore' });
});

// Rotta accessibile solo agli utenti standard
app.get('/user/dashboard', authenticateToken, checkRole('user'), (req, res) => {
  res.json({ message: 'Dashboard utente' });
});
```

### Autorizzazione Basata su Permessi

Un approccio più granulare è l'autorizzazione basata su permessi specifici.

```javascript
// Database simulato degli utenti con permessi
const users = [
  { 
    id: 1, 
    username: 'admin', 
    password: '$2b$10$X/4xyWCjYmQrTyw8Yl5onu4.yTUVfupOZXli3mJFU.H2AcJscG2.q', 
    permissions: ['read:users', 'write:users', 'delete:users'] 
  },
  { 
    id: 2, 
    username: 'user', 
    password: '$2b$10$X/4xyWCjYmQrTyw8Yl5onu4.yTUVfupOZXli3mJFU.H2AcJscG2.q', 
    permissions: ['read:users'] 
  }
];

// Middleware per verificare i permessi
function checkPermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autenticato' });
    }
    
    const userRecord = users.find(u => u.id === req.user.id);
    
    if (!userRecord || !userRecord.permissions.includes(permission)) {
      return res.status(403).json({ message: 'Permesso negato' });
    }
    
    next();
  };
}

// Rotte con diversi requisiti di permesso
app.get('/users', authenticateToken, checkPermission('read:users'), (req, res) => {
  res.json({ users: [{ id: 1, username: 'admin' }, { id: 2, username: 'user' }] });
});

app.post('/users', authenticateToken, checkPermission('write:users'), (req, res) => {
  res.status(201).json({ message: 'Utente creato' });
});

app.delete('/users/:id', authenticateToken, checkPermission('delete:users'), (req, res) => {
  res.json({ message: 'Utente eliminato' });
});
```

## Gestione delle Password

La gestione sicura delle password è un aspetto critico dell'autenticazione.

### Hashing delle Password

```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  // Il salt round determina la complessità dell'hashing (10-12 è un buon valore)
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Esempio di registrazione utente
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Verifica se l'utente esiste già
    if (users.some(u => u.username === username)) {
      return res.status(400).json({ message: 'Username già in uso' });
    }
    
    // Hash della password
    const hashedPassword = await hashPassword(password);
    
    // Crea nuovo utente
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      role: 'user'
    };
    
    users.push(newUser);
    
    res.status(201).json({ message: 'Utente registrato con successo' });
  } catch (error) {
    res.status(500).json({ message: 'Errore durante la registrazione' });
  }
});
```

## Best Practices di Sicurezza

### 1. Protezione contro Attacchi di Forza Bruta

Implementa il rate limiting per prevenire tentativi ripetuti di login.

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // 5 tentativi per finestra
  message: 'Troppi tentativi di login, riprova più tardi'
});

app.post('/login', loginLimiter, async (req, res) => {
  // Logica di login
});
```

### 2. Protezione contro CSRF (Cross-Site Request Forgery)

Per applicazioni che utilizzano autenticazione basata su cookie/sessione:

```javascript
const csrf = require('csurf');

const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

app.get('/form', (req, res) => {
  // Passa il token CSRF al template
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/process', csrfProtection, (req, res) => {
  // Il middleware csurf verificherà automaticamente il token
  res.send('Dati processati con successo');
});
```

### 3. Implementazione di HTTPS

Utilizza sempre HTTPS in produzione per proteggere i dati in transito.

```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

// Configurazione HTTPS
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

// Crea server HTTPS
https.createServer(options, app).listen(443, () => {
  console.log('Server HTTPS in ascolto sulla porta 443');
});

// Reindirizza HTTP a HTTPS
const http = require('http');
http.createServer((req, res) => {
  res.writeHead(301, { 'Location': 'https://' + req.headers.host + req.url });
  res.end();
}).listen(80);
```

### 4. Impostazione di Header di Sicurezza

Utilizza il middleware Helmet per impostare header HTTP relativi alla sicurezza.

```javascript
const helmet = require('helmet');

app.use(helmet());
```

## Conclusione

L'implementazione di un sistema di autenticazione e autorizzazione robusto è fondamentale per la sicurezza delle applicazioni web. Utilizzando i middleware di Express.js, è possibile creare un sistema modulare e manutenibile che protegge le risorse dell'applicazione e garantisce che solo gli utenti autorizzati possano accedere a determinate funzionalità.

Nel prossimo capitolo, approfondiremo l'utilizzo dei JSON Web Tokens (JWT) per l'autenticazione stateless nelle API RESTful.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Modulo Corrente: Middleware e Autenticazione](../README.md)
- [Documento Precedente: Middleware in Express.js](./01-middleware-express.md)
- [Documento Successivo: JWT (JSON Web Tokens)](./03-jwt.md)