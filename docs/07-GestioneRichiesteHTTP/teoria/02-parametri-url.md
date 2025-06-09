# Gestione dei Parametri URL

## Introduzione ai Parametri URL

I parametri URL sono componenti fondamentali nella costruzione di applicazioni web dinamiche e API RESTful. Consentono di trasmettere dati dal client al server attraverso l'URL stesso, rendendo possibile la personalizzazione delle risposte in base ai dati forniti. In Node.js, e in particolare con Express, la gestione di questi parametri è semplice ed efficiente.

Esistono principalmente due tipi di parametri URL:

1. **Parametri di percorso (Route Parameters)**: Sono parte del percorso dell'URL e vengono definiti con i due punti (`:`) nella definizione della route.
2. **Parametri di query (Query String)**: Sono coppie chiave-valore che seguono il punto interrogativo (`?`) nell'URL.

## Parametri di Percorso (Route Parameters)

I parametri di percorso sono utilizzati quando l'identità di una risorsa fa parte del percorso dell'URL. Sono particolarmente utili per le API RESTful dove l'identificatore di una risorsa è incorporato nell'URL.

### Definizione e Accesso ai Parametri di Percorso

In Express, i parametri di percorso vengono definiti nella route utilizzando i due punti seguiti dal nome del parametro:

```javascript
const express = require('express');
const app = express();

// Route con un singolo parametro
app.get('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  res.send(`Hai richiesto l'utente con ID: ${userId}`);
});

// Route con più parametri
app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
  res.send(`Hai richiesto il post ${postId} dell'utente ${userId}`);
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

In questo esempio:
- `:userId` e `:postId` sono parametri di percorso
- I valori di questi parametri sono accessibili attraverso l'oggetto `req.params`
- È possibile utilizzare la destrutturazione per estrarre più parametri in una sola volta

### Parametri di Percorso Opzionali

Per rendere un parametro di percorso opzionale, si può utilizzare il punto interrogativo (`?`) dopo il nome del parametro:

```javascript
// Route con parametro opzionale
app.get('/users/:userId?', (req, res) => {
  if (req.params.userId) {
    res.send(`Hai richiesto l'utente con ID: ${req.params.userId}`);
  } else {
    res.send('Hai richiesto la lista di tutti gli utenti');
  }
});
```

### Pattern Matching nei Parametri di Percorso

Express supporta anche l'uso di espressioni regolari per definire pattern nei parametri di percorso:

```javascript
// Route con pattern matching (accetta solo numeri per userId)
app.get('/users/:userId(\\d+)', (req, res) => {
  const userId = req.params.userId;
  res.send(`Hai richiesto l'utente con ID numerico: ${userId}`);
});

