'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PagePanel } from '@/components/PagePanel';
import { ExplorerAuditTable } from '@/components/ExplorerAuditTable';
import {
  getExplorerAddressUrl,
  DIVVY_PROGRAM_ID,
  DIVVY_CONFIG_PDA,
  DIVIDEND_VAULT_PDA,
  shortenAddress,
} from '@/lib/constants';

const KEY_ACCOUNTS = [
  {
    label: 'Divvy Program',
    address: DIVVY_PROGRAM_ID,
    description: 'The on-chain Anchor program implementing config, routing and claims.',
  },
  {
    label: 'DivvyConfig PDA',
    address: DIVVY_CONFIG_PDA,
    description: 'Stores fee share, totals routed/claimed, and mints.',
  },
  {
    label: 'DividendVault PDA',
    address: DIVIDEND_VAULT_PDA,
    description: 'Program-owned token account holding unclaimed dividends.',
  },
];

export default function AuditPage() {
  return (
    <PagePanel
      title="Audit Trail"
      subtitle="Every milestone transaction, openable in Solana Explorer. Verify, don't trust."
    >
      <div className="space-y-5">
        {/* Key accounts */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {KEY_ACCOUNTS.map(({ label, address, description }) => (
            <div
              key={label}
              className="rounded-xl border border-surface-border bg-surface-accent p-4"
            >
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {label}
              </div>
              <a
                href={getExplorerAddressUrl(address.toBase58())}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1.5 rounded font-mono text-xs text-slate-600 transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                {shortenAddress(address.toBase58(), 6)}
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
              <p className="mt-1.5 text-xs text-slate-500">{description}</p>
            </div>
          ))}
        </div>

        {/* Milestone transactions */}
        <ExplorerAuditTable />
      </div>
    </PagePanel>
  );
}
