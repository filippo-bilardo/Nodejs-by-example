// os-demo.js
const os = require('os');

// Informazioni sulla piattaforma
console.log('Sistema operativo:', os.platform());
console.log('Architettura:', os.arch());
console.log('Versione:', os.version());

// Informazioni sulla CPU
console.log('CPU:', os.cpus().length, 'core');
console.log('Tipo CPU:', os.cpus()[0].model);

// Informazioni sulla memoria
console.log('Memoria totale:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('Memoria libera:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');

// Informazioni utente
console.log('Utente corrente:', os.userInfo().username);
console.log('Home directory:', os.homedir());
console.log('Directory temporanea:', os.tmpdir());
