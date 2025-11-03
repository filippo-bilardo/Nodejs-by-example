/**
 * Esempio 04: Template Engine - EJS
 * Dimostrazione uso di EJS per pagine dinamiche HTML
 */

const express = require('express');
const app = express();
const PORT = 3000;

// Configurazione EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * DATI SIMULATI
 */
const users = [
    { id: 1, name: 'Mario Rossi', email: 'mario@example.com', role: 'admin', active: true },
    { id: 2, name: 'Laura Bianchi', email: 'laura@example.com', role: 'user', active: true },
    { id: 3, name: 'Giovanni Verdi', email: 'giovanni@example.com', role: 'user', active: false }
];

const products = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Elettronica', stock: 15 },
    { id: 2, name: 'Mouse', price: 29.99, category: 'Accessori', stock: 50 },
    { id: 3, name: 'Tastiera', price: 79.99, category: 'Accessori', stock: 0 },
    { id: 4, name: 'Monitor', price: 299.99, category: 'Elettronica', stock: 8 }
];

/**
 * HELPER FUNCTIONS (disponibili nei template)
 */
app.locals.formatDate = (date) => {
    return new Date(date).toLocaleDateString('it-IT');
};

app.locals.formatPrice = (price) => {
    return '€ ' + price.toFixed(2);
};

app.locals.capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * ROUTE 1: Home page
 * GET /
 */
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home - Esempi EJS',
        pageTitle: 'Benvenuto',
        message: 'Questa è la home page con EJS',
        currentYear: new Date().getFullYear()
    });
});

/**
 * ROUTE 2: Lista utenti
 * GET /users
 */
app.get('/users', (req, res) => {
    res.render('users/list', {
        title: 'Lista Utenti',
        users: users,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.active).length
    });
});

/**
 * ROUTE 3: Dettaglio utente
 * GET /users/:id
 */
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
        return res.render('error', {
            title: 'Errore',
            message: 'Utente non trovato',
            errorCode: 404
        });
    }

    res.render('users/detail', {
        title: `Utente: ${user.name}`,
        user: user
    });
});

/**
 * ROUTE 4: Form nuovo utente
 * GET /users/new
 */
app.get('/users/new', (req, res) => {
    res.render('users/form', {
        title: 'Nuovo Utente',
        user: null,
        errors: []
    });
});

/**
 * ROUTE 5: Crea utente
 * POST /users
 */
app.post('/users', (req, res) => {
    const errors = [];

    if (!req.body.name || req.body.name.length < 2) {
        errors.push('Nome deve essere almeno 2 caratteri');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!req.body.email || !emailRegex.test(req.body.email)) {
        errors.push('Email non valida');
    }

    if (errors.length > 0) {
        return res.render('users/form', {
            title: 'Nuovo Utente',
            user: req.body,
            errors: errors
        });
    }

    const newUser = {
        id: users.length + 1,
        name: req.body.name,
        email: req.body.email,
        role: req.body.role || 'user',
        active: req.body.active === 'on'
    };

    users.push(newUser);

    res.redirect('/users');
});

/**
 * ROUTE 6: Lista prodotti
 * GET /products
 */
app.get('/products', (req, res) => {
    let filtered = [...products];

    // Filtro per categoria
    if (req.query.category) {
        filtered = filtered.filter(p => p.category === req.query.category);
    }

    // Filtro disponibilità
    if (req.query.available === 'true') {
        filtered = filtered.filter(p => p.stock > 0);
    }

    const categories = [...new Set(products.map(p => p.category))];

    res.render('products/list', {
        title: 'Catalogo Prodotti',
        products: filtered,
        categories: categories,
        selectedCategory: req.query.category || '',
        showOnlyAvailable: req.query.available === 'true'
    });
});

/**
 * ROUTE 7: Tabella dati
 * GET /table
 */
app.get('/table', (req, res) => {
    const data = {
        columns: ['ID', 'Nome', 'Email', 'Ruolo', 'Stato'],
        rows: users.map(u => [
            u.id,
            u.name,
            u.email,
            u.role,
            u.active ? 'Attivo' : 'Inattivo'
        ])
    };

    res.render('table', {
        title: 'Tabella Utenti',
        data: data
    });
});

/**
 * ROUTE 8: Esempio condizionali
 * GET /conditionals
 */
app.get('/conditionals', (req, res) => {
    const hour = new Date().getHours();
    let greeting;

    if (hour < 12) {
        greeting = 'Buongiorno';
    } else if (hour < 18) {
        greeting = 'Buon pomeriggio';
    } else {
        greeting = 'Buonasera';
    }

    res.render('conditionals', {
        title: 'Condizionali',
        hour: hour,
        greeting: greeting,
        isLoggedIn: true,
        username: 'Mario',
        notifications: 3
    });
});

/**
 * ROUTE 9: Esempio loops
 * GET /loops
 */
app.get('/loops', (req, res) => {
    const items = [
        { name: 'Mele', quantity: 5 },
        { name: 'Pere', quantity: 3 },
        { name: 'Banane', quantity: 8 }
    ];

    const numbers = [1, 2, 3, 4, 5];

    res.render('loops', {
        title: 'Loops',
        items: items,
        numbers: numbers,
        colors: ['rosso', 'verde', 'blu', 'giallo']
    });
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
    console.log(`✅ Server EJS su http://localhost:${PORT}`);
    console.log('');
    console.log('📄 Pagine disponibili:');
    console.log(`   http://localhost:${PORT}/`);
    console.log(`   http://localhost:${PORT}/users`);
    console.log(`   http://localhost:${PORT}/users/1`);
    console.log(`   http://localhost:${PORT}/users/new`);
    console.log(`   http://localhost:${PORT}/products`);
    console.log(`   http://localhost:${PORT}/table`);
    console.log(`   http://localhost:${PORT}/conditionals`);
    console.log(`   http://localhost:${PORT}/loops`);
    console.log('');
});
