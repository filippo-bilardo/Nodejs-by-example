# Esercizi Express.js

Questa cartella contiene esercizi pratici per consolidare le competenze in Express.js.

## Struttura Esercizi

Ogni esercizio include:
- 📋 **README.md** - Descrizione e requisiti
- ✅ **Soluzione** - Cartella con soluzione completa (da consultare dopo il tentativo)
- 📝 **Test** - Come verificare se l'esercizio è corretto

---

## Elenco Esercizi

### Esercizio 01: Server Base con Route Multiple
**Livello:** Principiante  
**Cartella:** `01-server-base/`

Crea un server Express con route base:
- Home, About, Contact
- Parametri URL
- Query string
- 404 handler

---

### Esercizio 02: API To-Do List
**Livello:** Principiante/Intermedio  
**Cartella:** `02-todo-api/`

Implementa un'API REST per gestire una lista di attività:
- CRUD completo (Create, Read, Update, Delete)
- Validazione input
- Codici di stato HTTP corretti

---

### Esercizio 03: Sistema di Autenticazione
**Livello:** Intermedio  
**Cartella:** `03-autenticazione/`

Crea un sistema di autenticazione base:
- Registrazione utenti
- Login con token
- Route protette con middleware
- Logout

---

### Esercizio 04: Blog API
**Livello:** Intermedio  
**Cartella:** `04-blog-api/`

API completa per un blog:
- Gestione post (CRUD)
- Gestione commenti
- Categorie e tag
- Paginazione e ricerca

---

### Esercizio 05: File Upload
**Livello:** Intermedio/Avanzato  
**Cartella:** `05-file-upload/`

Sistema di upload file:
- Upload singolo e multiplo
- Validazione tipo file
- Limite dimensione
- Gestione storage

---

### Esercizio 06: E-commerce API
**Livello:** Avanzato  
**Cartella:** `06-ecommerce-api/`

API per e-commerce con:
- Prodotti con categorie
- Carrello acquisti
- Ordini
- Gestione scorte

---

## Come Affrontare gli Esercizi

### 1. Leggi i Requisiti
Ogni esercizio ha un README con:
- Obiettivi di apprendimento
- Requisiti funzionali
- Suggerimenti

### 2. Implementa la Soluzione
```bash
cd esercizi/01-server-base
# Crea i tuoi file
touch app.js
npm init -y
npm install express
```

### 3. Testa la Soluzione
Usa curl o Postman per testare:
```bash
curl http://localhost:3000/
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

### 4. Confronta con la Soluzione
Solo dopo aver provato, consulta la cartella `soluzione/`:
```bash
cd soluzione
cat app.js
```

---

## Criteri di Valutazione

Per ogni esercizio, verifica:

### ✅ Funzionalità
- [ ] Tutti gli endpoint funzionano
- [ ] Validazione input corretta
- [ ] Gestione errori appropriata

### ✅ Codice
- [ ] Codice pulito e leggibile
- [ ] Commenti dove necessario
- [ ] Nomi variabili significativi
- [ ] Struttura organizzata

### ✅ Best Practices
- [ ] Uso corretto middleware
- [ ] Codici di stato HTTP appropriati
- [ ] Validazione parametri
- [ ] Error handling centralizzato

---

## Progressione Consigliata

**Principiante:**
1. Esercizio 01 - Server Base
2. Esercizio 02 - To-Do API

**Intermedio:**
3. Esercizio 03 - Autenticazione
4. Esercizio 04 - Blog API

**Avanzato:**
5. Esercizio 05 - File Upload
6. Esercizio 06 - E-commerce API

---

## Risorse Utili

- [Teoria Express](../teoria/)
- [Esempi Pratici](../esempi/)
- [Documentazione Express](https://expressjs.com/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [Postman](https://www.postman.com/)

---

## Supporto

Se hai difficoltà:
1. Rileggi la teoria corrispondente
2. Consulta gli esempi
3. Cerca nella documentazione Express
4. Solo dopo, guarda la soluzione

**Ricorda:** L'obiettivo è imparare, non solo completare gli esercizi!
