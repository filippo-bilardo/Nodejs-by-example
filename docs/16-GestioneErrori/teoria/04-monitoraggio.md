# Monitoraggio delle Applicazioni Node.js

## Introduzione

Il monitoraggio delle applicazioni è un aspetto cruciale per garantire l'affidabilità, le prestazioni e la sicurezza dei sistemi in produzione. In questa guida, esploreremo diverse tecniche e strumenti per implementare un sistema di monitoraggio efficace per le applicazioni Node.js.

## Perché Monitorare le Applicazioni

1. **Rilevamento Proattivo dei Problemi**: Identificare e risolvere i problemi prima che influiscano sugli utenti.
2. **Ottimizzazione delle Prestazioni**: Identificare colli di bottiglia e aree di miglioramento.
3. **Pianificazione della Capacità**: Prevedere le esigenze future di risorse.
4. **Sicurezza**: Rilevare attività sospette o anomale.
5. **Conformità**: Soddisfare requisiti normativi e di audit.

## Cosa Monitorare

### 1. Metriche di Sistema

- **CPU**: Utilizzo e carico
- **Memoria**: Utilizzo, leak di memoria
- **Disco**: Spazio disponibile, operazioni I/O
- **Rete**: Traffico, latenza, errori

### 2. Metriche dell'Applicazione

- **Richieste HTTP**: Tasso, latenza, codici di stato
- **Errori**: Frequenza, tipo, impatto
- **Throughput**: Operazioni al secondo
- **Tempo di Risposta**: Latenza media, percentili (p95, p99)
- **Concorrenza**: Numero di connessioni attive

### 3. Metriche di Business

- **Utenti Attivi**: Simultanei, giornalieri, mensili
- **Conversioni**: Registrazioni, acquisti
- **Utilizzo delle Funzionalità**: Quali parti dell'applicazione vengono utilizzate

## Strumenti di Monitoraggio

### 1. Monitoraggio Integrato in Node.js

#### Modulo `process`

```javascript
// Monitoraggio dell'utilizzo della memoria
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log(`Heap totale: ${memoryUsage.heapTotal / 1024 / 1024} MB`);
  console.log(`Heap utilizzato: ${memoryUsage.heapUsed / 1024 / 1024} MB`);
  console.log(`RSS: ${memoryUsage.rss / 1024 / 1024} MB`);
  console.log(`Memoria esterna: ${memoryUsage.external / 1024 / 1024} MB`);
}, 30000);

// Monitoraggio del carico CPU
const startTime = process.hrtime();
setInterval(() => {
  const elapsedTime = process.hrtime(startTime);
  const elapsedTimeInMs = elapsedTime[0] * 1000 + elapsedTime[1] / 1000000;
  const cpuUsage = process.cpuUsage();
  const userCpuUsagePercent = (cpuUsage.user / 1000) / elapsedTimeInMs * 100;
  const systemCpuUsagePercent = (cpuUsage.system / 1000) / elapsedTimeInMs * 100;
  console.log(`CPU utente: ${userCpuUsagePercent.toFixed(2)}%`);
  console.log(`CPU sistema: ${systemCpuUsagePercent.toFixed(2)}%`);
}, 30000);
```

#### Eventi del Processo

```javascript
// Gestione degli eventi del processo
process.on('warning', (warning) => {
  console.warn(`Warning: ${warning.name}`);
  console.warn(`Message: ${warning.message}`);
  console.warn(`Stack: ${warning.stack}`);
});

process.on('uncaughtException', (err) => {
  console.error('Eccezione non catturata:', err);
  // Invia notifica, registra l'errore, ecc.
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejection non gestita:', reason);
  // Invia notifica, registra l'errore, ecc.
});
```

### 2. Librerie di Monitoraggio

#### Prometheus + Grafana

Prometheus è un sistema di monitoraggio open-source che raccoglie metriche da sistemi monitorati, mentre Grafana è una piattaforma di visualizzazione.

```bash
npm install prom-client
```

