const EventEmitter = require('events');

/**
 * TaskQueue - Coda di task con concorrenza limitata
 */
class TaskQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.concurrency = options.concurrency || 3;
    this.queue = [];
    this.running = 0;
    this.completed = 0;
    this.failed = 0;
  }
  
  /**
   * Aggiunge task alla coda
   */
  add(task) {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const taskWrapper = {
      id: taskId,
      priority: task.priority || 0,
      fn: task.fn,
      addedAt: Date.now()
    };
    
    this.queue.push(taskWrapper);
    this.queue.sort((a, b) => b.priority - a.priority); // Higher priority first
    
    this.emit('task-added', { id: taskId, queueSize: this.queue.length });
    
    this.processNext();
    
    return taskId;
  }
  
  /**
   * Processa prossimo task se possibile
   */
  async processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    const task = this.queue.shift();
    this.running++;
    
    this.emit('task-started', {
      id: task.id,
      running: this.running,
      queued: this.queue.length
    });
    
    const startTime = Date.now();
    
    try {
      const result = await task.fn();
      const duration = Date.now() - startTime;
      
      this.completed++;
      this.running--;
      
      this.emit('task-completed', {
        id: task.id,
        result,
        duration,
        stats: this.getStats()
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.failed++;
      this.running--;
      
      this.emit('task-failed', {
        id: task.id,
        error,
        duration,
        stats: this.getStats()
      });
    }
    
    // Progress
    const total = this.completed + this.failed + this.running + this.queue.length;
    const progress = total > 0 ? ((this.completed + this.failed) / total * 100) : 0;
    
    this.emit('progress', {
      completed: this.completed,
      failed: this.failed,
      running: this.running,
      queued: this.queue.length,
      total,
      percentage: Math.round(progress)
    });
    
    // Se coda vuota e nessun task in esecuzione
    if (this.queue.length === 0 && this.running === 0) {
      this.emit('queue-empty', this.getStats());
    }
    
    // Processa prossimo
    setImmediate(() => this.processNext());
  }
  
  /**
   * Statistiche
   */
  getStats() {
    return {
      completed: this.completed,
      failed: this.failed,
      running: this.running,
      queued: this.queue.length
    };
  }
  
  /**
   * Svuota coda
   */
  clear() {
    const cleared = this.queue.length;
    this.queue = [];
    this.emit('queue-cleared', { tasksCancelled: cleared });
  }
}

// ============================================
// ESEMPIO D'USO
// ============================================

const queue = new TaskQueue({ concurrency: 3 });

// Listener eventi
queue.on('task-added', ({ id, queueSize }) => {
  console.log(`➕ Task added: ${id} (queue size: ${queueSize})`);
});

queue.on('task-started', ({ id, running, queued }) => {
  console.log(`🚀 Task started: ${id} (running: ${running}, queued: ${queued})`);
});

queue.on('task-completed', ({ id, duration }) => {
  console.log(`✅ Task completed: ${id} (${(duration / 1000).toFixed(2)}s)`);
});

queue.on('task-failed', ({ id, error, duration }) => {
  console.log(`❌ Task failed: ${id} - ${error.message} (${(duration / 1000).toFixed(2)}s)`);
});

queue.on('progress', ({ percentage, completed, failed, total }) => {
  console.log(`📊 Progress: ${percentage}% (${completed + failed}/${total})`);
});

queue.on('queue-empty', ({ completed, failed }) => {
  console.log(`\n🎉 All tasks completed! (${completed} success, ${failed} failed)\n`);
});

// Aggiungi task
console.log('📋 Task Queue initialized (concurrency: 3)\n');

// Task che simulano operazioni async
for (let i = 1; i <= 10; i++) {
  queue.add({
    priority: Math.random() * 10, // Priorità random
    fn: async () => {
      // Simula lavoro async
      const duration = 500 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, duration));
      
      // 20% chance di fallimento
      if (Math.random() < 0.2) {
        throw new Error('Task failed randomly');
      }
      
      return { taskNumber: i, result: 'success' };
    }
  });
}
