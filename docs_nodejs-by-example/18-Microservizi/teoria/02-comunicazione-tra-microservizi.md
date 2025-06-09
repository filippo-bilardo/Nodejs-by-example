# Comunicazione tra Microservizi

## Introduzione alla Comunicazione tra Microservizi

In un'architettura a microservizi, la comunicazione efficace tra i diversi servizi è fondamentale per il funzionamento dell'intero sistema. Poiché ogni microservizio è un'entità indipendente con il proprio dominio di responsabilità, è necessario stabilire meccanismi di comunicazione affidabili, efficienti e scalabili.

## Modelli di Comunicazione

### Comunicazione Sincrona vs Asincrona

#### Comunicazione Sincrona
- **Definizione**: Il client attende una risposta dal servizio prima di continuare l'esecuzione
- **Protocolli comuni**: REST, gRPC, GraphQL
- **Vantaggi**: Semplicità, feedback immediato, coerenza
- **Svantaggi**: Accoppiamento temporale, potenziali problemi di latenza, minore resilienza

#### Comunicazione Asincrona
- **Definizione**: Il client non attende una risposta immediata e può continuare l'esecuzione
- **Tecnologie comuni**: Message brokers (RabbitMQ, Kafka), eventi
- **Vantaggi**: Disaccoppiamento, migliore resilienza, scalabilità
- **Svantaggi**: Maggiore complessità, gestione più difficile della consistenza dei dati

## Protocolli di Comunicazione

### REST (Representational State Transfer)

```javascript
// Esempio di API REST in Express.js
const express = require('express');
const app = express();

app.get('/api/products', (req, res) => {
  // Logica per ottenere i prodotti
  res.json({ products: [...] });
});

app.post('/api/orders', (req, res) => {
  // Logica per creare un ordine
  res.status(201).json({ orderId: 'new-order-id' });
});

app.listen(3000);
```

**Caratteristiche**:
- Basato su HTTP/HTTPS
- Utilizza metodi standard (GET, POST, PUT, DELETE)
- Stateless (senza stato)
- Risorse identificate da URI
- Rappresentazioni multiple (JSON, XML, ecc.)

**Casi d'uso ideali**:
- API pubbliche
- Operazioni CRUD semplici
- Quando la semplicità è prioritaria

### gRPC

```javascript
// Definizione del servizio in Protocol Buffers (file .proto)
// service.proto
service ProductService {
  rpc GetProduct(ProductRequest) returns (ProductResponse);
  rpc CreateProduct(CreateProductRequest) returns (ProductResponse);
}

// Implementazione del server in Node.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('service.proto');
const serviceProto = grpc.loadPackageDefinition(packageDefinition);

function getProduct(call, callback) {
  // Logica per ottenere un prodotto
  callback(null, { id: call.request.id, name: 'Product Name' });
}

const server = new grpc.Server();
server.addService(serviceProto.ProductService.service, { getProduct });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
});
```

**Caratteristiche**:
- Basato su HTTP/2
- Utilizza Protocol Buffers per la serializzazione
- Supporta streaming bidirezionale
- Fortemente tipizzato
- Generazione automatica di client e server

**Casi d'uso ideali**:
- Comunicazione tra microservizi interni
- Quando le prestazioni sono critiche
- Sistemi con contratti ben definiti

### GraphQL

```javascript
// Definizione dello schema GraphQL
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Product {
    id: ID!
    name: String!
    price: Float!
  }
  
  type Query {
    product(id: ID!): Product
    products: [Product]
  }
  
  type Mutation {
    createProduct(name: String!, price: Float!): Product
  }
`;

const resolvers = {
  Query: {
    product: (_, { id }) => {
      // Logica per ottenere un prodotto specifico
    },
    products: () => {
      // Logica per ottenere tutti i prodotti
    }
  },
  Mutation: {
    createProduct: (_, { name, price }) => {
      // Logica per creare un prodotto
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
});
```

**Caratteristiche**:
- Query language per API
- Il client specifica esattamente i dati di cui ha bisogno
- Singolo endpoint
- Fortemente tipizzato
- Introspettivo (auto-documentante)

**Casi d'uso ideali**:
- Frontend con requisiti di dati complessi
- Riduzione del numero di richieste
- API flessibili con diversi client

### Message Brokers (RabbitMQ, Kafka)

```javascript
// Esempio con RabbitMQ in Node.js
const amqp = require('amqplib');

// Producer
async function sendMessage() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'orders_queue';
  
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify({ orderId: '123', items: [...] })), {
    persistent: true
  });
  
  console.log('Message sent');
  setTimeout(() => connection.close(), 500);
}

