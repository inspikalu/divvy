use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct DivvyConfig {
    /// Authority allowed to update settings / manage protocol configuration
    pub authority: Pubkey,
    /// Base Meme Token Mint (DIV-MEME)
    pub base_mint: Pubkey,
    /// Dividend Quote Token Mint (xSTOCK)
    pub dividend_mint: Pubkey,
    /// Share of creator trading fees allocated to the dividend vault in BPS (e.g. 6000 = 60.00%)
    pub fee_share_bps: u16,
    /// Cumulative dividend tokens routed into the vault
    pub total_routed_dividends: u64,
    /// Cumulative dividend tokens claimed by holders
    pub total_claimed_dividends: u64,
    /// Bump seed for the DivvyConfig PDA
    pub bump: u8,
    /// Bump seed for the DividendVault PDA authority
    pub vault_bump: u8,
}

impl DivvyConfig {
    pub const SEED_PREFIX: &'static [u8] = b"config";
    pub const VAULT_SEED_PREFIX: &'static [u8] = b"vault";
}

#[account]
#[derive(InitSpace)]
pub struct ClaimRecord {
    /// The holder that claimed dividends
    pub holder: Pubkey,
    /// Base Meme Token Mint (DIV-MEME)
    pub base_mint: Pubkey,
    /// Amount of dividend quote tokens claimed
    pub claimed_amount: u64,
    /// Unix timestamp of when the claim occurred
    pub claimed_at: i64,
    /// Bump seed for the ClaimRecord PDA
    pub bump: u8,
}

impl ClaimRecord {
    pub const SEED_PREFIX: &'static [u8] = b"claim";
}

