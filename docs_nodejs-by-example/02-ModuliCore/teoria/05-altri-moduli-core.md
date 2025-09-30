# Altri Moduli Core di Node.js

## Introduzione

Oltre ai moduli principali come `fs`, `http` ed `events`, Node.js include numerosi altri mod## Il Modulo Crypto

Il modulo `crypto` fornisce funzionalità crittografiche, inclusi hash, HMAC, cifrari, decifrari, firme e verifiche.

### Importare il Modulo

```javascript
const crypto = require('crypto');
const { promisify } = require('util');
```

### Hash e Digest

```javascript
const crypto = require('crypto');

class HashUtil {
  // Hash semplice
  static hash(data, algorithm = 'sha256') {
    return crypto
      .createHash(algorithm)
      .update(data)
      .digest('hex');
  }

  // Hash con salt per password
  static hashPassword(password, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(16).toString('hex');
    }
    
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    
    return {
      hash,
      salt,
      combined: `${salt}:${hash}`
    };
  }

  // Verifica password
  static verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const testHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    
    return hash === testHash;
  }

  // Hash di file
  static hashFile(filePath, algorithm = 'sha256') {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const fs = require('fs');
      const stream = fs.createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  // Genera checksum con metadati
  static async generateFileChecksum(filePath) {
    const fs = require('fs').promises;
    const path = require('path');
    
    try {
      const stats = await fs.stat(filePath);
      const hash = await this.hashFile(filePath);
      
      return {
        file: path.basename(filePath),
        path: filePath,
        size: stats.size,
        modified: stats.mtime,
        hash,
        algorithm: 'sha256'
      };
    } catch (error) {
      throw new Error(`Errore nel calcolo checksum: ${error.message}`);
    }
  }
}

// Esempio di utilizzo
const password = 'miaPasswordSegreta';
const hashed = HashUtil.hashPassword(password);
console.log('Password hash:', hashed.combined);

const isValid = HashUtil.verifyPassword(password, hashed.combined);
console.log('Password valida:', isValid);

// HashUtil.generateFileChecksum('./esempio.txt')
//   .then(checksum => console.log('Checksum file:', checksum))
//   .catch(console.error);
```

### Cifratura e Decifratura

```javascript
const crypto = require('crypto');

class CryptoUtil {
  constructor(algorithm = 'aes-256-gcm') {
    this.algorithm = algorithm;
  }

  // Genera una chiave sicura
  generateKey(length = 32) {
    return crypto.randomBytes(length);
  }

  // Cifratura con AES-GCM (autenticata)
  encrypt(text, key) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, key);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Per AES-GCM, ottieni il tag di autenticazione
      let authTag = '';
      if (this.algorithm.includes('gcm')) {
        authTag = cipher.getAuthTag().toString('hex');
      }
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag,
        algorithm: this.algorithm
      };
    } catch (error) {
      throw new Error(`Errore cifratura: ${error.message}`);
    }
  }

  // Decifratura
  decrypt(encryptedData, key) {
    try {
      const decipher = crypto.createDecipher(this.algorithm, key);
      
      // Se è AES-GCM, imposta il tag di autenticazione
      if (this.algorithm.includes('gcm') && encryptedData.authTag) {
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      }
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Errore decifratura: ${error.message}`);
    }
  }

  // Cifratura file
  async encryptFile(inputPath, outputPath, key) {
    const fs = require('fs');
    const { pipeline } = require('stream');
    
    return new Promise((resolve, reject) => {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, key);
      
      // Scrivi l'IV all'inizio del file cifrato
      const outputStream = fs.createWriteStream(outputPath);
      outputStream.write(iv);
      
      pipeline(
        fs.createReadStream(inputPath),
        cipher,
        outputStream,
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              inputFile: inputPath,
              outputFile: outputPath,
              iv: iv.toString('hex')
            });
          }
        }
      );
    });
  }

  // Decifratura file
  async decryptFile(inputPath, outputPath, key) {
    const fs = require('fs');
    const { pipeline } = require('stream');
    
    return new Promise((resolve, reject) => {
      const inputStream = fs.createReadStream(inputPath);
      
      // Leggi l'IV dai primi 16 byte
      const ivBuffer = Buffer.alloc(16);
      let ivRead = false;
      
      inputStream.on('readable', () => {
        if (!ivRead) {
          const chunk = inputStream.read(16);
          if (chunk) {
            chunk.copy(ivBuffer);
            ivRead = true;
            
            const decipher = crypto.createDecipher(this.algorithm, key);
            
            pipeline(
              inputStream,
              decipher,
              fs.createWriteStream(outputPath),
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    inputFile: inputPath,
                    outputFile: outputPath,
                    success: true
                  });
                }
              }
            );
          }
        }
      });
    });
  }
}

// Esempio di utilizzo
const cryptoUtil = new CryptoUtil();
const key = 'miaChiaveSegretaSuperSicura123456';

const plaintext = 'Questo è un messaggio segreto';
const encrypted = cryptoUtil.encrypt(plaintext, key);
console.log('Testo cifrato:', encrypted);

const decrypted = cryptoUtil.decrypt(encrypted, key);
console.log('Testo decifrato:', decrypted);
```

### Firme Digitali e Certificati

```javascript
const crypto = require('crypto');

class DigitalSignature {
  // Genera coppia di chiavi RSA
  generateKeyPair(keySize = 2048) {
    return crypto.generateKeyPairSync('rsa', {
      modulusLength: keySize,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      }
    });
  }

  // Firma un messaggio
  sign(message, privateKey, algorithm = 'sha256') {
    const sign = crypto.createSign(algorithm);
    sign.update(message);
    return sign.sign(privateKey, 'hex');
  }

  // Verifica una firma
  verify(message, signature, publicKey, algorithm = 'sha256') {
    const verify = crypto.createVerify(algorithm);
    verify.update(message);
    return verify.verify(publicKey, signature, 'hex');
  }

  // Sistema completo di firma per documenti
  signDocument(document, privateKey, metadata = {}) {
    const timestamp = new Date().toISOString();
    const documentHash = crypto
      .createHash('sha256')
      .update(document)
      .digest('hex');
    
    const signatureData = {
      document: documentHash,
      timestamp,
      metadata,
      algorithm: 'sha256'
    };
    
    const dataToSign = JSON.stringify(signatureData);
    const signature = this.sign(dataToSign, privateKey);
    
    return {
      ...signatureData,
      signature,
      originalDocument: document
    };
  }

  // Verifica firma documento
  verifyDocument(signedDocument, publicKey) {
    try {
      const { signature, originalDocument, ...signatureData } = signedDocument;
      
      // Verifica hash del documento
      const documentHash = crypto
        .createHash('sha256')
        .update(originalDocument)
        .digest('hex');
      
      if (documentHash !== signatureData.document) {
        return {
          valid: false,
          reason: 'Document hash mismatch'
        };
      }
      
      // Verifica firma
      const dataToVerify = JSON.stringify(signatureData);
      const isValid = this.verify(dataToVerify, signature, publicKey);
      
      return {
        valid: isValid,
        timestamp: signatureData.timestamp,
        metadata: signatureData.metadata
      };
    } catch (error) {
      return {
        valid: false,
        reason: error.message
      };
    }
  }
}

