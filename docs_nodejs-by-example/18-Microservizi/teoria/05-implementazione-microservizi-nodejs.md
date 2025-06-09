# Implementazione di Microservizi con Node.js

## Introduzione

Node.js è particolarmente adatto per l'implementazione di microservizi grazie alla sua natura leggera, non bloccante e orientata agli eventi. In questo documento, esploreremo le tecniche, i framework e le best practices per implementare microservizi efficaci con Node.js.

## Framework per Microservizi in Node.js

### 1. Express.js

Express.js è il framework web più popolare per Node.js e rappresenta una scelta eccellente per la creazione di microservizi grazie alla sua semplicità e flessibilità.

**Esempio di microservizio base con Express:**

```javascript
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Middleware per logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rotte API
app.get('/api/products', (req, res) => {
  // Logica per recuperare i prodotti
  res.json([
    { id: 1, name: 'Prodotto 1', price: 99.99 },
    { id: 2, name: 'Prodotto 2', price: 149.99 }
  ]);
});

app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  // Logica per recuperare un prodotto specifico
  res.json({ id: productId, name: `Prodotto ${productId}`, price: 99.99 });
});

// Middleware per gestione errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Errore interno del server' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.listen(port, () => {
  console.log(`Microservizio in ascolto sulla porta ${port}`);
});
```

### 2. Nest.js

Nest.js è un framework progressivo per la creazione di applicazioni server-side efficienti e scalabili, ispirato ad Angular.

**Esempio di microservizio con Nest.js:**

```typescript
// product.controller.ts
import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const product = this.productService.findOne(+id);
    if (!product) {
      throw new HttpException('Prodotto non trovato', HttpStatus.NOT_FOUND);
    }
    return product;
  }
}

// product.service.ts
import { Injectable } from '@nestjs/common';

export interface Product {
  id: number;
  name: string;
  price: number;
}

@Injectable()
export class ProductService {
  private readonly products: Product[] = [
    { id: 1, name: 'Prodotto 1', price: 99.99 },
    { id: 2, name: 'Prodotto 2', price: 149.99 },
  ];

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product | undefined {
    return this.products.find(product => product.id === id);
  }
}

// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
}
bootstrap();
```

### 3. Moleculer

Moleculer è un framework di microservizi progressivo per Node.js, progettato specificamente per la creazione di servizi modulari e scalabili.

**Esempio di microservizio con Moleculer:**

```javascript
const { ServiceBroker } = require('moleculer');

// Crea un broker di servizi
const broker = new ServiceBroker({
  nodeID: 'product-service',
  transporter: 'NATS',
  logLevel: 'info'
});

// Definisci un servizio
broker.createService({
  name: 'products',
  
  actions: {
    list: {
      cache: {
        keys: [],
        ttl: 60 // secondi
      },
      handler() {
        return [
          { id: 1, name: 'Prodotto 1', price: 99.99 },
          { id: 2, name: 'Prodotto 2', price: 149.99 }
        ];
      }
    },
    
    get: {
      params: {
        id: 'number'
      },
      cache: {
        keys: ['id'],
        ttl: 60 // secondi
      },
      handler(ctx) {
        const { id } = ctx.params;
        // Logica per recuperare un prodotto specifico
        return { id, name: `Prodotto ${id}`, price: 99.99 };
      }
    }
  },
  
  events: {
    'inventory.updated'(payload) {
      // Gestisci l'evento quando l'inventario viene aggiornato
      this.logger.info('Inventario aggiornato:', payload);
    }
  }
});

// Avvia il broker
broker.start()
  .then(() => broker.repl());
```

### 4. Fastify

Fastify è un framework web ad alte prestazioni, con un focus sulla velocità e sull'efficienza.

**Esempio di microservizio con Fastify:**

