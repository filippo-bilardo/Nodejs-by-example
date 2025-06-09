# Relazioni tra Modelli in Sequelize

## Introduzione alle Relazioni

Uno dei vantaggi principali dell'utilizzo di un ORM come Sequelize è la capacità di gestire facilmente le relazioni tra diverse entità del database. Le relazioni (o associazioni) permettono di modellare le connessioni tra tabelle, riflettendo la struttura relazionale del database nel codice orientato agli oggetti.

Sequelize supporta tutti i tipi di relazioni comuni nei database relazionali:

1. **One-to-One (Uno a Uno)**: Un record in una tabella è associato a esattamente un record in un'altra tabella.
2. **One-to-Many (Uno a Molti)**: Un record in una tabella può essere associato a più record in un'altra tabella.
3. **Many-to-Many (Molti a Molti)**: Più record in una tabella possono essere associati a più record in un'altra tabella.

## Definizione delle Relazioni

### One-to-One (Uno a Uno)

Una relazione uno a uno si verifica quando un record in una tabella è associato a esattamente un record in un'altra tabella. Ad esempio, un utente potrebbe avere un solo profilo dettagliato.

```javascript
// models/User.js
const User = sequelize.define('User', {
  // attributi del modello
});

// models/Profile.js
const Profile = sequelize.define('Profile', {
  // attributi del modello
});

// Definizione della relazione
User.hasOne(Profile, {
  foreignKey: 'userId', // Nome della chiave esterna nella tabella Profile
  as: 'profile'         // Alias per accedere al profilo da un'istanza User
});

Profile.belongsTo(User, {
  foreignKey: 'userId'  // Deve corrispondere alla chiave esterna definita sopra
});
```

In questo esempio:
- `User.hasOne(Profile)` indica che un utente ha un solo profilo.
- `Profile.belongsTo(User)` indica che un profilo appartiene a un solo utente.

La chiave esterna `userId` verrà creata nella tabella `Profiles` e farà riferimento alla chiave primaria della tabella `Users`.

### One-to-Many (Uno a Molti)

Una relazione uno a molti si verifica quando un record in una tabella può essere associato a più record in un'altra tabella. Ad esempio, un utente può avere molti post.

```javascript
// models/User.js
const User = sequelize.define('User', {
  // attributi del modello
});

// models/Post.js
const Post = sequelize.define('Post', {
  // attributi del modello
});

// Definizione della relazione
User.hasMany(Post, {
  foreignKey: 'userId',  // Nome della chiave esterna nella tabella Post
  as: 'posts'            // Alias per accedere ai post da un'istanza User
});

Post.belongsTo(User, {
  foreignKey: 'userId',  // Deve corrispondere alla chiave esterna definita sopra
  as: 'author'           // Alias per accedere all'autore da un'istanza Post
});
```

In questo esempio:
- `User.hasMany(Post)` indica che un utente può avere molti post.
- `Post.belongsTo(User)` indica che un post appartiene a un solo utente.

La chiave esterna `userId` verrà creata nella tabella `Posts` e farà riferimento alla chiave primaria della tabella `Users`.

### Many-to-Many (Molti a Molti)

Una relazione molti a molti si verifica quando più record in una tabella possono essere associati a più record in un'altra tabella. Ad esempio, un post può avere molti tag e un tag può essere associato a molti post.

Per implementare questa relazione, Sequelize utilizza una tabella di giunzione (junction table):

```javascript
// models/Post.js
const Post = sequelize.define('Post', {
  // attributi del modello
});

// models/Tag.js
const Tag = sequelize.define('Tag', {
  // attributi del modello
});

// Definizione della relazione
Post.belongsToMany(Tag, {
  through: 'PostTags',  // Nome della tabella di giunzione
  foreignKey: 'postId', // Nome della chiave esterna per Post nella tabella di giunzione
  otherKey: 'tagId',    // Nome della chiave esterna per Tag nella tabella di giunzione
  as: 'tags'            // Alias per accedere ai tag da un'istanza Post
});

Tag.belongsToMany(Post, {
  through: 'PostTags',  // Nome della tabella di giunzione (deve essere lo stesso)
  foreignKey: 'tagId',  // Nome della chiave esterna per Tag nella tabella di giunzione
  otherKey: 'postId',   // Nome della chiave esterna per Post nella tabella di giunzione
  as: 'posts'           // Alias per accedere ai post da un'istanza Tag
});
```

