# Validation: Phase 4 — Claim

## Acceptance Criteria

- [ ] **AC-1**: `anchor build` compiles without errors and the regenerated IDL at `target/idl/divvy.json` contains `initialize_config`, `route_fees`, and `claim` in its `instructions` array, as well as `ClaimRecord` in its `accounts` array.
- [ ] **AC-2**: `cargo test --lib` passes all unit tests — `13 passed, 0 failed` — including the 2 new pro-rata distribution math tests in `math.rs`.
- [ ] **AC-3**: `npx tsx tests/divvy-claim.ts` passes — `4 passing, 0 failed` — covering: pro-rata calculation verification, `ClaimRecord` PDA deterministic derivation, account schema validation, and double-claim rejection logic.
- [ ] **AC-4**: The `divvy` program is upgraded on devnet. `solana program show 235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5 --url devnet` shows a `Last Deployed In Slot` value greater than `499782252` (the Phase 3 deploy slot).
- [ ] **AC-5**: `scripts/claim-dividend.ts --holder holderA` executes successfully against devnet and produces a confirmed transaction signature. Holder A's dividend-mint token account balance is greater than 0.
- [ ] **AC-6**: `scripts/claim-dividend.ts --holder holderB` executes successfully against devnet and produces a confirmed transaction signature. Holder B's dividend-mint token account balance is greater than 0 and strictly greater than Holder A's share (reflecting Holder B's larger ~42.39M token balance vs Holder A's ~22.74M token balance).
- [ ] **AC-7**: A re-attempted claim by Holder A fails on devnet, confirming that the on-chain `ClaimRecord` PDA prevents double-claiming.
- [ ] **AC-8**: `config.total_claimed_dividends` on-chain equals the sum of Holder A and Holder B claims.
- [ ] **AC-9**: `holderAClaimSignature`, `holderBClaimSignature`, and claim amounts are recorded in `tracked-addresses.json` and open on Solana Explorer.
- [ ] **AC-10**: No `console.log` (other than `console.error` in catch blocks) left in committed scripts; no `println!`, `dbg!`, or non-intentional debug output in Rust code.

## Merge Gate

- [ ] All Group Verify steps in `plan.md` pass — paste literal command output as evidence, not a paraphrase:
  - Group 1: `cargo test --lib` output showing `13 passed, 0 failed`
  - Group 2: `anchor build` output + IDL assertion output showing `['initialize_config', 'route_fees', 'claim']`
  - Group 3: `solana program show 235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5 --url devnet` showing slot > 499782252
  - Group 4: `npx tsx tests/divvy-claim.ts` output showing `4 passing, 0 failed`
  - Group 5: `spl-token balance A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM --owner 6mnoXCKnXW9Pt99LYYUrSBUnyWbTGfMyn2ZDsXRwdQFm --url devnet` showing > 0
  - Group 6: `npx tsx scripts/verify-claims.ts` output showing `Claims Status: VERIFIED ✓` and `Double Claim Rejection: CONFIRMED ✓`
  - Group 7: `git log -1 --pretty=format:"%s"` showing exact commit message

- [ ] Phase 4 integrates without breaking Phase 2 & 3:
  - `npx tsx tests/divvy-config.ts` passes `4 passing, 0 failed`
  - `npx tsx tests/divvy-routing.ts` passes `3 passing, 0 failed`

- [ ] Lint/typecheck clean: `npx tsc --noEmit` → `0 errors, 0 warnings`.

- [ ] No mocks/stubs/placeholder logic outside what `engineering-standards.md` explicitly permits. Specifically: all claim transactions are real on-chain CPI token transfers from `DividendVault` to holder wallets signed by the `vault_authority` PDA.

- [ ] No debug `console.log`/`println!`/`dbg!` statements left in committed code. Only permitted outputs: `console.error` in catch blocks (scripts), `msg!()` in `claim` handler (intentional program log).

- [ ] Installed dependency versions match `tech-stack.md` pinned versions for all packages this phase touches:
  - `npm list @coral-xyz/anchor` → expect `0.31.0`
  - `npm list @meteora-ag/dynamic-bonding-curve-sdk` → expect `1.5.12`
  - `npm list @solana/web3.js` → expect `1.95.8` (top-level, not nested)
  - `npm list @solana/spl-token` → expect `0.4.13`

- [ ] Diff summary reviewed: `git diff --stat af8ce11..HEAD` — confirm changed files are limited to:
  - `programs/divvy/src/state.rs` (updated)
  - `programs/divvy/src/math.rs` (updated)
  - `programs/divvy/src/instructions/claim.rs` (new)
  - `programs/divvy/src/instructions/mod.rs` (updated)
  - `programs/divvy/src/lib.rs` (updated)
  - `tests/divvy-claim.ts` (new)
  - `scripts/claim-dividend.ts` (new)
  - `scripts/verify-claims.ts` (new)
  - `tracked-addresses.json` (updated)
  - `specs/2026-09-17-phase-4-claim/` (new directory)

- [ ] **Demo-able**: Run `npx tsx scripts/claim-dividend.ts --holder holderA` → print confirmed signature → run `npx tsx scripts/claim-dividend.ts --holder holderB` → print confirmed signature → run `npx tsx scripts/verify-claims.ts` → on-chain balances and double-claim rejection verified. A judge watching this sees: both real holders receiving their distinct pro-rata dividends on devnet with on-chain double-claim protection.
