# Deployment Automatizzato

## Introduzione al Deployment Automatizzato

Il deployment automatizzato è l'ultimo anello della catena CI/CD, che consente di distribuire le applicazioni in modo affidabile, ripetibile e con intervento umano minimo o nullo. Per le applicazioni Node.js, esistono numerose strategie e strumenti che facilitano questo processo, adattandosi a diverse esigenze e ambienti di hosting.

## Strategie di Deployment

### 1. Deployment Blu-Verde

Il deployment blu-verde prevede la manutenzione di due ambienti di produzione identici (blu e verde). In un dato momento, solo uno degli ambienti serve il traffico di produzione.

**Come funziona:**
1. L'ambiente "blu" è attualmente in produzione
2. La nuova versione viene distribuita nell'ambiente "verde"
3. Si eseguono test nell'ambiente verde
4. Si reindirizza il traffico dall'ambiente blu al verde
5. L'ambiente blu diventa disponibile per il prossimo deployment

**Vantaggi:**
- Tempo di inattività quasi nullo
- Rollback immediato (basta reindirizzare il traffico all'ambiente precedente)
- Possibilità di testare in un ambiente identico alla produzione

**Implementazione con AWS e GitHub Actions:**

```yaml
deploy:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v1
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy to green environment
      run: |
        aws elasticbeanstalk create-application-version \
          --application-name my-app \
          --version-label ${{ github.sha }} \
          --source-bundle S3Bucket="my-bucket",S3Key="app-${{ github.sha }}.zip"
        
        aws elasticbeanstalk update-environment \
          --environment-name my-app-green \
          --version-label ${{ github.sha }}
    
    - name: Run smoke tests
      run: npm run test:smoke -- --url=https://green.example.com
    
    - name: Swap environments
      run: |
        aws elasticbeanstalk swap-environment-cnames \
          --source-environment-name my-app-green \
          --destination-environment-name my-app-blue
```

### 2. Deployment Canary

Il deployment canary prevede il rilascio graduale della nuova versione a un sottoinsieme di utenti prima di distribuirla a tutti.

**Come funziona:**
1. La nuova versione viene distribuita a una piccola percentuale di utenti (es. 5%)
2. Si monitora il comportamento e le prestazioni
3. Se tutto va bene, si aumenta gradualmente la percentuale
4. Infine, la nuova versione viene distribuita a tutti gli utenti

**Vantaggi:**
- Riduzione del rischio di impatto su larga scala
- Possibilità di testare con utenti reali
- Identificazione precoce di problemi non rilevati nei test

**Implementazione con Kubernetes:**

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 3000

---
# deployment-stable.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: my-app
      version: stable
  template:
    metadata:
      labels:
        app: my-app
        version: stable
    spec:
      containers:
      - name: my-app
        image: my-app:1.0.0
        ports:
        - containerPort: 3000

---
# deployment-canary.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app-canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
      version: canary
  template:
    metadata:
      labels:
        app: my-app
        version: canary
    spec:
      containers:
      - name: my-app
        image: my-app:1.1.0
        ports:
        - containerPort: 3000
```

**Pipeline CI/CD per deployment canary:**

```yaml
deploy-canary:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Set up kubectl
      uses: azure/setup-kubectl@v3
    - name: Set Kubernetes context
      uses: azure/k8s-set-context@v3
      with:
        kubeconfig: ${{ secrets.KUBE_CONFIG }}
    
    - name: Deploy canary
      run: |
        kubectl apply -f deployment-canary.yaml
    
    - name: Monitor canary
      run: |
        # Script per monitorare metriche e log del deployment canary
        ./monitor-canary.sh
    
    - name: Promote to stable
      if: success()
      run: |
        # Aggiorna l'immagine nel deployment stabile
        kubectl set image deployment/my-app-stable my-app=my-app:1.1.0
        # Scala a zero il deployment canary
        kubectl scale deployment my-app-canary --replicas=0
```

### 3. Deployment Rolling

Il deployment rolling aggiorna gradualmente le istanze dell'applicazione, sostituendo le vecchie con le nuove una alla volta o in piccoli batch.

**Come funziona:**
1. Nuove istanze con la nuova versione vengono avviate
2. Una volta pronte, iniziano a ricevere traffico
3. Le vecchie istanze vengono gradualmente terminate

**Vantaggi:**
- Nessun tempo di inattività
- Utilizzo efficiente delle risorse
- Controllo granulare sul processo di rollout

**Implementazione con Docker Swarm:**

```yaml
version: '3.8'
services:
  app:
    image: my-app:${VERSION}
    deploy:
      replicas: 5
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
        failure_action: rollback
        monitor: 60s
      rollback_config:
        parallelism: 1
        delay: 0s
        failure_action: pause
        monitor: 60s
        order: stop-first
    ports:
      - "3000:3000"
```

**Pipeline CI/CD per deployment rolling:**

```yaml
deploy-rolling:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Set up Docker
      uses: docker/setup-buildx-action@v2
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: my-app:${{ github.sha }}
    
    - name: Deploy to Swarm
      uses: wshihadeh/docker-deployment-action@v2
      with:
        remote_docker_host: user@swarm-manager
        ssh_private_key: ${{ secrets.DOCKER_SSH_PRIVATE_KEY }}
        deployment_mode: docker-swarm
        copy_stack_file: true
        deploy_path: /tmp/
        stack_file_name: docker-compose.yml
        keep_files: 5
        args: VERSION=${{ github.sha }}
```

## Piattaforme di Deployment per Applicazioni Node.js

### 1. Heroku

Heroku è una piattaforma cloud che semplifica notevolmente il deployment di applicazioni Node.js.

**Caratteristiche:**
- Deployment con git push
- Scaling automatico
- Add-on per database e altri servizi
- Pipeline di staging e produzione

**Configurazione per Node.js:**

```json
// package.json
{
  "name": "my-app",
  "version": "1.0.0",
  "engines": {
    "node": "16.x"
  },
  "scripts": {
    "start": "node server.js",
    "heroku-postbuild": "npm run build"
  }
}
```

**Pipeline CI/CD con GitHub Actions:**

```yaml
deploy-heroku:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: "my-node-app"
        heroku_email: ${{ secrets.HEROKU_EMAIL }}
        procfile: "web: npm start"
```

### 2. AWS Elastic Beanstalk

Elastic Beanstalk è un servizio AWS che semplifica il deployment di applicazioni web, incluse quelle Node.js.

**Caratteristiche:**
- Gestione automatica dell'infrastruttura
- Scaling automatico
- Monitoraggio integrato
- Supporto per deployment blu-verde

**Configurazione per Node.js:**

```json
// .elasticbeanstalk/config.yml
branch-defaults:
  main:
    environment: my-app-prod
environment-defaults:
  my-app-prod:
    branch: null
    repository: null
global:
  application_name: my-app
  default_ec2_keyname: null
  default_platform: Node.js 16
  default_region: us-east-1
  sc: git
```

**Pipeline CI/CD con GitHub Actions:**

```yaml
deploy-eb:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Generate deployment package
      run: zip -r deploy.zip . -x "*.git*"
    - name: Deploy to EB
      uses: einaregilsson/beanstalk-deploy@v21
      with:
        aws_access_key: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws_secret_key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        application_name: my-app
        environment_name: my-app-prod
        version_label: ${{ github.sha }}
        region: us-east-1
        deployment_package: deploy.zip
```

### 3. Vercel

Vercel è una piattaforma cloud ottimizzata per applicazioni frontend, ma eccellente anche per API Node.js e applicazioni serverless.

**Caratteristiche:**
- Deployment automatico da Git
- Preview per ogni commit
- Integrazione con framework come Next.js
- Edge network globale

**Configurazione per Node.js:**

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

**Pipeline CI/CD con GitHub Actions:**

```yaml
deploy-vercel:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
```

### 4. Kubernetes

Kubernetes è una piattaforma di orchestrazione di container che offre grande flessibilità e controllo sul deployment.

**Caratteristiche:**
- Scaling automatico
- Self-healing
- Gestione avanzata del traffico
- Supporto per varie strategie di deployment

**Configurazione per Node.js:**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:1.0.0
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "256Mi"
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
```

**Pipeline CI/CD con GitHub Actions:**

```yaml
deploy-k8s:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Build and push
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: my-registry/my-app:${{ github.sha }}
    
    - name: Set up kubectl
      uses: azure/setup-kubectl@v3
    
    - name: Set Kubernetes context
      uses: azure/k8s-set-context@v3
      with:
        kubeconfig: ${{ secrets.KUBE_CONFIG }}
    
    - name: Deploy to Kubernetes
      run: |
        # Aggiorna l'immagine nel deployment
        kubectl set image deployment/my-app my-app=my-registry/my-app:${{ github.sha }}
        # Verifica il rollout
        kubectl rollout status deployment/my-app
```

## Best Practices per il Deployment Automatizzato

### 1. Implementare Health Checks

I health check permettono di verificare che l'applicazione funzioni correttamente dopo il deployment.

```javascript
// health-check.js in Express
app.get('/health', (req, res) => {
  // Verifica connessione al database
  const dbHealthy = checkDatabaseConnection();
  // Verifica altri servizi dipendenti
  const servicesHealthy = checkExternalServices();
  
  if (dbHealthy && servicesHealthy) {
    res.status(200).json({ status: 'UP' });
  } else {
    res.status(503).json({
      status: 'DOWN',
      details: {
        database: dbHealthy ? 'UP' : 'DOWN',
        services: servicesHealthy ? 'UP' : 'DOWN'
      }
    });
  }
});
```

### 2. Implementare Rollback Automatici

I rollback automatici permettono di tornare rapidamente a una versione funzionante in caso di problemi.

```yaml
deploy:
  runs-on: ubuntu-latest
  steps:
    # ... deployment steps ...
    
    - name: Verify deployment
      id: verify
      run: |
        # Script per verificare che il deployment funzioni correttamente
        ./verify-deployment.sh
      continue-on-error: true
    
    - name: Rollback on failure
      if: steps.verify.outcome == 'failure'
      run: |
        # Comandi per rollback
        kubectl rollout undo deployment/my-app
        # Notifica il team
        curl -X POST -H 'Content-type: application/json' \
          --data '{"text":"Deployment failed, rolling back"}' \
          ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 3. Utilizzare Variabili d'Ambiente per la Configurazione

Le variabili d'ambiente permettono di configurare l'applicazione in modo diverso per ogni ambiente.

```javascript
// config.js
module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  apiKeys: {
    thirdPartyService: process.env.THIRD_PARTY_API_KEY
  },
  logLevel: process.env.LOG_LEVEL || 'info'
};
```

**Gestione sicura dei segreti:**

```yaml
deploy:
  runs-on: ubuntu-latest
  steps:
    # ... other steps ...
    
    - name: Set up environment variables
      run: |
        echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> .env
        echo "THIRD_PARTY_API_KEY=${{ secrets.THIRD_PARTY_API_KEY }}" >> .env
    
    # ... deployment steps ...
