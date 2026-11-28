/**
 * ESEMPIO 02.17 - Backup e Rotazione File
 * 
 * Questo esempio mostra come implementare sistemi di backup automatici
 * con rotazione dei file (log rotation, backup retention).
 * 
 * CASI D'USO:
 * - Backup automatici di database
 * - Log rotation
 * - Versioning di configurazioni
 * - Snapshot di dati
 */

const fs = require('fs');
const path = require('path');

// ============================================
// ESEMPIO 1: BACKUP SEMPLICE CON TIMESTAMP
// ============================================
console.log('=== BACKUP SEMPLICE CON TIMESTAMP ===\n');

/**
 * Crea backup di un file con timestamp
 * @param {string} filePath - File da backuppare
 * @returns {string} - Percorso del backup
 */
function createBackup(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File non trovato: ${filePath}`);
  }
  
  // Genera nome backup con timestamp
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);
  const dir = path.dirname(filePath);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${name}.backup.${timestamp}${ext}`;
  const backupPath = path.join(dir, backupName);
  
  // Copia file
  fs.copyFileSync(filePath, backupPath);
  
  return backupPath;
}

// Test
fs.writeFileSync('data.txt', 'Dati importanti v1');

const backup1 = createBackup('data.txt');
console.log(`✓ Backup creato: ${path.basename(backup1)}\n`);

