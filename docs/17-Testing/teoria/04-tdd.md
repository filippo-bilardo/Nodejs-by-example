# Test-Driven Development (TDD) in Node.js

## Cos'è il Test-Driven Development

Il Test-Driven Development (TDD) è un approccio allo sviluppo software in cui i test vengono scritti prima del codice di implementazione. Questo processo inverte il flusso tradizionale di sviluppo, ponendo l'enfasi sulla definizione chiara dei requisiti attraverso i test prima di scrivere qualsiasi codice funzionale.

Il ciclo TDD, spesso chiamato "Red-Green-Refactor", consiste in tre fasi principali:

1. **Red**: Scrivere un test che fallisce per una funzionalità non ancora implementata
2. **Green**: Implementare il codice minimo necessario per far passare il test
3. **Refactor**: Migliorare il codice mantenendo la funzionalità (i test devono continuare a passare)

## Vantaggi del TDD

1. **Design Guidato dai Requisiti**: I test diventano una specifica eseguibile dei requisiti.

2. **Codice più Modulare**: Il TDD incoraggia un design più modulare e disaccoppiato.

3. **Refactoring Sicuro**: Con una suite di test completa, è possibile refactorizzare il codice con fiducia.

4. **Documentazione Vivente**: I test servono come documentazione sempre aggiornata del comportamento atteso.

5. **Meno Bug**: Scrivere test prima dell'implementazione aiuta a prevenire bug e regressioni.

6. **Sviluppo Incrementale**: Il TDD promuove uno sviluppo incrementale e iterativo.

7. **Feedback Immediato**: Si ottiene un feedback immediato sulla correttezza del codice.

## Il Ciclo TDD in Dettaglio

### 1. Red: Scrivere un Test che Fallisce

Il primo passo è scrivere un test che definisca chiaramente il comportamento atteso della funzionalità da implementare. Questo test dovrebbe fallire inizialmente, poiché la funzionalità non è ancora stata implementata.

```javascript
// userService.test.js
const { createUser } = require('../services/userService');

describe('User Service', () => {
  test('createUser dovrebbe creare un nuovo utente con i dati forniti', () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    const user = createUser(userData);
    
    expect(user).toHaveProperty('id');
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.createdAt).toBeInstanceOf(Date);
  });
});
```

Eseguendo questo test, otterremo un errore perché la funzione `createUser` non esiste ancora o non implementa la funzionalità richiesta.

### 2. Green: Implementare il Codice Minimo

Il secondo passo è scrivere il codice minimo necessario per far passare il test. L'obiettivo non è scrivere codice perfetto, ma codice funzionante che soddisfi i requisiti definiti dal test.

```javascript
// services/userService.js
function createUser(userData) {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: userData.name,
    email: userData.email,
    createdAt: new Date()
  };
}

module.exports = { createUser };
```

Eseguendo nuovamente il test, dovrebbe passare con successo.

### 3. Refactor: Migliorare il Codice

Il terzo passo è migliorare il codice appena scritto, mantenendo la funzionalità (i test devono continuare a passare). Questo può includere miglioramenti nella struttura, nella leggibilità, nelle performance o nella manutenibilità.

```javascript
// services/userService.js
const { v4: uuidv4 } = require('uuid');

function createUser(userData) {
  if (!userData.name || !userData.email) {
    throw new Error('Nome ed email sono richiesti');
  }
  
  return {
    id: uuidv4(),
    name: userData.name,
    email: userData.email,
    createdAt: new Date()
  };
}

module.exports = { createUser };
```

Dopo il refactoring, eseguiamo nuovamente i test per assicurarci che continuino a passare.

### 4. Ripetere il Ciclo

Una volta completato un ciclo, si ripete il processo per la prossima funzionalità o comportamento da implementare:

```javascript
// Aggiungiamo un nuovo test
test('createUser dovrebbe lanciare un errore se mancano dati richiesti', () => {
  const incompleteUserData = { name: 'John Doe' };
  
  expect(() => {
    createUser(incompleteUserData);
  }).toThrow('Nome ed email sono richiesti');
});
```

