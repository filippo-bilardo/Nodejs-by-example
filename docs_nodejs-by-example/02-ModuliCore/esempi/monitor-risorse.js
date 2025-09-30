#!/usr/bin/env node
/**
 * Sistema di Monitoraggio Risorse Avanzato
 * Monitora CPU, memoria e sistema con soglie personalizzabili
 */

const os = require('os');
const { EventEmitter } = require('events');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');

class MonitorRisorse extends EventEmitter {
  constructor(options = {}) {
    super();
    
    // Configurazione con valori di default
    this.config = {
      intervallo: options.intervallo || 2000,  // 2 secondi
      sogliaMemoria: options.sogliaMemoria || 80,  // 80%
      sogliaCPU: options.sogliaCPU || 70,      // 70%
      mantieneStat: options.mantieneStat || 100,   // Ultime 100 rilevazioni
      salvaFile: options.salvaFile || true,
      fileLog: options.fileLog || path.join(__dirname, 'monitor.log')
    };
    
    this.statistiche = [];
    this.intervalId = null;
    this.ultimoCpuInfo = null;
    this.stato = 'stopped';
  }

  avvia() {
    if (this.stato === 'running') {
      this.emit('warning', 'Monitor già in esecuzione');
      return;
    }

    this.stato = 'running';
    this.emit('avviato', this.config);
    
    // Prima rilevazione immediata
    this._rileva();
    
    // Programma rilevazioni periodiche
    this.intervalId = setInterval(() => {
      this._rileva();
    }, this.config.intervallo);
  }

  ferma() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.stato = 'stopped';
    this.emit('fermato');
  }

  async _rileva() {
    try {
      const timestamp = new Date();
      
      // Informazioni memoria
      const totMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totMem - freeMem;
      const percentualeMemoria = (usedMem / totMem) * 100;
      
      // Informazioni CPU (richiede calcolo tra due rilevazioni)
      const cpuInfo = os.cpus();
      let percentualeCPU = 0;
      
      if (this.ultimoCpuInfo) {
        percentualeCPU = this._calcolaUtilizzoCPU(this.ultimoCpuInfo, cpuInfo);
      }
      this.ultimoCpuInfo = cpuInfo;
      
      // Altre informazioni sistema
      const uptime = os.uptime();
      const loadAvg = os.loadavg();
      
      const rilevazione = {
        timestamp,
        memoria: {
          totale: totMem,
          libera: freeMem,
          usata: usedMem,
          percentuale: percentualeMemoria
        },
        cpu: {
          core: cpuInfo.length,
          utilizzo: percentualeCPU,
          loadAverage: loadAvg
        },
        sistema: {
          uptime,
          platform: os.platform(),
          arch: os.arch()
        }
      };

      // Aggiungere alle statistiche
      this.statistiche.push(rilevazione);
      
      // Mantieni solo le ultime N rilevazioni
      if (this.statistiche.length > this.config.mantieneStat) {
        this.statistiche.shift();
      }

      // Emettere evento per ogni rilevazione
      this.emit('rilevazione', rilevazione);

      // Controllare soglie e emettere eventi di allarme
      this._controllaSoglie(rilevazione);

      // Salvare su file se configurato
      if (this.config.salvaFile) {
        await this._salvaStatistiche(rilevazione);
      }

    } catch (error) {
      this.emit('error', error);
    }
  }

  _calcolaUtilizzoCPU(primaRilevazione, secondaRilevazione) {
    let totalIdle = 0;
    let totalTick = 0;

    for (let i = 0; i < secondaRilevazione.length; i++) {
      const prima = primaRilevazione[i];
      const seconda = secondaRilevazione[i];

      for (const tipo in seconda.times) {
        totalTick += seconda.times[tipo] - prima.times[tipo];
      }

      totalIdle += seconda.times.idle - prima.times.idle;
    }

    return 100 - (100 * totalIdle / totalTick);
  }

  _controllaSoglie(rilevazione) {
    const { percentuale: memPercent } = rilevazione.memoria;
    const { utilizzo: cpuPercent } = rilevazione.cpu;

    if (memPercent > this.config.sogliaMemoria) {
      this.emit('memoria-alta', {
        percentuale: memPercent,
        soglia: this.config.sogliaMemoria,
        rilevazione
      });
    }

    if (cpuPercent > this.config.sogliaCPU) {
      this.emit('cpu-alta', {
        percentuale: cpuPercent,
        soglia: this.config.sogliaCPU,
        rilevazione
      });
    }

    // Controlli aggiuntivi
    const loadAvg1min = rilevazione.cpu.loadAverage[0];
    const numCores = rilevazione.cpu.core;
    
    if (loadAvg1min > numCores * 0.8) {
      this.emit('carico-alto', {
        loadAverage: loadAvg1min,
        cores: numCores,
        rilevazione
      });
    }
  }

  async _salvaStatistiche(rilevazione) {
    try {
      const logEntry = {
        timestamp: rilevazione.timestamp.toISOString(),
        memoria_percent: rilevazione.memoria.percentuale.toFixed(2),
        cpu_percent: rilevazione.cpu.utilizzo.toFixed(2),
        load_avg: rilevazione.cpu.loadAverage[0].toFixed(2),
        uptime_hours: (rilevazione.sistema.uptime / 3600).toFixed(2)
      };

      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(this.config.fileLog, logLine);
    } catch (error) {
      this.emit('error', new Error(`Errore salvataggio log: ${error.message}`));
    }
  }

  getStatistiche() {
    return {
      configurazione: this.config,
      stato: this.stato,
      numeroRilevazioni: this.statistiche.length,
      ultimaRilevazione: this.statistiche[this.statistiche.length - 1],
      statistiche: this.statistiche
    };
  }

  getMedia() {
    if (this.statistiche.length === 0) return null;

    const somme = this.statistiche.reduce((acc, stat) => {
      acc.memoria += stat.memoria.percentuale;
      acc.cpu += stat.cpu.utilizzo;
      acc.loadAvg += stat.cpu.loadAverage[0];
      return acc;
    }, { memoria: 0, cpu: 0, loadAvg: 0 });

    const count = this.statistiche.length;
    return {
      memoriaMedia: somme.memoria / count,
      cpuMedia: somme.cpu / count,
      loadAvgMedia: somme.loadAvg / count,
      baseSuRilevazioni: count
    };
  }
}

