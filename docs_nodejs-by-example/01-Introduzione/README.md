# Esercitazione 1: Introduzione a Node.js

Questa prima esercitazione ti introdurrà a Node.js, spiegandone le caratteristiche fondamentali, i vantaggi e come configurare l'ambiente di sviluppo. Imparerai a eseguire il tuo primo script Node.js e comprenderai il funzionamento del modello asincrono basato su eventi.

## Obiettivi

- Comprendere cos'è Node.js e perché è importante
- Installare Node.js sul proprio sistema
- Eseguire il primo script "Hello World"
- Esplorare il modello di programmazione asincrona
- Utilizzare la console di Node.js (REPL)

## Esercizi Pratici

### Esercizio 1.1: Installazione di Node.js
1. Visita [nodejs.org](https://nodejs.org/)
2. Scarica la versione LTS (Long Term Support) per il tuo sistema operativo
3. Installa Node.js seguendo le istruzioni
4. Verifica l'installazione con i comandi:

```bash
node -v
npm -v
```

### Esercizio 1.2: Hello World
1. Crea un file chiamato `hello.js` con il seguente contenuto:

```javascript
console.log('Hello, Node.js!');
```

2. Esegui il file con Node.js:

```bash
node hello.js
```

### Esercizio 1.3: Utilizzo della REPL (Read–Eval–Print Loop)
1. Apri la REPL di Node.js digitando `node` nel terminale
2. Sperimenta con alcune espressioni JavaScript:

```javascript
1 + 1
"Node.js".toUpperCase()
const saluto = "Ciao"
saluto + " mondo!"
```

3. Premi Ctrl+D (o Ctrl+C due volte) per uscire dalla REPL

### Esercizio 1.4: Informazioni sul Sistema
1. Crea un file chiamato `node-info.js` con il seguente contenuto:

```javascript
console.log('Versione Node.js:', process.version);
console.log('Sistema operativo:', process.platform);
console.log('Architettura CPU:', process.arch);
console.log('Directory corrente:', process.cwd());
console.log('Tempo di esecuzione (secondi):', process.uptime());
```

2. Esegui il file e osserva le informazioni sul tuo ambiente

### Esercizio 1.5: Primo Script Asincrono
   - Crea un file `async.js` con il seguente contenuto:
     ```javascript
     console.log('Inizio');
     
     setTimeout(() => {
       console.log('Operazione asincrona completata');
     }, 2000);
     
     console.log('Fine');
     ```
   - Eseguilo e osserva l'ordine di esecuzione

## Sfida Aggiuntiva
Crea uno script chiamato `fibonacci.js` che calcoli e visualizzi i primi 10 numeri della sequenza di Fibonacci:

```javascript
// Soluzione di esempio (da implementare autonomamente)
function fibonacci(n) {
    const sequence = [0, 1];
    for (let i = 2; i < n; i++) {
        sequence[i] = sequence[i-1] + sequence[i-2];
    }
    return sequence;
}

const result = fibonacci(10);
console.log('I primi 10 numeri della sequenza di Fibonacci:');
console.log(result);
```

## Argomenti Teorici Collegati

- [1. Storia di Node.js](./teoria/01-storia.md)
- [2. Architettura di Node.js](./teoria/02-architettura.md)
- [3. Event Loop](./teoria/03-event-loop.md)
- [4. JavaScript Runtime](./teoria/04-javascript-runtime.md)
- [5. Programmazione Asincrona](./teoria/05-programmazione-asincrona.md)

## Risorse Aggiuntive

- [Documentazione ufficiale di Node.js](https://nodejs.org/docs/)
- [Node.js su GitHub](https://github.com/nodejs/node)
- [Guida interattiva a Node.js](https://nodeschool.io/)

## Navigazione

- [Indice del Corso](../README.md)
- Modulo Successivo: [Moduli Core](../02-ModuliCore/README.md)