/**
 * ESERCIZIO 6: Event Loop - Codice Bloccante
 * 
 * Obiettivo: Capire cosa succede quando si blocca l'event loop
 * 
 * ATTENZIONE: Questo esempio mostra cosa NON fare!
 */

console.log('Inizio');

// Questo setTimeout dovrebbe eseguirsi dopo 100ms
setTimeout(() => {
    console.log('setTimeout - Dovrei eseguirmi dopo 100ms');
    console.log('Ma sono stato ritardato dal codice bloccante!');
}, 100);

// Simuliamo un'operazione pesante che blocca l'event loop
console.log('Inizio operazione bloccante...');
const start = Date.now();
while (Date.now() - start < 3000) {
    // Blocchiamo per 3 secondi
    // In un'app reale, questo potrebbe essere un calcolo pesante
}
console.log('Fine operazione bloccante (3 secondi dopo)');

console.log('Fine');

/**
 * SOLUZIONE:
 * Inizio
 * Inizio operazione bloccante...
 * Fine operazione bloccante (3 secondi dopo)
 * Fine
 * setTimeout - Dovrei eseguirmi dopo 100ms
 * Ma sono stato ritardato dal codice bloccante!
 * 
 * SPIEGAZIONE:
 * Il while loop blocca completamente l'event loop per 3 secondi.
 * Durante questo tempo, NESSUNA callback può essere eseguita.
 * Il setTimeout, anche se schedulato per 100ms, deve aspettare
 * che il codice sincrono finisca.
 * 
 * LEZIONE IMPORTANTE:
 * Mai usare codice sincrono pesante in Node.js!
 * Usa sempre operazioni asincrone o worker threads per operazioni pesanti.
 */
