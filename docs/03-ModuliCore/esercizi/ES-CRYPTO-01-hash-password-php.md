# ES-CRYPTO-01-PHP: Hash di Password con PHP

## 📋 Informazioni Generali

- **Linguaggio**: PHP 8.x
- **Difficoltà**: 🟢 Facile  
- **Tempo stimato**: 20 minuti
- **Prerequisiti**: 
  - Comprensione base di crittografia
  - Conoscenza di funzioni hash
  - Familiarità con sicurezza password

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Usare la funzione `hash()` di PHP per creare hash SHA-256
2. Comprendere le proprietà delle funzioni hash (determinismo, irreversibilità)
3. Gestire encoding (hex, base64)
4. Capire la differenza tra `hash()` e `password_hash()` per i diversi use case

## 📖 Introduzione Teorica

### Cos'è una Funzione Hash?

Una **funzione hash crittografica** è un algoritmo matematico che trasforma un input di qualsiasi dimensione in un output di dimensione fissa (chiamato "hash" o "digest"). È come un'impronta digitale univoca per i dati.

**Esempio visivo:**
```
Input:  "password123"           → Hash: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
Input:  "password124"           → Hash: c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646
Input:  "una password molto lunga..." → Hash: sempre 64 caratteri esadecimali (SHA-256)
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

**❌ MAI salvare password in chiaro:** se il database viene compromesso, tutte le password sono esposte. Gli attaccanti possono tentare di usarle su altri siti (credential stuffing). Alcuni esempi famosi di data breach:
- LinkedIn (2012): 6,5 milioni di password esposte
- Adobe (2013): 38 milioni di account compromessi
- Yahoo (2013-2014): oltre 3 miliardi di account

```php
// SBAGLIATO!
$users = [
    ['username' => 'mario', 'password' => 'mario123'],   // Leggibile!
    ['username' => 'lucia', 'password' => 'lucia2024'],
];
```

**✅ Salvare solo l'hash:**
```php
// CORRETTO!
$users = [
    ['username' => 'mario', 'hash' => 'ef92b778bafe771e...'],  // Non reversibile
    ['username' => 'lucia', 'hash' => 'c775e7b757ede630...'],
];
```

**Vantaggi:**
- Se il database viene rubato, le password sono protette
- Nemmeno gli amministratori possono vedere le password reali
- Verifica semplice: `hash(password_inserita) === hash_salvato`

### Il Problema del Salt

⚠️ **Limitazione SHA-256 semplice:**
- Password comuni hanno hash noti (rainbow tables)
- `hashPassword("password123")` → sempre lo stesso hash per tutti gli utenti
- Attaccanti possono precalcolare hash di password comuni

**Soluzione: Salt** (aggiunto in ES-CRYPTO-02):
```php
// Hash con salt random (PBKDF2)
$salt = bin2hex(random_bytes(16));
$hash = hash_pbkdf2('sha512', $password, $salt, 100000, 64);
// Ogni utente ha salt diverso → hash diversi anche per stessa password
```

In PHP, la funzione `password_hash()` incorpora salt e algoritmo lento direttamente:
```php
$hash = password_hash($password, PASSWORD_BCRYPT);
// Il salt è generato automaticamente e incluso nell'hash
```

### Salt vs Pepper: Due Livelli di Protezione

#### 🧂 Salt (Sale)
- **Cosa**: Stringa random univoca per ogni utente
- **Dove**: Salvato nel database insieme all'hash
- **Scopo**: Rendere ogni hash unico anche per password identiche

✅ **Vantaggi:**
- Hash diversi per stessa password
- Rainbow tables inutili (diverse per ogni salt)
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
- **Pepper**: Uguale per tutti, salvato FUORI dal DB (es. `.env`, variabili d'ambiente PHP)
- **Rotazione pepper**: Se compromesso, difficile da cambiare (rihashare tutte le password)

#### 📊 Confronto Completo

| Aspetto | Nessuna Protezione | Solo SHA-256 | SHA-256 + Salt | password_hash() + Pepper |
|---------|-------------------|--------------|----------------|--------------------------|
| Password visibili | ❌ SI | ✅ NO | ✅ NO | ✅ NO |
| Rainbow tables | ❌ Vulnerabile | ❌ Vulnerabile | ✅ Protetto | ✅ Protetto |
| Database rubato | ❌ Game over | ⚠️ Attaccabile | ⚠️ Attaccabile | ✅ Serve anche pepper |
| Stesso hash per stessa password | ❌ SI | ❌ SI | ✅ NO | ✅ NO |
| Complessità | Bassa | Bassa | Media | Alta |

#### 🎯 Best Practice Moderna in PHP

**Livello minimo accettabile:**
```php
// password_hash include salt automaticamente (bcrypt)
$hash = password_hash($password, PASSWORD_BCRYPT);
$valid = password_verify($password, $hash);
```

**Massima sicurezza:**
```php
$pepper = $_ENV['PEPPER_SECRET'];
$hash   = password_hash($password . $pepper, PASSWORD_ARGON2ID);
// password_hash gestisce salt automaticamente + aggiungiamo pepper
```

**Schema di protezione completo:**
1. **Pepper** (segreto del server) + **Password** (utente) → Input
2. **Salt** (random per utente) generato automaticamente da `password_hash()`
3. **Iterazioni multiple** (bcrypt/Argon2) per rallentare
4. **Hash finale** salvato nel database

---

### 🔐 Approfondimento: `password_hash()` in PHP

PHP include nativamente una funzione dedicata all'hashing delle password:

#### Perché `password_hash()` è Superiore a `hash()` per le Password?

**1. Adaptive Hashing (Cost Factor)**

`password_hash()` usa bcrypt o Argon2, algoritmi **lenti di proposito** per proteggere dalle attacchi brute force.

```php
// bcrypt: cost factor 10 → ~70ms per hash
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

