# Logging con Winston e Morgan in Node.js

## Introduzione

Un sistema di logging efficace è fondamentale per monitorare, diagnosticare e risolvere problemi nelle applicazioni Node.js. In questa guida, esploreremo come implementare un sistema di logging avanzato utilizzando Winston per il logging generale dell'applicazione e Morgan per il logging delle richieste HTTP.

## Fondamenti del Logging

### Perché il Logging è Importante

1. **Diagnostica**: Aiuta a identificare e risolvere problemi.
2. **Monitoraggio**: Permette di osservare il comportamento dell'applicazione nel tempo.
3. **Sicurezza**: Registra tentativi di accesso e attività sospette.
4. **Analisi**: Fornisce dati per analizzare l'utilizzo e le prestazioni dell'applicazione.
5. **Conformità**: Può essere necessario per requisiti legali o normativi.

### Livelli di Logging

I sistemi di logging utilizzano diversi livelli per indicare la gravità dei messaggi:

- **Error**: Errori che impediscono il funzionamento dell'applicazione.
- **Warn**: Situazioni anomale che non impediscono il funzionamento ma richiedono attenzione.
- **Info**: Informazioni generali sul funzionamento dell'applicazione.
- **Debug**: Informazioni dettagliate utili per il debugging.
- **Verbose/Trace**: Informazioni estremamente dettagliate sul flusso di esecuzione.

## Winston: Un Logger Versatile per Node.js

[Winston](https://github.com/winstonjs/winston) è una libreria di logging flessibile e multi-trasporto per Node.js.

### Installazione di Winston

```bash
npm install winston
```

### Configurazione Base di Winston

```javascript
const winston = require('winston');

// Crea un logger con la configurazione di base
const logger = winston.createLogger({
  level: 'info', // Livello minimo di logging
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    // Scrivi tutti i log con livello 'error' e inferiore nel file 'error.log'
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Scrivi tutti i log con livello 'info' e inferiore nel file 'combined.log'
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Se non siamo in produzione, aggiungi anche il trasporto console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

### Utilizzo di Winston

```javascript
const logger = require('./logger');

// Esempi di utilizzo
logger.error('Errore critico!', { error: new Error('Dettagli errore') });
logger.warn('Attenzione: spazio su disco quasi esaurito');
logger.info('Utente ha effettuato l\'accesso', { userId: 123 });
logger.debug('Dati ricevuti dalla richiesta', { requestData: req.body });

try {
  // Codice che potrebbe generare un errore
  throw new Error('Qualcosa è andato storto');
} catch (error) {
  logger.error('Errore durante l\'elaborazione:', { error });
}
```

## Formattazione Avanzata con Winston

### Formati Personalizzati

```javascript
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, colorize } = format;

// Formato personalizzato
const myFormat = printf(({ level, message, label, timestamp, ...metadata }) => {
  let metaStr = JSON.stringify(metadata);
  if (metaStr === '{}') {
    metaStr = '';
  } else {
    metaStr = ' ' + metaStr;
  }
  return `${timestamp} [${label}] ${level}: ${message}${metaStr}`;
});

const logger = createLogger({
  format: combine(
    label({ label: 'APP' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    myFormat
  ),
  transports: [new transports.Console()]
});

logger.info('Hello World');
// Output: 2023-01-01 12:34:56 [APP] info: Hello World
```

### Rotazione dei File di Log

Per gestire file di log di grandi dimensioni, è possibile utilizzare `winston-daily-rotate-file`:

```bash
npm install winston-daily-rotate-file
```

```javascript
const winston = require('winston');
require('winston-daily-rotate-file');

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    fileRotateTransport,
    new winston.transports.Console()
  ]
});
```

## Morgan: Logging delle Richieste HTTP

[Morgan](https://github.com/expressjs/morgan) è un middleware di logging HTTP per Express.js.

### Installazione di Morgan

```bash
npm install morgan
```

### Configurazione Base di Morgan

```javascript
const express = require('express');
const morgan = require('morgan');

const app = express();

// Usa il formato predefinito 'combined' per il logging
app.use(morgan('combined'));

// Altre configurazioni dell'app...

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

### Formati Predefiniti di Morgan

Morgan offre diversi formati predefiniti:

- **combined**: Standard Apache combined log output.
- **common**: Standard Apache common log output.
- **dev**: Output colorato e conciso per lo sviluppo.
- **short**: Output più breve del combined.
- **tiny**: Output minimo.

```javascript
// Formato 'dev' per lo sviluppo
app.use(morgan('dev'));

// Esempio di output:
// GET /api/users 200 57.505 ms - 2048
```

### Formato Personalizzato con Morgan

```javascript
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
```

### Logging su File con Morgan

```javascript
const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const app = express();

// Crea una directory per i log se non esiste
const logDirectory = path.join(__dirname, 'logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Crea un stream di scrittura per i log
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, 'access.log'),
  { flags: 'a' }
);

// Configura Morgan per scrivere su file
app.use(morgan('combined', { stream: accessLogStream }));

// Altre configurazioni dell'app...

app.listen(3000);
```

