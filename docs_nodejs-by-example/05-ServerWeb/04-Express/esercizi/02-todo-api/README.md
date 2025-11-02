# Esercizio 02: API To-Do List

## Obiettivi di Apprendimento

In questo esercizio imparerai a:
- Creare un'API REST completa (CRUD)
- Gestire dati in memoria con array
- Validare input utente
- Usare codici di stato HTTP appropriati
- Implementare filtri e ricerca

---

## Requisiti

Crea un'API REST per gestire una lista di attività (to-do list).

### Struttura Dati

Ogni attività (task) ha:
```javascript
{
    id: 1,                      // Numero auto-incrementale
    title: "Comprare il latte", // Stringa (2-100 caratteri)
    completed: false,           // Boolean
    priority: "medium",         // "low", "medium", "high"
    createdAt: "2024-11-01T10:30:00Z",  // ISO timestamp
    dueDate: "2024-11-05"       // Data scadenza (opzionale)
}
```

---

## API Endpoints

### 1. GET /api/tasks
**Descrizione:** Lista tutte le attività

**Query Params (tutti opzionali):**
- `completed` - Filtro per stato (true/false)
- `priority` - Filtro per priorità ("low", "medium", "high")
- `search` - Cerca nel titolo
- `sort` - Ordina per campo ("createdAt", "dueDate", "priority")
- `order` - Ordine ("asc", "desc")

**Risposta:**
```json
{
    "total": 10,
    "data": [
        {
            "id": 1,
            "title": "Comprare il latte",
            "completed": false,
            "priority": "medium",
            "createdAt": "2024-11-01T10:30:00Z",
            "dueDate": "2024-11-05"
        }
    ]
}
```

**Esempi:**
```bash
# Tutte le attività
GET /api/tasks

# Solo incomplete
GET /api/tasks?completed=false

# Alta priorità e incomplete
GET /api/tasks?priority=high&completed=false

# Cerca "latte"
GET /api/tasks?search=latte

# Ordina per data scadenza
GET /api/tasks?sort=dueDate&order=asc
```

---

### 2. GET /api/tasks/:id
**Descrizione:** Dettaglio singola attività

**Parametri:**
- `id` - ID attività (numero)

**Risposta Successo (200):**
```json
{
    "id": 1,
    "title": "Comprare il latte",
    "completed": false,
    "priority": "medium",
    "createdAt": "2024-11-01T10:30:00Z",
    "dueDate": "2024-11-05"
}
```

**Risposta Errore (404):**
```json
{
    "error": "Attività non trovata",
    "id": 999
}
```

---

### 3. POST /api/tasks
**Descrizione:** Crea nuova attività

**Body Richiesta:**
```json
{
    "title": "Comprare il latte",
    "priority": "medium",
    "dueDate": "2024-11-05"
}
```

**Campi:**
- `title` - **Obbligatorio**, 2-100 caratteri
- `priority` - Opzionale, default "medium"
- `dueDate` - Opzionale, formato YYYY-MM-DD

**Validazione:**
- Title non vuoto, min 2 caratteri
- Priority solo: "low", "medium", "high"
- DueDate formato valido se presente

**Risposta Successo (201):**
```json
{
    "message": "Attività creata",
    "task": {
        "id": 4,
        "title": "Comprare il latte",
        "completed": false,
        "priority": "medium",
        "createdAt": "2024-11-01T10:30:00Z",
        "dueDate": "2024-11-05"
    }
}
```

**Risposta Errore (400):**
```json
{
    "errors": [
        "Title è obbligatorio",
        "Priority deve essere: low, medium, high"
    ]
}
```

---

### 4. PUT /api/tasks/:id
**Descrizione:** Aggiorna attività (completo)

**Body Richiesta:**
```json
{
    "title": "Comprare latte e pane",
    "completed": true,
    "priority": "high",
    "dueDate": "2024-11-06"
}
```

**Note:**
- Tutti i campi sono obbligatori
- Stessa validazione di POST
- ID non modificabile

**Risposta Successo (200):**
```json
{
    "message": "Attività aggiornata",
    "task": { ... }
}
```

---

### 5. PATCH /api/tasks/:id
**Descrizione:** Aggiorna attività (parziale)

**Body Richiesta (solo campi da modificare):**
```json
{
    "completed": true
}
```

**Risposta Successo (200):**
```json
{
    "message": "Attività modificata",
    "task": { ... }
}
```

---

### 6. DELETE /api/tasks/:id
**Descrizione:** Elimina attività

**Risposta Successo (200):**
```json
{
    "message": "Attività eliminata",
    "task": { ... }
}
```

**Risposta Errore (404):**
```json
{
    "error": "Attività non trovata"
}
```

---

## Specifiche Tecniche

### Struttura Progetto
```
02-todo-api/
├── app.js           # Server principale
├── package.json     # Dipendenze
└── README.md        # Questo file
```

### Setup Iniziale

```bash
mkdir 02-todo-api
cd 02-todo-api
npm init -y
npm install express
```

