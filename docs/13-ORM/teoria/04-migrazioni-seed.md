# Migrazioni e Seed in Sequelize

## Introduzione alle Migrazioni

Le migrazioni sono un modo per gestire l'evoluzione dello schema del database nel tempo. Funzionano come un sistema di controllo versione per il database, permettendo di modificare lo schema in modo controllato e reversibile. Questo è particolarmente importante in ambienti di produzione, dove la sincronizzazione automatica (`sequelize.sync()`) potrebbe causare perdita di dati.

I vantaggi principali dell'utilizzo delle migrazioni includono:

1. **Controllo versione del database**: Ogni modifica allo schema è tracciata e può essere applicata o annullata.
2. **Collaborazione**: Più sviluppatori possono lavorare sullo stesso database senza conflitti.
3. **Deployment sicuro**: Le modifiche al database possono essere testate e applicate in modo sicuro in produzione.
4. **Rollback**: In caso di problemi, è possibile tornare a una versione precedente dello schema.

## Configurazione delle Migrazioni

Per utilizzare le migrazioni in Sequelize, è necessario installare il CLI di Sequelize:

```bash
npm install --save-dev sequelize-cli
```

Successivamente, è possibile inizializzare la struttura delle directory per le migrazioni:

```bash
npx sequelize-cli init
```

Questo comando creerà le seguenti directory:

- `config`: Contiene il file di configurazione del database
- `migrations`: Contiene i file di migrazione
- `models`: Contiene i modelli Sequelize
- `seeders`: Contiene i file di seed

### Configurazione del Database

Il file `config/config.json` contiene la configurazione per diversi ambienti (development, test, production):

```json
{
  "development": {
    "username": "root",
    "password": "password",
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": "password",
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": "password",
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

Per una maggiore sicurezza, è possibile utilizzare variabili d'ambiente invece di hardcodare le credenziali:

```javascript
// config/config.js
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_DEV,
    host: process.env.DB_HOST,
    dialect: 'mysql'
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_TEST,
    host: process.env.DB_HOST,
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME_PROD,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
};
```

E aggiornare il file `.sequelizerc` per utilizzare il file JS invece del JSON:

```javascript
// .sequelizerc
const path = require('path');

module.exports = {
  'config': path.resolve('config', 'config.js'),
  'models-path': path.resolve('models'),
  'seeders-path': path.resolve('seeders'),
  'migrations-path': path.resolve('migrations')
};
```

## Creazione e Gestione delle Migrazioni

### Creazione di una Migrazione

Per creare una nuova migrazione, utilizzare il comando:

```bash
npx sequelize-cli migration:generate --name create-users
```

Questo creerà un file nella directory `migrations` con un timestamp e il nome specificato, ad esempio: `20230101000000-create-users.js`.

Il file di migrazione ha due funzioni principali: `up` per applicare la migrazione e `down` per annullarla:

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Codice per applicare la migrazione
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Codice per annullare la migrazione
    await queryInterface.dropTable('Users');
  }
};
```

### Applicazione delle Migrazioni

Per applicare tutte le migrazioni pendenti:

```bash
npx sequelize-cli db:migrate
```

Per annullare l'ultima migrazione:

```bash
npx sequelize-cli db:migrate:undo
```

Per annullare tutte le migrazioni:

```bash
npx sequelize-cli db:migrate:undo:all
```

Per annullare fino a una specifica migrazione:

```bash
npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXXXX-create-users.js
```

### Esempi di Migrazioni Comuni

#### Creazione di una Tabella

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Posts');
  }
};
```

#### Aggiunta di una Colonna

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'phoneNumber');
  }
};
```

#### Modifica di una Colonna

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false
    });
  }
};
```

#### Aggiunta di un Indice

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex('Posts', ['title'], {
      name: 'posts_title_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Posts', 'posts_title_index');
  }
};
```

#### Creazione di una Tabella di Giunzione

```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PostTags', {
      postId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tagId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: {
          model: 'Tags',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PostTags');
  }
};
```

## Seed Data

I seed sono utilizzati per popolare il database con dati iniziali, utili per test, sviluppo o per fornire dati predefiniti all'applicazione.

### Creazione di un Seed

Per creare un nuovo seed:

```bash
npx sequelize-cli seed:generate --name demo-users
```

Questo creerà un file nella directory `seeders`, ad esempio: `20230101000000-demo-users.js`.

Il file di seed ha due funzioni: `up` per inserire i dati e `down` per rimuoverli:

