# JSON Web Tokens (JWT)

## Introduzione ai JWT

JSON Web Token (JWT) è uno standard aperto (RFC 7519) che definisce un modo compatto e autonomo per trasmettere informazioni in modo sicuro tra le parti come un oggetto JSON. Queste informazioni possono essere verificate e considerate affidabili perché sono firmate digitalmente.

I JWT sono particolarmente utili per l'autenticazione e lo scambio di informazioni in applicazioni web e API RESTful, dove la statelessness (assenza di stato) è un requisito importante.

## Struttura di un JWT

Un JWT è composto da tre parti separate da punti (`.`):

```
xxxxx.yyyyy.zzzzz
```

Dove:
- **Header**: contiene il tipo di token e l'algoritmo di firma
- **Payload**: contiene le dichiarazioni (claims) del token
- **Signature**: la firma che verifica l'autenticità del token

### Header

L'header tipicamente consiste di due parti: il tipo di token (JWT) e l'algoritmo di firma utilizzato (come HMAC SHA256 o RSA).

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Questo JSON viene codificato in Base64Url per formare la prima parte del JWT.

### Payload

Il payload contiene le dichiarazioni (claims), che sono affermazioni sull'entità (tipicamente l'utente) e dati aggiuntivi. Ci sono tre tipi di claims:

1. **Registered claims**: un insieme di claim predefiniti che non sono obbligatori ma raccomandati, come:
   - `iss` (issuer): chi ha emesso il token
   - `exp` (expiration time): quando scade il token
   - `sub` (subject): l'oggetto del token
   - `aud` (audience): i destinatari del token

2. **Public claims**: possono essere definiti a piacere ma per evitare collisioni dovrebbero essere registrati nel registro IANA JSON Web Token o essere definiti come URI.

3. **Private claims**: claim personalizzati creati per condividere informazioni tra le parti.

Esempio di payload:

```json
{
  "sub": "1234567890",
  "name": "Mario Rossi",
  "admin": true,
  "iat": 1516239022,
  "exp": 1516242622
}
```

Questo JSON viene codificato in Base64Url per formare la seconda parte del JWT.

### Signature

La firma è creata prendendo l'header codificato, il payload codificato, una chiave segreta e l'algoritmo specificato nell'header, e firmando il tutto.

Per esempio, se si utilizza l'algoritmo HMAC SHA256, la firma sarà creata in questo modo:

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

La firma viene utilizzata per verificare che il messaggio non sia stato alterato durante il trasporto e, nel caso di token firmati con una chiave privata, può anche verificare l'identità del mittente del JWT.

## Implementazione di JWT in Node.js

### Installazione della Libreria

```bash
npm install jsonwebtoken
```

### Creazione di un Token

```javascript
const jwt = require('jsonwebtoken');

// Chiave segreta per firmare il token
const JWT_SECRET = 'la_mia_chiave_segreta_molto_lunga_e_complessa';

// Funzione per generare un token
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  // Opzioni del token
  const options = {
    expiresIn: '1h' // Il token scadrà dopo 1 ora
  };
  
  // Genera il token
  return jwt.sign(payload, JWT_SECRET, options);
}

// Esempio di utilizzo
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Verifica le credenziali (esempio semplificato)
  const user = await User.findOne({ username });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ message: 'Credenziali non valide' });
  }
  
  // Genera il token
  const token = generateToken(user);
  
  // Invia il token al client
  res.json({ token });
});
```

### Verifica di un Token

```javascript
const jwt = require('jsonwebtoken');

// Middleware per verificare il token
function authenticateToken(req, res, next) {
  // Ottieni il token dall'header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ message: 'Token mancante' });
  }
  
  // Verifica il token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token non valido o scaduto
      return res.status(403).json({ message: 'Token non valido' });
    }
    
    // Salva le informazioni dell'utente nell'oggetto request
    req.user = decoded;
    next();
  });
}

// Utilizzo del middleware per proteggere una rotta
app.get('/profile', authenticateToken, (req, res) => {
  // req.user contiene le informazioni dell'utente dal token
  res.json({ user: req.user });
});
```

## Gestione del Refresh Token

I token JWT hanno generalmente una durata limitata per motivi di sicurezza. Per evitare che l'utente debba effettuare nuovamente il login quando il token scade, si può implementare un sistema di refresh token.

