// path-demo.js
const path = require('path');

// Informazioni sul file corrente
console.log('Nome del file:', path.basename(__filename));
console.log('Directory:', path.dirname(__filename));
console.log('Estensione:', path.extname(__filename));

// Creazione di un percorso
const nuovoPercorso = path.join(__dirname, 'files', 'esempio.txt');
console.log('Nuovo percorso:', nuovoPercorso);

// Normalizzazione percorsi
console.log('Percorso normalizzato:', path.normalize('/test/test1//2slashes/1slash/tab/..'));

// Percorsi assoluti vs relativi
console.log('Risoluzione percorso:', path.resolve('temp', 'file.txt'));
