/**
 * 🏆 SFIDA FINALE: Sistema di Gestione Ordini
 * 
 * OBIETTIVO: Crea un sistema completo di gestione ordini e-commerce
 * 
 * SCENARIO:
 * Quando un cliente effettua un ordine, il sistema deve:
 * 1. Verificare la disponibilità del prodotto (300ms)
 * 2. Processare il pagamento (500ms)
 * 3. Creare la spedizione (200ms)
 * 4. Inviare email di conferma (100ms)
 * 5. Aggiornare l'inventario (400ms)
 * 
 * REQUISITI AVANZATI:
 * - Le operazioni 1 e 2 devono essere sequenziali
 * - Le operazioni 3, 4, 5 possono essere parallele (dopo 1 e 2)
 * - Se il pagamento fallisce (20% di probabilità random), annulla tutto
 * - Gestisci gli errori con try/catch
 * - Stampa log dettagliati per ogni step
 * - Calcola e stampa il tempo totale di esecuzione
 * 
 * BONUS:
 * - Aggiungi un timeout: se l'ordine impiega più di 2 secondi, annulla
 * - Implementa un sistema di retry per il pagamento (max 3 tentativi)
 */

const ordine = {
    id: 'ORD-12345',
    prodotto: 'Laptop',
    quantita: 1,
    prezzo: 999.99
};

// SCRIVI IL TUO CODICE QUI:

// Funzione per simulare operazioni asincrone
function simulaOperazione(nome, tempo, fallisce = false) {
    // Il tuo codice qui
}

async function verificaDisponibilita(ordine) {
    // Il tuo codice qui
}

async function processaPagamento(ordine) {
    // Il tuo codice qui
    // Simula fallimento random (20% probabilità)
}

async function creaSpedizione(ordine) {
    // Il tuo codice qui
}

async function inviaEmailConferma(ordine) {
    // Il tuo codice qui
}

async function aggiornaInventario(ordine) {
    // Il tuo codice qui
}

async function processaOrdine(ordine) {
    // Il tuo codice qui principale
    // Ricorda: gestisci errori e calcola tempo totale!
}

// Esegui
processaOrdine(ordine);





























// ============================================================
// SOLUZIONE COMPLETA
// ============================================================

/**
 * SOLUZIONE:
 */

// Utility per simulare operazioni
function simulaOperazione_SOLUZIONE(nome, tempo, probabilitaFallimento = 0) {
    return new Promise((resolve, reject) => {
        console.log(`  ⏳ ${nome}...`);
        setTimeout(() => {
            if (Math.random() < probabilitaFallimento) {
                reject(new Error(`${nome} fallito`));
            } else {
                console.log(`  ✓ ${nome} completato`);
                resolve();
            }
        }, tempo);
    });
}

async function verificaDisponibilita_SOLUZIONE(ordine) {
    return simulaOperazione_SOLUZIONE(
        `Verifica disponibilità ${ordine.prodotto}`,
        300
    );
}

async function processaPagamento_SOLUZIONE(ordine, tentativo = 1) {
    const maxTentativi = 3;
    try {
        return await simulaOperazione_SOLUZIONE(
            `Processazione pagamento €${ordine.prezzo} (tentativo ${tentativo})`,
            500,
            0.2 // 20% probabilità di fallimento
        );
    } catch (error) {
        if (tentativo < maxTentativi) {
            console.log(`  ⚠️  Ritento il pagamento...`);
            return processaPagamento_SOLUZIONE(ordine, tentativo + 1);
        } else {
            throw new Error(`Pagamento fallito dopo ${maxTentativi} tentativi`);
        }
    }
}

async function creaSpedizione_SOLUZIONE(ordine) {
    return simulaOperazione_SOLUZIONE(
        `Creazione spedizione per ordine ${ordine.id}`,
        200
    );
}

async function inviaEmailConferma_SOLUZIONE(ordine) {
    return simulaOperazione_SOLUZIONE(
        `Invio email di conferma`,
        100
    );
}

async function aggiornaInventario_SOLUZIONE(ordine) {
    return simulaOperazione_SOLUZIONE(
        `Aggiornamento inventario (-${ordine.quantita})`,
        400
    );
}

async function processaOrdine_SOLUZIONE(ordine) {
    const tempoInizio = Date.now();
    console.log(`\n🛒 Processamento ordine ${ordine.id}`);
    console.log(`📦 Prodotto: ${ordine.prodotto} x${ordine.quantita}`);
    console.log('━'.repeat(50));
    
    try {
        // Step 1 e 2: Sequenziali
        console.log('\n📋 Fase 1: Verifica e Pagamento');
        await verificaDisponibilita_SOLUZIONE(ordine);
        await processaPagamento_SOLUZIONE(ordine);
        
        // Step 3, 4, 5: Paralleli
        console.log('\n📋 Fase 2: Finalizzazione (parallela)');
        await Promise.all([
            creaSpedizione_SOLUZIONE(ordine),
            inviaEmailConferma_SOLUZIONE(ordine),
            aggiornaInventario_SOLUZIONE(ordine)
        ]);
        
        const tempoTotale = Date.now() - tempoInizio;
        console.log('\n━'.repeat(50));
        console.log(`✅ Ordine ${ordine.id} completato con successo!`);
        console.log(`⏱️  Tempo totale: ${tempoTotale}ms`);
        
    } catch (error) {
        const tempoTotale = Date.now() - tempoInizio;
        console.log('\n━'.repeat(50));
        console.log(`❌ Errore nell'ordine ${ordine.id}: ${error.message}`);
        console.log(`⏱️  Tempo prima del fallimento: ${tempoTotale}ms`);
        console.log('🔄 Procedura di rollback avviata...');
    }
}

// Test della soluzione (commentato)
// processaOrdine_SOLUZIONE(ordine);


/**
 * BONUS: Versione con timeout
 */
async function processaOrdineConTimeout(ordine, timeout = 2000) {
    const tempoInizio = Date.now();
    console.log(`\n🛒 Processamento ordine ${ordine.id} (timeout: ${timeout}ms)`);
    
    const promiseOrdine = processaOrdine_SOLUZIONE(ordine);
    const promiseTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout superato')), timeout);
    });
    
    try {
        await Promise.race([promiseOrdine, promiseTimeout]);
    } catch (error) {
        const tempoTotale = Date.now() - tempoInizio;
        if (error.message === 'Timeout superato') {
            console.log(`\n⏰ TIMEOUT: L'ordine ha impiegato più di ${timeout}ms`);
            console.log(`⏱️  Tempo trascorso: ${tempoTotale}ms`);
        }
    }
}

// processaOrdineConTimeout(ordine, 2000);
