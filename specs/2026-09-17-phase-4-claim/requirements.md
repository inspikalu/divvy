# Requirements: Phase 4 — Claim

## Scope

- **In**:
  - `ClaimRecord` account PDA structure in `programs/divvy/src/state.rs` storing claimant holder pubkey, base token mint, cumulative claimed dividend amount, last claim timestamp, `last_claimed_index` (`u128`), and bump seed.
  - Cumulative Dividend Index & Pro-rata calculation unit tests in `programs/divvy/src/math.rs` verifying continuous multi-claim arithmetic.
  - `claim` Anchor instruction in `programs/divvy/src/instructions/claim.rs`:
    - Validates holder has a positive base token balance.
    - Computes claimable amount using the global `cumulative_dividend_per_token` index (`(holder_balance * (global_index - last_claimed_index)) / 10^12`).
    - Uses `init_if_needed` on `ClaimRecord` PDA (`seeds = [b"claim", config.base_mint.as_ref(), holder.key().as_ref()]`), enabling continuous, multi-time claims as new fees accrue.
    - Executes CPI `spl_token::transfer` from `DividendVault` PDA to holder's dividend-asset ATA using `vault_authority` PDA signer seeds (`seeds = [b"vault_authority", config.base_mint.as_ref(), &[config.vault_bump]]`).
    - Increments `config.total_claimed_dividends` and updates `claim_record.last_claimed_index`.
    - Emits permanent on-chain `msg!()` audit log for explorer visibility.
  - TypeScript integration test suite (`tests/divvy-claim.ts`) with continuous multi-claim support.
  - Program upgrade on Solana devnet to deploy the binary containing `claim`.
  - `scripts/claim-dividend.ts`: executes on-chain claim for Holder A and Holder B.
  - `scripts/verify-claims.ts`: verifies on-chain claim records, distinct proportional amounts, and continuous claim behavior.
  - Recording claim transaction signatures and claim amounts in `tracked-addresses.json`.

- **Out**:
  - Next.js frontend UI / wallet connection dashboard (deferred to Phase 5).
  - Automated hold duration / loyalty multiplier (SG-1 stretch goal, deferred post-merge gate).
  - Multi-asset dividend baskets (explicitly rejected).
  - Push-based distributions (pull-based claim only per mission.md).

## Key Decisions

- **Cumulative Dividend Index (DeFi Continuous Yield Pattern)**: Instead of a one-off single claim receipt, the protocol implements a scaled global dividend index (`cumulative_dividend_per_token: u128` with $10^{12}$ precision) on `DivvyConfig`. Every fee routing increments this index. When a holder claims, the contract computes yield based on `global_index - claim_record.last_claimed_index`, updates `last_claimed_index`, and transfers the exact newly accrued dividend tokens. This enables holders to claim an arbitrary number of times as new DBC trading fees accumulate.
- **`init_if_needed` ClaimRecord PDA**: Each holder's claim state is tracked by an on-chain `ClaimRecord` PDA derived with seeds `[b"claim", config.base_mint.as_ref(), holder.key().as_ref()]`. With `init_if_needed`, the first claim creates the account while subsequent claims update the existing record cleanly.
- **PDA Signer Seeds for Vault Transfer**: The `DividendVault` token account is owned by the `vault_authority` PDA (`seeds = [b"vault_authority", base_mint]`). When paying dividends out, the program uses `CpiContext::new_with_signer` passing `&[&[b"vault_authority", config.base_mint.as_ref(), &[config.vault_bump]]]` to authorize the SPL token transfer.
- **Eligible Circulating Supply Denominator**: The index increments use the circulating supply held by buyers/holders outside the DBC reserve (`~65.13M` base tokens across Holder A and Holder B) as the eligible supply denominator. This ensures 100% of routed dividends in the vault are fully distributed to active token holders.
- **Pull-Based Claims**: Per `mission.md`, Divvy uses pull-based claims rather than push distributions. Holders initiate their own transaction to claim their share, minimizing on-chain compute and eliminating state iteration gas limits.

## Context from mission.md

