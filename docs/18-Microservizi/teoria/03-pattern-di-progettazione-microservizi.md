# Pattern di Progettazione per Microservizi

## Introduzione ai Pattern di Progettazione

I pattern di progettazione rappresentano soluzioni consolidate a problemi ricorrenti nell'architettura a microservizi. Questi pattern aiutano a risolvere sfide comuni come la gestione della configurazione, la scoperta dei servizi, la resilienza e la scalabilità. Implementare questi pattern correttamente è fondamentale per costruire un'architettura a microservizi robusta ed efficiente.

## Pattern di Decomposizione

### Decomposizione per Capacità di Business

Questo pattern suggerisce di suddividere i microservizi in base alle capacità di business dell'organizzazione.

**Vantaggi**:
- Allineamento con la struttura organizzativa
- Chiara separazione delle responsabilità
- Facilita la comprensione del dominio

**Esempio**:
- Servizio Ordini
- Servizio Prodotti
- Servizio Utenti
- Servizio Pagamenti

### Decomposizione per Sottodominio (Domain-Driven Design)

Basato sui principi del Domain-Driven Design (DDD), questo pattern suggerisce di identificare i "bounded contexts" (contesti delimitati) all'interno del dominio e creare microservizi attorno a questi.

```javascript
// Esempio di entità in un bounded context "Catalogo"
class Product {
  constructor(id, name, description, price, categoryId) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.categoryId = categoryId;
  }
  
  applyDiscount(percentage) {
    this.price = this.price * (1 - percentage / 100);
    return this;
  }
}

// Esempio di entità in un bounded context "Ordini"
class OrderItem {
  constructor(productId, productName, quantity, unitPrice) {
    this.productId = productId;
    this.productName = productName; // Duplicazione deliberata dal contesto Catalogo
    this.quantity = quantity;
    this.unitPrice = unitPrice;
  }
  
  getTotalPrice() {
    return this.quantity * this.unitPrice;
  }
}
```

**Vantaggi**:
- Modelli di dominio coesi
- Riduzione dell'accoppiamento tra servizi
- Migliore allineamento con il linguaggio degli esperti di dominio

## Pattern di Integrazione

### API Gateway

Funge da punto di ingresso unico per i client, instradando le richieste ai microservizi appropriati.

```javascript
// Implementazione semplificata di un API Gateway con Express
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Middleware per autenticazione
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // Logica di validazione del token
  next();
});

// Routing ai microservizi
app.use('/api/products', createProxyMiddleware({
  target: 'http://product-service:3001',
  changeOrigin: true
}));

app.use('/api/orders', createProxyMiddleware({
  target: 'http://order-service:3002',
  changeOrigin: true
}));

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});
```

**Vantaggi**:
- Nasconde la complessità interna ai client
- Centralizza funzionalità trasversali (autenticazione, logging, rate limiting)
- Può aggregare dati da più servizi

### Backend for Frontend (BFF)

Variante dell'API Gateway che prevede gateway specifici per diversi tipi di client.

