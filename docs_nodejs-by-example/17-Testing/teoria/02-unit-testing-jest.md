# Unit Testing con Jest

## Introduzione a Jest

Jest è un framework di testing JavaScript completo e potente, sviluppato da Facebook. È diventato uno degli strumenti più popolari per il testing in Node.js grazie alla sua filosofia "zero-configuration" e alle sue funzionalità integrate.

Caratteristiche principali di Jest:

- **Configurazione minima**: Funziona subito senza bisogno di configurazioni complesse
- **All-in-one**: Include test runner, assertion library, e strumenti di mocking
- **Snapshot testing**: Permette di salvare "istantanee" dell'output e confrontarle nelle esecuzioni successive
- **Esecuzione parallela**: Esegue i test in parallelo per migliorare le performance
- **Coverage integrato**: Fornisce report di copertura del codice senza strumenti aggiuntivi
- **Watch mode**: Riesegue automaticamente i test quando i file vengono modificati
- **Mocking potente**: Facilita la creazione di mock per moduli, funzioni e timer

## Installazione e Configurazione

### Installazione

```bash
npm install --save-dev jest
```

### Configurazione Base in package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Configurazione Avanzata

Per una configurazione più dettagliata, puoi creare un file `jest.config.js` nella root del progetto:

```javascript
module.exports = {
  // L'ambiente in cui eseguire i test
  testEnvironment: 'node',
  
  // Pattern per trovare i file di test
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
  
  // Cartelle da ignorare
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Soglie di copertura
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // File da includere nella copertura
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/node_modules/**'
  ],
  
  // Setup prima di ogni test
  setupFilesAfterEnv: ['./jest.setup.js']
};
```

## Struttura dei Test

Jest utilizza una sintassi BDD (Behavior-Driven Development) con funzioni globali come `describe`, `it`/`test`, `beforeEach`, e `afterEach`.

### Esempio Base

```javascript
// math.js
function sum(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = { sum, subtract };

// math.test.js
const { sum, subtract } = require('./math');

describe('Math module', () => {
  test('sum adds two numbers correctly', () => {
    expect(sum(2, 3)).toBe(5);
    expect(sum(-1, 1)).toBe(0);
    expect(sum(0, 0)).toBe(0);
  });

  test('subtract subtracts two numbers correctly', () => {
    expect(subtract(5, 2)).toBe(3);
    expect(subtract(1, 1)).toBe(0);
    expect(subtract(0, 5)).toBe(-5);
  });
});
```

### Funzioni di Organizzazione dei Test

- **describe**: Raggruppa test correlati
- **test** / **it**: Definisce un singolo test
- **beforeAll**: Esegue codice prima di tutti i test in un blocco
- **afterAll**: Esegue codice dopo tutti i test in un blocco
- **beforeEach**: Esegue codice prima di ogni test in un blocco
- **afterEach**: Esegue codice dopo ogni test in un blocco

```javascript
describe('Database operations', () => {
  let db;
  
  beforeAll(async () => {
    // Connessione al database di test
    db = await connectToTestDatabase();
  });
  
  afterAll(async () => {
    // Chiusura della connessione
    await db.close();
  });
  
  beforeEach(async () => {
    // Pulizia delle tabelle prima di ogni test
    await db.clearAllTables();
  });
  
  test('should insert a user correctly', async () => {
    const user = { name: 'John', email: 'john@example.com' };
    const result = await db.users.insert(user);
    expect(result.id).toBeDefined();
    expect(result.name).toBe(user.name);
  });
  
  test('should retrieve a user by id', async () => {
    // Test implementation
  });
});
```

## Matchers (Asserzioni)

Jest fornisce una ricca collezione di "matchers" per verificare i valori in diversi modi.

### Matchers Comuni