// Esempio di utilizzo
if (require.main === module) {
  console.log('🔍 Avvio Monitor Risorse Sistema\n');
  
  const monitor = new MonitorRisorse({
    intervallo: 3000,     // Ogni 3 secondi
    sogliaMemoria: 75,    // Allarme memoria al 75%
    sogliaCPU: 60,        // Allarme CPU al 60%
    mantieneStat: 50,     // Mantieni 50 rilevazioni
    salvaFile: true
  });

  // Event listeners
  monitor.on('avviato', (config) => {
    console.log('✅ Monitor avviato');
    console.log('⚙️  Configurazione:', util.inspect(config, { colors: true, depth: 2 }));
  });

  monitor.on('rilevazione', (rilevazione) => {
    const mem = rilevazione.memoria.percentuale.toFixed(1);
    const cpu = rilevazione.cpu.utilizzo.toFixed(1);
    const load = rilevazione.cpu.loadAverage[0].toFixed(2);
    
    console.log(`📊 [${rilevazione.timestamp.toLocaleTimeString()}] Memoria: ${mem}%, CPU: ${cpu}%, Load: ${load}`);
  });

  monitor.on('memoria-alta', (info) => {
    console.log(`⚠️  MEMORIA ALTA: ${info.percentuale.toFixed(1)}% (soglia: ${info.soglia}%)`);
  });

  monitor.on('cpu-alta', (info) => {
    console.log(`⚠️  CPU ALTA: ${info.percentuale.toFixed(1)}% (soglia: ${info.soglia}%)`);
  });

  monitor.on('carico-alto', (info) => {
    console.log(`⚠️  CARICO ALTO: ${info.loadAverage.toFixed(2)} (${info.cores} core disponibili)`);
  });

  monitor.on('error', (error) => {
    console.error('❌ Errore monitor:', error.message);
  });

  // Avvia il monitoraggio
  monitor.avvia();

  // Mostra statistiche ogni 15 secondi
  setInterval(() => {
    const stats = monitor.getStatistiche();
    const media = monitor.getMedia();
    
    console.log('\n📈 STATISTICHE MONITOR:');
    console.log(`   Rilevazioni: ${stats.numeroRilevazioni}`);
    
    if (media) {
      console.log(`   Memoria media: ${media.memoriaMedia.toFixed(1)}%`);
      console.log(`   CPU media: ${media.cpuMedia.toFixed(1)}%`);
      console.log(`   Load Average medio: ${media.loadAvgMedia.toFixed(2)}`);
    }
    console.log('');
  }, 15000);

  // Gestione shutdown graceful
  process.on('SIGINT', () => {
    console.log('\n🛑 Arresto monitor...');
    monitor.ferma();
    
    const stats = monitor.getStatistiche();
    console.log(`📊 Statistiche finali: ${stats.numeroRilevazioni} rilevazioni salvate`);
    
    if (monitor.config.salvaFile) {
      console.log(`💾 Log salvato in: ${monitor.config.fileLog}`);
    }
    
    process.exit(0);
  });
}

module.exports = MonitorRisorse;