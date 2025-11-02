# Esercizio 01: Server Base con Route Multiple

## Obiettivi di Apprendimento

In questo esercizio imparerai a:
- Creare un server Express base
- Definire route con diversi metodi HTTP
- Gestire parametri URL e query string
- Implementare un 404 handler
- Usare middleware di logging

---

## Requisiti

Crea un server Express con le seguenti funzionalità:

### 1. Route Base

#### GET /
- Restituisce una pagina HTML con:
  - Titolo "Benvenuto"
  - Lista di link alle altre pagine
  - Informazioni sul server

#### GET /about
- Restituisce informazioni sull'applicazione:
  - Nome applicazione
  - Versione
  - Autore
  - Descrizione

#### GET /contact
- Restituisce informazioni di contatto in JSON:
  ```json
  {
    "email": "info@example.com",
    "phone": "+39 123 456 7890",
    "address": "Via Roma 1, Milano"
  }
  ```

### 2. Route con Parametri

#### GET /users/:id
- Parametro: `id` (user ID)
- Restituisce: `{ "userId": 123, "message": "User profile" }`
- Validazione: id deve essere un numero

#### GET /posts/:year/:month/:slug
- Parametri: anno, mese, slug dell'articolo
- Restituisce: informazioni sull'articolo
- Esempio: `/posts/2024/11/hello-world`

### 3. Query String

#### GET /search
- Query params: `q` (search term), `page`, `limit`
- Restituisce risultati paginati
- Esempio: `/search?q=express&page=1&limit=10`

### 4. Middleware

#### Logger
- Logga ogni richiesta con:
  - Timestamp
  - Metodo HTTP
  - URL
  - User-Agent (da headers)

### 5. Error Handling

#### 404 Handler
- Per route non trovate
- Restituisce JSON con errore 404

---

## Specifiche Tecniche

### Struttura File
```
01-server-base/
├── app.js          # File principale
├── package.json    # Dipendenze
└── README.md       # Questo file
```

### Porta
Il server deve ascoltare sulla porta **3000**

### Formato Risposte

**HTML per pagine:**
```javascript
res.send('<h1>Titolo</h1><p>Contenuto</p>');
```

**JSON per API:**
```javascript
res.json({ key: 'value' });
```

---

## Step Implementazione

### Step 1: Setup Progetto
```bash
mkdir 01-server-base
cd 01-server-base
npm init -y
npm install express
```

### Step 2: Crea app.js
```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// Il tuo codice qui...

app.listen(PORT, () => {
    console.log(`Server su http://localhost:${PORT}`);
});
```

### Step 3: Implementa Route
- Inizia con route semplici (/, /about, /contact)
- Aggiungi route con parametri
- Implementa query string
- Aggiungi middleware logger
- Implementa 404 handler

### Step 4: Test
Testa ogni endpoint con curl o browser:
```bash
curl http://localhost:3000/
curl http://localhost:3000/about
curl http://localhost:3000/users/123
curl "http://localhost:3000/search?q=test&page=2"
```

---

## Validazione Input

### Parametro ID
```javascript
const id = parseInt(req.params.id);
if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'ID non valido' });
}
```

### Query String
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
```

---

## Test Checklist

Verifica che funzionino:

- [ ] GET / restituisce HTML con links
- [ ] GET /about restituisce info applicazione
- [ ] GET /contact restituisce JSON con contatti
- [ ] GET /users/123 funziona correttamente
- [ ] GET /users/abc restituisce errore 400
- [ ] GET /posts/2024/11/hello-world estrae parametri
- [ ] GET /search?q=test&page=2 gestisce query string
- [ ] Middleware logga ogni richiesta
- [ ] Route non esistenti restituiscono 404
- [ ] Output console mostra log richieste

---

## Esempio Output Console

```
Server su http://localhost:3000

[2024-11-01T10:30:45.123Z] GET / - Mozilla/5.0...
[2024-11-01T10:30:47.456Z] GET /about - curl/7.68.0
[2024-11-01T10:30:50.789Z] GET /users/123 - PostmanRuntime/7.29.0
[2024-11-01T10:31:01.234Z] GET /nonexistent - curl/7.68.0
```

---

## Suggerimenti

### 💡 Logger Middleware
```javascript
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent');
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${userAgent}`);
    next();
});
```

### 💡 HTML con Template Literals
```javascript
res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Home</title></head>
    <body>
        <h1>Benvenuto</h1>
        <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
        </ul>
    </body>
    </html>
`);
```

### 💡 Valori Default Query
```javascript
const {
    q = '',
    page = 1,
    limit = 10
} = req.query;
```

---

## Bonus (Opzionale)

Se vuoi fare di più:

1. **Statistiche Server**
   - Conta numero di richieste totali
   - Endpoint GET /stats per visualizzarle

2. **Time Route**
   - GET /time restituisce data/ora corrente
   - Supporta timezone via query `?tz=Europe/Rome`

3. **Calculator API**
   - GET /calc/:operation/:a/:b
   - Operazioni: add, sub, mul, div
   - Esempio: /calc/add/5/3 → 8

---

## Soluzione

La soluzione completa è disponibile in `soluzione/app.js`.
**Consultala solo dopo aver provato tu stesso!**

---

## Prossimo Esercizio

Una volta completato, passa a **[Esercizio 02: To-Do API](../02-todo-api/README.md)**
