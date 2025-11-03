console.log('1. 🟢 Sync start');

setTimeout(() => {
    console.log('5. ⏱️  Timer 0ms');
}, 0);

setImmediate(() => {
    console.log('6. ⚡ Immediate');
});

process.nextTick(() => {
    console.log('2. 🚀 NextTick 1');
    
    process.nextTick(() => {
        console.log('3. 🚀 NextTick 2 (nested)');
    });
});

Promise.resolve()
    .then(() => {
        console.log('4. 💎 Promise');
    });

console.log('1. 🟢 Sync end');

// Output GARANTITO:
// 1. 🟢 Sync start
// 1. 🟢 Sync end
// 2. 🚀 NextTick 1
// 3. 🚀 NextTick 2 (nested)
// 4. 💎 Promise
// 5. ⏱️  Timer 0ms      ← Ordine può variare
// 6. ⚡ Immediate       ← con Immediate