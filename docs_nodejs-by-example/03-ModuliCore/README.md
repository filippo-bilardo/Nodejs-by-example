# Esercitazione 2: Moduli Core di Node.js

In questa esercitazione esploreremo i moduli core di Node.js, imparando come utilizzare le funzionalità native senza dipendenze esterne.

## Obiettivi di Apprendimento
- Comprendere il sistema di moduli di Node.js (CommonJS vs ES Modules)
- Padroneggiare l'uso dei moduli core fondamentali (fs, path, http, events, os, util)
- Implementare server HTTP di base e gestire richieste
- Manipolare il file system in modo sincrono e asincrono
- Creare sistemi di eventi personalizzati con EventEmitter
- Gestire percorsi di file cross-platform
- Ottenere informazioni sul sistema operativo

## Argomenti Teorici Collegati
- [Moduli in Node.js](./teoria/01-Moduli_in_Node.md)
- [File System](./teoria/02-file-system.md)
- [HTTP e Networking](./teoria/03-http-networking.md)
- [Altri Moduli Core](./teoria/05-altri-moduli-core.md)

## Esercizi Pratici

### Esercizio 2.1: Modulo Path - Gestione Percorsi Cross-Platform
Il modulo `path` fornisce utilità per lavorare con percorsi di file e directory in modo compatibile tra Windows, Linux e macOS.

**💡 Concetti Chiave:**
- Separatori di percorso differenti per OS (`\` su Windows, `/` su Unix)
- Normalizzazione automatica dei percorsi
- Risoluzione di percorsi relativi e assoluti

```javascript
// esempi/path-demo.js
const path = require('path');

console.log('=== INFORMAZIONI SUL FILE CORRENTE ===');
console.log('Nome del file:', path.basename(__filename));
console.log('Directory:', path.dirname(__filename));
console.log('Estensione:', path.extname(__filename));

console.log('\n=== COSTRUZIONE PERCORSI ===');
// Metodo sicuro per costruire percorsi (cross-platform)
const nuovoPercorso = path.join(__dirname, 'files', 'esempio.txt');
console.log('Percorso costruito:', nuovoPercorso);

// Risoluzione percorsi assoluti
const percorsoAssoluto = path.resolve('temp', 'file.txt');
console.log('Percorso assoluto:', percorsoAssoluto);

console.log('\n=== NORMALIZZAZIONE E PARSING ===');
// Normalizzazione (rimuove ridondanze)
const percorsoComplesso = '/test/test1//2slashes/1slash/tab/../';
console.log('Prima:', percorsoComplesso);
console.log('Normalizzato:', path.normalize(percorsoComplesso));

// Parsing completo del percorso
const infoPercorso = path.parse('/home/user/documents/report.pdf');
console.log('Informazioni percorso:', infoPercorso);
/* 
Output:
{
  root: '/',
  dir: '/home/user/documents',
  base: 'report.pdf',
  ext: '.pdf',
  name: 'report'
}
*/

console.log('\n=== UTILITÀ CROSS-PLATFORM ===');
console.log('Separatore percorsi:', path.sep); // '/' su Unix, '\' su Windows
console.log('Separatore variabili PATH:', path.delimiter); // ':' su Unix, ';' su Windows
```

**🎯 Esercizio Pratico:** Crea un file `path-exercise.js` che costruisce un percorso verso una cartella "logs" con un file "app-YYYY-MM-DD.log" usando la data corrente.

### Esercizio 2.2: Modulo OS - Informazioni Sistema
Il modulo `os` permette di ottenere informazioni dettagliate sul sistema operativo e monitorare le risorse.

**💡 Casi d'Uso Reali:**
- Monitoraggio delle risorse di sistema
- Adattamento dell'applicazione al tipo di OS
- Logging delle informazioni di sistema per debug

```javascript
// esempi/os-demo.js
const os = require('os');

console.log('=== INFORMAZIONI PIATTAFORMA ===');
console.log('Sistema operativo:', os.platform()); // 'win32', 'darwin', 'linux'
console.log('Architettura:', os.arch()); // 'x64', 'arm64', etc.
console.log('Versione OS:', os.release());
console.log('Hostname:', os.hostname());

console.log('\n=== RISORSE HARDWARE ===');
const cpus = os.cpus();
console.log(`CPU: ${cpus.length} core`);
console.log(`Modello CPU: ${cpus[0].model}`);
console.log(`Velocità CPU: ${cpus[0].speed} MHz`);

// Calcolo utilizzo memoria
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);

