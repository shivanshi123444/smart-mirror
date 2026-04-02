// ─────────────────────────────────────────────
// public/app.js — Smart Mirror AI Frontend
// Features: Real weather, Voice input, News ticker, Calendar
// ─────────────────────────────────────────────

const socket = io();

// ── State ─────────────────────────────────────
const state = {
  chatHistory: [],
  isTyping: false,
  voiceActive: false,
  recognition: null,
  weatherData: null,
  newsData: [],
  calendarEvents: [],
};

// ── DOM refs ──────────────────────────────────
const $ = id => document.getElementById(id);
const clock    = $('clock');
const dateEl   = $('date');
const greeting = $('greeting');
const fdot     = $('fdot');
const flbl     = $('flbl');
const wtemp    = $('wtemp');
const wdesc    = $('wdesc');
const wsub     = $('wsub');
const wloc     = $('wloc');
const msgs     = $('msgs');
const inp      = $('inp');
const sendBtn  = $('send-btn');
const micBtn   = $('mic-btn');
const ticker   = $('ticker');
const orb      = $('orb');

// Weather detail elements
const humidityEl = $('humidity');
const windEl     = $('wind');
const feelsEl    = $('feels');
const sunriseEl  = $('sunrise');
const sunsetEl   = $('sunset');

// ── Clock ─────────────────────────────────────
function updateClock() {
  const now  = new Date();
  const hh   = String(now.getHours()).padStart(2, '0');
  const mm   = String(now.getMinutes()).padStart(2, '0');
  const ss   = String(now.getSeconds()).padStart(2, '0');
  clock.textContent = `${hh}:${mm}:${ss}`;

  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  dateEl.textContent = `${days[now.getDay()].toUpperCase()} · ${now.getDate()} ${months[now.getMonth()].toUpperCase()} ${now.getFullYear()}`;

  // Update greeting
  const h = now.getHours();
  const greetText = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : h < 21 ? 'Good Evening' : 'Good Night';
  greeting.textContent = greetText;
}
setInterval(updateClock, 1000);
updateClock();

// ── Face recognition (simulated) ─────────────
setTimeout(() => {
  fdot.classList.add('active');
  flbl.textContent = 'FACE RECOGNIZED';
  flbl.style.color = '#20e8a0';
}, 2000);

// ── Weather ───────────────────────────────────
function formatTime(unix) {
  if (!unix) return '--';
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function updateWeatherUI(data) {
  if (!data) return;
  state.weatherData = data;

  // Temperature
  const temp = Math.round(data.temp ?? data.main?.temp ?? 0);
  wtemp.textContent = `${temp}°C`;

  // Description
  const desc = data.description ?? data.weather?.[0]?.description ?? 'Clear';
  wdesc.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);

  // Sub line
  const feels = Math.round(data.feelsLike ?? data.main?.feels_like ?? temp);
  const humidity = data.humidity ?? data.main?.humidity ?? '--';
  wsub.textContent = `Feels ${feels}°C · ${humidity}% humidity`;

  // Location
  const city    = data.city    ?? data.name ?? 'Gurugram';
  const country = data.country ?? data.sys?.country ?? 'IN';
  wloc.textContent = `${city}, ${country}`;

  // Detail panel (bottom right)
  if (humidityEl) humidityEl.textContent = `${humidity}%`;
  if (windEl)     windEl.textContent     = `${Math.round(data.windSpeed ?? data.wind?.speed ?? 0)} km/h`;
  if (feelsEl)    feelsEl.textContent    = `${feels}°C`;
  if (sunriseEl)  sunriseEl.textContent  = formatTime(data.sunrise ?? data.sys?.sunrise);
  if (sunsetEl)   sunsetEl.textContent   = formatTime(data.sunset  ?? data.sys?.sunset);

  // Remove demo label
  wsub.textContent = wsub.textContent.replace('(demo)', '').trim();
}

