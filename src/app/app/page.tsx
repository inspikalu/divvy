'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PagePanel } from '@/components/PagePanel';
import { MetricsCards } from '@/components/MetricsCards';

const PROTOCOL_STEPS = [
  {
    step: '01',
    label: 'Trade',
    title: 'Fees accrue on DBC pool',
    description:
      'Every swap on the Meteora Dynamic Bonding Curve accumulates trading fees in the quote asset.',
    linkHref: '/app/pool',
    linkText: 'Inspect pool',
  },
  {
    step: '02',
    label: 'Route',
    title: 'Fee share sent to vault',
    description:
      'The creator claims fees and deposits the configured share (e.g. 60%) into the program-owned Dividend Vault.',
    linkHref: '/app/create',
    linkText: 'Creator studio',
  },
  {
    step: '03',
    label: 'Claim',
    title: 'Holders claim pro-rata',
    description:
      'Holders connect their wallet to withdraw their exact proportional share of dividends at any time.',
    linkHref: '/app/claim',
    linkText: 'Claim portal',
  },
];

const EXPLORE_ITEMS = [
  {
    href: '/app/claim',
    title: 'Holder Claim Portal',
    description: 'Check your proportional allocation and withdraw accrued dividend distributions.',
    tag: 'Holders',
  },
  {
    href: '/app/create',
    title: 'Creator Studio',
    description: 'Initialize a new Divvy dividend vault or inspect active protocol configurations.',
    tag: 'Creators',
  },
  {
    href: '/app/pool',
    title: 'Pools Directory & Details',
    description: 'Explore all Meteora Dynamic Bonding Curve pools integrated with Divvy vaults.',
    tag: 'Analytics',
  },
  {
    href: '/app/audit',
    title: 'On-Chain Audit Trail',
    description: 'Verify pool deployment, swap transactions, fee routings, and claim records on Solana.',
    tag: 'Verification',
  },
];

export default function AppOverviewPage() {
  return (
    <PagePanel
      title="Protocol Overview"
      subtitle="Live metrics and dividend yields read directly from Solana devnet."
    >
      <div className="space-y-6">
        {/* Hero: Permissionless multi-pool CTA */}
        <div className="rounded-xl border border-slate-900 bg-slate-950 text-white p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/60" />
                <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-white/60">
                  Permissionless Dividend Protocol
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Multiple pools. Pick yours to view your position.
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Any Meteora DBC token creator can register a Divvy vault. Browse all on-chain pools, select one, and connect your wallet to see your exact pro-rata dividend yield.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-2">
              <Link
                href="/app/pool"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-100"
              >
                <span>Browse All Pools</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/app/claim"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-transparent px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/10"
              >
                <span>Claim Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Protocol Telemetry */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Protocol Telemetry
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Contract: 235z...PXG5
            </span>
          </div>
          <MetricsCards />
        </div>

        {/* How Divvy Works */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              How Dividend Routing Works
            </h2>
            <span className="text-[11px] text-slate-400">3-Step Lifecycle</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
              {PROTOCOL_STEPS.map((item) => (
                <div key={item.step} className="p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                        {item.step}
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                        {item.label}
                      </span>
                    </div>
                    <h3 className="mt-2.5 text-sm font-bold text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href={item.linkHref}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      <span>{item.linkText}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Explore Directory */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Explore Protocol
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EXPLORE_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded">
                      {item.tag}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-[11px]">{item.href}</span>
                  <span className="inline-flex items-center gap-1 text-slate-600 font-semibold group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all">
                    Open <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </PagePanel>
  );
}