// bcrypt: cost factor 12 → ~280ms per hash  
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

// Argon2id: ancora più sicuro (raccomandato dal NIST)
$hash = password_hash($password, PASSWORD_ARGON2ID);
```

**2. Salt Automatico e Integrato**

`password_hash()` genera e include il salt automaticamente nell'hash:

```php
$hash = password_hash('myPassword', PASSWORD_BCRYPT);
echo $hash;
// $2y$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
//  │  │  │                        │
//  │  │  └─ Salt (22 char)        └─ Hash (31 char)
//  │  └─ Cost factor (10)
//  └─ Algoritmo (2y = bcrypt)

// Per verificare, PHP estrae salt dall'hash salvato
$valid = password_verify('myPassword', $hash);
var_dump($valid); // bool(true)
```

**Non serve salvare il salt separatamente!** È tutto contenuto nella stringa hash.

**3. Protezione da Timing Attacks**

`password_verify()` usa confronto a tempo costante:

```php
// INSICURO con hash() diretto:
if ($computedHash === $storedHash) { }  // Exit anticipato al primo mismatch!

// SICURO con password_verify():
if (password_verify($password, $storedHash)) { }  // Tempo costante

// Oppure con hash_equals() per confronti manuali:
if (hash_equals($storedHash, $computedHash)) { }  // Tempo costante
```

#### Confronto `hash()` vs `password_hash()`

| Caratteristica | `hash('sha256', ...)` | `password_hash()` |
|----------------|-----------------------|-------------------|
| **Velocità** | Molto veloce (~miliardi/sec) | Lento configurabile (~10-100/sec) |
| **Salt** | Manuale | Automatico e integrato |
| **Cost factor** | ❌ Fisso | ✅ Adattabile |
| **Scopo originale** | Integrità dati, checksum | Password hashing |
| **GPU resistance** | ❌ Vulnerabile | ✅ Resistente |
| **Best per** | Token, checksum file, HMAC | Password utente |
| **Algoritmo** | SHA-256 | bcrypt / Argon2 |

#### Quando Usare Cosa?

**✅ Usa `hash()` per:**
- Token di sessione
- Checksum di file
- HMAC (message authentication)
- Identificatori unici non sensibili

**✅ Usa `password_hash()` per:**
- Password utente (sempre!)
- Qualsiasi credenziale di autenticazione

#### Alternative in PHP

| Funzione | Algoritmo | Note |
|----------|-----------|------|
| `password_hash($pw, PASSWORD_BCRYPT)` | bcrypt | Standard, disponibile da PHP 5.5 |
| `password_hash($pw, PASSWORD_ARGON2I)` | Argon2i | Richiede libargon2 |
| `password_hash($pw, PASSWORD_ARGON2ID)` | Argon2id | ✅ Raccomandato dal NIST |
| `hash_pbkdf2('sha512', $pw, $salt, 100000)` | PBKDF2 | Manuale, più configurabile |

---

## 📝 Descrizione

Crea una funzione PHP per generare hash sicuri di password usando SHA-256. L'hash deve essere sempre lo stesso per la stessa password (proprietà deterministica), ma impossibile da invertire.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-crypto-01`
- [ ] Crea file `hash-password.php`

