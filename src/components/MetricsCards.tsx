'use client';

import React from 'react';
import { ExternalLink, TrendingUp, Vault, HandCoins, Percent, Loader2 } from 'lucide-react';
import { ProtocolMetrics } from '@/hooks/useDivvyProtocol';
import {
  getExplorerAddressUrl,
  DIVVY_CONFIG_PDA,
  DIVIDEND_VAULT_PDA,
  shortenAddress,
} from '@/lib/constants';

interface MetricsCardsProps {
  metrics: ProtocolMetrics;
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  explorerUrl,
  explorerLabel,
  loading,
  refreshing,
  accentClass,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  explorerUrl?: string;
  explorerLabel?: string;
  loading: boolean;
  refreshing: boolean;
  accentClass: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-surface-border bg-surface-accent p-4 transition-shadow hover:shadow-card-hover">
      {/* Left: content */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${accentClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-widest text-slate-500">{title}</div>
          {loading ? (
            <div className="mt-1 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              <span className="text-sm text-slate-400">Loading…</span>
            </div>
          ) : (
            <div className="mt-0.5 truncate text-xl font-bold text-slate-900">{value}</div>
          )}
        </div>
      </div>

      {/* Right: data */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          {refreshing && (
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400"
              title="Syncing with devnet…"
            />
          )}
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg border border-surface-border bg-white px-2 py-1 text-[10px] text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              {explorerLabel || 'Explorer'}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
        {subtitle && !loading && (
          <div className="text-right text-[11px] leading-tight text-slate-400 max-w-[9rem]">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const claimedPercent =
    metrics.totalRoutedAtomic > BigInt(0)
      ? Math.round((Number(metrics.totalClaimedAtomic) / Number(metrics.totalRoutedAtomic)) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <MetricCard
        title="Total Fees Routed"
        value={`${metrics.totalRoutedFormatted} xSTOCK`}
        subtitle="Cumulative dividends sent to vault"
        icon={TrendingUp}
        explorerUrl={getExplorerAddressUrl(DIVVY_CONFIG_PDA)}
        explorerLabel={shortenAddress(DIVVY_CONFIG_PDA, 4)}
        loading={metrics.loading}
        refreshing={metrics.refreshing}
        accentClass="bg-brand-50 text-brand-600"
      />
      <MetricCard
        title="Vault Balance"
        value={`${metrics.vaultBalanceFormatted} xSTOCK`}
        subtitle="Live SPL token balance on devnet"
        icon={Vault}
        explorerUrl={getExplorerAddressUrl(DIVIDEND_VAULT_PDA)}
        explorerLabel={shortenAddress(DIVIDEND_VAULT_PDA, 4)}
        loading={metrics.loading}
        refreshing={metrics.refreshing}
        accentClass="bg-purple-50 text-purple-600"
      />
      <MetricCard
        title="Total Claimed"
        value={`${metrics.totalClaimedFormatted} xSTOCK`}
        subtitle={`${claimedPercent}% of routed dividends claimed`}
        icon={HandCoins}
        explorerUrl={getExplorerAddressUrl(DIVVY_CONFIG_PDA)}
        explorerLabel="Config PDA"
        loading={metrics.loading}
        refreshing={metrics.refreshing}
        accentClass="bg-sky-50 text-sky-600"
      />
      <MetricCard
        title="Fee Share"
        value={`${metrics.feeSharePercent.toFixed(2)}%`}
        subtitle="Of DBC creator fees : Vault"
        icon={Percent}
        explorerUrl={getExplorerAddressUrl(DIVVY_CONFIG_PDA)}
        explorerLabel="Config PDA"
        loading={metrics.loading}
        refreshing={metrics.refreshing}
        accentClass="bg-orange-50 text-orange-600"
      />
    </div>
  );
}
