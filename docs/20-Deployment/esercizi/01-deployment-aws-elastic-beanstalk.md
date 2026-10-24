# Deployment di un'Applicazione Node.js su AWS Elastic Beanstalk

## Obiettivo
In questo esercizio, imparerai a deployare un'applicazione Node.js su AWS Elastic Beanstalk, una piattaforma PaaS (Platform as a Service) che semplifica il deployment e la gestione di applicazioni web.

## Prerequisiti
- Un account AWS (è possibile utilizzare il tier gratuito)
- AWS CLI installato e configurato
- Un'applicazione Node.js funzionante
- Git installato
- Conoscenza di base di Node.js e npm

## Passaggi

### 1. Preparazione dell'Applicazione

1. Assicurati che la tua applicazione Node.js sia pronta per il deployment:
   
   a. Verifica che il file `package.json` contenga gli script corretti:
   ```json
   {
     "name": "nodejs-eb-app",
     "version": "1.0.0",
     "description": "Applicazione Node.js per AWS Elastic Beanstalk",
     "main": "app.js",
     "scripts": {
       "start": "node app.js",
       "test": "echo \"Error: no test specified\" && exit 1"
     },
     "engines": {
       "node": "16.x"
     },
     "dependencies": {
       "express": "^4.18.2"
     }
   }
   ```

   b. Assicurati che l'applicazione ascolti sulla porta fornita dall'ambiente:
   ```javascript
   // app.js
   const express = require('express');
   const app = express();
   const port = process.env.PORT || 3000;

   app.get('/', (req, res) => {
     res.send('Hello from AWS Elastic Beanstalk!');
   });

   app.listen(port, () => {
     console.log(`Server in ascolto sulla porta ${port}`);
   });
   ```

### 2. Installazione e Configurazione dell'EB CLI

1. Installa l'Elastic Beanstalk CLI:
   ```bash
   # Per Windows (con pip)
   pip install awsebcli

   # Per macOS (con Homebrew)
   brew install awsebcli

   # Per Linux
   pip install awsebcli
   ```

2. Verifica l'installazione:
   ```bash
   eb --version
   ```

### 3. Inizializzazione del Progetto per Elastic Beanstalk

1. Naviga nella directory del tuo progetto:
   ```bash
   cd path/to/your/project
   ```

2. Inizializza il progetto per Elastic Beanstalk:
   ```bash
   eb init
   ```

3. Segui le istruzioni interattive:
   - Seleziona la regione AWS (es. eu-west-1 per l'Europa)
   - Crea una nuova applicazione o seleziona un'applicazione esistente
   - Seleziona la piattaforma Node.js
   - Seleziona la versione di Node.js compatibile con la tua applicazione
   - Configura le impostazioni SSH (opzionale)

### 4. Creazione dell'Ambiente Elastic Beanstalk

1. Crea un nuovo ambiente:
   ```bash
   eb create nodejs-env
   ```

2. Segui le istruzioni interattive o specifica i parametri direttamente:
   ```bash
   eb create nodejs-env --instance_type t2.micro --platform node.js --region eu-west-1
   ```

3. Attendi che l'ambiente venga creato (può richiedere alcuni minuti).

### 5. Deployment dell'Applicazione

1. Una volta creato l'ambiente, puoi deployare l'applicazione con:
   ```bash
   eb deploy
   ```

2. Per aprire l'applicazione nel browser:
   ```bash
   eb open
   ```

### 6. Monitoraggio e Gestione

1. Controlla lo stato dell'ambiente:
   ```bash
   eb status
   ```

2. Visualizza i log dell'applicazione:
   ```bash
   eb logs
   ```

3. Accedi alla console AWS Elastic Beanstalk per monitorare metriche, configurare allarmi e gestire l'ambiente.

### 7. Configurazione Avanzata

1. Crea un file `.ebextensions` per configurazioni personalizzate:
   
   Crea una directory `.ebextensions` nella radice del progetto e aggiungi un file di configurazione:
   ```yaml
   # .ebextensions/nodecommand.config
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "npm start"
   ```

2. Configura variabili d'ambiente:
   ```bash
   eb setenv NODE_ENV=production DB_HOST=mydbhost.example.com
   ```

### 8. Pulizia delle Risorse

1. Quando hai finito con l'esercizio, termina l'ambiente per evitare costi aggiuntivi:
   ```bash
   eb terminate nodejs-env
   ```

## Sfide Aggiuntive

1. **Configurazione di Auto Scaling**:
   - Configura regole di auto scaling basate sul carico della CPU o sul traffico di rete
   - Testa il comportamento dell'auto scaling con un tool di stress test

2. **Implementazione di un Database RDS**:
   - Aggiungi un database Amazon RDS alla tua applicazione
   - Configura la connessione sicura tra l'applicazione e il database

3. **Configurazione di un Dominio Personalizzato**:
   - Registra un dominio con Route 53 o utilizza un dominio esistente
   - Configura HTTPS con un certificato SSL/TLS di AWS Certificate Manager

## Conclusione

Hai deployato con successo un'applicazione Node.js su AWS Elastic Beanstalk. Questa piattaforma offre numerosi vantaggi, tra cui:

- Gestione automatica dell'infrastruttura sottostante
- Scalabilità automatica in base al carico
- Monitoraggio integrato e gestione dei log
- Facile rollback a versioni precedenti

Queste caratteristiche ti permettono di concentrarti sullo sviluppo dell'applicazione piuttosto che sulla gestione dell'infrastruttura, rendendo AWS Elastic Beanstalk una scelta eccellente per il deployment di applicazioni Node.js in produzione.