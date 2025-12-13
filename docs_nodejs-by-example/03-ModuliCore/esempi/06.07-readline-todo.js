/**
 * Esempio 06.07 - Todo List CLI
 * 
 * Applicazione completa per gestire una lista di todo con persistenza.
 * 
 * Concetti dimostrati:
 * - Applicazione CLI completa e professionale
 * - Classe per organizzare logica
 * - CRUD operations (Create, Read, Update, Delete)
 * - Persistenza con JSON file
 * - Command parsing e routing
 * - Validazione comandi
 * - Priorità dei task
 * - Statistiche e report
 * 
 * Architettura:
 * - TodoList: classe che gestisce i dati e operazioni
 * - main(): loop REPL per interazione utente
 * - mostraHelp(): documentazione comandi
 * 
 * Pattern utilizzati:
 * - OOP (Object-Oriented Programming)
 * - Command pattern per routing
 * - Repository pattern per persistenza
 * - Factory pattern per creazione todo
 */

const readline = require('readline/promises');
const fs = require('fs').promises;  // API Promise-based
const path = require('path');

/**
 * Classe TodoList
 * 
 * Responsabilità:
 * - Gestire array di todo
 * - Persistenza (carica/salva su file)
 * - Operazioni CRUD
 * - Calcolo statistiche
 * 
 * Vantaggi classe:
 * - Incapsula logica e stato
 * - Riusabile e testabile
 * - Metodi chiari e singola responsabilità
 */
class TodoList {
  /**
   * Costruttore
   * @param {string} filename - Nome file JSON per persistenza
   */
  constructor(filename = 'todos.json') {
    this.filename = filename;
    this.todos = [];  // Array di oggetti todo
  }
  
  /**
   * Carica todos dal file JSON
   * 
   * Gestisce il caso in cui il file non esista (prima esecuzione)
   * Usa fs.promises per async/await pulito
   */
  async carica() {
    try {
      // Legge il file e parsea JSON
      const data = await fs.readFile(this.filename, 'utf8');
      this.todos = JSON.parse(data);
      console.log(`✓ Caricati ${this.todos.length} todos da ${this.filename}`);
    } catch (error) {
      // Se il file non esiste (prima esecuzione), inizializza array vuoto
      if (error.code === 'ENOENT') {
        console.log('Nessun file esistente, creando nuova lista...');
        this.todos = [];
      } else {
        // Altri errori (es: permessi, JSON malformato) vanno propagati
        throw error;
      }
    }
  }
  
  /**
   * Salva todos su file JSON
   * 
   * JSON.stringify() con parametri:
   * - null: no replacer function
   * - 2: indentazione di 2 spazi (human-readable)
   */
  async salva() {
    await fs.writeFile(
      this.filename, 
      JSON.stringify(this.todos, null, 2)
    );
  }
  
  /**
   * Aggiungi nuovo todo alla lista
   * 
   * @param {string} testo - Descrizione del todo
   * @param {string} priorita - 'alta', 'normale', o 'bassa'
   */
  aggiungi(testo, priorita = 'normale') {
    // Crea oggetto todo con tutti i metadati
    this.todos.push({
      id: Date.now(),                    // ID univoco timestamp
      testo,                             // Descrizione
      priorita,                          // Livello priorità
      completato: false,                 // Inizialmente non completato
      creato: new Date().toISOString()   // Timestamp creazione
    });
  }
  
  // Mostra lista todos
  lista() {
    if (this.todos.length === 0) {
      console.log('\n📝 Nessun todo presente');
      return;
    }
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║                  LISTA TODO                        ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    this.todos.forEach((todo, index) => {
      const status = todo.completato ? '✅' : '⬜';
      const prioritaIcon = {
        'alta': '🔴',
        'normale': '🟡',
        'bassa': '🟢'
      }[todo.priorita] || '⚪';
      
      console.log(`${index + 1}. ${status} ${prioritaIcon} ${todo.testo}`);
      if (todo.completato) {
        console.log(`   Completato il ${new Date(todo.completato).toLocaleString('it-IT')}`);
      }
    });
    console.log('');
  }
  
  // Completa un todo
  completa(index) {
    if (index >= 0 && index < this.todos.length) {
      this.todos[index].completato = new Date().toISOString();
      return true;
    }
    return false;
  }
  
  // Elimina un todo
  elimina(index) {
    if (index >= 0 && index < this.todos.length) {
      this.todos.splice(index, 1);
      return true;
    }
    return false;
  }
  
  // Modifica un todo
  modifica(index, nuovoTesto) {
    if (index >= 0 && index < this.todos.length) {
      this.todos[index].testo = nuovoTesto;
      return true;
    }
    return false;
  }
  
