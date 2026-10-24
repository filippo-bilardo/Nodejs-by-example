/**
 * ESERCIZIO PRATICO 2: Ritardo Controllato
 * 
 * OBIETTIVO: Crea una funzione che stampa un messaggio dopo un determinato ritardo
 * 
 * REQUISITI:
 * - Crea una funzione chiamata 'stampaConRitardo'
 * - Deve accettare due parametri: messaggio (string) e ritardo (number in ms)
 * - Deve stampare il messaggio dopo il ritardo specificato
 * - Deve ritornare una Promise
 * 
 * TEST:
 * stampaConRitardo('Primo messaggio', 1000)
 *     .then(() => stampaConRitardo('Secondo messaggio', 500))
 *     .then(() => console.log('Completato!'));
 * 
 * OUTPUT ATTESO:
 * (dopo 1 secondo) Primo messaggio
 * (dopo altri 0.5 secondi) Secondo messaggio
 * (immediatamente dopo) Completato!
 */

// SCRIVI IL TUO CODICE QUI:
function stampaConRitardo(messaggio, ritardo) {
    // Il tuo codice qui
}

// TEST - Non modificare questa parte
stampaConRitardo('Primo messaggio', 1000)
    .then(() => stampaConRitardo('Secondo messaggio', 500))
    .then(() => console.log('Completato!'));


















// ============================================================
// SOLUZIONE
// ============================================================

/**
 * SOLUZIONE:
 */

function stampaConRitardo_SOLUZIONE(messaggio, ritardo) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(messaggio);
            resolve();
        }, ritardo);
    });
}

// Test della soluzione (commentato per non interferire)
// stampaConRitardo_SOLUZIONE('Primo messaggio', 1000)
//     .then(() => stampaConRitardo_SOLUZIONE('Secondo messaggio', 500))
//     .then(() => console.log('Completato!'));
