/**
 * Esercizio 01: Server Base con Route Multiple
 * Soluzione completa
 */

const express = require('express');
const app = express();
const PORT = 3000;

// Statistiche server (bonus)
let requestCount = 0;

/**
 * MIDDLEWARE: Logger
 * Logga ogni richiesta con timestamp, metodo, URL e User-Agent
 */
app.use((req, res, next) => {
    requestCount++;
    const timestamp = new Date().toISOString();
    const userAgent = req.get('User-Agent') || 'Unknown';
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${userAgent}`);
    next();
});

/**
 * ROUTE 1: Home page
 * GET /
 * Restituisce HTML con lista di link
 */
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
            <meta charset="UTF-8">
            <title>Server Base</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                }
                h1 { color: #333; }
                ul { list-style: none; padding: 0; }
                li { margin: 10px 0; }
                a { 
                    color: #0066cc; 
                    text-decoration: none;
                    font-size: 18px;
                }
                a:hover { text-decoration: underline; }
                .info {
                    background: #f0f0f0;
                    padding: 15px;
                    border-radius: 5px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>🚀 Benvenuto nel Server Express</h1>
            <p>Questo è un server base con route multiple.</p>
            
            <h2>📍 Pagine Disponibili:</h2>
            <ul>
                <li>🏠 <a href="/">Home</a> - Questa pagina</li>
                <li>ℹ️ <a href="/about">About</a> - Informazioni applicazione</li>
                <li>📧 <a href="/contact">Contact</a> - Contatti</li>
                <li>👤 <a href="/users/123">User Profile</a> - Esempio parametro</li>
                <li>📝 <a href="/posts/2024/11/hello-world">Post Example</a></li>
                <li>🔍 <a href="/search?q=express&page=1&limit=10">Search</a></li>
                <li>📊 <a href="/stats">Server Stats</a> (Bonus)</li>
                <li>🕒 <a href="/time">Current Time</a> (Bonus)</li>
            </ul>

            <div class="info">
                <h3>📡 Server Info:</h3>
                <p><strong>Node.js:</strong> ${process.version}</p>
                <p><strong>Platform:</strong> ${process.platform}</p>
                <p><strong>Port:</strong> ${PORT}</p>
            </div>
        </body>
        </html>
    `);
});

/**
 * ROUTE 2: About page
 * GET /about
 * Restituisce informazioni sull'applicazione
 */
app.get('/about', (req, res) => {
    res.json({
        application: 'Server Base Express',
        version: '1.0.0',
        author: 'Studente',
        description: 'Server Express con route multiple, parametri e query string',
        features: [
            'Route base (/, /about, /contact)',
            'Parametri URL',
            'Query string handling',
            'Middleware logging',
            '404 error handling'
        ],
        created: '2024-11-01',
        repository: 'https://github.com/example/express-base'
    });
});

/**
 * ROUTE 3: Contact page
 * GET /contact
 * Restituisce informazioni di contatto in JSON
 */
app.get('/contact', (req, res) => {
    res.json({
        email: 'info@example.com',
        phone: '+39 123 456 7890',
        address: 'Via Roma 1, 20100 Milano, Italia',
        social: {
            twitter: '@example',
            linkedin: 'company/example',
            github: 'example'
        },
        openingHours: {
            monday: '09:00 - 18:00',
            tuesday: '09:00 - 18:00',
            wednesday: '09:00 - 18:00',
            thursday: '09:00 - 18:00',
            friday: '09:00 - 18:00',
            weekend: 'Chiuso'
        }
    });
});

/**
 * ROUTE 4: User profile
 * GET /users/:id
 * Parametro: id (deve essere un numero)
 */
app.get('/users/:id', (req, res) => {
    // Validazione: id deve essere un numero
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id < 1) {
        return res.status(400).json({
            error: 'ID non valido',
            message: 'L\'ID deve essere un numero positivo',
            received: req.params.id
        });
    }

    // Simula dati utente
    res.json({
        userId: id,
        message: 'User profile',
        user: {
            id: id,
            name: `User ${id}`,
            email: `user${id}@example.com`,
            role: id === 1 ? 'admin' : 'user',
            active: true,
            registeredAt: '2024-01-15'
        }
    });
});

/**
 * ROUTE 5: Post con parametri multipli
 * GET /posts/:year/:month/:slug
 * Parametri: anno, mese, slug dell'articolo
 */
app.get('/posts/:year/:month/:slug', (req, res) => {
    const { year, month, slug } = req.params;

    // Validazione anno e mese
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({
            error: 'Anno non valido (2000-2100)'
        });
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
            error: 'Mese non valido (1-12)'
        });
    }

    res.json({
        post: {
            year: yearNum,
            month: monthNum,
            slug: slug,
            title: slug.split('-').map(w => 
                w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' '),
            url: `/posts/${year}/${month}/${slug}`,
            published: `${year}-${String(monthNum).padStart(2, '0')}-01`,
            author: 'Admin',
            categories: ['Tutorial', 'Express.js'],
            views: Math.floor(Math.random() * 1000)
        }
    });
});

/**
 * ROUTE 6: Search con query string
 * GET /search?q=term&page=1&limit=10
 */
