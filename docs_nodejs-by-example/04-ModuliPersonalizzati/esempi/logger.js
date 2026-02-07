/**
 * logger.js - Modulo personalizzato per il logging
 * 
 * Questo modulo dimostra come creare un sistema di logging personalizzato
 * utilizzando diversi pattern di esportazione in Node.js.
 */

// Livelli di log supportati
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

// Configurazione predefinita
let config = {
  level: LOG_LEVELS.INFO,
  colorize: true,
  timestamp: true
};

// Colori ANSI per i diversi livelli di log
const COLORS = {
  DEBUG: '\x1b[36m', // Ciano
  INFO: '\x1b[32m',  // Verde
  WARN: '\x1b[33m',  // Giallo
  ERROR: '\x1b[31m', // Rosso
  RESET: '\x1b[0m'   // Reset
};

/**
 * Formatta un messaggio di log
 * @param {string} level - Livello del log
 * @param {string} message - Messaggio da loggare
 * @returns {string} - Messaggio formattato
 */
function formatMessage(level, message) {
  let formattedMessage = '';
  
  // Aggiunge timestamp se configurato
  if (config.timestamp) {
    const now = new Date();
    formattedMessage += `[${now.toISOString()}] `;
  }
  
  // Aggiunge il livello di log
  formattedMessage += `[${level}] `;
  
  // Aggiunge il messaggio
  formattedMessage += message;
  
  // Aggiunge colore se configurato
  if (config.colorize) {
    return `${COLORS[level]}${formattedMessage}${COLORS.RESET}`;
  }
  
  return formattedMessage;
}

/**
 * Verifica se un livello di log deve essere mostrato in base alla configurazione
 * @param {string} level - Livello del log da verificare
 * @returns {boolean} - true se il log deve essere mostrato
 */
function shouldLog(level) {
  const levels = Object.values(LOG_LEVELS);
  const configLevelIndex = levels.indexOf(config.level);
  const messageLevelIndex = levels.indexOf(level);
  
  return messageLevelIndex >= configLevelIndex;
}

/**
 * Funzione di log generica
 * @param {string} level - Livello del log
 * @param {string} message - Messaggio da loggare
 */
function log(level, message) {
  if (!shouldLog(level)) return;
  
  const formattedMessage = formatMessage(level, message);
  
  switch(level) {
    case LOG_LEVELS.ERROR:
      console.error(formattedMessage);
      break;
    case LOG_LEVELS.WARN:
      console.warn(formattedMessage);
      break;
    default:
      console.log(formattedMessage);
  }
}

// Metodi pubblici del logger
const logger = {
  debug: (message) => log(LOG_LEVELS.DEBUG, message),
  info: (message) => log(LOG_LEVELS.INFO, message),
  warn: (message) => log(LOG_LEVELS.WARN, message),
  error: (message) => log(LOG_LEVELS.ERROR, message),
  
  // Metodo per configurare il logger
  configure: (newConfig) => {
    config = { ...config, ...newConfig };
    return logger; // Per permettere il method chaining
  },
  
  // Espone i livelli di log
  levels: LOG_LEVELS
};

// Esporta il modulo utilizzando module.exports
module.exports = logger;