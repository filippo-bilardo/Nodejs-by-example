# Moduli personalizzati in Node.js

## 1.1 Cos'è un modulo

Un **modulo** in Node.js è un'unità di codice riutilizzabile che incapsula funzionalità specifiche. Ogni file JavaScript in Node.js è considerato un modulo separato con il proprio scope, il che significa che variabili e funzioni definite in un modulo non sono automaticamente accessibili da altri file.

I moduli permettono di:
- Organizzare il codice in unità logiche e gestibili
- Riutilizzare funzionalità in diversi progetti
- Mantenere il codice pulito e manutenibile
- Evitare conflitti di naming nello scope globale

### Esempio basilare

Consideriamo un semplice file `calcolatrice.js`:

```javascript
function somma(a, b) {
    return a + b;
}

function sottrai(a, b) {
    return a - b;
}

// Senza esportazione, queste funzioni rimangono private al modulo
console.log("Modulo calcolatrice caricato");
```

In questo stato, le funzioni `somma` e `sottrai` non sono accessibili dall'esterno del file. Per renderle disponibili ad altri moduli, dobbiamo esportarle esplicitamente.

## 1.2 CommonJS vs ES Modules

Node.js supporta due sistemi di moduli principali: **CommonJS** (il sistema originale) e **ES Modules** (lo standard ECMAScript).

### CommonJS (CJS)

CommonJS è il sistema modulare tradizionale di Node.js, utilizzato dalla versione iniziale. Utilizza `require()` per importare e `module.exports` o `exports` per esportare.

**Caratteristiche principali:**
- Caricamento sincrono dei moduli
- Sintassi: `const modulo = require('./percorso')`
- Esportazione: `module.exports = { ... }`
- Estensione file: `.js` (default in Node.js senza configurazione)

**Esempio CommonJS:**

```javascript
// math.js
function moltiplica(a, b) {
    return a * b;
}

function dividi(a, b) {
    if (b === 0) {
        throw new Error("Divisione per zero non consentita");
    }
    return a / b;
}

module.exports = {
    moltiplica,
    dividi
};

// app.js
const math = require('./math');
console.log(math.moltiplica(5, 3)); // Output: 15
```

### ES Modules (ESM)

ES Modules è lo standard ufficiale JavaScript, introdotto in ECMAScript 2015 (ES6) e supportato da Node.js dalla versione 12+ con alcune configurazioni.

**Caratteristiche principali:**
- Caricamento asincrono
- Sintassi: `import modulo from './percorso'`
- Esportazione: `export` o `export default`
- Estensione file: `.mjs` oppure `.js` con `"type": "module"` in package.json

**Esempio ES Modules:**

```javascript
// math.mjs
export function moltiplica(a, b) {
    return a * b;
}

export function dividi(a, b) {
    if (b === 0) {
        throw new Error("Divisione per zero non consentita");
    }
    return a / b;
}

// app.mjs
import { moltiplica, dividi } from './math.mjs';
console.log(moltiplica(5, 3)); // Output: 15
```

### Tabella comparativa

| Caratteristica | CommonJS | ES Modules |
|----------------|----------|------------|
| Sintassi import | `require()` | `import` |
| Sintassi export | `module.exports` | `export` / `export default` |
| Caricamento | Sincrono | Asincrono |
| Analisi statica | No | Sì |
| Tree shaking | Limitato | Completo |
| Top-level await | No | Sì (Node 14.8+) |
| Estensione predefinita | `.js` | `.mjs` o `.js` con config |

**Tip:** Per la maggior parte dei progetti Node.js esistenti, CommonJS rimane la scelta più semplice e compatibile. ES Modules è preferibile per nuovi progetti che richiedono interoperabilità con il codice browser o vogliono sfruttare funzionalità moderne.

## 1.3 Vantaggi dell'uso dei moduli

### 1. Organizzazione e manutenibilità

I moduli permettono di suddividere applicazioni complesse in componenti più piccoli e gestibili.

**Esempio - Struttura senza moduli:**

```javascript
// app.js - tutto in un unico file (2000+ righe)
function validaEmail(email) { /* ... */ }
function validaTelefono(tel) { /* ... */ }
function connettiDatabase() { /* ... */ }
function eseguiQuery(query) { /* ... */ }
function inviaEmail(dest, msg) { /* ... */ }
function generaReport() { /* ... */ }
// ... altre centinaia di funzioni
```

**Esempio - Struttura con moduli:**

```javascript
// validators.js
module.exports = {
    validaEmail(email) { /* ... */ },
    validaTelefono(tel) { /* ... */ }
};

// database.js
module.exports = {
    connetti() { /* ... */ },
    eseguiQuery(query) { /* ... */ }
};

// email.js
module.exports = {
    invia(destinatario, messaggio) { /* ... */ }
};

// app.js - file principale pulito e leggibile
const validators = require('./validators');
const db = require('./database');
const email = require('./email');

// Logica principale dell'applicazione
```

### 2. Riutilizzabilità del codice

Una volta creato un modulo ben progettato, può essere riutilizzato in progetti diversi.

```javascript
// stringUtils.js - modulo riutilizzabile
module.exports = {
    capitalizza(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    tronca(str, maxLength) {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 3) + '...';
    },
    
    slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
};

// Può essere usato in progetto-A, progetto-B, progetto-C...
```

### 3. Incapsulamento e protezione dello scope

