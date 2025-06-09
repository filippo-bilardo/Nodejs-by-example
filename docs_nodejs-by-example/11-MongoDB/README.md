# Esercitazione 11: Database NoSQL - MongoDB

## Introduzione

In questa esercitazione esploreremo MongoDB, uno dei database NoSQL più popolari e utilizzati nel mondo Node.js. MongoDB è un database orientato ai documenti che offre alta scalabilità, flessibilità e prestazioni. La sua integrazione con Node.js è particolarmente efficace grazie al driver nativo e all'ODM Mongoose.

## Obiettivi

- Comprendere i concetti fondamentali dei database NoSQL
- Installare e configurare MongoDB
- Eseguire operazioni CRUD (Create, Read, Update, Delete) con MongoDB
- Integrare MongoDB in un'applicazione Node.js
- Utilizzare Mongoose per semplificare l'interazione con MongoDB

## Prerequisiti

- Conoscenza di base di Node.js
- Comprensione dei concetti di database
- Node.js installato sul sistema

## Installazione di MongoDB

### Windows

1. Scarica l'installer di MongoDB Community Edition dal [sito ufficiale](https://www.mongodb.com/try/download/community)
2. Esegui l'installer e segui le istruzioni
3. Aggiungi il percorso di MongoDB alle variabili d'ambiente (opzionale)

### macOS

```bash
# Usando Homebrew
brew tap mongodb/brew
brew install mongodb-community
```

### Linux (Ubuntu)

```bash
# Importa la chiave pubblica
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Crea un file di lista per MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Aggiorna i pacchetti e installa MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org
```

## Avvio di MongoDB

```bash
# Windows (come servizio)
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

## Esercizio 1: Connessione a MongoDB da Node.js

Creiamo una semplice applicazione Node.js che si connette a MongoDB:

1. Crea una nuova cartella per il progetto
2. Inizializza un progetto Node.js con `npm init -y`
3. Installa il driver MongoDB: `npm install mongodb`
4. Crea un file `connection.js` con il seguente codice:

```javascript
const { MongoClient } = require('mongodb');

// URI di connessione (modificare se necessario)
const uri = 'mongodb://localhost:27017';
const dbName = 'esercitazione11';

async function connectToMongoDB() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connesso con successo a MongoDB!');
    
    const db = client.db(dbName);
    return { client, db };
  } catch (error) {
    console.error('Errore di connessione a MongoDB:', error);
    throw error;
  }
}

module.exports = { connectToMongoDB };
```

5. Crea un file `app.js` per testare la connessione:

```javascript
const { connectToMongoDB } = require('./connection');

async function main() {
  try {
    const { client, db } = await connectToMongoDB();
    console.log('Database disponibile:', db.databaseName);
    
    // Chiudi la connessione
    await client.close();
    console.log('Connessione chiusa');
  } catch (error) {
    console.error('Errore nell\'applicazione:', error);
  }
}

main();
```

## Esercizio 2: Operazioni CRUD di Base

Crea un file `crud.js` con le seguenti operazioni:

```javascript
const { connectToMongoDB } = require('./connection');

async function eseguiOperazioniCRUD() {
  let client;
  try {
    const { client: mongoClient, db } = await connectToMongoDB();
    client = mongoClient;
    const collection = db.collection('utenti');
    
    // Create: inserimento di un documento
    const risultatoInserimento = await collection.insertOne({
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario.rossi@example.com',
      età: 30,
      dataRegistrazione: new Date()
    });
    console.log('Documento inserito:', risultatoInserimento.insertedId);
    
    // Read: lettura di documenti
    const utente = await collection.findOne({ nome: 'Mario' });
    console.log('Utente trovato:', utente);
    
    // Update: aggiornamento di un documento
    const risultatoAggiornamento = await collection.updateOne(
      { nome: 'Mario' },
      { $set: { età: 31, ultimoAccesso: new Date() } }
    );
    console.log('Documento aggiornato:', risultatoAggiornamento.modifiedCount);
    
    // Read dopo l'aggiornamento
    const utenteAggiornato = await collection.findOne({ nome: 'Mario' });
    console.log('Utente aggiornato:', utenteAggiornato);
    
    // Delete: eliminazione di un documento
    const risultatoEliminazione = await collection.deleteOne({ nome: 'Mario' });
    console.log('Documento eliminato:', risultatoEliminazione.deletedCount);
    
  } catch (error) {
    console.error('Errore durante le operazioni CRUD:', error);
  } finally {
    if (client) await client.close();
    console.log('Connessione chiusa');
  }
}

eseguiOperazioniCRUD();
```

## Esercizio 3: Utilizzo di Mongoose

Mongoose è un ODM (Object Data Modeling) per MongoDB e Node.js che fornisce una soluzione elegante per la modellazione dei dati.

1. Installa Mongoose: `npm install mongoose`
2. Crea un file `mongoose-connection.js`:

```javascript
const mongoose = require('mongoose');

// URI di connessione
const uri = 'mongodb://localhost:27017/esercitazione11';

async function connectWithMongoose() {
  try {
    await mongoose.connect(uri);
    console.log('Connesso a MongoDB con Mongoose!');
  } catch (error) {
    console.error('Errore di connessione con Mongoose:', error);
    throw error;
  }
}

module.exports = { connectWithMongoose, mongoose };
```

3. Crea un file `models/utente.js` per definire uno schema:

```javascript
const { mongoose } = require('../mongoose-connection');

// Definizione dello schema
const utenteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  età: { type: Number, min: 18, max: 120 },
  attivo: { type: Boolean, default: true },
  dataRegistrazione: { type: Date, default: Date.now },
  interessi: [String]
});

