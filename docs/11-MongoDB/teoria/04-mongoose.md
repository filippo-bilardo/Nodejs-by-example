# Mongoose: ODM per MongoDB

## Introduzione a Mongoose

Mongoose è un Object Document Mapper (ODM) per MongoDB e Node.js che fornisce una soluzione elegante per la modellazione dei dati. Agisce come un livello di astrazione tra l'applicazione e il database, offrendo funzionalità avanzate come la validazione dei dati, la definizione di schemi, i middleware e molto altro.

A differenza del driver nativo di MongoDB, che offre un'API di basso livello per interagire direttamente con il database, Mongoose introduce un approccio più strutturato e orientato agli oggetti, rendendo il codice più organizzato, manutenibile e robusto.

## Installazione e Configurazione

### Installazione

```bash
npm install mongoose
```

### Connessione al Database

```javascript
const mongoose = require('mongoose');

// URI di connessione
const uri = 'mongodb://localhost:27017/miodb';

// Opzioni di connessione
const opzioni = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Altre opzioni...
};

// Connessione al database
mongoose.connect(uri, opzioni)
  .then(() => console.log('Connesso a MongoDB con Mongoose'))
  .catch(err => console.error('Errore di connessione:', err));

// Gestione degli eventi di connessione
mongoose.connection.on('connected', () => {
  console.log('Mongoose connesso a', uri);
});

mongoose.connection.on('error', (err) => {
  console.error('Errore di connessione Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnesso');
});

// Chiusura della connessione quando l'applicazione termina
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Connessione Mongoose chiusa per terminazione applicazione');
  process.exit(0);
});
```

## Schemi e Modelli

I concetti fondamentali di Mongoose sono gli schemi e i modelli.

### Schema

Uno schema definisce la struttura dei documenti all'interno di una collezione, specificando i campi, i tipi di dati, i valori predefiniti e i validatori.

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definizione dello schema
const utenteSchema = new Schema({
  nome: { 
    type: String, 
    required: true,
    trim: true
  },
  cognome: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Inserisci un indirizzo email valido']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  età: { 
    type: Number, 
    min: 18, 
    max: 120 
  },
  attivo: { 
    type: Boolean, 
    default: true 
  },
  ruolo: {
    type: String,
    enum: ['utente', 'admin', 'editor'],
    default: 'utente'
  },
  interessi: [String],
  indirizzo: {
    via: String,
    città: String,
    cap: String,
    paese: { type: String, default: 'Italia' }
  },
  dataRegistrazione: { 
    type: Date, 
    default: Date.now 
  },
  ultimoAccesso: Date,
  metadati: Schema.Types.Mixed // Può contenere qualsiasi tipo di dato
}, {
  timestamps: true, // Aggiunge createdAt e updatedAt
  collection: 'utenti' // Nome personalizzato della collezione (opzionale)
});
```

### Tipi di Dati Supportati

Mongoose supporta i seguenti tipi di dati:

- **String**: Stringhe di testo
- **Number**: Numeri interi o a virgola mobile
- **Date**: Date
- **Buffer**: Dati binari
- **Boolean**: Valori booleani (true/false)
- **Mixed** (Schema.Types.Mixed): Qualsiasi tipo di dato
- **ObjectId** (Schema.Types.ObjectId): ID di MongoDB
- **Array**: Array di valori o documenti
- **Decimal128** (Schema.Types.Decimal128): Numeri decimali a precisione elevata
- **Map**: Mappe chiave-valore

### Modello

Un modello è una classe costruita da uno schema che fornisce un'interfaccia per interagire con una collezione MongoDB.

```javascript
// Creazione del modello
const Utente = mongoose.model('Utente', utenteSchema);

