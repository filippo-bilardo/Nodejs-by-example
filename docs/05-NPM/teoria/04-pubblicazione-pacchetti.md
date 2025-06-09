# Pubblicazione di Pacchetti su NPM

Uno degli aspetti più potenti dell'ecosistema Node.js è la possibilità di pubblicare i propri pacchetti su NPM, rendendoli disponibili alla comunità globale di sviluppatori. Questo capitolo esplorerà il processo di creazione, preparazione e pubblicazione di un pacchetto su NPM.

## Preparazione del pacchetto

Prima di pubblicare un pacchetto, è importante assicurarsi che sia ben strutturato e documentato:

### 1. Struttura del progetto

Una struttura di base per un pacchetto NPM potrebbe essere:

```
mio-pacchetto/
├── dist/           # Codice compilato/minificato
├── src/            # Codice sorgente
├── test/           # Test
├── .gitignore      # File da ignorare in git
├── .npmignore      # File da ignorare nella pubblicazione NPM
├── LICENSE         # Licenza
├── README.md       # Documentazione
├── package.json    # Configurazione del pacchetto
└── index.js        # Punto di ingresso
```

### 2. Configurazione del package.json

Assicurati che il tuo `package.json` contenga tutte le informazioni necessarie:

```json
{
  "name": "mio-pacchetto",
  "version": "1.0.0",
  "description": "Descrizione chiara e concisa del pacchetto",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "build": "babel src -d dist"
  },
  "keywords": ["keyword1", "keyword2"],
  "author": "Tuo Nome <tua.email@esempio.com> (https://tuosito.com)",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/mio-pacchetto.git"
  },
  "bugs": {
    "url": "https://github.com/username/mio-pacchetto/issues"
  },
  "homepage": "https://github.com/username/mio-pacchetto#readme"
}
```

### 3. Documentazione

Una buona documentazione è essenziale per l'adozione del tuo pacchetto. Il file README.md dovrebbe includere:

- Descrizione del pacchetto
- Istruzioni di installazione
- Esempi di utilizzo
- API di riferimento
- Informazioni sulla licenza
- Come contribuire

### 4. Test

Assicurati che il tuo pacchetto sia ben testato prima della pubblicazione:

```bash
npm test
```

### 5. Controllo dei file da pubblicare

Puoi controllare quali file verranno pubblicati con:

```bash
npm pack
```

Questo comando crea un file `.tgz` che contiene esattamente ciò che verrà pubblicato su NPM.

## Registrazione su NPM

Per pubblicare pacchetti, devi avere un account NPM:

1. Registrati sul sito [npmjs.com](https://www.npmjs.com/signup)
2. Accedi da terminale:

```bash
npm login
```

Ti verrà chiesto di inserire username, password e indirizzo email.

## Pubblicazione del pacchetto

Una volta che il pacchetto è pronto e hai effettuato l'accesso, puoi pubblicarlo:

```bash
npm publish
```

Se è la prima volta che pubblichi questo pacchetto, verrà creato nel registro NPM. Se stai aggiornando un pacchetto esistente, assicurati di aver incrementato il numero di versione nel `package.json`.

### Pubblicazione di versioni con tag

Puoi pubblicare versioni con tag specifici:

```bash
npm publish --tag beta
```

Questo è utile per versioni beta o di test che non vuoi che siano installate di default.

## Gestione delle versioni

NPM fornisce comandi per gestire facilmente le versioni secondo il Semantic Versioning:

```bash
# Incrementa la versione patch (1.0.0 -> 1.0.1)
npm version patch

# Incrementa la versione minor (1.0.0 -> 1.1.0)
npm version minor

# Incrementa la versione major (1.0.0 -> 2.0.0)
npm version major
```

Questi comandi aggiornano automaticamente il `package.json`, creano un tag git (se il progetto è in un repository git) e preparano il pacchetto per la pubblicazione.

## Aggiornamento di un pacchetto pubblicato

Per aggiornare un pacchetto già pubblicato:

1. Apporta le modifiche necessarie al codice
2. Aggiorna la versione nel `package.json` (manualmente o con `npm version`)
3. Pubblica nuovamente con `npm publish`

## Deprecazione e rimozione di pacchetti

### Deprecazione

Se un pacchetto è obsoleto o non dovrebbe più essere utilizzato, puoi marcarlo come deprecato:

```bash
npm deprecate mio-pacchetto "Questo pacchetto è deprecato, usa nuovo-pacchetto invece"
```

### Rimozione

NPM generalmente scoraggia la rimozione completa dei pacchetti, poiché altri progetti potrebbero dipendere da essi. Tuttavia, in casi eccezionali (come problemi di sicurezza o violazioni di copyright), puoi contattare il supporto NPM per rimuovere un pacchetto.

## Pacchetti privati e organizzazioni

NPM offre la possibilità di creare pacchetti privati attraverso le organizzazioni:

```bash
# Creazione di un pacchetto con scope organizzazione
npm init --scope=@mia-organizzazione

# Pubblicazione di un pacchetto con scope
npm publish --access public
```

I pacchetti con scope hanno nomi nel formato `@organizzazione/nome-pacchetto`.

## Best practices per la pubblicazione

1. **Versionamento semantico**: Segui rigorosamente le regole del SemVer
2. **Changelog**: Mantieni un file CHANGELOG.md che documenta le modifiche tra le versioni
3. **Sicurezza**: Verifica che il tuo pacchetto non contenga vulnerabilità con `npm audit`
4. **Dimensioni**: Mantieni il pacchetto il più leggero possibile, escludendo file non necessari con `.npmignore`
5. **Compatibilità**: Specifica chiaramente le versioni di Node.js supportate nel campo `engines` del `package.json`

```json
"engines": {
  "node": ">=12.0.0"
}
```

## Monitoraggio e manutenzione

Dopo la pubblicazione, è importante monitorare e mantenere il tuo pacchetto:

- Rispondere alle issue su GitHub
- Correggere bug e vulnerabilità di sicurezza
- Aggiornare le dipendenze
- Migliorare la documentazione in base al feedback degli utenti

## Conclusione

La pubblicazione di pacchetti su NPM è un modo potente per contribuire all'ecosistema Node.js e condividere il tuo lavoro con altri sviluppatori. Seguendo le best practices descritte in questo capitolo, puoi creare pacchetti di alta qualità che saranno apprezzati dalla comunità.

Ricorda che la manutenzione di un pacchetto pubblico comporta una certa responsabilità verso gli utenti che dipendono dal tuo codice. Assicurati di essere pronto a dedicare tempo alla manutenzione e al supporto del tuo pacchetto dopo la pubblicazione.