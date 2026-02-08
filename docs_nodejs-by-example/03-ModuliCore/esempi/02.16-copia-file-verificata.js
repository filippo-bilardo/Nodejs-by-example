/**
 * ESEMPIO 02.16 - Copia File con Verifica
 * 
 * Questo esempio mostra vari metodi per copiare file, inclusa la verifica
 * dell'integrità tramite checksum.
 * 
 * METODI:
 * 1. fs.copyFile() - Metodo nativo semplice
 * 2. Stream pipe - Per file grandi
 * 3. Con checksum MD5/SHA256 - Verifica integrità
 * 4. Con progress callback - Monitoraggio avanzamento
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// ============================================
// ESEMPIO 1: COPIA SEMPLICE CON copyFile()
// ============================================
console.log('=== COPIA SEMPLICE ===\n');

// Crea file sorgente
fs.writeFileSync('source.txt', 'Contenuto da copiare\n'.repeat(10));

// Copia sincrona
fs.copyFileSync('source.txt', 'dest-sync.txt');
console.log('✓ Copia sincrona completata');

// Copia asincrona con callback
fs.copyFile('source.txt', 'dest-callback.txt', (err) => {
  if (err) {
    console.error('Errore:', err.message);
    return;
  }
  console.log('✓ Copia con callback completata');
});

// Copia asincrona con promise
setTimeout(async () => {
  await fs.promises.copyFile('source.txt', 'dest-promise.txt');
  console.log('✓ Copia con promise completata\n');
}, 500);

// ============================================
// ESEMPIO 2: COPIA CON FLAG
// ============================================
setTimeout(async () => {
  console.log('=== COPIA CON FLAG ===\n');
  
  /**
   * Flag disponibili:
   * - fs.constants.COPYFILE_EXCL: Fallisce se destinazione esiste
   * - fs.constants.COPYFILE_FICLONE: Copy-on-write se supportato
   * - fs.constants.COPYFILE_FICLONE_FORCE: Come sopra, ma fallisce se non supportato
   */
  
  // Sovrascrive se esiste (default)
  await fs.promises.copyFile('source.txt', 'overwrite.txt');
  console.log('✓ File copiato (sovrascrive se esiste)');
  
  // Non sovrascrive se esiste
  try {
    await fs.promises.copyFile(
      'source.txt',
      'overwrite.txt',
      fs.constants.COPYFILE_EXCL
    );
  } catch (err) {
    console.log('✓ Copia saltata: destinazione già esiste (COPYFILE_EXCL)\n');
  }
  
}, 1000);

// ============================================
// ESEMPIO 3: CALCOLO CHECKSUM
// ============================================
setTimeout(async () => {
  console.log('=== CALCOLO CHECKSUM ===\n');
  
  /**
   * Calcola checksum di un file
   * @param {string} filePath - Percorso del file
   * @param {string} algorithm - Algoritmo (md5, sha1, sha256, ecc.)
   */
  async function calculateChecksum(filePath, algorithm = 'md5') {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => {
        hash.update(data);
      });
      
      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
  }
  
  // Calcola checksum file originale
  const checksumMD5 = await calculateChecksum('source.txt', 'md5');
  const checksumSHA256 = await calculateChecksum('source.txt', 'sha256');
  
  console.log(`Checksum source.txt:`);
  console.log(`  MD5:    ${checksumMD5}`);
  console.log(`  SHA256: ${checksumSHA256}\n`);
  
}, 1500);

// ============================================
// ESEMPIO 4: COPIA CON VERIFICA INTEGRITÀ
// ============================================
setTimeout(async () => {
  console.log('=== COPIA CON VERIFICA INTEGRITÀ ===\n');
  
  /**
   * Copia file e verifica l'integrità tramite checksum
   * @param {string} source - File sorgente
   * @param {string} dest - File destinazione
   * @param {string} algorithm - Algoritmo checksum
   */
  async function copyFileWithVerification(source, dest, algorithm = 'sha256') {
    try {
      // 1. Calcola checksum sorgente
      console.log('  1. Calcolo checksum sorgente...');
      const sourceChecksum = await calculateChecksum(source, algorithm);
      
      // 2. Copia file
      console.log('  2. Copia file...');
      await fs.promises.copyFile(source, dest);
      
      // 3. Calcola checksum destinazione
      console.log('  3. Calcolo checksum destinazione...');
      const destChecksum = await calculateChecksum(dest, algorithm);
      
      // 4. Verifica
      console.log('  4. Verifica checksum...');
      
      if (sourceChecksum === destChecksum) {
        console.log(`  ✓ Copia verificata! Checksum: ${sourceChecksum.substring(0, 16)}...\n`);
        return { success: true, checksum: sourceChecksum };
      } else {
        console.error('  ❌ ERRORE: Checksum non corrispondono!');
        console.error(`     Sorgente: ${sourceChecksum}`);
        console.error(`     Dest:     ${destChecksum}\n`);
        
        // Elimina file corrotto
        await fs.promises.unlink(dest);
        
        return { success: false, error: 'Checksum mismatch' };
      }
      
    } catch (err) {
      console.error('Errore:', err.message);
      return { success: false, error: err.message };
    }
  }
  
  /**
   * Helper per calcolo checksum (rif. esempio 3)
   */
  async function calculateChecksum(filePath, algorithm = 'md5') {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }
  
  const result = await copyFileWithVerification('source.txt', 'verified-copy.txt');
  
}, 2000);

