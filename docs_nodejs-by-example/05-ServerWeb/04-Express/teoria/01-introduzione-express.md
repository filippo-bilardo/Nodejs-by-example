# 01. Introduzione a Express.js

## Cos'è Express.js?

**Express.js** (o semplicemente Express) è un framework web minimalista e flessibile per Node.js che fornisce un set robusto di funzionalità per applicazioni web e mobile. È il framework più popolare per Node.js e viene utilizzato da aziende come IBM, Uber, e Accenture.

## Caratteristiche Principali

### 1. Minimalista e Non Opinionated
```
Express fornisce solo il necessario, permettendoti di:
✓ Scegliere la struttura del progetto
✓ Decidere quali librerie utilizzare
✓ Implementare l'architettura che preferisci
```

### 2. Routing Potente
```javascript
// Definisci route in modo semplice e intuitivo
app.get('/users', getAllUsers);
app.post('/users', createUser);
app.put('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);
```

### 3. Sistema di Middleware
```javascript
// Estendi le funzionalità con middleware
app.use(express.json());           // Parsing JSON
app.use(express.static('public')); // Serve file statici
app.use(logger);                   // Logging personalizzato
```

### 4. Template Engine Support
```javascript
// Integrazione con motori di template
app.set('view engine', 'ejs');
app.set('view engine', 'pug');
app.set('view engine', 'handlebars');
```

---

## Installazione

### 1. Prerequisiti
```bash
# Verifica versione Node.js (richiesto >= 12.x)
node --version

# Verifica versione npm
npm --version
```

### 2. Inizializza Progetto
```bash
# Crea cartella progetto
mkdir my-express-app
cd my-express-app

# Inizializza package.json
npm init -y
```

