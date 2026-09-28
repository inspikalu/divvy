'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  ExternalLink,
  ArrowRight,
  Search,
  RefreshCw,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';
import {
  getExplorerAddressUrl,
  BASE_MINT,
  DIVIDEND_MINT,
  DBC_POOL_ADDRESS,
  shortenAddress,
} from '@/lib/constants';
import {
  getDivvyProgram,
  getVaultPda,
  getTokenMetadata,
} from '@/lib/anchor';
import { YourPositionCard } from '@/components/YourPositionCard';
import { useHolderAccount } from '@/hooks/useHolderAccount';

export interface PoolData {
  configPda: string;
  baseMint: string;
  dividendMint: string;
  authority: string;
  feeShareBps: number;
  totalRouted: bigint;
  totalClaimed: bigint;
  vaultPda: string;
  vaultBalance: string;
  baseSymbol: string;
  dividendSymbol: string;
  isFeatured: boolean;
  dbcPoolAddress?: string;
}

/** 
 * Wrapper so hooks are always called at top level for the selected pool.
 * Hooks cannot be called conditionally, so we isolate them in their own component.
 */
function PoolPositionSection({
  pool,
}: {
  pool: PoolData;
}) {
  const baseMint = useMemo(() => new PublicKey(pool.baseMint), [pool.baseMint]);
  const dividendMint = useMemo(() => new PublicKey(pool.dividendMint), [pool.dividendMint]);

  // Parse vault balance from the string the parent already fetched
  const vaultBalanceAtomic = useMemo(
    () => BigInt(Math.round(parseFloat(pool.vaultBalance || '0') * 1e6)),
    [pool.vaultBalance]
  );

  const holderState = useHolderAccount(
    vaultBalanceAtomic,
    BigInt(0),
    BigInt(0),
    baseMint,
    dividendMint,
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Your Position in ${pool.baseSymbol} / ${pool.dividendSymbol}
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          Connect wallet to view
        </span>
      </div>
      <YourPositionCard
        holderState={holderState}
        baseSymbol={pool.baseSymbol}
        dividendSymbol={pool.dividendSymbol}
      />
    </div>
  );
}

