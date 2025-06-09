# Strategie di Deployment Avanzate per Applicazioni Node.js

## Obiettivo
In questo esercizio, imparerai a implementare strategie di deployment avanzate come il deployment blu-verde e il deployment canary per applicazioni Node.js, utilizzando servizi cloud come AWS o piattaforme di orchestrazione come Kubernetes.

## Prerequisiti
- Conoscenza di base di Node.js e npm
- Familiarità con Docker e containerizzazione
- Un account AWS (è possibile utilizzare il tier gratuito) o accesso a un cluster Kubernetes
- Conoscenza di base di servizi cloud e networking

## Parte 1: Deployment Blu-Verde

### Concetto
Il deployment blu-verde è una strategia che prevede l'esistenza di due ambienti identici (blu e verde) ma solo uno è attivo e riceve traffico in un dato momento. Quando si vuole rilasciare una nuova versione, questa viene deployata nell'ambiente inattivo, testata, e poi il traffico viene reindirizzato verso il nuovo ambiente.

### Implementazione con AWS Elastic Beanstalk

1. **Preparazione dell'Applicazione**

   Assicurati che la tua applicazione Node.js sia pronta per il deployment e che funzioni correttamente in locale.

2. **Creazione dell'Ambiente Blu**

   ```bash
   eb create nodejs-blue-env
   ```

3. **Configurazione del Load Balancer**

   Configura un Application Load Balancer (ALB) per l'ambiente blu:
   - Vai alla console AWS Elastic Beanstalk
   - Seleziona l'ambiente blu
   - Vai su "Configurazione" > "Bilanciamento del carico"
   - Configura il listener e i gruppi target

4. **Creazione dell'Ambiente Verde**

   ```bash
   eb clone nodejs-blue-env nodejs-green-env
   ```

5. **Deployment della Nuova Versione nell'Ambiente Verde**

   ```bash
   eb deploy nodejs-green-env
   ```

6. **Test dell'Ambiente Verde**

   Verifica che la nuova versione funzioni correttamente nell'ambiente verde prima di reindirizzare il traffico.

7. **Scambio degli URL**

   ```bash
   eb swap nodejs-blue-env --destination_name nodejs-green-env
   ```

8. **Verifica e Rollback (se necessario)**

   Se si verificano problemi con la nuova versione, è possibile tornare rapidamente alla versione precedente scambiando nuovamente gli URL.

### Implementazione con Kubernetes

1. **Preparazione dei Manifest Kubernetes**

   Crea due deployment e due service per le versioni blu e verde:

   ```yaml
   # blue-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nodejs-blue
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: nodejs
         version: blue
     template:
       metadata:
         labels:
           app: nodejs
           version: blue
       spec:
         containers:
         - name: nodejs
           image: your-registry/nodejs-app:v1
           ports:
           - containerPort: 3000
   ---
   # green-deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nodejs-green
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: nodejs
         version: green
     template:
       metadata:
         labels:
           app: nodejs
           version: green
       spec:
         containers:
         - name: nodejs
           image: your-registry/nodejs-app:v2
           ports:
           - containerPort: 3000
   ```

2. **Creazione dei Service**

   ```yaml
   # service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: nodejs-service
   spec:
     selector:
       app: nodejs
       version: blue  # Inizialmente punta alla versione blu
     ports:
     - port: 80
       targetPort: 3000
     type: LoadBalancer
   ```

3. **Applicazione dei Manifest**

   ```bash
   kubectl apply -f blue-deployment.yaml
   kubectl apply -f service.yaml
   ```

4. **Deployment della Versione Verde**

   ```bash
   kubectl apply -f green-deployment.yaml
   ```

5. **Scambio del Traffico**

   Modifica il selettore del service per puntare alla versione verde:

   ```bash
   kubectl patch service nodejs-service -p '{"spec":{"selector":{"version":"green"}}}'
   ```

6. **Rollback (se necessario)**

   ```bash
   kubectl patch service nodejs-service -p '{"spec":{"selector":{"version":"blue"}}}'
   ```

## Parte 2: Deployment Canary

### Concetto
Il deployment canary è una strategia che prevede il rilascio graduale di una nuova versione a un sottoinsieme di utenti o server. Questo permette di testare la nuova versione in produzione con un rischio ridotto, monitorando le prestazioni e gli errori prima di estendere il rilascio a tutti gli utenti.

### Implementazione con AWS App Mesh

1. **Configurazione di AWS App Mesh**

   Crea una mesh, un router virtuale e due servizi virtuali (per le versioni corrente e canary).

