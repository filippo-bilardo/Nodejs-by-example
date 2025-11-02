/**
 * Esempio 05: Form Handling
 * Gestione form HTML con validazione
 */

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurazione EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

/**
 * Dati in memoria
 */
const contacts = [];
const registrations = [];

/**
 * ROUTE 1: Form di contatto (GET)
 */
app.get('/contact', (req, res) => {
    res.render('contact-form', {
        title: 'Contattaci',
        errors: [],
        formData: {},
        success: false
    });
});

/**
 * ROUTE 2: Submit form contatto (POST)
 */
app.post('/contact', (req, res) => {
    const errors = [];
    const { name, email, subject, message } = req.body;

    // Validazione
    if (!name || name.trim().length < 2) {
        errors.push('Nome deve essere almeno 2 caratteri');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Email non valida');
    }

    if (!subject || subject.trim().length < 5) {
        errors.push('Oggetto deve essere almeno 5 caratteri');
    }

    if (!message || message.trim().length < 10) {
        errors.push('Messaggio deve essere almeno 10 caratteri');
    }

    // Se ci sono errori, rimostra il form
    if (errors.length > 0) {
        return res.render('contact-form', {
            title: 'Contattaci',
            errors: errors,
            formData: req.body,
            success: false
        });
    }

    // Salva il contatto
    contacts.push({
        id: contacts.length + 1,
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        createdAt: new Date()
    });

    // Mostra messaggio di successo
    res.render('contact-form', {
        title: 'Contattaci',
        errors: [],
        formData: {},
        success: true
    });
});

/**
 * ROUTE 3: Lista messaggi ricevuti
 */
app.get('/contacts', (req, res) => {
    res.render('contacts-list', {
        title: 'Messaggi Ricevuti',
        contacts: contacts
    });
});

/**
 * ROUTE 4: Form registrazione (GET)
 */
app.get('/register', (req, res) => {
    res.render('register-form', {
        title: 'Registrazione',
        errors: [],
        formData: {},
        success: false
    });
});

/**
 * ROUTE 5: Submit registrazione (POST)
 */
app.post('/register', (req, res) => {
    const errors = [];
    const { 
        username, 
        email, 
        password, 
        confirmPassword, 
        birthdate,
        gender,
        terms,
        newsletter 
    } = req.body;

    // Validazione username
    if (!username || username.length < 3) {
        errors.push('Username deve essere almeno 3 caratteri');
    }
    if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username può contenere solo lettere, numeri e underscore');
    }
    if (registrations.some(r => r.username === username)) {
        errors.push('Username già in uso');
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Email non valida');
    }
    if (registrations.some(r => r.email === email)) {
        errors.push('Email già registrata');
    }

    // Validazione password
    if (!password || password.length < 8) {
        errors.push('Password deve essere almeno 8 caratteri');
    }
    if (password && !/[A-Z]/.test(password)) {
        errors.push('Password deve contenere almeno una maiuscola');
    }
    if (password && !/[0-9]/.test(password)) {
        errors.push('Password deve contenere almeno un numero');
    }
    if (password !== confirmPassword) {
        errors.push('Le password non corrispondono');
    }

    // Validazione data di nascita
    if (!birthdate) {
        errors.push('Data di nascita obbligatoria');
    } else {
        const birth = new Date(birthdate);
        const age = (new Date() - birth) / (1000 * 60 * 60 * 24 * 365);
        if (age < 18) {
            errors.push('Devi avere almeno 18 anni');
        }
    }

    // Validazione terms
    if (!terms) {
        errors.push('Devi accettare i termini e condizioni');
    }

    // Se ci sono errori
    if (errors.length > 0) {
        return res.render('register-form', {
            title: 'Registrazione',
            errors: errors,
            formData: req.body,
            success: false
        });
    }

    // Salva registrazione
    registrations.push({
        id: registrations.length + 1,
        username: username,
        email: email,
        birthdate: birthdate,
        gender: gender || 'not-specified',
        newsletter: newsletter === 'on',
        registeredAt: new Date()
    });

    // Successo
    res.render('register-form', {
        title: 'Registrazione',
        errors: [],
        formData: {},
        success: true
    });
});

/**
 * ROUTE 6: Home
 */
app.get('/', (req, res) => {
    res.send(`
        <h1>Form Handling Examples</h1>
        <ul>
            <li><a href="/contact">Form Contatto</a></li>
            <li><a href="/contacts">Messaggi Ricevuti (${contacts.length})</a></li>
            <li><a href="/register">Form Registrazione</a></li>
        </ul>
    `);
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
    console.log(`✅ Server Form Handling su http://localhost:${PORT}`);
    console.log('');
    console.log('📝 Form disponibili:');
    console.log(`   http://localhost:${PORT}/contact - Form contatto`);
    console.log(`   http://localhost:${PORT}/register - Form registrazione`);
    console.log(`   http://localhost:${PORT}/contacts - Messaggi ricevuti`);
    console.log('');
});
