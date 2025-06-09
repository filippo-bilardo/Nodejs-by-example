# Modellazione dei Dati in MongoDB

## Introduzione alla Modellazione dei Dati

La modellazione dei dati è il processo di creazione di una struttura che rappresenti efficacemente le informazioni di un'applicazione. In MongoDB, questo processo differisce significativamente dai database relazionali tradizionali, poiché il modello orientato ai documenti offre approcci alternativi per rappresentare dati e relazioni.

Una buona modellazione dei dati in MongoDB deve bilanciare diversi fattori:

- Requisiti di lettura e scrittura dell'applicazione
- Relazioni tra i dati
- Proprietà di crescita dei dati
- Requisiti di coerenza e disponibilità

In questo capitolo, esploreremo le strategie e le best practices per modellare i dati in MongoDB, con particolare attenzione all'integrazione con Node.js e Mongoose.

## Principi di Base della Modellazione in MongoDB

### Modello Orientato ai Documenti vs Modello Relazionale

Per comprendere la modellazione in MongoDB, è utile confrontarla con l'approccio relazionale:

| Aspetto | MongoDB (Orientato ai Documenti) | Database Relazionali |
|---------|-----------------------------------|----------------------|
| Struttura | Documenti JSON flessibili | Tabelle con righe e colonne |
| Schema | Dinamico, può variare tra documenti | Rigido, definito in anticipo |
| Relazioni | Documenti incorporati o riferimenti | Chiavi esterne e join |
| Normalizzazione | Spesso denormalizzato per prestazioni | Normalizzato per ridurre ridondanza |
| Query | Ottimizzato per operazioni su documenti singoli | Ottimizzato per join tra tabelle |

### Considerazioni Chiave

1. **Modello di accesso ai dati**: Come e quanto spesso i dati vengono letti o scritti
2. **Relazioni tra entità**: Cardinalità (uno-a-uno, uno-a-molti, molti-a-molti)
3. **Crescita dei dati**: Quanto rapidamente crescono le collezioni e i documenti
4. **Atomicità**: Quali operazioni devono essere atomiche
5. **Coerenza**: Quali livelli di coerenza sono richiesti

## Strategie di Modellazione

### 1. Documenti Incorporati (Embedding)

L'incorporamento consiste nell'inserire documenti correlati all'interno di un documento principale, creando una struttura gerarchica.

#### Esempio: Utente con Indirizzi Incorporati

```json
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@example.com",
  "indirizzi": [
    {
      "tipo": "casa",
      "via": "Via Roma 123",
      "città": "Milano",
      "cap": "20100",
      "principale": true
    },
    {
      "tipo": "ufficio",
      "via": "Via Dante 45",
      "città": "Milano",
      "cap": "20121",
      "principale": false
    }
  ]
}
```

#### Vantaggi dell'Incorporamento

- **Prestazioni di lettura**: Recupero di tutte le informazioni correlate con una singola query
- **Atomicità**: Le operazioni su un singolo documento sono atomiche
- **Coerenza**: I dati correlati sono sempre aggiornati insieme

#### Svantaggi dell'Incorporamento

- **Dimensione dei documenti**: Può portare a documenti molto grandi (limite di 16MB)
- **Duplicazione**: Può richiedere aggiornamenti in più punti
- **Prestazioni di scrittura**: Aggiornare un documento grande può essere meno efficiente

#### Quando Usare l'Incorporamento

- Relazioni "contenimento" (un'entità è parte di un'altra)
- Relazioni uno-a-pochi con dati che vengono sempre acceduti insieme
- Dati che cambiano insieme o richiedono atomicità
- Dati che non crescono indefinitamente

### 2. Riferimenti (References)

I riferimenti consistono nel memorizzare l'ID di un documento in un altro documento, creando una relazione simile alle chiavi esterne nei database relazionali.

#### Esempio: Post con Riferimenti ad Autore e Commenti

```json
// Documento Post
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb5"),
  "titolo": "Introduzione a MongoDB",
  "contenuto": "MongoDB è un database NoSQL...",
  "autoreId": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "commentiIds": [
    ObjectId("60f1a5c8e754a62f8bac9cb6"),
    ObjectId("60f1a5c8e754a62f8bac9cb7")
  ],
  "dataCreazione": ISODate("2023-07-15T10:30:00Z")
}

// Documento Utente (Autore)
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@example.com"
}

// Documento Commento
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb6"),
  "postId": ObjectId("60f1a5c8e754a62f8bac9cb5"),
  "autoreId": ObjectId("60f1a5c8e754a62f8bac9cb8"),
  "testo": "Ottimo articolo!",
  "data": ISODate("2023-07-15T14:25:00Z")
}
```

#### Vantaggi dei Riferimenti

