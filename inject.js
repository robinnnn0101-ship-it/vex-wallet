(function () {
  if (window.vexInjected) return;
  window.vexInjected = true;

  let connected = false;
  let publicKey = null;
  let accounts = [];

  const provider = {
    isVex: true,
    isPhantom: true,
    isMetaMask: true,
    get publicKey() { return publicKey; },
    get isConnected() { return connected; },
    get selectedAddress() { return accounts[0] || null; },

    connect: async (opts = {}) => {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'CONNECT', onlyIfTrusted: opts.onlyIfTrusted },
          (res) => {
            if (chrome.runtime.lastError || !res || res.error) {
              reject(new Error(res?.error || 'Connection rejected'));
              return;
            }
            publicKey = {
              toString: () => res.publicKey,
              toBase58: () => res.publicKey,
              toBytes: () => new Uint8Array(32)
            };
            accounts = res.accounts || [];
            connected = true;
            window.dispatchEvent(new CustomEvent('accountChanged', { detail: publicKey }));
            resolve({ publicKey });
          }
        );
      });
    },

    disconnect: async () => {
      connected = false;
      publicKey = null;
      accounts = [];
      chrome.runtime.sendMessage({ type: 'DISCONNECT' });
      window.dispatchEvent(new CustomEvent('disconnect'));
    },

    signTransaction: async () => {
      throw new Error('Transaction signing coming in next update. Unlock wallet and try again later.');
    },
    signAllTransactions: async () => {
      throw new Error('Transaction signing coming in next update.');
    },
    signMessage: async (message) => {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'SIGN_MESSAGE', message: Array.from(message) },
          (res) => {
            if (res?.error) reject(new Error(res.error));
            else resolve({ signature: new Uint8Array(64) }); // placeholder
          }
        );
      });
    },

    request: async ({ method, params }) => {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage({ type: 'ETH_REQUEST' }, (res) => {
            resolve(res?.accounts || []);
          });
        });
      }
      if (method === 'connect') return provider.connect();
      if (method === 'personal_sign' || method === 'eth_sign') {
        throw new Error('Signing not fully implemented yet — use connect + unlock for now.');
      }
      throw new Error('Method not supported: ' + method);
    },

    on: (event, cb) => {},
    removeListener: () => {},
    removeAllListeners: () => {}
  };

  Object.defineProperty(window, 'solana', { value: provider, writable: false });
  Object.defineProperty(window, 'ethereum', { value: provider, writable: false });
  window.vex = provider;

  window.dispatchEvent(new Event('solana#initialized'));
  window.dispatchEvent(new Event('ethereum#initialized'));
})();
