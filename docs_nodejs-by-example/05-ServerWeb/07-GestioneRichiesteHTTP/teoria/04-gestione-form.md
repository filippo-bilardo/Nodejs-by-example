# Gestione dei Form e Upload di File

## Introduzione ai Form HTML

I form HTML sono uno dei metodi principali con cui gli utenti interagiscono con le applicazioni web, consentendo l'invio di dati dal browser al server. In Node.js, e in particolare con Express, la gestione dei form richiede una comprensione di come i dati vengono inviati, elaborati e validati.

Un form HTML base ha questa struttura:

```html
<form action="/submit" method="POST">
  <label for="name">Nome:</label>
  <input type="text" id="name" name="name" required>
  
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>
  
  <label for="message">Messaggio:</label>
  <textarea id="message" name="message" required></textarea>
  
  <button type="submit">Invia</button>
</form>
```

Quando l'utente invia questo form, i dati vengono trasmessi al server con una richiesta HTTP POST all'endpoint `/submit`. Il modo in cui questi dati vengono codificati dipende dall'attributo `enctype` del form.

## Tipi di Codifica dei Form

### application/x-www-form-urlencoded

Questo è il tipo di codifica predefinito per i form HTML. I dati vengono inviati come coppie chiave-valore, simili a una query string:

```
name=Mario+Rossi&email=mario%40example.com&message=Ciao%2C+come+stai%3F
```

In Express, questi dati possono essere analizzati con il middleware `express.urlencoded()`:

```javascript
const express = require('express');
const app = express();

// Middleware per il parsing dei dati form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
  const { name, email, message } = req.body;
  
  console.log(`Nome: ${name}, Email: ${email}, Messaggio: ${message}`);
  
  res.send('Form ricevuto con successo!');
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

### multipart/form-data

Questo tipo di codifica è necessario quando il form include campi per l'upload di file. I dati vengono suddivisi in "parti" separate, ciascuna con le proprie intestazioni:

```html
<form action="/upload" method="POST" enctype="multipart/form-data">
  <label for="name">Nome:</label>
  <input type="text" id="name" name="name" required>
  
  <label for="avatar">Avatar:</label>
  <input type="file" id="avatar" name="avatar" accept="image/*" required>
  
  <button type="submit">Carica</button>
</form>
```

Per gestire questo tipo di form in Express, è necessario utilizzare un middleware come `multer`:

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Configurazione di multer per l'upload di file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory dove salvare i file
  },
  filename: (req, file, cb) => {
    // Genera un nome file unico
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('avatar'), (req, res) => {
  // req.file contiene informazioni sul file caricato
  // req.body contiene gli altri campi del form
  
  if (!req.file) {
    return res.status(400).send('Nessun file caricato');
  }
  
  console.log(`Nome: ${req.body.name}, File: ${req.file.filename}`);
  
  res.send('File caricato con successo!');
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

## Creazione di Form Dinamici con Template Engine

Per creare form dinamici, è comune utilizzare un template engine come EJS, Pug o Handlebars. Ecco un esempio con EJS:

```javascript
const express = require('express');
const app = express();

// Configurazione del template engine EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware per il parsing dei dati form
app.use(express.urlencoded({ extended: true }));

// Route per visualizzare il form
app.get('/register', (req, res) => {
  res.render('register', { errors: null, formData: {} });
});

