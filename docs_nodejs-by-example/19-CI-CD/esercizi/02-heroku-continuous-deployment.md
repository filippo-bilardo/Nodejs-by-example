# Configurazione del Deployment Continuo con Heroku per un'Applicazione Node.js

## Obiettivo
In questo esercizio, imparerai a configurare un sistema di deployment continuo (CD) utilizzando Heroku e GitHub Actions per un'applicazione Node.js. Questo permetterà di distribuire automaticamente l'applicazione su Heroku ogni volta che viene effettuato un push sul branch principale del repository, dopo che tutti i test sono stati superati con successo.

## Prerequisiti
- Un account GitHub
- Un account Heroku (gratuito)
- Un'applicazione Node.js funzionante con test configurati
- Conoscenza di base di Git e GitHub Actions

## Passaggi

### 1. Preparazione dell'Applicazione per Heroku

1. Assicurati che la tua applicazione Node.js sia pronta per Heroku:
   
   a. Crea un file `Procfile` nella radice del progetto:
   ```
   web: node server.js
   ```
   
   b. Assicurati che il server ascolti sulla porta fornita dall'ambiente:
   ```javascript
   // server.js
   const express = require('express');
   const app = express();
   const port = process.env.PORT || 3000;
   
   app.get('/', (req, res) => {
     res.send('Hello World!');
   });
   
   app.listen(port, () => {
     console.log(`Server in ascolto sulla porta ${port}`);
   });
   ```
   
   c. Aggiorna il file `package.json` per specificare la versione di Node.js:
   ```json
   "engines": {
     "node": "16.x"
   }
   ```

### 2. Configurazione di Heroku

1. Installa l'Heroku CLI (se non l'hai già fatto):
   ```bash
   # Per Windows (con Chocolatey)
   choco install heroku-cli
   
   # Per macOS (con Homebrew)
   brew tap heroku/brew && brew install heroku
   
   # Per Linux
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. Accedi a Heroku dalla CLI:
   ```bash
   heroku login
   ```

3. Crea una nuova applicazione Heroku:
   ```bash
   heroku create nome-app
   ```

4. Ottieni la tua API key di Heroku (necessaria per GitHub Actions):
   ```bash
   heroku authorizations:create
   ```
   Salva il token generato, lo utilizzerai in seguito.

### 3. Configurazione dei Segreti su GitHub

1. Vai al tuo repository su GitHub.

2. Vai su "Settings" > "Secrets" > "Actions".

3. Aggiungi un nuovo segreto:
   - Nome: `HEROKU_API_KEY`
   - Valore: [il token che hai generato nel passaggio precedente]

4. Aggiungi un altro segreto:
   - Nome: `HEROKU_APP_NAME`
   - Valore: [il nome della tua app Heroku]

### 4. Creazione del Workflow di GitHub Actions per il CD

1. Crea o modifica il file `.github/workflows/ci-cd.yml`:
   ```yaml
   name: Node.js CI/CD
   
   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]
   
   jobs:
     build-and-test:
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
     
     deploy:
       needs: build-and-test
       if: github.ref == 'refs/heads/main' && github.event_name == 'push'
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v3
       - name: Deploy to Heroku
         uses: akhileshns/heroku-deploy@v3.12.12
         with:
           heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
           heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
           heroku_email: ${{ github.actor }}@users.noreply.github.com
   ```

   Questo workflow fa due cose:
   - Esegue i test su diverse versioni di Node.js
   - Se i test passano e si tratta di un push sul branch main, esegue il deployment su Heroku

### 5. Commit e Push delle Modifiche

1. Aggiungi e committa i file:
   ```bash
   git add .
   git commit -m "Aggiungi configurazione CI/CD con GitHub Actions e Heroku"
   ```

2. Pusha le modifiche al repository remoto:
   ```bash
   git push origin main
   ```

### 6. Verifica del Deployment

1. Vai alla sezione "Actions" del tuo repository su GitHub.
2. Dovresti vedere il workflow in esecuzione o completato.
3. Verifica che tutti i job siano stati completati con successo.
4. Visita la tua app su Heroku (https://nome-app.herokuapp.com) per confermare che il deployment sia avvenuto correttamente.

## Sfide Aggiuntive

1. **Configurazione di Ambienti di Staging e Produzione**:
   - Crea due app Heroku separate per staging e produzione.
   - Configura il workflow per fare il deployment su staging per tutti i push su main.
   - Aggiungi un trigger manuale per promuovere da staging a produzione.

2. **Implementazione di Deployment Blu-Verde**:
   - Configura due app Heroku come ambienti "blu" e "verde".
   - Modifica il workflow per alternare i deployment tra i due ambienti.
   - Implementa uno script per reindirizzare il traffico dopo i test di verifica.

3. **Notifiche di Deployment**:
   - Configura notifiche Slack o email per i deployment riusciti o falliti.
   - Aggiungi un passaggio per generare e inviare un changelog delle modifiche deployate.

## Conclusione

Hai configurato con successo un sistema di deployment continuo per la tua applicazione Node.js utilizzando GitHub Actions e Heroku. Questo processo automatizzato ti permette di distribuire rapidamente nuove funzionalità e correzioni di bug, mantenendo al contempo l'integrità dell'applicazione grazie ai test automatici.

Questo approccio CI/CD completo (integrazione continua + deployment continuo) rappresenta una best practice nello sviluppo software moderno, consentendo cicli di sviluppo più rapidi e affidabili.