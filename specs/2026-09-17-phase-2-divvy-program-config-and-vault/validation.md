# Validation: Phase 2 — Divvy Program: Config & Vault

## Acceptance Criteria
- [ ] **Anchor Program Scaffolded & Compiled**: `divvy` Anchor program compiles cleanly with `anchor build`.
- [ ] **Core Math Verified**: Fee-share calculation unit tests pass with `cargo test --lib` (0 failures).
- [ ] **Integration Tests Pass**: TypeScript integration test suite (`tests/divvy-config.ts`) passes with `4 passing, 0 failed`.
- [ ] **Program Deployed to Devnet**: The `divvy` program is deployed to Solana devnet and confirmed executable via `solana program show`.
- [ ] **Config & Vault PDA Initialized**: On-chain `DivvyConfig` PDA and `DividendVault` SPL token account are initialized on devnet pairing base mint `3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4` and dividend mint `A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM` with 60% fee share.
- [ ] **Addresses Tracked**: `tracked-addresses.json` is updated with `divvyProgramId`, `configPda`, `vaultPda`, and `vaultTokenAccount`.

## Merge Gate
- [ ] All Group verifies in `plan.md` pass (with pasted evidence, not paraphrase).
- [ ] Phase integrates without breaking Phase 0 or Phase 1 setup (DBC pool, wallets, and dividend mint intact).
- [ ] TypeScript typecheck clean — run `npx tsc --noEmit` (expect clean exit code 0).
- [ ] Rust formatting / linting clean — run `cargo check` inside program workspace.
- [ ] No mocks/stubs/placeholder logic outside what `engineering-standards.md` explicitly permits.
- [ ] No debug `console.log` / `println!` statements left in committed code (intentional `msg!()` program logs only).
- [ ] Installed dependency versions match `tech-stack.md`'s pinned versions:
  - Run: `anchor --version` (expect `anchor-cli 0.32.1`)
  - Run: `npm list @coral-xyz/anchor` (expect `0.31.0`)
  - Run: `npm list @solana/web3.js` (expect `1.95.8`)
- [ ] Diff summary reviewed:
  - Run: `git log -1 --stat`
  - Confirm the changed-file list matches what is claimed in the execution report.
- [ ] Demo-able: The deployed Divvy program ID and initialized `DivvyConfig` / `DividendVault` accounts open directly on Solana Explorer (`https://explorer.solana.com/?cluster=devnet`).
