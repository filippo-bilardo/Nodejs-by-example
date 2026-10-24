# Esercizio 1: Hello API

## Obiettivo
Creare la tua prima REST API estremamente semplice che risponde con un messaggio di benvenuto.

## Descrizione
Crea un server Express che espone un singolo endpoint GET che restituisce un messaggio JSON.

## Requisiti
1. Installa Express: `npm install express`
2. Crea un server che ascolta sulla porta 3000
3. Implementa un endpoint `GET /api/hello` che restituisce:
   ```json
   {
     "message": "Hello, World!",
     "timestamp": "2026-04-19T19:16:48.104Z"
   }
   ```

## Codice di partenza

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

// TODO: Implementa qui il tuo endpoint GET /api/hello

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
```

## Test
Avvia il server e prova con:
```bash
curl http://localhost:3000/api/hello
```

oppure apri il browser all'indirizzo: http://localhost:3000/api/hello

## Soluzione
<details>
<summary>Clicca per vedere la soluzione</summary>

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello, World!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
```
</details>