## Implementazione del TDD in Node.js

### Setup di un Progetto per TDD

1. **Installazione delle Dipendenze**:

```bash
npm init -y
npm install --save-dev jest
```

2. **Configurazione di Jest in package.json**:

```json
{
  "scripts": {
    "test": "jest --watchAll"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
```

3. **Struttura delle Cartelle**:

```
/project
  /src
    /services
      userService.js
    /models
      user.js
  /tests
    /unit
      userService.test.js
    /integration
      userApi.test.js
  package.json
```

### Esempio Completo di TDD

Vediamo un esempio completo di sviluppo di una funzionalità utilizzando TDD.

**Obiettivo**: Implementare un servizio per la gestione di una lista di attività (todo list).

#### 1. Scrivere il Primo Test

```javascript
// tests/unit/todoService.test.js
describe('Todo Service', () => {
  test('addTodo dovrebbe aggiungere una nuova attività alla lista', () => {
    const { addTodo, getTodos } = require('../../src/services/todoService');
    
    const todoText = 'Completare il progetto';
    const todo = addTodo(todoText);
    
    expect(todo).toHaveProperty('id');
    expect(todo.text).toBe(todoText);
    expect(todo.completed).toBe(false);
    
    const todos = getTodos();
    expect(todos).toContainEqual(todo);
  });
});
```

#### 2. Implementare il Codice Minimo

```javascript
// src/services/todoService.js
let todos = [];

function addTodo(text) {
  const todo = {
    id: Date.now().toString(),
    text,
    completed: false
  };
  
  todos.push(todo);
  return todo;
}

function getTodos() {
  return todos;
}

module.exports = { addTodo, getTodos };
```

#### 3. Aggiungere un Test per Completare un'Attività

```javascript
// tests/unit/todoService.test.js
test('completeTodo dovrebbe impostare un\'attività come completata', () => {
  const { addTodo, completeTodo, getTodos } = require('../../src/services/todoService');
  
  // Aggiungi un'attività
  const todo = addTodo('Completare il progetto');
  
  // Completa l'attività
  completeTodo(todo.id);
  
  // Verifica che l'attività sia stata completata
  const updatedTodo = getTodos().find(t => t.id === todo.id);
  expect(updatedTodo.completed).toBe(true);
});
```

#### 4. Implementare la Funzionalità

```javascript
// src/services/todoService.js
function completeTodo(id) {
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    throw new Error('Attività non trovata');
  }
  
  todos[todoIndex].completed = true;
  return todos[todoIndex];
}

module.exports = { addTodo, getTodos, completeTodo };
```

#### 5. Aggiungere un Test per la Gestione degli Errori

```javascript
// tests/unit/todoService.test.js
test('completeTodo dovrebbe lanciare un errore se l\'ID non esiste', () => {
  const { completeTodo } = require('../../src/services/todoService');
  
  expect(() => {
    completeTodo('id-non-esistente');
  }).toThrow('Attività non trovata');
});
```

#### 6. Refactoring del Codice

```javascript
// src/services/todoService.js
const { v4: uuidv4 } = require('uuid');

let todos = [];

function addTodo(text) {
  if (!text) {
    throw new Error('Il testo dell\'attività è richiesto');
  }
  
  const todo = {
    id: uuidv4(),
    text,
    completed: false,
    createdAt: new Date()
  };
  
  todos.push(todo);
  return todo;
}

function getTodos() {
  return [...todos]; // Restituisce una copia per evitare modifiche dirette
}

function getTodoById(id) {
  const todo = todos.find(todo => todo.id === id);
  
  if (!todo) {
    throw new Error('Attività non trovata');
  }
  
  return todo;
}

function completeTodo(id) {
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    throw new Error('Attività non trovata');
  }
  
  todos[todoIndex].completed = true;
  todos[todoIndex].completedAt = new Date();
  
  return { ...todos[todoIndex] }; // Restituisce una copia
}

function deleteTodo(id) {
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if (todoIndex === -1) {
    throw new Error('Attività non trovata');
  }
  
  const deletedTodo = todos[todoIndex];
  todos.splice(todoIndex, 1);
  
  return deletedTodo;
}

function clearTodos() {
  todos = [];
}

module.exports = {
  addTodo,
  getTodos,
  getTodoById,
  completeTodo,
  deleteTodo,
  clearTodos
};
```

