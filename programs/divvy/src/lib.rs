use anchor_lang::prelude::*;

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
