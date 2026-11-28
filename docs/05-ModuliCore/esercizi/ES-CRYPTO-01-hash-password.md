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

## � Introduzione Teorica

### Cos'è una Funzione Hash?

Una **funzione hash crittografica** è un algoritmo matematico che trasforma un input di qualsiasi dimensione in un output di dimensione fissa (chiamato "hash" o "digest"). È come un'impronta digitale univoca per i dati.

**Esempio visivo:**
```
Input:  "password123"           → Hash: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
Input:  "password124"           → Hash: ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f
Input:  "una password molto lunga..." → Hash: 256 caratteri hex (sempre 64 caratteri)
```

### Proprietà Fondamentali

1. **Determinismo**: Lo stesso input produce sempre lo stesso hash
   - `hashPassword("test")` → sempre lo stesso risultato
   - Utile per verificare password: confrontiamo gli hash, non le password

2. **Irreversibilità (one-way)**: Impossibile risalire all'input dall'hash
   - Dato l'hash, non si può recuperare la password originale
   - Protezione: anche se rubano il database, non hanno le password

3. **Effetto valanga**: Piccola modifica input → hash completamente diverso
   - `"password"` vs `"Password"` → hash totalmente differenti
   - Ogni bit di differenza nell'input cambia ~50% dei bit nell'hash

4. **Resistenza alle collisioni**: Praticamente impossibile trovare due input con stesso hash
   - SHA-256: 2^256 possibili hash (numero astronomico)
   - Collisione improbabile anche con miliardi di tentativi

### Perché Hashare le Password?

