# ES-BUFFER-01: Conversioni Base

## 📋 Informazioni Generali

- **Modulo**: Buffer
- **Difficoltà**: 🟢 Facile
- **Tempo stimato**: 20 minuti
- **Prerequisiti**: 
  - Comprensione di dati binari
  - Conoscenza di encoding (UTF-8, Base64, Hex)

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Creare Buffer da stringhe
2. Convertire tra diversi encoding (UTF-8, Base64, Hex)
3. Riconvertire Buffer in stringhe
4. Comprendere quando i dati sono equivalenti nonostante encoding diversi

## 📝 Descrizione

Sperimenta con le conversioni tra Buffer e stringhe usando diversi encoding. Dimostra che la stessa informazione può essere rappresentata in modi diversi (UTF-8, Base64, Hex) ma rimane equivalente.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-buffer-01`
- [ ] Crea file `conversions.js`

### 2. Conversioni
- [ ] Crea Buffer da stringa UTF-8
- [ ] Converti Buffer in Base64
- [ ] Converti Buffer in Esadecimale
- [ ] Riconverti tutti i formati in stringa UTF-8
- [ ] Verifica che il testo finale sia identico

### 3. Confronti
- [ ] Confronta dimensioni dei diversi encoding
- [ ] Mostra vantaggi/svantaggi di ogni formato

## 💡 Template di Partenza

```javascript
// conversions.js

const originalText = 'Hello World! 👋';

console.log('=== Conversioni Buffer ===\n');

// 1. Crea Buffer da stringa
// TODO

// 2. Converti in Base64
// TODO

// 3. Converti in Hex
// TODO

// 4. Riconverti in UTF-8
// TODO

// 5. Verifica equivalenza
// TODO
```

## 📚 Concetti Chiave

### Creazione Buffer
```javascript
// Da stringa
const buf = Buffer.from('Hello', 'utf8');

// Da array di bytes
const buf = Buffer.from([72, 101, 108, 108, 111]);

// Buffer vuoto di dimensione N
const buf = Buffer.alloc(10);
```

### Conversione toString()
```javascript
const buf = Buffer.from('Hello');

buf.toString('utf8');    // 'Hello'
buf.toString('base64');  // 'SGVsbG8='
buf.toString('hex');     // '48656c6c6f'
```

### Encoding Supportati
- **utf8**: Testo normale (default)
- **base64**: Codifica Base64
- **hex**: Esadecimale
- **ascii**: ASCII
- **binary**: Binary string
- **latin1**: ISO-8859-1

## 🔍 Soluzione Completa

```javascript
console.log('=== Conversioni Buffer ===\n');

// Testo originale
const originalText = 'Hello World! 👋🌍';
console.log('📝 Testo originale:');
console.log(`   "${originalText}"`);
console.log(`   Lunghezza: ${originalText.length} caratteri\n`);

// 1. Crea Buffer da stringa UTF-8
const buffer = Buffer.from(originalText, 'utf8');
console.log('🔢 Buffer (bytes):');
console.log(`   ${buffer}`);
console.log(`   Dimensione: ${buffer.length} byte\n`);

// 2. Converti in Base64
const base64 = buffer.toString('base64');
console.log('📦 Base64:');
console.log(`   "${base64}"`);
console.log(`   Lunghezza: ${base64.length} caratteri\n`);

// 3. Converti in Esadecimale
const hex = buffer.toString('hex');
console.log('🔣 Esadecimale:');
console.log(`   "${hex}"`);
console.log(`   Lunghezza: ${hex.length} caratteri\n`);

// 4. Riconverti tutti in UTF-8
console.log('🔄 Riconversione in UTF-8:\n');

const fromUtf8 = buffer.toString('utf8');
console.log(`   Da buffer:   "${fromUtf8}"`);

const fromBase64 = Buffer.from(base64, 'base64').toString('utf8');
console.log(`   Da base64:   "${fromBase64}"`);

const fromHex = Buffer.from(hex, 'hex').toString('utf8');
console.log(`   Da hex:      "${fromHex}"`);

