# Vex Wallet

**Non-custodial multi-chain wallet with quantum-resistant keys.**

Solana · Ethereum · BNB Chain · Bitcoin address · ML-DSA-65 (NIST Dilithium)

## Features (v1.5)

- Real BIP39 seed generation + import
- Solana address (ed25519 Keypair)
- Ethereum / BNB address (ethers)
- ML-DSA-65 post-quantum keypair stored & encrypted
- AES-GCM + PBKDF2-180k encryption
- Lock / unlock / reveal seed / export key
- Multi-wallet support
- Side panel + popup
- Provider injection (Phantom + MetaMask compatible for connect)
- Address book, history, receive QR, send UI
- Vexlore browser shortcuts

## Current Limitations (honest)

- Full transaction signing is **not yet implemented** in this build. Connect works. Signing will land in the next release.
- Balances and send depend on network RPCs — test on devnet first.
- Quantum key is generated and stored; classical chains still require classical signatures.

## Install (Developer Mode)

1. Extract this folder
2. Go to `chrome://extensions` or `edge://extensions`
3. Enable **Developer mode**
4. **Load unpacked** → select this folder
5. Pin the extension and open side panel or popup

## Chrome Web Store / Edge Add-ons

1. Zip this entire folder (no parent folder)
2. Upload
3. Include the Privacy Policy below
4. Add store screenshots of the UI
5. List permissions clearly

## Privacy

See `PRIVACY.md`. Wallet is non-custodial — seeds never leave the device.

## License

MIT