## Integrazione di Winston e Morgan

È possibile integrare Morgan con Winston per avere un sistema di logging unificato:

```javascript
const express = require('express');
const morgan = require('morgan');
const winston = require('winston');

// Configura Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();

// Crea uno stream per Morgan che scrive su Winston
const morganStream = {
  write: (message) => {
    // Rimuovi il carattere di nuova riga alla fine
    logger.info(message.trim());
  }
};

// Usa Morgan con lo stream personalizzato
app.use(morgan('combined', { stream: morganStream }));

// Altre configurazioni dell'app...

app.listen(3000, () => {
  logger.info('Server in ascolto sulla porta 3000');
});
```

## Logging Avanzato in un'Applicazione Express

### Configurazione Completa

```javascript
// logger.js
const winston = require('winston');
require('winston-daily-rotate-file');
const { format, transports, createLogger } = winston;
const { combine, timestamp, label, printf, colorize, json } = format;

// Definisci i livelli di log personalizzati
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determina il livello in base all'ambiente
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'warn';
};

// Colori per i diversi livelli
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Aggiungi i colori a winston
winston.addColors(colors);

// Formato per la console
const consoleFormat = combine(
  colorize({ all: true }),
  label({ label: 'API' }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf((info) => `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`)
);

// Formato per i file
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  json()
);

// Trasporti per i log
const logTransports = [
  // Errori su file con rotazione
  new transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  // Tutti i log su file con rotazione
  new transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  // Log sulla console in sviluppo
  new transports.Console({
    format: consoleFormat,
  }),
];

// Crea il logger
const logger = createLogger({
  level: level(),
  levels,
  format: combine(
    timestamp(),
    json()
  ),
  transports: logTransports,
  exitOnError: false,
});

// Middleware per Morgan
const morganMiddleware = (morgan) => {
  return morgan(
    // Formato
    ':method :url :status :res[content-length] - :response-time ms',
    // Opzioni
    {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    }
  );
};

module.exports = { logger, morganMiddleware };
```

### Utilizzo nella Applicazione

```javascript
// app.js
const express = require('express');
const morgan = require('morgan');
const { logger, morganMiddleware } = require('./logger');
const errorHandler = require('./errorHandler');

const app = express();

// Middleware di logging HTTP
app.use(morganMiddleware(morgan));

// Middleware per il parsing del body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route
app.get('/', (req, res) => {
  logger.info('Richiesta alla home page');
  res.send('Hello World');
});

app.get('/error', (req, res, next) => {
  try {
    throw new Error('Errore di esempio');
  } catch (err) {
    logger.error('Errore nella route /error:', { error: err.message, stack: err.stack });
    next(err);
  }
});

// Middleware per route non trovate
app.use((req, res, next) => {
  const error = new Error(`Route non trovata - ${req.originalUrl}`);
  error.statusCode = 404;
  logger.warn(`404 - Route non trovata: ${req.originalUrl}`);
  next(error);
});

// Middleware di gestione errori
app.use(errorHandler);

// Avvio del server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server in ascolto sulla porta ${PORT}`);
});

// Gestione degli errori non catturati
process.on('uncaughtException', (err) => {
  logger.error('Eccezione non catturata:', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejection non gestita:', { reason, promise });
  process.exit(1);
});
```

## Best Practices per il Logging

1. **Usa livelli di logging appropriati**: Assegna il livello corretto a ciascun messaggio di log.

2. **Includi informazioni contestuali**: Aggiungi metadati utili come ID utente, ID richiesta, ecc.

3. **Struttura i log in formato JSON**: Facilita l'analisi e la ricerca nei log.

4. **Implementa la rotazione dei file**: Evita che i file di log crescano indefinitamente.

5. **Centralizza la configurazione del logging**: Mantieni la configurazione in un unico posto.

6. **Non loggare dati sensibili**: Evita di registrare password, token, dati personali, ecc.

7. **Usa un ID di correlazione**: Traccia le richieste attraverso diversi servizi.

8. **Configura il logging in base all'ambiente**: Usa livelli e formati diversi per sviluppo e produzione.

9. **Monitora i log**: Implementa strumenti per analizzare e avvisare su pattern nei log.

10. **Gestisci gli errori nel sistema di logging**: Assicurati che il sistema di logging stesso non causi errori.

## Conclusione

Un sistema di logging ben progettato è essenziale per lo sviluppo, il monitoraggio e la manutenzione di applicazioni Node.js. Combinando Winston per il logging generale dell'applicazione e Morgan per il logging delle richieste HTTP, puoi creare un sistema completo che ti aiuterà a identificare e risolvere problemi rapidamente.

Nella prossima sezione, esploreremo tecniche avanzate per il monitoraggio delle applicazioni Node.js in produzione.