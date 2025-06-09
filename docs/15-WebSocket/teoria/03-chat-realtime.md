# Implementazione di Chat Real-time con Socket.io

## Introduzione

Le applicazioni di chat in tempo reale sono uno dei casi d'uso più comuni per WebSocket e Socket.io. In questa guida, esploreremo come implementare un sistema di chat completo utilizzando Socket.io, con funzionalità come messaggi privati, stanze di chat e notifiche di digitazione.

## Struttura di base di un'applicazione di chat

Una chat real-time tipicamente include queste componenti:

1. **Server Socket.io**: Gestisce le connessioni e inoltra i messaggi tra i client.
2. **Client web**: Interfaccia utente per inviare e ricevere messaggi.
3. **Sistema di stanze**: Per organizzare le conversazioni in gruppi.
4. **Gestione degli utenti**: Per tenere traccia degli utenti online e delle loro informazioni.

## Implementazione del server

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servi i file statici
app.use(express.static(path.join(__dirname, 'public')));

// Memorizza gli utenti connessi
const users = {};

// Gestisci le connessioni Socket.io
io.on('connection', (socket) => {
  console.log('Nuovo utente connesso:', socket.id);
  
  // Gestisci la registrazione dell'utente
  socket.on('register', (username) => {
    // Memorizza l'username associato a questo socket
    users[socket.id] = {
      id: socket.id,
      username: username
    };
    
    // Notifica a tutti che un nuovo utente è entrato
    io.emit('user joined', {
      id: socket.id,
      username: username
    });
    
    // Invia la lista degli utenti connessi
    socket.emit('user list', Object.values(users));
  });
  
  // Gestisci i messaggi della chat globale
  socket.on('chat message', (msg) => {
    const user = users[socket.id];
    if (user) {
      // Inoltra il messaggio a tutti con le informazioni sull'utente
      io.emit('chat message', {
        text: msg,
        user: user,
        time: new Date().toISOString()
      });
    }
  });
  
  // Gestisci i messaggi privati
  socket.on('private message', ({ to, message }) => {
    const user = users[socket.id];
    if (user && users[to]) {
      // Invia solo al destinatario e al mittente
      socket.to(to).emit('private message', {
        text: message,
        from: user,
        time: new Date().toISOString()
      });
      
      // Invia anche al mittente per conferma
      socket.emit('private message', {
        text: message,
        to: users[to],
        time: new Date().toISOString()
      });
    }
  });
  
  // Gestisci l'entrata in una stanza
  socket.on('join room', (room) => {
    socket.join(room);
    const user = users[socket.id];
    if (user) {
      // Notifica agli altri nella stanza
      socket.to(room).emit('room message', {
        text: `${user.username} è entrato nella stanza`,
        room: room,
        time: new Date().toISOString()
      });
    }
  });
  
  // Gestisci i messaggi nelle stanze
  socket.on('room message', ({ room, message }) => {
    const user = users[socket.id];
    if (user) {
      // Inoltra il messaggio a tutti nella stanza
      io.to(room).emit('room message', {
        text: message,
        user: user,
        room: room,
        time: new Date().toISOString()
      });
    }
  });
  
  // Gestisci le notifiche di digitazione
  socket.on('typing', ({ isTyping, room }) => {
    const user = users[socket.id];
    if (user) {
      if (room) {
        // Notifica di digitazione in una stanza
        socket.to(room).emit('typing', {
          user: user,
          isTyping: isTyping,
          room: room
        });
      } else {
        // Notifica di digitazione globale
        socket.broadcast.emit('typing', {
          user: user,
          isTyping: isTyping
        });
      }
    }
  });
  
  // Gestisci la disconnessione
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      // Rimuovi l'utente dalla lista
      delete users[socket.id];
      
      // Notifica a tutti che l'utente è uscito
      io.emit('user left', {
        id: socket.id,
        username: user.username
      });
    }
  });
});

server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

