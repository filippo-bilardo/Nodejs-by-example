# Esercitazione 8: Routing con Express

## Descrizione

Questa esercitazione approfondisce il sistema di routing di Express.js, un aspetto fondamentale per la creazione di applicazioni web organizzate e scalabili. Il routing permette di definire come l'applicazione risponde alle richieste client a specifici endpoint, determinati da un URI (o percorso) e da un metodo HTTP specifico (GET, POST, ecc.).

## Obiettivi

- Comprendere i concetti fondamentali del routing in Express.js
- Implementare route di base e avanzate
- Organizzare le route in moduli separati
- Utilizzare i parametri di route e query
- Implementare router annidati
- Gestire le risposte in base ai diversi metodi HTTP

## Esercizi Pratici

### Esercizio 8.1: Route di Base

1. Crea una nuova cartella per il progetto e inizializza un progetto Node.js:

```bash
mkdir express-routing
cd express-routing
npm init -y
```

2. Installa Express.js:

```bash
npm install express
```

3. Crea un file `app.js` con il seguente contenuto:

```javascript
const express = require('express');
const app = express();

// Route di base
app.get('/', (req, res) => {
  res.send('Home Page');
});

app.get('/about', (req, res) => {
  res.send('About Page');
});

app.get('/contact', (req, res) => {
  res.send('Contact Page');
});

// Route con metodi HTTP diversi
app.get('/api/users', (req, res) => {
  res.send('GET - Lista di tutti gli utenti');
});

app.post('/api/users', (req, res) => {
  res.send('POST - Creazione di un nuovo utente');
});

app.put('/api/users/:id', (req, res) => {
  res.send(`PUT - Aggiornamento dell'utente ${req.params.id}`);
});

app.delete('/api/users/:id', (req, res) => {
  res.send(`DELETE - Eliminazione dell'utente ${req.params.id}`);
});

// Gestione delle route non trovate (404)
app.use((req, res) => {
  res.status(404).send('404 - Pagina non trovata');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

4. Avvia l'applicazione:

```bash
node app.js
```

5. Testa le diverse route utilizzando strumenti come Postman, curl o il browser:
   - GET: `http://localhost:3000/`
   - GET: `http://localhost:3000/about`
   - GET: `http://localhost:3000/api/users`
   - POST: `http://localhost:3000/api/users`
   - PUT: `http://localhost:3000/api/users/1`
   - DELETE: `http://localhost:3000/api/users/1`
   - Prova anche un URL non esistente per vedere la risposta 404

### Esercizio 8.2: Parametri di Route e Query

1. Crea un nuovo file `params-app.js` con il seguente contenuto:

```javascript
const express = require('express');
const app = express();

// Route con parametri obbligatori
app.get('/users/:id', (req, res) => {
  res.send(`Dettagli dell'utente con ID: ${req.params.id}`);
});

// Route con più parametri
app.get('/users/:userId/posts/:postId', (req, res) => {
  res.send(`Post ${req.params.postId} dell'utente ${req.params.userId}`);
});

// Route con parametri opzionali
app.get('/products/:category?', (req, res) => {
  if (req.params.category) {
    res.send(`Prodotti nella categoria: ${req.params.category}`);
  } else {
    res.send('Tutti i prodotti');
  }
});

// Route con parametri di query
app.get('/search', (req, res) => {
  const query = req.query.q || '';
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  
  res.send(`Ricerca per: "${query}" - Pagina: ${page} - Limite: ${limit}`);
});