I moduli creano scope isolati, evitando inquinamento dello scope globale e conflitti di naming.

```javascript
// senzaModuli.js - rischio di conflitti
var nome = "Mario";
function saluta() {
    console.log("Ciao " + nome);
}

// se includiamo altri file, potrebbero sovrascrivere 'nome' e 'saluta'

// conModuli.js - scope protetto
const utente = {
    nome: "Mario",
    saluta() {
        console.log("Ciao " + this.nome);
    }
};

module.exports = utente;
// 'nome' e 'saluta' non inquinano lo scope globale
```

### 4. Gestione delle dipendenze

I moduli rendono esplicite le dipendenze tra componenti.

```javascript
// orderService.js
const db = require('./database');
const emailService = require('./emailService');
const paymentGateway = require('./paymentGateway');

// È chiaro quali dipendenze ha questo modulo
```

### 5. Testabilità

I moduli ben progettati sono più facili da testare in isolamento.

```javascript
// calculator.js
module.exports = {
    somma(a, b) {
        return a + b;
    }
};

// calculator.test.js
const calculator = require('./calculator');

test('somma due numeri correttamente', () => {
    expect(calculator.somma(2, 3)).toBe(5);
});
```

## 1.4 Quando creare moduli personalizzati

### Scenari ideali per la creazione di moduli

**1. Funzionalità riutilizzabili**

Quando una funzionalità viene utilizzata in più parti dell'applicazione.

