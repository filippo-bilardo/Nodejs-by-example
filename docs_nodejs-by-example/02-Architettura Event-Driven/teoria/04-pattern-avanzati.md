# Pattern Event-Driven Avanzati

## Introduzione

I pattern event-driven permettono di costruire architetture scalabili e disaccoppiate. Vediamo i pattern più comuni e le loro implementazioni in Node.js.

## 1. Observer Pattern

Il pattern base di EventEmitter.

### Implementazione Base

```javascript
class Subject extends EventEmitter {
  constructor() {
    super();
    this.state = null;
  }
  
  setState(newState) {
    this.state = newState;
    this.emit('state-changed', newState);
  }
  
  getState() {
    return this.state;
  }
}

class Observer {
  update(state) {
    console.log('State updated:', state);
  }
}

// Uso
const subject = new Subject();
const observer = new Observer();

subject.on('state-changed', (state) => observer.update(state));

subject.setState('active'); // Observer viene notificato
```

### Esempio Reale: Stock Ticker

```javascript
class StockTicker extends EventEmitter {
  constructor() {
    super();
    this.stocks = new Map();
  }
  
  updatePrice(symbol, price) {
    const oldPrice = this.stocks.get(symbol);
    this.stocks.set(symbol, price);
    
    this.emit('price-update', {
      symbol,
      oldPrice,
      newPrice: price,
      change: oldPrice ? ((price - oldPrice) / oldPrice * 100) : 0
    });
    
    // Eventi specifici per simbolo
    this.emit(`price-update:${symbol}`, price);
    
    // Alert su variazioni significative
    if (oldPrice && Math.abs(price - oldPrice) / oldPrice > 0.05) {
      this.emit('significant-change', { symbol, oldPrice, price });
    }
  }
}

const ticker = new StockTicker();

// Observer generico
ticker.on('price-update', ({ symbol, newPrice, change }) => {
  console.log(`${symbol}: $${newPrice} (${change.toFixed(2)}%)`);
});

// Observer per stock specifico
ticker.on('price-update:AAPL', (price) => {
  console.log(`Apple price: $${price}`);
});

// Alert observer
ticker.on('significant-change', ({ symbol, oldPrice, price }) => {
  console.log(`⚠️ ${symbol} changed significantly: ${oldPrice} → ${price}`);
});

ticker.updatePrice('AAPL', 150);
ticker.updatePrice('AAPL', 160); // +6.67% → significant change!
```

## 2. Publish/Subscribe Pattern

Disaccoppiamento totale tra publisher e subscriber tramite un message broker.

### Implementazione Message Broker

```javascript
class MessageBroker {
  constructor() {
    this.channels = new Map();
  }
  
  subscribe(channel, callback) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, []);
    }
    
    this.channels.get(channel).push(callback);
    
    // Ritorna funzione di unsubscribe
    return () => {
      const subscribers = this.channels.get(channel);
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }
  
  publish(channel, data) {
    if (!this.channels.has(channel)) {
      return;
    }
    
    this.channels.get(channel).forEach(callback => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in subscriber for ${channel}:`, err);
      }
    });
  }
  
  // Pattern matching per canali
  subscribePattern(pattern, callback) {
    // pattern: 'user.*' → 'user.created', 'user.deleted', etc.
    return this.subscribe(pattern, callback);
  }
  
  publishWithPattern(channel, data) {
    // Trova tutti i pattern che matchano
    for (const [pattern, callbacks] of this.channels) {
      if (this.matchesPattern(channel, pattern)) {
        callbacks.forEach(callback => callback(data));
      }
    }
  }
  
  matchesPattern(channel, pattern) {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(channel);
  }
}

// Uso
const broker = new MessageBroker();

// Publisher
class UserService {
  constructor(broker) {
    this.broker = broker;
  }
  
  createUser(user) {
    // ... create user
    this.broker.publish('user.created', user);
  }
  
