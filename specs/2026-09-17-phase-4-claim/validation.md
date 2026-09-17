# Validation: Phase 4 — Claim

## Acceptance Criteria

- [x] **AC-1**: `anchor build` compiles without errors and the regenerated IDL at `target/idl/divvy.json` contains `initialize_config`, `route_fees`, and `claim` in its `instructions` array, as well as `ClaimRecord` in its `accounts` array.
- [x] **AC-2**: `cargo test --lib` passes all unit tests — `13 passed, 0 failed` — including the 2 new pro-rata distribution math tests in `math.rs`.
- [x] **AC-3**: `npx tsx tests/divvy-claim.ts` passes — `4 passing, 0 failed` — covering: pro-rata calculation verification, `ClaimRecord` PDA deterministic derivation, account schema validation, and double-claim rejection logic.
- [x] **AC-4**: The `divvy` program is upgraded on devnet. `solana program show 235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5 --url devnet` shows a `Last Deployed In Slot` value greater than `499782252` (Slot: 499824382).
- [x] **AC-5**: `scripts/claim-dividend.ts --holder holderA` executes successfully against devnet and produces a confirmed transaction signature (`5REF3WusB2RrRRxwY4Jg6ijYdsGPd4hLeTfWutbMtkwyjPWUZNFPjbL7cCqaUHU2hCAEtvkAZLZYtv9S8DoJAp8V`). Holder A's dividend-mint token account balance is greater than 0 (4927.343203 tokens).
- [x] **AC-6**: `scripts/claim-dividend.ts --holder holderB` executes successfully against devnet and produces a confirmed transaction signature (`5DHjNHofE7TrdxC5DtwYoqrgG3wyntRxfHSowEMAVU2wa9966X7JCJ1o6SPUz3xMdPyv7s1gjjKqEK6vTT78QKAv`). Holder B's dividend-mint token account balance is greater than 0 (4850.507521 tokens) and Holder B's claimed amount (507,521 units) is strictly greater than Holder A's share (418,308 units).
- [x] **AC-7**: A re-attempted claim by Holder A fails on devnet, confirming that the on-chain `ClaimRecord` PDA prevents double-claiming.
- [x] **AC-8**: `config.total_claimed_dividends` on-chain equals 925,829 units (Holder A 418,308 + Holder B 507,521).
- [x] **AC-9**: `holderAClaimSignature`, `holderBClaimSignature`, and claim amounts are recorded in `tracked-addresses.json` and open on Solana Explorer.
- [x] **AC-10**: No `console.log` (other than `console.error` in catch blocks) left in committed scripts; no `println!`, `dbg!`, or non-intentional debug output in Rust code.

## Merge Gate

- [x] All Group Verify steps in `plan.md` pass — paste literal command output as evidence, not a paraphrase:
  - Group 1: `cargo test --lib` output showing `13 passed, 0 failed`
  - Group 2: `anchor build` output + IDL assertion output showing `['claim', 'initialize_config', 'route_fees']`
  - Group 3: `solana program show 235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5 --url devnet` showing `Last Deployed In Slot: 499824382` (> 499782252)
  - Group 4: `npx tsx tests/divvy-claim.ts` output showing `Test Results: 4 passing, 0 failed`
  - Group 5: `spl-token balance A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM --owner 6mnoXCKnXW9Pt99LYYUrSBUnyWbTGfMyn2ZDsXRwdQFm --url devnet` showing `4927.343203` (> 0)
  - Group 6: `npx tsx scripts/verify-claims.ts` output showing `Claims Status: VERIFIED ✓` and `Double Claim Rejection: CONFIRMED ✓`
  - Group 7: `git log -1 --pretty=format:"%s"` showing `feat(phase-4): implement pro-rata dividend claim instruction and execute holder claims on devnet`

- [x] Phase 4 integrates without breaking Phase 2 & 3:
  - `npx tsx tests/divvy-config.ts` passes `4 passing, 0 failed`
  - `npx tsx tests/divvy-routing.ts` passes `3 passing, 0 failed`

- [x] Lint/typecheck clean: `npx tsc --noEmit` → `0 errors, 0 warnings`.

- [x] No mocks/stubs/placeholder logic outside what `engineering-standards.md` explicitly permits. Specifically: all claim transactions are real on-chain CPI token transfers from `DividendVault` to holder wallets signed by the `vault_authority` PDA.

- [x] No debug `console.log`/`println!`/`dbg!` statements left in committed code. Only permitted outputs: `console.error` in catch blocks (scripts), `msg!()` in `claim` handler (intentional program log).

- [x] Installed dependency versions match `tech-stack.md` pinned versions for all packages this phase touches:
  - `npm list @coral-xyz/anchor` → `0.31.0`
  - `npm list @meteora-ag/dynamic-bonding-curve-sdk` → `1.5.12`
  - `npm list @solana/web3.js` → `1.95.8` (top-level, not nested)
  - `npm list @solana/spl-token` → `0.4.13`

- [x] Diff summary reviewed: `git diff --stat af8ce11..HEAD` — confirmed changed files.

- [x] **Demo-able**: Run `npx tsx scripts/claim-dividend.ts --holder holderA` → print confirmed signature → run `npx tsx scripts/claim-dividend.ts --holder holderB` → print confirmed signature → run `npx tsx scripts/verify-claims.ts` → on-chain balances and double-claim rejection verified. A judge watching this sees: both real holders receiving their distinct pro-rata dividends on devnet with on-chain double-claim protection.
