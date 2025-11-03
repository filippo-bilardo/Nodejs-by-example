# Esercitazione 6: Server Web in Node.js

## Panoramica
In questa esercitazione esploreremo come creare server web utilizzando Node.js. Impareremo a utilizzare il modulo HTTP nativo e il framework Express.js per costruire applicazioni web robuste e scalabili. Questa competenza è fondamentale per lo sviluppo backend con Node.js e rappresenta uno dei suoi casi d'uso più comuni.

## Obiettivi
- Comprendere i concetti fondamentali dei server HTTP in Node.js
- Creare server web di base utilizzando il modulo HTTP nativo
- Imparare a utilizzare Express.js per costruire applicazioni web più complesse
- Implementare il routing e la gestione delle richieste
- Utilizzare middleware per estendere le funzionalità del server
- Gestire form e dati JSON nelle richieste

## Argomenti Teorici Collegati
- [Introduzione ai Server Web](./teoria/01-introduzione-server-web.md)
- [Modulo HTTP in Node.js](./teoria/02-modulo-http.md)
- [Express.js: Concetti Fondamentali](./teoria/03-express-fondamenti.md)
- [Middleware e Routing](./teoria/04-middleware-routing.md)

## Esercizi Pratici

### Esercizio 6.1: Server HTTP Base

```bash
# Creazione di una directory per il progetto
mkdir server-base
cd server-base
npm init -y
```

Creiamo un semplice server HTTP utilizzando il modulo nativo di Node.js:

```javascript
// server.js
const http = require('http');

const server = http.createServer((req, res) => {
  // Impostazione dell'header della risposta
  res.setHeader('Content-Type', 'text/html');
  
  // Gestione delle diverse route
  if (req.url === '/') {
    res.statusCode = 200;
    res.end('<html><body><h1>Benvenuto nel mio server!</h1><p>Questa è la pagina principale.</p></body></html>');
  } else if (req.url === '/info') {
    res.statusCode = 200;
    res.end('<html><body><h1>Informazioni</h1><p>Questo è un semplice server creato con Node.js.</p></body></html>');
  } else {
    res.statusCode = 404;
    res.end('<html><body><h1>404 - Pagina non trovata</h1></body></html>');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

Eseguiamo il server:

```bash
node server.js
```

### Esercizio 6.2: Server con Express.js

```bash
# Creazione di una directory per il progetto
mkdir server-express
cd server-express
npm init -y
npm install express
```

Creiamo un server utilizzando Express.js:

```javascript
// app.js
const express = require('express');
const app = express();
const PORT = 3000;

// Middleware per il parsing del corpo delle richieste
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route per la home page
app.get('/', (req, res) => {
  res.send('<h1>Benvenuto nel server Express!</h1><p>Questa è la pagina principale.</p>');
});

// Route per la pagina info
app.get('/info', (req, res) => {
  res.send('<h1>Informazioni</h1><p>Questo server è stato creato con Express.js.</p>');
});

// Route per gestire i dati di un form
app.get('/form', (req, res) => {
  res.send(`
    <h1>Form di esempio</h1>
    <form action="/submit" method="POST">
      <div>
        <label for="nome">Nome:</label>
        <input type="text" id="nome" name="nome" required>
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
      </div>
      <button type="submit">Invia</button>
    </form>
  `);
});

// Route per gestire l'invio del form
app.post('/submit', (req, res) => {
  const { nome, email } = req.body;
  res.send(`
    <h1>Dati ricevuti</h1>
    <p>Nome: ${nome}</p>
    <p>Email: ${email}</p>
    <a href="/form">Torna al form</a>
  `);
});

// Gestione delle route non trovate
app.use((req, res) => {
  res.status(404).send('<h1>404 - Pagina non trovata</h1>');
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server Express in ascolto sulla porta ${PORT}`);
});
```

Eseguiamo il server:

```bash
node app.js
```

### Esercizio 6.3: Routing e Middleware Avanzati

```bash
# Creazione di una directory per il progetto
mkdir express-avanzato
cd express-avanzato
npm init -y
npm install express morgan
```

Creiamo un'applicazione Express con routing modulare e middleware:

```javascript
// app.js
const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 3000;

// Middleware per il logging delle richieste
app.use(morgan('dev'));

// Middleware per il parsing del corpo delle richieste
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware personalizzato
app.use((req, res, next) => {
  console.log(`Richiesta ricevuta: ${req.method} ${req.url} a ${new Date().toISOString()}`);
  next(); // Passa il controllo al prossimo middleware
});

// Definizione delle routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

app.use('/users', userRoutes);
app.use('/products', productRoutes);

// Route per la home page
app.get('/', (req, res) => {
  res.send(`
    <h1>API Server</h1>
    <p>Benvenuto nel nostro API server!</p>
    <ul>
      <li><a href="/users">Utenti</a></li>
      <li><a href="/products">Prodotti</a></li>
    </ul>
  `);
});

// Gestione delle route non trovate
app.use((req, res) => {
  res.status(404).send('<h1>404 - Risorsa non trovata</h1>');
});

// Middleware per la gestione degli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('<h1>500 - Errore interno del server</h1>');
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server Express in ascolto sulla porta ${PORT}`);
});
```

Creiamo i file di routing:

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

// Dati di esempio
const users = [
  { id: 1, name: 'Mario Rossi', email: 'mario@example.com' },
  { id: 2, name: 'Luigi Verdi', email: 'luigi@example.com' },
  { id: 3, name: 'Anna Bianchi', email: 'anna@example.com' }
];

// GET tutti gli utenti
router.get('/', (req, res) => {
  res.json(users);
});

// GET un utente specifico
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'Utente non trovato' });
  }
});

// POST nuovo utente
router.post('/', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: 'Nome ed email sono richiesti' });
  }
  
  const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, name, email };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

module.exports = router;
```

