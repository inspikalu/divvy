/**
 * route-fees.ts
 *
 * Calls the `route_fees` instruction on the deployed Divvy program on devnet,
 * transferring the configured fee share (60%) of claimed creator fees into
 * the program-owned Dividend Vault PDA token account.
 *
 * Run: npx tsx scripts/route-fees.ts
 */

import {
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('--- Routing Fees into Dividend Vault (Phase 3 / Group 6) ---');

  const rootDir = process.cwd();
  const trackedPath = path.join(rootDir, 'tracked-addresses.json');
  const deployerKeyPath = path.join(rootDir, 'keys', 'deployer.json');
  const idlPath = path.join(rootDir, 'target', 'idl', 'divvy.json');

  if (!fs.existsSync(trackedPath)) {
    throw new Error(`tracked-addresses.json not found at ${trackedPath}`);
  }
  if (!fs.existsSync(idlPath)) {
    throw new Error(`IDL not found at ${idlPath}`);
  }

  const tracked = JSON.parse(fs.readFileSync(trackedPath, 'utf8'));
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const deployerSecret = JSON.parse(fs.readFileSync(deployerKeyPath, 'utf8'));
  const deployerKeypair = Keypair.fromSecretKey(Uint8Array.from(deployerSecret));

  const rpcUrl =
    process.env.SOLANA_RPC_URL ||
    'https://devnet.helius-rpc.com/?api-key=8dabc2e1-a043-4c0a-a675-52273c7ac948';
  const connection = new Connection(rpcUrl, 'confirmed');

  const wallet = new Wallet(deployerKeypair);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });
  const program = new Program(idl, provider);

  const configPubkey = new PublicKey(tracked.divvyConfigPDA);
  const vaultPubkey = new PublicKey(tracked.divvyDividendVaultPDA);
  const vaultAuthorityPubkey = new PublicKey(tracked.divvyVaultAuthorityPDA);
  const deployerTokenAccountPubkey = new PublicKey(tracked.deployerTokenAccount);
  const dividendMintPubkey = new PublicKey(tracked.dividendMint);

  // Amount to route: use the claimed fee amount (1,996,812 atomic units)
  const grossFeeAmount = new BN(tracked.dbcFeeClaimQuoteAmount || '1996812');
  const feeShareBps = tracked.divvyFeeShareBps || 6000;
  const expectedVaultShare = grossFeeAmount.muln(feeShareBps).divn(10000);

  console.log(`Program ID:             ${program.programId.toBase58()}`);
  console.log(`Config PDA:             ${configPubkey.toBase58()}`);
  console.log(`Dividend Vault PDA:     ${vaultPubkey.toBase58()}`);
  console.log(`Vault Authority PDA:    ${vaultAuthorityPubkey.toBase58()}`);
  console.log(`Creator Token Account:  ${deployerTokenAccountPubkey.toBase58()}`);
  console.log(`Gross Fee Amount:       ${grossFeeAmount.toString()} units`);
  console.log(`Fee Share BPS:          ${feeShareBps} (60%)`);
  console.log(`Expected Vault Share:   ${expectedVaultShare.toString()} units`);

  // Fetch initial vault balance
  const initialVaultAccount = await getAccount(connection, vaultPubkey);
  console.log(`Initial Vault Balance:  ${initialVaultAccount.amount.toString()} units`);

  console.log('\nSending route_fees transaction to devnet...');
  const txSignature = await (program.methods as any)
    .routeFees(grossFeeAmount)
    .accounts({
      authority: deployerKeypair.publicKey,
      config: configPubkey,
      creatorTokenAccount: deployerTokenAccountPubkey,
      dividendVault: vaultPubkey,
      vaultAuthority: vaultAuthorityPubkey,
      dividendMint: dividendMintPubkey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([deployerKeypair])
    .rpc({ commitment: 'confirmed' });

  console.log('\nTransaction Confirmed!');
  console.log(`Signature:    ${txSignature}`);
  console.log(`Explorer URL: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`);

  // Fetch updated vault balance & config state
  const updatedVaultAccount = await getAccount(connection, vaultPubkey);
  const configAccount = await (program.account as any).divvyConfig.fetch(configPubkey);

  console.log(`\nUpdated Vault Balance:   ${updatedVaultAccount.amount.toString()} units`);
  console.log(`Total Routed Dividends:  ${configAccount.totalRoutedDividends.toString()} units`);

  // Update tracked addresses
  tracked.routeFeesSignature = txSignature;
  tracked.routeFeesExplorerUrl = `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;
  tracked.vaultBalanceAfterRouting = updatedVaultAccount.amount.toString();
  tracked.totalRoutedDividends = configAccount.totalRoutedDividends.toString();

  fs.writeFileSync(trackedPath, JSON.stringify(tracked, null, 2) + '\n', 'utf8');
  console.log('\nUpdated tracked-addresses.json with route_fees transaction details.');
}

main().catch((err) => {
  console.error('Error routing fees:', err);
  process.exit(1);
});
