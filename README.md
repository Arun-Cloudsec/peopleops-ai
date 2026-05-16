# ⚖ Lexicon AI — Legal Intelligence Platform

> AI-powered legal intelligence platform with 100+ skills across 12 practice areas. Built on [Claude for Legal](https://github.com/anthropics/claude-for-legal) by Anthropic.

![License](https://img.shields.io/badge/license-Apache--2.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![Deploy](https://img.shields.io/badge/deploy-Railway-purple)

## What's Inside

| Feature | Description |
|---|---|
| **Dashboard** | Command center with metrics across all practice areas |
| **12 Practice Areas** | Commercial, Corporate, Litigation, Privacy, Employment, IP, Product, Regulatory, AI Governance, Law Student, Legal Clinic, Builder Hub |
| **100+ AI Skills** | NDA triage, DSAR response, claim charts, deposition prep, PIA generation, and more |
| **AI Chat Agent** | Claude-powered legal assistant with skill-aware context |
| **Document Upload** | Drag-and-drop PDF, DOCX, XLSX, images, ZIP for analysis |
| **Export** | HTML (Word-ready), TXT (PDF-ready), CSV (Excel-ready) |
| **Sample Documents** | NDA, DSAR template, Legal Hold notice for testing |
| **Security Audit** | 12-point vulnerability scan of the codebase |

## Architecture

```
┌─────────────────────────────────────────┐
│  React Frontend (Vite)                  │
│  Dashboard │ Skills │ Chat │ Docs │ Sec │
└────────────────┬────────────────────────┘
                 │ /api/chat
┌────────────────┴────────────────────────┐
│  Express Server                         │
│  • Rate limiting (20 req/min)           │
│  • Helmet security headers              │
│  • Input validation                     │
│  • API key stays server-side            │
└────────────────┬────────────────────────┘
                 │ x-api-key: $ANTHROPIC_API_KEY
┌────────────────┴────────────────────────┐
│  Anthropic API (claude-sonnet-4)        │
└─────────────────────────────────────────┘
```

## Deploy to Railway (One-Click)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — Lexicon AI Legal Platform"
git remote add origin https://github.com/YOUR_USER/lexicon-ai.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [railway.com](https://railway.com) and sign in
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your `lexicon-ai` repository
4. Railway auto-detects the config and starts building

### Step 3: Add Environment Variable

1. In your Railway project, go to **Variables**
2. Add:
   ```
   ANTHROPIC_API_KEY = sk-ant-your-key-here
   ```
3. Railway will automatically redeploy

### Step 4: Get Your URL

Railway assigns a public URL like `lexicon-ai-production.up.railway.app`. Click **Settings → Networking → Generate Domain** if it's not visible.

That's it. Your legal platform is live.

## Local Development

```bash
# Clone
git clone https://github.com/YOUR_USER/lexicon-ai.git
cd lexicon-ai

# Install
npm install

# Configure
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run (dev mode — hot reload)
npm run dev
# Frontend on http://localhost:5173, proxies /api to :3001

# In a second terminal:
node server.js
# API server on http://localhost:3001

# Production build
npm run start
# Builds frontend + starts Express on :3001
```

## Project Structure

```
lexicon-ai/
├── server.js              # Express server — API proxy, security, static serving
├── vite.config.js         # Vite build config
├── package.json
├── railway.json           # Railway deployment config
├── nixpacks.toml          # Nixpacks build config
├── Dockerfile             # Docker alternative
├── .env.example           # Environment variable template
├── index.html             # HTML entry point
└── src/
    ├── main.jsx           # React entry
    ├── index.css          # Global styles & CSS variables
    ├── App.jsx            # Main application component
    ├── App.css            # Component styles
    └── data/
        ├── practiceAreas.js  # 12 practice areas, 100+ skills, agents, connectors
        └── documents.js      # Sample legal documents & vulnerability report
```

## Security

The server includes production-grade security:

- **API Key Isolation** — Anthropic key never reaches the browser; all calls proxied through `/api/chat`
- **Rate Limiting** — 20 requests per minute per IP via `express-rate-limit`
- **Helmet** — Security headers including CSP, HSTS, X-Frame-Options
- **Input Validation** — Message count limits, content length caps, schema checks
- **CORS** — Configurable allowed origins
- **Compression** — Gzip for all responses

The codebase vulnerability scan found 9 passes, 3 low/medium warnings, and 0 critical issues.

## Important Legal Notice

**Every output from this platform is a draft for attorney review — not legal advice, not a legal conclusion, not a substitute for a lawyer.** Built with guardrails: source attribution on every citation, conservative defaults on privilege and subjective legal calls, jurisdiction assumptions surfaced, and explicit gates before anything is filed, sent, or relied on. A lawyer reviews, verifies, and takes professional responsibility for anything that leaves the building.

## License

Proprietary — Internal use only

Built on [Claude for Legal](https://github.com/anthropics/claude-for-legal) by Anthropic.
