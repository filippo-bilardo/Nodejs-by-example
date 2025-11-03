# Esercizi Pratici con EventEmitter

## Esercizio 1: Sistema di Notifiche Blog ⭐

**Difficoltà:** Facile  
**Concetti:** Eventi base, listener multipli

Crea un sistema di notifiche per un blog che:
- Emette un evento quando viene pubblicato un nuovo articolo
- Notifica via email gli iscritti
- Aggiorna il contatore degli articoli
- Registra l'evento in un log

```javascript
const EventEmitter = require('events');

class Blog extends EventEmitter {
  constructor() {
    super();
    this.articoli = [];
  }
  
  pubblicaArticolo(titolo, autore) {
    const articolo = {
      id: this.articoli.length + 1,
      titolo,
      autore,
      data: new Date()
    };
    
    this.articoli.push(articolo);
    
    // TODO: Emetti l'evento 'nuovo-articolo' con i dati dell'articolo
  }
}

// TODO: Crea un'istanza di Blog

// TODO: Aggiungi un listener che invia email
// blog.on('nuovo-articolo', (articolo) => { ... });

// TODO: Aggiungi un listener che aggiorna il contatore
// blog.on('nuovo-articolo', (articolo) => { ... });

// TODO: Aggiungi un listener che registra nel log
// blog.on('nuovo-articolo', (articolo) => { ... });

// TODO: Pubblica alcuni articoli
```

**Obiettivo:** Completare il codice e verificare che tutti e tre i listener vengano eseguiti.

---

## Esercizio 2: Semaforo Intelligente 🚦

**Difficoltà:** Facile  
**Concetti:** Stati, eventi multipli, `once()`

Crea un semaforo che cambia colore e emette eventi:

```javascript
const EventEmitter = require('events');

class Semaforo extends EventEmitter {
  constructor() {
    super();
    this.stato = 'rosso';
  }
  
  cambiaColore(nuovoColore) {
    // TODO: Valida che il colore sia 'rosso', 'giallo' o 'verde'
    
    const vecchioStato = this.stato;
    this.stato = nuovoColore;
    
    // TODO: Emetti l'evento 'cambio-colore' con vecchio e nuovo stato
    
    // TODO: Emetti anche eventi specifici: 'rosso', 'giallo', 'verde'
  }
  
  avviaSequenza() {
    // TODO: Implementa la sequenza automatica: verde -> giallo -> rosso -> verde...
    // Usa setInterval con intervalli di 3 secondi
  }
}

// TODO: Crea istanza e aggiungi listener
const semaforo = new Semaforo();

// TODO: Listener per ogni cambio colore

// TODO: Listener specifico per 'rosso' che avvisa "STOP!"

// TODO: Listener che conta i cambi (usa once per il primo cambio)

// TODO: Avvia la sequenza automatica
```

**Obiettivo:** Il semaforo deve cambiare colore automaticamente e tutti i listener devono reagire correttamente.

---

## Esercizio 3: Carrello della Spesa 🛒

**Difficoltà:** Media  
**Concetti:** Eventi multipli, calcoli, gestione stato

Crea un carrello che emette eventi per ogni azione:

```javascript
const EventEmitter = require('events');

class Carrello extends EventEmitter {
  constructor() {
    super();
    this.prodotti = [];
    this.totale = 0;
  }
  
  aggiungiProdotto(nome, prezzo, quantita = 1) {
    // TODO: Aggiungi il prodotto all'array
    const prodotto = { nome, prezzo, quantita };
    this.prodotti.push(prodotto);
    
    // TODO: Aggiorna il totale
    
    // TODO: Emetti evento 'prodotto-aggiunto'
    
    // TODO: Se il totale supera 100€, emetti 'sconto-disponibile'
  }
  
  rimuoviProdotto(nome) {
    // TODO: Trova e rimuovi il prodotto
    
    // TODO: Aggiorna il totale
    
    // TODO: Emetti evento 'prodotto-rimosso'
  }
  
  svuota() {
    // TODO: Svuota il carrello
    
    // TODO: Emetti evento 'carrello-svuotato'
  }
  
  getTotale() {
    return this.totale;
  }
}

// TODO: Crea il carrello e aggiungi listener

// Listener che mostra il prodotto aggiunto

// Listener che aggiorna il display del totale

// Listener che mostra un messaggio di sconto

// Test del carrello
// carrello.aggiungiProdotto('Laptop', 899, 1);
// carrello.aggiungiProdotto('Mouse', 25, 2);
```

