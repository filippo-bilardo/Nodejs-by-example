# Pattern di Gestione delle Connessioni

## Introduzione

La gestione efficiente delle connessioni al database è un aspetto cruciale nello sviluppo di applicazioni Node.js con MySQL. Un'implementazione inadeguata può portare a problemi di prestazioni, memory leak e, nei casi peggiori, al crash dell'applicazione.

In questo capitolo, esploreremo diversi pattern e best practice per gestire le connessioni a MySQL in applicazioni Node.js di varie dimensioni e complessità, dalla semplice applicazione monolitica fino a sistemi distribuiti più complessi.

## Problematiche nella Gestione delle Connessioni

Prima di esaminare i pattern, è importante comprendere le sfide che dobbiamo affrontare:

1. **Overhead di connessione**: Stabilire una connessione a MySQL è un'operazione costosa in termini di tempo e risorse.
2. **Limiti di connessioni**: MySQL ha un limite al numero di connessioni simultanee che può gestire.
3. **Connessioni zombie**: Connessioni che rimangono aperte ma inutilizzate, sprecando risorse.
4. **Gestione degli errori**: Problemi di rete o del server database possono interrompere le connessioni.
5. **Scalabilità**: L'applicazione deve poter gestire un numero crescente di richieste senza esaurire le connessioni disponibili.

## Pattern 1: Singleton Pool

Il pattern Singleton Pool è l'approccio più comune e adatto per la maggior parte delle applicazioni Node.js. Consiste nel creare un'unica istanza del pool di connessioni condivisa in tutta l'applicazione.

### Implementazione

```javascript
// db.js
const mysql = require('mysql2/promise');
const config = require('./config');

let pool = null;

function getPool() {
  if (pool) return pool;
  
  pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    waitForConnections: true,
    connectionLimit: config.db.connectionLimit,
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

module.exports = {
  query: async (sql, params = []) => {
    const pool = getPool();
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Errore nell\'esecuzione della query:', error);
      throw error;
    }
  },
  
  getConnection: async () => {
    const pool = getPool();
    return await pool.getConnection();
  },
  
  transaction: async (callback) => {
    const pool = getPool();
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
  },
  
  closePool: async () => {
    if (pool) {
      await pool.end();
      pool = null;
      console.log('Pool di connessioni MySQL chiuso');
    }
  }
};
```

### Vantaggi

- **Semplicità**: Facile da implementare e utilizzare
- **Efficienza**: Riutilizzo delle connessioni
- **Centralizzazione**: Gestione centralizzata delle connessioni

### Svantaggi

- **Punto singolo di fallimento**: Se il pool ha problemi, tutta l'applicazione ne risente
- **Limitazioni di scalabilità**: Funziona bene su un singolo server, ma può diventare un collo di bottiglia in sistemi distribuiti

### Quando utilizzarlo

- Applicazioni monolitiche
- Applicazioni con carico moderato
- Quando la semplicità è prioritaria

## Pattern 2: Repository Pattern

Il Repository Pattern aggiunge un livello di astrazione tra la logica di business e l'accesso al database, organizzando il codice per entità.

### Implementazione

```javascript
// db.js (come sopra)

// userRepository.js
const db = require('./db');

class UserRepository {
  async findById(id) {
    return await db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
  
  async findByEmail(email) {
    return await db.query('SELECT * FROM users WHERE email = ?', [email]);
  }
  
  async create(user) {
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [user.name, user.email, user.password]
    );
    return { id: result.insertId, ...user };
  }
  
  async update(id, user) {
    await db.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [user.name, user.email, id]
    );
    return { id, ...user };
  }
  
  async delete(id) {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return { id };
  }
}

module.exports = new UserRepository();

// Utilizzo
const userRepository = require('./userRepository');

async function getUserProfile(userId) {
  try {
    const user = await userRepository.findById(userId);
    return user;
  } catch (error) {
    console.error('Errore nel recupero del profilo utente:', error);
    throw error;
  }
}
```

### Vantaggi

- **Separazione delle responsabilità**: Ogni repository gestisce una singola entità
- **Riutilizzo del codice**: Le query comuni sono centralizzate
- **Testabilità**: Facile da testare con mock

### Svantaggi

