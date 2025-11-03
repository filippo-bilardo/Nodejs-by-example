# Teoria - Socket TCP/UDP in Node.js

Questa cartella contiene le guide teoriche sulla programmazione di rete con i moduli `net` (TCP) e `dgram` (UDP) di Node.js.

## 📚 Indice Guide

### 1. [Introduzione ai Socket e Protocolli di Rete](01-introduzione-socket-protocolli.md)
Introduzione ai concetti fondamentali di networking:
- Cos'è un socket
- Modello Client-Server
- TCP vs UDP: differenze e quando usarli
- Porte e indirizzi IP
- Stream e datagram

**Prerequisiti:** Nessuno  
**Tempo lettura:** 30 minuti

---

### 2. [Modulo net - Socket TCP](02-modulo-net-tcp.md)
Guida completa al modulo `net` per socket TCP:
- Creare server TCP
- Creare client TCP
- Eventi socket (connect, data, end, error)
- Gestione connessioni multiple
- Buffer e encoding
- Backpressure

**Prerequisiti:** 01-introduzione  
**Tempo lettura:** 45 minuti

---

### 3. [Modulo dgram - Socket UDP](03-modulo-dgram-udp.md)
Guida completa al modulo `dgram` per socket UDP:
- Creare server UDP
- Creare client UDP
- Eventi datagram (message, listening, error)
- Broadcast e multicast
- Differenze con TCP
- Use cases UDP

**Prerequisiti:** 01-introduzione, 02-modulo-net  
**Tempo lettura:** 40 minuti

---

### 4. [Pattern e Best Practices](04-pattern-best-practices.md)
Pattern comuni nella programmazione socket:
- Request-Response
- Publish-Subscribe
- Protocol design
- Message framing
- Heartbeat/keepalive
- Gestione errori e riconnessioni
- Performance optimization
- Security considerations

**Prerequisiti:** 02-modulo-net, 03-modulo-dgram  
**Tempo lettura:** 50 minuti

---

### 5. [Protocolli Applicativi](05-protocolli-applicativi.md)
Implementazione di protocolli custom:
- Design protocollo custom
- Serializzazione dati (JSON, msgpack)
- Implementare chat protocol
- Implementare file transfer
- Compatibilità e versioning
- Testing protocolli

**Prerequisiti:** Tutte le guide precedenti  
**Tempo lettura:** 60 minuti

### 6. [Introduzione a Socket.io](06-socket.io_introduzione.md)
- Cos'è Socket.io
- WebSocket vs HTTP
- Architettura client-server real-time
- Installazione e setup
- Primo esempio "Hello World"
- Confronto con altre tecnologie

### 7. [Eventi e Comunicazione](07-socket.io_eventi-comunicazione.md)
- Sistema di eventi Socket.io
- Emettere eventi dal server
- Ascoltare eventi sul client
- Eventi bidirezionali
- Acknowledgments (callback)
- Eventi predefiniti
- Eventi personalizzati
- Gestione errori

### 8. [Room e Namespace](08-socket.io_room-namespace.md)
- Concetto di Room
- Creare e gestire room
- Join/Leave room
- Broadcasting in room
- Namespace
- Namespace multipli
- Comunicazione tra namespace
- Use case pratici

### 9. [Broadcasting e Targeting]()
- Broadcast a tutti i client
- Broadcast a room specifiche
- Broadcast a tutti tranne il mittente
- Targeting specifico per socket ID
- Flag di broadcasting
- Volatile messages
- Compression
- Binary data

### 10. [Middleware e Autenticazione]()
- Middleware in Socket.io
- Autenticazione JWT
- Handshake authentication
- Middleware per namespace
- Middleware per socket
- Gestione sessioni
- Rate limiting
- Security best practices

---

## 🎯 Percorso di Apprendimento Consigliato

### Per Principianti
1. Inizia con **01-introduzione-socket-protocolli.md** per capire i concetti base
2. Passa a **02-modulo-net-tcp.md** per TCP
3. Poi **03-modulo-dgram-udp.md** per UDP
4. Studia **04-pattern-best-practices.md** per scrivere codice migliore

### Per Utenti Intermedi
Se conosci già TCP/UDP da altri linguaggi:
1. **02-modulo-net-tcp.md** - Sintassi Node.js per TCP
2. **03-modulo-dgram-udp.md** - Sintassi Node.js per UDP
3. **04-pattern-best-practices.md** - Pattern Node.js
4. **05-protocolli-applicativi.md** - Applicazioni pratiche

### Per Utenti Avanzati
Concentrati su:
- **04-pattern-best-practices.md** - Architetture avanzate
- **05-protocolli-applicativi.md** - Protocol design
- [Esempi avanzati](../esempi/)

---

## 🧪 Come Usare Questa Teoria

### 1. Lettura Attiva
Non limitarti a leggere - prova ogni esempio di codice:
```bash
# Copia l'esempio in un file
cat > test.js << 'EOF'
// ... codice esempio ...
EOF

# Eseguilo
node test.js
```

### 2. Sperimentazione
Modifica gli esempi:
- Cambia porte
- Aggiungi logging
- Prova errori
- Testa edge cases

