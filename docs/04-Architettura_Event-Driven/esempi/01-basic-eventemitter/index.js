const EventEmitter = require('events');

// ============================================
// ESEMPIO 1: EventEmitter Base
// ============================================
console.log('=== ESEMPIO 1: Basic Events ===');

class Logger extends EventEmitter {
  log(level, message) {
    this.emit('log', { level, message, timestamp: new Date() });
  }
  
  info(message) {
    this.log('INFO', message);
  }
  
  error(message) {
    this.log('ERROR', message);
  }
}

const logger = new Logger();

// Listener per tutti i log
logger.on('log', ({ level, message, timestamp }) => {
  console.log(`User logged in: ${message} at ${timestamp}`);
});

// Analytics listener
logger.on('log', ({ level, message }) => {
  console.log(`Analytics: User logged in: ${message}`);
});

logger.info('mario');
console.log();

// ============================================
// ESEMPIO 2: Once Listener (si esegue una sola volta)
// ============================================
console.log('=== ESEMPIO 2: Once Listener ===');

class Server extends EventEmitter {
  connect() {
    this.emit('connection');
  }
}

const server = new Server();

// Si esegue solo una volta
server.once('connection', () => {
  console.log('First connection established');
});

// Si esegue sempre
server.on('connection', () => {
  console.log('Connection established');
});

server.connect();
server.connect(); // Il listener once() NON viene eseguito

console.log();

// ============================================
// ESEMPIO 3: Multiple Arguments
// ============================================
console.log('=== ESEMPIO 3: Multiple Arguments ===');

class OrderSystem extends EventEmitter {
  placeOrder(orderId, userId, total) {
    this.emit('order-placed', { orderId, userId, total });
  }
}

const orderSystem = new OrderSystem();

orderSystem.on('order-placed', ({ orderId, userId, total }) => {
  console.log(`Order placed: ${orderId} by ${userId}, total: $${total}`);
});

orderSystem.placeOrder('12345', 'user-1', 99.99);
console.log();

// ============================================
// ESEMPIO 4: Rimozione Listener
// ============================================
console.log('=== ESEMPIO 4: Listener Removal ===');

const emitter = new EventEmitter();

// Funzione named (necessaria per rimozione)
function onData(data) {
  console.log('Data:', data);
}

emitter.on('data', onData);
emitter.emit('data', 'test1'); // Output: Data: test1

// Rimuovi listener
emitter.removeListener('data', onData);
// oppure
// emitter.off('data', onData);

emitter.emit('data', 'test2'); // Nessun output

console.log();

// ============================================
// ESEMPIO 5: Gestione Errori (OBBLIGATORIA!)
// ============================================
console.log('=== ESEMPIO 5: Error Handling ===');

const errorEmitter = new EventEmitter();

// ✅ SEMPRE gestire 'error'
errorEmitter.on('error', (err) => {
  console.error('Error occurred:', err.message);
});

// Emette errore (gestito senza crash)
errorEmitter.emit('error', new Error('Something went wrong'));

console.log();

// ============================================
// ESEMPIO 6: Applicazione Reale - Stock Ticker
// ============================================
console.log('=== ESEMPIO 6: Stock Ticker ===');

class StockTicker extends EventEmitter {
  constructor() {
    super();
    this.stocks = new Map();
  }
  
  updatePrice(symbol, price) {
    const oldPrice = this.stocks.get(symbol);
    this.stocks.set(symbol, price);
    
    // Evento generico
    this.emit('price-update', {
      symbol,
      oldPrice,
      newPrice: price,
      change: oldPrice ? ((price - oldPrice) / oldPrice * 100) : 0
    });
    
    // Evento specifico per simbolo
    this.emit(`price-update:${symbol}`, price);
    
    // Alert su variazioni significative (>5%)
    if (oldPrice && Math.abs(price - oldPrice) / oldPrice > 0.05) {
      this.emit('significant-change', { symbol, oldPrice, newPrice: price });
    }
  }
  
  getPrice(symbol) {
    return this.stocks.get(symbol);
  }
}

const ticker = new StockTicker();

// Listener generico per tutti gli update
ticker.on('price-update', ({ symbol, newPrice }) => {
  console.log(`${symbol} updated: $${newPrice.toFixed(2)}`);
});

// Analytics listener
ticker.on('price-update', ({ symbol, newPrice }) => {
  // Simula invio a sistema di analytics
  console.log(`Analytics: ${symbol} updated: $${newPrice.toFixed(2)}`);
});

// Listener per stock specifico
ticker.on('price-update:AAPL', (price) => {
  console.log(`Apple specific: $${price.toFixed(2)}`);
});

// Alert listener
ticker.on('significant-change', ({ symbol, oldPrice, newPrice }) => {
  console.log(`⚠️ Significant change: $${oldPrice.toFixed(2)} → $${newPrice.toFixed(2)}`);
});

// Simulazione update
ticker.updatePrice('AAPL', 150.00);
ticker.updatePrice('AAPL', 155.00);
ticker.updatePrice('AAPL', 160.00); // >5% change → alert!

console.log();

// ============================================
// ESEMPIO 7: Contare Listener
// ============================================
console.log('=== ESEMPIO 7: Listener Count ===');

const counter = new EventEmitter();

counter.on('event', () => {});
counter.on('event', () => {});
counter.on('event', () => {});

console.log('Listener count:', counter.listenerCount('event')); // 3
console.log('Event names:', counter.eventNames()); // ['event']

// Lista di tutte le funzioni listener
const listeners = counter.listeners('event');
console.log('Number of listeners:', listeners.length);

console.log();

// ============================================
// ESEMPIO 8: Max Listeners Warning
// ============================================
console.log('=== ESEMPIO 8: Max Listeners ===');

const maxEmitter = new EventEmitter();

// Default limit: 10 listeners
console.log('Default max listeners:', EventEmitter.defaultMaxListeners); // 10

// Aumenta il limite per questo emitter
maxEmitter.setMaxListeners(20);

// Aggiungi 15 listener (no warning)
for (let i = 0; i < 15; i++) {
  maxEmitter.on('event', () => {});
}

console.log('Added 15 listeners, no warning (limit set to 20)');

console.log();

// ============================================
// ESEMPIO 9: PrependListener
// ============================================
console.log('=== ESEMPIO 9: Prepend Listener ===');

const orderEmitter = new EventEmitter();

orderEmitter.on('process', () => {
  console.log('Step 2: Process order');
});

// Aggiungi all'inizio (eseguito per primo)
orderEmitter.prependListener('process', () => {
  console.log('Step 1: Validate order');
});

orderEmitter.on('process', () => {
  console.log('Step 3: Send confirmation');
});

orderEmitter.emit('process');
// Output:
// Step 1: Validate order
// Step 2: Process order
// Step 3: Send confirmation

console.log();

// ============================================
// ESEMPIO 10: Chaining
// ============================================
console.log('=== ESEMPIO 10: Method Chaining ===');

const chain = new EventEmitter();

chain
  .on('start', () => console.log('Started'))
  .on('progress', (percent) => console.log(`Progress: ${percent}%`))
  .on('complete', () => console.log('Completed'));

chain.emit('start');
chain.emit('progress', 50);
chain.emit('progress', 100);
chain.emit('complete');