```javascript
// BFF per client mobile
const express = require('express');
const axios = require('axios');
const app = express();

// Endpoint ottimizzato per mobile che aggrega dati da più servizi
app.get('/mobile/user-dashboard/:userId', async (req, res) => {
  try {
    // Richieste parallele ottimizzate per dispositivi mobili
    const [userResponse, ordersResponse] = await Promise.all([
      axios.get(`http://user-service:3003/users/${req.params.userId}?fields=id,name,email`),
      axios.get(`http://order-service:3002/orders/summary?userId=${req.params.userId}&limit=3`)
    ]);
    
    // Risposta ottimizzata per mobile (dati ridotti)
    res.json({
      user: userResponse.data,
      recentOrders: ordersResponse.data
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.listen(3100, () => {
  console.log('Mobile BFF running on port 3100');
});

// BFF per client web
const webApp = express();

webApp.get('/web/user-dashboard/:userId', async (req, res) => {
  try {
    // Richieste parallele con più dati per web
    const [userResponse, ordersResponse, recommendationsResponse] = await Promise.all([
      axios.get(`http://user-service:3003/users/${req.params.userId}?fields=id,name,email,address,preferences`),
      axios.get(`http://order-service:3002/orders?userId=${req.params.userId}&limit=10&includeDetails=true`),
      axios.get(`http://recommendation-service:3004/recommendations?userId=${req.params.userId}`)
    ]);
    
    // Risposta completa per web
    res.json({
      user: userResponse.data,
      orders: ordersResponse.data,
      recommendations: recommendationsResponse.data
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

webApp.listen(3200, () => {
  console.log('Web BFF running on port 3200');
});
```

**Vantaggi**:
- Ottimizzazione per le esigenze specifiche di ciascun client
- Riduzione del traffico di rete
- Migliore esperienza utente

### Event-Driven Architecture

I servizi comunicano attraverso eventi pubblicati su un message broker.

```javascript
// Pubblicazione di eventi con Kafka
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: ['kafka:9092']
});

const producer = kafka.producer();

async function createOrder(orderData) {
  // 1. Salva l'ordine nel database
  const order = await db.orders.create(orderData);
  
  // 2. Pubblica evento 'order-created'
  await producer.connect();
  await producer.send({
    topic: 'order-events',
    messages: [{
      key: order.id.toString(),
      value: JSON.stringify({
        type: 'order-created',
        data: {
          orderId: order.id,
          userId: order.userId,
          items: order.items,
          totalAmount: order.totalAmount,
          timestamp: new Date().toISOString()
        }
      })
    }]
  });
  
  return order;
}

// Consumo di eventi
const consumer = kafka.consumer({ groupId: 'inventory-service' });

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-events', fromBeginning: false });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      
      if (event.type === 'order-created') {
        // Aggiorna l'inventario
        for (const item of event.data.items) {
          await updateInventory(item.productId, item.quantity);
        }
        console.log(`Inventory updated for order ${event.data.orderId}`);
      }
    }
  });
}

startConsumer().catch(console.error);
```

**Vantaggi**:
- Disaccoppiamento tra servizi
- Scalabilità migliorata
- Resilienza (i servizi possono funzionare anche se altri sono inattivi)

## Pattern di Resilienza

### Circuit Breaker

Previene il fallimento a cascata interrompendo le chiamate a servizi non disponibili.

```javascript
const CircuitBreaker = require('opossum');
const axios = require('axios');

function getProductDetails(productId) {
  return axios.get(`http://product-service:3001/products/${productId}`)
    .then(response => response.data);
}

const breaker = new CircuitBreaker(getProductDetails, {
  failureThreshold: 50,    // Percentuale di fallimenti per aprire il circuito
  resetTimeout: 10000,      // Tempo in ms prima di provare a chiudere il circuito
  timeout: 3000,            // Timeout per la chiamata
  errorThresholdPercentage: 50  // Percentuale di errori per aprire il circuito
});

// Fallback function
breaker.fallback(() => ({
  id: 'unknown',
  name: 'Prodotto temporaneamente non disponibile',
  price: 0,
  isPlaceholder: true
}));

// Gestione degli eventi
breaker.on('open', () => console.log('Circuit breaker opened'));
breaker.on('close', () => console.log('Circuit breaker closed'));
breaker.on('halfOpen', () => console.log('Circuit breaker half-open'));
breaker.on('fallback', () => console.log('Fallback called'));

// Utilizzo
async function displayProductDetails(productId) {
  try {
    const product = await breaker.fire(productId);
    return product;
  } catch (error) {
    console.error('Failed to get product details:', error);
    throw error;
  }
}
```

**Stati del Circuit Breaker**:
- **Chiuso**: Le richieste passano normalmente
- **Aperto**: Le richieste falliscono immediatamente senza chiamare il servizio
- **Semi-aperto**: Alcune richieste passano per testare se il servizio è tornato disponibile

### Bulkhead

Isola le risorse per prevenire che un servizio sovraccarico influenzi altri servizi.

```javascript
const { Bulkhead } = require('cockatiel');
const axios = require('axios');

// Creazione di bulkhead separati per diversi servizi
const productBulkhead = new Bulkhead({
  maxConcurrent: 10,  // Numero massimo di richieste concorrenti
  timeout: 5000       // Timeout in ms
});

const orderBulkhead = new Bulkhead({
  maxConcurrent: 5,
  timeout: 10000
});

// Utilizzo con servizio prodotti
async function getProductDetails(productId) {
  return productBulkhead.execute(() => {
    return axios.get(`http://product-service:3001/products/${productId}`)
      .then(response => response.data);
  });
}

// Utilizzo con servizio ordini
async function getOrderDetails(orderId) {
  return orderBulkhead.execute(() => {
    return axios.get(`http://order-service:3002/orders/${orderId}`)
      .then(response => response.data);
  });
}
```

**Vantaggi**:
- Previene il sovraccarico di risorse
- Isola i fallimenti
- Migliora la stabilità complessiva del sistema

### Retry Pattern

Riprova automaticamente le operazioni fallite con una strategia di backoff.

```javascript
const { Policy } = require('cockatiel');
const axios = require('axios');

// Creazione di una policy di retry con backoff esponenziale
const retryPolicy = Policy.handleAll()
  .retry()
  .exponential({
    maxAttempts: 5,        // Numero massimo di tentativi
    initialDelay: 100,     // Ritardo iniziale in ms
    maxDelay: 10000,       // Ritardo massimo in ms
    factor: 2              // Fattore di moltiplicazione per il backoff
  });

// Utilizzo della policy
async function processPayment(paymentData) {
  return retryPolicy.execute(async () => {
    console.log('Attempting payment processing...');
    const response = await axios.post('http://payment-service:3004/payments', paymentData);
    return response.data;
  });
}

// Esempio di utilizzo
async function checkout(orderId, paymentDetails) {
  try {
    const result = await processPayment({
      orderId,
      amount: paymentDetails.amount,
      method: paymentDetails.method,
      cardDetails: paymentDetails.cardDetails
    });
    
    console.log('Payment processed successfully:', result.transactionId);
    return result;
  } catch (error) {
    console.error('Payment processing failed after multiple attempts:', error);
    throw new Error('Unable to process payment at this time');
  }
}
```

**Strategie di Backoff**:
- **Backoff costante**: Attesa di un tempo fisso tra i tentativi
- **Backoff lineare**: Aumento lineare del tempo di attesa
- **Backoff esponenziale**: Aumento esponenziale del tempo di attesa
- **Backoff esponenziale con jitter**: Aggiunge casualità per evitare picchi di richieste

## Pattern di Gestione dei Dati

### Database per Servizio

Ogni microservizio ha il proprio database, garantendo l'indipendenza e l'incapsulamento dei dati.

```javascript
// Servizio Prodotti con il proprio database
const express = require('express');
const { Sequelize } = require('sequelize');

// Database dedicato per il servizio prodotti
const sequelize = new Sequelize('products_db', 'user', 'password', {
  host: 'products-db',
  dialect: 'postgres'
});

const Product = sequelize.define('Product', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: Sequelize.STRING,
  description: Sequelize.TEXT,
  price: Sequelize.DECIMAL(10, 2),
  categoryId: Sequelize.UUID
});