// 5. Verifica equivalenza
console.log('\n✅ Verifica equivalenza:');
console.log(`   fromUtf8 === originalText? ${fromUtf8 === originalText ? '✅' : '❌'}`);
console.log(`   fromBase64 === originalText? ${fromBase64 === originalText ? '✅' : '❌'}`);
console.log(`   fromHex === originalText? ${fromHex === originalText ? '✅' : '❌'}`);

// 6. Confronto dimensioni
console.log('\n📊 Confronto Dimensioni:');
console.log(`   UTF-8:   ${buffer.length} byte`);
console.log(`   Base64:  ${base64.length} caratteri (~${Math.round(base64.length/buffer.length*100)}% overhead)`);
console.log(`   Hex:     ${hex.length} caratteri (${hex.length/buffer.length}x dimensione)`);

// 7. Esempio pratico: URL safe base64
console.log('\n🔐 Base64 URL-safe (per token/URL):');
const urlSafeBase64 = base64
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');
console.log(`   "${urlSafeBase64}"`);
```

## 🎓 Suggerimenti

1. **UTF-8 è default**: Se ometti encoding, Node usa UTF-8
2. **Base64 overhead**: Base64 aumenta dimensione del ~33%
3. **Hex overhead**: Hex raddoppia la dimensione (2 caratteri per byte)
4. **Emoji**: Gli emoji occupano più byte in UTF-8 (tipicamente 4 byte)
5. **Buffer.from** vs **new Buffer**: Usa sempre `Buffer.from()` (safer)

## ✅ Criteri di Valutazione

- [ ] Buffer creato correttamente da stringa
- [ ] Conversione Base64 funziona
- [ ] Conversione Hex funziona
- [ ] Tutte le riconversioni producono testo originale
- [ ] Dimensioni dei formati sono confrontate
- [ ] Output è chiaro e formattato

## 🚀 Sfide Extra (Opzionali)

1. **Tutti gli encoding**: Prova anche ascii, latin1, binary
2. **File I/O**: Leggi file, converti in base64, salva
3. **Data URI**: Crea data URI per embedding immagini
4. **Custom encoding**: Implementa un encoding personalizzato (es. ROT13)
5. **Performance test**: Misura velocità di conversione per 1MB di dati
6. **Visual hex dump**: Crea visualizzazione hex dump come tool CLI

## 📖 Esempio Pratico: Data URI

```javascript
const fs = require('fs');

// Leggi immagine
const imageBuffer = fs.readFileSync('image.png');

// Converti in base64
const base64Image = imageBuffer.toString('base64');

// Crea data URI
const dataUri = `data:image/png;base64,${base64Image}`;

// Ora puoi usare dataUri in HTML <img src="...">
console.log('Data URI:', dataUri.substring(0, 100) + '...');
```

## 📖 Esempio: Token Generation

```javascript
const crypto = require('crypto');

// Genera token casuale
const tokenBuffer = crypto.randomBytes(32);

// Converti in formato URL-safe
const token = tokenBuffer
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '');

console.log('Token:', token);
// Usa in URL: /reset-password?token=...
```

## 🐛 Problemi Comuni

### Buffer.toString() senza encoding
**Causa**: Omesso parametro encoding  
**Effetto**: Usa UTF-8 di default (di solito OK)

### Emoji o caratteri speciali corrotti
**Causa**: Encoding sbagliato (es. ascii invece di utf8)  
**Soluzione**: Usa sempre 'utf8' per testo moderno

### Base64 con padding =
**Causa**: Base64 aggiunge = per padding  
**Soluzione**: OK, fa parte dello standard. Rimuovi solo per URL-safe

### Hex stringa di lunghezza dispari
**Causa**: Hex deve avere numero pari di caratteri  
**Soluzione**: Aggiungi 0 iniziale se necessario

## 📖 Risorse Utili

- [Buffer documentation](https://nodejs.org/api/buffer.html)
- [Character encodings explained](https://www.w3.org/International/questions/qa-what-is-encoding)
- [Base64 explained](https://en.wikipedia.org/wiki/Base64)
- [UTF-8 explained](https://en.wikipedia.org/wiki/UTF-8)
