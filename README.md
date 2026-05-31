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

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file (see `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8000
```

For production, set this to your deployed backend URL.

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

## Development

```bash
# Run dev server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

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
