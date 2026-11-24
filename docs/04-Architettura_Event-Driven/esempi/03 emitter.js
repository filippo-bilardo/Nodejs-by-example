// Esempio rapido: EventEmitter in azione
const EventEmitter = require('events');

class StockTicker extends EventEmitter {
  updatePrice(symbol, price) {
    this.emit('price-update', { symbol, price });
  }
}

const ticker = new StockTicker();

// Listener multipli per lo stesso evento
ticker.on('price-update', ({ symbol, price }) => {
  console.log(`${symbol}: $${price}`);
});

ticker.on('price-update', ({ symbol, price }) => {
  // Salva su database
  //database.save(symbol, price);
  console.log(`Saved ${symbol} price: $${price} to database.`);
});

ticker.updatePrice('AAPL', 150.00); // Entrambi i listener vengono eseguiti