module.exports = Utente;
```

Il primo argomento di `mongoose.model()` è il nome del modello in formato singolare. Mongoose convertirà automaticamente questo nome in plurale e minuscolo per il nome della collezione (es. 'Utente' → 'utenti'), a meno che non sia specificato un nome personalizzato nello schema.

## Operazioni CRUD con Mongoose

### Create: Creazione di Documenti

```javascript
// Metodo 1: Creazione di un'istanza e salvataggio
const nuovoUtente = new Utente({
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario.rossi@example.com',
  password: 'password123',
  età: 30,
  interessi: ['sport', 'musica', 'tecnologia'],
  indirizzo: {
    via: 'Via Roma 123',
    città: 'Milano',
    cap: '20100'
  }
});

try {
  const utenteSalvato = await nuovoUtente.save();
  console.log('Utente salvato:', utenteSalvato);
} catch (error) {
  console.error('Errore durante il salvataggio:', error);
}

// Metodo 2: Utilizzo del metodo create
try {
  const utente = await Utente.create({
    nome: 'Luigi',
    cognome: 'Verdi',
    email: 'luigi.verdi@example.com',
    password: 'password456',
    età: 28,
    interessi: ['cinema', 'viaggi']
  });
  console.log('Utente creato:', utente);
} catch (error) {
  console.error('Errore durante la creazione:', error);
}

// Creazione di più documenti
try {
  const utenti = await Utente.insertMany([
    {
      nome: 'Anna',
      cognome: 'Bianchi',
      email: 'anna.bianchi@example.com',
      password: 'password789',
      età: 35
    },
    {
      nome: 'Paolo',
      cognome: 'Neri',
      email: 'paolo.neri@example.com',
      password: 'passwordabc',
      età: 42
    }
  ]);
  console.log(`${utenti.length} utenti creati`);
} catch (error) {
  console.error('Errore durante la creazione multipla:', error);
}
```

### Read: Lettura di Documenti

```javascript
// Trova tutti i documenti
try {
  const utenti = await Utente.find();
  console.log(`Trovati ${utenti.length} utenti`);
} catch (error) {
  console.error('Errore durante la ricerca:', error);
}

// Trova con filtri
try {
  const utentiMilano = await Utente.find({
    'indirizzo.città': 'Milano',
    età: { $gte: 30 }
  });
  console.log(`Trovati ${utentiMilano.length} utenti a Milano con età >= 30`);
} catch (error) {
  console.error('Errore durante la ricerca con filtri:', error);
}

// Proiezione: seleziona solo alcuni campi
try {
  const utenti = await Utente.find({}, 'nome cognome email -_id');
  console.log('Utenti (solo nome, cognome, email):', utenti);
} catch (error) {
  console.error('Errore durante la proiezione:', error);
}

// Trova un singolo documento
try {
  const utente = await Utente.findOne({ email: 'mario.rossi@example.com' });
  console.log('Utente trovato:', utente);
} catch (error) {
  console.error('Errore durante la ricerca singola:', error);
}

// Trova per ID
try {
  const utente = await Utente.findById('60f1a5c8e754a62f8bac9cb4');
  console.log('Utente trovato per ID:', utente);
} catch (error) {
  console.error('Errore durante la ricerca per ID:', error);
}

// Ordinamento, paginazione e conteggio
try {
  const pagina = 1;
  const elementiPerPagina = 10;
  const skip = (pagina - 1) * elementiPerPagina;
  
  const utenti = await Utente.find()
    .sort({ cognome: 1, nome: 1 })
    .skip(skip)
    .limit(elementiPerPagina);
  
  const totaleUtenti = await Utente.countDocuments();
  
  console.log(`Pagina ${pagina}: ${utenti.length} utenti su ${totaleUtenti} totali`);
} catch (error) {
  console.error('Errore durante la paginazione:', error);
}
```

### Update: Aggiornamento di Documenti

```javascript
// Aggiorna un documento
try {
  const risultato = await Utente.updateOne(
    { email: 'mario.rossi@example.com' },
    { 
      $set: { 
        età: 31,
        'indirizzo.cap': '20101'
      },
      $push: { 
        interessi: 'fotografia' 
      }
    }
  );
  
  console.log(`Documenti trovati: ${risultato.matchedCount}`);
  console.log(`Documenti aggiornati: ${risultato.modifiedCount}`);
} catch (error) {
  console.error('Errore durante l\'aggiornamento:', error);
}

