# Esercitazione 4: Express.js

## Descrizione

Questa esercitazione ti introdurrà a Express.js, il framework web più popolare per Node.js. Express semplifica lo sviluppo di applicazioni web e API fornendo un insieme di funzionalità robuste per la gestione delle richieste HTTP, il routing, i middleware e molto altro.

## Obiettivi

- Comprendere i concetti fondamentali di Express.js
- Creare un'applicazione web di base con Express
- Implementare il routing per gestire diverse URL
- Utilizzare i middleware per estendere le funzionalità dell'applicazione
- Gestire i dati delle richieste (parametri, query, body)
- Implementare il rendering di template HTML

## Esercizi Pratici

### Esercizio 4.1: Installazione e Prima Applicazione
1. Crea una nuova cartella per il progetto e inizializza un progetto Node.js:

```bash
mkdir express-app
cd express-app
npm init -y
```

2. Installa Express:

```bash
npm install express
```

3. Crea un file `app.js` con il seguente contenuto:

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Benvenuto nella mia prima applicazione Express!');
});

app.listen(port, () => {
  console.log(`Applicazione in ascolto su http://localhost:${port}`);
});
```

4. Avvia l'applicazione:

```bash
node app.js
```

5. Visita `http://localhost:3000` nel tuo browser

### Esercizio 4.2: Routing di Base
1. Modifica il file `app.js` per aggiungere più route:

```javascript
const express = require('express');
const app = express();
const port = 3000;

// Route per la home page
app.get('/', (req, res) => {
  res.send('Benvenuto nella mia applicazione Express!');
});

// Route per la pagina about
app.get('/about', (req, res) => {
  res.send('Questa è la pagina About. L\'applicazione è stata creata per imparare Express.js.');
});

// Route per la pagina contatti
app.get('/contatti', (req, res) => {
  res.send('Contattaci all\'indirizzo email: esempio@dominio.com');
});

// Route con parametri
app.get('/utenti/:id', (req, res) => {
  res.send(`Stai visualizzando il profilo dell'utente con ID: ${req.params.id}`);
});

// Gestione delle route non trovate (404)
app.use((req, res) => {
  res.status(404).send('Pagina non trovata');
});

app.listen(port, () => {
  console.log(`Applicazione in ascolto su http://localhost:${port}`);
});
```

2. Riavvia l'applicazione e prova a visitare le diverse route

### Esercizio 4.3: Middleware
1. Crea un file `middleware.js` con il seguente contenuto:

```javascript
const express = require('express');
const app = express();
const port = 3000;

// Middleware per il logging delle richieste
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next(); // Passa il controllo al prossimo middleware
});

// Middleware per verificare l'autenticazione (esempio)
const requireAuth = (req, res, next) => {
  // In un'applicazione reale, qui verificheresti l'autenticazione
  const isAuthenticated = req.query.auth === 'true';
  
  if (isAuthenticated) {
    next(); // Utente autenticato, procedi
  } else {
    res.status(401).send('Non sei autorizzato ad accedere a questa risorsa');
  }
};

// Route pubblica
app.get('/', (req, res) => {
  res.send('Benvenuto nella home page pubblica');
});

// Route protetta con middleware di autenticazione
app.get('/area-riservata', requireAuth, (req, res) => {
  res.send('Benvenuto nell\'area riservata!');
});

app.listen(port, () => {
  console.log(`Applicazione in ascolto su http://localhost:${port}`);
});
```

2. Esegui l'applicazione e prova ad accedere a `/area-riservata` con e senza il parametro `?auth=true`

### Esercizio 4.4: Gestione dei Dati delle Richieste
1. Crea un file `form.js` con il seguente contenuto:

```javascript
const express = require('express');
const app = express();
const port = 3000;

// Middleware per il parsing dei dati form
app.use(express.urlencoded({ extended: true }));
// Middleware per il parsing dei dati JSON
app.use(express.json());

// Servire un form HTML
app.get('/', (req, res) => {
  res.send(`
    <h1>Form di Esempio</h1>
    <form action="/submit" method="POST">
      <div>
        <label for="nome">Nome:</label>
        <input type="text" id="nome" name="nome" required>
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
      </div>
      <div>
        <label for="messaggio">Messaggio:</label>
        <textarea id="messaggio" name="messaggio" required></textarea>
      </div>
      <button type="submit">Invia</button>
    </form>
  `);
});