  // Statistiche
  statistiche() {
    const totale = this.todos.length;
    const completati = this.todos.filter(t => t.completato).length;
    const daCompletare = totale - completati;
    
    console.log('\n━━━ STATISTICHE ━━━');
    console.log(`Totale: ${totale}`);
    console.log(`Completati: ${completati} (${totale > 0 ? ((completati/totale)*100).toFixed(0) : 0}%)`);
    console.log(`Da completare: ${daCompletare}`);
    
    const perPriorita = {};
    this.todos.forEach(t => {
      if (!t.completato) {
        perPriorita[t.priorita] = (perPriorita[t.priorita] || 0) + 1;
      }
    });
    
    if (Object.keys(perPriorita).length > 0) {
      console.log('\nPer priorità:');
      Object.entries(perPriorita).forEach(([p, count]) => {
        console.log(`  ${p}: ${count}`);
      });
    }
    console.log('');
  }
}

// Mostra help
function mostraHelp() {
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║                  COMANDI DISPONIBILI               ║');
  console.log('╠════════════════════════════════════════════════════╣');
  console.log('║ add <testo>              - Aggiungi todo          ║');
  console.log('║ add <testo> [priorità]   - Con priorità           ║');
  console.log('║ list                     - Mostra lista           ║');
  console.log('║ complete <numero>        - Completa todo          ║');
  console.log('║ delete <numero>          - Elimina todo           ║');
  console.log('║ edit <numero> <testo>    - Modifica todo          ║');
  console.log('║ stats                    - Mostra statistiche     ║');
  console.log('║ clear                    - Pulisci schermo        ║');
  console.log('║ help                     - Mostra questo aiuto    ║');
  console.log('║ exit                     - Esci                   ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\nPriorità disponibili: alta, normale, bassa');
  console.log('Esempio: add Studiare Node.js alta\n');
}

// Funzione principale
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const todoList = new TodoList();
  await todoList.carica();
  
  console.clear();
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║              TODO LIST CLI v1.0                    ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('\nDigita "help" per vedere i comandi disponibili\n');
  
  let continua = true;
  
  try {
    while (continua) {
      const input = await rl.question('todo> ');
      const [comando, ...args] = input.trim().split(' ');
      
      switch (comando.toLowerCase()) {
        case 'add':
          if (args.length === 0) {
            console.log('❌ Uso: add <testo> [priorità]');
          } else {
            const prioritaValide = ['alta', 'normale', 'bassa'];
            let priorita = 'normale';
            let testo = args.join(' ');
            
            // Controlla se l'ultimo argomento è una priorità
            const ultimoArg = args[args.length - 1].toLowerCase();
            if (prioritaValide.includes(ultimoArg)) {
              priorita = ultimoArg;
              testo = args.slice(0, -1).join(' ');
            }
            
            todoList.aggiungi(testo, priorita);
            await todoList.salva();
            console.log(`✅ Todo aggiunto con priorità ${priorita}`);
          }
          break;
          
        case 'list':
        case 'ls':
          todoList.lista();
          break;
          
        case 'complete':
        case 'done':
          const indexComp = parseInt(args[0]) - 1;
          if (isNaN(indexComp)) {
            console.log('❌ Uso: complete <numero>');
          } else if (todoList.completa(indexComp)) {
            await todoList.salva();
            console.log('✅ Todo completato');
          } else {
            console.log('❌ Numero non valido');
          }
          break;
          
        case 'delete':
        case 'del':
        case 'rm':
          const indexDel = parseInt(args[0]) - 1;
          if (isNaN(indexDel)) {
            console.log('❌ Uso: delete <numero>');
          } else if (todoList.elimina(indexDel)) {
            await todoList.salva();
            console.log('✅ Todo eliminato');
          } else {
            console.log('❌ Numero non valido');
          }
          break;
          
        case 'edit':
          const indexEdit = parseInt(args[0]) - 1;
          const nuovoTesto = args.slice(1).join(' ');
          if (isNaN(indexEdit) || !nuovoTesto) {
            console.log('❌ Uso: edit <numero> <nuovo testo>');
          } else if (todoList.modifica(indexEdit, nuovoTesto)) {
            await todoList.salva();
            console.log('✅ Todo modificato');
          } else {
            console.log('❌ Numero non valido');
          }
          break;
          
        case 'stats':
        case 'statistiche':
          todoList.statistiche();
          break;
          
        case 'clear':
        case 'cls':
          console.clear();
          break;
          
        case 'help':
        case '?':
          mostraHelp();
          break;
          
        case 'exit':
        case 'quit':
          console.log('\n👋 Arrivederci!\n');
          continua = false;
          break;
          
        case '':
          // Ignora input vuoto
          break;
          
        default:
          console.log(`❌ Comando sconosciuto: "${comando}"`);
          console.log('Digita "help" per vedere i comandi disponibili');
      }
    }
  } catch (error) {
    console.error('\n❌ Errore:', error.message);
  } finally {
    rl.close();
  }
}

// Avvia applicazione
main().catch(console.error);
