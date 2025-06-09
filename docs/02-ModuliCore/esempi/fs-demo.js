// fs-demo.js
const fs = require('fs');
const path = require('path');

// Percorso del file di esempio
const filePath = path.join(__dirname, 'esempio.txt');

// Scrittura sincrona su file
console.log('\n--- Scrittura sincrona ---');
try {
  fs.writeFileSync(filePath, 'Questo è un test di scrittura sincrona.\n');
  console.log('File scritto con successo (sincrono)');
} catch (err) {
  console.error('Errore nella scrittura sincrona:', err);
}

// Lettura sincrona da file
console.log('\n--- Lettura sincrona ---');
try {
  const data = fs.readFileSync(filePath, 'utf8');
  console.log('Contenuto del file (sincrono):', data);
} catch (err) {
  console.error('Errore nella lettura sincrona:', err);
}

// Scrittura asincrona su file
console.log('\n--- Scrittura asincrona ---');
fs.writeFile(filePath, 'Questo è un test di scrittura asincrona.\n', (err) => {
  if (err) {
    console.error('Errore nella scrittura asincrona:', err);
    return;
  }
  console.log('File scritto con successo (asincrono)');
  
  // Lettura asincrona da file (all'interno del callback per garantire l'ordine)
  console.log('\n--- Lettura asincrona ---');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Errore nella lettura asincrona:', err);
      return;
    }
    console.log('Contenuto del file (asincrono):', data);
  });
});

// Informazioni sul file
console.log('\n--- Informazioni sul file ---');
fs.stat(filePath, (err, stats) => {
  if (err) {
    console.error('Errore nel recupero delle informazioni:', err);
    return;
  }
  console.log('È un file?', stats.isFile());
  console.log('È una directory?', stats.isDirectory());
  console.log('Dimensione:', stats.size, 'bytes');
  console.log('Data di creazione:', stats.birthtime);
  console.log('Data ultima modifica:', stats.mtime);
});

// Operazioni su directory
console.log('\n--- Operazioni su directory ---');
const dirPath = path.join(__dirname, 'nuova-directory');

// Creazione directory
if (!fs.existsSync(dirPath)) {
  fs.mkdir(dirPath, (err) => {
    if (err) {
      console.error('Errore nella creazione della directory:', err);
      return;
    }
    console.log('Directory creata con successo');
    
    // Lettura contenuto directory
    fs.readdir(__dirname, (err, files) => {
      if (err) {
        console.error('Errore nella lettura della directory:', err);
        return;
      }
      console.log('Contenuto della directory corrente:', files);
    });
  });
} else {
  console.log('La directory esiste già');
  
  // Lettura contenuto directory
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      console.error('Errore nella lettura della directory:', err);
      return;
    }
    console.log('Contenuto della directory corrente:', files);
  });
}

// Utilizzo delle promises con fs (Node.js >= 10)
console.log('\n--- Utilizzo delle promises ---');
const fsPromises = fs.promises;

async function operazioniFileAsync() {
  try {
    // Scrittura file con promises
    await fsPromises.writeFile(path.join(__dirname, 'promise-esempio.txt'), 'Test con promises');
    console.log('File scritto con promises');
    
    // Lettura file con promises
    const contenuto = await fsPromises.readFile(path.join(__dirname, 'promise-esempio.txt'), 'utf8');
    console.log('Contenuto letto con promises:', contenuto);
  } catch (err) {
    console.error('Errore nelle operazioni con promises:', err);
  }
}

operazioniFileAsync();