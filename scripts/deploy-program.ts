import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

const BPF_LOADER_UPGRADEABLE_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111');
const CHUNK_SIZE = 900;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeGetLatestBlockhash(connection: Connection): Promise<string> {
  for (let i = 0; i < 10; i++) {
    try {
      const res = await connection.getLatestBlockhash('confirmed');
      return res.blockhash;
    } catch (err: any) {
      console.log(`  [Blockhash fetch retry ${i + 1}] ${err.message}`);
      await sleep(2000 * (i + 1));
    }
  }
  throw new Error('Failed to get latest blockhash after 10 attempts');
}

async function safeGetAccountInfo(connection: Connection, pubkey: PublicKey) {
  for (let i = 0; i < 10; i++) {
    try {
      return await connection.getAccountInfo(pubkey, 'confirmed');
    } catch (err: any) {
      console.log(`  [AccountInfo fetch retry ${i + 1}] ${err.message}`);
      await sleep(2000 * (i + 1));
    }
  }
  throw new Error(`Failed to get account info for ${pubkey.toBase58()} after 10 attempts`);
}

async function main() {
  console.log('--- Starting Resilient Devnet Program Deployment ---');

  const rootDir = process.cwd();
  const deployerKeyPath = path.join(rootDir, 'keys', 'deployer.json');
  const programKeyPath = path.join(rootDir, 'target', 'deploy', 'divvy-keypair.json');
  const bufferKeyPath = path.join(rootDir, 'target', 'deploy', 'divvy-buffer.json');
  const binaryPath = path.join(rootDir, 'target', 'deploy', 'divvy.so');
  const trackedPath = path.join(rootDir, 'tracked-addresses.json');

  const deployerSecret = JSON.parse(fs.readFileSync(deployerKeyPath, 'utf8'));
  const deployerKeypair = Keypair.fromSecretKey(Uint8Array.from(deployerSecret));

  const programSecret = JSON.parse(fs.readFileSync(programKeyPath, 'utf8'));
  const programKeypair = Keypair.fromSecretKey(Uint8Array.from(programSecret));

  const programBytes = fs.readFileSync(binaryPath);
  console.log(`Program ID:  ${programKeypair.publicKey.toBase58()}`);
  console.log(`Deployer:    ${deployerKeypair.publicKey.toBase58()}`);
  console.log(`Binary size: ${programBytes.length} bytes`);

  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');

  // Check if program is already deployed
  const existingProgram = await connection.getAccountInfo(programKeypair.publicKey);
  if (existingProgram && existingProgram.executable) {
    console.log(`Program ${programKeypair.publicKey.toBase58()} is ALREADY deployed and executable on devnet!`);
    return;
  }

  // Step 1: Load or Create Buffer Account
  let bufferKeypair: Keypair;
  const bufferSize = 37 + programBytes.length;
  const bufferRent = await connection.getMinimumBalanceForRentExemption(bufferSize);

  let needInit = true;
  if (fs.existsSync(bufferKeyPath)) {
    try {
      const savedSecret = JSON.parse(fs.readFileSync(bufferKeyPath, 'utf8'));
      const candidate = Keypair.fromSecretKey(Uint8Array.from(savedSecret));
      const acc = await safeGetAccountInfo(connection, candidate.publicKey);
      if (acc && acc.data.length === bufferSize) {
        bufferKeypair = candidate;
        needInit = false;
        console.log(`\n[Step 1] Reusing existing Buffer Account: ${bufferKeypair.publicKey.toBase58()}`);
      }
    } catch (_) {
      needInit = true;
    }
  }

  if (needInit) {
    bufferKeypair = Keypair.generate();
    fs.writeFileSync(bufferKeyPath, JSON.stringify(Array.from(bufferKeypair.secretKey)), 'utf8');

    console.log(`\n[Step 1] Creating New Buffer Account ${bufferKeypair.publicKey.toBase58()} (${bufferSize} bytes, ${bufferRent / 1e9} SOL)...`);

    const createBufferTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: deployerKeypair.publicKey,
        newAccountPubkey: bufferKeypair.publicKey,
        lamports: bufferRent,
        space: bufferSize,
        programId: BPF_LOADER_UPGRADEABLE_ID,
      }),
      new TransactionInstruction({
        programId: BPF_LOADER_UPGRADEABLE_ID,
        keys: [
          { pubkey: bufferKeypair.publicKey, isSigner: false, isWritable: true },
          { pubkey: deployerKeypair.publicKey, isSigner: false, isWritable: false },
        ],
        data: Buffer.from([0, 0, 0, 0]), // InitializeBuffer
      })
    );

    const initSig = await sendAndConfirmTransaction(
      connection,
      createBufferTx,
      [deployerKeypair, bufferKeypair],
      { commitment: 'confirmed' }
    );
    console.log(`Buffer initialized: https://explorer.solana.com/tx/${initSig}?cluster=devnet`);
  }

  // Step 2: Write Binary in Chunks with Verification Loop
  const totalChunks = Math.ceil(programBytes.length / CHUNK_SIZE);
  console.log(`\n[Step 2] Writing & Verifying ${totalChunks} chunks in buffer...`);

  let fullyMatched = false;
  let attempt = 1;

  while (!fullyMatched && attempt <= 15) {
    console.log(`\n--- Verification Round ${attempt} ---`);
    const bufferAccount = await safeGetAccountInfo(connection, bufferKeypair!.publicKey);
    if (!bufferAccount) {
      throw new Error(`Buffer account ${bufferKeypair!.publicKey.toBase58()} not found`);
    }

    const onChainData = bufferAccount.data.subarray(37); // skip 37-byte header
    const missingChunks: number[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const offset = i * CHUNK_SIZE;
      const end = Math.min(offset + CHUNK_SIZE, programBytes.length);
      const expectedChunk = programBytes.subarray(offset, end);
      const actualChunk = onChainData.subarray(offset, end);

      if (!expectedChunk.equals(actualChunk)) {
        missingChunks.push(i);
      }
    }

    if (missingChunks.length === 0) {
      console.log('✅ 100% of binary bytes verified on-chain in buffer!');
      fullyMatched = true;
      break;
    }

    console.log(`Missing/unconfirmed chunks to write: ${missingChunks.length}/${totalChunks}`);

    let currentBlockhash = await safeGetLatestBlockhash(connection);
    let lastBlockhashTime = Date.now();

    for (let idx = 0; idx < missingChunks.length; idx++) {
      const i = missingChunks[idx];
      if (Date.now() - lastBlockhashTime > 20000) {
        currentBlockhash = await safeGetLatestBlockhash(connection);
        lastBlockhashTime = Date.now();
      }

      const offset = i * CHUNK_SIZE;
      const chunk = programBytes.subarray(offset, Math.min(offset + CHUNK_SIZE, programBytes.length));

      const data = Buffer.alloc(4 + 4 + 8 + chunk.length);
      data.writeUInt32LE(1, 0); // Write instruction
      data.writeUInt32LE(offset, 4);
      data.writeBigUInt64LE(BigInt(chunk.length), 8);
      chunk.copy(data, 16);

      const writeTx = new Transaction({
        feePayer: deployerKeypair.publicKey,
        recentBlockhash: currentBlockhash,
      }).add(
        new TransactionInstruction({
          programId: BPF_LOADER_UPGRADEABLE_ID,
          keys: [
            { pubkey: bufferKeypair!.publicKey, isSigner: false, isWritable: true },
            { pubkey: deployerKeypair.publicKey, isSigner: true, isWritable: false },
          ],
          data,
        })
      );

      writeTx.sign(deployerKeypair);
      const rawTx = writeTx.serialize();

      try {
        await connection.sendRawTransaction(rawTx, {
          skipPreflight: true,
          maxRetries: 2,
        });
      } catch (err: any) {
        console.log(`  Send error on chunk ${i + 1}: ${err.message}`);
        await sleep(1000);
      }

      await sleep(350); // Paced to avoid 429 rate limit
    }

    console.log('Waiting 8s for batch writes to settle on devnet...');
    await sleep(8000);
    attempt++;
  }

  if (!fullyMatched) {
    throw new Error('Failed to fully populate buffer after 15 rounds');
  }

  // Step 3: Deploy Program
  console.log(`\n[Step 3] Finalizing program deployment...`);
  const [programDataPda] = PublicKey.findProgramAddressSync(
    [programKeypair.publicKey.toBuffer()],
    BPF_LOADER_UPGRADEABLE_ID
  );

  const programRent = await connection.getMinimumBalanceForRentExemption(36);
  const deployData = Buffer.alloc(4 + 8);
  deployData.writeUInt32LE(2, 0); // DeployWithMaxDataLen
  deployData.writeBigUInt64LE(BigInt(programBytes.length), 4);

  const deployTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: deployerKeypair.publicKey,
      newAccountPubkey: programKeypair.publicKey,
      lamports: programRent,
      space: 36,
      programId: BPF_LOADER_UPGRADEABLE_ID,
    }),
    new TransactionInstruction({
      programId: BPF_LOADER_UPGRADEABLE_ID,
      keys: [
        { pubkey: deployerKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: programDataPda, isSigner: false, isWritable: true },
        { pubkey: programKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: bufferKeypair!.publicKey, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: deployerKeypair.publicKey, isSigner: true, isWritable: false },
      ],
      data: deployData,
    })
  );

  const deploySig = await sendAndConfirmTransaction(
    connection,
    deployTx,
    [deployerKeypair, programKeypair],
    { commitment: 'confirmed' }
  );

  console.log(`\n🎉 Program successfully deployed!`);
  console.log(`Program ID:  ${programKeypair.publicKey.toBase58()}`);
  console.log(`ProgramData: ${programDataPda.toBase58()}`);
  console.log(`Deploy Tx:   https://explorer.solana.com/tx/${deploySig}?cluster=devnet`);

  // Clean up buffer key file
  if (fs.existsSync(bufferKeyPath)) {
    fs.unlinkSync(bufferKeyPath);
  }

  // Update tracked-addresses.json
  const tracked = JSON.parse(fs.readFileSync(trackedPath, 'utf8'));
  tracked.divvyProgramId = programKeypair.publicKey.toBase58();
  tracked.divvyProgramData = programDataPda.toBase58();
  tracked.divvyDeployTx = deploySig;
  fs.writeFileSync(trackedPath, JSON.stringify(tracked, null, 2) + '\n', 'utf8');
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