// Aggiorna e restituisci il documento aggiornato
try {
  const utente = await Utente.findOneAndUpdate(
    { email: 'mario.rossi@example.com' },
    { $inc: { età: 1 } },
    { new: true } // Restituisce il documento aggiornato invece dell'originale
  );
  
  console.log('Utente aggiornato:', utente);
} catch (error) {
  console.error('Errore durante findOneAndUpdate:', error);
}

// Aggiorna più documenti
try {
  const risultato = await Utente.updateMany(
    { 'indirizzo.città': 'Milano' },
    { $set: { regione: 'Lombardia' } }
  );
  
  console.log(`Documenti trovati: ${risultato.matchedCount}`);
  console.log(`Documenti aggiornati: ${risultato.modifiedCount}`);
} catch (error) {
  console.error('Errore durante l\'aggiornamento multiplo:', error);
}

// Upsert: inserisci se non esiste, altrimenti aggiorna
try {
  const risultato = await Utente.findOneAndUpdate(
    { email: 'nuovo.utente@example.com' },
    {
      $set: {
        nome: 'Nuovo',
        cognome: 'Utente',
        password: 'passwordxyz',
        dataRegistrazione: new Date()
      }
    },
    {
      upsert: true,
      new: true,
      runValidators: true // Esegue i validatori anche in caso di aggiornamento
    }
  );
  
  console.log('Utente inserito/aggiornato:', risultato);
} catch (error) {
  console.error('Errore durante l\'upsert:', error);
}
```

### Delete: Eliminazione di Documenti

```javascript
// Elimina un documento
try {
  const risultato = await Utente.deleteOne({ email: 'mario.rossi@example.com' });
  console.log(`Documenti eliminati: ${risultato.deletedCount}`);
} catch (error) {
  console.error('Errore durante l\'eliminazione:', error);
}

// Elimina e restituisci il documento eliminato
try {
  const utente = await Utente.findOneAndDelete({ email: 'luigi.verdi@example.com' });
  console.log('Utente eliminato:', utente);
} catch (error) {
  console.error('Errore durante findOneAndDelete:', error);
}

// Elimina più documenti
try {
  const risultato = await Utente.deleteMany({ attivo: false });
  console.log(`Documenti eliminati: ${risultato.deletedCount}`);
} catch (error) {
  console.error('Errore durante l\'eliminazione multipla:', error);
}
```

## Validazione dei Dati

Mongoose offre un potente sistema di validazione per garantire l'integrità dei dati.

### Validatori Integrati

```javascript
const prodottoSchema = new Schema({
  nome: {
    type: String,
    required: [true, 'Il nome del prodotto è obbligatorio'],
    trim: true,
    minlength: [3, 'Il nome deve avere almeno 3 caratteri'],
    maxlength: [50, 'Il nome non può superare i 50 caratteri']
  },
  prezzo: {
    type: Number,
    required: true,
    min: [0, 'Il prezzo non può essere negativo'],
    max: [10000, 'Il prezzo non può superare 10.000']
  },
  codice: {
    type: String,
    unique: true,
    match: [/^[A-Z]{2}\d{4}$/, 'Il codice deve essere nel formato XX0000']
  },
  categoria: {
    type: String,
    enum: {
      values: ['elettronica', 'abbigliamento', 'alimentari', 'casa'],
      message: '{VALUE} non è una categoria valida'
    }
  },
  disponibile: {
    type: Boolean,
    default: true
  },
  dataInserimento: {
    type: Date,
    default: Date.now
  }
});
```

### Validatori Personalizzati

```javascript
const utenteSchema = new Schema({
  // ... altri campi
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // La password deve contenere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: props => 'La password non rispetta i requisiti di sicurezza'
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: async function(v) {
        // Verifica che il dominio email esista
        // Questo è solo un esempio, in un'applicazione reale potresti usare una libreria come email-validator
        const dominio = v.split('@')[1];
        return dominio && dominio.includes('.');
      },
      message: props => `${props.value} non sembra essere un indirizzo email valido`
    }
  }
});
```

### Validazione a Livello di Schema

```javascript
// Validazione personalizzata a livello di schema
utenteSchema.path('email').validate(async function(value) {
  const count = await this.constructor.countDocuments({ email: value });
  return count === 0; // La validazione passa se non ci sono altri documenti con la stessa email
}, 'Email già in uso');

