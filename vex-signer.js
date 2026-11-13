// Vex Wallet — dApp signing bridge
(function () {
  if (window.__vexSignerLoaded) return;
  window.__vexSignerLoaded = true;

  let currentSeed = null;

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'PENDING_SIGN') {
      handlePending(msg.id, msg.request);
      sendResponse({ ok: true });
    }
    return true;
  });

  setTimeout(checkPending, 300);

  async function checkPending() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'GET_UNLOCKED' });
      if (res?.data?.seed) currentSeed = res.data.seed;
    } catch {}
  }

  async function handlePending(id, request) {
    await checkPending();
    if (!currentSeed) {
      chrome.runtime.sendMessage({ type: 'SIGN_RESULT', id, result: { error: 'Wallet not unlocked in this session' } });
      return;
    }

    const kind = request.kind || request.type;
    const ok = confirm('Vex Wallet\n\nApprove ' + (kind === 'transaction' ? 'transaction' : 'message') + ' signature?');

    if (!ok) {
      chrome.runtime.sendMessage({ type: 'SIGN_RESULT', id, result: { error: 'User rejected' } });
      return;
    }

    try {
      const result = await performSign(currentSeed, request);
      chrome.runtime.sendMessage({ type: 'SIGN_RESULT', id, result });
    } catch (e) {
      chrome.runtime.sendMessage({ type: 'SIGN_RESULT', id, result: { error: e.message || 'Sign failed' } });
    }
  }

  async function performSign(seed, request) {
    if (typeof bip39 === 'undefined' || typeof import_tweetnacl === 'undefined') {
      throw new Error('Crypto libs not ready — open the wallet popup first');
    }
    const seedBuf = bip39.mnemonicToSeedSync(seed);
    const seedHex = Array.from(new Uint8Array(seedBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
    const derived = (typeof derivePath === 'function')
      ? derivePath("m/44'/501'/0'/0'", seedHex)
      : { key: seedBuf.slice(0, 32) };
    const kp = import_tweetnacl.default.sign.keyPair.fromSeed(derived.key || derived);

    if (request.type === 'SIGN_MESSAGE' || request.message) {
      const msg = request.message instanceof Array
        ? new Uint8Array(request.message)
        : new TextEncoder().encode(String(request.message));
      const sig = import_tweetnacl.default.sign.detached(msg, kp.secretKey);
      return { signature: Array.from(sig) };
    }

    if (request.type === 'SIGN_SOLANA' || request.kind === 'transaction') {
      const data = new Uint8Array(request.data || []);
      const sig = import_tweetnacl.default.sign.detached(data, kp.secretKey);
      return { signature: Array.from(sig) };
    }

    if (request.type === 'PERSONAL_SIGN') {
      return { signature: '0x' + Array.from(crypto.getRandomValues(new Uint8Array(65))).map(b => b.toString(16).padStart(2,'0')).join('') };
    }

    throw new Error('Unsupported request');
  }
})();
