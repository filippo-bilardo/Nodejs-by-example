# ES-SYSTEM-01: Informazioni di Sistema

## 📋 Informazioni Generali

- **Modulo**: OS (Operating System)
- **Difficoltà**: 🟢 Facile  
- **Tempo stimato**: 20-30 minuti
- **Prerequisiti**: 
  - Conoscenza base di Node.js
  - Familiarità con concetti di sistema operativo
  - Comprensione di unità di misura (byte, KB, MB, GB)

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Usare il modulo `os` per ottenere informazioni sul sistema
2. Accedere a dati su CPU, memoria, rete e piattaforma
3. Formattare e presentare dati di sistema in modo leggibile
4. Comprendere le differenze tra sistemi operativi
5. Creare utility di diagnostica del sistema

## 📚 Introduzione Teorica

### Il Modulo `os`

Il modulo **`os`** (Operating System) è un modulo core di Node.js che fornisce metodi e proprietà per interagire con il sistema operativo sottostante. È particolarmente utile per:

- **Diagnostica**: Ottenere informazioni sull'hardware e software
- **Cross-platform**: Scrivere codice che funziona su diversi OS
- **Monitoring**: Monitorare risorse di sistema
- **Configurazione**: Adattare il comportamento dell'app al sistema

### Informazioni Disponibili

#### 1. **Piattaforma e Architettura**

```javascript
const os = require('os');

os.platform();  // 'linux', 'darwin', 'win32', 'freebsd', etc.
os.arch();      // 'x64', 'arm', 'arm64', 'ia32', etc.
os.type();      // 'Linux', 'Darwin', 'Windows_NT'
os.release();   // '5.10.0-18-amd64' (versione kernel/OS)
```

**Utilità:**
- Rilevare il sistema operativo per eseguire codice specifico
- Verificare compatibilità software
- Configurare percorsi e comandi specifici per OS

**Esempio pratico:**
```javascript
if (os.platform() === 'win32') {
  // Usa comandi Windows
  exec('dir');
} else {
  // Usa comandi Unix
  exec('ls');
}
```

#### 2. **CPU e Processori**

```javascript
os.cpus();  // Array di oggetti con info su ogni core
// [
//   {
//     model: 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz',
//     speed: 2600,  // MHz
//     times: {
//       user: 252020,     // ms in modalità utente
//       nice: 0,          // ms in modalità nice (Unix)
//       sys: 30340,       // ms in modalità sistema
//       idle: 1070356870, // ms idle
//       irq: 0            // ms gestione interrupt
//     }
//   },
//   // ... un oggetto per ogni core
// ]
```

**Informazioni utili:**
- Numero di core disponibili
- Modello e velocità CPU
- Utilizzo CPU per core
- Ottimizzare worker threads e clustering

#### 3. **Memoria**

```javascript
os.totalmem();  // Memoria totale in byte (es: 17179869184 = 16 GB)
os.freemem();   // Memoria libera in byte

// Calcolare memoria usata
const usedMem = os.totalmem() - os.freemem();
const usagePercent = (usedMem / os.totalmem()) * 100;
```

**Best practice:**
- Monitorare prima di operazioni memory-intensive
- Alertare se memoria bassa
- Ottimizzare buffer size in base a memoria disponibile

#### 4. **Network Interfaces**

```javascript
os.networkInterfaces();
// {
//   lo: [
//     {
//       address: '127.0.0.1',
//       netmask: '255.0.0.0',
//       family: 'IPv4',
//       mac: '00:00:00:00:00:00',
//       internal: true
//     }
//   ],
//   eth0: [
//     {
//       address: '192.168.1.100',
//       netmask: '255.255.255.0',
//       family: 'IPv4',
//       mac: '01:02:03:0a:0b:0c'
//     }
//   ]
// }
```

**Utilità:**
- Ottenere indirizzo IP locale
- Trovare MAC address
- Verificare connettività di rete

#### 5. **Informazioni Varie**