- **Dimensione dei documenti**: Documenti più piccoli
- **Flessibilità**: Più facile modificare o estendere i dati correlati
- **Evita duplicazione**: I dati sono memorizzati in un solo posto

#### Svantaggi dei Riferimenti

- **Prestazioni di lettura**: Richiede più query per recuperare dati correlati
- **Complessità**: Gestione manuale delle relazioni
- **Atomicità**: Le operazioni su più documenti non sono atomiche (a meno di usare transazioni)

#### Quando Usare i Riferimenti

- Relazioni molti-a-molti
- Relazioni uno-a-molti con "molti" potenzialmente grande
- Dati che vengono spesso acceduti indipendentemente
- Dati che cambiano frequentemente
- Dati che potrebbero crescere indefinitamente

### 3. Approccio Ibrido

In molti casi, un approccio ibrido che combina incorporamento e riferimenti può offrire il miglior equilibrio tra prestazioni e flessibilità.

#### Esempio: Post con Autore Incorporato e Riferimenti ai Commenti

```json
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb5"),
  "titolo": "Introduzione a MongoDB",
  "contenuto": "MongoDB è un database NoSQL...",
  "autore": {
    "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
    "nome": "Mario",
    "cognome": "Rossi"
  },
  "commentiIds": [
    ObjectId("60f1a5c8e754a62f8bac9cb6"),
    ObjectId("60f1a5c8e754a62f8bac9cb7")
  ],
  "commentiRecenti": [
    {
      "_id": ObjectId("60f1a5c8e754a62f8bac9cb6"),
      "autore": "Luigi Verdi",
      "testo": "Ottimo articolo!",
      "data": ISODate("2023-07-15T14:25:00Z")
    }
  ],
  "numeroCommenti": 2,
  "dataCreazione": ISODate("2023-07-15T10:30:00Z")
}
```

In questo esempio:
- Le informazioni essenziali dell'autore sono incorporate per evitare una query aggiuntiva
- I commenti sono referenziati per evitare che il documento cresca troppo
- I commenti più recenti sono incorporati per visualizzazione immediata
- Un contatore tiene traccia del numero totale di commenti

## Modellazione di Relazioni Comuni

### Relazione Uno-a-Uno

Le relazioni uno-a-uno possono essere modellate in due modi:

#### 1. Incorporamento (Preferito)

```json
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@example.com",
  "profilo": {
    "biografia": "Sviluppatore web con 10 anni di esperienza...",
    "avatar": "https://example.com/avatar.jpg",
    "socialLinks": {
      "twitter": "@mariorossi",
      "linkedin": "linkedin.com/in/mariorossi"
    }
  }
}
```

#### 2. Riferimento

```json
// Utente
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@example.com",
  "profiloId": ObjectId("60f1a5c8e754a62f8bac9cb9")
}

// Profilo
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb9"),
  "utenteId": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "biografia": "Sviluppatore web con 10 anni di esperienza...",
  "avatar": "https://example.com/avatar.jpg",
  "socialLinks": {
    "twitter": "@mariorossi",
    "linkedin": "linkedin.com/in/mariorossi"
  }
}
```

### Relazione Uno-a-Molti

#### 1. Array di Documenti Incorporati (per "pochi" elementi)

```json
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@example.com",
  "ordini": [
    {
      "numero": "ORD-2023-001",
      "data": ISODate("2023-06-10T15:30:00Z"),
      "totale": 125.50,
      "stato": "consegnato"
    },
    {
      "numero": "ORD-2023-002",
      "data": ISODate("2023-07-05T09:15:00Z"),
      "totale": 75.20,
      "stato": "in elaborazione"
    }
  ]
}
```

#### 2. Riferimenti dal Lato "Molti" (per molti elementi)

```json
// Utente
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@example.com"
}

// Ordini
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cba"),
  "utenteId": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "numero": "ORD-2023-001",
  "data": ISODate("2023-06-10T15:30:00Z"),
  "totale": 125.50,
  "stato": "consegnato",
  "prodotti": [...]
}

{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cbb"),
  "utenteId": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "numero": "ORD-2023-002",
  "data": ISODate("2023-07-05T09:15:00Z"),
  "totale": 75.20,
  "stato": "in elaborazione",
  "prodotti": [...]
}
```

#### 3. Array di Riferimenti (per accesso bidirezionale)

```json
// Utente
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@example.com",
  "ordiniIds": [
    ObjectId("60f1a5c8e754a62f8bac9cba"),
    ObjectId("60f1a5c8e754a62f8bac9cbb")
  ]
}

// Ordini (come sopra)
```

### Relazione Molti-a-Molti

#### 1. Array di Riferimenti su Entrambi i Lati

