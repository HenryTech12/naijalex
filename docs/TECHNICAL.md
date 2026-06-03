# NaijaLex — Technical Documentation

Last updated: 2026-06-03

This document is a comprehensive, production-grade technical manual for the NaijaLex project (frontend and browser extension). It contains architecture, data model, API specification, resilience practices, and deployment/CI recommendations. Use this as the canonical handoff for engineering, SRE, and DevOps teams.

## 1. System Architecture Overview

- Architectural pattern: Hybrid Monolith (Frontend SPA) + Backend API with asynchronous processing for heavy workloads.
  - Frontend: Single Page Application (React + Vite) that communicates with a REST API.
  - Backend: REST API that accepts uploads and schedules document analysis tasks; asynchronous worker(s) perform text extraction, LLM calls, and clause extraction.
  - Browser extension (Chrome MV3) acts as a thin client to upload documents or point at a PDF URL and poll for results.

- Data flow (high level):
  1. User uploads a document (or uses browser extension to point at a URL).
  2. Frontend POSTs multipart/form-data to `/api/v1/documents/analyze` (user id + file + language_mode).
  3. API enqueues a background job, responds with `analysis_id` and `status: processing`.
  4. Worker consumes job: stores object in object storage (S3/GCS), extracts text (OCR for images), segments into clauses, queries LLM(s) to classify and synthesize `ClauseAnalysis` items, then writes result to DB and optionally generates a PDF risk card and uploads it to object storage.
  5. Frontend polls `/api/v1/documents/analysis/{analysisId}` until `status: complete`, then displays `AnalysisResult` and optionally downloads `risk_card_url`.

- Core infrastructure components:
  - Load balancer / Ingress (e.g., AWS ALB / Nginx / GCLB)
  - API server (stateless, containerized)
  - Background workers (Autoscalable based on queue length)
  - Message queue (RabbitMQ / SQS / Google PubSub)
  - Object storage (S3-compatible) for uploaded documents and generated PDFs
  - Relational database (Postgres) for structured data (users, analyses, clause records)
  - Redis for short-lived caching, rate-limiting, and distributed locks
  - LLM integration (OpenAI, Azure OpenAI, or hosted LLM endpoint)
  - Monitoring & logging (Prometheus + Grafana, ELK/Opensearch)

## 2. Tech Stack & Dependencies

- Frontend (this repository):
  - Language: TypeScript — strong typing, excellent ecosystem for React.
  - Framework: React + Vite — fast dev server and optimized builds.
  - Routing: `react-router-dom` — SPA routing and URL-driven views.
  - HTTP client: `axios` (plus a thin API client `src/api/client.ts`) — centralized API configuration and demo-mode shim.
  - Styling: Tailwind CSS (present via `tailwind.config.js` and `index.css`) — utility-first rapid UI.
  - Utility libs: `clsx` for class composition, `lucide-react` for icons.

- Browser extension: Chrome MV3 (manifest v3) — lightweight popup, content scripts for page detection, background service worker.

- Backend (recommended choices — not included in this repo):
  - Language: Python (FastAPI) or Node.js (Express/Nest) — both performant; FastAPI recommended for type-safety and async IO.
  - Worker: Celery (Python) or BullMQ (Node.js) — queued background tasks.
  - Queue: RabbitMQ or AWS SQS
  - Database: PostgreSQL — relational model for analyses and clauses.
  - Cache: Redis — caching, rate-limiting, and locks.
  - Object Storage: Amazon S3 or compatible (minio) — store uploaded files & risk card PDFs.
  - LLM client: OpenAI/Azure or local model served behind an API gateway.

- Why these choices:
  - Vite + React: developer experience and fast HMR for frontend work.
  - TypeScript: safety for cross-team collaboration.
  - Postgres: complex queries and relationships for clause-based analysis.
  - Redis + Queue: decouples heavy LLM tasks from request lifecycle, enabling retries and auto-scaling.

## 3. Database Schema & Data Models