// JWT semplice implementazione
class SimpleJWT {
  static encode(payload, secret, algorithm = 'HS256') {
    const header = {
      alg: algorithm,
      typ: 'JWT'
    };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signatureInput)
      .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  static decode(token, secret) {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      
      // Verifica firma
      const signatureInput = `${encodedHeader}.${encodedPayload}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(signatureInput)
        .digest('base64url');
      
      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }
      
      // Decodifica payload
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
      
      // Verifica scadenza
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new Error('Token expired');
      }
      
      return {
        valid: true,
        payload
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

// Esempio di utilizzo
const signer = new DigitalSignature();
const keyPair = signer.generateKeyPair();

const document = 'Questo è un documento importante';
const signedDoc = signer.signDocument(document, keyPair.privateKey, {
  author: 'Mario Rossi',
  department: 'IT'
});

const verification = signer.verifyDocument(signedDoc, keyPair.publicKey);
console.log('Verifica documento:', verification);

// Test JWT
const jwtPayload = {
  userId: 123,
  role: 'admin',
  exp: Math.floor(Date.now() / 1000) + 3600 // Scade tra 1 ora
};

const token = SimpleJWT.encode(jwtPayload, 'mio-segreto');
console.log('JWT Token:', token);

const decoded = SimpleJWT.decode(token, 'mio-segreto');
console.log('JWT Decodificato:', decoded);
```

### HMAC e Autenticazione

```javascript
const crypto = require('crypto');

class AuthenticationUtils {
  // Genera HMAC per API authentication
  static generateHMAC(message, secret, algorithm = 'sha256') {
    return crypto
      .createHmac(algorithm, secret)
      .update(message)
      .digest('hex');
  }

  // Genera signature per API requests
  static generateAPISignature(method, url, body, timestamp, apiSecret) {
    const message = `${method}\n${url}\n${body}\n${timestamp}`;
    return this.generateHMAC(message, apiSecret);
  }

  // Verifica signature API
  static verifyAPISignature(method, url, body, timestamp, signature, apiSecret, tolerance = 300) {
    // Verifica timestamp (tolerance in secondi)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > tolerance) {
      return {
        valid: false,
        reason: 'Timestamp out of tolerance'
      };
    }

    const expectedSignature = this.generateAPISignature(method, url, body, timestamp, apiSecret);
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    return {
      valid: isValid,
      reason: isValid ? null : 'Invalid signature'
    };
  }

  // One-Time Password (TOTP-like)
  static generateOTP(secret, window = 30, digits = 6) {
    const time = Math.floor(Date.now() / 1000 / window);
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(time, 4);

    const hmac = crypto.createHmac('sha1', secret);
    hmac.update(timeBuffer);
    const hash = hmac.digest();

    const offset = hash[hash.length - 1] & 0xf;
    const binary = ((hash[offset] & 0x7f) << 24) |
                  ((hash[offset + 1] & 0xff) << 16) |
                  ((hash[offset + 2] & 0xff) << 8) |
                  (hash[offset + 3] & 0xff);

    const otp = binary % Math.pow(10, digits);
    return otp.toString().padStart(digits, '0');
  }

  // Verifica OTP
  static verifyOTP(token, secret, window = 30, tolerance = 1) {
    // Verifica il token corrente e quelli adiacenti per compensare clock skew
    for (let i = -tolerance; i <= tolerance; i++) {
      const time = Math.floor(Date.now() / 1000 / window) + i;
      const timeBuffer = Buffer.alloc(8);
      timeBuffer.writeUInt32BE(time, 4);

      const hmac = crypto.createHmac('sha1', secret);
      hmac.update(timeBuffer);
      const hash = hmac.digest();

      const offset = hash[hash.length - 1] & 0xf;
      const binary = ((hash[offset] & 0x7f) << 24) |
                    ((hash[offset + 1] & 0xff) << 16) |
                    ((hash[offset + 2] & 0xff) << 8) |
                    (hash[offset + 3] & 0xff);

      const otp = binary % Math.pow(10, 6);
      const otpString = otp.toString().padStart(6, '0');

      if (otpString === token) {
        return true;
      }
    }

    return false;
  }
}

// Rate Limiting con HMAC
class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }

  // Genera token per rate limiting
  generateToken(clientId, timestamp = Date.now()) {
    const window = Math.floor(timestamp / this.windowMs);
    const data = `${clientId}:${window}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Verifica rate limit
  checkRateLimit(clientId) {
    const now = Date.now();
    const window = Math.floor(now / this.windowMs);
    const token = this.generateToken(clientId, now);

    if (!this.requests.has(token)) {
      this.requests.set(token, 0);
    }

    const currentCount = this.requests.get(token);
    
    if (currentCount >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: (window + 1) * this.windowMs
      };
    }

    this.requests.set(token, currentCount + 1);
    
    // Cleanup vecchi token
    this.cleanup(window);

    return {
      allowed: true,
      remaining: this.maxRequests - currentCount - 1,
      resetTime: (window + 1) * this.windowMs
    };
  }

  cleanup(currentWindow) {
    // Rimuovi token di finestre precedenti
    for (const [token, count] of this.requests) {
      const tokenParts = token.split(':');
      if (tokenParts.length >= 2) {
        // Estrai window dal token (approssimazione)
        const clientId = tokenParts[0];
        const testWindow = Math.floor((Date.now() - this.windowMs * 2) / this.windowMs);
        const oldToken = this.generateToken(clientId, testWindow * this.windowMs);
        
        if (token === oldToken) {
          this.requests.delete(token);
        }
      }
    }
  }
}

// Esempi di utilizzo
console.log('\n=== ESEMPI CRYPTO AVANZATI ===');

// Test HMAC API
const apiSecret = 'mio-api-secret';
const method = 'POST';
const url = '/api/users';
const body = '{"name":"Mario","email":"mario@example.com"}';
const timestamp = Math.floor(Date.now() / 1000);

const signature = AuthenticationUtils.generateAPISignature(method, url, body, timestamp, apiSecret);
console.log('API Signature:', signature);

const verification = AuthenticationUtils.verifyAPISignature(method, url, body, timestamp, signature, apiSecret);
console.log('Signature valid:', verification.valid);

// Test OTP
const otpSecret = crypto.randomBytes(20);
const otp = AuthenticationUtils.generateOTP(otpSecret);
console.log('Current OTP:', otp);

const otpValid = AuthenticationUtils.verifyOTP(otp, otpSecret);
console.log('OTP valid:', otpValid);

// Test Rate Limiter
const rateLimiter = new RateLimiter(60000, 5); // 5 requests per minute
const clientId = 'user123';

for (let i = 0; i < 7; i++) {
  const result = rateLimiter.checkRateLimit(clientId);
  console.log(`Request ${i + 1}:`, result.allowed ? 'ALLOWED' : 'BLOCKED', `(remaining: ${result.remaining})`);
}
```

### Funzionalità Principalie forniscono funzionalità essenziali per lo sviluppo di applicazioni. In questa guida, esploreremo alcuni di questi moduli e le loro funzionalità più importanti.

## Il Modulo Path

Il modulo `path` fornisce utilità per lavorare con percorsi di file e directory in modo coerente tra diverse piattaforme (Windows, Linux, macOS).

### Importare il Modulo

```javascript
const path = require('path');
```

### Funzionalità Principali

```javascript
// Unire percorsi
const fullPath = path.join('/home', 'user', 'documents', 'file.txt');
console.log(fullPath); // /home/user/documents/file.txt (su Linux/macOS)

// Risolvere percorsi (calcola percorsi assoluti)
const resolvedPath = path.resolve('folder', 'subfolder', 'file.txt');
console.log(resolvedPath); // percorso assoluto dal punto di esecuzione

// Ottenere il nome del file da un percorso
const fileName = path.basename('/path/to/file.txt');
console.log(fileName); // file.txt

// Ottenere il nome del file senza estensione
const fileNameWithoutExt = path.basename('/path/to/file.txt', '.txt');
console.log(fileNameWithoutExt); // file

// Ottenere l'estensione di un file
const ext = path.extname('/path/to/file.txt');
console.log(ext); // .txt

// Ottenere la directory di un file
const dirName = path.dirname('/path/to/file.txt');
console.log(dirName); // /path/to

// Normalizzare un percorso (rimuovere ridondanze)
const normalizedPath = path.normalize('/path//to/../to/file.txt');
console.log(normalizedPath); // /path/to/file.txt

