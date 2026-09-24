'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  Settings,
  ExternalLink,
  Info,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ProtocolMetrics } from '@/hooks/useDivvyProtocol';
import {
  DIVVY_CONFIG_PDA,
  DIVIDEND_VAULT_PDA,
  VAULT_AUTHORITY_PDA,
  BASE_MINT,
  DIVIDEND_MINT,
  TRACKED_WALLETS,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  shortenAddress,
} from '@/lib/constants';
import { getDivvyProgram } from '@/lib/anchor';

interface CreatorPanelProps {
  metrics: ProtocolMetrics;
}

export function CreatorPanel({ metrics }: CreatorPanelProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [tab, setTab] = useState<'active' | 'new'>('active');

  // New config form state
  const [newBaseMint, setNewBaseMint] = useState('');
  const [newDividendMint, setNewDividendMint] = useState('');
  const [newFeeShareBps, setNewFeeShareBps] = useState(6000);
  const [initTx, setInitTx] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(false);

  const handleInitConfig = async () => {
    if (!publicKey || !sendTransaction) {
      setInitError('Connect your wallet first.');
      return;
    }
    try {
      setInitLoading(true);
      setInitError(null);
      setInitTx(null);

      const baseMintPk = new PublicKey(newBaseMint);
      const dividendMintPk = new PublicKey(newDividendMint);

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

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection, { skipPreflight: false });
      await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

      setInitTx(signature);
    } catch (err: any) {
      console.error('initialize_config error:', err);
      setInitError(err?.message || 'Transaction failed.');
    } finally {
      setInitLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-brand-600" />
          <h2 className="text-base font-semibold text-slate-900">Creator Configuration</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {(['active', 'new'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                tab === t ? 'bg-brand-600 text-white' : 'bg-surface-accent text-slate-500 hover:text-slate-900 border border-surface-border'
              }`}
            >
              {t === 'active' ? 'Active Config' : 'Enable New Token'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'active' && (
        <div className="space-y-4">
          {metrics.loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading config…
            </div>
          ) : metrics.config ? (
            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
              <ConfigRow label="Authority" value={TRACKED_WALLETS.deployer} isAddress />
              <ConfigRow label="Base Meme Mint" value={BASE_MINT.toBase58()} isAddress />
              <ConfigRow label="Dividend Mint (xSTOCK)" value={DIVIDEND_MINT.toBase58()} isAddress />
              <ConfigRow label="Fee Share" value={`${metrics.feeSharePercent.toFixed(2)}% (${metrics.config.feeShareBps} BPS)`} />
              <ConfigRow label="Total Routed" value={`${metrics.totalRoutedFormatted} xSTOCK`} />
              <ConfigRow label="Total Claimed" value={`${metrics.totalClaimedFormatted} xSTOCK`} />
              <ConfigRow label="DivvyConfig PDA" value={DIVVY_CONFIG_PDA.toBase58()} isAddress />
              <ConfigRow label="DividendVault PDA" value={DIVIDEND_VAULT_PDA.toBase58()} isAddress />
            </div>
          ) : (
            <div className="text-sm text-slate-500">No active Divvy config found on-chain.</div>
          )}

          {/* Fee Routing Flow — full-width step tile */}
          <div className="rounded-xl border border-surface-border bg-surface-accent p-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">Fee Routing Flow</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {['DBC Trading Activity', 'Fees Accrue on Pool', 'Creator Claims DBC Fees', `60% : DividendVault`, 'Holders Claim Pro-Rata'].map((step, i, arr) => (
                <React.Fragment key={step}>
                  <span className="rounded-lg border border-surface-border bg-white px-2.5 py-1.5 text-slate-700 font-medium">{step}</span>
                  {i < arr.length - 1 && <ArrowRight className="h-3 w-3 text-brand-400 flex-shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Route fees note — vertical info tile */}
          <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3">
            <Info className="h-4 w-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-sky-800">
              To route fees: (1) Claim creator fees from the Meteora DBC pool via the SDK, then (2) call{' '}
              <code className="font-mono bg-white border border-surface-border px-1 rounded">route_fees</code> with the amount to transfer the Divvy share into the vault.
            </p>
          </div>
        </div>
      )}

      {tab === 'new' && (          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Initialize Divvy on any Meteora DBC token by specifying its base mint, a dividend asset mint, and the fee share percentage.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-surface-border bg-surface-accent p-4">
              <label htmlFor="base-mint" className="block text-xs text-slate-600 mb-1">Base Meme Token Mint</label>
              <input
                id="base-mint"
                type="text"
                placeholder="PublicKey of the DBC base mint"
                value={newBaseMint}
                onChange={e => setNewBaseMint(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-accent p-4">
              <label htmlFor="dividend-mint" className="block text-xs text-slate-600 mb-1">Dividend Token Mint (xSTOCK equivalent)</label>
              <input
                id="dividend-mint"
                type="text"
                placeholder="PublicKey of the dividend SPL token mint"
                value={newDividendMint}
                onChange={e => setNewDividendMint(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <div className="rounded-xl border border-surface-border bg-surface-accent p-4">
              <label htmlFor="fee-share-bps" className="block text-xs text-slate-600 mb-1">Fee Share BPS (1–10000)</label>
              <input
                id="fee-share-bps"
                type="number"
                min={1}
                max={10000}
                value={newFeeShareBps}
                onChange={e => setNewFeeShareBps(Number(e.target.value))}
                className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              <div className="mt-0.5 text-xs text-slate-500">= {(newFeeShareBps / 100).toFixed(2)}% of creator fees : vault</div>
            </div>
          </div>

          {initError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-red-700">{initError}</span>
            </div>
          )}

          {initTx && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-brand-600" />
                <span className="text-xs text-brand-700">Config initialized!</span>
              </div>
              <a
                href={getExplorerTxUrl(initTx)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-brand-600 hover:underline"
              >
                View Tx <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}

          <button
            onClick={handleInitConfig}
            disabled={initLoading || !newBaseMint || !newDividendMint || !publicKey}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
          >
            {initLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Initializing…</>
            ) : (
              'Initialize Divvy Config'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function ConfigRow({ label, value, isAddress }: { label: string; value: string; isAddress?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-surface-border bg-surface-accent px-3 py-2">
      <span className="text-xs text-slate-500 flex-shrink-0">{label}</span>
      {isAddress ? (
        <a
          href={getExplorerAddressUrl(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-mono text-slate-600 hover:text-brand-600 transition-colors truncate"
        >
          {shortenAddress(value, 6)}
          <ExternalLink className="h-2.5 w-2.5 flex-shrink-0" />
        </a>
      ) : (
        <span className="text-xs font-semibold text-slate-900">{value}</span>
      )}
    </div>
  );
}
