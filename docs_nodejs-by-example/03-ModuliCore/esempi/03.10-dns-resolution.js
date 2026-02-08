/**
 * ESEMPIO 03.10 - DNS Resolution
 * 
 * Questo esempio mostra come usare il modulo DNS di Node.js per risolvere nomi di dominio.
 * 
 * CONCETTI CHIAVE:
 * - DNS (Domain Name System): Sistema che traduce nomi di dominio in indirizzi IP
 * - DNS Records: A (IPv4), AAAA (IPv6), MX (mail), CNAME (alias), TXT (text), ecc.
 * - dns.lookup(): Usa sistema operativo per risoluzione (comportamento sistema)
 * - dns.resolve(): Risoluzione diretta DNS (più controllo, più dettagli)
 * - Reverse DNS: IP → hostname
 * 
 * DIFFERENZA lookup vs resolve:
 * - lookup: Usa getaddrinfo() del OS, considera /etc/hosts
 * - resolve: Query diretta ai DNS servers, non usa cache OS
 * 
 * RECORD TYPES:
 * - A: IPv4 address
 * - AAAA: IPv6 address
 * - MX: Mail exchange
 * - TXT: Text records
 * - CNAME: Canonical name (alias)
 * - NS: Name server
 * - SOA: Start of authority
 */

const dns = require('dns');
const { promisify } = require('util');

// Converti callbacks in promises per uso più comodo
const lookup = promisify(dns.lookup);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);
const resolveNs = promisify(dns.resolveNs);
const resolveSoa = promisify(dns.resolveSoa);
const reverse = promisify(dns.reverse);

// ============================================
// ESEMPIO 1: BASIC LOOKUP (IPv4 + IPv6)
// ============================================

async function example1_BasicLookup() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 1: Basic DNS Lookup');
  console.log('='.repeat(70));
  
  const domains = ['google.com', 'github.com', 'nodejs.org'];
  
  for (const domain of domains) {
    console.log(`\n🔍 Lookup: ${domain}`);
    
    try {
      // Default: IPv4
      const { address, family } = await lookup(domain);
      console.log(`  ✓ Address: ${address} (IPv${family})`);
      
      // Prova anche IPv6 (se disponibile)
      try {
        const ipv6 = await lookup(domain, { family: 6 });
        console.log(`  ✓ IPv6:    ${ipv6.address}`);
      } catch (err) {
        console.log(`  ℹ️  IPv6:    Non disponibile`);
      }
      
    } catch (err) {
      console.error(`  ❌ Errore: ${err.message}`);
    }
  }
}

// ============================================
// ESEMPIO 2: RESOLVE A RECORDS (IPv4)
// ============================================

async function example2_ResolveA() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 2: Resolve A Records (IPv4)');
  console.log('='.repeat(70));
  
  const domain = 'google.com';
  
  console.log(`\n🌐 Resolving A records for ${domain}...`);
  
  try {
    const addresses = await resolve4(domain);
    
    console.log(`  ✓ Trovati ${addresses.length} indirizzi IPv4:\n`);
    addresses.forEach((addr, i) => {
      console.log(`    ${i + 1}. ${addr}`);
    });
    
    // Con TTL (Time To Live)
    console.log(`\n📋 Con TTL:`);
    const recordsWithTTL = await resolve4(domain, { ttl: true });
    recordsWithTTL.forEach((record, i) => {
      console.log(`    ${i + 1}. ${record.address} (TTL: ${record.ttl}s)`);
    });
    
  } catch (err) {
    console.error(`  ❌ Errore: ${err.message}`);
  }
}

// ============================================
// ESEMPIO 3: MX RECORDS (Mail Exchange)
// ============================================

