# Operazioni SQL Fondamentali

## Introduzione al Linguaggio SQL

SQL (Structured Query Language) è il linguaggio standard per interagire con i database relazionali come MySQL. Sviluppato negli anni '70 da IBM, SQL è diventato uno standard ANSI/ISO ed è supportato da praticamente tutti i sistemi di gestione di database relazionali.

Il linguaggio SQL si divide in diverse categorie di comandi:

- **DDL (Data Definition Language)**: Comandi per definire e modificare la struttura del database
- **DML (Data Manipulation Language)**: Comandi per manipolare i dati all'interno delle tabelle
- **DQL (Data Query Language)**: Comandi per interrogare e recuperare dati
- **DCL (Data Control Language)**: Comandi per gestire i permessi e il controllo degli accessi
- **TCL (Transaction Control Language)**: Comandi per gestire le transazioni

In questo capitolo, ci concentreremo sulle operazioni SQL fondamentali che utilizzerai più frequentemente nelle tue applicazioni Node.js con MySQL.

## Creazione e Gestione del Database

### Creazione di un Database

```sql
-- Creazione di un nuovo database
CREATE DATABASE ecommerce;

-- Creazione di un database se non esiste già
CREATE DATABASE IF NOT EXISTS ecommerce;

-- Creazione di un database con set di caratteri specifico
CREATE DATABASE ecommerce
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### Selezione di un Database

```sql
-- Selezione del database da utilizzare
USE ecommerce;
```

### Eliminazione di un Database

```sql
-- Eliminazione di un database
DROP DATABASE ecommerce;

-- Eliminazione di un database se esiste
DROP DATABASE IF EXISTS ecommerce;
```

## Creazione e Gestione delle Tabelle

### Creazione di una Tabella

```sql
-- Creazione di una tabella prodotti
CREATE TABLE prodotti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descrizione TEXT,
  prezzo DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(50),
  disponibile BOOLEAN DEFAULT TRUE,
  data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creazione di una tabella con chiave esterna
CREATE TABLE ordini (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  data_ordine TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  stato ENUM('in attesa', 'spedito', 'consegnato', 'annullato') DEFAULT 'in attesa',
  totale DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clienti(id)
);
```

### Modifica di una Tabella

```sql
-- Aggiunta di una colonna
ALTER TABLE prodotti
ADD COLUMN peso FLOAT;

-- Modifica di una colonna
ALTER TABLE prodotti
MODIFY COLUMN descrizione TEXT NOT NULL;

-- Rinomina di una colonna
ALTER TABLE prodotti
CHANGE COLUMN nome nome_prodotto VARCHAR(100) NOT NULL;

-- Aggiunta di un indice
ALTER TABLE prodotti
ADD INDEX idx_categoria (categoria);
```

### Eliminazione di una Tabella

```sql
-- Eliminazione di una tabella
DROP TABLE prodotti;

-- Eliminazione di una tabella se esiste
DROP TABLE IF EXISTS prodotti;
```

## Operazioni CRUD (Create, Read, Update, Delete)

Le operazioni CRUD rappresentano le funzionalità fondamentali per la gestione dei dati in un database.

### Create (Inserimento Dati)

```sql
-- Inserimento di un singolo record
INSERT INTO prodotti (nome, descrizione, prezzo, categoria)
VALUES ('Smartphone XYZ', 'Smartphone di ultima generazione', 599.99, 'Elettronica');

-- Inserimento di più record contemporaneamente
INSERT INTO prodotti (nome, prezzo, categoria)
VALUES 
  ('Laptop ABC', 1299.99, 'Elettronica'),
  ('Mouse wireless', 29.99, 'Accessori'),
  ('Tastiera meccanica', 89.99, 'Accessori');
```

### Read (Lettura Dati)

```sql
-- Selezione di tutti i campi di tutti i record
SELECT * FROM prodotti;

-- Selezione di campi specifici
SELECT nome, prezzo FROM prodotti;

-- Selezione con condizione WHERE
SELECT * FROM prodotti WHERE categoria = 'Elettronica';

-- Selezione con operatori di confronto
SELECT * FROM prodotti WHERE prezzo > 100;

-- Selezione con operatori logici
SELECT * FROM prodotti 
WHERE categoria = 'Elettronica' AND prezzo < 1000;

-- Selezione con LIKE per pattern matching
SELECT * FROM prodotti WHERE nome LIKE '%phone%';