**Obiettivo:** Gestire correttamente tutte le operazioni e emettere gli eventi appropriati.

---

## Esercizio 4: Chat Room 💬

**Difficoltà:** Media  
**Concetti:** Listener dinamici, gestione utenti

Crea una chat room con gestione utenti ed eventi:

```javascript
const EventEmitter = require('events');

class ChatRoom extends EventEmitter {
  constructor(nome) {
    super();
    this.nome = nome;
    this.utenti = new Set();
    this.messaggi = [];
  }
  
  entra(username) {
    // TODO: Aggiungi utente al Set
    
    // TODO: Emetti evento 'utente-entrato'
  }
  
  esce(username) {
    // TODO: Rimuovi utente dal Set
    
    // TODO: Emetti evento 'utente-uscito'
  }
  
  inviaMessaggio(username, testo) {
    // TODO: Verifica che l'utente sia nella chat
    
    const messaggio = {
      username,
      testo,
      timestamp: new Date()
    };
    
    this.messaggi.push(messaggio);
    
    // TODO: Emetti evento 'nuovo-messaggio'
    
    // TODO: Se il messaggio contiene '@tutti', emetti 'menzione-tutti'
  }
  
  getUtentiOnline() {
    return Array.from(this.utenti);
  }
}

// TODO: Implementa i listener

const chat = new ChatRoom('Programmatori');

// Listener per utenti che entrano/escono

// Listener per nuovi messaggi

// Listener per menzioni

// Test
// chat.entra('Mario');
// chat.entra('Luigi');
// chat.inviaMessaggio('Mario', 'Ciao a tutti!');
// chat.inviaMessaggio('Luigi', 'Ciao @tutti!');
```

**Obiettivo:** Gestire entrate, uscite e messaggi con notifiche appropriate.

---

## Esercizio 5: Download Manager 📥

**Difficoltà:** Media  
**Concetti:** Eventi di progresso, simulazione asincrona

Crea un gestore di download con eventi di progresso:

```javascript
const EventEmitter = require('events');

class DownloadManager extends EventEmitter {
  constructor() {
    super();
    this.downloads = new Map();
  }
  
  iniziaDownload(id, nomeFile, dimensione) {
    const download = {
      id,
      nomeFile,
      dimensione,
      scaricato: 0,
      stato: 'in corso'
    };
    
    this.downloads.set(id, download);
    
    // TODO: Emetti evento 'download-iniziato'
    
    // TODO: Simula il download con setInterval
    // Incrementa 'scaricato' del 10% ogni 500ms
    // Emetti evento 'progresso' ad ogni step
    // Quando scaricato === dimensione, emetti 'download-completato'
  }
  
  cancellaDownload(id) {
    // TODO: Ferma il download e rimuovi dalla Map
    
    // TODO: Emetti evento 'download-cancellato'
  }
  
  getStatoDownload(id) {
    return this.downloads.get(id);
  }
}

// TODO: Crea il manager e aggiungi listener

const manager = new DownloadManager();

// Listener per inizio download

// Listener per progresso (mostra percentuale)

// Listener per completamento

// Test
// manager.iniziaDownload(1, 'video.mp4', 1000);
```

**Obiettivo:** Simulare download con barra di progresso e gestione eventi.

---

## Esercizio 6: Sistema di Allarmi 🔔

**Difficoltà:** Facile/Media  
**Concetti:** Timer, `once()`, rimozione listener

Crea un sistema di allarmi con programmazione temporale:

```javascript
const EventEmitter = require('events');

class SistemaAllarmi extends EventEmitter {
  constructor() {
    super();
    this.allarmi = [];
  }
  
  impostaAllarme(nome, secondi) {
    const allarme = {
      nome,
      secondi,
      timestamp: Date.now()
    };
    
    this.allarmi.push(allarme);
    
    // TODO: Usa setTimeout per emettere 'allarme-suonato' dopo i secondi specificati
    
    // TODO: Emetti evento 'allarme-impostato' immediatamente
  }
  
  impostaPromemoria(messaggio, secondi) {
    // TODO: Simile a impostaAllarme ma emette 'promemoria'
  }
  
  getAllarmiAttivi() {
    return this.allarmi.length;
  }
}

// TODO: Implementa i listener

const sistema = new SistemaAllarmi();

// Listener che suona quando l'allarme scatta

// Listener once per il primo allarme

// Test
// sistema.impostaAllarme('Sveglia', 3);
// sistema.impostaAllarme('Riunione', 5);
// sistema.impostaPromemoria('Bere acqua', 2);
```

