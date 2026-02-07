# Modulo Readline di Node.js - Guida Completa

## Indice
1. [Introduzione](#introduzione)
2. [Concetti Base](#concetti-base)
3. [Creazione Interfacce](#creazione-interfacce)
4. [Metodi Principali](#metodi-principali)
5. [Eventi](#eventi)
6. [Pattern Comuni](#pattern-comuni)
7. [Esempi Pratici](#esempi-pratici)

---

## Introduzione

### Cos'è il Modulo Readline?

Il modulo `readline` fornisce un'interfaccia per leggere dati da uno stream Readable (come `process.stdin`) una riga alla volta. È uno strumento fondamentale per creare applicazioni CLI (Command Line Interface) interattive in Node.js.

**Caratteristiche principali:**
- Lettura input utente riga per riga
- Gestione prompt interattivi
- Supporto autocompletamento
- Gestione cronologia comandi
- Editing in-line con tasti freccia
- Compatibilità con stream personalizzati

### Quando Usare Readline

Usa il modulo `readline` quando devi:
- ✅ Creare interfacce CLI interattive
- ✅ Implementare un REPL (Read-Eval-Print Loop)
- ✅ Leggere file di testo riga per riga
- ✅ Chiedere input all'utente in modo sequenziale
- ✅ Creare wizard o configuratori da terminale
- ✅ Processare grandi file senza caricarli in memoria

**Non usare readline per:**
- ❌ Applicazioni web (usa framework web)
- ❌ GUI desktop (usa Electron o altri framework)
- ❌ Lettura file binari
- ❌ Comunicazione di rete diretta

---

## Concetti Base

### Architettura del Modulo Readline

Il modulo `readline` si basa su tre componenti principali:

1. **Interface**: L'oggetto principale che gestisce la comunicazione tra input e output
2. **Stream**: I flussi di dati (input stream per leggere, output stream per scrivere)
3. **Eventi**: Il sistema di notifica asincrono per gestire l'interazione utente

**Flusso di Funzionamento:**
```
Input Stream (stdin) → Readline Interface → Output Stream (stdout)
        ↓                      ↓                      ↓
    Tastiera            Elaborazione             Schermo
```

### Import del Modulo

Node.js offre diverse modalità per importare `readline`, a seconda della versione e dello stile di programmazione:

```javascript
// CommonJS (Node.js tradizionale)
// Metodo più compatibile, funziona su tutte le versioni
const readline = require('readline');

// ES Modules
// Richiede "type": "module" in package.json o estensione .mjs
import readline from 'readline';

// Con Promises (Node.js 17+)
// Versione nativa che supporta async/await senza wrapper
const readlinePromises = require('readline/promises');
import * as readlinePromises from 'readline/promises';
```

**Differenze tra le versioni:**
- `readline` classico usa callback
- `readline/promises` supporta nativamente async/await
- Le API sono identiche, cambia solo il tipo di ritorno (callback vs Promise)

### Primo Esempio - Input Base

```javascript
const readline = require('readline');

// Crea interfaccia readline
const rl = readline.createInterface({
  input: process.stdin,   // Da dove leggere (tastiera)
  output: process.stdout  // Dove scrivere (schermo)
});

// Chiedi il nome all'utente
rl.question('Come ti chiami? ', (nome) => {
  console.log(`Ciao, ${nome}!`);
  rl.close();  // Chiudi l'interfaccia
});
```

**Esecuzione:**
```bash
$ node primo-esempio.js
Come ti chiami? Mario
Ciao, Mario!
```

### Come Funziona

Il ciclo di vita di un'interfaccia readline segue questi passaggi:

1. **createInterface()** - Inizializza l'interfaccia collegando input e output stream
2. **question()** - Mostra un prompt e attende input dall'utente
3. **Evento 'line'** - Si scatena quando l'utente preme INVIO
4. Il **callback** viene eseguito con il testo inserito come argomento
5. **close()** - Termina l'interfaccia e libera le risorse di sistema

**Nota Importante**: Dimenticare di chiamare `close()` può causare che il programma rimanga in esecuzione indefinitamente, poiché mantiene attivi gli stream di input.

---

## Creazione Interfacce

### Guida di riferimento ufficiale online
[Documentazione Ufficiale Readline](https://nodejs.org/api/readline.html)

### Concetti Fondamentali

Un'interfaccia readline è un ponte tra:
- **Input Stream**: Da dove arrivano i dati (tastiera, file, socket)
- **Output Stream**: Dove vengono inviati i prompt e feedback visivi
- **Terminal Mode**: Se abilitato, supporta features avanzate come editing in-line e cronologia

### Opzioni di Configurazione

Tutte le opzioni disponibili per personalizzare il comportamento dell'interfaccia:

```javascript
const readline = require('readline');
const fs = require('fs');

// Configurazione completa con tutte le opzioni
const rl = readline.createInterface({
  input: process.stdin,              // Stream di input (da dove leggere)
  output: process.stdout,            // Stream di output (dove scrivere)
  completer: completionFunction,     // Funzione per autocompletamento (TAB)
  terminal: true,                    // Abilita funzionalità avanzate (editing, frecce)
  historySize: 30,                   // Numero comandi da ricordare (default: 30)
  prompt: '> ',                      // Stringa mostrata prima dell'input
  crlfDelay: 100,                    // Millisecondi per riconoscere \r\n come singolo newline
  removeHistoryDuplicates: true,     // Evita comandi duplicati nella cronologia
  escapeCodeTimeout: 500             // Timeout per sequenze escape ANSI (ms)
});
```

**Spiegazione Opzioni:**

- **input/output**: Gli stream fondamentali. `process.stdin` legge dalla tastiera, `process.stdout` scrive sullo schermo
- **completer**: Funzione chiamata quando l'utente preme TAB, permette di suggerire completamenti
- **terminal**: Se `true`, abilita editing avanzato (frecce, backspace, Ctrl+C). Se `false`, readline tratta l'input come semplice stream
- **historySize**: Dimensione del buffer dei comandi precedenti (accessibili con frecce su/giù)
- **crlfDelay**: Tempo di attesa per distinguere `\r` seguito da `\n` (Windows) da due caratteri separati
- **removeHistoryDuplicates**: Se `true`, comandi identici consecutivi non vengono ripetuti nella cronologia
- **escapeCodeTimeout**: Tempo massimo per riconoscere sequenze escape multi-carattere (come frecce, F1-F12)

### Interfaccia Standard (STDIN/STDOUT)

La configurazione più comune per applicazioni CLI interattive:

```javascript
const readline = require('readline');

// Configurazione minimale - sufficiente per la maggior parte dei casi
const rl = readline.createInterface({
  input: process.stdin,   // Legge dalla tastiera
  output: process.stdout  // Scrive sullo schermo
});

// Con prompt personalizzato - utile per CLI branded
const rl2 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'myapp> '  // Prefisso mostrato prima di ogni input
});

rl2.prompt();  // Mostra il prompt iniziale
```

**Quando usare questa configurazione:**
- Applicazioni CLI che richiedono input utente
- Script interattivi
- Tool di configurazione
- Mini-REPL personalizzati

### Interfaccia per Leggere File

Modalità ottimizzata per processare file di testo riga per riga:

```javascript
const readline = require('readline');
const fs = require('fs');

// Leggi file riga per riga - memoria efficiente
const fileStream = fs.createReadStream('dati.txt');

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity  // Riconosce sia \n (Unix) che \r\n (Windows) come newline
});

// Processa ogni linea appena viene letta
rl.on('line', (line) => {
  console.log(`Linea: ${line}`);
  // Qui puoi elaborare la linea (parsing, filtraggio, ecc.)
});

// Evento quando il file è stato completamente letto
rl.on('close', () => {
  console.log('File completamente letto');
});
```

**Vantaggi di questo approccio:**
- **Memoria efficiente**: Non carica l'intero file in memoria
- **Streaming**: Inizia a processare immediatamente
- **File grandi**: Funziona anche con file di GB senza problemi
- **Compatibilità**: Gestisce automaticamente diversi formati newline

**Differenza con fs.readFileSync():**
```javascript
// ❌ MALE per file grandi - carica tutto in memoria
const content = fs.readFileSync('file.txt', 'utf8');
const lines = content.split('\n');

// ✅ BENE - processa riga per riga
const rl = readline.createInterface({
  input: fs.createReadStream('file.txt'),
  crlfDelay: Infinity
});
```

### Interfaccia con Stream Personalizzati

Per scenari avanzati dove input/output non sono stdin/stdout:

```javascript
const readline = require('readline');
const { Readable, Writable } = require('stream');

// Stream di input personalizzato - genera dati programmaticamente
const inputStream = new Readable({
  read() {
    this.push('Prima linea\n');
    this.push('Seconda linea\n');
    this.push(null);  // null indica fine dello stream
  }
});

// Stream di output personalizzato - intercetta output
const outputStream = new Writable({
  write(chunk, encoding, callback) {
    // Personalizza come gestire l'output
    console.log('Output intercettato:', chunk.toString());
    callback();  // Importante: chiama callback per continuare
  }
});

const rl = readline.createInterface({
  input: inputStream,
  output: outputStream
});

rl.on('line', (line) => {
  console.log('Ricevuto:', line);
});
```

**Casi d'uso per stream personalizzati:**
- **Testing**: Simulare input utente automaticamente
- **Logging**: Intercettare e registrare tutte le interazioni
- **Network**: Readline su socket TCP per protocolli testuali
- **IPC**: Comunicazione tra processi
- **Piping**: Concatenare programmi Unix-style

**Esempio pratico - Testing automatico:**
```javascript
// Simula risposte utente per test
const testInput = new Readable({
  read() {
    this.push('Mario\n');
    this.push('mario@email.com\n');
    this.push('password123\n');
    this.push(null);
  }
});

const rl = readline.createInterface({
  input: testInput,
  output: process.stdout
});

// Il tuo codice verrà testato con risposte predefinite
```

---

## Metodi Principali

### question() - Chiedere Input

Il metodo `question()` è il modo più semplice per ottenere input dall'utente. Mostra un prompt e attende che l'utente prema INVIO.

```javascript
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Singola domanda - pattern più semplice
rl.question('Qual è il tuo nome? ', (nome) => {
  // Callback eseguito quando l'utente preme INVIO
  console.log(`Ciao ${nome}!`);
  rl.close();  // Importante: chiudi sempre l'interfaccia
});

// Domande multiple (callback nidificati)
// ⚠️ Attenzione: crea "callback hell" - difficile da leggere
rl.question('Nome: ', (nome) => {
  rl.question('Cognome: ', (cognome) => {
    rl.question('Età: ', (eta) => {
      console.log(`${nome} ${cognome}, ${eta} anni`);
      rl.close();
    });
  });
});

// ✅ Soluzione migliore: usa Promises (vedi sezione Pattern Comuni)
```

**Parametri:**
- `query` (string): Il testo del prompt mostrato all'utente
- `callback` (function): Funzione chiamata con la risposta dell'utente

**Comportamento:**
- Il prompt viene scritto su `output` (di solito stdout)
- L'interfaccia attende input su `input` (di solito stdin)
- Quando l'utente preme INVIO, il callback riceve la linea (senza il newline)
- **Non richiama automaticamente `prompt()`** - a differenza di `on('line')`

### prompt() - Mostrare Prompt

Mostra il prompt configurato e attende input. Usato per creare loop interattivi (REPL).

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'comando> '  // Prompt di default
});

// Mostra il prompt iniziale
rl.prompt();

// Gestisce ogni linea di input
rl.on('line', (input) => {
  console.log(`Hai scritto: ${input}`);
  rl.prompt();  // Mostra di nuovo il prompt per la prossima iterazione
});

// Gestisce chiusura (Ctrl+D su Unix, Ctrl+C su Windows)
rl.on('close', () => {
  console.log('Bye!');
  process.exit(0);
});
```

**Differenza tra `prompt()` e `question()`:**

| Aspetto | prompt() | question() |
|---------|----------|------------|
| Uso | Loop interattivi (REPL) | Domande singole |
| Evento | Usa `on('line')` | Usa callback |
| Prompt | Configurato in `createInterface` | Passato come parametro |
| Ripetizione | Manuale con `prompt()` | Non si ripete automaticamente |

**Esempio REPL (Read-Eval-Print Loop):**
```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

rl.prompt();  // Avvia il loop

rl.on('line', (cmd) => {
  // Fase 1: Read (già fatto)
  // Fase 2: Eval
  if (cmd === 'exit') {
    rl.close();
  } else {
    // Fase 3: Print
    console.log(`Eseguito: ${cmd}`);
  }
  // Fase 4: Loop
  rl.prompt();
});
```

### setPrompt() - Cambiare Prompt

Permette di modificare dinamicamente la stringa del prompt durante l'esecuzione:

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Cambia prompt dinamicamente
rl.setPrompt('user> ');
rl.prompt();

rl.on('line', (input) => {
  if (input === 'admin') {
    rl.setPrompt('admin> ');  // Cambia il prompt
    console.log('Modalità admin attivata');
  } else if (input === 'exit') {
    rl.close();
  } else {
    console.log(`Comando: ${input}`);
  }
  rl.prompt();  // Mostra il prompt (aggiornato se modificato)
});
```

**Parametri:**
- `prompt` (string): La nuova stringa del prompt

**Casi d'uso:**
- **Modalità diverse**: Indicare visivamente lo stato dell'applicazione (user/admin, debug/normal)
- **Contesto**: Mostrare directory corrente (come bash: `user@host:/path$ `)
- **Stato**: Indicare connessione (connesso/disconnesso)
- **Progresso**: Mostrare step di un wizard (Step 1/3, Step 2/3)

**Esempio avanzato - Prompt contestuale:**
```javascript
let directory = '/home/user';
let utente = 'guest';

function aggiornPrompt() {
  rl.setPrompt(`${utente}:${directory}$ `);
}

aggiornPrompt();
rl.prompt();

rl.on('line', (cmd) => {
  if (cmd.startsWith('cd ')) {
    directory = cmd.substring(3);
    aggiornPrompt();
  } else if (cmd.startsWith('login ')) {
    utente = cmd.substring(6);
    aggiornPrompt();
  }
  rl.prompt();
});
```

### write() - Scrivere nell'Output

Scrive testo sull'output stream. Utile per pre-compilare input o simulare digitazione.

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Scrive testo nell'output stream
rl.write('Testo predefinito');

// Simula input utente (utile per testing)
// Il \n fa sì che venga processato come se l'utente avesse premuto INVIO
rl.write('comando\n');

// Scrive sulla linea corrente senza triggere eventi
rl.write('pre-compilato', { ctrl: false, name: '' });
```

**Parametri:**
- `data` (string): Il testo da scrivere
- `key` (object, opzionale): Oggetto che simula pressione tasti speciali
  - `ctrl` (boolean): Se true, simula Ctrl+tasto
  - `name` (string): Nome del tasto ('return', 'backspace', ecc.)

**Casi d'uso:**
1. **Pre-compilazione**: Suggerire valori di default modificabili
2. **Testing**: Simulare input utente nei test automatici
3. **Automazione**: Eseguire comandi programmaticamente
4. **Tutorial**: Mostrare esempi di comandi

**Esempio - Pre-compilazione modificabile:**
```javascript
rl.question('Email: ', (email) => {
  console.log('Email inserita:', email);
  rl.close();
});

// Pre-compila con valore suggerito (l'utente può modificarlo)
rl.write('utente@example.com');
// L'utente vede: Email: utente@example.com|
//                                           ^ cursore qui
```

**Esempio - Testing automatico:**
```javascript
// Test automatico di un'applicazione CLI
function testApp() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Simula sequenza di comandi
  setTimeout(() => rl.write('comando1\n'), 100);
  setTimeout(() => rl.write('comando2\n'), 200);
  setTimeout(() => rl.write('exit\n'), 300);
}
```

### pause() e resume() - Controllo Stream

Gestiscono il flusso di lettura dall'input stream. Utili per backpressure e rate limiting.

```javascript
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: fs.createReadStream('grande-file.txt'),
  crlfDelay: Infinity
});

let lineeProcessate = 0;

rl.on('line', (line) => {
  lineeProcessate++;
  console.log(`Linea ${lineeProcessate}: ${line}`);
  
  // Pausa ogni 100 linee per evitare sovraccarico
  if (lineeProcessate % 100 === 0) {
    console.log('Pausa per elaborazione...');
    rl.pause();  // Ferma la lettura dal file
    
    // Riprendi dopo elaborazione pesante
    setTimeout(() => {
      console.log('Ripresa...');
      rl.resume();  // Riprende la lettura
    }, 1000);
  }
});

rl.on('close', () => {
  console.log(`Totale linee: ${lineeProcessate}`);
});
```

**Quando usare pause/resume:**

1. **Backpressure**: Quando l'elaborazione è più lenta della lettura
   ```javascript
   rl.on('line', async (line) => {
     rl.pause();  // Ferma lettura durante elaborazione
     await elaborazionePesante(line);
     rl.resume(); // Riprendi quando pronto
   });
   ```

2. **Rate limiting**: Limitare velocità di processamento
   ```javascript
   let count = 0;
   rl.on('line', (line) => {
     count++;
     if (count % 1000 === 0) {
       rl.pause();
       setTimeout(() => rl.resume(), 1000); // 1000 linee/sec max
     }
   });
   ```

3. **Controllo memoria**: Evitare overflow della coda eventi
   ```javascript
   const queue = [];
   rl.on('line', (line) => {
     queue.push(line);
     if (queue.length > 1000) {
       rl.pause();  // Ferma se troppi dati in coda
       processQueue().then(() => rl.resume());
     }
   });
   ```

4. **Interazione utente**: Aspettare conferma prima di continuare
   ```javascript
   rl.on('line', (line) => {
     if (line.includes('ATTENZIONE')) {
       rl.pause();
       rl.question('Continuare? (s/n) ', (risposta) => {
         if (risposta === 's') rl.resume();
         else rl.close();
       });
     }
   });
   ```

**Nota importante**: `pause()` non ferma immediatamente. I dati già bufferizzati verranno comunque processati.

### close() - Chiudere Interfaccia

Termina l'interfaccia readline e libera le risorse associate.

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Vuoi uscire? (s/n) ', (risposta) => {
  if (risposta.toLowerCase() === 's') {
    console.log('Arrivederci!');
    rl.close();  // Chiude l'interfaccia e gli stream
  } else {
    console.log('Continui...');
    rl.close();
  }
});

// Evento quando l'interfaccia viene chiusa
rl.on('close', () => {
  console.log('Interfaccia chiusa');
  process.exit(0);  // Termina il processo
});
```

**Cosa fa `close()`:**
1. Ferma la lettura dall'input stream
2. Emette l'evento `'close'`
3. NON chiude automaticamente gli stream sottostanti (stdin/stdout)
4. Libera listener eventi e risorse interne

**Quando è necessario chiamare close():**
- ❌ **Sempre** quando usi `process.stdin` (altrimenti il programma non termina)
- ✅ **Opzionale** per file stream (vengono chiusi automaticamente alla fine)
- ✅ **Opzionale** per stream personalizzati (gestisci tu la loro chiusura)

**Problema comune - Programma che non termina:**
```javascript
// ❌ MALE - il programma rimane in esecuzione
rl.question('Nome: ', (nome) => {
  console.log('Ciao', nome);
  // Manca rl.close()!
});
// Il processo resta in attesa di input

// ✅ BENE - termina correttamente
rl.question('Nome: ', (nome) => {
  console.log('Ciao', nome);
  rl.close();  // Libera stdin
});
```

**Gestione cleanup:**
```javascript
// Chiusura pulita con cleanup
rl.on('close', () => {
  // Salva dati
  salvaSuFile();
  // Chiudi connessioni
  db.disconnect();
  // Termina processo
  console.log('Cleanup completato');
  process.exit(0);
});

// Gestione Ctrl+C
rl.on('SIGINT', () => {
  rl.question('\nSei sicuro di voler uscire? (s/n) ', (answer) => {
    if (answer.match(/^s(i)?$/i)) {
      rl.close();  // Trigger evento 'close'
    } else {
      rl.prompt();
    }
  });
});
```

### getCursorPos() - Posizione Cursore

Restituisce la posizione corrente del cursore nel terminal. Funziona solo se `terminal: true`.

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true  // Necessario per getCursorPos()
});

rl.on('line', (input) => {
  const cursor = rl.getCursorPos();
  console.log(`Cursore alla posizione:`, cursor);
  // { rows: 0, cols: 15 }
  // rows: riga relativa al prompt (0 = stessa riga)
  // cols: colonna (caratteri dal prompt)
  rl.close();
});

rl.write('Testo iniziale');  // Cursore a colonna 15
```

**Valore restituito:**
```javascript
{
  rows: number,  // Riga relativa (0 = riga del prompt)
  cols: number   // Colonna (numero di caratteri dall'inizio della linea)
}
```

**Limitazioni:**
- Funziona solo con `terminal: true`
- Richiede supporto ANSI escape codes dal terminal
- Non funziona con pipe o redirezione
- Posizione relativa al prompt corrente, non assoluta nello schermo

**Casi d'uso:**
- Debugging di problemi di rendering
- Implementazione custom di editing features
- Calcolo lunghezza linea per word-wrap
- Posizionamento preciso di output

**Esempio - Limite lunghezza input:**
```javascript
const MAX_LENGTH = 50;

rl.on('line', (input) => {
  const pos = rl.getCursorPos();
  if (pos.cols > MAX_LENGTH) {
    console.log('Input troppo lungo!');
    rl.write(input.substring(0, MAX_LENGTH));
  }
  rl.prompt();
});
```

**Nota**: Per la maggior parte dei casi d'uso, non hai bisogno di `getCursorPos()`. È un metodo avanzato per situazioni specifiche.

---

## Eventi

Il modulo readline è un EventEmitter. Emette vari eventi durante il suo ciclo di vita per notificare cambiamenti di stato e input utente.

**Eventi disponibili:**
- `'line'` - Emesso quando l'utente preme INVIO
- `'close'` - Emesso quando l'interfaccia viene chiusa
- `'pause'` - Emesso quando lo stream viene messo in pausa
- `'resume'` - Emesso quando lo stream viene ripreso
- `'SIGINT'` - Emesso quando l'utente preme Ctrl+C
- `'SIGTSTP'` - Emesso quando l'utente preme Ctrl+Z (Unix)
- `'SIGCONT'` - Emesso quando il processo riprende dopo Ctrl+Z

**Pattern Event-Driven:**
```
Utente preme INVIO → Evento 'line' → Handler esegue logica
Utente preme Ctrl+C → Evento 'SIGINT' → Handler gestisce interruzione
Chiusura interfaccia → Evento 'close' → Handler cleanup risorse
```

### Evento 'line' - Nuova Linea

**Quando viene emesso**: Ogni volta che l'utente preme INVIO. È l'evento più importante per gestire input interattivo.

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> '
});

rl.prompt();

// Emesso quando l'utente preme INVIO
rl.on('line', (input) => {
  // 'input' contiene il testo digitato (senza il newline)
  console.log(`Input ricevuto: ${input}`);
  
  if (input === 'exit') {
    rl.close();  // Termina il loop
  } else {
    rl.prompt();  // Mostra di nuovo il prompt
  }
});
```

**Parametro del callback:**
- `input` (string): La linea di testo digitata, già trimmed del newline finale

**Caratteristiche:**
- L'evento viene emesso DOPO che l'utente preme INVIO
- Il newline (`\n` o `\r\n`) è già stato rimosso
- Stringhe vuote (solo INVIO) vengono comunque emesse
- Non viene emesso se `rl.close()` è stato chiamato

**Pattern comune - Loop REPL:**
```javascript
rl.prompt();  // Iniziale

rl.on('line', (input) => {
  // 1. Processa input
  const result = processCommand(input);
  
  // 2. Mostra risultato
  console.log(result);
  
  // 3. Loop - mostra di nuovo prompt
  rl.prompt();
});
```

**Differenza con `question()`:**
- `on('line')` è per loop continui
- `question()` è per singole domande
- `on('line')` richiede chiamata manuale a `prompt()`
- `question()` mostra il prompt automaticamente

### Evento 'close' - Interfaccia Chiusa

**Quando viene emesso**: Quando l'interfaccia viene chiusa, sia programmaticamente che dall'utente.

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Emesso quando l'interfaccia viene chiusa
rl.on('close', () => {
  console.log('\nInterfaccia terminata');
  console.log('Esecuzione cleanup...');
  
  // Qui esegui operazioni di pulizia
  // - Salva dati
  // - Chiudi connessioni
  // - Libera risorse
  
  process.exit(0);  // Termina il processo
});

// Modi per triggerare 'close':
// 1. Programmatico: rl.close()
// 2. Ctrl+D (Unix) / Ctrl+Z (Windows) - EOF
// 3. Stream di input termina (file finisce)
```

**Cause di chiusura:**

1. **Chiamata esplicita**: `rl.close()`
2. **EOF dall'input**: 
   - Ctrl+D su Unix/Linux/Mac
   - Ctrl+Z seguito da INVIO su Windows
   - Fine di un file stream
3. **Errore sullo stream**: Se input o output vanno in errore
4. **Chiusura stream sottostante**: Se `input.destroy()` viene chiamato

**Best practices:**
```javascript
rl.on('close', () => {
  // ✅ DO: Cleanup sincrono
  console.log('Goodbye!');
  
  // ✅ DO: Salva stato
  fs.writeFileSync('state.json', JSON.stringify(appState));
  
  // ✅ DO: Chiudi connessioni
  if (dbConnection) dbConnection.end();
  
  // ❌ DON'T: Operazioni asincrone lunghe
  // (potrebbero non completare prima della terminazione)
  
  // ✅ DO: Termina processo
  process.exit(0);
});
```

**Gestione graceful shutdown:**
```javascript
let salvato = false;

rl.on('close', () => {
  if (!salvato) {
    console.log('Salvataggio dati...');
    salvaStatoSync();  // Usa versione sincrona
    salvato = true;
  }
  console.log('Arrivederci!');
  process.exit(0);
});

// Assicurati che il salvataggio avvenga anche con Ctrl+C
rl.on('SIGINT', () => {
  rl.close();  // Trigger 'close' event
});
```

### Evento 'pause' - Stream in Pausa

**Quando viene emesso**: Quando l'input stream viene messo in pausa con `rl.pause()`.

```javascript
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: fs.createReadStream('file.txt'),
  crlfDelay: Infinity
});

