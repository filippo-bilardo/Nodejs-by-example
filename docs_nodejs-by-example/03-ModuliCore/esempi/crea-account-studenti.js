#!/usr/bin/env node
/**
 * Script per creare account Linux da file CSV studenti
 * 
 * Funzionalità:
 * - Legge file studenti.csv con readline
 * - Per ogni studente crea un account Linux
 * - Home directory basata sul nome della classe
 * - Esegue comandi useradd tramite child_process
 * 
 * Formato CSV atteso:
 * classe,cognome,nome,username
 * 3A,Rossi,Marco,rossi.marco
 * 
 * Requisiti:
 * - Eseguire come root (sudo)
 * - Linux con comando useradd
 * 
 * Uso:
 *   sudo node crea-account-studenti.js
 */

const readline = require('readline');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Configurazione
const CSV_FILE = 'crea-account_studenti.csv';
const BASE_HOME_DIR = '/home';  // Directory base per le classi
const DEFAULT_SHELL = '/bin/bash';
const DEFAULT_PASSWORD = 'Studente123!';  // Password temporanea

/**
 * Classe per gestire la creazione degli account studenti
 */
class StudentAccountManager {
  constructor() {
    this.studentiProcessati = 0;
    this.accountCreati = 0;
    this.errori = [];
  }

  /**
   * Verifica se lo script è eseguito come root
   */
  checkRoot() {
    if (process.getuid && process.getuid() !== 0) {
      console.error('❌ ERRORE: Questo script deve essere eseguito come root');
      console.error('   Usa: sudo node crea-account-studenti.js');
      process.exit(1);
    }
  }