// Route per gestire l'invio del form
app.post('/register', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  
  // Validazione
  const errors = [];
  
  if (!username || username.length < 3) {
    errors.push('Il nome utente deve essere di almeno 3 caratteri');
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email non valida');
  }
  
  if (!password || password.length < 8) {
    errors.push('La password deve essere di almeno 8 caratteri');
  }
  
  if (password !== confirmPassword) {
    errors.push('Le password non corrispondono');
  }
  
  if (errors.length > 0) {
    // Se ci sono errori, ri-renderizza il form con i messaggi di errore
    return res.render('register', {
      errors,
      formData: { username, email } // Ripopola i campi (esclusa la password per sicurezza)
    });
  }
  
  // Se non ci sono errori, procedi con la registrazione
  // ...
  
  res.redirect('/login?registered=true');
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

E il template EJS corrispondente (`views/register.ejs`):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Registrazione</title>
  <style>
    .error { color: red; margin-bottom: 10px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; }
  </style>
</head>
<body>
  <h1>Registrazione</h1>
  
  <% if (errors && errors.length > 0) { %>
    <div class="error">
      <ul>
        <% errors.forEach(error => { %>
          <li><%= error %></li>
        <% }); %>
      </ul>
    </div>
  <% } %>
  
  <form action="/register" method="POST">
    <div class="form-group">
      <label for="username">Nome utente:</label>
      <input type="text" id="username" name="username" value="<%= formData.username || '' %>" required>
    </div>
    
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" value="<%= formData.email || '' %>" required>
    </div>
    
    <div class="form-group">
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" required>
    </div>
    
    <div class="form-group">
      <label for="confirmPassword">Conferma password:</label>
      <input type="password" id="confirmPassword" name="confirmPassword" required>
    </div>
    
    <button type="submit">Registrati</button>
  </form>
</body>
</html>
```

## Gestione Avanzata dell'Upload di File

### Validazione dei File

È importante validare i file caricati per garantire che siano del tipo e della dimensione attesi:

```javascript
const multer = require('multer');
const path = require('path');

// Funzione per filtrare i file
const fileFilter = (req, file, cb) => {
  // Accetta solo immagini
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accetta il file
  } else {
    cb(new Error('Tipo di file non supportato. Carica solo immagini JPEG, PNG o GIF.'), false);
  }
};

// Configurazione di multer
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Middleware per la gestione degli errori di multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File troppo grande. La dimensione massima è 5MB.' });
    }
    return res.status(400).json({ error: `Errore di upload: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

// Utilizzo nel router
app.post('/upload', (req, res, next) => {
  upload.single('avatar')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    
    res.json({
      message: 'File caricato con successo',
      file: {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
        size: req.file.size
      }
    });
  });
});
```

### Upload di File Multipli

```javascript
// Upload di più file con lo stesso nome di campo
app.post('/upload-gallery', upload.array('photos', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('Nessun file caricato');
  }
  
  const fileDetails = req.files.map(file => ({
    filename: file.filename,
    path: `/uploads/${file.filename}`,
    size: file.size
  }));
  
  res.json({
    message: `${req.files.length} file caricati con successo`,
    files: fileDetails
  });
});

// Upload di file in campi diversi
const cpUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
]);

app.post('/upload-profile', cpUpload, (req, res) => {
  const avatar = req.files.avatar ? req.files.avatar[0] : null;
  const gallery = req.files.gallery || [];
  
  res.json({
    message: 'Profilo aggiornato con successo',
    avatar: avatar ? {
      filename: avatar.filename,
      path: `/uploads/${avatar.filename}`
    } : null,
    gallery: gallery.map(file => ({
      filename: file.filename,
      path: `/uploads/${file.filename}`
    }))
  });
});
```

### Elaborazione delle Immagini

Spesso è utile elaborare le immagini caricate, ad esempio per ridimensionarle o comprimerle. Questo può essere fatto con librerie come `sharp`:

```javascript
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const app = express();

// Configurazione di multer per l'upload temporaneo
const upload = multer({
  storage: multer.memoryStorage(), // Salva il file in memoria
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo le immagini sono supportate'), false);
    }
  }
});

// Route per l'upload e l'elaborazione di un'immagine
app.post('/upload-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nessuna immagine caricata');
  }
  
  try {
    // Crea la directory se non esiste
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Genera un nome file unico
    const filename = `image-${Date.now()}${path.extname(req.file.originalname)}`;
    const filepath = path.join(uploadDir, filename);
    
    // Ridimensiona e salva l'immagine
    await sharp(req.file.buffer)
      .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(filepath);
    
    // Crea una versione thumbnail
    const thumbnailFilename = `thumb-${filename}`;
    const thumbnailFilepath = path.join(uploadDir, thumbnailFilename);
    
    await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toFile(thumbnailFilepath);
    
    res.json({
      message: 'Immagine caricata ed elaborata con successo',
      image: {
        original: {
          filename,
          path: `/uploads/${filename}`
        },
        thumbnail: {
          filename: thumbnailFilename,
          path: `/uploads/${thumbnailFilename}`
        }
      }
    });
  } catch (error) {
    console.error('Errore durante l\'elaborazione dell\'immagine:', error);
    res.status(500).send('Errore durante l\'elaborazione dell\'immagine');
  }
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

## Gestione dei Form con AJAX

Moderni siti web spesso utilizzano AJAX per inviare form senza ricaricare la pagina. Ecco come gestire questo scenario:

### Lato Client

```html
<!DOCTYPE html>
<html>
<head>
  <title>Form AJAX</title>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
  <h1>Registrazione</h1>
  
  <div id="error-container" style="color: red; display: none;"></div>
  <div id="success-container" style="color: green; display: none;"></div>
  
  <form id="register-form">
    <div>
      <label for="username">Nome utente:</label>
      <input type="text" id="username" name="username" required>
    </div>
    
    <div>
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required>
    </div>
    
    <div>
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" required>
    </div>
    
    <button type="submit">Registrati</button>
  </form>
  
  <script>
    $(document).ready(function() {
      $('#register-form').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
          username: $('#username').val(),
          email: $('#email').val(),
          password: $('#password').val()
        };
        
        $.ajax({
          type: 'POST',
          url: '/api/register',
          data: JSON.stringify(formData),
          contentType: 'application/json',
          success: function(response) {
            $('#error-container').hide();
            $('#success-container').text(response.message).show();
            $('#register-form')[0].reset();
          },
          error: function(xhr) {
            const response = xhr.responseJSON;
            $('#success-container').hide();
            
            if (response && response.errors) {
              const errorList = response.errors.map(err => `<li>${err}</li>`).join('');
              $('#error-container').html(`<ul>${errorList}</ul>`).show();
            } else {
              $('#error-container').text('Si è verificato un errore durante la registrazione.').show();
            }
          }
        });
      });
    });
  </script>