### Dati Iniziali

```javascript
let tasks = [
    {
        id: 1,
        title: "Studiare Express.js",
        completed: false,
        priority: "high",
        createdAt: new Date().toISOString(),
        dueDate: "2024-11-10"
    },
    {
        id: 2,
        title: "Fare la spesa",
        completed: true,
        priority: "medium",
        createdAt: new Date().toISOString(),
        dueDate: null
    }
];

let nextId = 3;
```

---

## Implementazione

### Step 1: Setup Base
```javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let tasks = [ /* dati iniziali */ ];
let nextId = 3;

// Routes qui...

app.listen(PORT, () => {
    console.log(`API TODO su http://localhost:${PORT}`);
});
```

### Step 2: Validazione

```javascript
function validateTask(task, isUpdate = false) {
    const errors = [];
    
    // Valida title
    if (!isUpdate || task.title !== undefined) {
        if (!task.title || task.title.trim().length < 2) {
            errors.push('Title deve essere almeno 2 caratteri');
        }
        if (task.title && task.title.length > 100) {
            errors.push('Title massimo 100 caratteri');
        }
    }
    
    // Valida priority
    const validPriorities = ['low', 'medium', 'high'];
    if (task.priority && !validPriorities.includes(task.priority)) {
        errors.push('Priority deve essere: low, medium, high');
    }
    
    // Valida dueDate (se presente)
    if (task.dueDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(task.dueDate)) {
            errors.push('DueDate formato non valido (YYYY-MM-DD)');
        }
    }
    
    return errors;
}
```

### Step 3: Filtri e Ricerca

```javascript
app.get('/api/tasks', (req, res) => {
    let filtered = [...tasks];
    
    // Filtro completed
    if (req.query.completed !== undefined) {
        const isCompleted = req.query.completed === 'true';
        filtered = filtered.filter(t => t.completed === isCompleted);
    }
    
    // Filtro priority
    if (req.query.priority) {
        filtered = filtered.filter(t => t.priority === req.query.priority);
    }
    
    // Search nel title
    if (req.query.search) {
        const search = req.query.search.toLowerCase();
        filtered = filtered.filter(t => 
            t.title.toLowerCase().includes(search)
        );
    }
    
    // Sort
    if (req.query.sort) {
        const order = req.query.order === 'desc' ? -1 : 1;
        filtered.sort((a, b) => {
            if (a[req.query.sort] > b[req.query.sort]) return order;
            if (a[req.query.sort] < b[req.query.sort]) return -order;
            return 0;
        });
    }
    
    res.json({
        total: filtered.length,
        data: filtered
    });
});
```

---

## Test dell'API

### Test con curl

```bash
# 1. Lista tutte le attività
curl http://localhost:3000/api/tasks

# 2. Crea nuova attività
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Comprare il latte",
    "priority": "high",
    "dueDate": "2024-11-05"
  }'

# 3. Dettaglio attività
curl http://localhost:3000/api/tasks/1

# 4. Aggiorna completamento
curl -X PATCH http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 5. Cerca attività
curl "http://localhost:3000/api/tasks?search=latte"

# 6. Filtra per priorità
curl "http://localhost:3000/api/tasks?priority=high&completed=false"

# 7. Elimina attività
curl -X DELETE http://localhost:3000/api/tasks/1
```

---

## Checklist Validazione

Verifica che funzionino:

### CRUD Base
- [ ] GET /api/tasks restituisce lista
- [ ] GET /api/tasks/:id restituisce dettaglio
- [ ] POST /api/tasks crea attività
- [ ] PUT /api/tasks/:id aggiorna completo
- [ ] PATCH /api/tasks/:id aggiorna parziale
- [ ] DELETE /api/tasks/:id elimina

### Validazione
- [ ] Title vuoto → errore 400
- [ ] Priority non valida → errore 400
- [ ] DueDate formato sbagliato → errore 400
- [ ] ID non esistente → errore 404

### Filtri
- [ ] Filtro completed funziona
- [ ] Filtro priority funziona
- [ ] Search nel title funziona
- [ ] Sort per campo funziona
- [ ] Order asc/desc funziona

### Codici HTTP
- [ ] 200 per successo GET/PUT/PATCH/DELETE
- [ ] 201 per POST successo
- [ ] 400 per validazione fallita
- [ ] 404 per risorsa non trovata

---

## Bonus (Opzionale)

1. **Paginazione**
   - Query params: `page`, `limit`
   - Default: page=1, limit=10

2. **Statistiche**
   - GET /api/tasks/stats
   - Restituisce: totali, completate, per priorità

3. **Bulk Operations**
   - POST /api/tasks/bulk-delete
   - Body: array di ID da eliminare

4. **Tags**
   - Aggiungi array `tags` a ogni task
   - Filtro per tag

---

## Soluzione

La soluzione completa è in `soluzione/app.js`.
Prova prima da solo!

---

## Prossimo Esercizio

Completato questo, passa a **[Esercizio 03: Autenticazione](../03-autenticazione/README.md)**
