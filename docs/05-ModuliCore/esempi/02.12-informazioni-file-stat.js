/**
 * ESEMPIO 02.12 - Informazioni sui File (stat)
 * 
 * Il metodo fs.stat() restituisce informazioni dettagliate su file e directory.
 * È fondamentale per ottenere metadati come dimensione, date di modifica,
 * permessi e tipo di elemento.
 * 
 * INFORMAZIONI DISPONIBILI:
 * - Dimensione file
 * - Date (creazione, modifica, accesso)
 * - Tipo (file, directory, link simbolico)
 * - Permessi e owner
 * - Inode e device numbers
 */

const fs = require('fs');
const path = require('path');

// ============================================
// ESEMPIO 1: STAT SINCRONO
// ============================================
console.log('=== STAT SINCRONO ===\n');

// Crea un file di test
fs.writeFileSync('test-file.txt', 'Contenuto di test\n'.repeat(10));

try {
  const stats = fs.statSync('test-file.txt');
  
  console.log('Informazioni file:');
  console.log(`  È un file: ${stats.isFile()}`);
  console.log(`  È una directory: ${stats.isDirectory()}`);
  console.log(`  È un symbolic link: ${stats.isSymbolicLink()}`);
  console.log(`  Dimensione: ${stats.size} byte`);
  console.log(`  Data creazione: ${stats.birthtime}`);
  console.log(`  Data ultima modifica: ${stats.mtime}`);
  console.log(`  Data ultimo accesso: ${stats.atime}\n`);
  
} catch (err) {
  console.error('Errore:', err.message);
}

// ============================================
// ESEMPIO 2: STAT ASINCRONO CON CALLBACK
// ============================================
console.log('=== STAT ASINCRONO CON CALLBACK ===\n');

fs.stat('test-file.txt', (err, stats) => {
  if (err) {
    console.error('Errore:', err.message);
    return;
  }
  
  console.log('Statistiche dettagliate:');
  console.log(`  dev: ${stats.dev} (device)`);
  console.log(`  ino: ${stats.ino} (inode)`);
  console.log(`  mode: ${stats.mode} (permessi)`);
  console.log(`  nlink: ${stats.nlink} (numero hard links)`);
  console.log(`  uid: ${stats.uid} (user ID)`);
  console.log(`  gid: ${stats.gid} (group ID)`);
  console.log(`  size: ${stats.size} byte`);
  console.log(`  blksize: ${stats.blksize} (dimensione blocco I/O)`);
  console.log(`  blocks: ${stats.blocks} (numero blocchi allocati)\n`);
});

// ============================================
// ESEMPIO 3: STAT ASINCRONO CON PROMISE
// ============================================
setTimeout(async () => {
  console.log('=== STAT CON PROMISE ===\n');
  
  /**
   * Ottiene informazioni dettagliate su un file
   * @param {string} filePath - Percorso del file
   */
  async function getFileInfo(filePath) {
    try {
      const stats = await fs.promises.stat(filePath);
      
      return {
        path: filePath,
        type: stats.isFile() ? 'File' : stats.isDirectory() ? 'Directory' : 'Other',
        size: stats.size,
        sizeMB: (stats.size / 1024 / 1024).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        isReadable: !!(stats.mode & fs.constants.R_OK),
        isWritable: !!(stats.mode & fs.constants.W_OK),
        isExecutable: !!(stats.mode & fs.constants.X_OK)
      };
      
    } catch (err) {
      console.error(`Errore con ${filePath}:`, err.message);
      return null;
    }
  }
  
  const info = await getFileInfo('test-file.txt');
  
  if (info) {
    console.log('Informazioni complete:');
    console.log(JSON.stringify(info, null, 2));
    console.log('');
  }
  
}, 1000);

// ============================================
// ESEMPIO 4: CONFRONTO DATE FILE
// ============================================
setTimeout(async () => {
  console.log('=== CONFRONTO DATE FILE ===\n');
  
  // Crea due file con timestamp diversi
  fs.writeFileSync('file1.txt', 'File 1');
  
  // Aspetta un po' prima di creare il secondo
  setTimeout(async () => {
    fs.writeFileSync('file2.txt', 'File 2');
    
    const stats1 = await fs.promises.stat('file1.txt');
    const stats2 = await fs.promises.stat('file2.txt');
    
    console.log(`File1 creato: ${stats1.birthtime.toISOString()}`);
    console.log(`File2 creato: ${stats2.birthtime.toISOString()}`);
    
    if (stats1.mtime < stats2.mtime) {
      console.log('\n✓ file1.txt è più vecchio di file2.txt\n');
    } else {
      console.log('\n✓ file2.txt è più vecchio di file1.txt\n');
    }
  }, 100);
  
}, 2000);

