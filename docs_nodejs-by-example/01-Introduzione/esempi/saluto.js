#!/usr/bin/env node

/**
 * Programma che prende il nome come argomento e stampa un saluto personalizzato
 * 
 * Utilizzo:
 *   node saluto.js Mario
 *   node saluto.js "Mario Rossi"
 *   node saluto.js Mario Rossi
 */

// process.argv contiene gli argomenti da riga di comando
// [0] = percorso node
// [1] = percorso dello script
// [2+] = argomenti passati dall'utente

function saluta() {
  // Ottieni gli argomenti (escludendo i primi due)
  const args = process.argv.slice(2);
  
  // Verifica se è stato passato almeno un argomento
  if (args.length === 0) {
    console.log('❌ Errore: Devi fornire un nome!');
    console.log('\n📖 Utilizzo:');
    console.log('   node saluto.js <nome>');
    console.log('\n💡 Esempi:');
    console.log('   node saluto.js Mario');
    console.log('   node saluto.js "Mario Rossi"');
    console.log('   node saluto.js Mario Rossi');
    process.exit(1);
  }
  
  // Unisci tutti gli argomenti in un unico nome
  const nome = args.join(' ');
  
  // Ottieni l'ora corrente per un saluto appropriato
  const ora = new Date().getHours();
  let salutoTemporale;
  
  if (ora >= 5 && ora < 12) {
    salutoTemporale = 'Buongiorno';
  } else if (ora >= 12 && ora < 18) {
    salutoTemporale = 'Buon pomeriggio';
  } else if (ora >= 18 && ora < 22) {
    salutoTemporale = 'Buonasera';
  } else {
    salutoTemporale = 'Buonanotte';
  }
  
  // Stampa il saluto personalizzato
  console.log('\n' + '='.repeat(50));
  console.log(`🎉 ${salutoTemporale}, ${nome}!`);
  console.log(`👋 Benvenuto nel mondo di Node.js!`);
  console.log('='.repeat(50) + '\n');
  
  // Informazioni aggiuntive
  console.log(`📅 Data: ${new Date().toLocaleDateString('it-IT')}`);
  console.log(`⏰ Ora: ${new Date().toLocaleTimeString('it-IT')}`);
  console.log(`💻 Node.js versione: ${process.version}`);
  console.log(`🖥️  Sistema operativo: ${process.platform}`);
  console.log();
}

// Esegui la funzione
saluta();

// Output di esempio, eseguendo `node saluto.js "Mario Rossi"` alle 10:30:
/*
==================================================
🎉 Buongiorno, Mario Rossi!
👋 Benvenuto nel mondo di Node.js!
==================================================

📅 Data: 13/10/2025
⏰ Ora: 16:21:19
💻 Node.js versione: v24.6.0
🖥️ Sistema operativo: linux
*/