```

### 4. Implementare Monitoraggio Post-Deployment

Il monitoraggio post-deployment permette di identificare rapidamente problemi dopo il rilascio.

```yaml
deploy:
  runs-on: ubuntu-latest
  steps:
    # ... deployment steps ...
    
    - name: Monitor deployment
      run: |
        # Script per monitorare metriche chiave dopo il deployment
        ./monitor-deployment.sh --duration=15m --alert-threshold=95
```

### 5. Documentare il Processo di Deployment

Documentare il processo di deployment aiuta il team a comprendere come funziona e come risolvere eventuali problemi.

```markdown
# Processo di Deployment

## Prerequisiti
- Accesso a GitHub con permessi di push
- Credenziali AWS configurate

## Processo Automatico
1. Push su main o creazione di tag trigger il workflow CI/CD
2. I test vengono eseguiti automaticamente
3. Se i test passano, l'applicazione viene deployata in staging
4. Dopo approvazione manuale, l'applicazione viene deployata in produzione

## Rollback
In caso di problemi, eseguire:
```bash
git tag -d latest-release
git push origin :refs/tags/latest-release
git tag latest-release <previous-working-commit>
git push origin latest-release
```
```

## Conclusione

Il deployment automatizzato è un elemento cruciale di una pipeline CI/CD efficace, consentendo rilasci frequenti, affidabili e con minimo intervento umano. Per le applicazioni Node.js, esistono numerose strategie e piattaforme che possono essere adattate alle specifiche esigenze del progetto.

Implementando le best practices descritte in questo capitolo, i team possono creare un processo di deployment che minimizza i rischi, aumenta la velocità di rilascio e migliora la qualità complessiva del software.

Con la comprensione completa del ciclo CI/CD, dalla integrazione continua al testing automatizzato fino al deployment automatizzato, i team sono ora equipaggiati per implementare pipeline moderne ed efficienti per le loro applicazioni Node.js.