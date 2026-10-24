# ES-HTTP-02: Client HTTP - Fetch Data

## 📋 Informazioni Generali

- **Modulo**: HTTP / HTTPS
- **Difficoltà**: 🟢 Facile
- **Tempo stimato**: 25 minuti
- **Prerequisiti**: 
  - Comprensione di richieste HTTP
  - Conoscenza di callback e stream
  - Familiarità con JSON

## 🎯 Obiettivi di Apprendimento

Al termine di questo esercizio sarai in grado di:
1. Fare richieste HTTP GET con `http.get()` o `https.get()`
2. Gestire stream di dati in arrivo
3. Parsare JSON da API remote
4. Gestire errori di rete
5. Lavorare con API pubbliche

## 📝 Descrizione

Crea un client HTTP che recupera dati da un'API pubblica (JSONPlaceholder), li processa e li visualizza in formato leggibile.

## 🔨 Task da Completare

### 1. Preparazione
- [ ] Crea cartella `es-http-02`
- [ ] Crea file `client.js`
- [ ] Scegli un endpoint (es. https://jsonplaceholder.typicode.com/users)

### 2. Implementazione Client
- [ ] Importa modulo `https`
- [ ] Usa `https.get()` per fare la richiesta
- [ ] Gestisci gli stream di dati in arrivo
- [ ] Bufferizza i chunk di dati
- [ ] Parsa il JSON ricevuto

### 3. Gestione Errori
- [ ] Gestisci errori di richiesta
- [ ] Controlla status code della risposta
- [ ] Gestisci JSON malformato

### 4. Output
- [ ] Visualizza i dati in formato leggibile
- [ ] Mostra alcune statistiche (es. numero di utenti)

## 💡 Template di Partenza

```javascript
// client.js
const https = require('https');

const API_URL = 'https://jsonplaceholder.typicode.com/users';

/**
 * Recupera dati da un'API
 * @param {string} url - URL dell'API
 * @param {function} callback - callback(error, data)
 */
function fetchData(url, callback) {
  // TODO: Implementa la richiesta HTTP
}

// Test
fetchData(API_URL, (error, data) => {
  if (error) {
    console.error('Errore:', error.message);
    return;
  }
  
  // TODO: Processa e visualizza i dati
});
```

## 📚 Concetti Chiave

### https.get()
```javascript
https.get(url, (res) => {
  // res è un IncomingMessage (stream readable)
  
  res.on('data', (chunk) => {
    // Ricevi chunks di dati
  });
  
  res.on('end', () => {
    // Tutti i dati ricevuti
  });
});
```

### Buffering dei Dati
```javascript
let data = '';
res.on('data', (chunk) => {
  data += chunk;  // Accumula i chunk
});
```

### Parsing JSON
```javascript
try {
  const parsed = JSON.parse(data);
} catch (error) {
  console.error('JSON non valido');
}
```

## 🔍 Step by Step

### Step 1: Funzione base di fetch
```javascript
function fetchData(url, callback) {
  https.get(url, (res) => {
    // Gestisci la risposta
  }).on('error', (error) => {
    callback(error, null);
  });
}
```

### Step 2: Gestisci stream di dati
```javascript
function fetchData(url, callback) {
  https.get(url, (res) => {
    let data = '';
    
    // Accumula i chunk
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    // Quando terminato
    res.on('end', () => {
      callback(null, data);
    });
    
  }).on('error', (error) => {
    callback(error, null);
  });
}
```

### Step 3: Aggiungi parsing JSON
```javascript
function fetchData(url, callback) {
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        callback(null, parsed);
      } catch (error) {
        callback(new Error('Errore parsing JSON: ' + error.message), null);
      }
    });
    
  }).on('error', (error) => {
    callback(error, null);
  });
}
```

### Soluzione Completa
```javascript
const https = require('https');

const API_URL = 'https://jsonplaceholder.typicode.com/users';

function fetchData(url, callback) {
  console.log(`📡 Richiesta a: ${url}`);
  
  https.get(url, (res) => {
    const { statusCode } = res;
    
    // Controlla status code
    if (statusCode !== 200) {
      return callback(new Error(`Errore: Status Code ${statusCode}`), null);
    }
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
      process.stdout.write('.');  // Progress indicator
    });
    
    res.on('end', () => {
      console.log('\n✅ Download completato');
      
      try {
        const parsed = JSON.parse(data);
        callback(null, parsed);
      } catch (error) {
        callback(new Error('Errore parsing JSON: ' + error.message), null);
      }
    });
    
  }).on('error', (error) => {
    callback(error, null);
  });
}

// Test: Recupera lista utenti
fetchData(API_URL, (error, users) => {
  if (error) {
    console.error('❌ Errore:', error.message);
    return;
  }
  
  console.log(`\n📊 Ricevuti ${users.length} utenti:\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Città: ${user.address.city}`);
    console.log(`   Website: ${user.website}`);
    console.log();
  });
});
```

## 🎓 Suggerimenti

1. **http vs https**: Usa il modulo corretto in base al protocollo dell'URL
2. **Encoding**: I chunk sono Buffer, concatenali come stringhe o Buffer
3. **Status Code**: Controlla sempre lo status code prima di processare i dati
4. **Timeout**: Considera di aggiungere un timeout per evitare hang infiniti
5. **Headers**: Puoi ispezionare gli headers della risposta con `res.headers`

## ✅ Criteri di Valutazione

- [ ] La richiesta viene effettuata correttamente
- [ ] I dati vengono ricevuti completamente
- [ ] Il JSON viene parsato senza errori
- [ ] Gli errori di rete sono gestiti
- [ ] Gli errori di parsing sono gestiti
- [ ] L'output è formattato in modo leggibile

## 🚀 Sfide Extra (Opzionali)

1. **Multiple Endpoints**: Fai richieste a endpoint diversi (users, posts, comments)
2. **Promise Version**: Riscrivi usando Promise o async/await
3. **Progress Bar**: Mostra una vera progress bar durante il download
4. **Retry Logic**: Se fallisce, riprova automaticamente 3 volte
5. **Caching**: Salva i dati in un file e usa la cache se disponibile
6. **POST Request**: Estendi per supportare anche richieste POST con dati
7. **Query Parameters**: Aggiungi supporto per parametri query string

## 📖 API Pubbliche da Testare

```javascript
// Utenti
'https://jsonplaceholder.typicode.com/users'

// Post
'https://jsonplaceholder.typicode.com/posts'

// Singolo utente
'https://jsonplaceholder.typicode.com/users/1'

// Todos
'https://jsonplaceholder.typicode.com/todos'

// Altre API gratuite:
// - https://api.github.com/users/github
// - https://dog.ceo/api/breeds/list/all
// - https://api.quotable.io/random
```

## 🐛 Problemi Comuni

### UNABLE_TO_VERIFY_LEAF_SIGNATURE
**Causa**: Problema con certificati SSL in ambienti particolari  
**Soluzione**: NON usare `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'` in produzione

### Timeout dopo 2 minuti
**Causa**: Il server non risponde  
**Soluzione**: 
```javascript
const req = https.get(url, callback);
req.setTimeout(10000, () => {
  req.destroy();
  callback(new Error('Timeout'));
});
```

### Data corrotta o incompleta
**Causa**: Encoding sbagliato o chunk non bufferizzati correttamente  
**Soluzione**: Usa `res.setEncoding('utf8')` per gestire automaticamente l'encoding

### JSON parsing error
**Causa**: Risposta non è JSON valido  
**Soluzione**: Verifica l'endpoint e usa try-catch intorno a JSON.parse()

## 📖 Risorse Utili

- [https module documentation](https://nodejs.org/api/https.html)
- [IncomingMessage (Response Stream)](https://nodejs.org/api/http.html#class-httpincomingmessage)
- [JSONPlaceholder API](https://jsonplaceholder.typicode.com/)
- [Public APIs List](https://github.com/public-apis/public-apis)
- [Working with streams](https://nodejs.org/api/stream.html)
