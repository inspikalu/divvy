use anchor_lang::prelude::*;

pub const BPS_DENOMINATOR: u64 = 10_000;
pub const INDEX_SCALE: u128 = 1_000_000_000_000; // 10^12 precision

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

/// Calculates claimable dividend payout using the Cumulative Dividend Index:
/// (holder_balance * (global_index - last_claimed_index)) / 10^12
pub fn calculate_index_claim_amount(
    holder_balance: u64,
    global_index: u128,
    last_claimed_index: u128,
) -> Result<u64> {
    if global_index <= last_claimed_index || holder_balance == 0 {
        return Ok(0);
    }
    let index_diff = global_index
        .checked_sub(last_claimed_index)
        .ok_or(MathError::MathOverflow)?;

    let claim_amount = (holder_balance as u128)
        .checked_mul(index_diff)
        .ok_or(MathError::MathOverflow)?
        .checked_div(INDEX_SCALE)
        .ok_or(MathError::MathOverflow)?;

    Ok(claim_amount as u64)
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

    #[test]
    fn test_calculate_pro_rata_real_holder_distribution() {
        let vault_balance = 1_198_087u64;
        let holder_a_balance = 22_740_573_927_088u64; // ~22.74M
        let holder_b_balance = 42_391_249_825_397u64; // ~42.39M
        let eligible_supply = holder_a_balance + holder_b_balance; // 65_131_823_752_485 (~65.13M)

        let share_a = calculate_pro_rata_share(vault_balance, holder_a_balance, eligible_supply).unwrap();
        let share_b = calculate_pro_rata_share(vault_balance, holder_b_balance, eligible_supply).unwrap();

        assert_eq!(share_a, 418_308);
        assert_eq!(share_b, 779_778);
        assert!(share_b > share_a);
        assert!(share_a + share_b <= vault_balance);
    }

    #[test]
    fn test_cumulative_index_multi_claim() {
        let eligible_supply = 100_000_000u64; // 100 tokens
        let holder_balance = 40_000_000u64;  // 40 tokens (40%)

        // Epoch 1: 1,000 dividend tokens routed
        let routed_1 = 1_000_000u64;
        let index_1 = (routed_1 as u128 * INDEX_SCALE) / (eligible_supply as u128);

        // Claim 1: holder claims 40% of 1,000 = 400
        let claim_1 = calculate_index_claim_amount(holder_balance, index_1, 0).unwrap();
        assert_eq!(claim_1, 400_000);

        // Holder claims again before any new fees: claim should be 0
        let claim_repeat = calculate_index_claim_amount(holder_balance, index_1, index_1).unwrap();
        assert_eq!(claim_repeat, 0);

        // Epoch 2: 2,500 more dividend tokens routed
        let routed_2 = 2_500_000u64;
        let index_2 = index_1 + ((routed_2 as u128 * INDEX_SCALE) / (eligible_supply as u128));

        // Claim 2: holder claims 40% of 2,500 = 1,000
        let claim_2 = calculate_index_claim_amount(holder_balance, index_2, index_1).unwrap();
        assert_eq!(claim_2, 1_000_000);
    }
}