In questo esempio:
- `Post.belongsToMany(Tag)` indica che un post può avere molti tag.
- `Tag.belongsToMany(Post)` indica che un tag può essere associato a molti post.

Sequelize creerà automaticamente una tabella di giunzione chiamata `PostTags` con due chiavi esterne: `postId` e `tagId`.

### Tabella di Giunzione Personalizzata

È possibile definire una tabella di giunzione personalizzata con attributi aggiuntivi:

```javascript
// models/PostTag.js
const PostTag = sequelize.define('PostTag', {
  // Attributi aggiuntivi per la tabella di giunzione
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  importance: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  }
});

// Definizione della relazione con tabella di giunzione personalizzata
Post.belongsToMany(Tag, {
  through: PostTag,     // Modello della tabella di giunzione
  foreignKey: 'postId',
  otherKey: 'tagId',
  as: 'tags'
});

Tag.belongsToMany(Post, {
  through: PostTag,     // Modello della tabella di giunzione
  foreignKey: 'tagId',
  otherKey: 'postId',
  as: 'posts'
});
```

## Opzioni Comuni per le Relazioni

Sequelize offre diverse opzioni per personalizzare il comportamento delle relazioni:

```javascript
User.hasMany(Post, {
  foreignKey: {
    name: 'userId',        // Nome della chiave esterna
    allowNull: false       // La chiave esterna non può essere null
  },
  as: 'posts',             // Alias per l'associazione
  onDelete: 'CASCADE',     // Comportamento in caso di eliminazione (CASCADE, SET NULL, etc.)
  onUpdate: 'CASCADE',     // Comportamento in caso di aggiornamento
  constraints: true,       // Aggiunge vincoli di chiave esterna a livello di database
  scope: {                 // Applica uno scope all'associazione
    status: 'active'
  }
});
```

### Opzioni di Eliminazione e Aggiornamento

- `CASCADE`: Quando un record viene eliminato/aggiornato, elimina/aggiorna anche tutti i record associati.
- `SET NULL`: Quando un record viene eliminato, imposta la chiave esterna a NULL nei record associati.
- `RESTRICT`: Impedisce l'eliminazione di un record se esistono record associati.
- `NO ACTION`: Simile a RESTRICT, ma controllato dal database anziché da Sequelize.
- `SET DEFAULT`: Imposta la chiave esterna al valore predefinito quando il record associato viene eliminato.

## Utilizzo delle Relazioni

### Creazione di Record con Associazioni

```javascript
// Creazione di un utente con un profilo
async function createUserWithProfile() {
  try {
    const user = await User.create({
      username: 'john_doe',
      email: 'john@example.com',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Software developer'
      }
    }, {
      include: [{ model: Profile, as: 'profile' }]
    });
    
    console.log('Utente creato con profilo:', user.toJSON());
    return user;
  } catch (error) {
    console.error('Errore:', error);
    throw error;
  }
}

// Creazione di un post con tag
async function createPostWithTags() {
  try {
    const post = await Post.create({
      title: 'Introduzione a Sequelize',
      content: 'Sequelize è un ORM per Node.js...',
      tags: [
        { name: 'nodejs' },
        { name: 'sequelize' },
        { name: 'tutorial' }
      ]
    }, {
      include: [{ model: Tag, as: 'tags' }]
    });
    
    console.log('Post creato con tag:', post.toJSON());
    return post;
  } catch (error) {
    console.error('Errore:', error);
    throw error;
  }
}
```

### Eager Loading (Caricamento Anticipato)

L'eager loading permette di caricare i record associati insieme al record principale in un'unica query:

```javascript
// Caricamento di un utente con i suoi post
async function getUserWithPosts(userId) {
  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: Post,
        as: 'posts',
        include: [{
          model: Tag,
          as: 'tags'
        }]
      }]
    });
    
    if (!user) {
      throw new Error('Utente non trovato');
    }
    
    console.log('Utente:', user.username);
    console.log('Numero di post:', user.posts.length);
    
    // Accesso ai post e ai tag
    user.posts.forEach(post => {
      console.log('Post:', post.title);
      console.log('Tag:', post.tags.map(tag => tag.name).join(', '));
    });
    
    return user;
  } catch (error) {
    console.error('Errore:', error);
    throw error;
  }
}
```

### Lazy Loading (Caricamento Pigro)

Il lazy loading permette di caricare i record associati solo quando necessario:

