# Requirements: Phase 3 — Fee Routing

## Scope

- **In**:
  - A new `route_fees` Anchor instruction on the `divvy` program: accepts `amount_in: u64` (gross fee amount already received from DBC), computes `fee_share_bps / 10_000 * amount_in` via the existing `calculate_vault_fee_share` helper, CPI-transfers that share from the creator's token account into the `DividendVault` PDA, and increments `config.total_routed_dividends`.
  - Unit tests for the `route_fees` math (4 new cases in `math.rs`).
  - A TypeScript integration test suite (`tests/divvy-routing.ts`) with 3 tests: happy-path routing, authority guard, and insufficient-balance rejection.
  - An on-chain program upgrade on Solana devnet to deploy the updated binary containing `route_fees`.
  - `scripts/claim-dbc-fees.ts`: claims the currently accrued DBC creator trading fees (~1.997M lamports of quote token) into the deployer's token account via `sdk.claimCreatorTradingFeeToReceiver`.
  - `scripts/route-fees.ts`: calls `route_fees` on devnet with the claimed amount, routing 60% of it into the `DividendVault` PDA.
  - Recording both transaction signatures and the final vault balance in `tracked-addresses.json`.

- **Out**:
  - Additional swap generation — Phase 3 routes what Phase 1 already accrued; generating more swaps is deferred (demo has sufficient fee balance).
  - Pro-rata claim calculation or `claim` instruction — deferred to Phase 4.
  - Automated/periodic fee routing trigger — deferred to post-hackathon. Phase 3 is a manually-triggered script.
  - Frontend display of vault balance — deferred to Phase 5.
  - DAMM v2 post-graduation fee continuation — design intent only, not wired.

## Key Decisions

- **Two-step routing, not one-step CPI**: The DBC program sends creator fees to a token account the creator controls. Divvy's `route_fees` instruction then receives an explicit `amount_in` from the caller and CPI-transfers the fee-share percentage into the vault. This avoids cross-program instruction complexity with DBC and is fully auditable: both the DBC claim tx and the Divvy route tx are separately verifiable on explorer.
- **Creator-signed routing**: `route_fees` requires `authority` signer (same pubkey as `config.authority`). This is intentional — only the creator can trigger routing, matching the protocol's permission model. Pull-based routing chosen over push (no backend, no cranks).
- **`amount_in` is caller-supplied, not read from chain**: The creator passes the gross amount they received from DBC. This keeps the instruction simple (no DBC account reads inside the Anchor program) and correct — the CPI transfer will fail if the creator's token account doesn't have `amount_in` tokens, providing implicit validation.
- **u128 intermediate in fee math**: The existing `calculate_vault_fee_share` already uses `u128` for `amount * bps / 10_000` to prevent overflow. No change needed; the same function is reused.
- **Program upgrade, not redeploy**: The program ID stays `235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5`. The `DivvyConfig` PDA initialized in Phase 2 remains valid. Only the program binary is replaced via BPFLoader upgrade.

## Context from mission.md

- **US-2 (Protocol, route)**: As the protocol, I want every relevant trading fee on an enabled token to be routed into that token's Dividend Vault automatically, so that dividend accrual requires no ongoing action from the creator. — Phase 3 delivers the "route" half of this story; the "automatically" aspect is deferred post-hackathon.
- **RD-1 (live fee → vault → claim flow)**: Phase 3 completes the `fee → vault` leg of RD-1. Phase 4 completes `vault → claim`.
- **RD-4 (explorer-verifiable)**: Both the DBC claim transaction and the `route_fees` transaction must produce signatures recorded in `tracked-addresses.json` and openable on Solana Explorer.
- **FORBIDDEN**: stubbing the fee-routing path (e.g. transferring tokens into the vault from a script while DBC fee route is not actually wired). The DBC `claimCreatorTradingFee` call must produce a real transaction; the `route_fees` call must CPI a real token transfer.

## Context from tech-stack.md

- **Anchor**: `0.32.1` (Rust crate) / `@coral-xyz/anchor@0.31.0` (TS client). Program upgrade uses the same deployer keypair and Helius RPC.
- **`@meteora-ag/dynamic-bonding-curve-sdk`**: `1.5.12`. Fee claiming uses `sdk.claimCreatorTradingFeeToReceiver({ creator, payer, pool, maxBaseAmount: new BN(0), maxQuoteAmount: new BN(u64_max_string), receiver })`. The `receiver` param directs fees to an explicit token account, avoiding WSOL wrapping when the quote asset is not SOL.
- **`@solana/web3.js`**: `1.95.8` (pinned via package.json overrides).
- **`@solana/spl-token`**: `0.4.13`.
- **Helius devnet RPC**: `https://devnet.helius-rpc.com/?api-key=<KEY>` — already confirmed working for program deployment. Used for all devnet writes in Phase 3.
- **Known Issues carried forward**:
  - [2026-09-16] Phase 1/Group 3: `@meteora-ag/dynamic-bonding-curve-sdk@1.5.12` — `poolCreationFee` is denominated in SOL (not lamports). When using `BaseFeeMode.FeeSchedulerLinear` with a flat fee schedule, `numberOfPeriod` and `totalDuration` must BOTH be 0. *(Relevant because the scripts in this phase reuse the same SDK instantiation pattern.)*
  - [2026-09-16] Phase 1/Group 3: `@solana/web3.js 1.99.0` was nested inside the Meteora SDK — fixed by `npm overrides: {"@solana/web3.js": "1.95.8"}` and deleting the nested `node_modules`. This fix is already applied; do not re-introduce the nested version.

