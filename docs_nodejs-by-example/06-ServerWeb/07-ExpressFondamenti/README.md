# Esercitazione 7: Express.js Fondamenti

## Descrizione

Questa esercitazione ti introdurrà a Express.js, il framework web più popolare per Node.js. Express.js semplifica lo sviluppo di applicazioni web e API fornendo un insieme di funzionalità robuste per il routing, la gestione delle richieste e delle risposte, e l'integrazione di middleware.

## Obiettivi

- Comprendere i vantaggi di Express.js rispetto al modulo HTTP nativo
- Installare e configurare un'applicazione Express.js di base
- Implementare il routing delle richieste
- Utilizzare i middleware integrati e di terze parti
- Gestire i parametri delle richieste e il body parsing
- Servire file statici

## Esercizi Pratici

### Esercizio 7.1: Configurazione di un'Applicazione Express.js

1. Crea una nuova cartella per il progetto e inizializza un progetto Node.js:

```bash
mkdir express-app
cd express-app
npm init -y
```

2. Installa Express.js:

```bash
npm install express
```

3. Crea un file `app.js` con il seguente contenuto:

```javascript
// Importa il modulo Express
const express = require('express');

// Crea un'istanza dell'applicazione Express
const app = express();

// Definisci una route per la home page
app.get('/', (req, res) => {
  res.send('Benvenuto nella mia prima applicazione Express!');
});

// Definisci la porta su cui il server sarà in ascolto
const PORT = process.env.PORT || 3000;

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
  console.log(`Visita http://localhost:${PORT} nel tuo browser`);
});
```

4. Avvia l'applicazione:

```bash
node app.js
```

5. Apri il browser e visita `http://localhost:3000` per vedere il messaggio di benvenuto.

### Esercizio 7.2: Routing di Base

1. Modifica il file `app.js` per aggiungere più route:

```javascript
const express = require('express');
const app = express();

// Route per la home page
app.get('/', (req, res) => {
  res.send('<h1>Home Page</h1><p>Benvenuto nella mia applicazione Express!</p>');
});

// Route per la pagina "Chi Siamo"
app.get('/about', (req, res) => {
  res.send('<h1>Chi Siamo</h1><p>Informazioni sulla nostra applicazione.</p>');
});

// Route per la pagina "Contatti"
app.get('/contact', (req, res) => {
  res.send('<h1>Contatti</h1><p>Come contattarci.</p>');
});

// Route con parametri
app.get('/users/:id', (req, res) => {
  res.send(`<h1>Utente ${req.params.id}</h1><p>Dettagli dell'utente ${req.params.id}</p>`);
});