  /**
   * Verifica se un utente esiste già
   * @param {string} username - Nome utente da verificare
   * @returns {boolean} true se l'utente esiste
   */
  userExists(username) {
    try {
      execSync(`id ${username}`, { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Crea la directory home per una classe se non esiste
   * @param {string} classe - Nome della classe (es: "3A")
   */
  createClassHomeDir(classe) {
    const classDir = path.join(BASE_HOME_DIR, classe);
    
    try {
      if (!fs.existsSync(classDir)) {
        fs.mkdirSync(classDir, { recursive: true, mode: 0o755 });
        console.log(`📁 Directory classe creata: ${classDir}`);
      }
      return classDir;
    } catch (error) {
      throw new Error(`Impossibile creare directory ${classDir}: ${error.message}`);
    }
  }

  /**
   * Crea un account utente Linux
   * @param {Object} studente - Dati dello studente
   * @param {string} studente.classe - Classe dello studente
   * @param {string} studente.cognome - Cognome
   * @param {string} studente.nome - Nome
   * @param {string} studente.username - Username
   */
  createAccount(studente) {
    const { classe, cognome, nome, username } = studente;

    // Verifica se l'utente esiste già
    if (this.userExists(username)) {
      console.log(`⚠️  Utente ${username} esiste già - saltato`);
      return false;
    }

    try {
      // Crea directory classe
      const classDir = this.createClassHomeDir(classe);
      
      // Home directory dell'utente dentro la classe
      const homeDir = path.join(classDir, username);

      console.log(`\n🔄 Creazione account per: ${nome} ${cognome}`);
      console.log(`   Username: ${username}`);
      console.log(`   Classe: ${classe}`);
      console.log(`   Home: ${homeDir}`);

      /**
       * Comando useradd con opzioni:
       * -m : crea home directory
       * -d : specifica percorso home directory
       * -s : specifica shell
       * -c : commento (nome completo)
       */
      const command = `useradd -m -d "${homeDir}" -s ${DEFAULT_SHELL} -c "${nome} ${cognome}" ${username}`;
      
      // Esegue comando (lancia eccezione se fallisce)
      execSync(command, { stdio: 'pipe' });

      // Imposta password
      execSync(`echo "${username}:${DEFAULT_PASSWORD}" | chpasswd`, { stdio: 'pipe' });

      // Forza cambio password al primo login
      execSync(`chage -d 0 ${username}`, { stdio: 'pipe' });

      // Imposta permessi corretti sulla home
      execSync(`chmod 750 ${homeDir}`, { stdio: 'pipe' });
      execSync(`chown ${username}:${username} ${homeDir}`, { stdio: 'pipe' });

      console.log(`✅ Account ${username} creato con successo`);
      
      this.accountCreati++;
      return true;

    } catch (error) {
      const errorMsg = `Errore creazione ${username}: ${error.message}`;
      console.error(`❌ ${errorMsg}`);
      this.errori.push(errorMsg);
      return false;
    }
  }

  /**
   * Processa il file CSV e crea gli account
   */
  async processCSV() {
    // Verifica esistenza file
    if (!fs.existsSync(CSV_FILE)) {
      console.error(`❌ File ${CSV_FILE} non trovato`);
      process.exit(1);
    }

    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║   CREAZIONE ACCOUNT STUDENTI DA FILE CSV           ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    console.log(`📄 Lettura file: ${CSV_FILE}`);
    console.log(`🏠 Directory base: ${BASE_HOME_DIR}\n`);

    // Crea interfaccia readline per leggere il file
    const fileStream = fs.createReadStream(CSV_FILE);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity  // Gestisce sia \n che \r\n
    });

    let isFirstLine = true;  // Flag per saltare l'header

    // Processa ogni riga del CSV
    for await (const line of rl) {
      // Salta riga vuota
      if (!line.trim()) {
        continue;
      }

      // Salta header (prima riga)
      if (isFirstLine) {
        isFirstLine = false;
        console.log(`📋 Header CSV: ${line}\n`);
        continue;
      }

      // Parse della riga CSV
      const [classe, cognome, nome, username] = line.split(',').map(s => s.trim());

      // Validazione dati
      if (!classe || !cognome || !nome || !username) {
        console.warn(`⚠️  Riga malformata saltata: ${line}`);
        continue;
      }

      // Incrementa contatore
      this.studentiProcessati++;

      // Crea account
      const studente = { classe, cognome, nome, username };
      this.createAccount(studente);
    }

    // Mostra statistiche finali
    this.printSummary();
  }

  /**
   * Mostra riepilogo operazioni
   */
  printSummary() {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║              RIEPILOGO OPERAZIONI                  ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
    
    console.log(`📊 Statistiche:`);
    console.log(`   Studenti processati: ${this.studentiProcessati}`);
    console.log(`   Account creati: ${this.accountCreati}`);
    console.log(`   Errori: ${this.errori.length}`);

    if (this.accountCreati > 0) {
      console.log(`\n✅ ${this.accountCreati} account creati con successo`);
      console.log(`\n🔐 Password temporanea: ${DEFAULT_PASSWORD}`);
      console.log(`   Gli utenti dovranno cambiarla al primo login\n`);
    }

    if (this.errori.length > 0) {
      console.log(`\n❌ Errori riscontrati:`);
      this.errori.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err}`);
      });
      console.log('');
    }

    // Lista directory classi create
    if (fs.existsSync(BASE_HOME_DIR)) {
      console.log(`📁 Directory classi in ${BASE_HOME_DIR}:`);
      try {
        const classi = fs.readdirSync(BASE_HOME_DIR);
        classi.forEach(classe => {
          const classPath = path.join(BASE_HOME_DIR, classe);
          if (fs.statSync(classPath).isDirectory()) {
            const studenti = fs.readdirSync(classPath);
            console.log(`   ${classe}/ (${studenti.length} studenti)`);
          }
        });
      } catch (error) {
        console.error(`   Errore lettura directory: ${error.message}`);
      }
    }

    console.log('\n✨ Operazione completata!\n');
  }
}

// ============================================================================
// MAIN - Esecuzione script
// ============================================================================

/**
 * Funzione principale
 */
async function main() {
  const manager = new StudentAccountManager();

  try {
    // Verifica permessi root
    manager.checkRoot();

    // Processa CSV e crea account
    await manager.processCSV();

  } catch (error) {
    console.error(`\n❌ ERRORE FATALE: ${error.message}\n`);
    process.exit(1);
  }
}

// Gestione Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Operazione interrotta dall\'utente\n');
  process.exit(0);
});

// Avvia script
main();
