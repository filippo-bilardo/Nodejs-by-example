/**
 * ESEMPIO 02.09 - Lettura File con Stream
 * 
 * Gli stream sono ideali per lavorare con file di grandi dimensioni perché:
 * 1. Non caricano l'intero file in memoria
 * 2. Elaborano i dati in piccoli chunk (blocchi)
 * 3. Permettono di iniziare l'elaborazione prima che il file sia completamente letto
 * 
 * QUANDO USARE GLI STREAM:
 * - File di grandi dimensioni (> 100 MB)
 * - Elaborazione progressiva dei dati
 * - Video, audio, log file
 * - Upload/download su rete
 */

const fs = require('fs');
const path = require('path');

// ============================================
// ESEMPIO 1: LETTURA BASE CON STREAM
// ============================================
console.log('=== LETTURA FILE CON STREAM ===\n');

// Prima creiamo un file di test con contenuto
const testFile = 'stream-test.txt';
const contenutoTest = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n'.repeat(10);
fs.writeFileSync(testFile, contenutoTest);

// Creare un read stream
const readStream = fs.createReadStream(testFile, {
  encoding: 'utf8',      // Encoding per ottenere stringhe invece di Buffer
  highWaterMark: 64      // Dimensione dei chunk in byte (default: 64KB)
});

// Event: 'data' - Emesso quando un chunk di dati è disponibile
readStream.on('data', (chunk) => {
  console.log('--- Chunk ricevuto ---');
  console.log(`Dimensione: ${chunk.length} byte`);
  console.log(`Contenuto: ${chunk.substring(0, 50)}...`);
  console.log('');
});

// Event: 'end' - Emesso quando non ci sono più dati da leggere
readStream.on('end', () => {
  console.log('✓ Lettura completata');
  console.log('');
});

// Event: 'error' - Emesso se si verifica un errore
readStream.on('error', (err) => {
  console.error('❌ Errore durante la lettura:', err.message);
});

// ============================================
// ESEMPIO 2: CONTARE RIGHE IN UN FILE
// ============================================
setTimeout(() => {
  console.log('=== CONTARE RIGHE CON STREAM ===\n');
  
  /**
   * Conta il numero di righe in un file usando stream
   * @param {string} filePath - Percorso del file
   */
  function contaRighe(filePath) {
    return new Promise((resolve, reject) => {
      let lineCount = 0;
      let remainder = '';
      
      const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
      
      stream.on('data', (chunk) => {
        // Aggiungi il remainder dal chunk precedente
        chunk = remainder + chunk;
        
        // Conta i newline
        const lines = chunk.split('\n');
        
        // Salva l'ultima riga parziale come remainder
        remainder = lines.pop();
        
        lineCount += lines.length;
      });
      
      stream.on('end', () => {
        // Se c'è un remainder, c'è un'ultima riga senza newline
        if (remainder) lineCount++;
        
        console.log(`✓ Totale righe: ${lineCount}`);
        resolve(lineCount);
      });
      
      stream.on('error', reject);
    });
  }
  
  contaRighe(testFile);
  
}, 1000);

// ============================================
// ESEMPIO 3: LETTURA CON CONTROLLO FLUSSO (PAUSE/RESUME)
// ============================================
setTimeout(() => {
  console.log('\n=== CONTROLLO FLUSSO STREAM ===\n');
  
  const readStream2 = fs.createReadStream(testFile, {
    encoding: 'utf8',
    highWaterMark: 32  // Chunk più piccoli per vedere più eventi
  });
  
  let chunkCount = 0;
  
  readStream2.on('data', (chunk) => {
    chunkCount++;
    console.log(`Chunk ${chunkCount} ricevuto (${chunk.length} byte)`);
    
    // Pausa lo stream per simulare elaborazione pesante
    readStream2.pause();
    console.log('⏸️  Stream in pausa per elaborazione...');
    
    // Simula elaborazione con delay
    setTimeout(() => {
      console.log('▶️  Riprendo lo stream');
      readStream2.resume();
    }, 500);
  });
  
  readStream2.on('end', () => {
    console.log(`\n✓ Elaborati ${chunkCount} chunk totali`);
  });
  
}, 3000);

// ============================================
// ESEMPIO 4: LETTURA CON BUFFER (PER FILE BINARI)
// ============================================
setTimeout(() => {
  console.log('\n=== LETTURA FILE BINARIO ===\n');
  
  // Crea un file binario di esempio
  const binaryFile = 'binary-test.bin';
  const buffer = Buffer.from([0x48, 0x65, 0x6C, 0x6C, 0x6F]); // "Hello" in ASCII
  fs.writeFileSync(binaryFile, buffer);
  
  const binaryStream = fs.createReadStream(binaryFile, {
    // NON specifichiamo encoding per ottenere Buffer
    highWaterMark: 2  // Leggi 2 byte alla volta
  });
  
  binaryStream.on('data', (chunk) => {
    console.log(`Chunk Buffer: [${Array.from(chunk).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(', ')}]`);
    console.log(`  Come stringa: "${chunk.toString()}"`);
  });
  
  binaryStream.on('end', () => {
    console.log('✓ Lettura binaria completata\n');
    // Pulizia
    fs.unlinkSync(binaryFile);
  });
  
}, 6000);

