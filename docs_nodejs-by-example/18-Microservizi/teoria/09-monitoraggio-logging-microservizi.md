# Monitoraggio e Logging nei Microservizi

## Introduzione al Monitoraggio dei Microservizi

In un'architettura a microservizi, il monitoraggio e il logging sono componenti critici per garantire l'affidabilità, la disponibilità e le prestazioni del sistema. La natura distribuita dei microservizi rende queste attività più complesse rispetto alle applicazioni monolitiche, richiedendo approcci e strumenti specifici.

## Sfide del Monitoraggio nei Microservizi

1. **Distribuzione**: I servizi sono distribuiti su più server o container
2. **Eterogeneità**: Diversi servizi possono utilizzare tecnologie diverse
3. **Dinamicità**: I servizi possono essere scalati, spostati o ricreati frequentemente
4. **Tracciamento delle Richieste**: Una singola richiesta utente può attraversare molti servizi
5. **Volume dei Dati**: La quantità di log e metriche può essere enorme

## Strategie di Monitoraggio

### 1. Monitoraggio delle Metriche

Le metriche forniscono informazioni quantitative sullo stato e le prestazioni dei servizi.

**Metriche chiave da monitorare:**

- **Metriche di Sistema**: CPU, memoria, disco, rete
- **Metriche di Applicazione**: Latenza, throughput, tasso di errore
- **Metriche di Business**: KPI specifici del dominio

```javascript
// Esempio di monitoraggio delle metriche con Prometheus in Node.js
const express = require('express');
const client = require('prom-client');
const app = express();

// Crea un registro per le metriche
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Crea un contatore personalizzato
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Conteggio totale delle richieste HTTP',
  labelNames: ['method', 'path', 'status'],
  registers: [register]
});

// Middleware per contare le richieste
app.use((req, res, next) => {
  const end = res.end;
  res.end = function(...args) {
    httpRequestsTotal.inc({
      method: req.method,
      path: req.path,
      status: res.statusCode
    });
    end.apply(res, args);
  };
  next();
});

// Endpoint per esporre le metriche
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

### 2. Distributed Tracing

Il distributed tracing permette di seguire il percorso di una richiesta attraverso i vari microservizi, facilitando l'identificazione di colli di bottiglia e problemi di performance.

```javascript
// Esempio di distributed tracing con OpenTelemetry in Node.js
const opentelemetry = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

// Configurazione del provider di tracing
const provider = new NodeTracerProvider();

// Configurazione dell'esportatore Jaeger
const exporter = new JaegerExporter({
  serviceName: 'user-service',
  endpoint: 'http://jaeger:14268/api/traces'
});

// Registrazione del processor e dell'esportatore
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.register();

// Ottieni un tracer
const tracer = opentelemetry.trace.getTracer('user-service-tracer');

// Esempio di utilizzo in una funzione
async function getUserData(userId) {
  // Crea uno span per questa operazione
  const span = tracer.startSpan('getUserData');
  
  try {
    // Aggiungi attributi allo span
    span.setAttribute('userId', userId);
    
    // Esegui l'operazione
    const user = await fetchUserFromDatabase(userId);
    
    // Aggiungi informazioni sul risultato
    span.setAttribute('userFound', !!user);
    
    return user;
  } catch (error) {
    // Registra l'errore nello span
    span.setStatus({
      code: opentelemetry.SpanStatusCode.ERROR,
      message: error.message
    });
    throw error;
  } finally {
    // Termina lo span
    span.end();
  }
}
```

### 3. Logging Centralizzato

In un'architettura a microservizi, è essenziale centralizzare i log per avere una visione unificata del sistema.

```javascript
// Esempio di logging centralizzato con Winston e ELK Stack
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

// Configurazione del logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    // Console per lo sviluppo locale
    new winston.transports.Console(),
    
    // Elasticsearch per il logging centralizzato
    new ElasticsearchTransport({
      level: 'info',
      clientOpts: { node: 'http://elasticsearch:9200' },
      indexPrefix: 'microservices-logs'
    })
  ]
});

