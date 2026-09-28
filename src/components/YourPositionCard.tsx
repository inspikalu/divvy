'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Wallet } from 'lucide-react';
import { HolderAccountState } from '@/hooks/useHolderAccount';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { shortenAddress } from '@/lib/constants';

export function YourPositionCard({
  holderState,
  baseSymbol = 'TOKEN',
  dividendSymbol = 'DIV',
}: {
  holderState: HolderAccountState;
  baseSymbol?: string;
  dividendSymbol?: string;
}) {
  const {
    walletAddress,
    baseTokenBalanceFormatted,
    holdingPercentage,
    claimableDividendFormatted,
    isClaimed,
  } = holderState;

  if (!walletAddress) {
    return (
      <div className="rounded-xl border border-slate-900 bg-slate-950 text-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-400" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-brand-300">
                Your Position & Allocation
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Connect wallet to check your dividend yield
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Holding ${baseSymbol} continuously accrues a pro-rata share of trading fees in ${dividendSymbol}. Connect your wallet to view balance and claim.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Link
              href="/app/claim"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <span>Go to Claim Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-900 bg-slate-950 text-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Left: Position Balance info */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-emerald-400">
              Active Position
            </span>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
              {baseTokenBalanceFormatted}
            </span>
            <span className="text-sm font-semibold text-slate-300 font-mono">
              ${baseSymbol}
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              {holdingPercentage.toFixed(3)}% of supply
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Connected: <span className="font-mono text-slate-300">{shortenAddress(walletAddress, 4)}</span>
          </p>
        </div>

        {/* Right: Claimable yield & primary button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
          <div className="text-left sm:text-right">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
              {isClaimed ? 'Yield Status' : 'Claimable Dividend'}
            </span>
            <div className="mt-0.5">
              {isClaimed ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 font-mono">
                  <BadgeCheck className="h-4 w-4" /> Settled Up to Date
                </span>
              ) : (
                <div className="flex items-baseline sm:justify-end gap-1.5">
                  <span className="font-mono text-2xl font-bold text-white tabular-nums">
                    {claimableDividendFormatted}
                  </span>
                  <span className="text-xs font-semibold text-brand-300 font-mono">
                    ${dividendSymbol}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/app/claim"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <span>{isClaimed ? 'View Claim Portal' : 'Claim Dividends'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
