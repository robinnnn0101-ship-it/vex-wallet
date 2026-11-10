# Vex Wallet

Non-custodial multi-chain wallet with a quantum-resistant layer.

## Contents
- `extension/` — Chrome/Edge wallet (create, import, send SOL, ML-DSA key)
- `solana-vault/` — Anchor program that custodies SOL under an ML-DSA public key

## Quantum note
Current Solana uses Ed25519. This repo adds:
1. A browser wallet that generates real ML-DSA keys
2. A Solana program that can hold SOL and release it only after ML-DSA verification (hook ready)

## Status
Wallet UI and vault program structure are in place. Plug in the Dilithium verify function to complete on-chain quantum custody.
