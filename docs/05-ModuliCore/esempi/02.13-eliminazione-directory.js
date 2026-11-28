/**
 * ESEMPIO 02.13 - Eliminazione Directory
 * 
 * Questo esempio mostra come eliminare directory usando rmdir() e rm().
 * 
 * DIFFERENZE:
 * - rmdir(): elimina solo directory VUOTE
 * - rm() con recursive: true: elimina directory e tutto il contenuto
 * 
 * ATTENZIONE: L'eliminazione ricorsiva è PERMANENTE! Usa con cautela.
 */

const fs = require('fs');
const path = require('path');

// ============================================
// ESEMPIO 1: ELIMINAZIONE DIRECTORY VUOTA (SINCRONO)
// ============================================
console.log('=== ELIMINAZIONE DIRECTORY VUOTA (SINCRONO) ===\n');

try {
  // Crea una directory vuota
  fs.mkdirSync('empty-dir');
  console.log('✓ Directory vuota creata');
  
  // Elimina la directory vuota
  fs.rmdirSync('empty-dir');
  console.log('✓ Directory vuota eliminata con successo\n');
  
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('ℹ Directory non esistente');
  } else if (err.code === 'ENOTEMPTY') {
    console.log('❌ Errore: la directory non è vuota');
  } else {
    console.error('Errore:', err.message);
  }
}

// ============================================
// ESEMPIO 2: TENTATIVO DI ELIMINARE DIRECTORY NON VUOTA
// ============================================
setTimeout(() => {
  console.log('=== TENTATIVO DI ELIMINARE DIRECTORY NON VUOta ===\n');
  
  // Crea directory con contenuto
  fs.mkdirSync('non-empty-dir', { recursive: true });
  fs.writeFileSync('non-empty-dir/file.txt', 'Contenuto');
  console.log('✓ Directory con file creata');
  
  // Tenta di eliminarla con rmdir (FALLIRÀ)
  try {
    fs.rmdirSync('non-empty-dir');
  } catch (err) {
    if (err.code === 'ENOTEMPTY' || err.code === 'EEXIST') {
      console.log('❌ Errore ENOTEMPTY: rmdir() non può eliminare directory non vuote');
      console.log('ℹ  Usa rm() con recursive: true per eliminare directory con contenuto\n');
    } else {
      console.error('Errore:', err.message);
    }
  }
  
}, 500);

// ============================================
// ESEMPIO 3: ELIMINAZIONE RICORSIVA CON rm()
// ============================================
setTimeout(async () => {
  console.log('=== ELIMINAZIONE RICORSIVA CON rm() ===\n');
  
  /**
   * Elimina una directory e tutto il suo contenuto
   * @param {string} dirPath - Percorso della directory
   * @param {boolean} force - Se true, non solleva errore se non esiste
   */
  async function eliminaDirectoryRicorsiva(dirPath, force = true) {
    try {
      // rm() con recursive: true elimina directory e tutto il contenuto
      await fs.promises.rm(dirPath, { 
        recursive: true,  // Elimina ricorsivamente
        force: force      // Non genera errore se non esiste
      });
      
      console.log(`✓ Directory "${dirPath}" eliminata ricorsivamente`);
      
    } catch (err) {
      if (err.code === 'ENOENT' && !force) {
        console.log(`ℹ Directory "${dirPath}" non esiste`);
      } else if (!force) {
        console.error(`Errore nell'eliminazione di "${dirPath}":`, err.message);
      }
    }
  }
  
  // Elimina la directory non vuota creata prima
  await eliminaDirectoryRicorsiva('non-empty-dir');
  
  console.log('');
  
}, 1000);

// ============================================
// ESEMPIO 4: ELIMINAZIONE ASINCRONA CON CALLBACK
// ============================================
setTimeout(() => {
  console.log('=== ELIMINAZIONE ASINCRONA CON CALLBACK ===\n');
  
  // Crea struttura di directory
  fs.mkdirSync('test-async/sub1/sub2', { recursive: true });
  fs.writeFileSync('test-async/file1.txt', 'Contenuto 1');
  fs.writeFileSync('test-async/sub1/file2.txt', 'Contenuto 2');
  console.log('✓ Struttura directory creata');
  
  // Elimina con callback
  fs.rm('test-async', { recursive: true, force: true }, (err) => {
    if (err) {
      console.error('Errore:', err.message);
      return;
    }
    console.log('✓ Directory eliminata con callback\n');
  });
  
}, 1500);

