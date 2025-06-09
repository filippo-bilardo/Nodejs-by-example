# Pug: Template Engine Minimalista

## Introduzione a Pug

Pug (precedentemente noto come Jade) è un template engine ad alta prestazione per Node.js che si distingue per la sua sintassi minimalista e concisa. A differenza di altri template engine che mantengono una sintassi simile all'HTML, Pug utilizza l'indentazione per definire la struttura del documento, eliminando la necessità di tag di chiusura e riducendo significativamente la quantità di codice da scrivere.

La filosofia di Pug è "scrivere meno, fare di più". Questa sintassi compatta può sembrare inizialmente estranea agli sviluppatori abituati all'HTML tradizionale, ma una volta appresa, può aumentare notevolmente la produttività e la leggibilità del codice.

## Caratteristiche Principali

### 1. Sintassi Basata sull'Indentazione

Pug utilizza l'indentazione per definire la gerarchia degli elementi, eliminando la necessità di tag di apertura e chiusura:

```pug
html
  head
    title Il mio sito
  body
    h1 Benvenuto
    p Questo è un paragrafo
```

Questo viene compilato in:

```html
<html>
  <head>
    <title>Il mio sito</title>
  </head>
  <body>
    <h1>Benvenuto</h1>
    <p>Questo è un paragrafo</p>
  </body>
</html>
```

### 2. Attributi degli Elementi

Gli attributi vengono specificati tra parentesi:

```pug
a(href="https://example.com", target="_blank") Visita il sito
input(type="text", placeholder="Inserisci il tuo nome", required)
```

### 3. Interpolazione di Variabili

Pug supporta l'interpolazione di variabili in diversi modi:

```pug
// Interpolazione di testo
h1= title
p= description

// Interpolazione all'interno del testo
p Benvenuto, #{username}!

// Interpolazione con escape automatico
div= htmlContent

// Interpolazione senza escape
div!= htmlContent
```

### 4. Mixins

I mixins sono simili alle funzioni e permettono di creare blocchi di codice riutilizzabili:

```pug
//- Definizione di un mixin
mixin userCard(user)
  .user-card
    h3= user.name
    if user.email
      p Email: #{user.email}
    if user.role
      p.role= user.role

//- Utilizzo del mixin
+userCard({name: 'Mario Rossi', email: 'mario@example.com', role: 'Admin'})
+userCard({name: 'Luigi Verdi'})
```

### 5. Estensione e Inclusione

Pug supporta l'estensione di template e l'inclusione di file:

```pug
//- layout.pug
html
  head
    title #{title} - Il mio sito
    block styles
  body
    include partials/header
    
    main
      block content
    
    include partials/footer
```

```pug
//- page.pug
extends layout

block styles
  link(rel="stylesheet", href="/css/page.css")

block content
  h1= pageTitle
  p Contenuto della pagina
```

## Installazione e Configurazione

### Installazione

```bash
npm install pug
```

Per l'integrazione con Express.js:

```bash
npm install express pug
```

### Configurazione con Express.js

```javascript
const express = require('express');
const app = express();

// Configura Pug come template engine
app.set('view engine', 'pug');
app.set('views', './views');

// Route di esempio
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Home Page',
    message: 'Benvenuto nel mio sito!',
    user: {
      name: 'Mario',
      isAdmin: true
    },
    items: [
      { name: 'Item 1', price: 10 },
      { name: 'Item 2', price: 20 },
      { name: 'Item 3', price: 30 }
    ]
  });
});

app.listen(3000, () => {
  console.log('Server avviato sulla porta 3000');
});
```

## Sintassi e Utilizzo

### Template di Base

Un template Pug di base (`views/index.pug`):

```pug
doctype html
html
  head
    title= title
    link(rel="stylesheet", href="/css/style.css")
  body
    h1= message
    p Benvenuto nella nostra applicazione!
```

### Struttura dei File

```
views/
  layouts/
    main.pug         # Layout principale
  partials/
    header.pug       # Componente header
    footer.pug       # Componente footer
  index.pug          # Template della home page
  about.pug          # Template della pagina "chi siamo"
```

### Layout e Blocchi

