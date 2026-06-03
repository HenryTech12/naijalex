# NaijaLex Frontend

AI-powered legal document understanding for Nigerian SMEs. Full frontend with contract analysis UI and interactive API Explorer dashboard.

## Features

- **Contract Analysis Flow**: Upload documents, get AI analysis with English/Pidgin explanations
- **API Explorer Dashboard**: Interactive endpoint testing with full request/response viewing
- **Risk Card Integration**: Generate, view, and download PDF risk cards from Cloudinary
- **Flow State Management**: Auto-saved IDs for seamless multi-step workflows
- **Language Toggle**: View clause explanations in both Plain English and Lagos Pidgin

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3
- **Animation**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v6

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (uses demo mode / local API)
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WHATSAPP_SANDBOX_NUMBER=+14155238886
VITE_WHATSAPP_SANDBOX_JOIN_CODE=join various-mill
VITE_WHATSAPP_SANDBOX_QR_URL=https://example.com/whatsapp-sandbox-qr.png
VITE_WHATSAPP_SANDBOX_DEEPLINK=
```

For production, set this to your deployed backend URL. In this project all production deployments (frontend and backend) are hosted on QuikDB. Use the QuikDB dashboard or CLI to set environment variables and deploy artifacts.

`VITE_WHATSAPP_SANDBOX_DEEPLINK` is optional. If omitted, the frontend builds a WhatsApp deeplink from the sandbox number and join code.

## Pages

### `/` - Landing Page
Marketing landing page explaining NaijaLex features.

### `/analyze` - Analyze Contract
1. **Onboarding**: Create user profile with business info
2. **Upload**: Drag & drop PDF, image, or Word document
3. **Language Selection**: Choose English or Pidgin analysis
4. **Processing**: Animated pipeline shows analysis progress
5. **Results**: Auto-navigate to analysis page

### `/analysis/:analysisId` - Analysis Results
- Overall risk summary with donut chart
- Clause-by-clause breakdown with severity badges
- English/Pidgin toggle on each clause
- Negotiation package with copyable counter-language
- Risk card PDF viewer (loads when generated)

### `/explorer` - API Explorer Dashboard
Interactive API testing interface with:
- WhatsApp sandbox connect panel (copy number/code + open WhatsApp + QR support)
- Endpoint list grouped by category
- Path/query/body parameter editors
- cURL preview with copy button
- Response viewer with syntax highlighting
- Flow state panel showing saved IDs

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/users/` | POST | Create user |
| `/api/v1/users/{user_id}/profile` | GET | Get user profile |
| `/api/v1/documents/analyze` | POST | Upload document for analysis |
| `/api/v1/documents/analysis/{analysis_id}` | GET | Poll/get analysis results |
| `/api/v1/risk-card/{analysis_id}` | GET | Get risk card PDF URL |
| `/api/v1/webhook/whatsapp` | POST | WhatsApp webhook simulator |

## Full Flow Testing

Complete the end-to-end flow:

1. **Create User**: POST `/api/v1/users/` → saves `user_id`
2. **Analyze Document**: Upload file → returns `analysis_id` (request ID)
3. **Poll Analysis**: GET `/api/v1/documents/analysis/{id}` until `status != "processing"`
4. **Get Risk Card**: GET `/api/v1/risk-card/{analysis_id}` → returns PDF URL

All IDs are auto-saved in flow state and pre-filled into subsequent endpoints.

## Risk Card Options

The `/api/v1/risk-card/{analysis_id}` endpoint supports:

- **Default**: Returns JSON with `analysis_id` and `risk_card_url`
- **`?refresh=true`**: Regenerates/re-uploads PDF to Cloudinary
- **`?redirect=true`**: Returns 302 redirect to PDF URL

The frontend shows buttons to:
- Open PDF in new tab
- Copy URL to clipboard
- Refresh/regenerate PDF
- View embedded PDF in iframe

## Deployment on QuikDB (production)

This project is deployed to QuikDB. The frontend is a static site served from QuikDB static hosting, and the backend is hosted as QuikDB serverless functions (or an HTTP service) at `https://naijalex.quikdb.net`.

1. Build the frontend:

```bash
npm run build
```

2. Configure QuikDB environment variables (Dashboard → Project Settings) for the frontend and functions:

- `VITE_API_BASE_URL=https://naijalex.quikdb.net`
- `VITE_WHATSAPP_SANDBOX_NUMBER` — as applicable
- `VITE_WHATSAPP_SANDBOX_JOIN_CODE` — as applicable
- `VITE_WHATSAPP_SANDBOX_QR_URL` — optional

3. Deploy the frontend build to QuikDB static hosting (example using the QuikDB CLI):

```bash
# Example commands — replace with your QuikDB CLI invocation
quikdb login
quikdb deploy site --path=./dist --name=naijalex-frontend
```

4. Deploy the backend API to QuikDB (serverless functions or service):

```bash
# Example (adjust to your backend language/framework)
quikdb deploy functions --path=./api --name=naijalex-api
```

5. Verify deployment:

- Frontend should be available at your QuikDB site URL (set in QuikDB dashboard).
- API endpoints should be reachable at `https://naijalex.quikdb.net/api/v1/...`.

Notes:
- If you use a custom domain, configure DNS in the QuikDB dashboard and update `VITE_API_BASE_URL` to the custom domain.
- QuikDB provides environment variable management — set production secrets and configuration there rather than committing them to the repo.

## Development

```bash
# Run dev server (local, connects to local API or demo mode)
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

## Browser Extension & QuikDB

The Chrome extension bundle (`naijalex-extension/`) is a lightweight popup that calls the same QuikDB-hosted backend. Before publishing or packaging the extension, ensure `popup.js` points to the QuikDB API base:

```js
// naijalex-extension/popup.js
const FRONTEND_BASE = 'https://naijalex.quikdb.net';
```

During local testing you can load the extension as an unpacked extension in Chrome. For production, publish to the Chrome Web Store per Google's guidelines; the extension will call the QuikDB backend.

## Project Structure

```
src/
├── api/
│   └── client.ts           # Axios instance + typed API functions
├── components/
│   ├── analysis/           # Analysis result components
│   ├── explorer/           # API Explorer components
│   ├── layout/             # Navbar, Footer
│   └── upload/             # DropZone, LanguageToggle
├── contexts/
│   └── AppContext.tsx      # Global state + flow state
├── hooks/
│   ├── useAnalysis.ts      # Polling hook
│   └── useUser.ts          # User management hook
├── pages/
│   ├── Analysis.tsx        # Results page
│   ├── Analyze.tsx         # Upload flow
│   ├── Explorer.tsx        # API dashboard
│   └── Landing.tsx         # Marketing page
├── types/
│   ├── index.ts            # TypeScript types
│   └── endpoints.ts        # Endpoint configs
├── App.tsx                 # Router setup
├── main.tsx                # Entry point
└── index.css               # Tailwind base
```

## Demo Mode

The app supports a "Demo Mode" toggle (in development) that uses mock responses instead of hitting the live API. This is useful for UI testing without a backend.

## License

Built for AfriLab Lagos Hackathon.
