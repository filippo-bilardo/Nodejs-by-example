# ES-HTTP-05: API REST con CRUD

## 📋 Informazioni Generali

- **Modulo**: HTTP
- **Difficoltà**: 🔴 Avanzato
- **Tempo stimato**: 120 minuti
- **Prerequisiti**: 
  - Completamento ES-HTTP-01, 02, 03
  - Comprensione di REST API
  - Conoscenza di metodi HTTP (GET, POST, PUT, DELETE)
  - Familiarità con routing e gestione URL

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Progettare e implementare un'API REST completa
2. Gestire tutti i metodi HTTP (GET, POST, PUT, DELETE)
3. Implementare operazioni CRUD (Create, Read, Update, Delete)
4. Parsare il body delle richieste POST/PUT
5. Validare dati in input
6. Gestire errori HTTP appropriati (400, 404, 500)
7. Implementare routing senza framework

## 📝 Descrizione

Crea un'API REST per gestire una collezione di utenti. L'API deve supportare tutte le operazioni CRUD mantenendo i dati in memoria (array). Implementa validazione dei dati e gestione errori completa.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-http-05`
- [ ] Crea file `server.js`
- [ ] Pianifica la struttura dell'API (endpoints)

### 2. Data Model
- [ ] Definisci struttura oggetto User (id, name, email, age)
- [ ] Crea array in memoria per storage
- [ ] Implementa funzioni helper per CRUD

### 3. Routing
- [ ] GET /users - lista tutti gli utenti
- [ ] GET /users/:id - dettagli singolo utente  
- [ ] POST /users - crea nuovo utente
- [ ] PUT /users/:id - aggiorna utente
- [ ] DELETE /users/:id - elimina utente

### 4. Validazione
- [ ] Valida campi obbligatori
- [ ] Valida formato email
- [ ] Valida range età
- [ ] Restituisci errori 400 con messaggi chiari

### 5. Error Handling
- [ ] 404 per utente non trovato
- [ ] 404 per route non esistente
- [ ] 400 per dati non validi
- [ ] 500 per errori server

## 💡 Template di Partenza

```javascript
// server.js
const http = require('http');
const url = require('url');

const PORT = 3000;

// Database in memoria
let users = [
  { id: 1, name: 'Mario Rossi', email: 'mario@email.com', age: 30 },
  { id: 2, name: 'Laura Bianchi', email: 'laura@email.com', age: 25 }
];
let nextId = 3;

/**
 * Parser per il body delle richieste
 */
function parseBody(req, callback) {
  // TODO: Implementa parsing del body
}

/**
 * Valida i dati dell'utente
 */
function validateUser(user) {
  // TODO: Implementa validazione
}

/**
 * Router principale
 */
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  // TODO: Implementa routing
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`API REST in ascolto su http://localhost:${PORT}`);
});
```

## 📚 Concetti Chiave

### REST API Design
```
GET    /users      → Lista tutti
GET    /users/:id  → Dettagli uno
POST   /users      → Crea nuovo
PUT    /users/:id  → Aggiorna
DELETE /users/:id  → Elimina
```

### Parsing URL con parametri
```javascript
const url = require('url');

const parsedUrl = url.parse(req.url, true);
const pathname = parsedUrl.pathname;  // '/users/1'
const parts = pathname.split('/').filter(Boolean);  // ['users', '1']
```

### Parsing Body POST/PUT
```javascript
function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      callback(null, data);
    } catch (error) {
      callback(error, null);
    }
  });
}
```

### Risposta JSON
```javascript
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
```

## 🔍 Implementazione Completa

```javascript
const http = require('http');
const url = require('url');

const PORT = 3000;

// Database in memoria
let users = [
  { id: 1, name: 'Mario Rossi', email: 'mario@email.com', age: 30 },
  { id: 2, name: 'Laura Bianchi', email: 'laura@email.com', age: 25 }
];
let nextId = 3;

// Helper: Invia risposta JSON
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

// Helper: Invia errore
function sendError(res, statusCode, message) {
  sendJSON(res, statusCode, { error: message });
}

// Parser body
function parseBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    if (!body) {
      return callback(null, {});
    }
    try {
      const data = JSON.parse(body);
      callback(null, data);
    } catch (error) {
      callback(error, null);
    }
  });
}

// Validazione utente
function validateUser(user, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate && !user.name) {
    errors.push('name è obbligatorio');
  }
  
  if (!isUpdate && !user.email) {
    errors.push('email è obbligatorio');
  } else if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('email non valida');
  }
  
  if (user.age !== undefined) {
    if (typeof user.age !== 'number' || user.age < 0 || user.age > 150) {
      errors.push('age deve essere un numero tra 0 e 150');
    }
  }
  
  return errors;
}

// Trova utente per ID
function findUserById(id) {
  return users.find(u => u.id === id);
}

