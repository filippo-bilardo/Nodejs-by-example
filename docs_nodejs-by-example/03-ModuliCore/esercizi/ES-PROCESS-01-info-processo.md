# ES-PROCESS-01: Informazioni Processo

## 📋 Informazioni Generali

- **Modulo**: Process
- **Difficoltà**: 🟢 Facile
- **Tempo stimato**: 15 minuti
- **Prerequisiti**: 
  - Comprensione base di processi OS
  - Conoscenza di variabili d'ambiente

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Accedere a informazioni sul processo Node.js corrente
2. Usare `process.pid`, `process.cwd()`, `process.argv`
3. Leggere variabili d'ambiente con `process.env`
4. Mostrare informazioni di sistema utili per debugging

## 📝 Descrizione

Crea uno script che mostra informazioni dettagliate sul processo Node.js in esecuzione, inclusi PID, directory corrente, argomenti CLI e variabili d'ambiente selezionate.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-process-01`
- [ ] Crea file `process-info.js`

### 2. Informazioni Base
- [ ] Mostra PID (Process ID)
- [ ] Mostra directory corrente
- [ ] Mostra versione Node.js
- [ ] Mostra piattaforma e architettura

### 3. Argomenti CLI
- [ ] Mostra `process.argv`
- [ ] Parsea argomenti personalizzati

### 4. Variabili d'Ambiente
- [ ] Mostra PATH, HOME, USER
- [ ] Mostra variabili custom (NODE_ENV)

## 💡 Template di Partenza

```javascript
// process-info.js

console.log('=== Informazioni Processo Node.js ===\n');

// 1. Informazioni base
console.log('📋 Processo:');
// TODO: PID, platform, arch, versione Node

// 2. Directory
console.log('\n📁 Directory:');
// TODO: cwd, execPath

// 3. Argomenti
console.log('\n⚙️  Argomenti:');
// TODO: process.argv

// 4. Ambiente
console.log('\n🌍 Ambiente:');
// TODO: NODE_ENV, PATH, HOME, USER
```

## 📚 Concetti Chiave

### Process Properties
```javascript
process.pid          // Process ID
process.platform     // 'linux', 'darwin', 'win32'
process.arch         // 'x64', 'arm', etc.
process.version      // Versione Node.js
process.cwd()        // Current working directory
process.execPath     // Path dell'eseguibile Node
```

### Process.argv
```javascript
// node script.js arg1 arg2
process.argv[0]  // Path eseguibile Node
process.argv[1]  // Path dello script
process.argv[2]  // 'arg1'
process.argv[3]  // 'arg2'
```

### Process.env
```javascript
process.env.HOME          // Home directory utente
process.env.PATH          // PATH di sistema
process.env.NODE_ENV      // 'development', 'production'
process.env.USER          // Username
```

## 🔍 Soluzione Completa

```javascript
console.log('='.repeat(60));
console.log('📊 INFORMAZIONI PROCESSO NODE.JS');
console.log('='.repeat(60));

// 1. Informazioni Processo
console.log('\n📋 Processo:');
console.log(`   PID:           ${process.pid}`);
console.log(`   Parent PID:    ${process.ppid}`);
console.log(`   Node Version:  ${process.version}`);
console.log(`   V8 Version:    ${process.versions.v8}`);
console.log(`   Platform:      ${process.platform}`);
console.log(`   Architecture:  ${process.arch}`);

// 2. Directory e Path
console.log('\n📁 Percorsi:');
console.log(`   CWD:           ${process.cwd()}`);
console.log(`   Script:        ${process.argv[1]}`);
console.log(`   Executable:    ${process.execPath}`);

// 3. Uptime
console.log('\n⏱️  Runtime:');
console.log(`   Uptime:        ${process.uptime().toFixed(2)} secondi`);
console.log(`   Start Time:    ${new Date(Date.now() - process.uptime() * 1000).toLocaleString()}`);

// 4. Memory Usage
const mem = process.memoryUsage();
console.log('\n💾 Memoria:');
console.log(`   RSS:           ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Heap Total:    ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Heap Used:     ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`   External:      ${(mem.external / 1024 / 1024).toFixed(2)} MB`);

// 5. Argomenti Command Line
console.log('\n⚙️  Argomenti CLI:');
console.log(`   Count:         ${process.argv.length}`);
process.argv.forEach((arg, index) => {
  console.log(`   [${index}]${' '.repeat(12 - index.toString().length)} ${arg}`);
});

// 6. Custom arguments (oltre Node e script path)
if (process.argv.length > 2) {
  console.log('\n📌 Argomenti Personalizzati:');
  process.argv.slice(2).forEach((arg, index) => {
    console.log(`   ${index + 1}. ${arg}`);
  });
} else {
  console.log('\n💡 Suggerimento: Esegui con argomenti custom:');
  console.log(`   node ${process.argv[1]} arg1 arg2 arg3`);
}

