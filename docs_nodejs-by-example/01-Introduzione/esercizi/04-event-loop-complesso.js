/**
 * ESERCIZIO 4: Event Loop - Scenario Complesso
 * 
 * Obiettivo: Combinare tutto quello che abbiamo imparato
 * 
 * DOMANDA: Qual è l'ordine completo di output?
 */

console.log('Inizio');

setTimeout(() => {
    console.log('setTimeout 1');
    Promise.resolve().then(() => console.log('Promise in setTimeout 1'));
}, 0);

Promise.resolve()
    .then(() => {
        console.log('Promise 1');
        setTimeout(() => console.log('setTimeout in Promise 1'), 0);
    })
    .then(() => {
        console.log('Promise 2');
    });

setImmediate(() => {
    console.log('setImmediate 1');
});

process.nextTick(() => {
    console.log('nextTick 1');
    process.nextTick(() => console.log('nextTick 2'));
});

setTimeout(() => {
    console.log('setTimeout 2');
}, 0);

console.log('Fine');

/**
 * SOLUZIONE:
 * Inizio
 * Fine
 * nextTick 1
 * nextTick 2
 * Promise 1
 * Promise 2
 * setTimeout 1
 * Promise in setTimeout 1
 * setTimeout 2
 * setTimeout in Promise 1
 * setImmediate 1
 * 
 * SPIEGAZIONE:
 * 1. Prima esegue tutto il codice sincrono (Inizio, Fine)
 * 2. Poi process.nextTick (nextTick 1, che aggiunge nextTick 2)
 * 3. Poi le Promise (Promise 1, che schedula un setTimeout, poi Promise 2)
 * 4. Poi i setTimeout (setTimeout 1 con la sua Promise, setTimeout 2, setTimeout da Promise 1)
 * 5. Infine setImmediate
 */
