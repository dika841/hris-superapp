use rust_decimal::Decimal;
use rust_decimal_macros::dec;
use crate::domain::employee::entity::PTKPStatus;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TERCategory {
    A,
    B,
    C,
}

impl TERCategory {
    pub fn from_ptkp(ptkp: &PTKPStatus) -> Self {
        match ptkp {
            PTKPStatus::TK0 | PTKPStatus::TK1 | PTKPStatus::K0 => Self::A,
            PTKPStatus::TK2 | PTKPStatus::K1 | PTKPStatus::TK3 | PTKPStatus::K2 => Self::B,
            PTKPStatus::K3 => Self::C,
        }
    }
}

pub fn get_ter_rate(category: TERCategory, gross_salary: Decimal) -> Decimal {
    match category {
        TERCategory::A => get_ter_a_rate(gross_salary),
        TERCategory::B => get_ter_b_rate(gross_salary),
        TERCategory::C => get_ter_c_rate(gross_salary),
    }
}

// PMK 168/2023 TER A Monthly Rates
fn get_ter_a_rate(gross: Decimal) -> Decimal {
    if gross <= dec!(5400000) {
        dec!(0.0)
    } else if gross <= dec!(5650000) {
        dec!(0.0025)
    } else if gross <= dec!(5950000) {
        dec!(0.005)
    } else if gross <= dec!(6300000) {
        dec!(0.0075)
    } else if gross <= dec!(6750000) {
        dec!(0.01)
    } else if gross <= dec!(7500000) {
        dec!(0.0125)
    } else if gross <= dec!(8550000) {
        dec!(0.015)
    } else if gross <= dec!(9650000) {
        dec!(0.0175)
    } else if gross <= dec!(10050000) {
        dec!(0.02)
    } else if gross <= dec!(10350000) {
        dec!(0.0225)
    } else if gross <= dec!(10700000) {
        dec!(0.025)
    } else if gross <= dec!(11050000) {
        dec!(0.03)
    } else if gross <= dec!(11600000) {
        dec!(0.035)
    } else if gross <= dec!(12500000) {
        dec!(0.04)
    } else if gross <= dec!(13750000) {
        dec!(0.05)
    } else if gross <= dec!(15100000) {
        dec!(0.06)
    } else if gross <= dec!(16950000) {
        dec!(0.07)
    } else if gross <= dec!(19750000) {
        dec!(0.08)
    } else if gross <= dec!(24150000) {
        dec!(0.09)
    } else if gross <= dec!(26450000) {
        dec!(0.10)
    } else if gross <= dec!(28000000) {
        dec!(0.11)
    } else if gross <= dec!(30050000) {
        dec!(0.12)
    } else if gross <= dec!(32400000) {
        dec!(0.13)
    } else if gross <= dec!(35400000) {
        dec!(0.14)
    } else if gross <= dec!(39100000) {
        dec!(0.15)
    } else if gross <= dec!(43850000) {
        dec!(0.16)
    } else if gross <= dec!(47800000) {
        dec!(0.17)
    } else if gross <= dec!(51400000) {
        dec!(0.18)
    } else if gross <= dec!(56300000) {
        dec!(0.19)
    } else if gross <= dec!(62200000) {
        dec!(0.20)
    } else if gross <= dec!(68600000) {
        dec!(0.21)
    } else if gross <= dec!(77500000) {
        dec!(0.22)
    } else if gross <= dec!(89000000) {
        dec!(0.23)
    } else if gross <= dec!(103000000) {
        dec!(0.24)
    } else if gross <= dec!(125000000) {
        dec!(0.25)
    } else if gross <= dec!(157000000) {
        dec!(0.26)
    } else if gross <= dec!(206000000) {
        dec!(0.27)
    } else if gross <= dec!(337000000) {
        dec!(0.28)
    } else if gross <= dec!(454000000) {
        dec!(0.29)
    } else if gross <= dec!(550000000) {
        dec!(0.30)
    } else if gross <= dec!(695000000) {
        dec!(0.31)
    } else if gross <= dec!(910000000) {
        dec!(0.32)
    } else if gross <= dec!(1400000000) {
        dec!(0.33)
    } else {
        dec!(0.34)
    }
}

