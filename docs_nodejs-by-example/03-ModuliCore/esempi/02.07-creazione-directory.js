/**
 * ESEMPIO 02.07 - Creazione Directory
 * 
 * Questo esempio mostra come creare directory (cartelle) usando mkdir().
 * Include anche la creazione ricorsiva di directory annidate.
 * 
 * OPZIONI IMPORTANTI:
 * - recursive: true - crea directory intermedie se non esistono
 * - mode: permessi della directory (es. 0o755)
 */

const fs = require('fs');
const path = require('path');

// ============================================
// METODO 1: SINCRONO
// ============================================
console.log('=== CREAZIONE DIRECTORY SINCRONA ===');
try {
  // Crea una singola directory
  fs.mkdirSync('nuovaCartella');
  console.log('✓ Directory "nuovaCartella" creata');
  
  // Se la directory esiste già, viene sollevato un errore EEXIST
  // Elimina la directory per il prossimo test
  fs.rmdirSync('nuovaCartella');
  
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log('ℹ Directory già esistente');
  } else {
    console.error('Errore:', err.message);
  }
}

// ============================================
// METODO 2: ASINCRONO CON CALLBACK
// ============================================
console.log('\n=== CREAZIONE DIRECTORY ASINCRONA CON CALLBACK ===');

fs.mkdir('dirAsync', (err) => {
  if (err) {
    if (err.code === 'EEXIST') {
      console.log('ℹ Directory già esistente');
    } else {
      console.error('Errore:', err.message);
    }
    return;
  }
  console.log('✓ Directory "dirAsync" creata');
  
  // Pulizia
  fs.rmdir('dirAsync', () => {});
});

// ============================================
// METODO 3: ASINCRONO CON PROMISE
// ============================================
console.log('\n=== CREAZIONE DIRECTORY CON PROMISE ===');

async function creaDirectory(dirName) {
  try {
    await fs.promises.mkdir(dirName);
    console.log(`✓ Directory "${dirName}" creata`);
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.log(`ℹ Directory "${dirName}" già esistente`);
    } else {
      throw err;
    }
  }
}

creaDirectory('dirPromise');

// ============================================
// CREAZIONE RICORSIVA (Directory Annidate)
// ============================================
console.log('\n=== CREAZIONE DIRECTORY RICORSIVA ===');

/**
 * Crea una struttura di directory annidate
 * Con recursive: true, crea tutte le directory intermedie necessarie
 */
async function creaStrutturaDirectory() {
  try {
    // Crea: progetto/src/components/utils
    await fs.promises.mkdir('progetto/src/components/utils', { recursive: true });
    console.log('✓ Struttura directory creata: progetto/src/components/utils');
    
    // Crea altre directory nella struttura
    await fs.promises.mkdir('progetto/src/services', { recursive: true });
    await fs.promises.mkdir('progetto/tests', { recursive: true });
    await fs.promises.mkdir('progetto/docs', { recursive: true });
    
    console.log('✓ Struttura completa del progetto creata');
    
  } catch (err) {
    console.error('Errore:', err.message);
  }
}

creaStrutturaDirectory();

// ============================================
// FUNZIONE HELPER: CREA DIRECTORY SICURA
// ============================================
/**
 * Crea una directory solo se non esiste già
 * Non solleva errore se la directory esiste
 * @param {string} dirPath - Percorso della directory
 * @param {boolean} recursive - Se true, crea directory intermedie
 * @returns {Promise<boolean>} - true se creata, false se già esistente
 */
async function creaDirectorySicura(dirPath, recursive = false) {
  try {
    await fs.promises.mkdir(dirPath, { recursive });
    console.log(`✓ Directory "${dirPath}" creata`);
    return true;
  } catch (err) {
    if (err.code === 'EEXIST') {
      console.log(`ℹ Directory "${dirPath}" già esistente`);
      return false;
    }
    console.error(`Errore nella creazione di "${dirPath}":`, err.message);
    throw err;
  }
}

// Test della funzione helper
async function testCreazioneRicorsiva() {
  console.log('\n=== TEST CREAZIONE SICURA ===');
  
  await creaDirectorySicura('uploads/images/thumbnails', true);
  await creaDirectorySicura('uploads/documents', true);
  await creaDirectorySicura('uploads/images/thumbnails', true); // Non da errore
}

testCreazioneRicursiva();

// ============================================
// ESEMPIO PRATICO: STRUTTURA PROGETTO
// ============================================
/**
 * Crea una struttura completa per un nuovo progetto Node.js
 * @param {string} projectName - Nome del progetto
 */
async function creaStrutturaProgetto(projectName) {
  console.log(`\n=== CREAZIONE STRUTTURA PROGETTO "${projectName}" ===`);
  
  const directories = [
    `${projectName}/src`,
    `${projectName}/src/controllers`,
    `${projectName}/src/models`,
    `${projectName}/src/routes`,
    `${projectName}/src/middleware`,
    `${projectName}/src/utils`,
    `${projectName}/tests`,
    `${projectName}/tests/unit`,
    `${projectName}/tests/integration`,
    `${projectName}/config`,
    `${projectName}/public`,
    `${projectName}/public/css`,
    `${projectName}/public/js`,
    `${projectName}/public/images`,
    `${projectName}/docs`,
    `${projectName}/logs`
  ];
  
  try {
    // Crea tutte le directory
    for (const dir of directories) {
      await fs.promises.mkdir(dir, { recursive: true });
    }
    
    console.log('✓ Struttura del progetto creata con successo!');
    console.log('\nDirectory create:');
    directories.forEach(dir => console.log(`  - ${dir}`));
    
    // Crea anche alcuni file iniziali
    await fs.promises.writeFile(`${projectName}/README.md`, `# ${projectName}\n\nDescrizione del progetto`);
    await fs.promises.writeFile(`${projectName}/.gitignore`, 'node_modules/\nlogs/\n.env');
    await fs.promises.writeFile(`${projectName}/package.json`, JSON.stringify({
      name: projectName,
      version: '1.0.0',
      description: '',
      main: 'src/index.js',
      scripts: {
        start: 'node src/index.js',
        test: 'echo "Error: no test specified" && exit 1'
      }
    }, null, 2));
    
    console.log('\n✓ File iniziali creati (README.md, .gitignore, package.json)');
    
  } catch (err) {
    console.error('Errore nella creazione della struttura:', err.message);
  }
}

// Esempio di utilizzo
creaStrutturaProgetto('mio-progetto');

// ============================================
// PULIZIA (opzionale)
// ============================================
/**
 * Elimina ricorsivamente una directory e tutto il suo contenuto
 * ATTENZIONE: Usa con cautela!
 */
async function eliminaDirectoryRicorsiva(dirPath) {
  try {
    // rm con recursive: true elimina directory e contenuto
    // force: true non solleva errore se non esiste
    await fs.promises.rm(dirPath, { recursive: true, force: true });
    console.log(`✓ Directory "${dirPath}" eliminata`);
  } catch (err) {
    console.error('Errore nell\'eliminazione:', err.message);
  }
}

// Pulizia directory di test (dopo un delay per vedere i risultati)
setTimeout(async () => {
  console.log('\n=== PULIZIA DIRECTORY DI TEST ===');
  await eliminaDirectoryRicorsiva('progetto');
  await eliminaDirectoryRicorsiva('uploads');
  await eliminaDirectoryRicorsiva('mio-progetto');
  await eliminaDirectoryRicorsiva('dirPromise');
  console.log('✓ Pulizia completata');
}, 5000);