**Obiettivo:** Gestire allarmi temporizzati con eventi appropriati.

---

## Esercizio 7: Gioco del Dado 🎲

**Difficoltà:** Facile  
**Concetti:** Eventi casuali, statistiche

Crea un gioco del dado con statistiche:

```javascript
const EventEmitter = require('events');

class GiocoDado extends EventEmitter {
  constructor() {
    super();
    this.lanci = 0;
    this.statistiche = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
    };
  }
  
  lancia() {
    const risultato = Math.floor(Math.random() * 6) + 1;
    this.lanci++;
    this.statistiche[risultato]++;
    
    // TODO: Emetti evento 'dado-lanciato' con il risultato
    
    // TODO: Se esce 6, emetti anche 'sei-uscito'
    
    // TODO: Se esce 1, emetti anche 'uno-uscito'
    
    return risultato;
  }
  
  getStatistiche() {
    return {
      lanci: this.lanci,
      statistiche: this.statistiche
    };
  }
}

// TODO: Crea il gioco e aggiungi listener

const gioco = new GiocoDado();

// Listener per ogni lancio

// Listener speciale quando esce 6

// Listener che conta i lanci pari vs dispari

// Test: lancia il dado 20 volte
// for (let i = 0; i < 20; i++) {
//   gioco.lancia();
// }
```

**Obiettivo:** Tracciare lanci del dado con eventi e statistiche.

---

## Esercizio 8: Task Manager 📋

**Difficoltà:** Media  
**Concetti:** Stati complessi, eventi multipli

Crea un gestore di task con stati e priorità:

```javascript
const EventEmitter = require('events');

class TaskManager extends EventEmitter {
  constructor() {
    super();
    this.tasks = [];
    this.taskId = 0;
  }
  
  aggiungiTask(titolo, priorita = 'normale') {
    // TODO: Crea il task con id, titolo, priorità, stato 'da fare'
    
    // TODO: Aggiungi all'array
    
    // TODO: Emetti 'task-creato'
    
    // TODO: Se priorità è 'alta', emetti anche 'task-urgente'
  }
  
  completaTask(id) {
    // TODO: Trova il task e cambia stato a 'completato'
    
    // TODO: Emetti 'task-completato'
  }
  
  eliminaTask(id) {
    // TODO: Rimuovi il task dall'array
    
    // TODO: Emetti 'task-eliminato'
  }
  
  getTaskDaFare() {
    return this.tasks.filter(t => t.stato === 'da fare');
  }
  
  getTaskCompletati() {
    return this.tasks.filter(t => t.stato === 'completato');
  }
}

// TODO: Implementa i listener e testa

const manager = new TaskManager();

// Listener per task creati

// Listener per task urgenti

// Listener per task completati (mostra congratulazioni)

// Test
// manager.aggiungiTask('Studiare JavaScript', 'alta');
// manager.aggiungiTask('Fare la spesa', 'normale');
// manager.completaTask(1);
```

**Obiettivo:** Gestire task con diversi stati e priorità.

---

## Esercizio 9: Termometro Digitale 🌡️

**Difficoltà:** Facile/Media  
**Concetti:** Monitoraggio continuo, soglie

Crea un termometro che monitora la temperatura:

```javascript
const EventEmitter = require('events');

class Termometro extends EventEmitter {
  constructor() {
    super();
    this.temperatura = 20; // Temperatura iniziale
    this.sogliaMassima = 30;
    this.sogliaMinima = 10;
  }
  
  leggiTemperatura() {
    // TODO: Genera temperatura casuale tra 5 e 35
    // this.temperatura = ...
    
    // TODO: Emetti 'temperatura-letta' con il valore
    
    // TODO: Se temp > sogliaMassima, emetti 'temperatura-alta'
    
    // TODO: Se temp < sogliaMinima, emetti 'temperatura-bassa'
    
    // TODO: Se temp tra 18 e 24, emetti 'temperatura-ottimale'
    
    return this.temperatura;
  }
  
  avviaMonitoraggio(intervalloMs = 2000) {
    // TODO: Usa setInterval per leggere la temperatura periodicamente
  }
  
  fermaMonitoraggio() {
    // TODO: Ferma il monitoraggio
  }
  
  impostaSoglie(min, max) {
    this.sogliaMinima = min;
    this.sogliaMassima = max;
  }
}

// TODO: Crea termometro e listener

const termo = new Termometro();

// Listener per ogni lettura

// Listener per temperatura alta (mostra warning)

// Listener per temperatura bassa (mostra warning)

// Listener per temperatura ottimale

// Test
// termo.avviaMonitoraggio(1000);
```

