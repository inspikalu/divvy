import { PublicKey, Connection, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token';
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import idl from '../src/lib/divvy-idl.json';

async function main() {
  const conn = new Connection('https://devnet.helius-rpc.com/?api-key=8dabc2e1-a043-4c0a-a675-52273c7ac948', 'confirmed');

  const BASE_MINT = new PublicKey('3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4');
  const DIVIDEND_MINT = new PublicKey('A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM');
  const PROGRAM_ID = new PublicKey('235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5');
  const USER = new PublicKey('212mxJEqpi5MdDpsYpWunFWjhy6xXKAQHFHkqSEWMW6w');
  const DIVVY_CONFIG_PDA = new PublicKey('AhWYbZeiyisCxjrgz4yZRf7sPN8Wx5SxgnpaLVwrwBY4');
  const DIVIDEND_VAULT_PDA = new PublicKey('GjXC4iEAh7tqL7MqhY7cpF7Wvdfpa2LBMEL7anwty3Mw');
  const [VAULT_AUTHORITY_PDA] = PublicKey.findProgramAddressSync([Buffer.from('vault_authority'), BASE_MINT.toBuffer()], PROGRAM_ID);
  const [CLAIM_RECORD_PDA] = PublicKey.findProgramAddressSync([Buffer.from('claim'), BASE_MINT.toBuffer(), USER.toBuffer()], PROGRAM_ID);

  const dummyWallet = { publicKey: USER, signTransaction: async (t: any) => t, signAllTransactions: async (t: any) => t };
  const provider = new AnchorProvider(conn, dummyWallet, { commitment: 'confirmed' });
  const program = new Program(idl as Idl, provider);

  const holderBaseAta = getAssociatedTokenAddressSync(BASE_MINT, USER);
  const holderDividendAta = getAssociatedTokenAddressSync(DIVIDEND_MINT, USER);

  console.log('holderBaseAta:', holderBaseAta.toBase58());
  console.log('holderDividendAta:', holderDividendAta.toBase58());
  console.log('claimRecordPda:', CLAIM_RECORD_PDA.toBase58());
  console.log('vaultAuthority:', VAULT_AUTHORITY_PDA.toBase58());

  // Check config to see cumulative index
  const configInfo = await conn.getAccountInfo(DIVVY_CONFIG_PDA);
  if (configInfo) {
    console.log('Config data length:', configInfo.data.length);
    if (configInfo.data.length >= 140) {
      const low = configInfo.data.readBigUInt64LE(122);
      const high = configInfo.data.readBigUInt64LE(130);
      const index = low + (high << BigInt(64));
      console.log('cumulative_dividend_per_token:', index.toString());
    } else {
      console.log('Old config layout (no cumulative index) — length:', configInfo.data.length);
    }
  }

  // Eligible supply from constants
  const ELIGIBLE_SUPPLY_ATOMIC = BigInt('65000000000000'); // 65M * 1e6

  try {
    const ix = await (program.methods as any)
      .claim(new BN(ELIGIBLE_SUPPLY_ATOMIC.toString()))
      .accounts({
        holder: USER,
        config: DIVVY_CONFIG_PDA,
        holderBaseTokenAccount: holderBaseAta,
        holderDividendTokenAccount: holderDividendAta,
        dividendVault: DIVIDEND_VAULT_PDA,
        vaultAuthority: VAULT_AUTHORITY_PDA,
        claimRecord: CLAIM_RECORD_PDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    const tx = new Transaction();
    tx.add(createAssociatedTokenAccountIdempotentInstruction(USER, holderDividendAta, USER, DIVIDEND_MINT));
    tx.add(ix);
    tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
    tx.feePayer = USER;

    const sim = await conn.simulateTransaction(tx);
    console.log('\n=== Simulation result ===');
    console.log('err:', JSON.stringify(sim.value.err));
    if (sim.value.logs) {
      console.log('logs:');
      sim.value.logs.forEach(l => console.log(' ', l));
    }
  } catch(e: any) {
    console.error('Error building/simulating tx:', e.message);
  }
}

main().catch(console.error);
