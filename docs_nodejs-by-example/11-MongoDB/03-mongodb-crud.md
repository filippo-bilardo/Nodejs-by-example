# Operazioni CRUD in MongoDB

## Introduzione alle Operazioni CRUD

Le operazioni CRUD (Create, Read, Update, Delete) rappresentano le funzionalità fondamentali di qualsiasi sistema di gestione di database. In MongoDB, queste operazioni sono implementate attraverso un'API intuitiva e potente che sfrutta la natura orientata ai documenti del database.

In questo capitolo, esploreremo in dettaglio come eseguire ciascuna di queste operazioni in MongoDB, sia attraverso la shell di MongoDB che utilizzando il driver Node.js.

## Connessione a MongoDB

Prima di eseguire qualsiasi operazione, è necessario stabilire una connessione al server MongoDB.

### Connessione tramite MongoDB Shell

```bash
# Connessione a un'istanza locale
mongo

# Connessione a un'istanza remota
mongo "mongodb://username:password@hostname:port/database"

# Connessione a MongoDB Atlas
mongo "mongodb+srv://username:password@cluster.mongodb.net/database"
```

### Connessione tramite Driver Node.js

```javascript
const { MongoClient } = require('mongodb');

// URI di connessione
const uri = 'mongodb://localhost:27017';
const dbName = 'miodb';

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
```

## Create: Inserimento di Documenti

MongoDB offre diverse opzioni per inserire documenti in una collezione.

### Inserimento di un Singolo Documento

#### MongoDB Shell

```javascript
// Seleziona il database
use miodb

// Inserisci un documento
db.utenti.insertOne({
  nome: "Mario",
  cognome: "Rossi",
  email: "mario.rossi@example.com",
  età: 30,
  interessi: ["sport", "musica"],
  dataRegistrazione: new Date()
})
```

#### Driver Node.js

```javascript
async function inserisciUtente(db) {
  try {
    const collection = db.collection('utenti');
    
    const risultato = await collection.insertOne({
      nome: "Mario",
      cognome: "Rossi",
      email: "mario.rossi@example.com",
      età: 30,
      interessi: ["sport", "musica"],
      dataRegistrazione: new Date()
    });
    
    console.log(`Documento inserito con ID: ${risultato.insertedId}`);
    return risultato;
  } catch (error) {
    console.error('Errore durante l\'inserimento:', error);
    throw error;
  }
}
```

### Inserimento di Più Documenti

#### MongoDB Shell

```javascript
db.utenti.insertMany([
  {
    nome: "Luigi",
    cognome: "Verdi",
    email: "luigi.verdi@example.com",
    età: 28,
    interessi: ["cinema", "viaggi"]
  },
  {
    nome: "Anna",
    cognome: "Bianchi",
    email: "anna.bianchi@example.com",
    età: 35,
    interessi: ["lettura", "cucina"]
  }
])
```

#### Driver Node.js

```javascript
async function inserisciPiùUtenti(db) {
  try {
    const collection = db.collection('utenti');
    
    const risultato = await collection.insertMany([
      {
        nome: "Luigi",
        cognome: "Verdi",
        email: "luigi.verdi@example.com",
        età: 28,
        interessi: ["cinema", "viaggi"]
      },
      {
        nome: "Anna",
        cognome: "Bianchi",
        email: "anna.bianchi@example.com",
        età: 35,
        interessi: ["lettura", "cucina"]
      }
    ]);
    
    console.log(`${risultato.insertedCount} documenti inseriti`);
    console.log('ID inseriti:', risultato.insertedIds);
    return risultato;
  } catch (error) {
    console.error('Errore durante l\'inserimento multiplo:', error);
    throw error;
  }
}
```

### Opzioni di Inserimento

- **ordered**: Controlla se l'inserimento deve fermarsi al primo errore (default: true)
- **writeConcern**: Specifica il livello di conferma richiesto per l'operazione

```javascript
db.utenti.insertMany(
  [ /* documenti */ ],
  { ordered: false, writeConcern: { w: "majority", wtimeout: 5000 } }
)
```

## Read: Interrogazione dei Documenti

MongoDB offre un potente sistema di query per recuperare documenti dalle collezioni.

### Recupero di Tutti i Documenti

#### MongoDB Shell

```javascript
// Recupera tutti i documenti
db.utenti.find()

// Limita il numero di risultati e formatta l'output
db.utenti.find().limit(5).pretty()
```

#### Driver Node.js

