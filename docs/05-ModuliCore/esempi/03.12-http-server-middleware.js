/**
 * ESEMPIO 03.12 - HTTP Server Avanzato con Middleware
 * 
 * Questo esempio mostra come creare un server HTTP avanzato con sistema di middleware
 * simile a Express.js, ma usando solo il modulo http nativo.
 * 
 * CONCETTI CHIAVE:
 * - Middleware Pattern: Chain of responsibility per processare richieste
 * - Request/Response enhancement: Aggiunta funzionalità a req/res
 * - Routing avanzato: Pattern matching per URL dinamici
 * - Error handling: Gestione centralizzata errori
 * - CORS: Cross-Origin Resource Sharing
 * - Body parsing: JSON e URL-encoded
 * - Rate limiting: Limitazione richieste per prevenire abuse
 * 
 * MIDDLEWARE INCLUSI:
 * - Logger: Log di tutte le richieste
 * - CORS: Headers per Cross-Origin requests
 * - Body Parser: Parse JSON e URL-encoded
 * - Rate Limiter: Limita richieste per IP
 * - Error Handler: Cattura e gestisce errori
 * 
 * QUANDO USARE:
 * - Learning: Capire come funzionano i framework
 * - Custom needs: Quando Express è troppo "pesante"
 * - Microservizi minimali con controllo totale
 * 
 * NOTA: Per production, considera Express.js o Fastify
 */

const http = require('http');
const url = require('url');
const querystring = require('querystring');

// ============================================
// CLASS: HTTPServer
// ============================================

class HTTPServer {
  constructor() {
    this.middlewares = [];
    this.routes = {
      GET: new Map(),
      POST: new Map(),
      PUT: new Map(),
      DELETE: new Map()
    };
    this.errorHandler = this.defaultErrorHandler.bind(this);
  }
  
  /**
   * Registra un middleware
   */
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  /**
   * Registra route GET
   */
  get(path, handler) {
    this.routes.GET.set(path, handler);
    return this;
  }
  
  /**
   * Registra route POST
   */
  post(path, handler) {
    this.routes.POST.set(path, handler);
    return this;
  }
  
  /**
   * Registra route PUT
   */
  put(path, handler) {
    this.routes.PUT.set(path, handler);
    return this;
  }
  
  /**
   * Registra route DELETE
   */
  delete(path, handler) {
    this.routes.DELETE.set(path, handler);
    return this;
  }
  
  /**
   * Imposta error handler personalizzato
   */
  setErrorHandler(handler) {
    this.errorHandler = handler;
    return this;
  }
  
