# Testing dei Microservizi

## Introduzione al Testing dei Microservizi

Il testing di un'architettura a microservizi presenta sfide uniche rispetto alle applicazioni monolitiche. La natura distribuita dei microservizi richiede approcci di testing specifici per garantire che i singoli servizi funzionino correttamente e che l'intero sistema si comporti come previsto. In questo capitolo, esploreremo le strategie, le tecniche e gli strumenti per testare efficacemente i microservizi.

## Livelli di Testing per i Microservizi

### 1. Unit Testing

I test unitari verificano il comportamento di singole unità di codice in isolamento.

```javascript
// Esempio di test unitario con Jest per un servizio prodotti
const ProductService = require('../services/product-service');
const mockDb = require('../__mocks__/db');

// Mock del database
jest.mock('../db', () => mockDb);

describe('ProductService', () => {
  let productService;
  
  beforeEach(() => {
    productService = new ProductService();
    mockDb.products.clear();
  });
  
  test('should return product by id', async () => {
    // Arrange
    const mockProduct = { id: '1', name: 'Test Product', price: 99.99 };
    mockDb.products.set('1', mockProduct);
    
    // Act
    const product = await productService.getProductById('1');
    
    // Assert
    expect(product).toEqual(mockProduct);
  });
  
  test('should throw error when product not found', async () => {
    // Act & Assert
    await expect(productService.getProductById('999')).rejects.toThrow('Product not found');
  });
});
```

### 2. Integration Testing

I test di integrazione verificano l'interazione tra diversi componenti o servizi.

```javascript
// Esempio di test di integrazione con Supertest per un'API REST
const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Product API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });
  
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
  
  beforeEach(async () => {
    await mongoose.connection.collection('products').deleteMany({});
  });
  
  test('GET /api/products should return empty array initially', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body).toEqual({ products: [] });
  });
  
  test('POST /api/products should create a new product', async () => {
    const newProduct = { name: 'Test Product', price: 99.99 };
    
    const response = await request(app)
      .post('/api/products')
      .send(newProduct)
      .expect('Content-Type', /json/)
      .expect(201);
    
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(newProduct.name);
    expect(response.body.price).toBe(newProduct.price);
  });
});
```

### 3. Contract Testing

I test di contratto verificano che le API rispettino i contratti definiti tra i servizi.

```javascript
// Esempio di test di contratto con Pact.js
const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { OrderService } = require('../services/order-service');

describe('Order Service - Product Service Integration', () => {
  const provider = new PactV3({
    consumer: 'OrderService',
    provider: 'ProductService'
  });
  
  const productId = '1';
  const expectedProduct = {
    id: productId,
    name: 'Test Product',
    price: 99.99,
    inStock: true
  };
  
  beforeAll(() => {
    provider
      .given('a product exists')
      .uponReceiving('a request to get a product')
      .withRequest({
        method: 'GET',
        path: `/api/products/${productId}`
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: MatchersV3.like(expectedProduct)
      });
  });
  
  test('should get product details from Product Service', async () => {
    await provider.executeTest(async (mockServer) => {
      const orderService = new OrderService(mockServer.url);
      const product = await orderService.getProductDetails(productId);
      
      expect(product).toEqual(expectedProduct);
    });
  });
});
```

### 4. End-to-End Testing

I test end-to-end verificano il comportamento dell'intero sistema dal punto di vista dell'utente.

```javascript
// Esempio di test end-to-end con Cypress
describe('E-commerce Workflow', () => {
  beforeEach(() => {
    // Setup: pulisci il database e crea dati di test
    cy.request('POST', '/api/test/reset');
    cy.request('POST', '/api/test/seed');
    
    // Visita la homepage
    cy.visit('/');
  });
  
  it('should allow a user to browse products, add to cart, and checkout', () => {
    // Naviga alla pagina dei prodotti
    cy.get('[data-cy=nav-products]').click();
    
    // Verifica che i prodotti siano visualizzati
    cy.get('[data-cy=product-card]').should('have.length.at.least', 1);
    
    // Seleziona il primo prodotto
    cy.get('[data-cy=product-card]').first().click();
    
    // Aggiungi al carrello
    cy.get('[data-cy=add-to-cart]').click();
    
    // Verifica notifica di conferma
    cy.get('[data-cy=notification]').should('contain', 'Prodotto aggiunto al carrello');
    
    // Vai al carrello
    cy.get('[data-cy=nav-cart]').click();
    
    // Verifica che il prodotto sia nel carrello
    cy.get('[data-cy=cart-item]').should('have.length', 1);
    
    // Procedi al checkout
    cy.get('[data-cy=checkout-button]').click();
    
    // Compila il form di checkout
    cy.get('[data-cy=checkout-form]').within(() => {
      cy.get('[name=name]').type('Test User');
      cy.get('[name=email]').type('test@example.com');
      cy.get('[name=address]').type('123 Test St');
      cy.get('[name=city]').type('Test City');
      cy.get('[name=zip]').type('12345');
      cy.get('[name=cardNumber]').type('4242424242424242');
      cy.get('[name=cardExpiry]').type('12/25');
      cy.get('[name=cardCvc]').type('123');
      
      cy.get('[type=submit]').click();
    });
    
    // Verifica conferma ordine
    cy.url().should('include', '/order-confirmation');
    cy.get('[data-cy=order-confirmation]').should('be.visible');
    cy.get('[data-cy=order-number]').should('exist');
  });
});
```

