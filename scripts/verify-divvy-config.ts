/**
 * verify-divvy-config.ts
 *
 * Queries devnet RPC to verify the on-chain DivvyConfig PDA and DividendVault
 * token account PDA are correctly initialized for the Phase 1 meme base mint.
 *
 * Run: npx tsx scripts/verify-divvy-config.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import fs from "fs";
import path from "path";

const RPC_URL =
  process.env.SOLANA_RPC_URL ??
  "https://devnet.helius-rpc.com/?api-key=8dabc2e1-a043-4c0a-a675-52273c7ac948";

const PROGRAM_ID = new PublicKey("235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5");
const BASE_MINT = new PublicKey("3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4");
const DIVIDEND_MINT = new PublicKey("A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM");
const EXPECTED_FEE_SHARE_BPS = 6000;
const EXPECTED_AUTHORITY = "BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34";

const IDL_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../target/idl/divvy.json"
);

function deriveConfigPDA(baseMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("config"), baseMint.toBuffer()],
    PROGRAM_ID
  );
}

function deriveVaultPDA(baseMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), baseMint.toBuffer()],
    PROGRAM_ID
  );
}

function deriveVaultAuthorityPDA(baseMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority"), baseMint.toBuffer()],
    PROGRAM_ID
  );
}

async function main() {
  const connection = new Connection(RPC_URL, "confirmed");

  // Read-only provider using a throw-away keypair
  const { Keypair } = await import("@solana/web3.js");
  const ephemeral = Keypair.generate();
  const readOnlyWallet = new anchor.Wallet(ephemeral);
  const provider = new anchor.AnchorProvider(connection, readOnlyWallet, {
    commitment: "confirmed",
  });

  const idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf-8"));
  const program = new anchor.Program(idl, provider);

  const [configPDA] = deriveConfigPDA(BASE_MINT);
  const [vaultPDA] = deriveVaultPDA(BASE_MINT);
  const [vaultAuthorityPDA] = deriveVaultAuthorityPDA(BASE_MINT);

  console.log("=".repeat(60));
  console.log("Divvy Config Verification");
  console.log("=".repeat(60));

  let failures = 0;

  // ── Verify DivvyConfig PDA ─────────────────────────────────────
  console.log("\n[1] DivvyConfig PDA:", configPDA.toBase58());
  let config: any;
  try {
    config = await (program.account as any).divvyConfig.fetch(configPDA);
  } catch {
    console.error("  FAIL: Could not fetch DivvyConfig account");
    process.exit(1);
  }

  const checks: Array<[string, string, string]> = [
    ["authority", config.authority.toBase58(), EXPECTED_AUTHORITY],
    ["base_mint", config.baseMint.toBase58(), BASE_MINT.toBase58()],
    ["dividend_mint", config.dividendMint.toBase58(), DIVIDEND_MINT.toBase58()],
    ["fee_share_bps", String(config.feeShareBps), String(EXPECTED_FEE_SHARE_BPS)],
    ["total_claimed_dividends", config.totalClaimedDividends.toString(), "0"],
  ];

  for (const [field, actual, expected] of checks) {
    const pass = actual === expected;
    const mark = pass ? "✓" : "✗";
    console.log(`  ${mark} ${field}: ${actual}${pass ? "" : ` (expected: ${expected})`}`);
    if (!pass) failures++;
  }
  console.log(`  ✓ total_routed_dividends: ${config.totalRoutedDividends.toString()}`);

  // ── Verify DividendVault token account ────────────────────────
  console.log("\n[2] DividendVault token account:", vaultPDA.toBase58());
  let vaultTokenAccount;
  try {
    vaultTokenAccount = await getAccount(connection, vaultPDA);
  } catch {
    console.error("  FAIL: Could not fetch DividendVault token account");
    failures++;
    vaultTokenAccount = null;
  }

  if (vaultTokenAccount) {
    const vaultChecks: Array<[string, string, string]> = [
      ["mint", vaultTokenAccount.mint.toBase58(), DIVIDEND_MINT.toBase58()],
      ["owner (vault_authority)", vaultTokenAccount.owner.toBase58(), vaultAuthorityPDA.toBase58()],
      ["balance matches routed total", vaultTokenAccount.amount.toString(), config.totalRoutedDividends.toString()],
    ];
    for (const [field, actual, expected] of vaultChecks) {
      const pass = actual === expected;
      const mark = pass ? "✓" : "✗";
      console.log(`  ${mark} ${field}: ${actual}${pass ? "" : ` (expected: ${expected})`}`);
      if (!pass) failures++;
    }
  }

  // ── Summary ────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  if (failures === 0) {
    console.log("Config Status: INITIALIZED ✓");
    console.log(`Vault Balance: ${vaultTokenAccount ? vaultTokenAccount.amount.toString() : '0'} ✓`);
    console.log("All checks passed.");
  } else {
    console.log(`VERIFY FAILED: ${failures} check(s) failed.`);
    process.exit(1);
  }
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