```javascript
async function trovaTuttiGliUtenti(db) {
  try {
    const collection = db.collection('utenti');
    
    const utenti = await collection.find().toArray();
    console.log(`Trovati ${utenti.length} utenti`);
    return utenti;
  } catch (error) {
    console.error('Errore durante la ricerca:', error);
    throw error;
  }
}
```

### Filtri di Query

#### MongoDB Shell

```javascript
// Query con condizione di uguaglianza
db.utenti.find({ nome: "Mario" })

// Query con operatori di confronto
db.utenti.find({ età: { $gt: 30 } })

// Query con operatori logici
db.utenti.find({
  $or: [
    { età: { $lt: 25 } },
    { età: { $gt: 50 } }
  ]
})

// Query su array
db.utenti.find({ interessi: "sport" })

// Query su documenti annidati
db.utenti.find({ "indirizzo.città": "Milano" })
```

#### Driver Node.js

```javascript
async function cercaUtentiConFiltri(db) {
  try {
    const collection = db.collection('utenti');
    
    // Utenti con età maggiore di 30
    const utentiAdulti = await collection.find({ 
      età: { $gt: 30 } 
    }).toArray();
    
    // Utenti che vivono a Milano
    const utentiMilano = await collection.find({ 
      "indirizzo.città": "Milano" 
    }).toArray();
    
    // Utenti interessati allo sport o alla musica
    const utentiInteressi = await collection.find({ 
      interessi: { $in: ["sport", "musica"] } 
    }).toArray();
    
    return { utentiAdulti, utentiMilano, utentiInteressi };
  } catch (error) {
    console.error('Errore durante la ricerca con filtri:', error);
    throw error;
  }
}
```

### Proiezione: Selezione dei Campi

#### MongoDB Shell

```javascript
// Includi solo specifici campi (1 = includi)
db.utenti.find(
  { età: { $gt: 30 } },
  { nome: 1, cognome: 1, email: 1, _id: 0 }
)

// Escludi specifici campi (0 = escludi)
db.utenti.find(
  { età: { $gt: 30 } },
  { dataRegistrazione: 0, interessi: 0 }
)
```

#### Driver Node.js

```javascript
async function proiezioneUtenti(db) {
  try {
    const collection = db.collection('utenti');
    
    // Includi solo nome, cognome ed email
    const utentiBase = await collection.find(
      {},
      { projection: { nome: 1, cognome: 1, email: 1, _id: 0 } }
    ).toArray();
    
    return utentiBase;
  } catch (error) {
    console.error('Errore durante la proiezione:', error);
    throw error;
  }
}
```

### Ordinamento, Paginazione e Conteggio

#### MongoDB Shell

```javascript
// Ordinamento
db.utenti.find().sort({ età: -1, cognome: 1 })

// Paginazione
db.utenti.find().skip(10).limit(5)

// Conteggio
db.utenti.countDocuments({ età: { $gt: 30 } })
```

#### Driver Node.js

```javascript
async function paginazioneUtenti(db, pagina = 1, elementiPerPagina = 10) {
  try {
    const collection = db.collection('utenti');
    
    // Calcola lo skip in base alla pagina
    const skip = (pagina - 1) * elementiPerPagina;
    
    // Recupera i documenti per la pagina corrente
    const utenti = await collection.find()
      .sort({ cognome: 1, nome: 1 })
      .skip(skip)
      .limit(elementiPerPagina)
      .toArray();
    
    // Conta il totale dei documenti per calcolare il numero totale di pagine
    const totaleDocumenti = await collection.countDocuments();
    const totalePagine = Math.ceil(totaleDocumenti / elementiPerPagina);
    
    return {
      utenti,
      paginaCorrente: pagina,
      elementiPerPagina,
      totalePagine,
      totaleDocumenti
    };
  } catch (error) {
    console.error('Errore durante la paginazione:', error);
    throw error;
  }
}
```

### Metodi di Ricerca Specifici

#### MongoDB Shell

```javascript
// Trova un singolo documento
db.utenti.findOne({ email: "mario.rossi@example.com" })

// Trova per ID
db.utenti.findOne({ _id: ObjectId("60f1a5c8e754a62f8bac9cb4") })
```

#### Driver Node.js

