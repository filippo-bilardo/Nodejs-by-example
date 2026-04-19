# ESERCITAZIONE LABORATORIO
## Web Service con Node.js, Express e Docker

**Corso di Sistemi Distribuiti | Anno Accademico 2024/2025**

---

| Campo        | Dettaglio |
|--------------|-----------|
| Durata       | 3 ore (laboratorio individuale o in coppia) |
| Prerequisiti | Basi di Linux, HTTP, JavaScript ES6+, account GitHub gratuito |
| Stack        | Node.js 20 LTS · Express 4 · node-fetch · Docker · GitHub Codespace |
| Consegna     | Repository GitHub pubblico + Relazione PDF entro 7 giorni |
| Valutazione  | 30 punti (teoria 10 pt · pratica 15 pt · bonus 5 pt) |

---

## 1. Background Teorico

### 1.1 Node.js: JavaScript lato server

Node.js è un runtime open-source che esegue JavaScript al di fuori del browser, basato sul motore V8 di Google Chrome. La sua caratteristica distintiva è il modello di I/O non bloccante e guidato dagli eventi (**event-driven, non-blocking I/O**), che lo rende estremamente efficiente per applicazioni di rete ad alta concorrenza come i web service.

> **Concetto chiave — Event Loop:** Node.js gestisce le operazioni asincrone (lettura file, query DB, chiamate HTTP) tramite un singolo thread e una coda di eventi. Quando un'operazione I/O si completa, la sua callback viene accodata e processata. Nessun thread rimane bloccato ad aspettare, a differenza dei server tradizionali multi-thread.

Componenti fondamentali dell'ecosistema Node.js usati nell'esercitazione:

- **npm** (Node Package Manager): gestore dei pacchetti, analogia con pip in Python. Legge le dipendenze da `package.json`.
- **package.json**: manifesto del progetto: nome, versione, script di avvio, dipendenze.
- **Express.js**: framework minimalista per costruire server HTTP e API REST in poche righe.
- **node-fetch**: libreria per effettuare richieste HTTP dal lato client (analoga a `requests` in Python).
- **nodemon**: tool di sviluppo che riavvia automaticamente il server al cambio dei sorgenti.

---

### 1.2 Express.js: routing e middleware

Express aggiunge a Node.js un sistema di routing (associazione URL → handler) e una pipeline di middleware. Un **middleware** è una funzione che riceve la richiesta (`req`), la risposta (`res`) e la funzione `next()` per passare al middleware successivo.

```javascript
// Anatomia di un'applicazione Express minimale
const express = require('express');
const app = express();

// Middleware globale: parsing del body JSON
app.use(express.json());

// Route handler: GET /saluto
app.get('/saluto', (req, res) => {
    res.status(200).json({ messaggio: 'Ciao dal server!' });
});

// Avvio del server sulla porta 3000
app.listen(3000, () => console.log('Server attivo sulla porta 3000'));
```

---

### 1.3 I Web Service REST: riepilogo

REST (Representational State Transfer) è uno stile architetturale per sistemi distribuiti che sfrutta il protocollo HTTP. Ogni risorsa è identificata da un URI univoco; le operazioni su di essa usano i metodi HTTP standard.

| Metodo HTTP | Operazione CRUD | Idempotente | Esempio Express               |
|-------------|-----------------|-------------|-------------------------------|
| GET         | Read            | Sì          | `app.get('/libri/:id', ...)`  |
| POST        | Create          | No          | `app.post('/libri', ...)`     |
| PUT         | Update          | Sì          | `app.put('/libri/:id', ...)`  |
| PATCH       | Partial Update  | No          | `app.patch('/libri/:id', ...)`|
| DELETE      | Delete          | Sì          | `app.delete('/libri/:id', ...)`|

---

### 1.4 Architettura a due container: API REST + Server Web

L'esercitazione prevede due container Node.js con ruoli distinti che collaborano attraverso una rete Docker dedicata:

