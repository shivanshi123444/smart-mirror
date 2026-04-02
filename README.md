# 🪞 Smart Mirror AI — 100% Free APIs

AI-powered smart mirror using **Groq (free)**, **OpenWeatherMap (free)**, and **NewsAPI (free)**.

---

## Step 1 — Get Your FREE API Keys

### 🤖 Groq AI Key (replaces paid ChatGPT/Claude)
1. Go to → https://console.groq.com/
2. Click **Sign Up** (free, no credit card)
3. After login → **API Keys** → **Create API Key**
4. Copy the key → paste in `.env` as `GROQ_API_KEY`
- Free limit: **14,400 requests/day** ✅

### 🌤️ OpenWeatherMap Key (weather)
1. Go to → https://openweathermap.org/api
2. Click **Sign Up** (free)
3. Login → your username (top right) → **My API Keys**
4. Copy the default key → paste in `.env` as `OPENWEATHER_API_KEY`
- ⚠️ Wait 10–15 minutes after signup before it works
- Free limit: **1,000 calls/day** ✅

### 📰 NewsAPI Key (news ticker)
1. Go to → https://newsapi.org/
2. Click **Get API Key** → fill form → Register
3. Key shown immediately → paste in `.env` as `NEWS_API_KEY`
- Free limit: **100 requests/day** ✅

---

## Step 2 — Install & Run

```bash
# 1. Open terminal in the smart-mirror-free folder
cd smart-mirror-free

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env

# 4. Open .env and paste your API keys
#    (use Notepad / VS Code / any text editor)

# 5. Run the mirror!
node server.js

# 6. Open browser → http://localhost:3000
```

Press **F11** for fullscreen mirror mode.

---

## Your .env file (after filling in keys)

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENWEATHER_API_KEY=abc123def456ghi789jkl
NEWS_API_KEY=xyz987abc654def321mno
PORT=3000
USER_NAME=Your Name
WEATHER_CITY=Gurugram
WEATHER_COUNTRY=IN
```

---

## Project Files

```
smart-mirror-free/
├── server.js          ← Start this with: node server.js
├── config.js          ← All settings
├── package.json       ← Dependencies list
├── .env.example       ← Copy → .env, add your keys
├── README.md          ← This file
├── modules/
│   ├── ai-assistant.js   ← Groq AI (free)
│   ├── weather.js        ← OpenWeatherMap
│   ├── news.js           ← NewsAPI
│   └── clock.js          ← Time helpers
└── public/
    ├── index.html     ← Mirror screen
    ├── style.css      ← Mirror design
    └── app.js         ← Browser logic
```

---

## Features

- ⏰ Live clock & date (updates every second)
- 🤖 AI chat powered by **Groq + LLaMA 3** (free)
- 🌤️ Real weather from OpenWeatherMap
- 📰 Live news ticker from NewsAPI
- 🎤 Voice input (press the mic button)
- 💓 Health stats panel (heart rate, steps, sleep)
- 📅 Today's schedule
- 🔵 Face recognition ready (simulated)

---

## Tips

- Works fine with **mock data** even without API keys
- Press `/` on keyboard to quickly focus the chat input
- Click the **glowing orb** for a morning briefing
- Edit `config.js` to change your name, city, AI personality
- For Raspberry Pi mirror setup, see notes below

### Raspberry Pi / Real Mirror Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Run
npm install && node server.js

# Fullscreen browser
chromium-browser --kiosk --app=http://localhost:3000
```
