use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::math::MathError;
use crate::state::DivvyConfig;

#[derive(Accounts)]
#[instruction(fee_share_bps: u16)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    /// The base meme token mint for which this dividend vault is created
    pub base_mint: Account<'info, Mint>,

    /// The dividend asset (SPL quote token standing in for tokenized equity)
    pub dividend_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        space = 8 + DivvyConfig::INIT_SPACE,
        seeds = [DivvyConfig::SEED_PREFIX, base_mint.key().as_ref()],
        bump
    )]
    pub config: Account<'info, DivvyConfig>,

    /// Token account holding the dividend assets, owned by vault_authority PDA
    #[account(
        init,
        payer = authority,
        token::mint = dividend_mint,
        token::authority = vault_authority,
        seeds = [DivvyConfig::VAULT_SEED_PREFIX, base_mint.key().as_ref()],
        bump
    )]
    pub dividend_vault: Account<'info, TokenAccount>,

    /// CHECK: PDA that acts as the token authority for the dividend_vault token account
    #[account(
        seeds = [b"vault_authority", base_mint.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handle_initialize_config(
    ctx: Context<InitializeConfig>,
    fee_share_bps: u16,
) -> Result<()> {
    require!(
        fee_share_bps > 0 && fee_share_bps <= 10_000,
        MathError::InvalidFeeShare
    );

    let config = &mut ctx.accounts.config;
    config.authority = ctx.accounts.authority.key();
    config.base_mint = ctx.accounts.base_mint.key();
    config.dividend_mint = ctx.accounts.dividend_mint.key();
    config.fee_share_bps = fee_share_bps;
    config.total_routed_dividends = 0;
    config.total_claimed_dividends = 0;
    config.cumulative_dividend_per_token = 0;
    config.bump = ctx.bumps.config;
    config.vault_bump = ctx.bumps.vault_authority;

    msg!("Divvy config initialized for base mint: {}", config.base_mint);
    msg!("Dividend mint: {}, Fee Share BPS: {}", config.dividend_mint, config.fee_share_bps);
    msg!("Dividend vault token account: {}", ctx.accounts.dividend_vault.key());

    Ok(())
}