// Emesso quando lo stream viene messo in pausa
rl.on('pause', () => {
  console.log('Stream in pausa - nessun dato verrà letto');
  // Utile per logging o debug
});

rl.on('line', (line) => {
  console.log(line);
  if (line.includes('STOP')) {
    rl.pause();  // Trigger evento 'pause'
    // Processa in background
    setTimeout(() => rl.resume(), 2000);
  }
});
```

**Caratteristiche:**
- Emesso immediatamente dopo `rl.pause()`
- Non ha parametri nel callback
- Può essere usato per logging/monitoring
- Non blocca l'event loop

**Uso tipico:**
```javascript
let isPaused = false;

rl.on('pause', () => {
  isPaused = true;
  console.log('Lettura in pausa');
  updateStatusBar('paused');
});

rl.on('resume', () => {
  isPaused = false;
  console.log('Lettura ripresa');
  updateStatusBar('reading');
});
```

### Evento 'resume' - Stream Ripreso

**Quando viene emesso**: Quando l'input stream viene ripreso con `rl.resume()` dopo una pausa.

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Emesso quando lo stream viene ripreso
rl.on('resume', () => {
  console.log('Stream ripreso - lettura riprende');
});

rl.pause();
console.log('In pausa per 2 secondi...');
setTimeout(() => rl.resume(), 2000);  // Trigger 'resume'
```

