# Strumenti per CI/CD

## Panoramica degli Strumenti CI/CD

La scelta degli strumenti giusti è fondamentale per implementare con successo una pipeline CI/CD. In questo capitolo, esploreremo i principali strumenti disponibili per l'integrazione continua e il deployment continuo, con particolare attenzione alle soluzioni più adatte per applicazioni Node.js.

## Sistemi di CI/CD Popolari

### GitHub Actions

GitHub Actions è uno strumento di automazione integrato direttamente nella piattaforma GitHub, che consente di creare workflow personalizzati per automatizzare il ciclo di vita dello sviluppo software.

**Caratteristiche principali:**
- Integrazione nativa con repository GitHub
- Configurazione basata su file YAML
- Ampia marketplace di azioni predefinite
- Esecuzione in container isolati
- Supporto per matrici di build (test su diverse versioni di Node.js)

**Esempio di configurazione per un'applicazione Node.js:**

```yaml
# .github/workflows/node.js.yml
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
    - run: npm run build --if-present
    - run: npm test
```

### Jenkins

Jenkins è un server di automazione open-source che offre centinaia di plugin per supportare la costruzione, il deployment e l'automazione di qualsiasi progetto.

**Caratteristiche principali:**
- Altamente personalizzabile tramite plugin
- Supporto per pipeline come codice (Jenkinsfile)
- Distribuzione on-premise o cloud
- Ampia comunità e documentazione
- Integrazione con praticamente qualsiasi strumento di sviluppo

**Esempio di Jenkinsfile per un'applicazione Node.js:**

```groovy
// Jenkinsfile
pipeline {
    agent {
        docker {
            image 'node:16-alpine'
        }
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Deploy') {
            steps {
                sh 'npm run build'
                // Comandi di deployment
            }
        }
    }
}
```

### CircleCI

CircleCI è una piattaforma CI/CD cloud-based che automatizza il processo di build, test e deployment.

**Caratteristiche principali:**
- Configurazione semplice basata su YAML
- Caching intelligente delle dipendenze
- Parallelizzazione dei test
- Supporto per Docker e VM
- Integrazioni con cloud provider e strumenti di deployment

**Esempio di configurazione per un'applicazione Node.js:**

```yaml
# .circleci/config.yml
version: 2.1
jobs:
  build:
    docker:
      - image: cimg/node:16.13
    steps:
      - checkout
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package.json" }}
            - v1-dependencies-
      - run: npm install
      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
      - run: npm test
```

### GitLab CI/CD

GitLab CI/CD è una parte integrata della piattaforma GitLab che fornisce un sistema completo per automatizzare build, test e deployment.

**Caratteristiche principali:**
- Integrazione nativa con GitLab
- Pipeline multi-stage
- Supporto per container e Kubernetes
- Ambienti di deployment integrati
- Auto DevOps per configurazione automatica

**Esempio di configurazione per un'applicazione Node.js:**

```yaml
# .gitlab-ci.yml
image: node:16

cache:
  paths:
    - node_modules/

stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - npm install

test:
  stage: test
  script:
    - npm test

deploy:
  stage: deploy
  script:
    - npm run build
    # Comandi di deployment
  only:
    - main
```

### Travis CI

Travis CI è un servizio di integrazione continua ospitato che si integra con GitHub e BitBucket.

**Caratteristiche principali:**
- Configurazione semplice
- Supporto per build matriciali
- Ambienti di test pre-configurati
- Deployment automatico verso vari provider
- Ottimo per progetti open-source

**Esempio di configurazione per un'applicazione Node.js:**

```yaml
# .travis.yml
language: node_js
node_js:
  - 14
  - 16
  - 18

cache: npm

install:
  - npm ci

script:
  - npm test
  - npm run build
```

## Strumenti di Deployment

### Heroku

Heroku è una piattaforma cloud che consente di costruire, eseguire e gestire applicazioni. È particolarmente popolare per il deployment di applicazioni Node.js.

**Caratteristiche per CI/CD:**
- Integrazione con GitHub per deployment automatico
- Pipeline di review app, staging e produzione
- Rollback semplice
- Add-on per database e altri servizi

### Netlify

Netlify è una piattaforma di hosting per siti statici e applicazioni JAMstack, ma supporta anche funzioni serverless basate su Node.js.

**Caratteristiche per CI/CD:**
- Deployment automatico da Git
- Preview di deployment per ogni pull request
- Rollback con un clic
- Funzioni serverless integrate

### Vercel

Vercel è una piattaforma cloud ottimizzata per applicazioni frontend, ma eccellente anche per API Node.js e applicazioni serverless.

**Caratteristiche per CI/CD:**
- Deployment automatico da Git
- Preview per ogni commit
- Integrazione con framework come Next.js
- Configurazione zero per molti progetti

### AWS CodePipeline

AWS CodePipeline è un servizio di delivery continua che automatizza le fasi di rilascio per aggiornamenti rapidi e affidabili delle applicazioni.

**Caratteristiche per CI/CD:**
- Integrazione con altri servizi AWS
- Pipeline completamente personalizzabili
- Supporto per approvazioni manuali
- Integrazione con strumenti di terze parti

## Strumenti di Containerizzazione e Orchestrazione

### Docker

Docker è una piattaforma che consente di sviluppare, spedire ed eseguire applicazioni in container, garantendo consistenza tra gli ambienti.

**Ruolo in CI/CD:**
- Ambiente di build consistente
- Packaging standardizzato delle applicazioni
- Isolamento delle dipendenze
- Base per deployment in vari ambienti

**Esempio di Dockerfile per un'applicazione Node.js:**

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

### Kubernetes

Kubernetes è un sistema di orchestrazione di container che automatizza il deployment, la scalabilità e la gestione delle applicazioni containerizzate.

**Ruolo in CI/CD:**
- Deployment automatizzato di container
- Scalabilità automatica
- Rollout e rollback controllati
- Gestione di configurazioni e segreti

## Strumenti di Qualità del Codice

### ESLint

ESLint è uno strumento di analisi statica per identificare pattern problematici nel codice JavaScript.

**Integrazione in CI/CD:**
- Verifica della qualità del codice ad ogni commit
- Applicazione di standard di codifica
- Prevenzione di errori comuni

### Jest

Jest è un framework di testing JavaScript con focus sulla semplicità, particolarmente adatto per applicazioni Node.js e React.

**Integrazione in CI/CD:**
- Esecuzione automatica di test unitari
- Generazione di report di copertura
- Identificazione di regressioni

### SonarQube

SonarQube è una piattaforma per l'ispezione continua della qualità del codice che esegue revisioni automatiche con analisi statica del codice.

**Integrazione in CI/CD:**
- Analisi approfondita della qualità del codice
- Rilevamento di vulnerabilità di sicurezza
- Monitoraggio del debito tecnico

## Conclusione

La scelta degli strumenti CI/CD dipende da vari fattori, tra cui le dimensioni del team, il budget, l'infrastruttura esistente e le specifiche esigenze del progetto. Per le applicazioni Node.js, tutti gli strumenti menzionati offrono un buon supporto, ma alcuni potrebbero essere più adatti in base al contesto specifico.

Nel prossimo capitolo, esploreremo come progettare e implementare pipeline CI/CD efficaci utilizzando questi strumenti, con particolare attenzione alle best practices per applicazioni Node.js.