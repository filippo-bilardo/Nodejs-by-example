/**
 * Esempio 03: Middleware
 * 
 * Dimostra:
 * - Middleware personalizzati
 * - Application-level middleware
 * - Route-specific middleware
 * - Error handling middleware
 * 
 * Esecuzione: node app.js
 */

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// ============================================
// 1. MIDDLEWARE DI LOGGING
// ============================================

const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    
    console.log(`[${timestamp}] ${method} ${url}`);
    
    // Misura tempo di risposta
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`  → ${res.statusCode} (${duration}ms)`);
    });
    
    next(); // IMPORTANTE: chiama next() per continuare
};

app.use(logger);

// ============================================
// 2. MIDDLEWARE DI AUTENTICAZIONE
// ============================================

const requireAuth = (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Autenticazione richiesta',
            hint: 'Usa header: Authorization: Bearer YOUR_TOKEN'
        });
    }
    
    // Simula validazione token
    if (token === 'Bearer valid-token') {
        req.user = { id: 1, name: 'Mario', role: 'admin' };
        next();
    } else {
        res.status(403).json({ error: 'Token non valido' });
    }
};

// ============================================
// 3. MIDDLEWARE DI VALIDAZIONE
// ============================================

const validateUser = (req, res, next) => {
    const { name, email } = req.body;
    const errors = [];
    
    if (!name || name.length < 2) {
        errors.push('Nome deve essere almeno 2 caratteri');
    }
    
    if (!email || !email.includes('@')) {
        errors.push('Email non valida');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ errors: errors });
    }
    
    next();
};

// ============================================
// 4. MIDDLEWARE PER AGGIUNGERE HEADER
// ============================================

const addCustomHeaders = (req, res, next) => {
    res.setHeader('X-Powered-By', 'My Express App');
    res.setHeader('X-Request-ID', Math.random().toString(36).substr(2, 9));
    next();
};

app.use(addCustomHeaders);

// ============================================
// 5. MIDDLEWARE PER CONTROLLO ROLE
// ============================================

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non autenticato' });
        }
        
        if (req.user.role !== role) {
            return res.status(403).json({ 
                error: 'Permesso negato',
                required: role,
                current: req.user.role
            });
        }
        
        next();
    };
};

// ============================================
// ROUTES
// ============================================

// Route pubblica (no middleware)
app.get('/', (req, res) => {
    res.send(`
        <h1>Esempi di Middleware</h1>
        <h2>Endpoint disponibili:</h2>
        <ul>
            <li>GET / - Pubblica (questa pagina)</li>
            <li>GET /profile - Richiede autenticazione</li>
            <li>GET /admin - Richiede autenticazione + role admin</li>
            <li>POST /api/users - Validazione input</li>
            <li>GET /error - Genera errore</li>
        </ul>
        <p>Usa <code>Authorization: Bearer valid-token</code> per autenticarti</p>
    `);
});

// Route protetta (con middleware di auth)
app.get('/profile', requireAuth, (req, res) => {
    res.json({
        message: 'Profilo utente',
        user: req.user
    });
});

// Route protetta con controllo role
app.get('/admin', requireAuth, requireRole('admin'), (req, res) => {
    res.json({
        message: 'Pannello admin',
        user: req.user
    });
});

// Route con validazione
app.post('/api/users', validateUser, (req, res) => {
    res.status(201).json({
        message: 'Utente creato',
        user: req.body
    });
});

// Route che genera errore
app.get('/error', (req, res, next) => {
    const error = new Error('Questo è un errore simulato');
    error.status = 500;
    next(error); // Passa al error handler
});

// ============================================
// ERROR HANDLING MIDDLEWARE (deve essere ultimo)
// ============================================

app.use((err, req, res, next) => {
    console.error('Error caught:', err.message);
    
    res.status(err.status || 500).json({
        error: 'Qualcosa è andato storto!',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
    res.status(404).json({
        error: 'Route non trovata',
        path: req.url
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`✓ Server avviato su http://localhost:${PORT}`);
    console.log('\nEsempi di richieste:');
    console.log('\n1. Route pubblica:');
    console.log('   curl http://localhost:3000/');
    console.log('\n2. Route protetta (senza token):');
    console.log('   curl http://localhost:3000/profile');
    console.log('\n3. Route protetta (con token):');
    console.log('   curl http://localhost:3000/profile -H "Authorization: Bearer valid-token"');
    console.log('\n4. Validazione:');
    console.log('   curl -X POST http://localhost:3000/api/users \\');
    console.log('        -H "Content-Type: application/json" \\');
    console.log('        -d \'{"name":"Mario","email":"mario@test.com"}\'');
});
