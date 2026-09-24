/**
 * tests/frontend-rpc-reads.ts
 * Group 2 verification: tests all on-chain RPC reads and PDA derivations
 * Run: npx tsx tests/frontend-rpc-reads.ts
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';

import { createRequire } from 'module';
import { config as loadEnv } from 'dotenv';
// Load .env.local so HELIUS_API_KEY is available without polluting source
loadEnv({ path: new URL('../.env.local', import.meta.url).pathname });

const heliusKey = process.env.HELIUS_API_KEY;
const HELIUS_RPC = heliusKey
  ? `https://devnet.helius-rpc.com/?api-key=${heliusKey}`
  : 'https://api.devnet.solana.com';

const DIVVY_PROGRAM_ID = new PublicKey('235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5');
const BASE_MINT = new PublicKey('3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4');
const DIVIDEND_MINT = new PublicKey('A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM');
const DIVVY_CONFIG_PDA = new PublicKey('AhWYbZeiyisCxjrgz4yZRf7sPN8Wx5SxgnpaLVwrwBY4');
const DIVIDEND_VAULT_PDA = new PublicKey('GjXC4iEAh7tqL7MqhY7cpF7Wvdfpa2LBMEL7anwty3Mw');
const HOLDER_A = new PublicKey('6mnoXCKnXW9Pt99LYYUrSBUnyWbTGfMyn2ZDsXRwdQFm');
const HOLDER_B = new PublicKey('DcG8Jv9ZszLDwhYsMKFAKeGv7BNfyaYybMGL34o6GM8r');
const HOLDER_A_CLAIM_RECORD_PDA = new PublicKey('3qyhnc6t85foaN7ivpsQLAN4Kiot2guoW9AyES8Ykqqk');
const HOLDER_B_CLAIM_RECORD_PDA = new PublicKey('ARxeKkifjBd8o9vT3xQ9SmQBqoWz1SwvN9fHJxR8LS75');

// Import IDL
const require = createRequire(import.meta.url);
const idl = require('../src/lib/divvy-idl.json');

// PDA derivation helpers (mirroring src/lib/anchor.ts)
function getConfigPda(baseMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('config'), baseMint.toBuffer()],
    DIVVY_PROGRAM_ID
  );
}

function getVaultPda(baseMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), baseMint.toBuffer()],
    DIVVY_PROGRAM_ID
  );
}

function getVaultAuthorityPda(baseMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority'), baseMint.toBuffer()],
    DIVVY_PROGRAM_ID
  );
}

function getClaimRecordPda(baseMint: PublicKey, holder: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('claim'), baseMint.toBuffer(), holder.toBuffer()],
    DIVVY_PROGRAM_ID
  );
}

function calculateProRataShare(vault: bigint, holder: bigint, eligible: bigint): bigint {
  if (eligible === 0n || holder === 0n || vault === 0n) return 0n;
  return (vault * holder) / eligible;
}

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, details: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${label} — ${details}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label} — ${details}`);
    failed++;
  }
}

async function main() {
  console.log('\n=== Divvy Frontend RPC Reads Test ===\n');

  const connection = new Connection(HELIUS_RPC, 'confirmed');

  // Test 1: PDA Derivation
  console.log('--- Test 1: PDA Derivation ---');
  const [configPda] = getConfigPda(BASE_MINT);
  assert('Config PDA', configPda.equals(DIVVY_CONFIG_PDA),
    `derived=${configPda.toBase58()}, expected=${DIVVY_CONFIG_PDA.toBase58()}`);

  const [vaultPda] = getVaultPda(BASE_MINT);
  assert('Vault PDA', vaultPda.equals(DIVIDEND_VAULT_PDA),
    `derived=${vaultPda.toBase58()}, expected=${DIVIDEND_VAULT_PDA.toBase58()}`);

  const [claimRecordA] = getClaimRecordPda(BASE_MINT, HOLDER_A);
  assert('ClaimRecord PDA — Holder A', claimRecordA.equals(HOLDER_A_CLAIM_RECORD_PDA),
    `derived=${claimRecordA.toBase58()}`);

  const [claimRecordB] = getClaimRecordPda(BASE_MINT, HOLDER_B);
  assert('ClaimRecord PDA — Holder B', claimRecordB.equals(HOLDER_B_CLAIM_RECORD_PDA),
    `derived=${claimRecordB.toBase58()}`);

  // Test 2: DivvyConfig on-chain account
  console.log('\n--- Test 2: DivvyConfig On-Chain ---');
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  };
  const provider = new AnchorProvider(connection, dummyWallet as any, { commitment: 'confirmed' });
  const program = new Program(idl as Idl, provider);

  let configAccount: any = null;
  try {
    configAccount = await (program.account as any).divvyConfig.fetchNullable(DIVVY_CONFIG_PDA);
  } catch {
    const info = await connection.getAccountInfo(DIVVY_CONFIG_PDA);
    if (info && info.data && info.data.length >= 124) {
      const buf = info.data;
      configAccount = {
        authority: new PublicKey(buf.subarray(8, 40)),
        baseMint: new PublicKey(buf.subarray(40, 72)),
        dividendMint: new PublicKey(buf.subarray(72, 104)),
        feeShareBps: buf.readUInt16LE(104),
        totalRoutedDividends: buf.readBigUInt64LE(106),
        totalClaimedDividends: buf.readBigUInt64LE(114),
      };
    }
  }

  assert('DivvyConfig loaded', configAccount !== null, `account=${DIVVY_CONFIG_PDA.toBase58()}`);
  if (configAccount) {
    assert('feeShareBps = 6000', configAccount.feeShareBps === 6000, `got=${configAccount.feeShareBps}`);
    assert('totalRoutedDividends > 0', Number(configAccount.totalRoutedDividends) > 0,
      `got=${configAccount.totalRoutedDividends.toString()}`);
    assert('totalClaimedDividends > 0', Number(configAccount.totalClaimedDividends) > 0,
      `got=${configAccount.totalClaimedDividends.toString()}`);
    console.log(`    totalRoutedDividends: ${configAccount.totalRoutedDividends.toString()} atomic units`);
    console.log(`    totalClaimedDividends: ${configAccount.totalClaimedDividends.toString()} atomic units`);
  }

  // Test 3: DividendVault SPL token balance
  console.log('\n--- Test 3: DividendVault Balance ---');
  let vaultBalance = 0n;
  try {
    const vaultBalanceResp = await connection.getTokenAccountBalance(DIVIDEND_VAULT_PDA);
    vaultBalance = BigInt(vaultBalanceResp.value.amount);
    console.log(`    DividendVault balance: ${vaultBalanceResp.value.uiAmountString} xSTOCK`);
    // Vault may have remaining dust after claims
    assert('DividendVault balance readable', true, `balance=${vaultBalance.toString()} atomic`);
  } catch (err: any) {
    assert('DividendVault balance readable', false, `error: ${err.message}`);
  }

  // Test 4: Holder A token balances
  console.log('\n--- Test 4: Holder A Token Balances ---');
  const { getAssociatedTokenAddressSync } = await import('@solana/spl-token');
  const holderABaseAta = getAssociatedTokenAddressSync(BASE_MINT, HOLDER_A);
  const holderADivAta = getAssociatedTokenAddressSync(DIVIDEND_MINT, HOLDER_A);

  let holderABaseBalance = 0n;
  let holderADivBalance = 0n;

  try {
    const r = await connection.getTokenAccountBalance(holderABaseAta);
    holderABaseBalance = BigInt(r.value.amount);
    console.log(`    Holder A Base balance: ${r.value.uiAmountString}`);
    assert('Holder A base balance > 0', holderABaseBalance > 0n, `balance=${holderABaseBalance}`);
  } catch (err: any) {
    assert('Holder A base balance readable', false, `error: ${err.message}`);
  }

  try {
    const r = await connection.getTokenAccountBalance(holderADivAta);
    holderADivBalance = BigInt(r.value.amount);
    console.log(`    Holder A Dividend balance: ${r.value.uiAmountString} xSTOCK`);
    assert('Holder A dividend balance > 0', holderADivBalance > 0n, `balance=${holderADivBalance}`);
  } catch (err: any) {
    assert('Holder A dividend balance readable', false, `error: ${err.message}`);
  }

  // Test 5: Holder B token balances
  console.log('\n--- Test 5: Holder B Token Balances ---');
  const holderBBaseAta = getAssociatedTokenAddressSync(BASE_MINT, HOLDER_B);
  const holderBDivAta = getAssociatedTokenAddressSync(DIVIDEND_MINT, HOLDER_B);

  let holderBBaseBalance = 0n;
  let holderBDivBalance = 0n;

  try {
    const r = await connection.getTokenAccountBalance(holderBBaseAta);
    holderBBaseBalance = BigInt(r.value.amount);
    console.log(`    Holder B Base balance: ${r.value.uiAmountString}`);
    assert('Holder B base balance > 0', holderBBaseBalance > 0n, `balance=${holderBBaseBalance}`);
  } catch (err: any) {
    assert('Holder B base balance readable', false, `error: ${err.message}`);
  }

  try {
    const r = await connection.getTokenAccountBalance(holderBDivAta);
    holderBDivBalance = BigInt(r.value.amount);
    console.log(`    Holder B Dividend balance: ${r.value.uiAmountString} xSTOCK`);
    assert('Holder B dividend balance > 0', holderBDivBalance > 0n, `balance=${holderBDivBalance}`);
  } catch (err: any) {
    assert('Holder B dividend balance readable', false, `error: ${err.message}`);
  }

  // Test 6: ClaimRecord PDAs
  console.log('\n--- Test 6: ClaimRecord PDAs On-Chain ---');
  async function fetchClaimRecord(pda: PublicKey) {
    try {
      return await (program.account as any).claimRecord.fetchNullable(pda);
    } catch {
      const info = await connection.getAccountInfo(pda);
      if (info && info.data && info.data.length >= 89) {
        const buf = info.data;
        return {
          holder: new PublicKey(buf.subarray(8, 40)),
          baseMint: new PublicKey(buf.subarray(40, 72)),
          claimedAmount: buf.readBigUInt64LE(72),
          claimedAt: Number(buf.readBigInt64LE(80)),
        };
      }
      return null;
    }
  }

  const claimRecordAAccount = await fetchClaimRecord(HOLDER_A_CLAIM_RECORD_PDA);
  assert('ClaimRecord A exists', claimRecordAAccount !== null, `pda=${HOLDER_A_CLAIM_RECORD_PDA.toBase58()}`);
  if (claimRecordAAccount) {
    assert('ClaimRecord A claimedAmount > 0', Number(claimRecordAAccount.claimedAmount) > 0,
      `got=${claimRecordAAccount.claimedAmount.toString()}`);
    console.log(`    Holder A claimed: ${claimRecordAAccount.claimedAmount.toString()} atomic units`);
  }

  const claimRecordBAccount = await fetchClaimRecord(HOLDER_B_CLAIM_RECORD_PDA);
  assert('ClaimRecord B exists', claimRecordBAccount !== null, `pda=${HOLDER_B_CLAIM_RECORD_PDA.toBase58()}`);
  if (claimRecordBAccount) {
    assert('ClaimRecord B claimedAmount > 0', Number(claimRecordBAccount.claimedAmount) > 0,
      `got=${claimRecordBAccount.claimedAmount.toString()}`);
    console.log(`    Holder B claimed: ${claimRecordBAccount.claimedAmount.toString()} atomic units`);
  }

  // Test 7: Pro-rata math
  console.log('\n--- Test 7: Pro-Rata Math Computation ---');
  const ELIGIBLE_SUPPLY = 65131823752485n;
  const VAULT_AT_A_CLAIM = 1198087n;
  const HOLDER_A_BAL_AT_CLAIM = 22740573927088n;

  const VAULT_AT_B_CLAIM = 779779n; // 1,198,087 - 418,308
  const HOLDER_B_BAL_AT_CLAIM = 42391249825397n;

  const shareA = calculateProRataShare(VAULT_AT_A_CLAIM, HOLDER_A_BAL_AT_CLAIM, ELIGIBLE_SUPPLY);
  const shareB = calculateProRataShare(VAULT_AT_B_CLAIM, HOLDER_B_BAL_AT_CLAIM, ELIGIBLE_SUPPLY);

  assert('Pro-rata Holder A = 418308',
    shareA === 418308n,
    `got=${shareA}, expected=418308`
  );
  assert('Pro-rata Holder B = 507521',
    shareB === 507521n,
    `got=${shareB}, expected=507521`
  );
  assert('Holder B share > Holder A share', shareB > shareA, `${shareB} > ${shareA}`);

  // Summary
  console.log(`\n=== Test Results: ${passed} passing, ${failed} failed ===\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
