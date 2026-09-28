import type { Metadata } from 'next';
import './globals.css';
import { WalletContextProvider } from '@/components/WalletContextProvider';
import { AppShell } from '@/components/AppShell';
import { Toaster } from 'sonner';

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
          {children}
          <Toaster
            position="bottom-right"
            closeButton
            toastOptions={{
              duration: 6000,
              classNames: {
                toast:
                  'rounded-xl border border-surface-border bg-white p-4 shadow-card text-slate-800 font-sans',
                title: 'font-semibold text-sm text-slate-900',
                description: 'text-xs text-slate-500 mt-1',
                actionButton:
                  'bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors',
                cancelButton:
                  'bg-surface-accent hover:bg-brand-50 text-slate-600 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors',
                success:
                  '!bg-white !border-emerald-200 !text-slate-800 [&_[data-icon]]:!text-emerald-500',
                error:
                  '!bg-white !border-rose-200 !text-slate-800 [&_[data-icon]]:!text-rose-500',
                info:
                  '!bg-white !border-brand-200 !text-slate-800 [&_[data-icon]]:!text-brand-600',
                loading:
                  '!bg-white !border-brand-200 !text-slate-800 [&_[data-icon]]:!text-brand-600',
              },
            }}
          />
        </WalletContextProvider>
      </body>
    </html>
  );
}
