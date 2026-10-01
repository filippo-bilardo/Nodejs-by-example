/**
 * Mostra nel terminale il meteo attuale di Milano usando Open-Meteo.
 * Richiede Node.js 18 o successivo e una connessione Internet.
 * Esecuzione: node meteo-milano.js
 * Documentazione: https://open-meteo.com/en/docs
 */

// I codici WMO restituiti dal servizio descrivono le condizioni atmosferiche.
const condizioni = {
  0: 'Cielo sereno',
  1: 'Prevalentemente sereno',
  2: 'Parzialmente nuvoloso',
  3: 'Coperto',
  45: 'Nebbia',
  48: 'Nebbia con brina',
  51: 'Pioviggine leggera',
  53: 'Pioviggine moderata',
  55: 'Pioviggine intensa',
  56: 'Pioviggine gelata leggera',
  57: 'Pioviggine gelata intensa',
  61: 'Pioggia debole',
  63: 'Pioggia moderata',
  65: 'Pioggia forte',
  66: 'Pioggia gelata debole',
  67: 'Pioggia gelata forte',
  71: 'Neve debole',
  73: 'Neve moderata',
  75: 'Neve forte',
  77: 'Neve granulosa',
  80: 'Rovesci di pioggia deboli',
  81: 'Rovesci di pioggia moderati',
  82: 'Rovesci di pioggia violenti',
  85: 'Rovesci di neve deboli',
  86: 'Rovesci di neve forti',
  95: 'Temporale',
  96: 'Temporale con grandine debole',
  97: 'Temporale forte',
  99: 'Temporale con grandine forte',
};

async function mostraMeteo() {
  // Coordinate del centro di Milano e orari nel fuso locale italiano.
  const parametri = new URLSearchParams({
    latitude: '45.4642',
    longitude: '9.1900',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    timezone: 'Europe/Rome',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
  });

  try {
    // fetch è integrato in Node.js: non occorre installare librerie.
    const risposta = await fetch(`https://api.open-meteo.com/v1/forecast?${parametri}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!risposta.ok) {
      throw new Error(`Il servizio meteo ha risposto con HTTP ${risposta.status}`);
    }

    const dati = await risposta.json();
    if (dati.error) {
      throw new Error(dati.reason || 'Errore restituito dal servizio meteo');
    }

    const meteo = dati.current;
    if (!meteo || typeof meteo.time !== 'string') {
      throw new Error('La risposta del servizio non contiene il meteo attuale');
    }

    // Un valore assente non deve essere confuso con una misura pari a zero.
    const misura = (valore, unita) => Number.isFinite(valore)
      ? `${valore.toLocaleString('it-IT')} ${unita}`
      : 'Non disponibile';

    console.log('\nMeteo attuale di Milano');
    // Il servizio restituisce già l'orario locale: non lo riconvertiamo.
    console.log(`Data e ora: ${meteo.time.replace('T', ' ')} (Europe/Rome)`);
    console.log(`Condizioni: ${condizioni[meteo.weather_code] ?? 'Non disponibili'}`);
    console.log(`Temperatura: ${misura(meteo.temperature_2m, '°C')}`);
    console.log(`Temperatura percepita: ${misura(meteo.apparent_temperature, '°C')}`);
    console.log(`Umidità: ${misura(meteo.relative_humidity_2m, '%')}`);
    console.log(`Vento: ${misura(meteo.wind_speed_10m, 'km/h')}`);
    console.log('Fonte: Open-Meteo — https://open-meteo.com/\n');
  } catch (errore) {
    const messaggio = errore.name === 'TimeoutError'
      ? 'Il servizio non ha risposto entro 10 secondi'
      : errore.message;
    console.error(`Impossibile recuperare il meteo: ${messaggio}`);
    process.exitCode = 1;
  }
}

mostraMeteo();