console.log(`Memoria totale: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
console.log(`Memoria libera: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`);
console.log(`Utilizzo memoria: ${memUsagePercent}%`);

console.log('\n=== INFORMAZIONI UTENTE E SISTEMA ===');
const userInfo = os.userInfo();
console.log('Utente corrente:', userInfo.username);
console.log('Home directory:', os.homedir());
console.log('Directory temporanea:', os.tmpdir());
console.log('Uptime sistema:', Math.floor(os.uptime() / 3600), 'ore');

console.log('\n=== INTERFACCE DI RETE ===');
const networkInterfaces = os.networkInterfaces();
Object.keys(networkInterfaces).forEach(name => {
  console.log(`${name}:`, networkInterfaces[name]
    .filter(iface => !iface.internal)
    .map(iface => `${iface.family}: ${iface.address}`)
  );
});

// Funzione utility per monitoraggio continuo
function monitoraRisorse() {
  const loadAvg = os.loadavg();
  const memUsage = ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(1);
  
  console.log(`[${new Date().toISOString()}] Carico: ${loadAvg[0].toFixed(2)}, Memoria: ${memUsage}%`);
}

// Monitora ogni 5 secondi (commentare per evitare loop infinito)
// setInterval(monitoraRisorse, 5000);
```

**🎯 Esercizio Pratico:** Crea un sistema di alert che notifica quando l'utilizzo della memoria supera l'80%.

### Esercizio 2.3: Modulo URL - Manipolazione URL Avanzata
Il modulo `url` è essenziale per parsing, validazione e costruzione di URL in applicazioni web.

**💡 Casi d'Uso:**
- Parsing di URL nelle richieste HTTP
- Costruzione dinamica di URL per API
- Validazione e sanitizzazione di input URL

```javascript
// esempi/url-demo.js
const { URL, URLSearchParams } = require('url');

console.log('=== PARSING URL COMPLETO ===');
const urlCompleto = 'https://api.example.com:8080/v1/users?page=1&limit=10&sort=name#section1';
const parsed = new URL(urlCompleto);

console.log('Protocol:', parsed.protocol);     // https:
console.log('Host:', parsed.host);            // api.example.com:8080
console.log('Hostname:', parsed.hostname);    // api.example.com
console.log('Port:', parsed.port);            // 8080
console.log('Pathname:', parsed.pathname);    // /v1/users
console.log('Search:', parsed.search);        // ?page=1&limit=10&sort=name
console.log('Hash:', parsed.hash);            // #section1

console.log('\n=== GESTIONE QUERY PARAMETERS ===');
// Accesso ai parametri
console.log('Page:', parsed.searchParams.get('page'));
console.log('Limit:', parsed.searchParams.get('limit'));
console.log('Tutti i parametri:');
for (const [key, value] of parsed.searchParams) {
  console.log(`  ${key}: ${value}`);
}

// Modifica parametri
parsed.searchParams.set('page', '2');
parsed.searchParams.append('filter', 'active');
parsed.searchParams.delete('sort');
console.log('URL modificato:', parsed.href);

console.log('\n=== COSTRUZIONE DINAMICA URL ===');
function costruisciUrlAPI(baseUrl, endpoint, params = {}) {
  const url = new URL(endpoint, baseUrl);
  
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v));
    } else {
      url.searchParams.set(key, value);
    }
  });
  
  return url.href;
}

const apiUrl = costruisciUrlAPI('https://api.myapp.com', '/search', {
  q: 'node.js tutorial',
  category: ['programming', 'javascript'],
  page: 1,
  per_page: 20
});
console.log('URL API costruito:', apiUrl);

console.log('\n=== VALIDAZIONE URL ===');
function validaUrl(urlString) {
  try {
    const url = new URL(urlString);
    return {
      valid: true,
      protocol: url.protocol,
      secure: url.protocol === 'https:',
      domain: url.hostname
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

const urlDaTestare = [
  'https://example.com',
  'http://invalid-url',
  'not-a-url',
  'ftp://files.example.com/file.txt'
];

urlDaTestare.forEach(url => {
  const risultato = validaUrl(url);
  console.log(`${url}: ${risultato.valid ? '✅ Valido' : '❌ Non valido'}`);
  if (risultato.valid) {
    console.log(`  → Protocollo: ${risultato.protocol}, Sicuro: ${risultato.secure}`);
  }
});

console.log('\n=== GESTIONE AVANZATA QUERY PARAMS ===');
const params = new URLSearchParams();
params.set('search', 'node.js guide');
params.set('lang', 'it');
params.append('tag', 'tutorial');
params.append('tag', 'backend');

// Conversione in oggetto
const paramsObj = {};
for (const [key, value] of params) {
  if (paramsObj[key]) {
    if (Array.isArray(paramsObj[key])) {
      paramsObj[key].push(value);
    } else {
      paramsObj[key] = [paramsObj[key], value];
    }
  } else {
    paramsObj[key] = value;
  }
}
console.log('Parametri come oggetto:', paramsObj);
```

**🎯 Esercizio Pratico:** Crea una funzione che estrae il dominio principale da qualsiasi URL (es. "www.sub.example.com" → "example.com").

### Esercizio 2.4: Modulo Util - Utilità per Sviluppatori
Il modulo `util` fornisce funzioni essenziali per debugging, conversioni e formattazione.

**💡 Funzionalità Chiave:**
- Conversione callback → Promise (promisify)
- Debugging e ispezione oggetti
- Formattazione stringhe avanzata
- Gestione deprecazioni

```javascript
// esempi/util-demo.js
const util = require('util');
const fs = require('fs');

console.log('=== PROMISIFY: DA CALLBACK A PROMISE ===');
// Problema: molte API Node.js usano callback
fs.readFile('package.json', 'utf8', (err, data) => {
  if (err) console.error('Errore callback:', err.message);
  else console.log('✅ File letto con callback');
});

// Soluzione: promisify per usare async/await
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

async function gestioneFileAsync() {
  try {
    const data = await readFileAsync(__filename, 'utf8');
    console.log('✅ File letto con Promise/async-await');
    console.log(`📄 File size: ${data.length} characters`);
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}
gestioneFileAsync();

console.log('\n=== ISPEZIONE E DEBUG OGGETTI ===');
const oggettoComplesso = {
  name: 'MyApp',
  version: '1.0.0',
  config: {
    database: {
      host: 'localhost',
      port: 5432,
      credentials: { user: 'admin', pass: '***' }
    },
    features: ['auth', 'logging', 'monitoring'],
    metadata: new Date(),
    regexp: /test\d+/g
  }
};

// Ispezione base
console.log('Oggetto base:', util.inspect(oggettoComplesso, { 
  depth: 2, 
  colors: true,
  compact: false
}));

// Ispezione personalizzata
console.log('\nIspezione profonda:', util.inspect(oggettoComplesso, {
  depth: null,        // Profondità infinita
  maxArrayLength: 5,  // Max elementi array
  breakLength: 60,    // Larghezza linea
  sorted: true        // Ordina le chiavi
}));

console.log('\n=== FORMATTAZIONE STRINGHE AVANZATA ===');
// printf-style formatting
console.log(util.format('Utente: %s, ID: %d, Attivo: %j', 'Mario', 123, true));
console.log(util.format('Percentuale: %d%%', 85));

// Template con oggetti
const logMessage = util.format('[%s] %s - User: %j', 
  new Date().toISOString(), 
  'Login successful', 
  { id: 456, name: 'Alice' }
);
console.log('Log formattato:', logMessage);

console.log('\n=== GESTIONE DEPRECAZIONI ===');
// Funzione deprecata con avviso personalizzato
const vecchiaFunzione = util.deprecate(
  function calcolaQuadrato(n) {
    return n * n;
  },
  'calcolaQuadrato() è deprecata. Usa Math.pow(n, 2) invece.',
  'DEP001' // Codice deprecazione
);

// Prima chiamata mostra l'avviso, le successive no
console.log('Risultato:', vecchiaFunzione(5));

console.log('\n=== VERIFICA TIPI (Legacy ma utile) ===');
const valoriTest = [
  [1, 2, 3],
  new Date(),
  /regex/g,
  new Error('test'),
  Buffer.from('hello'),
  null,
  undefined
];

valoriTest.forEach(valore => {
  console.log(`${util.inspect(valore)}: ${
    Array.isArray(valore) ? 'Array' :
    util.isDate(valore) ? 'Date' :
    util.isRegExp(valore) ? 'RegExp' :
    util.isError(valore) ? 'Error' :
    Buffer.isBuffer(valore) ? 'Buffer' :
    typeof valore
  }`);
});

console.log('\n=== DEBUGGING AVANZATO ===');
// Funzione per debug con context
function debugLog(context, message, data = null) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${context}] ${message}`;
  
  if (data) {
    console.log(formattedMessage);
    console.log('Data:', util.inspect(data, { 
      depth: 3, 
      colors: true,
      maxStringLength: 100
    }));
  } else {
    console.log(formattedMessage);
  }
}

