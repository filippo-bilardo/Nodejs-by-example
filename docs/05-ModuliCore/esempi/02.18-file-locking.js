/**
 * ESEMPIO 02.18 - File Locking (Gestione Accesso Concorrente)
 * 
 * Questo esempio mostra come implementare meccanismi di locking per evitare
 * conflitti quando più processi/thread accedono contemporaneamente allo stesso file.
 * 
 * METODI:
 * 1. Lock file (file .lock separato)
 * 2. Exclusive file open (flag O_EXCL)
 * 3. Timeout e retry
 * 4. Advisory locking (fcntl su Linux)
 * 
 * USI COMUNI:
 * - Database file-based
 * - Configuration files condivisi
 * - File temporanei
 * - PID files per daemon
 */

const fs = require('fs');
const path = require('path');

// ============================================
// ESEMPIO 1: SIMPLE LOCK FILE
// ============================================
console.log('=== SIMPLE LOCK FILE ===\n');

/**
 * Verifica se un file è lockato
 * @param {string} filePath - File da controllare
 */
function isLocked(filePath) {
  const lockFile = `${filePath}.lock`;
  return fs.existsSync(lockFile);
}

/**
 * Acquisisce lock su un file
 * @param {string} filePath - File da lockare
 * @param {number} timeout - Timeout in ms
 */
async function acquireLock(filePath, timeout = 5000) {
  const lockFile = `${filePath}.lock`;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (!fs.existsSync(lockFile)) {
      // Crea lock file
      try {
        // Usa flag 'wx' per fallire se file esiste (atomic)
        fs.writeFileSync(lockFile, process.pid.toString(), { flag: 'wx' });
        
        console.log(`✓ Lock acquisito su ${path.basename(filePath)}`);
        return true;
        
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
        // Lock file creato da altro processo, riprova
      }
    }
    
    // Attendi prima di riprovare
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`❌ Timeout acquisizione lock su ${path.basename(filePath)}`);
  return false;
}

/**
 * Rilascia lock su un file
 * @param {string} filePath - File da unlockare
 */
function releaseLock(filePath) {
  const lockFile = `${filePath}.lock`;
  
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
    console.log(`✓ Lock rilasciato su ${path.basename(filePath)}`);
  }
}