- **Overhead di codice**: Richiede più file e codice boilerplate
- **Potenziale duplicazione**: Query simili potrebbero essere duplicate in repository diversi

### Quando utilizzarlo

- Applicazioni con logica di business complessa
- Quando è necessaria una chiara separazione tra logica di business e accesso ai dati
- Progetti con più sviluppatori che lavorano contemporaneamente

## Pattern 3: Data Access Object (DAO)

Il pattern DAO è simile al Repository, ma si concentra sulle operazioni piuttosto che sulle entità.

### Implementazione

```javascript
// db.js (come sopra)

// userDAO.js
const db = require('./db');

class UserDAO {
  async findById(id) {
    return await db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
  
  async create(user) {
    return await db.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [user.name, user.email]
    );
  }
  
  // Altri metodi...
}

// orderDAO.js
const db = require('./db');

class OrderDAO {
  async findByUserId(userId) {
    return await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
  }
  
  async create(order) {
    return await db.transaction(async (connection) => {
      // Inserisci l'ordine
      const [orderResult] = await connection.execute(
        'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
        [order.userId, order.total, 'pending']
      );
      
      const orderId = orderResult.insertId;
      
      // Inserisci i dettagli dell'ordine
      for (const item of order.items) {
        await connection.execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.productId, item.quantity, item.price]
        );
      }
      
      return { id: orderId, ...order };
    });
  }
  
  // Altri metodi...
}

module.exports = {
  userDAO: new UserDAO(),
  orderDAO: new OrderDAO()
};
```

### Vantaggi

- **Flessibilità**: Può gestire operazioni che coinvolgono più entità
- **Incapsulamento**: Nasconde i dettagli dell'implementazione del database

### Svantaggi

- **Complessità**: Può diventare complesso con molte entità e relazioni
- **Overhead di astrazione**: Aggiunge un livello di indirezione

### Quando utilizzarlo

- Applicazioni con operazioni complesse che coinvolgono più tabelle
- Quando è necessario un alto livello di astrazione dal database

## Pattern 4: Connection-Per-Request

In alcuni scenari, potrebbe essere preferibile utilizzare una connessione dedicata per ogni richiesta HTTP, specialmente in applicazioni con operazioni di lunga durata.

### Implementazione con Express