const app = express();
app.use(express.json());

app.get('/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.listen(3001, () => {
  console.log('Product service running on port 3001');
});

// Servizio Ordini con il proprio database
const orderSequelize = new Sequelize('orders_db', 'user', 'password', {
  host: 'orders-db',
  dialect: 'postgres'
});

const Order = orderSequelize.define('Order', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  userId: Sequelize.UUID,
  status: Sequelize.STRING,
  totalAmount: Sequelize.DECIMAL(10, 2)
});

const OrderItem = orderSequelize.define('OrderItem', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  orderId: Sequelize.UUID,
  productId: Sequelize.UUID,
  productName: Sequelize.STRING,  // Duplicazione deliberata
  quantity: Sequelize.INTEGER,
  unitPrice: Sequelize.DECIMAL(10, 2)
});

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
```

**Vantaggi**:
- Disaccoppiamento dei dati
- Libertà nella scelta del database più adatto
- Isolamento dei fallimenti

**Sfide**:
- Duplicazione dei dati
- Consistenza tra servizi
- Transazioni distribuite

### CQRS (Command Query Responsibility Segregation)

Separa le operazioni di lettura (query) dalle operazioni di scrittura (command).

```javascript
// Implementazione semplificata di CQRS
const express = require('express');
const { Sequelize } = require('sequelize');
const { MongoClient } = require('mongodb');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

