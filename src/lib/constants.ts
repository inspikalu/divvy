import { PublicKey } from '@solana/web3.js';

export const PUBLIC_DEVNET_RPC = 'https://api.devnet.solana.com';
export const HELIUS_DEVNET_RPC =
  process.env.NEXT_PUBLIC_RPC_URL ?? PUBLIC_DEVNET_RPC;

export const DIVVY_PROGRAM_ID = new PublicKey('235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5');
export const METEORA_DBC_PROGRAM_ID = new PublicKey('dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN');

export const DIVIDEND_MINT = new PublicKey('A3cQgqcyNvfQ48jWCFNtT5etur1Tk9tZHLgBSnKDGFWM');
export const BASE_MINT = new PublicKey('3pX9emk345wevCj8wYuDHPnhtEV5NKuFwSbUCCuQFgP4');
export const DBC_POOL_ADDRESS = new PublicKey('Erzp6EhMbcsMwNxkLg4USt7K2GJ22rYZfd4rmVoLzz6X');

export const DIVVY_CONFIG_PDA = new PublicKey('AhWYbZeiyisCxjrgz4yZRf7sPN8Wx5SxgnpaLVwrwBY4');
export const DIVIDEND_VAULT_PDA = new PublicKey('GjXC4iEAh7tqL7MqhY7cpF7Wvdfpa2LBMEL7anwty3Mw');
export const VAULT_AUTHORITY_PDA = new PublicKey('GhMLTG5273U2gj1gMC7tjYDPdkDfRY4nsTA8HWwEbyr8');

export const TRACKED_WALLETS = {
  deployer: 'BhuEDwTXtWBHZ3rMWAQuP3wqbiqJR39yo6T8LDoZ1A34',
  holderA: '6mnoXCKnXW9Pt99LYYUrSBUnyWbTGfMyn2ZDsXRwdQFm',
  holderB: 'DcG8Jv9ZszLDwhYsMKFAKeGv7BNfyaYybMGL34o6GM8r',
};

// Fixed demo eligible supply: 65,131,823.752485 base tokens (sum of Holder A and Holder B circulating tokens)
export const ELIGIBLE_SUPPLY_ATOMIC = BigInt(65131823752485);

export function getExplorerAddressUrl(address: string | PublicKey): string {
  const addrStr = typeof address === 'string' ? address : address.toBase58();
  return `https://explorer.solana.com/address/${addrStr}?cluster=devnet`;
}

export function getExplorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export function shortenAddress(address: string | PublicKey, chars = 4): string {
  const str = typeof address === 'string' ? address : address.toBase58();
  if (str.length <= chars * 2 + 2) return str;
  return `${str.slice(0, chars)}...${str.slice(-chars)}`;
}

export function formatTokenAmount(atomicUnits: number | bigint | string, decimals = 6): string {
  const num = typeof atomicUnits === 'bigint' ? Number(atomicUnits) : Number(atomicUnits);
  if (isNaN(num)) return '0.00';
  return (num / Math.pow(10, decimals)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/**
 * Formats numbers into compact K / M / B abbreviations (e.g. 65,131,823.75 -> "65.13M", 100,000 -> "100K")
 */
export function formatCompactNumber(amount: number | bigint | string, decimals = 2): string {
  const num = typeof amount === 'bigint' ? Number(amount) : Number(amount);
  if (isNaN(num)) return '0';
  const abs = Math.abs(num);

  if (abs >= 1_000_000_000) {
    return (num / 1_000_000_000).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }) + 'B';
  }
  if (abs >= 1_000_000) {
    return (num / 1_000_000).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }) + 'M';
  }
  if (abs >= 1_000) {
    return (num / 1_000).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }) + 'K';
  }

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