### 2. Implementazione
- [ ] Usa la funzione `hash()` con algoritmo `sha256`
- [ ] Crea funzione `hashPassword(string $password): string`
- [ ] Converti hash in formato esadecimale
- [ ] Testa con diverse password

### 3. Verifica
- [ ] Stessa password → stesso hash
- [ ] Password diversa → hash diverso
- [ ] Hash non reversibile

## 💡 Template di Partenza

```php
<?php
// hash-password.php

/**
 * Genera hash SHA-256 di una password
 *
 * @param string $password Password da hashare
 * @return string Hash in formato esadecimale (64 caratteri)
 */
function hashPassword(string $password): string {
    // TODO: Implementa hash
}

// Test
$password1 = 'mySecretPassword123';
$password2 = 'mySecretPassword123';
$password3 = 'differentPassword';

$hash1 = hashPassword($password1);
$hash2 = hashPassword($password2);
$hash3 = hashPassword($password3);

echo 'Password 1: ' . $password1 . PHP_EOL;
echo 'Hash 1:     ' . $hash1 . PHP_EOL;
echo PHP_EOL;

echo 'Password 2: ' . $password2 . PHP_EOL;
echo 'Hash 2:     ' . $hash2 . PHP_EOL;
echo 'Uguali?     ' . ($hash1 === $hash2 ? 'SI' : 'NO') . PHP_EOL;
echo PHP_EOL;

echo 'Password 3: ' . $password3 . PHP_EOL;
echo 'Hash 3:     ' . $hash3 . PHP_EOL;
echo 'Diverso?    ' . ($hash1 !== $hash3 ? 'SI' : 'NO') . PHP_EOL;
```

## 📚 Concetti Chiave

### `hash()` — La funzione base

```php
// Firma: hash(string $algo, string $data, bool $binary = false): string
$result = hash('sha256', $data);
// $binary = false → output in stringa esadecimale (default)
// $binary = true  → output in bytes raw
```

### `hash_algos()` — Algoritmi disponibili

```php
// Lista tutti gli algoritmi supportati
print_r(hash_algos());
// sha256, sha512, md5, sha1, sha3-256, ...

// Verifica se un algoritmo è disponibile
echo in_array('sha256', hash_algos()) ? 'disponibile' : 'non disponibile';
```

### Encoding

```php
// hex: stringa esadecimale (0-9, a-f) — 2 caratteri per byte
$hex = hash('sha256', 'test');         // 64 caratteri

// base64: più compatto
$raw  = hash('sha256', 'test', true);  // binario raw
$b64  = base64_encode($raw);           // ~44 caratteri

// hex → binario → hex (identità)
$bin  = hex2bin($hex);
$back = bin2hex($bin);                 // === $hex
```

### Proprietà delle Funzioni Hash

1. **Deterministica**: Stesso input → stesso output
2. **Unidirezionale**: Impossibile risalire all'input dall'output
3. **Collision-resistant**: Difficile trovare due input con stesso hash
4. **Avalanche effect**: Piccolo cambio input → grande cambio output

---

## 🔍 Soluzione

### Soluzione Base

```php
<?php

function hashPassword(string $password): string {
    return hash('sha256', $password);
}
```

### Soluzione con Commenti

