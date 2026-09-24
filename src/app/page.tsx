'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RefreshCw, HandCoins, Rocket, Waves, ShieldCheck, ArrowRight, ArrowUpRight } from 'lucide-react';
import { PagePanel } from '@/components/PagePanel';
import { MetricsCards } from '@/components/MetricsCards';
import { YourPositionCard } from '@/components/YourPositionCard';
import { useDivvyProtocol } from '@/hooks/useDivvyProtocol';
import { useHolderAccount } from '@/hooks/useHolderAccount';

const HOW_IT_WORKS = [
  {
    icon: Waves,
    step: '1 — Trade',
    title: 'Fees accrue on the DBC pool',
    description:
      'Every swap on the Meteora dynamic bonding curve generates trading fees in the quote asset.',
    href: '/pool',
    linkLabel: 'See the pool',
  },
  {
    icon: Rocket,
    step: '2 — Route',
    title: '60% of creator fees : vault',
    description:
      'The creator claims their DBC fees and routes the configured 60% share into the program-owned Dividend Vault.',
    href: '/create',
    linkLabel: 'See creator config',
  },
  {
    icon: HandCoins,
    step: '3 — Claim',
    title: 'Holders claim pro-rata',
    description:
      'Anyone holding the base token claims their share of the vault in one transaction — verified on-chain.',
    href: '/claim',
    linkLabel: 'Claim dividends',
  },
];

const QUICK_LINKS = [
  {
    href: '/claim',
    icon: HandCoins,
    title: 'Claim Portal',
    description: 'Check eligibility and claim your dividend in one transaction.',
  },
  {
    href: '/create',
    icon: Rocket,
    title: 'Creator Studio',
    description: 'View the active config or enable Divvy on a new DBC token.',
  },
  {
    href: '/pool',
    icon: Waves,
    title: 'Pool Details',
    description: 'Token pair, curve configuration, and fee mechanics.',
  },
  {
    href: '/audit',
    icon: ShieldCheck,
    title: 'Audit Trail',
    description: 'Every milestone transaction, explorer-verifiable.',
  },
];

export default function HomePage() {
  const [refreshing, setRefreshing] = useState(false);
  const metrics = useDivvyProtocol();
  const holderState = useHolderAccount(
    metrics.vaultBalanceAtomic,
    metrics.cumulativeDividendPerToken
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([metrics.refresh(), holderState.refresh()]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <PagePanel
      title="Protocol Overview"
      subtitle="All values read directly from Solana devnet — no hardcoded data."
      action={
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-xs text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      }
    >
      <div className="space-y-5">
        {/* Global metrics — bento, 2 per row */}
        <MetricsCards metrics={metrics} />

        {/* Personal position (when wallet connected) */}
        <YourPositionCard holderState={holderState} />

        {/* How it works — bento tiles, content left / link right */}
        <section aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="text-sm font-semibold text-slate-900">
            How Divvy works
          </h2>
          <div className="mt-2.5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, description, href, linkLabel }) => (
              <Link
                key={step}
                href={href}
                className="group flex items-start justify-between gap-4 rounded-xl border border-surface-border bg-surface-accent p-4 transition-all hover:border-brand-200 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {/* Left: content */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                        {step}
                      </span>
                    </div>
                    <h3 className="mt-0.5 text-sm font-semibold text-slate-900">{title}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
                  </div>
                </div>

                {/* Right: link affordance */}
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-surface-border bg-white text-slate-400 transition-colors group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-600">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}

            {/* Filler tile to complete the 2×2 bento */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-surface-border bg-white/50 p-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-surface-accent text-slate-400">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-700">Everything is verifiable</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    Every number on this dashboard links to a real devnet account or transaction.
                  </p>
                </div>
              </div>
              <Link
                href="/audit"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-surface-border bg-white text-slate-400 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                aria-label="Open Audit Trail"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Quick links — bento tiles, 2 per row */}
        <section aria-labelledby="quick-links-heading">
          <h2 id="quick-links-heading" className="text-sm font-semibold text-slate-900">
            Explore
          </h2>
          <div className="mt-2.5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {QUICK_LINKS.map(({ href, icon: Icon, title, description }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-accent p-4 transition-all hover:border-brand-200 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {/* Left: content */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{title}</div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{description}</p>
                  </div>
                </div>

                {/* Right: arrow */}
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PagePanel>
  );
}