```javascript
// db.js (versione modificata)
const mysql = require('mysql2/promise');
const config = require('./config');

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool(config.db);
  }
  return pool;
}

module.exports = {
  getConnection: async () => {
    const pool = getPool();
    return await pool.getConnection();
  },
  releaseConnection: (connection) => {
    if (connection) connection.release();
  },
  closePool: async () => {
    if (pool) {
      await pool.end();
      pool = null;
    }
  }
};

// middleware/database.js
const db = require('../db');

async function databaseMiddleware(req, res, next) {
  try {
    // Ottieni una connessione dal pool
    req.dbConnection = await db.getConnection();
    
    // Aggiungi metodi helper alla richiesta
    req.db = {
      query: async (sql, params = []) => {
        try {
          const [results] = await req.dbConnection.execute(sql, params);
          return results;
        } catch (error) {
          console.error('Errore nell\'esecuzione della query:', error);
          throw error;
        }
      },
      beginTransaction: async () => {
        await req.dbConnection.beginTransaction();
      },
      commit: async () => {
        await req.dbConnection.commit();
      },
      rollback: async () => {
        await req.dbConnection.rollback();
      }
    };
    
    // Continua con il prossimo middleware
    next();
  } catch (error) {
    console.error('Errore nella connessione al database:', error);
    res.status(500).json({ error: 'Errore del server' });
  }
}

// Middleware per rilasciare la connessione dopo la risposta
function releaseDatabaseConnection(req, res, next) {
  // Salva il metodo originale end
  const originalEnd = res.end;
  
  // Sovrascrivi il metodo end
  res.end = function() {
    // Rilascia la connessione se esiste
    if (req.dbConnection) {
      db.releaseConnection(req.dbConnection);
      req.dbConnection = null;
    }
    
    // Chiama il metodo originale end
    return originalEnd.apply(this, arguments);
  };
  
  next();
}

module.exports = [databaseMiddleware, releaseDatabaseConnection];

// app.js
const express = require('express');
const { databaseMiddleware, releaseDatabaseConnection } = require('./middleware/database');

const app = express();

// Applica i middleware globalmente
app.use(databaseMiddleware);
app.use(releaseDatabaseConnection);

// Rotte
app.get('/users/:id', async (req, res) => {
  try {
    // Usa la connessione associata alla richiesta
    const users = await req.db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ error: 'Errore del server' });
  }
});

app.post('/transfer', async (req, res) => {
  try {
    const { fromAccount, toAccount, amount } = req.body;
    
    // Inizia una transazione
    await req.db.beginTransaction();
    
    // Verifica saldo
    const accounts = await req.db.query(
      'SELECT balance FROM accounts WHERE id = ? FOR UPDATE',
      [fromAccount]
    );
    
    if (accounts.length === 0 || accounts[0].balance < amount) {
      await req.db.rollback();
      return res.status(400).json({ error: 'Fondi insufficienti o conto non trovato' });
    }
    
    // Esegui il trasferimento
    await req.db.query(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, fromAccount]
    );
    
    await req.db.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, toAccount]
    );
    
    // Commit della transazione
    await req.db.commit();
    
    res.json({ success: true, message: 'Trasferimento completato' });
  } catch (error) {
    // Rollback in caso di errore
    if (req.dbConnection) {
      await req.db.rollback();
    }
    
    console.error('Errore durante il trasferimento:', error);
    res.status(500).json({ error: 'Errore del server' });
  }
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

### Vantaggi

- **Isolamento**: Ogni richiesta ha la propria connessione
- **Chiarezza**: La connessione segue il ciclo di vita della richiesta
- **Transazioni**: Facilita l'uso di transazioni per l'intera richiesta

### Svantaggi

- **Overhead**: Maggiore utilizzo di connessioni
- **Complessità**: Richiede middleware e gestione del ciclo di vita

### Quando utilizzarlo

- Applicazioni con richieste che richiedono transazioni complesse
- Quando è importante l'isolamento tra richieste
- Applicazioni con carico moderato e numero di connessioni disponibili adeguato

## Pattern 5: Read/Write Splitting

Per applicazioni ad alto carico, può essere vantaggioso separare le operazioni di lettura e scrittura su pool di connessioni diversi, potenzialmente connessi a server MySQL diversi in una configurazione master-slave.

### Implementazione

```javascript
// db.js
const mysql = require('mysql2/promise');
const config = require('./config');

let readPool = null;
let writePool = null;

function getReadPool() {
  if (!readPool) {
    readPool = mysql.createPool({
      ...config.db,
      host: config.db.readHost || config.db.host,
      connectionLimit: config.db.readConnectionLimit || config.db.connectionLimit
    });
  }
  return readPool;
}

function getWritePool() {
  if (!writePool) {
    writePool = mysql.createPool({
      ...config.db,
      host: config.db.writeHost || config.db.host,
      connectionLimit: config.db.writeConnectionLimit || config.db.connectionLimit
    });
  }
  return writePool;
}

module.exports = {
  read: async (sql, params = []) => {
    const pool = getReadPool();
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Errore nell\'esecuzione della query di lettura:', error);
      throw error;
    }
  },
  
  write: async (sql, params = []) => {
    const pool = getWritePool();
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Errore nell\'esecuzione della query di scrittura:', error);
      throw error;
    }
  },
  
  transaction: async (callback) => {
    const pool = getWritePool();
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
  },
  
  closePools: async () => {
    if (readPool) {
      await readPool.end();
      readPool = null;
    }
    if (writePool) {
      await writePool.end();
      writePool = null;
    }
  }
};

// Utilizzo
const db = require('./db');

async function getUserProfile(userId) {
  // Operazione di lettura
  return await db.read('SELECT * FROM users WHERE id = ?', [userId]);
}

async function createUser(user) {
  // Operazione di scrittura
  return await db.write(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [user.name, user.email]
  );
}