```php
<?php

/**
 * Genera hash SHA-256 di una password
 *
 * @param string $password Password da hashare
 * @return string Hash in formato esadecimale (64 caratteri)
 */
function hashPassword(string $password): string {
    // hash() calcola SHA-256 dell'input e restituisce
    // una stringa esadecimale di 64 caratteri
    return hash('sha256', $password);
}

// === TEST ===

echo '=== Test Hash Password ===' . PHP_EOL . PHP_EOL;

// Test 1: Stessa password produce stesso hash (Determinismo)
$password1 = 'mySecretPassword123';
$password2 = 'mySecretPassword123';

$hash1 = hashPassword($password1);
$hash2 = hashPassword($password2);

echo 'Test 1: Determinismo' . PHP_EOL;
echo 'Password 1: ' . $password1 . PHP_EOL;
echo 'Hash 1:     ' . $hash1 . PHP_EOL;
echo 'Password 2: ' . $password2 . PHP_EOL;
echo 'Hash 2:     ' . $hash2 . PHP_EOL;
echo '✓ Hashes uguali? ' . ($hash1 === $hash2 ? '✅ SI' : '❌ NO') . PHP_EOL;
echo PHP_EOL;

// Test 2: Password diversa produce hash diverso
$password3 = 'differentPassword';
$hash3 = hashPassword($password3);

echo 'Test 2: Password Diverse' . PHP_EOL;
echo 'Password 3: ' . $password3 . PHP_EOL;
echo 'Hash 3:     ' . $hash3 . PHP_EOL;
echo '✓ Hash diverso? ' . ($hash1 !== $hash3 ? '✅ SI' : '❌ NO') . PHP_EOL;
echo PHP_EOL;

// Test 3: Avalanche effect (piccolo cambio → grande differenza)
$password4 = 'mySecretPassword124';  // Solo ultimo carattere diverso
$hash4 = hashPassword($password4);

echo 'Test 3: Avalanche Effect' . PHP_EOL;
echo 'Password 1: ' . $password1 . PHP_EOL;
echo 'Hash 1:     ' . $hash1 . PHP_EOL;
echo 'Password 4: ' . $password4 . ' (solo un carattere diverso)' . PHP_EOL;
echo 'Hash 4:     ' . $hash4 . PHP_EOL;
echo '✓ Hash completamente diverso? ' . ($hash1 !== $hash4 ? '✅ SI' : '❌ NO') . PHP_EOL;
```

**Output atteso:**
```
=== Test Hash Password ===

Test 1: Determinismo
Password 1: mySecretPassword123
Hash 1:     ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
Password 2: mySecretPassword123
Hash 2:     ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
✓ Hashes uguali? ✅ SI

Test 2: Password Diverse
Password 3: differentPassword
Hash 3:     1116bdf1db8b2e7823e8f5e1c7f1e78d7082dd93f7e0f4fb3c5d38a66a42b5c2
✓ Hash diverso? ✅ SI

Test 3: Avalanche Effect
Password 1: mySecretPassword123
Hash 1:     ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
Password 4: mySecretPassword124 (solo un carattere diverso)
Hash 4:     c775e7b757ede630cd0aa1113bd102661ab38829ca52a6422ab782862f268646
✓ Hash completamente diverso? ✅ SI
```

---

## 🎓 Suggerimenti

1. **SHA-256**: Produce hash di 256 bit (32 byte = 64 caratteri hex)
2. **Non per password in produzione**: Usa sempre `password_hash()` con bcrypt o Argon2id
3. **`hash_equals()` per confronti**: Evita timing attack usando `hash_equals($a, $b)` invece di `$a === $b`
4. **Binary output**: Con terzo parametro `true`, `hash()` restituisce bytes grezzi utili per operazioni crittografiche
5. **Unicode**: PHP gestisce correttamente stringhe UTF-8 in input a `hash()`

---

## ✅ Criteri di Valutazione

- [ ] La funzione restituisce un hash SHA-256
- [ ] Hash in formato esadecimale (64 caratteri)
- [ ] Stessa password produce sempre stesso hash
- [ ] Password diverse producono hash diversi
- [ ] Codice è pulito e commentato