// Validazione pre-save
utenteSchema.pre('save', function(next) {
  if (this.età < 18 && this.ruolo === 'admin') {
    const error = new Error('Gli amministratori devono avere almeno 18 anni');
    return next(error);
  }
  next();
});
```

## Middleware (Hooks)

I middleware di Mongoose permettono di eseguire funzioni in momenti specifici del ciclo di vita di un documento.

### Middleware Pre

```javascript
// Eseguito prima del salvataggio
utenteSchema.pre('save', function(next) {
  console.log(`Salvataggio utente: ${this.nome} ${this.cognome}`);
  
  // Esempio: hash della password prima del salvataggio
  if (this.isModified('password')) {
    // In un'applicazione reale, usare bcrypt o simili
    this.password = 'hashed_' + this.password;
  }
  
  next();
});

// Eseguito prima di una query find
utenteSchema.pre('find', function() {
  console.log('Esecuzione query find');
  this.startTime = Date.now();
});

// Eseguito prima dell'eliminazione
utenteSchema.pre('deleteOne', { document: true }, function(next) {
  console.log(`Eliminazione utente: ${this.nome} ${this.cognome}`);
  next();
});
```

### Middleware Post

```javascript
// Eseguito dopo il salvataggio
utenteSchema.post('save', function(doc, next) {
  console.log(`Utente salvato con ID: ${doc._id}`);
  next();
});

// Eseguito dopo una query find
utenteSchema.post('find', function(result) {
  console.log(`Query find completata in ${Date.now() - this.startTime}ms`);
});

// Eseguito dopo l'eliminazione
utenteSchema.post('deleteOne', { document: true }, function(doc, next) {
  console.log(`Utente eliminato: ${doc.nome} ${doc.cognome}`);
  next();
});
```

## Metodi e Statics

Mongoose permette di definire metodi personalizzati a livello di istanza e di modello.

### Metodi di Istanza

I metodi di istanza operano su documenti specifici.

```javascript
// Definizione di un metodo di istanza
utenteSchema.methods.nomeCompleto = function() {
  return `${this.nome} ${this.cognome}`;
};

utenteSchema.methods.verificaPassword = function(password) {
  // In un'applicazione reale, usare bcrypt.compare o simili
  return 'hashed_' + password === this.password;
};

// Utilizzo
const utente = await Utente.findOne({ email: 'mario.rossi@example.com' });
console.log(utente.nomeCompleto()); // 'Mario Rossi'

if (utente.verificaPassword('password123')) {
  console.log('Password corretta!');
} else {
  console.log('Password errata!');
}
```

### Metodi Statici

I metodi statici operano sul modello stesso.

```javascript
// Definizione di un metodo statico
utenteSchema.statics.trovaMaggiorenni = function() {
  return this.find({ età: { $gte: 18 } });
};

utenteSchema.statics.trovaPerRuolo = function(ruolo) {
  return this.find({ ruolo });
};

// Utilizzo
const maggiorenni = await Utente.trovaMaggiorenni();
console.log(`Trovati ${maggiorenni.length} utenti maggiorenni`);

const admin = await Utente.trovaPerRuolo('admin');
console.log(`Trovati ${admin.length} amministratori`);
```

## Virtuals

I virtuals sono proprietà che non vengono salvate nel database ma possono essere calcolate da altri campi.

```javascript
// Definizione di un virtual
utenteSchema.virtual('nomeCompleto').get(function() {
  return `${this.nome} ${this.cognome}`;
});