// Ottenere informazioni sul percorso
const pathInfo = path.parse('/path/to/file.txt');
console.log(pathInfo);
// Output:
// {
//   root: '/',
//   dir: '/path/to',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }
```

## Il Modulo OS

Il modulo `os` fornisce utilità per interagire con il sistema operativo.

### Importare il Modulo

```javascript
const os = require('os');
```

### Funzionalità Principali

```javascript
// Informazioni sulla piattaforma
console.log('Piattaforma:', os.platform()); // 'win32', 'darwin', 'linux', ecc.
console.log('Architettura:', os.arch()); // 'x64', 'arm', ecc.
console.log('Versione OS:', os.release());

// Informazioni sull'utente
console.log('Home directory:', os.homedir());
console.log('Nome utente:', os.userInfo().username);

// Informazioni sul sistema
console.log('Hostname:', os.hostname());
console.log('Tempo di attività (secondi):', os.uptime());

// Informazioni sulla CPU
console.log('CPU:', os.cpus());
console.log('Numero di core:', os.cpus().length);

// Informazioni sulla memoria
console.log('Memoria totale (byte):', os.totalmem());
console.log('Memoria libera (byte):', os.freemem());

// Informazioni sulla rete
console.log('Interfacce di rete:', os.networkInterfaces());

// Costanti
console.log('Fine riga predefinita:', os.EOL); // '\r\n' su Windows, '\n' su Linux/macOS
console.log('Directory temporanea:', os.tmpdir());
```

## Il Modulo Util

Il modulo `util` fornisce funzioni di utilità per supportare le esigenze interne di Node.js, ma molte di esse sono utili anche per gli sviluppatori.

### Importare il Modulo

```javascript
const util = require('util');
```

### Funzionalità Principali

```javascript
// Promisify: convertire funzioni basate su callback in funzioni che restituiscono Promise
const fs = require('fs');
const readFile = util.promisify(fs.readFile);

