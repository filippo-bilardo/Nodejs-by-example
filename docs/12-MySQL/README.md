# MySQL con Node.js

## Introduzione

Questo modulo introduce l'integrazione di MySQL, uno dei database relazionali più popolari, con Node.js. Imparerai come connettere la tua applicazione Node.js a un database MySQL, eseguire query SQL e gestire i dati in modo efficiente.

MySQL è un sistema di gestione di database relazionali (RDBMS) open source che utilizza il linguaggio SQL (Structured Query Language) per manipolare i dati. A differenza dei database NoSQL come MongoDB, MySQL organizza i dati in tabelle con righe e colonne, seguendo il modello relazionale.

## Obiettivi di Apprendimento

- Comprendere i concetti fondamentali dei database relazionali
- Installare e configurare MySQL per l'uso con Node.js
- Utilizzare il driver MySQL per Node.js per connettersi al database
- Eseguire operazioni CRUD (Create, Read, Update, Delete) utilizzando SQL
- Implementare pattern comuni per la gestione delle connessioni
- Gestire transazioni e query parametrizzate
- Proteggere l'applicazione da vulnerabilità come SQL Injection

## Prerequisiti

- Conoscenza di base di Node.js
- Comprensione dei concetti di database
- Familiarità con JavaScript asincrono (Promises, async/await)

## Contenuti Teorici

1. [Introduzione ai Database Relazionali](./teoria/01-introduzione-db-relazionali.md)
2. [Installazione e Configurazione di MySQL](./teoria/02-installazione-mysql.md)
3. [Operazioni SQL Fondamentali](./teoria/03-operazioni-sql.md)
4. [Connessione a MySQL da Node.js](./teoria/04-connessione-nodejs-mysql.md)
5. [Pattern di Gestione delle Connessioni](./teoria/05-pattern-connessioni.md)

## Esercizi Pratici

### Esercizio 1: Configurazione dell'Ambiente

Configura un ambiente di sviluppo con Node.js e MySQL:

1. Installa MySQL sul tuo sistema
2. Crea un nuovo database e un utente con i permessi appropriati
3. Configura un progetto Node.js con il driver mysql2
4. Stabilisci una connessione di test al database

### Esercizio 2: Operazioni CRUD di Base

Implementa le operazioni CRUD di base per una semplice applicazione di gestione di una lista di attività:

1. Crea una tabella `tasks` con campi appropriati
2. Implementa funzioni per:
   - Aggiungere una nuova attività
   - Recuperare tutte le attività
   - Aggiornare lo stato di un'attività
   - Eliminare un'attività

### Esercizio 3: API REST con MySQL

Crea una semplice API REST che utilizza MySQL come database:

1. Configura un server Express
2. Implementa endpoint per le operazioni CRUD
3. Utilizza middleware per la gestione degli errori
4. Implementa la validazione dei dati in ingresso

### Esercizio 4: Gestione delle Relazioni

Estendi l'applicazione per gestire relazioni tra tabelle:

1. Aggiungi una tabella `categories` per categorizzare le attività
2. Implementa query con JOIN per recuperare attività con le relative categorie
3. Crea endpoint per gestire le categorie

### Esercizio 5: Transazioni e Gestione Avanzata

Implementa funzionalità avanzate utilizzando transazioni e altre caratteristiche di MySQL:

1. Utilizza transazioni per operazioni che coinvolgono più tabelle
2. Implementa la paginazione dei risultati
3. Aggiungi funzionalità di ricerca e filtro

## Risorse Aggiuntive

- [Documentazione ufficiale di MySQL](https://dev.mysql.com/doc/)
- [Documentazione del driver mysql2 per Node.js](https://github.com/sidorares/node-mysql2#readme)
- [SQL Tutorial su W3Schools](https://www.w3schools.com/sql/)
- [MySQL Workbench (strumento grafico per MySQL)](https://www.mysql.com/products/workbench/)

## Conclusione

Al termine di questo modulo, avrai acquisito le competenze necessarie per integrare MySQL nelle tue applicazioni Node.js, gestire dati relazionali in modo efficiente e implementare pattern comuni per lo sviluppo di applicazioni basate su database.