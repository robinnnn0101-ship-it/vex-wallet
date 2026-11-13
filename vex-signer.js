// Vex Wallet — proper dApp signing (Solana + Ethereum)
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

  setTimeout(refreshSeed, 400);

  async function refreshSeed() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'GET_UNLOCKED' });
      if (res?.data?.seed) currentSeed = res.data.seed;
    } catch {}
  }

  async function handlePending(id, request) {
    await refreshSeed();
    if (!currentSeed) {
      chrome.runtime.sendMessage({ type: 'SIGN_RESULT', id, result: { error: 'Wallet not unlocked' } });
      return;
    }

    const label = request.type === 'SIGN_SOLANA' || request.kind === 'transaction'
      ? 'Solana transaction'
      : request.type === 'PERSONAL_SIGN'
        ? 'Ethereum personal_sign'
        : 'message';

    const ok = confirm(`Vex Wallet\n\nApprove ${label}?`);
    if (!ok) {
      chrome.runtime.sendMessage({ type: 'SIGN_RESULT', id, result: { error: 'User rejected' } });
      return;
    }

    try {
      const crypto = window.__vexCrypto;
      if (!crypto) throw new Error('Crypto not ready — reopen wallet');

      let result;
      if (request.type === 'SIGN_SOLANA' || request.kind === 'transaction') {
        result = await signSolana(crypto, currentSeed, request);
      } else if (request.type === 'PERSONAL_SIGN') {
        result = await signPersonal(crypto, currentSeed, request);
      } else {
        result = await signMessage(crypto, currentSeed, request);
      }
      chrome.runtime.sendMessage({ type: 'SIGN_RESULT', id, result });
    } catch (e) {
      chrome.runtime.sendMessage({ type: 'SIGN_RESULT', id, result: { error: e.message || String(e) } });
    }
  }

  function getKeys(crypto, seed) {
    const derived = crypto.derive(seed);
    return {
      solSecret: derived.secretKey,
      ethPriv: derived.ethPriv,
      solPub: derived.sol
    };
  }

  async function signMessage(crypto, seed, request) {
    const keys = getKeys(crypto, seed);
    const msg = request.message instanceof Array
      ? new Uint8Array(request.message)
      : new TextEncoder().encode(String(request.message || ''));
    const sig = crypto.nacl.sign.detached(msg, keys.solSecret);
    return { signature: Array.from(sig) };
  }

  async function signSolana(crypto, seed, request) {
    const keys = getKeys(crypto, seed);
    const data = new Uint8Array(request.data || []);
    if (data.length === 0) throw new Error('Empty transaction');
    let message = data;
    if (data[0] === 1 && data.length > 65) {
      message = data.slice(1 + 64);
    }
    const sig = crypto.nacl.sign.detached(message, keys.solSecret);
    return { signature: Array.from(sig), publicKey: keys.solPub };
  }

  async function signPersonal(crypto, seed, request) {
    const keys = getKeys(crypto, seed);
    const wallet = new crypto.Wallet(keys.ethPriv);
    let msg = request.message || '';
    if (typeof msg === 'string' && msg.startsWith('0x')) {
      try {
        msg = new TextDecoder().decode(crypto.Buffer.from(msg.slice(2), 'hex'));
      } catch {}
    }
    const signature = await wallet.signMessage(String(msg));
    return { signature };
  }
})();