```javascript
// Uguaglianza
expect(value).toBe(exactValue);          // Uguaglianza stretta (===)
expect(value).toEqual(obj);              // Uguaglianza profonda per oggetti
expect(value).toStrictEqual(obj);        // Uguaglianza ancora più stretta

// Verità
expect(value).toBeTruthy();              // Verifica se il valore è truthy
expect(value).toBeFalsy();               // Verifica se il valore è falsy
expect(value).toBeNull();                // Verifica se il valore è null
expect(value).toBeUndefined();           // Verifica se il valore è undefined
expect(value).toBeDefined();             // Verifica se il valore è definito

// Numeri
expect(value).toBeGreaterThan(number);           // >
expect(value).toBeGreaterThanOrEqual(number);    // >=
expect(value).toBeLessThan(number);              // <
expect(value).toBeLessThanOrEqual(number);       // <=
expect(value).toBeCloseTo(number, numDigits);    // Per numeri decimali

// Stringhe
expect(string).toMatch(/regex/);         // Verifica con regex
expect(string).toContain(substring);     // Contiene una sottostringa

// Array
expect(array).toContain(item);           // Contiene un elemento
expect(array).toHaveLength(number);      // Ha una lunghezza specifica

// Oggetti
expect(object).toHaveProperty(keyPath, value); // Ha una proprietà

// Eccezioni
expect(() => { fn() }).toThrow();        // Lancia un'eccezione
expect(() => { fn() }).toThrow(Error);   // Lancia un tipo specifico di eccezione
expect(() => { fn() }).toThrow('message'); // Lancia un'eccezione con un messaggio
```

### Negazione

Puoi negare qualsiasi matcher usando `.not`:

```javascript
expect(value).not.toBe(wrongValue);
expect(array).not.toContain(absentItem);
```

## Testing di Codice Asincrono

Jest supporta diversi modi per testare codice asincrono.

### Promises

```javascript
// userService.js
async function fetchUser(id) {
  const response = await fetch(`https://api.example.com/users/${id}`);
  if (!response.ok) throw new Error('User not found');
  return response.json();
}

module.exports = { fetchUser };

// userService.test.js
const { fetchUser } = require('./userService');

test('fetchUser returns user data', () => {
  return fetchUser(1).then(data => {
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('email');
  });
});

// Alternativa con async/await
test('fetchUser returns user data', async () => {
  const data = await fetchUser(1);
  expect(data).toHaveProperty('name');
  expect(data).toHaveProperty('email');
});
```

### Gestione degli Errori

```javascript
test('fetchUser throws error for invalid id', async () => {
  expect.assertions(1); // Verifica che venga eseguita almeno un'asserzione
  try {
    await fetchUser(999); // ID non esistente
  } catch (e) {
    expect(e.message).toMatch(/not found/);
  }
});

// Alternativa più concisa
test('fetchUser throws error for invalid id', async () => {
  await expect(fetchUser(999)).rejects.toThrow('User not found');
});
```

## Mocking

Il mocking è una tecnica che permette di sostituire parti del sistema con versioni controllate per isolare il codice in test.

### Mock di Funzioni

```javascript
test('calls callback with correct value', () => {
  const mockCallback = jest.fn();
  
  function forEach(items, callback) {
    for (let i = 0; i < items.length; i++) {
      callback(items[i]);
    }
  }
  
  forEach([1, 2], mockCallback);
  
  // Il mock è stato chiamato due volte
  expect(mockCallback.mock.calls.length).toBe(2);
  
  // Il primo argomento della prima chiamata era 1
  expect(mockCallback.mock.calls[0][0]).toBe(1);
  
  // Il primo argomento della seconda chiamata era 2
  expect(mockCallback.mock.calls[1][0]).toBe(2);
});
```

### Mock di Moduli

```javascript
// userRepository.js
const db = require('./db');

async function getUser(id) {
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
}

module.exports = { getUser };

// userRepository.test.js
jest.mock('./db', () => ({
  query: jest.fn()
}));

const db = require('./db');
const { getUser } = require('./userRepository');

test('getUser calls db with correct query', async () => {
  db.query.mockResolvedValue({ id: 1, name: 'John' });
  
  const user = await getUser(1);
  
  expect(db.query).toHaveBeenCalledWith(
    'SELECT * FROM users WHERE id = ?',
    [1]
  );
  expect(user).toEqual({ id: 1, name: 'John' });
});
```

### Mock di API HTTP con Jest

```javascript
// api.js
const axios = require('axios');

async function fetchUserData(userId) {
  const response = await axios.get(`https://api.example.com/users/${userId}`);
  return response.data;
}

module.exports = { fetchUserData };

// api.test.js
jest.mock('axios');

const axios = require('axios');
const { fetchUserData } = require('./api');

test('fetchUserData fetches and returns user data', async () => {
  const userData = { id: 1, name: 'John Doe' };
  axios.get.mockResolvedValue({ data: userData });
  
  const data = await fetchUserData(1);
  
  expect(axios.get).toHaveBeenCalledWith('https://api.example.com/users/1');
  expect(data).toEqual(userData);
});
```

### Spies

Gli spies permettono di osservare il comportamento di una funzione senza sostituirla completamente:

```javascript
const user = {
  setName(name) {
    this.name = name;
  }
};

