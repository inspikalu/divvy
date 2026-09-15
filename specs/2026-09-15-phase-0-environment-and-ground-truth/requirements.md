# Requirements: Phase 0 — Environment & Ground Truth

## Scope
- **In**:
  - Toolchain verification and alignment (Anchor `0.30.1`, Rust, Solana Agave CLI, SPL Token CLI, Node.js).
  - Verifying Meteora Dynamic Bonding Curve (DBC) deployment on Solana devnet (`dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`).
  - Pinning `@meteora-ag/dynamic-bonding-curve-sdk` version `1.5.12` and updating `specs/tech-stack.md`.
  - Generation of three separate keypair files (`deployer.json`, `holder-a.json`, `holder-b.json`) in a strictly gitignored `keys/` directory.
  - Airdropping devnet SOL to fund all three wallets.
  - Creation of a devnet classic SPL token mint (with 6 decimals and 1,000,000 initial supply to deployer) standing in for the tokenized equity dividend asset / DBC quote asset.
  - Creation of `tracked-addresses.json` and `.env.example`.
  - Repository git initialization and clean initial commit with zero secret leakage.
- **Out**:
  - Launching the DBC token bonding curve (deferred to Phase 1).
  - Anchor program implementation or deployment (deferred to Phase 2).
  - Mainnet token mints or mainnet SOL transactions (explicitly ruled out).
  - Real tokenized equity protocols (xStock, PreStock, Tessera) devnet integrations (ruled out).

## Key Decisions
- **Anchor 0.30.1 Pinned via `avm`**: Using Anchor `0.30.1` ensures stability and avoids 1.x API shifts under a 48h deadline.
- **Devnet SPL Token as Dividend Asset**: A classic SPL token mint with 6 decimals created on devnet stands in for tokenized equity. It is real on-chain, held by real accounts, and transferred via real transactions.
- **Strict Keypair Isolation in `keys/`**: Keypairs are stored in a dedicated `keys/` folder covered by `.gitignore` prior to any git commits to prevent credential leakage.
- **Tracked Addresses Centralization**: All addresses (mints, wallets, DBC program IDs) are stored in `tracked-addresses.json` at the root so future phases and scripts have a single source of truth.

## Context from mission.md
- **RD-1 & RD-2 Prerequisite**: Establishing a verified devnet DBC program and dividend quote mint is the foundational blocker for the fee -> vault -> claim flow and custom DBC bonding curve.
- **US-5 (Anyone, verify)**: All addresses and transactions must be real devnet on-chain artifacts verifiable in an explorer from the very start.
- **Demo Environment**: Solana devnet only.

## Context from tech-stack.md
- **Solana Cluster**: devnet.
- **Anchor CLI**: `0.30.1` (via `avm`).
- **Rust toolchain**: `1.79.x` / stable.
- **Solana CLI / Agave**: `1.18.x` / `3.1.x` client.
- **SPL Token**: Classic SPL Token (`spl-token-cli`).
- **Meteora SDK**: `@meteora-ag/dynamic-bonding-curve-sdk` pinned at `1.5.12`.
- **Known Issues**: None relevant yet.

## User Stories Addressed
- **RD-1 Prerequisite** (Meteora DBC live flow prerequisite).
- **RD-2 Prerequisite** (Quote asset mint & DBC devnet availability).
- **US-5 (Anyone, verify)** (Explorer-verifiable on-chain addresses).

## Engineering Standards (carried from specs/engineering-standards.md)
- **Mocks/Stubs Policy**:
  - **PERMITTED**: the dividend asset may be a devnet SPL token we mint ourselves, standing in for a tokenized equity. It must be a real mint, really held by the vault, really transferred by the claim instruction. The dashboard and the demo script must both state plainly that this is a devnet stand-in for a tokenized equity.
  - **FORBIDDEN**: any fake addresses or hardcoded simulation accounts. All accounts in `tracked-addresses.json` must be real devnet addresses.
- **Debug Logging Policy**:
  - No temporary debug prints in committed configuration scripts.
- **Definition of Done**:
  - Phase 0 is done when all three wallets are funded on devnet, the DBC program is verified executable on devnet, the dividend SPL mint is created with supply on devnet, and all addresses are committed in `tracked-addresses.json` with a clean git status.
- **Rollback Policy**:
  - On an unrecoverable verify failure, revert changes back to clean state (`git checkout -- .` or `git reset --hard`) and report BLOCKED.

## External Dependencies
- **Solana Devnet Public RPC**: `https://api.devnet.solana.com` (available).
- **Solana Devnet Faucet**: For funding deployer and holder wallets (rate limits managed by single-pass funding).
- **Meteora DBC Devnet Deployment**: Program ID `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN` (verified available).
