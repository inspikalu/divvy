'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { useSidebarDrawer } from '@/components/AppShell';

interface PagePanelProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The main white content card of a page — mirrors the reference layout:
 * page title at the top, wallet button + page actions inside the card header.
 */
export function PagePanel({ title, subtitle, action, children }: PagePanelProps) {
  const { openDrawer } = useSidebarDrawer();

  return (
    <div className="rounded-2xl border border-surface-border bg-white shadow-card">
      {/* Panel header — tight like the reference; wallet button lives INSIDE the card */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={openDrawer}
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 lg:hidden"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          {action}
          <WalletConnectButton />
        </div>
      </div>

      {/* Panel body — tight */}
      <div className="px-5 pb-5 pt-1 sm:px-6">{children}</div>
    </div>
  );
}
