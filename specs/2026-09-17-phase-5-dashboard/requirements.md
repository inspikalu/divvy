# Requirements: Phase 5 — Dashboard

## Target Phase
- **Phase:** Phase 5 — Dashboard
- **Time Budget:** ~6h (from `specs/roadmap.md`)
- **Exit Condition:** From a fresh browser, connect holder wallet → see a non-zero claimable amount → claim → balance updates → every number on screen opens in an explorer. No hardcoded values anywhere. Traces to: US-1, US-3, US-4, US-5, RD-3, RD-4.

---

## Core User Stories (Served by this Phase)

- **US-1 (Creator, enable):** As a token creator, I want to enable Divvy on my DBC token and set what share of trading fees goes to the Dividend Vault, so that my holders have a reason to keep holding after launch.
- **US-3 (Holder, see):** As a holder, I want to see how much dividend I have accrued and what the vault holds in total, so that I can verify the yield is real before I act on it.
- **US-4 (Holder, claim):** As a holder, I want to claim my pro-rata share of the vault in a single transaction, so that I actually receive the dividend rather than just reading about it.
- **US-5 (Anyone, verify):** As any observer, I want every fee routed and every claim paid to be visible as an on-chain transaction I can open in an explorer, so that the yield is auditable rather than a number on a dashboard.

---

## Required Deliverables Traced

- **RD-3:** A frontend dashboard showing, for an enabled token: total fees routed, current vault balance, the connected wallet's claimable amount, and a working claim button.
- **RD-4:** Explorer-verifiable proof: every number shown on the dashboard is backed by a transaction signature or account address the judges can open themselves.

---

## Selected Scope

1. **Next.js 15 App Router Application:**
   - Client-side application using Next.js 15, React 18, TypeScript 5.4, and Tailwind CSS 3.4.
   - Solana Wallet Standard integration (`@solana/wallet-adapter-base`, `@solana/wallet-adapter-react`) with custom, hydration-safe `WalletConnectButton` auto-detecting all standard wallets (Phantom, Solflare, Backpack, etc.) on Solana devnet.
   - Zero server-side rendering hydration mismatches for wallet connection components.

2. **Live On-Chain Protocol Metrics (Direct RPC Reads):**
   - Total Fees Routed (`config.total_routed_dividends`).
   - Total Dividends Claimed (`config.total_claimed_dividends`).
   - Cumulative Dividend Index (`config.cumulative_dividend_per_token`).
   - Current Vault Balance (live SPL Token balance of `DividendVault` PDA).
   - Configured Fee Share Percentage (`config.fee_share_bps / 100`, e.g., 60.00%).
   - Active Token Pair Details (Base Meme Mint `3pX9emk...` and Dividend Quote Mint `A3cQgqc...`).
   - Meteora DBC Pool details (`Erzp6Eh...`) and curve configuration parameters.

3. **Holder Dividend & Continuous Claim Portal:**
   - Connected wallet balances: SOL, Base Token (`3pX9emk...`), and Dividend Token (`A3cQgqc...`).
   - Real-time on-chain `ClaimRecord` PDA check (`[b"claim", base_mint, holder]`) with `last_claimed_index`.
   - Continuous yield calculation: `(holder_balance * (global_index - last_claimed_index)) / 10^12` with fallback to pro-rata share.
   - Displays previous claimed total, current newly claimable amount, timestamp, and transaction proof.
   - Interactive "Claim Dividend" transaction flow: builds Anchor `claim` instruction, prompts wallet signature, sends to devnet via RPC, awaits confirmation.
   - Replaced inline error/success blocks with Sonner toast system styled to match the Divvy pastel purple theme (multi-stage progress, clear user-friendly error formatting, action buttons linking to Solana Explorer). Holders can claim repeatedly whenever new fees accrue.

4. **Creator Enable & Configuration Panel (US-1):**
   - Creator overview of active Divvy pool configuration and fee split rules.
   - Form interface allowing token creators to initialize Divvy configuration on any DBC base token (`initialize_config` instruction builder with `base_mint`, `dividend_mint`, `fee_share_bps`, and `excluded_wallets`).
   - DBC creator fee routing workflow instructions and trigger view.

