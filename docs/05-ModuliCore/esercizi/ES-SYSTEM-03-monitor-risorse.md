# ES-SYSTEM-03: Monitor Risorse Sistema

## 📋 Informazioni Generali

- **Modulo**: OS + Process
- **Difficoltà**: 🟡 Medio  
- **Tempo stimato**: 45-60 minuti
- **Prerequisiti**: 
  - ES-SYSTEM-01 completato
  - Conoscenza di setInterval/setTimeout
  - Comprensione di array e medie
  - Familiarità con ANSI escape codes (opzionale)

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Creare un sistema di monitoraggio real-time delle risorse
2. Calcolare variazioni (delta) tra misurazioni successive
3. Implementare grafici ASCII per visualizzare trend
4. Gestire storico dati e calcolare medie mobili
5. Implementare sistema di alert basato su soglie
6. Esportare dati di monitoraggio in formati standard

## 📚 Introduzione Teorica

### Monitoraggio Real-Time vs Snapshot

**Snapshot (ES-SYSTEM-01):**
- Foto istantanea dello stato attuale
- Utile per diagnostica puntuale
- Non mostra andamenti nel tempo

**Monitoring Real-Time:**
- Aggiornamento continuo dei dati
- Rileva trend e pattern
- Permette reazione proattiva a problemi
- Essenziale per produzione

### Metriche Chiave da Monitorare

#### 1. **CPU Utilization**

```javascript
// Calcolo utilizzo CPU tra due misurazioni
let previousCpuInfo = os.cpus();

// Dopo un intervallo...
const currentCpuInfo = os.cpus();

currentCpuInfo.forEach((cpu, index) => {
  const prev = previousCpuInfo[index];
  
  // Totale tempo trascorso tra misurazioni
  const prevTotal = Object.values(prev.times).reduce((a, b) => a + b);
  const currTotal = Object.values(cpu.times).reduce((a, b) => a + b);
  const deltaTotal = currTotal - prevTotal;
  
  // Tempo idle tra misurazioni
  const deltaIdle = cpu.times.idle - prev.times.idle;
  
  // Utilizzo = (tempo_totale - tempo_idle) / tempo_totale
  const usage = ((deltaTotal - deltaIdle) / deltaTotal) * 100;
  
  console.log(`Core ${index}: ${usage.toFixed(1)}%`);
});

previousCpuInfo = currentCpuInfo;
```

**Perché calcolare delta:**
- `os.cpus()` restituisce valori cumulativi dall'avvio
- Delta mostra utilizzo nell'intervallo specifico
- Più accurato per monitoring real-time

#### 2. **Memory Usage**

```javascript
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const usagePercent = (usedMem / totalMem) * 100;

// Memory usage del processo Node.js specifico
const processMemory = process.memoryUsage();
// {
//   rss: 23662592,        // Resident Set Size (RAM fisica)
//   heapTotal: 6537216,   // V8 heap allocato
//   heapUsed: 4808816,    // V8 heap effettivamente usato
//   external: 856781,     // C++ objects vincolati a JS
//   arrayBuffers: 10515   // Buffer/TypedArray memory
// }
```

**Metriche memoria:**
- **Sistema**: Totale/libera/usata (da `os`)
- **Processo**: RSS, heap, external (da `process`)
- **Trend**: Leak detection via monitoraggio crescita heap

#### 3. **Load Average** (Unix/Linux only)

```javascript
// Disponibile solo su sistemi Unix-like
const loadAvg = os.loadavg();
// [1.53, 1.42, 1.38]  // avg 1min, 5min, 15min

// Normalizzazione per numero CPU
const cpuCount = os.cpus().length;
const normalizedLoad = loadAvg.map(avg => (avg / cpuCount) * 100);

// Interpretazione:
// < 70%  = OK
// 70-90% = Carico elevato
// > 90%  = Sistema sotto stress
```

**Load average vs CPU usage:**
- **Load avg**: Numero medio processi in attesa o in esecuzione
- **CPU usage**: Percentuale tempo CPU occupato
- Load può essere alto anche con CPU basso (I/O wait)

### Grafici ASCII per Visualizzazione Trend

#### Sparkline (Mini Grafico)

