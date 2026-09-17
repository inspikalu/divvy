# Requirements: Phase 1 — Launch a Token on a Deliberate DBC Config

## Scope
- **In**:
  - Setting up the TypeScript scripting environment with pinned `@meteora-ag/dynamic-bonding-curve-sdk@1.5.12`.
  - Documenting the curve design and fee schedule rationale in `specs/curve-design.md` for a stock-paired quote asset.
  - Creating a base meme SPL token mint on devnet (`keys/deployer.json`).
  - Deploying a Meteora Dynamic Bonding Curve pool on Solana devnet pairing the base meme mint with the Phase 0 dividend quote asset mint.
  - Seeding holder wallets with quote tokens to participate in swaps.
  - Executing real devnet buy and sell swaps against the bonding curve from `keys/holder-a.json` and `keys/holder-b.json`.
  - Auditing and verifying on-chain that real trading fees accrue in the pool's fee accounts.
  - Storing all created pool addresses, transaction signatures, and explorer links in `tracked-addresses.json`.
- **Out**:
  - Divvy Anchor Program vault creation and routing logic (deferred to Phase 2 & Phase 3).
  - Pro-rata claim instruction (deferred to Phase 4).
  - Frontend UI dashboard (deferred to Phase 5).
  - Mainnet deployments or mock simulations.

## Key Decisions
- **Deliberate DBC Curve Architecture**: The bonding curve is explicitly configured with a non-default curve shape and fee schedule suited for stock-paired meme tokens, satisfying bounty requirement RD-2.
- **Quote Asset Pairing**: The pool uses our Phase 0 SPL mint (`A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM`, standing in for tokenized equity) as quote asset, rather than raw devnet SOL. This ensures that all trading fees accrue directly in the dividend asset that holders will eventually claim in Divvy's vault.
- **Real Devnet Swaps**: All swap transactions are real, verifiable on-chain transactions submitted by Holder A and Holder B wallets.

## Context from mission.md
- **RD-2**: A deliberate, non-default Meteora DBC configuration: curve shape and fee schedule chosen and justified for a stock-paired quote asset.
- **RD-1 Prerequisite**: Live swaps generating real fees that accumulate in the curve for subsequent vault routing.
- **US-5 (Anyone, verify)**: Every swap and pool creation transaction must be visible on Solana explorer.

## Context from tech-stack.md
- **SDK**: `@meteora-ag/dynamic-bonding-curve-sdk` pinned at `1.5.12`.
- **Solana Web3**: `@solana/web3.js` `1.95.8`.
- **Anchor Client**: `@coral-xyz/anchor` `0.31.0`.
- **Known Issues**: Public devnet RPC may rate-limit; scripts include retry/fallback logic if needed.

## User Stories Addressed
- **RD-2** (Deliberate DBC curve configuration).
- **RD-1 Prerequisite** (Live DBC trading fees generated on-chain).
- **US-5** (Auditable transactions and explorer links).

## Engineering Standards (carried from specs/engineering-standards.md)
- **Mocks/Stubs Policy**:
  - **PERMITTED**: the dividend asset may be a devnet SPL token we mint ourselves, standing in for a tokenized equity. It must be a real mint, really held by the vault, really transferred by the claim instruction. The dashboard and the demo script must both state plainly that this is a devnet stand-in for a tokenized equity.
  - **PERMITTED**: seeding trading activity with our own wallets to generate fees. The swaps must be real swaps producing real fees — we are staging the *activity*, not faking the *fees*.
  - **FORBIDDEN**: any fake addresses or hardcoded simulation accounts. All accounts in `tracked-addresses.json` must be real devnet addresses.
  - **FORBIDDEN**: stubbing the fee-routing or fee-accrual path.
- **Debug Logging Policy**:
  - No leftover temporary debug prints in committed scripts. Meaningful status logs and transaction explorer links are intentional program output.
- **Definition of Done**:
  - Phase 1 is done when a Meteora DBC pool exists on devnet with a justified curve config, real buy/sell swaps have executed from holder wallets, trading fees are observably accrued in the pool on-chain, and all signatures are recorded in `tracked-addresses.json`.
- **Rollback Policy**:
  - On an unrecoverable verify failure, revert changes back to clean state (`git checkout -- .` or `git reset --hard`) and report BLOCKED.

## External Dependencies
- **Solana Devnet RPC**: `https://api.devnet.solana.com`.
- **Meteora DBC Program ID**: `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`.
- **Funded Devnet Wallets**: Deployer (`BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34`), Holder A, Holder B.
