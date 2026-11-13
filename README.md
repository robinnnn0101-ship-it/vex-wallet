# Vex Wallet v1.7

Non-custodial multi-chain wallet. Solana · Ethereum · BNB · ML-DSA-65.

## What works
- BIP39 seed create / import / encrypt / unlock
- Solana + EVM derivation
- ML-DSA-65 key storage
- Multi-wallet, side panel, address book, history
- Balance fetch (multi-RPC)
- Send from wallet UI
- dApp connect
- **Real Solana signMessage + signTransaction** (ed25519)
- **Real Ethereum personal_sign** (ethers Wallet.signMessage)
- Approval prompt before every signature

## Install
1. Clone or download this repo
2. `chrome://extensions` → Developer mode → Load unpacked
3. Select this folder

## Status
Ready for real use and testing. Full Phantom/MetaMask parity on every edge case is ongoing, but core signing is now real.

MIT License. See PRIVACY.md.
