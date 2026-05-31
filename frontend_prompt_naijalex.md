# NaijaLex Frontend Prompt

```text
Build a modern, polished frontend for the NaijaLex API that acts like an interactive API explorer and demo dashboard. The UI must show every API endpoint, its request format, sample request payload, and sample response payload. Make it feel like a legal-tech product for Nigerian SMEs: bold, trustworthy, premium, and mobile responsive.

Tech requirements:
- Use React + TypeScript.
- Prefer Vite or Next.js, but keep the architecture simple.
- Use a clean component structure with reusable API endpoint cards, request editors, response panels, and a sidebar navigation.
- Use environment variable API base URL, e.g. VITE_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL.
- Include loading, success, and error states for every endpoint.
- Include copy-to-clipboard buttons for request JSON, cURL, and response JSON.
- Include syntax highlighting for JSON.
- For file upload endpoints, use a file picker and multipart form UI.
- For the risk card endpoint, show the PDF inline if possible or provide a download/open button.

UI goals:
- Sidebar with all endpoints grouped by category:
  - Health
  - Users
  - Documents
  - Risk Cards
  - WhatsApp
- Main panel should let the user select an endpoint and see:
  - Endpoint title
  - Method and route
  - Description
  - Request section
  - Example request
  - Response section
  - Example response
  - Try it button
- Add a top summary showing app name, version, and a short description.
- Use an attractive legal-tech theme with strong typography and subtle gradients.
- Make it feel like a dashboard, not a plain Swagger clone.

Endpoints to include:

1) Health
- GET /api/v1/health
- No request body
- Example response:
```json
{
  "status": "ok",
  "db": "ok",
  "redis": "ok",
  "llm": "ok"
}
```

2) Create User
- POST /api/v1/users/
- Request JSON:
```json
{
  "phone_number": "+2348012345678",
  "business_type": "SME",
  "industry": "Retail",
  "risk_tolerance": "medium",
  "typical_contracts": ["lease", "supplier agreement"]
}
```
- Example response:
```json
{
  "phone_number": "+2348012345678",
  "business_type": "SME",
  "industry": "Retail",
  "risk_tolerance": "medium",
  "typical_contracts": ["lease", "supplier agreement"],
  "id": "a25ec946-6068-4ac5-861a-40315178ec84",
  "created_at": "2026-05-31T15:37:48.386269",
  "updated_at": "2026-05-31T15:37:48.386276",
  "session_count": 0,
  "last_seen": "2026-05-31T15:37:48.386279"
}
```

3) Get User Profile
- GET /api/v1/users/{user_id}/profile
- Path param: user_id as UUID
- Example response:
```json
{
  "phone_number": "+2348012345678",
  "business_type": "SME",
  "industry": "Retail",
  "risk_tolerance": "medium",
  "typical_contracts": ["lease", "supplier agreement"],
  "id": "a25ec946-6068-4ac5-861a-40315178ec84",
  "created_at": "2026-05-31T15:37:48.386269",
  "updated_at": "2026-05-31T15:37:48.386276",
  "session_count": 0,
  "last_seen": "2026-05-31T15:37:48.386279"
}
```

4) Analyze Document
- POST /api/v1/documents/analyze
- Multipart/form-data, not JSON
- Fields:
  - file: upload file
  - user_id: UUID
  - language_mode: english or pidgin
- Show file input, text input for user_id, and select for language_mode.
- Example response:
```json
{
  "analysis_id": "bd94ddd4-13d7-4393-8bc5-d5c85593334a",
  "status": "processing",
  "estimated_seconds": 30
}
```

5) Get Analysis
- GET /api/v1/documents/analysis/{analysis_id}
- Path param: analysis_id as UUID
- Example response:
```json
{
  "id": "512aa44b-6a61-4c42-8364-1b40cc304a83",
  "document_id": "bd94ddd4-13d7-4393-8bc5-d5c85593334a",
  "created_at": "2026-05-31T15:43:55.984199",
  "language_mode": "english",
  "clauses": [
    {
      "clause_id": "1",
      "title": "Tenancy Duration and Automatic Expiry",
      "original_text": "To use the demise property for a fixed period of one year starting from .... to ..... 2021 after which the tenancy automatically expires.",
      "plain_english": "The rent is for a year and ends automatically after the year without renewal.",
      "pidgin_explanation": "Dis clause mean say rent go end after one year, no be say e go renew by itself.",
      "severity": "Standard",
      "risk_type": "auto_renewal",
      "legal_reference": "Lagos State Tenancy Law 2011",
      "financial_exposure": null,
      "action": "Accept",
      "urgency_rank": 3
    }
  ],
  "overall_risk": "Medium",
  "summary": "This tenancy agreement outlines a one-year lease for a flat in Lagos State, Nigeria...",
  "top_3_actions": [
    "Draft an email to the landlord proposing the revised clauses for negotiation.",
    "Schedule a meeting or call with the landlord to discuss these proposed changes in detail.",
    "Review the Lagos State Tenancy Law 2011 to understand obligations and rights regarding tenancy agreements."
  ],
  "risk_card_url": null,
  "processing_time_ms": 0,
  "status": "complete"
}
```

6) Get Risk Card
- GET /api/v1/risk-card/{analysis_id}
- Path param: analysis_id as UUID
- Response is a PDF file, not JSON.
- If possible, render it inline in an iframe or embed viewer.
- Also provide a download link.
- Add note that the endpoint returns application/pdf.

7) WhatsApp Webhook
- POST /api/v1/webhook/whatsapp
- Form-data style payload, not JSON
- Example fields:
```text
SmsMessageSid=SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NumMedia=1
ProfileName=John Doe
MessageType=text
From=whatsapp:+2348012345678
To=whatsapp:+14155238886
Body=Hello
MediaUrl0=https://example.com/file.pdf
MediaContentType0=application/pdf
```
- Show it as a simulated Twilio webhook tester with fields for text and optional media.
- Response example:
```text
OK
```

Important frontend behavior:
- The request panel should let the user edit the payload before sending.
- For JSON requests, use a code editor-like textarea.
- For multipart requests, use actual inputs.
- For GET endpoints, show no request body.
- After send, show:
  - request URL
  - request headers
  - response status
  - response body
  - response headers if available
- Show 404, 422, and 500 states nicely with readable error cards.
- When the analysis status is processing, show a polling option for GET /api/v1/documents/analysis/{analysis_id}.
- Use the sample IDs from the examples for demo mode.

Design direction:
- Use a deep navy / green / gold legal-tech palette.
- Add a strong hero section with NaijaLex branding.
- Use cards, gradients, and a premium docs-dashboard layout.
- Avoid generic boilerplate styling.

Deliverables:
- A complete frontend codebase.
- A fully wired endpoint explorer page.
- Clean components and mocked sample data if the backend is unavailable.
- The app should be ready to connect to the live backend with the API base URL env variable.

If you need to mock the API responses for preview mode, include a toggle between "Live API" and "Demo Mode".

Also include a summary panel that lists:
- method
- endpoint
- request type
- authentication requirement if any
- response type
- sample payload

Build it so I can immediately test every endpoint from the UI.
```