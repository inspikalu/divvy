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

    pub fn route_fees(ctx: Context<RouteFees>, amount_in: u64) -> Result<()> {
        handle_route_fees(ctx, amount_in)
    }

    pub fn claim(ctx: Context<Claim>, eligible_supply: u64) -> Result<()> {
        handle_claim(ctx, eligible_supply)
    }
}