```javascript
function sparkline(data, height = 8) {
  const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return data.map(value => {
    const normalized = (value - min) / range;
    const index = Math.floor(normalized * (blocks.length - 1));
    return blocks[index];
  }).join('');
}

// Esempio
const cpuHistory = [45, 50, 48, 52, 65, 70, 68, 55, 50, 45];
console.log('CPU: ' + sparkline(cpuHistory));
// Output: CPU: ▃▄▃▅▆▇▇▅▄▃
```

#### Barra di Progresso con Colori

```javascript
function coloredBar(percent, width = 30) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  
  // Colore basato su soglia
  let color;
  if (percent < 50) color = '\x1b[32m';      // Verde
  else if (percent < 80) color = '\x1b[33m'; // Giallo
  else color = '\x1b[31m';                   // Rosso
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${color}[${bar}] ${percent.toFixed(1)}%\x1b[0m`;
}
```

### Sistema di Alert

```javascript
class AlertManager {
  constructor() {
    this.thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      load: { warning: 70, critical: 90 }
    };
    this.alerts = [];
  }
  
  check(metric, value) {
    const threshold = this.thresholds[metric];
    if (!threshold) return null;
    
    if (value >= threshold.critical) {
      return { level: 'CRITICAL', metric, value };
    } else if (value >= threshold.warning) {
      return { level: 'WARNING', metric, value };
    }
    return null;
  }
  
  notify(alert) {
    const timestamp = new Date().toISOString();
    this.alerts.push({ ...alert, timestamp });
    
    const icon = alert.level === 'CRITICAL' ? '🚨' : '⚠️';
    console.log(`\n${icon} ${alert.level}: ${alert.metric} at ${alert.value.toFixed(1)}%`);
  }
}
```

### Media Mobile (Moving Average)

```javascript
class MovingAverage {
  constructor(windowSize = 10) {
    this.windowSize = windowSize;
    this.values = [];
  }
  
  add(value) {
    this.values.push(value);
    if (this.values.length > this.windowSize) {
      this.values.shift();
    }
  }
  
  get() {
    if (this.values.length === 0) return 0;
    const sum = this.values.reduce((a, b) => a + b, 0);
    return sum / this.values.length;
  }
  
  getAll() {
    return [...this.values];
  }
}
```

## 📝 Descrizione

Crea un monitor di sistema real-time che raccoglie e visualizza continuamente metriche su CPU, memoria e carico del sistema. Il monitor deve mostrare grafici ASCII, calcolare medie mobili, e generare alert quando le risorse superano soglie configurabili.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-system-03`
- [ ] Crea file `monitor-risorse.js`
- [ ] (Opzionale) Crea file `config.json` per configurazione

### 2. Implementazione Base
- [ ] Classe `ResourceMonitor` per gestire monitoraggio
- [ ] Metodo per raccogliere metriche CPU, memoria, load
- [ ] Calcolo delta CPU tra misurazioni successive
- [ ] Visualizzazione formattata con `console.log`
- [ ] Loop con `setInterval` per aggiornamenti continui

### 3. Visualizzazione Avanzata
- [ ] Pulisci schermo ad ogni aggiornamento (ANSI escape)
- [ ] Barre di progresso colorate per percentuali
- [ ] Sparkline per mostrare trend ultimi N valori
- [ ] Timestamp aggiornamenti

### 4. Sistema di Alert
- [ ] Soglie configurabili (warning/critical)
- [ ] Notifiche quando soglie superate
- [ ] Storico alert con timestamp

### 5. Statistiche
- [ ] Media mobile per CPU e memoria
- [ ] Valori min/max registrati
- [ ] Tempo di monitoraggio totale

### 6. Export Dati
- [ ] Salva snapshot periodici su file JSON
- [ ] Comando per esportare report completo
- [ ] (Opzionale) Export formato CSV

## 💡 Template di Partenza

