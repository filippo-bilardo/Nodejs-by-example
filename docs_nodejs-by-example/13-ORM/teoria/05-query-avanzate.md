# Query Avanzate e Ottimizzazione in Sequelize

## Introduzione

Sequelize offre un potente sistema di query che va oltre le semplici operazioni CRUD. In questo capitolo, esploreremo le tecniche avanzate di query e le strategie di ottimizzazione per migliorare le prestazioni delle applicazioni che utilizzano Sequelize come ORM.

La capacità di scrivere query efficienti è fondamentale per applicazioni che gestiscono grandi volumi di dati o che richiedono tempi di risposta rapidi. Sequelize fornisce numerosi strumenti per ottimizzare le query, dalla selezione precisa dei campi alla gestione efficiente delle relazioni.

## Query Builder Avanzato

### Operatori

Sequelize fornisce una serie di operatori che permettono di costruire condizioni di query complesse:

```javascript
const { Op } = require('sequelize');

// Ricerca di utenti con criteri complessi
async function findUsers() {
  const users = await User.findAll({
    where: {
      [Op.or]: [
        { username: { [Op.like]: '%john%' } },
        { email: { [Op.like]: '%john%' } }
      ],
      age: {
        [Op.gte]: 18,
        [Op.lt]: 65
      },
      status: {
        [Op.in]: ['active', 'pending']
      },
      lastLogin: {
        [Op.not]: null,
        [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // Ultimi 30 giorni
      }
    }
  });
  
  return users;
}
```

Ecco alcuni degli operatori più comuni:

- `Op.eq`: Uguale
- `Op.ne`: Non uguale
- `Op.is`: È (utile per NULL)
- `Op.not`: Non è
- `Op.gt`, `Op.gte`: Maggiore di, Maggiore o uguale a
- `Op.lt`, `Op.lte`: Minore di, Minore o uguale a
- `Op.between`: Tra due valori
- `Op.notBetween`: Non tra due valori
- `Op.in`: In un array di valori
- `Op.notIn`: Non in un array di valori
- `Op.like`, `Op.notLike`: Pattern matching con LIKE
- `Op.startsWith`, `Op.endsWith`, `Op.substring`: Scorciatoie per LIKE
- `Op.and`, `Op.or`: Combinazione logica di condizioni

### Subquery

Sequelize supporta anche le subquery, permettendo di creare query più complesse:

```javascript
const { Op, literal } = require('sequelize');

// Trova utenti con almeno un post pubblicato
async function findUsersWithPublishedPosts() {
  const users = await User.findAll({
    where: {
      id: {
        [Op.in]: literal(`(
          SELECT DISTINCT userId 
          FROM Posts 
          WHERE status = 'published'
        )`)
      }
    }
  });
  
  return users;
}
```

### Raw Queries

Per query particolarmente complesse, è possibile utilizzare SQL raw:

```javascript
async function complexQuery() {
  const [results, metadata] = await sequelize.query(
    `SELECT u.id, u.username, COUNT(p.id) as postCount 
     FROM Users u 
     LEFT JOIN Posts p ON u.id = p.userId 
     GROUP BY u.id 
     HAVING postCount > 5 
     ORDER BY postCount DESC`,
    {
      type: sequelize.QueryTypes.SELECT
    }
  );
  
  return results;
}
```

## Ottimizzazione delle Query

### Selezione dei Campi

Per migliorare le prestazioni, è consigliabile selezionare solo i campi necessari:

```javascript
async function getUsersBasicInfo() {
  const users = await User.findAll({
    attributes: ['id', 'username', 'email'], // Solo i campi necessari
    where: { status: 'active' }
  });
  
  return users;
}
```

È anche possibile rinominare campi o utilizzare funzioni SQL:

```javascript
async function getUsersWithCustomAttributes() {
  const users = await User.findAll({
    attributes: [
      'id',
      ['username', 'name'], // Rinomina username in name
      [sequelize.fn('CONCAT', sequelize.col('firstName'), ' ', sequelize.col('lastName')), 'fullName'], // Concatenazione
      [sequelize.fn('COUNT', sequelize.col('Posts.id')), 'postCount'] // Conteggio
    ],
    include: [
      {
        model: Post,
        as: 'posts',
        attributes: [] // Nessun attributo dal modello incluso
      }
    ],
    group: ['User.id'] // Necessario per l'aggregazione
  });
  
  return users;
}
```

