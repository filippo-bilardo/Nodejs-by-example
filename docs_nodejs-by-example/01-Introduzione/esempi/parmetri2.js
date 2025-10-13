import { argv } from 'node:process';

// print process.argv
argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});

// node process-args.js one two=three four

// Output:
// 0: /path/to/node
// 1: /path/to/process-args.js
// 2: one
// 3: two=three
// 4: four

