#!/usr/bin/env node
/**
 * Esercizio Pratico: Path Module
 * Crea percorsi per file di log con timestamp
 */

const path = require('path');

// Funzione per creare percorso log con timestamp
function creaPercorsoLog(tipo = 'app') {
  const oggi = new Date();
  const anno = oggi.getFullYear();
  const mese = String(oggi.getMonth() + 1).padStart(2, '0');
  const giorno = String(oggi.getDate()).padStart(2, '0');
  
  const nomeFile = `${tipo}-${anno}-${mese}-${giorno}.log`;
  const percorsoCompleto = path.join(__dirname, '..', 'logs', nomeFile);
  
  return {
    percorsoCompleto,
    directory: path.dirname(percorsoCompleto),
    nomeFile: path.basename(percorsoCompleto),
    estensione: path.extname(percorsoCompleto),
    nomeSenzaEstensione: path.basename(percorsoCompleto, '.log')
  };
}

// Test della funzione
console.log('=== GENERAZIONE PERCORSI LOG ===');
const logApp = creaPercorsoLog('app');
const logError = creaPercorsoLog('error');
const logAccess = creaPercorsoLog('access');

console.log('Log App:', logApp);
console.log('Log Error:', logError);
console.log('Log Access:', logAccess);

// Funzione per estrarre dominio principale da URL
function estraiDominioPrincipale(urlString) {
  try {
    const url = new URL(urlString);
    const parti = url.hostname.split('.');
    
    // Prendi gli ultimi 2 segmenti per dominio principale
    if (parti.length >= 2) {
      return parti.slice(-2).join('.');
    }
    
    return url.hostname;
  } catch (error) {
    return null;
  }
}

console.log('\n=== ESTRAZIONE DOMINIO PRINCIPALE ===');
const urlTest = [
  'https://www.sub.example.com/path',
  'http://api.github.com/users',
  'https://docs.google.com/document',
  'invalid-url'
];

urlTest.forEach(url => {
  const dominio = estraiDominioPrincipale(url);
  console.log(`${url} → ${dominio || 'INVALID'}`);
});

// Utility per normalizzare percorsi cross-platform
function costruisciPercorsoSicuro(...segmenti) {
  // Rimuovi segmenti vuoti o null
  const segmentiPuliti = segmenti.filter(s => s && s.trim());
  
  // Unisci usando path.join per compatibilità OS
  const percorso = path.join(...segmentiPuliti);
  
  // Normalizza il percorso
  return path.normalize(percorso);
}

console.log('\n=== COSTRUZIONE PERCORSI SICURI ===');
const esempiPercorsi = [
  ['home', 'user', '', 'documents', null, 'file.txt'],
  ['..', 'parent', 'folder', 'file.js'],
  ['/', 'absolute', 'path', 'to', 'file']
];

esempiPercorsi.forEach((segmenti, index) => {
  const risultato = costruisciPercorsoSicuro(...segmenti);
  console.log(`Esempio ${index + 1}:`, segmenti, '→', risultato);
});