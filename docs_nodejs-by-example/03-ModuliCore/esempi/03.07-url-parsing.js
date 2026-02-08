/**
 * ESEMPIO 03.07 - Parsing e Manipolazione URL
 * 
 * Questo esempio mostra come usare il modulo URL per analizzare e costruire URL.
 * 
 * CONCETTI CHIAVE:
 * - URL API (WHATWG): Standard moderno per URL
 * - URL components: protocol, hostname, port, pathname, search, hash
 * - URLSearchParams: Gestione query parameters
 * - URL parsing: Estrazione componenti da stringa URL
 * - URL construction: Creazione URL da componenti
 * 
 * COMPONENTI URL:
 * https://user:pass@example.com:8080/path/to/resource?key=value#section
 * └─┬─┘   └───┬───┘ └────┬────┘└┬─┘ └──────┬──────┘ └────┬────┘ └──┬──┘
 *   │         │          │      │          │             │         │
 * protocol username  hostname port     pathname       search     hash
 *          password
 * 
 * NOTA: Usa la nuova API URL (WHATWG) invece del modulo url legacy
 */

const { URL, URLSearchParams } = require('url');

// ============================================
// ESEMPIO 1: PARSING URL COMPLETO
// ============================================

function example1_ParsingURL() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 1: Parsing URL Completo');
  console.log('='.repeat(70));
  
  const urlString = 'https://user:password@example.com:8080/api/users/123?role=admin&active=true#profile';
  
  console.log(`\n📋 URL Originale:\n${urlString}\n`);
  
  // Parse dell'URL usando URL API
  const parsedUrl = new URL(urlString);
  
  console.log('📦 COMPONENTI ESTRATTI:\n');
  console.log(`Protocol:   ${parsedUrl.protocol}`);
  console.log(`Username:   ${parsedUrl.username}`);
  console.log(`Password:   ${parsedUrl.password}`);
  console.log(`Hostname:   ${parsedUrl.hostname}`);
  console.log(`Port:       ${parsedUrl.port}`);
  console.log(`Host:       ${parsedUrl.host}`);
  console.log(`Pathname:   ${parsedUrl.pathname}`);
  console.log(`Search:     ${parsedUrl.search}`);
  console.log(`Hash:       ${parsedUrl.hash}`);
  console.log(`Origin:     ${parsedUrl.origin}`);
  console.log(`Href:       ${parsedUrl.href}`);
}

// ============================================
// ESEMPIO 2: QUERY PARAMETERS
// ============================================

function example2_QueryParams() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 2: Gestione Query Parameters');
  console.log('='.repeat(70));
  
  const url = new URL('https://api.example.com/search?q=nodejs&category=backend&limit=10');
  
  console.log('\n📋 URL:', url.href);
  console.log('\n🔍 Query Parameters:\n');
  
  // Metodo 1: Accesso diretto
  console.log('Search string:', url.search);
  
  // Metodo 2: URLSearchParams
  const params = url.searchParams;
  
  console.log('\nValori individuali:');
  console.log('  q =', params.get('q'));
  console.log('  category =', params.get('category'));
  console.log('  limit =', params.get('limit'));
  
  // Iterazione su tutti i parametri
  console.log('\nTutti i parametri:');
  for (const [key, value] of params) {
    console.log(`  ${key} = ${value}`);
  }
  
  // Aggiungere/modificare parametri
  console.log('\n➕ Modifica parametri:');
  params.append('sort', 'date');
  params.set('limit', '20'); // Cambia valore esistente
  params.delete('category'); // Rimuovi parametro
  
  console.log('URL modificato:', url.href);
  
  // Creare URLSearchParams da oggetto
  console.log('\n🏗️  Creazione da oggetto:');
  const newParams = new URLSearchParams({
    page: '1',
    perPage: '25',
    sortBy: 'name',
    order: 'asc'
  });
  
  console.log('Query string:', newParams.toString());
}

// ============================================
// ESEMPIO 3: COSTRUZIONE URL
// ============================================

function example3_BuildingURL() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 3: Costruzione URL');
  console.log('='.repeat(70));
  
  // Metodo 1: Da componenti separate
  console.log('\n🏗️  Metodo 1: Costruzione da base + path');
  
  const baseUrl = 'https://api.github.com';
  const endpoint = '/repos/nodejs/node';
  
  const url1 = new URL(endpoint, baseUrl);
  console.log('URL:', url1.href);
  
  // Metodo 2: Con query parameters
  console.log('\n🏗️  Metodo 2: Con query parameters');
  
  const url2 = new URL('https://api.example.com/users');
  url2.searchParams.set('role', 'admin');
  url2.searchParams.set('active', 'true');
  url2.searchParams.set('limit', '50');
  
  console.log('URL:', url2.href);
  
  // Metodo 3: Da template
  console.log('\n🏗️  Metodo 3: URL Template Builder');
  
  function buildAPIUrl(base, path, params = {}) {
    const url = new URL(path, base);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.href;
  }
  
  const apiUrl = buildAPIUrl(
    'https://api.example.com',
    '/v1/products',
    { category: 'electronics', minPrice: 100, maxPrice: 500, inStock: true }
  );
  
  console.log('API URL:', apiUrl);
}

// ============================================
// ESEMPIO 4: VALIDAZIONE E NORMALIZZAZIONE
// ============================================