// ============================================
// ESEMPIO 5: COPIA CON PROGRESS
// ============================================
setTimeout(async () => {
  console.log('=== COPIA CON PROGRESS MONITORING ===\n');
  
  // Crea file grande per test
  const largeContent = 'x'.repeat(100000); // 100KB
  fs.writeFileSync('large-file.bin', largeContent);
  
  /**
   * Copia file con callback di progress
   * @param {string} source - File sorgente
   * @param {string} dest - File destinazione
   * @param {Function} onProgress - Callback progress (bytesWritten, totalBytes)
   */
  async function copyFileWithProgress(source, dest, onProgress) {
    return new Promise(async (resolve, reject) => {
      try {
        // Ottieni dimensione file
        const stats = await fs.promises.stat(source);
        const totalSize = stats.size;
        let copiedSize = 0;
        
        // Crea stream
        const readStream = fs.createReadStream(source);
        const writeStream = fs.createWriteStream(dest);
        
        // Monitora progresso
        readStream.on('data', (chunk) => {
          copiedSize += chunk.length;
          
          if (onProgress) {
            const percentage = ((copiedSize / totalSize) * 100).toFixed(1);
            onProgress(copiedSize, totalSize, percentage);
          }
        });
        
        // Gestisci completamento
        writeStream.on('finish', () => {
          resolve({ success: true, size: totalSize });
        });
        
        // Gestisci errori
        readStream.on('error', reject);
        writeStream.on('error', reject);
        
        // Avvia copia
        readStream.pipe(writeStream);
        
      } catch (err) {
        reject(err);
      }
    });
  }
  
  // Test con progress
  await copyFileWithProgress('large-file.bin', 'large-copy.bin', (copied, total, percentage) => {
    // Mostra progress ogni 25%
    if (percentage % 25 < 1) {
      process.stdout.write(`\r  Progress: ${percentage}% (${copied}/${total} bytes)`);
    }
  });
  
  console.log('\n  ✓ Copia con progress completata\n');
  
}, 3000);

// ============================================
// ESEMPIO 6: COPIA DIRECTORY RICORSIVA
// ============================================
setTimeout(async () => {
  console.log('=== COPIA DIRECTORY RICORSIVA ===\n');
  
  /**
   * Copia directory e tutto il contenuto
   * @param {string} source - Directory sorgente
   * @param {string} dest - Directory destinazione
   */
  async function copyDirectory(source, dest) {
    try {
      // Crea directory destinazione
      await fs.promises.mkdir(dest, { recursive: true });
      
      // Leggi contenuto directory sorgente
      const entries = await fs.promises.readdir(source, { withFileTypes: true });
      
      let filesCopied = 0;
      let directoriesCreated = 0;
      
      for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          // Ricorsione per sottodirectory
          const result = await copyDirectory(sourcePath, destPath);
          filesCopied += result.filesCopied;
          directoriesCreated += result.directoriesCreated + 1;
          
        } else {
          // Copia file
          await fs.promises.copyFile(sourcePath, destPath);
          filesCopied++;
        }
      }
      
      return { filesCopied, directoriesCreated };
      
    } catch (err) {
      console.error('Errore:', err.message);
      throw err;
    }
  }
  
  // Crea struttura directory di test
  await fs.promises.mkdir('test-dir/sub1/sub2', { recursive: true });
  await fs.promises.writeFile('test-dir/file1.txt', 'File 1');
  await fs.promises.writeFile('test-dir/sub1/file2.txt', 'File 2');
  await fs.promises.writeFile('test-dir/sub1/sub2/file3.txt', 'File 3');
  
  // Copia directory
  const result = await copyDirectory('test-dir', 'test-dir-copy');
  
  console.log(`✓ Directory copiata:`);
  console.log(`  File copiati: ${result.filesCopied}`);
  console.log(`  Directory create: ${result.directoriesCreated}\n`);
  
}, 4000);