// Fetch weather on load too (REST fallback)
async function fetchWeather() {
  try {
    const res  = await fetch('/api/weather');
    const json = await res.json();
    if (json.ok && json.data) updateWeatherUI(json.data);
  } catch (e) {
    console.warn('Weather fetch failed:', e.message);
  }
}
fetchWeather();

// ── News Ticker ───────────────────────────────
function updateTicker(articles) {
  if (!articles || !articles.length) return;
  state.newsData = articles;

  const items = articles
    .filter(a => a.title && a.title !== '[Removed]')
    .map(a => `<span class="tick-item">${a.title}</span>`)
    .join('<span class="tick-sep">◆</span>');

  ticker.innerHTML = items + '<span class="tick-sep">◆</span>' + items; // duplicate for seamless loop
  ticker.style.animation = 'none';
  void ticker.offsetWidth; // reflow
  ticker.style.animation  = '';

  // Adjust speed based on content length
  const totalChars = articles.reduce((a, n) => a + (n.title?.length || 0), 0);
  const duration   = Math.max(40, totalChars * 0.18);
  ticker.style.animationDuration = `${duration}s`;
}

async function fetchNews() {
  try {
    const res  = await fetch('/api/news');
    const json = await res.json();
    if (json.ok && json.data) updateTicker(json.data);
  } catch (e) {
    console.warn('News fetch failed:', e.message);
  }
}
fetchNews();

// ── Calendar Events ───────────────────────────
const DEMO_EVENTS = [
  { time: '09:30', title: 'Team standup' },
  { time: '13:00', title: 'Lunch break' },
  { time: '14:00', title: 'Product review' },
  { time: '17:00', title: 'Weekly report due' },
  { time: '19:30', title: 'Evening workout' },
];

function renderCalendar(events) {
  const eventsEl = $('events');
  if (!eventsEl) return;
  const now     = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  eventsEl.innerHTML = events.map(ev => {
    const [h, m]     = ev.time.split(':').map(Number);
    const evMins     = h * 60 + m;
    const isPast     = evMins < nowMins;
    const isCurrent  = Math.abs(evMins - nowMins) < 30;
    const cls        = isPast ? 'ev past' : isCurrent ? 'ev current' : 'ev';
    return `<div class="${cls}">
      <span class="ev-t">${ev.time}</span>
      <span class="ev-dot"></span>
      <span class="ev-x">${ev.title}</span>
    </div>`;
  }).join('');
}

async function fetchCalendar() {
  try {
    const res = await fetch('/api/calendar');
    if (res.ok) {
      const json = await res.json();
      if (json.ok && json.data?.length) {
        renderCalendar(json.data);
        return;
      }
    }
  } catch {}
  // Fallback to demo events
  renderCalendar(DEMO_EVENTS);
}
fetchCalendar();
// Re-render every minute to update past/current styling
setInterval(() => renderCalendar(state.calendarEvents.length ? state.calendarEvents : DEMO_EVENTS), 60000);

// ── Socket.IO events ──────────────────────────
socket.on('connect', () => console.log('[ARIA] Connected'));

socket.on('weather:update', data => {
  console.log('[ARIA] Weather update received', data);
  updateWeatherUI(data);
});

socket.on('news:update', data => {
  console.log('[ARIA] News update received');
  updateTicker(Array.isArray(data) ? data : data?.articles || []);
});

socket.on('ai:typing', val => {
  state.isTyping = val;
  sendBtn.textContent = val ? '...' : 'SEND';
  sendBtn.disabled    = val;
  if (val) appendMsg('bot', '...', 'typing-indicator');
  else     document.querySelectorAll('.typing-indicator').forEach(e => e.remove());
});

socket.on('ai:reply', ({ reply }) => {
  document.querySelectorAll('.typing-indicator').forEach(e => e.remove());
  appendMsg('bot', reply);
  state.chatHistory.push({ role: 'assistant', content: reply });
});

