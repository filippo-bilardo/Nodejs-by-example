# ES-ZLIB-01: Compressione Stringa

## 📋 Informazioni Generali

- **Modulo**: Zlib
- **Difficoltà**: 🟢 Facile
- **Tempo stimato**: 20 minuti
- **Prerequisiti**: 
  - Comprensione base di compressione dati
  - Familiarità con Buffer

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Comprimere stringhe con gzip
2. Decomprimere dati compressi
3. Misurare il rapporto di compressione
4. Usare callback con metodi Zlib

## 📝 Descrizione

Comprimi una stringa lunga usando gzip e misura quanto spazio risparmi. Poi decomprimi e verifica che i dati originali siano intatti.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-zlib-01`
- [ ] Crea file `compress-string.js`
- [ ] Prepara stringa di test (>1000 caratteri)

### 2. Compressione
- [ ] Comprimi stringa con `zlib.gzip()`
- [ ] Misura dimensione prima e dopo
- [ ] Calcola rapporto di compressione

### 3. Decompressione
- [ ] Decomprimi con `zlib.gunzip()`
- [ ] Verifica che sia identica all'originale

### 4. Output
- [ ] Mostra dimensioni e percentuale risparmio
- [ ] Formatta output in modo leggibile

## 💡 Template di Partenza

```javascript
// compress-string.js
const zlib = require('zlib');

// Crea una stringa ripetitiva (si comprime bene)
const originalString = 'Lorem ipsum dolor sit amet, '.repeat(100);

console.log('=== Test Compressione Gzip ===\n');

// TODO: Comprimi la stringa

// TODO: Decomprimi

// TODO: Mostra risultati
```

## 📚 Concetti Chiave

### zlib.gzip()
```javascript
zlib.gzip(buffer, (err, compressed) => {
  if (err) throw err;
  // compressed è un Buffer
});
```

### zlib.gunzip()
```javascript
zlib.gunzip(compressed, (err, decompressed) => {
  if (err) throw err;
  // decompressed è un Buffer
});
```

### Buffer.byteLength
```javascript
const size = Buffer.byteLength(string, 'utf8');
```

### Rapporto di Compressione
```javascript
const ratio = (compressed / original) * 100;
const saved = 100 - ratio;
```

## 🔍 Soluzione Completa

```javascript
const zlib = require('zlib');

// Crea stringa di test (ripetitiva si comprime meglio)
const originalString = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in.
`.repeat(50);  // Ripeti 50 volte

console.log('=== Compressione Gzip ===\n');

// Dimensione originale
const originalSize = Buffer.byteLength(originalString, 'utf8');
console.log('📝 Stringa originale:');
console.log(`   Lunghezza: ${originalString.length} caratteri`);
console.log(`   Dimensione: ${originalSize} byte (${(originalSize / 1024).toFixed(2)} KB)`);
console.log(`   Anteprima: "${originalString.substring(0, 80)}..."\n`);

// Comprimi
console.log('🔄 Compressione in corso...');
zlib.gzip(originalString, (err, compressed) => {
  if (err) {
    console.error('❌ Errore compressione:', err);
    return;
  }
  
  const compressedSize = compressed.length;
  const ratio = (compressedSize / originalSize) * 100;
  const saved = originalSize - compressedSize;
  const savedPercent = 100 - ratio;
  
  console.log('✅ Compressione completata!\n');
  console.log('📦 Dati compressi:');
  console.log(`   Dimensione: ${compressedSize} byte (${(compressedSize / 1024).toFixed(2)} KB)`);
  console.log(`   Rapporto: ${ratio.toFixed(2)}%`);
  console.log(`   Risparmio: ${saved} byte (${savedPercent.toFixed(2)}%)`);
  console.log(`   Anteprima hex: ${compressed.toString('hex').substring(0, 40)}...\n`);
  
  // Decomprimi
  console.log('🔄 Decompressione in corso...');
  zlib.gunzip(compressed, (err, decompressed) => {
    if (err) {
      console.error('❌ Errore decompressione:', err);
      return;
    }
    
    const decompressedString = decompressed.toString('utf8');
    const decompressedSize = decompressed.length;
    
    console.log('✅ Decompressione completata!\n');
    console.log('📄 Dati decompressi:');
    console.log(`   Dimensione: ${decompressedSize} byte`);
    console.log(`   Anteprima: "${decompressedString.substring(0, 80)}..."\n`);
    
    // Verifica integrità
    console.log('🔍 Verifica integrità:');
    console.log(`   Dimensioni corrispondono? ${decompressedSize === originalSize ? '✅ SI' : '❌ NO'}`);
    console.log(`   Contenuto identico? ${decompressedString === originalString ? '✅ SI' : '❌ NO'}`);
    
    // Riepilogo
    console.log('\n' + '='.repeat(60));
    console.log('📊 RIEPILOGO');
    console.log('='.repeat(60));
    console.log(`Originale:    ${originalSize} byte`);
    console.log(`Compresso:    ${compressedSize} byte (-${savedPercent.toFixed(1)}%)`);
    console.log(`Decompresso:  ${decompressedSize} byte`);
    console.log('='.repeat(60));
  });
});
```