**Output `package.json`:**
```json
{
  "name": "my-express-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### 3. Installa Express
```bash
npm install express
```

Oppure con versione specifica:
```bash
npm install express@4.18.2
```

### 4. Verifica Installazione
```bash
# Controlla package.json
cat package.json
```

**`package.json` aggiornato:**
```json
{
  "name": "my-express-app",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

---

## Prima Applicazione Express

### Codice Minimale

**`app.js`:**
```javascript
// 1. Importa Express
const express = require('express');

// 2. Crea istanza applicazione
const app = express();

// 3. Definisci porta
const PORT = 3000;

// 4. Definisci route
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// 5. Avvia server
app.listen(PORT, () => {
    console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
```

### Esecuzione

```bash
node app.js
```

**Output:**
```
Server in esecuzione su http://localhost:3000
```

**Testa nel browser:**
```
http://localhost:3000
```

---

## Anatomia di un'Applicazione Express

### Struttura Base

```
my-express-app/
│
├── node_modules/      # Dipendenze installate
├── public/           # File statici (CSS, JS, immagini)
│   ├── css/
│   ├── js/
│   └── images/
│
├── views/            # Template (EJS, Pug, etc.)
│   ├── index.ejs
│   └── about.ejs
│
├── routes/           # Definizione route
│   ├── index.js
│   └── users.js
│
├── middlewares/      # Middleware personalizzati
│   └── auth.js
│
├── app.js           # File principale
├── package.json     # Configurazione progetto
└── .gitignore       # File da ignorare in git
```

### Componenti Fondamentali

#### 1. Application Object (`app`)
```javascript
const express = require('express');
const app = express();

// L'oggetto app ha metodi per:
// - Routing: app.get(), app.post(), app.put(), app.delete()
// - Middleware: app.use()
// - Configurazione: app.set(), app.get()
// - Server: app.listen()
```

#### 2. Request Object (`req`)
```javascript
app.get('/user/:id', (req, res) => {
    console.log(req.params);      // Parametri URL
    console.log(req.query);       // Query string
    console.log(req.body);        // Body della richiesta
    console.log(req.headers);     // Headers HTTP
    console.log(req.method);      // Metodo HTTP (GET, POST, etc.)
    console.log(req.url);         // URL richiesto
});
```

#### 3. Response Object (`res`)
```javascript
app.get('/demo', (req, res) => {
    // Metodi comuni di risposta:
    res.send('Testo o HTML');
    res.json({ message: 'Oggetto JSON' });
    res.status(404).send('Non trovato');
    res.redirect('/altra-pagina');
    res.render('template');
    res.sendFile('/path/to/file.html');
});
```

---

## Express vs HTTP nativo di Node.js

### HTTP Nativo
```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    // Routing manuale
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Home Page</h1>');
    } else if (req.url === '/about' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>About Page</h1>');
    } else if (req.url === '/api/data' && req.method === 'POST') {
        // Parsing body manuale
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const data = JSON.parse(body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ received: data }));
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(3000);
```

### Con Express
```javascript
const express = require('express');
const app = express();

// Middleware per parsing JSON
app.use(express.json());

// Routing semplificato
app.get('/', (req, res) => {
    res.send('<h1>Home Page</h1>');
});

app.get('/about', (req, res) => {
    res.send('<h1>About Page</h1>');
});

app.post('/api/data', (req, res) => {
    // Body già parsato automaticamente
    res.json({ received: req.body });
});

// 404 automatico per route non definite
app.use((req, res) => {
    res.status(404).send('Not Found');
});

app.listen(3000);
```

**Vantaggi Express:**
- ✅ Codice più pulito e leggibile
- ✅ Routing automatico
- ✅ Middleware riusabili
- ✅ Parsing automatico di body, cookie, etc.
- ✅ Gestione errori centralizzata
- ✅ Supporto template engine

---

## Metodi HTTP Supportati

Express supporta tutti i metodi HTTP standard:

```javascript
// GET - Recupera dati
app.get('/users', (req, res) => {
    res.json({ users: [] });
});

// POST - Crea nuova risorsa
app.post('/users', (req, res) => {
    const newUser = req.body;
    res.status(201).json({ created: newUser });
});

// PUT - Aggiorna risorsa (completa)
app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    res.json({ updated: id, data: updates });
});

// PATCH - Aggiorna risorsa (parziale)
app.patch('/users/:id', (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    res.json({ patched: id, data: updates });
});

// DELETE - Elimina risorsa
app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    res.json({ deleted: id });
});

// HEAD - Come GET ma senza body
app.head('/users', (req, res) => {
    res.status(200).end();
});

// OPTIONS - Opzioni disponibili
app.options('/users', (req, res) => {
    res.set('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
    res.status(200).end();
});
```

---

## Configurazione dell'Applicazione

### Impostazioni Comuni

```javascript
const express = require('express');
const app = express();

// Imposta porta
app.set('port', process.env.PORT || 3000);

// Imposta view engine
app.set('view engine', 'ejs');

// Imposta directory views
app.set('views', './views');

// Abilita/disabilita funzionalità
app.set('trust proxy', true);
app.set('case sensitive routing', true);
app.set('strict routing', false);

// Modalità sviluppo/produzione
app.set('env', process.env.NODE_ENV || 'development');

// Usa le impostazioni
const port = app.get('port');
const env = app.get('env');

console.log(`Ambiente: ${env}`);
console.log(`Porta: ${port}`);
```

---

## Best Practices

### 1. Usa Variabili d'Ambiente
```javascript
// .env file
PORT=3000
NODE_ENV=development

// app.js
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';
```

### 2. Organizza il Codice
```javascript
// Invece di tutto in un file
// app.js
const express = require('express');
const app = express();

const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
```

### 3. Gestione Errori
```javascript
// Middleware per errori (deve essere ultimo)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Qualcosa è andato storto!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
```

### 4. Logging
```javascript
// Usa middleware per logging
const morgan = require('morgan');

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}
```

### 5. Sicurezza
```javascript
const helmet = require('helmet');
const cors = require('cors');

// Proteggi headers HTTP
app.use(helmet());

// Abilita CORS
app.use(cors({
    origin: 'https://tuosito.com',
    credentials: true
}));
```

---

## Esercizi Pratici

### Esercizio 1: Hello World Avanzato
Crea un'applicazione che:
1. Risponde su porta 3000
2. Ha 3 route: `/`, `/about`, `/contact`
3. Logga ogni richiesta con timestamp
4. Gestisce 404 per route non trovate

### Esercizio 2: API Semplice
Crea un'API con Express che:
1. Gestisce una lista di libri (array in memoria)
2. Implementa CRUD completo
3. Risponde in formato JSON
4. Usa codici di stato HTTP appropriati

### Esercizio 3: Configurazione
Configura un'applicazione Express con:
1. File `.env` per configurazione
2. Logging con Morgan
3. Middleware di sicurezza con Helmet
4. Gestione errori centralizzata

---

## Prossimi Passi

Ora che conosci le basi di Express, puoi procedere con:

1. **[Routing](./02-routing.md)** - Gestione avanzata delle route
2. **[Middleware](./03-middleware.md)** - Creazione e utilizzo di middleware
3. **[Gestione Richieste](./04-gestione-richieste.md)** - Parametri, query, body
4. **[Template Engine](./05-template-engine.md)** - Rendering dinamico di HTML

---

## Risorse Utili

- [Documentazione Ufficiale Express](https://expressjs.com/)
- [Express GitHub Repository](https://github.com/expressjs/express)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Express API Reference](https://expressjs.com/en/4x/api.html)
