# Resources — Divvy

External services, APIs, credentials, and accounts this project depends on.

**No actual secret values ever appear in this file, in any spec file, or in any
committed file in this repository.** Names and acquisition paths only.

## Required

### Solana devnet RPC
- **What:** cluster endpoint for all program deploys, transactions, and account reads.
- **Where:** public devnet endpoint `https://api.devnet.solana.com` — no account needed.
- **Status:** available.
- **Note:** aggressively rate-limited. Expect to hit limits during demo rehearsal.

### Helius devnet RPC *(fallback)*
- **What:** higher-rate-limit devnet RPC, used only if the public endpoint throttles.
- **Where:** free API key from a Helius dashboard account.
- **Secret:** API key. Lives in `.env.local` only, referenced as an env var.
- **Status:** not yet obtained. Get it before the demo rehearsal, not during.

### Meteora Dynamic Bonding Curve — devnet deployment
- **What:** the DBC program our fee routing sits on top of. This is the bounty's
  central technical dependency.
- **Where:** Meteora's published program IDs and SDK; developer docs and Discord.
- **Secret:** none.
- **Status: UNVERIFIED — highest-risk unknown in the project.** Whether DBC is deployed
  and usable on devnet, and with which program ID, must be confirmed as the first task
  of Phase 1 before anything is built against it. If it is not usable on devnet, this
  is a project-shaping blocker, not a task-level one: escalate immediately rather than
  working around it.

### Devnet wallets
- **What:** at minimum three keypairs — deployer/creator, holder A, holder B.
- **Where:** generated locally with `solana-keygen`.
- **Secret:** keypair JSON files. Stored outside the repo or in a gitignored directory.
  **Never committed.** Verify `.gitignore` covers them before the first commit.
- **Status:** to be created in Phase 0.

### Devnet SOL
- **What:** funds deploys and transactions.
- **Where:** `solana airdrop` and the web faucet.
- **Status:** rate-limited. Fund all wallets early in one pass.

### Dividend asset mint (devnet)
- **What:** an SPL mint we create, standing in for a tokenized equity. Also the DBC
  quote asset.
- **Where:** created by us via `spl-token create-token`.
- **Secret:** mint authority keypair — gitignored, never committed.
- **Status:** to be created in Phase 0. Record the mint address in the tracked
  addresses file.

## Explicitly Not Used

Listed so no future spec silently assumes access:

- **xStock / PreStock / Tessera** — no accounts, no credentials, no devnet integration.
  Referenced only as design intent in the README and pitch.
- **Pyth** — not integrated. See `tech-stack.md` ruled-out list.
- **Jupiter** — not integrated.
- **Mainnet RPC or mainnet funds** — not used in this build.
- **Any hosted database, backend, or analytics service** — none exists in this project.

## Deployment / Hosting

- **Frontend hosting:** not yet decided. Local `next dev` on the demo machine is
  acceptable for a live-judged demo. If a public URL is needed, Vercel free tier is the
  default choice — record it in `tech-stack.md`'s Change Log if adopted.

## Secret Handling Rule

All secrets live in `.env.local` (frontend) or in gitignored keypair files (on-chain).
`.env.example` is committed with variable **names and empty values** only. If any spec
or executor run needs a secret value, it asks the project owner — it never invents,
guesses, or commits one.