**Caratteristiche:**
- Emesso immediatamente dopo `rl.resume()`
- La lettura riprende dal punto in cui era stata interrotta
- Buffer interno mantiene dati non ancora processati

**Pattern pause/resume con eventi:**
```javascript
let pauseCount = 0;
let resumeCount = 0;

rl.on('pause', () => {
  pauseCount++;
  console.log(`Pausa #${pauseCount}`);
});

rl.on('resume', () => {
  resumeCount++;
  console.log(`Ripresa #${resumeCount}`);
});

// Utile per statistiche e monitoring
rl.on('close', () => {
  console.log(`Totale pause: ${pauseCount}`);
  console.log(`Totale riprese: ${resumeCount}`);
});
```

### Evento 'SIGINT' - Interruzione (Ctrl+C)

**Quando viene emesso**: Quando l'utente preme Ctrl+C nel terminal (solo se `terminal: true`).

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true  // Necessario per ricevere SIGINT
});

rl.prompt();

// Emesso quando l'utente preme Ctrl+C
rl.on('SIGINT', () => {
  // Chiedi conferma invece di uscire immediatamente
  rl.question('\nVuoi davvero uscire? (s/n) ', (risposta) => {
    if (risposta.toLowerCase() === 's') {
      console.log('Uscita...');
      process.exit(0);
    } else {
      console.log('Continua...');
      rl.prompt();  // Riprendi il prompt
    }
  });
});
```