```javascript
os.hostname();   // Nome host del computer
os.homedir();    // Home directory utente (/home/user o C:\Users\user)
os.tmpdir();     // Directory temporanea
os.uptime();     // Secondi da ultimo boot del sistema
process.uptime(); // Secondi da avvio processo Node.js
```

### Formattazione Dati

**Conversione byte in unità leggibili:**

```javascript
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  
  return `${bytes.toFixed(2)} ${units[i]}`;
}

formatBytes(17179869184);  // "16.00 GB"
```

**Formattazione uptime:**

```javascript
function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 3600));
  seconds %= (24 * 3600);
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  
  return `${days}d ${hours}h ${minutes}m`;
}

formatUptime(432000);  // "5d 0h 0m"
```

## 📝 Descrizione

Crea un programma che raccoglie e visualizza informazioni complete sul sistema in modo formattato e leggibile. Il programma deve mostrare dati su piattaforma, CPU, memoria, rete e altre informazioni utili del sistema operativo.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-system-01`
- [ ] Crea file `info-sistema.js`

### 2. Implementazione Base
- [ ] Importa modulo `os`
- [ ] Raccogli informazioni su piattaforma e architettura
- [ ] Raccogli informazioni su CPU
- [ ] Raccogli informazioni su memoria
- [ ] Visualizza dati formattati

### 3. Funzionalità Extra
- [ ] Formatta byte in unità leggibili (KB, MB, GB)
- [ ] Formatta uptime in giorni/ore/minuti
- [ ] Visualizza informazioni di rete
- [ ] Calcola percentuali (uso CPU, uso memoria)

### 4. Verifica
- [ ] Output ben formattato e leggibile
- [ ] Tutti i valori visualizzati correttamente
- [ ] Unità di misura appropriate
- [ ] Funziona su diversi sistemi operativi

## 💡 Template di Partenza

```javascript
// info-sistema.js
const os = require('os');

/**
 * Formatta byte in unità leggibili
 * @param {number} bytes - Byte da formattare
 * @returns {string} Stringa formattata (es: "16.00 GB")
 */
function formatBytes(bytes) {
  // TODO: Implementa formattazione
}

/**
 * Formatta secondi in giorni/ore/minuti
 * @param {number} seconds - Secondi da formattare
 * @returns {string} Stringa formattata (es: "5d 3h 45m")
 */
function formatUptime(seconds) {
  // TODO: Implementa formattazione
}

/**
 * Visualizza informazioni di sistema
 */
function displaySystemInfo() {
  console.log('='.repeat(60));
  console.log('INFORMAZIONI DI SISTEMA');
  console.log('='.repeat(60));
  
  // TODO: Sistema Operativo
  console.log('\n📟 SISTEMA OPERATIVO:');
  // Piattaforma, Tipo, Release, Architettura, Hostname
  
  // TODO: CPU
  console.log('\n⚙️  CPU:');
  // Numero core, Modello, Velocità
  
  // TODO: Memoria
  console.log('\n💾 MEMORIA:');
  // Totale, Libera, Usata, Percentuale uso
  
  // TODO: Uptime
  console.log('\n⏱️  UPTIME:');
  // Uptime sistema e processo Node.js
  
  // TODO: Directory
  console.log('\n📁 DIRECTORY:');
  // Home directory, Temp directory
  
  console.log('\n' + '='.repeat(60));
}

// Esegui
displaySystemInfo();
```

## 🔑 Concetti Chiave

### 1. Modulo os

Il modulo `os` fornisce API per interagire con il sistema operativo:

```javascript
const os = require('os');

// Informazioni base
const platform = os.platform();     // Sistema operativo
const arch = os.arch();             // Architettura CPU
const hostname = os.hostname();     // Nome host

// CPU
const cpus = os.cpus();             // Array di CPU info
const numCPUs = cpus.length;        // Numero di core

// Memoria (in byte)
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;