-- Selezione con IN per valori multipli
SELECT * FROM prodotti WHERE categoria IN ('Elettronica', 'Accessori');

-- Selezione con BETWEEN per intervalli
SELECT * FROM prodotti WHERE prezzo BETWEEN 50 AND 500;

-- Ordinamento dei risultati
SELECT * FROM prodotti ORDER BY prezzo DESC;

-- Limitazione dei risultati
SELECT * FROM prodotti LIMIT 10;

-- Paginazione dei risultati
SELECT * FROM prodotti LIMIT 10 OFFSET 20; -- Pagina 3 (con 10 elementi per pagina)
```

### Update (Aggiornamento Dati)

```sql
-- Aggiornamento di tutti i record che soddisfano una condizione
UPDATE prodotti 
SET prezzo = prezzo * 0.9 
WHERE categoria = 'Elettronica';

-- Aggiornamento di più campi contemporaneamente
UPDATE prodotti 
SET 
  disponibile = FALSE,
  descrizione = 'Prodotto non più disponibile'
WHERE id = 5;
```

### Delete (Eliminazione Dati)

```sql
-- Eliminazione di tutti i record che soddisfano una condizione
DELETE FROM prodotti WHERE disponibile = FALSE;

-- Eliminazione di tutti i record (svuotamento tabella)
DELETE FROM prodotti;
-- oppure (più efficiente per tabelle grandi)
TRUNCATE TABLE prodotti;
```

## Join e Relazioni tra Tabelle

Una delle caratteristiche più potenti dei database relazionali è la capacità di combinare dati da più tabelle attraverso operazioni di join.

### Tipi di Join

```sql
-- INNER JOIN: restituisce solo le righe che hanno corrispondenze in entrambe le tabelle
SELECT o.id, c.nome, o.totale, o.data_ordine
FROM ordini o
INNER JOIN clienti c ON o.cliente_id = c.id;

-- LEFT JOIN: restituisce tutte le righe dalla tabella di sinistra e le corrispondenti dalla tabella di destra
SELECT c.nome, o.id, o.totale
FROM clienti c
LEFT JOIN ordini o ON c.id = o.cliente_id;

-- RIGHT JOIN: restituisce tutte le righe dalla tabella di destra e le corrispondenti dalla tabella di sinistra
SELECT c.nome, o.id, o.totale
FROM ordini o
RIGHT JOIN clienti c ON o.cliente_id = c.id;

-- FULL JOIN (emulato in MySQL con UNION)
SELECT c.nome, o.id, o.totale
FROM clienti c
LEFT JOIN ordini o ON c.id = o.cliente_id
UNION
SELECT c.nome, o.id, o.totale
FROM clienti c
RIGHT JOIN ordini o ON c.id = o.cliente_id
WHERE c.id IS NULL;
```

### Join con Più Tabelle

```sql
-- Join di tre tabelle
SELECT o.id AS ordine_id, c.nome AS cliente, p.nome AS prodotto, d.quantita, p.prezzo
FROM ordini o
JOIN clienti c ON o.cliente_id = c.id
JOIN dettagli_ordine d ON o.id = d.ordine_id
JOIN prodotti p ON d.prodotto_id = p.id;
```

## Funzioni di Aggregazione e Raggruppamento

Le funzioni di aggregazione permettono di eseguire calcoli su gruppi di righe.

```sql
-- Conteggio dei record
SELECT COUNT(*) FROM prodotti;

-- Somma di valori
SELECT SUM(totale) FROM ordini WHERE YEAR(data_ordine) = 2023;

-- Media di valori
SELECT AVG(prezzo) FROM prodotti WHERE categoria = 'Elettronica';

-- Valore minimo e massimo
SELECT MIN(prezzo), MAX(prezzo) FROM prodotti;

-- Raggruppamento con GROUP BY
SELECT categoria, COUNT(*) AS numero_prodotti, AVG(prezzo) AS prezzo_medio
FROM prodotti
GROUP BY categoria;

-- Filtraggio dei gruppi con HAVING
SELECT categoria, COUNT(*) AS numero_prodotti
FROM prodotti
GROUP BY categoria
HAVING numero_prodotti > 5;
```

## Subquery e Query Annidate

Le subquery permettono di utilizzare il risultato di una query all'interno di un'altra query.

```sql
-- Subquery nella clausola WHERE
SELECT nome, prezzo
FROM prodotti
WHERE prezzo > (SELECT AVG(prezzo) FROM prodotti);

