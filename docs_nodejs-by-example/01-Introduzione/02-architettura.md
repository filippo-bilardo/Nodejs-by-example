# Architettura di Node.js

## Componenti Fondamentali

L'architettura di Node.js è composta da diversi componenti che lavorano insieme per fornire un ambiente di runtime JavaScript lato server efficiente e performante:

### 1. V8 JavaScript Engine

- Sviluppato da Google per Chrome
- Compila il codice JavaScript in codice macchina nativo
- Offre prestazioni elevate grazie all'ottimizzazione just-in-time (JIT)
- Gestisce l'allocazione della memoria e il garbage collection

### 2. libuv

- Libreria C multipiattaforma che fornisce il loop degli eventi
- Gestisce operazioni di I/O asincrone
- Implementa il thread pool per operazioni di I/O bloccanti
- Fornisce supporto per socket, file system, timer e networking

### 3. Core Modules

- Moduli JavaScript e C++ integrati in Node.js
- Forniscono funzionalità di base come file system, HTTP, crypto, ecc.
- Accessibili senza necessità di installazione
- Ottimizzati per prestazioni e sicurezza

### 4. npm (Node Package Manager)

- Gestore di pacchetti per l'ecosistema Node.js
- Consente di installare, condividere e gestire dipendenze
- Repository di codice open source più grande al mondo
- Strumento essenziale per la gestione dei progetti Node.js

## Modello Single-Threaded con Event Loop

Node.js utilizza un modello di esecuzione single-threaded con un event loop, che gli permette di gestire migliaia di connessioni concorrenti con un overhead minimo:

1. **Thread Principale**: Esegue il codice JavaScript e gestisce l'event loop

2. **Event Loop**: Coordina l'esecuzione di callback quando eventi o operazioni asincrone sono completate

3. **Thread Pool**: Gestito da libuv per operazioni di I/O bloccanti (come accesso al file system)

4. **Operazioni Asincrone**: Le API di Node.js sono progettate per essere non bloccanti

## Architettura Orientata agli Eventi

Node.js è costruito attorno a un'architettura orientata agli eventi (event-driven):

- **Event Emitters**: Oggetti che emettono eventi nominati
- **Event Listeners**: Funzioni di callback che vengono eseguite quando si verificano eventi specifici
- **Pattern Observer**: Implementazione del pattern di progettazione Observer

## Sistema di Moduli

Node.js implementa un sistema di moduli per organizzare il codice:

1. **CommonJS**: Sistema di moduli originale di Node.js
   - `require()` per importare moduli
   - `module.exports` o `exports` per esportare funzionalità

2. **ES Modules**: Supporto per il sistema di moduli standard di JavaScript
   - `import` e `export` per gestire le dipendenze
   - Supportato nativamente nelle versioni recenti di Node.js

## Vantaggi dell'Architettura

- **Efficienza**: Utilizzo ottimale delle risorse di sistema
- **Scalabilità**: Capacità di gestire molte connessioni simultanee
- **Prestazioni**: Esecuzione rapida grazie al motore V8
- **Flessibilità**: Facilità di estensione tramite moduli

## Limitazioni

- **Operazioni CPU-intensive**: Possono bloccare l'event loop
- **Single-threaded**: Non sfrutta nativamente più core della CPU (sebbene sia possibile con il modulo `cluster` o `worker_threads`)
- **Callback Hell**: Potenziale complessità nella gestione di operazioni asincrone annidate (mitigato con Promise, async/await)

## Evoluzione dell'Architettura

Nel corso degli anni, l'architettura di Node.js si è evoluta per affrontare le sfide emergenti:

- Introduzione di API basate su Promise
- Supporto nativo per async/await
- Miglioramenti nelle prestazioni del garbage collector
- Supporto per ES Modules
- Introduzione di worker threads per operazioni CPU-intensive

---

- [Indice](../README.md)
- [Lezione precedente](01-storia.md)
- [Prossima Lezione](03-javascript-runtime.md)
- [Prossima Esercitazione](./02-Architettura_Event-Driven/README.md)