# Esercitazione 10: Template Engine in Node.js

## Argomenti Teorici Collegati
- [Introduzione ai Template Engine](./teoria/01-introduzione-template-engine.md)
- [EJS: Embedded JavaScript](./teoria/02-ejs.md)
- [Handlebars: Logica Minima](./teoria/03-handlebars.md)
- [Pug: Template Engine Minimalista](./teoria/04-pug.md)

## Descrizione
In questa esercitazione esploreremo i template engine, strumenti fondamentali per lo sviluppo di applicazioni web dinamiche con Node.js. I template engine permettono di separare la logica dell'applicazione dalla presentazione, rendendo il codice più organizzato e manutenibile.

## Obiettivi
- Comprendere il concetto di template engine e il suo ruolo nello sviluppo web
- Imparare a configurare e utilizzare i principali template engine con Express.js
- Creare pagine dinamiche con dati provenienti dal server
- Implementare layout, partials e componenti riutilizzabili
- Gestire form e dati utente attraverso template

## Prerequisiti
- Conoscenza di base di Node.js e Express.js
- Comprensione dei concetti di routing e middleware
- Familiarità con HTML e CSS

## Esercizio 1: Configurazione di un Template Engine

### Obiettivo
Configurare un'applicazione Express.js per utilizzare EJS come template engine.

### Passaggi
1. Crea una nuova applicazione Express
2. Installa EJS con npm: `npm install ejs`
3. Configura Express per utilizzare EJS:

```javascript
const express = require('express');
const app = express();

// Configura EJS come template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Crea una cartella 'views' per i template
// Crea una route di base
app.get('/', (req, res) => {
  res.render('index', { title: 'Home Page', message: 'Benvenuto nel mio sito!' });
});

app.listen(3000, () => {
  console.log('Server avviato sulla porta 3000');
});
```

4. Crea un file `views/index.ejs`:

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

5. Avvia l'applicazione e verifica che funzioni correttamente

## Esercizio 2: Layout e Partials

### Obiettivo
Implementare un sistema di layout e componenti riutilizzabili con EJS.

### Passaggi
1. Crea un layout di base in `views/layouts/main.ejs`:

```html
<!DOCTYPE html>
<html>
<head>
  <title><%= title %></title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <%- include('../partials/header') %>
  
  <main>
    <%- body %>
  </main>
  
  <%- include('../partials/footer') %>
</body>
</html>
```

2. Crea i partials in `views/partials/`:
   - `header.ejs` con la navigazione
   - `footer.ejs` con informazioni di copyright

3. Installa e configura `express-ejs-layouts`:

```javascript
const expressLayouts = require('express-ejs-layouts');

app.use(expressLayouts);
app.set('layout', 'layouts/main');
```

4. Modifica le tue pagine per utilizzare il layout

## Esercizio 3: Rendering di Dati Dinamici

### Obiettivo
Creare una pagina che visualizza un elenco di elementi da un array.

### Passaggi
1. Crea un array di dati nel tuo server:

```javascript
const products = [
  { id: 1, name: 'Laptop', price: 999.99, description: 'Potente laptop per sviluppatori' },
  { id: 2, name: 'Smartphone', price: 699.99, description: 'Smartphone di ultima generazione' },
  { id: 3, name: 'Tablet', price: 499.99, description: 'Tablet leggero e versatile' }
];

app.get('/products', (req, res) => {
  res.render('products', { 
    title: 'Prodotti', 
    products: products 
  });
});
```

2. Crea un template `views/products.ejs` che itera sull'array:

```html
<h1>I Nostri Prodotti</h1>

<div class="products">
  <% if(products.length > 0) { %>
    <% products.forEach(product => { %>
      <div class="product-card">
        <h2><%= product.name %></h2>
        <p class="price">€<%= product.price.toFixed(2) %></p>
        <p><%= product.description %></p>
        <a href="/products/<%= product.id %>">Dettagli</a>
      </div>
    <% }); %>
  <% } else { %>
    <p>Nessun prodotto disponibile.</p>
  <% } %>
</div>
```

## Esercizio 4: Form e Gestione dei Dati

### Obiettivo
Creare un form per aggiungere nuovi elementi e gestire i dati inviati.

### Passaggi
1. Crea una route per visualizzare il form:

```javascript
app.get('/products/new', (req, res) => {
  res.render('product-form', { title: 'Nuovo Prodotto' });
});
```

2. Crea il template `views/product-form.ejs`:

```html
<h1>Aggiungi Nuovo Prodotto</h1>

<form action="/products" method="POST">
  <div class="form-group">
    <label for="name">Nome Prodotto:</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div class="form-group">
    <label for="price">Prezzo:</label>
    <input type="number" id="price" name="price" step="0.01" required>
  </div>
  
  <div class="form-group">
    <label for="description">Descrizione:</label>
    <textarea id="description" name="description" rows="4" required></textarea>
  </div>
  
  <button type="submit">Aggiungi Prodotto</button>
</form>
```

3. Configura il middleware per il parsing dei dati del form:

```javascript
app.use(express.urlencoded({ extended: true }));
```

4. Crea una route per gestire l'invio del form:

```javascript
app.post('/products', (req, res) => {
  const { name, price, description } = req.body;
  
  // Crea un nuovo prodotto
  const newProduct = {
    id: products.length + 1,
    name,
    price: parseFloat(price),
    description
  };
  
  // Aggiungi all'array
  products.push(newProduct);
  
  // Reindirizza alla lista prodotti
  res.redirect('/products');
});
```

## Esercizio 5: Pagina di Dettaglio

### Obiettivo
Creare una pagina di dettaglio per visualizzare informazioni complete su un singolo elemento.

### Passaggi
1. Crea una route per la pagina di dettaglio:

```javascript
app.get('/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).render('error', { 
      title: 'Errore', 
      message: 'Prodotto non trovato' 
    });
  }
  
  res.render('product-detail', { 
    title: product.name, 
    product 
  });
});
```

2. Crea il template `views/product-detail.ejs`:

```html
<div class="product-detail">
  <h1><%= product.name %></h1>
  <p class="price">€<%= product.price.toFixed(2) %></p>
  <div class="description">
    <h2>Descrizione</h2>
    <p><%= product.description %></p>
  </div>
  <a href="/products" class="back-link">Torna ai Prodotti</a>
</div>
```

## Risorse Aggiuntive
- [Documentazione ufficiale di EJS](https://ejs.co/)
- [Documentazione di Express.js sui template engine](https://expressjs.com/en/guide/using-template-engines.html)
- [Tutorial su Handlebars](https://handlebarsjs.com/guide/)
- [Documentazione di Pug](https://pugjs.org/api/getting-started.html)

## Conclusione
In questa esercitazione hai imparato a utilizzare i template engine per creare pagine web dinamiche con Node.js e Express. Hai configurato EJS, implementato layout e partials, e creato pagine che visualizzano dati dinamici. Questi concetti sono fondamentali per lo sviluppo di applicazioni web moderne e ti permetteranno di creare interfacce utente più complesse e interattive.

Nel prossimo modulo, esploreremo come integrare un database con la tua applicazione Express per creare applicazioni web complete con persistenza dei dati.

## Navigazione del Corso

- [Indice del Corso](../README.md)
- [Modulo Precedente: Middleware e Autenticazione](../09-Middleware-Autenticazione/README.md)
- [Modulo Successivo: MongoDB](../11-MongoDB/README.md)