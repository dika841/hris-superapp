use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LeaveStatus {
    Pending,
    Approved,
    Rejected,
    Cancelled,
}

impl LeaveStatus {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "pending" => Self::Pending,
            "approved" => Self::Approved,
            "rejected" => Self::Rejected,
            "cancelled" => Self::Cancelled,
            _ => Self::Pending,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Approved => "approved",
            Self::Rejected => "rejected",
            Self::Cancelled => "cancelled",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaveType {
    pub id: Uuid,
    pub code: String,
    pub name: String,
    pub default_days_per_year: i32,
    pub is_paid: bool,
    pub requires_attachment: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaveBalance {
    pub id: Uuid,
    pub employee_id: Uuid,
    pub leave_type_id: Uuid,
    pub year: i32,
    pub allocated_days: i32,
    pub used_days: i32,
    pub pending_days: i32,
    pub remaining_days: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaveBalanceWithType {
    pub id: Uuid,
    pub employee_id: Uuid,
    pub leave_type_id: Uuid,
    pub leave_type_code: String,
    pub leave_type_name: String,
    pub year: i32,
    pub allocated_days: i32,
    pub used_days: i32,
    pub pending_days: i32,
    pub remaining_days: i32,
    pub is_paid: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaveRequest {
    pub id: Uuid,
    pub employee_id: Uuid,
    pub leave_type_id: Uuid,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub total_days: i32,
    pub reason: String,
    pub attachment_url: Option<String>,
    pub status: LeaveStatus,
    pub approved_by: Option<Uuid>,
    pub approval_notes: Option<String>,
    pub approved_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaveRequestWithDetails {
    pub id: Uuid,
    pub employee_id: Uuid,
    pub employee_name: String,
    pub employee_code: String,
    pub department: String,
    pub leave_type_id: Uuid,
    pub leave_type_code: String,
    pub leave_type_name: String,
    pub start_date: NaiveDate,
    pub end_date: NaiveDate,
    pub total_days: i32,
    pub reason: String,
    pub attachment_url: Option<String>,
    pub status: LeaveStatus,
    pub approved_by: Option<Uuid>,
    pub approval_notes: Option<String>,
    pub approved_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeaveSummaryStats {
    pub pending_count: u64,
    pub approved_this_month: u64,
    pub employees_on_leave_today: u64,
}
