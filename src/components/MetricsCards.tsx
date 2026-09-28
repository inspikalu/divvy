'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Layers, ArrowUpRight, CheckCircle2, Vault } from 'lucide-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import {
  getDivvyProgram,
  getVaultPda,
} from '@/lib/anchor';

interface AggregateMetrics {
  poolCount: number;
  totalRoutedAtomic: bigint;
  totalClaimedAtomic: bigint;
  totalVaultBalanceNumeric: number;
  uniqueDividendMintsCount: number;
}

export function MetricsCards() {
  const { connection } = useConnection();
  const [metrics, setMetrics] = useState<AggregateMetrics>({
    poolCount: 0,
    totalRoutedAtomic: BigInt(0),
    totalClaimedAtomic: BigInt(0),
    totalVaultBalanceNumeric: 0,
    uniqueDividendMintsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProtocolTelemetry = useCallback(async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      else setLoading(true);

      const program = getDivvyProgram(connection);
      const configs = await (program.account as any).divvyConfig.all();

      let totalRouted = BigInt(0);
      let totalClaimed = BigInt(0);
      let totalVaultBal = 0;
      const dividendMints = new Set<string>();

      await Promise.all(
        configs.map(async (c: any) => {
          const baseMint: PublicKey = c.account.baseMint;
          const dividendMint: PublicKey = c.account.dividendMint;
          dividendMints.add(dividendMint.toBase58());

          const routed = BigInt(c.account.totalRoutedDividends?.toString() ?? '0');
          const claimed = BigInt(c.account.totalClaimedDividends?.toString() ?? '0');
          totalRouted += routed;
          totalClaimed += claimed;

          const [vaultPda] = getVaultPda(baseMint);
          try {
            const bal = await connection.getTokenAccountBalance(vaultPda);
            if (bal?.value?.uiAmount) {
              totalVaultBal += bal.value.uiAmount;
            }
          } catch {
            // Vault empty or not yet funded
          }
        })
      );

      setMetrics({
        poolCount: configs.length,
        totalRoutedAtomic: totalRouted,
        totalClaimedAtomic: totalClaimed,
        totalVaultBalanceNumeric: totalVaultBal,
        uniqueDividendMintsCount: dividendMints.size,
      });
    } catch (err) {
      console.error('Failed to aggregate protocol telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [connection]);

  useEffect(() => {
    fetchProtocolTelemetry();
    const interval = setInterval(() => fetchProtocolTelemetry(), 15000);
    return () => clearInterval(interval);
  }, [fetchProtocolTelemetry]);

  const claimedPercent =
    metrics.totalRoutedAtomic > BigInt(0)
      ? Math.round((Number(metrics.totalClaimedAtomic) / Number(metrics.totalRoutedAtomic)) * 100)
      : 0;

  const totalRoutedFormatted = (Number(metrics.totalRoutedAtomic) / 1e6).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const totalClaimedFormatted = (Number(metrics.totalClaimedAtomic) / 1e6).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const totalVaultBalanceFormatted = metrics.totalVaultBalanceNumeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Top action/status bar */}
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700">Global Protocol Telemetry</span>
          <span className="text-[11px] font-mono text-slate-400">
            Across {metrics.uniqueDividendMintsCount} dividend mint{metrics.uniqueDividendMintsCount === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchProtocolTelemetry(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
          <Link
            href="/app/pool"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>Pools Directory</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 hairline data columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        
        {/* Stat 1: Registered Pools */}
        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Registered Pools
            </span>
            <Layers className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div>
            <span className="font-mono text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {loading ? '...' : metrics.poolCount}
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">
              Active Meteora DBC vaults
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            Permissionless deployment
          </div>
        </div>

        {/* Stat 2: Cumulative Routed */}
        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-2 border-t sm:border-t-0 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Fees Routed
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div>
            <span className="font-mono text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {loading ? '...' : totalRoutedFormatted}
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">
              Cumulative dividend units
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            Automated index growth
          </div>
        </div>

        {/* Stat 3: Total Claimed */}
        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-2 border-t lg:border-t-0 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Claimed
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {loading ? '...' : totalClaimedFormatted}
              </span>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                ({claimedPercent}%)
              </span>
            </div>
            <span className="block text-xs text-slate-400 mt-0.5">
              Distributed to holders
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            Pro-rata holder claims
          </div>
        </div>

        {/* Stat 4: Active Vault Balance */}
        <div className="p-4 sm:p-5 flex flex-col justify-between space-y-2 border-t lg:border-t-0 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Live Vault Liquidity
            </span>
            <Vault className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div>
            <span className="font-mono text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
              {loading ? '...' : totalVaultBalanceFormatted}
            </span>
            <span className="block text-xs text-slate-400 mt-0.5">
              Unclaimed pot balance
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            Available for claim
          </div>
        </div>

      </div>
    </div>
  );
}
