#!/bin/bash
set -e

echo "🚀 Configurazione ambiente di sviluppo Node.js con VNC..."

# Verifica e configura utente vscode
echo "👤 Verifica configurazione utente vscode..."
if ! id vscode &>/dev/null; then
    echo "⚠️  Utente vscode non trovato, creazione in corso..."
    sudo useradd -m -s /bin/bash -G sudo vscode
    echo "vscode:vscode" | sudo chpasswd
else
    echo "✅ Utente vscode già esistente"
fi

# Assicurati che vscode sia nel gruppo sudo
sudo usermod -aG sudo vscode 2>/dev/null || true

# Verifica permessi directory home
sudo chown -R vscode:vscode /home/vscode 2>/dev/null || true

echo "👤 Informazioni utente corrente:"
whoami
id

# Aggiorna il sistema
echo "📦 Aggiornamento sistema..."
sudo apt-get update -y

# Installa pacchetti aggiuntivi per sviluppo
echo "🛠️  Installazione strumenti di sviluppo..."
sudo apt-get install -y \
    curl \
    wget \
    git \
    vim \
    nano \
    htop \
    tree \
    unzip \
    zip \
    build-essential \
    python3 \
    python3-pip \
    firefox-esr \
    chromium-browser

# Verifica versione Node.js
echo "📋 Verifica versione Node.js..."
node --version
npm --version

# Installa strumenti globali Node.js utili
echo "🔧 Installazione strumenti Node.js globali..."
npm install -g \
    nodemon \
    pm2 \
    http-server \
    live-server \
    create-react-app \
    @angular/cli \
    @vue/cli \
    vite \
    typescript \
    ts-node \
    eslint \
    prettier \
    jest \
    mocha \
    express-generator

# Configura Git (se non già configurato)
if ! git config --global user.name >/dev/null 2>&1; then
    echo "⚙️  Configurazione Git di base..."
    git config --global user.name "Dev Container User"
    git config --global user.email "dev@container.local"
    git config --global init.defaultBranch main
    git config --global pull.rebase false
fi

# Crea directory di lavoro comuni
echo "📁 Creazione directory di lavoro..."
mkdir -p ~/workspace/{projects,demos,tutorials,experiments}
mkdir -p ~/Desktop

# Configura bashrc per ambiente di sviluppo
echo "🔧 Configurazione shell..."
cat >> ~/.bashrc << 'EOF'

# === CONFIGURAZIONE AMBIENTE NODE.JS DEVELOPMENT ===

# Alias utili per sviluppo
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias npmls='npm list --depth=0'
alias npmg='npm list -g --depth=0'
alias serve='http-server -p 8080'
alias liveserve='live-server --port=5000'

# Funzioni utili
function mkcd() {
    mkdir -p "$1" && cd "$1"
}

function npmdev() {
    npm init -y && npm install --save-dev nodemon
}

function gitquick() {
    git add . && git commit -m "${1:-Quick commit}" && git push
}

function nodeinfo() {
    echo "📋 Informazioni ambiente Node.js:"
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo "Directory corrente: $(pwd)"
    echo "Pacchetti globali principali:"
    npm list -g --depth=0 | grep -E "(nodemon|pm2|typescript|@angular|@vue|create-react)" || echo "  Nessun framework installato"
}

# Prompt personalizzato per sviluppo
export PS1='\[\033[01;32m\]dev-container\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]$ '

# Path per strumenti Node.js
export PATH="$HOME/.npm-global/bin:$PATH"

echo "🚀 Ambiente Node.js pronto! Digita 'nodeinfo' per vedere le informazioni."
EOF

# Configura npm per directory globale personalizzata
echo "📦 Configurazione npm..."
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# Crea script di utilità per VNC
echo "🖥️  Configurazione accesso VNC..."
cat > ~/start-vnc.sh << 'EOF'
#!/bin/bash
echo "🖥️  Avvio servizio VNC..."
echo "📱 Accesso web: http://localhost:6080"
echo "🖱️  Password VNC: vscode"
echo "🔗 Per accesso diretto VNC: localhost:5901"
echo ""
echo "🌐 Browser disponibili nel desktop:"
echo "  - Firefox: firefox"
echo "  - Chromium: chromium-browser"
echo ""
echo "💡 Suggerimenti:"
echo "  - Usa Ctrl+Alt+T per aprire il terminale nel desktop"
echo "  - Per sviluppo web, avvia il server e accedi tramite browser nel VNC"
echo "  - Le porte sono già mappate e accessibili"
EOF
chmod +x ~/start-vnc.sh

