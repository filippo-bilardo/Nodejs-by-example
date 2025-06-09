# Testing nelle Pipeline CI/CD

## Importanza del Testing nelle Pipeline CI/CD

Il testing è una componente fondamentale di qualsiasi pipeline CI/CD efficace. Automatizzare i test all'interno della pipeline garantisce che ogni modifica al codice venga verificata sistematicamente, riducendo il rischio di introdurre bug in produzione. Per le applicazioni Node.js, esistono numerosi strumenti e approcci per implementare test completi ed efficaci.

## Tipi di Test per Applicazioni Node.js

### Test Unitari

I test unitari verificano il corretto funzionamento di singole unità di codice (tipicamente funzioni o metodi) in isolamento.

**Framework popolari:**
- **Jest**: Framework completo con mocking integrato e snapshot testing
- **Mocha**: Framework flessibile che può essere combinato con librerie come Chai per le asserzioni
- **AVA**: Test runner minimalista con esecuzione parallela

**Esempio di test unitario con Jest:**

```javascript
// utils.js
function sum(a, b) {
  return a + b;
}

module.exports = { sum };

// utils.test.js
const { sum } = require('./utils');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

**Integrazione in pipeline CI/CD:**

```yaml
# GitHub Actions example
unit-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run unit tests
      run: npm test
```

### Test di Integrazione

I test di integrazione verificano che diversi componenti o servizi funzionino correttamente insieme.

**Approcci comuni:**
- Test di API con database reali o simulati
- Test di interazione tra microservizi
- Test di integrazione con servizi esterni

**Esempio di test di integrazione con Supertest:**

```javascript
// app.js
const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'John' }]);
});

module.exports = app;

// app.test.js
const request = require('supertest');
const app = require('./app');

describe('GET /api/users', () => {
  it('responds with json containing a list of users', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Accept', 'application/json');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('John');
  });
});
```

**Integrazione in pipeline CI/CD:**

```yaml
integration-tests:
  needs: unit-tests
  runs-on: ubuntu-latest
  services:
    # Configurazione di servizi come database
    mongodb:
      image: mongo:4.4
      ports:
        - 27017:27017
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run integration tests
      run: npm run test:integration
      env:
        MONGODB_URI: mongodb://localhost:27017/test
```

### Test End-to-End (E2E)

I test E2E verificano il flusso completo dell'applicazione dal punto di vista dell'utente finale.

**Strumenti popolari:**
- **Cypress**: Framework moderno per test E2E con interfaccia visuale
- **Playwright**: Libreria per l'automazione del browser multi-piattaforma
- **Puppeteer**: Libreria Node.js per controllare Chrome/Chromium

**Esempio di test E2E con Cypress:**

```javascript
// cypress/integration/login.spec.js
describe('Login Page', () => {
  it('should login with valid credentials', () => {
    cy.visit('/login');
    cy.get('input[name=email]').type('user@example.com');
    cy.get('input[name=password]').type('password123');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/dashboard');
    cy.get('h1').should('contain', 'Welcome');
  });
});
```

**Integrazione in pipeline CI/CD:**

```yaml
e2e-tests:
  needs: [unit-tests, integration-tests]
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Build application
      run: npm run build
    - name: Start application
      run: npm start & npx wait-on http://localhost:3000
    - name: Run E2E tests
      run: npm run test:e2e
```

## Analisi Statica del Codice

L'analisi statica del codice aiuta a identificare potenziali problemi senza eseguire il codice.

### Linting

**Strumenti popolari:**
- **ESLint**: Linter configurabile per JavaScript/TypeScript
- **StandardJS**: Stile di codice JavaScript con configurazione zero

**Esempio di configurazione ESLint:**

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "plugin:node/recommended"],
  "rules": {
    "node/exports-style": ["error", "module.exports"],
    "node/file-extension-in-import": ["error", "always"],
    "node/prefer-global/buffer": ["error", "always"],
    "node/prefer-global/console": ["error", "always"],
    "node/prefer-global/process": ["error", "always"],
    "node/prefer-global/url-search-params": ["error", "always"],
    "node/prefer-global/url": ["error", "always"],
    "node/prefer-promises/dns": "error",
    "node/prefer-promises/fs": "error"
  }
}
```

**Integrazione in pipeline CI/CD:**

```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run linting
      run: npm run lint
```

### Analisi della Qualità del Codice

**Strumenti popolari:**
- **SonarQube/SonarCloud**: Analisi completa della qualità del codice
- **CodeClimate**: Analisi automatica della qualità e complessità

