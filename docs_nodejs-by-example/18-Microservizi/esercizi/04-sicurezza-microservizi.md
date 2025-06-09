# Implementazione della Sicurezza nei Microservizi

## Obiettivo
In questo esercizio, imparerai a implementare misure di sicurezza fondamentali per un'architettura a microservizi. Configurerai l'autenticazione e l'autorizzazione tra servizi, implementerai la comunicazione sicura e applicherai best practice di sicurezza per proteggere la tua infrastruttura a microservizi.

## Prerequisiti
- Node.js e npm installati
- Conoscenza di base di Express.js
- Conoscenza di base dei microservizi (completamento dell'esercizio 01)
- Comprensione dei concetti di base di sicurezza nelle applicazioni web

## Concetti Chiave

### Sicurezza nei Microservizi
La sicurezza in un'architettura a microservizi è più complessa rispetto alle applicazioni monolitiche a causa della natura distribuita del sistema. È necessario proteggere non solo l'accesso esterno ma anche la comunicazione tra i servizi interni.

### Principali Aspetti di Sicurezza
- **Autenticazione e Autorizzazione**: Verifica dell'identità e dei permessi degli utenti e dei servizi
- **Comunicazione Sicura**: Protezione dei dati in transito tra i servizi
- **Gestione dei Segreti**: Archiviazione sicura di credenziali e chiavi
- **Principio del Privilegio Minimo**: Limitazione dell'accesso alle sole risorse necessarie
- **Monitoraggio e Logging di Sicurezza**: Rilevamento di attività sospette

## Passaggi

### 1. Configurazione del Progetto

1. Crea una directory principale per il progetto:
   ```bash
   mkdir microservizi-sicurezza
   cd microservizi-sicurezza
   ```

2. Crea le sottodirectory per i microservizi:
   ```bash
   mkdir api-gateway servizio-autenticazione servizio-risorse
   ```

### 2. Implementazione del Servizio di Autenticazione

1. Inizializza il progetto per il servizio di autenticazione:
   ```bash
   cd servizio-autenticazione
   npm init -y
   npm install express jsonwebtoken bcrypt dotenv cors
   ```

2. Crea un file `.env` per le variabili d'ambiente:
   ```
   JWT_SECRET=il_tuo_segreto_molto_complesso
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   PORT=3001
   ```

3. Crea il file `index.js` per il servizio di autenticazione:
   ```javascript
   // servizio-autenticazione/index.js
   require('dotenv').config();
   const express = require('express');
   const jwt = require('jsonwebtoken');
   const bcrypt = require('bcrypt');
   const cors = require('cors');

   const app = express();
   const PORT = process.env.PORT || 3001;

   app.use(cors());
   app.use(express.json());

   // Database simulato degli utenti
   const users = [
     {
       id: 1,
       username: 'admin',
       // Password: 'admin123' (hash generato con bcrypt)
       password: '$2b$10$Ht0vFpwGJFVU6U5WQUinnOGJiYoHRUE3KA4tQdw5/TuQCXUQc.6Ky',
       roles: ['admin', 'user']
     },
     {
       id: 2,
       username: 'user',
       // Password: 'user123' (hash generato con bcrypt)
       password: '$2b$10$3QQfJR.rPgx3qqJiWXHQZeJqKhLSbXbpYjkXZ5qEcVUUn9USIIU9K',
       roles: ['user']
     }
   ];

   // Database simulato dei token di refresh
   let refreshTokens = [];

   // Endpoint per il login
   app.post('/login', async (req, res) => {
     const { username, password } = req.body;
     
     // Trova l'utente nel database
     const user = users.find(u => u.username === username);
     if (!user) return res.status(401).json({ message: 'Credenziali non valide' });
     
     // Verifica la password
     const validPassword = await bcrypt.compare(password, user.password);
     if (!validPassword) return res.status(401).json({ message: 'Credenziali non valide' });
     
     // Crea i token
     const accessToken = generateAccessToken(user);
     const refreshToken = jwt.sign(user, process.env.JWT_SECRET);
     refreshTokens.push(refreshToken);
     
     res.json({ accessToken, refreshToken });
   });

   // Endpoint per rinnovare il token di accesso
   app.post('/token', (req, res) => {
     const { refreshToken } = req.body;
     if (!refreshToken) return res.status(401).json({ message: 'Token di refresh richiesto' });
     if (!refreshTokens.includes(refreshToken)) return res.status(403).json({ message: 'Token di refresh non valido' });
     
     jwt.verify(refreshToken, process.env.JWT_SECRET, (err, user) => {
       if (err) return res.status(403).json({ message: 'Verifica del token fallita' });
       const accessToken = generateAccessToken({ id: user.id, username: user.username, roles: user.roles });
       res.json({ accessToken });
     });
   });

   // Endpoint per il logout
   app.post('/logout', (req, res) => {
     const { refreshToken } = req.body;
     refreshTokens = refreshTokens.filter(token => token !== refreshToken);
     res.status(204).end();
   });

   // Funzione per generare il token di accesso
   function generateAccessToken(user) {
     return jwt.sign(
       { id: user.id, username: user.username, roles: user.roles },
       process.env.JWT_SECRET,
       { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
     );
   }

   app.listen(PORT, () => {
     console.log(`Servizio di autenticazione in ascolto sulla porta ${PORT}`);
   });
   ```

### 3. Implementazione del Servizio Risorse Protette

1. Inizializza il progetto per il servizio risorse:
   ```bash
   cd ../servizio-risorse
   npm init -y
   npm install express jsonwebtoken dotenv cors
   ```

2. Crea un file `.env` per le variabili d'ambiente:
   ```
   JWT_SECRET=il_tuo_segreto_molto_complesso
   PORT=3002
   ```

3. Crea il file `index.js` per il servizio risorse:
   ```javascript
   // servizio-risorse/index.js
   require('dotenv').config();
   const express = require('express');
   const jwt = require('jsonwebtoken');
   const cors = require('cors');

   const app = express();
   const PORT = process.env.PORT || 3002;

   app.use(cors());
   app.use(express.json());

   // Middleware per verificare il token JWT
   function authenticateToken(req, res, next) {
     const authHeader = req.headers['authorization'];
     const token = authHeader && authHeader.split(' ')[1];
     
     if (!token) return res.status(401).json({ message: 'Token di accesso richiesto' });
     
     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
       if (err) return res.status(403).json({ message: 'Token non valido o scaduto' });
       req.user = user;
       next();
     });
   }

   // Middleware per verificare i ruoli
   function authorizeRoles(...roles) {
     return (req, res, next) => {
       if (!req.user || !req.user.roles) {
         return res.status(403).json({ message: 'Accesso negato: informazioni sui ruoli mancanti' });
       }
       
       const hasRole = roles.some(role => req.user.roles.includes(role));
       if (!hasRole) {
         return res.status(403).json({ message: 'Accesso negato: ruolo richiesto non presente' });
       }
       
       next();
     };
   }

   // Risorse pubbliche
   app.get('/public', (req, res) => {
     res.json({ message: 'Questa è una risorsa pubblica accessibile a tutti' });
   });

   // Risorse protette per utenti autenticati
   app.get('/protected', authenticateToken, (req, res) => {
     res.json({ message: 'Questa è una risorsa protetta', user: req.user });
   });

   // Risorse protette solo per amministratori
   app.get('/admin', authenticateToken, authorizeRoles('admin'), (req, res) => {
     res.json({ message: 'Questa è una risorsa per amministratori', user: req.user });
   });

   app.listen(PORT, () => {
     console.log(`Servizio risorse in ascolto sulla porta ${PORT}`);
   });
   ```

### 4. Implementazione dell'API Gateway con Comunicazione Sicura

1. Inizializza il progetto per l'API Gateway:
   ```bash
   cd ../api-gateway
   npm init -y
   npm install express http-proxy-middleware helmet cors dotenv
   ```

2. Crea un file `.env` per le variabili d'ambiente:
   ```
   PORT=3000
   AUTH_SERVICE_URL=http://localhost:3001
   RESOURCE_SERVICE_URL=http://localhost:3002
   ```

3. Crea il file `index.js` per l'API Gateway:
   ```javascript
   // api-gateway/index.js
   require('dotenv').config();
   const express = require('express');
   const { createProxyMiddleware } = require('http-proxy-middleware');
   const helmet = require('helmet');
   const cors = require('cors');

   const app = express();
   const PORT = process.env.PORT || 3000;

   // Middleware di sicurezza
   app.use(helmet()); // Aggiunge vari header di sicurezza
   app.use(cors());
   app.use(express.json());

   // Logging delle richieste per scopi di sicurezza
   app.use((req, res, next) => {
     console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
     next();
   });

   // Proxy per il servizio di autenticazione
   app.use('/auth', createProxyMiddleware({
     target: process.env.AUTH_SERVICE_URL,
     changeOrigin: true,
     pathRewrite: {
       '^/auth': ''
     }
   }));

   // Proxy per il servizio risorse
   app.use('/resources', createProxyMiddleware({
     target: process.env.RESOURCE_SERVICE_URL,
     changeOrigin: true,
     pathRewrite: {
       '^/resources': ''
     },
     // Opzionalmente, puoi aggiungere logica per verificare il token prima di inoltrare
     onProxyReq: (proxyReq, req, res) => {
       // Passa gli header di autorizzazione al servizio di destinazione
       if (req.headers.authorization) {
         proxyReq.setHeader('Authorization', req.headers.authorization);
       }
     }
   }));

   // Gestione degli errori
   app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({ message: 'Si è verificato un errore interno' });
   });

   app.listen(PORT, () => {
     console.log(`API Gateway in ascolto sulla porta ${PORT}`);
   });
   ```

### 5. Test della Sicurezza

1. Avvia tutti i servizi in terminali separati:
   ```bash
   # Terminale 1 - Servizio di Autenticazione
   cd servizio-autenticazione
   node index.js

   # Terminale 2 - Servizio Risorse
   cd servizio-risorse
   node index.js

   # Terminale 3 - API Gateway
   cd api-gateway
   node index.js
   ```

2. Testa il flusso di autenticazione e accesso alle risorse protette:

   a. Ottieni un token di accesso:
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

   b. Accedi a una risorsa pubblica:
   ```bash
   curl http://localhost:3000/resources/public
   ```

   c. Accedi a una risorsa protetta con il token:
   ```bash
   curl http://localhost:3000/resources/protected \
     -H "Authorization: Bearer IL_TUO_TOKEN_DI_ACCESSO"
   ```

   d. Accedi a una risorsa per amministratori:
   ```bash
   curl http://localhost:3000/resources/admin \
     -H "Authorization: Bearer IL_TUO_TOKEN_DI_ACCESSO"
   ```

## Sfide Aggiuntive

1. **Implementa HTTPS**: Configura i certificati SSL per abilitare HTTPS su tutti i servizi.

2. **Aggiungi Rate Limiting**: Implementa il rate limiting nell'API Gateway per prevenire attacchi di forza bruta.

3. **Implementa la Gestione Sicura dei Segreti**: Utilizza un servizio come HashiCorp Vault o AWS Secrets Manager per gestire in modo sicuro le chiavi e i segreti.

4. **Aggiungi Validazione degli Input**: Implementa la validazione degli input per prevenire attacchi di injection.

5. **Implementa l'Autenticazione a Due Fattori**: Aggiungi l'autenticazione a due fattori (2FA) al servizio di autenticazione.

## Conclusione

In questo esercizio, hai implementato misure di sicurezza fondamentali per un'architettura a microservizi, tra cui:

- Autenticazione basata su JWT con token di accesso e refresh
- Autorizzazione basata sui ruoli
- Comunicazione sicura tra servizi attraverso un API Gateway
- Best practice di sicurezza come l'uso di Helmet per gli header HTTP

Queste misure forniscono un livello base di sicurezza per la tua architettura a microservizi. In un ambiente di produzione, dovresti considerare ulteriori misure come HTTPS, gestione sicura dei segreti, monitoraggio della sicurezza e conformità alle normative sulla protezione dei dati.