# Package.json in Dettaglio

Il file `package.json` è il cuore di qualsiasi progetto Node.js. Si tratta di un file di configurazione in formato JSON che contiene metadati sul progetto e, cosa più importante, l'elenco delle sue dipendenze. Questo file è essenziale per la condivisione, la distribuzione e la gestione dei progetti Node.js.

## Struttura di Base

Un file `package.json` tipico contiene i seguenti campi principali:

```json
{
  "name": "nome-progetto",
  "version": "1.0.0",
  "description": "Descrizione del progetto",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["keyword1", "keyword2"],
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

## Campi Principali

### Campi Obbligatori

- **name**: Il nome del pacchetto. Deve essere unico se pubblicato su NPM.
- **version**: La versione del pacchetto, seguendo il formato di versionamento semantico (SemVer).

### Campi Informativi

- **description**: Una breve descrizione del progetto.
- **keywords**: Un array di parole chiave che aiutano gli utenti a trovare il pacchetto.
- **author**: Informazioni sull'autore del pacchetto.
- **license**: La licenza sotto cui è distribuito il pacchetto.
- **homepage**: URL della homepage del progetto.
- **repository**: Informazioni sul repository del codice sorgente.

### Campi Funzionali

- **main**: Il punto di ingresso principale del pacchetto (il file che viene caricato quando il pacchetto viene importato).
- **scripts**: Comandi che possono essere eseguiti tramite `npm run`.
- **dependencies**: Pacchetti richiesti per l'esecuzione in produzione.
- **devDependencies**: Pacchetti richiesti solo per lo sviluppo e i test.
- **peerDependencies**: Pacchetti che ci si aspetta siano già installati nell'ambiente host.
- **engines**: Specifica quali versioni di Node.js sono compatibili con il pacchetto.

## Gestione delle Versioni

NPM utilizza il versionamento semantico (SemVer) per gestire le versioni dei pacchetti. Il formato è MAJOR.MINOR.PATCH:

- **MAJOR**: Versione con modifiche incompatibili con le versioni precedenti
- **MINOR**: Versione con nuove funzionalità compatibili con le versioni precedenti
- **PATCH**: Versione con correzioni di bug compatibili con le versioni precedenti

### Prefissi di Versione

Nel file `package.json`, è possibile specificare le versioni dei pacchetti con diversi prefissi:

- **^**: Accetta aggiornamenti che non cambiano la cifra più a sinistra non zero (compatibilità con le versioni precedenti)
  - `^1.2.3` accetta versioni da 1.2.3 a < 2.0.0
  - `^0.2.3` accetta versioni da 0.2.3 a < 0.3.0
  - `^0.0.3` accetta solo la versione 0.0.3

- **~**: Accetta solo aggiornamenti di patch
  - `~1.2.3` accetta versioni da 1.2.3 a < 1.3.0

- **>**, **>=**, **<**, **<=**: Confronti di versione espliciti
  - `>1.2.3` accetta qualsiasi versione maggiore di 1.2.3

- **=**: Versione esatta
  - `=1.2.3` accetta solo la versione 1.2.3

- **1.2.x**: Accetta qualsiasi versione patch nella versione minor 1.2

- **\***: Accetta qualsiasi versione

## package-lock.json

Il file `package-lock.json` è generato automaticamente da NPM quando si installano pacchetti o si modifica il file `package.json`. Questo file "blocca" le versioni esatte di tutte le dipendenze e delle loro dipendenze annidate, garantendo che tutti gli sviluppatori e gli ambienti di produzione utilizzino esattamente le stesse versioni dei pacchetti.
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

## Script NPM

Il campo `scripts` nel file `package.json` permette di definire comandi personalizzati che possono essere eseguiti con `npm run`.

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js",
  "test": "jest",
  "build": "webpack",
  "lint": "eslint ."
}
```

Alcuni script hanno scorciatoie speciali:
- `npm start` invece di `npm run start`
- `npm test` invece di `npm run test`

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


## Esempi Pratici

### Inizializzazione di un Nuovo Progetto

```bash
npm init -y
```

Questo comando crea un file `package.json` con valori predefiniti:

```json
{
  "name": "nome-cartella-corrente",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### Aggiunta di Dipendenze

```bash
npm install express --save
npm install jest --save-dev
```

Dopo questi comandi, il file `package.json` sarà aggiornato:

```json
{
  "name": "nome-cartella-corrente",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.17.1"
  },
  "devDependencies": {
    "jest": "^27.0.6"
  }
}
```

## Conclusione

Il file `package.json` è molto più di un semplice elenco di dipendenze: è la carta d'identità del tuo progetto Node.js. Comprendere a fondo la sua struttura e le sue funzionalità è essenziale per gestire efficacemente i progetti Node.js e sfruttare al meglio l'ecosistema NPM.

---

[Torna all'indice dell'esercitazione](../README.md)