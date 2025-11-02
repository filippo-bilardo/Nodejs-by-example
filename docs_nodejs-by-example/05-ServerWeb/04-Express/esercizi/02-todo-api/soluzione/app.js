/**
 * Esercizio 02: API To-Do List
 * Soluzione completa con CRUD, validazione e filtri
 */

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware per parsing JSON
app.use(express.json());

/**
 * DATABASE IN MEMORIA
 * Array di tasks con dati iniziali
 */
let tasks = [
    {
        id: 1,
        title: "Studiare Express.js",
        completed: false,
        priority: "high",
        createdAt: new Date().toISOString(),
        dueDate: "2024-11-10"
    },
    {
        id: 2,
        title: "Fare la spesa",
        completed: true,
        priority: "medium",
        createdAt: new Date().toISOString(),
        dueDate: null
    },
    {
        id: 3,
        title: "Chiamare il dentista",
        completed: false,
        priority: "low",
        createdAt: new Date().toISOString(),
        dueDate: "2024-11-15"
    }
];

let nextId = 4;

/**
 * FUNZIONE DI VALIDAZIONE
 * Valida i campi di un task
 */
function validateTask(task, isUpdate = false) {
    const errors = [];

    // Valida title (obbligatorio per POST, opzionale per PATCH)
    if (!isUpdate || task.title !== undefined) {
        if (!task.title || task.title.trim().length < 2) {
            errors.push('Title deve essere almeno 2 caratteri');
        }
        if (task.title && task.title.length > 100) {
            errors.push('Title massimo 100 caratteri');
        }
    }

    // Valida priority
    const validPriorities = ['low', 'medium', 'high'];
    if (task.priority && !validPriorities.includes(task.priority)) {
        errors.push('Priority deve essere: low, medium, high');
    }

    // Valida dueDate (formato YYYY-MM-DD)
    if (task.dueDate !== undefined && task.dueDate !== null) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(task.dueDate)) {
            errors.push('DueDate formato non valido (YYYY-MM-DD)');
        } else {
            // Verifica che sia una data valida
            const date = new Date(task.dueDate);
            if (isNaN(date.getTime())) {
                errors.push('DueDate non è una data valida');
            }
        }
    }

    // Valida completed (se presente)
    if (task.completed !== undefined && typeof task.completed !== 'boolean') {
        errors.push('Completed deve essere true o false');
    }

    return errors;
}

/**
 * MIDDLEWARE: Logger
 */
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

/**
 * ROUTE 1: GET /api/tasks
 * Lista tutte le attività con filtri opzionali
 */
app.get('/api/tasks', (req, res) => {
    let filtered = [...tasks];

    // Filtro per completed
    if (req.query.completed !== undefined) {
        const isCompleted = req.query.completed === 'true';
        filtered = filtered.filter(t => t.completed === isCompleted);
    }

    // Filtro per priority
    if (req.query.priority) {
        filtered = filtered.filter(t => t.priority === req.query.priority);
    }

    // Search nel title (case-insensitive)
    if (req.query.search) {
        const search = req.query.search.toLowerCase();
        filtered = filtered.filter(t =>
            t.title.toLowerCase().includes(search)
        );
    }

    // Sort
    if (req.query.sort) {
        const sortField = req.query.sort;
        const order = req.query.order === 'desc' ? -1 : 1;

        filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            // Gestione valori null
            if (aVal === null) return 1;
            if (bVal === null) return -1;

            if (aVal > bVal) return order;
            if (aVal < bVal) return -order;
            return 0;
        });
    }

    res.json({
        total: filtered.length,
        data: filtered
    });
});

/**
 * ROUTE 2: GET /api/tasks/:id
 * Dettaglio singola attività
 */
app.get('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: 'ID non valido'
        });
    }

    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({
            error: 'Attività non trovata',
            id: id
        });
    }

    res.json(task);
});

/**
 * ROUTE 3: POST /api/tasks
 * Crea nuova attività
 */
app.post('/api/tasks', (req, res) => {
    // Validazione
    const errors = validateTask(req.body, false);
    
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // Crea nuovo task
    const newTask = {
        id: nextId++,
        title: req.body.title.trim(),
        completed: false,
        priority: req.body.priority || 'medium',
        createdAt: new Date().toISOString(),
        dueDate: req.body.dueDate || null
    };

    tasks.push(newTask);

    res.status(201).json({
        message: 'Attività creata',
        task: newTask
    });
});

/**
 * ROUTE 4: PUT /api/tasks/:id
 * Aggiorna attività (completo - tutti i campi obbligatori)
 */
app.put('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: 'ID non valido'
        });
    }

    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            error: 'Attività non trovata'
        });
    }

    // Validazione (tutti i campi richiesti per PUT)
    const errors = validateTask(req.body, false);

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // Aggiorna task (mantiene id e createdAt originali)
    const updatedTask = {
        id: id,
        title: req.body.title.trim(),
        completed: req.body.completed !== undefined ? req.body.completed : false,
        priority: req.body.priority || 'medium',
        createdAt: tasks[taskIndex].createdAt,
        dueDate: req.body.dueDate || null
    };

    tasks[taskIndex] = updatedTask;

    res.json({
        message: 'Attività aggiornata',
        task: updatedTask
    });
});

