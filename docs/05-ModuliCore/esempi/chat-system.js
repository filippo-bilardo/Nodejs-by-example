#!/usr/bin/env node
/**
 * Sistema di Chat Real-time con EventEmitter
 * Implementa un sistema completo di chat con utenti, stanze e messaggi
 */

const { EventEmitter } = require('events');
const util = require('util');

// Classe principale del sistema di chat
class ChatSystem extends EventEmitter {
  constructor() {
    super();
    this.utenti = new Map();        // id -> { id, nome, stanze, online, ultimaAttivita }
    this.stanze = new Map();        // nome -> { nome, utenti, messaggi, private }
    this.messaggi = [];             // Storia globale messaggi
    this.setMaxListeners(100);      // Supporta molti listener
  }

  // Gestione utenti
  aggiungiUtente(id, nome) {
    if (this.utenti.has(id)) {
      throw new Error(`Utente ${id} già esistente`);
    }

    const utente = {
      id,
      nome,
      stanze: new Set(),
      online: true,
      ultimaAttivita: new Date(),
      creato: new Date()
    };

    this.utenti.set(id, utente);
    this.emit('utente-connesso', utente);
    
    // Auto-join alla stanza generale
    this.joinStanza(id, 'generale');
    
    return utente;
  }

  disconnettiUtente(id) {
    const utente = this.utenti.get(id);
    if (!utente) return false;

    // Rimuovi da tutte le stanze
    for (const nomeStanza of utente.stanze) {
      this.leaveStanza(id, nomeStanza);
    }

    utente.online = false;
    this.emit('utente-disconnesso', utente);
    return true;
  }

  // Gestione stanze
  creaStanza(nomeStanza, creatoreId, privata = false) {
    if (this.stanze.has(nomeStanza)) {
      throw new Error(`Stanza '${nomeStanza}' già esistente`);
    }

    const stanza = {
      nome: nomeStanza,
      creatore: creatoreId,
      utenti: new Set(),
      messaggi: [],
      privata,
      creata: new Date()
    };

    this.stanze.set(nomeStanza, stanza);
    this.emit('stanza-creata', stanza, creatoreId);
    
    return stanza;
  }

  joinStanza(utenteId, nomeStanza) {
    const utente = this.utenti.get(utenteId);
    let stanza = this.stanze.get(nomeStanza);

    if (!utente) {
      throw new Error(`Utente ${utenteId} non trovato`);
    }

    // Crea stanza se non esistente (stanze pubbliche)
    if (!stanza && nomeStanza !== 'generale') {
      stanza = this.creaStanza(nomeStanza, utenteId);
    } else if (!stanza) {
      // Crea stanza generale di default
      stanza = {
        nome: 'generale',
        creatore: 'system',
        utenti: new Set(),
        messaggi: [],
        privata: false,
        creata: new Date()
      };
      this.stanze.set('generale', stanza);
    }

    stanza.utenti.add(utenteId);
    utente.stanze.add(nomeStanza);
    utente.ultimaAttivita = new Date();

    this.emit('utente-join-stanza', utente, stanza);
    
    // Notifica gli altri utenti nella stanza
    this._notificaStanza(nomeStanza, 'utente-entrato', {
      utente: utente,
      stanza: nomeStanza
    }, utenteId);

    return true;
  }

  leaveStanza(utenteId, nomeStanza) {
    const utente = this.utenti.get(utenteId);
    const stanza = this.stanze.get(nomeStanza);

    if (!utente || !stanza) return false;

    stanza.utenti.delete(utenteId);
    utente.stanze.delete(nomeStanza);

    this.emit('utente-leave-stanza', utente, stanza);
    
    // Notifica gli altri utenti nella stanza
    this._notificaStanza(nomeStanza, 'utente-uscito', {
      utente: utente,
      stanza: nomeStanza
    }, utenteId);

    return true;
  }

  // Gestione messaggi
  inviaMessaggio(utenteId, nomeStanza, contenuto, tipo = 'text') {
    const utente = this.utenti.get(utenteId);
    const stanza = this.stanze.get(nomeStanza);

    if (!utente) {
      throw new Error(`Utente ${utenteId} non trovato`);
    }

    if (!stanza) {
      throw new Error(`Stanza '${nomeStanza}' non trovata`);
    }

    if (!stanza.utenti.has(utenteId)) {
      throw new Error(`Utente ${utenteId} non è nella stanza '${nomeStanza}'`);
    }

    const messaggio = {
      id: this._generaIdMessaggio(),
      utente: {
        id: utente.id,
        nome: utente.nome
      },
      stanza: nomeStanza,
      contenuto,
      tipo,
      timestamp: new Date(),
      modificato: false
    };

    // Salva in stanza e storia globale
    stanza.messaggi.push(messaggio);
    this.messaggi.push(messaggio);

    // Aggiorna attività utente
    utente.ultimaAttivita = new Date();

    // Eventi
    this.emit('messaggio-inviato', messaggio);
    this._notificaStanza(nomeStanza, 'nuovo-messaggio', messaggio);

    return messaggio;
  }

