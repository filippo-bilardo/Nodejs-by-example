# Handlebars: Template Engine con Logica Minima

## Introduzione a Handlebars

Handlebars è un popolare template engine per JavaScript che estende il linguaggio di template Mustache, aggiungendo funzionalità più avanzate pur mantenendo la filosofia di "logica minima nei template". Questo approccio promuove una netta separazione tra la logica dell'applicazione e la presentazione, rendendo i template più leggibili e manutenibili.

Il nome "Handlebars" deriva dalla sintassi che utilizza doppie parentesi graffe (`{{ }}`) che ricordano dei manubri (handlebars in inglese). Questa sintassi distintiva rende immediatamente riconoscibili i template Handlebars.

## Filosofia di Handlebars

La filosofia principale di Handlebars è "meno logica nei template, più nei controller". Questo significa che:

1. I template dovrebbero essere principalmente dichiarativi, non imperativi
2. La logica complessa dovrebbe essere gestita nel codice JavaScript, non nei template
3. I template dovrebbero concentrarsi sulla presentazione dei dati, non sulla loro manipolazione

Questa separazione porta a codice più pulito, più facile da testare e manutenere.

## Caratteristiche Principali

### 1. Sintassi Semplice e Dichiarativa

Handlebars utilizza una sintassi basata su espressioni racchiuse tra doppie parentesi graffe:

