# ES-CRYPTO-01: Hash di Password

## 📋 Informazioni Generali

- **Modulo**: Crypto
- **Difficoltà**: 🟢 Facile  
- **Tempo stimato**: 20 minuti
- **Prerequisiti**: 
  - Comprensione base di crittografia
  - Conoscenza di funzioni hash
  - Familiarità con sicurezza password

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Usare il modulo `crypto` per creare hash
2. Implementare hash SHA-256 per password
3. Comprendere proprietà delle funzioni hash (determinismo, irreversibilità)
4. Gestire encoding (hex, base64)

## 📝 Descrizione

Crea una funzione per generare hash sicuri di password usando SHA-256. L'hash deve essere sempre lo stesso per la stessa password (proprietà deterministica), ma impossibile da invertire.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-crypto-01`
- [ ] Crea file `hash-password.js`

### 2. Implementazione
- [ ] Importa modulo `crypto`
- [ ] Crea funzione `hashPassword(password)`
- [ ] Usa algoritmo SHA-256
- [ ] Converti hash in formato esadecimale
- [ ] Testa con diverse password

### 3. Verifica
- [ ] Stessa password → stesso hash
- [ ] Password diversa → hash diverso
- [ ] Hash non reversibile

## 💡 Template di Partenza

```javascript
// hash-password.js
const crypto = require('crypto');

/**
 * Genera hash SHA-256 di una password
 * @param {string} password - Password da hashare
 * @returns {string} Hash in formato esadecimale
 */
function hashPassword(password) {
  // TODO: Implementa hash
}

// Test
const password1 = 'mySecretPassword123';
const password2 = 'mySecretPassword123';
const password3 = 'differentPassword';

const hash1 = hashPassword(password1);
const hash2 = hashPassword(password2);
const hash3 = hashPassword(password3);

console.log('Password 1:', password1);
console.log('Hash 1:    ', hash1);
console.log();

console.log('Password 2:', password2);
console.log('Hash 2:    ', hash2);
console.log('Uguali?    ', hash1 === hash2);
console.log();

console.log('Password 3:', password3);
console.log('Hash 3:    ', hash3);
console.log('Diverso?   ', hash1 !== hash3);
```

## 📚 Concetti Chiave

### crypto.createHash()
```javascript
const hash = crypto.createHash('sha256');
hash.update(data);  // Aggiungi dati da hashare
const result = hash.digest('hex');  // Ottieni hash finale
```

### Proprietà Hash Function
1. **Deterministica**: Stesso input → stesso output
2. **Unidirezionale**: Impossibile risalire all'input dall'output
3. **Collision-resistant**: Difficile trovare due input con stesso hash
4. **Avalanche effect**: Piccolo cambio input → grande cambio output

### Encoding
- **hex**: Esadecimale (0-9, a-f) - 2 caratteri per byte
- **base64**: Base64 encoding - più compatto
- **buffer**: Raw binary data

## 🔍 Soluzione

### Soluzione Base
```javascript
const crypto = require('crypto');

function hashPassword(password) {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}
```

