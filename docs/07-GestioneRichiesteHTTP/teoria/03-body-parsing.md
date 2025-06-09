# Body Parsing e Middleware

## Introduzione al Body Parsing

Il body parsing è il processo di analisi e interpretazione dei dati inviati nel corpo (body) di una richiesta HTTP. A differenza dei parametri URL, che sono limitati in dimensione e complessità, il corpo della richiesta può contenere dati molto più complessi e voluminosi, come oggetti JSON, dati di form, file binari e altro ancora.

In Node.js, e in particolare con Express, il body parsing viene gestito attraverso middleware specializzati che intercettano la richiesta, analizzano il corpo e rendono i dati facilmente accessibili all'applicazione.

## Tipi di Dati nel Corpo della Richiesta

I dati nel corpo della richiesta possono essere inviati in diversi formati, ciascuno con il proprio Content-Type:

1. **application/json**: Dati in formato JSON
2. **application/x-www-form-urlencoded**: Dati di form codificati come coppie chiave-valore
3. **multipart/form-data**: Dati di form che possono includere file binari
4. **text/plain**: Testo semplice
5. **application/xml**: Dati in formato XML

## Middleware di Body Parsing in Express

Express.js include middleware integrati per il parsing dei formati più comuni:

### express.json()

Questo middleware analizza le richieste con Content-Type `application/json` e rende i dati disponibili in `req.body`:

```javascript
const express = require('express');
const app = express();

// Middleware per il parsing del JSON
app.use(express.json());

app.post('/api/users', (req, res) => {
  // req.body contiene i dati JSON inviati dal client
  const { name, email, age } = req.body;
  
  console.log(`Nome: ${name}, Email: ${email}, Età: ${age}`);
  
  res.status(201).json({
    message: 'Utente creato con successo',
    user: { name, email, age }
  });
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

Per inviare dati JSON a questo endpoint, il client dovrebbe impostare l'header `Content-Type: application/json` e inviare un corpo come:

```json
{
  "name": "Mario Rossi",
  "email": "mario.rossi@example.com",
  "age": 30
}
```

### express.urlencoded()

Questo middleware analizza le richieste con Content-Type `application/x-www-form-urlencoded` (il formato standard dei form HTML) e rende i dati disponibili in `req.body`:

```javascript
// Middleware per il parsing dei dati form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
  // req.body contiene i dati del form inviati dal client
  const { username, password } = req.body;
  
  // Logica di autenticazione
  if (username === 'admin' && password === 'password') {
    res.send('Login effettuato con successo');
  } else {
    res.status(401).send('Credenziali non valide');
  }
});
```

L'opzione `extended: true` permette di utilizzare la libreria `qs` per il parsing, che supporta oggetti nidificati. Se impostata a `false`, viene utilizzata la libreria `querystring`, che non supporta oggetti nidificati.

### express.raw()

Questo middleware è utilizzato per analizzare il corpo della richiesta come un Buffer:

```javascript
// Middleware per il parsing dei dati raw
app.use(express.raw({ type: 'application/octet-stream' }));

app.post('/upload-binary', (req, res) => {
  // req.body è un Buffer contenente i dati binari
  console.log(`Ricevuti ${req.body.length} bytes di dati binari`);
  
  // Elaborazione dei dati binari
  // ...
  
  res.send('Dati binari ricevuti con successo');
});
```

### express.text()

Questo middleware analizza il corpo della richiesta come testo semplice:

```javascript
// Middleware per il parsing del testo
app.use(express.text({ type: 'text/plain' }));

app.post('/submit-text', (req, res) => {
  // req.body è una stringa contenente il testo inviato
  console.log(`Testo ricevuto: ${req.body}`);
  
  res.send(`Hai inviato: ${req.body}`);
});
```

## Middleware di Terze Parti per il Body Parsing

### multer - Per il Parsing di multipart/form-data e Upload di File

`multer` è un middleware popolare per gestire `multipart/form-data`, particolarmente utile per l'upload di file:

```javascript
const express = require('express');
const multer = require('multer');
const app = express();

// Configurazione di multer per l'upload di file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory dove salvare i file
  },
  filename: (req, file, cb) => {
    // Genera un nome file unico
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Route per l'upload di un singolo file
app.post('/upload-single', upload.single('file'), (req, res) => {
  // req.file contiene informazioni sul file caricato
  // req.body contiene gli altri campi del form
  
  if (!req.file) {
    return res.status(400).send('Nessun file caricato');
  }
  
  res.json({
    message: 'File caricato con successo',
    file: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
});

// Route per l'upload di più file
app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
  // req.files è un array di file
  // req.body contiene gli altri campi del form
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('Nessun file caricato');
  }
  
  const fileDetails = req.files.map(file => ({
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  }));
  
  res.json({
    message: `${req.files.length} file caricati con successo`,
    files: fileDetails
  });
});

