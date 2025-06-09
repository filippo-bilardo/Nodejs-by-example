# Introduzione ai Template Engine

## Cosa sono i Template Engine

I template engine sono strumenti che permettono di generare contenuto HTML dinamico combinando template statici con dati variabili. Sono componenti fondamentali nello sviluppo di applicazioni web moderne, in quanto consentono di separare la logica dell'applicazione dalla presentazione dei dati.

In un'applicazione Node.js, un template engine prende un template (un file con markup HTML e sintassi speciale) e lo combina con dati forniti dal server per produrre HTML puro che viene inviato al browser dell'utente.

## Perché Usare un Template Engine

### 1. Separazione delle Preoccupazioni (Separation of Concerns)

I template engine promuovono una chiara separazione tra:
- **Logica dell'applicazione**: gestita nel codice JavaScript del server
- **Presentazione**: gestita nei file template

Questa separazione rende il codice più organizzato, manutenibile e testabile.

### 2. Riutilizzo del Codice

I template engine permettono di creare componenti riutilizzabili come:
- **Layout**: strutture di pagina comuni
- **Partials**: frammenti di codice riutilizzabili (header, footer, navigazione)
- **Componenti**: elementi UI che possono essere inclusi in diverse pagine

### 3. Generazione Dinamica di Contenuti

I template engine consentono di:
- Iterare su collezioni di dati
- Applicare logica condizionale
- Formattare e manipolare dati prima della visualizzazione
- Inserire dati variabili all'interno di strutture HTML statiche

## Come Funzionano i Template Engine

Il processo di rendering con un template engine segue generalmente questi passaggi:

1. **Definizione del Template**: Si crea un file template con markup HTML e sintassi speciale per l'inserimento di variabili e logica
2. **Preparazione dei Dati**: Il server prepara un oggetto contenente i dati da visualizzare
3. **Rendering**: Il template engine combina il template con i dati per generare HTML
4. **Invio al Client**: L'HTML generato viene inviato al browser dell'utente

```
Template + Dati → Template Engine → HTML
```

## Principali Template Engine per Node.js

### 1. EJS (Embedded JavaScript)

EJS è un template engine semplice che utilizza JavaScript standard all'interno dei template.

**Caratteristiche principali**:
- Sintassi familiare per chi conosce JavaScript
- Facile da imparare e utilizzare
- Supporto per l'inclusione di file parziali

**Esempio di sintassi**:
```html
<h1><%= title %></h1>
<ul>
  <% for(let i=0; i<items.length; i++) { %>
    <li><%= items[i].name %></li>
  <% } %>
</ul>
```

### 2. Handlebars

Handlebars è un template engine che estende Mustache con funzionalità aggiuntive, mantenendo una sintassi minimalista.

**Caratteristiche principali**:
- Sintassi semplice e leggibile
- Logica minima nei template
- Helper personalizzabili
- Supporto per partials e layout

**Esempio di sintassi**:
```html
<h1>{{title}}</h1>
<ul>
  {{#each items}}
    <li>{{this.name}}</li>
  {{/each}}
</ul>
```

### 3. Pug (precedentemente Jade)

Pug è un template engine con una sintassi minimalista che utilizza l'indentazione per definire la struttura HTML.

**Caratteristiche principali**:
- Sintassi concisa che riduce la quantità di codice
- Basato sull'indentazione (no tag di chiusura)
- Supporto per mixins, include e extends
- Potenti funzionalità di composizione

**Esempio di sintassi**:
```pug
h1= title
ul
  each item in items
    li= item.name
```

## Configurazione di un Template Engine con Express.js

Express.js rende semplice l'integrazione dei template engine. Ecco un esempio di configurazione base:

```javascript
const express = require('express');
const app = express();

// Configura il template engine
app.set('view engine', 'ejs'); // Specifica il template engine da utilizzare
app.set('views', './views');   // Specifica la directory dei template

// Route che utilizza il template engine
app.get('/', (req, res) => {
  // Renderizza il template 'index' con i dati specificati
  res.render('index', {
    title: 'Home Page',
    message: 'Benvenuto nella mia applicazione!',
    items: [
      { name: 'Item 1' },
      { name: 'Item 2' },
      { name: 'Item 3' }
    ]
  });
});

app.listen(3000, () => {
  console.log('Server avviato sulla porta 3000');
});
```

## Best Practices

### 1. Mantieni la Logica al Minimo nei Template

I template dovrebbero contenere principalmente logica di presentazione, non logica di business. Prepara i dati nel controller prima di passarli al template.

**Da evitare**:
```html
<% if (user.calculateTotalOrders() > 10 && user.isPremium()) { %>
  <div class="premium-badge">Premium</div>
<% } %>
```

**Preferibile**:
```javascript
// Nel controller
const showPremiumBadge = user.calculateTotalOrders() > 10 && user.isPremium();
res.render('user', { user, showPremiumBadge });
```

```html
<!-- Nel template -->
<% if (showPremiumBadge) { %>
  <div class="premium-badge">Premium</div>
<% } %>
```

### 2. Utilizza Layout e Partials

Sfrutta i layout per mantenere una struttura coerente tra le pagine e i partials per componenti riutilizzabili.

```javascript
// Con express-ejs-layouts
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
```

### 3. Gestisci Correttamente gli Errori

Implementa una gestione degli errori robusta per i template mancanti o problemi di rendering.

```javascript
app.get('/page', (req, res) => {
  try {
    res.render('page', { data });
  } catch (error) {
    console.error('Errore di rendering:', error);
    res.status(500).render('error', { message: 'Si è verificato un errore' });
  }
});
```

### 4. Escape dei Dati per Prevenire XSS

Assicurati che i dati inseriti nei template siano correttamente escaped per prevenire attacchi XSS (Cross-Site Scripting).

La maggior parte dei template engine esegue l'escape automaticamente, ma è importante conoscere la differenza tra output escaped e non escaped:

**EJS**:
- `<%= data %>` - Output con escape
- `<%- data %>` - Output senza escape (usare solo per HTML fidato)

**Handlebars**:
- `{{data}}` - Output con escape
- `{{{data}}}` - Output senza escape

**Pug**:
- `= data` - Output con escape
- `!= data` - Output senza escape

## Conclusione

I template engine sono strumenti potenti che semplificano lo sviluppo di applicazioni web dinamiche con Node.js. Offrono un modo elegante per separare la logica dell'applicazione dalla presentazione, consentendo di creare interfacce utente dinamiche e manutenibili.

La scelta del template engine dipende dalle preferenze personali, dalle esigenze del progetto e dal team di sviluppo. EJS offre una sintassi familiare basata su JavaScript, Handlebars promuove template con logica minima, mentre Pug offre una sintassi concisa e potente.

Nei prossimi capitoli, esploreremo in dettaglio ciascuno di questi template engine, imparando come sfruttare al meglio le loro caratteristiche per creare applicazioni web robuste e scalabili.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Torna all'Esercitazione 10](../README.md)
- [Prossimo: EJS - Embedded JavaScript](./02-ejs.md)