### Soluzione con Commenti
```javascript
const crypto = require('crypto');

/**
 * Genera hash SHA-256 di una password
 * @param {string} password - Password da hashare
 * @returns {string} Hash in formato esadecimale (64 caratteri)
 */
function hashPassword(password) {
  // Crea hasher SHA-256
  const hash = crypto.createHash('sha256');
  
  // Aggiungi la password da hashare
  hash.update(password);
  
  // Ottieni hash in formato esadecimale
  return hash.digest('hex');
}

// === TEST ===

console.log('=== Test Hash Password ===\n');

// Test 1: Stessa password produce stesso hash
const password1 = 'mySecretPassword123';
const password2 = 'mySecretPassword123';

const hash1 = hashPassword(password1);
const hash2 = hashPassword(password2);

console.log('Test 1: Determinismo');
console.log('Password 1:', password1);
console.log('Hash 1:    ', hash1);
console.log('Password 2:', password2);
console.log('Hash 2:    ', hash2);
console.log('✓ Hashes uguali?', hash1 === hash2 ? '✅ SI' : '❌ NO');
console.log();

// Test 2: Password diversa produce hash diverso
const password3 = 'differentPassword';
const hash3 = hashPassword(password3);

console.log('Test 2: Password Diverse');
console.log('Password 3:', password3);
console.log('Hash 3:    ', hash3);
console.log('✓ Hash diverso?', hash1 !== hash3 ? '✅ SI' : '❌ NO');
console.log();

// Test 3: Avalanche effect (piccolo cambio → grande differenza)
const password4 = 'mySecretPassword124';  // Solo ultimo carattere diverso
const hash4 = hashPassword(password4);

console.log('Test 3: Avalanche Effect');
console.log('Password 1:', password1);
console.log('Hash 1:    ', hash1);
console.log('Password 4:', password4, '(solo un carattere diverso)');
console.log('Hash 4:    ', hash4);
console.log('✓ Hash completamente diverso?', hash1 !== hash4 ? '✅ SI' : '❌ NO');
```

## 🎓 Suggerimenti

1. **SHA-256**: Produce hash di 256 bit (32 byte = 64 caratteri hex)
2. **Non per password in produzione**: In produzione usa PBKDF2, bcrypt o Argon2 (con salt)
3. **Encoding**: 'hex' è human-readable, 'base64' è più compatto
4. **Chaining**: Puoi concatenare i metodi: `.createHash().update().digest()`
5. **Unicode**: SHA-256 gestisce correttamente caratteri UTF-8

## ✅ Criteri di Valutazione

- [ ] La funzione restituisce un hash SHA-256
- [ ] Hash in formato esadecimale (64 caratteri)
- [ ] Stessa password produce sempre stesso hash
- [ ] Password diverse producono hash diversi
- [ ] Codice è pulito e commentato

## 🚀 Sfide Extra (Opzionali)

1. **Multiple algoritmi**: Supporta SHA-1, SHA-256, SHA-512 come parametro
2. **Encoding options**: Permetti di scegliere encoding (hex, base64)
3. **Compare function**: Crea funzione `comparePassword(password, hash)` per verifica
4. **Salt (avanzato)**: Aggiungi salt random per maggiore sicurezza
5. **PBKDF2**: Implementa una versione con PBKDF2 (chiave derivata da password)
6. **Benchmark**: Misura tempo di esecuzione per 1000 hash

## 📖 Esempio Avanzato con Salt (PBKDF2)

```javascript
const crypto = require('crypto');

/**
 * Hash password con PBKDF2 e salt random (PIÙ SICURO)
 */
function hashPasswordSecure(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;  // Salva salt insieme all'hash
}

/**
 * Verifica password contro hash
 */
function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === computedHash;
}

// Test
const password = 'myPassword123';
const hashed = hashPasswordSecure(password);
console.log('Password:', password);
console.log('Hashed:  ', hashed);
console.log('Verify correct:', verifyPassword('myPassword123', hashed));  // true
console.log('Verify wrong:  ', verifyPassword('wrongPassword', hashed));  // false
```

## 🐛 Problemi Comuni

### Hash sempre diverso
**Causa**: Stai generando salt diverso ogni volta  
**Soluzione**: Per hash deterministico, non usare salt (o usa salt fisso)

### Hash troppo corto
**Causa**: Encoding sbagliato  
**Soluzione**: Usa 'hex' per 64 caratteri o 'base64' per ~44 caratteri

### Errore "Invalid encoding"
**Causa**: Encoding non supportato  
**Soluzione**: Usa 'hex', 'base64', 'binary' o 'buffer'

## 📖 Risorse Utili

- [crypto.createHash() documentation](https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options)
- [Hash Functions Explained](https://en.wikipedia.org/wiki/Cryptographic_hash_function)
- [Password Hashing Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [SHA-256 Online Tool](https://emn178.github.io/online-tools/sha256.html)
