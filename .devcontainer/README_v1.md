Configurazione base di Node.js che include:

**Ambiente:**
- Node.js 20 LTS
- Utente `node` (non root per sicurezza)

**Estensioni VS Code essenziali:**
- TypeScript support
- Prettier per formattazione
- JSON support
- Code runner per eseguire script
- Live server per development

**Strumenti Node.js:**
- nodemon (auto-restart in development)
- pm2 (process manager)
- http-server (server statico semplice)
- live-server (server con hot reload)

**Porte:**
- 3000: porta standard Node.js
- 8080, 5000: porte alternative

**Per testare:**
1. Crea una cartella `.devcontainer` nel tuo repo
2. Salva questo file come `.devcontainer/devcontainer.json`
3. Fai commit e push
4. Apri il repository in GitHub Codespaces

**Test veloce una volta avviato:**
```bash
echo "console.log('Hello Node.js!');" > test.js
node test.js
```