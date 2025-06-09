# Pipeline di CI/CD

## Cos'è una Pipeline CI/CD?

Una pipeline CI/CD è una serie di processi automatizzati che consentono agli sviluppatori di integrare e distribuire il codice in modo efficiente e affidabile. Rappresenta il flusso completo che il codice segue dal commit iniziale fino al deployment in produzione.

## Anatomia di una Pipeline CI/CD

Una pipeline CI/CD completa è tipicamente composta da diverse fasi, ciascuna con uno scopo specifico:

### 1. Fase di Source (Origine)

Questa fase iniziale coinvolge il recupero del codice sorgente dal repository di controllo versione (come Git).

**Attività tipiche:**
- Checkout del codice
- Filtraggio dei file modificati
- Attivazione della pipeline in base a eventi (push, pull request, tag, ecc.)

### 2. Fase di Build

In questa fase, il codice sorgente viene trasformato in un artefatto eseguibile.

**Attività tipiche per Node.js:**
- Installazione delle dipendenze (`npm install` o `npm ci`)
- Compilazione di TypeScript o altri linguaggi che richiedono transpilazione
- Bundling di asset (webpack, rollup, ecc.)
- Generazione di file statici

```yaml
# Esempio di fase di build in GitHub Actions
build:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Build
      run: npm run build
    - name: Archive build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build
        path: dist/
```

### 3. Fase di Test

Questa fase verifica che il codice funzioni correttamente e soddisfi i requisiti di qualità.

**Tipi di test comuni:**
- Test unitari
- Test di integrazione
- Test end-to-end
- Analisi statica del codice
- Controlli di sicurezza

```yaml
# Esempio di fase di test in GitHub Actions
test:
  needs: build
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run linting
      run: npm run lint
    - name: Run unit tests
      run: npm test
    - name: Run integration tests
      run: npm run test:integration
```

### 4. Fase di Staging/Pre-produzione

In questa fase, l'applicazione viene distribuita in un ambiente simile alla produzione per ulteriori test.

**Attività tipiche:**
- Deployment in ambiente di staging
- Test di accettazione
- Test di performance
- Validazione manuale (se necessario)

```yaml
# Esempio di deployment in staging con GitHub Actions
deploy-staging:
  needs: test
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build
        path: dist/
    - name: Deploy to staging
      uses: some-deployment-action@v1
      with:
        environment: staging
        api-key: ${{ secrets.STAGING_API_KEY }}
```

### 5. Fase di Produzione

L'ultima fase, in cui l'applicazione viene distribuita nell'ambiente di produzione.

**Attività tipiche:**
- Deployment in produzione
- Monitoraggio post-deployment
- Rollback automatico in caso di problemi

```yaml
# Esempio di deployment in produzione con GitHub Actions
deploy-production:
  needs: deploy-staging
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  environment: production
  steps:
    - uses: actions/checkout@v3
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build
        path: dist/
    - name: Deploy to production
      uses: some-deployment-action@v1
      with:
        environment: production
        api-key: ${{ secrets.PRODUCTION_API_KEY }}
```

## Strategie di Branching per CI/CD

La strategia di branching adottata influenza significativamente il funzionamento della pipeline CI/CD.

### GitFlow

Un modello di branching che utilizza branch dedicati per feature, release e hotfix.

**Configurazione CI/CD per GitFlow:**
- CI su tutti i branch
- CD in ambiente di test per feature branch
- CD in staging per release branch
- CD in produzione solo per main/master e hotfix

### Trunk-Based Development

Un approccio in cui gli sviluppatori integrano frequentemente nel branch principale (trunk).

**Configurazione CI/CD per Trunk-Based:**
- CI su tutti i branch e pull request
- CD automatico in test/staging per ogni commit sul trunk
- CD in produzione dopo approvazione manuale o automaticamente

## Best Practices per Pipeline CI/CD

### 1. Mantenere le Pipeline Veloci

- Parallelizzare i test quando possibile
- Implementare caching efficace delle dipendenze
- Utilizzare build incrementali

```yaml
# Esempio di caching in GitHub Actions
steps:
  - uses: actions/checkout@v3
  - name: Cache node modules
    uses: actions/cache@v3
    with:
      path: ~/.npm
      key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      restore-keys: |
        ${{ runner.os }}-node-
```

### 2. Fail Fast

- Eseguire prima i test più veloci
- Interrompere la pipeline al primo errore
- Fornire feedback rapido agli sviluppatori

### 3. Idempotenza

- Assicurarsi che le pipeline possano essere eseguite più volte con lo stesso risultato
- Evitare stati condivisi tra job
- Utilizzare versioni fisse per le dipendenze

### 4. Sicurezza

- Proteggere i segreti e le credenziali
- Eseguire scansioni di sicurezza
- Implementare il principio del privilegio minimo

```yaml
# Esempio di scansione di sicurezza in GitHub Actions
security-scan:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Run npm audit
      run: npm audit --audit-level=high
    - name: Run SAST scan
      uses: some-security-scanner-action@v1
```

### 5. Monitoraggio e Logging

- Registrare i risultati di ogni fase
- Monitorare i tempi di esecuzione
- Implementare notifiche per fallimenti

## Implementazione di Pipeline CI/CD per Applicazioni Node.js

### Esempio Completo con GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Archive build
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Unit tests
        run: npm test
      - name: Integration tests
        run: npm run test:integration

  deploy-staging:
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    needs: test
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v3
      - name: Download build
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist/
      - name: Deploy to staging
        run: |
          # Deploy commands here
          echo "Deploying to staging..."

  deploy-production:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: [test, deploy-staging]
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - uses: actions/checkout@v3
      - name: Download build
        uses: actions/download-artifact@v3
        with:
          name: build
          path: dist/
      - name: Deploy to production
        run: |
          # Deploy commands here
          echo "Deploying to production..."
```

### Esempio con Heroku

```yaml
# .github/workflows/heroku.yml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Test
        run: npm test
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "your-app-name"
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

## Conclusione

Le pipeline CI/CD sono fondamentali per lo sviluppo moderno di software, consentendo ai team di rilasciare codice di qualità più frequentemente e con maggiore affidabilità. Per le applicazioni Node.js, l'implementazione di pipeline CI/CD efficaci può significativamente migliorare la produttività del team e la qualità del prodotto finale.

Nel prossimo capitolo, approfondiremo come integrare efficacemente i test nelle pipeline CI/CD, garantendo che ogni modifica al codice mantenga gli standard di qualità richiesti.