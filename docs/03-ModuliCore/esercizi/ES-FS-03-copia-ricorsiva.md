# ES-FS-03: Copia Ricorsiva di Directory

## 📋 Informazioni Generali

- **Modulo**: File System (fs)
- **Difficoltà**: 🟡 Medio
- **Tempo stimato**: 45 minuti
- **Prerequisiti**: 
  - Completamento ES-FS-01 e ES-FS-02
  - Comprensione della ricorsione
  - Conoscenza di `fs.stat()` per distinguere file/directory

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Leggere il contenuto di directory con `fs.readdir()`
2. Distinguere tra file e directory usando `fs.stat()`
3. Creare directory con `fs.mkdir()`
4. Copiare file con `fs.copyFile()`
5. Implementare algoritmi ricorsivi per navigare strutture ad albero
6. Gestire percorsi con il modulo `path`

## 📝 Descrizione

Crea una funzione che copia ricorsivamente una directory e tutto il suo contenuto (file e sottodirectory) in una nuova posizione. Questa è un'operazione comune in molte applicazioni che gestiscono file.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-fs-03`
- [ ] Crea struttura di test:
  ```
  test-source/
    ├── file1.txt
    ├── file2.txt
    └── subfolder/
        ├── file3.txt
        └── nested/
            └── file4.txt
  ```

### 2. Funzione Base
- [ ] Crea funzione `copyDirectory(source, destination, callback)`
- [ ] Verifica che source esista
- [ ] Crea la directory di destinazione
- [ ] Leggi il contenuto della directory sorgente

### 3. Logica Ricorsiva
- [ ] Per ogni elemento nella directory:
  - Se è un file → copialo
  - Se è una directory → chiamata ricorsiva
- [ ] Gestisci errori a ogni livello

### 4. Testing
- [ ] Testa con directory semplice (solo file)
- [ ] Testa con directory nidificate
- [ ] Verifica che tutti i file siano stati copiati
- [ ] Testa gestione errori

## 💡 Template di Partenza

```javascript
// index.js
const fs = require('fs');
const path = require('path');

/**
 * Copia ricorsivamente una directory
 * @param {string} source - Directory sorgente
 * @param {string} destination - Directory destinazione
 * @param {function} callback - Callback(err)
 */
function copyDirectory(source, destination, callback) {
  // TODO: Implementa la copia ricorsiva
  
  // Step 1: Crea la directory di destinazione
  // Step 2: Leggi il contenuto della sorgente
  // Step 3: Per ogni elemento:
  //   - Determina se è file o directory
  //   - Copia file o ricorri per directory
}

// Test
const source = './test-source';
const dest = './test-destination';

copyDirectory(source, dest, (err) => {
  if (err) {
    console.error('Errore durante la copia:', err);
    return;
  }
  console.log('Copia completata con successo!');
});
```

## 📚 Concetti Chiave

### fs.stat() - Informazioni su File/Directory
```javascript
fs.stat(path, (err, stats) => {
  if (stats.isFile()) {
    // È un file
  } else if (stats.isDirectory()) {
    // È una directory
  }
});
```

### fs.readdir() - Leggere Contenuto Directory
```javascript
fs.readdir(dirPath, (err, files) => {
  // files è un array di nomi (stringhe)
});
```

### path.join() - Costruire Percorsi
```javascript
const fullPath = path.join('/home', 'user', 'file.txt');
// Result: '/home/user/file.txt' (con separatori corretti per l'OS)
```

## 🔍 Step by Step

### Step 1: Struttura base con mkdir
```javascript
function copyDirectory(source, destination, callback) {
  // Crea directory destinazione
  fs.mkdir(destination, { recursive: true }, (err) => {
    if (err) return callback(err);
    
    // Continua con la lettura...
  });
}
```

### Step 2: Leggi contenuto directory
```javascript
function copyDirectory(source, destination, callback) {
  fs.mkdir(destination, { recursive: true }, (err) => {
    if (err) return callback(err);
    
    fs.readdir(source, (err, items) => {
      if (err) return callback(err);
      
      // Processa items...
    });
  });
}
```