// Gestione dell'invio del form
app.post('/submit', (req, res) => {
  const { nome, email, messaggio } = req.body;
  res.send(`
    <h1>Dati Ricevuti</h1>
    <p><strong>Nome:</strong> ${nome}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Messaggio:</strong> ${messaggio}</p>
    <a href="/">Torna al form</a>
  `);
});

// Esempio di API che accetta dati JSON
app.post('/api/dati', (req, res) => {
  console.log('Dati ricevuti:', req.body);
  res.json({ success: true, data: req.body });
});

app.listen(port, () => {
  console.log(`Applicazione in ascolto su http://localhost:${port}`);
});
```

2. Esegui l'applicazione e compila il form

### Esercizio 4.5: Rendering di Template con EJS
1. Installa EJS:

```bash
npm install ejs
```

2. Crea una cartella `views` e all'interno crea un file `index.ejs`:

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= titolo %></title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    header { background: #f4f4f4; padding: 20px; text-align: center; }
    .container { width: 80%; margin: auto; }
    ul { list-style-type: none; }
    li { padding: 8px; border-bottom: 1px solid #ddd; }
    li:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <header>
    <h1><%= titolo %></h1>
    <p><%= descrizione %></p>
  </header>
  
  <div class="container">
    <h2>Elenco degli Elementi</h2>
    <ul>
      <% elementi.forEach(elemento => { %>
        <li><%= elemento.nome %> - <%= elemento.descrizione %></li>
      <% }); %>
    </ul>
  </div>
</body>
</html>
```

3. Crea un file `template.js`:

```javascript
const express = require('express');
const app = express();
const port = 3000;

// Imposta EJS come motore di template
app.set('view engine', 'ejs');

// Route che utilizza il template
app.get('/', (req, res) => {
  // Dati da passare al template
  const dati = {
    titolo: 'Applicazione Express con EJS',
    descrizione: 'Questo è un esempio di rendering di template con EJS',
    elementi: [
      { nome: 'Elemento 1', descrizione: 'Descrizione del primo elemento' },
      { nome: 'Elemento 2', descrizione: 'Descrizione del secondo elemento' },
      { nome: 'Elemento 3', descrizione: 'Descrizione del terzo elemento' },
      { nome: 'Elemento 4', descrizione: 'Descrizione del quarto elemento' }
    ]
  };
  
  // Renderizza il template 'index.ejs' con i dati
  res.render('index', dati);
});

app.listen(port, () => {
  console.log(`Applicazione in ascolto su http://localhost:${port}`);
});
```

4. Esegui l'applicazione e visita la home page

## Sfida Aggiuntiva
Crea un'applicazione Express completa che implementi un semplice sistema di gestione delle attività (TODO list) con le seguenti funzionalità:

1. Visualizzazione di tutte le attività
2. Aggiunta di una nuova attività
3. Modifica di un'attività esistente
4. Eliminazione di un'attività
5. Marcatura di un'attività come completata

Utilizza EJS per il rendering delle pagine e implementa una struttura di routing organizzata.

```javascript
// Esempio di struttura di base (da implementare completamente)
const express = require('express');
const app = express();
const port = 3000;

// Configurazione
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Dati di esempio (in un'applicazione reale useresti un database)
let todos = [
  { id: 1, testo: 'Imparare Express.js', completato: false },
  { id: 2, testo: 'Creare un\'API REST', completato: false },
  { id: 3, testo: 'Implementare l\'autenticazione', completato: false }
];

// Routes
app.get('/', (req, res) => {
  res.render('todos/index', { todos });
});

// Implementa le altre route per la gestione delle attività

app.listen(port, () => {
  console.log(`Applicazione TODO in ascolto su http://localhost:${port}`);
});
```

## Argomenti Teorici Collegati

- [1. Introduzione a Express.js](./teoria/01-introduzione-express.md)
- [2. Routing](./teoria/02-routing.md)
- [3. Middleware](./teoria/03-middleware.md)
- [4. Gestione delle Richieste](./teoria/04-gestione-richieste.md)
- [5. Template Engine](./teoria/05-template-engine.md)

## Risorse Aggiuntive

- [Documentazione ufficiale di Express.js](https://expressjs.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Tutorial su EJS](https://ejs.co/#docs)

## Navigazione

- [Indice del Corso](../README.md)
- Modulo Precedente: [NPM e Gestione Pacchetti](../03-NPM/README.md)
- Modulo Successivo: [Database](../05-Database/README.md)