</body>
</html>
```

### Lato Server

```javascript
const express = require('express');
const app = express();

// Middleware per servire file statici
app.use(express.static('public'));

// Middleware per il parsing JSON
app.use(express.json());

// API per la registrazione
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Validazione
  const errors = [];
  
  if (!username || username.length < 3) {
    errors.push('Il nome utente deve essere di almeno 3 caratteri');
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email non valida');
  }
  
  if (!password || password.length < 8) {
    errors.push('La password deve essere di almeno 8 caratteri');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  // Registrazione dell'utente (simulata)
  console.log('Utente registrato:', { username, email });
  
  res.status(201).json({
    message: 'Registrazione completata con successo!',
    user: { username, email }
  });
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

## Upload di File con AJAX

### Lato Client

```html
<!DOCTYPE html>
<html>
<head>
  <title>Upload File AJAX</title>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <style>
    .progress-bar {
      width: 100%;
      background-color: #f0f0f0;
      padding: 3px;
      border-radius: 3px;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, .2);
      display: none;
    }
    .progress-bar-fill {
      height: 20px;
      background-color: #4CAF50;
      border-radius: 3px;
      width: 0%;
      transition: width 0.3s ease;
      text-align: center;
      color: white;
    }
    .preview-container {
      margin-top: 20px;
      display: none;
    }
    .preview-image {
      max-width: 300px;
      max-height: 300px;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 5px;
    }
  </style>
</head>
<body>
  <h1>Upload Immagine</h1>
  
  <div id="error-container" style="color: red; display: none;"></div>
  <div id="success-container" style="color: green; display: none;"></div>
  
  <form id="upload-form">
    <div>
      <label for="title">Titolo:</label>
      <input type="text" id="title" name="title" required>
    </div>
    
    <div>
      <label for="image">Immagine:</label>
      <input type="file" id="image" name="image" accept="image/*" required>
    </div>
    
    <div class="progress-bar" id="progress-bar">
      <div class="progress-bar-fill" id="progress-bar-fill">0%</div>
    </div>
    
    <button type="submit">Carica</button>
  </form>
  
  <div class="preview-container" id="preview-container">
    <h3>Anteprima:</h3>
    <img class="preview-image" id="preview-image" src="" alt="Anteprima">
  </div>
  
  <script>
    $(document).ready(function() {
      // Anteprima dell'immagine
      $('#image').on('change', function() {
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            $('#preview-image').attr('src', e.target.result);
            $('#preview-container').show();
          };
          reader.readAsDataURL(file);
        }
      });
      
      // Upload del form
      $('#upload-form').on('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', $('#title').val());
        formData.append('image', $('#image')[0].files[0]);
        
        $('#error-container').hide();
        $('#success-container').hide();
        $('#progress-bar').show();
        
        $.ajax({
          type: 'POST',
          url: '/api/upload',
          data: formData,
          contentType: false, // Necessario per FormData
          processData: false, // Necessario per FormData
          xhr: function() {
            const xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener('progress', function(evt) {
              if (evt.lengthComputable) {
                const percentComplete = Math.round((evt.loaded / evt.total) * 100);
                $('#progress-bar-fill').width(percentComplete + '%');
                $('#progress-bar-fill').text(percentComplete + '%');
              }
            }, false);
            return xhr;
          },
          success: function(response) {
            $('#success-container').text(response.message).show();
            $('#upload-form')[0].reset();
            // Aggiorna l'anteprima con l'immagine elaborata dal server
            $('#preview-image').attr('src', response.image.path);
          },
          error: function(xhr) {
            const response = xhr.responseJSON;
            if (response && response.error) {
              $('#error-container').text(response.error).show();
            } else {
              $('#error-container').text('Si è verificato un errore durante l\'upload.').show();
            }
          },
          complete: function() {
            setTimeout(function() {
              $('#progress-bar').hide();
              $('#progress-bar-fill').width('0%');
              $('#progress-bar-fill').text('0%');
            }, 1000);
          }
        });
      });
    });
  </script>
</body>
</html>
```

### Lato Server

```javascript
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware per servire file statici
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Configurazione di multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo di file non supportato. Carica solo immagini JPEG, PNG o GIF.'));
    }
  }
});

// API per l'upload di immagini
app.post('/api/upload', (req, res) => {
  upload.single('image')(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File troppo grande. La dimensione massima è 5MB.' });
      }
      return res.status(400).json({ error: `Errore di upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }
    
    // Salva i dettagli dell'immagine (simulato)
    const imageDetails = {
      title: req.body.title,
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date()
    };
    
    console.log('Immagine caricata:', imageDetails);
    
    res.json({
      message: 'Immagine caricata con successo',
      image: {
        title: imageDetails.title,
        filename: imageDetails.filename,
        path: imageDetails.path
      }
    });
  });
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

