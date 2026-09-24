'use client';

import { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import {
  BASE_MINT,
  DIVIDEND_MINT,
  DIVVY_CONFIG_PDA,
  DIVIDEND_VAULT_PDA,
  VAULT_AUTHORITY_PDA,
  ELIGIBLE_SUPPLY_ATOMIC,
  getExplorerTxUrl,
} from '@/lib/constants';
import { getDivvyProgram, getClaimRecordPda } from '@/lib/anchor';

export interface UseHolderClaimReturn {
  claiming: boolean;
  claimSuccessTx: string | null;
  claimError: string | null;
  claimDividends: (onSuccess?: () => void) => Promise<string | null>;
  resetClaimState: () => void;
}

export function useHolderClaim(): UseHolderClaimReturn {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [claiming, setClaiming] = useState<boolean>(false);
  const [claimSuccessTx, setClaimSuccessTx] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const resetClaimState = useCallback(() => {
    setClaimSuccessTx(null);
    setClaimError(null);
  }, []);

  const claimDividends = useCallback(async (onSuccess?: () => void): Promise<string | null> => {
    if (!publicKey || !sendTransaction) {
      setClaimError('Please connect your wallet first.');
      return null;
    }

    try {
      setClaiming(true);
      setClaimError(null);
      setClaimSuccessTx(null);

      const holderBaseAta = getAssociatedTokenAddressSync(BASE_MINT, publicKey);
      const holderDividendAta = getAssociatedTokenAddressSync(DIVIDEND_MINT, publicKey);
      const [claimRecordPda] = getClaimRecordPda(BASE_MINT, publicKey);

      const tx = new Transaction();

      // Ensure recipient dividend ATA exists
      tx.add(
        createAssociatedTokenAccountIdempotentInstruction(
          publicKey,
          holderDividendAta,
          publicKey,
          DIVIDEND_MINT
        )
      );

      const program = getDivvyProgram(connection);

      // Build claim instruction
      const claimIx = await program.methods
        .claim(new BN(ELIGIBLE_SUPPLY_ATOMIC.toString()))
        .accounts({
          holder: publicKey,
          config: DIVVY_CONFIG_PDA,
          holderBaseTokenAccount: holderBaseAta,
          holderDividendTokenAccount: holderDividendAta,
          dividendVault: DIVIDEND_VAULT_PDA,
          vaultAuthority: VAULT_AUTHORITY_PDA,
          claimRecord: claimRecordPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      tx.add(claimIx);

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );

      setClaimSuccessTx(signature);
      if (onSuccess) {
        onSuccess();
      }
      return signature;
    } catch (err: any) {
      console.error('Claim transaction error:', err);
      const errMsg = err?.message || 'Transaction failed or was rejected.';
      setClaimError(errMsg);
      return null;
    } finally {
      setClaiming(false);
    }
  }, [connection, publicKey, sendTransaction]);

  return {
    claiming,
    claimSuccessTx,
    claimError,
    claimDividends,
    resetClaimState,
  };
}