utenteSchema.virtual('età').get(function() {
  if (!this.dataNascita) return null;
  const oggi = new Date();
  const dataNascita = new Date(this.dataNascita);
  let età = oggi.getFullYear() - dataNascita.getFullYear();
  if (oggi.getMonth() < dataNascita.getMonth() || 
      (oggi.getMonth() === dataNascita.getMonth() && oggi.getDate() < dataNascita.getDate())) {
    età--;
  }
  return età;
});

// Utilizzo
const utente = await Utente.findOne({ email: 'mario.rossi@example.com' });
console.log(utente.nomeCompleto); // 'Mario Rossi'
```

## Popolamento (Populate)

Mongoose supporta il popolamento di riferimenti tra documenti, simile ai join nei database relazionali.

### Definizione di Riferimenti

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema per i post
const postSchema = new Schema({
  titolo: { type: String, required: true },
  contenuto: { type: String, required: true },
  autore: { 
    type: Schema.Types.ObjectId, 
    ref: 'Utente', // Riferimento al modello Utente
    required: true 
  },
  commenti: [{
    testo: { type: String, required: true },
    autore: { 
      type: Schema.Types.ObjectId, 
      ref: 'Utente' 
    },
    data: { type: Date, default: Date.now }
  }],
  categorie: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Categoria' 
  }],
  dataCreazione: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// Schema per le categorie
const categoriaSchema = new Schema({
  nome: { type: String, required: true, unique: true },
  descrizione: String
});

const Categoria = mongoose.model('Categoria', categoriaSchema);
```

### Popolamento Base

```javascript
// Trova un post e popola il riferimento all'autore
try {
  const post = await Post.findById('60f1a5c8e754a62f8bac9cb4')
    .populate('autore');
  
  console.log('Post:', post.titolo);
  console.log('Autore:', post.autore.nome, post.autore.cognome);
} catch (error) {
  console.error('Errore durante il popolamento:', error);
}
```

### Popolamento Selettivo

```javascript
// Popola solo specifici campi
try {
  const post = await Post.findById('60f1a5c8e754a62f8bac9cb4')
    .populate('autore', 'nome cognome email -_id');
  
  console.log('Autore:', post.autore);
} catch (error) {
  console.error('Errore durante il popolamento selettivo:', error);
}
```

### Popolamento Multiplo

```javascript
// Popola più riferimenti
try {
  const post = await Post.findById('60f1a5c8e754a62f8bac9cb4')
    .populate('autore', 'nome cognome')
    .populate('categorie', 'nome');
  
  console.log('Autore:', post.autore.nome, post.autore.cognome);
  console.log('Categorie:', post.categorie.map(c => c.nome).join(', '));
} catch (error) {
  console.error('Errore durante il popolamento multiplo:', error);
}
```

### Popolamento Annidato

```javascript
// Popola riferimenti annidati
try {
  const post = await Post.findById('60f1a5c8e754a62f8bac9cb4')
    .populate({
      path: 'commenti',
      populate: {
        path: 'autore',
        select: 'nome cognome'
      }
    });
  
  post.commenti.forEach(commento => {
    console.log(`Commento di ${commento.autore.nome} ${commento.autore.cognome}: ${commento.testo}`);
  });
} catch (error) {
  console.error('Errore durante il popolamento annidato:', error);
}
```

### Popolamento Condizionale

```javascript
// Popola con condizioni
try {
  const post = await Post.findById('60f1a5c8e754a62f8bac9cb4')
    .populate({
      path: 'commenti',
      match: { data: { $gte: new Date('2023-01-01') } }, // Solo commenti del 2023 in poi
      options: { sort: { data: -1 } } // Ordina per data decrescente
    });
  
  console.log(`Post: ${post.titolo}`);
  console.log(`Commenti recenti: ${post.commenti.length}`);
} catch (error) {
  console.error('Errore durante il popolamento condizionale:', error);
}
```

## Transazioni

Mongoose supporta le transazioni di MongoDB per eseguire operazioni atomiche su più documenti.