```json
// Studente
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "nome": "Mario",
  "cognome": "Rossi",
  "corsiIds": [
    ObjectId("60f1a5c8e754a62f8bac9cbc"),
    ObjectId("60f1a5c8e754a62f8bac9cbd")
  ]
}

// Corso
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cbc"),
  "nome": "Introduzione a MongoDB",
  "docente": "Prof. Bianchi",
  "studentiIds": [
    ObjectId("60f1a5c8e754a62f8bac9cb4"),
    ObjectId("60f1a5c8e754a62f8bac9cbe")
  ]
}
```

#### 2. Collezione di Relazioni

```json
// Studente
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "nome": "Mario",
  "cognome": "Rossi"
}

// Corso
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cbc"),
  "nome": "Introduzione a MongoDB",
  "docente": "Prof. Bianchi"
}

// Iscrizione (collezione separata)
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cbf"),
  "studenteId": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "corsoId": ObjectId("60f1a5c8e754a62f8bac9cbc"),
  "dataIscrizione": ISODate("2023-05-15T00:00:00Z"),
  "voto": 28
}
```

## Pattern di Modellazione Comuni

### 1. Pattern di Subset

Incorpora un sottoinsieme dei dati più rilevanti o frequentemente acceduti, mantenendo i dati completi in un'altra collezione.

```json
// Prodotto (dati completi)
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cc0"),
  "nome": "Smartphone XYZ",
  "marca": "TechBrand",
  "prezzo": 599.99,
  "descrizione": "Lorem ipsum dolor sit amet...",
  "specifiche": { ... },
  "recensioni": [ ... ],
  "immagini": [ ... ],
  "disponibilità": 45,
  "categorie": [ ... ]
}

// Carrello con subset di prodotti
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cc1"),
  "utenteId": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "prodotti": [
    {
      "prodottoId": ObjectId("60f1a5c8e754a62f8bac9cc0"),
      "nome": "Smartphone XYZ",
      "prezzo": 599.99,
      "immagine": "https://example.com/img/xyz-thumb.jpg",
      "quantità": 1
    },
    // Altri prodotti...
  ],
  "totale": 599.99,
  "dataCreazione": ISODate("2023-07-15T10:30:00Z")
}
```

### 2. Pattern di Aggregazione Estesa

Memorizza dati pre-aggregati per ottimizzare le query di analisi.

```json
// Vendite giornaliere
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cc2"),
  "data": ISODate("2023-07-15T00:00:00Z"),
  "totaleVendite": 12580.75,
  "numeroOrdini": 47,
  "prodottiVenduti": 124,
  "venditeProdotto": {
    "Smartphone XYZ": {
      "quantità": 5,
      "ricavo": 2999.95
    },
    // Altri prodotti...
  },
  "venditePerCategoria": {
    "Elettronica": 8750.50,
    "Accessori": 3830.25
  }
}
```

### 3. Pattern di Albero

Rappresenta strutture gerarchiche come categorie o commenti annidati.

#### Approccio con Array di Antenati

```json
// Categorie
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cc3"),
  "nome": "Elettronica",
  "path": [],
  "livello": 0
}

{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cc4"),
  "nome": "Smartphone",
  "path": [ObjectId("60f1a5c8e754a62f8bac9cc3")],
  "livello": 1
}

{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cc5"),
  "nome": "Android",
  "path": [ObjectId("60f1a5c8e754a62f8bac9cc3"), ObjectId("60f1a5c8e754a62f8bac9cc4")],
  "livello": 2
}
```

### 4. Pattern di Versioning

Mantiene la cronologia delle modifiche a un documento.

```json
// Documento corrente
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cc6"),
  "titolo": "Guida a MongoDB",
  "contenuto": "Versione aggiornata del contenuto...",
  "autore": "Mario Rossi",
  "versione": 3,
  "ultimaModifica": ISODate("2023-07-15T10:30:00Z")
}

// Collezione delle versioni
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cc7"),
  "documentoId": ObjectId("60f1a5c8e754a62f8bac9cc6"),
  "titolo": "Introduzione a MongoDB",
  "contenuto": "Versione originale del contenuto...",
  "autore": "Mario Rossi",
  "versione": 1,
  "dataCreazione": ISODate("2023-07-10T14:20:00Z")
}

{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cc8"),
  "documentoId": ObjectId("60f1a5c8e754a62f8bac9cc6"),
  "titolo": "Guida Completa a MongoDB",
  "contenuto": "Seconda versione del contenuto...",
  "autore": "Mario Rossi",
  "versione": 2,
  "dataCreazione": ISODate("2023-07-12T09:45:00Z")
}
```

## Modellazione con Mongoose

Mongoose facilita la modellazione dei dati in MongoDB attraverso schemi, validazione e middleware.

### Definizione di Schemi e Relazioni

