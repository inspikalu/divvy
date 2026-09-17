import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
} from '@solana/spl-token';
import {
  DynamicBondingCurveClient,
  swapQuote,
} from '@meteora-ag/dynamic-bonding-curve-sdk';
import BN from 'bn.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const isVerifyOnly = args.includes('--verify');

  const rootDir = process.cwd();
  const trackedPath = path.join(rootDir, 'tracked-addresses.json');

  if (!fs.existsSync(trackedPath)) {
    throw new Error(`tracked-addresses.json not found at ${trackedPath}`);
  }

  const tracked = JSON.parse(fs.readFileSync(trackedPath, 'utf8'));
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');

  if (isVerifyOnly) {
    console.log('--- Verifying Devnet Swaps ---');
    const signatures = tracked.swapSignatures || [];
    if (signatures.length < 3) {
      throw new Error(`Expected at least 3 swap signatures, found ${signatures.length}`);
    }

    for (let i = 0; i < signatures.length; i++) {
      const sig = signatures[i].signature;
      console.log(`Checking signature ${i + 1}/${signatures.length}: ${sig}`);
      const tx = await connection.getTransaction(sig, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });
      if (!tx) {
        throw new Error(`Transaction ${sig} not found on devnet`);
      }
      if (tx.meta?.err) {
        throw new Error(`Transaction ${sig} failed on-chain: ${JSON.stringify(tx.meta.err)}`);
      }
      console.log(`  -> Confirmed in slot ${tx.slot}`);
    }

    console.log(`\nSwaps verified: 3 confirmed on devnet`);
    return;
  }

  console.log('--- Starting Real Devnet Swap Execution (Phase 1 / Group 5) ---');

  const deployerKeyPath = path.join(rootDir, 'keys', 'deployer.json');
  const holderAKeyPath = path.join(rootDir, 'keys', 'holder-a.json');
  const holderBKeyPath = path.join(rootDir, 'keys', 'holder-b.json');

  const deployerKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(deployerKeyPath, 'utf8'))));
  const holderAKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(holderAKeyPath, 'utf8'))));
  const holderBKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(holderBKeyPath, 'utf8'))));

  const quoteMint = new PublicKey(tracked.dividendMint);
  const baseMint = new PublicKey(tracked.baseMint);
  const poolAddress = new PublicKey(tracked.poolAddress);

  console.log(`Deployer: ${deployerKeypair.publicKey.toBase58()}`);
  console.log(`Holder A: ${holderAKeypair.publicKey.toBase58()}`);
  console.log(`Holder B: ${holderBKeypair.publicKey.toBase58()}`);
  console.log(`Quote Mint: ${quoteMint.toBase58()}`);
  console.log(`Base Mint: ${baseMint.toBase58()}`);
  console.log(`Pool: ${poolAddress.toBase58()}`);

  // Step 1: Ensure Holder A and Holder B have quote tokens
  console.log('\n[Step 1] Seeding Holder A and Holder B with quote dividend tokens...');
  const deployerQuoteAta = await getOrCreateAssociatedTokenAccount(
    connection,
    deployerKeypair,
    quoteMint,
    deployerKeypair.publicKey
  );

  const holderAQuoteAta = await getOrCreateAssociatedTokenAccount(
    connection,
    deployerKeypair,
    quoteMint,
    holderAKeypair.publicKey
  );

  const holderBQuoteAta = await getOrCreateAssociatedTokenAccount(
    connection,
    deployerKeypair,
    quoteMint,
    holderBKeypair.publicKey
  );

  // Transfer 5,000 tokens (6 decimals = 5,000 * 10^6) to Holder A if balance < 1000
  if (Number(holderAQuoteAta.amount) < 1000 * 1e6) {
    console.log('Transferring 5,000 quote tokens to Holder A...');
    await transfer(
      connection,
      deployerKeypair,
      deployerQuoteAta.address,
      holderAQuoteAta.address,
      deployerKeypair.publicKey,
      5000 * 1e6
    );
    console.log('Holder A funded with quote tokens.');
  } else {
    console.log(`Holder A already has ${Number(holderAQuoteAta.amount) / 1e6} quote tokens.`);
  }

  // Transfer 5,000 tokens to Holder B if balance < 1000
  if (Number(holderBQuoteAta.amount) < 1000 * 1e6) {
    console.log('Transferring 5,000 quote tokens to Holder B...');
    await transfer(
      connection,
      deployerKeypair,
      deployerQuoteAta.address,
      holderBQuoteAta.address,
      deployerKeypair.publicKey,
      5000 * 1e6
    );
    console.log('Holder B funded with quote tokens.');
  } else {
    console.log(`Holder B already has ${Number(holderBQuoteAta.amount) / 1e6} quote tokens.`);
  }

  const client = DynamicBondingCurveClient.create(connection, 'confirmed');
  const swapSignatures: Array<{
    type: string;
    trader: string;
    signature: string;
    explorerUrl: string;
    amountIn: string;
  }> = [];

  // Step 2: Holder A executes Buy (Quote -> Base)
  console.log('\n[Step 2] Executing Swap 1: Holder A Buys Base Tokens with 100 Quote Tokens...');
  const buyAmountA = new BN(100 * 1e6); // 100 quote tokens
  const swapTx1 = await client.pool.swap({
    owner: holderAKeypair.publicKey,
    payer: holderAKeypair.publicKey,
    pool: poolAddress,
    amountIn: buyAmountA,
    minimumAmountOut: new BN(0),
    swapBaseForQuote: false, // quote to base
    referralTokenAccount: null,
  });

  const sig1 = await sendAndConfirmTransaction(
    connection,
    swapTx1,
    [holderAKeypair],
    { commitment: 'confirmed' }
  );
  console.log(`Swap 1 Confirmed! Tx: https://explorer.solana.com/tx/${sig1}?cluster=devnet`);
  swapSignatures.push({
    type: 'BUY',
    trader: holderAKeypair.publicKey.toBase58(),
    signature: sig1,
    explorerUrl: `https://explorer.solana.com/tx/${sig1}?cluster=devnet`,
    amountIn: '100 Quote Tokens',
  });

  // Step 3: Holder B executes Buy (Quote -> Base)
  console.log('\n[Step 3] Executing Swap 2: Holder B Buys Base Tokens with 150 Quote Tokens...');
  const buyAmountB = new BN(150 * 1e6); // 150 quote tokens
  const swapTx2 = await client.pool.swap({
    owner: holderBKeypair.publicKey,
    payer: holderBKeypair.publicKey,
    pool: poolAddress,
    amountIn: buyAmountB,
    minimumAmountOut: new BN(0),
    swapBaseForQuote: false, // quote to base
    referralTokenAccount: null,
  });

  const sig2 = await sendAndConfirmTransaction(
    connection,
    swapTx2,
    [holderBKeypair],
    { commitment: 'confirmed' }
  );
  console.log(`Swap 2 Confirmed! Tx: https://explorer.solana.com/tx/${sig2}?cluster=devnet`);
  swapSignatures.push({
    type: 'BUY',
    trader: holderBKeypair.publicKey.toBase58(),
    signature: sig2,
    explorerUrl: `https://explorer.solana.com/tx/${sig2}?cluster=devnet`,
    amountIn: '150 Quote Tokens',
  });

  // Check Holder A base token balance to sell a fraction
  const holderABaseAta = await getOrCreateAssociatedTokenAccount(
    connection,
    holderAKeypair,
    baseMint,
    holderAKeypair.publicKey
  );
  const baseBalanceA = new BN(holderABaseAta.amount.toString());
  console.log(`Holder A Base Token Balance: ${baseBalanceA.toString()} units`);

  const sellAmountA = baseBalanceA.div(new BN(4)); // sell 25% of purchased base tokens
  console.log(`\n[Step 4] Executing Swap 3: Holder A Sells ${sellAmountA.toString()} Base Tokens for Quote Tokens...`);
  const swapTx3 = await client.pool.swap({
    owner: holderAKeypair.publicKey,
    payer: holderAKeypair.publicKey,
    pool: poolAddress,
    amountIn: sellAmountA,
    minimumAmountOut: new BN(0),
    swapBaseForQuote: true, // base to quote
    referralTokenAccount: null,
  });

  const sig3 = await sendAndConfirmTransaction(
    connection,
    swapTx3,
    [holderAKeypair],
    { commitment: 'confirmed' }
  );
  console.log(`Swap 3 Confirmed! Tx: https://explorer.solana.com/tx/${sig3}?cluster=devnet`);
  swapSignatures.push({
    type: 'SELL',
    trader: holderAKeypair.publicKey.toBase58(),
    signature: sig3,
    explorerUrl: `https://explorer.solana.com/tx/${sig3}?cluster=devnet`,
    amountIn: `${sellAmountA.toString()} Base Tokens`,
  });

  // Save to tracked-addresses.json
  tracked.swapSignatures = swapSignatures;
  fs.writeFileSync(trackedPath, JSON.stringify(tracked, null, 2) + '\n', 'utf8');
  console.log('\nUpdated tracked-addresses.json with all 3 swap signatures!');
}

main().catch((err) => {
  console.error('Error executing swaps:', err);
  process.exit(1);
});
