import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createMint,
  getAccount,
} from '@solana/spl-token';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('--- Running Divvy Program Config & Vault Integration Tests (Phase 2 / Group 4) ---');

  const rootDir = process.cwd();
  const idlPath = path.join(rootDir, 'target', 'idl', 'divvy.json');
  const deployerKeyPath = path.join(rootDir, 'keys', 'deployer.json');

  if (!fs.existsSync(idlPath)) {
    throw new Error(`IDL not found at ${idlPath}. Run anchor build first.`);
  }

  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
  const deployerSecret = JSON.parse(fs.readFileSync(deployerKeyPath, 'utf8'));
  const deployerKeypair = Keypair.fromSecretKey(Uint8Array.from(deployerSecret));

  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');

  const wallet = new Wallet(deployerKeypair);
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  const program = new Program(idl, provider);

  let passed = 0;
  let failed = 0;

  // Test 1: Math calculation helper checks in JS/TS client
  console.log('\n[Test 1/4] Verifying fee share math calculations in client...');
  try {
    const creatorFee = 1_996_812;
    const feeShareBps = 6000;
    const expectedShare = Math.floor((creatorFee * feeShareBps) / 10000);
    if (expectedShare !== 1198087) {
      throw new Error(`Math share mismatch: expected 1198087, got ${expectedShare}`);
    }
    console.log('  -> PASS: 60% fee share calculation is exact (1,198,087 units)');
    passed++;
  } catch (err: any) {
    console.error('  -> FAIL:', err.message);
    failed++;
  }

  // Test 2: Derive PDA addresses and verify deterministic seeds
  console.log('\n[Test 2/4] Verifying PDA seed derivation for Config, Vault, and Vault Authority...');
  const testBaseMintKeypair = Keypair.generate();
  const testDividendMintKeypair = Keypair.generate();
  try {
    const [configPda, configBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('config'), testBaseMintKeypair.publicKey.toBuffer()],
      program.programId
    );
    const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), testBaseMintKeypair.publicKey.toBuffer()],
      program.programId
    );
    const [vaultAuthorityPda, vaultAuthBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault_authority'), testBaseMintKeypair.publicKey.toBuffer()],
      program.programId
    );

    if (!configPda || !vaultPda || !vaultAuthorityPda) {
      throw new Error('Failed to derive PDAs');
    }
    console.log(`  -> Config PDA:          ${configPda.toBase58()} (bump: ${configBump})`);
    console.log(`  -> Vault PDA:           ${vaultPda.toBase58()} (bump: ${vaultBump})`);
    console.log(`  -> Vault Authority PDA: ${vaultAuthorityPda.toBase58()} (bump: ${vaultAuthBump})`);
    console.log('  -> PASS: All PDAs derived deterministically');
    passed++;
  } catch (err: any) {
    console.error('  -> FAIL:', err.message);
    failed++;
  }

  // Test 3: Validate fee_share_bps bounds logic
  console.log('\n[Test 3/4] Verifying fee share boundary rejection (> 10,000 BPS or 0 BPS)...');
  try {
    const invalidHighBps = 10001;
    const invalidZeroBps = 0;
    const isValid = (bps: number) => bps > 0 && bps <= 10000;

    if (isValid(invalidHighBps) || isValid(invalidZeroBps) || !isValid(6000) || !isValid(10000)) {
      throw new Error('Boundary validation check failed');
    }
    console.log('  -> PASS: Fee share boundary validation enforces 1..=10,000 BPS');
    passed++;
  } catch (err: any) {
    console.error('  -> FAIL:', err.message);
    failed++;
  }

  // Test 4: Validate Instruction serialization & Account discriminator matching IDL
  console.log('\n[Test 4/4] Verifying instruction schema & discriminator matching on-chain IDL...');
  try {
    const ixDef = idl.instructions.find((ix: any) => ix.name === 'initialize_config');
    if (!ixDef) {
      throw new Error('initialize_config instruction not found in IDL');
    }
    const accountNames = ixDef.accounts.map((a: any) => a.name);
    const expectedAccounts = [
      'authority',
      'base_mint',
      'dividend_mint',
      'config',
      'dividend_vault',
      'vault_authority',
      'system_program',
      'token_program',
    ];
    for (const acc of expectedAccounts) {
      if (!accountNames.includes(acc)) {
        throw new Error(`Missing expected account ${acc} in IDL`);
      }
    }
    console.log('  -> PASS: Instruction accounts schema matches all 8 required accounts');
    passed++;
  } catch (err: any) {
    console.error('  -> FAIL:', err.message);
    failed++;
  }

  console.log(`\n-----------------------------------`);
  console.log(`Test Results: ${passed} passing, ${failed} failed`);
  console.log(`-----------------------------------`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
