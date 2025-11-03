# Esercizi sull'Event Loop di Node.js

Questa cartella contiene una serie di esercizi progressivi per comprendere il funzionamento dell'Event Loop in Node.js.

## 📚 Ordine consigliato

### Parte 1: Esercizi Guidati (Teoria + Pratica)
1. **01-event-loop-base.js** - Introduzione base: codice sincrono vs setTimeout
2. **02-event-loop-promise.js** - Differenza tra microtask (Promise) e macrotask (setTimeout)
3. **03-event-loop-setimmediate.js** - Introduzione a setImmediate e process.nextTick
4. **04-event-loop-complesso.js** - Scenario complesso che combina tutto
5. **05-event-loop-io.js** - Operazioni I/O e il loro impatto sull'event loop
6. **06-event-loop-blocking.js** - Cosa succede quando si blocca l'event loop
7. **07-event-loop-esercizio.js** - Quiz finale per testare la comprensione

### Parte 2: Esercizi Pratici (Da Completare)
8. **08-esercizio-da-completare-1.js** - 📝 Ordine di esecuzione (facile)
9. **09-esercizio-da-completare-2.js** - 📝 Ritardo controllato con Promise (facile)
10. **10-esercizio-da-completare-3.js** - 📝 Countdown asincrono (medio)
11. **11-esercizio-da-completare-4.js** - 📝 Race condition con Promise.race (medio)
12. **12-esercizio-da-completare-5.js** - 📝 Simulazione caricamento dati (medio)
13. **13-esercizio-da-completare-6.js** - 📝 Task queue manager (difficile)
14. **14-sfida-finale.js** - 🏆 Sistema di gestione ordini (sfida)

## Come usare questi esercizi

### 📖 Per gli esercizi guidati (01-07):
1. Leggi il codice dell'esercizio
2. **Prima di eseguirlo**, prova a indovinare l'ordine di output
3. Scrivi la tua risposta su carta
4. Esegui il codice: `node nome-file.js`
5. Confronta il risultato con la tua previsione
6. Leggi la spiegazione nel commento finale

### ✍️ Per gli esercizi da completare (08-14):
1. Leggi attentamente le istruzioni nell'esercizio
2. Scrivi il codice nella sezione indicata
3. **NON guardare la soluzione** prima di aver provato!
4. Esegui il codice per testare la tua soluzione
5. Se hai difficoltà, scorri in basso per vedere la soluzione
6. Confronta la tua soluzione con quella proposta

### Esempio:
```bash
# Esercizi guidati
node 01-event-loop-base.js

# Esercizi da completare
node 08-esercizio-da-completare-1.js
```

## Concetti chiave

### Priorità nell'Event Loop di Node.js:
1. **Codice sincrono** - Eseguito immediatamente
2. **process.nextTick()** - Massima priorità tra le callback
3. **Microtask** (Promise) - Eseguite dopo nextTick
4. **Macrotask** (setTimeout, setInterval) - Eseguite dopo le microtask
5. **setImmediate()** - Eseguito nell'iterazione successiva dell'event loop

### Fasi dell'Event Loop:
```
   ┌───────────────────────────┐
┌─>│           timers          │ - setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │ - I/O operations
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │ - setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──│      close callbacks      │
   └───────────────────────────┘
```

## Best Practices

❌ **Da evitare:**
- Bloccare l'event loop con operazioni sincrone pesanti
- Usare `while(true)` o loop infiniti
- Operazioni CPU-intensive nel thread principale

✅ **Da fare:**
- Usare operazioni asincrone quando possibile
- Delegare operazioni pesanti a Worker Threads
- Comprendere le priorità delle callback

## Risorse aggiuntive

- [Node.js Event Loop Documentation](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Understanding the Node.js Event Loop](https://blog.risingstack.com/node-js-at-scale-understanding-node-js-event-loop/)

## 🎯 Competenze che acquisirai

Completando questi esercizi sarai in grado di:

✅ Comprendere l'ordine di esecuzione del codice asincrono  
✅ Usare correttamente Promise, setTimeout, e setImmediate  
✅ Gestire operazioni asincrone in sequenza e in parallelo  
✅ Implementare pattern comuni come race, timeout, retry  
✅ Creare sistemi complessi con gestione errori  
✅ Evitare di bloccare l'event loop  

## 📊 Livelli di difficoltà

| Esercizio | Livello | Tempo stimato | Concetti chiave |
|-----------|---------|---------------|-----------------|
| 01-07 | 📗 Guidati | 30-45 min | Event loop, priorità, fasi |
| 08-09 | 📗 Facile | 10-15 min | Promise base, setTimeout |
| 10-11 | 📙 Medio | 15-20 min | Ricorsione, Promise.race |
| 12-13 | 📙 Medio | 20-30 min | Promise.all, async/await |
| 14 | 📕 Difficile | 30-45 min | Sistema completo, error handling |

## 💡 Test rapido

Dopo aver completato tutti gli esercizi, prova a rispondere a queste domande:

1. Qual è la differenza tra microtask e macrotask?
2. Perché `setTimeout(() => {}, 0)` non viene eseguito immediatamente?
3. Quando si dovrebbe usare `process.nextTick()` invece di `Promise`?
4. Cosa succede se si blocca l'event loop con codice sincrono?
5. Qual è la differenza tra `setImmediate()` e `setTimeout()`?
6. Come si gestiscono più Promise in parallelo?
7. Quando usare `Promise.race()` invece di `Promise.all()`?

## 🏆 Sfida extra

Hai completato tutti gli esercizi? Prova a:
- Modificare la sfida finale aggiungendo nuove funzionalità
- Creare il tuo esercizio e condividerlo con i compagni
- Implementare un sistema di logging più avanzato
- Aggiungere metriche di performance

Buono studio! 🚀
