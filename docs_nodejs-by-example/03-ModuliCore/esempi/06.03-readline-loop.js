/**
 * Esempio 06.03 - Loop Interattivo (REPL)
 * 
 * Dimostra come creare un REPL (Read-Eval-Print-Loop).
 * 
 * Concetti dimostrati:
 * - Pattern REPL per applicazioni interattive
 * - Uso di prompt() per mostrare il prompt
 * - Evento 'line' per gestire ogni input
 * - Comandi speciali (exit, help, clear)
 * - Loop continuo fino a comando exit
 * 
 * REPL = Read-Eval-Print-Loop:
 * 1. READ: legge input utente (evento 'line')
 * 2. EVAL: valuta/esegue il comando (eval o switch/case)
 * 3. PRINT: mostra il risultato (console.log)
 * 4. LOOP: torna al punto 1 (rl.prompt())
 * 
 * Esempi di REPL famosi:
 * - Node.js REPL (digitare 'node' senza file)
 * - Python shell
 * - MySQL/PostgreSQL client
 * 
 * Nota:
 * nell'esempio prompt è una proprietà dell'interfaccia readline
 * mentre rl.prompt() è il metodo che mostra il prompt precedentemente definito.
 */

const readline = require('readline');

/**
 * Crea interfaccia con prompt personalizzato
 * - prompt: stringa mostrata prima di ogni input
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'calc> '  // Prompt personalizzato (come 'mysql>', 'python>')
});

// Messaggio di benvenuto con istruzioni
console.log('=== CALCOLATRICE SEMPLICE ===');
console.log('Digita espressioni matematiche (es: 2+2, 10*5)');
console.log('Comandi: help, clear, exit\n');

/**
 * IMPORTANTE: Chiama prompt() per avviare il REPL
 * Mostra il prompt e attende input
 */
rl.prompt();

/**
 * Evento 'line' viene emesso quando l'utente preme INVIO
 * Questo è il cuore del REPL:
 * - Riceve l'input
 * - Lo processa
 * - Mostra il risultato
 * - Chiama di nuovo prompt() per continuare il loop
 */
rl.on('line', (input) => {
  const trimmed = input.trim();
  
  /**
   * GESTIONE COMANDI SPECIALI
   * Prima di valutare l'espressione, controlla comandi speciali
   */
  
  // Comando EXIT: termina il programma
  if (trimmed === 'exit') {
    console.log('Arrivederci!');
    rl.close();  // Chiude interfaccia e termina il loop
    return;      // Non chiamare prompt() (usciamo)
  }
  
  // Comando HELP: mostra aiuto
  if (trimmed === 'help') {
    console.log('\nComandi disponibili:');
    console.log('  exit  - Esci dal programma');
    console.log('  help  - Mostra questo aiuto');
    console.log('  clear - Pulisci schermo');
    console.log('\nEsempi espressioni:');
    console.log('  2 + 2');
    console.log('  10 * 5');
    console.log('  100 / 4');
    console.log('  Math.sqrt(16)\n');
    rl.prompt();  // Mostra prompt per continuare
    return;
  }
  
  // Comando CLEAR: pulisce lo schermo
  if (trimmed === 'clear') {
    console.clear();
    rl.prompt();  // Mostra prompt per continuare
    return;
  }
  
  /**
   * VALUTAZIONE ESPRESSIONE MATEMATICA
   * Se non è un comando speciale, prova a valutare come espressione JS
   */
  if (trimmed) {
    try {
      /**
       * ⚠️ ATTENZIONE: eval() è PERICOLOSO in produzione!
       * 
       * eval() esegue codice JavaScript arbitrario.
       * In questo esempio va bene perché:
       * - È un esempio didattico
       * - L'utente è il proprietario della macchina
       * - Non c'è input da fonti non fidate
       * 
       * In produzione USA INVECE:
       * - Parser matematico sicuro (es: math.js)
       * - Whitelist di comandi permessi
       * - Sandbox (vm module)
       */
      const result = eval(trimmed);
      console.log(`  = ${result}`);
    } catch (error) {
      // Cattura errori di sintassi o runtime
      console.log(`  Errore: ${error.message}`);
    }
  }
  
  /**
   * LOOP: Mostra di nuovo il prompt
   * Questo è ciò che rende il programma un REPL:
   * dopo aver processato l'input, torna ad attendere nuovo input
   */
  rl.prompt();
});

// Gestione chiusura
rl.on('close', () => {
  console.log('\nProgramma terminato');
  process.exit(0);
});

// Gestione Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n(Premi Ctrl+C di nuovo o digita "exit" per uscire)');
  rl.prompt();
});
