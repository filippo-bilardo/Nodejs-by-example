const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

/**
 * FileWatcher - Monitora directory per cambiamenti nei file
 * 
 * Eventi emessi:
 * - 'file-created': quando un file viene creato
 * - 'file-modified': quando un file viene modificato
 * - 'file-deleted': quando un file viene eliminato
 * - 'error': quando si verifica un errore
 */
class FileWatcher extends EventEmitter {
  constructor(directory) {
    super();
    this.directory = directory;
    this.files = new Map(); // filename -> { size, mtime }
    this.watcher = null;
    this.debounceTimers = new Map(); // debouncing eventi multipli
  }
  
  /**
   * Inizia il monitoraggio della directory
   */
  async start() {
    try {
      // Crea directory se non esiste
      if (!fs.existsSync(this.directory)) {
        fs.mkdirSync(this.directory, { recursive: true });
      }
      
      // Scansione iniziale
      await this.scanDirectory();
      
      // Avvia watcher
      this.watcher = fs.watch(this.directory, (eventType, filename) => {
        if (filename) {
          this.handleFileEvent(filename);
        }
      });
      
      this.emit('ready', { directory: this.directory });
      
    } catch (err) {
      this.emit('error', err);
    }
  }
  
  /**
   * Scansione iniziale della directory
   */
  async scanDirectory() {
    try {
      const files = fs.readdirSync(this.directory);
      
      for (const filename of files) {
        const filepath = path.join(this.directory, filename);
        const stats = fs.statSync(filepath);
        
        if (stats.isFile()) {
          this.files.set(filename, {
            size: stats.size,
            mtime: stats.mtimeMs
          });
        }
      }
    } catch (err) {
      this.emit('error', err);
    }
  }
  
  /**
   * Gestisce eventi filesystem con debouncing
   */
  handleFileEvent(filename) {
    // Debounce: filesystem può emettere più eventi per singola modifica
    if (this.debounceTimers.has(filename)) {
      clearTimeout(this.debounceTimers.get(filename));
    }
    
    const timer = setTimeout(() => {
      this.debounceTimers.delete(filename);
      this.processFileChange(filename);
    }, 100); // 100ms debounce
    
    this.debounceTimers.set(filename, timer);
  }
  
  /**
   * Processa effettivamente il cambiamento
   */
  processFileChange(filename) {
    const filepath = path.join(this.directory, filename);
    
    try {
      // Controlla se file esiste
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        
        if (!stats.isFile()) {
          return; // Ignora directory
        }
        
        const cached = this.files.get(filename);
        
        if (!cached) {
          // File creato
          this.files.set(filename, {
            size: stats.size,
            mtime: stats.mtimeMs
          });
          
          this.emit('file-created', {
            filename,
            path: filepath,
            size: stats.size
          });
          
        } else {
          // File modificato
          this.files.set(filename, {
            size: stats.size,
            mtime: stats.mtimeMs
          });
          
          this.emit('file-modified', {
            filename,
            path: filepath,
            oldSize: cached.size,
            newSize: stats.size,
            sizeDiff: stats.size - cached.size
          });
        }
      } else {
        // File eliminato
        if (this.files.has(filename)) {
          const cached = this.files.get(filename);
          this.files.delete(filename);
          
          this.emit('file-deleted', {
            filename,
            path: filepath,
            previousSize: cached.size
          });
        }
      }
    } catch (err) {
      this.emit('error', {
        message: `Error processing ${filename}`,
        error: err
      });
    }
  }
  
  /**
   * Ferma il monitoraggio
   */
  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    
    // Pulisci debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    
    this.emit('stopped');
  }
  
  /**
   * Ritorna lista file monitorati
   */
  getMonitoredFiles() {
    return Array.from(this.files.keys());
  }
}

// ============================================
// ESEMPIO D'USO
// ============================================

const watchDir = path.join(__dirname, 'test-dir');
const watcher = new FileWatcher(watchDir);

// Listener per file creati
watcher.on('file-created', ({ filename, size }) => {
  console.log(`📄 File created: ${filename} (${size} bytes)`);
});

// Listener per file modificati
watcher.on('file-modified', ({ filename, sizeDiff }) => {
  const sign = sizeDiff >= 0 ? '+' : '';
  console.log(`📝 File modified: ${filename} (${sign}${sizeDiff} bytes)`);
});

// Listener per file eliminati
watcher.on('file-deleted', ({ filename, previousSize }) => {
  console.log(`🗑️  File deleted: ${filename} (was ${previousSize} bytes)`);
});

// Listener errori
watcher.on('error', (err) => {
  console.error('❌ Error:', err.message || err);
});

// Listener ready
watcher.on('ready', ({ directory }) => {
  console.log(`📁 Watching directory: ${directory}`);
  console.log('✅ Ready to monitor changes');
  console.log('');
  console.log('Try creating/modifying/deleting files in test-dir/');
  console.log('Example: echo "test" > test-dir/file1.txt');
  console.log('');
});

// Listener stop
watcher.on('stopped', () => {
  console.log('⏹️  Watcher stopped');
});

// Avvia watcher
watcher.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  watcher.stop();
  process.exit(0);
});

// ============================================
// DEMO AUTOMATICA (opzionale)
// ============================================

// Decommenta per demo automatica
/*
setTimeout(async () => {
  console.log('\n=== AUTO DEMO START ===\n');
  
  const testFile = path.join(watchDir, 'demo.txt');
  
  // Create file
  console.log('Creating file...');
  fs.writeFileSync(testFile, 'Hello World\n');
  
  await delay(500);
  
  // Modify file
  console.log('Modifying file...');
  fs.appendFileSync(testFile, 'Second line\n');
  
  await delay(500);
  
  // Delete file
  console.log('Deleting file...');
  fs.unlinkSync(testFile);
  
  console.log('\n=== AUTO DEMO END ===\n');
}, 2000);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
*/
