import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import {
  DynamicBondingCurveClient,
  buildCurve,
  TokenDecimal,
  TokenType,
  TokenAuthorityOption,
  BaseFeeMode,
  CollectFeeMode,
  MigrationOption,
  MigrationFeeOption,
  ActivationType,
  MIN_POOL_CREATION_FEE,
  DammV2DynamicFeeMode,
  MigratedCollectFeeMode,
  deriveDbcPoolAddress,
  deriveDbcTokenVaultAddress,
} from '@meteora-ag/dynamic-bonding-curve-sdk';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('--- Starting Meteora DBC Pool Creation (Phase 1 / Group 3) ---');

  const rootDir = process.cwd();
  const trackedPath = path.join(rootDir, 'tracked-addresses.json');
  const deployerKeyPath = path.join(rootDir, 'keys', 'deployer.json');

  if (!fs.existsSync(trackedPath)) {
    throw new Error(`tracked-addresses.json not found at ${trackedPath}`);
  }
  if (!fs.existsSync(deployerKeyPath)) {
    throw new Error(`deployer.json not found at ${deployerKeyPath}`);
  }

  const tracked = JSON.parse(fs.readFileSync(trackedPath, 'utf8'));
  const deployerSecret = JSON.parse(fs.readFileSync(deployerKeyPath, 'utf8'));
  const deployerKeypair = Keypair.fromSecretKey(Uint8Array.from(deployerSecret));

  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');

  console.log(`Using RPC: ${rpcUrl}`);
  console.log(`Deployer Pubkey: ${deployerKeypair.publicKey.toBase58()}`);
  console.log(`Quote / Dividend Mint: ${tracked.dividendMint}`);

  const client = DynamicBondingCurveClient.create(connection, 'confirmed');

  // Keypairs for new config and new base token mint
  const configKeypair = Keypair.generate();
  const baseMintKeypair = Keypair.generate();

  console.log(`Generated Config Pubkey: ${configKeypair.publicKey.toBase58()}`);
  console.log(`Generated Base Mint Pubkey: ${baseMintKeypair.publicKey.toBase58()}`);

  // Build the curve parameters matching specs/curve-design.md
  // Base token: 1,000,000,000 supply, 6 decimals
  // Quote token: 6 decimals
  // Base fee: 150 bps (1.5%) flat linear fee schedule
  // Creator fee: 60%
  // Dynamic fee: disabled
  // Quote threshold for migration: 10,000 quote tokens (10,000 * 10^6)
  // Percentage on migration: 20%
  const curveConfig = buildCurve({
    token: {
      tokenType: TokenType.SPLToken,
      tokenBaseDecimal: TokenDecimal.SIX,
      tokenQuoteDecimal: TokenDecimal.SIX,
      tokenAuthorityOption: TokenAuthorityOption.Immutable,
      totalTokenSupply: 1_000_000_000,
      leftover: 0,
    },
    fee: {
      baseFeeParams: {
        baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
        feeSchedulerParam: {
          startingFeeBps: 150,
          endingFeeBps: 150,
          numberOfPeriod: 0,
          totalDuration: 0,
        },
      },
      dynamicFeeEnabled: false,
      collectFeeMode: CollectFeeMode.QuoteToken,
      creatorTradingFeePercentage: 60,
      poolCreationFee: 0.001, // 0.001 SOL = 1,000,000 lamports = MIN_POOL_CREATION_FEE
      enableFirstSwapWithMinFee: false,
    },
    migration: {
      migrationOption: MigrationOption.MET_DAMM_V2,
      migrationFeeOption: MigrationFeeOption.FixedBps100,
      migrationFee: {
        feePercentage: 1,
        creatorFeePercentage: 0,
      },
      migratedPoolFee: {
        collectFeeMode: MigratedCollectFeeMode.QuoteToken,
        dynamicFee: DammV2DynamicFeeMode.Disabled,
        poolFeeBps: 150,
      },
    },
    liquidityDistribution: {
      partnerPermanentLockedLiquidityPercentage: 0,
      partnerLiquidityPercentage: 0,
      creatorPermanentLockedLiquidityPercentage: 100,
      creatorLiquidityPercentage: 0,
    },
    lockedVesting: {
      totalLockedVestingAmount: 0,
      numberOfVestingPeriod: 0,
      cliffUnlockAmount: 0,
      totalVestingDuration: 0,
      cliffDurationFromMigrationTime: 0,
    },
    activationType: ActivationType.Timestamp,
    percentageSupplyOnMigration: 20,
    migrationQuoteThreshold: 10000,
  });

  const quoteMint = new PublicKey(tracked.dividendMint);

  console.log('Building createConfigAndPool transaction...');
  const tx = await client.partner.createConfigAndPool({
    ...curveConfig,
    config: configKeypair.publicKey,
    feeClaimer: deployerKeypair.publicKey,
    leftoverReceiver: deployerKeypair.publicKey,
    quoteMint: quoteMint,
    payer: deployerKeypair.publicKey,
    preCreatePoolParam: {
      name: 'Divvy Meme Token',
      symbol: 'DVY',
      uri: 'https://divvy.fi/metadata.json',
      poolCreator: deployerKeypair.publicKey,
      baseMint: baseMintKeypair.publicKey,
    },
  });

  console.log('Submitting transaction to Solana devnet...');
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [deployerKeypair, configKeypair, baseMintKeypair],
    { commitment: 'confirmed' }
  );

  console.log(`Transaction confirmed: https://explorer.solana.com/tx/${signature}?cluster=devnet`);

  const poolAddress = deriveDbcPoolAddress(quoteMint, baseMintKeypair.publicKey, configKeypair.publicKey);
  const baseVault = deriveDbcTokenVaultAddress(poolAddress, baseMintKeypair.publicKey);
  const quoteVault = deriveDbcTokenVaultAddress(poolAddress, quoteMint);

  console.log(`Pool Address: ${poolAddress.toBase58()}`);
  console.log(`Base Vault: ${baseVault.toBase58()}`);
  console.log(`Quote Vault: ${quoteVault.toBase58()}`);

  // Update tracked-addresses.json
  tracked.configAddress = configKeypair.publicKey.toBase58();
  tracked.baseMint = baseMintKeypair.publicKey.toBase58();
  tracked.poolAddress = poolAddress.toBase58();
  tracked.baseVault = baseVault.toBase58();
  tracked.quoteVault = quoteVault.toBase58();
  tracked.poolCreationSignature = signature;
  tracked.poolCreationExplorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

  fs.writeFileSync(trackedPath, JSON.stringify(tracked, null, 2) + '\n', 'utf8');
  console.log('Updated tracked-addresses.json successfully!');
}

main().catch((err) => {
  console.error('Error creating DBC pool:', err);
  process.exit(1);
});
