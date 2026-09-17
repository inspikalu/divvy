# Plan: Phase 5 — Dashboard

## Group 1 — Next.js 14, Tailwind CSS & Wallet Adapter Scaffold
- [ ] Update `package.json` with required dependencies:
  - `next@14.2.24`, `react@18.3.1`, `react-dom@18.3.1`
  - `@solana/wallet-adapter-base@^0.9.23`, `@solana/wallet-adapter-react@^0.15.35`, `@solana/wallet-adapter-react-ui@^0.9.35`, `@solana/wallet-adapter-wallets@^0.19.32`
  - `tailwindcss@3.4.17`, `postcss@8.4.38`, `autoprefixer@10.4.19`, `lucide-react@^0.395.0`, `clsx@^2.1.1`, `tailwind-merge@^2.3.0`
- [ ] Create configuration files:
  - `next.config.mjs` (transpilePackages for wallet adapter, webpack fallback for node modules)
  - `tailwind.config.ts` (custom dark theme, glow effects, typography)
  - `postcss.config.mjs`
  - `tsconfig.json` (configured with `"jsx": "preserve"`, `"paths": { "@/*": ["./src/*"] }`)
- [ ] Create application entry files:
  - `src/app/globals.css` (Tailwind directives, custom dark UI variables, Solana wallet adapter styling overrides)
  - `src/components/WalletContextProvider.tsx` (Client component wrapping `ConnectionProvider`, `WalletProvider`, `WalletModalProvider` with SSR hydration guard)
  - `src/app/layout.tsx` (Root layout with fonts, metadata, and `WalletContextProvider`)
- [ ] **Verify**: `npm install && npx next build` → builds cleanly with 0 errors.
- [ ] **Commit**: `chore(phase-5): setup Next.js 14, Tailwind CSS, and Solana wallet adapter foundation`

---

## Group 2 — On-Chain Data Fetching, IDL Integration & Custom React Hooks
- [ ] Create `src/lib/constants.ts`:
  - Deployed addresses from `tracked-addresses.json` (`divvyProgramId`, `meteoraDbcProgramId`, `dividendMint`, `baseMint`, `poolAddress`, `configAddress`, `divvyDividendVaultPDA`, `divvyVaultAuthorityPDA`, `wallets`).
  - RPC endpoint configuration (`NEXT_PUBLIC_RPC_URL` defaulting to Helius devnet RPC, with fallback to public devnet).
  - Explorer link helper utilities: `getExplorerAddressUrl(address)`, `getExplorerTxUrl(txHash)`.
- [ ] Create `src/lib/divvy-idl.json` and `src/lib/anchor.ts`:
  - Export Divvy IDL and Anchor Program instance helper using Read-Only / Signer connection.
  - Implement PDA derivation functions: `getConfigPda(baseMint)`, `getVaultPda(baseMint)`, `getVaultAuthorityPda(baseMint)`, `getClaimRecordPda(baseMint, holder)`.
  - Implement pro-rata math computation utility: `calculateProRataShare(vaultBalance, holderBalance, eligibleSupply)`.
- [ ] Create custom React hooks:
  - `src/hooks/useDivvyProtocol.ts`: Reads on-chain `DivvyConfig` account, `DividendVault` SPL token account balance, and DBC Pool status.
  - `src/hooks/useHolderAccount.ts`: Reads connected wallet's SOL balance, Base token ATA balance, Dividend token ATA balance, and on-chain `ClaimRecord` PDA state.
- [ ] Create integration test script `tests/frontend-rpc-reads.ts` to test all hooks and PDA derivation logic against live devnet RPC.
- [ ] **Verify**: `npx tsx tests/frontend-rpc-reads.ts` → prints live on-chain balances matching devnet ground truth (`DividendVault` balance > 0, `DivvyConfig` loaded, Holder A/B token balances resolved).
- [ ] **Commit**: `feat(phase-5): implement on-chain RPC data fetching and Anchor PDA client hooks`

---

## Group 3 — Protocol Overview, DBC Pool Stats & Explorer Proof Components
- [ ] Create `src/components/Header.tsx`:
  - Navigation header with Divvy brand logo, subtitle ("Hold the Meme → Earn the Stock"), Solana Devnet network badge, RPC latency indicator, and `WalletMultiButton`.
- [ ] Create `src/components/MetricsCards.tsx`:
  - 4 protocol stat cards reading directly from on-chain RPC:
    1. **Total Fees Routed**: `config.total_routed_dividends` (formatted in `xSTOCK` with explorer link to Config PDA).
    2. **Dividend Vault Balance**: live SPL token balance of `DividendVault` PDA (with explorer link to Vault token account).
    3. **Total Dividends Claimed**: `config.total_claimed_dividends` (with claim progress percentage).
    4. **Active Fee Share BPS**: `60.00%` (creator DBC fees routed to vault).
