/**
 * ESERCIZIO PRATICO 5: Simulazione Caricamento Dati
 * 
 * OBIETTIVO: Simula il caricamento di dati da diverse fonti
 * 
 * SCENARIO:
 * Devi caricare dati da 3 fonti diverse (database, API, cache)
 * Ogni fonte ha un tempo di risposta diverso
 * Vuoi mostrare i dati appena disponibili, non aspettare tutti
 * 
 * REQUISITI:
 * - Crea 3 funzioni: caricaDatabase(), caricaAPI(), caricaCache()
 * - Ogni funzione ritorna una Promise con i dati dopo un ritardo
 * - caricaCache: 100ms, ritorna { fonte: 'cache', dati: [...] }
 * - caricaAPI: 500ms, ritorna { fonte: 'API', dati: [...] }
 * - caricaDatabase: 1000ms, ritorna { fonte: 'database', dati: [...] }
 * - Stampa i dati appena arrivano (non aspettare tutti)
 * - Alla fine stampa "Tutti i dati caricati!"
 * 
 * OUTPUT ATTESO:
 * Caricamento in corso...
 * ✓ Dati da cache: [array di dati]
 * ✓ Dati da API: [array di dati]
 * ✓ Dati da database: [array di dati]
 * Tutti i dati caricati!
 */

// SCRIVI IL TUO CODICE QUI:

function caricaCache() {
    // Il tuo codice qui
}

function caricaAPI() {
    // Il tuo codice qui
}

function caricaDatabase() {
    // Il tuo codice qui
}

// Esegui il caricamento
console.log('Caricamento in corso...');
// Il tuo codice qui per gestire le 3 Promise
























// ============================================================
// SOLUZIONE
// ============================================================

/**
 * SOLUZIONE:
 */

function caricaCache_SOLUZIONE() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                fonte: 'cache',
                dati: ['elemento1', 'elemento2', 'elemento3']
            });
        }, 100);
    });
}

function caricaAPI_SOLUZIONE() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                fonte: 'API',
                dati: ['dato-api-1', 'dato-api-2', 'dato-api-3']
            });
        }, 500);
    });
}

function caricaDatabase_SOLUZIONE() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                fonte: 'database',
                dati: ['record1', 'record2', 'record3']
            });
        }, 1000);
    });
}

// SOLUZIONE 1: Con then individuali
function eseguiCaricamento1() {
    console.log('Caricamento in corso...');
    
    const promiseCache = caricaCache_SOLUZIONE().then(risultato => {
        console.log(`✓ Dati da ${risultato.fonte}:`, risultato.dati);
    });
    
    const promiseAPI = caricaAPI_SOLUZIONE().then(risultato => {
        console.log(`✓ Dati da ${risultato.fonte}:`, risultato.dati);
    });
    
    const promiseDB = caricaDatabase_SOLUZIONE().then(risultato => {
        console.log(`✓ Dati da ${risultato.fonte}:`, risultato.dati);
    });
    
    Promise.all([promiseCache, promiseAPI, promiseDB])
        .then(() => console.log('Tutti i dati caricati!'));
}

// eseguiCaricamento1();


// SOLUZIONE 2: Con async/await e Promise.all
async function eseguiCaricamento2() {
    console.log('Caricamento in corso...');
    
    const promises = [
        caricaCache_SOLUZIONE(),
        caricaAPI_SOLUZIONE(),
        caricaDatabase_SOLUZIONE()
    ];
    
    // Gestiamo ogni promise individualmente appena si risolve
    promises.forEach(promise => {
        promise.then(risultato => {
            console.log(`✓ Dati da ${risultato.fonte}:`, risultato.dati);
        });
    });
    
    // Aspettiamo che tutte siano completate
    await Promise.all(promises);
    console.log('Tutti i dati caricati!');
}

// eseguiCaricamento2();
