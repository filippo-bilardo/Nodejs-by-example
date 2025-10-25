/**
 * ESERCIZIO PRATICO 6: Task Queue Manager
 * 
 * OBIETTIVO: Crea un gestore di task che esegue operazioni in sequenza
 * 
 * SCENARIO:
 * Hai una lista di task da eseguire uno dopo l'altro.
 * Ogni task ha un nome e un tempo di esecuzione.
 * Devi creare un sistema che li esegue in ordine, aspettando che
 * ognuno finisca prima di iniziare il successivo.
 * 
 * REQUISITI:
 * - Crea una funzione 'eseguiTask' che simula l'esecuzione di un task
 * - Crea una funzione 'eseguiTuttiTask' che esegue tutti i task in sequenza
 * - Stampa quando ogni task inizia e finisce
 * - Usa async/await
 * 
 * DATI:
 * const tasks = [
 *     { nome: 'Compilazione', tempo: 800 },
 *     { nome: 'Test', tempo: 1200 },
 *     { nome: 'Deploy', tempo: 600 }
 * ];
 * 
 * OUTPUT ATTESO:
 * Inizio task: Compilazione
 * (dopo 800ms) ✓ Completato: Compilazione
 * Inizio task: Test
 * (dopo 1200ms) ✓ Completato: Test
 * Inizio task: Deploy
 * (dopo 600ms) ✓ Completato: Deploy
 * === Tutti i task completati ===
 */

const tasks = [
    { nome: 'Compilazione', tempo: 800 },
    { nome: 'Test', tempo: 1200 },
    { nome: 'Deploy', tempo: 600 }
];

// SCRIVI IL TUO CODICE QUI:

function eseguiTask(task) {
    // Il tuo codice qui
}

async function eseguiTuttiTask(listaTasks) {
    // Il tuo codice qui
}

// Esegui i task
eseguiTuttiTask(tasks);























// ============================================================
// SOLUZIONE
// ============================================================

/**
 * SOLUZIONE:
 */

function eseguiTask_SOLUZIONE(task) {
    return new Promise((resolve) => {
        console.log(`Inizio task: ${task.nome}`);
        setTimeout(() => {
            console.log(`✓ Completato: ${task.nome}`);
            resolve();
        }, task.tempo);
    });
}

async function eseguiTuttiTask_SOLUZIONE(listaTasks) {
    for (const task of listaTasks) {
        await eseguiTask_SOLUZIONE(task);
    }
    console.log('=== Tutti i task completati ===');
}

// Test della soluzione (commentato)
// eseguiTuttiTask_SOLUZIONE(tasks);

/**
 * VARIANTE: Esecuzione parallela
 * Se i task possono essere eseguiti in parallelo:
 */
async function eseguiTuttiTaskParalleli(listaTasks) {
    const promises = listaTasks.map(task => eseguiTask_SOLUZIONE(task));
    await Promise.all(promises);
    console.log('=== Tutti i task completati (paralleli) ===');
}

// eseguiTuttiTaskParalleli(tasks);
