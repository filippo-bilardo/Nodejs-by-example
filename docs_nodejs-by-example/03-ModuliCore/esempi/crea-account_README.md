# Script Creazione Account Studenti

## 📋 Descrizione

Script Node.js che legge un file CSV di studenti e crea automaticamente account utente Linux con home directory organizzate per classe.

## 🎯 Funzionalità

- ✅ Legge file CSV con modulo `readline`
- ✅ Processa ogni record linea per linea
- ✅ Crea account Linux con `useradd`
- ✅ Home directory organizzate per classe: `/home/<classe>/<username>`
- ✅ Password temporanea con cambio obbligatorio al primo login
- ✅ Validazione dati e gestione errori
- ✅ Statistiche finali dell'operazione

## 📁 Struttura Directory

```
/home/
├── 3A/
│   ├── rossi.marco/
│   └── bianchi.giulia/
├── 3B/
│   ├── verdi.luca/
│   └── neri.anna/
└── 4A/
    └── bruno.paolo/
```

## 📄 Formato CSV

Il file `studenti.cvs` deve avere questo formato:

```csv
classe,cognome,nome,username
3A,Rossi,Marco,rossi.marco
3A,Bianchi,Giulia,bianchi.giulia
3B,Verdi,Luca,verdi.luca
```

**Campi:**
- `classe`: Nome della classe (diventa subdirectory)
- `cognome`: Cognome studente
- `nome`: Nome studente
- `username`: Username Linux (univoco)

## 🚀 Utilizzo

### Prerequisiti

- Linux (Ubuntu, Debian, CentOS, ecc.)
- Node.js installato
- Permessi root

### Esecuzione

```bash
# Rendi eseguibile (opzionale)
chmod +x crea-account-studenti.js

# Esegui come root
sudo node crea-account-studenti.js
```

### Output Esempio

```
╔════════════════════════════════════════════════════╗
║   CREAZIONE ACCOUNT STUDENTI DA FILE CSV           ║
╚════════════════════════════════════════════════════╝

📄 Lettura file: studenti.cvs
🏠 Directory base: /home/studenti

📋 Header CSV: classe,cognome,nome,username

🔄 Creazione account per: Marco Rossi
   Username: rossi.marco
   Classe: 3A
   Home: /home/studenti/3A/rossi.marco
📁 Directory classe creata: /home/studenti/3A
✅ Account rossi.marco creato con successo

🔄 Creazione account per: Giulia Bianchi
   Username: bianchi.giulia
   Classe: 3A
   Home: /home/studenti/3A/bianchi.giulia
✅ Account bianchi.giulia creato con successo

╔════════════════════════════════════════════════════╗
║              RIEPILOGO OPERAZIONI                  ║
╚════════════════════════════════════════════════════╝

📊 Statistiche:
   Studenti processati: 2
   Account creati: 2
   Errori: 0

✅ 2 account creati con successo

🔐 Password temporanea: Studente123!
   Gli utenti dovranno cambiarla al primo login

📁 Directory classi in /home/studenti:
   3A/ (2 studenti)

✨ Operazione completata!
```

## ⚙️ Configurazione

Puoi modificare queste costanti nello script:

```javascript
const BASE_HOME_DIR = '/home/studenti';  // Directory base
const DEFAULT_SHELL = '/bin/bash';       // Shell default
const DEFAULT_PASSWORD = 'Studente123!'; // Password temporanea
```

## 🔐 Sicurezza

- Password temporanea impostata automaticamente
- Cambio password **obbligatorio** al primo login (`chage -d 0`)
- Permessi home directory: `750` (rwxr-x---)
- Owner corretto impostato automaticamente

## 🛠️ Caratteristiche Tecniche

### Moduli Node.js Utilizzati

```javascript
const readline = require('readline');      // Lettura file CSV
const fs = require('fs');                  // File system
const { execSync } = require('child_process'); // Comandi Linux
const path = require('path');              // Gestione percorsi
```

### Comandi Linux Eseguiti

```bash
# Crea utente
useradd -m -d "/home/studenti/3A/rossi.marco" -s /bin/bash -c "Marco Rossi" rossi.marco

# Imposta password
echo "rossi.marco:Studente123!" | chpasswd

# Forza cambio password al primo login
chage -d 0 rossi.marco

# Imposta permessi
chmod 750 /home/studenti/3A/rossi.marco
chown rossi.marco:rossi.marco /home/studenti/3A/rossi.marco
```

## ✅ Validazioni

Lo script esegue le seguenti validazioni:

- ✅ Verifica permessi root
- ✅ Verifica esistenza file CSV
- ✅ Salta righe vuote
- ✅ Salta header CSV
- ✅ Valida tutti i campi richiesti
- ✅ Controlla se utente esiste già
- ✅ Gestisce errori di creazione

## 🔧 Gestione Errori

- Utenti esistenti vengono **saltati** (non sovrascritti)
- Errori non bloccano l'elaborazione degli altri studenti
- Riepilogo finale con lista errori
- Log dettagliato di ogni operazione

## 📊 Statistiche Finali

Al termine, lo script mostra:

- Numero studenti processati
- Numero account creati
- Numero errori
- Lista directory classi create
- Numero studenti per classe

## 🧪 Test

Per testare senza creare utenti reali:

```javascript
// Commenta le righe execSync() e aggiungi console.log
console.log(`[TEST] Eseguirei: ${command}`);
// execSync(command, { stdio: 'pipe' });
```

## 📝 Esempio File CSV Completo

```csv
classe,cognome,nome,username
3A,Rossi,Marco,rossi.marco
3A,Bianchi,Giulia,bianchi.giulia
3A,Verdi,Luca,verdi.luca
3B,Neri,Anna,neri.anna
3B,Bruno,Paolo,bruno.paolo
4A,Ferrari,Sofia,ferrari.sofia
4A,Colombo,Matteo,colombo.matteo
5A,Romano,Elena,romano.elena
```

## 🚨 Troubleshooting

### Errore: "Questo script deve essere eseguito come root"

**Soluzione:** Esegui con `sudo`:
```bash
sudo node crea-account-studenti.js
```

### Errore: "File studenti.cvs non trovato"

**Soluzione:** Assicurati che il file sia nella stessa directory dello script.

### Errore: "useradd: command not found"

**Soluzione:** Installa `shadow-utils` (CentOS/RHEL) o `passwd` (Debian/Ubuntu).

### Utente già esistente

**Comportamento:** Lo script salta l'utente e continua con il successivo.

## 🔄 Pulizia Account

Per rimuovere gli account creati:

```bash
# Rimuovi singolo utente
sudo userdel -r rossi.marco

# Rimuovi tutti gli utenti di una classe
for user in /home/studenti/3A/*; do
  sudo userdel -r $(basename $user)
done

# Rimuovi directory base
sudo rm -rf /home/studenti
```

## 📚 Riferimenti

- [Node.js readline](https://nodejs.org/api/readline.html)
- [Linux useradd](https://linux.die.net/man/8/useradd)
- [Node.js child_process](https://nodejs.org/api/child_process.html)

## 📄 Licenza

Script educativo per corso TPSIT3 - Libero utilizzo.

## 👨‍💻 Autore

Corso TPSIT3 - Learning Node.js by Example