/**
 * ROUTE 5: PATCH /api/tasks/:id
 * Aggiorna attività (parziale - solo campi forniti)
 */
app.patch('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: 'ID non valido'
        });
    }

    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            error: 'Attività non trovata'
        });
    }

    // Validazione solo dei campi presenti
    const errors = validateTask(req.body, true);

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // Aggiorna solo i campi forniti
    const task = tasks[taskIndex];

    if (req.body.title !== undefined) {
        task.title = req.body.title.trim();
    }
    if (req.body.completed !== undefined) {
        task.completed = req.body.completed;
    }
    if (req.body.priority !== undefined) {
        task.priority = req.body.priority;
    }
    if (req.body.dueDate !== undefined) {
        task.dueDate = req.body.dueDate;
    }

    res.json({
        message: 'Attività modificata',
        task: task
    });
});

/**
 * ROUTE 6: DELETE /api/tasks/:id
 * Elimina attività
 */
app.delete('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({
            error: 'ID non valido'
        });
    }

    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            error: 'Attività non trovata'
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.json({
        message: 'Attività eliminata',
        task: deletedTask
    });
});

/**
 * BONUS: GET /api/tasks/stats
 * Statistiche sulle attività
 */
app.get('/api/stats', (req, res) => {
    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.completed).length,
        incomplete: tasks.filter(t => !t.completed).length,
        byPriority: {
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length
        },
        withDueDate: tasks.filter(t => t.dueDate !== null).length,
        overdue: tasks.filter(t => {
            if (!t.dueDate) return false;
            return new Date(t.dueDate) < new Date() && !t.completed;
        }).length
    };

    res.json(stats);
});

/**
 * BONUS: POST /api/tasks/bulk-delete
 * Elimina multiple attività
 */
app.post('/api/tasks/bulk-delete', (req, res) => {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
        return res.status(400).json({
            error: 'Body deve contenere array "ids"'
        });
    }

    const deleted = [];
    const notFound = [];

    ids.forEach(id => {
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            deleted.push(tasks.splice(taskIndex, 1)[0]);
        } else {
            notFound.push(id);
        }
    });

    res.json({
        message: `${deleted.length} attività eliminate`,
        deleted: deleted,
        notFound: notFound
    });
});

/**
 * HOME ROUTE: Documentazione API
 */
app.get('/', (req, res) => {
    res.json({
        message: 'API To-Do List',
        version: '1.0.0',
        endpoints: {
            'GET /api/tasks': 'Lista attività (filtri: completed, priority, search, sort, order)',
            'GET /api/tasks/:id': 'Dettaglio attività',
            'POST /api/tasks': 'Crea attività',
            'PUT /api/tasks/:id': 'Aggiorna completo',
            'PATCH /api/tasks/:id': 'Aggiorna parziale',
            'DELETE /api/tasks/:id': 'Elimina attività',
            'GET /api/stats': 'Statistiche (bonus)',
            'POST /api/tasks/bulk-delete': 'Elimina multiple (bonus)'
        },
        examples: {
            list: 'GET /api/tasks',
            filter: 'GET /api/tasks?completed=false&priority=high',
            search: 'GET /api/tasks?search=latte',
            create: 'POST /api/tasks {title, priority, dueDate}',
            update: 'PATCH /api/tasks/1 {completed: true}'
        }
    });
});

/**
 * 404 HANDLER
 */
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint non trovato',
        path: req.url
    });
});

/**
 * ERROR HANDLER
 */
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Errore interno del server',
        message: err.message
    });
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
    console.log(`✅ API To-Do List su http://localhost:${PORT}`);
    console.log('');
    console.log('📋 Attività iniziali:', tasks.length);
    console.log('');
    console.log('🧪 Test con curl:');
    console.log('');
    console.log('# Lista tutte le attività');
    console.log(`curl http://localhost:${PORT}/api/tasks`);
    console.log('');
    console.log('# Crea nuova attività');
    console.log(`curl -X POST http://localhost:${PORT}/api/tasks \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"title":"Comprare il latte","priority":"high","dueDate":"2024-11-05"}'`);
    console.log('');
    console.log('# Dettaglio attività');
    console.log(`curl http://localhost:${PORT}/api/tasks/1`);
    console.log('');
    console.log('# Completa attività');
    console.log(`curl -X PATCH http://localhost:${PORT}/api/tasks/1 \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"completed":true}'`);
    console.log('');
    console.log('# Filtra incomplete alta priorità');
    console.log(`curl "http://localhost:${PORT}/api/tasks?completed=false&priority=high"`);
    console.log('');
    console.log('# Cerca nel titolo');
    console.log(`curl "http://localhost:${PORT}/api/tasks?search=spesa"`);
    console.log('');
    console.log('# Statistiche');
    console.log(`curl http://localhost:${PORT}/api/stats`);
    console.log('');
    console.log('# Elimina attività');
    console.log(`curl -X DELETE http://localhost:${PORT}/api/tasks/1`);
    console.log('');
});
