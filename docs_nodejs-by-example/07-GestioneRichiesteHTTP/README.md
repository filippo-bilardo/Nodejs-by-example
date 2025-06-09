# Gestione delle Richieste HTTP in Node.js

## Descrizione
Questo modulo esplora le tecniche avanzate per la gestione delle richieste HTTP in applicazioni Node.js, con particolare attenzione ai metodi HTTP, alla gestione dei parametri URL, al parsing del body delle richieste e alla gestione dei form. Imparerai come un'applicazione Express può elaborare diversi tipi di richieste e dati in ingresso in modo efficiente e sicuro.

## Obiettivi di Apprendimento
- Comprendere i diversi metodi HTTP e il loro utilizzo appropriato
- Imparare a gestire i parametri URL e le query string
- Implementare il parsing del body delle richieste per diversi formati (JSON, form-data, ecc.)
- Creare form HTML e gestire i dati inviati al server
- Implementare la validazione dei dati in ingresso
- Gestire il caricamento di file

## Argomenti Teorici
- [Metodi HTTP e loro utilizzo](./teoria/01-metodi-http.md)
- [Gestione dei parametri URL](./teoria/02-parametri-url.md)
- [Body parsing e middleware](./teoria/03-body-parsing.md)
- [Gestione dei form e upload di file](./teoria/04-gestione-form.md)

## Esercizi Pratici

### Esercizio 1: API RESTful Base
Crea un'API RESTful semplice che supporti operazioni CRUD (Create, Read, Update, Delete) su una collezione di risorse (es. utenti, prodotti, ecc.). Implementa i metodi GET, POST, PUT e DELETE.

### Esercizio 2: Gestione Parametri URL
Crea un'applicazione che utilizzi parametri URL e query string per filtrare e ordinare una collezione di dati. Implementa endpoint che accettino diversi parametri di query.

### Esercizio 3: Form e Validazione
Crea un form HTML per la registrazione di un utente con campi come nome, email, password, ecc. Implementa la validazione lato server dei dati inviati e fornisci feedback appropriato all'utente.

### Esercizio 4: Upload di File
Implementa una funzionalità di upload di file (es. immagini, documenti) con validazione del tipo di file, dimensione massima e generazione di nomi di file unici.

### Esercizio 5: API Completa
Combina tutte le tecniche apprese per creare un'API completa che gestisca diversi tipi di richieste, parametri, body e file. Implementa anche la gestione degli errori e risposte appropriate.

## Risorse Aggiuntive
- [Documentazione Express.js](https://expressjs.com/)
- [Documentazione di body-parser](https://www.npmjs.com/package/body-parser)
- [Documentazione di multer per l'upload di file](https://www.npmjs.com/package/multer)
- [Documentazione di express-validator](https://express-validator.github.io/docs/)

## Conclusione
Al termine di questo modulo, sarai in grado di gestire efficacemente diversi tipi di richieste HTTP nelle tue applicazioni Node.js, elaborare dati in vari formati e implementare funzionalità comuni come la validazione dei dati e l'upload di file. Queste competenze sono fondamentali per lo sviluppo di API robuste e applicazioni web interattive.

## Navigazione del Corso

- [Indice del Corso](../README.md)
- [Modulo Precedente: Server Web](../06-ServerWeb/README.md)
- [Modulo Successivo: REST API](../08-REST_API/README.md)