/**
 * ESEMPIO 02.08 - Lettura Directory
 * 
 * Questo esempio mostra come leggere il contenuto di una directory
 * usando readdir() e come ottenere informazioni dettagliate sui file.
 * 
 * FUNZIONALITÀ:
 * - Elencare file e cartelle
 * - Ottenere informazioni dettagliate (dimensione, data, tipo)
 * - Lettura ricorsiva di directory
 * - Filtrare file per estensione
 */

const fs = require('fs');
const path = require('path');

// ============================================
// METODO 1: SINCRONO
// ============================================
console.log('=== LETTURA DIRECTORY SINCRONA ===');
try {
  // readdir() restituisce un array con i nomi dei file e directory
  const files = fs.readdirSync('.');
  
  console.log('Contenuto della directory corrente:');
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
  
} catch (err) {
  console.error('Errore:', err.message);
}

// ============================================
// METODO 2: ASINCRONO CON CALLBACK
// ============================================
console.log('\n=== LETTURA DIRECTORY ASINCRONA CON CALLBACK ===');

fs.readdir('.', (err, files) => {
  if (err) {
    console.error('Errore:', err.message);
    return;
  }
  
  console.log(`Trovati ${files.length} elementi nella directory:`);
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
});

// ============================================
// METODO 3: ASINCRONO CON PROMISE
// ============================================
console.log('\n=== LETTURA DIRECTORY CON PROMISE ===');

async function leggiDirectory(dirPath) {
  try {
    const files = await fs.promises.readdir(dirPath);
    
    console.log(`\nDirectory: ${dirPath}`);
    console.log(`Elementi trovati: ${files.length}`);
    files.forEach(file => {
      console.log(`  - ${file}`);
    });
    
    return files;
    
  } catch (err) {
    console.error('Errore:', err.message);
    return [];
  }
}

leggiDirectory('.');

// ============================================
// LETTURA CON INFORMAZIONI DETTAGLIATE
// ============================================
/**
 * Legge una directory e restituisce informazioni dettagliate su ogni elemento
 * @param {string} dirPath - Percorso della directory
 */
async function leggiDirectoryDettagliata(dirPath) {
  console.log(`\n=== DETTAGLI DIRECTORY: ${dirPath} ===`);
  
  try {
    // Leggi i nomi dei file
    const files = await fs.promises.readdir(dirPath);
    
    // Per ogni file, ottieni le statistiche
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      
      try {
        const stats = await fs.promises.stat(filePath);
        
        // Determina il tipo
        const tipo = stats.isDirectory() ? 'DIR' : 'FILE';
        
        // Formatta la dimensione
        const dimensione = stats.isDirectory() ? '-' : formatDimensione(stats.size);
        
        // Formatta la data di modifica
        const dataModifica = stats.mtime.toLocaleDateString('it-IT');
        
        console.log(`[${tipo}] ${file.padEnd(30)} ${dimensione.padEnd(10)} ${dataModifica}`);
        
      } catch (err) {
        console.error(`Errore con ${file}:`, err.message);
      }
    }
    
  } catch (err) {
    console.error('Errore nella lettura della directory:', err.message);
  }
}

/**
 * Formatta la dimensione del file in modo leggibile
 * @param {number} bytes - Dimensione in byte
 * @returns {string} - Dimensione formattata (es. "1.5 MB")
 */
function formatDimensione(bytes) {
  const unita = ['B', 'KB', 'MB', 'GB'];
  let dimensione = bytes;
  let unitaIndex = 0;
  
  while (dimensione >= 1024 && unitaIndex < unita.length - 1) {
    dimensione /= 1024;
    unitaIndex++;
  }
  
  return `${dimensione.toFixed(2)} ${unita[unitaIndex]}`;
}

leggiDirectoryDettagliata('.');

// ============================================
// LETTURA CON WITHFILETYPES
// ============================================
/**
 * readdir() con opzione withFileTypes restituisce oggetti Dirent
 * che includono già informazioni sul tipo di elemento
 */
async function leggiConTipi(dirPath) {
  console.log(`\n=== LETTURA CON withFileTypes: ${dirPath} ===`);
  
  try {
    // withFileTypes: true restituisce oggetti Dirent invece di stringhe
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    // Separa file e directory
    const directories = entries.filter(entry => entry.isDirectory());
    const files = entries.filter(entry => entry.isFile());
    
    console.log(`\nDirectory (${directories.length}):`);
    directories.forEach(dir => console.log(`  📁 ${dir.name}`));
    
    console.log(`\nFile (${files.length}):`);
    files.forEach(file => console.log(`  📄 ${file.name}`));
    
  } catch (err) {
    console.error('Errore:', err.message);
  }
}

