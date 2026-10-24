/**
 * ESEMPIO 02.11 - Pipe tra Stream e Pipeline
 * 
 * pipe() è un metodo potente che collega lo stream di lettura a quello di scrittura,
 * gestendo automaticamente il flusso dei dati e il backpressure.
 * 
 * VANTAGGI DEL PIPE:
 * - Codice più pulito e leggibile
 * - Gestione automatica del backpressure
 * - Concatenazione di operazioni (chaining)
 * - Gestione automatica degli errori (con pipeline)
 * 
 * CASI D'USO:
 * - Copia file
 * - Compressione/decompressione
 * - Trasformazione dati
 * - Upload/download file
 */

const fs = require('fs');
const { pipeline, Transform } = require('stream');
const zlib = require('zlib');

// ============================================
// ESEMPIO 1: COPIA FILE CON PIPE (BASE)
// ============================================
console.log('=== COPIA FILE CON PIPE ===\n');

// Crea un file sorgente
fs.writeFileSync('source.txt', 'Contenuto del file sorgente\n'.repeat(100));

// Copia file usando pipe
const readStream = fs.createReadStream('source.txt');
const writeStream = fs.createWriteStream('destination.txt');

// pipe() connette automaticamente i due stream
readStream.pipe(writeStream);

writeStream.on('finish', () => {
  console.log('✓ File copiato con successo da source.txt a destination.txt');
  
  // Verifica che i file siano identici
  const source = fs.readFileSync('source.txt', 'utf8');
  const dest = fs.readFileSync('destination.txt', 'utf8');
  console.log(`  File identici: ${source === dest ? 'Sì' : 'No'}\n`);
});

// ============================================
// ESEMPIO 2: COMPRESSIONE FILE CON PIPE
// ============================================
setTimeout(() => {
  console.log('=== COMPRESSIONE FILE CON GZIP ===\n');
  
  // Crea un file da comprimere
  const largeContent = 'Questa riga verrà ripetuta molte volte per creare un file comprimibile.\n'.repeat(1000);
  fs.writeFileSync('to-compress.txt', largeContent);
  
  const originalSize = fs.statSync('to-compress.txt').size;
  console.log(`Dimensione originale: ${(originalSize / 1024).toFixed(2)} KB`);
  
  // Compressione: File → Gzip → File.gz
  const source = fs.createReadStream('to-compress.txt');
  const gzip = zlib.createGzip(); // Stream di compressione
  const destination = fs.createWriteStream('to-compress.txt.gz');
  
  // Collega i tre stream con pipe
  source
    .pipe(gzip)
    .pipe(destination);
  
  destination.on('finish', () => {
    const compressedSize = fs.statSync('to-compress.txt.gz').size;
    const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    console.log('✓ File compresso con successo');
    console.log(`  Dimensione compressa: ${(compressedSize / 1024).toFixed(2)} KB`);
    console.log(`  Rapporto di compressione: ${ratio}% riduzione\n`);
  });
  
}, 1000);

// ============================================
// ESEMPIO 3: DECOMPRESSIONE FILE
// ============================================
setTimeout(() => {
  console.log('=== DECOMPRESSIONE FILE ===\n');
  
  // Decompressione: File.gz → Gunzip → File
  const source = fs.createReadStream('to-compress.txt.gz');
  const gunzip = zlib.createGunzip(); // Stream di decompressione
  const destination = fs.createWriteStream('decompressed.txt');
  
  source
    .pipe(gunzip)
    .pipe(destination);
  
  destination.on('finish', () => {
    console.log('✓ File decompresso con successo');
    
    // Verifica che il contenuto sia identico all'originale
    const original = fs.readFileSync('to-compress.txt', 'utf8');
    const decompressed = fs.readFileSync('decompressed.txt', 'utf8');
    console.log(`  Contenuto identico: ${original === decompressed ? 'Sì' : 'No'}\n`);
  });
  
}, 2000);

