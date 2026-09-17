import { Connection } from '@solana/web3.js';
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('--- Verifying Meteora DBC Pool State on Devnet (Phase 1 / Group 4) ---');

  const rootDir = process.cwd();
  const trackedPath = path.join(rootDir, 'tracked-addresses.json');

  if (!fs.existsSync(trackedPath)) {
    throw new Error(`tracked-addresses.json not found at ${trackedPath}`);
  }

  const tracked = JSON.parse(fs.readFileSync(trackedPath, 'utf8'));
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');

  console.log(`Querying pool at: ${tracked.poolAddress}`);
  console.log(`Querying config at: ${tracked.configAddress}`);

  const client = DynamicBondingCurveClient.create(connection, 'confirmed');

  const poolRaw = await client.state.getPool(tracked.poolAddress);
  if (!poolRaw) {
    throw new Error(`Pool account ${tracked.poolAddress} does not exist on devnet`);
  }
  const pool = (poolRaw as any).poolState || poolRaw;

  const configRaw = await client.state.getPoolConfig(tracked.configAddress);
  if (!configRaw) {
    throw new Error(`Config account ${tracked.configAddress} does not exist on devnet`);
  }
  const config = (configRaw as any).poolConfig || configRaw;

  console.log('\n--- On-Chain Pool Verification Details ---');
  console.log(`Pool Address:       ${tracked.poolAddress}`);
  console.log(`Base Mint:          ${pool.baseMint.toBase58()}`);
  console.log(`Expected Base Mint: ${tracked.baseMint}`);
  console.log(`Quote Mint:         ${config.quoteMint.toBase58()}`);
  console.log(`Expected Quote:     ${tracked.dividendMint}`);
  console.log(`Creator:            ${pool.creator.toBase58()}`);
  console.log(`Base Vault:         ${pool.baseVault.toBase58()}`);
  console.log(`Quote Vault:        ${pool.quoteVault.toBase58()}`);
  console.log(`Base Reserve:       ${pool.baseReserve.toString()} atomic units`);
  console.log(`Quote Reserve:      ${pool.quoteReserve.toString()} atomic units`);
  console.log(`Creator Fee %:      ${config.creatorTradingFeePercentage}%`);

  // Assertions
  if (pool.baseMint.toBase58() !== tracked.baseMint) {
    throw new Error(`Base mint mismatch! On-chain: ${pool.baseMint.toBase58()}, tracked: ${tracked.baseMint}`);
  }
  if (config.quoteMint.toBase58() !== tracked.dividendMint) {
    throw new Error(`Quote mint mismatch! On-chain: ${config.quoteMint.toBase58()}, tracked: ${tracked.dividendMint}`);
  }

  const isMigrated = pool.isMigrated === 1 || pool.isMigrated === true;
  const poolStatus = isMigrated ? 'MIGRATED' : 'ACTIVE';

  console.log(`\nPool status: ${poolStatus}`);
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
