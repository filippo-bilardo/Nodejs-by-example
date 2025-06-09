# Altri Moduli Core di Node.js

## Introduzione

Oltre ai moduli principali come `fs`, `http` ed `events`, Node.js include numerosi altri moduli core che forniscono funzionalità essenziali per lo sviluppo di applicazioni. In questa guida, esploreremo alcuni di questi moduli e le loro funzionalità più importanti.

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

Il modulo `Buffer` è utilizzato per gestire dati binari in Node.js. È particolarmente utile quando si lavora con file binari o stream di dati.

### Utilizzo di Buffer

```javascript
// Creare un Buffer
const buf1 = Buffer.alloc(10); // Buffer di 10 byte inizializzato con zeri
const buf2 = Buffer.from('Hello, world!'); // Buffer da una stringa
const buf3 = Buffer.from([1, 2, 3, 4, 5]); // Buffer da un array di numeri

// Scrivere in un Buffer
buf1.write('Hello');
console.log(buf1.toString()); // 'Hello'

// Convertire Buffer in altre rappresentazioni
console.log(buf2.toString('hex')); // rappresentazione esadecimale
console.log(buf2.toString('base64')); // rappresentazione base64

// Concatenare Buffer
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
```

### Funzionalità Principali

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

## Conclusione

Node.js offre una vasta gamma di moduli core che forniscono funzionalità essenziali per lo sviluppo di applicazioni. Conoscere questi moduli e le loro API è fondamentale per sfruttare appieno le potenzialità di Node.js e creare applicazioni efficienti e robuste.