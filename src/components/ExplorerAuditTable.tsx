'use client';

import React, { useState } from 'react';
import { ExternalLink, CheckCircle, Link2, ArrowUpRight } from 'lucide-react';
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
    label: 'Swap — Holder A Buy',
    type: 'tx',
    value: '3eSdSRdr55GRLixUsSGAeNSgQ5rCYYv4HRNr8C7s2W3u8P5bys5GkqNsvgyCMF1W9rxUvDUZcqpZ67zc87u8DaaR',
    description: 'Holder A bought 22.74M base tokens with 100 xSTOCK',
    phase: 'Phase 1',
  },
  {
    label: 'Swap — Holder B Buy',
    type: 'tx',
    value: '3AsZTiitihEBTA2JsKAPTgWmZCUyDuuAmQbHq5sBjQSwLT2BDxqUcsS2mPNZ8jZ5AjethaedaZGACyJtbdMJuCbU',
    description: 'Holder B bought 42.39M base tokens with 150 xSTOCK',
    phase: 'Phase 1',
  },
  {
    label: 'Swap — Holder A Sell',
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

const PHASE_COLORS: Record<string, string> = {
  'Phase 1': 'bg-sky-50 text-sky-700 border-sky-200',
  'Phase 2': 'bg-brand-50 text-brand-700 border-brand-200',
  'Phase 3': 'bg-orange-50 text-orange-700 border-orange-200',
  'Phase 4': 'bg-purple-50 text-purple-700 border-purple-200',
};

const PHASE_ORDER: Record<string, number> = { 'All': 0, 'Phase 1': 1, 'Phase 2': 2, 'Phase 3': 3, 'Phase 4': 4 };

export function ExplorerAuditTable() {
  const [filter, setFilter] = useState<string>('All');
  const phases = ['All', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];
  const filtered = filter === 'All'
    ? AUDIT_ENTRIES
    : [...AUDIT_ENTRIES].sort((a, b) => (PHASE_ORDER[a.phase] ?? 0) - (PHASE_ORDER[b.phase] ?? 0));

  return (
    <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4.5 w-4.5 text-brand-600" />
          <h2 className="text-sm font-semibold text-slate-900">On-Chain Audit Trail</h2>
          <span className="rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-xs text-brand-700">
            {AUDIT_ENTRIES.length} entries
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {phases.map(p => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${filter === p ? 'bg-brand-600 text-white' : 'bg-surface-accent text-slate-500 border border-surface-border hover:text-slate-900'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5">
        {filtered.map((entry, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-surface-border bg-surface-accent p-3.5 transition-colors hover:border-brand-200"
          >
            <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-brand-500" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-900">{entry.label}</span>
                <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${PHASE_COLORS[entry.phase] || 'bg-surface-accent text-slate-500 border-surface-border'}`}>
                  {entry.phase}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{entry.description}</p>
              <div className="mt-1.5 text-[10px] font-mono text-slate-400">
                {shortenAddress(entry.value, 5)}
              </div>
            </div>
            <a
              href={entry.type === 'tx' ? getExplorerTxUrl(entry.value) : getExplorerAddressUrl(entry.value)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:border-brand-200 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              {entry.type === 'tx' ? 'Tx' : 'Acct'}
              <ExternalLink className="h-2.5 w-2.5" />
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