```javascript
const fastify = require('fastify')({ logger: true });

// Registra il supporto per JSON
fastify.register(require('fastify-cors'));

// Definisci gli schemi per la validazione
const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    price: { type: 'number' }
  }
};

// Rotte API
fastify.get('/api/products', async (request, reply) => {
  return [
    { id: 1, name: 'Prodotto 1', price: 99.99 },
    { id: 2, name: 'Prodotto 2', price: 149.99 }
  ];
});

fastify.get('/api/products/:id', {
  schema: {
    params: {
      type: 'object',
      properties: {
        id: { type: 'integer' }
      }
    },
    response: {
      200: productSchema
    }
  }
}, async (request, reply) => {
  const productId = parseInt(request.params.id);
  return { id: productId, name: `Prodotto ${productId}`, price: 99.99 };
});

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'UP' };
});

// Avvia il server
const start = async () => {
  try {
    await fastify.listen(3000, '0.0.0.0');
    fastify.log.info(`Server in ascolto su ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

## Struttura del Progetto per Microservizi

Una buona struttura del progetto è fondamentale per la manutenibilità dei microservizi.

### Approccio Monorepo

```
/
├── packages/
│   ├── service-auth/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── service-products/
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── Dockerfile
│   └── service-orders/
│       ├── src/
│       ├── tests/
│       ├── package.json
│       └── Dockerfile
├── package.json
├── lerna.json
└── docker-compose.yml
```

### Approccio Multi-repo

Ogni servizio ha il proprio repository:

```
/service-auth/
├── src/
├── tests/
├── package.json
└── Dockerfile

/service-products/
├── src/
├── tests/
├── package.json
└── Dockerfile

/service-orders/
├── src/
├── tests/
├── package.json
└── Dockerfile
```

## Comunicazione tra Microservizi

### 1. REST API

```javascript
// Servizio client che chiama un altro microservizio
const axios = require('axios');

async function getProductDetails(productId) {
  try {
    const response = await axios.get(`http://product-service:3000/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei dettagli del prodotto:', error.message);
    throw new Error('Servizio prodotti non disponibile');
  }
}

// Utilizzo in un endpoint Express
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    
    // Arricchisci l'ordine con i dettagli del prodotto
    const productDetails = await getProductDetails(order.productId);
    
    res.json({
      ...order,
      product: productDetails
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. Message Broker (RabbitMQ)

```javascript
const amqp = require('amqplib');

// Produttore di messaggi
async function publishOrderCreated(order) {
  try {
    const connection = await amqp.connect('amqp://rabbitmq:5672');
    const channel = await connection.createChannel();
    
    const exchange = 'orders';
    const routingKey = 'order.created';
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    
    channel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(order)),
      { persistent: true }
    );
    
    console.log(`Messaggio pubblicato: ${routingKey}`);
    
    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error('Errore nella pubblicazione del messaggio:', error.message);
    throw error;
  }
}

// Consumatore di messaggi
async function setupOrderCreatedConsumer() {
  try {
    const connection = await amqp.connect('amqp://rabbitmq:5672');
    const channel = await connection.createChannel();
    
    const exchange = 'orders';
    const queue = 'inventory-order-created';
    const routingKey = 'order.created';
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);
    
    console.log(`In attesa di messaggi su ${queue}`);
    
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const order = JSON.parse(msg.content.toString());
        console.log(`Ordine ricevuto: ${order.id}`);
        
        // Aggiorna l'inventario
        await updateInventory(order);
        
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Errore nella configurazione del consumatore:', error.message);
    throw error;
  }
}

async function updateInventory(order) {
  // Logica per aggiornare l'inventario
  console.log(`Inventario aggiornato per l'ordine ${order.id}`);
}

// Avvia il consumatore
setupOrderCreatedConsumer().catch(console.error);
```

### 3. gRPC

```javascript
// product.proto
syntax = "proto3";

package product;

service ProductService {
  rpc GetProduct (ProductRequest) returns (ProductResponse) {}
  rpc ListProducts (Empty) returns (ProductList) {}
}

message Empty {}

message ProductRequest {
  int32 id = 1;
}

message ProductResponse {
  int32 id = 1;
  string name = 2;
  double price = 3;
}

message ProductList {
  repeated ProductResponse products = 1;
}
```

```javascript
// Server gRPC
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/product.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const productProto = grpc.loadPackageDefinition(packageDefinition).product;

// Implementazione del servizio
const server = new grpc.Server();

server.addService(productProto.ProductService.service, {
  getProduct: (call, callback) => {
    const productId = call.request.id;
    // Logica per recuperare un prodotto specifico
    callback(null, { id: productId, name: `Prodotto ${productId}`, price: 99.99 });
  },
  
  listProducts: (call, callback) => {
    // Logica per recuperare tutti i prodotti
    callback(null, {
      products: [
        { id: 1, name: 'Prodotto 1', price: 99.99 },
        { id: 2, name: 'Prodotto 2', price: 149.99 }
      ]
    });
  }
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Errore nell\'avvio del server:', err);
    return;
  }
  console.log(`Server gRPC in ascolto sulla porta ${port}`);
  server.start();
});
```

```javascript
// Client gRPC
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/product.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const productProto = grpc.loadPackageDefinition(packageDefinition).product;
const client = new productProto.ProductService(
  'product-service:50051',
  grpc.credentials.createInsecure()
);

