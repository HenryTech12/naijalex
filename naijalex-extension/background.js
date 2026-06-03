// Service worker — handles extension lifecycle
chrome.runtime.onInstalled.addListener(() => {
  console.log('NaijaLex extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'PDF_DETECTED') {
    // Badge the extension icon when a PDF is on the page
    chrome.action.setBadgeText({ text: 'PDF', tabId: sender.tab?.id });
    chrome.action.setBadgeBackgroundColor({ color: '#1D9E75', tabId: sender.tab?.id });
  }

  if (message.type === 'CLEAR_BADGE') {
    chrome.action.setBadgeText({ text: '', tabId: sender.tab?.id });
  }
});
