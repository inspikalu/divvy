'use client';

import React from 'react';
import { ExternalLink, Coins, ArrowRight } from 'lucide-react';
import {
  getExplorerAddressUrl,
  BASE_MINT,
  DIVIDEND_MINT,
  DBC_POOL_ADDRESS,
  METEORA_DBC_PROGRAM_ID,
  shortenAddress,
} from '@/lib/constants';

const TOKEN_ROWS = [
  {
    label: 'Base Meme Token',
    address: BASE_MINT.toBase58(),
    description: 'The meme token traded on the Meteora DBC curve. Holding this earns dividends.',
    color: 'text-brand-600',
    bg: 'bg-brand-50',
    border: 'border-brand-200',
  },
  {
    label: 'Dividend Token (xSTOCK)',
    address: DIVIDEND_MINT.toBase58(),
    description: 'Devnet SPL token standing in for a tokenized equity. Distributed pro-rata to holders.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
];

const POOL_STATS = [
  { label: 'Pool Type', value: 'Dynamic Bonding Curve' },
  { label: 'Fee Mode', value: 'Linear Scheduler' },
  { label: 'Curve Type', value: 'Linear' },
  { label: 'Divvy Fee Share', value: '60% : Vault', accent: true },
];

export function PoolOverview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Coins className="h-4.5 w-4.5 text-brand-600" />
        <h2 className="text-sm font-semibold text-slate-900">Meteora DBC Pool</h2>
      </div>

      {/* Token pair — bento tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TOKEN_ROWS.map((t) => (
          <div
            key={t.address}
            className={`rounded-xl border ${t.border} ${t.bg} space-y-1 p-4`}
          >
            <div className={`text-xs font-semibold uppercase tracking-widest ${t.color}`}>{t.label}</div>
            <a
              href={getExplorerAddressUrl(t.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded font-mono text-sm text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              {shortenAddress(t.address, 6)}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
            <p className="text-xs text-slate-500">{t.description}</p>
          </div>
        ))}
      </div>

      {/* Pool stats — bento tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {POOL_STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-surface-border bg-surface-accent p-3.5"
          >
            <div className="text-[11px] uppercase tracking-widest text-slate-500">{s.label}</div>
            <div className={`mt-0.5 text-sm font-semibold ${s.accent ? 'text-brand-600' : 'text-slate-800'}`}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Routing flow — full-width tile */}
      <div className="rounded-xl border border-surface-border bg-surface-accent p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] uppercase tracking-widest text-slate-500">DBC Pool</span>
          <a
            href={getExplorerAddressUrl(DBC_POOL_ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded text-xs text-slate-500 transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {shortenAddress(DBC_POOL_ADDRESS, 6)} <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-surface-border bg-white p-2 text-center">
            <div className="text-xs text-slate-500">Meme Token</div>
            <div className="text-xs font-bold text-slate-700">Base</div>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <div className="flex-1 rounded-lg border border-brand-200 bg-brand-50 p-2 text-center">
            <div className="text-xs text-slate-500">DBC Fees</div>
            <div className="text-xs font-bold text-brand-600">60% : Divvy</div>
          </div>
          <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
          <div className="flex-1 rounded-lg border border-purple-200 bg-purple-50 p-2 text-center">
            <div className="text-xs text-slate-500">Holders</div>
            <div className="text-xs font-bold text-purple-600">xSTOCK</div>
          </div>
        </div>
      </div>

      <div className="text-[11px] italic text-slate-400">
        Note: xSTOCK is a devnet SPL token standing in for a tokenized equity. All transfers are real on-chain transactions on Solana devnet.
      </div>
    </div>
  );
}