app.get('/search', (req, res) => {
    // Estrai query params con valori default
    const {
        q = '',
        page = 1,
        limit = 10
    } = req.query;

    // Converti a numeri
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Validazione
    if (isNaN(pageNum) || pageNum < 1) {
        return res.status(400).json({
            error: 'Page deve essere >= 1'
        });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
            error: 'Limit deve essere tra 1 e 100'
        });
    }

    // Simula risultati
    const totalResults = q ? Math.floor(Math.random() * 100) : 0;
    const totalPages = Math.ceil(totalResults / limitNum);

    res.json({
        query: q,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalResults,
            totalPages: totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
        },
        results: q ? Array.from({ length: Math.min(limitNum, 5) }, (_, i) => ({
            id: (pageNum - 1) * limitNum + i + 1,
            title: `Risultato ${i + 1} per "${q}"`,
            description: `Descrizione del risultato che contiene "${q}"`,
            url: `/results/${i + 1}`
        })) : [],
        suggestions: q.length > 0 ? [
            q + ' tutorial',
            q + ' esempio',
            q + ' guida'
        ] : []
    });
});

/**
 * BONUS 1: Statistiche server
 * GET /stats
 */
app.get('/stats', (req, res) => {
    res.json({
        server: 'Express Server',
        uptime: process.uptime(),
        uptimeFormatted: formatUptime(process.uptime()),
        requests: {
            total: requestCount,
            current: 1
        },
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * BONUS 2: Ora corrente
 * GET /time?tz=Europe/Rome
 */
app.get('/time', (req, res) => {
    const timezone = req.query.tz || 'UTC';
    
    try {
        const now = new Date();
        res.json({
            timestamp: now.toISOString(),
            timezone: timezone,
            formatted: now.toLocaleString('it-IT', { 
                timeZone: timezone,
                dateStyle: 'full',
                timeStyle: 'long'
            }),
            unix: Math.floor(now.getTime() / 1000),
            components: {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate(),
                hour: now.getHours(),
                minute: now.getMinutes(),
                second: now.getSeconds()
            }
        });
    } catch (error) {
        res.status(400).json({
            error: 'Timezone non valido',
            examples: ['Europe/Rome', 'America/New_York', 'Asia/Tokyo']
        });
    }
});

/**
 * BONUS 3: Calculator API
 * GET /calc/:operation/:a/:b
 */
app.get('/calc/:operation/:a/:b', (req, res) => {
    const { operation, a, b } = req.params;
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (isNaN(numA) || isNaN(numB)) {
        return res.status(400).json({
            error: 'Parametri devono essere numeri'
        });
    }

    let result;
    switch (operation) {
        case 'add':
            result = numA + numB;
            break;
        case 'sub':
            result = numA - numB;
            break;
        case 'mul':
            result = numA * numB;
            break;
        case 'div':
            if (numB === 0) {
                return res.status(400).json({
                    error: 'Divisione per zero'
                });
            }
            result = numA / numB;
            break;
        default:
            return res.status(400).json({
                error: 'Operazione non valida',
                validOperations: ['add', 'sub', 'mul', 'div']
            });
    }

    res.json({
        operation: operation,
        a: numA,
        b: numB,
        result: result,
        expression: `${numA} ${getOperatorSymbol(operation)} ${numB} = ${result}`
    });
});

/**
 * 404 HANDLER
 * Deve essere dopo tutte le route
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Route non trovata',
        path: req.url,
        method: req.method,
        message: 'La risorsa richiesta non esiste',
        availableRoutes: [
            'GET /',
            'GET /about',
            'GET /contact',
            'GET /users/:id',
            'GET /posts/:year/:month/:slug',
            'GET /search',
            'GET /stats',
            'GET /time',
            'GET /calc/:operation/:a/:b'
        ]
    });
});

/**
 * Helper function: formatta uptime
 */
function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
}

/**
 * Helper function: simbolo operatore
 */
function getOperatorSymbol(op) {
    const symbols = {
        'add': '+',
        'sub': '-',
        'mul': '×',
        'div': '÷'
    };
    return symbols[op] || op;
}

/**
 * START SERVER
 */
app.listen(PORT, () => {
    console.log(`✅ Server in ascolto su http://localhost:${PORT}`);
    console.log('');
    console.log('📍 Route disponibili:');
    console.log('   GET  /');
    console.log('   GET  /about');
    console.log('   GET  /contact');
    console.log('   GET  /users/:id');
    console.log('   GET  /posts/:year/:month/:slug');
    console.log('   GET  /search');
    console.log('   GET  /stats');
    console.log('   GET  /time');
    console.log('   GET  /calc/:operation/:a/:b');
    console.log('');
    console.log('🧪 Test con curl:');
    console.log(`   curl http://localhost:${PORT}/`);
    console.log(`   curl http://localhost:${PORT}/about`);
    console.log(`   curl http://localhost:${PORT}/users/123`);
    console.log(`   curl http://localhost:${PORT}/posts/2024/11/hello-world`);
    console.log(`   curl "http://localhost:${PORT}/search?q=express&page=2"`);
    console.log(`   curl http://localhost:${PORT}/calc/add/5/3`);
    console.log('');
});