```javascript
// logger.js - usato ovunque nell'app
const fs = require('fs');
const path = require('path');

module.exports = {
    log(messaggio) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${messaggio}\n`;
        fs.appendFileSync(path.join(__dirname, 'app.log'), logEntry);
        console.log(logEntry.trim());
    },
    
    error(errore) {
        this.log(`ERROR: ${errore.message}`);
    }
};
```

**2. Logica di business complessa**

Quando un insieme di funzioni lavora su uno stesso dominio.

```javascript
// carrello.js
module.exports = {
    items: [],
    
    aggiungi(prodotto, quantita) {
        const esistente = this.items.find(i => i.id === prodotto.id);
        if (esistente) {
            esistente.quantita += quantita;
        } else {
            this.items.push({ ...prodotto, quantita });
        }
    },
    
    rimuovi(idProdotto) {
        this.items = this.items.filter(i => i.id !== idProdotto);
    },
    
    calcolaTotale() {
        return this.items.reduce((tot, item) => {
            return tot + (item.prezzo * item.quantita);
        }, 0);
    },
    
    svuota() {
        this.items = [];
    }
};
```

**3. Operazioni di utilità**

Raccolte di funzioni helper.

```javascript
// dateUtils.js
module.exports = {
    formattaData(data, formato = 'dd/MM/yyyy') {
        const giorno = String(data.getDate()).padStart(2, '0');
        const mese = String(data.getMonth() + 1).padStart(2, '0');
        const anno = data.getFullYear();
        
        return formato
            .replace('dd', giorno)
            .replace('MM', mese)
            .replace('yyyy', anno);
    },
    
    aggiungiGiorni(data, giorni) {
        const risultato = new Date(data);
        risultato.setDate(risultato.getDate() + giorni);
        return risultato;
    },
    
    differenzaGiorni(data1, data2) {
        const diff = Math.abs(data2 - data1);
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
};
```

**4. Integrazione con servizi esterni**

Wrapper per API o servizi esterni.

```javascript
// weatherAPI.js
const https = require('https');

module.exports = {
    async ottieniMeteo(citta) {
        const apiKey = process.env.WEATHER_API_KEY;
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${citta}`;
        
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });
    }
};
```

**5. Configurazioni**

Centralizzare le configurazioni dell'applicazione.

```javascript
// config.js
module.exports = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'myapp',
        user: process.env.DB_USER || 'admin'
    },
    
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    
    email: {
        smtp: process.env.SMTP_HOST,
        from: process.env.EMAIL_FROM || 'noreply@app.com'
    }
};
```

### Quando NON creare moduli

**Evita la frammentazione eccessiva:**
- Non creare un modulo per una singola funzione usata una sola volta
- Non dividere eccessivamente codice strettamente correlato
- Non creare moduli per configurazioni troppo piccole

**Esempio di over-engineering:**

```javascript
// ❌ Troppo frammentato
// somma.js
module.exports = (a, b) => a + b;

// sottrazione.js
module.exports = (a, b) => a - b;

// ✅ Meglio così
// math.js
module.exports = {
    somma: (a, b) => a + b,
    sottrai: (a, b) => a - b,
    moltiplica: (a, b) => a * b,
    dividi: (a, b) => a / b
};
```

## 1.5 Struttura base di un modulo

### Anatomia di un modulo CommonJS

```javascript
// 1. Importazioni (dipendenze)
const fs = require('fs');
const path = require('path');

// 2. Variabili private (non esportate)
const COSTANTE_PRIVATA = 100;
let contatorePrivato = 0;

// 3. Funzioni helper private
function helperPrivata() {
    return "Non visibile dall'esterno";
}

// 4. Funzioni pubbliche (da esportare)
function funzionePubblica1() {
    contatorePrivato++;
    return `Chiamata n. ${contatorePrivato}`;
}

function funzionePubblica2(param) {
    return helperPrivata() + " - " + param;
}

// 5. Esportazione
module.exports = {
    funzionePubblica1,
    funzionePubblica2,
    COSTANTE_ESPORTATA: COSTANTE_PRIVATA
};
```

### Pattern comuni di struttura

**Pattern 1: Oggetto con metodi**

```javascript
// userService.js
const db = require('./database');

const userService = {
    async crea(datiUtente) {
        // validazione
        if (!datiUtente.email) {
            throw new Error("Email obbligatoria");
        }
        
        // logica di creazione
        return await db.insert('users', datiUtente);
    },
    
    async trova(id) {
        return await db.findById('users', id);
    },
    
    async aggiorna(id, dati) {
        return await db.update('users', id, dati);
    },
    
    async elimina(id) {
        return await db.delete('users', id);
    }
};

module.exports = userService;
```

**Pattern 2: Factory function**

```javascript
// logger.js
const fs = require('fs');

function creaLogger(nomeFile) {
    let contatore = 0;
    
    return {
        log(messaggio) {
            contatore++;
            const entry = `[${contatore}] ${new Date().toISOString()}: ${messaggio}\n`;
            fs.appendFileSync(nomeFile, entry);
        },
        
        getContatore() {
            return contatore;
        },
        
        reset() {
            contatore = 0;
            fs.writeFileSync(nomeFile, '');
        }
    };
}

module.exports = creaLogger;

// Uso:
// const logger = creaLogger('app.log');
// logger.log('Applicazione avviata');
```

**Pattern 3: Classe**

```javascript
// Prodotto.js
class Prodotto {
    constructor(nome, prezzo, categoria) {
        this.id = Date.now();
        this.nome = nome;
        this.prezzo = prezzo;
        this.categoria = categoria;
        this.dataCreazione = new Date();
    }
    
    applicaSconto(percentuale) {
        if (percentuale < 0 || percentuale > 100) {
            throw new Error("Percentuale non valida");
        }
        this.prezzo = this.prezzo * (1 - percentuale / 100);
    }
    
    getDettagli() {
        return {
            id: this.id,
            nome: this.nome,
            prezzo: this.prezzo.toFixed(2),
            categoria: this.categoria
        };
    }
}

module.exports = Prodotto;

// Uso:
// const Prodotto = require('./Prodotto');
// const laptop = new Prodotto('Laptop', 999, 'Elettronica');
```

## 1.6 Esportare funzioni con module.exports

### Metodo 1: Esportazione diretta

```javascript
// calcolatrice.js

// Esportare una singola funzione
module.exports = function somma(a, b) {
    return a + b;
};

// app.js
const somma = require('./calcolatrice');
console.log(somma(5, 3)); // 8
```

### Metodo 2: Esportazione di oggetto con più funzioni

```javascript
// operazioni.js

function somma(a, b) {
    return a + b;
}

function sottrai(a, b) {
    return a - b;
}

function moltiplica(a, b) {
    return a * b;
}

// Esportazione multipla
module.exports = {
    somma: somma,
    sottrai: sottrai,
    moltiplica: moltiplica
};

// Con ES6 shorthand
module.exports = {
    somma,
    sottrai,
    moltiplica
};

// app.js - Importazione completa
const operazioni = require('./operazioni');
console.log(operazioni.somma(10, 5));

// app.js - Destructuring
const { somma, moltiplica } = require('./operazioni');
console.log(somma(10, 5));
```

### Metodo 3: Esportazione incrementale

```javascript
// utils.js

// Esportazione progressiva
module.exports.formattaData = function(data) {
    return data.toLocaleDateString('it-IT');
};

module.exports.formattaValuta = function(importo) {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR'
    }).format(importo);
};

module.exports.generaId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
```

### Metodo 4: Pattern revealing module

```javascript
// taskManager.js

const taskManager = (function() {
    // Stato privato
    let tasks = [];
    let nextId = 1;
    
    // Funzioni private
    function validaTask(task) {
        if (!task.titolo) {
            throw new Error("Il titolo è obbligatorio");
        }
        return true;
    }
    
    // Funzioni pubbliche
    function aggiungi(task) {
        validaTask(task);
        const nuovoTask = {
            id: nextId++,
            ...task,
            completato: false,
            dataCreazione: new Date()
        };
        tasks.push(nuovoTask);
        return nuovoTask;
    }
    
    function elenca() {
        return [...tasks]; // Ritorna una copia
    }
    
    function completa(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completato = true;
            return true;
        }
        return false;
    }
    
    function rimuovi(id) {
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // Rivela solo le funzioni pubbliche
    return {
        aggiungi,
        elenca,
        completa,
        rimuovi
    };
})();

module.exports = taskManager;
```

### Esempio pratico completo

```javascript
// validatori.js

/**
 * Modulo di validazione per dati utente
 */

// Espressioni regolari private
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_TELEFONO = /^[0-9]{10}$/;
const REGEX_CODICE_FISCALE = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;

// Funzioni helper private
function pulisciStringa(str) {
    return str.trim().toLowerCase();
}

// Funzioni esportate
function validaEmail(email) {
    if (!email) return false;
    return REGEX_EMAIL.test(pulisciStringa(email));
}

function validaTelefono(telefono) {
    if (!telefono) return false;
    const numeriSolo = telefono.replace(/\D/g, '');
    return REGEX_TELEFONO.test(numeriSolo);
}

function validaPassword(password) {
    if (!password || password.length < 8) {
        return {
            valida: false,
            errore: "La password deve essere lunga almeno 8 caratteri"
        };
    }
    
    const haaMaiuscola = /[A-Z]/.test(password);
    const haaMinuscola = /[a-z]/.test(password);
    const haaNumero = /[0-9]/.test(password);
    const haaSpeciale = /[!@#$%^&*]/.test(password);
    
    if (!haaMaiuscola || !haaMinuscola || !haaNumero) {
        return {
            valida: false,
            errore: "La password deve contenere maiuscole, minuscole e numeri"
        };
    }
    
    return { valida: true };
}

function validaCodiceFiscale(cf) {
    if (!cf) return false;
    return REGEX_CODICE_FISCALE.test(cf.toUpperCase());
}

function validaEta(dataNascita) {
    const oggi = new Date();
    const nascita = new Date(dataNascita);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const m = oggi.getMonth() - nascita.getMonth();
    
    if (m < 0 || (m === 0 && oggi.getDate() < nascita.getDate())) {
        eta--;
    }
    
    return {
        valida: eta >= 18,
        eta: eta,
        errore: eta < 18 ? "Devi essere maggiorenne" : null
    };
}

// Esportazione
module.exports = {
    validaEmail,
    validaTelefono,
    validaPassword,
    validaCodiceFiscale,
    validaEta
};
```

**Utilizzo del modulo:**

```javascript
// app.js
const validatori = require('./validatori');

// Test validazioni
console.log(validatori.validaEmail('utente@esempio.com')); // true
console.log(validatori.validaEmail('email-non-valida')); // false

console.log(validatori.validaTelefono('3331234567')); // true

const checkPassword = validatori.validaPassword('Pass123');
console.log(checkPassword);
// { valida: true }

const checkEta = validatori.validaEta('2010-05-15');
console.log(checkEta);
// { valida: false, eta: 14, errore: 'Devi essere maggiorenne' }
```

## 1.7 Esportare oggetti e classi

### Esportare oggetti letterali

```javascript
// config.js

const configurazione = {
    app: {
        nome: 'MiaApp',
        versione: '1.0.0',
        porta: 3000
    },
    
    database: {
        host: 'localhost',
        porta: 5432,
        nome: 'mydb'
    },
    
    impostazioni: {
        logLevel: 'info',
        maxConnessioni: 100
    },
    
    // Metodo nell'oggetto
    ottieniUrlDatabase() {
        return `postgres://${this.database.host}:${this.database.porta}/${this.database.nome}`;
    }
};

module.exports = configurazione;

// app.js
const config = require('./config');
console.log(config.app.nome); // 'MiaApp'
console.log(config.ottieniUrlDatabase());
```

### Esportare classi

**Esempio 1: Classe base**

```javascript
// Utente.js

class Utente {
    constructor(nome, email) {
        this.nome = nome;
        this.email = email;
        this.dataRegistrazione = new Date();
        this.attivo = true;
    }
    
    // Metodi pubblici
    saluta() {
        return `Ciao, sono ${this.nome}`;
    }
    
    disattiva() {
        this.attivo = false;
        console.log(`Utente ${this.nome} disattivato`);
    }
    
    // Metodo statico
    static creaAdmin(nome, email) {
        const admin = new Utente(nome, email);
        admin.ruolo = 'admin';
        return admin;
    }
    
    // Getter
    get info() {
        return `${this.nome} (${this.email})`;
    }
}

module.exports = Utente;

// app.js
const Utente = require('./Utente');

const user1 = new Utente('Mario Rossi', 'mario@email.com');
console.log(user1.saluta()); // 'Ciao, sono Mario Rossi'

const admin = Utente.creaAdmin('Admin', 'admin@email.com');
console.log(admin.ruolo); // 'admin'
```

**Esempio 2: Classe con ereditarietà**

```javascript
// Persona.js

class Persona {
    constructor(nome, cognome, eta) {
        this.nome = nome;
        this.cognome = cognome;
        this.eta = eta;
    }
    
    getNomeCompleto() {
        return `${this.nome} ${this.cognome}`;
    }
    
    presentati() {
        return `Mi chiamo ${this.getNomeCompleto()} e ho ${this.eta} anni`;
    }
}

module.exports = Persona;

// Studente.js

const Persona = require('./Persona');

class Studente extends Persona {
    constructor(nome, cognome, eta, matricola, corso) {
        super(nome, cognome, eta);
        this.matricola = matricola;
        this.corso = corso;
        this.voti = [];
    }
    
    aggiungiVoto(materia, voto) {
        this.voti.push({ materia, voto, data: new Date() });
    }
    
    calcolaMedia() {
        if (this.voti.length === 0) return 0;
        const somma = this.voti.reduce((acc, v) => acc + v.voto, 0);
        return (somma / this.voti.length).toFixed(2);
    }
    
    // Override del metodo della classe padre
    presentati() {
        return `${super.presentati()}, studio ${this.corso}`;
    }
}

module.exports = Studente;

// app.js
const Studente = require('./Studente');

const studente = new Studente('Luca', 'Bianchi', 20, 'ST12345', 'Informatica');
studente.aggiungiVoto('Matematica', 28);
studente.aggiungiVoto('Programmazione', 30);

console.log(studente.presentati());
// 'Mi chiamo Luca Bianchi e ho 20 anni, studio Informatica'
console.log(`Media: ${studente.calcolaMedia()}`); // 'Media: 29.00'
```

**Esempio 3: Classe con membri privati (usando convenzioni)**

```javascript
// ContoBancario.js

class ContoBancario {
    constructor(titolare, saldoIniziale = 0) {
        this.titolare = titolare;
        this._saldo = saldoIniziale; // Convenzione: _ indica privato
        this._transazioni = [];
        this._numeroContoPrivato = this._generaNumeroConto();
    }
    
    _generaNumeroConto() {
        return 'IT' + Date.now().toString().slice(-10);
    }
    
    _registraTransazione(tipo, importo) {
        this._transazioni.push({
            tipo,
            importo,
            data: new Date(),
            saldoDopoTransazione: this._saldo
        });
    }
    
    deposita(importo) {
        if (importo <= 0) {
            throw new Error("L'importo deve essere positivo");
        }
        this._saldo += importo;
        this._registraTransazione('deposito', importo);
        return this._saldo;
    }
    
    preleva(importo) {
        if (importo <= 0) {
            throw new Error("L'importo deve essere positivo");
        }
        if (importo > this._saldo) {
            throw new Error("Saldo insufficiente");
        }
        this._saldo -= importo;
        this._registraTransazione('prelievo', importo);
        return this._saldo;
    }
    
    // Getter per accesso controllato
    get saldo() {
        return this._saldo;
    }
    
    get numeroConto() {
        return this._numeroContoPrivato;
    }
    
    getStorico() {
        return [...this._transazioni]; // Ritorna copia
    }
}

module.exports = ContoBancario;
```

**Esempio 4: Esportare più classi**

```javascript
// geometria.js

class Punto {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    distanzaDa(altroPunto) {
        const dx = this.x - altroPunto.x;
        const dy = this.y - altroPunto.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class Cerchio {
    constructor(centro, raggio) {
        this.centro = centro; // Istanza di Punto
        this.raggio = raggio;
    }
    
    area() {
        return Math.PI * this.raggio * this.raggio;
    }
    
    perimetro() {
        return 2 * Math.PI * this.raggio;
    }
    
    contienePunto(punto) {
        return this.centro.distanzaDa(punto) <= this.raggio;
    }
}

class Rettangolo {
    constructor(larghezza, altezza) {
        this.larghezza = larghezza;
        this.altezza = altezza;
    }
    
    area() {
        return this.larghezza * this.altezza;
    }
    
    perimetro() {
        return 2 * (this.larghezza + this.altezza);
    }
    
    get diagonale() {
        return Math.sqrt(
            this.larghezza * this.larghezza + 
            this.altezza * this.altezza
        );
    }
}

// Esportazione multipla
module.exports = {
    Punto,
    Cerchio,
    Rettangolo
};

// app.js
const { Punto, Cerchio, Rettangolo } = require('./geometria');

const centro = new Punto(0, 0);
const cerchio = new Cerchio(centro, 5);
console.log(`Area cerchio: ${cerchio.area().toFixed(2)}`);

const rett = new Rettangolo(10, 5);
console.log(`Perimetro rettangolo: ${rett.perimetro()}`);
```

### Singleton Pattern con classi

```javascript
// Database.js

class Database {
    constructor() {
        if (Database.istanza) {
            return Database.istanza;
        }
        
        this.connesso = false;
        this.dati = new Map();
        Database.istanza = this;
    }
    
    connetti() {
        if (!this.connesso) {
            console.log("Connessione al database...");
            this.connesso = true;
        }
        return this;
    }
    
    inserisci(chiave, valore) {
        this.dati.set(chiave, valore);
    }
    
    leggi(chiave) {
        return this.dati.get(chiave);
    }
    
    disconnetti() {
        this.connesso = false;
        console.log("Disconnesso dal database");
    }
}

// Esporta un'istanza singleton
const istanza = new Database();
Object.freeze(istanza);

module.exports = istanza;

// app.js
const db = require('./Database');
db.connetti();
db.inserisci('user1', { nome: 'Mario' });

// In un altro file
const db2 = require('./Database'); // Stessa istanza!
console.log(db2.leggi('user1')); // { nome: 'Mario' }
```

## 1.8 Importare moduli con require()

### Sintassi base

```javascript
// Importare modulo locale
const mioModulo = require('./mioModulo');

// Importare modulo da node_modules
const express = require('express');

// Importare modulo core di Node.js
const fs = require('fs');
const path = require('path');
```

### Percorsi relativi vs assoluti

```javascript
// Percorso relativo - stesso livello
const utils = require('./utils');

// Percorso relativo - sottocartella
const config = require('./config/database');

// Percorso relativo - cartella superiore
const shared = require('../shared/helpers');

// Percorso assoluto
const constants = require('/home/user/app/constants');

// Usando __dirname per percorsi assoluti dinamici
const config = require(__dirname + '/config/settings');
```

### Importazione con destructuring

```javascript
// mathUtils.js
module.exports = {
    somma: (a, b) => a + b,
    sottrai: (a, b) => a - b,
    moltiplica: (a, b) => a * b,
    dividi: (a, b) => a / b,
    PI: 3.14159
};

// app.js - Importare solo ciò che serve
const { somma, moltiplica, PI } = require('./mathUtils');

console.log(somma(5, 3)); // 8
console.log(moltiplica(4, PI)); // 12.56636

// Invece di importare tutto:
// const mathUtils = require('./mathUtils');
// mathUtils.somma(5, 3);
```

### Importare cartelle (index.js)

```javascript
// Struttura:
// models/
//   ├── index.js
//   ├── User.js
//   ├── Product.js
//   └── Order.js

// models/index.js
module.exports = {
    User: require('./User'),
    Product: require('./Product'),
    Order: require('./Order')
};

// app.js - Importare l'intera cartella
const models = require('./models');

const utente = new models.User('Mario', 'mario@email.com');
const prodotto = new models.Product('Laptop', 999);

// Oppure con destructuring
const { User, Product } = require('./models');
```

### Caching dei moduli

Node.js memorizza in cache i moduli dopo il primo caricamento. Questo significa che un modulo viene eseguito una sola volta.

```javascript
// counter.js
let contatore = 0;

module.exports = {
    incrementa() {
        return ++contatore;
    },
    getValore() {
        return contatore;
    }
};

// file1.js
const counter = require('./counter');
console.log(counter.incrementa()); // 1
console.log(counter.incrementa()); // 2

// file2.js
const counter = require('./counter');
console.log(counter.getValore()); // 2 (stesso contatore!)
console.log(counter.incrementa()); // 3
```

**Per invalidare la cache (raramente necessario):**

```javascript
// Eliminare un modulo dalla cache
delete require.cache[require.resolve('./counter')];

// Ora require() caricherà nuovamente il modulo
const counterFresco = require('./counter');
```

### Importazione condizionale

```javascript
// Caricare moduli diversi in base all'ambiente
const config = process.env.NODE_ENV === 'production'
    ? require('./config/production')
    : require('./config/development');

// Caricare modulo solo se necessario
function ottieniParser(tipo) {
    if (tipo === 'json') {
        return require('./parsers/jsonParser');
    } else if (tipo === 'xml') {
        return require('./parsers/xmlParser');
    } else if (tipo === 'csv') {
        return require('./parsers/csvParser');
    }
}

// Lazy loading - carica solo quando serve
let parserPesante;
function getParserPesante() {
    if (!parserPesante) {
        parserPesante = require('./parsers/pesante');
    }
    return parserPesante;
}
```

### Gestione errori nell'importazione

```javascript
// Tentare di importare con fallback
let config;
try {
    config = require('./config/custom');
} catch (error) {
    console.log('Config personalizzata non trovata, uso default');
    config = require('./config/default');
}

// Verificare esistenza prima di importare
const fs = require('fs');
const path = require('path');

function requireIfExists(modulePath) {
    const fullPath = path.resolve(modulePath);
    if (fs.existsSync(fullPath + '.js')) {
        return require(modulePath);
    }
    return null;
}

const plugin = requireIfExists('./plugins/optional');
if (plugin) {
    plugin.initialize();
}
```

### Pattern avanzati di importazione

**Pattern 1: Registry dinamico**

```javascript
// pluginLoader.js
const fs = require('fs');
const path = require('path');

function caricaPlugins(directory) {
    const plugins = {};
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
        if (file.endsWith('.js')) {
            const nomePlugin = path.basename(file, '.js');
            plugins[nomePlugin] = require(path.join(directory, file));
        }
    });
    
    return plugins;
}

module.exports = caricaPlugins;

// app.js
const caricaPlugins = require('./pluginLoader');
const plugins = caricaPlugins('./plugins');

// Usa i plugin
if (plugins.logger) {
    plugins.logger.init();
}
```

**Pattern 2: Dependency Injection**

```javascript
// emailService.js
module.exports = function(config, logger) {
    return {
        invia(destinatario, oggetto, corpo) {
            logger.log(`Invio email a ${destinatario}`);
            // Logica invio con config
            return { success: true };
        }
    };
};

// app.js
const config = require('./config');
const logger = require('./logger');
const creaEmailService = require('./emailService');

const emailService = creaEmailService(config, logger);
emailService.invia('test@email.com', 'Test', 'Corpo email');
```

## 1.9 Best practice per la creazione di moduli

### 1. Principio di Responsabilità Singola

Ogni modulo dovrebbe avere una sola responsabilità ben definita.

**❌ Non raccomandato:**

```javascript
// tuttofare.js - fa troppe cose diverse
module.exports = {
    validaEmail(email) { /*...*/ },
    connettiDatabase() { /*...*/ },
    inviaEmail(dest, msg) { /*...*/ },
    calcolaSconto(prezzo, perc) { /*...*/ },
    formattaData(data) { /*...*/ }
};
```

**✅ Raccomandato:**

```javascript
// validators.js
module.exports = {
    validaEmail(email) { /*...*/ },
    validaTelefono(tel) { /*...*/ }
};

// database.js
module.exports = {
    connetti() { /*...*/ },
    query(sql) { /*...*/ }
};

// emailService.js
module.exports = {
    invia(destinatario, messaggio) { /*...*/ }
};
```

### 2. Naming conventions chiare

```javascript
// ✅ Nomi descrittivi e consistenti

// Per moduli con singola classe - PascalCase per il file
// User.js, Product.js, OrderService.js

// Per moduli di utilità - camelCase
// dateUtils.js, stringHelpers.js, validators.js

// Per configurazioni - lowercase
// config.js, constants.js, settings.js

// Per middleware - descrittivi
// authMiddleware.js, errorHandler.js, logger.js
```

### 3. Documentazione inline

```javascript
// mathUtils.js

/**
 * Modulo di utilità matematiche
 * Fornisce funzioni per calcoli comuni
 * @module mathUtils
 */

/**
 * Calcola la media di un array di numeri
 * @param {number[]} numeri - Array di numeri
 * @returns {number} La media dei numeri
 * @throws {Error} Se l'array è vuoto
 * @example
 * const media = calcolaMedia([10, 20, 30]);
 * console.log(media); // 20
 */
function calcolaMedia(numeri) {
    if (numeri.length === 0) {
        throw new Error("L'array non può essere vuoto");
    }
    const somma = numeri.reduce((acc, n) => acc + n, 0);
    return somma / numeri.length;
}

/**
 * Trova il valore massimo in un array
 * @param {number[]} numeri - Array di numeri
 * @returns {number} Il numero più grande
 */
function trovaMassimo(numeri) {
    return Math.max(...numeri);
}

module.exports = {
    calcolaMedia,
    trovaMassimo
};
```

### 4. Gestione degli errori

```javascript
// userService.js

class UserServiceError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'UserServiceError';
        this.code = code;
    }
}

