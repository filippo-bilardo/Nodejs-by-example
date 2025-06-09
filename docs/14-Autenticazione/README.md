# Esercitazione 14: Autenticazione e Autorizzazione in Node.js

## Introduzione

L'autenticazione e l'autorizzazione sono componenti fondamentali per la sicurezza delle applicazioni web moderne. Questa esercitazione esplora le diverse strategie e tecnologie per implementare sistemi di autenticazione robusti e sicuri in applicazioni Node.js.

L'autenticazione verifica l'identità di un utente, mentre l'autorizzazione determina quali azioni può compiere un utente autenticato. Implementare correttamente questi meccanismi è essenziale per proteggere dati sensibili e garantire che gli utenti possano accedere solo alle risorse appropriate.

## Obiettivi

- Comprendere i concetti fondamentali di autenticazione e autorizzazione
- Implementare diverse strategie di autenticazione in Node.js
- Utilizzare JWT (JSON Web Tokens) per gestire sessioni e autorizzazioni
- Integrare OAuth e autenticazione social nelle applicazioni
- Applicare best practices di sicurezza per proteggere le credenziali degli utenti

## Materiale Teorico

- [Fondamenti di Autenticazione e Autorizzazione](./teoria/01-fondamenti-autenticazione.md)
- [JSON Web Tokens (JWT)](./teoria/02-jwt.md)
- [Strategie di Autenticazione con Passport.js](./teoria/03-passport-strategie.md)
- [OAuth e Autenticazione Social](./teoria/04-oauth-social.md)
- [Gestione delle Sessioni](./teoria/05-gestione-sessioni.md)
- [Best Practices di Sicurezza](./teoria/06-sicurezza-best-practices.md)

## Esercizi Pratici

### Esercizio 1: Sistema di Autenticazione Locale

Implementa un sistema di autenticazione completo con Express.js che includa:

- Registrazione utente con validazione dei dati
- Hashing sicuro delle password con bcrypt
- Login con generazione di JWT
- Middleware per proteggere le rotte
- Gestione del logout e invalidazione dei token

### Esercizio 2: Autenticazione Multi-Strategia con Passport.js

Estendi il sistema di autenticazione utilizzando Passport.js per supportare:

- Autenticazione locale (username/password)
- Autenticazione con Google OAuth
- Autenticazione con GitHub
- Gestione unificata dei profili utente

### Esercizio 3: Sistema di Autorizzazione Basato sui Ruoli

Implementa un sistema di autorizzazione che:

- Definisca diversi ruoli utente (es. utente, moderatore, amministratore)
- Utilizzi middleware per verificare i permessi basati sui ruoli
- Implementi controlli di accesso granulari a livello di risorsa
- Gestisca correttamente gli errori di autorizzazione

### Esercizio 4: Gestione Avanzata delle Sessioni

Crea un sistema di gestione delle sessioni che includa:

- Implementazione di refresh token
- Rilevamento e prevenzione del furto di sessione
- Meccanismo di "remember me"
- Scadenza automatica delle sessioni inattive

## Risorse Aggiuntive

- [Documentazione ufficiale di Passport.js](http://www.passportjs.org/)
- [Specifiche JWT](https://jwt.io/introduction/)
- [OWASP - Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OAuth 2.0 - Guida per sviluppatori](https://oauth.net/2/)

## Progetti di Esempio

- [Auth0 Express Sample](https://github.com/auth0-samples/auth0-express-webapp-sample)
- [Node.js & Passport Login System](https://github.com/bradtraversy/node_passport_login)

## Conclusione

Implementare un sistema di autenticazione e autorizzazione robusto è fondamentale per qualsiasi applicazione web moderna. Le competenze acquisite in questa esercitazione ti permetteranno di creare sistemi sicuri che proteggono i dati degli utenti e garantiscono l'accesso appropriato alle risorse dell'applicazione.

Ricorda che la sicurezza è un processo continuo, non un prodotto finito. Mantieniti aggiornato sulle ultime best practices e vulnerabilità di sicurezza per garantire che i tuoi sistemi rimangano protetti nel tempo.