Below are canonical tables and recommended columns inferred from `src/types/index.ts` and API client behavior. Use Postgres with JSONB for flexible fields (e.g., clause details) when necessary.

1) users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone_number TEXT NOT NULL,
  business_type TEXT,
  industry TEXT,
  risk_tolerance TEXT,
  typical_contracts TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

2) documents / analyses
```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL,
  user_id UUID REFERENCES users(id),
  filename TEXT,
  language_mode TEXT NOT NULL,
  overall_risk TEXT,
  summary TEXT,
  top_3_actions TEXT[],
  risk_card_url TEXT,
  processing_time_ms INT,
  status TEXT CHECK (status IN ('processing','complete','failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_status ON analyses(status);
```

3) clauses
```sql
CREATE TABLE clauses (
  id UUID PRIMARY KEY,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  clause_id TEXT, -- original clause identifier from analyzer
  title TEXT,
  original_text TEXT,
  plain_english TEXT,
  pidgin_explanation TEXT,
  severity TEXT,
  risk_type TEXT,
  legal_reference TEXT,
  financial_exposure BIGINT NULL,
  action TEXT,
  replacement_language TEXT,
  urgency_rank INT,
  page_number INT NULL
);
CREATE INDEX idx_clauses_analysis_id ON clauses(analysis_id);
CREATE INDEX idx_clauses_severity ON clauses(severity);
```

4) chats (for interactive Q&A attached to an analysis)
```sql
CREATE TABLE analysis_chats (
  id UUID PRIMARY KEY,
  analysis_id UUID REFERENCES analyses(id),
  role TEXT, -- user / assistant
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_chats_analysis_id ON analysis_chats(analysis_id);
```

Storage considerations:
- Store original uploads and generated PDFs as objects in S3; only store URLs in `risk_card_url`.
- Use JSONB for `clauses` if write-once read-many access patterns are simpler than normalized `clauses` rows.

## 4. Core Module & Component Breakdown

This repository is primarily the frontend SPA and a Chrome extension. The backend API assumptions are reflected in `src/api/client.ts` and the TypeScript interfaces in `src/types/index.ts`.

- `src/api/client.ts`
  - Centralized API client that exports typed methods for `createUser`, `analyzeDocument`, `getAnalysis`, `getAnalysisHistory`, `sendChatQuestion`, and `getRiskCard`.
  - Supports `demo` mode via an in-browser demo store to enable offline development and sandboxing. Demo store logic seeds example analysis items and users.
  - Exposes `API_BASE` constant and `liveApi` axios instance.
  - Implements fallback behavior for chat endpoints (`/api/v1/chat/{id}` → fallback `/api/v1/documents/chat/{id}`).

- `src/types/index.ts`
  - Canonical request and response types used by the frontend and for documentation of the API contract.

- Frontend UI components (key folders):
  - `src/components/analysis/` — visualization of clauses, risk summaries, chat bubble, TTS integration. `TextToSpeech` hooks into browser `speechSynthesis` with voice-selection logic.
  - `src/components/upload/DropZone.tsx` — drag-and-drop / file-picker UI. Validates file types and size before upload.
  - `src/components/layout/` — `Navbar`, `Footer` with route-aware active links.
  - `src/pages/Analysis.tsx` — orchestrates analysis screen: polling for results, risk card controls, chat jump, and state hooks.

- Hooks & Contexts:
  - `src/contexts/AppContext.tsx` — global app state including `businessLabel`, `analysisId`, `riskCardUrl`, and helper setters.
  - `src/hooks/useAnalysis.ts` — custom hook to fetch and poll analysis state.
  - `src/hooks/useUser.ts` — user creation and profile handling; sets `businessLabel` after user creation.

- Browser extension (`naijalex-extension/`):
  - Manifest v3 popup (`popup.html`, `popup.js`) provides a lightweight UI for uploading or pointing at a PDF. It uses `chrome.*` APIs for storage and tab querying and polls the backend identical to SPA behavior.
  - `background.js` service worker provides background functionality (if present).
  - `content.js` runs on pages to help detect PDF URLs.

