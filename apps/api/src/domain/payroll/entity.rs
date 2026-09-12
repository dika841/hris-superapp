use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;


#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaxMethod {
    Gross,
    Nett,
    GrossUp,
}

impl TaxMethod {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "nett" => Self::Nett,
            "grossup" | "gross_up" => Self::GrossUp,
            _ => Self::Gross,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Gross => "gross",
            Self::Nett => "nett",
            Self::GrossUp => "gross_up",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PayrollRecord {
    pub id: Uuid,
    pub employee_id: Uuid,
    pub period_month: i32,
    pub period_year: i32,
    pub basic_salary: Decimal,
    pub allowance_fixed: Decimal,
    pub overtime_hours: Decimal,
    pub overtime_pay: Decimal,
    pub bonus: Decimal,
    pub gross_salary: Decimal,
    pub ter_category: String,
    pub ter_rate: Decimal,
    pub pph21_amount: Decimal,
    pub bpjs_jht_employee: Decimal,
    pub bpjs_jp_employee: Decimal,
    pub bpjs_kes_employee: Decimal,
    pub total_deductions: Decimal,
    pub take_home_pay: Decimal,
    pub is_paid: bool,
    pub paid_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct NewPayrollRecord {
    pub id: Uuid,
    pub employee_id: Uuid,
    pub period_month: i32,
    pub period_year: i32,
    pub basic_salary: Decimal,
    pub allowance_fixed: Decimal,
    pub overtime_hours: Decimal,
    pub overtime_pay: Decimal,
    pub bonus: Decimal,
    pub gross_salary: Decimal,
    pub ter_category: String,
    pub ter_rate: Decimal,
    pub pph21_amount: Decimal,
    pub bpjs_jht_employee: Decimal,
    pub bpjs_jp_employee: Decimal,
    pub bpjs_kes_employee: Decimal,
    pub total_deductions: Decimal,
    pub take_home_pay: Decimal,
}