-- Subquery nella clausola FROM
SELECT categoria, avg_price
FROM (
  SELECT categoria, AVG(prezzo) AS avg_price
  FROM prodotti
  GROUP BY categoria
) AS category_stats
WHERE avg_price > 100;

-- Subquery con IN
SELECT nome, prezzo
FROM prodotti
WHERE categoria IN (
  SELECT categoria
  FROM categorie
  WHERE attiva = TRUE
);
```

## Transazioni

Le transazioni permettono di eseguire più operazioni come un'unica unità atomica, garantendo che o tutte le operazioni vengano completate con successo, o nessuna di esse venga applicata.

```sql
-- Inizio di una transazione
START TRANSACTION;

-- Operazioni all'interno della transazione
UPDATE conti SET saldo = saldo - 1000 WHERE id = 1;
UPDATE conti SET saldo = saldo + 1000 WHERE id = 2;

-- Se tutto è andato bene, conferma le modifiche
COMMIT;

-- In caso di errore, annulla tutte le modifiche
-- ROLLBACK;
```

## Indici

Gli indici migliorano le prestazioni delle query, ma possono rallentare le operazioni di scrittura.

```sql
-- Creazione di un indice semplice
CREATE INDEX idx_categoria ON prodotti(categoria);

-- Creazione di un indice unico
CREATE UNIQUE INDEX idx_email ON clienti(email);

-- Creazione di un indice composito
CREATE INDEX idx_cat_prezzo ON prodotti(categoria, prezzo);

-- Eliminazione di un indice
DROP INDEX idx_categoria ON prodotti;
```

## Viste

Le viste sono query salvate che possono essere utilizzate come tabelle virtuali.

```sql
-- Creazione di una vista
CREATE VIEW prodotti_elettronica AS
SELECT id, nome, prezzo
FROM prodotti
WHERE categoria = 'Elettronica';

-- Utilizzo di una vista
SELECT * FROM prodotti_elettronica WHERE prezzo < 500;

-- Eliminazione di una vista
DROP VIEW prodotti_elettronica;
```

## Stored Procedures e Funzioni

Le stored procedures e le funzioni permettono di incapsulare logica complessa all'interno del database.

```sql
-- Creazione di una stored procedure
DELIMITER //
CREATE PROCEDURE aggiorna_prezzi(IN categoria_param VARCHAR(50), IN percentuale FLOAT)
BEGIN
  UPDATE prodotti
  SET prezzo = prezzo * (1 + percentuale / 100)
  WHERE categoria = categoria_param;
END //
DELIMITER ;

-- Chiamata di una stored procedure
CALL aggiorna_prezzi('Elettronica', 10);

-- Creazione di una funzione
DELIMITER //
CREATE FUNCTION calcola_sconto(prezzo DECIMAL(10, 2), percentuale INT)
RETURNS DECIMAL(10, 2)
DETERMINISTIC
BEGIN
  RETURN prezzo * (1 - percentuale / 100);
END //
DELIMITER ;

-- Utilizzo di una funzione
SELECT nome, prezzo, calcola_sconto(prezzo, 20) AS prezzo_scontato
FROM prodotti;
```

## Trigger

I trigger sono procedure che vengono eseguite automaticamente in risposta a determinati eventi su una tabella.

```sql
-- Creazione di un trigger
DELIMITER //
CREATE TRIGGER after_product_insert
AFTER INSERT ON prodotti
FOR EACH ROW
BEGIN
  INSERT INTO log_attivita (tabella, azione, record_id, data)
  VALUES ('prodotti', 'INSERT', NEW.id, NOW());
END //
DELIMITER ;
```

## Gestione degli Utenti e dei Permessi

```sql
-- Creazione di un nuovo utente
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'password';

-- Assegnazione di privilegi
GRANT SELECT, INSERT, UPDATE ON ecommerce.* TO 'app_user'@'localhost';

-- Revoca di privilegi
REVOKE UPDATE ON ecommerce.* FROM 'app_user'@'localhost';

-- Eliminazione di un utente
DROP USER 'app_user'@'localhost';
```

## Ottimizzazione delle Query

### Analisi delle Query

```sql
-- Analisi del piano di esecuzione di una query
EXPLAIN SELECT * FROM prodotti WHERE categoria = 'Elettronica';