// Consumer
async function receiveMessages() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  const queue = 'orders_queue';
  
  await channel.assertQueue(queue, { durable: true });
  channel.prefetch(1);
  
  console.log('Waiting for messages');
  channel.consume(queue, (msg) => {
    const order = JSON.parse(msg.content.toString());
    console.log('Processing order:', order.orderId);
    
    // Logica per processare l'ordine
    
    channel.ack(msg);
  }, { noAck: false });
}
```

**Caratteristiche**:
- Comunicazione asincrona
- Disaccoppiamento tra producer e consumer
- Supporto per diversi pattern di messaggistica (pub/sub, code, ecc.)
- Garanzie di consegna configurabili

**Casi d'uso ideali**:
- Operazioni asincrone
- Elaborazione in background
- Sistemi event-driven
- Quando è richiesta alta scalabilità

## Pattern di Comunicazione

### API Gateway

L'API Gateway funge da punto di ingresso unico per i client, instradando le richieste ai microservizi appropriati e aggregando le risposte.

**Vantaggi**:
- Nasconde la complessità interna del sistema ai client
- Offre un punto centralizzato per funzionalità trasversali (autenticazione, rate limiting, ecc.)
- Può aggregare dati da più servizi

**Implementazione in Node.js**:

```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Autenticazione middleware
app.use((req, res, next) => {
  const token = req.headers.authorization;
  // Logica di validazione del token
  next();
});

// Routing ai microservizi
app.use('/api/products', createProxyMiddleware({ 
  target: 'http://product-service:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/products': '/products' }
}));

app.use('/api/orders', createProxyMiddleware({ 
  target: 'http://order-service:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '/orders' }
}));