```javascript
async function trasferisciSaldo(daUtenteId, aUtenteId, importo) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Preleva dal primo utente
    const daUtente = await Utente.findByIdAndUpdate(
      daUtenteId,
      { $inc: { saldo: -importo } },
      { new: true, session, runValidators: true }
    );
    
    if (daUtente.saldo < 0) {
      // Rollback se il saldo diventa negativo
      throw new Error('Saldo insufficiente');
    }
    
    // Deposita sul secondo utente
    const aUtente = await Utente.findByIdAndUpdate(
      aUtenteId,
      { $inc: { saldo: importo } },
      { new: true, session }
    );
    
    // Registra la transazione
    await Transazione.create([{
      daUtente: daUtenteId,
      aUtente: aUtenteId,
      importo,
      data: new Date()
    }], { session });
    
    // Commit della transazione
    await session.commitTransaction();
    session.endSession();
    
    return { daUtente, aUtente };
  } catch (error) {
    // Rollback in caso di errore
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
```

## Indici

Mongoose permette di definire indici per migliorare le prestazioni delle query. Gli indici in MongoDB funzionano in modo simile agli indici nei database relazionali, consentendo al database di trovare e recuperare i documenti in modo più efficiente.

### Tipi di Indici

#### Indici Singoli

Gli indici singoli sono i più semplici e indicizzano un solo campo del documento.

```javascript
// Indice singolo (1 per ordine crescente, -1 per ordine decrescente)
utenteSchema.index({ email: 1 }, { unique: true });
utenteSchema.index({ dataRegistrazione: -1 });
```

L'opzione `unique: true` garantisce che non ci siano valori duplicati per il campo indicizzato.

#### Indici Composti

Gli indici composti indicizzano più campi insieme, utili per query che filtrano o ordinano su più campi.

```javascript
// Indice composto
utenteSchema.index({ cognome: 1, nome: 1 });

// Indice composto con opzioni
utenteSchema.index(
  { città: 1, cap: 1 },
  { name: 'indice_località' } // Nome personalizzato dell'indice
);
```

L'ordine dei campi nell'indice è importante: l'indice può essere utilizzato per query che filtrano sul primo campo o su entrambi, ma non solo sul secondo.

#### Indici di Testo

Gli indici di testo consentono ricerche full-text efficienti su campi di tipo stringa.

```javascript
// Indice di testo
postSchema.index(
  { titolo: 'text', contenuto: 'text', tags: 'text' },
  {
    weights: {
      titolo: 10,    // Priorità maggiore
      contenuto: 5,  // Priorità media
      tags: 2        // Priorità minore
    },
    name: 'indice_ricerca_post',
    default_language: 'italian',
    language_override: 'idioma' // Campo che può specificare la lingua per documento
  }
);

// Utilizzo dell'indice di testo
try {
  // Ricerca semplice
  const risultatiBase = await Post.find({ $text: { $search: "mongodb mongoose" } });
  
  // Ricerca con score e ordinamento per rilevanza
  const risultatiOrdinati = await Post.find(
    { $text: { $search: "mongodb mongoose" } },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
  
  // Ricerca con frase esatta
  const risultatiFrase = await Post.find({ $text: { $search: '"database NoSQL"' } });
  
  // Ricerca con esclusione di termini
  const risultatiEsclusione = await Post.find({ $text: { $search: "mongodb -sql" } });
  
  console.log(`Trovati ${risultatiOrdinati.length} risultati`);
} catch (error) {
  console.error('Errore durante la ricerca:', error);
}
```

Nota: MongoDB supporta un solo indice di testo per collezione.

#### Indici Geospaziali

Gli indici geospaziali ottimizzano le query che coinvolgono dati geografici, come la ricerca di luoghi vicini a una determinata posizione.