// ============================================
// ESEMPIO 5: SVUOTA DIRECTORY (SENZA ELIMINARLA)
// ============================================
setTimeout(async () => {
  console.log('=== SVUOTA DIRECTORY (MANTIENE LA CARTELLA) ===\n');
  
  /**
   * Elimina tutto il contenuto di una directory ma mantiene la directory stessa
   * @param {string} dirPath - Percorso della directory
   */
  async function svuotaDirectory(dirPath) {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Elimina ricorsivamente sottodirectory
          await fs.promises.rm(fullPath, { recursive: true, force: true });
        } else {
          // Elimina file
          await fs.promises.unlink(fullPath);
        }
      }
      
      console.log(`✓ Directory "${dirPath}" svuotata (${entries.length} elementi eliminati)`);
      
    } catch (err) {
      console.error('Errore:', err.message);
    }
  }
  
  // Crea struttura di test
  await fs.promises.mkdir('to-empty/sub', { recursive: true });
  await fs.promises.writeFile('to-empty/file1.txt', 'File 1');
  await fs.promises.writeFile('to-empty/file2.txt', 'File 2');
  await fs.promises.writeFile('to-empty/sub/file3.txt', 'File 3');
  console.log('✓ Directory con contenuto creata');
  
  // Svuota la directory
  await svuotaDirectory('to-empty');
  
  // Verifica che la directory esista ancora ma sia vuota
  const remaining = await fs.promises.readdir('to-empty');
  console.log(`  Elementi rimasti: ${remaining.length}`);
  console.log(`  Directory ancora esiste: ${fs.existsSync('to-empty')}\n`);
  
  // Pulizia
  await fs.promises.rmdir('to-empty');
  
}, 2000);

// ============================================
// ESEMPIO 6: ELIMINAZIONE SICURA CON CONFERMA
// ============================================
setTimeout(async () => {
  console.log('=== ELIMINAZIONE SICURA CON VALIDAZIONE ===\n');
  
  /**
   * Elimina una directory solo se rispetta certi criteri di sicurezza
   * @param {string} dirPath - Percorso della directory
   */
  async function eliminazioneSicura(dirPath) {
    try {
      // Validazioni di sicurezza
      const absolutePath = path.resolve(dirPath);
      
      // 1. Non eliminare directory di sistema
      const protectedPaths = [
        '/',
        '/home',
        '/usr',
        '/bin',
        '/etc',
        process.env.HOME,
        path.resolve('.')  // Directory corrente
      ];
      
      if (protectedPaths.includes(absolutePath)) {
        console.error(`❌ Errore: directory protetta "${dirPath}"`);
        return false;
      }
      
      // 2. Verifica che la directory esista
      try {
        await fs.promises.access(dirPath);
      } catch {
        console.log(`ℹ  Directory "${dirPath}" non esiste`);
        return false;
      }
      
      // 3. Ottieni informazioni sulla directory
      const stats = await fs.promises.stat(dirPath);
      
      if (!stats.isDirectory()) {
        console.error(`❌ Errore: "${dirPath}" non è una directory`);
        return false;
      }
      
      // 4. Conta elementi da eliminare
      let totalItems = 0;
      async function contaElementi(currentPath) {
        const entries = await fs.promises.readdir(currentPath);
        totalItems += entries.length;
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry);
          const stats = await fs.promises.stat(fullPath);
          
          if (stats.isDirectory()) {
            await contaElementi(fullPath);
          }
        }
      }
      
      await contaElementi(dirPath);
      
      console.log(`ℹ  Directory "${dirPath}" contiene ${totalItems} elementi`);
      
      // In uno script interattivo, qui chiederesti conferma all'utente
      // Per questo esempio, procediamo automaticamente
      console.log('✓ Validazioni passate, procedo con eliminazione...');
      
      // Elimina
      await fs.promises.rm(dirPath, { recursive: true, force: true });
      console.log(`✓ Directory "${dirPath}" eliminata con successo\n`);
      
      return true;
      
    } catch (err) {
      console.error('Errore nell\'eliminazione sicura:', err.message);
      return false;
    }
  }
  
  // Test eliminazione sicura
  await fs.promises.mkdir('safe-delete-test/sub', { recursive: true });
  await fs.promises.writeFile('safe-delete-test/file.txt', 'Test');
  await fs.promises.writeFile('safe-delete-test/sub/file2.txt', 'Test 2');
  
  await eliminazioneSicura('safe-delete-test');
  
}, 3000);

// ============================================
// ESEMPIO 7: ELIMINAZIONE CON RETRY
// ============================================
setTimeout(async () => {
  console.log('=== ELIMINAZIONE CON RETRY (FILE BLOCCATI) ===\n');
  
  /**
   * Tenta di eliminare una directory con retry in caso di errore
   * Utile quando file potrebbero essere temporaneamente bloccati
   * @param {string} dirPath - Percorso della directory
   * @param {number} maxRetries - Numero massimo di tentativi
   * @param {number} delay - Delay tra tentativi in ms
   */
  async function eliminaConRetry(dirPath, maxRetries = 3, delay = 500) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await fs.promises.rm(dirPath, { recursive: true, force: true });
        console.log(`✓ Directory "${dirPath}" eliminata al tentativo ${attempt}`);
        return true;
        
      } catch (err) {
        if (attempt === maxRetries) {
          console.error(`❌ Eliminazione fallita dopo ${maxRetries} tentativi:`, err.message);
          return false;
        }
        
        console.log(`⚠️  Tentativo ${attempt} fallito: ${err.message}`);
        console.log(`   Riprovo tra ${delay}ms...`);
        
        // Aspetta prima di ritentare
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Test
  await fs.promises.mkdir('retry-test', { recursive: true });
  await fs.promises.writeFile('retry-test/file.txt', 'Test');
  
  await eliminaConRetry('retry-test', 3, 300);
  
  console.log('');
  
}, 4500);