// Metodi personalizzati
utenteSchema.methods.nomeCompleto = function() {
  return `${this.nome} ${this.cognome}`;
};

// Metodi statici
utenteSchema.statics.trovaMaggiorenni = function() {
  return this.find({ età: { $gte: 18 } });
};

// Middleware (hooks)
utenteSchema.pre('save', function(next) {
  console.log(`Salvataggio utente: ${this.nome}`);
  next();
});

// Creazione del modello
const Utente = mongoose.model('Utente', utenteSchema);

module.exports = Utente;
```

4. Crea un file `mongoose-crud.js` per testare Mongoose:

```javascript
const { connectWithMongoose } = require('./mongoose-connection');
const Utente = require('./models/utente');

async function eseguiOperazioniMongoose() {
  try {
    await connectWithMongoose();
    
    // Create: creazione di un nuovo utente
    const nuovoUtente = new Utente({
      nome: 'Luigi',
      cognome: 'Verdi',
      email: 'luigi.verdi@example.com',
      età: 25,
      interessi: ['sport', 'musica', 'tecnologia']
    });
    
    await nuovoUtente.save();
    console.log('Utente salvato:', nuovoUtente);
    console.log('Nome completo:', nuovoUtente.nomeCompleto());
    
    // Read: ricerca di utenti
    const utenti = await Utente.find();
    console.log('Tutti gli utenti:', utenti);
    
    const maggiorenni = await Utente.trovaMaggiorenni();
    console.log('Utenti maggiorenni:', maggiorenni);
    
    // Update: aggiornamento di un utente
    const risultatoAggiornamento = await Utente.updateOne(
      { nome: 'Luigi' },
      { $set: { età: 26 }, $push: { interessi: 'cinema' } }
    );
    console.log('Aggiornamento:', risultatoAggiornamento);
    
    // Read dopo l'aggiornamento
    const utenteAggiornato = await Utente.findOne({ nome: 'Luigi' });
    console.log('Utente aggiornato:', utenteAggiornato);
    
    // Delete: eliminazione di un utente
    const risultatoEliminazione = await Utente.deleteOne({ nome: 'Luigi' });
    console.log('Eliminazione:', risultatoEliminazione);
    
  } catch (error) {
    console.error('Errore durante le operazioni Mongoose:', error);
  } finally {
    // Chiudi la connessione
    await mongoose.connection.close();
    console.log('Connessione Mongoose chiusa');
  }
}

eseguiOperazioniMongoose();
```

## Esercizio 4: Integrazione con Express.js

Creiamo una semplice API REST utilizzando Express.js e MongoDB:

1. Installa le dipendenze necessarie: `npm install express mongoose body-parser`
2. Crea un file `server.js`:

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const { connectWithMongoose } = require('./mongoose-connection');
const Utente = require('./models/utente');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Connessione al database
connectWithMongoose().catch(err => {
  console.error('Impossibile connettersi al database', err);
  process.exit(1);
});

// Routes
app.get('/', (req, res) => {
  res.send('API MongoDB - Esercitazione 11');
});

// GET tutti gli utenti
app.get('/api/utenti', async (req, res) => {
  try {
    const utenti = await Utente.find();
    res.json(utenti);
  } catch (error) {
    res.status(500).json({ errore: error.message });
  }
});

// GET utente per ID
app.get('/api/utenti/:id', async (req, res) => {
  try {
    const utente = await Utente.findById(req.params.id);
    if (!utente) return res.status(404).json({ errore: 'Utente non trovato' });
    res.json(utente);
  } catch (error) {
    res.status(500).json({ errore: error.message });
  }
});

// POST nuovo utente
app.post('/api/utenti', async (req, res) => {
  try {
    const nuovoUtente = new Utente(req.body);
    await nuovoUtente.save();
    res.status(201).json(nuovoUtente);
  } catch (error) {
    res.status(400).json({ errore: error.message });
  }
});

// PUT aggiorna utente
app.put('/api/utenti/:id', async (req, res) => {
  try {
    const utente = await Utente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!utente) return res.status(404).json({ errore: 'Utente non trovato' });
    res.json(utente);
  } catch (error) {
    res.status(400).json({ errore: error.message });
  }
});

// DELETE elimina utente
app.delete('/api/utenti/:id', async (req, res) => {
  try {
    const utente = await Utente.findByIdAndDelete(req.params.id);
    if (!utente) return res.status(404).json({ errore: 'Utente non trovato' });
    res.json({ messaggio: 'Utente eliminato con successo' });
  } catch (error) {
    res.status(500).json({ errore: error.message });
  }
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
```

## Sfide Aggiuntive

1. **Relazioni tra documenti**: Implementa relazioni tra diversi modelli (es. Utenti e Post)
2. **Aggregazioni**: Utilizza il framework di aggregazione di MongoDB per eseguire query complesse
3. **Paginazione**: Implementa la paginazione per le API che restituiscono molti risultati
4. **Ricerca full-text**: Configura indici di testo e implementa funzionalità di ricerca
5. **Autenticazione**: Integra l'autenticazione JWT con MongoDB

## Risorse Utili

- [Documentazione ufficiale di MongoDB](https://docs.mongodb.com/)
- [Documentazione di Mongoose](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - Corsi gratuiti su MongoDB

## Argomenti Teorici Collegati

- [1. Introduzione ai Database NoSQL](./teoria/01-introduzione-nosql.md)
- [2. MongoDB: Concetti Fondamentali](./teoria/02-mongodb-concetti.md)
- [3. Operazioni CRUD in MongoDB](./teoria/03-mongodb-crud.md)
- [4. Mongoose: ODM per MongoDB](./teoria/04-mongoose.md)
- [5. Modellazione dei Dati in MongoDB](./teoria/05-modellazione-dati.md)