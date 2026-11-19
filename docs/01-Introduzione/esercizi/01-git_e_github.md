# Git e GitHub: repository Node.js sincronizzato

## Obiettivo

Creare il repository `nodejs` su **web4student**, collegarlo a un repository remoto omonimo su GitHub e utilizzarlo da web4student, PC scuola e PC casa.

Al termine dovrai saper documentare l'intero flusso con `init`, `clone`, `add`, `commit`, `push`, `pull` e `.gitignore`.

> Non inserire mai nel documento Google una passphrase, una chiave privata, il contenuto di `~/.ssh/id_ed25519*` oppure il contenuto completo di `.env`.

## Prerequisiti e convenzioni

Servono un account GitHub con permesso di creare repository, accesso a web4student, PC scuola e PC casa, Git installato o installabile, un editor e un documento Google condivisibile con il docente.

In questa traccia `main` è il branch principale e `nodejs` è il repository. Sostituisci `TUO_USERNAME` con il tuo username GitHub e `tuo.nome@example.com` con la tua email. I comandi `git` sono uguali in Git Bash e PowerShell; i comandi per cartelle, file e permessi cambiano e sono indicati in entrambe le forme.

Una chiave SSH è composta da una chiave privata, che resta sul computer, e una chiave pubblica, che può essere caricata su GitHub. La passphrase protegge la chiave privata. Non inviare la chiave privata per email, chat o repository Git. Sul PC casa puoi generare una nuova coppia, opzione consigliata, oppure riutilizzare quella di web4student solo con un trasferimento sicuro e autorizzato.

## Prima di iniziare sui PC Windows

Gli studenti possono scegliere una delle due shell:

- **Git Bash**, installata insieme a Git for Windows, usa comandi simili a Linux (`ls`, `mkdir -p`, `touch`, `rm`, `chmod`) e consente di seguire direttamente i blocchi marcati `bash`;
- **PowerShell**, inclusa in Windows, esegue gli stessi comandi `git`, ma usa cmdlet diversi per file, cartelle e variabili d'ambiente. Per i passaggi SSH di questa esercitazione sono riportate le equivalenze.

Non mescolare nella stessa riga la sintassi delle due shell. In Git Bash il percorso della home è `~/.ssh`; in PowerShell è `$HOME\.ssh` (visualizzabile con `$HOME`).

Se Git è installato, puoi aprire **Git Bash** dal menu Start oppure con il tasto destro nella cartella del progetto (**Open Git Bash here**). Se lavori in **PowerShell**, esegui i cmdlet indicati nei riquadri `powershell` e i comandi Git negli stessi punti.

### Se Git non è installato: Git for Windows

1. Verifica prima:

   ```powershell
   git --version
   ```

