# EJS: Embedded JavaScript

## Introduzione a EJS

EJS (Embedded JavaScript) è uno dei template engine più popolari per Node.js. Creato per essere semplice e intuitivo, EJS permette di generare markup HTML con JavaScript standard. La sua filosofia è "JavaScript nel markup", consentendo di utilizzare la sintassi JavaScript che già conosci direttamente nei tuoi template.

La popolarità di EJS deriva dalla sua semplicità e dalla bassa curva di apprendimento, specialmente per gli sviluppatori che hanno già familiarità con JavaScript e HTML.

## Caratteristiche Principali

### 1. Sintassi Familiare

EJS utilizza tag delimitatori che racchiudono il codice JavaScript:

- `<% %>` - Per eseguire codice JavaScript (senza output)
- `<%= %>` - Per inserire valori con escape HTML (previene XSS)
- `<%- %>` - Per inserire valori senza escape (per HTML fidato)
- `<%# %>` - Per commenti (non inclusi nell'output)
- `<%_ %>` - Elimina tutti gli spazi bianchi prima del tag
- `<%% %>` - Output letterale '<%'
- `<% _%>` - Elimina tutti gli spazi bianchi dopo il tag

### 2. Inclusione di File

EJS supporta l'inclusione di altri file template, permettendo di creare componenti riutilizzabili:

```ejs
<%- include('partials/header') %>
<h1>Contenuto principale</h1>
<%- include('partials/footer') %>
```

### 3. Supporto per Layout

Mentre EJS non ha un supporto nativo per i layout, è possibile utilizzare il pacchetto `express-ejs-layouts` per implementare un sistema di layout:

```javascript
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
```

### 4. Personalizzazione dei Delimitatori

È possibile personalizzare i delimitatori se quelli predefiniti entrano in conflitto con altre sintassi:

```javascript
let ejs = require('ejs');
ejs.delimiter = '$'; // Cambia da <% a $%
```

## Installazione e Configurazione

### Installazione

```bash
npm install ejs
```

Se stai utilizzando Express.js:

```bash
npm install express ejs
```

### Configurazione con Express.js

```javascript
const express = require('express');
const app = express();

// Configura EJS come template engine
app.set('view engine', 'ejs');
app.set('views', './views'); // Directory dove si trovano i template

// Route di esempio
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Home Page',
    message: 'Benvenuto nel mio sito!'
  });
});

app.listen(3000, () => {
  console.log('Server avviato sulla porta 3000');
});
```

## Sintassi e Utilizzo

### Template di Base

Un template EJS di base (`views/index.ejs`):

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
</head>
<body>
  <h1><%= message %></h1>
</body>
</html>
```

### Utilizzo di Variabili

```html
<!-- Variabile semplice -->
<h1><%= title %></h1>

<!-- Espressione JavaScript -->
<p>Anno corrente: <%= new Date().getFullYear() %></p>

<!-- Accesso a proprietà di oggetti -->
<p>Nome utente: <%= user.name %></p>
```

### Controllo di Flusso

#### Condizionali

```html
<% if (user) { %>
  <h2>Benvenuto, <%= user.name %>!</h2>
<% } else { %>
  <h2>Benvenuto, ospite!</h2>
  <a href="/login">Accedi</a>
<% } %>
```

#### Cicli

```html
<h2>Elenco Prodotti</h2>
<ul>
  <% products.forEach(function(product) { %>
    <li>
      <h3><%= product.name %></h3>
      <p>Prezzo: €<%= product.price.toFixed(2) %></p>
    </li>
  <% }); %>
</ul>

<!-- Alternativa con for loop -->
<ul>
  <% for(let i = 0; i < products.length; i++) { %>
    <li><%= products[i].name %></li>
  <% } %>
</ul>
```

### Inclusione di File

Creazione di componenti riutilizzabili:

```html
<!-- views/partials/header.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">Chi siamo</a></li>
        <li><a href="/contact">Contatti</a></li>
      </ul>
    </nav>
  </header>
```

```html
<!-- views/partials/footer.ejs -->
  <footer>
    <p>&copy; <%= new Date().getFullYear() %> La Mia App</p>
  </footer>
</body>
</html>
```

```html
<!-- views/about.ejs -->
<%- include('partials/header') %>

<main>
  <h1>Chi Siamo</h1>
  <p>Informazioni sulla nostra azienda...</p>
</main>

<%- include('partials/footer') %>
```

### Passaggio di Dati ai Partial

È possibile passare dati specifici ai file inclusi:

```html
<%- include('partials/user-card', { user: currentUser }) %>
```

## Implementazione di Layout con express-ejs-layouts

### Installazione

```bash
npm install express-ejs-layouts
```

### Configurazione

```javascript
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();

// Configura EJS e layouts
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main'); // Layout predefinito
app.set('views', './views');
```

### Creazione del Layout

```html
<!-- views/layouts/main.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
  <%- defineContent('head') %>
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">Chi siamo</a></li>
        <li><a href="/contact">Contatti</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <%- body %>
  </main>
  
  <footer>
    <p>&copy; <%= new Date().getFullYear() %> La Mia App</p>
  </footer>
  
  <%- defineContent('scripts') %>
</body>
</html>
```

### Utilizzo del Layout

```html
<!-- views/home.ejs -->
<%- contentFor('head') %>
<meta name="description" content="Pagina principale del sito">

<%- contentFor('body') %>
<h1>Benvenuto nella Home Page</h1>
<p>Questo è il contenuto principale della home page.</p>

<%- contentFor('scripts') %>
<script src="/js/home.js"></script>
```

## Gestione degli Errori

### Errori di Sintassi

Gli errori di sintassi nei template EJS possono essere difficili da debuggare. È buona pratica implementare un gestore di errori:

```javascript
app.get('/page', (req, res) => {
  try {
    res.render('page', { data });
  } catch (error) {
    console.error('Errore di rendering:', error);
    res.status(500).render('error', { message: 'Errore nel rendering della pagina' });
  }
});
```

### Gestione dei Valori Undefined

Per evitare errori quando una variabile è undefined, utilizza l'operatore di coalescenza nulla o controlli condizionali:

```html
<h1><%= title || 'Titolo Predefinito' %></h1>

<% if (typeof user !== 'undefined' && user) { %>
  <p>Benvenuto, <%= user.name %></p>
<% } %>
```

## Best Practices

### 1. Mantieni i Template Puliti

Evita di inserire logica complessa nei template. Prepara i dati nel controller:

```javascript
// Controller
app.get('/dashboard', (req, res) => {
  const user = getUserFromSession(req);
  const notifications = getNotifications(user.id);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  res.render('dashboard', {
    user,
    notifications,
    unreadCount,
    formattedDate: formatDate(new Date())
  });
});
```

### 2. Organizza i Template in Modo Modulare

Struttura i tuoi template in modo modulare per migliorare la manutenibilità:

```
views/
  layouts/
    main.ejs
    admin.ejs
  partials/
    header.ejs
    footer.ejs
    sidebar.ejs
  pages/
    home.ejs
    about.ejs
    contact.ejs
  components/
    product-card.ejs
    user-profile.ejs
```

### 3. Utilizza Helper Functions

Crea funzioni helper per operazioni comuni:

```javascript
// helpers.js
module.exports = {
  formatDate: function(date) {
    return date.toLocaleDateString('it-IT');
  },
  truncate: function(str, len) {
    return str.length > len ? str.substring(0, len) + '...' : str;
  }
};
```

```javascript
// app.js
const helpers = require('./helpers');

app.use((req, res, next) => {
  res.locals.helpers = helpers;
  next();
});
```

```html
<!-- Nel template -->
<p>Data: <%= helpers.formatDate(createdAt) %></p>
<p><%= helpers.truncate(description, 100) %></p>
```

### 4. Prevenzione XSS

Utilizza sempre `<%= %>` per l'output di dati non fidati per prevenire attacchi XSS. Usa `<%- %>` solo quando sei sicuro che il contenuto sia sicuro (ad esempio, HTML generato internamente).

## Prestazioni e Caching

EJS offre opzioni di caching per migliorare le prestazioni in produzione:

```javascript
// Abilita il caching in produzione
app.set('view cache', process.env.NODE_ENV === 'production');
```

Puoi anche pre-compilare i template per un rendering più veloce:

```javascript
const ejs = require('ejs');
const fs = require('fs');

// Leggi il template
const template = fs.readFileSync('./views/template.ejs', 'utf-8');

// Compila il template
const compiledTemplate = ejs.compile(template, { filename: './views/template.ejs' });

// Usa il template compilato
const html = compiledTemplate({ data: 'valore' });
```

## Confronto con Altri Template Engine

### EJS vs Handlebars

- **EJS**: Utilizza JavaScript completo nei template, offrendo maggiore flessibilità ma potenzialmente mescolando logica e presentazione
- **Handlebars**: Promuove una separazione più rigida tra logica e presentazione con una sintassi più limitata

### EJS vs Pug

- **EJS**: Mantiene la sintassi HTML standard con JavaScript incorporato
- **Pug**: Utilizza una sintassi minimalista basata sull'indentazione che può essere più concisa ma richiede apprendimento

## Conclusione

EJS è un template engine potente ma semplice da utilizzare, ideale per sviluppatori che preferiscono mantenere la familiarità con JavaScript nei loro template. La sua sintassi intuitiva, combinata con la flessibilità di eseguire codice JavaScript completo, lo rende una scelta eccellente per progetti di varie dimensioni.

Sebbene possa incoraggiare l'inserimento di troppa logica nei template se non utilizzato con disciplina, EJS offre un buon equilibrio tra semplicità e potenza, rendendolo uno dei template engine più popolari nell'ecosistema Node.js.

Nel prossimo capitolo, esploreremo Handlebars, un template engine che adotta un approccio diverso, focalizzandosi sulla minimizzazione della logica nei template.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Torna all'Esercitazione 10](../README.md)
- [Precedente: Introduzione ai Template Engine](./01-introduzione-template-engine.md)
- [Prossimo: Handlebars - Logica Minima](./03-handlebars.md)