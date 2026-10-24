// url-demo.js
const url = require('url');

// Analisi di un URL
const indirizzo = 'http://example.com:8080/path/to/page?query=string&name=value#anchor';
const parsedUrl = new URL(indirizzo);

console.log('Host:', parsedUrl.host);
console.log('Pathname:', parsedUrl.pathname);
console.log('Search:', parsedUrl.search);
console.log('Parametri di ricerca:', parsedUrl.searchParams.get('query'));
console.log('Hash:', parsedUrl.hash);

// Creazione di un URL
const newUrl = new URL('https://example.org');
newUrl.pathname = '/products';
newUrl.search = '?category=electronics';
console.log('URL costruito:', newUrl.href);
