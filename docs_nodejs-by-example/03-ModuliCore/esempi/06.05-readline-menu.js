/**
 * Esempio 06.05 - Menu Interattivo
 * 
 * Dimostra come creare un menu interattivo con opzioni multiple.
 * 
 * Concetti dimostrati:
 * - Menu con loop continuo (fino a quando l'utente sceglie di uscire)
 * - Struttura dati per organizzare operazioni (oggetto 'operazioni')
 * - Promise wrapper per semplificare async/await
 * - Validazione input utente
 * - Clear screen per UX migliore
 * - Box drawing characters per UI accattivante (╔═╗║╚╝)
 */

const readline = require('readline');

// Crea interfaccia readline per leggere input da tastiera
const rl = readline.createInterface({
  input: process.stdin,   // Legge da tastiera
  output: process.stdout  // Scrive su console
});

/**
 * Wrapper per question() che restituisce una Promise
 * Permette di usare async/await invece di callback
 * 
 * @param {string} domanda - La domanda da porre all'utente
 * @returns {Promise<string>} Promise che si risolve con la risposta
 */
function chiedi(domanda) {
  return new Promise((resolve) => {
    rl.question(domanda, resolve);
  });
}

/**
 * Oggetto che mappa ogni opzione del menu alla sua funzione
 * 
 * Struttura:
 * - chiave: numero dell'opzione (1, 2, 3, ...)
 * - valore: oggetto con 'nome' (mostrato nel menu) e 'azione' (funzione da eseguire)
 * 
 * Vantaggi di questa struttura:
 * - Facile aggiungere nuove opzioni (basta aggiungere una chiave)
 * - Codice organizzato e manutenibile
 * - Facile iterare per mostrare il menu
 */
const operazioni = {
  // Opzione 1: Saluto personalizzato
  1: {
    nome: 'Saluta',
    azione: async () => {
      // Chiede il nome all'utente
      const nome = await chiedi('Come ti chiami? ');
      // Mostra messaggio di benvenuto personalizzato
      console.log(`\nCiao ${nome}! Benvenuto!\n`);
    }
  },
  
  // Opzione 2: Calcolatrice semplice
  2: {
    nome: 'Calcola',
    azione: async () => {
      // Chiede due numeri all'utente
      const a = parseFloat(await chiedi('Primo numero: '));
      const b = parseFloat(await chiedi('Secondo numero: '));
      
      // Esegue e mostra tutte le operazioni
/**
 * Mostra il menu principale con tutte le opzioni disponibili
 * 
 * Usa box-drawing characters (╔═╗║╚╝) per creare un'interfaccia grafica
 * testuale più accattivante.
 * 
 * Il menu viene generato dinamicamente dall'oggetto 'operazioni',
 * quindi aggiungere nuove opzioni è automatico.
 */
function mostraMenu() {
  // Bordo superiore del box
  console.log('╔════════════════════════════╗');
  console.log('║     MENU PRINCIPALE        ║');
  console.log('╠════════════════════════════╣');
  
  // Itera su tutte le operazioni e mostra ognuna come opzione del menu
  // Object.entries() converte { 1: {...}, 2: {...} } in [['1', {...}], ['2', {...}]]
  Object.entries(operazioni).forEach(([key, op]) => {
    // padEnd(24, ' ') aggiunge spazi per allineare il bordo destro
    console.log(`║ ${key}. ${op.nome.padEnd(24, ' ')}║`);
  });
  
  // Opzione di uscita (sempre presente)
  console.log('║ 0. Esci                    ║');
  
  // Bordo inferiore del box
  console.log('╚════════════════════════════╝');
}   nome: 'Informazioni',
    azione: async () => {
      console.log('\n=== INFORMAZIONI SISTEMA ===');
      console.log(`Node.js versione: ${process.version}`);      // Es: v18.17.0
      console.log(`Piattaforma: ${process.platform}`);          // Es: linux, darwin, win32
      console.log(`Architettura: ${process.arch}`);             // Es: x64, arm64
      console.log(`Directory corrente: ${process.cwd()}`);      // Cartella di esecuzione
/**
 * Funzione principale che gestisce il loop del menu
 * 
 * Pattern utilizzato:
 * 1. Mostra menu
 * 2. Leggi scelta utente
 * 3. Valida scelta
 * 4. Esegui azione corrispondente
 * 5. Pausa per mostrare risultato
 * 6. Pulisci schermo e ripeti
 * 
 * Il loop continua fino a quando l'utente sceglie '0' (Esci)
 */
async function menuPrincipale() {
  let continua = true;  // Flag per controllare il loop
  
  // Loop principale del menu (REPL pattern)
  while (continua) {
    // 1. Mostra il menu
    mostraMenu();
    
    // 2. Chiedi all'utente di scegliere un'opzione
    const scelta = await chiedi('\nScegli opzione: ');
    
    // 3. Gestisci la scelta
    if (scelta === '0') {
      // Opzione 0: Esci dal programma
      console.log('\n👋 Arrivederci!\n');
      continua = false;  // Termina il loop
      
    } else if (operazioni[scelta]) {
      // Scelta valida: esegui l'azione corrispondente
      console.log('');
      await operazioni[scelta].azione();  // Esegue la funzione async
      
      // Pausa per permettere all'utente di leggere il risultato
      await chiedi('Premi INVIO per continuare...');
      
      // Pulisci lo schermo per mostrare il menu pulito
      console.clear();
      
    } else {
      // Scelta non valida: mostra errore
// ============================================================================
// AVVIO APPLICAZIONE
// ============================================================================

// Pulisci lo schermo all'avvio per un'interfaccia pulita
console.clear();

// Mostra titolo dell'applicazione
console.log('=== APPLICAZIONE MENU ===\n');

// Avvia il menu principale
// catch() gestisce eventuali errori non catturati
menuPrincipale().catch((error) => {
  console.error('Errore:', error);
  rl.close();        // Assicurati di chiudere readline anche in caso di errore
  process.exit(1);   // Esci con codice di errore
}); }
  }
  
  // Chiudi l'interfaccia readline quando usciamo dal loop
  rl.close();
}   
    if (scelta === '0') {
      console.log('\n👋 Arrivederci!\n');
      continua = false;
    } else if (operazioni[scelta]) {
      console.log('');
      await operazioni[scelta].azione();
      await chiedi('Premi INVIO per continuare...');
      console.clear();
    } else {
      console.log('\n❌ Opzione non valida!\n');
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.clear();
    }
  }
  
  rl.close();
}

// Avvia applicazione
console.clear();
console.log('=== APPLICAZIONE MENU ===\n');
menuPrincipale().catch((error) => {
  console.error('Errore:', error);
  rl.close();
  process.exit(1);
});