// ============================================
// ESEMPIO 5: FORMATTAZIONE DIMENSIONI FILE
// ============================================
setTimeout(() => {
  console.log('=== FORMATTAZIONE DIMENSIONI ===\n');
  
  /**
   * Formatta la dimensione del file in modo leggibile
   * @param {number} bytes - Dimensione in byte
   * @returns {string} - Dimensione formattata
   */
  function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
  
  // Crea file di diverse dimensioni
  fs.writeFileSync('small.txt', 'x'.repeat(500));                    // ~500 B
  fs.writeFileSync('medium.txt', 'x'.repeat(50 * 1024));            // ~50 KB
  fs.writeFileSync('large.txt', 'x'.repeat(2 * 1024 * 1024));       // ~2 MB
  
  const files = ['small.txt', 'medium.txt', 'large.txt'];
  
  files.forEach(file => {
    const stats = fs.statSync(file);
    console.log(`${file}: ${formatSize(stats.size)}`);
  });
  
  console.log('');
  
}, 3500);

// ============================================
// ESEMPIO 6: CALCOLO ETÀ FILE
// ============================================
setTimeout(async () => {
  console.log('=== ETÀ FILE ===\n');
  
  /**
   * Calcola da quanto tempo un file è stato modificato
   * @param {string} filePath - Percorso del file
   */
  async function getFileAge(filePath) {
    try {
      const stats = await fs.promises.stat(filePath);
      const now = Date.now();
      const modified = stats.mtime.getTime();
      
      const ageMs = now - modified;
      const ageSeconds = Math.floor(ageMs / 1000);
      const ageMinutes = Math.floor(ageSeconds / 60);
      const ageHours = Math.floor(ageMinutes / 60);
      const ageDays = Math.floor(ageHours / 24);
      
      let ageString;
      if (ageDays > 0) {
        ageString = `${ageDays} giorn${ageDays > 1 ? 'i' : 'o'}`;
      } else if (ageHours > 0) {
        ageString = `${ageHours} or${ageHours > 1 ? 'e' : 'a'}`;
      } else if (ageMinutes > 0) {
        ageString = `${ageMinutes} minut${ageMinutes > 1 ? 'i' : 'o'}`;
      } else {
        ageString = `${ageSeconds} second${ageSeconds !== 1 ? 'i' : 'o'}`;
      }
      
      console.log(`${filePath}: modificato ${ageString} fa`);
      
    } catch (err) {
      console.error(`Errore con ${filePath}:`, err.message);
    }
  }
  
  await getFileAge('test-file.txt');
  await getFileAge('file1.txt');
  await getFileAge('file2.txt');
  
  console.log('');
  
}, 5000);

// ============================================
// ESEMPIO 7: CONFRONTO FILE E DIRECTORY
// ============================================
setTimeout(async () => {
  console.log('=== DISTINZIONE FILE/DIRECTORY ===\n');
  
  // Crea una directory di test
  await fs.promises.mkdir('test-dir', { recursive: true });
  await fs.promises.writeFile('test-dir/file-in-dir.txt', 'Contenuto');
  
  /**
   * Determina il tipo di un elemento del file system
   * @param {string} itemPath - Percorso dell'elemento
   */
  async function getItemType(itemPath) {
    try {
      const stats = await fs.promises.stat(itemPath);
      
      if (stats.isFile()) return '📄 File';
      if (stats.isDirectory()) return '📁 Directory';
      if (stats.isSymbolicLink()) return '🔗 Symbolic Link';
      if (stats.isBlockDevice()) return '📦 Block Device';
      if (stats.isCharacterDevice()) return '⚙️  Character Device';
      if (stats.isFIFO()) return '📮 FIFO';
      if (stats.isSocket()) return '🔌 Socket';
      
      return '❓ Unknown';
      
    } catch (err) {
      return `❌ Error: ${err.message}`;
    }
  }
  
  const items = [
    'test-file.txt',
    'test-dir',
    'test-dir/file-in-dir.txt',
    'non-existent.txt'
  ];
  
  for (const item of items) {
    const type = await getItemType(item);
    console.log(`${item}: ${type}`);
  }
  
  console.log('');
  
}, 6500);