// ============================================
// ESEMPIO 8: ELIMINAZIONE SELETTIVA
// ============================================
setTimeout(async () => {
  console.log('=== ELIMINAZIONE SELETTIVA (FILTRI) ===\n');
  
  /**
   * Elimina solo certi tipi di file da una directory
   * @param {string} dirPath - Percorso della directory
   * @param {string} pattern - Pattern da matchare (es. '*.tmp', '*.log')
   */
  async function eliminaPerPattern(dirPath, pattern) {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      let deleted = 0;
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isFile()) {
          // Controlla se il file matcha il pattern
          const regex = new RegExp(pattern.replace('*', '.*'));
          
          if (regex.test(entry.name)) {
            await fs.promises.unlink(fullPath);
            console.log(`  ✓ Eliminato: ${entry.name}`);
            deleted++;
          }
        } else if (entry.isDirectory()) {
          // Ricorsione nelle sottodirectory
          deleted += await eliminaPerPattern(fullPath, pattern);
        }
      }
      
      return deleted;
      
    } catch (err) {
      console.error('Errore:', err.message);
      return 0;
    }
  }
  
  // Crea struttura di test
  await fs.promises.mkdir('selective-delete', { recursive: true });
  await fs.promises.writeFile('selective-delete/file1.txt', 'Keep');
  await fs.promises.writeFile('selective-delete/temp1.tmp', 'Delete');
  await fs.promises.writeFile('selective-delete/file2.txt', 'Keep');
  await fs.promises.writeFile('selective-delete/temp2.tmp', 'Delete');
  await fs.promises.writeFile('selective-delete/log.log', 'Delete');
  
  console.log('Eliminazione file *.tmp:');
  const deletedTmp = await eliminaPerPattern('selective-delete', '*.tmp');
  console.log(`\nTotale file *.tmp eliminati: ${deletedTmp}`);
  
  console.log('\nEliminazione file *.log:');
  const deletedLog = await eliminaPerPattern('selective-delete', '*.log');
  console.log(`\nTotale file *.log eliminati: ${deletedLog}`);
  
  // Verifica cosa rimane
  const remaining = await fs.promises.readdir('selective-delete');
  console.log(`\nFile rimanenti: ${remaining.join(', ')}\n`);
  
  // Pulizia
  await fs.promises.rm('selective-delete', { recursive: true, force: true });
  
}, 6000);

// ============================================
// ESEMPIO 9: ELIMINAZIONE CON REPORT
// ============================================
setTimeout(async () => {
  console.log('=== ELIMINAZIONE CON REPORT DETTAGLIATO ===\n');
  
  /**
   * Elimina directory e genera report dettagliato
   * @param {string} dirPath - Percorso della directory
   */
  async function eliminaConReport(dirPath) {
    const report = {
      directoriesDeleted: 0,
      filesDeleted: 0,
      totalSize: 0,
      errors: []
    };
    
    async function elimina(currentPath) {
      try {
        const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          
          try {
            if (entry.isDirectory()) {
              await elimina(fullPath); // Ricorsione
              await fs.promises.rmdir(fullPath);
              report.directoriesDeleted++;
            } else {
              const stats = await fs.promises.stat(fullPath);
              report.totalSize += stats.size;
              
              await fs.promises.unlink(fullPath);
              report.filesDeleted++;
            }
          } catch (err) {
            report.errors.push(`${fullPath}: ${err.message}`);
          }
        }
        
      } catch (err) {
        report.errors.push(`${currentPath}: ${err.message}`);
      }
    }
    
    try {
      await elimina(dirPath);
      await fs.promises.rmdir(dirPath);
      
      console.log('📊 REPORT ELIMINAZIONE:');
      console.log(`  Directory eliminate: ${report.directoriesDeleted}`);
      console.log(`  File eliminati: ${report.filesDeleted}`);
      console.log(`  Spazio liberato: ${(report.totalSize / 1024).toFixed(2)} KB`);
      
      if (report.errors.length > 0) {
        console.log(`  ⚠️  Errori: ${report.errors.length}`);
        report.errors.forEach(err => console.log(`    - ${err}`));
      }
      
      console.log('');
      
    } catch (err) {
      console.error('Errore finale:', err.message);
    }
  }
  
  // Crea struttura complessa
  await fs.promises.mkdir('report-test/sub1/sub2', { recursive: true });
  await fs.promises.mkdir('report-test/sub3', { recursive: true });
  await fs.promises.writeFile('report-test/file1.txt', 'x'.repeat(1000));
  await fs.promises.writeFile('report-test/sub1/file2.txt', 'x'.repeat(2000));
  await fs.promises.writeFile('report-test/sub1/sub2/file3.txt', 'x'.repeat(3000));
  await fs.promises.writeFile('report-test/sub3/file4.txt', 'x'.repeat(4000));
  
  await eliminaConReport('report-test');
  
}, 7500);

console.log('\n⏳ Tutti gli esempi verranno eseguiti in sequenza...\n');
