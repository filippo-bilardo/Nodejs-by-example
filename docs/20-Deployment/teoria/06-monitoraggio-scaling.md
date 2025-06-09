# Monitoraggio e Scaling di Applicazioni Node.js

## Introduzione al Monitoraggio

Il monitoraggio è un aspetto cruciale nella gestione di applicazioni Node.js in produzione. Un sistema di monitoraggio efficace permette di identificare problemi, ottimizzare le prestazioni e garantire un'esperienza utente ottimale. In questo documento, esploreremo le strategie e gli strumenti per monitorare e scalare applicazioni Node.js in ambienti di produzione.

## Metriche Fondamentali da Monitorare

### 1. Metriche a Livello di Sistema

- **Utilizzo della CPU**: Monitorare l'utilizzo della CPU per identificare colli di bottiglia nelle prestazioni.
- **Utilizzo della memoria**: Tracciare l'utilizzo della memoria per rilevare memory leak.
- **Utilizzo del disco**: Monitorare le operazioni di I/O del disco per identificare potenziali rallentamenti.
- **Traffico di rete**: Tracciare il volume e la latenza del traffico di rete.

### 2. Metriche a Livello di Applicazione

- **Tempo di risposta**: Il tempo necessario per elaborare una richiesta e inviare una risposta.
- **Throughput**: Il numero di richieste elaborate per unità di tempo.
- **Tasso di errore**: La percentuale di richieste che generano errori.
- **Dimensione della coda di eventi**: La dimensione dell'event loop queue di Node.js.

### 3. Metriche di Business

- **Utenti attivi**: Il numero di utenti che interagiscono attivamente con l'applicazione.
- **Conversioni**: Metriche specifiche del business come registrazioni, acquisti, ecc.
- **Tempi di caricamento delle pagine**: Il tempo necessario per caricare completamente una pagina web.

## Strumenti di Monitoraggio per Node.js

### 1. Strumenti Nativi

#### Console e Logging

Node.js offre strumenti nativi per il logging e il debugging:

```javascript
console.log('Informazione standard');
console.error('Errore critico');
console.warn('Avviso');
console.time('operazione') && console.timeEnd('operazione'); // Misura il tempo
```

#### Modulo `process`

Il modulo `process` fornisce informazioni sull'utilizzo delle risorse:

```javascript
// Utilizzo della memoria
const memoryUsage = process.memoryUsage();
console.log(`Heap totale: ${memoryUsage.heapTotal / 1024 / 1024} MB`);
console.log(`Heap utilizzato: ${memoryUsage.heapUsed / 1024 / 1024} MB`);

// Tempo di CPU
const cpuUsage = process.cpuUsage();
console.log(`Tempo CPU utente: ${cpuUsage.user / 1000} ms`);
console.log(`Tempo CPU sistema: ${cpuUsage.system / 1000} ms`);
```

### 2. Librerie di Monitoraggio

#### Winston

Winston è una libreria di logging versatile per Node.js:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

#### Pino

Pino è una libreria di logging ad alte prestazioni:

```javascript
const pino = require('pino');
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    }
  }
});

logger.info('Server avviato');
logger.error({ err: new Error('Errore') }, 'Si è verificato un errore');
```

### 3. Servizi di Monitoraggio

#### New Relic

New Relic offre monitoraggio completo per applicazioni Node.js:

```javascript
// Configurazione di New Relic (all'inizio dell'applicazione)
require('newrelic');

const express = require('express');
const app = express();
// ... resto dell'applicazione
```

#### Datadog

Datadog fornisce monitoraggio e analisi delle prestazioni:

```javascript
const tracer = require('dd-trace').init();
const express = require('express');

const app = express();

app.get('/api/users', (req, res) => {
  // Le richieste saranno automaticamente tracciate
  // ...
});
```

#### Prometheus + Grafana

Una combinazione open-source potente per il monitoraggio:

```javascript
const express = require('express');
const promClient = require('prom-client');

const app = express();
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Durata delle richieste HTTP in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [1, 5, 15, 50, 100, 200, 500, 1000, 2000]
});

app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path || req.path, status_code: res.statusCode });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});
```

### 4. Monitoraggio dell'Event Loop

Monitorare l'event loop è cruciale per le applicazioni Node.js:

```javascript
const toobusy = require('toobusy-js');

// Imposta la soglia di latenza dell'event loop (in ms)
toobusy.maxLag(100);

app.use((req, res, next) => {
  if (toobusy()) {
    res.status(503).send("Server troppo occupato, riprova più tardi");
  } else {
    next();
  }
});

// Rilascia le risorse quando l'app si chiude
process.on('SIGINT', () => {
  toobusy.shutdown();
  process.exit();
});
```