## Sicurezza nella Gestione dei Form

### Protezione da CSRF (Cross-Site Request Forgery)

Il CSRF è un tipo di attacco in cui un sito malevolo induce un utente a eseguire azioni indesiderate su un sito in cui è autenticato. Per proteggersi, è possibile utilizzare token CSRF:

```javascript
const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const app = express();

// Configurazione dei middleware necessari
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'chiave-segreta-sessione',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Middleware CSRF
const csrfProtection = csrf({ cookie: true });

// Route per visualizzare il form (con token CSRF)
app.get('/form', csrfProtection, (req, res) => {
  res.send(`
    <form action="/submit" method="POST">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <input type="text" name="name" placeholder="Nome">
      <button type="submit">Invia</button>
    </form>
  `);
});

// Route per gestire l'invio del form (con protezione CSRF)
app.post('/submit', csrfProtection, (req, res) => {
  // Il middleware csrf verifica automaticamente il token
  // Se arriviamo qui, il token è valido
  res.send('Form inviato con successo!');
});

// Gestione degli errori CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).send('Sessione scaduta o token CSRF non valido. Riprova.');
  }
  next(err);
});
```

### Validazione dei Dati con Express-Validator

La validazione dei dati è essenziale per garantire che i dati inviati dagli utenti siano corretti e sicuri. Express-validator è una libreria popolare per la validazione dei dati in Express:

```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const app = express();

app.use(express.urlencoded({ extended: true }));

// Route per visualizzare il form
app.get('/register', (req, res) => {
  res.send(`
    <form action="/register" method="POST">
      <div>
        <label for="name">Nome:</label>
        <input type="text" id="name" name="name">
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email">
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password">
      </div>
      <div>
        <label for="confirmPassword">Conferma Password:</label>
        <input type="password" id="confirmPassword" name="confirmPassword">
      </div>
      <button type="submit">Registrati</button>
    </form>
  `);
});

// Route per gestire l'invio del form con validazione
app.post('/register', [
  // Validazione dei campi
  body('name')
    .trim()
    .isLength({ min: 3 }).withMessage('Il nome deve essere di almeno 3 caratteri')
    .escape(),
  body('email')
    .isEmail().withMessage('Inserisci un indirizzo email valido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('La password deve essere di almeno 8 caratteri')
    .matches(/\d/).withMessage('La password deve contenere almeno un numero'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Le password non corrispondono');
      }
      return true;
    })
], (req, res) => {
  // Verifica se ci sono errori di validazione
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // Se non ci sono errori, procedi con la registrazione
  res.send('Registrazione completata con successo!');
});
```

