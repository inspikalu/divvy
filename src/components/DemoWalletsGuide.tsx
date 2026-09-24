'use client';

import React from 'react';
import { ExternalLink, Users, Route } from 'lucide-react';
import { getExplorerAddressUrl, TRACKED_WALLETS } from '@/lib/constants';

const DEMO_WALLETS = [
  {
    role: 'Deployer / Creator',
    address: TRACKED_WALLETS.deployer,
    description: 'Controls protocol config, executes DBC fee claims & routes to vault.',
    color: 'text-orange-600',
    border: 'border-orange-200',
    bg: 'bg-orange-50',
  },
  {
    role: 'Holder A',
    address: TRACKED_WALLETS.holderA,
    description: 'Bought 22.74M base tokens. Claimed 418,308 atomic xSTOCK (34.91% share).',
    color: 'text-brand-600',
    border: 'border-brand-200',
    bg: 'bg-brand-50',
  },
  {
    role: 'Holder B',
    address: TRACKED_WALLETS.holderB,
    description: 'Bought 42.39M base tokens. Claimed 507,521 atomic xSTOCK (65.09% share).',
    color: 'text-purple-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
  },
];

const DEMO_FLOW = [
  'Connect the Deployer wallet — review the active config in Creator Studio.',
  'Generate swaps on the DBC pool so creator fees accrue.',
  'Deployer claims DBC fees and routes 60% into the Dividend Vault.',
  'Switch to Holder A or B — check the claimable amount in the Claim Portal.',
  'Claim — the xSTOCK dividend arrives in one transaction.',
  'Open the Audit Trail and verify every step in Solana Explorer.',
];

export function DemoWalletsGuide() {
  return (
    <div className="space-y-5">
      {/* Wallets */}
      <section aria-labelledby="demo-wallets-heading">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-500" />
          <h2 id="demo-wallets-heading" className="text-sm font-semibold text-slate-900">
            Demo Wallets Reference
          </h2>
          <span className="rounded-full bg-surface-accent border border-surface-border px-2 py-0.5 text-xs text-slate-500">
            For judges &amp; testers
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {DEMO_WALLETS.map(w => (
            <div key={w.address} className={`rounded-2xl border ${w.border} ${w.bg} p-5 space-y-2`}>
              <div className={`text-xs font-bold uppercase tracking-widest ${w.color}`}>
                {w.role}
              </div>
              <a
                href={getExplorerAddressUrl(w.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded text-xs font-mono text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 break-all"
              >
                {w.address}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
              <p className="text-xs text-slate-500">{w.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested demo flow */}
      <section aria-labelledby="demo-flow-heading" className="max-w-3xl">
        <div className="flex items-center gap-2">
          <Route className="h-4 w-4 text-slate-500" />
          <h2 id="demo-flow-heading" className="text-sm font-semibold text-slate-900">
            Suggested demo flow
          </h2>
        </div>
        <ol className="mt-3 space-y-2">
          {DEMO_FLOW.map((step, i) => (
            <li
              key={step}
              className="flex items-start gap-3 rounded-xl border border-surface-border bg-surface-accent p-4"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                {i + 1}
              </span>
              <p className="text-sm text-slate-600">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
