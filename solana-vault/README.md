# Vex Quantum Vault — Solana Program

Custodies real SOL under an ML-DSA public key.

## Build & deploy
```bash
cd solana-vault
anchor build
anchor deploy
```

Wire the ML-DSA verify function inside withdraw, then the quantum key can custody SOL.
