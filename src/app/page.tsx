'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
} from 'lucide-react';
import { MetricsCards } from '@/components/MetricsCards';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-bg text-slate-900 bg-grid-boxes flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-lg"
          >
            <Image
              src="/divvy-mod.png"
              alt="Divvy Logo"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg flex-shrink-0"
              priority
            />
            <div>
              <span className="font-bold text-base leading-none text-slate-900 tracking-tight flex items-center gap-1.5">
                Divvy
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 px-1.5 py-0.5 rounded">
                  Devnet
                </span>
              </span>
              <span className="block text-[11px] font-mono text-slate-500 mt-0.5">
                Meteora DBC Dividends
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600" aria-label="Main landing navigation">
            <Link
              href="/app"
              className="hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded px-1.5 py-1"
            >
              Protocol Overview
            </Link>
            <Link
              href="/app/pool"
              className="hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded px-1.5 py-1"
            >
              Pools Directory
            </Link>
            <Link
              href="/app/claim"
              className="hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded px-1.5 py-1"
            >
              Claim Portal
            </Link>
            <Link
              href="/app/create"
              className="hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded px-1.5 py-1"
            >
              Creator Studio
            </Link>
            <Link
              href="/app/audit"
              className="hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded px-1.5 py-1"
            >
              Audit Trail
            </Link>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <span>Launch App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            
            {/* Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-medium text-slate-600">
                Solana Meteora Dynamic Bonding Curve Infrastructure
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1]">
              Hold the Meme.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
                Earn the Stock.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Divvy automates on-chain dividend distribution for Meteora Dynamic Bonding Curves.
              Turn speculative trading fee volume into continuous, pro-rata dividend yields for token holders.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <span>Enter Divvy App</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/app/claim"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <span>Holder Claim Portal</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Quick Guarantees */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-mono">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Permissionless Pairings
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Anchor PDA Vault Security
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Zero Lockup Requirements
              </span>
            </div>
          </div>

          {/* Live Protocol Telemetry Box Preview */}
          <div className="mt-12 sm:mt-16">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Live Protocol Telemetry
                </span>
                <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
                  Read in real-time from Solana Devnet
                </span>
              </div>
              <Link
                href="/app/pool"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                <span>View All Pools</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <MetricsCards />
          </div>
        </section>

        {/* 3-Step Lifecycle Section */}
        <section className="py-14 border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                How It Works
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Automated 3-Step Fee Pipeline
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                No complex staking contracts. Dividends flow continuously from trading activity straight to holders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                      01
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Trading Fees Accrue
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Swaps on Meteora DBC
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Traders buy and sell the meme token on Meteora Dynamic Bonding Curves. Every swap generates trading fees denominated in quote assets (e.g. $xSTOCK or $USDC).
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <Link
                    href="/app/pool"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>Inspect live pools</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                      02
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Fee Share Routing
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Deposited to Vault PDA
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The token creator claims accumulated DBC fees and executes <code className="font-mono text-[11px] bg-slate-200 px-1 py-0.5 rounded text-slate-800">route_fees</code>, depositing the configured fee share (e.g. 60%) into the program-owned Dividend Vault.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <Link
                    href="/app/create"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>Creator studio</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                      03
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                      Pro-Rata Claim
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Holders Withdraw Yield
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Token holders connect their wallet to claim their exact proportional share of dividends at any time with an automated continuous cumulative index mechanism.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200">
                  <Link
                    href="/app/claim"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>Claim portal</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid / Protocol Guarantees */}
        <section className="py-14 border-t border-slate-200 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
              <Coins className="h-5 w-5 text-brand-600" />
              <h3 className="font-bold text-sm text-slate-900">Permissionless Tokens</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Any SPL meme token can be paired with any quote dividend asset (xSTOCK, USDC, or SOL).
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Program PDA Security</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                All dividend tokens reside in a program-derived vault address. No central party can drain user yield.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-sm text-slate-900">O(1) Continuous Math</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scalable cumulative dividend per-token index ensures fast claims without iterating over thousands of holders.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
              <Layers className="h-5 w-5 text-brand-600" />
              <h3 className="font-bold text-sm text-slate-900">On-Chain Audit Trail</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every swap, fee claim, routing deposit, and holder withdrawal is verifiable on Solana Explorer.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="rounded-2xl border border-slate-900 bg-slate-950 text-white p-8 sm:p-12 text-center space-y-5">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to launch or claim dividends?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Explore live on-chain pools, connect your wallet to claim accrued yields, or launch a new Divvy vault for your token in under 60 seconds.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 shadow-sm transition-all hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <span>Launch App</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/app/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-transparent px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <span>Create a Vault</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Divvy Protocol</span>
            <span>&bull;</span>
            <span>Meteora Dynamic Bonding Curve Dividends</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <Link href="/app" className="hover:text-slate-900 transition-colors">
              App
            </Link>
            <Link href="/app/pool" className="hover:text-slate-900 transition-colors">
              Pools
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
          </div>
        </div>
      </footer>
    </div>
  );
}