async function transferMoney(fromAccount, toAccount, amount) {
  // Transazione (sempre sul pool di scrittura)
  return await db.transaction(async (connection) => {
    // Implementazione del trasferimento...
  });
}
```

### Vantaggi

- **Scalabilità**: Può sfruttare la replica MySQL
- **Prestazioni**: Ottimizza le connessioni in base al tipo di operazione
- **Resilienza**: Può continuare a funzionare in modalità di sola lettura se il master è down

### Svantaggi

- **Complessità**: Richiede una configurazione più complessa
- **Consistenza**: Potenziale ritardo nella replica può causare dati non aggiornati nelle letture

### Quando utilizzarlo

- Applicazioni ad alto carico con molte più operazioni di lettura che di scrittura
- Quando è già in uso una configurazione MySQL con replica
- Sistemi che richiedono alta disponibilità

## Pattern 6: Connection Pooling con Knex.js

Knex.js è un query builder SQL flessibile che offre un'astrazione di alto livello mantenendo il controllo sulle query SQL.

### Implementazione

```javascript
// db.js
const knex = require('knex');
const config = require('./config');

let knexInstance = null;

function getKnex() {
  if (!knexInstance) {
    knexInstance = knex({
      client: 'mysql2',
      connection: {
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
      },
      pool: {
        min: 0,
        max: config.db.connectionLimit,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100
      },
      debug: process.env.NODE_ENV === 'development'
    });
  }
  return knexInstance;
}

module.exports = {
  getKnex,
  closeKnex: async () => {
    if (knexInstance) {
      await knexInstance.destroy();
      knexInstance = null;
    }
  }
};

// userService.js
const { getKnex } = require('./db');

async function getUserById(id) {
  const knex = getKnex();
  return await knex('users').where({ id }).first();
}

async function createUser(user) {
  const knex = getKnex();
  const [id] = await knex('users').insert({
    name: user.name,
    email: user.email,
    created_at: knex.fn.now()
  });
  return { id, ...user };
}

