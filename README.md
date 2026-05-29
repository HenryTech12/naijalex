# NaijaLex Backend 🇳🇬⚖️

NaijaLex is an LLM-powered legal document understanding agent designed for Nigerian SMEs. It parses complex contracts (tenancy, loans, employment, etc.), flags risks in plain English and Nigerian Pidgin, and provides negotiation drafts.

## Tech Stack
- **Backend**: FastAPI 0.115
- **Orchestration**: LangGraph (Multi-agent pipeline)
- **Engine**: Claude 3.5 Sonnet
- **Vector DB**: ChromaDB (with 50+ Nigerian legal clauses)
- **Database**: PostgreSQL + Redis
- **WhatsApp**: Twilio API

## Features
- **Multi-Agent Pipeline**: Context Agent (Classification) -> Analyst Agent (Risk Scoring) -> Advisor Agent (Negotiation drafts)
- **Pidgin Mode**: All analysis can be delivered in natural Lagos Pidgin.
- **OCR Support**: Handles scanned images and PDFs via Tesseract.
- **Risk Cards**: Generates shareable PDF risk cards with QR codes.
- **WhatsApp Integration**: Fully functional chatbot for SME owners on the go.

## Setup

1. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

2. **Docker Run**:
   ```bash
   docker-compose up --build
   ```

3. **API Documentation**:
   Once running, access Swagger docs at `http://localhost:8000/docs`

## Usage (API)

- `POST /api/v1/documents/analyze`: Upload a document for analysis.
- `GET /api/v1/documents/analysis/{id}`: Retrieve detailed risk report.
- `GET /api/v1/risk-card/{id}`: Get the PDF risk card.
- `POST /api/v1/webhook/whatsapp`: Twilio webhook endpoint.

## License
MIT - BuildQuik Challenge 2026
