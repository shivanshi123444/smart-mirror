// ─────────────────────────────────────────────
// modules/ai-assistant.js — Groq AI (FREE)
// Model: llama-3.3-70b-versatile (free, very fast)
// ─────────────────────────────────────────────
const Groq = require('groq-sdk');
const config = require('../config');

let client = null;

function getClient() {
  if (!client) {
    if (!config.groq.apiKey || config.groq.apiKey === 'your_groq_api_key_here') {
      throw new Error('GROQ_API_KEY not set in .env file. Get a free key at https://console.groq.com/');
    }
    client = new Groq({ apiKey: config.groq.apiKey });
  }
  return client;
}

async function chat(message, history = []) {
  const groq = getClient();

  const messages = [
    { role: 'system', content: config.groq.systemPrompt },
    ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  const response = await groq.chat.completions.create({
    model: config.groq.model,
    max_tokens: config.groq.maxTokens,
    messages,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

async function morningBriefing({ weather, news }) {
  const prompt = `Give ${config.mirror.userName} a warm morning briefing in under 70 words.
Weather: ${weather.temp}°C, ${weather.description}.
Top news: ${news.slice(0, 3).map(n => n.title).join(' | ')}.
Be friendly and motivating.`;

  return await chat(prompt, []);
}

module.exports = { chat, morningBriefing };