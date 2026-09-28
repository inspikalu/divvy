'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { toast } from 'sonner';
import {
  ExternalLink,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { ProtocolMetrics } from '@/hooks/useDivvyProtocol';
import {
  BASE_MINT,
  DIVIDEND_MINT,
  getExplorerTxUrl,
  shortenAddress,
} from '@/lib/constants';
import { getDivvyProgram } from '@/lib/anchor';

interface CreatorPanelProps {
  metrics: ProtocolMetrics;
}

export function CreatorPanel({ metrics }: CreatorPanelProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  // Form state for launching Divvy on a new token
  const [newBaseMint, setNewBaseMint] = useState('');
  const [newDividendMint, setNewDividendMint] = useState('');
  const [newFeeShareBps, setNewFeeShareBps] = useState<number>(6000); // 60%
  const [initLoading, setInitLoading] = useState(false);

  // Check if connected wallet is authority of the current active config
  const isAuthority =
    connected &&
    publicKey &&
    metrics.config &&
    publicKey.toBase58() === metrics.config.authority.toBase58();

  const handleInitConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !sendTransaction) {
      toast.error('Wallet not connected', {
        description: 'Please connect your Solana wallet first.',
      });
      return;
    }

    let baseMintPk: PublicKey;
    let dividendMintPk: PublicKey;

    try {
      baseMintPk = new PublicKey(newBaseMint.trim());
    } catch {
      toast.error('Invalid Base Mint', {
        description: 'Please enter a valid Solana public key for the base token.',
      });
      return;
    }

    try {
      dividendMintPk = new PublicKey(newDividendMint.trim());
    } catch {
      toast.error('Invalid Dividend Mint', {
        description: 'Please enter a valid Solana public key for the dividend token.',
      });
      return;
    }

    const toastId = toast.loading('Building initialization transaction…');
    try {
      setInitLoading(true);
      const program = getDivvyProgram(connection);

      const tx = await program.methods
        .initializeConfig(newFeeShareBps)
        .accounts({
          authority: publicKey,
          baseMint: baseMintPk,
          dividendMint: dividendMintPk,
          systemProgram: new PublicKey('11111111111111111111111111111111'),
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .transaction();

      toast.loading('Awaiting wallet approval…', { id: toastId });
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection, { skipPreflight: false });

      toast.loading('Confirming on Solana devnet…', { id: toastId });
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        'confirmed'
      );

      toast.success('Divvy Config Initialized!', {
        id: toastId,
        description: `Successfully enabled dividend routing on ${shortenAddress(baseMintPk, 4)}.`,
        action: {
          label: 'View Tx',
          onClick: () => window.open(getExplorerTxUrl(signature), '_blank'),
        },
      });

      setNewBaseMint('');
      setNewDividendMint('');
      await metrics.refresh();
    } catch (err: any) {
      console.error('initialize_config error:', err);
      toast.error('Initialization Failed', {
        id: toastId,
        description: err?.message || 'Transaction was rejected or failed.',
      });
    } finally {
      setInitLoading(false);
    }
  };

  const handleFillDemoValues = () => {
    setNewBaseMint(BASE_MINT.toBase58());
    setNewDividendMint(DIVIDEND_MINT.toBase58());
    setNewFeeShareBps(6000);
    toast.info('Loaded demo token pair', {
      description: 'Filled with $POPCAT and $xSTOCK addresses.',
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Creator Context Banner */}
      {isAuthority ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
          <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <div className="text-xs text-emerald-950 leading-relaxed">
            <span className="font-bold">Creator Wallet Recognized:</span> Your connected wallet{' '}
            <span className="font-mono font-bold text-emerald-800">{shortenAddress(publicKey, 4)}</span> is the
            registered authority for the active <span className="font-bold">${metrics.baseSymbol}</span> pool.
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Launch Divvy on Your Token
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                DBC = Dynamic Bonding Curve
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Route a percentage of your Meteora trading fees into a shared dividend vault for token holders.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFillDemoValues}
            className="flex-shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
          >
            Fill Demo Pair
          </button>
        </div>
      )}

      {/* Primary Action Card: Initialize Divvy Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <div className="pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Initialize Dividend Vault PDA
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Configure your Meteora Dynamic Bonding Curve base token and choose the dividend token distributed to holders.
          </p>
        </div>

        <form onSubmit={handleInitConfig} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="base-mint" className="block text-xs font-semibold text-slate-700">
                Meteora DBC Base Token Mint
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                SPL Mint Address
              </span>
            </div>
            <input
              id="base-mint"
              type="text"
              placeholder="e.g. 3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4"
              value={newBaseMint}
              onChange={(e) => setNewBaseMint(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 font-mono text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              required
            />
            <p className="text-[11px] text-slate-400">
              The address of your meme token traded on Meteora Dynamic Bonding Curve.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dividend-mint" className="block text-xs font-semibold text-slate-700">
              Dividend Asset Mint (e.g. xSTOCK, USDC, or Tokenized Equities)
            </label>
            <input
              id="dividend-mint"
              type="text"
              placeholder="e.g. A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM"
              value={newDividendMint}
              onChange={(e) => setNewDividendMint(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 font-mono text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              required
            />
            <p className="text-[11px] text-slate-400">
              The quote asset your holders will accumulate and claim from trading fees.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label htmlFor="fee-share" className="block text-xs font-semibold text-slate-700">
                Holder Fee Share
              </label>
              <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
                {(newFeeShareBps / 100).toFixed(2)}% ({newFeeShareBps} BPS)
              </span>
            </div>
            <input
              id="fee-share"
              type="range"
              min={500}
              max={10000}
              step={100}
              value={newFeeShareBps}
              onChange={(e) => setNewFeeShareBps(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>5% (Min)</span>
              <span className="font-semibold text-slate-600">60% (Recommended)</span>
              <span>100% (Full Community)</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={initLoading || !connected}
              className="w-full rounded-lg bg-brand-600 py-3 text-xs font-bold text-white shadow-sm transition-all hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              {initLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Initializing Smart Contract…</span>
                </>
              ) : !connected ? (
                'Connect Wallet to Enable Divvy'
              ) : (
                'Initialize Divvy on Token'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* How It Works for Creators : Unified hairline grid */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Fee Routing Mechanics
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs">
          <div className="p-4 space-y-1">
            <div className="font-mono font-bold text-slate-900">01. Trading Fees</div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Every swap on your Meteora Dynamic Bonding Curve accumulates creator fees in quote asset.
            </p>
          </div>
          <div className="p-4 space-y-1">
            <div className="font-mono font-bold text-slate-900">02. Route to Vault</div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Creator claims fees and deposits the configured share into the program-owned Dividend Vault.
            </p>
          </div>
          <div className="p-4 space-y-1">
            <div className="font-mono font-bold text-slate-900">03. Holders Claim</div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Holders connect their wallet to the Claim Portal and withdraw their pro-rata share anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
