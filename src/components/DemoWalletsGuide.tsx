'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { getExplorerAddressUrl, TRACKED_WALLETS } from '@/lib/constants';

const DEMO_WALLETS = [
  {
    role: 'Deployer / Creator',
    address: TRACKED_WALLETS.deployer,
    description: 'Controls protocol config, executes DBC fee claims & deposits 60% share to vault.',
  },
  {
    role: 'Holder A',
    address: TRACKED_WALLETS.holderA,
    description: 'Bought 22.74M base tokens. Holds 34.91% share of circulating community tokens.',
  },
  {
    role: 'Holder B',
    address: TRACKED_WALLETS.holderB,
    description: 'Bought 42.39M base tokens. Holds 65.09% share of circulating community tokens.',
  },
];

const DEMO_FLOW = [
  'Connect the Deployer wallet to inspect active configuration in the Creator Studio.',
  'Generate swaps on the Meteora DBC pool to accrue fresh creator quote fees.',
  'Deployer claims DBC trading fees and routes the 60% share into the Dividend Vault.',
  'Switch to Holder A or B to verify automatic pro-rata yield calculation in the Claim Portal.',
  'Execute a claim. Dividend tokens transfer to the holder wallet in one transaction.',
  'Open the Audit Trail to verify all block confirmations and transaction hashes on Solana.',
];

export function DemoWalletsGuide() {
  return (
    <div className="space-y-6">
      {/* Wallets */}
      <section aria-labelledby="demo-wallets-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 id="demo-wallets-heading" className="text-sm font-bold text-slate-900">
              Demo Wallets Directory
            </h2>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Test &amp; Evaluation
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEMO_WALLETS.map((w) => (
            <div key={w.address} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {w.role}
                </span>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  {w.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={getExplorerAddressUrl(w.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-brand-600 hover:underline inline-flex items-center gap-1"
                >
                  {w.address.slice(0, 6)}...{w.address.slice(-6)}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested demo flow */}
      <section aria-labelledby="demo-flow-heading" className="space-y-3">
        <h2 id="demo-flow-heading" className="text-sm font-bold text-slate-900">
          Suggested Testing Sequence
        </h2>

        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="divide-y divide-slate-100 text-xs">
            {DEMO_FLOW.map((step, i) => (
              <div key={step} className="p-3.5 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                <span className="font-mono text-xs font-bold text-slate-400 w-5 flex-shrink-0 pt-0.5">
                  0{i + 1}.
                </span>
                <p className="text-slate-600 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
