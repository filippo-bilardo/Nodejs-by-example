# Fondamenti di Autenticazione e Autorizzazione

## Introduzione

L'autenticazione e l'autorizzazione sono due concetti fondamentali nella sicurezza delle applicazioni web. Sebbene spesso vengano menzionati insieme, svolgono ruoli distinti ma complementari nel garantire che solo gli utenti legittimi possano accedere alle risorse appropriate.

## Autenticazione vs Autorizzazione

### Autenticazione

L'**autenticazione** è il processo di verifica dell'identità di un utente. In termini semplici, risponde alla domanda: "Chi sei?"

Il processo di autenticazione tipicamente include:

1. **Raccolta delle credenziali**: L'utente fornisce informazioni che dimostrano la sua identità (es. username e password, token, certificati digitali).
2. **Verifica delle credenziali**: Il sistema confronta le credenziali fornite con quelle memorizzate.
3. **Conferma dell'identità**: Se le credenziali corrispondono, l'identità dell'utente viene confermata.

### Autorizzazione

L'**autorizzazione** è il processo che determina quali azioni un utente autenticato può eseguire. Risponde alla domanda: "Cosa puoi fare?"

L'autorizzazione avviene solo dopo che l'autenticazione è stata completata con successo e tipicamente include:

1. **Verifica dei permessi**: Il sistema controlla se l'utente ha i permessi necessari per accedere a una risorsa o eseguire un'azione.
2. **Applicazione delle politiche di accesso**: Il sistema applica regole predefinite per determinare l'accesso.
3. **Concessione o negazione dell'accesso**: In base ai permessi, l'accesso viene concesso o negato.

## Fattori di Autenticazione

I fattori di autenticazione sono categorie di credenziali utilizzate per verificare l'identità. Esistono principalmente tre categorie:

1. **Qualcosa che sai** (conoscenza)
   - Password
   - PIN
   - Risposte a domande di sicurezza

2. **Qualcosa che hai** (possesso)
   - Token fisici o virtuali
   - Smartphone (per ricevere codici SMS o utilizzare app di autenticazione)
   - Smart card

3. **Qualcosa che sei** (inerenza)
   - Impronte digitali
   - Riconoscimento facciale
   - Scansione dell'iride
   - Riconoscimento vocale

### Autenticazione a Più Fattori (MFA)

L'**autenticazione a più fattori** (MFA) richiede l'uso di due o più fattori di autenticazione di categorie diverse. Questo approccio aumenta significativamente la sicurezza, poiché un attaccante dovrebbe compromettere più tipi di credenziali per ottenere l'accesso.

L'**autenticazione a due fattori** (2FA) è un sottoinsieme dell'MFA che richiede specificamente due fattori diversi.

## Strategie di Autenticazione

### Autenticazione Basata su Password

È il metodo più comune, dove gli utenti forniscono un identificatore (solitamente username o email) e una password.

**Best practices**:
- Imporre requisiti di complessità delle password
- Utilizzare algoritmi di hashing sicuri (bcrypt, Argon2)
- Implementare protezioni contro attacchi di forza bruta
- Richiedere il cambio periodico delle password

### Autenticazione Basata su Token

Dopo l'autenticazione iniziale, il server genera un token che viene utilizzato per le richieste successive.

**Tipi di token**:
- **JWT (JSON Web Tokens)**: Token firmati che contengono informazioni sull'utente
- **Token opachi**: Stringhe casuali che fanno riferimento a informazioni memorizzate sul server

### Single Sign-On (SSO)

Permette agli utenti di accedere a più applicazioni con un'unica autenticazione.

**Protocolli comuni**:
- **SAML (Security Assertion Markup Language)**
- **OAuth 2.0** (principalmente per autorizzazione)
- **OpenID Connect** (estensione di OAuth 2.0 per autenticazione)

### Autenticazione Passwordless

Metodi che non richiedono password:
- **Magic links** inviati via email
- **WebAuthn/FIDO2** per autenticazione biometrica o basata su dispositivo
- **One-Time Passwords (OTP)** inviati via SMS o generati da app

## Modelli di Autorizzazione

### Controllo di Accesso Basato sui Ruoli (RBAC)

Gli utenti vengono assegnati a ruoli, e i permessi vengono concessi ai ruoli anziché ai singoli utenti.

**Componenti**:
- **Utenti**: Entità che necessitano di accesso
- **Ruoli**: Collezioni di permessi
- **Permessi**: Diritti di eseguire operazioni specifiche

