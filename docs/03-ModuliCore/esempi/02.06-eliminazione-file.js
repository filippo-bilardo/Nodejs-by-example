/**
 * ESEMPIO 02.06 - Eliminazione File
 * 
 * Questo esempio mostra come eliminare file usando unlink().
 * Il nome "unlink" deriva da UNIX, dove elimina un link al file.
 * 
 * ATTENZIONE: L'eliminazione è PERMANENTE! Non c'è un cestino/recycle bin.
 * Verifica sempre l'esistenza e i permessi prima di eliminare.
 */

const fs = require('fs');

// ============================================
// METODO 1: SINCRONO
// ============================================
console.log('=== ELIMINAZIONE SINCRONA ===');
try {
  // Prima crea un file da eliminare
  fs.writeFileSync('file-da-eliminare-sync.txt', 'File temporaneo');
  console.log('✓ File creato');
  
  // Elimina il file
  fs.unlinkSync('file-da-eliminare-sync.txt');
  console.log('✓ File eliminato con successo');
  
} catch (err) {
  // ENOENT = Error NO ENTry (file non trovato)
  if (err.code === 'ENOENT') {
    console.error('Errore: file non trovato');
  } else {
    console.error('Errore nell\'eliminazione:', err.message);
  }
}

// ============================================
// METODO 2: ASINCRONO CON CALLBACK
// ============================================
console.log('\n=== ELIMINAZIONE ASINCRONA CON CALLBACK ===');

// Crea un file da eliminare
fs.writeFile('file-da-eliminare-async.txt', 'File temporaneo', (err) => {
  if (err) {
    console.error('Errore nella creazione:', err.message);
    return;
  }
  console.log('✓ File creato');
  
  // Elimina il file
  fs.unlink('file-da-eliminare-async.txt', (err) => {
    if (err) {
      console.error('Errore nell\'eliminazione:', err.message);
      return;
    }
    console.log('✓ File eliminato con successo');
  });
});

// ============================================
// METODO 3: ASINCRONO CON PROMISE
// ============================================
console.log('\n=== ELIMINAZIONE ASINCRONA CON PROMISE ===');

async function eliminaFileSicuro(filename) {
  try {
    // Prima verifica se il file esiste
    await fs.promises.access(filename);
    
    // Se arriviamo qui, il file esiste
    await fs.promises.unlink(filename);
    console.log(`✓ File ${filename} eliminato con successo`);
    
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`ℹ File ${filename} non esiste (nessuna azione necessaria)`);
    } else {
      console.error(`Errore nell'eliminazione di ${filename}:`, err.message);
      throw err;
    }
  }
}

// Test della funzione
async function testEliminazione() {
  // Crea un file da eliminare
  await fs.promises.writeFile('file-da-eliminare-promise.txt', 'File temporaneo');
  console.log('✓ File creato');
  
  // Elimina il file
  await eliminaFileSicuro('file-da-eliminare-promise.txt');
  
  // Tenta di eliminare un file che non esiste (non dovrebbe dare errore)
  await eliminaFileSicuro('file-che-non-esiste.txt');
}

testEliminazione();

// ============================================
// ESEMPIO PRATICO: PULIZIA FILE VECCHI
// ============================================
/**
 * Elimina file più vecchi di un certo numero di giorni
 * @param {string} directory - Directory da pulire
 * @param {number} giorni - File più vecchi di questi giorni saranno eliminati
 */
async function pulisciFileVecchi(directory, giorni) {
  console.log(`\n=== PULIZIA FILE VECCHI (>${giorni} giorni) ===`);
  
  try {
    // Leggi tutti i file nella directory
    const files = await fs.promises.readdir(directory);
    const ora = Date.now();
    const millisecondiPerGiorno = 1000 * 60 * 60 * 24;
    let fileEliminati = 0;
    
    for (const file of files) {
      const filePath = `${directory}/${file}`;
      
      try {
        // Ottieni informazioni sul file
        const stats = await fs.promises.stat(filePath);
        
        // Calcola l'età del file in giorni
        const etaFile = (ora - stats.mtimeMs) / millisecondiPerGiorno;
        
        // Se il file è più vecchio del limite, eliminalo
        if (etaFile > giorni) {
          await fs.promises.unlink(filePath);
          console.log(`✓ Eliminato: ${file} (${etaFile.toFixed(1)} giorni)`);
          fileEliminati++;
        }
        
      } catch (err) {
        console.error(`Errore con ${file}:`, err.message);
      }
    }
    
    console.log(`\nTotale file eliminati: ${fileEliminati}`);
    
  } catch (err) {
    console.error('Errore nella pulizia dei file:', err.message);
  }
}

// Esempio di utilizzo (commentato per sicurezza)
// pulisciFileVecchi('./temp', 30); // Elimina file più vecchi di 30 giorni

// ============================================
// ELIMINAZIONE SICURA CON CONFERMA
// ============================================
/**
 * Elimina un file con richiesta di conferma
 * (Utile per script interattivi)
 */
async function eliminaConConferma(filename) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    readline.question(`Vuoi davvero eliminare ${filename}? (s/n): `, async (risposta) => {
      if (risposta.toLowerCase() === 's') {
        try {
          await fs.promises.unlink(filename);
          console.log('✓ File eliminato');
          resolve(true);
        } catch (err) {
          console.error('Errore:', err.message);
          resolve(false);
        }
      } else {
        console.log('Operazione annullata');
        resolve(false);
      }
      readline.close();
    });
  });
}

// Esempio: eliminaConConferma('file-importante.txt');
