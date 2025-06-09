#!/bin/bash
set -e

echo "🔧 Post-create command per DevContainer Node.js"

# Esegui il setup principale
bash .devcontainer/setup.sh

# Verifica finale dell'utente
echo "👤 Verifica finale configurazione utente:"
echo "Current user: $(whoami)"
echo "User ID info: $(id)"
echo "Home directory: $HOME"
echo "Home directory permissions:"
ls -la $HOME

# Verifica che il desktop VNC sia accessibile
if [ -d "/usr/share/applications" ]; then
    echo "🖥️  Desktop environment rilevato"
else
    echo "⚠️  Desktop environment non ancora configurato (normale durante il setup)"
fi

# Configura permessi per VNC se necessario
mkdir -p $HOME/.vnc
touch $HOME/.vnc/passwd 2>/dev/null || true

echo "✅ Post-create command completato"