```javascript
// routes/products.js
const express = require('express');
const router = express.Router();

// Dati di esempio
const products = [
  { id: 1, name: 'Laptop', price: 999.99 },
  { id: 2, name: 'Smartphone', price: 699.99 },
  { id: 3, name: 'Tablet', price: 399.99 }
];

// GET tutti i prodotti
router.get('/', (req, res) => {
  res.json(products);
});

// GET un prodotto specifico
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Prodotto non trovato' });
  }
});

// POST nuovo prodotto
router.post('/', (req, res) => {
  const { name, price } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ message: 'Nome e prezzo sono richiesti' });
  }
  
  const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
  const newProduct = { id: newId, name, price: parseFloat(price) };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

module.exports = router;
```

Eseguiamo il server:

```bash
node app.js
```

### Esercizio 6.4: Servire File Statici

```bash
# Creazione di una directory per il progetto
mkdir static-server
cd static-server
npm init -y
npm install express
mkdir public
```

Creiamo alcuni file statici:

```html
<!-- public/index.html -->
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Server di File Statici</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <h1>Benvenuto nel Server di File Statici</h1>
  </header>
  
  <main>
    <p>Questo è un esempio di server che serve file statici con Express.js.</p>
    <img src="/images/node-logo.png" alt="Logo Node.js">
    <a href="/about.html">Chi siamo</a>
  </main>
  
  <footer>
    <p>&copy; 2023 Il Mio Server</p>
  </footer>
  
  <script src="/js/main.js"></script>
</body>
</html>
```

```html
<!-- public/about.html -->
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chi Siamo</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <h1>Chi Siamo</h1>
  </header>
  
  <main>
    <p>Questa è la pagina "Chi siamo" del nostro server di file statici.</p>
    <a href="/">Torna alla home</a>
  </main>
  
  <footer>
    <p>&copy; 2023 Il Mio Server</p>
  </footer>
  
  <script src="/js/main.js"></script>
</body>
</html>
```

```css
/* public/css/style.css */
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
}

header {
  background-color: #f4f4f4;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 5px;
}

footer {
  margin-top: 30px;
  text-align: center;
  padding: 10px;
  background-color: #f4f4f4;
  border-radius: 5px;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 20px 0;
}

a {
  color: #0066cc;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

```javascript
// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('Il documento è stato caricato completamente');
  
  // Aggiungiamo un timestamp alla pagina
  const footer = document.querySelector('footer');
  const timestamp = document.createElement('p');
  timestamp.textContent = `Pagina caricata il: ${new Date().toLocaleString()}`;
  footer.appendChild(timestamp);
});
```

Creiamo il server per servire i file statici:

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware per servire file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware per il parsing del corpo delle richieste
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Route per gestire le richieste non trovate
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
  console.log(`Visita http://localhost:${PORT} nel tuo browser`);
});
```

Creiamo una pagina 404 personalizzata:

```html
<!-- public/404.html -->
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Pagina non trovata</title>
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .error-container {
      text-align: center;
      padding: 50px 0;
    }
    .error-code {
      font-size: 72px;
      margin: 0;
      color: #e74c3c;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1 class="error-code">404</h1>
    <h2>Pagina non trovata</h2>
    <p>La pagina che stai cercando non esiste o è stata spostata.</p>
    <a href="/">Torna alla home</a>
  </div>
</body>
</html>
```

Eseguiamo il server:

```bash
node server.js
```

## Sfide Aggiuntive

1. **API RESTful Completa**: Crea un'API RESTful completa con operazioni CRUD (Create, Read, Update, Delete) per una risorsa a tua scelta.

2. **Autenticazione**: Implementa un sistema di autenticazione utilizzando JSON Web Tokens (JWT) o sessioni.

3. **Template Engine**: Integra un template engine come EJS, Pug o Handlebars per generare HTML dinamicamente.

4. **Database**: Collega il tuo server a un database (MongoDB, MySQL, SQLite) per persistere i dati.

5. **WebSocket**: Implementa una funzionalità di chat in tempo reale utilizzando Socket.io.

## Risorse Aggiuntive

- [Documentazione ufficiale di Node.js - HTTP](https://nodejs.org/api/http.html)
- [Documentazione ufficiale di Express.js](https://expressjs.com/)
- [MDN Web Docs - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [RESTful API Design](https://restfulapi.net/)
- [Express.js Middleware](https://expressjs.com/en/guide/using-middleware.html)

## Navigazione del Corso

- [Indice del Corso](../README.md)
- [Modulo Precedente: NPM](../05-NPM/README.md)
- [Modulo Successivo: Gestione Richieste HTTP](../07-GestioneRichiesteHTTP/README.md)