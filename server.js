import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ─── SECURITY MIDDLEWARE ───
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(express.json({ limit: '5mb' }));

// ─── RATE LIMITING ───
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment.' },
});

// ─── HEALTH CHECK ───
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    apiConfigured: !!process.env.ANTHROPIC_API_KEY,
  });
});

// ─── ANTHROPIC API PROXY ───
// Keeps the API key server-side — frontend never sees it
app.post('/api/chat', apiLimiter, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not configured. Add it as a Railway environment variable.',
    });
  }

  try {
    const { messages, system, model } = req.body;

    // Input validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required.' });
    }
    if (messages.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 messages per request.' });
    }
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return res.status(400).json({ error: 'Each message needs role and content.' });
      }
      if (typeof msg.content === 'string' && msg.content.length > 80000) {
        return res.status(400).json({ error: 'Message content exceeds 80,000 character limit.' });
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: system || '',
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, err);
      return res.status(response.status).json({
        error: err.error?.message || `Anthropic API returned ${response.status}`,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Internal server error. Check logs.' });
  }
});

// ─── SERVE FRONTEND ───
app.use(express.static(join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ─── START ───
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ⚖  Lexicon AI — Legal Intelligence Platform`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  Server:  http://0.0.0.0:${PORT}`);
  console.log(`  API Key: ${process.env.ANTHROPIC_API_KEY ? '✓ configured' : '✗ missing — set ANTHROPIC_API_KEY'}`);
  console.log(`  Env:     ${process.env.NODE_ENV || 'development'}\n`);
});