// ============================================
// ESEMPIO 4: TRANSFORM STREAM CON PIPE
// ============================================
setTimeout(() => {
  console.log('=== TRANSFORM STREAM (CONVERSIONE MAIUSCOLO) ===\n');
  
  /**
   * Transform stream personalizzato che converte il testo in maiuscolo
   */
  const upperCaseTransform = new Transform({
    transform(chunk, encoding, callback) {
      // Trasforma il chunk in maiuscolo
      const upperChunk = chunk.toString().toUpperCase();
      
      // Push del chunk trasformato
      this.push(upperChunk);
      
      // Segnala che abbiamo finito con questo chunk
      callback();
    }
  });
  
  // Crea file sorgente
  fs.writeFileSync('lowercase.txt', 'questo testo è tutto minuscolo\ne sarà convertito in maiuscolo\n');
  
  // Pipeline: File → Transform (uppercase) → File
  fs.createReadStream('lowercase.txt')
    .pipe(upperCaseTransform)
    .pipe(fs.createWriteStream('uppercase.txt'));
  
  setTimeout(() => {
    const result = fs.readFileSync('uppercase.txt', 'utf8');
    console.log('✓ Trasformazione completata');
    console.log('\nContenuto trasformato:');
    console.log(result);
  }, 500);
  
}, 3000);

// ============================================
// ESEMPIO 5: PIPELINE (GESTIONE ERRORI MIGLIORATA)
// ============================================
setTimeout(() => {
  console.log('\n=== PIPELINE CON GESTIONE ERRORI ===\n');
  
  /**
   * pipeline() è preferibile a pipe() perché:
   * - Gestisce automaticamente la pulizia degli stream
   * - Propaga gli errori correttamente
   * - Chiama callback quando completo o in errore
   */
  
  // Transform che aggiunge numeri di riga
  const addLineNumbers = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split('\n');
      let lineNumber = 1;
      
      const numberedLines = lines.map(line => {
        if (line.trim()) {
          return `${lineNumber++}. ${line}`;
        }
        return line;
      }).join('\n');
      
      this.push(numberedLines);
      callback();
    }
  });
  
  // Crea file sorgente
  const content = 'Prima riga\nSeconda riga\nTerza riga\nQuarta riga\n';
  fs.writeFileSync('input.txt', content);
  
  // Usa pipeline invece di pipe
  pipeline(
    fs.createReadStream('input.txt'),
    addLineNumbers,
    fs.createWriteStream('numbered-output.txt'),
    (err) => {
      if (err) {
        console.error('❌ Errore nella pipeline:', err.message);
      } else {
        console.log('✓ Pipeline completata con successo');
        
        const result = fs.readFileSync('numbered-output.txt', 'utf8');
        console.log('\nRisultato con numeri di riga:');
        console.log(result);
      }
    }
  );
  
}, 4000);

// ============================================
// ESEMPIO 6: MULTI-TRANSFORM PIPELINE
// ============================================
setTimeout(() => {
  console.log('\n=== PIPELINE CON TRASFORMAZIONI MULTIPLE ===\n');
  
  // Transform 1: Converti in maiuscolo
  const toUpperCase = new Transform({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  });
  
  // Transform 2: Rimuovi vocali
  const removeVowels = new Transform({
    transform(chunk, encoding, callback) {
      const noVowels = chunk.toString().replace(/[AEIOU]/gi, '');
      this.push(noVowels);
      callback();
    }
  });
  
  // Transform 3: Aggiungi asterischi
  const addAsterisks = new Transform({
    transform(chunk, encoding, callback) {
      const lines = chunk.toString().split('\n');
      const withAsterisks = lines.map(line => 
        line.trim() ? `*** ${line} ***` : line
      ).join('\n');
      this.push(withAsterisks);
      callback();
    }
  });
  
  fs.writeFileSync('multi-transform-input.txt', 'Questo testo subirà\nmolteplici trasformazioni\nin sequenza\n');
  
  // Pipeline con tre transform in sequenza
  pipeline(
    fs.createReadStream('multi-transform-input.txt'),
    toUpperCase,
    removeVowels,
    addAsterisks,
    fs.createWriteStream('multi-transform-output.txt'),
    (err) => {
      if (err) {
        console.error('Errore:', err.message);
      } else {
        console.log('✓ Pipeline multi-transform completata');
        
        const result = fs.readFileSync('multi-transform-output.txt', 'utf8');
        console.log('\nRisultato dopo tutte le trasformazioni:');
        console.log(result);
      }
    }
  );
  
}, 5500);

