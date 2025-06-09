# Containerizzazione con Docker per Applicazioni Node.js

## Introduzione alla Containerizzazione

La containerizzazione è una tecnologia che permette di impacchettare un'applicazione insieme a tutte le sue dipendenze in un'unità standardizzata chiamata container. Docker è la piattaforma di containerizzazione più popolare e ampiamente utilizzata, che ha rivoluzionato il modo in cui le applicazioni vengono sviluppate, distribuite ed eseguite.

I container offrono numerosi vantaggi rispetto ai metodi tradizionali di deployment, tra cui consistenza tra ambienti, isolamento, efficienza delle risorse e facilità di distribuzione.

## Vantaggi di Docker per Applicazioni Node.js

1. **Consistenza tra ambienti**: Elimina il classico problema "funziona sulla mia macchina" garantendo che l'applicazione funzioni allo stesso modo in tutti gli ambienti.

2. **Isolamento**: Ogni container opera in modo isolato, riducendo i conflitti tra applicazioni e migliorando la sicurezza.

3. **Efficienza**: I container sono leggeri e condividono il kernel del sistema operativo host, richiedendo meno risorse rispetto alle macchine virtuali.

4. **Scalabilità**: Facilita la scalabilità orizzontale delle applicazioni, permettendo di avviare rapidamente nuove istanze.

5. **Integrazione con CI/CD**: Si integra perfettamente con i pipeline di integrazione e deployment continuo.

## Concetti Fondamentali di Docker

### Immagini e Container

- **Immagine Docker**: Un template di sola lettura che contiene il sistema operativo, l'ambiente di runtime, le librerie e il codice dell'applicazione.

- **Container Docker**: Un'istanza in esecuzione di un'immagine Docker, che può essere avviata, arrestata, spostata o eliminata.

### Dockerfile

Il Dockerfile è un file di testo che contiene le istruzioni per costruire un'immagine Docker. Definisce l'ambiente di esecuzione dell'applicazione, le dipendenze, i file da includere e i comandi da eseguire.

**Esempio di Dockerfile per un'applicazione Node.js:**

```dockerfile
# Immagine base
FROM node:16-alpine

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file di definizione delle dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm ci --only=production

# Copia il codice sorgente
COPY . .

# Espone la porta su cui l'applicazione sarà in ascolto
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["node", "app.js"]
```

### Docker Compose

Docker Compose è uno strumento per definire e gestire applicazioni multi-container. Permette di configurare tutti i servizi dell'applicazione in un unico file YAML.

**Esempio di docker-compose.yml per un'applicazione Node.js con MongoDB:**

```yaml
version: '3'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/myapp
    depends_on:
      - mongo
    restart: always

  mongo:
    image: mongo:4.4
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo-data:
```

## Best Practices per Containerizzare Applicazioni Node.js

### 1. Utilizzare Immagini Base Ufficiali e Leggere

Utilizzare immagini base ufficiali di Node.js, preferibilmente le varianti Alpine che sono molto più leggere.

```dockerfile
# Preferire
FROM node:16-alpine

# Invece di
FROM node:16
```

### 2. Ottimizzare la Cache delle Dipendenze

Copiare prima i file di definizione delle dipendenze e installarle, poi copiare il resto del codice. Questo permette di sfruttare la cache di Docker per le dipendenze.

```dockerfile
# Copia solo i file necessari per npm install
COPY package*.json ./
RUN npm ci --only=production

# Poi copia il resto del codice
COPY . .
```

### 3. Utilizzare .dockerignore

Creare un file `.dockerignore` per escludere file e directory non necessari dall'immagine Docker.

```
# .dockerignore
node_modules
npm-debug.log
Dockerfile
.dockerignore
.git
.github
.gitignore
.env
*.md
tests
```

### 4. Non Eseguire l'Applicazione come Root

Per motivi di sicurezza, è consigliabile eseguire l'applicazione con un utente non privilegiato.

