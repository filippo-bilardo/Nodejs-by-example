# Esempio 03: Task Queue

## Descrizione

Coda di task event-driven con gestione concorrenza e progress tracking.

## Concetti Dimostrati

- Task queue con eventi
- Concorrenza limitata
- Progress reporting
- Task prioritization

## Esecuzione

```bash
node index.js
```

## Output Atteso

```
📋 Task Queue initialized (concurrency: 3)

➕ Task added: task-1
➕ Task added: task-2
🚀 Task started: task-1
🚀 Task started: task-2
✅ Task completed: task-1 (duration: 1.2s)
🚀 Task started: task-3
📊 Progress: 33% (1/3)
✅ Task completed: task-2 (duration: 1.5s)
📊 Progress: 67% (2/3)
✅ Task completed: task-3 (duration: 0.8s)
📊 Progress: 100% (3/3)
🎉 All tasks completed!
```
