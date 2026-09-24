# REPL di Node.js

## Indice
- [Introduzione](#introduzione)
- [Avviare il REPL](#avviare-il-repl)
- [Comandi di Base](#comandi-di-base)
- [Comandi Speciali](#comandi-speciali)
- [Variabili e Contesto](#variabili-e-contesto)
- [Multilinea](#multilinea)
- [Underscore (_)](#underscore-_)
- [Modalità Strict](#modalità-strict)
- [Caricare Moduli](#caricare-moduli)
- [Storia dei Comandi](#storia-dei-comandi)
- [File .node_repl_history](#file-node_repl_history)
- [Personalizzare il REPL](#personalizzare-il-repl)
- [REPL Programmatico](#repl-programmatico)
- [Esempi Pratici](#esempi-pratici)
- [Best Practices](#best-practices)

---

## Introduzione

**REPL** sta per **Read-Eval-Print-Loop** (Leggi-Valuta-Stampa-Ripeti). È un ambiente interattivo che permette di eseguire codice JavaScript/Node.js riga per riga, ricevendo immediatamente il risultato.

Il REPL è estremamente utile per:
- 🧪 Testare rapidamente snippet di codice
- 📚 Apprendere nuove funzionalità
- 🐛 Debug e sperimentazione
- 🔍 Esplorare API e moduli
- 💡 Prototipazione rapida

### Come funziona il ciclo REPL

1. **Read**: Legge l'input dell'utente
2. **Eval**: Valuta/esegue il codice JavaScript
3. **Print**: Stampa il risultato
4. **Loop**: Torna al punto 1

---

## Avviare il REPL

Per avviare il REPL di Node.js, apri il terminale e digita:

```bash
node
```

Vedrai qualcosa del genere:

```
Welcome to Node.js v24.6.0.
Type ".help" for more information.
>
```

Il prompt `>` indica che il REPL è pronto a ricevere comandi.

### Uscire dal REPL

Ci sono diversi modi per uscire:

```javascript
// Metodo 1: Comando .exit
.exit

// Metodo 2: Ctrl + C (due volte)
^C^C

// Metodo 3: Ctrl + D
^D

// Metodo 4: process.exit()
> process.exit()
```

---

## Comandi di Base

### Espressioni Semplici

```javascript
> 2 + 2
4

> 10 * 5
50

> Math.sqrt(16)
4

> "Hello" + " " + "World"
'Hello World'
```

### Variabili

```javascript
> let name = "Mario"
undefined

> name
'Mario'

> const age = 25
undefined

> age
25

> var city = "Roma"
undefined

> city
'Roma'
```

### Funzioni

```javascript
> function greet(name) {
... return `Ciao, ${name}!`;
... }
undefined

> greet("Anna")
'Ciao, Anna!'

> const add = (a, b) => a + b
undefined

> add(5, 3)
8
```

---

## Comandi Speciali

Il REPL fornisce comandi speciali che iniziano con un punto (`.`):

### .help
Mostra l'elenco dei comandi disponibili:

```javascript
> .help
.break    Sometimes you get stuck, this gets you out
.clear    Alias for .break
.editor   Enter editor mode
.exit     Exit the REPL
.help     Print this help message
.load     Load JS from a file into the REPL session
.save     Save all evaluated commands in this REPL session to a file
```

### .break o .clear
Esce da un'espressione multilinea:

```javascript
> function test() {
... console.log("test")
...    // Ops, ho sbagliato!
... .break
>
```

### .editor
Entra in modalità editor per scrivere codice multilinea:

```javascript
> .editor
// Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));

// Premi Ctrl+D per eseguire
55
undefined
```

### .save
Salva la sessione corrente in un file:

```javascript
> .save ./my-session.js
Session saved to: ./my-session.js
```

### .load
Carica ed esegue un file JavaScript:

```javascript
> .load ./my-session.js
// Il contenuto del file viene eseguito
```

---

## Variabili e Contesto

### Scope Globale

Le variabili dichiarate nel REPL sono globali e persistono durante tutta la sessione:

```javascript
> let counter = 0
undefined

> counter++
0

> counter++
1

> counter
2
```

### Context Object

Puoi accedere all'oggetto contesto:

```javascript
> global
Object [global] {
  global: [Circular],
  clearInterval: [Function: clearInterval],
  clearTimeout: [Function: clearTimeout],
  setInterval: [Function: setInterval],
  setTimeout: [Function: setTimeout],
  ...
}
```

---

## Multilinea

Il REPL riconosce automaticamente quando un'espressione è incompleta e passa alla modalità multilinea:

```javascript
> function sum(a, b) {
... return a + b;
... }
undefined

> const obj = {
... name: "Mario",
... age: 30,
... city: "Milano"
... }
undefined

> obj
{ name: 'Mario', age: 30, city: 'Milano' }
```

Il prompt cambia da `>` a `...` per indicare la continuazione.

---

## Underscore (_)

La variabile speciale `_` contiene il risultato dell'ultima espressione valutata:

```javascript
> 3 + 4
7

> _
7

> _ * 2
14

> _
14

> const result = _
undefined

> result
14
```

**Attenzione**: Se assegni un valore a `_`, perderà il suo comportamento speciale:

```javascript
> 10 + 5
15

> _ = 100
100

> 20 + 30
50

> _
100  // Non è più 50!
```

---

## Modalità Strict

Per utilizzare la modalità strict:

```javascript
> 'use strict';
undefined

> x = 10  // Errore: variabile non dichiarata
Uncaught ReferenceError: x is not defined
```

Oppure avvia Node.js con:

```bash
node --use_strict
```

---

## Caricare Moduli

### Moduli Built-in

```javascript
> const fs = require('fs')
undefined

> const path = require('path')
undefined

> path.join('/home', 'user', 'documents')
'/home/user/documents'
```

### Moduli Esterni (npm)

Prima installa il modulo:

```bash
npm install lodash
```

Poi nel REPL:

```javascript
> const _ = require('lodash')
undefined

> _.chunk(['a', 'b', 'c', 'd'], 2)
[ [ 'a', 'b' ], [ 'c', 'd' ] ]
```

### Moduli ES6 (con flag)

```bash
node --input-type=module
```

```javascript
> import { readFile } from 'fs/promises'
undefined

> await readFile('./package.json', 'utf-8')
'{\n  "name": "my-project",\n  ...'
```

---

## Storia dei Comandi

### Navigare nella Storia

- **Freccia Su (↑)**: Comando precedente
- **Freccia Giù (↓)**: Comando successivo
- **Ctrl + R**: Ricerca inversa nella storia

### Esempio

```javascript
> console.log("Hello")
Hello
undefined

> 2 + 2
4

// Premi freccia su due volte per tornare a console.log("Hello")
```

---

## File .node_repl_history

La storia dei comandi viene salvata in:

```
~/.node_repl_history
```

Su Linux/Mac:
```bash
cat ~/.node_repl_history
```

Su Windows:
```bash
type %USERPROFILE%\.node_repl_history
```

### Configurare la Storia

```javascript
// Disabilitare la storia
NODE_REPL_HISTORY="" node

// Cambiare il file di storia
NODE_REPL_HISTORY="/path/to/custom/history" node

// Limitare le righe salvate (default: 1000)
NODE_REPL_HISTORY_SIZE=500 node
```

---

## Personalizzare il REPL

### File .replrc (Node.js legacy)

Crea un file `.replrc` nella home directory (deprecato in favore di .node_repl_history):

```javascript
// ~/.replrc
console.log('REPL personalizzato caricato!');
```

### File .noderc

Puoi creare un file di inizializzazione:

```javascript
// ~/.noderc o ./.noderc
global.myHelper = function(x) {
  return x * 2;
};

console.log('Helper caricati!');
```

Avvia con:
```bash
node -r ./.noderc
```

---

## REPL Programmatico

Puoi creare il tuo REPL personalizzato:

### Esempio Base

```javascript
// my-repl.js
const repl = require('repl');

// Avvia un REPL con prompt personalizzato
repl.start({
  prompt: 'mio-repl> ',
  ignoreUndefined: true
});
```

Esegui:
```bash
node my-repl.js
```

### Esempio Avanzato

```javascript
// custom-repl.js
const repl = require('repl');

// Crea il REPL
const myRepl = repl.start({
  prompt: '🚀 > ',
  ignoreUndefined: true,
  useColors: true
});

// Aggiungi comandi personalizzati al contesto
myRepl.context.sayHello = function(name) {
  return `Ciao ${name}!`;
};

myRepl.context.version = process.version;

// Aggiungi un comando personalizzato
myRepl.defineCommand('saluta', {
  help: 'Saluta qualcuno',
  action(name) {
    console.log(`Ciao, ${name}!`);
    this.displayPrompt();
  }
});

// Event listener
myRepl.on('exit', () => {
  console.log('Arrivederci!');
  process.exit();
});
```

Utilizzo:
```javascript
🚀 > sayHello('Mario')
'Ciao Mario!'

🚀 > version
'v18.17.0'

🚀 > .saluta Anna
Ciao, Anna!
```

### Opzioni del REPL

```javascript
repl.start({
  prompt: '> ',              // Prompt personalizzato
  input: process.stdin,      // Stream di input
  output: process.stdout,    // Stream di output
  terminal: true,            // Se il terminal supporta ANSI
  eval: customEval,          // Funzione di valutazione custom
  useColors: true,           // Abilita colori
  useGlobal: false,          // Usa contesto globale
  ignoreUndefined: true,     // Non mostrare 'undefined'
  writer: customWriter,      // Funzione custom per formattare output
  completer: customCompleter,// Funzione per autocompletamento
  replMode: repl.REPL_MODE_STRICT // Modalità strict
});
```

---

## Esempi Pratici

### 1. Calcolatrice Rapida

```javascript
> const calc = {
... add: (a, b) => a + b,
... sub: (a, b) => a - b,
... mul: (a, b) => a * b,
... div: (a, b) => a / b
... }
undefined

> calc.add(10, 5)
15

> calc.mul(3, 7)
21
```

### 2. Test API

```javascript
> const https = require('https')
undefined

> https.get('https://api.github.com/users/nodejs', (res) => {
... let data = '';
... res.on('data', chunk => data += chunk);
... res.on('end', () => console.log(JSON.parse(data).name));
... })
Node.js
```

### 3. Manipolazione Date

```javascript
> const now = new Date()
undefined

> now.toISOString()
'2025-10-12T10:30:00.000Z'

> now.getFullYear()
2025

> now.setMonth(11)
1765432200000

> now.toLocaleDateString('it-IT')
'12/12/2025'
```

### 4. Array Methods

```javascript
> const numbers = [1, 2, 3, 4, 5]
undefined

> numbers.map(n => n * 2)
[ 2, 4, 6, 8, 10 ]

> numbers.filter(n => n % 2 === 0)
[ 2, 4 ]

> numbers.reduce((acc, n) => acc + n, 0)
15
```

### 5. Esplorare Oggetti

```javascript
> const person = { name: 'Mario', age: 30, city: 'Roma' }
undefined

> Object.keys(person)
[ 'name', 'age', 'city' ]

> Object.values(person)
[ 'Mario', 30, 'Roma' ]

> Object.entries(person)
[
  [ 'name', 'Mario' ],
  [ 'age', 30 ],
  [ 'city', 'Roma' ]
]
```

### 6. Promise e Async/Await

```javascript
> const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
undefined

> await delay(2000).then(() => console.log('Done!'))
// Dopo 2 secondi:
Done!
undefined
```

### 7. File System

```javascript
> const fs = require('fs').promises
undefined

> await fs.readdir('.')
[
  'node_modules',
  'package.json',
  'index.js',
  ...
]

> const content = await fs.readFile('package.json', 'utf-8')
undefined

> JSON.parse(content).name
'my-project'
```

---

## Best Practices

### 1. Usa il REPL per Apprendere

✅ Sperimenta con nuove API:
```javascript
> Array.from({ length: 5 }, (_, i) => i + 1)
[ 1, 2, 3, 4, 5 ]
```

### 2. Testa Regex

✅ Verifica pattern regex:
```javascript
> /^\d{3}-\d{3}-\d{4}$/.test('123-456-7890')
true

> 'hello world'.match(/\w+/g)
[ 'hello', 'world' ]
```

### 3. Debug Rapido

✅ Ispeziona oggetti complessi:
```javascript
> console.dir(process.env, { depth: 0 })
```

### 4. Salva le Sessioni Importanti

✅ Usa `.save` per salvare esperimenti riusciti:
```javascript
> .save ./my-experiments.js
```

### 5. Usa .editor per Codice Complesso

✅ Per funzioni complesse, usa `.editor`:
```javascript
> .editor
// Scrivi il codice qui
```

### 6. Esplora Moduli

✅ Scopri cosa offre un modulo:
```javascript
> const path = require('path')
> console.dir(path)
```

### 7. Non Usare per Produzione

❌ Il REPL è per sviluppo e testing, non per eseguire script di produzione.

### 8. Combina con Documentazione

✅ Usa il REPL insieme alla documentazione ufficiale per verificare il comportamento.

---

## Shortcuts Utili

| Shortcut | Descrizione |
|----------|-------------|
| `Tab` | Autocompletamento |
| `Tab Tab` | Mostra tutte le opzioni disponibili |
| `Ctrl + C` | Interrompi comando/esci (x2) |
| `Ctrl + D` | Esci dal REPL |
| `Ctrl + L` | Pulisci schermo |
| `Ctrl + U` | Cancella riga corrente |
| `↑` / `↓` | Naviga storia comandi |
| `Ctrl + R` | Ricerca nella storia |
| `.break` | Esci da espressione multilinea |

---

## Conclusione

Il REPL di Node.js è uno strumento potente per:
- 🎓 Apprendimento rapido
- 🔬 Sperimentazione sicura
- 🐛 Debug veloce
- 📚 Esplorazione API

Usalo quotidianamente per migliorare le tue competenze Node.js!

---

## Risorse Aggiuntive

- [Node.js REPL Documentation](https://nodejs.org/api/repl.html)
- [Node.js Command Line Options](https://nodejs.org/api/cli.html)
- [MDN JavaScript Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

**Autore**: Corso Node.js by Example  
**Data**: Ottobre 2025  
**Versione**: 1.0

- [Indice](../README.md)
- [Lezione precedente](03-javascript-runtime.md)
- [Prossima Esercitazione](./02-Architettura_Event-Driven/README.md)