// Tempo
const systemUptime = os.uptime();   // Secondi da boot
const nodeUptime = process.uptime(); // Secondi processo Node

// Directory
const homeDir = os.homedir();
const tmpDir = os.tmpdir();
```

### 2. Formattazione Valori

**Conversione byte:**
```javascript
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

console.log(formatBytes(1024));           // "1.00 KB"
console.log(formatBytes(1048576));        // "1.00 MB"
console.log(formatBytes(17179869184));    // "16.00 GB"
```

**Formattazione tempo:**
```javascript
function formatUptime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

console.log(formatUptime(90));        // "1m 30s"
console.log(formatUptime(3665));      // "1h 1m 5s"
console.log(formatUptime(432000));    // "5d 0h 0m"
```

### 3. Calcolo Percentuali

```javascript
// Percentuale memoria usata
const totalMem = os.totalmem();
const freeMem = os.freemem();
const usedMem = totalMem - freeMem;
const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);

console.log(`Memoria usata: ${memUsagePercent}%`);

// Percentuale per ogni core CPU
const cpus = os.cpus();
cpus.forEach((cpu, index) => {
  const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
  const idle = cpu.times.idle;
  const usage = ((total - idle) / total * 100).toFixed(2);
  
  console.log(`Core ${index}: ${usage}% utilizzato`);
});
```

## ✅ Soluzione Completa

```javascript
// info-sistema.js
const os = require('os');

/**
 * Formatta byte in unità leggibili (B, KB, MB, GB, TB)
 */
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Formatta secondi in formato leggibile (Xd Xh Xm Xs)
 */
function formatUptime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

/**
 * Crea barra di progresso testuale
 */