2. **Definizione della Route**

   Configura una route che invia una percentuale del traffico alla versione canary:

   ```json
   {
     "httpRoute": {
       "match": {
         "prefix": "/"
       },
       "action": {
         "weightedTargets": [
           {
             "virtualNode": "current-version-node",
             "weight": 90
           },
           {
             "virtualNode": "canary-version-node",
             "weight": 10
           }
         ]
       }
     }
   }
   ```

3. **Monitoraggio e Analisi**

   Utilizza Amazon CloudWatch per monitorare le metriche di entrambe le versioni e valutare le prestazioni della versione canary.

4. **Aumento Graduale del Traffico**

   Se la versione canary funziona correttamente, aumenta gradualmente la percentuale di traffico che riceve:

   ```json
   {
     "httpRoute": {
       "match": {
         "prefix": "/"
       },
       "action": {
         "weightedTargets": [
           {
             "virtualNode": "current-version-node",
             "weight": 50
           },
           {
             "virtualNode": "canary-version-node",
             "weight": 50
           }
         ]
       }
     }
   }
   ```

5. **Completamento del Rollout**

   Una volta confermato che la versione canary è stabile, completa il rollout reindirizzando tutto il traffico alla nuova versione.

### Implementazione con Istio su Kubernetes

1. **Installazione di Istio**

   Segui la documentazione ufficiale per installare Istio sul tuo cluster Kubernetes.

2. **Deployment delle Due Versioni**

   ```yaml
   # deployment.yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nodejs-v1
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: nodejs
         version: v1
     template:
       metadata:
         labels:
           app: nodejs
           version: v1
       spec:
         containers:
         - name: nodejs
           image: your-registry/nodejs-app:v1
           ports:
           - containerPort: 3000
   ---
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: nodejs-v2
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: nodejs
         version: v2
     template:
       metadata:
         labels:
           app: nodejs
           version: v2
       spec:
         containers:
         - name: nodejs
           image: your-registry/nodejs-app:v2
           ports:
           - containerPort: 3000
   ```

3. **Creazione del Service**

   ```yaml
   # service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: nodejs-service
   spec:
     selector:
       app: nodejs
     ports:
     - port: 80
       targetPort: 3000
     type: ClusterIP
   ```

4. **Configurazione del Virtual Service per il Canary Deployment**

   ```yaml
   # virtual-service.yaml
   apiVersion: networking.istio.io/v1alpha3
   kind: VirtualService
   metadata:
     name: nodejs-vs
   spec:
     hosts:
     - nodejs-service
     http:
     - route:
       - destination:
           host: nodejs-service
           subset: v1
         weight: 90
       - destination:
           host: nodejs-service
           subset: v2
         weight: 10
   ---
   apiVersion: networking.istio.io/v1alpha3
   kind: DestinationRule
   metadata:
     name: nodejs-dr
   spec:
     host: nodejs-service
     subsets:
     - name: v1
       labels:
         version: v1
     - name: v2
       labels:
         version: v2
   ```

5. **Applicazione dei Manifest**

   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   kubectl apply -f virtual-service.yaml
   ```

6. **Monitoraggio con Kiali e Grafana**

   Utilizza gli strumenti di monitoraggio di Istio per valutare le prestazioni della versione canary.

7. **Aumento Graduale del Traffico**

   Modifica il peso nel VirtualService per aumentare gradualmente il traffico verso la versione v2.

## Sfide Aggiuntive

1. **Implementazione di Test A/B**:
   - Configura un deployment canary basato su attributi degli utenti (es. regione geografica, tipo di dispositivo)
   - Implementa metriche personalizzate per valutare l'impatto delle diverse versioni

2. **Automazione del Processo di Deployment**:
   - Crea script o pipeline CI/CD che automatizzano l'intero processo di deployment blu-verde o canary
   - Implementa controlli automatici di salute che decidono se procedere con il rollout o effettuare un rollback

3. **Implementazione di Feature Flags**:
   - Integra un sistema di feature flags nella tua applicazione Node.js
   - Utilizza i feature flags per abilitare o disabilitare funzionalità specifiche senza necessità di redeployment

## Conclusione

Hai imparato a implementare strategie di deployment avanzate per applicazioni Node.js. Queste tecniche ti permettono di rilasciare nuove versioni con un rischio ridotto, migliorando l'affidabilità e la stabilità della tua applicazione in produzione.

Il deployment blu-verde offre un modo sicuro per effettuare aggiornamenti con la possibilità di un rollback immediato, mentre il deployment canary permette di testare nuove funzionalità con un sottoinsieme di utenti prima di un rilascio completo.

Entrambe le strategie sono fondamentali nel moderno sviluppo software, specialmente per applicazioni con requisiti di alta disponibilità e zero downtime.