const API_BASE = 'https://naijalex.onrender.com';
const FRONTEND_BASE = 'https://naijalex.quikdb.net';

let selectedFile = null;
let selectedUrl = null;
let languageMode = 'pidgin';
let currentAnalysisId = null;
let pollInterval = null;
let pollCount = 0;

// ── Init ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  restoreState();
  setLang('pidgin');
  detectPdfOnPage();
  setupUploadArea();

  document.getElementById('btnEn').addEventListener('click', () => setLang('english'));
  document.getElementById('btnPg').addEventListener('click', () => setLang('pidgin'));
  document.getElementById('analyzeBtn').addEventListener('click', () => startAnalysis());
  document.getElementById('openFullBtn').addEventListener('click', () => openFullAnalysis());
  document.getElementById('resetBtn').addEventListener('click', () => resetToUpload());
});

// ── Language toggle ────────────────────────────────────────────────────────

function setLang(mode) {
  languageMode = mode;
  document.getElementById('btnEn').classList.toggle('active', mode === 'english');
  document.getElementById('btnPg').classList.toggle('active', mode === 'pidgin');
}

// ── PDF detection ─────────────────────────────────────────────────────────

async function detectPdfOnPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    const url = tab.url;
    const isPdf =
      url.endsWith('.pdf') ||
      url.includes('.pdf?') ||
      (tab.title || '').toLowerCase().includes('.pdf');

    if (isPdf) {
      const banner = document.getElementById('detectBanner');
      const filename = url.split('/').pop()?.split('?')[0] || 'Document';
      document.getElementById('detectFilename').textContent = filename;
      document.getElementById('detectUrl').textContent = 'PDF detected on this page';
      banner.style.display = 'flex';
      selectedUrl = url;

      document.getElementById('detectUseBtn').onclick = () => {
        banner.style.display = 'none';
        document.getElementById('fileName').textContent = filename;
        document.getElementById('fileSelectedDiv').style.display = 'flex';
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('analyzeBtn').disabled = false;
      };
    }
  } catch {}
}

// ── File upload ──────────────────────────────────────────────────────────

function setupUploadArea() {
  const area = document.getElementById('uploadArea');
  const input = document.getElementById('fileInput');

  area.addEventListener('click', () => input.click());
  area.addEventListener('dragover', (e) => {
    e.preventDefault();
    area.classList.add('dragover');
  });
  area.addEventListener('dragleave', () => area.classList.remove('dragover'));
  area.addEventListener('drop', (e) => {
    e.preventDefault();
    area.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file) handleFileSelect(file);
  });

  input.addEventListener('change', () => {
    if (input.files?.[0]) handleFileSelect(input.files[0]);
  });

  document.getElementById('fileClear').addEventListener('click', () => {
    selectedFile = null;
    selectedUrl = null;
    document.getElementById('fileSelectedDiv').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('analyzeBtn').disabled = true;
    document.getElementById('fileInput').value = '';
  });

  document.getElementById('analyzeBtn').disabled = true;
}

function handleFileSelect(file) {
  const maxSize = 10 * 1024 * 1024;
  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (file.size > maxSize) {
    showError('File too large. Max 10MB.');
    return;
  }
  if (!allowed.includes(file.type) && !file.name.endsWith('.docx')) {
    showError('Unsupported file type. Use PDF, image, or DOCX.');
    return;
  }

  selectedFile = file;
  selectedUrl = null;
  clearError();
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSelectedDiv').style.display = 'flex';
  document.getElementById('uploadArea').style.display = 'none';
  document.getElementById('analyzeBtn').disabled = false;
}

// ── Analysis flow ─��───────────────────────────────────────────────────────