```javascript
async function getUserAndLoadPosts(userId) {
  try {
    // Carica solo l'utente
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Utente non trovato');
    }
    
    console.log('Utente:', user.username);
    
    // Carica i post solo quando necessario
    const posts = await user.getPosts();
    console.log('Numero di post:', posts.length);
    
    return { user, posts };
  } catch (error) {
    console.error('Errore:', error);
    throw error;
  }
}
```

Sequelize genera automaticamente metodi getter e setter per le associazioni:

- `get<Models>`: Recupera i modelli associati (es. `user.getPosts()`)
- `set<Models>`: Sostituisce le associazioni esistenti (es. `user.setPosts([post1, post2])`)
- `add<Model>`: Aggiunge un'associazione (es. `user.addPost(post)`)
- `add<Models>`: Aggiunge più associazioni (es. `user.addPosts([post1, post2])`)
- `remove<Model>`: Rimuove un'associazione (es. `user.removePost(post)`)
- `remove<Models>`: Rimuove più associazioni (es. `user.removePosts([post1, post2])`)
- `has<Model>`: Verifica se esiste un'associazione (es. `user.hasPost(post)`)
- `has<Models>`: Verifica se esistono più associazioni (es. `user.hasPosts([post1, post2])`)
- `count<Models>`: Conta le associazioni (es. `user.countPosts()`)

## Filtri e Ordinamento nelle Relazioni

È possibile applicare filtri e ordinamento ai record associati durante il caricamento:

```javascript
async function getUserWithFilteredPosts(userId) {
  try {
    const user = await User.findByPk(userId, {
      include: [{
        model: Post,
        as: 'posts',
        where: {
          status: 'published' // Solo post pubblicati
        },
        order: [
          ['createdAt', 'DESC'] // Ordina per data di creazione decrescente
        ],
        limit: 5 // Limita a 5 post
      }]
    });
    
    return user;
  } catch (error) {
    console.error('Errore:', error);
    throw error;
  }
}
```

## Relazioni Ricorsive

Sequelize supporta anche relazioni ricorsive, dove un modello è associato a se stesso:

```javascript
// Relazione ricorsiva per una struttura ad albero (es. commenti e risposte)
const Comment = sequelize.define('Comment', {
  content: DataTypes.TEXT
});

// Auto-associazione
Comment.hasMany(Comment, {
  as: 'replies',
  foreignKey: 'parentId'
});

Comment.belongsTo(Comment, {
  as: 'parent',
  foreignKey: 'parentId'
});
```

## Best Practices

1. **Definisci sempre entrambi i lati della relazione**: Anche se tecnicamente non sempre necessario, definire entrambi i lati (`hasOne`/`belongsTo`, `hasMany`/`belongsTo`, `belongsToMany`/`belongsToMany`) rende il codice più chiaro e previene potenziali problemi.

2. **Usa gli alias**: Assegna sempre un alias significativo alle relazioni, specialmente quando hai più relazioni tra gli stessi modelli.

3. **Centralizza la definizione delle relazioni**: Definisci tutte le relazioni in un unico punto (es. nel file `models/index.js`) per evitare riferimenti circolari e mantenere il codice organizzato.

4. **Attenzione alle query N+1**: Utilizza l'eager loading quando necessario per evitare di eseguire una query separata per ogni record associato.

5. **Considera l'impatto delle operazioni a cascata**: Scegli con attenzione le opzioni `onDelete` e `onUpdate` in base alle esigenze dell'applicazione.

## Conclusione

Le relazioni sono una parte fondamentale della modellazione dei dati in Sequelize e nei database relazionali in generale. Una corretta definizione e gestione delle relazioni permette di creare applicazioni robuste e scalabili, mantenendo l'integrità dei dati e semplificando le operazioni di lettura e scrittura.

Nel prossimo capitolo, esploreremo le migrazioni e i seed in Sequelize, strumenti essenziali per gestire l'evoluzione dello schema del database e popolare il database con dati iniziali.

---

## Navigazione del Corso

- [Indice del Corso Node.js](../../README.md)
- **Modulo Corrente: ORM (Object-Relational Mapping)**
  - [01 - Introduzione agli ORM](./01-introduzione-orm.md)
  - [02 - Sequelize: Configurazione e Modelli](./02-sequelize-configurazione.md)
  - **03 - Relazioni tra Modelli** (Documento Corrente)
  - [04 - Migrazioni e Seed](./04-migrazioni-seed.md)
  - [05 - Query Avanzate e Ottimizzazione](./05-query-avanzate.md)