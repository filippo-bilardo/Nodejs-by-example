# MongoDB: Concetti Fondamentali

## Cos'è MongoDB?

MongoDB è un database NoSQL orientato ai documenti, progettato per offrire scalabilità, flessibilità e prestazioni elevate. Sviluppato da MongoDB Inc. (precedentemente 10gen), è stato rilasciato per la prima volta nel 2009 e da allora è diventato uno dei database NoSQL più popolari al mondo.

Il nome "Mongo" deriva dalla parola "humongous" (enorme), a indicare la capacità del database di gestire enormi quantità di dati. MongoDB archivia i dati in documenti flessibili simili a JSON, il che significa che i campi possono variare da documento a documento e la struttura dei dati può essere modificata nel tempo.

## Architettura di MongoDB

L'architettura di MongoDB è progettata per essere distribuita e scalabile orizzontalmente:

### Componenti Principali

1. **mongod**: Il processo server principale che gestisce l'accesso ai dati e le operazioni di database
2. **mongo shell**: Un'interfaccia interattiva JavaScript per interagire con MongoDB
3. **mongos**: Un router di query che fornisce un'interfaccia tra le applicazioni client e uno sharded cluster

### Livelli di Distribuzione

1. **Standalone**: Singola istanza di MongoDB, adatta per sviluppo e piccole applicazioni
2. **Replica Set**: Gruppo di istanze mongod che mantengono lo stesso set di dati, fornendo ridondanza e alta disponibilità
3. **Sharded Cluster**: Distribuzione dei dati su più server per supportare implementazioni con set di dati molto grandi e operazioni ad alto throughput

## Modello dei Dati

MongoDB utilizza un modello di dati basato su documenti che offre un modo intuitivo e flessibile di rappresentare le informazioni.

### Documenti

L'unità base di dati in MongoDB è il documento, una struttura di dati composta da coppie campo-valore. I documenti sono archiviati in formato BSON (Binary JSON), un'estensione binaria di JSON che supporta tipi di dati aggiuntivi.

Esempio di documento:

```json
{
  "_id": ObjectId("60f1a5c8e754a62f8bac9cb4"),
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@example.com",
  "età": 30,
  "indirizzo": {
    "via": "Via Roma 123",
    "città": "Milano",
    "cap": "20100"
  },
  "interessi": ["sport", "musica", "tecnologia"],
  "dataRegistrazione": ISODate("2023-07-15T10:30:00Z")
}
```

Caratteristiche dei documenti:

- Possono contenere campi con valori di diversi tipi (stringhe, numeri, array, documenti annidati)
- Hanno una dimensione massima di 16MB
- Ogni documento ha un campo `_id` unico che funge da chiave primaria

### Collezioni

Le collezioni sono gruppi di documenti, concettualmente simili alle tabelle nei database relazionali. A differenza delle tabelle, tuttavia, le collezioni non impongono uno schema rigido:

- I documenti all'interno di una collezione possono avere campi diversi
- La struttura dei documenti può evolvere nel tempo

MongoDB crea automaticamente una collezione quando vi si inserisce il primo documento.

### Database

Un'istanza MongoDB può ospitare più database, ciascuno contenente un insieme di collezioni. I database sono indipendenti tra loro e archiviano i dati in file separati sul filesystem.

## Tipi di Dati in MongoDB

MongoDB supporta una vasta gamma di tipi di dati, tra cui:

1. **Tipi di base**:
   - String: Stringhe di testo UTF-8
   - Number: Interi a 32 o 64 bit, numeri a virgola mobile
   - Boolean: true o false
   - Date: Timestamp in millisecondi dal 1° gennaio 1970
   - Null: Valore nullo o campo non esistente

2. **Tipi complessi**:
   - Object: Documenti annidati
   - Array: Liste di valori o documenti
   - ObjectId: Identificatori unici a 12 byte generati automaticamente
   - Binary Data: Dati binari
   - Regular Expression: Espressioni regolari

3. **Tipi speciali**:
   - Timestamp: Timestamp interni per operazioni di replica
   - Decimal128: Numeri decimali a precisione elevata
   - JavaScript: Codice JavaScript
   - GeoJSON: Dati geospaziali

## Identificatori Unici: ObjectId

