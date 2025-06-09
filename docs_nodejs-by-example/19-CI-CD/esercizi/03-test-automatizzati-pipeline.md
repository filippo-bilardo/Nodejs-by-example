# Implementazione di Test Automatizzati nella Pipeline CI/CD

## Obiettivo
In questo esercizio, imparerai a integrare test automatizzati nella tua pipeline CI/CD per garantire la qualità del codice prima del deployment. Implementerai test unitari, di integrazione e end-to-end, configurandoli per essere eseguiti automaticamente ad ogni push o pull request.

## Prerequisiti
- Un repository GitHub con un'applicazione Node.js
- GitHub Actions configurato (vedi esercizio 01)
- Conoscenza di base dei framework di testing in JavaScript

## Passaggi

### 1. Configurazione dei Test Unitari con Jest

1. Installa Jest e le dipendenze necessarie:
   ```bash
   npm install --save-dev jest @types/jest supertest
   ```

2. Configura Jest nel file `package.json`:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch",
     "test:coverage": "jest --coverage"
   },
   "jest": {
     "testEnvironment": "node",
     "coverageThreshold": {
       "global": {
         "branches": 70,
         "functions": 80,
         "lines": 80,
         "statements": 80
       }
     }
   }
   ```

3. Crea una cartella `__tests__` nella radice del progetto per i test unitari:
   ```bash
   mkdir __tests__
   ```

4. Crea un test di esempio per una funzione di utilità:
   ```javascript
   // __tests__/utils.test.js
   const { sum, multiply } = require('../src/utils');

   describe('Funzioni matematiche', () => {
     test('somma due numeri correttamente', () => {
       expect(sum(2, 3)).toBe(5);
       expect(sum(-1, 1)).toBe(0);
       expect(sum(0, 0)).toBe(0);
     });

     test('moltiplica due numeri correttamente', () => {
       expect(multiply(2, 3)).toBe(6);
       expect(multiply(-1, 1)).toBe(-1);
       expect(multiply(0, 5)).toBe(0);
     });
   });
   ```

5. Crea il file di implementazione:
   ```javascript
   // src/utils.js
   function sum(a, b) {
     return a + b;
   }

   function multiply(a, b) {
     return a * b;
   }

   module.exports = { sum, multiply };
   ```

### 2. Configurazione dei Test di Integrazione

1. Crea una cartella per i test di integrazione:
   ```bash
   mkdir __tests__/integration
   ```

2. Crea un test di integrazione per un'API REST:
   ```javascript
   // __tests__/integration/api.test.js
   const request = require('supertest');
   const app = require('../src/app');
   const db = require('../src/db');

   // Connetti al database di test prima di tutti i test
   beforeAll(async () => {
     await db.connect();
   });

   // Pulisci il database dopo ogni test
   afterEach(async () => {
     await db.clearDatabase();
   });

   // Disconnetti dal database dopo tutti i test
   afterAll(async () => {
     await db.closeDatabase();
   });

   describe('API Utenti', () => {
     it('GET /api/users dovrebbe restituire un array vuoto', async () => {
       const response = await request(app).get('/api/users');
       expect(response.statusCode).toBe(200);
       expect(response.body).toEqual([]);
     });

     it('POST /api/users dovrebbe creare un nuovo utente', async () => {
       const userData = { name: 'Mario Rossi', email: 'mario@example.com' };
       const response = await request(app)
         .post('/api/users')
         .send(userData);

       expect(response.statusCode).toBe(201);
       expect(response.body).toHaveProperty('id');
       expect(response.body.name).toBe(userData.name);
       expect(response.body.email).toBe(userData.email);
     });
   });
   ```

### 3. Configurazione dei Test End-to-End con Cypress

1. Installa Cypress:
   ```bash
   npm install --save-dev cypress
   ```

2. Aggiungi lo script per Cypress in `package.json`:
   ```json
   "scripts": {
     "cypress:open": "cypress open",
     "cypress:run": "cypress run",
     "test:e2e": "start-server-and-test start http://localhost:3000 cypress:run"
   }
   ```

3. Inizializza Cypress:
   ```bash
   npx cypress open
   ```

4. Crea un test E2E di esempio:
   ```javascript
   // cypress/integration/home.spec.js
   describe('Home Page', () => {
     beforeEach(() => {
       cy.visit('/');
     });

     it('dovrebbe visualizzare il titolo corretto', () => {
       cy.get('h1').should('contain', 'Benvenuto nella mia app');
     });

     it('dovrebbe navigare alla pagina About quando si clicca sul link', () => {
       cy.get('a[href="/about"]').click();
       cy.url().should('include', '/about');
       cy.get('h1').should('contain', 'Chi siamo');
     });
   });
   ```

### 4. Integrazione dei Test nella Pipeline CI/CD

1. Aggiorna il file di workflow GitHub Actions per includere tutti i tipi di test:
   ```yaml
   # .github/workflows/ci-cd.yml
   name: Node.js CI/CD

   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

   jobs:
     test:
       runs-on: ubuntu-latest

       strategy:
         matrix:
           node-version: [14.x, 16.x]

       steps:
       - uses: actions/checkout@v3
       - name: Use Node.js ${{ matrix.node-version }}
         uses: actions/setup-node@v3
         with:
           node-version: ${{ matrix.node-version }}
           cache: 'npm'
       - run: npm ci
       - run: npm run lint --if-present
       - run: npm test
       - name: Test di integrazione
         run: npm run test:integration
       - name: Test E2E
         run: npm run test:e2e
       - name: Carica report di copertura
         uses: actions/upload-artifact@v3
         with:
           name: coverage-report
           path: coverage/
   ```

### 5. Configurazione della Copertura del Codice

1. Configura Jest per generare report di copertura:
   ```json
   "jest": {
     "collectCoverage": true,
     "coverageReporters": ["text", "lcov"],
     "coverageDirectory": "./coverage"
   }
   ```

2. Integra Codecov o Coveralls per visualizzare i report di copertura:
   ```yaml
   # Aggiungi questo al tuo workflow GitHub Actions
   - name: Carica report su Codecov
     uses: codecov/codecov-action@v3
     with:
       token: ${{ secrets.CODECOV_TOKEN }}
       directory: ./coverage/
       fail_ci_if_error: true
   ```

### 6. Implementazione di Test di Prestazioni

1. Installa k6 per i test di carico:
   ```bash
   npm install --save-dev k6
   ```

2. Crea un test di carico di base:
   ```javascript
   // tests/performance/load-test.js
   import http from 'k6/http';
   import { sleep, check } from 'k6';

   export default function() {
     const res = http.get('http://localhost:3000/api/users');
     check(res, {
       'status è 200': (r) => r.status === 200,
       'tempo di risposta < 200ms': (r) => r.timings.duration < 200
     });
     sleep(1);
   }
   ```

3. Aggiungi lo script per eseguire i test di carico:
   ```json
   "scripts": {
     "test:performance": "k6 run tests/performance/load-test.js"
   }
   ```

## Esercizi Aggiuntivi

1. **Implementa Test Snapshot**: Utilizza i test snapshot di Jest per verificare che i componenti UI non cambino inaspettatamente.

2. **Aggiungi Test di Accessibilità**: Integra strumenti come axe-core per verificare l'accessibilità della tua applicazione.

3. **Configura Test Paralleli**: Modifica la configurazione di Jest per eseguire i test in parallelo e ridurre il tempo di esecuzione.

4. **Implementa Test di Mutazione**: Utilizza Stryker Mutator per verificare la qualità dei tuoi test.

## Risorse Aggiuntive

- [Documentazione di Jest](https://jestjs.io/docs/getting-started)
- [Guida a Cypress](https://docs.cypress.io/guides/overview/why-cypress)
- [Documentazione di Supertest](https://github.com/visionmedia/supertest)
- [Introduzione a k6](https://k6.io/docs/)
- [Codecov](https://about.codecov.io/)

## Conclusione

In questo esercizio, hai imparato a implementare diversi tipi di test automatizzati e a integrarli nella tua pipeline CI/CD. I test automatizzati sono fondamentali per garantire la qualità del codice e prevenire regressioni durante lo sviluppo. Una buona copertura di test ti permette di rilasciare nuove funzionalità con maggiore confidenza e ridurre il rischio di introdurre bug in produzione.

Nel prossimo esercizio, esploreremo come configurare una pipeline multi-ambiente per supportare ambienti di sviluppo, staging e produzione.