## Implementazione del client

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chat Real-time con Socket.io</title>
  <style>
    body { margin: 0; padding-bottom: 3rem; font-family: -apple-system, sans-serif; }
    .chat-container { max-width: 800px; margin: 0 auto; display: flex; height: calc(100vh - 50px); }
    .sidebar { width: 200px; background: #f5f5f5; padding: 1rem; overflow-y: auto; }
    .main-chat { flex-grow: 1; display: flex; flex-direction: column; }
    .chat-messages { flex-grow: 1; padding: 1rem; overflow-y: auto; }
    .message { margin-bottom: 1rem; padding: 0.5rem; border-radius: 5px; }
    .message.own { background: #dcf8c6; margin-left: 2rem; }
    .message.other { background: #f1f0f0; margin-right: 2rem; }
    .message.private { background: #d1c4e9; }
    .message.room { background: #bbdefb; }
    .message .meta { font-size: 0.8rem; color: #666; margin-bottom: 0.3rem; }
    .message .text { word-break: break-word; }
    .typing-indicator { height: 1.5rem; font-style: italic; color: #666; padding: 0 1rem; }
    .input-area { display: flex; padding: 0.5rem; border-top: 1px solid #eee; }
    .input-area input { flex-grow: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 3px; }
    .input-area button { margin-left: 0.5rem; padding: 0.5rem 1rem; background: #4caf50; color: white; border: none; border-radius: 3px; cursor: pointer; }
    .user-list { margin-bottom: 1rem; }
    .user-list h3, .rooms h3 { margin-top: 0; }
    .user-item, .room-item { padding: 0.5rem; cursor: pointer; border-radius: 3px; }
    .user-item:hover, .room-item:hover { background: #e0e0e0; }
    .room-item.active { background: #bbdefb; }
    .tabs { display: flex; border-bottom: 1px solid #ddd; }
    .tab { padding: 0.5rem 1rem; cursor: pointer; }
    .tab.active { border-bottom: 2px solid #4caf50; }
  </style>
</head>
<body>
  <div class="chat-container">
    <div class="sidebar">
      <div class="user-list">
        <h3>Utenti Online</h3>
        <div id="users"></div>
      </div>
      <div class="rooms">
        <h3>Stanze</h3>
        <div id="room-list">
          <div class="room-item" data-room="generale">Generale</div>
          <div class="room-item" data-room="supporto">Supporto</div>
          <div class="room-item" data-room="casual">Casual</div>
        </div>
      </div>
    </div>
    <div class="main-chat">
      <div class="tabs">
        <div class="tab active" data-tab="global">Globale</div>
        <div class="tab" data-tab="room">Stanza</div>
        <div class="tab" data-tab="private">Privato</div>
      </div>
      <div class="chat-messages" id="messages"></div>
      <div class="typing-indicator" id="typing"></div>
      <div class="input-area">
        <input id="message-input" autocomplete="off" placeholder="Scrivi un messaggio..." />
        <button id="send-button">Invia</button>
      </div>
    </div>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    // Connessione al server Socket.io
    const socket = io();
    
    // Elementi DOM
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const usersContainer = document.getElementById('users');
    const typingIndicator = document.getElementById('typing');
    const tabs = document.querySelectorAll('.tab');
    const roomItems = document.querySelectorAll('.room-item');
    
    // Stato dell'applicazione
    let currentUsername = '';
    let currentTab = 'global';
    let currentRoom = '';
    let privateRecipient = null;
    let typingTimeout = null;
    
    // Richiedi username all'utente
    while (!currentUsername) {
      currentUsername = prompt('Inserisci il tuo nome utente:');
    }
    
    // Registra l'utente
    socket.emit('register', currentUsername);
    
    // Gestisci l'invio dei messaggi
    function sendMessage() {
      const message = messageInput.value.trim();
      if (message) {
        switch (currentTab) {
          case 'global':
            socket.emit('chat message', message);
            break;
          case 'room':
            if (currentRoom) {
              socket.emit('room message', { room: currentRoom, message });
            }
            break;
          case 'private':
            if (privateRecipient) {
              socket.emit('private message', { to: privateRecipient.id, message });
            }
            break;
        }
        messageInput.value = '';
      }
    }
    
    // Gestisci l'invio con il pulsante
    sendButton.addEventListener('click', sendMessage);
    
    // Gestisci l'invio con Enter
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Gestisci l'evento di digitazione
    messageInput.addEventListener('input', () => {
      // Cancella il timeout precedente
      clearTimeout(typingTimeout);
      
      // Emetti l'evento di digitazione
      if (currentTab === 'global') {
        socket.emit('typing', { isTyping: true });
      } else if (currentTab === 'room' && currentRoom) {
        socket.emit('typing', { isTyping: true, room: currentRoom });
      }
      
      // Imposta un timeout per interrompere l'evento di digitazione
      typingTimeout = setTimeout(() => {
        if (currentTab === 'global') {
          socket.emit('typing', { isTyping: false });
        } else if (currentTab === 'room' && currentRoom) {
          socket.emit('typing', { isTyping: false, room: currentRoom });
        }
      }, 1000);
    });
    
    // Gestisci il cambio di tab
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Rimuovi la classe active da tutte le tab
        tabs.forEach(t => t.classList.remove('active'));
        // Aggiungi la classe active alla tab cliccata
        tab.classList.add('active');
        // Aggiorna la tab corrente
        currentTab = tab.dataset.tab;
        // Pulisci l'input
        messageInput.value = '';
        // Aggiorna il placeholder
        updateInputPlaceholder();
      });
    });
    
    // Gestisci il cambio di stanza
    roomItems.forEach(item => {
      item.addEventListener('click', () => {
        // Rimuovi la classe active da tutte le stanze
        roomItems.forEach(i => i.classList.remove('active'));
        // Aggiungi la classe active alla stanza cliccata
        item.classList.add('active');
        // Aggiorna la stanza corrente
        currentRoom = item.dataset.room;
        // Unisciti alla stanza
        socket.emit('join room', currentRoom);
        // Cambia alla tab della stanza
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector('.tab[data-tab="room"]').classList.add('active');
        currentTab = 'room';
        // Aggiorna il placeholder
        updateInputPlaceholder();
      });
    });
    
    // Aggiorna il placeholder dell'input
    function updateInputPlaceholder() {
      switch (currentTab) {
        case 'global':
          messageInput.placeholder = 'Scrivi un messaggio globale...';
          break;
        case 'room':
          messageInput.placeholder = currentRoom ? 
            `Scrivi un messaggio nella stanza ${currentRoom}...` : 
            'Seleziona prima una stanza...';
          break;
        case 'private':
          messageInput.placeholder = privateRecipient ? 
            `Scrivi un messaggio privato a ${privateRecipient.username}...` : 
            'Seleziona prima un utente...';
          break;
      }
    }
    
    // Aggiungi un messaggio alla chat
    function addMessage(message, type) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', type);
      
      const metaElement = document.createElement('div');
      metaElement.classList.add('meta');
      
      const textElement = document.createElement('div');
      textElement.classList.add('text');
      
      // Formatta il messaggio in base al tipo
      switch (type) {
        case 'own':
        case 'other':
          metaElement.textContent = `${message.user.username} - ${new Date(message.time).toLocaleTimeString()}`;
          textElement.textContent = message.text;
          break;
        case 'private':
          if (message.from) {
            metaElement.textContent = `Da ${message.from.username} (privato) - ${new Date(message.time).toLocaleTimeString()}`;
          } else if (message.to) {
            metaElement.textContent = `A ${message.to.username} (privato) - ${new Date(message.time).toLocaleTimeString()}`;
          }
          textElement.textContent = message.text;
          break;
        case 'room':
          if (message.user) {
            metaElement.textContent = `${message.user.username} (${message.room}) - ${new Date(message.time).toLocaleTimeString()}`;
            textElement.textContent = message.text;
          } else {
            metaElement.textContent = `${message.room} - ${new Date(message.time).toLocaleTimeString()}`;
            textElement.textContent = message.text;
          }
          break;
        case 'system':
          metaElement.textContent = new Date().toLocaleTimeString();
          textElement.textContent = message.text;
          break;
      }
      
      messageElement.appendChild(metaElement);
      messageElement.appendChild(textElement);
      messagesContainer.appendChild(messageElement);
      
      // Scorri verso il basso
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Aggiorna la lista degli utenti
    function updateUserList(users) {
      usersContainer.innerHTML = '';
      users.forEach(user => {
        if (user.id !== socket.id) { // Non mostrare l'utente corrente
          const userElement = document.createElement('div');
          userElement.classList.add('user-item');
          userElement.textContent = user.username;
          userElement.dataset.id = user.id;
          
          // Gestisci il click sull'utente per i messaggi privati
          userElement.addEventListener('click', () => {
            privateRecipient = user;
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelector('.tab[data-tab="private"]').classList.add('active');
            currentTab = 'private';
            updateInputPlaceholder();
            addMessage({ text: `Hai iniziato a chattare con ${user.username}` }, 'system');
          });
          
          usersContainer.appendChild(userElement);
        }
      });
    }
    
    // Eventi Socket.io
    
    // Ricezione della lista utenti
    socket.on('user list', (users) => {
      updateUserList(users);
    });
    
    // Nuovo utente connesso
    socket.on('user joined', (user) => {
      addMessage({ text: `${user.username} è entrato nella chat` }, 'system');
      // Aggiorna la lista utenti
      socket.emit('get users');
    });
    
    // Utente disconnesso
    socket.on('user left', (user) => {
      addMessage({ text: `${user.username} ha lasciato la chat` }, 'system');
      // Se era il destinatario privato, resetta
      if (privateRecipient && privateRecipient.id === user.id) {
        privateRecipient = null;
        updateInputPlaceholder();
      }
      // Aggiorna la lista utenti
      socket.emit('get users');
    });
    
    // Ricezione messaggio globale
    socket.on('chat message', (message) => {
      // Determina se è un messaggio proprio o di altri
      const type = message.user.id === socket.id ? 'own' : 'other';
      addMessage(message, type);
    });
    
    // Ricezione messaggio privato
    socket.on('private message', (message) => {
      addMessage(message, 'private');
    });
    
    // Ricezione messaggio stanza
    socket.on('room message', (message) => {
      addMessage(message, 'room');
    });
    
    // Ricezione notifica digitazione
    socket.on('typing', (data) => {
      // Mostra l'indicatore solo se è rilevante per la tab corrente
      if (
        (currentTab === 'global' && !data.room) ||
        (currentTab === 'room' && data.room === currentRoom)
      ) {
        if (data.isTyping) {
          typingIndicator.textContent = `${data.user.username} sta scrivendo...`;
        } else {
          typingIndicator.textContent = '';
        }
      }
    });
    
    // Inizializzazione
    updateInputPlaceholder();
    addMessage({ text: 'Benvenuto nella chat!' }, 'system');
  </script>
</body>
</html>
```

## Funzionalità avanzate

### Persistenza dei messaggi

Per mantenere la cronologia dei messaggi anche dopo il riavvio del server, puoi utilizzare un database come MongoDB:

```javascript
// Aggiungi al server
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatapp', { useNewUrlParser: true, useUnifiedTopology: true });

// Definisci lo schema per i messaggi
const messageSchema = new mongoose.Schema({
  text: String,
  user: {
    id: String,
    username: String
  },
  room: String,
  private: Boolean,
  to: String,
  time: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Salva i messaggi quando vengono inviati
socket.on('chat message', (msg) => {
  const user = users[socket.id];
  if (user) {
    const messageData = {
      text: msg,
      user: user,
      time: new Date()
    };
    
    // Salva nel database
    const message = new Message({
      text: msg,
      user: {
        id: user.id,
        username: user.username
      }
    });
    message.save();
    
    // Inoltra a tutti
    io.emit('chat message', messageData);
  }
});

// Carica i messaggi precedenti quando un utente si connette
socket.on('register', async (username) => {
  // ... codice esistente ...
  
  // Carica gli ultimi 50 messaggi globali
  const messages = await Message.find({ room: null, private: false })
    .sort({ time: -1 })
    .limit(50)
    .lean();
  
  // Invia i messaggi in ordine cronologico
  socket.emit('message history', messages.reverse());
});
```

### Notifiche di lettura

Puoi implementare le notifiche di lettura per i messaggi privati:

```javascript
// Nel server
socket.on('message read', ({ messageId }) => {
  const user = users[socket.id];
  if (user) {
    // Trova il messaggio nel database e aggiorna lo stato
    Message.findByIdAndUpdate(messageId, { read: true }, (err) => {
      if (!err) {
        // Notifica al mittente che il messaggio è stato letto
        const message = await Message.findById(messageId);
        if (message && message.user.id) {
          io.to(message.user.id).emit('message read', { messageId });
        }
      }
    });
  }
});

// Nel client
socket.on('private message', (message) => {
  // ... codice esistente ...
  
  // Notifica al server che il messaggio è stato letto
  socket.emit('message read', { messageId: message._id });
});

socket.on('message read', ({ messageId }) => {
  // Trova il messaggio nell'interfaccia e aggiorna lo stato
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
  if (messageElement) {
    messageElement.classList.add('read');
    const metaElement = messageElement.querySelector('.meta');
    metaElement.innerHTML += ' <span class="read-status">✓ Letto</span>';
  }
});
```

## Best Practices per le Chat Real-time

1. **Gestione della connessione**:
   - Implementa la riconnessione automatica.
   - Mostra lo stato della connessione all'utente.

2. **Sicurezza**:
   - Valida tutti i dati in ingresso sul server.
   - Implementa l'autenticazione degli utenti.
   - Utilizza HTTPS per proteggere le comunicazioni.

3. **Ottimizzazione delle prestazioni**:
   - Limita la frequenza dei messaggi per prevenire il flooding.
   - Implementa la paginazione per caricare i messaggi precedenti.
   - Considera l'uso di WebWorker per operazioni pesanti sul client.

4. **Esperienza utente**:
   - Fornisci feedback immediato all'utente quando invia un messaggio.
   - Implementa indicatori di stato (online, offline, digitando).
   - Gestisci correttamente gli errori e le disconnessioni.

5. **Scalabilità**:
   - Utilizza un adattatore come Redis per gestire più istanze del server.
   - Implementa la sharding per distribuire il carico su più server.

## Conclusione

Implementare una chat real-time con Socket.io richiede attenzione a molti aspetti, dalla gestione delle connessioni alla sicurezza e all'esperienza utente. Tuttavia, Socket.io semplifica notevolmente questo processo fornendo strumenti potenti e flessibili.

Con le tecniche mostrate in questa guida, puoi creare applicazioni di chat robuste e scalabili che offrono un'esperienza utente fluida e reattiva.

---

[Torna all'indice dell'esercitazione](../README.md)