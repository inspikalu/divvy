# Validation: Phase 3 — Fee Routing

## Acceptance Criteria

- [ ] **AC-1**: `anchor build` compiles without errors and the regenerated IDL at `target/idl/divvy.json` contains both `initialize_config` and `route_fees` in its `instructions` array.
- [ ] **AC-2**: `cargo test --lib` passes all unit tests — `11 passed, 0 failed` — including the 4 new `route_fees` math cases in `math.rs`.
- [ ] **AC-3**: `npx tsx tests/divvy-routing.ts` passes — `3 passing, 0 failed` — covering: happy-path routing with correct vault balance, authority guard rejection, and insufficient-balance rejection.
- [ ] **AC-4**: The `divvy` program is upgraded on devnet. `solana program show 235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5 --url devnet` shows a `Last Deployed In Slot` value greater than `499752879` (the Phase 2 deploy slot).
- [ ] **AC-5**: `scripts/claim-dbc-fees.ts` executes successfully against devnet and produces a confirmed transaction signature. The deployer's dividend-mint token account balance is greater than 0 after the script completes.
- [ ] **AC-6**: `scripts/route-fees.ts` executes successfully against devnet and produces a confirmed `route_fees` transaction signature. The `DividendVault` token account balance (`GjXC4iEAh7tqL7MqhY7cpF7Wvdfpa2LBMEL7anwty3Mw`) is greater than 0 after the script completes.
- [ ] **AC-7**: `config.total_routed_dividends` on-chain equals the amount transferred into the vault (verify via `npx tsx scripts/verify-divvy-config.ts` — extend output to show `total_routed_dividends`).
- [ ] **AC-8**: Both `dbcFeeClaimSignature` and `routeFeesSignature` are recorded in `tracked-addresses.json` and open on Solana Explorer.
- [ ] **AC-9**: No `console.log` (other than `console.error` in catch blocks) left in committed scripts; no `println!`, `dbg!`, or non-intentional debug output in Rust code.

## Merge Gate

- [ ] All Group Verify steps in `plan.md` pass — paste literal command output as evidence, not a paraphrase:
  - Group 1: `anchor build` output + IDL assertion output
  - Group 2: `cargo test --lib` output showing `11 passed, 0 failed`
  - Group 3: `solana program show 235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5 --url devnet` showing slot > 499752879
  - Group 4: `npx tsx tests/divvy-routing.ts` output showing `3 passing, 0 failed`
  - Group 5: `spl-token balance A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM --owner BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34 --url devnet` showing > 0
  - Group 6: `spl-token balance A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM --owner GhMLTG5273U2gj1gMC7tjYDPdkDfRY4nsTA8HWwEbyr8 --url devnet` showing > 0
  - Group 7: `git log -1 --pretty=format:"%s"` showing exact commit message

- [ ] Phase 3 integrates without breaking Phase 2: `npx tsx tests/divvy-config.ts` still passes `4 passing, 0 failed` after the program upgrade.

- [ ] Lint/typecheck clean: `npx tsc --noEmit` → `0 errors, 0 warnings`.

- [ ] No mocks/stubs/placeholder logic outside what `engineering-standards.md` explicitly permits. Specifically: the DBC fee claim transaction is real (confirmed on devnet), and the `route_fees` CPI token transfer is real (confirmed on devnet, vault balance reflects it).

- [ ] No debug `console.log`/`println!`/`dbg!` statements left in committed code. Only permitted outputs: `console.error` in catch blocks (scripts), `msg!()` in `route_fees` handler (intentional program log).

- [ ] Installed dependency versions match `tech-stack.md` pinned versions for all packages this phase touches:
  - `npm list @coral-xyz/anchor` → expect `0.31.0`
  - `npm list @meteora-ag/dynamic-bonding-curve-sdk` → expect `1.5.12`
  - `npm list @solana/web3.js` → expect `1.95.8` (top-level, not nested)
  - `npm list @solana/spl-token` → expect `0.4.13`

- [ ] Diff summary reviewed: `git diff --stat 30281fb..HEAD` (from Phase 2 Groups 1–4 commit) — confirm changed files are limited to:
  - `programs/divvy/src/instructions/route_fees.rs` (new)
  - `programs/divvy/src/instructions/mod.rs` (updated)
  - `programs/divvy/src/lib.rs` (updated)
  - `programs/divvy/src/math.rs` (updated)
  - `tests/divvy-routing.ts` (new)
  - `scripts/claim-dbc-fees.ts` (new)
  - `scripts/route-fees.ts` (new)
  - `tracked-addresses.json` (updated)
  - `specs/2026-09-17-phase-3-fee-routing/` (new directory)

- [ ] **Demo-able**: From a fresh terminal, run `npx tsx scripts/claim-dbc-fees.ts` → print confirmed signature → run `npx tsx scripts/route-fees.ts` → print confirmed signature + vault balance > 0 → open both signatures on `https://explorer.solana.com/?cluster=devnet` → vault balance visible on-chain. A judge watching this 2-command sequence sees: fees claimed from DBC, fees routed into vault, on-chain proof of both.
