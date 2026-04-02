// modules/news.js — NewsAPI (FREE tier)
const fetch = require('node-fetch');
const config = require('../config');

let cache = null;
let lastFetch = 0;

async function getNews() {
  const now = Date.now();
  if (cache && now - lastFetch < config.news.refreshInterval) return cache;

  if (!config.news.apiKey || config.news.apiKey === 'your_newsapi_key_here') {
    return getMock();
  }

  const url = `https://newsapi.org/v2/top-headlines?country=${config.news.country}&pageSize=${config.news.pageSize}&apiKey=${config.news.apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn('[News] API error, using mock data');
    return getMock();
  }

  const data = await res.json();
  cache = data.articles.map(a => ({
    title: a.title?.replace(/ - .*$/, '') || '',
    source: a.source.name,
    url: a.url,
  })).filter(a => a.title);
  lastFetch = now;
  return cache;
}

function getMock() {
  return [
    { title: 'India tech sector growth surges in Q1 2026', source: 'Tech Times' },
    { title: 'AI adoption in enterprise up 40% year over year', source: 'Business Today' },
    { title: 'Gurugram ranked top smart city in Haryana 2026', source: 'Hindustan Times' },
    { title: 'Monsoon forecast — above-normal rainfall expected', source: 'India Today' },
    { title: 'Electric vehicle sales cross 1 million in India', source: 'Auto News' },
    { title: 'New metro line to connect Gurugram to Delhi by 2027', source: 'TOI' },
    { title: 'ISRO announces next lunar mission launch window', source: 'Space India' },
    { title: 'India GDP growth forecast revised upward to 7.2%', source: 'Economic Times' },
  ];
}

module.exports = { getNews };