  inviaMessaggioPrivato(mittenteId, destinatarioId, contenuto) {
    const mittente = this.utenti.get(mittenteId);
    const destinatario = this.utenti.get(destinatarioId);

    if (!mittente || !destinatario) {
      throw new Error('Mittente o destinatario non trovato');
    }

    const messaggio = {
      id: this._generaIdMessaggio(),
      mittente: {
        id: mittente.id,
        nome: mittente.nome
      },
      destinatario: {
        id: destinatario.id,
        nome: destinatario.nome
      },
      contenuto,
      tipo: 'private',
      timestamp: new Date()
    };

    this.messaggi.push(messaggio);
    
    // Eventi specifici per messaggi privati
    this.emit('messaggio-privato', messaggio);
    this.emit(`messaggio-per-${destinatarioId}`, messaggio);
    this.emit(`messaggio-da-${mittenteId}`, messaggio);

    return messaggio;
  }

  // Utility e query
  getUtentiOnline() {
    return Array.from(this.utenti.values()).filter(u => u.online);
  }

  getUtentiInStanza(nomeStanza) {
    const stanza = this.stanze.get(nomeStanza);
    if (!stanza) return [];

    return Array.from(stanza.utenti).map(id => this.utenti.get(id));
  }

  getMessaggiStanza(nomeStanza, limit = 50) {
    const stanza = this.stanze.get(nomeStanza);
    if (!stanza) return [];

    return stanza.messaggi.slice(-limit);
  }

  getMessaggiPrivati(utenteId1, utenteId2) {
    return this.messaggi.filter(m => 
      m.tipo === 'private' && 
      ((m.mittente.id === utenteId1 && m.destinatario.id === utenteId2) ||
       (m.mittente.id === utenteId2 && m.destinatario.id === utenteId1))
    ).sort((a, b) => a.timestamp - b.timestamp);
  }

  getStanze() {
    return Array.from(this.stanze.values());
  }

  getStatistiche() {
    return {
      utentiTotali: this.utenti.size,
      utentiOnline: this.getUtentiOnline().length,
      stanzeTotali: this.stanze.size,
      messaggiTotali: this.messaggi.length,
      timestamp: new Date()
    };
  }

  // Metodi privati
  _notificaStanza(nomeStanza, evento, dati, escludi = null) {
    const stanza = this.stanze.get(nomeStanza);
    if (!stanza) return;

    for (const utenteId of stanza.utenti) {
      if (utenteId !== escludi) {
        this.emit(`${evento}-${utenteId}`, dati);
      }
    }
  }

  _generaIdMessaggio() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Classe per gestire un singolo utente/client
class ChatClient extends EventEmitter {
  constructor(chatSystem, userId, userName) {
    super();
    this.chat = chatSystem;
    this.userId = userId;
    this.userName = userName;
    this.connesso = false;

    // Setup listener per eventi personali
    this._setupListeners();
  }

  connetti() {
    if (this.connesso) return;

    this.chat.aggiungiUtente(this.userId, this.userName);
    this.connesso = true;
    this.emit('connesso');
  }

  disconnetti() {
    if (!this.connesso) return;

    this.chat.disconnettiUtente(this.userId);
    this.connesso = false;
    this.emit('disconnesso');
  }

  joinStanza(nomeStanza) {
    this.chat.joinStanza(this.userId, nomeStanza);
    this.emit('join-stanza', nomeStanza);
  }

  leaveStanza(nomeStanza) {
    this.chat.leaveStanza(this.userId, nomeStanza);
    this.emit('leave-stanza', nomeStanza);
  }

  inviaMessaggio(nomeStanza, messaggio) {
    const msg = this.chat.inviaMessaggio(this.userId, nomeStanza, messaggio);
    this.emit('messaggio-inviato', msg);
    return msg;
  }

  inviaMessaggioPrivato(destinatarioId, messaggio) {
    const msg = this.chat.inviaMessaggioPrivato(this.userId, destinatarioId, messaggio);
    this.emit('messaggio-privato-inviato', msg);
    return msg;
  }

