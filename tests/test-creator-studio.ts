import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createMint } from '@solana/spl-token';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { getDivvyProgram, getConfigPda, getVaultPda, getVaultAuthorityPda } from '../src/lib/anchor';
import * as fs from 'fs';
import * as path from 'path';

async function testCreatorStudio() {
  console.log('=== Testing Creator Studio initializeConfig on Solana Devnet ===\n');

  const rootDir = process.cwd();
  const deployerKeyPath = path.join(rootDir, 'keys', 'deployer.json');

  if (!fs.existsSync(deployerKeyPath)) {
    throw new Error(`Deployer key not found at ${deployerKeyPath}`);
  }

  const deployerSecret = JSON.parse(fs.readFileSync(deployerKeyPath, 'utf8'));
  const deployerKeypair = Keypair.fromSecretKey(Uint8Array.from(deployerSecret));

  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');

  const wallet = new Wallet(deployerKeypair);
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  const program = getDivvyProgram(connection, wallet);

  console.log(`Creator Wallet: ${deployerKeypair.publicKey.toBase58()}`);
  const balance = await connection.getBalance(deployerKeypair.publicKey);
  console.log(`Wallet Balance: ${(balance / 1e9).toFixed(4)} SOL`);

  // Step 1: Create a test base mint and test dividend mint
  console.log('\n[1/3] Creating fresh test SPL mints for Creator Studio simulation...');
  const baseMint = await createMint(
    connection,
    deployerKeypair,
    deployerKeypair.publicKey,
    null,
    6
  );
  console.log(`  -> New Base Mint:     ${baseMint.toBase58()}`);

  const dividendMint = await createMint(
    connection,
    deployerKeypair,
    deployerKeypair.publicKey,
    null,
    6
  );
  console.log(`  -> New Dividend Mint: ${dividendMint.toBase58()}`);

  // Step 2: Build and execute initializeConfig exactly as CreatorPanel does
  const feeShareBps = 7500; // 75%
  console.log(`\n[2/3] Calling initializeConfig (${feeShareBps / 100}% fee share) via Divvy Program...`);

  const [configPda] = getConfigPda(baseMint);
  const [vaultPda] = getVaultPda(baseMint);
  const [vaultAuthPda] = getVaultAuthorityPda(baseMint);

  console.log(`  -> Derived Config PDA:    ${configPda.toBase58()}`);
  console.log(`  -> Derived Vault PDA:     ${vaultPda.toBase58()}`);
  console.log(`  -> Derived Vault Auth:    ${vaultAuthPda.toBase58()}`);

  const txSig = await program.methods
    .initializeConfig(feeShareBps)
    .accounts({
      authority: deployerKeypair.publicKey,
      baseMint: baseMint,
      dividendMint: dividendMint,
      systemProgram: new PublicKey('11111111111111111111111111111111'),
      tokenProgram: TOKEN_PROGRAM_ID,
    } as any)
    .rpc();

  console.log(`  -> Transaction Signature: ${txSig}`);

  // Step 3: Fetch on-chain state and verify
  console.log('\n[3/3] Fetching on-chain account data to verify Creator Studio state...');
  const configAccount: any = await (program.account as any).divvyConfig.fetch(configPda);

  console.log('  -> On-Chain Config State:');
  console.log(`     Authority:        ${configAccount.authority.toBase58()}`);
  console.log(`     Base Mint:        ${configAccount.baseMint.toBase58()}`);
  console.log(`     Dividend Mint:    ${configAccount.dividendMint.toBase58()}`);
  console.log(`     Fee Share (BPS):  ${configAccount.feeShareBps}`);
  console.log(`     Total Routed:     ${configAccount.totalRoutedDividends.toString()}`);
  console.log(`     Total Claimed:    ${configAccount.totalClaimedDividends.toString()}`);

  if (
    configAccount.authority.toBase58() === deployerKeypair.publicKey.toBase58() &&
    configAccount.baseMint.toBase58() === baseMint.toBase58() &&
    configAccount.dividendMint.toBase58() === dividendMint.toBase58() &&
    configAccount.feeShareBps === feeShareBps
  ) {
    console.log('\n SUCCESS: Creator Studio initializeConfig logic executed and verified on Devnet!');
  } else {
    throw new Error('On-chain state verification failed!');
  }
}

testCreatorStudio().catch((err) => {
  console.error('\n Test Error:', err);
  process.exit(1);
});
