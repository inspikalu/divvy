'use client';

import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import {
  HandCoins,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Wallet,
  TrendingUp,
  Ban,
  Sparkles,
} from 'lucide-react';
import { HolderAccountState } from '@/hooks/useHolderAccount';
import { UseHolderClaimReturn } from '@/hooks/useHolderClaim';
import {
  getExplorerAddressUrl,
  getExplorerTxUrl,
  shortenAddress,
} from '@/lib/constants';

interface HolderClaimCardProps {
  holderState: HolderAccountState;
  claimActions: UseHolderClaimReturn;
}

export function HolderClaimCard({ holderState, claimActions }: HolderClaimCardProps) {
  const { connected } = useWallet();

  // State 1: Disconnected
  if (!connected || !holderState.walletAddress) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-accent p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[260px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-surface-border">
          <Wallet className="h-6 w-6 text-slate-400" />
        </div>
        <div>
          <div className="text-lg font-semibold text-slate-900">Connect Your Wallet</div>
          <div className="mt-1 text-sm text-slate-500">Connect to check your dividend eligibility and continuous yield.</div>
        </div>
        <WalletConnectButton />
      </div>
    );
  }

  // Loading
  if (holderState.loading) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-accent p-8 flex flex-col items-center justify-center gap-4 min-h-[260px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        <div className="text-sm text-slate-500">Loading your on-chain dividend state…</div>
      </div>
    );
  }

  // State 4: Ineligible (connected but holds 0 base tokens)
  if (!holderState.isClaimed && holderState.baseTokenBalanceAtomic === BigInt(0)) {
    return (
      <div className="rounded-2xl border border-surface-border bg-surface-accent p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Ban className="h-5 w-5 text-slate-500" />
          <h2 className="text-base font-semibold text-slate-900">Dividend Eligibility</h2>
        </div>
        <div className="rounded-xl border border-surface-border bg-white p-5 text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
          <div className="text-slate-700 font-medium">No Base Token Balance</div>
          <div className="text-sm text-slate-500">
            Your wallet ({shortenAddress(holderState.walletAddress, 4)}) does not hold the Base Meme Token.
            Dividends are distributed pro-rata to holders of{' '}
            <a
              href={getExplorerAddressUrl('3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              3pX9emk…
            </a>
          </div>
        </div>
        <WalletAccount state={holderState} />
      </div>
    );
  }

  // State 3: Claimed and no new dividends accrued yet
  if (holderState.isClaimed && holderState.claimRecord && !holderState.canClaim) {
    const claimedDate = new Date(holderState.claimRecord.claimedAt * 1000).toLocaleString();
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-brand-600" />
            <h2 className="text-base font-semibold text-slate-900">Dividends Claimed</h2>
          </div>
          <span className="rounded-full bg-white border border-brand-200 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
            ✓ UP TO DATE
          </span>
        </div>

        <div className="rounded-xl border border-brand-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Total Claimed to Date</span>
            <span className="text-xl font-bold text-brand-700">
              {(Number(holderState.claimRecord.claimedAmount) / 1e6).toLocaleString('en-US', { minimumFractionDigits: 6 })} xSTOCK
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Last Claim Time</span>
            <span className="text-sm text-slate-700">{claimedDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Claim Model</span>
            <span className="flex items-center gap-1 text-xs text-brand-700 font-medium">
              <Sparkles className="h-3 w-3" /> Continuous Cumulative Yield
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">ClaimRecord PDA</span>
            <a
              href={getExplorerAddressUrl(holderState.claimRecord.holder)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 transition-colors"
            >
              View on Explorer <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-surface-border bg-white p-3 text-center text-xs text-slate-500">
          All accrued dividends claimed. When new trading fees are routed into the vault, your new share will appear here to claim again.
        </div>

        <WalletAccount state={holderState} />
      </div>
    );
  }

  // State 2: Eligible to claim (first-time or subsequent yield accrual)
  const handleClaim = async () => {
    await claimActions.claimDividends(() => {
      holderState.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-accent p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HandCoins className="h-5 w-5 text-brand-600" />
          <h2 className="text-base font-semibold text-slate-900">
            {holderState.claimRecord ? 'Claim Accrued Yield' : 'Claim Your Dividends'}
          </h2>
        </div>
        {holderState.claimRecord && (
          <span className="rounded-full bg-brand-100 border border-brand-300 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
            New Yield Available
          </span>
        )}
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Your Base Token Balance</span>
          <span className="text-sm font-semibold text-slate-900">
            {holderState.baseTokenBalanceFormatted}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Your Share of Circulating Supply</span>
          <span className="text-sm font-semibold text-brand-600">
            {holderState.holdingPercentage.toFixed(4)}%
          </span>
        </div>
        {holderState.claimRecord && (
          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-surface-border pt-2">
            <span>Previously Claimed</span>
            <span>
              {(Number(holderState.claimRecord.claimedAmount) / 1e6).toFixed(4)} xSTOCK
            </span>
          </div>
        )}
        <div className="border-t border-surface-border pt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700">Claimable Now</span>
          <span className="text-2xl font-bold text-brand-600">
            {holderState.claimableDividendFormatted} xSTOCK
          </span>
        </div>
      </div>

      {claimActions.claimError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-red-700">{claimActions.claimError}</span>
        </div>
      )}

      {claimActions.claimSuccessTx && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-brand-600" />
            <span className="text-xs text-brand-700">Claim confirmed!</span>
          </div>
          <a
            href={getExplorerTxUrl(claimActions.claimSuccessTx)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
          >
            View Tx <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>
      )}

      <button
        onClick={handleClaim}
        disabled={claimActions.claiming || holderState.claimableDividendAtomic === BigInt(0)}
        className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
      >
        {claimActions.claiming ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending Transaction…
          </>
        ) : (
          <>
            <TrendingUp className="h-4 w-4" />
            Claim {holderState.claimableDividendFormatted} xSTOCK
          </>
        )}
      </button>

      <WalletAccount state={holderState} />
    </div>
  );
}

function WalletAccount({ state }: { state: HolderAccountState }) {
  if (!state.walletAddress) return null;
  return (
    <div className="rounded-xl border border-surface-border bg-white p-3 space-y-1.5">
      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Connected Wallet</div>
      <a
        href={getExplorerAddressUrl(state.walletAddress)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-brand-600 transition-colors"
      >
        {shortenAddress(state.walletAddress, 8)} <ExternalLink className="h-2.5 w-2.5" />
      </a>
      <div className="flex gap-4 text-xs text-slate-500">
        <span>SOL: <span className="text-slate-700">{state.solBalance.toFixed(4)}</span></span>
        <span>xSTOCK: <span className="text-slate-700">{state.dividendTokenBalanceFormatted}</span></span>
      </div>
    </div>
  );
}