**Integrazione in pipeline CI/CD:**

```yaml
code-quality:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0
    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## Test di Sicurezza

I test di sicurezza sono cruciali per identificare vulnerabilità prima che il codice raggiunga la produzione.

### Scansione delle Dipendenze

**Strumenti popolari:**
- **npm audit**: Strumento integrato in npm
- **Snyk**: Servizio per trovare e correggere vulnerabilità
- **Dependabot**: Servizio GitHub per aggiornamenti automatici delle dipendenze

**Integrazione in pipeline CI/CD:**

```yaml
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run security audit
      run: npm audit --audit-level=high
    - name: Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Analisi di Sicurezza Statica (SAST)

**Strumenti popolari:**
- **NodeJsScan**: Scanner di sicurezza specifico per Node.js
- **OWASP Dependency-Check**: Strumento per identificare dipendenze con vulnerabilità note

## Test di Performance

I test di performance verificano che l'applicazione mantenga prestazioni accettabili sotto carico.

**Strumenti popolari:**
- **Artillery**: Framework per test di carico per API e microservizi
- **Autocannon**: Strumento di benchmarking HTTP ad alte prestazioni
- **k6**: Strumento moderno per test di carico

**Esempio di script Artillery:**

```yaml
# load-test.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 5
      rampTo: 50
      name: "Ramp up load"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"

scenarios:
  - name: "API endpoints"
    flow:
      - get:
          url: "/api/users"
      - think: 1
      - get:
          url: "/api/products"
```

**Integrazione in pipeline CI/CD:**

```yaml
performance-test:
  needs: [unit-tests, integration-tests]
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Build application
      run: npm run build
    - name: Start application
      run: npm start & npx wait-on http://localhost:3000
    - name: Install Artillery
      run: npm install -g artillery
    - name: Run performance tests
      run: artillery run load-test.yml
```

## Best Practices per il Testing nelle Pipeline CI/CD

### 1. Implementare la Piramide dei Test

La piramide dei test suggerisce di avere:
- Molti test unitari (base della piramide)
- Un numero moderato di test di integrazione (centro)
- Pochi test E2E (vertice)

Questo approccio garantisce una copertura completa mantenendo i tempi di esecuzione ragionevoli.

### 2. Parallelizzare i Test

Eseguire i test in parallelo può ridurre significativamente i tempi di esecuzione della pipeline.

```yaml
unit-tests:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      shard: [1, 2, 3, 4]
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run unit tests (shard ${{ matrix.shard }})
      run: npm test -- --shard=${{ matrix.shard }}/4
```

### 3. Implementare Test Deterministici

I test non deterministici (flaky) possono causare fallimenti intermittenti della pipeline. Per evitarli:
- Evitare dipendenze da risorse esterne quando possibile
- Utilizzare mock e stub per isolare i test
- Implementare retry per test soggetti a condizioni di race

### 4. Monitorare la Copertura del Codice

Monitorare la copertura del codice aiuta a identificare aree non sufficientemente testate.

```yaml
coverage:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run tests with coverage
      run: npm test -- --coverage
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
```

### 5. Implementare Test come Gate di Qualità

Utilizzare i test come "quality gate" che devono essere superati prima di procedere con il deployment.

```yaml
deploy-staging:
  needs: [unit-tests, integration-tests, e2e-tests, security-scan]
  runs-on: ubuntu-latest
  steps:
    # Deployment steps
```

## Gestione dei Test Falliti

### Notifiche

Implementare notifiche per informare il team quando i test falliscono.

```yaml
on-failure:
  needs: [unit-tests, integration-tests]
  if: ${{ failure() }}
  runs-on: ubuntu-latest
  steps:
    - name: Send Slack notification
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        fields: repo,message,commit,author,action,eventName,workflow
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Retry Automatici

Implementare retry automatici per test flaky può migliorare la stabilità della pipeline.

```yaml
unit-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    - name: Install dependencies
      run: npm ci
    - name: Run unit tests
      uses: nick-invision/retry@v2
      with:
        timeout_minutes: 10
        max_attempts: 3
        command: npm test
```

## Conclusione

L'integrazione di test completi nelle pipeline CI/CD è essenziale per garantire la qualità e l'affidabilità delle applicazioni Node.js. Implementando una strategia di testing che copra test unitari, di integrazione, E2E, analisi statica e test di sicurezza, i team possono identificare e risolvere i problemi prima che raggiungano la produzione.

Nel prossimo capitolo, esploreremo le strategie per il deployment automatizzato, completando così il ciclo CI/CD per applicazioni Node.js.