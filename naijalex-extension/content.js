// Detect PDFs and contracts on the current page
(function () {
  const url = window.location.href;
  const isPdf = url.endsWith('.pdf') || url.includes('.pdf?') || document.contentType === 'application/pdf';

  if (isPdf) {
    chrome.runtime.sendMessage({ type: 'PDF_DETECTED', url });
    return;
  }

  // Detect contract keywords on page text
  const bodyText = document.body?.innerText?.toLowerCase() || '';
  const contractKeywords = [
    'tenancy agreement',
    'lease agreement',
    'supplier agreement',
    'terms and conditions',
    'service agreement',
    'employment contract',
    'memorandum of understanding',
    'non-disclosure agreement',
    'indemnity',
  ];

  const hasContract = contractKeywords.some((keyword) => bodyText.includes(keyword));
  if (hasContract) {
    chrome.runtime.sendMessage({ type: 'PDF_DETECTED', url });
  }
})();
