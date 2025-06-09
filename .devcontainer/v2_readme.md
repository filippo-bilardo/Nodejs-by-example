# Codespace Node.js con Desktop Environment

Questo Codespace fornisce un ambiente di sviluppo completo con Node.js 20 e accesso desktop tramite noVNC per sviluppare e testare applicazioni web con interfaccia grafica.

## 🚀 Avvio rapido

1. **Apri il Codespace**
   - Clicca su "Code" → "Codespaces" → "Create codespace"
   - Attendi il completamento del setup (2-3 minuti)

2. **Accedi al Desktop**
   - La porta 6080 si aprirà automaticamente con l'interfaccia noVNC
   - Password: `vscode`
   - Risoluzione: 1280x720

## 🛠️ Strumenti preinstallati

### Node.js
- **Node.js 20 LTS** con npm
- **nodemon** - Auto-restart per sviluppo
- **pm2** - Process manager per produzione
- **http-server** - Server HTTP statico
- **live-server** - Server con hot reload

### Desktop Environment
- **Firefox ESR** - Browser per testing
- **File Manager** - Gestione file grafica
- **Terminal** - Accesso shell dal desktop

### VS Code Extensions
- TypeScript support
- Prettier (formattazione automatica)
- JSON support
- Code Runner
- Live Server

## 📡 Porte disponibili

| Porta | Descrizione | Utilizzo |
|-------|-------------|----------|
| 3000  | Node.js App | Porta standard per applicazioni Express |
| 6080  | noVNC Desktop | Interfaccia web per desktop remoto |
| 5901  | VNC Server | Connessione VNC diretta |
| 8080  | Web Server | Server HTTP alternativo |
| 5000  | Dev Server | Porta di sviluppo alternativa |

## 💻 Esempi pratici

### Test rapido Node.js
```bash
# Crea e testa un'app Express
echo "const express = require('express')
const app = express()
app.get('/', (req, res) => res.send('Hello Codespace!'))
app.listen(3000, () => console.log('Server su porta 3000'))" > app.js

npm install express
node app.js
```

### Server statico
```bash
# Crea contenuto HTML
mkdir public
echo "<h1>Il mio sito</h1><p>Sviluppato nel Codespace!</p>" > public/index.html

# Avvia server
http-server public -p 8080
```

### Development con auto-reload
```bash
# Usa nodemon per auto-restart
nodemon app.js

# Oppure live-server per frontend
live-server public --port=5000
```

## 🖥️ Utilizzo del Desktop

### Accesso
1. Clicca sulla porta 6080 nel pannello "Ports"
2. Inserisci password: `vscode`
3. Usa il desktop come ambiente grafico normale

### Testing con Firefox
1. Apri Firefox dal desktop
2. Naviga su `localhost:3000` (o altra porta)
3. Testa le tue applicazioni web

### Gestione file
- Usa il file manager per operazioni grafiche
- I file sono sincronizzati con VS Code
- Cartella di lavoro: `/workspace`

## 🔧 Configurazione avanzata

### Modifica risoluzione
Nel file `.devcontainer/devcontainer.json`:
```json
"containerEnv": {
  "VNC_RESOLUTION": "1920x1080x16"
}
```

### Aggiungi software
Nel `postCreateCommand`:
```json
"postCreateCommand": "npm install -g nodemon pm2 && sudo apt-get install -y gedit code"
```

### Nuove porte
```json
"forwardPorts": [3000, 8080, 5000, 6080, 5901, 4000]
```

## 🐛 Risoluzione problemi

### Desktop non si carica
- Ricostruisci il container: `Ctrl+Shift+P` → "Codespaces: Rebuild Container"
- Verifica che la porta 6080 sia forwarded

### Node.js non funziona
```bash
# Verifica installazione
node --version
npm --version

# Reinstalla dipendenze globali
npm install -g nodemon pm2 http-server live-server
```

### Firefox non si avvia
```bash
# Dal terminale VS Code
sudo apt-get update
sudo apt-get install -y firefox-esr
```

## 📚 Workflow consigliato

1. **Sviluppo**: Usa VS Code per editing e terminal
2. **Testing**: Usa Firefox nel desktop per testare UI
3. **Debug**: Console browser + VS Code debugger
4. **Deploy**: Usa pm2 per processo di produzione

## 🤝 Best practices

- Salva regolarmente il lavoro (auto-sync con GitHub)
- Usa `nodemon` in sviluppo, `pm2` per produzione
- Testa sempre nel browser prima del deploy
- Mantieni il codespace aggiornato con `apt-get update`

## 📖 Risorse utili

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [GitHub Codespaces Docs](https://docs.github.com/codespaces)
- [noVNC Project](https://novnc.com/)

---

**Buon coding! 🎉**