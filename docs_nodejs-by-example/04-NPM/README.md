# Esercitazione 3: NPM e Gestione Pacchetti

Questa esercitazione ti introdurrà a NPM (Node Package Manager), lo strumento standard per la gestione dei pacchetti in Node.js. Imparerai come installare, gestire e pubblicare pacchetti, oltre a comprendere l'importanza del file package.json per la gestione delle dipendenze dei tuoi progetti.

## Obiettivi

- Comprendere il ruolo di NPM nell'ecosistema Node.js
- Imparare a utilizzare i comandi principali di NPM
- Creare e gestire un file package.json
- Installare e utilizzare pacchetti di terze parti
- Comprendere la differenza tra dipendenze di produzione e di sviluppo

## Esercizi Pratici

### Esercizio 3.1: Inizializzazione di un Progetto
1. Crea una nuova cartella per il tuo progetto e aprila nel terminale
2. Inizializza un nuovo progetto Node.js con il comando:

```bash
npm init
```

3. Segui le istruzioni interattive per creare il file package.json
4. In alternativa, puoi usare il comando non interattivo:

```bash
npm init -y
```

5. Esamina il file package.json creato

### Esercizio 3.2: Installazione di Pacchetti
1. Installa un pacchetto come dipendenza di produzione:

```bash
npm install express
```

2. Installa un pacchetto come dipendenza di sviluppo:

```bash
npm install nodemon --save-dev
```

3. Installa un pacchetto globalmente (richiede permessi amministrativi):

```bash
npm install -g http-server
```

4. Verifica le modifiche al file package.json e la creazione della cartella node_modules

### Esercizio 3.3: Utilizzo di un Pacchetto Installato
1. Crea un file chiamato `app.js` con il seguente contenuto:

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World con Express!');
});

app.listen(port, () => {
  console.log(`Applicazione di esempio in ascolto su http://localhost:${port}`);
});
```

2. Esegui l'applicazione:

```bash
node app.js
```

3. Visita `http://localhost:3000` nel tuo browser

### Esercizio 3.4: Utilizzo di Script NPM
1. Modifica il file package.json per aggiungere alcuni script utili:

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

2. Esegui l'applicazione utilizzando gli script:

```bash
npm start
```

3. Esegui l'applicazione in modalità sviluppo (con riavvio automatico):

```bash
npm run dev
```

### Esercizio 3.5: Gestione delle Versioni
1. Esamina le versioni delle dipendenze nel file package.json
2. Comprendi il versionamento semantico (SemVer): MAJOR.MINOR.PATCH
3. Sperimenta con i diversi prefissi di versione (^, ~, >, >=, etc.)
4. Aggiorna tutti i pacchetti all'ultima versione:

```bash
npm update
```

## Sfida Aggiuntiva
Crea un'applicazione web semplice utilizzando almeno 3 pacchetti npm diversi. L'applicazione potrebbe essere, ad esempio, un semplice blog o una lista di cose da fare. Assicurati di:

1. Inizializzare correttamente il progetto con npm init
2. Installare e utilizzare i pacchetti necessari
3. Configurare script npm utili
4. Documentare le dipendenze e come avviare l'applicazione

```javascript
// Esempio di app.js per un'applicazione TODO list
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan'); // Logger per le richieste HTTP

const app = express();
const port = 3000;

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Dati di esempio
let todos = [
  { id: 1, text: 'Imparare Node.js', completed: false },
  { id: 2, text: 'Studiare NPM', completed: true }
];

// Implementa le route per la gestione dei TODO
// ...

app.listen(port, () => {
  console.log(`TODO app in ascolto su http://localhost:${port}`);
});
```

## Argomenti Teorici Collegati

- [1. Introduzione a NPM](./teoria/01-introduzione-npm.md)
- [2. Package.json in Dettaglio](./teoria/02-package-json.md)
- [3. Gestione Dipendenze](./teoria/03-gestione-dipendenze.md)
- [4. Pubblicazione Pacchetti](./teoria/04-pubblicazione-pacchetti.md)
- [5. Sicurezza e Audit](./teoria/05-sicurezza-audit.md)

## Risorse Aggiuntive

- [Documentazione ufficiale di NPM](https://docs.npmjs.com/)
- [Guida a package.json](https://docs.npmjs.com/cli/v7/configuring-npm/package-json)
- [NPM Cheat Sheet](https://www.freecodecamp.org/news/npm-cheat-sheet-most-common-commands-and-nvm/)
- [Semantic Versioning](https://semver.org/)
- [Creazione di pacchetti Node.js](https://docs.npmjs.com/creating-node-js-modules)
- [NPM CLI Commands](https://docs.npmjs.com/cli/v8/commands)

## Navigazione del Corso

- [Indice del Corso](../README.md)
- Modulo Precedente: [Moduli Core](../02-ModuliCore/README.md)
- Modulo Successivo: [Socket](../04-Socket/README.md)