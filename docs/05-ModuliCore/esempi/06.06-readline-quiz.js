/**
 * Esempio 06.06 - Quiz Interattivo
 * 
 * Dimostra un quiz a risposta multipla completo con:
 * - Domande da database
 * - Validazione risposte
 * - Punteggio e statistiche
 * - Feedback immediato
 * - Riepilogo finale
 * 
 * Concetti dimostrati:
 * - readline/promises (API moderna)
 * - Array di oggetti per database domande
 * - Validazione input con loop
 * - Calcolo percentuali
 * - UI con box-drawing characters
 * - Gestione stato (punteggio, risposte)
 * 
 * Pattern utilizzati:
 * - Iterazione sequenziale con for-of
 * - Validazione con while loop
 * - Accumulo risultati in array
 */

const readline = require('readline/promises');

/**
 * Database domande del quiz
 * 
 * Ogni domanda ha:
 * - domanda: testo della domanda
 * - risposte: array di opzioni (a, b, c, d)
 * - corretta: lettera della risposta corretta
 * - spiegazione: feedback educativo
 * 
 * Facile aggiungere domande: basta aggiungere oggetti all'array
 */
const domande = [
  {
    domanda: 'Qual è la capitale dell\'Italia?',
    risposte: ['a) Milano', 'b) Roma', 'c) Napoli', 'd) Torino'],
    corretta: 'b',
    spiegazione: 'Roma è la capitale d\'Italia dal 1871.'
  },
  {
    domanda: 'Quanto fa 15 + 27?',
    risposte: ['a) 41', 'b) 42', 'c) 43', 'd) 44'],
    corretta: 'b',
    spiegazione: '15 + 27 = 42'
  },
  {
    domanda: 'Chi ha scritto "I Promessi Sposi"?',
    risposte: ['a) Dante Alighieri', 'b) Giovanni Boccaccio', 'c) Alessandro Manzoni', 'd) Ugo Foscolo'],
    corretta: 'c',
    spiegazione: 'Alessandro Manzoni è l\'autore de "I Promessi Sposi" (1827).'
  },
  {
    domanda: 'Quale linguaggio usa Node.js?',
    risposte: ['a) Python', 'b) Java', 'c) JavaScript', 'd) C++'],
    corretta: 'c',
    spiegazione: 'Node.js esegue codice JavaScript lato server.'
  },
  {
    domanda: 'Quanti bit ci sono in un byte?',
    risposte: ['a) 4', 'b) 8', 'c) 16', 'd) 32'],
    corretta: 'b',
    spiegazione: 'Un byte è composto da 8 bit.'
  }
];

/**
 * Funzione principale che gestisce il quiz
 * 
 * Flusso:
 * 1. Setup interfaccia
 * 2. Mostra titolo
 * 3. Per ogni domanda:
 *    - Mostra domanda e opzioni
 *    - Valida input utente
 *    - Verifica correttezza
 *    - Mostra feedback
 * 4. Calcola e mostra risultati finali
 * 5. Mostra riepilogo risposte
 */
async function avviaQuiz() {
  // Crea interfaccia readline/promises (API moderna)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Pulisci schermo e mostra titolo
  console.clear();
  console.log('╔════════════════════════════════════╗');
  console.log('║        QUIZ INTERATTIVO            ║');
  console.log('╚════════════════════════════════════╝\n');
  
  // Variabili di stato del quiz
  let punteggio = 0;       // Numero risposte corrette
  const risposte = [];     // Array per memorizzare tutte le risposte
  
  try {
    /**
     * LOOP DOMANDE
     * Itera attraverso tutte le domande in sequenza
     */
    for (let i = 0; i < domande.length; i++) {
      const q = domande[i];
      
      // Mostra header domanda con progresso
      console.log(`\n━━━ Domanda ${i + 1} di ${domande.length} ━━━`);
      console.log(`\n${q.domanda}\n`);
      
      // Mostra tutte le opzioni di risposta
      q.risposte.forEach(r => console.log(`  ${r}`));
      
      /**
       * VALIDAZIONE INPUT
       * Loop fino a quando l'utente inserisce una risposta valida (a/b/c/d)
       */
      let rispostaValida = false;
      let risposta;
      
      while (!rispostaValida) {
        risposta = (await rl.question('\nRisposta (a/b/c/d): ')).toLowerCase();
        
        // Controlla se la risposta è tra quelle permesse
        if (['a', 'b', 'c', 'd'].includes(risposta)) {
          rispostaValida = true;
        } else {
          console.log('⚠️  Inserisci a, b, c o d');
        }
      }
      
      /**
       * VERIFICA RISPOSTA
       * Confronta la risposta dell'utente con quella corretta
       */
      const corretta = risposta === q.corretta;
      risposte.push({
        domanda: q.domanda,
        risposta,
        corretta,
        rispostaCorretta: q.corretta
      });
      
      if (corretta) {
        console.log('\n✅ Corretto!');
        punteggio++;
      } else {
        console.log(`\n❌ Sbagliato! La risposta corretta era: ${q.corretta}`);
      }
      
      console.log(`💡 ${q.spiegazione}`);
      
      // Pausa tra domande
      if (i < domande.length - 1) {
        await rl.question('\nPremi INVIO per la prossima domanda...');
        // Pulisce console
        console.clear();
      }
    }
    
    // Risultati finali
    console.log('\n\n╔════════════════════════════════════╗');
    console.log('║          RISULTATI FINALI          ║');
    console.log('╚════════════════════════════════════╝\n');
    
    const percentuale = (punteggio / domande.length) * 100;
    console.log(`Punteggio: ${punteggio}/${domande.length}`);
    console.log(`Percentuale: ${percentuale.toFixed(0)}%`);
    
    // Valutazione
    if (percentuale === 100) {
      console.log('\n🏆 Perfetto! Complimenti!');
    } else if (percentuale >= 80) {
      console.log('\n🌟 Ottimo lavoro!');
    } else if (percentuale >= 60) {
      console.log('\n👍 Buon risultato!');
    } else if (percentuale >= 40) {
      console.log('\n📚 Puoi migliorare!');
    } else {
      console.log('\n💪 Non mollare, riprova!');
    }
    
    // Riepilogo risposte
    console.log('\n━━━ RIEPILOGO RISPOSTE ━━━');
    risposte.forEach((r, i) => {
      const icon = r.corretta ? '✅' : '❌';
      console.log(`\n${i + 1}. ${icon} ${r.domanda}`);
      console.log(`   Tua risposta: ${r.risposta} | Corretta: ${r.rispostaCorretta}`);
    });
    
  } catch (error) {
    console.error('\nErrore:', error.message);
  } finally {
    rl.close();
  }
}

// Avvia quiz
avviaQuiz();
