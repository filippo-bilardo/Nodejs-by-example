# Creazione di Microservizi Base con Node.js

## Obiettivo
In questo esercizio, imparerai a creare un'architettura di base a microservizi utilizzando Node.js ed Express. Implementerai due semplici microservizi che comunicano tra loro e un API Gateway che funge da punto di ingresso unificato.

## Prerequisiti
- Node.js e npm installati
- Conoscenza di base di Express.js
- Conoscenza di base delle API REST
- Docker (opzionale, per la containerizzazione)

## Passaggi

### 1. Configurazione del Progetto

1. Crea una directory principale per il progetto:
   ```bash
   mkdir microservizi-demo
   cd microservizi-demo
   ```

2. Crea le sottodirectory per i microservizi e l'API Gateway:
   ```bash
   mkdir api-gateway servizio-utenti servizio-prodotti
   ```

### 2. Implementazione del Servizio Utenti

1. Inizializza il progetto per il servizio utenti:
   ```bash
   cd servizio-utenti
   npm init -y
   npm install express cors body-parser
   ```

2. Crea il file `index.js` per il servizio utenti:
   ```javascript
   // servizio-utenti/index.js
   const express = require('express');
   const bodyParser = require('body-parser');
   const cors = require('cors');

   const app = express();
   const PORT = process.env.PORT || 3001;

   app.use(cors());
   app.use(bodyParser.json());

   // Database simulato
   const utenti = [
     { id: 1, nome: 'Mario Rossi', email: 'mario@example.com' },
     { id: 2, nome: 'Giulia Bianchi', email: 'giulia@example.com' }
   ];

   // Endpoint per ottenere tutti gli utenti
   app.get('/api/utenti', (req, res) => {
     res.json(utenti);
   });

   // Endpoint per ottenere un utente specifico
   app.get('/api/utenti/:id', (req, res) => {
     const id = parseInt(req.params.id);
     const utente = utenti.find(u => u.id === id);
     
     if (!utente) {
       return res.status(404).json({ messaggio: 'Utente non trovato' });
     }
     
     res.json(utente);
   });

   // Endpoint per creare un nuovo utente
   app.post('/api/utenti', (req, res) => {
     const nuovoUtente = {
       id: utenti.length + 1,
       nome: req.body.nome,
       email: req.body.email
     };
     
     utenti.push(nuovoUtente);
     res.status(201).json(nuovoUtente);
   });

   app.listen(PORT, () => {
     console.log(`Servizio Utenti in esecuzione sulla porta ${PORT}`);
   });
   ```

### 3. Implementazione del Servizio Prodotti

1. Inizializza il progetto per il servizio prodotti:
   ```bash
   cd ../servizio-prodotti
   npm init -y
   npm install express cors body-parser
   ```

2. Crea il file `index.js` per il servizio prodotti:
   ```javascript
   // servizio-prodotti/index.js
   const express = require('express');
   const bodyParser = require('body-parser');
   const cors = require('cors');

   const app = express();
   const PORT = process.env.PORT || 3002;

   app.use(cors());
   app.use(bodyParser.json());

   // Database simulato
   const prodotti = [
     { id: 1, nome: 'Laptop', prezzo: 999.99, disponibile: true },
     { id: 2, nome: 'Smartphone', prezzo: 499.99, disponibile: true },
     { id: 3, nome: 'Tablet', prezzo: 299.99, disponibile: false }
   ];

   // Endpoint per ottenere tutti i prodotti
   app.get('/api/prodotti', (req, res) => {
     res.json(prodotti);
   });

   // Endpoint per ottenere un prodotto specifico
   app.get('/api/prodotti/:id', (req, res) => {
     const id = parseInt(req.params.id);
     const prodotto = prodotti.find(p => p.id === id);
     
     if (!prodotto) {
       return res.status(404).json({ messaggio: 'Prodotto non trovato' });
     }
     
     res.json(prodotto);
   });

   // Endpoint per creare un nuovo prodotto
   app.post('/api/prodotti', (req, res) => {
     const nuovoProdotto = {
       id: prodotti.length + 1,
       nome: req.body.nome,
       prezzo: req.body.prezzo,
       disponibile: req.body.disponibile || true
     };
     
     prodotti.push(nuovoProdotto);
     res.status(201).json(nuovoProdotto);
   });

   app.listen(PORT, () => {
     console.log(`Servizio Prodotti in esecuzione sulla porta ${PORT}`);
   });
   ```

### 4. Implementazione dell'API Gateway

1. Inizializza il progetto per l'API Gateway:
   ```bash
   cd ../api-gateway
   npm init -y
   npm install express http-proxy-middleware cors
   ```

