# Esercitazioni sui Moduli Core di Node.js

Questa cartella contiene una raccolta di esercitazioni pratiche sui moduli core di Node.js, organizzate per argomento e ordinate per difficoltà crescente.

## 📚 Come Utilizzare Questa Guida

- Ogni esercizio include: livello di difficoltà, tempo stimato, obiettivi di apprendimento
- Inizia dagli esercizi **Facile** per familiarizzare con i concetti base
- Progredisci verso esercizi **Medio** e **Avanzato** per consolidare le tue competenze
- Consulta la documentazione ufficiale di Node.js quando necessario
- Prova a risolvere gli esercizi autonomamente prima di cercare soluzioni

## 📖 Legenda
- 🟢 **Facile**: concetti base, sintassi semplice, 15-30 minuti
- 🟡 **Medio**: logica più complessa, multiple operazioni, 30-60 minuti  
- 🔴 **Avanzato**: richiede integrazione di più concetti, 60+ minuti

---

## 1️⃣ File System (fs)

### 🟢 ES-FS-01: Lettura File di Testo
**Obiettivi**: Imparare a leggere file con `fs.readFile()` e gestire callback  
**Tempo**: 15 minuti  
**Descrizione**: Crea uno script che legge un file di testo e ne visualizza il contenuto a console.

**Task**:
- Crea un file `test.txt` con del testo
- Leggi il file usando `fs.readFile()`
- Gestisci eventuali errori
- Mostra il contenuto a console

### 🟢 ES-FS-02: Scrittura File di Log
**Obiettivi**: Usare `fs.writeFile()` per creare file  
**Tempo**: 20 minuti  
**Descrizione**: Crea un sistema che scrive messaggi di log in un file di testo.

**Task**:
- Crea una funzione `writeLog(message)` che aggiunge timestamp al messaggio
- Salva il log in un file `app.log`
- Gestisci gli errori di scrittura

### 🟡 ES-FS-03: Copia Ricorsiva di Directory
**Obiettivi**: Lavorare con directory, operazioni ricorsive  
**Tempo**: 45 minuti  
**Descrizione**: Crea una funzione che copia ricorsivamente una directory e il suo contenuto.

**Task**:
- Leggi il contenuto della directory sorgente
- Per ogni elemento, verifica se è file o directory
- Copia i file nella destinazione
- Ricorsivamente copia le sottodirectory

### 🟡 ES-FS-04: File Watcher
**Obiettivi**: Monitorare modifiche ai file con `fs.watch()`  
**Tempo**: 40 minuti  
**Descrizione**: Crea un'applicazione che monitora una directory e registra tutte le modifiche.

**Task**:
- Usa `fs.watch()` per monitorare una directory
- Registra tipo di evento (rename, change)
- Salva un log delle modifiche con timestamp
- Gestisci la chiusura del watcher

### 🔴 ES-FS-05: Analizzatore di Directory
**Obiettivi**: Elaborazione complessa di file system, statistiche  
**Tempo**: 90 minuti  
**Descrizione**: Crea un tool che analizza una directory e produce statistiche dettagliate.

**Task**:
- Scansiona ricorsivamente una directory
- Conta: numero di file, numero di cartelle, dimensione totale
- Classifica i file per estensione
- Trova i 5 file più grandi
- Esporta il report in formato JSON

---

## 2️⃣ HTTP e Networking

### 🟢 ES-HTTP-01: Server HTTP Base
**Obiettivi**: Creare un server HTTP semplice  
**Tempo**: 20 minuti  
**Descrizione**: Crea un server che risponde "Hello World" a tutte le richieste.

**Task**:
- Crea un server HTTP sulla porta 3000
- Rispondi con "Hello World" e status 200
- Testa con il browser o curl

### 🟢 ES-HTTP-02: Client HTTP - Fetch Data
**Obiettivi**: Usare `http.get()` per fare richieste  
**Tempo**: 25 minuti  
**Descrizione**: Crea un client che recupera dati da un'API pubblica.

**Task**:
- Usa `http.get()` per chiamare un'API (es. JSONPlaceholder)
- Gestisci la risposta e il buffering dei dati
- Parsea il JSON e mostra i risultati
- Gestisci gli errori di rete

