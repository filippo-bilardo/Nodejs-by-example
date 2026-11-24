// Esempio di gestione degli errori in una callback Node.js

const fs = require('fs');

fs.readFile('file.txt', 'utf8', function(err, data) {
    // SEMPRE controllare l'errore per primo
    if (err) {
        console.error('Errore lettura file:', err.message);
        return; // Importante: uscire se c'è un errore
    }
    
    // Usa il risultato solo se non ci sono errori
    console.log('Contenuto:', data);
});

// Output se file.txt non esiste:
// Errore lettura file: ENOENT: no such file or directory, open 'file.txt'

// Output se file.txt esiste e contiene "Ciao Mondo":
// Contenuto: Ciao Mondo

// Questo pattern "err-first" è fondamentale in Node.js per gestire errori in modo asincrono.
// Non gestire l'errore può portare a comportamenti imprevisti o crash dell'applicazione.
// Evitare di lanciare eccezioni in callback asincrone; usare sempre il primo argomento per l'errore.
// Per operazioni più moderne, considerare l'uso di Promises o async/await per una gestione degli errori più pulita.
