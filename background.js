let unlockedData = null;

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SET_UNLOCKED') {
    unlockedData = msg.data;
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'LOCK') {
    unlockedData = null;
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'CONNECT' || msg.type === 'ETH_REQUEST') {
    if (!unlockedData || !unlockedData.addrs) {
      sendResponse({ error: 'Wallet locked. Open Vex Wallet and unlock first.' });
      return true;
    }
    sendResponse({
      publicKey: unlockedData.addrs.sol,
      accounts: unlockedData.addrs.evm ? [unlockedData.addrs.evm] : []
    });
    return true;
  }
  if (msg.type === 'SIGN_MESSAGE') {
    if (!unlockedData) {
      sendResponse({ error: 'Wallet locked' });
      return true;
    }
    // Signing pipeline not fully wired yet — returns placeholder
    sendResponse({ error: 'Message signing not yet available in this build' });
    return true;
  }
  if (msg.type === 'DISCONNECT') {
    sendResponse({ ok: true });
    return true;
  }
  sendResponse({ ok: true });
  return true;
});
