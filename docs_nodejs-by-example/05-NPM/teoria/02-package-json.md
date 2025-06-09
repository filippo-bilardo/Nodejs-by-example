# Gestione del package.json

Il file `package.json` è il cuore di qualsiasi progetto Node.js. Questo file contiene metadati sul progetto e, cosa più importante, gestisce le dipendenze e gli script. Comprendere come configurare e utilizzare correttamente il `package.json` è fondamentale per lo sviluppo efficace con Node.js.

## Anatomia del package.json

Un tipico file `package.json` contiene i seguenti campi:

```json
{
  "name": "nome-progetto",
  "version": "1.0.0",
  "description": "Descrizione del progetto",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js"
  },
  "keywords": ["node", "esempio"],
  "author": "Nome Autore <email@esempio.com>",
  "license": "MIT",
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "nodemon": "^2.0.7"
  }
}
```

### Campi principali

#### Campi obbligatori

- **name**: Il nome del pacchetto (deve essere unico se pubblicato su NPM)
- **version**: La versione del pacchetto (segue il formato Semantic Versioning)

#### Campi informativi

- **description**: Una breve descrizione del progetto
- **keywords**: Array di parole chiave per aiutare la ricerca
- **author**: Informazioni sull'autore
- **license**: La licenza sotto cui è distribuito il progetto
- **homepage**: URL della homepage del progetto
- **repository**: Informazioni sul repository del codice sorgente

#### Campi funzionali

- **main**: Il punto di ingresso principale del pacchetto
- **scripts**: Comandi che possono essere eseguiti con `npm run`
- **dependencies**: Pacchetti richiesti in produzione
- **devDependencies**: Pacchetti richiesti solo in fase di sviluppo
- **peerDependencies**: Pacchetti che si prevede siano forniti dall'ambiente o dall'applicazione host
- **engines**: Versioni di Node.js e NPM compatibili

## Creazione del package.json

Ci sono due modi principali per creare un file `package.json`:

### 1. Creazione interattiva

```bash
npm init
```

Questo comando avvia un processo interattivo che ti guida nella creazione del file, ponendo domande sui vari campi.

### 2. Creazione con valori predefiniti

```bash
npm init -y
```

Questo comando crea un file `package.json` con valori predefiniti, senza fare domande.

## Gestione degli script

Il campo `scripts` nel `package.json` è uno degli aspetti più potenti di NPM. Permette di definire comandi personalizzati che possono essere eseguiti con `npm run`.

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
  "test": "jest",
  "build": "webpack --mode production",
  "lint": "eslint ."
}
```

Per eseguire questi script:

```bash
npm run start  # o semplicemente npm start per alcuni script predefiniti
npm run dev
npm run test   # o semplicemente npm test
```

### Script predefiniti

Alcuni nomi di script hanno scorciatoie predefinite:

- `npm start` invece di `npm run start`
- `npm test` invece di `npm run test`
- `npm stop` invece di `npm run stop`
- `npm restart` invece di `npm run restart`

### Script composti

Puoi creare script che eseguono più comandi in sequenza:

```json
"scripts": {
  "build": "npm run clean && npm run compile",
  "clean": "rimraf dist",
  "compile": "tsc"
}
```

## Personalizzazione del package.json

### Private

Se non intendi pubblicare il tuo pacchetto su NPM, puoi impostare il campo `private` su `true`:

```json
{
  "private": true
}
```

Questo impedisce la pubblicazione accidentale del pacchetto.

### Bin

Se il tuo pacchetto fornisce comandi da riga di comando, puoi definirli nel campo `bin`:

```json
{
  "bin": {
    "comando": "./bin/comando.js"
  }
}
```

### Files

Puoi specificare quali file includere quando il pacchetto viene pubblicato:

```json
{
  "files": ["dist", "README.md"]
}
```

## Configurazione per diversi ambienti

Puoi definire configurazioni specifiche per diversi ambienti utilizzando il campo `config`:

```json
{
  "config": {
    "port": "8080"
  }
}
```

Questi valori sono accessibili nel codice tramite `process.env.npm_package_config_port`.

## Browser vs Node.js

Se il tuo pacchetto può essere utilizzato sia in Node.js che nel browser, puoi specificare punti di ingresso diversi:

```json
{
  "main": "dist/index.js",      // Per Node.js
  "browser": "dist/index.browser.js"  // Per browser
}
```

## Moduli ES

Per supportare i moduli ES in Node.js, puoi utilizzare il campo `type`:

```json
{
  "type": "module"  // Abilita i moduli ES di default
}
```

Puoi anche specificare un punto di ingresso per i moduli ES:

```json
{
  "main": "dist/index.js",    // CommonJS
  "module": "dist/index.mjs"  // ES Module
}
```

## Conclusione

Il file `package.json` è molto più di un semplice elenco di dipendenze. È uno strumento potente per configurare, documentare e gestire il tuo progetto Node.js. Una buona comprensione di come utilizzare efficacemente il `package.json` ti aiuterà a creare progetti più organizzati e manutenibili.

Nel prossimo capitolo, esploreremo in dettaglio la gestione delle dipendenze e il sistema di versionamento semantico utilizzato da NPM.