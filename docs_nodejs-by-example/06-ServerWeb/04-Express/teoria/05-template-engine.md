# 05. Template Engine in Express.js

## Cos'è un Template Engine?

Un **template engine** permette di generare HTML dinamicamente combinando dati con template predefiniti.

```
Template + Dati → Template Engine → HTML
```

---

## Template Engine Supportati

Express supporta numerosi template engine:

| Engine | Sintassi | Caratteristiche |
|--------|----------|----------------|
| **EJS** | `<%= %>` | HTML-like, facile da imparare |
| **Pug** | Indentazione | Minimale, potente |
| **Handlebars** | `{{ }}` | Logica limitata, sicuro |
| **Nunjucks** | `{{ }}` | Simile a Jinja2 |
| **Mustache** | `{{ }}` | Logic-less |

---

## EJS (Embedded JavaScript)

### Installazione

```bash
npm install ejs
```

### Configurazione

```javascript
const express = require('express');
const app = express();

// Imposta EJS come template engine
app.set('view engine', 'ejs');

// Directory dei template (default: views/)
app.set('views', './views');
```

### Sintassi EJS

#### Output di Variabili

```ejs
<!-- Escaped output (sicuro contro XSS) -->
<h1><%= title %></h1>

<!-- Raw output (NON escapato) -->
<div><%- htmlContent %></div>

<!-- JavaScript code (non stampa) -->
<% const user = { name: 'Mario' }; %>
```

#### Esempio Completo

**`views/index.ejs`:**
```ejs
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title><%= title %></title>
</head>
<body>
    <h1><%= title %></h1>
    <p>Benvenuto, <%= userName %>!</p>
    
    <!-- Condizionale -->
    <% if (isAdmin) { %>
        <a href="/admin">Pannello Admin</a>
    <% } else { %>
        <a href="/profile">Profilo</a>
    <% } %>
    
    <!-- Loop -->
    <ul>
        <% items.forEach(item => { %>
            <li><%= item.name %> - €<%= item.price %></li>
        <% }); %>
    </ul>
</body>
</html>
```

**`app.js`:**
```javascript
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home Page',
        userName: 'Mario',
        isAdmin: true,
        items: [
            { name: 'Prodotto 1', price: 19.99 },
            { name: 'Prodotto 2', price: 29.99 },
            { name: 'Prodotto 3', price: 39.99 }
        ]
    });
});
```

---

## Struttura Template

### Layout e Partials

#### Layout (Template Base)

**`views/layout.ejs`:**
```ejs
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <title><%= title %></title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <%- include('partials/header') %>
    
    <main>
        <%- body %>
    </main>
    
    <%- include('partials/footer') %>
    
    <script src="/js/main.js"></script>
</body>
</html>
```

#### Partials (Componenti Riusabili)

**`views/partials/header.ejs`:**
```ejs
<header>
    <nav>
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contatti</a></li>
        </ul>
    </nav>
</header>
```

**`views/partials/footer.ejs`:**
```ejs
<footer>
    <p>&copy; 2024 My Website. Tutti i diritti riservati.</p>
</footer>
```

#### Uso Include

**`views/index.ejs`:**
```ejs
<!DOCTYPE html>
<html>
<head>
    <title><%= title %></title>
</head>
<body>
    <%- include('partials/header') %>
    
    <main>
        <h1><%= title %></h1>
        <p><%= content %></p>
    </main>
    
    <%- include('partials/footer') %>
</body>
</html>
```

---

## Passaggio Dati ai Template

### Dati Semplici

```javascript
app.get('/user/:id', (req, res) => {
    res.render('user', {
        userId: req.params.id,
        userName: 'Mario Rossi',
        email: 'mario@example.com'
    });
});
```

### Dati da Database (Async)

```javascript
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.render('users', {
            title: 'Lista Utenti',
            users: users
        });
    } catch (error) {
        res.status(500).render('error', {
            message: 'Errore nel caricamento utenti'
        });
    }
});
```

### Dati Globali (Locals)

```javascript
// Middleware per dati disponibili in tutti i template
app.use((req, res, next) => {
    res.locals.appName = 'My App';
    res.locals.currentYear = new Date().getFullYear();
    res.locals.user = req.session.user || null;
    next();
});

// Disponibili in tutti i template
app.get('/', (req, res) => {
    res.render('index'); // appName e currentYear già disponibili
});
```

**In template:**
```ejs
<footer>
    <p>&copy; <%= currentYear %> <%= appName %></p>
</footer>
```

---

## Logica nei Template

### Condizionali