// PMK 168/2023 TER B Monthly Rates
fn get_ter_b_rate(gross: Decimal) -> Decimal {
    if gross <= dec!(6200000) {
        dec!(0.0)
    } else if gross <= dec!(6500000) {
        dec!(0.0025)
    } else if gross <= dec!(6850000) {
        dec!(0.005)
    } else if gross <= dec!(7300000) {
        dec!(0.0075)
    } else if gross <= dec!(9200000) {
        dec!(0.01)
    } else if gross <= dec!(10750000) {
        dec!(0.015)
    } else if gross <= dec!(11250000) {
        dec!(0.02)
    } else if gross <= dec!(11600000) {
        dec!(0.025)
    } else if gross <= dec!(12600000) {
        dec!(0.03)
    } else if gross <= dec!(13600000) {
        dec!(0.04)
    } else if gross <= dec!(14950000) {
        dec!(0.05)
    } else if gross <= dec!(16400000) {
        dec!(0.06)
    } else if gross <= dec!(18450000) {
        dec!(0.07)
    } else if gross <= dec!(21850000) {
        dec!(0.08)
    } else if gross <= dec!(26000000) {
        dec!(0.09)
    } else if gross <= dec!(27700000) {
        dec!(0.10)
    } else if gross <= dec!(29300000) {
        dec!(0.11)
    } else if gross <= dec!(31450000) {
        dec!(0.12)
    } else if gross <= dec!(33950000) {
        dec!(0.13)
    } else if gross <= dec!(37100000) {
        dec!(0.14)
    } else if gross <= dec!(41100000) {
        dec!(0.15)
    } else if gross <= dec!(45800000) {
        dec!(0.16)
    } else if gross <= dec!(49500000) {
        dec!(0.17)
    } else if gross <= dec!(53800000) {
        dec!(0.18)
    } else if gross <= dec!(58500000) {
        dec!(0.19)
    } else if gross <= dec!(64000000) {
        dec!(0.20)
    } else if gross <= dec!(71000000) {
        dec!(0.21)
    } else if gross <= dec!(80000000) {
        dec!(0.22)
    } else if gross <= dec!(93000000) {
        dec!(0.23)
    } else if gross <= dec!(109000000) {
        dec!(0.24)
    } else if gross <= dec!(129000000) {
        dec!(0.25)
    } else if gross <= dec!(163000000) {
        dec!(0.26)
    } else if gross <= dec!(211000000) {
        dec!(0.27)
    } else if gross <= dec!(374000000) {
        dec!(0.28)
    } else if gross <= dec!(459000000) {
        dec!(0.29)
    } else if gross <= dec!(555000000) {
        dec!(0.30)
    } else if gross <= dec!(704000000) {
        dec!(0.31)
    } else if gross <= dec!(957000000) {
        dec!(0.32)
    } else if gross <= dec!(1405000000) {
        dec!(0.33)
    } else {
        dec!(0.34)
    }
}

// PMK 168/2023 TER C Monthly Rates
fn get_ter_c_rate(gross: Decimal) -> Decimal {
    if gross <= dec!(6600000) {
        dec!(0.0)
    } else if gross <= dec!(6950000) {
        dec!(0.0025)
    } else if gross <= dec!(7350000) {
        dec!(0.005)
    } else if gross <= dec!(7800000) {
        dec!(0.0075)
    } else if gross <= dec!(8850000) {
        dec!(0.01)
    } else if gross <= dec!(9800000) {
        dec!(0.0125)
    } else if gross <= dec!(10950000) {
        dec!(0.015)
    } else if gross <= dec!(11200000) {
        dec!(0.0175)
    } else if gross <= dec!(12050000) {
        dec!(0.02)
    } else if gross <= dec!(12950000) {
        dec!(0.03)
    } else if gross <= dec!(14150000) {
        dec!(0.04)
    } else if gross <= dec!(15550000) {
        dec!(0.05)
    } else if gross <= dec!(17050000) {
        dec!(0.06)
    } else if gross <= dec!(19500000) {
        dec!(0.07)
    } else if gross <= dec!(22700000) {
        dec!(0.08)
    } else if gross <= dec!(26600000) {
        dec!(0.09)
    } else if gross <= dec!(28100000) {
        dec!(0.10)
    } else if gross <= dec!(30100000) {
        dec!(0.11)
    } else if gross <= dec!(32600000) {
        dec!(0.12)
    } else if gross <= dec!(35400000) {
        dec!(0.13)
    } else if gross <= dec!(38900000) {
        dec!(0.14)
    } else if gross <= dec!(43000000) {
        dec!(0.15)
    } else if gross <= dec!(47400000) {
        dec!(0.16)
    } else if gross <= dec!(51200000) {
        dec!(0.17)
    } else if gross <= dec!(55800000) {
        dec!(0.18)
    } else if gross <= dec!(60400000) {
        dec!(0.19)
    } else if gross <= dec!(66700000) {
        dec!(0.20)
    } else if gross <= dec!(74500000) {
        dec!(0.21)
    } else if gross <= dec!(83200000) {
        dec!(0.22)
    } else if gross <= dec!(95600000) {
        dec!(0.23)
    } else if gross <= dec!(110000000) {
        dec!(0.24)
    } else if gross <= dec!(134000000) {
        dec!(0.25)
    } else if gross <= dec!(169000000) {
        dec!(0.26)
    } else if gross <= dec!(221000000) {
        dec!(0.27)
    } else if gross <= dec!(390000000) {
        dec!(0.28)
    } else if gross <= dec!(463000000) {
        dec!(0.29)
    } else if gross <= dec!(561000000) {
        dec!(0.30)
    } else if gross <= dec!(709000000) {
        dec!(0.31)
    } else if gross <= dec!(965000000) {
        dec!(0.32)
    } else if gross <= dec!(1419000000) {
        dec!(0.33)
    } else {
        dec!(0.34)
    }
}

