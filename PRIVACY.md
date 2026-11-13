# Privacy Policy — Vex Wallet

**Last updated: 13 November 2026**

Vex Wallet is a **non-custodial** browser extension. We do not run servers that store your seed, private keys, or passwords.

## What we store

- Encrypted wallet data (seed, keys, addresses) lives only in your browser’s local storage (`chrome.storage.local`).
- Encryption uses AES-GCM with a password you choose (PBKDF2, 180,000 iterations).
- Nothing is sent to us.

## What the extension accesses

- `storage` — to save your encrypted wallet
- `activeTab` / `scripting` — to inject the provider into dApps you visit
- Host permissions on `https://*/*` and `localhost` — so the wallet can talk to dApps

## What we do **not** do

- We do not collect analytics
- We do not track your addresses or transactions
- We do not transmit your seed or private keys anywhere
- We do not sell data

## Third parties

Balance lookups and transaction broadcasting (when implemented) go directly from your browser to public RPCs (Solana, Ethereum, BNB). Those networks see the requests as any other wallet would.

## Contact

Questions: open an issue on the public repo or contact the developer.

By using Vex Wallet you acknowledge that you are responsible for your seed phrase. Losing it means losing access to your funds. We cannot recover it.