async function leggiFile() {
  try {
    const data = await readFile('file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('Errore:', err);
  }
}

leggiFile();

// Formattazione di stringhe
const formattato = util.format('Il %s ha %d anni', 'gatto', 5);
console.log(formattato); // Il gatto ha 5 anni

// Ispezione di oggetti
const obj = { nome: 'Mario', età: 30, indirizzo: { città: 'Roma', cap: '00100' } };
console.log(util.inspect(obj, { depth: null, colors: true }));

// Verifica dei tipi
console.log(util.isArray([1, 2, 3])); // true
console.log(util.isRegExp(/abc/)); // true
console.log(util.isDate(new Date())); // true
console.log(util.isError(new Error())); // true
```

## Il Modulo Crypto

Il modulo `crypto` fornisce funzionalità crittografiche che includono un set di wrapper per le funzioni hash, HMAC, cifratura, decifratura, firma e verifica di OpenSSL.

### Importare il Modulo

```javascript
const crypto = require('crypto');
```

### Funzionalità Principali

```javascript
// Hash di una stringa
function creaHash(stringa) {
  return crypto.createHash('sha256').update(stringa).digest('hex');
}

console.log(creaHash('password123')); // hash SHA-256 di 'password123'

// HMAC (Hash-based Message Authentication Code)
function creaHMAC(stringa, chiave) {
  return crypto.createHmac('sha256', chiave).update(stringa).digest('hex');
}

console.log(creaHMAC('messaggio', 'chiave-segreta'));

// Cifratura e decifratura
function cifra(testo, password) {
  const algorithm = 'aes-192-cbc';
  const key = crypto.scryptSync(password, 'salt', 24);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(testo, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return { iv: iv.toString('hex'), contenuto: encrypted };
}

function decifra(cifrato, password) {
  const algorithm = 'aes-192-cbc';
  const key = crypto.scryptSync(password, 'salt', 24);
  const iv = Buffer.from(cifrato.iv, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(cifrato.contenuto, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

const password = 'password-segreta';
const testoCifrato = cifra('Testo segreto', password);
console.log('Testo cifrato:', testoCifrato);

const testoDecifrato = decifra(testoCifrato, password);
console.log('Testo decifrato:', testoDecifrato);

// Generazione di numeri casuali crittograficamente sicuri
const randomBytes = crypto.randomBytes(16).toString('hex');
console.log('Bytes casuali:', randomBytes);
```

## Il Modulo Buffer

Il modulo Buffer gestisce dati binari in Node.js. I Buffer sono simili agli array di interi, ma corrispondono ad allocazioni di memoria raw fuori dal V8 heap.

### Importare il Modulo

```javascript
// Buffer è globale, non necessita import
// const { Buffer } = require('buffer'); // Se necessario esplicito
```

### Creazione e Manipolazione Buffer

```javascript
class BufferUtils {
  // Creazione buffer da diverse fonti
  static createBuffers() {
    console.log('=== CREAZIONE BUFFER ===');
    
    // Da stringa
    const bufFromString = Buffer.from('Hello World', 'utf8');
    console.log('Da stringa:', bufFromString);
    
    // Da array di byte
    const bufFromArray = Buffer.from([72, 101, 108, 108, 111]);
    console.log('Da array:', bufFromArray.toString());
    
    // Allocazione sicura (zerata)
    const bufAlloc = Buffer.alloc(10, 'a');
    console.log('Allocato:', bufAlloc.toString());
    
    // Allocazione non sicura (più veloce)
    const bufAllocUnsafe = Buffer.allocUnsafe(10);
    console.log('Non sicuro (può contenere dati casuali):', bufAllocUnsafe.length);
    
    // Da hex
    const bufHex = Buffer.from('48656c6c6f', 'hex');
    console.log('Da hex:', bufHex.toString());
    
    // Da base64
    const bufBase64 = Buffer.from('SGVsbG8gV29ybGQ=', 'base64');
    console.log('Da base64:', bufBase64.toString());
    
    return {
      bufFromString,
      bufFromArray,
      bufAlloc,
      bufHex,
      bufBase64
    };
  }

  // Conversioni tra encodings
  static convertEncodings(text = 'Hello World! 🌟') {
    console.log('\n=== CONVERSIONI ENCODING ===');
    
    const buffer = Buffer.from(text, 'utf8');
    
    const conversions = {
      original: text,
      utf8: buffer.toString('utf8'),
      hex: buffer.toString('hex'),
      base64: buffer.toString('base64'),
      base64url: buffer.toString('base64url'),
      binary: buffer.toString('binary'),
      ascii: buffer.toString('ascii')
    };
    
    Object.entries(conversions).forEach(([encoding, value]) => {
      console.log(`${encoding.padEnd(10)}: ${value}`);
    });
    
    return conversions;
  }

  // Operazioni su buffer
  static bufferOperations() {
    console.log('\n=== OPERAZIONI BUFFER ===');
    
    const buf1 = Buffer.from('Hello');
    const buf2 = Buffer.from(' World');
    const buf3 = Buffer.from('!');
    
    // Concatenazione
    const concatenated = Buffer.concat([buf1, buf2, buf3]);
    console.log('Concatenato:', concatenated.toString());
    
    // Copia
    const target = Buffer.alloc(20);
    buf1.copy(target, 0);
    buf2.copy(target, buf1.length);
    console.log('Copiato:', target.toString('utf8', 0, buf1.length + buf2.length));
    
    // Slice (crea vista, non copia)
    const sliced = concatenated.slice(0, 5);
    console.log('Slice:', sliced.toString());
    
    // Modifica slice modifica originale
    sliced[0] = 72; // 'H' -> 'H'
    console.log('Dopo modifica slice:', concatenated.toString());
    
    // Confronto
    const buf4 = Buffer.from('Hello');
    const buf5 = Buffer.from('Hello');
    console.log('Buffers uguali:', buf4.equals(buf5));
    console.log('Confronto:', buf4.compare(buf5)); // 0 = uguali, -1 = minore, 1 = maggiore
    
    return {
      concatenated,
      sliced,
      comparison: buf4.equals(buf5)
    };
  }

  // Lettura e scrittura dati numerici
  static numericOperations() {
    console.log('\n=== OPERAZIONI NUMERICHE ===');
    
    const buffer = Buffer.alloc(16);
    
    // Scrittura numeri
    buffer.writeInt8(127, 0);           // byte
    buffer.writeInt16BE(32767, 1);      // short big-endian
    buffer.writeInt32LE(-1234567890, 3);// int little-endian
    buffer.writeFloatBE(3.14159, 7);   // float
    buffer.writeDoubleLE(2.718281828, 11); // double
    
    console.log('Buffer con dati numerici:', buffer.toString('hex'));
    
    // Lettura numeri
    const results = {
      int8: buffer.readInt8(0),
      int16BE: buffer.readInt16BE(1),
      int32LE: buffer.readInt32LE(3),
      floatBE: buffer.readFloatBE(7),
      doubleLE: buffer.readDoubleLE(11)
    };
    
    console.log('Valori letti:', results);
    
    return results;
  }

  // Ricerca e indexOf
  static searchOperations() {
    console.log('\n=== RICERCA IN BUFFER ===');
    
    const text = 'The quick brown fox jumps over the lazy dog';
    const buffer = Buffer.from(text);
    
    // Ricerca substring
    const searchTerm = 'fox';
    const index = buffer.indexOf(searchTerm);
    console.log(`Posizione di "${searchTerm}":`, index);
    
    // Ricerca con offset
    const theIndex1 = buffer.indexOf('the');
    const theIndex2 = buffer.indexOf('the', theIndex1 + 1);
    console.log('Prima occorrenza di "the":', theIndex1);
    console.log('Seconda occorrenza di "the":', theIndex2);
    
    // Ricerca all'indietro
    const lastThe = buffer.lastIndexOf('the');
    console.log('Ultima occorrenza di "the":', lastThe);
    
    // Include
    const includesFox = buffer.includes('fox');
    console.log('Contiene "fox":', includesFox);
    
    return {
      searchTerm,
      index,
      theIndex1,
      theIndex2,
      lastThe,
      includesFox
    };
  }
}

// JSON e Buffer
class BufferJSONHandler {
  static bufferToJSON(buffer) {
    return {
      type: 'Buffer',
      data: Array.from(buffer)
    };
  }

  static bufferFromJSON(json) {
    if (json.type === 'Buffer' && Array.isArray(json.data)) {
      return Buffer.from(json.data);
    }
    throw new Error('Invalid buffer JSON format');
  }

  static customStringify(obj) {
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

  static customParse(jsonString) {
    return JSON.parse(jsonString, (key, value) => {
      if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
        return Buffer.from(value.data);
      }
      return value;
    });
  }
}

// Binary Protocol Handler
class BinaryProtocolHandler {
  constructor() {
    this.MAGIC_NUMBER = 0xDEADBEEF;
    this.VERSION = 1;
  }

  // Serializza messaggio in formato binario
  serializeMessage(type, payload) {
    const payloadBuffer = Buffer.isBuffer(payload) ? payload : Buffer.from(JSON.stringify(payload));
    const headerSize = 16; // magic(4) + version(1) + type(1) + reserved(2) + length(4) + checksum(4)
    
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
    
    // Checksum (semplice XOR)
    const checksum = this.calculateChecksum(buffer.slice(0, headerSize - 4));
    buffer.writeUInt32BE(checksum, headerSize - 4);
    
    return buffer;
  }

  // Deserializza messaggio binario
  deserializeMessage(buffer) {
    if (buffer.length < 16) {
      throw new Error('Buffer troppo piccolo per contenere header');
    }
    
    let offset = 0;
    
    // Leggi header
    const magic = buffer.readUInt32BE(offset); offset += 4;
    const version = buffer.readUInt8(offset); offset += 1;
    const type = buffer.readUInt8(offset); offset += 1;
    const reserved = buffer.readUInt16BE(offset); offset += 2;
    const payloadLength = buffer.readUInt32BE(offset); offset += 4;
    const checksum = buffer.readUInt32BE(offset); offset += 4;
    
    // Verifica magic number
    if (magic !== this.MAGIC_NUMBER) {
      throw new Error(`Magic number non valido: ${magic.toString(16)}`);
    }
    
    // Verifica versione
    if (version !== this.VERSION) {
      throw new Error(`Versione non supportata: ${version}`);
    }
    
    // Verifica checksum
    const expectedChecksum = this.calculateChecksum(buffer.slice(0, 12));
    if (checksum !== expectedChecksum) {
      throw new Error('Checksum non valido');
    }
    
    // Verifica lunghezza payload
    if (buffer.length < 16 + payloadLength) {
      throw new Error('Buffer incompleto');
    }
    
    // Estrai payload
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

// Memory Pool per Buffer
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
    if (size > this.chunkSize) {
      // Allocazione diretta per buffer grandi
      return Buffer.allocUnsafe(size);
    }

    if (this.currentOffset + size > this.poolSize) {
      this.allocateNewPool();
    }

    const buffer = this.currentPool.slice(this.currentOffset, this.currentOffset + size);
    this.currentOffset += size;
    this.pools[this.pools.length - 1].used += size;

    return buffer;
  }

  getStats() {
    return {
      totalPools: this.pools.length,
      currentPoolUsage: this.currentOffset / this.poolSize * 100,
      totalAllocated: this.pools.reduce((total, pool) => total + pool.used, 0),
      totalCapacity: this.pools.length * this.poolSize
    };
  }

  cleanup(maxAge = 300000) { // 5 minuti
    const now = Date.now();
    this.pools = this.pools.filter((pool, index) => {
      const isOld = now - pool.created > maxAge;
      const isCurrent = index === this.pools.length - 1;
      return !isOld || isCurrent;
    });
  }
}

// Esempi di utilizzo
console.log('=== ESEMPI BUFFER AVANZATI ===');

// Test utilities
BufferUtils.createBuffers();
BufferUtils.convertEncodings();
BufferUtils.bufferOperations();
BufferUtils.numericOperations();
BufferUtils.searchOperations();

// Test JSON handling
const testObj = {
  name: 'Test',
  data: Buffer.from('Hello World'),
  timestamp: Date.now()
};

const jsonString = BufferJSONHandler.customStringify(testObj);
console.log('\nJSON con buffer:', jsonString);

const restored = BufferJSONHandler.customParse(jsonString);
console.log('Oggetto ripristinato:', restored);
console.log('Buffer ripristinato:', restored.data.toString());

// Test protocollo binario
const protocol = new BinaryProtocolHandler();
const message = protocol.serializeMessage(1, { message: 'Hello Binary World' });
console.log('\nMessaggio serializzato:', message.toString('hex'));

const deserialized = protocol.deserializeMessage(message);
console.log('Messaggio deserializzato:', JSON.parse(deserialized.payload.toString()));

// Test buffer pool
const pool = new BufferPool();
const buffers = [];
for (let i = 0; i < 10; i++) {
  buffers.push(pool.allocate(512));
}
console.log('\nStatistiche pool:', pool.getStats());
```

## Modulo Process Avanzato

```javascript
// Process monitoring e gestione
class ProcessMonitor {
  constructor(options = {}) {
    this.options = {
      memoryThreshold: options.memoryThreshold || 100 * 1024 * 1024, // 100MB
      cpuThreshold: options.cpuThreshold || 80, // 80%
      monitorInterval: options.monitorInterval || 5000, // 5 secondi
      ...options
    };
    
    this.monitoring = false;
    this.stats = {
      startTime: Date.now(),
      memoryPeaks: [],
      cpuSamples: [],
      events: []
    };
  }

  startMonitoring() {
    if (this.monitoring) return;
    
    this.monitoring = true;
    console.log('🔍 Avvio monitoraggio processo...');
    
    // Informazioni processo base
    this.logProcessInfo();
    
    // Monitoraggio periodico
    this.monitorInterval = setInterval(() => {
      this.checkResources();
    }, this.options.monitorInterval);
    
    // Event listeners
    this.setupEventListeners();
  }

  stopMonitoring() {
    if (!this.monitoring) return;
    
    this.monitoring = false;
    clearInterval(this.monitorInterval);
    console.log('⏹️ Monitoraggio fermato');
    this.printSummary();
  }

  logProcessInfo() {
    console.log('\n=== INFORMAZIONI PROCESSO ===');
    console.log(`PID: ${process.pid}`);
    console.log(`PPID: ${process.ppid}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`Working Directory: ${process.cwd()}`);
    console.log(`Executable: ${process.execPath}`);
    console.log(`Arguments: ${process.argv.slice(2).join(' ')}`);
    
    // Environment variables (filtrate)
    const envKeys = Object.keys(process.env).filter(key => 
      !key.includes('PASSWORD') && !key.includes('SECRET') && !key.includes('KEY')
    );
    console.log(`Environment Variables: ${envKeys.length} (${envKeys.slice(0, 5).join(', ')}...)`);
    
    // Informazioni uptime
    console.log(`System Uptime: ${(process.uptime() / 3600).toFixed(2)} ore`);
  }

  checkResources() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Memoria
    const memoryMB = memUsage.rss / 1024 / 1024;
    this.stats.memoryPeaks.push({
      timestamp: Date.now(),
      rss: memoryMB,
      heapUsed: memUsage.heapUsed / 1024 / 1024,
      heapTotal: memUsage.heapTotal / 1024 / 1024,
      external: memUsage.external / 1024 / 1024
    });
    
    // CPU (approssimativo)
    this.stats.cpuSamples.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });
    
    // Alert se supera soglie
    if (memoryMB > this.options.memoryThreshold / 1024 / 1024) {
      this.logAlert('MEMORIA', `${memoryMB.toFixed(2)} MB`);
    }
    
    // Mantieni solo gli ultimi 100 campioni
    if (this.stats.memoryPeaks.length > 100) {
      this.stats.memoryPeaks = this.stats.memoryPeaks.slice(-100);
    }
    if (this.stats.cpuSamples.length > 100) {
      this.stats.cpuSamples = this.stats.cpuSamples.slice(-100);
    }
  }

  setupEventListeners() {
    // Gestione segnali
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
      process.on(signal, () => {
        this.logEvent(`Ricevuto segnale ${signal}`);
        this.gracefulShutdown(signal);
      });
    });

    // Errori non gestiti
    process.on('uncaughtException', (error) => {
      this.logEvent(`Eccezione non gestita: ${error.message}`);
      console.error('Uncaught Exception:', error);
      // Non fare exit automatico in produzione
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logEvent(`Promise rejection non gestita: ${reason}`);
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Warning
    process.on('warning', (warning) => {
      this.logEvent(`Warning: ${warning.name} - ${warning.message}`);
    });

    // Exit
    process.on('exit', (code) => {
      this.logEvent(`Processo terminato con codice ${code}`);
    });
  }

  logAlert(type, value) {
    const message = `⚠️ ALERT ${type}: ${value}`;
    console.log(message);
    this.logEvent(message);
  }

  logEvent(message) {
    this.stats.events.push({
      timestamp: Date.now(),
      message
    });
  }

  gracefulShutdown(signal) {
    console.log(`\n🛑 Avvio shutdown per segnale ${signal}...`);
    this.stopMonitoring();
    
    // Cleanup risorse
    setTimeout(() => {
      console.log('💀 Forzatura terminazione processo');
      process.exit(1);
    }, 5000);
    
    // Termina normalmente
    process.exit(0);
  }

  printSummary() {
    console.log('\n=== SUMMARY MONITORAGGIO ===');
    
    if (this.stats.memoryPeaks.length > 0) {
      const maxMemory = Math.max(...this.stats.memoryPeaks.map(p => p.rss));
      const avgMemory = this.stats.memoryPeaks.reduce((sum, p) => sum + p.rss, 0) / this.stats.memoryPeaks.length;
      
      console.log(`Memoria - Max: ${maxMemory.toFixed(2)} MB, Avg: ${avgMemory.toFixed(2)} MB`);
    }
    
    console.log(`Eventi registrati: ${this.stats.events.length}`);
    console.log(`Uptime sessione: ${((Date.now() - this.stats.startTime) / 1000 / 60).toFixed(2)} minuti`);
  }

  // Metodi di utilità
  static getSystemInfo() {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid,
      ppid: process.ppid,
      cwd: process.cwd(),
      execPath: process.execPath,
      argv: process.argv,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime()
    };
  }

  static setProcessTitle(title) {
    try {
      process.title = title;
      console.log(`Titolo processo impostato: ${title}`);
    } catch (error) {
      console.error('Errore impostazione titolo processo:', error.message);
    }
  }
}

// Esempio di utilizzo
const monitor = new ProcessMonitor({
  memoryThreshold: 50 * 1024 * 1024, // 50MB
  monitorInterval: 3000 // 3 secondi
});

// Avvia monitoraggio per demo (commenta per non avviare)
// monitor.startMonitoring();

// Simula carico per test
// setTimeout(() => {
//   const bigArray = new Array(1000000).fill('test data');
//   console.log('Creato array grande per test memoria');
// }, 2000);

// Ferma dopo 10 secondi
// setTimeout(() => monitor.stopMonitoring(), 10000);

console.log('\n=== INFO SISTEMA ===');
console.log(ProcessMonitor.getSystemInfo());
```

### Concatenare Buffer
const buf4 = Buffer.concat([buf2, buf3]);
console.log(buf4.toString()); // 'Hello, world!' seguito dai byte di buf3

// Confrontare Buffer
console.log(Buffer.compare(buf1, buf2)); // -1, 0, o 1 (come strcmp)

// Copiare Buffer
buf2.copy(buf1, 0, 0, 5);
console.log(buf1.toString()); // 'Hello'
```

## Il Modulo Process

L'oggetto `process` è un oggetto globale in Node.js che fornisce informazioni e controllo sul processo corrente di Node.js.

### Utilizzo di Process

```javascript
// Informazioni sull'ambiente
console.log('Versione Node.js:', process.version);
console.log('Piattaforma:', process.platform);
console.log('Directory corrente:', process.cwd());

// Argomenti della riga di comando
console.log('Argomenti:', process.argv);

// Variabili d'ambiente
console.log('PATH:', process.env.PATH);

// Gestione degli eventi di processo
process.on('exit', (code) => {
  console.log(`Il processo sta terminando con codice: ${code}`);
});

process.on('uncaughtException', (err) => {
  console.error('Eccezione non gestita:', err);
  process.exit(1);
});

// Terminare il processo
// process.exit(0); // Uscita con successo

// Utilizzo della memoria
console.log('Utilizzo memoria:', process.memoryUsage());

// Tempo di esecuzione
console.log('Tempo di esecuzione (secondi):', process.uptime());
```

## Il Modulo Querystring

Il modulo `querystring` fornisce utilità per analizzare e formattare stringhe di query URL.

### Importare il Modulo

```javascript
const querystring = require('querystring');
```

### Funzionalità Principali

```javascript
// Analizzare una stringa di query
const qs = 'nome=Mario&cognome=Rossi&età=30';
const parsed = querystring.parse(qs);
console.log(parsed); // { nome: 'Mario', cognome: 'Rossi', 'età': '30' }

// Formattare un oggetto in stringa di query
const obj = { nome: 'Mario', cognome: 'Rossi', età: 30 };
const stringified = querystring.stringify(obj);
console.log(stringified); // 'nome=Mario&cognome=Rossi&età=30'

// Escape di stringhe per URL
const escaped = querystring.escape('Ciao Mondo!');
console.log(escaped); // 'Ciao%20Mondo%21'

// Unescape di stringhe URL
const unescaped = querystring.unescape('Ciao%20Mondo%21');
console.log(unescaped); // 'Ciao Mondo!'
```

## Il Modulo Zlib

Il modulo `zlib` fornisce funzionalità di compressione e decompressione implementando Gzip, Deflate/Inflate e Brotli.

### Importare il Modulo

```javascript
const zlib = require('zlib');
const fs = require('fs');
const { pipeline } = require('stream');
```

### Funzionalità Principali

#### Compressione e Decompressione Base

```javascript
const zlib = require('zlib');

// Compressione Gzip
const input = 'Questo è un testo di esempio per la compressione';

zlib.gzip(input, (err, compressed) => {
  if (err) throw err;
  
  console.log('Dimensione originale:', input.length);
  console.log('Dimensione compressa:', compressed.length);
  console.log('Rapporto di compressione:', (compressed.length / input.length * 100).toFixed(2) + '%');
  
  // Decompressione
  zlib.gunzip(compressed, (err, decompressed) => {
    if (err) throw err;
    console.log('Testo decompresso:', decompressed.toString());
  });
});

// Versione sincrona
const compressed = zlib.gzipSync(input);
const decompressed = zlib.gunzipSync(compressed);
console.log('Sincrono - Decompresso:', decompressed.toString());
```

#### Compressione di File con Stream

```javascript
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream');

// Comprimere un file
function compressFile(inputFile, outputFile) {
  pipeline(
    fs.createReadStream(inputFile),
    zlib.createGzip({ level: 9 }), // Massima compressione
    fs.createWriteStream(outputFile),
    (err) => {
      if (err) {
        console.error('Errore compressione:', err);
      } else {
        console.log(`File compresso: ${inputFile} -> ${outputFile}`);
      }
    }
  );
}

// Decomprimere un file
function decompressFile(inputFile, outputFile) {
  pipeline(
    fs.createReadStream(inputFile),
    zlib.createGunzip(),
    fs.createWriteStream(outputFile),
    (err) => {
      if (err) {
        console.error('Errore decompressione:', err);
      } else {
        console.log(`File decompresso: ${inputFile} -> ${outputFile}`);
      }
    }
  );
}

// Esempio di utilizzo
// compressFile('documento.txt', 'documento.txt.gz');
// decompressFile('documento.txt.gz', 'documento-recuperato.txt');
```

#### Utility per Analisi Compressione

```javascript
const zlib = require('zlib');
const fs = require('fs').promises;

class CompressionAnalyzer {
  static async analyzeFile(filePath) {
    try {
      const originalData = await fs.readFile(filePath);
      const originalSize = originalData.length;

      // Test diversi algoritmi
      const gzipCompressed = zlib.gzipSync(originalData, { level: 9 });
      const deflateCompressed = zlib.deflateSync(originalData, { level: 9 });
      const brotliCompressed = zlib.brotliCompressSync(originalData);

      return {
        originalSize,
        gzip: {
          size: gzipCompressed.length,
          ratio: (gzipCompressed.length / originalSize * 100).toFixed(2) + '%',
          savings: ((originalSize - gzipCompressed.length) / originalSize * 100).toFixed(2) + '%'
        },
        deflate: {
          size: deflateCompressed.length,
          ratio: (deflateCompressed.length / originalSize * 100).toFixed(2) + '%',
          savings: ((originalSize - deflateCompressed.length) / originalSize * 100).toFixed(2) + '%'
        },
        brotli: {
          size: brotliCompressed.length,
          ratio: (brotliCompressed.length / originalSize * 100).toFixed(2) + '%',
          savings: ((originalSize - brotliCompressed.length) / originalSize * 100).toFixed(2) + '%'
        }
      };
    } catch (error) {
      throw new Error(`Errore nell'analisi del file: ${error.message}`);
    }
  }

  static printAnalysis(analysis) {
    console.log('\n=== ANALISI COMPRESSIONE ===');
    console.log(`Dimensione originale: ${analysis.originalSize} byte`);
    console.log('\nRisultati compressione:');
    
    ['gzip', 'deflate', 'brotli'].forEach(algo => {
      const data = analysis[algo];
      console.log(`${algo.toUpperCase()}: ${data.size} byte (${data.ratio}, risparmio: ${data.savings})`);
    });

    // Trova il migliore
    const algorithms = ['gzip', 'deflate', 'brotli'];
    const best = algorithms.reduce((best, current) => {
      return analysis[current].size < analysis[best].size ? current : best;
    });

    console.log(`\n🏆 Migliore algoritmo: ${best.toUpperCase()}`);
  }
}

// Esempio di utilizzo
/*
CompressionAnalyzer.analyzeFile('./esempio.txt')
  .then(analysis => CompressionAnalyzer.printAnalysis(analysis))
  .catch(console.error);
*/
```

## Il Modulo Stream Avanzato

### Transform Stream Personalizzati

```javascript
const { Transform, Readable, Writable } = require('stream');

// Transform stream per validazione e trasformazione dati
class DataValidatorTransform extends Transform {
  constructor(schema, options = {}) {
    super({ objectMode: true, ...options });
    this.schema = schema;
    this.validCount = 0;
    this.invalidCount = 0;
  }

  _transform(chunk, encoding, callback) {
    try {
      const data = typeof chunk === 'string' ? JSON.parse(chunk) : chunk;
      
      // Validazione base
      const isValid = this.validateData(data);
      
      if (isValid) {
        this.validCount++;
        // Trasforma i dati se necessario
        const transformedData = this.transformData(data);
        this.push(transformedData);
      } else {
        this.invalidCount++;
        this.emit('invalid-data', data);
      }
      
      callback();
    } catch (error) {
      callback(error);
    }
  }

  validateData(data) {
    // Implementa logica di validazione basata su schema
    for (const [field, rules] of Object.entries(this.schema)) {
      if (rules.required && !data[field]) {
        return false;
      }
      
      if (data[field] && rules.type && typeof data[field] !== rules.type) {
        return false;
      }
      
      if (rules.min && data[field] < rules.min) {
        return false;
      }
      
      if (rules.max && data[field] > rules.max) {
        return false;
      }
    }
    
    return true;
  }

  transformData(data) {
    // Aggiungi metadata
    return {
      ...data,
      _processed: true,
      _timestamp: new Date().toISOString(),
      _id: this.generateId()
    };
  }

  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  _flush(callback) {
    console.log(`Elaborazione completata: ${this.validCount} validi, ${this.invalidCount} non validi`);
    callback();
  }
}

// Readable stream che genera dati di test
class TestDataGenerator extends Readable {
  constructor(count, options = {}) {
    super({ objectMode: true, ...options });
    this.count = count;
    this.generated = 0;
  }

  _read() {
    if (this.generated >= this.count) {
      this.push(null); // Fine stream
      return;
    }

    const data = {
      name: `User ${this.generated}`,
      age: Math.floor(Math.random() * 80) + 18,
      email: `user${this.generated}@example.com`,
      valid: Math.random() > 0.2 // 80% dei dati sono validi
    };

    // Occasionalmente genera dati non validi per test
    if (!data.valid) {
      delete data.age; // Rimuovi campo richiesto
    }

    this.generated++;
    this.push(data);
  }
}

// Writable stream per salvare dati processati
class DataSaver extends Writable {
  constructor(outputFile, options = {}) {
    super({ objectMode: true, ...options });
    this.outputFile = outputFile;
    this.savedCount = 0;
    this.fs = require('fs');
    this.stream = this.fs.createWriteStream(outputFile);
  }

  _write(chunk, encoding, callback) {
    try {
      const jsonLine = JSON.stringify(chunk) + '\n';
      this.stream.write(jsonLine);
      this.savedCount++;
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _final(callback) {
    this.stream.end();
    console.log(`Salvati ${this.savedCount} record in ${this.outputFile}`);
    callback();
  }
}

// Esempio di utilizzo pipeline completa
function processDataStream() {
  const generator = new TestDataGenerator(100);
  
  const validator = new DataValidatorTransform({
    name: { required: true, type: 'string' },
    age: { required: true, type: 'number', min: 0, max: 120 },
    email: { required: true, type: 'string' }
  });

  const saver = new DataSaver('./processed-data.jsonl');

  // Gestisci dati non validi
  validator.on('invalid-data', (data) => {
    console.log('Dato non valido:', data);
  });

  // Pipeline
  const { pipeline } = require('stream');
  
  pipeline(
    generator,
    validator,
    saver,
    (err) => {
      if (err) {
        console.error('Errore nella pipeline:', err);
      } else {
        console.log('Pipeline completata con successo');
      }
    }
  );
}

// processDataStream();
```

## Modulo Child Process Avanzato

### Gestione Processi con Timeout e Retry

```javascript
const { spawn, exec, fork } = require('child_process');
const { EventEmitter } = require('events');

class ProcessManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      timeout: options.timeout || 30000,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      ...options
    };
    this.processes = new Map();
  }

  async execWithRetry(command, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        const result = await this.execWithTimeout(command, {
          ...this.options,
          ...options
        });
        
        this.emit('process-success', { command, attempt, result });
        return result;
      } catch (error) {
        lastError = error;
        this.emit('process-retry', { command, attempt, error });
        
        if (attempt < this.options.maxRetries) {
          await this.delay(this.options.retryDelay * attempt);
        }
      }
    }
    
    this.emit('process-failed', { command, attempts: this.options.maxRetries, error: lastError });
    throw lastError;
  }

  execWithTimeout(command, options = {}) {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout || this.options.timeout;
      let timedOut = false;

      const child = exec(command, options, (error, stdout, stderr) => {
        if (timedOut) return;
        
        if (error) {
          reject(new Error(`Command failed: ${error.message}\nStderr: ${stderr}`));
        } else {
          resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            code: 0
          });
        }
      });

      // Timeout handling
      const timeoutId = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
        reject(new Error(`Command timeout after ${timeout}ms: ${command}`));
      }, timeout);

      child.on('exit', () => {
        clearTimeout(timeoutId);
      });

      // Salva il processo per eventuale gestione
      const processId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      this.processes.set(processId, child);

      child.on('exit', () => {
        this.processes.delete(processId);
      });
    });
  }

  spawnMonitored(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        this.emit('stdout', { command, args, chunk });
      });

      child.stderr.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
        this.emit('stderr', { command, args, chunk });
      });

      child.on('close', (code, signal) => {
        const result = {
          code,
          signal,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        };

        if (code === 0) {
          resolve(result);
        } else {
          reject(new Error(`Process failed with code ${code}\nStderr: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start process: ${error.message}`));
      });

      // Salva il processo
      const processId = `spawn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      this.processes.set(processId, child);

      child.on('close', () => {
        this.processes.delete(processId);
      });
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  killAll(signal = 'SIGTERM') {
    const killed = [];
    
    for (const [id, process] of this.processes) {
      try {
        process.kill(signal);
        killed.push(id);
      } catch (error) {
        console.error(`Errore nell'uccidere il processo ${id}:`, error.message);
      }
    }
    
    return killed;
  }

  getActiveProcesses() {
    return Array.from(this.processes.keys());
  }
}