// BPJS Caps & Deductions
pub struct BpjsCalculation {
    pub jht_employee: Decimal,
    pub jht_company: Decimal,
    pub jp_employee: Decimal,
    pub jp_company: Decimal,
    pub jkk_company: Decimal,
    pub jkm_company: Decimal,
    pub kes_employee: Decimal,
    pub kes_company: Decimal,
    pub total_employee_deduction: Decimal,
    pub total_company_cost: Decimal,
}

pub fn calculate_bpjs(base_salary: Decimal) -> BpjsCalculation {
    // JHT: 2% employee, 3.7% employer
    let jht_employee = (base_salary * dec!(0.02)).round_dp(0);
    let jht_company = (base_salary * dec!(0.037)).round_dp(0);

    // JP: capped at Rp 10.042.300 (standard indexation)
    let jp_cap = dec!(10042300);
    let jp_basis = if base_salary > jp_cap { jp_cap } else { base_salary };
    let jp_employee = (jp_basis * dec!(0.01)).round_dp(0);
    let jp_company = (jp_basis * dec!(0.02)).round_dp(0);

    // JKK: 0.24% employer, JKM: 0.30% employer
    let jkk_company = (base_salary * dec!(0.0024)).round_dp(0);
    let jkm_company = (base_salary * dec!(0.0030)).round_dp(0);

    // BPJS Kesehatan: capped at Rp 12.000.000
    let kes_cap = dec!(12000000);
    let kes_basis = if base_salary > kes_cap { kes_cap } else { base_salary };
    let kes_employee = (kes_basis * dec!(0.01)).round_dp(0);
    let kes_company = (kes_basis * dec!(0.04)).round_dp(0);

    let total_employee_deduction = jht_employee + jp_employee + kes_employee;
    let total_company_cost = jht_company + jp_company + jkk_company + jkm_company + kes_company;

    BpjsCalculation {
        jht_employee,
        jht_company,
        jp_employee,
        jp_company,
        jkk_company,
        jkm_company,
        kes_employee,
        kes_company,
        total_employee_deduction,
        total_company_cost,
    }
}

// PP 35/2021 Overtime hourly calculation
pub fn calculate_overtime_pay(base_salary: Decimal, overtime_hours: Decimal) -> Decimal {
    let hourly_rate = (base_salary / dec!(173)).round_dp(2);
    (hourly_rate * overtime_hours).round_dp(0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ter_categories() {
        assert_eq!(TERCategory::from_ptkp(&PTKPStatus::TK0), TERCategory::A);
        assert_eq!(TERCategory::from_ptkp(&PTKPStatus::K0), TERCategory::A);
        assert_eq!(TERCategory::from_ptkp(&PTKPStatus::K1), TERCategory::B);
        assert_eq!(TERCategory::from_ptkp(&PTKPStatus::K3), TERCategory::C);
    }

    #[test]
    fn test_ter_rates() {
        // Below PTKP (5.4m) should have 0% rate in TER A
        let rate_under = get_ter_rate(TERCategory::A, dec!(5000000));
        assert_eq!(rate_under, dec!(0.0));

        // 10 million in TER A -> 2%
        let rate_10m = get_ter_rate(TERCategory::A, dec!(10000000));
        assert_eq!(rate_10m, dec!(0.02));

        // 15 million in TER A -> 6%
        let rate_15m = get_ter_rate(TERCategory::A, dec!(15000000));
        assert_eq!(rate_15m, dec!(0.06));
    }

    #[test]
    fn test_bpjs_calculation() {
        let calc = calculate_bpjs(dec!(10000000));
        // JHT employee: 2% of 10m = 200,000
        assert_eq!(calc.jht_employee, dec!(200000));
        // JP employee: 1% of 10m = 100,000
        assert_eq!(calc.jp_employee, dec!(100000));
        // BPJS Kes employee: 1% of 10m = 100,000
        assert_eq!(calc.kes_employee, dec!(100000));
        // Total employee deduction = 400,000
        assert_eq!(calc.total_employee_deduction, dec!(400000));
    }

    #[test]
    fn test_overtime_pay() {
        // 10m / 173 * 10 hours
        let ot = calculate_overtime_pay(dec!(10000000), dec!(10));
        assert_eq!(ot, dec!(578035));
    }
}