```dockerfile
# Crea un utente non root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

# Imposta le permission corrette
COPY --chown=nodejs:nodejs . .

# Passa all'utente non root
USER nodejs
```

### 5. Gestire Correttamente i Segnali di Terminazione

Assicurarsi che l'applicazione Node.js gestisca correttamente i segnali di terminazione per uno shutdown graceful.

```javascript
// app.js
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // Chiudi altre connessioni (database, ecc.)
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
```

### 6. Utilizzare Multi-stage Builds per Applicazioni con Build Step

Per applicazioni che richiedono una fase di build (TypeScript, webpack, ecc.), utilizzare multi-stage builds per ridurre la dimensione dell'immagine finale.

```dockerfile
# Stage di build
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage di produzione
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

## Gestione delle Variabili d'Ambiente

Le variabili d'ambiente sono il metodo preferito per configurare le applicazioni containerizzate.

### Definizione nel Dockerfile

```dockerfile
# Definizione di variabili d'ambiente di default
ENV NODE_ENV=production \
    PORT=3000
```

### Passaggio tramite Docker Compose

```yaml
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=mongo
```

### Utilizzo di File .env con Docker Compose

```yaml
services:
  app:
    build: .
    env_file:
      - .env.production
```

### Accesso alle Variabili d'Ambiente nell'Applicazione

```javascript
// config.js
module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 27017,
    name: process.env.DB_NAME || 'myapp'
  }
};
```

## Persistenza dei Dati

I container sono effimeri per natura, quindi è importante gestire correttamente la persistenza dei dati.

### Volumi Docker

I volumi Docker sono il meccanismo preferito per la persistenza dei dati.

```yaml
services:
  app:
    build: .
    volumes:
      - uploads:/app/uploads

  mongo:
    image: mongo:4.4
    volumes:
      - mongo-data:/data/db

volumes:
  uploads:
  mongo-data:
```

### Bind Mounts per lo Sviluppo

In ambiente di sviluppo, i bind mounts sono utili per riflettere immediatamente le modifiche al codice.

```yaml
# docker-compose.dev.yml
services:
  app:
    build: .
    volumes:
      - .:/app
      - /app/node_modules
```

## Networking in Docker

Docker fornisce diverse opzioni di networking per la comunicazione tra container.

### Network Bridge di Default

Per default, i container in Docker Compose sono connessi a una rete bridge comune e possono comunicare tra loro utilizzando il nome del servizio come hostname.

```javascript
// Connessione a MongoDB in un altro container
mongoose.connect('mongodb://mongo:27017/myapp');
```

### Reti Personalizzate

È possibile definire reti personalizzate per isolare gruppi di container.

```yaml
services:
  app:
    build: .
    networks:
      - frontend
      - backend

  mongo:
    image: mongo:4.4
    networks:
      - backend

networks:
  frontend:
  backend:
```

## Ottimizzazione delle Immagini Docker

### Ridurre la Dimensione dell'Immagine

1. **Utilizzare immagini base Alpine**: Sono molto più leggere delle varianti standard.
2. **Pulire la cache dopo l'installazione delle dipendenze**:

```dockerfile
RUN npm ci --only=production && npm cache clean --force
```

3. **Combinare i comandi RUN per ridurre i layer**:

```dockerfile
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf /tmp/*
```

### Ottimizzare il Caching dei Layer

Organizzare il Dockerfile in modo che i layer che cambiano più frequentemente siano posizionati verso la fine del file.

## Monitoraggio e Logging

### Logging in Docker

Docker cattura l'output standard (stdout e stderr) dei container, che può essere visualizzato con il comando `docker logs`.

Per le applicazioni Node.js, è importante configurare i logger per scrivere su stdout/stderr invece che su file.

```javascript
// logger.js con Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = logger;
```

### Health Checks

Docker Compose supporta health checks per monitorare lo stato dei container.

```yaml
services:
  app:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Implementazione dell'endpoint di health check nell'applicazione:

```javascript
app.get('/health', (req, res) => {
  // Verifica lo stato dell'applicazione e delle sue dipendenze
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(503).json({ status: 'error', message: 'Database connection failed' });
  }
});
```

## Deployment di Container Docker

### Deployment Manuale

```bash
# Build dell'immagine
docker build -t my-node-app:1.0.0 .

# Push dell'immagine su un registry
docker tag my-node-app:1.0.0 username/my-node-app:1.0.0
docker push username/my-node-app:1.0.0

# Deployment su un server
docker-compose -f docker-compose.prod.yml up -d
```

### Integrazione con CI/CD

**Esempio di GitHub Actions per build e push di un'immagine Docker:**

```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
    
    - name: Build and push
      uses: docker/build-push-action@v3
      with:
        context: .
        push: true
        tags: username/my-node-app:latest,username/my-node-app:${{ github.sha }}
        cache-from: type=registry,ref=username/my-node-app:buildcache
        cache-to: type=registry,ref=username/my-node-app:buildcache,mode=max
```

## Orchestrazione di Container

Per ambienti di produzione con più container, è consigliabile utilizzare un sistema di orchestrazione come Kubernetes o Docker Swarm.

### Docker Swarm

Docker Swarm è integrato in Docker e offre funzionalità di orchestrazione di base.

```bash
# Inizializzazione di uno Swarm
docker swarm init

# Deployment di un'applicazione come stack
docker stack deploy -c docker-compose.yml my-app
```

**Esempio di docker-compose.yml per Docker Swarm:**

```yaml
version: '3.8'

services:
  app:
    image: username/my-node-app:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/myapp

  mongo:
    image: mongo:4.4
    volumes:
      - mongo-data:/data/db
    deploy:
      placement:
        constraints: [node.role == manager]

volumes:
  mongo-data:
```

### Kubernetes

Kubernetes è la soluzione di orchestrazione più potente e flessibile, ideale per applicazioni complesse e ambienti di produzione su larga scala.

**Esempio di deployment Kubernetes per un'applicazione Node.js:**

```yaml
# deployment.yaml
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
    spec:
      containers:
      - name: node-app
        image: username/my-node-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          value: "mongodb://mongo-service:27017/myapp"
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
---
apiVersion: v1
kind: Service
metadata:
  name: node-app-service
spec:
  selector:
    app: node-app
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Sicurezza dei Container

### Scansione delle Vulnerabilità

Utilizzare strumenti come Docker Scan, Trivy o Clair per identificare vulnerabilità nelle immagini Docker.

```bash
# Scansione con Docker Scan
docker scan my-node-app:latest
```

### Principi di Sicurezza

1. **Mantenere le immagini aggiornate**: Aggiornare regolarmente le immagini base per includere le patch di sicurezza.

2. **Minimizzare la superficie di attacco**: Includere solo i componenti necessari nell'immagine.

3. **Non esporre porte non necessarie**: Esporre solo le porte effettivamente necessarie.

4. **Utilizzare utenti non privilegiati**: Evitare di eseguire l'applicazione come root.

5. **Implementare il principio del privilegio minimo**: Assegnare solo i permessi necessari.

## Conclusione

La containerizzazione con Docker offre numerosi vantaggi per lo sviluppo e il deployment di applicazioni Node.js, tra cui consistenza, isolamento, efficienza e facilità di distribuzione. Seguendo le best practice descritte in questa guida, è possibile creare container Docker ottimizzati, sicuri e pronti per la produzione.

Docker si integra perfettamente con i moderni workflow di CI/CD e con le piattaforme di orchestrazione come Kubernetes, permettendo di implementare architetture scalabili e resilienti per applicazioni Node.js di qualsiasi dimensione e complessità.

La containerizzazione è ormai uno standard de facto nell'industria del software, e padroneggiare Docker è diventato un requisito essenziale per gli sviluppatori e i DevOps engineer che lavorano con Node.js e altre tecnologie moderne.