  deleteUser(userId) {
    // ... delete user
    this.broker.publish('user.deleted', { userId });
  }
}

// Subscribers
class EmailService {
  constructor(broker) {
    broker.subscribe('user.created', (user) => {
      this.sendWelcomeEmail(user);
    });
  }
  
  sendWelcomeEmail(user) {
    console.log(`Sending welcome email to ${user.email}`);
  }
}

class AnalyticsService {
  constructor(broker) {
    // Ascolta tutti gli eventi user.*
    broker.subscribePattern('user.*', (data) => {
      this.trackEvent(data);
    });
  }
  
  trackEvent(data) {
    console.log('Analytics:', data);
  }
}

// Setup
const messageBroker = new MessageBroker();
const userService = new UserService(messageBroker);
new EmailService(messageBroker);
new AnalyticsService(messageBroker);

userService.createUser({ email: 'user@example.com' });
// Output:
// Sending welcome email to user@example.com
// Analytics: { email: 'user@example.com' }
```

### Pub/Sub con Redis

```javascript
const redis = require('redis');
const { EventEmitter } = require('events');

class RedisPubSub extends EventEmitter {
  constructor() {
    super();
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();
    
    this.subscriber.on('message', (channel, message) => {
      try {
        const data = JSON.parse(message);
        this.emit(channel, data);
      } catch (err) {
        this.emit('error', err);
      }
    });
  }
  
  async subscribe(channel) {
    await this.subscriber.subscribe(channel);
  }
  
  async publish(channel, data) {
    await this.publisher.publish(channel, JSON.stringify(data));
  }
  
  async unsubscribe(channel) {
    await this.subscriber.unsubscribe(channel);
  }
}

// Uso distribuito
const pubsub = new RedisPubSub();

// Service 1 (può essere in un processo diverso)
await pubsub.subscribe('orders');
pubsub.on('orders', (order) => {
  console.log('New order:', order);
});

// Service 2 (può essere in un altro server!)
await pubsub.publish('orders', { id: '123', total: 99.99 });
```

## 3. Event Sourcing

Salva tutti i cambiamenti come eventi, non solo lo stato finale.

### Implementazione Base

```javascript
class EventStore extends EventEmitter {
  constructor() {
    super();
    this.events = [];
    this.snapshots = new Map();
  }
  
  append(event) {
    event.timestamp = Date.now();
    event.version = this.events.length;
    
    this.events.push(event);
    this.emit('event-appended', event);
    this.emit(event.type, event);
  }
  
  getEvents(aggregateId, fromVersion = 0) {
    return this.events.filter(e => 
      e.aggregateId === aggregateId && e.version >= fromVersion
    );
  }
  
  getAllEvents() {
    return [...this.events];
  }
  
  // Snapshot per performance
  createSnapshot(aggregateId, state) {
    this.snapshots.set(aggregateId, {
      version: this.events.length,
      state
    });
  }
  
  getSnapshot(aggregateId) {
    return this.snapshots.get(aggregateId);
  }
}

class BankAccount {
  constructor(accountId, eventStore) {
    this.accountId = accountId;
    this.eventStore = eventStore;
    this.balance = 0;
    this.version = 0;
    
    // Ricostruisci stato dagli eventi
    this.rehydrate();
  }
  
  rehydrate() {
    // Cerca snapshot
    const snapshot = this.eventStore.getSnapshot(this.accountId);
    
    if (snapshot) {
      this.balance = snapshot.state.balance;
      this.version = snapshot.version;
    }
    
    // Applica eventi dopo snapshot
    const events = this.eventStore.getEvents(this.accountId, this.version);
    events.forEach(event => this.applyEvent(event));
  }
  
  deposit(amount) {
    const event = {
      type: 'account.deposited',
      aggregateId: this.accountId,
      data: { amount }
    };
    
    this.eventStore.append(event);
    this.applyEvent(event);
  }
  
