/**
 * ESERCIZIO 7: Event Loop - Quiz Finale
 * 
 * Obiettivo: Metti alla prova la tua comprensione dell'event loop!
 * 
 * ISTRUZIONI:
 * 1. NON eseguire subito questo codice
 * 2. Prova a scrivere su carta l'ordine di output che ti aspetti
 * 3. Solo dopo, esegui il codice e verifica
 * 4. Se hai sbagliato, analizza perché
 */

console.log('Start');

setTimeout(() => {
    console.log('Timer 1');
    Promise.resolve().then(() => console.log('Promise in Timer 1'));
    process.nextTick(() => console.log('NextTick in Timer 1'));
}, 0);

Promise.resolve()
    .then(() => {
        console.log('Promise 1');
        process.nextTick(() => console.log('NextTick in Promise 1'));
        return Promise.resolve();
    })
    .then(() => {
        console.log('Promise 2');
        setTimeout(() => console.log('Timer in Promise 2'), 0);
    });

process.nextTick(() => {
    console.log('NextTick 1');
    Promise.resolve().then(() => console.log('Promise in NextTick 1'));
});

setImmediate(() => {
    console.log('Immediate 1');
    process.nextTick(() => console.log('NextTick in Immediate 1'));
});

setTimeout(() => {
    console.log('Timer 2');
    setImmediate(() => console.log('Immediate in Timer 2'));
}, 0);

process.nextTick(() => {
    console.log('NextTick 2');
});

console.log('End');

/**
 * SOLUZIONE (nascondi questa parte prima di fare l'esercizio!):
 * 
 * Start
 * End
 * NextTick 1
 * NextTick 2
 * Promise 1
 * Promise in NextTick 1
 * NextTick in Promise 1
 * Promise 2
 * Timer 1
 * Timer 2
 * NextTick in Timer 1
 * Promise in Timer 1
 * Timer in Promise 2
 * Immediate in Timer 2
 * Immediate 1
 * NextTick in Immediate 1
 * 
 * ANALISI:
 * - Il codice sincrono viene eseguito per primo (Start, End)
 * - Poi tutti i nextTick nella coda corrente (NextTick 1, NextTick 2)
 * - Poi le Promise nella microtask queue (Promise 1, poi le sue callback)
 * - I nuovi nextTick aggiunti dalle Promise vengono eseguiti subito
 * - Poi i timer (Timer 1, Timer 2) con le loro callback
 * - Infine setImmediate
 * 
 * Ricorda: nextTick > Promise > setTimeout > setImmediate
 */