```javascript
async function trovaSingoloUtente(db, email) {
  try {
    const collection = db.collection('utenti');
    
    const utente = await collection.findOne({ email });
    if (!utente) {
      console.log(`Nessun utente trovato con email: ${email}`);
      return null;
    }
    
    console.log('Utente trovato:', utente);
    return utente;
  } catch (error) {
    console.error('Errore durante la ricerca del singolo utente:', error);
    throw error;
  }
}

async function trovaUtentePerId(db, id) {
  try {
    const collection = db.collection('utenti');
    const { ObjectId } = require('mongodb');
    
    const utente = await collection.findOne({ _id: new ObjectId(id) });
    return utente;
  } catch (error) {
    console.error('Errore durante la ricerca per ID:', error);
    throw error;
  }
}
```

## Update: Aggiornamento dei Documenti

MongoDB offre diversi metodi per aggiornare i documenti esistenti.

### Aggiornamento di un Singolo Documento

#### MongoDB Shell

```javascript
// Aggiorna un documento
db.utenti.updateOne(
  { email: "mario.rossi@example.com" },
  { $set: { età: 31, "indirizzo.cap": "20101" } }
)

// Incrementa un valore
db.utenti.updateOne(
  { email: "mario.rossi@example.com" },
  { $inc: { età: 1 } }
)
```

#### Driver Node.js

```javascript
async function aggiornaUtente(db, email, nuoviDati) {
  try {
    const collection = db.collection('utenti');
    
    const risultato = await collection.updateOne(
      { email },
      { $set: nuoviDati }
    );
    
    console.log(`Documenti trovati: ${risultato.matchedCount}`);
    console.log(`Documenti aggiornati: ${risultato.modifiedCount}`);
    
    return risultato;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento:', error);
    throw error;
  }
}
```

### Aggiornamento di Più Documenti

#### MongoDB Shell

```javascript
// Aggiorna tutti i documenti che corrispondono al filtro
db.utenti.updateMany(
  { età: { $lt: 18 } },
  { $set: { minorenne: true } }
)
```

#### Driver Node.js

```javascript
async function aggiornaPiùUtenti(db, filtro, aggiornamento) {
  try {
    const collection = db.collection('utenti');
    
    const risultato = await collection.updateMany(
      filtro,
      aggiornamento
    );
    
    console.log(`Documenti trovati: ${risultato.matchedCount}`);
    console.log(`Documenti aggiornati: ${risultato.modifiedCount}`);
    
    return risultato;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento multiplo:', error);
    throw error;
  }
}

// Esempio di utilizzo
async function aggiornaUtentiMilano(db) {
  return aggiornaPiùUtenti(
    db,
    { "indirizzo.città": "Milano" },
    { $set: { regione: "Lombardia" } }
  );
}
```

### Operatori di Aggiornamento

MongoDB offre numerosi operatori per eseguire aggiornamenti complessi:

- **$set**: Imposta il valore di un campo
- **$unset**: Rimuove un campo
- **$inc**: Incrementa il valore di un campo numerico
- **$mul**: Moltiplica il valore di un campo numerico
- **$min/$max**: Aggiorna solo se il nuovo valore è minore/maggiore
- **$currentDate**: Imposta il valore di un campo alla data corrente

#### Operazioni su Array

- **$push**: Aggiunge un elemento a un array
- **$addToSet**: Aggiunge un elemento a un array solo se non esiste già
- **$pop**: Rimuove il primo o l'ultimo elemento di un array
- **$pull**: Rimuove tutti gli elementi che corrispondono a una condizione
- **$pullAll**: Rimuove tutti gli elementi specificati

```javascript
// Aggiungi un interesse
db.utenti.updateOne(
  { email: "mario.rossi@example.com" },
  { $push: { interessi: "fotografia" } }
)

// Aggiungi più interessi
db.utenti.updateOne(
  { email: "mario.rossi@example.com" },
  { $push: { interessi: { $each: ["cucina", "giardinaggio"] } } }
)

// Rimuovi un interesse
db.utenti.updateOne(
  { email: "mario.rossi@example.com" },
  { $pull: { interessi: "fotografia" } }
)
```

### Upsert: Inserimento o Aggiornamento

L'opzione `upsert` permette di creare un nuovo documento se non esiste un documento che corrisponde al filtro.

#### MongoDB Shell

```javascript
db.utenti.updateOne(
  { email: "nuovo.utente@example.com" },
  { 
    $set: { 
      nome: "Nuovo", 
      cognome: "Utente", 
      dataRegistrazione: new Date() 
    } 
  },
  { upsert: true }
)
```

#### Driver Node.js

