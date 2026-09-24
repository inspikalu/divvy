'use client';

import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

const PUBLIC_DEVNET_RPC = 'https://api.devnet.solana.com';

interface Props {
  children: ReactNode;
}

export const WalletContextProvider: FC<Props> = ({ children }) => {
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_RPC_URL ?? PUBLIC_DEVNET_RPC;
  }, []);

  // Use pure Wallet Standard auto-discovery for all Solana wallets
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
