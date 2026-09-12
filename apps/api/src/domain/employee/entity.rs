use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum PTKPStatus {
    TK0,
    TK1,
    TK2,
    TK3,
    K0,
    K1,
    K2,
    K3,
}

impl PTKPStatus {
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_uppercase().as_str() {
            "TK/0" | "TK0" => Some(Self::TK0),
            "TK/1" | "TK1" => Some(Self::TK1),
            "TK/2" | "TK2" => Some(Self::TK2),
            "TK/3" | "TK3" => Some(Self::TK3),
            "K/0" | "K0" => Some(Self::K0),
            "K/1" | "K1" => Some(Self::K1),
            "K/2" | "K2" => Some(Self::K2),
            "K/3" | "K3" => Some(Self::K3),
            _ => None,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::TK0 => "TK/0",
            Self::TK1 => "TK/1",
            Self::TK2 => "TK/2",
            Self::TK3 => "TK/3",
            Self::K0 => "K/0",
            Self::K1 => "K/1",
            Self::K2 => "K/2",
            Self::K3 => "K/3",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum EmploymentStatus {
    Permanent,
    Contract,
    Probation,
    Intern,
}

impl EmploymentStatus {
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "permanent" | "tetap" => Some(Self::Permanent),
            "contract" | "kontrak" => Some(Self::Contract),
            "probation" | "percobaan" => Some(Self::Probation),
            "intern" | "magang" => Some(Self::Intern),
            _ => None,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Permanent => "permanent",
            Self::Contract => "contract",
            Self::Probation => "probation",
            Self::Intern => "intern",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Employee {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub employee_code: String,
    pub full_name: String,
    pub national_id: String, // NIK (masked in presentation)
    pub npwp: Option<String>,
    pub department: String,
    pub position: String,
    pub employment_status: EmploymentStatus,
    pub join_date: NaiveDate,
    pub basic_salary: Decimal,
    pub allowance_fixed: Decimal,
    pub ptkp_status: PTKPStatus,
    pub bank_name: Option<String>,
    pub bank_account: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct NewEmployee {
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub employee_code: String,
    pub full_name: String,
    pub national_id: String,
    pub npwp: Option<String>,
    pub department: String,
    pub position: String,
    pub employment_status: EmploymentStatus,
    pub join_date: NaiveDate,
    pub basic_salary: Decimal,
    pub allowance_fixed: Decimal,
    pub ptkp_status: PTKPStatus,
    pub bank_name: Option<String>,
    pub bank_account: Option<String>,
}

#[derive(Debug, Clone, Default)]
pub struct EmployeePatch {
    pub full_name: Option<String>,
    pub npwp: Option<String>,
    pub department: Option<String>,
    pub position: Option<String>,
    pub employment_status: Option<EmploymentStatus>,
    pub basic_salary: Option<Decimal>,
    pub allowance_fixed: Option<Decimal>,
    pub ptkp_status: Option<PTKPStatus>,
    pub bank_name: Option<String>,
    pub bank_account: Option<String>,
    pub is_active: Option<bool>,
}