### Esclusione di Campi

È possibile escludere campi specifici:

```javascript
async function getUsersWithoutSensitiveData() {
  const users = await User.findAll({
    attributes: { exclude: ['password', 'secretToken'] }
  });
  
  return users;
}
```

### Eager Loading Ottimizzato

L'eager loading è potente, ma può diventare inefficiente se non ottimizzato:

```javascript
// Eager loading ottimizzato
async function getUsersWithPosts() {
  const users = await User.findAll({
    include: [{
      model: Post,
      as: 'posts',
      attributes: ['id', 'title', 'createdAt'], // Solo i campi necessari
      where: { status: 'published' }, // Filtra i post
      limit: 5, // Limita il numero di post
      order: [['createdAt', 'DESC']] // Ordina i post
    }]
  });
  
  return users;
}
```

### Paginazione

La paginazione è essenziale per gestire grandi set di dati:

```javascript
async function getPaginatedUsers(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  
  const { count, rows } = await User.findAndCountAll({
    limit: pageSize,
    offset: offset,
    order: [['createdAt', 'DESC']]
  });
  
  return {
    users: rows,
    totalItems: count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: page
  };
}
```

### Ottimizzazione delle Relazioni

Per relazioni one-to-many o many-to-many, è possibile ottimizzare il caricamento dei dati:

```javascript
// Caricamento separato per evitare join complessi
async function getUserWithRelatedData(userId) {
  // Prima carica l'utente
  const user = await User.findByPk(userId, {
    attributes: ['id', 'username', 'email']
  });
  
  if (!user) {
    throw new Error('Utente non trovato');
  }
  
  // Poi carica i post in una query separata
  const posts = await Post.findAll({
    where: { userId: user.id },
    attributes: ['id', 'title', 'createdAt'],
    limit: 10,
    order: [['createdAt', 'DESC']]
  });
  
  // Aggiungi i post all'oggetto utente
  user.setDataValue('posts', posts);
  
  return user;
}
```

## Transazioni

Le transazioni sono fondamentali per mantenere l'integrità dei dati quando si eseguono operazioni multiple:

```javascript
async function transferFunds(fromAccountId, toAccountId, amount) {
  // Inizia una transazione
  const t = await sequelize.transaction();
  
  try {
    // Verifica il saldo del conto di origine
    const fromAccount = await Account.findByPk(fromAccountId, { transaction: t, lock: true });
    
    if (!fromAccount || fromAccount.balance < amount) {
      throw new Error('Fondi insufficienti o conto non trovato');
    }
    
    // Verifica l'esistenza del conto di destinazione
    const toAccount = await Account.findByPk(toAccountId, { transaction: t, lock: true });
    
    if (!toAccount) {
      throw new Error('Conto di destinazione non trovato');
    }
    
    // Aggiorna i saldi
    await fromAccount.decrement('balance', { by: amount, transaction: t });
    await toAccount.increment('balance', { by: amount, transaction: t });
    
    // Registra la transazione
    await Transaction.create({
      fromAccountId,
      toAccountId,
      amount,
      type: 'transfer',
      date: new Date()
    }, { transaction: t });
    
    // Commit della transazione
    await t.commit();
    
    return { success: true, message: 'Trasferimento completato con successo' };
  } catch (error) {
    // Rollback in caso di errore
    await t.rollback();
    throw error;
  }
}
```

### Livelli di Isolamento

Sequelize supporta diversi livelli di isolamento delle transazioni:

```javascript
const { Transaction } = require('sequelize');

// Transazione con livello di isolamento specifico
const t = await sequelize.transaction({
  isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
});

// Livelli disponibili:
// - READ_UNCOMMITTED
// - READ_COMMITTED
// - REPEATABLE_READ
// - SERIALIZABLE
```

## Indici

Gli indici sono cruciali per migliorare le prestazioni delle query. Possono essere definiti nei modelli o nelle migrazioni:

```javascript
// Definizione di indici nel modello
const User = sequelize.define('User', {
  // attributi...
}, {
  indexes: [
    {
      name: 'user_email_index',
      unique: true,
      fields: ['email']
    },
    {
      name: 'user_username_index',
      unique: true,
      fields: ['username']
    },
    {
      name: 'user_status_created_index',
      fields: ['status', 'createdAt']
    },
    {
      name: 'user_fulltext_index',
      type: 'FULLTEXT',
      fields: ['bio']
    }
  ]
});
```