async function transferMoney(fromAccount, toAccount, amount) {
  const knex = getKnex();
  
  return await knex.transaction(async (trx) => {
    // Verifica saldo
    const account = await trx('accounts')
      .where({ id: fromAccount })
      .forUpdate()
      .first();
    
    if (!account || account.balance < amount) {
      throw new Error('Fondi insufficienti o conto non trovato');
    }
    
    // Aggiorna i conti
    await trx('accounts')
      .where({ id: fromAccount })
      .decrement('balance', amount);
    
    await trx('accounts')
      .where({ id: toAccount })
      .increment('balance', amount);
    
    // Registra la transazione
    await trx('transactions').insert({
      from_account: fromAccount,
      to_account: toAccount,
      amount,
      date: trx.fn.now()
    });
    
    return { success: true };
  });
}
```

### Vantaggi

- **API fluente**: Knex offre un'API elegante per costruire query
- **Migrazione e seeding**: Strumenti integrati per la gestione dello schema
- **Supporto per più database**: Facile passaggio tra diversi DBMS

### Svantaggi

- **Dipendenza esterna**: Aggiunge una dipendenza al progetto
- **Curva di apprendimento**: Richiede familiarità con l'API di Knex

### Quando utilizzarlo

- Progetti di media-grande dimensione
- Quando si desidera un'astrazione SQL senza un ORM completo
- Quando è importante la portabilità tra diversi database

## Best Practices

Indipendentemente dal pattern scelto, ecco alcune best practice da seguire:

### 1. Gestione delle Credenziali

- **Mai hardcodare le credenziali** nel codice sorgente
- Utilizzare **variabili d'ambiente** o servizi di gestione dei segreti
- Considerare la **rotazione periodica delle password**

### 2. Dimensionamento del Pool

- **Non esagerare con il numero di connessioni**: Un pool troppo grande può sovraccaricare il server MySQL
- **Formula di base**: `connectionLimit = (numero di core CPU * 2) + numero di dischi`
- **Monitorare l'utilizzo** e regolare di conseguenza

### 3. Gestione degli Errori

- **Implementare retry con backoff esponenziale** per errori temporanei
- **Distinguere tra errori recuperabili e non recuperabili**
- **Loggare dettagli utili** ma evitare di esporre informazioni sensibili

```javascript
async function queryWithRetry(sql, params, maxRetries = 3) {
  let retries = 0;
  while (true) {
    try {
      return await db.query(sql, params);
    } catch (error) {
      // Errori che possono essere recuperati con un retry
      const retryableErrors = [
        'ER_LOCK_DEADLOCK',
        'ER_LOCK_WAIT_TIMEOUT',
        'PROTOCOL_CONNECTION_LOST',
        'ECONNRESET'
      ];
      
      if (retryableErrors.includes(error.code) && retries < maxRetries) {
        retries++;
        const delay = Math.pow(2, retries) * 100; // Backoff esponenziale
        console.log(`Retry ${retries} dopo ${delay}ms per errore: ${error.code}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Rilancia errori non recuperabili o dopo troppi tentativi
      }
    }
  }
}
```

### 4. Monitoraggio e Logging

- **Monitorare le metriche chiave**: Numero di connessioni, tempo di risposta delle query, errori
- **Implementare logging strutturato** per facilitare l'analisi
- **Considerare l'uso di APM** (Application Performance Monitoring)

```javascript
// Esempio di wrapper con logging delle performance
async function queryWithLogging(sql, params) {
  const start = process.hrtime();
  try {
    const result = await db.query(sql, params);
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    if (duration > 500) { // Log query lente (>500ms)
      console.warn(`Query lenta (${duration.toFixed(2)}ms): ${sql}`);
    }
    
    return result;
  } catch (error) {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    console.error(`Query fallita (${duration.toFixed(2)}ms): ${sql}`, {
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    throw error;
  }
}
```

### 5. Gestione della Connessione in Ambienti Serverless

Gli ambienti serverless come AWS Lambda presentano sfide uniche per la gestione delle connessioni a causa della loro natura effimera.

```javascript
// db.js per ambiente serverless
const mysql = require('mysql2/promise');
let pool;

async function getConnection() {
  if (!pool) {
    console.log('Inizializzazione del pool di connessioni');
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 2, // Valore basso per Lambda
      queueLimit: 0
    });
  }
  
  return pool;
}

module.exports = {
  query: async (sql, params = []) => {
    const pool = await getConnection();
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Errore nella query:', error);
      throw error;
    }
  }
};

// handler.js
const db = require('./db');

exports.handler = async (event) => {
  try {
    const users = await db.query('SELECT * FROM users LIMIT 10');
    return {
      statusCode: 200,
      body: JSON.stringify(users)
    };
  } catch (error) {
    console.error('Errore:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Errore del server' })
    };
  }
};
```

## Conclusione

La scelta del pattern di gestione delle connessioni dipende dalle specifiche esigenze dell'applicazione, dal carico previsto e dall'architettura complessiva del sistema.

Per la maggior parte delle applicazioni Node.js, il pattern Singleton Pool rappresenta un buon punto di partenza, offrendo un equilibrio tra semplicità ed efficienza. Man mano che l'applicazione cresce in complessità e carico, è possibile evolvere verso pattern più sofisticati come Repository, Read/Write Splitting o l'utilizzo di librerie come Knex.js.

Indipendentemente dal pattern scelto, è fondamentale seguire le best practice per la gestione delle connessioni, implementare una robusta gestione degli errori e monitorare costantemente le prestazioni del database per garantire che l'applicazione rimanga scalabile, affidabile e performante.

In questo capitolo abbiamo esplorato diversi pattern per la gestione delle connessioni MySQL in applicazioni Node.js, dalle soluzioni più semplici come il Singleton Pool fino a pattern più avanzati come Read/Write Splitting. Abbiamo anche discusso best practice per la gestione delle credenziali, il dimensionamento del pool e la gestione degli errori.

La comprensione di questi pattern ti permetterà di progettare applicazioni Node.js con MySQL che siano robuste, scalabili e facili da mantenere. Nel tuo percorso di sviluppo, potrai iniziare con pattern semplici e poi evolvere verso soluzioni più sofisticate man mano che le esigenze della tua applicazione crescono.

---

## Navigazione del Corso

- [Indice del Corso Node.js](../../README.md)
- **Modulo Corrente: MySQL**
  - [01 - Introduzione ai Database Relazionali](./01-introduzione-db-relazionali.md)
  - [02 - Installazione e Configurazione di MySQL](./02-installazione-mysql.md)
  - [03 - Operazioni SQL Fondamentali](./03-operazioni-sql.md)
  - [04 - Connessione a MySQL da Node.js](./04-connessione-nodejs-mysql.md)
  - **05 - Pattern di Gestione delle Connessioni** (Documento Corrente)