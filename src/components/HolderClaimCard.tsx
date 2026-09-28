'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Ban,
  Sparkles,
} from 'lucide-react';
import { HolderAccountState } from '@/hooks/useHolderAccount';
import { UseHolderClaimReturn } from '@/hooks/useHolderClaim';
import {
  getExplorerAddressUrl,
  shortenAddress,
} from '@/lib/constants';

interface HolderClaimCardProps {
  holderState: HolderAccountState;
  claimActions: UseHolderClaimReturn;
  baseSymbol?: string;
  dividendSymbol?: string;
}

export function HolderClaimCard({
  holderState,
  claimActions,
  baseSymbol = 'TOKEN',
  dividendSymbol = 'DIV',
}: HolderClaimCardProps) {
  const { connected } = useWallet();

  // State 1: Disconnected
  if (!connected || !holderState.walletAddress) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
        <div className="space-y-1.5 max-w-md">
          <div className="text-base font-bold text-slate-900">Connect Wallet to Claim</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Holders of ${baseSymbol} receive continuous pro-rata distributions in ${dividendSymbol} from DBC trading fees. Connect your Solana wallet to verify your position.
          </p>
        </div>
        <WalletConnectButton />
      </div>
    );
  }

  // State 2: Loading
  if (holderState.loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center gap-3 min-h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        <div className="text-xs font-mono text-slate-500">Querying on-chain account balances…</div>
      </div>
    );
  }

  // State 3: Ineligible (holds 0 base tokens)
  if (!holderState.isClaimed && holderState.baseTokenBalanceAtomic === BigInt(0)) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900">Dividend Allocation</h2>
          </div>
          <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
            Ineligible
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-1.5">
          <div className="text-xs font-bold text-slate-800">No Base Token Balance Detected</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Wallet <span className="font-mono font-semibold text-slate-700">{shortenAddress(holderState.walletAddress, 4)}</span> does not hold ${baseSymbol}. Dividends are distributed pro-rata to holders of the base meme token.
          </p>
        </div>

        <WalletAccount state={holderState} dividendSymbol={dividendSymbol} />
      </div>
    );
  }

  // State 4: Already claimed up to date
  if (holderState.isClaimed && holderState.claimRecord && !holderState.canClaim) {
    const claimedDate = new Date(holderState.claimRecord.claimedAt * 1000).toLocaleString();
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Claim Status</h2>
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
            Settled Up to Date
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Total Claimed to Date
            </span>
            <span className="font-mono text-xl font-bold text-slate-900 tabular-nums block">
              {(Number(holderState.claimRecord.claimedAmount) / 1e6).toLocaleString('en-US', { minimumFractionDigits: 6 })}
            </span>
            <span className="text-[11px] font-mono text-slate-400 block">${dividendSymbol}</span>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Last Settlement Time
            </span>
            <span className="text-xs font-mono text-slate-800 font-semibold block pt-1">
              {claimedDate}
            </span>
            <span className="text-[11px] text-slate-400 block">Solana Devnet Block Time</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-500 flex items-center justify-between">
          <span>All current dividends claimed. New fees will accumulate automatically.</span>
          <a
            href={getExplorerAddressUrl(holderState.claimRecord.holder)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-brand-600 hover:underline flex-shrink-0 ml-2"
          >
            Claim PDA <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        <WalletAccount state={holderState} dividendSymbol={dividendSymbol} />
      </div>
    );
  }

  // State 5: Active Claim Available
  const handleClaim = async () => {
    await claimActions.claimDividends(() => {
      holderState.refresh();
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {holderState.claimRecord ? 'Accrued Yield Settlement' : 'Dividend Claim'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pro-rata quote asset distribution from Meteora DBC trading fees.
          </p>
        </div>
        {holderState.claimRecord && (
          <span className="text-[10px] font-mono font-bold bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded">
            New Yield Ready
          </span>
        )}
      </div>

      {/* Main Claimable Highlight Panel */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Claimable Now
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono text-3xl font-bold text-slate-900 tracking-tight tabular-nums">
              {holderState.claimableDividendFormatted}
            </span>
            <span className="text-sm font-semibold text-slate-600 font-mono">
              ${dividendSymbol}
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono mt-1 block">
            Holding {holderState.baseTokenBalanceFormatted} ${baseSymbol} ({holderState.holdingPercentage.toFixed(3)}% pool share)
          </span>
        </div>

        <div className="sm:text-right flex-shrink-0">
          <button
            onClick={handleClaim}
            disabled={claimActions.claiming || holderState.claimableDividendAtomic === BigInt(0)}
            className="w-full sm:w-auto rounded-lg bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {claimActions.claiming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Claiming…</span>
              </>
            ) : (
              <span>Claim {holderState.claimableDividendFormatted} ${dividendSymbol}</span>
            )}
          </button>
        </div>
      </div>

      {/* Wallet details */}
      <WalletAccount state={holderState} dividendSymbol={dividendSymbol} />
    </div>
  );
}

function WalletAccount({ state, dividendSymbol = 'DIV' }: { state: HolderAccountState; dividendSymbol?: string }) {
  if (!state.walletAddress) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">Wallet:</span>
        <a
          href={getExplorerAddressUrl(state.walletAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-slate-700 hover:text-brand-600 inline-flex items-center gap-1 font-semibold"
        >
          {shortenAddress(state.walletAddress, 6)} <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
      <div className="flex items-center gap-4 text-slate-500 font-mono">
        <span>SOL: <strong className="text-slate-700">{state.solBalance.toFixed(3)}</strong></span>
        <span>${dividendSymbol}: <strong className="text-slate-700">{state.dividendTokenBalanceFormatted}</strong></span>
      </div>
    </div>
  );
}
