# Validation: Phase 1 — Launch a Token on a Deliberate DBC Config

## Acceptance Criteria
- [x] **Meteora SDK Installed**: `@meteora-ag/dynamic-bonding-curve-sdk@1.5.12` installed and runnable via TypeScript (`npx tsx`).
- [x] **Curve Justification Documented**: `specs/curve-design.md` clearly explains the non-default curve shape and dynamic fee schedule choices for a stock-paired meme asset.
- [x] **DBC Pool Live on Devnet**: A DBC pool is initialized on devnet pairing a newly minted base meme token with the Phase 0 dividend quote token (`A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM`).
- [x] **Real Swaps Executed**: Holder A and Holder B have executed real buy and sell swap transactions confirmed on devnet (`npx tsx scripts/execute-swaps.ts --verify`).
- [x] **Accrued Fees Verifiable**: On-chain query confirms non-zero trading fees accrued in the DBC pool fee accounts (`npx tsx scripts/check-fee-accrual.ts`).
- [x] **Addresses & Explorer Links Centralized**: `tracked-addresses.json` is updated with `poolAddress`, `baseMint`, `swapSignatures`, and explorer URLs.

## Merge Gate
- [x] All Group verifies in `plan.md` pass (with pasted evidence, not paraphrase).
- [x] Phase integrates without breaking Phase 0 setup (wallets and dividend mint intact).
- [x] Typecheck clean — run `npx tsc --noEmit` (clean exit code 0).
- [x] No mocks/stubs/placeholder logic outside what `engineering-standards.md` explicitly permits (all swaps and pools are real devnet transactions).
- [x] No debug console statements left in committed code.
- [x] Installed dependency versions match `tech-stack.md`'s pinned versions:
  - Run: `npm list @meteora-ag/dynamic-bonding-curve-sdk` (GOT `1.5.12` ✅)
  - Run: `npm list @solana/web3.js` (GOT `1.95.8` ✅)
- [x] Diff summary reviewed:
  - Run: `git log -1 --stat`
  - Confirm the changed-file list matches what is claimed in the execution report.
- [x] Demo-able: The DBC pool address, base mint, and swap transaction signatures open directly on Solana Explorer (`https://explorer.solana.com/?cluster=devnet`) demonstrating real swaps and accrued fee balances.
