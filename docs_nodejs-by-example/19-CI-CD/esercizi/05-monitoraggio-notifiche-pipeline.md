# Monitoraggio e Notifiche nella Pipeline CI/CD

## Obiettivo
In questo esercizio, imparerai a implementare un sistema di monitoraggio e notifiche per la tua pipeline CI/CD. Questo ti permetterà di essere informato tempestivamente sullo stato delle build, dei test e dei deployment, facilitando l'identificazione e la risoluzione rapida dei problemi.

## Prerequisiti
- Un repository GitHub con un'applicazione Node.js
- GitHub Actions configurato (vedi esercizio 01)
- Pipeline CI/CD multi-ambiente (vedi esercizio 04)
- Conoscenza di base dei sistemi di notifica

## Passaggi

### 1. Configurazione delle Notifiche Email

1. Modifica il workflow GitHub Actions per inviare notifiche email:
   ```yaml
   # .github/workflows/ci-cd.yml
   name: CI/CD con Notifiche

   on:
     push:
       branches: [ main, develop, staging ]
     pull_request:
       branches: [ main, develop, staging ]

   jobs:
     build-and-test:
       runs-on: ubuntu-latest
       steps:
         # ... altri step ...

       # Invia notifica in caso di fallimento
       - name: Notifica Fallimento
         if: failure()
         uses: dawidd6/action-send-mail@v3
         with:
           server_address: smtp.gmail.com
           server_port: 465
           username: ${{ secrets.MAIL_USERNAME }}
           password: ${{ secrets.MAIL_PASSWORD }}
           subject: "❌ Build Fallita: ${{ github.repository }}"
           body: |
             La build è fallita!
             
             Repository: ${{ github.repository }}
             Workflow: ${{ github.workflow }}
             Commit: ${{ github.sha }}
             Autore: ${{ github.actor }}
             
             Per maggiori dettagli: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
           to: team@example.com
           from: CI/CD Pipeline

       # Invia notifica in caso di successo
       - name: Notifica Successo
         if: success()
         uses: dawidd6/action-send-mail@v3
         with:
           server_address: smtp.gmail.com
           server_port: 465
           username: ${{ secrets.MAIL_USERNAME }}
           password: ${{ secrets.MAIL_PASSWORD }}
           subject: "✅ Build Completata: ${{ github.repository }}"
           body: |
             La build è stata completata con successo!
             
             Repository: ${{ github.repository }}
             Workflow: ${{ github.workflow }}
             Commit: ${{ github.sha }}
             Autore: ${{ github.actor }}
             
             Per maggiori dettagli: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
           to: team@example.com
           from: CI/CD Pipeline
   ```

2. Aggiungi i segreti necessari su GitHub:
   - `MAIL_USERNAME`: L'indirizzo email da cui inviare le notifiche
   - `MAIL_PASSWORD`: La password o la app password per l'account email

### 2. Integrazione con Slack