  /**
   * Crea e avvia il server
   */
  listen(port, host = 'localhost', callback) {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });
    
    server.listen(port, host, () => {
      if (callback) callback();
    });
    
    return server;
  }
  
  /**
   * Gestisce richiesta HTTP
   */
  async handleRequest(req, res) {
    try {
      // Enhance request e response objects
      this.enhanceRequest(req);
      this.enhanceResponse(res);
      
      // Esegui middleware chain
      await this.executeMiddlewares(req, res);
      
      // Se middleware ha già inviato risposta, termina
      if (res.headersSent) return;
      
      // Trova e esegui route handler
      await this.executeRoute(req, res);
      
    } catch (err) {
      // Gestione errori centralizzata
      this.errorHandler(err, req, res);
    }
  }
  
  /**
   * Aggiunge metodi helper a req
   */
  enhanceRequest(req) {
    const parsedUrl = url.parse(req.url, true);
    
    req.path = parsedUrl.pathname;
    req.query = parsedUrl.query;
    req.params = {};
  }
  
  /**
   * Aggiunge metodi helper a res
   */
  enhanceResponse(res) {
    // res.json() - Invia risposta JSON
    res.json = function(statusCode, data) {
      if (typeof statusCode === 'object') {
        data = statusCode;
        statusCode = 200;
      }
      
      this.statusCode = statusCode;
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
    };
    
    // res.send() - Invia risposta text/html
    res.send = function(statusCode, text) {
      if (typeof statusCode === 'string') {
        text = statusCode;
        statusCode = 200;
      }
      
      this.statusCode = statusCode;
      this.setHeader('Content-Type', 'text/html; charset=utf-8');
      this.end(text);
    };
    
    // res.status() - Imposta status code (chainable)
    res.status = function(code) {
      this.statusCode = code;
      return this;
    };
  }
  
  /**
   * Esegue middleware chain
   */
  async executeMiddlewares(req, res) {
    for (const middleware of this.middlewares) {
      // Ogni middleware può essere async
      await new Promise((resolve, reject) => {
        middleware(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Se risposta già inviata, interrompi chain
      if (res.headersSent) break;
    }
  }
  
  /**
   * Trova ed esegue route handler
   */
  async executeRoute(req, res) {
    const routeMap = this.routes[req.method];
    
    if (!routeMap) {
      throw { statusCode: 405, message: 'Method Not Allowed' };
    }
    
    // Cerca route esatta
    const handler = routeMap.get(req.path);
    
    if (handler) {
      await handler(req, res);
      return;
    }
    
    // Cerca route con parametri dinamici (es: /users/:id)
    for (const [pattern, handler] of routeMap) {
      const params = this.matchRoute(pattern, req.path);
      if (params) {
        req.params = params;
        await handler(req, res);
        return;
      }
    }
    
    // Nessuna route trovata
    throw { statusCode: 404, message: 'Not Found' };
  }
  
  /**
   * Match route con parametri dinamici
   */
  matchRoute(pattern, path) {
    const patternParts = pattern.split('/').filter(p => p);
    const pathParts = path.split('/').filter(p => p);
    
    if (patternParts.length !== pathParts.length) return null;
    
    const params = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      if (patternPart.startsWith(':')) {
        // Parametro dinamico
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        // Parte statica non corrisponde
        return null;
      }
    }
    
    return params;
  }
  
  /**
   * Error handler di default
   */
  defaultErrorHandler(err, req, res) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    console.error(`❌ Error ${statusCode}:`, message);
    
    if (!res.headersSent) {
      res.json(statusCode, {
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      });
    }
  }
}

// ============================================
// MIDDLEWARE: LOGGER
// ============================================

function loggerMiddleware(req, res, next) {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log quando la risposta è completata
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, path } = req;
    const { statusCode } = res;
    
    const statusIcon = statusCode < 400 ? '✓' : '❌';
    console.log(`${statusIcon} [${timestamp}] ${method} ${path} ${statusCode} - ${duration}ms`);
  });
  
  next();
}

// ============================================
// MIDDLEWARE: CORS
// ============================================

function corsMiddleware(options = {}) {
  const {
    origin = '*',
    methods = 'GET, POST, PUT, DELETE, OPTIONS',
    headers = 'Content-Type, Authorization'
  } = options;
  
  return (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', methods);
    res.setHeader('Access-Control-Allow-Headers', headers);
    
    // Risposta per preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    
    next();
  };
}

// ============================================
// MIDDLEWARE: BODY PARSER
// ============================================

function bodyParserMiddleware(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
      
      // Protezione: Limita dimensione body (1MB)
      if (body.length > 1e6) {
        req.connection.destroy();
        return next({ statusCode: 413, message: 'Body troppo grande' });
      }
    });
    
    req.on('end', () => {
      try {
        const contentType = req.headers['content-type'] || '';
        
        if (contentType.includes('application/json')) {
          req.body = JSON.parse(body);
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          req.body = querystring.parse(body);
        } else {
          req.body = body;
        }
        
        next();
      } catch (err) {
        next({ statusCode: 400, message: 'Body parsing failed' });
      }
    });
    
    req.on('error', (err) => {
      next(err);
    });
  } else {
    next();
  }
}