// Database per scrittura (Commands)
const writeDb = new Sequelize('products_write_db', 'user', 'password', {
  host: 'products-write-db',
  dialect: 'postgres'
});

const Product = writeDb.define('Product', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  name: Sequelize.STRING,
  description: Sequelize.TEXT,
  price: Sequelize.DECIMAL(10, 2),
  categoryId: Sequelize.UUID,
  inventory: Sequelize.INTEGER
});

// Database per lettura (Queries) - MongoDB per query ottimizzate
let readDb;
MongoClient.connect('mongodb://products-read-db:27017', { useUnifiedTopology: true })
  .then(client => {
    readDb = client.db('products_read_db');
    console.log('Connected to read database');
  })
  .catch(console.error);

// Kafka per sincronizzazione
const kafka = new Kafka({
  clientId: 'product-service',
  brokers: ['kafka:9092']
});

const producer = kafka.producer();
producer.connect().catch(console.error);

// Command - Creazione prodotto
app.post('/products', async (req, res) => {
  try {
    // 1. Salva nel database di scrittura
    const product = await Product.create(req.body);
    
    // 2. Pubblica evento per aggiornare il database di lettura
    await producer.send({
      topic: 'product-events',
      messages: [{
        key: product.id,
        value: JSON.stringify({
          type: 'product-created',
          data: product.toJSON()
        })
      }]
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Query - Lettura prodotti
app.get('/products', async (req, res) => {
  try {
    // Usa il database di lettura ottimizzato per query
    const products = await readDb.collection('products')
      .find(req.query)  // Supporta facilmente filtri complessi
      .toArray();
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Consumer per aggiornare il database di lettura
const consumer = kafka.consumer({ groupId: 'product-read-db-updater' });

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'product-events', fromBeginning: false });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      
      if (event.type === 'product-created') {
        await readDb.collection('products').insertOne(event.data);
      } else if (event.type === 'product-updated') {
        await readDb.collection('products').updateOne(
          { id: event.data.id },
          { $set: event.data }
        );
      } else if (event.type === 'product-deleted') {
        await readDb.collection('products').deleteOne({ id: event.data.id });
      }
    }
  });
}

startConsumer().catch(console.error);

app.listen(3001, () => {
  console.log('Product service running on port 3001');
});
```

**Vantaggi**:
- Ottimizzazione per letture e scritture
- Scalabilità indipendente
- Supporto per modelli di dati diversi

### Event Sourcing

Memorizza tutti i cambiamenti come sequenza di eventi invece di memorizzare solo lo stato corrente.

```javascript
const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Database per gli eventi
let eventStore;
MongoClient.connect('mongodb://event-store:27017', { useUnifiedTopology: true })
  .then(client => {
    eventStore = client.db('event_store');
    console.log('Connected to event store');
  })
  .catch(console.error);

// Database per le viste materializzate
let viewStore;
MongoClient.connect('mongodb://view-store:27017', { useUnifiedTopology: true })
  .then(client => {
    viewStore = client.db('view_store');
    console.log('Connected to view store');
  })
  .catch(console.error);

// Command - Creazione prodotto
app.post('/products', async (req, res) => {
  try {
    const productId = uuidv4();
    const event = {
      id: uuidv4(),
      type: 'ProductCreated',
      aggregateId: productId,
      timestamp: new Date().toISOString(),
      data: {
        id: productId,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        categoryId: req.body.categoryId
      }
    };
    
    // Salva l'evento
    await eventStore.collection('product_events').insertOne(event);
    
    res.status(201).json({ id: productId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Command - Aggiornamento prezzo
app.patch('/products/:id/price', async (req, res) => {
  try {
    const event = {
      id: uuidv4(),
      type: 'ProductPriceChanged',
      aggregateId: req.params.id,
      timestamp: new Date().toISOString(),
      data: {
        price: req.body.price
      }
    };
    
    // Salva l'evento
    await eventStore.collection('product_events').insertOne(event);
    
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product price' });
  }
});

// Query - Lettura prodotto
app.get('/products/:id', async (req, res) => {
  try {
    // Legge dalla vista materializzata
    const product = await viewStore.collection('products').findOne({ id: req.params.id });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Ricostruzione dello stato da eventi
async function rebuildProductView(productId) {
  const events = await eventStore.collection('product_events')
    .find({ aggregateId: productId })
    .sort({ timestamp: 1 })
    .toArray();
  
  let product = {};
  
  for (const event of events) {
    if (event.type === 'ProductCreated') {
      product = { ...event.data };
    } else if (event.type === 'ProductPriceChanged') {
      product.price = event.data.price;
    } else if (event.type === 'ProductDescriptionChanged') {
      product.description = event.data.description;
    }
    // Gestisci altri tipi di eventi...
  }
  
  // Aggiorna la vista materializzata
  await viewStore.collection('products').updateOne(
    { id: productId },
    { $set: product },
    { upsert: true }
  );
  
  return product;
}

// Processo in background per aggiornare le viste materializzate
async function processEvents() {
  const lastProcessedEvent = await viewStore.collection('metadata').findOne({ id: 'last_processed_event' });
  const query = lastProcessedEvent ? { _id: { $gt: lastProcessedEvent.eventId } } : {};
  
  const events = await eventStore.collection('product_events')
    .find(query)
    .sort({ _id: 1 })
    .limit(100)
    .toArray();
  
  for (const event of events) {
    await rebuildProductView(event.aggregateId);
    
    // Aggiorna l'ultimo evento processato
    await viewStore.collection('metadata').updateOne(
      { id: 'last_processed_event' },
      { $set: { eventId: event._id } },
      { upsert: true }
    );
  }
  
  // Continua a processare eventi
  if (events.length > 0) {
    setTimeout(processEvents, 100);
  } else {
    setTimeout(processEvents, 1000);
  }
}

app.listen(3001, () => {
  console.log('Product service running on port 3001');
  processEvents().catch(console.error);
});
```

**Vantaggi**:
- Audit trail completo
- Possibilità di ricostruire lo stato in qualsiasi momento
- Supporto per viste multiple dello stesso dato

## Pattern di Deployment

### Sidecar

Affianca un container di supporto al container principale per fornire funzionalità aggiuntive.

```yaml
# Esempio di configurazione Kubernetes con sidecar
apiVersion: v1
kind: Pod
metadata:
  name: product-service
spec:
  containers:
  - name: product-app
    image: my-registry/product-service:latest
    ports:
    - containerPort: 3001
  - name: log-collector
    image: my-registry/log-collector:latest
    volumeMounts:
    - name: logs
      mountPath: /var/log
  - name: metrics-exporter
    image: my-registry/prometheus-exporter:latest
    ports:
    - containerPort: 9090
  volumes:
  - name: logs
    emptyDir: {}
```

**Vantaggi**:
- Separazione delle preoccupazioni
- Riutilizzo di componenti standard
- Facilita l'implementazione di funzionalità trasversali

### Blue-Green Deployment

Mantiene due ambienti identici (blu e verde) e passa il traffico da uno all'altro durante gli aggiornamenti.

```yaml
# Configurazione Kubernetes per Blue-Green Deployment
# Service che punta all'ambiente attivo
apiVersion: v1
kind: Service
metadata:
  name: product-service
spec:
  selector:
    app: product-service
    environment: blue  # Cambia a 'green' durante lo switch
  ports:
  - port: 80
    targetPort: 3001

---
# Deployment per l'ambiente Blue
apiVersion: apps/v1
kind: Deployment
metadata:
  name: