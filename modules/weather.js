// ─────────────────────────────────────────────
// modules/weather.js — OpenWeatherMap
// ─────────────────────────────────────────────
const https   = require('https');
const config  = require('../config');

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 min

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from weather API')); }
      });
    }).on('error', reject);
  });
}

async function getWeather() {
  const now = Date.now();
  if (cache && (now - cacheTime) < CACHE_TTL) return cache;

  const { apiKey, city, country, units } = config.weather;

  // Demo mode if no API key
  if (!apiKey || apiKey === '' || apiKey === 'your_key_here') {
    cache = getDemoWeather();
    cacheTime = now;
    return cache;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},${country}&units=${units}&appid=${apiKey}`;

  const raw = await fetchJSON(url);

  if (raw.cod !== 200) {
    throw new Error(`Weather API: ${raw.message || 'Unknown error'}`);
  }

  // Normalize to flat structure for easy frontend use
  cache = {
    temp:        Math.round(raw.main.temp),
    feelsLike:   Math.round(raw.main.feels_like),
    humidity:    raw.main.humidity,
    description: raw.weather[0].description,
    icon:        raw.weather[0].icon,
    windSpeed:   Math.round(raw.wind?.speed * 3.6 || 0), // m/s → km/h
    windDir:     raw.wind?.deg || 0,
    city:        raw.name,
    country:     raw.sys?.country || country,
    sunrise:     raw.sys?.sunrise,
    sunset:      raw.sys?.sunset,
    pressure:    raw.main.pressure,
    visibility:  raw.visibility ? Math.round(raw.visibility / 1000) : null,
    clouds:      raw.clouds?.all || 0,
    isDemo:      false,
    updatedAt:   new Date().toISOString(),
  };

  cacheTime = now;
  return cache;
}

function getDemoWeather() {
  const hour = new Date().getHours();
  return {
    temp:        29,
    feelsLike:   32,
    humidity:    62,
    description: hour < 6 ? 'clear sky' : hour < 12 ? 'partly cloudy' : hour < 18 ? 'partly cloudy' : 'clear sky',
    icon:        '02d',
    windSpeed:   14,
    windDir:     220,
    city:        config.weather.city || 'Gurugram',
    country:     config.weather.country || 'IN',
    sunrise:     null,
    sunset:      null,
    pressure:    1013,
    visibility:  10,
    clouds:      30,
    isDemo:      true,
    updatedAt:   new Date().toISOString(),
  };
}

module.exports = { getWeather };