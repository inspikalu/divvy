use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::math::{calculate_index_claim_amount, calculate_pro_rata_share, MathError};
use crate::state::{ClaimRecord, DivvyConfig};

#[error_code]
pub enum ClaimError {
    #[msg("Holder has zero base token balance")]
    NoEligibleBalance,
    #[msg("Calculated claim amount is zero or no new dividends accrued")]
    ZeroClaimAmount,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    /// The claiming token holder
    #[account(mut)]
    pub holder: Signer<'info>,

    /// DivvyConfig PDA
    #[account(
        mut,
        seeds = [DivvyConfig::SEED_PREFIX, config.base_mint.as_ref()],
        bump = config.bump
    )]
    pub config: Account<'info, DivvyConfig>,

    /// Holder's Base Meme Token account — proves eligibility and balance
    #[account(
        token::mint = config.base_mint,
        token::authority = holder
    )]
    pub holder_base_token_account: Account<'info, TokenAccount>,

    /// Holder's Dividend Quote Token account — receives dividend payout
    #[account(
        mut,
        token::mint = config.dividend_mint,
        token::authority = holder
    )]
    pub holder_dividend_token_account: Account<'info, TokenAccount>,

    /// DividendVault PDA token account — source of dividend payout
    #[account(
        mut,
        seeds = [DivvyConfig::VAULT_SEED_PREFIX, config.base_mint.as_ref()],
        bump,
        token::mint = config.dividend_mint,
        token::authority = vault_authority
    )]
    pub dividend_vault: Account<'info, TokenAccount>,

    /// CHECK: PDA that acts as the token authority for dividend_vault
    #[account(
        seeds = [b"vault_authority", config.base_mint.as_ref()],
        bump = config.vault_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    /// ClaimRecord PDA — initialized on first claim, updated on subsequent claims
    #[account(
        init_if_needed,
        payer = holder,
        space = 8 + ClaimRecord::INIT_SPACE,
        seeds = [ClaimRecord::SEED_PREFIX, config.base_mint.as_ref(), holder.key().as_ref()],
        bump
    )]
    pub claim_record: Account<'info, ClaimRecord>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handle_claim(ctx: Context<Claim>, eligible_supply: u64) -> Result<()> {
    let holder_balance = ctx.accounts.holder_base_token_account.amount;
    require!(holder_balance > 0, ClaimError::NoEligibleBalance);

    let global_index = ctx.accounts.config.cumulative_dividend_per_token;
    let last_index = ctx.accounts.claim_record.last_claimed_index;

    let claim_amount = if global_index > 0 {
        // Option B: Cumulative index claim calculation
        calculate_index_claim_amount(holder_balance, global_index, last_index)
            .map_err(|_| MathError::MathOverflow)?
    } else {
        // Fallback to vault pro-rata share
        let vault_balance = ctx.accounts.dividend_vault.amount;
        calculate_pro_rata_share(vault_balance, holder_balance, eligible_supply)
            .map_err(|_| MathError::MathOverflow)?
    };

    require!(claim_amount > 0, ClaimError::ZeroClaimAmount);

    let base_mint = ctx.accounts.config.base_mint;
    let vault_bump = ctx.accounts.config.vault_bump;
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"vault_authority",
        base_mint.as_ref(),
        &[vault_bump],
    ]];

    // CPI transfer of claim_amount from dividend_vault to holder_dividend_token_account
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.dividend_vault.to_account_info(),
            to: ctx.accounts.holder_dividend_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(cpi_ctx, claim_amount)?;

    // Update ClaimRecord PDA
    let claim_record = &mut ctx.accounts.claim_record;
    claim_record.holder = ctx.accounts.holder.key();
    claim_record.base_mint = base_mint;
    claim_record.claimed_amount = claim_record
        .claimed_amount
        .checked_add(claim_amount)
        .ok_or(MathError::MathOverflow)?;
    claim_record.claimed_at = Clock::get()?.unix_timestamp;
    claim_record.last_claimed_index = global_index;
    claim_record.bump = ctx.bumps.claim_record;

    // Increment config cumulative claimed total
    let config = &mut ctx.accounts.config;
    config.total_claimed_dividends = config
        .total_claimed_dividends
        .checked_add(claim_amount)
        .ok_or(MathError::MathOverflow)?;

    // Deliberate permanent program log — visible on Solana Explorer during demo
    msg!(
        "claim: holder {} claimed {} dividend units (total claimed to date: {}). Index updated: {} -> {}",
        ctx.accounts.holder.key(),
        claim_amount,
        claim_record.claimed_amount,
        last_index,
        global_index
    );

    Ok(())
}