// Router
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  
  console.log(`${method} ${pathname}`);
  
  // Parsing route
  const parts = pathname.split('/').filter(Boolean);
  
  // GET /users - Lista tutti
  if (method === 'GET' && pathname === '/users') {
    return sendJSON(res, 200, users);
  }
  
  // GET /users/:id - Dettagli singolo
  if (method === 'GET' && parts[0] === 'users' && parts[1]) {
    const id = parseInt(parts[1]);
    const user = findUserById(id);
    
    if (!user) {
      return sendError(res, 404, `Utente con ID ${id} non trovato`);
    }
    
    return sendJSON(res, 200, user);
  }
  
  // POST /users - Crea nuovo
  if (method === 'POST' && pathname === '/users') {
    return parseBody(req, (error, body) => {
      if (error) {
        return sendError(res, 400, 'JSON non valido');
      }
      
      const errors = validateUser(body);
      if (errors.length > 0) {
        return sendError(res, 400, errors.join(', '));
      }
      
      const newUser = {
        id: nextId++,
        name: body.name,
        email: body.email,
        age: body.age || null
      };
      
      users.push(newUser);
      return sendJSON(res, 201, newUser);
    });
  }
  
  // PUT /users/:id - Aggiorna
  if (method === 'PUT' && parts[0] === 'users' && parts[1]) {
    const id = parseInt(parts[1]);
    const user = findUserById(id);
    
    if (!user) {
      return sendError(res, 404, `Utente con ID ${id} non trovato`);
    }
    
    return parseBody(req, (error, body) => {
      if (error) {
        return sendError(res, 400, 'JSON non valido');
      }
      
      const errors = validateUser(body, true);
      if (errors.length > 0) {
        return sendError(res, 400, errors.join(', '));
      }
      
      // Aggiorna solo i campi forniti
      if (body.name !== undefined) user.name = body.name;
      if (body.email !== undefined) user.email = body.email;
      if (body.age !== undefined) user.age = body.age;
      
      return sendJSON(res, 200, user);
    });
  }
  
  // DELETE /users/:id - Elimina
  if (method === 'DELETE' && parts[0] === 'users' && parts[1]) {
    const id = parseInt(parts[1]);
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) {
      return sendError(res, 404, `Utente con ID ${id} non trovato`);
    }
    
    const deleted = users.splice(index, 1)[0];
    return sendJSON(res, 200, { message: 'Utente eliminato', user: deleted });
  }
  
  // Route non trovata
  sendError(res, 404, 'Route non trovata');
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`\n🚀 API REST attiva`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`\n📋 Endpoints disponibili:`);
  console.log(`   GET    /users      - Lista utenti`);
  console.log(`   GET    /users/:id  - Dettagli utente`);
  console.log(`   POST   /users      - Crea utente`);
  console.log(`   PUT    /users/:id  - Aggiorna utente`);
  console.log(`   DELETE /users/:id  - Elimina utente\n`);
});
```

## 🎓 Suggerimenti

1. **Idempotenza**: PUT e DELETE dovrebbero essere idempotenti
2. **Status codes**: Usa status code appropriati (201 per created, 204 per no content)
3. **CORS**: Per client web, potresti aver bisogno di headers CORS
4. **Content-Type**: Controlla sempre il Content-Type delle richieste POST/PUT
5. **Logging**: Logga tutte le richieste per debugging

## ✅ Criteri di Valutazione

- [ ] GET /users restituisce array di utenti
- [ ] GET /users/:id restituisce singolo utente o 404
- [ ] POST /users crea nuovo utente con ID incrementale
- [ ] PUT /users/:id aggiorna utente o 404
- [ ] DELETE /users/:id elimina utente o 404
- [ ] Validazione funziona e restituisce 400
- [ ] JSON viene parsato correttamente
- [ ] Errori sono gestiti con status code appropriati

## 📖 Test con curl

```bash
# Lista utenti
curl http://localhost:3000/users

# Dettagli utente
curl http://localhost:3000/users/1

# Crea utente
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Giovanni Verdi","email":"giovanni@email.com","age":28}'

# Aggiorna utente
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"age":31}'

# Elimina utente
curl -X DELETE http://localhost:3000/users/2
```

## 🚀 Sfide Extra (Opzionali)

1. **Paginazione**: GET /users?page=1&limit=10
2. **Filtri**: GET /users?age=30&name=Mario
3. **Sorting**: GET /users?sort=age&order=desc
4. **Persistenza**: Salva dati su file JSON
5. **Auth**: Aggiungi token-based authentication
6. **Rate limiting**: Limita richieste per IP
7. **CORS**: Aggiungi supporto CORS completo
8. **Logging avanzato**: Log su file con timestamps
9. **Input sanitization**: Pulisci l'input da caratteri pericolosi
10. **API versioning**: Supporta /v1/users e /v2/users

## 📖 Risorse Utili

- [REST API Best Practices](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- [HTTP Status Codes](https://httpstat uses.com/)
- [JSON API Specification](https://jsonapi.org/)
- [RESTful API Design Guide](https://restfulapi.net/)