  _setupListeners() {
    // Listener per messaggi nella stanza
    this.chat.on(`nuovo-messaggio-${this.userId}`, (messaggio) => {
      this.emit('messaggio-ricevuto', messaggio);
    });

    // Listener per messaggi privati
    this.chat.on(`messaggio-per-${this.userId}`, (messaggio) => {
      this.emit('messaggio-privato-ricevuto', messaggio);
    });

    // Listener per eventi stanza
    this.chat.on(`utente-entrato-${this.userId}`, (info) => {
      this.emit('utente-entrato-stanza', info);
    });

    this.chat.on(`utente-uscito-${this.userId}`, (info) => {
      this.emit('utente-uscito-stanza', info);
    });
  }
}

// Demo e test del sistema
if (require.main === module) {
  console.log('💬 Sistema Chat Real-time Demo\n');

  const chat = new ChatSystem();

  // Event listeners globali
  chat.on('utente-connesso', (utente) => {
    console.log(`✅ ${utente.nome} si è connesso (ID: ${utente.id})`);
  });

  chat.on('utente-disconnesso', (utente) => {
    console.log(`❌ ${utente.nome} si è disconnesso`);
  });

  chat.on('stanza-creata', (stanza, creatoreId) => {
    console.log(`🏠 Nuova stanza '${stanza.nome}' creata da ${creatoreId}`);
  });

  chat.on('messaggio-inviato', (messaggio) => {
    console.log(`📝 [${messaggio.stanza}] ${messaggio.utente.nome}: ${messaggio.contenuto}`);
  });

  chat.on('messaggio-privato', (messaggio) => {
    console.log(`🔒 [PRIVATO] ${messaggio.mittente.nome} → ${messaggio.destinatario.nome}: ${messaggio.contenuto}`);
  });

  // Crea alcuni client
  const alice = new ChatClient(chat, 'alice', 'Alice');
  const bob = new ChatClient(chat, 'bob', 'Bob');
  const charlie = new ChatClient(chat, 'charlie', 'Charlie');

  // Setup listener per client
  [alice, bob, charlie].forEach(client => {
    client.on('connesso', () => {
      console.log(`👋 ${client.userName} è entrato nella chat`);
    });

    client.on('messaggio-ricevuto', (msg) => {
      console.log(`📨 ${client.userName} ha ricevuto: [${msg.stanza}] ${msg.utente.nome}: ${msg.contenuto}`);
    });

    client.on('messaggio-privato-ricevuto', (msg) => {
      console.log(`🔐 ${client.userName} ha ricevuto messaggio privato da ${msg.mittente.nome}: ${msg.contenuto}`);
    });

    client.on('utente-entrato-stanza', (info) => {
      console.log(`👋 ${client.userName} vede che ${info.utente.nome} è entrato in '${info.stanza}'`);
    });
  });

  // Simulazione chat
  setTimeout(() => {
    console.log('\n🚀 Avvio simulazione chat...\n');

    // Connessioni
    alice.connetti();
    bob.connetti();
    charlie.connetti();

    setTimeout(() => {
      // Alice crea una stanza
      chat.creaStanza('developers', 'alice');
      alice.joinStanza('developers');
      
      setTimeout(() => {
        // Bob entra nella stanza developers
        bob.joinStanza('developers');
        
        setTimeout(() => {
          // Messaggi nella stanza
          alice.inviaMessaggio('developers', 'Ciao a tutti! Benvenuti nella stanza developers!');
          bob.inviaMessaggio('developers', 'Ciao Alice! Grazie per aver creato la stanza');
          
          setTimeout(() => {
            // Charlie entra
            charlie.connetti();
            charlie.joinStanza('developers');
            
            setTimeout(() => {
              charlie.inviaMessaggio('developers', 'Ciao ragazzi! Come va il progetto?');
              
              // Messaggio privato
              alice.inviaMessaggioPrivato('charlie', 'Ciao Charlie, ti posso parlare in privato?');
              charlie.inviaMessaggioPrivato('alice', 'Certo Alice, dimmi tutto!');
              
              setTimeout(() => {
                // Statistiche finali
                console.log('\n📊 STATISTICHE FINALI:');
                console.log(util.inspect(chat.getStatistiche(), { colors: true }));
                
                console.log('\n👥 UTENTI ONLINE:');
                chat.getUtentiOnline().forEach(u => {
                  console.log(`  - ${u.nome} (stanze: ${Array.from(u.stanze).join(', ')})`);
                });
                
                console.log('\n🏠 STANZE ATTIVE:');
                chat.getStanze().forEach(s => {
                  console.log(`  - ${s.nome} (${s.utenti.size} utenti, ${s.messaggi.length} messaggi)`);
                });
                
              }, 2000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 500);
}

module.exports = { ChatSystem, ChatClient };