// ============================================
// ESEMPIO 2: BACKUP NUMERATI (data.txt.1, data.txt.2, ecc.)
// ============================================
setTimeout(() => {
  console.log('=== BACKUP NUMERATI ===\n');
  
  /**
   * Crea backup numerato (es. file.txt.1, file.txt.2)
   * @param {string} filePath - File da backuppare
   * @param {number} maxBackups - Numero massimo di backup da mantenere
   */
  function createNumberedBackup(filePath, maxBackups = 5) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File non trovato: ${filePath}`);
    }
    
    // Rinomina backup esistenti (es. .1 diventa .2, .2 diventa .3, ecc.)
    for (let i = maxBackups - 1; i >= 1; i--) {
      const oldBackup = `${filePath}.${i}`;
      const newBackup = `${filePath}.${i + 1}`;
      
      if (fs.existsSync(oldBackup)) {
        if (i === maxBackups - 1) {
          // Elimina il backup più vecchio
          fs.unlinkSync(oldBackup);
        } else {
          // Rinomina
          fs.renameSync(oldBackup, newBackup);
        }
      }
    }
    
    // Crea nuovo backup .1
    fs.copyFileSync(filePath, `${filePath}.1`);
    
    return `${filePath}.1`;
  }
  
  // Test: crea più backup
  console.log('Creo 3 backup numerati...');
  
  setTimeout(() => {
    fs.writeFileSync('data.txt', 'Dati importanti v2');
    createNumberedBackup('data.txt', 5);
    console.log('✓ Backup 1 creato');
  }, 100);
  
  setTimeout(() => {
    fs.writeFileSync('data.txt', 'Dati importanti v3');
    createNumberedBackup('data.txt', 5);
    console.log('✓ Backup 2 creato');
  }, 200);
  
  setTimeout(() => {
    fs.writeFileSync('data.txt', 'Dati importanti v4');
    createNumberedBackup('data.txt', 5);
    console.log('✓ Backup 3 creato');
    
    // Mostra backup esistenti
    const backups = fs.readdirSync('.')
      .filter(f => f.startsWith('data.txt.'))
      .sort();
    
    console.log(`\nBackup trovati: ${backups.join(', ')}\n`);
  }, 300);
  
}, 500);

// ============================================
// ESEMPIO 3: LOG ROTATION
// ============================================
setTimeout(async () => {
  console.log('=== LOG ROTATION ===\n');
  
  /**
   * Classe per gestire log rotation
   */
  class LogRotator {
    constructor(logFile, options = {}) {
      this.logFile = logFile;
      this.maxSize = options.maxSize || 1024 * 1024; // 1MB default
      this.maxFiles = options.maxFiles || 5;
      
      this.dir = path.dirname(logFile);
      this.ext = path.extname(logFile);
      this.basename = path.basename(logFile, this.ext);
    }
    
    /**
     * Scrive nel log con rotazione automatica
     */
    async write(message) {
      // Controlla se serve rotazione
      await this.checkRotation();
      
      // Aggiungi timestamp
      const timestamp = new Date().toISOString();
      const line = `[${timestamp}] ${message}\n`;
      
      // Scrivi nel log
      await fs.promises.appendFile(this.logFile, line);
    }
    
    /**
     * Controlla se serve rotazione
     */
    async checkRotation() {
      try {
        const stats = await fs.promises.stat(this.logFile);
        
        if (stats.size >= this.maxSize) {
          await this.rotate();
        }
        
      } catch (err) {
        if (err.code === 'ENOENT') {
          // File non esiste, nessuna rotazione necessaria
        } else {
          throw err;
        }
      }
    }
    
    /**
     * Esegui rotazione
     */
    async rotate() {
      console.log('  ↻ Rotazione log in corso...');
      
      // Rinomina log esistenti
      for (let i = this.maxFiles - 1; i >= 1; i--) {
        const oldLog = path.join(this.dir, `${this.basename}.${i}${this.ext}`);
        const newLog = path.join(this.dir, `${this.basename}.${i + 1}${this.ext}`);
        
        try {
          if (fs.existsSync(oldLog)) {
            if (i === this.maxFiles - 1) {
              // Elimina il più vecchio
              await fs.promises.unlink(oldLog);
            } else {
              // Rinomina
              await fs.promises.rename(oldLog, newLog);
            }
          }
        } catch (err) {
          console.error(`Errore rotazione ${oldLog}:`, err.message);
        }
      }
      
      // Rinomina log corrente in .1
      try {
        await fs.promises.rename(
          this.logFile,
          path.join(this.dir, `${this.basename}.1${this.ext}`)
        );
      } catch (err) {
        console.error('Errore rinominando log corrente:', err.message);
      }
    }
    
    /**
     * Ottieni lista log
     */
    async getLogFiles() {
      const files = await fs.promises.readdir(this.dir);
      
      return files
        .filter(f => f.startsWith(this.basename) && f.endsWith(this.ext))
        .sort();
    }
  }
  
  // Test log rotation
  const logger = new LogRotator('app.log', { maxSize: 200, maxFiles: 3 });
  
  console.log('Scrivo log con rotazione automatica...');
  
  for (let i = 1; i <= 10; i++) {
    await logger.write(`Messaggio di log numero ${i}`);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  const logFiles = await logger.getLogFiles();
  console.log(`\n✓ Log files creati: ${logFiles.join(', ')}\n`);
  
}, 1500);

// ============================================
// ESEMPIO 4: BACKUP CON RETENTION POLICY
// ============================================
setTimeout(async () => {
  console.log('=== BACKUP CON RETENTION POLICY ===\n');
  
  /**
   * Classe per gestire backup con retention policy
   */
  class BackupManager {
    constructor(targetFile, backupDir, options = {}) {
      this.targetFile = targetFile;
      this.backupDir = backupDir;
      
      // Retention policy
      this.maxBackups = options.maxBackups || 10;
      this.maxAgeDays = options.maxAgeDays || 30;
      this.minBackups = options.minBackups || 3; // Minimo da mantenere sempre
      
      // Crea directory backup se non esiste
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }
    }
    
    /**
     * Crea nuovo backup
     */
    async createBackup() {
      if (!fs.existsSync(this.targetFile)) {
        throw new Error(`File non trovato: ${this.targetFile}`);
      }
      
      // Genera nome backup
      const timestamp = Date.now();
      const ext = path.extname(this.targetFile);
      const name = path.basename(this.targetFile, ext);
      const backupName = `${name}.${timestamp}${ext}`;
      const backupPath = path.join(this.backupDir, backupName);
      
      // Copia file
      await fs.promises.copyFile(this.targetFile, backupPath);
      
      console.log(`  ✓ Backup creato: ${backupName}`);
      
      // Applica retention policy
      await this.applyRetentionPolicy();
      
      return backupPath;
    }
    
    /**
     * Applica retention policy
     */
    async applyRetentionPolicy() {
      const backups = await this.getBackups();
      
      // Ordina per data (più recente prima)
      backups.sort((a, b) => b.timestamp - a.timestamp);
      
      const now = Date.now();
      const maxAgeMs = this.maxAgeDays * 24 * 60 * 60 * 1000;
      
      let deleted = 0;
      
      for (let i = 0; i < backups.length; i++) {
        const backup = backups[i];
        const age = now - backup.timestamp;
        
        // Mantieni sempre i primi minBackups
        if (i < this.minBackups) {
          continue;
        }
        
        // Elimina se supera maxBackups o maxAge
        if (i >= this.maxBackups || age > maxAgeMs) {
          await fs.promises.unlink(backup.path);
          console.log(`  🗑️  Eliminato backup vecchio: ${backup.name}`);
          deleted++;
        }
      }
      
      if (deleted > 0) {
        console.log(`  ℹ️  Eliminati ${deleted} backup secondo retention policy`);
      }
    }
    
    /**
     * Ottieni lista backup
     */
    async getBackups() {
      const files = await fs.promises.readdir(this.backupDir);
      
      const ext = path.extname(this.targetFile);
      const name = path.basename(this.targetFile, ext);
      const pattern = new RegExp(`^${name}\\.(\\d+)${ext.replace('.', '\\.')}$`);
      
      const backups = [];
      
      for (const file of files) {
        const match = file.match(pattern);
        
        if (match) {
          const timestamp = parseInt(match[1]);
          const filePath = path.join(this.backupDir, file);
          
          backups.push({
            name: file,
            path: filePath,
            timestamp: timestamp,
            date: new Date(timestamp)
          });
        }
      }
      
      return backups;
    }
    
    /**
     * Ripristina da backup
     */
    async restore(backupName) {
      const backupPath = path.join(this.backupDir, backupName);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup non trovato: ${backupName}`);
      }
      
      // Crea backup del file corrente prima di ripristinare
      if (fs.existsSync(this.targetFile)) {
        await this.createBackup();
      }
      
      // Ripristina
      await fs.promises.copyFile(backupPath, this.targetFile);
      
      console.log(`✓ Ripristinato da: ${backupName}`);
    }
  }
  
  // Test BackupManager
  const backupMgr = new BackupManager('data.txt', 'backups', {
    maxBackups: 5,
    maxAgeDays: 7,
    minBackups: 2
  });
  
  console.log('Creo backup con retention policy...\n');
  
  // Crea alcuni backup
  for (let i = 1; i <= 7; i++) {
    fs.writeFileSync('data.txt', `Versione ${i}`);
    await backupMgr.createBackup();
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Mostra backup rimasti
  const remainingBackups = await backupMgr.getBackups();
  console.log(`\n✓ Backup mantenuti: ${remainingBackups.length}\n`);
  
}, 3000);

