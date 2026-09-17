use anchor_lang::prelude::*;

pub mod math;
pub mod state;

declare_id!("235zHTTdjPraGrpvLaULGZN3nnVrDvzqw31zHyw3PXG5");

#[program]
pub mod divvy {
    use super::*;

    pub fn ping(_ctx: Context<Ping>) -> Result<()> {
        msg!("Divvy program active!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Ping {}