// 7. Variabili d'Ambiente Importanti
console.log('\n🌍 Ambiente:');
console.log(`   NODE_ENV:      ${process.env.NODE_ENV || '(non impostato)'}`);
console.log(`   USER:          ${process.env.USER || process.env.USERNAME || '(sconosciuto)'}`);
console.log(`   HOME:          ${process.env.HOME || process.env.USERPROFILE || '(sconosciuto)'}`);
console.log(`   SHELL:         ${process.env.SHELL || '(non disponibile)'}`);
console.log(`   LANG:          ${process.env.LANG || '(non impostato)'}`);

// 8. PATH entries count
if (process.env.PATH) {
  const pathSeparator = process.platform === 'win32' ? ';' : ':';
  const pathEntries = process.env.PATH.split(pathSeparator);
  console.log(`   PATH entries:  ${pathEntries.length} directory`);
}

// 9. Features
console.log('\n✨ Features:');
console.log(`   Debugger:      ${typeof process.debugPort === 'number' ? 'Active on port ' + process.debugPort : 'Inactive'}`);
console.log(`   TTY:           ${process.stdout.isTTY ? 'Yes' : 'No'}`);

console.log('\n' + '='.repeat(60));

// 10. Exit info
console.log('\n💡 Info: Questo processo terminerà tra 2 secondi...');
setTimeout(() => {
  console.log('👋 Arrivederci!');
  process.exit(0);
}, 2000);
```

## 🎓 Suggerimenti

1. **process.cwd() vs __dirname**: cwd è dove esegui il comando, __dirname è dove sta il file
2. **ENV variables**: Usa sempre fallback per env vars che potrebbero non esistere
3. **Cross-platform**: USER vs USERNAME, HOME vs USERPROFILE (Win vs Unix)
4. **Memoria**: `rss` è la memoria totale, `heapUsed` è quella JS
5. **process.argv[1]**: È il path completo dello script corrente

## ✅ Criteri di Valutazione

- [ ] Mostra PID e informazioni base
- [ ] Mostra directory corrente e path
- [ ] Parsea e mostra process.argv
- [ ] Mostra variabili d'ambiente rilevanti
- [ ] Output è formattato e leggibile
- [ ] Gestisce differenze cross-platform

## 🚀 Sfide Extra (Opzionali)

1. **Argument parser**: Parsea flag tipo `--name=value`
2. **ENV validator**: Controlla che env vars richieste siano impostate
3. **Resource monitor**: Mostra uso CPU in tempo reale
4. **Config loader**: Carica config da file basato su NODE_ENV
5. **Process tree**: Mostra albero dei processi parent
6. **JSON output**: Opzione per output in formato JSON
7. **Colorized output**: Usa chalk o colors per output colorato

## 📖 Esempio Parsing Argomenti Avanzato

```javascript
// parser-args.js

/**
 * Parsea argomenti CLI in formato --key=value o --flag
 */
function parseArgs(argv) {
  const args = {};
  const positional = [];
  
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    
    if (arg.startsWith('--')) {
      // Flag o key=value
      const cleaned = arg.substring(2);
      
      if (cleaned.includes('=')) {
        const [key, value] = cleaned.split('=');
        args[key] = value;
      } else {
        args[cleaned] = true;
      }
    } else {
      // Argomento posizionale
      positional.push(arg);
    }
  }
  
  return { args, positional };
}

// Test
const { args, positional } = parseArgs(process.argv);

console.log('Parsed arguments:');
console.log('  Named:', args);
console.log('  Positional:', positional);

// Uso: node parser-args.js file1.txt file2.txt --verbose --output=result.json
```

## 🐛 Problemi Comuni

### process.cwd() vuoto o inaspettato
**Causa**: Directory corrente diversa da quella dello script  
**Soluzione**: Usa `__dirname` per path relativi allo script

### Variabili d'ambiente undefined
**Causa**: Variabile non impostata nel sistema  
**Soluzione**: Usa fallback: `process.env.VAR || 'default'`

### process.argv.length sempre 2
**Causa**: Nessun argomento passato  
**Soluzione**: Esegui con: `node script.js arg1 arg2`

## 📖 Risorse Utili

- [process documentation](https://nodejs.org/api/process.html)
- [Environment variables](https://nodejs.org/dist/latest-v18.x/docs/api/process.html#processenv)
- [Command line arguments](https://nodejs.dev/learn/nodejs-accept-arguments-from-the-command-line)
- [Cross-platform Node.js](https://shapeshed.com/writing-cross-platform-node/)