```javascript
async function upsertUtente(db, email, dati) {
  try {
    const collection = db.collection('utenti');
    
    const risultato = await collection.updateOne(
      { email },
      { $set: { ...dati, email } },
      { upsert: true }
    );
    
    if (risultato.upsertedCount > 0) {
      console.log(`Nuovo utente inserito con ID: ${risultato.upsertedId}`);
    } else {
      console.log(`Utente aggiornato: ${risultato.modifiedCount} modifiche`);
    }
    
    return risultato;
  } catch (error) {
    console.error('Errore durante l\'upsert:', error);
    throw error;
  }
}
```

### findOneAndUpdate: Aggiornamento con Restituzione

Il metodo `findOneAndUpdate` aggiorna un documento e restituisce il documento originale o quello aggiornato.

#### MongoDB Shell

```javascript
// Restituisce il documento originale
db.utenti.findOneAndUpdate(
  { email: "mario.rossi@example.com" },
  { $inc: { età: 1 } }
)

// Restituisce il documento aggiornato
db.utenti.findOneAndUpdate(
  { email: "mario.rossi@example.com" },
  { $inc: { età: 1 } },
  { returnNewDocument: true }
)
```

#### Driver Node.js

```javascript
async function incrementaEtàERestituisci(db, email) {
  try {
    const collection = db.collection('utenti');
    
    const risultato = await collection.findOneAndUpdate(
      { email },
      { $inc: { età: 1 } },
      { returnDocument: 'after' } // 'before' per il documento originale
    );
    
    if (risultato.value) {
      console.log('Utente aggiornato:', risultato.value);
      return risultato.value;
    } else {
      console.log('Nessun utente trovato con questa email');
      return null;
    }
  } catch (error) {
    console.error('Errore durante findOneAndUpdate:', error);
    throw error;
  }
}
```

## Delete: Eliminazione dei Documenti

MongoDB offre metodi per eliminare documenti dalle collezioni.

### Eliminazione di un Singolo Documento

#### MongoDB Shell

```javascript
// Elimina un documento
db.utenti.deleteOne({ email: "mario.rossi@example.com" })
```

#### Driver Node.js

```javascript
async function eliminaUtente(db, email) {
  try {
    const collection = db.collection('utenti');
    
    const risultato = await collection.deleteOne({ email });
    
    console.log(`Documenti eliminati: ${risultato.deletedCount}`);
    return risultato;
  } catch (error) {
    console.error('Errore durante l\'eliminazione:', error);
    throw error;
  }
}
```

### Eliminazione di Più Documenti

#### MongoDB Shell

```javascript
// Elimina tutti i documenti che corrispondono al filtro
db.utenti.deleteMany({ età: { $lt: 18 } })

// Elimina tutti i documenti nella collezione
db.utenti.deleteMany({})
```

#### Driver Node.js

```javascript
async function eliminaPiùUtenti(db, filtro) {
  try {
    const collection = db.collection('utenti');
    
    const risultato = await collection.deleteMany(filtro);
    
    console.log(`Documenti eliminati: ${risultato.deletedCount}`);
    return risultato;
  } catch (error) {
    console.error('Errore durante l\'eliminazione multipla:', error);
    throw error;
  }
}

// Esempio: elimina utenti inattivi da più di un anno
async function eliminaUtentiInattivi(db) {
  const unAnnoFa = new Date();
  unAnnoFa.setFullYear(unAnnoFa.getFullYear() - 1);
  
  return eliminaPiùUtenti(db, {
    ultimoAccesso: { $lt: unAnnoFa }
  });
}
```

### findOneAndDelete: Eliminazione con Restituzione

Il metodo `findOneAndDelete` elimina un documento e restituisce il documento eliminato.

#### MongoDB Shell

```javascript
db.utenti.findOneAndDelete({ email: "mario.rossi@example.com" })
```

#### Driver Node.js

```javascript
async function eliminaERestituisciUtente(db, email) {
  try {
    const collection = db.collection('utenti');
    
    const risultato = await collection.findOneAndDelete({ email });
    
    if (risultato.value) {
      console.log('Utente eliminato:', risultato.value);
      return risultato.value;
    } else {
      console.log('Nessun utente trovato con questa email');
      return null;
    }
  } catch (error) {
    console.error('Errore durante findOneAndDelete:', error);
    throw error;
  }
}
```

## Operazioni Bulk

MongoDB supporta operazioni bulk per eseguire più operazioni in un'unica richiesta al server, migliorando le prestazioni.

### MongoDB Shell

