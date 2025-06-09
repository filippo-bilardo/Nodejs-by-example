# Introduzione ai Database Relazionali

## Cos'è un Database Relazionale?

I database relazionali rappresentano uno dei modelli di gestione dati più diffusi e consolidati nel panorama informatico. Basati sul modello relazionale teorizzato da Edgar F. Codd nel 1970, questi sistemi organizzano i dati in strutture tabellari composte da righe e colonne, creando relazioni logiche tra le diverse entità.

A differenza dei database NoSQL che abbiamo esplorato nel modulo precedente, i database relazionali seguono uno schema rigido e predefinito, dove ogni tabella ha una struttura specifica e le relazioni tra i dati sono esplicite e formalmente definite.

## Caratteristiche Principali dei Database Relazionali

### 1. Struttura Tabellare

I dati sono organizzati in tabelle (o "relazioni") che rappresentano entità del mondo reale:

- Ogni tabella è composta da righe (o "tuple") che rappresentano singole istanze dell'entità
- Ogni colonna (o "attributo") rappresenta una proprietà specifica dell'entità
- Ogni cella contiene un singolo valore atomico

Esempio di tabella `utenti`:

| id | nome    | cognome | email                | data_registrazione |
|----|---------|---------|----------------------|--------------------|
| 1  | Mario   | Rossi   | mario.rossi@mail.com | 2023-01-15         |
| 2  | Giulia  | Bianchi | g.bianchi@mail.com   | 2023-02-20         |
| 3  | Roberto | Verdi   | r.verdi@mail.com     | 2023-03-05         |

### 2. Schema Predefinito

Una caratteristica fondamentale dei database relazionali è la presenza di uno schema rigido:

- La struttura delle tabelle deve essere definita prima dell'inserimento dei dati
- Ogni colonna ha un tipo di dato specifico (intero, stringa, data, ecc.)
- I vincoli di integrità definiscono le regole che i dati devono rispettare

Questo approccio garantisce consistenza e integrità dei dati, ma richiede una progettazione accurata e può risultare meno flessibile rispetto ai database NoSQL in scenari dove la struttura dei dati evolve rapidamente.

### 3. Relazioni tra Tabelle

Come suggerisce il nome, i database relazionali eccellono nella gestione delle relazioni tra diverse entità:

- **Chiavi primarie**: Identificano univocamente ogni riga in una tabella
- **Chiavi esterne**: Creano collegamenti tra tabelle diverse, stabilendo relazioni
- **Tipi di relazioni**: Uno-a-uno, uno-a-molti, molti-a-molti

Esempio di relazione uno-a-molti tra `utenti` e `ordini`:

Tabella `ordini`:

| id | utente_id | prodotto      | importo | data_ordine |
|----|-----------|---------------|---------|-------------|
| 1  | 1         | Smartphone    | 599.99  | 2023-02-10  |
| 2  | 1         | Cuffie BT     | 89.99   | 2023-02-10  |
| 3  | 2         | Laptop        | 1299.99 | 2023-03-15  |
| 4  | 3         | Monitor       | 349.99  | 2023-04-20  |

In questo esempio, `utente_id` nella tabella `ordini` è una chiave esterna che fa riferimento alla chiave primaria `id` nella tabella `utenti`.

### 4. Linguaggio SQL

I database relazionali utilizzano SQL (Structured Query Language) come linguaggio standard per:

- **Definizione dei dati** (DDL): Creazione e modifica della struttura del database
- **Manipolazione dei dati** (DML): Inserimento, aggiornamento, eliminazione dei dati
- **Interrogazione dei dati** (DQL): Recupero di informazioni specifiche
- **Controllo degli accessi** (DCL): Gestione dei permessi e della sicurezza

Esempi di query SQL:

```sql
-- Creazione di una tabella (DDL)
CREATE TABLE prodotti (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  prezzo DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(50),
  disponibile BOOLEAN DEFAULT TRUE
);

-- Inserimento dati (DML)
INSERT INTO prodotti (nome, prezzo, categoria) 
VALUES ('Monitor 27"', 299.99, 'Elettronica');

-- Interrogazione (DQL)
SELECT p.nome, p.prezzo 
FROM prodotti p
WHERE p.categoria = 'Elettronica' AND p.prezzo < 500;

-- Aggiornamento (DML)
UPDATE prodotti 
SET disponibile = FALSE 
WHERE id = 5;
```

### 5. Transazioni ACID

I database relazionali supportano transazioni che rispettano le proprietà ACID:

- **Atomicità**: Una transazione è un'unità indivisibile; o viene completata interamente o fallisce completamente
- **Consistenza**: Una transazione porta il database da uno stato valido a un altro stato valido
- **Isolamento**: Le transazioni concorrenti non interferiscono tra loro
- **Durabilità**: Una volta completata una transazione, i suoi effetti sono permanenti

Queste proprietà garantiscono l'integrità dei dati anche in scenari complessi con accessi concorrenti e potenziali guasti del sistema.

## Vantaggi dei Database Relazionali

