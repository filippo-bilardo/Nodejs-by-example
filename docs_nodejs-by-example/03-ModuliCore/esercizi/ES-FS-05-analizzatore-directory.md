# ES-FS-05: Analizzatore di Directory

## 📋 Informazioni Generali

- **Modulo**: File System (fs)
- **Difficoltà**: 🔴 Avanzato
- **Tempo stimato**: 90 minuti
- **Prerequisiti**: 
  - Completamento ES-FS-01, ES-FS-02, ES-FS-03
  - Comprensione della ricorsione
  - Conoscenza di strutture dati (Map, Array)
  - Familiarità con sorting e aggregazione dati

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Scansionare ricorsivamente directory complesse
2. Aggregare e analizzare dati da file system
3. Calcolare statistiche (dimensioni, conteggi, classificazioni)
4. Generare report in formato JSON
5. Gestire grandi quantità di file in modo efficiente
6. Implementare sorting e ranking di dati

## 📝 Descrizione

Crea un tool da command-line che analizza una directory e genera un report completo con:
- Numero totale di file e cartelle
- Dimensione totale occupata
- Classificazione per tipo di file (estensione)
- Top 5 file più grandi
- Statistiche per tipo
- Esportazione report in JSON

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-fs-05`
- [ ] Crea file `analyzer.js`
- [ ] Prepara directory di test con vari file

### 2. Funzione Scansione
- [ ] Implementa scansione ricorsiva
- [ ] Raccogli dati per ogni file trovato:
  - Percorso completo
  - Nome file
  - Estensione
  - Dimensione
  - Se è file o directory

### 3. Aggregazione Dati
- [ ] Conta file e directory
- [ ] Somma dimensioni totali
- [ ] Classifica per estensione
- [ ] Identifica i file più grandi
- [ ] Calcola statistiche per tipo

### 4. Report Generation
- [ ] Formatta i dati in struttura leggibile
- [ ] Genera report testuale per console
- [ ] Esporta report completo in JSON
- [ ] Formatta dimensioni in modo human-readable (KB, MB, GB)

### 5. CLI Interface
- [ ] Accetta directory come parametro (process.argv)
- [ ] Mostra progress durante la scansione
- [ ] Gestisci errori e permessi negati

## 💡 Template di Partenza

```javascript
// analyzer.js
const fs = require('fs');
const path = require('path');

class DirectoryAnalyzer {
  constructor() {
    this.stats = {
      totalFiles: 0,
      totalDirs: 0,
      totalSize: 0,
      byExtension: new Map(),
      largestFiles: []
    };
  }

  /**
   * Scansiona ricorsivamente una directory
   * @param {string} dirPath - Percorso directory da analizzare
   */
  async scan(dirPath) {
    // TODO: Implementa scansione ricorsiva
  }

  /**
   * Genera report formattato
   * @returns {object} Report completo
   */
  generateReport() {
    // TODO: Genera report
  }

  /**
   * Salva report in file JSON
   * @param {string} outputPath - Percorso file output
   */
  saveReport(outputPath) {
    // TODO: Salva in JSON
  }

  /**
   * Formatta bytes in formato human-readable
   * @param {number} bytes
   * @returns {string}
   */
  formatSize(bytes) {
    // TODO: Converti in KB/MB/GB
  }
}

// Main
const targetDir = process.argv[2] || '.';

console.log(`Analizzando: ${targetDir}...\n`);

