/**
 * Esempio 02: Routing Base
 * 
 * Dimostra:
 * - Diversi metodi HTTP (GET, POST, PUT, DELETE)
 * - Parametri URL
 * - Query string
 * - Route con callback multiple
 * 
 * Esecuzione: node app.js
 */

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware per parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// GET - Route principale
app.get('/', (req, res) => {
    res.send(`
        <h1>Esempi di Routing</h1>
        <ul>
            <li><a href="/about">About</a></li>
            <li><a href="/users/123">User 123</a></li>
            <li><a href="/search?q=express&page=1">Search</a></li>
            <li><a href="/products/laptop/reviews">Product Reviews</a></li>
        </ul>
    `);
});

// GET - About page
app.get('/about', (req, res) => {
    res.send('<h1>About Page</h1><p>Questo è un esempio di routing in Express</p>');
});

// GET - Parametri URL
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({
        message: 'User profile',
        userId: userId,
        type: typeof userId // Sempre stringa!
    });
});

// GET - Parametri multipli
app.get('/products/:category/:id', (req, res) => {
    const { category, id } = req.params;
    res.json({
        category: category,
        productId: id
    });
});

// GET - Query string
app.get('/search', (req, res) => {
    const { q, page, limit } = req.query;
    res.json({
        query: q || 'nessuna ricerca',
        page: page || 1,
        limit: limit || 10
    });
});

// POST - Creazione risorsa
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ 
            error: 'Nome e email sono obbligatori' 
        });
    }
    
    res.status(201).json({
        message: 'Utente creato',
        user: { id: Date.now(), name, email }
    });
});

// PUT - Aggiornamento completo
app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const updates = req.body;
    
    res.json({
        message: 'Utente aggiornato',
        userId: userId,
        updates: updates
    });
});

// PATCH - Aggiornamento parziale
app.patch('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const updates = req.body;
    
    res.json({
        message: 'Utente modificato (parziale)',
        userId: userId,
        updates: updates
    });
});

// DELETE - Eliminazione
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    
    res.json({
        message: 'Utente eliminato',
        userId: userId
    });
});

// Route con parametro opzionale
app.get('/books/:category/:id?', (req, res) => {
    if (req.params.id) {
        res.json({
            message: 'Libro specifico',
            category: req.params.category,
            bookId: req.params.id
        });
    } else {
        res.json({
            message: 'Tutti i libri della categoria',
            category: req.params.category
        });
    }
});

// Route con parametri regex (solo numeri)
app.get('/orders/:id(\\d+)', (req, res) => {
    res.json({
        message: 'Ordine trovato',
        orderId: req.params.id
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route non trovata',
        path: req.url,
        method: req.method
    });
});

// Avvia server
app.listen(PORT, () => {
    console.log(`✓ Server avviato su http://localhost:${PORT}`);
    console.log('\nProva questi endpoint:');
    console.log('- GET  http://localhost:3000/');
    console.log('- GET  http://localhost:3000/users/123');
    console.log('- GET  http://localhost:3000/search?q=test&page=2');
    console.log('- POST http://localhost:3000/api/users');
    console.log('       Body: {"name":"Mario","email":"mario@test.com"}');
});
