/**
 * Esempio 06.08 - Form con Validazione
 * 
 * Dimostra validazione completa dell'input utente.
 * 
 * Concetti dimostrati:
 * - Validazione con regex (espressioni regolari)
 * - Oggetto validatori riusabile
 * - Funzione helper per validazione con retry
 * - Messaggi di errore specifici
 * - Conferma password
 * - Validazione codice fiscale italiano
 * - Feedback utente chiaro
 * 
 * Pattern utilizzati:
 * - Strategy pattern per validatori
 * - Retry pattern con limite tentativi
 * - Factory pattern per risultati validazione
 * 
 * Validazioni implementate:
 * - Nome (solo lettere, min 2 caratteri)
 * - Email (formato standard)
 * - Telefono (10 cifre)
 * - Età (0-120)
 * - Password (8+ caratteri, maiuscola, minuscola, numero)
 * - Codice fiscale (formato italiano)
 * - CAP (5 cifre)
 */

const readline = require('readline/promises');

// Crea interfaccia readline globale
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Oggetto contenente tutte le funzioni di validazione
 * 
 * Ogni validatore:
 * - Riceve input come stringa
 * - Restituisce oggetto { valido: boolean, errore?: string, valore?: any }
 * 
 * Pattern Strategy: ogni validatore è una strategia intercambiabile
 */
const validatori = {
  /**
   * Validatore per nomi
   * - Minimo 2 caratteri
   * - Solo lettere (incluse accentate italiane)
   * - Spazi permessi (per nomi composti)
   */
  nome: (input) => {
    // Controlla lunghezza minima
    if (!input || input.trim().length < 2) {
      return { valido: false, errore: 'Il nome deve avere almeno 2 caratteri' };
    }
    // Regex: solo lettere (anche accentate) e spazi
    if (!/^[a-zA-Zàèéìòù\s]+$/.test(input)) {
      return { valido: false, errore: 'Il nome può contenere solo lettere' };
    }
    return { valido: true, valore: input.trim() };
  },
  
  /**
   * Validatore per email
   * Usa regex semplificata (per produzione usa libreria specializzata)
   * Formato: qualcosa@qualcosa.qualcosa
   */
  email: (input) => {
    // Regex basilare per email (non copre tutti i casi edge)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input)) {
      return { valido: false, errore: 'Email non valida' };
    }
    // Normalizza: lowercase e trim
    return { valido: true, valore: input.toLowerCase().trim() };
  },
  
  telefono: (input) => {
    const cleaned = input.replace(/[\s-]/g, '');
    if (!/^\d{10}$/.test(cleaned)) {
      return { valido: false, errore: 'Il telefono deve contenere 10 cifre' };
    }
    return { valido: true, valore: cleaned };
  },
  
  eta: (input) => {
    const eta = parseInt(input);
    if (isNaN(eta) || eta < 0 || eta > 120) {
      return { valido: false, errore: 'Età non valida (0-120)' };
    }
    return { valido: true, valore: eta };
  },
  
  password: (input) => {
    if (input.length < 8) {
      return { valido: false, errore: 'La password deve essere di almeno 8 caratteri' };
    }
    if (!/[A-Z]/.test(input)) {
      return { valido: false, errore: 'La password deve contenere almeno una maiuscola' };
    }
    if (!/[a-z]/.test(input)) {
      return { valido: false, errore: 'La password deve contenere almeno una minuscola' };
    }
    if (!/[0-9]/.test(input)) {
      return { valido: false, errore: 'La password deve contenere almeno un numero' };
    }
    return { valido: true, valore: input };
  },
  
  codiceFiscale: (input) => {
    const cf = input.toUpperCase().trim();
    if (!/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(cf)) {
      return { valido: false, errore: 'Codice fiscale non valido' };
    }
    return { valido: true, valore: cf };
  },
  
  cap: (input) => {
    if (!/^\d{5}$/.test(input)) {
      return { valido: false, errore: 'Il CAP deve contenere 5 cifre' };
    }
    return { valido: true, valore: input };
  }
};

/**
 * Funzione helper per chiedere input con validazione e retry
 * 
 * Pattern Retry: tenta fino a N volte, poi fallisce
 * 
 * @param {string} domanda - Domanda da porre
 * @param {Function} validatore - Funzione di validazione
 * @param {number} tentativi - Numero massimo tentativi (default 3)
 * @returns {Promise<any>} Valore validato
 * @throws {Error} Se superati i tentativi massimi
 * 
 * Esempio uso:
 *   const email = await chiediConValidazione('Email: ', validatori.email);
 */
