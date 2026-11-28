/**
 * Esempio 06.04 - Lettura File con Readline
 * 
 * Dimostra come leggere file grandi riga per riga senza caricarli
 * completamente in memoria.
 * 
 * Concetti dimostrati:
 * - Stream di file con fs.createReadStream()
 * - Lettura linea per linea con readline
 * - for-await-of per iterazione asincrona
 * - crlfDelay per gestione cross-platform
 * - Statistiche e analisi del file
 * - Ricerca pattern (es: TODO)
 * 
 * Vantaggi vs fs.readFileSync():
 * - Memoria costante (non carica tutto in RAM)
 * - Può processare file di qualsiasi dimensione
 * - Elaborazione inizia immediatamente
 * - Non bloccante (asincrono)
 * 
 * Casi d'uso:
 * - Analisi log file
 * - Parsing CSV/TSV
 * - Ricerca in file di testo
 * - Elaborazione dati di grandi dimensioni
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Nome del file da processare
const nomeFile = 'dati-esempio.txt';

// Contenuto di esempio per creare il file di test
const contenutoEsempio = `Prima linea del file
Seconda linea con più testo
Terza linea

Quinta linea (la quarta era vuota)
Questa linea contiene TODO: esempio
Settima linea
Ottava linea finale`;

/**
 * Crea file di esempio se non esiste
 * Questo permette di eseguire l'esempio senza file preesistenti
 */
if (!fs.existsSync(nomeFile)) {
  fs.writeFileSync(nomeFile, contenutoEsempio);
  console.log(`File "${nomeFile}" creato.\n`);
}

/**
 * Funzione asincrona per processare un file riga per riga
 * 
 * @param {string} filePath - Percorso del file da leggere
 */
async function processaFile(filePath) {
  /**
   * createReadStream() crea uno stream di lettura
   * - Legge il file a pezzi (chunk) invece di tutto in una volta
   * - Non bloccante (asincrono)
   * - Memoria efficiente
   */
  const fileStream = fs.createReadStream(filePath);
  
  /**
   * Crea interfaccia readline che legge dallo stream file
   * 
   * Opzioni importanti:
   * - input: stream da cui leggere (file invece di stdin)
   * - crlfDelay: Infinity per gestire \r\n e \n correttamente
   *   (Windows usa \r\n, Unix/Mac usa \n)
   */
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity  // Tratta \n e \r\n come singolo line break
  });
  
  // Variabili per statistiche
  let numeroLinea = 0;      // Contatore linee
  let lineeVuote = 0;       // Quante linee vuote
  let caratteriTotali = 0;  // Somma caratteri di tutte le linee
  const lineeConTodo = [];  // Array di linee che contengono "TODO"
  
  console.log('=== ANALISI FILE ===\n');
  
  /**
   * for-await-of è il modo moderno per iterare su stream
   * 
   * Alternativa (vecchio modo):
   *   rl.on('line', (line) => { ... })
   * 
   * Vantaggi for-await-of:
   * - Sintassi più pulita
   * - Supporta await dentro il loop
   * - Facile usare break/continue
   */
  for await (const line of rl) {
    numeroLinea++;
    caratteriTotali += line.length;  // Il newline è già rimosso
    
    // Identifica e conta linee vuote
    if (line.trim() === '') {
      lineeVuote++;
    }
    
    // Cerca pattern specifico (esempio: TODO nei commenti)
    if (line.includes('TODO')) {
      lineeConTodo.push({ numero: numeroLinea, testo: line });
    }
    
    /**
     * Stampa ogni linea con numero di linea
     * padStart(3, ' ') allinea i numeri a destra (es: "  1", " 10", "100")
     */
    console.log(`${numeroLinea.toString().padStart(3, ' ')}: ${line}`);
  }
  
  // Statistiche finali
  console.log('\n=== STATISTICHE ===');
  console.log(`File: ${filePath}`);
  console.log(`Totale linee: ${numeroLinea}`);
  console.log(`Linee vuote: ${lineeVuote}`);
  console.log(`Linee con contenuto: ${numeroLinea - lineeVuote}`);
  console.log(`Caratteri totali: ${caratteriTotali}`);
  console.log(`Media caratteri per linea: ${(caratteriTotali / numeroLinea).toFixed(2)}`);
  
  if (lineeConTodo.length > 0) {
    console.log(`\n=== TODO TROVATI (${lineeConTodo.length}) ===`);
    lineeConTodo.forEach(({ numero, testo }) => {
      console.log(`Linea ${numero}: ${testo.trim()}`);
    });
  }
}

// Esegui analisi
const fileArg = process.argv[2] || nomeFile;
processaFile(fileArg).catch((error) => {
  console.error('Errore:', error.message);
  process.exit(1);
});
