# Esercizi Architettura Event-Driven

Questa cartella contiene le specifiche per gli esercizi pratici sull'architettura event-driven.

## Lista Esercizi

### 01. Event Logger System
**Livello**: ⭐ Principiante
**Tempo stimato**: 1-2 ore

Implementa un sistema di logging completo basato su eventi.

**Obiettivi**:
- Creare classe `Logger` che estende `EventEmitter`
- Supportare livelli: DEBUG, INFO, WARN, ERROR
- Implementare output multipli (console, file, remote)
- Rotazione automatica log files
- Filtering per livello

**File da creare**:
- `logger.js` - Classe Logger
- `test.js` - Test del logger
- `logs/` - Directory output (auto-creata)

---

### 02. Notification Service
**Livello**: ⭐⭐ Intermedio
**Tempo stimato**: 2-3 ore

Sistema di notifiche multi-canale con prioritizzazione.

**Obiettivi**:
- Supportare canali: email, SMS, push, webhook
- Priorità notifiche (low, medium, high, urgent)
- Rate limiting per canale
- Retry automatico su fallimenti
- Monitoring dashboard

**File da creare**:
- `notification-service.js` - Servizio principale
- `channels/` - Implementazioni canali
- `test.js` - Test integrazione

---

### 03. Game Engine Event System
**Livello**: ⭐⭐ Intermedio
**Tempo stimato**: 3-4 ore

Motore di gioco event-driven semplificato.

**Obiettivi**:
- Game loop con eventi tick
- Gestione input (keyboard, mouse)
- Sistema collisioni con eventi
- Stato gioco event-driven
- Pause/Resume

**File da creare**:
- `engine.js` - Game engine
- `entities/` - Player, Enemy, Projectile
- `game.js` - Esempio gioco

---

### 04. Workflow Engine
**Livello**: ⭐⭐⭐ Avanzato
**Tempo stimato**: 4-5 ore

State machine per workflow aziendali.

**Obiettivi**:
- Definizione workflow con stati e transizioni
- Eventi per cambio stato
- Condizioni per transizioni
- Azioni asincrone su stati
- Persistenza stato

**File da creare**:
- `workflow-engine.js` - Engine principale
- `workflows/` - Definizioni workflow
- `actions/` - Azioni eseguibili
- `test.js` - Test workflow

---

### 05. Distributed Event Bus
**Livello**: ⭐⭐⭐ Avanzato
**Tempo stimato**: 5-6 ore

Event bus per comunicazione tra processi.

**Obiettivi**:
- Pub/Sub distribuito con Redis
- Supporto pattern matching
- Delivery garantito
- Event replay
- Monitoring

**File da creare**:
- `event-bus.js` - Bus principale
- `publisher.js` - Esempio publisher
- `subscriber.js` - Esempio subscriber
- `docker-compose.yml` - Setup Redis

---

## Criteri di Valutazione

Ogni esercizio sarà valutato su:

1. **Funzionalità** (40%)
   - Tutti i requisiti implementati
   - Codice funzionante senza errori

2. **Qualità Codice** (30%)
   - Uso corretto EventEmitter
   - Gestione errori
   - Naming chiaro
   - Commenti appropriati

3. **Architettura** (20%)
   - Disaccoppiamento componenti
   - Pattern appropriati
   - Estensibilità

4. **Test** (10%)
   - Test case significativi
   - Coverage adeguato

## Come Procedere

1. Leggi attentamente la specifica dell'esercizio
2. Disegna l'architettura prima di codificare
3. Implementa incrementalmente
4. Testa frequentemente
5. Documenta il codice

## Risorse Utili

- [Teoria - EventEmitter](../teoria/02-eventemitter.md)
- [Teoria - Event Loop](../teoria/03-event-loop.md)
- [Teoria - Pattern](../teoria/04-pattern-avanzati.md)
- [Esempi](../esempi/)

## Submission

Crea una directory per ogni esercizio:
```
01-event-logger/
  ├── logger.js
  ├── test.js
  ├── README.md (spiegazione implementazione)
  └── package.json

02-notification-service/
  ├── notification-service.js
  ├── channels/
  │   ├── email.js
  │   ├── sms.js
  │   └── push.js
  ├── test.js
  ├── README.md
  └── package.json

...
```

Buon lavoro! 🚀