async function startAnalysis() {
  clearError();
  showScreen('processing');

  try {
    clearInterval(pollInterval);
    pollInterval = null;

    const { userId } = await chrome.storage.local.get('userId');
    let uid = userId;

    if (!uid) {
      uid = await createUser();
      await chrome.storage.local.set({ userId: uid });
    }

    const formData = new FormData();
    formData.append('user_id', uid);
    formData.append('language_mode', languageMode);

    if (selectedFile) {
      formData.append('file', selectedFile);
    } else if (selectedUrl) {
      updateProcessingStep('Fetching document from page...');
      try {
        const resp = await fetch(selectedUrl);

        if (!resp.ok) {
          throw new Error('Could not fetch PDF');
        }

        const blob = await resp.blob();
        const filename = selectedUrl.split('/').pop()?.split('?')[0] || 'contract.pdf';
        formData.append('file', blob, filename);
      } catch (err) {
        showError(
          'Could not fetch the PDF from this page. Please download it and upload manually.'
        );
        showScreen('upload');
        return;
      }
    } else {
      showError('No file or URL selected.');
      showScreen('upload');
      return;
    }

    updateProcessingStep('Uploading document...');
    const res = await fetch(`${API_BASE}/api/v1/documents/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();
    const analysisRequestId = data.analysis_id;

    updateProcessingStep('AI is reading your contract...');
    pollCount = 0;
    pollInterval = setInterval(() => pollAnalysis(analysisRequestId), 3000);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    showError(`Failed: ${message}`);
    showScreen('upload');
  }
}

async function pollAnalysis(requestId) {
  pollCount += 1;
  const steps = ['Reading clauses...', 'Flagging risks...', 'Building advice...', 'Almost done...'];
  updateProcessingStep(steps[Math.min(Math.floor(pollCount / 3), steps.length - 1)]);

  if (pollCount > 40) {
    clearInterval(pollInterval);
    showError('Analysis timed out. Please try again.');
    showScreen('upload');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/documents/analysis/${requestId}`);
    if (!res.ok) return;
    const analysis = await res.json();

    if (analysis.status === 'complete') {
      clearInterval(pollInterval);
      currentAnalysisId = analysis.id;
      await chrome.storage.local.set({ lastAnalysisId: analysis.id });
      showResults(analysis);
    } else if (analysis.status === 'failed') {
      clearInterval(pollInterval);
      showError('Analysis failed. Try a clearer document.');
      showScreen('upload');
    }
  } catch {}
}

function showResults(analysis) {
  const badge = document.getElementById('riskBadge');
  badge.textContent = analysis.overall_risk;
  badge.className = `risk-badge risk-${analysis.overall_risk}`;

  document.getElementById('clauseCount')?.remove();
  document.getElementById('processTime')?.remove();

  const summary = analysis.summary || '';
  document.getElementById('summaryText').textContent =
    summary.length > 200 ? `${summary.slice(0, 200)}...` : summary;

  const sorted = [...analysis.clauses]
    .sort((a, b) => {
      const order = { Critical: 0, Caution: 1, Standard: 2 };
      return (order[a.severity] || 2) - (order[b.severity] || 2);
    })
    .slice(0, 5);

  const clauseList = document.getElementById('clauseList');
  clauseList.innerHTML = '';
  sorted.forEach((clause) => {
    const sevClass = clause.severity === 'Critical' ? '' : clause.severity === 'Caution' ? 'caution' : 'standard';
    const explanation = analysis.language_mode === 'pidgin' ? clause.pidgin_explanation : clause.plain_english;
    const short = explanation ? (explanation.length > 100 ? `${explanation.slice(0, 100)}...` : explanation) : '';

    const item = document.createElement('div');
    item.className = `clause-item ${sevClass}`;

    const title = document.createElement('div');
    title.className = 'clause-title';
    title.textContent = clause.title;

    const desc = document.createElement('div');
    desc.className = 'clause-desc';
    desc.textContent = short;

    item.append(title, desc);
    clauseList.appendChild(item);
  });

  showScreen('results');
}

function openFullAnalysis() {
  if (currentAnalysisId) {
    chrome.tabs.create({ url: `${FRONTEND_BASE}/analysis/${currentAnalysisId}` });
  }
}

// ── User creation ─────────────────────────────────────────────────────────

async function createUser() {
  const res = await fetch(`${API_BASE}/api/v1/users/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone_number: '+2340000000000',
      business_type: 'SME',
      industry: 'General',
      risk_tolerance: 'medium',
    }),
  });
  if (!res.ok) throw new Error('Failed to create user');
  const data = await res.json();
  return data.id;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function showScreen(name) {
  document.getElementById('screen-upload').style.display = name === 'upload' ? 'block' : 'none';
  document.getElementById('screen-processing').style.display = name === 'processing' ? 'block' : 'none';
  document.getElementById('screen-results').style.display = name === 'results' ? 'block' : 'none';
}

function updateProcessingStep(text) {
  document.getElementById('processingStep').textContent = text;
}

function showError(msg) {
  const box = document.getElementById('errorBox');
  box.textContent = msg;
  box.style.display = 'block';
}

function clearError() {
  document.getElementById('errorBox').style.display = 'none';
}

function resetToUpload() {
  selectedFile = null;
  selectedUrl = null;
  currentAnalysisId = null;
  clearInterval(pollInterval);
  pollInterval = null;
  clearError();
  document.getElementById('fileSelectedDiv').style.display = 'none';
  document.getElementById('uploadArea').style.display = 'block';
  document.getElementById('analyzeBtn').disabled = true;
  document.getElementById('fileInput').value = '';
  showScreen('upload');
}

function restoreState() {
  chrome.storage.local.get(['lastAnalysisId'], () => {
    // Do not auto-show old results; keep the popup clean on reopen.
  });
}
