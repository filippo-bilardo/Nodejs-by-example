/**
 * ESEMPIO 02.15 - File Watcher (Monitoraggio Cambiamenti)
 * 
 * Il metodo fs.watch() e fs.watchFile() permettono di monitorare cambiamenti
 * a file e directory in tempo reale.
 * 
 * DIFFERENZE:
 * - fs.watch(): Più efficiente, usa eventi del sistema operativo
 * - fs.watchFile(): Usa polling, meno efficiente ma più compatibile
 * 
 * USI COMUNI:
 * - Hot reload in development
 * - Sincronizzazione file
 * - Monitoraggio log
 * - Build automation
 */

const fs = require('fs');
const path = require('path');

// ============================================
// ESEMPIO 1: fs.watch() BASE
// ============================================
console.log('=== fs.watch() BASE ===\n');

// Crea file da monitorare
fs.writeFileSync('watched-file.txt', 'Contenuto iniziale\n');

console.log('📁 Monitoraggio started su "watched-file.txt"');
console.log('ℹ️  Modificherò il file tra 2 secondi...\n');

// Avvia monitoraggio
const watcher1 = fs.watch('watched-file.txt', (eventType, filename) => {
  console.log(`🔔 Evento: ${eventType}`);
  
  if (filename) {
    console.log(`   File: ${filename}`);
  }
  
  // Leggi il nuovo contenuto
  try {
    const content = fs.readFileSync('watched-file.txt', 'utf8');
    console.log(`   Nuovo contenuto: ${content.trim()}\n`);
  } catch (err) {
    console.log(`   ⚠️  File non accessibile\n`);
  }
});

// Modifica il file dopo 2 secondi
setTimeout(() => {
  fs.writeFileSync('watched-file.txt', 'Contenuto modificato\n');
}, 2000);

// Modifica ancora dopo 4 secondi
setTimeout(() => {
  fs.appendFileSync('watched-file.txt', 'Riga aggiuntiva\n');
}, 4000);

// Chiudi watcher dopo 6 secondi
setTimeout(() => {
  watcher1.close();
  console.log('✓ Monitoraggio chiuso\n');
}, 6000);

// ============================================
// ESEMPIO 2: fs.watch() SU DIRECTORY
// ============================================
setTimeout(async () => {
  console.log('=== fs.watch() SU DIRECTORY ===\n');
  
  // Crea directory da monitorare
  await fs.promises.mkdir('watched-dir', { recursive: true });
  
  console.log('📁 Monitoraggio directory "watched-dir"');
  console.log('ℹ️  Creerò e modificherò file nella directory...\n');
  
  const watcher2 = fs.watch('watched-dir', (eventType, filename) => {
    console.log(`🔔 Evento directory: ${eventType}`);
    
    if (filename) {
      console.log(`   File: ${filename}\n`);
    }
  });
  
  // Crea file nella directory
  setTimeout(() => {
    fs.writeFileSync('watched-dir/file1.txt', 'File 1');
  }, 1000);
  
  setTimeout(() => {
    fs.writeFileSync('watched-dir/file2.txt', 'File 2');
  }, 2000);
  
  setTimeout(() => {
    fs.unlinkSync('watched-dir/file1.txt');
  }, 3000);
  
  // Chiudi watcher
  setTimeout(() => {
    watcher2.close();
    console.log('✓ Monitoraggio directory chiuso\n');
  }, 4000);
  
}, 7000);

// ============================================
// ESEMPIO 3: fs.watchFile() CON POLLING
// ============================================
setTimeout(() => {
  console.log('=== fs.watchFile() CON POLLING ===\n');
  
  // Crea file da monitorare
  fs.writeFileSync('polled-file.txt', 'Iniziale');
  
  console.log('📊 Polling avviato su "polled-file.txt" (intervallo: 1000ms)\n');
  
  // watchFile usa polling (controlla periodicamente)
  fs.watchFile('polled-file.txt', { interval: 1000 }, (curr, prev) => {
    console.log('🔔 File cambiato (polling):');
    console.log(`   Dimensione precedente: ${prev.size} byte`);
    console.log(`   Dimensione corrente: ${curr.size} byte`);
    console.log(`   Modificato: ${curr.mtime.toISOString()}\n`);
  });
  
  // Modifica file
  setTimeout(() => {
    fs.writeFileSync('polled-file.txt', 'Contenuto più lungo ora');
  }, 2000);
  
  setTimeout(() => {
    fs.appendFileSync('polled-file.txt', '\nAltra riga');
  }, 4000);
  
  // Ferma polling
  setTimeout(() => {
    fs.unwatchFile('polled-file.txt');
    console.log('✓ Polling fermato\n');
  }, 6000);
  
}, 12000);

