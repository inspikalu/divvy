'use client';

import React, { useState } from 'react';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { getExplorerAddressUrl, getExplorerTxUrl, shortenAddress } from '@/lib/constants';

type EntryType = 'tx' | 'account';

interface AuditEntry {
  label: string;
  type: EntryType;
  value: string;
  description: string;
  phase: string;
}

const AUDIT_ENTRIES: AuditEntry[] = [
  {
    label: 'Divvy Program',
    type: 'account',
    value: '235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5',
    description: 'Anchor program deployed on Solana devnet',
    phase: 'Phase 2',
  },
  {
    label: 'DivvyConfig PDA',
    type: 'account',
    value: 'AhWYbZeiyisCxjrgz4yZRf7sPN8Wx5SxgnpaLVwrwBY4',
    description: 'Protocol config: fee_share_bps=6000, base_mint, dividend_mint',
    phase: 'Phase 2',
  },
  {
    label: 'DividendVault PDA',
    type: 'account',
    value: 'GjXC4iEAh7tqL7MqhY7cpF7Wvdfpa2LBMEL7anwty3Mw',
    description: 'Program-owned SPL token account holding all routed dividends',
    phase: 'Phase 2',
  },
  {
    label: 'DBC Pool Creation',
    type: 'tx',
    value: 'ZgAdZ1Fh4nfjVNTgaeRHA9TMqNJR6C5oYGiwEDuuiaWGexMpkyucKJsjJcr2UyhX2FDZFfYWZwnjvgarLdGasF3',
    description: 'Meteora DBC pool launched with Linear curve + xSTOCK quote asset',
    phase: 'Phase 1',
  },
  {
    label: 'Swap: Holder A Buy',
    type: 'tx',
    value: '3eSdSRdr55GRLixUsSGAeNSgQ5rCYYv4HRNr8C7s2W3u8P5bys5GkqNsvgyCMF1W9rxUvDUZcqpZ67zc87u8DaaR',
    description: 'Holder A bought 22.74M base tokens with 100 xSTOCK',
    phase: 'Phase 1',
  },
  {
    label: 'Swap: Holder B Buy',
    type: 'tx',
    value: '3AsZTiitihEBTA2JsKAPTgWmZCUyDuuAmQbHq5sBjQSwLT2BDxqUcsS2mPNZ8jZ5AjethaedaZGACyJtbdMJuCbU',
    description: 'Holder B bought 42.39M base tokens with 150 xSTOCK',
    phase: 'Phase 1',
  },
  {
    label: 'Swap: Holder A Sell',
    type: 'tx',
    value: '4mYB7mD46qGKTyFk6q6ZbV9KAmTVfjmRHZDVBWc7zirGLgmC82rbXAtCbf1r2EzVEiGkHQDispLZciU1gTaX9xGc',
    description: 'Holder A sold 7.58B base tokens (fee generation)',
    phase: 'Phase 1',
  },
  {
    label: 'DBC Creator Fee Claim',
    type: 'tx',
    value: '5Ao2BwpEESEPYQK3cGqgKrNU1iZWkb3M5ZrrNSt1hhrxePCroN5P9c29zYhuifVDi4HY959RyJ9Wft4ovW5FYEAk',
    description: 'Creator claimed 1,996,812 units of xSTOCK fees from DBC',
    phase: 'Phase 3',
  },
  {
    label: 'Divvy Fee Routing',
    type: 'tx',
    value: 'qEqE3WNBHr6ZM7BM7jQXAAhSmjVYdzp1ZrwyC568asy73tN78dG272KCGShjeygBTD1TpCsP1TTDb8DA62Byc2V',
    description: '60% of fees (1,198,087 units) routed to DividendVault via route_fees',
    phase: 'Phase 3',
  },
  {
    label: 'Holder A Claim',
    type: 'tx',
    value: '5REF3WusB2RrRRxwY4Jg6ijYdsGPd4hLeTfWutbMtkwyjPWUZNFPjbL7cCqaUHU2hCAEtvkAZLZYtv9S8DoJAp8V',
    description: 'Holder A claimed 418,308 units (34.91% pro-rata share)',
    phase: 'Phase 4',
  },
  {
    label: 'Holder B Claim',
    type: 'tx',
    value: '5DHjNHofE7TrdxC5DtwYoqrgG3wyntRxfHSowEMAVU2wa9966X7JCJ1o6SPUz3xMdPyv7s1gjjKqEK6vTT78QKAv',
    description: 'Holder B claimed 507,521 units (65.09% pro-rata share)',
    phase: 'Phase 4',
  },
];

export function ExplorerAuditTable() {
  const [filter, setFilter] = useState<'all' | 'tx' | 'account'>('all');

  const filtered = AUDIT_ENTRIES.filter((e) => {
    if (filter === 'all') return true;
    return e.type === filter;
  });

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'tx', 'account'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                filter === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'all'
                ? `All (${AUDIT_ENTRIES.length})`
                : tab === 'tx'
                ? `Transactions (${AUDIT_ENTRIES.filter((e) => e.type === 'tx').length})`
                : `Accounts (${AUDIT_ENTRIES.filter((e) => e.type === 'account').length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
          <span>11 of 11 verified on devnet</span>
        </div>
      </div>

      {/* Audit Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50/70 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500 font-mono">
          <div className="col-span-3">Event / Account</div>
          <div className="col-span-2">Phase &amp; Type</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-3 text-right">On-Chain Explorer</div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {filtered.map((entry) => {
            const url =
              entry.type === 'tx'
                ? getExplorerTxUrl(entry.value)
                : getExplorerAddressUrl(entry.value);

            return (
              <div
                key={entry.value}
                className="p-4 sm:px-4 sm:py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center hover:bg-slate-50/50 transition-colors"
              >
                <div className="sm:col-span-3 font-semibold text-slate-900">
                  {entry.label}
                </div>

                <div className="sm:col-span-2 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                    {entry.phase}
                  </span>
                  <span className="font-mono text-[10px] uppercase text-slate-400">
                    {entry.type}
                  </span>
                </div>

                <div className="sm:col-span-4 text-slate-500 text-xs leading-relaxed">
                  {entry.description}
                </div>

                <div className="sm:col-span-3 sm:text-right pt-1 sm:pt-0">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    <span>{shortenAddress(entry.value, 4)}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