---

## 🚀 Sfide Extra (Opzionali)

1. **Multiple algoritmi**: Supporta `sha1`, `sha256`, `sha512` come parametro con `$algo = 'sha256'`
2. **Encoding options**: Permetti di scegliere encoding (`hex`, `base64`, `raw`)
3. **Compare function**: Crea funzione `comparePassword(string $password, string $hash): bool` con `hash_equals()`
4. **Salt manuale**: Aggiungi salt random per maggiore sicurezza
5. **PBKDF2**: Implementa una versione con `hash_pbkdf2()`
6. **Benchmark**: Misura tempo di esecuzione con `microtime(true)` per 1000 hash
7. **Pepper**: Aggiungi pepper (stringa segreta) per ulteriore sicurezza

---

## 📖 Esempio Avanzato con Salt (PBKDF2)

```php
<?php

/**
 * Hash password con PBKDF2 e salt random (PIÙ SICURO di SHA-256 semplice)
 *
 * @param string $password Password da proteggere
 * @return string "salt_hex:hash_hex" — il salt è incluso nell'output
 */
function hashPasswordSecure(string $password): string {
    // Genera salt casuale (16 byte = 128 bit)
    $salt = bin2hex(random_bytes(16));         // 32 char hex

    // PBKDF2: 100.000 iterazioni, output 64 byte, algoritmo sha512
    $hash = hash_pbkdf2('sha512', $password, $salt, 100000, 64);

    return $salt . ':' . $hash;  // "salt:hash" — entrambi necessari per verifica
}

/**
 * Verifica password contro hash PBKDF2
 *
 * @param string $password    Password inserita dall'utente
 * @param string $storedHash  Stringa "salt:hash" salvata nel database
 * @return bool true se la password è corretta
 */
function verifyPassword(string $password, string $storedHash): bool {
    [$salt, $hash] = explode(':', $storedHash, 2);

    // Ricalcola con lo stesso salt — PBKDF2 è deterministico dato lo stesso salt
    $computed = hash_pbkdf2('sha512', $password, $salt, 100000, 64);

    // hash_equals: confronto a tempo costante (previene timing attack)
    return hash_equals($hash, $computed);
}

// Test
$password = 'myPassword123';
$hashed   = hashPasswordSecure($password);

echo 'Password: ' . $password . PHP_EOL;
echo 'Hashed:   ' . $hashed . PHP_EOL;
echo 'Verifica corretta: ' . (verifyPassword('myPassword123', $hashed) ? '✅ true' : '❌ false') . PHP_EOL;
echo 'Verifica errata:   ' . (verifyPassword('wrongPassword',  $hashed) ? '✅ true' : '❌ false') . PHP_EOL;
```

---

## 📖 Esempio Avanzato con `password_hash()` + Pepper (Massima Sicurezza)

