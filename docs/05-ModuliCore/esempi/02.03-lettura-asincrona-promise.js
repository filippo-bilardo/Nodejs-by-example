/**
 * ESEMPIO 02.03 - Lettura Asincrona con Promise (async/await)
 * 
 * Questo esempio utilizza l'API fs/promises, disponibile da Node.js 10+,
 * che fornisce versioni basate su Promise di tutte le operazioni del file system.
 * 
 * VANTAGGI:
 * - Codice più pulito e leggibile rispetto alle callback
 * - Gestione errori più semplice con try/catch
 * - Possibilità di usare async/await
 * - Evita il "callback hell"
 * 
 * BEST PRACTICE: Questo è l'approccio raccomandato per nuovo codice Node.js
 */

const fs = require('fs/promises');

/**
 * Funzione asincrona per leggere un file
 * async permette di usare await all'interno della funzione
 */
async function leggiFile() {
  try {
    console.log('Inizio lettura file...');
    
    // await "pausa" l'esecuzione della funzione finché la Promise non si risolve
    // Ma NON blocca l'intero programma (altre operazioni possono continuare)
    const data = await fs.readFile('file.txt', 'utf8');
    
    console.log('Contenuto del file:');
    console.log(data);
    console.log('Lettura completata');
    
    // Possiamo restituire il contenuto per ulteriori elaborazioni
    return data;
    
  } catch (err) {
    // try/catch cattura qualsiasi errore durante l'operazione asincrona
    console.error('Errore durante la lettura del file:', err.message);
    throw err; // Ri-lancia l'errore per gestirlo a un livello superiore se necessario
  }
}

// Esegui la funzione asincrona
leggiFile()
  .then(contenuto => {
    console.log(`File letto con successo: ${contenuto.length} caratteri`);
  })
  .catch(err => {
    console.error('Errore nella gestione del file:', err.message);
  });

// Questa riga viene eseguita immediatamente
console.log('La lettura è in corso in background...');