# Crea script per setup rapido progetti
cat > ~/create-node-project.sh << 'EOF'
#!/bin/bash

if [ -z "$1" ]; then
    echo "Uso: $0 <nome-progetto> [tipo]"
    echo "Tipi disponibili: express, react, vue, angular, vanilla"
    exit 1
fi

PROJECT_NAME=$1
PROJECT_TYPE=${2:-vanilla}

echo "🚀 Creazione progetto Node.js: $PROJECT_NAME (tipo: $PROJECT_TYPE)"

case $PROJECT_TYPE in
    "express")
        express --view=ejs $PROJECT_NAME
        cd $PROJECT_NAME
        npm install
        echo "✅ Progetto Express creato! Avvia con: npm start"
        ;;
    "react")
        npx create-react-app $PROJECT_NAME
        cd $PROJECT_NAME
        echo "✅ Progetto React creato! Avvia con: npm start"
        ;;
    "vue")
        vue create $PROJECT_NAME --default
        cd $PROJECT_NAME
        echo "✅ Progetto Vue creato! Avvia con: npm run serve"
        ;;
    "angular")
        ng new $PROJECT_NAME --routing --style=css --skip-git
        cd $PROJECT_NAME
        echo "✅ Progetto Angular creato! Avvia con: ng serve"
        ;;
    "vanilla"|*)
        mkdir $PROJECT_NAME
        cd $PROJECT_NAME
        npm init -y
        npm install --save-dev nodemon
        
        # Crea struttura base
        mkdir -p src public
        
        # Index.html base
        cat > public/index.html << 'HTML'
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Progetto Node.js</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Progetto Node.js Attivo!</h1>
        <p>Il server è in esecuzione correttamente.</p>
        <p>Modifica i file in <code>src/</code> per iniziare lo sviluppo.</p>
    </div>
</body>
</html>
HTML

        # Server Express base
        cat > src/app.js << 'JS'
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API funzionante!', 
        timestamp: new Date().toISOString() 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server avviato su http://localhost:${PORT}`);
    console.log(`📡 API test: http://localhost:${PORT}/api/test`);
});
JS

        # Installa Express
        npm install express
        
        # Aggiorna package.json con scripts
        npm pkg set scripts.start="node src/app.js"
        npm pkg set scripts.dev="nodemon src/app.js"
        
        echo "✅ Progetto Vanilla Node.js creato!"
        echo "🚀 Avvia con: npm run dev (development) o npm start (production)"
        ;;
esac

echo "📁 Progetto creato in: $(pwd)"
echo "🌐 Usa il browser nel desktop VNC per testare l'applicazione"
EOF
chmod +x ~/create-node-project.sh

# Crea esempi di codice
echo "📚 Creazione esempi di codice..."
mkdir -p ~/workspace/examples

# Esempio API REST
cat > ~/workspace/examples/simple-api.js << 'EOF'
// Esempio API REST semplice con Express
const express = require('express');
const app = express();

app.use(express.json());

// Dati mock
let users = [
    { id: 1, name: 'Mario Rossi', email: 'mario@example.com' },
    { id: 2, name: 'Giulia Bianchi', email: 'giulia@example.com' }
];

// Routes
app.get('/api/users', (req, res) => {
    res.json(users);
});

app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
});

app.post('/api/users', (req, res) => {
    const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        ...req.body
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log('📋 Endpoints:');
    console.log('  GET    /api/users      - Lista utenti');
    console.log('  GET    /api/users/:id  - Singolo utente');
    console.log('  POST   /api/users      - Crea utente');
});
EOF

# Verifica installazione
echo "✅ Setup completato con successo!"
echo ""
echo "📋 RIEPILOGO CONFIGURAZIONE:"
echo "  🐧 OS: Ubuntu con desktop environment"
echo "  🚀 Node.js: $(node --version)"
echo "  📦 npm: $(npm --version)"
echo "  🖥️  VNC Web: http://localhost:6080 (password: vscode)"
echo "  🔧 Strumenti: nodemon, pm2, express, typescript, ecc."
echo ""
echo "🎯 COMANDI UTILI:"
echo "  nodeinfo                    - Informazioni ambiente"
echo "  ~/create-node-project.sh    - Crea nuovo progetto"
echo "  ~/start-vnc.sh              - Info accesso VNC"
echo ""
echo "🌐 Per iniziare:"
echo "  1. Apri http://localhost:6080 per accedere al desktop"
echo "  2. Crea un progetto: ~/create-node-project.sh mio-progetto express"
echo "  3. Sviluppa nel browser VNC o nell'editor VS Code"
echo ""
echo "🎉 Ambiente pronto per lo sviluppo Node.js!"