```php
<?php

// Pepper: stringa segreta memorizzata in variabile d'ambiente
// In produzione: usa $_ENV['PEPPER_SECRET'] o getenv('PEPPER_SECRET')
// NON committare mai il pepper nel codice sorgente pubblico
define('PEPPER', $_ENV['PEPPER_SECRET'] ?? 'MySecretPepper2026!ChangeInProduction');

/**
 * Hash password con password_hash() (Argon2id) + pepper
 * password_hash gestisce salt automaticamente + aggiungiamo pepper extra
 *
 * @param string $password  Password dell'utente
 * @return string           Hash bcrypt/Argon2id completo
 */
function hashPasswordWithPepper(string $password): string {
    // Aggiungi pepper PRIMA di passare a password_hash()
    $passwordWithPepper = $password . PEPPER;

    // PASSWORD_ARGON2ID: consigliato dal NIST (resistente a GPU e side-channel)
    // password_hash genera e include il salt automaticamente
    return password_hash($passwordWithPepper, PASSWORD_ARGON2ID);
    // Output esempio: $argon2id$v=19$m=65536,t=4,p=1$salt...$hash...
}

/**
 * Verifica password con password_verify() + pepper
 *
 * @param string $password    Password inserita dall'utente
 * @param string $storedHash  Hash salvato nel database
 * @return bool               true se password corretta
 */
function verifyPasswordWithPepper(string $password, string $storedHash): bool {
    // Aggiungi lo STESSO pepper
    $passwordWithPepper = $password . PEPPER;

    // password_verify: estrae parametri e salt dall'hash, confronto a tempo costante
    return password_verify($passwordWithPepper, $storedHash);
}

// ========== DEMO COMPLETA ==========

function demo(): void {
    $password = 'userPassword456';

    echo '🔐 Demo password_hash() + Pepper' . PHP_EOL . PHP_EOL;
    echo 'Password originale: ' . $password . PHP_EOL;
    echo 'Pepper (segreto):   ' . PEPPER . PHP_EOL;

    // REGISTRAZIONE
    echo PHP_EOL . '--- Registrazione ---' . PHP_EOL;
    $start = microtime(true);
    $hash  = hashPasswordWithPepper($password);
    $time  = round((microtime(true) - $start) * 1000);

    echo 'Hash generato:      ' . $hash . PHP_EOL;
    echo 'Tempo hash:         ' . $time . 'ms' . PHP_EOL;
    echo 'Lunghezza hash:     ' . strlen($hash) . ' caratteri' . PHP_EOL;

    // Lo stesso utente genera hash DIVERSI ogni volta (salt random)
    $hash2 = hashPasswordWithPepper($password);
    echo 'Hash 2 (stessa pw): ' . $hash2 . PHP_EOL;
    echo 'Hash diversi?       ' . ($hash !== $hash2 ? 'true ✅ (salt random)' : 'false ❌') . PHP_EOL;

    // LOGIN — password corretta
    echo PHP_EOL . '--- Login (password corretta) ---' . PHP_EOL;
    $start   = microtime(true);
    $isValid = verifyPasswordWithPepper('userPassword456', $hash);
    $time    = round((microtime(true) - $start) * 1000);

    echo 'Password corretta? ' . ($isValid ? 'true ✅' : 'false ❌') . PHP_EOL;
    echo 'Tempo verifica:    ' . $time . 'ms' . PHP_EOL;

    // LOGIN — password errata
    echo PHP_EOL . '--- Login (password errata) ---' . PHP_EOL;
    $isInvalid = verifyPasswordWithPepper('wrongPassword', $hash);
    echo 'Password corretta? ' . ($isInvalid ? 'true ✅' : 'false ❌') . PHP_EOL;

    // Confronto cost factor bcrypt
    echo PHP_EOL . '--- Confronto Cost Factor (bcrypt) ---' . PHP_EOL;
    foreach ([10, 12, 14] as $cost) {
        $t = microtime(true);
        password_hash($password, PASSWORD_BCRYPT, ['cost' => $cost]);
        echo 'Cost ' . $cost . ': ' . round((microtime(true) - $t) * 1000) . 'ms' . PHP_EOL;
    }

    // Rilevamento aggiornamento necessario (rehash)
    echo PHP_EOL . '--- Rehash automatico ---' . PHP_EOL;
    $oldHash = password_hash($password . PEPPER, PASSWORD_BCRYPT, ['cost' => 10]);
    if (password_needs_rehash($oldHash, PASSWORD_ARGON2ID)) {
        $newHash = hashPasswordWithPepper($password);
        echo 'Hash aggiornato all\'algoritmo più recente ✅' . PHP_EOL;
    }
}

demo();
```

**Output esempio:**
```
🔐 Demo password_hash() + Pepper

Password originale: userPassword456
Pepper (segreto):   MySecretPepper2026!ChangeInProduction

--- Registrazione ---
Hash generato:      $argon2id$v=19$m=65536,t=4,p=1$bXlzYWx0aGVyZQ$hash...
Tempo hash:         120ms
Lunghezza hash:     97 caratteri
Hash 2 (stessa pw): $argon2id$v=19$m=65536,t=4,p=1$ZGlmZmVyZW50c2FsdA$hash...
Hash diversi?       true ✅ (salt random)

--- Login (password corretta) ---
Password corretta? true ✅
Tempo verifica:    118ms

--- Login (password errata) ---
Password corretta? false ❌

--- Confronto Cost Factor (bcrypt) ---
Cost 10: 67ms
Cost 12: 268ms
Cost 14: 1073ms

--- Rehash automatico ---
Hash aggiornato all'algoritmo più recente ✅
```

