# Connessione a MySQL da Node.js

## Introduzione

Dopo aver esplorato i concetti fondamentali di MySQL e le operazioni SQL di base, è il momento di vedere come integrare MySQL nelle nostre applicazioni Node.js. La connessione tra Node.js e MySQL rappresenta il ponte che permette alla nostra applicazione di interagire con il database, eseguire query e gestire i dati.

In questo capitolo, esploreremo i diversi approcci per connettersi a MySQL da Node.js, le librerie disponibili e i pattern comuni per gestire le connessioni in modo efficiente e sicuro.

## Driver MySQL per Node.js

Esistono diverse librerie che permettono a Node.js di comunicare con MySQL. Le due più popolari sono:

### 1. mysql

Il driver originale per MySQL in Node.js, semplice e ampiamente utilizzato, ma con alcune limitazioni:

```bash
npm install mysql
```

### 2. mysql2

Un'implementazione più moderna e performante, con supporto nativo per Promises e prepared statements:

```bash
npm install mysql2
```

In questo capitolo, ci concentreremo principalmente su `mysql2` per i suoi vantaggi in termini di prestazioni e la sua API più moderna, ma i concetti sono applicabili anche al driver `mysql` originale.

## Connessione Base a MySQL

### Connessione Singola

Il modo più semplice per connettersi a MySQL è creare una singola connessione:

```javascript
// connessione-base.js
const mysql = require('mysql2');

// Creazione della connessione
const connection = mysql.createConnection({
  host: 'localhost',      // Indirizzo del server MySQL
  user: 'nome_utente',    // Nome utente MySQL
  password: 'password',   // Password MySQL
  database: 'nome_db'     // Nome del database
});

// Apertura della connessione
connection.connect(err => {
  if (err) {
    console.error('Errore di connessione:', err);
    return;
  }
  console.log('Connesso a MySQL con ID:', connection.threadId);
  
  // Esecuzione di una query
  connection.query('SELECT 1 + 1 AS risultato', (err, results) => {
    if (err) {
      console.error('Errore nella query:', err);
      return;
    }
    console.log('Risultato:', results[0].risultato);
    
    // Chiusura della connessione
    connection.end(err => {
      if (err) {
        console.error('Errore nella chiusura della connessione:', err);
        return;
      }
      console.log('Connessione chiusa');
    });
  });
});
```

### Utilizzo di Promises

Il driver `mysql2` offre un'interfaccia basata su Promises che semplifica la gestione del codice asincrono:

```javascript
// connessione-promise.js
const mysql = require('mysql2/promise');

async function main() {
  let connection;
  
  try {
    // Creazione della connessione
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'nome_utente',
      password: 'password',
      database: 'nome_db'
    });
    
    console.log('Connesso a MySQL');
    
    // Esecuzione di una query
    const [rows, fields] = await connection.execute('SELECT 1 + 1 AS risultato');
    console.log('Risultato:', rows[0].risultato);
    
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    // Chiusura della connessione
    if (connection) {
      await connection.end();
      console.log('Connessione chiusa');
    }
  }
}

main();
```

## Pool di Connessioni

In un'applicazione reale, creare e chiudere connessioni per ogni operazione può essere inefficiente. Un pool di connessioni mantiene un insieme di connessioni aperte che possono essere riutilizzate, migliorando significativamente le prestazioni.

### Creazione di un Pool

```javascript
// pool-base.js
const mysql = require('mysql2');

// Creazione del pool di connessioni
const pool = mysql.createPool({
  host: 'localhost',
  user: 'nome_utente',
  password: 'password',
  database: 'nome_db',
  waitForConnections: true,  // Attende se non ci sono connessioni disponibili
  connectionLimit: 10,       // Numero massimo di connessioni nel pool
  queueLimit: 0              // Numero massimo di richieste in coda (0 = illimitato)
});

// Esecuzione di una query utilizzando il pool
pool.query('SELECT * FROM utenti WHERE id = ?', [1], (err, results) => {
  if (err) {
    console.error('Errore nella query:', err);
    return;
  }
  console.log('Utente trovato:', results[0]);
});

// Quando l'applicazione termina
process.on('SIGINT', () => {
  pool.end(err => {
    if (err) {
      console.error('Errore nella chiusura del pool:', err);
    }
    console.log('Pool di connessioni chiuso');
    process.exit(0);
  });
});
```