```javascript
const express = require('express');
const promClient = require('prom-client');

const app = express();
const collectDefaultMetrics = promClient.collectDefaultMetrics;

// Raccoglie metriche di default ogni 10 secondi
collectDefaultMetrics({ timeout: 10000 });

// Contatore personalizzato per le richieste HTTP
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Conteggio totale delle richieste HTTP',
  labelNames: ['method', 'route', 'status']
});

// Istogramma per misurare la latenza delle richieste
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Durata delle richieste HTTP in millisecondi',
  labelNames: ['method', 'route', 'status'],
  buckets: [1, 5, 15, 50, 100, 200, 500, 1000, 2000]
});

// Middleware per tracciare le richieste
app.use((req, res, next) => {
  const start = Date.now();
  
  // Al termine della richiesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestsTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
    httpRequestDurationMicroseconds.observe(
      { method: req.method, route: req.path, status: res.statusCode },
      duration
    );
  });
  
  next();
});

// Endpoint per le metriche Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

#### Datadog

Datadog è una piattaforma di monitoraggio SaaS che offre monitoraggio completo per applicazioni, server, database e servizi.

```bash
npm install dd-trace
```

```javascript
// Deve essere importato all'inizio dell'applicazione
const tracer = require('dd-trace').init({
  service: 'my-node-app',
  env: process.env.NODE_ENV
});

const express = require('express');
const app = express();

// Il resto dell'applicazione...
```

#### New Relic

New Relic è un'altra piattaforma di monitoraggio SaaS popolare.

```bash
npm install newrelic
```

```javascript
// newrelic.js (file di configurazione)
'use strict';

