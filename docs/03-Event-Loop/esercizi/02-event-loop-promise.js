/**
 * ESERCIZIO 2: Event Loop - Promise vs setTimeout
 * 
 * Obiettivo: Capire la differenza tra microtask (Promise) e macrotask (setTimeout)
 * 
 * DOMANDA: Qual è l'ordine di output?
 */

console.log('1 - Inizio');

setTimeout(() => {
    console.log('2 - setTimeout');
}, 0);

Promise.resolve()
    .then(() => {
        console.log('3 - Promise 1');
    })
    .then(() => {
        console.log('4 - Promise 2');
    });

console.log('5 - Fine');

/**
 * SOLUZIONE:
 * L'ordine sarà: 1 - Inizio, 5 - Fine, 3 - Promise 1, 4 - Promise 2, 2 - setTimeout
 * 
 * SPIEGAZIONE:
 * Le Promise (microtask) hanno priorità più alta rispetto a setTimeout (macrotask).
 * L'event loop esegue prima tutte le microtask prima di passare alla prossima macrotask.
 * 
 * Ordine di esecuzione:
 * 1. Codice sincrono (console.log 1 e 5)
 * 2. Microtask queue (Promise)
 * 3. Macrotask queue (setTimeout)
 */