### 🟡 ES-HTTP-03: Routing Manuale
**Obiettivi**: Gestire diverse rotte e metodi HTTP  
**Tempo**: 50 minuti  
**Descrizione**: Crea un server con routing per diverse route e metodi.

**Task**:
- Gestisci GET / (homepage)
- Gestisci GET /about (pagina about)
- Gestisci POST /api/data (ricevi dati JSON)
- Restituisci 404 per route non trovate
- Usa Content-Type appropriati

### 🟡 ES-HTTP-04: Download File da URL
**Obiettivi**: Stream di dati, download file  
**Tempo**: 45 minuti  
**Descrizione**: Crea un'applicazione che scarica un file da un URL e lo salva localmente.

**Task**:
- Usa `http.get()` per scaricare un file
- Usa stream per scrivere il file in modo efficiente
- Mostra una progress bar (opzionale)
- Gestisci errori di rete e scrittura

### 🔴 ES-HTTP-05: API REST con CRUD
**Obiettivi**: Creare un'API completa con operazioni CRUD  
**Tempo**: 120 minuti  
**Descrizione**: Crea un'API REST per gestire una lista di utenti (in memoria).

**Task**:
- GET /users - lista tutti gli utenti
- GET /users/:id - dettagli utente
- POST /users - crea nuovo utente
- PUT /users/:id - aggiorna utente
- DELETE /users/:id - elimina utente
- Valida i dati in input
- Gestisci errori appropriati (400, 404, 500)

---

## 3️⃣ Crypto (Crittografia)

### 🟢 ES-CRYPTO-01: Hash di Password
**Obiettivi**: Usare funzioni hash per la sicurezza  
**Tempo**: 20 minuti  
**Descrizione**: Crea una funzione per generare hash sicuri di password.

**Task**:
- Usa `crypto.createHash('sha256')` per creare hash
- Crea una funzione `hashPassword(password)`
- Testa con diverse password
- Mostra che lo stesso input produce sempre lo stesso hash

### 🟢 ES-CRYPTO-02: Generatore di Token
**Obiettivi**: Generare token casuali sicuri  
**Tempo**: 25 minuti  
**Descrizione**: Crea un generatore di token per sessioni o API keys.

**Task**:
- Usa `crypto.randomBytes()` per generare bytes casuali
- Converti in formato esadecimale o base64
- Crea funzione `generateToken(length)`
- Genera 10 token e verifica che siano diversi

### 🟡 ES-CRYPTO-03: Crittografia Simmetrica
**Obiettivi**: Cifrare e decifrare dati con AES  
**Tempo**: 50 minuti  
**Descrizione**: Implementa un sistema di cifratura/decifratura per messaggi segreti.

**Task**:
- Usa AES-256-CBC per cifrare/decifrare
- Crea funzione `encrypt(text, password)`
- Crea funzione `decrypt(encrypted, password)`
- Gestisci IV (Initialization Vector)
- Testa cifrando e decifrando un messaggio

### 🟡 ES-CRYPTO-04: Sistema di Firma Digitale
**Obiettivi**: Usare firma digitale con chiavi asimmetriche  
**Tempo**: 60 minuti  
**Descrizione**: Crea un sistema per firmare digitalmente documenti e verificare l'autenticità.

**Task**:
- Genera coppia di chiavi RSA (pubblica/privata)
- Firma un messaggio con chiave privata
- Verifica la firma con chiave pubblica
- Testa modificando il messaggio (firma non valida)

### 🔴 ES-CRYPTO-05: Password Manager Semplice
**Obiettivi**: Applicazione completa con storage sicuro  
**Tempo**: 120 minuti  
**Descrizione**: Crea un password manager che salva credenziali cifrate in un file.

**Task**:
- Usa una master password per cifrare i dati
- Implementa funzioni: add, get, list, delete
- Salva le password cifrate in un file JSON
- Usa PBKDF2 per derivare la chiave dalla master password
- Gestisci errori e validazione input

---

## 4️⃣ Path, OS, Util (Moduli di Sistema)