|               | Container 1: api-server                | Container 2: web-client                      |
|---------------|----------------------------------------|----------------------------------------------|
| **Ruolo**     | Server REST (backend)                  | Server Web + client HTTP (frontend/tester)   |
| **Porta**     | 3000                                   | 4000                                         |
| **Stack**     | Node.js + Express                      | Node.js + Express + node-fetch               |
| **Funzione**  | CRUD libri in memoria                  | Interfaccia HTML + chiamate all'API          |
| **Accesso**   | curl / browser :3000                   | browser :4000                                |

> **Architettura:** Codespace VM → Docker Engine → `[ws-network]` → `api-server:3000` (REST JSON) ←→ `web-client:4000` (HTML + fetch). Il browser accede a entrambi i servizi tramite port forwarding di Codespace.

---

### 1.5 Docker e Docker Compose: riepilogo

Docker incapsula l'applicazione con tutte le sue dipendenze in un'immagine riproducibile. Docker Compose orchestra più container con un singolo comando, definendo reti, volumi e dipendenze in un file YAML.

> **Best practice Dockerfile Node.js:**
> 1. Usare l'immagine `node:20-alpine` (~60 MB vs ~900 MB di `node:20`).
> 2. Copiare prima `package.json` ed eseguire `npm install` prima del codice sorgente, per sfruttare il layer caching.
> 3. Usare un utente non-root (`USER node`).
> 4. Preferire `npm ci` a `npm install` in produzione.

---

## 2. Obiettivi dell'Esercitazione

Al termine lo studente sarà in grado di:

1. Configurare un GitHub Codespace con devcontainer minimale e Docker-in-Docker.
2. Scrivere un server REST con Node.js ed Express che espone endpoint CRUD.
3. Scrivere un secondo container Node.js che funge da server web e client HTTP dell'API.
4. Containerizzare entrambi i servizi con Dockerfile ottimizzati (alpine + layer caching).
5. Orchestrare i due container con Docker Compose (rete bridge, healthcheck, depends_on).
6. Testare l'API tramite curl e interfaccia web HTML.
7. Analizzare il flusso di dati JSON tra i container e interpretare gli status HTTP.

---

## 3. Struttura del Repository

```
ws-node-lab/
├── .devcontainer/
│   └── devcontainer.json          # Codespace: immagine base + Docker-in-Docker
├── api-server/                    # Container 1: REST API
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── server.js              # Express REST: GET/POST/PUT/PATCH/DELETE /libri
├── web-client/                    # Container 2: Server web + client HTTP
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   └── index.html             # Interfaccia utente (fetch API)
│   └── src/
│       └── app.js                 # Express server: serve HTML + proxy SSR
├── docker-compose.yml
└── README.md
```

---

## 4. Svolgimento Guidato

### FASE 1 — Configurazione Codespace (15 min)

#### Passo 1.1 — Repository e devcontainer

1. Creare su github.com un repository pubblico chiamato `ws-node-lab`, con README.
2. Aprirlo con Codespace: pulsante **"Code"** → **"Codespaces"** → **"Create codespace on main"**.
3. Nel terminale integrato, creare il devcontainer:

```bash
mkdir -p .devcontainer
cat > .devcontainer/devcontainer.json << 'EOF'
{
  "name": "Node WS Lab",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu-22.04",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {
      "version": "latest",
      "moby": "true"
    },
    "ghcr.io/devcontainers/features/node:1": {
      "version": "20"
    }
  },
  "forwardPorts": [3000, 4000],
  "portsAttributes": {
    "3000": { "label": "API REST Server" },
    "4000": { "label": "Web Client" }
  },
  "postCreateCommand": "node --version && docker --version && docker compose version"
}
EOF
```

> **Tip:** Accettare la ricostruzione del container proposta da VS Code. Dopo il riavvio, il terminale avrà Node 20, npm e Docker disponibili. Verificare con: `node --version && docker --version`

---

### FASE 2 — Container 1: API REST Server con Express (50 min)

