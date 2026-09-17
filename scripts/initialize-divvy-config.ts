/**
 * initialize-divvy-config.ts
 *
 * Initializes the DivvyConfig PDA and DividendVault token account PDA on Solana
 * devnet for the Phase 1 meme base mint. Calls the `initialize_config` instruction
 * on the deployed `divvy` Anchor program with fee_share_bps = 6000 (60%).
 *
 * NOTE: The dividend asset (`dividendMint`) is a devnet SPL token standing in for
 * a tokenized equity. This is a devnet stand-in only — not a real equity instrument.
 *
 * Run: npx tsx scripts/initialize-divvy-config.ts
 */

import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import fs from "fs";
import path from "path";

// ─── Constants ───────────────────────────────────────────────────────────────

const RPC_URL =
  process.env.SOLANA_RPC_URL ??
  "https://devnet.helius-rpc.com/?api-key=8dabc2e1-a043-4c0a-a675-52273c7ac948";

const PROGRAM_ID = new PublicKey("235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5");
const BASE_MINT = new PublicKey("3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4");
const DIVIDEND_MINT = new PublicKey("A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM");
const FEE_SHARE_BPS = 6000; // 60%

const DEPLOYER_KEYPAIR_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../keys/deployer.json"
);
const TRACKED_ADDRESSES_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../tracked-addresses.json"
);
const IDL_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../target/idl/divvy.json"
);

// ─── PDA Helpers ─────────────────────────────────────────────────────────────

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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Load deployer keypair
  const deployerSecret = JSON.parse(fs.readFileSync(DEPLOYER_KEYPAIR_PATH, "utf-8"));
  const deployerKeypair = Keypair.fromSecretKey(Uint8Array.from(deployerSecret));

  const connection = new Connection(RPC_URL, "confirmed");

  // Anchor wallet adapter
  const wallet = new anchor.Wallet(deployerKeypair);
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
    preflightCommitment: "confirmed",
  });

  // Load IDL
  const idl = JSON.parse(fs.readFileSync(IDL_PATH, "utf-8"));
  const program = new anchor.Program(idl, provider);

  // Derive PDAs
  const [configPDA, configBump] = deriveConfigPDA(BASE_MINT);
  const [vaultPDA] = deriveVaultPDA(BASE_MINT);
  const [vaultAuthorityPDA] = deriveVaultAuthorityPDA(BASE_MINT);

  console.log("=".repeat(60));
  console.log("Divvy Config Initialization");
  console.log("=".repeat(60));
  console.log("Program ID     :", PROGRAM_ID.toBase58());
  console.log("Base Mint      :", BASE_MINT.toBase58());
  console.log("Dividend Mint  :", DIVIDEND_MINT.toBase58());
  console.log("Fee Share BPS  :", FEE_SHARE_BPS, "(60%)");
  console.log("Config PDA     :", configPDA.toBase58(), `(bump ${configBump})`);
  console.log("Vault PDA      :", vaultPDA.toBase58());
  console.log("Vault Authority:", vaultAuthorityPDA.toBase58());
  console.log("Authority      :", deployerKeypair.publicKey.toBase58());
  console.log("RPC            :", RPC_URL);
  console.log("-".repeat(60));

  // Check if config already initialized
  const existingConfig = await connection.getAccountInfo(configPDA);
  if (existingConfig !== null) {
    console.log("Config PDA already exists — fetching state...");
    const configAccount = await (program.account as any).divvyConfig.fetch(configPDA);
    console.log("  authority      :", configAccount.authority.toBase58());
    console.log("  base_mint      :", configAccount.baseMint.toBase58());
    console.log("  dividend_mint  :", configAccount.dividendMint.toBase58());
    console.log("  fee_share_bps  :", configAccount.feeShareBps);
    console.log("Already initialized. Skipping transaction.");
    return await updateTrackedAddresses(configPDA, vaultPDA, vaultAuthorityPDA, null);
  }

  // Send initialize_config instruction
  console.log("Sending initialize_config transaction...");
  const tx = await (program.methods as any)
    .initializeConfig(FEE_SHARE_BPS)
    .accounts({
      authority: deployerKeypair.publicKey,
      baseMint: BASE_MINT,
      dividendMint: DIVIDEND_MINT,
      config: configPDA,
      dividendVault: vaultPDA,
      vaultAuthority: vaultAuthorityPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([deployerKeypair])
    .rpc({ commitment: "confirmed", skipPreflight: false });

  console.log("Transaction confirmed!");
  console.log("Signature:", tx);
  console.log(`Explorer : https://explorer.solana.com/tx/${tx}?cluster=devnet`);
  console.log("-".repeat(60));

  // Fetch and display initialized state
  const configAccount = await (program.account as any).divvyConfig.fetch(configPDA);
  console.log("On-chain DivvyConfig state:");
  console.log("  authority      :", configAccount.authority.toBase58());
  console.log("  base_mint      :", configAccount.baseMint.toBase58());
  console.log("  dividend_mint  :", configAccount.dividendMint.toBase58());
  console.log("  fee_share_bps  :", configAccount.feeShareBps);
  console.log(
    "  total_routed   :",
    configAccount.totalRoutedDividends.toString()
  );
  console.log("  bump           :", configAccount.bump);
  console.log("  vault_bump     :", configAccount.vaultBump);

  // Verify vault token account exists and authority is correct
  const vaultAccount = await connection.getAccountInfo(vaultPDA);
  if (vaultAccount === null) {
    throw new Error("VERIFY FAILED: Dividend vault token account not found after init");
  }
  console.log("Dividend vault token account verified on-chain ✓");

  await updateTrackedAddresses(configPDA, vaultPDA, vaultAuthorityPDA, tx);
}

async function updateTrackedAddresses(
  configPDA: PublicKey,
  vaultPDA: PublicKey,
  vaultAuthorityPDA: PublicKey,
  txSignature: string | null
) {
  const tracked = JSON.parse(fs.readFileSync(TRACKED_ADDRESSES_PATH, "utf-8"));

  tracked.divvyConfigPDA = configPDA.toBase58();
  tracked.divvyDividendVaultPDA = vaultPDA.toBase58();
  tracked.divvyVaultAuthorityPDA = vaultAuthorityPDA.toBase58();
  tracked.divvyFeeShareBps = FEE_SHARE_BPS;

  if (txSignature !== null) {
    tracked.divvyInitConfigSignature = txSignature;
    tracked.divvyInitConfigExplorerUrl = `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;
  }

  fs.writeFileSync(TRACKED_ADDRESSES_PATH, JSON.stringify(tracked, null, 2));
  console.log("-".repeat(60));
  console.log("tracked-addresses.json updated:");
  console.log("  divvyConfigPDA         :", configPDA.toBase58());
  console.log("  divvyDividendVaultPDA  :", vaultPDA.toBase58());
  console.log("  divvyVaultAuthorityPDA :", vaultAuthorityPDA.toBase58());
  if (txSignature) {
    console.log("  divvyInitConfigSignature:", txSignature);
  }
  console.log("=".repeat(60));
  console.log("Group 6 DONE ✓");
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
