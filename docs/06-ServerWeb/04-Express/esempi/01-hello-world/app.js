/**
 * Esempio 01: Hello World con Express
 * 
 * Questo è l'esempio più semplice di un server Express.
 * Dimostra come:
 * - Creare un'istanza Express
 * - Definire una route GET
 * - Avviare il server
 * 
 * Esecuzione: node app.js
 * Test: http://localhost:3000
 */

const express = require('express');
const app = express();
const PORT = 3000;

// Route principale
app.get('/', (req, res) => {
    res.send('<h1>Hello World con Express!</h1>');
});

// Avvia server
app.listen(PORT, () => {
    console.log(`✓ Server in esecuzione su http://localhost:${PORT}`);
    console.log('Premi Ctrl+C per terminare');
});