- `{{variabile}}` - Inserisce il valore della variabile con escape HTML
- `{{{variabile}}}` - Inserisce il valore senza escape (per HTML fidato)
- `{{!-- commento --}}` - Commenti (non inclusi nell'output)

### 2. Helper Integrati e Personalizzati

Handlebars offre helper integrati per operazioni comuni e permette di creare helper personalizzati per estendere le funzionalità:

- Helper condizionali: `{{#if}}`, `{{#unless}}`
- Helper iterativi: `{{#each}}`
- Helper di confronto: `{{#with}}`

### 3. Partials

I partials sono frammenti di template riutilizzabili che possono essere inclusi in altri template:

```handlebars
{{> header}}
<main>Contenuto principale</main>
{{> footer}}
```

### 4. Layout e Blocchi

Handlebars supporta layout e blocchi attraverso l'estensione `handlebars-layouts` o `express-handlebars`:

```handlebars
{{#extend "layout"}}
  {{#content "main"}}
    <h1>Contenuto specifico della pagina</h1>
  {{/content}}
{{/extend}}
```

## Installazione e Configurazione

### Installazione

```bash
npm install handlebars
```

Per l'integrazione con Express.js:

```bash
npm install express express-handlebars
```

### Configurazione con Express.js

```javascript
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();

// Configura Handlebars
const hbs = exphbs.create({
  extname: '.hbs',                // Estensione file
  defaultLayout: 'main',          // Layout predefinito
  layoutsDir: 'views/layouts/',   // Directory dei layout
  partialsDir: 'views/partials/', // Directory dei partials
  helpers: {                      // Helper personalizzati
    formatDate: function(date) {
      return new Date(date).toLocaleDateString('it-IT');
    }
  }
});

// Registra il motore di template
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', './views');

// Route di esempio
app.get('/', (req, res) => {
  res.render('home', {
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

Un template Handlebars di base (`views/home.hbs`):

```handlebars
<h1>{{title}}</h1>
<p>{{message}}</p>
```

### Struttura dei File con express-handlebars

```
views/
  layouts/
    main.hbs         # Layout principale
  partials/
    header.hbs       # Componente header
    footer.hbs       # Componente footer
  home.hbs           # Template della home page
  about.hbs          # Template della pagina "chi siamo"
```

### Layout

```handlebars
<!-- views/layouts/main.hbs -->
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  {{> header}}
  
  <main>
    {{{body}}}
  </main>
  
  {{> footer}}
</body>
</html>
```

### Partials

```handlebars
<!-- views/partials/header.hbs -->
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

```handlebars
<!-- views/partials/footer.hbs -->
<footer>
  <p>&copy; {{formatDate currentYear}} La Mia App</p>
</footer>
```

## Espressioni e Helper

### Espressioni di Base

```handlebars
<!-- Variabile semplice -->
<h1>{{title}}</h1>

<!-- Accesso a proprietà di oggetti -->
<p>Nome utente: {{user.name}}</p>

<!-- Helper integrato per formattazione -->
<p>Nome: {{uppercase user.name}}</p>
```

### Condizionali

```handlebars
{{#if user}}
  <h2>Benvenuto, {{user.name}}!</h2>
  
  {{#if user.isAdmin}}
    <span class="badge">Amministratore</span>
  {{/if}}
{{else}}
  <h2>Benvenuto, ospite!</h2>
  <a href="/login">Accedi</a>
{{/if}}

<!-- Condizionale inverso -->
{{#unless user.isVerified}}
  <div class="alert">Per favore verifica il tuo account.</div>
{{/unless}}
```

### Iterazioni

```handlebars
<h2>Elenco Prodotti</h2>
<ul>
  {{#each items}}
    <li>
      <h3>{{this.name}}</h3>
      <p>Prezzo: €{{this.price}}</p>
      
      {{!-- Accesso all'indice --}}
      <span>Prodotto #{{@index}}</span>
      
      {{!-- Condizionale all'interno del ciclo --}}
      {{#if this.onSale}}
        <span class="sale">In offerta!</span>
      {{/if}}
    </li>
  {{else}}
    <li>Nessun prodotto disponibile.</li>
  {{/each}}
</ul>
```

### Helper `with`

Il helper `with` cambia il contesto corrente:

```handlebars
{{#with user}}
  <div class="user-card">
    <h3>{{name}}</h3>
    <p>Email: {{email}}</p>
    <p>Ruolo: {{role}}</p>
  </div>
{{/with}}
```

## Helper Personalizzati

Gli helper personalizzati estendono le funzionalità di Handlebars:

### Registrazione di Helper

```javascript
// Con express-handlebars
const hbs = exphbs.create({
  helpers: {
    // Helper semplice
    formatCurrency: function(value) {
      return new Intl.NumberFormat('it-IT', { 
        style: 'currency', 
        currency: 'EUR' 
      }).format(value);
    },
    
    // Helper con più parametri
    eq: function(a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    },
    
    // Helper per calcoli
    multiply: function(a, b) {
      return a * b;
    }
  }
});
```

### Utilizzo degli Helper

```handlebars
<p>Prezzo: {{formatCurrency product.price}}</p>

{{#eq user.role "admin"}}
  <div class="admin-panel">Pannello di amministrazione</div>
{{else}}
  <div class="user-panel">Pannello utente</div>
{{/eq}}

<p>Totale: {{formatCurrency (multiply quantity price)}}</p>
```

## Tecniche Avanzate

### 1. Helper di Blocco Personalizzati

Gli helper di blocco possono manipolare il contenuto all'interno del blocco:

```javascript
handlebars.registerHelper('bold', function(options) {
  return new handlebars.SafeString('<strong>' + options.fn(this) + '</strong>');
});
```

```handlebars
{{#bold}}
  Questo testo sarà in grassetto
{{/bold}}
```

### 2. Partials Dinamici

È possibile selezionare partials dinamicamente:

```javascript
handlebars.registerHelper('dynamicPartial', function(name, options) {
  return handlebars.partials[name] ? 
    handlebars.partials[name](this) : 
    "Partial non trovato";
});
```

```handlebars
{{> (dynamicPartial templateName)}}
```

### 3. Partials con Parametri

```handlebars
{{> userCard user=currentUser showEmail=true}}
```

```handlebars
<!-- partials/userCard.hbs -->
<div class="card">
  <h3>{{user.name}}</h3>
  {{#if showEmail}}
    <p>Email: {{user.email}}</p>
  {{/if}}
</div>
```

## Best Practices

### 1. Mantieni i Template Semplici

Sfrutta la filosofia di "logica minima" di Handlebars:

- Prepara i dati nel controller prima di passarli al template
- Utilizza helper per operazioni di formattazione e logica semplice
- Evita logica complessa nei template

### 2. Organizza i Template in Modo Modulare

```
views/
  layouts/
    main.hbs
    admin.hbs
  partials/
    common/
      header.hbs
      footer.hbs
    components/
      product-card.hbs
      user-profile.hbs
  pages/
    home.hbs
    about.hbs
```

### 3. Utilizza Nomi Descrittivi

- Usa nomi descrittivi per variabili, helper e partials
- Segui una convenzione di denominazione coerente

### 4. Gestisci i Dati Mancanti

Handlebars gestisce automaticamente i valori undefined o null, ma è buona pratica fornire valori predefiniti:

```handlebars
<h1>{{title}}</h1> <!-- Non genera errore se title è undefined -->

<!-- Fornire un valore predefinito -->
<h1>{{title}}{{#unless title}}Titolo Predefinito{{/unless}}</h1>
```

### 5. Prevenzione XSS

Handlebars esegue automaticamente l'escape dell'output con `{{variabile}}`. Usa `{{{variabile}}}` (tripla parentesi) solo quando sei sicuro che il contenuto sia sicuro.

## Prestazioni e Precompilazione

Handlebars supporta la precompilazione dei template per migliorare le prestazioni:

```javascript
const handlebars = require('handlebars');
const fs = require('fs');

// Leggi il template
const source = fs.readFileSync('./views/template.hbs', 'utf-8');

// Precompila il template
const template = handlebars.precompile(source);

// Salva il template precompilato
fs.writeFileSync('./dist/template.js', 'var template = ' + template);
```

In produzione, puoi utilizzare i template precompilati per un rendering più veloce.

## Confronto con Altri Template Engine

### Handlebars vs EJS

- **Handlebars**: Promuove una separazione più rigida tra logica e presentazione con una sintassi più limitata
- **EJS**: Offre maggiore flessibilità con JavaScript completo nei template, ma potenzialmente mescolando logica e presentazione

### Handlebars vs Pug

- **Handlebars**: Mantiene una sintassi più vicina all'HTML con tag di apertura e chiusura
- **Pug**: Utilizza una sintassi basata sull'indentazione che può essere più concisa ma richiede apprendimento

## Conclusione

Handlebars è un template engine potente che promuove una chiara separazione tra logica e presentazione. La sua sintassi dichiarativa e l'approccio "logica minima" lo rendono ideale per progetti in cui la manutenibilità e la leggibilità dei template sono prioritarie.

La capacità di estendere le funzionalità attraverso helper personalizzati offre un buon equilibrio tra semplicità e potenza, permettendo di adattare Handlebars alle esigenze specifiche del progetto senza compromettere la filosofia di base.

Nel prossimo capitolo, esploreremo Pug (precedentemente Jade), un template engine con un approccio radicalmente diverso basato sull'indentazione e una sintassi minimalista.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Torna all'Esercitazione 10](../README.md)
- [Precedente: EJS - Embedded JavaScript](./02-ejs.md)
- [Prossimo: Pug - Template Engine Minimalista](./04-pug.md)