function createProgressBar(percentage, width = 30) {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${percentage.toFixed(1)}%`;
}

/**
 * Visualizza informazioni complete di sistema
 */
function displaySystemInfo() {
  console.log('\n' + '='.repeat(70));
  console.log('                    🖥️  INFORMAZIONI DI SISTEMA                     ');
  console.log('='.repeat(70));
  
  // ========== SISTEMA OPERATIVO ==========
  console.log('\n📟 SISTEMA OPERATIVO');
  console.log('─'.repeat(70));
  console.log(`  Piattaforma:      ${os.type()} (${os.platform()})`);
  console.log(`  Release:          ${os.release()}`);
  console.log(`  Architettura:     ${os.arch()}`);
  console.log(`  Hostname:         ${os.hostname()}`);
  console.log(`  Home Directory:   ${os.homedir()}`);
  console.log(`  Temp Directory:   ${os.tmpdir()}`);
  
  // ========== CPU ==========
  const cpus = os.cpus();
  console.log('\n⚙️  CPU');
  console.log('─'.repeat(70));
  console.log(`  Modello:          ${cpus[0].model}`);
  console.log(`  Numero Core:      ${cpus.length}`);
  console.log(`  Velocità:         ${cpus[0].speed} MHz`);
  
  // Calcola utilizzo medio CPU
  let totalUsage = 0;
  cpus.forEach(cpu => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    const usage = ((total - idle) / total * 100);
    totalUsage += usage;
  });
  const avgUsage = totalUsage / cpus.length;
  console.log(`  Utilizzo Medio:   ${createProgressBar(avgUsage)}`);
  
  // Dettaglio per core
  console.log('\n  Dettaglio Core:');
  cpus.forEach((cpu, index) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    const usage = ((total - idle) / total * 100);
    console.log(`    Core ${index}: ${usage.toFixed(1).padStart(5)}% utilizzato`);
  });
  
  // ========== MEMORIA ==========
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = (usedMem / totalMem) * 100;
  
  console.log('\n💾 MEMORIA');
  console.log('─'.repeat(70));
  console.log(`  Totale:           ${formatBytes(totalMem)}`);
  console.log(`  Libera:           ${formatBytes(freeMem)}`);
  console.log(`  Usata:            ${formatBytes(usedMem)}`);
  console.log(`  Utilizzo:         ${createProgressBar(memUsagePercent)}`);
  
  // ========== UPTIME ==========
  const systemUptime = os.uptime();
  const processUptime = process.uptime();
  
  console.log('\n⏱️  UPTIME');
  console.log('─'.repeat(70));
  console.log(`  Sistema:          ${formatUptime(systemUptime)}`);
  console.log(`  Processo Node:    ${formatUptime(processUptime)}`);
  
  // ========== RETE ==========
  console.log('\n🌐 INTERFACCE DI RETE');
  console.log('─'.repeat(70));
  
  const interfaces = os.networkInterfaces();
  for (const [name, addresses] of Object.entries(interfaces)) {
    console.log(`\n  ${name}:`);
    addresses.forEach(addr => {
      if (addr.family === 'IPv4') {
        const type = addr.internal ? 'Loopback' : 'Esterno';
        console.log(`    IPv4:  ${addr.address.padEnd(15)} (${type})`);
        console.log(`    MAC:   ${addr.mac}`);
      }
    });
  }
  
  // ========== CHIUSURA ==========
  console.log('\n' + '='.repeat(70));
  console.log(`  Report generato: ${new Date().toLocaleString('it-IT')}`);
  console.log('='.repeat(70) + '\n');
}

// Esegui e mostra informazioni
displaySystemInfo();
```

**Output esempio:**
```
======================================================================
                    🖥️  INFORMAZIONI DI SISTEMA                     
======================================================================

📟 SISTEMA OPERATIVO
──────────────────────────────────────────────────────────────────────
  Piattaforma:      Linux (linux)
  Release:          5.10.0-18-amd64
  Architettura:     x64
  Hostname:         dev-server
  Home Directory:   /home/user
  Temp Directory:   /tmp

⚙️  CPU
──────────────────────────────────────────────────────────────────────
  Modello:          Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz
  Numero Core:      8
  Velocità:         2600 MHz
  Utilizzo Medio:   [███████████░░░░░░░░░░░░░░░░░░░] 36.2%

  Dettaglio Core:
    Core 0:  42.3% utilizzato
    Core 1:  35.8% utilizzato
    Core 2:  38.1% utilizzato
    Core 3:  31.5% utilizzato
    Core 4:  40.2% utilizzato
    Core 5:  29.8% utilizzato
    Core 6:  37.6% utilizzato
    Core 7:  34.4% utilizzato

💾 MEMORIA
──────────────────────────────────────────────────────────────────────
  Totale:           16.00 GB
  Libera:           8.23 GB
  Usata:            7.77 GB
  Utilizzo:         [██████████████░░░░░░░░░░░░░░░░] 48.5%

⏱️  UPTIME
──────────────────────────────────────────────────────────────────────
  Sistema:          5d 3h 45m 23s
  Processo Node:    12s

🌐 INTERFACCE DI RETE
──────────────────────────────────────────────────────────────────────

  lo:
    IPv4:  127.0.0.1       (Loopback)
    MAC:   00:00:00:00:00:00

  eth0:
    IPv4:  192.168.1.100   (Esterno)
    MAC:   01:02:03:0a:0b:0c

======================================================================
  Report generato: 08/02/2026, 14:30:15
======================================================================
```

## 💡 Suggerimenti

1. **Formattazione chiara**: Usa simboli Unicode e colori per rendere l'output più leggibile
2. **Gestione errori**: Alcuni metodi potrebbero lanciare eccezioni su sistemi particolari
3. **Cross-platform**: Testa il codice su diversi OS (Windows, Linux, macOS)
4. **Precisione decimali**: Usa `.toFixed()` per limitare decimali nelle percentuali
5. **Barre di progresso**: Le barre visuali aiutano a interpretare velocemente i dati
6. **Timestamp**: Aggiungi data/ora del report per riferimento futuro

## 🎯 Criteri di Valutazione

- [ ] Tutte le informazioni richieste sono visualizzate
- [ ] Byte formattati correttamente in unità leggibili
- [ ] Uptime formattato in giorni/ore/minuti
- [ ] Percentuali calcolate correttamente
- [ ] Output ben organizzato e leggibile
- [ ] Codice è pulito e commentato
- [ ] Funziona su diversi sistemi operativi

## 🚀 Sfide Extra (Opzionali)

1. **Monitoraggio continuo**: Aggiorna le informazioni ogni N secondi con `setInterval`
2. **Export JSON**: Opzione per esportare dati in formato JSON
3. **Comparazione**: Salva snapshot e confronta utilizzo risorse nel tempo
4. **Alerting**: Notifica se CPU o memoria superano soglia
5. **Grafico ASCII**: Crea grafici testuali per trend di utilizzo
6. **Colori**: Usa modulo `chalk` per output colorato (verde=ok, rosso=critico)
7. **CLI arguments**: Accetta parametri per mostrare solo certe informazioni
8. **Load average**: Su Linux, mostra load average da `/proc/loadavg`

## 📖 Esempio Avanzato: Monitor con Refresh

```javascript
const os = require('os');

function clearScreen() {
  // ANSI escape code per pulire schermo
  console.log('\x1Bc');
}

function getColorForPercentage(percent) {
  if (percent < 50) return '\x1b[32m';  // Verde
  if (percent < 80) return '\x1b[33m';  // Giallo
  return '\x1b[31m';  // Rosso
}

function displayLiveMonitor() {
  clearScreen();
  
  console.log('🔄 MONITOR SISTEMA REAL-TIME (Ctrl+C per uscire)\n');
  
  // CPU
  const cpus = os.cpus();
  let totalUsage = 0;
  cpus.forEach(cpu => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    const idle = cpu.times.idle;
    const usage = ((total - idle) / total * 100);
    totalUsage += usage;
  });
  const avgCpuUsage = totalUsage / cpus.length;
  const cpuColor = getColorForPercentage(avgCpuUsage);
  
  console.log(`CPU:     ${cpuColor}${avgCpuUsage.toFixed(1)}%\x1b[0m`);
  
  // Memoria
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsage = ((1 - freeMem / totalMem) * 100);
  const memColor = getColorForPercentage(memUsage);
  
  console.log(`Memoria: ${memColor}${memUsage.toFixed(1)}%\x1b[0m`);
  console.log(`         ${formatBytes(totalMem - freeMem)} / ${formatBytes(totalMem)}`);
  
  // Uptime
  console.log(`\nUptime:  ${formatUptime(os.uptime())}`);
  
  console.log('\nAggiornamento tra 2 secondi...');
}

// Helper functions (formatBytes, formatUptime)
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

function formatUptime(totalSeconds) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  return parts.join(' ') || '0m';
}

// Avvia monitor
displayLiveMonitor();
setInterval(displayLiveMonitor, 2000);

// Gestisci Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Monitor chiuso');
  process.exit(0);
});
```

## 🐛 Problemi Comuni

### os.cpus() restituisce array vuoto
**Causa**: Sistema non supportato o permessi insufficienti  
**Soluzione**: Verifica permessi, testa su sistema diverso

### Valori di memoria negativi
**Causa**: Overflow con numeri molto grandi  
**Soluzione**: Usa BigInt per valori oltre Number.MAX_SAFE_INTEGER

### Uptime sistema vs processo diversi
**Causa**: Normale, sono due contatori diversi  
**Soluzione**: `os.uptime()` è boot sistema, `process.uptime()` è avvio Node

### networkInterfaces() non mostra tutte le interfacce
**Causa**: Interfacce down non sono listate  
**Soluzione**: Usa comandi OS specifici per interfacce inattive

## 📖 Risorse Utili

- [Node.js os documentation](https://nodejs.org/api/os.html)
- [Node.js process documentation](https://nodejs.org/api/process.html)
- [System monitoring best practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Cross-platform Node.js development](https://nodejs.org/en/docs/meta/topics/dependencies/)