## Strategie di Scaling per Node.js

### 1. Scaling Verticale

Lo scaling verticale consiste nell'aumentare le risorse (CPU, memoria) del server esistente.

**Vantaggi:**
- Implementazione semplice
- Nessuna modifica al codice
- Minore complessità operativa

**Svantaggi:**
- Limite fisico alle risorse disponibili
- Potenziali tempi di inattività durante l'upgrade
- Costi potenzialmente elevati

### 2. Scaling Orizzontale

Lo scaling orizzontale consiste nell'aggiungere più istanze dell'applicazione.

#### Modulo Cluster di Node.js

Il modulo `cluster` permette di creare processi worker che condividono la stessa porta:

```javascript
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} è in esecuzione`);

  // Crea worker
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} terminato`);
    // Riavvia il worker
    cluster.fork();
  });
} else {
  // I worker condividono la porta TCP
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Hello World\n');
  }).listen(8000);

  console.log(`Worker ${process.pid} avviato`);
}
```

#### PM2

PM2 è un process manager che semplifica la gestione dei cluster:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "app",
    script: "./app.js",
    instances: "max",
    exec_mode: "cluster",
    watch: true,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
```

Avvio con PM2:

```bash
pm2 start ecosystem.config.js --env production
```

### 3. Load Balancing

Il load balancing distribuisce il traffico tra più istanze dell'applicazione.

#### Nginx come Load Balancer

```nginx
http {
  upstream nodejs_app {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
  }

  server {
    listen 80;
    server_name example.com;

    location / {
      proxy_pass http://nodejs_app;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
}
```

### 4. Microservizi

Suddividere l'applicazione in microservizi permette uno scaling più granulare:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   API       │     │  User       │     │  Product    │
│   Gateway   │────▶│  Service    │────▶│  Service    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Order      │     │  Payment    │     │  Notification│
│  Service    │────▶│  Service    │────▶│  Service     │
└─────────────┘     └─────────────┘     └─────────────┘
```

Ogni servizio può essere scalato indipendentemente in base al carico.

### 5. Scaling Automatico

Lo scaling automatico adatta dinamicamente le risorse in base al carico.

#### AWS Auto Scaling

```yaml
# template.yaml (AWS CloudFormation)
Resources:
  NodeJSAutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    Properties:
      MinSize: 2
      MaxSize: 10
      DesiredCapacity: 2
      LaunchConfigurationName: !Ref NodeJSLaunchConfig
      AvailabilityZones: !GetAZs ''
      TargetGroupARNs:
        - !Ref NodeJSTargetGroup
      Tags:
        - Key: Name
          Value: NodeJSInstance
          PropagateAtLaunch: true

  NodeJSScaleUpPolicy:
    Type: AWS::AutoScaling::ScalingPolicy
    Properties:
      AdjustmentType: ChangeInCapacity
      AutoScalingGroupName: !Ref NodeJSAutoScalingGroup
      Cooldown: 60
      ScalingAdjustment: 1

  NodeJSScaleDownPolicy:
    Type: AWS::AutoScaling::ScalingPolicy
    Properties:
      AdjustmentType: ChangeInCapacity
      AutoScalingGroupName: !Ref NodeJSAutoScalingGroup
      Cooldown: 60
      ScalingAdjustment: -1

  CPUAlarmHigh:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmDescription: Scale up if CPU > 70% for 2 minutes
      MetricName: CPUUtilization
      Namespace: AWS/EC2
      Statistic: Average
      Period: 60
      EvaluationPeriods: 2
      Threshold: 70
      AlarmActions:
        - !Ref NodeJSScaleUpPolicy
      Dimensions:
        - Name: AutoScalingGroupName
          Value: !Ref NodeJSAutoScalingGroup
      ComparisonOperator: GreaterThanThreshold

  CPUAlarmLow:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmDescription: Scale down if CPU < 30% for 5 minutes
      MetricName: CPUUtilization
      Namespace: AWS/EC2
      Statistic: Average
      Period: 60
      EvaluationPeriods: 5
      Threshold: 30
      AlarmActions:
        - !Ref NodeJSScaleDownPolicy
      Dimensions:
        - Name: AutoScalingGroupName
          Value: !Ref NodeJSAutoScalingGroup
      ComparisonOperator: LessThanThreshold
```

## Best Practices per il Monitoraggio e lo Scaling

### 1. Implementare Health Checks

Gli health check permettono di verificare lo stato dell'applicazione:

```javascript
const express = require('express');
const app = express();

// Endpoint per health check semplice
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Endpoint per health check dettagliato
app.get('/health/detailed', async (req, res) => {
  try {
    // Verifica connessione al database
    const dbStatus = await checkDatabaseConnection();
    
    // Verifica connessione a servizi esterni
    const externalServicesStatus = await checkExternalServices();
    
    // Verifica utilizzo memoria
    const memoryUsage = process.memoryUsage();
    const memoryStatus = memoryUsage.heapUsed < 500 * 1024 * 1024 ? 'OK' : 'WARNING';
    
    res.status(200).json({
      status: 'UP',
      details: {
        database: dbStatus,
        externalServices: externalServicesStatus,
        memory: {
          status: memoryStatus,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'DOWN',
      error: error.message
    });
  }
});
```

### 2. Implementare Circuit Breaker

Il pattern Circuit Breaker previene il fallimento a cascata:

```javascript
const CircuitBreaker = require('opossum');

function callExternalService() {
  return new Promise((resolve, reject) => {
    // Chiamata a servizio esterno
  });
}

const options = {
  timeout: 3000, // Timeout in millisecondi
  errorThresholdPercentage: 50, // Percentuale di errori per aprire il circuito
  resetTimeout: 10000 // Tempo prima di riprovare in millisecondi
};

const breaker = new CircuitBreaker(callExternalService, options);

breaker.fire()
  .then(console.log)
  .catch(console.error);

breaker.on('open', () => console.log('Circuit breaker aperto'));
breaker.on('close', () => console.log('Circuit breaker chiuso'));
breaker.on('halfOpen', () => console.log('Circuit breaker semi-aperto'));
```

### 3. Utilizzare Caching

Il caching riduce il carico sul server e migliora le prestazioni:

```javascript
const express = require('express');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

app.get('/api/products', (req, res) => {
  const cacheKey = 'products';
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return res.json(cachedData);
  }
  
  // Recupera i dati dal database
  getProductsFromDB()
    .then(products => {
      // Salva i dati nella cache
      cache.set(cacheKey, products);
      res.json(products);
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});
```

### 4. Implementare Rate Limiting

Il rate limiting protegge l'applicazione da sovraccarichi:

```javascript
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // limite di 100 richieste per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Troppe richieste, riprova più tardi'
});

// Applica il rate limiting a tutte le richieste API
app.use('/api/', apiLimiter);

// Rate limiting più severo per tentativi di login
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 5, // limite di 5 tentativi per IP
  message: 'Troppi tentativi di login, riprova più tardi'
});

app.use('/api/login', loginLimiter);
```

### 5. Ottimizzare le Query al Database

Le query inefficienti possono diventare un collo di bottiglia:

```javascript
// Esempio con Mongoose (MongoDB)
const User = require('./models/User');

// Query inefficiente
app.get('/api/users/inefficient', async (req, res) => {
  try {
    // Recupera tutti gli utenti con tutti i campi
    const users = await User.find({});
    
    // Filtra sul server
    const activeUsers = users.filter(user => user.status === 'active');
    
    // Seleziona solo alcuni campi
    const result = activeUsers.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Query ottimizzata
app.get('/api/users/efficient', async (req, res) => {
  try {
    // Filtra nel database e seleziona solo i campi necessari
    const users = await User.find(
      { status: 'active' },
      { name: 1, email: 1 }
    ).lean();
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Monitoraggio in Ambienti Containerizzati

### Docker e Kubernetes

In ambienti containerizzati, il monitoraggio richiede approcci specifici:

#### Prometheus per Kubernetes

```yaml
# prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
          - action: labelmap
            regex: __meta_kubernetes_pod_label_(.+)
          - source_labels: [__meta_kubernetes_namespace]
            action: replace
            target_label: kubernetes_namespace
          - source_labels: [__meta_kubernetes_pod_name]
            action: replace
            target_label: kubernetes_pod_name
```

#### Deployment di un'applicazione Node.js con metriche Prometheus

```yaml
# node-app-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: node-app
  template:
    metadata:
      labels:
        app: node-app
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: node-app
        image: my-node-app:latest
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "200m"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Conclusione

Il monitoraggio e lo scaling sono componenti essenziali per garantire che le applicazioni Node.js funzionino in modo affidabile e performante in ambienti di produzione. Implementando le giuste strategie e utilizzando gli strumenti appropriati, è possibile identificare e risolvere i problemi prima che influiscano sugli utenti, e scalare l'applicazione in modo efficiente per gestire carichi di lavoro variabili.

Ricorda che il monitoraggio non è un'attività una tantum, ma un processo continuo che richiede attenzione costante e miglioramenti incrementali. Combinando le tecniche di monitoraggio con strategie di scaling appropriate, puoi creare applicazioni Node.js robuste e scalabili che soddisfano le esigenze degli utenti anche sotto carichi elevati.