Design patterns and flow:
- The frontend uses an API-first pattern — `src/api/client.ts` encapsulates backend contracts and a `demo` shim for offline testing.
- UI components are primarily presentational; state and side-effects live in hooks and context providers (separation of concerns).

## 5. API Specification & Endpoints

All endpoints are RESTful and follow the base path `/api/v1`. The frontend uses `axios` with a 60s timeout. Below are the main endpoints, request/response payloads, and example curl snippets.

1) Health
- GET `/api/v1/health`
Response: 200
```json
{ "status":"ok", "db":"ok", "redis":"ok", "llm":"ok" }
```

2) Create User
- POST `/api/v1/users/`
Request (application/json):
```json
{
  "phone_number":"+2348000000000",
  "business_type":"SME",
  "industry":"Retail",
  "risk_tolerance":"medium",
  "typical_contracts": ["lease","supplier agreement"]
}
```
Response: `UserProfile` (see `src/types/index.ts`)

3) Get User Profile
- GET `/api/v1/users/{userId}/profile`

4) Upload Document / Start Analysis
- POST `/api/v1/documents/analyze` (multipart/form-data)
Form fields:
  - `file`: binary file (PDF/image/DOCX)
  - `user_id`: string
  - `language_mode`: `english|pidgin`
Response: `AnalyzeDocumentResponse` → `{ analysis_id, status: 'processing', estimated_seconds }`

5) Poll Analysis
- GET `/api/v1/documents/analysis/{analysisId}`
Response: `AnalysisResult` (see `src/types/index.ts`)

6) Analysis History (per user)
- GET `/api/v1/documents/history/{userId}` → `DocumentHistoryResponse`
- GET `/api/v1/documents/history/{userId}/{analysisId}` → `AnalysisResult`

7) Chat / Q&A for analysis
- POST `/api/v1/chat/{analysisId}` or fallback `/api/v1/documents/chat/{analysisId}`
Request payload: `{ question: string, language_mode: 'english'|'pidgin' }`
Response: `{ answer: string }`

8) Risk Card
- GET `/api/v1/risk-card/{analysisId}`
Query params: `refresh=true|false`, `redirect=true|false`
Response: `RiskCardResponse` with `risk_card_url` (PDF URL)

9) WhatsApp Webhook (ingress)
- POST `/api/v1/webhook/whatsapp` (multipart/form-data)

Authentication & Authorization
- The current frontend implementation uses a `userId` created via `createUser()` and stored in localStorage to correlate analyses. This is a simple client identity; production should implement one of:
  - OAuth2/JWT with short-lived access tokens for UI clients.
  - API keys for service-to-service integrations.

Rate limiting
- Recommend per-IP and per-user rate-limiting using Redis token-bucket or a gateway (NGINX, Cloudflare Rate Limiting). Example: limit `analyze` endpoint to 5 uploads per minute per user, 30 per hour globally.

Example curl (upload):
```bash
curl -X POST "${API_BASE:-https://api.example.com}/api/v1/documents/analyze" \
  -F "file=@./contract.pdf" \
  -F "user_id=demo-user" \
  -F "language_mode=english"
```

## 6. Resilience & Optimization

- Asynchronous processing: all heavy LLM/IO/IO-bound tasks should run in background workers. The API returns quickly with an `analysis_id` and uses a polling pattern (or WebSocket / Server-Sent Events for push) to notify completion.

- Caching strategies:
  - Cache user profiles and small derived objects in Redis (TTL 5-60m) to reduce DB reads.
  - Cache risk-card generation results (PDF URL) and store a `version` or `etag` to avoid repeated regenerations.

- Circuit breakers & retries:
  - Wrap external LLM calls with retry/backoff and a circuit breaker (e.g., `opossum` for Node, `pybreaker` for Python). Fail fast if LLM is unavailable and degrade to a human-reviewed queued job.

