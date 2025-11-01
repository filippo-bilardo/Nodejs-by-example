# Gestione degli Errori: Callback, Promise e Async/Await

## 1. Callback (Pattern Tradizionale)

Nel pattern callback, gli errori vengono gestiti tramite la **convenzione error-first callback**: il primo parametro è sempre l'errore (null se non ci sono errori), seguito dai dati.

```javascript
// Pattern error-first callback
function loadUserData(userId, callback) {
    setTimeout(() => {
        if (userId <= 0) {
            callback(new Error('ID utente non valido'), null);
        } else {
            callback(null, { id: userId, name: 'Mario' });
        }
    }, 1000);
}

// Utilizzo
loadUserData(5, (error, user) => {
    if (error) {
        console.error('Errore:', error.message);
        return;
    }
    console.log('Utente caricato:', user);
});
```

### Problemi dei Callback

**Callback Hell (Piramide del destino)**
```javascript
loadUser(userId, (err1, user) => {
    if (err1) return handleError(err1);
    
    loadPosts(user.id, (err2, posts) => {
        if (err2) return handleError(err2);
        
        loadComments(posts[0].id, (err3, comments) => {
            if (err3) return handleError(err3);
            
            // Codice sempre più annidato...
            console.log(comments);
        });
    });
});
```

**Svantaggi:**
- Codice difficile da leggere e mantenere
- Gestione errori ripetitiva
- Difficile composizione di operazioni asincrone
- Facile dimenticare di gestire errori

---

## 2. Promise (ES6/ES2015)

Le Promise forniscono un modo più elegante per gestire errori tramite il metodo `.catch()` o il secondo parametro di `.then()`.

```javascript
function loadUserData(userId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId <= 0) {
                reject(new Error('ID utente non valido'));
            } else {
                resolve({ id: userId, name: 'Mario' });
            }
        }, 1000);
    });
}

// Utilizzo con .catch()
loadUserData(5)
    .then(user => {
        console.log('Utente caricato:', user);
        return loadPosts(user.id);
    })
    .then(posts => {
        console.log('Post caricati:', posts);
    })
    .catch(error => {
        // Cattura errori da qualsiasi punto della catena
        console.error('Errore:', error.message);
    })
    .finally(() => {
        // Eseguito sempre, con o senza errori
        console.log('Operazione completata');
    });
```

### Gestione Errori nella Catena

```javascript
fetch('https://api.example.com/users/123')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(user => {
        console.log('Utente:', user);
        // Simula un errore
        if (!user.email) {
            throw new Error('Email mancante');
        }
    })
    .catch(error => {
        // Cattura errori da fetch, parsing JSON, o throw espliciti
        console.error('Errore nella catena:', error.message);
    });
```

### Pattern di Propagazione degli Errori

```javascript
function getUserWithPosts(userId) {
    return loadUser(userId)
        .then(user => {
            return loadPosts(user.id)
                .then(posts => ({ user, posts }));
        })
        .catch(error => {
            console.error('Errore specifico:', error);
            throw error; // Propaga l'errore al chiamante
        });
}

// Il chiamante può gestire l'errore propagato
getUserWithPosts(123)
    .then(data => console.log(data))
    .catch(error => console.error('Gestione finale:', error));
```

**Vantaggi delle Promise:**
- Catena lineare più leggibile
- Un singolo `.catch()` per gestire tutti gli errori della catena
- `.finally()` per cleanup code
- Composizione più semplice con `Promise.all()`, `Promise.race()`, ecc.

---

## 3. Async/Await (ES2017)

Async/await offre la sintassi più pulita per gestire errori, usando il familiare blocco **try-catch**.

```javascript
async function loadUserData(userId) {
    // Simula operazione asincrona
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userId <= 0) {
                reject(new Error('ID utente non valido'));
            } else {
                resolve({ id: userId, name: 'Mario' });
            }
        }, 1000);
    });
}

// Utilizzo con try-catch
async function displayUser(userId) {
    try {
        const user = await loadUserData(userId);
        console.log('Utente caricato:', user);
        
        const posts = await loadPosts(user.id);
        console.log('Post caricati:', posts);
        
        return { user, posts };
    } catch (error) {
        console.error('Errore:', error.message);
        throw error; // Opzionale: propaga l'errore
    } finally {
        console.log('Operazione completata');
    }
}
```

