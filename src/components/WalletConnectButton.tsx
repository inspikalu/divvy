'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Wallet,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import { getExplorerAddressUrl, shortenAddress } from '@/lib/constants';

interface WalletConnectButtonProps {
  className?: string;
}

interface KnownWallet {
  name: string;
  icon: string;
  url: string;
  detect: () => boolean;
}

const POPULAR_WALLETS: KnownWallet[] = [
  {
    name: 'Phantom',
    icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/phantom/src/icon.png',
    url: 'https://phantom.app/',
    detect: () =>
      typeof window !== 'undefined' &&
      Boolean(
        (window as any).phantom?.solana?.isPhantom ||
        (window as any).solana?.isPhantom
      ),
  },
  {
    name: 'Solflare',
    icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/solflare/src/icon.svg',
    url: 'https://solflare.com/',
    detect: () =>
      typeof window !== 'undefined' &&
      Boolean((window as any).solflare?.isSolflare),
  },
  {
    name: 'Backpack',
    icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/backpack/src/icon.svg',
    url: 'https://backpack.app/',
    detect: () =>
      typeof window !== 'undefined' &&
      Boolean((window as any).backpack?.isBackpack),
  },
];

export function WalletConnectButton({ className = '' }: WalletConnectButtonProps) {
  const {
    wallets,
    select,
    disconnect,
    publicKey,
    wallet,
    connecting,
    connected,
  } = useWallet();

  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  // Handle address copy
  const handleCopy = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Direct select and connect
  const handleSelectWallet = async (walletName: string) => {
    try {
      setModalOpen(false);

      // Check if wallet is registered in adapter
      const target = wallets.find(
        w => w.adapter.name.toLowerCase() === walletName.toLowerCase()
      );

      if (target) {
        select(target.adapter.name as any);
        if (target.readyState === 'Installed' || target.readyState === 'Loadable') {
          try {
            await target.adapter.connect();
          } catch (err: any) {
            console.error('Wallet connection rejected:', err);
          }
          return;
        }
      }

      // Check known wallets for browser extension injection
      const known = POPULAR_WALLETS.find(
        k => k.name.toLowerCase() === walletName.toLowerCase()
      );

      if (known) {
        const isInstalled = known.detect();
        if (isInstalled) {
          // If installed in window, select adapter name or prompt
          select(known.name as any);
          if (target) {
            await target.adapter.connect();
          }
        } else {
          window.open(known.url, '_blank');
        }
      }
    } catch (err) {
      console.error('Failed to select wallet:', err);
    }
  };

  if (!mounted) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm opacity-80 ${className}`}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>
    );
  }

  // Connected state
  if (connected && publicKey) {
    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(prev => !prev)}
          className={`flex items-center gap-2 rounded-xl border border-surface-border bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${className}`}
        >
          {wallet?.adapter.icon ? (
            <img
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              className="h-4 w-4 rounded-full"
            />
          ) : (
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <span className="font-mono text-xs">{shortenAddress(publicKey, 4)}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl border border-surface-border bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-surface-border mb-1">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                {wallet?.adapter.name || 'Solana Wallet'}
              </div>
              <div className="text-xs font-mono text-slate-800 truncate mt-0.5">
                {publicKey.toBase58()}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy Address</span>
                </>
              )}
            </button>

            <a
              href={getExplorerAddressUrl(publicKey)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              <span>View in Explorer</span>
            </a>

            <div className="my-1 border-t border-surface-border" />

            <button
              onClick={async () => {
                setDropdownOpen(false);
                await disconnect();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-3.5 w-3.5 text-red-500" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Connecting state
  if (connecting) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm opacity-90 ${className}`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting…
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 active:scale-[0.98] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${className}`}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>

      {/* Modern Wallet Selection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl border border-surface-border bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-surface-border">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 border border-brand-200">
                  <Wallet className="h-4 w-4 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Select Solana Wallet</h3>
                  <p className="text-[11px] text-slate-500">Choose your preferred wallet</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                Popular Solana Wallets
              </div>

              {POPULAR_WALLETS.map(w => {
                const isDetected = w.detect() || wallets.some(
                  item => item.adapter.name.toLowerCase() === w.name.toLowerCase() &&
                  (item.readyState === 'Installed' || item.readyState === 'Loadable')
                );

                return (
                  <button
                    key={w.name}
                    onClick={() => handleSelectWallet(w.name)}
                    className="flex w-full items-center justify-between rounded-xl border border-surface-border bg-surface-accent/40 p-3 hover:bg-brand-50 hover:border-brand-200 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={w.icon}
                        alt={w.name}
                        className="h-6 w-6 rounded-lg object-contain"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-brand-700">
                        {w.name}
                      </span>
                    </div>

                    {isDetected ? (
                      <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Detected
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-600 flex items-center gap-0.5">
                        Get <ExternalLink className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Any additional Wallet Standard wallets discovered dynamically */}
              {wallets
                .filter(
                  w =>
                    !POPULAR_WALLETS.some(
                      p => p.name.toLowerCase() === w.adapter.name.toLowerCase()
                    )
                )
                .map(w => (
                  <button
                    key={w.adapter.name}
                    onClick={() => handleSelectWallet(w.adapter.name)}
                    className="flex w-full items-center justify-between rounded-xl border border-surface-border bg-white p-3 hover:bg-brand-50 hover:border-brand-200 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      {w.adapter.icon && (
                        <img
                          src={w.adapter.icon}
                          alt={w.adapter.name}
                          className="h-6 w-6 rounded-lg"
                        />
                      )}
                      <span className="text-xs font-semibold text-slate-900 group-hover:text-brand-700">
                        {w.adapter.name}
                      </span>
                    </div>
                    <span className="rounded-md bg-white border border-surface-border px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                      Standard
                    </span>
                  </button>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-[11px] text-slate-400">
              <span>Solana Devnet</span>
              <span className="flex items-center gap-1 text-brand-600 font-medium">
                <Sparkles className="h-3 w-3" /> Wallet Standard
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
