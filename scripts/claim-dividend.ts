/**
 * claim-dividend.ts
 *
 * Executes pro-rata dividend claim for Holder A or Holder B on Solana devnet.
 *
 * Usage:
 *   npx tsx scripts/claim-dividend.ts --holder holderA
 *   npx tsx scripts/claim-dividend.ts --holder holderB
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  getAccount,
} from '@solana/spl-token';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const holderArgIndex = args.indexOf('--holder');
  const holderName = holderArgIndex !== -1 ? args[holderArgIndex + 1] : 'holderA';

  if (!['holderA', 'holderB'].includes(holderName)) {
    throw new Error(`Invalid holder: ${holderName}. Must be holderA or holderB.`);
  }

  console.log(`--- Executing Dividend Claim on Devnet for ${holderName} (Phase 4) ---`);

  const rootDir = process.cwd();
  const trackedPath = path.join(rootDir, 'tracked-addresses.json');
  const idlPath = path.join(rootDir, 'target', 'idl', 'divvy.json');
  const keyFileName = holderName === 'holderA' ? 'holder-a.json' : 'holder-b.json';
  const holderKeyPath = path.join(rootDir, 'keys', keyFileName);

  if (!fs.existsSync(trackedPath)) {
    throw new Error(`tracked-addresses.json not found at ${trackedPath}`);
  }
  if (!fs.existsSync(idlPath)) {
    throw new Error(`IDL not found at ${idlPath}`);
  }
  if (!fs.existsSync(holderKeyPath)) {
    throw new Error(`Holder keypair not found at ${holderKeyPath}`);
  }

  const tracked = JSON.parse(fs.readFileSync(trackedPath, 'utf8'));
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const holderSecret = JSON.parse(fs.readFileSync(holderKeyPath, 'utf8'));
  const holderKeypair = Keypair.fromSecretKey(Uint8Array.from(holderSecret));

  const rpcUrl =
    process.env.SOLANA_RPC_URL ||
    'https://devnet.helius-rpc.com/?api-key=8dabc2e1-a043-4c0a-a675-52273c7ac948';
  const connection = new Connection(rpcUrl, 'confirmed');

  const wallet = new Wallet(holderKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });
  const program = new Program(idl, provider);

  const baseMintPubkey = new PublicKey(tracked.baseMint);
  const dividendMintPubkey = new PublicKey(tracked.dividendMint);
  const configPubkey = new PublicKey(tracked.divvyConfigPDA);
  const vaultPubkey = new PublicKey(tracked.divvyDividendVaultPDA);
  const vaultAuthorityPubkey = new PublicKey(tracked.divvyVaultAuthorityPDA);

  // Get or create associated token accounts for base mint and dividend mint
  console.log('Ensuring holder Associated Token Accounts exist...');
  const holderBaseAta = await getOrCreateAssociatedTokenAccount(
    connection,
    holderKeypair,
    baseMintPubkey,
    holderKeypair.publicKey
  );
  const holderDivAta = await getOrCreateAssociatedTokenAccount(
    connection,
    holderKeypair,
    dividendMintPubkey,
    holderKeypair.publicKey
  );

  console.log(`Holder Pubkey:         ${holderKeypair.publicKey.toBase58()}`);
  console.log(`Holder Base ATA:       ${holderBaseAta.address.toBase58()}`);
  console.log(`Holder Base Balance:   ${holderBaseAta.amount.toString()} units`);
  console.log(`Holder Dividend ATA:   ${holderDivAta.address.toBase58()}`);
  console.log(`Initial Div Balance:   ${holderDivAta.amount.toString()} units`);

  // Query Holder A and Holder B balances to calculate live eligible circulating supply
  const holderAPubkey = new PublicKey(tracked.wallets.holderA);
  const holderBPubkey = new PublicKey(tracked.wallets.holderB);

  const holderAKeyPath = path.join(rootDir, 'keys', 'holder-a.json');
  const holderASecret = JSON.parse(fs.readFileSync(holderAKeyPath, 'utf8'));
  const holderAKeypair = Keypair.fromSecretKey(Uint8Array.from(holderASecret));

  const holderBKeyPath = path.join(rootDir, 'keys', 'holder-b.json');
  const holderBSecret = JSON.parse(fs.readFileSync(holderBKeyPath, 'utf8'));
  const holderBKeypair = Keypair.fromSecretKey(Uint8Array.from(holderBSecret));

  const ataA = await getOrCreateAssociatedTokenAccount(connection, holderKeypair, baseMintPubkey, holderAPubkey);
  const ataB = await getOrCreateAssociatedTokenAccount(connection, holderKeypair, baseMintPubkey, holderBPubkey);

  const balanceA = ataA.amount;
  const balanceB = ataB.amount;
  const eligibleSupply = balanceA + balanceB;

  console.log(`\nCirculating Supply Breakdown:`);
  console.log(`  Holder A:            ${balanceA.toString()} units`);
  console.log(`  Holder B:            ${balanceB.toString()} units`);
  console.log(`  Eligible Denominator:${eligibleSupply.toString()} units`);

  // Derive ClaimRecord PDA
  const [claimRecordPda, bump] = PublicKey.findProgramAddressSync(
    [Buffer.from('claim'), baseMintPubkey.toBuffer(), holderKeypair.publicKey.toBuffer()],
    program.programId
  );
  console.log(`\nClaimRecord PDA:       ${claimRecordPda.toBase58()} (bump: ${bump})`);

  console.log('\nSending claim transaction to devnet...');
  const txSignature = await (program.methods as any)
    .claim(new BN(eligibleSupply.toString()))
    .accounts({
      holder: holderKeypair.publicKey,
      config: configPubkey,
      holderBaseTokenAccount: holderBaseAta.address,
      holderDividendTokenAccount: holderDivAta.address,
      dividendVault: vaultPubkey,
      vaultAuthority: vaultAuthorityPubkey,
      claimRecord: claimRecordPda,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .signers([holderKeypair])
    .rpc({ commitment: 'confirmed' });

  console.log('\nClaim Confirmed!');
  console.log(`Signature:    ${txSignature}`);
  console.log(`Explorer URL: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);

  // Fetch updated balances
  const updatedDivAccount = await getAccount(connection, holderDivAta.address);
  const claimedAmount = updatedDivAccount.amount - holderDivAta.amount;
  console.log(`\nUpdated Dividend Balance: ${updatedDivAccount.amount.toString()} units`);
  console.log(`Claimed Amount:           ${claimedAmount.toString()} units`);

  // Update tracked addresses
  if (holderName === 'holderA') {
    tracked.holderAClaimSignature = txSignature;
    tracked.holderAClaimExplorerUrl = `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;
    tracked.holderAClaimAmount = claimedAmount.toString();
    tracked.holderAClaimRecordPDA = claimRecordPda.toBase58();
  } else {
    tracked.holderBClaimSignature = txSignature;
    tracked.holderBClaimExplorerUrl = `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;
    tracked.holderBClaimAmount = claimedAmount.toString();
    tracked.holderBClaimRecordPDA = claimRecordPda.toBase58();
  }

  fs.writeFileSync(trackedPath, JSON.stringify(tracked, null, 2) + '\n', 'utf8');
  console.log('\nUpdated tracked-addresses.json with claim details.');
}

main().catch((err) => {
  console.error('Error during dividend claim:', err);
  process.exit(1);
});