**Importante:**
- Readline **intercetta** Ctrl+C e NON termina automaticamente il processo
- Senza listener `'SIGINT'`, il comportamento default è emettere l'evento ma non fare nulla
- Devi gestire esplicitamente la chiusura

**Comportamento default senza readline:**
```javascript
// Senza readline, Ctrl+C termina immediatamente
process.on('SIGINT', () => {
  console.log('Ricevuto Ctrl+C');
  process.exit(0);
});
```

**Pattern comuni:**

1. **Conferma uscita (come visto sopra)**

2. **Uscita immediata:**
```javascript
rl.on('SIGINT', () => {
  console.log('\nInterrotto!');
  rl.close();
});
```

3. **Salvataggio prima di uscire:**
```javascript
rl.on('SIGINT', () => {
  console.log('\nSalvataggio in corso...');
  salvaDati();
  console.log('Salvato. Uscita...');
  rl.close();
});
```

4. **Annullamento operazione corrente:**
```javascript
let operazioneInCorso = false;

rl.on('SIGINT', () => {
  if (operazioneInCorso) {
    console.log('\nOperazione annullata');
    operazioneInCorso = false;
    rl.prompt();
  } else {
    rl.close();
  }
});
```

5. **Double Ctrl+C per uscire:**
```javascript
let ctrlCCount = 0;
let ctrlCTimer;

rl.on('SIGINT', () => {
  ctrlCCount++;
  
  if (ctrlCCount === 1) {
    console.log('\nPremi Ctrl+C di nuovo per uscire');
    ctrlCTimer = setTimeout(() => {
      ctrlCCount = 0;
    }, 2000);  // Reset dopo 2 secondi
    rl.prompt();
  } else {
    clearTimeout(ctrlCTimer);
    console.log('\nUscita...');
    rl.close();
  }
});
```

