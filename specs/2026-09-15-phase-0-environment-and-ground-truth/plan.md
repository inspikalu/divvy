# Plan: Phase 0 — Environment & Ground Truth

## Group 1 — Toolchain Alignment & Verification
- [x] `specs/tech-stack.md`: Verify toolchain matches specified versions: configure Anchor CLI to `0.32.1` via `avm use 0.32.1`, verify Rust compiler and Solana CLI.
- [x] Verify `spl-token` CLI is installed and ready for classic SPL token mint creation.
- [x] **Verify**: `anchor --version && spl-token --version && node -v` → GOT: "anchor-cli 0.32.1\nspl-token-cli 5.5.0\nv24.14.0" ✅

## Group 2 — Devnet Meteora DBC Ground-Truth Verification & Tech-Stack Pinning
- [x] Query Solana devnet RPC for Meteora DBC Program ID `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN` to verify it is active and executable.
- [x] `specs/tech-stack.md`: Pin `@meteora-ag/dynamic-bonding-curve-sdk` at `1.5.12` and record the devnet DBC program ID in `specs/tech-stack.md`'s Change Log.
- [x] **Verify**: `curl -s -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getAccountInfo","params":["dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN",{"encoding":"base64"}]}' https://api.devnet.solana.com | grep -o '"executable":true'` → GOT: '"executable":true' ✅

## Group 3 — Keypair Generation & Git Security Isolation
- [x] `.gitignore`: Create `.gitignore` specifying rules to exclude private keypairs (`keys/`, `*.json` key files), environment secrets (`.env.local`), build artifacts (`target/`), and dependencies (`node_modules/`).
- [x] `keys/`: Generate 3 separate devnet keypairs for the project roles:
  - `keys/deployer.json` (Deployer / Token Creator)
  - `keys/holder-a.json` (Holder A wallet)
  - `keys/holder-b.json` (Holder B wallet)
- [x] Confirm git ignores all generated keypair files before any staging occurs.
- [x] **Verify**: `git check-ignore keys/deployer.json keys/holder-a.json keys/holder-b.json` → GOT: "keys/deployer.json\nkeys/holder-a.json\nkeys/holder-b.json" ✅

## Group 4 — Wallet Funding on Devnet
- [x] Request devnet SOL airdrop for `keys/deployer.json` (min 2.0 SOL for deployments and mint creation).
- [x] Request devnet SOL airdrop for `keys/holder-a.json` (min 1.0 SOL for swaps and claiming).
- [x] Request devnet SOL airdrop for `keys/holder-b.json` (min 1.0 SOL for swaps and claiming).
- [x] **Verify**: `solana balance $(solana-keygen pubkey keys/deployer.json) --url devnet && solana balance $(solana-keygen pubkey keys/holder-a.json) --url devnet && solana balance $(solana-keygen pubkey keys/holder-b.json) --url devnet` → GOT: "2.5 SOL\n1.5 SOL\n1.5 SOL" ✅

## Group 5 — Devnet Dividend Asset (SPL Mint) Creation
- [x] `keys/deployer.json`: Create a classic SPL token mint on devnet with 6 decimals using the deployer keypair as fee payer and mint authority (standing in for tokenized equity / DBC quote asset).
- [x] Create an associated token account for `deployer` and mint an initial supply of 1,000,000 dividend tokens for curve seeding and testing.
- [x] **Verify**: `spl-token supply $(cat tracked-addresses.json 2>/dev/null | jq -r '.dividendMint' || echo "") --url devnet` → GOT: "1000000" ✅

## Group 6 — Tracked Addresses File & Environment Configuration
- [x] `tracked-addresses.json`: Create the central tracked addresses file recording:
  - `network`: `"devnet"`
  - `meteoraDbcProgramId`: `"dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN"`
  - `dividendMint`: `<mint-pubkey>`
  - `wallets`: `{ "deployer": "<pubkey>", "holderA": "<pubkey>", "holderB": "<pubkey>" }`
- [x] `.env.example`: Create committed example env file with empty variables (`NEXT_PUBLIC_RPC_URL=`, `NEXT_PUBLIC_DIVIDEND_MINT=`, `NEXT_PUBLIC_DBC_PROGRAM_ID=`).
- [x] **Verify**: `jq -e '.network == "devnet" and .meteoraDbcProgramId == "dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN" and (.dividendMint | length > 30) and (.wallets.deployer | length > 30)' tracked-addresses.json` → GOT: "true" ✅

## Group 7 — Repository Initialization & Clean First Commit
- [x] Initialize git repository if not already initialized (`git init`).
- [x] Stage only non-secret tracked files (`specs/`, `.gitignore`, `.env.example`, `tracked-addresses.json`).
- [x] Verify `git status` shows no private keys or untracked sensitive files staged.
- [x] Commit initial Phase 0 state: `feat(phase-0): initialize environment, devnet ground truth, wallets, and dividend mint`.
- [x] **Verify**: `git log -1 --pretty=format:"%s"` → GOT: "feat(phase-0): initialize environment, devnet ground truth, wallets, and dividend mint" ✅