module.exports = {
    async creaUtente(dati) {
        // Validazione input
        if (!dati.email) {
            throw new UserServiceError(
                'Email obbligatoria',
                'MISSING_EMAIL'
            );
        }
        
        if (!dati.password || dati.password.length < 8) {
            throw new UserServiceError(
                'Password deve essere di almeno 8 caratteri',
                'INVALID_PASSWORD'
            );
        }
        
        try {
            // Logica di creazione
            return await db.insert('users', dati);
        } catch (error) {
            throw new UserServiceError(
                'Errore durante la creazione utente',
                'DB_ERROR'
            );
        }
    }
};
```

### 5. Evitare dipendenze circolari

**❌ Problema:**

```javascript
// a.js
const b = require('./b');
module.exports = {
    usaB() {
        b.funzioneB();
    }
};

// b.js
const a = require('./a');
module.exports = {
    funzioneB() {
        a.usaA(); // Dipendenza circolare!
    }
};
```

**✅ Soluzione 1: Rifattorizzare**

```javascript
// shared.js
module.exports = {
    funzioneCondivisa() {
        // Logica condivisa
    }
};

// a.js
const shared = require('./shared');
module.exports = {
    usaShared() {
        shared.funzioneCondivisa();
    }
};

// b.js
const shared = require('./shared');
module.exports = {
    usaShared() {
        shared.funzioneCondivisa();
    }
};
```

### 6. Configurabilità

```javascript
// logger.js