**❌ MAI salvare password in chiaro:** se il database viene compromesso, tutte le password sono esposte. Gli attaccanti possono usarle per accedere a account o tentare di usarle su altri siti (credential stuffing). Anche gli amministratori del sistema non dovrebbero poter vedere le password reali. Nel passato, molti siti hanno subito data breach con password in chiaro, o poco protette, causando danni enormi agli utenti. Alcuni esempi famosi: 
- LinkedIn (2012): [https://www.cnet.com/news/linkedin-confirms-6-5-million-passwords-stolen/](https://www.repubblica.it/tecnologia/2012/06/06/news/linkedin_sotto_attacco_hacker_a_rischio_6_5_milioni_di_password-36661053/)
- Adobe (2013): [https://krebsonsecurity.com/2013/10/adobe-breach-impacted-at-least-38-million-users/](https://krebsonsecurity.com/2013/10/adobe-breach-impacted-at-least-38-million-users/) 
- Yahoo (2013-2014):  [https://en.wikipedia.org/wiki/Yahoo_data_breaches](https://en.wikipedia.org/wiki/Yahoo_data_breaches)

```javascript
// SBAGLIATO!
const users = [
  { username: 'mario', password: 'mario123' },  // Leggibile!
  { username: 'lucia', password: 'lucia2024' }
];
```

**✅ Salvare solo l'hash:**
```javascript
// CORRETTO!
const users = [
  { username: 'mario', hash: 'a665a4592042...' },  // Hash non reversibile
  { username: 'lucia', hash: 'ef797c811802...' }
];
```

**Vantaggi:**
- Se il database viene rubato, le password sono protette
- Nemmeno gli amministratori possono vedere le password reali
- Verifica semplice: hash(password_inserita) === hash_salvato

### Il Problema del Salt

⚠️ **Limitazione SHA-256 semplice:**
- Password comuni hanno hash noti (rainbow tables)
- `hashPassword("password123")` → sempre lo stesso hash per tutti
- Attaccanti possono precalcolare hash di password comuni

**Soluzione: Salt** (aggiunto in ES-CRYPTO-02):
```javascript
// Hash con salt random
const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
// Ogni utente ha salt diverso → hash diversi anche per stessa password
```
### Salt vs Pepper: Due Livelli di Protezione

Quando si proteggono le password, esistono due tecniche complementari:

#### 🧂 Salt (Sale)
- **Cosa**: Stringa random univoca per ogni utente
- **Dove**: Salvato nel database insieme all'hash
- **Scopo**: Rendere ogni hash unico anche per password identiche

✅ **Vantaggi:**
- Hash diversi per stessa password
- Rainbow tables inutili (dovrebbero essere diverse per ogni salt)
- Se database rubato, attaccante deve attaccare ogni hash singolarmente

#### 🌶️ Pepper (Pepe)
- **Cosa**: Stringa segreta uguale per TUTTO il sistema
- **Dove**: Variabile d'ambiente o file di configurazione (MAI nel database)
- **Scopo**: Protezione extra anche se il database viene compromesso

✅ **Vantaggi del pepper:**
- Anche se rubano il database (con hash + salt), non possono verificare password
- Il pepper non è nel database → devono rubare anche i file del server
- Difesa a strati (defense in depth)

⚠️ **Importante:**
- **Salt**: Diverso per ogni utente, salvato nel DB
- **Pepper**: Uguale per tutti, salvato FUORI dal DB (variabili ambiente)
- **Rotazione pepper**: Se compromesso, difficile da cambiare (rihashare tutte le password)

#### 📊 Confronto Completo

| Aspetto | Nessuna Protezione | Solo SHA-256 | SHA-256 + Salt | SHA-256 + Salt + Pepper |
|---------|-------------------|--------------|----------------|-------------------------|
| Password visibili | ❌ SI | ✅ NO | ✅ NO | ✅ NO |
| Rainbow tables | ❌ Vulnerabile | ❌ Vulnerabile | ✅ Protetto | ✅ Protetto |
| Database rubato | ❌ Game over | ⚠️ Attaccabile | ⚠️ Attaccabile | ✅ Serve anche pepper |
| Stesso hash per stessa password | ❌ SI | ❌ SI | ✅ NO | ✅ NO |
| Complessità | Bassa | Bassa | Media | Alta |

#### 🎯 Best Practice Moderna

**Livello minimo accettabile:**
```javascript
// bcrypt include salt automaticamente
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 10);
```

**Massima sicurezza:**
```javascript
const pepper = process.env.PEPPER_SECRET;
const hash = await bcrypt.hash(password + pepper, 10);
// bcrypt gestisce salt automaticamente + aggiungiamo pepper
```

**Schema di protezione completo:**
1. **Pepper** (segreto del server) + **Password** (utente) → Input
2. **Salt** (random per utente) aggiunto dall'algoritmo
3. **Iterazioni multiple** (bcrypt/PBKDF2) per rallentare
4. **Hash finale** salvato nel database

### 🔐 Approfondimento: La Libreria bcrypt

**bcrypt** è lo standard de facto per l'hashing delle password in ambito professionale. Non è un modulo core di Node.js, ma una libreria esterna basata sull'algoritmo Blowfish.

#### Perché bcrypt è Superiore a SHA-256 per le Password?

**1. Adaptive Hashing (Cost Factor)**

bcrypt è progettato per essere **lento di proposito** proteggendo le password dagli attacchi brute force. Il "cost factor" (o "work factor") determina quanto tempo impiega a calcolare un hash.

**Vantaggi:**
- ✅ Rallenta attacchi brute force (1 tentativo al secondo invece di milioni)
- ✅ Adattabile: aumentando il cost factor, rimane sicuro anche con hardware futuro
- ✅ SHA-256 è troppo veloce: GPU moderne calcolano miliardi di hash/secondo

**2. Salt Automatico e Integrato**

bcrypt genera e include il salt automaticamente nell'hash:

```javascript
// bcrypt genera salt random e lo include nell'output
const hash = await bcrypt.hash('myPassword', 10);
console.log(hash);
// $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
//  │  │  │                        │
//  │  │  └─ Salt (22 char)        └─ Hash (31 char)
//  │  └─ Cost factor (10)
//  └─ Version (2b)

// Per verificare, bcrypt estrae salt dall'hash salvato
const match = await bcrypt.compare('myPassword', hash);
console.log(match); // true
```

**Non serve salvare il salt separatamente!** È tutto contenuto nella stringa hash.

**3. Protezione da Timing Attacks**

bcrypt usa confronto a tempo costante:

```javascript
// INSICURO con SHA-256:
if (hash1 === hash2) { } // Exit anticipato se trova prima differenza

// SICURO con bcrypt:
await bcrypt.compare(password, hash); // Tempo costante indipendentemente dal risultato
```

#### Confronto SHA-256 vs bcrypt

| Caratteristica | SHA-256 | bcrypt |
|----------------|---------|--------|
| **Velocità** | Molto veloce (~1M hash/sec) | Lento configurabile (~10-100 hash/sec) |
| **Salt** | Manuale | Automatico e integrato |
| **Cost factor** | ❌ Fisso | ✅ Adattabile (10-15 consigliato) |
| **Scopo originale** | Integrità dati, checksum | Password hashing |
| **GPU resistance** | ❌ Vulnerabile | ✅ Resistente (memory-intensive) |
| **Best per** | Token, checksum file, HMAC | Password utente |
| **Modulo Node.js** | `crypto` (core) | `bcrypt` (npm) |

#### Quando Usare Cosa?

**✅ Usa SHA-256 per:**
- Token di sessione
- Checksum di file
- HMAC (message authentication)
- Identificatori unici non sensibili

**✅ Usa bcrypt per:**
- Password utente (sempre!)
- Qualsiasi credenziale di autenticazione
- Dati sensibili che richiedono hashing lento

#### Alternative a bcrypt

Se bcrypt non è disponibile nel tuo ambiente:

- **Argon2** (argon2): Vincitore Password Hashing Competition 2015, ancora più sicuro
- **scrypt** (crypto.scrypt): Modulo core Node.js, memory-intensive come bcrypt
- **PBKDF2** (crypto.pbkdf2): Modulo core Node.js, più configurabile ma più complesso

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
7. **Pepper**: Aggiungi pepper (stringa segreta) per ulteriore sicurezza

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

## 📖 Esempio Avanzato con bcrypt + Pepper (Massima Sicurezza)

```javascript
const bcrypt = require('bcrypt');

// Installazione: npm install bcrypt

// Pepper: stringa segreta memorizzata in variabile d'ambiente/codice (solo per demo)
// In produzione: process.env.PEPPER_SECRET oppure 
// usa file di configurazione/environment sicuro (es. .env) e aggiungi al .gitignore
// NON COMMITTARE MAI il pepper nel codice sorgente pubblico
const PEPPER = 'MySecretPepper2024!ChangeInProduction';

/**
 * Hash password con bcrypt + pepper (MASSIMA SICUREZZA)
 * bcrypt gestisce salt automaticamente + aggiungiamo pepper extra
 * 
 * @param {string} password - Password utente
 * @param {number} costFactor - Cost factor bcrypt (default: 12)
 * @returns {Promise<string>} Hash completo
 */
async function hashPasswordWithPepper(password, costFactor = 12) {
  // Aggiungi pepper alla password PRIMA di passare a bcrypt
  const passwordWithPepper = password + PEPPER;
  
  // bcrypt genera salt automaticamente e lo include nell'hash
  const hash = await bcrypt.hash(passwordWithPepper, costFactor);
  
  return hash;
  // Output esempio: $2b$12$eImiTXuWVxfM37uY4JANjeNzY...
  //                 └─┬─┘ └┬┘ └────────┬────────┘ └──────┬──────┘
  //               version cost    salt (22 char)  hash (31 char)
}

/**
 * Verifica password con bcrypt + pepper
 * 
 * @param {string} password - Password inserita dall'utente
 * @param {string} storedHash - Hash salvato nel database
 * @returns {Promise<boolean>} true se password corretta
 */
async function verifyPasswordWithPepper(password, storedHash) {
  // Aggiungi lo STESSO pepper
  const passwordWithPepper = password + PEPPER;
  
  // bcrypt.compare estrae salt dall'hash e confronta
  const isMatch = await bcrypt.compare(passwordWithPepper, storedHash);
  
  return isMatch;
}

// ========== ESEMPIO COMPLETO DI USO ==========

async function demo() {
  const password = 'userPassword456';
  
  console.log('🔐 Demo bcrypt + Pepper\n');
  console.log('Password originale:', password);
  console.log('Pepper (segreto):  ', PEPPER);
  
  // REGISTRAZIONE
  console.log('\n--- Registrazione ---');
  const startHash = Date.now();
  const hash = await hashPasswordWithPepper(password, 12);
  const hashTime = Date.now() - startHash;
  
  console.log('Hash generato:     ', hash);
  console.log('Tempo hash:        ', hashTime + 'ms');
  console.log('Lunghezza hash:    ', hash.length, 'caratteri');
  
  // Hash dello STESSO utente è sempre DIVERSO (salt random)
  const hash2 = await hashPasswordWithPepper(password, 12);
  console.log('Hash 2 (stessa pw):', hash2);
  console.log('Hash diversi?      ', hash !== hash2, '✅ (salt random)');
  
  // LOGIN - Password corretta
  console.log('\n--- Login (password corretta) ---');
  const startVerify = Date.now();
  const isValid = await verifyPasswordWithPepper('userPassword456', hash);
  const verifyTime = Date.now() - startVerify;
  
  console.log('Password corretta? ', isValid, isValid ? '✅' : '❌');
  console.log('Tempo verifica:    ', verifyTime + 'ms');
  
  // LOGIN - Password errata
  console.log('\n--- Login (password errata) ---');
  const isInvalid = await verifyPasswordWithPepper('wrongPassword', hash);
  console.log('Password corretta? ', isInvalid, isInvalid ? '✅' : '❌');
  
  // Confronto cost factor
  console.log('\n--- Confronto Cost Factor ---');
  
  const t1 = Date.now();
  await bcrypt.hash(password, 10);
  console.log('Cost 10 (1024 iter): ', Date.now() - t1 + 'ms');
  
  const t2 = Date.now();
  await bcrypt.hash(password, 12);
  console.log('Cost 12 (4096 iter): ', Date.now() - t2 + 'ms');
  
  const t3 = Date.now();
  await bcrypt.hash(password, 14);
  console.log('Cost 14 (16384 iter):', Date.now() - t3 + 'ms');
}

// Esegui demo
demo().catch(console.error);
```

**Output esempio:**
```
🔐 Demo bcrypt + Pepper

Password originale: userPassword456
Pepper (segreto):   MySecretPepper2024!ChangeInProduction

--- Registrazione ---
Hash generato:      $2b$12$K3kJz8Hdj.JKL3x.Jd8Kje9mNL3xKdj8Hdj.JKL3x.Jd8KjeKdj8Hd
Tempo hash:         268ms
Lunghezza hash:     60 caratteri
Hash 2 (stessa pw): $2b$12$M5pLa9Igk.MLN4y.Lg9Mlf8oPN4yMfk9Igk.MLN4y.Lg9MlfMfk9Ig
Hash diversi?       true ✅ (salt random)

--- Login (password corretta) ---
Password corretta?  true ✅
Tempo verifica:     274ms

--- Login (password errata) ---
Password corretta?  false ❌

--- Confronto Cost Factor ---
Cost 10 (1024 iter):  67ms
Cost 12 (4096 iter):  268ms
Cost 14 (16384 iter): 1072ms
```

**Vantaggi di questa implementazione:**

✅ **bcrypt**: Algoritmo specializzato per password (lento di proposito)
✅ **Salt automatico**: bcrypt lo genera e include nell'hash
✅ **Pepper extra**: Difesa aggiuntiva anche se DB rubato
✅ **Cost factor**: Configurabile per adattarsi a hardware futuro
✅ **Async/await**: Codice moderno e non-blocking
✅ **Timing attack resistant**: bcrypt usa confronto a tempo costante


## ⚠️ Questioni di Sicurezza Importanti

**I problemi** derivati dall'uso di hash veloci come SHA-256 per le password:
- ⚡ **Troppo veloce**: GPU moderne calcolano 10+ miliardi di SHA-256/secondo
- 🌈 **Rainbow tables**: Password comuni hanno hash precalcolati
- 🎯 **Brute force facilitato**: Attaccante può provare milioni di password al secondo
- 💣 **Nessuna protezione**: Stesso password = stesso hash per tutti gli utenti

**Impatto reale:**
```
Password "password123" → SHA-256: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

Attaccante con GPU RTX 4090:
- 10 miliardi di hash/secondo
- Dizionario 1 milione parole comuni: < 1 millisecondo
- Brute force 8 caratteri [a-z0-9]: ~2 ore
```

**✅ Best practices:**

```javascript
// ✅ Variabili d'ambiente
const PEPPER = process.env.PEPPER_SECRET;

// ✅ File .env.example committato (senza valori reali)
// .env.example:
// PEPPER_SECRET=your_pepper_here

// ✅ .gitignore
// .env
// config/secrets.json

// ✅ Validazione all'avvio
if (!process.env.PEPPER_SECRET) {
  throw new Error('PEPPER_SECRET non configurato!');
}
```

### 7. 🎯 Protezione da Attacchi Comuni

- **Timing Attacks:** bcrypt usa confronto a tempo costante, mentre SHA-256 con confronto diretto (`hash1 === hash2`) è vulnerabile (exit anticipato al primo mismatch).
- **Rate Limiting (Login Throttling):** Implementa limitazione tentativi per prevenire brute force (es. max 5 tentativi ogni 15 minuti).
- **Account Lockout:** Blocca account dopo troppe password errate (es. 10 tentativi) per 30 minuti.

### 9. 🎓 Risorse per Approfondire

**Standard e linee guida:**
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Password Hashing Competition](https://password-hashing.net/)

**Tool per testing:**
- [Have I Been Pwned](https://haveibeenpwned.com/) - Check password breach
- [Hashcat](https://hashcat.net/) - Password cracking tool (per testare)
- [John the Ripper](https://www.openwall.com/john/) - Password auditing

## 📖 Risorse Utili

- [crypto.createHash() documentation](https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options)
- [Hash Functions Explained](https://en.wikipedia.org/wiki/Cryptographic_hash_function)
- [Password Hashing Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [SHA-256 Online Tool](https://emn178.github.io/online-tools/sha256.html)
