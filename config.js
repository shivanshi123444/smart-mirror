require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,

  // config.js
groq: {
  apiKey: process.env.GROQ_API_KEY,
  model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',  // ← change this
  maxTokens: 500,
  systemPrompt: `You are ARIA, a smart mirror AI assistant for ${process.env.USER_NAME || 'User'}.
Keep responses under 2-3 sentences since they appear on a mirror and are spoken aloud.
Be helpful, warm, and concise.`
},

  weather: {
    apiKey: process.env.OPENWEATHER_API_KEY || '',
    city: process.env.WEATHER_CITY || 'Gurugram',
    country: process.env.WEATHER_COUNTRY || 'IN',
    units: 'metric',
    refreshInterval: 10 * 60 * 1000,
  },

  news: {
    apiKey: process.env.NEWS_API_KEY || '',
    country: 'in',
    pageSize: 10,
    refreshInterval: 15 * 60 * 1000,
  },

  mirror: {
    userName: process.env.USER_NAME || 'User',
  },
};
