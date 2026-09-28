'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Wallet,
  Play,
  Pause,
  Zap,
  ExternalLink,
} from 'lucide-react';

interface StepData {
  id: number;
  tabLabel: string;
  badge: string;
  badgeColor: string;
  title: string;
  lastUpdated: string;
  description: string;
  toastTitle: string;
  toastDetail: string;
  toastAction: string;
  toastActionClass: string;
  metrics: {
    label: string;
    value: string;
    sub: string;
  }[];
}

const SEQUENCE_STEPS: StepData[] = [
  {
    id: 1,
    tabLabel: '01. Swap on Meteora DBC',
    badge: 'Trading Volume',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    title: 'Meteora Dynamic Bonding Curve Swaps',
    lastUpdated: 'Live block #312,492,108',
    description: 'Traders buy and sell meme tokens on Meteora DBC. Each swap generates a 1% fee in the quote asset ($xSTOCK).',
    toastTitle: 'Triggered by DBC Swap #8491',
    toastDetail: 'Holder A bought 22.74M $POPCAT (+100.00 $xSTOCK DBC fee generated)',
    toastAction: 'Inspect DBC Swap',
    toastActionClass: 'bg-amber-600 text-white hover:bg-amber-700',
    metrics: [
      { label: '24h DBC Volume', value: '$248,500', sub: 'Meteora Linear Curve' },
      { label: 'Trading Fee Rate', value: '1.00%', sub: 'Linear Fee Scheduler' },
      { label: 'Accrued Quote Fees', value: '1,996,812', sub: '$xSTOCK in creator pot' },
    ],
  },
  {
    id: 2,
    tabLabel: '02. Creator Routes Fee Share',
    badge: 'Vault Deposit',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    title: 'Automated 60% Dividend Fee Routing',
    lastUpdated: 'Solana Devnet Confirmed',
    description: 'The creator calls route_fees on the Divvy Anchor program, streaming $1,198,087 quote tokens into the program vault.',
    toastTitle: 'Triggered by route_fees instruction',
    toastDetail: '60% fee share (1,198,087 $xSTOCK) deposited to DividendVault PDA',
    toastAction: 'Verify Route Tx',
    toastActionClass: 'bg-purple-700 text-white hover:bg-purple-800',
    metrics: [
      { label: 'Configured Fee Share', value: '60.00%', sub: '6,000 BPS to Vault' },
      { label: 'Dividend Vault Balance', value: '1,198,087', sub: '$xSTOCK Program-owned' },
      { label: 'Global Cumulative Index', value: '0.0000184', sub: 'Per token index updated' },
    ],
  },
  {
    id: 3,
    tabLabel: '03. Holder Instant Pro-Rata Claim',
    badge: 'Live Claim Ready',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    title: 'Instant Non-Custodial Dividend Withdrawal',
    lastUpdated: 'Continuous cumulative calculation',
    description: 'Holders connect their wallet and withdraw accrued dividends pro-rata with zero lockups in a single instruction.',
    toastTitle: 'Holders eligible for claim',
    toastDetail: 'Wallet 212m...Mw6w holds 34.91% pool share (+418,308 $xSTOCK ready)',
    toastAction: 'Claim Dividends',
    toastActionClass: 'bg-emerald-600 text-white hover:bg-emerald-700',
    metrics: [
      { label: 'Your Base Holding', value: '22,740,000', sub: '34.91% of circulating' },
      { label: 'Claimable Dividend', value: '418,308.00', sub: '$xSTOCK instant payout' },
      { label: 'Settlement Status', value: 'Ready to Claim', sub: 'O(1) continuous index' },
    ],
  },
];

export function InteractiveAppPreview() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance sequence every 4.5 seconds if playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % SEQUENCE_STEPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const current = SEQUENCE_STEPS[activeStep];

  return (
    <div className="w-full max-w-4xl mx-auto text-left">
      
      {/* Step Tabs Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-2">
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/[0.04] border border-black/[0.06]">
          {SEQUENCE_STEPS.map((step, idx) => {
            const isSelected = idx === activeStep;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(idx);
                  setIsPlaying(false);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs border border-black/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-black/[0.03]'
                }`}
              >
                {step.tabLabel}
              </button>
            );
          })}
        </div>

        {/* Play/Pause control */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-slate-500 hover:text-slate-900 hover:bg-black/[0.04] transition-colors"
          title={isPlaying ? 'Pause autoplay' : 'Play autoplay'}
        >
          {isPlaying ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Autoplay on</span>
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              <span>Resume</span>
            </>
          )}
        </button>
      </div>

      {/* Main Slite-Style Mockup Window */}
      <div className="relative rounded-3xl border border-black/[0.08] bg-white p-5 sm:p-8 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden transition-all">
        
        {/* Mockup Header Toolbar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-slate-200" />
              <span className="h-3 w-3 rounded-full bg-slate-200" />
              <span className="h-3 w-3 rounded-full bg-slate-200" />
            </div>
            <span className="font-mono text-[11px] text-slate-400 ml-2">
              divvy.protocol / pools / popcat-xstock
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              Live On-Chain
            </span>
            <Link href="/app" className="text-purple-700 hover:underline inline-flex items-center gap-0.5">
              Open App <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>
        </div>

        {/* Mockup Inner Body Layout */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Sub-Sidebar (3 cols) */}
          <div className="md:col-span-4 rounded-2xl bg-[#FBF9F5] border border-black/[0.05] p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-black/[0.05]">
              <div className="h-6 w-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                $P
              </div>
              <div>
                <span className="font-bold text-slate-900 block leading-none">$POPCAT Pool</span>
                <span className="text-[10px] text-slate-400">Meteora DBC #Erzp6</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-black/[0.04]">
                <span className="text-slate-500">Base Token:</span>
                <span className="font-bold text-slate-900">$POPCAT</span>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-black/[0.04]">
                <span className="text-slate-500">Dividend Mint:</span>
                <span className="font-bold text-purple-700">$xSTOCK</span>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-black/[0.04]">
                <span className="text-slate-500">Fee Allocation:</span>
                <span className="font-bold text-slate-900">60%</span>
              </div>
              <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-black/[0.04]">
                <span className="text-slate-500">Curve Type:</span>
                <span className="font-semibold text-slate-700">Linear DBC</span>
              </div>
            </div>
          </div>

          {/* Right Main Content Area (8 cols) */}
          <div className="md:col-span-8 space-y-5">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${current.badgeColor}`}>
                  {current.badge}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {current.lastUpdated}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {current.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Metrics cards grid inside mockup */}
            <div className="grid grid-cols-3 gap-2.5">
              {current.metrics.map((m, i) => (
                <div key={i} className="rounded-xl border border-black/[0.06] bg-[#FBF9F5] p-3 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block truncate">
                    {m.label}
                  </span>
                  <span className="font-mono text-base sm:text-lg font-bold text-slate-900 block tabular-nums">
                    {m.value}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {m.sub}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Slite-Style Floating Interactive Action Toast Card */}
        <div className="mt-6 rounded-2xl border border-purple-300 bg-white/95 backdrop-blur-md p-4 shadow-[0_8px_24px_-4px_rgba(121,40,202,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-purple-700" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {current.toastTitle}
              </span>
              <span className="text-[11px] font-mono text-slate-500 block">
                {current.toastDetail}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
            <Link
              href="/app"
              className={`px-4 py-2 rounded-full text-xs font-bold shadow-xs transition-all ${current.toastActionClass}`}
            >
              {current.toastAction} &rarr;
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