```ejs
<!-- If-Else -->
<% if (user) { %>
    <p>Benvenuto, <%= user.name %>!</p>
<% } else { %>
    <p><a href="/login">Login</a></p>
<% } %>

<!-- If-Else If-Else -->
<% if (user.role === 'admin') { %>
    <a href="/admin">Pannello Admin</a>
<% } else if (user.role === 'moderator') { %>
    <a href="/moderate">Moderazione</a>
<% } else { %>
    <a href="/dashboard">Dashboard</a>
<% } %>

<!-- Ternary operator -->
<p class="<%= user.active ? 'active' : 'inactive' %>">
    Status: <%= user.active ? 'Attivo' : 'Inattivo' %>
</p>
```

### Loop

```ejs
<!-- forEach -->
<ul>
    <% products.forEach(product => { %>
        <li>
            <%= product.name %> - €<%= product.price.toFixed(2) %>
        </li>
    <% }); %>
</ul>

<!-- for loop -->
<% for (let i = 0; i < items.length; i++) { %>
    <div>Item <%= i + 1 %>: <%= items[i] %></div>
<% } %>

<!-- for...of -->
<% for (const item of items) { %>
    <p><%= item %></p>
<% } %>

<!-- Loop con indice -->
<% items.forEach((item, index) => { %>
    <div class="<%= index % 2 === 0 ? 'even' : 'odd' %>">
        <%= item.name %>
    </div>
<% }); %>
```

### Gestione Array Vuoti

```ejs
<% if (products.length > 0) { %>
    <ul>
        <% products.forEach(product => { %>
            <li><%= product.name %></li>
        <% }); %>
    </ul>
<% } else { %>
    <p>Nessun prodotto disponibile</p>
<% } %>
```

---

## Helper Functions

### Definizione Helper

```javascript
// app.js
app.locals.formatDate = (date) => {
    return new Date(date).toLocaleDateString('it-IT');
};

app.locals.formatPrice = (price) => {
    return `€${price.toFixed(2)}`;
};

app.locals.truncate = (text, length = 100) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
};
```

### Uso in Template

```ejs
<p>Data: <%= formatDate(product.createdAt) %></p>
<p>Prezzo: <%= formatPrice(product.price) %></p>
<p><%= truncate(product.description, 150) %></p>
```

---

## Form e Input

### Form Semplice

**`views/contact.ejs`:**
```ejs
<!DOCTYPE html>
<html>
<head>
    <title>Contatti</title>
</head>
<body>
    <h1>Contattaci</h1>
    
    <% if (errors && errors.length > 0) { %>
        <div class="alert alert-danger">
            <ul>
                <% errors.forEach(error => { %>
                    <li><%= error %></li>
                <% }); %>
            </ul>
        </div>
    <% } %>
    
    <% if (success) { %>
        <div class="alert alert-success">
            <%= success %>
        </div>
    <% } %>
    
    <form action="/contact" method="POST">
        <div>
            <label for="name">Nome:</label>
            <input type="text" id="name" name="name" value="<%= formData.name || '' %>" required>
        </div>
        
        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" value="<%= formData.email || '' %>" required>
        </div>
        
        <div>
            <label for="message">Messaggio:</label>
            <textarea id="message" name="message" required><%= formData.message || '' %></textarea>
        </div>
        
        <button type="submit">Invia</button>
    </form>
</body>
</html>
```

**`app.js`:**
```javascript
app.get('/contact', (req, res) => {
    res.render('contact', {
        errors: [],
        success: null,
        formData: {}
    });
});

app.post('/contact', (req, res) => {
    const { name, email, message } = req.body;
    const errors = [];
    
    // Validazione
    if (!name || name.length < 2) {
        errors.push('Nome deve essere almeno 2 caratteri');
    }
    if (!email || !email.includes('@')) {
        errors.push('Email non valida');
    }
    if (!message || message.length < 10) {
        errors.push('Messaggio troppo corto');
    }
    
    if (errors.length > 0) {
        return res.render('contact', {
            errors: errors,
            success: null,
            formData: req.body
        });
    }
    
    // Successo
    res.render('contact', {
        errors: [],
        success: 'Messaggio inviato con successo!',
        formData: {}
    });
});
```

---

## CRUD con Template

### Lista (Read)

**`views/products/index.ejs`:**
```ejs
<h1>Prodotti</h1>

<a href="/products/new">Nuovo Prodotto</a>

<table>
    <thead>
        <tr>
            <th>Nome</th>
            <th>Prezzo</th>
            <th>Azioni</th>
        </tr>
    </thead>
    <tbody>
        <% products.forEach(product => { %>
            <tr>
                <td><%= product.name %></td>
                <td><%= formatPrice(product.price) %></td>
                <td>
                    <a href="/products/<%= product.id %>">Dettagli</a>
                    <a href="/products/<%= product.id %>/edit">Modifica</a>
                    <form action="/products/<%= product.id %>/delete" method="POST" style="display:inline">
                        <button type="submit">Elimina</button>
                    </form>
                </td>
            </tr>
        <% }); %>
    </tbody>
</table>
```