### 🟢 ES-SYSTEM-01: Informazioni di Sistema
**Obiettivi**: Recuperare info su sistema operativo e hardware  
**Tempo**: 15 minuti  
**Descrizione**: Crea uno script che mostra informazioni dettagliate sul sistema.

**Task**:
- Usa `os.platform()`, `os.arch()`, `os.hostname()`
- Mostra numero di CPU e memoria totale/libera
- Mostra uptime del sistema
- Formatta l'output in modo leggibile

### 🟢 ES-SYSTEM-02: Path Utilities
**Obiettivi**: Manipolare path in modo cross-platform  
**Tempo**: 20 minuti  
**Descrizione**: Crea funzioni utility per lavorare con percorsi file.

**Task**:
- Usa `path.join()` per combinare percorsi
- Usa `path.parse()` per analizzare un path completo
- Estrai estensione, nome file, directory
- Crea path assoluti da path relativi

### 🟡 ES-SYSTEM-03: Monitor Risorse Sistema
**Obiettivi**: Monitorare uso CPU e memoria nel tempo  
**Tempo**: 45 minuti  
**Descrizione**: Crea un monitor che registra l'uso delle risorse ogni 5 secondi.

**Task**:
- Usa `os.cpus()` per info CPU
- Calcola percentuale di utilizzo CPU
- Monitora memoria libera/usata con `os.freemem()` e `os.totalmem()`
- Salva i dati in un file log
- Esegui per almeno 1 minuto

### 🟡 ES-SYSTEM-04: Promisify Callbacks
**Obiettivi**: Convertire API callback-based in Promise  
**Tempo**: 40 minuti  
**Descrizione**: Usa `util.promisify()` per modernizzare codice legacy.

**Task**:
- Prendi 5 funzioni fs con callback (readFile, writeFile, etc.)
- Convertile in Promise usando `util.promisify()`
- Crea una funzione async che le usa con async/await
- Confronta il codice prima e dopo

### 🔴 ES-SYSTEM-05: Build Script Cross-Platform
**Obiettivi**: Creare script di build che funziona su tutti i sistemi  
**Tempo**: 90 minuti  
**Descrizione**: Crea uno script di build/deploy che si adatta al sistema operativo.

**Task**:
- Rileva il sistema operativo corrente
- Crea directory di output usando path.join()
- Compila/copia file in modo appropriato per l'OS
- Gestisci permessi file (chmod su Linux/Mac)
- Crea un report finale del processo di build

---

## 5️⃣ Buffer (Dati Binari)

### 🟢 ES-BUFFER-01: Conversioni Base
**Obiettivi**: Creare e convertire buffer tra formati  
**Tempo**: 20 minuti  
**Descrizione**: Sperimenta con le conversioni tra Buffer, stringhe e encoding.

**Task**:
- Crea un Buffer da una stringa UTF-8
- Converti in Base64
- Converti in esadecimale
- Riconverti in stringa UTF-8
- Verifica che il testo finale sia identico

### 🟢 ES-BUFFER-02: Lettura Dati Binari
**Obiettivi**: Leggere valori numerici da buffer  
**Tempo**: 25 minuti  
**Descrizione**: Leggi diversi tipi di numeri da un buffer binario.

**Task**:
- Crea un buffer con diversi numeri (Int8, Int16, Int32, Float, Double)
- Usa readInt8, readInt16BE, readInt32LE, readFloatLE, readDoubleLE
- Confronta big-endian vs little-endian

### 🟡 ES-BUFFER-03: Parser di File Binario
**Obiettivi**: Parsare un formato binario custom  
**Tempo**: 50 minuti  
**Descrizione**: Crea un parser per un semplice formato di file binario.

**Task**:
- Definisci formato: [4 bytes magic number][4 bytes version][2 bytes count][data...]
- Scrivi funzione per creare file binario con questo formato
- Scrivi funzione per parsare e validare il file
- Testa con dati di esempio

### 🟡 ES-BUFFER-04: Manipolazione Immagini Base
**Obiettivi**: Manipolare dati binari di immagini  
**Tempo**: 60 minuti  
**Descrizione**: Modifica i byte di un'immagine BMP per alterarne i colori.