// ============================================
// MIDDLEWARE: RATE LIMITER
// ============================================

function rateLimiterMiddleware(options = {}) {
  const {
    windowMs = 60000, // 1 minuto
    max = 100 // Max 100 richieste per minuto
  } = options;
  
  const requests = new Map(); // IP → [timestamps]
  
  // Pulizia periodica
  setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of requests) {
      const filtered = timestamps.filter(t => now - t < windowMs);
      if (filtered.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, filtered);
      }
    }
  }, windowMs);
  
  return (req, res, next) => {
    const ip = req.socket.remoteAddress;
    const now = Date.now();
    
    const timestamps = requests.get(ip) || [];
    const recentRequests = timestamps.filter(t => now - t < windowMs);
    
    if (recentRequests.length >= max) {
      const retryAfter = Math.ceil((recentRequests[0] - now + windowMs) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return next({
        statusCode: 429,
        message: 'Too Many Requests'
      });
    }
    
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    
    // Headers informativi
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - recentRequests.length);
    
    next();
  };
}

// ============================================
// DEMO: UTILIZZO SERVER
// ============================================

// Crea server
const app = new HTTPServer();

// Registra middlewares
app
  .use(loggerMiddleware)
  .use(corsMiddleware())
  .use(bodyParserMiddleware)
  .use(rateLimiterMiddleware({ windowMs: 60000, max: 20 }));

// Registra routes
app.get('/', (req, res) => {
  res.send(`
    <h1>🚀 HTTP Server Avanzato</h1>
    <p>Server con middleware pattern</p>
    <h3>Endpoints disponibili:</h3>
    <ul>
      <li>GET /</li>
      <li>GET /api/users</li>
      <li>GET /api/users/:id</li>
      <li>POST /api/users</li>
      <li>GET /api/stats</li>
    </ul>
  `);
});

app.get('/api/users', (req, res) => {
  // Simula database
  const users = [
    { id: 1, name: 'Mario Rossi', email: 'mario@example.com' },
    { id: 2, name: 'Laura Bianchi', email: 'laura@example.com' }
  ];
  
  // Filtra per query params se presenti
  const { name } = req.query;
  const filtered = name
    ? users.filter(u => u.name.toLowerCase().includes(name.toLowerCase()))
    : users;
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  // Simula database lookup
  const users = [
    { id: 1, name: 'Mario Rossi', email: 'mario@example.com', role: 'admin' },
    { id: 2, name: 'Laura Bianchi', email: 'laura@example.com', role: 'user' }
  ];
  
  const user = users.find(u => u.id === parseInt(id));
  
  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }
  
  res.json({
    success: true,
    data: user
  });
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body || {};
  
  if (!name || !email) {
    throw { statusCode: 400, message: 'Name and email required' };
  }
  
  // Simula creazione
  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date().toISOString()
  };
  
  res.json(201, {
    success: true,
    message: 'User created',
    data: newUser
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform
    }
  });
});

// Avvia server
const PORT = 3010;
const server = app.listen(PORT, 'localhost', () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 HTTP Server Avanzato attivo su http://localhost:${PORT}/`);
  console.log(`${'='.repeat(70)}\n`);
  
  console.log('✨ MIDDLEWARE ATTIVI:');
  console.log('   ✓ Logger');
  console.log('   ✓ CORS');
  console.log('   ✓ Body Parser (JSON + URL-encoded)');
  console.log('   ✓ Rate Limiter (20 req/min)\n');
  
  console.log('📝 TEST:');
  console.log(`   curl http://localhost:${PORT}/api/users`);
  console.log(`   curl http://localhost:${PORT}/api/users/1`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/users -H "Content-Type: application/json" -d '{"name":"Test","email":"test@example.com"}'`);
  console.log('\nPremi Ctrl+C per fermare il server\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏳ Chiusura server...');
  server.close(() => {
    console.log('✓ Server chiuso');
    process.exit(0);
  });
});
