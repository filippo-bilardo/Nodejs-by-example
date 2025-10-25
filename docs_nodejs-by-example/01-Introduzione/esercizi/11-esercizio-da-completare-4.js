/**
 * ESERCIZIO PRATICO 4: Race Condition
 * 
 * OBIETTIVO: Crea due operazioni asincrone che "gareggiano" tra loro
 * 
 * REQUISITI:
 * - Crea una funzione 'operazioneAsincrona' che simula un'operazione con ritardo casuale
 * - La funzione deve accettare un nome (string) e un tempo massimo (number)
 * - Il tempo effettivo deve essere casuale tra 0 e il tempo massimo
 * - Stampa quale operazione finisce per prima
 * - Usa Promise.race()
 * 
 * ESEMPIO OUTPUT:
 * Partenza: Operazione A (max 2000ms)
 * Partenza: Operazione B (max 1500ms)
 * Operazione B ha vinto! (completata in 843ms)
 */

// SCRIVI IL TUO CODICE QUI:

function operazioneAsincrona(nome, tempoMax) {
    // Il tuo codice qui
}

// TEST - Non modificare
const opA = operazioneAsincrona('Operazione A', 2000);
const opB = operazioneAsincrona('Operazione B', 1500);

Promise.race([opA, opB])
    .then((vincitore) => {
        console.log(`${vincitore} ha vinto!`);
    });





















// ============================================================
// SOLUZIONE
// ============================================================

/**
 * SOLUZIONE:
 */

function operazioneAsincrona_SOLUZIONE(nome, tempoMax) {
    const tempoEffettivo = Math.floor(Math.random() * tempoMax);
    console.log(`Partenza: ${nome} (max ${tempoMax}ms)`);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const messaggio = `${nome} (completata in ${tempoEffettivo}ms)`;
            resolve(messaggio);
        }, tempoEffettivo);
    });
}

// Test della soluzione (commentato)
// const opA_sol = operazioneAsincrona_SOLUZIONE('Operazione A', 2000);
// const opB_sol = operazioneAsincrona_SOLUZIONE('Operazione B', 1500);

// Promise.race([opA_sol, opB_sol])
//     .then((vincitore) => {
//         console.log(`${vincitore} ha vinto!`);
//     });
