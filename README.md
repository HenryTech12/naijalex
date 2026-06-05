<div align="center">

<img src="https://img.shields.io/badge/NaijaLex-Legal%20AI-1D9E75?style=for-the-badge&logoColor=white" />
<img src="https://img.shields.io/badge/Built%20for-BuildQuik%20Challenge-1A1916?style=for-the-badge" />
<img src="https://img.shields.io/badge/Deployed%20on-QuikDB-0066CC?style=for-the-badge" />

<br />

# NaijaLex ⚖️

### AI-powered legal document understanding for Nigerian SMEs

**NaijaLex reads your Nigerian contracts before you sign — flags hidden penalty clauses, auto-renewals and personal guarantees, then explains every risk in Lagos Pidgin so you actually understand what you're agreeing to.**

<br />

🌍 **Live App** → [naijalex.quikdb.net](https://naijalex.quikdb.net)
&nbsp;&nbsp;|&nbsp;&nbsp;
📡 **API Docs** → [naijalex-backend.quikdb.net/docs](https://naijalex-backend.quikdb.net/docs)
&nbsp;&nbsp;|&nbsp;&nbsp;
🧪 **API Explorer** → [naijalex.quikdb.net/explorer](https://naijalex.quikdb.net/explorer)

<br />

</div>

---

## 🇳🇬 The Problem

Most Nigerian SMEs sign contracts they don't fully understand.

- Lawyers charge ₦50,000–₦200,000 just to review a single agreement
- Most market traders and small business owners can't afford that
- Contracts are written in dense legal English that most people don't read
- Hidden clauses — auto-renewals, penalty interest, personal guarantees — cost businesses millions every year

**NaijaLex fixes this in 30 seconds.**

---

## ✨ What NaijaLex Does

Upload any contract — PDF, image, Word document, or even a WhatsApp photo — and NaijaLex:

1. **Reads every clause** using a 3-agent AI pipeline
2. **Flags risks** as Critical 🔴, Caution 🟡, or Standard 🟢
3. **Explains everything** in plain English AND Lagos Pidgin
4. **Writes your counter-language** — actual negotiation text you can copy and send
5. **Answers follow-up questions** via an in-app chat powered by GPT-4o
6. **Sends results to WhatsApp** so you get your analysis on your phone

---

## 🎬 Demo

### Full web flow
```
Upload contract → 3-agent analysis → Clause breakdown → Pidgin explanation → Copy negotiation draft
```

### WhatsApp flow
```
Forward contract photo on WhatsApp → Get analysis in Lagos Pidgin → Ask follow-up questions
```

### Browser extension flow
```
Open any PDF URL → Click NaijaLex extension → Get top risks inline → Open full analysis
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│   React Frontend    │   Chrome Extension   │   WhatsApp     │
└──────────┬──────────┴──────────┬───────────┴───────┬────────┘
           │                    │                   │
           ▼                    ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (QuikDB)                  │
│                                                             │
│  POST /documents/analyze   GET /documents/analysis/{id}     │
│  POST /chat/{analysis_id}  GET /risk-card/{analysis_id}     │
│  POST /webhook/whatsapp    GET /health                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
           ┌───────────────────▼──────────────────────┐
           │           3-AGENT AI PIPELINE             │
           │                                           │
           │  ┌─────────────┐                          │
           │  │ Context     │ Classifies document type  │
           │  │ Agent       │ jurisdiction, value       │
           │  └──────┬──────┘                          │
           │         │                                 │
           │  ┌──────▼──────┐                          │
           │  │ Analyst     │ Extracts every clause     │
           │  │ Agent       │ flags severity + risk     │
           │  └──────┬──────┘                          │
           │         │                                 │
           │  ┌──────▼──────┐                          │
           │  │ Advisor     │ Ranks actions             │
           │  │ Agent       │ writes counter-language   │
           │  └─────────────┘                          │
           └───────────────────────────────────────────┘
                               │
     ┌─────────────────────────▼──────────────────────────┐
     │                  DATA LAYER (QuikDB)                │
     │                                                     │
     │  PostgreSQL (Aiven)  │  Redis/Valkey (Aiven)        │
     │  ChromaDB (local)    │  Cloudinary (PDF storage)    │
     └─────────────────────────────────────────────────────┘
```

---

## 🧠 AI Pipeline Deep Dive

NaijaLex uses a **LangGraph StateGraph** with 3 specialized agents:

### Agent 1 — Context Agent
- Classifies document: tenancy / loan / supplier / employment / partnership
- Identifies jurisdiction: Lagos State, FCT, Federal, Unknown
- Identifies governing law: Land Use Act 1978, CAMA 2020, CBN Framework
- Estimates contract value in NGN if stated
- Uses retry logic with exponential backoff (tenacity)

### Agent 2 — Analyst Agent
- Searches ChromaDB knowledge base for similar Nigerian legal clauses
- Segments document into individual clauses
- For each clause generates:
  - `plain_english` — 2-sentence lay explanation
  - `pidgin_explanation` — natural Lagos Pidgin explanation
  - `severity` — Critical / Caution / Standard
  - `risk_type` — auto_renewal / personal_liability / penalty / jurisdiction_waiver etc.
  - `legal_reference` — specific Nigerian law/section
  - `financial_exposure` — estimated NGN exposure
  - `action` — Accept / Negotiate / Remove / Escalate
- Confidence score: if < 0.7, triggers re-profiling

### Agent 3 — Advisor Agent
- Ranks all Critical and Caution clauses by urgency
- For each: recommends action + writes actual replacement_language
- Generates `top_3_actions` — plain actions the user takes today
- Generates `negotiation_package` — full counter-letter ready to send

---

## 🌐 API Reference

### Base URL
```
https://naijalex.quikdb.net
```

### Endpoints

#### Health Check
```http
GET /api/v1/health
```
```json
{
  "status": "ok",
  "db": "ok",
  "redis": "ok",
  "llm": "ok"
}
```

---

#### Create User
```http
POST /api/v1/users/
Content-Type: application/json
```
```json
{
  "phone_number": "+2348012345678",
  "business_type": "SME",
  "industry": "Retail/Trading",
  "risk_tolerance": "medium",
  "typical_contracts": ["lease", "supplier agreement"]
}
```
```json
{
  "id": "uuid",
  "business_type": "SME",
  "industry": "Retail/Trading",
  "created_at": "2026-06-01T10:00:00Z"
}
```

---

#### Analyze Document
```http
POST /api/v1/documents/analyze
Content-Type: multipart/form-data
```
```
file         → PDF / JPG / PNG / WEBP / DOCX (max 10MB)
user_id      → UUID from Create User
language_mode → "english" | "pidgin"
```
```json
{
  "analysis_id": "uuid",
  "status": "processing",
  "estimated_seconds": 30
}
```

---

#### Get Analysis
```http
GET /api/v1/documents/analysis/{analysis_id}
```
```json
{
  "id": "uuid",
  "overall_risk": "High",
  "summary": "This contract contains...",
  "clauses": [
    {
      "title": "Auto-renewal clause",
      "severity": "Critical",
      "plain_english": "This contract renews automatically...",
      "pidgin_explanation": "Dis contract go renew by itself...",
      "action": "Negotiate",
      "replacement_language": "This agreement shall not renew...",
      "financial_exposure": 500000,
      "legal_reference": "Section 4(b)"
    }
  ],
  "top_3_actions": ["..."],
  "risk_card_url": "https://res.cloudinary.com/...",
  "processing_time_ms": 34200,
  "status": "complete"
}
```

---

#### Document Chat
```http
POST /api/v1/chat/{analysis_id}
Content-Type: application/json
```
```json
{
  "question": "Which clause is most dangerous?",
  "language_mode": "pidgin"
}
```
```json
{
  "answer": "Di most dangerous clause na di auto-renewal clause for section 4(b)..."
}
```

---

#### Risk Card PDF
```http
GET /api/v1/risk-card/{analysis_id}
GET /api/v1/risk-card/{analysis_id}?refresh=true
GET /api/v1/risk-card/{analysis_id}?redirect=true
```
```json
{
  "analysis_id": "uuid",
  "risk_card_url": "https://res.cloudinary.com/.../risk_card.pdf"
}
```

---

#### WhatsApp Webhook
```http
POST /api/v1/webhook/whatsapp
Content-Type: multipart/form-data
```
Twilio-format webhook. Supports text and media (PDF/image) messages.
State machine: `awaiting_document` → `processing` → `analysis_ready` → `followup`

---

## 🚀 Full End-to-End Flow

```bash
# 1. Create a user
curl -X POST https://naijalex-backend.quikdb.net/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"+2348012345678","business_type":"SME","industry":"Retail/Trading","risk_tolerance":"medium"}'

# 2. Upload a contract
curl -X POST https://naijalex-backend.quikdb.net/api/v1/documents/analyze \
  -F "file=@your_contract.pdf" \
  -F "user_id=YOUR_USER_ID" \
  -F "language_mode=pidgin"

# 3. Poll until complete
curl https://naijalex-backend.quikdb.net/api/v1/documents/analysis/YOUR_ANALYSIS_ID

# 4. Ask a question
curl -X POST https://naijalex-backend.quikdb.net/api/v1/chat/YOUR_ANALYSIS_ID \
  -H "Content-Type: application/json" \
  -d '{"question":"Which clause is most dangerous?","language_mode":"pidgin"}'

# 5. Get the risk card PDF
curl https://naijalex-backend.quikdb.net/api/v1/risk-card/YOUR_ANALYSIS_ID
```

---

## 🖥️ Frontend

**Live:** [naijalex.quikdb.net](https://naijalex.quikdb.net)

### Pages

| Route | Description |
|---|---|
| `/` | Landing page — problem, how it works, language showcase |
| `/analyze` | Upload flow — onboarding → upload → processing → results |
| `/analysis/:id` | Full analysis results with clause cards, chat, risk card |
| `/history/:userId` | Past analyses with risk levels and quick links |
| `/explorer` | Interactive API Explorer dashboard |

### Key Features
- **Language toggle** — switch any clause between English and Lagos Pidgin instantly
- **Document chat** — ask GPT-4o follow-up questions about the contract
- **Text-to-speech** — hear clause explanations in Nigerian English
- **Copy counter-language** — copy negotiation text to clipboard with one click
- **Risk card viewer** — embedded PDF viewer + download + Cloudinary URL
- **Demo mode** — full mock data mode for testing without backend

---

## 🧩 Browser Extension

A Chrome Manifest V3 extension for analyzing contracts directly from the browser.

### Install (Developer Mode)
```
1. Clone this repo
2. Open Chrome → chrome://extensions/
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the naijalex-extension/ folder
```

### What it does
- Auto-detects PDF URLs on the current tab
- Upload any contract file (PDF, image, DOCX)
- Choose English or Lagos Pidgin mode
- Shows top risks inline in the popup
- "Open Full Analysis" button navigates to the full results page

---

## 🛠️ Local Development

### Backend

```bash
# Clone repo
git clone https://github.com/HenryTech12/main.git
cd naijalex

# Copy environment
cp .env.example .env
# Fill in: OPENAI_API_KEY, DATABASE_URL, REDIS_URL, TWILIO_*, LANGCHAIN_API_KEY

# Run with Docker
docker-compose up --build

# Or run directly
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
git clone https://github.com/HenryTech12/master.git
cd naijalex-frontend

cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000

npm install
npm run dev
```

### Environment Variables

#### Backend `.env`
```env
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/naijalex?ssl=require
REDIS_URL=rediss://default:pass@host:port/0
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
LANGCHAIN_API_KEY=ls__...
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=naijalex
CHROMA_PERSIST_DIR=/app/chroma_db
UPLOAD_DIR=/app/uploads
APP_BASE_URL=https://naijalex.quikdb.net
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

#### Frontend `.env`
```env
VITE_API_BASE_URL=https://naijalex.quikdb.net
VITE_WHATSAPP_SANDBOX_NUMBER=+14155238886
VITE_WHATSAPP_SANDBOX_JOIN_CODE=join various-mill
```

---

## 📦 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **LangGraph** | Multi-agent orchestration |
| **GPT-4o** | LLM backbone for all 3 agents |
| **PostgreSQL (Aiven)** | Persistent storage via QuikDB |
| **Redis/Valkey (Aiven)** | Session state + caching via QuikDB |
| **ChromaDB** | Vector store for Nigerian legal clauses |
| **sentence-transformers** | Clause embedding + semantic search |
| **pdfplumber + pytesseract** | PDF text extraction + OCR |
| **python-docx** | DOCX parsing |
| **ReportLab** | Risk card PDF generation |
| **Cloudinary** | PDF cloud storage + delivery |
| **Twilio** | WhatsApp Business API |
| **LangSmith** | Agent tracing + observability |
| **tenacity** | Retry logic with exponential backoff |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + TypeScript** | UI framework |
| **Vite** | Build tool |
| **Tailwind CSS v3** | Styling |
| **Framer Motion** | Animations |
| **Recharts** | Risk breakdown donut chart |
| **Axios** | HTTP client |
| **React Router v6** | Client-side routing |
| **Web Speech API** | Text-to-speech (Nigerian English) |

---

## 🗂️ Project Structure

### Backend
```
naijalex/
├── app/
│   ├── agents/
│   │   ├── context_agent.py      # Agent 1: document classification
│   │   ├── analyst_agent.py      # Agent 2: clause extraction + risk flagging
│   │   ├── advisor_agent.py      # Agent 3: actions + negotiation drafts
│   │   ├── pipeline.py           # LangGraph StateGraph builder
│   │   ├── prompts.py            # All LLM prompts (English + Pidgin)
│   │   └── state.py              # DocumentAnalysisState TypedDict
│   ├── models/                   # SQLAlchemy ORM models
│   ├── routers/                  # FastAPI route handlers
│   ├── services/
│   │   ├── document_ingestion.py # PDF/image/DOCX → clean text
│   │   ├── knowledge_base.py     # ChromaDB seeding + semantic search
│   │   ├── risk_card.py          # ReportLab PDF + QR code generator
│   │   ├── whatsapp_service.py   # Twilio send/receive
│   │   └── session_service.py    # Redis session helpers
│   ├── main.py                   # FastAPI app entry point
│   └── config.py                 # pydantic-settings
├── knowledge_base/
│   └── seed_data/
│       ├── nigerian_clauses.json # 20+ Nigerian legal clauses
│       └── nigerian_laws.json    # Land Use Act, CAMA 2020, CBN Act
├── alembic/                      # Database migrations
├── tests/                        # pytest test suite
├── Dockerfile
└── docker-compose.yml
```

### Frontend
```
naijalex-frontend/
├── src/
│   ├── api/
│   │   ├── client.ts             # Typed API calls + demo mode
│   │   └── chat.ts               # Document chat API
│   ├── components/
│   │   ├── analysis/             # ClauseCard, DocumentChat, TextToSpeech...
│   │   ├── explorer/             # API Explorer components
│   │   ├── layout/               # Navbar, Footer
│   │   └── upload/               # DropZone, LanguageToggle
│   ├── contexts/AppContext.tsx    # Global state + flow state
│   ├── hooks/
│   │   ├── useAnalysis.ts        # Polling hook (3s interval, 120s max)
│   │   └── useUser.ts            # User creation + profile
│   ├── pages/
│   │   ├── Landing.tsx           # Marketing page
│   │   ├── Analyze.tsx           # Upload flow
│   │   ├── Analysis.tsx          # Results page
│   │   ├── History.tsx           # Past analyses
│   │   └── Explorer.tsx          # API Explorer dashboard
│   └── types/index.ts            # TypeScript types (matches backend schemas)
└── naijalex-extension/           # Chrome Manifest V3 extension
    ├── manifest.json
    ├── popup.html + popup.js
    ├── background.js
    ├── content.js
    └── icons/
```

---

## 🧪 Testing

```bash
# Backend tests
cd naijalex
pytest tests/ -v

# Type check frontend
cd naijalex-frontend
npm run typecheck

# Lint frontend
npm run lint
```

### Manual Test Scenarios
| Scenario | Expected |
|---|---|
| Upload tenancy PDF (text-based) | Full clause analysis in <40s |
| Upload contract photo (JPEG) | OCR → clause analysis |
| Upload DOCX employment contract | Parsed + analyzed |
| Pidgin mode toggle | All explanations switch to Lagos Pidgin |
| Document chat — "Which clause is dangerous?" | GPT-4o response in Pidgin |
| WhatsApp — forward contract photo | Analysis sent back via WhatsApp |
| Risk card download | PDF opens from Cloudinary URL |
| Browser extension — PDF URL | Top 5 risks shown in popup |

---

## 🚀 Deployment

Both frontend and backend are deployed on **QuikDB**.

| Service | URL |
|---|---|
| Backend API | https://naijalex-backend.quikdb.net |
| Frontend | https://naijalex.quikdb.net |
| API Docs | https://naijalex-backend.quikdb.net/docs |
| API Explorer | https://naijalex.quikdb.net/explorer |

### Infrastructure
- **Database**: PostgreSQL 15 via Aiven (managed by QuikDB)
- **Cache/Sessions**: Valkey (Redis-compatible) via Aiven (managed by QuikDB)
- **Vector DB**: ChromaDB (persistent volume on QuikDB compute)
- **PDF Storage**: Cloudinary
- **LLM**: OpenAI GPT-4o
- **WhatsApp**: Twilio Business API
- **Observability**: LangSmith tracing

---

## 🏆 Built For

**BuildQuik Challenge 2026** — hosted by QuikDB
- Build Phase: May 25 – June 5, 2026
- Live Finale: June 6, 2026 @ AfriLab, Lagos

**Team Zero** — Henry Fakorode
- GitHub: [@HenryTech12](https://github.com/HenryTech12)
- X: [@henrytech874](https://x.com/henrytech874)

---

## ⚠️ Disclaimer

NaijaLex is an AI-powered tool for educational and informational purposes only.
It is not a substitute for qualified legal advice.
Always consult a licensed Nigerian lawyer before signing any legal agreement.

---

<div align="center">

**Built with ❤️ for Nigerian SMEs**

*"If Amaka had NaijaLex, she would have kept her ₦800,000."*

</div>
