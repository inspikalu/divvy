# Requirements: Phase 2 — Divvy Program: Config & Vault

## Scope
- **In**:
  - Scaffolding the Anchor workspace for the `divvy` on-chain program using Anchor `0.32.1`.
  - Defining the on-chain state structure (`DivvyConfig`) for storing creator authority, base token mint, dividend quote mint, fee share basis points, total routed dividends, and bump seeds.
  - Implementing mathematical helper functions for fee-share calculation with overflow checks and unit test coverage.
  - Implementing the `initialize_config` instruction handler to create the `DivvyConfig` PDA and initialize the program-owned `DividendVault` SPL token account PDA.
  - Integration testing with TypeScript/Anchor verifying config initialization, parameter boundary validation, and vault token account ownership.
  - Compiling and deploying the `divvy` program to Solana devnet.
  - Initializing the Divvy configuration on devnet for our Phase 1 meme token (`3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4`) and dividend quote token (`A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM`).
  - Storing program IDs, PDAs, and initialization transaction signatures in `tracked-addresses.json`.
- **Out**:
  - Fee routing execution and DBC fee claiming (deferred to Phase 3).
  - Pro-rata claim calculation and claim instruction (deferred to Phase 4).
  - Frontend dashboard and wallet connection UI (deferred to Phase 5).
  - Multi-asset dividend baskets or Token-2022 transfer hooks (ruled out).

## Key Decisions
- **PDA-Derived Program State**: `DivvyConfig` PDA is derived with seeds `[b"config", base_mint.key().as_ref()]`, allowing one unique config per meme token.
- **Program-Owned Dividend Vault**: The vault SPL token account is derived with seeds `[b"vault", base_mint.key().as_ref()]`, holding the dividend quote tokens. It is owned by the program's PDA authority, ensuring only program instructions (claim/route) can transfer funds out.
- **Configurable Fee Share (in BPS)**: Fee share is stored as basis points (`u16`, 1 to 10,000 bps) with 6,000 bps (60%) matching the Phase 1 curve design.
- **Anchor 0.32.1 & Rust 1.94 Toolchain**: Leveraging the pre-installed Anchor CLI `0.32.1` and Rust stable toolchain on Linux.

## Context from mission.md
- **US-1 (Creator, enable)**: As a token creator, I want to enable Divvy on my DBC token and set what share of trading fees goes to the Dividend Vault, so that my holders have a reason to keep holding after launch.
- **RD-1 Prerequisite**: Program-owned vault PDA that safely custody dividend assets for holder claims.
- **US-5 (Anyone, verify)**: Config and vault addresses are public PDAs that can be inspected directly on Solana Explorer.

## Context from tech-stack.md
- **Anchor Framework**: Pinned at `0.32.1`.
- **Solana Web3 / SPL Token**: `@solana/web3.js@1.95.8`, `@solana/spl-token@0.4.13`, `@coral-xyz/anchor@0.31.0`.
- **Known Issues**:
  - [2026-09-16] Phase 1/Group 3: `@meteora-ag/dynamic-bonding-curve-sdk@1.5.12` — `TokenDecimal` enum uses uppercase keys (`SIX`, `SEVEN`, `EIGHT`, `NINE`), not camelCase (`Six`, `Seven`). In `buildCurve`, `poolCreationFee` is denominated in SOL (not lamports); passing `0.001` converts to `1_000_000` lamports (`MIN_POOL_CREATION_FEE`). Passing `0` causes `DecimalError` in `convertToLamports`. When using `BaseFeeMode.FeeSchedulerLinear` with a flat fee schedule, `numberOfPeriod` and `totalDuration` must BOTH be 0, otherwise the SDK throws a validation error.

## User Stories Addressed
- **US-1 (Creator, enable)**: Creators initialize their token's dividend config and vault.
- **RD-1 Prerequisite**: Vault setup for fee routing and claims.
- **US-5 (Anyone, verify)**: Verifiable on-chain program deployment and config state.

## Engineering Standards (carried from specs/engineering-standards.md)
- **Mocks/Stubs Policy**:
  - **PERMITTED**: the dividend asset may be a devnet SPL token we mint ourselves, standing in for a tokenized equity. It must be a real mint, really held by the vault, really transferred by the claim instruction. The dashboard and the demo script must both state plainly that this is a devnet stand-in for a tokenized equity.
  - **PERMITTED**: seeding trading activity with our own wallets to generate fees. The swaps must be real swaps producing real fees — we are staging the *activity*, not faking the *fees*.
  - **FORBIDDEN**: any fake addresses or hardcoded simulation accounts. All accounts in `tracked-addresses.json` must be real devnet addresses.
  - **FORBIDDEN**: `TODO`, `unimplemented!()`, or a silently-returning empty function on any path the demo touches.
- **Debug Logging Policy**:
  - No `console.log`, `println!`, `dbg!`, or equivalent left in committed code.
  - Exception: Anchor `msg!()` calls that are deliberate, permanent program logs — e.g. logging a routed fee amount or a config initialization. These are a feature (they show up in the explorer during the demo). They must be intentional and named as such in the spec, not leftovers.
- **Definition of Done**:
  - Phase 2 is done when the `divvy` Anchor program is compiled, tested with unit and integration tests (`cargo test --lib` and Anchor tests passing), deployed to Solana devnet, and the `DivvyConfig` and `DividendVault` accounts are initialized and verified on-chain.
- **Rollback Policy**:
  - On an unrecoverable Verify failure, the executor reverts the failing group's changes back to the last passing group's committed state (`git checkout -- .`, or `git reset --hard <last-good-commit>`) and reports **BLOCKED against a clean tree**.

## External Dependencies
- **Solana Devnet RPC**: `https://api.devnet.solana.com`.
- **Deployer Keypair**: `keys/deployer.json` with devnet SOL balance for program deployment and transaction fees.
- **Tracked Addresses**: Phase 0 dividend mint (`A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM`) and Phase 1 base meme mint (`3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4`).
