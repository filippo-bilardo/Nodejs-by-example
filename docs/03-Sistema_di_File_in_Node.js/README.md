# Esercitazione 3: Sistema di File in Node.js

## Panoramica
In questa esercitazione esploreremo il modulo `fs` (File System) di Node.js, che permette di interagire con il file system del sistema operativo per leggere, scrivere e manipolare file e directory.

## Obiettivi
- Comprendere le operazioni di base sul file system in Node.js
- Utilizzare API sincrone e asincrone per la gestione dei file
- Implementare operazioni di lettura e scrittura su file
- Lavorare con directory e percorsi
- Utilizzare gli stream per operazioni efficienti su file di grandi dimensioni

## Argomenti Teorici Collegati
- [Operazioni File System in Node.js](../teoria/01-file-system.md#operazioni-di-base)
- [API Sincrone vs Asincrone](../teoria/01-file-system.md#api-sincrone-vs-asincrone)
- [Stream e Buffer](../teoria/01-file-system.md#stream-e-buffer)

## Esercizi Pratici

### Esercizio 3.1: Lettura e Scrittura File

#### Parte 1: Lettura file
```javascript
// lettura-file.js
const fs = require('fs');
const path = require('path');

// Percorso del file
const filePath = path.join(__dirname, 'files', 'esempio.txt');

// Lettura sincrona
try {
  console.log('Inizio lettura sincrona');
  const contenuto = fs.readFileSync(filePath, 'utf8');
  console.log('Contenuto (sincrono):', contenuto);
  console.log('Fine lettura sincrona');
} catch (err) {
  console.error('Errore lettura sincrona:', err);
}

// Lettura asincrona con callback
console.log('Inizio lettura asincrona');
fs.readFile(filePath, 'utf8', (err, contenuto) => {
  if (err) {
    console.error('Errore lettura asincrona:', err);
    return;
  }
  console.log('Contenuto (asincrono):', contenuto);
  console.log('Fine lettura asincrona');
});
console.log('Lettura asincrona avviata...');

// Lettura asincrona con promises
console.log('Inizio lettura con promises');
fs.promises.readFile(filePath, 'utf8')
  .then(contenuto => {
    console.log('Contenuto (promise):', contenuto);
    console.log('Fine lettura con promises');
  })
  .catch(err => {
    console.error('Errore lettura con promises:', err);
  });
console.log('Lettura con promises avviata...');
```

Nota: prima di eseguire questo script, crea una directory `files` e un file `esempio.txt` al suo interno con del testo.

#### Parte 2: Scrittura file
```javascript
// scrittura-file.js
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'output');
const filePath = path.join(directoryPath, 'file-creato.txt');

// Crea la directory se non esiste
if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath);
  console.log(`Directory creata: ${directoryPath}`);
}

// Scrittura sincrona
try {
  fs.writeFileSync(filePath, 'Questo è un testo scritto sincronicamente.\n');
  console.log('File scritto sincronicamente');
  
  // Aggiunta contenuto al file
  fs.appendFileSync(filePath, 'Questo è un testo aggiunto sincronicamente.\n');
  console.log('Contenuto aggiunto sincronicamente');
} catch (err) {
  console.error('Errore nella scrittura sincrona:', err);
}

// Scrittura asincrona
const nuovoContenuto = 'Questo è un testo scritto asincronicamente.\n';
fs.writeFile(filePath, nuovoContenuto, { flag: 'a' }, err => {
  if (err) {
    console.error('Errore nella scrittura asincrona:', err);
    return;
  }
  console.log('File scritto asincronicamente');
  
  // Leggiamo il contenuto finale per verificare
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Errore nella lettura:', err);
      return;
    }
    console.log('Contenuto finale del file:');
    console.log('------------------------');
    console.log(data);
    console.log('------------------------');
  });
});
```

### Esercizio 3.2: Gestione Directory

```javascript
// gestione-directory.js
const fs = require('fs');
const path = require('path');

// Percorso directory
const dirPath = path.join(__dirname, 'test-directory');

// Creazione directory
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
  console.log(`Directory creata: ${dirPath}`);
}

// Creazione file di test
for (let i = 1; i <= 5; i++) {
  const filePath = path.join(dirPath, `file${i}.txt`);
  fs.writeFileSync(filePath, `Questo è il contenuto del file ${i}`);
  console.log(`File creato: ${filePath}`);
}

// Lettura della directory
console.log('\nContenuto della directory:');
const files = fs.readdirSync(dirPath);
files.forEach(file => {
  const filePath = path.join(dirPath, file);
  const stats = fs.statSync(filePath);
  
  console.log({
    nome: file,
    èDirectory: stats.isDirectory(),
    dimensione: stats.size + ' bytes',
    modificatoIl: stats.mtime
  });
});

// Rinomina un file
const oldPath = path.join(dirPath, 'file1.txt');
const newPath = path.join(dirPath, 'rinominato.txt');
fs.renameSync(oldPath, newPath);
console.log(`\nFile rinominato da ${oldPath} a ${newPath}`);

// Eliminazione file
fs.unlinkSync(path.join(dirPath, 'file2.txt'));
console.log(`File eliminato: file2.txt`);

// Controllo esistenza file
if (fs.existsSync(path.join(dirPath, 'file3.txt'))) {
  console.log('file3.txt esiste');
} else {
  console.log('file3.txt non esiste');
}

// Utilizzo di fs.promises per cancellazione ricorsiva
console.log('\nPulizia...');
fs.promises.rm(dirPath, { recursive: true, force: true })
  .then(() => console.log(`Directory ${dirPath} cancellata ricorsivamente`))
  .catch(err => console.error('Errore durante la cancellazione:', err));
```

### Esercizio 3.3: Stream di File

```javascript
// stream-file.js
const fs = require('fs');
const path = require('path');

// Percorsi
const inputFile = path.join(__dirname, 'files', 'grande-file.txt');
const outputFile = path.join(__dirname, 'output', 'grande-file-copia.txt');

// Creazione file grande di esempio (solo per dimostrazione)
function creaFileGrande() {
  if (!fs.existsSync(path.dirname(inputFile))) {
    fs.mkdirSync(path.dirname(inputFile), { recursive: true });
  }
  
  const writeStream = fs.createWriteStream(inputFile);
  console.log('Creazione file grande di esempio...');
  
  for (let i = 0; i < 10000; i++) {
    writeStream.write(`Linea ${i}: ${'*'.repeat(100)}\n`);
  }
  
  writeStream.end();
  console.log(`File creato: ${inputFile}`);
}

// Assicuriamo che la directory di output esista
if (!fs.existsSync(path.dirname(outputFile))) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
}

// Crea il file di esempio se non esiste
if (!fs.existsSync(inputFile)) {
  creaFileGrande();
}

// Stream di lettura
const readStream = fs.createReadStream(inputFile, { encoding: 'utf8', highWaterMark: 64 * 1024 });

// Stream di scrittura
const writeStream = fs.createWriteStream(outputFile);

console.log('Inizio copia file usando streams');

// Monitoraggio eventi
let bytesLetti = 0;
let bytesScritti = 0;

readStream.on('data', (chunk) => {
  bytesLetti += chunk.length;
  console.log(`Letti ${(bytesLetti / 1024).toFixed(2)} KB`);
});

writeStream.on('finish', () => {
  console.log(`\nCopia completata! Scritti ${(bytesScritti / 1024).toFixed(2)} KB`);
  console.log(`File copiato da ${inputFile} a ${outputFile}`);
});

// Tracciamento progresso scrittura
writeStream.on('drain', () => {
  bytesScritti = writeStream.bytesWritten;
  console.log(`Scritti ${(bytesScritti / 1024).toFixed(2)} KB`);
});

// Gestione errori
readStream.on('error', err => console.error('Errore lettura:', err));
writeStream.on('error', err => console.error('Errore scrittura:', err));

// Versione 1: Piping manuale
/*
readStream.on('data', (chunk) => {
  writeStream.write(chunk);
});

readStream.on('end', () => {
  writeStream.end();
});
*/

// Versione 2: Piping semplificato (consigliata)
readStream.pipe(writeStream);

console.log('Operazione di copia avviata in background...');
```

### Esercizio 3.4: Monitoraggio File e Directory

```javascript
// file-watcher.js
const fs = require('fs');
const path = require('path');

// Directory da monitorare
const watchDir = path.join(__dirname, 'watch');

// Crea la directory se non esiste
if (!fs.existsSync(watchDir)) {
  fs.mkdirSync(watchDir);
  console.log(`Directory creata: ${watchDir}`);
}

console.log(`Monitoraggio avviato sulla directory: ${watchDir}`);
console.log('Prova a creare, modificare o eliminare file in questa directory...');

// Avvio del monitoraggio
const watcher = fs.watch(watchDir, { recursive: true }, (eventType, filename) => {
  console.log(`\nEvento: ${eventType}`);
  
  if (filename) {
    console.log(`File: ${filename}`);
    const filePath = path.join(watchDir, filename);
    
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`Tipo: ${stats.isDirectory() ? 'Directory' : 'File'}`);
        console.log(`Dimensione: ${stats.size} bytes`);
        console.log(`Modificato: ${stats.mtime}`);
      } else {
        console.log('Stato: File/Directory eliminato');
      }
    } catch (err) {
      // Il file potrebbe non essere più disponibile
      console.log('Non è stato possibile accedere al file (probabilmente è stato eliminato)');
    }
  } else {
    console.log('Filename non fornito');
  }
  
  console.log('-------------------------------------');
});

// Istruzioni per esempio interattivo
console.log('\nPer testare:');
console.log(`1. Crea un file: touch ${path.join(watchDir, 'test.txt')}`);
console.log(`2. Modifica un file: echo "testo" >> ${path.join(watchDir, 'test.txt')}`);
console.log(`3. Elimina un file: rm ${path.join(watchDir, 'test.txt')}`);

// Gestione della chiusura
process.on('SIGINT', () => {
  console.log('\nChiusura del monitoraggio...');
  watcher.close();
  process.exit();
});
```

## Sfida Aggiuntiva
Crea un semplice gestore di note che possa:
- Creare nuove note (file .txt)
- Leggere note esistenti
- Aggiornare il contenuto delle note
- Eliminare note
- Elencare tutte le note disponibili

```javascript
// gestore-note.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Directory per le note
const notesDir = path.join(__dirname, 'notes');

// Crea la directory se non esiste
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir);
  console.log(`Directory note creata: ${notesDir}`);
}

// Interfaccia per l'input da riga di comando
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Menu principale
function mostraMenu() {
  console.log('\n===== GESTORE NOTE =====');
  console.log('1. Elenco note');
  console.log('2. Leggi nota');
  console.log('3. Crea nuova nota');
  console.log('4. Aggiorna nota');
  console.log('5. Elimina nota');
  console.log('0. Esci');
  
  rl.question('\nScegli un\'opzione: ', (risposta) => {
    switch (risposta) {
      case '1': elencoNote(); break;
      case '2': leggiNota(); break;
      case '3': creaNota(); break;
      case '4': aggiornaNota(); break;
      case '5': eliminaNota(); break;
      case '0': 
        console.log('Arrivederci!');
        rl.close();
        break;
      default:
        console.log('Opzione non valida');
        mostraMenu();
    }
  });
}

// Funzione 1: Elenco note
function elencoNote() {
  const files = fs.readdirSync(notesDir);
  console.log('\n=== NOTE DISPONIBILI ===');
  
  if (files.length === 0) {
    console.log('Nessuna nota trovata.');
  } else {
    files.forEach((file, index) => {
      // Mostra solo file .txt
      if (path.extname(file) === '.txt') {
        const filePath = path.join(notesDir, file);
        const stats = fs.statSync(filePath);
        console.log(`${index + 1}. ${file} (${stats.size} bytes, modificato: ${stats.mtime.toLocaleDateString()})`);
      }
    });
  }
  
  mostraMenu();
}

// Funzione 2: Leggi nota
function leggiNota() {
  const files = fs.readdirSync(notesDir)
    .filter(file => path.extname(file) === '.txt');
  
  if (files.length === 0) {
    console.log('\nNessuna nota da leggere.');
    return mostraMenu();
  }
  
  console.log('\nNote disponibili:');
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  rl.question('\nSeleziona il numero della nota da leggere: ', (risposta) => {
    const indice = parseInt(risposta) - 1;
    
    if (indice >= 0 && indice < files.length) {
      const filePath = path.join(notesDir, files[indice]);
      try {
        const contenuto = fs.readFileSync(filePath, 'utf8');
        console.log('\n=== CONTENUTO NOTA ===');
        console.log(`Titolo: ${files[indice]}`);
        console.log('----------------------');
        console.log(contenuto);
        console.log('----------------------');
      } catch (err) {
        console.error('Errore nella lettura:', err);
      }
    } else {
      console.log('Selezione non valida.');
    }
    
    mostraMenu();
  });
}

// Funzione 3: Crea nuova nota
function creaNota() {
  rl.question('\nInserisci il nome della nota (senza estensione): ', (nome) => {
    // Validazione del nome
    if (!nome || nome.trim() === '') {
      console.log('Nome non valido. Riprova.');
      return mostraMenu();
    }
    
    // Aggiungi estensione .txt se non presente
    if (!nome.endsWith('.txt')) {
      nome = nome + '.txt';
    }
    
    const filePath = path.join(notesDir, nome);
    
    // Controlla se la nota esiste già
    if (fs.existsSync(filePath)) {
      console.log(`La nota '${nome}' esiste già. Scegli un altro nome.`);
      return mostraMenu();
    }
    
    // Chiedi il contenuto della nota
    rl.question('\nInserisci il contenuto della nota (premi Invio per terminare):\n', (contenuto) => {
      try {
        fs.writeFileSync(filePath, contenuto);
        console.log(`\nNota '${nome}' creata con successo!`);
      } catch (err) {
        console.error('Errore nella creazione della nota:', err);
      }
      
      mostraMenu();
    });
  });
}

// Funzione 4: Aggiorna nota
function aggiornaNota() {
  const files = fs.readdirSync(notesDir)
    .filter(file => path.extname(file) === '.txt');
  
  if (files.length === 0) {
    console.log('\nNessuna nota da aggiornare.');
    return mostraMenu();
  }
  
  console.log('\nNote disponibili:');
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  rl.question('\nSeleziona il numero della nota da aggiornare: ', (risposta) => {
    const indice = parseInt(risposta) - 1;
    
    if (indice >= 0 && indice < files.length) {
      const filePath = path.join(notesDir, files[indice]);
      
      // Leggi il contenuto attuale
      try {
        const contenutoAttuale = fs.readFileSync(filePath, 'utf8');
        console.log('\n=== CONTENUTO ATTUALE ===');
        console.log(contenutoAttuale);
        console.log('-------------------------');
        
        // Chiedi il nuovo contenuto
        rl.question('\nInserisci il nuovo contenuto (premi Invio per terminare):\n', (nuovoContenuto) => {
          try {
            // Opzioni di aggiornamento
            console.log('\nCome vuoi aggiornare la nota?');
            console.log('1. Sostituisci completamente');
            console.log('2. Aggiungi in fondo');
            
            rl.question('Scegli un\'opzione: ', (opzione) => {
              try {
                if (opzione === '1') {
                  // Sostituzione completa
                  fs.writeFileSync(filePath, nuovoContenuto);
                } else if (opzione === '2') {
                  // Aggiunta in fondo
                  fs.appendFileSync(filePath, '\n' + nuovoContenuto);
                } else {
                  console.log('Opzione non valida. Nessuna modifica effettuata.');
                  return mostraMenu();
                }
                
                console.log(`\nNota '${files[indice]}' aggiornata con successo!`);
              } catch (err) {
                console.error('Errore nell\'aggiornamento della nota:', err);
              }
              
              mostraMenu();
            });
          } catch (err) {
            console.error('Errore nell\'aggiornamento della nota:', err);
            mostraMenu();
          }
        });
      } catch (err) {
        console.error('Errore nella lettura della nota:', err);
        mostraMenu();
      }
    } else {
      console.log('Selezione non valida.');
      mostraMenu();
    }
  });
}

// Funzione 5: Elimina nota
function eliminaNota() {
  const files = fs.readdirSync(notesDir)
    .filter(file => path.extname(file) === '.txt');
  
  if (files.length === 0) {
    console.log('\nNessuna nota da eliminare.');
    return mostraMenu();
  }
  
  console.log('\nNote disponibili:');
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });
  
  rl.question('\nSeleziona il numero della nota da eliminare: ', (risposta) => {
    const indice = parseInt(risposta) - 1;
    
    if (indice >= 0 && indice < files.length) {
      const filePath = path.join(notesDir, files[indice]);
      
      // Chiedi conferma
      rl.question(`\nSei sicuro di voler eliminare la nota '${files[indice]}'? (s/n): `, (conferma) => {
        if (conferma.toLowerCase() === 's') {
          try {
            fs.unlinkSync(filePath);
            console.log(`\nNota '${files[indice]}' eliminata con successo!`);
          } catch (err) {
            console.error('Errore nell\'eliminazione della nota:', err);
          }
        } else {
          console.log('Eliminazione annullata.');
        }
        
        mostraMenu();
      });
    } else {
      console.log('Selezione non valida.');
      mostraMenu();
    }
  });
}

// Avvio dell'applicazione
console.log('Benvenuto nel Gestore Note!');
mostraMenu();
```

## Risorse Aggiuntive
- [Documentazione ufficiale del modulo fs](https://nodejs.org/api/fs.html)
- [Guida ai file system in Node.js](https://nodejs.dev/learn/the-nodejs-fs-module)
- [Lavorare con gli stream in Node.js](https://nodejs.dev/learn/nodejs-streams)
- [Best practices per le operazioni su file in Node.js](https://blog.risingstack.com/mastering-the-nodejs-core-modules-file-system-fs-module/)

## Navigazione

- [Indice del Corso](../README.md)
- Modulo Precedente: [Moduli Core](../02-ModuliCore/README.md)
- Modulo Successivo: [Moduli Personalizzati](../04-ModuliPersonalizzati/README.md)