# Sequelize: Configurazione e Modelli

## Introduzione a Sequelize

Sequelize è un ORM (Object-Relational Mapping) basato su promesse per Node.js, che supporta i database PostgreSQL, MySQL, MariaDB, SQLite e Microsoft SQL Server. Fornisce un'astrazione solida per gestire database relazionali, permettendo di interagire con il database utilizzando oggetti JavaScript invece di scrivere query SQL direttamente.

## Installazione e Setup

### Installazione

Per iniziare a utilizzare Sequelize, è necessario installare il pacchetto principale e il driver specifico per il database che si intende utilizzare. Per MySQL, eseguire i seguenti comandi:

```bash
npm install sequelize
npm install mysql2
```

Per altri database, sostituire `mysql2` con il driver appropriato:
- PostgreSQL: `pg pg-hstore`
- SQLite: `sqlite3`
- Microsoft SQL Server: `tedious`

### Configurazione della Connessione

Il primo passo per utilizzare Sequelize è creare un'istanza di connessione al database:

```javascript
// db.js
const { Sequelize } = require('sequelize');

// Opzione 1: Passare i parametri di connessione separatamente
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql', // uno tra 'mysql', 'postgres', 'sqlite', 'mariadb', 'mssql'
  port: 3306,       // porta predefinita per MySQL
  
  // Opzioni del pool di connessioni
  pool: {
    max: 5,         // numero massimo di connessioni nel pool
    min: 0,         // numero minimo di connessioni nel pool
    acquire: 30000, // tempo massimo in ms per acquisire una connessione
    idle: 10000     // tempo massimo in ms in cui una connessione può essere inattiva
  },
  
  // Opzioni di logging
  logging: console.log, // funzione per il logging (false per disabilitare)
  
  // Timezone per le date
  timezone: '+01:00' // timezone per le date (default: locale)
});

// Opzione 2: Utilizzare una stringa di connessione URI
// const sequelize = new Sequelize('mysql://user:password@localhost:3306/database');

// Test della connessione
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connessione al database stabilita con successo.');
  } catch (error) {
    console.error('Impossibile connettersi al database:', error);
  }
}

testConnection();

module.exports = sequelize;
```

### Gestione delle Credenziali

È importante non hardcodare le credenziali del database nel codice. Utilizzare invece variabili d'ambiente o file di configurazione:

```javascript
// config.js
require('dotenv').config(); // Richiede il pacchetto dotenv

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306
  },
  test: {
    // Configurazione per l'ambiente di test
  },
  production: {
    // Configurazione per l'ambiente di produzione
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: false, // Disabilita il logging in produzione
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
```

E poi nel file `.env`:

```
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=my_database
DB_HOST=localhost
DB_PORT=3306
```

## Definizione dei Modelli

I modelli in Sequelize rappresentano le tabelle nel database. Definiscono la struttura dei dati e le relazioni tra le diverse entità.

### Sintassi di Base

```javascript
// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  // Definizione degli attributi del modello
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
      isEmail: true // Validatore integrato
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastLogin: {
    type: DataTypes.DATE
  }
}, {
  // Opzioni del modello
  tableName: 'users', // Nome della tabella nel database (default: plurale del nome del modello)
  timestamps: true,    // Aggiunge automaticamente createdAt e updatedAt (default: true)
  paranoid: true,      // Soft delete - aggiunge deletedAt invece di eliminare fisicamente (default: false)
  underscored: true,   // Utilizza snake_case per i nomi delle colonne (default: false)
  freezeTableName: false, // Impedisce a Sequelize di pluralizzare il nome della tabella (default: false)
  indexes: [
    // Definizione di indici
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = User;
```

### Tipi di Dati

Sequelize supporta numerosi tipi di dati, mappati ai tipi SQL corrispondenti:

```javascript
const { DataTypes } = require('sequelize');

// Tipi di dati comuni
const types = {
  // Stringhe
  string: DataTypes.STRING,        // VARCHAR(255)
  text: DataTypes.TEXT,           // TEXT
  char: DataTypes.CHAR(10),       // CHAR(10)
  
  // Numeri
  integer: DataTypes.INTEGER,     // INTEGER
  bigint: DataTypes.BIGINT,       // BIGINT
  float: DataTypes.FLOAT,         // FLOAT
  decimal: DataTypes.DECIMAL(10, 2), // DECIMAL(10,2)
  
  // Booleani
  boolean: DataTypes.BOOLEAN,     // TINYINT(1)
  
  // Date e orari
  date: DataTypes.DATEONLY,       // DATE
  datetime: DataTypes.DATE,       // DATETIME
  time: DataTypes.TIME,           // TIME
  
  // Altri
  json: DataTypes.JSON,           // JSON
  uuid: DataTypes.UUID,           // UUID
  enum: DataTypes.ENUM('value1', 'value2'), // ENUM
  array: DataTypes.ARRAY(DataTypes.STRING) // Array (solo PostgreSQL)
};
```

### Validatori

Sequelize offre validatori integrati per garantire l'integrità dei dati prima che vengano salvati nel database:

