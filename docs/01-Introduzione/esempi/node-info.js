/**
 * Esercizio 1.4: Informazioni sul Sistema
 * 
 * Questo script utilizza l'oggetto globale 'process' di Node.js per ottenere
 * informazioni sul sistema e sull'ambiente di esecuzione.
 */

// Visualizziamo varie informazioni sul sistema
console.log('Versione Node.js:', process.version);
console.log('Sistema operativo:', process.platform);
console.log('Architettura CPU:', process.arch);
console.log('Directory corrente:', process.cwd());
console.log('Tempo di esecuzione (secondi):', process.uptime());

// Visualizziamo anche le variabili d'ambiente (commentato per evitare di mostrare informazioni sensibili)
// console.log('Variabili d\'ambiente:', process.env);

/**
 * Note aggiuntive:
 * - L'oggetto 'process' è globale in Node.js e non richiede import
 * - Fornisce un'interfaccia per interagire con il processo Node.js in esecuzione
 * - È utile per ottenere informazioni sul sistema e gestire il processo
 */