#### 7. Aggiornare i Test per il Refactoring

```javascript
// tests/unit/todoService.test.js
const {
  addTodo,
  getTodos,
  getTodoById,
  completeTodo,
  deleteTodo,
  clearTodos
} = require('../../src/services/todoService');

describe('Todo Service', () => {
  // Pulisci la lista di attività prima di ogni test
  beforeEach(() => {
    clearTodos();
  });
  
  test('addTodo dovrebbe aggiungere una nuova attività alla lista', () => {
    const todoText = 'Completare il progetto';
    const todo = addTodo(todoText);
    
    expect(todo).toHaveProperty('id');
    expect(todo.text).toBe(todoText);
    expect(todo.completed).toBe(false);
    expect(todo.createdAt).toBeInstanceOf(Date);
    
    const todos = getTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0].id).toBe(todo.id);
  });
  
  test('addTodo dovrebbe lanciare un errore se il testo è vuoto', () => {
    expect(() => {
      addTodo('');
    }).toThrow('Il testo dell\'attività è richiesto');
  });
  
  test('getTodoById dovrebbe restituire l\'attività con l\'ID specificato', () => {
    const todo = addTodo('Test');
    const retrievedTodo = getTodoById(todo.id);
    
    expect(retrievedTodo).toEqual(todo);
  });
  
  test('getTodoById dovrebbe lanciare un errore se l\'ID non esiste', () => {
    expect(() => {
      getTodoById('id-non-esistente');
    }).toThrow('Attività non trovata');
  });
  
  test('completeTodo dovrebbe impostare un\'attività come completata', () => {
    const todo = addTodo('Completare il progetto');
    const completedTodo = completeTodo(todo.id);
    
    expect(completedTodo.completed).toBe(true);
    expect(completedTodo.completedAt).toBeInstanceOf(Date);
    
    const retrievedTodo = getTodoById(todo.id);
    expect(retrievedTodo.completed).toBe(true);
  });
  
  test('deleteTodo dovrebbe rimuovere un\'attività dalla lista', () => {
    const todo = addTodo('Da eliminare');
    const deletedTodo = deleteTodo(todo.id);
    
    expect(deletedTodo.id).toBe(todo.id);
    
    const todos = getTodos();
    expect(todos).toHaveLength(0);
    
    expect(() => {
      getTodoById(todo.id);
    }).toThrow('Attività non trovata');
  });
});
```

## TDD per API REST in Express

Il TDD può essere applicato anche allo sviluppo di API REST in Express:

### 1. Scrivere Test per le Route

```javascript
// tests/integration/todoApi.test.js
const request = require('supertest');
const app = require('../../src/app');
const { clearTodos } = require('../../src/services/todoService');

describe('Todo API', () => {
  beforeEach(() => {
    clearTodos();
  });
  
  describe('POST /api/todos', () => {
    test('dovrebbe creare una nuova attività', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ text: 'Nuova attività' })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.text).toBe('Nuova attività');
      expect(response.body.completed).toBe(false);
    });
    
    test('dovrebbe restituire 400 se il testo è mancante', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });
  
  describe('GET /api/todos', () => {
    test('dovrebbe restituire tutte le attività', async () => {
      // Crea alcune attività
      await request(app)
        .post('/api/todos')
        .send({ text: 'Attività 1' });
      
      await request(app)
        .post('/api/todos')
        .send({ text: 'Attività 2' });
      
      // Ottieni tutte le attività
      const response = await request(app)
        .get('/api/todos')
        .expect(200);
      
      expect(response.body).toHaveLength(2);
      expect(response.body[0].text).toBe('Attività 1');
      expect(response.body[1].text).toBe('Attività 2');
    });
  });
});
```

