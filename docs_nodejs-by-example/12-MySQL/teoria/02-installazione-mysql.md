# Installazione e Configurazione di MySQL

## Introduzione

Prima di poter utilizzare MySQL con Node.js, è necessario installare e configurare correttamente il server MySQL sul proprio sistema. Questo capitolo guida attraverso il processo di installazione su diversi sistemi operativi, la configurazione iniziale e la preparazione dell'ambiente per lo sviluppo.

MySQL è disponibile in diverse edizioni, tra cui:

- **MySQL Community Edition**: Versione gratuita e open source, ideale per la maggior parte dei progetti di sviluppo
- **MySQL Enterprise Edition**: Versione commerciale con funzionalità aggiuntive per ambienti aziendali
- **MySQL Cluster**: Soluzione ad alta disponibilità per applicazioni critiche

In questa guida ci concentreremo sull'installazione della Community Edition, che offre tutte le funzionalità necessarie per lo sviluppo di applicazioni Node.js.

## Installazione di MySQL

### Windows

1. **Download dell'installer**:
   - Visita il [sito ufficiale di MySQL](https://dev.mysql.com/downloads/mysql/)
   - Scarica l'installer MSI per Windows

2. **Esecuzione dell'installer**:
   - Avvia il file MSI scaricato
   - Seleziona "Full" come tipo di installazione per includere tutti i componenti
   - Segui le istruzioni a schermo

3. **Configurazione durante l'installazione**:
   - Imposta una password sicura per l'utente root
   - Scegli se configurare MySQL come servizio Windows (consigliato)
   - Seleziona l'opzione per aggiungere MySQL alla variabile PATH (consigliato)

4. **Verifica dell'installazione**:
   - Apri il prompt dei comandi
   - Esegui `mysql --version` per verificare che MySQL sia installato correttamente
   - Esegui `mysql -u root -p` e inserisci la password per accedere alla console MySQL

### macOS

1. **Utilizzo di Homebrew (consigliato)**:
   ```bash
   # Installazione di Homebrew (se non già installato)
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Installazione di MySQL
   brew install mysql
   
   # Avvio del servizio MySQL
   brew services start mysql
   ```

2. **Configurazione iniziale**:
   ```bash
   # Impostazione della password per l'utente root
   mysql_secure_installation
   ```

3. **Verifica dell'installazione**:
   ```bash
   # Verifica della versione
   mysql --version
   
   # Accesso alla console MySQL
   mysql -u root -p
   ```

### Linux (Ubuntu/Debian)

1. **Installazione tramite apt**:
   ```bash
   # Aggiornamento dei repository
   sudo apt update
   
   # Installazione di MySQL Server
   sudo apt install mysql-server
   ```

2. **Configurazione sicura**:
   ```bash
   # Esecuzione dello script di sicurezza
   sudo mysql_secure_installation
   ```

3. **Verifica dell'installazione**:
   ```bash
   # Verifica dello stato del servizio
   sudo systemctl status mysql
   
   # Accesso alla console MySQL
   sudo mysql
   ```

## Configurazione Post-Installazione

### Creazione di un Database e un Utente per lo Sviluppo

È una buona pratica creare un database e un utente specifici per ogni applicazione, invece di utilizzare l'utente root per le operazioni quotidiane:

```sql
-- Accesso come root
mysql -u root -p

-- Creazione di un nuovo database
CREATE DATABASE nome_database;

-- Creazione di un nuovo utente
CREATE USER 'nome_utente'@'localhost' IDENTIFIED BY 'password';

-- Assegnazione dei privilegi all'utente sul database
GRANT ALL PRIVILEGES ON nome_database.* TO 'nome_utente'@'localhost';

-- Applicazione delle modifiche
FLUSH PRIVILEGES;

-- Uscita dalla console
EXIT;
```

### Configurazione del Server MySQL

Le impostazioni di configurazione di MySQL si trovano nel file `my.cnf` (Linux/macOS) o `my.ini` (Windows). Ecco alcune configurazioni comuni che potresti voler modificare:

```ini
# Posizione tipica del file di configurazione:
# - Windows: C:\ProgramData\MySQL\MySQL Server 8.0\my.ini
# - macOS: /usr/local/etc/my.cnf
# - Linux: /etc/mysql/my.cnf

[mysqld]
# Porta di ascolto (default: 3306)
port=3306

# Directory dei dati
datadir=/path/to/data/directory

# Set di caratteri e collation
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

# Dimensione massima del pacchetto
max_allowed_packet=16M

# Numero massimo di connessioni
max_connections=151

# Cache delle query
query_cache_size=64M

# Buffer InnoDB
innodb_buffer_pool_size=1G
```

Dopo aver modificato il file di configurazione, riavvia il servizio MySQL per applicare le modifiche:

- **Windows**: `Pannello di controllo > Strumenti di amministrazione > Servizi > MySQL > Riavvia`
- **macOS**: `brew services restart mysql`
- **Linux**: `sudo systemctl restart mysql`

## Installazione di Strumenti Aggiuntivi

### MySQL Workbench

MySQL Workbench è un'interfaccia grafica che semplifica la gestione dei database MySQL:

- **Windows/macOS**: Scarica l'installer dal [sito ufficiale](https://dev.mysql.com/downloads/workbench/)
- **Linux (Ubuntu/Debian)**: `sudo apt install mysql-workbench`

### Adminer

Adminer è un'alternativa leggera a phpMyAdmin, accessibile via browser:

1. Scarica Adminer da [https://www.adminer.org/](https://www.adminer.org/)
2. Posiziona il file PHP in una directory servita dal tuo web server
3. Accedi tramite browser (es. `http://localhost/adminer.php`)

## Installazione del Driver MySQL per Node.js

Per utilizzare MySQL con Node.js, è necessario installare un driver appropriato. Consigliamo `mysql2` per le sue prestazioni superiori e il supporto nativo per Promises:

```bash
# Creazione di un nuovo progetto Node.js
mkdir mio-progetto-mysql
cd mio-progetto-mysql
npm init -y

# Installazione del driver mysql2
npm install mysql2
```

Per progetti più complessi, potresti considerare l'utilizzo di un ORM (Object-Relational Mapping) come Sequelize:

```bash
# Installazione di Sequelize e mysql2
npm install sequelize mysql2
```

## Test della Connessione

Dopo aver installato MySQL e il driver per Node.js, è buona pratica verificare che la connessione funzioni correttamente:

```javascript
// test-connection.js
const mysql = require('mysql2/promise');

async function testConnection() {
  let connection;
  
  try {
    // Creazione della connessione
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'nome_utente',  // Sostituisci con il tuo utente
      password: 'password', // Sostituisci con la tua password
      database: 'nome_database' // Sostituisci con il tuo database
    });
    
    console.log('Connessione a MySQL stabilita con successo!');
    
    // Esecuzione di una query di test
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('Risultato della query:', rows[0].result);
    
  } catch (error) {
    console.error('Errore durante la connessione a MySQL:', error);
  } finally {
    // Chiusura della connessione
    if (connection) await connection.end();
  }
}

testConnection();
```

Esegui lo script con Node.js:

```bash
node test-connection.js
```

Se tutto è configurato correttamente, dovresti vedere il messaggio "Connessione a MySQL stabilita con successo!" seguito dal risultato della query.

## Risoluzione dei Problemi Comuni

### Errore di Accesso

**Problema**: `ER_ACCESS_DENIED_ERROR: Access denied for user 'xxx'@'localhost'`

**Soluzioni**:
- Verifica che nome utente e password siano corretti
- Controlla che l'utente abbia i privilegi necessari sul database
- Assicurati che l'host specificato sia corretto (localhost, 127.0.0.1, ecc.)

### Errore di Connessione

**Problema**: `ECONNREFUSED: Connection refused`

**Soluzioni**:
- Verifica che il server MySQL sia in esecuzione
- Controlla che la porta specificata sia corretta (default: 3306)
- Assicurati che non ci siano firewall che bloccano la connessione

### Errore di Autenticazione

**Problema**: `ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol`

**Soluzione**:
```sql
ALTER USER 'nome_utente'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;
```

## Conclusione

In questo capitolo abbiamo visto come installare e configurare MySQL su diversi sistemi operativi, creare un database e un utente per lo sviluppo, e verificare la connessione da Node.js. Con queste basi, sei pronto per iniziare a sviluppare applicazioni Node.js che utilizzano MySQL come database.

Nei prossimi capitoli, esploreremo le operazioni SQL fondamentali e come implementarle in Node.js, approfondendo i pattern di gestione delle connessioni e le best practice per lo sviluppo di applicazioni robuste e scalabili.

---

## Navigazione del Corso

- [Indice del Corso Node.js](../../README.md)
- **Modulo Corrente: MySQL**
  - [01 - Introduzione ai Database Relazionali](./01-introduzione-db-relazionali.md)
  - **02 - Installazione e Configurazione di MySQL** (Documento Corrente)
  - [03 - Operazioni SQL Fondamentali](./03-operazioni-sql.md)
  - [04 - Connessione a MySQL da Node.js](./04-connessione-nodejs-mysql.md)
  - [05 - Pattern di Gestione delle Connessioni](./05-pattern-connessioni.md)