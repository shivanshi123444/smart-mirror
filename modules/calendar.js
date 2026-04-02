// modules/calendar.js — Smart Mirror Calendar
const fs   = require('fs');
const path = require('path');

let cache     = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000;

function getDemoEvents() {
  return [
    { time: '09:30', title: 'Team standup' },
    { time: '13:00', title: 'Lunch break' },
    { time: '14:00', title: 'Product review' },
    { time: '17:00', title: 'Weekly report due' },
    { time: '19:30', title: 'Evening workout' },
  ];
}

function getLocalEvents() {
  const filePath = path.join(__dirname, '../data/events.json');
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw   = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const today = new Date().toISOString().slice(0, 10);
    return raw[today] || raw.default || null;
  } catch { return null; }
}

async function getCalendar() {
  const now = Date.now();
  if (cache && (now - cacheTime) < CACHE_TTL) return cache;

  const events  = getLocalEvents() || getDemoEvents();
  cache         = events;
  cacheTime     = now;
  return events;
}

module.exports = { getCalendar };