// ============================================
// ESEMPIO 7: COPIA CON RETRY
// ============================================
setTimeout(async () => {
  console.log('=== COPIA CON RETRY ===\n');
  
  /**
   * Copia file con retry automatico in caso di errore
   * @param {string} source - File sorgente
   * @param {string} dest - File destinazione
   * @param {number} maxRetries - Numero massimo tentativi
   * @param {number} delay - Delay tra tentativi in ms
   */
  async function copyFileWithRetry(source, dest, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await fs.promises.copyFile(source, dest);
        
        if (attempt > 1) {
          console.log(`  ✓ Copia riuscita al tentativo ${attempt}`);
        } else {
          console.log(`  ✓ Copia riuscita al primo tentativo`);
        }
        
        return { success: true, attempts: attempt };
        
      } catch (err) {
        if (attempt === maxRetries) {
          console.error(`  ❌ Copia fallita dopo ${maxRetries} tentativi`);
          return { success: false, error: err.message, attempts: attempt };
        }
        
        console.log(`  ⚠️  Tentativo ${attempt} fallito: ${err.message}`);
        console.log(`     Riprovo tra ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Test
  const retryResult = await copyFileWithRetry('source.txt', 'retry-copy.txt', 3, 500);
  console.log('');
  
}, 5000);

// ============================================
// ESEMPIO 8: CLASSE FILE COPIER
// ============================================
setTimeout(async () => {
  console.log('=== CLASSE FILE COPIER ===\n');
  
  /**
   * Classe avanzata per copia file
   */
  class FileCopier {
    /**
     * Copia semplice
     */
    static async copy(source, dest, options = {}) {
      const { overwrite = true } = options;
      
      const flags = overwrite ? 0 : fs.constants.COPYFILE_EXCL;
      
      await fs.promises.copyFile(source, dest, flags);
    }
    
    /**
     * Copia con verifica
     */
    static async copyWithVerification(source, dest, algorithm = 'sha256') {
      // Copia
      await this.copy(source, dest);
      
      // Verifica
      const sourceHash = await this.calculateHash(source, algorithm);
      const destHash = await this.calculateHash(dest, algorithm);
      
      if (sourceHash !== destHash) {
        await fs.promises.unlink(dest);
        throw new Error('Checksum verification failed');
      }
      
      return sourceHash;
    }
    
    /**
     * Calcola hash
     */
    static async calculateHash(filePath, algorithm = 'sha256') {
      return new Promise((resolve, reject) => {
        const hash = crypto.createHash(algorithm);
        const stream = fs.createReadStream(filePath);
        
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
      });
    }
    
    /**
     * Copia directory
     */
    static async copyDirectory(source, dest) {
      await fs.promises.mkdir(dest, { recursive: true });
      
      const entries = await fs.promises.readdir(source, { withFileTypes: true });
      
      for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          await this.copyDirectory(sourcePath, destPath);
        } else {
          await this.copy(sourcePath, destPath);
        }
      }
    }
  }
  
  // Test classe
  await FileCopier.copy('source.txt', 'class-copy.txt');
  console.log('✓ Copia semplice con classe');
  
  const hash = await FileCopier.copyWithVerification('source.txt', 'verified-class-copy.txt');
  console.log(`✓ Copia verificata con classe (hash: ${hash.substring(0, 16)}...)`);
  
  await FileCopier.copyDirectory('test-dir', 'test-dir-class-copy');
  console.log('✓ Directory copiata con classe\n');
  
}, 6000);

// ============================================
// PULIZIA FILE DI TEST
// ============================================
setTimeout(async () => {
  console.log('=== PULIZIA FILE DI TEST ===\n');
  
  // Lista file da eliminare
  const files = [
    'source.txt',
    'dest-sync.txt',
    'dest-callback.txt',
    'dest-promise.txt',
    'overwrite.txt',
    'verified-copy.txt',
    'large-file.bin',
    'large-copy.bin',
    'retry-copy.txt',
    'class-copy.txt',
    'verified-class-copy.txt'
  ];
  
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        await fs.promises.unlink(file);
        console.log(`✓ Eliminato: ${file}`);
      }
    } catch (err) {
      // Ignora errori
    }
  }
  
  // Elimina directory
  const dirs = [
    'test-dir',
    'test-dir-copy',
    'test-dir-class-copy'
  ];
  
  for (const dir of dirs) {
    try {
      await fs.promises.rm(dir, { recursive: true, force: true });
      console.log(`✓ Eliminata: ${dir}`);
    } catch (err) {
      // Ignora errori
    }
  }
  
  console.log('\n✅ Pulizia completata');
  
}, 7000);

console.log('\n⏳ Tutti gli esempi verranno eseguiti in sequenza...\n');