// Route per l'upload di file in campi specifici
const cpUpload = upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
]);

app.post('/upload-profile', cpUpload, (req, res) => {
  // req.files è un oggetto con campi per ogni tipo di file
  // req.body contiene gli altri campi del form
  
  const avatar = req.files.avatar ? req.files.avatar[0] : null;
  const gallery = req.files.gallery || [];
  
  res.json({
    message: 'Profilo aggiornato con successo',
    avatar: avatar ? {
      filename: avatar.filename,
      originalname: avatar.originalname
    } : null,
    gallery: gallery.map(file => ({
      filename: file.filename,
      originalname: file.originalname
    }))
  });
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

### body-parser - Per Formati Personalizzati

Prima di Express 4.16.0, `body-parser` era un pacchetto separato. Ora, i suoi middleware principali sono inclusi in Express, ma può ancora essere utile per formati personalizzati:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Middleware per il parsing di XML
app.use(bodyParser.text({ type: 'application/xml' }));

app.post('/api/xml', (req, res) => {
  console.log('XML ricevuto:', req.body);
  
  // Elaborazione del XML (potrebbe richiedere una libreria di parsing XML)
  // ...
  
  res.send('XML ricevuto con successo');
});
```

## Configurazione dei Middleware di Body Parsing

I middleware di body parsing possono essere configurati con varie opzioni:

### Limiti di Dimensione

È importante impostare limiti alla dimensione del corpo della richiesta per prevenire attacchi DoS:

```javascript
// Limita il corpo JSON a 1MB
app.use(express.json({ limit: '1mb' }));

// Limita il corpo urlencoded a 500KB
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Configurazione di multer con limiti
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Massimo 5 file
  }
});
```

### Tipi MIME

È possibile specificare quali tipi MIME devono essere analizzati da un middleware:

```javascript
// Analizza solo richieste con Content-Type application/json
app.use(express.json({ type: 'application/json' }));

// Analizza più tipi MIME come JSON
app.use(express.json({
  type: ['application/json', 'application/json-patch+json']
}));

// Analizza richieste con Content-Type personalizzato
app.use(express.text({ type: 'text/markdown' }));
```

## Gestione degli Errori nel Body Parsing

È importante gestire gli errori che possono verificarsi durante il parsing del corpo della richiesta:

```javascript
// Middleware per la gestione degli errori di parsing JSON
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

// Middleware per la gestione degli errori generali
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Errore di parsing JSON
    return res.status(400).json({ error: 'JSON non valido' });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    // Errore di dimensione file in multer
    return res.status(400).json({ error: 'File troppo grande' });
  }
  
  // Altri errori
  console.error(err);
  res.status(500).json({ error: 'Errore interno del server' });
});
```

## Validazione dei Dati

Dopo aver analizzato il corpo della richiesta, è importante validare i dati per garantire che siano nel formato atteso:

### Validazione Manuale

```javascript
app.post('/api/users', (req, res) => {
  const { name, email, age } = req.body;
  
  // Validazione manuale
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Nome non valido' });
  }
  
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email non valida' });
  }
  
  if (!age || isNaN(age) || age < 0) {
    return res.status(400).json({ error: 'Età non valida' });
  }
  
  // Procedi con la logica dell'endpoint
  // ...
  
  res.status(201).json({ message: 'Utente creato con successo' });
});
```

### Utilizzo di express-validator

`express-validator` è una libreria popolare per la validazione dei dati in Express:

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/users',
  [
    // Validazione del corpo della richiesta
    body('name').notEmpty().withMessage('Il nome è obbligatorio'),
    body('email').isEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 8 }).withMessage('La password deve essere di almeno 8 caratteri'),
    body('age').optional().isInt({ min: 0 }).withMessage('L\'età deve essere un numero positivo')
  ],
  (req, res) => {
    // Verifica se ci sono errori di validazione
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Procedi con la logica dell'endpoint
    // ...
    
    res.status(201).json({ message: 'Utente creato con successo' });
  }
);
```

### Utilizzo di Joi

`Joi` è un'altra libreria popolare per la validazione degli oggetti JavaScript:

