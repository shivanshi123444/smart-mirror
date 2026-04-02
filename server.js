// ─────────────────────────────────────────────
// server.js — Smart Mirror AI
// ─────────────────────────────────────────────
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const path       = require('path');
const config     = require('./config');
const weather    = require('./modules/weather');
const news       = require('./modules/news');
// server.js — this line must be:
const calendar = require('./modules/calendar');
const ai         = require('./modules/ai-assistant');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── REST endpoints ────────────────────────────

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/api/weather', async (req, res) => {
  try { res.json({ ok: true, data: await weather.getWeather() }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/news', async (req, res) => {
  try { res.json({ ok: true, data: await news.getNews() }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.get('/api/calendar', async (req, res) => {
  try { res.json({ ok: true, data: await calendar.getCalendar() }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/chat', async (req, res) => {
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: 'message required' });
  try { res.json({ ok: true, reply: await ai.chat(message, history || []) }); }
  catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// ── Socket.IO ─────────────────────────────────

io.on('connection', async (socket) => {
  console.log(`[Mirror] Client connected: ${socket.id}`);

  // Push all data on connect
  try { socket.emit('weather:update',  await weather.getWeather());    } catch (e) { console.warn('Weather push failed:', e.message); }
  try { socket.emit('news:update',     await news.getNews());          } catch (e) { console.warn('News push failed:', e.message); }
  try { socket.emit('calendar:update', await calendar.getCalendar());  } catch (e) { console.warn('Calendar push failed:', e.message); }

  // AI chat
  socket.on('ai:message', async ({ message, history }) => {
    try {
      socket.emit('ai:typing', true);
      const reply = await ai.chat(message, history || []);
      socket.emit('ai:reply', { reply });
    } catch (err) {
      socket.emit('ai:reply', { reply: `⚠️ ${err.message}` });
    } finally {
      socket.emit('ai:typing', false);
    }
  });

  socket.on('disconnect', () =>
    console.log(`[Mirror] Disconnected: ${socket.id}`));
});

// ── Auto-refresh ──────────────────────────────

setInterval(async () => {
  try { io.emit('weather:update', await weather.getWeather()); } catch {}
}, config.weather.refreshInterval);

setInterval(async () => {
  try { io.emit('news:update', await news.getNews()); } catch {}
}, config.news.refreshInterval);

setInterval(async () => {
  try { io.emit('calendar:update', await calendar.getCalendar()); } catch {}
}, 5 * 60 * 1000); // every 5 min

// ── Start ─────────────────────────────────────

server.listen(config.port, () => {
  console.log(`\n🪞  Smart Mirror AI`);
  console.log(`    http://localhost:${config.port}`);
  console.log(`    Weather: ${config.weather.apiKey ? '✅ Live' : '⚠️  Demo mode (add OPENWEATHER_API_KEY)'}`);
  console.log(`    News:    ${config.news.apiKey    ? '✅ Live' : '⚠️  Demo mode (add NEWS_API_KEY)'}`);
  console.log(`    Press Ctrl+C to stop\n`);
});