#### Passo 2.1 — package.json e dipendenze

```bash
mkdir -p api-server/src
cat > api-server/package.json << 'EOF'
{
  "name": "api-server",
  "version": "1.0.0",
  "description": "REST API per catalogo libri",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev":   "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
EOF
```

#### Passo 2.2 — Il server REST (src/server.js)

Il server espone un'API RESTful completa per la gestione di un catalogo libri. I dati sono tenuti in un semplice `Map` JavaScript in memoria.

```bash
cat > api-server/src/server.js << 'EOF'
const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────
app.use(cors());           // Consente richieste cross-origin dal web-client
app.use(express.json());   // Parsing automatico del body JSON

// ── Database in memoria ─────────────────────────────────
let nextId = 4;
const libri = new Map([
  [1, { id:1, titolo:'Clean Code',              autore:'R. Martin',    anno:2008 }],
  [2, { id:2, titolo:'The Pragmatic Programmer', autore:'Hunt & Thomas',anno:1999 }],
  [3, { id:3, titolo:'Design Patterns',          autore:'Gang of Four', anno:1994 }],
]);

// ── Utility: risposta errore ─────────────────────────────
const notFound = (res, id) =>
  res.status(404).json({ errore: `Libro con id=${id} non trovato` });

// ── GET / — root ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    servizio: 'Libreria API',
    versione: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: ['GET /libri','POST /libri','GET /libri/:id',
                'PUT /libri/:id','PATCH /libri/:id','DELETE /libri/:id']
  });
});

// ── GET /libri — elenco completo ─────────────────────────
app.get('/libri', (req, res) => {
  res.json([...libri.values()]);
});

// ── GET /libri/:id — singolo libro ───────────────────────
app.get('/libri/:id', (req, res) => {
  const id = parseInt(req.params.id);
  libri.has(id) ? res.json(libri.get(id)) : notFound(res, id);
});

// ── POST /libri — crea nuovo ──────────────────────────────
app.post('/libri', (req, res) => {
  const { titolo, autore, anno } = req.body;
  if (!titolo || !autore || !anno)
    return res.status(400).json({ errore: 'Campi obbligatori: titolo, autore, anno' });
  const libro = { id: nextId++, titolo, autore, anno: Number(anno) };
  libri.set(libro.id, libro);
  res.status(201).json(libro);
});

// ── PUT /libri/:id — aggiornamento completo ───────────────
app.put('/libri/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!libri.has(id)) return notFound(res, id);
  const { titolo, autore, anno } = req.body;
  if (!titolo || !autore || !anno)
    return res.status(400).json({ errore: 'Campi obbligatori: titolo, autore, anno' });
  const aggiornato = { id, titolo, autore, anno: Number(anno) };
  libri.set(id, aggiornato);
  res.json(aggiornato);
});

// ── PATCH /libri/:id — aggiornamento parziale ─────────────
app.patch('/libri/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!libri.has(id)) return notFound(res, id);
  const parziale = { ...libri.get(id), ...req.body, id };
  libri.set(id, parziale);
  res.json(parziale);
});

// ── DELETE /libri/:id ─────────────────────────────────────
app.delete('/libri/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (!libri.has(id)) return notFound(res, id);
  libri.delete(id);
  res.status(204).send();   // 204 No Content: successo senza body
});

// ── Avvio ─────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`[api-server] In ascolto su http://0.0.0.0:${PORT}`)
);
EOF
```

#### Passo 2.3 — Dockerfile del server REST

```bash
cat > api-server/Dockerfile << 'EOF'
# Immagine base minimale: Node 20 Alpine (~60 MB)
FROM node:20-alpine

# Utente non-root per sicurezza
USER node
WORKDIR /home/node/app

# PRIMA le dipendenze (sfrutta il layer cache di Docker)
COPY --chown=node:node package.json .
RUN npm install --omit=dev

# POI il codice sorgente
COPY --chown=node:node src/ ./src/