**Esempio in Node.js**:
```javascript
function checkRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autenticato' });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Accesso negato' });
    }
    
    next();
  };
}

// Utilizzo
app.get('/admin/dashboard', checkRole('admin'), (req, res) => {
  res.send('Dashboard amministratore');
});
```

### Controllo di Accesso Basato sugli Attributi (ABAC)

Le decisioni di accesso si basano su attributi dell'utente, della risorsa, dell'azione e del contesto.

**Vantaggi**:
- Maggiore granularità rispetto all'RBAC
- Flessibilità per politiche di accesso complesse
- Possibilità di considerare il contesto (ora, posizione, ecc.)

**Esempio in Node.js**:
```javascript
function checkPermission(resource, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autenticato' });
    }
    
    // Verifica se l'utente può eseguire l'azione sulla risorsa
    const canAccess = authorizationService.checkAccess({
      user: req.user,
      resource: resource,
      action: action,
      context: {
        time: new Date(),
        ip: req.ip
      }
    });
    
    if (!canAccess) {
      return res.status(403).json({ message: 'Accesso negato' });
    }
    
    next();
  };
}

// Utilizzo
app.put('/posts/:id', checkPermission('post', 'update'), (req, res) => {
  // Aggiorna il post
});
```

### Controllo di Accesso Basato sulle Relazioni (ReBAC)

Le decisioni di accesso si basano sulle relazioni tra utenti e risorse.

**Esempio**: Un utente può modificare un documento se ne è il proprietario o se è stato esplicitamente condiviso con lui.

## Implementazione in Node.js

### Autenticazione

#### Hashing delle Password

L'hashing è fondamentale per memorizzare le password in modo sicuro:

```javascript
const bcrypt = require('bcrypt');

// Registrazione utente
async function registerUser(username, password) {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // Salva l'utente nel database con la password hashata
  return db.users.create({
    username,
    password: hashedPassword
  });
}

// Login
async function loginUser(username, password) {
  // Trova l'utente nel database
  const user = await db.users.findOne({ where: { username } });
  
  if (!user) {
    throw new Error('Utente non trovato');
  }
  
  // Verifica la password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Password non valida');
  }
  
  return user;
}
```

#### Middleware di Autenticazione

Un middleware per verificare l'autenticazione degli utenti:

```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Token mancante' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token non valido' });
    }
    
    req.user = user;
    next();
  });
}

// Utilizzo
app.get('/profile', authenticateToken, (req, res) => {
  res.json(req.user);
});
```

### Autorizzazione

#### Middleware di Autorizzazione Basato sui Ruoli

```javascript
function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non autenticato' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accesso negato' });
    }
    
    next();
  };
}

// Utilizzo
app.get('/admin', authorize('admin'), (req, res) => {
  res.send('Pannello amministratore');
});

app.get('/moderator', authorize(['admin', 'moderator']), (req, res) => {
  res.send('Pannello moderatore');
});
```

## Sfide e Considerazioni

### Sicurezza

- **Protezione contro attacchi di forza bruta**: Limitare i tentativi di login
- **Protezione contro attacchi di tipo CSRF**: Utilizzare token anti-CSRF
- **Protezione contro attacchi XSS**: Sanitizzare l'input e utilizzare header di sicurezza
- **Protezione contro attacchi di tipo injection**: Utilizzare query parametrizzate

### Scalabilità

- **Sessioni stateless**: Utilizzare JWT per evitare di memorizzare le sessioni sul server
- **Caching**: Memorizzare nella cache le informazioni di autorizzazione frequentemente utilizzate
- **Distribuzione**: Considerare l'impatto della distribuzione su più server

### Usabilità

- **Bilanciamento tra sicurezza e usabilità**: Troppi controlli possono frustrare gli utenti
- **Recupero dell'accesso**: Fornire meccanismi sicuri per il recupero dell'accesso
- **Feedback chiaro**: Comunicare chiaramente gli errori di autenticazione e autorizzazione

## Conclusione

L'autenticazione e l'autorizzazione sono componenti critici di qualsiasi applicazione web sicura. Una comprensione approfondita di questi concetti e delle loro implementazioni è essenziale per proteggere i dati degli utenti e garantire che solo le persone autorizzate possano accedere alle risorse appropriate.

Nelle prossime sezioni, esploreremo in dettaglio tecnologie specifiche come JWT, Passport.js e OAuth, che forniscono implementazioni robuste di questi concetti fondamentali.