# Docker e Containerizzazione per Microservizi

## Introduzione a Docker

Docker è una piattaforma open-source che automatizza il deployment di applicazioni all'interno di container software. I container impacchettano un'applicazione con tutte le sue dipendenze in un'unità standardizzata per lo sviluppo software, garantendo che l'applicazione funzioni allo stesso modo in qualsiasi ambiente.

Nel contesto dei microservizi, Docker è diventato uno strumento fondamentale perché permette di:

1. **Isolare** ogni microservizio in un container dedicato
2. **Standardizzare** l'ambiente di esecuzione
3. **Semplificare** il deployment e la scalabilità
4. **Ottimizzare** l'utilizzo delle risorse rispetto alle macchine virtuali tradizionali

## Concetti Fondamentali di Docker

### Immagini e Container

- **Immagine Docker**: Un template di sola lettura che contiene il sistema operativo, le librerie, le dipendenze e il codice dell'applicazione
- **Container Docker**: Un'istanza in esecuzione di un'immagine Docker

### Dockerfile

Il Dockerfile è un file di testo che contiene le istruzioni per costruire un'immagine Docker.

```dockerfile
# Esempio di Dockerfile per un microservizio Node.js
FROM node:16-alpine

WORKDIR /app

# Copia i file di dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm install --production

# Copia il codice sorgente
COPY . .

# Espone la porta su cui il servizio ascolterà
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["node", "server.js"]
```

### Principali Comandi Docker

```bash
# Costruire un'immagine
docker build -t nome-immagine:tag .

# Eseguire un container
docker run -p 3000:3000 nome-immagine:tag

# Visualizzare i container in esecuzione
docker ps

# Fermare un container
docker stop container-id

# Visualizzare i log di un container
docker logs container-id
```

## Containerizzazione di Microservizi Node.js

### Best Practices

1. **Immagini leggere**: Utilizzare immagini base alpine per ridurre la dimensione
2. **Un processo per container**: Ogni container dovrebbe eseguire un solo processo
3. **Configurazione tramite variabili d'ambiente**: Utilizzare variabili d'ambiente per la configurazione
4. **Non eseguire come root**: Utilizzare un utente non privilegiato per motivi di sicurezza
5. **Ottimizzazione del caching**: Strutturare il Dockerfile per sfruttare la cache

### Esempio Completo di Containerizzazione

```dockerfile
# Dockerfile ottimizzato per un microservizio Node.js
FROM node:16-alpine as builder

WORKDIR /app

# Copia solo i file necessari per npm install
COPY package*.json ./

# Installa le dipendenze
RUN npm ci --only=production

# Stage di produzione
FROM node:16-alpine

# Crea un utente non root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

# Copia le dipendenze dal builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copia il codice sorgente
COPY . .

# Cambia proprietario dei file
RUN chown -R nodejs:nodejs /app

# Passa all'utente non root
USER nodejs

# Espone la porta
EXPOSE 3000

# Imposta le variabili d'ambiente
ENV NODE_ENV=production \
    PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q -O - http://localhost:3000/health || exit 1

# Comando per avviare l'applicazione
CMD ["node", "server.js"]
```

### Esempio di server.js con Healthcheck

```javascript
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Microservice is running!' });
});

// Endpoint per healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.listen(PORT, () => {
  console.log(`Service listening on port ${PORT}`);
});

// Gestione graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
```

## Docker Compose per Ambienti Multi-Container

Docker Compose è uno strumento per definire e gestire applicazioni multi-container. È particolarmente utile per lo sviluppo locale e il testing di un'architettura a microservizi.

### Esempio di docker-compose.yml

```yaml
version: '3.8'

services:
  # API Gateway
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PRODUCT_SERVICE_URL=http://product-service:3001
      - ORDER_SERVICE_URL=http://order-service:3002
    depends_on:
      - product-service
      - order-service

  # Servizio Prodotti
  product-service:
    build: ./product-service
    environment:
      - NODE_ENV=development
      - PORT=3001
      - MONGODB_URI=mongodb://mongo:27017/products
    depends_on:
      - mongo

  # Servizio Ordini
  order-service:
    build: ./order-service
    environment:
      - NODE_ENV=development
      - PORT=3002
      - POSTGRES_URI=postgres://user:password@postgres:5432/orders
    depends_on:
      - postgres

  # Database MongoDB per il servizio prodotti
  mongo:
    image: mongo:4.4
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

  # Database PostgreSQL per il servizio ordini
  postgres:
    image: postgres:13-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=orders
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  mongo-data:
  postgres-data:
```

### Comandi Docker Compose

```bash
# Avviare tutti i servizi
docker-compose up

# Avviare i servizi in background
docker-compose up -d

# Fermare tutti i servizi
docker-compose down

# Ricostruire le immagini e avviare i servizi
docker-compose up --build

# Visualizzare i log di un servizio specifico
docker-compose logs service-name
```

## Reti Docker

Le reti Docker permettono ai container di comunicare tra loro in modo sicuro e isolato.

### Tipi di Reti Docker

- **Bridge**: Rete predefinita per i container sullo stesso host
- **Host**: Condivide lo stack di rete dell'host
- **Overlay**: Permette la comunicazione tra container su host diversi
- **Macvlan**: Assegna un indirizzo MAC ai container

### Esempio di Configurazione di Rete

```yaml
version: '3.8'

services:
  api-gateway:
    # ... altre configurazioni
    networks:
      - frontend
      - backend

  product-service:
    # ... altre configurazioni
    networks:
      - backend

  order-service:
    # ... altre configurazioni
    networks:
      - backend

networks:
  frontend:
    # Rete per la comunicazione con i client
  backend:
    # Rete interna per la comunicazione tra servizi
    internal: true
```

## Volumi Docker

I volumi Docker permettono di persistere i dati generati e utilizzati dai container.

### Tipi di Volumi

- **Named Volumes**: Volumi gestiti da Docker
- **Bind Mounts**: Directory dell'host montate nel container
- **tmpfs Mounts**: Dati memorizzati in memoria (non persistenti)

### Esempio di Configurazione di Volumi

```yaml
version: '3.8'

services:
  product-service:
    # ... altre configurazioni
    volumes:
      - product-logs:/app/logs
      - ./product-service:/app:ro  # Bind mount per lo sviluppo

  mongo:
    # ... altre configurazioni
    volumes:
      - mongo-data:/data/db

volumes:
  product-logs:
  mongo-data:
```

## Ottimizzazione delle Immagini Docker

### Multi-stage Builds

I multi-stage builds permettono di creare immagini più piccole separando la fase di build dalla fase di runtime.

```dockerfile
# Stage di build
FROM node:16 as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage di produzione
FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Layer Caching

Organizzare il Dockerfile in modo da massimizzare l'utilizzo della cache.

```dockerfile
# Ordine ottimizzato per il caching
FROM node:16-alpine

WORKDIR /app

# Le dipendenze cambiano meno frequentemente del codice
COPY package*.json ./
RUN npm ci --only=production

# Il codice cambia più frequentemente
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

## Sicurezza dei Container

### Best Practices di Sicurezza

1. **Utilizzare immagini ufficiali e verificate**
2. **Mantenere le immagini aggiornate**
3. **Eseguire i container come utenti non privilegiati**
4. **Limitare le capabilities**
5. **Utilizzare secrets per le informazioni sensibili**
6. **Scansionare le immagini per vulnerabilità**

### Esempio di Configurazione Sicura

```dockerfile
FROM node:16-alpine

# Aggiorna i pacchetti e installa le dipendenze di sicurezza
RUN apk update && apk upgrade

# Crea un utente non root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Cambia proprietario dei file
RUN chown -R nodejs:nodejs /app

# Passa all'utente non root
USER nodejs

EXPOSE 3000

CMD ["node", "server.js"]
```

## Gestione dei Secrets

Docker Compose e Docker Swarm offrono meccanismi per gestire informazioni sensibili.

### Esempio con Docker Compose

```yaml
version: '3.8'

services:
  api-gateway:
    image: my-registry/api-gateway:latest
    environment:
      - NODE_ENV=production
    secrets:
      - api_key
      - jwt_secret

secrets:
  api_key:
    file: ./secrets/api_key.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

## Logging e Monitoraggio

### Configurazione dei Log

```dockerfile
# Configurazione dei log in Dockerfile
FROM node:16-alpine

# ... altre istruzioni

# Configurazione dei log
ENV LOG_LEVEL=info
VOLUME /app/logs

# ... altre istruzioni
```

### Esempio di Configurazione con Logging Driver

```yaml
version: '3.8'

services:
  product-service:
    image: my-registry/product-service:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Conclusione

Docker e la containerizzazione sono fondamentali per implementare efficacemente un'architettura a microservizi. Offrono isolamento, portabilità e standardizzazione, semplificando notevolmente il deployment e la gestione dei microservizi.

Nel prossimo capitolo, esploreremo come orchestrare i container Docker utilizzando Kubernetes, una piattaforma che automatizza il deployment, la scalabilità e la gestione di applicazioni containerizzate in ambienti di produzione.