## 🎓 Suggerimenti

1. **Testo ripetitivo**: Si comprime meglio del testo casuale
2. **Buffer vs String**: Zlib lavora con Buffer, converti stringhe prima
3. **Overhead**: File molto piccoli potrebbero aumentare di dimensione
4. **Encoding**: Ricorda di specificare 'utf8' quando converti in stringa
5. **Async**: Zlib è asincrono di default (esiste anche versione sync)

## ✅ Criteri di Valutazione

- [ ] La stringa viene compressa correttamente
- [ ] Il rapporto di compressione è calcolato
- [ ] La decompressione ripristina l'originale
- [ ] Le dimensioni sono mostrate chiaramente
- [ ] Le percentuali di risparmio sono accurate

## 🚀 Sfide Extra (Opzionali)

1. **Sync version**: Riscrivi usando `gzipSync()` e `gunzipSync()`
2. **Promise version**: Usa `util.promisify()` per versione Promise
3. **Algoritmi diversi**: Prova deflate e brotli
4. **Tipi di testo**: Compara compressione di testo ripetitivo vs casuale
5. **Livelli compressione**: Testa diversi livelli (0-9)
6. **Benchmark**: Misura tempo di compressione/decompressione
7. **File compression**: Estendi per comprimere file interi

## 📖 Esempio con Diversi Livelli

```javascript
const zlib = require('zlib');

const data = 'Test '.repeat(1000);
const levels = [0, 1, 5, 9];  // 0=no compression, 9=max

console.log('Confronto livelli di compressione:\n');

levels.forEach(level => {
  const options = level: level };
  
  zlib.gzip(data, options, (err, compressed) => {
    if (err) throw err;
    
    const ratio = (compressed.length / Buffer.byteLength(data)) * 100;
    console.log(`Livello ${level}: ${compressed.length} byte (${ratio.toFixed(2)}%)`);
  });
});
```

## 📖 Esempio Promise-based

```javascript
const zlib = require('zlib');
const util = require('util');

const gzip = util.promisify(zlib.gzip);
const gunzip = util.promisify(zlib.gunzip);

async function compressAndDecompress(text) {
  try {
    // Comprimi
    const compressed = await gzip(text);
    console.log(`Compressed: ${compressed.length} byte`);
    
    // Decomprimi
    const decompressed = await gunzip(compressed);
    const result = decompressed.toString();
    
    console.log(`Match: ${result === text}`);
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

compressAndDecompress('Hello '.repeat(100));
```

## 🐛 Problemi Comuni

### Compressed data bigger than original
**Causa**: Dati troppo piccoli o già compressi  
**Effetto**: Normale, overhead dell'algoritmo
**Soluzione**: Comprimi solo dati >1KB

### Invalid or incomplete deflate data
**Causa**: Dati corrotti o incompleti  
**Soluzione**: Verifica che i dati compressi siano integri

### String vs Buffer confusion
**Causa**: Passare stringa invece di Buffer  
**Soluzione**: Zlib accetta sia String che Buffer in input

### Decompressed text has weird characters
**Causa**: Encoding sbagliato in toString()  
**Soluzione**: Usa `.toString('utf8')`

## 📖 Risorse Utili

- [zlib module documentation](https://nodejs.org/api/zlib.html)
- [Gzip compression explained](https://en.wikipedia.org/wiki/Gzip)
- [Deflate algorithm](https://en.wikipedia.org/wiki/Deflate)
- [Compression ratios](https://en.wikipedia.org/wiki/Data_compression_ratio)