## Caching

Il caching può migliorare significativamente le prestazioni per query frequenti:

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Cache per 5 minuti

async function getCachedCategories() {
  const cacheKey = 'all_categories';
  
  // Controlla se i dati sono in cache
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // Se non in cache, recupera dal database
  const categories = await Category.findAll({
    attributes: ['id', 'name'],
    order: [['name', 'ASC']]
  });
  
  // Salva in cache
  cache.set(cacheKey, categories);
  
  return categories;
}

// Invalidazione della cache quando i dati cambiano
async function updateCategory(id, data) {
  const category = await Category.findByPk(id);
  
  if (!category) {
    throw new Error('Categoria non trovata');
  }
  
  await category.update(data);
  
  // Invalida la cache
  cache.del('all_categories');
  
  return category;
}
```

## Logging e Debugging

Il logging delle query può essere utile per il debugging e l'ottimizzazione:

```javascript
// Configurazione del logging
const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'mysql',
  logging: (sql, timing) => {
    console.log(`[${new Date().toISOString()}] ${sql} (${timing}ms)`);
  },
  benchmark: true // Abilita il timing delle query
});

// Logging temporaneo per una singola query
const users = await User.findAll({
  logging: console.log
});
```

## Ottimizzazione del Pool di Connessioni

La configurazione del pool di connessioni può influire significativamente sulle prestazioni:

```javascript
const sequelize = new Sequelize('database', 'username', 'password', {
  dialect: 'mysql',
  pool: {
    max: 10,        // Numero massimo di connessioni nel pool
    min: 0,         // Numero minimo di connessioni nel pool
    acquire: 30000, // Timeout per l'acquisizione di una connessione (ms)
    idle: 10000     // Tempo massimo in cui una connessione può essere inattiva (ms)
  }
});
```

## Best Practices

1. **Seleziona solo i campi necessari**: Evita di utilizzare `SELECT *` quando possibile.

2. **Utilizza gli indici appropriati**: Crea indici per le colonne utilizzate frequentemente nelle clausole WHERE, ORDER BY e JOIN.

3. **Limita i risultati**: Utilizza sempre la paginazione per grandi set di dati.

4. **Ottimizza l'eager loading**: Carica solo le relazioni e i campi necessari.

5. **Utilizza le transazioni**: Assicurati che le operazioni multiple mantengano l'integrità dei dati.

6. **Monitora le prestazioni**: Utilizza il logging e strumenti di monitoraggio per identificare query lente.

7. **Considera il caching**: Implementa strategie di caching per dati che cambiano raramente.

8. **Evita N+1 query**: Utilizza l'eager loading invece di eseguire query separate per ogni record.

9. **Utilizza raw queries quando necessario**: Per query molto complesse, considera l'utilizzo di SQL raw.

10. **Mantieni aggiornate le statistiche del database**: Assicurati che il database abbia statistiche aggiornate per ottimizzare l'esecuzione delle query.

## Conclusione

L'ottimizzazione delle query è un aspetto fondamentale per garantire prestazioni elevate nelle applicazioni che utilizzano Sequelize. Combinando le tecniche avanzate di query con strategie di ottimizzazione come la selezione precisa dei campi, l'uso appropriato degli indici e il caching, è possibile migliorare significativamente i tempi di risposta e la scalabilità dell'applicazione.

Ricorda che l'ottimizzazione dovrebbe essere guidata da misurazioni reali e non da supposizioni. Utilizza strumenti di profiling e monitoraggio per identificare i colli di bottiglia effettivi e concentra gli sforzi di ottimizzazione dove avranno il maggiore impatto.

Infine, mantieni un equilibrio tra la leggibilità del codice e l'ottimizzazione delle prestazioni. Un codice troppo ottimizzato ma difficile da comprendere può creare problemi di manutenibilità a lungo termine.

---

## Navigazione del Corso

- [Indice del Corso Node.js](../../README.md)
- **Modulo Corrente: ORM (Object-Relational Mapping)**
  - [01 - Introduzione agli ORM](./01-introduzione-orm.md)
  - [02 - Sequelize: Configurazione e Modelli](./02-sequelize-configurazione.md)
  - [03 - Relazioni tra Modelli](./03-relazioni-modelli.md)
  - [04 - Migrazioni e Seed](./04-migrazioni-seed.md)
  - **05 - Query Avanzate e Ottimizzazione** (Documento Corrente)