5. **Verifiable Audit Trail & Explorer Proof Table (US-5, RD-4):**
   - Persistent, live-updating transaction and account registry linking directly to Solana Explorer on devnet:
     - Program ID: `235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5`
     - DivvyConfig PDA: `AhWYbZeiyisCxjrgz4yZRf7sPN8Wx5SxgnpaLVwrwBY4`
     - DividendVault PDA: `GjXC4iEAh7tqL7MqhY7cpF7Wvdfpa2LBMEL7anwty3Mw`
     - Meteora DBC Pool: `Erzp6EhMbcsMwNxkLg4USt7K2GJ22rYZfd4rmVoLzz6X`
     - Pool Creation Tx: `ZgAdZ1Fh4nfjVNTgaeRHA9TMqNJR6C5oYGiwEDuuiaWGexMpkyucKJsjJcr2UyhX2FDZFfYWZwnjvgarLdGasF3`
     - DBC Swaps Tx Signatures (Buy A, Buy B, Sell A)
     - Creator DBC Fee Claim Tx: `5Ao2BwpEESEPYQK3cGqgKrNU1iZWkb3M5ZrrNSt1hhrxePCroN5P9c29zYhuifVDi4HY959RyJ9Wft4ovW5FYEAk`
     - Divvy Fee Routing Tx: `qEqE3WNBHr6ZM7BM7jQXAAhSmjVYdzp1ZrwyC568asy73tN78dG272KCGShjeygBTD1TpCsP1TTDb8DA62Byc2V`
     - Holder A Claim Tx: `5REF3WusB2RrRRxwY4Jg6ijYdsGPd4hLeTfWutbMtkwyjPWUZNFPjbL7cCqaUHU2hCAEtvkAZLZYtv9S8DoJAp8V`
     - Holder B Claim Tx: `5DHjNHofE7TrdxC5DtwYoqrgG3wyntRxfHSowEMAVU2wa9966X7JCJ1o6SPUz3xMdPyv7s1gjjKqEK6vTT78QKAv`

6. **Demo Assistant / Quick-Switch Guide:**
   - Dedicated panel displaying demo wallet credentials / public keys and roles (Deployer/Creator, Holder A, Holder B) allowing judges and testers to inspect each perspective.

---

## Out of Scope / Deferred

- **No backend database or custom server:** All data must be fetched directly from Solana devnet RPC endpoints (`tech-stack.md`).
- **No mainnet tokens or mainnet deployment:** Strictly targeting Solana devnet.
- **No external price oracles (Pyth):** Pro-rata math is denominated in the real SPL dividend token units.
- **No push distributions / automated airdrop bots:** Divvy uses pull-based holder claiming.
- **No Stretch Goals (SG-1 Loyalty Multiplier, SG-2 Yield Leaderboard):** Deferred until Phase 6 Merge Gate is green.

---

## Architectural Decisions

| Choice | Pinned Version | Rationale & Constraint |
|---|---|---|
| Next.js | `14.2.24` | App Router, tested stability with Solana Wallet Adapter. |
| React / React-DOM | `18.3.1` | Pinned by Next 14.2.x. |
| TypeScript | `5.4.5` | Strict type checking. |
| `@solana/web3.js` | `1.95.8` | Pinned via npm overrides. |
| `@coral-xyz/anchor` | `0.31.0` | TS client library matching on-chain IDL format. |
| `@solana/wallet-adapter-react` | `0.15.35` | Standard Solana wallet context and hooks. |
| `@solana/wallet-adapter-react-ui` | `0.9.35` | Ready-to-use wallet modal styles. |
| `@solana/wallet-adapter-wallets` | `0.19.32` | Standard wallet adapters (Phantom, Solflare). |
| Tailwind CSS | `3.4.17` | Utility-first styling with custom dark theme. |
| Lucide React | `0.395.0` | Modern, clean UI iconography. |

---

## Known Issues Carried Forward

- **`@meteora-ag/dynamic-bonding-curve-sdk@1.5.12`:** `TokenDecimal` enum uses uppercase keys (`SIX`, `SEVEN`, `EIGHT`, `NINE`). `poolCreationFee` is denominated in SOL. `BaseFeeMode.FeeSchedulerLinear` requires both `numberOfPeriod` and `totalDuration` to be 0 when using flat fees.
- **Next.js App Router SSR Wallet Hydration:** The Solana wallet adapter context accesses `window` and browser storage. All wallet-dependent UI components must either use `"use client"` with hydration guards (`mounted` state) or be dynamically imported with `{ ssr: false }`.
- **Helius RPC vs Public Devnet Rate Limits:** Public devnet endpoint (`api.devnet.solana.com`) throttles frequently. Dashboard should default to Helius devnet RPC with public RPC fallback.

