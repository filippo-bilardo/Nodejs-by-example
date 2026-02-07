# Pubblicazione di Pacchetti su NPM

Uno degli aspetti più potenti dell'ecosistema Node.js è la possibilità di condividere il proprio codice con la comunità attraverso NPM. Pubblicare un pacchetto su NPM permette ad altri sviluppatori di utilizzare facilmente le tue librerie, componenti o strumenti, contribuendo alla crescita dell'ecosistema JavaScript.

## Preparazione di un Pacchetto per la Pubblicazione

### 1. Struttura del Progetto

Un pacchetto NPM ben strutturato dovrebbe includere:

- **File package.json**: Configurato correttamente con tutte le informazioni necessarie
- **File README.md**: Documentazione chiara su come installare e utilizzare il pacchetto
- **File di licenza**: Generalmente LICENSE.md o LICENSE.txt
- **Codice sorgente**: Organizzato in modo logico, tipicamente in una cartella `src` o `lib`
- **Test**: Test automatizzati per verificare la funzionalità del pacchetto

### 2. Configurazione del package.json

Per la pubblicazione, alcuni campi del file package.json sono particolarmente importanti:

```json
{
  "name": "nome-pacchetto",
  "version": "1.0.0",
  "description": "Descrizione chiara e concisa del pacchetto",
  "main": "index.js",
  "files": ["dist", "lib", "index.js"],
  "keywords": ["keyword1", "keyword2"],
  "author": "Nome Autore <email@esempio.com> (https://sito-autore.com)",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/username/nome-pacchetto.git"
  },
  "bugs": {
    "url": "https://github.com/username/nome-pacchetto/issues"
  },
  "homepage": "https://github.com/username/nome-pacchetto#readme"
}
```

Campi particolarmente rilevanti:

- **name**: Deve essere unico nel registro NPM e rispettare le convenzioni di denominazione
- **version**: Deve seguire il versionamento semantico (SemVer)
- **files**: Specifica quali file includere nel pacchetto pubblicato (se omesso, NPM utilizza il file .npmignore o .gitignore)
- **main**: Il punto di ingresso principale del pacchetto
- **repository**: Informazioni sul repository del codice sorgente

### 3. Creazione di un Account NPM

Per pubblicare pacchetti, è necessario creare un account sul sito di NPM (https://www.npmjs.com/) e autenticarsi tramite la CLI:

```bash
npm adduser
# oppure
npm login
```

## Processo di Pubblicazione

### 1. Verifica del Pacchetto

Prima di pubblicare, è consigliabile verificare quali file verranno inclusi nel pacchetto:

```bash
npm pack
```

Questo comando crea un file .tgz che contiene esattamente ciò che verrà pubblicato su NPM, senza effettivamente pubblicarlo.

### 2. Pubblicazione

Una volta pronti, la pubblicazione è semplice:

```bash
npm publish
```

Se è la prima volta che pubblichi questo pacchetto, verrà creato nel registro NPM. Se stai aggiornando un pacchetto esistente, assicurati di aver incrementato il numero di versione nel file package.json.

### 3. Pubblicazione di Versioni con Tag

È possibile pubblicare versioni con tag specifici:

```bash
npm publish --tag beta
```

Questo è utile per versioni beta, alpha o release candidate che non dovrebbero essere installate automaticamente come versione predefinita.

## Gestione delle Versioni

### Incremento della Versione

NPM fornisce comandi per incrementare automaticamente la versione nel file package.json:

```bash
npm version patch  # Incrementa la versione PATCH (1.0.0 -> 1.0.1)
npm version minor  # Incrementa la versione MINOR (1.0.0 -> 1.1.0)
npm version major  # Incrementa la versione MAJOR (1.0.0 -> 2.0.0)
```

Questi comandi creano anche automaticamente un commit Git e un tag se il progetto è in un repository Git.

### Deprecazione di Versioni

Se una versione del tuo pacchetto contiene bug o problemi di sicurezza, puoi marcarla come deprecata:

```bash
npm deprecate nome-pacchetto@"< 1.0.3" "Vulnerabilità di sicurezza critica, aggiornare alla versione 1.0.3 o successiva"
```

### Rimozione di un Pacchetto

In circostanze eccezionali, è possibile rimuovere un pacchetto entro 72 ore dalla pubblicazione:

```bash
npm unpublish nome-pacchetto --force
```

Dopo 72 ore, è possibile solo deprecare il pacchetto, non rimuoverlo completamente.

## Pacchetti Privati e Scoped

### Pacchetti Scoped

I pacchetti scoped sono associati a un utente o un'organizzazione e hanno un nome nel formato `@scope/nome-pacchetto`:

```json
{
  "name": "@mia-organizzazione/mio-pacchetto"
}
```

Per pubblicare un pacchetto scoped:

```bash
npm publish --access public
```

Se ometti `--access public`, il pacchetto sarà pubblicato come privato (richiede un abbonamento a pagamento).

### Pacchetti Privati

NPM offre la possibilità di pubblicare pacchetti privati, visibili solo a te o alla tua organizzazione. Questo richiede un abbonamento a pagamento a NPM.

## Buone Pratiche per la Pubblicazione

### 1. Documentazione Chiara

Un buon README.md dovrebbe includere:
- Descrizione del pacchetto
- Istruzioni di installazione
- Esempi di utilizzo
- API di riferimento
- Informazioni sulla licenza
- Come contribuire

### 2. Test Automatizzati

Assicurati che il tuo pacchetto includa test automatizzati per verificare che funzioni come previsto.

### 3. Versionamento Semantico

Segui rigorosamente il versionamento semantico (SemVer) per rendere chiaro agli utenti quali aggiornamenti sono sicuri da installare.

### 4. Changelog

Mantieni un file CHANGELOG.md che documenti le modifiche in ogni versione.

### 5. Continuous Integration

Utilizza strumenti di CI/CD per automatizzare i test e la pubblicazione.

## Conclusione

La pubblicazione di pacchetti su NPM è un modo potente per contribuire all'ecosistema JavaScript e condividere il tuo lavoro con altri sviluppatori. Seguendo le buone pratiche e comprendendo il processo di pubblicazione, puoi creare pacchetti di alta qualità che saranno apprezzati dalla comunità.

---

[Torna all'indice dell'esercitazione](../README.md)