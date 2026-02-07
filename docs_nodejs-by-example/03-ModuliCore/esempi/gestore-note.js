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