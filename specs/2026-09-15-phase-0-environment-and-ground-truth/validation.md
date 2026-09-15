# Validation: Phase 0 — Environment & Ground Truth

## Acceptance Criteria
- [x] **Toolchain Verified**: Anchor CLI is set to `0.32.1`, `spl-token-cli` is `5.5.0`, and tool versions match `tech-stack.md`.
- [x] **Meteora DBC Devnet Verified**: Account `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN` is verified executable on Solana devnet, and `@meteora-ag/dynamic-bonding-curve-sdk` `1.5.12` is recorded in `specs/tech-stack.md`.
- [x] **Keypairs Generated & Isolated**: Three keypairs (`keys/deployer.json`, `keys/holder-a.json`, `keys/holder-b.json`) exist in `keys/` and `git check-ignore` confirms none will be tracked by git.
- [x] **Wallets Funded on Devnet**: All three wallets have positive devnet SOL balances confirmed on-chain (`deployer`: 2.5 SOL, `holderA`: 1.5 SOL, `holderB`: 1.5 SOL).
- [x] **Dividend Asset Mint Created**: A classic SPL token mint exists on devnet (`A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM`) with 6 decimals, and deployer's ATA has an initial supply of 1,000,000 tokens (`spl-token supply` returns `1000000`).
- [x] **Tracked Addresses Centralized**: `tracked-addresses.json` contains valid base58 addresses for all wallets, the dividend mint, and the DBC program ID.
- [x] **Repository Initialized**: Git repo initialized with `.gitignore`, `.env.example`, `tracked-addresses.json`, and specs staged and committed cleanly with zero private key leakage.

## Merge Gate
- [x] All Group verifies in `plan.md` pass (with pasted evidence, not paraphrase).
- [x] Phase integrates without breaking prior phases (Phase 0 baseline).
- [x] Lint / format clean — `git status` shows clean working tree with zero untracked secrets.
- [x] No mocks/stubs/placeholder logic outside what `engineering-standards.md` explicitly permits (the SPL mint is a real devnet mint).
- [x] No debug statements or leaked private keys left in tracked code.
- [x] Installed dependency versions match `tech-stack.md`'s pinned versions:
  - Run: `anchor --version` → `anchor-cli 0.32.1`
  - Run: `node -v` → `v24.14.0`
- [x] Diff summary reviewed:
  - Run: `git log -1 --stat` → 11 files changed, 734 insertions(+).
  - Confirmed changed-file list matches what is claimed in the execution report.
- [x] Demo-able: On Solana Explorer (`https://explorer.solana.com/?cluster=devnet`), the Dividend Mint account (`A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM`), Deployer account (`BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34`), and Holder accounts are all viewable with real devnet balances.
