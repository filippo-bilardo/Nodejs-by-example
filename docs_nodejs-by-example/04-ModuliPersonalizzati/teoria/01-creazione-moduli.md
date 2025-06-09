# Creazione di Moduli Personalizzati in Node.js

## Introduzione

I moduli sono un elemento fondamentale dell'architettura di Node.js. Essi permettono di organizzare il codice in unità logiche separate, facilitando la manutenzione, il riutilizzo e la collaborazione tra sviluppatori. In questa guida, esploreremo come creare moduli personalizzati in Node.js.

## Cos'è un Modulo in Node.js?

Un modulo in Node.js è semplicemente un file JavaScript che contiene codice riutilizzabile. Node.js utilizza il sistema di moduli CommonJS, che permette di incapsulare funzionalità correlate e di esportarle per l'uso in altre parti dell'applicazione.

## Struttura Base di un Modulo

Un modulo Node.js tipicamente segue questa struttura:

1. **Dichiarazione delle dipendenze**: Import di altri moduli necessari
2. **Implementazione della funzionalità**: Definizione di funzioni, classi, variabili
3. **Esportazione dell'interfaccia pubblica**: Esposizione delle funzionalità che si vogliono rendere disponibili

## Creazione di un Modulo Base

Ecco come creare un semplice modulo:

```javascript
// utils.js - Un modulo di utilità

// 1. Dichiarazione delle dipendenze (se necessarie)
const path = require('path');

// 2. Implementazione della funzionalità
function somma(a, b) {
  return a + b;
}

function sottrazione(a, b) {
  return a - b;
}

function moltiplicazione(a, b) {
  return a * b;
}

function divisione(a, b) {
  if (b === 0) {
    throw new Error('Divisione per zero non consentita');
  }
  return a / b;
}

// 3. Esportazione dell'interfaccia pubblica
module.exports = {
  somma,
  sottrazione,
  moltiplicazione,
  divisione
};
```

## Utilizzo di un Modulo

Per utilizzare un modulo personalizzato, si usa la funzione `require()` di Node.js:

```javascript
// app.js - File che utilizza il modulo utils.js
const utils = require('./utils');

console.log('Somma:', utils.somma(5, 3));
console.log('Sottrazione:', utils.sottrazione(10, 4));
console.log('Moltiplicazione:', utils.moltiplicazione(3, 6));
console.log('Divisione:', utils.divisione(15, 3));

// Gestione degli errori
try {
  console.log('Divisione per zero:', utils.divisione(10, 0));
} catch (err) {
  console.error('Errore:', err.message);
}
```

## L'Oggetto `module.exports`

In Node.js, ogni file ha accesso a un oggetto speciale chiamato `module`. Questo oggetto contiene una proprietà `exports` che inizialmente è un oggetto vuoto. Tutto ciò che viene assegnato a `module.exports` sarà disponibile quando il modulo viene importato con `require()`.

### Metodi di Esportazione

Esistono diversi modi per esportare funzionalità da un modulo:

1. **Esportazione di un oggetto con proprietà**:

```javascript
module.exports = {
  funzione1: function() { /* ... */ },
  funzione2: function() { /* ... */ },
  costante: 42
};
```

2. **Esportazione di una singola funzione o classe**:

```javascript
module.exports = function() {
  // Implementazione della funzione
};
```

3. **Aggiunta di proprietà all'oggetto exports**:

```javascript
exports.funzione1 = function() { /* ... */ };
exports.funzione2 = function() { /* ... */ };
exports.costante = 42;
```

> **Nota**: Fare attenzione quando si usa `exports` direttamente. Se si assegna un nuovo valore a `exports`, si perde il riferimento all'oggetto originale `module.exports`.

## Best Practices

1. **Responsabilità Singola**: Ogni modulo dovrebbe avere una responsabilità ben definita.
2. **Interfaccia Chiara**: Esportare solo ciò che è necessario, mantenendo privato il resto.
3. **Documentazione**: Documentare l'interfaccia pubblica del modulo con commenti JSDoc.
4. **Gestione degli Errori**: Implementare una corretta gestione degli errori all'interno del modulo.
5. **Testing**: Scrivere test unitari per verificare il corretto funzionamento del modulo.

## Conclusione

La creazione di moduli personalizzati è una pratica fondamentale nello sviluppo con Node.js. Permette di organizzare il codice in modo modulare, facilitando la manutenzione e il riutilizzo. Nei prossimi capitoli, esploreremo pattern di esportazione più avanzati e come gestire le dipendenze tra moduli.