// ============================================
// ESEMPIO 8: TROVA FILE PIÙ GRANDE
// ============================================
setTimeout(async () => {
  console.log('=== TROVA FILE PIÙ GRANDE ===\n');
  
  /**
   * Trova il file più grande in una directory
   * @param {string} dirPath - Percorso della directory
   */
  async function findLargestFile(dirPath) {
    try {
      const files = await fs.promises.readdir(dirPath);
      
      let largestFile = null;
      let largestSize = 0;
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        
        try {
          const stats = await fs.promises.stat(filePath);
          
          if (stats.isFile() && stats.size > largestSize) {
            largestSize = stats.size;
            largestFile = file;
          }
        } catch (err) {
          // Ignora errori su singoli file
        }
      }
      
      if (largestFile) {
        console.log(`File più grande: ${largestFile}`);
        console.log(`Dimensione: ${(largestSize / 1024).toFixed(2)} KB`);
      } else {
        console.log('Nessun file trovato');
      }
      
    } catch (err) {
      console.error('Errore:', err.message);
    }
  }
  
  await findLargestFile('.');
  
  console.log('');
  
}, 8000);

// ============================================
// ESEMPIO 9: STATISTICHE DIRECTORY
// ============================================
setTimeout(async () => {
  console.log('=== STATISTICHE DIRECTORY ===\n');
  
  /**
   * Calcola statistiche complete di una directory
   * @param {string} dirPath - Percorso della directory
   */
  async function getDirectoryStats(dirPath) {
    let totalFiles = 0;
    let totalDirectories = 0;
    let totalSize = 0;
    let oldestFile = { name: '', mtime: new Date() };
    let newestFile = { name: '', mtime: new Date(0) };
    
    async function scan(currentPath) {
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        try {
          const stats = await fs.promises.stat(fullPath);
          
          if (entry.isDirectory()) {
            totalDirectories++;
            await scan(fullPath); // Ricorsione
          } else {
            totalFiles++;
            totalSize += stats.size;
            
            if (stats.mtime < oldestFile.mtime) {
              oldestFile = { name: fullPath, mtime: stats.mtime };
            }
            if (stats.mtime > newestFile.mtime) {
              newestFile = { name: fullPath, mtime: stats.mtime };
            }
          }
        } catch (err) {
          // Ignora errori su singoli elementi
        }
      }
    }
    
    try {
      await scan(dirPath);
      
      console.log(`Statistiche per ${dirPath}:`);
      console.log(`  File totali: ${totalFiles}`);
      console.log(`  Directory totali: ${totalDirectories}`);
      console.log(`  Dimensione totale: ${(totalSize / 1024).toFixed(2)} KB`);
      console.log(`  File più vecchio: ${oldestFile.name}`);
      console.log(`  File più recente: ${newestFile.name}\n`);
      
    } catch (err) {
      console.error('Errore:', err.message);
    }
  }
  
  await getDirectoryStats('.');
  
}, 9500);

// ============================================
// PULIZIA FILE DI TEST
// ============================================
setTimeout(async () => {
  console.log('=== PULIZIA FILE DI TEST ===\n');
  
  const filesToDelete = [
    'test-file.txt',
    'file1.txt',
    'file2.txt',
    'small.txt',
    'medium.txt',
    'large.txt'
  ];
  
  for (const file of filesToDelete) {
    try {
      await fs.promises.unlink(file);
      console.log(`✓ Eliminato: ${file}`);
    } catch (err) {
      // File potrebbe non esistere
    }
  }
  
  // Elimina directory
  try {
    await fs.promises.rm('test-dir', { recursive: true, force: true });
    console.log('✓ Eliminata: test-dir');
  } catch (err) {
    // Directory potrebbe non esistere
  }
  
  console.log('\n✅ Pulizia completata');
  
}, 12000);

console.log('\n⏳ Tutti gli esempi verranno eseguiti in sequenza...\n');