EXPOSE 3000
CMD ["node", "src/server.js"]
EOF
```

> **Best practice — `--omit=dev`:** In produzione installiamo solo le dipendenze di runtime (`express`, `cors`), NON quelle di sviluppo (`nodemon`). L'immagine risultante è più piccola e sicura.

---

### FASE 3 — Container 2: Web Client con Express (50 min)

Il secondo container ha un doppio ruolo: serve una pagina HTML statica al browser e, tramite node-fetch, effettua chiamate server-side all'API REST.

#### Passo 3.1 — package.json

```bash
mkdir -p web-client/src web-client/public
cat > web-client/package.json << 'EOF'
{
  "name": "web-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": { "start": "node src/app.js" },
  "dependencies": {
    "express": "^4.19.2",
    "node-fetch": "^3.3.2"
  }
}
EOF
```

#### Passo 3.2 — Server Express (src/app.js)

```bash
cat > web-client/src/app.js << 'EOF'
import express from 'express';
import fetch   from 'node-fetch';
import path    from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app       = express();
// L'hostname 'api-server' è il nome del servizio in docker-compose.yml
const API_URL   = process.env.API_URL || 'http://api-server:3000';
const PORT      = process.env.PORT    || 4000;

// Serve i file statici dalla cartella public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// Endpoint proxy: recupera lo stato dell'API via node-fetch (server-to-server)
app.get('/api-status', async (req, res) => {
  try {
    const risposta = await fetch(`${API_URL}/`);
    const dati     = await risposta.json();
    res.json({ stato: 'OK', api: dati });
  } catch (err) {
    res.status(503).json({ stato: 'ERRORE', messaggio: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`[web-client] In ascolto su http://0.0.0.0:${PORT}`)
);
EOF
```

#### Passo 3.3 — Interfaccia HTML (public/index.html)

La pagina usa il Fetch API nativo del browser per chiamare l'API REST direttamente. L'URL usa `localhost:3000` perché il browser accede tramite il port forwarding del Codespace.

```bash
cat > web-client/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>Libreria API — Client Web</title>
  <style>
    body  { font-family: Arial, sans-serif; max-width: 860px;
            margin: 2rem auto; padding: 0 1rem; background: #f5f5f5; }
    h1    { color: #1F4E79; }
    h2    { color: #C55A11; border-bottom: 2px solid #C55A11; }
    .card { background: #fff; border-radius: 8px; padding: 1rem;
            margin: .5rem 0; box-shadow: 0 2px 4px rgba(0,0,0,.1); }
    input { padding: .4rem; margin: .3rem; border: 1px solid #ccc;
            border-radius: 4px; width: 200px; }
    button { padding: .5rem 1rem; background: #1F4E79; color: #fff;
             border: none; border-radius: 4px; cursor: pointer; }
    button:hover { background: #C55A11; }
    pre   { background: #1e1e1e; color: #d4d4d4; padding: 1rem;
            border-radius: 6px; overflow-x: auto; font-size: .85rem; }
  </style>
</head>
<body>
  <h1>Libreria API — Client Web</h1>
  <p>Interfaccia per testare il server REST su <code>http://localhost:3000</code></p>

  <h2>GET — Elenco libri</h2>
  <div class="card">
    <button onclick="getLibri()">Carica tutti i libri</button>
    <pre id="out-get"></pre>
  </div>

  <h2>POST — Aggiungi libro</h2>
  <div class="card">
    <input id="titolo" placeholder="Titolo">
    <input id="autore" placeholder="Autore">
    <input id="anno"   placeholder="Anno" type="number">
    <button onclick="postLibro()">Crea</button>
    <pre id="out-post"></pre>
  </div>

  <h2>PUT — Aggiorna libro completo</h2>
  <div class="card">
    <input id="put-id"     placeholder="ID" type="number">
    <input id="put-titolo" placeholder="Titolo">
    <input id="put-autore" placeholder="Autore">
    <input id="put-anno"   placeholder="Anno" type="number">
    <button onclick="putLibro()">Aggiorna</button>
    <pre id="out-put"></pre>
  </div>

  <h2>DELETE — Elimina libro</h2>
  <div class="card">
    <input id="del-id" placeholder="ID libro" type="number">
    <button onclick="deleteLibro()">Elimina</button>
    <pre id="out-del"></pre>
  </div>

  <script>
    const BASE = 'http://localhost:3000';
    const show = (id, data) =>
      document.getElementById(id).textContent = JSON.stringify(data, null, 2);

    async function getLibri() {
      const r = await fetch(`${BASE}/libri`);
      show('out-get', await r.json());
    }
    async function postLibro() {
      const body = {
        titolo: document.getElementById('titolo').value,
        autore: document.getElementById('autore').value,
        anno:   +document.getElementById('anno').value
      };
      const r = await fetch(`${BASE}/libri`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      show('out-post', await r.json());
    }
    async function putLibro() {
      const id   = document.getElementById('put-id').value;
      const body = {
        titolo: document.getElementById('put-titolo').value,
        autore: document.getElementById('put-autore').value,
        anno:   +document.getElementById('put-anno').value
      };
      const r = await fetch(`${BASE}/libri/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      show('out-put', r.status === 204 ? { ok: true } : await r.json());
    }
    async function deleteLibro() {
      const id = document.getElementById('del-id').value;
      const r  = await fetch(`${BASE}/libri/${id}`, { method: 'DELETE' });
      show('out-del', { status: r.status, ok: r.ok });
    }
  </script>
</body>
</html>
EOF
```

#### Passo 3.4 — Dockerfile del web-client

```bash
cat > web-client/Dockerfile << 'EOF'
FROM node:20-alpine
USER node
WORKDIR /home/node/app

# Copia prima package.json per sfruttare il layer cache
COPY --chown=node:node package.json .
RUN npm install --omit=dev

# Poi codice sorgente e asset statici
COPY --chown=node:node src/    ./src/
COPY --chown=node:node public/ ./public/

EXPOSE 4000
CMD ["node", "src/app.js"]
EOF
```

---

### FASE 4 — Docker Compose (20 min)

#### Passo 4.1 — Orchestrazione multi-container

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:

  api-server:
    build: ./api-server
    container_name: libreria-api
    ports:
      - '3000:3000'
    environment:
      - PORT=3000
    networks:
      - ws-network
    healthcheck:
      test: ['CMD-SHELL', 'wget -qO- http://localhost:3000/ || exit 1']
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 5s

  web-client:
    build: ./web-client
    container_name: libreria-web
    ports:
      - '4000:4000'
    environment:
      - PORT=4000
      - API_URL=http://api-server:3000
    networks:
      - ws-network
    depends_on:
      api-server:
        condition: service_healthy

networks:
  ws-network:
    driver: bridge
EOF
```

> **Concetto chiave — variabile d'ambiente `API_URL`:** Il web-client riceve l'URL dell'API come variabile d'ambiente. All'interno della rete Docker il nome `api-server` è un hostname valido. In produzione basterebbe cambiare `API_URL` senza ricompilare l'immagine.

---

### FASE 5 — Esecuzione e Test (35 min)

#### Passo 5.1 — Build e avvio

```bash
# Costruisce entrambe le immagini e avvia i container
docker compose up --build

# In un secondo terminale
docker ps                          # Verifica container attivi
docker compose logs api-server     # Log del server REST
docker compose logs web-client     # Log del server web
docker images | grep libreria      # Dimensioni immagini
```

#### Passo 5.2 — Test con curl (terminale Codespace)

```bash
# Root: informazioni sul servizio
curl -s http://localhost:3000/

# Lista tutti i libri
curl -s http://localhost:3000/libri

# Crea un nuovo libro (POST)
curl -s -X POST http://localhost:3000/libri \
     -H 'Content-Type: application/json' \
     -d '{"titolo":"SICP","autore":"Abelson","anno":1984}'

# Aggiornamento parziale (PATCH)
curl -s -X PATCH http://localhost:3000/libri/1 \
     -H 'Content-Type: application/json' \
     -d '{"anno":2009}'

# Elimina (DELETE) — risposta 204 No Content
curl -s -o /dev/null -w '%{http_code}' -X DELETE http://localhost:3000/libri/2

# Test proxy server-to-server (web-client → api-server)
curl -s http://localhost:4000/api-status
```

#### Passo 5.3 — Test tramite interfaccia web

1. Aprire nel browser: `http://localhost:4000`
2. Usare il pulsante **"Carica tutti i libri"** e osservare il JSON in risposta.
3. Inserire titolo, autore e anno e cliccare **"Crea"**: verificare status `201`.
4. Aggiornare un libro esistente con PUT e verificare la risposta.
5. Eliminare un libro e ricaricare l'elenco per confermare la cancellazione.

#### Passo 5.4 — Ispezione della rete Docker

```bash
# Visualizza i container sulla rete ws-network
docker network inspect ws-node-lab_ws-network

# Entra nel web-client e testa la comunicazione interna
docker exec -it libreria-web sh
# Dentro il container (usa il nome DNS interno):
wget -qO- http://api-server:3000/libri
exit

# Ferma tutto e rimuovi i container
docker compose down
```

---

## 5. Domande a Scelta Multipla per Autovalutazione

> Rispondere autonomamente prima di consultare la Sezione 7.

**Domanda 1:** Qual è la caratteristica principale del modello I/O di Node.js rispetto a un server web multi-thread tradizionale?

- A) Node.js usa più thread per ogni richiesta HTTP
- B) Node.js usa un singolo thread con I/O non bloccante guidato dagli eventi
- C) Node.js non supporta operazioni asincrone
- D) Node.js crea un processo separato per ogni richiesta

**Domanda 2:** Nel codice Express, cosa fa `app.use(express.json())` posizionato prima delle route?

- A) Serializza automaticamente gli oggetti JS in JSON nelle risposte
- B) Deserializza il body delle richieste con `Content-Type: application/json` in `req.body`
- C) Valida che il body sia JSON valido e restituisce 400 altrimenti
- D) Imposta l'header `Content-Type: application/json` su tutte le risposte

**Domanda 3:** Quale metodo HTTP è semanticamente corretto per un aggiornamento parziale (es. modificare solo l'anno di un libro)?

- A) POST
- B) PUT
- C) PATCH
- D) GET con query string