```javascript
// monitor-risorse.js
const os = require('os');
const fs = require('fs');

/**
 * Classe per monitoraggio risorse sistema
 */
class ResourceMonitor {
  constructor(options = {}) {
    this.interval = options.interval || 2000; // ms
    this.historySize = options.historySize || 60; // samples
    this.thresholds = options.thresholds || {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 }
    };
    
    this.cpuHistory = [];
    this.memHistory = [];
    this.previousCpuInfo = null;
    this.alerts = [];
    this.startTime = Date.now();
  }
  
  /**
   * Raccoglie metriche correnti
   */
  collectMetrics() {
    const metrics = {
      timestamp: Date.now(),
      cpu: this.getCpuUsage(),
      memory: this.getMemoryUsage(),
      process: this.getProcessMemory()
    };
    
    // TODO: Aggiungi load average su Linux/Mac
    
    return metrics;
  }
  
  /**
   * Calcola utilizzo CPU (delta tra misurazioni)
   */
  getCpuUsage() {
    const currentCpuInfo = os.cpus();
    
    if (!this.previousCpuInfo) {
      this.previousCpuInfo = currentCpuInfo;
      return 0;
    }
    
    // TODO: Calcola delta e utilizzo per ogni core
    // TODO: Restituisci media cores
    
    this.previousCpuInfo = currentCpuInfo;
    return 0; // placeholder
  }
  
  /**
   * Calcola utilizzo memoria sistema
   */
  getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    
    return {
      total,
      free,
      used,
      percent: (used / total) * 100
    };
  }
  
  /**
   * Memoria del processo Node.js
   */
  getProcessMemory() {
    const mem = process.memoryUsage();
    return {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal
    };
  }
  
  /**
   * Aggiorna storico metriche
   */
  updateHistory(metrics) {
    this.cpuHistory.push(metrics.cpu);
    this.memHistory.push(metrics.memory.percent);
    
    // Mantieni solo ultimi N samples
    if (this.cpuHistory.length > this.historySize) {
      this.cpuHistory.shift();
      this.memHistory.shift();
    }
  }
  
  /**
   * Controlla soglie e genera alert
   */
  checkAlerts(metrics) {
    // TODO: Implementa controllo soglie
    // TODO: Genera alert se necessario
  }
  
  /**
   * Visualizza dashboard
   */
  display(metrics) {
    // TODO: Pulisci schermo
    // TODO: Visualizza metriche formattate
    // TODO: Mostra grafici sparkline
    // TODO: Mostra alert se presenti
  }
  
  /**
   * Avvia monitoraggio
   */
  start() {
    console.log('🔍 Avvio monitor risorse...\n');
    
    this.intervalId = setInterval(() => {
      const metrics = this.collectMetrics();
      this.updateHistory(metrics);
      this.checkAlerts(metrics);
      this.display(metrics);
    }, this.interval);
    
    // Gestione Ctrl+C
    process.on('SIGINT', () => this.stop());
  }
  
  /**
   * Ferma monitoraggio
   */
  stop() {
    clearInterval(this.intervalId);
    console.log('\n\n📊 Monitor fermato');
    this.displaySummary();
    process.exit(0);
  }
  
  /**
   * Mostra riepilogo finale
   */
  displaySummary() {
    const runtime = ((Date.now() - this.startTime) / 1000).toFixed(0);
    console.log(`Tempo monitoraggio: ${runtime}s`);
    console.log(`Alert generati: ${this.alerts.length}`);
    // TODO: Mostra statistiche min/max/avg
  }
}

// ========== FUNZIONI HELPER ==========

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(2)} ${units[i]}`;
}

function sparkline(data, height = 8) {
  const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return data.map(value => {
    const normalized = (value - min) / range;
    const index = Math.floor(normalized * (blocks.length - 1));
    return blocks[index];
  }).join('');
}

function clearScreen() {
  console.log('\x1Bc'); // ANSI escape: clear screen
}

// ========== AVVIO ==========

const monitor = new ResourceMonitor({
  interval: 2000,      // Aggiorna ogni 2s
  historySize: 60,     // Mantieni ultimi 60 campioni (2 minuti)
  thresholds: {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 80, critical: 95 }
  }
});