```javascript
const Joi = require('joi');

// Schema di validazione
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  age: Joi.number().integer().min(0).optional()
});

app.post('/api/users', (req, res) => {
  // Validazione con Joi
  const { error, value } = userSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: error.details.map(detail => detail.message).join(', ')
    });
  }
  
  // Procedi con la logica dell'endpoint utilizzando i dati validati in 'value'
  // ...
  
  res.status(201).json({ message: 'Utente creato con successo' });
});
```

## Sicurezza nel Body Parsing

Il parsing del corpo della richiesta può introdurre vulnerabilità di sicurezza se non gestito correttamente:

### Prevenzione degli Attacchi DoS

```javascript
// Limita la dimensione del corpo della richiesta
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Timeout per il parsing
app.use(express.json({ limit: '1mb', inflate: true, timeout: 1000 }));
```

### Validazione del Content-Type

```javascript
// Middleware per verificare il Content-Type
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Il Content-Type deve essere application/json'
      });
    }
  }
  
  next();
});
```

### Sanitizzazione dei Dati

```javascript
const { body } = require('express-validator');

app.post('/api/comments',
  [
    // Sanitizzazione dei dati
    body('text').trim().escape(),
    body('author').trim().escape()
  ],
  (req, res) => {
    // I dati sono stati sanitizzati
    const { text, author } = req.body;
    
    // Procedi con la logica dell'endpoint
    // ...
    
    res.status(201).json({ message: 'Commento creato con successo' });
  }
);
```

## Esempi Pratici

### API RESTful con Diversi Tipi di Dati

```javascript
const express = require('express');
const multer = require('multer');
const app = express();

// Configurazione dei middleware di parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurazione di multer per l'upload di file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// API per la creazione di un prodotto (JSON)
app.post('/api/products', (req, res) => {
  const { name, price, description, category } = req.body;
  
  // Validazione
  if (!name || !price || isNaN(price)) {
    return res.status(400).json({ error: 'Dati prodotto non validi' });
  }
  
  // Creazione del prodotto
  const product = {
    id: Date.now().toString(),
    name,
    price: parseFloat(price),
    description,
    category
  };
  
  // Salvataggio del prodotto (simulato)
  console.log('Prodotto creato:', product);
  
  res.status(201).json({
    message: 'Prodotto creato con successo',
    product
  });
});

// API per l'aggiornamento di un prodotto (JSON)
app.put('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const { name, price, description, category } = req.body;
  
  // Validazione
  if (!name || !price || isNaN(price)) {
    return res.status(400).json({ error: 'Dati prodotto non validi' });
  }
  
  // Aggiornamento del prodotto (simulato)
  console.log(`Prodotto ${productId} aggiornato:`, { name, price, description, category });
  
  res.json({
    message: 'Prodotto aggiornato con successo',
    product: {
      id: productId,
      name,
      price: parseFloat(price),
      description,
      category
    }
  });
});

// API per l'upload di un'immagine prodotto (multipart/form-data)
app.post('/api/products/:id/image', upload.single('image'), (req, res) => {
  const productId = req.params.id;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Nessuna immagine caricata' });
  }
  
  // Aggiornamento del prodotto con l'immagine (simulato)
  console.log(`Immagine caricata per il prodotto ${productId}:`, req.file.filename);
  
  res.json({
    message: 'Immagine prodotto caricata con successo',
    image: {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size
    }
  });
});

// API per l'invio di un form di contatto (application/x-www-form-urlencoded)
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  // Validazione
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email non valida' });
  }
  
  // Invio del messaggio (simulato)
  console.log('Messaggio di contatto ricevuto:', { name, email, message });
  
  res.json({
    message: 'Messaggio inviato con successo',
    contact: { name, email }
  });
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

## Conclusione

Il body parsing è un aspetto fondamentale dello sviluppo di applicazioni web con Node.js e Express. I middleware di parsing consentono di elaborare facilmente diversi tipi di dati inviati dai client, rendendo possibile la creazione di API e applicazioni web robuste e flessibili.

È importante configurare correttamente i middleware di parsing, implementare la validazione dei dati e considerare le implicazioni di sicurezza per garantire che l'applicazione sia sia funzionale che sicura.

Nella prossima sezione, esploreremo come gestire i form HTML e l'upload di file in modo più dettagliato, concentrandoci sulle best practice e sulle tecniche avanzate per migliorare l'esperienza utente e la sicurezza.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Modulo Corrente: Gestione delle Richieste HTTP](../README.md)
- [Documento Precedente: Gestione dei Parametri URL](./02-parametri-url.md)
- [Documento Successivo: Gestione dei Form e Upload di File](./04-gestione-form.md)