const DEFAULT_CONFIG = {
    livello: 'info',
    formato: 'json',
    output: 'console'
};

function creaLogger(opzioni = {}) {
    const config = { ...DEFAULT_CONFIG, ...opzioni };
    
    return {
        log(messaggio) {
            if (config.formato === 'json') {
                console.log(JSON.stringify({
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: messaggio
                }));
            } else {
                console.log(`[INFO] ${messaggio}`);
            }
        },
        
        error(messaggio) {
            console.error(`[ERROR] ${messaggio}`);
        }
    };
}

module.exports = creaLogger;

// Uso:
// const logger = creaLogger({ formato: 'text' });
```

### 7. Immutabilità quando possibile

```javascript
// config.js

const config = {
    app: {
        nome: 'MiaApp',
        versione: '1.0.0'
    },
    database: {
        host: 'localhost',
        port: 5432
    }
};

// Congela l'oggetto per evitare modifiche accidentali
module.exports = Object.freeze(config);

// Oppure usa Object.freeze ricorsivamente
function deepFreeze(obj) {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj[prop] !== null
            && (typeof obj[prop] === 'object' || typeof obj[prop] === 'function')
            && !Object.isFrozen(obj[prop])) {
            deepFreeze(obj[prop]);
        }
    });
    return obj;
}