async function chiediConValidazione(domanda, validatore, tentativi = 3) {
  // Loop per N tentativi
  for (let i = 0; i < tentativi; i++) {
    // Chiedi input
    const input = await rl.question(domanda);
    
    // Valida usando il validatore passato
    const risultato = validatore(input);
    
    // Se valido, restituisci il valore (può essere normalizzato)
    if (risultato.valido) {
      return risultato.valore;
    }
    
    // Se non valido, mostra errore
    console.log(`❌ ${risultato.errore}`);
    
    // Mostra contatore tentativi (tranne all'ultimo)
    if (i < tentativi - 1) {
      console.log(`   (Tentativo ${i + 1} di ${tentativi})`);
    }
  }
  
  // Superati i tentativi: lancia eccezione
  throw new Error('Numero massimo di tentativi raggiunto');
}

// Funzione per conferma password
async function confermaPassword(passwordOriginale) {
  for (let i = 0; i < 3; i++) {
    const conferma = await rl.question('Conferma password: ');
    if (conferma === passwordOriginale) {
      return true;
    }
    console.log('❌ Le password non coincidono');
    if (i < 2) {
      console.log(`   (Tentativo ${i + 1} di 3)`);
    }
  }
  return false;
}

// Form di registrazione completo
async function formRegistrazione() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║          FORM DI REGISTRAZIONE UTENTE              ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  try {
    // Raccolta dati con validazione
    console.log('━━━ Dati Anagrafici ━━━');
    const nome = await chiediConValidazione(
      'Nome: ',
      validatori.nome
    );
    
    const cognome = await chiediConValidazione(
      'Cognome: ',
      validatori.nome
    );
    
    const eta = await chiediConValidazione(
      'Età: ',
      validatori.eta
    );
    
    const codiceFiscale = await chiediConValidazione(
      'Codice Fiscale: ',
      validatori.codiceFiscale
    );
    
    console.log('\n━━━ Contatti ━━━');
    const email = await chiediConValidazione(
      'Email: ',
      validatori.email
    );
    
    const telefono = await chiediConValidazione(
      'Telefono (10 cifre): ',
      validatori.telefono
    );
    
    const cap = await chiediConValidazione(
      'CAP: ',
      validatori.cap
    );
    
    console.log('\n━━━ Credenziali ━━━');
    console.log('La password deve contenere:');
    console.log('  • Almeno 8 caratteri');
    console.log('  • Almeno una maiuscola');
    console.log('  • Almeno una minuscola');
    console.log('  • Almeno un numero\n');
    
    const password = await chiediConValidazione(
      'Password: ',
      validatori.password
    );
    
    const passwordConfermata = await confermaPassword(password);
    if (!passwordConfermata) {
      throw new Error('Password non confermata correttamente');
    }
    
    // Riepilogo dati
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║               RIEPILOGO REGISTRAZIONE              ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    const datiUtente = {
      anagrafica: {
        nome,
        cognome,
        eta,
        codiceFiscale
      },
      contatti: {
        email,
        telefono,
        cap
      },
      credenziali: {
        password: '••••••••' // Nascosta
      }
    };
    
    console.log('Dati Anagrafici:');
    console.log(`  Nome completo: ${nome} ${cognome}`);
    console.log(`  Età: ${eta} anni`);
    console.log(`  Codice Fiscale: ${codiceFiscale}`);
    
    console.log('\nContatti:');
    console.log(`  Email: ${email}`);
    console.log(`  Telefono: ${telefono}`);
    console.log(`  CAP: ${cap}`);
    
    console.log('\nCredenziali:');
    console.log(`  Password: ${datiUtente.credenziali.password}`);
    
    // Conferma finale
    const conferma = await rl.question('\nConfermi i dati? (s/n): ');
    
    if (conferma.toLowerCase() === 's') {
      console.log('\n✅ Registrazione completata con successo!');
      console.log('📧 Ti abbiamo inviato un\'email di conferma a:', email);
      return datiUtente;
    } else {
      console.log('\n❌ Registrazione annullata');
      return null;
    }
    
  } catch (error) {
    console.log(`\n❌ Errore durante la registrazione: ${error.message}`);
    return null;
  }
}

// Esegui form
async function main() {
  try {
    await formRegistrazione();
  } catch (error) {
    console.error('Errore:', error);
  } finally {
    rl.close();
  }
}

main();
