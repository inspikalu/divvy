# Plan: Phase 3 — Fee Routing

## Group 1 — `route_fees` Anchor Instruction (On-Chain)
- [x] `programs/divvy/src/instructions/route_fees.rs`: Implement `RouteFees` context and handler:
  - Accounts: `authority` (signer, must match `config.authority`), `config` (DivvyConfig PDA, mutable), `creator_token_account` (ATA for dividend_mint owned by authority), `dividend_vault` (DividendVault PDA, mutable), `vault_authority` (PDA), `dividend_mint`, `token_program`.
  - Parameter: `amount_in: u64` — the gross fee amount received from DBC (caller-supplied, validated ≤ creator_token_account balance).
  - Logic: compute `vault_share = amount_in * fee_share_bps / 10_000` (u128 intermediate), CPI `spl_token::transfer` of `vault_share` from `creator_token_account` → `dividend_vault`, increment `config.total_routed_dividends += vault_share`.
  - Emit permanent `msg!()`: `"route_fees: routed {} lamports to vault ({}% of {})"`, vault_share, fee_share_bps, amount_in.
- [x] `programs/divvy/src/instructions/mod.rs`: Export `route_fees` module.
- [x] `programs/divvy/src/lib.rs`: Add `route_fees` instruction entry point routing to `handle_route_fees`.
- [x] **Verify**: `anchor build` → GOT: "Finished `release` profile [optimized] target(s) in 13.29s" and `cat target/idl/divvy.json | python3 -c "..."` → GOT: `['initialize_config', 'route_fees']` ✅

## Group 2 — Unit Tests for `route_fees` Math
- [x] `programs/divvy/src/math.rs`: Add unit tests for `calculate_vault_fee_share` covering:
  - 6000 bps of 1_996_812 → expect `1_198_087` (60%).
  - 10000 bps of 1_000_000 → expect `1_000_000` (100%).
  - 1 bps of 1_000_000 → expect `100` (floor, not round).
  - 0 bps → expect error (already guarded by initialize_config bounds, but math function must handle gracefully).
- [x] **Verify**: `cargo test --lib` → GOT: "test result: ok. 11 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s" ✅

## Group 3 — Devnet Program Upgrade
- [x] Run `solana program deploy target/deploy/divvy.so --program-id target/deploy/divvy-keypair.json --keypair keys/deployer.json --url "https://devnet.helius-rpc.com/?api-key=8dabc2e1-a043-4c0a-a675-52273c7ac948"` to upgrade the deployed program to the version containing `route_fees`.
- [x] **Verify**: `solana program show 235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5 --url devnet` → GOT: `Last Deployed In Slot: 499782252` (> 499752879), `Authority: BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34`, `Data Length: 253248 bytes` ✅

## Group 4 — Integration Test for `route_fees` (`tests/`)
- [x] `tests/divvy-routing.ts`: TypeScript integration test suite against a local validator using `npx tsx tests/divvy-routing.ts`:
  - **Test 1 (Happy path)**: initialize config (or reuse existing PDA derivation), mint `amount_in` dividend tokens to creator ATA, call `route_fees(amount_in)`, assert `dividend_vault` balance = `amount_in * 6000 / 10000` and `config.total_routed_dividends` equals same value.
  - **Test 2 (Authority guard)**: call `route_fees` with a non-authority signer → expect `AnchorError: A has_one constraint was violated` or equivalent anchor constraint error.
  - **Test 3 (Insufficient balance)**: call `route_fees` with `amount_in` exceeding creator_token_account balance → expect token program error (transfer fails).
- [x] **Verify**: `npx tsx tests/divvy-routing.ts` → GOT: "Test Results: 3 passing, 0 failed" ✅

## Group 5 — Fee Claim Script (DBC → Creator Wallet)
- [x] `scripts/claim-dbc-fees.ts`: Script to claim accrued DBC creator trading fees into the deployer's dividend-mint token account:
  - Load pool state from `tracked-addresses.json` (`poolAddress`, `configAddress`, `deployerTokenAccount`).
  - Call `sdk.claimCreatorTradingFeeToReceiver({ creator, payer, pool, maxBaseAmount: new BN(0), maxQuoteAmount: new BN(u64_max), receiver: deployerTokenAccount })`.
  - Sign and send transaction with Helius RPC.
  - After confirmation, read the deployer token account balance (via `getAccount`) and print it.
  - Write `dbcFeeClaimSignature`, `dbcFeeClaimExplorerUrl`, and `dbcFeeClaimQuoteAmount` to `tracked-addresses.json`.
- [x] Execute: `npx tsx scripts/claim-dbc-fees.ts` → Signature: `5Ao2BwpEESEPYQK3cGqgKrNU1iZWkb3M5ZrrNSt1hhrxePCroN5P9c29zYhuifVDi4HY959RyJ9Wft4ovW5FYEAk`
- [x] **Verify**: `spl-token balance A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM --owner BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34 --url devnet` → GOT: "990000" (> 0) ✅

## Group 6 — Fee Routing Script (Creator Wallet → DividendVault)
- [ ] `scripts/route-fees.ts`: Script to call the `route_fees` Anchor instruction on devnet:
  - Load all addresses from `tracked-addresses.json`.
  - Read the deployer's current dividend-mint token account balance to determine `amount_in`.
  - Call `program.methods.routeFees(new BN(amount_in)).accounts({ authority, config, creatorTokenAccount, dividendVault, vaultAuthority, dividendMint, tokenProgram }).signers([deployerKeypair]).rpc()`.
  - After confirmation, read the `dividend_vault` token account balance and print it.
  - Write `routeFeesSignature`, `routeFeesExplorerUrl`, `vaultBalanceAfterRouting` to `tracked-addresses.json`.
- [ ] Execute: `npx tsx scripts/route-fees.ts`.
- [ ] **Verify**: `spl-token balance A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM --owner GhMLTG5273U2gj1gMC7tjYDPdkDfRY4nsTA8HWwEbyr8 --url devnet` → expect a value **greater than 0**, confirming the vault balance increased.

## Group 7 — Phase 3 Commit & Checkpoint
- [ ] Stage all Phase 3 files: `programs/divvy/src/instructions/route_fees.rs`, updated `mod.rs`, `lib.rs`, `math.rs`, `tests/divvy-routing.ts`, `scripts/claim-dbc-fees.ts`, `scripts/route-fees.ts`, `tracked-addresses.json`, spec files.
- [ ] Verify `git status` shows no keypair or `.env` files staged.
- [ ] Commit: `feat(phase-3): implement route_fees instruction and wire dbc fee claim into dividend vault`.
- [ ] **Verify**: `git log -1 --pretty=format:"%s"` → expect exactly `feat(phase-3): implement route_fees instruction and wire dbc fee claim into dividend vault`.
