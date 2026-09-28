'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Coins,
  Layers,
  ChevronRight,
  Calculator,
  Lock,
  Check,
  ArrowUpRight,
  FileSearch,
  HandCoins,
  Rocket,
} from 'lucide-react';
import { InteractiveAppPreview } from '@/components/InteractiveAppPreview';
import { MetricsCards } from '@/components/MetricsCards';
import { PoweredBy } from '@/components/PoweredBy';

export default function SliteEditorialLandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [dailyVolume, setDailyVolume] = useState<number>(50000);
  const [feeShareBps, setFeeShareBps] = useState<number>(6000);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const estimatedDailyFees = (dailyVolume * 100) / 10000;
  const estimatedDailyDividend = (estimatedDailyFees * feeShareBps) / 10000;
  const estimatedMonthlyDividend = estimatedDailyDividend * 30;
  const estimatedAnnualDividend = estimatedDailyDividend * 365;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1A1A1A] flex flex-col justify-between selection:bg-purple-200 selection:text-purple-950 font-sans antialiased">
      
      {/* 1. Slite-Style Navbar: No bottom border until scroll, spacious padding */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          isScrolled
            ? 'bg-[#FBF9F5]/90 backdrop-blur-md border-b border-black/[0.06] shadow-xs py-3.5 px-6 sm:px-10'
            : 'bg-transparent border-b-0 py-6 px-6 sm:px-10'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-full"
          >
            <Image
              src="/icon.png"
              alt="Divvy Logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg flex-shrink-0"
              priority
            />
            <span className="font-extrabold text-2xl tracking-tight text-[#1A1A1A]">
              divvy
            </span>
          </Link>

          {/* Minimalist Slite-style Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-[#4A4744]" aria-label="Main navigation">
            <Link href="/app" className="hover:text-[#1A1A1A] transition-colors">
              How it works
            </Link>
            <Link href="/app/pool" className="hover:text-[#1A1A1A] transition-colors">
              Pools
            </Link>
            <Link href="/app/claim" className="hover:text-[#1A1A1A] transition-colors">
              Claim
            </Link>
            <Link href="/app/create" className="hover:text-[#1A1A1A] transition-colors">
              Creator Studio
            </Link>
            <Link href="/app/audit" className="hover:text-[#1A1A1A] transition-colors">
              Audit
            </Link>
          </nav>

          {/* Right Action Pill Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/app/claim"
              className="hidden sm:inline-flex text-[15px] font-medium text-[#1A1A1A] hover:text-purple-700 transition-colors px-2 py-1"
            >
              Sign in
            </Link>

            <Link
              href="/app/demo"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold text-[#1A1A1A] border border-black/20 hover:bg-black/[0.04] transition-all"
            >
              Demo Guide
            </Link>

            <Link
              href="/app"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#1A1A1A] hover:bg-black transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Slite-Style Hero Section */}
      <main className="flex-1">
        <section className="pt-10 sm:pt-16 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-8">
          
          {/* Main Display Headline with Organic Brush-Like Oval Sketch around "Verified" / "Real dividends" */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1A1A1A] leading-[1.08]">
              Hold your favorite meme.
              <br />
              <span className="relative inline-block isolate">
                {/* Slite-Style Authentic Hand-Drawn Brush Oval Sketch SVG */}
                <svg
                  className="absolute -top-[22%] -left-[14%] w-[128%] h-[150%] pointer-events-none select-none text-[#E8DCCF] -z-10"
                  viewBox="0 0 260 110"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  {/* Outer loose chalk loop */}
                  <path
                    d="M32 55C24 32 60 14 135 12C210 10 248 28 244 54C240 80 196 98 122 100C48 102 18 84 26 58C30 42 58 26 110 20"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.85"
                  />
                  {/* Inner secondary texture stroke */}
                  <path
                    d="M40 50C36 34 72 20 140 18C208 16 236 32 232 52C228 72 188 88 126 90C64 92 34 78 38 56"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.5"
                  />
                </svg>
                <span className="relative">Get paid</span>
              </span>
              {' '}every time it trades.
            </h1>

            <p className="text-base sm:text-lg text-[#55524E] max-w-2xl mx-auto leading-relaxed font-normal pt-2">
              Every swap on Meteora routes trading fees straight into a shared pot for holders. Connect your wallet and withdraw your share anytime.
            </p>
          </div>

          {/* Centered Primary Warm Action Button */}
          <div className="pt-2 flex items-center justify-center">
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#7C3AED] px-8 py-4 text-base font-bold text-white shadow-sm hover:bg-[#6D28D9] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <span>Launch Divvy App</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 3. Interactive Live App Preview Playing a Sequence (Slite Screen 2) */}
          <div className="pt-8">
            <InteractiveAppPreview />
          </div>

        </section>

        {/* 4. Powered By / Ecosystem Integration Strip (Slite Screenshot Style) */}
        <PoweredBy />

        {/* 5. Live Protocol Telemetry Stats */}
        <section className="py-12 border-b border-black/[0.06] bg-[#F5F2EB]/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Protocol Telemetry
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Solana Devnet Contract: 235z...PXG5
              </span>
            </div>
            <MetricsCards />
          </div>
        </section>

        {/* 5. Interactive Yield Simulator */}
        <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-black/[0.08] bg-white p-6 sm:p-10 shadow-xs space-y-8">
            
            <div className="max-w-xl space-y-1.5 text-left">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                <Calculator className="h-3 w-3" />
                Interactive Yield Simulator
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Simulate your token&apos;s dividend yield
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                See how much quote asset yield ($xSTOCK / $USDC) your token community earns based on Meteora DBC trading volume.
              </p>
            </div>

            {/* Simulator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
              
              {/* Sliders (Left 7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Slider 1: Daily Volume */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="volume-slider" className="text-xs font-bold text-slate-800">
                      Daily Meteora DBC Trading Volume
                    </label>
                    <span className="font-mono text-sm font-extrabold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
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
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
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
                  <span className="text-[11px] font-mono text-purple-700 font-semibold block">
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

        {/* 6. Human-Crafted Architecture Section (Asymmetrical, Real Artifacts, No Generic Pills) */}
        <section className="py-20 border-t border-black/[0.06] bg-[#FAF8F5]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
            
            {/* Left-Aligned Header + Beside Paragraph (Breaking AI Symmetry) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
              <div className="lg:col-span-7 space-y-2 text-left">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#7C3AED]">
                  Architecture &amp; Settlement
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#231B2A] tracking-tight leading-tight">
                  Your dividends never touch our wallet.
                </h2>
              </div>
              <div className="lg:col-span-5 text-left">
                <p className="text-[15px] sm:text-base text-[#524959] leading-relaxed">
                  Divvy replaces centralized fee management with immutable Solana smart contracts. Trading fees accumulate automatically and stream directly to token holders.
                </p>
              </div>
            </div>

            {/* Asymmetrical Feature Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Feature 1: Large Dominant Block (Lavender Background + Real PDA Vault Artifact) */}
              <div className="grain relative lg:col-span-7 rounded-2xl border border-[#E5DBF5] bg-[#F5F0FC] p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left shadow-[0_4px_20px_-8px_rgba(124,58,237,0.12)]">
                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#231B2A] tracking-tight">
                    Funds sit in a vault only the program can move.
                  </h3>
                  <p className="text-[15px] text-[#524959] leading-relaxed">
                    All dividend funds reside in a program-derived token account owned strictly by the Solana Anchor program. No deployer, creator, or intermediary can access or redirect community yield.
                  </p>
                </div>

                {/* Real Product Artifact: On-Chain Vault Inspector */}
                <div className="rounded-xl border border-[#DCD0F0] bg-white p-4 font-mono text-xs space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-700">ON-CHAIN VAULT ACCOUNT</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Solana Devnet
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Vault PDA</span>
                      <span className="text-slate-800 font-bold">7xKp…3fQa</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Program Authority</span>
                      <span className="text-slate-800 font-bold">divvy_program</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Quote Asset</span>
                      <span className="text-purple-700 font-bold">$xSTOCK (Tessera)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Deployer Admin Role</span>
                      <span className="text-emerald-700 font-bold">None (Immutable)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/app/audit"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] transition-colors"
                  >
                    <span>Inspect on-chain audit trail</span>
                    <FileSearch className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Feature 2: Clean Companion Card (Index Math Artifact) */}
              <div className="lg:col-span-5 rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left">
                <div className="space-y-3">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                    Scalable Computation
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#231B2A] tracking-tight">
                    Claiming costs the same for 10 holders or 10,000.
                  </h3>
                  <p className="text-[15px] text-[#524959] leading-relaxed">
                    Divvy avoids looping through holder accounts. Using a continuous cumulative index with 10<sup>12</sup> scaling precision, claims settle in constant O(1) time without gas spikes.
                  </p>
                </div>

                {/* Real Product Artifact: Index Math Code Snippet */}
                <div className="rounded-xl border border-slate-200 bg-[#FAF8F5] p-3.5 font-mono text-[11px] text-slate-700 space-y-1.5">
                  <div className="text-[10px] text-slate-400 font-bold">GLOBAL ACCUMULATOR MATH</div>
                  <div className="text-purple-900 font-semibold truncate">
                    reward_per_token += fee_delta * 1e12 / supply
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Compute Cost: 4,200 CU</span>
                    <span className="text-emerald-600 font-bold">~0.000005 SOL</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/app/claim"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] transition-colors"
                  >
                    <span>Test live claim portal</span>
                    <HandCoins className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Feature 3: Full-Width Row / Pairings (Hairline Divided) */}
              <div className="lg:col-span-12 rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-left">
                <div className="space-y-1.5 max-w-2xl">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                    Asset Flexibility
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#231B2A] tracking-tight">
                    Pair any meme with real tokenized equity or stablecoins.
                  </h3>
                  <p className="text-[15px] text-[#524959] leading-relaxed">
                    Distribute tokenized pre-IPO stocks ($xSTOCK), yield-bearing assets, stablecoins ($USDC), or native $SOL straight from Meteora Dynamic Bonding Curves.
                  </p>
                </div>

                {/* Real Artifact: Live Active Pair Capsule */}
                <div className="flex-shrink-0 flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-slate-200">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block">Active Devnet Pair</span>
                    <span className="font-bold text-xs text-slate-900">$POPCAT / $xSTOCK</span>
                  </div>
                  <div className="h-7 w-[1px] bg-slate-200" />
                  <Link
                    href="/app/create"
                    className="px-4 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
                  >
                    Configure Pair
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* 7. Redesigned Human CTA Section (Deep Plum Block, No Badges, Natural Flow) */}
        <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
          <div className="grain-dark relative rounded-2xl border border-[#3C2458] bg-[#231435] text-white p-8 sm:p-14 text-center space-y-6 shadow-[0_20px_50px_-20px_rgba(35,20,53,0.4)]">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
              Try it on devnet in five minutes.
            </h2>
            <p className="text-base sm:text-lg text-[#D6C8E8] max-w-xl mx-auto leading-relaxed font-normal">
              Explore live on-chain vaults, test the holder claim portal with funded demo wallets, or launch fee-sharing on your own token.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link
                href="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#7C3AED] px-8 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-[#6D28D9] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <span>Enter Divvy App</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/app/create"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C4B5FD] hover:text-white underline-offset-4 hover:underline transition-colors"
              >
                <Rocket className="h-3.5 w-3.5" />
                <span>or configure a creator vault</span>
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