---

## Engineering Standards (Verbatim from `specs/engineering-standards.md`)

### 1. Mocks, Stubs, and Placeholder Data
**Default: forbidden.** Silence means not allowed.
The single permitted substitution, and its exact boundary:
- **PERMITTED:** the dividend asset may be a devnet SPL token we mint ourselves, standing in for a tokenized equity. It must be a real mint, really held by the vault, really transferred by the claim instruction. The dashboard and the demo script must both state plainly that this is a devnet stand-in for a tokenized equity.
- **PERMITTED:** seeding trading activity with our own wallets to generate fees. The swaps must be real swaps producing real fees — we are staging the *activity*, not faking the *fees*.
Everything else is forbidden, specifically including:
- **FORBIDDEN:** any dashboard number that is not read from chain. No hardcoded APY, no hardcoded vault balance, no hardcoded fee total, no placeholder claimable amount.
- **FORBIDDEN:** a claim button that does anything other than send a real transaction.
- **FORBIDDEN:** stubbing the fee-routing path — e.g. transferring tokens into the vault from a script to make the dashboard look populated, while the DBC fee route is not actually wired. This is the core claim of the submission; faking it is fatal.
- **FORBIDDEN:** `TODO`, `unimplemented!()`, or a silently-returning empty function on any path the demo touches.

### 2. Debug Logging
- No `console.log`, `println!`, `dbg!`, or equivalent left in committed code.
- Exception: Anchor `msg!()` calls that are deliberate, permanent program logs — e.g. logging a routed fee amount or a claim amount. These are a feature (they show up in the explorer during the demo). They must be intentional and named as such in the spec, not leftovers.
- Frontend `console.error` inside a `catch` block that surfaces a real failure is permitted. Everything else comes out before commit.

### 4. What Counts as a Passing Verify Step
Every Verify bullet in every future `plan.md` must be **either**:
- a **literal command** plus the **exact expected output**, e.g. `anchor test` → `4 passing`; or `solana account <VAULT_PDA> --url devnet` → `Balance: 0.00203928 SOL`, token amount `> 0`
- **or**, where no command exists, the **literal manual steps** plus the **exact expected screen state**, e.g. "Connect wallet B → dashboard 'Claimable' shows a value greater than 0 → click Claim → wallet prompts → after confirmation, 'Claimable' shows 0 and 'Claimed to date' shows the previous claimable value; the transaction signature appears as a link."
Vague verifies — "confirm it works", "check the vault updates", "ensure the UI looks right" — are **invalid**.
Every Verify step involving on-chain state must produce an **explorer-openable identifier** (transaction signature or account address). Judges will ask.

### 5. Rollback Policy on Unrecoverable Verify Failure
**Default applies: revert.**
On an unrecoverable Verify failure, the executor reverts the failing group's changes back to the last passing group's committed state (`git checkout -- .`, or `git reset --hard <last-good-commit>`) and reports **BLOCKED against a clean tree**.
Corollary, given the deadline: **commit at every passing group boundary.**

### 6. Devnet-Specific Rules
- Program IDs, mint addresses, vault PDAs, and the demo wallet addresses must be recorded in a single tracked file as they are created.
- Never commit a keypair file or a private key.
- Devnet airdrops are rate-limited.
- Devnet state can be reset or wiped by the cluster. The demo must be reproducible from a documented script.

### 7. Scope Discipline
- Any acceptance criterion that does not trace to a Core User Story or an approved Stretch Goal in `mission.md` is scope creep. **Flag it; do not build it.**
- Stretch goals (SG-1 loyalty multiplier, SG-2 leaderboard) are gated on the core Merge Gate passing.

---

## External Dependencies

- **Solana devnet RPC:** `https://api.devnet.solana.com` / `https://devnet.helius-rpc.com/?api-key=8dabc2e1-a043-4c0a-a675-52273c7ac948` (Available)
- **Divvy Program ID:** `235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5` (Deployed & Verified on devnet)
- **Meteora DBC Program ID:** `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN` (Verified on devnet)
- **Meteora DBC Pool:** `Erzp6EhMbcsMwNxkLg4USt7K2GJ22rYZfd4rmVoLzz6X` (Active on devnet)
- **Base Meme Mint:** `3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4` (Active on devnet)
- **Dividend Quote Mint (`xSTOCK`):** `A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM` (Active on devnet)
