'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { toast } from 'sonner';
import {
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { ProtocolMetrics } from '@/hooks/useDivvyProtocol';
import {
  BASE_MINT,
  DIVIDEND_MINT,
  getExplorerTxUrl,
  shortenAddress,
} from '@/lib/constants';
import {
  getDivvyProgram,
  getConfigPda,
  getVaultPda,
  getVaultAuthorityPda,
  getTokenMetadata,
} from '@/lib/anchor';

interface CreatorPanelProps {
  metrics: ProtocolMetrics;
}

/** Parse Solana, Anchor, or RPC error into a clear actionable message */
function parseInitError(err: any): string {
  const msg: string = err?.message ?? '';
  const logs: string[] = err?.logs ?? err?.transactionMessage?.logs ?? [];
  const combined = (msg + ' ' + logs.join(' ')).toLowerCase();

  if (combined.includes('user rejected') || combined.includes('rejected the request') || combined.includes('user cancelled')) {
    return 'Transaction was cancelled in your wallet.';
  }
  if (combined.includes('already in use') || combined.includes('custom program error: 0x0') || combined.includes('0x0')) {
    return 'This token pair has already been initialized on Divvy. You can view its pool in the Pool Directory.';
  }
  if (combined.includes('accountnotinitialized') || combined.includes('accountdidnotdeserialize') || combined.includes('3012')) {
    return 'One of the provided token mint addresses does not exist on Solana Devnet or is not an SPL Mint.';
  }
  if (combined.includes('insufficient funds') || combined.includes('insufficient lamports') || combined.includes('0x1')) {
    return 'Your wallet has insufficient Devnet SOL to pay for transaction fees and rent exemption.';
  }
  if (combined.includes('invalidfeeshare') || combined.includes('6001')) {
    return 'Fee share must be between 0.01% and 100% (1 - 10,000 BPS).';
  }
  if (combined.includes('blockhash') || combined.includes('block height exceeded')) {
    return 'Transaction expired. Please try again.';
  }
  if (combined.includes('timeout')) {
    return 'Network timeout communicating with Solana Devnet RPC. Please retry.';
  }

  // If logs contain a specific Program log failure:
  const failedLog = logs.find((l) => l.includes('Error:') || l.includes('failed:'));
  if (failedLog) {
    return failedLog.replace('Program log: ', '').trim();
  }

  return msg.length > 140 ? msg.slice(0, 137) + '...' : msg || 'Unexpected error occurred. Check browser console for full logs.';
}

export function CreatorPanel({ metrics }: CreatorPanelProps) {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();

  // Form state for launching Divvy on a new token
  const [newBaseMint, setNewBaseMint] = useState('');
  const [newDividendMint, setNewDividendMint] = useState('');
  const [newFeeShareBps, setNewFeeShareBps] = useState<number>(6000); // 60%
  const [initLoading, setInitLoading] = useState(false);

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
        description: 'Please enter a valid Solana public key for the base token mint.',
      });
      return;
    }

    try {
      dividendMintPk = new PublicKey(newDividendMint.trim());
    } catch {
      toast.error('Invalid Dividend Mint', {
        description: 'Please enter a valid Solana public key for the dividend token mint.',
      });
      return;
    }

    const toastId = toast.loading('Verifying token accounts on Devnet…');
    try {
      setInitLoading(true);

      // Preflight Check 1: Verify SOL Balance
      const balanceLamports = await connection.getBalance(publicKey, 'confirmed');
      if (balanceLamports < 5_000_000) { // < 0.005 SOL
        toast.error('Low SOL Balance', {
          id: toastId,
          description: 'You need at least ~0.005 Devnet SOL in your wallet to cover account rent and transaction fees.',
        });
        setInitLoading(false);
        return;
      }

      // Preflight Check 2: Derive PDAs
      const [configPda] = getConfigPda(baseMintPk);
      const [vaultPda] = getVaultPda(baseMintPk);
      const [vaultAuthorityPda] = getVaultAuthorityPda(baseMintPk);

      // Preflight Check 3: Verify if Config PDA already exists
      const existingConfig = await connection.getAccountInfo(configPda);
      if (existingConfig !== null) {
        toast.error('Pair Already Initialized', {
          id: toastId,
          description: `Divvy is already initialized for base token ${shortenAddress(baseMintPk, 4)}. You can view its pool in the Pool Directory.`,
        });
        setInitLoading(false);
        return;
      }

      // Preflight Check 4: Verify Base Mint exists on-chain
      const baseMintAccount = await connection.getAccountInfo(baseMintPk);
      if (!baseMintAccount) {
        toast.error('Base Mint Not Found', {
          id: toastId,
          description: `Base mint ${shortenAddress(baseMintPk, 4)} was not found on Solana Devnet. Please ensure it is a valid initialized SPL Mint.`,
        });
        setInitLoading(false);
        return;
      }

      // Preflight Check 5: Verify Dividend Mint exists on-chain
      const divMintAccount = await connection.getAccountInfo(dividendMintPk);
      if (!divMintAccount) {
        toast.error('Dividend Mint Not Found', {
          id: toastId,
          description: `Dividend mint ${shortenAddress(dividendMintPk, 4)} was not found on Solana Devnet. Please ensure it is a valid initialized SPL Mint.`,
        });
        setInitLoading(false);
        return;
      }

      toast.loading('Building initialization transaction…', { id: toastId });
      const program = getDivvyProgram(connection);

      const ix = await program.methods
        .initializeConfig(newFeeShareBps)
        .accounts({
          authority: publicKey,
          baseMint: baseMintPk,
          dividendMint: dividendMintPk,
          config: configPda,
          dividendVault: vaultPda,
          vaultAuthority: vaultAuthorityPda,
          systemProgram: new PublicKey('11111111111111111111111111111111'),
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .instruction();

      const tx = new Transaction().add(ix);

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
      await fetchMyPairs();
    } catch (err: any) {
      console.error('initialize_config error:', err);
      const friendlyMessage = parseInitError(err);
      toast.error('Initialization Failed', {
        id: toastId,
        description: friendlyMessage,
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
      description: 'Loaded $POPCAT and $xSTOCK. (Note: This showcase pair is already active on Devnet)',
    });
  };

  const [activeTab, setActiveTab] = useState<'create' | 'pairs'>('create');
  const [myPairs, setMyPairs] = useState<Array<{
    configPda: string;
    baseMint: string;
    dividendMint: string;
    baseSymbol: string;
    dividendSymbol: string;
    feeShareBps: number;
    totalRouted: string;
    vaultBalance: string;
    vaultPda: string;
  }>>([]);
  const [loadingPairs, setLoadingPairs] = useState(false);

  const fetchMyPairs = React.useCallback(async () => {
    if (!publicKey) {
      setMyPairs([]);
      return;
    }
    try {
      setLoadingPairs(true);
      const program = getDivvyProgram(connection);
      const configs = await (program.account as any).divvyConfig.all();
      
      const userConfigs = configs.filter(
        (c: any) => c.account.authority.toBase58() === publicKey.toBase58()
      );

      const pairs = await Promise.all(
        userConfigs.map(async (c: any) => {
          const baseMint: PublicKey = c.account.baseMint;
          const dividendMint: PublicKey = c.account.dividendMint;
          const [vaultPda] = getVaultPda(baseMint);

          let baseSymbol = 'TOKEN';
          let dividendSymbol = 'DIV';
          try {
            const bMeta = await getTokenMetadata(connection, baseMint);
            if (bMeta?.symbol) baseSymbol = bMeta.symbol;
            const dMeta = await getTokenMetadata(connection, dividendMint);
            if (dMeta?.symbol) dividendSymbol = dMeta.symbol;
          } catch {}

          let vaultBalance = '0.00';
          try {
            const bal = await connection.getTokenAccountBalance(vaultPda);
            if (bal?.value?.uiAmountString) vaultBalance = bal.value.uiAmountString;
          } catch {}

          const totalRoutedRaw = c.account.totalRoutedDividends ? c.account.totalRoutedDividends.toString() : '0';
          const totalRouted = (Number(totalRoutedRaw) / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2 });

          return {
            configPda: c.publicKey.toBase58(),
            baseMint: baseMint.toBase58(),
            dividendMint: dividendMint.toBase58(),
            baseSymbol,
            dividendSymbol,
            feeShareBps: c.account.feeShareBps,
            totalRouted,
            vaultBalance,
            vaultPda: vaultPda.toBase58(),
          };
        })
      );

      setMyPairs(pairs);
    } catch (err) {
      console.error('Failed to fetch creator pairs:', err);
    } finally {
      setLoadingPairs(false);
    }
  }, [connection, publicKey]);

  React.useEffect(() => {
    fetchMyPairs();
  }, [fetchMyPairs]);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'create'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span>Launch Token Vault</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pairs')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'pairs'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <span>Your Created Pairs</span>
          {connected && myPairs.length > 0 && (
            <span className="font-mono text-[10px] bg-brand-50 text-brand-700 border border-brand-200 px-1.5 py-0.2 rounded-full font-bold">
              {myPairs.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'create' ? (
        <>
          {/* Creator Context Guide Strip */}
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
        </>
      ) : (
        /* Tab 2: Your Created Pairs */
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Your Created Token Pairs</h2>
                {connected && (
                  <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {myPairs.length} Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Token pairs initialized and managed by your connected authority wallet.
              </p>
            </div>
            {connected && (
              <button
                type="button"
                onClick={fetchMyPairs}
                disabled={loadingPairs}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {loadingPairs ? 'Refreshing…' : 'Refresh'}
              </button>
            )}
          </div>

          {!connected ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Connect your creator wallet to view and manage your registered token pairs.
            </div>
          ) : loadingPairs && myPairs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
              <span>Loading your created pairs from Devnet…</span>
            </div>
          ) : myPairs.length === 0 ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-8 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-700">No token pairs created yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Switch to the &quot;Launch Token Vault&quot; tab to initialize a pair and start streaming Meteora trading fees into a dividend vault.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-500 transition-colors shadow-sm"
                >
                  Launch a Pair
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {myPairs.map((pair) => (
                <div
                  key={pair.configPda}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        ${pair.baseSymbol}
                      </span>
                      <span className="text-xs text-slate-400">/</span>
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        ${pair.dividendSymbol}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                        {(pair.feeShareBps / 100).toFixed(0)}% Fee Split
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <a
                        href={`/app/pool`}
                        className="font-mono text-[11px] font-medium text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        View Pool &rarr;
                      </a>
                      <a
                        href={getExplorerTxUrl(pair.configPda).replace('/tx/', '/address/')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        Config: {shortenAddress(pair.configPda, 4)} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs font-mono">
                    <div className="bg-white rounded p-2 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-sans block">Base Mint</span>
                      <span className="text-slate-800 font-bold">{shortenAddress(pair.baseMint, 4)}</span>
                    </div>
                    <div className="bg-white rounded p-2 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-sans block">Vault Balance</span>
                      <span className="text-slate-800 font-bold">{pair.vaultBalance} ${pair.dividendSymbol}</span>
                    </div>
                    <div className="bg-white rounded p-2 border border-slate-100 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 font-sans block">Total Routed</span>
                      <span className="text-brand-700 font-bold">{pair.totalRouted} ${pair.dividendSymbol}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