async function example3_ResolveMX() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 3: MX Records (Mail Servers)');
  console.log('='.repeat(70));
  
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com'];
  
  for (const domain of domains) {
    console.log(`\n📧 Mail servers per ${domain}:`);
    
    try {
      const mxRecords = await resolveMx(domain);
      
      // Ordina per priorità (lower = higher priority)
      mxRecords.sort((a, b) => a.priority - b.priority);
      
      mxRecords.forEach((mx, i) => {
        console.log(`  ${i + 1}. [Priority ${mx.priority}] ${mx.exchange}`);
      });
      
    } catch (err) {
      console.error(`  ❌ Errore: ${err.message}`);
    }
  }
}

// ============================================
// ESEMPIO 4: TXT RECORDS
// ============================================

async function example4_ResolveTXT() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 4: TXT Records');
  console.log('='.repeat(70));
  
  // TXT records sono usati per verifiche, SPF, DKIM, ecc.
  const domains = ['google.com', 'github.com'];
  
  for (const domain of domains) {
    console.log(`\n📝 TXT records per ${domain}:`);
    
    try {
      const txtRecords = await resolveTxt(domain);
      
      txtRecords.forEach((record, i) => {
        // Ogni record è un array di stringhe
        const text = record.join('');
        console.log(`  ${i + 1}. ${text.substring(0, 80)}${text.length > 80 ? '...' : ''}`);
      });
      
    } catch (err) {
      console.error(`  ❌ Errore: ${err.message}`);
    }
  }
}

// ============================================
// ESEMPIO 5: NAME SERVERS
// ============================================

async function example5_ResolveNS() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 5: Name Servers');
  console.log('='.repeat(70));
  
  const domain = 'google.com';
  
  console.log(`\n🖥️  Name servers per ${domain}:`);
  
  try {
    const nameservers = await resolveNs(domain);
    
    nameservers.forEach((ns, i) => {
      console.log(`  ${i + 1}. ${ns}`);
    });
    
  } catch (err) {
    console.error(`  ❌ Errore: ${err.message}`);
  }
}

// ============================================
// ESEMPIO 6: REVERSE DNS (IP → Hostname)
// ============================================

async function example6_ReverseDNS() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 6: Reverse DNS (IP → Hostname)');
  console.log('='.repeat(70));
  
  const ips = [
    '8.8.8.8',      // Google Public DNS
    '1.1.1.1',      // Cloudflare DNS
    '208.67.222.222' // OpenDNS
  ];
  
  for (const ip of ips) {
    console.log(`\n🔄 Reverse lookup: ${ip}`);
    
    try {
      const hostnames = await reverse(ip);
      
      if (hostnames.length > 0) {
        console.log(`  ✓ Hostname: ${hostnames[0]}`);
        
        if (hostnames.length > 1) {
          console.log(`  ℹ️  Altri: ${hostnames.slice(1).join(', ')}`);
        }
      } else {
        console.log(`  ℹ️  Nessun hostname trovato`);
      }
      
    } catch (err) {
      console.error(`  ❌ Errore: ${err.message}`);
    }
  }
}

// ============================================
// ESEMPIO 7: SOA RECORD (Start of Authority)
// ============================================

async function example7_ResolveSOA() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 7: SOA Record (Start of Authority)');
  console.log('='.repeat(70));
  
  const domain = 'google.com';
  
  console.log(`\n📊 SOA record per ${domain}:`);
  
  try {
    const soa = await resolveSoa(domain);
    
    console.log(`  Primary NS:   ${soa.nsname}`);
    console.log(`  Admin:        ${soa.hostmaster}`);
    console.log(`  Serial:       ${soa.serial}`);
    console.log(`  Refresh:      ${soa.refresh}s`);
    console.log(`  Retry:        ${soa.retry}s`);
    console.log(`  Expire:       ${soa.expire}s`);
    console.log(`  Min TTL:      ${soa.minttl}s`);
    
  } catch (err) {
    console.error(`  ❌ Errore: ${err.message}`);
  }
}

// ============================================
// ESEMPIO 8: DNS LOOKUP MULTIPLI (Performance)
// ============================================