debugLog('AUTH', 'User login attempt', {
  userId: 'user123',
  timestamp: new Date(),
  metadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' }
});
```

**🎯 Esercizio Pratico:** Crea un sistema di logging che usa util.format per messaggi strutturati e util.inspect per debug di oggetti complessi.

### Esercizio 2.5: Eventi con EventEmitter - Architettura Event-Driven
Il modulo `events` implementa il pattern Observer, fondamentale per applicazioni reattive e asincrone.

**💡 Pattern Architetturali:**
- Observer Pattern per disaccoppiamento
- Gestione eventi asincroni
- Comunicazione tra moduli
- Sistema di notifiche real-time

```javascript
// esempi/events-demo.js
const EventEmitter = require('events');

console.log('=== BASE EVENTEMITTER ===');

// Classe personalizzata con eventi
class GestoreUtenti extends EventEmitter {
  constructor() {
    super();
    this.utenti = new Map();
  }

  aggiungiUtente(id, dati) {
    if (this.utenti.has(id)) {
      this.emit('errore', new Error(`Utente ${id} già esistente`));
      return false;
    }

    this.utenti.set(id, { ...dati, createdAt: new Date() });
    this.emit('utente-aggiunto', id, dati);
    
    // Evento condizionale
    if (this.utenti.size === 1) {
      this.emit('primo-utente', id);
    }
    
    return true;
  }