-- Analisi dettagliata con statistiche di esecuzione
EXPLAIN ANALYZE SELECT * FROM prodotti WHERE categoria = 'Elettronica';
```

### Best Practices per Query Efficienti

1. **Usa indici appropriati** per le colonne frequentemente utilizzate nelle clausole WHERE, JOIN e ORDER BY
2. **Seleziona solo le colonne necessarie** invece di usare SELECT *
3. **Limita i risultati** con LIMIT quando possibile
4. **Evita funzioni nelle clausole WHERE** che impediscono l'uso degli indici
5. **Usa JOIN invece di subquery** quando possibile
6. **Considera la denormalizzazione** per query di lettura frequenti

## Integrazione con Node.js

In Node.js, le query SQL vengono eseguite tramite il driver mysql2. Ecco alcuni esempi di come utilizzare le operazioni SQL viste in questo capitolo:

```javascript
const mysql = require('mysql2/promise');

async function eseguiOperazioniSQL() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'utente',
    password: 'password',
    database: 'ecommerce'
  });
  
  try {
    // Inserimento dati
    const [result] = await connection.execute(
      'INSERT INTO prodotti (nome, prezzo, categoria) VALUES (?, ?, ?)',
      ['Nuovo prodotto', 99.99, 'Elettronica']
    );
    console.log(`Prodotto inserito con ID: ${result.insertId}`);
    
    // Selezione dati
    const [rows] = await connection.execute(
      'SELECT * FROM prodotti WHERE categoria = ? ORDER BY prezzo DESC LIMIT ?',
      ['Elettronica', 10]
    );
    console.log('Prodotti trovati:', rows);
    
    // Aggiornamento dati
    const [updateResult] = await connection.execute(
      'UPDATE prodotti SET prezzo = ? WHERE id = ?',
      [129.99, result.insertId]
    );
    console.log(`Righe aggiornate: ${updateResult.affectedRows}`);
    
    // Join tra tabelle
    const [ordini] = await connection.execute(`
      SELECT o.id, c.nome AS cliente, o.totale, o.data_ordine
      FROM ordini o
      JOIN clienti c ON o.cliente_id = c.id
      WHERE o.stato = ?
      ORDER BY o.data_ordine DESC
    `, ['spedito']);
    console.log('Ordini spediti:', ordini);
    
    // Transazione
    await connection.beginTransaction();
    try {
      await connection.execute(
        'UPDATE conti SET saldo = saldo - ? WHERE id = ?',
        [1000, 1]
      );
      await connection.execute(
        'UPDATE conti SET saldo = saldo + ? WHERE id = ?',
        [1000, 2]
      );
      await connection.commit();
      console.log('Transazione completata con successo');
    } catch (error) {
      await connection.rollback();
      console.error('Errore durante la transazione:', error);
    }
    
  } catch (error) {
    console.error('Errore durante l\'esecuzione delle query:', error);
  } finally {
    await connection.end();
  }
}

eseguiOperazioniSQL();
```

## Conclusione

In questo capitolo abbiamo esplorato le operazioni SQL fondamentali che ti permetteranno di interagire efficacemente con MySQL nelle tue applicazioni Node.js. Abbiamo visto come creare e gestire database e tabelle, eseguire operazioni CRUD, utilizzare join per combinare dati da più tabelle, e sfruttare funzionalità avanzate come transazioni, stored procedures e trigger.

La padronanza di SQL è essenziale per sviluppare applicazioni che utilizzano database relazionali, permettendoti di sfruttare appieno la potenza e la flessibilità di MySQL. Nel prossimo capitolo, vedremo come integrare queste operazioni SQL in un'applicazione Node.js, implementando pattern comuni per la gestione delle connessioni e la strutturazione del codice.

---

## Navigazione del Corso

- [Indice del Corso Node.js](../../README.md)
- **Modulo Corrente: MySQL**
  - [01 - Introduzione ai Database Relazionali](./01-introduzione-db-relazionali.md)
  - [02 - Installazione e Configurazione di MySQL](./02-installazione-mysql.md)
  - **03 - Operazioni SQL Fondamentali** (Documento Corrente)
  - [04 - Connessione a MySQL da Node.js](./04-connessione-nodejs-mysql.md)
  - [05 - Pattern di Gestione delle Connessioni](./05-pattern-connessioni.md)