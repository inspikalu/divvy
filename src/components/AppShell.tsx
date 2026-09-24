'use client';

import React, { useState, createContext, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HandCoins,
  Rocket,
  Waves,
  ShieldCheck,
  KeyRound,
  X,
} from 'lucide-react';

const DrawerContext = createContext<{ openDrawer: () => void }>({ openDrawer: () => {} });

export function useSidebarDrawer() {
  return useContext(DrawerContext);
}

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/claim', label: 'Claim Portal', icon: HandCoins },
  { href: '/create', label: 'Creator Studio', icon: Rocket },
  { href: '/pool', label: 'Pool Details', icon: Waves },
  { href: '/audit', label: 'Audit Trail', icon: ShieldCheck },
  { href: '/demo', label: 'Demo Guide', icon: KeyRound },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Main navigation">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
              active
                ? 'bg-brand-50 font-semibold text-brand-700'
                : 'text-slate-600 hover:bg-surface-accent hover:text-slate-900'
            }`}
          >
            <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${active ? 'text-brand-500' : 'text-slate-400'}`} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand block with logo — the white "workspace" card like the reference */}
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl border border-surface-border bg-white p-3 shadow-card transition-shadow hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        <Image
          src="/divvy-mod.png"
          alt="Divvy logo"
          width={40}
          height={40}
          className="h-10 w-10 flex-shrink-0"
          priority
        />
        <div>
          <div className="text-base font-bold leading-none text-slate-900">Divvy</div>
          <div className="mt-1 text-[11px] leading-tight text-slate-500">
            Hold the Meme : Earn the Stock
          </div>
        </div>
      </Link>

      {/* Nav */}
      <div className="mt-4 flex-1 overflow-y-auto">
        <NavLinks onNavigate={onNavigate} />
      </div>

      {/* Footer */}
      <div className="border-t border-surface-border px-1 pt-3 pb-1">
        <div className="flex items-center gap-2 px-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
          <span className="text-[11px] text-slate-500">Solana Devnet</span>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <DrawerContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
    <div className="min-h-screen bg-surface-bg">
      {/* Two same-level cards: sidebar | content — small gap, both starting at the same top line */}
      <div className="flex w-full items-start gap-2.5 p-2.5">
        {/* Sidebar card (desktop) */}
        <aside className="sticky top-2.5 hidden w-60 flex-shrink-0 lg:block">
          <div className="flex h-[calc(100vh-1.25rem)] flex-col rounded-2xl border border-surface-border bg-white p-3 shadow-card">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] p-2.5">
              <div className="relative h-full rounded-2xl border border-surface-border bg-white p-3 shadow-xl">
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation"
                  className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-surface-accent hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  <X className="h-5 w-5" />
                </button>
                <SidebarContent onNavigate={() => setDrawerOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Content card — the one big white panel, same top line as the sidebar */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
    </DrawerContext.Provider>
  );
}
