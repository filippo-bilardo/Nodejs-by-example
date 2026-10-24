/**
 * ESERCIZIO 5: Event Loop - I/O Operations
 * 
 * Obiettivo: Capire come le operazioni I/O influenzano l'event loop
 * 
 * DOMANDA: Qual è l'ordine di output?
 */

const fs = require('fs');

console.log('Inizio', __filename);

// Lettura file (operazione I/O asincrona)
fs.readFile(__filename, () => {
    console.log('File letto');
    
    setTimeout(() => console.log('setTimeout in I/O'), 0);
    
    setImmediate(() => console.log('setImmediate in I/O'));
});

setTimeout(() => {
    console.log('setTimeout fuori I/O');
}, 0);

setImmediate(() => {
    console.log('setImmediate fuori I/O');
});

console.log('Fine');

/**
 * SOLUZIONE ATTESA:
 * Inizio
 * Fine
 * setTimeout fuori I/O (o setImmediate fuori I/O, l'ordine può variare)
 * setImmediate fuori I/O (o setTimeout fuori I/O)
 * File letto
 * setImmediate in I/O
 * setTimeout in I/O
 * 
 * SPIEGAZIONE:
 * Quando setTimeout e setImmediate sono chiamati DENTRO un I/O callback,
 * setImmediate viene SEMPRE eseguito prima di setTimeout.
 * Questo perché siamo già nella fase I/O dell'event loop.
 * 
 * Fasi dell'Event Loop in Node.js:
 * 1. Timers (setTimeout, setInterval)
 * 2. Pending callbacks
 * 3. Idle, prepare
 * 4. Poll (I/O operations)
 * 5. Check (setImmediate)
 * 6. Close callbacks
 */