  rimuoviUtente(id) {
    if (!this.utenti.has(id)) {
      this.emit('errore', new Error(`Utente ${id} non trovato`));
      return false;
    }

    const utente = this.utenti.get(id);
    this.utenti.delete(id);
    this.emit('utente-rimosso', id, utente);
    
    if (this.utenti.size === 0) {
      this.emit('tutti-utenti-rimossi');
    }
    
    return true;
  }

  getUtenti() {
    return Array.from(this.utenti.entries());
  }
}

// Utilizzo del gestore utenti
const gestore = new GestoreUtenti();

// Listener per eventi diversi
gestore.on('utente-aggiunto', (id, dati) => {
  console.log(`✅ Nuovo utente: ${dati.nome} (ID: ${id})`);
});

gestore.on('utente-rimosso', (id, utente) => {
  console.log(`🗑️ Utente rimosso: ${utente.nome} (ID: ${id})`);
});

gestore.on('primo-utente', (id) => {
  console.log(`🎉 Primo utente registrato! ID: ${id}`);
});

gestore.on('tutti-utenti-rimossi', () => {
  console.log('📭 Nessun utente rimasto nel sistema');
});

gestore.on('errore', (error) => {
  console.error(`❌ Errore: ${error.message}`);
});

// Test del sistema
gestore.aggiungiUtente('user1', { nome: 'Mario', email: 'mario@example.com' });
gestore.aggiungiUtente('user2', { nome: 'Luigi', email: 'luigi@example.com' });
gestore.aggiungiUtente('user1', { nome: 'Mario2' }); // Errore: duplicato
gestore.rimuoviUtente('user1');
gestore.rimuoviUtente('user3'); // Errore: non esistente
gestore.rimuoviUtente('user2');

console.log('\n=== GESTIONE AVANZATA LISTENER ===');