monitor.start();
```

## 🔑 Concetti Chiave

### 1. Calcolo Delta CPU

```javascript
getCpuUsage() {
  const currentCpuInfo = os.cpus();
  
  if (!this.previousCpuInfo) {
    this.previousCpuInfo = currentCpuInfo;
    return 0;
  }
  
  let totalUsage = 0;
  
  currentCpuInfo.forEach((cpu, index) => {
    const prev = this.previousCpuInfo[index];
    
    // Somma tutti i tempi CPU
    const prevTotal = Object.values(prev.times).reduce((a, b) => a + b, 0);
    const currTotal = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const deltaTotal = currTotal - prevTotal;
    
    // Tempo idle nel periodo
    const deltaIdle = cpu.times.idle - prev.times.idle;
    
    // Utilizzo = tempo non-idle / tempo totale
    const usage = deltaTotal > 0 
      ? ((deltaTotal - deltaIdle) / deltaTotal) * 100 
      : 0;
    
    totalUsage += usage;
  });
  
  this.previousCpuInfo = currentCpuInfo;
  
  // Media di tutti i core
  return totalUsage / currentCpuInfo.length;
}
```

### 2. Pulizia Schermo Multipiattaforma

```javascript
function clearScreen() {
  // ANSI escape sequence - funziona su Linux/Mac/Windows 10+
  console.log('\x1Bc');
  
  // Alternativa per Windows vecchi
  // process.stdout.write('\x1B[2J\x1B[0f');
}
```

### 3. Barra di Progresso Colorata

```javascript
function coloredBar(percent, width = 30) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  
  // Scelta colore in base a soglia
  let color;
  if (percent < 50) {
    color = '\x1b[32m'; // Verde
  } else if (percent < 80) {
    color = '\x1b[33m'; // Giallo
  } else {
    color = '\x1b[31m'; // Rosso
  }
  
  const resetColor = '\x1b[0m';
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  return `${color}[${bar}] ${percent.toFixed(1)}%${resetColor}`;
}
```

## ✅ Soluzione Completa

```javascript
// monitor-risorse.js
const os = require('os');
const fs = require('fs');

class ResourceMonitor {
  constructor(options = {}) {
    this.interval = options.interval || 2000;
    this.historySize = options.historySize || 60;
    this.thresholds = options.thresholds || {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 }
    };
    
    this.cpuHistory = [];
    this.memHistory = [];
    this.loadHistory = [];
    this.previousCpuInfo = null;
    this.alerts = [];
    this.startTime = Date.now();
    this.samples = 0;
    
