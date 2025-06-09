# JSON Web Tokens (JWT)

## Introduzione ai JWT

I JSON Web Tokens (JWT) rappresentano uno standard aperto (RFC 7519) che definisce un modo compatto e autonomo per trasmettere informazioni in modo sicuro tra le parti come un oggetto JSON. Queste informazioni possono essere verificate e considerate affidabili perché sono firmate digitalmente.

I JWT sono diventati estremamente popolari nelle applicazioni web moderne, specialmente per:

- **Autenticazione**: Dopo il login, ogni richiesta successiva includerà il JWT, permettendo all'utente di accedere a rotte, servizi e risorse autorizzate con quel token.
- **Scambio di informazioni**: I JWT possono trasmettere in modo sicuro informazioni tra le parti, con la garanzia che i mittenti siano chi dicono di essere e che il contenuto non sia stato manomesso.

## Struttura di un JWT

Un JWT è composto da tre parti separate da punti (`.`):

```
xxxxx.yyyyy.zzzzz
```

Queste parti sono:

1. **Header**: Contiene il tipo di token e l'algoritmo di firma utilizzato.
2. **Payload**: Contiene le dichiarazioni (claims) - dati sull'entità (tipicamente l'utente) e metadati aggiuntivi.
3. **Signature**: Garantisce che il token non sia stato alterato durante il trasferimento.

### Header

L'header tipicamente consiste di due parti:
- Il tipo di token, che è JWT
- L'algoritmo di firma utilizzato, come HMAC SHA256 o RSA

Esempio:
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Questo JSON viene codificato in Base64Url per formare la prima parte del JWT.

### Payload

Il payload contiene le dichiarazioni (claims). Le dichiarazioni sono affermazioni sull'entità (tipicamente l'utente) e dati aggiuntivi. Ci sono tre tipi di claims:

1. **Registered claims**: Un insieme di claim predefiniti che non sono obbligatori ma raccomandati, come:
   - `iss` (issuer): chi ha emesso il token
   - `exp` (expiration time): quando il token scadrà
   - `sub` (subject): l'oggetto del token (tipicamente l'ID utente)
   - `aud` (audience): i destinatari del token
   - `iat` (issued at): quando il token è stato emesso

2. **Public claims**: Possono essere definiti a piacere, ma per evitare collisioni dovrebbero essere registrati nel registro IANA JSON Web Token o essere definiti come URI.

3. **Private claims**: Claim personalizzati creati per condividere informazioni tra le parti che hanno concordato di utilizzarli.

Esempio:
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true,
  "iat": 1516239022,
  "exp": 1516242622
}
```

Questo JSON viene codificato in Base64Url per formare la seconda parte del JWT.

### Signature

La firma è creata prendendo l'header codificato, il payload codificato, un segreto, e l'algoritmo specificato nell'header, e firmando tutto.

Esempio con HMAC SHA256:
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

La firma viene utilizzata per verificare che il messaggio non sia stato alterato durante il trasferimento e, nel caso di token firmati con una chiave privata, può anche verificare che il mittente del JWT sia chi dice di essere.

## Implementazione in Node.js

### Installazione

Per utilizzare JWT in Node.js, possiamo utilizzare la libreria `jsonwebtoken`:

```bash
npm install jsonwebtoken
```

### Generazione di un Token

```javascript
const jwt = require('jsonwebtoken');

// Funzione per generare un token JWT
function generateToken(user) {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // Scade tra 1 ora
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET);
}

// Esempio di utilizzo durante il login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trova l'utente nel database
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }
    
    // Verifica la password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }
    
    // Genera il token JWT
    const token = generateToken(user);
    
    // Invia il token al client
    res.json({ token });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ message: 'Errore del server' });
  }
});
```

### Verifica di un Token

```javascript
const jwt = require('jsonwebtoken');

// Middleware per verificare il token JWT
function authenticateToken(req, res, next) {
  // Ottieni il token dall'header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Token mancante' });
  }
  
  // Verifica il token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token non valido o scaduto
      return res.status(403).json({ message: 'Token non valido' });
    }
    
    // Aggiungi l'utente decodificato alla richiesta
    req.user = decoded;
    next();
  });
}

