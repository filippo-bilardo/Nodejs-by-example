# Esempi Architettura Event-Driven

Questa cartella contiene esempi pratici di implementazione di architetture event-driven con Node.js.

## Struttura degli Esempi

### 01. Basic EventEmitter
**Concetto**: Uso base di EventEmitter
- Custom event emitter
- Listener multipli
- Rimozione listener
- **File**: `01-basic-eventemitter/`

### 02. File Watcher
**Concetto**: Monitoraggio filesystem con eventi
- Watch directory changes
- Eventi per creazione/modifica/eliminazione file
- Gestione errori
- **File**: `02-file-watcher/`

### 03. Task Queue
**Concetto**: Coda di elaborazione event-driven
- Enqueue/dequeue con eventi
- Concorrenza limitata
- Progress tracking
- **File**: `03-task-queue/`

### 04. Pub/Sub System
**Concetto**: Message broker publish/subscribe
- Pattern matching su canali
- Subscriber multipli
- Message persistence
- **File**: `04-pubsub-system/`

### 05. Chat Server
**Concetto**: Chat real-time con EventEmitter
- Stanze multiple
- Broadcasting messaggi
- Gestione utenti
- **File**: `05-chat-server/`

### 06. Custom Streams
**Concetto**: Stream personalizzati con eventi
- Readable/Writable custom
- Backpressure handling
- Pipeline events
- **File**: `06-custom-streams/`

### 07. Event Sourcing
**Concetto**: Event sourcing semplificato
- Event store
- Aggregate rehydration
- Projections
- **File**: `07-event-sourcing/`

### 08. Saga Pattern
**Concetto**: Transazioni distribuite con compensazione
- Multi-step workflow
- Automatic rollback
- Monitoring
- **File**: `08-saga-pattern/`

## Come Eseguire gli Esempi

Ogni esempio ha la propria directory con:
- `README.md` - Documentazione specifica
- `package.json` - Dipendenze
- File sorgente implementazione
- (Opzionale) File di test

### Installazione

```bash
cd <directory-esempio>
npm install
```

### Esecuzione

```bash
node server.js
# oppure
npm start
```

## Progressione Consigliata

1. **Inizio**: 01-basic-eventemitter (concetti fondamentali)
2. **I/O Events**: 02-file-watcher (eventi sistema)
3. **Processing**: 03-task-queue (elaborazione asincrona)
4. **Messaging**: 04-pubsub-system (disaccoppiamento)
5. **Real-time**: 05-chat-server (applicazione pratica)
6. **Streams**: 06-custom-streams (pattern avanzato)
7. **Architecture**: 07-event-sourcing (pattern architetturale)
8. **Distributed**: 08-saga-pattern (sistemi distribuiti)

## Concetti Chiave per Esempio

| Esempio | EventEmitter | Event Loop | Pattern | Async |
|---------|--------------|------------|---------|-------|
| 01 | ✅ ✅ ✅ | ⚪ | Observer | ⚪ |
| 02 | ✅ ✅ | ✅ | Observer | ✅ |
| 03 | ✅ ✅ | ✅ ✅ | Queue | ✅ ✅ |
| 04 | ✅ ✅ ✅ | ✅ | Pub/Sub | ✅ |
| 05 | ✅ ✅ ✅ | ✅ ✅ | Mediator | ✅ ✅ |
| 06 | ✅ ✅ | ✅ ✅ ✅ | Stream | ✅ ✅ ✅ |
| 07 | ✅ ✅ ✅ | ✅ | Event Sourcing | ✅ ✅ |
| 08 | ✅ ✅ ✅ | ✅ ✅ | Saga | ✅ ✅ ✅ |

## Risorse Aggiuntive

- [Teoria - EventEmitter](../teoria/02-eventemitter.md)
- [Teoria - Event Loop](../teoria/03-event-loop.md)
- [Teoria - Pattern Avanzati](../teoria/04-pattern-avanzati.md)
- [Esercizi](../esercizi/)
