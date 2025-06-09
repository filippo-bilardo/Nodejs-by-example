# Configurazione di una Pipeline CI/CD Multi-ambiente

## Obiettivo
In questo esercizio, imparerai a configurare una pipeline CI/CD che supporti diversi ambienti (sviluppo, staging e produzione). Questo approccio ti permetterà di testare le modifiche in ambienti isolati prima di rilasciarle in produzione, riducendo il rischio di problemi e migliorando la qualità del software.

## Prerequisiti
- Un repository GitHub con un'applicazione Node.js
- GitHub Actions configurato (vedi esercizio 01)
- Conoscenza di base di Heroku o altra piattaforma di hosting
- Comprensione dei concetti di CI/CD

## Passaggi

### 1. Configurazione degli Ambienti su Heroku

1. Crea tre applicazioni Heroku per i diversi ambienti:
   ```bash
   heroku create nome-app-dev --remote dev
   heroku create nome-app-staging --remote staging
   heroku create nome-app-prod --remote prod
   ```

2. Configura le variabili d'ambiente specifiche per ogni ambiente:
   ```bash
   # Ambiente di sviluppo
   heroku config:set NODE_ENV=development --remote dev
   heroku config:set LOG_LEVEL=debug --remote dev

   # Ambiente di staging
   heroku config:set NODE_ENV=staging --remote staging
   heroku config:set LOG_LEVEL=info --remote staging

   # Ambiente di produzione
   heroku config:set NODE_ENV=production --remote prod
   heroku config:set LOG_LEVEL=error --remote prod
   ```

### 2. Configurazione del Codice per Supportare Più Ambienti

1. Crea un file di configurazione che gestisca le impostazioni per i diversi ambienti:
   ```javascript
   // config/index.js
   const env = process.env.NODE_ENV || 'development';

   const configs = {
     base: {
       env,
       name: 'Multi-Environment App',
       host: process.env.HOST || '0.0.0.0',
       port: process.env.PORT || 3000
     },
     development: {
       database: {
         url: process.env.DEV_DB_URL || 'mongodb://localhost:27017/dev_db'
       },
       logLevel: 'debug'
     },
     staging: {
       database: {
         url: process.env.STAGING_DB_URL || 'mongodb://localhost:27017/staging_db'
       },
       logLevel: 'info'
     },
     production: {
       database: {
         url: process.env.PROD_DB_URL || 'mongodb://localhost:27017/prod_db'
       },
       logLevel: 'error'
     }
   };

   module.exports = { ...configs.base, ...configs[env] };
   ```