### Pool con Promises

```javascript
// pool-promise.js
const mysql = require('mysql2/promise');

async function main() {
  // Creazione del pool di connessioni
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'nome_utente',
    password: 'password',
    database: 'nome_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  try {
    // Esecuzione di una query utilizzando il pool
    const [rows] = await pool.execute('SELECT * FROM utenti WHERE id = ?', [1]);
    console.log('Utente trovato:', rows[0] || 'Nessun utente trovato');
    
    // Esecuzione di più query in parallelo
    const [usersPromise, productsPromise] = await Promise.all([
      pool.execute('SELECT * FROM utenti LIMIT 5'),
      pool.execute('SELECT * FROM prodotti LIMIT 5')
    ]);
    
    console.log('Primi 5 utenti:', usersPromise[0]);
    console.log('Primi 5 prodotti:', productsPromise[0]);
    
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    // Chiusura del pool quando l'applicazione termina
    await pool.end();
    console.log('Pool di connessioni chiuso');
  }
}

main();
```

## Query Parametrizzate e Prepared Statements

Le query parametrizzate sono fondamentali per prevenire attacchi di SQL Injection, uno dei problemi di sicurezza più comuni nelle applicazioni web.

### Utilizzo di Placeholder

```javascript
// query-parametrizzate.js
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'nome_utente',
    password: 'password',
    database: 'nome_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  try {
    // Query con parametri posizionali (?) - più comune
    const [users] = await pool.execute(
      'SELECT * FROM utenti WHERE email = ? AND stato = ?',
      ['user@example.com', 'attivo']
    );
    
    // Query con parametri nominali (:name) - supportato da mysql2
    const [products] = await pool.execute(
      'SELECT * FROM prodotti WHERE categoria = :categoria AND prezzo <= :prezzo',
      { categoria: 'Elettronica', prezzo: 1000 }
    );
    
    console.log('Utenti trovati:', users);
    console.log('Prodotti trovati:', products);
    
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    await pool.end();
  }
}

main();
```

### Differenza tra query() e execute()

Il driver `mysql2` offre due metodi principali per eseguire query:

- **query()**: Esegue una query generica
- **execute()**: Utilizza prepared statements, più sicuro e potenzialmente più veloce per query ripetute

```javascript
// query-vs-execute.js
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    /* configurazione */
  });
  
  try {
    // Utilizzo di query()
    const [rows1] = await pool.query(
      'SELECT * FROM prodotti WHERE categoria = ?',
      ['Elettronica']
    );
    
    // Utilizzo di execute() - prepared statement
    const [rows2] = await pool.execute(
      'SELECT * FROM prodotti WHERE categoria = ?',
      ['Elettronica']
    );
    
    // La differenza principale è che execute() prepara lo statement
    // e lo esegue in passaggi separati, proteggendo meglio da SQL injection
    // e potenzialmente migliorando le prestazioni per query ripetute
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    await pool.end();
  }
}
```

## Gestione delle Transazioni

Le transazioni sono essenziali quando si devono eseguire più operazioni che devono essere completate insieme o fallire insieme.

```javascript
// transazioni.js
const mysql = require('mysql2/promise');

async function trasferisciDenaro(fromAccountId, toAccountId, amount) {
  const pool = mysql.createPool({
    /* configurazione */
  });
  
  // Ottieni una connessione dal pool
  const connection = await pool.getConnection();
  
  try {
    // Inizia la transazione
    await connection.beginTransaction();
    
    // Verifica che il conto di origine abbia fondi sufficienti
    const [accounts] = await connection.execute(
      'SELECT saldo FROM conti WHERE id = ? FOR UPDATE',
      [fromAccountId]
    );
    
    if (accounts.length === 0 || accounts[0].saldo < amount) {
      throw new Error('Fondi insufficienti o conto non trovato');
    }
    
    // Preleva dal conto di origine
    await connection.execute(
      'UPDATE conti SET saldo = saldo - ? WHERE id = ?',
      [amount, fromAccountId]
    );
    
    // Deposita nel conto di destinazione
    await connection.execute(
      'UPDATE conti SET saldo = saldo + ? WHERE id = ?',
      [amount, toAccountId]
    );
    
    // Registra la transazione nella tabella movimenti
    await connection.execute(
      'INSERT INTO movimenti (da_conto, a_conto, importo, data) VALUES (?, ?, ?, NOW())',
      [fromAccountId, toAccountId, amount]
    );
    
    // Se tutto è andato bene, commit della transazione
    await connection.commit();
    
    console.log(`Trasferimento di ${amount} completato con successo`);
    return true;
    
  } catch (error) {
    // In caso di errore, rollback della transazione
    await connection.rollback();
    console.error('Errore durante il trasferimento:', error);
    throw error;
  } finally {
    // Rilascia la connessione al pool
    connection.release();
    
    // Chiudi il pool quando hai finito
    await pool.end();
  }
}

// Utilizzo della funzione
trasferisciDenaro(1, 2, 100)
  .then(result => console.log('Operazione completata:', result))
  .catch(error => console.error('Operazione fallita:', error));
```

