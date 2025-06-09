# Pattern di Resilienza per Microservizi

## Obiettivo
In questo esercizio, imparerai a implementare pattern di resilienza fondamentali per architetture a microservizi. Questi pattern aiutano a costruire sistemi distribuiti robusti che possono gestire guasti, sovraccarichi e altri problemi comuni nelle architetture distribuite.

## Prerequisiti
- Node.js e npm installati
- Conoscenza di base di Express.js
- Conoscenza di base dei microservizi (completamento dell'esercizio 01)
- Comprensione dei concetti di base di resilienza nei sistemi distribuiti

## Concetti Chiave

### Resilienza nei Microservizi
La resilienza è la capacità di un sistema di resistere e riprendersi da guasti. Nei microservizi, dove le interazioni di rete sono frequenti, la resilienza è fondamentale per garantire un'esperienza utente affidabile.

### Pattern di Resilienza Comuni
- **Circuit Breaker**: Previene il sovraccarico di servizi già in difficoltà
- **Retry**: Riprova operazioni fallite con strategie intelligenti
- **Timeout**: Imposta limiti di tempo per le operazioni
- **Bulkhead**: Isola i guasti per prevenire il fallimento a cascata
- **Fallback**: Fornisce alternative quando un servizio non è disponibile

## Passaggi

### 1. Configurazione del Progetto

1. Crea una directory principale per il progetto:
   ```bash
   mkdir microservizi-resilienza
   cd microservizi-resilienza
   ```

2. Crea le sottodirectory per i microservizi:
   ```bash
   mkdir api-gateway servizio-prodotti servizio-recensioni servizio-utenti
   ```

### 2. Implementazione del Circuit Breaker

1. Inizializza il progetto per l'API Gateway:
   ```bash
   cd api-gateway
   npm init -y
   npm install express axios opossum cors
   ```

2. Crea il file `index.js` per l'API Gateway con il pattern Circuit Breaker:
   ```javascript
   // api-gateway/index.js
   const express = require('express');
   const axios = require('axios');
   const CircuitBreaker = require('opossum');
   const cors = require('cors');

   const app = express();
   const PORT = process.env.PORT || 3000;

   app.use(cors());
   app.use(express.json());

   // Configurazione del Circuit Breaker
   const circuitOptions = {
     failureThreshold: 3,         // Numero di errori prima dell'apertura del circuito
     resetTimeout: 10000,         // Tempo in ms prima di provare a chiudere il circuito
     timeout: 3000,               // Timeout per le richieste
     errorThresholdPercentage: 50 // Percentuale di errori per aprire il circuito
   };

   // Creazione dei Circuit Breaker per i vari servizi
   const prodottiServiceBreaker = new CircuitBreaker(
     async (id) => {
       const response = await axios.get(`http://localhost:3001/api/prodotti/${id}`);
       return response.data;
     },
     circuitOptions
   );

   const recensioniServiceBreaker = new CircuitBreaker(
     async (prodottoId) => {
       const response = await axios.get(`http://localhost:3002/api/recensioni/prodotto/${prodottoId}`);
       return response.data;
     },
     circuitOptions
   );

   // Gestione degli eventi del Circuit Breaker
   prodottiServiceBreaker.on('open', () => {
     console.log('Circuit Breaker APERTO per il servizio prodotti');
   });

   prodottiServiceBreaker.on('close', () => {
     console.log('Circuit Breaker CHIUSO per il servizio prodotti');
   });

   prodottiServiceBreaker.on('halfOpen', () => {
     console.log('Circuit Breaker SEMI-APERTO per il servizio prodotti');
   });

   recensioniServiceBreaker.on('open', () => {
     console.log('Circuit Breaker APERTO per il servizio recensioni');
   });

   // Endpoint per ottenere un prodotto con le sue recensioni
   app.get('/api/prodotti/:id', async (req, res) => {
     const id = parseInt(req.params.id);
     
     try {
       // Ottieni il prodotto con Circuit Breaker
       const prodotto = await prodottiServiceBreaker.fire(id)
         .catch(error => {
           console.error('Errore nel servizio prodotti:', error.message);
           return { id, nome: 'Prodotto non disponibile', prezzo: 0, fallback: true };
         });
       
       // Ottieni le recensioni con Circuit Breaker e fallback
       let recensioni = [];
       try {
         recensioni = await recensioniServiceBreaker.fire(id);
       } catch (error) {
         console.error('Errore nel servizio recensioni:', error.message);
         recensioni = [{ id: 0, testo: 'Recensioni temporaneamente non disponibili', fallback: true }];
       }
       
       // Combina i risultati
       const risultato = {
         prodotto,
         recensioni
       };
       
       res.json(risultato);
     } catch (error) {
       console.error('Errore generale:', error.message);
       res.status(500).json({ messaggio: 'Errore interno del server' });
     }
   });

   // Endpoint di base
   app.get('/', (req, res) => {
     res.json({
       messaggio: 'API Gateway con Pattern di Resilienza',
       endpoints: [
         '/api/prodotti/:id'
       ]
     });
   });

   app.listen(PORT, () => {
     console.log(`API Gateway in esecuzione sulla porta ${PORT}`);
   });
   ```

### 3. Implementazione del Servizio Prodotti con Timeout e Retry

1. Inizializza il progetto per il servizio prodotti:
   ```bash
   cd ../servizio-prodotti
   npm init -y
   npm install express body-parser cors
   ```

2. Crea il file `index.js` per il servizio prodotti:
   ```javascript
   // servizio-prodotti/index.js
   const express = require('express');
   const bodyParser = require('body-parser');
   const cors = require('cors');

   const app = express();
   const PORT = process.env.PORT || 3001;

   app.use(cors());
   app.use(bodyParser.json());

   // Database simulato
   const prodotti = [
     { id: 1, nome: 'Laptop', prezzo: 999.99, disponibile: true },
     { id: 2, nome: 'Smartphone', prezzo: 499.99, disponibile: true },
     { id: 3, nome: 'Tablet', prezzo: 299.99, disponibile: false }
   ];

   // Simulazione di latenza e errori casuali
   function simulaProblemiDiRete(req, res, next) {
     // Simula latenza (10% delle richieste hanno alta latenza)
     if (Math.random() < 0.1) {
       console.log('Simulazione: Alta latenza');
       setTimeout(next, 5000);
       return;
     }
     
     // Simula errori del server (5% delle richieste falliscono)
     if (Math.random() < 0.05) {
       console.log('Simulazione: Errore del server');
       return res.status(500).json({ messaggio: 'Errore interno del server simulato' });
     }
     
     next();
   }

   // Applica il middleware di simulazione a tutte le richieste
   app.use(simulaProblemiDiRete);

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

