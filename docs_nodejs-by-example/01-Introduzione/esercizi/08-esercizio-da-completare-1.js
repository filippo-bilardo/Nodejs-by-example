/**
 * ESERCIZIO PRATICO 1: Ordine di Esecuzione
 * 
 * OBIETTIVO: Scrivi del codice che produca ESATTAMENTE questo output:
 * 
 * Inizio
 * Fine
 * Microtask
 * Macrotask
 * 
 * REQUISITI:
 * - Usa console.log per i messaggi
 * - Usa almeno una Promise
 * - Usa almeno un setTimeout
 * - NON modificare i messaggi di output
 * 
 * SUGGERIMENTO:
 * Ricorda la priorità: codice sincrono > microtask > macrotask
 */

// SCRIVI IL TUO CODICE QUI:











// ============================================================
// NON GUARDARE LA SOLUZIONE PRIMA DI AVER PROVATO!
// ============================================================



















/**
 * SOLUZIONE:
 */

console.log('Inizio');

Promise.resolve().then(() => {
    console.log('Microtask');
});

setTimeout(() => {
    console.log('Macrotask');
}, 0);

console.log('Fine');
