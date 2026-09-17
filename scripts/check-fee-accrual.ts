import { Connection } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import BN from 'bn.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('--- Checking Meteora DBC Pool Fee Accrual & Auditability (Phase 1 / Group 6) ---');

  const rootDir = process.cwd();
  const trackedPath = path.join(rootDir, 'tracked-addresses.json');

  if (!fs.existsSync(trackedPath)) {
    throw new Error(`tracked-addresses.json not found at ${trackedPath}`);
  }

  const tracked = JSON.parse(fs.readFileSync(trackedPath, 'utf8'));
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');

  const client = DynamicBondingCurveClient.create(connection, 'confirmed');

  const poolRaw = await client.state.getPool(tracked.poolAddress);
  if (!poolRaw) {
    throw new Error(`Pool ${tracked.poolAddress} not found on devnet`);
  }
  const pool = (poolRaw as any).poolState || poolRaw;

  const creatorQuoteFee = new BN(pool.creatorQuoteFee?.toString() || '0');
  const partnerQuoteFee = new BN(pool.partnerQuoteFee?.toString() || '0');
  const protocolQuoteFee = new BN(pool.protocolQuoteFee?.toString() || '0');
  const totalAccruedQuoteFee = creatorQuoteFee.add(partnerQuoteFee).add(protocolQuoteFee);

  const creatorBaseFee = new BN(pool.creatorBaseFee?.toString() || '0');
  const partnerBaseFee = new BN(pool.partnerBaseFee?.toString() || '0');
  const protocolBaseFee = new BN(pool.protocolBaseFee?.toString() || '0');
  const totalAccruedBaseFee = creatorBaseFee.add(partnerBaseFee).add(protocolBaseFee);

  console.log('\n--- Accrued Trading Fees (On-Chain Devnet) ---');
  console.log(`Pool Address:           ${tracked.poolAddress}`);
  console.log(`Quote Mint (Dividend):  ${tracked.dividendMint}`);
  console.log(`Creator Quote Fee:      ${creatorQuoteFee.toString()} atomic units (${creatorQuoteFee.toNumber() / 1e6} tokens)`);
  console.log(`Partner Quote Fee:      ${partnerQuoteFee.toString()} atomic units (${partnerQuoteFee.toNumber() / 1e6} tokens)`);
  console.log(`Protocol Quote Fee:     ${protocolQuoteFee.toString()} atomic units (${protocolQuoteFee.toNumber() / 1e6} tokens)`);
  console.log(`Total Quote Fee:        ${totalAccruedQuoteFee.toString()} atomic units (${totalAccruedQuoteFee.toNumber() / 1e6} tokens)`);
  console.log(`Accrued Quote Fee > 0:  ${!totalAccruedQuoteFee.isZero()}`);

  console.log('\n--- Auditability & Explorer Proofs ---');
  console.log(`Pool Explorer:          https://explorer.solana.com/address/${tracked.poolAddress}?cluster=devnet`);
  console.log(`Config Explorer:        https://explorer.solana.com/address/${tracked.configAddress}?cluster=devnet`);
  console.log(`Base Mint Explorer:     https://explorer.solana.com/address/${tracked.baseMint}?cluster=devnet`);
  console.log(`Quote Mint Explorer:    https://explorer.solana.com/address/${tracked.dividendMint}?cluster=devnet`);

  console.log('\nSwap Transactions:');
  const signatures = tracked.swapSignatures || [];
  signatures.forEach((swap: any, idx: number) => {
    console.log(`  [${idx + 1}] ${swap.type} (${swap.amountIn}) by ${swap.trader}`);
    console.log(`      Explorer: ${swap.explorerUrl}`);
  });

  if (totalAccruedQuoteFee.isZero()) {
    throw new Error('Verification failed: Total accrued quote fees are 0');
  }

  // Update tracked addresses with accrued fee snapshot
  tracked.accruedFeesSnapshot = {
    creatorQuoteFee: creatorQuoteFee.toString(),
    partnerQuoteFee: partnerQuoteFee.toString(),
    protocolQuoteFee: protocolQuoteFee.toString(),
    totalQuoteFee: totalAccruedQuoteFee.toString(),
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(trackedPath, JSON.stringify(tracked, null, 2) + '\n', 'utf8');

  console.log('\nStatus: AUDITABLE');
}

main().catch((err) => {
  console.error('Error during fee accrual check:', err);
  process.exit(1);
});
