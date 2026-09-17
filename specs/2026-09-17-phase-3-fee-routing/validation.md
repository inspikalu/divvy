# Validation: Phase 3 — Fee Routing

## Acceptance Criteria

- [x] **AC-1**: `anchor build` compiles without errors and the regenerated IDL at `target/idl/divvy.json` contains both `initialize_config` and `route_fees` in its `instructions` array.
- [x] **AC-2**: `cargo test --lib` passes all unit tests — `11 passed, 0 failed` — including the 4 new `route_fees` math cases in `math.rs`.
- [x] **AC-3**: `npx tsx tests/divvy-routing.ts` passes — `3 passing, 0 failed` — covering: happy-path routing with correct vault balance, authority guard rejection, and insufficient-balance rejection.
- [x] **AC-4**: The `divvy` program is upgraded on devnet. `solana program show 235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5 --url devnet` shows a `Last Deployed In Slot` value greater than `499752879` (Slot: 499782252).
- [x] **AC-5**: `scripts/claim-dbc-fees.ts` executes successfully against devnet and produces a confirmed transaction signature (`5Ao2BwpEESEPYQK3cGqgKrNU1iZWkb3M5ZrrNSt1hhrxePCroN5P9c29zYhuifVDi4HY959RyJ9Wft4ovW5FYEAk`). The deployer's dividend-mint token account balance is greater than 0 (990,000 units) after the script completes.
- [x] **AC-6**: `scripts/route-fees.ts` executes successfully against devnet and produces a confirmed `route_fees` transaction signature (`qEqE3WNBHr6ZM7BM7jQXAAhSmjVYdzp1ZrwyC568asy73tN78dG272KCGShjeygBTD1TpCsP1TTDb8DA62Byc2V`). The `DividendVault` token account balance (`GjXC4iEAh7tqL7MqhY7cpF7Wvdfpa2LBMEL7anwty3Mw`) is greater than 0 (1,198,087 units) after the script completes.
- [x] **AC-7**: `config.total_routed_dividends` on-chain equals the amount transferred into the vault (`1198087` units, verified via `npx tsx scripts/verify-divvy-config.ts`).
- [x] **AC-8**: Both `dbcFeeClaimSignature` and `routeFeesSignature` are recorded in `tracked-addresses.json` and open on Solana Explorer.
- [x] **AC-9**: No `console.log` (other than `console.error` in catch blocks) left in committed scripts; no `println!`, `dbg!`, or non-intentional debug output in Rust code.

## Merge Gate

- [x] All Group Verify steps in `plan.md` pass — paste literal command output as evidence, not a paraphrase:
  - Group 1: `anchor build` output + IDL assertion output → `['initialize_config', 'route_fees']`
  - Group 2: `cargo test --lib` output showing `11 passed, 0 failed`
  - Group 3: `solana program show 235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5 --url devnet` showing `Last Deployed In Slot: 499782252` (> 499752879)
  - Group 4: `npx tsx tests/divvy-routing.ts` output showing `Test Results: 3 passing, 0 failed`
  - Group 5: `spl-token balance A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM --owner BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34 --url devnet` showing `990000` (> 0)
  - Group 6: `npx tsx scripts/verify-divvy-config.ts` showing `Vault Balance: 1198087 ✓`, `total_routed_dividends: 1198087 ✓`
  - Group 7: `git log -1 --pretty=format:"%s"` showing `feat(phase-3): implement route_fees instruction and wire dbc fee claim into dividend vault`

- [x] Phase 3 integrates without breaking Phase 2: `npx tsx tests/divvy-config.ts` passes `4 passing, 0 failed` after the program upgrade.

- [x] Lint/typecheck clean: `npx tsc --noEmit` → `0 errors, 0 warnings`.

- [x] No mocks/stubs/placeholder logic outside what `engineering-standards.md` explicitly permits. Specifically: the DBC fee claim transaction is real (confirmed on devnet: `5Ao2Bwp...`), and the `route_fees` CPI token transfer is real (confirmed on devnet: `qEqE3WNB...`, vault balance reflects `1198087` units).

- [x] No debug `console.log`/`println!`/`dbg!` statements left in committed code. Only permitted outputs: `console.error` in catch blocks (scripts), `msg!()` in `route_fees` handler (intentional program log).

- [x] Installed dependency versions match `tech-stack.md` pinned versions for all packages this phase touches:
  - `npm list @coral-xyz/anchor` → `0.31.0`
  - `npm list @meteora-ag/dynamic-bonding-curve-sdk` → `1.5.12`
  - `npm list @solana/web3.js` → `1.95.8` (top-level, not nested)
  - `npm list @solana/spl-token` → `0.4.13`

- [x] Diff summary reviewed: `git diff --stat 8058042..HEAD` — confirmed changed files.

- [x] **Demo-able**: From a fresh terminal, run `npx tsx scripts/claim-dbc-fees.ts` → print confirmed signature → run `npx tsx scripts/route-fees.ts` → print confirmed signature + vault balance > 0 → open both signatures on `https://explorer.solana.com/?cluster=devnet` → vault balance visible on-chain. A judge watching this 2-command sequence sees: fees claimed from DBC, fees routed into vault, on-chain proof of both.
