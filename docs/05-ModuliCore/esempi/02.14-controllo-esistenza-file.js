/**
 * ESEMPIO 02.14 - Controllo Esistenza File
 * 
 * Questo esempio mostra vari metodi per verificare se un file o directory esiste.
 * 
 * METODI DISPONIBILI:
 * 1. fs.existsSync() - DEPRECATO ma ancora usato
 * 2. fs.access() - Metodo raccomandato (controlla anche permessi)
 * 3. fs.stat() - Verifica esistenza e ottieni informazioni
 * 4. try/catch con fs.promises - Approccio moderno
 * 
 * NOTA: existsSync() è deprecato perché introduce race condition
 * È meglio usare access() o provare l'operazione direttamente
 */

const fs = require('fs');
const path = require('path');

// ============================================
// ESEMPIO 1: existsSync() - METODO DEPRECATO
// ============================================
console.log('=== existsSync() - METODO DEPRECATO ===\n');

// Crea file di test
fs.writeFileSync('test-file.txt', 'Contenuto di test');

// existsSync() è il metodo più semplice ma deprecato
if (fs.existsSync('test-file.txt')) {
  console.log('✓ Il file esiste (controllato con existsSync)');
} else {
  console.log('✗ Il file non esiste');
}

if (fs.existsSync('file-inesistente.txt')) {
  console.log('✓ Il file inesistente esiste');
} else {
  console.log('✗ file-inesistente.txt non trovato (come previsto)');
}

console.log('\n⚠️  NOTA: existsSync() è deprecato, usa access() invece\n');

