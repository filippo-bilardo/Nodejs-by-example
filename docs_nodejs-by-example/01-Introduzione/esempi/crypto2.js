//Aumentiamo il thread pool

process.env.UV_THREADPOOL_SIZE = 8;
const crypto = require('crypto');

console.log('Thread pool size:', process.env.UV_THREADPOOL_SIZE || 4);

const start = Date.now();
let completed = 0;

// Lanciamo 8 operazioni intensive simultaneamente
for (let i = 0; i < 16; i++) {
    crypto.pbkdf2('password', 'salt', 100000, 512, 'sha512', (err, key) => {
        completed++;
        console.log(`Task ${i + 1} completed in ${Date.now() - start}ms`);

        if (completed === 16) {
            console.log(`Total time: ${Date.now() - start}ms`);
        }
    });
}

