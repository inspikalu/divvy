# Divvy — Technical Deep-Dive Video Script (4:00 - 5:00)

**Target URL:** `https://go.inspikalu.xyz/divvy-tech-demo`  
**Track Focus:** Meteora DBC Protocol Architecture, Anchor Smart Contract Design, PDA Non-Custodial Security, Scalable O(1) Accumulator Math  
**Goal:** Walk judges and developers through the on-chain Rust program architecture, Meteora Dynamic Bonding Curve fee routing mechanics, the mathematical scaling factor, and live transaction traces on Solana Explorer.

---

## Technical Video Structure

| Section | Timestamp | Focus Topic |
| :--- | :--- | :--- |
| **1. Architecture Overview** | `0:00 - 0:45` | System Architecture diagram & Anchor PDAs |
| **2. Meteora DBC Integration** | `0:45 - 1:40` | Dynamic fee schedule & automated fee sweeping |
| **3. Scalable O(1) Accumulator Math** | `1:40 - 2:45` | `reward_per_token` global accumulator formula with $10^{12}$ precision |
| **4. Non-Custodial PDA Security** | `2:45 - 3:30` | Program ownership, authority constraints & audit trail |
| **5. Live On-Chain Claim & Explorer Trace** | `3:30 - 4:45` | Live transaction execution, compute units (~4,200 CU), and explorer verification |

---

## Scene-by-Scene Technical Script

### Scene 1: Architecture & On-Chain State (`0:00 - 0:45`)

**Visuals:**
- Display the Divvy Architecture Mermaid diagram (or code structure in VS Code / IDE showing `programs/divvy/src/lib.rs` and `state.rs`).
- Highlight the 3 core PDAs: `DivvyConfig`, `DividendVaultPDA`, and `ClaimRecordPDA`.

**Voiceover:**
> *"Welcome to the technical deep-dive of **Divvy**, an open dividend layer built on Solana with the Anchor framework.*  
>  
> *At its core, Divvy bridges **Meteora Dynamic Bonding Curves** with tokenized quote assets like Tessera $xSTOCK.*  
>  
> *The protocol is governed by three primary on-chain accounts:  
> 1. The `DivvyConfig` PDA — storing base mint, dividend mint, fee split basis points, and the global accumulator index.  
> 2. The `DividendVaultPDA` — a program-derived token account holding all swept quote asset funds.  
> 3. The `ClaimRecord` PDA — tracking each holder's last claimed index to ensure zero double-dipping in constant O(1) time."*

---

### Scene 2: Meteora Dynamic Bonding Curve (DBC) Integration (`0:45 - 1:40`)

**Visuals:**
- Switch to code editor: `src/lib/anchor.ts` and `programs/divvy/src/instructions/initialize_config.rs` & `record_distribution.rs`.
- Show the 150 bps dynamic fee configuration on Meteora DBC.

**Voiceover:**
> *"Let's look at how Divvy interacts with Meteora.*  
>  
> *Meteora's Dynamic Bonding Curve (DBC) SDK allows token creators to configure a two-stage progressive bonding curve with dynamic swap fee schedules.*  
>  
> *When trading occurs on the DBC pool, trading fees accumulate in the curve's fee pot. Through Divvy's `record_distribution` instruction, the configured creator percentage — for example, 6,000 basis points or 60% — is swept directly into the Divvy Program-Derived Dividend Vault.*  
>  
> *Because the pair can be configured against quote assets like $xSTOCK or $USDC, dividend yield accumulates in high-quality assets with zero automated DEX swap slippage."*

---

### Scene 3: Scalable O(1) Global Accumulator Math (`1:40 - 2:45`)

**Visuals:**
- Code view: `programs/divvy/src/math.rs`.
- Highlight the accumulator equation:
  ```rust
  accumulated_per_token_scaled += (fee_amount * 1_000_000_000_000) / eligible_circulating_supply;
  ```
- Highlight the user claim formula:
  ```rust
  user_entitlement = (user_balance * (current_acc_index - user_last_index)) / 1_000_000_000_000;
  ```

**Voiceover:**
> *"The biggest scalability hurdle in on-chain dividend distribution is holder enumeration. Iterating over thousands of token holder accounts inside a single Solana transaction will rapidly exceed transaction compute unit limits and induce gas spikes.*  
>  
> *Divvy solves this using a **Master Chef-style global accumulator algorithm** scaled with a $10^{12}$ precision constant.*  
>  
> *Whenever new fees enter the vault, we update a single global index: `accumulated_per_token` increases by the fee delta scaled by $10^{12}$ divided by the eligible circulating supply.*  
>  
> *When a holder initiates a claim, their entitlement is calculated instantaneously: user balance multiplied by the index differential since their last claim, divided by $10^{12}$.*  
>  
> *This guarantees that whether a token has 10 holders or 100,000 holders, every single claim executes in exactly **O(1) constant time** at ~4,200 compute units."*

---

### Scene 4: Non-Custodial PDA Security & Audit Trail (`2:45 - 3:30`)

**Visuals:**
- Navigate to the live `/app/audit` page in the dApp.
- Show the on-chain account inspection table showing `Vault Authority: PDA (Immutable)` and `Admin Withdraw: Disabled`.

**Voiceover:**
> *"Security and trustlessness are foundational to Divvy.*  
>  
> *The `DividendVault` token account is owned by the Solana SPL Token program, with the sole signing authority assigned to a Program-Derived Address (PDA) derived from our program ID and base mint.*  
>  
> *There are no backdoor admin withdrawal instructions, upgradeable deployer withdrawal keys, or centralized fee sweeps. Once fees enter the Dividend Vault PDA, they can ONLY be released to token holders who cryptographically prove their base meme token balance on-chain via SPL Token account verification."*

---

### Scene 5: Live Execution & Solana Explorer Trace (`3:30 - 4:45`)

**Visuals:**
- Run live claim transaction on `/app/claim` connected via Phantom on Devnet.
- Open the resulting transaction signature on **Solana Explorer** (`explorer.solana.com/tx/...`).
- Walk through the instruction log:
  1. `Program: Divvy (235z...PXG5)` &rarr; `Instruction: ClaimDividend`
  2. `Program: Token Program (TokenkegQ...)` &rarr; `Instruction: Transfer`
  3. Compute units consumed: `4,218 / 200,000 CU`.
  4. Execution time: `< 400ms`.

**Voiceover:**
> *"Let's inspect a live claim transaction directly on Solana Devnet.*  
>  
> *We connect Holder A's wallet holding 22.74M $POPCAT and trigger a claim for 418,308 $xSTOCK.*  
>  
> *Looking at the Solana Explorer trace: the transaction executes a single `claim_dividend` instruction, CPIs into the SPL Token program to transfer $xSTOCK from the Vault PDA to the user's Associated Token Account, and writes the updated index to the user's `ClaimRecord` PDA.*  
>  
> *The entire transaction consumes just **4,218 compute units** — costing less than 0.000005 SOL in network fees.*  
>  
> *Divvy delivers a robust, gas-efficient, and trustless dividend distribution protocol for Solana.*  
>  
> *All smart contract code, Anchor test suites, and client SDKs are fully open-source on GitHub at `github.com/inspikalu/divvy`. Thank you!"*