// Utilizzo del client
function getProduct(id) {
  return new Promise((resolve, reject) => {
    client.getProduct({ id }, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response);
    });
  });
}

function listProducts() {
  return new Promise((resolve, reject) => {
    client.listProducts({}, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response.products);
    });
  });
}

// Esempio di utilizzo
async function main() {
  try {
    const product = await getProduct(1);
    console.log('Prodotto:', product);
    
    const products = await listProducts();
    console.log('Lista prodotti:', products);
  } catch (error) {
    console.error('Errore:', error);
  }
}

main();
```

## Gestione della Configurazione

### 1. Variabili d'Ambiente

```javascript
// config.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || 'microservice_db',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  },
  services: {
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:3002',
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3003'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672'
  }
};
```

### 2. Configurazione Centralizzata

```javascript
// Utilizzo di Consul per la configurazione centralizzata
const Consul = require('consul');
const consul = new Consul({
  host: process.env.CONSUL_HOST || 'localhost',
  port: process.env.CONSUL_PORT || 8500
});

async function getConfig(key) {
  return new Promise((resolve, reject) => {
    consul.kv.get(key, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!result) {
        resolve(null);
        return;
      }
      
      try {
        const value = result.Value ? JSON.parse(Buffer.from(result.Value, 'base64').toString()) : null;
        resolve(value);
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function loadConfig() {
  try {
    const serviceConfig = await getConfig('services/product-service');
    
    if (serviceConfig) {
      // Applica la configurazione
      console.log('Configurazione caricata da Consul:', serviceConfig);
      return serviceConfig;
    } else {
      console.warn('Configurazione non trovata in Consul, utilizzo dei valori predefiniti');
      return require('./default-config');
    }
  } catch (error) {
    console.error('Errore nel caricamento della configurazione da Consul:', error.message);
    console.warn('Utilizzo dei valori predefiniti');
    return require('./default-config');
  }
}

module.exports = { loadConfig };
```

## Resilienza e Tolleranza ai Guasti

### 1. Circuit Breaker

```javascript
const CircuitBreaker = require('opossum');

// Funzione che chiama un servizio esterno
async function callProductService(productId) {
  const response = await axios.get(`http://product-service:3000/api/products/${productId}`);
  return response.data;
}

// Configurazione del circuit breaker
const options = {
  timeout: 3000, // Timeout in millisecondi
  errorThresholdPercentage: 50, // Percentuale di errori per aprire il circuito
  resetTimeout: 10000 // Tempo prima di riprovare in millisecondi
};

const breaker = new CircuitBreaker(callProductService, options);

// Eventi del circuit breaker
breaker.on('open', () => {
  console.log('Circuit breaker aperto - troppe richieste fallite');
});

breaker.on('halfOpen', () => {
  console.log('Circuit breaker semi-aperto - tentativo di ripristino');
});

breaker.on('close', () => {
  console.log('Circuit breaker chiuso - servizio funzionante');
});

breaker.on('fallback', (result) => {
  console.log('Fallback eseguito:', result);
});

// Utilizzo del circuit breaker
async function getProductWithCircuitBreaker(productId) {
  try {
    return await breaker.fire(productId);
  } catch (error) {
    console.error('Errore nel recupero del prodotto:', error.message);
    // Restituisci dati di fallback
    return { id: productId, name: 'Prodotto temporaneamente non disponibile', price: 0 };
  }
}
```

### 2. Retry con Backoff Esponenziale

```javascript
const axios = require('axios');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

async function retryWithExponentialBackoff(fn, maxRetries = 5, initialDelay = 100) {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      
      if (retries > maxRetries) {
        throw error;
      }
      
      // Calcola il ritardo con jitter per evitare thundering herd
      const delay = initialDelay * Math.pow(2, retries) + Math.random() * 100;
      console.log(`Tentativo ${retries} fallito. Nuovo tentativo tra ${delay}ms`);
      
      await sleep(delay);
    }
  }
}

async function getProductWithRetry(productId) {
  return retryWithExponentialBackoff(async () => {
    const response = await axios.get(`http://product-service:3000/api/products/${productId}`);
    return response.data;
  });
}
```

### 3. Bulkhead Pattern

```javascript
const Bottleneck = require('bottleneck');

// Crea limiter separati per diversi servizi
const productServiceLimiter = new Bottleneck({
  maxConcurrent: 5, // Massimo numero di richieste concorrenti
  minTime: 50 // Tempo minimo tra le richieste in ms
});

const orderServiceLimiter = new Bottleneck({
  maxConcurrent: 3,
  minTime: 100
});

// Funzioni limitate
const getProduct = productServiceLimiter.wrap(async (productId) => {
  const response = await axios.get(`http://product-service:3000/api/products/${productId}`);
  return response.data;
});

const createOrder = orderServiceLimiter.wrap(async (orderData) => {
  const response = await axios.post('http://order-service:3000/api/orders', orderData);
  return response.data;
});

// Utilizzo
async function processOrder(orderData) {
  try {
    // Queste chiamate sono isolate l'una dall'altra
    const product = await getProduct(orderData.productId);
    const order = await createOrder({
      ...orderData,
      productName: product.name,
      productPrice: product.price
    });
    
    return order;
  } catch (error) {
    console.error('Errore nell\'elaborazione dell\'ordine:', error.message);
    throw error;
  }
}
```

## Monitoraggio e Logging

### 1. Logging Strutturato

```javascript
const winston = require('winston');
const { format } = winston;

// Crea un ID di correlazione per tracciare le richieste attraverso i microservizi
const correlationIdMiddleware = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('x-correlation-id', req.correlationId);
  next();
};

// Configurazione del logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'product-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Middleware di logging per Express
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Logga all'inizio della richiesta
  logger.info('Richiesta ricevuta', {
    correlationId: req.correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Intercetta la fine della richiesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Richiesta completata', {
      correlationId: req.correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration
    });
  });
  
  next();
};

// Utilizzo in Express
app.use(correlationIdMiddleware);
app.use(loggingMiddleware);

// Esempio di utilizzo del logger nelle route
app.get('/api/products/:id', (req, res) => {
  try {
    logger.debug('Recupero dettagli prodotto', {
      correlationId: req.correlationId,
      productId: req.params.id
    });
    
    // Logica per recuperare il prodotto
    const product = { id: req.params.id, name: 'Prodotto di esempio', price: 99.99 };
    
    logger.info('Prodotto recuperato con successo', {
      correlationId: req.correlationId,
      productId: req.params.id
    });
    
    res.json(product);
  } catch (error) {
    logger.error('Errore nel recupero del prodotto', {
      correlationId: req.correlationId,
      productId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ error: 'Errore interno del server' });
  }
});
```

### 2. Metriche con Prometheus

```javascript
const express = require('express');
const promClient = require('prom-client');
const app = express();

// Crea un registro per le metriche
const register = new promClient.Registry();

// Aggiungi le metriche predefinite
promClient.collectDefaultMetrics({ register });

// Crea contatori personalizzati
const httpRequestsTotal = new promClient.Counter({