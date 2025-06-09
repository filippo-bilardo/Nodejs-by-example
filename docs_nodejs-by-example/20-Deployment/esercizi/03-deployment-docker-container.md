# Deployment di un'Applicazione Node.js con Docker

## Obiettivo
In questo esercizio, imparerai a containerizzare un'applicazione Node.js utilizzando Docker e a deployarla su un server o un servizio cloud che supporta container Docker.

## Prerequisiti
- Docker installato sul tuo sistema
- Un'applicazione Node.js funzionante
- Conoscenza di base di Node.js, npm e terminale
- Account su Docker Hub (opzionale, per pubblicare l'immagine)

## Passaggi

### 1. Preparazione dell'Applicazione

1. Assicurati che la tua applicazione Node.js sia pronta per essere containerizzata:
   
   a. Verifica che il file `package.json` contenga gli script corretti:
   ```json
   {
     "name": "nodejs-docker-app",
     "version": "1.0.0",
     "description": "Applicazione Node.js per Docker",
     "main": "app.js",
     "scripts": {
       "start": "node app.js",
       "test": "echo \"Error: no test specified\" && exit 1"
     },
     "dependencies": {
       "express": "^4.18.2"
     }
   }
   ```

   b. Crea un'applicazione Express di base se non ne hai già una:
   ```javascript
   // app.js
   const express = require('express');
   const app = express();
   const port = process.env.PORT || 3000;

   app.get('/', (req, res) => {
     res.send('Hello from Docker Container!');
   });

   app.listen(port, '0.0.0.0', () => {
     console.log(`Server in ascolto sulla porta ${port}`);
   });
   ```
   Nota: L'utilizzo di `0.0.0.0` come host è importante per permettere connessioni dall'esterno del container.

### 2. Creazione del Dockerfile

1. Crea un file `Dockerfile` nella radice del progetto:
   ```dockerfile
   # Usa un'immagine Node.js ufficiale come base
   FROM node:16-alpine

   # Imposta la directory di lavoro nel container
   WORKDIR /usr/src/app

   # Copia i file package.json e package-lock.json
   COPY package*.json ./

   # Installa le dipendenze
   RUN npm install

   # Copia il resto dei file dell'applicazione
   COPY . .

   # Esponi la porta su cui l'app sarà in ascolto
   EXPOSE 3000

   # Comando per avviare l'applicazione
   CMD ["npm", "start"]
   ```

2. Crea un file `.dockerignore` per escludere file non necessari:
   ```
   node_modules
   npm-debug.log
   Dockerfile
   .dockerignore
   .git
   .gitignore
   README.md
   ```

### 3. Build dell'Immagine Docker

1. Costruisci l'immagine Docker:
   ```bash
   docker build -t nodejs-docker-app .
   ```

2. Verifica che l'immagine sia stata creata correttamente:
   ```bash
   docker images
   ```

### 4. Esecuzione del Container

1. Avvia un container basato sull'immagine creata:
   ```bash
   docker run -p 3000:3000 -d --name my-nodejs-app nodejs-docker-app
   ```
   Questo comando:
   - Mappa la porta 3000 del container alla porta 3000 dell'host
   - Esegue il container in modalità detached (background)
   - Assegna il nome "my-nodejs-app" al container

2. Verifica che il container sia in esecuzione:
   ```bash
   docker ps
   ```

3. Testa l'applicazione aprendo un browser e navigando a `http://localhost:3000`

### 5. Gestione del Container

1. Visualizza i log del container:
   ```bash
   docker logs my-nodejs-app
   ```

2. Ferma il container:
   ```bash
   docker stop my-nodejs-app
   ```

3. Riavvia il container:
   ```bash
   docker start my-nodejs-app
   ```

4. Rimuovi il container (deve essere fermato prima):
   ```bash
   docker rm my-nodejs-app
   ```

### 6. Pubblicazione dell'Immagine su Docker Hub

1. Accedi a Docker Hub dalla CLI:
   ```bash
   docker login
   ```

2. Tagga l'immagine con il tuo username Docker Hub:
   ```bash
   docker tag nodejs-docker-app username/nodejs-docker-app:latest
   ```

3. Pusha l'immagine su Docker Hub:
   ```bash
   docker push username/nodejs-docker-app:latest
   ```

### 7. Deployment su un Server

1. Accedi al tuo server tramite SSH.

2. Installa Docker se non è già installato.

3. Puoi ora eseguire l'applicazione in due modi:

   a. Scaricando l'immagine da Docker Hub:
   ```bash
   docker pull username/nodejs-docker-app:latest
   docker run -p 80:3000 -d username/nodejs-docker-app:latest
   ```

   b. Oppure copiando i file del progetto sul server e costruendo l'immagine localmente.

### 8. Utilizzo di Docker Compose (Opzionale)

1. Crea un file `docker-compose.yml` per gestire più container (ad esempio, aggiungendo un database):
   ```yaml
   version: '3'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - DB_HOST=db
       depends_on:
         - db
     db:
       image: mongo:latest
       volumes:
         - mongo-data:/data/db
       ports:
         - "27017:27017"
   volumes:
     mongo-data:
   ```

2. Avvia i container con Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Ferma i container:
   ```bash
   docker-compose down
   ```

## Sfide Aggiuntive

1. **Ottimizzazione dell'Immagine Docker**:
   - Utilizza tecniche di multi-stage build per ridurre la dimensione dell'immagine
   - Implementa strategie di caching per velocizzare il processo di build

2. **Implementazione di un Sistema di Orchestrazione**:
   - Configura un cluster Kubernetes per gestire i container
   - Utilizza Docker Swarm per orchestrare più container

3. **Configurazione di un Pipeline CI/CD con Docker**:
   - Integra il processo di build e deployment Docker in una pipeline CI/CD
   - Implementa test automatici per l'immagine Docker

## Conclusione

Hai containerizzato con successo un'applicazione Node.js utilizzando Docker. La containerizzazione offre numerosi vantaggi:

- Ambiente di esecuzione consistente tra sviluppo, test e produzione
- Isolamento delle dipendenze dell'applicazione
- Facilità di distribuzione e scalabilità
- Gestione efficiente delle risorse

Queste caratteristiche rendono Docker una tecnologia fondamentale per il deployment moderno di applicazioni Node.js, specialmente in ambienti cloud e microservizi.