// ============================================
// ESEMPIO 4: WATCHER CON GESTIONE ERRORI
// ============================================
setTimeout(() => {
  console.log('=== WATCHER CON GESTIONE ERRORI ===\n');
  
  fs.writeFileSync('error-test.txt', 'Test');
  
  try {
    const watcher3 = fs.watch('error-test.txt', (eventType, filename) => {
      console.log(`🔔 Evento: ${eventType} su ${filename}`);
    });
    
    // Gestisci errori
    watcher3.on('error', (err) => {
      console.error('❌ Errore watcher:', err.message);
    });
    
    watcher3.on('close', () => {
      console.log('ℹ️  Watcher chiuso\n');
    });
    
    console.log('✓ Watcher avviato con gestione errori');
    
    // Elimina il file mentre è monitorato
    setTimeout(() => {
      console.log('ℹ️  Elimino il file monitorato...');
      fs.unlinkSync('error-test.txt');
    }, 2000);
    
    // Chiudi watcher
    setTimeout(() => {
      watcher3.close();
    }, 4000);
    
  } catch (err) {
    console.error('❌ Errore creazione watcher:', err.message);
  }
  
}, 19000);

// ============================================
// ESEMPIO 5: DEBOUNCE DI EVENTI
// ============================================
setTimeout(() => {
  console.log('=== WATCHER CON DEBOUNCE ===\n');
  
  fs.writeFileSync('debounced-file.txt', 'Iniziale');
  
  /**
   * Wrapper per debounce degli eventi
   */
  function createDebouncedWatcher(filePath, delay, callback) {
    let timeout = null;
    
    const watcher = fs.watch(filePath, (eventType, filename) => {
      // Cancella timeout esistente
      if (timeout) {
        clearTimeout(timeout);
      }
      
      // Crea nuovo timeout
      timeout = setTimeout(() => {
        callback(eventType, filename);
        timeout = null;
      }, delay);
    });
    
    return watcher;
  }
  
  console.log('📁 Watcher con debounce di 500ms avviato\n');
  
  const watcher4 = createDebouncedWatcher('debounced-file.txt', 500, (eventType, filename) => {
    console.log(`🔔 Evento debounced: ${eventType} su ${filename}`);
    
    const content = fs.readFileSync('debounced-file.txt', 'utf8');
    console.log(`   Contenuto finale: ${content.trim()}\n`);
  });
  
  // Esegui modifiche multiple rapide
  setTimeout(() => {
    console.log('ℹ️  Eseguo modifiche rapide...');
    fs.appendFileSync('debounced-file.txt', '1');
  }, 1000);
  
  setTimeout(() => {
    fs.appendFileSync('debounced-file.txt', '2');
  }, 1100);
  
  setTimeout(() => {
    fs.appendFileSync('debounced-file.txt', '3');
  }, 1200);
  
  setTimeout(() => {
    console.log('ℹ️  Modifiche completate, attendo debounce...\n');
  }, 1300);
  
  // Chiudi watcher
  setTimeout(() => {
    watcher4.close();
    console.log('✓ Watcher chiuso\n');
  }, 3000);
  
}, 24000);

