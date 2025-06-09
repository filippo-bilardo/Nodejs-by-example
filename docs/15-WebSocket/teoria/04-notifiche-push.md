# Notifiche Push e Aggiornamenti Live con Socket.io

## Introduzione

Le notifiche push e gli aggiornamenti in tempo reale sono componenti essenziali delle applicazioni web moderne. Consentono di mantenere gli utenti informati su eventi rilevanti senza richiedere l'aggiornamento manuale della pagina. In questa guida, esploreremo come implementare questi sistemi utilizzando Socket.io.

## Tipi di notifiche e aggiornamenti

1. **Notifiche push**: Messaggi inviati dal server al client per informare l'utente di eventi specifici (nuovi messaggi, aggiornamenti di stato, ecc.).

2. **Aggiornamenti live**: Modifiche in tempo reale ai dati visualizzati nell'interfaccia utente (dashboard, contatori, grafici, ecc.).

3. **Notifiche di sistema**: Informazioni sullo stato del sistema o dell'applicazione (manutenzione programmata, problemi di connessione, ecc.).

## Implementazione di un sistema di notifiche push

### Server Socket.io

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

// Memorizza gli utenti connessi e le loro sottoscrizioni
const users = {};
const subscriptions = {};

// Gestisci le connessioni Socket.io
io.on('connection', (socket) => {
  console.log('Nuovo utente connesso:', socket.id);
  
  // Gestisci la registrazione dell'utente
  socket.on('register', (userData) => {
    // Memorizza l'utente
    users[socket.id] = {
      id: socket.id,
      username: userData.username,
      preferences: userData.preferences || {}
    };
    
    // Inizializza le sottoscrizioni dell'utente
    subscriptions[socket.id] = [];
    
    console.log(`Utente registrato: ${userData.username}`);
  });
  
  // Gestisci le sottoscrizioni alle notifiche
  socket.on('subscribe', (channels) => {
    if (!Array.isArray(channels)) channels = [channels];
    
    const user = users[socket.id];
    if (user) {
      // Aggiungi i canali alle sottoscrizioni dell'utente
      channels.forEach(channel => {
        if (!subscriptions[socket.id].includes(channel)) {
          subscriptions[socket.id].push(channel);
          // Unisci il socket alla stanza corrispondente al canale
          socket.join(channel);
          console.log(`${user.username} si è iscritto al canale: ${channel}`);
        }
      });
      
      // Conferma la sottoscrizione
      socket.emit('subscription_update', subscriptions[socket.id]);
    }
  });
  
  // Gestisci la cancellazione delle sottoscrizioni
  socket.on('unsubscribe', (channels) => {
    if (!Array.isArray(channels)) channels = [channels];
    
    const user = users[socket.id];
    if (user) {
      // Rimuovi i canali dalle sottoscrizioni dell'utente
      channels.forEach(channel => {
        const index = subscriptions[socket.id].indexOf(channel);
        if (index !== -1) {
          subscriptions[socket.id].splice(index, 1);
          // Rimuovi il socket dalla stanza
          socket.leave(channel);
          console.log(`${user.username} ha annullato l'iscrizione al canale: ${channel}`);
        }
      });
      
      // Conferma l'aggiornamento
      socket.emit('subscription_update', subscriptions[socket.id]);
    }
  });
  
  // Gestisci la disconnessione
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      console.log(`Utente disconnesso: ${user.username}`);
      // Pulisci i dati dell'utente
      delete users[socket.id];
      delete subscriptions[socket.id];
    }
  });
});

// API per inviare notifiche (potrebbe essere chiamata da altri servizi)
app.post('/api/notify', express.json(), (req, res) => {
  const { channel, title, message, data, priority } = req.body;
  
  if (!channel || !message) {
    return res.status(400).json({ error: 'Canale e messaggio sono obbligatori' });
  }
  
  // Crea l'oggetto notifica
  const notification = {
    id: Date.now().toString(),
    title: title || 'Notifica',
    message,
    data: data || {},
    priority: priority || 'normal',
    timestamp: new Date().toISOString()
  };
  
  // Invia la notifica a tutti gli utenti iscritti al canale
  io.to(channel).emit('notification', notification);
  
  res.json({ success: true, notification });
});

