# Comunicazione Asincrona tra Microservizi con RabbitMQ

## Obiettivo
In questo esercizio, imparerai a implementare la comunicazione asincrona tra microservizi utilizzando RabbitMQ come message broker. Creerai un sistema in cui i servizi possono comunicare in modo disaccoppiato attraverso code di messaggi, implementando pattern come publish/subscribe e worker queues.

## Prerequisiti
- Node.js e npm installati
- Conoscenza di base di Express.js
- Conoscenza di base dei microservizi (completamento dell'esercizio 01)
- Docker (per eseguire RabbitMQ in un container)

## Concetti Chiave

### Message Broker
Un message broker è un intermediario che consente ai servizi di comunicare senza conoscersi direttamente. RabbitMQ è uno dei message broker più popolari e implementa il protocollo AMQP (Advanced Message Queuing Protocol).

### Modelli di Messaggistica
- **Publish/Subscribe**: Un produttore pubblica messaggi che vengono ricevuti da tutti i consumatori iscritti
- **Worker Queues**: I messaggi vengono distribuiti tra più worker per bilanciare il carico
- **Routing**: I messaggi vengono instradati in base a criteri specifici

## Passaggi

### 1. Configurazione dell'Ambiente

1. Crea una directory principale per il progetto:
   ```bash
   mkdir microservizi-rabbitmq
   cd microservizi-rabbitmq
   ```

2. Crea le sottodirectory per i microservizi:
   ```bash
   mkdir servizio-ordini servizio-notifiche servizio-inventario
   ```

3. Avvia RabbitMQ utilizzando Docker:
   ```bash
   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```
   Questo comando avvia RabbitMQ con l'interfaccia di gestione accessibile su http://localhost:15672 (username: guest, password: guest).

### 2. Implementazione del Servizio Ordini (Produttore)

1. Inizializza il progetto per il servizio ordini:
   ```bash
   cd servizio-ordini
   npm init -y
   npm install express amqplib body-parser cors
   ```

2. Crea il file `index.js` per il servizio ordini:
   ```javascript
   // servizio-ordini/index.js
   const express = require('express');
   const bodyParser = require('body-parser');
   const cors = require('cors');
   const amqp = require('amqplib');

   const app = express();
   const PORT = process.env.PORT || 3001;
   
   app.use(cors());
   app.use(bodyParser.json());
   
   // Connessione a RabbitMQ
   let channel;
   
   async function connectToRabbitMQ() {
     try {
       const connection = await amqp.connect('amqp://localhost');
       channel = await connection.createChannel();
       
       // Dichiarazione delle code
       await channel.assertQueue('ordini_creati', { durable: true });
       await channel.assertExchange('notifiche', 'fanout', { durable: true });
       
       console.log('Connesso a RabbitMQ');
     } catch (error) {
       console.error('Errore di connessione a RabbitMQ:', error);
       setTimeout(connectToRabbitMQ, 5000);
     }
   }
   
   connectToRabbitMQ();
   
   // Database simulato
   const ordini = [];
   
   // Endpoint per creare un nuovo ordine
   app.post('/api/ordini', async (req, res) => {
     try {
       const nuovoOrdine = {
         id: ordini.length + 1,
         cliente: req.body.cliente,
         prodotti: req.body.prodotti,
         totale: req.body.totale,
         stato: 'creato',
         dataCreazione: new Date()
       };
       
       ordini.push(nuovoOrdine);
       
       // Invia messaggio alla coda per l'elaborazione dell'ordine
       await channel.sendToQueue(
         'ordini_creati', 
         Buffer.from(JSON.stringify(nuovoOrdine)),
         { persistent: true }
       );
       
       // Pubblica evento per notifiche
       await channel.publish(
         'notifiche', 
         '', 
         Buffer.from(JSON.stringify({
           tipo: 'nuovo_ordine',
           ordine: nuovoOrdine
         }))
       );
       
       res.status(201).json(nuovoOrdine);
     } catch (error) {
       console.error('Errore nella creazione dell\'ordine:', error);
       res.status(500).json({ messaggio: 'Errore interno del server' });
     }
   });
   
   // Endpoint per ottenere tutti gli ordini
   app.get('/api/ordini', (req, res) => {
     res.json(ordini);
   });
   
   // Endpoint per ottenere un ordine specifico
   app.get('/api/ordini/:id', (req, res) => {
     const id = parseInt(req.params.id);
     const ordine = ordini.find(o => o.id === id);
     
     if (!ordine) {
       return res.status(404).json({ messaggio: 'Ordine non trovato' });
     }
     
     res.json(ordine);
   });
   
   app.listen(PORT, () => {
     console.log(`Servizio Ordini in esecuzione sulla porta ${PORT}`);
   });
   ```

### 3. Implementazione del Servizio Inventario (Worker)

1. Inizializza il progetto per il servizio inventario:
   ```bash
   cd ../servizio-inventario
   npm init -y
   npm install amqplib
   ```

2. Crea il file `index.js` per il servizio inventario:
   ```javascript
   // servizio-inventario/index.js
   const amqp = require('amqplib');
   
   // Database simulato dell'inventario
   const inventario = [
     { id: 1, nome: 'Laptop', quantità: 10 },
     { id: 2, nome: 'Smartphone', quantità: 15 },
     { id: 3, nome: 'Tablet', quantità: 8 }
   ];
   
   async function connectToRabbitMQ() {
     try {
       const connection = await amqp.connect('amqp://localhost');
       const channel = await connection.createChannel();
       
       // Dichiarazione della coda
       await channel.assertQueue('ordini_creati', { durable: true });
       
       // Imposta prefetch a 1 per distribuire equamente il carico tra i worker
       channel.prefetch(1);
       
       console.log('Servizio Inventario in attesa di ordini...');
       
       // Consumo dei messaggi dalla coda
       channel.consume('ordini_creati', async (msg) => {
         if (msg !== null) {
           const ordine = JSON.parse(msg.content.toString());
           console.log(`Elaborazione ordine #${ordine.id} per l'inventario`);
           
           // Simula l'aggiornamento dell'inventario
           let inventarioSufficiente = true;
           
           for (const prodotto of ordine.prodotti) {
             const itemInventario = inventario.find(i => i.id === prodotto.id);
             
             if (!itemInventario || itemInventario.quantità < prodotto.quantità) {
               inventarioSufficiente = false;
               console.log(`Inventario insufficiente per il prodotto ${prodotto.id}`);
               break;
             }
           }
           
           if (inventarioSufficiente) {
             // Aggiorna l'inventario
             for (const prodotto of ordine.prodotti) {
               const itemInventario = inventario.find(i => i.id === prodotto.id);
               itemInventario.quantità -= prodotto.quantità;
             }
             
             console.log('Inventario aggiornato con successo');
           } else {
             console.log('Ordine non elaborato: inventario insufficiente');
           }
           
           // Simula un'operazione che richiede tempo
           await new Promise(resolve => setTimeout(resolve, 2000));
           
           // Conferma l'elaborazione del messaggio
           channel.ack(msg);
         }
       });
     } catch (error) {
       console.error('Errore di connessione a RabbitMQ:', error);
       setTimeout(connectToRabbitMQ, 5000);
     }
   }
   
   connectToRabbitMQ();
   ```

### 4. Implementazione del Servizio Notifiche (Subscriber)

1. Inizializza il progetto per il servizio notifiche:
   ```bash
   cd ../servizio-notifiche
   npm init -y
   npm install amqplib
   ```

2. Crea il file `index.js` per il servizio notifiche:
   ```javascript
   // servizio-notifiche/index.js
   const amqp = require('amqplib');
   
   async function connectToRabbitMQ() {
     try {
       const connection = await amqp.connect('amqp://localhost');
       const channel = await connection.createChannel();
       
       // Dichiarazione dell'exchange
       await channel.assertExchange('notifiche', 'fanout', { durable: true });
       
       // Creazione di una coda esclusiva e temporanea
       const { queue } = await channel.assertQueue('', { exclusive: true });
       
       // Binding della coda all'exchange
       await channel.bindQueue(queue, 'notifiche', '');
       
       console.log('Servizio Notifiche in attesa di eventi...');
       
       // Consumo dei messaggi
       channel.consume(queue, (msg) => {
         if (msg !== null) {
           const evento = JSON.parse(msg.content.toString());
           
           console.log('Evento ricevuto:', evento);
           
           // Simula l'invio di notifiche in base al tipo di evento
           switch (evento.tipo) {
             case 'nuovo_ordine':
               console.log(`Invio email al cliente ${evento.ordine.cliente.email}: "Il tuo ordine #${evento.ordine.id} è stato ricevuto!"`);  
               break;
             default:
               console.log(`Evento sconosciuto: ${evento.tipo}`);
           }
           
           // Acknowledge del messaggio
           channel.ack(msg);
         }
       });
     } catch (error) {
       console.error('Errore di connessione a RabbitMQ:', error);
       setTimeout(connectToRabbitMQ, 5000);
     }
   }
   
   connectToRabbitMQ();
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
     "name": "microservizi-rabbitmq",
     "version": "1.0.0",
     "description": "Demo di comunicazione asincrona tra microservizi con RabbitMQ",
     "main": "index.js",
     "scripts": {
       "start-ordini": "cd servizio-ordini && node index.js",
       "start-inventario": "cd servizio-inventario && node index.js",
       "start-notifiche": "cd servizio-notifiche && node index.js",
       "start": "concurrently \"npm run start-ordini\" \"npm run start-inventario\" \"npm run start-notifiche\""
     },
     "keywords": [
       "microservizi",
       "rabbitmq",
       "node.js",
       "messaggistica"
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

### 6. Test del Sistema

1. Avvia tutti i servizi:
   ```bash
   npm start
   ```

2. Crea un nuovo ordine utilizzando curl o Postman:
   ```bash
   curl -X POST http://localhost:3001/api/ordini \
     -H "Content-Type: application/json" \
     -d '{
       "cliente": {
         "nome": "Mario Rossi",
         "email": "mario@example.com"
       },
       "prodotti": [
         {"id": 1, "nome": "Laptop", "prezzo": 999.99, "quantità": 1},
         {"id": 3, "nome": "Tablet", "prezzo": 299.99, "quantità": 2}
       ],
       "totale": 1599.97
     }'
   ```

3. Osserva i log dei vari servizi per vedere come l'ordine viene elaborato, l'inventario aggiornato e le notifiche inviate.

## Esercizi Aggiuntivi

1. **Implementa il Pattern Request/Reply**: Aggiungi un meccanismo per cui il servizio ordini attende una risposta dal servizio inventario prima di confermare l'ordine.

2. **Aggiungi Gestione degli Errori**: Implementa un sistema di dead-letter queue per gestire i messaggi che non possono essere elaborati.

3. **Implementa il Circuit Breaker**: Aggiungi un pattern circuit breaker per gestire i fallimenti di connessione a RabbitMQ.

4. **Aggiungi Persistenza**: Sostituisci gli array in memoria con un database MongoDB o SQLite.

5. **Implementa il Routing Basato su Chiavi**: Utilizza un exchange di tipo 'direct' o 'topic' per instradare i messaggi in base a criteri specifici.

## Risorse Aggiuntive

- [RabbitMQ - Documentazione Ufficiale](https://www.rabbitmq.com/documentation.html)
- [amqplib - GitHub](https://github.com/squaremo/amqp.node)
- [Pattern di Messaggistica - Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)
- [Docker - Documentazione Ufficiale](https://docs.docker.com/)

## Conclusione

In questo esercizio, hai implementato un sistema di comunicazione asincrona tra microservizi utilizzando RabbitMQ. Hai creato tre servizi che comunicano attraverso code di messaggi, implementando pattern come publish/subscribe e worker queues. Questa architettura consente ai servizi di operare in modo disaccoppiato, migliorando la scalabilità e la resilienza del sistema.

La comunicazione asincrona è un pattern fondamentale nelle architetture a microservizi, in quanto consente di gestire picchi di carico, implementare operazioni in background e creare sistemi più robusti che possono continuare a funzionare anche quando alcuni componenti sono temporaneamente non disponibili.