// ============================================
// ESEMPIO 7: COMPRESSIONE E CIFRATURA COMBINATA
// ============================================
setTimeout(() => {
  console.log('\n=== COMPRESSIONE + CIFRATURA ===\n');
  
  const crypto = require('crypto');
  
  // Dati sensibili da proteggere
  const sensitiveData = 'Questi sono dati sensibili che devono essere compressi e cifrati.\n'.repeat(50);
  fs.writeFileSync('sensitive.txt', sensitiveData);
  
  // Chiave e IV per cifratura (in produzione: usa chiavi sicure!)
  const algorithm = 'aes-256-ctr';
  const key = crypto.scryptSync('password-sicura', 'salt', 32);
  const iv = Buffer.alloc(16, 0); // In produzione: usa IV random
  
  console.log('Cifratura e compressione del file...');
  
  // Pipeline: File → Gzip → Cipher → File.enc
  pipeline(
    fs.createReadStream('sensitive.txt'),
    zlib.createGzip(),
    crypto.createCipheriv(algorithm, key, iv),
    fs.createWriteStream('sensitive.txt.enc'),
    (err) => {
      if (err) {
        console.error('Errore:', err.message);
      } else {
        const originalSize = fs.statSync('sensitive.txt').size;
        const encryptedSize = fs.statSync('sensitive.txt.enc').size;
        
        console.log('✓ File cifrato e compresso');
        console.log(`  Dimensione originale: ${(originalSize / 1024).toFixed(2)} KB`);
        console.log(`  Dimensione finale: ${(encryptedSize / 1024).toFixed(2)} KB`);
        
        // Decifratura e decompressione
        console.log('\nDecifratura e decompressione...');
        
        pipeline(
          fs.createReadStream('sensitive.txt.enc'),
          crypto.createDecipheriv(algorithm, key, iv),
          zlib.createGunzip(),
          fs.createWriteStream('sensitive-decrypted.txt'),
          (err) => {
            if (err) {
              console.error('Errore nella decifratura:', err.message);
            } else {
              console.log('✓ File decifrato e decompresso');
              
              // Verifica integrità
              const original = fs.readFileSync('sensitive.txt', 'utf8');
              const decrypted = fs.readFileSync('sensitive-decrypted.txt', 'utf8');
              console.log(`  Dati integri: ${original === decrypted ? 'Sì' : 'No'}\n`);
            }
          }
        );
      }
    }
  );
  
}, 7000);

// ============================================
// ESEMPIO 8: MONITORAGGIO PROGRESSO
// ============================================
setTimeout(() => {
  console.log('\n=== COPIA FILE CON PROGRESSO ===\n');
  
  // Crea un file grande
  const bigFile = 'big-file.txt';
  const bigContent = 'x'.repeat(1024 * 1024); // 1 MB
  fs.writeFileSync(bigFile, bigContent);
  
  const totalSize = fs.statSync(bigFile).size;
  let bytesCopied = 0;
  
  // Transform che monitora il progresso
  const progressMonitor = new Transform({
    transform(chunk, encoding, callback) {
      bytesCopied += chunk.length;
      const percent = ((bytesCopied / totalSize) * 100).toFixed(1);
      
      // Mostra progresso
      process.stdout.write(`\r  Progresso: ${percent}% (${(bytesCopied / 1024).toFixed(0)} KB / ${(totalSize / 1024).toFixed(0)} KB)`);
      
      this.push(chunk);
      callback();
    }
  });
  
  pipeline(
    fs.createReadStream(bigFile),
    progressMonitor,
    fs.createWriteStream('big-file-copy.txt'),
    (err) => {
      process.stdout.write('\n');
      if (err) {
        console.error('Errore:', err.message);
      } else {
        console.log('✓ Copia completata con successo\n');
      }
    }
  );
  
}, 9000);

// ============================================
// PULIZIA FILE DI TEST
// ============================================
setTimeout(() => {
  console.log('\n=== PULIZIA FILE DI TEST ===\n');
  
  const filesToDelete = [
    'source.txt',
    'destination.txt',
    'to-compress.txt',
    'to-compress.txt.gz',
    'decompressed.txt',
    'lowercase.txt',
    'uppercase.txt',
    'input.txt',
    'numbered-output.txt',
    'multi-transform-input.txt',
    'multi-transform-output.txt',
    'sensitive.txt',
    'sensitive.txt.enc',
    'sensitive-decrypted.txt',
    'big-file.txt',
    'big-file-copy.txt'
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
  
}, 12000);

console.log('\n⏳ Tutti gli esempi verranno eseguiti in sequenza...\n');