```javascript
// Operazioni bulk ordinate (si fermano al primo errore)
db.utenti.bulkWrite([
  { insertOne: { document: { nome: "Paolo", email: "paolo@example.com" } } },
  { updateOne: { 
      filter: { email: "mario.rossi@example.com" }, 
      update: { $set: { età: 32 } } 
    } 
  },
  { deleteOne: { filter: { email: "utente.obsoleto@example.com" } } }
])
```

### Driver Node.js

```javascript
async function eseguiOperazioniBulk(db) {
  try {
    const collection = db.collection('utenti');
    
    const risultato = await collection.bulkWrite([
      {
        insertOne: {
          document: { nome: "Paolo", cognome: "Neri", email: "paolo.neri@example.com" }
        }
      },
      {
        updateOne: {
          filter: { email: "mario.rossi@example.com" },
          update: { $set: { età: 32 } }
        }
      },
      {
        deleteOne: {
          filter: { email: "utente.obsoleto@example.com" }
        }
      }
    ]);
    
    console.log('Risultato operazioni bulk:', {
      inseriti: risultato.insertedCount,
      aggiornati: risultato.modifiedCount,
      eliminati: risultato.deletedCount
    });
    
    return risultato;
  } catch (error) {
    console.error('Errore durante le operazioni bulk:', error);
    throw error;
  }
}
```

## Gestione degli Errori

La gestione degli errori è un aspetto importante delle operazioni CRUD in MongoDB.

### Errori Comuni

1. **Errori di connessione**: Problemi di rete o configurazione del server
2. **Errori di autenticazione**: Credenziali non valide
3. **Errori di duplicazione**: Violazione di vincoli di unicità
4. **Errori di validazione**: Dati non conformi allo schema
5. **Errori di timeout**: Operazioni che richiedono troppo tempo

### Gestione degli Errori in Node.js

```javascript
async function operazioneConGestioneErrori(db) {
  try {
    const collection = db.collection('utenti');
    
    // Prova a inserire un documento con email duplicata
    await collection.insertOne({
      nome: "Duplicato",
      email: "mario.rossi@example.com" // Email già esistente
    });
    
  } catch (error) {
    if (error.code === 11000) {
      console.error('Errore di duplicazione:', error.message);
      // Gestisci l'errore di duplicazione
    } else if (error.name === 'MongoNetworkError') {
      console.error('Errore di rete:', error.message);
      // Gestisci l'errore di rete
    } else {
      console.error('Errore generico:', error);
      // Gestisci altri tipi di errori
    }
    
    // Puoi anche rilanciare l'errore o restituire un valore predefinito
    return { success: false, error: error.message };
  }
}
```

## Best Practices per le Operazioni CRUD

### Prestazioni

1. **Usa indici appropriati**: Crea indici per i campi utilizzati frequentemente nelle query
2. **Limita i risultati**: Usa `limit()` per evitare di recuperare troppi documenti
3. **Proiezione**: Seleziona solo i campi necessari per ridurre il trasferimento di dati
4. **Operazioni bulk**: Raggruppa più operazioni in una singola richiesta

### Sicurezza

1. **Validazione input**: Controlla sempre i dati forniti dagli utenti
2. **Prepared statements**: Usa i parametri delle query invece di concatenare stringhe
3. **Limitazione dei privilegi**: Usa account con i minimi privilegi necessari

### Robustezza

1. **Gestione degli errori**: Implementa una gestione completa degli errori
2. **Retry logic**: Implementa tentativi automatici per errori temporanei
3. **Transazioni**: Usa transazioni per operazioni che devono essere atomiche

## Conclusione

Le operazioni CRUD rappresentano il fondamento dell'interazione con MongoDB. Grazie alla sua API intuitiva e alla flessibilità del modello dei dati basato su documenti, MongoDB rende queste operazioni potenti ed espressive.

In questo capitolo abbiamo esplorato come eseguire operazioni di creazione, lettura, aggiornamento ed eliminazione sia attraverso la shell di MongoDB che utilizzando il driver Node.js. Abbiamo anche visto come gestire gli errori e quali best practices seguire per garantire prestazioni, sicurezza e robustezza.

Nel prossimo capitolo, esploreremo Mongoose, un Object Document Mapper (ODM) per MongoDB e Node.js che fornisce un livello di astrazione più alto e funzionalità aggiuntive come la validazione dei dati, i middleware e la definizione di schemi.

---

## Navigazione

- [Indice del Corso Node.js](../../README.md)
- [Modulo 11: MongoDB](../README.md)
- [Precedente: Concetti di MongoDB](./02-mongodb-concetti.md)
- [Successivo: Mongoose](./04-mongoose.md)