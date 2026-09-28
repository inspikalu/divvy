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
import { toast } from 'sonner';
import {
  BASE_MINT,
  DIVIDEND_MINT,
  DIVVY_CONFIG_PDA,
  DIVIDEND_VAULT_PDA,
  VAULT_AUTHORITY_PDA,
  ELIGIBLE_SUPPLY_ATOMIC,
  getExplorerTxUrl,
} from '@/lib/constants';
import {
  getDivvyProgram,
  getClaimRecordPda,
  getConfigPda,
  getVaultPda,
  getVaultAuthorityPda,
} from '@/lib/anchor';

export interface UseHolderClaimOptions {
  baseMint?: PublicKey;
  dividendMint?: PublicKey;
  dividendSymbol?: string;
  eligibleSupplyAtomic?: bigint;
}

export interface UseHolderClaimReturn {
  claiming: boolean;
  claimSuccessTx: string | null;
  claimDividends: (onSuccess?: () => void) => Promise<string | null>;
  resetClaimState: () => void;
}

/** Parse a Solana/Anchor error into a short, user-friendly message */
function parseClaimError(err: any): string {
  const msg: string = err?.message ?? '';

  if (msg.includes('User rejected') || msg.includes('rejected the request')) {
    return 'Transaction cancelled by wallet.';
  }
  if (msg.includes('AccountDidNotDeserialize') || msg.includes('3003')) {
    return 'On-chain account layout mismatch. Please contact support.';
  }
  if (msg.includes('ZeroClaimAmount') || msg.includes('0xbba')) {
    return 'Nothing to claim yet. No new dividends have accrued since your last claim.';
  }
  if (msg.includes('NoEligibleBalance') || msg.includes('0xbb9')) {
    return 'You have no base token balance eligible to claim.';
  }
  if (msg.includes('insufficient funds') || msg.includes('0x1')) {
    return 'Insufficient SOL to pay transaction fees.';
  }
  if (msg.includes('blockhash') || msg.includes('block height exceeded')) {
    return 'Transaction expired. Please try again.';
  }
  if (msg.includes('timeout') || msg.includes('Timeout')) {
    return 'Network timeout. Check your connection and try again.';
  }

  // Generic fallback: trim to 120 chars so it fits in a toast
  return msg.length > 120 ? msg.slice(0, 117) + '...' : msg || 'Transaction failed.';
}

export function useHolderClaim(options?: UseHolderClaimOptions): UseHolderClaimReturn {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [claiming, setClaiming] = useState<boolean>(false);
  const [claimSuccessTx, setClaimSuccessTx] = useState<string | null>(null);

  const resetClaimState = useCallback(() => {
    setClaimSuccessTx(null);
  }, []);

  const activeBaseMint = options?.baseMint ?? BASE_MINT;
  const activeDividendMint = options?.dividendMint ?? DIVIDEND_MINT;
  const activeDividendSymbol = options?.dividendSymbol ?? 'DIV';
  const activeEligibleSupply = options?.eligibleSupplyAtomic ?? ELIGIBLE_SUPPLY_ATOMIC;

  const claimDividends = useCallback(async (onSuccess?: () => void): Promise<string | null> => {
    if (!publicKey || !sendTransaction) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet before claiming.',
      });
      return null;
    }

    const toastId = toast.loading('Preparing claim transaction...');

    try {
      setClaiming(true);
      setClaimSuccessTx(null);

      const [configPda] = getConfigPda(activeBaseMint);
      const [vaultPda] = getVaultPda(activeBaseMint);
      const [vaultAuthorityPda] = getVaultAuthorityPda(activeBaseMint);
      const [claimRecordPda] = getClaimRecordPda(activeBaseMint, publicKey);

      const holderBaseAta = getAssociatedTokenAddressSync(activeBaseMint, publicKey);
      const holderDividendAta = getAssociatedTokenAddressSync(activeDividendMint, publicKey);

      const tx = new Transaction();

      // Ensure recipient dividend ATA exists
      tx.add(
        createAssociatedTokenAccountIdempotentInstruction(
          publicKey,
          holderDividendAta,
          publicKey,
          activeDividendMint
        )
      );

      const program = getDivvyProgram(connection);

      // Build claim instruction
      const claimIx = await program.methods
        .claim(new BN(activeEligibleSupply.toString()))
        .accounts({
          holder: publicKey,
          config: configPda,
          holderBaseTokenAccount: holderBaseAta,
          holderDividendTokenAccount: holderDividendAta,
          dividendVault: vaultPda,
          vaultAuthority: vaultAuthorityPda,
          claimRecord: claimRecordPda,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      tx.add(claimIx);

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      toast.loading('Awaiting wallet approval...', { id: toastId });

      const signature = await sendTransaction(tx, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      toast.loading('Confirming on-chain...', { id: toastId });

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      setClaimSuccessTx(signature);

      toast.success('Dividends claimed!', {
        id: toastId,
        description: `Your $${activeDividendSymbol} has been transferred to your wallet.`,
        action: {
          label: 'View Tx',
          onClick: () => window.open(getExplorerTxUrl(signature), '_blank'),
        },
        duration: 10000,
      });

      if (onSuccess) onSuccess();
      return signature;
    } catch (err: any) {
      console.error('Claim transaction error:', err);
      const friendly = parseClaimError(err);
      toast.error('Claim failed', {
        id: toastId,
        description: friendly,
        duration: 8000,
      });
      return null;
    } finally {
      setClaiming(false);
    }
  }, [
    connection,
    publicKey,
    sendTransaction,
    activeBaseMint,
    activeDividendMint,
    activeDividendSymbol,
    activeEligibleSupply,
  ]);

  return {
    claiming,
    claimSuccessTx,
    claimDividends,
    resetClaimState,
  };
}