```javascript
// Schema per luoghi
const luogoSchema = new Schema({
  nome: String,
  posizione: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitudine, latitudine]
  },
  indirizzo: String,
  categoria: String
});

// Indice geospaziale 2dsphere (per coordinate terrestri)
luogoSchema.index({ posizione: '2dsphere' });

// Utilizzo dell'indice geospaziale
try {
  // Trova luoghi entro 5km dal centro di Milano
  const luoghiVicini = await Luogo.find({
    posizione: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [9.1900, 45.4642] // Longitudine, latitudine di Milano
        },
        $maxDistance: 5000 // 5km in metri
      }
    }
  });
  
  // Trova luoghi all'interno di un'area poligonale (es. quartiere)
  const luoghiInArea = await Luogo.find({
    posizione: {
      $geoWithin: {
        $geometry: {
          type: 'Polygon',
          coordinates: [[  // Array di punti che formano il poligono
            [9.18, 45.46],
            [9.20, 45.46],
            [9.20, 45.47],
            [9.18, 45.47],
            [9.18, 45.46]  // Il primo e l'ultimo punto devono coincidere
          ]]
        }
      }
    }
  });
  
  console.log(`Trovati ${luoghiVicini.length} luoghi vicini`);
} catch (error) {
  console.error('Errore durante la ricerca geospaziale:', error);
}
```

#### Indici TTL (Time-To-Live)

Gli indici TTL consentono a MongoDB di eliminare automaticamente i documenti dopo un certo periodo di tempo, utili per dati temporanei come sessioni, log o cache.

```javascript
// Schema per log
const logSchema = new Schema({
  livello: { type: String, enum: ['info', 'warning', 'error'] },
  messaggio: String,
  dettagli: Object,
  dataCreazione: { type: Date, default: Date.now }
});

// Indice TTL (Time-To-Live)
logSchema.index(
  { dataCreazione: 1 },
  { expireAfterSeconds: 86400 } // Elimina documenti dopo 24 ore
);

// Indice TTL con campo di scadenza esplicito
const sessioneSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'Utente' },
  token: String,
  ultimoAccesso: Date,
  scadenza: Date // Data di scadenza esplicita
});

sessioneSchema.index(
  { scadenza: 1 },
  { expireAfterSeconds: 0 } // 0 significa che il documento scade alla data indicata nel campo
);
```

### Opzioni degli Indici

Mongoose supporta varie opzioni per la creazione di indici:

```javascript
utenteSchema.index(
  { email: 1 },
  {
    unique: true,           // Valori unici
    background: true,       // Creazione in background (non blocca altre operazioni)
    sparse: true,           // Indicizza solo documenti dove il campo esiste
    partialFilterExpression: { attivo: true }, // Indicizza solo documenti che soddisfano la condizione
    name: 'idx_email'       // Nome personalizzato dell'indice
  }
);
```

### Gestione degli Indici

```javascript
// Creazione di tutti gli indici definiti nello schema
await mongoose.model('Utente').createIndexes();

// Rimozione di un indice specifico
await mongoose.model('Utente').collection.dropIndex('idx_email');

// Rimozione di tutti gli indici (tranne _id)
await mongoose.model('Utente').collection.dropIndexes();

// Ottenere informazioni sugli indici
const indici = await mongoose.model('Utente').collection.indexes();
console.log('Indici:', indici);
```

### Best Practices per gli Indici

1. **Crea indici per supportare le query comuni**: Analizza i pattern di accesso della tua applicazione
2. **Evita indici inutili**: Ogni indice ha un costo in termini di spazio e prestazioni di scrittura
3. **Monitora l'utilizzo degli indici**: Usa `explain()` per verificare se le query utilizzano gli indici previsti
4. **Considera l'ordine dei campi negli indici composti**: Metti prima i campi usati per l'uguaglianza, poi quelli per l'ordinamento
5. **Usa indici parziali per collezioni grandi**: Riducono lo spazio e migliorano le prestazioni

```javascript
// Esempio di utilizzo di explain() per analizzare una query
const spiegazione = await Utente.find({ email: 'mario.rossi@example.com' }).explain('executionStats');
console.log(JSON.stringify(spiegazione, null, 2));
```

## Navigazione

- [Indice del Corso Node.js](../../README.md)
- [Modulo 11: MongoDB](../README.md)
- [Precedente: MongoDB CRUD](./03-mongodb-crud.md)
- [Successivo: Modellazione dei Dati in MongoDB](./05-modellazione-dati.md)