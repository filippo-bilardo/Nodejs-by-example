# Esempio 01: Basic EventEmitter

## Descrizione

Esempio introduttivo che dimostra l'uso base di EventEmitter in Node.js.

## Concetti Dimostrati

- Creazione di un custom EventEmitter
- Registrazione di listener con `on()` e `once()`
- Emissione di eventi con `emit()`
- Passaggio di argomenti agli eventi
- Rimozione di listener
- Gestione evento `error`

## File

- `index.js` - Implementazione completa con esempi

## Esecuzione

```bash
node index.js
```

## Output Atteso

```
=== ESEMPIO 1: Basic Events ===
User logged in: mario at [timestamp]
Analytics: User logged in: mario

=== ESEMPIO 2: Once Listener ===
First connection established
Connection established

=== ESEMPIO 3: Multiple Arguments ===
Order placed: 12345 by user-1, total: $99.99

=== ESEMPIO 4: Listener Removal ===
Data: test1
(no output for test2)

=== ESEMPIO 5: Error Handling ===
Error occurred: Something went wrong

=== ESEMPIO 6: Stock Ticker ===
AAPL updated: $150.00
Analytics: AAPL updated: $150.00
Apple specific: $150.00
AAPL updated: $155.00
Analytics: AAPL updated: $155.00
Apple specific: $155.00
⚠️ Significant change: $150.00 → $160.00
AAPL updated: $160.00
Analytics: AAPL updated: $160.00
Apple specific: $160.00
```

## Spiegazione

L'esempio mostra come:
1. Estendere EventEmitter per creare classi custom
2. Usare listener per rispondere a eventi
3. Gestire listener one-time con `once()`
4. Rimuovere listener quando non servono più
5. Gestire obbligatoriamente l'evento `error`
6. Creare un'applicazione realistica (Stock Ticker)