2. Scarica Git for Windows dalla [pagina ufficiale](https://git-scm.com/download/win), oppure usa il canale software approvato dalla scuola. Non scaricare installer da siti non ufficiali.
3. Avvia l'installer.
   - Se possiedi i **permessi amministrativi**, scegli l'installazione per tutti gli utenti, lascia attiva l'integrazione di Git Bash e completa la procedura con le opzioni predefinite.
   - Se **non possiedi permessi amministrativi**, nell'installer scegli l'installazione solo per l'utente corrente e completa la procedura con le opzioni predefinite.
4. Chiudi e riapri Git Bash o PowerShell, poi verifica:

   ```powershell
   git --version
   git config --global --list
   ```

Durante l'installazione scegli un editor che sai usare e lascia il comportamento predefinito per il `PATH` se non hai esigenze diverse. L'installazione di Git non crea automaticamente le chiavi SSH: quelle vengono generate nei passaggi successivi.

### Equivalenze rapide tra Git Bash e PowerShell

| Operazione | Git Bash | PowerShell |
| --- | --- | --- |
| Home SSH | `~/.ssh` | `$HOME\.ssh` |
| Elencare file | `ls -la ~/.ssh` | `Get-ChildItem -Force $HOME\.ssh` |
| Creare cartelle | `mkdir -p node_modules tmp` | `New-Item -ItemType Directory -Force node_modules,tmp` |
| Creare file vuoto | `touch file.tmp` | `New-Item -ItemType File -Force file.tmp` |
| Mostrare un file | `cat ~/.ssh/config` | `Get-Content $HOME\.ssh\config` |
| Rimuovere file/cartelle | `rm -rf tmp` | `Remove-Item tmp -Recurse -Force` |
| Permessi SSH | `chmod 600 ~/.ssh/config` | usa le proprietà di sicurezza del file; Git for Windows/OpenSSH verifica comunque che la chiave privata non sia condivisa |

I comandi `git`, `ssh`, `ssh-keygen`, `git clone`, `git pull`, `git push` e `git check-ignore` restano uguali nelle due shell.

## Parte A — Inizializzare il repository su web4student

### 1. Verificare Git e configurare l'identità

```bash
git --version
git config --global user.name "Nome Cognome"
git config --global user.email "tuo.nome@example.com"
git config --global --get user.name
git config --global --get user.email
```

Annota nel documento Google il comando e l'output. `user.name` e `user.email` identificano l'autore del commit, non sono la password di GitHub.

### 2. Creare il progetto e `.gitignore`

Se `nodejs` non esiste già, in Git Bash:

```bash
mkdir nodejs
cd nodejs
git init -b main
```

Se `git init -b main` non è supportato, usa `git init` seguito da `git branch -M main`.

Crea `.gitignore` nella radice del progetto:

```gitignore
# Dipendenze e file generati
node_modules/
*.log
npm-debug.log*
*.tmp
*.temp
.cache/

# Configurazione locale e segreti
.env
.env.*
!.env.example

# Editor e sistema operativo
.DS_Store
.vscode/
```

Crea anche `README.md` e `index.js` con l'editor. Non inserire password, token o chiavi nel progetto.

Verifica il comportamento del file:

```bash
mkdir -p node_modules file-temporaneo
touch node_modules/prova.txt file-temporaneo/prova.tmp .env
git status --short --ignored
git check-ignore -v node_modules/prova.txt file-temporaneo/prova.tmp .env
```

In PowerShell usa invece:

```powershell
New-Item -ItemType Directory -Force node_modules, file-temporaneo | Out-Null
New-Item -ItemType File -Force node_modules\prova.txt, file-temporaneo\prova.tmp, .env | Out-Null
git status --short --ignored
git check-ignore -v node_modules\prova.txt file-temporaneo\prova.tmp .env
```

I tre percorsi devono risultare ignorati; `README.md` e `index.js` devono essere aggiungibili.

### 3. Creare il repository remoto su GitHub

1. Accedi a GitHub e seleziona **New repository**.
2. Inserisci `nodejs` come nome.
3. Scegli la visibilità indicata dal docente.
4. Lascia disattivate le opzioni **Add a README**, `.gitignore` e licenza: il primo commit esiste già localmente.
5. Crea il repository.

Annota l'URL della pagina GitHub e il nome del proprietario. Non pubblicare token o altri dati riservati.
GitHub suggerirà come proseguire: nella sezione per collegare un repository esistente, seleziona **SSH**.

### 4. Committare e collegare il remoto

```bash
git status
git add README.md index.js .gitignore
git add . # Se nella cartella sono presenti altri file da aggiungere
git commit -m "Inizializza repository Node.js"
git remote add origin git@github.com:TUO_USERNAME/nodejs.git
git remote -v
git push -u origin main
```

Su GitHub devono comparire `README.md`, `index.js`, `.gitignore` e gli eventuali altri file aggiunti, ma non `node_modules/`, `.env` o file temporanei. Se il remote è errato:

```bash
git remote set-url origin git@github.com:TUO_USERNAME/nodejs.git
```

## Parte B — Setup del PC scuola

### 1. Git e chiave SSH

```bash
git --version
ls -la ~/.ssh
```

Se non possiedi una chiave adatta, generane una dedicata:

```bash
ssh-keygen -t ed25519 -C "tuo.nome@example.com" -f ~/.ssh/id_ed25519_github_nodejs
```

Inserisci una passphrase robusta. Poi imposta i permessi:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519_github_nodejs
chmod 644 ~/.ssh/id_ed25519_github_nodejs.pub
```

Su Windows OpenSSH usa normalmente `$HOME\.ssh`. In **Git Bash** puoi seguire i comandi precedenti, sostituendo eventualmente `~` con `/c/Users/NOME_UTENTE`. In **PowerShell** usa invece:

```powershell
$sshDir = Join-Path $HOME ".ssh"
New-Item -ItemType Directory -Force $sshDir | Out-Null
ssh-keygen -t ed25519 -C "tuo.nome@example.com" -f (Join-Path $sshDir "id_ed25519_github_nodejs")
```

La passphrase viene richiesta da `ssh-keygen` in entrambe le shell. Dopo la generazione, limita l'accesso alla chiave privata dalla scheda **Proprietà → Sicurezza** lasciando il controllo all'utente corrente e rimuovendo gli utenti non necessari. In PowerShell puoi verificare la lista ACL con:

```powershell
icacls (Join-Path $sshDir "id_ed25519_github_nodejs")
```

Non rendere la chiave privata leggibile da `Users`, `Everyone` o da altri account del PC.

### 2. Creare `~/.ssh/config`

Il file `~/.ssh/config` permette di specificare quale chiave usare per GitHub. Crea il file con:

```sshconfig
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_github_nodejs
    IdentitiesOnly yes
```

Salva il file e imposta:

```bash
chmod 600 ~/.ssh/config
```

Se usi PowerShell, crea il file con:

```powershell
$sshDir = Join-Path $HOME ".ssh"
@"
Host github.com
    HostName github.com
    User git
    IdentityFile $HOME/.ssh/id_ed25519_github_nodejs
    IdentitiesOnly yes
"@ | Set-Content -NoNewline (Join-Path $sshDir "config")
icacls (Join-Path $sshDir "config")
```

Se hai scelto un altro nome, modifica `IdentityFile`. `IdentitiesOnly yes` evita che SSH provi chiavi non pertinenti. Il percorso con `/` nel file `config` è accettato da OpenSSH anche su Windows.

### 2.1 Memorizzare la chiave nell'SSH agent

La passphrase non va rimossa per evitare di digitarla. Puoi caricare la chiave in un agent per la durata della sessione:

In Git Bash:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_github_nodejs
```

In PowerShell, se il servizio OpenSSH Authentication Agent è disponibile:

```powershell
Get-Service ssh-agent
Start-Service ssh-agent
ssh-add "$HOME\.ssh\id_ed25519_github_nodejs"
```

L'avvio automatico del servizio può richiedere privilegi amministrativi; se la scuola li blocca, avvialo manualmente oppure usa Git Bash per la sessione corrente. L'agent memorizza la chiave in memoria, non la passphrase nel repository. Ripeti la procedura sul PC casa sostituendo il nome della chiave.

### 3. Registrare la chiave e testare l'autenticazione

Mostra e copia **solo** la chiave pubblica:

```bash
cat ~/.ssh/id_ed25519_github_nodejs.pub
```

In PowerShell lo stesso comando è:

```powershell
Get-Content "$HOME\.ssh\id_ed25519_github_nodejs.pub"
```

In GitHub apri **Settings → SSH and GPG keys → New SSH key**, usa un titolo come `PC scuola - nodejs`, incolla la riga che inizia con `ssh-ed25519` e salva.

Verifica:

```bash
ssh -T git@github.com
```

Un risultato positivo contiene una frase simile a:

```text
Hi TUO_USERNAME! You've successfully authenticated, but GitHub does not provide shell access.
```

Questo è il risultato atteso: GitHub autentica la chiave ma non offre una shell interattiva. Con `Permission denied (publickey)` controlla chiave pubblica registrata, `config`, percorso e passphrase. Per una diagnosi locale puoi usare `ssh -vT git@github.com`, senza inserire l'intero output nel documento.

### 4. Configurare Git e clonare

```bash
git config --global user.name "Nome Cognome"
git config --global user.email "tuo.nome@example.com"
git clone git@github.com:TUO_USERNAME/nodejs.git
cd nodejs
git remote -v
git log --oneline --decorate -5
```

In PowerShell usa questi comandi equivalenti per la cartella di lavoro:

```powershell
git clone git@github.com:TUO_USERNAME/nodejs.git
Set-Location nodejs
git remote -v
git log --oneline --decorate -5
```

Il clone deve avere `origin` con URL SSH e contenere il commit creato su web4student.

## Parte C — Setup del PC casa

Verifica e configura Git:

```bash
git --version
git config --global user.name "Nome Cognome"
git config --global user.email "tuo.nome@example.com"
```

### Opzione consigliata: nuova coppia di chiavi

```bash
ssh-keygen -t ed25519 -C "tuo.nome@example.com" -f ~/.ssh/id_ed25519_github_nodejs_casa
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519_github_nodejs_casa
chmod 644 ~/.ssh/id_ed25519_github_nodejs_casa.pub
```

In PowerShell usa:

```powershell
$sshDir = Join-Path $HOME ".ssh"
New-Item -ItemType Directory -Force $sshDir | Out-Null
ssh-keygen -t ed25519 -C "tuo.nome@example.com" -f (Join-Path $sshDir "id_ed25519_github_nodejs_casa")
icacls (Join-Path $sshDir "id_ed25519_github_nodejs_casa")
```

Controlla dalle proprietà di sicurezza che la chiave privata sia accessibile solo dal tuo utente, come per il PC scuola.

Aggiungi la chiave pubblica a GitHub con un titolo come `PC casa - nodejs`, configura `~/.ssh/config` con il nuovo `IdentityFile` e verifica:

```bash
chmod 600 ~/.ssh/config
ssh -T git@github.com
```

In PowerShell aggiorna `IdentityFile` nel file `$HOME\.ssh\config`, poi esegui:

```powershell
ssh -T git@github.com
```

### Opzione alternativa: riutilizzare la chiave di web4student

Usala solo se è consentito e puoi trasferire il file in modo sicuro. Copia la chiave privata direttamente sul PC casa, imposta il permesso `600`, non conservarne copie non cifrate e non lasciarla nella cartella del progetto. La chiave pubblica già registrata su GitHub può restare la stessa.

Clona il repository:

```bash
git clone git@github.com:TUO_USERNAME/nodejs.git
cd nodejs
git remote -v
```

In PowerShell la preparazione della cartella è:

```powershell
git clone git@github.com:TUO_USERNAME/nodejs.git
Set-Location nodejs
git remote -v
```

## Parte D — Test di sincronizzazione

Esegui le modifiche in sequenza, aspettando che ogni `push` termini prima di lavorare sull'altro host. Prima di ogni sessione:

```bash
git status
git pull --rebase origin main
```

### 1. Modifica e push dal PC scuola

Aggiungi a `index.js`:

```javascript
console.log("Modifica eseguita dal PC scuola");
```

Poi:

```bash
git add index.js
git commit -m "Aggiorna esempio dal PC scuola"
git push origin main
```

Controlla il nuovo commit e il file nella pagina GitHub.

### 2. Pull, modifica e push dal PC casa

```bash
git pull --rebase origin main
node index.js
```

Aggiungi a `index.js`:

```javascript
console.log("Modifica eseguita dal PC casa");
```

Pubblica:

```bash
git add index.js
git commit -m "Aggiorna esempio dal PC casa"
git push origin main
```

### 3. Riallineare web4student

```bash
git pull --rebase origin main
git log --oneline --decorate -5
node index.js
git status
```

Ripeti il controllo sugli altri due clone. Tutti devono vedere gli stessi commit e avere il working tree pulito.

### 4. Situazione finale attesa

In ciascun clone esegui:

```bash
git branch --show-current
git remote -v
git log --oneline --decorate -5
git status --short
```

Il branch deve essere `main`, l'URL del remote deve essere `git@github.com:TUO_USERNAME/nodejs.git`, il commit più recente deve coincidere tra web4student, PC scuola, PC casa e GitHub, e `git status --short` non deve mostrare modifiche.

### Se compare un conflitto

Non usare `git push --force`. Esamina il conflitto:

```bash
git status
git diff
```

Rimuovi dai file i marcatori `<<<<<<<`, `=======`, `>>>>>>>`, scegli il contenuto corretto e poi:

```bash
git add <file-risolto>
git rebase --continue
git push origin main
```

Per annullare un rebase ancora in corso: `git rebase --abort`.

## Parte E — Dimostrare `.gitignore`

Nel clone attivo crea file che non devono essere pubblicati:

```bash
mkdir -p node_modules/dipendenza-finta tmp
printf 'segreto locale\n' > .env
printf 'file temporaneo\n' > tmp/prova.tmp
printf 'codice della dipendenza\n' > node_modules/dipendenza-finta/index.js
git status --short --ignored
git check-ignore -v .env tmp/prova.tmp node_modules/dipendenza-finta/index.js
git add --dry-run .
```

In PowerShell crea gli stessi file con:

```powershell
New-Item -ItemType Directory -Force node_modules\dipendenza-finta, tmp | Out-Null
Set-Content .env 'segreto locale'
Set-Content tmp\prova.tmp 'file temporaneo'
Set-Content node_modules\dipendenza-finta\index.js 'codice della dipendenza'
git status --short --ignored
git check-ignore -v .env tmp\prova.tmp node_modules\dipendenza-finta\index.js
git add --dry-run .
```

Verifica che i tre percorsi siano ignorati, che non compaiano tra i file da aggiungere e che `.gitignore` sia versionato e visibile su GitHub. Non usare `git add -f` per file segreti o temporanei. Al termine rimuovi i file:

```bash
rm -rf node_modules tmp
rm -f .env
git status --short
```

In PowerShell:

```powershell
Remove-Item node_modules, tmp -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item .env -Force -ErrorAction SilentlyContinue
git status --short
```

## Documento Google: prove richieste

### Verifiche iniziali

Documenta sistema operativo e host, la shell scelta (Git Bash o PowerShell), `git --version`, eventuale installazione autorizzata con o senza privilegi amministrativi e:

```bash
git config --global --get-regexp '^user\.(name|email)$'
```

### SSH e credenziali

Inserisci la procedura per `ssh-keygen`, i nomi dei file, i permessi di `~/.ssh`, della chiave privata e di `config`, il contenuto significativo di `config` e l'output di `ssh -T git@github.com`. Oscura email o username se richiesto; non mostrare passphrase o chiave privata.

### Repository e sincronizzazione

Mostra `git init -b main` su web4student, la pagina del repository GitHub `nodejs`, `git remote -v`, il primo commit e push, il clone su PC scuola e PC casa, poi in ordine le modifiche e i push dei due ambienti, i pull su web4student e il `git log --oneline --decorate -5` finale sui tre host.

### `.gitignore`

Inserisci il contenuto di `.gitignore`, l'output di `git check-ignore -v` per `.env`, un temporaneo e un file sotto `node_modules/`, la schermata GitHub con `.gitignore` presente e i file ignorati assenti, e `git status --short --ignored` prima della pulizia.

### Conclusione

Rispondi in modo sintetico, con almeno una frase per domanda:

1. Qual è la differenza tra repository locale e remoto?
2. Perché `ssh -T git@github.com` non apre una shell GitHub?
3. Qual è la differenza tra chiave privata e pubblica?
4. Perché si esegue `git pull --rebase` prima di lavorare su un clone?
5. Perché `node_modules/` e `.env` non devono essere versionati?
6. Qual è la differenza tra l'area di lavoro, la staging area e il repository Git?
7. A cosa serve `git remote -v` e quale URL dovrebbe mostrare in questa esercitazione?
8. Perché `git push --force` non deve essere usato per risolvere una normale divergenza tra i repository?
9. Qual è la funzione di `ssh-agent` e perché la passphrase della chiave non deve essere salvata nel repository?
10. Quali passaggi esegui quando Git segnala un conflitto durante `git pull --rebase`?

## Checklist di consegna

- [ ] Repository remoto chiamato `nodejs` creato su GitHub.
- [ ] Repository locale inizializzato su web4student e collegato con `origin` SSH.
- [ ] Git verificato e configurato su tutti gli ambienti richiesti.
- [ ] Chiavi SSH con passphrase generate o riutilizzate in modo sicuro.
- [ ] `~/.ssh/config` presente e con permessi corretti.
- [ ] `ssh -T git@github.com` verificato su PC scuola e PC casa.
- [ ] Repository clonato su PC scuola e PC casa.
- [ ] Push eseguito dal PC scuola e dal PC casa, con pull tra le modifiche.
- [ ] Web4student riallineato e working tree pulito.
- [ ] `.gitignore` versionato e verificato con `git check-ignore`.
- [ ] Documento Google completo di comandi, risultati, didascalie e schermate.
- [ ] Nessuna chiave privata, passphrase, token o segreto inserito nel repository o nel documento.

## Riferimenti

- [Git — documentazione ufficiale](https://git-scm.com/doc)
- [GitHub — connessione tramite SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [GitHub — aggiungere una chiave SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
- [GitHub — clonare un repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository)
- [GitHub — ignorare file](https://docs.github.com/en/get-started/git-basics/ignoring-files)

