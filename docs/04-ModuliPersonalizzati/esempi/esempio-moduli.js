/**
 * esempio-moduli.js - Esempio di utilizzo dei moduli personalizzati
 * 
 * Questo script dimostra come importare e utilizzare i moduli personalizzati
 * creati in questo modulo del corso.
 */

// Importa il modulo logger
const logger = require('./logger');

// Importa il modulo utils
const utils = require('./utils');

// Configura il logger per mostrare tutti i livelli di log
logger.configure({
  level: logger.levels.DEBUG
});

logger.info('Avvio dell\'applicazione di esempio');

// Esempi di utilizzo delle funzioni di stringhe
const nome = 'mario';
logger.debug(`Stringa originale: "${nome}"`);
logger.debug(`Dopo capitalize: "${utils.capitalize(nome)}"`);

const descrizione = 'Questa è una descrizione molto lunga che verrà troncata';
logger.debug(`Stringa originale: "${descrizione}"`);
logger.debug(`Dopo truncate: "${utils.truncate(descrizione, 20)}"`);

// Esempi di utilizzo delle funzioni di array
const numeri = [1, 2, 2, 3, 3, 3, 4, 5, 5];
logger.debug(`Array originale: [${numeri}]`);
logger.debug(`Dopo unique: [${utils.unique(numeri)}]`);

const arrayNidificato = [1, [2, [3, 4]], 5, [6]];
logger.debug(`Array nidificato: ${JSON.stringify(arrayNidificato)}`);
logger.debug(`Dopo flatten: [${utils.flatten(arrayNidificato)}]`);

// Esempi di utilizzo delle funzioni di validazione
const email = 'utente@esempio.com';
logger.debug(`Email "${email}" valida: ${utils.isValidEmail(email)}`);

const emailNonValida = 'utente@esempio';
logger.debug(`Email "${emailNonValida}" valida: ${utils.isValidEmail(emailNonValida)}`);

// Esempi di utilizzo delle funzioni di oggetti
const utente = {
  nome: 'Mario',
  indirizzo: {
    via: 'Via Roma 123',
    città: 'Milano'
  }
};

logger.debug(`Oggetto ut