/**
 * ESEMPIO 02.04 - Scrittura su File
 * 
 * Questo esempio mostra tre modi per scrivere contenuto in un file:
 * 1. Sincrono (writeFileSync)
 * 2. Asincrono con callback (writeFile)
 * 3. Asincrono con Promise (fs.promises.writeFile)
 * 
 * NOTA: writeFile() SOVRASCRIVE completamente il file esistente.
 * Se vuoi aggiungere contenuto, usa appendFile() (vedi esempio successivo)
 */

const fs = require('fs');

// ============================================
// METODO 1: SINCRONO (blocca l'esecuzione)
// ============================================
console.log('=== SCRITTURA SINCRONA ===');
try {
  // Scrive il contenuto nel file, creandolo se non esiste
  fs.writeFileSync('output-sync.txt', 'Contenuto scritto in modo sincrono');
  console.log('✓ File output-sync.txt creato con successo');
} catch (err) {
  console.error('Errore nella scrittura sincrona:', err.message);
}

// ============================================
// METODO 2: ASINCRONO CON CALLBACK
// ============================================
console.log('\n=== SCRITTURA ASINCRONA CON CALLBACK ===');
fs.writeFile('output-async.txt', 'Contenuto scritto in modo asincrono', (err) => {
  // La callback viene chiamata quando l'operazione è completata
  
  if (err) {
    console.error('Errore nella scrittura asincrona:', err.message);
    return;
  }
  
  console.log('✓ File output-async.txt salvato con successo');
});

// ============================================
// METODO 3: ASINCRONO CON PROMISE
// ============================================
console.log('\n=== SCRITTURA ASINCRONA CON PROMISE ===');
async function scriviConPromise() {
  try {
    // Contenuto più complesso, con più righe
    const contenuto = `
Questo è un file creato con Promise
Riga 2: ${new Date().toISOString()}
Riga 3: Node.js File System
`.trim();
    
    await fs.promises.writeFile('output-promise.txt', contenuto);
    console.log('✓ File output-promise.txt salvato con successo');
    
    // Verifica che il file sia stato creato leggendolo
    const verificaContenuto = await fs.promises.readFile('output-promise.txt', 'utf8');
    console.log('Verifica contenuto scritto:');
    console.log(verificaContenuto);
    
  } catch (err) {
    console.error('Errore nella scrittura con Promise:', err.message);
  }
}

scriviConPromise();

// ============================================
// OPZIONI AVANZATE
// ============================================
/**
 * Esempio con opzioni avanzate:
 * - encoding: specifica l'encoding (default: 'utf8')
 * - mode: permessi del file (default: 0o666)
 * - flag: flag di apertura file (default: 'w')
 */
async function scritturaAvanzata() {
  try {
    await fs.promises.writeFile('output-advanced.txt', 'Contenuto con opzioni', {
      encoding: 'utf8',
      mode: 0o644,  // Permessi: rw-r--r--
      flag: 'w'     // 'w' = write (sovrascrive), 'a' = append, 'wx' = crea solo se non esiste
    });
    console.log('\n✓ File con opzioni avanzate creato');
  } catch (err) {
    console.error('Errore:', err.message);
  }
}

scritturaAvanzata();
