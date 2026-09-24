use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AttendanceStatus {
    Present,
    Late,
    EarlyDeparture,
    Absent,
    Leave,
}

impl AttendanceStatus {
    pub fn from_str(s: &str) -> Self {
        match s.to_lowercase().as_str() {
            "present" => Self::Present,
            "late" => Self::Late,
            "early_departure" => Self::EarlyDeparture,
            "absent" => Self::Absent,
            "leave" => Self::Leave,
            _ => Self::Present,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Present => "present",
            Self::Late => "late",
            Self::EarlyDeparture => "early_departure",
            Self::Absent => "absent",
            Self::Leave => "leave",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkSchedule {
    pub id: Uuid,
    pub name: String,
    pub start_time: String,
    pub end_time: String,
    pub late_tolerance_minutes: i32,
    pub is_default: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttendanceLog {
    pub id: Uuid,
    pub employee_id: Uuid,
    pub date: NaiveDate,
    pub schedule_id: Option<Uuid>,
    pub check_in: Option<DateTime<Utc>>,
    pub check_out: Option<DateTime<Utc>>,
    pub status: AttendanceStatus,
    pub late_duration_minutes: i32,
    pub overtime_minutes: i32,
    pub check_in_ip: Option<String>,
    pub check_in_latitude: Option<Decimal>,
    pub check_in_longitude: Option<Decimal>,
    pub check_out_ip: Option<String>,
    pub check_out_latitude: Option<Decimal>,
    pub check_out_longitude: Option<Decimal>,
    pub notes: Option<String>,
    pub auto_closed: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttendanceLogWithEmployee {
    pub id: Uuid,
    pub employee_id: Uuid,
    pub employee_name: String,
    pub employee_code: String,
    pub department: String,
    pub date: NaiveDate,
    pub schedule_id: Option<Uuid>,
    pub check_in: Option<DateTime<Utc>>,
    pub check_out: Option<DateTime<Utc>>,
    pub status: AttendanceStatus,
    pub late_duration_minutes: i32,
    pub overtime_minutes: i32,
    pub notes: Option<String>,
    pub auto_closed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttendanceSummaryStats {
    pub date: NaiveDate,
    pub present_count: u64,
    pub late_count: u64,
    pub absent_count: u64,
    pub leave_count: u64,
    pub total_active_employees: u64,
    pub present_rate: String,
    pub total_overtime_hours: String,
}
