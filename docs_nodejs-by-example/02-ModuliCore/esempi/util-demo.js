// util-demo.js
const util = require('util');
const fs = require('fs');

// Deprecazione
util.deprecate(() => {
  console.log('Questa funzione è deprecata');
}, 'Usare la nuova funzione invece')(1, 2, 3);

// Promisify: convertire callback in promises
const readFile = util.promisify(fs.readFile);

// Utilizzare la versione promisified
readFile(__filename, 'utf8')
  .then(data => console.log('File letto con successo'))
  .catch(err => console.error('Errore nella lettura:', err));

// Formattazione di stringhe
console.log(util.format('La %s è %d. Oggetto: %j', 'risposta', 42, { hello: 'world' }));

// Ispezione di oggetti
const obj = { 
  name: 'Node.js', 
  versions: process.versions, 
  env: process.env 
};
console.log(util.inspect(obj, { depth: 1, colors: true }));