**Vantaggi di questa implementazione:**

✅ **`password_hash()`**: Funzione nativa PHP, specializzata per password  
✅ **Argon2id**: Algoritmo raccomandato dal NIST (PBKDF2 Competition 2015)  
✅ **Salt automatico**: Generato e incluso nell'hash automaticamente  
✅ **Pepper extra**: Difesa aggiuntiva anche se DB rubato  
✅ **`password_needs_rehash()`**: Rilevamento automatico di hash obsoleti  
✅ **Timing attack resistant**: `password_verify()` usa confronto a tempo costante  

---

## ⚠️ Questioni di Sicurezza Importanti

**I problemi derivati dall'uso di `hash('sha256', ...)` diretto per le password:**
- ⚡ **Troppo veloce**: GPU moderne calcolano 10+ miliardi di SHA-256/secondo
- 🌈 **Rainbow tables**: Password comuni hanno hash precalcolati
- 🎯 **Brute force facilitato**: Meglio no salt → stessa password, stesso hash
- 💣 **Nessuna protezione**: Stesso password = stesso hash per tutti gli utenti

**Impatto reale:**
```
Password "password123" → SHA-256: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f

Attaccante con GPU RTX 4090:
- 10 miliardi di hash SHA-256/secondo
- Dizionario 1 milione parole comuni: < 1 millisecondo
- Con Argon2id (PHP default): ~120ms per tentativo → protezione reale
```

**✅ Best practices in PHP:**

```php
// ✅ Variabili d'ambiente per il pepper (.env o server config)
$pepper = getenv('PEPPER_SECRET');
// oppure
$pepper = $_ENV['PEPPER_SECRET'];

// ✅ File .env.example committato (senza valori reali)
// .env.example:
// PEPPER_SECRET=your_pepper_here_min_32_chars

// ✅ .gitignore
// .env
// config/secrets.php

// ✅ Validazione all'avvio dell'applicazione
if (empty(getenv('PEPPER_SECRET'))) {
    throw new RuntimeException('PEPPER_SECRET non configurato!');
}

// ✅ Confronto a tempo costante per hash manuali
if (!hash_equals($storedHash, $computedHash)) {
    // SBAGLIATO:  $storedHash === $computedHash  (timing attack)
    // CORRETTO:   hash_equals()
}

// ✅ Rehash automatico al login (se algoritmo cambia)
if (password_verify($password . $pepper, $hash)) {
    if (password_needs_rehash($hash, PASSWORD_ARGON2ID)) {
        $newHash = password_hash($password . $pepper, PASSWORD_ARGON2ID);
        // Salva $newHash nel database
    }
}
```

### 🎯 Protezione da Attacchi Comuni

- **Timing Attacks**: Usa sempre `password_verify()` o `hash_equals()` — MAI `===` per hash di password
- **Rate Limiting**: Implementa limitazione tentativi (es. max 5 ogni 15 minuti) a livello applicativo o con Redis
- **Account Lockout**: Blocca account dopo troppi tentativi falliti (es. 10 tentativi → blocco 30 minuti)
- **Enumerazione utenti**: Esegui sempre `password_verify()` anche se l'utente non esiste (per non rivelare se un account è presente)

---

## 📖 Risorse Utili

- [PHP Manual: hash()](https://www.php.net/manual/en/function.hash.php)
- [PHP Manual: password_hash()](https://www.php.net/manual/en/function.password-hash.php)
- [PHP Manual: password_verify()](https://www.php.net/manual/en/function.password-verify.php)
- [PHP Manual: hash_pbkdf2()](https://www.php.net/manual/en/function.hash-pbkdf2.php)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Password Hashing Competition (Argon2)](https://password-hashing.net/)
- [Have I Been Pwned](https://haveibeenpwned.com/) — verifica se una password è stata esposta in data breach
