# Esercitazione 5: NPM (Node Package Manager)

## Panoramica
In questa esercitazione esploreremo NPM (Node Package Manager), lo strumento standard per la gestione dei pacchetti in Node.js. NPM è fondamentale per installare, condividere e gestire le dipendenze nei progetti Node.js, permettendo di riutilizzare codice e integrare facilmente librerie di terze parti.

## Obiettivi
- Comprendere il funzionamento di NPM e la sua importanza nell'ecosistema Node.js
- Imparare a inizializzare un progetto con package.json
- Gestire dipendenze e script di progetto
- Utilizzare pacchetti di terze parti in modo efficace
- Pubblicare e condividere i propri pacchetti

## Argomenti Teorici Collegati
- [Introduzione a NPM](./teoria/01-introduzione-npm.md)
- [Gestione del package.json](./teoria/02-package-json.md)
- [Gestione delle Dipendenze](./teoria/03-gestione-dipendenze.md)
- [Pubblicazione di Pacchetti](./teoria/04-pubblicazione-pacchetti.md)

## Esercizi Pratici

### Esercizio 5.1: Inizializzazione di un Progetto

```bash
# Creazione di una directory per il progetto
mkdir progetto-npm
cd progetto-npm

# Inizializzazione del progetto con npm
npm init
```

Dopo aver eseguito `npm init`, risponderai a una serie di domande per configurare il tuo package.json:

```json
// package.json generato
{
  "name": "progetto-npm",
  "version": "1.0.0",
  "description": "Un progetto di esempio per imparare NPM",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js"
  },
  "author": "Il tuo nome",
  "license": "MIT"
}
```

Creiamo un semplice file index.js:

```javascript
// index.js
console.log('Benvenuto nel progetto NPM!');
```

Eseguiamo il progetto:

```bash
npm start
```

### Esercizio 5.2: Installazione e Utilizzo di Pacchetti

```bash
# Installazione di un pacchetto come dipendenza
npm install lodash

# Installazione di un pacchetto come dipendenza di sviluppo
npm install --save-dev nodemon
```

Modifichiamo il package.json per utilizzare nodemon:

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

Utilizziamo lodash nel nostro codice:

```javascript
// index.js
const _ = require('lodash');

const numeri = [1, 2, 3, 4, 5];
const somma = _.sum(numeri);

console.log(`La somma dei numeri è: ${somma}`);
console.log(`Numeri ordinati in modo casuale: ${_.shuffle(numeri)}`);
```

Eseguiamo in modalità sviluppo:

```bash
npm run dev
```

### Esercizio 5.3: Creazione di un Pacchetto Personalizzato

Creiamo un nuovo progetto per il nostro pacchetto:

```bash
mkdir mio-pacchetto
cd mio-pacchetto
npm init
```

Implementiamo una semplice libreria di utilità:

```javascript
// index.js
function formattaData(data) {
  const giorno = data.getDate().toString().padStart(2, '0');
  const mese = (data.getMonth() + 1).toString().padStart(2, '0');
  const anno = data.getFullYear();
  return `${giorno}/${mese}/${anno}`;
}

function generaIdCasuale(lunghezza = 8) {
  return Math.random().toString(36).substring(2, 2 + lunghezza);
}

function capitalizza(stringa) {
  return stringa.charAt(0).toUpperCase() + stringa.slice(1).toLowerCase();
}

module.exports = {
  formattaData,
  generaIdCasuale,
  capitalizza
};
```

Creiamo un file README.md per il nostro pacchetto:

```markdown
# Mio Pacchetto

Una semplice libreria di utilità per la manipolazione di stringhe e date.

## Installazione

```bash
npm install mio-pacchetto
```

## Utilizzo

```javascript
const utils = require('mio-pacchetto');

// Formattare una data
const oggi = new Date();
console.log(utils.formattaData(oggi)); // Output: DD/MM/YYYY

// Generare un ID casuale
console.log(utils.generaIdCasuale()); // Output: stringa casuale di 8 caratteri

// Capitalizzare una stringa
console.log(utils.capitalizza('ciao mondo')); // Output: Ciao mondo
```

## Licenza

MIT
```

Aggiorniamo il package.json:

```json
{
  "name": "mio-pacchetto",
  "version": "1.0.0",
  "description": "Una semplice libreria di utilità per la manipolazione di stringhe e date",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["utilità", "formattazione", "date", "stringhe"],
  "author": "Il tuo nome",
  "license": "MIT"
}
```

### Esercizio 5.4: Gestione delle Versioni e Dipendenze

Creiamo un nuovo progetto che utilizza diverse dipendenze:

```bash
mkdir gestione-dipendenze
cd gestione-dipendenze
npm init -y
```

Installiamo diverse dipendenze con vincoli di versione specifici:

```bash
# Dipendenza esatta
npm install express@4.17.1

# Dipendenza con versione minima
npm install lodash@^4.17.0

# Dipendenza di sviluppo
npm install --save-dev jest
```

Il package.json risultante:

```json
{
  "name": "gestione-dipendenze",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "start": "node index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "4.17.1",
    "lodash": "^4.17.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

Creiamo un semplice server Express:

```javascript
// index.js
const express = require('express');
const _ = require('lodash');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const numeri = [1, 2, 3, 4, 5];
  const numeriMescolati = _.shuffle(numeri);
  
  res.send(`
    <h1>Gestione Dipendenze in NPM</h1>
    <p>Numeri originali: ${numeri.join(', ')}</p>
    <p>Numeri mescolati: ${numeriMescolati.join(', ')}</p>
  `);
});

app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});
```

Creiamo un semplice test con Jest:

```javascript
// test/shuffle.test.js
const _ = require('lodash');

test('La funzione shuffle restituisce un array con gli stessi elementi', () => {
  const array = [1, 2, 3, 4, 5];
  const shuffled = _.shuffle(array);
  
  expect(shuffled).toHaveLength(array.length);
  expect(shuffled.sort()).toEqual(array.sort());
});
```

Aggiorniamo gli script nel package.json:

```json
"scripts": {
  "test": "jest",
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

## Sfide Aggiuntive

1. **Creazione di un CLI Tool**: Crea un pacchetto NPM che fornisce uno strumento da riga di comando.

2. **Gestione di Monorepo**: Utilizza Lerna o Workspaces per gestire un repository con più pacchetti correlati.

3. **Pubblicazione su NPM**: Segui i passaggi per pubblicare un pacchetto su NPM (puoi usare un registro privato o simulare il processo).

## Risorse Aggiuntive

- [Documentazione ufficiale di NPM](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [Creazione di pacchetti Node.js](https://docs.npmjs.com/creating-node-js-modules)
- [NPM CLI Commands](https://docs.npmjs.com/cli/v8/commands)

## Navigazione del Corso

- [Indice del Corso](../README.md)
- [Modulo Precedente: Moduli Personalizzati](../04-ModuliPersonalizzati/README.md)
- [Modulo Successivo: Server Web](../06-ServerWeb/README.md)