**Obiettivo:** Monitorare temperatura con alert per soglie.

---

## Esercizio 10: Sistema di Autenticazione 🔐

**Difficoltà:** Media  
**Concetti:** Stati utente, sicurezza base

Crea un sistema di login/logout con eventi:

```javascript
const EventEmitter = require('events');

class SistemaAuth extends EventEmitter {
  constructor() {
    super();
    this.utenti = new Map(); // username -> { password, loggato, tentativi }
    this.sessioni = new Set();
  }
  
  registraUtente(username, password) {
    // TODO: Verifica che l'utente non esista già
    
    // TODO: Aggiungi utente alla Map
    
    // TODO: Emetti 'utente-registrato'
  }
  
  login(username, password) {
    const utente = this.utenti.get(username);
    
    // TODO: Verifica credenziali
    
    // TODO: Se corrette, segna come loggato e emetti 'login-successo'
    
    // TODO: Se errate, incrementa tentativi e emetti 'login-fallito'
    
    // TODO: Dopo 3 tentativi, emetti 'account-bloccato'
  }
  
  logout(username) {
    // TODO: Segna utente come non loggato
    
    // TODO: Emetti 'logout'
  }
  
  isLoggato(username) {
    const utente = this.utenti.get(username);
    return utente ? utente.loggato : false;
  }
}

// TODO: Implementa i listener

const auth = new SistemaAuth();

// Listener per registrazione

// Listener per login successo

// Listener per login fallito

// Listener per account bloccato

// Test
// auth.registraUtente('mario', 'password123');
// auth.login('mario', 'wrong'); // Fallisce
// auth.login('mario', 'password123'); // Successo
// auth.logout('mario');
```

**Obiettivo:** Sistema di autenticazione completo con gestione errori.

---

## Suggerimenti Generali per Tutti gli Esercizi

### Best Practices da Seguire:

1. **Nomi eventi chiari e descrittivi**
   ```javascript
   // ✅ Buono
   this.emit('utente-registrato', { username, timestamp });
   
   // ❌ Cattivo
   this.emit('user', data);
   ```

2. **Sempre passare oggetti come dati**
   ```javascript
   // ✅ Buono - espandibile
   this.emit('evento', { valore1, valore2, timestamp });
   
   // ❌ Cattivo - difficile da estendere
   this.emit('evento', valore1, valore2);
   ```

3. **Gestione errori nei listener**
   ```javascript
   emitter.on('evento', (data) => {
     try {
       // operazioni
     } catch (error) {
       console.error('Errore nel listener:', error);
     }
   });
   ```

4. **Pulizia dei listener**
   ```javascript
   // Ricorda di rimuovere listener quando non servono più
   emitter.off('evento', handler);
   ```

---

## Domande di Autovalutazione sugli Esercizi

**1. In quale esercizio è più utile usare `once()` invece di `on()`?**
- A) Carrello della Spesa
- B) Sistema di Allarmi
- C) Chat Room
- D) Termometro

**2. Quale esercizio richiede la gestione di operazioni asincrone con timer?**
- A) Blog
- B) Semaforo e Download Manager
- C) Gioco del Dado
- D) Task Manager

**3. In quale esercizio è importante tracciare uno stato complesso (con Set o Map)?**
- A) Blog
- B) Chat Room e Sistema Auth
- C) Gioco del Dado
- D) Semaforo

**4. Quale pattern è implementato in tutti questi esercizi?**
- A) Singleton
- B) Factory
- C) Observer
- D) Strategy

**5. Perché è importante emettere eventi specifici (es. 'sei-uscito') oltre a quelli generici?**
- A) Per avere più codice
- B) Per permettere listener specializzati che reagiscono solo a casi specifici
- C) Per confondere gli sviluppatori
- D) Non è importante

---

## Risposte

**1. B) Sistema di Allarmi** - `once()` è perfetto per allarmi che devono suonare una sola volta.

**2. B) Semaforo e Download Manager** - Entrambi usano `setInterval`/`setTimeout` per simulare processi temporali.

**3. B) Chat Room e Sistema Auth** - Usano `Set` per utenti online e `Map` per credenziali/stato.

**4. C) Observer** - EventEmitter implementa il pattern Observer, dove gli oggetti (listener) osservano e reagiscono agli eventi.

**5. B) Per permettere listener specializzati** - Eventi specifici permettono logica mirata senza dover filtrare nei listener generici.