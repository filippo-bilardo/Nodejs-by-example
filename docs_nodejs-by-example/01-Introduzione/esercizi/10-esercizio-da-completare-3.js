/**
 * ESERCIZIO PRATICO 3: Countdown Asincrono
 * 
 * OBIETTIVO: Crea un countdown che stampa i numeri da 5 a 0
 * 
 * REQUISITI:
 * - Usa setTimeout per creare il ritardo
 * - Ogni numero deve apparire dopo 1 secondo dal precedente
 * - Quando raggiunge 0, stampa "BOOM!"
 * 
 * OUTPUT ATTESO:
 * 5
 * (1 secondo dopo) 4
 * (1 secondo dopo) 3
 * (1 secondo dopo) 2
 * (1 secondo dopo) 1
 * (1 secondo dopo) 0
 * (immediatamente dopo) BOOM!
 * 
 * SUGGERIMENTI:
 * - Puoi usare una funzione ricorsiva
 * - Oppure una Promise chain
 * - O async/await se preferisci
 */

// SCRIVI IL TUO CODICE QUI:






















// ============================================================
// SOLUZIONI MULTIPLE
// ============================================================

/**
 * SOLUZIONE 1: Ricorsiva con setTimeout
 */
function countdown1(numero) {
    console.log(numero);
    
    if (numero === 0) {
        console.log('BOOM!');
        return;
    }
    
    setTimeout(() => countdown1(numero - 1), 1000);
}

// countdown1(5);


/**
 * SOLUZIONE 2: Con Promise chain
 */
function attendi(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function countdown2() {
    console.log(5);
    return attendi(1000)
        .then(() => console.log(4))
        .then(() => attendi(1000))
        .then(() => console.log(3))
        .then(() => attendi(1000))
        .then(() => console.log(2))
        .then(() => attendi(1000))
        .then(() => console.log(1))
        .then(() => attendi(1000))
        .then(() => console.log(0))
        .then(() => console.log('BOOM!'));
}

// countdown2();


/**
 * SOLUZIONE 3: Con async/await (più elegante)
 */
async function countdown3() {
    for (let i = 5; i >= 0; i--) {
        console.log(i);
        if (i > 0) {
            await attendi(1000);
        }
    }
    console.log('BOOM!');
}

// countdown3();
