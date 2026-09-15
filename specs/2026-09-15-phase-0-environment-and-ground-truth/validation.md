# Validation: Phase 0 — Environment & Ground Truth

## Acceptance Criteria
- [ ] **Toolchain Verified**: Anchor CLI is set to `0.30.1`, `spl-token-cli` is executable, and tool versions match `tech-stack.md`.
- [ ] **Meteora DBC Devnet Verified**: Account `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN` is verified executable on Solana devnet, and `@meteora-ag/dynamic-bonding-curve-sdk` `1.5.12` is recorded in `specs/tech-stack.md`.
- [ ] **Keypairs Generated & Isolated**: Three keypairs (`keys/deployer.json`, `keys/holder-a.json`, `keys/holder-b.json`) exist in `keys/` and `git check-ignore` confirms none will be tracked by git.
- [ ] **Wallets Funded on Devnet**: All three wallets have positive devnet SOL balances confirmed on-chain (`solana balance <PUBKEY> --url devnet > 0`).
- [ ] **Dividend Asset Mint Created**: A classic SPL token mint exists on devnet with 6 decimals, and deployer's ATA has an initial supply of 1,000,000 tokens (`spl-token supply <MINT> --url devnet` returns `1000000`).
- [ ] **Tracked Addresses Centralized**: `tracked-addresses.json` contains valid base58 addresses for all wallets, the dividend mint, and the DBC program ID.
- [ ] **Repository Initialized**: Git repo initialized with `.gitignore`, `.env.example`, `tracked-addresses.json`, and specs staged and committed cleanly with zero private key leakage.

## Merge Gate
- [ ] All Group verifies in `plan.md` pass (with pasted evidence, not paraphrase).
- [ ] Phase integrates without breaking prior phases (Phase 0 baseline).
- [ ] Lint / format clean — run `git status` to verify working tree is clean and no untracked secret files remain exposed.
- [ ] No mocks/stubs/placeholder logic outside what `engineering-standards.md` explicitly permits (the SPL mint is a real devnet mint).
- [ ] No debug statements or leaked private keys left in tracked code.
- [ ] Installed dependency versions match `tech-stack.md`'s pinned versions:
  - Run: `anchor --version` (expect `anchor-cli 0.30.1`)
  - Run: `node -v` (expect `v20.` or `v24.`)
- [ ] Diff summary reviewed:
  - Run: `git log -1 --stat`
  - Confirm the changed-file list matches what is claimed in the execution report.
- [ ] Demo-able: On Solana Explorer (`https://explorer.solana.com/?cluster=devnet`), the Dividend Mint account, Deployer account, and Holder accounts are all viewable with real devnet balances.