// ============================================
// ESEMPIO 6: CLASSE FILE WATCHER
// ============================================
setTimeout(() => {
  console.log('=== CLASSE FILE WATCHER ===\n');
  
  /**
   * Classe per monitorare cambiamenti file
   */
  class FileWatcher {
    constructor(filePath, options = {}) {
      this.filePath = filePath;
      this.watcher = null;
      this.listeners = {
        change: [],
        error: [],
        close: []
      };
      
      this.options = {
        persistent: true,
        recursive: false,
        debounce: 0,
        ...options
      };
      
      this.debounceTimeout = null;
    }
    
    /**
     * Avvia monitoraggio
     */
    start() {
      if (this.watcher) {
        throw new Error('Watcher già avviato');
      }
      
      this.watcher = fs.watch(
        this.filePath,
        { persistent: this.options.persistent, recursive: this.options.recursive },
        (eventType, filename) => {
          this.handleEvent(eventType, filename);
        }
      );
      
      this.watcher.on('error', (err) => {
        this.emit('error', err);
      });
      
      this.watcher.on('close', () => {
        this.emit('close');
      });
      
      return this;
    }
    
    /**
     * Gestisci evento
     */
    handleEvent(eventType, filename) {
      if (this.options.debounce > 0) {
        if (this.debounceTimeout) {
          clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
          this.emit('change', { eventType, filename });
          this.debounceTimeout = null;
        }, this.options.debounce);
        
      } else {
        this.emit('change', { eventType, filename });
      }
    }
    
    /**
     * Registra listener
     */
    on(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event].push(callback);
      }
      return this;
    }
    
    /**
     * Emetti evento
     */
    emit(event, data) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(callback => callback(data));
      }
    }
    
    /**
     * Ferma monitoraggio
     */
    stop() {
      if (this.watcher) {
        this.watcher.close();
        this.watcher = null;
      }
      
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
    }
  }
  
  // Test classe
  fs.writeFileSync('class-test.txt', 'Iniziale');
  
  const watcher5 = new FileWatcher('class-test.txt', { debounce: 300 });
  
  watcher5
    .on('change', ({ eventType, filename }) => {
      console.log(`🔔 Change: ${eventType} su ${filename}`);
    })
    .on('error', (err) => {
      console.error('❌ Errore:', err.message);
    })
    .on('close', () => {
      console.log('ℹ️  Watcher chiuso\n');
    })
    .start();
  
  console.log('✓ FileWatcher avviato\n');
  
  // Test modifiche
  setTimeout(() => fs.writeFileSync('class-test.txt', 'Modifica 1'), 1000);
  setTimeout(() => fs.appendFileSync('class-test.txt', '\nModifica 2'), 1500);
  setTimeout(() => fs.appendFileSync('class-test.txt', '\nModifica 3'), 1600);
  
  // Ferma watcher
  setTimeout(() => {
    watcher5.stop();
    console.log('✓ FileWatcher fermato\n');
  }, 3000);
  
}, 28000);

// ============================================
// ESEMPIO 7: MONITORAGGIO DIRECTORY RICORSIVO
// ============================================
setTimeout(async () => {
  console.log('=== MONITORAGGIO DIRECTORY RICORSIVO ===\n');
  
  // Crea struttura directory
  await fs.promises.mkdir('recursive-watch/sub1/sub2', { recursive: true });
  
  console.log('📁 Monitoraggio ricorsivo avviato\n');
  
  const watcher6 = fs.watch('recursive-watch', { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`🔔 ${eventType}: ${filename}`);
    }
  });
  
  // Crea file in varie sottodirectory
  setTimeout(() => {
    fs.writeFileSync('recursive-watch/file1.txt', 'Root');
  }, 1000);
  
  setTimeout(() => {
    fs.writeFileSync('recursive-watch/sub1/file2.txt', 'Sub1');
  }, 2000);
  
  setTimeout(() => {
    fs.writeFileSync('recursive-watch/sub1/sub2/file3.txt', 'Sub2');
  }, 3000);
  
  // Chiudi watcher
  setTimeout(() => {
    watcher6.close();
    console.log('\n✓ Monitoraggio ricorsivo chiuso\n');
  }, 4000);
  
}, 32000);

// ============================================
// PULIZIA FILE DI TEST
// ============================================
setTimeout(async () => {
  console.log('=== PULIZIA FILE DI TEST ===\n');
  
  // Ferma tutti i watchFile attivi
  fs.unwatchFile('polled-file.txt');
  
  // Elimina file
  const files = [
    'watched-file.txt',
    'polled-file.txt',
    'error-test.txt',
    'debounced-file.txt',
    'class-test.txt'
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
    await fs.promises.rm('watched-dir', { recursive: true, force: true });
    console.log('✓ Eliminata: watched-dir');
  } catch {}
  
  try {
    await fs.promises.rm('recursive-watch', { recursive: true, force: true });
    console.log('✓ Eliminata: recursive-watch');
  } catch {}
  
  console.log('\n✅ Pulizia completata');
  
}, 37000);

console.log('\n⏳ Tutti gli esempi verranno eseguiti in sequenza...\n');
console.log('ℹ️  NOTA: Gli eventi di fs.watch() possono variare tra sistemi operativi\n');