  withdraw(amount) {
    if (this.balance < amount) {
      throw new Error('Insufficient funds');
    }
    
    const event = {
      type: 'account.withdrawn',
      aggregateId: this.accountId,
      data: { amount }
    };
    
    this.eventStore.append(event);
    this.applyEvent(event);
  }
  
  applyEvent(event) {
    switch (event.type) {
      case 'account.deposited':
        this.balance += event.data.amount;
        break;
      case 'account.withdrawn':
        this.balance -= event.data.amount;
        break;
    }
    
    this.version = event.version;
  }
  
  getBalance() {
    return this.balance;
  }
}

// Uso
const eventStore = new EventStore();

// Audit logger
eventStore.on('event-appended', (event) => {
  console.log(`Event: ${event.type} at ${new Date(event.timestamp)}`);
});

const account = new BankAccount('ACC001', eventStore);

account.deposit(1000);
account.withdraw(300);
account.deposit(500);

console.log('Current balance:', account.getBalance()); // 1200

// Ricostruisci stato da eventi
const account2 = new BankAccount('ACC001', eventStore);
console.log('Rehydrated balance:', account2.getBalance()); // 1200

// Analizza storia
const history = eventStore.getEvents('ACC001');
console.log('Account history:', history);
```

### Event Sourcing con Projection

```javascript
class AccountProjection {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this.accounts = new Map();
    
    // Ascolta nuovi eventi
    eventStore.on('account.deposited', (event) => this.handleDeposit(event));
    eventStore.on('account.withdrawn', (event) => this.handleWithdraw(event));
    
    // Ricostruisci da eventi esistenti
    this.rebuild();
  }
  
  rebuild() {
    this.accounts.clear();
    
    this.eventStore.getAllEvents().forEach(event => {
      if (event.type === 'account.deposited') {
        this.handleDeposit(event);
      } else if (event.type === 'account.withdrawn') {
        this.handleWithdraw(event);
      }
    });
  }
  
  handleDeposit(event) {
    const { aggregateId, data } = event;
    const current = this.accounts.get(aggregateId) || 0;
    this.accounts.set(aggregateId, current + data.amount);
  }
  
  handleWithdraw(event) {
    const { aggregateId, data } = event;
    const current = this.accounts.get(aggregateId) || 0;
    this.accounts.set(aggregateId, current - data.amount);
  }
  
  getBalance(accountId) {
    return this.accounts.get(accountId) || 0;
  }
  
  getAllBalances() {
    return Object.fromEntries(this.accounts);
  }
}

// Uso
const projection = new AccountProjection(eventStore);
console.log('All balances:', projection.getAllBalances());
```

## 4. CQRS (Command Query Responsibility Segregation)

Separa operazioni di lettura (query) da quelle di scrittura (command).

### Implementazione

```javascript
// COMMAND SIDE
class CommandHandler {
  constructor(eventStore) {
    this.eventStore = eventStore;
  }
  
  handle(command) {
    switch (command.type) {
      case 'CreateUser':
        return this.handleCreateUser(command);
      case 'UpdateEmail':
        return this.handleUpdateEmail(command);
      default:
        throw new Error(`Unknown command: ${command.type}`);
    }
  }
  
  handleCreateUser(command) {
    const event = {
      type: 'UserCreated',
      aggregateId: command.userId,
      data: {
        name: command.name,
        email: command.email
      }
    };
    
    this.eventStore.append(event);
    return event;
  }
  
  handleUpdateEmail(command) {
    const event = {
      type: 'EmailUpdated',
      aggregateId: command.userId,
      data: {
        newEmail: command.email
      }
    };
    
    this.eventStore.append(event);
    return event;
  }
}

// QUERY SIDE
class UserReadModel {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this.users = new Map();
    
    // Ascolta eventi
    eventStore.on('UserCreated', (event) => this.onUserCreated(event));
    eventStore.on('EmailUpdated', (event) => this.onEmailUpdated(event));
    
