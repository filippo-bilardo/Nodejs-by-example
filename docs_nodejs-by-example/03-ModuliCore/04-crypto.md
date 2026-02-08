# Modulo Crypto - Crittografia in Node.js

## 📋 Indice

- [Introduzione](#introduzione)
- [Hash e Digest](#hash-e-digest)
- [Cifratura e Decifratura](#cifratura-e-decifratura)
- [Firme Digitali e Certificati](#firme-digitali-e-certificati)
- [HMAC e Autenticazione](#hmac-e-autenticazione)
- [JWT Implementazione](#jwt-implementazione)
- [OTP (One-Time Password)](#otp-one-time-password)
- [Rate Limiting Crittografico](#rate-limiting-crittografico)
- [Best Practices](#best-practices)
- [Risorse Utili](#risorse-utili)

---

## Introduzione

Il modulo `crypto` fornisce funzionalità crittografiche che includono un set di wrapper per le funzioni **hash, HMAC, cifratura, decifratura, firma e verifica** di OpenSSL.

### 🔐 Perché è Importante

- **Sicurezza Password**: Hash sicuri per memorizzare password
- **Comunicazione Sicura**: Cifratura dati sensibili
- **Autenticazione**: HMAC per verificare integrità messaggi
- **Firme Digitali**: Garantire autenticità e non ripudio
- **Token Sicuri**: JWT, session token, API keys

### 📦 Importare il Modulo

```javascript
const crypto = require('crypto');
const { promisify } = require('util');
```

---

## Hash e Digest

Gli **hash crittografici** sono funzioni unidirezionali che convertono dati di qualsiasi dimensione in un valore di dimensione fissa (digest).

### 🎯 Caratteristiche Hash

- **Deterministico**: Stesso input → stesso output
- **Veloce**: Calcolo rapido
- **Unidirezionale**: Impossibile invertire
- **Collision-resistant**: Difficile trovare due input con stesso hash
- **Avalanche effect**: Piccola modifica input → grande cambiamento output

### 📊 Algoritmi Hash Comuni

| Algoritmo | Output | Sicurezza | Uso |
|-----------|--------|-----------|-----|
| MD5 | 128 bit | ❌ Debole | ❌ Deprecato |
| SHA-1 | 160 bit | ⚠️ Debole | ⚠️ Legacy only |
| SHA-256 | 256 bit | ✅ Forte | ✅ Password, checksum |
| SHA-512 | 512 bit | ✅ Forte | ✅ Password sicure |
| PBKDF2 | Variabile | ✅ Forte | ✅ **Password hashing** |

### 💻 Implementazione Completa

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

  // Hash con salt per password (PBKDF2)
  static hashPassword(password, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(16).toString('hex');
    }
    
    // PBKDF2: Password-Based Key Derivation Function 2
    // Iterazioni alte rendono il brute-force più difficile
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    
    return {
      hash,
      salt,
      combined: `${salt}:${hash}` // Formato storage
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

  // Hash di file con stream
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
      throw new Error(`Errore calcolo checksum: ${error.message}`);
    }
  }
}

// ✅ Esempi di utilizzo
console.log('=== HASH EXAMPLES ===\n');

// Hash semplice
const simpleHash = HashUtil.hash('Hello World');
console.log('SHA-256:', simpleHash);

// Password hashing
const password = 'mySecurePassword123!';
const hashed = HashUtil.hashPassword(password);
console.log('\nPassword hash:', hashed.combined);

// Verifica password
const isValid = HashUtil.verifyPassword(password, hashed.combined);
console.log('Password valida:', isValid);

const wrongPassword = HashUtil.verifyPassword('wrongPassword', hashed.combined);
console.log('Password errata:', wrongPassword);
```

### ⚠️ NON Fare

```javascript
// ❌ MAI usare hash semplici per password
const badHash = crypto.createHash('sha256').update(password).digest('hex');

// ❌ MAI usare MD5 o SHA-1 per sicurezza
const deprecatedHash = crypto.createHash('md5').update(data).digest('hex');

// ❌ MAI usare salt statico
const staticSalt = 'sempre-lo-stesso'; // PERICOLOSO!
```

---

## Cifratura e Decifratura

La **cifratura** protegge dati sensibili rendendoli illeggibili senza la chiave corretta.

### 🔑 Tipi di Cifratura

**Cifratura Simmetrica** (stessa chiave per cifrare e decifrare)
- AES-256-GCM ✅ Raccomandato
- AES-256-CBC ⚠️ OK ma meno sicuro di GCM
- AES-192-CBC ⚠️ Legacy

**Cifratura Asimmetrica** (chiave pubblica/privata)
- RSA ✅ Per scambio chiavi
- ECDH ✅ Per key exchange

### 💻 Implementazione Completa

```javascript
const crypto = require('crypto');

class CryptoUtil {
  constructor(algorithm = 'aes-256-gcm') {
    this.algorithm = algorithm;
  }

  // Genera chiave sicura
  generateKey(length = 32) {
    return crypto.randomBytes(length);
  }

  // Cifratura con AES-GCM (autenticata)
  encrypt(text, key) {
    try {
      const iv = crypto.randomBytes(16); // Initialization Vector
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
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
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      
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

  // Cifratura file con stream
  async encryptFile(inputPath, outputPath, key) {
    const fs = require('fs');
    const { pipeline } = require('stream');
    
    return new Promise((resolve, reject) => {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      const outputStream = fs.createWriteStream(outputPath);
      outputStream.write(iv); // Scrivi IV all'inizio
      
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
      
      // Leggi IV dai primi 16 byte
      const ivBuffer = Buffer.alloc(16);
      let ivRead = false;
      
      inputStream.on('readable', () => {
        if (!ivRead) {
          const chunk = inputStream.read(16);
          if (chunk) {
            chunk.copy(ivBuffer);
            ivRead = true;
            
            const decipher = crypto.createDecipheriv(this.algorithm, key, ivBuffer);
            
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

// ✅ Esempi di utilizzo
console.log('\n=== ENCRYPTION EXAMPLES ===\n');

const cryptoUtil = new CryptoUtil('aes-256-gcm');
const key = crypto.randomBytes(32); // Chiave 256-bit

const plaintext = 'Questo è un messaggio segreto!';
const encrypted = cryptoUtil.encrypt(plaintext, key);
console.log('Testo cifrato:', encrypted.encrypted);
console.log('IV:', encrypted.iv);
console.log('Auth Tag:', encrypted.authTag);

const decrypted = cryptoUtil.decrypt(encrypted, key);
console.log('Testo decifrato:', decrypted);
```

### 🛡️ Best Practices Cifratura

1. **Usa AES-256-GCM**: Autenticazione integrata
2. **IV Unico**: Genera nuovo IV per ogni cifratura
3. **Chiavi Sicure**: `crypto.randomBytes(32)` per chiavi 256-bit
4. **Non Hardcode Chiavi**: Usa variabili ambiente o key management system
5. **Verifica Authentication Tag**: Protegge da tampering

---

## Firme Digitali e Certificati

Le **firme digitali** garantiscono **autenticità** e **integrità** dei dati.

### 🔐 Come Funzionano

1. **Sender**: Firma documento con chiave privata
2. **Receiver**: Verifica firma con chiave pubblica
3. **Garanzie**:
   - ✅ Autenticità (chi ha firmato)
   - ✅ Integrità (nessuna modifica)
   - ✅ Non ripudio (impossibile negare)

### 💻 Implementazione Completa

```javascript
const crypto = require('crypto');

class DigitalSignature {
  // Genera coppia chiavi RSA
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

  // Firma messaggio
  sign(message, privateKey, algorithm = 'sha256') {
    const sign = crypto.createSign(algorithm);
    sign.update(message);
    return sign.sign(privateKey, 'hex');
  }

  // Verifica firma
  verify(message, signature, publicKey, algorithm = 'sha256') {
    const verify = crypto.createVerify(algorithm);
    verify.update(message);
    return verify.verify(publicKey, signature, 'hex');
  }

  // Sistema completo firma documenti
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

  // Verifica documento firmato
  verifyDocument(signedDocument, publicKey) {
    try {
      const { signature, originalDocument, ...signatureData } = signedDocument;
      
      // Verifica hash documento
      const documentHash = crypto
        .createHash('sha256')
        .update(originalDocument)
        .digest('hex');
      
      if (documentHash !== signatureData.document) {
        return {
          valid: false,
          reason: 'Document hash mismatch - documento modificato'
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

// ✅ Esempi di utilizzo
console.log('\n=== DIGITAL SIGNATURE EXAMPLES ===\n');

const signer = new DigitalSignature();
const keyPair = signer.generateKeyPair();

console.log('Chiave pubblica:', keyPair.publicKey.substring(0, 50) + '...');
console.log('Chiave privata:', keyPair.privateKey.substring(0, 50) + '...\n');

const document = 'Contratto di vendita per €10.000';
const signedDoc = signer.signDocument(document, keyPair.privateKey, {
  author: 'Mario Rossi',
  department: 'Legal'
});

console.log('Documento firmato:', signedDoc.signature);

const verification = signer.verifyDocument(signedDoc, keyPair.publicKey);
console.log('Verifica:', verification);

// Test tampering
signedDoc.originalDocument = 'Contratto di vendita per €1.000'; // Modifica
const tampered = signer.verifyDocument(signedDoc, keyPair.publicKey);
console.log('Verifica documento modificato:', tampered);
```

---

## JWT Implementazione

**JSON Web Token (JWT)** è uno standard per creare token di autenticazione.

### 📦 Struttura JWT

```
Header.Payload.Signature
```

- **Header**: `{ "alg": "HS256", "typ": "JWT" }`
- **Payload**: `{ "userId": 123, "role": "admin", "exp": ... }`
- **Signature**: HMAC-SHA256(base64(header) + "." + base64(payload), secret)

### 💻 Implementazione Semplificata

```javascript
const crypto = require('crypto');

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

// ✅ Esempi di utilizzo
console.log('\n=== JWT EXAMPLES ===\n');

const jwtPayload = {
  userId: 123,
  role: 'admin',
  exp: Math.floor(Date.now() / 1000) + 3600 // Scade tra 1 ora
};

const token = SimpleJWT.encode(jwtPayload, 'mio-segreto-super-sicuro');
console.log('JWT Token:', token);

const decoded = SimpleJWT.decode(token, 'mio-segreto-super-sicuro');
console.log('JWT Decodificato:', decoded);

// Test token scaduto
const expiredPayload = {
  userId: 456,
  role: 'user',
  exp: Math.floor(Date.now() / 1000) - 3600 // Scaduto 1 ora fa
};
const expiredToken = SimpleJWT.encode(expiredPayload, 'secret');
const expiredResult = SimpleJWT.decode(expiredToken, 'secret');
console.log('Token scaduto:', expiredResult);
```

---

## HMAC e Autenticazione

**HMAC** (Hash-based Message Authentication Code) verifica **integrità** e **autenticità** dei messaggi.

### 💻 Implementazione API Authentication

```javascript
const crypto = require('crypto');

class AuthenticationUtils {
  // Genera HMAC
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
    
    // Confronto timing-safe per prevenire timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    return {
      valid: isValid,
      reason: isValid ? null : 'Invalid signature'
    };
  }
}

// ✅ Esempi di utilizzo
console.log('\n=== HMAC API AUTHENTICATION ===\n');

const apiSecret = 'my-api-secret-key-12345';
const method = 'POST';
const url = '/api/users';
const body = JSON.stringify({ name: 'Mario', email: 'mario@example.com' });
const timestamp = Math.floor(Date.now() / 1000);

const signature = AuthenticationUtils.generateAPISignature(method, url, body, timestamp, apiSecret);
console.log('API Signature:', signature);

const verification = AuthenticationUtils.verifyAPISignature(
  method, url, body, timestamp, signature, apiSecret
);
console.log('Signature valid:', verification);
```

---

## OTP (One-Time Password)

**OTP** genera password temporanee per autenticazione a due fattori (2FA).

### 💻 Implementazione TOTP-like

```javascript
const crypto = require('crypto');

class OTPGenerator {
  // Genera OTP (TOTP-like)
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

  // Verifica OTP con tolerance
  static verifyOTP(token, secret, window = 30, tolerance = 1) {
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

// ✅ Esempi di utilizzo
console.log('\n=== OTP 2FA EXAMPLES ===\n');

const otpSecret = crypto.randomBytes(20);
const otp = OTPGenerator.generateOTP(otpSecret);
console.log('Current OTP:', otp);

setTimeout(() => {
  const isValid = OTPGenerator.verifyOTP(otp, otpSecret);
  console.log('OTP valid:', isValid);
}, 1000);
```

---

## Rate Limiting Crittografico

Rate limiting basato su token crittografici per prevenire abuse.

### 💻 Implementazione

```javascript
const crypto = require('crypto');

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
    this.cleanup(window);

    return {
      allowed: true,
      remaining: this.maxRequests - currentCount - 1,
      resetTime: (window + 1) * this.windowMs
    };
  }

  cleanup(currentWindow) {
    // Rimuovi token vecchi
    const cutoff = (currentWindow - 2) * this.windowMs;
    for (const [token, count] of this.requests) {
      // Semplificazione: rimuovi token più vecchi di 2 finestre
      if (this.requests.size > 1000) {
        this.requests.delete(token);
        break;
      }
    }
  }
}

// ✅ Esempi di utilizzo
console.log('\n=== RATE LIMITING EXAMPLES ===\n');

const rateLimiter = new RateLimiter(60000, 5); // 5 req/min
const clientId = 'user-123';

for (let i = 0; i < 7; i++) {
  const result = rateLimiter.checkRateLimit(clientId);
  console.log(`Request ${i + 1}:`, 
    result.allowed ? `✅ ALLOWED (${result.remaining} left)` : '❌ BLOCKED'
  );
}
```

---

## Best Practices

### 🔐 Sicurezza

1. **Usa Algoritmi Moderni**
   - ✅ SHA-256, SHA-512
   - ✅ AES-256-GCM
   - ✅ RSA-2048 o superiore
   - ❌ MD5, SHA-1, DES

2. **Gestione Chiavi**
   - Mai hardcode chiavi nel codice
   - Usa environment variables
   - Considera key management systems (AWS KMS, HashiCorp Vault)

3. **Password Hashing**
   - ✅ PBKDF2, bcrypt, Argon2
   - ✅ Salt unico per ogni password
   - ✅ Iterazioni alte (10.000+)
   - ❌ Hash semplici

4. **Numeri Casuali**
   - ✅ `crypto.randomBytes()` per crittografia
   - ❌ `Math.random()` MAI per sicurezza

### ⚡ Performance

1. **Usa Versioni Sincrone con Cautela**
   - Preferisci async per operazioni pesanti
   - Sincrono va bene per inizializzazione

2. **Buffer Reuse**
   - Riutilizza buffer quando possibile
   - Attenzione alla sicurezza

### 📝 Logging

```javascript
// ❌ MAI loggare dati sensibili
console.log('Password:', password); // PERICOLOSO!
console.log('Private Key:', privateKey); // PERICOLOSO!

// ✅ Logga solo metadata
console.log('Password hash generated for user:', userId);
console.log('Document signed at:', timestamp);
```

---

## Risorse Utili

### 📚 Documentazione

- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

### 🛠️ Librerie Consigliate

- [bcrypt](https://www.npmjs.com/package/bcrypt) - Password hashing
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - JWT completo
- [node-forge](https://www.npmjs.com/package/node-forge) - Crypto puro JavaScript
- [tweetnacl](https://www.npmjs.com/package/tweetnacl) - Crypto moderna e veloce

### 📖 Guide

- [Crypto 101](https://www.crypto101.io/) - Introduzione crittografia
- [Practical Cryptography for Developers](https://cryptobook.nakov.com/)

---

**📝 Nota**: La crittografia è complessa. Per applicazioni production-critical, considera di usare librerie mature e **consulta esperti di sicurezza**.