// Utilizzo del logger
function createUser(userData) {
  logger.info('Creazione nuovo utente', { userData });
  
  try {
    // Logica per la creazione dell'utente
    const user = saveUserToDatabase(userData);
    logger.info('Utente creato con successo', { userId: user.id });
    return user;
  } catch (error) {
    logger.error('Errore nella creazione dell'utente', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

### 4. Health Checks

I controlli di salute (health checks) sono fondamentali per verificare lo stato dei servizi e implementare strategie di resilienza.

```javascript
// Implementazione di health checks in Express
const express = require('express');
const app = express();

// Dipendenze del servizio
const database = require('./database');
const cacheService = require('./cache');
const paymentGateway = require('./payment-gateway');

// Endpoint per health check semplice
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Endpoint per health check dettagliato
app.get('/health/details', async (req, res) => {
  try {
    // Verifica connessione al database
    const dbStatus = await database.ping();
    
    // Verifica connessione alla cache
    const cacheStatus = await cacheService.ping();
    
    // Verifica connessione al gateway di pagamento
    const paymentStatus = await paymentGateway.ping();
    
    // Determina lo stato complessivo
    const overallStatus = 
      dbStatus.ok && cacheStatus.ok && paymentStatus.ok ? 'UP' : 'DEGRADED';
    
    res.status(overallStatus === 'UP' ? 200 : 207).json({
      status: overallStatus,
      components: {
        database: {
          status: dbStatus.ok ? 'UP' : 'DOWN',
          details: dbStatus.details
        },
        cache: {
          status: cacheStatus.ok ? 'UP' : 'DOWN',
          details: cacheStatus.details
        },
        payment: {
          status: paymentStatus.ok ? 'UP' : 'DOWN',
          details: paymentStatus.details
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(3000);
```

## Architettura di Monitoraggio per Microservizi

### Componenti di un Sistema di Monitoraggio Completo

1. **Raccolta Dati**:
   - Agenti di monitoraggio sui server/container
   - Librerie di strumentazione nelle applicazioni
   - Sidecar per il proxying e la raccolta di metriche

2. **Elaborazione e Storage**:
   - Database time-series per le metriche
   - Sistemi di indicizzazione per i log
   - Sistemi di storage per i trace

3. **Visualizzazione e Alerting**:
   - Dashboard per la visualizzazione delle metriche
   - Sistemi di alerting per notifiche
   - Strumenti di analisi per l'identificazione di pattern

### Esempio di Stack di Monitoraggio

**Stack ELK (Elasticsearch, Logstash, Kibana)**:
- **Elasticsearch**: Database per l'indicizzazione e la ricerca di log
- **Logstash**: Pipeline di elaborazione dei log
- **Kibana**: Interfaccia di visualizzazione

**Stack Prometheus**:
- **Prometheus**: Raccolta e storage di metriche
- **Alertmanager**: Gestione degli alert
- **Grafana**: Visualizzazione delle metriche

**Jaeger/Zipkin**:
- Sistemi di distributed tracing

## Best Practices per il Monitoraggio dei Microservizi

1. **Standardizzazione**:
   - Adottare formati standard per log e metriche
   - Utilizzare convenzioni di naming coerenti

2. **Correlazione**:
   - Utilizzare ID di correlazione per tracciare le richieste
   - Collegare log, metriche e trace

```javascript
// Middleware per aggiungere ID di correlazione
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuid.v4();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  
  // Aggiungi l'ID al contesto di logging
  logger.child({ correlationId }).info(`${req.method} ${req.path}`);
  
  next();
});
```

3. **Automazione**:
   - Automatizzare la configurazione del monitoraggio
   - Implementare il monitoraggio come codice

4. **Osservabilità**:
   - Progettare i servizi per essere osservabili
   - Esporre endpoint di health e metriche

5. **Granularità**:
   - Raccogliere dati con la giusta granularità
   - Bilanciare dettaglio e volume dei dati

## Implementazione di un Sistema di Monitoraggio

### 1. Configurazione di Prometheus e Grafana

**docker-compose.yml**:
```yaml
version: '3'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    depends_on:
      - prometheus
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=secret
```

**prometheus.yml**:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'microservices'
    dns_sd_configs:
      - names:
          - 'user-service'
          - 'order-service'
          - 'product-service'
        type: 'A'
        port: 3000
```

### 2. Configurazione di ELK Stack

**docker-compose.yml (aggiunta)**:
```yaml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:7.14.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:7.14.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

**logstash.conf**:
```
input {
  tcp {
    port => 5000
    codec => json
  }
}

filter {
  if [service] == "user-service" {
    mutate {
      add_field => { "[@metadata][index]" => "user-service-%{+YYYY.MM.dd}" }
    }
  } else if [service] == "order-service" {
    mutate {
      add_field => { "[@metadata][index]" => "order-service-%{+YYYY.MM.dd}" }
    }
  } else {
    mutate {
      add_field => { "[@metadata][index]" => "microservices-%{+YYYY.MM.dd}" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[@metadata][index]}"
  }
}
```

### 3. Configurazione di Jaeger per il Distributed Tracing

**docker-compose.yml (aggiunta)**:
```yaml
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "5775:5775/udp"
      - "6831:6831/udp"
      - "6832:6832/udp"
      - "5778:5778"
      - "16686:16686"
      - "14268:14268"
      - "14250:14250"
```

## Conclusione

Il monitoraggio e il logging sono componenti essenziali di un'architettura a microservizi di successo. Un sistema di monitoraggio ben progettato permette di:

1. **Identificare problemi rapidamente**: Rilevare anomalie prima che impattino gli utenti
2. **Diagnosticare problemi efficacemente**: Trovare la causa radice dei problemi
3. **Ottimizzare le prestazioni**: Identificare colli di bottiglia e opportunità di miglioramento
4. **Pianificare la capacità**: Prevedere le esigenze future di risorse
5. **Migliorare la sicurezza**: Rilevare attività sospette o anomale

Investire in un'infrastruttura di monitoraggio robusta è fondamentale per garantire l'affidabilità, la disponibilità e le prestazioni di un sistema a microservizi in produzione.