## Pattern di Gestione delle Connessioni

### Singleton Pool

Un pattern comune è creare un modulo che esporta un'istanza singleton del pool di connessioni:

```javascript
// db.js
const mysql = require('mysql2/promise');

let pool = null;

/**
 * Inizializza il pool di connessioni MySQL
 */
function initPool() {
  if (pool) return pool;
  
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_database',
    waitForConnections: true,
    connectionLimit: process.env.DB_POOL_SIZE || 10,
    queueLimit: 0
  });
  
  // Gestione degli errori a livello di pool
  pool.on('error', (err) => {
    console.error('Errore imprevisto nel pool MySQL:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Connessione al database persa. Riconnessione...');
      pool = null; // Reset del pool per la prossima chiamata
    }
  });
  
  return pool;
}

/**
 * Esegue una query SQL utilizzando prepared statements
 * @param {string} sql - Query SQL con placeholder
 * @param {Array|Object} params - Parametri per la query
 * @returns {Promise<Array>} - Promise con i risultati
 */
async function query(sql, params = []) {
  const pool = initPool();
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Errore nell\'esecuzione della query:', error);
    throw error;
  }
}

/**
 * Esegue una transazione con più query
 * @param {Function} callback - Funzione che riceve una connessione e esegue query
 * @returns {Promise<any>} - Promise con il risultato del callback
 */
async function transaction(callback) {
  const pool = initPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Chiude il pool di connessioni
 * @returns {Promise<void>}
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Pool di connessioni MySQL chiuso');
  }
}

module.exports = {
  query,
  transaction,
  getPool: initPool,
  closePool
};
```

### Utilizzo del Modulo DB

```javascript
// app.js
const db = require('./db');

async function main() {
  try {
    // Query semplice
    const users = await db.query('SELECT * FROM utenti WHERE stato = ?', ['attivo']);
    console.log('Utenti attivi:', users);
    
    // Transazione
    await db.transaction(async (connection) => {
      await connection.execute('UPDATE prodotti SET disponibile = ? WHERE id = ?', [false, 1]);
      await connection.execute('INSERT INTO log (messaggio) VALUES (?)', ['Prodotto 1 esaurito']);
      return true;
    });
    
    console.log('Transazione completata con successo');
  } catch (error) {
    console.error('Errore nell\'applicazione:', error);
  } finally {
    // Chiusura del pool quando l'applicazione termina
    await db.closePool();
  }
}

main();

// Gestione della chiusura dell'applicazione
process.on('SIGINT', async () => {
  console.log('Chiusura dell\'applicazione...');
  await db.closePool();
  process.exit(0);
});
```

## Gestione degli Errori

Una gestione robusta degli errori è fondamentale quando si lavora con database:

```javascript
// gestione-errori.js
const db = require('./db');

async function getUserById(id) {
  try {
    const users = await db.query('SELECT * FROM utenti WHERE id = ?', [id]);
    if (users.length === 0) {
      // Nessun utente trovato - non è un errore tecnico, ma un caso di business
      return null;
    }
    return users[0];
  } catch (error) {
    // Gestione degli errori specifici di MySQL
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('La tabella utenti non esiste!');
      // Potremmo creare la tabella o notificare un amministratore
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Accesso al database negato. Verifica credenziali.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Impossibile connettersi al database. Il server è in esecuzione?');
    } else {
      console.error('Errore imprevisto durante il recupero dell\'utente:', error);
    }
    
    // Rilancia l'errore o restituisci un errore personalizzato
    throw new Error(`Errore nel recupero dell'utente: ${error.message}`);
  }
}