// Utilizzo del middleware per proteggere una rotta
app.get('/profile', authenticateToken, (req, res) => {
  // req.user contiene le informazioni dell'utente dal token
  res.json({
    id: req.user.sub,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});
```

## Gestione Avanzata dei JWT

### Refresh Token

I token JWT hanno tipicamente una durata breve per motivi di sicurezza. Per evitare che l'utente debba effettuare nuovamente il login quando il token scade, si può implementare un sistema di refresh token:

```javascript
// Genera sia un access token che un refresh token
function generateTokens(user) {
  const accessToken = jwt.sign(
    {
      sub: user.id,
      name: user.name,
      role: user.role
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' } // Breve durata
  );
  
  const refreshToken = jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Lunga durata
  );
  
  return { accessToken, refreshToken };
}

// Endpoint per il login
app.post('/login', async (req, res) => {
  // ... verifica credenziali ...
  
  // Genera i token
  const { accessToken, refreshToken } = generateTokens(user);
  
  // Salva il refresh token nel database
  await saveRefreshToken(user.id, refreshToken);
  
  // Invia i token al client
  res.json({ accessToken, refreshToken });
});

// Endpoint per rinnovare l'access token
app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token mancante' });
  }
  
  try {
    // Verifica il refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Verifica che il refresh token sia ancora valido nel database
    const isValid = await validateRefreshToken(decoded.sub, refreshToken);
    
    if (!isValid) {
      return res.status(403).json({ message: 'Refresh token non valido' });
    }
    
    // Ottieni l'utente dal database
    const user = await User.findByPk(decoded.sub);
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Genera un nuovo access token
    const accessToken = jwt.sign(
      {
        sub: user.id,
        name: user.name,
        role: user.role
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    
    // Invia il nuovo access token
    res.json({ accessToken });
  } catch (error) {
    console.error('Errore durante il refresh del token:', error);
    res.status(403).json({ message: 'Refresh token non valido' });
  }
});

// Endpoint per il logout
app.post('/logout', authenticateToken, async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    // Invalida il refresh token nel database
    await invalidateRefreshToken(req.user.sub, refreshToken);
  }
  
  res.json({ message: 'Logout effettuato con successo' });
});
```

### Gestione dei Token nei Client

I token JWT possono essere memorizzati in diversi modi nei client:

1. **localStorage/sessionStorage**: Facile da implementare ma vulnerabile agli attacchi XSS.
2. **Cookie HTTP-only**: Più sicuro contro gli attacchi XSS, ma richiede considerazioni per CSRF.
3. **Memoria dell'applicazione**: Sicuro ma perso al refresh della pagina.

Esempio di utilizzo di cookie HTTP-only:

```javascript
// Server: imposta il token in un cookie HTTP-only
app.post('/login', async (req, res) => {
  // ... verifica credenziali e genera token ...
  
  // Imposta il token in un cookie HTTP-only
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS in produzione
    sameSite: 'strict', // Protezione CSRF
    maxAge: 3600000 // 1 ora in millisecondi
  });
  
  res.json({ message: 'Login effettuato con successo' });
});

// Middleware per verificare il token dal cookie
function authenticateCookie(req, res, next) {
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).json({ message: 'Non autenticato' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token non valido' });
    }
    
    req.user = decoded;
    next();
  });
}
```

## Best Practices per l'Utilizzo dei JWT

### Sicurezza

1. **Utilizzare HTTPS**: I JWT devono essere trasmessi solo su connessioni sicure.
2. **Impostare una scadenza breve**: Limitare la durata dei token per ridurre il rischio in caso di furto.
3. **Non memorizzare dati sensibili**: I JWT non sono crittografati, quindi non includere informazioni sensibili nel payload.
4. **Utilizzare algoritmi di firma sicuri**: Preferire algoritmi come RS256 (RSA) rispetto a HS256 (HMAC) per applicazioni di grandi dimensioni.
5. **Ruotare le chiavi segrete**: Cambiare periodicamente le chiavi utilizzate per firmare i token.

### Gestione

1. **Implementare la revoca dei token**: Mantenere una blacklist di token revocati o utilizzare refresh token che possono essere invalidati.
2. **Gestire correttamente gli errori**: Fornire messaggi di errore utili ma non troppo dettagliati che potrebbero aiutare gli attaccanti.
3. **Monitorare l'utilizzo**: Tenere traccia dell'utilizzo dei token per rilevare attività sospette.

## Vantaggi e Svantaggi dei JWT

### Vantaggi

1. **Stateless**: I server non devono memorizzare le sessioni, facilitando la scalabilità.
2. **Portabilità**: Possono essere utilizzati su diverse piattaforme e domini.
3. **Sicurezza**: Quando implementati correttamente, offrono un meccanismo di autenticazione sicuro.
4. **Estensibilità**: Possono contenere qualsiasi tipo di dato nel payload.
5. **Performance**: Riducono la necessità di query al database per le informazioni dell'utente.

### Svantaggi

1. **Dimensione**: I JWT possono diventare grandi, aumentando la dimensione di ogni richiesta.
2. **Revoca difficile**: Una volta emessi, i JWT sono validi fino alla scadenza a meno che non si implementi un sistema di blacklist.
3. **Sicurezza del client**: La memorizzazione sicura dei token lato client può essere complessa.
4. **Complessità**: L'implementazione corretta di un sistema JWT completo richiede attenzione ai dettagli di sicurezza.

## Conclusione

I JSON Web Tokens rappresentano una soluzione potente e flessibile per l'autenticazione e lo scambio sicuro di informazioni nelle applicazioni web moderne. Quando implementati correttamente, offrono un buon equilibrio tra sicurezza, scalabilità e usabilità.

Tuttavia, come con qualsiasi tecnologia di sicurezza, è fondamentale comprendere le implicazioni e seguire le best practices per garantire che l'implementazione sia robusta e sicura. La combinazione di JWT con altre tecniche di sicurezza, come l'autenticazione a più fattori, può creare sistemi di autenticazione estremamente sicuri per le applicazioni web.