```javascript
const jwt = require('jsonwebtoken');

// Chiavi segrete
const ACCESS_TOKEN_SECRET = 'chiave_segreta_per_access_token';
const REFRESH_TOKEN_SECRET = 'chiave_segreta_per_refresh_token';

// Array per memorizzare i refresh token validi (in produzione usare un database)
let refreshTokens = [];

// Genera access token
function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

// Genera refresh token
function generateRefreshToken(user) {
  const refreshToken = jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  refreshTokens.push(refreshToken);
  return refreshToken;
}

// Rotta di login
app.post('/login', (req, res) => {
  // Autenticazione (semplificata)
  const username = req.body.username;
  const user = { username: username };
  
  // Genera token
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  res.json({ accessToken, refreshToken });
});

// Rotta per ottenere un nuovo access token usando il refresh token
app.post('/token', (req, res) => {
  const refreshToken = req.body.token;
  
  // Verifica se il refresh token è stato fornito
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token mancante' });
  }
  
  // Verifica se il refresh token è nella lista dei token validi
  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: 'Refresh token non valido' });
  }
  
  // Verifica e decodifica il refresh token
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token non valido' });
    }
    
    // Genera un nuovo access token
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

// Rotta per il logout
app.post('/logout', (req, res) => {
  const refreshToken = req.body.token;
  
  // Rimuovi il refresh token dalla lista
  refreshTokens = refreshTokens.filter(token => token !== refreshToken);
  
  res.status(204).send();
});
```

## Sicurezza dei JWT

### Best Practices

1. **Usa HTTPS**: I JWT sono firmati ma non criptati. Usa sempre HTTPS per proteggere i token durante la trasmissione.

2. **Imposta una scadenza breve**: Limita la durata dei token di accesso (15-60 minuti) per ridurre il rischio in caso di furto.

3. **Usa refresh token**: Implementa un sistema di refresh token per rinnovare i token di accesso senza richiedere nuovamente le credenziali.

4. **Memorizza i token in modo sicuro**: Nel client, memorizza i token in modo sicuro (HttpOnly cookies per applicazioni web, secure storage per app mobile).

5. **Verifica le firme**: Assicurati sempre di verificare la firma dei token prima di fidarti del loro contenuto.

6. **Non memorizzare dati sensibili**: Non includere informazioni sensibili nel payload del token, poiché può essere facilmente decodificato.

7. **Usa chiavi segrete forti**: Utilizza chiavi segrete lunghe e complesse per firmare i token.

8. **Implementa una blacklist**: Per token compromessi o logout, considera l'implementazione di una blacklist di token.

### Vulnerabilità Comuni

1. **Algoritmo "none"**: Alcuni implementazioni JWT accettano token con algoritmo "none". Assicurati che la tua libreria verifichi sempre l'algoritmo.

2. **Attacchi di confusione di chiavi**: Assicurati che la chiave utilizzata per la verifica sia appropriata per l'algoritmo specificato nel token.

3. **Mancata verifica della firma**: Verifica sempre la firma del token prima di fidarti del suo contenuto.

4. **Esposizione della chiave segreta**: Proteggi adeguatamente la chiave segreta utilizzata per firmare i token.

## Conclusione

I JSON Web Tokens offrono un meccanismo efficace per l'autenticazione stateless nelle applicazioni web moderne. La loro struttura compatta, la capacità di contenere informazioni verificabili e la facilità di utilizzo li rendono una scelta popolare per l'implementazione di sistemi di autenticazione in API RESTful.

Tuttavia, è importante implementare correttamente i JWT e seguire le best practices di sicurezza per evitare vulnerabilità comuni. Con una corretta implementazione, i JWT possono fornire un sistema di autenticazione robusto e scalabile per le tue applicazioni.

Nel prossimo capitolo, esploreremo le best practices di sicurezza per le API, inclusi argomenti come la protezione contro attacchi comuni, la gestione sicura delle password e l'implementazione di controlli di accesso granulari.

## Navigazione del Corso

- [Indice del Corso](../../README.md)
- [Modulo Corrente: Middleware e Autenticazione](../README.md)
- [Documento Precedente: Autenticazione e Autorizzazione](./02-autenticazione-autorizzazione.md)
- [Documento Successivo: Sicurezza delle API](./04-sicurezza-api.md)