// ── Chat ──────────────────────────────────────
function appendMsg(who, text, extraClass = '') {
  const div = document.createElement('div');
  div.className = `msg ${who}${extraClass ? ' ' + extraClass : ''}`;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function sendMessage(text) {
  if (!text.trim() || state.isTyping) return;
  appendMsg('user', text);
  state.chatHistory.push({ role: 'user', content: text });
  inp.value = '';

  socket.emit('ai:message', {
    message: text,
    history: state.chatHistory.slice(-10),
  });
}

sendBtn.addEventListener('click', () => sendMessage(inp.value));
inp.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(inp.value); });

// Slash to focus input
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== inp) {
    e.preventDefault();
    inp.focus();
  }
});

// Orb click → morning briefing
orb.addEventListener('click', async () => {
  orb.classList.add('pulse');
  setTimeout(() => orb.classList.remove('pulse'), 1000);
  sendMessage('Give me a morning briefing with weather and news highlights.');
});

// ── Voice Input ───────────────────────────────
function setupVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micBtn.title  = 'Voice input not supported in this browser';
    micBtn.style.opacity = '0.4';
    micBtn.addEventListener('click', () => {
      appendMsg('bot', '⚠️ Voice input is only supported in Chrome or Edge. Please type your message instead.');
    });
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous    = false;
  recognition.interimResults = true;
  recognition.lang          = 'en-IN'; // Indian English; change to 'hi-IN' for Hindi

  recognition.onstart = () => {
    state.voiceActive = true;
    micBtn.classList.add('recording');
    micBtn.textContent = '🔴';
    inp.placeholder   = 'Listening...';
  };

  recognition.onresult = e => {
    const transcript = Array.from(e.results)
      .map(r => r[0].transcript)
      .join('');
    inp.value = transcript;

    if (e.results[e.results.length - 1].isFinal) {
      sendMessage(transcript);
      stopVoice();
    }
  };

  recognition.onerror = e => {
    console.warn('Voice error:', e.error);
    const msgs = {
      'not-allowed'  : '⚠️ Microphone access denied. Please allow mic permissions.',
      'no-speech'    : '⚠️ No speech detected. Try again.',
      'network'      : '⚠️ Network error during voice recognition.',
      'audio-capture': '⚠️ No microphone found.',
    };
    appendMsg('bot', msgs[e.error] || `⚠️ Voice error: ${e.error}`);
    stopVoice();
  };

  recognition.onend = () => stopVoice();

  function stopVoice() {
    state.voiceActive   = false;
    micBtn.classList.remove('recording');
    micBtn.textContent  = '🎤';
    inp.placeholder     = 'Ask ARIA anything... (or press /)';
    try { recognition.stop(); } catch {}
  }

  micBtn.addEventListener('click', () => {
    if (state.voiceActive) {
      stopVoice();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  });

  state.recognition = recognition;

  // Also support Hindi toggle via long-press
  let pressTimer;
  micBtn.addEventListener('mousedown',  () => { pressTimer = setTimeout(() => toggleLang(recognition), 600); });
  micBtn.addEventListener('mouseup',    () => clearTimeout(pressTimer));
  micBtn.addEventListener('touchstart', () => { pressTimer = setTimeout(() => toggleLang(recognition), 600); }, { passive: true });
  micBtn.addEventListener('touchend',   () => clearTimeout(pressTimer));
}

let voiceLang = 'en-IN';
function toggleLang(recognition) {
  voiceLang = voiceLang === 'en-IN' ? 'hi-IN' : 'en-IN';
  recognition.lang = voiceLang;
  appendMsg('bot', voiceLang === 'hi-IN' ? '🎤 Voice language switched to Hindi' : '🎤 Voice language switched to English');
}

setupVoice();

// ── Health widget simulation ──────────────────
// Animate health bars on load
setTimeout(() => {
  document.querySelectorAll('.hfill').forEach(bar => {
    const target = bar.style.width;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target; }, 100);
  });
}, 500);