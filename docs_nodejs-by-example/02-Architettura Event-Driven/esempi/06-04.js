// ✅ USO CORRETTO delle priorità

// 1. Codice critico che deve eseguire subito dopo il codice corrente
function criticalCallback() {
    process.nextTick(() => {
        // Esegue prima di qualsiasi I/O
        console.log('Callback critico');
    });
}

// 2. Dare precedenza ai callback I/O (non bloccare)
function afterIoCallback() {
    setImmediate(() => {
        // Permette elaborazione di altri eventi I/O
        console.log('Dopo I/O');
    });
}

// 3. Operazioni programmate nel tempo
function scheduledTask() {
    setTimeout(() => {
        console.log('Dopo almeno 1 secondo');
    }, 1000);
}

// 4. Promise per operazioni asincrone moderne
async function modernAsync() {
    const result = await fetchData();
    // Continua dopo il fulfillment della promise
}

function fetchData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Dati caricati');
            console.log('Dati caricati');
        }, 500);
    });
}

// Esempio di utilizzo
scheduledTask();
afterIoCallback();
criticalCallback();
modernAsync();

// Output:
// Callback critico
// Dopo I/O
// Dopo almeno 1 secondo

// Evitare di usare setTimeout per operazioni critiche o I/O
// Evitare di bloccare l'event loop con operazioni sincrone pesanti
// Usare Promise/async-await per codice asincrono moderno e leggibile

// Questo esempio mostra come dare priorità correttamente alle operazioni in Node.js
// per mantenere l'event loop reattivo ed efficiente.