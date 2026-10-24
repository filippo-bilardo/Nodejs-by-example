/**
 * ESEMPIO 02.10 - Scrittura File con Stream
 * 
 * Gli stream di scrittura (WriteStream) permettono di scrivere dati in un file
 * progressivamente, senza dover tenere tutto in memoria.
 * 
 * VANTAGGI:
 * - Efficienza memoria per file grandi
 * - Possibilità di scrivere dati mentre vengono generati
 * - Controllo granulare del flusso di scrittura
 * - Backpressure handling (gestione buffer overflow)
 */

const fs = require('fs');

// ============================================
// ESEMPIO 1: SCRITTURA BASE CON STREAM
// ============================================
console.log('=== SCRITTURA BASE CON STREAM ===\n');

// Crea un write stream
const writeStream = fs.createWriteStream('output-stream.txt', {
  encoding: 'utf8',
  flags: 'w'  // 'w' = write (sovrascrive), 'a' = append
});

// Scrivi varie righe
writeStream.write('Prima riga di testo\n');
writeStream.write('Seconda riga di testo\n');
writeStream.write('Terza riga di testo\n');

// end() scrive l'ultimo chunk e chiude lo stream
writeStream.end('Ultima riga (con end)\n');

// Event: 'finish' - Emesso quando tutti i dati sono stati scritti sul file
writeStream.on('finish', () => {
  console.log('✓ Scrittura completata\n');
});

// Event: 'error' - Gestione errori
writeStream.on('error', (err) => {
  console.error('❌ Errore durante la scrittura:', err.message);
});

// ============================================
// ESEMPIO 2: GENERAZIONE FILE GRANDE CON STREAM
// ============================================
setTimeout(() => {
  console.log('=== GENERAZIONE FILE GRANDE ===\n');
  
  /**
   * Genera un file grande scrivendo progressivamente con stream
   * @param {string} filename - Nome del file da creare
   * @param {number} numLines - Numero di righe da scrivere
   */
  function generaFilGrande(filename, numLines) {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filename);
      let linesWritten = 0;
      
      // Funzione per scrivere una riga
      function scriviRiga() {
        let continua = true;
        
        while (linesWritten < numLines && continua) {
          const riga = `Riga ${linesWritten + 1}: ${new Date().toISOString()}\n`;
          
          // write() restituisce false se il buffer interno è pieno
          continua = stream.write(riga);
          linesWritten++;
          
          // Mostra progresso ogni 1000 righe
          if (linesWritten % 1000 === 0) {
            console.log(`  Scritte ${linesWritten}/${numLines} righe...`);
          }
        }
        
        if (linesWritten < numLines) {
          // Buffer pieno, aspetta evento 'drain' prima di continuare
          stream.once('drain', scriviRiga);
        } else {
          // Tutte le righe scritte, chiudi lo stream
          stream.end();
        }
      }
      
      // Event: 'drain' - Emesso quando il buffer è di nuovo vuoto e pronto
      // (questo evento è gestito nell'esempio del backpressure)
      
      stream.on('finish', () => {
        const stats = fs.statSync(filename);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`✓ File generato: ${filename}`);
        console.log(`  Righe: ${numLines}`);
        console.log(`  Dimensione: ${sizeMB} MB\n`);
        resolve();
      });
      
      stream.on('error', reject);
      
      // Inizia la scrittura
      scriviRiga();
    });
  }
  
  generaFilGrande('file-grande.txt', 5000);
  
}, 1000);

// ============================================
// ESEMPIO 3: APPEND MODE (AGGIUNTA)
// ============================================
setTimeout(() => {
  console.log('=== MODALITÀ APPEND ===\n');
  
  // Prima scrittura: crea il file
  const appendStream1 = fs.createWriteStream('append-test.txt', { flags: 'w' });
  appendStream1.write('Prima scrittura (crea file)\n');
  appendStream1.end();
  
  appendStream1.on('finish', () => {
    console.log('✓ File creato');
    
    // Seconda scrittura: aggiunge senza sovrascrivere
    const appendStream2 = fs.createWriteStream('append-test.txt', { flags: 'a' });
    appendStream2.write('Seconda scrittura (append)\n');
    appendStream2.write('Terza scrittura (append)\n');
    appendStream2.end();
    
    appendStream2.on('finish', () => {
      console.log('✓ Contenuto aggiunto');
      
      // Verifica il contenuto
      const contenuto = fs.readFileSync('append-test.txt', 'utf8');
      console.log('\nContenuto finale:');
      console.log(contenuto);
    });
  });
  
}, 3000);

// ============================================
// ESEMPIO 4: GESTIONE BACKPRESSURE
// ============================================
setTimeout(() => {
  console.log('\n=== GESTIONE BACKPRESSURE ===\n');
  
  /**
   * Esempio che mostra come gestire correttamente il backpressure
   * Il backpressure si verifica quando scriviamo più velocemente di quanto
   * il sistema possa gestire (buffer overflow)
   */
  function scritturaConBackpressure(filename, numChunks) {
    return new Promise((resolve) => {
      const stream = fs.createWriteStream(filename);
      let i = 0;
      
      function write() {
        let ok = true;
        
        do {
          i++;
          const chunk = `Chunk ${i}\n`;
          
          if (i === numChunks) {
            // Ultimo chunk, usa end()
            stream.end(chunk, () => {
              console.log('✓ Scrittura con backpressure completata\n');
              resolve();
            });
          } else {
            // write() restituisce false se il buffer è pieno
            ok = stream.write(chunk);
          }
          
        } while (i < numChunks && ok);
        
        if (i < numChunks) {
          // Backpressure! Il buffer è pieno
          console.log(`⚠️  Backpressure al chunk ${i}, in attesa di drain...`);
          
          // Aspetta che il buffer si svuoti
          stream.once('drain', () => {
            console.log('✅ Buffer svuotato, riprendo scrittura');
            write();
          });
        }
      }
      
      write();
    });
  }
  
  scritturaConBackpressure('backpressure-test.txt', 100);
  
}, 6000);