// Route con pattern matching (accetta solo stringhe di 3 lettere per il codice)
app.get('/products/:code([a-zA-Z]{3})', (req, res) => {
  const code = req.params.code;
  res.send(`Hai richiesto il prodotto con codice: ${code}`);
});
```

## Parametri di Query (Query String)

I parametri di query sono utilizzati per filtrare, ordinare o personalizzare i risultati di una richiesta. Sono particolarmente utili quando si desidera fornire opzioni aggiuntive senza modificare la struttura dell'URL principale.

### Accesso ai Parametri di Query

In Express, i parametri di query sono accessibili attraverso l'oggetto `req.query`:

```javascript
// Route che utilizza parametri di query
app.get('/products', (req, res) => {
  const { category, minPrice, maxPrice, sort } = req.query;
  
  let response = 'Prodotti';
  
  if (category) {
    response += ` nella categoria: ${category}`;
  }
  
  if (minPrice) {
    response += `, con prezzo minimo: ${minPrice}`;
  }
  
  if (maxPrice) {
    response += `, con prezzo massimo: ${maxPrice}`;
  }
  
  if (sort) {
    response += `, ordinati per: ${sort}`;
  }
  
  res.send(response);
});
```

Questo endpoint può essere chiamato in vari modi:
- `/products` - Restituisce tutti i prodotti
- `/products?category=electronics` - Filtra per categoria
- `/products?minPrice=100&maxPrice=500` - Filtra per intervallo di prezzo
- `/products?category=electronics&sort=price` - Filtra e ordina

### Parsing dei Parametri di Query

I parametri di query sono sempre stringhe. Se hai bisogno di altri tipi di dati (numeri, booleani, ecc.), devi convertirli manualmente:

```javascript
app.get('/products', (req, res) => {
  // Conversione dei parametri in tipi appropriati
  const category = req.query.category;
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
  const inStock = req.query.inStock === 'true';
  const page = req.query.page ? parseInt(req.query.page, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  
  // Utilizzo dei parametri convertiti
  // ...
  
  res.json({
    category,
    priceRange: { min: minPrice, max: maxPrice },
    inStock,
    pagination: { page, limit }
  });
});
```

### Parametri di Query Array e Oggetti

Express supporta anche parametri di query più complessi come array e oggetti nidificati:

```javascript
// URL: /search?tags=node&tags=javascript&tags=express
app.get('/search', (req, res) => {
  const tags = req.query.tags;
  // tags sarà un array se ci sono più valori con la stessa chiave
  res.send(`Ricerca per tag: ${Array.isArray(tags) ? tags.join(', ') : tags}`);
});

// URL: /filter?options[color]=red&options[size]=large
app.get('/filter', (req, res) => {
  const options = req.query.options;
  // options sarà un oggetto con proprietà color e size
  res.json(options);
});
```

Per supportare oggetti nidificati nei parametri di query, è necessario impostare l'opzione `extended` a `true` nel middleware `express.urlencoded`:

```javascript
app.use(express.urlencoded({ extended: true }));
```

## Combinazione di Parametri di Percorso e Query

È comune combinare parametri di percorso e query per creare API flessibili:

```javascript
// Route che combina parametri di percorso e query
app.get('/users/:userId/posts', (req, res) => {
  const userId = req.params.userId;
  const { limit, offset, sort } = req.query;
  
  res.send(`Recupero dei post dell'utente ${userId}, limit: ${limit || 10}, offset: ${offset || 0}, sort: ${sort || 'recent'}`);
});
```

Questo endpoint può essere chiamato come:
- `/users/123/posts` - Recupera i post dell'utente 123 con valori predefiniti
- `/users/123/posts?limit=5` - Limita i risultati a 5 post
- `/users/123/posts?sort=popular&limit=10&offset=20` - Ordina per popolarità con paginazione

## Validazione dei Parametri

È importante validare i parametri URL per garantire che l'applicazione riceva dati nel formato atteso e per prevenire errori o vulnerabilità di sicurezza.

### Validazione Manuale

```javascript
app.get('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // Validazione semplice
  if (!/^\d+$/.test(userId)) {
    return res.status(400).json({ error: 'L\'ID utente deve essere un numero' });
  }
  
  // Conversione e ulteriore validazione
  const userIdNum = parseInt(userId, 10);
  if (userIdNum <= 0) {
    return res.status(400).json({ error: 'L\'ID utente deve essere un numero positivo' });
  }
  
  // Procedi con la logica dell'endpoint
  res.send(`Utente valido con ID: ${userIdNum}`);
});
```

### Utilizzo di Middleware di Validazione

Per applicazioni più complesse, è consigliabile utilizzare librerie di validazione come `express-validator`:

```javascript
const { param, query, validationResult } = require('express-validator');

// Middleware di validazione per i parametri
app.get('/users/:userId/posts',
  [
    // Validazione del parametro di percorso
    param('userId').isInt({ min: 1 }).withMessage('L\'ID utente deve essere un numero intero positivo'),
    
    // Validazione dei parametri di query
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Il limite deve essere un numero tra 1 e 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('L\'offset deve essere un numero non negativo'),
    query('sort').optional().isIn(['recent', 'popular', 'title']).withMessage('Ordinamento non valido')
  ],
  (req, res) => {
    // Verifica se ci sono errori di validazione
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Conversione dei parametri validati
    const userId = parseInt(req.params.userId, 10);
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
    const sort = req.query.sort || 'recent';
    
    // Procedi con la logica dell'endpoint
    res.json({
      userId,
      pagination: { limit, offset },
      sort
    });
  }
);
```

## Gestione degli Errori

È importante gestire correttamente gli errori relativi ai parametri URL:

```javascript
// Middleware per la gestione degli errori 404 per risorse non trovate
app.get('/users/:userId', (req, res, next) => {
  const userId = req.params.userId;
  const user = findUserById(userId);
  
  if (!user) {
    // Passa un errore al middleware di gestione degli errori
    const error = new Error(`Utente con ID ${userId} non trovato`);
    error.statusCode = 404;
    return next(error);
  }
  
  res.json(user);
});

