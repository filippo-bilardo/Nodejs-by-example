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