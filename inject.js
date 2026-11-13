(function () {
  if (window.vexInjected) return;
  window.vexInjected = true;

  let connected = false;
  let publicKey = null;
  let accounts = [];

  function rpc(type, payload = {}) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type, ...payload }, (res) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (res?.error) reject(new Error(res.error));
        else resolve(res);
      });
    });
  }

  const provider = {
    isVex: true,
    isPhantom: true,
    isMetaMask: true,
    get publicKey() { return publicKey; },
    get isConnected() { return connected; },
    get selectedAddress() { return accounts[0] || null; },

    connect: async (opts = {}) => {
      const res = await rpc('CONNECT', { onlyIfTrusted: opts.onlyIfTrusted });
      publicKey = {
        toString: () => res.publicKey,
        toBase58: () => res.publicKey,
        toBytes: () => new Uint8Array(32)
      };
      accounts = res.accounts || [];
      connected = true;
      window.dispatchEvent(new CustomEvent('accountChanged', { detail: publicKey }));
      return { publicKey };
    },

    disconnect: async () => {
      connected = false;
      publicKey = null;
      accounts = [];
      await rpc('DISCONNECT');
      window.dispatchEvent(new CustomEvent('disconnect'));
    },

    signTransaction: async (tx) => {
      const serialized = tx.serialize ? Array.from(tx.serialize({ requireAllSignatures: false })) : Array.from(tx);
      const res = await rpc('SIGN_SOLANA', { kind: 'transaction', data: serialized });
      if (res.signature) {
        if (tx.addSignature && publicKey) {
          tx.addSignature(publicKey, new Uint8Array(res.signature));
        }
        return tx;
      }
      throw new Error(res.error || 'Sign failed');
    },

    signAllTransactions: async (txs) => {
      const results = [];
      for (const tx of txs) {
        results.push(await provider.signTransaction(tx));
      }
      return results;
    },

    signMessage: async (message) => {
      const msg = message instanceof Uint8Array ? Array.from(message) : Array.from(new TextEncoder().encode(message));
      const res = await rpc('SIGN_MESSAGE', { message: msg });
      return { signature: new Uint8Array(res.signature || []) };
    },

    request: async ({ method, params }) => {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
        const res = await rpc('ETH_REQUEST');
        return res.accounts || [];
      }
      if (method === 'connect') return provider.connect();
      if (method === 'personal_sign' || method === 'eth_sign') {
        const msg = params?.[0] || '';
        const res = await rpc('PERSONAL_SIGN', { message: msg });
        return res.signature || '0x';
      }
      if (method === 'eth_sendTransaction') {
        throw new Error('eth_sendTransaction: use the wallet Send tab or wait for next update');
      }
      throw new Error('Method not supported: ' + method);
    },

    on: () => {},
    removeListener: () => {},
    removeAllListeners: () => {}
  };

  Object.defineProperty(window, 'solana', { value: provider, writable: false });
  Object.defineProperty(window, 'ethereum', { value: provider, writable: false });
  window.vex = provider;

  window.dispatchEvent(new Event('solana#initialized'));
  window.dispatchEvent(new Event('ethereum#initialized'));
})();