// ============================================
// ESEMPIO 2: fs.access() - METODO RACCOMANDATE
// ============================================
setTimeout(async () => {
  console.log('=== fs.access() - METODO RACCOMANDATO ===\n');
  
  /**
   * Verifica se un file esiste usando fs.access()
   * @param {string} filePath - Percorso del file
   * @returns {Promise<boolean>} - true se esiste, false altrimenti
   */
  async function fileExists(filePath) {
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
  
  const exists1 = await fileExists('test-file.txt');
  console.log(`test-file.txt esiste: ${exists1}`);
  
  const exists2 = await fileExists('file-inesistente.txt');
  console.log(`file-inesistente.txt esiste: ${exists2}\n`);
  
}, 500);

// ============================================
// ESEMPIO 3: CONTROLLO PERMESSI CON access()
// ============================================
setTimeout(async () => {
  console.log('=== CONTROLLO PERMESSI CON access() ===\n');
  
  /**
   * Verifica i permessi di un file
   * @param {string} filePath - Percorso del file
   */
  async function checkPermissions(filePath) {
    const permissions = {
      exists: false,
      readable: false,
      writable: false,
      executable: false
    };
    
    try {
      // Controlla esistenza
      await fs.promises.access(filePath, fs.constants.F_OK);
      permissions.exists = true;
      
      // Controlla lettura
      try {
        await fs.promises.access(filePath, fs.constants.R_OK);
        permissions.readable = true;
      } catch {}
      
      // Controlla scrittura
      try {
        await fs.promises.access(filePath, fs.constants.W_OK);
        permissions.writable = true;
      } catch {}
      
      // Controlla esecuzione
      try {
        await fs.promises.access(filePath, fs.constants.X_OK);
        permissions.executable = true;
      } catch {}
      
    } catch {
      // File non esiste
    }
    
    return permissions;
  }
  
  const perms = await checkPermissions('test-file.txt');
  
  console.log('Permessi file test-file.txt:');
  console.log(`  Esiste: ${perms.exists ? '✓' : '✗'}`);
  console.log(`  Leggibile: ${perms.readable ? '✓' : '✗'}`);
  console.log(`  Scrivibile: ${perms.writable ? '✓' : '✗'}`);
  console.log(`  Eseguibile: ${perms.executable ? '✓' : '✗'}\n`);
  
}, 1000);

// ============================================
// ESEMPIO 4: DISTINZIONE FILE vs DIRECTORY
// ============================================
setTimeout(async () => {
  console.log('=== DISTINZIONE FILE vs DIRECTORY ===\n');
  
  // Crea directory di test
  await fs.promises.mkdir('test-dir', { recursive: true });
  
  /**
   * Controlla se un percorso è un file, directory o non esiste
   * @param {string} itemPath - Percorso da controllare
   */
  async function checkPathType(itemPath) {
    try {
      const stats = await fs.promises.stat(itemPath);
      
      if (stats.isFile()) {
        return 'file';
      } else if (stats.isDirectory()) {
        return 'directory';
      } else {
        return 'other';
      }
      
    } catch (err) {
      if (err.code === 'ENOENT') {
        return 'not-found';
      }
      throw err;
    }
  }
  
  const type1 = await checkPathType('test-file.txt');
  console.log(`test-file.txt: ${type1}`);
  
  const type2 = await checkPathType('test-dir');
  console.log(`test-dir: ${type2}`);
  
  const type3 = await checkPathType('inesistente');
  console.log(`inesistente: ${type3}\n`);
  
}, 1500);

// ============================================
// ESEMPIO 5: CONTROLLA LISTA DI FILE
// ============================================
setTimeout(async () => {
  console.log('=== CONTROLLA LISTA DI FILE ===\n');
  
  /**
   * Controlla quali file di una lista esistono
   * @param {string[]} files - Array di percorsi file
   */
  async function checkMultipleFiles(files) {
    const results = [];
    
    for (const file of files) {
      try {
        await fs.promises.access(file);
        results.push({ file, exists: true });
      } catch {
        results.push({ file, exists: false });
      }
    }
    
    return results;
  }
  
  const filesToCheck = [
    'test-file.txt',
    'test-dir',
    'inesistente.txt',
    'altro-inesistente.txt'
  ];
  
  const results = await checkMultipleFiles(filesToCheck);
  
  console.log('Risultati controllo multiplo:');
  results.forEach(({ file, exists }) => {
    const icon = exists ? '✓' : '✗';
    console.log(`  ${icon} ${file}`);
  });
  
  console.log('');
  
}, 2000);

// ============================================
// ESEMPIO 6: ATTENDI CHE FILE ESISTA (POLLING)
// ============================================
setTimeout(async () => {
  console.log('=== ATTENDI CHE FILE ESISTA (POLLING) ===\n');
  
  /**
   * Attende che un file venga creato (polling)
   * @param {string} filePath - Percorso del file
   * @param {number} timeout - Timeout in ms
   * @param {number} interval - Intervallo polling in ms
   */
  async function waitForFile(filePath, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        await fs.promises.access(filePath);
        return true; // File trovato
      } catch {
        // File non esiste ancora, aspetta
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    return false; // Timeout raggiunto
  }
  
  console.log('Attendo che "future-file.txt" venga creato...');
  
  // Simula creazione file dopo 1 secondo
  setTimeout(() => {
    fs.writeFileSync('future-file.txt', 'Creato!');
  }, 1000);
  
  const found = await waitForFile('future-file.txt', 3000);
  
  if (found) {
    console.log('✓ File trovato!\n');
  } else {
    console.log('✗ Timeout: file non trovato\n');
  }
  
}, 2500);

// ============================================
// ESEMPIO 7: CONTROLLA ESISTENZA CON PATTERN
// ============================================
setTimeout(async () => {
  console.log('=== CONTROLLA FILE CON PATTERN ===\n');
  
  // Crea alcuni file di test
  await fs.promises.writeFile('data-001.txt', 'Data 1');
  await fs.promises.writeFile('data-002.txt', 'Data 2');
  await fs.promises.writeFile('data-003.txt', 'Data 3');
  
  /**
   * Trova file che matchano un pattern
   * @param {string} dirPath - Directory da cercare
   * @param {RegExp} pattern - Pattern regex
   */
  async function findMatchingFiles(dirPath, pattern) {
    try {
      const files = await fs.promises.readdir(dirPath);
      
      const matching = files.filter(file => pattern.test(file));
      
      return matching;
      
    } catch (err) {
      console.error('Errore:', err.message);
      return [];
    }
  }
  
  // Trova tutti i file data-*.txt
  const dataFiles = await findMatchingFiles('.', /^data-\d+\.txt$/);
  
  console.log(`Trovati ${dataFiles.length} file data-*.txt:`);
  dataFiles.forEach(file => console.log(`  - ${file}`));
  
  console.log('');
  
}, 4000);

// ============================================
// ESEMPIO 8: CONTROLLA FILE VECCHI
// ============================================
setTimeout(async () => {
  console.log('=== TROVA FILE VECCHI ===\n');
  
  /**
   * Trova file più vecchi di un certo tempo
   * @param {string} dirPath - Directory da cercare
   * @param {number} maxAge - Età massima in millisecondi
   */
  async function findOldFiles(dirPath, maxAge) {
    try {
      const files = await fs.promises.readdir(dirPath);
      const now = Date.now();
      const oldFiles = [];
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        
        try {
          const stats = await fs.promises.stat(filePath);
          
          if (stats.isFile()) {
            const age = now - stats.mtime.getTime();
            
            if (age > maxAge) {
              oldFiles.push({
                name: file,
                age: Math.floor(age / 1000), // In secondi
                modified: stats.mtime
              });
            }
          }
        } catch (err) {
          // Ignora errori su singoli file
        }
      }
      
      return oldFiles;
      
    } catch (err) {
      console.error('Errore:', err.message);
      return [];
    }
  }
  
  // Trova file più vecchi di 2 secondi
  const oldFiles = await findOldFiles('.', 2000);
  
  if (oldFiles.length > 0) {
    console.log(`Trovati ${oldFiles.length} file più vecchi di 2 secondi:`);
    oldFiles.forEach(({ name, age }) => {
      console.log(`  - ${name} (${age} secondi fa)`);
    });
  } else {
    console.log('Nessun file vecchio trovato');
  }
  
  console.log('');
  
}, 5000);

