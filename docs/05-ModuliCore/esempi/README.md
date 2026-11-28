# Esempi Pratici - Moduli Core Node.js

Questa cartella contiene esempi pratici completi per ogni modulo core di Node.js trattato nel corso.

## 🚀 Quick Start

Tutti i file sono eseguibili direttamente:

```bash
# Esempi base
./path-demo.js
./os-demo.js
./url-demo.js
./util-demo.js
./events-demo.js

# Esempi avanzati
./path-exercise.js
./monitor-risorse.js
./chat-system.js
```

## 📁 Descrizione Files

### File Base (Dimostrazioni)
- **`path-demo.js`** - Utilizzo base del modulo path
- **`os-demo.js`** - Informazioni sistema operativo
- **`url-demo.js`** - Parsing e manipolazione URL
- **`util-demo.js`** - Utilità per debugging e conversioni
- **`events-demo.js`** - EventEmitter base
- **`fs-demo.js`** - Operazioni file system
- **`http-demo.js`** - Server HTTP semplice

### File Avanzati (Progetti Completi)

#### 📊 `monitor-risorse.js`
**Sistema di Monitoraggio Risorse Completo**
```bash
./monitor-risorse.js
```
- Monitora CPU, memoria, carico sistema
- Eventi per soglie critiche
- Salvataggio statistiche su file
- Dashboard tempo reale
- Gestione graceful shutdown

#### 💬 `chat-system.js`  
**Sistema Chat Real-time con EventEmitter**
```bash
./chat-system.js
```
- Chat multi-stanza con utenti
- Messaggi pubblici e privati
- Eventi real-time
- Gestione connessioni/disconnessioni
- Statistiche e logging

#### 🔧 `path-exercise.js`
**Utilities Avanzate Path e URL**
```bash
./path-exercise.js
```
- Generazione percorsi log con timestamp
- Estrazione domini da URL
- Normalizzazione percorsi cross-platform
- Validazione e sanitizzazione

## 🎯 Esercizi Interattivi

### 1. Personalizza il Monitor Risorse
Modifica `monitor-risorse.js` per:
- Aggiungere notifiche email/webhook
- Monitorare spazio disco
- Creare grafici delle statistiche
- Implementare soglie dinamiche

### 2. Estendi il Sistema Chat
Migliora `chat-system.js` con:
- Persistenza messaggi su file/database
- Comandi speciali (/help, /list, etc.)
- Moderazione automatica
- Bot con AI

### 3. Crea un File Manager
Usa i moduli appresi per creare:
- Browser file web-based
- Sincronizzazione directory
- Backup automatico
- Compressione file

## 🐛 Debugging

Per vedere tutti gli eventi in dettaglio:
```bash
# Abilita debug verbose
DEBUG=* ./chat-system.js

# Oppure usa console dettagliato
node --inspect ./monitor-risorse.js
```

## 📋 Checklist Apprendimento

Dopo aver completato tutti gli esempi, dovresti saper:

- ✅ Creare percorsi cross-platform con `path`
- ✅ Ottenere informazioni sistema con `os`  
- ✅ Manipolare URL con parsing avanzato
- ✅ Convertire callback in Promise con `util.promisify`
- ✅ Implementare architetture event-driven
- ✅ Gestire file system in modo asincrono
- ✅ Creare server HTTP con routing personalizzato
- ✅ Implementare sistemi di monitoraggio
- ✅ Debugging avanzato con `util.inspect`

## 🔗 Link Utili

- [Node.js API Docs](https://nodejs.org/docs/latest/api/)
- [EventEmitter Pattern](https://nodejs.org/api/events.html#events_class_eventemitter)
- [File System Best Practices](https://nodejs.dev/learn/working-with-folders-in-nodejs)
- [HTTP Module Deep Dive](https://nodejs.dev/learn/build-an-http-server)

---
💡 **Suggerimento**: Prova a modificare gli esempi per comprendere meglio il funzionamento dei moduli!