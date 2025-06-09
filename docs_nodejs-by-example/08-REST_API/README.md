# REST API con Node.js

## Descrizione
Questo modulo esplora i principi e l'implementazione delle API REST (Representational State Transfer) utilizzando Node.js ed Express. Imparerai a progettare, sviluppare e testare API RESTful che seguono le migliori pratiche del settore, consentendo la creazione di servizi web scalabili e manutenibili.

## Obiettivi di Apprendimento
- Comprendere i principi fondamentali dell'architettura REST
- Progettare API RESTful con risorse, endpoint e metodi HTTP appropriati
- Implementare operazioni CRUD complete attraverso API
- Gestire l'autenticazione e l'autorizzazione nelle API
- Implementare la validazione dei dati e la gestione degli errori
- Documentare e testare le API REST

## Argomenti Teorici
- [Principi REST e architettura](./teoria/01-principi-rest.md)
- [Implementazione di API con Express](./teoria/02-implementazione-api.md)
- [Autenticazione e sicurezza](./teoria/03-autenticazione-sicurezza.md)
- [Documentazione e testing](./teoria/04-documentazione-testing.md)

## Esercizi Pratici

### Esercizio 1: API CRUD Base
Crea un'API RESTful che gestisca una collezione di risorse (es. prodotti, articoli, utenti) con supporto completo per operazioni CRUD (Create, Read, Update, Delete). Implementa endpoint appropriati per ciascuna operazione utilizzando i metodi HTTP corretti.

### Esercizio 2: Relazioni tra Risorse
Estendi l'API dell'esercizio 1 per gestire relazioni tra diverse risorse (es. utenti e post, prodotti e categorie). Implementa endpoint che permettano di navigare queste relazioni in modo RESTful.

### Esercizio 3: Autenticazione e Autorizzazione
Implementa un sistema di autenticazione per la tua API utilizzando JWT (JSON Web Tokens). Aggiungi autorizzazione basata sui ruoli per proteggere determinati endpoint e garantire che gli utenti possano accedere solo alle risorse appropriate.

### Esercizio 4: Validazione e Gestione Errori
Migliora la tua API con una robusta validazione dei dati in ingresso e una gestione degli errori coerente. Implementa risposte di errore standardizzate con codici HTTP appropriati e messaggi informativi.

### Esercizio 5: Documentazione API
Crea una documentazione completa per la tua API utilizzando strumenti come Swagger/OpenAPI. Assicurati che la documentazione includa tutti gli endpoint, i parametri, le risposte e gli esempi di utilizzo.

## Risorse Aggiuntive
- [Documentazione Express.js](https://expressjs.com/)
- [Specifiche OpenAPI](https://swagger.io/specification/)
- [Autenticazione con JWT](https://jwt.io/)
- [RESTful API Design Best Practices](https://restfulapi.net/)
- [Postman - Strumento per il testing delle API](https://www.postman.com/)

## Conclusione
Al termine di questo modulo, sarai in grado di progettare e implementare API RESTful robuste, sicure e ben documentate utilizzando Node.js ed Express. Queste competenze sono fondamentali per lo sviluppo di applicazioni web moderne, microservizi e architetture orientate ai servizi. Le API REST rappresentano uno standard de facto per la comunicazione tra client e server nel web moderno, e la padronanza di questi concetti ti permetterà di creare sistemi distribuiti efficienti e scalabili.

## Navigazione del Corso

- [Indice del Corso](../README.md)
- [Modulo Precedente: Gestione Richieste HTTP](../07-GestioneRichiesteHTTP/README.md)
- [Modulo Successivo: Middleware e Autenticazione](../09-Middleware-Autenticazione/README.md)