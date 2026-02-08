# Moduli di Sistema: Path, OS e Util

## 📋 Indice

- [Introduzione](#introduzione)
- [Il Modulo Path](#il-modulo-path)
- [Il Modulo OS](#il-modulo-os)
- [Il Modulo Util](#il-modulo-util)
- [Best Practices](#best-practices)
- [Risorse Utili](#risorse-utili)

---

## Introduzione

Questi tre moduli core forniscono **utilità essenziali** per interagire con il sistema operativo, gestire percorsi di file e convertire API basate su callback in Promise.

### 🎯 Quando Usarli

| Modulo | Casi d'Uso |
|--------|------------|
| `path` | Manipolazione percorsi file cross-platform |
| `os` | Info sistema, CPU, memoria, network |
| `util` | Promisify, debug, type checking |

---

## Il Modulo Path

Il modulo `path` fornisce utilità per lavorare con percorsi di file e directory in modo **coerente tra piattaforme** (Windows, Linux, macOS).

### 📦 Importare il Modulo

```javascript
const path = require('path');
```

### 🔑 Perché è Importante

```javascript
// ❌ Problema: path separators diversi tra OS
const badPath = 'folder\\subfolder\\file.txt'; // Windows
const badPath2 = 'folder/subfolder/file.txt';  // Unix

// ✅ Soluzione: path.join() gestisce tutto
const goodPath = path.join('folder', 'subfolder', 'file.txt');
// Windows: folder\subfolder\file.txt
// Unix:    folder/subfolder/file.txt
```

### 📊 Funzioni Principali

#### path.join() - Unire Percorsi

```javascript
// Unisce segmenti di path con il separatore corretto
const fullPath = path.join('/home', 'user', 'documents', 'file.txt');
console.log(fullPath); 
// Linux/macOS: /home/user/documents/file.txt
// Windows:     \home\user\documents\file.txt

// Gestisce automaticamente '..' e '.'
const normalized = path.join('/home/user', '../admin', './docs');
console.log(normalized); // /home/admin/docs

// Rimuove slash extra
const clean = path.join('/home/', '//user//', 'file.txt');
console.log(clean); // /home/user/file.txt
```

#### path.resolve() - Percorsi Assoluti

```javascript
// Calcola percorso assoluto da segmenti
const absolute = path.resolve('folder', 'subfolder', 'file.txt');
console.log(absolute); 
// /current/working/directory/folder/subfolder/file.txt

// Con percorso assoluto iniziale
const abs2 = path.resolve('/home/user', 'docs', 'file.txt');
console.log(abs2); // /home/user/docs/file.txt

// Utile per __dirname
const configPath = path.resolve(__dirname, '../config', 'app.json');
```

#### path.basename() - Nome File

```javascript
// Ottieni nome file da percorso
const fileName = path.basename('/path/to/myfile.txt');
console.log(fileName); // myfile.txt

// Ottieni nome senza estensione
const nameOnly = path.basename('/path/to/myfile.txt', '.txt');
console.log(nameOnly); // myfile
```

#### path.extname() - Estensione File

```javascript
// Ottieni estensione file
const ext = path.extname('/path/to/file.txt');
console.log(ext); // .txt

const ext2 = path.extname('file.tar.gz');
console.log(ext2); // .gz (solo ultima estensione)

const ext3 = path.extname('README');
console.log(ext3); // '' (nessuna estensione)
```

#### path.dirname() - Directory

```javascript
// Ottieni directory contenente il file
const dir = path.dirname('/path/to/file.txt');
console.log(dir); // /path/to

const dir2 = path.dirname('/path/to/');
console.log(dir2); // /path
```

#### path.normalize() - Normalizzare

```javascript
// Rimuovi ridondanze e risolvi '..' e '.'
const messy = '/path//to/../to/./file.txt';
const clean = path.normalize(messy);
console.log(clean); // /path/to/file.txt

// Su Windows
const windowsPath = 'C:\\path\\\\to\\..\\to\\.\\file.txt';
const normalized = path.normalize(windowsPath);
console.log(normalized); // C:\path\to\file.txt
```

#### path.parse() - Analisi Completa

```javascript
// Ottieni tutti i componenti del path
const pathInfo = path.parse('/home/user/documents/file.txt');
console.log(pathInfo);
/* Output:
{
  root: '/',
  dir: '/home/user/documents',
  base: 'file.txt',
  ext: '.txt',
  name: 'file'
}
*/

// Su Windows
const winPath = path.parse('C:\\Users\\Mario\\file.txt');
console.log(winPath);
/* Output:
{
  root: 'C:\\',
  dir: 'C:\\Users\\Mario',
  base: 'file.txt',
  ext: '.txt',
  name: 'file'
}
*/
```

#### path.format() - Costruire Path

```javascript
// Costruisci path da componenti
const pathObj = {
  root: '/home/',
  dir: '/home/user/documents',
  base: 'file.txt'
};

const reconstructed = path.format(pathObj);
console.log(reconstructed); // /home/user/documents/file.txt

// Con name ed ext invece di base
const pathObj2 = {
  dir: '/home/user',
  name: 'file',
  ext: '.txt'
};
console.log(path.format(pathObj2)); // /home/user/file.txt
```

#### path.relative() - Path Relativo

```javascript
// Calcola path relativo tra due path
const from = '/home/user/documents';
const to = '/home/user/pictures/photo.jpg';
const relative = path.relative(from, to);
console.log(relative); // ../pictures/photo.jpg
```

### 🌐 Path Cross-Platform

```javascript
console.log('Separatore:', path.sep);
// Windows: \
// Unix:    /

console.log('Delimitatore PATH:', path.delimiter);
// Windows: ;
// Unix:    :

// Forza specifico OS (per testing)
const posixPath = path.posix.join('home', 'user', 'file.txt');
console.log(posixPath); // home/user/file.txt (sempre Unix)

const winPath = path.win32.join('home', 'user', 'file.txt');
console.log(winPath); // home\user\file.txt (sempre Windows)
```

### 💡 Esempi Pratici

```javascript
const path = require('path');

// File utility class
class PathUtils {
  // Cambia estensione file
  static changeExtension(filePath, newExt) {
    const parsed = path.parse(filePath);
    return path.format({
      ...parsed,
      base: undefined,
      ext: newExt.startsWith('.') ? newExt : `.${newExt}`
    });
  }

  // Ottieni tutti i parent directories
  static getParentDirs(filePath) {
    const parents = [];
    let current = path.dirname(filePath);
    
    while (current !== path.dirname(current)) {
      parents.push(current);
      current = path.dirname(current);
    }
    
    return parents;
  }

  // Verifica se path è sotto directory
  static isUnder(childPath, parentPath) {
    const relative = path.relative(parentPath, childPath);
    return !relative.startsWith('..') && !path.isAbsolute(relative);
  }
}

// Test
console.log(PathUtils.changeExtension('file.txt', '.md')); 
// file.md

console.log(PathUtils.getParentDirs('/a/b/c/d/file.txt'));
// ['/a/b/c/d', '/a/b/c', '/a/b', '/a']

console.log(PathUtils.isUnder('/home/user/docs/file.txt', '/home/user'));
// true
```

---

## Il Modulo OS

Il modulo `os` fornisce utilità per **interagire con il sistema operativo** e ottenere informazioni su hardware e software.

### 📦 Importare il Modulo

```javascript
const os = require('os');
```

### 🖥️ Informazioni Sistema

```javascript
// Piattaforma
console.log('Platform:', os.platform()); 
// 'win32', 'darwin' (macOS), 'linux', 'freebsd', 'openbsd'

// Architettura
console.log('Architecture:', os.arch()); 
// 'x64', 'arm', 'arm64', 'ia32'

// Versione OS
console.log('OS Release:', os.release()); 
// '10.0.19041' (Windows), '20.04' (Ubuntu)

// Tipo OS
console.log('OS Type:', os.type()); 
// 'Windows_NT', 'Linux', 'Darwin'

// Hostname
console.log('Hostname:', os.hostname()); 
// 'MyComputer-PC'

// Uptime sistema (secondi)
console.log('System Uptime:', os.uptime()); 
// 3600 (1 hour)
const hours = (os.uptime() / 3600).toFixed(2);
console.log(`System up for ${hours} hours`);
```

### 👤 Informazioni Utente

```javascript
// Home directory
console.log('Home:', os.homedir());
// Windows: C:\Users\Mario
// Linux:   /home/mario
// macOS:   /Users/mario

// Info utente corrente
const userInfo = os.userInfo();
console.log('User Info:', userInfo);
/* Output:
{
  uid: 1000,              // User ID (Unix)
  gid: 1000,              // Group ID (Unix)
  username: 'mario',      // Username
  homedir: '/home/mario', // Home directory
  shell: '/bin/bash'      // Shell (Unix)
}
*/

// Temp directory
console.log('Temp:', os.tmpdir());
// Linux:   /tmp
// Windows: C:\Users\Mario\AppData\Local\Temp
// macOS:   /var/folders/...
```

### 🧠 Informazioni CPU

```javascript
// Array di CPU cores
const cpus = os.cpus();
console.log(`CPU Cores: ${cpus.length}`);
console.log('CPU Model:', cpus[0].model);
/* Output per ogni core:
{
  model: 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz',
  speed: 2600,  // MHz
  times: {
    user: 252020,   // Time in user mode
    nice: 0,        // Time in nice mode
    sys: 30340,     // Time in system mode
    idle: 1070356,  // Time idle
    irq: 0          // Time in IRQ
  }
}
*/

// CPU totale tempo
const totalTime = cpus.reduce((acc, cpu) => {
  const { user, nice, sys, idle, irq } = cpu.times;
  return acc + user + nice + sys + idle + irq;
}, 0);

// CPU load (percentuale)
const idleTime = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
const cpuUsage = ((1 - idleTime / totalTime) * 100).toFixed(2);
console.log(`CPU Usage: ${cpuUsage}%`);
```

### 💾 Informazioni Memoria

```javascript
// Memoria totale (bytes)
const totalMem = os.totalmem();
console.log(`Total Memory: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`);

// Memoria libera (bytes)
const freeMem = os.freemem();
console.log(`Free Memory: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`);

// Memoria usata
const usedMem = totalMem - freeMem;
const usagePercent = ((usedMem / totalMem) * 100).toFixed(2);
console.log(`Memory Usage: ${usagePercent}%`);
```

### 🌐 Informazioni Rete

```javascript
// Interfacce di rete
const networkInterfaces = os.networkInterfaces();
console.log('Network Interfaces:', Object.keys(networkInterfaces));

// Dettagli per interfaccia
Object.entries(networkInterfaces).forEach(([name, interfaces]) => {
  console.log(`\n${name}:`);
  interfaces.forEach(iface => {
    console.log(`  ${iface.family}: ${iface.address}`);
    /* Output:
    {
      address: '192.168.1.100',  // IP address
      netmask: '255.255.255.0',  // Network mask
      family: 'IPv4',            // 'IPv4' or 'IPv6'
      mac: '00:1a:2b:3c:4d:5e', // MAC address
      internal: false,           // Is loopback?
      cidr: '192.168.1.100/24'  // CIDR notation
    }
    */
  });
});
```

### 🔤 Costanti

```javascript
// End-of-line
console.log('EOL:', JSON.stringify(os.EOL));
// Windows: "\r\n"
// Unix:    "\n"

// Byte order
console.log('Endianness:', os.endianness());
// 'BE' (big-endian) or 'LE' (little-endian)

// Costanti priorità (Unix)
console.log('Priority Constants:', os.constants.priority);
/* Output:
{
  PRIORITY_LOW: 19,
  PRIORITY_BELOW_NORMAL: 10,
  PRIORITY_NORMAL: 0,
  PRIORITY_ABOVE_NORMAL: -7,
  PRIORITY_HIGH: -14,
  PRIORITY_HIGHEST: -20
}
*/
```

### 💡 Classe Utilità Sistema

```javascript
const os = require('os');

class SystemInfo {
  static getOverview() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    return {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      uptime: {
        seconds: os.uptime(),
        formatted: this.formatUptime(os.uptime())
      },
      cpu: {
        model: os.cpus()[0].model,
        cores: os.cpus().length,
        speed: os.cpus()[0].speed
      },
      memory: {
        total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        used: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
        usagePercent: `${((usedMem / totalMem) * 100).toFixed(2)}%`
      },
      user: os.userInfo(),
      networkInterfaces: Object.keys(os.networkInterfaces())
    };
  }

  static formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }

  static isPlatform(platform) {
    return os.platform() === platform;
  }

  static isWindows() {
    return this.isPlatform('win32');
  }

  static isLinux() {
    return this.isPlatform('linux');
  }

  static isMacOS() {
    return this.isPlatform('darwin');
  }
}

// Test
console.log(SystemInfo.getOverview());
console.log('Running on Linux:', SystemInfo.isLinux());
```

---

## Il Modulo Util

Il modulo `util` fornisce funzioni di utilità per **supportare le API interne** di Node.js, ma molte sono utili anche per sviluppatori.

### 📦 Importare il Modulo

```javascript
const util = require('util');
```

### 🔄 util.promisify() - Da Callback a Promise

```javascript
const fs = require('fs');
const util = require('util');

// ❌ Stile callback (vecchio)
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) console.error(err);
  else console.log(data);
});

// ✅ Promisified (moderno)
const readFile = util.promisify(fs.readFile);

async function leggiFile() {
  try {
    const data = await readFile('file.txt', 'utf8');
    console.log(data);
  } catch (err) {
    console.error('Errore:', err);
  }
}

// Alternativa: fs.promises (Node 10+)
const fsPromises = require('fs').promises;
await fsPromises.readFile('file.txt', 'utf8');
```

### 🖨️ util.format() - Formattazione Stringhe

```javascript
// Format string stile printf
const formatted = util.format('Il %s ha %d anni e vive a %s', 
  'gatto', 5, 'Roma');
console.log(formatted); 
// Il gatto ha 5 anni e vive a Roma

// Specifiers
util.format('%s', 'string');    // string
util.format('%d', 42);          // number
util.format('%i', 42);          // integer
util.format('%f', 3.14);        // float
util.format('%j', {a: 1});      // JSON
util.format('%o', {a: 1});      // Object
util.format('%%', ); // % literal
```

### 🔍 util.inspect() - Debug Objects

```javascript
const obj = {
  nome: 'Mario',
  età: 30,
  indirizzo: {
    città: 'Roma',
    cap: '00100'
  },
  hobby: ['calcio', 'cinema']
};

// Inspect con opzioni
console.log(util.inspect(obj, {
  depth: null,      // Profondità infinita
  colors: true,     // Colori in console
  showHidden: false, // Mostra proprietà nascoste
  compact: false    // Formattazione espansa
}));

// Inspect personalizzato
class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  [util.inspect.custom](depth, options) {
    return `User(${this.name}, ${this.age})`;
  }
}

const user = new User('Mario', 30);
console.log(util.inspect(user));
// User(Mario, 30)
```

### ✅ Type Checking (Deprecati ma Utili)

```javascript
// Verifica tipi (deprecati ma ancora usati)
console.log(util.isArray([1, 2, 3]));        // true
console.log(util.isRegExp(/abc/));           // true
console.log(util.isDate(new Date()));        // true
console.log(util.isError(new Error()));      // true

// ⚠️ Deprecati: usa invece
Array.isArray([1, 2, 3]);                    // true
obj instanceof RegExp;
obj instanceof Date;
obj instanceof Error;
```

### 🏷️ util.types - Type Checking Moderno

```javascript
const { types } = require('util');

// Typed arrays
console.log(types.isUint8Array(new Uint8Array())); // true
console.log(types.isArrayBuffer(new ArrayBuffer())); // true

// Promises
console.log(types.isPromise(Promise.resolve())); // true
console.log(types.isAsyncFunction(async () => {})); // true

// Proxies
console.log(types.isProxy(new Proxy({}, {}))); // true

// Maps & Sets
console.log(types.isMap(new Map())); // true
console.log(types.isSet(new Set())); // true
```

### 🎭 util.callbackify() - Da Promise a Callback

```javascript
// Opposto di promisify (raro)
async function asyncFunction() {
  return 'risultato';
}

const callbackVersion = util.callbackify(asyncFunction);

callbackVersion((err, result) => {
  if (err) console.error(err);
  else console.log(result); // 'risultato'
});
```

### 💡 Utility Pratiche

```javascript
const util = require('util');

class UtilHelpers {
  // Deep clone con inspect
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Safe JSON stringify con circulars
  static safeStringify(obj) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  }

  // Format con template
  static template(str, vars) {
    return str.replace(/\${(\w+)}/g, (_, key) => {
      return vars[key] || '';
    });
  }
}

// Test
const template = 'Hello ${name}, you are ${age} years old';
console.log(UtilHelpers.template(template, { name: 'Mario', age: 30 }));
// Hello Mario, you are 30 years old
```

---

## Best Practices

### 📁 Path

1. **Sempre usa path.join()** invece di concatenazione stringhe
2. **path.resolve()** per percorsi assoluti da __dirname
3. **path.normalize()** per pulire input utente
4. **Cross-platform**: usa sempre path methods, mai hardcode '/' o '\\'

### 🖥️ OS

1. **Cache info statiche** (cpu, totalmem) invece di richiamarle
2. **Usa os.platform()** per logica platform-specific
3. **Memory monitoring**: usa setInterval per tracciare memoria
4. **Non overload CPU checks**: sono operazioni costose

### 🔧 Util

1. **Preferisci fs.promises** invece di util.promisify(fs)
2. **util.inspect()** eccellente per debug, non per production
3. **util.format()** ok per logging, ma considera template literals
4. **Type checking**: usa modern util.types invece di vecchi util.is*

---

## Risorse Utili

### 📚 Documentazione

- [Node.js Path Module](https://nodejs.org/api/path.html)
- [Node.js OS Module](https://nodejs.org/api/os.html)
- [Node.js Util Module](https://nodejs.org/api/util.html)

### 🛠️ Librerie Correlate

- [cross-env](https://www.npmjs.com/package/cross-env) - Cross-platform environment variables
- [systeminformation](https://www.npmjs.com/package/systeminformation) - System info esteso
- [promisify-all](https://www.npmjs.com/package/pify) - Promisify multiplo

---

**💡 Tip**: Questi moduli sono **perfetti per tooling e utilities** - build scripts, CLI tools, system monitoring.
