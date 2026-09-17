# Validation: Phase 5 — Dashboard

## Acceptance Criteria

- [ ] **AC-1 (Next.js Application Build):** The Next.js 14 application compiles cleanly. `npm run build` exits 0 with 0 errors and 0 warnings.
- [ ] **AC-2 (TypeScript Typecheck):** `npx tsc --noEmit` passes with 0 errors across the entire codebase (frontend and scripts).
- [ ] **AC-3 (Wallet Adapter Integration):** The dashboard integrates `@solana/wallet-adapter-react` and `@solana/wallet-adapter-react-ui`, connects to Solana devnet, and renders wallet connection buttons without SSR hydration errors.
- [ ] **AC-4 (Live Protocol Metrics):** The dashboard reads live on-chain data for `DivvyConfig` (`total_routed_dividends`, `total_claimed_dividends`, `fee_share_bps`) directly from devnet RPC without hardcoded numbers.
- [ ] **AC-5 (Live Vault Balance):** The dashboard reads the live SPL token balance of the `DividendVault` PDA (`GjXC4iEAh7tqL7MqhY7cpF7Wvdfpa2LBMEL7anwty3Mw`) directly from devnet RPC.
- [ ] **AC-6 (Holder Eligibility & Pro-Rata Share):** For a connected wallet, the claim portal dynamically fetches Base token balance, queries the on-chain `ClaimRecord` PDA, and calculates the exact pro-rata claimable dividend amount.
- [ ] **AC-7 (Interactive On-Chain Claim Execution):** The claim button builds a valid `claim` instruction, signs via wallet adapter, submits to Solana devnet, and upon confirmation displays the explorer transaction link and updates account balances.
- [ ] **AC-8 (Creator Enable / Config Panel):** The dashboard includes a creator studio (US-1) displaying active pool configuration and an interactive transaction builder for `initialize_config` on new DBC tokens.
- [ ] **AC-9 (Auditable Explorer Proofs):** Every metric, PDA address, DBC pool address, and milestone transaction (swaps, fee claim, fee routing, holder claims) includes a direct, working hyperlink to Solana Explorer on devnet (RD-4, US-5).
- [ ] **AC-10 (No Mocks / Zero Debug Logs):** Zero mock data or placeholder values on any active UI path; no `console.log` (except `console.error` in catch blocks) left in committed code.

---

## Merge Gate

- [ ] All Group Verify steps in `plan.md` pass — paste literal command output as evidence, not a paraphrase:
  - Group 1: `npm install && npx next build` output showing successful compilation
  - Group 2: `npx tsx tests/frontend-rpc-reads.ts` output showing successful live on-chain reads
  - Group 3: `npx next build` output showing 0 errors
  - Group 4: `npx next build` output showing successful claim portal compilation
  - Group 5: HTTP 200 verification on rendered dashboard page
  - Group 6: `npx tsc --noEmit` showing 0 errors
  - Group 7: `git log -1 --pretty=format:"%s"` showing exact commit message

- [ ] Phase 5 integrates without breaking previous phases:
  - `cargo test --lib` passes `13 passed, 0 failed`
  - `npx tsx tests/divvy-config.ts` passes `4 passing, 0 failed`
  - `npx tsx tests/divvy-routing.ts` passes `3 passing, 0 failed`
  - `npx tsx tests/divvy-claim.ts` passes `4 passing, 0 failed`

- [ ] Lint/typecheck clean: `npx tsc --noEmit` → `0 errors, 0 warnings`.

- [ ] No mocks/stubs/placeholder logic outside what `engineering-standards.md` explicitly permits. All numbers shown in UI are derived from real RPC queries against Solana devnet.

- [ ] No debug `console.log`/`println!`/`dbg!` statements left in committed code. Only permitted outputs: `console.error` in catch blocks.

- [ ] Installed dependency versions match `tech-stack.md` pinned versions:
  - `next` → `14.2.x`
  - `react` → `18.3.x`
  - `@solana/web3.js` → `1.95.8`
  - `@coral-xyz/anchor` → `0.31.0`
  - `tailwindcss` → `3.4.x`

- [ ] Diff summary reviewed: confirm changed and newly created frontend files conform to scope.

- [ ] **Demo-able**: Connect holder wallet → see real on-chain balance & claim state → inspect explorer audit links → creator view shows active config. A judge watching this sees: a fully functioning, transparent dividend protocol dashboard on Solana devnet.
