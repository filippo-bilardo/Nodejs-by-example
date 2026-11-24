/**
 * Event Loop di Node.js: versione didattica
 *
 * Ordine di priorità:
 *   1. codice sincrono (call stack)
 *   2. coda process.nextTick
 *   3. coda microtask (Promise, queueMicrotask)
 *   4. fasi del loop: timers -> poll (I/O) -> check (setImmediate)
 *
 * nextTick e microtask vengono svuotate dopo OGNI callback (Node >= 11).
 *
 * Eseguire con:  node event-loop-demo.js   (CommonJS)
 * NB: come .mjs l'ordine nextTick/Promise cambia (vedi note nel libro).
 */
const fs = require('fs');

// ---------- utilità ----------
const t0 = performance.now();
let n = 0;
const log = (msg) => {
    const ms = String(Math.round(performance.now() - t0)).padStart(3);
    console.log(`${String(++n).padStart(2)}. [+${ms}ms] ${msg}`);
};

// Blocca il thread per 'ms' millisecondi (simula un lavoro pesante,
// ma in modo prevedibile a differenza di un ciclo for).
const blocca = (ms) => {
    const fine = performance.now() + ms;
    while (performance.now() < fine) { /* busy wait */ }
};

// Registra un nextTick e una Promise: serve a mostrare chi passa prima
const accodaMicro = (etichetta) => {
    process.nextTick(() => log(`   nextTick  <- da ${etichetta}`));
    Promise.resolve().then(() => log(`   Promise   <- da ${etichetta}`));
};

// ---------- FASE 0: codice sincrono ----------
log('SYNC  start');

// Due timer: il primo è pesante (80 ms). Il secondo mostra che
// attende il primo, ma che le micro-code vengono svuotate TRA i due.
setTimeout(() => {
    log('TIMER 1 (inizio, lavoro pesante 80ms)');
    blocca(80);
    accodaMicro('TIMER 1');
    log('TIMER 1 (fine)');
}, 0);

setTimeout(() => {
    log('TIMER 2');
    accodaMicro('TIMER 2');
}, 0);

// Tre immediate: il primo accoda micro-task, il terzo avvia la demo I/O
setImmediate(() => {
    log('IMMEDIATE 1');
    accodaMicro('IMMEDIATE 1');
});
setImmediate(() => log('IMMEDIATE 2'));
setImmediate(() => {
    log('IMMEDIATE 3 -> avvio lettura file (demo I/O)');
    demoIO();
});

// Micro-task: la Promise e i nextTick (anche annidati)
Promise.resolve()
    .then(() => {
        log('MICROTASK  Promise 1');
        return Promise.resolve();      // costa 2 tick extra
    })
    .then(() => log('MICROTASK  Promise 2'));

process.nextTick(() => {
    log('NEXTTICK 1');
    process.nextTick(() => log('NEXTTICK 2 (annidato, parte comunque prima delle Promise)'));
});

// Blocchiamo 5 ms: così i timer da 0 ms (in realtà 1 ms) sono GIÀ scaduti
// quando il loop parte, e l'ordine timers -> check diventa deterministico.
blocca(5);

log('SYNC  end (il call stack si svuota, ora tocca alle code)');

// ---------- FASE 2: dentro una callback di I/O ----------
// Qui l'ordine è SEMPRE: setImmediate prima di setTimeout,
// perché dopo la fase poll il loop passa alla fase check.
function demoIO() {
    fs.readFile(__filename, () => {
        log('I/O   callback (fase POLL)');
        setTimeout(() => log('I/O   -> setTimeout(0)  (fase TIMERS, giro successivo)'), 0);
        setImmediate(() => log('I/O   -> setImmediate  (fase CHECK, subito dopo)'));
    });
}

/*
 * OUTPUT ATTESO (i tempi variano, l'ordine no):
 *
 *  1. SYNC  start
 *  2. SYNC  end
 *  --- svuotamento nextTick, poi microtask ---
 *  3. NEXTTICK 1
 *  4. NEXTTICK 2 (annidato...)
 *  5. MICROTASK  Promise 1
 *  6. MICROTASK  Promise 2
 *  --- fase TIMERS ---
 *  7. TIMER 1 (inizio)       8. TIMER 1 (fine)
 *  9. nextTick <- TIMER 1   10. Promise <- TIMER 1   (dopo la callback, prima di TIMER 2)
 * 11. TIMER 2               12. nextTick <- TIMER 2  13. Promise <- TIMER 2
 *  --- fase CHECK ---
 * 14. IMMEDIATE 1           15. nextTick <- IMM 1    16. Promise <- IMM 1
 * 17. IMMEDIATE 2
 * 18. IMMEDIATE 3 -> avvio lettura file
 *  --- fase POLL (quando il file è letto) ---
 * 19. I/O callback
 * 20. I/O -> setImmediate   (check, subito)
 * 21. I/O -> setTimeout(0)  (timers, giro successivo)
 */