```javascript
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    validate: {
      len: [3, 20], // Lunghezza tra 3 e 20 caratteri
      isAlphanumeric: true // Solo caratteri alfanumerici
    }
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true // Deve essere un'email valida
    }
  },
  age: {
    type: DataTypes.INTEGER,
    validate: {
      min: 18, // Valore minimo 18
      max: 99  // Valore massimo 99
    }
  },
  password: {
    type: DataTypes.STRING,
    validate: {
      // Validatore personalizzato
      isStrong(value) {
        if (value.length < 8) {
          throw new Error('La password deve essere di almeno 8 caratteri');
        }
        if (!(/[A-Z]/.test(value))) {
          throw new Error('La password deve contenere almeno una lettera maiuscola');
        }
        if (!(/[0-9]/.test(value))) {
          throw new Error('La password deve contenere almeno un numero');
        }
      }
    }
  }
});
```

### Hooks (Ganci)

I hooks permettono di eseguire funzioni in determinati momenti del ciclo di vita di un'istanza:

```javascript
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  username: DataTypes.STRING,
  password: DataTypes.STRING
}, {
  hooks: {
    // Prima di creare un nuovo utente
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Prima di aggiornare un utente
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Dopo aver trovato un utente
    afterFind: (user) => {
      if (user) {
        // Rimuovi la password dai risultati
        if (Array.isArray(user)) {
          user.forEach(u => {
            delete u.dataValues.password;
          });
        } else {
          delete user.dataValues.password;
        }
      }
      return user;
    }
  }
});
```

## Sincronizzazione con il Database

Dopo aver definito i modelli, è necessario sincronizzarli con il database per creare le tabelle corrispondenti:

```javascript
// sync.js
const sequelize = require('./db');

// Importa tutti i modelli
const User = require('./models/User');
const Post = require('./models/Post');
// ... altri modelli

// Sincronizza tutti i modelli con il database
async function syncDatabase() {
  try {
    // Opzione 1: Sincronizzazione normale
    await sequelize.sync();
    console.log('Database sincronizzato');
    
    // Opzione 2: Forza la sincronizzazione (DROP TABLE IF EXISTS)
    // ATTENZIONE: Questo eliminerà tutte le tabelle esistenti!
    // await sequelize.sync({ force: true });
    // console.log('Database sincronizzato (tabelle ricreate)');
    
    // Opzione 3: Sincronizzazione con alter (aggiorna le tabelle esistenti)
    // await sequelize.sync({ alter: true });
    // console.log('Database sincronizzato (tabelle aggiornate)');
  } catch (error) {
    console.error('Errore durante la sincronizzazione:', error);
  }
}

syncDatabase();
```

### Considerazioni sulla Sincronizzazione

- `sync()`: Crea le tabelle se non esistono, ma non apporta modifiche alle tabelle esistenti.
- `sync({ force: true })`: Elimina le tabelle esistenti e le ricrea. Utile durante lo sviluppo, ma pericoloso in produzione.
- `sync({ alter: true })`: Confronta lo stato attuale della tabella con la definizione del modello e apporta le modifiche necessarie. Più sicuro di `force`, ma può comunque causare perdita di dati.

In ambienti di produzione, è consigliabile utilizzare le migrazioni invece della sincronizzazione automatica per un controllo più preciso sulle modifiche allo schema.

## Organizzazione dei Modelli

Per progetti di medie e grandi dimensioni, è consigliabile organizzare i modelli in file separati e utilizzare un file index per centralizzare le importazioni e le relazioni:

```javascript
// models/index.js
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config.database, config.username, config.password, config);
const db = {};

// Importa automaticamente tutti i modelli nella directory
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Configura le associazioni tra i modelli
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

E ogni modello sarebbe definito come una funzione che accetta sequelize e DataTypes:

```javascript
// models/User.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    // Definizione degli attributi
  });
  
  User.associate = function(models) {
    // Definizione delle associazioni
    User.hasMany(models.Post, { foreignKey: 'userId' });
  };
  
  return User;
};
```

## Conclusione

La configurazione corretta di Sequelize e la definizione accurata dei modelli sono fondamentali per sfruttare appieno le potenzialità di questo ORM. Una buona organizzazione del codice e l'utilizzo delle funzionalità avanzate come validatori e hooks possono migliorare significativamente la qualità e la manutenibilità del codice.

Nel prossimo capitolo, esploreremo come definire e gestire le relazioni tra i modelli, un aspetto cruciale per lavorare con database relazionali.

---

## Navigazione del Corso

- [Indice del Corso Node.js](../../README.md)
- **Modulo Corrente: ORM (Object-Relational Mapping)**
  - [01 - Introduzione agli ORM](./01-introduzione-orm.md)
  - **02 - Sequelize: Configurazione e Modelli** (Documento Corrente)
  - [03 - Relazioni tra Modelli](./03-relazioni-modelli.md)
  - [04 - Migrazioni e Seed](./04-migrazioni-seed.md)
  - [05 - Query Avanzate e Ottimizzazione](./05-query-avanzate.md)