    // Rebuild da eventi esistenti
    this.rebuild();
  }
  
  rebuild() {
    this.users.clear();
    
    this.eventStore.getAllEvents().forEach(event => {
      if (event.type === 'UserCreated') {
        this.onUserCreated(event);
      } else if (event.type === 'EmailUpdated') {
        this.onEmailUpdated(event);
      }
    });
  }
  
  onUserCreated(event) {
    this.users.set(event.aggregateId, {
      id: event.aggregateId,
      name: event.data.name,
      email: event.data.email
    });
  }
  
  onEmailUpdated(event) {
    const user = this.users.get(event.aggregateId);
    if (user) {
      user.email = event.data.newEmail;
    }
  }
  
  getUser(userId) {
    return this.users.get(userId);
  }
  
  findByEmail(email) {
    return Array.from(this.users.values())
      .find(user => user.email === email);
  }
  
  getAllUsers() {
    return Array.from(this.users.values());
  }
}

// Uso
const eventStore = new EventStore();
const commandHandler = new CommandHandler(eventStore);
const readModel = new UserReadModel(eventStore);

// Write side (commands)
commandHandler.handle({
  type: 'CreateUser',
  userId: 'user-1',
  name: 'Mario Rossi',
  email: 'mario@example.com'
});

commandHandler.handle({
  type: 'UpdateEmail',
  userId: 'user-1',
  email: 'mario.rossi@example.com'
});

// Read side (queries)
console.log(readModel.getUser('user-1'));
console.log(readModel.findByEmail('mario.rossi@example.com'));
```

## 5. Mediator Pattern

Centralizza la comunicazione tra componenti.

### Implementazione

```javascript
class Mediator extends EventEmitter {
  constructor() {
    super();
    this.components = new Map();
  }
  
  register(name, component) {
    this.components.set(name, component);
    component.setMediator(this);
  }
  
  send(sender, event, data) {
    this.emit(event, { sender, data });
  }
}

class Component extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
    this.mediator = null;
  }
  
  setMediator(mediator) {
    this.mediator = mediator;
  }
  
  send(event, data) {
    if (this.mediator) {
      this.mediator.send(this.name, event, data);
    }
  }
}

// Esempio: Chat Room
class ChatRoom extends Mediator {
  constructor() {
    super();
    this.on('message', ({ sender, data }) => {
      // Broadcast a tutti tranne sender
      this.components.forEach((component, name) => {
        if (name !== sender) {
          component.receive(sender, data);
        }
      });
    });
  }
}

class User extends Component {
  sendMessage(message) {
    console.log(`${this.name} sends: ${message}`);
    this.send('message', message);
  }
  
  receive(sender, message) {
    console.log(`${this.name} received from ${sender}: ${message}`);
  }
}

// Uso
const chatRoom = new ChatRoom();

const user1 = new User('Mario');
const user2 = new User('Luigi');
const user3 = new User('Peach');

chatRoom.register('Mario', user1);
chatRoom.register('Luigi', user2);
chatRoom.register('Peach', user3);