// Utilizzo con gestione degli errori
async function main() {
  try {
    const user = await getUserById(1);
    if (user) {
      console.log('Utente trovato:', user);
    } else {
      console.log('Nessun utente trovato con ID 1');
    }
  } catch (error) {
    console.error('Errore nell\'applicazione:', error);
    // Qui potresti registrare l'errore, inviare una notifica, ecc.
  } finally {
    await db.closePool();
  }
}

main();
```

## Utilizzo di Variabili d'Ambiente

È una best practice non codificare le credenziali del database direttamente nel codice, ma utilizzare variabili d'ambiente:

```javascript
// config.js
require('dotenv').config(); // Carica le variabili da un file .env

module.exports = {
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'my_database',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    connectionLimit: parseInt(process.env.DB_POOL_SIZE || '10', 10)
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10)
  }
};
```

Con un file `.env` nella radice del progetto:

```
DB_HOST=localhost
DB_USER=app_user
DB_PASSWORD=secure_password
DB_NAME=production_db
DB_PORT=3306
DB_POOL_SIZE=20
PORT=3000
```

## ORM: Sequelize

Per progetti più complessi, un ORM (Object-Relational Mapping) come Sequelize può semplificare l'interazione con il database:

```bash
npm install sequelize mysql2
```

```javascript
// sequelize-example.js
const { Sequelize, DataTypes } = require('sequelize');

// Inizializzazione di Sequelize
const sequelize = new Sequelize('nome_db', 'nome_utente', 'password', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Definizione di un modello
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Definizione di un altro modello
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
});

// Definizione di relazioni
User.hasMany(Product, { as: 'products', foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });

// Funzione principale
async function main() {
  try {
    // Sincronizzazione dei modelli con il database
    await sequelize.sync({ force: false }); // force: true ricrea le tabelle
    
    // Creazione di un utente
    const user = await User.create({
      username: 'john_doe',
      email: 'john@example.com'
    });
    
    // Creazione di un prodotto associato all'utente
    const product = await Product.create({
      name: 'Laptop',
      price: 999.99,
      userId: user.id
    });
    
    // Ricerca con condizioni
    const users = await User.findAll({
      where: {
        status: 'active'
      },
      include: [{
        model: Product,
        as: 'products'
      }]
    });
    
    console.log('Utenti attivi con prodotti:', JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    await sequelize.close();
  }
}

main();
```

## Conclusione

In questo capitolo abbiamo esplorato come connettere Node.js a MySQL, utilizzando sia approcci di basso livello con il driver `mysql2`, sia soluzioni più astratte come Sequelize. Abbiamo visto come gestire connessioni singole e pool di connessioni, eseguire query parametrizzate, gestire transazioni e implementare pattern comuni per la gestione delle connessioni.

La scelta dell'approccio dipende dalla complessità del progetto e dalle preferenze personali. Per applicazioni semplici, il driver `mysql2` con un pattern singleton per il pool di connessioni può essere sufficiente. Per progetti più complessi, un ORM come Sequelize può offrire vantaggi in termini di produttività e manutenibilità.

Indipendentemente dall'approccio scelto, è fondamentale seguire le best practice per la sicurezza (query parametrizzate, gestione sicura delle credenziali) e l'efficienza (pool di connessioni, transazioni appropriate).

Nel prossimo capitolo, esploreremo pattern più avanzati per la gestione delle connessioni e l'organizzazione del codice in applicazioni Node.js con MySQL.

---

## Navigazione del Corso

- [Indice del Corso Node.js](../../README.md)
- **Modulo Corrente: MySQL**
  - [01 - Introduzione ai Database Relazionali](./01-introduzione-db-relazionali.md)
  - [02 - Installazione e Configurazione di MySQL](./02-installazione-mysql.md)
  - [03 - Operazioni SQL Fondamentali](./03-operazioni-sql.md)
  - **04 - Connessione a MySQL da Node.js** (Documento Corrente)
  - [05 - Pattern di Gestione delle Connessioni](./05-pattern-connessioni.md)