// ============================================
// ESEMPIO 5: WRITABLE STREAM PERSONALIZZATO
// ============================================
setTimeout(() => {
  console.log('\n=== WRITABLE STREAM PERSONALIZZATO ===\n');
  
  const { Writable } = require('stream');
  
  /**
   * Stream di scrittura che converte tutto in maiuscolo
   */
  class UpperCaseStream extends Writable {
    constructor(filename) {
      super();
      this.filename = filename;
      this.fileStream = fs.createWriteStream(filename);
    }
    
    // Implementa il metodo _write richiesto da Writable
    _write(chunk, encoding, callback) {
      // Trasforma in maiuscolo
      const upperChunk = chunk.toString().toUpperCase();
      
      // Scrivi sul file
      this.fileStream.write(upperChunk);
      
      // Chiama callback per segnalare che abbiamo finito
      callback();
    }
    
    _final(callback) {
      // Chiamato quando lo stream viene chiuso
      this.fileStream.end(callback);
    }
  }
  
  // Usa lo stream personalizzato
  const upperStream = new UpperCaseStream('uppercase-output.txt');
  
  upperStream.write('questa riga sarà in maiuscolo\n');
  upperStream.write('anche questa riga\n');
  upperStream.end('e anche questa ultima riga\n');
  
  upperStream.on('finish', () => {
    console.log('✓ Stream personalizzato completato');
    
    // Verifica il risultato
    const contenuto = fs.readFileSync('uppercase-output.txt', 'utf8');
    console.log('\nContenuto (tutto maiuscolo):');
    console.log(contenuto);
  });
  
}, 8000);

// ============================================
// ESEMPIO 6: EVENTI DETTAGLIATI WRITE STREAM
// ============================================
setTimeout(() => {
  console.log('\n=== EVENTI DI UN WRITE STREAM ===\n');
  
  const detailedStream = fs.createWriteStream('detailed-output.txt');
  
  // Event: 'open' - Emesso quando il file è aperto
  detailedStream.on('open', (fd) => {
    console.log(`📂 File aperto (file descriptor: ${fd})`);
  });
  
  // Event: 'ready' - Emesso quando lo stream è pronto per scrivere
  detailedStream.on('ready', () => {
    console.log('✅ Stream pronto per la scrittura');
  });
  
  // Event: 'drain' - Emesso quando il buffer è pronto per più dati
  detailedStream.on('drain', () => {
    console.log('💧 Buffer svuotato (drain event)');
  });
  
  // Event: 'finish' - Emesso quando end() è stato chiamato e tutti i dati sono scritti
  detailedStream.on('finish', () => {
    console.log('🏁 Tutti i dati scritti (finish event)');
  });
  
  // Event: 'close' - Emesso quando lo stream e il file sono chiusi
  detailedStream.on('close', () => {
    console.log('🔒 Stream e file chiusi (close event)\n');
  });
  
  // Event: 'error'
  detailedStream.on('error', (err) => {
    console.error('❌ Errore:', err.message);
  });
  
  // Scrivi dei dati
  detailedStream.write('Prima riga\n');
  detailedStream.write('Seconda riga\n');
  detailedStream.end('Ultima riga\n');
  
}, 11000);

// ============================================
// ESEMPIO 7: SCRITTURA CSV CON STREAM
// ============================================
setTimeout(() => {
  console.log('\n=== GENERAZIONE FILE CSV ===\n');
  
  /**
   * Genera un file CSV di esempio con migliaia di righe
   * usando stream per efficienza
   */
  function generaCSV(filename, numRecords) {
    return new Promise((resolve) => {
      const stream = fs.createWriteStream(filename);
      
      // Header CSV
      stream.write('ID,Nome,Email,Data\n');
      
      let id = 1;
      
      function scriviRecord() {
        let ok = true;
        
        while (id <= numRecords && ok) {
          const record = `${id},User${id},user${id}@example.com,${new Date().toISOString()}\n`;
          ok = stream.write(record);
          id++;
        }
        
        if (id <= numRecords) {
          // Backpressure, aspetta drain
          stream.once('drain', scriviRecord);
        } else {
          // Finito
          stream.end();
        }
      }
      
      stream.on('finish', () => {
        console.log(`✓ CSV generato: ${filename}`);
        console.log(`  Record: ${numRecords}\n`);
        resolve();
      });
      
      scriviRecord();
    });
  }
  
  generaCSV('users.csv', 1000);
  
}, 14000);

// ============================================
// PULIZIA (opzionale)
// ============================================
setTimeout(() => {
  console.log('\n=== PULIZIA FILE DI TEST ===\n');
  
  const filesToDelete = [
    'output-stream.txt',
    'file-grande.txt',
    'append-test.txt',
    'backpressure-test.txt',
    'uppercase-output.txt',
    'detailed-output.txt',
    'users.csv'
  ];
  
  filesToDelete.forEach(file => {
    try {
      fs.unlinkSync(file);
      console.log(`✓ Eliminato: ${file}`);
    } catch (err) {
      // File potrebbe non esistere
    }
  });
  
  console.log('\n✅ Pulizia completata');
  
}, 18000);

console.log('\n⏳ Tutti gli esempi verranno eseguiti in sequenza...\n');
