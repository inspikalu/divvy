'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ExternalLink, RefreshCw, ChevronRight } from 'lucide-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { PagePanel } from '@/components/PagePanel';
import { HolderClaimCard } from '@/components/HolderClaimCard';
import { useHolderAccount } from '@/hooks/useHolderAccount';
import { useHolderClaim } from '@/hooks/useHolderClaim';
import {
  BASE_MINT,
  getExplorerAddressUrl,
  shortenAddress,
  formatCompactNumber,
} from '@/lib/constants';
import {
  getDivvyProgram,
  getVaultPda,
  getTokenMetadata,
} from '@/lib/anchor';

interface RegisteredPool {
  configPda: string;
  baseMint: string;
  dividendMint: string;
  baseSymbol: string;
  dividendSymbol: string;
  feeShareBps: number;
  vaultBalance: string;
  vaultBalanceAtomic: bigint;
  cumulativeDividendPerToken: bigint;
  eligibleSupplyAtomic: bigint;
  isFeatured: boolean;
}

export default function ClaimPage() {
  const { connection } = useConnection();
  const [pools, setPools] = useState<RegisteredPool[]>([]);
  const [loadingPools, setLoadingPools] = useState(true);
  const [selectedPoolMint, setSelectedPoolMint] = useState<string>(BASE_MINT.toBase58());

  const fetchRegisteredPools = useCallback(async () => {
    try {
      setLoadingPools(true);
      const program = getDivvyProgram(connection);
      const configs = await (program.account as any).divvyConfig.all();

      const poolsData: RegisteredPool[] = await Promise.all(
        configs.map(async (c: any) => {
          const baseMint: PublicKey = c.account.baseMint;
          const dividendMint: PublicKey = c.account.dividendMint;
          const feeShareBps: number = c.account.feeShareBps;
          const isFeatured = baseMint.toBase58() === BASE_MINT.toBase58();
          const [vaultPda] = getVaultPda(baseMint);

          let vaultBalance = '0.00';
          let vaultBalanceAtomic = BigInt(0);
          try {
            const bal = await connection.getTokenAccountBalance(vaultPda);
            if (bal?.value) {
              vaultBalanceAtomic = BigInt(bal.value.amount);
              if (bal.value.uiAmountString) {
                vaultBalance = bal.value.uiAmountString;
              }
            }
          } catch {
            // Uninitialized or empty
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

          let eligibleSupplyAtomic = BigInt(0);
          try {
            const supplyResp = await connection.getTokenSupply(baseMint);
            if (supplyResp.value) {
              const totalSupply = BigInt(supplyResp.value.amount);
              const largestAccs = await connection.getTokenLargestAccounts(baseMint);
              if (largestAccs.value && largestAccs.value.length > 0) {
                const reserveSupply = BigInt(largestAccs.value[0].amount);
                if (totalSupply > reserveSupply) {
                  eligibleSupplyAtomic = totalSupply - reserveSupply;
                }
              }
              if (eligibleSupplyAtomic === BigInt(0)) {
                eligibleSupplyAtomic = totalSupply;
              }
            }
          } catch {
            // fallback
          }

          const cumulativeDividendPerToken = BigInt(
            c.account.cumulativeDividendPerToken ? c.account.cumulativeDividendPerToken.toString() : '0'
          );

          return {
            configPda: c.publicKey.toBase58(),
            baseMint: baseMint.toBase58(),
            dividendMint: dividendMint.toBase58(),
            baseSymbol,
            dividendSymbol,
            feeShareBps,
            vaultBalance,
            vaultBalanceAtomic,
            cumulativeDividendPerToken,
            eligibleSupplyAtomic,
            isFeatured,
          };
        })
      );

      // Sort featured pool first, then others
      poolsData.sort((a, b) => {
        if (a.isFeatured) return -1;
        if (b.isFeatured) return 1;
        return 0;
      });

      setPools(poolsData);
      if (poolsData.length > 0 && !poolsData.some((p) => p.baseMint === selectedPoolMint)) {
        setSelectedPoolMint(poolsData[0].baseMint);
      }
    } catch (err) {
      console.error('Failed to load pools on claim page:', err);
    } finally {
      setLoadingPools(false);
    }
  }, [connection, selectedPoolMint]);

  useEffect(() => {
    fetchRegisteredPools();
  }, [fetchRegisteredPools]);

  const currentPool = useMemo(() => {
    return pools.find((p) => p.baseMint === selectedPoolMint) || pools[0] || null;
  }, [pools, selectedPoolMint]);

  return (
    <PagePanel
      title="Claim Portal"
      subtitle="Withdraw your accumulated pro-rata dividend yield directly from the on-chain vault."
    >
      <div className="space-y-6">
        {/* Pool Selector Strip when multiple pools are available */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Select Dividend Pool</span>
              <span className="text-[11px] text-slate-500 block">
                Choose the token pool you hold to claim accrued distributions.
              </span>
            </div>
            <button
              onClick={() => fetchRegisteredPools()}
              disabled={loadingPools}
              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`h-3 w-3 ${loadingPools ? 'animate-spin text-brand-600' : ''}`} />
              <span>Refresh Pools</span>
            </button>
          </div>

          {loadingPools && pools.length === 0 ? (
            <div className="py-4 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="h-3 w-3 animate-spin text-brand-600" />
              <span>Loading on-chain pools...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {pools.map((pool) => {
                const isSelected = pool.baseMint === currentPool?.baseMint;
                return (
                  <button
                    key={pool.baseMint}
                    onClick={() => setSelectedPoolMint(pool.baseMint)}
                    className={`flex items-center justify-between rounded-lg p-3 text-left transition-all border ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-400'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          ${pool.baseSymbol}
                        </span>
                        <span className="text-[10px] text-slate-400">/</span>
                        <span className="font-mono text-[11px] font-semibold text-slate-600">
                          ${pool.dividendSymbol}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        Vault: {pool.vaultBalance} ${pool.dividendSymbol}
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-brand-600' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Pool-Scoped Claim Section */}
        {currentPool && <ClaimExecutionSection pool={currentPool} />}
      </div>
    </PagePanel>
  );
}

function ClaimExecutionSection({ pool }: { pool: RegisteredPool }) {
  const baseMint = useMemo(() => new PublicKey(pool.baseMint), [pool.baseMint]);
  const dividendMint = useMemo(() => new PublicKey(pool.dividendMint), [pool.dividendMint]);
  const [vaultPda] = useMemo(() => getVaultPda(baseMint), [baseMint]);

  const holderState = useHolderAccount(
    pool.vaultBalanceAtomic,
    pool.cumulativeDividendPerToken,
    pool.eligibleSupplyAtomic,
    baseMint,
    dividendMint
  );

  const claimActions = useHolderClaim({
    baseMint,
    dividendMint,
    dividendSymbol: pool.dividendSymbol,
    eligibleSupplyAtomic: pool.eligibleSupplyAtomic,
  });

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5">
      {/* Main Claim Hero Card (Left, 3 cols) */}
      <div className="lg:col-span-3">
        <HolderClaimCard
          holderState={holderState}
          claimActions={claimActions}
          baseSymbol={pool.baseSymbol}
          dividendSymbol={pool.dividendSymbol}
        />
      </div>

      {/* Unified Mathematical Breakdown Panel (Right, 2 cols) */}
      <aside className="lg:col-span-2 space-y-4" aria-label="Claim calculation details">
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Formula &amp; Allocation (${pool.baseSymbol})
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Pro-Rata Index
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Row 1 */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Your Base Holding</span>
                <a
                  href={getExplorerAddressUrl(pool.baseMint)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-brand-600 transition-colors"
                >
                  {shortenAddress(pool.baseMint, 4)} <ExternalLink className="h-2 w-2" />
                </a>
              </div>
              <div className="text-right font-mono font-bold text-slate-900 tabular-nums">
                {formatCompactNumber(Number(holderState.baseTokenBalanceAtomic) / 1e6)} ${pool.baseSymbol}
              </div>
            </div>

            {/* Row 2 */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Eligible Circulating Supply</span>
                <span className="text-[10px] text-slate-400">Community pool share denominator</span>
              </div>
              <div className="text-right font-mono font-bold text-slate-900 tabular-nums">
                {formatCompactNumber(Number(pool.eligibleSupplyAtomic) / 1e6)} ${pool.baseSymbol}
              </div>
            </div>

            {/* Row 3 */}
            <div className="p-3.5 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Dividend Vault Balance</span>
                <a
                  href={getExplorerAddressUrl(vaultPda)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-brand-600 transition-colors"
                >
                  Vault PDA <ExternalLink className="h-2 w-2" />
                </a>
              </div>
              <div className="text-right font-mono font-bold text-slate-900 tabular-nums">
                {pool.vaultBalance} ${pool.dividendSymbol}
              </div>
            </div>

            {/* Row 4: Calculation Result */}
            <div className="p-3.5 bg-slate-50/70 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-700 block">Your Pro-Rata Share</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {holderState.holdingPercentage.toFixed(4)}% of pool
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-brand-700 tabular-nums block">
                  {holderState.isClaimed
                    ? `0.000000 ${pool.dividendSymbol}`
                    : `${holderState.claimableDividendFormatted} ${pool.dividendSymbol}`}
                </span>
                {holderState.isClaimed && (
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">Settled</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Helper Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <span className="text-xs font-bold text-slate-900 block">Need test tokens?</span>
          <p className="text-xs leading-relaxed text-slate-500">
            To test claiming, connect one of the pre-funded demo holder wallets holding base meme tokens.
          </p>
          <div className="pt-1">
            <Link
              href="/app/demo"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <span>View Demo Wallets Guide</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
