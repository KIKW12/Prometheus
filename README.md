# 🔥 Prometheus — AI-Powered Recruitment Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![LangGraph](https://img.shields.io/badge/LangGraph-Agent-FF6F00?style=for-the-badge&logo=langchain&logoColor=white)](https://www.langchain.com/langgraph)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Integration-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://www.twilio.com/docs/whatsapp)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **Conversational AI recruitment that finds the right people — and the right culture fit — in minutes, not days.**

<p align="center">
  <img src="https://img.shields.io/badge/💬-WhatsApp%20Native-25D366?style=for-the-badge" alt="WhatsApp Native">
  <img src="https://img.shields.io/badge/🤖-LangGraph%20Agent-FF6F00?style=for-the-badge" alt="LangGraph Agent">
  <img src="https://img.shields.io/badge/🧠-Semantic%20Matching-7C3AED?style=for-the-badge" alt="Semantic Matching">
  <img src="https://img.shields.io/badge/⚡-2min%20to%20Meeting-DC3545?style=for-the-badge" alt="Fast Hiring">
</p>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Prometheus** is a full-stack AI recruitment platform that replaces the traditional "post-and-pray" hiring workflow with a real-time, conversational experience. Recruiters describe what they need in natural language; the system progressively narrows candidates with each follow-up message, ranks them by skill match, culture fit, and tenure stability, then reaches out instantly via WhatsApp.

### The Problem

| Traditional Hiring | Prometheus |
|---|---|
| **3–5 days** to schedule an interview | **2 minutes** from search to meeting |
| 20% email open rate | **98% WhatsApp open rate** |
| Keyword matching misses transferable skills | **Semantic AI** understands Vue → React |
| No culture fit signal before the interview | **Bidirectional culture matching** from day 0 |

### Core Innovation

```
Recruiter: "I need a React developer"
Prometheus: "Found 15 matches. Here are the top 3…"

Recruiter: "only senior ones"
Prometheus: "Narrowed to 4 senior React developers…"

Recruiter: "available full-time, good culture fit for a startup"
Prometheus: "1 perfect match — 92% fit. Want to reach out on WhatsApp?"
```

Progressive filtering maintains conversation context so each query refines — never restarts — the search.

---

## Key Features

### 🤖 LangGraph Conversational Agent
A stateful, graph-based agent powered by **Gemini 2.5 Flash** and built with **LangGraph + LangChain**. It decides when to search, when to analyze tenure, and when to reset — all through natural conversation.

### 🔍 Progressive Filtering
Multi-turn search that accumulates filters across messages. Say "React developers," then "senior only," then "remote" — the system narrows the pool at every step without losing context.

### 🧠 Semantic Matching Engine
Uses **Google Gemini Embeddings** (`gemini-embedding-001`) instead of keyword matching. "Python backend developer" surfaces Django/FastAPI candidates; "React" matches Vue.js developers through transferable-skill scoring.

### 🏢 Bidirectional Culture Fit
Both the candidate and company fill out culture questionnaires. The semantic engine embeds their profiles and calculates fit from **both** directions — does the candidate fit the company, *and* does the company fit the candidate?

### 📊 Tenure & Stability Analysis
Automatically parses work history to score candidates on job tenure patterns. Flags short stints (<12 months), rewards long tenures (>3 years), and labels candidates as `stable`, `moderate`, or `high_risk`.

### 💬 WhatsApp-First Outreach
Send personalized job offers via WhatsApp through Twilio. Gemini analyzes candidate replies to detect intent (interested, schedule, decline) and triggers the appropriate next action.

