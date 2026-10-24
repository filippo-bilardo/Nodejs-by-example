/**
 * Esercizio: Sequenza di Fibonacci
 * 
 * Questo script calcola e visualizza i primi 10 numeri della sequenza di Fibonacci.
 * La sequenza di Fibonacci è una serie di numeri in cui ogni numero è la somma dei due precedenti.
 * La sequenza inizia con 0 e 1.
 */

// Funzione per generare la sequenza di Fibonacci
function fibonacci(n) {
    // Inizializziamo l'array con i primi due numeri della sequenza
    const sequence = [0, 1];
    
    // Calcoliamo i numeri successivi della sequenza
    for (let i = 2; i < n; i++) {
        sequence[i] = sequence[i-1] + sequence[i-2];
    }
    
    return sequence;
}

// Calcoliamo i primi 10 numeri della sequenza
const result = fibonacci(10);

// Visualizziamo il risultato
console.log('I primi 10 numeri della sequenza di Fibonacci:');
console.log(result);

// Output atteso: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

/**
 * Sfida extra: prova a implementare la stessa funzione usando la ricorsione
 * 
 * function fibonacciRicorsivo(n) {
 *     if (n <= 1) return n;
 *     return fibonacciRicorsivo(n-1) + fibonacciRicorsivo(n-2);
 * }
 */