export function PoolOverview() {
  const { connection } = useConnection();
  const [pools, setPools] = useState<PoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPoolMint, setSelectedPoolMint] = useState<string>(BASE_MINT.toBase58());
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllPools = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const program = getDivvyProgram(connection);
      const configs = await (program.account as any).divvyConfig.all();

      const poolsData: PoolData[] = await Promise.all(
        configs.map(async (c: any) => {
          const baseMint: PublicKey = c.account.baseMint;
          const dividendMint: PublicKey = c.account.dividendMint;
          const authority: PublicKey = c.account.authority;
          const feeShareBps: number = c.account.feeShareBps;
          const totalRouted = BigInt(c.account.totalRoutedDividends ? c.account.totalRoutedDividends.toString() : '0');
          const totalClaimed = BigInt(c.account.totalClaimedDividends ? c.account.totalClaimedDividends.toString() : '0');

          const isFeatured = baseMint.toBase58() === BASE_MINT.toBase58();
          const [vaultPda] = getVaultPda(baseMint);

          let vaultBalance = '0.00';
          try {
            const bal = await connection.getTokenAccountBalance(vaultPda);
            if (bal && bal.value && bal.value.uiAmountString) {
              vaultBalance = bal.value.uiAmountString;
            }
          } catch {
            // Vault empty or uninitialized
          }

          let baseSymbol = isFeatured ? 'POPCAT' : 'TOKEN';
          let dividendSymbol = isFeatured ? 'xSTOCK' : 'DIV';

          try {
            const baseMeta = await getTokenMetadata(connection, baseMint);
            if (baseMeta?.symbol) baseSymbol = baseMeta.symbol;
            const divMeta = await getTokenMetadata(connection, dividendMint);
            if (divMeta?.symbol) dividendSymbol = divMeta.symbol;
          } catch {
            // fallback
          }

          return {
            configPda: c.publicKey.toBase58(),
            baseMint: baseMint.toBase58(),
            dividendMint: dividendMint.toBase58(),
            authority: authority.toBase58(),
            feeShareBps,
            totalRouted,
            totalClaimed,
            vaultPda: vaultPda.toBase58(),
            vaultBalance,
            baseSymbol,
            dividendSymbol,
            isFeatured,
            dbcPoolAddress: isFeatured ? DBC_POOL_ADDRESS.toBase58() : undefined,
          };
        })
      );

      // Sort featured pool first, then by fee share or routed amount
      poolsData.sort((a, b) => {
        if (a.isFeatured) return -1;
        if (b.isFeatured) return 1;
        return Number(b.totalRouted - a.totalRouted);
      });

      setPools(poolsData);
      if (poolsData.length > 0 && !poolsData.some(p => p.baseMint === selectedPoolMint)) {
        setSelectedPoolMint(poolsData[0].baseMint);
      }
    } catch (err) {
      console.error('Failed to fetch on-chain pools:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [connection, selectedPoolMint]);

  useEffect(() => {
    fetchAllPools();
  }, [fetchAllPools]);

  // Filtered pools by search
  const filteredPools = useMemo(() => {
    if (!searchQuery.trim()) return pools;
    const q = searchQuery.toLowerCase().trim();
    return pools.filter(
      p =>
        p.baseMint.toLowerCase().includes(q) ||
        p.dividendMint.toLowerCase().includes(q) ||
        p.baseSymbol.toLowerCase().includes(q) ||
        p.dividendSymbol.toLowerCase().includes(q) ||
        p.authority.toLowerCase().includes(q)
    );
  }, [pools, searchQuery]);

  const currentPool = useMemo(() => {
    return pools.find(p => p.baseMint === selectedPoolMint) || pools[0] || null;
  }, [pools, selectedPoolMint]);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Pool Directory Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Registered Divvy Vaults</h2>
              <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {pools.length} On-Chain
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Meteora Dynamic Bonding Curve tokens with program-owned dividend distribution vaults.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAllPools(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/app/create"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 shadow-sm transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Launch Pool</span>
            </Link>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by mint address, symbol, or authority..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 font-mono text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Pool Selection Grid */}
        {loading && pools.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-mono">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto text-brand-600 mb-2" />
            Querying on-chain configs…
          </div>
        ) : filteredPools.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            No pools match &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPools.map((pool) => {
              const isSelected = pool.baseMint === selectedPoolMint;
              return (
                <div
                  key={pool.baseMint}
                  onClick={() => setSelectedPoolMint(pool.baseMint)}
                  className={`cursor-pointer rounded-lg border p-4 transition-all text-left ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/30 ring-1 ring-brand-400'
                      : 'border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          ${pool.baseSymbol}
                        </span>
                        <span className="text-xs text-slate-400">/</span>
                        <span className="font-mono font-semibold text-slate-700 text-xs">
                          ${pool.dividendSymbol}
                        </span>
                        {pool.isFeatured && (
                          <span className="text-[10px] font-mono font-semibold bg-brand-50 text-brand-700 border border-brand-200 px-1.5 py-0.2 rounded">
                            Showcase Pool
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 mt-1">
                        Base: {shortenAddress(pool.baseMint, 4)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {(pool.feeShareBps / 100).toFixed(0)}% Share
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="font-mono">
                      Vault: <span className="font-semibold text-slate-800">{pool.vaultBalance}</span> ${pool.dividendSymbol}
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 font-medium">
                      <span>{isSelected ? 'Viewing' : 'Inspect'}</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Pool Detailed Breakdown */}
      {currentPool && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Detailed Breakdown: ${currentPool.baseSymbol} / ${currentPool.dividendSymbol}
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Config PDA: {shortenAddress(currentPool.configPda, 4)}
            </span>
          </div>

          {/* Your Position : scoped to selected pool */}
          <PoolPositionSection pool={currentPool} />


          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              <div className="p-4 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Curve Type</span>
                <span className="font-mono text-sm font-bold text-slate-900 block">Dynamic Bonding Curve</span>
                <span className="text-[10px] text-slate-400 block">Linear Fee Scheduler</span>
              </div>

              <div className="p-4 space-y-1 border-t lg:border-t-0 border-slate-200">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Fee Allocation</span>
                <span className="font-mono text-sm font-bold text-brand-700 block">
                  {(currentPool.feeShareBps / 100).toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-400 block">Routed to Dividend Vault</span>
              </div>

              <div className="p-4 space-y-1 border-t lg:border-t-0 border-slate-200">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Vault Pot Balance</span>
                <span className="font-mono text-sm font-bold text-slate-900 block tabular-nums">
                  {currentPool.vaultBalance}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">${currentPool.dividendSymbol}</span>
              </div>

              <div className="p-4 space-y-1 border-t lg:border-t-0 border-slate-200">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 block">Cumulative Routed</span>
                <span className="font-mono text-sm font-bold text-slate-900 block tabular-nums">
                  {(Number(currentPool.totalRouted) / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">${currentPool.dividendSymbol}</span>
              </div>
            </div>
          </div>

          {/* On-Chain Addresses Data Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="font-semibold text-slate-700">On-Chain Accounts</span>
              <span className="font-mono text-[10px] text-slate-400">Solana Devnet</span>
            </div>

            <div className="divide-y divide-slate-100 font-mono">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-sans text-xs block">Base Meme Token</span>
                  <span className="text-slate-900 font-bold font-sans">${currentPool.baseSymbol}</span>
                </div>
                <a
                  href={getExplorerAddressUrl(currentPool.baseMint)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 transition-colors"
                >
                  {shortenAddress(currentPool.baseMint, 6)} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-sans text-xs block">Dividend Quote Asset</span>
                  <span className="text-slate-900 font-bold font-sans">${currentPool.dividendSymbol}</span>
                </div>
                <a
                  href={getExplorerAddressUrl(currentPool.dividendMint)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 transition-colors"
                >
                  {shortenAddress(currentPool.dividendMint, 6)} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-sans text-xs block">Dividend Vault PDA</span>
                  <span className="text-[10px] text-slate-400 font-sans">Token Account</span>
                </div>
                <a
                  href={getExplorerAddressUrl(currentPool.vaultPda)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 transition-colors"
                >
                  {shortenAddress(currentPool.vaultPda, 6)} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-sans text-xs block">Creator Authority</span>
                  <span className="text-[10px] text-slate-400 font-sans">Registered Deployer</span>
                </div>
                <a
                  href={getExplorerAddressUrl(currentPool.authority)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 transition-colors"
                >
                  {shortenAddress(currentPool.authority, 6)} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Pipeline Diagram */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Fee Distribution Flow</span>
              {currentPool.dbcPoolAddress && (
                <a
                  href={getExplorerAddressUrl(currentPool.dbcPoolAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono hover:text-brand-600 inline-flex items-center gap-1"
                >
                  DBC Pool: {shortenAddress(currentPool.dbcPoolAddress, 4)} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-lg border border-slate-200 bg-slate-50/50 text-center text-xs">
              <div className="p-3">
                <div className="text-[11px] text-slate-400 font-mono">01. Traded Token</div>
                <div className="font-bold text-slate-900 mt-0.5 font-mono">${currentPool.baseSymbol}</div>
              </div>
              <div className="p-3">
                <div className="text-[11px] text-slate-400 font-mono">02. Route to Vault</div>
                <div className="font-bold text-brand-700 mt-0.5 font-mono">
                  {(currentPool.feeShareBps / 100).toFixed(0)}% Share
                </div>
              </div>
              <div className="p-3">
                <div className="text-[11px] text-slate-400 font-mono">03. Holders Earn</div>
                <div className="font-bold text-slate-900 mt-0.5 font-mono">${currentPool.dividendSymbol}</div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
