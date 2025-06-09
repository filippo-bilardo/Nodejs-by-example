# Strategie di Deployment

## Introduzione alle Strategie di Deployment

Le strategie di deployment definiscono il modo in cui le nuove versioni di un'applicazione vengono rilasciate in produzione. La scelta della strategia più adatta dipende da vari fattori, tra cui la tolleranza ai tempi di inattività, la complessità dell'applicazione, le risorse disponibili e i requisiti di business.

Una strategia di deployment ben pianificata può ridurre i rischi, minimizzare i tempi di inattività e garantire un'esperienza utente fluida durante gli aggiornamenti.

## Principali Strategie di Deployment

### 1. Deployment Tradizionale (Recreate)

Il deployment tradizionale è l'approccio più semplice: l'applicazione esistente viene completamente terminata prima di avviare la nuova versione.

**Come funziona:**
1. Arresto completo della versione corrente
2. Deployment della nuova versione
3. Avvio della nuova versione

**Vantaggi:**
- Semplicità di implementazione
- Nessuna complessità infrastrutturale
- Stato dell'applicazione completamente rinnovato

**Svantaggi:**
- Tempo di inattività significativo durante il deployment
- Nessuna possibilità di rollback immediato
- Rischio elevato in caso di problemi

**Implementazione con script bash:**

```bash
#!/bin/bash

# Arresta l'applicazione corrente
pm2 stop my-app

# Aggiorna il codice (ad esempio tramite git)
git pull origin main

# Installa le dipendenze
npm ci --production

# Avvia la nuova versione
pm2 start ecosystem.config.js --env production
```

### 2. Deployment Rolling (Aggiornamento Graduale)

Il deployment rolling aggiorna gradualmente le istanze dell'applicazione, sostituendo le vecchie con le nuove una alla volta o in piccoli batch.

**Come funziona:**
1. Nuove istanze con la nuova versione vengono avviate
2. Una volta pronte, iniziano a ricevere traffico
3. Le vecchie istanze vengono gradualmente terminate

**Vantaggi:**
- Nessun tempo di inattività
- Utilizzo efficiente delle risorse
- Controllo granulare sul processo di rollout

**Svantaggi:**
- Complessità nella gestione delle versioni miste
- Possibili problemi di compatibilità tra versioni
- Rollback più complesso

**Implementazione con Kubernetes:**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Numero massimo di pod oltre il numero desiderato
      maxUnavailable: 1  # Numero massimo di pod non disponibili durante l'update
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
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
```

**Comando per aggiornare l'immagine:**

```bash
kubectl set image deployment/my-app my-app=my-app:2.0.0
```

### 3. Deployment Blu-Verde

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

**Svantaggi:**
- Richiede il doppio delle risorse infrastrutturali
- Complessità nella sincronizzazione dei dati tra ambienti
- Costi più elevati

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

### 4. Deployment Canary

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

**Svantaggi:**
- Complessità nella gestione del routing del traffico
- Necessità di monitoraggio avanzato
- Potenziale confusione per gli utenti che vedono versioni diverse

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

### 5. Deployment A/B Testing

Il deployment A/B testing è simile al canary, ma si concentra sul test di funzionalità specifiche piuttosto che sull'intera applicazione.

**Come funziona:**
1. Si identificano le funzionalità da testare
2. Si creano due versioni dell'applicazione (A e B) con implementazioni diverse della funzionalità
3. Si distribuisce ciascuna versione a un sottoinsieme di utenti
4. Si raccolgono metriche per determinare quale versione funziona meglio
5. Si adotta la versione vincente per tutti gli utenti

**Vantaggi:**
- Decisioni basate su dati reali degli utenti
- Possibilità di testare più varianti contemporaneamente
- Ottimizzazione continua dell'esperienza utente

**Svantaggi:**
- Complessità nella configurazione e analisi
- Necessità di strumenti di analisi avanzati
- Potenziale confusione per gli utenti

**Implementazione con NGINX e feature flags:**

```nginx
# nginx.conf
http {
    # ... altre configurazioni
    
    split_clients "${remote_addr}${http_user_agent}" $variant {
        50% "A";
        50% "B";
    }
    
    server {
        listen 80;
        server_name example.com;
        
        location / {
            proxy_set_header X-Variant $variant;
            proxy_pass http://backend;
        }
    }
    
    upstream backend {
        server backend1.example.com;
        server backend2.example.com;
    }
}
```

**Gestione delle varianti nell'applicazione Node.js:**

```javascript
app.use((req, res, next) => {
  const variant = req.headers['x-variant'] || 'A'; // Default alla variante A
  req.variant = variant;
  next();
});

app.get('/feature', (req, res) => {
  if (req.variant === 'A') {
    // Implementazione della funzionalità per la variante A
    res.render('feature-a');
  } else {
    // Implementazione della funzionalità per la variante B
    res.render('feature-b');
  }
});
```

## Fattori da Considerare nella Scelta della Strategia

### 1. Tolleranza ai Tempi di Inattività

Se l'applicazione richiede alta disponibilità, le strategie blu-verde, canary o rolling sono preferibili rispetto al deployment tradizionale.

### 2. Complessità dell'Applicazione

Applicazioni più complesse o con molte dipendenze potrebbero beneficiare di strategie che consentono test approfonditi in ambienti simili alla produzione (blu-verde).

### 3. Frequenza di Rilascio

Per rilasci frequenti (continuous deployment), strategie come canary o rolling possono essere più efficienti.

### 4. Risorse Disponibili

Strategie come blu-verde richiedono più risorse infrastrutturali rispetto ad altre.

### 5. Requisiti di Business

Considerare l'impatto sul business di potenziali problemi durante il deployment e scegliere una strategia che minimizzi i rischi specifici per il contesto aziendale.

## Implementazione di Rollback

Indipendentemente dalla strategia scelta, è fondamentale avere un piano di rollback in caso di problemi.

### Rollback Automatico

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

### Monitoraggio Post-Deployment

Il monitoraggio dopo il deployment è cruciale per identificare rapidamente eventuali problemi.

```javascript
// health-check.js
const express = require('express');
const app = express();

// Endpoint per health check
app.get('/health', (req, res) => {
  // Verifica lo stato dell'applicazione
  const isHealthy = checkApplicationHealth();
  
  if (isHealthy) {
    res.status(200).json({ status: 'healthy' });
  } else {
    res.status(503).json({ status: 'unhealthy' });
  }
});

// Endpoint per readiness check
app.get('/ready', (req, res) => {
  // Verifica se l'applicazione è pronta a ricevere traffico
  const isReady = checkApplicationReadiness();
  
  if (isReady) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});
```

## Conclusione

La scelta della strategia di deployment più adatta dipende da numerosi fattori specifici del progetto e dell'organizzazione. Non esiste una soluzione universale, ma comprendere i pro e i contro di ciascuna strategia permette di prendere decisioni informate.

Indipendentemente dalla strategia scelta, è fondamentale automatizzare il processo di deployment, implementare un robusto sistema di monitoraggio e avere un piano di rollback ben definito per minimizzare i rischi e garantire un'esperienza utente ottimale durante gli aggiornamenti dell'applicazione.

Le strategie di deployment sono in continua evoluzione, con l'emergere di nuovi strumenti e pratiche. Mantenersi aggiornati sulle ultime tendenze e adattare le strategie in base alle esigenze specifiche è essenziale per un deployment efficace e sicuro.