### 4. Implementazione del Servizio Recensioni con Bulkhead

1. Inizializza il progetto per il servizio recensioni:
   ```bash
   cd ../servizio-recensioni
   npm init -y
   npm install express body-parser cors
   ```

2. Crea il file `index.js` per il servizio recensioni con il pattern Bulkhead:
   ```javascript
   // servizio-recensioni/index.js
   const express = require('express');
   const bodyParser = require('body-parser');
   const cors = require('cors');

   const app = express();
   const PORT = process.env.PORT || 3002;

   app.use(cors());
   app.use(bodyParser.json());

   // Database simulato
   const recensioni = [
     { id: 1, prodottoId: 1, utente: 'Mario', testo: 'Ottimo laptop, veloce e affidabile', valutazione: 5 },
     { id: 2, prodottoId: 1, utente: 'Giulia', testo: 'Buon rapporto qualità-prezzo', valutazione: 4 },
     { id: 3, prodottoId: 2, utente: 'Luca', testo: 'Smartphone eccellente, ottima fotocamera', valutazione: 5 },
     { id: 4, prodottoId: 3, utente: 'Anna', testo: 'Tablet con buone prestazioni', valutazione: 4 }
   ];

   // Implementazione del pattern Bulkhead
   class Bulkhead {
     constructor(maxConcurrent, maxQueue) {
       this.maxConcurrent = maxConcurrent;
       this.maxQueue = maxQueue;
       this.executing = 0;
       this.queue = [];
     }

     async execute(fn) {
       return new Promise((resolve, reject) => {
         const task = async () => {
           this.executing++;
           try {
             const result = await fn();
             resolve(result);
           } catch (error) {
             reject(error);
           } finally {
             this.executing--;
             this.processQueue();
           }
         };

         if (this.executing < this.maxConcurrent) {
           task();
         } else if (this.queue.length < this.maxQueue) {
           this.queue.push(task);
         } else {
           reject(new Error('Bulkhead full'));
         }
       });
     }

     processQueue() {
       if (this.queue.length > 0 && this.executing < this.maxConcurrent) {
         const task = this.queue.shift();
         task();
       }
     }
   }

   // Crea un bulkhead per limitare le richieste concorrenti
   const recensioniBulkhead = new Bulkhead(3, 10); // Max 3 richieste concorrenti, coda di 10

   // Middleware per applicare il bulkhead
   function applyBulkhead(req, res, next) {
     recensioniBulkhead.execute(() => {
       return new Promise((resolve) => {
         // Simula un'operazione che richiede tempo
         setTimeout(() => {
           resolve();
           next();
         }, 500);
       });
     }).catch(error => {
       if (error.message === 'Bulkhead full') {
         res.status(503).json({ messaggio: 'Servizio temporaneamente sovraccarico. Riprova più tardi.' });
       } else {
         res.status(500).json({ messaggio: 'Errore interno del server' });
       }
     });
   }

   // Applica il bulkhead a tutte le richieste
   app.use(applyBulkhead);

   // Endpoint per ottenere tutte le recensioni
   app.get('/api/recensioni', (req, res) => {
     res.json(recensioni);
   });

   // Endpoint per ottenere le recensioni di un prodotto specifico
   app.get('/api/recensioni/prodotto/:id', (req, res) => {
     const prodottoId = parseInt(req.params.id);
     const recensioniProdotto = recensioni.filter(r => r.prodottoId === prodottoId);
     
     res.json(recensioniProdotto);
   });

   // Endpoint per creare una nuova recensione
   app.post('/api/recensioni', (req, res) => {
     const nuovaRecensione = {
       id: recensioni.length + 1,
       prodottoId: req.body.prodottoId,
       utente: req.body.utente,
       testo: req.body.testo,
       valutazione: req.body.valutazione
     };
     
     recensioni.push(nuovaRecensione);
     res.status(201).json(nuovaRecensione);
   });

   app.listen(PORT, () => {
     console.log(`Servizio Recensioni in esecuzione sulla porta ${PORT}`);
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
     "name": "microservizi-resilienza",
     "version": "1.0.0",
     "description": "Demo di pattern di resilienza per microservizi",
     "main": "index.js",
     "scripts": {
       "start-gateway": "cd api-gateway && node index.js",
       "start-prodotti": "cd servizio-prodotti && node index.js",
       "start-recensioni": "cd servizio-recensioni && node index.js",
       "start": "concurrently \"npm run start-gateway\" \"npm run start-prodotti\" \"npm run start-recensioni\""
     },
     "keywords": [
       "microservizi",
       "resilienza",
       "circuit-breaker",
       "bulkhead",
       "node.js"
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

### 6. Test dei Pattern di Resilienza

1. Avvia tutti i servizi:
   ```bash
   npm start
   ```

2. Testa il Circuit Breaker:
   - Accedi a `http://localhost:3000/api/prodotti/1` più volte
   - Spegni il servizio prodotti e continua a fare richieste per vedere il fallback in azione
   - Riavvia il servizio e osserva come il circuit breaker si richiude

