# Modulo Process - Monitoraggio e Controllo Processo

## 📋 Indice

- [Introduzione](#introduzione)
- [Informazioni Processo](#informazioni-processo)
- [Variabili Ambiente](#variabili-ambiente)
- [Argomenti Riga di Comando](#argomenti-riga-di-comando)
- [Eventi Processo](#eventi-processo)
- [Memoria e Performance](#memoria-e-performance)
- [Process Monitoring](#process-monitoring)
- [Gestione Segnali](#gestione-segnali)
- [Graceful Shutdown](#graceful-shutdown)
- [Best Practices](#best-practices)
- [Risorse Utili](#risorse-utili)

---

## Introduzione

L'oggetto `process` è un **oggetto globale** in Node.js che fornisce informazioni e controllo sul processo corrente. Non richiede `require()`.

### 🎯 Caratteristiche

- Oggetto globale (sempre disponibile)
- Istanza di EventEmitter
- Informazioni runtime
- Controllo ciclo di vita
- Monitoring performance

---

## Informazioni Processo

### 📊 Info Base

```javascript
// Informazioni versione
console.log('Node Version:', process.version);        // v18.17.0
console.log('V8 Version:', process.versions.v8);      // 10.2.154.26-node.28
console.log('All Versions:', process.versions);

// Platform & Architecture
console.log('Platform:', process.platform);           // 'linux', 'darwin', 'win32'
console.log('Architecture:', process.arch);           // 'x64', 'arm', 'arm64'

// Process IDs
console.log('PID:', process.pid);                     // Process ID
console.log('PPID:', process.ppid);                   // Parent Process ID

// Directories
console.log('CWD:', process.cwd());                   // Current Working Directory
console.log('Executable:', process.execPath);         // Node executable path
console.log('Script Location:', __dirname);            // Script directory

// Uptime
console.log('Process Uptime:', process.uptime(), 'seconds');
```

### 🔧 Metodi Utility

```javascript
// Cambia directory
process.chdir('/tmp');
console.log('New CWD:', process.cwd());

// Titolo processo (visibile in task manager)
process.title = 'my-node-app';
console.log('Title:', process.title);

// Exit
// process.exit(0);  // 0 = success
// process.exit(1);  // 1 = error
```

---

## Variabili Ambiente

### 🌍 process.env

```javascript
// Accesso variabili ambiente
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PATH:', process.env.PATH);
console.log('HOME:', process.env.HOME);

// Impostare variabili
process.env.MY_VAR = 'my_value';
console.log('MY_VAR:', process.env.MY_VAR);

// Check ambiente
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

console.log('Development mode:', isDevelopment);
console.log('Production mode:', isProduction);
```

### 💡 Best Practices Env

```javascript
class Config {
  static get(key, defaultValue = null) {
    return process.env[key] || defaultValue;
  }

  static getInt(key, defaultValue = 0) {
    const value = process.env[key];
    return value ? parseInt(value, 10) : defaultValue;
  }

  static getBool(key, defaultValue = false) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }

  static require(key) {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }
}

// Uso
const port = Config.getInt('PORT', 3000);
const debug = Config.getBool('DEBUG', false);
const apiKey = Config.require('API_KEY');

console.log(`Port: ${port}, Debug: ${debug}`);
```

---

## Argomenti Riga di Comando

### 📝 process.argv

```javascript
// process.argv è array con:
// [0] = node executable path
// [1] = script path
// [2+] = argomenti

console.log('All arguments:', process.argv);

// Esempio: node script.js --port 3000 --debug
// process.argv = [
//   '/usr/bin/node',
//   '/path/to/script.js',
//   '--port',
//   '3000',
//   '--debug'
// ]

// Parser argomenti
class ArgsParser {
  static parse() {
    const args = {};
    const flags = [];
    
    for (let i = 2; i < process.argv.length; i++) {
      const arg = process.argv[i];
      
      if (arg.startsWith('--')) {
        // Long option
        const key = arg.slice(2);
        const nextArg = process.argv[i + 1];
        
        if (nextArg && !nextArg.startsWith('-')) {
          args[key] = nextArg;
          i++;
        } else {
          flags.push(key);
        }
      } else if (arg.startsWith('-')) {
        // Short option
        const key = arg.slice(1);
        flags.push(key);
      }
    }
    
    return { args, flags };
  }
}

// Test
// node script.js --port 3000 --host localhost -d -v
const { args, flags } = ArgsParser.parse();
console.log('Args:', args);   // { port: '3000', host: 'localhost' }
console.log('Flags:', flags); // ['d', 'v']
```

---

## Eventi Processo

### 📡 Process Events

```javascript
// Exit event
process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
  // ⚠️ Solo operazioni sincrone qui!
  // NO async operations, NO setTimeout
});

// Before exit
process.on('beforeExit', (code) => {
  console.log('Before exit, code:', code);
  // ✅ Puoi fare async operations qui
});

// Uncaught Exception
process.on('uncaughtException', (err, origin) => {
  console.error('UNCAUGHT EXCEPTION!');
  console.error('Error:', err);
  console.error('Origin:', origin);
  // ⚠️ Process in stato inconsistente, meglio fare exit
  process.exit(1);
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION!');
  console.error('Promise:', promise);
  console.error('Reason:', reason);
  // In futuro Node.js terminerà il processo automaticamente
});

// Warning
process.on('warning', (warning) => {
  console.warn('Warning:', warning.name);
  console.warn('Message:', warning.message);
  console.warn('Stack:', warning.stack);
});

// Signals (Unix)
process.on('SIGINT', () => {
  console.log('Received SIGINT (Ctrl+C)');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM');
  process.exit(0);
});
```

### 🔔 Emit Custom Warnings

```javascript
// Emit warning
process.emitWarning('This is a custom warning', {
  code: 'MY_WARNING',
  detail: 'Additional information'
});

// Listen specifica warning
process.on('warning', (warning) => {
  if (warning.code === 'MY_WARNING') {
    console.log('My warning triggered:', warning.message);
  }
});
```

---

## Memoria e Performance

### 💾 Memory Usage

```javascript
// Memory usage
const memory = process.memoryUsage();
console.log('Memory Usage:');
console.log('  RSS:', (memory.rss / 1024 / 1024).toFixed(2), 'MB');
console.log('  Heap Total:', (memory.heapTotal / 1024 / 1024).toFixed(2), 'MB');
console.log('  Heap Used:', (memory.heapUsed / 1024 / 1024).toFixed(2), 'MB');
console.log('  External:', (memory.external / 1024 / 1024).toFixed(2), 'MB');
console.log('  Array Buffers:', (memory.arrayBuffers / 1024 / 1024).toFixed(2), 'MB');

/* Output:
{
  rss: 35000000,          // Resident Set Size (memoria fisica)
  heapTotal: 7000000,     // Heap totale allocato
  heapUsed: 5000000,      // Heap effettivamente usato
  external: 1000000,      // Memoria C++ objects
  arrayBuffers: 500000    // ArrayBuffer e SharedArrayBuffer
}
*/
```

### ⚡ CPU Usage

```javascript
// CPU usage (time in microseconds)
const cpuUsage = process.cpuUsage();
console.log('CPU Usage:');
console.log('  User:', cpuUsage.user / 1000, 'ms');
console.log('  System:', cpuUsage.system / 1000, 'ms');

// CPU usage since last call
const startUsage = process.cpuUsage();

// Do some work
for (let i = 0; i < 1000000; i++) {
  Math.sqrt(i);
}

const deltaUsage = process.cpuUsage(startUsage);
console.log('CPU time used:', (deltaUsage.user + deltaUsage.system) / 1000, 'ms');
```

### 📊 Resource Usage (Node 12+)

```javascript
// Resource usage
const usage = process.resourceUsage();
console.log('Resource Usage:', {
  userCPUTime: usage.userCPUTime / 1000 + ' ms',
  systemCPUTime: usage.systemCPUTime / 1000 + ' ms',
  maxRSS: (usage.maxRSS / 1024).toFixed(2) + ' MB',
  fsRead: usage.fsRead,
  fsWrite: usage.fsWrite,
  voluntaryContextSwitches: usage.voluntaryContextSwitches,
  involuntaryContextSwitches: usage.involuntaryContextSwitches
});
```

---

## Process Monitoring

### 📈 Complete Monitor Class

```javascript
class ProcessMonitor {
  constructor(options = {}) {
    this.options = {
      memoryThreshold: options.memoryThreshold || 100 * 1024 * 1024, // 100MB
      monitorInterval: options.monitorInterval || 5000, // 5s
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

  start() {
    if (this.monitoring) return;
    
    this.monitoring = true;
    console.log('🔍 Process monitoring started...\n');
    
    this.logProcessInfo();
    this.setupEventListeners();
    
    this.monitorInterval = setInterval(() => {
      this.checkResources();
    }, this.options.monitorInterval);
  }

  stop() {
    if (!this.monitoring) return;
    
    this.monitoring = false;
    clearInterval(this.monitorInterval);
    console.log('⏹️ Monitoring stopped');
    this.printSummary();
  }

  logProcessInfo() {
    console.log('=== PROCESS INFO ===');
    console.log(`PID: ${process.pid}`);
    console.log(`PPID: ${process.ppid}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`CWD: ${process.cwd()}`);
    console.log(`Executable: ${process.execPath}`);
    console.log(`Uptime: ${(process.uptime() / 60).toFixed(2)} minutes\n`);
  }

  checkResources() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Memory
    const memoryMB = memUsage.rss / 1024 / 1024;
    this.stats.memoryPeaks.push({
      timestamp: Date.now(),
      rss: memoryMB,
      heapUsed: memUsage.heapUsed / 1024 / 1024,
      heapTotal: memUsage.heapTotal / 1024 / 1024
    });
    
    // CPU
    this.stats.cpuSamples.push({
      timestamp: Date.now(),
      user: cpuUsage.user,
      system: cpuUsage.system
    });
    
    // Alert se supera soglie
    if (memUsage.rss > this.options.memoryThreshold) {
      this.logAlert('MEMORY', `${memoryMB.toFixed(2)} MB`);
    }
    
    // Keep last 100 samples
    if (this.stats.memoryPeaks.length > 100) {
      this.stats.memoryPeaks = this.stats.memoryPeaks.slice(-100);
    }
    if (this.stats.cpuSamples.length > 100) {
      this.stats.cpuSamples = this.stats.cpuSamples.slice(-100);
    }
  }

  setupEventListeners() {
    // Signals
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
      process.on(signal, () => {
        this.logEvent(`Received signal ${signal}`);
        this.gracefulShutdown(signal);
      });
    });

    // Errors
    process.on('uncaughtException', (error) => {
      this.logEvent(`Uncaught Exception: ${error.message}`);
      console.error('Uncaught Exception:', error);
    });

    process.on('unhandledRejection', (reason) => {
      this.logEvent(`Unhandled Rejection: ${reason}`);
      console.error('Unhandled Rejection:', reason);
    });

    // Warnings
    process.on('warning', (warning) => {
      this.logEvent(`Warning: ${warning.name} - ${warning.message}`);
    });

    // Exit
    process.on('exit', (code) => {
      this.logEvent(`Process exiting with code ${code}`);
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
    console.log(`\n🛑 Graceful shutdown initiated (${signal})...`);
    this.stop();
    
    // Force exit dopo timeout
    setTimeout(() => {
      console.log('💀 Forcing exit');
      process.exit(1);
    }, 5000);
    
    process.exit(0);
  }

  printSummary() {
    console.log('\n=== MONITORING SUMMARY ===');
    
    if (this.stats.memoryPeaks.length > 0) {
      const maxMem = Math.max(...this.stats.memoryPeaks.map(p => p.rss));
      const avgMem = this.stats.memoryPeaks.reduce((sum, p) => sum + p.rss, 0) 
        / this.stats.memoryPeaks.length;
      
      console.log(`Memory - Max: ${maxMem.toFixed(2)} MB, Avg: ${avgMem.toFixed(2)} MB`);
    }
    
    console.log(`Events logged: ${this.stats.events.length}`);
    console.log(`Session uptime: ${((Date.now() - this.stats.startTime) / 1000 / 60).toFixed(2)} minutes`);
  }
}

// ✅ Usage
const monitor = new ProcessMonitor({
  memoryThreshold: 50 * 1024 * 1024, // 50MB
  monitorInterval: 3000 // 3s
});

// monitor.start();

// Simulate work
// setTimeout(() => {
//   const bigArray = new Array(1000000).fill('test data');
// }, 2000);

// monitor.stop() after 10s
// setTimeout(() => monitor.stop(), 10000);
```

---

## Gestione Segnali

### 🚦 Signal Handling

```javascript
// Signals principali Unix
const signals = {
  SIGINT: 'Interrupt (Ctrl+C)',
  SIGTERM: 'Terminate',
  SIGQUIT: 'Quit',
  SIGHUP: 'Hang Up',
  SIGUSR1: 'User Signal 1',
  SIGUSR2: 'User Signal 2'
};

Object.entries(signals).forEach(([signal, description]) => {
  process.on(signal, () => {
    console.log(`Received ${signal}: ${description}`);
    
    if (['SIGINT', 'SIGTERM', 'SIGQUIT'].includes(signal)) {
      process.exit(0);
    }
  });
});

// Debug signal (Node specific)
process.on('SIGUSR1', () => {
  console.log('SIGUSR1: Start debugger');
  // Avvia debugger
});

// Reload config signal
process.on('SIGHUP', () => {
  console.log('SIGHUP: Reloading configuration...');
  // Ricarica configurazione
});
```

---

## Graceful Shutdown

### 🛑 Clean Exit Pattern

```javascript
class GracefulShutdown {
  constructor() {
    this.connections = new Set();
    this.isShuttingDown = false;
  }

  addConnection(conn) {
    this.connections.add(conn);
    
    conn.on('close', () => {
      this.connections.delete(conn);
    });
  }

  async shutdown(signal) {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);
    
    // 1. Stop accepting new connections
    console.log('1. Stopping new connections...');
    
    // 2. Close existing connections
    console.log(`2. Closing ${this.connections.size} active connections...`);
    for (const conn of this.connections) {
      conn.end();
    }
    
    // 3. Wait for connections to close
    await this.waitForConnections();
    
    // 4. Close database connections
    console.log('3. Closing database connections...');
    // await db.close();
    
    // 5. Final cleanup
    console.log('4. Running final cleanup...');
    
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  }

  async waitForConnections(timeout = 10000) {
    const start = Date.now();
    
    while (this.connections.size > 0) {
      if (Date.now() - start > timeout) {
        console.log(`⚠️ Timeout waiting for connections, forcing close`);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  setupHandlers() {
    ['SIGINT', 'SIGTERM'].forEach(signal => {
      process.on(signal, () => this.shutdown(signal));
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      this.shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
      this.shutdown('unhandledRejection');
    });
  }
}

// Usage
const shutdownHandler = new GracefulShutdown();
shutdownHandler.setupHandlers();
```

---

## Best Practices

### ✅ Do

1. **Always handle uncaughtException e unhandledRejection**
2. **Implement graceful shutdown**
3. **Monitor memory usage in production**
4. **Use environment variables per configurazione**
5. **Log eventi importanti**

### ❌ Don't

1. ❌ Non ignorare uncaught exceptions
2. ❌ Non fare async operations in 'exit' event
3. ❌ Non hardcode configurazioni (usa env vars)
4. ❌ Non lasciare process.exit() ovunque nel codice
5. ❌ Non dimenticare cleanup in shutdown

### 🔒 Security

```javascript
// Limit environment variable exposure
const sanitizedEnv = Object.keys(process.env)
  .filter(key => !key.includes('SECRET') && !key.includes('PASSWORD'))
  .reduce((env, key) => {
    env[key] = process.env[key];
    return env;
  }, {});

console.log('Safe env vars:', Object.keys(sanitizedEnv));
```

---

## Risorse Utili

### 📚 Documentazione

- [Node.js Process Module](https://nodejs.org/api/process.html)
- [Signal Events](https://nodejs.org/api/process.html#process_signal_events)

### 🛠️ Librerie

- [why-is-node-running](https://www.npmjs.com/package/why-is-node-running) - Debug process hang
- [death](https://www.npmjs.com/package/death) - Graceful shutdown helper
- [node-cleanup](https://www.npmjs.com/package/node-cleanup) - Cleanup on exit

---

**💡 Tip**: Process monitoring è essenziale per **production reliability** e **debugging performance issues**.
