# Sicurezza nelle Pipeline CI/CD

## Introduzione alla Sicurezza nelle Pipeline CI/CD

Le pipeline CI/CD sono diventate un componente fondamentale nello sviluppo moderno del software, ma possono anche introdurre rischi di sicurezza significativi se non configurate correttamente. Questo capitolo esplora le best practices e le tecniche per implementare la sicurezza nelle pipeline CI/CD.

## Rischi di Sicurezza nelle Pipeline CI/CD

### 1. Accesso non Autorizzato

Le pipeline CI/CD spesso hanno accesso privilegiato a risorse critiche come repository di codice, ambienti di produzione e credenziali.

**Rischi:**
- Accesso non autorizzato alle credenziali
- Manipolazione del codice durante il processo di build
- Deployment di codice malevolo in produzione

### 2. Gestione dei Segreti

Le pipeline CI/CD necessitano di accedere a vari segreti (API key, password, certificati) per funzionare correttamente.

**Rischi:**
- Esposizione di segreti nei log
- Archiviazione non sicura delle credenziali
- Condivisione di segreti tra ambienti

### 3. Dipendenze Vulnerabili

Le applicazioni moderne dipendono da numerose librerie e framework di terze parti che possono contenere vulnerabilità.

**Rischi:**
- Introduzione di vulnerabilità note attraverso dipendenze obsolete
- Supply chain attacks attraverso pacchetti compromessi

### 4. Configurazione Errata

Una configurazione errata delle pipeline può portare a problemi di sicurezza significativi.

**Rischi:**
- Esecuzione di codice arbitrario nei runner CI/CD
- Accesso eccessivo agli ambienti di produzione
- Mancanza di separazione tra ambienti

## Best Practices di Sicurezza per CI/CD

### 1. Gestione Sicura dei Segreti

```yaml
# Esempio di utilizzo di segreti in GitHub Actions
name: Deploy Application

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1
      
      - name: Deploy to production
        run: npm run deploy
```

**Best Practices:**
- Utilizzare i meccanismi di gestione dei segreti forniti dalla piattaforma CI/CD
- Limitare l'accesso ai segreti solo ai job che ne hanno effettivamente bisogno
- Ruotare regolarmente le credenziali
- Utilizzare segreti con ambito limitato e permessi minimi necessari

### 2. Scansione del Codice e delle Dipendenze

```yaml
# Esempio di scansione delle dipendenze con GitHub Actions
name: Security Scan

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run SAST scan
        run: npm run lint
      
      - name: Run dependency scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Best Practices:**
- Implementare Static Application Security Testing (SAST) per identificare vulnerabilità nel codice
- Utilizzare Software Composition Analysis (SCA) per scansionare le dipendenze
- Bloccare il merge o il deployment se vengono rilevate vulnerabilità critiche
- Automatizzare gli aggiornamenti delle dipendenze sicure

### 3. Principio del Privilegio Minimo

**Best Practices:**
- Assegnare alle pipeline solo i permessi minimi necessari
- Utilizzare account di servizio dedicati con permessi limitati
- Separare le credenziali per ambienti diversi (sviluppo, staging, produzione)
- Implementare approvazioni manuali per deployment critici

### 4. Sicurezza dell'Infrastruttura CI/CD

**Best Practices:**
- Mantenere aggiornati i runner e gli agenti CI/CD
- Isolare i runner in ambienti sicuri
- Implementare il network segmentation per limitare l'accesso
- Monitorare e loggare tutte le attività nelle pipeline

### 5. Firma del Codice e Verifica dell'Integrità

```bash
# Esempio di firma di commit con Git
git config --global user.signingkey <YOUR_GPG_KEY_ID>
git config --global commit.gpgsign true

# Firma di un tag
git tag -s v1.0.0 -m "Versione 1.0.0"
```

**Best Practices:**
- Implementare la firma dei commit per verificare l'autenticità del codice
- Utilizzare la firma degli artefatti per garantire l'integrità durante il deployment
- Verificare l'integrità degli artefatti prima del deployment

## Strumenti di Sicurezza per CI/CD

### 1. Scansione delle Vulnerabilità

- **Snyk**: Scansione delle dipendenze e del codice
- **OWASP Dependency-Check**: Analisi delle dipendenze
- **SonarQube**: Analisi statica del codice
- **Trivy**: Scansione di container e filesystem

### 2. Gestione dei Segreti

- **HashiCorp Vault**: Gestione centralizzata dei segreti
- **AWS Secrets Manager**: Gestione dei segreti su AWS
- **Azure Key Vault**: Gestione dei segreti su Azure
- **Google Secret Manager**: Gestione dei segreti su GCP

### 3. Sicurezza dei Container

- **Clair**: Scansione delle vulnerabilità nei container
- **Anchore**: Analisi e policy enforcement per container
- **Aqua Security**: Sicurezza per container e Kubernetes

## Implementazione della Sicurezza in Diverse Piattaforme CI/CD

### GitHub Actions

```yaml
# Esempio completo di pipeline sicura con GitHub Actions
name: Secure CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run SAST scan
        uses: github/codeql-action/analyze@v1
      
      - name: Run dependency scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  
  build:
    needs: security-scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-artifact@v2
        with:
          name: build
          path: dist/
  
  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v2
      
      - name: Download artifact
        uses: actions/download-artifact@v2
        with:
          name: build
          path: dist/
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1
      
      - name: Deploy to staging
        run: npm run deploy:staging
  
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v2
      
      - name: Download artifact
        uses: actions/download-artifact@v2
        with:
          name: build
          path: dist/
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.PROD_AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.PROD_AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-west-1
      
      - name: Deploy to production
        run: npm run deploy:production
```

### GitLab CI/CD

```yaml
# Esempio di pipeline sicura con GitLab CI/CD
stages:
  - test
  - build
  - deploy-staging
  - deploy-production

security-scan:
  stage: test
  image: node:16
  script:
    - npm ci
    - npm run lint
    - npm audit --audit-level=high
  only:
    - main
    - merge_requests

build:
  stage: build
  image: node:16
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
  only:
    - main

deploy-staging:
  stage: deploy-staging
  image: alpine:latest
  script:
    - apk add --no-cache aws-cli
    - aws s3 sync dist/ s3://staging-bucket/ --delete
  environment:
    name: staging
  only:
    - main

deploy-production:
  stage: deploy-production
  image: alpine:latest
  script:
    - apk add --no-cache aws-cli
    - aws s3 sync dist/ s3://production-bucket/ --delete
  environment:
    name: production
  when: manual
  only:
    - main
```

## Conclusione

La sicurezza nelle pipeline CI/CD non è un'opzione, ma una necessità nel panorama attuale dello sviluppo software. Implementando le best practices descritte in questo capitolo, è possibile ridurre significativamente i rischi di sicurezza e proteggere l'intero processo di sviluppo e deployment.

Ricorda che la sicurezza è un processo continuo, non un obiettivo finale. È importante rivedere e aggiornare regolarmente le pratiche di sicurezza nelle pipeline CI/CD per affrontare le nuove minacce e vulnerabilità che emergono nel tempo.