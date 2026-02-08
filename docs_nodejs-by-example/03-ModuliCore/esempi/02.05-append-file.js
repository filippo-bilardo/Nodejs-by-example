/**
 * ESEMPIO 02.05 - Aggiungere Contenuto a un File (Append)
 * 
 * Questo esempio mostra come aggiungere contenuto a un file esistente
 * SENZA sovrascrivere il contenuto precedente.
 * 
 * appendFile() è utile per:
 * - File di log
 * - Aggiungere record a file di dati
 * - Accumulare output nel tempo
 * 
 * Se il file non esiste, viene creato automaticamente.
 */

const fs = require('fs');

// ============================================
// METODO 1: SINCRONO
// ============================================
console.log('=== APPEND SINCRONO ===');
try {
  // Aggiungi una nuova riga al file
  fs.appendFileSync('log-sync.txt', 'Nuova riga aggiunta in modo sincrono\n');
  console.log('✓ Contenuto aggiunto a log-sync.txt');
} catch (err) {
  console.error('Errore nell\'append sincrono:', err.message);
}

// ============================================
// METODO 2: ASINCRONO CON CALLBACK
// ============================================
console.log('\n=== APPEND ASINCRONO CON CALLBACK ===');
const timestamp = new Date().toISOString();
const logEntry = `[${timestamp}] Evento registrato con callback\n`;

fs.appendFile('log-async.txt', logEntry, (err) => {
  if (err) {
    console.error('Errore nell\'append asincrono:', err.message);
    return;
  }
  console.log('✓ Log aggiunto a log-async.txt');
});

// ============================================
// METODO 3: ASINCRONO CON PROMISE
// ============================================
console.log('\n=== APPEND ASINCRONO CON PROMISE ===');

/**
 * Funzione helper per aggiungere una riga di log
 * @param {string} filename - Nome del file di log
 * @param {string} message - Messaggio da loggare
 */
async function aggiungiLog(filename, message) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    await fs.promises.appendFile(filename, logEntry);
    console.log(`✓ Log aggiunto a ${filename}`);
  } catch (err) {
    console.error('Errore nell\'append con Promise:', err.message);
  }
}

// Utilizzo della funzione helper
aggiungiLog('log-promise.txt', 'Applicazione avviata');
aggiungiLog('log-promise.txt', 'Utente connesso');
aggiungiLog('log-promise.txt', 'Operazione completata');

// ============================================
// ESEMPIO PRATICO: SISTEMA DI LOGGING
// ============================================
/**
 * Classe semplice per gestire un file di log
 */
class SimpleLogger {
  constructor(filename) {
    this.filename = filename;
  }
  
  /**
   * Scrive un messaggio di log con livello e timestamp
   * @param {string} level - Livello di log (INFO, WARN, ERROR)
   * @param {string} message - Messaggio da loggare
   */
  async log(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    try {
      await fs.promises.appendFile(this.filename, logEntry);
    } catch (err) {
      console.error('Errore nel logging:', err.message);
    }
  }
  
  async info(message) {
    await this.log('INFO', message);
  }
  
  async warn(message) {
    await this.log('WARN', message);
  }
  
  async error(message) {
    await this.log('ERROR', message);
  }
}

// Utilizzo del logger
async function testaLogger() {
  console.log('\n=== TEST SISTEMA DI LOGGING ===');
  const logger = new SimpleLogger('app.log');
  
  await logger.info('Applicazione avviata');
  await logger.info('Connessione al database riuscita');
  await logger.warn('Cache quasi piena (80%)');
  await logger.error('Impossibile connettersi al servizio esterno');
  await logger.info('Applicazione terminata');
  
  console.log('✓ Tutti i log scritti in app.log');
  
  // Leggi e mostra il contenuto del file di log
  const logContent = await fs.promises.readFile('app.log', 'utf8');
  console.log('\nContenuto di app.log:');
  console.log(logContent);
}

testaLogger();