### Gestione Errori con Fetch

```javascript
async function getUser(userId) {
    try {
        const response = await fetch(`https://api.example.com/users/${userId}`);
        
        // Verifica status HTTP
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const user = await response.json();
        
        // Validazione dati
        if (!user.email) {
            throw new Error('Email mancante nei dati utente');
        }
        
        return user;
    } catch (error) {
        // Gestisce errori di rete, HTTP, parsing, validazione
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('Errore di rete:', error);
        } else {
            console.error('Errore:', error.message);
        }
        
        throw error; // Propaga al chiamante
    }
}
```

### Pattern di Gestione Multipla

```javascript
async function processUserData(userId) {
    let user, posts, comments;
    
    try {
        // Prima operazione
        user = await loadUser(userId);
    } catch (error) {
        console.error('Errore caricamento utente:', error);
        return null; // Gestione specifica
    }
    
    try {
        // Seconda operazione (continua anche se la prima fallisce)
        posts = await loadPosts(user.id);
    } catch (error) {
        console.error('Errore caricamento post:', error);
        posts = []; // Valore di default
    }
    
    try {
        // Terza operazione
        comments = await loadComments(user.id);
    } catch (error) {
        console.error('Errore caricamento commenti:', error);
        comments = [];
    }
    
    return { user, posts, comments };
}
```

### Gestione Errori con Promise.all()

```javascript
async function loadMultipleUsers(userIds) {
    try {
        // Promise.all fallisce al primo errore
        const users = await Promise.all(
            userIds.map(id => loadUser(id))
        );
        return users;
    } catch (error) {
        console.error('Almeno un caricamento è fallito:', error);
        throw error;
    }
}

// Alternativa: continua anche con errori
async function loadMultipleUsersSafe(userIds) {
    const results = await Promise.allSettled(
        userIds.map(id => loadUser(id))
    );
    
    const successful = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);
    
    const failed = results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason);
    
    if (failed.length > 0) {
        console.warn(`${failed.length} caricamenti falliti`);
    }
    
    return successful;
}
```

---

## Confronto Completo

```javascript
// ========================================
// 1. CALLBACK
// ========================================
function getUserCallback(userId, callback) {
    loadUser(userId, (err1, user) => {
        if (err1) return callback(err1);
        
        loadPosts(user.id, (err2, posts) => {
            if (err2) return callback(err2);
            
            callback(null, { user, posts });
        });
    });
}

// ========================================
// 2. PROMISE
// ========================================
function getUserPromise(userId) {
    return loadUser(userId)
        .then(user => {
            return loadPosts(user.id)
                .then(posts => ({ user, posts }));
        })
        .catch(error => {
            console.error('Errore:', error);
            throw error;
        });
}

// ========================================
// 3. ASYNC/AWAIT
// ========================================
async function getUserAsync(userId) {
    try {
        const user = await loadUser(userId);
        const posts = await loadPosts(user.id);
        return { user, posts };
    } catch (error) {
        console.error('Errore:', error);
        throw error;
    }
}
```

## Best Practices per Async/Await

### ✅ Sempre Gestire gli Errori

```javascript
// ❌ MALE: Errori non gestiti
async function badExample() {
    const data = await fetch('/api/data'); // Può generare errori non catturati
    return data.json();
}

// ✅ BENE: Errori gestiti
async function goodExample() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Errore:', error);
        throw error; // O gestisci appropriatamente
    }
}
```

### ✅ Non Dimenticare gli Errori nelle Chiamate

```javascript
// ❌ MALE: Errore non catturato dal chiamante
goodExample(); // Promise rejection non gestita

// ✅ BENE: Gestione dal chiamante
goodExample()
    .then(data => console.log(data))
    .catch(error => console.error('Errore dal chiamante:', error));