- Rate limiting & quotas:
  - Implement token-bucket per user and per-IP using Redis.

- Queue resilience:
  - Use persistent queues, dead-letter queues (DLQ), and retry policies. Capture failed analysis payloads to object-storage for later re-processing.

- Observability:
  - Emit metrics: request latency, queue lengths, worker success/failure rate, LLM token consumption, errors by type.
  - Centralized logging (structured JSON) combined with traces (OpenTelemetry) for request→job traces.

## 7. Setup, Deployment, & CI/CD

This section provides step-by-step setup for local development, Dockerization, and CI/CD examples (GitHub Actions). It aims to be concrete and runnable.

7.1 Local frontend development

Prerequisites: Node 18+, npm 9+, and a running backend API (or use demo mode).

1. Clone repository and install dependencies:
```bash
git clone <repo>
cd naijalex_frontend
npm install
```

2. Create local environment file `.env` (optional) or export env var for API base:
```
VITE_API_BASE_URL=https://naijalex.quikdb.net
```
For local backend use:
```
VITE_API_BASE_URL=http://localhost:8000
```

3. Start dev server:
```bash
npm run dev
```

Open http://localhost:5173

7.2 Build and serve (production)

```bash
npm run build
npm run preview
```

7.3 Dockerfile (frontend)

Add a simple production Dockerfile for the frontend:

```Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

7.4 Example `docker-compose` (frontend + demo backend)

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - '5173:80'
  minio:
    image: minio/minio
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    command: server /data
    ports:
      - '9000:9000'
```

7.5 Kubernetes (high-level)

- Deploy API and workers as separate Deployments. Use a HorizontalPodAutoscaler for workers driven by queue length or custom metrics.
- Use a Deployment + Service for the frontend static content (or serve via CDN).
- Use PersistentVolumeClaims for Postgres; use managed services where possible (RDS, Cloud SQL).

7.6 GitHub Actions example for CI/CD

`.github/workflows/ci.yml` (unit tests + typecheck + build):

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build
      - run: npm test --if-present
```

CD (deploy to staging / production) can be added to push images to a registry and apply manifests using `kubectl` or `argocd`.

## 8. Operational Playbook (Runbook highlights)

- Recovery for stuck analyses:
  - Check worker queue length, worker logs, and DLQ. If a job failed repeatedly, inspect the saved input file in object storage.

- CPU/Memory sizing:
  - API: 0.5–1 vCPU, 512–1024MB RAM for light workloads. Increase for bursty upload traffic.
  - Workers (LLM-heavy): 4+ vCPU and ample RAM; separate GPU-enabled pool if using local GPU LLMs.

- Cost control:
  - Rate-limit calls per user and aggregate LLM usage. Track LLM token usage with metrics and billing alerts.

## 9. Security & Compliance

- Sensitive data handling:
  - Do not log full documents or PII to standard logs. Store only sanitized metadata and object storage keys.
  - Encrypt object storage buckets and enable server-side encryption.

- Authentication:
  - Replace the demo `userId` pattern with short-lived JWTs or OAuth2 tokens in production.

- Privacy:
  - Add a data retention policy for uploaded documents (e.g., automatically delete objects after 30/90 days) and allow users to request deletion.

## 10. Appendix — Key file references

- Frontend API client: [src/api/client.ts](src/api/client.ts#L1)
- Type definitions: [src/types/index.ts](src/types/index.ts#L1)
- Analysis page: [src/pages/Analysis.tsx](src/pages/Analysis.tsx#L1)
- Upload UI: [src/components/upload/DropZone.tsx](src/components/upload/DropZone.tsx#L1)
- Browser extension popup: [naijalex-extension/popup.js](naijalex-extension/popup.js#L1)

---

If you want, I will:
- Commit this file to `docs/TECHNICAL.md` (done), open a PR, and create a short checklist for release.
- Generate example server skeleton (FastAPI) that matches the API contracts described above.

Which of those should I do next?