leggiConTipi('.');

// ============================================
// FILTRAGGIO FILE PER ESTENSIONE
// ============================================
/**
 * Trova tutti i file con una specifica estensione
 * @param {string} dirPath - Directory da cercare
 * @param {string} extension - Estensione da cercare (es. '.js', '.txt')
 */
async function trovaFilePerEstensione(dirPath, extension) {
  console.log(`\n=== FILE CON ESTENSIONE ${extension} in ${dirPath} ===`);
  
  try {
    const files = await fs.promises.readdir(dirPath);
    
    // Filtra i file con l'estensione richiesta
    const filesFiltrati = files.filter(file => path.extname(file) === extension);
    
    console.log(`Trovati ${filesFiltrati.length} file:`);
    filesFiltrati.forEach(file => console.log(`  - ${file}`));
    
    return filesFiltrati;
    
  } catch (err) {
    console.error('Errore:', err.message);
    return [];
  }
}

trovaFilePerEstensione('.', '.js');
trovaFilePerEstensione('.', '.md');

// ============================================
// LETTURA RICORSIVA (TRAVERSAL)
// ============================================
/**
 * Legge ricorsivamente tutte le directory e sottodirectory
 * @param {string} dirPath - Directory di partenza
 * @param {number} level - Livello di profondità (per indentazione)
 */
async function leggiDirectoryRicorsiva(dirPath, level = 0) {
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const indent = '  '.repeat(level);
      
      if (entry.isDirectory()) {
        console.log(`${indent}📁 ${entry.name}/`);
        // Ricorsione nelle sottodirectory
        await leggiDirectoryRicorsiva(fullPath, level + 1);
      } else {
        console.log(`${indent}📄 ${entry.name}`);
      }
    }
    
  } catch (err) {
    console.error('Errore:', err.message);
  }
}

// Test della lettura ricorsiva
async function testLetturaRicorsiva() {
  console.log('\n=== ALBERO DIRECTORY RICORSIVO ===');
  
  // Crea una struttura di test
  await fs.promises.mkdir('test-dir/sub1/sub2', { recursive: true });
  await fs.promises.mkdir('test-dir/sub3', { recursive: true });
  await fs.promises.writeFile('test-dir/file1.txt', 'contenuto');
  await fs.promises.writeFile('test-dir/sub1/file2.txt', 'contenuto');
  await fs.promises.writeFile('test-dir/sub1/sub2/file3.txt', 'contenuto');
  
  console.log('test-dir/');
  await leggiDirectoryRicorsiva('test-dir', 1);
  
  // Pulizia
  setTimeout(async () => {
    await fs.promises.rm('test-dir', { recursive: true, force: true });
  }, 3000);
}

testLetturaRicorsiva();

// ============================================
// ESEMPIO PRATICO: FILE TREE CON STATISTICHE
// ============================================
/**
 * Genera un report completo di una directory con statistiche
 */
async function analizzaDirectory(dirPath) {
  console.log(`\n=== ANALISI COMPLETA DIRECTORY: ${dirPath} ===`);
  
  let totalFiles = 0;
  let totalDirs = 0;
  let totalSize = 0;
  const extensions = {};
  
  async function analizza(currentPath) {
    const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        totalDirs++;
        await analizza(fullPath); // Ricorsione
      } else {
        totalFiles++;
        
        const stats = await fs.promises.stat(fullPath);
        totalSize += stats.size;
        
        const ext = path.extname(entry.name) || '[nessuna estensione]';
        extensions[ext] = (extensions[ext] || 0) + 1;
      }
    }
  }
  
  try {
    await analizza(dirPath);
    
    console.log('\nRISULTATI:');
    console.log(`  Total Directory: ${totalDirs}`);
    console.log(`  Totale File: ${totalFiles}`);
    console.log(`  Dimensione Totale: ${formatDimensione(totalSize)}`);
    console.log('\n  File per Estensione:');
    
    Object.entries(extensions)
      .sort((a, b) => b[1] - a[1]) // Ordina per numero di file
      .forEach(([ext, count]) => {
        console.log(`    ${ext}: ${count}`);
      });
    
  } catch (err) {
    console.error('Errore nell\'analisi:', err.message);
  }
}

analizzaDirectory('.');