async function example8_ParallelLookups() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 8: Lookup Paralleli (Performance Test)');
  console.log('='.repeat(70));
  
  const domains = [
    'google.com',
    'github.com',
    'stackoverflow.com',
    'nodejs.org',
    'npmjs.com',
    'microsoft.com',
    'apple.com',
    'amazon.com'
  ];
  
  console.log(`\n⚡ Lookup di ${domains.length} domini in parallelo...\n`);
  
  const startTime = Date.now();
  
  // Esegui tutti i lookup in parallelo
  const promises = domains.map(async (domain) => {
    try {
      const startDomain = Date.now();
      const { address } = await lookup(domain);
      const time = Date.now() - startDomain;
      
      return {
        domain,
        address,
        time,
        success: true
      };
    } catch (err) {
      return {
        domain,
        error: err.message,
        success: false
      };
    }
  });
  
  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;
  
  // Mostra risultati
  results.forEach((result) => {
    if (result.success) {
      console.log(`✓ ${result.domain.padEnd(25)} → ${result.address.padEnd(15)} (${result.time}ms)`);
    } else {
      console.log(`❌ ${result.domain.padEnd(25)} → Errore: ${result.error}`);
    }
  });
  
  const successful = results.filter(r => r.success).length;
  const avgTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.time, 0) / successful;
  
  console.log(`\n📊 STATISTICHE:`);
  console.log(`  Totale:       ${results.length} lookup`);
  console.log(`  Successi:     ${successful}`);
  console.log(`  Falliti:      ${results.length - successful}`);
  console.log(`  Tempo totale: ${totalTime}ms`);
  console.log(`  Tempo medio:  ${avgTime.toFixed(2)}ms`);
}

// ============================================
// ESEMPIO 9: DNS SERVER PERSONALIZZATO
// ============================================

async function example9_CustomDNSServer() {
  console.log('\n' + '='.repeat(70));
  console.log('ESEMPIO 9: DNS Server Personalizzato');
  console.log('='.repeat(70));
  
  // Imposta DNS server custom (Google Public DNS)
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  
  console.log('\n🖥️  Server DNS configurati:');
  const servers = dns.getServers();
  servers.forEach((server, i) => {
    console.log(`  ${i + 1}. ${server}`);
  });
  
  console.log('\n🔍 Test lookup con server custom...');
  
  try {
    const { address } = await lookup('example.com');
    console.log(`  ✓ example.com → ${address}`);
  } catch (err) {
    console.error(`  ❌ Errore: ${err.message}`);
  }
  
  // Ripristina default
  dns.setServers([]);
  console.log('\n✓ Server DNS ripristinati ai valori di default');
}

// ============================================
// ESECUZIONE ESEMPI
// ============================================

async function runExamples() {
  console.log('\n' + '🚀'.repeat(35));
  console.log('DNS RESOLUTION - ESEMPI COMPLETI');
  console.log('🚀'.repeat(35));
  
  await example1_BasicLookup();
  await example2_ResolveA();
  await example3_ResolveMX();
  await example4_ResolveTXT();
  await example5_ResolveNS();
  await example6_ReverseDNS();
  await example7_ResolveSOA();
  await example8_ParallelLookups();
  await example9_CustomDNSServer();
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Tutti gli esempi completati!');
  console.log('='.repeat(70));
  console.log('\n💡 TIPS:');
  console.log('   - lookup() usa il sistema operativo (considera /etc/hosts)');
  console.log('   - resolve*() fa query diretta ai DNS servers');
  console.log('   - I lookup paralleli migliorano significativamente le performance');
  console.log('   - Imposta DNS custom con dns.setServers() se necessario');
  console.log('   - Gestisci sempre errori DNS (ENOTFOUND, ETIMEOUT, ecc.)');
  console.log('   - Considera cache DNS per ridurre query\n');
}

// Esegui tutti gli esempi
runExamples().catch(err => {
  console.error('\n❌ Errore fatale:', err);
  process.exit(1);
});