test('spies on setName method', () => {
  const spy = jest.spyOn(user, 'setName');
  
  user.setName('John');
  
  expect(spy).toHaveBeenCalledWith('John');
  expect(user.name).toBe('John');
  
  // Ripristina l'implementazione originale
  spy.mockRestore();
});
```

## Snapshot Testing

Lo snapshot testing è utile per verificare che l'output di una funzione non cambi inaspettatamente.

```javascript
// generateReport.js
function generateUserReport(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: new Date(user.createdAt),
    stats: {
      postsCount: user.posts.length,
      followersCount: user.followers.length
    }
  };
}

module.exports = { generateUserReport };

// generateReport.test.js
const { generateUserReport } = require('./generateReport');

test('generates correct user report', () => {
  const user = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: '2023-01-15T12:00:00Z',
    posts: [{ id: 1 }, { id: 2 }],
    followers: [{ id: 101 }, { id: 102 }, { id: 103 }]
  };
  
  const report = generateUserReport(user);
  
  // Crea o verifica uno snapshot
  expect(report).toMatchSnapshot();
});
```

Quando esegui il test per la prima volta, Jest creerà un file di snapshot. Nelle esecuzioni successive, confronterà l'output con lo snapshot salvato.

## Code Coverage

Jest include strumenti integrati per misurare la copertura del codice.

```bash
npm test -- --coverage
```

Questo comando genererà un report dettagliato che mostra quali parti del codice sono coperte dai test.

### Interpretazione del Report di Coverage

- **Statements**: Percentuale di istruzioni eseguite
- **Branches**: Percentuale di rami condizionali eseguiti (if/else, switch, ecc.)
- **Functions**: Percentuale di funzioni chiamate
- **Lines**: Percentuale di linee di codice eseguite

## Test Driven Development con Jest

Jest è particolarmente adatto per il Test Driven Development (TDD) grazie alla sua modalità watch e alla velocità di esecuzione.

### Ciclo TDD

1. **Red**: Scrivi un test che fallisce
2. **Green**: Implementa il codice minimo per far passare il test
3. **Refactor**: Migliora il codice mantenendo i test verdi

### Esempio di TDD

```javascript
// Fase 1: Red - Scrivi un test che fallisce
// calculator.test.js
const Calculator = require('./calculator');

describe('Calculator', () => {
  test('should add two numbers correctly', () => {
    const calculator = new Calculator();
    expect(calculator.add(2, 3)).toBe(5);
  });
});

// Fase 2: Green - Implementa il codice minimo
// calculator.js
class Calculator {
  add(a, b) {
    return a + b;
  }
}

module.exports = Calculator;

// Fase 3: Refactor (se necessario)
// In questo caso, il codice è già semplice e chiaro

// Aggiungi un nuovo test
test('should subtract two numbers correctly', () => {
  const calculator = new Calculator();
  expect(calculator.subtract(5, 2)).toBe(3);
});

// Implementa la nuova funzionalità
class Calculator {
  add(a, b) {
    return a + b;
  }
  
  subtract(a, b) {
    return a - b;
  }
}
```

## Best Practices per Unit Testing con Jest

1. **Organizza i test in modo logico**: Usa `describe` per raggruppare test correlati

2. **Un'asserzione per test**: Idealmente, ogni test dovrebbe verificare una sola cosa

3. **Nomi descrittivi**: I nomi dei test dovrebbero descrivere chiaramente cosa stanno verificando

4. **Isola i test**: Ogni test dovrebbe essere indipendente dagli altri

5. **Usa beforeEach/afterEach**: Per setup e teardown comuni

6. **Mock le dipendenze esterne**: Isola l'unità in test dalle sue dipendenze

7. **Testa i casi limite**: Non testare solo il percorso felice, ma anche casi limite ed errori

8. **Mantieni i test veloci**: I test lenti scoraggiano l'esecuzione frequente

9. **Usa la modalità watch durante lo sviluppo**: `npm test -- --watch`

10. **Controlla regolarmente la copertura**: `npm test -- --coverage`

## Conclusione

Jest è un framework potente e flessibile che semplifica notevolmente il processo di unit testing in Node.js. La sua configurazione minima, le funzionalità integrate e la sintassi intuitiva lo rendono una scelta eccellente sia per principianti che per sviluppatori esperti.

Nel prossimo capitolo, esploreremo l'alternativa più popolare a Jest: Mocha con Chai, che offre un approccio più modulare al testing.