- [ ] Create `src/components/PoolOverview.tsx`:
  - Displays token pair details: Base Meme Token (`3pX9emk...`), Dividend Quote Token (`A3cQgqc...`), Meteora DBC Pool (`Erzp6Eh...`).
  - Displays bonding curve mechanics and trading volume summary.
- [ ] Create `src/components/ExplorerAuditTable.tsx`:
  - Auditable transaction registry table (US-5, RD-4) listing all key on-chain milestones: Pool Creation, Swaps (Buy A, Buy B, Sell A), Creator Fee Claim, Divvy Fee Routing, Holder A Claim, Holder B Claim.
  - Each entry has a clickable Solana Explorer devnet badge, transaction hash snippet, description, and status.
- [ ] **Verify**: `npx next build` → builds cleanly with 0 TypeScript/ESLint errors.
- [ ] **Commit**: `feat(phase-5): create protocol metrics, pool overview, and explorer audit trail components`

---

## Group 4 — Interactive Holder Claim Portal & Transaction Handler
- [ ] Create `src/components/HolderClaimCard.tsx`:
  - State 1 (Disconnected): Prompts user to connect wallet to inspect dividend eligibility.
  - State 2 (Connected, Unclaimed & Eligible):
    - Displays Base token balance and percentage of circulating supply.
    - Displays calculated claimable dividend amount (`xSTOCK`).
    - Interactive "Claim Dividends" button with loading and confirmation states.
  - State 3 (Connected, Already Claimed):
    - Displays green "Claimed" badge.
    - Shows exact claimed amount, timestamp of claim, and Solana Explorer link to the holder's `ClaimRecord` PDA and claim transaction.
  - State 4 (Connected, Ineligible):
    - Explains requirement to hold Base Meme Token.
- [ ] Create claim transaction handler in `src/hooks/useHolderClaim.ts`:
  - Constructs `claim` instruction with all 9 accounts: `holder`, `config`, `holder_base_token_account`, `holder_dividend_token_account`, `dividend_vault`, `vault_authority`, `claim_record`, `token_program`, `system_program`.
  - Automatically creates recipient ATA if it does not yet exist on-chain.
  - Signs and broadcasts transaction using connected wallet adapter.
  - Shows success notification with explorer transaction link and triggers automatic refetch of wallet balances and vault state.
- [ ] Create `src/components/DemoWalletsGuide.tsx`:
  - Collapsible reference drawer for judges and testers listing Deployer, Holder A, and Holder B public keys and their current on-chain claim status.
- [ ] **Verify**: `npx next build` → compiles successfully with zero errors.
- [ ] **Commit**: `feat(phase-5): implement interactive holder claim portal with wallet transaction execution`

---

## Group 5 — Creator Config Panel (US-1) & Unified Dashboard Assembly
- [ ] Create `src/components/CreatorPanel.tsx`:
  - View current token configuration parameters (`fee_share_bps = 6000`, `base_mint`, `dividend_mint`).
  - Tab allowing creators to configure Divvy on new DBC tokens (`base_mint`, `dividend_mint`, `fee_share_bps`, `excluded_wallets`).
  - Transaction builder for `initialize_config` allowing token creators to execute initialization from their connected wallet.
  - Visual diagram and instructions for the creator DBC fee claiming & routing flow.
- [ ] Create `src/app/page.tsx`:
  - Assemble full dashboard layout: Header, Protocol Metrics, Tab Navigation (Claim Portal, Creator Studio, Pool Details, Explorer Audit Trail), Demo Wallets Guide, and Footer.
  - Include auto-refresh toggle (every 10s) and manual refresh button for live devnet synchronization.
- [ ] **Verify**: Run Next.js server (`npm run dev` or production build) and fetch `http://localhost:3000` → returns HTTP 200 with all dashboard components rendered.
- [ ] **Commit**: `feat(phase-5): implement creator config panel and assemble unified dashboard page`

---

## Group 6 — Full Verification, Lint/Typecheck, & Commit
- [ ] Run `npx tsc --noEmit` → verify 0 TypeScript errors.
- [ ] Run `npm run build` → verify clean Next.js production build.
- [ ] Verify all acceptance criteria in `specs/2026-09-17-phase-5-dashboard/validation.md`.
- [ ] Verify that no `console.log` statements remain in committed code.
- [ ] Verify that `git status` shows no keypair or secret files staged.
- [ ] **Verify**: Complete test run of `tests/frontend-rpc-reads.ts` and `npm run build` → all passing.
- [ ] **Commit**: `feat(phase-5): finalize Phase 5 dashboard with full test coverage and devnet verification`
