(function () {
  if (window.vexWallet) return;
  const provider = {
    isVex: true,
    isPhantom: true,
    publicKey: null,
    isConnected: false,
    connect: async () => Promise.reject(new Error('Approve in Vex Wallet popup')),
    request: async ({ method }) => {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [];
      throw new Error(method + ' not implemented');
    }
  };
  window.solana = provider;
  window.ethereum = provider;
  window.vexWallet = provider;
  window.dispatchEvent(new Event('solana#initialized'));
})();
