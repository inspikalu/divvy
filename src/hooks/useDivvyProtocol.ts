'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  DIVVY_PROGRAM_ID,
  DIVVY_CONFIG_PDA,
  DIVIDEND_VAULT_PDA,
  DIVIDEND_MINT,
  BASE_MINT,
  DBC_POOL_ADDRESS,
} from '@/lib/constants';
import { getDivvyProgram, getTokenMetadata } from '@/lib/anchor';
import { ELIGIBLE_SUPPLY_ATOMIC as FALLBACK_SUPPLY } from '@/lib/constants';

export interface DivvyConfigData {
  authority: PublicKey;
  baseMint: PublicKey;
  dividendMint: PublicKey;
  feeShareBps: number;
  totalRoutedDividends: bigint;
  totalClaimedDividends: bigint;
  cumulativeDividendPerToken: bigint;
  bump: number;
  vaultBump: number;
}

export interface ProtocolMetrics {
  config: DivvyConfigData | null;
  vaultBalanceAtomic: bigint;
  vaultBalanceFormatted: string;
  totalRoutedAtomic: bigint;
  totalRoutedFormatted: string;
  totalClaimedAtomic: bigint;
  totalClaimedFormatted: string;
  cumulativeDividendPerToken: bigint;
  feeSharePercent: number;
  baseSymbol: string;
  dividendSymbol: string;
  eligibleSupplyAtomic: bigint;
  eligibleSupplyFormatted: string;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDivvyProtocol(): ProtocolMetrics {
  const { connection } = useConnection();
  const [config, setConfig] = useState<DivvyConfigData | null>(null);
  const [vaultBalanceAtomic, setVaultBalanceAtomic] = useState<bigint>(BigInt(0));
  const [baseSymbol, setBaseSymbol] = useState<string>('DVY');
  const [dividendSymbol, setDividendSymbol] = useState<string>('xSTOCK');
  const [eligibleSupplyAtomic, setEligibleSupplyAtomic] = useState<bigint>(FALLBACK_SUPPLY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const fetchProtocolData = useCallback(async (opts?: { background?: boolean }) => {
    try {
      if (hasLoadedOnceRef.current) {
        // Background or manual refresh: keep the previously loaded values on
        // screen instead of flashing the loading spinner over live data.
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const program = getDivvyProgram(connection);

      // 1. Fetch DivvyConfig on-chain account
      try {
        const configAccount = await (program.account as any).divvyConfig.fetchNullable(DIVVY_CONFIG_PDA);
        if (configAccount) {
          setConfig({
            authority: configAccount.authority as PublicKey,
            baseMint: configAccount.baseMint as PublicKey,
            dividendMint: configAccount.dividendMint as PublicKey,
            feeShareBps: configAccount.feeShareBps as number,
            totalRoutedDividends: BigInt(configAccount.totalRoutedDividends.toString()),
            totalClaimedDividends: BigInt(configAccount.totalClaimedDividends.toString()),
            cumulativeDividendPerToken: BigInt(
              configAccount.cumulativeDividendPerToken
                ? configAccount.cumulativeDividendPerToken.toString()
                : '0'
            ),
            bump: configAccount.bump as number,
            vaultBump: configAccount.vaultBump as number,
          });
        }
      } catch {
        // Fallback: parse raw account buffer for legacy/transitional account sizes
        const info = await connection.getAccountInfo(DIVVY_CONFIG_PDA);
        if (info && info.data && info.data.length >= 124) {
          const buf = info.data;
          const authority = new PublicKey(buf.subarray(8, 40));
          const baseMint = new PublicKey(buf.subarray(40, 72));
          const dividendMint = new PublicKey(buf.subarray(72, 104));
          const feeShareBps = buf.readUInt16LE(104);
          const totalRoutedDividends = buf.readBigUInt64LE(106);
          const totalClaimedDividends = buf.readBigUInt64LE(114);
          let cumulativeDividendPerToken = BigInt(0);
          let bump = 255;
          let vaultBump = 255;
          if (buf.length >= 140) {
            const low = buf.readBigUInt64LE(122);
            const high = buf.readBigUInt64LE(130);
            cumulativeDividendPerToken = low + (high << BigInt(64));
            bump = buf.readUInt8(138);
            vaultBump = buf.readUInt8(139);
          } else {
            bump = buf.readUInt8(122);
            vaultBump = buf.readUInt8(123);
          }
          setConfig({
            authority,
            baseMint,
            dividendMint,
            feeShareBps,
            totalRoutedDividends,
            totalClaimedDividends,
            cumulativeDividendPerToken,
            bump,
            vaultBump,
          });
        }
      }

      // 2. Fetch DividendVault Token Account Balance
      try {
        const vaultBalanceResp = await connection.getTokenAccountBalance(DIVIDEND_VAULT_PDA);
        if (vaultBalanceResp.value) {
          setVaultBalanceAtomic(BigInt(vaultBalanceResp.value.amount));
        }
      } catch (err: any) {
        // Vault token account might be empty or uninitialized
        setVaultBalanceAtomic(BigInt(0));
      }

      // 3. Dynamically fetch on-chain token symbols & names from Metaplex
      const baseMintTarget = config?.baseMint || BASE_MINT;
      const divMintTarget = config?.dividendMint || DIVIDEND_MINT;

      try {
        const baseMeta = await getTokenMetadata(connection, baseMintTarget);
        if (baseMeta && baseMeta.symbol) {
          setBaseSymbol(baseMeta.symbol);
        }
        const divMeta = await getTokenMetadata(connection, divMintTarget);
        if (divMeta && divMeta.symbol) {
          setDividendSymbol(divMeta.symbol);
        }
      } catch {
        // Keep defaults if metadata not set
      }

      // 4. Dynamically compute circulating / eligible supply from on-chain accounts
      try {
        const supplyResp = await connection.getTokenSupply(baseMintTarget);
        if (supplyResp.value) {
          const totalSupply = BigInt(supplyResp.value.amount);
          // Find reserve token accounts (e.g. largest account holding the bonding curve supply)
          const largestAccs = await connection.getTokenLargestAccounts(baseMintTarget);
          if (largestAccs.value && largestAccs.value.length > 0) {
            const curveVaultSupply = BigInt(largestAccs.value[0].amount);
            if (totalSupply > curveVaultSupply) {
              const circulating = totalSupply - curveVaultSupply;
              setEligibleSupplyAtomic(circulating);
            }
          }
        }
      } catch {
        // Keep fallback if RPC query fails
      }

    } catch (err: any) {
      console.error('Failed to fetch Divvy protocol metrics from RPC:', err);
      setError(err?.message || 'Error fetching protocol data');
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedOnceRef.current = true;
    }
  }, [connection]);

  useEffect(() => {
    fetchProtocolData();
    const interval = setInterval(() => fetchProtocolData({ background: true }), 15000);
    return () => clearInterval(interval);
  }, [fetchProtocolData]);

  const totalRoutedAtomic = config ? config.totalRoutedDividends : BigInt(0);
  const totalClaimedAtomic = config ? config.totalClaimedDividends : BigInt(0);
  const feeSharePercent = config ? config.feeShareBps / 100 : 60;

  return {
    config,
    vaultBalanceAtomic,
    vaultBalanceFormatted: (Number(vaultBalanceAtomic) / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }),
    totalRoutedAtomic,
    totalRoutedFormatted: (Number(totalRoutedAtomic) / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }),
    totalClaimedAtomic,
    totalClaimedFormatted: (Number(totalClaimedAtomic) / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }),
    cumulativeDividendPerToken: config ? config.cumulativeDividendPerToken : BigInt(0),
    feeSharePercent,
    baseSymbol,
    dividendSymbol,
    eligibleSupplyAtomic,
    eligibleSupplyFormatted: (Number(eligibleSupplyAtomic) / 1e6).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }),
    loading,
    refreshing,
    error,
    refresh: fetchProtocolData,
  };
}