1. Crea un'app Slack e configura un webhook in entrata:
   - Vai su [api.slack.com/apps](https://api.slack.com/apps) e crea una nuova app
   - Abilita i webhook in entrata e crea un nuovo webhook
   - Copia l'URL del webhook

2. Aggiungi il webhook come segreto su GitHub:
   - Nome: `SLACK_WEBHOOK_URL`
   - Valore: [URL del webhook copiato]

3. Modifica il workflow per inviare notifiche a Slack:
   ```yaml
   # Aggiungi questi step al tuo workflow
   - name: Notifica Slack - Inizio
     uses: 8398a7/action-slack@v3
     with:
       status: custom
       fields: repo,message,commit,author,action,eventName,ref,workflow
       custom_payload: |
         {
           attachments: [{
             color: '#36a64f',
             text: `🚀 Iniziata la build per ${process.env.AS_REPO}\nCommit: ${process.env.AS_COMMIT} di ${process.env.AS_AUTHOR}\nBranch: ${process.env.AS_REF}`,
           }]
         }
     env:
       SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

   - name: Notifica Slack - Risultato
     uses: 8398a7/action-slack@v3
     if: always()
     with:
       status: ${{ job.status }}
       fields: repo,message,commit,author,action,eventName,ref,workflow
     env:
       SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
   ```

### 3. Implementazione di Badge di Stato

1. Aggiungi un badge di stato al file README.md del tuo repository:
   ```markdown
   # Nome del Progetto

   ![CI/CD](https://github.com/username/repository/workflows/CI%2FCD/badge.svg)
   ```

2. Per badge più avanzati, utilizza servizi come Shields.io:
   ```markdown
   [![Build Status](https://img.shields.io/github/workflow/status/username/repository/CI%2FCD?style=flat-square)](https://github.com/username/repository/actions)
   [![Test Coverage](https://img.shields.io/codecov/c/github/username/repository?style=flat-square)](https://codecov.io/gh/username/repository)
   ```

### 4. Monitoraggio delle Performance della Pipeline

1. Aggiungi step per misurare i tempi di esecuzione:
   ```yaml
   - name: Inizia Timer
     id: start-time
     run: echo "::set-output name=start::$(date +%s)"

   # ... altri step ...

   - name: Calcola Tempo di Esecuzione
     if: always()
     id: execution-time
     run: |
       end=$(date +%s)
       start=${{ steps.start-time.outputs.start }}
       duration=$((end-start))
       echo "::set-output name=duration::$duration"
       echo "Tempo di esecuzione: $duration secondi"

   - name: Registra Metriche
     if: always()
     run: |
       echo "workflow_duration_seconds ${{ steps.execution-time.outputs.duration }}" >> metrics.txt
       # Qui potresti inviare queste metriche a un sistema di monitoraggio
   ```

### 5. Integrazione con Sistemi di Monitoraggio

1. Configura Datadog per il monitoraggio della pipeline:
   ```yaml
   - name: Invia Metriche a Datadog
     if: always()
     run: |
       curl -X POST "https://api.datadoghq.com/api/v1/series" \
       -H "Content-Type: application/json" \
       -H "DD-API-KEY: ${{ secrets.DATADOG_API_KEY }}" \
       -d @- << EOF
       {
         "series": [
           {
             "metric": "ci.pipeline.duration",
             "points": [[${{ steps.execution-time.outputs.duration }}, $(date +%s)]],
             "type": "gauge",
             "tags": ["repository:${{ github.repository }}", "workflow:${{ github.workflow }}", "status:${{ job.status }}", "branch:${{ github.ref }}", "commit:${{ github.sha }}"]
           }
         ]
       }
       EOF
   ```

2. Aggiungi il segreto `DATADOG_API_KEY` su GitHub.

### 6. Configurazione di Alerting Proattivo

1. Configura regole di alerting basate sulle metriche raccolte:
   - Tempo di esecuzione della pipeline superiore a una soglia
   - Fallimenti consecutivi della pipeline
   - Diminuzione della copertura dei test

2. Implementa un sistema di notifica per gli alert:
   ```yaml
   - name: Verifica Tempo di Esecuzione
     if: always()
     run: |
       if [ ${{ steps.execution-time.outputs.duration }} -gt 300 ]; then
         echo "::warning::La pipeline ha impiegato più di 5 minuti per l'esecuzione!"
         # Invia notifica
         curl -X POST -H "Content-Type: application/json" \
           --data '{"text":"⚠️ La pipeline ha impiegato ${{ steps.execution-time.outputs.duration }} secondi per l\'esecuzione, superando la soglia di 300 secondi."}' \
           ${{ secrets.SLACK_WEBHOOK_URL }}
       fi
   ```

## Esercizi Aggiuntivi

1. **Implementa Notifiche su Microsoft Teams**: Configura le notifiche per Microsoft Teams utilizzando webhook in entrata.

2. **Crea una Dashboard di Monitoraggio**: Utilizza Grafana o un altro strumento per creare una dashboard che mostri lo stato e le performance delle tue pipeline CI/CD.

3. **Implementa Notifiche Push**: Configura notifiche push per dispositivi mobili utilizzando servizi come Pushover o Firebase Cloud Messaging.

4. **Integra PagerDuty**: Configura PagerDuty per la gestione degli incidenti critici nella pipeline.

## Risorse Aggiuntive

- [GitHub Actions - Workflow Commands](https://docs.github.com/en/actions/reference/workflow-commands-for-github-actions)
- [Slack API - Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Datadog - Metrics API](https://docs.datadoghq.com/api/latest/metrics/)
- [Shields.io - Badge Personalizzati](https://shields.io/)

## Conclusione

In questo esercizio, hai imparato a implementare un sistema di monitoraggio e notifiche per la tua pipeline CI/CD. Un buon sistema di monitoraggio e notifiche è essenziale per mantenere la qualità del software e rispondere rapidamente ai problemi. Combinando notifiche tempestive, badge di stato e monitoraggio delle performance, puoi creare un processo di CI/CD più trasparente e affidabile.

Ricorda che il monitoraggio non riguarda solo l'identificazione dei problemi, ma anche la raccolta di metriche che possono aiutarti a ottimizzare il processo di sviluppo nel tempo. Analizzando queste metriche, puoi identificare colli di bottiglia e aree di miglioramento nella tua pipeline CI/CD.