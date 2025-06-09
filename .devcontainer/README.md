# 🚀 Dev Container Node.js con VNC

Questo dev container fornisce un ambiente completo per lo sviluppo Node.js con accesso desktop tramite VNC web-based.

## 🎯 Caratteristiche

### 🐧 Sistema Base
- **OS**: Ubuntu con desktop environment
- **Node.js**: Ultima versione LTS (v20+)
- **Desktop**: Accessibile tramite browser (noVNC)

### 🛠️ Strumenti Inclusi
- **Node.js Tools**: nodemon, pm2, typescript, ts-node
- **Frameworks**: express-generator, create-react-app, @angular/cli, @vue/cli, vite
- **Testing**: jest, mocha
- **Linting**: eslint, prettier
- **Utilities**: http-server, live-server

### 🖥️ Accesso Desktop
- **Web VNC**: http://localhost:6080
- **Password**: `vscode`
- **Risoluzione**: 1920x1080
- **Browser**: Firefox, Chromium disponibili

## 🚀 Come Iniziare

### 1. Avvia il Dev Container
```bash
# In VS Code
Ctrl+Shift+P -> "Dev Containers: Reopen in Container"

# O tramite GitHub Codespaces
# Il container si configurerà automaticamente
```

### 2. Accedi al Desktop
- Apri http://localhost:6080 nel browser
- Inserisci password: `vscode`
- Avrai accesso al desktop Ubuntu completo

### 3. Crea un Progetto
```bash
# Script interattivo per creare progetti
~/create-node-project.sh mio-progetto express

# Tipi disponibili: express, react, vue, angular, vanilla
```

## 📋 Porte Esposte

| Porta | Descrizione |
|-------|-------------|
| 3000  | Applicazioni Node.js (default) |
| 3001  | API server secondario |
| 4200  | Angular dev server |
| 5000  | React dev server |
| 5173  | Vite dev server |
| 6080  | **noVNC Web Interface** |
| 5901  | VNC direct port |
| 8080  | HTTP server generico |
| 9229  | Node.js debug port |

## 🔧 Comandi Utili

### Informazioni Ambiente
```bash
nodeinfo                    # Info complete ambiente
node --version             # Versione Node.js
npm list -g --depth=0      # Pacchetti globali
```

### Gestione Progetti
```bash
~/create-node-project.sh nome [tipo]   # Crea nuovo progetto
npmdev                                 # Init progetto con nodemon
serve                                  # HTTP server su porta 8080
liveserve                             # Live server su porta 5000
```

### Git e Sviluppo
```bash
gitquick "messaggio"       # Add, commit, push rapido
mkcd directory            # Crea directory e ci entra
```

## 🌐 Sviluppo Web

### 1. Nel Terminal VS Code
```bash
# Crea progetto
~/create-node-project.sh webapp express
cd webapp
npm run dev
```

### 2. Nel Desktop VNC
- Apri Firefox/Chromium nel desktop
- Naviga su `localhost:3000`
- Sviluppa con hot reload

### 3. Debug
- Usa VS Code per editing e debug
- Usa browser VNC per testing visuale
- Console e Network tools disponibili

## 📚 Esempi Pronti

### API REST Semplice
```bash
cd ~/workspace/examples
node simple-api.js
# Testa su http://localhost:3000/api/users
```

### Progetto Express Completo
```bash
~/create-node-project.sh myapp express
cd myapp
npm run dev
```

### React App
```bash
~/create-node-project.sh frontend react
cd frontend
npm start
```

## 🐛 Troubleshooting

### VNC non si connette
```bash
# Verifica servizi
~/start-vnc.sh
# Controlla porte
netstat -tulpn | grep 6080
```

### Node.js issues
```bash
# Reinstalla pacchetti globali
npm install -g nodemon pm2 typescript
# Verifica PATH
echo $PATH
```

### Performance lente
```bash
# Chiudi applicazioni non necessarie nel desktop
# Usa solo terminal per sviluppo leggero
# Limita uso del browser VNC a testing
```

## 🎯 Best Practices

### 1. Sviluppo Efficiente
- **Editing**: Usa VS Code (performance migliori)
- **Testing**: Usa browser VNC per UI testing
- **Debug**: Console VS Code + browser DevTools VNC

### 2. Gestione Risorse
- Chiudi tab browser non necessari nel VNC
- Usa `pm2` per processi Node.js in background
- Monitora risorse con `htop`

### 3. Workflow Consigliato
```bash
# 1. Sviluppa in VS Code
code src/app.js

# 2. Avvia development server
npm run dev

# 3. Testa nel browser VNC
# Apri http://localhost:3000 nel desktop Firefox

# 4. Debug se necessario
# Usa F12 nel browser VNC + VS Code debugger
```

## 🔐 Sicurezza

- Container isolato con utente non-root
- VNC protetto da password
- Porte esposte solo in sviluppo
- Docker socket mounted per container development

## 🆘 Supporto

Per problemi o miglioramenti:
1. Controlla i log del container
2. Verifica la configurazione in `.devcontainer/`
3. Consulta la documentazione VS Code Dev Containers

---

🎉 **Buono sviluppo con Node.js!** 🎉