```pug
//- views/layouts/main.pug
doctype html
html
  head
    title #{title} | Il mio sito
    block styles
      link(rel="stylesheet", href="/css/style.css")
  body
    include ../partials/header
    
    main.container
      block content
    
    include ../partials/footer
    
    block scripts
      script(src="/js/main.js")
```

```pug
//- views/index.pug
extends layouts/main

block styles
  link(rel="stylesheet", href="/css/home.css")

block content
  h1= title
  p= message
  
  if user
    p Benvenuto, #{user.name}!
  else
    p Benvenuto, ospite!
    a(href="/login") Accedi

block scripts
  script(src="/js/home.js")
```

### Partials

```pug
//- views/partials/header.pug
header
  nav
    ul
      li: a(href="/") Home
      li: a(href="/about") Chi siamo
      li: a(href="/contact") Contatti
```

```pug
//- views/partials/footer.pug
footer
  p &copy; #{new Date().getFullYear()} Il mio sito
```

## Controllo di Flusso

### Condizionali

```pug
//- If/Else
if user.isAdmin
  h2 Pannello di amministrazione
  a(href="/admin") Gestisci sito
else if user.isEditor
  h2 Pannello editor
  a(href="/editor") Gestisci contenuti
else
  h2 Pannello utente

//- Unless (if not)
unless user.isVerified
  .alert Verifica il tuo account per accedere a tutte le funzionalità

//- Operatore ternario
p(class= isActive ? 'active' : 'inactive') Stato
```

### Iterazioni

```pug
//- Each loop
ul.products
  each product, index in products
    li
      h3= product.name
      p Prezzo: €#{product.price.toFixed(2)}
      span Prodotto ##{index + 1}
  else
    li Nessun prodotto disponibile

//- While loop
- let n = 0
ul
  while n < 5
    li Item #{n++}
```

## Caratteristiche Avanzate

### 1. Mixins con Blocchi

I mixins possono accettare blocchi di contenuto:

```pug
mixin card(title)
  .card
    .card-header
      h3= title
    .card-body
      block

+card('Informazioni')
  p Questo è il contenuto della card
  a(href="#") Leggi di più
```

### 2. Mixins con Attributi

I mixins possono accettare attributi che vengono applicati all'elemento root:

```pug
mixin button(text)
  button&attributes(attributes)= text

+button('Clicca qui')(class="btn btn-primary", type="submit")
```

### 3. Interpolazione di Codice

Pug permette di eseguire codice JavaScript all'interno dei template:

```pug
- const now = new Date()
- const hour = now.getHours()

if hour < 12
  p Buongiorno!
else if hour < 18
  p Buon pomeriggio!
else
  p Buonasera!

- const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
p= capitalize(username)
```

### 4. Filtri

I filtri permettono di processare blocchi di testo con processori esterni:

```pug
:markdown-it
  # Titolo Markdown
  Questo è un paragrafo in **markdown**.
  - Item 1
  - Item 2

:scss
  $primary-color: #007bff;
  .button {
    background-color: $primary-color;
    &:hover {
      background-color: darken($primary-color, 10%);
    }
  }
```

Per utilizzare i filtri, è necessario installare i pacchetti corrispondenti:

```bash
npm install jstransformer-markdown-it jstransformer-scss
```

## Best Practices

### 1. Mantieni una Struttura Coerente dell'Indentazione

Poiché Pug si basa sull'indentazione per definire la struttura, è fondamentale mantenere un'indentazione coerente:

- Usa spazi o tab, ma non mescolarli
- Mantieni lo stesso livello di indentazione per elementi allo stesso livello

### 2. Utilizza Mixins per Componenti Riutilizzabili

```pug
//- views/mixins/forms.pug
mixin input(label, name, type='text')
  .form-group
    label(for=name)= label
    input(type=type, id=name, name=name)&attributes(attributes)

mixin select(label, name, options)
  .form-group
    label(for=name)= label
    select(id=name, name=name)&attributes(attributes)
      each option in options
        option(value=option.value)= option.text
```

```pug
//- Utilizzo
include ../mixins/forms

form(action="/submit", method="POST")
  +input('Nome', 'name', 'text')(required)
  +input('Email', 'email', 'email')(required)
  +select('Categoria', 'category', [
    {value: '1', text: 'Categoria 1'},
    {value: '2', text: 'Categoria 2'}
  ])
  button(type="submit") Invia
```

### 3. Organizza i Template in Modo Modulare

```
views/
  layouts/
    main.pug
    admin.pug
  partials/
    header.pug
    footer.pug
    sidebar.pug
  mixins/
    forms.pug
    cards.pug
  pages/
    home.pug
    about.pug
  components/
    product-card.pug
    user-profile.pug
```

### 4. Evita Logica Complessa nei Template

Anche se Pug permette di eseguire codice JavaScript nei template, è meglio mantenere la logica complessa nel controller:

```javascript
// Controller
app.get('/dashboard', (req, res) => {
  const user = getUserFromSession(req);
  const notifications = getNotifications(user.id);
  
  res.render('dashboard', {
    user,
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    formattedDate: formatDate(new Date())
  });
});
```

### 5. Utilizza Variabili Locali per Funzioni Comuni

```javascript
// app.js
app.use((req, res, next) => {
  res.locals.formatDate = (date) => {
    return new Date(date).toLocaleDateString('it-IT');
  };
  res.locals.formatCurrency = (value) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(value);
  };
  next();
});
```

```pug
//- Nel template
p Data: #{formatDate(createdAt)}
p Prezzo: #{formatCurrency(product.price)}
```

## Prestazioni e Caching

Pug compila i template in funzioni JavaScript, offrendo ottime prestazioni:

```javascript
// Abilita il caching in produzione
app.set('view cache', process.env.NODE_ENV === 'production');
```

È anche possibile precompilare i template per un'ulteriore ottimizzazione:

```javascript
const pug = require('pug');
const fs = require('fs');

// Compila il template
const compiledFunction = pug.compileFile('./views/template.pug', {
  cache: true,
  compileDebug: false
});

// Renderizza il template
const html = compiledFunction({
  title: 'Titolo Pagina',
  message: 'Messaggio'
});
```

## Confronto con Altri Template Engine

### Pug vs EJS

- **Pug**: Sintassi concisa basata sull'indentazione, elimina tag di chiusura
- **EJS**: Mantiene la sintassi HTML standard con JavaScript incorporato

### Pug vs Handlebars

- **Pug**: Sintassi completamente diversa dall'HTML, basata sull'indentazione
- **Handlebars**: Mantiene una sintassi più vicina all'HTML con tag di apertura e chiusura

## Vantaggi e Svantaggi

### Vantaggi

1. **Sintassi Concisa**: Meno codice da scrivere rispetto all'HTML tradizionale
2. **Leggibilità**: Una volta appresa la sintassi, i template sono molto leggibili
3. **Potenti Funzionalità**: Mixins, estensione di template, inclusione di file
4. **Prestazioni**: Compilazione efficiente in funzioni JavaScript

### Svantaggi

1. **Curva di Apprendimento**: La sintassi è molto diversa dall'HTML e richiede tempo per essere appresa
2. **Sensibilità all'Indentazione**: Errori di indentazione possono causare problemi difficili da debuggare
3. **Meno Familiare**: Sviluppatori abituati all'HTML potrebbero trovare difficile la transizione

## Conclusione

Pug è un template engine potente e unico che offre un approccio radicalmente diverso alla creazione di template HTML. La sua sintassi concisa basata sull'indentazione può aumentare significativamente la produttività una volta appresa, riducendo la quantità di codice da scrivere e migliorando la leggibilità.

Le potenti funzionalità di composizione, come mixins, extends e includes, rendono Pug particolarmente adatto per progetti complessi con molti componenti riutilizzabili. Tuttavia, la sua sintassi non convenzionale può rappresentare una barriera iniziale per alcuni sviluppatori.

La scelta tra Pug e altri template engine come EJS o Handlebars dipende dalle preferenze personali, dalle esigenze del progetto e dalla familiarità del team con le diverse sintassi. Ogni template engine ha i suoi punti di forza e debolezza, e la scelta migliore è quella che si allinea meglio con il flusso di lavoro e le esigenze specifiche del tuo progetto.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Torna all'Esercitazione 10](../README.md)
- [Precedente: Handlebars - Logica Minima](./03-handlebars.md)