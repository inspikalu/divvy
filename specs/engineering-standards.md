# Engineering Standards — Divvy

**Mandatory. Read in full by every future feature-spec run and every executor run.**
These are the hard rules for this project, calibrated to a sub-48-hour hackathon build
on devnet.

## 1. Mocks, Stubs, and Placeholder Data

**Default: forbidden.** Silence means not allowed.

The single permitted substitution, and its exact boundary:

- **PERMITTED:** the dividend asset may be a devnet SPL token we mint ourselves,
  standing in for a tokenized equity. It must be a real mint, really held by the vault,
  really transferred by the claim instruction. The dashboard and the demo script must
  both state plainly that this is a devnet stand-in for a tokenized equity.
- **PERMITTED:** seeding trading activity with our own wallets to generate fees. The
  swaps must be real swaps producing real fees — we are staging the *activity*, not
  faking the *fees*.

Everything else is forbidden, specifically including:

- **FORBIDDEN:** any dashboard number that is not read from chain. No hardcoded APY, no
  hardcoded vault balance, no hardcoded fee total, no placeholder claimable amount.
- **FORBIDDEN:** a claim button that does anything other than send a real transaction.
- **FORBIDDEN:** stubbing the fee-routing path — e.g. transferring tokens into the vault
  from a script to make the dashboard look populated, while the DBC fee route is not
  actually wired. This is the core claim of the submission; faking it is fatal.
- **FORBIDDEN:** `TODO`, `unimplemented!()`, or a silently-returning empty function on
  any path the demo touches.

If a required integration turns out to be impossible on devnet, the response is to
**report BLOCKED and escalate**, never to stub it and continue.

## 2. Debug Logging

- No `console.log`, `println!`, `dbg!`, or equivalent left in committed code.
- Exception: Anchor `msg!()` calls that are deliberate, permanent program logs — e.g.
  logging a routed fee amount or a claim amount. These are a feature (they show up in
  the explorer during the demo). They must be intentional and named as such in the
  spec, not leftovers.
- Frontend `console.error` inside a `catch` block that surfaces a real failure is
  permitted. Everything else comes out before commit.

## 3. Definition of Done (hackathon, 48h, devnet)

**A feature is done when it runs live, end-to-end, against devnet, from a clean start.**

- The demo path defined in `mission.md` RD-5 must work every time, not most times. A
  flow that works once and then fails on retry is **not done**.
- Favor a working demo path over edge-case coverage. Do not spend time on error states
  the demo will never hit.
- **But the demo path itself must be real.** Depth on the happy path beats breadth
  across half-built paths.
- Automated tests are **not** required for every acceptance criterion. Required only
  for the on-chain program's core math: fee-share calculation and pro-rata claim
  calculation. These are the two places where a silent bug produces wrong numbers in
  front of judges. `anchor test` must pass for these before the Merge Gate.
- Everything else is verified by a **manual walkthrough of the real user flow**,
  performed and recorded as passing before the phase is closed.

## 4. What Counts as a Passing Verify Step

Every Verify bullet in every future `plan.md` must be **either**:

- a **literal command** plus the **exact expected output**, e.g.
  `anchor test` → `4 passing`; or
  `solana account <VAULT_PDA> --url devnet` → `Balance: 0.00203928 SOL`, token amount `> 0`
- **or**, where no command exists, the **literal manual steps** plus the **exact
  expected screen state**, e.g.
  "Connect wallet B → dashboard 'Claimable' shows a value greater than 0 → click Claim
  → wallet prompts → after confirmation, 'Claimable' shows 0 and 'Claimed to date'
  shows the previous claimable value; the transaction signature appears as a link."

Vague verifies — "confirm it works", "check the vault updates", "ensure the UI looks
right" — are **invalid**. A spec containing one must be rewritten before it is
accepted. This rule does not relax under deadline pressure; it is what prevents
discovering at hour 46 that a phase marked done never worked.

Every Verify step involving on-chain state must produce an **explorer-openable
identifier** (transaction signature or account address). Judges will ask.

## 5. Rollback Policy on Unrecoverable Verify Failure

**Default applies: revert.**

On an unrecoverable Verify failure, the executor reverts the failing group's changes
back to the last passing group's committed state (`git checkout -- .`, or
`git reset --hard <last-good-commit>`) and reports **BLOCKED against a clean tree**.

Corollary, given the deadline: **commit at every passing group boundary.** A clean,
working commit at each group boundary is what makes this policy cheap instead of
catastrophic. An executor that goes three groups without committing has made the
rollback policy unusable and is in violation of these standards.

Deployed on-chain program state is not covered by `git`. If a revert makes the deployed
program inconsistent with the reverted code, the BLOCKED report must say so explicitly
and name the deployed program ID.

## 6. Devnet-Specific Rules

- Program IDs, mint addresses, vault PDAs, and the demo wallet addresses must be
  recorded in a single tracked file as they are created. Re-deriving them from memory
  at demo time is a known way to lose a hackathon.
- Never commit a keypair file or a private key. See `resources.md`.
- Devnet airdrops are rate-limited. Fund the demo wallets early, in one pass, and don't
  architect anything that assumes airdrop-on-demand works.
- Devnet state can be reset or wiped by the cluster. The demo must be reproducible from
  a documented script — if devnet state is lost at hour 40, the recovery path must be
  "run the setup script", not "rebuild by hand".

## 7. Scope Discipline

- Any acceptance criterion that does not trace to a Core User Story or an approved
  Stretch Goal in `mission.md` is scope creep. **Flag it; do not build it.**
- Stretch goals (SG-1 loyalty multiplier, SG-2 leaderboard) are gated on the core
  Merge Gate passing. Starting a stretch goal before that gate passes is a violation.
- Under this deadline, the most expensive failure mode is a half-finished second
  feature instead of one finished first feature. When in doubt, finish.

## 8. Standards-Amendment Protocol

This file is not frozen forever, but it is never silently edited mid-build.

If the same class of blocker, tech-stack gap, or research finding recurs across two or
more feature specs, the executor **proposes** an addition here — it does not make one.
See the executor prompt's "Recurring Pattern Check."

## Amendment History

*No entries yet.*

Format: `- [YYYY-MM-DD] Proposed: [X] (seen in specs A, B). Decision: accepted/rejected — [reasoning].`
