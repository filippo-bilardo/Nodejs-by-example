/**
 * Esempio 06.02 - Readline con Promises
 * 
 * Dimostra come evitare il "callback hell" usando Promises e async/await.
 * 
 * Concetti dimostrati:
 * - Wrapper Promise per question()
 * - Uso di async/await per codice sequenziale pulito
 * - Gestione errori con try/catch
 * - Cleanup con finally
 * 
 * Vantaggi rispetto a 06.01:
 * - Codice lineare invece di callback nidificati
 * - Più leggibile e manutenibile
 * - Gestione errori centralizzata
 * 
 * Nota: Da Node.js 17+ esiste readline/promises built-in
 */

const readline = require('readline');

// Crea interfaccia readline standard
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Wrapper che converte question() callback-based in Promise
 * 
 * Questo è un pattern comune quando si lavora con API legacy
 * che usano callback ma vogliamo usare async/await.
 * 
 * @param {string} domanda - La domanda da porre
 * @returns {Promise<string>} Promise che si risolve con la risposta
 * 
 * Esempio uso:
 *   const nome = await chiedi('Nome: ');
 */
function chiedi(domanda) {
  return new Promise((resolve) => {
    // Chiama question() con callback che risolve la Promise
    rl.question(domanda, (risposta) => {
      resolve(risposta);
    });
  });
}

/**
 * Funzione async per gestire registrazione utente
 * 
 * Vantaggi di async/await:
 * - Domande in sequenza ma senza nesting
 * - Facile leggere il flusso del programma
 * - try/catch per gestire errori
 * - finally per cleanup garantito
 */
async function registrazione() {
  console.log('=== REGISTRAZIONE UTENTE ===\n');
  
  try {
    // await "aspetta" che l'utente risponda prima di continuare
    // Il codice appare sincrono ma è completamente asincrono
    const nome = await chiedi('Nome: ');
    const cognome = await chiedi('Cognome: ');
    const email = await chiedi('Email: ');
    const eta = await chiedi('Età: ');
    
    // Mostra riepilogo dati inseriti
    console.log('\n=== DATI INSERITI ===');
    console.log('Nome completo:', nome, cognome);
    console.log('Email:', email);
    console.log('Età:', eta);
    
  } catch (error) {
    // Cattura eventuali errori durante la registrazione
    console.error('Errore:', error);
  } finally {
    // finally viene SEMPRE eseguito, anche se c'è un errore
    // Importante per cleanup (chiusura risorse)
    rl.close();
  }
}

// Avvia la funzione async
// Nota: Le funzioni async restituiscono sempre una Promise
registrazione();
