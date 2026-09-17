/**
 * claim-dbc-fees.ts
 *
 * Claims accrued creator trading fees from the Meteora DBC pool on devnet
 * into the deployer's dividend-mint token account.
 *
 * Run: npx tsx scripts/claim-dbc-fees.ts
 */

import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import BN from 'bn.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('--- Claiming DBC Creator Trading Fees (Phase 3 / Group 5) ---');

  const rootDir = process.cwd();
  const trackedPath = path.join(rootDir, 'tracked-addresses.json');
  const deployerKeyPath = path.join(rootDir, 'keys', 'deployer.json');

  if (!fs.existsSync(trackedPath)) {
    throw new Error(`tracked-addresses.json not found at ${trackedPath}`);
  }

  const tracked = JSON.parse(fs.readFileSync(trackedPath, 'utf8'));
  const deployerSecret = JSON.parse(fs.readFileSync(deployerKeyPath, 'utf8'));
  const deployerKeypair = Keypair.fromSecretKey(Uint8Array.from(deployerSecret));

  const rpcUrl =
    process.env.SOLANA_RPC_URL ||
    'https://devnet.helius-rpc.com/?api-key=8dabc2e1-a043-4c0a-a675-52273c7ac948';
  const connection = new Connection(rpcUrl, 'confirmed');

  const client = DynamicBondingCurveClient.create(connection, 'confirmed');
  const poolPubkey = new PublicKey(tracked.poolAddress);
  const deployerTokenAccountPubkey = new PublicKey(tracked.deployerTokenAccount);

  console.log(`Pool Address:           ${tracked.poolAddress}`);
  console.log(`Creator / Payer:        ${deployerKeypair.publicKey.toBase58()}`);
  console.log(`Fee Receiver ATA:       ${deployerTokenAccountPubkey.toBase58()}`);
  console.log(`Dividend Mint:          ${tracked.dividendMint}`);

  // Fetch initial token balance
  const initialAccount = await getAccount(connection, deployerTokenAccountPubkey);
  console.log(`Initial Deployer ATA Balance: ${initialAccount.amount.toString()} units`);

  // Max u64 for claiming all available fees
  const U64_MAX = new BN('18446744073709551615');

  console.log('\nBuilding claimCreatorTradingFee transaction...');
  const tx = await client.creator.claimCreatorTradingFee({
    creator: deployerKeypair.publicKey,
    payer: deployerKeypair.publicKey,
    pool: poolPubkey,
    maxBaseAmount: new BN(0),
    maxQuoteAmount: U64_MAX,
    receiver: deployerTokenAccountPubkey,
  });

  console.log('Sending transaction via Helius RPC...');
  const signature = await sendAndConfirmTransaction(connection, tx, [deployerKeypair], {
    commitment: 'confirmed',
  });

  console.log(`\nTransaction Confirmed!`);
  console.log(`Signature:    ${signature}`);
  console.log(`Explorer URL: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

  // Fetch updated balance
  const updatedAccount = await getAccount(connection, deployerTokenAccountPubkey);
  const claimedAmount = updatedAccount.amount - initialAccount.amount;
  console.log(`\nUpdated Deployer ATA Balance: ${updatedAccount.amount.toString()} units`);
  console.log(`Claimed Quote Fees:           ${claimedAmount.toString()} units`);

  // Update tracked addresses
  tracked.dbcFeeClaimSignature = signature;
  tracked.dbcFeeClaimExplorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
  tracked.dbcFeeClaimQuoteAmount = claimedAmount.toString();
  fs.writeFileSync(trackedPath, JSON.stringify(tracked, null, 2) + '\n', 'utf8');
  console.log('\nUpdated tracked-addresses.json with fee claim details.');
}

main().catch((err) => {
  console.error('Error claiming DBC fees:', err);
  process.exit(1);
});
