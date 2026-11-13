let unlockedData = null;
let pendingRequests = new Map();
let requestId = 0;

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  }
});

function openApprovalUI() {
  if (chrome.sidePanel?.open) {
    chrome.windows.getCurrent({}, (win) => {
      if (win?.id) chrome.sidePanel.open({ windowId: win.id }).catch(() => {});
    });
  }
  chrome.action.openPopup?.().catch(() => {});
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SET_UNLOCKED') {
    unlockedData = msg.data;
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'LOCK') {
    unlockedData = null;
    pendingRequests.clear();
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'CONNECT' || msg.type === 'ETH_REQUEST') {
    if (!unlockedData?.addrs) {
      sendResponse({ error: 'Wallet locked. Open Vex Wallet and unlock first.' });
      return true;
    }
    sendResponse({
      publicKey: unlockedData.addrs.sol,
      accounts: unlockedData.addrs.evm ? [unlockedData.addrs.evm] : []
    });
    return true;
  }
  if (msg.type === 'GET_UNLOCKED') {
    sendResponse({ data: unlockedData });
    return true;
  }
  if (msg.type === 'SIGN_SOLANA' || msg.type === 'SIGN_MESSAGE' || msg.type === 'PERSONAL_SIGN') {
    if (!unlockedData) {
      sendResponse({ error: 'Wallet locked' });
      return true;
    }
    const id = ++requestId;
    pendingRequests.set(id, { msg, sendResponse, ts: Date.now() });
    openApprovalUI();
    chrome.runtime.sendMessage({ type: 'PENDING_SIGN', id, request: msg }).catch(() => {});
    return true;
  }
  if (msg.type === 'SIGN_RESULT') {
    const pending = pendingRequests.get(msg.id);
    if (pending) {
      pending.sendResponse(msg.result);
      pendingRequests.delete(msg.id);
    }
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'DISCONNECT') {
    sendResponse({ ok: true });
    return true;
  }
  sendResponse({ ok: true });
  return true;
});

setInterval(() => {
  const now = Date.now();
  for (const [id, p] of pendingRequests) {
    if (now - p.ts > 120000) {
      p.sendResponse({ error: 'Request timed out' });
      pendingRequests.delete(id);
    }
  }
}, 15000);
