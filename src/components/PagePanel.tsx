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
 * The main white content card of a page : mirrors the reference layout:
 * page title at the top, wallet button + page actions inside the card header.
 */
export function PagePanel({ title, subtitle, action, children }: PagePanelProps) {
  const { openDrawer } = useSidebarDrawer();

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Panel header with hairline divider */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6 border-b border-slate-100">
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={openDrawer}
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          {action}
          <WalletConnectButton />
        </div>
      </div>

      {/* Panel body */}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}
