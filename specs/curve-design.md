# Meteora Dynamic Bonding Curve Design & Justification — Divvy

## 1. Overview & Problem Formulation

Standard Solana memecoin launchpads use aggressive exponential bonding curves denominated in raw SOL. While this creates rapid initial pumps, it suffers from two structural flaws:
1. **Zero Long-term Retention**: When the curve exhausts or momentum stalls, holders have no fundamental cash flows or dividend incentive to hold.
2. **Quote Asset Mismatch**: SOL fluctuates independently of real-world equity valuations, preventing meme tokens from capturing or reflecting equity/stock beta.

Divvy introduces a deliberate **Stock-Paired Dynamic Bonding Curve** on Meteora DBC that bridges meme momentum with real tokenized asset dividend yield.

---

## 2. Asset Specification

| Parameter | Value | Rationale |
|---|---|---|
| **Base Token** | `DIV-MEME` ($DVY) | 6 decimals, 1,000,000,000 total supply. High unit-bias meme token designed for retail trading. |
| **Quote Asset** | `xSTOCK` (`A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM`) | 6 decimals. Devnet SPL token standing in for tokenized equity (e.g. xAAPL, Pre-IPO). |
| **Quote Pairing Rationale** | Stock-denominated | Denominating the curve directly in the dividend asset ensures 100% of trading fees accumulate directly in the asset distributed to holders, with zero DEX slippage or liquidation hops. |

---

## 3. Curve Shape Rationale

### The Linear-Exponential Transition Curve
Unlike purely exponential curves that penalize late buyers with extreme slippage, Divvy's DBC configuration utilizes a **Two-Stage Progressive Curve**:

1. **Discovery Stage (0% - 40% Curve Migration)**:
   - Moderately steep price discovery allowing early meme conviction to appreciate.
   - Low initial liquidity requirement enabling organic bootstrapping.
2. **Stabilization & Yield Stage (40% - 100% Curve Migration)**:
   - Flatter slope with deeper liquidity density.
   - Dampens excessive dump volatility and encourages continuous high-volume two-way trading (which directly maximizes fee throughput for dividend accrual).

### Why this fits an equity-backed memestock:
A stock-paired meme token is meant to be a high-velocity trading vehicle that yields underlying equity dividends. Deep liquidity with controlled price impact maximizes turnover, turning volume directly into vault dividends.

---

## 4. Fee Schedule Rationale

### Dynamic Fee Calibration
- **Base Trading Fee**: `1.50%` (150 bps)
- **Fee Routing Split**:
  - `60%` of trading fees -> Divvy Program Dividend Vault PDA (distributed pro-rata to holders).
  - `40%` of trading fees -> Liquidity growth and creator reserve.

### Why 150 bps Dynamic Base Fee:
- **Meme Tolerance**: Memestock traders routinely accept 1% to 2% swap fees on launchpads.
- **Yield Generation**: A 1.5% fee on $100k daily volume routes $900 daily in stock dividends directly to holders. This creates a tangible 10-30% APY in real stock assets for holding the meme.
- **Bot Resistance**: The fee structure discourages toxic micro-sandwich bots while maintaining healthy human and market-maker liquidity.

---

## 5. Verification & On-Chain Auditability

Every parameter configured in this document is translated directly into Meteora DBC curve initialization parameters and tracked in `tracked-addresses.json` on Solana devnet.