**Task**:
- Leggi un file BMP semplice
- Identifica l'header e i pixel data
- Inverti i colori RGB (negativo)
- Salva la nuova immagine
- Confronta originale e modificata

### 🔴 ES-BUFFER-05: Protocollo di Rete Custom
**Obiettivi**: Implementare un protocollo binario per comunicazione  
**Tempo**: 120 minuti  
**Descrizione**: Crea un protocollo binario custom per scambiare messaggi tra client e server.

**Task**:
- Definisci formato messaggio: [1 byte type][2 bytes length][payload]
- Supporta 3 tipi di messaggio: TEXT, JSON, BINARY
- Implementa serializzazione e deserializzazione
- Crea server e client che comunicano con il protocollo
- Gestisci frammentazione e riassemblaggio

---

## 6️⃣ Process (Gestione Processi)

### 🟢 ES-PROCESS-01: Informazioni Processo
**Obiettivi**: Accedere a informazioni sul processo corrente  
**Tempo**: 15 minuti  
**Descrizione**: Mostra informazioni dettagliate sul processo Node.js in esecuzione.

**Task**:
- Mostra PID con `process.pid`
- Mostra directory corrente con `process.cwd()`
- Mostra argomenti della command line con `process.argv`
- Mostra variabili d'ambiente con `process.env`

### 🟢 ES-PROCESS-02: Gestione Argomenti CLI
**Obiettivi**: Creare script che accetta argomenti da linea di comando  
**Tempo**: 25 minuti  
**Descrizione**: Crea uno script che processa argomenti passati dalla CLI.

**Task**:
- Leggi argomenti con `process.argv`
- Supporta flags: --name, --age, --verbose
- Valida gli input
- Mostra help se argomenti mancanti

### 🟡 ES-PROCESS-03: Monitor Uso Memoria
**Obiettivi**: Monitorare consumo di memoria del processo  
**Tempo**: 40 minuti  
**Descrizione**: Crea un monitor che traccia l'uso di memoria nel tempo.

**Task**:
- Usa `process.memoryUsage()` ogni secondo
- Registra rss, heapTotal, heapUsed, external
- Crea un array grande per vedere la memoria crescere
- Chiama garbage collector (se possibile)
- Salva statistiche in un file

### 🟡 ES-PROCESS-04: Graceful Shutdown
**Obiettivi**: Gestire la chiusura pulita dell'applicazione  
**Tempo**: 45 minuti  
**Descrizione**: Implementa un sistema di shutdown che completa operazioni in corso.

**Task**:
- Cattura segnali SIGTERM e SIGINT
- Quando ricevuto, impedisci nuove richieste
- Completa le operazioni in corso (simula con setTimeout)
- Chiudi connessioni (simula con cleanup)
- Esci con `process.exit(0)`

### 🔴 ES-PROCESS-05: Task Scheduler
**Obiettivi**: Creare un sistema di scheduling task con monitoraggio  
**Tempo**: 90 minuti  
**Descrizione**: Implementa uno scheduler che esegue task periodici e li monitora.

**Task**:
- Gestisci una lista di task con intervalli diversi
- Esegui i task nei loro intervalli
- Monitora: tempo esecuzione, uso memoria, eventuali errori
- Crea dashboard testuale aggiornata in tempo reale
- Salva statistiche su file ogni minuto
- Gestisci shutdown pulito

---

## 7️⃣ Zlib (Compressione)

### 🟢 ES-ZLIB-01: Compressione Stringa
**Obiettivi**: Comprimere e decomprimere stringhe  
**Tempo**: 20 minuti  
**Descrizione**: Comprimi una stringa e misura il risparmio di spazio.

**Task**:
- Crea una stringa lunga (>1000 caratteri)
- Comprimi con `zlib.gzip()`
- Mostra dimensioni prima e dopo
- Decomprimi e verifica che sia identica

### 🟢 ES-ZLIB-02: Compressione File
**Obiettivi**: Comprimere file con gzip  
**Tempo**: 25 minuti  
**Descrizione**: Crea uno script che comprime un file di testo.

**Task**:
- Prendi un file di testo come input
- Comprimi il file usando gzip
- Salva come filename.gz
- Mostra rapporto di compressione

