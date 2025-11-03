// La microtask queue viene svuotata DOPO ogni fase
console.log('1. Sync start');

setTimeout(() => {
    process.nextTick(() => {
        console.log('7. NextTick in timer');
    });    
    
    console.log('6. Timer');
}, 0);

setImmediate(() => {
    console.log('8. Immediate');
});

Promise.resolve()
    .then(() => {
        console.log('4. Promise 1');
        return Promise.resolve();
    })
    .then(() => {
        console.log('5. Promise 2');
    });

process.nextTick(() => {
    console.log('2. NextTick 1');
    
    process.nextTick(() => {
        console.log('3. Nested NextTick');
    });
});


console.log('1. Sync end');

// Output garantito:
// 1. Sync start
// 1. Sync end
// 2. NextTick 1
// 3. Nested NextTick
// 4. Promise 1
// 5. Promise 2
// 6. Timer (o 8. Immediate)
// 7. NextTick in timer
// 8. Immediate (o 6. Timer)