// Funzione per inviare aggiornamenti periodici (esempio: dashboard)
function sendDashboardUpdates() {
  // Simula dati in tempo reale
  const data = {
    activeUsers: Object.keys(users).length,
    cpuUsage: Math.floor(Math.random() * 100),
    memoryUsage: Math.floor(Math.random() * 100),
    requestsPerSecond: Math.floor(Math.random() * 200),
    timestamp: new Date().toISOString()
  };
  
  // Invia gli aggiornamenti a tutti gli iscritti al canale 'dashboard'
  io.to('dashboard').emit('dashboard_update', data);
}

// Invia aggiornamenti ogni 5 secondi
setInterval(sendDashboardUpdates, 5000);

server.listen(3000, () => {
  console.log('Server in ascolto sulla porta 3000');
});
```

### Client per le notifiche

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema di Notifiche con Socket.io</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 1200px; margin: 0 auto; display: flex; }
    .sidebar { width: 300px; padding-right: 20px; }
    .main-content { flex-grow: 1; }
    .notification-center { background: #f5f5f5; border-radius: 8px; padding: 15px; margin-bottom: 20px; }
    .notification-list { max-height: 400px; overflow-y: auto; }
    .notification { background: white; border-radius: 5px; padding: 10px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .notification.high { border-left: 4px solid #f44336; }
    .notification.normal { border-left: 4px solid #2196f3; }
    .notification.low { border-left: 4px solid #4caf50; }
    .notification-title { font-weight: bold; margin-bottom: 5px; }
    .notification-message { margin-bottom: 5px; }
    .notification-time { font-size: 0.8em; color: #666; }
    .dashboard { background: #f5f5f5; border-radius: 8px; padding: 15px; }
    .dashboard-title { margin-top: 0; }
    .metric { background: white; border-radius: 5px; padding: 15px; margin-bottom: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .metric-title { margin-top: 0; font-size: 0.9em; color: #666; }
    .metric-value { font-size: 2em; font-weight: bold; margin: 10px 0; }
    .metric-chart { height: 50px; background: #eee; margin-top: 10px; overflow: hidden; }
    .subscription-controls { margin-bottom: 20px; }
    .btn { padding: 8px 12px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px; }
    .btn:hover { background: #0b7dda; }
    .btn.active { background: #0b7dda; }
    .update-time { font-size: 0.8em; color: #666; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="sidebar">
      <div class="notification-center">
        <h2>Centro Notifiche</h2>
        <div class="subscription-controls">
          <button class="btn channel-btn" data-channel="system">Sistema</button>
          <button class="btn channel-btn" data-channel="updates">Aggiornamenti</button>
          <button class="btn channel-btn" data-channel="alerts">Avvisi</button>
        </div>
        <div class="notification-list" id="notification-list">
          <!-- Le notifiche verranno inserite qui -->
          <div class="notification normal">
            <div class="notification-title">Benvenuto</div>
            <div class="notification-message">Benvenuto nel sistema di notifiche!</div>
            <div class="notification-time">Adesso</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="main-content">
      <div class="dashboard">
        <h2 class="dashboard-title">Dashboard in Tempo Reale</h2>
        <div class="metrics-container">
          <div class="metric">
            <h3 class="metric-title">Utenti Attivi</h3>
            <div class="metric-value" id="active-users">0</div>
          </div>
          
          <div class="metric">
            <h3 class="metric-title">Utilizzo CPU</h3>
            <div class="metric-value" id="cpu-usage">0%</div>
          </div>
          
          <div class="metric">
            <h3 class="metric-title">Utilizzo Memoria</h3>
            <div class="metric-value" id="memory-usage">0%</div>
          </div>
          
          <div class="metric">
            <h3 class="metric-title">Richieste al Secondo</h3>
            <div class="metric-value" id="requests-per-second">0</div>
          </div>
        </div>
        <div class="update-time" id="update-time">Ultimo aggiornamento: mai</div>
      </div>
    </div>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script>
    // Connessione al server Socket.io
    const socket = io();
    
    // Elementi DOM
    const notificationList = document.getElementById('notification-list');
    const channelButtons = document.querySelectorAll('.channel-btn');
    const activeUsersElement = document.getElementById('active-users');
    const cpuUsageElement = document.getElementById('cpu-usage');
    const memoryUsageElement = document.getElementById('memory-usage');
    const requestsPerSecondElement = document.getElementById('requests-per-second');
    const updateTimeElement = document.getElementById('update-time');
    
    // Stato dell'applicazione
    const activeSubscriptions = [];
    const notifications = [];
    const maxNotifications = 50; // Limita il numero di notifiche visualizzate
    
    // Registra l'utente
    socket.emit('register', {
      username: 'Utente_' + Math.floor(Math.random() * 1000),
      preferences: {
        notificationSound: true,
        emailNotifications: false
      }
    });
    
    // Sottoscrivi automaticamente al canale dashboard
    socket.emit('subscribe', 'dashboard');
    
    // Gestisci i pulsanti di sottoscrizione
    channelButtons.forEach(button => {
      button.addEventListener('click', () => {
        const channel = button.dataset.channel;
        
        if (activeSubscriptions.includes(channel)) {
          // Annulla la sottoscrizione
          socket.emit('unsubscribe', channel);
          button.classList.remove('active');
        } else {
          // Sottoscrivi al canale
          socket.emit('subscribe', channel);
          button.classList.add('active');
        }
      });
    });
    
    // Aggiorna i pulsanti in base alle sottoscrizioni attive
    socket.on('subscription_update', (channels) => {
      // Aggiorna lo stato locale
      activeSubscriptions.length = 0;
      activeSubscriptions.push(...channels);
      
      // Aggiorna l'interfaccia
      channelButtons.forEach(button => {
        const channel = button.dataset.channel;
        if (activeSubscriptions.includes(channel)) {
          button.classList.add('active');
        } else {
          button.classList.remove('active');
        }
      });
    });
    
    // Gestisci le notifiche in arrivo
    socket.on('notification', (notification) => {
      // Aggiungi la notifica all'array
      notifications.unshift(notification);
      
      // Limita il numero di notifiche memorizzate
      if (notifications.length > maxNotifications) {
        notifications.pop();
      }
      
      // Aggiorna l'interfaccia
      renderNotifications();
      
      // Riproduci un suono di notifica (opzionale)
      playNotificationSound();
    });
    
    // Gestisci gli aggiornamenti della dashboard
    socket.on('dashboard_update', (data) => {
      // Aggiorna i valori nella dashboard
      activeUsersElement.textContent = data.activeUsers;
      cpuUsageElement.textContent = data.cpuUsage + '%';
      memoryUsageElement.textContent = data.memoryUsage + '%';
      requestsPerSecondElement.textContent = data.requestsPerSecond;
      
      // Aggiorna il timestamp
      const updateTime = new Date(data.timestamp);
      updateTimeElement.textContent = 'Ultimo aggiornamento: ' + updateTime.toLocaleTimeString();
    });
    
    // Funzione per renderizzare le notifiche
    function renderNotifications() {
      notificationList.innerHTML = '';
      
      notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.classList.add('notification', notification.priority);
        
        const titleElement = document.createElement('div');
        titleElement.classList.add('notification-title');
        titleElement.textContent = notification.title;
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('notification-message');
        messageElement.textContent = notification.message;
        
        const timeElement = document.createElement('div');
        timeElement.classList.add('notification-time');
        const notificationTime = new Date(notification.timestamp);
        timeElement.textContent = notificationTime.toLocaleTimeString();
        
        notificationElement.appendChild(titleElement);
        notificationElement.appendChild(messageElement);
        notificationElement.appendChild(timeElement);
        
        notificationList.appendChild(notificationElement);
      });
      
      // Se non ci sono notifiche, mostra un messaggio
      if (notifications.length === 0) {
        const emptyElement = document.createElement('div');
        emptyElement.classList.add('notification');
        emptyElement.textContent = 'Nessuna notifica';
        notificationList.appendChild(emptyElement);
      }
    }
    
    // Funzione per riprodurre un suono di notifica
    function playNotificationSound() {
      // Crea un elemento audio
      const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAkJCQkJCQkJCQkJCQkJCQwMDAwMDAwMDAwMDAwMDAwMD//////////////////8AAAAExTRBNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIADh4eHh4eHh4eHh4eHh4eH19fX19fX19fX19fX19fX1/f39/f39/f39/f39/f39/f///////////wAAADFMQU1FMy45OXIBbgAAAAAAAAAAFEAkBGAiAABAAAABsN4FTrUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAAAANIAAAAAExBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV