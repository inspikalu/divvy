use anchor_lang::prelude::*;

pub const BPS_DENOMINATOR: u64 = 10_000;

#[error_code]
pub enum MathError {
    #[msg("Calculation overflow")]
    MathOverflow,
    #[msg("Fee share exceeds 100% (10,000 BPS)")]
    InvalidFeeShare,
}

/// Computes the portion of an accrued creator fee that belongs to the Dividend Vault.
/// (creator_fee_amount * fee_share_bps) / 10_000
pub fn calculate_vault_fee_share(creator_fee_amount: u64, fee_share_bps: u16) -> Result<u64> {
    if fee_share_bps > 10_000 {
        return err!(MathError::InvalidFeeShare);
    }
    let share = (creator_fee_amount as u128)
        .checked_mul(fee_share_bps as u128)
        .ok_or(MathError::MathOverflow)?
        .checked_div(BPS_DENOMINATOR as u128)
        .ok_or(MathError::MathOverflow)?;

    Ok(share as u64)
}

/// Calculates pro-rata holder share: (vault_balance * holder_balance) / eligible_supply
pub fn calculate_pro_rata_share(
    vault_balance: u64,
    holder_balance: u64,
    eligible_supply: u64,
) -> Result<u64> {
    if eligible_supply == 0 {
        return Ok(0);
    }
    let share = (vault_balance as u128)
        .checked_mul(holder_balance as u128)
        .ok_or(MathError::MathOverflow)?
        .checked_div(eligible_supply as u128)
        .ok_or(MathError::MathOverflow)?;

    Ok(share as u64)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_vault_fee_share_60_percent() {
        let creator_fee = 1_996_812; // ~1.99 quote tokens
        let fee_share_bps = 6_000;  // 60%
        let vault_share = calculate_vault_fee_share(creator_fee, fee_share_bps).unwrap();
        assert_eq!(vault_share, 1_198_087);
    }

    #[test]
    fn test_calculate_vault_fee_share_100_percent() {
        let creator_fee = 5_000_000;
        let fee_share_bps = 10_000; // 100%
        let vault_share = calculate_vault_fee_share(creator_fee, fee_share_bps).unwrap();
        assert_eq!(vault_share, 5_000_000);
    }

    #[test]
    fn test_calculate_vault_fee_share_0_percent() {
        let creator_fee = 5_000_000;
        let fee_share_bps = 0;
        let vault_share = calculate_vault_fee_share(creator_fee, fee_share_bps).unwrap();
        assert_eq!(vault_share, 0);
    }

    #[test]
    fn test_calculate_vault_fee_share_invalid_bps() {
        let creator_fee = 1_000_000;
        let fee_share_bps = 10_001;
        let res = calculate_vault_fee_share(creator_fee, fee_share_bps);
        assert!(res.is_err());
    }

    #[test]
    fn test_calculate_pro_rata_share() {
        let vault_balance = 10_000_000; // 10 quote tokens
        let eligible_supply = 1_000_000_000_000_000; // 1B tokens (6 dec)
        let holder_balance = 100_000_000_000_000; // 100M tokens (10% of supply)
        let share = calculate_pro_rata_share(vault_balance, holder_balance, eligible_supply).unwrap();
        assert_eq!(share, 1_000_000); // exactly 1 quote token (10%)
    }

    #[test]
    fn test_calculate_pro_rata_zero_supply() {
        let share = calculate_pro_rata_share(10_000_000, 100, 0).unwrap();
        assert_eq!(share, 0);
    }

    #[test]
    fn test_calculate_vault_fee_share_1_bps() {
        let creator_fee = 1_000_000;
        let fee_share_bps = 1; // 0.01%
        let vault_share = calculate_vault_fee_share(creator_fee, fee_share_bps).unwrap();
        assert_eq!(vault_share, 100);
    }

    #[test]
    fn test_calculate_vault_fee_share_floor_truncation() {
        let creator_fee = 10_005;
        let fee_share_bps = 1; // 10_005 * 1 / 10_000 = 1
        let vault_share = calculate_vault_fee_share(creator_fee, fee_share_bps).unwrap();
        assert_eq!(vault_share, 1);
    }

    #[test]
    fn test_calculate_vault_fee_share_large_numbers() {
        let creator_fee = 1_000_000_000_000_000_000u64; // 1e18
        let fee_share_bps = 6_000;
        let vault_share = calculate_vault_fee_share(creator_fee, fee_share_bps).unwrap();
        assert_eq!(vault_share, 600_000_000_000_000_000u64);
    }

    #[test]
    fn test_calculate_vault_fee_share_zero_amount() {
        let creator_fee = 0;
        let fee_share_bps = 6_000;
        let vault_share = calculate_vault_fee_share(creator_fee, fee_share_bps).unwrap();
        assert_eq!(vault_share, 0);
    }
}