### 🟡 ES-ZLIB-03: Confronto Algoritmi
**Obiettivi**: Confrontare gzip, deflate e brotli  
**Tempo**: 50 minuti  
**Descrizione**: Crea un tool di analisi che confronta diversi algoritmi di compressione.

**Task**:
- Comprimi lo stesso file con gzip, deflate e brotli
- Misura tempo di compressione
- Misura dimensione risultante
- Misura tempo di decompressione
- Crea una tabella comparativa

### 🟡 ES-ZLIB-04: Stream Compression
**Obiettivi**: Usare stream per comprimere file grandi  
**Tempo**: 45 minuti  
**Descrizione**: Comprimi un file grande usando stream per efficienza memoria.

**Task**:
- Usa `fs.createReadStream()` per leggere
- Pipe attraverso `zlib.createGzip()`
- Pipe in `fs.createWriteStream()` per salvare
- Mostra progress bar durante compressione
- Gestisci errori nella pipeline

### 🔴 ES-ZLIB-05: Backup Automatico con Compressione
**Obiettivi**: Sistema completo di backup con archiviazione compressa  
**Tempo**: 120 minuti  
**Descrizione**: Crea un sistema di backup che archivia e comprime directory.

**Task**:
- Scandisci ricorsivamente una directory
- Crea un file TAR-like (formato custom) con tutti i file
- Comprimi l'archivio con brotli (livello massimo)
- Aggiungi metadata: timestamp, checksum, lista file
- Implementa funzione di restore che decomprimi e ripristina
- Gestisci file grandi con stream

---

## 🎯 Progetti Integrati (Combinano Più Moduli)

### 🔴 PROGETTO-01: File Server FTP-like
**Moduli**: fs, http, path, crypto, buffer  
**Tempo**: 3-4 ore  
**Descrizione**: Crea un file server HTTP con funzionalità avanzate.

**Funzionalità**:
- Upload/download file via HTTP
- Lista directory navigabile
- Autenticazione con hash password
- File previews per testi
- Compressione automatica per download grandi

### 🔴 PROGETTO-02: System Monitor Dashboard
**Moduli**: process, os, http, zlib  
**Tempo**: 3-4 ore  
**Descrizione**: Dashboard web che monitora il sistema in tempo reale.

**Funzionalità**:
- API REST per statistiche sistema (CPU, RAM, disco)
- Storico dei dati compressi in formato JSON
- WebSocket per aggiornamenti real-time (opzionale)
- Grafici testuali in console
- Allarmi per uso risorse elevato

### 🔴 PROGETTO-03: Secure Message Exchange
**Moduli**: crypto, fs, http, buffer  
**Tempo**: 4-5 ore  
**Descrizione**: Sistema per scambiare messaggi cifrati tra utenti.

**Funzionalità**:
- Generazione coppie di chiavi RSA per utenti
- Firma digitale dei messaggi
- Cifratura end-to-end
- Storage messaggi cifrati su file
- API REST per inviare/ricevere messaggi

---

## 📝 Consigli per Completare gli Esercizi

1. **Leggi la documentazione**: Prima di iniziare, consulta la documentazione ufficiale di Node.js per il modulo in questione
2. **Test incrementali**: Testa il codice frequentemente, non aspettare di aver finito tutto
3. **Error handling**: Gestisci sempre gli errori, non ignorare i casi limite
4. **Console.log**: Usa console.log per debuggare e capire cosa sta succedendo
5. **Commenta il codice**: Scrivi commenti per spiegare la logica complessa
6. **Refactoring**: Dopo aver completato un esercizio, rivedi il codice e miglioralo
7. **Confronto**: Confronta le tue soluzioni con quelle dei compagni per imparare approcci diversi

## 🔗 Risorse Utili

- [Documentazione ufficiale Node.js](https://nodejs.org/api/)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/it/docs/Web/JavaScript)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 📊 Come Organizzare il Tuo Lavoro

Crea una cartella per ogni esercizio con questa struttura:
```
es-fs-01/
  ├── README.md (descrizione e spiegazione della soluzione)
  ├── index.js (codice principale)
  ├── test.txt (file di test, se necessario)
  └── package.json (se usi dipendenze npm)
```

Buon lavoro! 🚀
