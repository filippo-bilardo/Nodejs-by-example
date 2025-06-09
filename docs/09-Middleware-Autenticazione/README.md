# Esercitazione 9: Middleware e Autenticazione in Express

## Descrizione
Questa esercitazione si concentra sull'implementazione di middleware in Express.js e sulla creazione di sistemi di autenticazione sicuri per le API. Imparerai come utilizzare i middleware per gestire richieste, implementare l'autenticazione con JWT (JSON Web Tokens) e proteggere le tue API REST.

## Obiettivi
- Comprendere il concetto di middleware in Express.js
- Implementare middleware personalizzati per diverse funzionalità
- Creare un sistema di autenticazione basato su JWT
- Proteggere le rotte delle API con middleware di autenticazione
- Implementare best practices di sicurezza per le API

## Prerequisiti
- Conoscenza di base di Node.js e Express.js
- Comprensione dei concetti REST API (vedi [Esercitazione 8](../08-REST_API))
- Familiarità con JavaScript asincrono e Promises

## Materiale Teorico
- [Middleware in Express](./teoria/01-middleware-express.md)
- [Autenticazione e Autorizzazione](./teoria/02-autenticazione-autorizzazione.md)
- [JWT (JSON Web Tokens)](./teoria/03-jwt.md)
- [Sicurezza delle API](./teoria/04-sicurezza-api.md)

## Esercizi Pratici

### Esercizio 1: Middleware di Base
Crea un'applicazione Express con i seguenti middleware personalizzati:
- Logger che registra informazioni sulle richieste (metodo, URL, timestamp)
- Middleware per la gestione degli errori
- Middleware per la validazione dei dati in ingresso

### Esercizio 2: Sistema di Autenticazione
Implementa un sistema di autenticazione completo con:
- Registrazione utente
- Login con generazione di JWT
- Middleware di protezione delle rotte
- Gestione del refresh token

### Esercizio 3: API Protetta
Crea una semplice API RESTful con risorse protette:
- Endpoint pubblici accessibili a tutti
- Endpoint protetti accessibili solo agli utenti autenticati
- Endpoint con autorizzazione basata su ruoli (admin, user)

### Esercizio 4: Sicurezza Avanzata
Migliora la sicurezza dell'API implementando:
- Rate limiting per prevenire attacchi di forza bruta
- Validazione e sanitizzazione degli input
- Headers di sicurezza (CORS, Content-Security-Policy, ecc.)
- Gestione sicura delle password (hashing con bcrypt)

## Risorse Aggiuntive
- [Documentazione ufficiale di Express.js sui middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Documentazione di JWT](https://jwt.io/introduction)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Libreria bcrypt per Node.js](https://www.npmjs.com/package/bcrypt)
- [Libreria express-rate-limit](https://www.npmjs.com/package/express-rate-limit)

## Consegna
Per completare l'esercitazione, crea un repository GitHub contenente:
- Il codice sorgente dell'applicazione
- Un file README.md con istruzioni per l'installazione e l'utilizzo
- Documentazione delle API implementate
- Test unitari per i middleware e le funzionalità di autenticazione

## Navigazione del Corso

- [Indice del Corso](../README.md)
- [Modulo Precedente: REST API](../08-REST_API/README.md)
- [Modulo Successivo: Template Engine](../10-TemplateEngine/README.md)