## Express.js e la Gestione dei Form: Best Practices

### Organizzazione del Codice

Per applicazioni più complesse, è consigliabile organizzare il codice in modo modulare, separando le route, i controller e i middleware:

```javascript
// routes/form.js
const express = require('express');
const router = express.Router();
const { validateForm } = require('../middleware/validators');
const { submitForm, showForm } = require('../controllers/formController');

router.get('/form', showForm);
router.post('/form', validateForm, submitForm);

module.exports = router;

// middleware/validators.js
const { body, validationResult } = require('express-validator');

exports.validateForm = [
  body('name').trim().isLength({ min: 3 }).withMessage('Nome troppo corto'),
  body('email').isEmail().withMessage('Email non valida'),
  // Altre validazioni...
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('form', { 
        errors: errors.array(),
        formData: req.body 
      });
    }
    next();
  }
];

// controllers/formController.js
exports.showForm = (req, res) => {
  res.render('form', { errors: null, formData: {} });
};

exports.submitForm = (req, res) => {
  // Logica per gestire i dati del form
  res.redirect('/success');
};

// app.js
const express = require('express');
const formRoutes = require('./routes/form');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(formRoutes);

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

### Gestione degli Errori

Una buona gestione degli errori è fondamentale per fornire feedback utili agli utenti e per il debugging:

```javascript
// Middleware per la gestione degli errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Errori specifici
  if (err.name === 'ValidationError') {
    return res.status(400).render('error', { 
      message: 'Errore di validazione', 
      details: err.errors 
    });
  }
  
  if (err.name === 'MulterError') {
    return res.status(400).render('error', { 
      message: 'Errore di upload', 
      details: err.message 
    });
  }
  
  // Errore generico
  res.status(500).render('error', { 
    message: 'Si è verificato un errore interno', 
    details: process.env.NODE_ENV === 'development' ? err.message : null 
  });
});
```

### Ottimizzazione delle Prestazioni

Per migliorare le prestazioni nella gestione dei form, considera queste tecniche:

1. **Limitazione delle dimensioni del payload**:
   ```javascript
   app.use(express.json({ limit: '1mb' }));
   app.use(express.urlencoded({ extended: true, limit: '1mb' }));
   ```

2. **Rate limiting** per prevenire abusi:
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const formLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minuti
     max: 5, // 5 tentativi per finestra
     message: 'Troppi tentativi di invio form. Riprova più tardi.'
   });
   
   app.post('/submit', formLimiter, (req, res) => {
     // Gestione del form
   });
   ```

3. **Compressione** per ridurre la dimensione delle risposte:
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

### Sicurezza Avanzata

Oltre alla protezione CSRF, considera queste misure di sicurezza aggiuntive:

1. **Helmet** per impostare header HTTP di sicurezza:
   ```javascript
   const helmet = require('helmet');
   app.use(helmet());
   ```

2. **Content Security Policy** per prevenire attacchi XSS:
   ```javascript
   app.use(helmet.contentSecurityPolicy({
     directives: {
       defaultSrc: ["'self'"],
       scriptSrc: ["'self'", "'unsafe-inline'", 'trusted-cdn.com'],
       // Altre direttive...
     }
   }));
   ```

3. **Sanitizzazione dell'input** per prevenire iniezioni:
   ```javascript
   const { sanitizeBody } = require('express-validator');
   
   app.post('/submit', [
     sanitizeBody('*').trim().escape()
   ], (req, res) => {
     // Gestione del form con dati sanitizzati
   });
   ```

## Conclusione

La gestione efficace dei form è un aspetto cruciale dello sviluppo web con Node.js e Express. Implementando le tecniche e le best practices descritte in questa guida, puoi creare applicazioni web robuste, sicure e user-friendly che gestiscono correttamente l'input degli utenti e forniscono feedback appropriati.

Ricorda che la sicurezza dovrebbe essere sempre una priorità, specialmente quando si tratta di gestire dati inviati dagli utenti. Utilizza la validazione, la sanitizzazione e le misure di protezione appropriate per garantire che la tua applicazione sia resistente agli attacchi comuni.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Modulo Corrente: Gestione delle Richieste HTTP](../README.md)
- [Documento Precedente: Body Parsing e Middleware](./03-body-parsing.md)
- [Documento Successivo: Principi REST e Architettura](../../08-REST_API/teoria/01-principi-rest.md)