2. Crea il file `index.js` per l'API Gateway:
   ```javascript
   // api-gateway/index.js
   const express = require('express');
   const { createProxyMiddleware } = require('http-proxy-middleware');
   const cors = require('cors');

   const app = express();
   const PORT = process.env.PORT || 3000;

   app.use(cors());

   // Configurazione dei proxy per i microservizi
   const utenteServiceProxy = createProxyMiddleware('/api/utenti', {
     target: 'http://localhost:3001',
     changeOrigin: true,
     pathRewrite: {
       '^/api/utenti': '/api/utenti'
     }
   });

   const prodottoServiceProxy = createProxyMiddleware('/api/prodotti', {
     target: 'http://localhost:3002',
     changeOrigin: true,
     pathRewrite: {
       '^/api/prodotti': '/api/prodotti'
     }
   });

   // Registrazione dei proxy
   app.use('/api/utenti', utenteServiceProxy);
   app.use('/api/prodotti', prodottoServiceProxy);

   // Endpoint di base
   app.get('/', (req, res) => {
     res.json({
       messaggio: 'API Gateway per Microservizi Demo',
       endpoints: [
         '/api/utenti',
         '/api/prodotti'
       ]
     });
   });

   app.listen(PORT, () => {
     console.log(`API Gateway in esecuzione sulla porta ${PORT}`);
   });
   ```

### 5. Configurazione del Package.json Principale

1. Torna alla directory principale e crea un package.json per gestire tutti i servizi:
   ```bash
   cd ..
   npm init -y
   ```

2. Modifica il file `package.json` per aggiungere script per avviare tutti i servizi:
   ```json
   {
     "name": "microservizi-demo",
     "version": "1.0.0",
     "description": "Demo di architettura a microservizi con Node.js",
     "main": "index.js",
     "scripts": {
       "start-utenti": "cd servizio-utenti && node index.js",
       "start-prodotti": "cd servizio-prodotti && node index.js",
       "start-gateway": "cd api-gateway && node index.js",
       "start": "concurrently \"npm run start-utenti\" \"npm run start-prodotti\" \"npm run start-gateway\""
     },
     "keywords": [
       "microservizi",
       "node.js",
       "express"
     ],
     "author": "",
     "license": "ISC",
     "devDependencies": {
       "concurrently": "^7.0.0"
     }
   }
   ```

3. Installa concurrently per eseguire più servizi contemporaneamente:
   ```bash
   npm install --save-dev concurrently
   ```

### 6. Avvio dei Microservizi

1. Avvia tutti i servizi contemporaneamente:
   ```bash
   npm start
   ```

2. In alternativa, avvia ogni servizio separatamente in terminali diversi:
   ```bash
   # Terminale 1
   npm run start-utenti
   
   # Terminale 2
   npm run start-prodotti
   
   # Terminale 3
   npm run start-gateway
   ```

### 7. Test dei Microservizi

1. Testa l'API Gateway:
   - Apri il browser e vai a `http://localhost:3000`
   - Dovresti vedere un messaggio di benvenuto con gli endpoint disponibili

2. Testa il servizio utenti attraverso l'API Gateway:
   - `http://localhost:3000/api/utenti` - Visualizza tutti gli utenti
   - `http://localhost:3000/api/utenti/1` - Visualizza l'utente con ID 1

3. Testa il servizio prodotti attraverso l'API Gateway:
   - `http://localhost:3000/api/prodotti` - Visualizza tutti i prodotti
   - `http://localhost:3000/api/prodotti/1` - Visualizza il prodotto con ID 1

## Esercizi Aggiuntivi

1. **Aggiungi un Database**: Sostituisci gli array in memoria con un database MongoDB o SQLite.

2. **Implementa l'Autenticazione**: Aggiungi un sistema di autenticazione JWT all'API Gateway.

3. **Containerizzazione con Docker**: Crea Dockerfile per ogni servizio e un docker-compose.yml per orchestrarli.

4. **Implementa Circuit Breaker**: Aggiungi un pattern circuit breaker per gestire i fallimenti dei servizi.

5. **Aggiungi un Servizio di Discovery**: Implementa un registro dei servizi con Consul o etcd.

## Risorse Aggiuntive

- [Express.js - Documentazione Ufficiale](https://expressjs.com/)
- [http-proxy-middleware - GitHub](https://github.com/chimurai/http-proxy-middleware)
- [Pattern per Microservizi - Martin Fowler](https://martinfowler.com/articles/microservices.html)
- [Docker - Documentazione Ufficiale](https://docs.docker.com/)

## Conclusione

In questo esercizio, hai creato un'architettura di base a microservizi con Node.js. Hai implementato due microservizi indipendenti e un API Gateway che funge da punto di ingresso unificato. Questa architettura può essere estesa aggiungendo più servizi, implementando pattern di resilienza e utilizzando tecnologie di containerizzazione per il deployment.

Ricorda che i microservizi introducono complessità operativa, quindi è importante valutare attentamente se questa architettura è adatta alle tue esigenze prima di adottarla in un ambiente di produzione.

---

 - [📑 Indice](../README.md) 
 - [➡️ Comunicazione Asincrona con RabbitMQ](02-comunicazione-asincrona-rabbitmq.md)