// Route per gestire le richieste a percorsi non definiti (404)
app.use((req, res) => {
  res.status(404).send('<h1>404 - Pagina non trovata</h1>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

2. Riavvia l'applicazione e testa le diverse route nel browser:
   - `http://localhost:3000/`
   - `http://localhost:3000/about`
   - `http://localhost:3000/contact`
   - `http://localhost:3000/users/1`
   - `http://localhost:3000/users/2`
   - Prova anche un URL non esistente per vedere la risposta 404

### Esercizio 7.3: Middleware e Body Parsing

1. Installa i middleware per il parsing del body:

```bash
npm install body-parser
```

2. Crea un nuovo file `middleware-app.js` con il seguente contenuto:

```javascript
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware per il logging delle richieste
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next(); // Passa il controllo al prossimo middleware
});

// Middleware per il parsing del body in formato URL-encoded
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware per il parsing del body in formato JSON
app.use(bodyParser.json());

// Route per la home page
app.get('/', (req, res) => {
  res.send(`
    <h1>Form di Esempio</h1>
    <form action="/submit-form" method="POST">
      <div>
        <label for="name">Nome:</label>
        <input type="text" id="name" name="name" required>
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
app.post('/submit-form', (req, res) => {
  console.log('Dati del form ricevuti:', req.body);
  res.send(`
    <h1>Dati Ricevuti</h1>
    <p>Nome: ${req.body.name}</p>
    <p>Email: ${req.body.email}</p>
    <a href="/">Torna al form</a>
  `);
});

// API endpoint per testare il parsing JSON
app.post('/api/data', (req, res) => {
  console.log('Dati JSON ricevuti:', req.body);
  res.json({
    success: true,
    data: req.body,
    message: 'Dati ricevuti con successo'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

3. Avvia l'applicazione:

```bash
node middleware-app.js
```

4. Apri il browser e visita `http://localhost:3000`, compila e invia il form.

5. Per testare l'endpoint API, puoi utilizzare strumenti come Postman o curl:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"name":"Mario","age":30}' http://localhost:3000/api/data
```

### Esercizio 7.4: Servire File Statici

1. Crea una cartella `public` nel tuo progetto.

2. All'interno della cartella `public`, crea i seguenti file:

   - `index.html`:
   ```html
   <!DOCTYPE html>
   <html lang="it">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Express.js App</title>
     <link rel="stylesheet" href="/css/style.css">
   </head>
   <body>
     <header>
       <h1>Benvenuto nella mia App Express.js</h1>
     </header>
     <nav>
       <ul>
         <li><a href="/">Home</a></li>
         <li><a href="/about.html">Chi Siamo</a></li>
         <li><a href="/contact.html">Contatti</a></li>
       </ul>
     </nav>
     <main>
       <p>Questa è una pagina statica servita da Express.js.</p>
       <img src="/img/express-logo.png" alt="Express.js Logo">
     </main>
     <footer>
       <p>&copy; 2023 - Express.js App</p>
     </footer>
     <script src="/js/script.js"></script>
   </body>
   </html>
   ```

   - `about.html`:
   ```html
   <!DOCTYPE html>
   <html lang="it">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Chi Siamo - Express.js App</title>
     <link rel="stylesheet" href="/css/style.css">
   </head>
   <body>
     <header>
       <h1>Chi Siamo</h1>
     </header>
     <nav>
       <ul>
         <li><a href="/">Home</a></li>
         <li><a href="/about.html">Chi Siamo</a></li>
         <li><a href="/contact.html">Contatti</a></li>
       </ul>
     </nav>
     <main>
       <p>Questa è la pagina "Chi Siamo" della nostra applicazione Express.js.</p>
     </main>
     <footer>
       <p>&copy; 2023 - Express.js App</p>
     </footer>
     <script src="/js/script.js"></script>
   </body>
   </html>
   ```

   - `contact.html`:
   ```html
   <!DOCTYPE html>
   <html lang="it">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Contatti - Express.js App</title>
     <link rel="stylesheet" href="/css/style.css">
   </head>
   <body>
     <header>
       <h1>Contatti</h1>
     </header>
     <nav>
       <ul>
         <li><a href="/">Home</a></li>
         <li><a href="/about.html">Chi Siamo</a></li>
         <li><a href="/contact.html">Contatti</a></li>
       </ul>
     </nav>
     <main>
       <p>Questa è la pagina "Contatti" della nostra applicazione Express.js.</p>
       <form id="contactForm">
         <div>
           <label for="name">Nome:</label>
           <input type="text" id="name" name="name" required>
         </div>
         <div>
           <label for="email">Email:</label>
           <input type="email" id="email" name="email" required>
         </div>
         <div>
           <label for="message">Messaggio:</label>
           <textarea id="message" name="message" required></textarea>
         </div>
         <button type="submit">Invia</button>
       </form>
     </main>
     <footer>
       <p>&copy; 2023 - Express.js App</p>
     </footer>
     <script src="/js/script.js"></script>
   </body>
   </html>
   ```

3. Crea una sottocartella `css` all'interno di `public` e aggiungi un file `style.css`:

   ```css
   body {
     font-family: Arial, sans-serif;
     line-height: 1.6;
     margin: 0;
     padding: 0;
     color: #333;
   }
   
   header, footer {
     background-color: #333;
     color: #fff;
     text-align: center;
     padding: 1rem;
   }
   
   nav ul {
     display: flex;
     list-style: none;
     background-color: #444;
     margin: 0;
     padding: 0;
   }
   
   nav ul li {
     padding: 0.5rem 1rem;
   }
   
   nav ul li a {
     color: #fff;
     text-decoration: none;
   }
   
   main {
     padding: 1rem;
     max-width: 800px;
     margin: 0 auto;
   }
   
   img {
     max-width: 100%;
     height: auto;
   }
   
   form div {
     margin-bottom: 1rem;
   }
   
   label {
     display: block;
     margin-bottom: 0.5rem;
   }
   
   input, textarea {
     width: 100%;
     padding: 0.5rem;
     border: 1px solid #ddd;
   }
   
   button {
     background-color: #333;
     color: #fff;
     border: none;
     padding: 0.5rem 1rem;
     cursor: pointer;
   }
   ```

4. Crea una sottocartella `js` all'interno di `public` e aggiungi un file `script.js`:

   ```javascript
   document.addEventListener('DOMContentLoaded', () => {
     console.log('Il documento è stato caricato completamente');
     
     // Gestione del form di contatto
     const contactForm = document.getElementById('contactForm');
     if (contactForm) {
       contactForm.addEventListener('submit', (e) => {
         e.preventDefault();
         
         const formData = new FormData(contactForm);
         const formObject = {};
         
         formData.forEach((value, key) => {
           formObject[key] = value;
         });
         
         alert('Form inviato con successo (simulazione):\n' + JSON.stringify(formObject, null, 2));
         contactForm.reset();
       });
     }
   });
   ```

5. Crea una sottocartella `img` all'interno di `public` e aggiungi un'immagine del logo di Express.js (puoi scaricarla da internet).

6. Crea un nuovo file `static-app.js` con il seguente contenuto:

```javascript
const express = require('express');
const path = require('path');

const app = express();

// Middleware per servire file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware per il parsing del body in formato JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API endpoint per il form di contatto
app.post('/api/contact', (req, res) => {
  console.log('Dati del form ricevuti:', req.body);
  res.json({
    success: true,
    message: 'Messaggio ricevuto con successo'
  });
});

// Gestione delle route non trovate (deve essere l'ultimo middleware)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

7. Avvia l'applicazione:

```bash
node static-app.js
```

8. Apri il browser e visita `http://localhost:3000` per navigare tra le pagine statiche.

### Esercizio 7.5: Gestione degli Errori

1. Crea un nuovo file `error-handling-app.js` con il seguente contenuto:

```javascript
const express = require('express');
const app = express();

// Middleware per il parsing del body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route che genera un errore intenzionalmente
app.get('/error', (req, res, next) => {
  try {
    // Simulazione di un errore
    throw new Error('Questo è un errore di esempio');
  } catch (err) {
    next(err); // Passa l'errore al middleware di gestione degli errori
  }
});

// Route che genera un errore asincrono
app.get('/async-error', async (req, res, next) => {
  try {
    // Simulazione di un'operazione asincrona che genera un errore
    await Promise.reject(new Error('Questo è un errore asincrono di esempio'));
  } catch (err) {
    next(err); // Passa l'errore al middleware di gestione degli errori
  }
});

// Route normale
app.get('/', (req, res) => {
  res.send(`
    <h1>Gestione degli Errori in Express.js</h1>
    <ul>
      <li><a href="/error">Genera un errore</a></li>
      <li><a href="/async-error">Genera un errore asincrono</a></li>
      <li><a href="/not-found">Pagina non esistente (404)</a></li>
    </ul>
  `);
});

// Middleware per gestire le route non trovate (404)
app.use((req, res, next) => {
  const error = new Error('Pagina non trovata');
  error.status = 404;
  next(error); // Passa l'errore al middleware di gestione degli errori
});

// Middleware di gestione degli errori
app.use((err, req, res, next) => {
  // Imposta lo status code appropriato
  res.status(err.status || 500);
  
  // In ambiente di sviluppo, mostra dettagli dell'errore
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.send(`
    <h1>Errore ${res.statusCode}</h1>
    <p>${err.message}</p>
    ${isDevelopment ? `<pre>${err.stack}</pre>` : ''}
    <a href="/">Torna alla home</a>
  `);
  
  // Logga l'errore sul server
  console.error(`${new Date().toISOString()} - Errore:`, err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

2. Avvia l'applicazione:

```bash
node error-handling-app.js
```

3. Apri il browser e visita `http://localhost:3000`, quindi prova i link per generare diversi tipi di errori e osserva come vengono gestiti.

## Sfida Aggiuntiva

Crea un'applicazione Express.js più complessa che implementi un sistema di gestione delle attività (TODO list) con le seguenti funzionalità:

1. Interfaccia web per visualizzare, aggiungere, modificare ed eliminare attività
2. API RESTful per operazioni CRUD sulle attività
3. Validazione dei dati in input
4. Gestione degli errori
5. Organizzazione del codice in moduli separati (routes, controllers, models)

Utilizza le conoscenze acquisite in questa esercitazione per implementare tutte le funzionalità richieste.

## Argomenti Teorici Collegati

- [1. Introduzione a Express.js](./teoria/01-introduzione-express.md)
- [2. Routing in Express.js](./teoria/02-routing.md)
- [3. Middleware in Express.js](./teoria/03-middleware.md)
- [4. Gestione delle Richieste e Risposte](./teoria/04-richieste-risposte.md)
- [5. Gestione degli Errori](./teoria/05-gestione-errori.md)

## Risorse Aggiuntive

- [Documentazione ufficiale di Express.js](https://expressjs.com/)
- [Guida ai middleware di Express.js](https://expressjs.com/en/guide/using-middleware.html)
- [Gestione degli errori in Express.js](https://expressjs.com/en/guide/error-handling.html)

## Navigazione

- [Indice del Corso](../README.md)
- Modulo Precedente: [HTTP e Server Web](../06-ServerWeb/README.md)
- Modulo Successivo: [Routing con Express](../08-ExpressRouting/README.md)