    // Statistiche
    this.stats = {
      cpu: { min: Infinity, max: -Infinity, sum: 0 },
      memory: { min: Infinity, max: -Infinity, sum: 0 }
    };
  }
  
  collectMetrics() {
    const metrics = {
      timestamp: Date.now(),
      cpu: this.getCpuUsage(),
      memory: this.getMemoryUsage(),
      process: this.getProcessMemory(),
      load: this.getLoadAverage()
    };
    
    this.samples++;
    this.updateStats(metrics);
    
    return metrics;
  }
  
  getCpuUsage() {
    const currentCpuInfo = os.cpus();
    
    if (!this.previousCpuInfo) {
      this.previousCpuInfo = currentCpuInfo;
      return 0;
    }
    
    let totalUsage = 0;
    
    currentCpuInfo.forEach((cpu, index) => {
      const prev = this.previousCpuInfo[index];
      
      const prevTotal = Object.values(prev.times).reduce((a, b) => a + b, 0);
      const currTotal = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const deltaTotal = currTotal - prevTotal;
      
      const deltaIdle = cpu.times.idle - prev.times.idle;
      
      const usage = deltaTotal > 0 
        ? ((deltaTotal - deltaIdle) / deltaTotal) * 100 
        : 0;
      
      totalUsage += usage;
    });
    
    this.previousCpuInfo = currentCpuInfo;
    return totalUsage / currentCpuInfo.length;
  }
  
  getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    
    return {
      total,
      free,
      used,
      percent: (used / total) * 100
    };
  }
  
  getProcessMemory() {
    const mem = process.memoryUsage();
    return {
      rss: mem.rss,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external
    };
  }
  
  getLoadAverage() {
    // Disponibile solo su Unix-like
    if (os.platform() === 'win32') return null;
    
    const loads = os.loadavg();
    const cpuCount = os.cpus().length;
    
    return {
      raw: loads,
      normalized: loads.map(l => (l / cpuCount) * 100)
    };
  }
  
  updateHistory(metrics) {
    this.cpuHistory.push(metrics.cpu);
    this.memHistory.push(metrics.memory.percent);
    
    if (metrics.load) {
      this.loadHistory.push(metrics.load.normalized[0]);
    }
    
    // Mantieni dimensione massima
    if (this.cpuHistory.length > this.historySize) {
      this.cpuHistory.shift();
      this.memHistory.shift();
      if (this.loadHistory.length > 0) this.loadHistory.shift();
    }
  }
  
  updateStats(metrics) {
    const cpu = metrics.cpu;
    const mem = metrics.memory.percent;
    
    this.stats.cpu.min = Math.min(this.stats.cpu.min, cpu);
    this.stats.cpu.max = Math.max(this.stats.cpu.max, cpu);
    this.stats.cpu.sum += cpu;
    
    this.stats.memory.min = Math.min(this.stats.memory.min, mem);
    this.stats.memory.max = Math.max(this.stats.memory.max, mem);
    this.stats.memory.sum += mem;
  }
  
  checkAlerts(metrics) {
    const checks = [
      { name: 'cpu', value: metrics.cpu },
      { name: 'memory', value: metrics.memory.percent }
    ];
    
    checks.forEach(({ name, value }) => {
      const threshold = this.thresholds[name];
      if (!threshold) return;
      
      let level = null;
      if (value >= threshold.critical) {
        level = 'CRITICAL';
      } else if (value >= threshold.warning) {
        level = 'WARNING';
      }
      
      if (level) {
        const alert = {
          level,
          metric: name,
          value,
          timestamp: new Date().toISOString()
        };
        
        // Evita alert duplicati consecutivi
        const lastAlert = this.alerts[this.alerts.length - 1];
        if (!lastAlert || lastAlert.metric !== name || lastAlert.level !== level) {
          this.alerts.push(alert);
        }
      }
    });
  }
  
  display(metrics) {
    clearScreen();
    
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const uptimeStr = formatUptime(uptime);
    
    console.log('╔' + '═'.repeat(68) + '╗');
    console.log('║' + ' '.repeat(18) + '🖥️  MONITOR RISORSE SISTEMA' + ' '.repeat(22) + '║');
    console.log('╠' + '═'.repeat(68) + '╣');
    console.log(`║  Uptime: ${uptimeStr.padEnd(20)} Samples: ${this.samples.toString().padStart(6)}           ║`);
    console.log('╠' + '═'.repeat(68) + '╣');
    
    // CPU
    console.log('║                                                                    ║');
    console.log('║  ⚙️  CPU UTILIZATION                                              ║');
    console.log('║  ' + '─'.repeat(64) + '  ║');
    console.log(`║    Corrente:  ${coloredBar(metrics.cpu, 40).padEnd(58)}  ║`);
    
    if (this.cpuHistory.length > 1) {
      const avgCpu = this.stats.cpu.sum / this.samples;
      console.log(`║    Media:     ${avgCpu.toFixed(1).padStart(5)}%  (Min: ${this.stats.cpu.min.toFixed(1)}%  Max: ${this.stats.cpu.max.toFixed(1)}%)           ║`);
      console.log(`║    Trend:     ${sparkline(this.cpuHistory)}                    ║`);
    }
    
    // Memoria
    console.log('║                                                                    ║');
    console.log('║  💾 MEMORIA                                                        ║');
    console.log('║  ' + '─'.repeat(64) + '  ║');
    console.log(`║    Sistema:   ${coloredBar(metrics.memory.percent, 40).padEnd(58)}  ║`);
    console.log(`║    Usata:     ${formatBytes(metrics.memory.used).padStart(10)}  /  ${formatBytes(metrics.memory.total).padStart(10)}          ║`);
    
    if (this.memHistory.length > 1) {
      const avgMem = this.stats.memory.sum / this.samples;
      console.log(`║    Media:     ${avgMem.toFixed(1).padStart(5)}%  (Min: ${this.stats.memory.min.toFixed(1)}%  Max: ${this.stats.memory.max.toFixed(1)}%)           ║`);
      console.log(`║    Trend:     ${sparkline(this.memHistory)}                    ║`);
    }
    
    // Processo Node.js
    console.log('║                                                                    ║');
    console.log('║  📦 PROCESSO NODE.JS                                               ║');
    console.log('║  ' + '─'.repeat(64) + '  ║');
    console.log(`║    RSS:       ${formatBytes(metrics.process.rss).padStart(10)}                                    ║`);
    console.log(`║    Heap:      ${formatBytes(metrics.process.heapUsed).padStart(10)} / ${formatBytes(metrics.process.heapTotal).padStart(10)}                 ║`);
    
    // Load Average (solo Unix)
    if (metrics.load) {
      console.log('║                                                                    ║');
      console.log('║  📊 LOAD AVERAGE (1m / 5m / 15m)                                  ║');
      console.log('║  ' + '─'.repeat(64) + '  ║');
      console.log(`║    Raw:       ${metrics.load.raw[0].toFixed(2)}  /  ${metrics.load.raw[1].toFixed(2)}  /  ${metrics.load.raw[2].toFixed(2)}                               ║`);
      console.log(`║    % cores:   ${metrics.load.normalized[0].toFixed(1)}%  /  ${metrics.load.normalized[1].toFixed(1)}%  /  ${metrics.load.normalized[2].toFixed(1)}%                          ║`);
    }
    
    // Alert recenti
    if (this.alerts.length > 0) {
      const recentAlerts = this.alerts.slice(-3);
      console.log('║                                                                    ║');
      console.log('║  🚨 ALERT RECENTI                                                  ║');
      console.log('║  ' + '─'.repeat(64) + '  ║');
      recentAlerts.forEach(alert => {
        const icon = alert.level === 'CRITICAL' ? '🔴' : '⚠️';
        const msg = `${icon} ${alert.level}: ${alert.metric} ${alert.value.toFixed(1)}%`;
        console.log(`║    ${msg.padEnd(64)}  ║`);
      });
    }
    
    console.log('╚' + '═'.repeat(68) + '╝');
    console.log('\n  Premi Ctrl+C per terminare\n');
  }
  
  start() {
    console.log('🔍 Avvio monitor risorse sistema...\n');
    console.log('   Intervallo aggiornamento: ' + (this.interval / 1000) + 's');
    console.log('   Dimensione storico: ' + this.historySize + ' campioni');
    console.log('\n   Premere Ctrl+C per terminare...\n');
    
    setTimeout(() => {
      this.intervalId = setInterval(() => {
        const metrics = this.collectMetrics();
        this.updateHistory(metrics);
        this.checkAlerts(metrics);
        this.display(metrics);
      }, this.interval);
    }, 1000);
    
    process.on('SIGINT', () => this.stop());
  }
  
  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    
    clearScreen();
    console.log('\n╔' + '═'.repeat(68) + '╗');
    console.log('║' + ' '.repeat(22) + '📊 RIEPILOGO SESSIONE' + ' '.repeat(25) + '║');
    console.log('╚' + '═'.repeat(68) + '╝\n');
    
    const runtime = ((Date.now() - this.startTime) / 1000).toFixed(0);
    const avgCpu = (this.stats.cpu.sum / this.samples).toFixed(1);
    const avgMem = (this.stats.memory.sum / this.samples).toFixed(1);
    
    console.log(`  Durata monitoraggio:     ${formatUptime(runtime)}`);
    console.log(`  Campioni raccolti:       ${this.samples}`);
    console.log(`  Alert generati:          ${this.alerts.length}`);
    console.log('');
    console.log(`  CPU - Media: ${avgCpu}%  Min: ${this.stats.cpu.min.toFixed(1)}%  Max: ${this.stats.cpu.max.toFixed(1)}%`);
    console.log(`  MEM - Media: ${avgMem}%  Min: ${this.stats.memory.min.toFixed(1)}%  Max: ${this.stats.memory.max.toFixed(1)}%`);
    
    // Salva report
    this.saveReport();
    
    console.log('\n  👋 Monitor terminato\n');
    process.exit(0);
  }
  
  saveReport() {
    const report = {
      session: {
        start: new Date(this.startTime).toISOString(),
        end: new Date().toISOString(),
        duration: Date.now() - this.startTime,
        samples: this.samples
      },
      statistics: {
        cpu: {
          avg: this.stats.cpu.sum / this.samples,
          min: this.stats.cpu.min,
          max: this.stats.cpu.max
        },
        memory: {
          avg: this.stats.memory.sum / this.samples,
          min: this.stats.memory.min,
          max: this.stats.memory.max
        }
      },
      alerts: this.alerts,
      history: {
        cpu: this.cpuHistory,
        memory: this.memHistory
      }
    };
    
    const filename = `monitor-report-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    console.log(`\n  💾 Report salvato: ${filename}`);
  }
}

// ========== FUNZIONI HELPER ==========

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(2)} ${units[i]}`;
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  
  return parts.join(' ');
}