```javascript
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      username: 'admin',
      email: 'admin@example.com',
      password: '$2b$10$X9xO1hVfJ9oLAVQP.xTC7uQT3/vz1O.Yv7.7Q9qmQzOGpQXtQ3Z6W', // 'password' hashato
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'user1',
      email: 'user1@example.com',
      password: '$2b$10$X9xO1hVfJ9oLAVQP.xTC7uQT3/vz1O.Yv7.7Q9qmQzOGpQXtQ3Z6W',
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      username: 'user2',
      email: 'user2@example.com',
      password: '$2b$10$X9xO1hVfJ9oLAVQP.xTC7uQT3/vz1O.Yv7.7Q9qmQzOGpQXtQ3Z6W',
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
```

### Applicazione dei Seed

Per applicare tutti i seed:

```bash
npx sequelize-cli db:seed:all
```

Per annullare l'ultimo seed:

```bash
npx sequelize-cli db:seed:undo
```

Per annullare tutti i seed:

```bash
npx sequelize-cli db:seed:undo:all
```

### Seed con Relazioni

Quando si popolano tabelle con relazioni, è importante mantenere l'integrità referenziale. Un approccio comune è creare seed separati per ogni tabella e assicurarsi che vengano eseguiti nell'ordine corretto:

```javascript
// 20230101000000-demo-users.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [/* ... */]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};

// 20230101000001-demo-posts.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Prima recupera gli ID degli utenti inseriti
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM Users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    // Poi inserisci i post con gli ID degli utenti corretti
    await queryInterface.bulkInsert('Posts', [
      {
        title: 'Primo post',
        content: 'Contenuto del primo post',
        userId: users[0].id,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Secondo post',
        content: 'Contenuto del secondo post',
        userId: users[1].id,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Posts', null, {});
  }
};
```

## Generazione Automatica di Migrazioni

Sequelize CLI può generare automaticamente migrazioni basate sui modelli esistenti:

```bash
npx sequelize-cli model:generate --name User --attributes username:string,email:string,password:string,isAdmin:boolean
```

Questo comando creerà sia un modello che una migrazione corrispondente. Tuttavia, potrebbe essere necessario modificare manualmente la migrazione per aggiungere vincoli, indici o altre opzioni avanzate.

## Best Practices

1. **Versiona le migrazioni**: Includi i file di migrazione nel controllo versione (git) per garantire che tutti gli sviluppatori e gli ambienti utilizzino lo stesso schema.

2. **Migrazioni atomiche**: Ogni migrazione dovrebbe fare una cosa sola (creare una tabella, aggiungere una colonna, ecc.) per facilitare il rollback in caso di problemi.

3. **Test delle migrazioni**: Testa le migrazioni in un ambiente di sviluppo o test prima di applicarle in produzione.

4. **Backup del database**: Esegui sempre un backup del database prima di applicare migrazioni in produzione.

5. **Seed per ambienti specifici**: Crea seed diversi per ambienti diversi (dati di test per sviluppo, dati essenziali per produzione).

6. **Documentazione**: Documenta le modifiche significative allo schema nel codice delle migrazioni.

7. **Evita modifiche distruttive**: Quando possibile, preferisci aggiungere nuove colonne o tabelle invece di modificare o eliminare quelle esistenti.

## Conclusione

Le migrazioni e i seed sono strumenti potenti per gestire l'evoluzione del database e garantire la coerenza tra diversi ambienti. Utilizzando questi strumenti, è possibile mantenere un controllo preciso sullo schema del database e sui dati iniziali, facilitando lo sviluppo collaborativo e il deployment sicuro delle applicazioni.

Nel prossimo capitolo, esploreremo le query avanzate e le tecniche di ottimizzazione in Sequelize, per sfruttare al massimo le potenzialità dell'ORM e migliorare le prestazioni delle applicazioni.

---

## Navigazione del Corso

- [Indice del Corso Node.js](../../README.md)
- **Modulo Corrente: ORM (Object-Relational Mapping)**
  - [01 - Introduzione agli ORM](./01-introduzione-orm.md)
  - [02 - Sequelize: Configurazione e Modelli](./02-sequelize-configurazione.md)
  - [03 - Relazioni tra Modelli](./03-relazioni-modelli.md)
  - **04 - Migrazioni e Seed** (Documento Corrente)
  - [05 - Query Avanzate e Ottimizzazione](./05-query-avanzate.md)