// ============================================
// ESEMPIO 9: VERIFICA INTEGRITÀ FILE
// ============================================
setTimeout(async () => {
  console.log('=== VERIFICA INTEGRITÀ FILE ===\n');
  
  /**
   * Verifica se un file esiste ed è leggibile
   * @param {string} filePath - Percorso del file
   */
  async function verifyFileIntegrity(filePath) {
    try {
      // 1. Controlla esistenza
      await fs.promises.access(filePath, fs.constants.F_OK);
      
      // 2. Controlla permessi di lettura
      await fs.promises.access(filePath, fs.constants.R_OK);
      
      // 3. Ottieni statistiche
      const stats = await fs.promises.stat(filePath);
      
      // 4. Verifica che sia un file (non directory)
      if (!stats.isFile()) {
        return { valid: false, reason: 'Non è un file' };
      }
      
      // 5. Verifica che non sia vuoto
      if (stats.size === 0) {
        return { valid: false, reason: 'File vuoto' };
      }
      
      // 6. Prova a leggere il file
      await fs.promises.readFile(filePath);
      
      return {
        valid: true,
        size: stats.size,
        modified: stats.mtime
      };
      
    } catch (err) {
      return {
        valid: false,
        reason: err.message
      };
    }
  }
  
  // Test su vari file
  const testFiles = ['test-file.txt', 'test-dir', 'inesistente.txt'];
  
  console.log('Verifica integrità file:');
  
  for (const file of testFiles) {
    const result = await verifyFileIntegrity(file);
    
    if (result.valid) {
      console.log(`  ✓ ${file} - OK (${result.size} byte)`);
    } else {
      console.log(`  ✗ ${file} - ${result.reason}`);
    }
  }
  
  console.log('');
  
}, 6000);

// ============================================
// ESEMPIO 10: CLASSE FILE CHECKER
// ============================================
setTimeout(async () => {
  console.log('=== CLASSE FILE CHECKER ===\n');
  
  /**
   * Classe utility per controllo file
   */
  class FileChecker {
    /**
     * Verifica esistenza file
     */
    static async exists(filePath) {
      try {
        await fs.promises.access(filePath);
        return true;
      } catch {
        return false;
      }
    }
    
    /**
     * Verifica se è un file
     */
    static async isFile(filePath) {
      try {
        const stats = await fs.promises.stat(filePath);
        return stats.isFile();
      } catch {
        return false;
      }
    }
    
    /**
     * Verifica se è una directory
     */
    static async isDirectory(filePath) {
      try {
        const stats = await fs.promises.stat(filePath);
        return stats.isDirectory();
      } catch {
        return false;
      }
    }
    
    /**
     * Verifica se file è leggibile
     */
    static async isReadable(filePath) {
      try {
        await fs.promises.access(filePath, fs.constants.R_OK);
        return true;
      } catch {
        return false;
      }
    }
    
    /**
     * Verifica se file è scrivibile
     */
    static async isWritable(filePath) {
      try {
        await fs.promises.access(filePath, fs.constants.W_OK);
        return true;
      } catch {
        return false;
      }
    }
    
    /**
     * Ottieni informazioni complete
     */
    static async getInfo(filePath) {
      return {
        exists: await this.exists(filePath),
        isFile: await this.isFile(filePath),
        isDirectory: await this.isDirectory(filePath),
        isReadable: await this.isReadable(filePath),
        isWritable: await this.isWritable(filePath)
      };
    }
  }
  
  // Test della classe
  const info = await FileChecker.getInfo('test-file.txt');
  
  console.log('Informazioni complete su test-file.txt:');
  console.log(JSON.stringify(info, null, 2));
  
  console.log('');
  
}, 7000);

// ============================================
// PULIZIA FILE DI TEST
// ============================================
setTimeout(async () => {
  console.log('=== PULIZIA FILE DI TEST ===\n');
  
  const filesToDelete = [
    'test-file.txt',
    'future-file.txt',
    'data-001.txt',
    'data-002.txt',
    'data-003.txt'
  ];
  
  for (const file of filesToDelete) {
    try {
      if (fs.existsSync(file)) {
        await fs.promises.unlink(file);
        console.log(`✓ Eliminato: ${file}`);
      }
    } catch (err) {
      console.error(`Errore eliminando ${file}:`, err.message);
    }
  }
  
  // Elimina directory
  try {
    if (fs.existsSync('test-dir')) {
      await fs.promises.rmdir('test-dir');
      console.log('✓ Eliminata: test-dir');
    }
  } catch (err) {
    console.error('Errore eliminando test-dir:', err.message);
  }
  
  console.log('\n✅ Pulizia completata');
  
}, 8000);

console.log('\n⏳ Tutti gli esempi verranno eseguiti in sequenza...\n');
