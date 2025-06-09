# Gestione delle Dipendenze

## Introduzione alla Gestione delle Dipendenze

La gestione delle dipendenze è uno degli aspetti più importanti dello sviluppo di applicazioni Node.js. Un'applicazione moderna può dipendere da decine o centinaia di pacchetti esterni, ciascuno con le proprie dipendenze. NPM semplifica questo processo complesso, permettendo agli sviluppatori di concentrarsi sulla logica dell'applicazione anziché sulla gestione manuale delle librerie.

## Tipi di Dipendenze

NPM distingue tra diversi tipi di dipendenze, ciascuna con uno scopo specifico:

### Dipendenze di Produzione

Le dipendenze di produzione sono pacchetti necessari per l'esecuzione dell'applicazione in ambiente di produzione.

```bash
npm install <pacchetto> --save
# oppure semplicemente
npm install <pacchetto>
```

Queste dipendenze vengono salvate nel campo `dependencies` del file package.json:

```json
"dependencies": {
  "express": "^4.17.1",
  "mongoose": "^5.12.3"
}
```

### Dipendenze di Sviluppo

Le dipendenze di sviluppo sono pacchetti necessari solo durante lo sviluppo e i test, ma non in produzione.

```bash
npm install <pacchetto> --save-dev
# oppure
npm install <pacchetto> -D
```

Queste dipendenze vengono salvate nel campo `devDependencies` del file package.json:

```json
"devDependencies": {
  "nodemon": "^2.0.7",
  "jest": "^27.0.6",
  "eslint": "^7.32.0"
}
```

### Peer Dependencies

Le peer dependencies sono pacchetti che ci si aspetta siano già installati nell'ambiente host. Sono comuni nei plugin o nelle estensioni.

```json
"peerDependencies": {
  "react": "^17.0.0"
}
```

### Optional Dependencies

Le dipendenze opzionali sono pacchetti che non sono essenziali per la funzionalità principale, ma possono fornire funzionalità aggiuntive.

```json
"optionalDependencies": {
  "image-optimization": "^1.0.0"
}
```

## Installazione delle Dipendenze

### Installazione Locale

L'installazione locale aggiunge i pacchetti alla cartella `node_modules` del progetto corrente.

```bash
npm install <pacchetto>        # Installa l'ultima versione
npm install <pacchetto>@1.2.3  # Installa una versione specifica
npm install <pacchetto>@latest # Installa l'ultima versione
```

### Installazione Globale

L'installazione globale aggiunge i pacchetti a una cartella globale del sistema, rendendoli disponibili come comandi da terminale.

```bash
npm install -g <pacchetto>
```

I pacchetti globali sono utili per strumenti da riga di comando, ma non dovrebbero essere utilizzati come dipendenze di un'applicazione.

## Gestione delle Versioni dei Pacchetti

### Aggiornamento dei Pacchetti

```bash
npm update            # Aggiorna tutti i pacchetti
npm update <pacchetto> # Aggiorna un pacchetto specifico
```

È importante notare che `npm update` rispetta i vincoli di versione specificati nel file package.json. Ad esempio, se hai specificato `^1.2.3`, NPM aggiornerà solo alle versioni compatibili (fino a, ma non incluso, 2.0.0).

### Visualizzazione dei Pacchetti Obsoleti

```bash
npm outdated
```

Questo comando mostra una tabella con le versioni attuali, desiderate e più recenti di ciascun pacchetto.

### Controllo delle Vulnerabilità

```bash
npm audit
```

Questo comando controlla le dipendenze del progetto per vulnerabilità di sicurezza note.

```bash
npm audit fix
```

Questo comando tenta di risolvere automaticamente le vulnerabilità aggiornando i pacchetti interessati.

## Strategie di Gestione delle Dipendenze

### Lockfile

Il file `package-lock.json` è fondamentale per garantire installazioni coerenti tra diversi ambienti. Questo file dovrebbe essere sempre incluso nel controllo di versione.

### Shrinkwrap

Il comando `npm shrinkwrap` crea un file `npm-shrinkwrap.json` che funziona in modo simile a `package-lock.json`, ma viene utilizzato anche quando il pacchetto viene pubblicato su NPM.

```bash
npm shrinkwrap
```

### Pulizia della Cache

A volte, problemi di installazione possono essere risolti pulendo la cache di NPM:

```bash
npm cache clean --force
```

### Reinstallazione Pulita

Per una reinstallazione completa delle dipendenze:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

## Dipendenze Annidate e Deduplicazione

NPM gestisce automaticamente le dipendenze annidate (dipendenze delle dipendenze). Nelle versioni recenti di NPM, viene utilizzato un algoritmo di deduplicazione per ridurre la duplicazione dei pacchetti nella cartella `node_modules`.

## Gestione delle Dipendenze in Progetti di Team

### Convenzioni di Versionamento

È importante stabilire convenzioni di versionamento all'interno del team:

- Utilizzare `^` per le dipendenze che seguono il versionamento semantico in modo affidabile
- Utilizzare `~` o versioni esatte per pacchetti meno affidabili
- Considerare l'uso di strumenti come `npm-check-updates` per aggiornamenti controllati

### Monorepo e Workspaces

Per progetti più complessi con più pacchetti correlati, NPM supporta i workspaces:

```json
{
  "name": "progetto-principale",
  "workspaces": [
    "packages/*"
  ]
}
```

Questo permette di gestire più pacchetti in un unico repository, condividendo dipendenze e semplificando lo sviluppo.

## Conclusione

La gestione efficace delle dipendenze è cruciale per lo sviluppo di applicazioni Node.js robuste e manutenibili. NPM fornisce strumenti potenti per gestire questo aspetto, ma è importante comprendere i concetti sottostanti e adottare buone pratiche per evitare problemi comuni come il "dependency hell" o vulnerabilità di sicurezza.

---

[Torna all'indice dell'esercitazione](../README.md)