# App Fortune
realizzare l'app fortune.js che fornisce una citazione casuale da un elenco predefinito ogni volta che viene eseguito.
Creare un database di citazioni famose e implementare un modulo che seleziona e restituisce una citazione casuale.

seconda versione: salavare le citazioni in un cartella ogni citazione in un file di testo separato e il modulo legge i file dalla cartella per selezionare una citazione casuale. 001.txt, 002.txt, 003.txt, eccetera.

https://it.wikiquote.org/wiki/Pagina_principale

```javascript 
// fortune.js
const fs = require("fs");
fs.readFile("./data/003.txt", "utf-8", (err, data) => {
    if (err) {
        console.log("Error while reading quote file");
        return;
    }
    console.log(data);
});

const fs = require("fs");
fs.readdir("./data", (err, files) => {
    if (err) {
        console.log("Error while reading data directory");
        return;
    }
    console.log(files);
});

const fs = require("fs");
const QUOTES_DIR = "./data";
fs.readdir(QUOTES_DIR, (err, files) => {
    if (err) {
        console.log("Error while reading data directory");
        return;
    }
    const randomIdx = Math.floor(Math.random() * files.length);
    const quoteFile = `${QUOTES_DIR}/${files[randomIdx]}`;
    fs.readFile(quoteFile, "utf-8", (err, data) => {
        if (err) {
            console.log("Error while reading quote file");
            return;
        }
        console.log(data);
    });
});

fs.readdir(QUOTES_DIR, (err, files) => {
if (err) {
console.log("Error while reading data directory");
process.exitCode = 1;
return;
}
//...
});

fs.readdir(QUOTES_DIR, (err, files) => {
if (err) {
console.error(`Error while reading ${QUOTES_DIR} directory`);
process.exitCode = 1;
return;
}
// ...
)};

const QUOTES_DIR = "./data";
fs.readdir(QUOTES_DIR, { withFileTypes: true }, (err, files) => {
if (err) {
console.error(`Error while reading ${QUOTES_DIR} directory`);
process.exitCode = 1;
return;
}
const txtFiles = files
.filter((f) => f.isFile() && f.name.endsWith(".txt"))
.map((f) => f.name);
const randomIdx = Math.floor(Math.random() * txtFiles.length);
const quoteFile = `${QUOTES_DIR}/${txtFiles[randomIdx]}`;
fs.readFile(quoteFile, "uts-8", (err, data) => {
// ...
});
});

const fs = require("fs/promises");
const QUOTES_DIR = process.argv[2];
fs.readdir(QUOTES_DIR, { withFileTypes: true })
.then((files) => {
const txtFiles = files
.filter((f) => f.isFile() && f.name.endsWith(".txt"))
.map((f) => f.name);
const randomIdx = Math.floor(Math.random() * txtFiles.length);
const quoteFile = `${QUOTES_DIR}/${txtFiles[randomIdx]}`;
return fs.readFile(quoteFile, "utf-8");
})
.then((data) => {
console.log(data);
})
.catch((err) => {
console.error(`Error: ${err.message}`);
process.exitCode = 1;
return;
});

import fs from "fs/promises";
const QUOTES_DIR = process.argv[2];
try {
const files = await fs.readdir(QUOTES_DIR, { withFileTypes: true });
const txtFiles = files
.filter((f) => f.isFile() && f.name.endsWith(".txt"))
.map((f) => f.name);
const randomIdx = Math.floor(Math.random() * txtFiles.length);
const quoteFile = `${QUOTES_DIR}/${txtFiles[randomIdx]}`;
const data = await fs.readFile(quoteFile, "utf-8");
console.log(data);
} catch (err) {
console.error(`Error: ${err.message}`);
process.exitCode = 1;
}
```