**Domanda 4:** Nel Dockerfile, perché si copia `package.json` e si esegue `npm install` PRIMA di copiare il codice sorgente?

- A) È un requisito di npm: deve essere eseguito prima del COPY
- B) Per sfruttare il layer caching: se `package.json` non cambia, Docker riusa il layer npm install dalla cache
- C) Per ridurre i permessi del filesystem
- D) Perché npm install modifica package.json e sovrascriverebbero il sorgente

**Domanda 5:** Nel `docker-compose.yml`, la variabile `API_URL=http://api-server:3000` usa `api-server` come hostname. Cosa lo rende valido?

- A) È configurato manualmente nel file `/etc/hosts` del container
- B) Docker Compose crea un server DNS interno alla rete bridge: il nome del servizio diventa un record A
- C) `api-server` è un alias predefinito di `localhost`
- D) Funziona solo se i container sono sullo stesso host fisico

**Domanda 6:** L'endpoint `DELETE /libri/:id` risponde con status `204`. Cosa implica questo status HTTP?

- A) La risorsa non è stata trovata
- B) La richiesta è in elaborazione asincrona
- C) L'operazione è riuscita ma la risposta non contiene body
- D) La risorsa è stata spostata permanentemente

**Domanda 7:** Perché il middleware `cors()` è necessario nel server REST quando il client HTML fa richieste `fetch` dal browser?

