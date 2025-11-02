# Esempi Express.js

Questa cartella contiene esempi pratici per imparare Express.js.

## Elenco Esempi


### 01. Hello World
**Cartella:** `01-hello-world/`

Esempio minimale di un server Express.
- Server base
- Una singola route GET
- Avvio del server

**File:** `app.js`

```bash
cd 01-hello-world
npm install
node app.js
```

---

### 02. Routing Base
**Cartella:** `02-routing-base/`

Esempi di routing con diversi metodi HTTP.
- GET, POST, PUT, DELETE
- Parametri URL
- Query string

**File:** `app.js`

```bash
cd 02-routing-base
npm install
node app.js
```

---

### 03. Middleware
**Cartella:** `03-middleware/`

Esempi di middleware personalizzati.
- Logger middleware
- Authentication middleware
- Error handling middleware

**File:** `app.js`

```bash
cd 03-middleware
node app.js
```

---

### 04. Template EJS
**Cartella:** `04-template-ejs/`

Uso di EJS per rendering dinamico.
- Template base
- Partials
- Passaggio dati

**Installazione:**
```bash
cd 04-template-ejs
npm install
node app.js
```

---

### 05. Form Handling
**Cartella:** `05-form-handling/`

Gestione form e validazione input.
- Form HTML
- POST request
- Validazione dati

**Installazione:**
```bash
cd 05-form-handling
npm install
node app.js
```

---

### 06. RESTful API
**Cartella:** `06-restful-api/`

API REST completa con CRUD.
- GET (lista e dettaglio)
- POST (creazione)
- PUT (aggiornamento)
- DELETE (eliminazione)

**Installazione:**
```bash
cd 06-restful-api
npm install
node app.js
```

---

### 07. Static Files
**Cartella:** `07-static-files/`

Servire file statici (CSS, JS, immagini).
- express.static()
- Directory public
- Asset organization

**Installazione:**
```bash
cd 07-static-files
npm install
node app.js
```

---

### 08. Router Modulare
**Cartella:** `08-router-modulare/`

Organizzazione route con express.Router().
- Separazione route per risorsa
- Struttura scalabile
- Middleware specifici

**Installazione:**
```bash
cd 08-router-modulare
npm install
node app.js
```

---

## Come Usare gli Esempi

### 1. Navigare nella Cartella
```bash
cd esempi/01-hello-world
```

### 2. Installare Dipendenze (se necessario)
```bash
npm install
```

### 3. Avviare l'Esempio
```bash
node app.js
```

### 4. Testare nel Browser
```
http://localhost:3000
```

---

## Test con curl

### GET Request
```bash
curl http://localhost:3000/
```

### POST Request
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Mario","email":"mario@example.com"}'
```

### PUT Request
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Mario Rossi"}'
```

### DELETE Request
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

---

## Struttura Tipica Esempio

```
esempio/
├── app.js              # File principale
├── package.json        # Dipendenze
├── views/             # Template (se necessario)
│   └── index.ejs
├── public/            # File statici (se necessario)
│   ├── css/
│   ├── js/
│   └── images/
└── routes/            # Route modular (se necessario)
    └── users.js
```

---

## Progressione Consigliata

1. **01-hello-world** - Inizia qui per capire la base
2. **02-routing-base** - Impara il routing
3. **03-middleware** - Capisci i middleware
4. **04-template-ejs** - Rendering dinamico
5. **05-form-handling** - Gestione form
6. **06-restful-api** - API complete
7. **07-static-files** - File statici
8. **08-router-modulare** - Organizzazione professionale

---

## Riferimenti

- [Documentazione Express](https://expressjs.com/)
- [Guide Express](https://expressjs.com/en/guide/routing.html)
- [Teoria del Corso](../teoria/)
