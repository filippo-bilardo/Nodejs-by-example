/**
 * Esempio 06: RESTful API
 * 
 * API REST completa per gestione utenti (CRUD).
 * Dimostra:
 * - GET (lista e dettaglio)
 * - POST (creazione)
 * - PUT (aggiornamento completo)
 * - PATCH (aggiornamento parziale)
 * - DELETE (eliminazione)
 * - Validazione input
 * - Codici di stato HTTP appropriati
 * 
 * Esecuzione: node app.js
 */

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Database simulato (in memoria)
let users = [
    { id: 1, name: 'Mario Rossi', email: 'mario@example.com', age: 30 },
    { id: 2, name: 'Lucia Verdi', email: 'lucia@example.com', age: 25 },
    { id: 3, name: 'Giovanni Bianchi', email: 'giovanni@example.com', age: 35 }
];

let nextId = 4;

// Middleware di logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// ============================================
// ROUTES
// ============================================

// Homepage con documentazione API
app.get('/', (req, res) => {
    res.json({
        message: 'API REST Utenti',
        endpoints: {
            'GET /api/users': 'Lista tutti gli utenti',
            'GET /api/users/:id': 'Dettaglio utente',
            'POST /api/users': 'Crea nuovo utente',
            'PUT /api/users/:id': 'Aggiorna utente (completo)',
            'PATCH /api/users/:id': 'Aggiorna utente (parziale)',
            'DELETE /api/users/:id': 'Elimina utente'
        },
        totalUsers: users.length
    });
});

// GET - Lista tutti gli utenti
app.get('/api/users', (req, res) => {
    // Query string per paginazione e filtri
    const { page = 1, limit = 10, search } = req.query;
    
    let filteredUsers = users;
    
    // Filtro per nome (se presente)
    if (search) {
        filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    // Paginazione
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredUsers.length,
        data: paginatedUsers
    });
});

// GET - Dettaglio utente specifico
app.get('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.id === id);
    
    if (!user) {
        return res.status(404).json({ 
            error: 'Utente non trovato',
            id: id
        });
    }
    
    res.json(user);
});

// POST - Crea nuovo utente
app.post('/api/users', (req, res) => {
    const { name, email, age } = req.body;
    
    // Validazione
    const errors = [];
    
    if (!name || name.trim().length < 2) {
        errors.push('Nome deve essere almeno 2 caratteri');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Email non valida');
    }
    
    // Verifica email duplicata
    if (users.find(u => u.email === email)) {
        errors.push('Email già registrata');
    }
    
    if (age !== undefined && (age < 0 || age > 120)) {
        errors.push('Età non valida');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }
    
    // Crea utente
    const newUser = {
        id: nextId++,
        name: name.trim(),
        email: email.toLowerCase(),
        age: age || null
    };
    
    users.push(newUser);
    
    res.status(201).json({
        message: 'Utente creato con successo',
        user: newUser
    });
});

// PUT - Aggiornamento completo utente
app.put('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    const { name, email, age } = req.body;
    
    // Validazione (stesso di POST)
    const errors = [];
    
    if (!name || name.trim().length < 2) {
        errors.push('Nome deve essere almeno 2 caratteri');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Email non valida');
    }
    
    // Verifica email duplicata (escluso utente corrente)
    const duplicateEmail = users.find(u => u.email === email && u.id !== id);
    if (duplicateEmail) {
        errors.push('Email già utilizzata da altro utente');
    }
    
    if (age !== undefined && (age < 0 || age > 120)) {
        errors.push('Età non valida');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }
    
    // Aggiorna utente
    users[userIndex] = {
        id: id,
        name: name.trim(),
        email: email.toLowerCase(),
        age: age || null
    };
    
    res.json({
        message: 'Utente aggiornato',
        user: users[userIndex]
    });
});

// PATCH - Aggiornamento parziale utente
app.patch('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    const updates = {};
    const errors = [];
    
    // Valida solo i campi forniti
    if (req.body.name !== undefined) {
        if (req.body.name.trim().length < 2) {
            errors.push('Nome deve essere almeno 2 caratteri');
        } else {
            updates.name = req.body.name.trim();
        }
    }
    
    if (req.body.email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            errors.push('Email non valida');
        } else {
            const duplicateEmail = users.find(u => 
                u.email === req.body.email && u.id !== id
            );
            if (duplicateEmail) {
                errors.push('Email già utilizzata');
            } else {
                updates.email = req.body.email.toLowerCase();
            }
        }
    }
    
    if (req.body.age !== undefined) {
        if (req.body.age < 0 || req.body.age > 120) {
            errors.push('Età non valida');
        } else {
            updates.age = req.body.age;
        }
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }
    
    // Applica aggiornamenti parziali
    users[userIndex] = { ...users[userIndex], ...updates };
    
    res.json({
        message: 'Utente modificato',
        user: users[userIndex]
    });
});

// DELETE - Elimina utente
app.delete('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    
    res.json({
        message: 'Utente eliminato',
        user: deletedUser
    });
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint non trovato',
        path: req.url
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Errore interno del server',
        message: err.message
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`✓ API REST avviata su http://localhost:${PORT}`);
    console.log('\nEsempi di richieste:\n');
    console.log('1. Lista utenti:');
    console.log('   curl http://localhost:3000/api/users\n');
    console.log('2. Cerca utenti:');
    console.log('   curl "http://localhost:3000/api/users?search=mario"\n');
    console.log('3. Dettaglio utente:');
    console.log('   curl http://localhost:3000/api/users/1\n');
    console.log('4. Crea utente:');
    console.log('   curl -X POST http://localhost:3000/api/users \\');
    console.log('        -H "Content-Type: application/json" \\');
    console.log('        -d \'{"name":"Anna Neri","email":"anna@test.com","age":28}\'\n');
    console.log('5. Aggiorna utente:');
    console.log('   curl -X PUT http://localhost:3000/api/users/1 \\');
    console.log('        -H "Content-Type: application/json" \\');
    console.log('        -d \'{"name":"Mario Rossi","email":"mario.rossi@test.com","age":31}\'\n');
    console.log('6. Aggiorna parziale:');
    console.log('   curl -X PATCH http://localhost:3000/api/users/1 \\');
    console.log('        -H "Content-Type: application/json" \\');
    console.log('        -d \'{"age":32}\'\n');
    console.log('7. Elimina utente:');
    console.log('   curl -X DELETE http://localhost:3000/api/users/1\n');
});
