# Monitoraggio di Applicazioni Node.js in Produzione

## Obiettivo
In questo esercizio, imparerai a implementare un sistema di monitoraggio completo per un'applicazione Node.js in produzione, utilizzando strumenti e servizi che ti permetteranno di tracciare prestazioni, errori e comportamento dell'applicazione in tempo reale.

## Prerequisiti
- Un'applicazione Node.js funzionante deployata in produzione
- Conoscenza di base di Node.js e npm
- Accesso a un server o a un servizio cloud dove è ospitata l'applicazione
- Conoscenza di base di metriche e logging

## Parte 1: Logging Avanzato

### 1. Implementazione di Winston per il Logging

1. Installa Winston, una libreria di logging flessibile per Node.js:
   ```bash
   npm install winston
   ```

2. Configura Winston nella tua applicazione:
   ```javascript
   // logger.js
   const winston = require('winston');
   const { format, transports } = winston;
   
   // Definizione del formato personalizzato
   const logFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
     let msg = `${timestamp} [${level}]: ${message}`;
     if (Object.keys(metadata).length > 0) {
       msg += JSON.stringify(metadata);
     }
     return msg;
   });
   
   // Creazione del logger
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: format.combine(
       format.timestamp(),
       format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
       logFormat
     ),
     transports: [
       // Console per lo sviluppo
       new transports.Console(),
       // File per la produzione
       new transports.File({ filename: 'error.log', level: 'error' }),
       new transports.File({ filename: 'combined.log' })
     ],
   });
   
   module.exports = logger;
   ```

3. Utilizza il logger nell'applicazione:
   ```javascript
   // app.js
   const logger = require('./logger');
   
   app.get('/', (req, res) => {
     logger.info('Richiesta ricevuta alla route principale', { 
       ip: req.ip, 
       userAgent: req.headers['user-agent'] 
     });
     res.send('Hello World!');
   });
   
   app.use((err, req, res, next) => {
     logger.error('Errore dell\'applicazione', { 
       error: err.message, 
       stack: err.stack,
       path: req.path
     });
     res.status(500).send('Errore del server');
   });
   ```

### 2. Integrazione con un Servizio di Logging Centralizzato

1. Configura Winston per inviare i log a un servizio come Loggly, Papertrail o ELK Stack.

   Per Loggly:
   ```bash
   npm install winston-loggly-bulk
   ```

   ```javascript
   // logger.js
   require('winston-loggly-bulk');
   
   logger.add(new winston.transports.Loggly({
     token: "YOUR_LOGGLY_TOKEN",
     subdomain: "your-subdomain",
     tags: ["nodejs", "production"],
     json: true
   }));
   ```

2. Configura la rotazione dei file di log per evitare che occupino troppo spazio:
   ```bash
   npm install winston-daily-rotate-file
   ```

   ```javascript
   // logger.js
   const DailyRotateFile = require('winston-daily-rotate-file');
   
   const fileRotateTransport = new DailyRotateFile({
     filename: 'application-%DATE%.log',
     datePattern: 'YYYY-MM-DD',
     maxSize: '20m',
     maxFiles: '14d'
   });
   
   logger.add(fileRotateTransport);
   ```

## Parte 2: Monitoraggio delle Prestazioni

### 1. Implementazione di PM2 per il Monitoraggio dei Processi

1. Installa PM2 globalmente:
   ```bash
   npm install -g pm2
   ```

2. Avvia l'applicazione con PM2:
   ```bash
   pm2 start app.js --name "my-nodejs-app" -i max
   ```

3. Monitora l'applicazione in tempo reale:
   ```bash
   pm2 monit
   ```

4. Configura PM2 per raccogliere metriche avanzate:
   ```bash
   pm2 install pm2-server-monit
   ```