Ogni documento in MongoDB ha un campo `_id` che funge da chiave primaria. Se non specificato durante l'inserimento, MongoDB genera automaticamente un ObjectId per questo campo.

Un ObjectId è un valore a 12 byte composto da:

- 4 byte: timestamp in secondi dal 1° gennaio 1970
- 5 byte: valore casuale
- 3 byte: contatore incrementale

Questa struttura garantisce che gli ObjectId siano:

- Unici a livello globale
- Ordinabili per tempo di creazione
- Generabili senza coordinazione centrale (utile in ambienti distribuiti)

```javascript
// Esempio di creazione di un ObjectId
const id = new ObjectId();
console.log(id.toString()); // 60f1a5c8e754a62f8bac9cb4

// Estrazione del timestamp
const timestamp = id.getTimestamp();
console.log(timestamp); // 2023-07-15T10:30:00.000Z
```

## Indici in MongoDB

Gli indici in MongoDB funzionano in modo simile agli indici nei database relazionali, migliorando l'efficienza delle query evitando la scansione completa delle collezioni.

### Tipi di Indici

1. **Indice Singolo**: Indice su un singolo campo
   ```javascript
   db.utenti.createIndex({ "email": 1 }); // 1 per ordine ascendente
   ```

2. **Indice Composto**: Indice su più campi
   ```javascript
   db.utenti.createIndex({ "cognome": 1, "nome": 1 });
   ```

3. **Indice Multichiave**: Indice su array, crea un indice per ogni elemento dell'array
   ```javascript
   db.utenti.createIndex({ "interessi": 1 });
   ```

4. **Indice Geospaziale**: Ottimizzato per query geospaziali
   ```javascript
   db.luoghi.createIndex({ "posizione": "2dsphere" });
   ```

5. **Indice di Testo**: Per ricerche full-text
   ```javascript
   db.articoli.createIndex({ "titolo": "text", "contenuto": "text" });
   ```

6. **Indice Hashed**: Indice basato su hash del valore del campo
   ```javascript
   db.utenti.createIndex({ "_id": "hashed" });
   ```

### Proprietà degli Indici

- **Unique**: Garantisce che non ci siano valori duplicati
  ```javascript
  db.utenti.createIndex({ "email": 1 }, { unique: true });
  ```

- **Sparse**: Include solo documenti che hanno il campo indicizzato
  ```javascript
  db.utenti.createIndex({ "telefono": 1 }, { sparse: true });
  ```

- **TTL (Time-To-Live)**: Elimina automaticamente i documenti dopo un certo periodo
  ```javascript
  db.sessioni.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 3600 });
  ```

## Transazioni in MongoDB

A partire dalla versione 4.0, MongoDB supporta transazioni multi-documento, permettendo di eseguire operazioni su più documenti in modo atomico.

```javascript
// Esempio di transazione
const session = client.startSession();
session.startTransaction();

try {
  const contiColl = db.collection('conti');
  
  // Preleva da un conto
  await contiColl.updateOne(
    { _id: 'conto1' },
    { $inc: { saldo: -100 } },
    { session }
  );
  
  // Deposita su un altro conto
  await contiColl.updateOne(
    { _id: 'conto2' },
    { $inc: { saldo: 100 } },
    { session }
  );
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  console.error('Transazione fallita:', error);
} finally {
  await session.endSession();
}
```

Le transazioni in MongoDB:

- Sono supportate in replica set e sharded cluster
- Seguono il modello ACID (Atomicity, Consistency, Isolation, Durability)
- Hanno un timeout predefinito di 60 secondi
- Possono influire sulle prestazioni, quindi vanno usate solo quando necessario

## Replica Set

Un replica set è un gruppo di istanze mongod che mantengono lo stesso set di dati, fornendo ridondanza e alta disponibilità.

### Componenti di un Replica Set

1. **Primary**: Il nodo primario che riceve tutte le operazioni di scrittura
2. **Secondary**: Nodi che replicano i dati dal primario e possono servire operazioni di lettura
3. **Arbiter**: Nodi opzionali che partecipano alle elezioni ma non contengono dati

### Funzionamento

- Le scritture vengono inviate al nodo primario
- Le modifiche vengono registrate nell'oplog (operation log)
- I nodi secondari replicano l'oplog e applicano le operazioni
- Se il primario diventa irraggiungibile, i secondari eleggono un nuovo primario