## Strategie di Testing per Microservizi

### 1. Testing in Isolamento

Testare i microservizi in isolamento utilizzando mock o stub per simulare le dipendenze esterne.

```javascript
// Esempio di utilizzo di nock per simulare API esterne
const nock = require('nock');
const OrderService = require('../services/order-service');

describe('OrderService', () => {
  let orderService;
  
  beforeEach(() => {
    orderService = new OrderService('https://product-service.example.com');
  });
  
  afterEach(() => {
    nock.cleanAll();
  });
  
  test('should create order with product details', async () => {
    // Mock della risposta del servizio prodotti
    nock('https://product-service.example.com')
      .get('/api/products/1')
      .reply(200, {
        id: '1',
        name: 'Test Product',
        price: 99.99,
        inStock: true
      });
    
    const order = await orderService.createOrder({
      userId: 'user123',
      items: [{ productId: '1', quantity: 2 }]
    });
    
    expect(order).toHaveProperty('id');
    expect(order.items[0].productName).toBe('Test Product');
    expect(order.items[0].unitPrice).toBe(99.99);
    expect(order.totalAmount).toBe(199.98);
  });
});
```

### 2. Testing con Container

Utilizzare container Docker per testare i microservizi in un ambiente isolato ma realistico.

```javascript
// Esempio di test con Testcontainers
const { GenericContainer } = require('testcontainers');
const axios = require('axios');

describe('Product Service with MongoDB', () => {
  let container;
  let mongoUri;
  let app;
  let server;
  
  beforeAll(async () => {
    // Avvia un container MongoDB
    container = await new GenericContainer('mongo:4.4')
      .withExposedPorts(27017)
      .start();
    
    // Configura l'URI di MongoDB
    const host = container.getHost();
    const port = container.getMappedPort(27017);
    mongoUri = `mongodb://${host}:${port}/test`;
    
    // Configura e avvia l'applicazione
    process.env.MONGODB_URI = mongoUri;
    app = require('../app');
    server = app.listen(3000);
  }, 60000);
  
  afterAll(async () => {
    server.close();
    await container.stop();
  });
  
  test('should create and retrieve a product', async () => {
    // Crea un prodotto
    const createResponse = await axios.post('http://localhost:3000/api/products', {
      name: 'Test Product',
      price: 99.99
    });
    
    expect(createResponse.status).toBe(201);
    expect(createResponse.data).toHaveProperty('id');
    
    const productId = createResponse.data.id;
    
    // Recupera il prodotto
    const getResponse = await axios.get(`http://localhost:3000/api/products/${productId}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.data.name).toBe('Test Product');
    expect(getResponse.data.price).toBe(99.99);
  });
});
```

### 3. Testing con Ambienti Effimeri

Creare ambienti di test completi ma temporanei per ogni esecuzione di test.

```yaml
# Esempio di configurazione GitHub Actions per test in ambiente effimero
name: Microservices Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:4.4
        ports:
          - 27017:27017
      
      rabbitmq:
        image: rabbitmq:3-management
        ports:
          - 5672:5672
          - 15672:15672
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start services
        run: |
          cd product-service
          npm ci
          npm start &
          cd ../order-service
          npm ci
          npm start &
          sleep 10
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          PRODUCT_SERVICE_URL: http://localhost:3001
          ORDER_SERVICE_URL: http://localhost:3002
          MONGODB_URI: mongodb://localhost:27017/test
          RABBITMQ_URL: amqp://localhost:5672
```

## Strumenti di Testing per Microservizi

### 1. Framework di Testing

- **Jest**: Framework di testing completo per JavaScript
- **Mocha**: Framework di testing flessibile
- **AVA**: Framework di testing con esecuzione parallela

### 2. Strumenti per API Testing

- **Supertest**: Libreria per testare API HTTP
- **Postman/Newman**: Strumenti per testare API manualmente e in modo automatizzato
- **Pact**: Strumento per contract testing

### 3. Strumenti per Test End-to-End

- **Cypress**: Framework moderno per test end-to-end
- **Playwright**: Strumento per automatizzare browser
- **Selenium**: Strumento tradizionale per l'automazione del browser

## Best Practices per il Testing dei Microservizi

1. **Piramide di Testing**: Seguire la piramide di testing con molti test unitari, alcuni test di integrazione e pochi test end-to-end

```
    /\
   /  \
  /E2E \
 /------\
/Integra-\
/ zione   \
/----------\
/   Unit    \
/------------\
```

2. **Automazione**: Automatizzare tutti i test e integrarli nel processo CI/CD
3. **Isolamento**: Assicurarsi che i test siano isolati e non dipendano da altri test
4. **Idempotenza**: I test dovrebbero poter essere eseguiti più volte con lo stesso risultato
5. **Velocità**: Ottimizzare i test per l'esecuzione rapida, specialmente i test unitari
6. **Copertura**: Monitorare la copertura del codice per identificare aree non testate
7. **Test di Resilienza**: Testare come il sistema si comporta in caso di fallimenti (Chaos Testing)

```javascript
// Esempio di test di resilienza con Chaos Monkey
const chaosMonkey = require('chaos-monkey-middleware');
const express = require('express');

const app = express();

// Aggiungi Chaos Monkey solo in ambiente di test
if (process.env.NODE_ENV === 'test-chaos') {
  app.use(chaosMonkey({
    probability: 0.1, // 10% di probabilità di errore
    statusCode: 500,
    minLatency: 500,
    maxLatency: 3000
  }));
}

// Rotte normali dell'applicazione
app.get('/api/products', (req, res) => {
  // ...
});

module.exports = app;
```

8. **Monitoraggio dei Test**: Utilizzare strumenti come Allure o TestRail per monitorare i risultati dei test nel tempo

## Testing in Produzione

### 1. Feature Flags

Utilizzare feature flags per abilitare gradualmente nuove funzionalità in produzione.

```javascript
// Esempio di utilizzo di feature flags con LaunchDarkly
const LaunchDarkly = require('launchdarkly-node-server-sdk');
const express = require('express');

const app = express();
const ldClient = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);

app.get('/api/checkout', async (req, res) => {
  const user = {
    key: req.user.id,
    email: req.user.email,
    custom: {
      groups: req.user.groups
    }
  };
  
  // Controlla se la nuova esperienza di checkout è abilitata per questo utente
  const newCheckoutEnabled = await ldClient.variation('new-checkout-experience', user, false);
  
  if (newCheckoutEnabled) {
    // Utilizza il nuovo flusso di checkout
    return res.json({ checkoutUrl: '/new-checkout' });
  } else {
    // Utilizza il flusso di checkout esistente
    return res.json({ checkoutUrl: '/checkout' });
  }
});
```

### 2. Canary Deployment

Rilasciare nuove versioni a un sottoinsieme di utenti per testare in produzione.

```yaml
# Esempio di Canary Deployment con Kubernetes
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: product-service
spec:
  hosts:
  - product-service
  http:
  - route:
    - destination:
        host: product-service
        subset: v1
      weight: 90
    - destination:
        host: product-service
        subset: v2
      weight: 10
```

### 3. Synthetic Monitoring

Utilizzare test automatizzati che simulano il comportamento degli utenti in produzione.

```javascript
// Esempio di synthetic monitoring con Puppeteer
const puppeteer = require('puppeteer');
const { sendAlert } = require('./monitoring');

async function checkProductPage() {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    
    // Misura il tempo di caricamento
    const startTime = Date.now();
    await page.goto('https://example.com/products/popular');
    const loadTime = Date.now() - startTime;
    
    // Verifica che gli elementi critici siano presenti
    const productCards = await page.$$('.product-card');
    const addToCartButtons = await page.$$('.add-to-cart-button');
    
    if (productCards.length === 0 || addToCartButtons.length === 0) {
      await sendAlert('Elementi critici mancanti nella pagina dei prodotti');
    }
    
    if (loadTime > 3000) {
      await sendAlert(`Tempo di caricamento eccessivo: ${loadTime}ms`);
    }
    
    console.log(`Controllo completato: ${productCards.length} prodotti, tempo di caricamento: ${loadTime}ms`);
  } catch (error) {
    await sendAlert(`Errore nel synthetic monitoring: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Esegui il controllo ogni 5 minuti
setInterval(checkProductPage, 5 * 60 * 1000);
```

## Conclusione

Il testing efficace è fondamentale per garantire la qualità e l'affidabilità di un'architettura a microservizi. Adottando una combinazione di diverse strategie di testing, dall'unit testing al testing in produzione, è possibile identificare e risolvere i problemi prima che raggiungano gli utenti finali.

La chiave è trovare il giusto equilibrio tra copertura, velocità e costo dei test, automatizzando il più possibile e integrando il testing nel processo di sviluppo e deployment. Con un approccio ben strutturato al testing, è possibile sfruttare appieno i vantaggi dei microservizi mantenendo al contempo un'elevata qualità del software.

Nel prossimo capitolo, esploreremo le strategie di sicurezza per i microservizi, un altro aspetto cruciale per costruire sistemi distribuiti robusti e affidabili.