module.exports = deepFreeze(config);
```

### 8. Testing friendly

```javascript
// paymentService.js

// ❌ Difficile da testare - dipendenza hard-coded
const realPaymentGateway = require('./realPaymentGateway');

module.exports = {
    processaPagamento(importo) {
        return realPaymentGateway.charge(importo);
    }
};

// ✅ Facile da testare - dependency injection
module.exports = function creaPaymentService(gateway) {
    return {
        processaPagamento(importo) {
            return gateway.charge(importo);
        }
    };
};

// Uso in produzione:
// const gateway = require('./realPaymentGateway');
// const paymentService = creaPaymentService(gateway);

// Uso nei test:
// const mockGateway = { charge: jest.fn() };
// const paymentService = creaPaymentService(mockGateway);
```

### 9. Struttura file consistente

```javascript
// Template consigliato per un modulo

// 1. Dipendenze di librerie esterne
const express = require('express');
const bcrypt = require('bcrypt');

// 2. Dipendenze locali
const db = require('./database');
const validators = require('./validators');

// 3. Costanti
const SALT_ROUNDS = 10;
const MAX_LOGIN_ATTEMPTS = 5;

// 4. Funzioni helper private
function generaToken() {
    return Math.random().toString(36).substring(2);
}

// 5. Classe o oggetto principale
class AuthService {
    // implementazione
}