// ✅ OPPURE: In contesto async
async function caller() {
    try {
        const data = await goodExample();
        console.log(data);
    } catch (error) {
        console.error('Errore dal chiamante:', error);
    }
}
```

### ✅ Errori Personalizzati

```javascript
class APIError extends Error {
    constructor(message, statusCode, response) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.response = response;
    }
}

async function fetchUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new APIError(
                errorData.message || 'Errore API',
                response.status,
                errorData
            );
        }
        
        return await response.json();
    } catch (error) {
        if (error instanceof APIError) {
            console.error(`API Error ${error.statusCode}:`, error.message);
        } else {
            console.error('Errore di rete:', error);
        }
        throw error;
    }
}
```

---

## Tabella Riassuntiva

| Caratteristica | Callback | Promise | Async/Await |
|----------------|----------|---------|-------------|
| **Sintassi** | Funzioni annidate | Catena .then() | Codice lineare |
| **Leggibilità** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Gestione errori** | if (err) ripetuti | .catch() | try-catch |
| **Callback Hell** | ❌ Sì | ✅ No | ✅ No |
| **Composizione** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Debug** | Difficile | Medio | Facile |
| **Supporto browser** | Universale | ES6+ | ES2017+ |

---

## Domande di Autovalutazione

**1. Qual è il vantaggio principale di async/await rispetto alle Promise?**
- A) Sono più veloci nell'esecuzione
- B) Sintassi più leggibile e simile al codice sincrono
- C) Non richiedono gestione degli errori
- D) Funzionano anche in browser vecchi senza transpiler

**2. Come si catturano gli errori con async/await?**
- A) Con .catch() alla fine della funzione
- B) Con il blocco try-catch
- C) Gli errori si gestiscono automaticamente
- D) Con if (error) dopo ogni await

**3. Cosa succede se non si gestisce un errore in una Promise?**
- A) Il programma si blocca completamente
- B) Viene generato un "Unhandled Promise Rejection"
- C) L'errore viene ignorato silenziosamente
- D) Viene automaticamente loggato in console

**4. Nel pattern error-first callback, qual è la posizione del parametro error?**
- A) Ultimo parametro
- B) Secondo parametro
- C) Primo parametro
- D) Non c'è un pattern standard

**5. Qual è il modo corretto per propagare un errore in una funzione async?**
- A) return error;
- B) throw error;
- C) callback(error);
- D) Promise.reject(error);

---

## Risposte

**1. Risposta corretta: B**  
Il vantaggio principale di async/await è la sintassi più leggibile che assomiglia al codice sincrono, eliminando la necessità di catene .then(). Non sono più veloci (A è falsa), richiedono comunque gestione errori con try-catch (C è falsa), e necessitano di transpiler per browser vecchi come le Promise (D è falsa).

**2. Risposta corretta: B**  
Con async/await si usa il blocco try-catch per catturare gli errori, proprio come nel codice sincrono. Si può anche usare .catch() quando si chiama la funzione async (A), ma all'interno della funzione async si usa try-catch. Gli errori non si gestiscono automaticamente (C è falsa).

**3. Risposta corretta: B**  
Se non si gestisce un errore in una Promise, viene generato un "Unhandled Promise Rejection" warning visibile nella console del browser. Il programma non si blocca (A è falsa), l'errore non viene ignorato silenziosamente (C è falsa), e viene mostrato un warning ma non è gestito propriamente (D è imprecisa).

**4. Risposta corretta: C**  
Nel pattern error-first callback, l'errore è sempre il primo parametro della callback. Se non ci sono errori, il primo parametro è null. Questo è uno standard consolidato in JavaScript (specialmente Node.js).

**5. Risposta corretta: B**  
In una funzione async si usa `throw error` per propagare un errore. Questo converte automaticamente l'errore in una Promise rejected. `return error` non propagherebbe l'errore come rejection (A è falsa), callback è un pattern diverso (C), e Promise.reject() funziona ma throw è più idiomatico in async/await (D funziona ma B è preferibile).