## User Stories Addressed

- **US-2 (Protocol, route)**: The `route_fees` instruction + scripts deliver the fee-routing leg.
- **RD-1**: Completes the `fee → vault` leg. Combined with Phase 4's `vault → claim`, this closes RD-1.
- **RD-4**: Both transaction signatures are explorer-openable and recorded in `tracked-addresses.json`.

## Engineering Standards (carried from specs/engineering-standards.md)

- **Mocks/Stubs Policy**:
  - **PERMITTED**: the dividend asset is a devnet SPL token standing in for a tokenized equity. It is a real mint, really held by the vault, really transferred by the route instruction.
  - **PERMITTED**: seeding trading activity with our own wallets to generate fees. The accrued fees being routed in this phase were generated by real Phase 1 swaps.
  - **FORBIDDEN**: stubbing the fee-routing path — e.g. transferring tokens into the vault from a script to make the vault look populated while the DBC fee claim is not actually called. The `claimCreatorTradingFeeToReceiver` call must produce a real, confirmed on-chain transaction.
  - **FORBIDDEN**: `TODO`, `unimplemented!()`, or a silently-returning empty function on any path the demo touches.
- **Debug Logging Policy**:
  - No `console.log`, `println!`, `dbg!`, or equivalent left in committed code.
  - Exception: Anchor `msg!()` in `route_fees` logging the routed amount is a **deliberate, permanent program log** — it will appear in the explorer transaction during the demo. Required; do not remove it.
  - Frontend `console.error` inside a `catch` block that surfaces a real failure is permitted. Everything else comes out before commit.
- **Definition of Done**:
  - Phase 3 is done when: `anchor build` compiles with `route_fees` in the IDL; `cargo test --lib` passes all unit tests (11 total); `npx tsx tests/divvy-routing.ts` passes 3 integration tests; the program is upgraded on devnet; `scripts/claim-dbc-fees.ts` produces a confirmed DBC claim transaction; `scripts/route-fees.ts` produces a confirmed `route_fees` transaction; `spl-token balance` of the DividendVault shows a value greater than 0 on devnet.
- **Rollback Policy**:
  - On an unrecoverable Verify failure, revert the failing group's changes back to the last passing group's committed state (`git checkout -- .` or `git reset --hard <last-good-commit>`) and report **BLOCKED against a clean tree**.
  - If a program upgrade in Group 3 produces a deployed binary inconsistent with reverted code, the BLOCKED report must name the deployed program ID (`235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5`) and the last-good deploy slot.
  - Commit at every passing group boundary. An executor that goes three groups without committing has made this policy unusable.

## External Dependencies

- **Solana Devnet**: all transactions sent to devnet.
- **Helius devnet RPC**: `SOLANA_RPC_URL` env var set to `https://devnet.helius-rpc.com/?api-key=<KEY>`. Key already in use from Phase 2. Lives in `.env.local` only — never committed.
- **Deployer Keypair**: `keys/deployer.json` — `BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34`. Must have sufficient devnet SOL for the program upgrade (~1.5 SOL) and script transaction fees.
- **Phase 2 addresses (from `tracked-addresses.json`)**:
  - `divvyProgramId`: `235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5`
  - `divvyConfigPDA`: `AhWYbZeiyisCxjrgz4yZRf7sPN8Wx5SxgnpaLVwrwBY4`
  - `divvyDividendVaultPDA`: `GjXC4iEAh7tqL7MqhY7cpF7Wvdfpa2LBMEL7anwty3Mw`
  - `divvyVaultAuthorityPDA`: `GhMLTG5273U2gj1gMC7tjYDPdkDfRY4nsTA8HWwEbyr8`
  - `poolAddress`: `Erzp6EhMbcsMwNxkLg4USt7K2GJ22rYZfd4rmVoLzz6X`
  - `deployerTokenAccount` (dividend mint ATA): `CrH2m8tHwZQX6Yfp7y5reaYc3yKaDHx8trDDMNgUoMBW`
  - `dividendMint`: `A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM`
  - `baseMint`: `3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4`
  - `configAddress` (DBC config): `H58aeXhEc91vRDTkHo5sGHr7398zbBox2YfuBvckxPHk`