function sparkline(data) {
  if (data.length === 0) return '';
  
  const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  return data.map(value => {
    const normalized = (value - min) / range;
    const index = Math.floor(normalized * (blocks.length - 1));
    return blocks[index];
  }).join('');
}

function coloredBar(percent, width = 30) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  
  let color;
  if (percent < 50) {
    color = '\x1b[32m';
  } else if (percent < 80) {
    color = '\x1b[33m';
  } else {
    color = '\x1b[31m';
  }
  
  const reset = '\x1b[0m';
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  return `${color}[${bar}] ${percent.toFixed(1)}%${reset}`;
}

function clearScreen() {
  console.log('\x1Bc');
}

// ========== AVVIO ==========

const monitor = new ResourceMonitor({
  interval: 2000,
  historySize: 60,
  thresholds: {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 80, critical: 95 }
  }
});

monitor.start();
```

## 💡 Suggerimenti

1. **Prima misurazione CPU**: Ignora o restituisci 0, serve baseline per calcolare delta
2. **Intervallo aggiornamento**: 1-2 secondi è buon compromesso (più veloce = overhead)
3. **Dimensione storico**: 60 samples con 2s interval = 2 minuti di storia
4. **ANSI escape codes**: Testali su vari terminali (potrebbero non funzionare ovunque)
5. **Load average**: Non disponibile su Windows, gestisci caso con `null`
6. **Memoria processo**: RSS include tutto, heap è solo V8 engine
7. **Export dati**: Salva periodicamente per non perdere dati su crash

## 🎯 Criteri di Valutazione

- [ ] Monitor aggiorna visualizzazione automaticamente
- [ ] Delta CPU calcolato correttamente tra misurazioni
- [ ] Grafici sparkline mostrano trend
- [ ] Alert funzionano con soglie configurabili
- [ ] Statistiche (min/max/avg) corrette
- [ ] Report finale salvato su file
- [ ] Gestione pulita di Ctrl+C
- [ ] Codice ben organizzato con classe

## 🚀 Sfide Extra (Opzionali)

1. **Export CSV**: Aggiungi opzione per esportare dati in formato CSV
2. **Web dashboard**: Crea server HTTP che serve dati via JSON API
3. **Grafici storici**: Salva dati su database (SQLite) per analisi long-term
4. **Process list**: Mostra processi che consumano più risorse
5. **Disk I/O**: Monitora lettura/scrittura disco (richiede moduli esterni)
6. **Network traffic**: Monitora byte inviati/ricevuti (richiede parsing `/proc/net/dev`)
7. **Configurazione file**: Leggi soglie e opzioni da `config.json`
8. **Email alert**: Invia email quando alert critical
9. **Logging**: Scrivi alert su file di log rotanti
10. **Multi-server**: Monitora più server remoti via SSH

## 📖 Esempio Avanzato: Export CSV

```javascript
// Aggiungi alla classe ResourceMonitor