// Combinazione di parametri di route e query
app.get('/api/:resource', (req, res) => {
  const resource = req.params.resource;
  const sort = req.query.sort || 'asc';
  const filter = req.query.filter || 'none';
  
  res.send(`Risorsa: ${resource} - Ordinamento: ${sort} - Filtro: ${filter}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

2. Avvia l'applicazione:

```bash
node params-app.js
```

3. Testa le diverse route con parametri:
   - `http://localhost:3000/users/42`
   - `http://localhost:3000/users/123/posts/456`
   - `http://localhost:3000/products`
   - `http://localhost:3000/products/elettronica`
   - `http://localhost:3000/search?q=nodejs&page=2&limit=20`
   - `http://localhost:3000/api/books?sort=desc&filter=fantasy`

### Esercizio 8.3: Router Modulari

1. Crea una cartella `routes` nel tuo progetto.

2. Crea un file `routes/users.js` con il seguente contenuto:

```javascript
const express = require('express');
const router = express.Router();

// Middleware specifico per questo router
router.use((req, res, next) => {
  console.log('Time:', Date.now());
  next();
});

// Definizione delle route per gli utenti
router.get('/', (req, res) => {
  res.send('Lista di tutti gli utenti');
});

router.get('/new', (req, res) => {
  res.send('Form per la creazione di un nuovo utente');
});

router.post('/', (req, res) => {
  res.send('Creazione di un nuovo utente');
});

router.get('/:id', (req, res) => {
  res.send(`Dettagli dell'utente ${req.params.id}`);
});

router.put('/:id', (req, res) => {
  res.send(`Aggiornamento dell'utente ${req.params.id}`);
});

router.delete('/:id', (req, res) => {
  res.send(`Eliminazione dell'utente ${req.params.id}`);
});

module.exports = router;
```

3. Crea un file `routes/products.js` con il seguente contenuto:

```javascript
const express = require('express');
const router = express.Router();

// Definizione delle route per i prodotti
router.get('/', (req, res) => {
  res.send('Lista di tutti i prodotti');
});

router.get('/new', (req, res) => {
  res.send('Form per la creazione di un nuovo prodotto');
});

router.post('/', (req, res) => {
  res.send('Creazione di un nuovo prodotto');
});

router.get('/:id', (req, res) => {
  res.send(`Dettagli del prodotto ${req.params.id}`);
});

router.put('/:id', (req, res) => {
  res.send(`Aggiornamento del prodotto ${req.params.id}`);
});

router.delete('/:id', (req, res) => {
  res.send(`Eliminazione del prodotto ${req.params.id}`);
});

// Route annidata per le recensioni dei prodotti
router.get('/:id/reviews', (req, res) => {
  res.send(`Recensioni del prodotto ${req.params.id}`);
});

router.post('/:id/reviews', (req, res) => {
  res.send(`Aggiunta di una recensione al prodotto ${req.params.id}`);
});

module.exports = router;
```

4. Crea un file `modular-app.js` con il seguente contenuto:

```javascript
const express = require('express');
const app = express();

// Importa i router
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');

// Middleware per il parsing del body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route di base
app.get('/', (req, res) => {
  res.send(`
    <h1>Express Routing App</h1>
    <ul>
      <li><a href="/users">Utenti</a></li>
      <li><a href="/products">Prodotti</a></li>
    </ul>
  `);
});

// Registra i router con i prefissi
app.use('/users', usersRouter);
app.use('/products', productsRouter);

// Gestione delle route non trovate (404)
app.use((req, res) => {
  res.status(404).send('404 - Pagina non trovata');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

5. Avvia l'applicazione:

```bash
node modular-app.js
```

6. Testa le diverse route modulari:
   - `http://localhost:3000/`
   - `http://localhost:3000/users`
   - `http://localhost:3000/users/42`
   - `http://localhost:3000/products`
   - `http://localhost:3000/products/123`
   - `http://localhost:3000/products/123/reviews`

### Esercizio 8.4: Pattern di Routing Avanzati

1. Crea un nuovo file `advanced-routing.js` con il seguente contenuto:

```javascript
const express = require('express');
const app = express();

// Middleware per il parsing del body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Route con espressioni regolari
app.get(/\/users\/\d+/, (req, res) => {
  const userId = req.path.split('/')[2];
  res.send(`Utente trovato con ID numerico: ${userId}`);
});

// Route con pattern di corrispondenza
app.get('/files/*', (req, res) => {
  const filePath = req.params[0];
  res.send(`File richiesto: ${filePath}`);
});

// Route con callback multiple
app.get('/multi', 
  (req, res, next) => {
    console.log('Prima callback');
    req.data = { message: 'Dati dalla prima callback' };
    next();
  },
  (req, res, next) => {
    console.log('Seconda callback');
    req.data.additionalInfo = 'Dati dalla seconda callback';
    next();
  },
  (req, res) => {
    console.log('Terza callback');
    res.send(`Risultato finale: ${JSON.stringify(req.data)}`);
  }
);

// Route con array di callback
const validateUser = (req, res, next) => {
  // Simulazione di validazione
  if (req.query.userId && req.query.userId.length > 0) {
    next();
  } else {
    res.status(400).send('ID utente non valido');
  }
};

const checkPermissions = (req, res, next) => {
  // Simulazione di controllo permessi
  if (req.query.role === 'admin') {
    next();
  } else {
    res.status(403).send('Permessi insufficienti');
  }
};

app.get('/admin', [validateUser, checkPermissions], (req, res) => {
  res.send(`Accesso amministratore consentito per l'utente ${req.query.userId}`);
});

// Route con metodi concatenati
app.route('/resource')
  .get((req, res) => {
    res.send('GET - Ottieni la risorsa');
  })
  .post((req, res) => {
    res.send('POST - Crea una nuova risorsa');
  })
  .put((req, res) => {
    res.send('PUT - Aggiorna la risorsa');
  })
  .delete((req, res) => {
    res.send('DELETE - Elimina la risorsa');
  });

// Route di base per test
app.get('/', (req, res) => {
  res.send(`
    <h1>Pattern di Routing Avanzati</h1>
    <ul>
      <li><a href="/users/123">Utente con ID numerico</a></li>
      <li><a href="/files/documents/report.pdf">File esempio</a></li>
      <li><a href="/multi">Route con callback multiple</a></li>
      <li><a href="/admin?userId=123&role=admin">Admin con permessi</a></li>
      <li><a href="/admin?userId=123&role=user">Admin senza permessi</a></li>
      <li><a href="/resource">Risorsa (GET)</a></li>
    </ul>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

2. Avvia l'applicazione:

```bash
node advanced-routing.js
```

3. Testa i pattern di routing avanzati:
   - `http://localhost:3000/`
   - `http://localhost:3000/users/123`
   - `http://localhost:3000/files/documents/report.pdf`
   - `http://localhost:3000/multi`
   - `http://localhost:3000/admin?userId=123&role=admin`
   - `http://localhost:3000/admin?userId=123&role=user`
   - `http://localhost:3000/resource`

### Esercizio 8.5: Organizzazione MVC delle Route

1. Crea la seguente struttura di cartelle nel tuo progetto:

```
/mvc-app
  /controllers
    userController.js
    productController.js
  /routes
    userRoutes.js
    productRoutes.js
  /models
    userModel.js
    productModel.js
  app.js
```

2. Crea il file `models/userModel.js`:

```javascript
// Simulazione di un modello utente
const users = [
  { id: 1, name: 'Mario Rossi', email: 'mario@example.com' },
  { id: 2, name: 'Luigi Verdi', email: 'luigi@example.com' },
  { id: 3, name: 'Anna Bianchi', email: 'anna@example.com' }
];

module.exports = {
  findAll: () => users,
  findById: (id) => users.find(user => user.id === parseInt(id)),
  create: (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData
    };
    users.push(newUser);
    return newUser;
  },
  update: (id, userData) => {
    const index = users.findIndex(user => user.id === parseInt(id));
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      return users[index];
    }
    return null;
  },
  delete: (id) => {
    const index = users.findIndex(user => user.id === parseInt(id));
    if (index !== -1) {
      const deletedUser = users[index];
      users.splice(index, 1);
      return deletedUser;
    }
    return null;
  }
};
```

3. Crea il file `models/productModel.js`:

```javascript
// Simulazione di un modello prodotto
const products = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'Elettronica' },
  { id: 2, name: 'Smartphone', price: 699.99, category: 'Elettronica' },
  { id: 3, name: 'Libro', price: 19.99, category: 'Libri' }
];

module.exports = {
  findAll: () => products,
  findById: (id) => products.find(product => product.id === parseInt(id)),
  findByCategory: (category) => products.filter(product => product.category === category),
  create: (productData) => {
    const newProduct = {
      id: products.length + 1,
      ...productData
    };
    products.push(newProduct);
    return newProduct;
  },
  update: (id, productData) => {
    const index = products.findIndex(product => product.id === parseInt(id));
    if (index !== -1) {
      products[index] = { ...products[index], ...productData };
      return products[index];
    }
    return null;
  },
  delete: (id) => {
    const index = products.findIndex(product => product.id === parseInt(id));
    if (index !== -1) {
      const deletedProduct = products[index];
      products.splice(index, 1);
      return deletedProduct;
    }
    return null;
  }
};
```

4. Crea il file `controllers/userController.js`:

```javascript
const User = require('../models/userModel');

module.exports = {
  getAllUsers: (req, res) => {
    const users = User.findAll();
    res.json(users);
  },
  
  getUserById: (req, res) => {
    const user = User.findById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Utente non trovato' });
    }
  },
  
  createUser: (req, res) => {
    // Validazione dei dati (semplificata)
    if (!req.body.name || !req.body.email) {
      return res.status(400).json({ message: 'Nome e email sono richiesti' });
    }
    
    const newUser = User.create(req.body);
    res.status(201).json(newUser);
  },
  
  updateUser: (req, res) => {
    const updatedUser = User.update(req.params.id, req.body);
    if (updatedUser) {
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'Utente non trovato' });
    }
  },
  
  deleteUser: (req, res) => {
    const deletedUser = User.delete(req.params.id);
    if (deletedUser) {
      res.json(deletedUser);
    } else {
      res.status(404).json({ message: 'Utente non trovato' });
    }
  }
};
```

5. Crea il file `controllers/productController.js`:

```javascript
const Product = require('../models/productModel');

module.exports = {
  getAllProducts: (req, res) => {
    // Filtra per categoria se specificata
    if (req.query.category) {
      const products = Product.findByCategory(req.query.category);
      return res.json(products);
    }
    
    const products = Product.findAll();
    res.json(products);
  },
  
  getProductById: (req, res) => {
    const product = Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Prodotto non trovato' });
    }
  },
  
  createProduct: (req, res) => {
    // Validazione dei dati (semplificata)
    if (!req.body.name || !req.body.price) {
      return res.status(400).json({ message: 'Nome e prezzo sono richiesti' });
    }
    
    const newProduct = Product.create(req.body);
    res.status(201).json(newProduct);
  },
  
  updateProduct: (req, res) => {
    const updatedProduct = Product.update(req.params.id, req.body);
    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Prodotto non trovato' });
    }
  },
  
  deleteProduct: (req, res) => {
    const deletedProduct = Product.delete(req.params.id);
    if (deletedProduct) {
      res.json(deletedProduct);
    } else {
      res.status(404).json({ message: 'Prodotto non trovato' });
    }
  }
};
```

6. Crea il file `routes/userRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route per gli utenti
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
```

7. Crea il file `routes/productRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route per i prodotti
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
```

8. Crea il file `app.js`:

```javascript
const express = require('express');
const app = express();

// Middleware per il parsing del body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Importa le route
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

// Route di base
app.get('/', (req, res) => {
  res.send(`
    <h1>API MVC</h1>
    <h2>Endpoint disponibili:</h2>
    <h3>Utenti:</h3>
    <ul>
      <li>GET /api/users - Ottieni tutti gli utenti</li>
      <li>GET /api/users/:id - Ottieni un utente specifico</li>
      <li>POST /api/users - Crea un nuovo utente</li>
      <li>PUT /api/users/:id - Aggiorna un utente</li>
      <li>DELETE /api/users/:id - Elimina un utente</li>
    </ul>
    <h3>Prodotti:</h3>
    <ul>
      <li>GET /api/products - Ottieni tutti i prodotti</li>
      <li>GET /api/products?category=Elettronica - Filtra prodotti per categoria</li>
      <li>GET /api/products/:id - Ottieni un prodotto specifico</li>
      <li>POST /api/products - Crea un nuovo prodotto</li>
      <li>PUT /api/products/:id - Aggiorna un prodotto</li>
      <li>DELETE /api/products/:id - Elimina un prodotto</li>
    </ul>
  `);
});

// Registra le route
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Gestione degli errori
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint non trovato' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Errore interno del server' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
```

9. Avvia l'applicazione:

```bash
node app.js
```

10. Testa l'API MVC utilizzando strumenti come Postman, curl o il browser:
    - `http://localhost:3000/`
    - `http://localhost:3000/api/users`
    - `http://localhost:3000/api/users/1`
    - `http://localhost:3000/api/products`
    - `http://localhost:3000/api/products?category=Elettronica`

## Sfida Aggiuntiva

Crea un'applicazione Express.js che implementi un blog con le seguenti funzionalità:

1. Organizzazione MVC completa (Models, Views, Controllers)
2. Route per gestire articoli, categorie e commenti
3. Implementazione di middleware personalizzati per l'autenticazione
4. Validazione dei dati in input
5. Gestione delle relazioni tra le diverse entità (es. un articolo appartiene a una categoria e ha molti commenti)

Utilizza le conoscenze acquisite in questa esercitazione per implementare tutte le funzionalità richieste.

## Argomenti Teorici Collegati

- [1. Fondamenti del Routing in Express.js](./teoria/01-fondamenti-routing.md)
- [2. Router Modulari](./teoria/02-router-modulari.md)
- [3. Parametri di Route e Query](./teoria/03-parametri.md)
- [4. Pattern di Routing Avanzati](./teoria/04-pattern-avanzati.md)
- [5. Organizzazione MVC delle Route](./teoria/05-mvc-routing.md)

## Risorse Aggiuntive

- [Documentazione ufficiale sul routing in Express.js](https://expressjs.com/en/guide/routing.html)
- [Guida ai router in Express.js](https://expressjs.com/en/4x/api.html#router)
- [Pattern MVC in Node.js](https://www.sitepoint.com/node-js-mvc-application/)

## Navigazione

- [Indice del Corso](../README.md)
- Modulo Precedente: [Express.js Fondamenti](../07-ExpressFondamenti/README.md)
- Modulo Successivo: [Middleware](../09-Middleware/README.md)