```javascript
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema Utente
const utenteSchema = new Schema({
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Relazione uno-a-uno (incorporata)
  profilo: {
    biografia: String,
    avatar: String,
    socialLinks: {
      twitter: String,
      linkedin: String
    }
  },
  // Relazione uno-a-molti (riferimenti)
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  // Relazione molti-a-molti (riferimenti)
  gruppi: [{ type: Schema.Types.ObjectId, ref: 'Gruppo' }],
  dataRegistrazione: { type: Date, default: Date.now }
});

// Schema Post
const postSchema = new Schema({
  titolo: { type: String, required: true },
  contenuto: { type: String, required: true },
  // Relazione molti-a-uno (riferimento)
  autore: { type: Schema.Types.ObjectId, ref: 'Utente', required: true },
  // Relazione uno-a-molti (incorporata)
  commenti: [{
    testo: { type: String, required: true },
    autore: { type: Schema.Types.ObjectId, ref: 'Utente' },
    data: { type: Date, default: Date.now }
  }],
  // Relazione molti-a-molti (riferimenti)
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  dataCreazione: { type: Date, default: Date.now }
});

// Schema Gruppo
const gruppoSchema = new Schema({
  nome: { type: String, required: true },
  descrizione: String,
  // Relazione molti-a-molti (riferimenti)
  membri: [{ type: Schema.Types.ObjectId, ref: 'Utente' }],
  dataCreazione: { type: Date, default: Date.now }
});

// Schema Tag
const tagSchema = new Schema({
  nome: { type: String, required: true, unique: true },
  // Relazione molti-a-molti (riferimenti)
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
});

// Creazione dei modelli
const Utente = mongoose.model('Utente', utenteSchema);
const Post = mongoose.model('Post', postSchema);
const Gruppo = mongoose.model('Gruppo', gruppoSchema);
const Tag = mongoose.model('Tag', tagSchema);

module.exports = { Utente, Post, Gruppo, Tag };
```

### Gestione delle Relazioni con Mongoose

```javascript
// Creazione di un utente con profilo incorporato
async function creaUtente() {
  try {
    const utente = await Utente.create({
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario.rossi@example.com',
      password: 'password123',
      profilo: {
        biografia: 'Sviluppatore web con 10 anni di esperienza',
        avatar: 'https://example.com/avatar.jpg',
        socialLinks: {
          twitter: '@mariorossi',
          linkedin: 'linkedin.com/in/mariorossi'
        }
      }
    });
    
    return utente;
  } catch (error) {
    console.error('Errore durante la creazione dell\'utente:', error);
    throw error;
  }
}

// Creazione di un post con riferimento all'autore
async function creaPost(utenteId) {
  try {
    const post = await Post.create({
      titolo: 'Introduzione a MongoDB',
      contenuto: 'MongoDB è un database NoSQL...',
      autore: utenteId
    });
    
    // Aggiorna l'array dei post dell'utente
    await Utente.findByIdAndUpdate(
      utenteId,
      { $push: { posts: post._id } }
    );
    
    return post;
  } catch (error) {
    console.error('Errore durante la creazione del post:', error);
    throw error;
  }
}

// Aggiunta di un commento a un post
async function aggiungiCommento(postId, utenteId, testo) {
  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { 
        $push: { 
          commenti: {
            testo,
            autore: utenteId,
            data: new Date()
          }
        }
      },
      { new: true }
    );
    
    return post;
  } catch (error) {
    console.error('Errore durante l\'aggiunta del commento:', error);
    throw error;
  }
}

// Gestione di una relazione molti-a-molti
async function aggiungiUtenteAGruppo(utenteId, gruppoId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Aggiorna il gruppo
    await Gruppo.findByIdAndUpdate(
      gruppoId,
      { $addToSet: { membri: utenteId } },
      { session }
    );
    
    // Aggiorna l'utente
    await Utente.findByIdAndUpdate(
      utenteId,
      { $addToSet: { gruppi: gruppoId } },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Errore durante l\'aggiunta dell\'utente al gruppo:', error);
    throw error;
  }
}
```

## Best Practices per la Modellazione dei Dati

- Progettare lo schema in base ai modelli di accesso dell'applicazione
- Combinare oggetti in un unico documento se verranno utilizzati insieme
- Duplicare i dati (denormalizzare) quando necessario per migliorare le prestazioni di lettura
- Riferirsi ad altri documenti tramite riferimenti quando i dati cambiano frequentemente
- Utilizzare array incorporati per relazioni uno-a-molti quando la cardinalità è limitata
- Considerare l'impatto delle operazioni di scrittura sul modello di dati
- Evitare documenti che crescono in modo illimitato nel tempo
- Utilizzare indici appropriati per supportare i modelli di query comuni
- Testare il modello di dati con volumi di dati realistici

## Navigazione

- [Indice del Corso Node.js](../../README.md)
- [Modulo 11: MongoDB](../README.md)
- [Precedente: Mongoose](./04-mongoose.md)
- [Torna all'Introduzione NoSQL](./01-introduzione-nosql.md)