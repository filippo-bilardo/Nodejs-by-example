# ES-CRYPTO-03: Crittografia Simmetrica

## 📋 Informazioni Generali

- **Modulo**: Crypto
- **Difficoltà**: 🟡 Medio
- **Tempo stimato**: 50 minuti
- **Prerequisiti**: 
  - Completamento ES-CRYPTO-01
  - Comprensione di crittografia simmetrica
  - Conoscenza di IV (Initialization Vector)

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Cifrare e decifrare dati con AES
2. Gestire chiavi di cifratura sicure
3. Usare IV (Initialization Vector) correttamente
4. Implementare funzioni encrypt/decrypt
5. Proteggere messaggi sensibili

## 📝 Descrizione

Implementa un sistema di cifratura/decifratura per messaggi segreti usando AES-256-CBC. Il sistema deve generare IV casuali, cifrare il testo e permettere la decifratura con la stessa password.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-crypto-03`
- [ ] Crea file `crypto-utils.js`

### 2. Funzione encrypt()
- [ ] Deriva chiave da password (32 byte per AES-256)
- [ ] Genera IV casuale (16 byte)
- [ ] Cifra il testo con AES-256-CBC
- [ ] Restituisci IV + testo cifrato

### 3. Funzione decrypt()
- [ ] Deriva stessa chiave da password
- [ ] Estrai IV dal testo cifrato
- [ ] Decifra il testo
- [ ] Gestisci errori (password errata)

### 4. Testing
- [ ] Cifra un messaggio
- [ ] Decifra con password corretta
- [ ] Verifica che con password errata fallisce

## 💡 Template di Partenza

```javascript
// crypto-utils.js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;  // 256 bit
const IV_LENGTH = 16;   // 128 bit

/**
 * Deriva una chiave di 32 byte da una password
 * @param {string} password
 * @returns {Buffer} Chiave di 32 byte
 */
function deriveKey(password) {
  // TODO: Usa crypto.scryptSync o hash SHA-256
}

/**
 * Cifra un testo con AES-256-CBC
 * @param {string} text - Testo in chiaro
 * @param {string} password - Password per cifratura
 * @returns {string} Testo cifrato (IV + ciphertext in hex)
 */
function encrypt(text, password) {
  // TODO: Implementa cifratura
}

/**
 * Decifra un testo cifrato
 * @param {string} encrypted - Testo cifrato (hex)
 * @param {string} password - Password per decifratura
 * @returns {string} Testo in chiaro
 */
function decrypt(encrypted, password) {
  // TODO: Implementa decifratura
}

// === TEST ===
const message = 'Questo è un messaggio segreto!';
const password = 'myStrongPassword123';

console.log('Messaggio originale:', message);

const encrypted = encrypt(message, password);
console.log('Messaggio cifrato:  ', encrypted);

const decrypted = decrypt(encrypted, password);
console.log('Messaggio decifrato:', decrypted);

console.log('✓ Match?', message === decrypted ? '✅ SI' : '❌ NO');
```

## 📚 Concetti Chiave

### AES-256-CBC
- **AES**: Advanced Encryption Standard
- **256**: Dimensione chiave in bit (32 byte)
- **CBC**: Cipher Block Chaining (modalità di cifratura)

### Initialization Vector (IV)
- Valore casuale di 16 byte
- Deve essere diverso per ogni cifratura
- Può essere pubblico (trasmesso insieme al ciphertext)
- Previene pattern ripetuti

### Key Derivation
```javascript
// Opzione 1: Scrypt (raccomandato)
const key = crypto.scryptSync(password, 'salt', 32);

// Opzione 2: SHA-256 hash
const key = crypto.createHash('sha256').update(password).digest();
```

### Cipher e Decipher
```javascript
// Cifratura
const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(text, 'utf8', 'hex');
encrypted += cipher.final('hex');

// Decifratura
const decipher = crypto.createDecipheriv(algorithm, key, iv);
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');
```

## 🔍 Soluzione Completa

```javascript
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;  // 256 bit per AES-256
const IV_LENGTH = 16;   // 128 bit per CBC

/**
 * Deriva una chiave di 32 byte da una password
 * Usa scryptSync per derivazione sicura
 */
function deriveKey(password) {
  // Usa un salt fisso per questo esempio
  // In produzione, usa salt diverso per ogni utente e salvalo
  const salt = 'salt-fixed-for-example';
  return crypto.scryptSync(password, salt, KEY_LENGTH);
}

/**
 * Cifra un testo con AES-256-CBC
 * @param {string} text - Testo in chiaro
 * @param {string} password - Password per cifratura
 * @returns {string} IV + ciphertext in formato hex
 */
function encrypt(text, password) {
  try {
    // 1. Deriva chiave dalla password
    const key = deriveKey(password);
    
    // 2. Genera IV casuale
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // 3. Crea cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // 4. Cifra il testo
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 5. Concatena IV + ciphertext
    // IV è necessario per decifratura, non è segreto
    return iv.toString('hex') + ':' + encrypted;
    
  } catch (error) {
    throw new Error('Errore durante la cifratura: ' + error.message);
  }
}

