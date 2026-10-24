# Esempio 02: File Watcher

## Descrizione

Monitora una directory e emette eventi quando file vengono creati, modificati o eliminati.

## Concetti Dimostrati

- Eventi filesystem con `fs.watch()`
- Debouncing eventi multipli
- Gestione errori I/O
- Event Loop e operazioni asincrone

## File

- `index.js` - File watcher implementation
- `test-dir/` - Directory di test (creata automaticamente)

## Esecuzione

```bash
node index.js
```

Poi in un altro terminale:
```bash
# Crea un file
echo "test" > test-dir/file1.txt

# Modifica file
echo "modified" >> test-dir/file1.txt

# Elimina file
rm test-dir/file1.txt
```

## Output Atteso

```
📁 Watching directory: test-dir
✅ Ready to monitor changes

📄 File created: file1.txt
📝 File modified: file1.txt
🗑️ File deleted: file1.txt
```

## Spiegazione

Il File Watcher:
1. Usa `fs.watch()` per monitorare directory
2. Debounce eventi ripetuti (filesystem può emettere più eventi per singola modifica)
3. Distingue tra creazione/modifica/eliminazione
4. Gestisce errori (file non esistenti, permessi, etc.)
