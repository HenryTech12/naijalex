# NaijaLex Chrome Extension

Analyze Nigerian contracts directly from your browser.

## Install (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked"
4. Select this `naijalex-extension/` folder
5. The extension appears in your toolbar

## How it works

1. Click the NaijaLex icon in your Chrome toolbar
2. Upload a contract PDF, image, or DOCX, or visit a PDF URL and it auto-detects it
3. Pick English or Lagos Pidgin
4. Click "Analyze Contract"
5. View top risks inline in the popup
6. Click "Open Full Analysis" for the complete breakdown

## Config

To point at a different backend, change the constants in `popup.js`:

- `API_BASE = 'https://naijalex.quikdb.net'`
- `FRONTEND_BASE = 'https://naijalex-frontend.quikdb.net'`