2. Utilizza la configurazione nell'applicazione:
   ```javascript
   // app.js
   const express = require('express');
   const config = require('./config');
   const app = express();

   app.get('/', (req, res) => {
     res.send(`Hello from ${config.name} in ${config.env} environment!`);
   });

   app.listen(config.port, config.host, () => {
     console.log(`Server running at http://${config.host}:${config.port}/ in ${config.env} mode`);
   });
   ```

### 3. Configurazione dei Segreti su GitHub

1. Vai al tuo repository su GitHub.

2. Vai su "Settings" > "Secrets" > "Actions".

3. Aggiungi i segreti per ogni ambiente:
   - `HEROKU_API_KEY`: La tua API key di Heroku
   - `HEROKU_APP_NAME_DEV`: Il nome della tua app Heroku di sviluppo
   - `HEROKU_APP_NAME_STAGING`: Il nome della tua app Heroku di staging
   - `HEROKU_APP_NAME_PROD`: Il nome della tua app Heroku di produzione

### 4. Creazione del Workflow GitHub Actions per Multi-ambiente

1. Crea un file `.github/workflows/multi-env-ci-cd.yml`:
   ```yaml
   name: Multi-Environment CI/CD

   on:
     push:
       branches: [develop, staging, main]
     pull_request:
       branches: [develop, staging, main]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Use Node.js 16.x
           uses: actions/setup-node@v3
           with:
             node-version: 16.x
             cache: 'npm'
         - run: npm ci
         - run: npm test

     deploy-development:
       needs: test
       if: github.ref == 'refs/heads/develop'
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: akhileshns/heroku-deploy@v3.12.12
           with:
             heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
             heroku_app_name: ${{ secrets.HEROKU_APP_NAME_DEV }}
             heroku_email: ${{ secrets.HEROKU_EMAIL }}

     deploy-staging:
       needs: test
       if: github.ref == 'refs/heads/staging'
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: akhileshns/heroku-deploy@v3.12.12
           with:
             heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
             heroku_app_name: ${{ secrets.HEROKU_APP_NAME_STAGING }}
             heroku_email: ${{ secrets.HEROKU_EMAIL }}

     deploy-production:
       needs: test
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: akhileshns/heroku-deploy@v3.12.12
           with:
             heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
             heroku_app_name: ${{ secrets.HEROKU_APP_NAME_PROD }}
             heroku_email: ${{ secrets.HEROKU_EMAIL }}
   ```

### 5. Configurazione dei Branch per il Workflow Git

1. Crea una strategia di branching che rifletta gli ambienti:
   - `develop`: Per lo sviluppo continuo e l'integrazione
   - `staging`: Per i test pre-produzione
   - `main`: Per la produzione

2. Configura le regole di protezione dei branch su GitHub:
   - Vai su "Settings" > "Branches" > "Add rule"
   - Proteggi i branch `staging` e `main` richiedendo pull request e approvazioni

### 6. Test del Workflow Multi-ambiente

1. Crea una nuova feature branch dal branch `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/nuova-funzionalita
   ```

2. Apporta modifiche e committa:
   ```bash
   # Modifica i file...
   git add .
   git commit -m "Aggiunta nuova funzionalità"
   git push -u origin feature/nuova-funzionalita
   ```

3. Crea una pull request verso `develop`.

4. Dopo l'approvazione e il merge, verifica che l'app venga deployata nell'ambiente di sviluppo.

5. Quando sei pronto per testare in staging:
   ```bash
   git checkout staging
   git pull
   git merge develop
   git push
   ```

6. Verifica che l'app venga deployata nell'ambiente di staging.

7. Quando sei pronto per il rilascio in produzione:
   ```bash
   git checkout main
   git pull
   git merge staging
   git push
   ```

8. Verifica che l'app venga deployata nell'ambiente di produzione.

## Esercizi Aggiuntivi

1. **Aggiungi Test di Smoke**: Configura test di smoke che vengano eseguiti automaticamente dopo ogni deployment per verificare che le funzionalità di base funzionino correttamente.

2. **Implementa Rollback Automatico**: Configura la pipeline per eseguire un rollback automatico se i test di smoke falliscono dopo il deployment.

3. **Aggiungi Approvazione Manuale**: Modifica il workflow per richiedere un'approvazione manuale prima del deployment in produzione.

4. **Implementa Feature Flags**: Utilizza feature flags per abilitare o disabilitare funzionalità in ambienti specifici senza dover modificare il codice.

## Risorse Aggiuntive

- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
- [Heroku Pipeline](https://devcenter.heroku.com/articles/pipelines)
- [Strategie di Branching Git](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Feature Flags con LaunchDarkly](https://launchdarkly.com/)

## Conclusione

In questo esercizio, hai imparato a configurare una pipeline CI/CD multi-ambiente che supporta ambienti di sviluppo, staging e produzione. Questo approccio ti permette di testare le modifiche in ambienti isolati prima di rilasciarle in produzione, riducendo il rischio di problemi e migliorando la qualità del software.

Una pipeline multi-ambiente è particolarmente utile per team di sviluppo più grandi e per applicazioni critiche dove è importante garantire la stabilità e l'affidabilità del software in produzione.

Nel prossimo esercizio, esploreremo come aggiungere monitoraggio e notifiche alla pipeline CI/CD per essere informati tempestivamente in caso di problemi.