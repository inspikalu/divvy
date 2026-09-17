use anchor_lang::prelude::*;

pub mod instructions;
pub mod math;
pub mod state;

use instructions::*;

declare_id!("235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5");

#[program]
pub mod divvy {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        fee_share_bps: u16,
    ) -> Result<()> {
        handle_initialize_config(ctx, fee_share_bps)
    }
}