- **US-4 (Holder, claim)**: As a holder, I want to claim my pro-rata share of the vault in a single transaction, so that I actually receive the dividend rather than just reading about it.
- **RD-1**: Complete end-to-end `fee → vault → claim` flow: fees land in vault (Phase 3), holder claims from vault (Phase 4).
- **US-5 (Anyone, verify)**: Every claim paid is visible as an on-chain transaction openable in Solana Explorer.
- **RD-5**: Demo step 5: "switch to holder wallet → claim → show on-chain proof".

## Context from tech-stack.md

- **Anchor**: `0.32.1` (Rust crate) / `@coral-xyz/anchor@0.31.0` (TS client).
- **`@solana/spl-token`**: `0.4.13` — ATA creation and token balance inspections.
- **`@solana/web3.js`**: `1.95.8` (overridden).
- **Helius devnet RPC**: Used for devnet writes and account queries.
- **Known Issues**: None additional for SPL token transfers.

## User Stories Addressed

- **US-4 (Holder, claim)**: Primary user story delivered in this phase.
- **RD-1**: Closes the full `fee → vault → claim` lifecycle.
- **US-5 (Anyone, verify)**: On-chain explorer proofs for all claim transactions.

## Engineering Standards (carried from specs/engineering-standards.md)

- **Mocks/Stubs Policy**:
  - **PERMITTED**: the dividend asset is a devnet SPL token standing in for a tokenized equity. It is a real mint, really held by the vault, really transferred by the claim instruction.
  - **FORBIDDEN**: any fake addresses or hardcoded claim amounts. All claim transactions must be real on-chain SPL token transfers.
  - **FORBIDDEN**: `TODO`, `unimplemented!()`, or a silently-returning empty function on any path the demo touches.
- **Debug Logging Policy**:
  - No `console.log`, `println!`, `dbg!`, or equivalent left in committed code.
  - Exception: Anchor `msg!()` in `claim` handler logging the claimant and claimed amount is a deliberate, permanent program log visible on Solana Explorer.
  - Frontend/script `console.error` inside a `catch` block that surfaces a real failure is permitted.
- **Definition of Done**:
  - Phase 4 is done when `cargo test --lib` passes (13 tests), `npx tsx tests/divvy-claim.ts` passes (4 tests), the program is upgraded on devnet, Holder A and Holder B each execute real devnet claims receiving distinct proportional dividend amounts, a duplicate claim attempt fails, and all signatures are recorded in `tracked-addresses.json`.
- **Rollback Policy**:
  - On an unrecoverable Verify failure, revert the failing group's changes back to the last passing group's committed state (`git checkout -- .` or `git reset --hard <last-good-commit>`) and report **BLOCKED against a clean tree**.
  - Commit at every passing group boundary.

## External Dependencies

- **Solana Devnet RPC**: Helius RPC endpoint.
- **Wallets in `keys/`**:
  - Deployer: `keys/deployer.json` (`BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34`)
  - Holder A: `keys/holder-a.json` (`6mnoXCKnXW9Pt99LYYUrSBUnyWbTGfMyn2ZDsXRwdQFm`, holds 22,740,573.927088 base tokens)
  - Holder B: `keys/holder-b.json` (`DcG8Jv9ZszLDwhYsMKFAKeGv7BNfyaYybMGL34o6GM8r`, holds 42,391,249.825397 base tokens)
- **Tracked Addresses (`tracked-addresses.json`)**:
  - `divvyProgramId`: `235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5`
  - `divvyConfigPDA`: `AhWYbZeiyisCxjrgz4yZRf7sPN8Wx5SxgnpaLVwrwBY4`
  - `divvyDividendVaultPDA`: `GjXC4iEAh7tqL7MqhY7cpF7Wvdfpa2LBMEL7anwty3Mw`
  - `divvyVaultAuthorityPDA`: `GhMLTG5273U2gj1gMC7tjYDPdkDfRY4nsTA8HWwEbyr8`
  - `baseMint`: `3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4`
  - `dividendMint`: `A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM`
  - `vaultBalanceAfterRouting`: `1198087` units
