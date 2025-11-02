# Teoria: Architettura Event-Driven

Questa sezione contiene le guide teoriche sull'architettura event-driven in Node.js.

## Capitoli

1. [Introduzione all'Event-Driven Architecture](./01-introduzione-event-driven.md)
   - Cos'è l'architettura event-driven
   - Event Loop di Node.js
   - Vantaggi e svantaggi
   - Casi d'uso

2. [EventEmitter: Il Cuore degli Eventi](./02-eventemitter.md)
   - La classe EventEmitter
   - Emettere e ascoltare eventi
   - Gestione listener
   - Pattern e best practices

3. [Event Loop e Fasi di Esecuzione](./03-event-loop.md)
   - Architettura dell'Event Loop
   - Le 6 fasi del loop
   - Microtask vs Macrotask
   - nextTick e setImmediate

4. [Pattern Event-Driven Avanzati](./04-pattern-avanzati.md)
   - Observer Pattern
   - Pub/Sub
   - Event Sourcing
   - CQRS
   - Mediator Pattern

5. [Gestione Errori negli Eventi](./05-gestione-errori.md)
   - Eventi 'error'
   - Domain (legacy)
   - Async hooks
   - Best practices

## Come Studiare

1. Leggi i capitoli in ordine sequenziale
2. Sperimenta con gli esempi di codice
3. Esegui gli esempi pratici nella cartella `../esempi/`
4. Completa gli esercizi nella cartella `../esercizi/`
5. Approfondisci con le risorse esterne

## Prerequisiti

- Conoscenza base di JavaScript
- Familiarità con callback e Promise
- Comprensione di async/await
- Concetti base di programmazione asincrona
