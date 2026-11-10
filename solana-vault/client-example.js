// Client example for deposit / withdraw
const anchor = require("@coral-xyz/anchor");
const { PublicKey, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.VexQuantumVault;
  console.log("Vex Quantum Vault client ready");
}

main().catch(console.error);
