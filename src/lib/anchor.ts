import { PublicKey, Connection } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import idl from './divvy-idl.json';
import { DIVVY_PROGRAM_ID, ELIGIBLE_SUPPLY_ATOMIC } from './constants';

export const IDL_DIVVY = idl as Idl;

export function getConfigPda(baseMint: PublicKey, programId = DIVVY_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('config'), baseMint.toBuffer()],
    programId
  );
}

export function getVaultPda(baseMint: PublicKey, programId = DIVVY_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), baseMint.toBuffer()],
    programId
  );
}

export function getVaultAuthorityPda(baseMint: PublicKey, programId = DIVVY_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault_authority'), baseMint.toBuffer()],
    programId
  );
}

export function getClaimRecordPda(
  baseMint: PublicKey,
  holder: PublicKey,
  programId = DIVVY_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('claim'), baseMint.toBuffer(), holder.toBuffer()],
    programId
  );
}

export const INDEX_SCALE = BigInt(1_000_000_000_000); // 10^12

export function calculateIndexClaimAmount(
  holderBalance: bigint | number,
  globalIndex: bigint | number | string,
  lastClaimedIndex: bigint | number | string
): bigint {
  const hb = BigInt(holderBalance.toString());
  const gi = BigInt(globalIndex.toString());
  const li = BigInt(lastClaimedIndex.toString());

  if (gi <= li || hb === BigInt(0)) {
    return BigInt(0);
  }

  const indexDiff = gi - li;
  return (hb * indexDiff) / INDEX_SCALE;
}

export function calculateProRataShare(
  vaultBalance: bigint | number,
  holderBalance: bigint | number,
  eligibleSupply: bigint | number = ELIGIBLE_SUPPLY_ATOMIC
): bigint {
  const vb = BigInt(vaultBalance.toString());
  const hb = BigInt(holderBalance.toString());
  const es = BigInt(eligibleSupply.toString());

  if (es === BigInt(0) || hb === BigInt(0) || vb === BigInt(0)) {
    return BigInt(0);
  }

  // Multiply before divide to maintain precision: (vault_balance * holder_balance) / eligible_supply
  return (vb * hb) / es;
}

export function getDivvyProgram(
  connection: Connection,
  wallet?: any
): Program {
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  };
  const provider = new AnchorProvider(
    connection,
    wallet || dummyWallet,
    { commitment: 'confirmed' }
  );
  return new Program(IDL_DIVVY, provider);
}