### Evento 'SIGTSTP' - Sospensione (Ctrl+Z)

**Quando viene emesso**: Quando l'utente preme Ctrl+Z su sistemi Unix (Linux/Mac). Non disponibile su Windows.

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true  // Necessario per segnali
});

rl.prompt();

// Emesso quando l'utente preme Ctrl+Z (Unix)
rl.on('SIGTSTP', () => {
  console.log('\nProcesso in sospensione...');
  // Nota: Non può prevenire la sospensione
  // Il processo verrà comunque sospeso dal SO
});
```

**Caratteristiche:**
- **Solo Unix/Linux/Mac** - Non funziona su Windows
- Segnale di "job control" del sistema operativo
- Il processo viene sospeso (fermato) dal kernel
- Readline NON può prevenire la sospensione
- Listener utile solo per logging o cleanup veloce

**Comportamento:**
1. Utente preme Ctrl+Z
2. Evento `'SIGTSTP'` viene emesso
3. Listener esegue (solo poche millisecondi disponibili)
4. Processo viene sospeso dal sistema operativo
5. Prompt ritorna alla shell (es: `[1]+  Stopped  node app.js`)

**Riprendere il processo:**
```bash
# In background
$ bg

# In foreground
$ fg

# Lista processi sospesi
$ jobs
```

**Uso tipico (limitato):**
```javascript
rl.on('SIGTSTP', () => {
  // Puoi solo fare operazioni velocissime
  console.log('\n[Processo sospeso]');
  logEvent('suspended', Date.now());
  // Il processo viene sospeso QUI
});
```

**Nota**: La maggior parte delle applicazioni non ha bisogno di gestire SIGTSTP.

### Evento 'SIGCONT' - Continuazione

**Quando viene emesso**: Quando il processo riprende dopo essere stato sospeso con Ctrl+Z (solo Unix).

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

rl.prompt();

// Emesso quando il processo riprende dopo Ctrl+Z
rl.on('SIGCONT', () => {
  // Il processo è appena ripreso dall'essere sospeso
  console.log('\n[Processo ripreso]');
  
  // Ripristina lo stato dell'interfaccia
  rl.prompt();  // Mostra di nuovo il prompt
});
```

**Quando viene emesso:**
- Dopo che l'utente usa `fg` (foreground) o `bg` (background)
- Il processo era stato sospeso con Ctrl+Z (SIGTSTP)
- Solo su sistemi Unix/Linux/Mac

**Cosa fare nel listener:**
```javascript
rl.on('SIGCONT', () => {
  // 1. Ripristina UI
  console.clear();  // Opzionale: pulisci schermo
  console.log('Benvenuto di nuovo!');
  
  // 2. Riprendi operazioni
  if (operazioneSospesa) {
    console.log('Ripresa operazione...');
  }
  
  // 3. Mostra prompt
  rl.prompt();
});
```

**Pattern completo per job control:**
```javascript
let stato = 'running';

rl.on('SIGTSTP', () => {
  stato = 'suspended';
  console.log('\n[In sospensione...]');
  logStatoApp();
});

rl.on('SIGCONT', () => {
  stato = 'running';
  console.log('\n[Ripreso dal background]');
  logStatoApp();
  rl.prompt();
});
```