// ============================================
// ESEMPIO 5: BACKUP INCREMENTALE
// ============================================
setTimeout(async () => {
  console.log('=== BACKUP INCREMENTALE ===\n');
  
  /**
   * Backup incrementale (backuppa solo se cambiato)
   */
  class IncrementalBackup {
    constructor(targetFile, backupDir) {
      this.targetFile = targetFile;
      this.backupDir = backupDir;
      this.metadataFile = path.join(backupDir, '.metadata.json');
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
    }
    
    /**
     * Crea backup solo se file cambiato
     */
    async backup() {
      if (!fs.existsSync(this.targetFile)) {
        throw new Error(`File non trovato: ${this.targetFile}`);
      }
      
      // Calcola checksum file corrente
      const currentChecksum = await this.calculateChecksum(this.targetFile);
      
      // Leggi metadata backup precedente
      const lastChecksum = await this.getLastChecksum();
      
      // Controlla se file cambiato
      if (currentChecksum === lastChecksum) {
        console.log('  ℹ️  File non cambiato, skip backup');
        return null;
      }
      
      // File cambiato, crea backup
      const timestamp = Date.now();
      const ext = path.extname(this.targetFile);
      const name = path.basename(this.targetFile, ext);
      const backupName = `${name}.${timestamp}${ext}`;
      const backupPath = path.join(this.backupDir, backupName);
      
      await fs.promises.copyFile(this.targetFile, backupPath);
      
      // Salva metadata
      await this.saveMetadata({
        timestamp: timestamp,
        checksum: currentChecksum,
        backupName: backupName
      });
      
      console.log(`  ✓ Backup incrementale creato: ${backupName}`);
      console.log(`     Checksum: ${currentChecksum.substring(0, 16)}...`);
      
      return backupPath;
    }
    
    /**
     * Calcola checksum
     */
    async calculateChecksum(filePath) {
      const crypto = require('crypto');
      
      return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
      });
    }
    
    /**
     * Ottieni checksum ultimo backup
     */
    async getLastChecksum() {
      try {
        const data = await fs.promises.readFile(this.metadataFile, 'utf8');
        const metadata = JSON.parse(data);
        return metadata.checksum;
      } catch {
        return null;
      }
    }
    
    /**
     * Salva metadata
     */
    async saveMetadata(metadata) {
      await fs.promises.writeFile(
        this.metadataFile,
        JSON.stringify(metadata, null, 2)
      );
    }
  }
  
  // Test backup incrementale
  const incrementalBackup = new IncrementalBackup('data.txt', 'incremental-backups');
  
  console.log('Test backup incrementale:\n');
  
  // Primo backup (dovrebbe creare)
  fs.writeFileSync('data.txt', 'Contenuto originale');
  await incrementalBackup.backup();
  
  // Secondo backup senza modifiche (dovrebbe saltare)
  await new Promise(resolve => setTimeout(resolve, 100));
  await incrementalBackup.backup();
  
  // Terzo backup con modifiche (dovrebbe creare)
  await new Promise(resolve => setTimeout(resolve, 100));
  fs.writeFileSync('data.txt', 'Contenuto modificato');
  await incrementalBackup.backup();
  
  console.log('');
  
}, 5000);

// ============================================
// PULIZIA FILE DI TEST
// ============================================
setTimeout(async () => {
  console.log('=== PULIZIA FILE DI TEST ===\n');
  
  // Elimina file
  const files = ['data.txt'];
  
  for (let i = 1; i <= 5; i++) {
    files.push(`data.txt.${i}`);
  }
  
  // Trova tutti i backup con timestamp
  const allFiles = fs.readdirSync('.');
  const backupFiles = allFiles.filter(f => f.match(/^data\.txt\.backup\./));
  files.push(...backupFiles);
  
  // Log files
  const logFiles = allFiles.filter(f => f.startsWith('app.log'));
  files.push(...logFiles);
  
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
  const dirs = ['backups', 'incremental-backups'];
  
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
