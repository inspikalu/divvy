'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Coins,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Lock,
  ChevronRight,
  Search,
  Calculator,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  Percent,
} from 'lucide-react';
import { MetricsCards } from '@/components/MetricsCards';

export default function SliteInspiredLandingPage() {
  const router = useRouter();
  const [searchMint, setSearchMint] = useState('');
  const [dailyVolume, setDailyVolume] = useState<number>(50000); // $50k daily volume default
  const [feeShareBps, setFeeShareBps] = useState<number>(6000); // 60% default

  // Estimated Calculations
  // Meteora DBC typical swap fee: ~1% (100 bps)
  const tradingFeeBps = 100;
  const estimatedDailyFees = useMemo(() => {
    return (dailyVolume * tradingFeeBps) / 10000;
  }, [dailyVolume]);

  const estimatedDailyDividend = useMemo(() => {
    return (estimatedDailyFees * feeShareBps) / 10000;
  }, [estimatedDailyFees, feeShareBps]);

  const estimatedMonthlyDividend = estimatedDailyDividend * 30;
  const estimatedAnnualDividend = estimatedDailyDividend * 365;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMint.trim()) {
      router.push(`/app/pool?search=${encodeURIComponent(searchMint.trim())}`);
    } else {
      router.push('/app/pool');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#191817] flex flex-col justify-between selection:bg-brand-200 selection:text-brand-950 font-sans antialiased">
      
      {/* 1. Slite-Style Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FBF9F5]/85 border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-full"
          >
            <div className="h-9 w-9 rounded-xl bg-slate-950 flex items-center justify-center p-1.5 shadow-xs">
              <Image
                src="/divvy-mod.png"
                alt="Divvy Logo"
                width={28}
                height={28}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg leading-none tracking-tight text-[#191817] flex items-center gap-1.5">
                divvy
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-500 mt-0.5 tracking-tight">
                Meteora DBC Dividends
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-[14px] font-medium text-[#4A4744]" aria-label="Main navigation">
            <Link
              href="/app"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/[0.04] hover:text-[#191817] transition-all"
            >
              Protocol
            </Link>
            <Link
              href="/app/pool"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/[0.04] hover:text-[#191817] transition-all"
            >
              Directory
            </Link>
            <Link
              href="/app/claim"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/[0.04] hover:text-[#191817] transition-all"
            >
              Claim Portal
            </Link>
            <Link
              href="/app/create"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/[0.04] hover:text-[#191817] transition-all"
            >
              Creator Studio
            </Link>
            <Link
              href="/app/audit"
              className="px-3.5 py-1.5 rounded-full hover:bg-black/[0.04] hover:text-[#191817] transition-all"
            >
              Audit Trail
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/app/claim"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold text-[#191817] border border-black/15 hover:bg-black/[0.04] transition-all"
            >
              Claim Yield
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Slite-Style Hero Section */}
      <main className="flex-1">
        <section className="relative pt-16 sm:pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-8">
          
          {/* Top Pill Status */}
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/90 px-3.5 py-1 text-xs text-slate-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] font-semibold text-[#3C3A36]">
              Meteora Dynamic Bonding Curve Protocol
            </span>
            <span className="text-[10px] font-mono bg-brand-50 text-brand-700 font-bold px-1.5 py-0.2 rounded-full border border-brand-200">
              Devnet Live
            </span>
          </div>

          {/* Main Display Headline with Hand-drawn Underline effect */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#191817] leading-[1.08]">
              Where meme tokens share{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 text-brand-700">real dividends</span>
                {/* Slite-style hand-drawn organic curve SVG highlight */}
                <svg
                  className="absolute left-0 -bottom-2 w-full h-3 text-brand-400/80 -z-0"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 9C45 3 145 1.5 197 7.5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              {' '}and build conviction.
            </h1>

            <p className="text-base sm:text-lg text-[#5C5852] max-w-2xl mx-auto leading-relaxed font-normal pt-2">
              Divvy automates on-chain dividend routing for Meteora Dynamic Bonding Curves.
              Turn speculative trading fee volume into continuous, pro-rata income for holders.
            </p>
          </div>

          {/* Slite-Style Unified Pill: Combined Search & Action Bar */}
          <div className="pt-2 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row items-center rounded-2xl sm:rounded-full bg-white p-1.5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] border border-black/10 transition-all focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100"
            >
              <div className="flex items-center flex-1 px-3.5 py-2 sm:py-0 w-full">
                <Search className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search by token mint, symbol, or creator..."
                  value={searchMint}
                  onChange={(e) => setSearchMint(e.target.value)}
                  className="w-full bg-transparent text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto pt-1 sm:pt-0">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-500 transition-all"
                >
                  <span>Explore Pools</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <Link
                  href="/app"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-black/15 bg-[#F5F2EB] px-4 py-2.5 text-xs font-semibold text-[#191817] hover:bg-black/5 transition-all"
                >
                  App
                </Link>
              </div>
            </form>
          </div>

          {/* 3. The Dynamic Bonding Curve Arc Visual (Slite-style Globe / Arc Illustration) */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="relative rounded-3xl border border-black/[0.08] bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-xs overflow-hidden">
              
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.05]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-brand-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    The Meteora Bonding Curve Fee Cycle
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Fully On-Chain via Anchor PDA
                </span>
              </div>

              {/* Dynamic Bonding Curve Diagram Flow */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3 relative z-10">
                
                {/* Step 1 */}
                <div className="rounded-2xl border border-black/[0.06] bg-[#FBF9F5] p-4 text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded-full">
                      01. Swap
                    </span>
                    <Coins className="h-4 w-4 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 pt-1">Traders Trade Meme</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Volume on Meteora DBC generates continuous trading fees in quote assets ($xSTOCK, $USDC).
                  </p>
                </div>

                {/* Step 2 */}
                <div className="rounded-2xl border border-black/[0.06] bg-[#FBF9F5] p-4 text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded-full">
                      02. Accrue
                    </span>
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 pt-1">DBC Collects Fees</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Creator fee pool accumulates quote tokens automatically with every bonding curve buy/sell.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="rounded-2xl border border-black/[0.06] bg-[#FBF9F5] p-4 text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded-full">
                      03. Route
                    </span>
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 pt-1">Deposit to Vault PDA</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Creator streams their configured fee share (e.g. 60%) into the program-owned Dividend Vault.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="rounded-2xl border border-brand-300 bg-brand-50/50 p-4 text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-800 bg-brand-200/80 px-2 py-0.5 rounded-full">
                      04. Claim
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 pt-1">Holders Withdraw</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Holders connect wallets and withdraw their exact proportional dividends with zero lockups.
                  </p>
                </div>

              </div>

              {/* Curve Flow Indicator footer */}
              <div className="mt-5 pt-3 border-t border-black/[0.05] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <span className="font-mono text-[11px]">
                  Continuous $O(1)$ cumulative index &bull; Zero looping or gas overhead
                </span>
                <Link
                  href="/app/pool"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  <span>Explore Live Devnet Vaults</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

            </div>
          </div>

        </section>

        {/* 4. Live Protocol Telemetry Stats Strip */}
        <section className="py-10 border-y border-black/[0.06] bg-[#F5F2EB]/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Protocol Telemetry
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Solana Program: 235z...PXG5
              </span>
            </div>
            <MetricsCards />
          </div>
        </section>

        {/* 5. Slite-Style Interactive Yield Simulator */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-10 shadow-xs space-y-8">
            
            <div className="max-w-xl space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                <Calculator className="h-3 w-3" />
                Interactive Yield Simulator
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Simulate your token&apos;s dividend power
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                See how much quote asset yield ($xSTOCK / $USDC) your token community earns based on Meteora DBC trading volume.
              </p>
            </div>

            {/* Simulator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Sliders (Left 7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Slider 1: Daily Volume */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="volume-slider" className="text-xs font-bold text-slate-800">
                      Daily Meteora DBC Trading Volume
                    </label>
                    <span className="font-mono text-sm font-extrabold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                      ${dailyVolume.toLocaleString('en-US')} / day
                    </span>
                  </div>
                  <input
                    id="volume-slider"
                    type="range"
                    min="5000"
                    max="500000"
                    step="5000"
                    value={dailyVolume}
                    onChange={(e) => setDailyVolume(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>$5,000</span>
                    <span>$250,000</span>
                    <span>$500,000+</span>
                  </div>
                </div>

                {/* Slider 2: Fee Share Bps */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="fee-share-slider" className="text-xs font-bold text-slate-800">
                      Creator Dividend Allocation
                    </label>
                    <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {(feeShareBps / 100).toFixed(0)}% Fee Share
                    </span>
                  </div>
                  <input
                    id="fee-share-slider"
                    type="range"
                    min="1000"
                    max="10000"
                    step="500"
                    value={feeShareBps}
                    onChange={(e) => setFeeShareBps(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>10% (Low)</span>
                    <span>60% (Default)</span>
                    <span>100% (Full Community)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  * Assumes standard 1% Meteora DBC swap fee curve. Dividend payouts distributed pro-rata to eligible circulating supply.
                </p>
              </div>

              {/* Output Yield Card (Right 5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-black/10 bg-[#FBF9F5] p-5 sm:p-6 space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">
                  Holder Dividend Yield Output
                </span>

                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Daily Streamed to Vault:</span>
                  <div className="font-mono text-3xl font-extrabold text-slate-900 tracking-tight">
                    ${estimatedDailyDividend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] font-mono text-brand-700 font-semibold block">
                    in $xSTOCK / $USDC
                  </span>
                </div>

                <div className="pt-3 border-t border-black/[0.06] grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Monthly Run Rate</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      ${estimatedMonthlyDividend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Annualized Value</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">
                      ${estimatedAnnualDividend.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/app/create"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-xs"
                  >
                    <span>Create Vault for Token</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* 6. Core Pillars / Editorial Feature Cards */}
        <section className="py-16 border-t border-black/[0.06] bg-[#F5F2EB]/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
            
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                Core Protocol Guarantees
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Engineered for trustless distribution
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Pillar 1 */}
              <div className="rounded-3xl border border-black/[0.08] bg-white p-6 space-y-3 shadow-xs">
                <div className="h-10 w-10 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-bold">
                  <Coins className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Permissionless Token Pairings</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pair any Meteora DBC meme token with any SPL quote asset. Distribute tokenized stocks ($xSTOCK), stablecoins ($USDC), or native $SOL directly to community holders.
                </p>
                <div className="pt-2">
                  <Link href="/app/create" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                    <span>Creator Studio</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-3xl border border-black/[0.08] bg-white p-6 space-y-3 shadow-xs">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Anchor PDA Non-Custodial Vaults</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  All dividend funds reside in a program-derived token account owned strictly by the Solana Anchor program. No deployer or intermediary can access or redirect community yield.
                </p>
                <div className="pt-2">
                  <Link href="/app/audit" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                    <span>Inspect Audit Trail</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-3xl border border-black/[0.08] bg-white p-6 space-y-3 shadow-xs">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Continuous $O(1)$ Math</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Using a global cumulative index per base token, claims require single-instruction transactions. No expensive account loops, lockups, or gas spikes as holder counts scale.
                </p>
                <div className="pt-2">
                  <Link href="/app/claim" className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1">
                    <span>Claim Portal</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 7. Bottom Callout Banner */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-slate-900 bg-slate-950 text-white p-8 sm:p-12 text-center space-y-6 shadow-md">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-300 bg-brand-950 border border-brand-800 px-3 py-1 rounded-full">
              Get Started on Solana Devnet
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Start streaming real dividends today.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Explore active on-chain vaults, test the holder claim portal with funded demo wallets, or launch Divvy on your own token in minutes.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-xs font-bold text-white shadow-sm hover:bg-brand-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <span>Enter Divvy App</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/app/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3 text-xs font-bold text-white hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <span>Launch a Vault</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* 8. Slite-Style Minimalist Footer */}
      <footer className="border-t border-black/[0.06] bg-[#FBF9F5] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#736E67]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-tight">divvy</span>
            <span>&bull;</span>
            <span>Meteora Dynamic Bonding Curve Dividends on Solana</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <Link href="/app" className="hover:text-slate-900 transition-colors">
              App Overview
            </Link>
            <Link href="/app/pool" className="hover:text-slate-900 transition-colors">
              Directory
            </Link>
            <Link href="/app/claim" className="hover:text-slate-900 transition-colors">
              Claim
            </Link>
            <Link href="/app/create" className="hover:text-slate-900 transition-colors">
              Create
            </Link>
            <Link href="/app/audit" className="hover:text-slate-900 transition-colors">
              Audit
            </Link>
            <Link href="/app/demo" className="hover:text-slate-900 transition-colors">
              Demo Guide
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