user1.sendMessage('Hello everyone!');
// Output:
// Mario sends: Hello everyone!
// Luigi received from Mario: Hello everyone!
// Peach received from Mario: Hello everyone!
```

## 6. Saga Pattern

Coordina transazioni distribuite con eventi.

### Implementazione

```javascript
class SagaOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.sagas = new Map();
  }
  
  async execute(sagaId, steps) {
    const saga = {
      id: sagaId,
      steps,
      completed: [],
      currentStep: 0
    };
    
    this.sagas.set(sagaId, saga);
    this.emit('saga:started', { sagaId });
    
    try {
      for (let i = 0; i < steps.length; i++) {
        saga.currentStep = i;
        const step = steps[i];
        
        this.emit('saga:step-started', { sagaId, step: i });
        
        await step.execute();
        saga.completed.push(i);
        
        this.emit('saga:step-completed', { sagaId, step: i });
      }
      
      this.emit('saga:completed', { sagaId });
      return { success: true };
      
    } catch (error) {
      this.emit('saga:failed', { sagaId, error });
      
      // Rollback in reverse order
      await this.rollback(saga);
      
      return { success: false, error };
    }
  }
  
  async rollback(saga) {
    this.emit('saga:rollback-started', { sagaId: saga.id });
    
    for (let i = saga.completed.length - 1; i >= 0; i--) {
      const stepIndex = saga.completed[i];
      const step = saga.steps[stepIndex];
      
      if (step.compensate) {
        this.emit('saga:compensating', { sagaId: saga.id, step: stepIndex });
        await step.compensate();
      }
    }
    
    this.emit('saga:rollback-completed', { sagaId: saga.id });
  }
}

// Esempio: Order Processing Saga
class OrderSaga {
  constructor(orchestrator, inventoryService, paymentService, shippingService) {
    this.orchestrator = orchestrator;
    this.inventoryService = inventoryService;
    this.paymentService = paymentService;
    this.shippingService = shippingService;
  }
  
  async processOrder(order) {
    const sagaId = `order-${order.id}`;
    
    const steps = [
      {
        name: 'Reserve Inventory',
        execute: () => this.inventoryService.reserve(order.items),
        compensate: () => this.inventoryService.release(order.items)
      },
      {
        name: 'Process Payment',
        execute: () => this.paymentService.charge(order.total),
        compensate: () => this.paymentService.refund(order.total)
      },
      {
        name: 'Create Shipment',
        execute: () => this.shippingService.createShipment(order),
        compensate: () => this.shippingService.cancelShipment(order.id)
      }
    ];
    
    return await this.orchestrator.execute(sagaId, steps);
  }
}

// Uso
const orchestrator = new SagaOrchestrator();

// Monitoring
orchestrator.on('saga:step-completed', ({ sagaId, step }) => {
  console.log(`[${sagaId}] Step ${step} completed`);
});

orchestrator.on('saga:failed', ({ sagaId, error }) => {
  console.error(`[${sagaId}] Failed:`, error.message);
});

orchestrator.on('saga:compensating', ({ sagaId, step }) => {
  console.log(`[${sagaId}] Compensating step ${step}`);
});

// Services (mock)
const inventoryService = {
  reserve: async (items) => console.log('Inventory reserved'),
  release: async (items) => console.log('Inventory released')
};

const paymentService = {
  charge: async (amount) => {
    // Simula fallimento
    throw new Error('Payment failed');
  },
  refund: async (amount) => console.log('Payment refunded')
};

const shippingService = {
  createShipment: async (order) => console.log('Shipment created'),
  cancelShipment: async (orderId) => console.log('Shipment cancelled')
};

const orderSaga = new OrderSaga(
  orchestrator,
  inventoryService,
  paymentService,
  shippingService
);

// Esegui
await orderSaga.processOrder({
  id: '123',
  items: ['item1', 'item2'],
  total: 99.99
});
// Output:
// Inventory reserved
// [order-123] Step 0 completed
// [order-123] Failed: Payment failed
// [order-123] Compensating step 0
// Inventory released
```

## Conclusioni

Pattern event-driven:
- ✅ Observer: Base di EventEmitter
- ✅ Pub/Sub: Disaccoppiamento totale
- ✅ Event Sourcing: Storia completa dei cambiamenti
- ✅ CQRS: Separa lettura e scrittura
- ✅ Mediator: Comunicazione centralizzata
- ✅ Saga: Transazioni distribuite

## Prossimi Passi

- [Gestione Errori negli Eventi](./05-gestione-errori.md)
- [Esempi Pratici](../esempi/)
- [Esercizi](../esercizi/)

## Risorse

- [Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/)
- [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