5. Configura PM2 per riavviare automaticamente l'applicazione in caso di crash:
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: "my-nodejs-app",
       script: "app.js",
       instances: "max",
       exec_mode: "cluster",
       watch: true,
       max_memory_restart: "500M",
       env: {
         NODE_ENV: "production",
         PORT: 3000
       }
     }]
   };
   ```

   ```bash
   pm2 start ecosystem.config.js
   ```

### 2. Implementazione di un APM (Application Performance Monitoring)

1. Installa New Relic per Node.js:
   ```bash
   npm install newrelic
   ```

2. Crea un file di configurazione per New Relic:
   ```javascript
   // newrelic.js
   'use strict';
   
   exports.config = {
     app_name: ['My Node.js Application'],
     license_key: 'YOUR_LICENSE_KEY',
     logging: {
       level: 'info'
     },
     allow_all_headers: true,
     attributes: {
       exclude: [
         'request.headers.cookie',
         'request.headers.authorization',
         'request.headers.proxyAuthorization',
         'request.headers.setCookie*',
         'request.headers.x*',
         'response.headers.cookie',
         'response.headers.authorization',
         'response.headers.proxyAuthorization',
         'response.headers.setCookie*',
         'response.headers.x*'
       ]
     }
   };
   ```

3. Importa New Relic all'inizio del tuo file principale:
   ```javascript
   // app.js
   require('newrelic');
   const express = require('express');
   // resto del codice...
   ```

4. Alternativa: Utilizza Datadog APM:
   ```bash
   npm install dd-trace
   ```

   ```javascript
   // All'inizio del file principale
   const tracer = require('dd-trace').init();
   // resto del codice...
   ```

## Parte 3: Monitoraggio degli Errori

### 1. Implementazione di Sentry per il Tracciamento degli Errori

1. Installa Sentry per Node.js:
   ```bash
   npm install @sentry/node @sentry/tracing
   ```

2. Configura Sentry nella tua applicazione:
   ```javascript
   // app.js
   const Sentry = require('@sentry/node');
   const Tracing = require('@sentry/tracing');
   const express = require('express');
   
   const app = express();
   
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     integrations: [
       new Sentry.Integrations.Http({ tracing: true }),
       new Tracing.Integrations.Express({ app }),
     ],
     tracesSampleRate: 1.0,
   });
   
   // Il middleware di Sentry deve essere il primo
   app.use(Sentry.Handlers.requestHandler());
   app.use(Sentry.Handlers.tracingHandler());
   
   // Le tue route
   app.get('/', function (req, res) {
     res.send('Hello World!');
   });
   
   // Esempio di route che genera un errore
   app.get('/error', function (req, res) {
     throw new Error('Errore di esempio');
   });
   
   // Il middleware di gestione degli errori di Sentry deve essere prima di qualsiasi altro middleware di gestione degli errori
   app.use(Sentry.Handlers.errorHandler());
   
   // Middleware di gestione degli errori standard
   app.use(function (err, req, res, next) {
     res.statusCode = 500;
     res.end('Errore del server');
   });
   
   app.listen(3000);
   ```

### 2. Implementazione di Healthchecks

1. Crea un endpoint di healthcheck per verificare lo stato dell'applicazione:
   ```javascript
   // app.js
   app.get('/health', (req, res) => {
     // Verifica la connessione al database
     const dbStatus = checkDatabaseConnection();
     
     // Verifica altri servizi esterni
     const externalServicesStatus = checkExternalServices();
     
     if (dbStatus && externalServicesStatus) {
       res.status(200).json({ status: 'UP' });
     } else {
       res.status(503).json({
         status: 'DOWN',
         database: dbStatus ? 'UP' : 'DOWN',
         externalServices: externalServicesStatus ? 'UP' : 'DOWN'
       });
     }
   });
   
   function checkDatabaseConnection() {
     // Logica per verificare la connessione al database
     return true; // Sostituisci con la logica reale
   }
   
   function checkExternalServices() {
     // Logica per verificare i servizi esterni
     return true; // Sostituisci con la logica reale
   }
   ```

2. Configura un servizio di monitoraggio esterno come UptimeRobot o Pingdom per controllare regolarmente l'endpoint di healthcheck.

## Parte 4: Monitoraggio delle Metriche di Business

### 1. Implementazione di Prometheus e Grafana

1. Installa le dipendenze necessarie:
   ```bash
   npm install prom-client express-prom-bundle
   ```

2. Configura Prometheus nella tua applicazione:
   ```javascript
   // app.js
   const promBundle = require('express-prom-bundle');
   const promClient = require('prom-client');
   
   // Aggiungi metriche personalizzate
   const httpRequestDurationMicroseconds = new promClient.Histogram({
     name: 'http_request_duration_ms',
     help: 'Durata delle richieste HTTP in ms',
     labelNames: ['method', 'route', 'status_code'],
     buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
   });
   
   // Middleware per Prometheus
   const metricsMiddleware = promBundle({
     includeMethod: true,
     includePath: true,
     includeStatusCode: true,
     includeUp: true,
     customLabels: { app: 'my-nodejs-app' },
     promClient: {
       collectDefaultMetrics: {}
     }
   });
   
   app.use(metricsMiddleware);
   
   // Middleware per misurare la durata delle richieste
   app.use((req, res, next) => {
     const start = Date.now();
     res.on('finish', () => {
       const duration = Date.now() - start;
       httpRequestDurationMicroseconds
         .labels(req.method, req.path, res.statusCode)
         .observe(duration);
     });
     next();
   });
   ```

3. Configura un server Prometheus per raccogliere le metriche e Grafana per visualizzarle.

### 2. Implementazione di Metriche di Business Personalizzate

1. Crea contatori per eventi di business importanti:
   ```javascript
   // metrics.js
   const promClient = require('prom-client');
   
   // Contatore per le registrazioni utente
   const userRegistrations = new promClient.Counter({
     name: 'user_registrations_total',
     help: 'Numero totale di registrazioni utente'
   });
   
   // Contatore per gli ordini completati
   const ordersCompleted = new promClient.Counter({
     name: 'orders_completed_total',
     help: 'Numero totale di ordini completati',
     labelNames: ['paymentMethod']
   });
   
   // Gauge per gli utenti attivi
   const activeUsers = new promClient.Gauge({
     name: 'active_users',
     help: 'Numero di utenti attualmente attivi'
   });
   
   module.exports = {
     userRegistrations,
     ordersCompleted,
     activeUsers
   };
   ```

2. Utilizza le metriche nell'applicazione:
   ```javascript
   // app.js
   const metrics = require('./metrics');
   
   app.post('/register', (req, res) => {
     // Logica di registrazione
     metrics.userRegistrations.inc();
     res.status(201).json({ message: 'Utente registrato con successo' });
   });
   
   app.post('/orders', (req, res) => {
     // Logica di creazione ordine
     metrics.ordersCompleted.inc({ paymentMethod: req.body.paymentMethod });
     res.status(201).json({ message: 'Ordine creato con successo' });
   });
   
   // Aggiorna il numero di utenti attivi quando un utente si connette/disconnette
   io.on('connection', (socket) => {
     metrics.activeUsers.inc();
     
     socket.on('disconnect', () => {
       metrics.activeUsers.dec();
     });
   });
   ```

## Sfide Aggiuntive

1. **Implementazione di Tracing Distribuito**:
   - Utilizza OpenTelemetry per implementare il tracing distribuito tra microservizi
   - Visualizza e analizza le tracce con Jaeger o Zipkin

2. **Monitoraggio delle Prestazioni del Frontend**:
   - Implementa Real User Monitoring (RUM) per tracciare le prestazioni lato client
   - Utilizza strumenti come Lighthouse o WebPageTest per analisi periodiche

3. **Automazione delle Risposte agli Incidenti**:
   - Configura alert basati su soglie di metriche critiche
   - Implementa risposte automatiche come lo scaling orizzontale o il failover

## Conclusione

Hai implementato un sistema di monitoraggio completo per la tua applicazione Node.js in produzione. Questo sistema ti permette di:

- Tracciare e analizzare i log dell'applicazione
- Monitorare le prestazioni e l'utilizzo delle risorse
- Rilevare e diagnosticare errori in tempo reale
- Misurare metriche di business importanti

Un buon sistema di monitoraggio è fondamentale per mantenere un'applicazione affidabile e performante in produzione. Ti permette di identificare problemi prima che impattino gli utenti, di comprendere il comportamento dell'applicazione sotto carico e di prendere decisioni informate per miglioramenti futuri.