### Step 3: Processa ogni elemento
```javascript
function copyDirectory(source, destination, callback) {
  fs.mkdir(destination, { recursive: true }, (err) => {
    if (err) return callback(err);
    
    fs.readdir(source, (err, items) => {
      if (err) return callback(err);
      
      if (items.length === 0) {
        return callback(null);
      }
      
      let pending = items.length;
      let hasError = false;
      
      items.forEach(item => {
        const sourcePath = path.join(source, item);
        const destPath = path.join(destination, item);
        
        fs.stat(sourcePath, (err, stats) => {
          if (err || hasError) {
            if (!hasError) {
              hasError = true;
              return callback(err);
            }
            return;
          }
          
          if (stats.isFile()) {
            // Copia file
            fs.copyFile(sourcePath, destPath, (err) => {
              if (err && !hasError) {
                hasError = true;
                return callback(err);
              }
              
              if (--pending === 0) {
                callback(null);
              }
            });
          } else if (stats.isDirectory()) {
            // Ricorsione per directory
            copyDirectory(sourcePath, destPath, (err) => {
              if (err && !hasError) {
                hasError = true;
                return callback(err);
              }
              
              if (--pending === 0) {
                callback(null);
              }
            });
          }
        });
      });
    });
  });
}
```

## 🎓 Suggerimenti

1. **path.join()**: Usa sempre `path.join()` per costruire percorsi, garantisce compatibilità cross-platform
2. **{ recursive: true }**: Usa questa opzione con `mkdir` per creare directory parent se non esistono
3. **Callback hell**: Questa è una situazione dove le Promise o async/await semplificano molto il codice
4. **Contatore pending**: Tieni traccia delle operazioni asincrone pendenti per sapere quando tutto è completato
5. **hasError flag**: Previene multiple chiamate alla callback quando si verificano errori

## ✅ Criteri di Valutazione

- [ ] La directory di destinazione viene creata correttamente
- [ ] Tutti i file sono copiati
- [ ] Le sottodirectory sono create e popolate
- [ ] La struttura delle directory è preservata
- [ ] Gli errori sono gestiti appropriatamente
- [ ] Non ci sono memory leak o callback multiple

## 🚀 Sfide Extra (Opzionali)

1. **Progress tracking**: Mostra progresso (es. "Copiati 5/20 file")
2. **Filtri**: Aggiungi opzione per escludere certi file (es. .gitignore pattern)
3. **Overwrite policy**: Aggiungi opzione per sovrascrivere o saltare file esistenti
4. **Permissions**: Preserva i permessi dei file originali
5. **Timestamps**: Preserva date di modifica/creazione
6. **Promise version**: Riscrivi usando `fs.promises` con async/await
7. **Streaming**: Per file grandi, usa stream invece di `copyFile()`

## 📖 Esempio di Test

```javascript
// create-test-structure.js
const fs = require('fs');
const path = require('path');

// Crea struttura di test
const structure = {
  'test-source': {
    'file1.txt': 'Contenuto file 1',
    'file2.txt': 'Contenuto file 2',
    'subfolder': {
      'file3.txt': 'Contenuto file 3',
      'nested': {
        'file4.txt': 'Contenuto file 4'
      }
    }
  }
};

function createStructure(base, struct) {
  Object.keys(struct).forEach(key => {
    const fullPath = path.join(base, key);
    const value = struct[key];
    
    if (typeof value === 'string') {
      // È un file
      fs.writeFileSync(fullPath, value);
    } else {
      // È una directory
      fs.mkdirSync(fullPath, { recursive: true });
      createStructure(fullPath, value);
    }
  });
}

createStructure('.', structure);
console.log('Struttura di test creata!');
```

## 🐛 Problemi Comuni

### Directory di destinazione esiste già
**Causa**: `mkdir` fallisce se la directory esiste  
**Soluzione**: Usa opzione `{ recursive: true }`

### Callback chiamata multiple volte
**Causa**: Non usi il flag `hasError`  
**Soluzione**: Implementa il pattern hasError per evitare callback multiple

### Non aspetta il completamento delle subdirectory
**Causa**: Non gestisci il contatore `pending` correttamente  
**Soluzione**: Incrementa pending per ogni operazione, decrementa al completamento

### Errore ENOENT
**Causa**: Percorsi costruiti male  
**Soluzione**: Usa sempre `path.join()` per costruire i percorsi

## 📖 Risorse Utili

- [fs.readdir() documentation](https://nodejs.org/api/fs.html#fsreaddirpath-options-callback)
- [fs.stat() documentation](https://nodejs.org/api/fs.html#fsstatpath-options-callback)
- [fs.copyFile() documentation](https://nodejs.org/api/fs.html#fscopyfilesrc-dest-mode-callback)
- [path module documentation](https://nodejs.org/api/path.html)
- [Understanding recursion](https://javascript.info/recursion)