### 📅 Meeting Automation
Google Calendar integration to auto-schedule interviews with a single confirmation, plus automatic video-conference link generation and conflict detection.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Next.js 16 Frontend (Vercel)                     │
│                                                                     │
│   Landing · Chat Search · Be Found · Company Profile · Register     │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST
┌────────────────────────────▼────────────────────────────────────────┐
│                   Flask API Server (Render / Port 8080)              │
│                                                                     │
│   POST /api/agent/search     →  Conversational candidate search     │
│   POST /api/company/profile  →  Set company culture profile         │
│   GET  /api/health           →  Health check                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
         ┌───────────────────▼───────────────────┐
         │      LangGraph Agent (Gemini 2.5)     │
         │                                       │
         │  Nodes: agent ⇄ tools → END           │
         │                                       │
         │  Tools:                                │
         │    • progressive_search                │
         │    • analyze_candidate_tenure          │
         │    • get_candidate_details             │
         │    • reset_search                      │
         └──────┬───────────┬───────────┬────────┘
                │           │           │
     ┌──────────▼──┐  ┌────▼─────┐  ┌──▼──────────────┐
     │ Progressive │  │ Semantic │  │ Supabase         │
     │ Filter      │  │ Engine   │  │ (user_profiles,  │
     │ (stateful   │  │ (Gemini  │  │  company_profiles,│
     │  multi-turn)│  │  Embeds) │  │  conversations)  │
     └─────────────┘  └──────────┘  └──────────────────┘

     ┌──────────────────────────────────────────────────┐
     │              External Integrations                │
     │  Twilio (WhatsApp) · Google Calendar · Gmail API  │
     └──────────────────────────────────────────────────┘
```

### Data Flow

1. **User types a query** → Frontend sends it to `POST /api/agent/search`
2. **LangGraph agent** receives the message and selects the `progressive_search` tool
3. **Progressive Filter** combines new requirements with prior conversation context
4. **Supabase query** fetches candidate profiles from `user_profiles`
5. **Semantic Engine** calculates skill overlap, transferable-skill scores, and (optionally) culture fit
6. **Tenure Analyzer** evaluates job stability from work history
7. **Agent formats response** → Returns ranked matches with scores, reasoning, and profile cards
8. **Frontend renders** candidate cards with match percentages and detail drawers

---

## Technology Stack

### Backend — AI Agent & API

| Technology | Role |
|---|---|
| **Python 3.11+** | Runtime |
| **Flask** | REST API |
| **LangGraph** | Stateful agent orchestration |
| **LangChain + langchain-google-genai** | LLM integration & tool binding |
| **Gemini 2.5 Flash** | Conversational AI, intent detection, CV parsing |
| **Gemini Embeddings** (`gemini-embedding-001`) | Semantic skill & culture matching |
| **Supabase** (Python client) | Candidate & company profile storage |
| **NumPy** | Cosine similarity calculations |

### Frontend — Next.js Application

| Technology | Role |
|---|---|
| **Next.js 16** | React framework (App Router) |
| **React 19** | UI library |
| **TypeScript 5** | Type safety |
| **Tailwind CSS 4** | Styling |
| **Supabase JS** | Auth & data client |
| **Framer Motion** | Animations |
| **@google/genai** | Client-side AI features (CV parsing) |
| **Twilio** | WhatsApp messaging |

---

## Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **Supabase project** — [Create one free](https://supabase.com/dashboard)
- **Google Cloud / Gemini API key** — [Get one here](https://ai.google.dev/)
- **Twilio account** *(optional, for WhatsApp)*

### 1. Clone

```bash
git clone https://github.com/KIKW12/Prometheus.git
cd Prometheus
```

### 2. Backend Setup

```bash
# Install dependencies
pip install -r requirements.txt
```

Create `conversation_agent/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-key
GEMINI_API_KEY=your-gemini-api-key

# Optional
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 3. Database Schema

Run `supabase_schema.sql` in the Supabase SQL Editor to create:
- `user_profiles` — candidate profiles (JSONB `profile_data`)
- `company_profiles` — company culture questionnaires
- `conversations` — chat history per user

Row-Level Security policies are included.

### 4. Seed Candidates *(optional)*

```bash
cd conversation_agent
python populate_profiles.py
```

### 5. Start the Backend

