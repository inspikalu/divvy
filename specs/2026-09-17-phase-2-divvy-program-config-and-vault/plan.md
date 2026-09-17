# Plan: Phase 2 — Divvy Program: Config & Vault

## Group 1 — Anchor Workspace Scaffolding & Configuration
- [x] `Anchor.toml`: Initialize Anchor workspace configuration targeting devnet cluster with deployer wallet keypair (`keys/deployer.json`).
- [x] `Cargo.toml` & `programs/divvy/Cargo.toml`: Configure workspace and program dependencies using Anchor `0.32.1`, `anchor-spl`, and `solana-program`.
- [x] `programs/divvy/src/lib.rs`: Scaffold basic Anchor program entrypoint and declare initial program ID keypair.
- [x] **Verify**: `anchor build` → GOT: "Finished `test` profile [unoptimized + debuginfo] target(s)... target/deploy/divvy.so target/idl/divvy.json" ✅

## Group 2 — State Account Definitions & Mathematical Core
- [x] `programs/divvy/src/state.rs`: Define `DivvyConfig` account struct storing `authority`, `base_mint`, `dividend_mint`, `fee_share_bps`, `total_routed_dividends`, `total_claimed_dividends`, `bump`, and `vault_bump`.
- [x] `programs/divvy/src/math.rs`: Implement pure functions for fee-share calculations with strict overflow protection and unit test coverage.
- [x] **Verify**: `cargo test --lib` → GOT: "test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s" ✅

## Group 3 — `initialize_config` Instruction & Vault PDA Account Creation
- [x] `programs/divvy/src/instructions/initialize_config.rs`: Implement `InitializeConfig` context and instruction logic:
  - Validate authority signer and fee-share bounds (1..=10,000 bps).
  - Initialize `DivvyConfig` PDA with seeds `[b"config", base_mint.key().as_ref()]`.
  - Initialize `DividendVault` SPL token account PDA with seeds `[b"vault", base_mint.key().as_ref()]` owned by the program vault PDA.
- [x] `programs/divvy/src/instructions/mod.rs` & `programs/divvy/src/lib.rs`: Export and route `initialize_config` handler.
- [x] **Verify**: `anchor build` → GOT: "Finished `release` profile [optimized] target(s)... target/idl/divvy.json generated" ✅

## Group 4 — Anchor Integration Tests
- [x] `tests/divvy-config.ts`: Implement TypeScript test suite for `initialize_config`:
  - Test successful config initialization and verify on-chain state matches expected values.
  - Test fee-share boundary validation (rejecting values > 10,000 bps).
  - Test vault token account ownership and zero initial balance.
- [x] **Verify**: `npx tsx tests/divvy-config.ts` → GOT: "Test Results: 4 passing, 0 failed" ✅

## Group 5 — Devnet Program Deployment
- [ ] Build release binary with `anchor build`.
- [ ] Deploy the `divvy` program to Solana devnet using `keys/deployer.json`.
- [ ] Sync the deployed program ID in `Anchor.toml`, `programs/divvy/src/lib.rs`, and record in `tracked-addresses.json` under `divvyProgramId`.
- [ ] **Verify**: `solana program show $(jq -r .divvyProgramId tracked-addresses.json) --url devnet` → expect `ProgramData Address` and `Authority: BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34`.

## Group 6 — Devnet Initialization Script & On-Chain Verification
- [ ] `scripts/initialize-divvy-config.ts`: Implement script to execute `initialize_config` on devnet pairing the Phase 1 meme token (`3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4`) and dividend quote token (`A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM`) with 60% (6000 bps) fee share.
- [ ] `scripts/verify-divvy-config.ts`: Implement verification script to query devnet RPC and inspect `DivvyConfig` and `DividendVault` accounts.
- [ ] Execute `npx tsx scripts/initialize-divvy-config.ts`.
- [ ] **Verify**: `npx tsx scripts/verify-divvy-config.ts` → expect `Config Status: INITIALIZED` and `Vault Balance: 0`.

## Group 7 — Phase 2 Commit & Checkpoint
- [ ] Stage all Phase 2 files (`programs/`, `tests/`, `scripts/`, `Anchor.toml`, `Cargo.toml`, `Cargo.lock`, `tracked-addresses.json`, and specs).
- [ ] Verify `git status` shows no private keys or secret files staged.
- [ ] Commit Phase 2 state: `feat(phase-2): implement and deploy divvy config and dividend vault pda on devnet`.
- [ ] **Verify**: `git log -1 --pretty=format:"%s"` → expect `feat(phase-2): implement and deploy divvy config and dividend vault pda on devnet`.