// Test
setTimeout(async () => {
  // Crea file di test
  fs.writeFileSync('shared-file.txt', 'Dati condivisi');
  
  // Acquisisce lock
  const locked = await acquireLock('shared-file.txt');
  
  if (locked) {
    // Simula lavoro
    console.log('  → Lavoro in corso sul file...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Rilascia lock
    releaseLock('shared-file.txt');
  }
  
  console.log('');
  
}, 500);

// ============================================
// ESEMPIO 2: LOCK CON INFORMAZIONI PROCESSO
// ============================================
setTimeout(async () => {
  console.log('=== LOCK CON INFORMAZIONI PROCESSO ===\n');
  
  /**
   * Acquisisce lock con informazioni processo
   */
  async function acquireLockWithInfo(filePath, timeout = 5000) {
    const lockFile = `${filePath}.lock`;
    const startTime = Date.now();
    
    const lockInfo = {
      pid: process.pid,
      timestamp: Date.now(),
      hostname: require('os').hostname(),
      user: process.env.USER || process.env.USERNAME
    };
    
    while (Date.now() - startTime < timeout) {
      if (!fs.existsSync(lockFile)) {
        try {
          fs.writeFileSync(lockFile, JSON.stringify(lockInfo, null, 2), { flag: 'wx' });
          
          console.log('✓ Lock acquisito con info:');
          console.log(`  PID: ${lockInfo.pid}`);
          console.log(`  User: ${lockInfo.user}`);
          console.log(`  Host: ${lockInfo.hostname}`);
          
          return true;
          
        } catch (err) {
          if (err.code !== 'EEXIST') {
            throw err;
          }
        }
      } else {
        // Leggi info sul processo che ha il lock
        try {
          const existingInfo = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
          console.log(`⏳ In attesa... Lock detenuto da PID ${existingInfo.pid}`);
        } catch {}
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }
  
  // Test
  fs.writeFileSync('shared-file2.txt', 'Dati condivisi 2');
  
  const locked = await acquireLockWithInfo('shared-file2.txt', 3000);
  
  if (locked) {
    await new Promise(resolve => setTimeout(resolve, 500));
    releaseLock('shared-file2.txt');
  }
  
  console.log('');
  
}, 2000);

// ============================================
// ESEMPIO 3: STALE LOCK DETECTION
// ============================================
setTimeout(async () => {
  console.log('=== STALE LOCK DETECTION ===\n');
  
  /**
   * Controlla se un lock è "stale" (processo morto)
   */
  function isLockStale(lockFile, maxAge = 60000) {
    try {
      // Leggi info lock
      const lockInfo = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
      
      // Controlla età
      const age = Date.now() - lockInfo.timestamp;
      if (age > maxAge) {
        console.log(`⚠️  Lock stale: età ${Math.floor(age / 1000)}s`);
        return true;
      }
      
      // TODO: Su Unix/Linux, si potrebbe controllare se processo esiste:
      // try { process.kill(lockInfo.pid, 0); return false; } catch { return true; }
      
      return false;
      
    } catch (err) {
      // Errore leggendo lock, consideralo stale
      return true;
    }
  }
  
  /**
   * Acquisisce lock con gestione stale lock
   */
  async function acquireLockWithStaleCheck(filePath, timeout = 5000) {
    const lockFile = `${filePath}.lock`;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (!fs.existsSync(lockFile)) {
        // Nessun lock, acquisisci
        try {
          const lockInfo = { pid: process.pid, timestamp: Date.now() };
          fs.writeFileSync(lockFile, JSON.stringify(lockInfo), { flag: 'wx' });
          console.log('✓ Lock acquisito');
          return true;
        } catch (err) {
          if (err.code !== 'EEXIST') throw err;
        }
        
      } else {
        // Lock esiste, controlla se stale
        if (isLockStale(lockFile, 5000)) {
          console.log('  → Rimuovo lock stale...');
          try {
            fs.unlinkSync(lockFile);
            continue; // Riprova acquisizione
          } catch (err) {
            // Altro processo ha rimosso il lock, riprova
          }
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }
  
  // Test: crea lock "stale"
  const staleLockFile = 'stale-file.txt.lock';
  const oldLockInfo = {
    pid: 99999,
    timestamp: Date.now() - 10000 // 10 secondi fa
  };
  fs.writeFileSync(staleLockFile, JSON.stringify(oldLockInfo));
  
  console.log('ℹ️  Creato lock stale per test');
  
  // Prova ad acquisire (dovrebbe rimuovere lock stale)
  const locked = await acquireLockWithStaleCheck('stale-file.txt', 3000);
  
  if (locked) {
    await new Promise(resolve => setTimeout(resolve, 500));
    releaseLock('stale-file.txt');
  }
  
  console.log('');
  
}, 4000);

// ============================================
// ESEMPIO 4: CLASSE FILE LOCK
// ============================================
setTimeout(async () => {
  console.log('=== CLASSE FILE LOCK ===\n');
  
  /**
   * Classe per gestire file locking
   */
  class FileLock {
    constructor(filePath, options = {}) {
      this.filePath = filePath;
      this.lockFile = `${filePath}.lock`;
      this.options = {
        timeout: 5000,
        retryDelay: 100,
        staleTimeout: 60000,
        ...options
      };
      this.locked = false;
    }
    
    /**
     * Acquisisce lock
     */
    async acquire() {
      if (this.locked) {
        throw new Error('Lock già acquisito');
      }
      
      const startTime = Date.now();
      
      while (Date.now() - startTime < this.options.timeout) {
        // Controlla se lock esiste
        if (!fs.existsSync(this.lockFile)) {
          // Tenta acquisizione
          if (await this.tryAcquire()) {
            this.locked = true;
            return true;
          }
          
        } else {
          // Controlla se stale
          if (this.isStale()) {
            await this.forceRemove();
            continue;
          }
        }
        
        // Attendi prima di riprovare
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
      }
      
      throw new Error(`Timeout acquisizione lock: ${this.filePath}`);
    }
    
    /**
     * Tenta acquisizione atomica
     */
    async tryAcquire() {
      try {
        const lockInfo = {
          pid: process.pid,
          timestamp: Date.now(),
          file: this.filePath
        };
        
        fs.writeFileSync(this.lockFile, JSON.stringify(lockInfo, null, 2), { flag: 'wx' });
        return true;
        
      } catch (err) {
        if (err.code === 'EEXIST') {
          return false;
        }
        throw err;
      }
    }
    
    /**
     * Controlla se lock è stale
     */
    isStale() {
      try {
        const lockInfo = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'));
        const age = Date.now() - lockInfo.timestamp;
        
        return age > this.options.staleTimeout;
        
      } catch {
        return true;
      }
    }
    
    /**
     * Rimuovi lock forzatamente
     */
    async forceRemove() {
      try {
        fs.unlinkSync(this.lockFile);
      } catch (err) {
        // Ignorora se non esiste
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
    
    /**
     * Rilascia lock
     */
    async release() {
      if (!this.locked) {
        throw new Error('Lock non acquisito');
      }
      
      await this.forceRemove();
      this.locked = false;
    }
    
    /**
     * Esegui funzione con lock
     */
    static async withLock(filePath, fn, options) {
      const lock = new FileLock(filePath, options);
      
      try {
        await lock.acquire();
        return await fn();
        
      } finally {
        if (lock.locked) {
          await lock.release();
        }
      }
    }
  }
  
  // Test classe
  console.log('Test FileLock class:\n');
  
  // Metodo 1: Manuale
  const lock1 = new FileLock('test-lock.txt', { timeout: 2000 });
  
  try {
    await lock1.acquire();
    console.log('✓ Lock acquisito manualmente');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await lock1.release();
    console.log('✓ Lock rilasciato manualmente\n');
    
  } catch (err) {
    console.error('Errore:', err.message);
  }
  
  // Metodo 2: Con callback (raccomandato)
  await FileLock.withLock('test-lock.txt', async () => {
    console.log('✓ Lock acquisito con withLock()');
    console.log('  → Eseguo operazioni protette...');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('  → Operazioni completate');
  });
  
  console.log('✓ Lock rilasciato automaticamente\n');
  
}, 6000);

// ============================================
// ESEMPIO 5: SIMULAZIONE ACCESSO CONCORRENTE
// ============================================
setTimeout(async () => {
  console.log('=== SIMULAZIONE ACCESSO CONCORRENTE ===\n');
  
  fs.writeFileSync('counter.txt', '0');
  
  /**
   * Incrementa contatore in modo thread-safe
   */
  async function incrementCounter(workerId) {
    await FileLock.withLock('counter.txt', async () => {
      // Leggi valore
      const value = parseInt(fs.readFileSync('counter.txt', 'utf8'));
      
      console.log(`Worker ${workerId}: letto valore ${value}`);
      
      // Simula elaborazione
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Scrivi nuovo valore
      const newValue = value + 1;
      fs.writeFileSync('counter.txt', newValue.toString());
      
      console.log(`Worker ${workerId}: scritto valore ${newValue}`);
    }, { timeout: 3000 });
  }
  
  /**
   * Classe FileLock (copia da esempio 4)
   */
  class FileLock {
    constructor(filePath, options = {}) {
      this.filePath = filePath;
      this.lockFile = `${filePath}.lock`;
      this.options = {
        timeout: 5000,
        retryDelay: 100,
        staleTimeout: 60000,
        ...options
      };
      this.locked = false;
    }
    
    async acquire() {
      if (this.locked) throw new Error('Lock già acquisito');
      
      const startTime = Date.now();
      
      while (Date.now() - startTime < this.options.timeout) {
        if (!fs.existsSync(this.lockFile)) {
          if (await this.tryAcquire()) {
            this.locked = true;
            return true;
          }
        } else if (this.isStale()) {
          await this.forceRemove();
          continue;
        }
        
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
      }
      
      throw new Error(`Timeout acquisizione lock: ${this.filePath}`);
    }
    
    async tryAcquire() {
      try {
        const lockInfo = { pid: process.pid, timestamp: Date.now(), file: this.filePath };
        fs.writeFileSync(this.lockFile, JSON.stringify(lockInfo, null, 2), { flag: 'wx' });
        return true;
      } catch (err) {
        if (err.code === 'EEXIST') return false;
        throw err;
      }
    }
    
    isStale() {
      try {
        const lockInfo = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'));
        return (Date.now() - lockInfo.timestamp) > this.options.staleTimeout;
      } catch {
        return true;
      }
    }
    
    async forceRemove() {
      try {
        fs.unlinkSync(this.lockFile);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
    }
    
    async release() {
      if (!this.locked) throw new Error('Lock non acquisito');
      await this.forceRemove();
      this.locked = false;
    }
    
    static async withLock(filePath, fn, options) {
      const lock = new FileLock(filePath, options);
      try {
        await lock.acquire();
        return await fn();
      } finally {
        if (lock.locked) await lock.release();
      }
    }
  }
  
  console.log('Avvio 3 worker concorrenti...\n');
  
  // Avvia 3 worker in parallelo
  await Promise.all([
    incrementCounter(1),
    incrementCounter(2),
    incrementCounter(3)
  ]);
  
  const finalValue = fs.readFileSync('counter.txt', 'utf8');
  console.log(`\n✓ Valore finale: ${finalValue} (atteso: 3)\n`);
  
}, 8500);

// ============================================
// ESEMPIO 6: READ-WRITE LOCK
// ============================================
setTimeout(async () => {
  console.log('=== READ-WRITE LOCK ===\n');
  
  /**
   * Lock con distinzione lettura/scrittura
   * - Multiple letture simultanee OK
   * - Scrittura esclusiva
   */
  class ReadWriteLock {
    constructor(filePath) {
      this.filePath = filePath;
      this.readLockDir = `${filePath}.rlocks`;
      this.writeLockFile = `${filePath}.wlock`;
      
      // Crea directory per read locks
      if (!fs.existsSync(this.readLockDir)) {
        fs.mkdirSync(this.readLockDir, { recursive: true });
      }
    }
    
    /**
     * Acquisisce read lock
     */
    async acquireRead() {
      // Attendo che non ci siano write lock
      while (fs.existsSync(this.writeLockFile)) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Crea read lock
      const readLockFile = path.join(this.readLockDir, `${process.pid}.lock`);
      fs.writeFileSync(readLockFile, Date.now().toString());
      
      return readLockFile;
    }
    
    /**
     * Rilascia read lock
     */
    async releaseRead(lockFile) {
      try {
        fs.unlinkSync(lockFile);
      } catch {}
    }
    
    /**
     * Acquisisce write lock
     */
    async acquireWrite() {
      // Attendo che non ci siano altri write lock
      while (fs.existsSync(this.writeLockFile)) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Crea write lock
      fs.writeFileSync(this.writeLockFile, Date.now().toString(), { flag: 'wx' });
      
      // Attendo che finiscano tutte le letture
      while (true) {
        const readLocks = fs.readdirSync(this.readLockDir);
        
        if (readLocks.length === 0) {
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    /**
     * Rilascia write lock
     */
    async releaseWrite() {
      try {
        fs.unlinkSync(this.writeLockFile);
      } catch {}
    }
    
    /**
     * Esegui con read lock
     */
    async withRead(fn) {
      const lockFile = await this.acquireRead();
      try {
        return await fn();
      } finally {
        await this.releaseRead(lockFile);
      }
    }
    
    /**
     * Esegui con write lock
     */
    async withWrite(fn) {
      await this.acquireWrite();
      try {
        return await fn();
      } finally {
        await this.releaseWrite();
      }
    }
  }
  
  // Test
  fs.writeFileSync('rw-file.txt', 'Dati iniziali');
  const rwLock = new ReadWriteLock('rw-file.txt');
  
  console.log('Test read-write lock:\n');
  
  // Due letture simultanee (OK)
  await Promise.all([
    rwLock.withRead(async () => {
      console.log('Reader 1: leggo...');
      const data = fs.readFileSync('rw-file.txt', 'utf8');
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log(`Reader 1: letto "${data}"`);
    }),
    
    rwLock.withRead(async () => {
      console.log('Reader 2: leggo...');
      const data = fs.readFileSync('rw-file.txt', 'utf8');
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log(`Reader 2: letto "${data}"`);
    })
  ]);
  
  // Scrittura esclusiva
  await rwLock.withWrite(async () => {
    console.log('\nWriter: scrivo...');
    fs.writeFileSync('rw-file.txt', 'Dati modificati');
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Writer: scrittura completata');
  });
  
  console.log('');
  
}, 12000);

// ============================================
// PULIZIA FILE DI TEST
// ============================================
setTimeout(async () => {
  console.log('=== PULIZIA FILE DI TEST ===\n');
  
  const files = [
    'shared-file.txt',
    'shared-file.txt.lock',
    'shared-file2.txt',
    'shared-file2.txt.lock',
    'stale-file.txt',
    'stale-file.txt.lock',
    'test-lock.txt',
    'test-lock.txt.lock',
    'counter.txt',
    'counter.txt.lock',
    'rw-file.txt',
    'rw-file.txt.wlock'
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
  try {
    await fs.promises.rm('rw-file.txt.rlocks', { recursive: true, force: true });
    console.log('✓ Eliminata: rw-file.txt.rlocks');
  } catch {}
  
  console.log('\n✅ Pulizia completata');
  
}, 14000);

console.log('\n⏳ Tutti gli esempi verranno eseguiti in sequenza...\n');
console.log('ℹ️  NOTA: Il file locking è cruciale per evitare race condition\n');
console.log('   in applicazioni multi-processo o quando file sono condivisi\n');
console.log('   tra più applicazioni.\n');
