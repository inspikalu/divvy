/**
 * migrate-config.ts
 *
 * One-time migration script: calls the `migrate_config` on-chain instruction
 * which uses Anchor's `realloc` to expand the DivvyConfig PDA from 124 bytes
 * (old layout, no cumulative_dividend_per_token) to 140 bytes (new layout).
 *
 * Run with:   npx tsx tests/migrate-config.ts
 */

import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, Idl } from '@coral-xyz/anchor';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import idl from '../src/lib/divvy-idl.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


async function main() {
  const RPC = 'https://devnet.helius-rpc.com/?api-key=8dabc2e1-a043-4c0a-a675-52273c7ac948';
  const conn = new Connection(RPC, 'confirmed');

  // Load deployer keypair (the authority on the DivvyConfig)
  const keyPath = path.resolve(__dirname, '../keys/deployer.json');
  const raw = JSON.parse(readFileSync(keyPath, 'utf-8'));
  const deployer = Keypair.fromSecretKey(Uint8Array.from(raw));

  console.log('Deployer pubkey:', deployer.publicKey.toBase58());

  const BASE_MINT = new PublicKey('3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4');
  const DIVVY_CONFIG_PDA = new PublicKey('AhWYbZeiyisCxjrgz4yZRf7sPN8Wx5SxgnpaLVwrwBY4');

  // Check current account size before migration
  const before = await conn.getAccountInfo(DIVVY_CONFIG_PDA);
  console.log('Config account size BEFORE migration:', before?.data.length ?? 'not found', 'bytes');

  if (before && before.data.length >= 140) {
    console.log('✅ Already migrated (size >= 140). Nothing to do.');
    return;
  }

  // Build transaction using Anchor
  const wallet = new Wallet(deployer);
  const provider = new AnchorProvider(conn, wallet, { commitment: 'confirmed' });
  const program = new Program(idl as Idl, provider);

  console.log('Calling migrate_config on-chain…');

  const ix = await (program.methods as any)
    .migrateConfig()
    .accounts({
      authority: deployer.publicKey,
      config: DIVVY_CONFIG_PDA,
      authorityBaseMint: BASE_MINT,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const rentExemptDiff = await conn.getMinimumBalanceForRentExemption(140) - (before?.lamports ?? 0);
  console.log('Rent lamports needed for 140 bytes:', rentExemptDiff);

  const tx = new Transaction();
  if (rentExemptDiff > 0) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: deployer.publicKey,
        toPubkey: DIVVY_CONFIG_PDA,
        lamports: rentExemptDiff,
      })
    );
  }
  tx.add(ix);
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash('confirmed');
  tx.recentBlockhash = blockhash;
  tx.feePayer = deployer.publicKey;

  const sig = await sendAndConfirmTransaction(conn, tx, [deployer], {
    commitment: 'confirmed',
  });

  console.log('✅ migrate_config succeeded!');
  console.log('   Signature:', sig);

  // Verify new size
  const after = await conn.getAccountInfo(DIVVY_CONFIG_PDA);
  console.log('Config account size AFTER migration:', after?.data.length ?? 'error', 'bytes');

  if (after && after.data.length >= 140) {
    const low = after.data.readBigUInt64LE(122);
    const high = after.data.readBigUInt64LE(130);
    const index = low + (high << BigInt(64));
    console.log('   cumulative_dividend_per_token:', index.toString());
    console.log('🎉 Migration complete! Claims will now work correctly.');
  }
}

main().catch((e) => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
