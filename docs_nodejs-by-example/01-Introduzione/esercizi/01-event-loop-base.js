/**
 * ESERCIZIO 1: Event Loop - Esecuzione Base
 * 
 * Obiettivo: Capire l'ordine di esecuzione sincrono vs asincrono
 * 
 * DOMANDA: Qual è l'ordine di output delle console.log?
 * Prova a indovinare prima di eseguire il codice!
 */

console.log('1 - Inizio');

setTimeout(() => {
    console.log('2 - setTimeout con 0ms');
}, 0);

console.log('3 - Fine');

/**
 * SOLUZIONE:
 * L'ordine sarà: 1 - Inizio, 3 - Fine, 2 - setTimeout con 0ms
 * 
 * SPIEGAZIONE:
 * Anche se setTimeout ha delay 0ms, viene comunque messo nella
 * coda degli eventi e eseguito solo dopo che il codice sincrono
 * è completato.
 */
