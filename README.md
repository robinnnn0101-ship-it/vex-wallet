# Vex Wallet v1.8

Non-custodial multi-chain wallet. Solana · Ethereum · BNB · ML-DSA-65.

## What works
- BIP39 seed create / import / encrypt / unlock
- Solana + EVM derivation
- ML-DSA-65 quantum key storage
- Multi-wallet, side panel, neon dashboard UI
- Balance fetch (fixed BigInt handling, multi-RPC)
- Send from wallet UI
- dApp connect + real Solana signMessage / signTransaction
- Real Ethereum personal_sign
- Approval prompt before signatures

## Install (Developer)
1. Unzip this package
2. `chrome://extensions` or `edge://extensions` → Developer mode
3. Load unpacked → select this folder

## Chrome Web Store / Edge Add-ons Submission

1. Zip this entire folder (no parent folder)
2. Chrome: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Edge: [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview)
4. Upload the zip
5. Privacy policy: paste contents of `PRIVACY.md`
6. Screenshots: take 3–5 of the dashboard, send, receive, unlock screens
7. Description: use the short description from `manifest.json`
8. Permissions justification:
   - storage: encrypted wallet data
   - activeTab / scripting: inject provider into dApps
   - host permissions: connect to dApps and RPCs

## Status
Core wallet is functional for real use. Full edge-case Phantom parity is ongoing.

MIT License. See PRIVACY.md.