### Vantaggi

- **Alta disponibilità**: Il sistema rimane operativo anche in caso di guasto di un nodo
- **Disaster recovery**: I dati sono replicati su più server, potenzialmente in diverse località
- **Letture scalabili**: Le operazioni di lettura possono essere distribuite sui nodi secondari

## Sharding

Lo sharding è il processo di distribuzione dei dati su più server per supportare implementazioni con set di dati molto grandi e operazioni ad alto throughput.

### Componenti di un Cluster Sharded

1. **Shard**: Ogni shard è un replica set che contiene una porzione dei dati
2. **Config Server**: Replica set che memorizza i metadati del cluster
3. **mongos**: Router che indirizza le query ai shard appropriati

### Shard Key

La shard key è il campo (o i campi) utilizzato per distribuire i documenti tra gli shard:

- Determina come i dati vengono distribuiti
- Influisce significativamente sulle prestazioni e sulla scalabilità
- Una volta scelta, non può essere modificata facilmente

Criteri per una buona shard key:

- Alta cardinalità (molti valori possibili)
- Distribuzione uniforme dei valori
- Frequenza di accesso bilanciata

```javascript
// Esempio di sharding di una collezione
sh.enableSharding("miodb");
db.utenti.createIndex({ "regione": 1, "_id": 1 });
sh.shardCollection("miodb.utenti", { "regione": 1, "_id": 1 });
```

## MongoDB Atlas

MongoDB Atlas è il servizio di database-as-a-service (DBaaS) ufficiale di MongoDB, che offre:

- Deployment automatizzato di cluster MongoDB
- Backup automatici e point-in-time recovery
- Scalabilità automatica
- Sicurezza avanzata (crittografia, autenticazione, VPC peering)
- Monitoraggio e avvisi
- Distribuzione globale con Global Clusters

Atlas è disponibile sui principali cloud provider (AWS, Azure, GCP) e offre un piano gratuito per sviluppo e test.

## Sicurezza in MongoDB

MongoDB offre diverse funzionalità di sicurezza:

### Autenticazione

- **SCRAM (Salted Challenge Response Authentication Mechanism)**: Meccanismo predefinito
- **X.509 Certificate Authentication**: Autenticazione basata su certificati
- **LDAP Authentication**: Integrazione con directory LDAP
- **Kerberos Authentication**: Per ambienti enterprise

### Autorizzazione

MongoDB utilizza il controllo degli accessi basato sui ruoli (RBAC):

- Ruoli predefiniti (read, readWrite, dbAdmin, etc.)
- Possibilità di creare ruoli personalizzati
- Privilegi granulari a livello di database o collezione

```javascript
// Creazione di un utente con ruoli specifici
db.createUser({
  user: "appUser",
  pwd: "password",
  roles: [
    { role: "readWrite", db: "miodb" },
    { role: "read", db: "analytics" }
  ]
});
```

### Crittografia

- **TLS/SSL**: Per la crittografia in transito
- **Crittografia a livello di campo**: Per dati sensibili specifici
- **Crittografia a livello di storage**: Per proteggere i dati a riposo

## Conclusione

MongoDB rappresenta una soluzione potente e flessibile per la gestione dei dati in applicazioni moderne. La sua architettura orientata ai documenti, combinata con funzionalità avanzate come replica, sharding e transazioni, lo rende adatto a una vasta gamma di casi d'uso, dal semplice sviluppo di applicazioni web fino a implementazioni enterprise su larga scala.

La flessibilità dello schema, la scalabilità orizzontale e l'integrazione nativa con linguaggi di programmazione come JavaScript rendono MongoDB particolarmente adatto per lo sviluppo con Node.js, creando un ecosistema coerente e produttivo per gli sviluppatori.

Nei prossimi capitoli, esploreremo in dettaglio come eseguire operazioni CRUD in MongoDB e come integrarlo efficacemente nelle applicazioni Node.js utilizzando sia il driver nativo che Mongoose.

---

## Navigazione

- [Indice del Corso Node.js](../../README.md)
- [Modulo 11: MongoDB](../README.md)
- [Precedente: Introduzione ai Database NoSQL](./01-introduzione-nosql.md)
- [Successivo: Operazioni CRUD in MongoDB](./03-mongodb-crud.md)