3. Testa il Bulkhead:
   - Utilizza uno strumento come Apache Bench o wrk per inviare molte richieste concorrenti al servizio recensioni
   - Osserva come alcune richieste vengono rifiutate quando il bulkhead è pieno

## Esercizi Aggiuntivi

1. **Implementa il Rate Limiting**: Aggiungi un meccanismo per limitare il numero di richieste per utente o IP in un determinato periodo di tempo.

2. **Aggiungi Metriche e Monitoraggio**: Implementa un sistema per raccogliere metriche sui pattern di resilienza (ad esempio, quante volte il circuit breaker si è aperto).

3. **Implementa il Cache Fallback**: Aggiungi una cache per memorizzare i risultati recenti e utilizzarli come fallback quando un servizio non è disponibile.

4. **Implementa il Retry con Backoff Esponenziale**: Modifica il pattern retry per utilizzare un backoff esponenziale per evitare di sovraccaricare i servizi in difficoltà.

5. **Aggiungi Health Checks**: Implementa endpoint di health check per ogni servizio e utilizza queste informazioni per prendere decisioni di routing.

## Risorse Aggiuntive

- [Opossum - Circuit Breaker per Node.js](https://github.com/nodeshift/opossum)
- [Pattern di Resilienza - Microsoft Azure Architecture](https://docs.microsoft.com/it-it/azure/architecture/patterns/category/resiliency)
- [Hystrix - Libreria di Resilienza di Netflix](https://github.com/Netflix/Hystrix)
- [Resilience4j - Libreria di Resilienza ispirata a Hystrix](https://github.com/resilience4j/resilience4j)

## Conclusione

In questo esercizio, hai implementato diversi pattern di resilienza fondamentali per architetture a microservizi. Hai creato un API Gateway con Circuit Breaker, un servizio prodotti che simula problemi di rete, e un servizio recensioni con il pattern Bulkhead. Questi pattern aiutano a costruire sistemi distribuiti robusti che possono gestire guasti, sovraccarichi e altri problemi comuni nelle architetture distribuite.

La resilienza è un aspetto fondamentale delle architetture a microservizi, in quanto consente di creare sistemi che possono continuare a funzionare anche quando alcuni componenti sono temporaneamente non disponibili o sovraccarichi. Implementando questi pattern, puoi migliorare significativamente l'affidabilità e la disponibilità dei tuoi sistemi distribuiti.