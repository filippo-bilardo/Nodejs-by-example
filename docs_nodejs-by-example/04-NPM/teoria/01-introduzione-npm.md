# Introduzione a NPM

## Cos'è NPM?

NPM (Node Package Manager) è il gestore di pacchetti ufficiale per Node.js. Si tratta di uno strumento fondamentale nell'ecosistema Node.js che consente agli sviluppatori di installare, condividere e gestire le dipendenze dei loro progetti. NPM è composto da tre componenti principali:

1. **Il registro NPM**: un grande database pubblico di pacchetti JavaScript open source
2. **L'interfaccia a riga di comando (CLI)**: uno strumento da terminale per interagire con NPM
3. **Il sito web**: un'interfaccia web per esplorare e cercare pacchetti

## Storia e Evoluzione

NPM è stato creato da Isaac Z. Schlueter nel 2010 come risposta alla necessità di un sistema di gestione dei pacchetti per Node.js. Da allora, è cresciuto fino a diventare il più grande registro di pacchetti software al mondo, con milioni di pacchetti disponibili.

Nel 2020, GitHub (di proprietà di Microsoft) ha acquisito NPM Inc., la società che gestisce il registro NPM, garantendo la continuità e l'investimento nella piattaforma.

## Perché NPM è Importante?

NPM ha rivoluzionato lo sviluppo JavaScript per diversi motivi:

### 1. Riutilizzo del Codice
Invece di "reinventare la ruota", gli sviluppatori possono utilizzare pacchetti esistenti per funzionalità comuni.

### 2. Gestione delle Dipendenze
NPM gestisce automaticamente le dipendenze di un progetto, incluse le dipendenze delle dipendenze (dipendenze annidate).

NPM semplifica l'aggiunta, l'aggiornamento e la rimozione delle dipendenze nei progetti Node.js. Tutte le dipendenze vengono tracciate nel file `package.json`.

```bash
# Installare una dipendenza
npm install nome-pacchetto

# Installare una dipendenza con una versione specifica
npm install nome-pacchetto@1.2.3

# Installare una dipendenza di sviluppo
npm install --save-dev nome-pacchetto

# Rimuovere una dipendenza
npm uninstall nome-pacchetto
```

### 3. Versioning
Supporta il versionamento semantico (SemVer), permettendo agli sviluppatori di specificare quali versioni di un pacchetto sono compatibili con il loro progetto.

### 4. Ecosistema Collaborativo
Facilita la collaborazione tra sviluppatori, permettendo di condividere facilmente codice e librerie.

## Comandi Base di NPM

Ecco alcuni dei comandi più comuni di NPM:

### Inizializzazione di un Progetto

NPM permette di inizializzare rapidamente nuovi progetti Node.js:

```bash
npm init           # Inizializza un nuovo progetto con richieste interattive
npm init -y        # Inizializza un nuovo progetto con valori predefiniti
```

Questo comando avvia un processo interattivo che ti guida nella creazione di un file `package.json`.

### Installazione di Pacchetti
```bash
npm install <pacchetto>             # Installa un pacchetto come dipendenza
npm install <pacchetto> --save-dev  # Installa un pacchetto come dipendenza di sviluppo
npm install -g <pacchetto>          # Installa un pacchetto globalmente
npm install                         # Installa tutte le dipendenze elencate in package.json
```

### Gestione dei Pacchetti
```bash
npm uninstall <pacchetto>          # Rimuove un pacchetto
npm update                         # Aggiorna tutti i pacchetti
npm update <pacchetto>             # Aggiorna un pacchetto specifico
npm list                           # Mostra i pacchetti installati
npm outdated                       # Mostra i pacchetti obsoleti
```

### Pubblicazione di pacchetti

NPM permette di pubblicare i tuoi pacchetti nel registro pubblico:

```bash
npm publish
```

### Esecuzione di Script

NPM consente di definire e eseguire script nel file `package.json`:

```json
{
  "scripts": {
    "start": "node index.js",
    "test": "jest",
    "build": "webpack"
  }
}
```

Puoi eseguire questi script con:

```bash
npm run start
npm test  # Scorciatoia per npm run test
```

## NPM vs Yarn vs pnpm

NPM non è l'unico gestore di pacchetti per Node.js. Altri gestori popolari includono:

### Yarn
Sviluppato da Facebook, Yarn è stato creato per risolvere alcuni problemi di NPM, come la velocità e la sicurezza. Offre funzionalità come l'installazione parallela dei pacchetti e un file di lockfile più deterministico.

### pnpm
Un gestore di pacchetti più recente che utilizza un approccio di archiviazione efficiente, condividendo i pacchetti tra progetti per risparmiare spazio su disco e velocizzare le installazioni.

## Struttura della cartella node_modules

Quando installi pacchetti con NPM, questi vengono scaricati nella cartella `node_modules` del tuo progetto. Questa cartella contiene tutti i pacchetti di cui il tuo progetto dipende, insieme alle loro dipendenze.

È importante notare che la cartella `node_modules` può diventare molto grande e non dovrebbe essere inclusa nel controllo di versione. Per questo motivo, è comune aggiungere `node_modules/` al file `.gitignore`.

## Conclusione

NPM è uno strumento essenziale per qualsiasi sviluppatore Node.js. La sua capacità di gestire le dipendenze, facilitare la condivisione del codice e standardizzare i processi di sviluppo lo rende indispensabile nell'ecosistema JavaScript moderno.

Nei prossimi capitoli, esploreremo in dettaglio il file package.json, la gestione delle dipendenze e altre funzionalità avanzate di NPM.

---

[Torna all'indice dell'esercitazione](../README.md)