// Endpoint aggregato
app.get('/api/user-dashboard', async (req, res) => {
  try {
    // Richieste parallele a più servizi
    const [userResponse, ordersResponse] = await Promise.all([
      fetch(`http://user-service:3003/users/${req.query.userId}`),
      fetch(`http://order-service:3002/orders?userId=${req.query.userId}`)
    ]);
    
    const user = await userResponse.json();
    const orders = await ordersResponse.json();
    
    res.json({ user, recentOrders: orders.slice(0, 5) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});
```

### Backend for Frontend (BFF)

Il pattern BFF prevede la creazione di API gateway specifici per diversi tipi di client (web, mobile, ecc.).

**Vantaggi**:
- Ottimizzazione per le esigenze specifiche di ciascun client
- Riduzione del traffico di rete
- Separazione delle preoccupazioni

### Circuit Breaker

Il pattern Circuit Breaker previene il fallimento a cascata interrompendo le chiamate a servizi non disponibili.

**Implementazione con Opossum**:

```javascript
const CircuitBreaker = require('opossum');
const axios = require('axios');

// Funzione che potrebbe fallire
async function callProductService(id) {
  const response = await axios.get(`http://product-service:3001/products/${id}`);
  return response.data;
}

// Configurazione del circuit breaker
const breaker = new CircuitBreaker(callProductService, {
  failureThreshold: 50,    // Percentuale di fallimenti per aprire il circuito
  resetTimeout: 10000,      // Tempo in ms prima di provare a chiudere il circuito
  timeout: 3000,            // Timeout per la chiamata
  errorThresholdPercentage: 50  // Percentuale di errori per aprire il circuito
});

// Gestione degli eventi
breaker.on('open', () => console.log('Circuit breaker opened'));
breaker.on('close', () => console.log('Circuit breaker closed'));
breaker.on('halfOpen', () => console.log('Circuit breaker half-open'));
breaker.on('fallback', () => console.log('Fallback called'));

// Utilizzo
async function getProduct(id) {
  try {
    return await breaker.fire(id);
  } catch (error) {
    // Fallback quando il circuito è aperto o la chiamata fallisce
    return { id, name: 'Default Product', price: 0 };
  }
}
```

### Saga Pattern

Il pattern Saga gestisce transazioni distribuite attraverso più microservizi, implementando compensazioni in caso di fallimento.

**Tipi di Saga**:
- **Orchestration**: Un servizio centrale coordina l'intera transazione
- **Choreography**: I servizi comunicano tramite eventi senza un coordinatore centrale

**Esempio di Choreography Saga con eventi**:

```javascript
// Order Service
const kafka = require('kafka-node');
const Producer = kafka.Producer;

async function createOrder(orderData) {
  // 1. Salva l'ordine con stato 'pending'
  const order = await db.orders.create({ ...orderData, status: 'pending' });
  
  // 2. Pubblica evento 'order-created'
  const producer = new Producer(client);
  producer.send([{
    topic: 'order-events',
    messages: JSON.stringify({
      type: 'order-created',
      payload: { orderId: order.id, userId: order.userId, amount: order.amount }
    })
  }], (err, result) => {
    console.log('Event published');
  });
  
  return order;
}

// Ascolta eventi di compensazione
const consumer = new kafka.Consumer(client, [{ topic: 'order-events' }]);
consumer.on('message', async (message) => {
  const event = JSON.parse(message.value);
  
  if (event.type === 'payment-failed') {
    // Compensa annullando l'ordine
    await db.orders.update(
      { status: 'cancelled' },
      { where: { id: event.payload.orderId } }
    );
    console.log(`Order ${event.payload.orderId} cancelled due to payment failure`);
  }
});

// Payment Service
const consumer = new kafka.Consumer(client, [{ topic: 'order-events' }]);
consumer.on('message', async (message) => {
  const event = JSON.parse(message.value);
  
  if (event.type === 'order-created') {
    try {
      // Processa il pagamento
      const result = await processPayment(event.payload.userId, event.payload.amount);
      
      // Pubblica evento 'payment-processed'
      producer.send([{
        topic: 'order-events',
        messages: JSON.stringify({
          type: 'payment-processed',
          payload: { orderId: event.payload.orderId }
        })
      }]);
    } catch (error) {
      // Pubblica evento 'payment-failed' per compensazione
      producer.send([{
        topic: 'order-events',
        messages: JSON.stringify({
          type: 'payment-failed',
          payload: { orderId: event.payload.orderId, reason: error.message }
        })
      }]);
    }
  }
});
```

## Gestione della Consistenza dei Dati

### Consistenza Eventuale

In un sistema distribuito, è spesso necessario accettare una consistenza eventuale dei dati piuttosto che una consistenza immediata.

**Strategie**:
- **Event Sourcing**: Memorizzazione di tutti i cambiamenti come sequenza di eventi
- **CQRS (Command Query Responsibility Segregation)**: Separazione delle operazioni di lettura e scrittura
- **Compensating Transactions**: Operazioni che annullano gli effetti di transazioni fallite

## Monitoraggio e Tracciamento

### Distributed Tracing

Il tracciamento distribuito permette di seguire una richiesta attraverso tutti i microservizi coinvolti.

**Implementazione con OpenTelemetry**:

```javascript
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');

// Configurazione del provider di tracciamento
const provider = new NodeTracerProvider();

// Configurazione dell'esportatore Jaeger
const exporter = new JaegerExporter({
  serviceName: 'product-service',
  host: 'jaeger',
  port: 6832,
});

// Registrazione del processore di span
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

// Registrazione delle strumentazioni automatiche
registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

// Applicazione Express
const express = require('express');
const app = express();

app.get('/products/:id', async (req, res) => {
  // Il tracciamento è automatico grazie alle strumentazioni
  // È possibile aggiungere span personalizzati
  const tracer = provider.getTracer('product-service');
  const span = tracer.startSpan('fetch-product-details');
  
  try {
    // Logica per ottenere il prodotto
    const product = await db.products.findByPk(req.params.id);
    span.setStatus({ code: SpanStatusCode.OK });
    res.json(product);
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });
    res.status(500).json({ error: 'Failed to fetch product' });
  } finally {
    span.end();
  }
});

app.listen(3001);
```

### Health Checks

I controlli di salute permettono di monitorare lo stato dei microservizi.

```javascript
const express = require('express');
const app = express();

// Endpoint di health check semplice
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Endpoint di health check dettagliato
app.get('/health/detailed', async (req, res) => {
  try {
    // Verifica connessione al database
    await db.authenticate();
    const dbStatus = 'UP';
  } catch (error) {
    const dbStatus = 'DOWN';
  }
  
  // Verifica dipendenze esterne
  let paymentServiceStatus = 'UNKNOWN';
  try {
    const response = await axios.get('http://payment-service:3002/health', { timeout: 2000 });
    paymentServiceStatus = response.data.status;
  } catch (error) {
    paymentServiceStatus = 'DOWN';
  }
  
  const overallStatus = dbStatus === 'UP' && paymentServiceStatus === 'UP' ? 'UP' : 'DOWN';
  
  res.status(overallStatus === 'UP' ? 200 : 503).json({
    status: overallStatus,
    components: {
      db: { status: dbStatus },
      paymentService: { status: paymentServiceStatus }
    }
  });
});

app.listen(3001);
```

## Conclusione

La comunicazione efficace tra microservizi è fondamentale per costruire sistemi distribuiti robusti e scalabili. La scelta del modello e del protocollo di comunicazione dipende dalle specifiche esigenze del sistema, considerando fattori come latenza, accoppiamento, resilienza e consistenza dei dati.

Non esiste una soluzione universale: spesso i sistemi più efficaci combinano diversi approcci, utilizzando comunicazione sincrona dove è richiesta coerenza immediata e comunicazione asincrona dove è prioritaria la resilienza.

Nel prossimo capitolo, esploreremo come containerizzare i microservizi utilizzando Docker e come orchestrarli con Kubernetes per gestire efficacemente il deployment, la scalabilità e la resilienza in ambienti di produzione.