const analyzer = new DirectoryAnalyzer();
// TODO: Implementa analisi e report
```

## 📚 Concetti Chiave

### fs.stat() per Dimensioni File
```javascript
const stats = fs.statSync(filePath);
const sizeInBytes = stats.size;
```

### Estrazione Estensione
```javascript
const extension = path.extname(filename); // '.txt', '.js', etc.
```

### Map per Aggregazione
```javascript
const byExt = new Map();
byExt.set('.txt', { count: 5, size: 1024 });
```

### Sorting Array di Oggetti
```javascript
files.sort((a, b) => b.size - a.size); // Ordinamento decrescente
```

## 🔍 Step by Step

### Step 1: Implementa formatSize()
```javascript
formatSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + units[i];
}
```

### Step 2: Implementa scansione file
```javascript
scanFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase() || '.no-ext';
    
    this.stats.totalFiles++;
    this.stats.totalSize += stats.size;
    
    // Aggrega per estensione
    if (!this.stats.byExtension.has(ext)) {
      this.stats.byExtension.set(ext, { count: 0, size: 0, files: [] });
    }
    
    const extData = this.stats.byExtension.get(ext);
    extData.count++;
    extData.size += stats.size;
    extData.files.push({
      path: filePath,
      name: path.basename(filePath),
      size: stats.size
    });
    
    // Aggiungi ai file più grandi
    this.stats.largestFiles.push({
      path: filePath,
      name: path.basename(filePath),
      size: stats.size
    });
    
  } catch (err) {
    console.error(`Errore lettura ${filePath}:`, err.message);
  }
}
```

### Step 3: Implementa scansione ricorsiva
```javascript
scan(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      
      try {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          this.stats.totalDirs++;
          // Ricorsione
          this.scan(fullPath);
        } else if (stats.isFile()) {
          this.scanFile(fullPath);
        }
      } catch (err) {
        // Ignora file senza permessi
        console.error(`Saltato ${fullPath}: ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`Errore scansione ${dirPath}:`, err.message);
  }
}
```

### Step 4: Genera report
```javascript
generateReport() {
  // Ordina file più grandi
  this.stats.largestFiles.sort((a, b) => b.size - a.size);
  const top5 = this.stats.largestFiles.slice(0, 5);
  
  // Converti Map in oggetto
  const byExtension = {};
  for (const [ext, data] of this.stats.byExtension.entries()) {
    byExtension[ext] = {
      count: data.count,
      totalSize: data.size,
      formattedSize: this.formatSize(data.size),
      averageSize: this.formatSize(data.size / data.count)
    };
  }
  
  return {
    summary: {
      totalFiles: this.stats.totalFiles,
      totalDirectories: this.stats.totalDirs,
      totalSize: this.stats.totalSize,
      formattedSize: this.formatSize(this.stats.totalSize)
    },
    byExtension: byExtension,
    largestFiles: top5.map(f => ({
      name: f.name,
      path: f.path,
      size: f.size,
      formattedSize: this.formatSize(f.size)
    }))
  };
}
```

### Step 5: Main execution
```javascript
// Main
const targetDir = process.argv[2] || '.';

if (!fs.existsSync(targetDir)) {
  console.error(`Errore: Directory '${targetDir}' non trovata`);
  process.exit(1);
}

console.log(`📊 Analizzando: ${targetDir}...\n`);

const analyzer = new DirectoryAnalyzer();
analyzer.scan(targetDir);

const report = analyzer.generateReport();

// Stampa report in console
console.log('='.repeat(60));
console.log('📋 REPORT ANALISI DIRECTORY');
console.log('='.repeat(60));
console.log(`\n📁 Riepilogo:`);
console.log(`   File totali: ${report.summary.totalFiles}`);
console.log(`   Directory totali: ${report.summary.totalDirectories}`);
console.log(`   Dimensione totale: ${report.summary.formattedSize}`);

console.log(`\n📊 Per Estensione:`);
const sortedExt = Object.entries(report.byExtension)
  .sort((a, b) => b[1].totalSize - a[1].totalSize);

sortedExt.forEach(([ext, data]) => {
  console.log(`   ${ext.padEnd(10)} - ${data.count} file - ${data.formattedSize} totali - ${data.averageSize} media`);
});

console.log(`\n🏆 Top 5 File Più Grandi:`);
report.largestFiles.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file.name}`);
  console.log(`      ${file.formattedSize} - ${file.path}`);
});

// Salva report JSON
const outputFile = 'directory-report.json';
analyzer.saveReport(outputFile);
console.log(`\n💾 Report completo salvato in: ${outputFile}`);
```

## 🎓 Suggerimenti

1. **Gestione errori**: Usa try-catch per ogni read operation, alcuni file potrebbero non essere accessibili
2. **Performance**: Per directory molto grandi, considera l'uso di stream o Promise.all per operazioni parallele
3. **Memory**: Non caricare tutto in memoria; se troppi file, usa statistiche aggregate
4. **Progress**: Per directory grandi, mostra un indicatore di progresso
5. **Symlinks**: Gestisci symlinks per evitare loop infiniti

## ✅ Criteri di Valutazione

- [ ] La scansione è ricorsiva e completa
- [ ] Le statistiche sono accurate
- [ ] Il report JSON è ben formato
- [ ] Le dimensioni sono formattate correttamente (KB/MB/GB)
- [ ] I top 5 file più grandi sono identificati correttamente
- [ ] La classificazione per estensione funziona
- [ ] Gli errori sono gestiti senza crash
- [ ] L'output è leggibile e ben formattato

## 🚀 Sfide Extra (Opzionali)

1. **Grafici ASCII**: Crea bar chart testuali per visualizzare distribuzione per estensione
2. **Duplicati**: Identifica file duplicati usando hash MD5/SHA256
3. **File vecchi**: Trova file non modificati da più di 1 anno
4. **Confronto directory**: Compara due directory e mostra differenze
5. **File nascosti**: Opzione per includere/escludere file nascosti (.*prefix)
6. **Export formati**: Supporta export in CSV, HTML, Markdown oltre a JSON
7. **Filtering**: Aggiungi filtri per estensione, dimensione, data
8. **Tree visualization**: Mostra struttura ad albero della directory
9. **Performance metrics**: Misura e riporta tempo di esecuzione
10. **Interactive mode**: Modalità interattiva dove l'utente può navigare i risultati

## 📖 Esempio Output

```
============================================================
📋 REPORT ANALISI DIRECTORY
============================================================

📁 Riepilogo:
   File totali: 1543
   Directory totali: 87
   Dimensione totale: 245.67 MB

📊 Per Estensione:
   .js        - 456 file - 89.32 MB totali - 200.53 KB media
   .json      - 234 file - 45.12 MB totali - 197.52 KB media
   .md        - 89 file - 12.45 MB totali - 143.26 KB media
   .txt       - 156 file - 5.67 MB totali - 37.22 KB media
   .no-ext    - 12 file - 234.56 KB totali - 19.55 KB media

🏆 Top 5 File Più Grandi:
   1. bundle.js
      15.67 MB - /path/to/dist/bundle.js
   2. database.sqlite
      12.34 MB - /path/to/data/database.sqlite
   3. video.mp4
      8.92 MB - /path/to/media/video.mp4
   4. archive.zip
      6.78 MB - /path/to/backups/archive.zip
   5. large-file.json
      4.56 MB - /path/to/data/large-file.json

💾 Report completo salvato in: directory-report.json
```

## 🐛 Problemi Comuni

### Stack overflow con directory profonde
**Causa**: Troppe chiamate ricorsive  
**Soluzione**: Usa iterazione con stack/queue invece di ricorsione

### Permessi negati causano crash
**Causa**: Mancanza di try-catch  
**Soluzione**: Avvolgi ogni fs operation in try-catch

### Loop infiniti con symlinks
**Causa**: Symlink che punta a directory parent  
**Soluzione**: Traccia directory visitate o usa fs.lstat() invece di fs.stat()

### Out of memory con molti file
**Causa**: Tutti i file caricati nell'array largestFiles  
**Soluzione**: Mantieni solo top N file, scarta i più piccoli

## 📖 Risorse Utili

- [fs module documentation](https://nodejs.org/api/fs.html)
- [path module documentation](https://nodejs.org/api/path.html)
- [Working with file stats](https://nodejs.org/api/fs.html#class-fsstats)
- [Recursive directory traversal](https://nodejs.dev/learn/the-nodejs-fs-module)
