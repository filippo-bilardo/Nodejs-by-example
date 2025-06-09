# Sistema di Moduli in Node.js

## Introduzione

Il sistema di moduli è una delle caratteristiche fondamentali di Node.js che permette di organizzare il codice in unità separate e riutilizzabili. Questo approccio modulare facilita la manutenzione, il testing e la collaborazione tra sviluppatori.

## CommonJS

Node.js utilizza il sistema di moduli CommonJS, che è stato sviluppato per ambienti server-side. Le caratteristiche principali includono:

- Caricamento sincrono dei moduli
- Esecuzione in un contesto isolato
- Caching dei moduli dopo il primo caricamento
- Risoluzione dei percorsi relativi e assoluti

## Importare Moduli

Per utilizzare un modulo in Node.js, si usa la funzione `require()`:

```javascript
// Importare un modulo core
const fs = require('fs');

// Importare un modulo locale
const mieiUtility = require('./utility');

// Importare un modulo npm installato
const express = require('express');
```

## Esportare Moduli

Per rendere disponibili funzionalità di un modulo ad altri file, si utilizza `module.exports` o `exports`:

```javascript
// utility.js
function somma(a, b) {
  return a + b;
}

function sottrazione(a, b) {
  return a - b;
}

// Esportare singole funzioni
exports.somma = somma;
exports.sottrazione = sottrazione;

// Oppure esportare un oggetto completo
module.exports = {
  somma,
  sottrazione
};
```

## Differenza tra `exports` e `module.exports`

`exports` è un riferimento all'oggetto `module.exports`. Quando si assegna direttamente a `exports`, si perde questo riferimento:

```javascript
// Questo funziona
exports.nome = 'Mario';

// Questo NON funziona (sovrascrive il riferimento)
exports = { nome: 'Mario' };

// Questo funziona sempre
module.exports = { nome: 'Mario' };
```

## Tipi di Moduli

### 1. Moduli Core

Sono i moduli integrati in Node.js, come `fs`, `http`, `path`, ecc. Non richiedono installazione.

### 2. Moduli Locali

Sono i moduli creati dallo sviluppatore per l'applicazione specifica.

### 3. Moduli di Terze Parti

Sono i moduli installati tramite npm (Node Package Manager).

## Risoluzione dei Percorsi

Quando si utilizza `require()`, Node.js segue un algoritmo specifico per trovare il modulo:

1. Se il modulo inizia con `/`, è un percorso assoluto
2. Se inizia con `./` o `../`, è un percorso relativo
3. Altrimenti, Node.js cerca nei moduli core o nella cartella `node_modules`

## Caching dei Moduli

I moduli vengono caricati e compilati solo la prima volta che vengono richiesti. Le successive chiamate a `require()` restituiscono la versione in cache:

```javascript
const modulo1 = require('./mioModulo');
const modulo2 = require('./mioModulo');

// modulo1 e modulo2 fanno riferimento allo stesso oggetto in memoria
console.log(modulo1 === modulo2); // true
```

## ES Modules in Node.js

Dalle versioni più recenti, Node.js supporta anche i moduli ES (ECMAScript), che utilizzano la sintassi `import` e `export`:

```javascript
// Importare
import fs from 'fs';
import { somma } from './utility.js';

// Esportare
export function somma(a, b) {
  return a + b;
}

export default class Calcolatrice {
  // ...
}
```

Per utilizzare i moduli ES in Node.js, è necessario:
- Utilizzare l'estensione `.mjs` per i file
- Oppure impostare `"type": "module"` nel `package.json`

## Conclusione

Il sistema di moduli di Node.js è fondamentale per creare applicazioni scalabili e manutenibili. Comprendere come funziona la gestione dei moduli è essenziale per qualsiasi sviluppatore Node.js.