// Esempio di utilizzo
const processManager = new ProcessManager({
  timeout: 10000,
  maxRetries: 2
});

processManager.on('process-retry', ({ command, attempt, error }) => {
  console.log(`Tentativo ${attempt} fallito per "${command}": ${error.message}`);
});

processManager.on('stdout', ({ command, chunk }) => {
  console.log(`[${command}] ${chunk}`);
});

// Test del process manager
async function testProcessManager() {
  try {
    // Comando che dovrebbe funzionare
    const result = await processManager.execWithRetry('echo "Hello World"');
    console.log('Risultato:', result.stdout);

    // Comando con retry (fallirà)
    // await processManager.execWithRetry('nonexistent-command');

    // Spawn monitored
    const lsResult = await processManager.spawnMonitored('ls', ['-la']);
    console.log('LS Output:', lsResult.stdout);

  } catch (error) {
    console.error('Errore:', error.message);
  }
}

// testProcessManager();
```

```javascript
// Comprimere una stringa
const input = 'Questo è un testo che verrà compresso con gzip';

zlib.gzip(input, (err, compressed) => {
  if (err) {
    console.error('Errore durante la compressione:', err);
    return;
  }
  
  console.log('Dimensione originale:', input.length, 'byte');
  console.log('Dimensione compressa:', compressed.length, 'byte');
  
  // Decomprimere
  zlib.gunzip(compressed, (err, decompressed) => {
    if (err) {
      console.error('Errore durante la decompressione:', err);
      return;
    }
    
    console.log('Testo decompresso:', decompressed.toString());
  });
});

