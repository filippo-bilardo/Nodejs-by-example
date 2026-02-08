# Modulo Buffer - Gestione Dati Binari

## 📋 Indice

- [Introduzione](#introduzione)
- [Creazione Buffer](#creazione-buffer)
- [Conversioni Encoding](#conversioni-encoding)
- [Operazioni su Buffer](#operazioni-su-buffer)
- [Dati Numerici](#dati-numerici)
- [Ricerca in Buffer](#ricerca-in-buffer)
- [Buffer e JSON](#buffer-e-json)
- [Protocolli Binari](#protocolli-binari)
- [Buffer Pooling](#buffer-pooling)
- [Best Practices](#best-practices)
- [Risorse Utili](#risorse-utili)

---

## Introduzione

Il modulo **Buffer** gestisce dati binari in Node.js. I Buffer sono simili agli array di interi, ma corrispondono ad **allocazioni di memoria raw** fuori dal V8 heap.

### 🎯 Quando Usare Buffer

- **Rete**: Socket TCP, protocolli binari
- **File Binari**: Immagini, audio, video
- **Crittografia**: Chiavi, hash, cifratura
- **Streaming**: Elaborazione dati in chunks
- **Performance**: Manipolazione dati raw più veloce

### 📦 Importazione

```javascript
// Buffer è globale, non necessita import
// const { Buffer } = require('buffer'); // Se esplicito
```

---

## Creazione Buffer

### 🏗️ Metodi di Creazione

```javascript
class BufferCreation {
  static examples() {
    console.log('=== CREAZIONE BUFFER ===\n');
    
    // 1. Da stringa
    const bufFromString = Buffer.from('Hello World', 'utf8');
    console.log('Da stringa:', bufFromString);
    console.log('Come string:', bufFromString.toString());
    
    // 2. Da array di byte
    const bufFromArray = Buffer.from([72, 101, 108, 108, 111]); // "Hello"
    console.log('Da array:', bufFromArray.toString());
    
    // 3. Allocazione sicura (zerata)
    const bufAlloc = Buffer.alloc(10); // 10 byte riempiti di 0
    console.log('Allocato:', bufAlloc);
    
    // 4. Allocazione con fill
    const bufAllocFilled = Buffer.alloc(10, 'a'); // 10 byte 'a'
    console.log('Allocato con fill:', bufAllocFilled.toString());
    
    // 5. Allocazione non sicura (più veloce, ma dati casuali)
    const bufAllocUnsafe = Buffer.allocUnsafe(10);
    console.log('Non sicuro:', bufAllocUnsafe);
    // ⚠️ Contiene dati precedenti in memoria!
    
    // 6. Da hex
    const bufHex = Buffer.from('48656c6c6f', 'hex');
    console.log('Da hex:', bufHex.toString());
    
    // 7. Da base64
    const bufBase64 = Buffer.from('SGVsbG8gV29ybGQ=', 'base64');
    console.log('Da base64:', bufBase64.toString());
    
    // 8. Copia da altro buffer
    const original = Buffer.from('Original');
    const copy = Buffer.from(original);
    console.log('Copia:', copy.toString());
  }
}

BufferCreation.examples();
```

### ⚠️ alloc() vs allocUnsafe()

```javascript
// ✅ Buffer.alloc() - Sicuro (zerato)
const safe = Buffer.alloc(100);
console.log('Safe buffer:', safe[0]); // 0

// ⚡ Buffer.allocUnsafe() - Veloce ma insicuro
const unsafe = Buffer.allocUnsafe(100);
console.log('Unsafe buffer:', unsafe[0]); // ??? (può contenere dati vecchi)

// 📊 Performance comparison
console.time('alloc');
for (let i = 0; i < 100000; i++) {
  Buffer.alloc(1024);
}
console.timeEnd('alloc');

console.time('allocUnsafe');
for (let i = 0; i < 100000; i++) {
  Buffer.allocUnsafe(1024);
}
console.timeEnd('allocUnsafe');
// allocUnsafe è ~2x più veloce
```

---

## Conversioni Encoding

### 🔤 Encoding Supportati

| Encoding | Descrizione | Uso |
|----------|-------------|-----|
| `utf8` | UTF-8 (default) | Testo Unicode |
| `utf16le` | UTF-16 Little Endian | Windows text |
| `latin1` | ISO-8859-1 | Legacy text |
| `ascii` | 7-bit ASCII | Old protocols |
| `hex` | Esadecimale | Debug, cripto |
| `base64` | Base64 | Email, URL-safe |
| `base64url` | Base64 URL-safe | JWT, URL |
| `binary` | Alias per 'latin1' | Deprecato |

### 💻 Esempi Conversioni

```javascript
class EncodingConverter {
  static convertAll(text = 'Hello World! 🌟') {
    console.log('=== CONVERSIONI ENCODING ===\n');
    
    const buffer = Buffer.from(text, 'utf8');
    
    const conversions = {
      original: text,
      utf8: buffer.toString('utf8'),
      hex: buffer.toString('hex'),
      base64: buffer.toString('base64'),
      base64url: buffer.toString('base64url'),
      binary: buffer.toString('binary'),
      ascii: buffer.toString('ascii'), // ⚠️ Perde emoji
      latin1: buffer.toString('latin1')
    };
    
    console.log('Dimensione originale:', text.length, 'caratteri');
    console.log('Dimensione buffer:', buffer.length, 'byte\n');
    
    Object.entries(conversions).forEach(([encoding, value]) => {
      console.log(`${encoding.padEnd(12)}: ${value}`);
    });
    
    return conversions;
  }

  // Conversione tra encoding
  static convert(text, fromEncoding, toEncoding) {
    const buffer = Buffer.from(text, fromEncoding);
    return buffer.toString(toEncoding);
  }
}

EncodingConverter.convertAll();

// Conversione hex → utf8
const hex = '48656c6c6f';
const text = EncodingConverter.convert(hex, 'hex', 'utf8');
console.log('\nHex to UTF8:', text); // "Hello"
```

---

## Operazioni su Buffer

### ✂️ Concatenazione, Copia, Slice

```javascript
class BufferOperations {
  static basicOps() {
    console.log('\n=== OPERAZIONI BUFFER ===\n');
    
    const buf1 = Buffer.from('Hello');
    const buf2 = Buffer.from(' World');
    const buf3 = Buffer.from('!');
    
    // 1. Concatenazione
    const concatenated = Buffer.concat([buf1, buf2, buf3]);
    console.log('Concatenato:', concatenated.toString());
    
    // 2. Concatenazione con lunghezza totale
    const concat2 = Buffer.concat([buf1, buf2], 10);
    console.log('Concat limitato:', concat2.toString());
    
    // 3. Copia
    const target = Buffer.alloc(20);
    buf1.copy(target, 0);           // Copia buf1 in target da posizione 0
    buf2.copy(target, buf1.length); // Copia buf2 dopo buf1
    console.log('Copiato:', target.toString('utf8', 0, buf1.length + buf2.length));
    
    // 4. Slice (crea vista, non copia!)
    const sliced = concatenated.slice(0, 5);
    console.log('Slice:', sliced.toString());
    
    // ⚠️ Modifica slice modifica originale
    sliced[0] = 72; // 'H' → 'H'
    console.log('Dopo modifica slice:', concatenated.toString());
    
    // 5. Subarray (alias di slice)
    const sub = concatenated.subarray(6, 11);
    console.log('Subarray:', sub.toString());
    
    // 6. Fill
    const bufFill = Buffer.alloc(10);
    bufFill.fill('ab');
    console.log('Fill:', bufFill.toString());
    
    // 7. Reverse (Node 16+)
    const bufReverse = Buffer.from('Hello');
    bufReverse.reverse();
    console.log('Reverse:', bufReverse.toString());
  }

  static compareBuffers() {
    console.log('\n=== CONFRONTO BUFFER ===\n');
    
    const buf1 = Buffer.from('ABC');
    const buf2 = Buffer.from('ABC');
    const buf3 = Buffer.from('ABD');
    
    // equals()
    console.log('buf1 === buf2:', buf1.equals(buf2)); // true
    console.log('buf1 === buf3:', buf1.equals(buf3)); // false
    
    // compare() - ritorna -1, 0, 1
    console.log('compare(buf1, buf2):', buf1.compare(buf2)); // 0
    console.log('compare(buf1, buf3):', buf1.compare(buf3)); // -1 (buf1 < buf3)
    console.log('compare(buf3, buf1):', buf3.compare(buf1)); // 1 (buf3 > buf1)
    
    // Sort array di buffer
    const buffers = [
      Buffer.from('zzz'),
      Buffer.from('aaa'),
      Buffer.from('mmm')
    ];
    
    buffers.sort(Buffer.compare);
    console.log('Sorted:', buffers.map(b => b.toString()));
  }
}

BufferOperations.basicOps();
BufferOperations.compareBuffers();
```

---

## Dati Numerici

### 🔢 Lettura e Scrittura

```javascript
class NumericOperations {
  static readWriteNumbers() {
    console.log('\n=== OPERAZIONI NUMERICHE ===\n');
    
    const buffer = Buffer.alloc(16);
    
    // Scrittura numeri
    buffer.writeInt8(127, 0);                // 1 byte
    buffer.writeInt16BE(32767, 1);           // 2 byte big-endian
    buffer.writeInt32LE(-1234567890, 3);     // 4 byte little-endian
    buffer.writeFloatBE(3.14159, 7);         // 4 byte float
    buffer.writeDoubleLE(2.718281828, 11);   // 8 byte double (non entra!)
    
    console.log('Buffer hex:', buffer.toString('hex'));
    
    // Lettura numeri
    console.log('Int8:', buffer.readInt8(0));
    console.log('Int16BE:', buffer.readInt16BE(1));
    console.log('Int32LE:', buffer.readInt32LE(3));
    console.log('FloatBE:', buffer.readFloatBE(7));
    
    // BigInt (Node 12+)
    const bufBigInt = Buffer.alloc(8);
    bufBigInt.writeBigInt64LE(9007199254740991n, 0);
    console.log('BigInt:', bufBigInt.readBigInt64LE(0));
  }

  // Tutti i metodi disponibili
  static showAllMethods() {
    console.log('\n=== METODI NUMERICI ===\n');
    
    const methods = [
      'readInt8', 'writeInt8',
      'readInt16BE', 'writeInt16BE',
      'readInt16LE', 'writeInt16LE',
      'readInt32BE', 'writeInt32BE',
      'readInt32LE', 'writeInt32LE',
      'readUInt8', 'writeUInt8',
      'readUInt16BE', 'writeUInt16BE',
      'readUInt16LE', 'writeUInt16LE',
      'readUInt32BE', 'writeUInt32BE',
      'readUInt32LE', 'writeUInt32LE',
      'readBigInt64BE', 'writeBigInt64BE',
      'readBigInt64LE', 'writeBigInt64LE',
      'readBigUInt64BE', 'writeBigUInt64BE',
      'readBigUInt64LE', 'writeBigUInt64LE',
      'readFloatBE', 'writeFloatBE',
      'readFloatLE', 'writeFloatLE',
      'readDoubleLE', 'writeDoubleLE',
      'readDoubleBE', 'writeDoubleBE'
    ];
    
    console.log('Total methods:', methods.length);
    console.log('Read methods:', methods.filter(m => m.startsWith('read')).length);
    console.log('Write methods:', methods.filter(m => m.startsWith('write')).length);
  }
}

NumericOperations.readWriteNumbers();
NumericOperations.showAllMethods();
```

---

## Ricerca in Buffer

### 🔍 indexOf, includes, lastIndexOf

```javascript
class BufferSearch {
  static searchOperations() {
    console.log('\n=== RICERCA IN BUFFER ===\n');
    
    const text = 'The quick brown fox jumps over the lazy dog';
    const buffer = Buffer.from(text);
    
    // 1. indexOf
    const foxIndex = buffer.indexOf('fox');
    console.log('Position of "fox":', foxIndex);
    
    // 2. indexOf con offset
    const theIndex1 = buffer.indexOf('the');
    const theIndex2 = buffer.indexOf('the', theIndex1 + 1);
    console.log('First "the":', theIndex1);
    console.log('Second "the":', theIndex2);
    
    // 3. indexOf con buffer
    const searchBuf = Buffer.from('fox');
    const index = buffer.indexOf(searchBuf);
    console.log('Position (buffer search):', index);
    
    // 4. lastIndexOf
    const lastThe = buffer.lastIndexOf('the');
    console.log('Last "the":', lastThe);
    
    // 5. includes
    const hasFox = buffer.includes('fox');
    const hasCat = buffer.includes('cat');
    console.log('Contains "fox":', hasFox);
    console.log('Contains "cat":', hasCat);
    
    // 6. Search con encoding
    const hexBuffer = Buffer.from('48656c6c6f', 'hex'); // "Hello"
    const found = hexBuffer.includes('Hello');
    console.log('Hex buffer includes "Hello":', found);
  }

  // Find all occurrences
  static findAll(buffer, search) {
    const positions = [];
    let pos = 0;
    
    while ((pos = buffer.indexOf(search, pos)) !== -1) {
      positions.push(pos);
      pos += 1;
    }
    
    return positions;
  }
}

BufferSearch.searchOperations();

// Test findAll
const buf = Buffer.from('abcabcabc');
const positions = BufferSearch.findAll(buf, 'abc');
console.log('\nAll positions of "abc":', positions);
```

---

## Buffer e JSON

### 📦 Serializzazione

```javascript
class BufferJSON {
  // Buffer → JSON
  static bufferToJSON(buffer) {
    return {
      type: 'Buffer',
      data: Array.from(buffer)
    };
  }

  // JSON → Buffer
  static jsonToBuffer(json) {
    if (json.type === 'Buffer' && Array.isArray(json.data)) {
      return Buffer.from(json.data);
    }
    throw new Error('Invalid buffer JSON format');
  }

  // Custom stringify con buffer support
  static stringify(obj) {
    return JSON.stringify(obj, (key, value) => {
      if (Buffer.isBuffer(value)) {
        return {
          type: 'Buffer',
          data: Array.from(value)
        };
      }
      return value;
    });
  }

  // Custom parse con buffer support
  static parse(jsonString) {
    return JSON.parse(jsonString, (key, value) => {
      if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
        return Buffer.from(value.data);
      }
      return value;
    });
  }
}

// ✅ Esempi
console.log('\n=== BUFFER JSON ===\n');

const testObj = {
  name: 'Test Data',
  data: Buffer.from('Hello World'),
  timestamp: Date.now()
};

// Serialize
const jsonString = BufferJSON.stringify(testObj);
console.log('JSON:', jsonString);

// Deserialize
const restored = BufferJSON.parse(jsonString);
console.log('Restored buffer:', restored.data.toString());
console.log('Is Buffer?:', Buffer.isBuffer(restored.data));
```

---

## Protocolli Binari

### 📡 Binary Protocol Handler

```javascript
class BinaryProtocol {
  constructor() {
    this.MAGIC_NUMBER = 0xDEADBEEF;
    this.VERSION = 1;
  }

  // Serialize message
  serialize(type, payload) {
    const payloadBuffer = Buffer.isBuffer(payload) 
      ? payload 
      : Buffer.from(JSON.stringify(payload));
    
    const headerSize = 16;
    const buffer = Buffer.alloc(headerSize + payloadBuffer.length);
    
    let offset = 0;
    
    // Header
    buffer.writeUInt32BE(this.MAGIC_NUMBER, offset); offset += 4;
    buffer.writeUInt8(this.VERSION, offset); offset += 1;
    buffer.writeUInt8(type, offset); offset += 1;
    buffer.writeUInt16BE(0, offset); offset += 2; // reserved
    buffer.writeUInt32BE(payloadBuffer.length, offset); offset += 4;
    
    // Payload
    payloadBuffer.copy(buffer, offset);
    
    // Checksum
    const checksum = this.calculateChecksum(buffer.slice(0, headerSize - 4));
    buffer.writeUInt32BE(checksum, headerSize - 4);
    
    return buffer;
  }

  // Deserialize message
  deserialize(buffer) {
    if (buffer.length < 16) {
      throw new Error('Buffer too small');
    }
    
    let offset = 0;
    
    const magic = buffer.readUInt32BE(offset); offset += 4;
    const version = buffer.readUInt8(offset); offset += 1;
    const type = buffer.readUInt8(offset); offset += 1;
    const reserved = buffer.readUInt16BE(offset); offset += 2;
    const payloadLength = buffer.readUInt32BE(offset); offset += 4;
    const checksum = buffer.readUInt32BE(offset); offset += 4;
    
    // Verify
    if (magic !== this.MAGIC_NUMBER) {
      throw new Error(`Invalid magic number: ${magic.toString(16)}`);
    }
    
    if (version !== this.VERSION) {
      throw new Error(`Unsupported version: ${version}`);
    }
    
    // Verify checksum
    const expected = this.calculateChecksum(buffer.slice(0, 12));
    if (checksum !== expected) {
      throw new Error('Invalid checksum');
    }
    
    // Extract payload
    const payload = buffer.slice(16, 16 + payloadLength);
    
    return {
      version,
      type,
      payloadLength,
      payload,
      raw: buffer.slice(0, 16 + payloadLength)
    };
  }

  calculateChecksum(data) {
    let checksum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const chunk = data.readUInt32BE(i);
      checksum ^= chunk;
    }
    return checksum;
  }
}

// ✅ Test
console.log('\n=== BINARY PROTOCOL ===\n');

const protocol = new BinaryProtocol();
const message = protocol.serialize(1, { message: 'Hello Binary World' });
console.log('Serialized:', message.toString('hex'));

const deserialized = protocol.deserialize(message);
console.log('Deserialized:', JSON.parse(deserialized.payload.toString()));
```

---

## Buffer Pooling

### 🏊 Memory Pool per Ottimizzazioni

```javascript
class BufferPool {
  constructor(poolSize = 8192, chunkSize = 1024) {
    this.poolSize = poolSize;
    this.chunkSize = chunkSize;
    this.pools = [];
    this.currentPool = null;
    this.currentOffset = 0;
    this.allocateNewPool();
  }

  allocateNewPool() {
    this.currentPool = Buffer.allocUnsafe(this.poolSize);
    this.currentOffset = 0;
    this.pools.push({
      buffer: this.currentPool,
      used: 0,
      created: Date.now()
    });
  }

  allocate(size) {
    // Large allocation: direct allocate
    if (size > this.chunkSize) {
      return Buffer.allocUnsafe(size);
    }

    // Need new pool?
    if (this.currentOffset + size > this.poolSize) {
      this.allocateNewPool();
    }

    const buffer = this.currentPool.slice(
      this.currentOffset, 
      this.currentOffset + size
    );
    
    this.currentOffset += size;
    this.pools[this.pools.length - 1].used += size;

    return buffer;
  }

  getStats() {
    return {
      totalPools: this.pools.length,
      currentPoolUsage: (this.currentOffset / this.poolSize * 100).toFixed(2) + '%',
      totalAllocated: this.pools.reduce((total, pool) => total + pool.used, 0),
      totalCapacity: this.pools.length * this.poolSize
    };
  }

  cleanup(maxAge = 300000) { // 5 minutes
    const now = Date.now();
    this.pools = this.pools.filter((pool, index) => {
      const isOld = now - pool.created > maxAge;
      const isCurrent = index === this.pools.length - 1;
      return !isOld || isCurrent;
    });
  }
}

// ✅ Test
console.log('\n=== BUFFER POOL ===\n');

const pool = new BufferPool();

// Allocate multiple buffers
const buffers = [];
for (let i = 0; i < 10; i++) {
  buffers.push(pool.allocate(512));
}

console.log('Pool stats:', pool.getStats());
```

---

## Best Practices

### ✅ Do

1. **Usa Buffer.alloc()** per sicurezza (zerato)
2. **Buffer.from()** per conversioni da string/array
3. **Buffer.concat()** invece di manuale concatenazione
4. **toString(encoding)** per conversione a stringa
5. **Buffer pool** per allocazioni frequenti piccole

### ❌ Don't

1. ❌ Non creare buffer con `new Buffer()` (deprecato!)
2. ❌ Non usare `allocUnsafe()` senza riempire subito
3. ❌ Non modificare `buffer.length`
4. ❌ Non assumere encoding (sempre specifica)
5. ❌ Non mixare offset/index senza validazione

### ⚡ Performance

```javascript
// ✅ Good: Reusa buffer
const buffer = Buffer.alloc(1024);
for (let i = 0; i < 1000; i++) {
  // riempi e usa buffer
  buffer.fill(0); // reset
}

// ❌ Bad: Nuova allocazione ogni volta
for (let i = 0; i < 1000; i++) {
  const buffer = Buffer.alloc(1024);
}
```

---

## Risorse Utili

### 📚 Documentazione

- [Node.js Buffer Module](https://nodejs.org/api/buffer.html)
- [Buffer Encoding](https://nodejs.org/api/buffer.html#buffer_buffers_and_character_encodings)

### 🛠️ Librerie

- [safe-buffer](https://www.npmjs.com/package/safe-buffer) - Cross-version compatibility
- [bl](https://www.npmjs.com/package/bl) - Buffer list (concatenazione efficiente)
- [binary](https://www.npmjs.com/package/binary) - Binary data parsing

---

**💡 Tip**: Buffer è fondamentale per **I/O veloce** - networking, file system, crittografia.