class NotificationCenter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20); // Aumenta limite listener
  }

  // Metodo per aggiungere listener con priorità
  addPriorityListener(evento, listener) {
    this.prependListener(evento, listener);
  }

  // Metodo per listener temporanei
  addTemporaryListener(evento, listener, durata = 5000) {
    this.once(evento, listener);
    
    // Rimuovi automaticamente dopo la durata
    const timeout = setTimeout(() => {
      this.removeListener(evento, listener);
      console.log(`⏱️ Listener temporaneo per '${evento}' rimosso dopo ${durata}ms`);
    }, durata);
    
    // Pulisci timeout se evento viene emesso
    this.once(evento, () => clearTimeout(timeout));
  }

  // Statistiche listener
  getListenerStats() {
    const eventi = this.eventNames();
    const stats = {};
    
    eventi.forEach(evento => {
      stats[evento] = this.listenerCount(evento);
    });
    
    return stats;
  }
}

const notificationCenter = new NotificationCenter();

// Listener con priorità (eseguito per primo)
notificationCenter.addPriorityListener('notifica', () => {
  console.log('🔔 [PRIORITÀ] Notifica ricevuta!');
});

// Listener normale
notificationCenter.on('notifica', (message) => {
  console.log(`📱 Notifica: ${message}`);
});

// Listener temporaneo
notificationCenter.addTemporaryListener('notifica', () => {
  console.log('⏰ Listener temporaneo attivo');
});

// Multiple listener per lo stesso evento
notificationCenter.on('notifica', (message) => {
  // Simulazione invio email
  console.log(`📧 Email inviata per: ${message}`);
});

notificationCenter.on('notifica', (message) => {
  // Simulazione logging
  console.log(`📝 Log: [${new Date().toISOString()}] ${message}`);
});

console.log('Statistiche listener:', notificationCenter.getListenerStats());
notificationCenter.emit('notifica', 'Sistema avviato correttamente');

console.log('\n=== PATTERN AVANZATI ===');

// Pipe di eventi tra emitter
class EventPipe {
  static pipe(source, target, eventMap = {}) {
    source.eventNames().forEach(eventName => {
      const targetEvent = eventMap[eventName] || eventName;
      source.on(eventName, (...args) => {
        target.emit(targetEvent, ...args);
      });
    });
  }
}

const sorgente = new EventEmitter();
const destinazione = new EventEmitter();

// Mappa eventi: 'input' -> 'processed'
EventPipe.pipe(sorgente, destinazione, { 'input': 'processed' });

destinazione.on('processed', (data) => {
  console.log('🔄 Dati processati:', data);
});

sorgente.emit('input', { id: 1, value: 'test' });

// Debouncing eventi
function debounceEvent(emitter, eventName, delay = 300) {
  let timeout;
  const originalEmit = emitter.emit.bind(emitter);
  
  emitter.emit = function(event, ...args) {
    if (event === eventName) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        originalEmit(event, ...args);
      }, delay);
    } else {
      originalEmit(event, ...args);
    }
  };
}

const searchEmitter = new EventEmitter();
debounceEvent(searchEmitter, 'search', 500);

searchEmitter.on('search', (query) => {
  console.log('🔍 Ricerca eseguita:', query);
});

// Simulazione digitazione rapida
console.log('\n🎯 Test debounce (solo l\'ultima ricerca verrà eseguita):');
searchEmitter.emit('search', 'n');
searchEmitter.emit('search', 'no');
searchEmitter.emit('search', 'nod');
searchEmitter.emit('search', 'node');
searchEmitter.emit('search', 'nodejs');
```

**🎯 Esercizio Pratico:** Implementa un sistema di chat real-time usando EventEmitter per gestire utenti, messaggi e notifiche.

### Esercizio 2.6: File System - Operazioni Avanzate
Manipolazione completa del file system con gestione errori e operazioni async/await.

```javascript
// esempi/fs-advanced.js
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

