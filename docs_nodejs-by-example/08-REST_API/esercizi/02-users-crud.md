# Esercizio 2: CRUD Utenti

## Obiettivo
Creare una REST API per gestire una lista di utenti (in memoria) con operazioni CRUD base.

## Descrizione
Implementa un'API RESTful che permette di:
- Ottenere tutti gli utenti (GET)
- Ottenere un utente specifico (GET)
- Creare un nuovo utente (POST)
- Aggiornare un utente (PUT)
- Eliminare un utente (DELETE)

## Requisiti
1. Usa Express e il middleware `express.json()` per gestire i dati JSON
2. Salva gli utenti in un array in memoria
3. Ogni utente deve avere: `id`, `name`, `email`

## Endpoint da implementare

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/users` | Restituisce tutti gli utenti |
| GET | `/api/users/:id` | Restituisce un utente specifico |
| POST | `/api/users` | Crea un nuovo utente |
| PUT | `/api/users/:id` | Aggiorna un utente esistente |
| DELETE | `/api/users/:id` | Elimina un utente |

## Codice di partenza

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Array per memorizzare gli utenti
let users = [
  { id: 1, name: 'Mario Rossi', email: 'mario@example.com' },
  { id: 2, name: 'Giulia Bianchi', email: 'giulia@example.com' }
];

// TODO: Implementa qui i tuoi endpoint

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
```

## Test
```bash
# Ottieni tutti gli utenti
curl http://localhost:3000/api/users

# Ottieni un utente specifico
curl http://localhost:3000/api/users/1

# Crea un nuovo utente
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Luca Verdi","email":"luca@example.com"}'

# Aggiorna un utente
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Mario Rossi Updated","email":"mario.new@example.com"}'

# Elimina un utente
curl -X DELETE http://localhost:3000/api/users/2
```

## Soluzione
<details>
<summary>Clicca per vedere la soluzione</summary>

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let users = [
  { id: 1, name: 'Mario Rossi', email: 'mario@example.com' },
  { id: 2, name: 'Giulia Bianchi', email: 'giulia@example.com' }
];

// GET - Tutti gli utenti
app.get('/api/users', (req, res) => {
  res.json(users);
});

// GET - Utente specifico
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }
  res.json(user);
});

// POST - Crea utente
app.post('/api/users', (req, res) => {
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name: req.body.name,
    email: req.body.email
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT - Aggiorna utente
app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  res.json(user);
});

// DELETE - Elimina utente
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }
  const deletedUser = users.splice(index, 1);
  res.json(deletedUser[0]);
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
```
</details>