// Comprimere un file
const gzip = zlib.createGzip();
const input2 = fs.createReadStream('input.txt');
const output = fs.createWriteStream('input.txt.gz');

input2.pipe(gzip).pipe(output);

// Decomprimere un file
const gunzip = zlib.createGunzip();
const input3 = fs.createReadStream('input.txt.gz');
const output2 = fs.createWriteStream('output.txt');

input3.pipe(gunzip).pipe(output2);
```

## Pattern Avanzati e Best Practices

### Ottimizzazione Performance e Memoria

```javascript
const util = require('util');
const { performance, PerformanceObserver } = require('perf_hooks');

class PerformanceProfiler {
  constructor() {
    this.measurements = new Map();
    this.setupPerformanceObserver();
  }

  setupPerformanceObserver() {
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!this.measurements.has(entry.name)) {
          this.measurements.set(entry.name, []);
        }
        this.measurements.get(entry.name).push({
          duration: entry.duration,
          timestamp: entry.startTime
        });
      });
    });
    obs.observe({ entryTypes: ['measure', 'function'] });
  }

  // Decorator per misurare performance di funzioni
  measureFunction(fn, name) {
    const measureName = name || fn.name || 'anonymous';
    
    if (fn.constructor.name === 'AsyncFunction') {
      return async (...args) => {
        performance.mark(`${measureName}-start`);
        try {
          const result = await fn(...args);
          performance.mark(`${measureName}-end`);
          performance.measure(measureName, `${measureName}-start`, `${measureName}-end`);
          return result;
        } catch (error) {
          performance.mark(`${measureName}-end`);
          performance.measure(measureName, `${measureName}-start`, `${measureName}-end`);
          throw error;
        }
      };
    } else {
      return (...args) => {
        performance.mark(`${measureName}-start`);
        try {
          const result = fn(...args);
          performance.mark(`${measureName}-end`);
          performance.measure(measureName, `${measureName}-start`, `${measureName}-end`);
          return result;
        } catch (error) {
          performance.mark(`${measureName}-end`);
          performance.measure(measureName, `${measureName}-start`, `${measureName}-end`);
          throw error;
        }
      };
    }
  }

  getPerformanceReport(functionName) {
    const measurements = this.measurements.get(functionName);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const durations = measurements.map(m => m.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    
    return {
      functionName,
      calls: measurements.length,
      average: avg.toFixed(3) + 'ms',
      min: min.toFixed(3) + 'ms',
      max: max.toFixed(3) + 'ms'
    };
  }
}