1. **Integrità dei dati**: Vincoli, chiavi e relazioni garantiscono la correttezza e la coerenza dei dati
2. **Flessibilità nelle query**: SQL permette interrogazioni complesse e join tra tabelle
3. **Transazioni affidabili**: Le proprietà ACID garantiscono operazioni sicure e consistenti
4. **Standard consolidato**: Ampia documentazione, strumenti maturi e competenze diffuse
5. **Normalizzazione**: Riduce la ridondanza dei dati e migliora l'efficienza dello storage

## Limitazioni dei Database Relazionali

1. **Scalabilità orizzontale**: Più complessa rispetto ai database NoSQL
2. **Rigidità dello schema**: Modifiche strutturali possono essere costose in database già popolati
3. **Impedance mismatch**: Discrepanza tra il modello relazionale e i modelli di programmazione orientati agli oggetti
4. **Performance con dati non strutturati**: Meno efficienti per dati come documenti, grafici o dati gerarchici complessi

## MySQL: Un Database Relazionale Open Source

MySQL è uno dei sistemi di gestione di database relazionali più popolari al mondo, particolarmente diffuso in ambito web. Sviluppato inizialmente da MySQL AB e ora di proprietà di Oracle, MySQL offre:

- **Performance elevate**: Ottimizzato per operazioni di lettura intensive
- **Affidabilità**: Ampiamente testato e utilizzato in produzione da migliaia di aziende
- **Facilità d'uso**: Semplice da installare, configurare e gestire
- **Compatibilità**: Supporta lo standard SQL e funziona su diverse piattaforme
- **Ecosistema ricco**: Strumenti di amministrazione, monitoraggio e ottimizzazione

MySQL è la "M" nel popolare stack LAMP (Linux, Apache, MySQL, PHP/Python/Perl) e viene utilizzato da molte applicazioni web di grande scala, tra cui WordPress, Drupal, e numerosi servizi online.

## Database Relazionali vs NoSQL: Quando Usare Cosa

La scelta tra un database relazionale come MySQL e un database NoSQL come MongoDB dipende dalle specifiche esigenze del progetto:

| Scenario | Database Relazionale | Database NoSQL |
|----------|----------------------|----------------|
| Dati strutturati con relazioni complesse | ✅ Ideale | ❌ Meno adatto |
| Transazioni che coinvolgono più entità | ✅ Supporto nativo ACID | ❌ Supporto limitato |
| Schema dati in evoluzione rapida | ❌ Richiede migrazioni | ✅ Schema flessibile |
| Scalabilità orizzontale massiva | ❌ Più complessa | ✅ Spesso più semplice |
| Dati gerarchici o a grafo | ❌ Meno efficiente | ✅ Modelli specializzati |
| Reporting e business intelligence | ✅ Query SQL potenti | ❌ Capacità analitiche limitate |

In molte architetture moderne, si adotta un approccio poliglotta, utilizzando database relazionali e NoSQL fianco a fianco, sfruttando i punti di forza di ciascuno per diversi aspetti dell'applicazione.

## Integrazione con Node.js

Node.js offre diverse opzioni per connettersi e interagire con database MySQL:

- **mysql**: Il driver originale per MySQL in Node.js
- **mysql2**: Un'implementazione più moderna e performante, con supporto per Promises
- **Sequelize**: Un ORM (Object-Relational Mapping) che supporta MySQL e altri database SQL
- **TypeORM**: Un ORM orientato a TypeScript con supporto per MySQL

Esempio di connessione base con mysql2:

```javascript
const mysql = require('mysql2/promise');

async function main() {
  // Creazione del pool di connessioni
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'utente',
    password: 'password',
    database: 'mio_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  try {
    // Esecuzione di una query
    const [rows, fields] = await pool.query('SELECT * FROM prodotti WHERE categoria = ?', ['Elettronica']);
    console.log('Prodotti trovati:', rows);
  } catch (error) {
    console.error('Errore durante la query:', error);
  } finally {
    // Chiusura del pool quando l'applicazione termina
    await pool.end();
  }
}

main();
```

## Conclusione

I database relazionali come MySQL rappresentano una tecnologia matura e affidabile per la gestione dei dati strutturati con relazioni complesse. La loro capacità di garantire l'integrità dei dati attraverso schemi rigidi, vincoli e transazioni ACID li rende particolarmente adatti per applicazioni che richiedono consistenza e affidabilità, come sistemi finanziari, e-commerce e applicazioni aziendali.

Nonostante l'ascesa dei database NoSQL, i sistemi relazionali continuano a essere fondamentali nel panorama tecnologico moderno, spesso utilizzati in combinazione con altre tecnologie di persistenza in architetture poliglotte.

Nei prossimi capitoli, esploreremo in dettaglio come installare, configurare e utilizzare MySQL con Node.js, implementando pattern comuni e best practice per lo sviluppo di applicazioni robuste e scalabili.

---

## Navigazione del Corso

- [Indice del Corso Node.js](../../README.md)
- **Modulo Corrente: MySQL**
  - **01 - Introduzione ai Database Relazionali** (Documento Corrente)
  - [02 - Installazione e Configurazione di MySQL](./02-installazione-mysql.md)
  - [03 - Operazioni SQL Fondamentali](./03-operazioni-sql.md)
  - [04 - Connessione a MySQL da Node.js](./04-connessione-nodejs-mysql.md)
  - [05 - Pattern di Gestione delle Connessioni](./05-pattern-connessioni.md)