// ============================================
// ESEMPIO 5: STREAM READABLE PERSONALIZZATO
// ============================================
setTimeout(() => {
  console.log('\n=== READABLE STREAM PERSONALIZZATO ===\n');
  
  const { Readable } = require('stream');
  
  /**
   * Stream personalizzato che genera numeri
   */
  class NumberStream extends Readable {
    constructor(max) {
      super();
      this.current = 0;
      this.max = max;
    }
    
    // Implementa il metodo _read richiesto da Readable
    _read() {
      if (this.current <= this.max) {
        // Push dei dati nello stream
        const chunk = `Numero: ${this.current}\n`;
        this.push(chunk);
        this.current++;
      } else {
        // null indica la fine dello stream
        this.push(null);
      }
    }
  }
  
  // Crea e usa lo stream personalizzato
  const numberStream = new NumberStream(5);
  
  numberStream.on('data', (chunk) => {
    process.stdout.write(chunk);
  });
  
  numberStream.on('end', () => {
    console.log('✓ Stream personalizzato terminato\n');
  });
  
}, 9000);

// ============================================
// ESEMPIO 6: LETTURA CON EVENTI DETTAGLIATI
// ============================================
setTimeout(() => {
  console.log('\n=== TUTTI GLI EVENTI DI UN READ STREAM ===\n');
  
  const detailedStream = fs.createReadStream(testFile, {
    encoding: 'utf8',
    highWaterMark: 100
  });
  
  // Event: 'open' - Emesso quando il file è aperto
  detailedStream.on('open', (fd) => {
    console.log(`📂 File aperto (file descriptor: ${fd})`);
  });
  
  // Event: 'ready' - Emesso quando lo stream è pronto per leggere
  detailedStream.on('ready', () => {
    console.log('✅ Stream pronto per la lettura');
  });
  
  // Event: 'data'
  detailedStream.on('data', (chunk) => {
    console.log(`📊 Dati ricevuti: ${chunk.length} byte`);
  });
  
  // Event: 'end'
  detailedStream.on('end', () => {
    console.log('🏁 Fine dello stream (tutti i dati letti)');
  });
  
  // Event: 'close' - Emesso quando lo stream e il file sono chiusi
  detailedStream.on('close', () => {
    console.log('🔒 Stream e file chiusi');
  });
  
  // Event: 'error'
  detailedStream.on('error', (err) => {
    console.error('❌ Errore:', err.message);
  });
  
}, 12000);

// ============================================
// ESEMPIO 7: VANTAGGI MEMORIA CON FILE GRANDI
// ============================================
setTimeout(() => {
  console.log('\n=== CONFRONTO USO MEMORIA ===\n');
  
  // Crea un file più grande per il test
  const largeFile = 'large-test.txt';
  const largeContent = 'Questa è una riga di testo ripetuta molte volte.\n'.repeat(10000);
  fs.writeFileSync(largeFile, largeContent);
  
  console.log(`File creato: ${largeFile}`);
  console.log(`Dimensione: ${(fs.statSync(largeFile).size / 1024).toFixed(2)} KB\n`);
  
  // Metodo 1: readFile (carica tutto in memoria)
  console.log('Metodo 1: readFile (tutto in memoria)');
  const startMem1 = process.memoryUsage().heapUsed / 1024 / 1024;
  
  fs.readFile(largeFile, 'utf8', (err, data) => {
    const endMem1 = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`  Memoria usata: ${(endMem1 - startMem1).toFixed(2)} MB`);
    console.log(`  Dimensione dati: ${(data.length / 1024).toFixed(2)} KB`);
    
    // Metodo 2: Stream (chunk per chunk)
    console.log('\nMetodo 2: Stream (chunk per chunk)');
    const startMem2 = process.memoryUsage().heapUsed / 1024 / 1024;
    let totalBytes = 0;
    
    const stream = fs.createReadStream(largeFile, { encoding: 'utf8' });
    
    stream.on('data', (chunk) => {
      totalBytes += chunk.length;
    });
    
    stream.on('end', () => {
      const endMem2 = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`  Memoria usata: ${(endMem2 - startMem2).toFixed(2)} MB`);
      console.log(`  Dimensione totale: ${(totalBytes / 1024).toFixed(2)} KB`);
      console.log('\n✓ Con stream si usa molta meno memoria!\n');
      
      // Pulizia
      fs.unlinkSync(largeFile);
      fs.unlinkSync(testFile);
    });
  });
  
}, 15000);

console.log('\n⏳ Tutti gli esempi verranno eseguiti in sequenza...\n');