function example4_ValidationNormalization() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 4: Validazione e Normalizzazione URL');
  console.log('='.repeat(70));
  
  const testUrls = [
    'https://example.com/path',
    'http://EXAMPLE.COM/PATH',
    'https://example.com:443/path',
    'https://example.com//double//slashes',
    'invalid-url',
    'ftp://example.com/file.txt',
    'https://example.com/path?a=1&a=2&b=3'
  ];
  
  console.log('\n🧪 Test validazione URL:\n');
  
  testUrls.forEach((urlString, i) => {
    console.log(`${i + 1}. "${urlString}"`);
    
    try {
      const url = new URL(urlString);
      
      // URL valido
      console.log('   ✓ VALIDO');
      console.log(`   Normalizzato: ${url.href}`);
      console.log(`   Protocol: ${url.protocol}`);
      
      // Check if HTTPS
      if (url.protocol === 'https:') {
        console.log('   🔒 Secure (HTTPS)');
      }
      
    } catch (err) {
      // URL non valido
      console.log('   ❌ NON VALIDO');
      console.log(`   Errore: ${err.message}`);
    }
    
    console.log();
  });
}

// ============================================
// ESEMPIO 5: MANIPOLAZIONE PATHNAME
// ============================================

function example5_PathManipulation() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 5: Manipolazione Pathname');
  console.log('='.repeat(70));
  
  const url = new URL('https://example.com/api/v1/users/123');
  
  console.log('\n📋 URL Originale:', url.href);
  console.log('Pathname:', url.pathname);
  
  // Split pathname in segments
  const segments = url.pathname.split('/').filter(s => s);
  console.log('\nSegmenti:', segments);
  
  // Estrai informazioni
  console.log('\n📊 Analisi:');
  console.log('  Base:', segments[0]); // 'api'
  console.log('  Version:', segments[1]); // 'v1'
  console.log('  Resource:', segments[2]); // 'users'
  console.log('  ID:', segments[3]); // '123'
  
  // Modifica pathname
  console.log('\n🔧 Modifiche:');
  
  url.pathname = '/api/v2/users/123'; // Upgrade version
  console.log('Version upgrade:', url.href);
  
  url.pathname = '/api/v2/users/123/posts'; // Add nested resource
  console.log('Nested resource:', url.href);
}

// ============================================
// ESEMPIO 6: CASI D'USO PRATICI
// ============================================

function example6_PracticalUseCases() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 6: Casi d\'Uso Pratici');
  console.log('='.repeat(70));
  
  // Caso 1: Redirect con query params preservati
  console.log('\n🔀 Caso 1: Redirect preservando query params');
  
  const originalUrl = new URL('https://old-site.com/page?ref=email&utm_source=newsletter');
  const redirectUrl = new URL('https://new-site.com/page');
  
  // Copia i query params
  originalUrl.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });
  
  console.log('Original:', originalUrl.href);
  console.log('Redirect:', redirectUrl.href);
  
  // Caso 2: URL builder per API REST
  console.log('\n🛠️  Caso 2: REST API URL Builder');
  
  class APIURLBuilder {
    constructor(baseUrl) {
      this.baseUrl = baseUrl;
    }
    
    build(resource, id = null, action = null, filters = {}) {
      let path = `/api/v1/${resource}`;
      
      if (id) path += `/${id}`;
      if (action) path += `/${action}`;
      
      const url = new URL(path, this.baseUrl);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.set(key, value);
        }
      });
      
      return url.href;
    }
  }
  
  const api = new APIURLBuilder('https://api.example.com');
  
  console.log('List users:', api.build('users', null, null, { page: 1, limit: 10 }));
  console.log('Get user:', api.build('users', 123));
  console.log('User posts:', api.build('users', 123, 'posts'));
  console.log('Filtered posts:', api.build('posts', null, null, { author: 'john', published: true }));
  
  // Caso 3: Sanitizzazione URL user input
  console.log('\n🧹 Caso 3: Sanitizzazione URL da input utente');
  
  function sanitizeURL(userInput) {
    try {
      const url = new URL(userInput);
      
      // Permetti solo HTTP/HTTPS
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Protocol non permesso');
      }
      
      // Rimuovi credenziali se presenti
      url.username = '';
      url.password = '';
      
      return url.href;
      
    } catch (err) {
      throw new Error(`URL non valido: ${err.message}`);
}
  }
  
  console.log('Input:', 'https://user:pass@example.com/path');
  console.log('Sanitized:', sanitizeURL('https://user:pass@example.com/path'));
}

// ============================================
// ESECUZIONE ESEMPI
// ============================================

console.log('\n' + '🚀'.repeat(35));
console.log('URL PARSING E MANIPOLAZIONE - ESEMPI COMPLETI');
console.log('🚀'.repeat(35));

example1_ParsingURL();
example2_QueryParams();
example3_BuildingURL();
example4_ValidationNormalization();
example5_PathManipulation();
example6_PracticalUseCases();

console.log('\n' + '='.repeat(70));
console.log('✅ Tutti gli esempi completati!');
console.log('='.repeat(70));
console.log('\n💡 TIPS:');
console.log('   - Usa sempre new URL() per parsing e validazione');
console.log('   - URLSearchParams è perfetto per query strings');
console.log('   - URL objects sono immutabili e type-safe');
console.log('   - Valida sempre gli URL da user input');
console.log('   - Preferisci URL API (WHATWG) al modulo url legacy\n');
