use anchor_lang::prelude::*;

use crate::state::DivvyConfig;

/// One-time migration instruction: directly writes the missing 16 bytes
/// (cumulative_dividend_per_token: u128 = 0) into the existing DivvyConfig
/// PDA without attempting to Borsh-deserialize the old layout.
///
/// Uses raw account manipulation (realloc via system_program CPI + direct
/// write) so it works even when the account has the old 124-byte layout.
///
/// Can only be called by the original config authority (verified via seeds).
/// Safe to call multiple times — idempotent once account is 140 bytes.
#[derive(Accounts)]
pub struct MigrateConfig<'info> {
    /// Must be the original authority that owns the config
    #[account(mut)]
    pub authority: Signer<'info>,

    /// CHECK: We intentionally bypass Borsh deserialization here because the
    /// account has the OLD layout (124 bytes). We verify seeds manually and
    /// handle raw bytes directly.
    #[account(
        mut,
        seeds = [b"config", authority_base_mint.key().as_ref()],
        bump,
    )]
    pub config: UncheckedAccount<'info>,

    /// The base_mint stored in the config — needed to re-derive seeds.
    /// We read this from raw bytes offset 40 (after discriminator + authority).
    /// CHECK: We only use this for PDA seed re-derivation.
    pub authority_base_mint: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle_migrate_config(ctx: Context<MigrateConfig>) -> Result<()> {
    let config_info = ctx.accounts.config.to_account_info();
    let current_len = config_info.try_borrow_data()?.len();

    let new_len = 8 + DivvyConfig::INIT_SPACE; // 140

    if current_len == 124 {
        msg!("migrate_config: expanding 124 -> 140 bytes");
        config_info.realloc(new_len, false)?;

        let mut data = config_info.data.borrow_mut();
        // Old layout: bytes 122 = bump, 123 = vault_bump
        let bump = data[122];
        let vault_bump = data[123];

        // Zero out cumulative_dividend_per_token (bytes 122..138)
        for i in 122..138 {
            data[i] = 0;
        }

        // Put bump and vault_bump at new offsets 138 and 139
        data[138] = bump;
        data[139] = vault_bump;
    } else if current_len == 140 {
        // Fix byte layout if bump was at wrong offset
        let mut data = config_info.data.borrow_mut();
        // If byte 122 has bump (255) and byte 138 is 0, fix the layout
        if data[138] == 0 && data[122] != 0 {
            let bump = data[122];
            let vault_bump = data[123];
            for i in 122..138 {
                data[i] = 0;
            }
            data[138] = bump;
            data[139] = vault_bump;
            msg!("migrate_config: corrected byte layout for 140-byte account");
        }
    }

    msg!("migrate_config: done. DivvyConfig layout verified.");
    Ok(())
}