```bash
python server.py
# → Running on http://localhost:8080
```

### 6. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
# → Running on http://localhost:3000
```

### Quick Smoke Test

```bash
# Broad search
curl -s -X POST http://localhost:8080/api/agent/search \
  -H "Content-Type: application/json" \
  -d '{"query": "React developers", "reset_conversation": true}' | python -m json.tool

# Refine
curl -s -X POST http://localhost:8080/api/agent/search \
  -H "Content-Type: application/json" \
  -d '{"query": "senior only", "reset_conversation": false}' | python -m json.tool
```

---

## API Reference

### `POST /api/agent/search`

Conversational candidate search with progressive filtering.

**Request:**

```json
{
  "query": "senior React developers with Next.js",
  "reset_conversation": false,
  "company_profile": null
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `query` | string | ✅ | Natural language search query |
| `reset_conversation` | boolean | — | Clear filters and start fresh (default `false`) |
| `company_profile` | object | — | Company profile for culture-fit scoring |

**Response (abbreviated):**

```json
{
  "status": "success",
  "conversation_turn": 2,
  "combined_filters": {
    "skills": ["react", "next.js"],
    "experience_level": "senior"
  },
  "matches_found": 3,
  "matches": [
    {
      "candidate_id": "abc123",
      "name": "Maria Garcia",
      "score": 87,
      "matched_skills": ["react", "next.js"],
      "transferable_skills": [{"required": "typescript", "has": "javascript"}],
      "overall_fit": 92,
      "culture_fit": 88,
      "reasoning": "..."
    }
  ],
  "main_response": "I found 3 candidates matching your criteria...",
  "profiles": [ ... ],
  "refinement_suggestion": "Try narrowing by availability or location."
}
```

### `POST /api/company/profile`

Set the company culture profile used to calculate bidirectional fit.

### `GET /api/health`

Returns `{ "status": "healthy", "agent": "langgraph" }`.

---

## How It Works

### Progressive Filter

The `ProgressiveFilter` class maintains a stateful conversation:

```python
# Turn 1: "web developers" → 50 matches
# Turn 2: "React only"     → 15 matches (keeps "web developer" context)
# Turn 3: "senior level"   →  3 matches (keeps React + web dev)
# Turn 4: "remote"         →  1 match   (all prior filters intact)
```

Each turn uses **Gemini** to extract structured requirements (skills, level, availability, location) from the natural language query, then merges them with all prior requirements before filtering the candidate pool.

### Semantic Matching

| Feature | How It Works |
|---|---|
| **Direct matches** | Candidate has the exact required skill → full score |
| **Transferable skills** | Vue.js → React (+20 pts), JS → TypeScript (+15 pts) |
| **Embedding similarity** | Query & candidate profiles encoded with `gemini-embedding-001`, compared via cosine similarity |
| **Experience mapping** | <3 yr = junior, 3–6 yr = mid, ≥7 yr = senior |

### Culture Fit Scoring

When a company profile is present:

1. **Candidate embedding** — skills, questionnaire answers, career goals
2. **Company embedding** — culture questionnaire, mission, stage, structure
3. **Cosine similarity** between the two → `culture_fit` (0–100)
4. **Mission alignment** — separate embedding comparison for domain fit
5. **Overall fit** = weighted blend of skill score + culture fit + mission alignment

### Tenure Analysis

```python
Base score: 70
Jobs < 12 months:  -15 pts each
Jobs > 3 years:    +10 pts each
Labels: stable (≥80) · moderate (60–79) · high_risk (<60)
```

### LangGraph Agent

The agent is a compiled `StateGraph` with two nodes:

```
START → agent → (tool_calls?) → tools → agent → … → END
```

- **`agent` node** — Invokes Gemini 2.5 Flash with the system prompt and bound tools
- **`tools` node** — Executes whichever tool(s) the LLM called
- **Routing** — If the LLM returns tool calls, loop to `tools`; otherwise, end

Available tools: `progressive_search`, `analyze_candidate_tenure`, `get_candidate_details`, `reset_search`.

---

## Project Structure

```
Prometheus/
├── server.py                              # Flask API entry point
├── requirements.txt                       # Python dependencies
├── render.yaml                            # Render deployment blueprint
├── runtime.txt                            # Python version for hosting
├── supabase_schema.sql                    # Database schema (run in Supabase SQL Editor)
│
├── conversation_agent/                    # AI agent package
│   ├── server.py                          # Standalone agent server (development)
│   ├── populate_profiles.py               # Seed Supabase with sample candidates
│   ├── requirements.txt
│   └── my_agent/
│       ├── langgraph_agent.py             # LangGraph agent, tools, Supabase loader
│       ├── progressive_filter.py          # Stateful multi-turn filtering engine
│       └── semantic_engine.py             # Gemini Embeddings for skill + culture match
│
└── Frontend/                              # Next.js 16 application
    ├── package.json
    ├── next.config.ts
    └── src/
        ├── app/
        │   ├── page.tsx                   # Landing page
        │   ├── layout.tsx                 # Root layout
        │   ├── globals.css
        │   ├── api/                       # API routes
        │   │   ├── conversation/route.ts  # Proxy to Flask agent
        │   │   ├── parse-cv/route.ts      # Gemini CV parsing
        │   │   └── twilio/route.ts        # WhatsApp webhook
        │   ├── be-found/page.tsx          # Candidate profile creation
        │   ├── chat/[id]/page.tsx         # Conversational search UI
        │   ├── company-profile/page.tsx   # Company onboarding + questionnaire
        │   ├── find/                      # Search dashboard, sign-up, company flow
        │   └── register/page.tsx          # User registration
        │
        ├── components/                    # React components
        │   ├── landing.tsx                # Landing page hero
        │   ├── dashboard.tsx              # Search dashboard
        │   ├── sidebar.tsx                # App sidebar navigation
        │   ├── ProfileForm.tsx            # Multi-step profile creation
        │   ├── ProfilePreview.tsx         # Candidate card
        │   ├── ProspectCard.tsx           # Search result card
        │   ├── ProspectModal.tsx          # Candidate detail modal
        │   ├── CandidateQuestionnaire.tsx # Candidate culture questionnaire
        │   ├── CompanyQuestionnaire.tsx   # Company culture questionnaire
        │   ├── MessageInput.tsx           # Chat input
        │   ├── ButtonCarousel.tsx         # Suggestion chips
        │   └── TeamCarousel.tsx           # Landing page team section
        │
        ├── lib/
        │   ├── auth.ts                    # Supabase authentication helpers
        │   ├── firebase.ts                # Legacy Firebase config
        │   ├── utils.ts                   # Utility functions
        │   └── services/
        │       └── whatsappService.ts     # WhatsApp integration
        │
        └── types/
            └── professional.ts            # TypeScript interfaces
```

---

## Deployment

### Backend → Render

The repo includes a `render.yaml` blueprint:

```yaml
services:
  - type: web
    name: prometheus-agent
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn server:app --bind 0.0.0.0:$PORT --timeout 120 --workers 2
    envVars:
      - key: SUPABASE_URL
      - key: SUPABASE_KEY
      - key: GEMINI_API_KEY
```

Push to GitHub, connect to Render, and set the environment variables in the dashboard.

### Frontend → Vercel

```bash
cd Frontend
npx vercel --prod
```

Set environment variables in Vercel:

```
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database → Supabase

Already serverless — run `supabase_schema.sql` in the SQL Editor to set up tables and RLS policies.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for details.

---

<p align="center">
  <b>Built with ❤️ for the tech community</b><br>
  🔥 AI-powered recruitment, from search to meeting in minutes 💬
</p>

<p align="center">
  <a href="#-prometheus--ai-powered-recruitment-platform">Back to Top ↑</a>
</p>
