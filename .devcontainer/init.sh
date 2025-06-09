#!/bin/bash
# Script di inizializzazione per DevContainer

echo "🚀 Inizializzazione DevContainer Node.js..."
echo "📋 Sistema: $(uname -a)"
echo "🐳 Docker disponibile: $(which docker &>/dev/null && echo "✅ Sì" || echo "❌ No")"
echo "📦 Git disponibile: $(which git &>/dev/null && echo "✅ Sì" || echo "❌ No")"

# Verifica che i file necessari esistano
if [ ! -f ".devcontainer/devcontainer.json" ]; then
    echo "❌ File devcontainer.json non trovato!"
    exit 1
fi

echo "✅ Inizializzazione completata"
