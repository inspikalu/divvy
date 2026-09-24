import type { Metadata } from 'next';
import './globals.css';
import { WalletContextProvider } from '@/components/WalletContextProvider';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Divvy : Hold the Meme, Earn the Stock',
  description:
    'Automated on-chain dividend routing layer for Meteora Dynamic Bonding Curves on Solana.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-bg text-slate-800 min-h-screen antialiased selection:bg-brand-200 selection:text-brand-900">
        <WalletContextProvider>
          <AppShell>{children}</AppShell>
        </WalletContextProvider>
      </body>
    </html>
  );
}
