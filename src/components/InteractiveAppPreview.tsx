'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Rocket,
  HandCoins,
  LayoutDashboard,
  Waves,
  ShieldCheck,
  CheckCircle2,
  Check,
  Sparkles,
} from 'lucide-react';

export function InteractiveAppPreview() {
  // 0 = Creator Studio Flow, 1 = Creator Initialized Success, 2 = Claim Portal Flow, 3 = Claim Settled Success
  const [phase, setPhase] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 70, clicking: false });

  useEffect(() => {
    // 16-second total looping sequence:
    const t1 = setTimeout(() => {
      // Move cursor to Creator Init button
      setCursorPos({ x: 62, y: 73, clicking: false });
    }, 1500);

    const t2 = setTimeout(() => {
      // Cursor clicks
      setCursorPos({ x: 62, y: 73, clicking: true });
    }, 3200);

    const t3 = setTimeout(() => {
      // Phase 1: Vault Initialized
      setPhase(1);
      setCursorPos({ x: 75, y: 30, clicking: false });
    }, 3800);

    const t4 = setTimeout(() => {
      // Phase 2: Switch to Claim Portal
      setPhase(2);
      setCursorPos({ x: 30, y: 55, clicking: false });
    }, 7500);

    const t5 = setTimeout(() => {
      // Move cursor to Claim button
      setCursorPos({ x: 62, y: 62, clicking: false });
    }, 9500);

    const t6 = setTimeout(() => {
      // Click Claim button
      setCursorPos({ x: 62, y: 62, clicking: true });
    }, 11200);

    const t7 = setTimeout(() => {
      // Phase 3: Claim Success Settled
      setPhase(3);
      setCursorPos({ x: 80, y: 75, clicking: false });
    }, 11800);

    const t8 = setTimeout(() => {
      // Reset loop back to Phase 0
      setPhase(0);
      setCursorPos({ x: 50, y: 70, clicking: false });
    }, 15800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
    };
  }, [phase === 0 ? 0 : null]);

  const isCreatorView = phase === 0 || phase === 1;

  return (
    <div className="relative w-full max-w-4xl mx-auto pb-12 select-none">
      
      {/* Main Realistic App Window */}
      <div className="grain relative rounded-3xl border border-black/[0.08] bg-white shadow-[0_16px_50px_-16px_rgba(0,0,0,0.12)] text-left font-sans overflow-hidden">
        
        {/* App Shell Mockup Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 bg-[#FAF8F5]/80 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Image src="/icon.png" alt="Divvy" width={18} height={18} className="h-4.5 w-4.5" />
              <span className="text-xs font-bold text-slate-800 font-mono tracking-tight">
                divvy.app {isCreatorView ? '/create' : '/claim'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Devnet Live
            </span>
            <span className="text-slate-400 text-[11px]">235z...PXG5</span>
          </div>
        </div>

        {/* Realistic Dashboard Split: Sidebar + Active Panel */}
        <div className="grid grid-cols-12 min-h-[440px]">
          
          {/* Real App Sidebar (3 cols) */}
          <div className="hidden sm:block col-span-3 border-r border-slate-100 bg-[#FAF8F5]/40 p-3.5 space-y-4 rounded-bl-3xl">
            
            {/* Brand item */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <Image src="/icon.png" alt="Divvy" width={22} height={22} className="h-5 w-5" />
              <div className="leading-none">
                <span className="text-xs font-bold text-slate-900 block">Divvy</span>
                <span className="text-[9px] font-mono text-slate-400">Meteora DBC</span>
              </div>
            </div>

            {/* Nav items */}
            <div className="space-y-1 text-xs font-medium">
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800">
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Overview</span>
              </div>
              
              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all ${
                  !isCreatorView
                    ? 'bg-purple-50 text-purple-800 font-semibold border border-purple-200/60 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <HandCoins className="h-3.5 w-3.5 text-purple-700" />
                <span>Claim Portal</span>
              </div>

              <div
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all ${
                  isCreatorView
                    ? 'bg-purple-50 text-purple-800 font-semibold border border-purple-200/60 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Rocket className="h-3.5 w-3.5 text-purple-700" />
                <span>Creator Studio</span>
              </div>

              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-500">
                <Waves className="h-3.5 w-3.5" />
                <span>Pool Details</span>
              </div>

              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Audit Trail</span>
              </div>
            </div>

            {/* Sidebar Active Token Tag */}
            <div className="pt-4 border-t border-slate-200/60">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block px-2 mb-1.5">
                Target Token
              </span>
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-xs font-mono">
                <div className="font-bold text-slate-900">$POPCAT / $xSTOCK</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">3pX9emk...UQFgP4</div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Content View (9 cols) */}
          <div className="col-span-12 sm:col-span-9 p-5 sm:p-6 bg-white rounded-br-3xl flex flex-col justify-between">
            
            {/* VIEW A: Creator Studio (/app/create) */}
            {isCreatorView ? (
              <div className="space-y-4">
                
                {/* Header breadcrumb */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Creator Studio</span>
                    <span className="text-[11px] text-slate-400">Initialize a new Meteora DBC dividend vault</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    Authority: 7bK2...99Xz
                  </span>
                </div>

                {/* Form fields */}
                <div className="space-y-3 pt-1">
                  
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Meteora DBC Base Token Mint
                    </label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 flex items-center justify-between gap-2">
                      <span className="truncate">3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4</span>
                      <span className="font-bold text-purple-700 bg-purple-100/60 px-1.5 py-0.5 rounded text-[10px] flex-shrink-0">$POPCAT</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Dividend Quote Asset (e.g. $xSTOCK, $USDC, $SOL)
                    </label>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 flex items-center justify-between gap-2">
                      <span className="truncate">A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM</span>
                      <span className="font-bold text-purple-700 bg-purple-100/60 px-1.5 py-0.5 rounded text-[10px] flex-shrink-0">$xSTOCK</span>
                    </div>
                  </div>

                  <div className="flex flex-col xs:flex-row xs:items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-200/80 gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Holder Fee Share Allocation</span>
                      <span className="text-[10px] text-slate-500">Meteora DBC trade fee share streamed to community</span>
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-purple-800 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-xs self-start xs:self-auto flex-shrink-0">
                      60.00% (6,000 BPS)
                    </span>
                  </div>

                </div>

                {/* Action button / On-chain Result */}
                <div className="pt-2">
                  {phase === 0 ? (
                    <button
                      type="button"
                      className={`w-full py-3 rounded-xl font-bold text-xs text-white bg-[#7C3AED] shadow-sm transition-all flex items-center justify-center gap-2 ${
                        cursorPos.clicking ? 'scale-98 bg-[#6D28D9]' : ''
                      }`}
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      <span>Initialize Dividend Vault PDA</span>
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-emerald-900 block">Dividend Vault Initialized!</span>
                          <span className="font-mono text-[10px] text-emerald-700">Vault PDA: GjXC4iE...y3Mw</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-800 font-semibold">Confirmed on Devnet</span>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* VIEW B: Holder Claim Portal (/app/claim) */
              <div className="space-y-4">
                
                {/* Header breadcrumb */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Holder Claim Portal</span>
                    <span className="text-[11px] text-slate-400">Withdraw pro-rata dividends in real-time</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    Wallet: 212m...Mw6w
                  </span>
                </div>

                {/* Main Pro-Rata Card */}
                <div className="rounded-2xl border border-slate-200 bg-[#FAF8F5] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                        Your Pro-Rata Dividend Allocation
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                          {phase === 3 ? '0.00' : '418,308.00'}
                        </span>
                        <span className="font-mono text-xs font-bold text-purple-700">
                          $xSTOCK
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-400 text-[10px] block">Holding Share:</span>
                      <span className="font-bold text-slate-800">22.74M $POPCAT</span>
                      <span className="text-purple-700 text-[10px] block">(34.91% pool)</span>
                    </div>
                  </div>

                  {/* Claim Button / Settled badge */}
                  <div className="pt-2 border-t border-slate-200/60">
                    {phase === 2 ? (
                      <button
                        type="button"
                        className={`w-full py-3 rounded-xl font-bold text-xs text-white bg-[#7C3AED] shadow-sm transition-all flex items-center justify-center gap-2 ${
                          cursorPos.clicking ? 'scale-98 bg-[#6D28D9]' : ''
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Claim 418,308.00 $xSTOCK</span>
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="font-bold text-emerald-900">418,308 $xSTOCK Transferred to Wallet</span>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-700 font-semibold">Settled</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Pot Stats Table */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Total Fees Routed</span>
                    <span className="font-bold text-slate-900">1,198,087 $xSTOCK</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Eligible Supply</span>
                    <span className="font-bold text-slate-900">65.13M $POPCAT</span>
                  </div>
                </div>

              </div>
            )}

            {/* Mockup footer indicator */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Meteora DBC &bull; Anchor Program</span>
              <span className="text-purple-700 font-semibold">Auto-simulating live flow...</span>
            </div>

          </div>

        </div>

        {/* Animated Moving Realistic SVG Pointer Cursor */}
        <div
          className="absolute pointer-events-none z-30 transition-all duration-700 ease-out"
          style={{
            left: `${cursorPos.x}%`,
            top: `${cursorPos.y}%`,
          }}
        >
          <div className={`relative transition-transform ${cursorPos.clicking ? 'scale-75' : 'scale-100'}`}>
            <svg
              className="h-6 w-6 text-slate-950 drop-shadow-md"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="white"
              strokeWidth="1.5"
            >
              <path d="M3 3l7 18 3-7 7-3L3 3z" />
            </svg>
            <span className="absolute -bottom-5 left-4 text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950 text-white shadow-xs">
              {isCreatorView ? 'Creator' : 'Holder'}
            </span>
          </div>
        </div>

      </div>

      {/* 4. Floating Phase Status Card at Bottom Center (Shifted Lower to Hang Over Border) */}
      <div className="absolute -bottom-4 sm:-bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94%] sm:w-auto sm:min-w-[340px] max-w-[calc(100%-16px)]">
        <div className="rounded-2xl border-2 border-orange-400/90 bg-white/95 backdrop-blur-md p-2.5 sm:p-3.5 shadow-[0_12px_36px_-6px_rgba(249,115,22,0.28)] space-y-1.5 font-sans text-xs">
          
          {/* Step 1 Item */}
          <div
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition-all ${
              phase === 0
                ? 'bg-orange-50 font-bold text-orange-950 border border-orange-200 shadow-xs'
                : phase > 0
                ? 'text-slate-700 font-medium'
                : 'text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${phase === 0 ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span>1. Creator configures $POPCAT / $xSTOCK pair</span>
            </div>
            {phase > 0 && <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />}
          </div>

          {/* Step 2 Item */}
          <div
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition-all ${
              phase === 1
                ? 'bg-orange-50 font-bold text-orange-950 border border-orange-200 shadow-xs'
                : phase > 1
                ? 'text-slate-700 font-medium'
                : 'text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${phase === 1 ? 'bg-orange-500 animate-pulse' : phase > 1 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>2. 60% DBC trade fee share routed to Vault PDA</span>
            </div>
            {phase > 1 && <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />}
          </div>

          {/* Step 3 Item */}
          <div
            className={`flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-lg transition-all ${
              phase >= 2
                ? 'bg-orange-50 font-bold text-orange-950 border border-orange-200 shadow-xs'
                : 'text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${phase === 2 ? 'bg-orange-500 animate-pulse' : phase === 3 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span>3. Holder claims 418,308 $xSTOCK pro-rata</span>
            </div>
            {phase === 3 && <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />}
          </div>

        </div>
      </div>

    </div>
  );
}
