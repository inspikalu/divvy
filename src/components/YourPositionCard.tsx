'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Wallet } from 'lucide-react';
import { HolderAccountState } from '@/hooks/useHolderAccount';

export function YourPositionCard({ holderState }: { holderState: HolderAccountState }) {
  const {
    walletAddress,
    baseTokenBalanceFormatted,
    holdingPercentage,
    claimableDividendFormatted,
    isClaimed,
  } = holderState;

  if (!walletAddress) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-accent p-5">
        {/* Left: content */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Your position</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Connect a wallet to see your base token holding and claimable dividend.
            </p>
          </div>
        </div>

        {/* Right: link */}
        <Link
          href="/claim"
          className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-medium text-brand-600 transition-colors hover:border-brand-200 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          Claim Portal <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-brand-200 bg-brand-50 p-5">
      {/* Left: content */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
          <Wallet className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest text-brand-600">
            Your position
          </div>
          {holderState.loading ? (
            <div className="mt-1 text-sm text-slate-500">Loading balances…</div>
          ) : (
            <div className="mt-0.5 truncate text-sm text-slate-700">
              <span className="font-semibold text-slate-900">{baseTokenBalanceFormatted}</span>{' '}
              base tokens
              <span className="ml-1.5 text-xs text-slate-500">
                ({holdingPercentage.toFixed(2)}% of eligible supply)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: data + action */}
      <div className="flex flex-shrink-0 items-center gap-3">
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-widest text-slate-500">
            {isClaimed ? 'Status' : 'Claimable'}
          </div>
          {holderState.loading ? (
            <div className="text-sm text-slate-400">…</div>
          ) : (
            <div className="text-base font-bold text-brand-700">
              {isClaimed ? (
                <span className="flex items-center gap-1.5 justify-end">
                  <BadgeCheck className="h-4 w-4" /> Claimed
                </span>
              ) : (
                `${claimableDividendFormatted} xSTOCK`
              )}
            </div>
          )}
        </div>
        {!isClaimed && (
          <Link
            href="/claim"
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            Claim now <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
