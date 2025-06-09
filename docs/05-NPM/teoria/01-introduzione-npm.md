# Introduzione a NPM (Node Package Manager)

NPM (Node Package Manager) è il gestore di pacchetti predefinito per l'ambiente di runtime JavaScript Node.js. È uno strumento fondamentale nell'ecosistema Node.js che consente agli sviluppatori di installare, condividere e gestire le dipendenze dei loro progetti.

## Cos'è NPM?

NPM è composto da tre componenti principali:

1. **Il registro NPM**: Un grande database pubblico di pacchetti JavaScript open source
2. **L'interfaccia a riga di comando (CLI)**: Uno strumento da terminale per interagire con NPM
3. **Il sito web**: Un'interfaccia web per esplorare e cercare pacchetti [npmjs.com](https://npmjs.com)

NPM viene installato automaticamente con Node.js, quindi se hai già Node.js sul tuo sistema, hai anche NPM.

## Verifica dell'installazione

Per verificare che NPM sia installato correttamente, puoi eseguire:

```bash
npm --version
```

Questo comando mostrerà la versione di NPM installata sul tuo sistema.

## Funzionalità principali di NPM

### 1. Gestione delle dipendenze

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

### 2. Inizializzazione di progetti

NPM permette di inizializzare rapidamente nuovi progetti Node.js:

```bash
npm init
```

Questo comando avvia un processo interattivo che ti guida nella creazione di un file `package.json`. Per accettare tutte le impostazioni predefinite, puoi usare:

```bash
npm init -y
```

### 3. Esecuzione di script

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

### 4. Pubblicazione di pacchetti

NPM permette di pubblicare i tuoi pacchetti nel registro pubblico:

```bash
npm publish
```

## Struttura della cartella node_modules

Quando installi pacchetti con NPM, questi vengono scaricati nella cartella `node_modules` del tuo progetto. Questa cartella contiene tutti i pacchetti di cui il tuo progetto dipende, insieme alle loro dipendenze.

È importante notare che la cartella `node_modules` può diventare molto grande e non dovrebbe essere inclusa nel controllo di versione. Per questo motivo, è comune aggiungere `node_modules/` al file `.gitignore`.

## NPM vs Yarn vs pnpm

Oltre a NPM, esistono altri gestori di pacchetti per Node.js:

- **Yarn**: Sviluppato da Facebook, offre prestazioni migliori e alcune funzionalità aggiuntive
- **pnpm**: Un gestore di pacchetti più efficiente in termini di spazio su disco

Tutti questi strumenti condividono funzionalità simili ma hanno approcci leggermente diversi alla gestione delle dipendenze.

## Comandi NPM comuni

| Comando | Descrizione |
|---------|-------------|
| `npm init` | Inizializza un nuovo progetto |
| `npm install` | Installa tutte le dipendenze elencate nel package.json |
| `npm install <pacchetto>` | Installa un pacchetto specifico |
| `npm install --save-dev <pacchetto>` | Installa un pacchetto come dipendenza di sviluppo |
| `npm uninstall <pacchetto>` | Rimuove un pacchetto |
| `npm update` | Aggiorna tutti i pacchetti |
| `npm update <pacchetto>` | Aggiorna un pacchetto specifico |
| `npm run <script>` | Esegue uno script definito nel package.json |
| `npm list` | Elenca i pacchetti installati |
| `npm search <termine>` | Cerca pacchetti nel registro NPM |
| `npm publish` | Pubblica il pacchetto nel registro NPM |

## Conclusione

NPM è uno strumento essenziale per qualsiasi sviluppatore Node.js. Semplifica enormemente la gestione delle dipendenze e l'organizzazione dei progetti. Comprendere come utilizzare NPM in modo efficace è fondamentale per lo sviluppo di applicazioni Node.js moderne.

Nei prossimi capitoli, esploreremo in dettaglio il file `package.json`, la gestione delle dipendenze e come pubblicare i tuoi pacchetti su NPM.