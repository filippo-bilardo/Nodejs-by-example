# Teoria Socket.io

Questa cartella contiene le guide teoriche per imparare Socket.io con Node.js.

## 📚 Guide Disponibili

### 1. [Introduzione a Socket.io](01-introduzione-socket.md)
- Cos'è Socket.io
- WebSocket vs HTTP
- Architettura client-server real-time
- Installazione e setup
- Primo esempio "Hello World"
- Confronto con altre tecnologie

### 2. [Eventi e Comunicazione](02-eventi-comunicazione.md)
- Sistema di eventi Socket.io
- Emettere eventi dal server
- Ascoltare eventi sul client
- Eventi bidirezionali
- Acknowledgments (callback)
- Eventi predefiniti
- Eventi personalizzati
- Gestione errori

### 3. [Room e Namespace](03-room-namespace.md)
- Concetto di Room
- Creare e gestire room
- Join/Leave room
- Broadcasting in room
- Namespace
- Namespace multipli
- Comunicazione tra namespace
- Use case pratici

### 4. [Broadcasting e Targeting](04-broadcasting.md)
- Broadcast a tutti i client
- Broadcast a room specifiche
- Broadcast a tutti tranne il mittente
- Targeting specifico per socket ID
- Flag di broadcasting
- Volatile messages
- Compression
- Binary data

### 5. [Middleware e Autenticazione](05-middleware-auth.md)
- Middleware in Socket.io
- Autenticazione JWT
- Handshake authentication
- Middleware per namespace
- Middleware per socket
- Gestione sessioni
- Rate limiting
- Security best practices

---

## 📖 Come Usare Queste Guide

### Ordine Consigliato
1. **Introduzione** - Comprendi i fondamenti
2. **Eventi** - Impara la comunicazione
3. **Room e Namespace** - Organizza le connessioni
4. **Broadcasting** - Messaggi multipli
5. **Middleware** - Sicurezza e autenticazione

### Approccio di Studio
- Leggi la teoria
- Prova gli esempi di codice
- Sperimenta con variazioni
- Completa gli esercizi correlati

---

## 🎯 Obiettivi di Apprendimento

Dopo aver completato queste guide saprai:

✅ Configurare un server Socket.io  
✅ Implementare comunicazione real-time  
✅ Gestire eventi client-server  
✅ Organizzare connessioni con room e namespace  
✅ Implementare broadcasting efficace  
✅ Proteggere le connessioni con autenticazione  
✅ Applicare best practices di sicurezza  

---

## 🔗 Risorse Correlate

- [Esempi Pratici](../esempi/)
- [Esercizi](../esercizi/)
- [Documentazione Ufficiale Socket.io](https://socket.io/docs/)
- [Socket.io GitHub](https://github.com/socketio/socket.io)

---

## 💡 Suggerimenti

- **Testa Sempre**: Apri il browser DevTools per vedere gli eventi
- **Network Tab**: Monitora le connessioni WebSocket
- **Console Logs**: Usa console.log per debug
- **Multiple Tabs**: Testa con più finestre browser
- **Socket.io Admin UI**: Usa l'admin UI per monitorare

---

## 🆘 Troubleshooting

### Connessione non funziona?
- Verifica che il server sia avviato
- Controlla la porta (default 3000)
- Verifica CORS settings
- Controlla firewall

### Eventi non ricevuti?
- Verifica nome evento corretto
- Controlla che listener sia registrato
- Verifica namespace corretta
- Debug con console.log

### Performance issues?
- Usa room per limitare broadcasting
- Implementa throttling
- Considera Redis adapter per scaling
- Monitora numero di connessioni

---

**Prossimo Step**: Inizia con [01-introduzione-socket.md](01-introduzione-socket.md)