**Nota**: Come SIGTSTP, SIGCONT è raramente necessario per applicazioni normali. È più rilevante per:
- Editor di testo in terminal (vim, nano)
- Tool di monitoring continuo
- Applicazioni che devono gestire stato quando sospese

### Gestione Completa Eventi

Esempio che combina tutti gli eventi per un'applicazione robusta:

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'app> ',
  terminal: true
});

// =================================
// EVENTI PRINCIPALI
// =================================

// Line - Input utente (evento più importante)
rl.on('line', (input) => {
  const cmd = input.trim();
  
  // Processa comandi
  if (cmd === 'help') {
    console.log('Comandi: help, status, clear, exit');
  } else if (cmd === 'status') {
    console.log('Stato: running');
  } else if (cmd === 'clear') {
    console.clear();
  } else if (cmd === 'exit') {
    rl.close();
    return;  // Non mostrare prompt
  } else if (cmd) {
    console.log(`Comando sconosciuto: ${cmd}`);
  }
  
  rl.prompt();  // Mostra prompt per prossimo comando
});

// Close - Cleanup e terminazione
rl.on('close', () => {
  console.log('\n=== CHIUSURA APPLICAZIONE ===');
  
  // Cleanup operazioni
  console.log('Salvataggio configurazione...');
  // saveConfig();
  
  console.log('Chiusura connessioni...');
  // db.close();
  
  console.log('Goodbye!');
  process.exit(0);
});

// =================================
// EVENTI DI CONTROLLO FLUSSO
// =================================

// Pause - Monitoraggio
rl.on('pause', () => {
  console.log('[DEBUG] Stream in pausa');
});

// Resume - Monitoraggio
rl.on('resume', () => {
  console.log('[DEBUG] Stream ripreso');
});

// =================================
// EVENTI SEGNALI (Ctrl+C, Ctrl+Z)
// =================================

// SIGINT - Ctrl+C con conferma
rl.on('SIGINT', () => {
  rl.question('\nVuoi davvero uscire? (s/n) ', (answer) => {
    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'si') {
      rl.close();  // Trigger evento 'close'
    } else {
      console.log('Operazione annullata');
      rl.prompt();
    }
  });
});

// SIGTSTP - Ctrl+Z (Unix only)
rl.on('SIGTSTP', () => {
  console.log('\n[Processo in sospensione...]');
  // Il processo viene sospeso qui
});

// SIGCONT - Ripresa da sospensione (Unix only)
rl.on('SIGCONT', () => {
  console.log('\n[Processo ripreso]');
  console.log('Benvenuto di nuovo!');
  rl.prompt();
});

// =================================
// AVVIO APPLICAZIONE
// =================================

console.log('=== APPLICAZIONE AVVIATA ===');
console.log('Digita "help" per la lista comandi\n');
rl.prompt();
```

**Struttura consigliata:**

1. **Setup** - Crea interfaccia con opzioni
2. **Eventi core** - `'line'` e `'close'` sempre presenti
3. **Eventi controllo** - `'pause'` e `'resume'` se usi pause/resume
4. **Eventi segnali** - `'SIGINT'` per gestione Ctrl+C, `'SIGTSTP'`/`'SIGCONT'` se necessario
5. **Inizializzazione** - Mostra prompt iniziale

**Best practices:**
- ✅ Gestisci sempre almeno `'line'` e `'close'`
- ✅ Implementa conferma per `'SIGINT'` in applicazioni critiche
- ✅ Usa `'pause'`/`'resume'` eventi per monitoring/debug
- ❌ Non fare operazioni pesanti in `'SIGTSTP'` (hai pochissimo tempo)
- ✅ Usa `'SIGCONT'` per ripristinare UI dopo sospensione

---

## Pattern Comuni

Soluzioni ai problemi più comuni nello sviluppo con readline.

### Domande Sequential (Callback Hell)

**Problema**: Readline usa callback per `question()`, portando a codice nidificato e difficile da mantenere quando ci sono molte domande sequenziali.

**Perché succede:**
- `question()` è asincrono (non bloccante)
- Ogni domanda dipende dalla precedente
- Callback dentro callback creano "piramide del doom"

**Sintomi:**
- Indentazione crescente
- Difficile seguire il flusso
- Gestione errori complessa
- Difficile refactoring

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Problema: callback nidificati
rl.question('Nome: ', (nome) => {
  rl.question('Email: ', (email) => {
    rl.question('Password: ', (password) => {
      rl.question('Conferma password: ', (conferma) => {
        console.log('Dati registrazione:', { nome, email, password, conferma });
        rl.close();
      });
    });
  });
});
```

### Soluzione con Promises

**Approccio**: Wrappare `question()` in una Promise per usare async/await.

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Wrapper per question che restituisce una Promise
function chiedi(domanda) {
  return new Promise((resolve) => {
    rl.question(domanda, (risposta) => {
      resolve(risposta);  // Risolve con la risposta
    });
  });
}

// Uso con async/await
async function registrazione() {
  try {
    // Domande in sequenza ma senza nesting
    const nome = await chiedi('Nome: ');
    const email = await chiedi('Email: ');
    const password = await chiedi('Password: ');
    const conferma = await chiedi('Conferma password: ');
    
    console.log('Dati:', { nome, email, password, conferma });
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    rl.close();  // Sempre chiudi
  }
}

registrazione();
```

**Vantaggi:**
- ✅ Codice lineare e leggibile
- ✅ Facile gestione errori con try/catch
- ✅ `finally` per cleanup garantito
- ✅ Facile aggiungere validazione
- ✅ Testabile

**Pattern con validazione:**
```javascript
async function chiediConValidazione(domanda, validazione) {
  while (true) {
    const risposta = await chiedi(domanda);
    
    // Valida risposta
    if (validazione(risposta)) {
      return risposta;
    }
    
    console.log('❌ Input non valido. Riprova.');
  }
}

// Uso
const email = await chiediConValidazione(
  'Email: ',
  (input) => input.includes('@')
);
```
```

### Readline con Promises Nativo (Node.js 17+)

```javascript
const readlinePromises = require('readline/promises');

async function main() {
  const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  try {
    // Usa direttamente await con question
    const nome = await rl.question('Nome: ');
    const email = await rl.question('Email: ');
    const password = await rl.question('Password: ');
    
    console.log('Registrazione completata:', { nome, email });
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    rl.close();
  }
}

main();
```

### Loop Interattivo (REPL)

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'calc> '
});

console.log('Calcolatrice semplice');
console.log('Digita espressioni matematiche o "exit" per uscire');
rl.prompt();

rl.on('line', (input) => {
  const trimmed = input.trim();
  
  if (trimmed === 'exit') {
    console.log('Arrivederci!');
    rl.close();
    return;
  }
  
  if (trimmed === 'help') {
    console.log('Comandi: exit, help, clear');
    console.log('Esempi: 2+2, 10*5, 100/4');
    rl.prompt();
    return;
  }
  
  if (trimmed === 'clear') {
    console.clear();
    rl.prompt();
    return;
  }
  
  try {
    // ATTENZIONE: eval è pericoloso in produzione!
    const result = eval(trimmed);
    console.log(`= ${result}`);
  } catch (error) {
    console.log('Errore:', error.message);
  }
  
  rl.prompt();
});

rl.on('close', () => {
  console.log('\nProgramma terminato');
  process.exit(0);
});
```

### Menu Interattivo

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function mostraMenu() {
  console.log('\n=== MENU PRINCIPALE ===');
  console.log('1. Opzione 1');
  console.log('2. Opzione 2');
  console.log('3. Opzione 3');
  console.log('0. Esci');
  console.log('=======================');
}

function chiedi(domanda) {
  return new Promise((resolve) => {
    rl.question(domanda, resolve);
  });
}

async function menu() {
  let continua = true;
  
  while (continua) {
    mostraMenu();
    const scelta = await chiedi('\nScegli opzione: ');
    
    switch (scelta) {
      case '1':
        console.log('Hai scelto opzione 1');
        break;
      case '2':
        console.log('Hai scelto opzione 2');
        break;
      case '3':
        console.log('Hai scelto opzione 3');
        break;
      case '0':
        console.log('Uscita...');
        continua = false;
        break;
      default:
        console.log('Opzione non valida!');
    }
  }
  
  rl.close();
}

menu();
```

---

## Esempi Pratici

Gli esempi seguenti mostrano implementazioni complete di casi d'uso reali. Ogni esempio include:
- **Obiettivo**: Cosa imparerai
- **Tecniche**: Pattern e metodi usati
- **Codice completo**: Pronto per essere eseguito
- **Output atteso**: Esempio di esecuzione

### Esempio 1: Lettura File Riga per Riga

**Obiettivo**: Imparare a processare file grandi senza caricarli completamente in memoria.

**Tecniche usate:**
- `fs.createReadStream()` per streaming
- `for await...of` per iterazione asincrona
- `crlfDelay: Infinity` per gestione line breaks cross-platform
- Statistiche incrementali

**Quando è utile:**
- File di log di grandi dimensioni
- Dataset CSV/TSV
- Analisi di codice sorgente
- Ricerca in file di testo

```javascript
// leggi-file.js
const readline = require('readline');
const fs = require('fs');

async function processaFile(nomeFile) {
  const fileStream = fs.createReadStream(nomeFile);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let numeroLinea = 0;
  let lineeVuote = 0;
  let caratteriTotali = 0;
  
  for await (const line of rl) {
    numeroLinea++;
    caratteriTotali += line.length;
    
    if (line.trim() === '') {
      lineeVuote++;
    }
    
    // Mostra linee che contengono "TODO"
    if (line.includes('TODO')) {
      console.log(`Linea ${numeroLinea}: ${line}`);
    }
  }
  
  console.log('\n=== STATISTICHE ===');
  console.log(`Totale linee: ${numeroLinea}`);
  console.log(`Linee vuote: ${lineeVuote}`);
  console.log(`Caratteri totali: ${caratteriTotali}`);
  console.log(`Media caratteri per linea: ${(caratteriTotali / numeroLinea).toFixed(2)}`);
}

// Uso
const nomeFile = process.argv[2] || 'file.txt';
processaFile(nomeFile).catch(console.error);
```

**Esecuzione:**
```bash
node leggi-file.js mio-file.txt
```

**Output esempio:**
```
Linea 23: // TODO: Refactor this function
Linea 45: // TODO: Add error handling
Linea 67: // TODO: Optimize performance

=== STATISTICHE ===
Totale linee: 150
Linee vuote: 12
Caratteri totali: 4523
Media caratteri per linea: 30.15
```

**Cosa imparare:**
- `for await...of` è più pulito di `on('line')`
- Statistiche calcolate incrementalmente (memoria costante)
- Pattern filtering per cercare specifici contenuti
- Gestione errori con try/catch intorno a `processaFile()`

### Esempio 2: Form di Registrazione

**Obiettivo**: Creare un form interattivo con validazione input.

**Tecniche usate:**
- `readline/promises` per async/await pulito
- Validazione con regex
- Loop di retry per input invalidi
- Gestione password (con conferma)

```javascript
// registrazione.js
const readline = require('readline/promises');

async function registraUtente() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('=== REGISTRAZIONE UTENTE ===\n');
  
  try {
    const nome = await rl.question('Nome: ');
    if (!nome.trim()) {
      throw new Error('Nome obbligatorio');
    }
    
    const email = await rl.question('Email: ');
    if (!email.includes('@')) {
      throw new Error('Email non valida');
    }
    
    const password = await rl.question('Password (min 8 caratteri): ');
    if (password.length < 8) {
      throw new Error('Password troppo corta');
    }
    
    const conferma = await rl.question('Conferma password: ');
    if (password !== conferma) {
      throw new Error('Le password non coincidono');
    }
    
    console.log('\n✓ Registrazione completata!');
    console.log('Dati utente:', { nome, email });
    
  } catch (error) {
    console.error('\n✗ Errore:', error.message);
  } finally {
    rl.close();
  }
}

registraUtente();
```

### Esempio 3: Quiz Interattivo

```javascript
// quiz.js
const readline = require('readline/promises');

const domande = [
  {
    domanda: 'Qual è la capitale dell\'Italia?',
    risposte: ['a) Milano', 'b) Roma', 'c) Napoli', 'd) Torino'],
    corretta: 'b'
  },
  {
    domanda: 'Quanto fa 5 + 3?',
    risposte: ['a) 6', 'b) 7', 'c) 8', 'd) 9'],
    corretta: 'c'
  },
  {
    domanda: 'Chi ha dipinto la Gioconda?',
    risposte: ['a) Michelangelo', 'b) Raffaello', 'c) Leonardo', 'd) Caravaggio'],
    corretta: 'c'
  }
];

async function quiz() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('=== QUIZ ===\n');
  let punteggio = 0;
  
  try {
    for (let i = 0; i < domande.length; i++) {
      const q = domande[i];
      
      console.log(`\nDomanda ${i + 1}/${domande.length}:`);
      console.log(q.domanda);
      q.risposte.forEach(r => console.log(r));
      
      const risposta = await rl.question('\nRisposta: ');
      
      if (risposta.toLowerCase() === q.corretta) {
        console.log('✓ Corretto!');
        punteggio++;
      } else {
        console.log(`✗ Sbagliato! La risposta corretta era: ${q.corretta}`);
      }
    }
    
    console.log(`\n=== RISULTATO ===`);
    console.log(`Punteggio: ${punteggio}/${domande.length}`);
    console.log(`Percentuale: ${((punteggio / domande.length) * 100).toFixed(0)}%`);
    
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    rl.close();
  }
}

quiz();
```