exports.config = {
  app_name: ['My Node App'],
  license_key: 'your_license_key',
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

```javascript
// Deve essere la prima riga dell'applicazione
require('newrelic');

const express = require('express');
const app = express();

// Il resto dell'applicazione...
```

### 3. APM (Application Performance Monitoring)

#### Elastic APM

Elastic APM è parte dello stack Elastic e offre monitoraggio delle prestazioni delle applicazioni.

```bash
npm install elastic-apm-node
```

```javascript
// Deve essere importato all'inizio dell'applicazione
const apm = require('elastic-apm-node').start({
  serviceName: 'my-node-app',
  serverUrl: 'http://localhost:8200',
  environment: process.env.NODE_ENV
});

const express = require('express');
const app = express();

// Il resto dell'applicazione...
```

## Implementazione di un Sistema di Monitoraggio Personalizzato

### Monitoraggio delle Prestazioni dell'Applicazione

```javascript
const express = require('express');
const winston = require('winston');
const os = require('os');

const app = express();

// Configura il logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/metrics.log' })
  ]
});

// Funzione per raccogliere metriche di sistema
function collectSystemMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    memory: {
      total: os.totalmem() / 1024 / 1024, // MB
      free: os.freemem() / 1024 / 1024, // MB
      usage: (1 - os.freemem() / os.totalmem()) * 100 // Percentuale
    },
    cpu: {
      loadavg: os.loadavg(), // Media di carico 1m, 5m, 15m
      cores: os.cpus().length
    },
    uptime: os.uptime(), // Secondi
    process: {
      memory: process.memoryUsage(),
      uptime: process.uptime() // Secondi
    }
  };
  
  logger.info('system_metrics', metrics);
}

// Raccoglie metriche ogni minuto
setInterval(collectSystemMetrics, 60000);

// Middleware per tracciare le richieste HTTP
app.use((req, res, next) => {
  const start = Date.now();
  
  // Al termine della richiesta
  res.on('finish', () => {
    const duration = Date.now() - start;
    const metrics = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: duration, // ms
      contentLength: res.get('Content-Length'),
      userAgent: req.get('User-Agent')
    };
    
    logger.info('http_request', metrics);
  });
  
  next();
});

// Endpoint per le metriche (formato JSON)
app.get('/metrics', (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    system: {
      memory: {
        total: os.totalmem() / 1024 / 1024, // MB
        free: os.freemem() / 1024 / 1024, // MB
        usage: (1 - os.freemem() / os.totalmem()) * 100 // Percentuale
      },
      cpu: {
        loadavg: os.loadavg(),
        cores: os.cpus().length
      },
      uptime: os.uptime()
    },
    process: {
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
  
  res.json(metrics);
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
  collectSystemMetrics(); // Raccoglie metriche all'avvio
});
```

### Dashboard di Monitoraggio

Puoi creare una semplice dashboard di monitoraggio utilizzando Express e Socket.io per visualizzare le metriche in tempo reale:

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Servi i file statici
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint per la dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Funzione per raccogliere metriche
function collectMetrics() {
  return {
    timestamp: new Date().toISOString(),
    memory: {
      total: os.totalmem() / 1024 / 1024, // MB
      free: os.freemem() / 1024 / 1024, // MB
      usage: (1 - os.freemem() / os.totalmem()) * 100 // Percentuale
    },
    cpu: {
      loadavg: os.loadavg(),
      cores: os.cpus().length
    },
    uptime: os.uptime(),
    process: {
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  };
}

// Invia metriche ai client connessi ogni 5 secondi
setInterval(() => {
  const metrics = collectMetrics();
  io.emit('metrics', metrics);
}, 5000);

// Gestisci le connessioni Socket.io
io.on('connection', (socket) => {
  console.log('Nuovo client connesso');
  
  // Invia metriche iniziali
  socket.emit('metrics', collectMetrics());
  
  socket.on('disconnect', () => {
    console.log('Client disconnesso');
  });
});

server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

HTML per la dashboard:

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard di Monitoraggio</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; }
    .header { margin-bottom: 20px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .metric-card { background: #f5f5f5; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric-title { margin-top: 0; font-size: 1.2em; color: #333; }
    .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
    .metric-subtitle { font-size: 0.9em; color: #666; margin: 5px 0; }
    .metric-subvalue { font-size: 1.2em; font-weight: bold; }
    .update-time { font-size: 0.8em; color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Dashboard di Monitoraggio</h1>
    </div>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <h2 class="metric-title">Utilizzo Memoria</h2>
        <div class="metric-value" id="memory-usage">0%</div>
        <div class="metric-subtitle">Totale: <span class="metric-subvalue" id="memory-total">0</span> MB</div>
        <div class="metric-subtitle">Libera: <span class="metric-subvalue" id="memory-free">0</span> MB</div>
      </div>
      
      <div class="metric-card">
        <h2 class="metric-title">Carico CPU</h2>
        <div class="metric-value" id="cpu-load">0</div>
        <div class="metric-subtitle">Cores: <span class="metric-subvalue" id="cpu-cores">0</span></div>
      </div>
      
      <div class="metric-card">
        <h2 class="metric-title">Uptime Sistema</h2>
        <div class="metric-value" id="system-uptime">0</div>
        <div class="metric-subtitle">Ore</div>
      </div>
      
      <div class="metric-card">
        <h2 class="metric-title">Heap Node.js</h2>
        <div class="metric-value" id="heap-used">0</div>
        <div class="metric-subtitle">Utilizzato: <span class="metric-subvalue" id="heap-used-mb">0</span> MB</div>
        <div class="metric-subtitle">Totale: <span class="metric-subvalue" id="heap-total-mb">0</span> MB</div>
      </div>
    </div>
    
    <div class="update-time" id="update-time">Ultimo aggiornamento: mai</div>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    // Connessione a Socket.io
    const socket = io();
    
    // Elementi DOM
    const memoryUsageElement = document.getElementById('memory-usage');
    const memoryTotalElement = document.getElementById('memory-total');
    const memoryFreeElement = document.getElementById('memory-free');
    const cpuLoadElement = document.getElementById('cpu-load');
    const cpuCoresElement = document.getElementById('cpu-cores');
    const systemUptimeElement = document.getElementById('system-uptime');
    const heapUsedElement = document.getElementById('heap-used');
    const heapUsedMbElement = document.getElementById('heap-used-mb');
    const heapTotalMbElement = document.getElementById('heap-total-mb');
    const updateTimeElement = document.getElementById('update-time');
    
    // Aggiorna la dashboard con le metriche ricevute
    socket.on('metrics', (metrics) => {
      // Memoria
      memoryUsageElement.textContent = `${metrics.memory.usage.toFixed(2)}%`;
      memoryTotalElement.textContent = metrics.memory.total.toFixed(0);
      memoryFreeElement.textContent = metrics.memory.free.toFixed(0);
      
      // CPU
      cpuLoadElement.textContent = metrics.cpu.loadavg[0].toFixed(2);
      cpuCoresElement.textContent = metrics.cpu.cores;
      
      // Uptime
      const uptimeHours = (metrics.uptime / 3600).toFixed(2);
      systemUptimeElement.textContent = uptimeHours;
      
      // Heap
      const heapUsedPercentage = (metrics.process.memory.heapUsed / metrics.process.memory.heapTotal * 100).toFixed(2);
      const heapUsedMb = (metrics.process.memory.heapUsed / 1024 / 1024).toFixed(2);
      const heapTotalMb = (metrics.process.memory.heapTotal / 1024 / 1024).toFixed(2);
      
      heapUsedElement.textContent = `${heapUsedPercentage}%`;
      heapUsedMbElement.textContent = heapUsedMb;
      heapTotalMbElement.textContent = heapTotalMb;
      
      // Aggiorna il timestamp
      const updateTime = new Date(metrics.timestamp);
      updateTimeElement.textContent = `Ultimo aggiornamento: ${updateTime.toLocaleTimeString()}`;
    });
  </script>
</body>
</html>
```

## Notifiche e Avvisi

### Implementazione di un Sistema di Notifiche

```javascript
const nodemailer = require('nodemailer');
const Slack = require('slack-node');

// Configura il trasporto email
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: 'user@example.com',
    pass: 'password'
  }
});

// Configura Slack
const slack = new Slack();
slack.setWebhook('https://hooks.slack.com/services/YOUR/WEBHOOK/URL');

// Funzione per inviare notifiche via email
async function sendEmailAlert(subject, message) {
  try {
    await transporter.sendMail({
      from: '"Monitoring System" <monitoring@example.com>',
      to: 'admin@example.com',
      subject: `[ALERT] ${subject}`,
      text: message,
      html: `<p>${message}</p>`
    });
    console.log('Email di notifica inviata');
  } catch (error) {
    console.error('Errore nell\'invio dell\'email:', error);
  }
}

// Funzione per inviare notifiche via Slack
function sendSlackAlert(message) {
  slack.webhook({
    channel: '#alerts',
    username: 'monitoring-bot',
    icon_emoji: ':warning:',
    text: message
  }, (err, response) => {
    if (err) {
      console.error('Errore nell\'invio della notifica Slack:', err);
    } else {
      console.log('Notifica Slack inviata');
    }
  });
}

// Esempio di utilizzo
function checkMemoryUsage() {
  const memoryUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100;
  
  if (memoryUsage > 90) {
    const message = `Utilizzo memoria critico: ${memoryUsage.toFixed(2)}%`;
    sendEmailAlert('Memoria critica', message);
    sendSlackAlert(`:red_circle: ${message}`);
  } else if (memoryUsage > 80) {
    const message = `Utilizzo memoria elevato: ${memoryUsage.toFixed(2)}%`;
    sendSlackAlert(`:warning: ${message}`);
  }
}

// Controlla l'utilizzo della memoria ogni 5 minuti
setInterval(checkMemoryUsage, 5 * 60 * 1000);
```

## Best Practices per il Monitoraggio

1. **Monitora ciò che è importante**: Concentrati sulle metriche che hanno un impatto diretto sugli utenti e sul business.

2. **Imposta soglie significative**: Definisci soglie di avviso basate su dati storici e requisiti di business.

3. **Evita il rumore**: Troppi avvisi possono portare a ignorarli. Assicurati che gli avvisi siano significativi.

4. **Implementa il monitoraggio a più livelli**: Monitora l'infrastruttura, l'applicazione e le metriche di business.

5. **Utilizza il monitoraggio distribuito**: Per applicazioni distribuite, implementa il tracing distribuito.

6. **Automatizza le risposte**: Quando possibile, automatizza le risposte agli eventi comuni.

7. **Mantieni una cronologia**: Conserva i dati storici per l'analisi delle tendenze.

8. **Testa il sistema di monitoraggio**: Assicurati che il sistema di monitoraggio stesso sia affidabile.

9. **Documenta le procedure**: Crea runbook per la risposta agli incidenti.

10. **Rivedi e migliora**: Analizza regolarmente l'efficacia del sistema di monitoraggio e apporta miglioramenti.

## Conclusione

Un sistema di monitoraggio efficace è essenziale per mantenere applicazioni Node.js affidabili e performanti in produzione. Combinando strumenti di monitoraggio integrati, librerie di terze parti e soluzioni personalizzate, puoi creare un sistema completo che ti aiuterà a identificare problemi, ottimizzare le prestazioni e garantire la migliore esperienza utente possibile.

Ricorda che il monitoraggio non è un'attività una tantum, ma un processo continuo di miglioramento. Man mano che la tua applicazione evolve, anche il tuo sistema di monitoraggio dovrebbe evolversi per soddisfare le nuove esigenze e sfide.