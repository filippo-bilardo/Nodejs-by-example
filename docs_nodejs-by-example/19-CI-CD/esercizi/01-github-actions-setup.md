# Configurazione di GitHub Actions per un'Applicazione Node.js

## Obiettivo
In questo esercizio, imparerai a configurare una pipeline CI/CD di base utilizzando GitHub Actions per un'applicazione Node.js. La pipeline eseguirà automaticamente i test e verificherà la qualità del codice ogni volta che viene effettuato un push o una pull request sul repository.

## Prerequisiti
- Un account GitHub
- Conoscenza di base di Git
- Un'applicazione Node.js esistente o il progetto di esempio fornito

## Passaggi

### 1. Preparazione del Repository

1. Crea un nuovo repository su GitHub o utilizza un repository esistente con un'applicazione Node.js.

2. Clona il repository in locale:
   ```bash
   git clone https://github.com/username/nome-repository.git
   cd nome-repository
   ```

3. Se stai partendo da zero, inizializza un nuovo progetto Node.js:
   ```bash
   npm init -y
   ```

4. Installa alcune dipendenze di base per il testing:
   ```bash
   npm install --save-dev jest eslint
   ```

5. Aggiungi gli script di test al file `package.json`:
   ```json
   "scripts": {
     "test": "jest",
     "lint": "eslint ."
   }
   ```

### 2. Creazione di un Test di Esempio

1. Crea una cartella `src` e un file `app.js` con una funzione semplice:
   ```javascript
   // src/app.js
   function sum(a, b) {
     return a + b;
   }
   
   module.exports = { sum };
   ```

2. Crea una cartella `tests` e un file `app.test.js` con un test per la funzione:
   ```javascript
   // tests/app.test.js
   const { sum } = require('../src/app');
   
   test('somma 1 + 2 uguale 3', () => {
     expect(sum(1, 2)).toBe(3);
   });
   ```

### 3. Configurazione di GitHub Actions

1. Crea una cartella `.github/workflows` nella radice del progetto:
   ```bash
   mkdir -p .github/workflows
   ```

2. Crea un file `ci.yml` all'interno della cartella workflows:
   ```yaml
   # .github/workflows/ci.yml
   name: Node.js CI
   
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   
   jobs:
     build:
       runs-on: ubuntu-latest
   
       strategy:
         matrix:
           node-version: [14.x, 16.x, 18.x]
   
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
   ```

### 4. Commit e Push delle Modifiche

1. Aggiungi e committa i file:
   ```bash
   git add .
   git commit -m "Aggiungi configurazione CI con GitHub Actions"
   ```

2. Pusha le modifiche al repository remoto:
   ```bash
   git push origin main
   ```

### 5. Verifica della Pipeline CI

1. Vai alla sezione "Actions" del tuo repository su GitHub.
2. Dovresti vedere il workflow in esecuzione o completato.
3. Verifica che tutti i job siano stati completati con successo.

### 6. Aggiunta di un Badge di Stato

1. Nella sezione Actions del tuo repository, seleziona il workflow "Node.js CI".
2. Clicca sui tre puntini (...) in alto a destra e seleziona "Create status badge".
3. Copia il codice markdown e aggiungilo al tuo README.md:
   ```markdown
   # Nome del Progetto
   
   ![CI Status](https://github.com/username/nome-repository/workflows/Node.js%20CI/badge.svg)
   ```

## Sfide Aggiuntive

1. **Aggiunta di Coverage dei Test**:
   - Configura Jest per generare report di coverage.
   - Modifica il workflow per pubblicare i report di coverage.

2. **Integrazione con Servizi di Code Quality**:
   - Integra la pipeline con servizi come SonarCloud o Codacy.

3. **Notifiche**:
   - Configura notifiche via email o Slack quando la pipeline fallisce.

## Conclusione

Hai configurato con successo una pipeline CI di base utilizzando GitHub Actions. Questa pipeline eseguirà automaticamente i test e verificherà la qualità del codice ogni volta che viene effettuato un push o una pull request sul repository, aiutandoti a mantenere alta la qualità del codice e a identificare rapidamente eventuali problemi.

Nei prossimi esercizi, esploreremo come estendere questa pipeline per includere il deployment automatico e altre funzionalità avanzate.