### 2. Implementare le Route

```javascript
// src/app.js
const express = require('express');
const {
  addTodo,
  getTodos,
  getTodoById,
  completeTodo,
  deleteTodo
} = require('./services/todoService');

const app = express();
app.use(express.json());

// Crea una nuova attività
app.post('/api/todos', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Il testo dell\'attività è richiesto' });
    }
    
    const todo = addTodo(text);
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ottieni tutte le attività
app.get('/api/todos', (req, res) => {
  try {
    const todos = getTodos();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ottieni un'attività specifica
app.get('/api/todos/:id', (req, res) => {
  try {
    const todo = getTodoById(req.params.id);
    res.json(todo);
  } catch (error) {
    if (error.message === 'Attività non trovata') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Completa un'attività
app.patch('/api/todos/:id/complete', (req, res) => {
  try {
    const todo = completeTodo(req.params.id);
    res.json(todo);
  } catch (error) {
    if (error.message === 'Attività non trovata') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Elimina un'attività
app.delete('/api/todos/:id', (req, res) => {
  try {
    const todo = deleteTodo(req.params.id);
    res.json(todo);
  } catch (error) {
    if (error.message === 'Attività non trovata') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
```

## Best Practices per il TDD

1. **Inizia con Test Semplici**: Inizia con test semplici e incrementa gradualmente la complessità.

2. **Un Test, Un Concetto**: Ogni test dovrebbe verificare un singolo concetto o comportamento.

3. **Test Leggibili**: Scrivi test chiari e leggibili, con nomi descrittivi.

4. **Mantieni i Test Veloci**: I test dovrebbero essere veloci da eseguire per favorire cicli di feedback rapidi.

5. **Indipendenza dei Test**: Ogni test dovrebbe essere indipendente dagli altri.

6. **Copertura Completa**: Mira a una copertura completa del codice, ma concentrati sulla qualità dei test piuttosto che sulla quantità.

7. **Refactoring Continuo**: Refactorizza regolarmente sia il codice di produzione che i test.

8. **Evita Test Fragili**: Evita test che dipendono da dettagli di implementazione che potrebbero cambiare.

9. **Automatizza l'Esecuzione dei Test**: Configura l'esecuzione automatica dei test durante lo sviluppo.

10. **Integra con CI/CD**: Integra i test nel pipeline CI/CD per garantire che vengano eseguiti ad ogni commit.

## Sfide Comuni e Soluzioni

### 1. Test Difficili da Scrivere

**Problema**: Alcuni componenti o funzionalità possono essere difficili da testare.

**Soluzioni**:
- Progetta il codice pensando alla testabilità
- Utilizza l'iniezione delle dipendenze
- Separa le preoccupazioni (separation of concerns)

### 2. Test Lenti

**Problema**: I test possono diventare lenti con l'aumentare della complessità.

**Soluzioni**:
- Utilizza mock per le dipendenze esterne
- Organizza i test in suite separate (unit, integration, e2e)
- Esegui solo i test rilevanti durante lo sviluppo

### 3. Manutenzione dei Test

**Problema**: I test possono diventare difficili da mantenere nel tempo.

**Soluzioni**:
- Applica i principi DRY (Don't Repeat Yourself) anche ai test
- Utilizza helper e fixture per ridurre la duplicazione
- Refactorizza regolarmente i test

## Conclusione

Il Test-Driven Development è un approccio potente allo sviluppo software che può migliorare significativamente la qualità del codice e la produttività degli sviluppatori. In Node.js, grazie a strumenti come Jest, Mocha e Supertest, è possibile implementare facilmente il TDD per diversi tipi di applicazioni, dalle librerie alle API REST.

Adottando il ciclo Red-Green-Refactor e seguendo le best practices, è possibile creare codice più robusto, modulare e manutenibile, riducendo al contempo il rischio di bug e regressioni.

Nella prossima sezione, esploreremo tecniche avanzate di mocking e stubbing, essenziali per isolare i componenti durante il testing e simulare comportamenti complessi o dipendenze esterne.