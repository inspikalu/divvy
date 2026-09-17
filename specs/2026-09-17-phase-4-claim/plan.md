# Plan: Phase 4 — Claim

## Group 1 — `ClaimRecord` State Definition & Pro-Rata Math Tests
- [x] `programs/divvy/src/state.rs`: Define `ClaimRecord` account struct:
  - Fields: `holder: Pubkey`, `base_mint: Pubkey`, `claimed_amount: u64`, `claimed_at: i64`, `bump: u8`.
  - Add `SEED_PREFIX = b"claim"`.
  - Derive `#[derive(InitSpace)]`.
- [x] `programs/divvy/src/math.rs`: Add 2 unit tests for `calculate_pro_rata_share` covering:
  - Real holder distribution ratios (Holder A ~34.91% of 65.13M supply, Holder B ~65.09% of 65.13M supply against 1,198,087 vault balance).
  - Rounding & precision guarantees with remainder preservation.
- [x] **Verify**: `cargo test --lib` → GOT: "test result: ok. 13 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.02s" ✅

## Group 2 — `claim` Anchor Instruction (On-Chain)
- [x] `programs/divvy/src/instructions/claim.rs`: Implement `Claim` context and handler:
  - Accounts:
    - `holder`: Signer (claimant).
    - `config`: `Account<'info, DivvyConfig>` (mut, checks `base_mint`).
    - `holder_base_token_account`: `Account<'info, TokenAccount>` (checks `mint = config.base_mint`, `owner = holder.key()`).
    - `holder_dividend_token_account`: `Account<'info, TokenAccount>` (mut, checks `mint = config.dividend_mint`, `owner = holder.key()`).
    - `dividend_vault`: `Account<'info, TokenAccount>` (mut, seeds = `[b"vault", config.base_mint.as_ref()]`, `token::mint = config.dividend_mint`, `token::authority = vault_authority`).
    - `vault_authority`: `UncheckedAccount<'info>` (seeds = `[b"vault_authority", config.base_mint.as_ref()]`, bump = config.vault_bump).
    - `claim_record`: `Account<'info, ClaimRecord>` (init, payer = holder, space = 8 + ClaimRecord::INIT_SPACE, seeds = `[b"claim", config.base_mint.as_ref(), holder.key().as_ref()]`, bump).
    - `token_program`: SPL Token program.
    - `system_program`: System program.
  - Parameter: `eligible_supply: u64` (total circulating supply held by eligible holders).
  - Handler logic:
    - Read `holder_balance = holder_base_token_account.amount`.
    - Require `holder_balance > 0`, error `NoEligibleBalance`.
    - Compute `claim_amount = calculate_pro_rata_share(dividend_vault.amount, holder_balance, eligible_supply)`.
    - Require `claim_amount > 0`, error `ZeroClaimAmount`.
    - CPI `token::transfer` of `claim_amount` from `dividend_vault` to `holder_dividend_token_account` using PDA signer seeds: `&[b"vault_authority", config.base_mint.as_ref(), &[config.vault_bump]]`.
    - Populate `claim_record`: `holder`, `base_mint`, `claimed_amount`, `claimed_at = Clock::get()?.unix_timestamp`, `bump`.
    - Increment `config.total_claimed_dividends += claim_amount`.
    - Emit permanent log `msg!("claim: holder {} claimed {} dividend units", holder, claim_amount)`.
- [x] `programs/divvy/src/instructions/mod.rs`: Export `claim` module.
- [x] `programs/divvy/src/lib.rs`: Add `claim` instruction entry point routing to `handle_claim`.
- [x] **Verify**: `anchor build` → GOT: "Finished `release` profile [optimized] target(s) in 8.05s" and `cat target/idl/divvy.json | python3 -c "..."` → GOT: `['claim', 'initialize_config', 'route_fees']` ✅

## Group 3 — Devnet Program Upgrade
- [x] Run `solana program deploy target/deploy/divvy.so --program-id target/deploy/divvy-keypair.json --keypair keys/deployer.json --url "https://devnet.helius-rpc.com/?api-key=8dabc2e1-a043-4c0a-a675-52273c7ac948"` to upgrade the deployed program to the binary containing `claim`.
- [x] **Verify**: `solana program show 235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5 --url devnet` → GOT: `Last Deployed In Slot: 499824382` (> 499782252), `Authority: BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34`, `Data Length: 276264 bytes` ✅

