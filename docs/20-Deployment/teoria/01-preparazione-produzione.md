# Preparazione per la Produzione

## Introduzione

La preparazione di un'applicazione Node.js per l'ambiente di produzione è un passo cruciale nel ciclo di vita dello sviluppo software. Un'applicazione ben preparata per la produzione garantisce maggiore affidabilità, sicurezza e prestazioni quando viene utilizzata dagli utenti finali.

## Differenze tra Ambiente di Sviluppo e Produzione

| Aspetto | Ambiente di Sviluppo | Ambiente di Produzione |
|---------|----------------------|-------------------------|
| Ottimizzazione | Focalizzata sulla velocità di sviluppo | Focalizzata sulle prestazioni e l'affidabilità |
| Debugging | Dettagliato e verboso | Minimo e controllato |
| Sicurezza | Spesso meno restrittiva | Massima priorità |
| Configurazione | Hardcoded o file locali | Variabili d'ambiente o servizi di configurazione |
| Caching | Spesso disabilitato | Abilitato e ottimizzato |
| Logging | Dettagliato per debugging | Strutturato e selettivo |

## Configurazione dell'Ambiente

### Utilizzo delle Variabili d'Ambiente

Le variabili d'ambiente sono il metodo preferito per configurare un'applicazione in produzione, poiché separano il codice dalla configurazione e permettono di modificare i parametri senza cambiare il codice.

```javascript
// config.js
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/myapp',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  logLevel: process.env.LOG_LEVEL || 'info'
};
```

### Gestione dei Segreti

I segreti (come chiavi API, password, token) non dovrebbero mai essere hardcoded o inclusi nel controllo versione. Utilizzare invece:

1. Variabili d'ambiente
2. Servizi di gestione dei segreti (AWS Secrets Manager, HashiCorp Vault)
3. File di configurazione esclusi dal controllo versione (.env con dotenv)

```javascript
// Utilizzo di dotenv per caricare variabili da .env in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
```

## Ottimizzazione delle Prestazioni

### Compressione

La compressione riduce la dimensione delle risposte HTTP, migliorando i tempi di caricamento.

```javascript
const express = require('express');
const compression = require('compression');
const app = express();

// Abilita la compressione gzip
app.use(compression());
```

### Caching

Implementare strategie di caching per ridurre il carico sul server e migliorare i tempi di risposta.

```javascript
const mcache = require('memory-cache');

// Middleware per il caching
const cache = (duration) => {
  return (req, res, next) => {
    const key = '__express__' + req.originalUrl || req.url;
    const cachedBody = mcache.get(key);
    
    if (cachedBody) {
      res.send(cachedBody);
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
      next();
    }
  };
};

// Utilizzo: cache per 10 minuti
app.get('/api/data', cache(600), (req, res) => {
  // Logica per recuperare i dati
});
```

### Ottimizzazione del Codice

1. **Utilizzare async/await** per codice asincrono più leggibile e manutenibile
2. **Evitare operazioni di blocco** nel thread principale
3. **Implementare il pooling delle connessioni** per database e servizi esterni

```javascript
// Pooling delle connessioni per MySQL
const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Funzione per eseguire query
function query(sql, args) {
  return new Promise((resolve, reject) => {
    pool.query(sql, args, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}
```

## Gestione degli Errori

Una robusta gestione degli errori è fondamentale per applicazioni in produzione.

### Middleware per la Gestione degli Errori in Express

```javascript
// Middleware per catturare errori 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Risorsa non trovata' });
});

// Middleware per la gestione degli errori
app.use((err, req, res, next) => {
  // Log dell'errore (ma non in test)
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack);
  }
  
  // Determina lo status code appropriato
  const statusCode = err.statusCode || 500;
  
  // Invia risposta con dettagli in development, messaggio generico in production
  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'production' ? 'Si è verificato un errore' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});
```

### Gestione delle Promise non Catturate

```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In produzione, potresti voler terminare il processo
  // process.exit(1);
});
```

### Gestione delle Eccezioni non Catturate

```javascript
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Log dell'errore su un servizio esterno
  // logErrorToService(err);
  
  // In produzione, è generalmente consigliato terminare il processo
  // dopo un'eccezione non catturata
  process.exit(1);
});
```

## Logging

Un sistema di logging efficace è essenziale per monitorare e diagnosticare problemi in produzione.

### Utilizzo di Winston per Logging Strutturato

```javascript
const winston = require('winston');

// Configurazione logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    // Log con livello error e superiore su console
    new winston.transports.Console({ level: 'error' }),
    // Log con tutti i livelli su file
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// In ambiente non di produzione, log anche su console con formato più leggibile
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Utilizzo
logger.info('Server avviato', { port: 3000 });
logger.error('Errore di connessione al database', { error: err.message });
```

## Sicurezza

La sicurezza è una priorità assoluta per le applicazioni in produzione.

### Implementazione di Helmet

Helmet aiuta a proteggere l'applicazione Express impostando vari header HTTP relativi alla sicurezza.

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Protezione contro Attacchi CSRF

```javascript
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Middleware per fornire il token CSRF ai template
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});
```

### Rate Limiting

Il rate limiting protegge da attacchi di forza bruta e DoS.

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // limite di 100 richieste per IP
  standardHeaders: true,
  legacyHeaders: false
});

// Applica a tutte le richieste API
app.use('/api/', apiLimiter);

// Limiter più restrittivo per tentativi di login
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 5, // 5 tentativi per IP
  message: 'Troppi tentativi di login, riprova più tardi'
});

app.use('/api/login', loginLimiter);
```

## Process Manager

Un process manager è essenziale per gestire l'applicazione Node.js in produzione.

### PM2

PM2 è uno dei process manager più popolari per Node.js, offre funzionalità come:
- Riavvio automatico in caso di crash
- Load balancing (modalità cluster)
- Monitoraggio delle prestazioni
- Gestione dei log

**Installazione:**
```bash
npm install pm2 -g
```

**Configurazione (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: "my-app",
    script: "./server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    },
    watch: false,
    max_memory_restart: "1G",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true,
    error_file: "logs/err.log",
    out_file: "logs/out.log"
  }]
};
```

**Avvio dell'applicazione:**
```bash
pm2 start ecosystem.config.js --env production
```

## Conclusione

La preparazione di un'applicazione Node.js per la produzione richiede attenzione a numerosi aspetti, dalla configurazione alla sicurezza, dalle prestazioni alla gestione degli errori. Seguendo le best practices descritte in questo documento, potrai creare applicazioni più robuste, sicure e performanti, pronte per essere utilizzate in ambienti di produzione reali.

Ricorda che la preparazione per la produzione non è un'attività una tantum, ma un processo continuo che richiede monitoraggio, manutenzione e miglioramento costante.