/**
 * utils.js - Libreria di utilità
 * 
 * Questo modulo dimostra diversi pattern di esportazione in Node.js
 * attraverso una collezione di funzioni di utilità.
 */

// Funzioni per la manipolazione delle stringhe
const stringUtils = {
  /**
   * Capitalizza la prima lettera di una stringa
   * @param {string} str - Stringa da capitalizzare
   * @returns {string} - Stringa capitalizzata
   */
  capitalize: (str) => {
    if (typeof str !== 'string' || !str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  /**
   * Tronca una stringa alla lunghezza specificata
   * @param {string} str - Stringa da troncare
   * @param {number} maxLength - Lunghezza massima
   * @param {string} suffix - Suffisso da aggiungere (default: '...')
   * @returns {string} - Stringa troncata
   */
  truncate: (str, maxLength, suffix = '...') => {
    if (typeof str !== 'string' || !str) return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  },
  
  /**
   * Rimuove gli spazi bianchi all'inizio e alla fine di una stringa
   * @param {string} str - Stringa da elaborare
   * @returns {string} - Stringa senza spazi bianchi
   */
  trim: (str) => {
    if (typeof str !== 'string') return '';
    return str.trim();
  }
};

// Funzioni per la manipolazione degli array
const arrayUtils = {
  /**
   * Rimuove i duplicati da un array
   * @param {Array} arr - Array da elaborare
   * @returns {Array} - Array senza duplicati
   */
  unique: (arr) => {
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr)];
  },
  
  /**
   * Appiattisce un array multidimensionale
   * @param {Array} arr - Array da appiattire
   * @returns {Array} - Array appiattito
   */
  flatten: (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.reduce((flat, next) => {
      return flat.concat(Array.isArray(next) ? arrayUtils.flatten(next) : next);
    }, []);
  },
  
  /**
   * Divide un array in chunk di dimensione specificata
   * @param {Array} arr - Array da dividere
   * @param {number} size - Dimensione di ogni chunk
   * @returns {Array} - Array di chunk
   */
  chunk: (arr, size) => {
    if (!Array.isArray(arr) || size <= 0) return [];
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
};

// Funzioni per la validazione
const validationUtils = {
  /**
   * Verifica se una stringa è un indirizzo email valido
   * @param {string} email - Email da verificare
   * @returns {boolean} - true se l'email è valida
   */
  isValidEmail: (email) => {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  /**
   * Verifica se un valore è un numero
   * @param {*} value - Valore da verificare
   * @returns {boolean} - true se il valore è un numero
   */
  isNumber: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  /**
   * Verifica se una stringa è vuota
   * @param {string} str - Stringa da verificare
   * @returns {boolean} - true se la stringa è vuota
   */
  isEmpty: (str) => {
    return !str || str.trim().length === 0;
  }
};

// Funzioni per la manipolazione degli oggetti
const objectUtils = {
  /**
   * Crea una copia profonda di un oggetto
   * @param {Object} obj - Oggetto da copiare
   * @returns {Object} - Copia dell'oggetto
   */
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },
  
  /**
   * Unisce due o più oggetti
   * @param  {...Object} objects - Oggetti da unire
   * @returns {Object} - Oggetto unito
   */
  merge: (...objects) => {
    return Object.assign({}, ...objects);
  },
  
  /**
   * Ottiene il valore di una proprietà annidata di un oggetto
   * @param {Object} obj - Oggetto da cui estrarre il valore
   * @param {string} path - Percorso della proprietà (es. 'user.address.city')
   * @param {*} defaultValue - Valore predefinito se la proprietà non esiste
   * @returns {*} - Valore della proprietà o valore predefinito
   */
  get: (obj, path, defaultValue = undefined) => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === undefined || result === null) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  }
};

// Esporta le singole funzioni di utilità
exports.capitalize = stringUtils.capitalize;
exports.truncate = stringUtils.truncate;
exports.trim = stringUtils.trim;
exports.unique = arrayUtils.unique;
exports.flatten = arrayUtils.flatten;
exports.chunk = arrayUtils.chunk;
exports.isValidEmail = validationUtils.isValidEmail;
exports.isNumber = validationUtils.isNumber;
exports.isEmpty = validationUtils.isEmpty;
exports.deepClone = objectUtils.deepClone;
exports.merge = objectUtils.merge;
exports.get = objectUtils.get;

// Esporta anche i gruppi di utilità
exports.stringUtils = stringUtils;
exports.arrayUtils = arrayUtils;
exports.validationUtils = validationUtils;
exports.objectUtils = objectUtils;