use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::math::{calculate_vault_fee_share, MathError, INDEX_SCALE};
use crate::state::DivvyConfig;

#[derive(Accounts)]
pub struct RouteFees<'info> {
    /// The creator / protocol authority — must match config.authority
    #[account(mut)]
    pub authority: Signer<'info>,

    /// DivvyConfig PDA — validates authority and holds fee_share_bps
    #[account(
        mut,
        seeds = [DivvyConfig::SEED_PREFIX, config.base_mint.as_ref()],
        bump = config.bump,
        has_one = authority
    )]
    pub config: Account<'info, DivvyConfig>,

    /// Creator's dividend-mint token account — source of the fee transfer
    #[account(
        mut,
        token::mint = dividend_mint,
        token::authority = authority
    )]
    pub creator_token_account: Account<'info, TokenAccount>,

    /// DividendVault PDA token account — destination of the fee transfer
    #[account(
        mut,
        seeds = [DivvyConfig::VAULT_SEED_PREFIX, config.base_mint.as_ref()],
        bump,
        token::mint = dividend_mint,
        token::authority = vault_authority
    )]
    pub dividend_vault: Account<'info, TokenAccount>,

    /// CHECK: PDA that acts as the token authority for dividend_vault
    #[account(
        seeds = [b"vault_authority", config.base_mint.as_ref()],
        bump = config.vault_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    /// The dividend-asset mint
    pub dividend_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

pub fn handle_route_fees(
    ctx: Context<RouteFees>,
    amount_in: u64,
    eligible_supply: u64,
) -> Result<()> {
    let fee_share_bps = ctx.accounts.config.fee_share_bps;

    let vault_share = calculate_vault_fee_share(amount_in, fee_share_bps)
        .map_err(|_| MathError::MathOverflow)?;

    require!(vault_share > 0, MathError::MathOverflow);

    // CPI: transfer vault_share from creator_token_account → dividend_vault
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.creator_token_account.to_account_info(),
            to: ctx.accounts.dividend_vault.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        },
    );
    token::transfer(cpi_ctx, vault_share)?;

    // Update cumulative routed total and global cumulative dividend index
    let config = &mut ctx.accounts.config;
    config.total_routed_dividends = config
        .total_routed_dividends
        .checked_add(vault_share)
        .ok_or(MathError::MathOverflow)?;

    if eligible_supply > 0 {
        let added_index = (vault_share as u128)
            .checked_mul(INDEX_SCALE)
            .ok_or(MathError::MathOverflow)?
            .checked_div(eligible_supply as u128)
            .ok_or(MathError::MathOverflow)?;

        config.cumulative_dividend_per_token = config
            .cumulative_dividend_per_token
            .checked_add(added_index)
            .ok_or(MathError::MathOverflow)?;
    }

    // Deliberate permanent program log — visible on Solana Explorer during demo
    msg!(
        "route_fees: routed {} lamports to vault ({}bps of {}). New index: {}",
        vault_share,
        fee_share_bps,
        amount_in,
        config.cumulative_dividend_per_token
    );

    Ok(())
}
