'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import {
  BASE_MINT,
  DIVIDEND_MINT,
  ELIGIBLE_SUPPLY_ATOMIC,
} from '@/lib/constants';
import {
  getDivvyProgram,
  getClaimRecordPda,
  calculateProRataShare,
  calculateIndexClaimAmount,
} from '@/lib/anchor';

export interface ClaimRecordData {
  holder: PublicKey;
  baseMint: PublicKey;
  claimedAmount: bigint;
  claimedAt: number;
  lastClaimedIndex: bigint;
  bump: number;
}

export interface HolderAccountState {
  walletAddress: PublicKey | null;
  solBalance: number;
  baseTokenBalanceAtomic: bigint;
  baseTokenBalanceFormatted: string;
  dividendTokenBalanceAtomic: bigint;
  dividendTokenBalanceFormatted: string;
  claimRecord: ClaimRecordData | null;
  isClaimed: boolean;
  canClaim: boolean;
  claimableDividendAtomic: bigint;
  claimableDividendFormatted: string;
  holdingPercentage: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useHolderAccount(
  vaultBalanceAtomic: bigint,
  cumulativeDividendPerToken: bigint = BigInt(0)
): HolderAccountState {
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [solBalance, setSolBalance] = useState<number>(0);
  const [baseTokenBalanceAtomic, setBaseTokenBalanceAtomic] = useState<bigint>(BigInt(0));
  const [dividendTokenBalanceAtomic, setDividendTokenBalanceAtomic] = useState<bigint>(BigInt(0));
  const [claimRecord, setClaimRecord] = useState<ClaimRecordData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHolderData = useCallback(async () => {
    if (!publicKey) {
      setSolBalance(0);
      setBaseTokenBalanceAtomic(BigInt(0));
      setDividendTokenBalanceAtomic(BigInt(0));
      setClaimRecord(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Fetch SOL Balance
      const lamports = await connection.getBalance(publicKey);
      setSolBalance(lamports / LAMPORTS_PER_SOL);

      // 2. Fetch Base Token ATA Balance
      try {
        const baseAta = getAssociatedTokenAddressSync(BASE_MINT, publicKey);
        const baseResp = await connection.getTokenAccountBalance(baseAta);
        if (baseResp.value) {
          setBaseTokenBalanceAtomic(BigInt(baseResp.value.amount));
        } else {
          setBaseTokenBalanceAtomic(BigInt(0));
        }
      } catch (err: any) {
        setBaseTokenBalanceAtomic(BigInt(0));
      }

      // 3. Fetch Dividend Token ATA Balance
      try {
        const dividendAta = getAssociatedTokenAddressSync(DIVIDEND_MINT, publicKey);
        const divResp = await connection.getTokenAccountBalance(dividendAta);
        if (divResp.value) {
          setDividendTokenBalanceAtomic(BigInt(divResp.value.amount));
        } else {
          setDividendTokenBalanceAtomic(BigInt(0));
        }
      } catch (err: any) {
        setDividendTokenBalanceAtomic(BigInt(0));
      }

      // 4. Fetch ClaimRecord PDA
      try {
        const [claimRecordPda] = getClaimRecordPda(BASE_MINT, publicKey);
        const program = getDivvyProgram(connection);
        try {
          const record = await (program.account as any).claimRecord.fetchNullable(claimRecordPda);
          if (record) {
            setClaimRecord({
              holder: record.holder as PublicKey,
              baseMint: record.baseMint as PublicKey,
              claimedAmount: BigInt(record.claimedAmount.toString()),
              claimedAt: Number(record.claimedAt.toString()),
              lastClaimedIndex: BigInt(
                record.lastClaimedIndex ? record.lastClaimedIndex.toString() : '0'
              ),
              bump: record.bump as number,
            });
          } else {
            setClaimRecord(null);
          }
        } catch {
          const info = await connection.getAccountInfo(claimRecordPda);
          if (info && info.data && info.data.length >= 89) {
            const buf = info.data;
            const holder = new PublicKey(buf.subarray(8, 40));
            const baseMint = new PublicKey(buf.subarray(40, 72));
            const claimedAmount = buf.readBigUInt64LE(72);
            const claimedAt = Number(buf.readBigInt64LE(80));
            let lastClaimedIndex = BigInt(0);
            let bump = 255;
            if (buf.length >= 105) {
              const low = buf.readBigUInt64LE(88);
              const high = buf.readBigUInt64LE(96);
              lastClaimedIndex = low + (high << BigInt(64));
              bump = buf.readUInt8(104);
            } else {
              bump = buf.readUInt8(88);
            }
            setClaimRecord({
              holder,
              baseMint,
              claimedAmount,
              claimedAt,
              lastClaimedIndex,
              bump,
            });
          } else {
            setClaimRecord(null);
          }
        }
      } catch (err: any) {
        setClaimRecord(null);
      }

    } catch (err: any) {
      console.error('Failed to fetch holder account details from RPC:', err);
      setError(err?.message || 'Error fetching holder details');
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchHolderData();
  }, [fetchHolderData]);

  // Option B: Calculate continuous cumulative claimable amount
  const lastIndex = claimRecord ? claimRecord.lastClaimedIndex : BigInt(0);

  let claimableDividendAtomic = BigInt(0);
  if (baseTokenBalanceAtomic > BigInt(0)) {
    if (cumulativeDividendPerToken > BigInt(0)) {
      claimableDividendAtomic = calculateIndexClaimAmount(
        baseTokenBalanceAtomic,
        cumulativeDividendPerToken,
        lastIndex
      );
    } else if (!claimRecord) {
      // Fallback pro-rata share if index not initialized
      claimableDividendAtomic = calculateProRataShare(
        vaultBalanceAtomic,
        baseTokenBalanceAtomic,
        ELIGIBLE_SUPPLY_ATOMIC
      );
    }
  }

  const canClaim = claimableDividendAtomic > BigInt(0);
  const isClaimed = !!claimRecord && !canClaim;

  const holdingPercentage = Number(ELIGIBLE_SUPPLY_ATOMIC) > 0
    ? (Number(baseTokenBalanceAtomic) / Number(ELIGIBLE_SUPPLY_ATOMIC)) * 100
    : 0;

  return {
    walletAddress: publicKey,
    solBalance,
    baseTokenBalanceAtomic,
    baseTokenBalanceFormatted: (Number(baseTokenBalanceAtomic) / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }),
    dividendTokenBalanceAtomic,
    dividendTokenBalanceFormatted: (Number(dividendTokenBalanceAtomic) / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }),
    claimRecord,
    isClaimed,
    canClaim,
    claimableDividendAtomic,
    claimableDividendFormatted: (Number(claimableDividendAtomic) / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }),
    holdingPercentage,
    loading,
    error,
    refresh: fetchHolderData,
  };
}
