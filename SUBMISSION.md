# Project Submission Details

## 1. Project Name
Divvy

## 2. Short Description
Hold the meme -> earn the stock. An open dividend layer on Solana that connects Meteora Dynamic Bonding Curves (DBC) with tokenized assets, routing trading fees directly into a program-owned vault for pro-rata dividend claims by token holders.

## 3. Full Description
Overview and Problem Statement:
Memecoins and memestocks on Solana suffer from a structural post-launch retention flaw: once initial momentum peaks, trading fees accrue exclusively to launchpads, liquidity pools, and creators while token holders are left with no fundamental cash flows or yield incentives to continue holding. Concurrently, tokenized equities and real-world assets (RWAs) exist on-chain but lack high-velocity organic trading mechanics and integration with retail-driven meme markets.

Divvy solves this by establishing a decentralized, automated dividend layer for Solana:
1. It enables any token created on Meteora DBC to opt in and configure an automated fee split.
2. A configurable share of continuous swap/trading fees is routed directly into a program-owned Dividend Vault PDA.
3. Token holders can connect their wallets, verify their accrued yields on-chain, and pull their pro-rata dividend share in a single transaction.

Key Architecture and How It Works:
- Stock-Paired Dynamic Bonding Curve (Meteora DBC): Configured with a two-stage progressive bonding curve and dynamic fee schedule (150 bps base fee). Paired against stock/yield-bearing quote assets (such as xSTOCK and tokenized equities) so that swap fees generate direct dividend yield without DEX slippage or liquidation hops.
- Automated Fee Routing and Global Accumulator: Trading fees from Meteora DBC are automatically swept into the Divvy program. Divvy uses an accumulated dividend per share scaling model (1e12 precision factor) to distribute rewards pro-rata without expensive iteration over holder lists.
- Trustless Pull-Based Claims: Token holders initiate pull claims on demand. The Anchor program calculates eligible dividend balances based on current eligible circulating supply and user balances, updating claimant tracking PDAs in constant O(1) time.
- Transparent On-Chain Verification: A Next.js and Tailwind dashboard provides real-time statistics on total fees routed, current vault balances, eligible circulating supply, and individual claimable amounts with direct Solana Explorer transaction verification.

Why It Matters:
Divvy transforms speculative meme tokens into yield-bearing productive assets, aligning long-term incentives between creators, traders, and holders while driving sustained liquidity and volume into Meteora Dynamic Bonding Curves and the Solana tokenized equity ecosystem.

## 4. GitHub Repository
https://github.com/inspikalu/divvy

## 5. Demo URL
https://go.inspikalu.xyz/divvy-demo

## 6. Pitch Video URL
https://go.inspikalu.xyz/divvy-pitch

## 7. Technical Video URL
https://go.inspikalu.xyz/divvy-tech-demo

## 8. Selected Sponsor Tracks
1. Meteora (Best Use of Meteora DBC)
2. Tessera (Best Use of Tessera, Pre-IPO stocks)
3. PreStocks (Best Use of PreStocks)
