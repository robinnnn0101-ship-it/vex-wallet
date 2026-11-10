chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  sendResponse({ accounts: [], publicKey: null, connected: false });
  return true;
});