### 3. Riferimento
Usa questa teoria come riferimento mentre completi:
- [Esempi](../esempi/)
- [Esercizi](../esercizi/)

---

## 📋 Prerequisiti Generali

### Conoscenze
- JavaScript base
- Node.js base
- Concetti async/await
- Event emitters

### Software
- Node.js v14+ installato
- Editor di codice
- Terminal/Command line

### Tool per Testing
```bash
# Installa netcat (Linux/Mac)
sudo apt install netcat  # Ubuntu/Debian
brew install netcat      # macOS

# Oppure usa telnet
sudo apt install telnet

# Windows: usa PuTTY o installare WSL
```

---

## 🔧 Setup Ambiente

### Cartella di Lavoro
```bash
# Crea cartella per test
mkdir ~/socket-tests
cd ~/socket-tests

# Inizializza npm
npm init -y
```

### Dipendenze Utili
```bash
# Per debugging
npm install debug

# Per testing
npm install -D jest

# Per serializzazione
npm install msgpack5
```

---

## 📊 Confronto TCP vs UDP

| Caratteristica | TCP | UDP |
|----------------|-----|-----|
| **Connessione** | Orientato alla connessione | Connectionless |
| **Affidabilità** | Garantita | Non garantita |
| **Ordine** | Preservato | Non garantito |
| **Velocità** | Più lento | Più veloce |
| **Overhead** | Alto | Basso |
| **Use Cases** | HTTP, FTP, Email | DNS, Streaming, Gaming |
| **Node.js Module** | `net` | `dgram` |

---

## 💡 Tips Generali

### Debug
```javascript
// Abilita debug logging
process.env.DEBUG = 'net,dgram';

// Oppure usa il modulo debug
const debug = require('debug')('myapp');
debug('Server started on port %d', port);
```

### Gestione Errori
```javascript
// SEMPRE gestire errori
server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});

socket.on('error', (err) => {
    console.error('Socket error:', err);
    socket.destroy();
});
```

### Testing
```bash
# Test server TCP con netcat
nc localhost 3000

# Test server UDP con netcat
nc -u localhost 3000

# Test con telnet (solo TCP)
telnet localhost 3000
```

---

## 🆘 Troubleshooting Comune

### "Address already in use"
```javascript
// Soluzione 1: Usa porta diversa
const PORT = process.env.PORT || 3000;

// Soluzione 2: Abilita SO_REUSEADDR
server.listen({
    port: PORT,
    host: '0.0.0.0',
    exclusive: false
});
```

### "Connection refused"
✅ Verifica server avviato  
✅ Verifica porta corretta  
✅ Check firewall  
✅ Verifica indirizzo IP (localhost vs 0.0.0.0)

### "ECONNRESET"
✅ Client disconnesso bruscamente  
✅ Gestisci con error handler  
✅ Implementa reconnection logic

### Buffer Issues
✅ Usa `setEncoding('utf8')` per testo  
✅ Gestisci messaggi parziali  
✅ Implementa message framing

---

## 📚 Risorse Esterne

### Documentazione Ufficiale
- [Node.js net module](https://nodejs.org/api/net.html)
- [Node.js dgram module](https://nodejs.org/api/dgram.html)
- [Node.js Stream API](https://nodejs.org/api/stream.html)

### RFC (Protocolli Standard)
- [RFC 793 - TCP](https://datatracker.ietf.org/doc/html/rfc793)
- [RFC 768 - UDP](https://datatracker.ietf.org/doc/html/rfc768)
- [RFC 1122 - Internet Host Requirements](https://datatracker.ietf.org/doc/html/rfc1122)

### Tutorial e Guide
- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/)
- [The TCP/IP Guide](http://www.tcpipguide.com/)

---

## ✅ Checklist Completamento

Prima di passare agli esempi, assicurati di aver compreso:

### Concetti Base
- [ ] Differenza tra TCP e UDP
- [ ] Modello client-server
- [ ] Cos'è un socket
- [ ] Indirizzi IP e porte

### TCP (modulo net)
- [ ] Creare server TCP
- [ ] Creare client TCP
- [ ] Gestire eventi socket
- [ ] Gestire connessioni multiple

### UDP (modulo dgram)
- [ ] Creare server UDP
- [ ] Creare client UDP
- [ ] Inviare/ricevere datagram
- [ ] Differenze con TCP

### Best Practices
- [ ] Gestione errori
- [ ] Message framing
- [ ] Performance optimization
- [ ] Security basics

---

## 🎓 Prossimi Passi

Dopo aver completato la teoria:

1. **Pratica** con [esempi](../esempi/)
   - Inizia da esempi semplici
   - Esegui e modifica codice
   - Sperimenta variazioni

2. **Esercizi** in [esercizi](../esercizi/)
   - Completa esercizi guidati
   - Confronta con soluzioni
   - Implementa varianti

3. **Progetti** personali
   - Chat application
   - File transfer
   - Game server
   - IoT communication

---

**Buono studio! 🚀**

Inizia con [01-introduzione-socket-protocolli.md](01-introduzione-socket-protocolli.md)
