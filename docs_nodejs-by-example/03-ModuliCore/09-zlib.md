# Modulo Zlib - Compressione e Decompressione

## 📋 Indice

- [Introduzione](#introduzione)
- [Algoritmi di Compressione](#algoritmi-di-compressione)
- [Compressione Base](#compressione-base)
- [Compressione File con Stream](#compressione-file-con-stream)
- [Analisi Compressione](#analisi-compressione)
- [Opzioni Avanzate](#opzioni-avanzate)
- [Best Practices](#best-practices)
- [Risorse Utili](#risorse-utili)

---

## Introduzione

Il modulo `zlib` fornisce funzionalità di **compressione e decompressione** implementando **Gzip, Deflate/Inflate e Brotli**.

### 🎯 Quando Usare

- **HTTP Response Compression**: Ridurre bandwidth
- **File Storage**: Ridurre spazio disco
- **Backup**: Comprimere archivi
- **API Payloads**: Ridurre latenza
- **Log Files**: Comprimere log storici

### 📦 Importazione

```javascript
const zlib = require('zlib');
const fs = require('fs');
const { pipeline } = require('stream');
```

---

## Algoritmi di Compressione

### 📊 Confronto Algoritmi

| Algoritmo | Ratio | Velocità | CPU | Uso |
|-----------|-------|----------|-----|-----|
| **Deflate** | Buono | Veloce | Basso | Generale |
| **Gzip** | Buono | Veloce | Basso | **HTTP, file** |
| **Brotli** | Ottimo | Lento | Alto | **Static assets** |

### 🔄 Metodi Disponibili

```javascript
// Gzip
zlib.gzip(buffer, callback);              // Compress
zlib.gunzip(buffer, callback);            // Decompress
zlib.gzipSync(buffer);                    // Sync compress
zlib.gunzipSync(buffer);                  // Sync decompress
zlib.createGzip(options);                 // Stream compress
zlib.createGunzip(options);               // Stream decompress

// Deflate
zlib.deflate(buffer, callback);
zlib.inflate(buffer, callback);
zlib.deflateSync(buffer);
zlib.inflateSync(buffer);
zlib.createDeflate(options);
zlib.createInflate(options);

// Deflate Raw
zlib.deflateRaw(buffer, callback);
zlib.inflateRaw(buffer, callback);
zlib.createDeflateRaw(options);
zlib.createInflateRaw(options);

// Brotli (Node 11.7+)
zlib.brotliCompress(buffer, callback);
zlib.brotliDecompress(buffer, callback);
zlib.brotliCompressSync(buffer);
zlib.brotliDecompressSync(buffer);
zlib.createBrotliCompress(options);
zlib.createBrotliDecompress(options);
```

---

## Compressione Base

### 💻 Async Examples

```javascript
const zlib = require('zlib');

// ==== GZIP ====

const input = 'Questo è un testo di esempio per la compressione. '.repeat(10);

// Compressione async
zlib.gzip(input, (err, compressed) => {
  if (err) throw err;
  
  console.log('Dimensione originale:', input.length, 'byte');
  console.log('Dimensione compressa:', compressed.length, 'byte');
  console.log('Rapporto:', (compressed.length / input.length * 100).toFixed(2) + '%');
  
  // Decompressione
  zlib.gunzip(compressed, (err, decompressed) => {
    if (err) throw err;
    console.log('Testo decompresso:', decompressed.toString());
    console.log('Match:', input === decompressed.toString());
  });
});

// ==== DEFLATE ====

zlib.deflate(input, (err, deflated) => {
  if (err) throw err;
  
  console.log('\nDeflate size:', deflated.length, 'byte');
  
  zlib.inflate(deflated, (err, inflated) => {
    if (err) throw err;
    console.log('Inflated match:', input === inflated.toString());
  });
});

// ==== BROTLI ====

zlib.brotliCompress(input, (err, brotli) => {
  if (err) throw err;
  
  console.log('\nBrotli size:', brotli.length, 'byte');
  
  zlib.brotliDecompress(brotli, (err, decoded) => {
    if (err) throw err;
    console.log('Brotli match:', input === decoded.toString());
  });
});
```

### ⚡ Sync Examples

```javascript
const zlib = require('zlib');

const input = 'Testo da comprimere';

// Sync compression (blocca event loop!)
const compressed = zlib.gzipSync(input);
console.log('Compressed:', compressed.length, 'byte');

// Sync decompression
const decompressed = zlib.gunzipSync(compressed);
console.log('Decompressed:', decompressed.toString());

// ⚠️ Usa sync solo per:
// - Startup initialization
// - Small data
// - Build scripts
// ❌ MAI in request handlers!
```

---

## Compressione File con Stream

### 📁 Compress/Decompress Files

```javascript
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream');

// ==== COMPRESS FILE ====

function compressFile(inputFile, outputFile, callback) {
  const gzip = zlib.createGzip({ level: 9 }); // Max compression
  
  pipeline(
    fs.createReadStream(inputFile),
    gzip,
    fs.createWriteStream(outputFile),
    (err) => {
      if (err) {
        console.error('Errore compressione:', err);
        callback(err);
      } else {
        console.log(`✅ File compresso: ${inputFile} → ${outputFile}`);
        callback(null);
      }
    }
  );
}

// ==== DECOMPRESS FILE ====

function decompressFile(inputFile, outputFile, callback) {
  const gunzip = zlib.createGunzip();
  
  pipeline(
    fs.createReadStream(inputFile),
    gunzip,
    fs.createWriteStream(outputFile),
    (err) => {
      if (err) {
        console.error('Errore decompressione:', err);
        callback(err);
      } else {
        console.log(`✅ File decompresso: ${inputFile} → ${outputFile}`);
        callback(null);
      }
    }
  );
}

// ==== PROMISE VERSION ====

const util = require('util');
const pipelinePromise = util.promisify(pipeline);

async function compressFileAsync(inputFile, outputFile) {
  await pipelinePromise(
    fs.createReadStream(inputFile),
    zlib.createGzip({ level: 9 }),
    fs.createWriteStream(outputFile)
  );
  console.log(`✅ Compressed: ${inputFile} → ${outputFile}`);
}

async function decompressFileAsync(inputFile, outputFile) {
  await pipelinePromise(
    fs.createReadStream(inputFile),
    zlib.createGunzip(),
    fs.createWriteStream(outputFile)
  );
  console.log(`✅ Decompressed: ${inputFile} → ${outputFile}`);
}
```

### 📊 Compression Analyzer

```javascript
const zlib = require('zlib');
const fs = require('fs').promises;

class CompressionAnalyzer {
  static async analyzeFile(filePath) {
    try {
      const originalData = await fs.readFile(filePath);
      const originalSize = originalData.length;

      // Test tutti gli algoritmi
      const gzipCompressed = zlib.gzipSync(originalData, { level: 9 });
      const deflateCompressed = zlib.deflateSync(originalData, { level: 9 });
      const brotliCompressed = zlib.brotliCompressSync(originalData);

      return {
        file: filePath,
        originalSize,
        gzip: this.getStats(originalSize, gzipCompressed.length),
        deflate: this.getStats(originalSize, deflateCompressed.length),
        brotli: this.getStats(originalSize, brotliCompressed.length)
      };
    } catch (error) {
      throw new Error(`Analysis error: ${error.message}`);
    }
  }

  static getStats(orig, compressed) {
    return {
      size: compressed,
      ratio: (compressed / orig * 100).toFixed(2) + '%',
      savings: ((orig - compressed) / orig * 100).toFixed(2) + '%',
      reduction: orig - compressed
    };
  }

  static printAnalysis(analysis) {
    console.log('\n=== COMPRESSION ANALYSIS ===');
    console.log(`File: ${analysis.file}`);
    console.log(`Original size: ${analysis.originalSize} byte`);
    console.log('\nResults:');
    
    ['gzip', 'deflate', 'brotli'].forEach(algo => {
      const data = analysis[algo];
      console.log(`\n${algo.toUpperCase()}:`);
      console.log(`  Size: ${data.size} byte`);
      console.log(`  Ratio: ${data.ratio}`);
      console.log(`  Savings: ${data.savings}`);
      console.log(`  Reduction: ${data.reduction} byte`);
    });

    // Trova migliore
    const algorithms = ['gzip', 'deflate', 'brotli'];
    const best = algorithms.reduce((best, current) => {
      return analysis[current].size < analysis[best].size ? current : best;
    });

    console.log(`\n🏆 Best algorithm: ${best.toUpperCase()}`);
  }
}
```

---

## Best Practices

### ✅ Do

1. **Usa Stream** per file grandi
2. **Level 6** è buon compromesso speed/ratio
3. **Brotli per static assets** (CSS, JS, HTML)
4. **Gzip per data dinamici** (API responses)
5. **Cache compressed files** quando possibile

### ❌ Don't

1. ❌ Non comprimere file già compressi (jpg, mp4, zip)
2. ❌ Non usare sync in request handlers
3. ❌ Non comprimere file molto piccoli (<1KB)
4. ❌ Non usare level 9 per tutto (troppo lento)
5. ❌ Non dimenticare error handling con stream

### 🚀 HTTP Compression

```javascript
const http = require('http');
const zlib = require('zlib');

const server = http.createServer((req, res) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  const data = JSON.stringify({ hello: 'world', data: 'x'.repeat(1000) });
  
  if (acceptEncoding.includes('br')) {
    // Brotli (best)
    res.writeHead(200, {
      'Content-Encoding': 'br',
      'Content-Type': 'application/json'
    });
    zlib.brotliCompress(data, (err, result) => {
      res.end(result);
    });
  } else if (acceptEncoding.includes('gzip')) {
    // Gzip (good)
    res.writeHead(200, {
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/json'
    });
    zlib.gzip(data, (err, result) => {
      res.end(result);
    });
  } else {
    // No compression
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  }
});

server.listen(3000);
```

---

## Risorse Utili

### 📚 Documentazione

- [Node.js Zlib Module](https://nodejs.org/api/zlib.html)
- [Gzip Format](https://www.gnu.org/software/gzip/manual/gzip.html)
- [Brotli Compression](https://github.com/google/brotli)

### 🛠️ Librerie

- [compression](https://www.npmjs.com/package/compression) - Express middleware
- [tar](https://www.npmjs.com/package/tar) - Tar + Gzip

---

**💡 Tip**: Compression può ridurre bandwidth del **70-90%** per text files!