exportCSV(filename) {
  const header = 'timestamp,cpu,memory,rss,heapUsed\n';
  
  let rows = '';
  const minLen = Math.min(
    this.cpuHistory.length,
    this.memHistory.length
  );
  
  for (let i = 0; i < minLen; i++) {
    const timestamp = new Date(this.startTime + i * this.interval).toISOString();
    const cpu = this.cpuHistory[i].toFixed(2);
    const mem = this.memHistory[i].toFixed(2);
    
    rows += `${timestamp},${cpu},${mem}\n`;
  }
  
  fs.writeFileSync(filename, header + rows);
  console.log(`📊 CSV esportato: ${filename}`);
}

// Usa in stop()
exportCSV(`monitor-${Date.now()}.csv`);
```

## 🐛 Problemi Comuni

### CPU sempre a 0% o valori strani
**Causa**: Prima misurazione o intervallo troppo breve  
**Soluzione**: Ignora primo sample, usa intervallo >= 1000ms

### Memoria sempre al 100%
**Causa**: Confusione tra memoria sistema e processo  
**Soluzione**: `os.freemem()` è sistema, `process.memoryUsage()` è processo

### Sparkline non visibile
**Causa**: Font terminal non supporta caratteri Unicode  
**Soluzione**: Usa caratteri ASCII (`-`, `=`, `#`) alternativi

### Monitor rallenta sistema
**Causa**: Intervallo troppo breve o troppe operazioni  
**Soluzione**: Aumenta intervallo, ottimizza codice display

### Load average sempre undefined
**Causa**: Su Windows non esiste  
**Soluzione**: Verifica `os.platform()` prima di usare `os.loadavg()`

## 📖 Risorse Utili

- [Node.js os module](https://nodejs.org/api/os.html)
- [process.memoryUsage()](https://nodejs.org/api/process.html#processmemoryusage)
- [ANSI Escape Codes](https://en.wikipedia.org/wiki/ANSI_escape_code)
- [Load Average explained](https://www.brendangregg.com/blog/2017-08-08/linux-load-averages.html)
- [Node.js Performance Monitoring](https://nodejs.org/en/docs/guides/simple-profiling/)