## Group 4 — Integration Test Suite for `claim` (`tests/`)
- [x] `tests/divvy-claim.ts`: TypeScript integration test suite using `npx tsx tests/divvy-claim.ts`:
  - **Test 1 (Pro-rata calculation)**: verify pro-rata calculation matches on-chain arithmetic for Holder A and Holder B proportions.
  - **Test 2 (ClaimRecord PDA seed derivation)**: verify deterministic PDA derivation for `[b"claim", base_mint, holder]`.
  - **Test 3 (Account & IDL schema check)**: verify all 9 accounts and parameters in `claim` instruction match IDL schema.
  - **Test 4 (Double-claim prevention logic)**: verify PDA init constraint ensures re-claiming with an existing `ClaimRecord` is rejected.
- [x] **Verify**: `npx tsx tests/divvy-claim.ts` → GOT: "Test Results: 4 passing, 0 failed" ✅

## Group 5 — Holder A Devnet Claim Execution
- [x] `scripts/claim-dividend.ts`: Script to execute `claim` on devnet for a given holder keypair:
  - Takes `--holder` argument (`holderA` or `holderB`).
  - Reads `eligible_supply` (sum of Holder A and Holder B base token balances: `65,131,823.752485` base tokens = `65131823752485` atomic units).
  - Creates holder's dividend-mint ATA if needed.
  - Sends `claim` instruction to devnet via Helius RPC.
  - Prints confirmed transaction signature and claimed amount.
  - Updates `tracked-addresses.json` with `holderAClaimSignature`, `holderAClaimAmount`, `holderAClaimExplorerUrl`.
- [x] Execute: `npx tsx scripts/claim-dividend.ts --holder holderA` → Signature: `5REF3WusB2RrRRxwY4Jg6ijYdsGPd4hLeTfWutbMtkwyjPWUZNFPjbL7cCqaUHU2hCAEtvkAZLZYtv9S8DoJAp8V`, Claimed: `418308` units
- [x] **Verify**: `spl-token balance A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM --owner 6mnoXCKnXW9Pt99LYYUrSBUnyWbTGfMyn2ZDsXRwdQFm --url devnet` → GOT: "4927.343203" (> 0) ✅

## Group 6 — Holder B Devnet Claim Execution & Double-Claim Verification
- [ ] Execute `npx tsx scripts/claim-dividend.ts --holder holderB` on devnet.
- [ ] `scripts/verify-claims.ts`: Verification script that queries devnet RPC to:
  - Verify Holder A's `ClaimRecord` PDA exists with on-chain `claimed_amount > 0`.
  - Verify Holder B's `ClaimRecord` PDA exists with on-chain `claimed_amount > 0`.
  - Verify Holder B's claimed amount is strictly greater than Holder A's (proportional to their 42.39M vs 22.74M base token holdings).
  - Attempt a duplicate claim from Holder A and assert it fails with PDA initialization collision / duplicate account error.
  - Print on-chain summary and explorer links.
- [ ] Execute: `npx tsx scripts/verify-claims.ts`.
- [ ] **Verify**: `npx tsx scripts/verify-claims.ts` → expect output ending with `"Claims Status: VERIFIED ✓"` and `"Double Claim Rejection: CONFIRMED ✓"`.

## Group 7 — Phase 4 Commit & Checkpoint
- [ ] Stage all Phase 4 files: `programs/divvy/src/state.rs`, `programs/divvy/src/math.rs`, `programs/divvy/src/instructions/claim.rs`, `programs/divvy/src/instructions/mod.rs`, `programs/divvy/src/lib.rs`, `tests/divvy-claim.ts`, `scripts/claim-dividend.ts`, `scripts/verify-claims.ts`, `tracked-addresses.json`, spec files.
- [ ] Verify `git status` shows no keypair or `.env` files staged.
- [ ] Commit: `feat(phase-4): implement pro-rata dividend claim instruction and execute holder claims on devnet`.
- [ ] **Verify**: `git log -1 --pretty=format:"%s"` → expect exactly `feat(phase-4): implement pro-rata dividend claim instruction and execute holder claims on devnet`.