// Sistema di Cache Avanzato
class AdvancedCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.metadata = new Map();
    this.options = {
      ttl: options.ttl || 300000, // 5 minuti default
      maxSize: options.maxSize || 1000,
      onEvict: options.onEvict || (() => {}),
      ...options
    };
  }

  set(key, value, ttl = null) {
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const expiresAt = ttl ? Date.now() + ttl : Date.now() + this.options.ttl;
    
    this.cache.set(key, value);
    this.metadata.set(key, {
      createdAt: Date.now(),
      expiresAt,
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }

    const meta = this.metadata.get(key);
    
    if (Date.now() > meta.expiresAt) {
      this.delete(key);
      return undefined;
    }

    meta.accessCount++;
    meta.lastAccessed = Date.now();

    return this.cache.get(key);
  }

  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, meta] of this.metadata) {
      if (meta.lastAccessed < oldestTime) {
        oldestTime = meta.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  delete(key) {
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.metadata.delete(key);
    
    if (this.options.onEvict) {
      this.options.onEvict(key, value);
    }
    
    return value;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: this.cache.size > 0 ? 'N/A' : '0%'
    };
  }
}

// Error Handler Avanzato
class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.errorHistory = [];
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    process.on('uncaughtException', (error) => {
      this.logError('UNCAUGHT_EXCEPTION', error);
      console.error('FATAL: Uncaught Exception detected.');
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.logError('UNHANDLED_REJECTION', reason);
      console.error('Unhandled Promise Rejection:', reason);
    });
  }

  logError(type, error) {
    const errorKey = `${type}:${error.name || 'Unknown'}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    
    this.errorHistory.push({
      timestamp: new Date().toISOString(),
      type,
      name: error.name,
      message: error.message,
      count: this.errorCounts.get(errorKey)
    });

    if (this.errorHistory.length > 50) {
      this.errorHistory.shift();
    }
  }

  withRetry(fn, options = {}) {
    const { maxRetries = 3, retryDelay = 1000 } = options;

    return async (...args) => {
      let lastError;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await fn(...args);
        } catch (error) {
          lastError = error;
          
          if (attempt === maxRetries) {
            this.logError('RETRY_EXHAUSTED', error);
            throw error;
          }

          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    };
  }

  getErrorReport() {
    return {
      totalErrors: this.errorHistory.length,
      recentErrors: this.errorHistory.slice(-5),
      topErrors: Array.from(this.errorCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
    };
  }
}
```

### Integrazione con Ecosistema Node.js

```javascript
// Event-driven microservice communication
class MicroserviceEventBus {
  constructor() {
    this.EventEmitter = require('events');
    this.emitter = new this.EventEmitter();
    this.services = new Map();
    this.messageHistory = [];
  }

  registerService(serviceName, config = {}) {
    const crypto = require('crypto');
    const serviceId = crypto.randomUUID();
    
    this.services.set(serviceName, {
      id: serviceId,
      config,
      startTime: Date.now(),
      messageCount: 0
    });

    console.log(`📡 Service registered: ${serviceName}`);
    return serviceId;
  }

  publishEvent(eventName, data, serviceName = 'unknown') {
    const event = {
      id: require('crypto').randomUUID(),
      name: eventName,
      data,
      source: serviceName,
      timestamp: Date.now()
    };

    this.messageHistory.push(event);
    
    if (this.messageHistory.length > 100) {
      this.messageHistory.shift();
    }

    if (this.services.has(serviceName)) {
      this.services.get(serviceName).messageCount++;
    }

    this.emitter.emit(eventName, event);
    console.log(`📤 Event published: ${eventName} from ${serviceName}`);
    return event.id;
  }

  subscribeToService(serviceName, eventPattern, handler) {
    this.emitter.on(eventPattern, (event) => {
      if (event.source === serviceName || serviceName === '*') {
        handler(event);
      }
    });

    console.log(`📥 Subscription created: ${serviceName}/${eventPattern}`);
  }

  getServiceStats() {
    return {
      totalServices: this.services.size,
      totalMessages: this.messageHistory.length,
      services: Array.from(this.services.entries()).map(([name, info]) => ({
        name,
        messageCount: info.messageCount,
        uptime: Date.now() - info.startTime
      }))
    };
  }
}

// File watcher per hot-reload
class AdvancedFileWatcher {
  constructor(watchPath, options = {}) {
    this.fs = require('fs');
    this.path = require('path');
    this.EventEmitter = require('events');
    this.emitter = new this.EventEmitter();
    
    this.watchPath = watchPath;
    this.options = {
      recursive: true,
      debounceMs: 100,
      ignorePatterns: [/node_modules/, /\.git/],
      ...options
    };
    
    this.watchers = new Map();
    this.debounceTimers = new Map();
  }

  start() {
    this.scanDirectory(this.watchPath);
    console.log(`👀 File watcher started on: ${this.watchPath}`);
  }

  scanDirectory(dirPath) {
    try {
      const entries = this.fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = this.path.join(dirPath, entry.name);
        
        if (this.shouldIgnore(fullPath)) {
          continue;
        }

        if (entry.isDirectory() && this.options.recursive) {
          this.scanDirectory(fullPath);
        } else if (entry.isFile()) {
          this.watchFile(fullPath);
        }
      }
    } catch (error) {
      this.emitter.emit('error', error);
    }
  }

  watchFile(filePath) {
    if (this.watchers.has(filePath)) {
      return;
    }

    try {
      const watcher = this.fs.watch(filePath, (eventType) => {
        this.handleFileChange(filePath, eventType);
      });

      this.watchers.set(filePath, watcher);
    } catch (error) {
      this.emitter.emit('error', error);
    }
  }

  handleFileChange(filePath, eventType) {
    if (this.debounceTimers.has(filePath)) {
      clearTimeout(this.debounceTimers.get(filePath));
    }

    const timer = setTimeout(() => {
      this.emitter.emit('fileChanged', { path: filePath, type: eventType });
      this.debounceTimers.delete(filePath);
    }, this.options.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  shouldIgnore(filePath) {
    return this.options.ignorePatterns.some(pattern => {
      return pattern instanceof RegExp ? pattern.test(filePath) : filePath.includes(pattern);
    });
  }

  stop() {
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }

    this.watchers.clear();
    this.debounceTimers.clear();
    console.log('👁️ File watcher stopped');
  }

  on(event, handler) {
    this.emitter.on(event, handler);
  }
}

// Esempi di utilizzo
console.log('\n=== ESEMPI PATTERN AVANZATI ===');

const profiler = new PerformanceProfiler();
const cache = new AdvancedCache({ ttl: 5000, maxSize: 100 });
const errorHandler = new ErrorHandler();

// Test cache
cache.set('user:123', { name: 'Mario', role: 'admin' });
console.log('Cache test:', cache.get('user:123'));
console.log('Cache stats:', cache.getStats());

// Test event bus
const eventBus = new MicroserviceEventBus();
const userService = eventBus.registerService('user-service');

eventBus.subscribeToService('user-service', 'user.created', (event) => {
  console.log('Ricevuto evento user.created:', event.data);
});

eventBus.publishEvent('user.created', { userId: 123 }, 'user-service');
console.log('Event bus stats:', eventBus.getServiceStats());
```

## Conclusioni

I moduli core di Node.js forniscono una solida base per sviluppare applicazioni server-side robuste e performanti. La comprensione approfondita di questi moduli e l'implementazione di pattern avanzati è fondamentale per:

### 🎯 **Obiettivi Raggiunti**
- **Compressione intelligente** con algoritmi ottimali per tipo di dato
- **Crittografia enterprise-ready** con firme digitali e JWT
- **Gestione buffer avanzata** con pool di memoria e protocolli binari  
- **Monitoraggio processo completo** con metriche performance
- **Pattern di integrazione moderni** per microservizi e framework

### 🚀 **Best Practices Implementate**
- Error handling con retry automatico e circuit breaker
- Performance profiling con metriche dettagliate
- Cache intelligente con TTL e LRU eviction
- Event-driven architecture per scalabilità
- File watching ottimizzato per sviluppo

### 📈 **Valore per Produzione**
- **Robustezza**: Gestione errori completa e graceful shutdown
- **Performance**: Ottimizzazioni memoria, CPU e I/O
- **Osservabilità**: Metriche, logging e debugging avanzati
- **Scalabilità**: Pattern async, event-driven e microservizi
- **Sicurezza**: Crittografia, validazione e rate limiting

Questi moduli core rappresentano la **spina dorsale** dell'ecosistema Node.js e la loro padronanza distingue sviluppatori esperti da principianti, abilitando la creazione di applicazioni **production-ready** e **enterprise-grade**.