/**
 * Decifra un testo cifrato con AES-256-CBC
 * @param {string} encrypted - IV:ciphertext in formato hex
 * @param {string} password - Password per decifratura
 * @returns {string} Testo in chiaro
 */
function decrypt(encrypted, password) {
  try {
    // 1. Separa IV e ciphertext
    const parts = encrypted.split(':');
    if (parts.length !== 2) {
      throw new Error('Formato non valido');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const ciphertext = parts[1];
    
    // 2. Deriva stessa chiave dalla password
    const key = deriveKey(password);
    
    // 3. Crea decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // 4. Decifra
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
    
  } catch (error) {
    throw new Error('Errore durante la decifratura (password errata?): ' + error.message);
  }
}

// === TEST ===

console.log('=== Test Cifratura/Decifratura ===\n');

// Test 1: Cifratura e decifratura corretta
console.log('Test 1: Cifratura e Decifratura');
const message = 'Questo è un messaggio super segreto! 🔒';
const password = 'myStrongPassword123';

console.log('Messaggio:  ', message);
console.log('Password:   ', password);

const encrypted = encrypt(message, password);
console.log('Cifrato:    ', encrypted);
console.log();

const decrypted = decrypt(encrypted, password);
console.log('Decifrato:  ', decrypted);
console.log('✓ Match?    ', message === decrypted ? '✅ SI' : '❌ NO');
console.log();

// Test 2: IV diverso produce ciphertext diverso
console.log('Test 2: IV Casuale (stesso messaggio, cifratura diversa)');
const encrypted2 = encrypt(message, password);
console.log('Cifrato 1:  ', encrypted.substring(0, 50) + '...');
console.log('Cifrato 2:  ', encrypted2.substring(0, 50) + '...');
console.log('✓ Diversi?  ', encrypted !== encrypted2 ? '✅ SI (corretto)' : '❌ NO (errore)');
console.log();

// Test 3: Password errata fallisce
console.log('Test 3: Password Errata');
try {
  const decryptedWrong = decrypt(encrypted, 'passwordSbagliata');
  console.log('❌ Non dovrebbe riuscire!');
} catch (error) {
  console.log('✅ Errore atteso:', error.message);
}

// Export per uso come modulo
module.exports = { encrypt, decrypt };
```

## 🎓 Suggerimenti

1. **IV deve essere casuale**: Genera nuovo IV per ogni cifratura
2. **IV può essere pubblico**: Salvalo insieme al ciphertext
3. **Salt per key derivation**: In produzione, usa salt unique per utente
4. **Formato output**: `IV:ciphertext` è un formato comune
5. **Error handling**: Password errata produce errore in `final()`

## ✅ Criteri di Valutazione

- [ ] encrypt() cifra correttamente il testo
- [ ] decrypt() decifra correttamente con password giusta
- [ ] decrypt() fallisce con password errata
- [ ] IV è diverso per ogni cifratura
- [ ] Il messaggio decifrato è identico all'originale
- [ ] Gestione errori implementata

## 🚀 Sfide Extra (Opzionali)

1. **File encryption**: Cifra/decifra file interi
2. **GCM mode**: Usa AES-GCM invece di CBC (include authentication)
3. **Key stretching**: Usa PBKDF2 invece di scrypt
4. **Salt management**: Salva salt insieme all'IV
5. **Stream encryption**: Usa stream per file grandi
6. **Password strength**: Valida robustezza password
7. **CLI tool**: Crea tool command-line per cifrare/decifrare file

## 📖 Esempio Uso per File

```javascript
const fs = require('fs');
const { encrypt, decrypt } = require('./crypto-utils');

// Cifra contenuto file
const content = fs.readFileSync('secret.txt', 'utf8');
const encrypted = encrypt(content, 'myPassword');
fs.writeFileSync('secret.txt.enc', encrypted);

// Decifra file
const encryptedContent = fs.readFileSync('secret.txt.enc', 'utf8');
const decrypted = decrypt(encryptedContent, 'myPassword');
fs.writeFileSync('secret-decrypted.txt', decrypted);
```

## 🐛 Problemi Comuni

### Error: Invalid IV length
**Causa**: IV non è 16 byte  
**Soluzione**: `crypto.randomBytes(16)` per AES-CBC

### Error: Invalid key length
**Causa**: Chiave non è 32 byte per AES-256  
**Soluzione**: Usa `scryptSync` o `createHash('sha256')`

### Decifratura fallisce random mente
**Causa**: IV manca o è corrotto  
**Soluzione**: Assicurati di trasmettere IV insieme al ciphertext

### Stesso messaggio produce stesso ciphertext
**Causa**: IV non è casuale  
**Soluzione**: Genera nuovo IV per ogni cifratura con `randomBytes()`

## 📖 Risorse Utili

- [crypto.createCipheriv() documentation](https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options)
- [AES Encryption Explained](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)
- [Cipher Block Chaining (CBC)](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#CBC)
- [Key Derivation Functions](https://en.wikipedia.org/wiki/Key_derivation_function)
