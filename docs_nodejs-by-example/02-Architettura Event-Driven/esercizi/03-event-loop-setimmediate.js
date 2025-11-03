/**
 * ESERCIZIO 3: Event Loop - setImmediate vs setTimeout
 * 
 * Obiettivo: Capire la differenza tra setImmediate e setTimeout in Node.js
 * 
 * DOMANDA: Qual è l'ordine di output?
 */

console.log('1 - Inizio');

setTimeout(() => {
    console.log('2 - setTimeout');
}, 0);

setImmediate(() => {
    console.log('3 - setImmediate');
});

process.nextTick(() => {
    console.log('4 - process.nextTick');
});

console.log('5 - Fine');

/**
 * SOLUZIONE:
 * L'ordine sarà: 1 - Inizio, 5 - Fine, 4 - process.nextTick, 2 - setTimeout, 3 - setImmediate
 * (L'ordine tra setTimeout e setImmediate può variare se eseguito fuori da un I/O cycle)
 * 
 * SPIEGAZIONE:
 * process.nextTick() ha la priorità più alta di tutte le callback asincrone.
 * Viene eseguito immediatamente dopo il codice sincrono, prima di qualsiasi altra callback.
 * 
 * Priorità in Node.js:
 * 1. Codice sincrono
 * 2. process.nextTick()
 * 3. Microtask (Promise)
 * 4. Timer (setTimeout/setInterval)
 * 5. setImmediate()
 */
