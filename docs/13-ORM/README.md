# ORM (Object-Relational Mapping) in Node.js

## Introduzione

Gli ORM (Object-Relational Mapping) sono strumenti che facilitano l'interazione tra il codice orientato agli oggetti e i database relazionali. Essi permettono di manipolare i dati del database utilizzando oggetti JavaScript, eliminando la necessità di scrivere query SQL manualmente e offrendo un'astrazione che rende il codice più pulito e manutenibile.

In questo modulo, esploreremo l'utilizzo degli ORM in Node.js, concentrandoci principalmente su Sequelize, uno dei più popolari ORM per Node.js che supporta diversi database relazionali come MySQL, PostgreSQL, SQLite e altri.

## Obiettivi

- Comprendere i concetti fondamentali degli ORM
- Imparare a configurare e utilizzare Sequelize
- Definire modelli e relazioni tra essi
- Eseguire operazioni CRUD utilizzando Sequelize
- Implementare migrazioni e seed per gestire lo schema del database
- Ottimizzare le query e gestire transazioni

## Prerequisiti

- Conoscenza di base di Node.js e npm
- Comprensione dei concetti di database relazionali
- Familiarità con JavaScript e Promises
- Un database MySQL installato e configurato

## Esercizi

### Esercizio 1: Configurazione di Sequelize

Crea un nuovo progetto Node.js e configura Sequelize per connettersi a un database MySQL.

1. Inizializza un nuovo progetto Node.js
2. Installa Sequelize e il driver MySQL
3. Crea un file di configurazione per la connessione al database
4. Verifica che la connessione funzioni correttamente

### Esercizio 2: Definizione di Modelli

Definisci modelli per rappresentare le entità del tuo database.

1. Crea un modello `User` con campi come `id`, `username`, `email`, `password`
2. Crea un modello `Post` con campi come `id`, `title`, `content`, `userId`
3. Definisci validatori e vincoli per i campi
4. Sincronizza i modelli con il database

### Esercizio 3: Relazioni tra Modelli

Implementa relazioni tra i modelli creati.

1. Definisci una relazione one-to-many tra `User` e `Post`
2. Crea un modello `Tag` e definisci una relazione many-to-many tra `Post` e `Tag`
3. Implementa l'eager loading per recuperare dati correlati

### Esercizio 4: Operazioni CRUD

Implementa le operazioni CRUD (Create, Read, Update, Delete) utilizzando Sequelize.

1. Crea funzioni per inserire nuovi utenti e post
2. Implementa query per recuperare dati con filtri e ordinamento
3. Crea funzioni per aggiornare e eliminare record

### Esercizio 5: Migrazioni e Seed

Utilizza le migrazioni per gestire lo schema del database e i seed per popolare il database con dati iniziali.

1. Crea migrazioni per definire lo schema del database
2. Implementa migrazioni per modificare lo schema esistente
3. Crea seed per inserire dati di esempio nel database

### Esercizio 6: Transazioni e Query Ottimizzate

Implementa transazioni e ottimizza le query per migliorare le prestazioni.

1. Utilizza transazioni per operazioni che coinvolgono più tabelle
2. Ottimizza le query utilizzando include, attributes e where
3. Implementa paginazione per gestire grandi quantità di dati

## Risorse Teoriche

- [Introduzione agli ORM](./teoria/01-introduzione-orm.md)
- [Sequelize: Configurazione e Modelli](./teoria/02-sequelize-configurazione.md)
- [Relazioni tra Modelli](./teoria/03-relazioni-modelli.md)
- [Migrazioni e Seed](./teoria/04-migrazioni-seed.md)
- [Query Avanzate e Ottimizzazione](./teoria/05-query-avanzate.md)

## Progetti Pratici

### Progetto 1: Blog API

Crea un'API RESTful per un blog utilizzando Express.js e Sequelize.

1. Implementa autenticazione e autorizzazione
2. Gestisci relazioni tra utenti, post e commenti
3. Implementa funzionalità di ricerca e filtro

### Progetto 2: E-commerce

Sviluppa un'applicazione e-commerce con gestione di prodotti, categorie, utenti e ordini.

1. Implementa un carrello della spesa
2. Gestisci il processo di checkout
3. Implementa un sistema di recensioni e valutazioni

## Conclusione

Gli ORM come Sequelize offrono un modo potente e flessibile per interagire con i database relazionali in Node.js. Padroneggiare questi strumenti ti permetterà di sviluppare applicazioni più robuste, manutenibili e scalabili, riducendo al contempo il tempo di sviluppo e la possibilità di errori.

Ricorda che, sebbene gli ORM offrano molti vantaggi, è importante comprendere anche le query SQL sottostanti per ottimizzare le prestazioni quando necessario e per risolvere problemi complessi che potrebbero sorgere.