class FileManager extends EventEmitter {
  constructor(baseDir = './data') {
    super();
    this.baseDir = baseDir;
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
      this.emit('ready', `Directory ${this.baseDir} ready`);
    } catch (error) {
      this.emit('error', error);
    }
  }

  async writeJSON(filename, data) {
    const filePath = path.join(this.baseDir, filename);
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      this.emit('file-written', filePath, data);
      return true;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  async readJSON(filename) {
    const filePath = path.join(this.baseDir, filename);
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);
      this.emit('file-read', filePath, parsed);
      return parsed;
    } catch (error) {
      this.emit('error', error);
      return null;
    }
  }

  async listFiles(extension = '') {
    try {
      const files = await fs.readdir(this.baseDir);
      const filtered = extension ? 
        files.filter(f => path.extname(f) === extension) : files;
      
      const filesWithStats = await Promise.all(
        filtered.map(async (file) => {
          const filePath = path.join(this.baseDir, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            path: filePath,
            size: stats.size,
            modified: stats.mtime,
            isDirectory: stats.isDirectory()
          };
        })
      );
      
      this.emit('files-listed', filesWithStats);
      return filesWithStats;
    } catch (error) {
      this.emit('error', error);
      return [];
    }
  }
}

// Test del FileManager
const manager = new FileManager('./test-data');

manager.on('ready', (msg) => console.log('✅', msg));
manager.on('file-written', (path, data) => 
  console.log(`📝 File scritto: ${path} (${Object.keys(data).length} keys)`));
manager.on('file-read', (path, data) => 
  console.log(`📖 File letto: ${path}`));
manager.on('files-listed', (files) => 
  console.log(`📁 Trovati ${files.length} file`));
manager.on('error', (error) => 
  console.error('❌ Errore:', error.message));

// Esempio di utilizzo
setTimeout(async () => {
  await manager.writeJSON('config.json', { 
    app: 'MyApp', 
    version: '1.0.0',
    settings: { debug: true }
  });
  
  const config = await manager.readJSON('config.json');
  console.log('Config caricata:', config);
  
  const files = await manager.listFiles('.json');
  console.log('File JSON:', files);
}, 100);
```

### Esercizio 2.7: Server HTTP Completo
Implementazione di un server HTTP con routing, middleware e gestione errori.

```javascript
// esempi/http-server-advanced.js
const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

class HTTPServer extends EventEmitter {
  constructor(port = 3000) {
    super();
    this.port = port;
    this.routes = new Map();
    this.middleware = [];
    this.server = null;
  }

  // Aggiungere middleware
  use(fn) {
    this.middleware.push(fn);
  }

  // Definire route
  route(method, path, handler) {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, handler);
  }

  // Metodi HTTP
  get(path, handler) { this.route('GET', path, handler); }
  post(path, handler) { this.route('POST', path, handler); }
  put(path, handler) { this.route('PUT', path, handler); }
  delete(path, handler) { this.route('DELETE', path, handler); }

  // Gestire richieste
  async handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const routeKey = `${req.method}:${parsedUrl.pathname}`;
    
    // Aggiungere metodi helper alla response
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
    };

    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    try {
      // Eseguire middleware
      for (const mw of this.middleware) {
        await mw(req, res);
        if (res.headersSent) return;
      }

      // Cercare route
      const handler = this.routes.get(routeKey);
      if (handler) {
        await handler(req, res);
      } else {
        res.status(404).json({ error: 'Route not found' });
      }
    } catch (error) {
      this.emit('error', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  start() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      this.emit('started', this.port);
    });

    this.server.on('error', (error) => {
      this.emit('error', error);
    });

    return this;
  }

  stop() {
    if (this.server) {
      this.server.close(() => {
        this.emit('stopped');
      });
    }
  }
}

// Esempio di utilizzo
const server = new HTTPServer(3000);

// Middleware di logging
server.use(async (req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
});

// Middleware CORS
server.use(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
});

