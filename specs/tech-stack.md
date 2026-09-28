# Tech Stack — Divvy

Calibrated to a **sub-48-hour devnet build**. Bias throughout: boring, well-documented,
fast to debug at 3am. Novelty budget is spent entirely on the DBC configuration, not on
the tooling around it.

## On-Chain

| Choice | Version | Why |
|---|---|---|
| Solana | devnet | Approved by project owner. Removes mainnet cost and risk from the demo. |
| Anchor | `0.32.1` | Installed in environment via avm. Account validation, IDL generation, and TS client generation. |
| Rust toolchain | `1.94.x` (stable) | Active rustc in environment. |
| Solana CLI / Agave | `3.1.x` (Agave) / `spl-token 5.5.0` | Active CLI in environment for devnet deployments and token management. |
| SPL Token | `spl-token` classic (not Token-2022) | See "Ruled out". |

## Meteora Integration

| Choice | Version | Why |
|---|---|---|
| `@meteora-ag/dynamic-bonding-curve-sdk` | `1.5.12` | Official TypeScript SDK for Meteora Dynamic Bonding Curve, verified available on npm and compatible with Anchor/Web3. Pinned to avoid API drift. |

**Devnet availability:** Meteora DBC program is verified deployed and executable on Solana devnet at `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN`.

## Frontend

| Choice | Version | Why |
|---|---|---|
| Next.js | `15.3.x` | App Router, upgraded to latest stable release with React 18 compatibility. |
| React | `18.3.x` | React 18.3.1 runtime. |
| TypeScript | `5.4.x` | Matches tested range. |
| `@solana/web3.js` | `1.95.x` | The 1.95.x standard library with Anchor provider compatibility. |
| `@solana/wallet-adapter-react` + Wallet Standard | `0.15.x` | Pure Solana Wallet Standard auto-discovery for Phantom, Solflare, Backpack. |
| `sonner` | `^2.0.x` | Beautiful, lightweight toast notification system matching Divvy theme (replaces inline alert banners). |
| Tailwind CSS | `3.4.x` | Styling with custom pastel brand tokens. |
| Node.js | `20.x` LTS | Runtime floor. |

## Data / Indexing

| Choice | Version | Why |
|---|---|---|
| Direct RPC account reads | n/a | Vault balance, config, and per-holder claim state are read straight from on-chain accounts. No indexer, no database, no backend service. |
| Devnet RPC | public endpoint, Helius devnet as fallback | Public devnet RPC rate-limits aggressively. If it becomes the bottleneck, switch to Helius and log it in the Change Log. |

**There is no backend.** The frontend talks to the chain directly. If a task appears to
require a server, that is a signal the task is out of scope for this build window —
raise it rather than adding one.

## Dividend Asset (devnet)

The settled dividend asset for the demo is a **devnet SPL token created by us, standing
in for a tokenized equity**. This is a deliberate, disclosed substitution, not a mock:
it is a real mint, held in a real vault, transferred by a real claim instruction. See
`engineering-standards.md` for the exact boundary on what this permits and forbids.

## Ruled Out

Recorded so these are not re-litigated mid-build.

- **Mainnet deployment** — project owner approved devnet. Mainnet adds SOL cost, real
  liquidity requirements, and an irreversible-mistake surface we cannot afford in 48h.
- **Real tokenized equities (xStock / PreStock / Tessera) as the settled asset** —
  these do not have usable devnet deployments or liquidity. Attempting it would produce
  a fake flow, which is forbidden.
- **Pyth price feeds** — tied to the rejected analytics scope in `mission.md`. Also,
  devnet feed coverage for equities is unreliable.
- **Jupiter swap integration for auto-converting vault fees** — Jupiter routing on
  devnet is not dependable. The vault holds and distributes the quote asset it receives.
  Auto-swap is a described-but-not-built design property.
- **Token-2022 / transfer hooks** — an attractive fee-capture mechanism, but adds
  wallet-compatibility and tooling edge cases. DBC fee capture is the specified
  mechanism for this bounty; Token-2022 is a distraction.
- **A backend service or database** — see above.
- **Rust integration-test harness beyond Anchor's default** — `anchor test` against a
  local validator is the ceiling for this build window.

## Change Log
- [2026-09-15] Phase 0/Group 1: aligned toolchain versions (Anchor CLI `0.32.1`, Agave CLI `3.1.x`, `spl-token 5.5.0`, Rust `1.94.x`) to match environment.
- [2026-09-15] Phase 0: pinned `@meteora-ag/dynamic-bonding-curve-sdk` to `1.5.12` and confirmed Meteora DBC Program ID `dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN` is executable on devnet — confirmed by ground-truth RPC query.
- [2026-09-24] Phase 4/5: added `migrate_config` instruction and upgraded Divvy on-chain program on devnet (`235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5`) with 140-byte realloc migration.
- [2026-09-24] Phase 5: added `sonner` for themed toasts, replacing inline error and success banners across claim workflows.

Every mid-build addition or change to the stack gets recorded here before it is used.
Format: `- [YYYY-MM-DD] Phase/Group: [what changed] — [why] — confirmed by [who].`
Nothing gets added to the stack silently.

## Known Issues

- [2026-09-16] Phase 1/Group 3: `@meteora-ag/dynamic-bonding-curve-sdk@1.5.12` — `TokenDecimal` enum uses uppercase keys (`SIX`, `SEVEN`, `EIGHT`, `NINE`), not camelCase (`Six`, `Seven`). In `buildCurve`, `poolCreationFee` is denominated in SOL (not lamports); passing `0.001` converts to `1_000_000` lamports (`MIN_POOL_CREATION_FEE`). Passing `0` causes `DecimalError` in `convertToLamports`. When using `BaseFeeMode.FeeSchedulerLinear` with a flat fee schedule, `numberOfPeriod` and `totalDuration` must BOTH be 0, otherwise the SDK throws a validation error.

Real gotchas discovered while researching a pinned library or version mid-build go here
— a documented bug, a deprecated method, a non-obvious config requirement. These are
findings, not decisions, so they do not require the project owner's confirmation before
being logged. They must still be dated and attributed to the phase/group that surfaced
them. Format: `- [YYYY-MM-DD] Phase/Group: [library@version] — [issue] — [source/link] — [workaround applied].`