// Middleware di gestione degli errori
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});
```

## Best Practices

1. **Usa parametri di percorso per identificatori di risorse**:
   ```
   /users/:userId
   /products/:productId
   ```

2. **Usa parametri di query per filtri, ordinamento e paginazione**:
   ```
   /products?category=electronics&minPrice=100&sort=price
   /users?active=true&role=admin&page=2&limit=10
   ```

3. **Valida sempre i parametri**:
   - Verifica che i parametri siano nel formato atteso
   - Converti i parametri nei tipi di dati appropriati
   - Fornisci messaggi di errore chiari quando la validazione fallisce

4. **Usa valori predefiniti sensati**:
   ```javascript
   const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
   const page = req.query.page ? parseInt(req.query.page, 10) : 1;
   ```

5. **Documenta i parametri accettati**:
   - Specifica quali parametri sono supportati
   - Indica i formati e i vincoli per ciascun parametro
   - Fornisci esempi di utilizzo

6. **Mantieni la coerenza nelle convenzioni di denominazione**:
   - Usa `camelCase` o `snake_case` in modo coerente
   - Sii coerente con i nomi dei parametri in tutta l'API

## Esempi Pratici

### API di Ricerca Prodotti

```javascript
app.get('/products', (req, res) => {
  // Estrazione e validazione dei parametri
  const {
    category,
    minPrice,
    maxPrice,
    brand,
    inStock,
    sort,
    page,
    limit
  } = req.query;
  
  // Costruzione del filtro
  const filter = {};
  
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (inStock === 'true') filter.stockQuantity = { $gt: 0 };
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  
  // Opzioni di ordinamento
  const sortOptions = {};
  if (sort === 'price-asc') sortOptions.price = 1;
  else if (sort === 'price-desc') sortOptions.price = -1;
  else if (sort === 'name') sortOptions.name = 1;
  else sortOptions.createdAt = -1; // default: più recenti
  
  // Paginazione
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  // Simulazione di una query al database
  const products = findProducts(filter, sortOptions, skip, limitNum);
  const total = countProducts(filter);
  
  res.json({
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});
```

### API di Gestione Utenti

```javascript
// Recupera un utente specifico
app.get('/users/:userId', (req, res) => {
  const userId = req.params.userId;
  // Logica per recuperare l'utente
});

// Recupera i post di un utente
app.get('/users/:userId/posts', (req, res) => {
  const userId = req.params.userId;
  const { limit, offset, sort } = req.query;
  // Logica per recuperare i post dell'utente
});

// Recupera un post specifico di un utente
app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params;
  // Logica per recuperare il post specifico
});

// Recupera i commenti di un post specifico di un utente
app.get('/users/:userId/posts/:postId/comments', (req, res) => {
  const { userId, postId } = req.params;
  const { limit, offset } = req.query;
  // Logica per recuperare i commenti
});
```

## Conclusione

La gestione efficace dei parametri URL è fondamentale per creare API RESTful intuitive e flessibili. Express.js semplifica notevolmente questo processo fornendo accesso diretto ai parametri di percorso e query attraverso gli oggetti `req.params` e `req.query`.

Utilizzando correttamente i parametri di percorso per identificare risorse e i parametri di query per filtrare, ordinare e paginare i risultati, è possibile creare API che sono sia potenti che facili da utilizzare. La validazione e la conversione dei parametri sono passaggi cruciali per garantire che l'applicazione riceva dati nel formato atteso e per prevenire errori o vulnerabilità di sicurezza.

Nella prossima sezione, esploreremo come gestire il corpo delle richieste HTTP (request body) per elaborare dati più complessi inviati dai client attraverso richieste POST, PUT e PATCH.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Modulo Corrente: Gestione delle Richieste HTTP](../README.md)
- [Documento Precedente: Metodi HTTP e loro utilizzo](./01-metodi-http.md)
- [Documento Successivo: Body Parsing e Middleware](./03-body-parsing.md)