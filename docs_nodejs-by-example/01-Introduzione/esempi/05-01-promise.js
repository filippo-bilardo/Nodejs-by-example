console.log('1. Start');

Promise.resolve().then(() => {
    console.log('4. Promise');
});
process.nextTick(() => {
    console.log('3. NextTick');
});

console.log('2. End');

// Output:
// 1. Start
// 2. End
// 3. NextTick ← Eseguito dopo il codice sincrono
// 4. Promise ← Eseguito dopo nextTick ma prima di timer