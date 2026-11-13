# Vex Wallet

**Non-custodial multi-chain wallet with quantum-resistant keys.**

Solana · Ethereum · BNB Chain · Bitcoin address · ML-DSA-65 (NIST Dilithium)

## Features (v1.6)

- Real BIP39 seed generation + import
- Solana address (ed25519) + Ethereum / BNB address
- ML-DSA-65 post-quantum keypair stored & encrypted
- AES-GCM + PBKDF2 encryption
- Lock / unlock / reveal seed / export key
- Multi-wallet support
- Side panel + popup
- **dApp provider**: connect + signMessage / signTransaction (approval prompt)
- Address book, history, receive QR, send UI
- Improved multi-RPC balance fetching
- Vexlore browser shortcuts

## Install (Developer Mode)

1. Download / clone this repo
2. Go to `chrome://extensions` or `edge://extensions`
3. Enable **Developer mode**
4. **Load unpacked** → select this folder
5. Pin the extension and open the side panel

## Current status

- Connect works
- Message signing works (with approval popup)
- Transaction signing returns signature (simplified path)
- Send from the wallet UI works
- Balances use multiple public RPCs with fallback

## Privacy

See `PRIVACY.md`. Non-custodial — seeds never leave the device.

## License

MIT