// 6. Esportazione
module.exports = AuthService;

// Oppure per funzioni
module.exports = {
    login,
    logout,
    register
};
```

### 10. Validazione input

```javascript
// api.js

module.exports = {
    fetchData(url, options = {}) {
        // Validazione input
        if (typeof url !== 'string' || !url.startsWith('http')) {
            throw new TypeError('URL deve essere una stringa valida');
        }
        
        // Valori di default
        const config = {
            method: 'GET',
            timeout: 5000,
            ...options
        };
        
        // Validazione opzioni
        if (config.timeout < 0) {
            throw new RangeError('Timeout deve essere positivo');
        }
        
        // Logica principale
        return fetch(url, config);
    }
};
```

### Checklist finale per moduli di qualità

- [ ] Il modulo ha una singola responsabilità chiara
- [ ] I nomi sono descrittivi e seguono le convenzioni
- [ ] Include documentazione JSDoc per funzioni pubbliche
- [ ] Gestisce gli errori in modo appropriato
- [ ] Non ha dipendenze circolari
- [ ] È configurabile quando necessario
- [ ] Valida gli input
- [ ] È testabile (usa dependency injection se necessario)
- [ ] Usa const/let invece di var
- [ ] Segue una struttura file consistente

---

## Autovalutazione Capitolo 1

**1. Qual è la differenza principale tra CommonJS e ES Modules?**

a) CommonJS usa `import`, ES Modules usa `require()`  
b) CommonJS carica i moduli in modo sincrono, ES Modules in modo asincrono  
c) CommonJS è più veloce di ES Modules  
d) Non c'è differenza, sono la stessa cosa

**2. Quale sintassi è corretta per esportare una funzione con CommonJS?**

a) `export function myFunc() {}`  
b) `module.exports = function myFunc() {}`  
c) `exports default myFunc`  
d) `return function myFunc() {}`

**3. Come si importa un modulo locale chiamato "utils.js" nella stessa cartella?**

a) `const utils = require('utils')`  
b) `const utils = require('./utils')`  
c) `import utils from 'utils'`  
d) `include './utils.js'`

**4. Cosa succede quando si richiede lo stesso modulo più volte?**

a) Il modulo viene eseguito ogni volta  
b) Si genera un errore  
c) Il modulo viene caricato dalla cache dopo la prima volta  
d) Si crea una nuova istanza ogni volta

**5. Qual è il modo corretto per esportare più funzioni?**

a) `module.exports = { func1, func2 }`  
b) `exports = func1, func2`  
c) `export func1; export func2;`  
d) `return { func1, func2 }`

**6. Come si importano solo alcune funzioni da un modulo usando destructuring?**

a) `const [func1, func2] = require('./module')`  
b) `const { func1, func2 } = require('./module')`  
c) `import func1, func2 from './module'`  
d) `require('./module').func1, func2`

**7. Quale delle seguenti NON è una best practice per creare moduli?**

a) Dare nomi descrittivi ai moduli  
b) Mettere tutta la logica in un unico file gigante  
c) Documentare le funzioni pubbliche  
d) Validare gli input

**8. Quando NON si dovrebbe creare un modulo separato?**

a) Per funzionalità usate in più punti dell'app  
b) Per una singola funzione usata una sola volta  
c) Per integrazioni con API esterne  
d) Per logica di business complessa

**9. Cosa indica la convenzione del prefisso underscore in un nome (es. `_privateFunc`)?**

a) La funzione è deprecata  
b) La funzione è asincrona  
c) La funzione dovrebbe essere considerata privata  
d) La funzione è una classe

**10. Qual è l'estensione predefinita per file ES Modules in Node.js?**

a) `.js`  
b) `.mjs`  
c) `.esm`  
d) `.module.js`

---

**Risposte corrette Capitolo 1:**

1. **b)** CommonJS carica i moduli in modo sincrono, mentre ES Modules supporta il caricamento asincrono. Questa è una delle differenze fondamentali tra i due sistemi.

2. **b)** `module.exports = function myFunc() {}` è la sintassi corretta in CommonJS. La risposta a) è la sintassi ES Modules, c) è sintassi errata, e d) non esporta la funzione.

3. **b)** `const utils = require('./utils')` è corretto. Il `./` indica un percorso relativo nella stessa cartella. Senza `./` Node.js cercherebbe in node_modules.

4. **c)** Node.js memorizza i moduli in cache dopo il primo caricamento. Questo migliora le performance ed evita esecuzioni multiple dello stesso codice.

5. **a)** `module.exports = { func1, func2 }` è il modo corretto. Esporta un oggetto contenente le funzioni. Le altre opzioni hanno sintassi non valida per CommonJS.

6. **b)** `const { func1, func2 } = require('./module')` usa il destructuring per estrarre proprietà specifiche dall'oggetto esportato. Le parentesi graffe `{}` sono fondamentali.

7. **b)** Mettere tutta la logica in un unico file gigante viola il principio di responsabilità singola ed è contrario alle best practice. I moduli dovrebbero essere focalizzati e gestibili.

8. **b)** Non ha senso creare un modulo separato per una singola funzione usata una sola volta. Questo causerebbe frammentazione eccessiva senza benefici di riutilizzo.

9. **c)** Il prefisso underscore `_` è una convenzione (non un vincolo tecnico) per indicare che una funzione o variabile dovrebbe essere considerata privata e non usata esternamente al modulo.

10. **b)** `.mjs` è l'estensione specifica per ES Modules. In alternativa si può usare `.js` con `"type": "module"` nel package.json.