- A) Perché Express non supporta JSON senza cors
- B) Perché il browser blocca richieste verso origini diverse (porta diversa) senza gli header CORS corretti
- C) Perché Docker blocca le connessioni tra container senza cors
- D) CORS è necessario solo per le richieste HTTPS

**Domanda 8:** Quale vantaggio offre l'immagine base `node:20-alpine` rispetto a `node:20` in un Dockerfile di produzione?

- A) Alpine supporta più architetture CPU
- B) Alpine include nodemon preinstallato
- C) L'immagine Alpine è drasticamente più piccola (~60 MB vs ~950 MB), riducendo i tempi di pull e la superficie di attacco
- D) `node:20-alpine` include TypeScript già compilato

---

## 6. Criteri di Consegna e Valutazione

| Criterio                                            | Punti | Indicatori                                      |
|-----------------------------------------------------|-------|-------------------------------------------------|
| Comprensione teorica (risposte + relazione)         | 10    | Risposte corrette + spiegazioni accurate        |
| API REST funzionante (tutti i metodi HTTP)          | 5     | GET/POST/PUT/PATCH/DELETE rispondono correttamente |
| Dockerfile ottimizzati (alpine, layer cache)        | 4     | Build senza errori, best practice rispettate    |
| Web client HTML funzionante                         | 3     | Pagina carica e interagisce con l'API           |
| docker-compose.yml con healthcheck e env vars       | 3     | Healthcheck configurato, API_URL via env        |
| **Bonus:** autenticazione con header Bearer token   | 2     | Middleware auth nel server REST                 |
| **Bonus:** logging strutturato (morgan o custom)    | 1     | Ogni richiesta loggata con metodo, path, status |
| **Bonus:** README con schema e curl examples        | 2     | Documentazione completa e schema architetturale |