### Esempio 4: Todo List CLI

```javascript
// todo.js
const readline = require('readline/promises');
const fs = require('fs').promises;

class TodoList {
  constructor(filename = 'todos.json') {
    this.filename = filename;
    this.todos = [];
  }
  
  async carica() {
    try {
      const data = await fs.readFile(this.filename, 'utf8');
      this.todos = JSON.parse(data);
    } catch (error) {
      this.todos = [];
    }
  }
  
  async salva() {
    await fs.writeFile(this.filename, JSON.stringify(this.todos, null, 2));
  }
  
  aggiungi(testo) {
    this.todos.push({
      id: Date.now(),
      testo,
      completato: false,
      data: new Date().toISOString()
    });
  }
  
  lista() {
    if (this.todos.length === 0) {
      console.log('Nessun todo presente');
      return;
    }
    
    console.log('\n=== TODOS ===');
    this.todos.forEach((todo, index) => {
      const status = todo.completato ? '✓' : ' ';
      console.log(`${index + 1}. [${status}] ${todo.testo}`);
    });
  }
  
  completa(index) {
    if (index >= 0 && index < this.todos.length) {
      this.todos[index].completato = true;
      return true;
    }
    return false;
  }
  
  elimina(index) {
    if (index >= 0 && index < this.todos.length) {
      this.todos.splice(index, 1);
      return true;
    }
    return false;
  }
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const todoList = new TodoList();
  await todoList.carica();
  
  console.log('=== TODO LIST CLI ===');
  console.log('Comandi: add, list, complete, delete, exit');
  
  let continua = true;
  
  try {
    while (continua) {
      const comando = await rl.question('\nComando: ');
      const [cmd, ...args] = comando.trim().split(' ');
      
      switch (cmd.toLowerCase()) {
        case 'add':
          const testo = args.join(' ');
          if (testo) {
            todoList.aggiungi(testo);
            await todoList.salva();
            console.log('✓ Todo aggiunto');
          } else {
            console.log('Uso: add <testo del todo>');
          }
          break;
          
        case 'list':
          todoList.lista();
          break;
          
        case 'complete':
          const indexComp = parseInt(args[0]) - 1;
          if (todoList.completa(indexComp)) {
            await todoList.salva();
            console.log('✓ Todo completato');
          } else {
            console.log('✗ Indice non valido');
          }
          break;
          
        case 'delete':
          const indexDel = parseInt(args[0]) - 1;
          if (todoList.elimina(indexDel)) {
            await todoList.salva();
            console.log('✓ Todo eliminato');
          } else {
            console.log('✗ Indice non valido');
          }
          break;
          
        case 'exit':
          continua = false;
          console.log('Arrivederci!');
          break;
          
        default:
          console.log('Comando non riconosciuto');
          console.log('Comandi disponibili: add, list, complete, delete, exit');
      }
    }
  } finally {
    rl.close();
  }
}

main().catch(console.error);
```

**Esecuzione:**
```bash
$ node todo.js
=== TODO LIST CLI ===
Comandi: add, list, complete, delete, exit

Comando: add Comprare il latte
✓ Todo aggiunto

Comando: add Studiare Node.js
✓ Todo aggiunto

Comando: list

=== TODOS ===
1. [ ] Comprare il latte
2. [ ] Studiare Node.js

Comando: complete 1
✓ Todo completato

Comando: list

=== TODOS ===
1. [✓] Comprare il latte
2. [ ] Studiare Node.js

Comando: exit
Arrivederci!
```

**Punti chiave dell'implementazione:**

1. **Classe TodoList**:
   - Incapsula logica e stato
   - Metodi singoli, responsabilità chiare
   - Facile testare e estendere

2. **Persistenza**:
   ```javascript
   // Salva: converte array in JSON
   await fs.writeFile('todos.json', JSON.stringify(this.todos, null, 2));
   
   // Carica: parse JSON o array vuoto se non esiste
   const data = await fs.readFile('todos.json', 'utf8');
   this.todos = JSON.parse(data);
   ```

3. **Command parsing**:
   ```javascript
   const [cmd, ...args] = comando.trim().split(' ');
   // "add Comprare latte" → cmd="add", args=["Comprare", "latte"]
   const testo = args.join(' ');  // Ricostruisce testo
   ```

4. **Switch con validazione**:
   - Ogni case valida input prima di agire
   - Feedback sempre presente (✓ o ✗)
   - Default case per comandi sconosciuti

5. **Finally block**:
   ```javascript
   try {
     while (continua) { /* ... */ }
   } finally {
     rl.close();  // Cleanup garantito
   }
   ```

**Possibili estensioni:**
- Aggiungere priorità (alta, media, bassa)
- Aggiungere date di scadenza
- Implementare filtri (mostra solo completati/non completati)
- Aggiungere categorie/tag
- Implementare undo/redo
- Aggiungere ricerca

**Concetti chiave imparati:**
- ✅ REPL pattern per applicazioni interattive
- ✅ Persistenza dati con JSON
- ✅ Parsing e validazione comandi
- ✅ Organizzazione codice con classi
- ✅ Error handling robusto
- ✅ UX con feedback chiaro

---

## Riepilogo

**Il modulo readline è ideale per:**
- ✅ Input utente interattivo (CLI apps)
- ✅ Processare file grandi linea per linea
- ✅ Creare REPL e shell custom
- ✅ Menu testuali e wizard
- ✅ Tool da riga di comando

**Metodi essenziali:**
- `createInterface()` - Setup
- `question()` - Domanda singola
- `prompt()` / `on('line')` - REPL loop
- `close()` - Cleanup

**Pattern comuni:**
- Promise wrapper per async/await
- `readline/promises` per codice moderno
- `for await...of` per file streaming
- Eventi per gestione segnali (Ctrl+C, Ctrl+Z)

**Best practices:**
- ✅ Sempre chiudere interfaccia con `close()`
- ✅ Gestire `'SIGINT'` per uscita controllata
- ✅ Validare input utente
- ✅ Usare async/await invece di callback nidificati
- ✅ `crlfDelay: Infinity` per file cross-platform
- ❌ Non usare `eval()` in produzione

**Risorse:**
- [Node.js Readline Docs](https://nodejs.org/api/readline.html)
- [readline/promises Docs](https://nodejs.org/api/readline.html#promises-api)
- Esempi pratici: `esempi/06.01-*.js` fino a `esempi/06.08-*.js`

---

**Esercizi consigliati:**
1. Crea un gioco "indovina il numero" con tentativi limitati
2. Implementa un converter unità di misura interattivo
3. Scrivi un parser CSV che permetta di filtrare colonne
4. Costruisci un mini-database in-memory con comandi SQL-like
5. Crea un timer Pomodoro CLI con notifiche

[Continua nella Parte 2: Autocompletamento, Cronologia e Pattern Avanzati →](06-readline-parte2.md)

