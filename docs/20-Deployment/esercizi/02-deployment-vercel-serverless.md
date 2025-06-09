# Deployment di un'Applicazione Node.js Serverless su Vercel

## Obiettivo
In questo esercizio, imparerai a deployare un'applicazione Node.js serverless su Vercel, una piattaforma di deployment che offre funzionalità serverless e ottimizzazioni per applicazioni frontend e backend.

## Prerequisiti
- Un account GitHub
- Un account Vercel (gratuito)
- Un'applicazione Node.js funzionante
- Conoscenza di base di Node.js, npm e Git

## Passaggi

### 1. Preparazione dell'Applicazione

1. Assicurati che la tua applicazione Node.js sia pronta per il deployment serverless:
   
   a. Crea una directory `api` nella radice del progetto per le funzioni serverless:
   ```bash
   mkdir api
   ```
   
   b. Crea una funzione serverless di esempio:
   ```javascript
   // api/hello.js
   module.exports = (req, res) => {
     const { name = 'World' } = req.query;
     res.status(200).send(`Hello ${name}!`);
   };
   ```

   c. Se stai utilizzando un framework come Next.js, assicurati che il file `package.json` contenga gli script corretti:
   ```json
   {
     "name": "vercel-serverless-app",
     "version": "1.0.0",
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start"
     },
     "dependencies": {
       "next": "^12.0.0",
       "react": "^17.0.2",
       "react-dom": "^17.0.2"
     }
   }
   ```

### 2. Configurazione del Progetto per Vercel

1. Crea un file `vercel.json` nella radice del progetto per configurare il deployment:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "api/**/*.js", "use": "@vercel/node" },
       { "src": "package.json", "use": "@vercel/next", "config": { "zeroConfig": true } }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/api/$1" },
       { "src": "/(.*)", "dest": "/$1" }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

   Nota: Questa configurazione è adatta per un'applicazione che utilizza sia funzioni serverless che Next.js. Adattala in base alle tue esigenze specifiche.

### 3. Installazione della CLI di Vercel

1. Installa la CLI di Vercel globalmente:
   ```bash
   npm install -g vercel
   ```

2. Accedi al tuo account Vercel dalla CLI:
   ```bash
   vercel login
   ```

### 4. Deployment dell'Applicazione

1. Per deployare l'applicazione in modalità di sviluppo (preview):
   ```bash
   vercel
   ```

2. Per deployare l'applicazione in produzione:
   ```bash
   vercel --prod
   ```

3. Segui le istruzioni interattive:
   - Conferma la directory del progetto
   - Collega il progetto al tuo account Vercel
   - Configura le impostazioni del progetto (o accetta i valori predefiniti)

### 5. Configurazione del Deployment Continuo

1. Collega il tuo repository GitHub a Vercel:
   - Vai alla dashboard di Vercel (https://vercel.com/dashboard)
   - Crea un nuovo progetto
   - Importa il tuo repository GitHub
   - Configura le impostazioni di build e deployment

2. Una volta configurato, ogni push sul branch principale del repository attiverà automaticamente un nuovo deployment.

### 6. Gestione delle Variabili d'Ambiente

1. Aggiungi variabili d'ambiente tramite la CLI:
   ```bash
   vercel env add MY_SECRET_KEY
   ```

2. Oppure tramite la dashboard di Vercel:
   - Vai alle impostazioni del progetto
   - Seleziona "Environment Variables"
   - Aggiungi le variabili necessarie

### 7. Monitoraggio e Analisi

1. Accedi alla dashboard di Vercel per monitorare:
   - Deployment recenti
   - Metriche di performance
   - Log delle funzioni serverless
   - Utilizzo delle risorse

### 8. Configurazione di un Dominio Personalizzato

1. Aggiungi un dominio personalizzato al tuo progetto:
   ```bash
   vercel domains add myapp.com
   ```

2. Oppure tramite la dashboard di Vercel:
   - Vai alle impostazioni del progetto
   - Seleziona "Domains"
   - Aggiungi il tuo dominio e segui le istruzioni per configurare i record DNS

## Sfide Aggiuntive

1. **Implementazione di Funzioni Serverless Avanzate**:
   - Crea funzioni serverless che interagiscono con un database
   - Implementa l'autenticazione nelle tue funzioni serverless
   - Utilizza middleware per la gestione delle richieste

2. **Ottimizzazione delle Performance**:
   - Configura la cache per le risorse statiche
   - Implementa strategie di pre-rendering per migliorare il SEO
   - Utilizza le Edge Functions di Vercel per ridurre la latenza

3. **Integrazione con Servizi di Terze Parti**:
   - Collega la tua applicazione a servizi come Stripe, MongoDB Atlas o Firebase
   - Implementa notifiche push o email utilizzando servizi come SendGrid

## Conclusione

Hai deployato con successo un'applicazione Node.js serverless su Vercel. Questa piattaforma offre numerosi vantaggi per lo sviluppo moderno di applicazioni web:

- Architettura serverless che scala automaticamente
- Deployment continuo integrato con GitHub
- Rete CDN globale per la distribuzione dei contenuti
- Anteprima automatica per ogni commit
- Configurazione semplice e intuitiva

Queste caratteristiche rendono Vercel una scelta eccellente per il deployment di applicazioni Node.js, specialmente per progetti che beneficiano di un'architettura serverless e di una distribuzione globale dei contenuti.