---

## 7. Risposte alle Domande di Autovalutazione

> ⚠️ Consultare questa sezione **SOLO** dopo aver risposto autonomamente alla Sezione 5.

| Dom. | Risposta | Spiegazione |
|------|----------|-------------|
| 1    | **B**    | Node.js usa un singolo event loop thread. Quando arriva una richiesta I/O, la delega al sistema operativo (libuv) e continua a processare altre richieste. Il callback viene chiamato quando il risultato è pronto. |
| 2    | **B**    | `express.json()` è un middleware di parsing: legge il body raw della richiesta, lo decodifica come JSON e lo rende disponibile in `req.body`. Senza di esso, `req.body` è `undefined`. |
| 3    | **C**    | PATCH è il metodo semantico per aggiornamenti parziali: si inviano solo i campi da modificare. PUT richiede la rappresentazione completa della risorsa (sovrascrittura totale). |
| 4    | **B**    | Il layer caching di Docker funziona riga per riga. Se `package.json` non cambia tra una build e l'altra, il layer `RUN npm install` viene riutilizzato dalla cache, riducendo il tempo di build da minuti a secondi. |
| 5    | **B**    | Docker Compose crea un network bridge con un resolver DNS integrato. Ogni servizio viene registrato con il proprio nome: `api-server` diventa un hostname risolvibile dagli altri container sulla stessa rete. |
| 6    | **C**    | HTTP 204 No Content indica che l'operazione è riuscita ma non c'è contenuto da restituire nel body. È il codice semanticamente corretto per un DELETE andato a buon fine. |
| 7    | **B**    | La Same-Origin Policy del browser blocca le richieste a origini diverse (dominio, protocollo o porta differente). CORS permette al server di autorizzare esplicitamente origini esterne tramite header HTTP. |
| 8    | **C**    | Alpine Linux è una distribuzione minimale (~5 MB). L'immagine `node:20-alpine` è ~60-70 MB, mentre `node:20` (Debian) supera i 950 MB. Immagini più piccole si scaricano più velocemente e hanno una superficie di attacco ridotta. |

---

Documentazione di riferimento: [nodejs.org](https://nodejs.org) · [expressjs.com](https://expressjs.com) · [docs.docker.com](https://docs.docker.com)*