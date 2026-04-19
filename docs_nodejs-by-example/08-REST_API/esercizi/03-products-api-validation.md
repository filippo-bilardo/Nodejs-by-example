# Esercizio 3: API Prodotti con Validazione

## Obiettivo
Creare una REST API completa per la gestione prodotti con validazione dei dati, gestione errori e query parameters.

## Descrizione
Implementa un'API avanzata per gestire un catalogo prodotti con:
- Validazione dei dati in ingresso
- Gestione degli errori
- Filtri e ricerca tramite query parameters
- Middleware personalizzati

## Requisiti
1. Installa le dipendenze: `npm install express`
2. Ogni prodotto deve avere: `id`, `name`, `price`, `category`, `stock`
3. Implementa validazione per assicurare dati corretti
4. Supporta filtri per categoria e prezzo

## Endpoint da implementare

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/products` | Restituisce tutti i prodotti (con filtri opzionali) |
| GET | `/api/products/:id` | Restituisce un prodotto specifico |
| POST | `/api/products` | Crea un nuovo prodotto (con validazione) |
| PUT | `/api/products/:id` | Aggiorna un prodotto esistente |
| DELETE | `/api/products/:id` | Elimina un prodotto |

## Query Parameters per GET /api/products
- `category`: filtra per categoria
- `minPrice`: prezzo minimo
- `maxPrice`: prezzo massimo
- `inStock`: true/false per prodotti disponibili

## Validazioni richieste
- `name`: obbligatorio, stringa non vuota
- `price`: obbligatorio, numero positivo
- `category`: obbligatorio, una tra: 'electronics', 'clothing', 'food', 'books'
- `stock`: obbligatorio, numero intero >= 0

## Codice di partenza

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let products = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'electronics', stock: 10 },
  { id: 2, name: 'T-Shirt', price: 19.99, category: 'clothing', stock: 50 },
  { id: 3, name: 'Pizza', price: 8.50, category: 'food', stock: 0 }
];

// Middleware per validazione prodotto
function validateProduct(req, res, next) {
  // TODO: Implementa la validazione
  next();
}

// TODO: Implementa qui i tuoi endpoint

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
```

## Test

```bash
# Ottieni tutti i prodotti
curl http://localhost:3000/api/products

# Filtra per categoria
curl "http://localhost:3000/api/products?category=electronics"

# Filtra per prezzo
curl "http://localhost:3000/api/products?minPrice=10&maxPrice=100"

# Solo prodotti disponibili
curl "http://localhost:3000/api/products?inStock=true"

# Crea un prodotto valido
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Smartphone","price":599.99,"category":"electronics","stock":25}'

# Tenta di creare un prodotto non valido (deve fallire)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"","price":-10,"category":"invalid","stock":-5}'
```

## Soluzione
<details>
<summary>Clicca per vedere la soluzione</summary>

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

let products = [
  { id: 1, name: 'Laptop', price: 999.99, category: 'electronics', stock: 10 },
  { id: 2, name: 'T-Shirt', price: 19.99, category: 'clothing', stock: 50 },
  { id: 3, name: 'Pizza', price: 8.50, category: 'food', stock: 0 }
];

const VALID_CATEGORIES = ['electronics', 'clothing', 'food', 'books'];

// Middleware per validazione prodotto
function validateProduct(req, res, next) {
  const { name, price, category, stock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Nome obbligatorio e deve essere una stringa non vuota');
  }

  if (price === undefined || typeof price !== 'number' || price <= 0) {
    errors.push('Prezzo obbligatorio e deve essere un numero positivo');
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    errors.push(`Categoria obbligatoria e deve essere una tra: ${VALID_CATEGORIES.join(', ')}`);
  }

  if (stock === undefined || !Number.isInteger(stock) || stock < 0) {
    errors.push('Stock obbligatorio e deve essere un numero intero >= 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

// GET - Tutti i prodotti con filtri
app.get('/api/products', (req, res) => {
  let filtered = [...products];

  // Filtro per categoria
  if (req.query.category) {
    filtered = filtered.filter(p => p.category === req.query.category);
  }

  // Filtro per prezzo minimo
  if (req.query.minPrice) {
    const minPrice = parseFloat(req.query.minPrice);
    filtered = filtered.filter(p => p.price >= minPrice);
  }

  // Filtro per prezzo massimo
  if (req.query.maxPrice) {
    const maxPrice = parseFloat(req.query.maxPrice);
    filtered = filtered.filter(p => p.price <= maxPrice);
  }

  // Filtro per disponibilità
  if (req.query.inStock === 'true') {
    filtered = filtered.filter(p => p.stock > 0);
  } else if (req.query.inStock === 'false') {
    filtered = filtered.filter(p => p.stock === 0);
  }

  res.json(filtered);
});

// GET - Prodotto specifico
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }
  res.json(product);
});

// POST - Crea prodotto con validazione
app.post('/api/products', validateProduct, (req, res) => {
  const newProduct = {
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT - Aggiorna prodotto con validazione
app.put('/api/products/:id', validateProduct, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }
  
  product.name = req.body.name;
  product.price = req.body.price;
  product.category = req.body.category;
  product.stock = req.body.stock;
  
  res.json(product);
});

// DELETE - Elimina prodotto
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Prodotto non trovato' });
  }
  const deletedProduct = products.splice(index, 1);
  res.json(deletedProduct[0]);
});

// Gestione errori 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Gestione errori generici
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Errore interno del server' });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
```
</details>

## Sfide Extra (Opzionali)
1. Aggiungi paginazione ai risultati (es. `?page=1&limit=10`)
2. Implementa ordinamento (es. `?sortBy=price&order=asc`)
3. Aggiungi ricerca per nome (es. `?search=laptop`)
4. Crea un endpoint per statistiche (conteggio prodotti per categoria, prezzo medio, ecc.)
