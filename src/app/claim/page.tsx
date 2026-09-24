'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, ExternalLink, TrendingUp } from 'lucide-react';
import { PagePanel } from '@/components/PagePanel';
import { HolderClaimCard } from '@/components/HolderClaimCard';
import { useDivvyProtocol } from '@/hooks/useDivvyProtocol';
import { useHolderAccount } from '@/hooks/useHolderAccount';
import { useHolderClaim } from '@/hooks/useHolderClaim';
import {
  ELIGIBLE_SUPPLY_ATOMIC,
  DIVIDEND_VAULT_PDA,
  getExplorerAddressUrl,
  shortenAddress,
} from '@/lib/constants';

export default function ClaimPage() {
  const metrics = useDivvyProtocol();
  const holderState = useHolderAccount(
    metrics.vaultBalanceAtomic,
    metrics.cumulativeDividendPerToken
  );
  const claimActions = useHolderClaim();

  return (
    <PagePanel
      title="Claim Portal"
      subtitle="Claim your pro-rata share of the Dividend Vault in a single transaction."
    >
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-5">
        {/* Claim card — hero */}
        <div className="lg:col-span-3">
          <HolderClaimCard holderState={holderState} claimActions={claimActions} />
        </div>

        {/* Calculation bento */}
        <aside className="space-y-3 lg:col-span-2" aria-label="Claim calculation details">
          <div className="flex items-center gap-2 px-1">
            <Calculator className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-slate-900">How your claim is calculated</h2>
          </div>

          <StatTile label="Your base holding" value={holderState.baseTokenBalanceFormatted} />
          <StatTile
            label="Eligible supply"
            value={(Number(ELIGIBLE_SUPPLY_ATOMIC) / 1e6).toLocaleString('en-US')}
          />
          <StatTile
            label="Vault balance"
            value={`${metrics.vaultBalanceFormatted} xSTOCK`}
            href={getExplorerAddressUrl(DIVIDEND_VAULT_PDA)}
            hrefLabel={shortenAddress(DIVIDEND_VAULT_PDA, 4)}
          />

          {/* Result tile — emphasized */}
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                <span className="text-xs font-medium text-slate-600">
                  = your share × vault balance
                </span>
              </div>
              <span className="font-mono text-sm font-bold text-brand-700">
                {holderState.isClaimed
                  ? '—'
                  : `${holderState.claimableDividendFormatted} xSTOCK`}
              </span>
            </div>
          </div>

          {/* First time tile */}
          <div className="rounded-xl border border-surface-border bg-surface-accent p-4">
            <h3 className="text-sm font-semibold text-slate-900">First time here?</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              You need to hold the base meme token to be eligible. Connect a demo wallet or check
              the guide for funded test accounts.
            </p>
            <Link
              href="/demo"
              className="mt-3 inline-flex items-center gap-1.5 rounded text-xs font-medium text-brand-600 transition-colors hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              Open Demo Guide <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </aside>
      </div>
    </PagePanel>
  );
}

function StatTile({
  label,
  value,
  href,
  hrefLabel,
}: {
  label: string;
  value: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-accent p-4">
      <span className="text-xs text-slate-500">{label}</span>
      <div className="flex flex-col items-end">
        <span className="font-mono text-xs font-semibold text-slate-900">{value}</span>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 flex items-center gap-1 rounded text-[10px] text-slate-400 transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {hrefLabel} <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}