### Dettaglio (Read One)

**`views/products/show.ejs`:**
```ejs
<h1><%= product.name %></h1>

<dl>
    <dt>Prezzo:</dt>
    <dd><%= formatPrice(product.price) %></dd>
    
    <dt>Descrizione:</dt>
    <dd><%= product.description %></dd>
    
    <dt>Categoria:</dt>
    <dd><%= product.category %></dd>
</dl>

<a href="/products">Torna alla lista</a>
<a href="/products/<%= product.id %>/edit">Modifica</a>
```

### Creazione (Create)

**`views/products/new.ejs`:**
```ejs
<h1>Nuovo Prodotto</h1>

<form action="/products" method="POST">
    <div>
        <label for="name">Nome:</label>
        <input type="text" id="name" name="name" required>
    </div>
    
    <div>
        <label for="price">Prezzo:</label>
        <input type="number" id="price" name="price" step="0.01" required>
    </div>
    
    <div>
        <label for="description">Descrizione:</label>
        <textarea id="description" name="description"></textarea>
    </div>
    
    <button type="submit">Crea</button>
    <a href="/products">Annulla</a>
</form>
```

### Modifica (Update)

**`views/products/edit.ejs`:**
```ejs
<h1>Modifica Prodotto</h1>

<form action="/products/<%= product.id %>" method="POST">
    <input type="hidden" name="_method" value="PUT">
    
    <div>
        <label for="name">Nome:</label>
        <input type="text" id="name" name="name" value="<%= product.name %>" required>
    </div>
    
    <div>
        <label for="price">Prezzo:</label>
        <input type="number" id="price" name="price" value="<%= product.price %>" step="0.01" required>
    </div>
    
    <div>
        <label for="description">Descrizione:</label>
        <textarea id="description" name="description"><%= product.description %></textarea>
    </div>
    
    <button type="submit">Salva</button>
    <a href="/products/<%= product.id %>">Annulla</a>
</form>
```

---

## Pug (Alternative Syntax)

### Installazione

```bash
npm install pug
```

### Configurazione

```javascript
app.set('view engine', 'pug');
```

### Sintassi Pug

**`views/index.pug`:**
```pug
doctype html
html(lang='it')
  head
    meta(charset='UTF-8')
    title= title
  body
    h1= title
    p Benvenuto, #{userName}!
    
    if isAdmin
      a(href='/admin') Pannello Admin
    else
      a(href='/profile') Profilo
    
    ul
      each item in items
        li= item.name + ' - €' + item.price
```

---

## Best Practices

### 1. Separazione Logica

```javascript
// ❌ Male: logica nel template
<% 
const filtered = products.filter(p => p.price > 100);
const sorted = filtered.sort((a, b) => b.price - a.price);
%>

// ✅ Bene: logica nel controller
app.get('/products', (req, res) => {
    const expensiveProducts = products
        .filter(p => p.price > 100)
        .sort((a, b) => b.price - a.price);
    
    res.render('products', { products: expensiveProducts });
});
```

### 2. Escape Output

```ejs
<!-- ✅ Escaped (sicuro) -->
<p><%= userInput %></p>

<!-- ❌ Non escaped (XSS risk) -->
<p><%- userInput %></p>
```

### 3. Helper per Formattazione

```javascript
// Definisci helper riusabili
app.locals.formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
};
```

### 4. Organizzazione File

```
views/
├── layouts/
│   └── main.ejs
├── partials/
│   ├── header.ejs
│   ├── footer.ejs
│   └── navbar.ejs
├── products/
│   ├── index.ejs
│   ├── show.ejs
│   ├── new.ejs
│   └── edit.ejs
├── users/
│   └── ...
└── index.ejs
```

---

## Esercizi Pratici

### Esercizio 1: Blog
Crea template per un blog con:
- Homepage con lista post
- Dettaglio post
- Form creazione post
- Layout comune con header/footer

### Esercizio 2: Dashboard
Implementa dashboard con:
- Statistiche (cards)
- Tabella dati
- Grafici (usando dati passati)
- Sidebar navigazione

### Esercizio 3: E-commerce
Crea pagine:
- Catalogo prodotti con filtri
- Carrello
- Checkout form
- Conferma ordine

---

## Conclusione

Hai completato il modulo Express! Ora sai:
- ✅ Routing e gestione richieste
- ✅ Middleware personalizzati
- ✅ Gestione parametri, query, body
- ✅ Template engine per UI dinamiche

Prossimi passi: Database, Autenticazione, Deployment!