// Routes
server.get('/', async (req, res) => {
  res.json({ 
    message: 'Welcome to Advanced HTTP Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

server.get('/api/users', async (req, res) => {
  // Simulazione database
  const users = [
    { id: 1, name: 'Mario', email: 'mario@example.com' },
    { id: 2, name: 'Luigi', email: 'luigi@example.com' }
  ];
  res.json({ users, count: users.length });
});

server.post('/api/users', async (req, res) => {
  // Raccogliere body della richiesta
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try {
      const userData = JSON.parse(body);
      // Simulazione creazione utente
      const newUser = { id: Date.now(), ...userData };
      res.status(201).json({ user: newUser, message: 'User created' });
    } catch (error) {
      res.status(400).json({ error: 'Invalid JSON' });
    }
  });
});

// Eventi del server
server.on('started', (port) => {
  console.log(`🚀 Server avviato su http://localhost:${port}`);
  console.log(`📋 Routes disponibili:`);
  console.log(`   GET  /`);
  console.log(`   GET  /api/users`);
  console.log(`   POST /api/users`);
});

server.on('error', (error) => {
  console.error('❌ Errore server:', error.message);
});

server.start();

// Gestione shutdown graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Arresto server...');
  server.stop();
  process.exit(0);
});
```

## Sfide Avanzate

### 🎯 Sfida 1: Sistema di Monitoraggio Risorse
Implementa un monitor completo del sistema che:
- Monitora CPU, memoria, disco e rete ogni 2 secondi
- Emette eventi per soglie critiche (memoria >80%, CPU >70%)
- Salva statistiche in file JSON con rotazione giornaliera
- Invia notifiche via WebHook quando necessario

### 🎯 Sfida 2: File Watcher Intelligente
Crea un sistema che:
- Monitora una directory per cambiamenti file
- Processa automaticamente file CSV/JSON
- Applica trasformazioni configurabili
- Gestisce backup e versioning automatico

### 🎯 Sfida 3: Proxy HTTP con Cache
Sviluppa un proxy server che:
- Inoltra richieste ad API esterne
- Implementa cache intelligente con TTL
- Gestisce rate limiting per IP
- Fornisce metriche di performance

## File di Esempio Disponibili

La cartella `esempi/` contiene implementazioni pratiche complete:

- 📁 **`path-exercise.js`** - Utility avanzate per gestione percorsi e URL
- 📊 **`monitor-risorse.js`** - Sistema completo di monitoraggio sistema
- 💬 **`chat-system.js`** - Chat real-time con EventEmitter
- 🌐 **`http-server-advanced.js`** - Server HTTP con routing e middleware
- 📂 **`fs-advanced.js`** - File manager con operazioni asincrone
- 🔧 **Altri esempi base** - `os-demo.js`, `url-demo.js`, `util-demo.js`, etc.

### Come Eseguire gli Esempi

```bash
# Vai nella cartella esempi
cd esempi/

# Esegui un esempio specifico
node path-exercise.js
node monitor-risorse.js
node chat-system.js

# Per interrompere processi in background (monitor, chat)
# Usa Ctrl+C
```

## Risorse di Approfondimento

### 📚 Documentazione Ufficiale
- [Node.js API Documentation](https://nodejs.org/docs/latest/api/)
- [File System](https://nodejs.org/api/fs.html) - Operazioni sui file
- [Path](https://nodejs.org/api/path.html) - Gestione percorsi cross-platform  
- [OS](https://nodejs.org/api/os.html) - Informazioni sistema operativo
- [HTTP](https://nodejs.org/api/http.html) - Server e client HTTP
- [Events](https://nodejs.org/api/events.html) - EventEmitter e pattern Observer
- [URL](https://nodejs.org/api/url.html) - Parsing e manipolazione URL
- [Util](https://nodejs.org/api/util.html) - Utilità per sviluppatori

### 🎓 Guide e Tutorial
- [Node.js Modules Guide](https://nodejs.dev/learn/nodejs-modules)
- [Understanding Event Loop](https://nodejs.dev/learn/the-nodejs-event-loop)
- [Working with Files](https://nodejs.dev/learn/working-with-file-descriptors)
- [HTTP Server Tutorial](https://nodejs.dev/learn/build-an-http-server)

### 🛠️ Best Practices
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Error Handling](https://nodejs.org/api/errors.html)
- [Performance Monitoring](https://nodejs.org/docs/latest/api/perf_hooks.html)

### 💡 Pattern Avanzati
- **Event-Driven Architecture** - Come strutturare applicazioni reattive
- **Stream Processing** - Gestione efficiente di grandi quantità di dati
- **Cluster Mode** - Scalabilità orizzontale su multi-core
- **Worker Threads** - Elaborazione CPU-intensive parallela

## Navigazione

- [Indice del Corso](../README.md)
- Modulo Precedente: [Introduzione a Node.js](../01-Introduzione/README.md)
- Modulo Successivo: [NPM e Gestione Pacchetti](../03-NPM/README.md)